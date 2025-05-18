import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER || 'pankajhadole4@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Helper function to format date for email
function formatDateTime(dateTime: string | Date) {
  return new Date(dateTime).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// API route handler for sending reminders
export async function GET(req: Request) {
  try {
    // Verify cron secret if needed
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Calculate the time range for appointments (23-25 hours from now)
    const now = new Date();
    const twentyThreeHoursFromNow = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const twentyFiveHoursFromNow = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // Fetch appointments that need reminders
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        clients (
          id,
          full_name,
          email
        )
      `)
      .gte('start_time', twentyThreeHoursFromNow.toISOString())
      .lte('start_time', twentyFiveHoursFromNow.toISOString())
      .eq('reminder_sent', false)
      .eq('status', 'scheduled');

    if (error) {
      console.error('Error fetching appointments:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    const results = [];

    // Send reminders for each appointment
    for (const appointment of appointments || []) {
      if (!appointment.clients?.email) continue;

      const emailBody = `
        <h2>Appointment Reminder</h2>
        <p>Dear ${appointment.clients.full_name},</p>
        <p>This is a friendly reminder about your upcoming appointment scheduled for <strong>${formatDateTime(appointment.start_time)}</strong>.</p>
        <p>We look forward to seeing you!</p>
        <p>Thank you for choosing our salon.</p>
      `;

      try {
        await transporter.sendMail({
          from: `"Salon" <${process.env.GMAIL_USER || 'pankajhadole4@gmail.com'}>`,
          to: appointment.clients.email,
          subject: 'Appointment Reminder',
          html: emailBody,
        });

        // Update the appointment to mark reminder as sent
        const { error: updateError } = await supabase
          .from('appointments')
          .update({ reminder_sent: true })
          .eq('id', appointment.id);

        if (updateError) {
          console.error('Error updating appointment reminder status:', updateError);
          results.push({
            appointmentId: appointment.id,
            clientName: appointment.clients.full_name,
            status: 'failed to update reminder status',
          });
        } else {
          results.push({
            appointmentId: appointment.id,
            clientName: appointment.clients.full_name,
            status: 'reminder sent',
          });
        }
      } catch (emailError) {
        console.error('Error sending reminder email:', emailError);
        results.push({
          appointmentId: appointment.id,
          clientName: appointment.clients.full_name,
          status: 'failed to send reminder',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} reminders`,
      results,
    });
  } catch (error) {
    console.error('Error processing reminders:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
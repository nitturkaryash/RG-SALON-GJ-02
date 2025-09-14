import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAppointmentEmail } from '@/utils/emailService';
import { sendWhatsAppMessage } from '@/utils/whatsappService';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function isAuthorized(req: Request): boolean {
  const expected = process.env.CRON_SECRET || process.env.INTERNAL_API_KEY;
  const auth = req.headers.get('authorization') || '';
  return Boolean(expected) && auth === `Bearer ${expected}`;
}

export async function GET(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const results: Array<{
      appointmentId: string;
      clientName: string;
      status: string;
      notifications: {
        email: boolean;
        whatsapp: boolean;
      };
    }> = [];

    // Get appointments that need reminders
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(
        `
        id,
        start_time,
        services,
        stylists,
        total_amount,
        clients (
          id,
          full_name,
          email,
          phone
        )
      `
      )
      .eq('status', 'scheduled')
      .eq('reminder_sent', false)
      .gte(
        'start_time',
        new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString()
      ) // Within next 24 hours
      .lte(
        'start_time',
        new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString()
      ); // But not more than 25 hours away

    if (error) {
      console.error('Error fetching appointments:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    // Send reminders for each appointment
    for (const appointment of appointments || []) {
      if (!appointment.clients?.email && !appointment.clients?.phone) continue;

      const notificationResults = {
        email: false,
        whatsapp: false,
      };

      // Send email reminder
      if (appointment.clients.email) {
        try {
          notificationResults.email = await sendAppointmentEmail(
            appointment.clients.email,
            appointment.clients.full_name,
            appointment.start_time,
            'reminder',
            appointment.services || [],
            appointment.stylists || [],
            appointment.total_amount || 0
          );
        } catch (emailError) {
          console.error('Error sending reminder email:', emailError);
        }
      }

      // Send WhatsApp reminder
      if (appointment.clients.phone) {
        try {
          notificationResults.whatsapp = await sendWhatsAppMessage(
            appointment.clients.phone,
            appointment.clients.full_name,
            appointment.start_time,
            'reminder',
            appointment.services || [],
            appointment.stylists || [],
            appointment.total_amount || 0
          );
        } catch (whatsappError) {
          console.error('Error sending WhatsApp reminder:', whatsappError);
        }
      }

      // If either notification was successful, mark reminder as sent
      if (notificationResults.email || notificationResults.whatsapp) {
        const { error: updateError } = await supabase
          .from('appointments')
          .update({ reminder_sent: true })
          .eq('id', appointment.id);

        if (updateError) {
          console.error(
            'Error updating appointment reminder status:',
            updateError
          );
          results.push({
            appointmentId: appointment.id,
            clientName: appointment.clients.full_name,
            status: 'failed to update reminder status',
            notifications: notificationResults,
          });
        } else {
          results.push({
            appointmentId: appointment.id,
            clientName: appointment.clients.full_name,
            status: 'reminder sent',
            notifications: notificationResults,
          });
        }
      } else {
        results.push({
          appointmentId: appointment.id,
          clientName: appointment.clients.full_name,
          status: 'failed to send reminders',
          notifications: notificationResults,
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

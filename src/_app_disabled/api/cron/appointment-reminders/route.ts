import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAppointmentReminder } from '@/utils/whatsapp';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to format date for display
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

// API route handler for sending automatic reminders
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

    const now = new Date();
    const results = [];

    // ===== 24-HOUR REMINDERS =====
    console.log('Processing 24-hour reminders...');
    
    // Calculate time range for 24-hour reminders (23-25 hours from now)
    const twentyThreeHoursFromNow = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const twentyFiveHoursFromNow = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // Fetch appointments that need 24-hour reminders
    const { data: appointments24h, error: error24h } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        end_time,
        notes,
        clients (
          id,
          full_name,
          phone
        ),
        appointment_services (
          services (
            id,
            name,
            duration,
            price
          )
        ),
        appointment_stylists (
          stylists (
            id,
            name
          )
        )
      `)
      .gte('start_time', twentyThreeHoursFromNow.toISOString())
      .lte('start_time', twentyFiveHoursFromNow.toISOString())
      .eq('reminder_24h_sent', false)
      .eq('status', 'scheduled');

    if (error24h) {
      console.error('Error fetching 24-hour appointments:', error24h);
    } else {
      // Send 24-hour reminders
      for (const appointment of appointments24h || []) {
        if (!appointment.clients?.phone) {
          console.log(`Skipping 24h reminder for appointment ${appointment.id}: No phone number`);
          continue;
        }

        try {
          // Prepare notification data
          const services = appointment.appointment_services?.map((as: any) => as.services.name) || [];
          const stylists = appointment.appointment_stylists?.map((ast: any) => ast.stylists.name) || [];

          const notificationData = {
            clientName: appointment.clients.full_name,
            clientPhone: appointment.clients.phone,
            services,
            stylists,
            startTime: appointment.start_time,
            endTime: appointment.end_time,
            status: 'scheduled',
            notes: appointment.notes || ''
          };

          // Send WhatsApp 24-hour reminder
          await sendAppointmentReminder(notificationData, '24h');
          console.log(`24h reminder sent to ${appointment.clients.full_name}`);

          // Mark 24-hour reminder as sent
          const { error: updateError } = await supabase
            .from('appointments')
            .update({ reminder_24h_sent: true })
            .eq('id', appointment.id);

          if (updateError) {
            console.error('Error updating 24h reminder status:', updateError);
            results.push({
              appointmentId: appointment.id,
              clientName: appointment.clients.full_name,
              type: '24-hour',
              status: 'failed to update reminder status',
            });
          } else {
            results.push({
              appointmentId: appointment.id,
              clientName: appointment.clients.full_name,
              type: '24-hour',
              status: 'reminder sent successfully',
            });
          }
        } catch (whatsappError) {
          console.error('Error sending 24h WhatsApp reminder:', whatsappError);
          results.push({
            appointmentId: appointment.id,
            clientName: appointment.clients.full_name,
            type: '24-hour',
            status: 'failed to send reminder',
          });
        }
      }
    }

    // ===== 2-HOUR REMINDERS =====
    console.log('Processing 2-hour reminders...');
    
    // Calculate time range for 2-hour reminders (1.5-2.5 hours from now)
    const oneAndHalfHoursFromNow = new Date(now.getTime() + 1.5 * 60 * 60 * 1000);
    const twoAndHalfHoursFromNow = new Date(now.getTime() + 2.5 * 60 * 60 * 1000);

    // Fetch appointments that need 2-hour reminders
    const { data: appointments2h, error: error2h } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        end_time,
        notes,
        clients (
          id,
          full_name,
          phone
        ),
        appointment_services (
          services (
            id,
            name,
            duration,
            price
          )
        ),
        appointment_stylists (
          stylists (
            id,
            name
          )
        )
      `)
      .gte('start_time', oneAndHalfHoursFromNow.toISOString())
      .lte('start_time', twoAndHalfHoursFromNow.toISOString())
      .eq('reminder_2h_sent', false)
      .eq('status', 'scheduled');

    if (error2h) {
      console.error('Error fetching 2-hour appointments:', error2h);
    } else {
      // Send 2-hour reminders
      for (const appointment of appointments2h || []) {
        if (!appointment.clients?.phone) {
          console.log(`Skipping 2h reminder for appointment ${appointment.id}: No phone number`);
          continue;
        }

        try {
          // Prepare notification data for 2-hour reminder
          const services = appointment.appointment_services?.map((as: any) => as.services.name) || [];
          const stylists = appointment.appointment_stylists?.map((ast: any) => ast.stylists.name) || [];

          const notificationData = {
            clientName: appointment.clients.full_name,
            clientPhone: appointment.clients.phone,
            services,
            stylists,
            startTime: appointment.start_time,
            endTime: appointment.end_time,
            status: 'scheduled',
            notes: appointment.notes || ''
          };

          // Send WhatsApp 2-hour reminder
          await sendAppointmentReminder(notificationData, '2h');
          console.log(`2h reminder sent to ${appointment.clients.full_name}`);

          // Mark 2-hour reminder as sent
          const { error: updateError } = await supabase
            .from('appointments')
            .update({ reminder_2h_sent: true })
            .eq('id', appointment.id);

          if (updateError) {
            console.error('Error updating 2h reminder status:', updateError);
            results.push({
              appointmentId: appointment.id,
              clientName: appointment.clients.full_name,
              type: '2-hour',
              status: 'failed to update reminder status',
            });
          } else {
            results.push({
              appointmentId: appointment.id,
              clientName: appointment.clients.full_name,
              type: '2-hour',
              status: 'reminder sent successfully',
            });
          }
        } catch (whatsappError) {
          console.error('Error sending 2h WhatsApp reminder:', whatsappError);
          results.push({
            appointmentId: appointment.id,
            clientName: appointment.clients.full_name,
            type: '2-hour',
            status: 'failed to send reminder',
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} reminders`,
      summary: {
        total: results.length,
        '24h_reminders': results.filter(r => r.type === '24-hour').length,
        '2h_reminders': results.filter(r => r.type === '2-hour').length,
        successful: results.filter(r => r.status === 'reminder sent successfully').length,
        failed: results.filter(r => r.status.includes('failed')).length
      },
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

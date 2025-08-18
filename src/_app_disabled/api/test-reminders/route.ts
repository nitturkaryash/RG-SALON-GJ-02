import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAppointmentReminder } from '@/utils/whatsapp';

// Supabase configuration (service role required on server)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('🔧 Test Reminders API using NEW Supabase credentials');
console.log('📡 URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

function isAuthorized(req: Request): boolean {
  const expected = process.env.INTERNAL_API_KEY;
  const auth = req.headers.get('authorization') || '';
  return Boolean(expected) && auth === `Bearer ${expected}`;
}

// Test API route for manually triggering reminders
export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { appointmentId, reminderType = '24h' } = await req.json();

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, error: 'Missing appointmentId' },
        { status: 400 }
      );
    }

    // Fetch the specific appointment
    const { data: appointment, error } = await supabase
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
      .eq('id', appointmentId)
      .single();

    if (error || !appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (!appointment.clients?.phone) {
      return NextResponse.json(
        { success: false, error: 'No phone number found for client' },
        { status: 400 }
      );
    }

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

    // Send test reminder
    const result = await sendAppointmentReminder(notificationData, reminderType as '24h' | '2h');

    return NextResponse.json({
      success: true,
      message: `${reminderType} reminder sent successfully`,
      appointmentId,
      clientName: appointment.clients.full_name,
      clientPhone: appointment.clients.phone,
      reminderType,
      result
    });

  } catch (error) {
    console.error('Error sending test reminder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send reminder', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to list upcoming appointments for testing
export async function GET(req: Request) {
  try {
    const now = new Date();
    const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Fetch upcoming appointments
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        end_time,
        status,
        reminder_24h_sent,
        reminder_2h_sent,
        clients (
          id,
          full_name,
          phone
        ),
        appointment_services (
          services (
            name
          )
        ),
        appointment_stylists (
          stylists (
            name
          )
        )
      `)
      .gte('start_time', now.toISOString())
      .lte('start_time', next48Hours.toISOString())
      .eq('status', 'scheduled')
      .order('start_time', { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    const formattedAppointments = appointments?.map(appointment => ({
      id: appointment.id,
      clientName: appointment.clients?.full_name || 'Unknown',
      phone: appointment.clients?.phone || 'No phone',
      startTime: appointment.start_time,
      services: appointment.appointment_services?.map((as: any) => as.services.name).join(', ') || 'No services',
      stylists: appointment.appointment_stylists?.map((ast: any) => ast.stylists.name).join(', ') || 'No stylists',
      reminder24hSent: appointment.reminder_24h_sent,
      reminder2hSent: appointment.reminder_2h_sent,
      hoursUntilAppointment: Math.round((new Date(appointment.start_time).getTime() - now.getTime()) / (1000 * 60 * 60))
    })) || [];

    return NextResponse.json({
      success: true,
      message: `Found ${formattedAppointments.length} upcoming appointments`,
      appointments: formattedAppointments
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 

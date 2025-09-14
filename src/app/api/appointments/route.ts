import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAppointmentEmail } from '@/utils/emailService';
import {
  WhatsAppAutomation,
  AppointmentData,
} from '@/whatsapp/business-api/utils/whatsappAutomation';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function isAuthorized(req: Request): boolean {
  const expected = process.env.INTERNAL_API_KEY;
  const auth = req.headers.get('authorization') || '';
  return Boolean(expected) && auth === `Bearer ${expected}`;
}

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

// GET - Fetch appointments
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('client_id');
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    let query = supabase
      .from('appointments')
      .select(
        `
        *,
        clients (
          id,
          full_name,
          phone,
          email
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
      `
      )
      .order('start_time', { ascending: true });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query = query
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString());
    }

    const { data: appointments, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST - Create or update appointment with auto WhatsApp message
export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const body = await req.json();
    const {
      id,
      client,
      start_time,
      end_time,
      services,
      stylists,
      status,
      total_amount,
      notes,
    } = body;

    if (!client || !start_time || !status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: client, start_time, status',
        },
        { status: 400 }
      );
    }

    let appointment;
    let isUpdate = false;
    let oldAppointmentData = null;

    if (id) {
      // Update existing appointment
      isUpdate = true;

      // Get existing appointment for comparison
      const { data: existingAppointment, error: fetchError } = await supabase
        .from('appointments')
        .select(
          `
          *,
          clients (
            id,
            full_name,
            phone,
            email
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
        `
        )
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      oldAppointmentData = existingAppointment;

      // Update appointment
      const { data: updatedAppointment, error: updateError } = await supabase
        .from('appointments')
        .update({
          start_time,
          end_time,
          status,
          notes,
          total_amount,
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      appointment = updatedAppointment;
    } else {
      // Create new appointment
      const appointmentId = uuidv4();

      const { data: newAppointment, error: createError } = await supabase
        .from('appointments')
        .insert({
          id: appointmentId,
          client_id: client.id,
          start_time,
          end_time,
          status,
          notes,
          total_amount: total_amount || 0,
        })
        .select()
        .single();

      if (createError) throw createError;
      appointment = newAppointment;

      // Add services if provided
      if (services && services.length > 0) {
        const appointmentServices = services.map((service: any) => ({
          appointment_id: appointmentId,
          service_id: service.id || service.service_id,
        }));

        const { error: servicesError } = await supabase
          .from('appointment_services')
          .insert(appointmentServices);

        if (servicesError) throw servicesError;
      }

      // Add stylists if provided
      if (stylists && stylists.length > 0) {
        const appointmentStylists = stylists.map((stylist: any) => ({
          appointment_id: appointmentId,
          stylist_id: stylist.id || stylist.stylist_id,
        }));

        const { error: stylistsError } = await supabase
          .from('appointment_stylists')
          .insert(appointmentStylists);

        if (stylistsError) throw stylistsError;
      }
    }

    const notificationResults = {
      email: false,
      whatsapp: false,
    };

    // Send email notification if client has email
    if (client.email) {
      console.log('Preparing to send email to:', client.email);

      try {
        notificationResults.email = await sendAppointmentEmail(
          client.email,
          client.full_name,
          start_time,
          status === 'scheduled' ? 'booked' : status,
          services || [],
          stylists || [],
          total_amount || 0
        );
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    }

    // Send automatic WhatsApp message using new automation system
    if (client.phone) {
      console.log('Preparing to send WhatsApp message to:', client.phone);

      try {
        const appointmentData: AppointmentData = {
          id: appointment.id,
          client_name: client.full_name,
          client_phone: client.phone,
          start_time,
          services: services || [],
          stylist:
            stylists && stylists.length > 0 ? stylists[0].name : 'Salon Team',
          status,
          total_amount: total_amount || 0,
        };

        if (isUpdate) {
          if (status === 'cancelled') {
            notificationResults.whatsapp =
              await WhatsAppAutomation.handleAppointmentCancelled(
                appointmentData
              );
          } else {
            const oldData = oldAppointmentData
              ? {
                  start_time: oldAppointmentData.start_time,
                  status: oldAppointmentData.status,
                }
              : {};
            notificationResults.whatsapp =
              await WhatsAppAutomation.handleAppointmentUpdated(
                appointmentData,
                oldData
              );
          }
        } else {
          notificationResults.whatsapp =
            await WhatsAppAutomation.handleAppointmentCreated(appointmentData);
        }

        console.log('WhatsApp message sent successfully');
      } catch (whatsappError) {
        console.error('Error sending WhatsApp message:', whatsappError);
      }
    }

    return NextResponse.json({
      success: true,
      message: isUpdate
        ? 'Appointment updated successfully'
        : 'Appointment created successfully',
      appointment,
      notifications: notificationResults,
    });
  } catch (error) {
    console.error('Error in appointment operation:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update appointment status or details
export async function PUT(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Get existing appointment for comparison
    const { data: existingAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select(
        `
        *,
        clients (
          id,
          full_name,
          phone,
          email
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
      `
      )
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Update the appointment
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Send automatic WhatsApp message
    let whatsappSent = false;
    if (existingAppointment.clients?.phone) {
      try {
        const appointmentData: AppointmentData = {
          id: updatedAppointment.id,
          client_name: existingAppointment.clients.full_name,
          client_phone: existingAppointment.clients.phone,
          start_time: updatedAppointment.start_time,
          services:
            existingAppointment.appointment_services?.map(
              (as: any) => as.services
            ) || [],
          stylist:
            existingAppointment.appointment_stylists?.length > 0
              ? existingAppointment.appointment_stylists[0].stylists.name
              : 'Salon Team',
          status: updatedAppointment.status,
          total_amount: updatedAppointment.total_amount || 0,
        };

        if (updatedAppointment.status === 'cancelled') {
          whatsappSent =
            await WhatsAppAutomation.handleAppointmentCancelled(
              appointmentData
            );
        } else {
          const oldData = {
            start_time: existingAppointment.start_time,
            status: existingAppointment.status,
          };
          whatsappSent = await WhatsAppAutomation.handleAppointmentUpdated(
            appointmentData,
            oldData
          );
        }
      } catch (whatsappError) {
        console.error('WhatsApp automation error:', whatsappError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: updatedAppointment,
      whatsapp_sent: whatsappSent,
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel/delete appointment with auto WhatsApp message
export async function DELETE(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const reason = searchParams.get('reason') || 'Appointment cancelled';

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Get existing appointment for WhatsApp notification
    const { data: existingAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select(
        `
        *,
        clients (
          id,
          full_name,
          phone,
          email
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
      `
      )
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete appointment services and stylists first
    await supabase
      .from('appointment_services')
      .delete()
      .eq('appointment_id', id);
    await supabase
      .from('appointment_stylists')
      .delete()
      .eq('appointment_id', id);

    // Delete the appointment
    const { error: deleteError } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Send automatic WhatsApp message
    let whatsappSent = false;
    if (existingAppointment.clients?.phone) {
      try {
        const appointmentData: AppointmentData = {
          id: existingAppointment.id,
          client_name: existingAppointment.clients.full_name,
          client_phone: existingAppointment.clients.phone,
          start_time: existingAppointment.start_time,
          services:
            existingAppointment.appointment_services?.map(
              (as: any) => as.services
            ) || [],
          stylist:
            existingAppointment.appointment_stylists?.length > 0
              ? existingAppointment.appointment_stylists[0].stylists.name
              : 'Salon Team',
          status: 'cancelled',
          total_amount: existingAppointment.total_amount || 0,
        };

        whatsappSent =
          await WhatsAppAutomation.handleAppointmentCancelled(appointmentData);
      } catch (whatsappError) {
        console.error('WhatsApp automation error:', whatsappError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully',
      whatsapp_sent: whatsappSent,
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}

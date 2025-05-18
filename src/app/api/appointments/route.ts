import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAppointmentEmail } from '@/utils/emailService';
import { sendWhatsAppMessage } from '@/utils/whatsappService';

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

export async function POST(req: Request) {
  try {
    const { client, start_time, services, stylists, status, total_amount } = await req.json();

    if (!client || !start_time || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const notificationResults = {
      email: false,
      whatsapp: false
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
    } else {
      console.log('No email address found for client');
    }

    // Send WhatsApp notification if client has phone number
    if (client.phone) {
      console.log('Preparing to send WhatsApp message to:', client.phone);
      
      try {
        notificationResults.whatsapp = await sendWhatsAppMessage(
          client.phone,
          client.full_name,
          start_time,
          status === 'scheduled' ? 'booked' : status,
          services || [],
          stylists || [],
          total_amount || 0
        );
        console.log('WhatsApp message sent successfully');
      } catch (whatsappError) {
        console.error('Error sending WhatsApp message:', whatsappError);
      }
    } else {
      console.log('No phone number found for client');
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment updated successfully',
      notifications: notificationResults
    });
  } catch (error) {
    console.error('Error in appointment status update:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
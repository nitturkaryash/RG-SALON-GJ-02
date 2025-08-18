import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER || 'pankajhadole4@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  debug: true, // Enable debug output
  logger: true // Enable logger
});

// Verify SMTP connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP Connection Error:', error);
    console.error('Gmail User:', process.env.GMAIL_USER);
    console.error('App Password Set:', !!process.env.GMAIL_APP_PASSWORD);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
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

// Helper function to send appointment notification
async function sendAppointmentNotification(
  to: string,
  clientName: string,
  action: 'booked' | 'updated' | 'cancelled',
  appointmentTime?: string | Date
) {
  const subject = `Your Appointment has been ${action}`;
  let body = '';

  switch (action) {
    case 'booked':
      body = `
        <h2>Appointment Confirmation</h2>
        <p>Dear ${clientName},</p>
        <p>Your appointment has been successfully booked for <strong>${formatDateTime(appointmentTime!)}</strong>.</p>
        <p>We look forward to seeing you!</p>
        <p>Thank you for choosing our salon.</p>
      `;
      break;
    case 'updated':
      body = `
        <h2>Appointment Update</h2>
        <p>Dear ${clientName},</p>
        <p>Your appointment has been updated.</p>
        <p>New appointment time: <strong>${formatDateTime(appointmentTime!)}</strong></p>
        <p>We look forward to seeing you!</p>
        <p>Thank you for choosing our salon.</p>
      `;
      break;
    case 'cancelled':
      body = `
        <h2>Appointment Cancellation</h2>
        <p>Dear ${clientName},</p>
        <p>Your appointment has been cancelled as requested.</p>
        <p>We hope to see you again soon!</p>
        <p>Thank you for choosing our salon.</p>
      `;
      break;
  }

  try {
    const mailOptions = {
      from: `"Salon" <${process.env.GMAIL_USER || 'pankajhadole4@gmail.com'}>`,
      to,
      subject,
      html: body,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending appointment notification:', error);
    return false;
  }
}

// Helper function to send appointment reminder
async function sendAppointmentReminder(
  to: string,
  clientName: string,
  appointmentTime: string | Date
) {
  const subject = 'Appointment Reminder';
  const body = `
    <h2>Appointment Reminder</h2>
    <p>Dear ${clientName},</p>
    <p>This is a friendly reminder about your upcoming appointment scheduled for <strong>${formatDateTime(appointmentTime)}</strong>.</p>
    <p>We look forward to seeing you!</p>
    <p>Thank you for choosing our salon.</p>
  `;

  try {
    const mailOptions = {
      from: `"Salon" <${process.env.GMAIL_USER || 'pankajhadole4@gmail.com'}>`,
      to,
      subject,
      html: body,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending appointment reminder:', error);
    return false;
  }
}

// API route handler for appointment notifications
export async function POST(req: Request) {
  try {
    console.log('Received email notification request');
    const body = await req.json();
    console.log('Request body:', { ...body, to: '***@***.com' }); // Log sanitized email

    const { type, to, clientName, action, appointmentTime } = body;

    if (!to || !clientName || !type) {
      console.error('Missing required fields:', { type, clientName, hasEmail: !!to });
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let success = false;

    if (type === 'notification') {
      if (!action) {
        console.error('Missing action for notification');
        return NextResponse.json(
          { success: false, error: 'Missing action for notification' },
          { status: 400 }
        );
      }
      console.log('Sending appointment notification email');
      success = await sendAppointmentNotification(to, clientName, action, appointmentTime);
    } else if (type === 'reminder') {
      if (!appointmentTime) {
        console.error('Missing appointment time for reminder');
        return NextResponse.json(
          { success: false, error: 'Missing appointment time for reminder' },
          { status: 400 }
        );
      }
      console.log('Sending appointment reminder email');
      success = await sendAppointmentReminder(to, clientName, appointmentTime);
    } else {
      console.error('Invalid notification type:', type);
      return NextResponse.json(
        { success: false, error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    if (success) {
      console.log('Email sent successfully');
      return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } else {
      console.error('Failed to send email');
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in appointment notification API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 

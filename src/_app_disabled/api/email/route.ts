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
});

// Helper function to send email
async function sendEmail(to: string, subject: string, body: string, isHtml = false) {
  try {
    const mailOptions = {
      from: `"Salon" <${process.env.GMAIL_USER || 'pankajhadole4@gmail.com'}>`,
      to,
      subject,
      ...(isHtml ? { html: body } : { text: body }),
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// API route handler for sending emails
export async function POST(req: Request) {
  try {
    const { to, subject, body, html } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const success = await sendEmail(to, subject, body, html);

    if (success) {
      return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in email API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 

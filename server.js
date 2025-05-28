import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import * as WhatsAppModule from './dist/whatsapp/business-api/services/whatsappService.js';

const { WhatsAppService } = WhatsAppModule;

const app = express();
app.use(cors());
app.use(express.json());

// Email configuration
const GMAIL_USER = 'pankajhadole4@gmail.com';
const GMAIL_APP_PASSWORD = 'bnps dtkf drly oqzu';

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD
  }
});

// Helper function to format date for email
function formatDateTime(dateTime) {
  try {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateTime;
  }
}

// Email notification endpoint
app.post('/api/notifications/email', async (req, res) => {
  try {
    const { to, clientName, appointmentTime, type } = req.body;
    console.log('Received email request:', { to, clientName, type, appointmentTime });

    if (!to || !clientName || !appointmentTime || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    let subject = '';
    let body = '';

    switch (type) {
      case 'booked':
        subject = 'Appointment Confirmation';
        body = `
          <h2>Appointment Confirmation</h2>
          <p>Dear ${clientName},</p>
          <p>Your appointment has been successfully booked for <strong>${formatDateTime(appointmentTime)}</strong>.</p>
          <p>We look forward to seeing you!</p>
          <p>Thank you for choosing our salon.</p>
        `;
        break;
      case 'updated':
        subject = 'Appointment Update';
        body = `
          <h2>Appointment Update</h2>
          <p>Dear ${clientName},</p>
          <p>Your appointment has been updated to <strong>${formatDateTime(appointmentTime)}</strong>.</p>
          <p>We look forward to seeing you!</p>
          <p>Thank you for choosing our salon.</p>
        `;
        break;
      case 'cancelled':
        subject = 'Appointment Cancellation';
        body = `
          <h2>Appointment Cancellation</h2>
          <p>Dear ${clientName},</p>
          <p>Your appointment scheduled for <strong>${formatDateTime(appointmentTime)}</strong> has been cancelled.</p>
          <p>We hope to see you again soon!</p>
          <p>Thank you for choosing our salon.</p>
        `;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid notification type'
        });
    }

    const mailOptions = {
      from: `"RG Salon" <${GMAIL_USER}>`,
      to,
      subject,
      html: body,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// WhatsApp appointment notification endpoint (placeholder)
app.post('/api/whatsapp/appointment-notification', async (req, res) => {
  console.log('[Express API CALLED] /api/whatsapp/appointment-notification reached');
  console.log('Request body:', req.body);

  const { type, phoneNumber, clientName, appointmentTime, oldAppointmentTime, services, stylist, totalAmount } = req.body;

  if (!type || !phoneNumber || !clientName || !appointmentTime) {
    return res.status(400).json({ success: false, error: 'Missing required fields for WhatsApp notification (type, phoneNumber, clientName, appointmentTime)' });
  }

  try {
    let response;
    const appointmentDate = new Date(appointmentTime);

    switch (type) {
      case 'booked':
        if (!services || !stylist) {
          return res.status(400).json({ success: false, error: 'Missing services or stylist for booked notification' });
        }
        response = await WhatsAppService.sendAppointmentConfirmation(phoneNumber, clientName, appointmentDate, services, stylist);
        break;
      case 'updated':
        if (!oldAppointmentTime || !services || !stylist || !totalAmount) {
          return res.status(400).json({ success: false, error: 'Missing oldAppointmentTime, services, stylist, or totalAmount for updated notification' });
        }
        const oldDate = new Date(oldAppointmentTime);
        response = await WhatsAppService.sendAppointmentUpdate(phoneNumber, clientName, oldDate, appointmentDate, services, stylist, totalAmount);
        break;
      case 'cancelled':
        response = await WhatsAppService.sendAppointmentCancellation(phoneNumber, clientName, appointmentDate);
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid WhatsApp notification type' });
    }

    console.log('WhatsApp notification sent successfully:', response);
    res.status(200).json({ success: true, message: `WhatsApp ${type} notification sent successfully.`, data: response });
  } catch (error) {
    console.error(`Error sending WhatsApp ${type} notification:`, error.message);
    // Log the full error for more details, especially if it's a custom error from WhatsAppService
    console.error(error); 
    res.status(500).json({ success: false, error: error.message || 'Failed to send WhatsApp notification' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Email server is running' });
});

// Function to find an available port
async function startServer(initialPort) {
  const findAvailablePort = (port) => {
    return new Promise((resolve) => {
      const server = app.listen(port)
        .on('listening', () => {
          server.close(() => resolve(port));
        })
        .on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            resolve(findAvailablePort(port + 1));
          }
        });
    });
  };

  const port = await findAvailablePort(initialPort);
  
  // Verify email configuration before starting server
  try {
    await transporter.verify();
    console.log('SMTP Server is ready to send emails');
  } catch (error) {
    console.error('SMTP Connection Error:', error);
    console.error('Email configuration:', {
      user: GMAIL_USER,
      passwordProvided: !!GMAIL_APP_PASSWORD
    });
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Email server configured with: ${GMAIL_USER}`);
  });
}

// Start server with initial port 3001
startServer(3001); 
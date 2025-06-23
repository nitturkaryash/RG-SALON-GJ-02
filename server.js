import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "https://*.supabase.co", "https://*.supabase.in"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.supabase.co", "https://*.supabase.in", "wss://*.supabase.co", "wss://*.supabase.in"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

app.use(express.json());

// Helper function to format phone number
function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle Indian numbers
  if (cleaned.length === 10) {
    return `91${cleaned}`; // Add India country code
  }
  
  // If already has country code
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned;
  }
  
  // Return as-is for other formats
  return cleaned;
}

// WhatsApp Business API configuration with fallback values
const getWhatsAppConfig = () => ({
  token: process.env.WHATSAPP_ACCESS_TOKEN || 'EAAQjirsfZCZCcBO3vcBGSRYdtVgGbD3J07UkZC9bEsaE2F6xIiWLjP38fSFnY13gdxdSvlkOhFphneOrULcZB4Q8v9yKDW4xKm4FOIxHYSuGs31ebx7XJuUh4FadR8nncvkNJe2rwlfPCzETFdzdEOeuOO8JvzbTug7LWrn6n0OiWTNZCBYmDSjlhnyoOUZBQnmgZDZD',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '649515451575660',
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '593695986423772',
  businessPhone: process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE || '+918956860024',
  version: 'v21.0',
  defaultTargetNumber: process.env.DEFAULT_NOTIFICATION_PHONE || '9021264696'
});

// WhatsApp Business API endpoint
app.post('/api/whatsapp/send-business-message', async (req, res) => {
  try {
    const { to, message, type = 'text', template_name, template_params } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }

    // WhatsApp Business API configuration
    const config = getWhatsAppConfig();

    if (!config.token || !config.phoneNumberId) {
      return res.status(500).json({ 
        error: 'WhatsApp Business API not configured. Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID environment variables.' 
      });
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(to);
    if (!formattedPhone) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Prepare payload based on message type
    let payload = {
      messaging_product: "whatsapp",
      to: formattedPhone
    };

    if (type === 'template' && template_name) {
      // Template message
      payload.type = "template";
      payload.template = {
        name: template_name,
        language: { code: "en" },
        components: template_params ? [
          {
            type: "body",
            parameters: template_params.map(param => ({ type: "text", text: param }))
          }
        ] : []
      };
    } else {
      // Text message
      payload.type = "text";
      payload.text = { body: message };
    }

    // Send to WhatsApp Business API
    const url = `https://graph.facebook.com/${config.version}/${config.phoneNumberId}/messages`;
    
    console.log(`📱 [WhatsApp Business API] Sending ${type} message to ${formattedPhone}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ WhatsApp message sent successfully:', result);
      return res.status(200).json({
        success: true,
        data: result,
        message: 'WhatsApp message sent successfully'
      });
    } else {
      console.error('❌ WhatsApp API error:', result);
      return res.status(response.status).json({
        success: false,
        error: result.error || 'Failed to send WhatsApp message',
        details: result
      });
    }

  } catch (error) {
    console.error('❌ WhatsApp Business API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// WhatsApp appointment notification endpoint (legacy - for backward compatibility)
app.post('/api/whatsapp/appointment-notification', async (req, res) => {
  console.log('[Express API CALLED] /api/whatsapp/appointment-notification reached');
  console.log('Request body:', req.body);

  const { type, phoneNumber, clientName, appointmentTime, oldAppointmentTime, services, stylist, totalAmount } = req.body;

  if (!type || !phoneNumber || !clientName || !appointmentTime) {
    return res.status(400).json({ success: false, error: 'Missing required fields for WhatsApp notification (type, phoneNumber, clientName, appointmentTime)' });
  }

  try {
    console.log('⚠️ Legacy WhatsApp endpoint called. Please use /api/whatsapp/send-business-message instead.');
    res.status(200).json({ 
      success: false, 
      message: 'Legacy endpoint. Please use /api/whatsapp/send-business-message for WhatsApp Business API integration.',
      redirect: '/api/whatsapp/send-business-message'
    });
  } catch (error) {
    console.error(`Error in legacy WhatsApp endpoint:`, error.message);
    res.status(500).json({ success: false, error: error.message || 'Failed to process WhatsApp notification' });
  }
});

// Direct WhatsApp message endpoint (for sending to any phone number)
app.post('/api/whatsapp/send-message', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }

    const config = getWhatsAppConfig();

    if (!config.token || !config.phoneNumberId) {
      return res.status(500).json({ 
        error: 'WhatsApp Business API not configured. Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID environment variables.' 
      });
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phone);
    if (!formattedPhone) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    
    const payload = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "text",
      text: { body: message }
    };

    const url = `https://graph.facebook.com/${config.version}/${config.phoneNumberId}/messages`;
    
    console.log(`📱 [Direct Message] Sending message to ${formattedPhone}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ Direct message sent successfully`);
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Message sent successfully',
        targetNumber: formattedPhone
      });
    } else {
      console.error('❌ WhatsApp API error:', result);
      return res.status(response.status).json({
        success: false,
        error: result.error || 'Failed to send message',
        details: result
      });
    }

  } catch (error) {
    console.error('❌ Direct message error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const config = getWhatsAppConfig();
  
  res.json({ 
    status: 'ok', 
    message: 'RG Salon WhatsApp API server is running',
    configuration: {
      whatsappConfigured: !!(config.token && config.phoneNumberId),
      defaultTargetNumber: config.defaultTargetNumber,
      businessPhone: config.businessPhone,
      apiVersion: config.version
    },
    endpoints: {
      // Main WhatsApp endpoints
      send_business_message: '/api/whatsapp/send-business-message',
      send_message: '/api/whatsapp/send-message',
      send_all_notifications: '/api/whatsapp/send-all-notifications',
      send_single_notification: '/api/whatsapp/send-single-notification',
      send_custom_notification: '/api/whatsapp/send-custom-notification',
      
      // Legacy endpoint
      legacy_whatsapp: '/api/whatsapp/appointment-notification',
      
      // System
      health: '/api/health'
    },
    usage: {
      send_message: 'POST - Send message to any phone number with body: { "phone": "phoneNumber", "message": "text" }',
      send_all_notifications: 'POST - Sends all 6 notification types to 9021264696',
      send_single_notification: 'POST - Send specific notification type (booking, reminder, cancellation, welcome, custom)',
      send_custom_notification: 'POST - Send custom message with body: { "message": "Your message", "notificationType": "Custom" }',
      send_business_message: 'POST - Generic WhatsApp message endpoint with body: { "to": "phone", "message": "text" }'
    }
  });
});

// Specific endpoint for sending all notifications to 9021264696
app.post('/api/whatsapp/send-all-notifications', async (req, res) => {
  try {
    const config = getWhatsAppConfig();
    const targetNumber = config.defaultTargetNumber;
    
    if (!config.token || !config.phoneNumberId) {
      return res.status(500).json({ 
        error: 'WhatsApp Business API not configured. Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID environment variables.' 
      });
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(targetNumber);
    console.log(`📱 [WhatsApp Bulk Notifications] Sending all notifications to ${formattedPhone}`);

    const notifications = [
      {
        type: 'System Test',
        message: `🧪 *WhatsApp Business API Test*

Hello! This is a test message from RG Salon's appointment notification system.

📱 Phone: ${targetNumber}
⏰ Time: ${new Date().toLocaleString('en-IN')}

If you received this message, the WhatsApp Business API integration is working correctly! 🎉

All appointment notifications will be sent using this professional service.

Best regards,
RG Salon Team 💖`
      },
      {
        type: 'Booking Confirmation',
        message: `🎉 *Appointment Confirmed!*

Hello Test Client,

Your appointment at *RG Salon* has been successfully booked!

📅 *Date:* ${new Date(Date.now() + 86400000).toLocaleDateString('en-IN')}
⏰ *Time:* 10:30 AM

💅 *Services:* Hair Cut, Hair Color, Hair Styling
✨ *Stylists:* Sarah, John

💰 *Total Amount:* ₹2,500.00

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Cancel at least 2 hours in advance if needed

Thank you for choosing RG Salon! 💖

For any queries, call us at: ${config.businessPhone}`
      },
      {
        type: 'Update Notification',
        message: `📝 *Appointment Updated!*

Hello Test Client,

Your appointment details at *RG Salon* have been updated.

📅 *Date:* ${new Date(Date.now() + 172800000).toLocaleDateString('en-IN')}
⏰ *Time:* 2:00 PM

💅 *Services:* Hair Cut, Hair Color, Hair Styling
✨ *Stylists:* Sarah, John

💰 *Total Amount:* ₹2,500.00

📊 *Status:* CONFIRMED

We look forward to serving you! 💖

For any queries, call us at: ${config.businessPhone}`
      },
      {
        type: 'Cancellation',
        message: `❌ *Appointment Cancelled*

Hello Test Client,

We regret to inform you that your appointment at *RG Salon* has been cancelled.

📅 *Cancelled Date:* ${new Date(Date.now() + 86400000).toLocaleDateString('en-IN')}
⏰ *Cancelled Time:* 10:30 AM

💅 *Services:* Hair Cut, Hair Color, Hair Styling
✨ *Stylists:* Sarah, John

💰 *Amount:* ₹2,500.00

*We sincerely apologize for any inconvenience caused.*

📞 To reschedule your appointment, please call us at: ${config.businessPhone}

💝 *Special Offer:* Book again within 7 days and get 10% discount!

Thank you for your understanding.

Best regards,
RG Salon Team 💖`
      },
      {
        type: '24h Reminder',
        message: `⏰ *Appointment Reminder*

Hello Test Client,

This is a friendly reminder that you have an appointment at *RG Salon* in 24 hours.

📅 *Date:* ${new Date(Date.now() + 86400000).toLocaleDateString('en-IN')}
⏰ *Time:* 10:30 AM

💅 *Services:* Hair Cut, Hair Color, Hair Styling
✨ *Stylists:* Sarah, John

💰 *Amount:* ₹2,500.00

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Reschedule at least 2 hours in advance if needed

📞 Contact us: ${config.businessPhone}

Thank you for choosing RG Salon! 💖`
      },
      {
        type: '2h Final Reminder',
        message: `🚨 *Final Reminder*

Hello Test Client,

This is a friendly reminder that you have an appointment at *RG Salon* in 2 hours.

📅 *Date:* ${new Date().toLocaleDateString('en-IN')}
⏰ *Time:* ${new Date(Date.now() + 7200000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}

💅 *Services:* Hair Cut, Hair Color, Hair Styling
✨ *Stylists:* Sarah, John

💰 *Amount:* ₹2,500.00

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Reschedule at least 2 hours in advance if needed

🚨 *Final Reminder* - Please confirm your attendance by replying YES

📞 Contact us: ${config.businessPhone}

Thank you for choosing RG Salon! 💖`
      }
    ];

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const notification of notifications) {
      try {
        const payload = {
          messaging_product: "whatsapp",
          to: formattedPhone,
          type: "text",
          text: { body: notification.message }
        };

        const url = `https://graph.facebook.com/${config.version}/${config.phoneNumberId}/messages`;
        
        console.log(`📱 Sending ${notification.type}...`);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
          console.log(`✅ ${notification.type} sent successfully`);
          results.push({
            type: notification.type,
            success: true,
            messageId: result.messages?.[0]?.id,
            data: result
          });
          successCount++;
        } else {
          console.error(`❌ ${notification.type} failed:`, result);
          results.push({
            type: notification.type,
            success: false,
            error: result.error || 'Unknown error',
            data: result
          });
          failureCount++;
        }

        // Wait 3 seconds between messages to avoid rate limiting
        if (notifications.indexOf(notification) < notifications.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`❌ ${notification.type} exception:`, error);
        results.push({
          type: notification.type,
          success: false,
          error: error.message,
          data: null
        });
        failureCount++;
      }
    }

    return res.status(200).json({
      success: successCount > 0,
      message: `Sent ${successCount}/${notifications.length} notifications successfully`,
      targetNumber: formattedPhone,
      totalNotifications: notifications.length,
      successCount,
      failureCount,
      results,
      summary: {
        allSuccess: successCount === notifications.length,
        partialSuccess: successCount > 0 && failureCount > 0,
        allFailed: successCount === 0
      }
    });

  } catch (error) {
    console.error('❌ Bulk notification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Endpoint for custom notifications to 9021264696
app.post('/api/whatsapp/send-custom-notification', async (req, res) => {
  try {
    const { message, notificationType = 'Custom' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const config = getWhatsAppConfig();
    const targetNumber = config.defaultTargetNumber;

    if (!config.token || !config.phoneNumberId) {
      return res.status(500).json({ 
        error: 'WhatsApp Business API not configured. Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID environment variables.' 
      });
    }

    const formattedPhone = formatPhoneNumber(targetNumber);
    
    const payload = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "text",
      text: { body: message }
    };

    const url = `https://graph.facebook.com/${config.version}/${config.phoneNumberId}/messages`;
    
    console.log(`📱 [Custom Notification] Sending ${notificationType} to ${formattedPhone}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ Custom notification sent successfully`);
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Custom notification sent successfully',
        targetNumber: formattedPhone,
        notificationType
      });
    } else {
      console.error('❌ WhatsApp API error:', result);
      return res.status(response.status).json({
        success: false,
        error: result.error || 'Failed to send custom notification',
        details: result
      });
    }

  } catch (error) {
    console.error('❌ Custom notification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Endpoint to test single notification type
app.post('/api/whatsapp/send-single-notification', async (req, res) => {
  try {
    const { type, customMessage } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: 'Notification type is required' });
    }

    const config = getWhatsAppConfig();
    const targetNumber = config.defaultTargetNumber;

    if (!config.token || !config.phoneNumberId) {
      return res.status(500).json({ 
        error: 'WhatsApp Business API not configured.' 
      });
    }

    const formattedPhone = formatPhoneNumber(targetNumber);
    
    // Define notification templates
    const templates = {
      'booking': `🎉 *Appointment Confirmed!*

Hello Test Client,

Your appointment at *RG Salon* has been successfully booked!

📅 *Date:* ${new Date(Date.now() + 86400000).toLocaleDateString('en-IN')}
⏰ *Time:* 10:30 AM

💅 *Services:* Hair Cut, Hair Color
✨ *Stylist:* Sarah

💰 *Total Amount:* ₹1,500.00

Thank you for choosing RG Salon! 💖

For queries: ${config.businessPhone}`,

      'reminder': `⏰ *Appointment Reminder*

Hello Test Client,

Reminder: You have an appointment at *RG Salon* tomorrow.

📅 *Date:* ${new Date(Date.now() + 86400000).toLocaleDateString('en-IN')}
⏰ *Time:* 10:30 AM

Please arrive 10 minutes early! 💖`,

      'cancellation': `❌ *Appointment Cancelled*

Hello Test Client,

Your appointment at *RG Salon* has been cancelled.

📅 *Date:* ${new Date(Date.now() + 86400000).toLocaleDateString('en-IN')}
⏰ *Time:* 10:30 AM

To reschedule: ${config.businessPhone}`,

      'welcome': `🌟 *Welcome to RG Salon!* 🌟

Hello! Thank you for choosing RG Salon.

We're excited to serve you! 💖

Contact: ${config.businessPhone}`,

      'custom': customMessage || 'Custom test message from RG Salon! 🎉'
    };

    const message = templates[type.toLowerCase()] || templates['custom'];
    
    const payload = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "text",
      text: { body: message }
    };

    const url = `https://graph.facebook.com/${config.version}/${config.phoneNumberId}/messages`;
    
    console.log(`📱 [Single Notification] Sending ${type} to ${formattedPhone}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ ${type} notification sent successfully`);
      return res.status(200).json({
        success: true,
        data: result,
        message: `${type} notification sent successfully`,
        targetNumber: formattedPhone,
        notificationType: type
      });
    } else {
      console.error(`❌ ${type} notification failed:`, result);
      return res.status(response.status).json({
        success: false,
        error: result.error || `Failed to send ${type} notification`,
        details: result
      });
    }

  } catch (error) {
    console.error(`❌ ${type} notification error:`, error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
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
  
  app.listen(port, () => {
    console.log(`🚀 RG Salon WhatsApp API Server running on port ${port}`);
    console.log(`📱 WhatsApp Business API: http://localhost:${port}/api/whatsapp/send-business-message`);
    console.log(`🏥 Health check: http://localhost:${port}/api/health`);
    console.log('');
    console.log('🎯 Ready to test WhatsApp notifications!');
    console.log('📋 To test: node test-whatsapp-business.js');
  });
}

// Start server with initial port 3001
startServer(3001); 
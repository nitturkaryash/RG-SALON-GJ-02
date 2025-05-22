import twilio from 'twilio';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get request body
    const { to, message } = req.body;

    // Validate required fields
    if (!to || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: to and message' 
      });
    }

    // Format phone number if needed
    const formattedPhone = to.startsWith('+') ? to : `+91${to}`;

    // Log the attempt
    console.log(`Attempting to send WhatsApp message to ${formattedPhone}`);

    // Get Twilio credentials from environment
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    // Validate credentials
    if (!accountSid || !authToken || !fromNumber) {
      console.error('Missing Twilio credentials');
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error: Missing Twilio credentials' 
      });
    }

    // Initialize Twilio client
    const client = twilio(accountSid, authToken);

    // Send WhatsApp message
    const twilioMessage = await client.messages.create({
      body: message,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${formattedPhone}`
    });

    // Log success
    console.log('WhatsApp message sent:', twilioMessage.sid);

    // Return success response
    return res.status(200).json({
      success: true,
      messageId: twilioMessage.sid
    });

  } catch (error) {
    // Log and return error
    console.error('Error sending WhatsApp message:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send WhatsApp message'
    });
  }
} 
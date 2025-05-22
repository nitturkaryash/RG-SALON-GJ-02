# WhatsApp Notification Setup Guide

This guide will help you set up WhatsApp notifications for your Salon POS system.

## 1. Set Up Twilio Account

1. Sign up for a Twilio account at [twilio.com](https://www.twilio.com/try-twilio)
2. Activate the WhatsApp Sandbox in your Twilio Console
3. Get your Account SID and Auth Token from the Twilio Console Dashboard

## 2. Configure Environment Variables

Add the following to your `.env.local` file:

```
# Twilio WhatsApp Integration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886
```

## 3. Verify Client Numbers for Sandbox Testing

1. To use Twilio's WhatsApp Sandbox, each client phone number must be verified
2. Each client needs to send a specific message to the Twilio WhatsApp number
3. The format is: `join <your-sandbox-code>` (e.g., `join wool-eleven`)
4. Get your specific sandbox code from the Twilio Console

## 4. Testing the Integration

You can test the WhatsApp integration in two ways:

1. Use the "Test WhatsApp" button in the POS header
2. Complete an order with client contact information to trigger an automatic notification

## 5. Customizing Messages

You can customize the notification templates in `src/utils/notifications.js`:

- `createAppointmentNotification`: For new appointments
- Custom messages in `createWalkInOrder`: For completed orders
- Custom messages in `updateAppointment`: For status changes

## 6. Production Deployment

For production:

1. Apply for a WhatsApp Business API through Twilio
2. Update your `TWILIO_WHATSAPP_NUMBER` to your approved number
3. Remove the phone number verification requirement

## Troubleshooting

- Check browser console for error messages
- Verify phone numbers are in E.164 format (e.g., +911234567890)
- Ensure environment variables are set correctly
- Check Twilio Console logs for delivery status
- Verify your Twilio account has sufficient credit

## Support

If you encounter issues:
- Check the [Twilio WhatsApp API Documentation](https://www.twilio.com/docs/whatsapp/api)
- Test API requests using Postman or cURL
- Monitor Twilio debugger for real-time logs 
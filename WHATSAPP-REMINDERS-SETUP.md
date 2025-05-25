# WhatsApp Appointment Reminders Setup

This document explains how to set up and use the automatic WhatsApp reminder system for salon appointments.

## Features

The system automatically sends WhatsApp reminders to clients:
- **24-hour reminder**: Sent 24 hours before the appointment
- **2-hour reminder**: Sent 2 hours before the appointment

## Database Setup

1. **Run the migration** to add reminder tracking columns:
```sql
-- Add reminder tracking columns to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_2h_sent BOOLEAN DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- Add indexes for faster reminder queries
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_24h ON appointments (start_time, reminder_24h_sent, status);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_2h ON appointments (start_time, reminder_2h_sent, status);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder ON appointments (start_time, reminder_sent, status);
```

## Cron Job Setup

### Option 1: Vercel Cron (Recommended for production)

Add to your `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/appointment-reminders",
      "schedule": "0 */1 * * *"
    }
  ]
}
```

This runs the reminder check every hour.

### Option 2: External Cron Service

Use services like:
- **Cron-job.org**
- **EasyCron**
- **GitHub Actions**

Set up a cron job to call:
```
GET https://your-domain.com/api/cron/appointment-reminders
```

With optional authorization header:
```
Authorization: Bearer YOUR_CRON_SECRET
```

## Environment Variables

Make sure these are set in your environment:
```env
CRON_SECRET=your-secret-key-for-cron-security
NEXT_PUBLIC_WHATSAPP_TOKEN=your-whatsapp-token
NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
NEXT_PUBLIC_WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE=+918956860024
```

## How It Works

### 24-Hour Reminders
- Checks for appointments 23-25 hours in the future
- Only sends to appointments where `reminder_24h_sent = false`
- Marks `reminder_24h_sent = true` after successful send

### 2-Hour Reminders
- Checks for appointments 1.5-2.5 hours in the future
- Only sends to appointments where `reminder_2h_sent = false`
- Marks `reminder_2h_sent = true` after successful send

### Message Content

**24-Hour Reminder:**
```
🔔 APPOINTMENT REMINDER - TOMORROW

Hi [Client Name]!

This is a friendly reminder about your appointment tomorrow:

📅 Date: [Date]
⏰ Time: [Time]
💇 Service: [Service]
👨‍💼 Stylist: [Stylist]

📍 Location: RG Salon

Please arrive 10 minutes early. Looking forward to seeing you!

Need to reschedule? Please call us at least 2 hours before your appointment.
```

**2-Hour Reminder:**
```
⏰ APPOINTMENT REMINDER - IN 2 HOURS

Hi [Client Name]!

Your appointment is coming up soon:

📅 Today: [Date]
⏰ Time: [Time]
💇 Service: [Service]
👨‍💼 Stylist: [Stylist]

📍 Location: RG Salon

Please arrive 10 minutes early. We're excited to see you!

Running late? Please give us a call.
```

## Testing

### Manual Testing
Use the test endpoint to send reminders manually:

```bash
# List upcoming appointments
GET /api/test-reminders

# Send a test reminder
POST /api/test-reminders
{
  "appointmentId": "appointment-uuid",
  "reminderType": "24h" // or "2h"
}
```

### Monitoring
The cron job returns detailed results:
```json
{
  "success": true,
  "message": "Processed 5 reminders",
  "summary": {
    "total": 5,
    "24h_reminders": 3,
    "2h_reminders": 2,
    "successful": 4,
    "failed": 1
  },
  "results": [...]
}
```

## Troubleshooting

### Common Issues

1. **No reminders being sent**
   - Check if cron job is running
   - Verify environment variables
   - Check appointment data has client phone numbers

2. **WhatsApp API errors**
   - Verify WhatsApp Business API credentials
   - Check if phone numbers are properly formatted
   - Ensure templates are approved

3. **Database errors**
   - Run the migration script
   - Check if reminder columns exist
   - Verify appointment data structure

### Logs
Check the server logs for detailed error messages:
```bash
# In development
npm run dev

# Check Vercel logs in production
vercel logs
```

## Integration with StylistDayView

The reminder system works automatically with appointments created through the StylistDayView component. When appointments are:

- **Created**: Sends immediate confirmation + schedules future reminders
- **Updated**: Sends update notification + resets reminder flags if time changed
- **Deleted**: Sends cancellation notification

## Security

- Use `CRON_SECRET` to protect the cron endpoint
- WhatsApp tokens should be kept secure
- Monitor API usage to prevent abuse

## Customization

To customize reminder messages, edit the `sendAppointmentReminder` function in `/src/utils/whatsapp.ts`.

To change reminder timing, modify the time calculations in `/src/app/api/cron/appointment-reminders/route.ts`. 
# 📱 Appointment SMS Notification System Setup Guide

This guide explains how to configure and use the automatic SMS/WhatsApp notification system for appointments in your salon management system.

## 🎯 Features Implemented

### 1. **Automatic Notifications**
- ✅ **Booking Confirmation** - Sent immediately when appointment is created
- ✅ **Reschedule/Update Notifications** - Sent when appointment times or details change
- ✅ **Cancellation Notifications** - Sent when appointment is cancelled/deleted
- ✅ **Reminder Messages** - Automated reminders sent 24 hours and 2 hours before appointments

### 2. **Message Types**
- **Confirmation Messages**: Welcome message with appointment details
- **Reschedule Messages**: Shows old vs new timing information
- **Update Messages**: General appointment updates (status, notes, etc.)
- **Cancellation Messages**: Apologetic message with rescheduling offer
- **Reminder Messages**: Friendly reminders with all appointment details

## 🛠️ Setup Instructions

### Step 1: Database Setup

First, create the reminder tracking table by running this SQL:

```bash
# Run this SQL in your Supabase SQL editor or via psql
psql -f create_appointment_reminders_table.sql
```

### Step 2: Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# WhatsApp/SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886

# OR use WhatsApp Business API
NEXT_PUBLIC_WHATSAPP_TOKEN=your_whatsapp_business_token
NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
NEXT_PUBLIC_WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id

# Salon Contact Information (for messages)
NEXT_PUBLIC_SALON_PHONE=+91-9876543210
NEXT_PUBLIC_SALON_ADDRESS=Your Salon Address Here
```

### Step 3: WhatsApp Configuration

Choose one of these options:

#### Option A: Twilio WhatsApp (Recommended for beginners)
1. Sign up at [twilio.com](https://www.twilio.com/try-twilio)
2. Enable WhatsApp Sandbox
3. Get your Account SID, Auth Token, and WhatsApp number
4. Clients need to send "join <sandbox-code>" to your Twilio number first

#### Option B: WhatsApp Business API (Production ready)
1. Apply for WhatsApp Business API access
2. Get approved business number and access token
3. Configure webhook endpoints
4. No client opt-in required for approved business numbers

### Step 4: Test the System

1. **Test Basic Notifications**:
   ```bash
   # Create a test appointment through the UI
   # Check console logs for notification status
   ```

2. **Test Manual Reminders**:
   ```bash
   # Use the reminder API endpoint
   POST /api/reminders
   {
     "action": "send-manual",
     "appointmentId": "appointment-uuid",
     "reminderType": "24h"
   }
   ```

3. **Check Reminder Processing**:
   ```bash
   # Check appointments needing reminders
   GET /api/reminders?action=list&type=24h
   ```

## 📋 How It Works

### Automatic Triggers

1. **When Appointment is Booked**:
   ```typescript
   // Automatically triggered in useAppointments.ts
   createAppointment.mutationFn() 
   → sends WhatsApp confirmation
   → shows success/error toast
   ```

2. **When Appointment is Updated**:
   ```typescript
   // Automatically triggered in useAppointments.ts
   updateAppointment.mutationFn()
   → detects if time changed (reschedule vs update)
   → sends appropriate WhatsApp message
   → shows success/error toast
   ```

3. **When Appointment is Cancelled**:
   ```typescript
   // Automatically triggered in useAppointments.ts
   deleteAppointment.mutationFn()
   → sends WhatsApp cancellation with apology
   → offers rescheduling and discount
   → shows success/error toast
   ```

4. **Automatic Reminders**:
   ```typescript
   // Started automatically when app loads
   startAutomaticReminders()
   → checks every hour for appointments needing reminders
   → sends 24h and 2h reminders
   → logs sent reminders to avoid duplicates
   ```

### Message Templates

#### 1. Booking Confirmation
```
🎉 *Appointment Confirmed!*

Hello [Client Name],

Your appointment at *RG Salon* has been successfully booked!

📅 *Date:* Monday, December 25, 2023
⏰ *Time:* 2:30 PM

💅 *Services:* Hair Cut, Hair Color
✨ *Stylists:* John, Sarah

💰 *Total Amount:* ₹2,500.00

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Cancel at least 2 hours in advance if needed

Thank you for choosing RG Salon! 💖
```

#### 2. Reschedule Notification
```
🔄 *Appointment Rescheduled!*

Hello [Client Name],

Your appointment at *RG Salon* has been rescheduled.

📅 *New Date:* Tuesday, December 26, 2023
⏰ *New Time:* 3:00 PM

💅 *Services:* Hair Cut, Hair Color
✨ *Stylists:* John, Sarah

Thank you for your understanding! 💖
```

#### 3. Cancellation Notice
```
❌ *Appointment Cancelled*

Hello [Client Name],

We regret to inform you that your appointment at *RG Salon* has been cancelled.

*We sincerely apologize for any inconvenience caused.*

📞 To reschedule your appointment, please call us at: +91-9876543210

💝 *Special Offer:* Book again within 7 days and get 10% discount!

Best regards,
RG Salon Team 💖
```

#### 4. 24-Hour Reminder
```
⏰ *Appointment Reminder*

Hello [Client Name],

This is a friendly reminder that you have an appointment at *RG Salon* in 24 hours.

📅 *Date:* Monday, December 25, 2023
⏰ *Time:* 2:30 PM

💅 *Services:* Hair Cut, Hair Color
✨ *Stylists:* John, Sarah

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Reschedule at least 2 hours in advance if needed

Thank you for choosing RG Salon! 💖
```

#### 5. 2-Hour Final Reminder
```
🚨 *Appointment Reminder*

Hello [Client Name],

This is a friendly reminder that you have an appointment at *RG Salon* in 2 hours.

📅 *Date:* Monday, December 25, 2023
⏰ *Time:* 2:30 PM

🚨 *Final Reminder* - Please confirm your attendance by replying YES

Thank you for choosing RG Salon! 💖
```

## 🔧 Manual Controls

### Send Manual Reminders

```typescript
// Send 24-hour reminder for specific appointment
const success = await sendManualReminder('appointment-id', '24h');

// Send 2-hour reminder for specific appointment
const success = await sendManualReminder('appointment-id', '2h');
```

### Process All Reminders Manually

```typescript
// Manually trigger reminder processing
await processAppointmentReminders();
```

### Check Appointments Needing Reminders

```typescript
// Get appointments needing 24h reminders
const appointments = await getAppointmentsNeedingReminders(24);

// Get appointments needing 2h reminders
const appointments = await getAppointmentsNeedingReminders(2);
```

## 📊 Monitoring & Troubleshooting

### Check Console Logs

All notification activities are logged with emojis for easy identification:

- 📱 WhatsApp operations
- ✅ Success messages
- ⚠️ Warning messages
- ❌ Error messages
- 🔄 Processing messages
- 📅 Appointment-related operations

### Common Issues and Solutions

1. **Messages Not Sending**:
   ```bash
   ✅ Check environment variables are set
   ✅ Verify WhatsApp credentials are valid
   ✅ Ensure client phone numbers are properly formatted
   ✅ Check console logs for specific error messages
   ```

2. **Reminders Not Working**:
   ```bash
   ✅ Verify appointment_reminders table exists
   ✅ Check that reminder system is initialized in App.tsx
   ✅ Ensure appointments have valid client phone numbers
   ✅ Check reminder API endpoint is accessible
   ```

3. **Phone Number Format Issues**:
   ```bash
   ✅ System automatically formats Indian numbers (+91)
   ✅ Accepts: 9876543210 → converts to: 919876543210
   ✅ Accepts: +91 98765 43210 → converts to: 919876543210
   ```

### Testing Endpoints

```bash
# Check reminder system status
GET /api/reminders

# List appointments needing 24h reminders
GET /api/reminders?action=list&type=24h

# List appointments needing 2h reminders
GET /api/reminders?action=list&type=2h

# Manually process all reminders
POST /api/reminders
{
  "action": "process-all"
}

# Send manual reminder
POST /api/reminders
{
  "action": "send-manual",
  "appointmentId": "uuid",
  "reminderType": "24h"
}
```

## 📈 Performance Considerations

1. **Rate Limiting**: 1-second delay between reminder messages
2. **Duplicate Prevention**: Database tracking prevents duplicate reminders
3. **Error Handling**: Failed notifications don't break appointment operations
4. **Graceful Degradation**: App works normally even if WhatsApp is down

## 🔒 Security & Privacy

1. **Data Protection**: Phone numbers are formatted securely
2. **RLS Policies**: Database access controlled via Supabase RLS
3. **No Sensitive Data**: WhatsApp messages don't contain payment details
4. **Opt-out Support**: Clients can request removal from notifications

## 🚀 Production Deployment

1. **Environment Setup**: Ensure all environment variables are set
2. **Database Migration**: Run the reminder table creation SQL
3. **Monitoring**: Set up logging and alerting for failed notifications
4. **Testing**: Test all notification types with real phone numbers
5. **Documentation**: Inform staff about the notification system

## 📞 Support

If you encounter issues:

1. Check console logs for detailed error messages
2. Verify WhatsApp/Twilio configuration
3. Test with a small number of appointments first
4. Ensure database permissions are correct
5. Check that phone numbers are in correct format

The system is designed to be robust and fail gracefully - even if notifications fail, the core appointment functionality will continue to work normally. 
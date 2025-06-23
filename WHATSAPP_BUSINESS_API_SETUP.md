# WhatsApp Business API Setup Guide for RG Salon

This guide will help you set up **WhatsApp Business API** using **Facebook Business Manager** for professional client notifications. This is the **correct approach** for production salon management software.

## 🎯 Why WhatsApp Business API?

✅ **Professional Solution**: Official Facebook/Meta service  
✅ **Production Ready**: Handles thousands of messages reliably  
✅ **No Browser Dependencies**: No Selenium or automation required  
✅ **Client Trust**: Official WhatsApp branding  
✅ **Scalable**: Supports bulk messaging and templates  
✅ **Business Features**: Rich media, templates, analytics  

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] **Facebook Business Account** (business.facebook.com)
- [ ] **WhatsApp Business Account** (different from personal WhatsApp)
- [ ] **Phone Number** for your salon (verified and not used elsewhere)
- [ ] **Business Documents** (registration, tax documents)
- [ ] **Meta Developer Account** (developers.facebook.com)

## 🚀 Step-by-Step Setup

### Step 1: Create Facebook Business Manager Account

1. Go to [business.facebook.com](https://business.facebook.com)
2. Click **"Create Account"**
3. Enter your business information:
   - Business Name: **"RG Salon"**
   - Your Name
   - Business Email Address
4. Verify your email and complete setup

### Step 2: Apply for WhatsApp Business API

1. In Facebook Business Manager, go to **"Business Settings"**
2. Click **"Accounts"** → **"WhatsApp Business Accounts"**
3. Click **"Add"** → **"Request Access to WhatsApp Business API"**
4. Fill out the application:
   - Business Use Case: **"Customer Notifications & Appointment Management"**
   - Expected Monthly Volume: **"1,000-5,000 messages"**
   - Business Category: **"Beauty & Personal Care"**

### Step 3: Verify Your Business

Facebook will review your application (1-3 business days). You'll need:

- Business registration documents
- Phone number verification
- Business profile completion

### Step 4: Get WhatsApp Business API Credentials

Once approved, you'll receive:

```bash
# Required Environment Variables
WHATSAPP_ACCESS_TOKEN=YOUR_PERMANENT_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID=YOUR_PHONE_NUMBER_ID
WHATSAPP_BUSINESS_ACCOUNT_ID=YOUR_BUSINESS_ACCOUNT_ID
```

### Step 5: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=1234567890123456
WHATSAPP_BUSINESS_ACCOUNT_ID=1234567890123456

# Optional: Display phone number for customers
NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE=+91-8956860024
```

### Step 6: Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Test the WhatsApp API endpoint:
```bash
curl -X POST http://localhost:5175/api/whatsapp/send-business-message \
  -H "Content-Type: application/json" \
  -d '{
    "to": "9021264696",
    "message": "Hello! This is a test message from RG Salon WhatsApp Business API. 🎉"
  }'
```

3. You should receive a WhatsApp message on the test number!

## 📱 Testing All Notification Types

Create a test script to verify all notification types work:

```javascript
// test-whatsapp-business.js
const testPhoneNumber = '9021264696';
const apiUrl = 'http://localhost:5175/api/whatsapp/send-business-message';

async function testNotifications() {
  const notifications = [
    {
      type: 'Booking Confirmation',
      message: `🎉 *Appointment Confirmed!*

Hello Test Client,

Your appointment at *RG Salon* has been successfully booked!

📅 *Date:* Friday, December 15, 2024
⏰ *Time:* 10:30 AM

💅 *Services:* Hair Cut, Hair Color
✨ *Stylists:* Sarah, John

💰 *Total Amount:* ₹2,500.00

Thank you for choosing RG Salon! 💖`
    },
    {
      type: 'Update Notification',
      message: `📝 *Appointment Updated!*

Your appointment at *RG Salon* has been updated.

📅 *Date:* Saturday, December 16, 2024
⏰ *Time:* 2:00 PM

We look forward to serving you! 💖`
    },
    {
      type: 'Cancellation',
      message: `❌ *Appointment Cancelled*

We regret to inform you that your appointment has been cancelled.

💝 *Special Offer:* Book again within 7 days and get 10% discount!

Best regards,
RG Salon Team 💖`
    },
    {
      type: '24h Reminder',
      message: `⏰ *Appointment Reminder*

This is a friendly reminder that you have an appointment at *RG Salon* in 24 hours.

📅 *Date:* Tomorrow, 10:30 AM
💅 *Services:* Hair Cut, Hair Color

Thank you for choosing RG Salon! 💖`
    },
    {
      type: '2h Final Reminder',
      message: `🚨 *Final Reminder*

Your appointment at *RG Salon* is in 2 hours!

⏰ *Time:* 10:30 AM
🚨 Please confirm your attendance by replying YES

Contact us: +91-8956860024`
    }
  ];

  for (const notification of notifications) {
    console.log(`📱 Sending ${notification.type}...`);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testPhoneNumber,
          message: notification.message
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${notification.type} sent successfully`);
      } else {
        console.log(`❌ ${notification.type} failed:`, result.error);
      }
    } catch (error) {
      console.log(`❌ ${notification.type} error:`, error.message);
    }
    
    // Wait 2 seconds between messages to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

testNotifications();
```

Run the test:
```bash
node test-whatsapp-business.js
```

## 🛠 Integration Points

The WhatsApp Business API is already integrated into your appointment system:

### Automatic Notifications

✅ **Booking Confirmation** - `src/hooks/useAppointments.ts` (line ~360)  
✅ **Update/Reschedule** - `src/hooks/useAppointments.ts` (line ~580)  
✅ **Cancellation** - `src/hooks/useAppointments.ts` (line ~780)  

### Reminder System

✅ **24h Reminders** - `src/utils/appointmentReminders.ts`  
✅ **2h Final Reminders** - `src/utils/appointmentReminders.ts`  
✅ **Automatic Processing** - Initialized in `src/App.tsx`  

### API Endpoints

✅ **Send Message** - `pages/api/whatsapp/send-business-message.ts`  
✅ **Reminder System** - `src/app/api/reminders/route.ts`  

## 🎨 Message Templates

The system includes professionally designed message templates:

- **Indian formatting** (dates, currency, phone numbers)
- **Emoji enhancements** for better engagement
- **Professional tone** with salon branding
- **Clear call-to-actions** and contact information
- **Special offers** for cancellations/rebooking

## 📊 Production Deployment

### Environment Variables for Production

```bash
# Production WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your_production_token
WHATSAPP_PHONE_NUMBER_ID=your_production_phone_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id

# Production display phone
NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE=+91-8956860024
```

### Rate Limits

WhatsApp Business API has rate limits:
- **1,000 messages per day** (free tier)
- **80 messages per minute** maximum
- System includes 1-second delays between messages

### Monitoring

Monitor your WhatsApp API usage:
1. Facebook Business Manager → WhatsApp Business Account
2. Analytics → Message Analytics
3. Monitor delivery rates, read rates, response rates

## 🔧 Troubleshooting

### Common Issues

**❌ "WhatsApp Business API not configured"**
- Solution: Set environment variables correctly

**❌ "Invalid phone number format"**
- Solution: Use format `9021264696` (10 digits for Indian numbers)

**❌ "Message not delivered"**
- Solution: Check if recipient has WhatsApp and hasn't blocked business

**❌ "Rate limit exceeded"**
- Solution: Reduce message frequency, respect API limits

### Debug Mode

Enable detailed logging:
```javascript
// In your console
localStorage.setItem('debug_whatsapp', 'true');
```

### Test Configuration

Check if API is configured correctly:
```bash
curl -X POST http://localhost:5175/api/whatsapp/send-business-message \
  -H "Content-Type: application/json" \
  -d '{"to": "1234567890", "message": "Test"}'
```

Expected response:
```json
{
  "success": false,
  "error": "WhatsApp Business API not configured..."
}
```

If configured correctly, you should get API response with `message_id`.

## 🎯 Next Steps

1. **Apply for WhatsApp Business API** through Facebook Business Manager
2. **Get approved** (usually 1-3 business days)
3. **Set environment variables** with your credentials
4. **Test thoroughly** with the provided test script
5. **Go live** and start receiving professional notifications!

## 📞 Support

- **WhatsApp Business API Docs**: [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp)
- **Facebook Business Support**: [business.facebook.com/help](https://business.facebook.com/help)
- **Meta Developer Support**: [developers.facebook.com/support](https://developers.facebook.com/support)

---

**✨ Your salon now has professional WhatsApp notifications! ✨**

Once set up, every appointment booking, update, reminder, and cancellation will automatically send beautiful, branded WhatsApp messages to your clients. 🎉 
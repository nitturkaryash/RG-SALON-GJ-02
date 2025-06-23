# 📱 WhatsApp Notification Testing Guide for 9021264696

This guide provides comprehensive instructions for testing the WhatsApp Business API notification system specifically configured for phone number **9021264696**.

## 🚀 Quick Start

### 1. Start the Server

```bash
# Option 1: Start Express server directly
node server.js

# Option 2: Start with npm/yarn
npm start
# or
yarn start
```

The server will automatically find an available port (typically 3001, 3002, 5174, etc.).

### 2. Test All Notifications (Command Line)

```bash
# Send all 6 notification types to 9021264696
node test-whatsapp-9021264696.js

# Send specific notification type
node test-whatsapp-9021264696.js 2    # Booking confirmation
node test-whatsapp-9021264696.js 3    # Reminder
node test-whatsapp-9021264696.js 6 "Your custom message here"  # Custom message
```

### 3. Test with Postman

1. Import the collection: `postman-whatsapp-collection.json`
2. Set the `baseUrl` variable to your server URL (e.g., `http://localhost:3001`)
3. Run any request to test specific functionality

## 📋 Available Endpoints

### Health Check
- **GET** `/api/health`
- Check server status and configuration

### All Notifications
- **POST** `/api/whatsapp/send-all-notifications`
- Sends all 6 notification types to 9021264696
- No request body needed

### Single Notification
- **POST** `/api/whatsapp/send-single-notification`
- Send specific notification type
- Body: `{ "type": "booking|reminder|cancellation|welcome|custom", "customMessage": "optional" }`

### Custom Notification
- **POST** `/api/whatsapp/send-custom-notification`
- Send completely custom message
- Body: `{ "message": "Your message", "notificationType": "Optional Type" }`

### Generic WhatsApp
- **POST** `/api/whatsapp/send-business-message`
- Send to any phone number
- Body: `{ "to": "phone_number", "message": "text" }`

## 🎯 Notification Types

### 1. System Test
Basic connectivity test with timestamp and configuration info.

### 2. Booking Confirmation
Professional appointment confirmation with:
- Date and time
- Services booked
- Stylist information
- Total amount
- Important reminders

### 3. Update Notification
Appointment modification notification with updated details.

### 4. Cancellation
Polite cancellation notice with:
- Apology message
- Rescheduling contact info
- Special offer for rebooking

### 5. 24h Reminder
Friendly reminder sent 24 hours before appointment.

### 6. 2h Final Reminder
Urgent final reminder with confirmation request.

## 🧪 Testing Scenarios

### Scenario 1: Complete System Test
```bash
# Test all notifications at once
node test-whatsapp-9021264696.js 1
```
**Expected Result:** 6 messages sent to 9021264696 over ~18 seconds

### Scenario 2: Individual Notification Testing
```bash
# Test booking confirmation
node test-whatsapp-9021264696.js 2

# Test reminder
node test-whatsapp-9021264696.js 3

# Test cancellation
node test-whatsapp-9021264696.js 4
```

### Scenario 3: Custom Message Testing
```bash
# Send custom promotional message
node test-whatsapp-9021264696.js 6 "🎉 Special offer: 20% off on all services this week! Book now: +91-8956860024"
```

### Scenario 4: Postman API Testing

1. **Import Collection:**
   - Open Postman
   - Import `postman-whatsapp-collection.json`
   - Set `baseUrl` variable (e.g., `http://localhost:3001`)

2. **Test Health Check:**
   - Run "📋 Health Check" request
   - Verify `whatsappConfigured: true`
   - Check `defaultTargetNumber: "9021264696"`

3. **Test All Notifications:**
   - Run "🎉 Send ALL Notifications to 9021264696"
   - Wait for ~18 seconds for completion
   - Check response for success counts

4. **Test Individual Types:**
   - Run any single notification request
   - Modify request body as needed
   - Verify immediate response

## 📊 Expected Responses

### Successful Response (All Notifications)
```json
{
  "success": true,
  "message": "Sent 6/6 notifications successfully",
  "targetNumber": "919021264696",
  "totalNotifications": 6,
  "successCount": 6,
  "failureCount": 0,
  "results": [
    {
      "type": "System Test",
      "success": true,
      "messageId": "wamid.xxx..."
    },
    // ... more results
  ],
  "summary": {
    "allSuccess": true,
    "partialSuccess": false,
    "allFailed": false
  }
}
```

### Successful Response (Single Notification)
```json
{
  "success": true,
  "data": {
    "messaging_product": "whatsapp",
    "contacts": [...],
    "messages": [
      {
        "id": "wamid.xxx...",
        "message_status": "accepted"
      }
    ]
  },
  "message": "booking notification sent successfully",
  "targetNumber": "919021264696",
  "notificationType": "booking"
}
```

### Error Response Examples
```json
{
  "success": false,
  "error": "WhatsApp Business API not configured",
  "details": "Missing WHATSAPP_ACCESS_TOKEN"
}
```

## 🔧 Troubleshooting

### Issue: Server Not Found
```
❌ No active WhatsApp API server found on ports: 3001, 3002, 3003, 5174, 5175, 5173, 3000
```
**Solution:** Start the server with `node server.js`

### Issue: WhatsApp API Not Configured
```json
{
  "error": "WhatsApp Business API not configured. Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID environment variables."
}
```
**Solution:** The server has fallback hardcoded values, but verify they're still valid.

### Issue: Rate Limiting
```json
{
  "error": {
    "code": 130429,
    "message": "Rate limit exceeded"
  }
}
```
**Solution:** Wait 1-2 minutes before sending more messages.

### Issue: Invalid Phone Number
```json
{
  "error": {
    "code": 100,
    "message": "Invalid parameter"
  }
}
```
**Solution:** Verify phone number format (should be `919021264696`).

## 📱 WhatsApp Business API Configuration

The system uses these hardcoded values as fallbacks:

- **Token:** `EAAQjirsfZCZCcBO3vcBGSRYdtVgGbD3J07UkZC9bEsaE2F6xIiWLjP38fSFnY13gdxdSvlkOhFphneOrULcZB4Q8v9yKDW4xKm4FOIxHYSuGs31ebx7XJuUh4FadR8nncvkNJe2rwlfPCzETFdzdEOeuOO8JvzbTug7LWrn6n0OiWTNZCBYmDSjlhnyoOUZBQnmgZDZD`
- **Phone Number ID:** `649515451575660`
- **Business Account ID:** `593695986423772`
- **Business Phone:** `+918956860024`
- **API Version:** `v21.0`

## 🎉 Success Indicators

### ✅ All Tests Pass When:
1. All 6 notifications send successfully
2. Each message has a unique `messageId`
3. Response shows `"allSuccess": true`
4. WhatsApp shows 6 new messages on 9021264696

### ✅ Individual Tests Pass When:
1. Single notification sends successfully
2. Response includes valid `messageId`
3. WhatsApp shows the specific message on 9021264696

### ✅ Custom Messages Pass When:
1. Custom content appears in WhatsApp
2. Response confirms successful delivery
3. Message format matches your input

## 📞 Support Information

- **Business Phone:** +91-8956860024
- **Target Number:** 9021264696
- **API Version:** v21.0
- **Rate Limit:** ~1 message per second
- **Message Delay:** 3 seconds between bulk messages

## 🔄 Quick Command Reference

```bash
# Test all notifications
node test-whatsapp-9021264696.js

# Test specific types
node test-whatsapp-9021264696.js 1    # All notifications
node test-whatsapp-9021264696.js 2    # Booking
node test-whatsapp-9021264696.js 3    # Reminder  
node test-whatsapp-9021264696.js 4    # Cancellation
node test-whatsapp-9021264696.js 5    # Welcome
node test-whatsapp-9021264696.js 6    # Custom

# Test custom message
node test-whatsapp-9021264696.js 6 "Your custom message here"

# Start server
node server.js

# Check server health
curl http://localhost:3001/api/health
```

---

🎉 **Happy Testing!** Your WhatsApp notification system for 9021264696 is ready to use! 
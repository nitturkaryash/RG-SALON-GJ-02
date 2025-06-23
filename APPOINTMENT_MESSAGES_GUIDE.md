# 💅 RG Salon Appointment Notification System

## 🎯 **Perfect Solution for Your Appointment Messages!**

This system sends professional appointment notifications to **9021264696** for:
- ✅ **Appointment Confirmation**
- ✅ **Appointment Rescheduling** 
- ✅ **Appointment Cancellation**
- ✅ **Appointment Reminders** (24h & 2h)

---

## 🚀 **Quick Start**

### Method 1: Command Line (Fastest)
```bash
# Send appointment confirmation
node appointment-notifications.js 1

# Send rescheduling notification  
node appointment-notifications.js 2

# Send cancellation notice
node appointment-notifications.js 3

# Send 24-hour reminder
node appointment-notifications.js 4

# Send 2-hour final reminder
node appointment-notifications.js 5

# Send all test notifications
node appointment-notifications.js 6
```

### Method 2: Interactive Menu (Windows)
```bash
# Double-click this file or run:
appointment-messages.bat
```

### Method 3: Help & Options
```bash
# Show all options
node appointment-notifications.js --help
```

---

## 📱 **Message Types & Content**

### 1. 🎉 **Appointment Confirmation**
```
🎉 *Appointment Confirmed!*

Dear Valued Client,

Your appointment at *RG Salon* has been successfully confirmed!

📅 *Date:* 24/6/2025
⏰ *Time:* 10:30 AM
💅 *Services:* Hair Cut, Hair Styling, Manicure
✨ *Stylist:* Sarah
💰 *Amount:* ₹2,500.00

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Cancel at least 2 hours in advance if needed

Thank you for choosing RG Salon! 💖

For any queries, call us at: +91-8956860024

*Booking ID:* RG123456
```

### 2. 📅 **Appointment Rescheduling**
```
📅 *Appointment Rescheduled*

Dear Valued Client,

Your appointment at *RG Salon* has been successfully rescheduled.

*Previous Appointment:*
📅 Date: 23/6/2025
⏰ Time: 2:00 PM

*New Appointment:*
📅 *Date:* 24/6/2025
⏰ *Time:* 10:30 AM
💅 *Services:* Hair Cut, Hair Styling, Manicure
✨ *Stylist:* Sarah
💰 *Amount:* ₹2,500.00

Thank you for your flexibility! 💖

For any queries, call us at: +91-8956860024

*Booking ID:* RG123456
```

### 3. ❌ **Appointment Cancellation**
```
❌ *Appointment Cancelled*

Dear Valued Client,

We regret to inform you that your appointment at *RG Salon* has been cancelled.

📅 *Cancelled Date:* 24/6/2025
⏰ *Cancelled Time:* 10:30 AM
💅 *Services:* Hair Cut, Hair Styling, Manicure
✨ *Stylist:* Sarah
💰 *Amount:* ₹2,500.00

*Reason:* Stylist unavailability due to emergency

*We sincerely apologize for any inconvenience caused.*

📞 To reschedule your appointment, please call us at: +91-8956860024

💝 *Special Offer:* Book again within 7 days and get 10% discount!

Thank you for your understanding.

Best regards,
RG Salon Team 💖

*Booking ID:* RG123456
```

### 4. ⏰ **24-Hour Reminder**
```
⏰ *Appointment Reminder*

Dear Valued Client,

This is a friendly reminder that you have an appointment at *RG Salon* tomorrow.

📅 *Date:* 24/6/2025
⏰ *Time:* 10:30 AM
💅 *Services:* Hair Cut, Hair Styling, Manicure
✨ *Stylist:* Sarah
💰 *Amount:* ₹2,500.00

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Reschedule at least 2 hours in advance if needed

📞 Contact us: +91-8956860024

Thank you for choosing RG Salon! 💖

*Booking ID:* RG123456
```

### 5. 🚨 **2-Hour Final Reminder**
```
⏰ *Appointment Reminder*

Dear Valued Client,

This is a friendly reminder that you have an appointment at *RG Salon* in 2 hours.

📅 *Date:* 23/6/2025
⏰ *Time:* 6:00 PM
💅 *Services:* Hair Cut, Hair Styling, Manicure
✨ *Stylist:* Sarah
💰 *Amount:* ₹2,500.00

*Important Reminders:*
• Please arrive 10 minutes before your appointment
• Carry a valid ID for verification
• Reschedule at least 2 hours in advance if needed

🚨 *Final Reminder* - Please confirm your attendance by replying YES

📞 Contact us: +91-8956860024

Thank you for choosing RG Salon! 💖

*Booking ID:* RG123456
```

---

## 🎯 **Usage Examples**

### Daily Operations
```bash
# Morning: Send confirmation for new bookings
node appointment-notifications.js 1

# Afternoon: Send reminders for tomorrow's appointments  
node appointment-notifications.js 4

# Evening: Send final reminders for next day appointments
node appointment-notifications.js 5

# As needed: Send rescheduling/cancellation notices
node appointment-notifications.js 2
node appointment-notifications.js 3
```

### Testing All Messages
```bash
# Send all 5 message types at once (for testing)
node appointment-notifications.js 6
```

### Custom Messages
```bash
# Send a custom appointment message
node appointment-notifications.js 7 "Your custom message here"
```

---

## 📊 **Features**

### ✅ **What's Included:**
- Professional message templates
- Automatic date/time generation
- Unique booking ID generation
- Professional formatting with emojis
- Business contact information
- Important reminders and policies
- Error handling and logging
- Colored console output

### 🎯 **Target Information:**
- **Phone Number:** 9021264696 (automatically formatted to 919021264696)
- **Business Phone:** +91-8956860024
- **Server:** Auto-detects running server
- **API:** WhatsApp Business API integration

### 🔄 **Message Flow:**
1. **Booking** → Confirmation message
2. **Changes** → Rescheduling message  
3. **Issues** → Cancellation message
4. **24h before** → Reminder message
5. **2h before** → Final reminder message

---

## 🛠️ **Technical Details**

### Message Delivery
- Uses WhatsApp Business API
- Professional business account (+91-8956860024)
- Automatic server detection (ports 3001, 3002, 3003, etc.)
- Real-time delivery confirmation
- Message ID tracking

### Error Handling
- Server connection verification
- API response validation
- Network error recovery
- Detailed error logging

### Customization
- Easy to modify templates
- Configurable appointment data
- Flexible date/time formatting
- Custom message support

---

## 📋 **Quick Command Reference**

| Command | Action | Description |
|---------|---------|-------------|
| `node appointment-notifications.js 1` | 🎉 Confirmation | Send booking confirmation |
| `node appointment-notifications.js 2` | 📅 Rescheduling | Send rescheduling notice |
| `node appointment-notifications.js 3` | ❌ Cancellation | Send cancellation notice |
| `node appointment-notifications.js 4` | ⏰ 24h Reminder | Send day-before reminder |
| `node appointment-notifications.js 5` | 🚨 2h Reminder | Send final reminder |
| `node appointment-notifications.js 6` | 📋 All Tests | Send all message types |
| `node appointment-notifications.js 7` | 🔧 Custom | Send custom message |
| `appointment-messages.bat` | 📱 Interactive | Windows menu interface |

---

## 🎉 **Success Verification**

### ✅ **You'll know it's working when:**
1. Console shows: `✅ CONFIRMATION notification sent successfully!`
2. Message ID is displayed: `📋 Message ID: wamid.xxx...`
3. Target number is confirmed: `📱 Message sent to: 919021264696`
4. **WhatsApp receives professional appointment message on 9021264696**

### 📱 **Expected Response Time:**
- **API Processing:** Immediate (< 1 second)
- **WhatsApp Delivery:** 1-5 seconds
- **Device Notification:** Immediate upon delivery

---

## 🔧 **Troubleshooting**

### Issue: Server Not Found
```
❌ No active server found. Please start your server with: node server.js
```
**Solution:** Start the server first: `node server.js`

### Issue: Message Failed
```
❌ CONFIRMATION notification failed
```
**Solution:** Check server logs and ensure WhatsApp Business API is configured

### Issue: No WhatsApp Delivery
**Solution:** Ensure 9021264696 has sent an initial opt-in message to +91-8956860024

---

## 📞 **Support Information**

- **Business WhatsApp:** +91-8956860024
- **Target Number:** 9021264696
- **Server Health:** `curl http://localhost:3001/api/health`
- **Diagnostic Tool:** `node diagnose-whatsapp.js`

---

🎉 **Your appointment notification system is ready! Send professional messages to 9021264696 with a single command!** 💅 
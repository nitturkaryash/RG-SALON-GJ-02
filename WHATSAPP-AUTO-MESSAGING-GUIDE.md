# WhatsApp Auto-Messaging System for CRUD Operations

## Overview

Your salon management system now includes automatic WhatsApp messaging for all CRUD (Create, Read, Update, Delete) operations. This system automatically sends relevant WhatsApp messages to clients when:

- **Orders are created, updated, or cancelled**
- **Appointments are booked, modified, or cancelled**
- **New clients are added to the system**
- **Inventory runs low (alerts to managers)**
- **Payments are received**

## 🚀 Quick Start

### 1. Enable Auto-Messaging

1. Navigate to **Settings > WhatsApp Automation**
2. Toggle **"Enable WhatsApp Automation"** to ON
3. Configure which message types you want enabled
4. Click **"Save Configuration"**

### 2. Test Your Setup

1. Click **"Send Test Message"** in the automation settings
2. Enter a phone number and client name
3. The system will send a test confirmation message

## 📱 Supported CRUD Operations

### Order Operations

#### Create Order
```javascript
// API: POST /api/orders
{
  "client_name": "John Doe",
  "client_phone": "+919876543210",
  "items": [
    {
      "name": "Hair Cut",
      "quantity": 1,
      "price": 500,
      "type": "service"
    }
  ],
  "total": 500,
  "payment_method": "cash",
  "stylist": "Jane Smith"
}
```
**Auto Message**: Order confirmation with service details

#### Update Order
```javascript
// API: PUT /api/orders
{
  "id": "order-uuid",
  "status": "completed",
  "client_phone": "+919876543210"
}
```
**Auto Message**: Order update notification

#### Delete Order
```javascript
// API: DELETE /api/orders?id=order-uuid&reason=Client%20request
```
**Auto Message**: Order cancellation notice

### Appointment Operations

#### Create Appointment
```javascript
// API: POST /api/appointments
{
  "client": {
    "id": "client-uuid",
    "full_name": "John Doe",
    "phone": "+919876543210"
  },
  "start_time": "2024-12-15T14:30:00Z",
  "services": [
    {
      "name": "Hair Cut & Style",
      "duration": 60,
      "price": 800
    }
  ],
  "stylists": [{ "name": "Jane Smith" }],
  "status": "scheduled"
}
```
**Auto Message**: Appointment confirmation

#### Update Appointment
```javascript
// API: PUT /api/appointments
{
  "id": "appointment-uuid",
  "start_time": "2024-12-15T16:30:00Z",
  "status": "rescheduled"
}
```
**Auto Message**: Appointment reschedule notification

#### Cancel Appointment
```javascript
// API: DELETE /api/appointments?id=appointment-uuid&reason=Client%20emergency
```
**Auto Message**: Appointment cancellation notice

### Client Operations

#### Create Client
```javascript
// API: POST /api/clients
{
  "full_name": "John Doe",
  "phone": "+919876543210",
  "email": "john@example.com",
  "send_welcome": true
}
```
**Auto Message**: Welcome message for new clients

### Inventory Operations

#### Low Stock Alert
```javascript
// API: GET /api/inventory/alerts?manager_phone=+919876543210&threshold=10&send_alerts=true
```
**Auto Message**: Low stock alert to manager

#### Manual Inventory Alert
```javascript
// API: POST /api/inventory/alerts
{
  "product_name": "Hair Shampoo",
  "current_stock": 5,
  "min_threshold": 10,
  "manager_phone": "+919876543210"
}
```
**Auto Message**: Specific product low stock alert

## ⚙️ Configuration

### Message Types Configuration

You can enable/disable each type of automatic message:

```javascript
{
  "enabled": true,
  "messageTypes": {
    "orderCreated": true,
    "orderUpdated": true,
    "orderDeleted": true,
    "appointmentCreated": true,
    "appointmentUpdated": true,
    "appointmentCancelled": true,
    "inventoryLow": true,
    "clientWelcome": true,
    "paymentReceived": true
  }
}
```

### API Endpoints for Configuration

#### Get Current Configuration
```bash
GET /api/whatsapp/config
```

#### Update Configuration
```bash
POST /api/whatsapp/config
Content-Type: application/json

{
  "enabled": true,
  "messageTypes": {
    "orderCreated": false,  # Disable order creation messages
    "clientWelcome": true   # Keep welcome messages enabled
  }
}
```

#### Reset to Defaults
```bash
PUT /api/whatsapp/config
```

## 🔧 Integration with Existing Code

### POS System Integration

The auto-messaging is already integrated into your POS system. When you create orders through the POS interface, messages are automatically sent if:

1. The customer has a valid phone number
2. Auto-messaging is enabled
3. The specific message type is enabled

### Example Integration in Your Components

```typescript
// In your order creation component
const createOrder = async (orderData) => {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...orderData,
        client_phone: client.phone // Include phone for auto-messaging
      })
    });
    
    const result = await response.json();
    
    if (result.whatsapp_sent) {
      toast.success('Order created and WhatsApp confirmation sent!');
    } else {
      toast.success('Order created successfully');
    }
  } catch (error) {
    console.error('Error creating order:', error);
  }
};
```

## 📱 WhatsApp Message Templates

The system uses these WhatsApp Business API templates:

### Appointment Confirmation
- **Template**: `appointment_confirm`
- **Parameters**: Client name, date/time, service, stylist, price

### Appointment Update
- **Template**: `appointment_updation`
- **Parameters**: Client name, old date/time, new date/time, service, stylist, price

### Appointment Cancellation
- **Template**: Custom cancellation message

### Special Offers (Used for various notifications)
- **Template**: `rg_salon_special_offer`
- **Parameters**: Client name, offer details, valid until date

## 🛠️ Troubleshooting

### Common Issues

#### 1. Messages Not Sending
- Check if WhatsApp automation is enabled
- Verify phone numbers are in correct format (+919876543210)
- Ensure WhatsApp Business API credentials are configured
- Check that specific message types are enabled

#### 2. Phone Number Format Issues
```javascript
// The system automatically formats phone numbers
// Input: "9876543210" → Output: "919876543210"
// Input: "+91 98765 43210" → Output: "919876543210"
```

#### 3. Template Errors
- Verify WhatsApp Business API templates are approved
- Check template parameter counts match
- Ensure templates exist in your WhatsApp Business account

### Debug Mode

Enable debug logging by checking browser console for:
```
✅ Order created message sent to John Doe
❌ Error sending WhatsApp message: Template not found
```

## 🔐 Security & Privacy

### Data Protection
- Phone numbers are validated and formatted securely
- Messages only sent to clients who have provided consent
- No sensitive data is logged in WhatsApp messages

### Opt-out Mechanism
Clients can opt out by:
1. Replying "STOP" to any automated message
2. Requesting removal through salon staff
3. Having their phone number removed from their profile

## 📊 Monitoring & Analytics

### Success Tracking
Each API response includes WhatsApp delivery status:
```javascript
{
  "success": true,
  "order": {...},
  "whatsapp_sent": true  // Indicates if message was sent
}
```

### Error Handling
- Failed WhatsApp messages don't prevent CRUD operations
- Errors are logged for debugging
- Graceful fallback to operation without notification

## 🚀 Advanced Features

### Custom Messages
```javascript
// Send custom WhatsApp message
await WhatsAppAutomation.sendCustomMessage(
  "+919876543210",
  "John Doe", 
  "Your premium membership has been activated!"
);
```

### Conditional Messaging
```javascript
// Only send messages for high-value orders
if (orderTotal > 1000) {
  await WhatsAppAutomation.handleOrderCreated(orderData);
}
```

### Scheduled Messaging
Use the existing cron job system for scheduled reminders:
```javascript
// 24-hour appointment reminders are already implemented
// at /api/cron/appointment-reminders
```

## 📋 Implementation Checklist

- [ ] WhatsApp Business API credentials configured
- [ ] Templates approved in WhatsApp Business Manager
- [ ] Auto-messaging enabled in settings
- [ ] Test messages sent successfully
- [ ] Staff trained on the system
- [ ] Client consent process established
- [ ] Error monitoring in place

## 🔄 Future Enhancements

Potential improvements to consider:

1. **Rich Media Messages**: Send images with service menus
2. **Interactive Buttons**: Allow clients to confirm/reschedule via WhatsApp
3. **Multiple Languages**: Support for regional languages
4. **Advanced Scheduling**: More granular timing controls
5. **Integration with WhatsApp Flows**: Create complete booking flows

## 💡 Best Practices

1. **Phone Number Collection**: Always collect phone numbers during client registration
2. **Consent Management**: Maintain clear opt-in/opt-out processes  
3. **Message Timing**: Avoid sending messages too early or too late
4. **Template Management**: Keep WhatsApp templates updated and approved
5. **Error Monitoring**: Regularly check logs for failed messages
6. **Client Feedback**: Monitor client responses and adjust messaging accordingly

---

Your WhatsApp auto-messaging system is now ready to enhance customer communication and streamline your salon operations! 🎉 
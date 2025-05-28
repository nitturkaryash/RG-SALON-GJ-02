# WhatsApp Automation Setup Guide

This guide will help you set up WhatsApp automation for your salon management system using PyWhatKit.

## 🎯 Features

- **Order Notifications**: Send WhatsApp messages when orders are created, updated, or cancelled
- **Appointment Reminders**: Automated appointment reminders for clients
- **Inventory Alerts**: Low stock notifications for managers
- **Client Welcome**: Welcome messages for new clients
- **Custom Messages**: Send custom WhatsApp messages through your React app

## 📋 Prerequisites

1. **Python 3.7+** installed on your system
2. **Google Chrome** browser installed
3. **WhatsApp** account with access to WhatsApp Web
4. **Phone with internet connection** (for WhatsApp Web authentication)

## 🚀 Quick Setup

### Step 1: Install Dependencies

Navigate to your backend directory and run the setup script:

```bash
cd backend
python whatsapp_setup.py
```

Or install manually:

```bash
pip install -r requirements.txt
```

### Step 2: WhatsApp Web Authentication

1. **Open Google Chrome** browser
2. **Go to** [web.whatsapp.com](https://web.whatsapp.com)
3. **Scan the QR code** with your phone's WhatsApp
4. **Check "Keep me signed in"** option
5. **Keep this tab open** while using the automation

> ⚠️ **IMPORTANT**: Do not close the WhatsApp Web tab or Chrome browser while using the automation.

### Step 3: Test the Setup

Run a test to ensure everything is working:

```bash
python whatsapp_setup.py
```

Follow the prompts to send a test message to your phone.

## 📱 API Endpoints

Your Flask backend now includes these WhatsApp endpoints:

### 1. Send Custom Message
```
POST /api/whatsapp/send-message
```

**Request Body:**
```json
{
  "phone": "+919876543210",
  "message": "Your custom message",
  "delay_minutes": 2,
  "instant": false
}
```

### 2. Order Created Notification
```
POST /api/whatsapp/order-created
```

**Request Body:**
```json
{
  "client_name": "John Doe",
  "client_phone": "+919876543210",
  "order_id": "ORD123",
  "items": [
    {"name": "Hair Cut", "quantity": 1},
    {"name": "Hair Color", "quantity": 1}
  ],
  "total_amount": 2500.00
}
```

### 3. Order Updated Notification
```
POST /api/whatsapp/order-updated
```

**Request Body:**
```json
{
  "client_name": "John Doe",
  "client_phone": "+919876543210",
  "order_id": "ORD123",
  "status": "Completed",
  "items": [] // optional
}
```

### 4. Order Cancelled Notification
```
POST /api/whatsapp/order-deleted
```

**Request Body:**
```json
{
  "client_name": "John Doe",
  "client_phone": "+919876543210",
  "order_id": "ORD123",
  "reason": "Client request" // optional
}
```

### 5. Appointment Reminder
```
POST /api/whatsapp/appointment-reminder
```

**Request Body:**
```json
{
  "client_name": "John Doe",
  "client_phone": "+919876543210",
  "service": "Hair Cut & Style",
  "date": "15/12/2024",
  "time": "2:30 PM"
}
```

### 6. Inventory Alert
```
POST /api/whatsapp/inventory-alert
```

**Request Body:**
```json
{
  "manager_phone": "+919876543210",
  "item_name": "Hair Shampoo",
  "current_stock": 2,
  "min_threshold": 10
}
```

### 7. Client Welcome
```
POST /api/whatsapp/client-welcome
```

**Request Body:**
```json
{
  "client_name": "John Doe",
  "client_phone": "+919876543210"
}
```

## 💻 React Integration Examples

### Order Creation Hook

```javascript
// hooks/useWhatsAppNotifications.js
import { useState } from 'react';

export const useWhatsAppNotifications = () => {
  const [loading, setLoading] = useState(false);

  const sendOrderCreatedNotification = async (orderData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/order-created', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_name: orderData.clientName,
          client_phone: orderData.clientPhone,
          order_id: orderData.orderId,
          items: orderData.items,
          total_amount: orderData.totalAmount
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ WhatsApp notification sent successfully');
        return { success: true, data: result };
      } else {
        console.error('❌ WhatsApp notification failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const sendOrderUpdateNotification = async (orderData) => {
    // Similar implementation for order updates
  };

  const sendAppointmentReminder = async (appointmentData) => {
    // Similar implementation for appointment reminders
  };

  return {
    sendOrderCreatedNotification,
    sendOrderUpdateNotification,
    sendAppointmentReminder,
    loading
  };
};
```

### Usage in Components

```javascript
// components/CreateOrder.jsx
import { useWhatsAppNotifications } from '../hooks/useWhatsAppNotifications';

const CreateOrder = () => {
  const { sendOrderCreatedNotification, loading } = useWhatsAppNotifications();

  const handleCreateOrder = async (orderData) => {
    try {
      // Create order in your database
      const order = await createOrder(orderData);
      
      // Send WhatsApp notification
      if (orderData.clientPhone) {
        const notification = await sendOrderCreatedNotification({
          clientName: orderData.clientName,
          clientPhone: orderData.clientPhone,
          orderId: order.id,
          items: orderData.items,
          totalAmount: orderData.total
        });
        
        if (notification.success) {
          toast.success('Order created and notification sent!');
        } else {
          toast.warning('Order created but notification failed');
        }
      }
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  return (
    // Your component JSX
  );
};
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.whatsapp` file in your backend directory:

```env
# WhatsApp Configuration
WHATSAPP_ENABLED=true
WHATSAPP_DEFAULT_COUNTRY_CODE=+91
WHATSAPP_MESSAGE_DELAY_MINUTES=2
WHATSAPP_MANAGER_PHONE=+919876543210

# Salon Configuration
SALON_NAME=Your Salon Name
SALON_PHONE=+919876543210
SALON_ADDRESS=Your Address

# Business Hours
BUSINESS_START_HOUR=9
BUSINESS_END_HOUR=20
```

### Customizing Country Code

In `backend/whatsapp_service.py`, update the default country code:

```python
class WhatsAppService:
    def __init__(self):
        self.default_country_code = "+1"  # Change to your country code
        self.message_delay_minutes = 2
```

### Customizing Message Templates

Edit the templates in `backend/whatsapp_service.py` in the `SalonMessageTemplates` class:

```python
@staticmethod
def order_created(client_name: str, order_id: str, items: list, total_amount: float) -> str:
    """Customize this template as needed."""
    return f"""🎉 *Order Confirmed* 🎉

Dear {client_name},

Your order #{order_id} has been confirmed!
Total: ${total_amount:.2f}

Thank you for choosing our salon! 💄"""
```

## 🛠️ Troubleshooting

### Common Issues

1. **"CountryCodeException: Country code missing from phone no"**
   - **Solution**: Make sure phone numbers include country code (e.g., +919876543210)

2. **"Warning: INTERNET IS SLOW"**
   - **Solution**: Check your internet connection
   - **Alternative**: Increase the delay time

3. **Messages not sending**
   - **Check**: WhatsApp Web is logged in and tab is open
   - **Check**: Chrome browser is running
   - **Check**: Phone has internet connection
   - **Check**: Phone number format is correct

4. **"No such file or directory: chrome"**
   - **Solution**: Install Google Chrome browser
   - **Alternative**: Set Chrome path manually in the code

### Testing Commands

```bash
# Test WhatsApp service
curl -X GET http://localhost:5000/api/whatsapp/test

# Send test message
curl -X POST http://localhost:5000/api/whatsapp/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "message": "Test message from salon system"
  }'
```

### Debug Mode

Enable debug logging in your Flask app:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📊 Message Scheduling

### Scheduling Rules

1. **Minimum Delay**: 2 minutes from current time
2. **Format**: Messages use 24-hour format internally
3. **Timezone**: Uses system timezone
4. **Queue**: Messages are scheduled, not sent instantly

### Custom Scheduling

```javascript
// Schedule message for specific time
const scheduleMessage = async (phone, message, delayMinutes = 5) => {
  const response = await fetch('/api/whatsapp/send-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone,
      message,
      delay_minutes: delayMinutes
    })
  });
  return response.json();
};
```

## 🔒 Security Considerations

1. **Phone Number Validation**: Always validate phone numbers before sending
2. **Rate Limiting**: Implement rate limiting to prevent spam
3. **Environment Variables**: Store sensitive information in environment variables
4. **Error Handling**: Handle errors gracefully without exposing sensitive data

## 📈 Best Practices

1. **Keep WhatsApp Web Open**: Always keep the WhatsApp Web tab open
2. **Test Regularly**: Test the service regularly to ensure it's working
3. **Monitor Logs**: Check logs for any errors or issues
4. **Backup Authentication**: Have a backup plan if WhatsApp Web session expires
5. **User Consent**: Always get user consent before sending WhatsApp messages

## 🆘 Support

If you encounter issues:

1. **Check the logs** in your Flask console
2. **Verify WhatsApp Web** is logged in
3. **Test with a simple message** first
4. **Check phone number format**
5. **Ensure Chrome browser is open**

## 🔄 Updates

To update PyWhatKit:

```bash
pip install --upgrade pywhatkit
```

Check for updates regularly as WhatsApp Web may change its interface.

---

## 📝 Example Full Integration

Here's a complete example of integrating WhatsApp notifications into your order creation flow:

```javascript
// services/whatsappService.js
class WhatsAppService {
  static async sendOrderNotification(orderData) {
    try {
      const response = await fetch('/api/whatsapp/order-created', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('WhatsApp notification failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// In your order creation component
const handleSubmitOrder = async (formData) => {
  try {
    // 1. Create order in database
    const order = await orderService.createOrder(formData);
    
    // 2. Send WhatsApp notification
    if (formData.clientPhone) {
      const notificationResult = await WhatsAppService.sendOrderNotification({
        client_name: formData.clientName,
        client_phone: formData.clientPhone,
        order_id: order.id,
        items: formData.items,
        total_amount: formData.totalAmount
      });
      
      if (notificationResult.success) {
        showSuccessMessage('Order created and client notified via WhatsApp!');
      } else {
        showWarningMessage('Order created but WhatsApp notification failed');
      }
    }
    
  } catch (error) {
    showErrorMessage('Failed to create order');
  }
};
```

This setup provides a complete WhatsApp automation solution for your salon management system! 🎉 
# 🚀 Complete WhatsApp Automation Setup Guide

## 📋 Overview

This guide provides complete setup and usage instructions for the WhatsApp automation system integrated into your salon management software. The system uses Selenium WebDriver to automate WhatsApp Web for sending notifications about orders, appointments, inventory, and client communications.

## 🎯 Features

- ✅ **Order Notifications**: Automatic WhatsApp messages for order creation, updates, and cancellations
- ✅ **Appointment Reminders**: Scheduled appointment notifications for clients
- ✅ **Inventory Alerts**: Low stock notifications for managers
- ✅ **Client Welcome**: Welcome messages for new clients
- ✅ **Custom Messages**: Send any custom WhatsApp message through the API
- ✅ **React Integration**: Pre-built hooks and components for easy frontend integration

## 🛠️ Prerequisites

1. **Python 3.7+** installed on your system
2. **Google Chrome** browser installed and accessible
3. **WhatsApp** account with access to WhatsApp Web
4. **Phone with internet connection** (for WhatsApp Web authentication)
5. **Node.js and npm/yarn** (for React frontend)

## 🚀 Quick Setup

### Step 1: Environment Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Step 2: Run Setup Script

```bash
python whatsapp_setup.py
```

This script will:
- ✅ Check Python version
- ✅ Install required packages
- ✅ Verify Chrome browser
- ✅ Guide you through WhatsApp Web setup
- ✅ Test functionality
- ✅ Create configuration files

### Step 3: Manual Dependency Installation (if needed)

If the setup script doesn't work, install dependencies manually:

```bash
pip install flask>=3.1.1 selenium>=4.33.0 webdriver-manager>=4.0.2 requests flask-cors mysql-connector-python pandas numpy openpyxl xlrd gunicorn
```

### Step 4: Start the Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## 🧪 Testing the Setup

### Option 1: Using the Test Script

```bash
python test_whatsapp.py
```

This interactive script allows you to test:
- WhatsApp service connectivity
- Send custom messages
- Order notifications
- Appointment reminders

### Option 2: Manual API Testing

```bash
# Test if server is running
curl -X GET http://localhost:5000/api/whatsapp/test

# Initialize WhatsApp Web
curl -X POST http://localhost:5000/api/whatsapp/login

# Send a test message
curl -X POST http://localhost:5000/api/whatsapp/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "message": "Test message from salon system"
  }'
```

## 📱 API Endpoints Reference

### 1. Service Management

#### Test Service
```
GET /api/whatsapp/test
```

#### Initialize WhatsApp Web
```
POST /api/whatsapp/login
```

#### Send Custom Message
```
POST /api/whatsapp/send-message
```
**Body:**
```json
{
  "phone": "+919876543210",
  "message": "Your custom message"
}
```

### 2. Order Notifications

#### Order Created
```
POST /api/whatsapp/order-created
```
**Body:**
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

#### Order Updated
```
POST /api/whatsapp/order-updated
```
**Body:**
```json
{
  "client_name": "John Doe",
  "client_phone": "+919876543210",
  "order_id": "ORD123", 
  "status": "Completed",
  "items": [] // optional
}
```

#### Order Cancelled
```
POST /api/whatsapp/order-deleted
```
**Body:**
```json
{
  "client_name": "John Doe",
  "client_phone": "+919876543210",
  "order_id": "ORD123",
  "reason": "Client request" // optional
}
```

### 3. Appointment Management

#### Appointment Reminder
```
POST /api/whatsapp/appointment-reminder
```
**Body:**
```json
{
  "client_name": "John Doe",
  "client_phone": "+919876543210",
  "service": "Hair Cut & Style",
  "date": "15/12/2024",
  "time": "2:30 PM"
}
```

### 4. Inventory & Client Management

#### Inventory Alert
```
POST /api/whatsapp/inventory-alert
```
**Body:**
```json
{
  "manager_phone": "+919876543210",
  "item_name": "Hair Shampoo",
  "current_stock": 2,
  "min_threshold": 10
}
```

#### Client Welcome
```
POST /api/whatsapp/client-welcome
```
**Body:**
```json
{
  "client_name": "John Doe",
  "client_phone": "+919876543210"
}
```

## 💻 React Integration

### Using the React Hook

```javascript
import { useWhatsAppNotifications } from '../hooks/useWhatsAppNotifications';

const OrderComponent = () => {
  const { sendOrderCreatedNotification, loading, error } = useWhatsAppNotifications();

  const handleCreateOrder = async (orderData) => {
    // Create order logic...
    
    // Send WhatsApp notification
    const result = await sendOrderCreatedNotification({
      clientName: orderData.clientName,
      clientPhone: orderData.clientPhone,
      orderId: orderData.id,
      items: orderData.items,
      totalAmount: orderData.total
    });

    if (result.success) {
      console.log('✅ WhatsApp notification sent!');
    } else {
      console.error('❌ WhatsApp notification failed:', result.error);
    }
  };

  return (
    <div>
      {loading && <p>Sending WhatsApp notification...</p>}
      {error && <p>Error: {error}</p>}
      {/* Your component JSX */}
    </div>
  );
};
```

### Available Hook Functions

```javascript
const {
  // Order notifications
  sendOrderCreatedNotification,
  sendOrderUpdateNotification, 
  sendOrderDeletedNotification,
  
  // Appointment management
  sendAppointmentReminder,
  
  // Inventory & client management
  sendInventoryAlert,
  sendClientWelcome,
  
  // Custom messaging
  sendCustomMessage,
  
  // Service management
  initializeWhatsApp,
  testWhatsApp,
  
  // State
  loading,
  error,
  clearError
} = useWhatsAppNotifications();
```

## ⚙️ Configuration

### Environment Variables

Create `.env.whatsapp` file in the backend directory:

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

In `backend/whatsapp_service_selenium.py`:

```python
class WhatsAppSeleniumService:
    def __init__(self):
        self.default_country_code = "+1"  # Change to your country code
```

### Customizing Message Templates

Edit templates in `backend/whatsapp_service_selenium.py`:

```python
@staticmethod
def order_created(client_name: str, order_id: str, items: list, total_amount: float) -> str:
    # Customize this template
    return f"""🎉 *Order Confirmed* 🎉
    
Dear {client_name},
Your order #{order_id} has been confirmed!
Total: ${total_amount:.2f}

Thank you! 💄"""
```

## 🔧 Troubleshooting

### Common Issues

1. **"Chrome driver not found"**
   - **Solution**: The script automatically downloads ChromeDriver
   - **Manual fix**: Install Chrome browser or update to latest version

2. **"WhatsApp Web login failed"**
   - **Solution**: 
     - Open Chrome manually
     - Go to web.whatsapp.com
     - Scan QR code
     - Check "Keep me signed in"
     - Keep browser open

3. **"Phone number format error"**
   - **Solution**: Always include country code (e.g., +919876543210)
   - **Format**: +[country_code][phone_number]

4. **"Message sending timeout"**
   - **Check**: Internet connection
   - **Check**: WhatsApp Web is logged in
   - **Check**: Chrome browser is running

5. **"Flask server not starting"**
   - **Check**: Virtual environment is activated
   - **Check**: All dependencies are installed
   - **Run**: `pip install -r requirements.txt`

### Debug Commands

```bash
# Check if dependencies are installed
pip list | grep selenium

# Test Python imports
python -c "from whatsapp_service_selenium import WhatsAppSeleniumService; print('✅ Imports OK')"

# Check Chrome version
google-chrome --version  # Linux
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --version  # macOS

# Test Flask app loading
python -c "import app; print('✅ Flask app OK')"
```

### Log Analysis

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

Common log messages:
- `✅ Chrome driver setup successful` - Driver working
- `📱 Please scan the QR code` - Waiting for QR scan
- `✅ Successfully logged in to WhatsApp Web` - Login complete
- `📤 Sending message to [number]` - Message being sent

## 📊 Best Practices

### 1. **Phone Number Management**
- Always validate phone numbers
- Store numbers with country codes
- Handle international formats properly

### 2. **Message Scheduling**
- Don't send messages too frequently (respect rate limits)
- Schedule reminders at appropriate times
- Consider time zones for international clients

### 3. **Error Handling**
- Always check API response status
- Implement retry logic for failed messages
- Log errors for debugging

### 4. **Security**
- Keep WhatsApp Web session secure
- Don't share browser profile
- Use environment variables for sensitive data

### 5. **Performance**
- Keep browser session alive
- Reuse WhatsApp service instance
- Monitor memory usage

## 🔄 Maintenance

### Regular Tasks

1. **Update Chrome Browser**: Keep Chrome updated for compatibility
2. **Monitor Sessions**: Check if WhatsApp Web session is still active
3. **Check Logs**: Review error logs regularly
4. **Update Dependencies**: Keep Python packages updated

### Updating Dependencies

```bash
pip install --upgrade selenium webdriver-manager flask
```

### Session Management

- WhatsApp Web sessions expire after ~1 week of inactivity
- Browser profile is saved in `~/whatsapp_chrome_profile`
- Re-scan QR code if session expires

## 🆘 Support & Resources

### Getting Help

1. **Check logs** in Flask console output
2. **Test with simple message** first
3. **Verify all prerequisites** are met
4. **Check browser console** for JavaScript errors

### Useful Resources

- [Selenium Documentation](https://selenium-python.readthedocs.io/)
- [WhatsApp Web](https://web.whatsapp.com)
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools)

### Error Reporting

When reporting issues, include:
- Python version
- Chrome version  
- Operating system
- Error logs
- Steps to reproduce

---

## 🎉 Success! Your WhatsApp automation is ready!

Your salon management system now has complete WhatsApp automation capabilities. You can:

✅ Send automatic order notifications  
✅ Schedule appointment reminders  
✅ Alert managers about low inventory  
✅ Welcome new clients  
✅ Send custom messages through your React app  

**Next Steps:**
1. Integrate WhatsApp calls into your existing order/appointment creation flows
2. Set up inventory monitoring to trigger low stock alerts
3. Customize message templates for your salon's branding
4. Train your team on using the new notification features

**Happy messaging! 📱💕** 
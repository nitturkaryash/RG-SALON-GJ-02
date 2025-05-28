# WhatsApp Integration

This folder contains all WhatsApp-related functionality for the salon management system, organized into two separate implementations:

## Folder Structure

```
src/whatsapp/
├── business-api/          # Facebook Business Manager WhatsApp API
│   ├── components/        # React components for Business API
│   ├── services/         # Business API services
│   ├── utils/           # Automation and utilities
│   └── index.ts         # Main exports
├── open-source/          # Open source WhatsApp Web automation
│   ├── components/       # React components for open source
│   ├── services/        # Selenium and web automation services
│   ├── utils/          # Utilities and helpers
│   └── index.ts        # Main exports
├── shared/              # Shared types and components
│   ├── components/      # Common UI components
│   └── types/          # TypeScript interfaces
└── index.ts            # Main entry point with factory functions
```

## 🏢 Business API Implementation (`business-api/`)

**Official Facebook Business Manager WhatsApp Business API**

### Features:
- Official WhatsApp Business API integration
- Template-based messaging
- High reliability and scalability
- Professional business features
- Webhook support for delivery status

### Key Files:
- `services/whatsappService.ts` - Core Business API service
- `utils/whatsappAutomation.ts` - CRUD automation system
- `components/AutomationSettings.tsx` - Configuration UI

### Usage:
```typescript
import { WhatsAppService, WhatsAppAutomation } from '@/whatsapp/business-api';

// Send appointment confirmation
await WhatsAppService.sendAppointmentConfirmation(
  phoneNumber,
  clientName,
  appointmentDate,
  services,
  stylist
);

// Handle automatic order creation message
await WhatsAppAutomation.handleOrderCreated(orderData);
```

## 🔓 Open Source Implementation (`open-source/`)

**WhatsApp Web automation using Selenium and other open source tools**

### Features:
- Free to use (no API costs)
- WhatsApp Web automation
- Selenium-based browser automation
- Python backend services
- Full message customization

### Key Files:
- `services/whatsappWebService.ts` - TypeScript WhatsApp Web service
- `services/whatsapp_service_selenium.py` - Python Selenium automation
- `services/whatsapp_service.py` - Python WhatsApp service
- `components/WhatsAppExample.jsx` - Example React component

### Usage:
```typescript
import { sendAppointmentNotification } from '@/whatsapp/open-source';

// Send appointment notification
await sendAppointmentNotification('created', appointmentData);
```

## 🔗 Shared Types (`shared/`)

Common TypeScript interfaces and types used by both implementations:

- `WhatsAppConfig` - Configuration interface
- `AppointmentData` - Appointment data structure
- `OrderData` - Order data structure
- `ClientData` - Client information
- `IWhatsAppService` - Service interface contract

## 🚀 Getting Started

### 1. Choose Your Implementation

```typescript
import { WhatsAppManager } from '@/whatsapp';

// Business API
const manager = new WhatsAppManager({
  provider: 'business-api',
  businessApi: {
    phoneNumberId: 'your_phone_number_id',
    accessToken: 'your_access_token',
    businessAccountId: 'your_business_account_id'
  }
});

// Open Source
const manager = new WhatsAppManager({
  provider: 'open-source',
  openSource: {
    headless: false,
    sessionPath: './whatsapp_session'
  }
});
```

### 2. Use Factory Functions

```typescript
import { getWhatsAppService } from '@/whatsapp';

// Dynamically import the service you need
const businessAPI = await getWhatsAppService('business-api');
const openSource = await getWhatsAppService('open-source');
```

### 3. Direct Imports

```typescript
// Business API
import { WhatsAppService } from '@/whatsapp/business-api';
import { WhatsAppAutomation } from '@/whatsapp/business-api';

// Open Source
import { sendAppointmentNotification } from '@/whatsapp/open-source';
```

## ⚙️ Configuration

### Business API Setup
1. Create a Facebook Business Manager account
2. Set up WhatsApp Business API
3. Get your credentials:
   - Phone Number ID
   - Access Token
   - Business Account ID
4. Configure message templates

### Open Source Setup
1. Install Python dependencies
2. Set up Chrome/Firefox with WebDriver
3. Configure session storage
4. Run initial WhatsApp Web login

## 🔄 Automatic CRUD Messaging

Both implementations support automatic WhatsApp messages for:

- ✅ **Order Created** - Confirmation when new order is placed
- 📝 **Order Updated** - Notification when order is modified
- ❌ **Order Deleted** - Cancellation message when order is removed
- 📅 **Appointment Created** - Confirmation for new appointments
- 🔄 **Appointment Updated** - Update notifications
- 🚫 **Appointment Cancelled** - Cancellation messages
- 📦 **Inventory Low Stock** - Manager alerts for low inventory
- 👋 **Client Welcome** - Welcome messages for new clients
- 💰 **Payment Received** - Payment confirmation messages

## 🎛️ Configuration Management

Use the automation settings to control which messages are sent:

```typescript
import { WhatsAppAutomation } from '@/whatsapp/business-api';

// Configure automation
WhatsAppAutomation.setConfig({
  enabled: true,
  messageTypes: {
    orderCreated: true,
    orderUpdated: false,
    appointmentCreated: true,
    // ... other options
  }
});
```

## 📱 API Routes

The system includes API routes for configuration management:

- `GET /api/whatsapp/config` - Get current configuration
- `POST /api/whatsapp/config` - Update configuration
- `PUT /api/whatsapp/config` - Reset to defaults

## 🔧 Environment Variables

### Business API
```env
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
```

### Open Source
```env
WHATSAPP_SESSION_PATH=./whatsapp_session
CHROME_DRIVER_PATH=/path/to/chromedriver
```

## 🧪 Testing

Test files are included for both implementations:

- `test-auto-messaging.js` - Test automation system
- Business API template testing
- Open source Selenium testing

## 📚 Documentation

For detailed implementation guides, see:
- `WHATSAPP-AUTO-MESSAGING-GUIDE.md` - Complete automation guide
- `WHATSAPP-COMPLETE-SETUP.md` - Setup instructions
- `WHATSAPP-MCP-SETUP.md` - MCP integration guide

## 🔄 Migration

If you're upgrading from the old structure:

1. Update your imports to use the new paths
2. Choose your preferred implementation
3. Update environment variables if needed
4. Test the new structure with your existing data

## 🛠️ Development

### Adding New Features

1. **Business API**: Add to `business-api/services/` or `business-api/utils/`
2. **Open Source**: Add to `open-source/services/` or `open-source/utils/`
3. **Shared**: Add common types to `shared/types/`

### Best Practices

- Use shared types for data consistency
- Implement the `IWhatsAppService` interface for new services
- Add proper error handling and logging
- Test both implementations when making changes
- Document new features and configuration options

## 🆘 Troubleshooting

### Business API Issues
- Check your access token validity
- Verify phone number ID is correct
- Ensure templates are approved in Facebook Business Manager
- Check rate limits and opt-in requirements

### Open Source Issues
- Verify WhatsApp Web is logged in
- Check Chrome/Firefox WebDriver compatibility
- Ensure session files have proper permissions
- Monitor for WhatsApp Web UI changes

## 📞 Support

For support with WhatsApp integration:
1. Check the error logs in browser console
2. Verify your configuration settings
3. Test with the included test scripts
 
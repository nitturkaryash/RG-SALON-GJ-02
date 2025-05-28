// Open Source WhatsApp Web Implementation
export * from './services/whatsappWebService';
export { default as WhatsAppExample } from './components/WhatsAppExample';

// Python services (for backend integration)
// Note: These are Python files, so they need to be imported differently in Node.js/Python contexts
export const PYTHON_SERVICES = {
  selenium: './services/whatsapp_service_selenium.py',
  service: './services/whatsapp_service.py'
};

// Re-export shared types
export type {
  WhatsAppConfig,
  ClientData,
  ServiceData,
  StylistData,
  AppointmentData,
  OrderData,
  InventoryData,
  MessageTemplate,
  WhatsAppMessage,
  WhatsAppResponse,
  IWhatsAppService
} from '../shared/types'; 
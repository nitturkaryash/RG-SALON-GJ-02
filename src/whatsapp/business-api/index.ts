// Facebook Business Manager WhatsApp API Implementation
export { WhatsAppService } from './services/whatsappService';
export { WhatsAppAutomation } from './utils/whatsappAutomation';
export { default as AutomationSettings } from './components/AutomationSettings';

export type {
  AutoMessageConfig,
  OrderData,
  AppointmentData,
  InventoryAlertData
} from './utils/whatsappAutomation';

// Re-export shared types
export type {
  WhatsAppConfig,
  ClientData,
  ServiceData,
  StylistData,
  WhatsAppMessage,
  WhatsAppResponse,
  IWhatsAppService
} from '../shared/types'; 
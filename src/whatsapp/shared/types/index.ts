// Shared types for both WhatsApp implementations

export interface WhatsAppConfig {
  enabled: boolean;
  provider: 'business-api' | 'open-source';
  phoneNumberId?: string;
  accessToken?: string;
  businessAccountId?: string;
}

export interface ClientData {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
}

export interface ServiceData {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
}

export interface StylistData {
  id: string;
  name: string;
}

export interface AppointmentData {
  id: string;
  client: ClientData;
  start_time: string;
  end_time?: string;
  services: ServiceData[];
  stylists: StylistData[];
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  total_amount?: number;
  notes?: string;
}

export interface OrderData {
  id: string;
  client_name: string;
  client_phone?: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    type: 'product' | 'service';
  }>;
  total_amount: number;
  payment_method: string;
  status: string;
  stylist?: string;
  created_at: string;
}

export interface InventoryData {
  product_id: string;
  product_name: string;
  current_stock: number;
  min_threshold: number;
  max_threshold?: number;
  cost_price?: number;
  selling_price?: number;
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: 'appointment' | 'order' | 'reminder' | 'welcome' | 'alert';
  content: string;
  variables: string[];
}

export interface WhatsAppMessage {
  to: string;
  from?: string;
  message: string;
  template?: MessageTemplate;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface WhatsAppResponse {
  success: boolean;
  message_id?: string;
  error?: string;
  timestamp: Date;
}

// Automation configuration
export interface AutoMessageConfig {
  enabled: boolean;
  messageTypes: {
    orderCreated: boolean;
    orderUpdated: boolean;
    orderDeleted: boolean;
    appointmentCreated: boolean;
    appointmentUpdated: boolean;
    appointmentCancelled: boolean;
    inventoryLow: boolean;
    clientWelcome: boolean;
    paymentReceived: boolean;
    appointmentReminder: boolean;
  };
  reminderSettings: {
    enabled: boolean;
    schedules: Array<{
      type: '24h' | '2h' | '30min';
      enabled: boolean;
    }>;
  };
}

// Common service interface that both implementations should follow
export interface IWhatsAppService {
  sendAppointmentConfirmation(data: AppointmentData): Promise<WhatsAppResponse>;
  sendAppointmentUpdate(data: AppointmentData, oldData: Partial<AppointmentData>): Promise<WhatsAppResponse>;
  sendAppointmentCancellation(data: AppointmentData): Promise<WhatsAppResponse>;
  sendAppointmentReminder(data: AppointmentData): Promise<WhatsAppResponse>;
  sendOrderConfirmation(data: OrderData): Promise<WhatsAppResponse>;
  sendWelcomeMessage(client: ClientData): Promise<WhatsAppResponse>;
  sendInventoryAlert(inventory: InventoryData, managerPhone: string): Promise<WhatsAppResponse>;
  sendCustomMessage(phoneNumber: string, message: string): Promise<WhatsAppResponse>;
  formatPhoneNumber(phoneNumber: string): string;
  validateConfig(): boolean;
} 
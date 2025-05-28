import { WhatsAppService } from '../whatsapp/business-api/services/whatsappService';

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
  };
}

export interface OrderData {
  id: string;
  client_name: string;
  client_phone?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    type: 'product' | 'service';
  }>;
  total_amount: number;
  payment_method: string;
  status: string;
  stylist?: string;
  created_at?: string;
}

export interface AppointmentData {
  id: string;
  client_name: string;
  client_phone?: string;
  start_time: string;
  services: Array<{
    name: string;
    duration: number;
    price: number;
  }>;
  stylist: string;
  status: string;
  total_amount?: number;
}

export interface InventoryAlertData {
  product_name: string;
  current_stock: number;
  min_threshold: number;
  manager_phone: string;
}

export class WhatsAppAutomation {
  private static config: AutoMessageConfig = {
    enabled: true,
    messageTypes: {
      orderCreated: true,
      orderUpdated: true,
      orderDeleted: true,
      appointmentCreated: true,
      appointmentUpdated: true,
      appointmentCancelled: true,
      inventoryLow: true,
      clientWelcome: true,
      paymentReceived: true,
    }
  };

  static setConfig(config: Partial<AutoMessageConfig>) {
    this.config = { ...this.config, ...config };
  }

  static getConfig(): AutoMessageConfig {
    return this.config;
  }

  // ORDER CRUD AUTO-MESSAGES
  static async handleOrderCreated(orderData: OrderData): Promise<boolean> {
    if (!this.config.enabled || !this.config.messageTypes.orderCreated) {
      console.log('Order created auto-messaging is disabled');
      return false;
    }

    if (!orderData.client_phone) {
      console.log('No phone number provided for order created message');
      return false;
    }

    try {
      const services = orderData.items.map(item => ({
        name: item.name,
        price: item.price,
        duration: item.type === 'service' ? 30 : 0 // Default duration for services
      }));

      await WhatsAppService.sendAppointmentConfirmation(
        orderData.client_phone,
        orderData.client_name,
        new Date(orderData.created_at || new Date()),
        services,
        orderData.stylist || 'Salon Team'
      );

      console.log(`✅ Order created message sent to ${orderData.client_name}`);
      return true;
    } catch (error) {
      console.error('Error sending order created message:', error);
      return false;
    }
  }

  static async handleOrderUpdated(orderData: OrderData, changes: Partial<OrderData>): Promise<boolean> {
    if (!this.config.enabled || !this.config.messageTypes.orderUpdated) {
      return false;
    }

    if (!orderData.client_phone) {
      return false;
    }

    try {
      const services = orderData.items.map(item => ({
        name: item.name,
        price: item.price,
        duration: item.type === 'service' ? 30 : 0
      }));

      // For now, send a general update message
      // You can customize this based on what changed
      await WhatsAppService.sendAppointmentConfirmation(
        orderData.client_phone,
        orderData.client_name,
        new Date(),
        services,
        orderData.stylist || 'Salon Team'
      );

      console.log(`✅ Order updated message sent to ${orderData.client_name}`);
      return true;
    } catch (error) {
      console.error('Error sending order updated message:', error);
      return false;
    }
  }

  static async handleOrderDeleted(orderData: OrderData, reason?: string): Promise<boolean> {
    if (!this.config.enabled || !this.config.messageTypes.orderDeleted) {
      return false;
    }

    if (!orderData.client_phone) {
      return false;
    }

    try {
      await WhatsAppService.sendAppointmentCancellation(
        orderData.client_phone,
        orderData.client_name,
        new Date(orderData.created_at || new Date())
      );

      console.log(`✅ Order cancellation message sent to ${orderData.client_name}`);
      return true;
    } catch (error) {
      console.error('Error sending order cancellation message:', error);
      return false;
    }
  }

  // APPOINTMENT CRUD AUTO-MESSAGES
  static async handleAppointmentCreated(appointmentData: AppointmentData): Promise<boolean> {
    if (!this.config.enabled || !this.config.messageTypes.appointmentCreated) {
      return false;
    }

    if (!appointmentData.client_phone) {
      return false;
    }

    try {
      await WhatsAppService.sendAppointmentConfirmation(
        appointmentData.client_phone,
        appointmentData.client_name,
        new Date(appointmentData.start_time),
        appointmentData.services,
        appointmentData.stylist
      );

      console.log(`✅ Appointment created message sent to ${appointmentData.client_name}`);
      return true;
    } catch (error) {
      console.error('Error sending appointment created message:', error);
      return false;
    }
  }

  static async handleAppointmentUpdated(
    appointmentData: AppointmentData, 
    oldData: Partial<AppointmentData>
  ): Promise<boolean> {
    if (!this.config.enabled || !this.config.messageTypes.appointmentUpdated) {
      return false;
    }

    if (!appointmentData.client_phone) {
      return false;
    }

    try {
      if (oldData.start_time && oldData.start_time !== appointmentData.start_time) {
        // Time changed - send update message
        await WhatsAppService.sendAppointmentUpdate(
          appointmentData.client_phone,
          appointmentData.client_name,
          new Date(oldData.start_time),
          new Date(appointmentData.start_time),
          appointmentData.services,
          appointmentData.stylist,
          appointmentData.total_amount || 0
        );
      } else {
        // Other changes - send general confirmation
        await WhatsAppService.sendAppointmentConfirmation(
          appointmentData.client_phone,
          appointmentData.client_name,
          new Date(appointmentData.start_time),
          appointmentData.services,
          appointmentData.stylist
        );
      }

      console.log(`✅ Appointment updated message sent to ${appointmentData.client_name}`);
      return true;
    } catch (error) {
      console.error('Error sending appointment updated message:', error);
      return false;
    }
  }

  static async handleAppointmentCancelled(appointmentData: AppointmentData): Promise<boolean> {
    if (!this.config.enabled || !this.config.messageTypes.appointmentCancelled) {
      return false;
    }

    if (!appointmentData.client_phone) {
      return false;
    }

    try {
      await WhatsAppService.sendAppointmentCancellation(
        appointmentData.client_phone,
        appointmentData.client_name,
        new Date(appointmentData.start_time)
      );

      console.log(`✅ Appointment cancellation message sent to ${appointmentData.client_name}`);
      return true;
    } catch (error) {
      console.error('Error sending appointment cancellation message:', error);
      return false;
    }
  }

  // INVENTORY AUTO-MESSAGES
  static async handleInventoryLowStock(alertData: InventoryAlertData): Promise<boolean> {
    if (!this.config.enabled || !this.config.messageTypes.inventoryLow) {
      return false;
    }

    try {
      // Send inventory alert to manager
      const message = `🚨 *LOW STOCK ALERT*\n\nProduct: ${alertData.product_name}\nCurrent Stock: ${alertData.current_stock}\nMinimum Required: ${alertData.min_threshold}\n\nPlease reorder this item soon!`;
      
      // You'll need to implement a simple message sender for non-template messages
      // For now, we'll use the special offer template as a workaround
      await WhatsAppService.sendSpecialOffer(
        alertData.manager_phone,
        'Manager',
        `Low stock alert for ${alertData.product_name}. Current: ${alertData.current_stock}, Min: ${alertData.min_threshold}`,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      );

      console.log(`✅ Inventory alert sent for ${alertData.product_name}`);
      return true;
    } catch (error) {
      console.error('Error sending inventory alert:', error);
      return false;
    }
  }

  // CLIENT AUTO-MESSAGES
  static async handleClientWelcome(clientName: string, clientPhone: string): Promise<boolean> {
    if (!this.config.enabled || !this.config.messageTypes.clientWelcome) {
      return false;
    }

    try {
      await WhatsAppService.sendSpecialOffer(
        clientPhone,
        clientName,
        'Welcome to our salon! We offer premium hair, beauty, and wellness services.',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      );

      console.log(`✅ Welcome message sent to ${clientName}`);
      return true;
    } catch (error) {
      console.error('Error sending welcome message:', error);
      return false;
    }
  }

  // PAYMENT AUTO-MESSAGES
  static async handlePaymentReceived(
    clientName: string, 
    clientPhone: string, 
    amount: number, 
    paymentMethod: string
  ): Promise<boolean> {
    if (!this.config.enabled || !this.config.messageTypes.paymentReceived) {
      return false;
    }

    try {
      const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);

      await WhatsAppService.sendSpecialOffer(
        clientPhone,
        clientName,
        `Payment of ${formattedAmount} received via ${paymentMethod}. Thank you for your business!`,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      );

      console.log(`✅ Payment confirmation sent to ${clientName}`);
      return true;
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
      return false;
    }
  }

  // UTILITY METHODS
  static async sendCustomMessage(
    phoneNumber: string, 
    clientName: string, 
    message: string
  ): Promise<boolean> {
    try {
      await WhatsAppService.sendSpecialOffer(
        phoneNumber,
        clientName,
        message,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );
      
      console.log(`✅ Custom message sent to ${clientName}`);
      return true;
    } catch (error) {
      console.error('Error sending custom message:', error);
      return false;
    }
  }
}

export default WhatsAppAutomation; 
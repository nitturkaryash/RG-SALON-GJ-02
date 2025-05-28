import axios from 'axios';

interface WhatsAppMessage {
  to: string;
  template: {
    name: string;
    language: {
      code: string;
    };
    components: any[];
  };
}

const WHATSAPP_API_VERSION = 'v17.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export class WhatsAppService {
  private static formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If number doesn't start with country code (91), add it
    if (!cleaned.startsWith('91')) {
      return `91${cleaned}`;
    }
    
    return cleaned;
  }

  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  private static formatDate(date: Date): string {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private static formatTime(date: Date): string {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).toUpperCase();
  }

  private static formatDateTime(date: Date): string {
    return `${this.formatDate(date)} at ${this.formatTime(date)}`;
  }

  private static async sendMessage(message: WhatsAppMessage): Promise<any> {
    try {
      // Format the phone number before sending
      message.to = this.formatPhoneNumber(message.to);
      
      const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: message.to,
        type: "template",
        template: message.template
      };

      console.log('Sending WhatsApp message with payload:', JSON.stringify(payload, null, 2));
      
      const response = await axios.post(
        `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          }
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorCode = error.response?.data?.error?.code;
        const errorMessage = error.response?.data?.error?.message;
        
        // Handle specific WhatsApp API errors
        switch (errorCode) {
          case 132000:
            throw new Error(`WhatsApp opt-in required: The recipient (${message.to}) needs to message the business first. Please ask the client to send a message to our WhatsApp business number.`);
          case 131047:
            throw new Error(`Template error: ${errorMessage}. Please check if the template parameters are correct.`);
          case 130429:
            throw new Error('Rate limit exceeded. Please try again later.');
          case 100:
            throw new Error(`Invalid parameter: ${errorMessage}. Please check the phone number format and other parameters.`);
          default:
            throw new Error(`WhatsApp API error (${errorCode}): ${errorMessage}`);
        }
      }
      throw error;
    }
  }

  static async sendAppointmentConfirmation(
    phoneNumber: string,
    clientName: string,
    appointmentDate: Date,
    services: { name: string; price: number; duration: number }[],
    stylist: string
  ) {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      template: {
        name: 'appointment_confirm',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: clientName },
              { type: 'text', text: this.formatDateTime(appointmentDate) },
              { type: 'text', text: services[0].name },
              { type: 'text', text: stylist },
              { type: 'text', text: this.formatCurrency(services[0].price) }
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }

  static async sendSpecialOffer(
    phoneNumber: string,
    clientName: string,
    offerDetails: string,
    validUntil: Date
  ) {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      template: {
        name: 'rg_salon_special_offer',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: clientName },
              { type: 'text', text: offerDetails },
              { type: 'text', text: this.formatDate(validUntil) }
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }

  static async sendAppointmentUpdate(
    phoneNumber: string,
    clientName: string,
    oldDate: Date,
    newDate: Date,
    services: { name: string; price: number; duration: number }[],
    stylist: string,
    totalAmount: number
  ) {
    const serviceText = `${services[0].name} (${services[0].duration} min) - ${this.formatCurrency(services[0].price)}`;

    const message: WhatsAppMessage = {
      to: phoneNumber,
      template: {
        name: 'appointment_updation',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: clientName },
              { type: 'text', text: `${this.formatDate(oldDate)} at ${this.formatTime(oldDate)}` },
              { type: 'text', text: `${this.formatDate(newDate)} at ${this.formatTime(newDate)}` },
              { type: 'text', text: serviceText },
              { type: 'text', text: stylist },
              { type: 'text', text: this.formatCurrency(totalAmount) }
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }

  static async sendAppointmentReminder(
    phoneNumber: string,
    clientName: string,
    appointmentDate: Date,
    services: { name: string; price: number; duration: number }[]
  ) {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      template: {
        name: 'appointment_reminder',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: clientName },
              { type: 'text', text: this.formatDateTime(appointmentDate) },
              { type: 'text', text: services[0].name }
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }

  static async sendAppointmentCancellation(
    phoneNumber: string,
    clientName: string,
    appointmentDate: Date
  ) {
    // For cancellation, we'll use the special offer template with cancellation message
    const message: WhatsAppMessage = {
      to: phoneNumber,
      template: {
        name: 'rg_salon_special_offer',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: clientName },
              { type: 'text', text: `Your appointment scheduled for ${this.formatDateTime(appointmentDate)} has been cancelled. Please contact us to reschedule.` },
              { type: 'text', text: this.formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) } // 30 days from now
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }
}

export { WhatsAppService }; 
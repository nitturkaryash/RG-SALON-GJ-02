import axios from 'axios';
import { format } from 'date-fns';
import { AppointmentData, WhatsAppResponse } from '../../shared/types';

const WHATSAPP_API_VERSION = 'v17.0';

interface WhatsAppMessage {
  to: string;
  template: {
    name: string;
    language: {
      code: string;
    };
    components: {
      type: string;
      parameters: {
        type: string;
        text: string;
      }[];
    }[];
  };
}

export class WhatsAppService {
  private static formatPhoneNumber(phone: string): string {
    let formatted = phone.replace(/\D/g, '');
    if (!formatted.startsWith('91') && formatted.length === 10) {
      formatted = '91' + formatted;
    }
    return formatted;
  }

  private static formatDateTime(date: Date): string {
    return format(date, 'PPpp'); // e.g., "Apr 29, 2023, 3:00 PM"
  }

  private static formatDate(date: Date): string {
    return format(date, 'PPP'); // e.g., "April 29th, 2023"
  }

  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  private static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours} hr${hours > 1 ? 's' : ''} ${remainingMinutes > 0 ? `${remainingMinutes} min` : ''}`;
    }
    return `${remainingMinutes} min`;
  }

  private static formatServicesList(services: Array<{ name: string; price: number; duration: number }>): string {
    return services.map(service => 
      `- ${service.name} (${this.formatDuration(service.duration)}) - ${this.formatCurrency(service.price)}`
    ).join('\n');
  }

  private static async sendMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
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

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorCode = error.response?.data?.error?.code;
        const errorMessage = error.response?.data?.error?.message;
        
        // Handle specific WhatsApp API errors
        const errorResponse = {
          success: false,
          error: {
            code: errorCode,
            message: errorMessage
          }
        };

        switch (errorCode) {
          case 132000:
            errorResponse.error.message = `WhatsApp opt-in required: The recipient (${message.to}) needs to message the business first.`;
            break;
          case 131047:
            errorResponse.error.message = `Template error: ${errorMessage}. Please check template parameters.`;
            break;
          case 130429:
            errorResponse.error.message = 'Rate limit exceeded. Please try again later.';
            break;
          case 100:
            errorResponse.error.message = `Invalid parameter: ${errorMessage}. Please check phone number format.`;
            break;
        }
        
        return errorResponse;
      }
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      };
    }
  }

  static async sendTestMessage(phoneNumber: string): Promise<WhatsAppResponse> {
    const message = {
      to: phoneNumber,
      template: {
        name: 'test_message',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: '🎉 Hello! This is a test message from RG Salon\'s WhatsApp integration. If you receive this, our messaging system is working correctly! 💈' }
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }

  static async sendAppointmentConfirmation(appointment: AppointmentData): Promise<WhatsAppResponse> {
    const message: WhatsAppMessage = {
      to: appointment.client.phone,
      template: {
        name: 'appointment_confirmation',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: appointment.client.name },
              { type: 'text', text: format(appointment.datetime, 'PPpp') },
              { type: 'text', text: appointment.stylist.name },
              { type: 'text', text: appointment.services.map(s => s.name).join(', ') },
              { type: 'text', text: format(appointment.services.reduce((total, s) => total + s.duration, 0), 'H:mm') },
              { type: 'text', text: appointment.services.reduce((total, s) => total + s.price, 0).toFixed(2) }
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }

  static async sendAppointmentReschedule(
    appointment: AppointmentData,
    oldDateTime: Date
  ): Promise<WhatsAppResponse> {
    const message: WhatsAppMessage = {
      to: appointment.client.phone,
      template: {
        name: 'appointment_reschedule',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: appointment.client.name },
              { type: 'text', text: format(oldDateTime, 'PPpp') },
              { type: 'text', text: format(appointment.datetime, 'PPpp') },
              { type: 'text', text: appointment.stylist.name },
              { type: 'text', text: appointment.services.map(s => s.name).join(', ') }
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }

  static async sendAppointmentReminder(appointment: AppointmentData): Promise<WhatsAppResponse> {
    const message: WhatsAppMessage = {
      to: appointment.client.phone,
      template: {
        name: 'appointment_reminder',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: appointment.client.name },
              { type: 'text', text: format(appointment.datetime, 'PPpp') },
              { type: 'text', text: appointment.services.map(s => s.name).join(', ') }
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }
} 
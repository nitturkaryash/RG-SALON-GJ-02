import axios from 'axios';

const WHATSAPP_API_VERSION = 'v17.0';
const PHONE_NUMBER_ID = '649515451575660';
const ACCESS_TOKEN = 'EAAQjirsfZCZCcBO3vcBGSRYdtVgGbD3J07UkZC9bEsaE2F6xIiWLjP38fSFnY13gdxdSvlkOhFphneOrULcZB4Q8v9yKDW4xKm4FOIxHYSuGs31ebx7XJuUh4FadR8nncvkNJe2rwlfPCzETFdzdEOeuOO8JvzbTug7LWrn6n0OiWTNZCBYmDSjlhnyoOUZBQnmgZDZD';
const API_BASE_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${PHONE_NUMBER_ID}`;

export class WhatsAppService {
  static formatPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If number doesn't start with country code (91), add it
    if (!cleaned.startsWith('91')) {
      return `91${cleaned}`;
    }
    
    return cleaned;
  }

  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  static formatDateTime(date) {
    return date.toLocaleString('en-IN', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  }

  static async sendMessage(message) {
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
        `${API_BASE_URL}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('WhatsApp API Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      // Enhanced error handling
      const errorDetails = {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        error_code: error.response?.data?.error?.code,
        error_subcode: error.response?.data?.error?.error_subcode,
        message: error.response?.data?.error?.message
      };

      console.error('WhatsApp API Error Details:', errorDetails);

      // Handle specific error cases
      if (errorDetails.error_code === 131047) {
        throw new Error('Message template not approved or invalid');
      } else if (errorDetails.error_code === 131026) {
        throw new Error('Message template name is invalid');
      } else if (errorDetails.error_code === 132000) {
        throw new Error('Recipient number is not opted in. Please ask them to message your business first.');
      }

      throw new Error(`Failed to send WhatsApp message: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  static async sendAppointmentConfirmation(
    phoneNumber,
    clientName,
    appointmentDate,
    services,
    stylist
  ) {
    const message = {
      to: phoneNumber,
      template: {
        name: 'appointment_confirm',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: clientName },
              { type: 'text', text: this.formatDate(appointmentDate) },
              { type: 'text', text: this.formatTime(appointmentDate) },
              { type: 'text', text: services[0].name },
              { type: 'text', text: stylist }
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }

  static async sendSpecialOffer(
    phoneNumber,
    clientName,
    offerDetails,
    validUntil
  ) {
    const message = {
      to: phoneNumber,
      template: {
        name: 'rg_salon_service_update',
        language: { code: 'en' },
        components: [
          {
            type: 'header'
          },
          {
            type: 'body',
            parameters: [
              { type: 'text', text: clientName },
              { type: 'text', text: offerDetails },
              { type: 'text', text: this.formatDateTime(validUntil) }
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }

  static async sendAppointmentUpdate(
    phoneNumber,
    clientName,
    oldDate,
    newDate,
    services,
    stylist,
    totalAmount
  ) {
    const serviceText = `${services[0].name} (${services[0].duration} min) - ${this.formatCurrency(services[0].price)}`;

    const message = {
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
    phoneNumber,
    clientName,
    appointmentDate,
    services
  ) {
    const message = {
      to: phoneNumber,
      template: {
        name: 'salon_reminder',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: clientName },
              { type: 'text', text: this.formatDate(appointmentDate) },
              { type: 'text', text: this.formatTime(appointmentDate) },
              { type: 'text', text: services.map(s => s.name).join(', ') }
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }

  static async sendAppointmentReschedule(
    phoneNumber,
    clientName,
    oldDate,
    newDate,
    services
  ) {
    const message = {
      to: phoneNumber,
      template: {
        name: 'salon_reschedule',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: clientName },
              { type: 'text', text: this.formatDate(oldDate) },
              { type: 'text', text: this.formatTime(oldDate) },
              { type: 'text', text: this.formatDate(newDate) },
              { type: 'text', text: this.formatTime(newDate) },
              { type: 'text', text: services.map(s => s.name).join(', ') }
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }

  static async sendAppointmentCancellation(
    phoneNumber,
    clientName,
    appointmentDate,
    services
  ) {
    const message = {
      to: phoneNumber,
      template: {
        name: 'salon_cancel',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: clientName },
              { type: 'text', text: this.formatDate(appointmentDate) },
              { type: 'text', text: this.formatTime(appointmentDate) },
              { type: 'text', text: services.map(s => s.name).join(', ') }
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }

  static async sendTimingUpdate(
    phoneNumber,
    clientName,
    timingDetails,
    effectiveDate,
    additionalNote
  ) {
    const message = {
      to: phoneNumber,
      template: {
        name: 'rg_salon_timing_update',
        language: { code: 'en' },
        components: [
          {
            type: 'header'
          },
          {
            type: 'body',
            parameters: [
              { type: 'text', text: clientName },
              { type: 'text', text: timingDetails },
              { type: 'text', text: this.formatDateTime(effectiveDate) },
              { type: 'text', text: additionalNote }
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }

  static async sendSafetyUpdate(
    phoneNumber,
    clientName,
    safetyMeasures,
    implementationDate,
    additionalInfo
  ) {
    const message = {
      to: phoneNumber,
      template: {
        name: 'rg_salon_safety_update',
        language: { code: 'en' },
        components: [
          {
            type: 'header'
          },
          {
            type: 'body',
            parameters: [
              { type: 'text', text: clientName },
              { type: 'text', text: safetyMeasures },
              { type: 'text', text: this.formatDateTime(implementationDate) },
              { type: 'text', text: additionalInfo }
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }

  static async sendNewServiceUpdate(
    phoneNumber,
    clientName,
    serviceName,
    duration,
    serviceDetails
  ) {
    const message = {
      to: phoneNumber,
      template: {
        name: 'rg_salon_new_service',
        language: { code: 'en' },
        components: [
          {
            type: 'header'
          },
          {
            type: 'body',
            parameters: [
              { type: 'text', text: clientName },
              { type: 'text', text: serviceName },
              { type: 'text', text: duration },
              { type: 'text', text: serviceDetails }
            ]
          }
        ]
      }
    };

    return this.sendMessage(message);
  }

  // Helper methods for date formatting
  static formatDate(date) {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  static formatTime(date) {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
} 
import { useCallback } from 'react';
import { WhatsAppService } from '../../utils/whatsappService';
import { toast } from 'react-toastify';

// Define the appointment data interface to match what we expect
interface AppointmentData {
  client: {
    name: string;
    phone: string;
  };
  datetime: Date;
  stylist: {
    name: string;
  };
  services: Array<{
    name: string;
    price: number;
    duration: number;
  }>;
}

export const useAppointmentNotifications = () => {
  const handleNotificationError = useCallback((error: any) => {
    console.error('WhatsApp notification error:', error);
    const errorMessage = error?.error?.message || 'Failed to send notification';
    toast.error(errorMessage);
  }, []);

  const sendConfirmationMessage = useCallback(
    async (appointment: AppointmentData) => {
      try {
        const response = await WhatsAppService.sendAppointmentConfirmation(
          appointment.client.phone,
          appointment.client.name,
          appointment.datetime,
          appointment.services,
          appointment.stylist.name
        );
        toast.success('Appointment confirmation sent successfully');
        return true;
      } catch (error) {
        handleNotificationError(error);
        return false;
      }
    },
    [handleNotificationError]
  );

  const sendRescheduleMessage = useCallback(
    async (appointment: AppointmentData, oldDateTime: Date) => {
      try {
        const response = await WhatsAppService.sendAppointmentUpdate(
          appointment.client.phone,
          appointment.client.name,
          oldDateTime,
          appointment.datetime,
          appointment.services,
          appointment.stylist.name
        );
        toast.success('Appointment reschedule notification sent successfully');
        return true;
      } catch (error) {
        handleNotificationError(error);
        return false;
      }
    },
    [handleNotificationError]
  );

  const sendCancellationMessage = useCallback(
    async (appointment: AppointmentData) => {
      try {
        const response = await WhatsAppService.sendAppointmentCancellation(
          appointment.client.phone,
          appointment.client.name,
          appointment.datetime
        );
        toast.success(
          'Appointment cancellation notification sent successfully'
        );
        return true;
      } catch (error) {
        handleNotificationError(error);
        return false;
      }
    },
    [handleNotificationError]
  );

  const sendReminderMessage = useCallback(
    async (appointment: AppointmentData) => {
      try {
        const response = await WhatsAppService.sendAppointmentReminder(
          appointment.client.phone,
          appointment.client.name,
          appointment.datetime,
          appointment.services
        );
        toast.success('Appointment reminder sent successfully');
        return true;
      } catch (error) {
        handleNotificationError(error);
        return false;
      }
    },
    [handleNotificationError]
  );

  return {
    sendConfirmationMessage,
    sendRescheduleMessage,
    sendCancellationMessage,
    sendReminderMessage,
  };
};

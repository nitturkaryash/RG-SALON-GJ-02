import { useCallback } from 'react';
import { WhatsAppService } from '../whatsapp/business-api/services/whatsappService';
import { AppointmentData } from '../whatsapp/shared/types';
import { toast } from 'react-hot-toast';

export const useAppointmentNotifications = () => {
  const handleNotificationError = useCallback((error: any) => {
    console.error('WhatsApp notification error:', error);
    const errorMessage = error?.error?.message || 'Failed to send notification';
    toast.error(errorMessage);
  }, []);

  const sendConfirmationMessage = useCallback(async (appointment: AppointmentData) => {
    try {
      const response = await WhatsAppService.sendAppointmentConfirmation(appointment);
      if (!response.success) {
        handleNotificationError(response);
        return false;
      }
      toast.success('Appointment confirmation sent successfully');
      return true;
    } catch (error) {
      handleNotificationError(error);
      return false;
    }
  }, [handleNotificationError]);

  const sendRescheduleMessage = useCallback(async (appointment: AppointmentData, oldDateTime: Date) => {
    try {
      const response = await WhatsAppService.sendAppointmentReschedule(appointment, oldDateTime);
      if (!response.success) {
        handleNotificationError(response);
        return false;
      }
      toast.success('Appointment reschedule notification sent successfully');
      return true;
    } catch (error) {
      handleNotificationError(error);
      return false;
    }
  }, [handleNotificationError]);

  const sendCancellationMessage = useCallback(async (appointment: AppointmentData) => {
    try {
      const response = await WhatsAppService.sendAppointmentCancellation(appointment);
      if (!response.success) {
        handleNotificationError(response);
        return false;
      }
      toast.success('Appointment cancellation notification sent successfully');
      return true;
    } catch (error) {
      handleNotificationError(error);
      return false;
    }
  }, [handleNotificationError]);

  const sendReminderMessage = useCallback(async (appointment: AppointmentData) => {
    try {
      const response = await WhatsAppService.sendAppointmentReminder(appointment);
      if (!response.success) {
        handleNotificationError(response);
        return false;
      }
      toast.success('Appointment reminder sent successfully');
      return true;
    } catch (error) {
      handleNotificationError(error);
      return false;
    }
  }, [handleNotificationError]);

  return {
    sendConfirmationMessage,
    sendRescheduleMessage,
    sendCancellationMessage,
    sendReminderMessage
  };
}; 
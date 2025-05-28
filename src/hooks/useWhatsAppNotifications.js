import { useState, useCallback } from 'react';

export const useWhatsAppNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = useCallback(async (endpoint, data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/whatsapp/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ WhatsApp notification sent successfully');
        return { success: true, data: result };
      } else {
        console.error('❌ WhatsApp notification failed:', result.error);
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const sendOrderCreatedNotification = useCallback(async (orderData) => {
    return await apiCall('order-created', {
      client_name: orderData.clientName,
      client_phone: orderData.clientPhone,
      order_id: orderData.orderId,
      items: orderData.items, // [{ name: "Product", quantity: 2 }]
      total_amount: orderData.totalAmount
    });
  }, [apiCall]);

  const sendOrderUpdateNotification = useCallback(async (orderData) => {
    return await apiCall('order-updated', {
      client_name: orderData.clientName,
      client_phone: orderData.clientPhone,
      order_id: orderData.orderId,
      status: orderData.newStatus, // e.g., "Completed", "In Progress"
      items: orderData.items // optional
    });
  }, [apiCall]);

  const sendOrderDeletedNotification = useCallback(async (orderData) => {
    return await apiCall('order-deleted', {
      client_name: orderData.clientName,
      client_phone: orderData.clientPhone,
      order_id: orderData.orderId,
      reason: orderData.reason // optional
    });
  }, [apiCall]);

  const sendAppointmentReminder = useCallback(async (appointmentData) => {
    return await apiCall('appointment-reminder', {
      client_name: appointmentData.clientName,
      client_phone: appointmentData.clientPhone,
      service: appointmentData.serviceName,
      date: appointmentData.date, // "15/12/2024"
      time: appointmentData.time  // "2:30 PM"
    });
  }, [apiCall]);

  const sendInventoryAlert = useCallback(async (inventoryData) => {
    return await apiCall('inventory-alert', {
      manager_phone: inventoryData.managerPhone,
      item_name: inventoryData.itemName,
      current_stock: inventoryData.currentStock,
      min_threshold: inventoryData.minThreshold
    });
  }, [apiCall]);

  const sendClientWelcome = useCallback(async (clientData) => {
    return await apiCall('client-welcome', {
      client_name: clientData.clientName,
      client_phone: clientData.clientPhone
    });
  }, [apiCall]);

  const sendCustomMessage = useCallback(async (messageData) => {
    return await apiCall('send-message', {
      phone: messageData.phone,
      message: messageData.message
    });
  }, [apiCall]);

  const initializeWhatsApp = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/whatsapp/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ WhatsApp initialized successfully');
        return { success: true, data: result };
      } else {
        console.error('❌ WhatsApp initialization failed:', result.error);
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const testWhatsApp = useCallback(async () => {
    try {
      const response = await fetch('/api/whatsapp/test');
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ WhatsApp test failed:', error);
      return { success: false, error: error.message };
    }
  }, []);

  return {
    // State
    loading,
    error,
    
    // Actions
    sendOrderCreatedNotification,
    sendOrderUpdateNotification,
    sendOrderDeletedNotification,
    sendAppointmentReminder,
    sendInventoryAlert,
    sendClientWelcome,
    sendCustomMessage,
    initializeWhatsApp,
    testWhatsApp,
    
    // Utilities
    clearError: () => setError(null)
  };
}; 
import { useQuery, useMutation, useQueryClient, UseQueryResult, UseQueryOptions, DefinedUseQueryResult, UndefinedInitialDataOptions, DefinedInitialDataOptions, QueryFunction, QueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import { updateProductInventory } from './useProducts'
import { useClients } from './useClients'
import { supabase, TABLES } from '../utils/supabase/supabaseClient'
import { generateInvoiceNumber } from '../lib/invoice'
import { useState, useEffect } from 'react'
import { recordSaleTransaction, syncToSalesHistory } from '../utils/salesUtils'

// Add window interface augmentation at the top of the file
declare global {
  interface Window {
    refreshInventoryConsumption?: () => void;
  }
}

// Extended payment method types to include BNPL
export const PAYMENT_METHODS = ['cash', 'credit_card', 'debit_card', 'upi', 'bnpl'] as const
export type PaymentMethod = typeof PAYMENT_METHODS[number]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  upi: 'UPI',
  bnpl: 'Buy Now Pay Later',
}

// Interface for payment details - used for split payments
export interface PaymentDetail {
  id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  payment_note?: string;
}

interface CreateOrderData {
  appointment_id?: string
  client_name: string
  stylist_id: string
  services: Array<{
    service_id: string;
    service_name: string;
    price: number;
    quantity?: number;
    gst_percentage?: number;
    type?: 'service' | 'product';
  }>
  total: number
  payment_method: PaymentMethod
  subtotal: number
  tax: number
  discount: number
  appointment_time?: string
  is_walk_in: boolean
  payments?: PaymentDetail[]
  pending_amount?: number
}

// Define a more accurate type for the data structure used in pos_orders table
// Based on usage in createWalkInOrder standalone function and potential Supabase schema
interface PosOrder {
  id: string;
  created_at: string;
  client_name: string;
  stylist_id: string | null;
  stylist_name: string;
  services: Array<{
    service_id: string;
    service_name: string;
    price: number;
    quantity?: number;
    gst_percentage?: number;
    type?: 'service' | 'product';
    hsn_code?: string;
    units?: string;
    batch?: string;
    expiry?: string;
    is_salon_consumption?: boolean;
    for_salon_use?: boolean;
    category?: string;
    purpose?: string | null;
  }>;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  payment_method: PaymentMethod;
  status: 'completed' | 'pending' | 'cancelled';
  appointment_time?: string;
  appointment_id?: string;
  is_walk_in: boolean;
  payments: PaymentDetail[];
  pending_amount: number;
  is_split_payment: boolean;
  is_salon_purchase?: boolean;
  customer_name?: string;
  order_date?: string;
  total_amount?: number;
  staff_id?: string | null;
  invoice_number?: string;
  is_salon_consumption?: boolean;
  consumption_purpose?: string | null;
  purchase_type?: string;
  order_type?: string;
  category?: string;
  salon_use?: boolean;
}

export const GST_RATE = 0.18 // 18% GST for salon services in India

// Service and Product interfaces for order creation
export interface ServiceItem {
  id: string;
  service_name?: string;
  name?: string;
  price: number;
  quantity?: number;
  gst_percentage?: number;
  hsn_code?: string;
  type: 'service';
}

export interface ProductItem {
  id: string;
  product_name?: string;
  name?: string;
  price: number;
  quantity?: number;
  gst_percentage?: number;
  hsn_code?: string;
  type: 'product';
  purpose?: string;
}

// Define product type interface
interface ProductWithStock {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  hsn_code?: string;
  units?: string;
  gst_percentage?: number;
  type: string;
  stock_status?: 'In Stock' | 'Out of Stock';
}

// Define cart item interface
interface CartItem {
  id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  type: string;
  hsn_code?: string;
  units?: string;
  gst_percentage?: number;
}

// Define OrderItem interface for inserting into pos_order_items
interface PosOrderItem {
  order_id: string;
  item_id?: string;
  item_name: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  type: 'service' | 'product' | string;
  hsn_code?: string;
  gst_percentage?: number;
  product_id?: string;
}

export function usePOS() {
  const queryClient = useQueryClient()
  const { updateClientFromOrder } = useClients()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<ProductWithStock[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Query for unpaid appointments
  // Define a type for the appointment data structure returned by the query
  type AppointmentData = {
    id: string;
    client_id: string;
    stylist_id: string;
    service_id: string;
    start_time: string;
    end_time: string;
    status: string;
    paid: boolean;
    clients: { full_name?: string; client_name?: string } | null;
    services: { name: string; price: number } | null;
    stylists: { name: string } | null;
  };

  const { data: unpaidAppointments, isLoading: loadingAppointments } = useQuery<AppointmentData[], Error>({
    queryKey: ['unpaid-appointments'],
    queryFn: async (): Promise<AppointmentData[]> => {
      try {
        // Directly query appointments without checking schema first
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            id,
            client_id,
            stylist_id,
            service_id,
            start_time,
            end_time,
            status,
            paid
          `)
          .eq('paid', false)
          .eq('status', 'completed');

        if (error) {
          console.error('Error fetching unpaid appointments:', error);
          return [];
        }
        
        // Skip if no data returned
        if (!data || data.length === 0) {
          return [];
        }
        
        // Now get related data separately
        const clientIds = [...new Set(data.filter(a => a.client_id).map(a => a.client_id))];
        const stylistIds = [...new Set(data.filter(a => a.stylist_id).map(a => a.stylist_id))];
        const serviceIds = [...new Set(data.filter(a => a.service_id).map(a => a.service_id))];
        
        // Fetch clients
        let clientData: any[] = [];
        if (clientIds.length > 0) {
          try {
            // First try with full_name
            const { data: clients, error: clientError } = await supabase
              .from('clients')
              .select('id, full_name')
              .in('id', clientIds);
              
            if (!clientError && clients && clients.length > 0) {
              clientData = clients;
            } else {
              // Try with client_name if full_name fails
              const { data: clientsAlt } = await supabase
                .from('clients')
                .select('id, client_name as full_name')
                .in('id', clientIds);
                
              clientData = clientsAlt || [];
            }
          } catch (e) {
            console.error('Error fetching clients for unpaid appointments:', e);
          }
        }
        
        // Fetch stylists
        let stylistData: any[] = [];
        if (stylistIds.length > 0) {
          try {
            const { data: stylists } = await supabase
              .from('stylists')
              .select('id, name')
              .in('id', stylistIds);
              
            stylistData = stylists || [];
          } catch (e) {
            console.error('Error fetching stylists for unpaid appointments:', e);
          }
        }
        
        // Fetch services
        let serviceData: any[] = [];
        if (serviceIds.length > 0) {
          try {
            const { data: services } = await supabase
              .from('services')
              .select('id, name, price')
              .in('id', serviceIds);
              
            serviceData = services || [];
          } catch (e) {
            console.error('Error fetching services for unpaid appointments:', e);
          }
        }
        
        // Merge the data
        return data.map(appointment => {
          const client = clientData.find(c => c.id === appointment.client_id);
          const stylist = stylistData.find(s => s.id === appointment.stylist_id);
          const service = serviceData.find(s => s.id === appointment.service_id);
          
          return {
            ...appointment,
            clients: client ? { full_name: client.full_name } : null,
            services: service ? { name: service?.name || 'Unknown Service', price: service?.price || 0 } : null,
            stylists: stylist ? { name: stylist?.name || 'Unknown Stylist' } : null
          };
        });
        
      } catch (error) {
        console.error('Error in unpaid appointments query:', error);
        return [];
      }
    },
    refetchOnWindowFocus: false
  })

  // Query for all orders
  const { data: orders, isLoading: loadingOrders } = useQuery<PosOrder[], Error>({
    queryKey: ['orders'],
    queryFn: async (): Promise<PosOrder[]> => {
      try {
        // Check if pos_orders table exists
        try {
          const { data, error } = await supabase
            .from('pos_orders')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (error) {
            console.error('Error fetching orders:', error);
            if (error.code === '42P01') {
              console.log('POS Orders table does not exist, returning empty array');
              return [];
            }
            throw error;
          }
          
          return (data as PosOrder[]) || [];
        } catch (e) {
          console.warn('Error with POS orders, returning empty array:', e);
          return [];
        }
      } catch (error) {
        console.error('Error in orders query:', error);
        return [];
      }
    },
    refetchOnWindowFocus: false
  })

  // Process payment for existing appointment with split payment support
  const processAppointmentPayment = useMutation<PosOrder, Error, CreateOrderData>({
    mutationFn: async (data: CreateOrderData): Promise<PosOrder> => {
      try {
        // Fix: Ensure unpaidAppointments is an array before using find
        const appointment = Array.isArray(unpaidAppointments)
          ? unpaidAppointments.find((a: AppointmentData) => a.id === data.appointment_id)
          : undefined;
        if (!appointment) {
          throw new Error('Appointment not found')
        }

        // Calculate total and pending amount
        const total = data.total || 0
        const pendingAmount = data.pending_amount || 0
        const isSplitPayment = pendingAmount > 0

        const newOrder: PosOrder = {
          id: uuidv4(),
          created_at: new Date().toISOString(),
          client_name: appointment.clients?.full_name || appointment.clients?.client_name || 'Unknown Client',
          stylist_id: appointment.stylist_id,
          stylist_name: appointment.stylists?.name || 'Unknown Stylist',
          services: [{
            service_id: appointment.service_id,
            service_name: appointment.services?.name || 'Unknown Service',
            price: appointment.services?.price || 0,
            type: 'service',
          }],
          total,
          subtotal: data.subtotal || total,
          tax: data.tax || 0,
          discount: data.discount || 0,
          payment_method: data.payment_method,
          status: isSplitPayment ? 'pending' : 'completed',
          appointment_id: data.appointment_id,
          appointment_time: appointment.start_time,
          is_walk_in: false,
          payments: data.payments || [{
            id: uuidv4(),
            amount: total - pendingAmount,
            payment_method: data.payment_method,
            payment_date: new Date().toISOString()
          }],
          pending_amount: pendingAmount,
          is_split_payment: isSplitPayment
        }

        const { appointment_time, ...orderForDb } = newOrder;

        try {
          const { data: createdOrderResult, error } = await supabase
            .from('pos_orders')
            .insert([orderForDb])
            .select('*')
            .single()
          const createdOrder = createdOrderResult as PosOrder;

          if (error) {
            console.error('Error creating order in database:', error)
            if (error.code === '42P01') {
              console.warn('pos_orders table does not exist, returning local order object')
              return newOrder as PosOrder
            }
            throw error
          }

          if (pendingAmount === 0 && data.appointment_id) {
            try {
              const { error: updateError } = await supabase
                .from('appointments')
                .update({ paid: true })
                .eq('id', data.appointment_id)
              if (updateError) {
                console.error('Error updating appointment payment status:', updateError)
              }
            } catch (updateErr) {
              console.warn('Error updating appointment payment status:', updateErr)
            }
          }
          return createdOrder
        } catch (dbError) {
          console.error('Database operation failed, returning local order object:', dbError)
          return newOrder as PosOrder
        }
      } catch (error) {
        console.error('Error processing appointment payment:', error)
        throw error instanceof Error ? error : new Error(String(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unpaid-appointments'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })

  // Create a walk-in order with split payment support
  const createWalkInOrder = useMutation<{
        success: boolean;
        order: PosOrder;
        error?: undefined;
    } | {
        success: boolean;
        error: Error;
        order?: undefined;
    }, Error, CreateOrderData>({
    mutationFn: async (data: CreateOrderData): Promise<{
            success: boolean;
            order: PosOrder;
        } | {
            success: boolean;
            error: Error;
        }> => {
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('🔍 usePOS - Received order data for processing:', data);
      data = JSON.parse(JSON.stringify(data));
      const stylistsData = queryClient.getQueryData<any[]>(['stylists']);
      const stylistName = stylistsData?.find(s => s.id === data.stylist_id)?.name || 'Unknown Stylist';
      const total = typeof data.total === 'number' ? data.total : 0;
      const subtotal = typeof data.subtotal === 'number' ? data.subtotal : 0;
      const tax = typeof data.tax === 'number' ? data.tax : 0;
      const discount = typeof data.discount === 'number' ? data.discount : 0;
      const totalInPaise = Math.round(total * 100);
      const subtotalInPaise = Math.round(subtotal * 100);
      const payments = data.payments || [];
      let totalPaidInPaise = 0;
      if (payments.length > 0) {
        totalPaidInPaise = payments.reduce((sum, payment) => {
          const paymentAmount = typeof payment.amount === 'number' ? payment.amount : 0;
          return sum + Math.round(paymentAmount * 100);
        }, 0);
      }
      let pendingAmountInPaise = Math.max(0, totalInPaise - totalPaidInPaise);
      if (Math.abs(totalPaidInPaise - subtotalInPaise) <= 100) { pendingAmountInPaise = 0; }
      if (pendingAmountInPaise <= 100) { pendingAmountInPaise = 0; }
      if (totalPaidInPaise >= totalInPaise) { pendingAmountInPaise = 0; }
      const pendingAmount = Math.round(pendingAmountInPaise) / 100;
      const isSplitPayment = payments.length > 0;
      let orderStatus: 'completed' | 'pending' | 'cancelled' = 'completed';
      if (pendingAmount > 0 || data.payment_method === 'bnpl') { orderStatus = 'pending'; }
      if (!isSplitPayment) {
        payments.push({ id: uuidv4(), amount: total, payment_method: data.payment_method, payment_date: new Date().toISOString() });
      }
      const order: PosOrder = {
        id: uuidv4(),
        created_at: new Date().toISOString(),
        client_name: data.client_name,
        stylist_id: data.stylist_id,
        stylist_name: stylistName,
        services: data.services.map(s => ({
          service_id: s.service_id,
          service_name: s.service_name,
          price: s.price || 0,
          quantity: s.quantity,
          gst_percentage: s.gst_percentage,
          type: s.type || (s.service_id?.startsWith('serv') ? 'service' : 'product')
        })),
        total: total,
        subtotal: subtotal,
        tax: tax,
        discount: discount,
        payment_method: data.payment_method,
        status: orderStatus,
        appointment_time: data.appointment_time,
        is_walk_in: true,
        payments: payments,
        pending_amount: pendingAmount,
        is_split_payment: isSplitPayment
      };
      const { appointment_time, ...orderForDb } = order;
      try {
        console.log('🔍 usePOS - Saving POS order to database');
        const { data: createdOrderResult, error } = await supabase
          .from('pos_orders')
          .insert([orderForDb])
          .select('*')
          .single();
        const createdOrder = createdOrderResult as PosOrder;
        if (error) {
          console.error('Error creating walk-in order in database:', error);
          if (error.code === '42P01') {
            console.warn('pos_orders table does not exist');
            return { success: false, error: new Error(error.message) };
          }
          throw error;
        }
        console.log('🔍 usePOS - POS order saved successfully, now triggering sales history sync');
        try {
          const servicesForSync: ServiceItem[] = data.services
            .filter(item => item.type === 'service')
            .map(item => ({
              id: item.service_id,
              service_name: item.service_name,
              name: item.service_name,
              price: item.price || 0,
              type: 'service',
              gst_percentage: item.gst_percentage || 0
            }));
          const productsForSync: ProductItem[] = data.services
            .filter(item => item.type === 'product')
            .map(item => ({
              id: item.service_id,
              product_name: item.service_name,
              name: item.service_name,
              price: item.price || 0,
              quantity: item.quantity || 1,
              type: 'product',
              gst_percentage: item.gst_percentage || 0
            }));
          console.log(`🔍 usePOS - Formatted order data: ${servicesForSync.length} services, ${productsForSync.length} products`);
          if (productsForSync.length > 0) {
            const syncResult = await syncToSalesHistory({
              products: productsForSync.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity || 1,
                price: item.price,
                gst_percentage: item.gst_percentage || 0,
                type: 'product'
              })),
              customer_name: data.client_name || 'Walk-in Customer',
              stylist_name: stylistName || 'Self Service',
              payment_method: (data.payment_method || 'Cash').toString(),
              discount: data.discount || 0,
              invoice_number: createdOrder?.invoice_number || order.id,
              order_id: order.id
            });
            if (syncResult.success) {
              console.log('🔍 usePOS - Sales history sync completed successfully');
            } else {
              console.warn('🔍 usePOS - Sales history sync completed with warnings:', syncResult.message || syncResult.error);
            }
          }
        } catch (salesError) {
          console.error('Error syncing with sales history:', salesError);
        }
        const productUpdates = data.services && Array.isArray(data.services)
          ? data.services
              .filter(service => service.type === 'product' && service.service_id)
              .map(item => ({
                productId: item.service_id!,
                quantity: item.quantity || 1
              }))
          : [];
        
        // Log inventory update but don't actually perform it to prevent double reduction
        if (productUpdates.length > 0) {
          console.log(`Preventing double inventory reduction for ${productUpdates.length} products in order`);
          // We track that we processed these items, but we don't actually update inventory
        }
        if (data.client_name && data.client_name !== 'Walk-in') {
          await updateClientFromOrder(
            data.client_name,
            payments.reduce((sum, payment) => sum + payment.amount, 0),
            payments.length === 1 ? payments[0].payment_method : 'bnpl',
            order.created_at
          );
        }
        const completeOrderResult = { ...createdOrder, items: createdOrder.services };
        return { success: true, order: completeOrderResult };
      } catch (error) {
        console.error('Error in createWalkInOrder mutationFn (inner try):', error);
        return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-sales'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-balance-stock'] })
      toast.success('Walk-in order created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create order')
      console.error('Order error:', error)
    },
  })

  // Add a new mutation to update an existing order with additional payment
  const updateOrderPayment = useMutation<{
        success: boolean;
        order: PosOrder;
        error?: undefined;
    } | {
        success: boolean;
        error: Error;
        order?: undefined;
    }, Error, { orderId: string, paymentDetails: PaymentDetail }>({
    mutationFn: async ({ orderId, paymentDetails }): Promise<{
            success: boolean;
            order: PosOrder;
        } | {
            success: boolean;
            error: Error;
        }> => {
      await new Promise(resolve => setTimeout(resolve, 500))
      const { data: orderResult, error: fetchError } = await supabase
        .from('pos_orders')
        .select('*')
        .eq('id', orderId)
        .single();
      if (fetchError) {
        console.error('Error fetching order:', fetchError);
        return { success: false, error: new Error('Order not found') };
      }
      const order = orderResult as PosOrder;
      if (!order) {
         return { success: false, error: new Error('Order not found') };
      }
      const safeOrder = JSON.parse(JSON.stringify(order));
      const safePaymentDetails = JSON.parse(JSON.stringify(paymentDetails));
      if (!Array.isArray(safeOrder.payments)) { safeOrder.payments = []; }
      const updatedPayments = [...safeOrder.payments, safePaymentDetails];
      const totalInPaise = Math.round(safeOrder.total * 100);
      const subtotalInPaise = Math.round(safeOrder.subtotal * 100);
      const totalPaidInPaise = updatedPayments.reduce((sum, payment) => {
        return sum + Math.round(payment.amount * 100);
      }, 0);
      let pendingAmountInPaise = totalInPaise - totalPaidInPaise;
      if (Math.abs(totalPaidInPaise - subtotalInPaise) <= 100) { pendingAmountInPaise = 0; }
      if (pendingAmountInPaise <= 100) { pendingAmountInPaise = 0; }
      if (totalPaidInPaise >= totalInPaise) { pendingAmountInPaise = 0; }
      const pendingAmount = pendingAmountInPaise / 100;
      const wasIncomplete = safeOrder.status === 'pending';
      const isNowComplete = pendingAmount <= 0;
      const paymentStatusChanged = wasIncomplete && isNowComplete;
      const newOrderStatus = pendingAmount <= 0 ? 'completed' : safeOrder.status;
      const updatedOrderData = {
        payments: updatedPayments,
        pending_amount: pendingAmount,
        status: newOrderStatus
      };
      const { data: savedOrderResult, error: updateError } = await supabase
        .from('pos_orders')
        .update(updatedOrderData)
        .eq('id', orderId)
        .select('*')
        .single();
      if (updateError) {
        console.error('Error updating order:', updateError);
        return { success: false, error: updateError };
      }
       const savedOrder = savedOrderResult as PosOrder;
      if (safeOrder.client_name) {
         await updateClientFromOrder(
           safeOrder.client_name,
           safePaymentDetails.amount,
           safePaymentDetails.payment_method,
           safePaymentDetails.payment_date
         );
       }
      if (paymentStatusChanged) {
        const hasProducts = Array.isArray(safeOrder.services) && safeOrder.services.some((service: any) =>
          service.type === 'product' || service.service?.type === 'product'
        );
        if (hasProducts) {
          try {
            const productsForStockUpdate = safeOrder.services
              .filter((service: any) => (service.type === 'product' || service.service?.type === 'product') && (service.service_id || service.service?.id))
              .map((item: any) => ({
                productId: item.service_id || item.service?.id,
                quantity: item.quantity || item.service?.quantity || 1,
              }));
            if (productsForStockUpdate.length > 0) {
              const validUpdates = productsForStockUpdate
                .filter((update: { productId: string | undefined; quantity: number }) => typeof update.productId === 'string' && update.productId.length > 0)
                .map(update => ({ productId: update.productId as string, quantity: update.quantity }));
              await updateProductStockQuantities(validUpdates);
            }
          } catch (error) {
            console.error('Error updating product stock quantities:', error);
          }
        }
      }
       const completeOrderResult = { ...safeOrder, ...updatedOrderData, services: safeOrder.services };
      return { success: true, order: savedOrder || completeOrderResult };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balance-stock'] });
      toast.success('Payment updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update payment');
      console.error('Payment update error:', error);
    }
  });

  // Update GST calculation to support split payments
  const calculateTotal = (
    servicePrices: number[],
    discount: number = 0,
    paymentMethod: PaymentMethod = 'upi',
    splitPayments?: PaymentDetail[]
  ) => {
    const subtotal = servicePrices.reduce((sum, price) => sum + price, 0);
    if (splitPayments && splitPayments.length > 0) {
      const hasCash = splitPayments.some(payment => payment.payment_method === 'cash');
      const hasNonCash = splitPayments.some(payment => payment.payment_method !== 'cash');
      const hasMixedPayments = hasCash && hasNonCash;
      const totalPaymentAmount = splitPayments.reduce((sum, payment) => sum + payment.amount, 0);
      let tax = 0;
      if (hasMixedPayments) { tax = Math.round(totalPaymentAmount * GST_RATE / (1 + GST_RATE)); }
      else if (hasNonCash) { tax = Math.round(totalPaymentAmount * GST_RATE / (1 + GST_RATE)); }
      const total = subtotal + tax - discount;
      return { subtotal: Math.round(subtotal), tax: tax, total: Math.round(total) };
    } else {
      const tax = paymentMethod === 'cash' ? 0 : Math.round(subtotal * GST_RATE / (1 + GST_RATE));
      const total = subtotal + tax - discount;
      return { subtotal: Math.round(subtotal), tax: tax, total: Math.round(total) };
    }
  };

  // This createOrder seems redundant given createWalkInOrder and processAppointmentPayment
  // Consider removing or clarifying its purpose if it's still needed.
  const createOrder = useMutation<PosOrder, Error, Partial<PosOrder>>({
    mutationFn: async (data: Partial<PosOrder>): Promise<PosOrder> => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const orderId = uuidv4()
      const newOrder: Partial<PosOrder> = {
        id: orderId,
        ...data,
        created_at: new Date().toISOString(),
        status: data.status || 'completed',
      }
      try {
        const { data: createdOrderResult, error } = await supabase
          .from('pos_orders')
          .insert([newOrder])
          .select('*')
          .single();
        if (error) { throw error; }
        const createdOrder = createdOrderResult as PosOrder;
        if (!data.is_salon_purchase && data.client_name && data.total && newOrder.created_at) {
          try {
            const paymentMethod = data.payment_method || 'cash';
            await updateClientFromOrder(
              data.client_name,
              data.total ?? 0,
              paymentMethod,
              newOrder.created_at!
            );
            console.log('Client data updated from order:', data.client_name);
          } catch (clientError) {
            console.error('Error updating client data:', clientError);
          }
        }
        return createdOrder || (newOrder as PosOrder);
      } catch (error) {
        console.error('Error in createOrder:', error);
        throw error instanceof Error ? error : new Error(String(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order created successfully')
    },
    onError: () => {
      toast.error('Failed to create order')
    },
  })

  // Fetch products with available stock
  const fetchProducts = async (): Promise<ProductWithStock[]> => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching products with stock information...');
      const { data, error } = await supabase
        .from('products')
        .select('id, name, mrp_incl_gst, price, stock_quantity, hsn_code, units, gst_percentage');
      if (error) { throw error; }
      console.log(`Fetched ${data?.length || 0} products from database`);
      const productsWithStock: ProductWithStock[] = (data || []).map(item => {
        const stockQty = Number(item.stock_quantity) || 0;
        return {
          id: item.id,
          name: item.name,
          price: Number(item.mrp_incl_gst) || Number(item.price) || 0,
          stock_quantity: stockQty,
          hsn_code: item.hsn_code,
          units: item.units,
          gst_percentage: Number(item.gst_percentage) || 0,
          type: 'Product',
          stock_status: (stockQty > 0 ? 'In Stock' : 'Out of Stock') as 'In Stock' | 'Out of Stock'
        };
      });
      console.log('Products with stock data:', productsWithStock);
      setProducts(productsWithStock);
      return productsWithStock;
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products with stock information');
      setProducts([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart with stock validation
  const addToCart = async (product: ProductWithStock | any, quantity = 1): Promise<{ success: boolean, message?: string }> => {
    if (product.type && product.type !== 'Product') {
      const newItem: CartItem = {
        id: uuidv4(),
        product_name: product.name,
        quantity,
        unit_price: product.price || 0,
        total_price: (product.price || 0) * quantity,
        type: product.type || 'Service'
      };
      setCartItems(prev => [...prev, newItem]);
      return { success: true };
    }
    try {
      const productDetails = products.find(p => p.id === product.id);
      const availableStock = productDetails?.stock_quantity ?? product.stock_quantity ?? 0;
      if (availableStock < quantity) {
         return { success: false, message: `Not enough stock for ${product.name}. Only ${availableStock} available.` };
       }
      const newItem: CartItem = {
        id: uuidv4(),
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: product.price || 0,
        total_price: (product.price || 0) * quantity,
        type: 'Product',
        hsn_code: product.hsn_code,
        units: product.units,
        gst_percentage: product.gst_percentage
      };
      setCartItems(prev => [...prev, newItem]);
      return { success: true };
    } catch (err) {
      console.error('Error adding to cart:', err);
      return { success: false, message: 'Failed to validate product stock' };
    }
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Calculate total
  const calculateCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.total_price, 0);
  };

  // Validate stock for cart items
  const validateStockForItems = async (items: CartItem[]): Promise<{
    success: boolean;
    invalid?: Array<{ product_name: string; quantity: number; available: number }>;
  }> => {
    try {
      const productItems = items.filter(item => item.type === 'Product' && item.product_id);
      if (productItems.length === 0) return { success: true };
      const invalid: Array<{ product_name: string; quantity: number; available: number }> = [];
      const productIds = productItems.map(item => item.product_id).filter((id): id is string => !!id);
      if(productIds.length === 0) return { success: true };
      const { data: stockData, error: stockError } = await supabase
        .from('products')
        .select('id, stock_quantity')
        .in('id', productIds);
      if (stockError) {
        console.error(`Error checking stock for multiple products:`, stockError);
         productItems.forEach(item => invalid.push({ product_name: item.product_name, quantity: item.quantity, available: 0 }));
         return { success: false, invalid };
      }
       const stockMap = new Map(stockData?.map(p => [p.id, p.stock_quantity ?? 0]) || []);
      for (const item of productItems) {
        const available = stockMap.get(item.product_id!) ?? 0;
        if (available < item.quantity) {
          invalid.push({ product_name: item.product_name, quantity: item.quantity, available });
        }
      }
      return { success: invalid.length === 0, invalid: invalid.length > 0 ? invalid : undefined };
    } catch (error) {
      console.error('Error validating stock:', error);
      return { success: false };
    }
  };

  // Complete order and update inventory
  const completeOrder = async (orderDetails: any): Promise<{ success: boolean; order?: PosOrder; message?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const productItems = cartItems.filter(item =>
        item.type && item.type.toLowerCase() === 'product' && item.product_id
      );
      console.log(`📦 Order has ${productItems.length} product items (out of ${cartItems.length} total items)`);
      if (productItems.length > 0) {
        const stockValidation = await validateStockForItems(productItems);
        if (!stockValidation.success) {
          const invalidItems = stockValidation.invalid?.map(item => `${item.product_name} (requested: ${item.quantity}, available: ${item.available})`).join(', ') || '';
          setError(`Insufficient stock for: ${invalidItems}`);
          setLoading(false);
          return { success: false, message: `Insufficient stock for some products` };
        }
      }
      const orderId = uuidv4();
      const orderDataForDb: Partial<PosOrder> = {
        id: orderId,
        created_at: new Date().toISOString(),
        client_name: orderDetails.customer_name || 'Salon Internal',
        stylist_name: orderDetails.stylist_name || undefined,
        stylist_id: orderDetails.stylist_id || undefined,
        purchase_type: orderDetails.purchase_type || 'regular',
        payment_method: orderDetails.payment_method || 'Cash',
        status: 'completed',
        total: calculateCartTotal(),
        subtotal: orderDetails.subtotal || calculateCartTotal(),
        tax: orderDetails.tax || 0,
        discount: orderDetails.discount || 0,
        is_walk_in: true,
        payments: [{ id: uuidv4(), amount: calculateCartTotal(), payment_method: orderDetails.payment_method || 'Cash', payment_date: new Date().toISOString() }],
        pending_amount: 0,
        is_split_payment: false,
        services: cartItems.map(item => ({
          type: item.type.toLowerCase(),
          price: item.unit_price || 0,
          quantity: item.quantity || 1,
          service_id: item.type === 'Service' ? item.id : item.product_id,
          service_name: item.product_name || 'Unknown Item',
          gst_percentage: item.gst_percentage || 0
        })),
      };
      const { data: insertedOrderResult, error: orderError } = await supabase
        .from('pos_orders')
        .insert(orderDataForDb)
        .select()
        .single();
      if (orderError) { console.error("Error inserting order:", orderError); throw orderError; }
       const insertedOrder = insertedOrderResult as PosOrder;
      const orderItemsForDb: PosOrderItem[] = cartItems.map(item => ({
        order_id: orderId,
        item_id: item.product_id || item.id,
        item_name: item.product_name,
        product_name: item.type === 'Product' ? item.product_name : undefined,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        type: item.type.toLowerCase() as 'product' | 'service',
        hsn_code: item.hsn_code,
        gst_percentage: item.gst_percentage,
        product_id: item.type === 'Product' ? item.product_id : undefined,
        service_id: item.type === 'Service' ? item.id : undefined,
      }));
      const { error: itemsError } = await supabase.from('pos_order_items').insert(orderItemsForDb);
      if (itemsError) { console.error("Error inserting order items:", itemsError); throw itemsError; }
      if (productItems.length > 0) {
        try {
          console.log(`📦 Processing ${productItems.length} product items for sales history sync`);
          const productsForSync = productItems
            .filter(item => item.type && item.type.toLowerCase() === 'product' && item.product_id)
            .map(item => ({
              id: item.product_id!,
              name: item.product_name,
              quantity: item.quantity,
              price: item.unit_price,
              gst_percentage: item.gst_percentage,
              type: 'product'
            }));
          if (productsForSync.length === 0) {
            console.log('No valid products with IDs found for sales history sync after final filter');
          } else {
             const syncResult = await syncToSalesHistory({
               products: productsForSync,
               customer_name: orderDetails.customer_name || 'Walk-in Customer',
               stylist_name: orderDetails.stylist_name || 'Self Service',
               payment_method: (orderDetails.payment_method || 'Cash').toString(),
               discount: orderDetails.discount || 0,
               invoice_number: insertedOrder.invoice_number || orderId,
               order_id: orderId
             });
            if (!syncResult.success) {
              console.warn('Warning: Failed to sync sales:', syncResult.message || syncResult.error);
            } else {
              console.log(`📦 Successfully synced ${productsForSync.length} product sales to Sales History`);
            }
          }
        } catch (salesError) {
          console.error('Error recording sales transactions:', salesError);
        }
      } else {
        console.log('📦 No product items in order - skipping sales history sync');
      }
      if (productItems.length > 0) {
        try {
          const productUpdates = productItems
             .map(item => ({
               productId: item.product_id!,
               quantity: item.quantity
             }));
          if (productUpdates.length > 0) {
            console.log(`📦 Updating stock for ${productUpdates.length} products`);
            await updateProductStockQuantities(productUpdates);
          } else {
            console.log('No valid products with IDs found for stock updates');
          }
        } catch (err) {
          console.warn('Inventory update warning:', err);
        }
      }
      setCartItems([]);
      const finalOrderResult = { ...insertedOrder, items: orderItemsForDb };
      return { success: true, order: finalOrderResult, message: 'Order created successfully' };
    } catch (err) {
      const error = err as Error;
      console.error('Error completing order:', error);
      setError('Failed to complete order');
      const message = (error as any)?.message || 'Failed to complete order';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Instead of creating inventory sales, update product stock quantities
  const updateProductStockQuantities = async (productsToUpdate: { productId: string; quantity: number }[]): Promise<{ success: boolean, error?: any }> => {
    if (!productsToUpdate || productsToUpdate.length === 0) return { success: true };
    try {
      // Log that we're skipping actual inventory reduction to prevent double reduction
      console.log('Preventing double inventory reduction for products:', productsToUpdate);
      
      // Return success structure without actually updating inventory
      return { 
        success: true, 
        skippedUpdate: true,
        products: productsToUpdate.map(p => ({...p}))
      };
    } catch (err) {
      console.error('Error in updateProductStockQuantities:', err);
      return { success: false, error: err };
    }
  };

  return {
    unpaidAppointments,
    orders,
    isLoading: loadingAppointments || loadingOrders,
    processAppointmentPayment: processAppointmentPayment.mutate,
    createWalkInOrder: createWalkInOrder.mutate,
    updateOrderPayment: updateOrderPayment.mutate,
    calculateTotal,
    createOrder: createOrder.mutate,
    loading,
    error,
    products,
    cartItems,
    fetchProducts,
    addToCart,
    removeFromCart,
    calculateCartTotal,
    completeOrder,
    refreshDataAfterOrder
  }
}

// Function to refresh data after order creation
export const refreshDataAfterOrder = async (isSalonConsumption = false) => {
  try {
    console.log(`Refreshing data after order, isSalonConsumption: ${isSalonConsumption}`);
    
    // Always refresh orders
    window.dispatchEvent(new CustomEvent('refresh-orders'));
    
    // Add special handling for salon consumption
    if (isSalonConsumption) {
      console.log('Refreshing inventory data for salon consumption order');
      
      // Trigger inventory refresh event
      window.dispatchEvent(new CustomEvent('refresh-inventory'));
      
      // Add a delay to ensure inventory state is updated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the inventory consumption refresh function if available
      if (typeof window.refreshInventoryConsumption === 'function') {
        console.log('Calling window.refreshInventoryConsumption function');
        window.refreshInventoryConsumption();
      } else {
        console.warn('window.refreshInventoryConsumption function not found, using custom sync');
        
        // Manually trigger sync if the function isn't available
        try {
          // Import the inventory hook dynamically
          import('./useInventory').then(module => {
            if (module && module.useInventory) {
              const { syncConsumptionFromPos } = module.useInventory();
              if (syncConsumptionFromPos) {
                console.log('Manually triggering syncConsumptionFromPos');
                // Get last 24 hours for sync
                const endDate = new Date().toISOString();
                const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
                syncConsumptionFromPos(startDate, endDate, 'salon');
              }
            }
          }).catch(err => {
            console.error('Error importing useInventory hook:', err);
          });
        } catch (syncError) {
          console.error('Error during manual sync:', syncError);
        }
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error refreshing data after order:', error);
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

// Standalone createWalkInOrder function (outside the hook)
// Define a type for the order object inserted by the standalone createWalkInOrder
// This should closely match the actual 'pos_orders' table schema
type StandalonePosOrderInsert = Partial<PosOrder> & {
  id: string;
  created_at: string;
  client_name: string;
  stylist_id: string | null;
  stylist_name?: string;
  total: number;
  payment_method: PaymentMethod;
  status: 'completed' | 'pending' | 'cancelled';
  is_walk_in: boolean;
  payments: PaymentDetail[];
  pending_amount: number;
  is_split_payment: boolean;
  invoice_number?: string;
  is_salon_consumption?: boolean;
  consumption_purpose?: string | null;
  purchase_type?: string;
  order_type?: string;
  category?: string;
  salon_use?: boolean;
};

export const createWalkInOrder = async (
  customerName: string,
  products: ProductItem[],
  services: ServiceItem[],
  paymentMethod: PaymentMethod,
  staff: { id: string; name: string } | null,
  invoiceNumber: string,
  orderDate: string,
  isSalonConsumption: boolean = false,
  consumptionPurpose?: string
): Promise<OrderResult> => {
  try {
    console.log('Creating walk-in order with:', {
      customerName,
      products: products.length,
      services: services.length,
      paymentMethod,
      staff,
      invoiceNumber,
      orderDate,
      isSalonConsumption,
      consumptionPurpose
    });

    if (isSalonConsumption) { console.log('This is a salon consumption order with purpose:', consumptionPurpose); }

    // Calculate total amount
    const totalAmount = calculateTotal(products, services);
    console.log(`Total order amount: ${totalAmount}`);

    // Create a unique ID for the order
    const orderId = uuidv4();
    console.log(`Generated order ID: ${orderId}`);

    const orderData: StandalonePosOrderInsert = {
      id: orderId,
      created_at: orderDate || new Date().toISOString(),
      customer_name: customerName,
      client_name: customerName,
      stylist_id: staff?.id || null,
      stylist_name: staff?.name || 'Unknown Stylist',
      total: totalAmount,
      subtotal: totalAmount,
      tax: 0,
      discount: 0,
      payment_method: paymentMethod,
      status: isSalonConsumption ? 'completed' : 'completed',
      is_walk_in: true,
      payments: [{
        id: uuidv4(),
        amount: totalAmount,
        payment_method: paymentMethod,
        payment_date: orderDate
      }],
      pending_amount: 0,
      is_split_payment: false,
      invoice_number: invoiceNumber,
      is_salon_consumption: isSalonConsumption,
      consumption_purpose: isSalonConsumption ? consumptionPurpose : null,
      purchase_type: isSalonConsumption ? 'salon_consumption' : 'regular_purchase',
      order_type: isSalonConsumption ? 'salon_consumption' : 'walk_in',
      category: isSalonConsumption ? 'Salon Consumption' : 'Customer Purchase',
      salon_use: isSalonConsumption,
      services: services.map(service => ({
        type: 'service',
        price: service.price || 0,
        quantity: 1,
        service_id: service.id,
        service_name: service.service_name || service.name || 'Unknown Service',
        gst_percentage: service.gst_percentage || 0
      })).concat(products.map(product => ({
        type: 'product',
        price: product.price || 0,
        quantity: product.quantity || 1,
        service_id: product.id,
        service_name: product.product_name || product.name || 'Unknown Product',
        gst_percentage: product.gst_percentage || 0
      })))
    };

    let orderItemsForDb: PosOrderItem[] = [];
    services.forEach((service) => {
      orderItemsForDb.push({
        order_id: orderId,
        item_id: service.id,
        item_name: service.service_name || service.name || 'Unknown Service',
        quantity: 1,
        unit_price: service.price || 0,
        total_price: service.price || 0,
        type: 'service',
        hsn_code: service.hsn_code || '',
        gst_percentage: service.gst_percentage || 0,
        service_id: service.id
      });
    });
    products.forEach((product) => {
      orderItemsForDb.push({
        order_id: orderId,
        item_id: product.id,
        item_name: product.product_name || product.name || 'Unknown Product',
        product_name: product.product_name || product.name,
        quantity: product.quantity || 1,
        unit_price: product.price || 0,
        total_price: (product.quantity || 1) * (product.price || 0),
        type: 'product',
        hsn_code: product.hsn_code || '',
        gst_percentage: product.gst_percentage || 0,
        is_salon_consumption: isSalonConsumption,
        for_salon_use: isSalonConsumption,
        category: isSalonConsumption ? 'Salon Consumption' : 'Customer Purchase',
        purpose: isSalonConsumption ? consumptionPurpose : null,
        product_id: product.id
      });
    });

    const { data: insertedOrderResult, error: orderError } = await supabase
       .from(TABLES.POS_ORDERS || 'pos_orders')
       .insert(orderData)
       .select()
       .single();
    if (orderError) {
      console.error('Error creating order:', orderError);
      return { success: false, error: new Error(orderError.message) };
    }
    const insertedOrder = insertedOrderResult as PosOrder;

    const { error: itemsError } = await supabase.from(TABLES.POS_ORDER_ITEMS || 'pos_order_items').insert(orderItemsForDb);
    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      return { success: false, error: new Error(itemsError.message) };
    }

    if (products.length > 0 && !isSalonConsumption) {
      try {
        const validProductUpdates = products
          .filter(product => product.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id))
          .map(product => ({ productId: product.id, quantity: product.quantity || 1 }));
        
        if (validProductUpdates.length > 0) {
          console.log(`Preventing double inventory reduction for ${validProductUpdates.length} products`);
          // We'll preserve the structure but not actually update inventory
          // This ensures any code expecting the data will still function properly
        }
      } catch (inventoryError) {
        console.error('Error processing inventory data:', inventoryError);
      }
    }

    const finalOrderResult = { ...insertedOrder, items: orderItemsForDb };
    return { success: true, order: finalOrderResult, message: 'Order created successfully' };

  } catch (error) {
    console.error('Error in createWalkInOrder:', error);
    return { success: false, error: error instanceof Error ? error : new Error('Unknown error in createWalkInOrder') };
  }
};

// Fix: updateInventoryForSalonConsumption target table and key assumptions
export const updateInventoryForSalonConsumption = async (products: ProductItem[]) => {
  try {
    if (!products || products.length === 0) {
      console.warn('No products provided for salon consumption');
      return { success: false, error: 'No products provided' };
    }

    // Assume stock is tracked in the main 'products' table using 'id' as PK
    const targetInventoryTable = 'products';
    console.log(`Updating stock in table: ${targetInventoryTable}`);

    let allSucceeded = true;
    const errors: string[] = [];

    for (const product of products) {
      if (!product.id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id)) {
        const errorMsg = `Invalid product object or ID passed to updateInventoryForSalonConsumption: ID=${product.id}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        allSucceeded = false;
        continue; // Skip this invalid product
      }

      try {
         const quantity = product.quantity || 1;
         // Use RPC call for atomic update (safer)
         const { error: rpcError } = await supabase.rpc('decrement_product_stock', {
           p_product_id: product.id,
           p_decrement_quantity: quantity
         });

         if (rpcError) {
           console.error(`Error updating stock via RPC for product ${product.id}:`, rpcError);
           errors.push(`Failed stock update for ${product.id}: ${rpcError.message}`);
           allSucceeded = false;
         } else {
           console.log(`Decremented stock for ${product.name || product.id} by ${quantity}`);
           
           // Add entry to inventory_salon_consumption table
           const salonConsumptionEntry = {
             id: uuidv4(),
             date: new Date().toISOString(),
             product_name: product.product_name || product.name,
             hsn_code: product.hsn_code || '',
             quantity: quantity,
             purpose: product.purpose || 'Salon Use',
             price_per_unit: product.price?.toString() || '0',
             gst_percentage: product.gst_percentage?.toString() || '0'
           };
           
           const { error: insertError } = await supabase
             .from('inventory_salon_consumption')
             .insert(salonConsumptionEntry);
           
           if (insertError) {
             console.error(`Error inserting salon consumption record for ${product.id}:`, insertError);
             errors.push(`Failed to record salon consumption for ${product.id}: ${insertError.message}`);
             allSucceeded = false;
           } else {
             console.log(`Added salon consumption record for ${product.name || product.id}`);
           }
         }
       } catch (updateError) {
         const errorMsg = `Exception updating stock for product ${product.id}: ${updateError instanceof Error ? updateError.message : String(updateError)}`;
         console.error(errorMsg);
         errors.push(errorMsg);
         allSucceeded = false;
       }
    }

    return { success: allSucceeded, error: errors.length > 0 ? new Error(errors.join('; ')) : undefined };
  } catch (error) {
    console.error('Exception in updateInventoryForSalonConsumption:', error);
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

// Add a function to delete an order
// Ensure the primary key for pos_orders is 'id' or 'order_id' consistently
export const deleteOrder = async (orderId: string): Promise<{ success: boolean; error?: Error }> => {
  try {
    if (!orderId) {
      console.error('Order ID is required for deletion');
      return { success: false, error: new Error('Order ID is required') };
    }

    console.log(`Deleting order with ID "${orderId}" and all related items...`);
    
    // Define the primary key column name for pos_orders
    const orderTablePrimaryKey = 'id'; // Change to 'order_id' if that's the actual primary key

    // First delete the order items (assuming 'order_id' is the FK in pos_order_items)
    try {
      const { error: itemsError } = await supabase
        .from('pos_order_items')
        .delete()
        .eq('order_id', orderId); // Match on the foreign key

      if (itemsError) {
        console.error('Error deleting order items:', itemsError);
         // Decide if we should stop or continue
       } else {
        console.log(`Deleted items for order "${orderId}"`);
      }
    } catch (error) {
      console.error('Exception deleting order items:', error);
     }

    // Then delete the order itself
    try {
      const { error: orderError } = await supabase
        .from('pos_orders')
        .delete()
        .eq(orderTablePrimaryKey, orderId); // Match on the primary key

      if (orderError) {
        console.error('Error deleting order:', orderError);
         // Decide if the deletion was actually successful despite the error (e.g., if already deleted)
         throw orderError; // Throw error to indicate failure
       } else {
        console.log(`Deleted order "${orderId}"`);
      }
    } catch (error) {
      console.error('Exception deleting order:', error);
       throw error; // Throw error to indicate failure
     }

    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('order-deleted', { 
      detail: { orderId } 
    }));

    console.log(`Successfully deleted order "${orderId}" and all related data`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting order:', error);
    // Return error details
    return { success: false, error: error instanceof Error ? error : new Error('Failed to delete order') };
  }
}; 
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseQueryOptions,
  DefinedUseQueryResult,
  UndefinedInitialDataOptions,
  DefinedInitialDataOptions,
  QueryFunction,
  QueryClient,
} from '@tanstack/react-query';
import { showToast, handleError } from '../../utils/toastUtils';
import { v4 as uuidv4 } from 'uuid';
import { generateNextOrderId } from '../../utils/orderIdGenerator';
import { renumberOrdersAfterDeletion } from '../../utils/orderRenumbering';
import { updateProductInventory } from '../products/useProducts';
import { useClients } from '../clients/useClients';
import { supabase, TABLES } from '../../lib/supabase';
import { generateInvoiceNumber } from '../../lib/invoice';
import { useState, useEffect, useCallback } from 'react';
import {
  recordSaleTransaction,
  syncToSalesHistory,
} from '../../utils/salesUtils';
// calculateTotal is defined locally in this file
import { useAuthContext } from '../../contexts/AuthContext';

// Add window interface augmentation at the top of the file
declare global {
  interface Window {
    refreshInventoryConsumption?: () => void;
  }
}

// Extended payment method types to include BNPL
export const PAYMENT_METHODS = [
  'cash',
  'credit_card',
  'debit_card',
  'upi',
  'bnpl',
  'membership',
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// Add split to payment methods where needed
export const PAYMENT_METHODS_WITH_SPLIT = [
  ...PAYMENT_METHODS,
  'split',
] as const;
export type PaymentMethodWithSplit =
  (typeof PAYMENT_METHODS_WITH_SPLIT)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  upi: 'UPI',
  bnpl: 'Buy Now Pay Later',
  membership: 'Membership',
};

// Interface for payment details - used for split payments
export interface PaymentDetail {
  id: string;
  amount: number;
  payment_method: PaymentMethodWithSplit;
  payment_date: string;
  payment_note?: string;
}

// Define Order interface for type reference
export interface Order {
  id: string;
  client_id?: string;
  client_name?: string;
  customer_name?: string;
  stylist_id?: string;
  stylist_name?: string;
  services?: any[];
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  payment_method: PaymentMethod | 'split';
  status: 'completed' | 'pending' | 'cancelled';
  created_at?: string;
  appointment_id?: string;
  is_walk_in?: boolean;
  payments?: PaymentDetail[];
  pending_amount?: number;
  is_split_payment?: boolean;
  invoice_number?: string;
  is_salon_consumption?: boolean;
}

// Type for creating an order
export interface CreateOrderData {
  client_id: string;
  client_name: string;
  invoice_number?: string; // Optional invoice number
  stylist_id: string;
  stylist_name?: string; // Optional stylist name
  items: CreateOrderItemData[]; // Use specific type for items
  services?: CreateServiceData[]; // Optional services array
  payment_method: PaymentMethod | 'split';
  split_payments?: PaymentDetail[];
  discount?: number;
  discount_percentage?: number; // Add discount percentage field
  notes?: string;
  subtotal: number;
  tax: number;
  total: number;
  gst_amount?: number; // Optional gst amount
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  order_date: string;
  is_walk_in: boolean;
  consumption_purpose?: string;
  consumption_notes?: string;
  is_salon_consumption?: boolean;
  appointment_id?: string;
  pending_amount?: number;
  appointment_time?: string;
  payments?: PaymentDetail[];
  order_id?: string; // Add order_id field
}

// Type for items within CreateOrderData
export interface CreateOrderItemData {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  price: number;
  total: number;
  type: 'product' | 'service' | 'membership';
  hsn_code?: string;
  units?: string;
  category?: string;
  gst_percentage?: number;
  discount?: number;
  duration_months?: number;
}

// Type for services within CreateOrderData (if needed explicitly)
export interface CreateServiceData {
  service_id: string;
  service_name: string;
  quantity: number;
  price: number;
  type?: 'service' | 'product' | 'membership';
  gst_percentage?: number;
  hsn_code?: string;
  category?: string;
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
    type?: 'service' | 'product' | 'membership';
    hsn_code?: string;
    units?: string;
    batch?: string;
    expiry?: string;
    is_salon_consumption?: boolean;
    for_salon_use?: boolean;
    category?: string;
    purpose?: string | null;
    product_id?: string;
    product_name?: string;
    experts?: Array<{ id: string; name: string }>;
    duration_months?: number;
  }>;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  discount_percentage?: number;
  payment_method: PaymentMethod | 'split';
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
  consumption_notes?: string | null;
  purchase_type?: string;
  order_type?: string;
  category?: string;
  salon_use?: boolean;
  stock_snapshot?: string; // Store stock quantities before order as JSON string
  current_stock?: string; // Same data but with different field name as JSON string
  user_id?: string; // User ID for foreign key constraint
  // Additional fields to match actual data structure
  date?: string;
  requisition_voucher_no?: string | null;
  multi_expert_group_id?: string | null;
  multi_expert?: boolean;
  total_experts?: number;
  expert_index?: number;
  tenant_id?: string;
  source?: string;
  invoice_no?: string | null;
  order_id?: string;
  serial_number?: string | null;
  client_id?: string | null;
  notes?: string | null;
}

export const GST_RATE = 0.18; // 18% GST for salon services in India

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

// Define the OrderResult interface for the createWalkInOrder function
interface OrderResult {
  success: boolean;
  order?: PosOrder;
  error?: Error;
  message?: string;
}

// Define Type for updating product stock
interface ProductStockUpdate {
  productId: string;
  quantity: number;
}

// Function to update product stock quantities
async function updateProductStockQuantities(updates: ProductStockUpdate[]) {
  try {
    const validUpdates = updates.filter((update: ProductStockUpdate) => {
      return (
        update.productId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          update.productId
        )
      );
    });

    if (validUpdates.length === 0) {
      console.warn('No valid product IDs found for stock update');
      return { success: false, message: 'No valid product IDs' };
    }

    const results = await Promise.all(
      validUpdates.map(async (update: ProductStockUpdate) => {
        const { data, error } = await supabase.rpc('decrement_product_stock', {
          product_id: update.productId,
          decrement_quantity: update.quantity,
        });

        return {
          productId: update.productId,
          success: !error,
          result: data,
          error,
        };
      })
    );

    return {
      success: results.every(r => r.success),
      results,
    };
  } catch (error) {
    console.error('Error updating product stock quantities:', error);
    return { success: false, error };
  }
}

// Interface for the complete order data returned from createWalkInOrder
interface OrderFunctionResult {
  success: boolean;
  order?: PosOrder;
  error?: Error;
  message?: string;
}

// Type for creating an order
export type StandalonePosOrderInsert = {
  client_id: string;
  client_name: string;
  stylist_id: string;
  stylist_name?: string;
  items: CreateOrderItemData[];
  services?: CreateServiceData[];
  payment_method: PaymentMethod | 'split';
  split_payments?: PaymentDetail[];
  discount?: number;
  notes?: string;
  subtotal: number;
  tax: number;
  total: number;
  gst_amount?: number;
  total_amount: number;
  status: Order['status'];
  order_date: string;
  is_walk_in: boolean;
  consumption_purpose?: string;
  consumption_notes?: string;
  is_salon_consumption?: boolean;
  appointment_id?: string;
  pending_amount?: number;
  appointment_time?: string;
  payments?: PaymentDetail[];
};

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
  pos_order_id: string;
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

// Add a standalone deleteOrder function with direct database deletion
export async function deleteOrder(orderId: string): Promise<{
  error: string;
  success: boolean;
  message: string;
}> {
  try {
    console.log('🗑️ Deleting order directly from database:', orderId);

    // Import supabase client
    const { supabase } = await import('../../lib/supabase');

    // First, delete order items
    console.log('🗑️ Deleting order items...');
    const { error: itemsError } = await supabase
      .from('pos_order_items')
      .delete()
      .eq('pos_order_id', orderId);

    if (itemsError) {
      console.error('❌ Error deleting order items:', itemsError);
      throw new Error(`Failed to delete order items: ${itemsError.message}`);
    }
    console.log('✅ Order items deleted successfully');

    // Then delete the order
    console.log('🗑️ Deleting order...');
    const { error: orderError } = await supabase
      .from('pos_orders')
      .delete()
      .eq('id', orderId);

    if (orderError) {
      console.error('❌ Error deleting order:', orderError);
      throw new Error(`Failed to delete order: ${orderError.message}`);
    }
    console.log('✅ Order deleted successfully');

    // Show success message
    showToast.success('Order deleted successfully');

    // Trigger renumbering of subsequent orders after successful deletion
    try {
      await renumberOrdersAfterDeletion(orderId);
      console.log('Order renumbering completed after deletion');
    } catch (renumberError) {
      console.error('Error during post-deletion renumbering:', renumberError);
      // Don't fail the deletion if renumbering fails, just log the error
    }

    return { success: true, message: 'Order deleted successfully', error: '' };
  } catch (error) {
    console.error('Unexpected error deleting order:', error);

    let errorMessage = 'Failed to delete order';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // If direct deletion fails, try using the API as fallback
    console.log('🔄 Direct deletion failed, trying API fallback...');
    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('✅ API fallback deletion successful');
        showToast.success('Order deleted successfully');
        return {
          success: true,
          message: 'Order deleted successfully',
          error: '',
        };
      } else {
        console.error('❌ API fallback also failed:', response.status);
      }
    } catch (apiError) {
      console.error('❌ API fallback error:', apiError);
    }

    handleError(error, errorMessage);
    return {
      success: false,
      message: errorMessage,
      error: errorMessage,
    };
  }
}

// Add standalone createWalkInOrder function for direct import
export async function createWalkInOrder(
  customerName: string,
  products: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    type: 'product';
    gst_percentage?: number;
    hsn_code?: string;
  }>,
  services: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    type: 'service';
    gst_percentage?: number;
  }>,
  paymentMethod: PaymentMethod = 'cash',
  staffInfo: { id: string; name: string } | null = null,
  invoiceNumber?: string,
  orderDate?: string,
  isSalonConsumption: boolean = false,
  consumptionPurpose?: string
): Promise<OrderFunctionResult> {
  try {
    console.log('Creating walk-in order with staffInfo:', staffInfo);

    // Create services array for the order data
    const orderServices = [
      ...products.map(product => ({
        service_id: product.id,
        service_name: product.name,
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: product.quantity,
        type: 'product' as const,
        category: 'product',
        gst_percentage: product.gst_percentage,
        hsn_code: product.hsn_code,
      })),
      ...services.map(service => ({
        service_id: service.id,
        service_name: service.name,
        price: service.price,
        quantity: service.quantity,
        type: 'service' as const,
        category: 'service',
        gst_percentage: service.gst_percentage,
      })),
    ];

    // Calculate subtotal from products and services
    const subtotal = [
      ...products.map(p => p.price * p.quantity),
      ...services.map(s => s.price * s.quantity),
    ].reduce((sum, price) => sum + price, 0);

    // Calculate tax (simple calculation - can be enhanced)
    const tax = Math.round(subtotal * 0.18); // 18% GST

    // Prepare order data without invoice_number field
    const orderData: any = {
      client_id: '',
      client_name: customerName,
      stylist_id: staffInfo?.id || '',
      stylist_name: staffInfo?.name,
      items: [],
      services: orderServices,
      payment_method: paymentMethod,
      subtotal: subtotal,
      tax: tax,
      total: subtotal + tax,
      total_amount: subtotal + tax,
      status: 'completed',
      order_date: orderDate || new Date().toISOString(),
      is_walk_in: true,
      is_salon_consumption: isSalonConsumption,
      consumption_purpose: consumptionPurpose,
      pending_amount: 0,
      payments: [
        {
          id: uuidv4(),
          amount: subtotal + tax,
          payment_method: paymentMethod,
          payment_date: orderDate || new Date().toISOString(),
        },
      ],
    };

    // Get the current user for user_id
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    let currentProfileId: string | null = null;
    if (user && user.id) {
      try {
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        if (profileErr) {
          throw new Error(
            'No profile found for current user. Please contact admin.'
          );
        } else {
          currentProfileId = profileData?.id || null;
        }
      } catch (lookupErr) {
        throw new Error('Failed to look up user profile. Please try again.');
      }
    } else {
      throw new Error('No authenticated user found. Please log in again.');
    }
    const resolvedUserId = currentProfileId;
    if (!resolvedUserId) {
      throw new Error('User profile not found. Cannot create order.');
    }

    if (userError) {
      console.warn(
        '⚠️ Could not get current authenticated user:',
        userError.message
      );
    }

    // Check if this is a membership-only order
    const isMembershipOnly = orderServices.length > 0 && orderServices.every(service => {
      // Check explicit type/category
      if (service.type === 'membership' || service.category === 'membership') {
        return true;
      }

      // Check for membership fields
      if (service.duration_months || service.benefit_amount || service.benefitAmount) {
        return true;
      }

      // Check name patterns
      const serviceName = (service.item_name || service.service_name || service.name || '').toLowerCase();
      const membershipPatterns = [
        'silver', 'gold', 'platinum', 'diamond', 'membership', 'member', 
        'tier', 'package', 'subscription', 'plan'
      ];

      return membershipPatterns.some(pattern => serviceName.includes(pattern));
    });

    // Generate formatted order ID
    const formattedOrderId = await generateNextOrderId(isSalonConsumption, isMembershipOnly);

    // Prepare order data without invoice_number if not supported
    const orderInsertData: any = {
      id: uuidv4(),
      client_name: orderData.client_name,
      customer_name: orderData.client_name,
      stylist_id: orderData.stylist_id,
      stylist_name: orderData.stylist_name,
      services: orderServices,
      total: orderData.total,
      total_amount: orderData.total,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      discount: 0,
      payment_method: orderData.payment_method,
      status: orderData.status,
      is_walk_in: orderData.is_walk_in,
      payments: orderData.payments,
      pending_amount: orderData.pending_amount,
      is_split_payment: false,
      created_at: orderDate || new Date().toISOString(),
      is_salon_consumption: orderData.is_salon_consumption,
      consumption_purpose: orderData.consumption_purpose,
      type: isSalonConsumption ? 'salon_consumption' : 'sale',
      user_id: resolvedUserId,
      // Additional fields to match actual data structure
      consumption_notes: null,
      appointment_id: null,
      is_salon_purchase: false,
      date: orderDate || new Date().toISOString(),
      appointment_time: null,
      discount_percentage: 0,
      requisition_voucher_no: null,
      stock_snapshot: '{}',
      current_stock: null,
      multi_expert_group_id: null,
      multi_expert: false,
      total_experts: 1,
      expert_index: 1,
      tenant_id: 'default',
      source: 'pos',
      invoice_no: null,
      invoice_number: formattedOrderId,
      order_id: formattedOrderId,
      serial_number: null,
      client_id: '',
      notes: null,
    };

    // Add invoice_number if provided
    if (invoiceNumber) {
      orderInsertData.invoice_number = invoiceNumber;
    }

    // Handle product stock updates
    if (products.length > 0) {
      try {
        // Create a stock snapshot before updating inventory
        const stockSnapshot: Record<string, number> = {};
        let currentStock = 0; // Store the first product's quantity as integer

        // Get current stock quantities before updating
        for (const product of products) {
          try {
            const { data: productData } = await supabase
              .from('products')
              .select('stock_quantity')
              .eq('id', product.id)
              .single();

            if (productData && productData.stock_quantity !== undefined) {
              stockSnapshot[product.id] = productData.stock_quantity;

              // Just store the first product's stock for current_stock
              if (currentStock === 0) {
                currentStock = productData.stock_quantity;
              }
            }
          } catch (err) {
            console.warn(`Failed to get stock for product ${product.id}:`, err);
          }
        }

        // Add stock snapshot to order insert data - JSON string
        orderInsertData.stock_snapshot = JSON.stringify(stockSnapshot);
        // Add current_stock from the first product's stock value
        orderInsertData.current_stock =
          currentStock > 0 ? String(currentStock) : undefined;

        // Stock reduction will be handled by decrement_product_stock RPC if needed
      } catch (stockError) {
        console.warn(
          'Warning: Failed to update some product stock quantities:',
          stockError
        );
        // Continue anyway since the order was created
      }
    }

    // Submit to Supabase
    const { data: orderResult, error } = await supabase
      .from('pos_orders')
      .insert(orderInsertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating walk-in order:', error);
      return {
        success: false,
        message: 'Failed to create order: ' + error.message,
        error: new Error(error.message),
      };
    }

    // Update client financial records if it's not a salon consumption
    if (!isSalonConsumption && customerName && orderResult) {
      try {
        // Import the necessary function or directly perform the client update
        await updateClientFinancials(
          customerName,
          orderResult.total || subtotal + tax,
          paymentMethod,
          orderResult.created_at || new Date().toISOString(),
          orderServices
        );
      } catch (clientError) {
        console.error(
          'Warning: Failed to update client financial records:',
          clientError
        );
        // Continue anyway since the order was created
      }
    }

    return {
      success: true,
      order: orderResult,
      message: 'Order created successfully',
    };
  } catch (error) {
    console.error('Unexpected error in standalone createWalkInOrder:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

// Helper function to update client financial records
async function updateClientFinancials(
  clientName: string,
  orderTotal: number,
  paymentMethod: string,
  orderDate: string,
  orderServices?: any[]
): Promise<void> {
  try {
    // Calculate total including membership amounts
    let totalIncludingMemberships = orderTotal;
    if (orderServices && orderServices.length > 0) {
      const membershipAmount = orderServices
        .filter((service: any) => service.type === 'membership' || service.category === 'membership')
        .reduce((sum: number, service: any) => {
          const gstPercentage = service.gst_percentage || 18;
          const gstMultiplier = 1 + gstPercentage / 100;
          return sum + (service.price * service.quantity * gstMultiplier);
        }, 0);
      totalIncludingMemberships += membershipAmount;
    }

    // Find client by name (case insensitive)
    const { data: existingClients, error: findError } = await supabase
      .from('clients')
      .select('*')
      .ilike('full_name', clientName);

    if (findError) {
      console.error('Error finding client:', findError);
      throw findError;
    }

    if (existingClients && existingClients.length > 0) {
      // Update existing client
      const client = existingClients[0];
      const updatedClientData: any = {
        last_visit: orderDate,
        total_spent:
          paymentMethod === 'bnpl'
            ? client.total_spent || 0
            : (client.total_spent || 0) + totalIncludingMemberships,
        pending_payment:
          paymentMethod === 'bnpl'
            ? (client.pending_payment || 0) + totalIncludingMemberships
            : client.pending_payment || 0,
        updated_at: new Date().toISOString(),
      };

      // Only update appointment_count if the column exists to prevent errors
      if (
        typeof client.appointment_count === 'number' ||
        client.appointment_count === undefined ||
        client.appointment_count === null
      ) {
        updatedClientData.appointment_count =
          (Number(client.appointment_count) || 0) + 1;
      }

      const { error } = await supabase
        .from('clients')
        .update(updatedClientData)
        .eq('id', client.id);

      if (error) {
        console.error('Error updating client from order:', error);
        throw error;
      }
    } else {
      // Create new client
      const newClient = {
        full_name: clientName,
        phone: '',
        email: '',
        notes: 'Created from order',
        total_spent: paymentMethod === 'bnpl' ? 0 : totalIncludingMemberships,
        pending_payment: paymentMethod === 'bnpl' ? totalIncludingMemberships : 0,
        last_visit: orderDate,
        appointment_count: 1, // Initialize lifetime visit count to 1 for new clients from orders
      };

      const { error } = await supabase.from('clients').insert([newClient]);

      if (error) {
        console.error('Error creating client from order:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('Error updating client financial records:', error);
    throw error;
  }
}

export function usePOS() {
  const queryClient = useQueryClient();
  const { updateClientFromOrder } = useClients();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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

  const { data: unpaidAppointments, isLoading: loadingAppointments } = useQuery<
    AppointmentData[],
    Error
  >({
    queryKey: ['unpaid-appointments'],
    queryFn: async (): Promise<AppointmentData[]> => {
      try {
        // Directly query appointments without checking schema first
        const { data, error } = await supabase
          .from('appointments')
          .select(
            `
            id,
            client_id,
            stylist_id,
            service_id,
            start_time,
            end_time,
            status,
            paid
          `
          )
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
        const clientIds = [
          ...new Set(data.filter(a => a.client_id).map(a => a.client_id)),
        ];
        const stylistIds = [
          ...new Set(data.filter(a => a.stylist_id).map(a => a.stylist_id)),
        ];
        const serviceIds = [
          ...new Set(data.filter(a => a.service_id).map(a => a.service_id)),
        ];

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
            console.error(
              'Error fetching stylists for unpaid appointments:',
              e
            );
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
            console.error(
              'Error fetching services for unpaid appointments:',
              e
            );
          }
        }

        // Merge the data
        return data.map(appointment => {
          const client = clientData.find(c => c.id === appointment.client_id);
          const stylist = stylistData.find(
            s => s.id === appointment.stylist_id
          );
          const service = serviceData.find(
            s => s.id === appointment.service_id
          );

          return {
            ...appointment,
            clients: client ? { full_name: client.full_name } : null,
            services: service
              ? {
                  name: service?.name || 'Unknown Service',
                  price: service?.price || 0,
                }
              : null,
            stylists: stylist
              ? { name: stylist?.name || 'Unknown Stylist' }
              : null,
          };
        });
      } catch (error) {
        console.error('Error in unpaid appointments query:', error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });

  // Query for all orders
  const { data: orders, isLoading: loadingOrders } = useQuery<
    PosOrder[],
    Error
  >({
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
              console.log(
                'POS Orders table does not exist, returning empty array'
              );
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
    refetchOnWindowFocus: false,
  });

  // Process payment for existing appointment with split payment support
  const processAppointmentPayment = useMutation<
    PosOrder,
    Error,
    CreateOrderData
  >({
    mutationFn: async (data: CreateOrderData): Promise<PosOrder> => {
      try {
        // Fix: Ensure unpaidAppointments is an array before using find
        const appointment = Array.isArray(unpaidAppointments)
          ? unpaidAppointments.find(
              (a: AppointmentData) => a.id === data.appointment_id
            )
          : undefined;
        if (!appointment) {
          throw new Error('Appointment not found');
        }

        // Calculate total and pending amount
        const total = data.total || 0;
        const pendingAmount = data.pending_amount || 0;
        const isSplitPayment = pendingAmount > 0;

        // Get the current user for user_id
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        let currentProfileId: string | null = null;
        if (user && user.id) {
          // Look up the profile row that belongs to the authenticated user.
          try {
            // Changed to handle multiple profiles for the same auth_user_id to prevent 406 error
            const { data: profileData, error: profileErr } = await supabase
              .from('profiles')
              .select('id')
              .eq('auth_user_id', user.id);

            if (profileErr) {
              console.warn(
                '⚠️ Could not find corresponding profile for auth user, falling back. Error:',
                profileErr.message
              );
            } else if (!profileData || profileData.length === 0) {
              console.warn('⚠️ No profile found for auth user, falling back.');
            } else {
              if (profileData.length > 1) {
                console.warn(
                  `⚠️ Found multiple (${profileData.length}) profiles for auth_user_id ${user.id}. Using the first one.`
                );
              }
              currentProfileId = profileData[0]?.id || null;
            }
          } catch (lookupErr) {
            console.error('❌ Failed looking up profile for user:', lookupErr);
          }
        }

        // FINAL user_id that will be stored on the order record – must reference profiles.id to avoid FK violation
        // If we could not resolve a profile row, leave it null and let the DB trigger set_user_id attempt to populate it.
        const resolvedUserId = currentProfileId ?? undefined;

        if (!resolvedUserId) {
          console.warn(
            '⚠️ No profile-level user_id could be resolved – inserting order without user_id so DB trigger can populate it.'
          );
        }

        if (userError) {
          console.warn(
            '⚠️ Could not get current authenticated user:',
            userError.message
          );
        }

        const newOrder: PosOrder = {
          id: uuidv4(),
          created_at: data.order_date || new Date().toISOString(),
          client_name:
            appointment.clients?.full_name ||
            appointment.clients?.client_name ||
            'Unknown Client',
          stylist_id: appointment.stylist_id,
          stylist_name: appointment.stylists?.name || 'Unknown Stylist',
          services: [
            {
              service_id: appointment.service_id,
              service_name: appointment.services?.name || 'Unknown Service',
              price: appointment.services?.price || 0,
              type: 'service',
            },
          ],
          total,
          subtotal: data.subtotal || total,
          tax: data.tax || 0,
          discount: data.discount || 0,
          payment_method: data.payment_method,
          status: 'completed',
          appointment_id: data.appointment_id,
          appointment_time: appointment.start_time,
          is_walk_in: false,
          payments: data.payments || [
            {
              id: uuidv4(),
              amount: total - pendingAmount,
              payment_method: data.payment_method,
              payment_date: data.order_date || new Date().toISOString(),
            },
          ],
          pending_amount: pendingAmount,
          is_split_payment: isSplitPayment,
          user_id: resolvedUserId, // Add user_id to satisfy foreign key constraint
        };

        const { appointment_time, ...orderForDb } = newOrder;

        try {
          const { data: createdOrderResult, error } = await supabase
            .from('pos_orders')
            .insert([orderForDb])
            .select('*')
            .single();
          const createdOrder = createdOrderResult as PosOrder;

          if (error) {
            console.error('Error creating order in database:', error);
            if (error.code === '42P01') {
              console.warn(
                'pos_orders table does not exist, returning local order object'
              );
              return newOrder as PosOrder;
            }
            throw error;
          }

          if (pendingAmount === 0 && data.appointment_id) {
            try {
              const { error: updateError } = await supabase
                .from('appointments')
                .update({ paid: true })
                .eq('id', data.appointment_id);
              if (updateError) {
                console.error(
                  'Error updating appointment payment status:',
                  updateError
                );
              }
            } catch (updateErr) {
              console.warn(
                'Error updating appointment payment status:',
                updateErr
              );
            }
          }
          return createdOrder;
        } catch (dbError) {
          console.error(
            'Database operation failed, returning local order object:',
            dbError
          );
          return newOrder as PosOrder;
        }
      } catch (error) {
        console.error('Error processing appointment payment:', error);
        throw error instanceof Error ? error : new Error(String(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unpaid-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  // Create a walk-in order with split payment support
  const createWalkInOrder = useMutation<
    OrderFunctionResult,
    Error,
    CreateOrderData
  >({
    mutationFn: async (data: CreateOrderData): Promise<OrderFunctionResult> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('🔍 usePOS - Received order data for processing:', data);
      data = JSON.parse(JSON.stringify(data));
      const stylistsData = queryClient.getQueryData<any[]>(['stylists']);
      const stylistName =
        stylistsData?.find(s => s.id === data.stylist_id)?.name ||
        'Unknown Stylist';
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
          const paymentAmount =
            typeof payment.amount === 'number' ? payment.amount : 0;
          return sum + Math.round(paymentAmount * 100);
        }, 0);
      }
      let pendingAmountInPaise = Math.max(0, totalInPaise - totalPaidInPaise);
      if (Math.abs(totalPaidInPaise - subtotalInPaise) <= 100) {
        pendingAmountInPaise = 0;
      }
      if (pendingAmountInPaise <= 100) {
        pendingAmountInPaise = 0;
      }
      if (totalPaidInPaise >= totalInPaise) {
        pendingAmountInPaise = 0;
      }
      const pendingAmount = Math.round(pendingAmountInPaise) / 100;
      const isSplitPayment = payments.length > 0;
      let orderStatus: 'completed' | 'pending' | 'cancelled' = 'completed';

      // Helper function to detect if this is a membership item
      const isMembershipItem = async (service: any): Promise<boolean> => {
        try {
          // Changed to fetch multiple and check length to avoid 406 error if multiple tiers have the same name.
          const { data, error } = await supabase
            .from('membership_tiers')
            .select('id')
            .eq('name', service.service_name || service.name);

          if (error) {
            console.error('Error checking membership tiers:', error);
            return false;
          }

          return data && data.length > 0; // Returns true if any membership found
        } catch (err) {
          console.error('Failed to check membership tiers:', err);
          return false;
        }
      };

      // Ensure all services have proper data fields and preserve multi-expert metadata
      const enhancedServices = await Promise.all(
        data.services?.map(async s => {
          console.log('🔍 usePOS - Processing service for order:', {
            service_id: s.service_id,
            service_name: s.service_name,
            type: s.type,
            category: s.category,
            price: s.price,
            experts: (s as any).experts,
          });

          // Common fields for both product and service
          const baseFields = {
            service_id: s.service_id,
            service_name: s.service_name || 'Unknown Item',
            price: s.price || 0,
            quantity: s.quantity || 1,
            gst_percentage: s.gst_percentage || 0,
          };

          // Build the core service object with explicit type checking
          let serviceObj: any;

          // EXPLICIT type assignment - be very clear about what gets what type
          if (s.type === 'product' || s.category === 'product') {
            serviceObj = {
              ...baseFields,
              product_id: s.service_id,
              product_name: s.service_name,
              type: 'product' as const,
              category: 'product',
              hsn_code: s.hsn_code || '',
            };
            console.log('🟨 usePOS - PRODUCT type assigned:', s.service_name);
          } else if (
            (s as any).type === 'membership' ||
            (s as any).category === 'membership' ||
            (await isMembershipItem(s))
          ) {
            serviceObj = {
              ...baseFields,
              type: 'membership' as const,
              category: 'membership',
              duration_months: (s as any).duration_months || 12,
            };
            console.log(
              '🟦 usePOS - MEMBERSHIP type assigned:',
              s.service_name,
              '(price:',
              s.price,
              ')'
            );
          } else {
            // Default to service for everything else
            serviceObj = {
              ...baseFields,
              type: 'service' as const,
              category: s.category || 'service',
            };
            console.log(
              '🟩 usePOS - SERVICE type assigned (default):',
              s.service_name
            );
          }

          // Preserve multi-expert fields if present
          const finalServiceObj = {
            ...serviceObj,
            ...((s as any).experts && { experts: (s as any).experts }),
            ...((s as any).total_experts && {
              total_experts: (s as any).total_experts,
            }),
            ...((s as any).split_revenue && {
              split_revenue: (s as any).split_revenue,
            }),
            ...((s as any).expert_index && {
              expert_index: (s as any).expert_index,
            }),
          };

          console.log('🔍 usePOS - Final enhanced service:', finalServiceObj);
          return finalServiceObj;
        }) || []
      );

      // Get the current user for user_id
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      let currentProfileId: string | null = null;
      if (user && user.id) {
        try {
          // Changed to handle multiple profiles for the same auth_user_id to prevent 406 error
          const { data: profileData, error: profileErr } = await supabase
            .from('profiles')
            .select('id')
            .eq('auth_user_id', user.id);

          if (profileErr) {
            throw new Error(
              `Failed to look up user profile: ${profileErr.message}`
            );
          }

          if (!profileData || profileData.length === 0) {
            throw new Error(
              'No profile found for current user. Please contact admin.'
            );
          }

          if (profileData.length > 1) {
            console.warn(
              `⚠️ Found multiple (${profileData.length}) profiles for auth_user_id ${user.id}. Using the first one.`
            );
          }

          currentProfileId = profileData[0]?.id || null;
        } catch (lookupErr) {
          throw new Error('Failed to look up user profile. Please try again.');
        }
      } else {
        throw new Error('No authenticated user found. Please log in again.');
      }
      const resolvedUserId = currentProfileId;
      if (!resolvedUserId) {
        throw new Error('User profile not found. Cannot create order.');
      }

      // Generate formatted order ID
      const formattedOrderId = await generateNextOrderId(
        data.is_salon_consumption || false
      );

      console.log('🔍 DEBUG usePOS: Received invoice_number:', data.invoice_number, 'formattedOrderId:', formattedOrderId);

      const order: PosOrder = {
        id: uuidv4(),
        created_at: data.order_date || new Date().toISOString(),
        client_name: data.client_name,
        customer_name: data.client_name,
        stylist_id: data.stylist_id,
        stylist_name: stylistName,
        services: enhancedServices,
        total: total,
        total_amount: total,
        subtotal: subtotal,
        tax: tax,
        discount: discount,
        discount_percentage: data.discount_percentage,
        payment_method: data.payment_method,
        status: orderStatus,
        appointment_time: data.appointment_time,
        is_walk_in: true,
        payments: payments,
        pending_amount: pendingAmount,
        is_split_payment: isSplitPayment,
        user_id: resolvedUserId,
        // Additional fields to match actual data structure
        consumption_purpose: data.consumption_purpose || undefined,
        consumption_notes: data.consumption_notes || undefined,
        is_salon_consumption: data.is_salon_consumption || false,
        appointment_id: data.appointment_id || undefined,
        is_salon_purchase: false,
        date: data.order_date || new Date().toISOString(),
        requisition_voucher_no: null,
        stock_snapshot: '{}',
        current_stock: undefined,
        multi_expert_group_id: null,
        multi_expert: false,
        total_experts: 1,
        expert_index: 1,
        tenant_id: 'default',
        source: 'pos',
        invoice_no: null,
        invoice_number: data.invoice_number || formattedOrderId,
        order_id: formattedOrderId,
        serial_number: null,
        client_id: data.client_id || null,
        notes: data.notes || null,
      };

      // Enhanced debug logging for walk-in orders
      console.log('🚶‍♂️ WALK-IN ORDER CREATION DEBUG:', {
        orderId: order.id,
        stylistId: order.stylist_id,
        stylistName: order.stylist_name,
        clientName: order.client_name,
        isWalkIn: order.is_walk_in,
        servicesCount: enhancedServices.length,
        services: enhancedServices.map(s => ({
          name: s.service_name,
          type: s.type,
          category: s.category,
          price: s.price,
          experts: s.experts,
        })),
        total: order.total,
      });

      // Rest of the function implementation
      console.log('🔍 usePOS - Prepared order for submission:', order);

      try {
        // Insert the order record
        try {
          // Handle product stock updates if services contain product items
          if (data.services && data.services.length > 0) {
            const productItems = data.services.filter(
              item =>
                item.type === 'product' ||
                (item.type === undefined &&
                  item.service_id &&
                  !item.service_id.startsWith('serv'))
            );

            // Create a stock snapshot before updating inventory
            const stockSnapshot: Record<string, number> = {};
            let currentStock = 0; // Store the first product's quantity as integer

            if (productItems.length > 0) {
              // Get current stock quantities before updating
              for (const item of productItems) {
                try {
                  const { data: productData } = await supabase
                    .from('product_master')
                    .select('stock_quantity')
                    .eq('id', item.service_id)
                    .single();

                  if (productData && productData.stock_quantity !== undefined) {
                    stockSnapshot[item.service_id] = productData.stock_quantity;

                    // Just store the first product's stock for current_stock
                    if (currentStock === 0) {
                      currentStock = productData.stock_quantity;
                    }
                  }
                } catch (err) {
                  console.warn(
                    `Failed to get stock for product ${item.service_id}:`,
                    err
                  );
                }
              }

              // Stock reduction will be handled by decrement_product_stock RPC if needed
            }

            // Add stock snapshot as JSON
            if (Object.keys(stockSnapshot).length > 0) {
              order.stock_snapshot = JSON.stringify(stockSnapshot);
              // Set current_stock from the first product's stock value
              order.current_stock =
                currentStock > 0 ? String(currentStock) : undefined;
            }
          }

          console.log(
            '🔍 usePOS - Attempting to insert order without stock data'
          );

          const { data: insertedOrder, error } = await supabase
            .from('pos_orders')
            .insert(order)
            .select()
            .single();

          if (error) {
            console.error('❌ usePOS - Order creation failed:', error);
            return {
              success: false,
              message: 'Failed to create order',
              error: error,
            };
          }

          console.log('🔍 DEBUG: Order created successfully with invoice_number:', insertedOrder?.invoice_number, 'order_id:', insertedOrder?.order_id);

          console.log('✅ usePOS - Order created successfully:', insertedOrder);

          // Insert membership records for sold membership tiers (only items with category='membership')
          if (insertedOrder && Array.isArray(data.services)) {
            const membershipServices = data.services.filter(
              s => s.category === 'membership'
            );
            console.log(
              '🔍 usePOS - membershipServices detected:',
              membershipServices
            );
            if (membershipServices.length > 0) {
              console.log(
                '🔍 usePOS - tierIds for membership insertion:',
                membershipServices.map(s => s.service_id)
              );
              const tierIds = membershipServices.map(s => s.service_id);
              const { data: soldTiers, error: tierError } = await supabase
                .from('membership_tiers')
                .select('id, duration_months')
                .in('id', tierIds);
              if (!tierError && soldTiers) {
                for (const tier of soldTiers) {
                  console.log(
                    '🔍 usePOS - inserting membership for tier:',
                    tier.id
                  );
                  const purchaseDate = insertedOrder.created_at
                    ? insertedOrder.created_at.slice(0, 10)
                    : new Date().toISOString().slice(0, 10);
                  const expires = new Date(purchaseDate);
                  expires.setMonth(expires.getMonth() + tier.duration_months);
                  const expiresAt = expires.toISOString().slice(0, 10);
                  const { error: membersError } = await supabase
                    .from('members')
                    .insert({
                      client_id: data.client_id,
                      client_name: data.client_name,
                      tier_id: tier.id,
                      purchase_date: purchaseDate,
                      expires_at: expiresAt,
                      user_id: resolvedUserId,
                    });
                  if (membersError) {
                    console.error(
                      '❌ usePOS - Failed to insert membership record:',
                      membersError
                    );
                  } else {
                    console.log(
                      '✅ usePOS - membership record inserted:',
                      tier.id
                    );
                  }
                }
              } else if (tierError) {
                console.error(
                  '❌ usePOS - Error querying membership_tiers:',
                  tierError
                );
              }
            }
          }

          // *** START: Insert Order Items ***
          if (insertedOrder && data.services && data.services.length > 0) {
            const itemsToInsert = data.services.map(item => {
              const quantity = item.quantity || 1;
              const unit_price = item.price || 0; // Assuming item.price passed from POS IS the unit price
              const total_price = quantity * unit_price;
              const itemType = item.type || 'unknown';

              return {
                pos_order_id: insertedOrder.id, // Link to the created order (Correct: UUID)
                service_id: itemType === 'service' ? item.service_id : null, // Correct: UUID
                product_id: itemType === 'product' ? item.service_id : null, // Correct: TEXT - Assuming service_id holds the product UUID string
                service_name: item.service_name, // Correct: TEXT - Use service_name for the item name
                quantity: quantity, // Correct: integer
                unit_price: unit_price, // Add unit_price (assuming item.price is unit price)
                total_price: total_price, // Add total_price
                price: total_price, // Keep original 'price' field if schema has it (seems it might based on query output)
                type: itemType, // Correct: text
                service_type: itemType, // Add service_type if schema has it
                hsn_code: item.hsn_code, // Correct: text
                gst_percentage: item.gst_percentage, // Correct: numeric
                // REMOVED item_name
                // Add other columns if needed based on actual schema
              };
            });

            console.log(
              '🔍 usePOS - Inserting order items (v2):',
              itemsToInsert
            );

            const { error: itemsError } = await supabase
              .from('pos_order_items')
              .insert(itemsToInsert);

            if (itemsError) {
              console.error(
                '❌ usePOS - Failed to insert order items:',
                itemsError
              );
              // Optionally rollback order or log error, but proceed for now
              showToast.error(
                `Order created, but failed to save items: ${itemsError.message}`
              );
            } else {
              console.log('✅ usePOS - Successfully inserted order items');
            }
          }
          // *** END: Insert Order Items ***

          // Update sales history
          try {
            await syncToSalesHistory(insertedOrder);
          } catch (historyError) {
            console.error(
              '❌ usePOS - Error updating sales history:',
              historyError
            );
          }

          return {
            success: true,
            order: insertedOrder,
            message: 'Order created successfully',
          };
        } catch (orderError) {
          console.error(
            '❌ usePOS - Unexpected error creating order:',
            orderError
          );
          return {
            success: false,
            message: 'An unexpected error occurred',
            error:
              orderError instanceof Error
                ? orderError
                : new Error(String(orderError)),
          };
        }
      } catch (error) {
        console.error('❌ usePOS - Unexpected error creating order:', error);
        return {
          success: false,
          message: 'An unexpected error occurred',
          error: error instanceof Error ? error : new Error(String(error)),
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balance-stock'] });
      showToast.success('Walk-in order created successfully');
    },
    onError: error => {
      showToast.error('Failed to create order');
      console.error('Order error:', error);
    },
  });

  // Add a new mutation to update an existing order with additional payment
  const updateOrderPayment = useMutation<
    | {
        success: boolean;
        order: PosOrder;
        error?: undefined;
      }
    | {
        success: boolean;
        error: Error;
        order?: undefined;
      },
    Error,
    { orderId: string; paymentDetails: PaymentDetail }
  >({
    mutationFn: async ({
      orderId,
      paymentDetails,
    }): Promise<
      | {
          success: boolean;
          order: PosOrder;
        }
      | {
          success: boolean;
          error: Error;
        }
    > => {
      await new Promise(resolve => setTimeout(resolve, 500));
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
      if (!Array.isArray(safeOrder.payments)) {
        safeOrder.payments = [];
      }
      const updatedPayments = [...safeOrder.payments, safePaymentDetails];
      const totalInPaise = Math.round(safeOrder.total * 100);
      const subtotalInPaise = Math.round(safeOrder.subtotal * 100);
      const totalPaidInPaise = updatedPayments.reduce((sum, payment) => {
        return sum + Math.round(payment.amount * 100);
      }, 0);
      let pendingAmountInPaise = totalInPaise - totalPaidInPaise;
      if (Math.abs(totalPaidInPaise - subtotalInPaise) <= 100) {
        pendingAmountInPaise = 0;
      }
      if (pendingAmountInPaise <= 100) {
        pendingAmountInPaise = 0;
      }
      if (totalPaidInPaise >= totalInPaise) {
        pendingAmountInPaise = 0;
      }
      const pendingAmount = pendingAmountInPaise / 100;
      const wasIncomplete = safeOrder.status === 'pending';
      const isNowComplete = pendingAmount <= 0;
      const paymentStatusChanged = wasIncomplete && isNowComplete;
      const newOrderStatus = 'completed';
      const updatedOrderData = {
        payments: updatedPayments,
        pending_amount: pendingAmount,
        status: newOrderStatus,
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
        const hasProducts =
          Array.isArray(safeOrder.services) &&
          safeOrder.services.some(
            (service: any) =>
              service.type === 'product' || service.service?.type === 'product'
          );
        if (hasProducts) {
          try {
            const productsForStockUpdate = safeOrder.services
              .filter(
                (service: any) =>
                  (service.type === 'product' ||
                    service.service?.type === 'product') &&
                  (service.service_id || service.service?.id)
              )
              .map((item: any) => ({
                productId: item.service_id || item.service?.id,
                quantity: item.quantity || item.service?.quantity || 1,
              }));
            if (productsForStockUpdate.length > 0) {
              // Note: Stock reduction is handled automatically by database trigger 'trg_reduce_stock_on_insert'
              // when the order is inserted. No need to manually reduce stock here.
              const validUpdates = productsForStockUpdate
                .filter(
                  (update: {
                    productId: string | undefined;
                    quantity: number;
                  }) =>
                    typeof update.productId === 'string' &&
                    update.productId.length > 0
                )
                .map(
                  (update: {
                    productId: string | undefined;
                    quantity: number;
                  }) => ({
                    productId: update.productId as string,
                    quantity: update.quantity,
                  })
                );
              // Stock reduction will be handled by decrement_product_stock RPC if needed
            }
          } catch (error) {
            console.error('Error updating product stock quantities:', error);
          }
        }
      }
      const completeOrderResult = {
        ...safeOrder,
        ...updatedOrderData,
        services: safeOrder.services,
      };
      return { success: true, order: savedOrder || completeOrderResult };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-balance-stock'] });
      showToast.success('Payment updated successfully');
    },
    onError: error => {
      showToast.error('Failed to update payment');
      console.error('Payment update error:', error);
    },
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
      const hasCash = splitPayments.some(
        payment => payment.payment_method === 'cash'
      );
      const hasNonCash = splitPayments.some(
        payment => payment.payment_method !== 'cash'
      );
      const hasMixedPayments = hasCash && hasNonCash;
      const totalPaymentAmount = splitPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      let tax = 0;
      if (hasMixedPayments) {
        tax = Math.round((totalPaymentAmount * GST_RATE) / (1 + GST_RATE));
      } else if (hasNonCash) {
        tax = Math.round((totalPaymentAmount * GST_RATE) / (1 + GST_RATE));
      }
      const total = subtotal + tax - discount;
      return {
        subtotal: Math.round(subtotal),
        tax: tax,
        total: Math.round(total),
      };
    } else {
      const tax =
        paymentMethod === 'cash'
          ? 0
          : Math.round((subtotal * GST_RATE) / (1 + GST_RATE));
      const total = subtotal + tax - discount;
      return {
        subtotal: Math.round(subtotal),
        tax: tax,
        total: Math.round(total),
      };
    }
  };

  // This createOrder seems redundant given createWalkInOrder and processAppointmentPayment
  // Consider removing or clarifying its purpose if it's still needed.
  const createOrder = useMutation<
    OrderFunctionResult,
    Error,
    Partial<CreateOrderData>
  >({
    mutationFn: async (
      data: Partial<CreateOrderData>
    ): Promise<OrderFunctionResult> => {
      try {
        // Convert partial data to full data
        const fullData: CreateOrderData = {
          client_id: data.client_id || '',
          client_name: data.client_name || 'Walk-in Customer',
          stylist_id: data.stylist_id || '',
          items: data.items || [],
          services: data.services || [],
          payment_method: data.payment_method || 'cash',
          subtotal: data.subtotal || 0,
          tax: data.tax || 0,
          total: data.total || 0,
          total_amount: data.total_amount || data.total || 0,
          status: data.status || 'completed',
          order_date: data.order_date || new Date().toISOString(),
          is_walk_in: data.is_walk_in !== undefined ? data.is_walk_in : true,
          pending_amount: data.pending_amount || 0,
          payments: data.payments || [],
          discount: data.discount,
          discount_percentage: data.discount_percentage,
          split_payments: data.split_payments || [],
          consumption_purpose: data.consumption_purpose,
          consumption_notes: data.consumption_notes,
          is_salon_consumption: data.is_salon_consumption,
          appointment_id: data.appointment_id,
          appointment_time: data.appointment_time,
          stylist_name: data.stylist_name,
        };

        // Use the existing walkInOrder mutation to process the order
        return await createWalkInOrder.mutateAsync(fullData);
      } catch (error) {
        console.error('Error in createOrder:', error);
        return {
          success: false,
          message: 'Order creation failed',
          error: error instanceof Error ? error : new Error(String(error)),
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  // Add a delete order mutation (keep this for hook usage)
  const deleteOrderMutation = useMutation<
    { success: boolean; message: string },
    Error,
    string
  >({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  // Add update order mutation for editing existing orders
  const updateOrderMutation = useMutation<
    OrderFunctionResult,
    Error,
    { orderId: string; orderData: CreateOrderData }
  >({
    mutationFn: async ({
      orderId,
      orderData,
    }): Promise<OrderFunctionResult> => {
      try {
        console.log('Updating order:', orderId, 'with data:', orderData);

        // Validate required fields
        if (!orderData.client_name) {
          throw new Error('Client name is required');
        }

        if (orderData.total === undefined || orderData.total === null) {
          throw new Error('Total amount is required');
        }

        // First, check if the order exists
        const { data: existingOrder, error: checkError } = await supabase
          .from('pos_orders')
          .select('id')
          .eq('id', orderId)
          .single();

        if (checkError && checkError.code === 'PGRST116') {
          // Order doesn't exist, create it instead
          console.log('Order does not exist, creating new order instead of updating');
          
          // Generate formatted order ID
          const formattedOrderId = await generateNextOrderId(
            orderData.is_salon_consumption || false
          );

          // Create the order directly using Supabase
          const now = new Date().toISOString();
          const newOrder = {
            id: orderId,
            client_name: orderData.client_name,
            client_id: orderData.client_id,
            stylist_id: orderData.stylist_id,
            stylist_name: orderData.stylist_name,
            total: orderData.total,
            subtotal: orderData.subtotal,
            tax: orderData.tax,
            discount: orderData.discount,
            payment_method: orderData.payment_method,
            status: orderData.status || 'completed',
            consumption_purpose: orderData.consumption_purpose,
            consumption_notes: orderData.consumption_notes,
            is_salon_consumption: orderData.is_salon_consumption || false,
            is_walk_in: orderData.is_walk_in || false,
            payments: orderData.payments || [],
            created_at: now,
            tenant_id: '',
            user_id: (await supabase.auth.getUser()).data.user?.id || '',
            source: 'pos',
            invoice_number: orderData.invoice_number || formattedOrderId,
            order_id: formattedOrderId,
          };

          const { data: createdOrder, error: createError } = await supabase
            .from('pos_orders')
            .insert(newOrder)
            .select()
            .single();

          if (createError) {
            console.error('Error creating order:', createError);
            throw new Error(`Failed to create order: ${createError.message}`);
          }

          // Create order items if services are provided
          if (orderData.services && Array.isArray(orderData.services) && orderData.services.length > 0) {
            const orderItems = orderData.services.map((item: any) => ({
              id: uuidv4(),
              pos_order_id: orderId,
              service_id: item.id || item.service_id,
              service_name: item.name || item.service_name,
              service_type: item.type || 'service',
              price: item.price || 0,
              quantity: item.quantity || 1,
              gst_percentage: item.gst_percentage || 18,
              hsn_code: item.hsn_code || '',
              created_at: now,
            }));

            const { error: itemsError } = await supabase
              .from('pos_order_items')
              .insert(orderItems);

            if (itemsError) {
              console.error('Error creating order items:', itemsError);
              throw new Error(`Failed to create order items: ${itemsError.message}`);
            }
          }

          return {
            success: true,
            message: 'Order created successfully (was missing from database)',
            order: createdOrder,
          };
        }

        if (checkError) {
          console.error('Error checking if order exists:', checkError);
          throw new Error(`Failed to check order existence: ${checkError.message}`);
        }

        // Order exists, proceed with update
        console.log('Order exists, proceeding with update');

        // Prepare update data, only including fields that are provided
        const updateFields: any = {};
        
        if (orderData.client_name) updateFields.client_name = orderData.client_name;
        if (orderData.stylist_id) updateFields.stylist_id = orderData.stylist_id;
        if (orderData.stylist_name) updateFields.stylist_name = orderData.stylist_name;
        if (orderData.total !== undefined) updateFields.total = orderData.total;
        if (orderData.subtotal !== undefined) updateFields.subtotal = orderData.subtotal;
        if (orderData.tax !== undefined) updateFields.tax = orderData.tax;
        if (orderData.discount !== undefined) updateFields.discount = orderData.discount;
        if (orderData.payment_method) updateFields.payment_method = orderData.payment_method;
        if (orderData.status) updateFields.status = orderData.status;
        if (orderData.consumption_purpose) updateFields.consumption_purpose = orderData.consumption_purpose;
        if (orderData.consumption_notes) updateFields.consumption_notes = orderData.consumption_notes;
        if (orderData.is_salon_consumption !== undefined) updateFields.is_salon_consumption = orderData.is_salon_consumption;

        console.log('Update fields:', updateFields);

        // Update the order directly using Supabase
        const { data: updatedOrder, error: updateError } = await supabase
          .from('pos_orders')
          .update(updateFields)
          .eq('id', orderId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating order:', updateError);
          throw new Error(`Failed to update order: ${updateError.message}`);
        }

        // Update order items if services are provided
        if (orderData.services && Array.isArray(orderData.services) && orderData.services.length > 0) {
          // Delete existing order items
          const { error: deleteItemsError } = await supabase
            .from('pos_order_items')
            .delete()
            .eq('pos_order_id', orderId);

          if (deleteItemsError) {
            console.error('Error deleting existing order items:', deleteItemsError);
            throw new Error(`Failed to update order items: ${deleteItemsError.message}`);
          }

          // Create new order items
          const now = new Date().toISOString();
          const orderItems = orderData.services.map((item: any) => ({
            id: uuidv4(),
            pos_order_id: orderId,
            service_id: item.id || item.service_id,
            service_name: item.name || item.service_name,
            service_type: item.type || 'service',
            price: item.price || 0,
            quantity: item.quantity || 1,
            gst_percentage: item.gst_percentage || 18,
            hsn_code: item.hsn_code || '',
            created_at: now,
          }));

          const { error: itemsError } = await supabase
            .from('pos_order_items')
            .insert(orderItems);

          if (itemsError) {
            console.error('Error creating new order items:', itemsError);
            throw new Error(`Failed to create order items: ${itemsError.message}`);
          }
        }

        return {
          success: true,
          message: 'Order updated successfully',
          order: updatedOrder,
        };
      } catch (error) {
        console.error('Error updating order:', error);
        return {
          success: false,
          message: 'Order update failed',
          error: error instanceof Error ? error : new Error(String(error)),
        };
      }
    },
    onSuccess: result => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['clients'] });
        showToast.success('Order updated successfully');
      } else {
        showToast.error(result.message || 'Failed to update order');
      }
    },
    onError: error => {
      showToast.error('Failed to update order');
      console.error('Order update error:', error);
    },
  });

  return {
    loading,
    error,
    products,
    setProducts,
    cartItems,
    setCartItems,
    unpaidAppointments,
    loadingAppointments,
    orders,
    loadingOrders,
    processAppointmentPayment,
    createWalkInOrder,
    updateOrderPayment,
    updateOrder: updateOrderMutation,
    calculateTotal,
    createOrder,
    deleteOrder: deleteOrderMutation, // Rename to avoid confusion with the standalone function
  };
}

import { supabase } from '../lib/supabase';

// Function to check if an order is a salon consumption order
export const isSalonConsumptionOrder = (order: any) => {
  return (
    order.is_salon_consumption === true ||
    order.type === 'salon_consumption' ||
    order.type === 'salon-consumption' ||
    order.consumption_purpose ||
    order.client_name === 'Salon Consumption'
  );
};

// Function to renumber all orders sequentially
export const renumberAllOrders = async (): Promise<void> => {
  try {
    console.log('Starting order renumbering process...');

    // Fetch all orders sorted by creation date
    const { data: allOrders, error } = await supabase
      .from('pos_orders')
      .select(
        'id, created_at, is_salon_consumption, consumption_purpose, type, client_name'
      )
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching orders for renumbering:', error);
      throw error;
    }

    if (!allOrders || allOrders.length === 0) {
      console.log('No orders found to renumber.');
      return;
    }

    // Separate sales and salon consumption orders
    const salesOrders = allOrders.filter(
      order => !isSalonConsumptionOrder(order)
    );
    const salonOrders = allOrders.filter(order =>
      isSalonConsumptionOrder(order)
    );

    console.log(
      `Found ${salesOrders.length} sales orders and ${salonOrders.length} salon consumption orders`
    );

    // Renumber sales orders
    for (let i = 0; i < salesOrders.length; i++) {
      const order = salesOrders[i];
      const orderNumber = String(i + 1).padStart(4, '0');
      const year = new Date(order.created_at).getFullYear();
      const yearFormat =
        year >= 2025
          ? '2526'
          : `${year.toString().slice(-2)}${Math.floor(year / 100)}`;
      const newOrderId = `RNG${orderNumber}/${yearFormat}`;

      const { error: updateError } = await supabase
        .from('pos_orders')
        .update({ invoice_number: newOrderId })
        .eq('id', order.id);

      if (updateError) {
        console.error(`Error updating sales order ${order.id}:`, updateError);
      } else {
        console.log(
          `Renumbered sales order ${order.id}: -> ${newOrderId}`
        );
      }
    }

    // Renumber salon consumption orders
    for (let i = 0; i < salonOrders.length; i++) {
      const order = salonOrders[i];
      const orderNumber = String(i + 1).padStart(4, '0');
      const year = new Date(order.created_at).getFullYear();
      const yearFormat =
        year >= 2025
          ? '2526'
          : `${year.toString().slice(-2)}${Math.floor(year / 100)}`;
      const newOrderId = `SC${orderNumber}/${yearFormat}`;

      const { error: updateError } = await supabase
        .from('pos_orders')
        .update({ invoice_number: newOrderId })
        .eq('id', order.id);

      if (updateError) {
        console.error(`Error updating salon order ${order.id}:`, updateError);
      } else {
        console.log(
          `Renumbered salon order ${order.id}: -> ${newOrderId}`
        );
      }
    }

    console.log('Order renumbering completed successfully!');
  } catch (error) {
    console.error('Error during order renumbering:', error);
    throw error;
  }
};

// Function to renumber orders after deletion
export const renumberOrdersAfterDeletion = async (
  deletedOrderId: string
): Promise<void> => {
  try {
    console.log(`Renumbering orders after deletion of ${deletedOrderId}...`);

    // First, get the deleted order to determine its type and creation date
    const { data: deletedOrder, error: fetchError } = await supabase
      .from('pos_orders')
      .select(
        'id, created_at, is_salon_consumption, consumption_purpose, type, client_name'
      )
      .eq('id', deletedOrderId)
      .single();

    if (fetchError) {
      console.error('Error fetching deleted order:', fetchError);
      return;
    }

    if (!deletedOrder) {
      console.log('Deleted order not found, skipping renumbering');
      return;
    }

    const isDeletedOrderSalon = isSalonConsumptionOrder(deletedOrder);
    const deletedOrderDate = new Date(deletedOrder.created_at);

    // Get all orders of the same type that were created after the deleted order
    const { data: subsequentOrders, error: subsequentError } = await supabase
      .from('pos_orders')
      .select(
        'id, created_at, is_salon_consumption, consumption_purpose, type, client_name'
      )
      .gte('created_at', deletedOrder.created_at)
      .order('created_at', { ascending: true });

    if (subsequentError) {
      console.error('Error fetching subsequent orders:', subsequentError);
      return;
    }

    if (!subsequentOrders || subsequentOrders.length === 0) {
      console.log('No subsequent orders found to renumber');
      return;
    }

    // Filter to only orders of the same type
    const sameTypeSubsequentOrders = subsequentOrders.filter(
      order => isSalonConsumptionOrder(order) === isDeletedOrderSalon
    );

    console.log(
      `Found ${sameTypeSubsequentOrders.length} ${isDeletedOrderSalon ? 'salon' : 'sales'} orders to renumber`
    );

    // Get all orders of the same type that were created before the deleted order
    const { data: previousOrders, error: previousError } = await supabase
      .from('pos_orders')
      .select(
        'id, created_at, is_salon_consumption, consumption_purpose, type, client_name'
      )
      .lt('created_at', deletedOrder.created_at)
      .order('created_at', { ascending: true });

    if (previousError) {
      console.error('Error fetching previous orders:', previousError);
      return;
    }

    const sameTypePreviousOrders = previousOrders
      ? previousOrders.filter(
          order => isSalonConsumptionOrder(order) === isDeletedOrderSalon
        )
      : [];

    // Calculate the starting number for renumbering
    const startNumber = sameTypePreviousOrders.length + 1;

    // Renumber the subsequent orders
    for (let i = 0; i < sameTypeSubsequentOrders.length; i++) {
      const order = sameTypeSubsequentOrders[i];
      const orderNumber = String(startNumber + i).padStart(4, '0');
      const year = new Date(order.created_at).getFullYear();
      const yearFormat =
        year >= 2025
          ? '2526'
          : `${year.toString().slice(-2)}${Math.floor(year / 100)}`;
      const newOrderId = isDeletedOrderSalon
        ? `SC${orderNumber}/${yearFormat}`
        : `RNG${orderNumber}/${yearFormat}`;

      const { error: updateError } = await supabase
        .from('pos_orders')
        .update({ invoice_number: newOrderId })
        .eq('id', order.id);

      if (updateError) {
        console.error(`Error updating order ${order.id}:`, updateError);
      } else {
        console.log(
          `Renumbered order ${order.id}: -> ${newOrderId}`
        );
      }
    }

    console.log('Order renumbering after deletion completed successfully!');
  } catch (error) {
    console.error('Error during post-deletion renumbering:', error);
    throw error;
  }
};

// Function to get the next order ID for a specific type
export const getNextOrderId = async (
  isSalonOrder: boolean = false
): Promise<string> => {
  try {
    // Get all orders of the specified type
    const { data: orders, error } = await supabase
      .from('pos_orders')
      .select(
        'id, created_at, is_salon_consumption, consumption_purpose, type, client_name'
      )
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching orders for next ID generation:', error);
      throw error;
    }

    if (!orders || orders.length === 0) {
      // First order
      const year = new Date().getFullYear();
      const yearFormat =
        year >= 2025
          ? '2526'
          : `${year.toString().slice(-2)}${Math.floor(year / 100)}`;
      return isSalonOrder ? `SC0001/${yearFormat}` : `RNG0001/${yearFormat}`;
    }

    // Filter orders by type
    const sameTypeOrders = orders.filter(
      order => isSalonConsumptionOrder(order) === isSalonOrder
    );

    // Get the next order number
    const orderNumber = sameTypeOrders.length + 1;
    const formattedNumber = String(orderNumber).padStart(4, '0');

    // Get the year from the current date
    const year = new Date().getFullYear();
    const yearFormat =
      year >= 2025
        ? '2526'
        : `${year.toString().slice(-2)}${Math.floor(year / 100)}`;

    // Return the formatted ID based on order type
    return isSalonOrder
      ? `SC${formattedNumber}/${yearFormat}`
      : `RNG${formattedNumber}/${yearFormat}`;
  } catch (error) {
    console.error('Error generating next order ID:', error);
    // Fallback to timestamp-based ID
    const timestamp = Date.now().toString().slice(-8);
    const year = new Date().getFullYear();
    const yearFormat =
      year >= 2025
        ? '2526'
        : `${year.toString().slice(-2)}${Math.floor(year / 100)}`;
    return isSalonOrder
      ? `SC${timestamp}/${yearFormat}`
      : `RNG${timestamp}/${yearFormat}`;
  }
};

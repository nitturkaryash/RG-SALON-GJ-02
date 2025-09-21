import { getNextOrderId, isSalonConsumptionOrder } from './orderRenumbering';
import { supabase } from '../lib/supabase';

// Function to generate the next sequential order ID
export const generateNextOrderId = async (
  isSalonOrder: boolean = false,
  isMembershipOrder: boolean = false
): Promise<string> => {
  return await getNextOrderId(isSalonOrder, isMembershipOrder);
};

// Function to update existing orders with formatted order IDs (for migration)
export const updateExistingOrdersWithFormattedIds = async (): Promise<void> => {
  try {
    console.log('Starting migration of existing orders to formatted IDs...');

    const { data: orders, error } = await supabase
      .from('pos_orders')
      .select(
        'id, created_at, is_salon_consumption, consumption_purpose, type, client_name, order_id'
      )
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching orders for migration:', error);
      return;
    }

    if (!orders || orders.length === 0) {
      console.log('No orders found to migrate.');
      return;
    }

    // Sort orders by creation date
    const sortedOrders = [...orders].sort((a, b) => {
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      return dateA - dateB;
    });

    // Separate salon and sales orders
    const salesOrders = sortedOrders.filter(
      order => !isSalonConsumptionOrder(order)
    );
    const salonOrders = sortedOrders.filter(order =>
      isSalonConsumptionOrder(order)
    );

    // Update sales orders
    for (let i = 0; i < salesOrders.length; i++) {
      const order = salesOrders[i];
      const orderNumber = String(i + 1).padStart(4, '0');
      const year = new Date(order.created_at).getFullYear();
      const yearFormat =
        year >= 2025
          ? '2526'
          : `${year.toString().slice(-2)}${Math.floor(year / 100)}`;
      const formattedId = `RNG${orderNumber}/${yearFormat}`;

      const { error: updateError } = await supabase
        .from('pos_orders')
        .update({ order_id: formattedId })
        .eq('id', order.id);

      if (updateError) {
        console.error(`Error updating order ${order.id}:`, updateError);
      } else {
        console.log(`Updated order ${order.id} with ID: ${formattedId}`);
      }
    }

    // Update salon orders
    for (let i = 0; i < salonOrders.length; i++) {
      const order = salonOrders[i];
      const orderNumber = String(i + 1).padStart(4, '0');
      const year = new Date(order.created_at).getFullYear();
      const yearFormat =
        year >= 2025
          ? '2526'
          : `${year.toString().slice(-2)}${Math.floor(year / 100)}`;
      const formattedId = `SC${orderNumber}/${yearFormat}`;

      const { error: updateError } = await supabase
        .from('pos_orders')
        .update({ order_id: formattedId })
        .eq('id', order.id);

      if (updateError) {
        console.error(`Error updating order ${order.id}:`, updateError);
      } else {
        console.log(`Updated order ${order.id} with ID: ${formattedId}`);
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  }
};

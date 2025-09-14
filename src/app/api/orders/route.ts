import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { showToast, handleError } from '../../utils/toastUtils';

// Define OrderData interface locally since we can't import from the WhatsApp module
interface OrderData {
  id: string;
  client_name: string;
  client_phone?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    type: string;
  }>;
  total_amount: number;
  payment_method: string;
  status: string;
  stylist?: string;
  created_at: string;
}

// Mock WhatsApp automation for now
const WhatsAppAutomation = {
  handleOrderCreated: async (orderData: OrderData) => {
    console.log('WhatsApp order created:', orderData);
    return true;
  },
  handleOrderUpdated: async (orderData: OrderData, updateData: any) => {
    console.log('WhatsApp order updated:', orderData, updateData);
    return true;
  },
  handleOrderCancelled: async (orderData: OrderData, reason: string) => {
    console.log('WhatsApp order cancelled:', orderData, reason);
    return true;
  },
};

// NEW Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('🔧 Orders API using NEW Supabase credentials');
console.log('📡 URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Fetch orders
export async function GET(req: Request) {
  try {
    const { data: orders, error } = await supabase
      .from('pos_orders')
      .select(
        `
        *,
        pos_order_items (
          id,
          service_name,
          service_type,
          price,
          quantity,
          gst_percentage,
          hsn_code
        )
      `
      )
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, orders }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch orders';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        message: 'Unable to retrieve orders. Please try again later.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// POST - Create new order with auto WhatsApp message
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      client_name,
      client_phone,
      items,
      total,
      payment_method = 'cash',
      stylist,
      type = 'sale',
      consumption_purpose,
      consumption_notes,
      is_salon_consumption = false,
    } = body;

    if (!client_name || !items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: client_name, items',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const orderId = uuidv4();
    const now = new Date().toISOString();

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('pos_orders')
      .insert({
        id: orderId,
        client_name,
        consumption_purpose,
        consumption_notes,
        total: total || 0,
        type,
        is_salon_consumption,
        status: 'completed',
        payment_method,
        created_at: now,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map((item: any) => ({
      id: uuidv4(),
      pos_order_id: orderId,
      service_id: item.service_id || item.id,
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

    if (itemsError) throw itemsError;

    // Prepare data for WhatsApp automation
    const orderData: OrderData = {
      id: orderId,
      client_name,
      client_phone,
      items: items.map((item: any) => ({
        name: item.name || item.service_name,
        quantity: item.quantity || 1,
        price: item.price || 0,
        type: item.type || 'service',
      })),
      total_amount: total || 0,
      payment_method,
      status: 'completed',
      stylist,
      created_at: now,
    };

    // Send automatic WhatsApp message
    let whatsappSent = false;
    if (client_phone && !is_salon_consumption) {
      try {
        whatsappSent = await WhatsAppAutomation.handleOrderCreated(orderData);
      } catch (whatsappError) {
        console.error('WhatsApp automation error:', whatsappError);
        // Don't fail the order creation if WhatsApp fails
      }
    }

    return new Response(
      JSON.stringify({
      success: true,
      message: 'Order created successfully',
      order: {
        ...order,
        items: orderItems,
      },
      whatsapp_sent: whatsappSent,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create order';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        message:
          'Unable to create order. Please check your data and try again.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// PUT - Update order with auto WhatsApp message
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, services, items, ...updateData } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Order ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate required fields
    if (!updateData.client_name) {
      return new Response(
        JSON.stringify({ success: false, error: 'Client name is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!updateData.total && updateData.total !== 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Total amount is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get existing order for comparison
    const { data: existingOrder, error: fetchError } = await supabase
      .from('pos_orders')
      .select(
        `
        *,
        pos_order_items (
          id,
          service_name,
          service_type,
          price,
          quantity,
          gst_percentage,
          hsn_code
        )
      `
      )
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching existing order:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!existingOrder) {
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Update the order
    const { data: updatedOrder, error: updateError } = await supabase
      .from('pos_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating order:', updateError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to update order: ${updateError.message}`,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Update order items if services/items are provided
    if (services && Array.isArray(services) && services.length > 0) {
      // Delete existing order items
      const { error: deleteItemsError } = await supabase
        .from('pos_order_items')
        .delete()
        .eq('pos_order_id', id);

      if (deleteItemsError) {
        console.error('Error deleting existing order items:', deleteItemsError);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to update order items: ${deleteItemsError.message}`,
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Create new order items
      const now = new Date().toISOString();
      const orderItems = services.map((item: any) => ({
        id: uuidv4(),
        pos_order_id: id,
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
        return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to create order items: ${itemsError.message}`,
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Get updated order items for WhatsApp automation
    const { data: updatedOrderItems, error: itemsFetchError } = await supabase
      .from('pos_order_items')
      .select('*')
      .eq('pos_order_id', id);

    if (itemsFetchError) {
      console.error('Error fetching updated order items:', itemsFetchError);
    }

    // Prepare data for WhatsApp automation
    const orderData: OrderData = {
      id: updatedOrder.id,
      client_name: updatedOrder.client_name,
      client_phone: updateData.client_phone || existingOrder.client_phone,
      items: (updatedOrderItems || existingOrder.pos_order_items).map(
        (item: any) => ({
        name: item.service_name,
        quantity: item.quantity,
        price: item.price,
        type: item.service_type,
        })
      ),
      total_amount: updatedOrder.total,
      payment_method: updatedOrder.payment_method,
      status: updatedOrder.status,
      stylist: updateData.stylist_name || updateData.stylist,
      created_at: updatedOrder.created_at,
    };

    // Send automatic WhatsApp message
    let whatsappSent = false;
    if (orderData.client_phone && !updatedOrder.is_salon_consumption) {
      try {
        whatsappSent = await WhatsAppAutomation.handleOrderUpdated(
          orderData,
          updateData
        );
      } catch (whatsappError) {
        console.error('WhatsApp automation error:', whatsappError);
      }
    }

    return new Response(
      JSON.stringify({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder,
      whatsapp_sent: whatsappSent,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error updating order:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update order';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        message:
          'Unable to update order. Please check your data and try again.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// DELETE - Cancel/delete order with auto WhatsApp message
export async function DELETE(req: Request) {
  try {
    console.log('🗑️ DELETE order request received');
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const reason = searchParams.get('reason') || 'Order cancelled';

    console.log('🗑️ Order ID:', id, 'Reason:', reason);

    if (!id) {
      console.log('❌ No order ID provided');
      return new Response(
        JSON.stringify({ success: false, error: 'Order ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get existing order for WhatsApp notification
    console.log('🔍 Fetching existing order...');
    const { data: existingOrder, error: fetchError } = await supabase
      .from('pos_orders')
      .select(
        `
        *,
        pos_order_items (
          id,
          service_name,
          service_type,
          price,
          quantity,
          gst_percentage,
          hsn_code
        )
      `
      )
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching existing order:', fetchError);
      throw fetchError;
    }
    
    console.log('✅ Existing order fetched successfully:', existingOrder?.id);
    
    if (!existingOrder) {
      console.log('❌ Order not found');
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Update client's total spend and other financial records
    console.log('💰 Updating client financial records...');
    if (
      existingOrder &&
      existingOrder.client_name &&
      !existingOrder.is_salon_consumption
    ) {
      try {
        console.log('💰 Client name:', existingOrder.client_name);
        // Temporarily skip client updates to isolate the issue
        console.log('💰 Client updates skipped for debugging');
      } catch (e) {
        console.error(
          'An unexpected error occurred while updating client financials:',
          e
        );
      }
    } else {
      console.log(
        '💰 Skipping client updates (no client name or salon consumption)'
      );
    }

    // Delete order items first
    console.log('🗑️ Deleting order items...');
    console.log('🗑️ Order ID for deletion:', id);
    
    const { error: itemsDeleteError } = await supabase
      .from('pos_order_items')
      .delete()
      .eq('pos_order_id', id);

    if (itemsDeleteError) {
      console.error('❌ Error deleting order items:', itemsDeleteError);
      throw itemsDeleteError;
    }
    console.log('✅ Order items deleted successfully');

    // Delete the order
    console.log('🗑️ Deleting order...');
    const { error: orderDeleteError } = await supabase
      .from('pos_orders')
      .delete()
      .eq('id', id);

    if (orderDeleteError) {
      console.error('❌ Error deleting order:', orderDeleteError);
      throw orderDeleteError;
    }
    console.log('✅ Order deleted successfully');

    // Prepare data for WhatsApp automation
    const orderData: OrderData = {
      id: existingOrder.id,
      client_name: existingOrder.client_name,
      client_phone: existingOrder.client_phone,
      items: existingOrder.pos_order_items.map((item: any) => ({
        name: item.service_name,
        quantity: item.quantity,
        price: item.price,
        type: item.service_type,
      })),
      total_amount: existingOrder.total,
      payment_method: existingOrder.payment_method,
      status: existingOrder.status,
      created_at: existingOrder.created_at,
    };

    // Send automatic WhatsApp message
    let whatsappSent = false;
    if (orderData.client_phone && !existingOrder.is_salon_consumption) {
      try {
        console.log('📱 Sending WhatsApp notification...');
        // Temporarily disable WhatsApp to isolate the issue
        // whatsappSent = await WhatsAppAutomation.handleOrderDeleted(
        //   orderData,
        //   reason
        // );
        console.log('✅ WhatsApp notification skipped for debugging');
      } catch (whatsappError) {
        console.error('❌ WhatsApp automation error:', whatsappError);
        // Don't fail the deletion if WhatsApp fails
      }
    } else {
      console.log(
        '📱 Skipping WhatsApp notification (no phone or salon consumption)'
      );
    }

    return new Response(
      JSON.stringify({
      success: true,
      message: 'Order deleted successfully',
      whatsapp_sent: whatsappSent,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Error deleting order:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
    });
    
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to delete order';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        message: 'Unable to delete order. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

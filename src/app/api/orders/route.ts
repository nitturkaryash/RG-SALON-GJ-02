import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { WhatsAppAutomation, OrderData } from '@/whatsapp/business-api/utils/whatsappAutomation';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Fetch orders
export async function GET(req: Request) {
  try {
    const { data: orders, error } = await supabase
      .from('pos_orders')
      .select(`
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
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
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
      is_salon_consumption = false
    } = body;

    if (!client_name || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: client_name, items' },
        { status: 400 }
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
        created_at: now
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
      created_at: now
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
        type: item.type || 'service'
      })),
      total_amount: total || 0,
      payment_method,
      status: 'completed',
      stylist,
      created_at: now
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

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: {
        ...order,
        items: orderItems
      },
      whatsapp_sent: whatsappSent
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// PUT - Update order with auto WhatsApp message
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get existing order for comparison
    const { data: existingOrder, error: fetchError } = await supabase
      .from('pos_orders')
      .select(`
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
      `)
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Update the order
    const { data: updatedOrder, error: updateError } = await supabase
      .from('pos_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Prepare data for WhatsApp automation
    const orderData: OrderData = {
      id: updatedOrder.id,
      client_name: updatedOrder.client_name,
      client_phone: updateData.client_phone || existingOrder.client_phone,
      items: existingOrder.pos_order_items.map((item: any) => ({
        name: item.service_name,
        quantity: item.quantity,
        price: item.price,
        type: item.service_type
      })),
      total_amount: updatedOrder.total,
      payment_method: updatedOrder.payment_method,
      status: updatedOrder.status,
      stylist: updateData.stylist,
      created_at: updatedOrder.created_at
    };

    // Send automatic WhatsApp message
    let whatsappSent = false;
    if (orderData.client_phone && !updatedOrder.is_salon_consumption) {
      try {
        whatsappSent = await WhatsAppAutomation.handleOrderUpdated(orderData, updateData);
      } catch (whatsappError) {
        console.error('WhatsApp automation error:', whatsappError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder,
      whatsapp_sent: whatsappSent
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel/delete order with auto WhatsApp message
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const reason = searchParams.get('reason') || 'Order cancelled';

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get existing order for WhatsApp notification
    const { data: existingOrder, error: fetchError } = await supabase
      .from('pos_orders')
      .select(`
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
      `)
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete order items first
    const { error: itemsDeleteError } = await supabase
      .from('pos_order_items')
      .delete()
      .eq('pos_order_id', id);

    if (itemsDeleteError) throw itemsDeleteError;

    // Delete the order
    const { error: orderDeleteError } = await supabase
      .from('pos_orders')
      .delete()
      .eq('id', id);

    if (orderDeleteError) throw orderDeleteError;

    // Prepare data for WhatsApp automation
    const orderData: OrderData = {
      id: existingOrder.id,
      client_name: existingOrder.client_name,
      client_phone: existingOrder.client_phone,
      items: existingOrder.pos_order_items.map((item: any) => ({
        name: item.service_name,
        quantity: item.quantity,
        price: item.price,
        type: item.service_type
      })),
      total_amount: existingOrder.total,
      payment_method: existingOrder.payment_method,
      status: existingOrder.status,
      created_at: existingOrder.created_at
    };

    // Send automatic WhatsApp message
    let whatsappSent = false;
    if (orderData.client_phone && !existingOrder.is_salon_consumption) {
      try {
        whatsappSent = await WhatsAppAutomation.handleOrderDeleted(orderData, reason);
      } catch (whatsappError) {
        console.error('WhatsApp automation error:', whatsappError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
      whatsapp_sent: whatsappSent
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete order' },
      { status: 500 }
    );
  }
} 
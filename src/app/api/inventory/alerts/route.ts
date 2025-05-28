import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { WhatsAppAutomation, InventoryAlertData } from '@/whatsapp/business-api/utils/whatsappAutomation';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Check for low stock items and send alerts
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const managerPhone = searchParams.get('manager_phone');
    const threshold = parseInt(searchParams.get('threshold') || '10');
    const sendAlerts = searchParams.get('send_alerts') === 'true';

    if (!managerPhone && sendAlerts) {
      return NextResponse.json(
        { success: false, error: 'Manager phone number is required for sending alerts' },
        { status: 400 }
      );
    }

    // Query to get low stock items
    // This assumes you have a balance_stock view or table
    const { data: lowStockItems, error } = await supabase
      .from('inventory_balance_stock')
      .select('*')
      .lt('balance_qty', threshold)
      .gt('balance_qty', 0); // Only items with some stock left

    if (error) {
      console.error('Error querying inventory:', error);
      // If the table doesn't exist, return empty results
      return NextResponse.json({
        success: true,
        low_stock_items: [],
        alerts_sent: 0,
        message: 'Inventory system not set up or no low stock items found'
      });
    }

    const alertsSent = [];
    
    if (sendAlerts && managerPhone && lowStockItems && lowStockItems.length > 0) {
      for (const item of lowStockItems) {
        try {
          const alertData: InventoryAlertData = {
            product_name: item.product_name,
            current_stock: item.balance_qty,
            min_threshold: threshold,
            manager_phone: managerPhone
          };

          const success = await WhatsAppAutomation.handleInventoryLowStock(alertData);
          if (success) {
            alertsSent.push(item.product_name);
          }
        } catch (alertError) {
          console.error(`Error sending alert for ${item.product_name}:`, alertError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      low_stock_items: lowStockItems || [],
      alerts_sent: alertsSent.length,
      alerted_products: alertsSent,
      threshold_used: threshold
    });

  } catch (error) {
    console.error('Error checking inventory alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check inventory alerts' },
      { status: 500 }
    );
  }
}

// POST - Manually send inventory alert for specific product
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      product_name,
      current_stock,
      min_threshold,
      manager_phone
    } = body;

    if (!product_name || !manager_phone || current_stock === undefined || !min_threshold) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: product_name, current_stock, min_threshold, manager_phone' 
        },
        { status: 400 }
      );
    }

    const alertData: InventoryAlertData = {
      product_name,
      current_stock,
      min_threshold,
      manager_phone
    };

    const success = await WhatsAppAutomation.handleInventoryLowStock(alertData);

    return NextResponse.json({
      success: true,
      message: 'Inventory alert sent successfully',
      alert_sent: success,
      product: product_name
    });

  } catch (error) {
    console.error('Error sending inventory alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send inventory alert' },
      { status: 500 }
    );
  }
} 
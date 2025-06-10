// Script to check if pos_orders table has appointment_id column
const { createClient } = require('@supabase/supabase-js');

// Create a Supabase client directly here to avoid import issues
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPosOrdersTable() {
  try {
    // Check for table columns
    console.log("Checking pos_orders table structure...");
    
    // Get sample orders
    const { data: orders, error: ordersError } = await supabase
      .from('pos_orders')
      .select('*')
      .limit(5);
      
    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      return;
    }
    
    console.log("Sample orders:", JSON.stringify(orders, null, 2));
    
    // Check if appointment_id exists in the sample data
    const hasAppointmentId = orders.length > 0 && Object.keys(orders[0]).includes('appointment_id');
    console.log("Has appointment_id column (based on sample data):", hasAppointmentId);
    
    // Check orders with appointment_id if column exists
    if (hasAppointmentId) {
      const { data: ordersWithAppointment, error: appointmentError } = await supabase
        .from('pos_orders')
        .select('*')
        .not('appointment_id', 'is', null)
        .limit(5);
        
      if (appointmentError) {
        console.error("Error fetching orders with appointment_id:", appointmentError);
        return;
      }
      
      console.log("Orders with appointment_id:", ordersWithAppointment.length);
      console.log("Sample orders with appointment_id:", JSON.stringify(ordersWithAppointment, null, 2));
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

checkPosOrdersTable(); 
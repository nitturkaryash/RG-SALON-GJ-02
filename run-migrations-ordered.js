import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client with anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mtyudylsozncvilibxda.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

// Order migrations based on dependencies
const migrationOrder = [
  // Base tables first
  '20230716_recreate_products_table.sql',
  '20230717_recreate_inventory_products_table.sql',
  '20230715_add_missing_product_columns.sql',
  
  // Sales and inventory tables
  '20250420_create_sales_product_new.sql',
  '20250409_create_inventory_salon_consumption.sql',
  '20250410000000_create_salon_consumption_products_table.sql',
  '20250411000001_ensure_salon_consumption_table.sql',
  
  // Views and functions
  '20250410000001_create_salon_consumption_products_view.sql',
  '20250411000000_ensure_salon_consumption_view.sql',
  '20250109_create_increment_product_stock_function.sql',
  '20250421_create_decrement_product_stock_rpc.sql',
  
  // Additional features
  '20250504105050_multitenancy_setup.sql',
  '20250508_add_inventory_salon_consumption_tax_columns.sql',
  '202505150000_create_purchase_history_with_stock.sql',
  '202505240000_add_tax_inlcuding_disc_to_purchase_history_with_stock.sql',
  '20250601_update_sales_product_view.sql',
  '20250614000000_fix_opening_balance_constraint.sql',
  '20250615_add_remaining_stock_to_sales_view.sql',
  '20250618000000_user_based_schema_migration.sql',
  '20250619000000_fix_admin_users_rls.sql',
  
  // Membership and appointments
  '20250801_create_members_table.sql',
  '20250820_drop_membership_tiers_name_unique_constraint.sql',
  '20250319015014_add_checked_in_to_appointments.sql',
  '20250505000000_add_reminder_sent.sql',
  '20250520_add_current_balance_to_members.sql',
  '20250521_add_is_for_someone_else_to_appointments.sql',
  '20251028000000_add_booking_id_to_appointments.sql',
  
  // Price history
  '20250620121346_create_product_price_history_table.sql',
  'create_product_price_history.sql',
  'create_purchase_history_trigger.sql'
];

async function runMigrations() {
  try {
    console.log('🔄 Running migrations in order...\n');

    const migrationsDir = './supabase/migrations';

    // Run each migration in order
    for (const file of migrationOrder) {
      console.log(`📄 Processing ${file}...`);
      
      const filePath = path.join(migrationsDir, file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ Migration file not found: ${file}`);
        continue;
      }
      
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        // Split SQL into individual statements
        const statements = sql.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
          if (!statement.trim()) continue;
          
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          
          if (error) {
            console.log(`❌ Error in ${file}:`, error.message);
            if (error.message.includes('permission denied')) {
              console.log('This appears to be a permissions issue. Please run migrations using the Supabase dashboard or CLI.');
              return;
            }
            // Continue with next statement even if this one failed
          }
        }
        
        console.log(`✅ Processed ${file}`);
      } catch (error) {
        console.error(`❌ Failed to apply ${file}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

console.log('Supabase URL:', supabaseUrl);
console.log('---\n');

runMigrations().catch(console.error); 
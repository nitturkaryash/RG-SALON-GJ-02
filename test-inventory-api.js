import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://mtyudylsozncvilibxda.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInventoryAPI() {
    console.log('🔍 Testing Inventory API...\n');

    try {
        // 1. Test inventory_purchases table
        console.log('1️⃣ Testing inventory_purchases table:');
        const { data: purchases, error: purchasesError } = await supabase
            .from('inventory_purchases')
            .select('*')
            .limit(1);
        
        if (purchasesError) {
            console.error('❌ Error accessing inventory_purchases:', purchasesError.message);
        } else {
            console.log('✅ Successfully accessed inventory_purchases');
            console.log('Sample data:', purchases);
        }
        console.log('\n');

        // 2. Test inventory_sales table
        console.log('2️⃣ Testing inventory_sales table:');
        const { data: sales, error: salesError } = await supabase
            .from('inventory_sales')
            .select('*')
            .limit(1);
        
        if (salesError) {
            console.error('❌ Error accessing inventory_sales:', salesError.message);
        } else {
            console.log('✅ Successfully accessed inventory_sales');
            console.log('Sample data:', sales);
        }
        console.log('\n');

        // 3. Test inventory_balance_stock table
        console.log('3️⃣ Testing inventory_balance_stock table:');
        const { data: stock, error: stockError } = await supabase
            .from('inventory_balance_stock')
            .select('*')
            .limit(1);
        
        if (stockError) {
            console.error('❌ Error accessing inventory_balance_stock:', stockError.message);
        } else {
            console.log('✅ Successfully accessed inventory_balance_stock');
            console.log('Sample data:', stock);
        }
        console.log('\n');

        // 4. Test sales_products table
        console.log('4️⃣ Testing sales_products table:');
        const { data: products, error: productsError } = await supabase
            .from('sales_products')
            .select('*')
            .limit(1);
        
        if (productsError) {
            console.error('❌ Error accessing sales_products:', productsError.message);
        } else {
            console.log('✅ Successfully accessed sales_products');
            console.log('Sample data:', products);
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

// Run the tests
testInventoryAPI(); 
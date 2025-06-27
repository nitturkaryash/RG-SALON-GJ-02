import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mtyudylsozncvilibxda.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXVkeWxzb3puY3ZpbGlieGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTE0MTIsImV4cCI6MjA2NTQ2NzQxMn0.KJP6Pu3jaheEj8wTPioZsRUNRnkKH88hcRgvS97FOZA';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

async function runTests() {
    console.log('🔍 Running Supabase REST API Tests...\n');

    try {
        // 1. Test Basic Connection
        console.log('1️⃣ Testing Basic Connection:');
        const { data: versionData, error: versionError } = await supabase
            .from('inventory_salon_consumption')
            .select('count')
            .limit(1);

        if (versionError) {
            console.log('❌ Connection failed:', versionError.message);
            if (versionError.message.includes('JWT')) {
                console.log('This appears to be an authentication issue. Trying to authenticate...');
                
                // Try to authenticate
                const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                    email: 'admin@example.com',
                    password: 'admin'
                });

                if (authError) {
                    console.log('❌ Authentication failed:', authError.message);
                    return;
                }

                console.log('✅ Authentication successful');
                console.log('User:', authData.user.email);
            }
        } else {
            console.log('✅ Connection successful');
        }

        // 2. List All Tables
        console.log('\n2️⃣ Listing Available Tables:');
        const tablesToTest = [
            'inventory_consumption',
            'inventory_salon_consumption',
            'inventory_purchases',
            'inventory_sales',
            'inventory_balance_stock',
            'sales_products'
        ];
        
        for (const table of tablesToTest) {
            const { data, error: tableError } = await supabase
                .from(table)
                .select('count')
                .limit(1);
            
            console.log(`${table}:`, tableError ? '❌ Failed' : '✅ Success');
            if (tableError) {
                if (tableError.message.includes('does not exist')) {
                    console.log(`  Table "${table}" does not exist`);
                } else {
                    console.log(`  Error:`, tableError.message);
                }
            } else {
                console.log(`  Count available`);
            }
        }

    } catch (error) {
        console.error('\n❌ Test failed with error:', error);
    }
}

console.log('Supabase URL:', supabaseUrl);
console.log('Using anon key for initial access');
console.log('---\n');

runTests().catch(console.error); 
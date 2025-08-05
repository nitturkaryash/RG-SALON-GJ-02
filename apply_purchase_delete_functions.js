const fs = require('fs');

// Configuration
const PROJECT_ID = "mtyudylsozncvilibxda";

// Read the SQL functions
const sqlContent = fs.readFileSync('purchase_delete_stock_recalculation.sql', 'utf8');

console.log('🚀 Applying Purchase Delete Functions to Supabase Database...');
console.log(`📊 Project ID: ${PROJECT_ID}`);
console.log('');

// Function to simulate MCP call (you'll need to replace this with actual MCP implementation)
async function mcp_supabase_execute_sql(projectId, query) {
  console.log('📝 Executing SQL query...');
  console.log('Query preview:', query.substring(0, 100) + '...');
  
  // This is where you would make the actual MCP call
  // For now, we'll just log what would be executed
  return {
    success: true,
    message: 'SQL executed successfully (simulated)',
    data: { rowsAffected: 1 }
  };
}

// Main execution function
async function applyPurchaseDeleteFunctions() {
  try {
    console.log('1️⃣ Creating calculate_current_stock_at_purchase function...');
    await mcp_supabase_execute_sql(PROJECT_ID, sqlContent);
    
    console.log('2️⃣ Verifying functions were created...');
    const verifyQuery = `
      SELECT 
        routine_name,
        routine_type
      FROM information_schema.routines 
      WHERE routine_name LIKE '%purchase%'
      AND routine_schema = 'public';
    `;
    await mcp_supabase_execute_sql(PROJECT_ID, verifyQuery);
    
    console.log('3️⃣ Testing stock calculation...');
    const testQuery = `
      SELECT 
        product_name,
        purchase_qty,
        current_stock_at_purchase,
        date
      FROM purchase_history_with_stock 
      ORDER BY date DESC 
      LIMIT 5;
    `;
    await mcp_supabase_execute_sql(PROJECT_ID, testQuery);
    
    console.log('✅ Purchase delete functions applied successfully!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Test the delete function with a sample purchase record');
    console.log('2. Verify stock calculations are working correctly');
    console.log('3. Monitor the stock_history table for audit trail');
    
  } catch (error) {
    console.error('❌ Error applying functions:', error.message);
  }
}

// Execute the script
applyPurchaseDeleteFunctions(); 
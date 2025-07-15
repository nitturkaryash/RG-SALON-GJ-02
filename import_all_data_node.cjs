const fs = require('fs');

// Configuration
const PROJECT_ID = "mtyudylsozncvilibxda";
const USER_ID = "3f4b718f-70cb-4873-a62c-b8806a92e25b";
const TENANT_ID = "3f4b718f-70cb-4873-a62c-b8806a92e25b";
const BATCH_SIZE = 10;

function loadInvoiceData() {
    try {
        const data = JSON.parse(fs.readFileSync('processed_invoices.json', 'utf8'));
        return data.mergedInvoices;
    } catch (error) {
        console.error('❌ Error loading processed_invoices.json:', error.message);
        process.exit(1);
    }
}

function escapeSqlString(text) {
    if (text === null || text === undefined) {
        return "NULL";
    }
    return `'${String(text).replace(/'/g, "''")}'`;
}

function formatPaymentMethods(paymentMethods) {
    const methods = paymentMethods.map(pm => ({
        method: pm.method.split('(')[0], // Remove amount from method name
        amount: pm.amount
    }));
    return JSON.stringify(methods);
}

function createInsertStatement(invoice) {
    // Format services JSON
    const servicesJson = JSON.stringify(invoice.services).replace(/'/g, "''");
    
    // Format payments JSON
    const paymentsJson = formatPaymentMethods(invoice.paymentMethods).replace(/'/g, "''");
    
    // Create payment method display string
    const paymentDisplay = invoice.paymentMethodDisplay || 'cash';
    
    // Format date
    const dateStr = invoice.date;
    
    return `INSERT INTO pos_orders (
    id,
    created_at,
    date,
    client_name,
    customer_name,
    total_amount,
    total,
    subtotal,
    tax,
    discount,
    payment_method,
    payments,
    services,
    stylist_name,
    status,
    type,
    user_id,
    tenant_id
) VALUES (
    gen_random_uuid(),
    '${dateStr}'::timestamptz,
    '${dateStr}'::timestamptz,
    ${escapeSqlString(invoice.clientName)},
    ${escapeSqlString(invoice.clientName)},
    ${invoice.totalAmount},
    ${invoice.totalAmount},
    ${invoice.totalSubtotal || invoice.totalAmount},
    ${invoice.totalTax || 0},
    ${invoice.totalDiscount || 0},
    ${escapeSqlString(paymentDisplay)},
    '${paymentsJson}'::jsonb,
    '${servicesJson}'::jsonb,
    ${escapeSqlString(invoice.primaryStylist)},
    'completed',
    'sale',
    '${USER_ID}'::uuid,
    '${TENANT_ID}'::uuid
);`;
}

function createBatchFiles(invoices) {
    console.log(`📝 Creating batch files for ${invoices.length} invoices...`);
    
    const batchFiles = [];
    
    for (let i = 0; i < invoices.length; i += BATCH_SIZE) {
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const batchInvoices = invoices.slice(i, i + BATCH_SIZE);
        
        const filename = `batch_${batchNum.toString().padStart(3, '0')}_invoices_${i+1}_to_${Math.min(i+BATCH_SIZE, invoices.length)}.sql`;
        
        let content = `-- Batch ${batchNum}: Invoices ${i+1} to ${Math.min(i+BATCH_SIZE, invoices.length)}\n`;
        content += `-- Total invoices in batch: ${batchInvoices.length}\n\n`;
        
        batchInvoices.forEach(invoice => {
            content += createInsertStatement(invoice);
            content += '\n\n';
        });
        
        fs.writeFileSync(filename, content, 'utf8');
        batchFiles.push(filename);
        console.log(`✅ Created ${filename} (${batchInvoices.length} invoices)`);
    }
    
    return batchFiles;
}

function createMcpImportScript(batchFiles) {
    let scriptContent = `# MCP Supabase Import Commands
# Run these commands in sequence to import all data

# 1. First, disable triggers (run once)
mcp_supabase_execute_sql({
    "project_id": "${PROJECT_ID}",
    "query": "ALTER TABLE pos_orders DISABLE TRIGGER handle_pos_orders_user_id_trigger; ALTER TABLE pos_orders DISABLE TRIGGER set_tenant_id_pos_orders;"
})

# 2. Clear existing data (optional - run if you want to start fresh)
mcp_supabase_execute_sql({
    "project_id": "${PROJECT_ID}",
    "query": "DELETE FROM pos_orders WHERE user_id = '${USER_ID}' AND date >= '2025-03-31'::date;"
})

# 3. Import batches (run each batch command)
`;
    
    batchFiles.forEach((batchFile, index) => {
        scriptContent += `
# Batch ${index + 1}: ${batchFile}
# Read the file content and execute:
with open('${batchFile}', 'r', encoding='utf-8') as f:
    batch_sql = f.read()
    
mcp_supabase_execute_sql({
    "project_id": "${PROJECT_ID}",
    "query": batch_sql
})

# Check progress after batch ${index + 1}
mcp_supabase_execute_sql({
    "project_id": "${PROJECT_ID}",
    "query": "SELECT COUNT(*) as imported_count, SUM(total_amount) as total_revenue FROM pos_orders WHERE user_id = '${USER_ID}';"
})
`;
    });
    
    scriptContent += `
# 4. Final verification
mcp_supabase_execute_sql({
    "project_id": "${PROJECT_ID}",
    "query": """
    SELECT 
        COUNT(*) as total_imported,
        SUM(total_amount) as total_revenue,
        COUNT(DISTINCT client_name) as unique_clients,
        COUNT(DISTINCT stylist_name) as unique_stylists,
        MIN(date) as earliest_date,
        MAX(date) as latest_date
    FROM pos_orders 
    WHERE user_id = '${USER_ID}';
    """
})

# 5. Re-enable triggers (run once at the end)
mcp_supabase_execute_sql({
    "project_id": "${PROJECT_ID}",
    "query": "ALTER TABLE pos_orders ENABLE TRIGGER handle_pos_orders_user_id_trigger; ALTER TABLE pos_orders ENABLE TRIGGER set_tenant_id_pos_orders;"
})
`;
    
    fs.writeFileSync('mcp_import_commands.txt', scriptContent, 'utf8');
    console.log('✅ Created mcp_import_commands.txt with all MCP commands');
}

function createSingleSqlFile(invoices) {
    console.log(`📝 Creating single SQL file for all ${invoices.length} invoices...`);
    
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    let content = `-- Complete import of ${invoices.length} invoices from SERVICE APRIL-2025.xlsx
-- Generated on: ${now}
-- Total expected revenue: ₹${totalRevenue.toLocaleString('en-IN')}

-- Disable triggers for bulk import
ALTER TABLE pos_orders DISABLE TRIGGER handle_pos_orders_user_id_trigger;
ALTER TABLE pos_orders DISABLE TRIGGER set_tenant_id_pos_orders;

-- Clear existing data (optional)
-- DELETE FROM pos_orders WHERE user_id = '${USER_ID}' AND date >= '2025-03-31'::date;

-- Begin transaction
BEGIN;

`;
    
    invoices.forEach((invoice, index) => {
        content += `-- Invoice ${index + 1}: ${invoice.clientName} - ${invoice.paymentMethodDisplay || 'cash'}\n`;
        content += createInsertStatement(invoice);
        content += '\n\n';
    });
    
    content += `-- Commit transaction
COMMIT;

-- Re-enable triggers
ALTER TABLE pos_orders ENABLE TRIGGER handle_pos_orders_user_id_trigger;
ALTER TABLE pos_orders ENABLE TRIGGER set_tenant_id_pos_orders;

-- Verify import
SELECT 
    COUNT(*) as total_imported,
    SUM(total_amount) as total_revenue,
    COUNT(DISTINCT client_name) as unique_clients,
    COUNT(DISTINCT stylist_name) as unique_stylists,
    MIN(date) as earliest_date,
    MAX(date) as latest_date
FROM pos_orders 
WHERE user_id = '${USER_ID}';`;
    
    fs.writeFileSync('import_all_invoices_complete.sql', content, 'utf8');
    console.log('✅ Created import_all_invoices_complete.sql');
}

function main() {
    console.log('🚀 Starting Excel Data Import Script');
    console.log('='.repeat(50));
    
    // Load data
    const invoices = loadInvoiceData();
    console.log(`📊 Loaded ${invoices.length} processed invoices`);
    
    // Calculate summary
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const uniqueClients = new Set(invoices.map(inv => inv.clientName)).size;
    const uniqueStylists = new Set(invoices.map(inv => inv.stylistName)).size;
    
    console.log(`💰 Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`);
    console.log(`👥 Unique Clients: ${uniqueClients}`);
    console.log(`✂️ Unique Stylists: ${uniqueStylists}`);
    console.log();
    
    // Create batch files
    const batchFiles = createBatchFiles(invoices);
    console.log(`📁 Created ${batchFiles.length} batch files`);
    console.log();
    
    // Create MCP command script
    createMcpImportScript(batchFiles);
    console.log();
    
    // Create single SQL file
    createSingleSqlFile(invoices);
    console.log();
    
    console.log('✅ All files created successfully!');
    console.log('\n🎯 Next Steps:');
    console.log('1. Use the MCP commands from "mcp_import_commands.txt"');
    console.log('2. Or execute "import_all_invoices_complete.sql" directly in Supabase');
    console.log('3. Monitor progress and verify data integrity');
    console.log('\n📊 Expected Final Results:');
    console.log(`   - Total Records: ${invoices.length}`);
    console.log(`   - Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`);
    console.log(`   - Unique Clients: ${uniqueClients}`);
    console.log(`   - Unique Stylists: ${uniqueStylists}`);
}

if (require.main === module) {
    main();
} 
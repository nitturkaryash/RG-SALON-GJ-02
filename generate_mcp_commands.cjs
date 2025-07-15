const fs = require('fs');

// Configuration
const PROJECT_ID = "mtyudylsozncvilibxda";
const USER_ID = "3f4b718f-70cb-4873-a62c-b8806a92e25b";
const BATCH_SIZE = 5;
const ALREADY_IMPORTED = 8; // We've already imported 8 invoices

function loadProcessedData() {
    try {
        const data = JSON.parse(fs.readFileSync('processed_invoices.json', 'utf8'));
        return data.mergedInvoices;
    } catch (error) {
        console.error('❌ Error loading processed_invoices.json:', error.message);
        return null;
    }
}

function escapeSqlString(text) {
    if (text === null || text === undefined) {
        return "NULL";
    }
    return `'${String(text).replace(/'/g, "''")}'`;
}

function createMcpCommand(invoices, batchNum, startIndex) {
    const values = invoices.map(invoice => {
        const servicesJson = JSON.stringify(invoice.services).replace(/'/g, "''");
        const paymentsJson = JSON.stringify(invoice.paymentMethods.map(pm => ({
            method: pm.method.split('(')[0],
            amount: pm.amount
        }))).replace(/'/g, "''");
        
        const paymentDisplay = invoice.paymentMethodDisplay || 'cash';
        
        return `(
    gen_random_uuid(),
    '${invoice.date}'::timestamptz,
    '${invoice.date}'::timestamptz,
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
    '${USER_ID}'::uuid
)`;
    });

    const query = `-- Batch ${batchNum}: Import invoices ${startIndex + 1} to ${startIndex + invoices.length}
INSERT INTO pos_orders (
    id, created_at, date, client_name, customer_name, total_amount, total,
    subtotal, tax, discount, payment_method, payments, services, stylist_name,
    status, type, user_id, tenant_id
) VALUES 
${values.join(',\n')};`;

    return {
        description: `Batch ${batchNum}: Import invoices ${startIndex + 1} to ${startIndex + invoices.length}`,
        batchInfo: {
            batchNum,
            startIndex: startIndex + 1,
            endIndex: startIndex + invoices.length,
            invoiceCount: invoices.length,
            totalRevenue: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
        },
        mcpCall: {
            tool: "mcp_supabase_execute_sql",
            args: {
                project_id: PROJECT_ID,
                query: query
            }
        }
    };
}

function generateAllCommands() {
    console.log('🚀 Generating MCP Commands for Remaining Data Import');
    console.log('=' * 60);
    
    const allInvoices = loadProcessedData();
    if (!allInvoices) {
        return;
    }
    
    // Skip already imported invoices
    const remainingInvoices = allInvoices.slice(ALREADY_IMPORTED);
    
    console.log(`📊 Total invoices: ${allInvoices.length}`);
    console.log(`✅ Already imported: ${ALREADY_IMPORTED}`);
    console.log(`📋 Remaining to import: ${remainingInvoices.length}`);
    
    const totalRevenue = remainingInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    console.log(`💰 Remaining revenue: ₹${totalRevenue.toLocaleString('en-IN')}`);
    
    const commands = [];
    
    // Add status check command
    commands.push({
        description: "Check current import status",
        mcpCall: {
            tool: "mcp_supabase_execute_sql",
            args: {
                project_id: PROJECT_ID,
                query: `SELECT 
                    COUNT(*) as current_count,
                    SUM(total_amount) as current_revenue,
                    COUNT(DISTINCT client_name) as unique_clients,
                    COUNT(DISTINCT stylist_name) as unique_stylists
                FROM pos_orders 
                WHERE user_id = '${USER_ID}';`
            }
        }
    });
    
    // Create batch commands
    for (let i = 0; i < remainingInvoices.length; i += BATCH_SIZE) {
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const batchInvoices = remainingInvoices.slice(i, i + BATCH_SIZE);
        const actualStartIndex = ALREADY_IMPORTED + i;
        
        commands.push(createMcpCommand(batchInvoices, batchNum, actualStartIndex));
        
        // Add progress check after each batch
        commands.push({
            description: `Progress check after batch ${batchNum}`,
            mcpCall: {
                tool: "mcp_supabase_execute_sql",
                args: {
                    project_id: PROJECT_ID,
                    query: `SELECT 
                        COUNT(*) as total_imported,
                        SUM(total_amount) as total_revenue,
                        COUNT(DISTINCT client_name) as unique_clients
                    FROM pos_orders 
                    WHERE user_id = '${USER_ID}';`
                }
            }
        });
    }
    
    // Add final verification
    commands.push({
        description: "Final verification and summary",
        mcpCall: {
            tool: "mcp_supabase_execute_sql",
            args: {
                project_id: PROJECT_ID,
                query: `SELECT 
                    COUNT(*) as total_imported,
                    SUM(total_amount) as total_revenue,
                    COUNT(DISTINCT client_name) as unique_clients,
                    COUNT(DISTINCT stylist_name) as unique_stylists,
                    MIN(date) as earliest_date,
                    MAX(date) as latest_date
                FROM pos_orders 
                WHERE user_id = '${USER_ID}';
                
                -- Show sample payment methods
                SELECT DISTINCT payment_method 
                FROM pos_orders 
                WHERE user_id = '${USER_ID}' 
                ORDER BY payment_method 
                LIMIT 10;`
            }
        }
    });
    
    // Save commands to file
    fs.writeFileSync('mcp_import_commands.json', JSON.stringify(commands, null, 2), 'utf8');
    
    console.log(`\n✅ Generated ${commands.length} MCP commands`);
    console.log(`📁 Saved to: mcp_import_commands.json`);
    console.log(`📊 Import batches: ${Math.ceil(remainingInvoices.length / BATCH_SIZE)}`);
    
    // Create a summary file
    const summary = {
        totalInvoices: allInvoices.length,
        alreadyImported: ALREADY_IMPORTED,
        remainingToImport: remainingInvoices.length,
        totalRevenue: allInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        remainingRevenue: totalRevenue,
        uniqueClients: new Set(allInvoices.map(inv => inv.clientName)).size,
        uniqueStylists: new Set(allInvoices.map(inv => inv.primaryStylist)).size,
        batchCount: Math.ceil(remainingInvoices.length / BATCH_SIZE),
        batchSize: BATCH_SIZE
    };
    
    fs.writeFileSync('import_summary.json', JSON.stringify(summary, null, 2), 'utf8');
    
    console.log(`\n📊 Import Summary:`);
    console.log(`   - Total invoices: ${summary.totalInvoices}`);
    console.log(`   - Already imported: ${summary.alreadyImported}`);
    console.log(`   - Remaining: ${summary.remainingToImport}`);
    console.log(`   - Total revenue: ₹${summary.totalRevenue.toLocaleString('en-IN')}`);
    console.log(`   - Remaining revenue: ₹${summary.remainingRevenue.toLocaleString('en-IN')}`);
    console.log(`   - Unique clients: ${summary.uniqueClients}`);
    console.log(`   - Unique stylists: ${summary.uniqueStylists}`);
    console.log(`   - Batches needed: ${summary.batchCount}`);
    
    return commands;
}

if (require.main === module) {
    generateAllCommands();
} 
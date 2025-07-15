const fs = require('fs');

// Read the processed invoices
const data = JSON.parse(fs.readFileSync('processed_invoices.json', 'utf8'));
const invoices = data.mergedInvoices;

console.log(`Starting batch import of ${invoices.length} invoices...`);

// Function to create a single insert statement for one invoice
function createSingleInsert(invoice) {
  const servicesJson = JSON.stringify(invoice.services).replace(/'/g, "''");
  const paymentsJson = JSON.stringify(invoice.paymentMethods.map(p => ({
    method: p.method.split('(')[0], // Extract method name without amount
    amount: p.amount
  }))).replace(/'/g, "''");
  
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
    '${invoice.date}'::timestamptz,
    '${invoice.date}'::timestamptz,
    '${invoice.clientName.replace(/'/g, "''")}',
    '${invoice.clientName.replace(/'/g, "''")}',
    ${invoice.totalAmount},
    ${invoice.totalAmount},
    ${invoice.totalSubtotal},
    ${invoice.totalTax},
    ${invoice.totalDiscount},
    '${invoice.paymentMethodDisplay.replace(/'/g, "''")}',
    '${paymentsJson}'::jsonb,
    '${servicesJson}'::jsonb,
    '${invoice.primaryStylist.replace(/'/g, "''")}',
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b'::uuid,
    'surat-salon'
  );`;
}

// Create individual SQL files for each batch
const batchSize = 10; // Smaller batches for MCP
const totalBatches = Math.ceil(invoices.length / batchSize);

// Create batch files
for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
  const startIdx = batchNum * batchSize;
  const endIdx = Math.min(startIdx + batchSize, invoices.length);
  const batchInvoices = invoices.slice(startIdx, endIdx);
  
  const batchSql = batchInvoices.map(createSingleInsert).join('\n\n');
  
  const fileName = `batch_${String(batchNum + 1).padStart(3, '0')}_invoices_${startIdx + 1}_to_${endIdx}.sql`;
  
  const fullBatchSql = `-- Batch ${batchNum + 1}/${totalBatches}: Invoices ${startIdx + 1}-${endIdx}
-- Generated on ${new Date().toISOString()}

${batchSql}

-- Verify this batch
SELECT 
  COUNT(*) as batch_count,
  SUM(total_amount) as batch_revenue
FROM pos_orders 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
  AND client_name IN (${batchInvoices.map(inv => `'${inv.clientName.replace(/'/g, "''")}'`).join(', ')});
`;
  
  fs.writeFileSync(fileName, fullBatchSql);
  
  console.log(`Created ${fileName} with ${batchInvoices.length} invoices`);
}

// Create a master verification script
const verificationSql = `-- Final verification after all batches
SELECT 
  COUNT(*) as total_imported,
  SUM(total_amount) as total_revenue,
  COUNT(DISTINCT client_name) as unique_clients,
  COUNT(DISTINCT stylist_name) as unique_stylists,
  MIN(date) as earliest_date,
  MAX(date) as latest_date
FROM pos_orders 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
  AND date >= '2025-03-31'::date;

-- Expected results:
-- total_imported: ${invoices.length}
-- total_revenue: ${data.summary.totalRevenue}
-- unique_clients: ${data.summary.uniqueClients}
-- unique_stylists: ${data.summary.uniqueStylists}

-- Re-enable triggers after all batches
ALTER TABLE pos_orders ENABLE TRIGGER handle_pos_orders_user_id_trigger;
ALTER TABLE pos_orders ENABLE TRIGGER set_tenant_id_pos_orders;

-- Sample of imported data
SELECT 
  client_name,
  payment_method,
  total_amount,
  stylist_name,
  jsonb_array_length(services) as service_count
FROM pos_orders 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
  AND date >= '2025-03-31'::date
ORDER BY total_amount DESC
LIMIT 10;
`;

fs.writeFileSync('verify_import.sql', verificationSql);

console.log(`\nCreated ${totalBatches} batch files and verify_import.sql`);
console.log(`\nTo import all data:`);
console.log(`1. Run each batch file in sequence using MCP Supabase tools`);
console.log(`2. Run verify_import.sql to check the final results`);
console.log(`\nExpected final results:`);
console.log(`- Total invoices: ${invoices.length}`);
console.log(`- Total revenue: ₹${data.summary.totalRevenue.toLocaleString('en-IN')}`);
console.log(`- Unique clients: ${data.summary.uniqueClients}`);
console.log(`- Unique stylists: ${data.summary.uniqueStylists}`); 
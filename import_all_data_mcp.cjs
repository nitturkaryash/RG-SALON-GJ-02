const fs = require('fs');

// Read the processed invoices
const data = JSON.parse(fs.readFileSync('processed_invoices.json', 'utf8'));
const invoices = data.mergedInvoices;

console.log(`Starting import of ${invoices.length} invoices...`);
console.log(`Total revenue: ₹${data.summary.totalRevenue.toLocaleString('en-IN')}`);
console.log(`Unique clients: ${data.summary.uniqueClients}`);
console.log(`Unique stylists: ${data.summary.uniqueStylists}`);

// Function to generate SQL insert statements
function generateInsertStatements(invoices, batchSize = 50) {
  const batches = [];
  
  for (let i = 0; i < invoices.length; i += batchSize) {
    const batch = invoices.slice(i, i + batchSize);
    const values = batch.map(invoice => {
      const servicesJson = JSON.stringify(invoice.services).replace(/'/g, "''");
      const paymentsJson = JSON.stringify(invoice.paymentMethods.map(p => ({
        method: p.method.split('(')[0], // Extract method name without amount
        amount: p.amount
      }))).replace(/'/g, "''");
      
      return `(
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
      )`;
    }).join(',\n      ');
    
    const sql = `
-- Batch ${Math.floor(i / batchSize) + 1}: Invoices ${i + 1}-${Math.min(i + batchSize, invoices.length)}
INSERT INTO pos_orders (
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
) VALUES
      ${values};
`;
    
    batches.push(sql);
  }
  
  return batches;
}

// Generate all insert statements
const insertBatches = generateInsertStatements(invoices, 25); // Smaller batches for reliability

// Write to a SQL file
const fullSql = `
-- SERVICE APRIL-2025 Data Import
-- Generated on ${new Date().toISOString()}
-- Total invoices: ${invoices.length}
-- Total revenue: ₹${data.summary.totalRevenue.toLocaleString('en-IN')}

-- Disable triggers for bulk import
ALTER TABLE pos_orders DISABLE TRIGGER handle_pos_orders_user_id_trigger;
ALTER TABLE pos_orders DISABLE TRIGGER set_tenant_id_pos_orders;

${insertBatches.join('\n\n')}

-- Re-enable triggers after import
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
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
  AND date >= '2025-03-31'::date;
`;

fs.writeFileSync('import_all_invoices.sql', fullSql);

console.log('\nGenerated import_all_invoices.sql');
console.log(`Created ${insertBatches.length} batches`);
console.log('\nSample data preview:');
console.log('First 3 invoices:');
invoices.slice(0, 3).forEach((invoice, i) => {
  console.log(`${i + 1}. ${invoice.clientName} - ${invoice.paymentMethodDisplay} - ₹${invoice.totalAmount} (${invoice.serviceCount} services)`);
});

console.log('\nTo import the data, run the generated SQL file in Supabase SQL Editor.'); 
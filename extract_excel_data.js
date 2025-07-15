import fs from 'fs';
import XLSX from 'xlsx';

/**
 * Extract data from Excel file and convert to SQL format
 */
function extractExcelData(filePath) {
    try {
        console.log(`Reading Excel file: ${filePath}`);
        
        // Read the Excel file
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`Excel file loaded successfully!`);
        console.log(`Sheet name: ${sheetName}`);
        console.log(`Total rows: ${jsonData.length}`);
        
        if (jsonData.length > 0) {
            console.log(`Columns found: ${Object.keys(jsonData[0]).join(', ')}`);
            console.log(`First few rows:`, jsonData.slice(0, 3));
        }
        
        // Save the data structure for analysis
        const analysisContent = `Excel Data Structure Analysis
${'='.repeat(50)}

File: ${filePath}
Sheet: ${sheetName}
Total rows: ${jsonData.length}
Total columns: ${jsonData.length > 0 ? Object.keys(jsonData[0]).length : 0}

Columns:
${jsonData.length > 0 ? Object.keys(jsonData[0]).map((col, i) => `${i+1}. ${col}`).join('\n') : 'No columns found'}

${'='.repeat(50)}
Sample Data (first 10 rows):
${JSON.stringify(jsonData.slice(0, 10), null, 2)}

${'='.repeat(50)}
`;
        
        fs.writeFileSync('excel_data_structure.txt', analysisContent);
        
        // Convert to SQL format
        const sqlStatements = [];
        
        // Process each row
        jsonData.forEach((row, index) => {
            // Try to identify columns (case-insensitive)
            const getColumnValue = (possibleNames, defaultValue = '') => {
                for (const name of possibleNames) {
                    const key = Object.keys(row).find(k => k.toLowerCase().includes(name.toLowerCase()));
                    if (key && row[key] !== undefined && row[key] !== null) {
                        return String(row[key]).trim();
                    }
                }
                return defaultValue;
            };
            
            const getNumericValue = (possibleNames, defaultValue = 0) => {
                for (const name of possibleNames) {
                    const key = Object.keys(row).find(k => k.toLowerCase().includes(name.toLowerCase()));
                    if (key && row[key] !== undefined && row[key] !== null) {
                        const value = parseFloat(row[key]);
                        return isNaN(value) ? defaultValue : value;
                    }
                }
                return defaultValue;
            };
            
            // Extract data with multiple possible column names
            const invoiceNum = getColumnValue(['invoice', 'bill', 'receipt', 'order'], `INV-${(index + 1).toString().padStart(4, '0')}`);
            const date = getColumnValue(['date', 'time', 'datetime', 'created'], new Date().toISOString().slice(0, 19).replace('T', ' '));
            const clientName = getColumnValue(['client', 'customer', 'name', 'customer name', 'client name'], `Client ${index + 1}`);
            const clientPhone = getColumnValue(['phone', 'mobile', 'contact', 'number'], `${9876543210 + index}`);
            const stylistName = getColumnValue(['stylist', 'staff', 'employee', 'expert', 'therapist'], 'Default Stylist');
            const serviceName = getColumnValue(['service', 'treatment', 'item', 'product'], 'Service');
            const servicePrice = getNumericValue(['price', 'amount', 'cost', 'rate'], 0);
            const quantity = getNumericValue(['quantity', 'qty', 'count'], 1);
            const discountPercent = getNumericValue(['discount', 'disc', 'off'], 0);
            const taxPercent = getNumericValue(['tax', 'gst', 'vat'], 18);
            const paymentMethod = getColumnValue(['payment', 'method', 'mode'], 'cash');
            
            // Create SQL statement
            const sqlLine = `('${invoiceNum}', '${date}', '${clientName}', '${clientPhone}', '${stylistName}', '${serviceName}', ${servicePrice}, ${quantity}, ${discountPercent}, ${taxPercent}, '${paymentMethod}')`;
            sqlStatements.push(sqlLine);
        });
        
        // Generate the final SQL file
        const sqlContent = `-- Auto-generated SQL from ${filePath}
-- Generated on: ${new Date().toISOString()}
-- Total records: ${sqlStatements.length}

-- Final POS Orders Import with Extracted Data
WITH raw_data AS (
    SELECT * FROM (VALUES
        ${sqlStatements.join(',\n        ')}
    ) AS t(invoice_number, date_time, client_name, client_phone, stylist_name, service_name, service_price, quantity, discount_percent, tax_percent, payment_method)
),

-- Create missing clients
clients_to_create AS (
    INSERT INTO clients (full_name, mobile_number, phone, user_id, created_at, updated_at)
    SELECT DISTINCT 
        client_name, 
        client_phone, 
        client_phone, 
        '3f4b718f-70cb-4873-a62c-b8806a92e25b', 
        NOW(), 
        NOW()
    FROM raw_data
    WHERE NOT EXISTS (
        SELECT 1 FROM clients 
        WHERE mobile_number = raw_data.client_phone 
        AND user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
    )
    RETURNING id, full_name, mobile_number
),

-- Create missing stylists
stylists_to_create AS (
    INSERT INTO stylists (name, user_id, available, created_at, updated_at)
    SELECT DISTINCT 
        stylist_name, 
        '3f4b718f-70cb-4873-a62c-b8806a92e25b', 
        true, 
        NOW(), 
        NOW()
    FROM raw_data
    WHERE NOT EXISTS (
        SELECT 1 FROM stylists 
        WHERE name = raw_data.stylist_name 
        AND user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
    )
    RETURNING id, name
),

-- Create missing services
services_to_create AS (
    INSERT INTO services (name, price, duration, type, active, user_id, created_at, updated_at)
    SELECT DISTINCT 
        service_name, 
        service_price, 
        60, -- default duration
        'service', 
        true, 
        '3f4b718f-70cb-4873-a62c-b8806a92e25b', 
        NOW(), 
        NOW()
    FROM raw_data
    WHERE NOT EXISTS (
        SELECT 1 FROM services 
        WHERE name = raw_data.service_name 
        AND user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
    )
    RETURNING id, name, price
),

-- Group data by invoice
invoice_data AS (
    SELECT 
        invoice_number,
        date_time::timestamp,
        client_name,
        client_phone,
        stylist_name,
        payment_method,
        jsonb_agg(
            jsonb_build_object(
                'service_name', service_name,
                'price', service_price,
                'quantity', quantity,
                'discount_percent', discount_percent,
                'tax_percent', tax_percent,
                'subtotal', service_price * quantity,
                'discount', (service_price * quantity) * (discount_percent / 100),
                'taxable', (service_price * quantity) * (1 - discount_percent / 100),
                'tax', (service_price * quantity) * (1 - discount_percent / 100) * (tax_percent / 100),
                'total', (service_price * quantity) * (1 - discount_percent / 100) * (1 + tax_percent / 100)
            )
        ) as services_data,
        SUM(service_price * quantity) as subtotal,
        SUM((service_price * quantity) * (discount_percent / 100)) as total_discount,
        SUM((service_price * quantity) * (1 - discount_percent / 100) * (tax_percent / 100)) as total_tax,
        SUM((service_price * quantity) * (1 - discount_percent / 100) * (1 + tax_percent / 100)) as total_amount
    FROM raw_data
    GROUP BY invoice_number, date_time, client_name, client_phone, stylist_name, payment_method
),

-- Create services JSON with proper IDs
final_invoice_data AS (
    SELECT 
        i.*,
        jsonb_agg(
            jsonb_build_object(
                'id', s.id,
                'service_id', s.id,
                'service_name', (service_item.value->>'service_name'),
                'type', 'service',
                'price', (service_item.value->>'price')::numeric,
                'quantity', (service_item.value->>'quantity')::integer,
                'duration', 60,
                'subtotal', (service_item.value->>'subtotal')::numeric,
                'discount', (service_item.value->>'discount')::numeric,
                'tax', (service_item.value->>'tax')::numeric,
                'total', (service_item.value->>'total')::numeric,
                'gst_percentage', (service_item.value->>'tax_percent')::numeric,
                'unit_price', (service_item.value->>'price')::numeric
            )
        ) as services_json
    FROM invoice_data i
    CROSS JOIN LATERAL jsonb_array_elements(i.services_data) as service_item(value)
    LEFT JOIN services s ON s.name = (service_item.value->>'service_name') 
        AND s.user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
    GROUP BY i.invoice_number, i.date_time, i.client_name, i.client_phone, i.stylist_name, 
             i.payment_method, i.subtotal, i.total_discount, i.total_tax, i.total_amount
)

-- Insert POS orders
INSERT INTO pos_orders (
    date,
    client_name,
    stylist_name,
    services,
    subtotal,
    tax,
    discount,
    total,
    payment_method,
    status,
    type,
    user_id,
    created_at
)
SELECT 
    date_time,
    client_name,
    stylist_name,
    services_json,
    subtotal,
    total_tax,
    total_discount,
    total_amount,
    payment_method,
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b',
    date_time
FROM final_invoice_data
WHERE NOT EXISTS (
    SELECT 1 FROM pos_orders po
    WHERE po.client_name = final_invoice_data.client_name
    AND po.stylist_name = final_invoice_data.stylist_name
    AND po.date::date = final_invoice_data.date_time::date
    AND po.user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
);

-- Show import summary
SELECT 
    COUNT(*) as total_orders_imported,
    COUNT(DISTINCT client_name) as unique_clients,
    COUNT(DISTINCT stylist_name) as unique_stylists,
    SUM(total) as total_revenue
FROM pos_orders 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
AND created_at >= NOW() - INTERVAL '1 hour';
`;
        
        // Write the SQL file
        fs.writeFileSync('import_april_services.sql', sqlContent);
        
        console.log(`\nSQL file generated: import_april_services.sql`);
        console.log(`Total SQL statements: ${sqlStatements.length}`);
        
        return sqlStatements;
        
    } catch (error) {
        console.error('Error processing Excel file:', error.message);
        return [];
    }
}

// Run the extraction
const filePath = "SHEETS/SERVICE APRIL-2025.xlsx";
extractExcelData(filePath); 
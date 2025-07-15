import fs from 'fs';
import XLSX from 'xlsx';

/**
 * Convert Excel serial date to JavaScript date
 */
function excelDateToJSDate(serial) {
    // Excel epoch starts on January 1, 1900
    const excelEpoch = new Date(1900, 0, 1);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    
    // Excel incorrectly treats 1900 as a leap year, so we need to adjust
    const adjustedSerial = serial > 59 ? serial - 1 : serial;
    
    const jsDate = new Date(excelEpoch.getTime() + (adjustedSerial - 1) * millisecondsPerDay);
    return jsDate;
}

/**
 * Extract payment method from payment mode string
 */
function extractPaymentMethod(paymentMode) {
    if (!paymentMode || paymentMode === '-') return 'cash';
    
    const mode = paymentMode.toLowerCase();
    if (mode.includes('card')) return 'card';
    if (mode.includes('gpay') || mode.includes('upi')) return 'gpay';
    if (mode.includes('cash')) return 'cash';
    
    return 'cash'; // default
}

/**
 * Calculate tax percentage from tax amount and unit price
 */
function calculateTaxPercentage(taxAmount, unitPrice, discount = 0) {
    const discountedPrice = unitPrice * (1 - discount / 100);
    if (discountedPrice === 0) return 18; // default GST
    
    const taxPercentage = (taxAmount / discountedPrice) * 100;
    return Math.round(taxPercentage * 100) / 100; // round to 2 decimal places
}

/**
 * Fix and process Excel data
 */
function fixExcelData(filePath) {
    try {
        console.log(`Reading and fixing Excel file: ${filePath}`);
        
        // Read the Excel file
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`Excel file loaded successfully!`);
        console.log(`Total rows: ${jsonData.length}`);
        
        // Process and fix the data
        const sqlStatements = [];
        
        jsonData.forEach((row, index) => {
            // Extract and fix data
            const invoiceNum = row['Invoice No'] || `INV-${(index + 1).toString().padStart(4, '0')}`;
            
            // Fix date format
            let date = row['Date'];
            if (typeof date === 'number') {
                // Excel serial date
                const jsDate = excelDateToJSDate(date);
                date = jsDate.toISOString().slice(0, 19).replace('T', ' ');
            } else if (date) {
                // Try to parse as date
                const parsedDate = new Date(date);
                if (!isNaN(parsedDate.getTime())) {
                    date = parsedDate.toISOString().slice(0, 19).replace('T', ' ');
                } else {
                    date = new Date().toISOString().slice(0, 19).replace('T', ' ');
                }
            } else {
                date = new Date().toISOString().slice(0, 19).replace('T', ' ');
            }
            
            const clientName = (row['Guest Name'] || `Client ${index + 1}`).toString().replace(/'/g, "''");
            const clientPhone = (row['Guest Number'] || `${9876543210 + index}`).toString();
            const stylistName = (row['Staff'] || 'Default Stylist').toString().replace(/'/g, "''");
            const serviceName = (row['Service'] || 'Service').toString().replace(/'/g, "''");
            
            const unitPrice = parseFloat(row['Unit Price']) || 0;
            const quantity = parseInt(row['Qty']) || 1;
            const discount = parseFloat(row['Discount']) || 0;
            const taxAmount = parseFloat(row['Tax']) || 0;
            
            // Calculate tax percentage
            const taxPercent = calculateTaxPercentage(taxAmount, unitPrice, discount);
            
            // Extract payment method
            const paymentMethod = extractPaymentMethod(row['Payment Mode']);
            
            // Create SQL statement
            const sqlLine = `('${invoiceNum}', '${date}', '${clientName}', '${clientPhone}', '${stylistName}', '${serviceName}', ${unitPrice}, ${quantity}, ${discount}, ${taxPercent}, '${paymentMethod}')`;
            sqlStatements.push(sqlLine);
        });
        
        // Generate the final SQL file
        const sqlContent = `-- Auto-generated and fixed SQL from ${filePath}
-- Generated on: ${new Date().toISOString()}
-- Total records: ${sqlStatements.length}

-- Final POS Orders Import with Fixed Data
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
        fs.writeFileSync('import_fixed_april_services.sql', sqlContent);
        
        console.log(`\nFixed SQL file generated: import_fixed_april_services.sql`);
        console.log(`Total SQL statements: ${sqlStatements.length}`);
        
        return sqlStatements;
        
    } catch (error) {
        console.error('Error processing Excel file:', error.message);
        return [];
    }
}

// Run the extraction with fixes
const filePath = "SHEETS/SERVICE APRIL-2025.xlsx";
fixExcelData(filePath); 
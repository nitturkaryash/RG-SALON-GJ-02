import fs from 'fs';
import XLSX from 'xlsx';

// Configuration
const EXCEL_FILE_PATH = './SHEETS/SERVICE APRIL-2025.xlsx';
const USER_ID = '3f4b718f-70cb-4873-a62c-b8806a92e25b';
const PROJECT_ID = 'mtyudylsozncvilibxda';

/**
 * Convert Excel serial date to JavaScript date
 */
function excelDateToJSDate(serial) {
    const excelEpoch = new Date(1900, 0, 1);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const adjustedSerial = serial > 59 ? serial - 1 : serial;
    const jsDate = new Date(excelEpoch.getTime() + (adjustedSerial - 1) * millisecondsPerDay);
    return jsDate;
}

/**
 * Process Excel data and merge invoices properly
 */
function processExcelData() {
    console.log('📊 Processing Excel file:', EXCEL_FILE_PATH);
    
    // Read Excel file
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    console.log(`📋 Found ${rawData.length} raw records`);
    
    // Process and clean data
    const processedData = rawData.map((row, index) => {
        let date;
        if (typeof row.Date === 'number') {
            date = excelDateToJSDate(row.Date);
        } else {
            date = new Date(row.Date);
        }
        
        // Clean and calculate values
        const quantity = parseInt(row.Qty) || 1;
        const unitPrice = parseFloat(row['Unit Price']) || 0;
        const discount = parseFloat(row.Discount) || 0;
        const taxPercent = parseFloat(row.Tax) || 18;
        
        // Calculate line totals
        const subtotal = unitPrice * quantity;
        const discountAmount = discount;
        const netAmount = subtotal - discountAmount;
        const taxAmount = (netAmount * taxPercent) / 100;
        const totalAmount = netAmount + taxAmount;
        
        return {
            invoiceNumber: row['Invoice No']?.toString() || (index + 1).toString(),
            date: date.toISOString(),
            clientName: row['Guest Name']?.toString() || 'Unknown',
            clientPhone: row['Guest Number']?.toString() || '',
            stylistName: row.Staff?.toString() || 'Admin',
            serviceName: row.Service?.toString() || 'General Service',
            category: row.Category?.toString() || 'General',
            quantity: quantity,
            unitPrice: unitPrice,
            discount: discountAmount,
            taxPercent: taxPercent,
            paymentMethod: row['Payment Mode']?.toString()?.toLowerCase() || 'cash',
            subtotal: subtotal,
            netAmount: netAmount,
            taxAmount: taxAmount,
            totalAmount: totalAmount
        };
    });
    
    console.log(`✅ Processed ${processedData.length} records`);
    
    // Group by invoice number and client name for merging
    const groupedInvoices = {};
    
    processedData.forEach(record => {
        const key = `${record.invoiceNumber}-${record.clientName}`;
        
        if (!groupedInvoices[key]) {
            groupedInvoices[key] = {
                invoiceNumber: record.invoiceNumber,
                date: record.date,
                clientName: record.clientName,
                clientPhone: record.clientPhone,
                services: [],
                paymentMethods: {},
                stylists: new Set(),
                totalSubtotal: 0,
                totalDiscount: 0,
                totalTax: 0,
                totalAmount: 0
            };
        }
        
        const invoice = groupedInvoices[key];
        
        // Add service
        invoice.services.push({
            name: record.serviceName,
            category: record.category,
            stylist: record.stylistName,
            quantity: record.quantity,
            unitPrice: record.unitPrice,
            discount: record.discount,
            taxPercent: record.taxPercent,
            subtotal: record.subtotal,
            netAmount: record.netAmount,
            taxAmount: record.taxAmount,
            totalAmount: record.totalAmount
        });
        
        // Add stylist
        invoice.stylists.add(record.stylistName);
        
        // Group by payment method
        if (!invoice.paymentMethods[record.paymentMethod]) {
            invoice.paymentMethods[record.paymentMethod] = {
                method: record.paymentMethod,
                amount: 0,
                services: []
            };
        }
        
        invoice.paymentMethods[record.paymentMethod].amount += record.totalAmount;
        invoice.paymentMethods[record.paymentMethod].services.push(record.serviceName);
        
        // Update totals
        invoice.totalSubtotal += record.subtotal;
        invoice.totalDiscount += record.discount;
        invoice.totalTax += record.taxAmount;
        invoice.totalAmount += record.totalAmount;
    });
    
    // Convert to array and format payment methods
    const mergedInvoices = Object.values(groupedInvoices).map(invoice => {
        const paymentMethodsArray = Object.values(invoice.paymentMethods);
        const paymentMethodDisplay = paymentMethodsArray
            .map(pm => `${pm.method}(₹${pm.amount.toFixed(2)})`)
            .join(', ');
        
        return {
            ...invoice,
            stylists: Array.from(invoice.stylists),
            primaryStylist: Array.from(invoice.stylists)[0],
            paymentMethods: paymentMethodsArray,
            paymentMethodDisplay: paymentMethodDisplay,
            serviceCount: invoice.services.length
        };
    });
    
    console.log(`🔄 Merged into ${mergedInvoices.length} invoices`);
    
    // Show sample merged invoice
    if (mergedInvoices.length > 0) {
        const sample = mergedInvoices[0];
        console.log('\n📋 Sample merged invoice:');
        console.log(`Invoice: ${sample.invoiceNumber}`);
        console.log(`Client: ${sample.clientName} (${sample.clientPhone})`);
        console.log(`Services: ${sample.serviceCount}`);
        console.log(`Payment: ${sample.paymentMethodDisplay}`);
        console.log(`Total: ₹${sample.totalAmount.toFixed(2)}`);
    }
    
    return mergedInvoices;
}

/**
 * Create SQL statements for import
 */
function generateImportSQL(mergedInvoices) {
    console.log('\n📝 Generating import SQL...');
    
    // Extract unique clients
    const uniqueClients = [...new Map(
        mergedInvoices.map(inv => [inv.clientPhone, {
            name: inv.clientName,
            phone: inv.clientPhone
        }])
    ).values()];
    
    // Extract unique stylists
    const uniqueStylists = [...new Set(
        mergedInvoices.flatMap(inv => inv.stylists)
    )];
    
    // Extract unique services
    const uniqueServices = [...new Map(
        mergedInvoices.flatMap(inv => inv.services)
            .map(service => [service.name, {
                name: service.name,
                price: service.unitPrice,
                category: service.category
            }])
    ).values()];
    
    console.log(`👥 Unique clients: ${uniqueClients.length}`);
    console.log(`💇 Unique stylists: ${uniqueStylists.length}`);
    console.log(`🛍️ Unique services: ${uniqueServices.length}`);
    
    // Generate SQL for reference data
    const clientsSQL = uniqueClients.map(client => 
        `('${client.name.replace(/'/g, "''")}', '${client.phone}', '${client.phone}', '${USER_ID}', NOW(), NOW())`
    ).join(',\n        ');
    
    const stylistsSQL = uniqueStylists.map(stylist => 
        `('${stylist.replace(/'/g, "''")}', '${USER_ID}', true, NOW(), NOW())`
    ).join(',\n        ');
    
    const servicesSQL = uniqueServices.map(service => 
        `('${service.name.replace(/'/g, "''")}', ${service.price}, 60, 'service', true, '${USER_ID}', NOW(), NOW())`
    ).join(',\n        ');
    
    // Generate SQL for POS orders
    const posOrdersSQL = mergedInvoices.map(invoice => {
        const servicesJSON = JSON.stringify(invoice.services).replace(/'/g, "''");
        const paymentsJSON = JSON.stringify(invoice.paymentMethods).replace(/'/g, "''");
        const stylistsJSON = JSON.stringify(invoice.stylists).replace(/'/g, "''");
        
        return `(
            uuid_generate_v4(),
            '${invoice.date}',
            '${invoice.date}',
            '${invoice.clientName.replace(/'/g, "''")}',
            '${invoice.clientName.replace(/'/g, "''")}',
            '${invoice.primaryStylist.replace(/'/g, "''")}',
            '${servicesJSON}',
            '${paymentsJSON}',
            ${invoice.totalSubtotal},
            ${invoice.totalTax},
            ${invoice.totalDiscount},
            ${invoice.totalAmount},
            ${invoice.totalAmount},
            '${invoice.paymentMethodDisplay.replace(/'/g, "''")}',
            'completed',
            'service',
            '${USER_ID}',
            'Excel Import - Invoice #${invoice.invoiceNumber} - ${invoice.serviceCount} services'
        )`;
    }).join(',\n        ');
    
    const completeSQL = `
-- Disable RLS for import
SET row_security = off;

-- Insert clients
INSERT INTO clients (full_name, mobile_number, phone, user_id, created_at, updated_at)
VALUES
        ${clientsSQL}
ON CONFLICT (mobile_number, user_id) DO NOTHING;

-- Insert stylists
INSERT INTO stylists (name, user_id, available, created_at, updated_at)
VALUES
        ${stylistsSQL}
ON CONFLICT (name, user_id) DO NOTHING;

-- Insert services
INSERT INTO services (name, price, duration, type, active, user_id, created_at, updated_at)
VALUES
        ${servicesSQL}
ON CONFLICT (name, user_id) DO NOTHING;

-- Insert POS orders
INSERT INTO pos_orders (
    id, created_at, date, client_name, customer_name, stylist_name,
    services, payments, subtotal, tax, discount, total, total_amount,
    payment_method, status, type, user_id, notes
)
VALUES
        ${posOrdersSQL};

-- Re-enable RLS
SET row_security = on;

-- Show summary
SELECT 
    'Import Summary' as summary,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    COUNT(DISTINCT client_name) as unique_clients
FROM pos_orders 
WHERE user_id = '${USER_ID}';
`;
    
    return completeSQL;
}

/**
 * Main execution
 */
async function main() {
    try {
        console.log('🚀 Starting Excel import process...\n');
        
        // Process Excel data
        const mergedInvoices = processExcelData();
        
        // Generate SQL
        const importSQL = generateImportSQL(mergedInvoices);
        
        // Save SQL file
        const sqlFileName = 'import_pos_orders_data.sql';
        fs.writeFileSync(sqlFileName, importSQL);
        console.log(`\n💾 SQL file saved: ${sqlFileName}`);
        
        // Show examples of merged data
        console.log('\n📊 Sample merged invoices:');
        mergedInvoices.slice(0, 3).forEach(invoice => {
            console.log(`\n📋 Invoice #${invoice.invoiceNumber} - ${invoice.clientName}`);
            console.log(`   Services: ${invoice.serviceCount}`);
            console.log(`   Payment: ${invoice.paymentMethodDisplay}`);
            console.log(`   Subtotal: ₹${invoice.totalSubtotal.toFixed(2)}`);
            console.log(`   Tax: ₹${invoice.totalTax.toFixed(2)}`);
            console.log(`   Total: ₹${invoice.totalAmount.toFixed(2)}`);
        });
        
        console.log(`\n✅ Ready to import ${mergedInvoices.length} merged invoices`);
        console.log(`📁 Run the generated SQL file: ${sqlFileName}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Execute if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { processExcelData, generateImportSQL }; 
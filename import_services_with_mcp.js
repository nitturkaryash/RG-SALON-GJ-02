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
 * Extract payment method from payment mode string
 */
function extractPaymentMethod(paymentMode) {
    if (!paymentMode || paymentMode === '-') return 'cash';
    
    const mode = paymentMode.toLowerCase();
    if (mode.includes('card')) return 'card';
    if (mode.includes('gpay') || mode.includes('upi')) return 'gpay';
    if (mode.includes('cash')) return 'cash';
    
    return 'cash';
}

/**
 * Calculate tax percentage from tax amount and unit price
 */
function calculateTaxPercentage(taxAmount, unitPrice, discount = 0) {
    const discountedPrice = unitPrice * (1 - discount / 100);
    if (discountedPrice === 0) return 18;
    
    const taxPercentage = (taxAmount / discountedPrice) * 100;
    return Math.round(taxPercentage * 100) / 100;
}

/**
 * Process Excel data and merge by invoice
 */
function processExcelData(filePath) {
    console.log(`Reading Excel file: ${filePath}`);
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${rawData.length} raw records`);
    
    // Process and group data by invoice number and client
    const groupedData = new Map();
    
    rawData.forEach((row, index) => {
        try {
            // Extract data from row
            const invoiceNo = row['Invoice No'] || row['invoice_no'] || (index + 1).toString();
            const clientName = row['Guest Name'] || row['guest_name'] || 'Unknown Client';
            const clientPhone = row['Guest Number'] || row['guest_number'] || '';
            const stylistName = row['Staff'] || row['staff'] || 'Admin';
            const serviceName = row['Service'] || row['service'] || 'Unknown Service';
            const category = row['Category'] || row['category'] || 'General';
            const quantity = parseInt(row['Qty'] || row['qty'] || 1);
            const unitPrice = parseFloat(row['Unit Price'] || row['unit_price'] || 0);
            const discount = parseFloat(row['Discount'] || row['discount'] || 0);
            const tax = parseFloat(row['Tax'] || row['tax'] || 0);
            const total = parseFloat(row['Total'] || row['total'] || 0);
            const paymentMode = row['Payment Mode'] || row['payment_mode'] || 'cash';
            
            // Handle date
            let serviceDate;
            const dateValue = row['Date'] || row['date'];
            if (typeof dateValue === 'number') {
                serviceDate = excelDateToJSDate(dateValue);
            } else if (dateValue) {
                serviceDate = new Date(dateValue);
            } else {
                serviceDate = new Date('2025-04-01');
            }
            
            // Calculate tax percentage
            const taxPercentage = tax > 0 ? calculateTaxPercentage(tax, unitPrice, discount) : 18;
            
            // Create unique key for grouping (invoice + client)
            const groupKey = `${invoiceNo}_${clientName.trim().toLowerCase()}`;
            
            if (!groupedData.has(groupKey)) {
                groupedData.set(groupKey, {
                    invoiceNumber: invoiceNo,
                    clientName: clientName.trim(),
                    clientPhone: clientPhone.toString().trim(),
                    serviceDate: serviceDate,
                    services: [],
                    stylists: new Set(),
                    paymentMethods: new Map(),
                    totalAmount: 0,
                    totalDiscount: 0,
                    totalTax: 0
                });
            }
            
            const group = groupedData.get(groupKey);
            
            // Add service to group
            group.services.push({
                name: serviceName.trim(),
                category: category.trim(),
                quantity: quantity,
                unitPrice: unitPrice,
                discount: discount,
                tax: tax,
                taxPercentage: taxPercentage,
                total: total,
                stylistName: stylistName.trim()
            });
            
            // Track stylists
            group.stylists.add(stylistName.trim());
            
            // Track payment methods with amounts
            const paymentMethod = extractPaymentMethod(paymentMode);
            if (group.paymentMethods.has(paymentMethod)) {
                group.paymentMethods.set(paymentMethod, group.paymentMethods.get(paymentMethod) + total);
            } else {
                group.paymentMethods.set(paymentMethod, total);
            }
            
            // Update totals
            group.totalAmount += total;
            group.totalDiscount += discount;
            group.totalTax += tax;
            
        } catch (error) {
            console.error(`Error processing row ${index + 1}:`, error);
        }
    });
    
    console.log(`Grouped into ${groupedData.size} unique invoices`);
    return Array.from(groupedData.values());
}

/**
 * Main execution function that demonstrates the process
 */
async function main() {
    try {
        console.log('🚀 Starting April Services Import Process...\n');
        
        // Step 1: Process Excel data
        const groupedData = processExcelData(EXCEL_FILE_PATH);
        
        if (groupedData.length === 0) {
            console.log('❌ No data found in Excel file');
            return;
        }
        
        console.log('\n📊 Processing Summary:');
        console.log(`📋 Total Invoices: ${groupedData.length}`);
        console.log(`💰 Total Amount: ₹${groupedData.reduce((sum, inv) => sum + inv.totalAmount, 0).toFixed(2)}`);
        console.log(`👥 Unique Clients: ${new Set(groupedData.map(inv => inv.clientPhone)).size}`);
        console.log(`💄 Unique Stylists: ${new Set(groupedData.flatMap(inv => Array.from(inv.stylists))).size}`);
        console.log(`🎯 Unique Services: ${new Set(groupedData.flatMap(inv => inv.services.map(s => s.name))).size}`);
        
        // Display sample invoices with proper merging
        console.log('\n📋 Sample Merged Invoices:');
        groupedData.slice(0, 5).forEach((invoice, index) => {
            console.log(`\n${index + 1}. Invoice #${invoice.invoiceNumber}`);
            console.log(`   Client: ${invoice.clientName} (${invoice.clientPhone})`);
            console.log(`   Date: ${invoice.serviceDate.toDateString()}`);
            console.log(`   Services (${invoice.services.length}):`);
            invoice.services.forEach(service => {
                console.log(`     • ${service.name} - ₹${service.unitPrice} x ${service.quantity} by ${service.stylistName}`);
            });
            console.log(`   Stylists: ${Array.from(invoice.stylists).join(', ')}`);
            
            // Payment methods with amounts in brackets
            const paymentDisplay = Array.from(invoice.paymentMethods.entries())
                .map(([method, amount]) => `${method} (₹${amount.toFixed(2)})`)
                .join(', ');
            console.log(`   Payment: ${paymentDisplay}`);
            console.log(`   Total: ₹${invoice.totalAmount.toFixed(2)} (Tax: ₹${invoice.totalTax.toFixed(2)}, Discount: ₹${invoice.totalDiscount.toFixed(2)})`);
        });
        
        // Generate SQL for manual execution
        console.log('\n📝 Generating SQL for manual execution...');
        await generateImportSQL(groupedData);
        
        console.log('\n✅ Process completed successfully!');
        console.log('\n📌 Next Steps:');
        console.log('1. Review the generated SQL file: import_april_services_merged.sql');
        console.log('2. Execute the SQL in your Supabase database');
        console.log('3. Verify the imported data in your application');
        
    } catch (error) {
        console.error('❌ Import process failed:', error);
        process.exit(1);
    }
}

/**
 * Generate SQL file for manual execution
 */
async function generateImportSQL(groupedData) {
    const sqlLines = [];
    
    sqlLines.push('-- Import April 2025 Services Data - Merged by Invoice and Client');
    sqlLines.push('-- Generated automatically with proper invoice grouping and payment methods with amounts');
    sqlLines.push('-- Execute this SQL in your Supabase database');
    sqlLines.push('');
    sqlLines.push('BEGIN;');
    sqlLines.push('');
    
    // Create clients
    sqlLines.push('-- Create missing clients');
    const uniqueClients = new Map();
    groupedData.forEach(invoice => {
        if (invoice.clientPhone) {
            uniqueClients.set(invoice.clientPhone, {
                name: invoice.clientName,
                phone: invoice.clientPhone
            });
        }
    });
    
    for (const [phone, client] of uniqueClients) {
        sqlLines.push(`INSERT INTO clients (full_name, mobile_number, phone, user_id, created_at, updated_at)`);
        sqlLines.push(`SELECT '${client.name.replace(/'/g, "''")}', '${phone}', '${phone}', '${USER_ID}', NOW(), NOW()`);
        sqlLines.push(`WHERE NOT EXISTS (SELECT 1 FROM clients WHERE mobile_number = '${phone}' AND user_id = '${USER_ID}');`);
        sqlLines.push('');
    }
    
    // Create stylists
    sqlLines.push('-- Create missing stylists');
    const uniqueStylists = new Set();
    groupedData.forEach(invoice => {
        invoice.stylists.forEach(stylist => uniqueStylists.add(stylist));
    });
    
    for (const stylistName of uniqueStylists) {
        sqlLines.push(`INSERT INTO stylists (name, user_id, available, created_at, updated_at)`);
        sqlLines.push(`SELECT '${stylistName.replace(/'/g, "''")}', '${USER_ID}', true, NOW(), NOW()`);
        sqlLines.push(`WHERE NOT EXISTS (SELECT 1 FROM stylists WHERE name = '${stylistName.replace(/'/g, "''")}' AND user_id = '${USER_ID}');`);
        sqlLines.push('');
    }
    
    // Create services
    sqlLines.push('-- Create missing services');
    const uniqueServices = new Map();
    groupedData.forEach(invoice => {
        invoice.services.forEach(service => {
            uniqueServices.set(service.name, {
                name: service.name,
                price: service.unitPrice,
                category: service.category
            });
        });
    });
    
    for (const [serviceName, service] of uniqueServices) {
        sqlLines.push(`INSERT INTO services (name, price, duration, type, active, user_id, created_at, updated_at)`);
        sqlLines.push(`SELECT '${serviceName.replace(/'/g, "''")}', ${service.price}, 60, 'service', true, '${USER_ID}', NOW(), NOW()`);
        sqlLines.push(`WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = '${serviceName.replace(/'/g, "''")}' AND user_id = '${USER_ID}');`);
        sqlLines.push('');
    }
    
    // Create POS orders
    sqlLines.push('-- Create POS orders with merged services');
    sqlLines.push('');
    
    groupedData.forEach((invoice, index) => {
        const primaryStylist = Array.from(invoice.stylists)[0];
        
        // Build services JSON
        const servicesJson = invoice.services.map(service => ({
            name: service.name,
            price: service.unitPrice,
            quantity: service.quantity,
            total: service.total,
            discount: service.discount,
            tax: service.tax,
            taxPercentage: service.taxPercentage,
            stylistName: service.stylistName
        }));
        
        // Build payment methods with amounts in brackets
        const paymentMethodsArray = [];
        for (const [method, amount] of invoice.paymentMethods) {
            paymentMethodsArray.push({
                method: method,
                amount: amount,
                display: `${method} (₹${amount.toFixed(2)})`
            });
        }
        
        const subtotal = invoice.totalAmount - invoice.totalTax;
        const paymentDisplay = paymentMethodsArray.map(p => p.display).join(', ');
        
        sqlLines.push(`-- Invoice #${invoice.invoiceNumber} for ${invoice.clientName}`);
        sqlLines.push(`INSERT INTO pos_orders (`);
        sqlLines.push(`    id, created_at, date, client_name, customer_name,`);
        sqlLines.push(`    stylist_name, services, payments, subtotal, tax,`);
        sqlLines.push(`    discount, total, total_amount, payment_method,`);
        sqlLines.push(`    status, type, user_id`);
        sqlLines.push(`) VALUES (`);
        sqlLines.push(`    uuid_generate_v4(),`);
        sqlLines.push(`    '${invoice.serviceDate.toISOString()}',`);
        sqlLines.push(`    '${invoice.serviceDate.toISOString()}',`);
        sqlLines.push(`    '${invoice.clientName.replace(/'/g, "''")}',`);
        sqlLines.push(`    '${invoice.clientName.replace(/'/g, "''")}',`);
        sqlLines.push(`    '${primaryStylist.replace(/'/g, "''")}',`);
        sqlLines.push(`    '${JSON.stringify(servicesJson).replace(/'/g, "''")}',`);
        sqlLines.push(`    '${JSON.stringify(paymentMethodsArray).replace(/'/g, "''")}',`);
        sqlLines.push(`    ${subtotal},`);
        sqlLines.push(`    ${invoice.totalTax},`);
        sqlLines.push(`    ${invoice.totalDiscount},`);
        sqlLines.push(`    ${invoice.totalAmount},`);
        sqlLines.push(`    ${invoice.totalAmount},`);
        sqlLines.push(`    '${paymentDisplay.replace(/'/g, "''")}',`);
        sqlLines.push(`    'completed',`);
        sqlLines.push(`    'service',`);
        sqlLines.push(`    '${USER_ID}'`);
        sqlLines.push(`);`);
        sqlLines.push('');
    });
    
    sqlLines.push('COMMIT;');
    sqlLines.push('');
    sqlLines.push(`-- Import Summary:`);
    sqlLines.push(`-- Total Invoices: ${groupedData.length}`);
    sqlLines.push(`-- Total Amount: ₹${groupedData.reduce((sum, inv) => sum + inv.totalAmount, 0).toFixed(2)}`);
    sqlLines.push(`-- Unique Clients: ${uniqueClients.size}`);
    sqlLines.push(`-- Unique Stylists: ${uniqueStylists.size}`);
    sqlLines.push(`-- Unique Services: ${uniqueServices.size}`);
    
    const sqlContent = sqlLines.join('\n');
    fs.writeFileSync('import_april_services_merged.sql', sqlContent);
    
    console.log('✅ Generated SQL file: import_april_services_merged.sql');
    console.log(`📊 Summary: ${groupedData.length} invoices, ₹${groupedData.reduce((sum, inv) => sum + inv.totalAmount, 0).toFixed(2)} total`);
}

// Export for use
export { processExcelData, main };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
} 
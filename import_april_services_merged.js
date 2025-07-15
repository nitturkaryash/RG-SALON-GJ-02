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
 * Create missing clients in database
 */
async function createMissingClients(groupedData) {
    console.log('Creating missing clients...');
    
    const uniqueClients = new Map();
    groupedData.forEach(invoice => {
        if (invoice.clientPhone) {
            uniqueClients.set(invoice.clientPhone, {
                name: invoice.clientName,
                phone: invoice.clientPhone
            });
        }
    });
    
    console.log(`Found ${uniqueClients.size} unique clients`);
    
    for (const [phone, client] of uniqueClients) {
        try {
            // Check if client exists
            const existingQuery = `
                SELECT id FROM clients 
                WHERE mobile_number = '${phone}' 
                AND user_id = '${USER_ID}'
                LIMIT 1
            `;
            
            const existing = await mcpSupabaseExecuteSQL(PROJECT_ID, existingQuery);
            
            if (!existing || existing.length === 0) {
                // Create new client
                const insertQuery = `
                    INSERT INTO clients (full_name, mobile_number, phone, user_id, created_at, updated_at)
                    VALUES ('${client.name.replace(/'/g, "''")}', '${phone}', '${phone}', '${USER_ID}', NOW(), NOW())
                `;
                
                await mcpSupabaseExecuteSQL(PROJECT_ID, insertQuery);
                console.log(`Created client: ${client.name}`);
            }
        } catch (error) {
            console.error(`Error creating client ${client.name}:`, error);
        }
    }
}

/**
 * Create missing stylists in database
 */
async function createMissingStylists(groupedData) {
    console.log('Creating missing stylists...');
    
    const uniqueStylists = new Set();
    groupedData.forEach(invoice => {
        invoice.stylists.forEach(stylist => uniqueStylists.add(stylist));
    });
    
    console.log(`Found ${uniqueStylists.size} unique stylists`);
    
    for (const stylistName of uniqueStylists) {
        try {
            // Check if stylist exists
            const existingQuery = `
                SELECT id FROM stylists 
                WHERE name = '${stylistName.replace(/'/g, "''")}' 
                AND user_id = '${USER_ID}'
                LIMIT 1
            `;
            
            const existing = await mcpSupabaseExecuteSQL(PROJECT_ID, existingQuery);
            
            if (!existing || existing.length === 0) {
                // Create new stylist
                const insertQuery = `
                    INSERT INTO stylists (name, user_id, available, created_at, updated_at)
                    VALUES ('${stylistName.replace(/'/g, "''")}', '${USER_ID}', true, NOW(), NOW())
                `;
                
                await mcpSupabaseExecuteSQL(PROJECT_ID, insertQuery);
                console.log(`Created stylist: ${stylistName}`);
            }
        } catch (error) {
            console.error(`Error creating stylist ${stylistName}:`, error);
        }
    }
}

/**
 * Create missing services in database
 */
async function createMissingServices(groupedData) {
    console.log('Creating missing services...');
    
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
    
    console.log(`Found ${uniqueServices.size} unique services`);
    
    for (const [serviceName, service] of uniqueServices) {
        try {
            // Check if service exists
            const existingQuery = `
                SELECT id FROM services 
                WHERE name = '${serviceName.replace(/'/g, "''")}' 
                AND user_id = '${USER_ID}'
                LIMIT 1
            `;
            
            const existing = await mcpSupabaseExecuteSQL(PROJECT_ID, existingQuery);
            
            if (!existing || existing.length === 0) {
                // Create new service
                const insertQuery = `
                    INSERT INTO services (name, price, duration, type, active, user_id, created_at, updated_at)
                    VALUES ('${serviceName.replace(/'/g, "''")}', ${service.price}, 60, 'service', true, '${USER_ID}', NOW(), NOW())
                `;
                
                await mcpSupabaseExecuteSQL(PROJECT_ID, insertQuery);
                console.log(`Created service: ${serviceName}`);
            }
        } catch (error) {
            console.error(`Error creating service ${serviceName}:`, error);
        }
    }
}

/**
 * Import POS orders with merged services
 */
async function importPOSOrders(groupedData) {
    console.log('Importing POS orders...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const invoice of groupedData) {
        try {
            // Get client ID
            const clientQuery = `
                SELECT id FROM clients 
                WHERE mobile_number = '${invoice.clientPhone}' 
                AND user_id = '${USER_ID}'
                LIMIT 1
            `;
            const clientResult = await mcpSupabaseExecuteSQL(PROJECT_ID, clientQuery);
            
            if (!clientResult || clientResult.length === 0) {
                console.error(`Client not found for phone: ${invoice.clientPhone}`);
                errorCount++;
                continue;
            }
            
            const clientId = clientResult[0].id;
            
            // Get primary stylist ID (first stylist in the list)
            const primaryStylist = Array.from(invoice.stylists)[0];
            const stylistQuery = `
                SELECT id FROM stylists 
                WHERE name = '${primaryStylist.replace(/'/g, "''")}' 
                AND user_id = '${USER_ID}'
                LIMIT 1
            `;
            const stylistResult = await mcpSupabaseExecuteSQL(PROJECT_ID, stylistQuery);
            
            const stylistId = stylistResult && stylistResult.length > 0 ? stylistResult[0].id : null;
            
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
            
            // Calculate subtotal (before tax)
            const subtotal = invoice.totalAmount - invoice.totalTax;
            
            // Insert POS order
            const orderInsertQuery = `
                INSERT INTO pos_orders (
                    id,
                    created_at,
                    date,
                    client_name,
                    customer_name,
                    stylist_id,
                    stylist_name,
                    services,
                    payments,
                    subtotal,
                    tax,
                    discount,
                    total,
                    total_amount,
                    payment_method,
                    status,
                    type,
                    user_id
                ) VALUES (
                    uuid_generate_v4(),
                    '${invoice.serviceDate.toISOString()}',
                    '${invoice.serviceDate.toISOString()}',
                    '${invoice.clientName.replace(/'/g, "''")}',
                    '${invoice.clientName.replace(/'/g, "''")}',
                    ${stylistId ? `'${stylistId}'` : 'NULL'},
                    '${primaryStylist.replace(/'/g, "''")}',
                    '${JSON.stringify(servicesJson).replace(/'/g, "''")}',
                    '${JSON.stringify(paymentMethodsArray).replace(/'/g, "''")}',
                    ${subtotal},
                    ${invoice.totalTax},
                    ${invoice.totalDiscount},
                    ${invoice.totalAmount},
                    ${invoice.totalAmount},
                    '${paymentMethodsArray.map(p => p.display).join(', ')}',
                    'completed',
                    'service',
                    '${USER_ID}'
                )
            `;
            
            await mcpSupabaseExecuteSQL(PROJECT_ID, orderInsertQuery);
            
            console.log(`✓ Imported invoice ${invoice.invoiceNumber} for ${invoice.clientName} - ₹${invoice.totalAmount} (${invoice.services.length} services)`);
            successCount++;
            
        } catch (error) {
            console.error(`✗ Error importing invoice ${invoice.invoiceNumber}:`, error);
            errorCount++;
        }
    }
    
    console.log(`\nImport completed:`);
    console.log(`✓ Success: ${successCount} orders`);
    console.log(`✗ Errors: ${errorCount} orders`);
}

/**
 * Mock MCP Supabase function (replace with actual MCP calls)
 */
async function mcpSupabaseExecuteSQL(projectId, query) {
    console.log(`Executing SQL: ${query.substring(0, 100)}...`);
    // This would be replaced with actual MCP Supabase call
    // For now, return empty result to simulate
    return [];
}

/**
 * Main execution function
 */
async function main() {
    try {
        console.log('Starting April Services Import Process...\n');
        
        // Step 1: Process Excel data
        const groupedData = processExcelData(EXCEL_FILE_PATH);
        
        // Step 2: Create missing reference data
        await createMissingClients(groupedData);
        await createMissingStylists(groupedData);
        await createMissingServices(groupedData);
        
        // Step 3: Import POS orders
        await importPOSOrders(groupedData);
        
        console.log('\n✅ Import process completed successfully!');
        
        // Display summary
        console.log('\n📊 Import Summary:');
        console.log(`Total Invoices: ${groupedData.length}`);
        console.log(`Total Amount: ₹${groupedData.reduce((sum, inv) => sum + inv.totalAmount, 0).toFixed(2)}`);
        
        // Sample invoice details
        if (groupedData.length > 0) {
            const sample = groupedData[0];
            console.log(`\n📋 Sample Invoice (${sample.invoiceNumber}):`);
            console.log(`Client: ${sample.clientName} (${sample.clientPhone})`);
            console.log(`Services: ${sample.services.length}`);
            console.log(`Stylists: ${Array.from(sample.stylists).join(', ')}`);
            console.log(`Payment: ${Array.from(sample.paymentMethods.entries()).map(([method, amount]) => `${method} (₹${amount})`).join(', ')}`);
            console.log(`Total: ₹${sample.totalAmount}`);
        }
        
    } catch (error) {
        console.error('❌ Import process failed:', error);
        process.exit(1);
    }
}

// Export for use
export { processExcelData, main };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
} 
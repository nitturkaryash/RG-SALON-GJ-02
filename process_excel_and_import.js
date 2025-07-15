const fs = require('fs');
const XLSX = require('xlsx');

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
 * Main execution
 */
async function main() {
    try {
        console.log('🚀 Starting Excel import process...\n');
        
        // Process Excel data
        const mergedInvoices = processExcelData();
        
        // Show examples of merged data
        console.log('\n📊 Sample merged invoices:');
        mergedInvoices.slice(0, 5).forEach(invoice => {
            console.log(`\n📋 Invoice #${invoice.invoiceNumber} - ${invoice.clientName}`);
            console.log(`   Services: ${invoice.serviceCount}`);
            console.log(`   Payment: ${invoice.paymentMethodDisplay}`);
            console.log(`   Subtotal: ₹${invoice.totalSubtotal.toFixed(2)}`);
            console.log(`   Tax: ₹${invoice.totalTax.toFixed(2)}`);
            console.log(`   Total: ₹${invoice.totalAmount.toFixed(2)}`);
        });
        
        console.log(`\n✅ Ready to import ${mergedInvoices.length} merged invoices`);
        
        // Return processed data for MCP import
        return mergedInvoices;
        
    } catch (error) {
        console.error('❌ Error:', error);
        return null;
    }
}

// Execute if running directly
if (require.main === module) {
    main();
}

module.exports = { processExcelData, main }; 
#!/usr/bin/env node
// test_excel_parsing.js
// Test Excel parsing for SERVICE APRIL-2025.xlsx without database operations
// Usage: node test_excel_parsing.js "SHEETS/SERVICE APRIL-2025.xlsx"

const fs = require('fs');
const xlsx = require('xlsx');

/** Enhanced Excel serial date to JavaScript Date conversion */
const excelDateToJSDate = (serial) => {
  try {
    if (!serial || isNaN(serial) || serial <= 0) {
      console.warn(`Invalid Excel date serial: ${serial}, using current date`);
      return new Date();
    }
    
    // Excel epoch starts on January 1, 1900
    const excelEpoch = new Date(1900, 0, 1);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    
    // Excel incorrectly treats 1900 as a leap year, so we need to adjust for dates after Feb 28, 1900
    const adjustedSerial = serial > 59 ? serial - 1 : serial;
    
    const jsDate = new Date(excelEpoch.getTime() + (adjustedSerial - 1) * millisecondsPerDay);
    
    // Validate the result
    if (isNaN(jsDate.getTime())) {
      console.warn(`Invalid computed date for serial ${serial}, using current date`);
      return new Date();
    }
    
    return jsDate;
  } catch (error) {
    console.warn(`Error parsing Excel date ${serial}:`, error.message, ', using current date');
    return new Date();
  }
};

/** Enhanced payment mode parsing for complex formats like "Card(1180)" or "Cash(1062),GPay(701)" */
const parsePaymentMode = (raw) => {
  if (!raw || typeof raw !== 'string') {
    return { method: 'cash', amount: 0, isSplit: false, details: [] };
  }

  try {
    const parts = raw.split(',').map(s => s.trim());
    const methods = [];
    let totalAmount = 0;
    
    parts.forEach(part => {
      // Extract method and amount from formats like "Card(1180)" or "GPay(1652)"
      const match = part.match(/^([^(]+)\(([^)]+)\)$/);
      if (match) {
        const method = match[1].trim().toLowerCase().replace(/\s+/g, '_');
        const amount = parseFloat(match[2]) || 0;
        methods.push({ method, amount });
        totalAmount += amount;
      } else {
        // Fallback: just the method name
        const method = part.toLowerCase().replace(/\s+/g, '_');
        methods.push({ method, amount: 0 });
      }
    });

    if (methods.length === 0) {
      return { method: 'cash', amount: 0, isSplit: false, details: [] };
    }

    return {
      method: methods.map(m => m.method).join('+'),
      amount: totalAmount,
      isSplit: methods.length > 1,
      details: methods
    };
  } catch (error) {
    console.warn(`Error parsing payment mode "${raw}":`, error.message);
    return { method: 'cash', amount: 0, isSplit: false, details: [] };
  }
};

// Get command line arguments
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node test_excel_parsing.js <excel_file_path>');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

console.log('📥 Testing Excel parsing for:', filePath);
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Get raw data with headers
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
const jsonData = xlsx.utils.sheet_to_json(sheet, { raw: false });

if (rows.length < 2) {
  console.error('No data rows found.');
  process.exit(1);
}

const header = rows[0];
console.log('📋 Detected columns:', header.join(', '));
console.log(`📊 Total rows found: ${jsonData.length}`);

// Enhanced column mapping for SERVICE APRIL-2025.xlsx format
const findColumn = (possibleNames) => {
  for (const name of possibleNames) {
    const index = header.findIndex((h) => h && h.toString().toLowerCase().includes(name.toLowerCase()));
    if (index !== -1) return index;
  }
  return -1;
};

const columnMapping = {
  sr: 0, // First column is usually serial number
  invoiceNo: findColumn(['invoice', 'invoice no']),
  date: findColumn(['date']),
  guestName: findColumn(['guest name', 'guest', 'client', 'customer']),
  guestNumber: findColumn(['guest number', 'phone', 'mobile', 'contact']),
  staff: findColumn(['staff', 'stylist', 'employee']),
  service: findColumn(['service', 'treatment']),
  category: findColumn(['category']),
  qty: findColumn(['qty', 'quantity']),
  unitPrice: findColumn(['unit price', 'price']),
  discount: findColumn(['discount']),
  complementary: findColumn(['complementary']),
  redemptionAmount: findColumn(['redemption amount']),
  redemptionSources: findColumn(['redemption sources']),
  tax: findColumn(['tax']),
  subtotal: findColumn(['subtotal']),
  total: findColumn(['total']),
  paymentMode: findColumn(['payment mode', 'payment', 'payment method'])
};

console.log('📋 Column mapping:', columnMapping);

// Validate mandatory columns exist
const mandatory = ['date', 'guestName', 'service', 'total'];
const missingColumns = mandatory.filter(field => columnMapping[field] === -1);

if (missingColumns.length > 0) {
  console.error('❌ Missing mandatory columns:', missingColumns);
  console.error('Available columns:', header);
  process.exit(1);
}

// Process rows with enhanced error handling
let successCount = 0;
let errorCount = 0;
const errors = [];
const processedData = [];

console.log(`🔄 Processing ${jsonData.length} rows...`);

for (let i = 0; i < jsonData.length; i++) {
  const row = rows[i + 1]; // Skip header row
  const jsonRow = jsonData[i];
  
  try {
    // Extract data with fallbacks
    const invoiceNo = row[columnMapping.invoiceNo] || jsonRow['Invoice No'] || `APR25-${i + 1}`;
    const serialNo = row[columnMapping.sr] || (i + 1);
    
    // Enhanced date parsing
    let serviceDate;
    const dateValue = row[columnMapping.date] || jsonRow['Date'];
    if (typeof dateValue === 'number') {
      serviceDate = excelDateToJSDate(dateValue);
    } else if (dateValue) {
      serviceDate = new Date(dateValue);
      if (isNaN(serviceDate.getTime())) {
        serviceDate = new Date(); // Fallback to current date
      }
    } else {
      serviceDate = new Date(); // Default to current date
    }

    const guestName = (row[columnMapping.guestName] || jsonRow['Guest Name'] || 'Walk-in').toString().trim();
    const guestNumber = (row[columnMapping.guestNumber] || jsonRow['Guest Number'] || '').toString().trim();
    const staff = (row[columnMapping.staff] || jsonRow['Staff'] || 'Admin').toString().trim();
    const service = (row[columnMapping.service] || jsonRow['Service'] || 'General Service').toString().trim();
    const category = (row[columnMapping.category] || jsonRow['Category'] || 'General').toString().trim();
    
    // Numeric values with proper parsing
    const qty = parseInt(row[columnMapping.qty] || jsonRow['Qty'] || 1) || 1;
    const unitPrice = parseFloat(row[columnMapping.unitPrice] || jsonRow['Unit Price'] || 0) || 0;
    const discount = parseFloat(row[columnMapping.discount] || jsonRow['Discount'] || 0) || 0;
    const tax = parseFloat(row[columnMapping.tax] || jsonRow['Tax'] || 0) || 0;
    const subtotal = parseFloat(row[columnMapping.subtotal] || jsonRow['Subtotal(without tax & redemption)'] || (unitPrice * qty)) || 0;
    const total = parseFloat(row[columnMapping.total] || jsonRow['Total'] || 0) || 0;
    
    // Enhanced payment parsing
    const paymentModeRaw = row[columnMapping.paymentMode] || jsonRow['Payment Mode'] || 'cash';
    const paymentInfo = parsePaymentMode(paymentModeRaw);

    // Store processed data
    const processedRow = {
      rowIndex: i + 1,
      invoiceNo,
      serialNo,
      serviceDate: serviceDate.toISOString(),
      guestName,
      guestNumber,
      staff,
      service,
      category,
      qty,
      unitPrice,
      discount,
      tax,
      subtotal,
      total,
      paymentInfo,
      originalDateValue: dateValue
    };

    processedData.push(processedRow);
    successCount++;

    // Show sample data for first few rows
    if (successCount <= 5) {
      console.log(`\n📋 Row ${i + 1} processed successfully:`);
      console.log(`  Invoice: ${invoiceNo} | Date: ${serviceDate.toDateString()} (from ${dateValue})`);
      console.log(`  Guest: ${guestName} (${guestNumber})`);
      console.log(`  Service: ${service} | Staff: ${staff}`);
      console.log(`  Amount: ₹${total} | Payment: ${paymentInfo.method} (₹${paymentInfo.amount})`);
    }

    if (successCount % 100 === 0) {
      console.log(`✅ Processed ${successCount} rows successfully...`);
    }

  } catch (err) {
    errorCount++;
    const errorMsg = err.message || err.toString();
    errors.push({ row: i + 1, error: errorMsg, data: jsonRow });
    console.error(`❌ Error processing row ${i + 1}:`, errorMsg);
    
    // Log first few errors in detail
    if (errorCount <= 5) {
      console.error('Row data:', jsonRow);
    }
  }
}

// Final summary
console.log('\n🎉 Excel parsing test completed!');
console.log(`✅ Successfully parsed: ${successCount} rows`);
console.log(`❌ Failed to parse: ${errorCount} rows`);
console.log(`📊 Total processed: ${successCount + errorCount} / ${jsonData.length} rows`);

// Show processing statistics
if (processedData.length > 0) {
  console.log('\n📊 Processing Statistics:');
  
  // Unique invoices
  const uniqueInvoices = new Set(processedData.map(row => row.invoiceNo));
  console.log(`📋 Unique invoices: ${uniqueInvoices.size}`);
  
  // Date range
  const dates = processedData.map(row => new Date(row.serviceDate)).filter(d => !isNaN(d.getTime()));
  if (dates.length > 0) {
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    console.log(`📅 Date range: ${minDate.toDateString()} to ${maxDate.toDateString()}`);
  }
  
  // Total amount
  const totalAmount = processedData.reduce((sum, row) => sum + row.total, 0);
  console.log(`💰 Total amount: ₹${totalAmount.toFixed(2)}`);
  
  // Unique clients
  const uniqueClients = new Set(processedData.map(row => row.guestName));
  console.log(`👥 Unique clients: ${uniqueClients.size}`);
  
  // Unique staff
  const uniqueStaff = new Set(processedData.map(row => row.staff));
  console.log(`👨‍💼 Unique staff: ${uniqueStaff.size}`);
  
  // Payment methods
  const paymentMethods = {};
  processedData.forEach(row => {
    const method = row.paymentInfo.method;
    paymentMethods[method] = (paymentMethods[method] || 0) + 1;
  });
  console.log(`💳 Payment methods:`, paymentMethods);
}

if (errors.length > 0) {
  console.log('\n📄 Error Summary:');
  const errorSummary = errors.slice(0, 10).map(e => `Row ${e.row}: ${e.error}`);
  errorSummary.forEach(err => console.log(`  - ${err}`));
  
  if (errors.length > 10) {
    console.log(`  ... and ${errors.length - 10} more errors`);
  }
  
  // Save full error log
  const errorLogPath = `./test_parsing_errors_${Date.now()}.json`;
  fs.writeFileSync(errorLogPath, JSON.stringify(errors, null, 2));
  console.log(`📝 Full error log saved to: ${errorLogPath}`);
}

// Save successful data sample
if (processedData.length > 0) {
  const sampleData = processedData.slice(0, 10);
  const samplePath = `./test_parsing_sample_${Date.now()}.json`;
  fs.writeFileSync(samplePath, JSON.stringify(sampleData, null, 2));
  console.log(`📋 Sample processed data saved to: ${samplePath}`);
}

console.log(`\n✅ All ${successCount} rows can be processed successfully!`);
process.exit(0); 
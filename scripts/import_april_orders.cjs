#!/usr/bin/env node
// import_april_orders.cjs
// Enhanced version to handle all 790 rows from SERVICE APRIL-2025.xlsx
// Usage: node scripts/import_april_orders.cjs /path/to/SERVICE\ APRIL-2025.xlsx
// Description: Reads the April 2025 service Excel sheet and inserts data into Supabase tables: pos_orders and pos_order_items.
// The script expects SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be present in environment variables.

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

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

/** Validate environment variables */
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Get command line arguments
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node scripts/import_april_orders.cjs <excel_file_path>');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

(async () => {
  console.log('📥 Reading Excel file:', filePath);
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

      // Generate unique order number
      const orderNumber = `APR25-${serialNo}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

      // Build comprehensive order record
      const orderRecord = {
        id: uuidv4(),
        created_at: serviceDate.toISOString(),
        date: serviceDate.toISOString(),
        client_name: guestName,
        customer_name: guestName,
        client_phone: guestNumber,
        stylist_name: staff,
        services: [
          {
            id: uuidv4(),
            name: service,
            service_name: service,
            category: category,
            quantity: qty,
            unit_price: unitPrice,
            price: unitPrice,
            discount: discount,
            tax: tax,
            subtotal: subtotal,
            total: total,
            type: 'service'
          }
        ],
        payments: [
          {
            method: paymentInfo.method,
            amount: paymentInfo.amount || total,
            is_split: paymentInfo.isSplit
          }
        ],
        subtotal: subtotal,
        tax: tax,
        discount: discount,
        total: total,
        total_amount: total,
        payment_method: paymentInfo.method,
        status: 'completed',
        type: 'service',
        is_walk_in: true,
        is_split_payment: paymentInfo.isSplit,
        pending_amount: 0,
        user_id: '3f4b718f-70cb-4873-a62c-b8806a92e25b', // Add required user_id
        stock_snapshot: JSON.stringify({ // Preserve original data
          original_row: jsonRow,
          invoice_no: invoiceNo,
          serial_no: serialNo,
          payment_details: paymentInfo.details
        })
      };

      // Insert order
      const { data: insertedOrders, error: orderError } = await supabase
        .from('pos_orders')
        .insert(orderRecord)
        .select();

      if (orderError) {
        throw orderError;
      }

      const insertedOrder = insertedOrders[0];

      // Build order item for pos_order_items table
      const orderItem = {
        id: uuidv4(),
        pos_order_id: insertedOrder.id,
        order_id: orderNumber,
        service_name: service,
        product_name: service,
        type: 'service',
        quantity: qty,
        price: unitPrice,
        discount: discount,
        total: total,
        gst_percentage: tax && subtotal ? (tax / subtotal) * 100 : 0,
        user_id: '3f4b718f-70cb-4873-a62c-b8806a92e25b'
      };

      const { error: itemError } = await supabase.from('pos_order_items').insert(orderItem);
      if (itemError) {
        console.warn(`⚠️ Failed to insert order item for row ${i + 1}:`, itemError.message);
      }

      successCount++;
      if (successCount % 50 === 0) {
        console.log(`✅ Processed ${successCount} orders successfully...`);
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
  console.log('\n🎉 Import completed!');
  console.log(`✅ Successfully imported: ${successCount} orders`);
  console.log(`❌ Failed to import: ${errorCount} orders`);
  console.log(`📊 Total processed: ${successCount + errorCount} / ${jsonData.length} rows`);

  if (errors.length > 0) {
    console.log('\n📄 Error Summary:');
    const errorSummary = errors.slice(0, 10).map(e => `Row ${e.row}: ${e.error}`);
    errorSummary.forEach(err => console.log(`  - ${err}`));
    
    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more errors`);
    }
    
    // Save full error log
    const errorLogPath = `./import_errors_${Date.now()}.json`;
    fs.writeFileSync(errorLogPath, JSON.stringify(errors, null, 2));
    console.log(`📝 Full error log saved to: ${errorLogPath}`);
  }

  process.exit(errorCount > 0 ? 1 : 0);
})(); 
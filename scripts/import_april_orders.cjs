#!/usr/bin/env node
// import_april_orders.cjs
// Usage: node scripts/import_april_orders.cjs /path/to/SERVICE\ APRIL-2025.xlsx
// Description: Reads the April 2025 service Excel sheet and inserts data into Supabase tables: pos_orders and pos_order_items.
// The script expects SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be present in environment variables.

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

/** Helper to convert Excel serial date to ISO string (YYYY-MM-DD) */
const excelDateToISO = (serial) => {
  if (!serial || isNaN(serial)) return null;
  // Excel incorrectly assumes 1900 is a leap year; adjust by -1
  const utcDays = Math.floor(serial - 25569); // days between 1899-12-30 and 1970-01-01
  const utcValue = utcDays * 86400; // seconds
  const dateInfo = new Date(utcValue * 1000);
  return dateInfo.toISOString().split('T')[0]; // YYYY-MM-DD
};

/** Parse payment mode string like "Cash(1062),GPay(701)" => { methods: ['Cash','GPay'], split: true } */
const parsePaymentMode = (raw) => {
  if (!raw) return { method: 'Unknown', isSplit: false };
  const methods = raw.split(',').map((s) => s.trim().split('(')[0]);
  return {
    method: methods.join('+'),
    isSplit: methods.length > 1,
  };
};

/** Validate env */
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

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
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  if (rows.length < 2) {
    console.error('No data rows found.');
    process.exit(1);
  }

  const header = rows[0];
  console.log('Detected columns:', header.join(', '));

  // Map header titles to column indexes for flexibility
  const colIndex = (title) => header.findIndex((h) => h && h.toString().toLowerCase().includes(title));

  const idx = {
    sr: 0,
    date: colIndex('date'),
    guestName: colIndex('guest'),
    staff: colIndex('staff'),
    service: colIndex('service'),
    category: colIndex('category'),
    qty: colIndex('qty'),
    unitPrice: colIndex('unit price'),
    discount: colIndex('discount'),
    tax: colIndex('tax'),
    subtotal: colIndex('subtotal'),
    total: colIndex('total'),
    payment: colIndex('payment'),
  };

  // Validate mandatory indexes
  const mandatory = ['date', 'guestName', 'service', 'qty', 'unitPrice', 'total'];
  mandatory.forEach((field) => {
    if (idx[field] === -1) {
      console.error(`Mandatory column "${field}" not found. Aborting.`);
      process.exit(1);
    }
  });

  // Process rows (skip header)
  const dataRows = rows.slice(1).filter((r) => r && r.length > 1);
  console.log(`Processing ${dataRows.length} rows...`);

  for (const row of dataRows) {
    try {
      const orderNumber = `APR25-${row[idx.sr] || uuidv4().slice(0, 8)}`;
      const isoDate = excelDateToISO(row[idx.date]);
      const { method: paymentMethod, isSplit } = parsePaymentMode(row[idx.payment]);

      const subtotal = Number(row[idx.subtotal] || row[idx.unitPrice] * row[idx.qty] || 0);
      const tax = Number(row[idx.tax] || 0);
      const discount = Number(row[idx.discount] || 0);
      const total = Number(row[idx.total] || subtotal + tax - discount);

      // Build order record
      const orderRecord = {
        order_number: orderNumber,
        client_name: row[idx.guestName] || 'Walk-in',
        customer_name: row[idx.guestName] || 'Walk-in',
        stylist_name: row[idx.staff] || null,
        services: [
          {
            name: row[idx.service],
            category: row[idx.category],
            quantity: Number(row[idx.qty]) || 1,
            unit_price: Number(row[idx.unitPrice]) || 0,
            discount: discount,
            tax: tax,
            subtotal: subtotal,
            total: total,
          },
        ],
        subtotal: subtotal,
        tax: tax,
        discount: discount,
        total: total,
        total_amount: total,
        payment_method: paymentMethod,
        status: 'completed',
        date: isoDate,
        type: 'service',
        is_walk_in: true,
        is_split_payment: isSplit,
        pending_amount: 0,
      };

      const { data: insertedOrders, error: orderError } = await supabase
        .from('pos_orders')
        .insert(orderRecord)
        .select();

      if (orderError) {
        throw orderError;
      }

      const insertedOrder = insertedOrders[0];

      // Build order item
      const orderItem = {
        pos_order_id: insertedOrder.id,
        order_id: insertedOrder.order_number,
        service_name: row[idx.service],
        product_name: row[idx.service],
        type: 'service',
        quantity: Number(row[idx.qty]) || 1,
        price: Number(row[idx.unitPrice]) || 0,
        discount: discount,
        total: total,
        gst_percentage: tax && subtotal ? (tax / subtotal) * 100 : null,
      };

      const { error: itemError } = await supabase.from('pos_order_items').insert(orderItem);
      if (itemError) {
        console.warn('⚠️ Failed to insert order item:', itemError.message);
      }

      console.log(`✅ Imported order ${orderNumber}`);
    } catch (err) {
      console.error('❌ Error importing row:', err.message || err);
    }
  }

  console.log('🎉 Import completed.');
  process.exit(0);
})(); 
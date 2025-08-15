import { Purchase, Sale, Consumption, BalanceStock, InventoryExportData } from '../models/inventoryTypes';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration strictly from env
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to execute SQL for table creation
const executeSQL = async (sql: string) => {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('SQL execution error:', error);
    return { success: false, error };
  }
};

// Define table schemas based on your application's data models
const createInventoryTables = async () => {
  // Enable UUID extension
  await executeSQL(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
  
  // Create inventory_purchases table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS inventory_purchases (
      purchase_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      date TIMESTAMP NOT NULL DEFAULT NOW(),
      product_name TEXT NOT NULL,
      hsn_code TEXT,
      units TEXT,
      purchase_invoice_number TEXT,
      purchase_qty INTEGER NOT NULL,
      mrp_incl_gst FLOAT,
      mrp_excl_gst FLOAT,
      discount_on_purchase_percentage FLOAT DEFAULT 0,
      gst_percentage FLOAT DEFAULT 18,
      purchase_taxable_value FLOAT,
      purchase_igst FLOAT DEFAULT 0,
      purchase_cgst FLOAT,
      purchase_sgst FLOAT,
      purchase_invoice_value_rs FLOAT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Create inventory_sales table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS inventory_sales (
      sale_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      date TIMESTAMP NOT NULL DEFAULT NOW(),
      product_name TEXT NOT NULL,
      hsn_code TEXT,
      units TEXT,
      invoice_no TEXT,
      sales_qty INTEGER NOT NULL,
      purchase_cost_per_unit_ex_gst FLOAT,
      purchase_gst_percentage FLOAT DEFAULT 18,
      purchase_taxable_value FLOAT,
      purchase_igst FLOAT DEFAULT 0,
      purchase_cgst FLOAT,
      purchase_sgst FLOAT,
      total_purchase_cost FLOAT,
      mrp_incl_gst FLOAT,
      mrp_excl_gst FLOAT,
      discount_on_sales_percentage FLOAT DEFAULT 0,
      discounted_sales_rate_excl_gst FLOAT,
      sales_gst_percentage FLOAT DEFAULT 18,
      sales_taxable_value FLOAT,
      igst_rs FLOAT DEFAULT 0,
      cgst_rs FLOAT,
      sgst_rs FLOAT,
      invoice_value_rs FLOAT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Create inventory_consumption table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS inventory_consumption (
      consumption_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      date TIMESTAMP NOT NULL DEFAULT NOW(),
      product_name TEXT NOT NULL,
      hsn_code TEXT,
      units TEXT,
      requisition_voucher_no TEXT,
      consumption_qty INTEGER NOT NULL,
      purchase_cost_per_unit_ex_gst FLOAT,
      purchase_gst_percentage FLOAT DEFAULT 18,
      purchase_taxable_value FLOAT,
      purchase_igst FLOAT DEFAULT 0,
      purchase_cgst FLOAT,
      purchase_sgst FLOAT,
      total_purchase_cost FLOAT,
      balance_qty INTEGER,
      taxable_value FLOAT,
      igst_rs FLOAT DEFAULT 0,
      cgst_rs FLOAT,
      sgst_rs FLOAT,
      invoice_value FLOAT,
      purpose TEXT,
      notes TEXT,
      is_salon_consumption BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Create pos_orders table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS pos_orders (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      order_id TEXT NOT NULL UNIQUE,
      date TIMESTAMP NOT NULL DEFAULT NOW(),
      customer_name TEXT DEFAULT 'Salon Internal',
      stylist_name TEXT,
      purchase_type TEXT NOT NULL DEFAULT 'regular',
      payment_method TEXT DEFAULT 'Cash',
      status TEXT DEFAULT 'Unknown',
      total_amount FLOAT DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Create pos_order_items table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS pos_order_items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      order_id TEXT NOT NULL REFERENCES pos_orders(order_id),
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price FLOAT DEFAULT 0,
      total_price FLOAT DEFAULT 0,
      type TEXT DEFAULT 'Product',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Create indexes
  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_purchases_date ON inventory_purchases(date);
    CREATE INDEX IF NOT EXISTS idx_sales_invoice_no ON inventory_sales(invoice_no);
    CREATE INDEX IF NOT EXISTS idx_consumption_voucher_no ON inventory_consumption(requisition_voucher_no);
    CREATE INDEX IF NOT EXISTS idx_pos_orders_date ON pos_orders(date);
    CREATE INDEX IF NOT EXISTS idx_pos_orders_type ON pos_orders(purchase_type);
    CREATE INDEX IF NOT EXISTS idx_pos_order_items_order ON pos_order_items(order_id);
  `);

  // Create balance stock view
  await executeSQL(`
    CREATE OR REPLACE VIEW inventory_balance_stock AS
    SELECT
      p.product_name,
      p.hsn_code,
      p.units,
      SUM(p.purchase_qty) as total_purchases,
      COALESCE(SUM(s.sales_qty), 0) as total_sales,
      COALESCE(SUM(c.consumption_qty), 0) as total_consumption,
      SUM(p.purchase_qty) - COALESCE(SUM(s.sales_qty), 0) - COALESCE(SUM(c.consumption_qty), 0) as balance_qty,
      AVG(p.mrp_incl_gst) as mrp_incl_gst,
      AVG(p.gst_percentage) as gst_percentage,
      AVG(p.purchase_taxable_value / NULLIF(p.purchase_qty, 0)) as avg_purchase_cost_per_unit,
      SUM(p.purchase_taxable_value) as total_purchase_value,
      COALESCE(SUM(s.invoice_value_rs), 0) as total_sales_value,
      COALESCE(SUM(c.invoice_value), 0) as total_consumption_value
    FROM
      inventory_purchases p
    LEFT JOIN
      inventory_sales s ON p.product_name = s.product_name
    LEFT JOIN
      inventory_consumption c ON p.product_name = c.product_name
    GROUP BY
      p.product_name, p.hsn_code, p.units;
  `);

  // Create salon consumption view
  await executeSQL(`
    CREATE OR REPLACE VIEW salon_consumption_orders AS
    SELECT 
      o.id,
      o.order_id,
      o.date,
      i.product_name,
      i.quantity,
      o.stylist_name,
      o.status,
      i.total_price as total_amount,
      i.type,
      o.payment_method
    FROM 
      pos_orders o
    JOIN 
      pos_order_items i ON o.order_id = i.order_id
    WHERE 
      o.purchase_type = 'salon_consumption'
    ORDER BY 
      o.date DESC;
  `);

  console.log('Database tables created successfully');
};

// GraphQL query functions
const getInventoryData = async (tableName: string) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching data from ${tableName}:`, error);
    return [];
  }
};

// Function to sync POS data to inventory tables
const syncPOSToInventory = async () => {
  try {
    // Get POS orders with salon consumption type
    const { data: salonOrders, error: ordersError } = await supabase
      .from('pos_orders')
      .select(`
        *,
        items:pos_order_items(*)
      `)
      .eq('purchase_type', 'salon_consumption');

    if (ordersError) throw ordersError;

    // Create a map to group same products within same orders
    const consumptionMap = new Map();

    // Process each salon order for inventory consumption
    for (const order of salonOrders) {
      for (const item of order.items) {
        const key = `${order.order_id}:${item.product_name}`;
        
        if (!consumptionMap.has(key)) {
          consumptionMap.set(key, {
            date: order.date,
            product_name: item.product_name,
            requisition_voucher_no: order.order_id,
            consumption_qty: 0,
            hsn_code: item.hsn_code || '',
            units: item.units || 'pcs',
            // Default values for other required fields
            purchase_cost_per_unit_ex_gst: item.price ? item.price / (1 + (item.gst_percentage || 18) / 100) : 0,
            purchase_gst_percentage: item.gst_percentage || 18,
            taxable_value: 0,
            cgst_rs: 0,
            sgst_rs: 0,
            igst_rs: 0,
            total: 0
          });
        }
        
        // Sum quantities for the same product in the same order
        const record = consumptionMap.get(key);
        const quantity = parseFloat(item.quantity || 1);
        const priceExGst = record.purchase_cost_per_unit_ex_gst;
        
        record.consumption_qty += quantity;
        
        // Recalculate values based on updated quantities
        const taxableValue = priceExGst * record.consumption_qty;
        const totalGst = taxableValue * (record.purchase_gst_percentage / 100);
        
        record.taxable_value = taxableValue;
        record.cgst_rs = totalGst / 2;
        record.sgst_rs = totalGst / 2;
        record.total = taxableValue + totalGst;
      }
    }
    
    // Convert map to array
    const consumptionRecords = Array.from(consumptionMap.values());
    
    // Skip if no new records to insert
    if (consumptionRecords.length === 0) {
      console.log("No new consumption records to process");
      return;
    }
    
    console.log(`Processing ${consumptionRecords.length} consolidated consumption records`);
    
    // Check for existing records to avoid duplicates
    for (const record of consumptionRecords) {
      // Check if already processed
      const { data: existingConsumption, error: checkError } = await supabase
        .from('inventory_consumption')
        .select('consumption_id')
        .eq('requisition_voucher_no', record.requisition_voucher_no)
        .eq('product_name', record.product_name);

      if (checkError) throw checkError;

      // Skip if already processed
      if (existingConsumption && existingConsumption.length > 0) {
        console.log(`Skipping already processed consumption for ${record.product_name}`);
        continue;
      }

      // Insert into inventory_consumption
      const { error: insertError } = await supabase
        .from('inventory_consumption')
        .insert(record);

      if (insertError) throw insertError;
    }

    console.log('POS data synchronized to inventory tables successfully');
  } catch (error) {
    console.error('Error syncing POS data to inventory:', error);
  }
};

// Execute all setup functions
const setupDatabase = async () => {
  try {
    await createInventoryTables();
    await syncPOSToInventory();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
  }
};

// Export the functions
export {
  supabase,
  executeSQL,
  createInventoryTables,
  getInventoryData,
  syncPOSToInventory,
  setupDatabase
};

// Define column headers for the CSV file
const CSV_HEADERS = [
  // Purchases columns
  'Date', 'Product Name', 'HSN Code', 'Units', 'Purchase Invoice Number', 'Purchase Qty',
  'MRP Incl. GST', 'MRP Excl. GST', 'Discount on Purchase Percentage', 'GST Percentage',
  'Purchase Taxable Value', 'Purchase IGST', 'Purchase CGST', 'Purchase SGST', 'Purchase Invoice Value Rs',
  
  // Sales columns
  'Invoice No', 'Sales Qty', 'Purchase Cost Per Unit Ex GST', 'Purchase GST Percentage',
  'Purchase Taxable Value', 'Purchase IGST', 'Purchase CGST', 'Purchase SGST', 'Total Purchase Cost',
  'MRP Incl. GST', 'MRP Excl. GST', 'Discount on Sales Percentage', 'Discounted Sales Rate Excl. GST',
  'Sales GST Percentage', 'Sales Taxable Value', 'IGST Rs', 'CGST Rs', 'SGST Rs', 'Invoice Value Rs',
  
  // Consumption columns
  'Requisition Voucher No', 'Consumption Qty', 'Purchase Cost Per Unit Ex GST', 'Purchase GST Percentage',
  'Purchase Taxable Value', 'Purchase IGST', 'Purchase CGST', 'Purchase SGST', 'Total Purchase Cost',
  'Balance Qty', 'Taxable Value', 'IGST Rs', 'CGST Rs', 'SGST Rs', 'Invoice Value'
];

// Helper functions for CSV formatting
const formatDate = (date: string | undefined): string => {
  if (!date) return '';
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return date;
  }
};

const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '';
  return value.toString();
};

// Generate comprehensive CSV data for inventory
export const generateCsvData = (data: InventoryExportData): string => {
  const { purchases, sales, consumption, balanceStock } = data;
  
  // Create header rows with all columns
  let csvContent = 'Date,Product Name,HSN Code,Units,Transaction Type,Quantity,';
  csvContent += 'Purchase Invoice No,Purchase Price Incl GST,Purchase Price Excl GST,Discount %,';
  csvContent += 'Purchase Cost Per Unit Excl GST,Purchase GST %,Purchase Taxable Value,';
  csvContent += 'Purchase CGST,Purchase SGST,';
  csvContent += 'Sales Invoice No,MRP Incl GST,MRP Excl GST,Sales Discount %,Discounted Sales Rate,';
  csvContent += 'Sales GST %,Sales Taxable Value,Sales IGST,Sales CGST,Sales SGST,Sales Invoice Value,';
  csvContent += 'Requisition Voucher No,Consumption Qty,Consumption Cost Per Unit,Consumption GST %,';
  csvContent += 'Consumption Taxable Value,Consumption CGST,Consumption SGST,Consumption Total Value,';
  csvContent += 'Balance Qty,Taxable Value,CGST,SGST,Invoice Value\n';
  
  // Process purchases
  purchases.forEach(purchase => {
    const row: string[] = [];
    
    // Common product details
    row.push(`"${formatDate(purchase.date)}"`);
    row.push(`"${purchase.product_name || ''}"`);
    row.push(`"${purchase.hsn_code || ''}"`);
    row.push(`"${purchase.units || ''}"`);
    row.push('"PURCHASE"'); // Transaction type
    row.push(formatNumber(purchase.purchase_qty));
    
    // Purchase specific columns
    row.push(`"${purchase.invoice_no || ''}"`);
    row.push(formatNumber(purchase.mrp_incl_gst));
    row.push(formatNumber(purchase.mrp_excl_gst));
    row.push(formatNumber(purchase.discount_on_purchase_percentage));
    row.push(formatNumber(
      (purchase.purchase_taxable_value && purchase.purchase_qty && purchase.purchase_qty > 0)
        ? purchase.purchase_taxable_value / purchase.purchase_qty
        : 0
    )); // Cost per unit
    row.push(formatNumber(purchase.gst_percentage));
    row.push(formatNumber(purchase.purchase_taxable_value));
    row.push(formatNumber(purchase.purchase_cgst));
    row.push(formatNumber(purchase.purchase_sgst));
    
    // Empty cells for sales columns
    for (let i = 0; i < 11; i++) {
      row.push('');
    }
    
    // Empty cells for consumption columns
    for (let i = 0; i < 13; i++) {
      row.push('');
    }
    
    csvContent += row.join(',') + '\n';
  });
  
  // Process sales
  sales.forEach(sale => {
    const row: string[] = [];
    
    // Common product details
    row.push(`"${formatDate(sale.date)}"`);
    row.push(`"${sale.product_name || ''}"`);
    row.push(`"${sale.hsn_code || ''}"`);
    row.push(`"${sale.unit || ''}"`);
    row.push('"SALE"'); // Transaction type
    row.push(formatNumber(sale.qty || sale.quantity));
    
    // Empty cells for purchase columns
    for (let i = 0; i < 9; i++) {
      row.push('');
    }
    
    // Sales specific columns
    row.push(`"${sale.invoice_no || ''}"`);
    row.push(formatNumber(sale.mrp_incl_gst));
    row.push(formatNumber(sale.mrp_excl_gst));
    row.push(formatNumber(sale.discount_percentage));
    row.push(formatNumber(sale.discounted_sales_rate_ex_gst));
    row.push(formatNumber(sale.gst_percentage));
    row.push(formatNumber(sale.taxable_value));
    row.push(formatNumber(sale.igst));
    row.push(formatNumber(sale.cgst));
    row.push(formatNumber(sale.sgst));
    row.push(formatNumber(sale.invoice_value));
    
    // Empty cells for consumption columns
    for (let i = 0; i < 13; i++) {
      row.push('');
    }
    
    csvContent += row.join(',') + '\n';
  });
  
  // Process consumption
  consumption.forEach(item => {
    const row: string[] = [];
    
    // Common product details
    row.push(`"${formatDate(item.date)}"`);
    row.push(`"${item.product_name || ''}"`);
    row.push(`"${item.hsn_code || ''}"`);
    row.push(`"${item.units || ''}"`);
    row.push('"CONSUMPTION"'); // Transaction type
    row.push(formatNumber(item.qty || item.quantity));
    
    // Empty cells for purchase columns
    for (let i = 0; i < 9; i++) {
      row.push('');
    }
    
    // Empty cells for sales columns
    for (let i = 0; i < 11; i++) {
      row.push('');
    }
    
    // Consumption specific columns
    row.push(`"${item.requisition_voucher_no || ''}"`);
    row.push(formatNumber(item.consumption_qty || item.quantity));
    row.push(formatNumber(item.purchase_cost_per_unit_ex_gst));
    row.push(formatNumber(item.purchase_gst_percentage));
    row.push(formatNumber(item.purchase_taxable_value));
    row.push(formatNumber(item.purchase_cgst));
    row.push(formatNumber(item.purchase_sgst));
    row.push(formatNumber(item.total_purchase_cost));
    row.push(formatNumber(item.balance_qty));
    row.push(formatNumber(item.taxable_value));
    row.push(formatNumber(item.cgst));
    row.push(formatNumber(item.sgst));
    row.push(formatNumber(item.total || 0));
    
    csvContent += row.join(',') + '\n';
  });
  
  // Process balance stock as a summary
  balanceStock.forEach(item => {
    const row: string[] = [];
    
    // Include product details
    row.push(`"${formatDate(new Date().toISOString())}"`); // Current date
    row.push(`"${item.product_name || ''}"`);
    row.push(`"${item.hsn_code || ''}"`);
    row.push(`"${item.unit || ''}"`);
    row.push('"BALANCE STOCK"'); // Indicate this is a balance row
    row.push(formatNumber(item.balance_qty));
    
    // Fill other columns with empty values
    for (let i = 0; i < 33; i++) {
      row.push('');
    }
    
    csvContent += row.join(',') + '\n';
  });
  
  return csvContent;
};

/**
 * Convert an array of objects to CSV string
 * @param data Array of objects to convert to CSV
 * @param headers Optional headers for the CSV
 * @returns CSV string
 */
export function objectsToCSV(data: Record<string, any>[], headers?: string[]): string {
  if (!data || data.length === 0) return '';
  
  // Determine headers from the first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create header row
  const headerRow = csvHeaders.join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return csvHeaders.map(header => {
      const value = item[header];
      // Handle different data types appropriately
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
      return value;
    }).join(',');
  });
  
  // Combine header and data rows
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download data as a CSV file
 * @param data Array of objects or InventoryExportData to convert to CSV
 * @param filename Name of the file to download (optional if data is InventoryExportData)
 * @param headers Optional headers for the CSV
 */
export function downloadCsv(
  data: Record<string, any>[] | InventoryExportData, 
  filename?: string, 
  headers?: string[]
): void {
  // Handle InventoryExportData object
  if (!Array.isArray(data) && typeof data === 'object' && 'purchases' in data) {
    // Generate CSV content from inventory data
    const csvContent = generateCsvData(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set filename
    const exportFilename = filename || `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
    
    // Set link properties
    link.setAttribute('href', url);
    link.setAttribute('download', exportFilename);
    link.style.visibility = 'hidden';
    
    // Append to document, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return;
  }
  
  // Handle regular array of records
  if (Array.isArray(data)) {
    if (!filename) {
      console.error('Filename is required when providing array data');
      return;
    }
    
    // Convert data to CSV
    const csvContent = objectsToCSV(data, headers);
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link
    const link = document.createElement('a');
    
    // Support for browsers with download attribute
    if (typeof window !== 'undefined' && window.navigator && 'msSaveBlob' in window.navigator) {
      // IE/Edge support
      (window.navigator as any).msSaveBlob(blob, filename);
    } else {
      // Other browsers
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    }
  }
}

/**
 * Format data for CSV export, handling complex data types
 * @param data Any data that needs formatting for CSV export
 * @returns Formatted data
 */
export function formatForCSV(data: any): string {
  if (data === null || data === undefined) return '';
  
  if (typeof data === 'object' && !(data instanceof Date)) {
    return JSON.stringify(data).replace(/"/g, '""');
  }
  
  if (data instanceof Date) {
    return data.toISOString();
  }
  
  return String(data);
} 
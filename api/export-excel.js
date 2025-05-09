import { supabase } from './_supabase.js';
import ExcelJS from 'exceljs';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch raw tables and views exactly
    const [
      productsResponse,
      purchasesResponse,
      salesResponse,
      consumptionResponse,
      stockHistoryResponse
    ] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('purchases').select('*'),
      supabase.from('sales_product_new').select('*'),
      supabase.from('salon_consumption_products').select('*'),
      supabase.from('stock_history').select('*')
    ]);

    // Handle errors
    if (productsResponse.error) throw productsResponse.error;
    if (purchasesResponse.error) throw purchasesResponse.error;
    if (salesResponse.error) throw salesResponse.error;
    if (consumptionResponse.error) throw consumptionResponse.error;
    if (stockHistoryResponse.error) throw stockHistoryResponse.error;

    // Extract data arrays
    const products = productsResponse.data || [];
    const purchases = purchasesResponse.data || [];
    const sales = salesResponse.data || [];
    const consumption = consumptionResponse.data || [];
    const stockHistory = stockHistoryResponse.data || [];

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'R&G Salon';
    workbook.lastModifiedBy = 'R&G Salon';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Helper to add JSON data to a sheet matching keys exactly
    function addJsonSheet(sheetName, data: any[]) {
      const sheet = workbook.addWorksheet(sheetName);
      if (data.length > 0) {
        const columns = Object.keys(data[0]).map(key => ({ header: key, key }));
        sheet.columns = columns;
        sheet.addRows(data);
      }
    }

    // Add each table/view as its own sheet
    addJsonSheet('Products', products);
    addJsonSheet('Purchases', purchases);
    addJsonSheet('Sales History', sales);
    addJsonSheet('Salon Consumption', consumption);
    addJsonSheet('Stock History', stockHistory);

    // Generate the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=RG_Salon_Inventory_Report.xlsx');
    
    // Send the file
    res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error('Error exporting Excel:', error);
    res.status(500).json({ error: error.message });
  }
} 
const XLSX = require('xlsx');
const fs = require('fs');

/**
 * Test script to demonstrate Excel aggregation logic
 * This script shows how the frontend will process your Excel file
 */

// Example data structure that your Excel should have
const sampleExcelData = [
  {
    'Invoice No': 'INV001',
    'Guest Name': 'John Doe',
    'Date': '2025-01-01',
    'Service': 'Hair Cut',
    'Staff': 'Stylist A',
    'Category': 'Hair',
    'Qty': 1,
    'Unit Price': 500,
    'Discount': 0,
    'Tax %': 18,
    'Payment Mode': 'Cash'
  },
  {
    'Invoice No': 'INV001', // Same invoice - will be aggregated
    'Guest Name': 'John Doe',
    'Date': '2025-01-01',
    'Service': 'Beard Trim',
    'Staff': 'Stylist A',
    'Category': 'Hair',
    'Qty': 1,
    'Unit Price': 200,
    'Discount': 0,
    'Tax %': 18,
    'Payment Mode': 'Cash'
  },
  {
    'Invoice No': 'INV002',
    'Guest Name': 'Jane Smith',
    'Date': '2025-01-01',
    'Service': 'Hair Color',
    'Staff': 'Stylist B',
    'Category': 'Hair',
    'Qty': 1,
    'Unit Price': 1500,
    'Discount': 100,
    'Tax %': 18,
    'Payment Mode': 'Card'
  }
];

/**
 * Aggregation logic (same as in the frontend component)
 */
function aggregateByInvoice(data) {
  const groupedData = new Map();
  
  // Group by invoice number
  data.forEach((row, index) => {
    const invoiceNo = row['Invoice No'] || `AUTO-${index + 1}`;
    
    if (!groupedData.has(invoiceNo)) {
      groupedData.set(invoiceNo, []);
    }
    groupedData.get(invoiceNo).push(row);
  });
  
  // Aggregate each group
  const aggregatedOrders = [];
  
  for (const [invoiceNo, rows] of groupedData) {
    const firstRow = rows[0];
    
    // Common order info
    const clientName = firstRow['Guest Name'] || 'Unknown Client';
    const clientPhone = firstRow['Guest Number'] || '';
    const date = firstRow['Date'] || new Date().toISOString().split('T')[0];
    
    // Aggregate services
    const services = [];
    let totalSubtotal = 0;
    let totalDiscount = 0;
    let totalTaxAmount = 0;
    let totalAmount = 0;
    
    rows.forEach(row => {
      const serviceName = row['Service'] || 'Unknown Service';
      const category = row['Category'] || 'General';
      const stylist = row['Staff'] || 'Admin';
      const quantity = parseInt(row['Qty'] || '1') || 1;
      const unitPrice = parseFloat(row['Unit Price'] || '0') || 0;
      const discount = parseFloat(row['Discount'] || '0') || 0;
      const taxPercent = parseFloat(row['Tax %'] || '18') || 18;
      
      // Calculate line totals
      const subtotal = unitPrice * quantity;
      const netAmount = subtotal - discount;
      const taxAmount = (netAmount * taxPercent) / 100;
      const lineTotal = netAmount + taxAmount;
      
      services.push({
        name: serviceName,
        category,
        stylist,
        quantity,
        unitPrice,
        discount,
        taxPercent,
        subtotal,
        netAmount,
        taxAmount,
        totalAmount: lineTotal
      });
      
      totalSubtotal += subtotal;
      totalDiscount += discount;
      totalTaxAmount += taxAmount;
      totalAmount += lineTotal;
    });
    
    // Payment info
    const paymentMode = firstRow['Payment Mode'] || 'cash';
    const payments = [{
      method: paymentMode.toLowerCase().replace(' ', '_'),
      amount: totalAmount
    }];
    
    aggregatedOrders.push({
      invoiceNo,
      clientName,
      clientPhone,
      date,
      services,
      payments,
      totals: {
        subtotal: totalSubtotal,
        discount: totalDiscount,
        netAmount: totalSubtotal - totalDiscount,
        taxAmount: totalTaxAmount,
        totalAmount
      }
    });
  }
  
  return aggregatedOrders;
}

// Test the aggregation
console.log('='.repeat(60));
console.log('EXCEL AGGREGATION TEST');
console.log('='.repeat(60));

console.log('\n📊 Sample Excel Data:');
console.table(sampleExcelData);

const aggregated = aggregateByInvoice(sampleExcelData);

console.log('\n📈 Aggregated Orders:');
aggregated.forEach((order, index) => {
  console.log(`\n${index + 1}. Invoice: ${order.invoiceNo}`);
  console.log(`   Client: ${order.clientName}`);
  console.log(`   Date: ${order.date}`);
  console.log(`   Services: ${order.services.length}`);
  order.services.forEach((service, i) => {
    console.log(`     ${i + 1}. ${service.name} - ₹${service.totalAmount.toFixed(2)}`);
  });
  console.log(`   Total: ₹${order.totals.totalAmount.toFixed(2)}`);
});

console.log('\n' + '='.repeat(60));
console.log('SUMMARY');
console.log('='.repeat(60));
console.log(`Original rows: ${sampleExcelData.length}`);
console.log(`Aggregated orders: ${aggregated.length}`);
console.log(`Rows saved: ${sampleExcelData.length - aggregated.length}`);

// Create sample Excel file for testing
const sampleWorkbook = XLSX.utils.book_new();
const sampleWorksheet = XLSX.utils.json_to_sheet(sampleExcelData);
XLSX.utils.book_append_sheet(sampleWorkbook, sampleWorksheet, 'Services');

// Save sample file
XLSX.writeFile(sampleWorkbook, 'sample_services_for_aggregation.xlsx');
console.log('\n✅ Sample Excel file created: sample_services_for_aggregation.xlsx');
console.log('Use this file to test the frontend aggregation feature!');

module.exports = { aggregateByInvoice }; 
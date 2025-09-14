import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface DownloadData {
  title: string;
  data: any[];
  chartElement?: HTMLElement | null;
  type:
    | 'staff-revenue'
    | 'sales-trend'
    | 'payment-methods'
    | 'customer-analytics'
    | 'inventory'
    | 'appointments';
}

export const downloadExcel = async (downloadData: DownloadData) => {
  const { title, data, type } = downloadData;

  console.log(
    'Excel Download - Title:',
    title,
    'Type:',
    type,
    'Data length:',
    data.length
  );

  if (!data || data.length === 0) {
    throw new Error('No data available for Excel download');
  }

  // Format data based on type
  let formattedData: any[] = [];

  try {
    switch (type) {
      case 'staff-revenue':
        formattedData = data.map((item: any) => ({
          'Staff Name': item.stylistName || item.name || 'Unknown',
          'Revenue (₹)': item.revenue || 0,
          Appointments: item.appointmentCount || 0,
          Services: item.serviceCount || 0,
          Efficiency: item.efficiency || 0,
          'Revenue per Hour': Math.round((item.revenue || 0) / 8), // Assuming 8-hour workday
          'Performance Score': item.performanceScore || 0,
          'Performance Rating': item.performanceRating || 'Average',
          'Incentive Eligible': item.incentiveEligible ? 'Yes' : 'No',
          'Suggested Incentive (₹)': item.suggestedIncentive || 0,
          'Industry Standard Met': item.industryStandardMet ? 'Yes' : 'No',
        }));
        break;

      case 'sales-trend':
        formattedData = data.map((item: any) => ({
          Date: item.date || 'Unknown',
          'Sales (₹)': item.sales || 0,
          'Day of Week': item.date
            ? new Date(item.date).toLocaleDateString('en-US', {
                weekday: 'long',
              })
            : 'Unknown',
          Month: item.date
            ? new Date(item.date).toLocaleDateString('en-US', { month: 'long' })
            : 'Unknown',
          'Growth %': item.growth || 0,
        }));
        break;

      case 'payment-methods':
        formattedData = data.map((item: any) => ({
          'Payment Method': item.paymentMethod || 'Unknown',
          'Amount (₹)': item.amount || 0,
          Count: item.count || 0,
          Percentage: `${(item.percentage || 0).toFixed(2)}%`,
          'Average Transaction': Math.round(
            (item.amount || 0) / Math.max(item.count || 1, 1)
          ),
          'Is Split Payment': item.isSplit ? 'Yes' : 'No',
        }));
        break;

      case 'customer-analytics':
        formattedData = data.map((item: any) => ({
          'Customer Name': item.customerName || item.name || 'Unknown',
          'Total Spent (₹)': item.totalSpent || 0,
          'Visit Count': item.visitCount || 0,
          'Last Visit': item.lastVisit || 'Unknown',
          'Average Spend per Visit': Math.round(
            (item.totalSpent || 0) / Math.max(item.visitCount || 1, 1)
          ),
          'Customer Tier':
            (item.totalSpent || 0) > 10000
              ? 'VIP'
              : (item.totalSpent || 0) > 5000
                ? 'Premium'
                : 'Standard',
          'Loyalty Status':
            (item.visitCount || 0) > 10
              ? 'Loyal'
              : (item.visitCount || 0) > 5
                ? 'Regular'
                : 'New',
        }));
        break;

      case 'inventory':
        formattedData = data.map((item: any) => ({
          'Product Name': item.productName || 'Unknown',
          'Current Stock': item.currentStock || 0,
          'Reorder Level': item.reorderLevel || 0,
          Status: item.status || 'Unknown',
          'Value (₹)': item.value || 0,
          'Last Restocked': item.lastRestocked || 'N/A',
          Supplier: item.supplier || 'N/A',
          'Action Required':
            (item.currentStock || 0) <= (item.reorderLevel || 0)
              ? 'REORDER NOW'
              : 'OK',
        }));
        break;

      case 'appointments':
        formattedData = data.map((item: any) => ({
          'Client Name': item.clientName || 'Unknown',
          Service: item.serviceName || 'Unknown',
          Stylist: item.stylistName || 'Unknown',
          'Date & Time': item.appointmentTime
            ? new Date(item.appointmentTime).toLocaleString()
            : 'Unknown',
          'Duration (mins)': item.duration || 0,
          'Price (₹)': item.price || 0,
          Status: item.status || 'Unknown',
          'Time Until': item.timeUntilAppointment || 'Unknown',
          Priority: item.isToday ? 'High' : item.isTomorrow ? 'Medium' : 'Low',
        }));
        break;

      default:
        console.log('Using raw data for Excel export');
        formattedData = data;
    }

    console.log('Excel formatted data length:', formattedData.length);

    if (formattedData.length === 0) {
      throw new Error('No formatted data available for Excel export');
    }

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formattedData);

    // Add metadata
    const metadata = [
      ['Report Type:', title],
      ['Generated On:', new Date().toLocaleString()],
      ['Total Records:', formattedData.length],
      [''], // Empty row
    ];

    // Insert metadata at the beginning
    XLSX.utils.sheet_add_aoa(ws, metadata, { origin: 'A1' });
    XLSX.utils.sheet_add_json(ws, formattedData, {
      origin: 'A6',
      skipHeader: false,
    });

    // Auto-size columns
    const colWidths = Object.keys(formattedData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15),
    }));
    ws['!cols'] = colWidths;

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31)); // Excel sheet name limit

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.xlsx`;

    console.log('Excel Download filename:', filename);

    // Download
    XLSX.writeFile(wb, filename);

    console.log('Excel Download completed');
  } catch (error) {
    console.error('Error in Excel download formatting:', error);
    throw error;
  }
};

export const downloadCSV = async (downloadData: DownloadData) => {
  const { title, data } = downloadData;

  console.log('CSV Download - Title:', title, 'Data length:', data.length);

  if (!data || data.length === 0) {
    throw new Error('No data available for CSV download');
  }

  // Convert to CSV format
  const headers = Object.keys(data[0]);
  console.log('CSV Headers:', headers);

  const csvContent = [
    // Header
    headers.join(','),
    // Data rows
    ...data.map(row =>
      Object.values(row)
        .map(val => `"${val}"`)
        .join(',')
    ),
  ].join('\n');

  console.log('CSV Content (first 200 chars):', csvContent.substring(0, 200));

  // Create and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.csv`;

  console.log('CSV Download filename:', filename);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
  console.log('CSV Download completed');
};

export const downloadPNG = async (downloadData: DownloadData) => {
  const { title, chartElement } = downloadData;

  if (!chartElement) {
    console.error('Chart element not found for PNG download');
    return;
  }

  try {
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      logging: false,
    });

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];

    link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.png`;
    link.href = canvas.toDataURL();
    link.click();
  } catch (error) {
    console.error('Error generating PNG:', error);
  }
};

export const downloadPDF = async (downloadData: DownloadData) => {
  const { title, data, chartElement } = downloadData;

  const pdf = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Add header
  pdf.setFontSize(18);
  pdf.text(title, 20, 20);

  pdf.setFontSize(10);
  pdf.text(`Generated on: ${timestamp}`, 20, 30);
  pdf.text(`Total Records: ${data.length}`, 20, 35);

  let yPosition = 50;

  // Add chart if available
  if (chartElement) {
    try {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 1,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 20;
    } catch (error) {
      console.error('Error adding chart to PDF:', error);
    }
  }

  // Add data table
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    const tableData = data.map(row => Object.values(row));

    // Simple table implementation
    pdf.setFontSize(8);
    let x = 20;
    let cellWidth = 170 / headers.length;

    // Headers
    headers.forEach((header, index) => {
      pdf.text(String(header), x + index * cellWidth, yPosition);
    });

    yPosition += 10;

    // Data rows (limit to fit on page)
    const maxRows = Math.floor((280 - yPosition) / 8);
    tableData.slice(0, maxRows).forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        const cellText = String(cell).substring(0, 15); // Truncate long text
        pdf.text(cellText, x + cellIndex * cellWidth, yPosition + rowIndex * 8);
      });
    });

    if (data.length > maxRows) {
      pdf.text(
        `... and ${data.length - maxRows} more records`,
        20,
        yPosition + maxRows * 8 + 10
      );
    }
  }

  // Download
  const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};

export const downloadData = async (
  format: 'excel' | 'csv' | 'png' | 'pdf',
  downloadData: DownloadData
) => {
  try {
    console.log(`Starting download: ${format}`, downloadData);

    // Validate input data
    if (!downloadData.data || downloadData.data.length === 0) {
      throw new Error('No data available for download');
    }

    switch (format) {
      case 'excel':
        console.log('Calling downloadExcel...');
        await downloadExcel(downloadData);
        break;
      case 'csv':
        console.log('Calling downloadCSV...');
        await downloadCSV(downloadData);
        break;
      case 'png':
        console.log('Calling downloadPNG...');
        await downloadPNG(downloadData);
        break;
      case 'pdf':
        console.log('Calling downloadPDF...');
        await downloadPDF(downloadData);
        break;
      default:
        console.error('Unsupported download format:', format);
        throw new Error(`Unsupported download format: ${format}`);
    }

    console.log(`Download completed successfully: ${format}`);
  } catch (error) {
    console.error(`Error downloading ${format}:`, error);
    throw error;
  }
};

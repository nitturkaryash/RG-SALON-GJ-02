import * as XLSX from 'xlsx';

export interface ExcelAnalysis {
  fileName: string;
  sheets: string[];
  columns: string[];
  sampleData: any[];
  totalRows: number;
  invoiceNumbers: string[];
  duplicateInvoices: { [key: string]: number };
}

/**
 * Analyzes an Excel file to understand its structure and identify potential issues
 */
export async function analyzeExcelFile(file: File): Promise<ExcelAnalysis> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('Failed to read file');
        }

        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          dateNF: 'yyyy-mm-dd',
        });

        if (jsonData.length === 0) {
          resolve({
            fileName: file.name,
            sheets: workbook.SheetNames,
            columns: [],
            sampleData: [],
            totalRows: 0,
            invoiceNumbers: [],
            duplicateInvoices: {},
          });
          return;
        }

        // Get columns from first row
        const columns = Object.keys(jsonData[0]);

        // Extract invoice numbers and find duplicates
        const invoiceNumbers: string[] = [];
        const invoiceCounts: { [key: string]: number } = {};

        jsonData.forEach((row: any, index) => {
          const invoiceNo =
            row['Invoice No'] ||
            row['Invoice Number'] ||
            row['invoice_no'] ||
            row['INVOICE NO'] ||
            `AUTO-${index + 1}`;

          invoiceNumbers.push(invoiceNo);
          invoiceCounts[invoiceNo] = (invoiceCounts[invoiceNo] || 0) + 1;
        });

        // Find duplicates
        const duplicateInvoices: { [key: string]: number } = {};
        Object.entries(invoiceCounts).forEach(([invoice, count]) => {
          if (count > 1) {
            duplicateInvoices[invoice] = count;
          }
        });

        resolve({
          fileName: file.name,
          sheets: workbook.SheetNames,
          columns,
          sampleData: jsonData.slice(0, 5), // First 5 rows as sample
          totalRows: jsonData.length,
          invoiceNumbers: [...new Set(invoiceNumbers)], // Unique invoice numbers
          duplicateInvoices,
        });
      } catch (error) {
        reject(new Error(`Error analyzing file: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Logs detailed analysis of Excel file to console for debugging
 */
export function logExcelAnalysis(analysis: ExcelAnalysis) {
  console.group(`📊 Excel Analysis: ${analysis.fileName}`);

  console.log('📄 Sheets:', analysis.sheets);
  console.log('📋 Columns:', analysis.columns);
  console.log('📈 Total Rows:', analysis.totalRows);
  console.log('🔢 Unique Invoices:', analysis.invoiceNumbers.length);

  if (Object.keys(analysis.duplicateInvoices).length > 0) {
    console.log('🔄 Duplicate Invoices (these will be aggregated):');
    Object.entries(analysis.duplicateInvoices).forEach(([invoice, count]) => {
      console.log(`  • ${invoice}: ${count} entries`);
    });
  } else {
    console.log('✅ No duplicate invoices found');
  }

  console.log('📝 Sample Data (first 5 rows):');
  console.table(analysis.sampleData);

  console.groupEnd();
}

/**
 * Helper function to check if Excel file has expected columns for orders
 */
export function validateOrdersExcelStructure(analysis: ExcelAnalysis): {
  isValid: boolean;
  missingColumns: string[];
  suggestions: string[];
} {
  const requiredColumns = [
    'Invoice No',
    'Guest Name',
    'Date',
    'Service',
    'Unit Price',
  ];
  const alternativeColumns = {
    'Invoice No': ['Invoice Number', 'invoice_no', 'INVOICE NO'],
    'Guest Name': ['Client Name', 'client_name', 'Customer Name'],
    Service: ['PRODUCT NAME', 'service_name', 'Product'],
    'Unit Price': ['Price', 'unit_price', 'Rate'],
  };

  const availableColumns = analysis.columns.map(col => col.toLowerCase());
  const missingColumns: string[] = [];
  const suggestions: string[] = [];

  requiredColumns.forEach(required => {
    const hasColumn = analysis.columns.some(
      col => col === required || alternativeColumns[required]?.includes(col)
    );

    if (!hasColumn) {
      missingColumns.push(required);

      // Find similar columns
      const similar = analysis.columns.filter(col =>
        col.toLowerCase().includes(required.toLowerCase().split(' ')[0])
      );

      if (similar.length > 0) {
        suggestions.push(`"${required}" might be "${similar[0]}"`);
      }
    }
  });

  return {
    isValid: missingColumns.length === 0,
    missingColumns,
    suggestions,
  };
}

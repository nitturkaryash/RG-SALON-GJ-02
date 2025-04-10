import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Button,
  Typography,
  styled
} from '@mui/material';
import { Refresh as RefreshIcon, Download as DownloadIcon } from '@mui/icons-material';
import { supabase } from '../../utils/supabase/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

// Define the type for sales history items
interface SalesItem {
  serial_no: string;
  order_id: string;
  date: string;
  product_name: string;
  quantity: string;
  unit_price_ex_gst: string;
  gst_percentage: string;
  taxable_value: string;
  cgst_amount: string;
  sgst_amount: string;
  total_purchase_cost: string;
  discount: string;
  tax: string;
  payment_amount: string;
  payment_method: string;
  payment_date: string;
}

// Create styled table cell
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.common.white,
}));

// Sample data for fallback
const SAMPLE_DATA: SalesItem[] = [
  {
    serial_no: 'SALES-01',
    order_id: '9825edc8-0943-4f49-a0e2-2b0534d9d105',
    date: '2025-04-09',
    product_name: 'facemask',
    quantity: '1',
    unit_price_ex_gst: '590',
    gst_percentage: '18',
    taxable_value: '590.00',
    cgst_amount: '53.10',
    sgst_amount: '53.10',
    total_purchase_cost: '696.20',
    discount: '0',
    tax: '160',
    payment_amount: '1050',
    payment_method: 'cash',
    payment_date: '2025-04-09 12:34:23.581'
  },
  {
    serial_no: 'SALES-02',
    order_id: '66bc3fd4-78f2-4a73-8514-b605f078e845',
    date: '2025-04-09',
    product_name: 'hair fall control shampoo',
    quantity: '1',
    unit_price_ex_gst: '5310',
    gst_percentage: '18',
    taxable_value: '5310.00',
    cgst_amount: '477.90',
    sgst_amount: '477.90',
    total_purchase_cost: '6265.80',
    discount: '0',
    tax: '1912',
    payment_amount: '12532',
    payment_method: 'cash',
    payment_date: '2025-04-09 12:34:57.902'
  }
];

// Constants
const SALES_PRODUCTS_VIEW = 'sales_products';

// Function to initialize sales products table
async function initializeSalesProductsTable(): Promise<boolean> {
  console.log('Checking if sales_products table exists...');
  
  try {
    // First, check if the table exists
    const { data, error } = await supabase
      .from('sales_products')
      .select('serial_no')
      .limit(1);
    
    if (error && error.code === '42P01') { // Table does not exist error
      console.log('Sales products table does not exist. Creating it...');
      toast('Setting up Sales History table...');
      
      // Insert sample data to create the table
      const sampleData = [
        {
          serial_no: 'SALES-01',
          order_id: '9825edc8-0943-4f49-a0e2-2b0534d9d105',
          date: '2025-04-09',
          product_name: 'facemask',
          quantity: '1',
          unit_price_ex_gst: '590',
          gst_percentage: '18',
          taxable_value: '590.00',
          cgst_amount: '53.10',
          sgst_amount: '53.10',
          total_purchase_cost: '696.20',
          discount: '0',
          tax: '160',
          payment_amount: '1050',
          payment_method: 'cash',
          payment_date: '2025-04-09 12:34:23.581'
        },
        {
          serial_no: 'SALES-02',
          order_id: '66bc3fd4-78f2-4a73-8514-b605f078e845',
          date: '2025-04-09',
          product_name: 'hair fall control shampoo',
          quantity: '1',
          unit_price_ex_gst: '5310',
          gst_percentage: '18',
          taxable_value: '5310.00',
          cgst_amount: '477.90',
          sgst_amount: '477.90',
          total_purchase_cost: '6265.80',
          discount: '0',
          tax: '1912',
          payment_amount: '12532',
          payment_method: 'cash',
          payment_date: '2025-04-09 12:34:57.902'
        },
        {
          serial_no: 'SALES-03',
          order_id: '66bc3fd4-78f2-4a73-8514-b605f078e845',
          date: '2025-04-09',
          product_name: 'hair fall control shampoo',
          quantity: '1',
          unit_price_ex_gst: '5310',
          gst_percentage: '18',
          taxable_value: '5310.00',
          cgst_amount: '477.90',
          sgst_amount: '477.90',
          total_purchase_cost: '6265.80',
          discount: '0',
          tax: '1912',
          payment_amount: '12532',
          payment_method: 'cash',
          payment_date: '2025-04-09 12:34:57.902'
        }
      ];
      
      // Try to insert - this should create the table automatically
      const { error: insertError } = await supabase
        .from('sales_products')
        .insert(sampleData);
      
      if (insertError) {
        console.error('Error creating sales_products table through insert:', insertError);
        toast.error('Failed to setup Sales History table');
        return false;
      }
      
      console.log('Sales products table created and sample data inserted successfully');
      toast.success('Sales History table setup complete');
      return true;
    } else if (error) {
      console.error('Error checking for sales_products table:', error);
      return false;
    } else {
      console.log('Sales products table already exists');
      return true;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Unexpected error in initializeSalesProductsTable: ${errorMessage}`, error);
    toast.error(`Error setting up Sales History table: ${errorMessage}`);
    return false;
  }
}

// Function to fetch all sales products data from database
async function fetchSalesProducts(): Promise<SalesItem[]> {
  try {
    console.debug(`Fetching data from ${SALES_PRODUCTS_VIEW} table...`);

    // Fetch the actual data from the table
    const { data, error } = await supabase.from(SALES_PRODUCTS_VIEW).select(`
      serial_no,
      order_id,
      date,
      product_name,
      quantity,
      unit_price_ex_gst,
      gst_percentage,
      taxable_value,
      cgst_amount,
      sgst_amount,
      total_purchase_cost,
      discount,
      tax,
      payment_amount,
      payment_method,
      payment_date
    `);

    // Check for fetch error
    if (error) {
      if (error.code === '42P01') {
        console.warn(`The ${SALES_PRODUCTS_VIEW} table does not exist in the database. Using sample data.`);
        toast(`Sales data table not set up yet. Using sample data.`);
        return SAMPLE_DATA;
      } else {
        console.error(`Error fetching data from ${SALES_PRODUCTS_VIEW}:`, error);
        toast.error(`Failed to load sales data: ${error.message || 'Unknown error'}`);
        return SAMPLE_DATA;
      }
    }

    // Check if data exists
    if (!data || data.length === 0) {
      console.warn(`No data found in ${SALES_PRODUCTS_VIEW} view. Using sample data.`);
      toast('No sales data found. Displaying sample data.');
      return SAMPLE_DATA;
    }

    // Log first row and count for debugging
    console.debug(`Successfully fetched ${data.length} sales records.`);
    if (data.length > 0) {
      console.debug("First row of sales data:", JSON.stringify(data[0], null, 2));
    }

    return data as SalesItem[];
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    console.error(`Unexpected error in fetchSalesProducts: ${errorMessage}`, e);
    toast.error(`Error loading sales data: ${errorMessage}`);
    return SAMPLE_DATA;
  }
}

const SalesHistoryTab = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  // Initialize the sales table when component loads
  useEffect(() => {
    // This will create the table if it doesn't exist
    initializeSalesProductsTable().then(success => {
      if (success) {
        console.log('Sales table initialization complete');
      }
    });
  }, []);

  // Use React Query to fetch data
  const { data: salesData, isLoading, error, refetch } = useQuery({
    queryKey: ['salesHistory'],
    queryFn: fetchSalesProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = async () => {
    if (!salesData || salesData.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      setIsExporting(true);
      
      // Create worksheet from json data
      const worksheet = XLSX.utils.json_to_sheet(salesData);
      
      // Create workbook and add the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Data");
      
      // Generate xlsx file
      XLSX.writeFile(workbook, `sales_history_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Sales history exported successfully');
    } catch (error) {
      console.error("Error exporting sales data:", error);
      toast.error(`Error exporting data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Format date for better display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Sales History</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
            onClick={handleExport}
            disabled={isExporting || !salesData || salesData.length === 0 || isLoading}
          >
            Export (.xlsx)
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading sales data: {String(error)}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
          <Table stickyHeader aria-label="sales history table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Serial No</StyledTableCell>
                <StyledTableCell>Date</StyledTableCell>
                <StyledTableCell>Order ID</StyledTableCell>
                <StyledTableCell>Product Name</StyledTableCell>
                <StyledTableCell align="right">Quantity</StyledTableCell>
                <StyledTableCell align="right">Unit Price (Ex. GST)</StyledTableCell>
                <StyledTableCell align="right">GST %</StyledTableCell>
                <StyledTableCell align="right">Taxable Value</StyledTableCell>
                <StyledTableCell align="right">CGST Amount</StyledTableCell>
                <StyledTableCell align="right">SGST Amount</StyledTableCell>
                <StyledTableCell align="right">Total Cost</StyledTableCell>
                <StyledTableCell align="right">Discount</StyledTableCell>
                <StyledTableCell align="right">Tax</StyledTableCell>
                <StyledTableCell align="right">Payment Amount</StyledTableCell>
                <StyledTableCell>Payment Method</StyledTableCell>
                <StyledTableCell>Payment Date</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={16} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : salesData && salesData.length > 0 ? (
                salesData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((sale, index) => (
                    <TableRow key={`${sale.order_id}-${index}`} hover>
                      <TableCell>{sale.serial_no}</TableCell>
                      <TableCell>{formatDate(sale.date)}</TableCell>
                      <TableCell>{sale.order_id}</TableCell>
                      <TableCell>{sale.product_name}</TableCell>
                      <TableCell align="right">{sale.quantity}</TableCell>
                      <TableCell align="right">₹{parseFloat(sale.unit_price_ex_gst).toFixed(2)}</TableCell>
                      <TableCell align="right">{sale.gst_percentage}%</TableCell>
                      <TableCell align="right">₹{parseFloat(sale.taxable_value).toFixed(2)}</TableCell>
                      <TableCell align="right">₹{parseFloat(sale.cgst_amount).toFixed(2)}</TableCell>
                      <TableCell align="right">₹{parseFloat(sale.sgst_amount).toFixed(2)}</TableCell>
                      <TableCell align="right">₹{parseFloat(sale.total_purchase_cost).toFixed(2)}</TableCell>
                      <TableCell align="right">₹{parseFloat(sale.discount).toFixed(2)}</TableCell>
                      <TableCell align="right">₹{parseFloat(sale.tax).toFixed(2)}</TableCell>
                      <TableCell align="right">₹{parseFloat(sale.payment_amount).toFixed(2)}</TableCell>
                      <TableCell>{sale.payment_method}</TableCell>
                      <TableCell>{formatDate(sale.payment_date)}</TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={16} align="center" sx={{ py: 3 }}>
                    No sales history found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={salesData?.length || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default SalesHistoryTab; 
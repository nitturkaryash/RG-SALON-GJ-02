import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  TablePagination,
  CircularProgress,
  Alert,
  TableFooter,
  IconButton,
  useTheme
} from '@mui/material';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase/supabaseClient';
import { format } from 'date-fns';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';

// Define the view name as a constant for easy updating
const SALES_PRODUCTS_VIEW = 'sales_products';

// Define type for sales data
type SalesItem = {
  serial_no: string;
  id: string;
  order_id: string;
  date: string;
  product_id: string;
  product_name: string;
  quantity: string;
  unit_price_ex_gst: string;
  gst_percentage: string;
  taxable_value: string;
  cgst_amount: string;
  sgst_amount: string;
  total_purchase_cost: string;
  payment_method: string;
  payment_date: string;
  invoice_number: string;
};

// Sample data for testing when database is unavailable
const SAMPLE_DATA: SalesItem[] = [
  {
    serial_no: 'SALES-01',
    id: '1',
    order_id: '9825edc8-0943-4f49-a0e2-2b0534d9d105',
    date: '2025-04-09',
    product_id: 'P001',
    product_name: 'facemask',
    quantity: '1',
    unit_price_ex_gst: '590',
    gst_percentage: '18',
    taxable_value: '590.00',
    cgst_amount: '53.10',
    sgst_amount: '53.10',
    total_purchase_cost: '696.20',
    payment_method: 'cash',
    payment_date: '2025-04-09 12:34:23.581',
    invoice_number: 'INV-001'
  },
  {
    serial_no: 'SALES-02',
    id: '2',
    order_id: '66bc3fd4-78f2-4a73-8514-b605f078e845',
    date: '2025-04-09',
    product_id: 'P002',
    product_name: 'hair fall control shampoo',
    quantity: '1',
    unit_price_ex_gst: '5310',
    gst_percentage: '18',
    taxable_value: '5310.00',
    cgst_amount: '477.90',
    sgst_amount: '477.90',
    total_purchase_cost: '6265.80',
    payment_method: 'cash',
    payment_date: '2025-04-09 12:34:57.902',
    invoice_number: 'INV-002'
  }
];

// Format date function
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

// TablePaginationActions component for custom pagination
interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

// Function to fetch all sales products data from database
async function salesProductsQuery(): Promise<SalesItem[]> {
  try {
    console.debug(`Fetching data from ${SALES_PRODUCTS_VIEW} view...`);
    
    // First check if the view exists
    const { data: viewCheck, error: viewError } = await supabase
      .from('information_schema.views')
      .select('table_name')
      .eq('table_name', SALES_PRODUCTS_VIEW)
      .single();
      
    if (viewError) {
      console.error(`Error checking if ${SALES_PRODUCTS_VIEW} view exists:`, viewError);
      toast.error(`Database error: Unable to verify sales view. Using sample data.`);
      return SAMPLE_DATA;
    }
    
    if (!viewCheck) {
      console.warn(`The ${SALES_PRODUCTS_VIEW} view does not exist in the database. Using sample data.`);
      toast.warning(`Sales data view not set up yet. Using sample data.`);
      return SAMPLE_DATA;
    }
    
    // Fetch the actual data from the view
    const { data, error } = await supabase.from(SALES_PRODUCTS_VIEW).select(`
      id,
      order_id,
      date,
      product_id,
      product_name,
      quantity,
      unit_price_ex_gst,
      gst_percentage,
      taxable_value,
      cgst_amount,
      sgst_amount,
      total_purchase_cost,
      payment_method,
      payment_date,
      invoice_number
    `);

    // Check for fetch error
    if (error) {
      console.error(`Error fetching data from ${SALES_PRODUCTS_VIEW}:`, error);
      toast.error(`Failed to load sales data: ${error.message || 'Unknown error'}`);
      return SAMPLE_DATA;
    }

    // Check if data exists
    if (!data || data.length === 0) {
      console.warn(`No data found in ${SALES_PRODUCTS_VIEW} view. Using sample data.`);
      toast.info('No sales data found. Displaying sample data.');
      return SAMPLE_DATA;
    }

    // Log first row and count for debugging
    console.debug(`Successfully fetched ${data.length} sales records.`);
    if (data.length > 0) {
      console.debug("First row of sales data:", JSON.stringify(data[0], null, 2));
    }

    // Add serial numbers to data
    return data.map((item: any, index: number) => ({
      ...item,
      serial_no: (index + 1).toString()
    })) as SalesItem[];
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    console.error(`Unexpected error in salesProductsQuery: ${errorMessage}`, e);
    toast.error(`Error loading sales data: ${errorMessage}`);
    return SAMPLE_DATA;
  }
}

const SalesTab = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState<string | null>(null);

  // Sales products query
  const { 
    data: salesData = SAMPLE_DATA, 
    isLoading, 
    refetch,
    error: queryError
  } = useQuery<SalesItem[]>({
    queryKey: ['sales_products'],
    queryFn: salesProductsQuery,
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = rowsPerPage - (salesData.length - page * rowsPerPage);

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* Header with title and buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4B5563' }}>
          Sales History
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Refresh button */}
          <button
            onClick={() => refetch()}
            style={{ 
              backgroundColor: 'white', 
              color: '#8AB73A',
              border: '1px solid #8AB73A',
              borderRadius: '20px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <span style={{ fontSize: '18px' }}>↻</span>
            Refresh
          </button>
          
          {/* Export button */}
          <button
            onClick={() => toast.info('Export functionality will be added soon')}
            style={{ 
              backgroundColor: '#8AB73A', 
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <span style={{ fontSize: '18px' }}>↓</span>
            Export All (.xlsx)
          </button>
        </Box>
      </Box>

      {/* Main content */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress sx={{ color: '#8AB73A' }} />
        </Box>
      ) : queryError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading sales data: {queryError instanceof Error ? queryError.message : 'Unknown error'}
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 250px)', borderRadius: '8px', boxShadow: 'none', border: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Table stickyHeader aria-label="sales table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>S.No</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Invoice #</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Product Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Unit Price</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>GST %</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Taxable Value</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>CGST</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>SGST</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Payment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? salesData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : salesData
              ).map((row, index) => (
                <TableRow key={`${row.order_id}-${index}`} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{row.serial_no}</TableCell>
                  <TableCell>{formatDate(row.date)}</TableCell>
                  <TableCell>{row.order_id}</TableCell>
                  <TableCell>{row.invoice_number || '-'}</TableCell>
                  <TableCell>{row.product_name}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell>₹{parseFloat(row.unit_price_ex_gst).toFixed(2)}</TableCell>
                  <TableCell>{row.gst_percentage}%</TableCell>
                  <TableCell>₹{parseFloat(row.taxable_value).toFixed(2)}</TableCell>
                  <TableCell>₹{parseFloat(row.cgst_amount).toFixed(2)}</TableCell>
                  <TableCell>₹{parseFloat(row.sgst_amount).toFixed(2)}</TableCell>
                  <TableCell>₹{parseFloat(row.total_purchase_cost).toFixed(2)}</TableCell>
                  <TableCell>{row.payment_method}</TableCell>
                </TableRow>
              ))}

              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={13} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                  colSpan={13}
                  count={salesData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                  labelRowsPerPage="Rows per page:"
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default SalesTab; 
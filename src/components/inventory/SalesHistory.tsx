import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { 
  Box, 
  CircularProgress, 
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import moment from 'moment';
import { useSalesHistory } from '../../hooks/useSalesHistory';
import SalesHistoryTable from './SalesHistoryTable';

// Define the type for sales history items
interface SalesItem {
  serial_no: string | number;
  order_id: string;
  date: string;
  product_name: string;
  quantity: string;
  unit_price_ex_gst: string;
  gst_percentage: string | null;
  taxable_value: string;
  cgst_amount: string | null;
  sgst_amount: string | null;
  total_purchase_cost: string | null;
  discount: string;
  tax: string;
  payment_amount: string;
  payment_method: string | null;
  current_stock?: number | null;
  current_stock_amount?: number | null;
  c_sgst?: number | null;
  c_cgst?: number | null;
  c_tax?: number | null;
  payment_date?: string | null;
  product_id?: string;
  // New fields
  hsn_code?: string | null;
  product_type?: string | null;
  mrp_incl_gst?: string | null;
  discounted_sales_rate_ex_gst?: string | null;
  invoice_value?: string | null;
  igst_amount?: string | null;
  // Added from database view
  remaining_stock?: number | null;
  taxable_after_discount?: string;
  original_serial_no?: string;
  order_item_pk?: string;
  id?: string;
}

export default function SalesHistory() {
  const theme = useTheme();
  // Use hook for fetching and deleting sales history
  const { salesHistory, isLoading: loading, error, fetchSalesHistory, deleteSalesEntry } = useSalesHistory();
  const [filteredData, setFilteredData] = useState<SalesItem[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().setDate(new Date().getDate() - 30))); // Last 30 days
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [productType, setProductType] = useState('all');

  // Calculate totals
  const totalSales = filteredData.reduce((sum, item) => sum + Number(item.payment_amount), 0);
  const totalTax = filteredData.reduce((sum, item) => sum + Number(item.tax), 0);

  // Fetch sales history on mount
  useEffect(() => {
    fetchSalesHistory();
  }, [fetchSalesHistory]);

  // Apply filtering when data or filters change
  useEffect(() => {
    let filtered = [...salesHistory];
    // Date filter
    if (startDate && endDate) {
      const start = moment(startDate).startOf('day');
      const end = moment(endDate).endOf('day');
      filtered = filtered.filter(item => {
        const itemDate = moment(item.date);
        return itemDate.isSameOrAfter(start) && itemDate.isSameOrBefore(end);
      });
    }
    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        (item.product_name && item.product_name.toLowerCase().includes(term)) ||
        (item.serial_no && item.serial_no.toString().toLowerCase().includes(term))
      );
    }
    // Payment method filter
    if (paymentMethod !== 'all') {
      filtered = filtered.filter(item => 
        item.payment_method && item.payment_method.toLowerCase() === paymentMethod.toLowerCase()
      );
    }
    // Product type filter
    if (productType !== 'all') {
      filtered = filtered.filter(item => 
        item.product_type && item.product_type.toLowerCase() === productType.toLowerCase()
      );
    }
    setFilteredData(filtered);
  }, [salesHistory, startDate, endDate, searchTerm, paymentMethod, productType]);

  const exportToCSV = () => {
    // Headers for the CSV
    const headers = [
      'Serial No',
      'Date',
      'Order ID',
      'Product',
      'Quantity',
      'Unit Price (Ex GST)',
      'GST %',
      'Taxable Value',
      'CGST',
      'SGST',
      'IGST',
      'HSN Code',
      'Product Type',
      'MRP (Incl GST)',
      'Discounted Rate (Ex GST)',
      'Total',
      'Discount',
      'Invoice Value',
      'Remaining Stock',
      'Current Stock',
      'Current Stock Value',
      'Current CGST',
      'Current SGST',
      'Current Tax',
      'Payment Method'
    ];

    // Convert data to CSV format
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const item of filteredData) {
      const row = [
        item.serial_no.toString(),
        new Date(item.date).toLocaleDateString(),
        `"${item.order_id}"`,
        `"${item.product_name}"`,
        item.quantity,
        item.unit_price_ex_gst,
        item.gst_percentage || '',
        item.taxable_value,
        item.cgst_amount || '',
        item.sgst_amount || '',
        item.igst_amount || '',
        item.hsn_code || '',
        `"${item.product_type || ''}"`,
        item.mrp_incl_gst || '',
        item.discounted_sales_rate_ex_gst || '',
        item.payment_amount,
        item.discount,
        item.invoice_value || '',
        item.remaining_stock || '',
        item.current_stock || '',
        item.current_stock_amount || '',
        item.c_cgst || '',
        item.c_sgst || '',
        item.c_tax || '',
        `"${item.payment_method || ''}"`
      ];
      csvRows.push(row.join(','));
    }

    // Create a CSV file and trigger download
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_history_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxWidth="xl">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Sales History</Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Date filters */}
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </LocalizationProvider>
          </Grid>
          
          {/* Search field */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search Products"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          
          {/* Payment method filter */}
          <Grid item xs={12} sm={6} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                label="Payment Method"
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="all">All Methods</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="upi">UPI</MenuItem>
                <MenuItem value="split">Split</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Product type filter */}
          <Grid item xs={12} sm={6} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Product Type</InputLabel>
              <Select
                value={productType}
                label="Product Type"
                onChange={(e) => setProductType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="product">Product</MenuItem>
                <MenuItem value="service">Service</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <SalesHistoryTable 
            salesData={filteredData} 
            totalSales={totalSales} 
            totalTax={totalTax}
            loading={loading}
            onExportCsv={exportToCSV}
            onDeleteSale={deleteSalesEntry}
          />
        )}
        {error && <Alert severity="error">{error}</Alert>}
      </Paper>
    </Container>
  );
}
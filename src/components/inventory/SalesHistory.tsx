import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase-client';
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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import moment from 'moment';
import SalesHistoryTable from './SalesHistoryTable';

// Define the type for sales history items
interface SalesItem {
  serial_no: string;
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
}

export default function SalesHistory() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesItem[]>([]);
  const [filteredData, setFilteredData] = useState<SalesItem[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().setDate(new Date().getDate() - 30))); // Last 30 days
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [productType, setProductType] = useState('all');

  // Calculate totals
  const totalSales = filteredData.reduce((sum, item) => sum + Number(item.payment_amount), 0);
  const totalTax = filteredData.reduce((sum, item) => sum + Number(item.tax), 0);

  useEffect(() => {
    fetchSalesData();
  }, []);

  useEffect(() => {
    if (salesData.length > 0) {
      filterData();
    }
  }, [salesData, startDate, endDate, searchTerm, paymentMethod, productType]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales_product_new_view')
        .select(`
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
          payment_date,
          current_stock,
          current_stock_amount,
          c_sgst,
          c_cgst,
          c_tax,
          hsn_code,
          product_type,
          mrp_incl_gst,
          discounted_sales_rate_ex_gst,
          invoice_value,
          igst_amount,
          product_id,
          remaining_stock
        `)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching sales data:', error);
      } else if (data) {
        setSalesData(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Enrich sales data with current stock information
  const enrichSalesDataWithStock = async (salesData: any[]) => {
    try {
      // Extract unique product IDs
      const productIds = [...new Set(salesData
        .filter(item => item.product_id)
        .map(item => item.product_id))];
      
      if (productIds.length === 0) return salesData;

      // Fetch current stock data for these products
      const { data: stockData, error } = await supabase
        .from('products')
        .select('id, stock_quantity, purchase_price, purchase_price_incl_tax, purchase_tax_rate')
        .in('id', productIds);
      
      if (error) {
        console.error('Error fetching stock data:', error);
        return salesData;
      }

      // Create a map for quick lookups
      const stockMap = new Map();
      stockData?.forEach(item => {
        stockMap.set(item.id, {
          stock_quantity: item.stock_quantity,
          purchase_price: item.purchase_price,
          purchase_price_incl_tax: item.purchase_price_incl_tax,
          purchase_tax_rate: item.purchase_tax_rate
        });
      });

      // Enrich sales data with stock information
      return salesData.map(item => {
        if (!item.product_id || !stockMap.has(item.product_id)) {
          return {
            ...item,
            current_stock: null,
            current_stock_amount: null,
            c_sgst: null,
            c_cgst: null,
            c_tax: null
          };
        }

        const stockInfo = stockMap.get(item.product_id);
        const stockQuantity = stockInfo.stock_quantity || 0;
        const purchasePrice = stockInfo.purchase_price || 0;
        const stockAmount = stockQuantity * purchasePrice;
        
        // Calculate tax
        const taxRate = stockInfo.purchase_tax_rate || 0;
        const cgst = taxRate > 0 ? (stockAmount * (taxRate / 2)) / 100 : 0;
        const sgst = taxRate > 0 ? (stockAmount * (taxRate / 2)) / 100 : 0;
        const totalTax = cgst + sgst;

        return {
          ...item,
          current_stock: stockQuantity,
          current_stock_amount: stockAmount,
          c_sgst: sgst,
          c_cgst: cgst,
          c_tax: totalTax
        };
      });
    } catch (error) {
      console.error('Error enriching sales data:', error);
      return salesData;
    }
  };

  const filterData = () => {
    let filtered = [...salesData];

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
        item.product_name.toLowerCase().includes(term) ||
        item.order_id.toLowerCase().includes(term) ||
        (item.hsn_code && item.hsn_code.toLowerCase().includes(term))
      );
    }

    // Payment method filter
    if (paymentMethod !== 'all') {
      filtered = filtered.filter(item => 
        item.payment_method?.toLowerCase() === paymentMethod.toLowerCase()
      );
    }

    // Product type filter
    if (productType !== 'all') {
      filtered = filtered.filter(item => 
        item.product_type?.toLowerCase() === productType.toLowerCase()
      );
    }

    // Add serial numbers
    filtered = filtered.map((item, index) => ({
      ...item,
      serial_no: (index + 1).toString()
    }));

    setFilteredData(filtered);
  };

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
        item.serial_no,
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
          />
        )}
      </Paper>
    </Container>
  );
}
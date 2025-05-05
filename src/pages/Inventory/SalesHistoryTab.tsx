import React, { useState, useEffect, useMemo } from 'react';
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
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
  Button,
  Divider,
  Grid
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon
} from '@mui/icons-material';
import { supabase } from '../../utils/supabase/supabaseClient';
import { styled } from '@mui/material/styles';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';

// Define the view name as a constant for easy updating
const SALES_PRODUCTS_VIEW = 'sales_products_new';

// Define type for sales data that matches the SQL view
interface SalesItem {
  serial_no: string;
  order_id: string;
  order_item_id: string;
  date: string;
  product_name: string;
  quantity: number;
  unit_price_ex_gst: number;
  unit_price_inc_gst?: number;
  gst_percentage: number;
  taxable_value: number;
  cgst_amount: number;
  sgst_amount: number;
  total_purchase_cost: number;
  discount: number;
  discount_percentage?: number;
  tax: number;
  hsn_code: string;
  product_type: string;
  mrp_incl_gst: number;
  discounted_sales_rate_ex_gst: number;
  invoice_value: number;
  igst_amount: number;
  initial_stock: number;
  remaining_stock: number;
  current_stock: number;
  current_stock_taxable_value?: number;
  current_stock_igst?: number;
  current_stock_cgst?: number;
  current_stock_sgst?: number;
  current_stock_total_value?: number;
  taxable_after_discount?: number;
}

// Custom styled components
const HeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  color: theme.palette.primary.main,
  fontWeight: 'bold',
  padding: '16px 8px',
  borderBottom: `2px solid ${theme.palette.divider}`,
  whiteSpace: 'nowrap',
  textAlign: 'center'
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: '4px',
  fontWeight: 'bold',
  padding: '0 4px',
}));

const SalesHistoryTab: React.FC = () => {
  // State for data and UI
  const [salesData, setSalesData] = useState<SalesItem[]>([]);
  const [filteredData, setFilteredData] = useState<SalesItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<{column: keyof SalesItem | null, direction: 'asc' | 'desc'}>({
    column: 'date',
    direction: 'desc'
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [isExporting, setIsExporting] = useState(false);
  
  // Compute remaining-stock tax breakdown on the client
  const tableData = useMemo(() => {
    return filteredData.map(item => {
      const qty = item.current_stock ?? 0;
      const unitExcl = item.unit_price_ex_gst ?? 0;
      const gstPct = item.gst_percentage ?? 0;
      const unitIncl = unitExcl * (1 + gstPct / 100);

      // 1 Taxable Value
      const taxable = qty * unitExcl;

      // 2/3/4 GST splits
      const igst = 0; // IGST is always 0
      const cgst = taxable * gstPct / 200; // Always calculate CGST
      const sgst = taxable * gstPct / 200; // Always calculate SGST

      // 5 Total value
      const totalVal = taxable + igst + cgst + sgst;

      return {
        ...item,
        order_item_id: item.order_item_id,
        unit_price_inc_gst: unitIncl,
        current_stock_taxable_value: taxable,
        discount_percentage: Number(item.discount_percentage) || 0,
        taxable_after_discount: (item.taxable_value ?? 0) * (1 - ((item.discount_percentage || 0) / 100)),
        current_stock_igst: igst,
        current_stock_cgst: cgst,
        current_stock_sgst: sgst,
        current_stock_total_value: totalVal
      };
    });
  }, [filteredData]);

  // Function to fetch sales data
  const fetchSalesData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Skip the view existence check as it seems to cause issues
      // Try to directly fetch the data
      const { data, error } = await supabase.from(SALES_PRODUCTS_VIEW).select('*');

      // Check for fetch error
      if (error) {
        console.error(`Error fetching data from ${SALES_PRODUCTS_VIEW}:`, error);
        
        // Check if the error is due to view not existing
        if (error.code === '42P01' || error.message.includes('relation') && error.message.includes('does not exist')) {
          setError(`The ${SALES_PRODUCTS_VIEW} view does not exist. Please create it first.`);
        } else {
          setError(`Failed to load sales data: ${error.message || 'Unknown error'}`);
        }
        setIsLoading(false);
        return;
      }

      // Check if data exists
      if (!data || data.length === 0) {
        console.warn(`No data found in ${SALES_PRODUCTS_VIEW} view.`);
        setSalesData([]);
        setFilteredData([]);
        setIsLoading(false);
        return;
      }

      // Process the data
      console.log(`Fetched ${data.length} records from ${SALES_PRODUCTS_VIEW} view.`);
      if (data.length > 0) {
        console.log('Sample item with discount fields:', {
          sample_item: data[0],
          discount: data[0].discount,
          discount_percentage: data[0].discount_percentage,
          taxable_value: data[0].taxable_value
        });
      }
      setSalesData(data);
      
      // Apply initial filtering/sorting
      let processedData = [...data];
      
      // Apply date filtering if needed
      if (dateRange.startDate && dateRange.endDate) {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999); // Set to end of day
        
        processedData = processedData.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= startDate && itemDate <= endDate;
        });
      }
      
      // Apply search term filtering if needed
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        processedData = processedData.filter(item => 
          (item.product_name && item.product_name.toLowerCase().includes(term)) ||
          (item.serial_no && item.serial_no.toLowerCase().includes(term)) ||
          (item.hsn_code && item.hsn_code.toLowerCase().includes(term))
        );
      }
      
      // Add debug logging for the discount percentage
      if (processedData.length > 0) {
        console.log("Debug - Sample discount_percentage values:", processedData.slice(0, 3).map(item => ({
          product: item.product_name,
          discount: item.discount,
          discount_percentage: item.discount_percentage,
          taxable_value: item.taxable_value
        })));
      }
      
      // Apply sorting if needed
      if (sortBy.column) {
        processedData.sort((a, b) => {
          const aValue = a[sortBy.column!];
          const bValue = b[sortBy.column!];
          
          // Handle different types of values
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortBy.direction === 'asc' ? aValue - bValue : bValue - aValue;
          }
          
          // Convert dates to timestamps for comparison
          if (sortBy.column === 'date') {
            const aDate = new Date(a.date).getTime();
            const bDate = new Date(b.date).getTime();
            return sortBy.direction === 'asc' ? aDate - bDate : bDate - aDate;
          }
          
          // Handle string comparisons
          const aString = String(aValue || '');
          const bString = String(bValue || '');
          return sortBy.direction === 'asc' 
            ? aString.localeCompare(bString) 
            : bString.localeCompare(aString);
        });
      }
      
      // Override discount_percentage with the original order-level value from pos_orders
      if (processedData.length > 0) {
        try {
          const orderIds = Array.from(new Set(processedData.map(item => item.order_id)));
          const { data: ordersData, error: ordersError } = await supabase
            .from('pos_orders')
            .select('id, discount_percentage')
            .in('id', orderIds);
          if (!ordersError && ordersData) {
            const discountMap = new Map(ordersData.map(o => [o.id, o.discount_percentage]));
            processedData = processedData.map(item => ({
              ...item,
              // Use stored discount_percentage if available, else keep existing
              discount_percentage: discountMap.get(item.order_id) ?? item.discount_percentage
            }));
          }
        } catch (err) {
          console.error('Error fetching order-level discount percentages:', err);
        }
      }
      
      setFilteredData(processedData);
    } catch (err) {
      console.error('Error in fetchSalesData:', err);
      setError('Failed to load sales data due to an unexpected error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchSalesData();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Format currency values
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };
  
  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle sorting
  const handleSort = (column: keyof SalesItem) => {
    setSortBy(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page
  };
  
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Export data to Excel
  const handleExport = () => {
    try {
      setIsExporting(true);
      
      // Build header and row arrays so Excel columns exactly match the UI table
      const headers = [
        'Serial No.', 'Date', 'Product Name', 'HSN Code', 'Units', 'Qty.',
        'Unit Price (Inc. GST)', 'Unit Price (Ex.GST)', 'Taxable Value', 'GST %',
        'Discount %', 'Taxable After Discount', 'CGST', 'SGST', 'Total Value',
        'Initial Stock', 'Remaining Stock', 'Current Stock', 'Taxable Value',
        'IGST (Rs.)', 'CGST (Rs.)', 'SGST (Rs.)', 'Total Value (Rs.)'
      ];
      const dataRows = tableData.map(item => [
        item.serial_no,
        formatDate(item.date),
        item.product_name,
        item.hsn_code || 'N/A',
        item.product_type || 'N/A',
        item.quantity,
        item.unit_price_inc_gst,
        item.unit_price_ex_gst,
        item.taxable_value,
        `${item.gst_percentage}%`,
        item.discount_percentage ? `${item.discount_percentage.toFixed(2)}%` : '0.00%',
        item.taxable_after_discount ?? 0,
        item.cgst_amount,
        item.sgst_amount,
        item.invoice_value,
        item.initial_stock,
        item.remaining_stock,
        item.current_stock,
        item.current_stock_taxable_value ?? 0,
        item.current_stock_igst ?? 0,
        item.current_stock_cgst ?? 0,
        item.current_stock_sgst ?? 0,
        item.current_stock_total_value ?? 0
      ]);
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
      
      // Auto size columns
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      for (let i = range.s.c; i <= range.e.c; i++) {
        const colName = XLSX.utils.encode_col(i);
        // Skip first row (header)
        worksheet[`${colName}1`].s = { font: { bold: true } };
      }
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales History');
      
      // Generate filename
      const fileName = `Sales_History_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Export
      XLSX.writeFile(workbook, fileName);
      toast.success('Sales data exported successfully!');
    } catch (err) {
      console.error('Error exporting data:', err);
      toast.error('Failed to export sales data');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Calculate totals including remaining-stock tax breakdown
  const totals = tableData.reduce((sum, item) => {
    // Helper to safely parse and sum, treating non-numbers as 0
    const safeAdd = (currentSum: number, value: any): number => {
      const num = parseFloat(String(value)); // Convert to string first, then parse
      return currentSum + (isNaN(num) ? 0 : num); // Add 0 if NaN or invalid
    };

    return {
      quantity: safeAdd(sum.quantity, item.quantity),
      taxableValue: safeAdd(sum.taxableValue, item.taxable_value),
      cgst: safeAdd(sum.cgst, item.cgst_amount), // Use safeAdd
      sgst: safeAdd(sum.sgst, item.sgst_amount), // Use safeAdd
      totalValue: safeAdd(sum.totalValue, item.invoice_value), // Use safeAdd
      currentStockTaxable: safeAdd(sum.currentStockTaxable, (item.current_stock_taxable_value ?? 0)),
      currentStockIgst: safeAdd(sum.currentStockIgst, (item.current_stock_igst ?? 0)),
      currentStockCgst: safeAdd(sum.currentStockCgst, (item.current_stock_cgst ?? 0)),
      currentStockSgst: safeAdd(sum.currentStockSgst, (item.current_stock_sgst ?? 0)),
      currentStockTotalValue: safeAdd(sum.currentStockTotalValue, (item.current_stock_total_value ?? 0))
    };
  }, {
    quantity: 0,
    taxableValue: 0,
    cgst: 0,
    sgst: 0,
    totalValue: 0,
    currentStockTaxable: 0,
    currentStockIgst: 0,
    currentStockCgst: 0,
    currentStockSgst: 0,
    currentStockTotalValue: 0
  });
  
  // Helper for rendering sortable table headers
  const renderSortableHeader = (column: keyof SalesItem | null, label: string) => ( // Make column possibly null
    <HeaderCell
      onClick={() => column && handleSort(column)} // Check if column is not null before calling handleSort
      style={{ cursor: column ? 'pointer' : 'default' }} // Only show pointer if sortable
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {label}
        {sortBy.column === column && (
          sortBy.direction === 'asc' 
            ? <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> 
            : <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
        )}
      </Box>
    </HeaderCell>
  );
  
  return (
    <Box sx={{ p: 0 }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by product name or HSN code"
              value={searchTerm}
              onChange={handleSearch}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                size="small"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                label="End Date"
                type="date"
                size="small"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
              />
              
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => fetchSalesData()}
                startIcon={<FilterIcon />}
              >
                Apply
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => fetchSalesData()}
                disabled={isLoading}
              >
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
          <Table stickyHeader aria-label="sales history table">
            <TableHead>
              <TableRow>
                {renderSortableHeader('serial_no', 'Serial No.')}
                {renderSortableHeader('date', 'Date')}
                {renderSortableHeader('product_name', 'Product Name')}
                {renderSortableHeader('hsn_code', 'HSN Code')}
                {renderSortableHeader('product_type', 'Units')}
                {renderSortableHeader('quantity', 'Qty.')}
                {renderSortableHeader('unit_price_inc_gst', 'Unit Price (Inc. GST)')}
                {renderSortableHeader('unit_price_ex_gst', 'Unit Price (Ex.GST)')}
                {renderSortableHeader('taxable_value', 'Taxable Value')}
                {renderSortableHeader('gst_percentage', 'GST %')}
                {renderSortableHeader('discount_percentage', 'Discount %')}
                {renderSortableHeader('taxable_after_discount', 'Taxable After Discount')}
                {renderSortableHeader('cgst_amount', 'CGST')}
                {renderSortableHeader('sgst_amount', 'SGST')}
                {renderSortableHeader('invoice_value', 'Total Value')}
                {renderSortableHeader('initial_stock', 'Initial Stock')}
                {renderSortableHeader('remaining_stock', 'Remaining Stock')}
                {renderSortableHeader('current_stock', 'Current Stock')}
                {renderSortableHeader('current_stock_taxable_value', 'Taxable Value')}
                {renderSortableHeader('current_stock_igst', 'IGST (Rs.)')}
                {renderSortableHeader('current_stock_cgst', 'CGST (Rs.)')}
                {renderSortableHeader('current_stock_sgst', 'SGST (Rs.)')}
                {renderSortableHeader('current_stock_total_value', 'Total Value (Rs.)')}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={23} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Loading sales data...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredData.length > 0 ? (
                tableData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow hover key={row.order_item_id}>
                      <TableCell>{row.serial_no}</TableCell>
                      <TableCell>{formatDate(row.date)}</TableCell>
                      <TableCell>{row.product_name}</TableCell>
                      <TableCell>{row.hsn_code || 'N/A'}</TableCell>
                      <TableCell>{row.product_type || 'N/A'}</TableCell>
                      <TableCell align="right">{row.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(row.unit_price_inc_gst)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.unit_price_ex_gst)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.taxable_value)}</TableCell>
                      <TableCell align="right">{row.gst_percentage}%</TableCell>
                      <TableCell align="right">
                        {row.discount_percentage && row.discount_percentage > 0 
                          ? `${Number(row.discount_percentage).toFixed(2)}%` 
                          : '-'}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(row.taxable_after_discount ?? 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.cgst_amount)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.sgst_amount)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.invoice_value)}</TableCell>
                      <TableCell align="right">
                        <StyledChip 
                          label={Math.round(row.initial_stock)} 
                          color="primary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <StyledChip 
                          label={Math.round(row.remaining_stock)} 
                          color={row.remaining_stock > 0 ? "success" : "error"} 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <StyledChip 
                          label={Math.round(row.current_stock)} 
                          color={row.current_stock > 0 ? "success" : "error"} 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">{formatCurrency(row.current_stock_taxable_value)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.current_stock_igst)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.current_stock_cgst)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.current_stock_sgst)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.current_stock_total_value)}</TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={23} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">No sales data found</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      {searchTerm 
                        ? 'Try adjusting your search criteria' 
                        : 'There are no sales records for the selected period'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              
              {/* Totals row */}
              {tableData.length > 0 && (
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell colSpan={5} align="right" sx={{ fontWeight: 'bold' }}>Totals:</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{totals.quantity}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}></TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}></TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(totals.taxableValue)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}></TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}></TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(totals.cgst)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(totals.sgst)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(totals.totalValue)}</TableCell>
                  <TableCell colSpan={3}></TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(totals.currentStockTaxable)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(totals.currentStockIgst)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(totals.currentStockCgst)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(totals.currentStockSgst)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(totals.currentStockTotalValue)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredData.length}
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
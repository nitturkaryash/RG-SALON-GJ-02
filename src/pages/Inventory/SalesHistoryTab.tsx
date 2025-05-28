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
import { supabase, TABLES } from '../../utils/supabase/supabaseClient';
import { styled } from '@mui/material/styles';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import { useInventory } from '../../hooks/useInventory';

// Use the actual base table for mutations, view for reading
const SALES_VIEW = 'sales_product_new';
const SALES_BASE_TABLE = 'inventory_sales_new';

// Define type for sales data that matches the SQL view
interface SalesItem {
  id: string; // Unique sale record ID from inventory_sales_new OR order_id for display grouping
  order_item_pk: string; // Actual Primary Key from pos_order_items
  original_serial_no?: number; // Original serial number from view
  serial_no: string | number;
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
  purchase_cost_per_unit_ex_gst: number;
}

// New interface for grouped sales by order
interface GroupedSalesItem {
  id: string; // order_id
  serial_no: string | number;
  order_id: string;
  date: string;
  products: SalesItem[]; // Array of products in this order
  total_quantity: number;
  total_taxable_value: number;
  total_cgst_amount: number;
  total_sgst_amount: number;
  total_discount: number;
  total_invoice_value: number;
  combined_product_names: string;
  combined_hsn_codes: string;
  gst_percentage: number; // Most common GST percentage in the order
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

interface SalesHistoryTabProps {
  onDataUpdate?: (data: any[]) => void;
}

const SalesHistoryTab: React.FC<SalesHistoryTabProps> = ({ onDataUpdate }) => {
  // State for data and UI
  const [salesData, setSalesData] = useState<SalesItem[]>([]);
  const [groupedSalesData, setGroupedSalesData] = useState<GroupedSalesItem[]>([]);
  const [filteredData, setFilteredData] = useState<GroupedSalesItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<{column: keyof GroupedSalesItem | null, direction: 'asc' | 'desc'}>({
    column: 'date',
    direction: 'desc'
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [isExporting, setIsExporting] = useState(false);
  const { deleteSale } = useInventory();
  
  // Compute remaining-stock tax breakdown on the client
  const tableData = useMemo(() => {
    return filteredData.map(item => {
      // For grouped data, we calculate aggregated current stock values
      const totalCurrentStockTaxable = item.products.reduce((sum, product) => {
        const qty = product.remaining_stock ?? 0;
        const unitExcl = Number(product.purchase_cost_per_unit_ex_gst) || 0;
        return sum + (qty * unitExcl);
      }, 0);
      
      const totalCurrentStockCgst = item.products.reduce((sum, product) => {
        const qty = product.remaining_stock ?? 0;
        const unitExcl = Number(product.purchase_cost_per_unit_ex_gst) || 0;
        const gstPct = Number(product.gst_percentage) || 0;
        const taxable = qty * unitExcl;
        return sum + (taxable * gstPct / 200);
      }, 0);
      
      const totalCurrentStockSgst = totalCurrentStockCgst; // Same as CGST
      const totalCurrentStockTotalValue = totalCurrentStockTaxable + totalCurrentStockCgst + totalCurrentStockSgst;

      return {
        ...item,
        current_stock_taxable_value: totalCurrentStockTaxable,
        current_stock_cgst: totalCurrentStockCgst,
        current_stock_sgst: totalCurrentStockSgst,
        current_stock_total_value: totalCurrentStockTotalValue,
        // Calculate discount percentage from absolute discount and taxable value
        discount_percentage: item.total_taxable_value > 0 ? 
          (item.total_discount / item.total_taxable_value) * 100 : 0,
        taxable_after_discount: item.total_taxable_value * (1 - (item.total_discount / item.total_taxable_value || 0))
      };
    });
  }, [filteredData]);

  // Notify parent of latest table data
  useEffect(() => {
    if (onDataUpdate) {
      onDataUpdate(tableData);
    }
  }, [tableData, onDataUpdate]);

  // Function to fetch sales data
  const fetchSalesData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching data from pos_orders table directly like Orders.tsx');
      
      // Query pos_orders directly like Orders.tsx does
      const { data: ordersData, error } = await supabase
        .from('pos_orders')
        .select('*')
        .eq('type', 'sale')
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate)
        .order('created_at', { ascending: false });

      // Check for fetch error
      if (error) {
        console.error('Error fetching orders data:', error);
        setError(`Failed to load sales data: ${error.message || 'Unknown error'}`);
        setIsLoading(false);
        return;
      }

      // Check if data exists
      if (!ordersData || ordersData.length === 0) {
        console.warn('No orders data found.');
        setSalesData([]);
        setGroupedSalesData([]);
        setFilteredData([]);
        setIsLoading(false);
        return;
      }

      console.log(`Received ${ordersData.length} orders from pos_orders table`);
      console.log('Sample order:', ordersData[0]);
      
      // Process orders to extract and group product data like Orders.tsx does
      const groupedData: GroupedSalesItem[] = ordersData.map((order, index) => {
        // Extract product items from the services array
        const productServices = order.services?.filter((service: any) => service.type === 'product') || [];
        
        // Calculate totals from all product services in this order
        const totalQuantity = productServices.reduce((sum: number, service: any) => sum + (service.quantity || 1), 0);
        const totalTaxableValue = productServices.reduce((sum: number, service: any) => {
          const price = service.price || 0;
          const quantity = service.quantity || 1;
          return sum + (price * quantity);
        }, 0);
        const totalGstAmount = productServices.reduce((sum: number, service: any) => {
          const price = service.price || 0;
          const quantity = service.quantity || 1;
          const gstRate = service.gst_percentage || 18;
          const taxable = price * quantity;
          return sum + (taxable * gstRate / 200); // CGST (half of total GST)
        }, 0);
        
        const totalInvoiceValue = totalTaxableValue + (totalGstAmount * 2); // CGST + SGST
        
        // Get product names and HSN codes
        const productNames = productServices.map((service: any) => service.service_name).join(', ');
        const hsnCodes = [...new Set(productServices.map((service: any) => service.hsn_code).filter(Boolean))].join(', ');
        
        // Get the most common GST percentage
        const gstPercentages = productServices.map((service: any) => service.gst_percentage || 18);
        const avgGstPercentage = gstPercentages.length > 0 ? gstPercentages.reduce((a: number, b: number) => a + b, 0) / gstPercentages.length : 18;

        return {
          id: order.id,
          serial_no: index + 1,
          order_id: order.id,
          date: order.created_at || order.date,
          products: [], // Not needed for display
          total_quantity: totalQuantity,
          total_taxable_value: totalTaxableValue,
          total_cgst_amount: totalGstAmount,
          total_sgst_amount: totalGstAmount,
          total_discount: order.discount || 0,
          total_invoice_value: totalInvoiceValue,
          combined_product_names: productNames,
          combined_hsn_codes: hsnCodes,
          gst_percentage: avgGstPercentage
        };
      }).filter(item => item.total_quantity > 0); // Only include orders with products

      console.log('Processed grouped data:', groupedData);
      
      // Set the data
      setSalesData([]); // Not needed for the grouped approach
      setGroupedSalesData(groupedData);
      setFilteredData(groupedData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('An unexpected error occurred while loading sales data.');
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
  
  // Handle sorting for grouped data
  const handleSort = (column: keyof GroupedSalesItem) => {
    setSortBy(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Utility function to reindex serial numbers after filtering or sorting
  const reindexSerialNumbers = (data: GroupedSalesItem[]): GroupedSalesItem[] => {
    return data.map((item, index) => ({
      ...item,
      serial_no: index + 1
    }));
  };

  // Handle search for grouped data
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);
    
    // Apply the search filter
    if (searchValue.trim() === '') {
      setFilteredData(groupedSalesData);
    } else {
      const filtered = groupedSalesData.filter(item => 
        item.combined_product_names.toLowerCase().includes(searchValue) ||
        item.combined_hsn_codes.toLowerCase().includes(searchValue) ||
        item.order_id.toLowerCase().includes(searchValue)
      );
      setFilteredData(filtered);
    }
    
    setPage(0); // Reset to first page
  };
  
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Apply date filter when the Apply button is clicked
  const applyDateFilter = () => {
    fetchSalesData();
  };
  
  // Export data to Excel
  const handleExport = () => {
    try {
      setIsExporting(true);
      
      // Build header and row arrays so Excel columns exactly match the UI table
      const headers = [
        'Serial No.', 'Date', 'Product Names', 'HSN Codes', 'Total Qty.',
        'Taxable Value', 'GST %', 'Discount %', 'Taxable After Discount', 
        'CGST', 'SGST', 'Total Value', 'Order ID'
      ];
      const dataRows = tableData.map(item => [
        item.serial_no,
        formatDate(item.date),
        item.combined_product_names,
        item.combined_hsn_codes || 'N/A',
        item.total_quantity,
        item.total_taxable_value,
        Number(item.gst_percentage ?? 0).toFixed(2) + '%',
        Number(item.discount_percentage ?? 0).toFixed(2) + '%',
        item.taxable_after_discount ?? 0,
        item.total_cgst_amount,
        item.total_sgst_amount,
        item.total_invoice_value,
        item.order_id
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
      const num = parseFloat(String(value));
      return currentSum + (isNaN(num) ? 0 : num);
    };

    return {
      quantity: safeAdd(sum.quantity, item.total_quantity),
      taxableValue: safeAdd(sum.taxableValue, item.total_taxable_value),
      taxableAfterDiscount: safeAdd(sum.taxableAfterDiscount, item.taxable_after_discount),
      cgst: safeAdd(sum.cgst, item.total_cgst_amount),
      sgst: safeAdd(sum.sgst, item.total_sgst_amount),
      totalValue: safeAdd(sum.totalValue, item.total_invoice_value)
    };
  }, {
    quantity: 0,
    taxableValue: 0,
    taxableAfterDiscount: 0,
    cgst: 0,
    sgst: 0,
    totalValue: 0
  });
  
  // Helper for rendering sortable table headers
  const renderSortableHeader = (column: keyof GroupedSalesItem | null, label: string) => ( // Make column possibly null
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
              placeholder="Search by product name, HSN code, or order ID"
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
                onClick={applyDateFilter}
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
                <TableCell padding="checkbox" /> {/* For expand/collapse */}
                {renderSortableHeader('serial_no', 'Serial No.')}
                {renderSortableHeader('date', 'Date')}
                {renderSortableHeader('combined_product_names', 'Product Names')}
                {renderSortableHeader('combined_hsn_codes', 'HSN Codes')}
                {renderSortableHeader('total_quantity', 'Total Qty.')}
                {renderSortableHeader('total_taxable_value', 'Taxable Value')}
                {renderSortableHeader('gst_percentage', 'GST %')}
                {renderSortableHeader(null, 'Discount %')}
                {renderSortableHeader(null, 'Taxable After Discount')}
                {renderSortableHeader('total_cgst_amount', 'CGST')}
                {renderSortableHeader('total_sgst_amount', 'SGST')}
                {renderSortableHeader('total_invoice_value', 'Total Value')}
                {renderSortableHeader('order_id', 'Order ID')}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={14} align="center" sx={{ py: 3 }}>
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
                    <TableRow key={row.order_id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} hover>
                      <TableCell padding="checkbox" />
                      <TableCell align="center">{row.serial_no}</TableCell>
                      <TableCell align="center">{formatDate(row.date)}</TableCell>
                      <TableCell align="left">{row.combined_product_names}</TableCell>
                      <TableCell align="center">{row.combined_hsn_codes}</TableCell>
                      <TableCell align="center">{row.total_quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(row.total_taxable_value)}</TableCell>
                      <TableCell align="right">{Number(row.gst_percentage ?? 0).toFixed(2)}%</TableCell>
                      <TableCell align="right">{Number(row.discount_percentage ?? 0).toFixed(2)}%</TableCell>
                      <TableCell align="right">{formatCurrency(row.taxable_after_discount)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.total_cgst_amount)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.total_sgst_amount)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.total_invoice_value)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title={row.order_id}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {row.order_id.substring(0, 8)}...
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={14} align="center" sx={{ py: 3 }}>
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
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(totals.taxableValue)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}></TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}></TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(totals.taxableAfterDiscount)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(totals.cgst)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(totals.sgst)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(totals.totalValue)}</TableCell>
                  <TableCell></TableCell>
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
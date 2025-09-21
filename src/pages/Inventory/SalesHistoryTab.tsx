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
  Grid,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
} from '@mui/icons-material';
import { supabase, TABLES } from '../../lib/supabase';
import { styled } from '@mui/material/styles';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { useInventory } from '../../hooks/inventory/useInventory';
import { isSalonConsumptionOrder } from '../../utils/orderRenumbering';

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
  invoice_number?: string;
  invoice_no?: string;
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
  combined_product_types: string; // Add product types field
  gst_percentage: number; // Most common GST percentage in the order
  invoice_number?: string; // Invoice number field
  invoice_no?: string; // Alternative invoice number field
}

// Custom styled components
const HeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  color: theme.palette.primary.main,
  fontWeight: 'bold',
  padding: '16px 8px',
  borderBottom: `2px solid ${theme.palette.divider}`,
  whiteSpace: 'nowrap',
  textAlign: 'center',
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
  const [groupedSalesData, setGroupedSalesData] = useState<GroupedSalesItem[]>(
    []
  );
  const [filteredData, setFilteredData] = useState<GroupedSalesItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<{
    column: keyof GroupedSalesItem | null;
    direction: 'asc' | 'desc';
  }>({
    column: 'date',
    direction: 'asc',
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0], // Today
  });
  const [isExporting, setIsExporting] = useState(false);

  // Function to check if an order is a salon consumption order
  const isSalonConsumptionOrder = (order: any) => {
    return (
      order.is_salon_consumption === true ||
      order.type === 'salon_consumption' ||
      order.type === 'salon-consumption' ||
      order.consumption_purpose ||
      order.client_name === 'Salon Consumption'
    );
  };

  // Simple function to format order ID for display
  const formatOrderId = (serialNo: number) => {
    return `SALES-${serialNo}`;
  };

  // Compute remaining-stock tax breakdown on the client and apply sorting
  const tableData = useMemo(() => {
    // First apply sorting
    const sortedData = [...filteredData].sort((a, b) => {
      if (!sortBy.column) return 0;

      const aValue = a[sortBy.column];
      const bValue = b[sortBy.column];

      // Handle different data types
      if (sortBy.column === 'date') {
        const dateA = new Date(aValue as string).getTime();
        const dateB = new Date(bValue as string).getTime();
        return sortBy.direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortBy.direction === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        const strA = String(aValue || '').toLowerCase();
        const strB = String(bValue || '').toLowerCase();
        return sortBy.direction === 'asc'
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      }
    });

    // Then assign serial numbers and calculate tax breakdowns
    return sortedData.map((item, index) => {
      // For grouped data, we calculate aggregated current stock values
      const totalCurrentStockTaxable = item.products.reduce((sum, product) => {
        const qty = product.remaining_stock ?? 0;
        const unitExcl = Number(product.purchase_cost_per_unit_ex_gst) || 0;
        return sum + qty * unitExcl;
      }, 0);

      const totalCurrentStockCgst = item.products.reduce((sum, product) => {
        const qty = product.remaining_stock ?? 0;
        const unitExcl = Number(product.purchase_cost_per_unit_ex_gst) || 0;
        const gstPct = Number(product.gst_percentage) || 0;
        const taxable = qty * unitExcl;
        return sum + (taxable * gstPct) / 200;
      }, 0);

      const totalCurrentStockSgst = totalCurrentStockCgst; // Same as CGST
      const totalCurrentStockTotalValue =
        totalCurrentStockTaxable +
        totalCurrentStockCgst +
        totalCurrentStockSgst;

      return {
        ...item,
        // Keep the original serial number from the backend view
        // serial_no: item.serial_no, // Already set from the view
        current_stock_taxable_value: totalCurrentStockTaxable,
        current_stock_cgst: totalCurrentStockCgst,
        current_stock_sgst: totalCurrentStockSgst,
        current_stock_total_value: totalCurrentStockTotalValue,
        // Calculate discount percentage from absolute discount and taxable value
        discount_percentage:
          item.total_taxable_value > 0
            ? (item.total_discount / item.total_taxable_value) * 100
            : 0,
        taxable_after_discount:
          item.total_taxable_value *
          (1 - (item.total_discount / item.total_taxable_value || 0)),
      };
    });
  }, [filteredData, sortBy]);

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

      console.log(
        '🔄 Fetching fresh data from corrected sales_history_final view...'
      );
      console.log('📅 Date range:', dateRange);

      // No need to fetch all orders for context since we're using backend view

      // Fetch data from the corrected sales_history_final view that properly filters out ALL services
      const { data: salesData, error } = await supabase
        .from('sales_history_final')
        .select('*')
        .gte('date', `${dateRange.startDate}T00:00:00`)
        .lte('date', `${dateRange.endDate}T23:59:59`)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching sales history:', error);
        setError(
          `Failed to load sales data: ${error.message || 'Unknown error'}`
        );
        setIsLoading(false);
        return;
      }

      if (!salesData || salesData.length === 0) {
        console.warn('No sales data found for the selected date range.');
        setSalesData([]);
        setGroupedSalesData([]);
        setFilteredData([]);
        setIsLoading(false);
        return;
      }

      console.log(
        `Received ${salesData.length} product records from corrected sales_history_final view.`
      );

      // Process the data from the new backend view
      const flattenedSales: SalesItem[] = salesData.map(
        (item: any, index: number) => {
          const unitPrice = Number(item.unit_price_ex_gst) || 0;
          const quantity = Number(item.quantity) || 1;
          const gstPercentage = Number(item.gst_percentage) || 0;
          const taxableValue = Number(item.taxable_value) || 0;
          const taxAmount = Number(item.tax_amount) || 0;
          const totalAmount = Number(item.total_amount) || 0;
          const cgstAmount = taxAmount / 2;
          const sgstAmount = taxAmount / 2;

          console.log(
            `Processing product "${item.product_name}" with type: ${item.product_type}`
          );

          // Use invoice_number if available, otherwise create a simple formatted ID
          const formattedOrderId = item.invoice_number || formatOrderId(item.serial_no);

          return {
            id: item.order_id,
            order_item_pk: item.order_item_id || item.order_id,
            serial_no: parseInt(item.serial_no.replace('SALES-', '')) || (index + 1), // Extract number from SALES-XXX
            original_serial_no: item.serial_no,
            order_id: item.serial_no, // Use the formatted serial_no as order_id
            order_item_id: item.order_item_id,
            date: item.date,
            product_name: item.product_name,
            quantity: quantity,
            unit_price_ex_gst: unitPrice,
            unit_price_inc_gst: unitPrice * (1 + gstPercentage / 100),
            gst_percentage: gstPercentage,
            taxable_value: taxableValue,
            cgst_amount: cgstAmount,
            sgst_amount: sgstAmount,
            total_purchase_cost: 0, // Not available from this view
            discount: Number(item.discount) || 0,
            discount_percentage: 0,
            tax: taxAmount,
            hsn_code: item.hsn_code || '',
            product_type: item.product_type || 'product',
            mrp_incl_gst: 0, // Not available from this view
            discounted_sales_rate_ex_gst: unitPrice,
            invoice_value: totalAmount,
            igst_amount: 0, // Using CGST/SGST instead
            initial_stock: 0, // Not available from this view
            remaining_stock: 0, // Not available from this view
            current_stock: 0, // Not available from this view
            purchase_cost_per_unit_ex_gst: 0, // Not available from this view
            invoice_number: item.invoice_number,
            invoice_no: item.invoice_no,
          };
        }
      );

      console.log(`Processed ${flattenedSales.length} individual sales items.`);

      // Log product type distribution for debugging
      const typeDistribution = flattenedSales.reduce(
        (acc, item) => {
          acc[item.product_type] = (acc[item.product_type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      console.log('Product type distribution:', typeDistribution);

      setSalesData(flattenedSales);

      // Group the flattened data by order_id for display
      const groupedData = new Map<string, GroupedSalesItem>();

      flattenedSales.forEach(item => {
        if (!groupedData.has(item.order_id)) {
          groupedData.set(item.order_id, {
            id: item.order_id,
            serial_no: item.serial_no,
            order_id: item.order_id,
            date: item.date,
            products: [],
            total_quantity: 0,
            total_taxable_value: 0,
            total_cgst_amount: 0,
            total_sgst_amount: 0,
            total_discount: 0,
            total_invoice_value: 0,
            combined_product_names: '',
            combined_hsn_codes: '',
            combined_product_types: '',
            gst_percentage: 0,
            invoice_number: item.invoice_number,
            invoice_no: item.invoice_no,
          });
        }

        const group = groupedData.get(item.order_id)!;
        group.products.push(item);
        group.total_quantity += item.quantity;
        group.total_taxable_value += item.taxable_value;
        group.total_cgst_amount += item.cgst_amount;
        group.total_sgst_amount += item.sgst_amount;
        group.total_discount += item.discount;
        group.total_invoice_value += item.invoice_value;
      });

      // Finalize grouped data
      const finalGroupedData = Array.from(groupedData.values()).map(group => {
        const productNames = group.products.map(p => p.product_name);
        const hsnCodes = group.products.map(p => p.hsn_code).filter(Boolean);
        const productTypes = group.products.map(p => p.product_type);

        group.combined_product_names = productNames.join(', ');
        group.combined_hsn_codes = [...new Set(hsnCodes)].join(', ');
        group.combined_product_types = [...new Set(productTypes)].join(', ');

        // Debug logging for combined types
        console.log(
          `🔍 SalesHistoryTab - Order ${group.order_id} combined types:`,
          {
            individual_types: productTypes,
            unique_types: [...new Set(productTypes)],
            combined: group.combined_product_types,
          }
        );

        // Find most common GST percentage
        if (group.products.length > 0) {
          const gstRates = group.products.map(p => p.gst_percentage);
          const rateCounts = gstRates.reduce(
            (acc, rate) => {
              acc[rate] = (acc[rate] || 0) + 1;
              return acc;
            },
            {} as Record<number, number>
          );
          const mostCommonRate = Object.keys(rateCounts).reduce((a, b) =>
            rateCounts[Number(a)] > rateCounts[Number(b)] ? a : b
          );
          group.gst_percentage = Number(mostCommonRate);
        }

        return group;
      });

      console.log(
        `Grouped data into ${finalGroupedData.length} orders for display.`
      );
      setGroupedSalesData(finalGroupedData);
      setFilteredData(finalGroupedData);
    } catch (err) {
      console.error('An unexpected error occurred:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`An unexpected error occurred: ${errorMessage}`);
      toast.error('An unexpected error occurred while fetching sales data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount and when date range changes
  useEffect(() => {
    fetchSalesData();
  }, [dateRange.startDate, dateRange.endDate]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format currency values
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    const roundedValue = Math.round(value);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(roundedValue);
  };

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle sorting for grouped data
  const handleSort = (column: keyof GroupedSalesItem) => {
    setSortBy(prev => ({
      column,
      direction:
        prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Handle search for grouped data
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);

    // Apply the search filter
    if (searchValue.trim() === '') {
      // Apply initial sorting by date (newest first)
      const sortedData = [...groupedSalesData].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Newest first
      });
      setFilteredData(sortedData);
    } else {
      const filtered = groupedSalesData.filter(
        item =>
          item.combined_product_names.toLowerCase().includes(searchValue) ||
          item.combined_hsn_codes.toLowerCase().includes(searchValue) ||
          item.combined_product_types.toLowerCase().includes(searchValue) ||
          item.order_id.toLowerCase().includes(searchValue)
      );

      // Sort filtered results by date (newest first)
      const sortedFiltered = filtered.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Newest first
      });

      setFilteredData(sortedFiltered);
    }

    setPage(0); // Reset to first page
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value,
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
        'Serial No.',
        'Date',
        'Product Names',
        'HSN Codes',
        'Product Types',
        'Total Qty.',
        'Taxable Value',
        'GST %',
        'Discount %',
        'Taxable After Discount',
        'CGST',
        'SGST',
        'Total Value',
        'Order ID',
      ];
      const dataRows = tableData.map(item => [
        item.serial_no,
        formatDate(item.date),
        item.combined_product_names,
        item.combined_hsn_codes || 'N/A',
        item.combined_product_types || 'N/A',
        item.total_quantity,
        item.total_taxable_value,
        Number(item.gst_percentage ?? 0).toFixed(2) + '%',
        Number(item.discount_percentage ?? 0).toFixed(2) + '%',
        item.taxable_after_discount ?? 0,
        item.total_cgst_amount,
        item.total_sgst_amount,
        item.total_invoice_value,
        item.order_id,
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
  const totals = tableData.reduce(
    (sum, item) => {
      // Helper to safely parse and sum, treating non-numbers as 0
      const safeAdd = (currentSum: number, value: any): number => {
        const num = parseFloat(String(value));
        return currentSum + (isNaN(num) ? 0 : num);
      };

      return {
        quantity: safeAdd(sum.quantity, item.total_quantity),
        taxableValue: safeAdd(sum.taxableValue, item.total_taxable_value),
        taxableAfterDiscount: safeAdd(
          sum.taxableAfterDiscount,
          item.taxable_after_discount
        ),
        cgst: safeAdd(sum.cgst, item.total_cgst_amount),
        sgst: safeAdd(sum.sgst, item.total_sgst_amount),
        totalValue: safeAdd(sum.totalValue, item.total_invoice_value),
      };
    },
    {
      quantity: 0,
      taxableValue: 0,
      taxableAfterDiscount: 0,
      cgst: 0,
      sgst: 0,
      totalValue: 0,
    }
  );

  // Helper for rendering sortable table headers
  const renderSortableHeader = (
    column: keyof GroupedSalesItem | null,
    label: string // Make column possibly null
  ) => (
    <HeaderCell
      onClick={() => column && handleSort(column)} // Check if column is not null before calling handleSort
      style={{ cursor: column ? 'pointer' : 'default' }} // Only show pointer if sortable
    >
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {label}
        {sortBy.column === column &&
          (sortBy.direction === 'asc' ? (
            <ArrowUpwardIcon fontSize='small' sx={{ ml: 0.5 }} />
          ) : (
            <ArrowDownwardIcon fontSize='small' sx={{ ml: 0.5 }} />
          ))}
      </Box>
    </HeaderCell>
  );

  return (
    <Box sx={{ p: 0 }}>
      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder='Search by product name, HSN code, product type, or order ID'
              value={searchTerm}
              onChange={handleSearch}
              variant='outlined'
              size='small'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label='Start Date'
                type='date'
                size='small'
                name='startDate'
                value={dateRange.startDate}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label='End Date'
                type='date'
                size='small'
                name='endDate'
                value={dateRange.endDate}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
              />

              <Button
                variant='outlined'
                size='small'
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
                variant='outlined'
                size='small'
                startIcon={<RefreshIcon />}
                onClick={() => {
                  console.log(
                    '🔄 Manual refresh triggered - fetching products only'
                  );
                  fetchSalesData();
                }}
                disabled={isLoading}
              >
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer
          sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}
        >
          <Table stickyHeader aria-label='sales history table'>
            <TableHead>
              <TableRow>
                <TableCell padding='checkbox' /> {/* For expand/collapse */}
                {renderSortableHeader('serial_no', 'S.No')}
                {renderSortableHeader('date', 'Date')}
                {renderSortableHeader(
                  'combined_product_names',
                  'Product Names'
                )}
                {renderSortableHeader('combined_hsn_codes', 'HSN Codes')}
                {renderSortableHeader(
                  'combined_product_types',
                  'Product Types'
                )}
                {renderSortableHeader('total_quantity', 'Total Qty.')}
                {renderSortableHeader('total_taxable_value', 'Taxable Value')}
                {renderSortableHeader('gst_percentage', 'GST %')}
                {renderSortableHeader(null, 'Discount %')}
                {renderSortableHeader(null, 'Taxable After Discount')}
                {renderSortableHeader('total_cgst_amount', 'CGST')}
                {renderSortableHeader('total_sgst_amount', 'SGST')}
                {renderSortableHeader('total_invoice_value', 'Total Value')}
                {renderSortableHeader('order_id', 'Order ID')}
                {renderSortableHeader('invoice_number', 'Invoice Number')}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={16} align='center' sx={{ py: 3 }}>
                    <CircularProgress />
                    <Typography variant='body2' sx={{ mt: 1 }}>
                      Loading sales data...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredData.length > 0 ? (
                tableData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(row => (
                    <TableRow
                      key={row.order_id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      hover
                    >
                      <TableCell padding='checkbox' />
                      <TableCell align='center'>{row.serial_no}</TableCell>
                      <TableCell align='center'>
                        {formatDate(row.date)}
                      </TableCell>
                      <TableCell align='left'>
                        {row.combined_product_names}
                      </TableCell>
                      <TableCell align='center'>
                        {row.combined_hsn_codes}
                      </TableCell>
                      <TableCell align='center'>
                        {row.combined_product_types || 'N/A'}
                      </TableCell>
                      <TableCell align='center'>{row.total_quantity}</TableCell>
                      <TableCell align='right'>
                        {formatCurrency(row.total_taxable_value)}
                      </TableCell>
                      <TableCell align='right'>
                        {Number(row.gst_percentage ?? 0).toFixed(2)}%
                      </TableCell>
                      <TableCell align='right'>
                        {Number(row.discount_percentage ?? 0).toFixed(2)}%
                      </TableCell>
                      <TableCell align='right'>
                        {formatCurrency(row.taxable_after_discount)}
                      </TableCell>
                      <TableCell align='right'>
                        {formatCurrency(row.total_cgst_amount)}
                      </TableCell>
                      <TableCell align='right'>
                        {formatCurrency(row.total_sgst_amount)}
                      </TableCell>
                      <TableCell align='right'>
                        {formatCurrency(row.total_invoice_value)}
                      </TableCell>
                      <TableCell align='center'>
                        <Tooltip title={row.order_id}>
                          <Typography
                            variant='body2'
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.75rem',
                              maxWidth: 80,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {row.order_id}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align='center'>
                        <Typography
                          variant='body2'
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                          }}
                        >
                          {row.invoice_number || row.invoice_no || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={16} align='center' sx={{ py: 3 }}>
                    <Typography variant='body1'>No sales data found</Typography>
                    <Typography
                      variant='body2'
                      color='textSecondary'
                      sx={{ mt: 1 }}
                    >
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
                  <TableCell
                    colSpan={6}
                    align='right'
                    sx={{ fontWeight: 'bold' }}
                  >
                    Totals:
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    {totals.quantity}
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(totals.taxableValue)}
                  </TableCell>
                  <TableCell
                    align='right'
                    sx={{ fontWeight: 'bold' }}
                  ></TableCell>
                  <TableCell
                    align='right'
                    sx={{ fontWeight: 'bold' }}
                  ></TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(totals.taxableAfterDiscount)}
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(totals.cgst)}
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(totals.sgst)}
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(totals.totalValue)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component='div'
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

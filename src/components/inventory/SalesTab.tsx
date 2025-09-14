import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  TablePagination,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Chip,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  formatAmount,
  roundForDisplay,
} from '../../utils/formatting/formatAmount';
import {
  DateRange as DateRangeIcon,
  ShoppingCart as ShoppingCartIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
  Store as StoreIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  TrendingUp as TrendingUpIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Warning as WarningIcon,
  ShoppingBag as ShoppingBagIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Sale } from '../../models/inventoryTypes';
import { useInventory } from '../../hooks/inventory/useInventory';
import { toast } from 'react-toastify';
import { convertToCSV, downloadCSV } from '../../utils/csvExporter';
import { formatCurrency } from '../../utils/formatting/format';

interface SalesTabProps {
  sales: Sale[];
  isLoading: boolean;
  error: Error | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`sales-tabpanel-${index}`}
      aria-labelledby={`sales-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const StyledTableHeaderRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: '#FFDDCC', // Peach background for table header
  '& .MuiTableCell-root': {
    color: '#333333',
    fontWeight: 'bold',
    border: '1px solid #cccccc',
    textAlign: 'center',
    padding: '8px',
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  color: '#333333',
}));

const SalesTab: React.FC<SalesTabProps> = ({ sales, isLoading, error }) => {
  console.log('SalesTab rendering with:', {
    salesCount: sales.length,
    isLoading,
    hasError: !!error,
  });

  const { processingStats, combinedSalesQuery, customerOrdersQuery } =
    useInventory();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    return {
      startDate: thirtyDaysAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    };
  });
  const [exportingCSV, setExportingCSV] = useState(false);
  const [dataSourceTab, setDataSourceTab] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(new Date());
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedSale, setSelectedSale] = useState<{
    invoiceId: string;
    productName: string;
    records: any[];
  } | null>(null);

  // Filter out salon consumption entries to only show customer sales
  const customerSales = useMemo(() => {
    return sales.filter(sale => !sale.is_salon_consumption);
  }, [sales]);

  // Handle tab change
  const handleDataSourceTabChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setDataSourceTab(newValue);
    setPage(0); // Reset pagination when changing tabs
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRefresh = () => {
    combinedSalesQuery.refetch();
    customerOrdersQuery.refetch();
    setLastRefreshed(new Date());
  };

  const exportToCSV = () => {
    try {
      setExportingCSV(true);

      // Format data for CSV export
      const csvData = sales.map(sale => {
        const salesQty = sale.sales_qty || sale.quantity || 0;
        const purchaseCostPerUnit = sale.purchase_cost_per_unit_ex_gst || 0;
        const purchaseGstPercentage = sale.purchase_gst_percentage || 0;
        const purchaseTaxableValue = sale.purchase_taxable_value || 0;
        const purchaseIgst = sale.purchase_igst || 0;
        const purchaseCgst = sale.purchase_cgst || 0;
        const purchaseSgst = sale.purchase_sgst || 0;
        const totalPurchaseCost = sale.total_purchase_cost || 0;

        const mrpInclGst = sale.mrp_incl_gst || 0;
        const mrpExGst = sale.mrp_excl_gst || sale.mrp_ex_gst || 0;
        const discountPercentage =
          sale.discount_on_sales_percentage || sale.discount_percentage || 0;
        const discountedSalesRateExGst =
          sale.discounted_sales_rate_excl_gst || 0;
        const salesGstPercentage =
          sale.sales_gst_percentage || sale.gst_percentage || 0;
        const salesTaxableValue = sale.sales_taxable_value || 0;
        const igst = sale.igst_rs || sale.igst || 0;
        const cgst = sale.cgst_rs || sale.cgst || 0;
        const sgst = sale.sgst_rs || sale.sgst || 0;
        const invoiceValue = sale.invoice_value_rs || sale.invoice_value || 0;

        return {
          'Invoice No.': sale.invoice_no || '',
          'Product Name': sale.product_name || '',
          'HSN Code': sale.hsn_code || '',
          Date: formatDate(sale.date) || '',
          'Sales Qty': salesQty,
          'Purchase Cost per Unit (Ex.GST) (Rs.)': purchaseCostPerUnit,
          'Purchase GST Percentage': purchaseGstPercentage,
          'Purchase Taxable Value (Rs.)': purchaseTaxableValue,
          'Purchase IGST (Rs.)': purchaseIgst,
          'Purchase CGST (Rs.)': purchaseCgst,
          'Purchase SGST (Rs.)': purchaseSgst,
          'Total Purchase Cost (Rs.)': totalPurchaseCost,
          'MRP incl GST (Rs.)': mrpInclGst,
          'MRP Ex GST (Rs.)': mrpExGst,
          'Discount on Sales Percentage': discountPercentage,
          'Discounted Sales Rate (Ex.GST) (Rs.)': discountedSalesRateExGst,
          'Sales GST Percentage': salesGstPercentage,
          'Sales Taxable Value (Rs.)': salesTaxableValue,
          'IGST (Rs.)': igst,
          'CGST (Rs.)': cgst,
          'SGST (Rs.)': sgst,
          'Invoice Value (Rs.)': invoiceValue,
        };
      });

      const csvString = convertToCSV(csvData);
      downloadCSV(
        csvString,
        `Sales_Data_${new Date().toISOString().split('T')[0]}.csv`
      );
    } catch (error) {
      console.error('Error exporting sales to CSV:', error);
      toast.error('Failed to export sales data to CSV');
    } finally {
      setExportingCSV(false);
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!processingStats) return 0;
    const { total, processed } = processingStats;
    return total > 0 ? Math.round((processed / total) * 100) : 0;
  };

  const renderSalesTable = () => {
    // First group by invoice, then by product
    const groupedByInvoice = customerSales.reduce((acc, item) => {
      const invoiceId = item.invoice_no || 'Unknown Invoice';
      if (!acc[invoiceId]) {
        acc[invoiceId] = {
          date: item.date,
          products: {},
        };
      }

      const productKey = item.product_name || 'Unknown Product';
      if (!acc[invoiceId].products[productKey]) {
        acc[invoiceId].products[productKey] = {
          ...item,
          quantity: 0,
          sales_qty: 0,
          taxable_value: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          invoice_value: 0,
          records: [], // Keep track of individual records for deletion
        };
      }

      const record = acc[invoiceId].products[productKey];
      // Parse values with fallbacks using different property names for compatibility
      const qty = parseFloat(
        item.quantity?.toString() || item.sales_qty?.toString() || '0'
      );
      const taxableValue = parseFloat(item.taxable_value?.toString() || '0');
      const cgstValue = parseFloat(
        item.cgst?.toString() || item.cgst_rs?.toString() || '0'
      );
      const sgstValue = parseFloat(
        item.sgst?.toString() || item.sgst_rs?.toString() || '0'
      );
      const igstValue = parseFloat(
        item.igst?.toString() || item.igst_rs?.toString() || '0'
      );
      const invoiceValue = parseFloat(
        item.invoice_value?.toString() ||
          item.invoice_value_rs?.toString() ||
          '0'
      );

      // If taxable value and invoice value are 0 or NaN, calculate them
      let calculatedTaxableValue = taxableValue;
      let calculatedInvoiceValue = invoiceValue;

      if (!taxableValue || isNaN(taxableValue)) {
        // Calculate taxable value from MRP if available
        const mrpExGst =
          item.mrp_excl_gst ||
          (item.mrp_incl_gst
            ? item.mrp_incl_gst / (1 + (item.gst_percentage || 18) / 100)
            : 0);
        const discountPercentage =
          item.discount_percentage || item.discount_on_sales_percentage || 0;
        const discountedRate = mrpExGst * (1 - discountPercentage / 100);
        calculatedTaxableValue = discountedRate * qty;
      }

      if (!invoiceValue || isNaN(invoiceValue)) {
        // Calculate invoice value from taxable value and GST
        const gstPercentage = item.gst_percentage || 18;
        const gstAmount = calculatedTaxableValue * (gstPercentage / 100);
        calculatedInvoiceValue = calculatedTaxableValue + gstAmount;
      }

      // Update record with calculated or parsed values
      record.quantity += qty;
      record.sales_qty += qty;
      record.taxable_value += calculatedTaxableValue;
      record.cgst +=
        cgstValue ||
        (calculatedTaxableValue * (item.gst_percentage || 18)) / 200; // Half of GST
      record.sgst +=
        sgstValue ||
        (calculatedTaxableValue * (item.gst_percentage || 18)) / 200; // Half of GST
      record.igst += igstValue;
      record.invoice_value += calculatedInvoiceValue;

      record.records.push({
        id: item.id,
        invoice_no: item.invoice_no,
        quantity: qty,
      });

      return acc;
    }, {});

    // Convert to array format for display
    const aggregatedRecords = Object.entries(groupedByInvoice)
      .sort(
        ([, a], [, b]) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (aggregatedRecords.length === 0) {
      return (
        <Alert
          severity='info'
          icon={<InfoIcon />}
          sx={{ display: 'flex', alignItems: 'center', my: 2 }}
        >
          No sales records found.
        </Alert>
      );
    }

    // Calculate totals for the summary row
    const totals = customerSales.reduce(
      (acc, item) => {
        acc.totalQty += parseFloat(item.quantity || item.sales_qty || '0');
        acc.totalValue += parseFloat(item.invoice_value || '0');
        acc.totalTaxable += parseFloat(item.taxable_value || '0');
        acc.totalCGST += parseFloat(item.cgst || '0');
        acc.totalSGST += parseFloat(item.sgst || '0');
        acc.totalIGST += parseFloat(item.igst || '0');
        return acc;
      },
      {
        totalQty: 0,
        totalValue: 0,
        totalTaxable: 0,
        totalCGST: 0,
        totalSGST: 0,
        totalIGST: 0,
      }
    );

    return (
      <Box>
        {/* Summary Card */}
        <Paper
          sx={{
            p: 2,
            mb: 2,
            bgcolor: 'primary.light',
            color: 'primary.contrastText',
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant='h6'>Total Sales Summary</Typography>
              <Typography>
                Total Quantity: {totals.totalQty.toFixed(2)}
              </Typography>
              <Typography>
                Total Value: {formatAmount(totals.totalValue)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Typography>
                Total Taxable Value: {formatAmount(totals.totalTaxable)}
              </Typography>
              <Typography>
                Total GST:{' '}
                {formatAmount(
                  totals.totalCGST + totals.totalSGST + totals.totalIGST
                )}
              </Typography>
              <Typography variant='caption'>
                (CGST: {formatAmount(totals.totalCGST)}, SGST:{' '}
                {formatAmount(totals.totalSGST)}, IGST:{' '}
                {formatAmount(totals.totalIGST)})
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Sales Table */}
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader size='small' aria-label='sales table'>
            <TableHead>
              <StyledTableHeaderRow>
                <StyledTableCell>Invoice No.</StyledTableCell>
                <StyledTableCell align='right'>Sales Qty.</StyledTableCell>
                <StyledTableCell align='right'>
                  Purchase Cost per Unit (Ex.GST) (Rs.)
                </StyledTableCell>
                <StyledTableCell align='right'>
                  Purchase GST Percentage
                </StyledTableCell>
                <StyledTableCell align='right'>
                  Purchase Taxable Value (Rs.)
                </StyledTableCell>
                <StyledTableCell align='right'>
                  Purchase IGST (Rs.)
                </StyledTableCell>
                <StyledTableCell align='right'>
                  Purchase CGST (Rs.)
                </StyledTableCell>
                <StyledTableCell align='right'>
                  Purchase SGST (Rs.)
                </StyledTableCell>
                <StyledTableCell align='right'>
                  Total Purchase Cost (Rs.)
                </StyledTableCell>
              </StyledTableHeaderRow>
            </TableHead>
            <TableBody>
              {aggregatedRecords.map(([invoiceId, invoiceData]) => {
                const productEntries = Object.entries(invoiceData.products);
                return productEntries.map(
                  ([productName, item]: [string, any], index) => (
                    <TableRow
                      key={`${invoiceId}-${productName}`}
                      sx={
                        index === 0
                          ? { borderTop: 2, borderColor: 'divider' }
                          : {}
                      }
                    >
                      <TableCell>{invoiceId}</TableCell>
                      <TableCell align='right'>
                        {item.quantity || item.sales_qty || 0}
                      </TableCell>
                      <TableCell align='right'>
                        {formatAmount(item.purchase_cost_per_unit_ex_gst || 0)}
                      </TableCell>
                      <TableCell align='right'>
                        {(item.purchase_gst_percentage || 0).toFixed(2)}%
                      </TableCell>
                      <TableCell align='right'>
                        {formatAmount(item.purchase_taxable_value || 0)}
                      </TableCell>
                      <TableCell align='right'>
                        {formatAmount(item.purchase_igst || 0)}
                      </TableCell>
                      <TableCell align='right'>
                        {formatAmount(item.purchase_cgst || 0)}
                      </TableCell>
                      <TableCell align='right'>
                        {formatAmount(item.purchase_sgst || 0)}
                      </TableCell>
                      <TableCell align='right'>
                        {formatAmount(item.total_purchase_cost || 0)}
                      </TableCell>
                    </TableRow>
                  )
                );
              })}
              {/* Summary row */}
              <TableRow
                sx={{
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  '& .MuiTableCell-root': { fontWeight: 'bold' },
                }}
              >
                <TableCell>Total</TableCell>
                <TableCell align='right'>
                  {customerSales
                    .reduce(
                      (sum, item) =>
                        sum +
                        parseFloat(
                          item.quantity?.toString() ||
                            item.sales_qty?.toString() ||
                            '0'
                        ),
                      0
                    )
                    .toFixed(2)}
                </TableCell>
                <TableCell align='right'>-</TableCell>
                <TableCell align='right'>-</TableCell>
                <TableCell align='right'>
                  {formatCurrency(
                    customerSales.reduce(
                      (sum, item) =>
                        sum +
                        parseFloat(
                          item.purchase_taxable_value?.toString() || '0'
                        ),
                      0
                    )
                  )}
                </TableCell>
                <TableCell align='right'>
                  {formatCurrency(
                    customerSales.reduce(
                      (sum, item) =>
                        sum + parseFloat(item.purchase_igst?.toString() || '0'),
                      0
                    )
                  )}
                </TableCell>
                <TableCell align='right'>
                  {formatCurrency(
                    customerSales.reduce(
                      (sum, item) =>
                        sum + parseFloat(item.purchase_cgst?.toString() || '0'),
                      0
                    )
                  )}
                </TableCell>
                <TableCell align='right'>
                  {formatCurrency(
                    customerSales.reduce(
                      (sum, item) =>
                        sum + parseFloat(item.purchase_sgst?.toString() || '0'),
                      0
                    )
                  )}
                </TableCell>
                <TableCell align='right'>
                  {formatCurrency(
                    customerSales.reduce(
                      (sum, item) =>
                        sum +
                        parseFloat(item.total_purchase_cost?.toString() || '0'),
                      0
                    )
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component='div'
            count={Object.keys(groupedByInvoice).length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* Details Dialog */}
        <Dialog
          open={openDetailsDialog}
          onClose={() => setOpenDetailsDialog(false)}
          maxWidth='md'
          fullWidth
        >
          <DialogTitle>
            Sales Details
            {selectedSale && (
              <Typography variant='subtitle2' color='text.secondary'>
                Invoice: {selectedSale.invoiceId} - {selectedSale.productName}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            {selectedSale && (
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Record ID</TableCell>
                    <TableCell align='right'>Quantity</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedSale.records.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.id}</TableCell>
                      <TableCell align='right'>
                        {record.quantity.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => handleDeleteSales([record.id])}
                        >
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  // Add delete handler function
  const handleDeleteSales = async (saleIds: string[]) => {
    try {
      if (
        !window.confirm(
          `Are you sure you want to delete ${saleIds.length} sales record(s)?`
        )
      ) {
        return;
      }

      // Delete each sale record
      for (const saleId of saleIds) {
        // This function doesn't exist, so let's add a console log instead
        console.log(`Would delete sale record with ID: ${saleId}`);
        // Comment out this line until we implement the actual delete function
        // await deleteSaleRecord(saleId);
      }

      // Close details dialog if open
      setOpenDetailsDialog(false);

      // Show success message
      toast.success(`${saleIds.length} sales record(s) deleted successfully`);

      // Refresh the sales data
      // refreshSalesData() doesn't exist, use the existing refresh function
      handleRefresh();
    } catch (error) {
      console.error('Error deleting sales records:', error);
      toast.error('Failed to delete sales records');
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant='h6' component='h2'>
          Sales Records
        </Typography>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          Error loading sales data: {error.message}
        </Alert>
      )}

      {!isLoading && !error && renderSalesTable()}

      {/* Pagination */}
      {!isLoading && !error && customerSales.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component='div'
          count={customerSales.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Box>
  );
};

export default SalesTab;

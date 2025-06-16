import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Button,
  IconButton,
  Snackbar
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useInventory } from '../../hooks/useInventory';
import { BalanceStock } from '../../models/inventoryTypes';
import { convertToCSV, downloadCSV } from '../../utils';
import { toast } from 'react-toastify';
import DeleteButton from '../DeleteButton';

interface ProductStockSummary {
  id: string;
  product_name: string;
  hsn_code?: string;
  units?: string;
  purchased_quantity: number;
  sold_quantity: number;
  consumed_quantity: number;
  balance_quantity: number;
  taxable_value: number;
  igst: number;
  cgst: number;
  sgst: number;
  invoice_value: number;
  reference_id?: string;
}

interface BalanceStockTabProps {
  balanceStock: BalanceStock[];
  isLoading: boolean;
  error: Error | null;
  recalculateBalanceStock?: () => Promise<any>;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.primary.dark 
    : theme.palette.primary.light,
  color: theme.palette.common.white,
}));

const StyledTableHeaderRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: '#FFFF88', // Yellow background for table header
  '& .MuiTableCell-root': {
    color: '#000000',
    fontWeight: 'bold',
    border: '1px solid #cccccc',
    textAlign: 'center',
    padding: '8px',
  }
}));

const StyledDataCell = styled(TableCell)(({ theme }) => ({
  border: '1px solid #dddddd',
  padding: '8px',
  textAlign: 'right', // Right align for numerical values
}));

const BalanceStockTab: React.FC<BalanceStockTabProps> = ({ balanceStock, isLoading, error, recalculateBalanceStock }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [stockSummary, setStockSummary] = useState<ProductStockSummary[]>([]);
  const { purchasesQuery, salesQuery, consumptionQuery, deleteProduct } = useInventory();
  const [isDeleting, setIsDeleting] = useState(false);

  // Generate the summary data that includes purchases, sales, consumption, and balance quantities
  useEffect(() => {
    const purchases = purchasesQuery?.data || [];
    const sales = salesQuery?.data || [];
    const consumption = consumptionQuery?.data || [];
    
    // Create a map to aggregate by product
    const productMap = new Map<string, ProductStockSummary>();
    
    // Process purchases
    purchases.forEach(purchase => {
      const rawName = purchase.product_name || 'Unknown Product';
      const productName = rawName.trim();
      if (!productMap.has(productName)) {
        productMap.set(productName, {
          id: purchase.id || `purchase-${Date.now()}-${Math.random()}`,
          product_name: productName,
          hsn_code: purchase.hsn_code,
          units: purchase.units,
          purchased_quantity: 0,
          sold_quantity: 0,
          consumed_quantity: 0,
          balance_quantity: 0,
          taxable_value: 0,
          igst: 0,
          cgst: 0,
          sgst: 0,
          invoice_value: 0,
          reference_id: (purchase as any).order_id || purchase.id
        });
      }
      
      const record = productMap.get(productName)!;
      record.purchased_quantity += purchase.purchase_qty || 0;
      record.taxable_value += purchase.purchase_taxable_value || purchase.taxable_value || 0;
      record.igst += purchase.purchase_igst || purchase.igst || 0;
      record.cgst += purchase.purchase_cgst || purchase.cgst || 0;
      record.sgst += purchase.purchase_sgst || purchase.sgst || 0;
      record.invoice_value += purchase.purchase_invoice_value_rs || purchase.invoice_value || 0;
      // Update reference_id with the latest order_id if available
      if ((purchase as any).order_id) {
        record.reference_id = (purchase as any).order_id;
      }
    });
    
    // Process sales with deduplication logic
    // First, deduplicate sales by order_id and product_name to prevent duplicate counting
    const uniqueSales = new Map<string, typeof sales[0]>();
    sales.forEach(sale => {
      const rawName = sale.product_name || 'Unknown Product';
      const productName = rawName.trim();
      const orderId = (sale as any).order_id || (sale as any).invoice_no || sale.id;
      const dedupeKey = `${orderId}-${productName}`;
      
      // Only keep the first occurrence of each order_id + product_name combination
      if (!uniqueSales.has(dedupeKey)) {
        uniqueSales.set(dedupeKey, sale);
      } else {
        console.warn(`Duplicate sale detected for order ${orderId}, product ${productName}. Skipping duplicate.`);
      }
    });
    
    // Process the deduplicated sales
    Array.from(uniqueSales.values()).forEach(sale => {
      const rawName = sale.product_name || 'Unknown Product';
      const productName = rawName.trim();
      if (!productMap.has(productName)) {
        productMap.set(productName, {
          id: sale.id || `sale-${Date.now()}-${Math.random()}`,
          product_name: productName,
          hsn_code: sale.hsn_code,
          units: sale.units,
          purchased_quantity: 0,
          sold_quantity: 0,
          consumed_quantity: 0,
          balance_quantity: 0,
          taxable_value: 0,
          igst: 0,
          cgst: 0,
          sgst: 0,
          invoice_value: 0,
          reference_id: (sale as any).order_id || sale.id
        });
      }
      
      const record = productMap.get(productName)!;
      record.sold_quantity += sale.sales_qty || (sale.quantity as number | undefined) || 0;
      // Subtract sales values from balance financial values
      record.taxable_value -= sale.taxable_value || 0;
      record.igst -= sale.igst || 0;
      record.cgst -= sale.cgst || 0;
      record.sgst -= sale.sgst || 0;
      record.invoice_value -= sale.invoice_value || 0;
      // Update reference_id with the latest order_id if available
      if ((sale as any).order_id) {
        record.reference_id = (sale as any).order_id;
      }
    });
    
    // Process consumption with deduplication logic
    // First, deduplicate consumption by order_id and product_name
    const uniqueConsumption = new Map<string, typeof consumption[0]>();
    consumption.forEach(cons => {
      const rawName = cons.product_name || 'Unknown Product';
      const productName = rawName.trim();
      const orderId = (cons as any).order_id || (cons as any).requisition_voucher_no || cons.id;
      const dedupeKey = `${orderId}-${productName}`;
      
      // Only keep the first occurrence of each order_id + product_name combination
      if (!uniqueConsumption.has(dedupeKey)) {
        uniqueConsumption.set(dedupeKey, cons);
      } else {
        console.warn(`Duplicate consumption detected for order ${orderId}, product ${productName}. Skipping duplicate.`);
      }
    });
    
    // Process the deduplicated consumption
    Array.from(uniqueConsumption.values()).forEach(cons => {
      const rawName = cons.product_name || 'Unknown Product';
      const productName = rawName.trim();
      if (!productMap.has(productName)) {
        productMap.set(productName, {
          id: cons.id || `consumption-${Date.now()}-${Math.random()}`,
          product_name: productName,
          hsn_code: cons.hsn_code,
          units: cons.units,
          purchased_quantity: 0,
          sold_quantity: 0,
          consumed_quantity: 0,
          balance_quantity: 0,
          taxable_value: 0,
          igst: 0,
          cgst: 0,
          sgst: 0,
          invoice_value: 0,
          reference_id: (cons as any).order_id || cons.id
        });
      }
      
      const record = productMap.get(productName)!;
      record.consumed_quantity += cons.consumption_qty || cons.quantity || 0;
      // Subtract consumption values from balance financial values
      record.taxable_value -= cons.taxable_value || 0;
      record.igst -= cons.igst || 0;
      record.cgst -= cons.cgst || 0;
      record.sgst -= cons.sgst || 0;
      record.invoice_value -= cons.invoice_value || 0;
      // Update reference_id with the latest order_id if available
      if ((cons as any).order_id) {
        record.reference_id = (cons as any).order_id;
      }
    });
    
    // Calculate balance
    productMap.forEach(record => {
      record.balance_quantity = record.purchased_quantity - (record.sold_quantity + record.consumed_quantity);
      
      // Round financial values to 2 decimal places
      record.taxable_value = parseFloat(record.taxable_value.toFixed(2));
      record.igst = parseFloat(record.igst.toFixed(2));
      record.cgst = parseFloat(record.cgst.toFixed(2));
      record.sgst = parseFloat(record.sgst.toFixed(2));
      record.invoice_value = parseFloat(record.invoice_value.toFixed(2));
    });
    
    // Convert map to array and sort by product name
    const summaryArray = Array.from(productMap.values())
      .sort((a, b) => a.product_name.localeCompare(b.product_name));
    
    console.log(`Balance stock calculated: ${summaryArray.length} unique products, ${uniqueSales.size} unique sales, ${uniqueConsumption.size} unique consumption records`);
    
    setStockSummary(summaryArray);
  }, [purchasesQuery.data, salesQuery.data, consumptionQuery.data]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleRecalculate = async () => {
    try {
      setIsRecalculating(true);
      await recalculateBalanceStock?.();
    } catch (error) {
      console.error('Error recalculating balance stock:', error);
    } finally {
      setIsRecalculating(false);
    }
  };

  const exportToCSV = () => {
    try {
      setExportingCSV(true);
      
      // Format data for CSV export
      const csvData = stockSummary.map(item => ({
        'Product Name': item.product_name,
        'HSN Code': item.hsn_code || 'N/A',
        'Units': item.units || 'pcs',
        'Balance Qty': item.balance_quantity,
        'Reference ID': item.reference_id || 'N/A',
        'Taxable Value (Rs.)': item.taxable_value,
        'IGST (Rs.)': item.igst,
        'CGST (Rs.)': item.cgst,
        'SGST (Rs.)': item.sgst,
        'Invoice Value (Rs.)': item.invoice_value
      }));
      
      // Convert to CSV and download
      const csvString = convertToCSV(csvData);
      downloadCSV(csvString, `Balance_Stock_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Error exporting balance stock to CSV:', error);
      alert('Failed to export balance stock to CSV');
    } finally {
      setExportingCSV(false);
    }
  };

  const handleDeleteProduct = async (productName: string) => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const result = await deleteProduct(productName);
      if (result.success) {
        toast.success(`Successfully deleted "${productName}" from inventory`);
      } else {
        toast.error(`Failed to delete "${productName}": ${result.error}`);
      }
    } catch (error) {
      console.error(`Error deleting product "${productName}":`, error);
      toast.error(`An error occurred while deleting "${productName}"`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate the paginated data
  const paginatedData = stockSummary.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );

  // Format currency values for display
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '₹0.00';
    return `₹${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Balance Stock</Typography>
        <Box>
          <Button
            sx={{ mr: 2 }}
            variant="outlined"
            color="primary"
            startIcon={isRecalculating ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
            onClick={handleRecalculate}
            disabled={isRecalculating}
          >
            Recalculate
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={exportingCSV ? <CircularProgress size={20} /> : <FileDownloadIcon />}
            onClick={exportToCSV}
            disabled={exportingCSV || stockSummary.length === 0}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading balance stock data: {error.message}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {stockSummary.length === 0 ? (
            <Alert severity="info">
              No balance stock data available. Please add purchases, sales, or consumption records.
            </Alert>
          ) : (
            <Paper>
              <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="balance stock table">
                  <TableHead>
                    <StyledTableHeaderRow>
                      <StyledTableCell>Product Name</StyledTableCell>
                      <StyledTableCell align="right">Balance Qty.</StyledTableCell>
                      <StyledTableCell align="center">Reference ID</StyledTableCell>
                      <StyledTableCell align="right">Taxable Value (Rs.)</StyledTableCell>
                      <StyledTableCell align="right">IGST (Rs.)</StyledTableCell>
                      <StyledTableCell align="right">CGST (Rs.)</StyledTableCell>
                      <StyledTableCell align="right">SGST (Rs.)</StyledTableCell>
                      <StyledTableCell align="right">Invoice Value (Rs.)</StyledTableCell>
                      <StyledTableCell align="center">Actions</StyledTableCell>
                    </StyledTableHeaderRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.map((item) => (
                      <TableRow 
                        key={item.id}
                        hover
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          backgroundColor: item.balance_quantity <= 0 ? '#ffdddd' : 'inherit'
                        }}
                      >
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell align="right"
                          sx={{ 
                            fontWeight: 'bold',
                            color: item.balance_quantity <= 0 ? 'error.main' : 'success.main'
                          }}
                        >
                          {item.balance_quantity}
                        </TableCell>
                        <TableCell align="center">{item.reference_id || 'N/A'}</TableCell>
                        <TableCell align="right">{formatCurrency(item.taxable_value)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.igst)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.cgst)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.sgst)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.invoice_value)}</TableCell>
                        <TableCell align="center">
                          <DeleteButton
                            onDelete={() => handleDeleteProduct(item.product_name)}
                            itemName={item.product_name}
                            itemType="product"
                            disabled={isDeleting}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={stockSummary.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default BalanceStockTab;
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
  Snackbar,
  Tabs,
  Tab,
  Chip
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
import { useSupabase } from '../../hooks/useSupabase';
import { format } from 'date-fns';

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

interface StockTransaction {
  id: string;
  created_at: string;
  product_name: string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  transaction_type: string;
  source: string;
  source_type: string;
  display_type: string;
  notes: string;
}

interface BalanceStockTabProps {
  balanceStock: BalanceStock[];
  isLoading: boolean;
  error: Error | null;
  recalculateBalanceStock: () => Promise<void>;
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`balance-stock-tabpanel-${index}`}
      aria-labelledby={`balance-stock-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const BalanceStockTab: React.FC<BalanceStockTabProps> = ({ balanceStock, isLoading, error, recalculateBalanceStock }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { supabase } = useSupabase();

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRecalculate = async () => {
    if (isRecalculating) return;
    setIsRecalculating(true);
    try {
      await recalculateBalanceStock();
      toast.success('Balance stock recalculated successfully');
    } catch (error) {
      console.error('Error recalculating balance stock:', error);
      toast.error('Failed to recalculate balance stock');
    } finally {
      setIsRecalculating(false);
    }
  };

  // Fetch stock transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoadingTransactions(true);
      try {
        const { data, error } = await supabase
          .from('vw_stock_transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setStockTransactions(data || []);
      } catch (error) {
        console.error('Error fetching stock transactions:', error);
        toast.error('Failed to load stock transactions');
      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [supabase]);

  const getTransactionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'addition':
      case 'increment':
        return 'success';
      case 'reduction':
      case 'decrement':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy hh:mm a');
    } catch (error) {
      return dateStr;
    }
  };

  const exportToCSV = async () => {
    try {
      setExportingCSV(true);
      
      // Format data for CSV export
      const csvData = balanceStock.map(item => ({
        'Product Name': item.product_name,
        'HSN Code': item.hsn_code || 'N/A',
        'Units': item.units || 'pcs',
        'Balance Qty': item.balance_qty,
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
      toast.error('Failed to export balance stock to CSV');
    } finally {
      setExportingCSV(false);
    }
  };

  const handleDeleteProduct = async (productName: string) => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const { data: product } = await supabase
        .from('product_master')
        .select('id')
        .eq('name', productName)
        .single();

      if (!product) {
        throw new Error('Product not found');
      }

      const { error: deleteError } = await supabase
        .from('product_master')
        .delete()
        .eq('id', product.id);

      if (deleteError) throw deleteError;
      
      toast.success(`Successfully deleted "${productName}" from inventory`);
      // Trigger a refresh of the balance stock data
      recalculateBalanceStock();
    } catch (error) {
      console.error(`Error deleting product "${productName}":`, error);
      toast.error(`Failed to delete "${productName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleChangeTab} aria-label="balance stock tabs">
          <Tab label="Current Stock" />
          <Tab label="Stock History" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Current Stock Levels</Typography>
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
              disabled={exportingCSV || balanceStock.length === 0}
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
            {balanceStock.length === 0 ? (
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
                      {balanceStock
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((item) => (
                          <TableRow key={item.id}>
                            <StyledDataCell component="th" scope="row" align="left">
                              {item.product_name}
                            </StyledDataCell>
                            <StyledDataCell align="right">{item.balance_qty}</StyledDataCell>
                            <StyledDataCell align="center">{item.reference_id || '-'}</StyledDataCell>
                            <StyledDataCell align="right">{item.taxable_value?.toFixed(2)}</StyledDataCell>
                            <StyledDataCell align="right">{item.igst?.toFixed(2)}</StyledDataCell>
                            <StyledDataCell align="right">{item.cgst?.toFixed(2)}</StyledDataCell>
                            <StyledDataCell align="right">{item.sgst?.toFixed(2)}</StyledDataCell>
                            <StyledDataCell align="right">{item.invoice_value?.toFixed(2)}</StyledDataCell>
                            <StyledDataCell align="center">
                              <DeleteButton
                                onDelete={() => handleDeleteProduct(item.product_name)}
                                disabled={isDeleting}
                                confirmMessage={`Are you sure you want to delete "${item.product_name}" from inventory?`}
                              />
                            </StyledDataCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={balanceStock.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Paper>
            )}
          </>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Stock Transaction History</Typography>
        </Box>

        {loadingTransactions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper>
            <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="stock transactions table">
                <TableHead>
                  <StyledTableHeaderRow>
                    <StyledTableCell>Date & Time</StyledTableCell>
                    <StyledTableCell>Product Name</StyledTableCell>
                    <StyledTableCell align="center">Transaction Type</StyledTableCell>
                    <StyledTableCell align="right">Quantity</StyledTableCell>
                    <StyledTableCell align="right">Previous Stock</StyledTableCell>
                    <StyledTableCell align="right">New Stock</StyledTableCell>
                    <StyledTableCell>Source</StyledTableCell>
                    <StyledTableCell>Notes</StyledTableCell>
                  </StyledTableHeaderRow>
                </TableHead>
                <TableBody>
                  {stockTransactions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((transaction) => (
                      <TableRow key={transaction.id}>
                        <StyledDataCell align="left">
                          {formatDateTime(transaction.created_at)}
                        </StyledDataCell>
                        <StyledDataCell align="left">{transaction.product_name}</StyledDataCell>
                        <StyledDataCell align="center">
                          <Chip 
                            label={transaction.transaction_type} 
                            color={getTransactionTypeColor(transaction.transaction_type)}
                            size="small"
                          />
                        </StyledDataCell>
                        <StyledDataCell align="right">{transaction.quantity}</StyledDataCell>
                        <StyledDataCell align="right">{transaction.previous_stock}</StyledDataCell>
                        <StyledDataCell align="right">{transaction.new_stock}</StyledDataCell>
                        <StyledDataCell align="left">{transaction.source}</StyledDataCell>
                        <StyledDataCell align="left">{transaction.notes}</StyledDataCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={stockTransactions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        )}
      </TabPanel>
    </Box>
  );
};

export default BalanceStockTab;
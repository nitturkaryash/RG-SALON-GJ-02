import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Button, 
  Checkbox, 
  Chip,
  FormControlLabel, 
  IconButton, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Tooltip,
  Typography, 
  useTheme 
} from '@mui/material';
import { 
  FileDownload as FileDownloadIcon, 
  KeyboardArrowDown as KeyboardArrowDownIcon, 
  KeyboardArrowUp as KeyboardArrowUpIcon,
  EventNote as EventNoteIcon,
  ReceiptLong as ReceiptIcon,
  LocalMall as ProductIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { 
  formatCurrency, 
  formatPercentage, 
  formatDate, 
  calculateGSTValues, 
  getPaymentMethodColor,
  getStockLevelColor
} from '../../utils/formatters';

// Define SalesItem interface with all required fields
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
  // New fields
  hsn_code?: string | null;
  product_type?: string | null;
  mrp_incl_gst?: string | null;
  discounted_sales_rate_ex_gst?: string | null;
  invoice_value?: string | null;
  igst_amount?: string | null;
  // Field to store calculated remaining stock
  remaining_stock?: number;
  current_stock_taxable_value?: number | null;
  current_stock_igst?: number | null;
  current_stock_cgst?: number | null;
  current_stock_sgst?: number | null;
  current_stock_total_value?: number | null;
}

interface SalesHistoryTableProps {
  salesData: SalesItem[];
  totalSales: number;
  totalTax: number;
  loading?: boolean;
  onExportCsv?: () => void;
}

export default function SalesHistoryTable({ 
  salesData, 
  totalSales, 
  totalTax, 
  loading = false, 
  onExportCsv 
}: SalesHistoryTableProps) {
  const theme = useTheme();
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Handle row expansion toggle
  const toggleRowExpansion = (orderId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(orderId)) {
      newExpandedRows.delete(orderId);
    } else {
      newExpandedRows.add(orderId);
    }
    setExpandedRows(newExpandedRows);
  };

  // No need to calculate remaining stock anymore as it comes from the database
  // We'll use salesData directly instead of salesDataWithRemainingStock

  // Calculate totals for all fields
  const totals = salesData.reduce((acc, item) => {
    const quantity = parseInt(item.quantity, 10) || 0;
    const taxableValue = parseFloat(item.taxable_value) || 0;
    const tax = parseFloat(item.tax) || 0;
    const discount = parseFloat(item.discount) || 0;
    const paymentAmount = parseFloat(item.payment_amount) || 0;
    const invoiceValue = parseFloat(item.invoice_value || '0') || 0;
    
    // Get GST values
    const cgstAmount = parseFloat(item.cgst_amount || '0') || 0;
    const sgstAmount = parseFloat(item.sgst_amount || '0') || 0;
    const igstAmount = parseFloat(item.igst_amount || '0') || 0;

    // Current stock and values
    const currentStock = item.current_stock || 0;
    const currentStockAmount = item.current_stock_amount || 0;
    const cCgst = item.c_cgst || 0;
    const cSgst = item.c_sgst || 0;
    const cTax = item.c_tax || 0;

    const current_stock_taxable_value = item.current_stock_taxable_value || 0;
    const current_stock_igst = item.current_stock_igst || 0;
    const current_stock_cgst = item.current_stock_cgst || 0;
    const current_stock_sgst = item.current_stock_sgst || 0;
    const current_stock_total_value = item.current_stock_total_value || 0;

    return {
      quantity: acc.quantity + quantity,
      taxableValue: acc.taxableValue + taxableValue,
      cgstAmount: acc.cgstAmount + cgstAmount,
      sgstAmount: acc.sgstAmount + sgstAmount,
      igstAmount: acc.igstAmount + igstAmount,
      tax: acc.tax + tax,
      discount: acc.discount + discount,
      paymentAmount: acc.paymentAmount + paymentAmount,
      invoiceValue: acc.invoiceValue + invoiceValue,
      currentStock: acc.currentStock + currentStock,
      currentStockAmount: acc.currentStockAmount + currentStockAmount,
      cCgst: acc.cCgst + cCgst,
      cSgst: acc.cSgst + cSgst,
      cTax: acc.cTax + cTax,
      current_stock_taxable_value: acc.current_stock_taxable_value + current_stock_taxable_value,
      current_stock_igst: acc.current_stock_igst + current_stock_igst,
      current_stock_cgst: acc.current_stock_cgst + current_stock_cgst,
      current_stock_sgst: acc.current_stock_sgst + current_stock_sgst,
      current_stock_total_value: acc.current_stock_total_value + current_stock_total_value,
    };
  }, {
    quantity: 0,
    taxableValue: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    tax: 0,
    discount: 0,
    paymentAmount: 0,
    invoiceValue: 0,
    currentStock: 0,
    currentStockAmount: 0,
    cCgst: 0,
    cSgst: 0,
    cTax: 0,
    current_stock_taxable_value: 0,
    current_stock_igst: 0,
    current_stock_cgst: 0,
    current_stock_sgst: 0,
    current_stock_total_value: 0,
  });

  // Helper function to safely format currency values
  const safeFormatCurrency = (value: string | number | null | undefined) => {
    return value !== undefined && value !== null ? formatCurrency(value) : '—';
  };

  const getGSTValues = (item: SalesItem) => {
    const taxableValue = parseFloat(item.taxable_value) || 0;
    const tax = parseFloat(item.tax) || 0;
    const cgst = item.cgst_amount ? parseFloat(item.cgst_amount) : null;
    const sgst = item.sgst_amount ? parseFloat(item.sgst_amount) : null;
    
    return calculateGSTValues(taxableValue, tax, cgst, sgst);
  };

  // Helper function to safely display date
  const safeFormatDate = (dateString: string | null | undefined) => {
    return dateString !== undefined ? formatDate(dateString) : '—';
  };

  return (
    <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden', boxShadow: 2 }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {salesData.length} Sales Records
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={showAdditionalFields}
                onChange={(e) => setShowAdditionalFields(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={<Typography variant="body2">Show All Fields</Typography>}
          />
          {onExportCsv && (
            <Button 
              variant="outlined" 
              startIcon={<FileDownloadIcon />} 
              onClick={onExportCsv}
              size="small"
            >
              Export CSV
            </Button>
          )}
        </Box>
      </Box>
      
      {/* Summary section */}
      <Box 
        sx={{ 
          p: 2, 
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">Total Items</Typography>
          <Typography variant="subtitle1" fontWeight="bold">{totals.quantity}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
          <Typography variant="subtitle1" fontWeight="bold">{formatCurrency(totals.paymentAmount)}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Total Tax</Typography>
          <Typography variant="subtitle1" fontWeight="bold">{formatCurrency(totals.tax)}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Total Discount</Typography>
          <Typography variant="subtitle1" fontWeight="bold">{formatCurrency(totals.discount)}</Typography>
        </Box>
        
        {showAdditionalFields && (
          <>
            <Box>
              <Typography variant="caption" color="text.secondary">Total Invoice Value</Typography>
              <Typography variant="subtitle1" fontWeight="bold">{formatCurrency(totals.invoiceValue)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Current Stock</Typography>
              <Typography variant="subtitle1" fontWeight="bold">{totals.currentStock.toFixed(0)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Current Stock Value</Typography>
              <Typography variant="subtitle1" fontWeight="bold">{formatCurrency(totals.currentStockAmount)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Current Stock Tax</Typography>
              <Typography variant="subtitle1" fontWeight="bold">{formatCurrency(totals.cTax)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Taxable Value</Typography>
              <Typography variant="subtitle1" fontWeight="bold">{formatCurrency(totals.current_stock_taxable_value)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">IGST (Rs.)</Typography>
              <Typography variant="subtitle1" fontWeight="bold">{formatCurrency(totals.current_stock_igst)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">CGST (Rs.)</Typography>
              <Typography variant="subtitle1" fontWeight="bold">{formatCurrency(totals.current_stock_cgst)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">SGST (Rs.)</Typography>
              <Typography variant="subtitle1" fontWeight="bold">{formatCurrency(totals.current_stock_sgst)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Total Value (Rs.)</Typography>
              <Typography variant="subtitle1" fontWeight="bold">{formatCurrency(totals.current_stock_total_value)}</Typography>
            </Box>
          </>
        )}
      </Box>
      
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="sales history table" size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" /> {/* For expand/collapse */}
              <TableCell sx={{ fontWeight: 'bold' }}>Serial No</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Qty</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Unit Price</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>GST %</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Taxable Value</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>CGST</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>SGST</TableCell>
              
              {showAdditionalFields && (
                <>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>IGST</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>HSN Code</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>MRP (Incl GST)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Discounted Rate</TableCell>
                </>
              )}
              
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Discount</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Remaining Stock</TableCell>
              
              {showAdditionalFields && (
                <>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Invoice Value</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Current Stock</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Stock Value</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>C.CGST</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>C.SGST</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>C.Tax</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Taxable Value</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>IGST (Rs.)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>CGST (Rs.)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>SGST (Rs.)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Value (Rs.)</TableCell>
                </>
              )}
              
              <TableCell sx={{ fontWeight: 'bold' }}>Payment</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={showAdditionalFields ? 25 : 15} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1">Loading sales data...</Typography>
                </TableCell>
              </TableRow>
            ) : salesData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showAdditionalFields ? 25 : 15} align="center" sx={{ py: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <ReceiptIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                    <Typography variant="body1" color="text.secondary">No sales data found</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              salesData.map((row, index) => {
                const isExpanded = expandedRows.has(row.order_id);
                const gstValues = getGSTValues(row);
                
                return (
                  <React.Fragment key={`${row.order_id}-${index}`}>
                    <TableRow 
                      hover 
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                        cursor: 'pointer'
                      }}
                      onClick={() => toggleRowExpansion(row.order_id)}
                    >
                      <TableCell padding="checkbox">
                        <IconButton size="small" aria-label={isExpanded ? "Collapse row" : "Expand row"}>
                          {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{row.serial_no}</TableCell>
                      <TableCell>
                        <Tooltip title={formatDate(row.date)}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EventNoteIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {new Date(row.date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={row.product_name}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ProductIcon fontSize="small" color="action" />
                            <Typography variant="body2" sx={{ 
                              maxWidth: 120, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap',
                              fontWeight: 'medium'
                            }}>
                              {row.product_name}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={row.quantity} 
                          size="small" 
                          sx={{ minWidth: 40 }}
                        />
                      </TableCell>
                      <TableCell align="right">{safeFormatCurrency(row.unit_price_ex_gst)}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={formatPercentage(row.gst_percentage)} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                          sx={{ minWidth: 50 }}
                        />
                      </TableCell>
                      <TableCell align="right">{safeFormatCurrency(row.taxable_value)}</TableCell>
                      <TableCell align="right">{safeFormatCurrency(gstValues.cgst)}</TableCell>
                      <TableCell align="right">{safeFormatCurrency(gstValues.sgst)}</TableCell>
                      
                      {showAdditionalFields && (
                        <>
                          <TableCell align="right">{safeFormatCurrency(row.igst_amount)}</TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {row.hsn_code || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={row.product_type || 'Unknown'} 
                              size="small"
                              color={row.product_type === 'product' ? 'success' : 'info'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">{safeFormatCurrency(row.mrp_incl_gst)}</TableCell>
                          <TableCell align="right">{safeFormatCurrency(row.discounted_sales_rate_ex_gst)}</TableCell>
                        </>
                      )}
                      
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{safeFormatCurrency(row.payment_amount)}</TableCell>
                      <TableCell align="right">
                        {parseFloat(row.discount) > 0 ? 
                          <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 'medium' }}>
                            {safeFormatCurrency(row.discount)}
                          </Typography> : 
                          '—'
                        }
                      </TableCell>

                      {/* Remaining Stock column - using database value */}
                      <TableCell align="center">
                        <Tooltip title={`Stock after transaction: ${row.remaining_stock}`}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <InventoryIcon fontSize="small" color="action" />
                            <Chip 
                              label={row.remaining_stock !== undefined && row.remaining_stock !== null ? row.remaining_stock.toString() : '—'} 
                              size="small"
                              sx={{ 
                                backgroundColor: getStockLevelColor(row.remaining_stock),
                                color: 'white',
                                minWidth: 40
                              }}
                            />
                          </Box>
                        </Tooltip>
                      </TableCell>
                      
                      {showAdditionalFields && (
                        <>
                          <TableCell align="right">{safeFormatCurrency(row.invoice_value)}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={row.current_stock !== null && row.current_stock !== undefined ? row.current_stock.toString() : '—'} 
                              size="small"
                              sx={{ 
                                backgroundColor: getStockLevelColor(row.current_stock),
                                color: 'white'
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">{safeFormatCurrency(row.current_stock_amount)}</TableCell>
                          <TableCell align="right">{safeFormatCurrency(row.c_cgst)}</TableCell>
                          <TableCell align="right">{safeFormatCurrency(row.c_sgst)}</TableCell>
                          <TableCell align="right">{safeFormatCurrency(row.c_tax)}</TableCell>
                          <TableCell align="right">{safeFormatCurrency(row.current_stock_taxable_value)}</TableCell>
                          <TableCell align="right">{safeFormatCurrency(row.current_stock_igst)}</TableCell>
                          <TableCell align="right">{safeFormatCurrency(row.current_stock_cgst)}</TableCell>
                          <TableCell align="right">{safeFormatCurrency(row.current_stock_sgst)}</TableCell>
                          <TableCell align="right">{safeFormatCurrency(row.current_stock_total_value)}</TableCell>
                        </>
                      )}
                      
                      <TableCell>
                        <Chip
                          label={row.payment_method || 'Unknown'}
                          size="small"
                          sx={{
                            backgroundColor: getPaymentMethodColor(row.payment_method),
                            color: 'white',
                            textTransform: 'uppercase',
                            fontSize: '0.625rem',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={row.order_id}>
                          <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                            maxWidth: 80,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {row.order_id.substring(0, 8)}...
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded row with additional details */}
                    {isExpanded && (
                      <TableRow>
                        <TableCell 
                          colSpan={showAdditionalFields ? 25 : 15} 
                          sx={{ 
                            py: 0,
                            backgroundColor: theme.palette.action.selected
                          }}
                        >
                          <Box sx={{ p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                              Additional Details
                            </Typography>
                            <Box sx={{ 
                              display: 'grid', 
                              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, 
                              gap: 2 
                            }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Order ID</Typography>
                                <Typography variant="body2">{row.order_id}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Payment Date</Typography>
                                <Typography variant="body2">{safeFormatDate(row.payment_date)}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">HSN Code</Typography>
                                <Typography variant="body2">{row.hsn_code || '—'}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Product Type</Typography>
                                <Typography variant="body2">{row.product_type || '—'}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">MRP (Incl GST)</Typography>
                                <Typography variant="body2">{safeFormatCurrency(row.mrp_incl_gst)}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Disc. Rate (Ex GST)</Typography>
                                <Typography variant="body2">{safeFormatCurrency(row.discounted_sales_rate_ex_gst)}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Invoice Value</Typography>
                                <Typography variant="body2">{safeFormatCurrency(row.invoice_value)}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Remaining Stock</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  {row.remaining_stock !== undefined && row.remaining_stock !== null ? row.remaining_stock : '—'}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Current Stock</Typography>
                                <Typography variant="body2">{row.current_stock !== null && row.current_stock !== undefined ? row.current_stock : '—'}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Current Stock Value</Typography>
                                <Typography variant="body2">{safeFormatCurrency(row.current_stock_amount)}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Current CGST</Typography>
                                <Typography variant="body2">{safeFormatCurrency(row.c_cgst)}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Current SGST</Typography>
                                <Typography variant="body2">{safeFormatCurrency(row.c_sgst)}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Current Tax</Typography>
                                <Typography variant="body2">{safeFormatCurrency(row.c_tax)}</Typography>
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
            
            {/* Summary row */}
            {salesData.length > 0 && (
              <TableRow sx={{ 
                backgroundColor: theme.palette.primary.main, 
                '& .MuiTableCell-root': { 
                  color: theme.palette.primary.contrastText,
                  fontWeight: 'bold'
                }
              }}>
                <TableCell padding="checkbox" />
                <TableCell colSpan={3}>
                  <Typography variant="body2" fontWeight="bold">TOTALS</Typography>
                </TableCell>
                <TableCell align="center">{totals.quantity}</TableCell>
                <TableCell align="right">—</TableCell>
                <TableCell align="center">—</TableCell>
                <TableCell align="right">{formatCurrency(totals.taxableValue)}</TableCell>
                <TableCell align="right">{formatCurrency(totals.cgstAmount)}</TableCell>
                <TableCell align="right">{formatCurrency(totals.sgstAmount)}</TableCell>
                
                {showAdditionalFields && (
                  <>
                    <TableCell align="right">{formatCurrency(totals.igstAmount)}</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell align="right">—</TableCell>
                    <TableCell align="right">—</TableCell>
                  </>
                )}
                
                <TableCell align="right">{formatCurrency(totals.paymentAmount)}</TableCell>
                <TableCell align="right">{formatCurrency(totals.discount)}</TableCell>
                <TableCell align="center">—</TableCell>
                
                {showAdditionalFields && (
                  <>
                    <TableCell align="right">{formatCurrency(totals.invoiceValue)}</TableCell>
                    <TableCell align="center">{totals.currentStock.toFixed(0)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.currentStockAmount)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.cCgst)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.cSgst)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.cTax)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.current_stock_taxable_value)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.current_stock_igst)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.current_stock_cgst)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.current_stock_sgst)}</TableCell>
                    <TableCell align="right">{formatCurrency(totals.current_stock_total_value)}</TableCell>
                  </>
                )}
                
                <TableCell>—</TableCell>
                <TableCell>—</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
} 
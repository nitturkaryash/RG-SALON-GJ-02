import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
  TablePagination,
  CircularProgress,
  Skeleton,
  Stack,
  IconButton,
  Tooltip,
  ButtonGroup,
  Button
} from '@mui/material';
import { deleteOrder } from '../../hooks/usePOS';
import { Order } from '../../models/orderTypes';
import { formatCurrency } from '../../utils/format';
import DeleteButton from '../../components/DeleteButton';
import { toast } from 'react-toastify';
import PrintIcon from '@mui/icons-material/Print';
import { printBill } from '../../utils/printUtils';
import SpaIcon from '@mui/icons-material/Spa';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import StoreIcon from '@mui/icons-material/Store';
import { getPurchaseType as baseGetPurchaseType } from '../../utils/orderHelpers';

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  onOrderDeleted: () => void;
  title?: string;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  isLoading,
  onOrderDeleted,
  title = 'Orders'
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Handle order deletion
  const handleDeleteOrder = async (orderId: string) => {
    try {
      const result = await deleteOrder(orderId);
      if (result.success) {
        toast.success('Order deleted successfully');
        onOrderDeleted();
      } else {
        toast.error('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Error deleting order');
    }
  };

  // Handle printing bill
  const handlePrintBill = (order: Order) => {
    printBill(order);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get payment status chip
  const getStatusChip = (status: string) => {
    let color: 'success' | 'warning' | 'error' | 'default' = 'default';
    
    switch (status?.toLowerCase()) {
      case 'completed':
        color = 'success';
        break;
      case 'pending':
        color = 'warning';
        break;
      case 'cancelled':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return <Chip label={status || 'Unknown'} color={color} size="small" />;
  };

  // Helper to determine purchase type with membership support
  const getPurchaseType = (order: Order): string => {
    if (!order) return 'unknown';

    // Ensure services is an array
    const services = Array.isArray(order.services) ? order.services : [];
    
    // If services array exists with detailed type info, use enhanced logic
    if (services.length > 0) {
      const hasMemberships = services.some(s => s?.type === 'membership' || s?.category === 'membership');
      const hasServices = services.some(s => s?.type === 'service' && s?.category !== 'membership');
      const hasProducts = services.some(s => s?.type === 'product' || s?.category === 'product');

      // For items without explicit type, check if they come from product tables or have product-like attributes
      const hasUnknownProducts = services.some(s => 
        s && !s.type && !s.category && 
        (s.product_id || s.product_name || s.hsn_code || s.stock_quantity !== undefined)
      );

      if (hasMemberships && !hasServices && !hasProducts && !hasUnknownProducts) return 'membership';
      
      const types: string[] = [];
      if (hasServices) types.push('service');
      if (hasProducts || hasUnknownProducts) types.push('product');
      if (hasMemberships) types.push('membership');

      if (types.length > 1) return types.join('_'); // e.g., service_product
      if (types.length === 1) return types[0];
      return 'unknown';
    }
    
    // Basic fallback (service | product | both | unknown)
    const baseType = baseGetPurchaseType(order);
    return baseType || 'unknown';
  };

  const renderPurchaseTypeChip = (type: string) => {
    if (!type) return <Chip size="small" label="Unknown" variant="outlined" />;
    
    const normalizedType = type.toLowerCase();
    
    const typeMap: Record<string, JSX.Element> = {
      'service': <Chip size="small" icon={<SpaIcon fontSize="small" />} label="Service" color="primary" variant="outlined" />,
      'product': <Chip size="small" icon={<ShoppingBagIcon fontSize="small" />} label="Product" color="info" variant="outlined" />,
      'membership': <Chip size="small" icon={<CardMembershipIcon fontSize="small" />} label="Membership" color="warning" variant="outlined" />,
      'service_product': <Chip size="small" icon={<StoreIcon fontSize="small" />} label="Service & Product" color="success" variant="outlined" />,
      'product_service': <Chip size="small" icon={<StoreIcon fontSize="small" />} label="Service & Product" color="success" variant="outlined" />,
      'service_membership': <Chip size="small" icon={<StoreIcon fontSize="small" />} label="Service & Membership" color="secondary" variant="outlined" />,
      'membership_service': <Chip size="small" icon={<StoreIcon fontSize="small" />} label="Service & Membership" color="secondary" variant="outlined" />,
      'product_membership': <Chip size="small" icon={<StoreIcon fontSize="small" />} label="Product & Membership" color="secondary" variant="outlined" />,
      'membership_product': <Chip size="small" icon={<StoreIcon fontSize="small" />} label="Product & Membership" color="secondary" variant="outlined" />,
      'both': <Chip size="small" icon={<StoreIcon fontSize="small" />} label="Service & Product" color="success" variant="outlined" />,
      'service_product_membership': <Chip size="small" icon={<StoreIcon fontSize="small" />} label="Service, Product & Membership" color="secondary" variant="outlined" />,
      'product_service_membership': <Chip size="small" icon={<StoreIcon fontSize="small" />} label="Service, Product & Membership" color="secondary" variant="outlined" />,
      'membership_service_product': <Chip size="small" icon={<StoreIcon fontSize="small" />} label="Service, Product & Membership" color="secondary" variant="outlined" />
    };

    return typeMap[normalizedType] || <Chip size="small" label="Unknown" variant="outlined" />;
  };

  // Calculate paginated data
  const paginatedOrders = orders
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Loading skeleton
  const loadingSkeleton = Array(5).fill(0).map((_, index) => (
    <TableRow key={`skeleton-${index}`}>
      {Array(7).fill(0).map((_, colIndex) => (
        <TableCell key={`skeleton-cell-${index}-${colIndex}`}>
          <Skeleton animation="wave" />
        </TableCell>
      ))}
      <TableCell><Skeleton animation="wave" width={40} /></TableCell>
    </TableRow>
  ));

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        p: 2,
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              loadingSkeleton
            ) : paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{formatDate(order.date)}</TableCell>
                  <TableCell>{order.order_id || order.id}</TableCell>
                  <TableCell>{order.customer_name || order.client_name || 'N/A'}</TableCell>
                  <TableCell>{renderPurchaseTypeChip(getPurchaseType(order))}</TableCell>
                  <TableCell>{getStatusChip(order.status)}</TableCell>
                  <TableCell align="right">{formatCurrency(order.total || order.total_amount)}</TableCell>
                  <TableCell align="right">
                    <ButtonGroup size="small">
                      <Tooltip title="Print Bill">
                        <IconButton
                          onClick={() => handlePrintBill(order)}
                          size="small"
                        >
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <DeleteButton
                        onDelete={() => handleDeleteOrder(order.id)}
                        size="small"
                        tooltip="Delete Order"
                      />
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No orders found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={orders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default OrdersTable; 
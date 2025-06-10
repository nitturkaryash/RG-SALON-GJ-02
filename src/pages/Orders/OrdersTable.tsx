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
      {Array(6).fill(0).map((_, colIndex) => (
        <TableCell key={`skeleton-cell-${index}-${colIndex}`}>
          <Skeleton animation="wave" />
        </TableCell>
      ))}
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
      
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="orders table" size="small">
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              loadingSkeleton
            ) : paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No orders found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow
                  hover
                  key={order.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    {order.order_id || order.id}
                  </TableCell>
                  <TableCell>{formatDate(order.date || order.created_at)}</TableCell>
                  <TableCell>{order.customer_name || order.client_name || 'Walk-in'}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.payment_method || 'Unknown'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(order.total_amount || order.total || 0)}
                  </TableCell>
                  <TableCell>{getStatusChip(order.status)}</TableCell>
                  <TableCell align="center">
                    <ButtonGroup size="small">
                      <Tooltip title="Print Bill">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handlePrintBill(order)}
                        >
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <DeleteButton
                        onDelete={() => handleDeleteOrder(order.order_id || order.id)}
                        itemName={`Order ${order.order_id || order.id}`}
                        itemType="order"
                        size="small"
                      />
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))
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
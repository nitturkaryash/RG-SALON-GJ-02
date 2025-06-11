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
  Skeleton,
  TablePagination,
  Chip,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import { formatCurrency } from '../../utils/format';
import DeleteButton from '../DeleteButton';

// Define column configuration type
interface ColumnConfig {
  id: string;
  label: string;
  format?: (value: any) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
  width?: number;
}

// Props for the table component
interface InventoryTableProps {
  title?: string;
  data: any[];
  columns: ColumnConfig[];
  isLoading?: boolean;
  onDelete?: (id: string) => Promise<void> | void;
  itemType?: string;
  onRefresh?: () => void;
  emptyMessage?: string;
  getItemName?: (row: any) => string;
  noDeleteColumn?: boolean;
  deleteIdField?: string;
  showDelete?: boolean;
  renderFooter?: () => React.ReactNode;
  totalQuantityLabel?: string;
  totalQuantityValue?: number | string;
}

/**
 * Reusable inventory table component with delete functionality
 */
const InventoryTable: React.FC<InventoryTableProps> = ({
  title,
  data = [],
  columns,
  isLoading = false,
  onDelete,
  itemType = 'record',
  onRefresh,
  emptyMessage = 'No records found',
  getItemName,
  noDeleteColumn = false,
  deleteIdField = 'id',
  showDelete = true,
  renderFooter,
  totalQuantityLabel,
  totalQuantityValue
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate the rows to display for current page
  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Loading skeleton for rows
  const loadingRows = Array.from({ length: 5 }).map((_, index) => (
    <TableRow key={`skeleton-${index}`}>
      {columns.map((column, colIndex) => (
        <TableCell key={`skeleton-cell-${colIndex}`}>
          <Skeleton animation="wave" />
        </TableCell>
      ))}
      {!noDeleteColumn && <TableCell><Skeleton animation="wave" width={40} /></TableCell>}
    </TableRow>
  ));

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Header with title and actions */}
      {title && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h6">
            {title}
          </Typography>
          <Stack direction="row" spacing={1}>
            {onRefresh && (
              <Tooltip title="Refresh data">
                <IconButton
                  onClick={onRefresh}
                  size="small"
                  color="primary"
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Filter">
              <IconButton
                size="small"
                color="primary"
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      )}

      {/* Main table */}
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label={`inventory-${itemType}-table`} size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ 
                    minWidth: column.minWidth,
                    width: column.width,
                    fontWeight: 600
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              {!noDeleteColumn && onDelete && showDelete && (
                <TableCell align="center" style={{ width: 60 }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              loadingRows
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (noDeleteColumn ? 0 : 1)} 
                  align="center"
                  sx={{ py: 6 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => {
                return (
                  <TableRow hover tabIndex={-1} key={row[deleteIdField] || `row-${rowIndex}`}>
                    {columns.map((column) => {
                      // Skip serial number computation for consumption tables
                      if (column.id === 'serial_no' && itemType === 'consumption') {
                        return (
                          <TableCell key={`serial-${rowIndex}`} align={column.align}>
                            {row[column.id]}
                          </TableCell>
                        );
                      }
                      // Dynamically compute serial number for other tables
                      if (column.id === 'serial_no') {
                        const serial = data.length - (page * rowsPerPage + rowIndex);
                        return (
                          <TableCell key={`serial-${rowIndex}`} align={column.align}>
                            {serial}
                          </TableCell>
                        );
                      }
                      const value = row[column.id];
                      return (
                        <TableCell key={`${row[deleteIdField]}-${column.id}`} align={column.align}>
                          {column.format ? column.format(value) : value}
                        </TableCell>
                      );
                    })}
                    {!noDeleteColumn && onDelete && showDelete && (
                      <TableCell align="center">
                        <DeleteButton
                          onDelete={() => onDelete(row.id || row.consumption_id || row.sale_id || row.purchase_id || row[deleteIdField])}
                          itemName={getItemName ? getItemName(row) : row.name || row.product_name}
                          itemType={itemType}
                          size="small"
                        />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
            {renderFooter && renderFooter()}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelDisplayedRows={({ from, to, count }) => {
          const standardLabel = `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`;
          if (totalQuantityLabel && totalQuantityValue !== undefined) {
            const formattedValue = typeof totalQuantityValue === 'number'
              ? totalQuantityValue.toLocaleString()
              : totalQuantityValue;
            return (
              <>
                {`${standardLabel} | ${totalQuantityLabel} `}
                <Box component="span" sx={{ fontWeight: 'bold' }}>
                  {formattedValue}
                </Box>
              </>
            );
          }
          return standardLabel;
        }}
      />
    </Paper>
  );
};

export default InventoryTable; 
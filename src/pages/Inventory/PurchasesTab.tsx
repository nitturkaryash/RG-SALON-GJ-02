import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useInventory } from '../../hooks/useInventory';
import InventoryTable from '../../components/inventory/InventoryTable';
import { formatCurrency } from '../../utils/format';
import { toast } from 'react-toastify';

const PurchasesTab = () => {
  const { 
    purchasesQuery, 
    deletePurchase,
    recalculateBalanceStock 
  } = useInventory();

  const isLoading = purchasesQuery.isLoading;
  const purchases = purchasesQuery.data || [];

  // Handle purchase deletion
  const handleDeletePurchase = async (purchaseId: string) => {
    try {
      const result = await deletePurchase(purchaseId);
      if (result.success) {
        toast.success('Purchase record deleted successfully');
        // Refresh data after deletion
        purchasesQuery.refetch();
        // Recalculate balance stock as well
        recalculateBalanceStock();
      } else {
        toast.error('Failed to delete purchase record');
      }
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast.error('Error deleting purchase record');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Column definitions
  const columns = [
    { 
      id: 'date', 
      label: 'Date', 
      minWidth: 100,
      format: (value: string) => formatDate(value)
    },
    { 
      id: 'product_name', 
      label: 'Product Name', 
      minWidth: 170 
    },
    { 
      id: 'hsn_code', 
      label: 'HSN Code', 
      minWidth: 100 
    },
    {
      id: 'purchase_qty',
      label: 'Quantity',
      minWidth: 80,
      align: 'right' as const,
    },
    {
      id: 'mrp_incl_gst',
      label: 'MRP (Incl. GST)',
      minWidth: 120,
      align: 'right' as const,
      format: (value: number) => formatCurrency(value)
    },
    {
      id: 'purchase_invoice_value_rs',
      label: 'Invoice Value',
      minWidth: 120,
      align: 'right' as const,
      format: (value: number) => formatCurrency(value)
    },
    {
      id: 'purchase_invoice_number',
      label: 'Invoice #',
      minWidth: 120,
    },
  ];

  // Get purchase name for confirmation dialog
  const getPurchaseName = (row: any) => {
    return `${row.product_name} (${formatDate(row.date)})`;
  };

  return (
    <Box sx={{ p: 2 }}>
      <InventoryTable
        title="Purchase Records"
        data={purchases}
        columns={columns}
        isLoading={isLoading}
        onDelete={handleDeletePurchase}
        itemType="purchase"
        onRefresh={() => purchasesQuery.refetch()}
        emptyMessage="No purchase records found"
        getItemName={getPurchaseName}
        deleteIdField="purchase_id"
      />
    </Box>
  );
};

export default PurchasesTab; 
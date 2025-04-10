import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useInventory } from '../../hooks/useInventory';
import InventoryTable from '../../components/inventory/InventoryTable';
import { formatCurrency } from '../../utils/format';
import { toast } from 'react-toastify';

const ConsumptionTab = () => {
  const { 
    consumptionQuery, 
    deleteConsumption,
    recalculateBalanceStock,
    salonConsumptionProductsQuery
  } = useInventory();

  const isLoading = consumptionQuery.isLoading || salonConsumptionProductsQuery.isLoading;
  const consumption = consumptionQuery.data || [];
  const salonConsumptionProducts = salonConsumptionProductsQuery.data || [];

  // Handle consumption deletion
  const handleDeleteConsumption = async (consumptionId: string) => {
    try {
      const result = await deleteConsumption(consumptionId);
      if (result.success) {
        toast.success('Consumption record deleted successfully');
        // Refresh data after deletion
        consumptionQuery.refetch();
        // Recalculate balance stock as well
        recalculateBalanceStock();
      } else {
        toast.error('Failed to delete consumption record');
      }
    } catch (error) {
      console.error('Error deleting consumption:', error);
      toast.error('Error deleting consumption record');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Column definitions for regular consumption
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
      id: 'consumption_qty',
      label: 'Quantity',
      minWidth: 80,
      align: 'right' as const,
      format: (value: number) => value || 0
    },
    {
      id: 'stylist_name',
      label: 'Stylist',
      minWidth: 120,
    },
    {
      id: 'purpose',
      label: 'Purpose',
      minWidth: 150,
    },
    {
      id: 'total',
      label: 'Value',
      minWidth: 120,
      align: 'right' as const,
      format: (value: number) => formatCurrency(value || 0)
    },
    {
      id: 'requisition_voucher_no',
      label: 'Voucher #',
      minWidth: 120,
    },
  ];

  // Column definitions for salon consumption products
  const salonProductsColumns = [
    { 
      id: 'Date', 
      label: 'Date', 
      minWidth: 100,
      format: (value: string) => formatDate(value)
    },
    { 
      id: 'Product Name', 
      label: 'Product Name', 
      minWidth: 170 
    },
    {
      id: 'Consumption Qty.',
      label: 'Quantity',
      minWidth: 80,
      align: 'right' as const,
      format: (value: number) => value || 0
    },
    {
      id: 'Total Purchase Cost (Rs.)',
      label: 'Total Cost',
      minWidth: 120,
      align: 'right' as const,
      format: (value: number) => formatCurrency(value || 0)
    },
    {
      id: 'Requisition Voucher No.',
      label: 'Voucher #',
      minWidth: 120,
    },
  ];

  // Get consumption name for confirmation dialog
  const getConsumptionName = (row: any) => {
    return `${row.product_name || row['Product Name']} (${formatDate(row.date || row.Date)})`;
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Regular Consumption Records */}
      <InventoryTable
        title="Regular Consumption Records"
        data={consumption}
        columns={columns}
        isLoading={consumptionQuery.isLoading}
        onDelete={handleDeleteConsumption}
        itemType="consumption"
        onRefresh={() => consumptionQuery.refetch()}
        emptyMessage="No consumption records found"
        getItemName={getConsumptionName}
        deleteIdField="consumption_id"
      />
      
      {/* Salon Consumption Products */}
      <Box sx={{ mt: 4 }}>
        <InventoryTable
          title="Salon Consumption Products"
          data={salonConsumptionProducts}
          columns={salonProductsColumns}
          isLoading={salonConsumptionProductsQuery.isLoading}
          itemType="consumption"
          onRefresh={() => salonConsumptionProductsQuery.refetch()}
          emptyMessage="No salon consumption products found"
          getItemName={getConsumptionName}
          showDelete={false}
        />
      </Box>
    </Box>
  );
};

export default ConsumptionTab; 
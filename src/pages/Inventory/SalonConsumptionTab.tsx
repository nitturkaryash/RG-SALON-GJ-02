import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import InventoryTable from '../../components/inventory/InventoryTable';
import { supabase } from '../../utils/supabase/supabaseClient';
import { formatCurrency } from '../../utils/format';

interface SalonConsumptionTabProps {
  dateFilter: { startDate: string; endDate: string; isActive: boolean };
  applyDateFilter: <T>(data: T[]) => T[];
}

const SalonConsumptionTab: React.FC<SalonConsumptionTabProps> = ({ dateFilter, applyDateFilter }) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: viewRows, error: fetchError } = await supabase
          .from<any, any>('salon_consumption_products')
          .select('*')
          .order('Date', { ascending: false });
        if (fetchError) throw fetchError;
        setData(viewRows || []);
      } catch (err: any) {
        console.error('Error loading salon consumption data:', err);
        setError(err.message || 'Failed to load salon consumption data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => applyDateFilter(data), [data, dateFilter, applyDateFilter]);

  const columns = [
    { id: 'Requisition Voucher No.', label: 'Requisition Voucher No.' },
    { id: 'order_id', label: 'Order ID' },
    { id: 'Date', label: 'Date', format: (value: string) => new Date(value).toLocaleDateString() },
    { id: 'Product Name', label: 'Product Name' },
    { id: 'Product Type', label: 'Product Type' },
    { id: 'Consumption Qty.', label: 'Consumption Qty.', align: 'right' as const },
    { id: 'HSN_Code', label: 'HSN Code' },
    { id: 'MRP_Inclusive_GST_Rs', label: 'MRP Inclusive GST (Rs.)', align: 'right' as const, format: (v: any) => formatCurrency(v) },
    { id: 'Purchase_Cost_per_Unit_Ex_GST_Rs', label: 'Purchase Cost/Unit Ex. GST (Rs.)', align: 'right' as const, format: (v: any) => formatCurrency(v) },
    { id: 'Purchase_GST_Percentage', label: 'GST %', align: 'right' as const, format: (v: any) => `${v}%` },
    { id: 'Purchase_Taxable_Value_Rs', label: 'Purchase Taxable Value (Rs.)', align: 'right' as const, format: (v: any) => formatCurrency(v) },
    { id: 'Purchase_IGST_Rs', label: 'IGST (Rs.)', align: 'right' as const, format: (v: any) => formatCurrency(v) },
    { id: 'Purchase_CGST_Rs', label: 'CGST (Rs.)', align: 'right' as const, format: (v: any) => formatCurrency(v) },
    { id: 'Purchase_SGST_Rs', label: 'SGST (Rs.)', align: 'right' as const, format: (v: any) => formatCurrency(v) },
    { id: 'Total_Purchase_Cost_Rs', label: 'Total Purchase Cost (Rs.)', align: 'right' as const, format: (v: any) => formatCurrency(v) },
    { id: 'Discounted_Sales_Rate_Rs', label: 'Discounted Sales Rate (Rs.)', align: 'right' as const, format: (v: any) => formatCurrency(v) },
    { id: 'Initial_Stock', label: 'Initial Stock', align: 'right' as const },
    { id: 'Current_Stock', label: 'Current Stock', align: 'right' as const },
    { id: 'Remaining_Stock', label: 'Remaining Stock', align: 'right' as const },
    { id: 'Remaining_Stock_CGST_Rs', label: 'Remaining Stock CGST (Rs.)', align: 'right' as const, format: (v: any) => formatCurrency(v) },
    { id: 'Remaining_Stock_SGST_Rs', label: 'Remaining Stock SGST (Rs.)', align: 'right' as const, format: (v: any) => formatCurrency(v) },
    { id: 'Remaining_Stock_IGST_Rs', label: 'Remaining Stock IGST (Rs.)', align: 'right' as const, format: (v: any) => formatCurrency(v) },
    { id: 'Total_Remaining_Stock_Value_Rs', label: 'Total Remaining Stock Value (Rs.)', align: 'right' as const, format: (v: any) => formatCurrency(v) }
  ];

  return (
    <Box sx={{ p: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <Typography variant="h6" gutterBottom>Salon Consumption Records</Typography>
      <InventoryTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default SalonConsumptionTab;
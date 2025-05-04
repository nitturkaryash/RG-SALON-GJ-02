import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import InventoryTable from '../../components/inventory/InventoryTable';
import { supabase, TABLES } from '../../utils/supabase/supabaseClient';
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
          .from<any, any>(TABLES.SALON_CONSUMPTION_PRODUCTS)
          .select('*')
          .order('Date', { ascending: false });
        if (fetchError) throw fetchError;
        // Compute all derived fields for each row
        const rows = viewRows || [];
        const processedRows = rows.map(row => {
          const qty = row['Consumption Qty.'] ?? row.consumption_qty ?? 0;
          const costEx = row.Purchase_Cost_per_Unit_Ex_GST_Rs ?? 0;
          const gstPct = row.Purchase_GST_Percentage ?? 0;
          
          // Purchase calculations
          const purchaseTaxable = costEx * qty;
          const igstAmt = row.Purchase_IGST_Rs ?? 0;
          const cgstAmt = row.Purchase_CGST_Rs ?? (purchaseTaxable * gstPct / 200);
          const sgstAmt = row.Purchase_SGST_Rs ?? (purchaseTaxable * gstPct / 200);
          const totalPurchase = row.Total_Purchase_Cost_Rs ?? (purchaseTaxable + igstAmt + cgstAmt + sgstAmt);
          
          // Stock calculations
          const initialStock = row.Initial_Stock ?? 0;
          const currentStock = row.Current_Stock ?? 0;
          const remainingStock = row.Remaining_Stock ?? (initialStock - qty);
          
          // Value on hand
          const currentEx = currentStock * costEx;
          const remainingEx = remainingStock * costEx;
          
          // Remaining stock taxes
          const remCgst = row.Remaining_Stock_CGST_Rs ?? (remainingEx * gstPct / 200);
          const remSgst = row.Remaining_Stock_SGST_Rs ?? (remainingEx * gstPct / 200);
          const remIgst = row.Remaining_Stock_IGST_Rs ?? 0;
          
          const totalRemaining = row.Total_Remaining_Stock_Value_Rs ?? (remainingEx + remIgst + remCgst + remSgst);
          
          return {
            ...row,
            Purchase_Taxable_Value_Rs: purchaseTaxable,
            Purchase_IGST_Rs: igstAmt,
            Purchase_CGST_Rs: cgstAmt,
            Purchase_SGST_Rs: sgstAmt,
            Total_Purchase_Cost_Rs: totalPurchase,
            Remaining_Stock: remainingStock,
            Current_Stock_Total_Ex_GST_Rs: currentEx,
            Total_Remaining_Stock_Value_Rs: totalRemaining
          };
        });
        setData(processedRows);
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
    { id: 'Current_Stock_Total_Ex_GST_Rs', label: 'Current Stock Total Ex. GST (Rs.)', align: 'right' as const, format: (v: any) => formatCurrency(v) },
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
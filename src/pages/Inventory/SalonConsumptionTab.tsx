import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import InventoryTable from '../../components/inventory/InventoryTable';
import { supabase, TABLES } from '../../utils/supabase/supabaseClient';
import { formatCurrency } from '../../utils/format';

interface SalonConsumptionTabProps {
  dateFilter: { startDate: string; endDate: string; isActive: boolean };
  applyDateFilter: <T>(data: T[]) => T[];
  onDataUpdate?: (data: any[]) => void;
}

const SalonConsumptionTab: React.FC<SalonConsumptionTabProps> = ({ dateFilter, applyDateFilter, onDataUpdate }) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: consumptionRows, error: consumptionError } = await supabase
        .from('salon_consumption_products')
        .select('*')
        .order('Date', { ascending: false });

      if (consumptionError) throw consumptionError;
      if (!consumptionRows) {
        setData([]);
        setIsLoading(false);
        return;
      }

      const processedRows = consumptionRows.map((row: any, index) => {
        return {
          ...row,
          serial_no: index + 1,
          product_type: row.product_type || row.units || ''
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

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch data on initial component mount

  // Process data to calculate current stock values
  const processedData = useMemo(() => {
    return data.map(item => {
      // Calculations for the transaction itself
      const consumedQuantity = Number(item["Consumption Qty."]) || 0;
      const pricePerUnit = Number(item["Purchase_Cost_per_Unit_Ex_GST_Rs"]) || 0;
      const gstPercentage = Number(item["Purchase_GST_Percentage"]) || 0;

      const transaction_taxable_value = consumedQuantity * pricePerUnit;
      const transaction_gst_amount = transaction_taxable_value * (gstPercentage / 100);
      const transaction_cgst = transaction_gst_amount / 2;
      const transaction_sgst = transaction_gst_amount / 2;
      const transaction_igst = 0; 
      const transaction_total_value = transaction_taxable_value + transaction_gst_amount;

      // Use direct values from item (row from salon_consumption_products) for current stock
      const currentStockQty = Number(item["Remaining_Stock"]) || 0; // Using Remaining_Stock
      const current_stock_total_value = Number(item["Total_Remaining_Stock_Value_Rs"]) || 0;
      const current_stock_cgst = Number(item["Remaining_Stock_CGST_Rs"]) || 0;
      const current_stock_sgst = Number(item["Remaining_Stock_SGST_Rs"]) || 0;
      const current_stock_igst = Number(item["Remaining_Stock_IGST_Rs"]) || 0;
      // Calculate taxable value for stock
      const current_stock_taxable_value = current_stock_total_value - current_stock_cgst - current_stock_sgst - current_stock_igst;
      
      return {
        ...item,
        transaction_taxable_value,
        transaction_cgst,
        transaction_sgst,
        transaction_igst,
        transaction_total_value,
        current_stock: currentStockQty, // Assign the stock quantity here
        current_stock_taxable_value, 
        current_stock_igst,
        current_stock_cgst,
        current_stock_sgst,
        current_stock_total_value
      };
    });
  }, [data]);

  const filteredData = useMemo(() => applyDateFilter(processedData), [processedData, dateFilter, applyDateFilter]);

  useEffect(() => {
    if (onDataUpdate) {
      onDataUpdate(filteredData);
    }
  }, [filteredData, onDataUpdate]);

  const columns = [
    { id: 'serial_no', label: 'S.No', align: 'center', minWidth: 50 },
    { id: 'Date', label: 'Date', format: (value: string) => new Date(value).toLocaleDateString() },
    { id: 'Product Name', label: 'Product Name' },
    { id: 'HSN_Code', label: 'HSN Code' },
    { id: 'Product Type', label: 'Product Type' },
    { id: 'Consumption Qty.', label: 'Qty', align: 'right' },
    { id: 'purpose', label: 'Purpose' },
    { id: 'stylist_name', label: 'Stylist' },
    { id: 'Purchase_Cost_per_Unit_Ex_GST_Rs', label: 'Unit Price', align: 'right', format: (v: any) => formatCurrency(v) },
    { id: 'Purchase_GST_Percentage', label: 'GST %', align: 'right', format: (v: any) => `${v}%` },
    { id: 'transaction_taxable_value', label: 'Taxable Value', align: 'right', format: (v: any) => formatCurrency(v) },
    { id: 'transaction_cgst', label: 'CGST (Rs.)', align: 'right', format: (v: any) => formatCurrency(v) },
    { id: 'transaction_sgst', label: 'SGST (Rs.)', align: 'right', format: (v: any) => formatCurrency(v) },
    { id: 'transaction_igst', label: 'IGST (Rs.)', align: 'right', format: (v: any) => formatCurrency(v) }, 
    { id: 'transaction_total_value', label: 'Total Invoice Value', align: 'right', format: (v: any) => formatCurrency(v) },
    { id: 'notes', label: 'Notes' },
    { id: 'current_stock', label: 'Current Stock', align: 'right' },
    { id: 'current_stock_taxable_value', label: 'Taxable Value (Stock)', align: 'right', format: (v: any) => formatCurrency(v) },
    { id: 'current_stock_igst', label: 'IGST (Stock)', align: 'right', format: (v: any) => formatCurrency(v) },
    { id: 'current_stock_cgst', label: 'CGST (Stock)', align: 'right', format: (v: any) => formatCurrency(v) },
    { id: 'current_stock_sgst', label: 'SGST (Stock)', align: 'right', format: (v: any) => formatCurrency(v) },
    { id: 'current_stock_total_value', label: 'Total Value (Stock)', align: 'right', format: (v: any) => formatCurrency(v) }
  ];

  return (
    <Box sx={{ p: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <Typography variant="h6" gutterBottom>Salon Consumption Records</Typography>
      <InventoryTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        itemType="consumption"
      />
    </Box>
  );
};

export default SalonConsumptionTab;
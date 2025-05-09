import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import InventoryTable from '../../components/inventory/InventoryTable';
import { supabase, TABLES } from '../../utils/supabase/supabaseClient';
import { formatCurrency } from '../../utils/format';
import { useInventory } from '../../hooks/useInventory';

interface SalonConsumptionTabProps {
  dateFilter: { startDate: string; endDate: string; isActive: boolean };
  applyDateFilter: <T>(data: T[]) => T[];
  onDataUpdate?: (data: any[]) => void;
}

const SalonConsumptionTab: React.FC<SalonConsumptionTabProps> = ({ dateFilter, applyDateFilter, onDataUpdate }) => {
  const [data, setData] = useState<any[]>([]);
  const { deleteConsumption } = useInventory();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: consumptionRows, error: consumptionError } = await supabase
        .from(TABLES.SALON_CONSUMPTION)
        .select('*, product_master(units)') // Use Supabase join to fetch units from product_master
        .order('date', { ascending: false });

      if (consumptionError) throw consumptionError;
      if (!consumptionRows) {
        setData([]);
        setIsLoading(false);
        return;
      }

      const { data: stockData, error: stockError } = await supabase
        .from('balance_stock_view')
        .select('product_name, balance_qty');

      if (stockError) {
        console.error('Error fetching balance stock data:', stockError);
      }

      const stockMap = new Map();
      if (stockData && stockData.length > 0) {
        stockData.forEach(item => {
          stockMap.set(item.product_name?.toLowerCase(), item.balance_qty || 0);
        });
      }

      const processedRows = consumptionRows.map((row: any, index) => {
        const currentStock = stockMap.get(row.product_name?.toLowerCase()) || 0;
        const masterUnits = row.product_master?.units; // Units from joined product_master table

        return {
          ...row,
          serial_no: index + 1,
          current_stock: currentStock,
          product_type: row.product_type || row.units || masterUnits || ''
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this consumption record?')) return;
    try {
      await deleteConsumption(id);
      // Refresh data by calling fetchData directly
      await fetchData(); 
    } catch (err) {
      console.error('Error deleting consumption record:', err);
      setError('Failed to delete consumption record.');
    } 
  };

  // Process data to calculate current stock values
  const processedData = useMemo(() => {
    return data.map(item => {
      // Calculations for the transaction itself
      const consumedQuantity = Number(item.quantity) || 0;
      const pricePerUnit = Number(item.price_per_unit) || 0;
      const gstPercentage = Number(item.gst_percentage) || 0;

      const transaction_taxable_value = consumedQuantity * pricePerUnit;
      const transaction_gst_amount = transaction_taxable_value * (gstPercentage / 100);
      const transaction_cgst = transaction_gst_amount / 2;
      const transaction_sgst = transaction_gst_amount / 2;
      const transaction_igst = 0; 
      const transaction_total_value = transaction_taxable_value + transaction_gst_amount;

      const currentStockQty = item.current_stock ?? 0;
      const current_stock_taxable_value = currentStockQty * pricePerUnit; 
      const current_stock_gst_amount = current_stock_taxable_value * (gstPercentage / 100);
      const current_stock_cgst = current_stock_gst_amount / 2;
      const current_stock_sgst = current_stock_gst_amount / 2;
      const current_stock_igst = 0;
      const current_stock_total_value = current_stock_taxable_value + current_stock_gst_amount;
      
      return {
        ...item,
        transaction_taxable_value,
        transaction_cgst,
        transaction_sgst,
        transaction_igst,
        transaction_total_value,
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
    { id: 'date', label: 'Date', format: (value: string) => new Date(value).toLocaleDateString() },
    { id: 'product_name', label: 'Product Name' },
    { id: 'hsn_code', label: 'HSN Code' },
    { id: 'product_type', label: 'Product Type' },
    { id: 'quantity', label: 'Qty', align: 'right' },
    { id: 'purpose', label: 'Purpose' },
    { id: 'stylist_name', label: 'Stylist' },
    { id: 'price_per_unit', label: 'Unit Price', align: 'right', format: (v: any) => formatCurrency(v) },
    { id: 'gst_percentage', label: 'GST %', align: 'right', format: (v: any) => `${v}%` },
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
        onDelete={handleDelete}
        deleteIdField="id"
        itemType="consumption"
      />
    </Box>
  );
};

export default SalonConsumptionTab;
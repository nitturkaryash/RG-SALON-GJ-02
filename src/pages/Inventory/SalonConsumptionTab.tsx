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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: orders, error: ordersError } = await supabase
        .from('pos_orders')
        .select('id, created_at, services, stylist_name, consumption_purpose')
        .eq('type', 'salon_consumption')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      if (!orders) {
        setData([]);
        return;
      }

      const consumptionRows: any[] = [];
      orders.forEach(order => {
        if (order.services && Array.isArray(order.services)) {
          order.services.forEach((item: any) => {
            console.log('[SalonConsumptionTab] Processing item from order.services:', JSON.stringify(item));
            if (item.type === 'product') {
              const resolvedProductName = item.product_name || item.service_name;
              console.log(`[SalonConsumptionTab] Extracted product name: "${resolvedProductName}" from item fields: product_name=${item.product_name}, service_name=${item.service_name}`);
              consumptionRows.push({
                ...item,
                id: `${order.id}-${item.product_id || item.service_id}`,
                created_at: order.created_at,
                Date: order.created_at,
                "Product Name": resolvedProductName,
                HSN_Code: item.hsn_code,
                "Product Type": item.units || '',
                "Consumption Qty.": item.quantity,
                purpose: order.consumption_purpose || '',
                stylist_name: order.stylist_name,
                Purchase_Cost_per_Unit_Ex_GST_Rs: item.price,
                Purchase_GST_Percentage: item.gst_percentage
              });
            }
          });
        }
      });

      const processedRows = consumptionRows.map((row, index) => ({
        ...row,
        serial_no: index + 1
      }));

      // Fetch current stock from balance stock view's balance_qty column
      const { data: stockData, error: stockError } = await supabase
        .from(TABLES.BALANCE_STOCK)
        .select('product_name, balance_qty');
      if (stockError) throw stockError;
      
      // Build map of latest stock per product
      const stockMap: Record<string, any> = {};
      stockData?.forEach((stock: any) => {
        const name = stock.product_name;
        if (!stockMap[name]) {
          stockMap[name] = stock;
        }
      });
      console.log('SalonConsumptionTab: stockMap created:', stockMap);

      // Merge stock info into rows
      const processedRowsWithStock = processedRows.map(row => {
        const productName = row['Product Name'];
        const stock = stockMap[productName];
        return {
          ...row,
          Remaining_Stock: stock?.balance_qty ?? 0,
          Total_Remaining_Stock_Value_Rs: 0,
          Remaining_Stock_CGST_Rs: 0,
          Remaining_Stock_SGST_Rs: 0,
          Remaining_Stock_IGST_Rs: 0
        };
      });

      setData(processedRowsWithStock);
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

  // Get balance stock from useInventory hook
  const { balanceStockQuery } = useInventory();
  const balanceStockMap = useMemo(() => {
    const map: Record<string, number> = {};
    balanceStockQuery.data?.forEach(bs => {
      if (bs.product_name) {
        map[bs.product_name] = bs.balance_qty ?? 0;
      }
    });
    return map;
  }, [balanceStockQuery.data]);

  const processedData = useMemo(() => {
    return data.map(item => {
      const consumedQuantity = Number(item["Consumption Qty."]) || 0;
      const pricePerUnit = Number(item["Purchase_Cost_per_Unit_Ex_GST_Rs"]) || 0;
      const gstPercentage = Number(item["Purchase_GST_Percentage"]) || 0;

      const transaction_taxable_value = consumedQuantity * pricePerUnit;
      const transaction_gst_amount = transaction_taxable_value * (gstPercentage / 100);
      const transaction_cgst = transaction_gst_amount / 2;
      const transaction_sgst = transaction_gst_amount / 2;
      const transaction_igst = 0; 
      const transaction_total_value = transaction_taxable_value + transaction_gst_amount;

      // Override Remaining_Stock with balance stock map if available
      const currentStockQty = balanceStockMap[item["Product Name"]] ?? (Number(item["Remaining_Stock"]) || 0);
      const current_stock_total_value = Number(item["Total_Remaining_Stock_Value_Rs"]) || 0;
      const current_stock_cgst = Number(item["Remaining_Stock_CGST_Rs"]) || 0;
      const current_stock_sgst = Number(item["Remaining_Stock_SGST_Rs"]) || 0;
      const current_stock_igst = Number(item["Remaining_Stock_IGST_Rs"]) || 0;
      const current_stock_taxable_value = current_stock_total_value - current_stock_cgst - current_stock_sgst - current_stock_igst;
      
      return {
        ...item,
        transaction_taxable_value,
        transaction_cgst,
        transaction_sgst,
        transaction_igst,
        transaction_total_value,
        current_stock: currentStockQty,
        current_stock_taxable_value, 
        current_stock_igst,
        current_stock_cgst,
        current_stock_sgst,
        current_stock_total_value
      };
    });
  }, [data, balanceStockMap]);

  const filteredData = useMemo(() => applyDateFilter(processedData), [processedData, dateFilter, applyDateFilter]);

  useEffect(() => {
    if (onDataUpdate) {
      onDataUpdate(filteredData);
    }
  }, [filteredData, onDataUpdate]);

  const columns = [
    { id: 'serial_no', label: 'S.No', align: 'center' as const, minWidth: 50 },
    { id: 'Date', label: 'Date', format: (value: string) => new Date(value).toLocaleDateString() },
    { id: 'Product Name', label: 'Product Name' },
    { id: 'HSN_Code', label: 'HSN Code' },
    { id: 'Product Type', label: 'Product Type' },
    { id: 'Consumption Qty.', label: 'Qty', align: 'right' as const },
    { id: 'purpose', label: 'Purpose' },
    { id: 'stylist_name', label: 'Stylist' },
    { id: 'Purchase_Cost_per_Unit_Ex_GST_Rs', label: 'Unit Price', align: 'right' as const, format: (v: any) => formatCurrency(v) },
    { id: 'Purchase_GST_Percentage', label: 'GST %', align: 'right' as const, format: (v: any) => `${v}%` },
    { id: 'transaction_taxable_value', label: 'Taxable Value', align: 'right' as const, format: (v: any) => formatCurrency(v) },
    { id: 'transaction_cgst', label: 'CGST (Rs.)', align: 'right' as const, format: (v: any) => formatCurrency(v) },
    { id: 'transaction_sgst', label: 'SGST (Rs.)', align: 'right' as const, format: (v: any) => formatCurrency(v) },
    { id: 'transaction_igst', label: 'IGST (Rs.)', align: 'right' as const, format: (v: any) => formatCurrency(v) }, 
    { id: 'transaction_total_value', label: 'Total Invoice Value', align: 'right' as const, format: (v: any) => formatCurrency(v) },
    { id: 'notes', label: 'Notes' },
    { id: 'current_stock', label: 'Current Stock', align: 'right' as const },
    { id: 'current_stock_taxable_value', label: 'Taxable Value (Stock)', align: 'right' as const, format: (v: any) => formatCurrency(v) },
    { id: 'current_stock_igst', label: 'IGST (Stock)', align: 'right' as const, format: (v: any) => formatCurrency(v) },
    { id: 'current_stock_cgst', label: 'CGST (Stock)', align: 'right' as const, format: (v: any) => formatCurrency(v) },
    { id: 'current_stock_sgst', label: 'SGST (Stock)', align: 'right' as const, format: (v: any) => formatCurrency(v) },
    { id: 'current_stock_total_value', label: 'Total Value (Stock)', align: 'right' as const, format: (v: any) => formatCurrency(v) }
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
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
      // Fetch directly from pos_orders to get salon consumption data
      const { data: rawOrdersData, error: ordersError } = await supabase
        .from('pos_orders')
        .select('id, created_at, services, current_stock')
        .eq('client_name', 'Salon Consumption')
        .order('created_at', { ascending: false });

      if (!rawOrdersData) {
        setData([]);
        return;
      }

      console.log('[SalonConsumptionTab] Fetched raw orders data:', rawOrdersData);

      // Fetch all products from product_master to get HSN codes
      const { data: productsData, error: productsError } = await supabase
        .from('product_master')
        .select('id, name, hsn_code, units, "Purchase_Cost/Unit(Ex.GST)"');

      if (productsError) {
        console.error('Error fetching products:', productsError);
      }

      // Create a map of product ID to product details for quick lookup
      const productMap: Record<string, any> = {};
      if (productsData) {
        productsData.forEach((product: any) => {
          productMap[product.id] = product;
        });
      }

      console.log('[SalonConsumptionTab] Product map created with', Object.keys(productMap).length, 'products');

      // Process raw orders data to extract salon consumption items
      const processedRows: any[] = [];
      let serialNo = 1;

      rawOrdersData.forEach((order: any) => {
        if (order.services && Array.isArray(order.services)) {
          order.services.forEach((service: any) => {
            if (service.type === 'product') {
              const quantity = service.quantity || 1;
              const unitPrice = service.price || 0;
              const gstPercentage = service.gst_percentage || 18;
              
              // Look up product details from product_master using service_id or product_id
              const productId = service.service_id || service.product_id;
              const productDetails = productId ? productMap[productId] : null;
              
              // Get HSN code from product_master, fallback to service JSON
              const hsnCode = productDetails?.hsn_code || service.hsn_code || '-';
              const productType = productDetails?.units || 'TUB-TUBES';
              const purchaseCost = productDetails?.["Purchase_Cost/Unit(Ex.GST)"] || unitPrice;
              
              processedRows.push({
                id: order.id,
                created_at: order.created_at,
                Date: new Date(order.created_at).toISOString().split('T')[0],
                'S.No': `SALON-${serialNo.toString().padStart(2, '0')}`,
                "Product Name": service.name || service.product_name || service.service_name,
                HSN_Code: hsnCode,
                'Product Type': productType,
                "Consumption Qty.": quantity,
                purpose: '',
                stylist_name: '',
                Purchase_Cost_per_Unit_Ex_GST_Rs: purchaseCost,
                Purchase_GST_Percentage: gstPercentage,
                transaction_taxable_value: quantity * purchaseCost,
                transaction_cgst: (quantity * purchaseCost * gstPercentage) / 200,
                transaction_sgst: (quantity * purchaseCost * gstPercentage) / 200,
                transaction_igst: 0,
                transaction_total_value: quantity * purchaseCost * (1 + gstPercentage / 100),
                notes: '',
                current_stock: order.current_stock || 0,
                current_stock_taxable_value: 0,
                current_stock_cgst: 0,
                current_stock_sgst: 0,
                current_stock_igst: 0,
                current_stock_total_value: 0
              });
              serialNo++;
            }
          });
        }
      });

      console.log('[SalonConsumptionTab] Processed rows sample:', processedRows[0] ? {
        'HSN_Code': processedRows[0]['HSN_Code'],
        'Product Name': processedRows[0]['Product Name'],
        'S.No': processedRows[0]['S.No'],
        'Product Type': processedRows[0]['Product Type']
      } : 'No processed data');

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
    { id: 'S.No', label: 'S.No' },
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
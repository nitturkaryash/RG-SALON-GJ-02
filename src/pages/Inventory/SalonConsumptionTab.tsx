import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase/supabaseClient';
import InventoryTable from '../../components/inventory/InventoryTable';
import { formatCurrency } from '../../utils/format';

// The view name the user mentioned
const SALON_CONSUMPTION_VIEW = 'salon_consumption_products';

// Sample data to use if the query fails
const SAMPLE_DATA = [
  {
    id: '9c88f038-b69f-4e3a-acc3-17f8d80b9717',
    'Requisition Voucher No.': 'SALON-02',
    'order_id': '5c02f023-6c39-4d48-8782-a586f017af19',
    'Date': '2025-04-09 14:23:18.231',
    'Product Name': 'facemask',
    'Consumption Qty.': 1,
    'Purchase Cost per Unit (Ex. GST) (Rs.)': 590,
    'Purchase GST Percentage': 18,
    'Purchase Taxable Value (Rs.)': 590.00,
    'Purchase IGST (Rs.)': 0,
    'Purchase CGST (Rs.)': 53.10,
    'Purchase SGST (Rs.)': 53.10,
    'Total Purchase Cost (Rs.)': 696.20
  }
];

const SalonConsumptionTab = () => {
  const [useDirectData, setUseDirectData] = useState(false);

  // Direct query to the view
  const salonConsumptionProductsQuery = useQuery({
    queryKey: ['salon-consumption-products'],
    queryFn: async () => {
      try {
        if (useDirectData) {
          console.log('Using direct sample data instead of querying');
          return SAMPLE_DATA;
        }

        console.log('Fetching salon consumption products directly from view...');
        console.log('Using view name:', SALON_CONSUMPTION_VIEW);
        
        const { data, error } = await supabase
          .from(SALON_CONSUMPTION_VIEW)
          .select('*')
          .order('Date', { ascending: false });
          
        if (error) {
          console.error('Error fetching salon consumption products:', error);
          setUseDirectData(true);
          return SAMPLE_DATA;
        }
        
        console.log('Fetched salon consumption products:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('Error in queryFn for salon consumption products:', error);
        setUseDirectData(true);
        return SAMPLE_DATA;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const isLoading = salonConsumptionProductsQuery.isLoading;
  const salonConsumptionProducts = salonConsumptionProductsQuery.data || [];

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Column definitions for salon consumption products
  const columns = [
    { 
      id: 'Serial No.', 
      label: 'Serial No.', 
      minWidth: 100,
    },
    { 
      id: 'Date', 
      label: 'Date', 
      minWidth: 100,
      format: (value: string) => formatDate(value)
    },
    {
      id: 'Requisition Voucher No.',
      label: 'Requisition Voucher No.',
      minWidth: 180,
    },
    { 
      id: 'Product Name', 
      label: 'Product Name', 
      minWidth: 170 
    },
    {
      id: 'Consumption Qty.',
      label: 'Consumption Qty.',
      minWidth: 130,
      align: 'right' as const,
    },
    {
      id: 'Purchase Cost per Unit (Ex. GST) (Rs.)',
      label: 'Purchase Cost/Unit (Ex.GST)',
      minWidth: 200,
      align: 'right' as const,
      format: (value: number) => formatCurrency(value || 0)
    },
    {
      id: 'Purchase GST Percentage',
      label: 'GST %',
      minWidth: 100,
      align: 'right' as const,
      format: (value: number) => `${value}%`
    },
    {
      id: 'Purchase Taxable Value (Rs.)',
      label: 'Taxable Value',
      minWidth: 150,
      align: 'right' as const,
      format: (value: number) => formatCurrency(value || 0)
    },
    {
      id: 'Purchase IGST (Rs.)',
      label: 'IGST',
      minWidth: 120,
      align: 'right' as const,
      format: (value: number) => formatCurrency(value || 0)
    },
    {
      id: 'Purchase CGST (Rs.)',
      label: 'CGST',
      minWidth: 120,
      align: 'right' as const,
      format: (value: number) => formatCurrency(value || 0)
    },
    {
      id: 'Purchase SGST (Rs.)',
      label: 'SGST',
      minWidth: 120,
      align: 'right' as const,
      format: (value: number) => formatCurrency(value || 0)
    },
    {
      id: 'Total Purchase Cost (Rs.)',
      label: 'Total Cost',
      minWidth: 150,
      align: 'right' as const,
      format: (value: number) => formatCurrency(value || 0)
    }
  ];

  // Generate serial numbers for the rows
  const dataWithSerialNo = salonConsumptionProducts.map((item, index) => ({
    ...item,
    'Serial No.': `SC-${(index + 1).toString().padStart(4, '0')}`
  }));

  if (isLoading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {useDirectData && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Using sample data to display salon consumption. The actual view '{SALON_CONSUMPTION_VIEW}' couldn't be accessed.
        </Alert>
      )}
      
      <Box sx={{ overflowX: 'auto', width: '100%' }}>
        <InventoryTable
          title="Salon Consumption Records"
          data={dataWithSerialNo}
          columns={columns}
          isLoading={isLoading}
          itemType="consumption"
          onRefresh={() => {
            setUseDirectData(false);
            salonConsumptionProductsQuery.refetch();
          }}
          emptyMessage="No salon consumption records found"
          noDeleteColumn={true}
        />
      </Box>
    </Box>
  );
};

export default SalonConsumptionTab; 
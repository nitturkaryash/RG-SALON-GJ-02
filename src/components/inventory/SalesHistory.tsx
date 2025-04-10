import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/supabaseClient';
import { Card, Text, Group, Button, Select, TextInput, Modal, Badge, Table, Center, Loader } from '@mantine/core';
import { DateRangePicker } from '@mantine/dates';
import { showNotification } from '@mantine/notifications';
import { IconCalendar, IconSearch, IconFilter } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useSalesHistory } from '../../hooks/useSalesHistory';

export function SalesHistory() {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    dayjs().subtract(30, 'days').toDate(),
    new Date(),
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string | null>(null);
  
  // Use the hook for data fetching 
  const { salesHistory, isLoading: hookLoading, error: hookError, fetchSalesHistory } = useSalesHistory();

  useEffect(() => {
    console.log('================================');
    console.log('SALES HISTORY COMPONENT MOUNTED');
    console.log('Date Range:', dateRange);
    console.log('================================');
    
    // Remove date range filtering initially to ensure data loads
    const initialLoad = async () => {
      try {
        // Set date range to null to show all data
        setDateRange([null, null]);
        
        // Use the hook data if available
        if (salesHistory && salesHistory.length > 0) {
          console.log('[UI DEBUG] Using hook data:', { count: salesHistory.length });
          processSalesData(salesHistory);
        } else {
          // Fetch directly otherwise
          fetchSalesHistoryData();
        }
      } catch (e) {
        console.error('[UI DEBUG] Setup error:', e);
      }
    };
    
    initialLoad();
    
    // Dispatch event that component is mounted
    const mountedEvent = new CustomEvent('sales-history-mounted');
    window.dispatchEvent(mountedEvent);
    
    // Listen for data loaded events
    const handleDataLoaded = (event: CustomEvent) => {
      console.log('[UI DEBUG] Received sales data loaded event:', event.detail);
      if (salesHistory && salesHistory.length > 0) {
        processSalesData(salesHistory);
      }
    };
    
    window.addEventListener('sales-history-loaded', handleDataLoaded as EventListener);
    
    return () => {
      window.removeEventListener('sales-history-loaded', handleDataLoaded as EventListener);
    };
  }, [salesHistory]);
  
  // Process sales data from hook or direct query
  const processSalesData = (data: any[]) => {
    console.log('[UI DEBUG] Processing sales data:', { count: data.length });
    
    // Apply search filter if needed
    let filteredData = data;
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filteredData = filteredData.filter(sale => {
        const productName = (sale.product_name || '').toLowerCase();
        const customerName = (sale.customer_name || '').toLowerCase();
        const invoiceNumber = (sale.invoice_number || '').toLowerCase();
        
        return productName.includes(lowercaseQuery) || 
               customerName.includes(lowercaseQuery) ||
               invoiceNumber.includes(lowercaseQuery);
      });
    }
    
    // Calculate totals
    let salesTotal = 0;
    let taxTotal = 0;
    
    filteredData.forEach(sale => {
      salesTotal += Number(sale.total_value || sale.total_amount) || 0;
      const tax = Number(sale.tax_amount) || 
                  ((Number(sale.cgst) || 0) + (Number(sale.sgst) || 0) + (Number(sale.igst) || 0));
      taxTotal += tax;
    });
    
    setTotalSales(salesTotal);
    setTotalTax(taxTotal);
    setSalesData(filteredData);
    setLoading(false);
  };
  
  // Add separate effect for filters
  useEffect(() => {
    // Skip on first render
    if (loading) return;
    
    console.log('[UI DEBUG] Filter changed, refreshing data');
    fetchSalesHistoryData();
  }, [dateRange, paymentFilter]);

  const fetchSalesHistoryData = async () => {
    try {
      setLoading(true);
      
      console.log('[UI DEBUG] Fetching Sales History - Start', { time: new Date().toISOString() });
      console.log('[UI DEBUG] Query Filters:', { dateRange, paymentFilter, searchQuery });
      
      // Trigger hook refresh
      fetchSalesHistory();
      
      // Set a timeout to prevent infinite loading if hook doesn't respond
      setTimeout(() => {
        if (loading) {
          setLoading(false);
        }
      }, 5000);
    } catch (error) {
      console.error('[UI DEBUG] Error:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to load sales history. Please try again.',
        color: 'red',
      });
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchSalesHistoryData();
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'Cash':
        return 'green';
      case 'Card':
        return 'blue';
      case 'UPI':
        return 'violet';
      default:
        return 'gray';
    }
  };

  const columns = [
    {
      accessor: 'created_at',
      title: 'Date',
      width: 100,
      render: (row: any) => (
        <Text size="sm">{dayjs(row.created_at).format('DD/MM/YYYY')}</Text>
      ),
    },
    {
      accessor: 'product_name',
      title: 'Product Name',
      width: 150,
      render: (row: any) => (
        <Text size="sm">{row.product_name || 'Unknown Product'}</Text>
      ),
    },
    {
      accessor: 'hsn_code',
      title: 'HSN Code',
      width: 100,
    },
    {
      accessor: 'unit',
      title: 'Unit',
      width: 80,
    },
    {
      accessor: 'quantity',
      title: 'Qty',
      width: 60,
      render: (row: any) => (
        <Text size="sm">{Number(row.quantity).toFixed(0)}</Text>
      ),
    },
    {
      accessor: 'price',
      title: 'Price (Excl. GST)',
      width: 120,
      render: (row: any) => (
        <Text size="sm">₹{Number(row.price).toFixed(2)}</Text>
      ),
    },
    {
      accessor: 'gst_percentage',
      title: 'GST %',
      width: 70,
      render: (row: any) => (
        <Text size="sm">{Number(row.gst_percentage || 0).toFixed(0)}%</Text>
      ),
    },
    {
      accessor: 'discount_percentage',
      title: 'Discount %',
      width: 80,
      render: (row: any) => (
        <Text size="sm">{Number(row.discount_percentage || 0).toFixed(0)}%</Text>
      ),
    },
    {
      accessor: 'price',
      title: 'Taxable Value',
      width: 110,
      render: (row: any) => (
        <Text size="sm">₹{Number(row.price).toFixed(2)}</Text>
      ),
    },
    {
      accessor: 'tax_amount',
      title: 'CGST',
      width: 90,
      render: (row: any) => {
        // Calculate CGST as half of the total tax amount
        const cgst = Number(row.tax_amount || 0) / 2;
        return <Text size="sm">₹{cgst.toFixed(2)}</Text>;
      },
    },
    {
      accessor: 'tax_amount',
      title: 'SGST',
      width: 90,
      render: (row: any) => {
        // Calculate SGST as half of the total tax amount
        const sgst = Number(row.tax_amount || 0) / 2;
        return <Text size="sm">₹{sgst.toFixed(2)}</Text>;
      },
    },
    {
      accessor: 'total_amount',
      title: 'Invoice Value',
      width: 110,
      render: (row: any) => (
        <Text size="sm" weight={600}>₹{Number(row.total_amount).toFixed(2)}</Text>
      ),
    },
    {
      accessor: 'customer_name',
      title: 'Customer',
      width: 130,
      render: (row: any) => (
        <Text size="sm">{row.customer_name || 'Walk-in Customer'}</Text>
      ),
    },
    {
      accessor: 'stylist_name',
      title: 'Stylist',
      width: 130,
      render: (row: any) => (
        <Text size="sm">{row.stylist_name || '-'}</Text>
      ),
    },
    {
      accessor: 'payment_method',
      title: 'Payment Method',
      width: 120,
      render: (row: any) => (
        <Badge color={getPaymentMethodColor(row.payment_method)} size="sm">
          {row.payment_method}
        </Badge>
      ),
    },
    {
      accessor: 'invoice_number',
      title: 'Invoice #',
      width: 120,
    },
  ];

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Card.Section withBorder inheritPadding py="xs">
        <Group position="apart">
          <Text weight={500}>Sales History</Text>
          <Group spacing="xs">
            <Button 
              size="xs" 
              variant="light"
              onClick={() => fetchSalesHistoryData()}
            >
              Refresh
            </Button>
          </Group>
        </Group>
      </Card.Section>

      <Group mt="md" mb="md" position="apart">
        <Group>
          <DateRangePicker
            label="Date Range"
            placeholder="Pick date range"
            value={dateRange}
            onChange={setDateRange}
            icon={<IconCalendar size={16} />}
            clearable={false}
          />
          <Select
            label="Payment Method"
            placeholder="All methods"
            value={paymentFilter}
            onChange={setPaymentFilter}
            data={[
              { value: 'Cash', label: 'Cash' },
              { value: 'Card', label: 'Card' },
              { value: 'UPI', label: 'UPI' },
              { value: 'Other', label: 'Other' },
            ]}
            icon={<IconFilter size={16} />}
            clearable
          />
        </Group>
        <Group>
          <TextInput
            placeholder="Search products, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<IconSearch size={16} />}
            rightSection={
              <Button 
                compact 
                variant="subtle" 
                onClick={handleSearch}
              >
                Search
              </Button>
            }
          />
        </Group>
      </Group>

      <Group position="apart" mb="sm">
        <Text color="dimmed" size="sm">
          Showing {salesData.length} transactions
        </Text>
        <Group spacing="xl">
          <Text size="sm" weight={500}>
            Total Tax: <Text component="span" weight={700}>₹{totalTax.toFixed(2)}</Text>
          </Text>
          <Text size="sm" weight={500}>
            Total Sales: <Text component="span" weight={700}>₹{totalSales.toFixed(2)}</Text>
          </Text>
        </Group>
      </Group>

      {loading ? (
        <Center p="xl">
          <Loader size="md" />
        </Center>
      ) : salesData.length === 0 ? (
        <Center p="xl">
          <Text color="dimmed">No sales records found. Sales data will appear here when available.</Text>
        </Center>
      ) : (
        <Table striped highlightOnHover>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.accessor} style={{ width: column.width }}>
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {salesData.map((row, index) => (
              <tr key={row.id || index}>
                {columns.map((column) => (
                  <td key={`${row.id || index}-${column.accessor}`}>
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
} 
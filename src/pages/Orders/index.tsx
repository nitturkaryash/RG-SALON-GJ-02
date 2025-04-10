import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Tabs, Tab, Divider } from '@mui/material';
import { supabase } from '../../lib/supabase';
import OrdersTable from './OrdersTable';
import { toast } from 'react-toastify';

// Tab interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab panel component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`orders-tabpanel-${index}`}
      aria-labelledby={`orders-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const OrdersPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [salonOrders, setSalonOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // First try to get from Supabase
      const { data: dbOrders, error } = await supabase
        .from('pos_orders')
        .select('*')
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Error fetching orders from database:', error);
        // Fall back to localStorage
        getOrdersFromLocalStorage();
        return;
      }
      
      if (dbOrders && dbOrders.length > 0) {
        console.log(`Fetched ${dbOrders.length} orders from database`);
        const regularOrders = dbOrders.filter(order => order.purchase_type !== 'salon_consumption');
        const salonConsumptionOrders = dbOrders.filter(order => order.purchase_type === 'salon_consumption');
        
        setOrders(regularOrders);
        setSalonOrders(salonConsumptionOrders);
      } else {
        // If no orders in database, try localStorage
        getOrdersFromLocalStorage();
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      getOrdersFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const getOrdersFromLocalStorage = () => {
    try {
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        console.log(`Loaded ${parsedOrders.length} orders from localStorage`);
        
        // Split into regular and salon consumption orders
        const regularOrders = parsedOrders.filter((order: any) => 
          order.purchase_type !== 'salon_consumption' && 
          order.is_salon_consumption !== true
        );
        
        const salonConsumptionOrders = parsedOrders.filter((order: any) => 
          order.purchase_type === 'salon_consumption' || 
          order.is_salon_consumption === true
        );
        
        setOrders(regularOrders);
        setSalonOrders(salonConsumptionOrders);
      } else {
        setOrders([]);
        setSalonOrders([]);
      }
    } catch (error) {
      console.error('Error loading orders from localStorage:', error);
      setOrders([]);
      setSalonOrders([]);
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
    
    // Listen for order-deleted events
    const handleOrderDeleted = () => {
      console.log('Order deleted, refreshing data');
      fetchOrders();
    };
    
    window.addEventListener('order-deleted', handleOrderDeleted);
    
    return () => {
      window.removeEventListener('order-deleted', handleOrderDeleted);
    };
  }, []);

  return (
    <Container maxWidth="lg">
      <Box mt={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Orders
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Customer Orders" />
          <Tab label="Salon Consumption" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <OrdersTable 
            orders={orders} 
            isLoading={isLoading} 
            onOrderDeleted={fetchOrders}
            title="Customer Orders"
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <OrdersTable 
            orders={salonOrders} 
            isLoading={isLoading} 
            onOrderDeleted={fetchOrders}
            title="Salon Consumption Orders"
          />
        </TabPanel>
      </Box>
    </Container>
  );
};

export default OrdersPage; 
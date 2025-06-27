import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { usePOS, deleteOrder } from './usePOS'
import { Order, PaymentMethod } from '../models/orderTypes'
import { toast } from 'react-toastify'
import { supabase } from '../utils/supabase/supabaseClient'
import { normalizeOrders } from '../utils/orderHelpers'
import { useAuthContext } from '../contexts/AuthContext'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { session, user, loading } = useAuthContext();

  // Only fetch data if user is authenticated and auth is not loading
  const isAuthenticated = !!(session || user);
  const shouldFetch = isAuthenticated && !loading;
  
  const loadOrders = async () => {
    try {
      setIsLoading(true)
      
      // First try to load from Supabase
      try {
        const { data: supabaseOrders, error: supabaseError } = await supabase
          .from('pos_orders')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (supabaseError) {
          console.error('Error fetching orders from Supabase:', supabaseError);
          // If Supabase fails, fall back to localStorage
          const storedOrders = localStorage.getItem('orders')
          if (storedOrders) {
            const parsedOrders = JSON.parse(storedOrders)
            console.log(`🔍 USEORDERS DEBUG - Loading ${parsedOrders.length} orders from localStorage`);
            setOrders(normalizeOrders(parsedOrders))
          }
        } else if (supabaseOrders && supabaseOrders.length > 0) {
          // We have orders from Supabase - fetch their services first
          console.log(`🔍 USEORDERS DEBUG - Loading ${supabaseOrders.length} orders from Supabase`);
          
          const ordersWithServices = await Promise.all(supabaseOrders.map(async (order) => {
            const { data: services, error: servicesError } = await supabase
              .from('pos_order_items')
              .select('*')
              .eq('order_id', order.id);
              
            if (servicesError) {
              console.error(`Error fetching services for order ${order.id}:`, servicesError);
            }
            
            // Prefer items table result, but fall back to embedded services array (for legacy/walk-in orders)
            let resolvedServices = servicesError ? [] : services || [];
            if ((resolvedServices.length === 0) && Array.isArray(order.services) && order.services.length > 0) {
              resolvedServices = order.services as any[];
            }
            
            const orderWithServices = {
              ...order,
              services: resolvedServices
            };
            
            // Debug specific orders
            if (order.id === 'sales-0022' || order.stylist_name === 'Sangam') {
              console.log(`🔍 USEORDERS DEBUG - Order ${order.id}:`, {
                id: order.id,
                stylist_name: order.stylist_name,
                stylist_id: order.stylist_id,
                status: order.status,
                servicesCount: orderWithServices.services.length,
                services: orderWithServices.services
              });
            }
            
            return orderWithServices;
          }));
          
          const normalizedOrders = normalizeOrders(ordersWithServices);
          console.log(`🔍 USEORDERS DEBUG - Normalized orders count:`, normalizedOrders.length);
          setOrders(normalizedOrders)
        } else {
          // No orders in Supabase, check localStorage
          console.log(`🔍 USEORDERS DEBUG - No orders in Supabase, checking localStorage`);
          const storedOrders = localStorage.getItem('orders')
          if (storedOrders) {
            const parsedOrders = JSON.parse(storedOrders)
            console.log(`🔍 USEORDERS DEBUG - Loading ${parsedOrders.length} orders from localStorage (fallback)`);
            setOrders(normalizeOrders(parsedOrders))
          } else {
            // No orders anywhere
            console.log(`🔍 USEORDERS DEBUG - No orders found anywhere`);
            setOrders([])
          }
        }
      } catch (supabaseErr) {
        console.error('Error in Supabase query:', supabaseErr)
        // Fall back to localStorage
        const storedOrders = localStorage.getItem('orders')
        if (storedOrders) {
          const parsedOrders = JSON.parse(storedOrders)
          setOrders(normalizeOrders(parsedOrders))
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      setOrders([]) // Set empty array on error to prevent undefined
    } finally {
      setIsLoading(false)
    }
  }
  
  // Load orders from Supabase or localStorage
  useEffect(() => {
    // Only load orders if user is authenticated and auth is not loading
    if (shouldFetch) {
      loadOrders()
    } else if (!loading) {
      // Reset orders when not authenticated (but only after loading is complete)
      setOrders([])
      setIsLoading(false)
    }
    
    // Add event listener for refreshing orders
    const handleRefreshOrders = () => {
      console.log('Refreshing orders...')
      loadOrders()
    }
    
    // Add event listener for deleted orders
    const handleOrderDeleted = () => {
      console.log('Order deleted, refreshing list...')
      loadOrders()
    }
    
    window.addEventListener('refresh-orders', handleRefreshOrders)
    window.addEventListener('order-deleted', handleOrderDeleted)
    
    return () => {
      window.removeEventListener('refresh-orders', handleRefreshOrders)
      window.removeEventListener('order-deleted', handleOrderDeleted)
    }
  }, [shouldFetch, loading])
  
  // Get an order by ID
  const getOrder = (id: string): Order | undefined => {
    return orders.find((order) => order.id === id || order.order_id === id)
  }
  
  // Get orders by appointment ID
  const getOrdersByAppointmentId = async (appointmentId: string): Promise<Order[]> => {
    if (!appointmentId) {
      console.error('getOrdersByAppointmentId: appointmentId is undefined or null');
      return [];
    }
    
    try {
      console.log(`Fetching orders for appointment ID: ${appointmentId}`);
      
      // First try to fetch from Supabase
      const { data: supabaseOrders, error: supabaseError } = await supabase
        .from('pos_orders')
        .select('*')
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: false });
      
      if (supabaseError) {
        console.error('Error fetching orders by appointment ID from Supabase:', supabaseError);
        // Fallback to local orders
        const localOrders = orders.filter(order => order.appointment_id === appointmentId);
        console.log(`Found ${localOrders.length} matching orders in local state`);
        return localOrders;
      }
      
      console.log(`Found ${supabaseOrders?.length || 0} matching orders in Supabase`);
      
      if (supabaseOrders && supabaseOrders.length > 0) {
        // Process orders and fetch their services
        const ordersWithServices = await Promise.all(supabaseOrders.map(async (order) => {
          console.log(`Fetching services for order ID: ${order.id}`);
          const { data: services, error: servicesError } = await supabase
            .from('pos_order_items')
            .select('*')
            .eq('order_id', order.id);
            
          if (servicesError) {
            console.error(`Error fetching services for order ${order.id}:`, servicesError);
          }
          
          // Prefer items table result, but fall back to embedded services array (for legacy/walk-in orders)
          let resolvedServices = servicesError ? [] : services || [];
          if ((resolvedServices.length === 0) && Array.isArray(order.services) && order.services.length > 0) {
            resolvedServices = order.services as any[];
          }
          
          return {
            ...order,
            services: resolvedServices
          };
        }));
        
        const normalizedOrders = normalizeOrders(ordersWithServices);
        console.log(`Returning ${normalizedOrders.length} orders with services`);
        return normalizedOrders;
      }
      
      // Fallback to local orders
      const localOrders = orders.filter(order => order.appointment_id === appointmentId);
      console.log(`No orders found in Supabase, returning ${localOrders.length} local orders`);
      return localOrders;
    } catch (err) {
      console.error('Error in getOrdersByAppointmentId:', err);
      return [];
    }
  };
  
  // Add a refresh function
  const refreshOrders = () => {
    loadOrders()
  }
  
  // Delete an order
  const deleteOrderById = async (orderId: string) => {
    try {
      setIsLoading(true)
      const result = await deleteOrder(orderId)
      
      if (result.success) {
        toast.success('Order deleted successfully')
        // Refresh orders list
        loadOrders()
        return true
      } else {
        toast.error('Failed to delete order: ' + (result.error || 'Unknown error'))
        return false
      }
    } catch (err) {
      toast.error('Error deleting order')
      console.error('Error in deleteOrderById:', err)
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  // Delete all orders
  const deleteAllOrders = async () => {
    try {
      setIsLoading(true)
      
      // First try to delete all orders from Supabase
      try {
        console.log('Starting to delete all orders...');
        
        // Delete all order items first to maintain referential integrity
        const { error: itemsError } = await supabase
          .from('pos_order_items')
          .delete()
          .not('id', 'is', null); // Delete all items without using 'neq' which causes UUID syntax error
        
        if (itemsError) {
          console.error('Error deleting all order items from Supabase:', itemsError);
          toast.error(`Failed to delete order items: ${itemsError.message}`);
          return false;
        }
        
        console.log('Successfully deleted all order items');
        
        // Then delete all orders
        const { error: deleteError } = await supabase
          .from('pos_orders')
          .delete()
          .not('id', 'is', null); // Delete all orders without using 'neq' which causes UUID syntax error
        
        if (deleteError) {
          console.error('Error deleting all orders from Supabase:', deleteError);
          toast.error(`Failed to delete orders: ${deleteError.message}`);
          return false;
        }
        
        console.log('Successfully deleted all orders');
        
        // Also clear localStorage
        localStorage.setItem('orders', JSON.stringify([]));
        
        // Refresh the orders list
        loadOrders();
        return true;
      } catch (dbError) {
        console.error('Error in Supabase delete all operation:', dbError);
        toast.error(`Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
        return false;
      }
    } catch (err) {
      toast.error('Error deleting all orders')
      console.error('Error in deleteAllOrders:', err)
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  return {
    orders,
    isLoading,
    error,
    getOrder,
    getOrdersByAppointmentId,
    refreshOrders,
    deleteOrderById,
    deleteAllOrders
  }
}

// ... other functions ... 
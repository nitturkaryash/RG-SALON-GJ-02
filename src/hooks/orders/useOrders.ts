import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePOS, deleteOrder } from './usePOS'; // fix this
import { renumberAllOrders } from '../../utils/orderRenumbering';
import { Order, PaymentMethod } from '../../models/orderTypes';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
// normalizeOrders function - placeholder implementation
const normalizeOrders = (orders: any[]) => orders;
import { useAuthContext } from '../../contexts/AuthContext';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { session, user, loading } = useAuthContext();

  // Only fetch data if user is authenticated and auth is not loading
  const isAuthenticated = !!(session || user);
  const shouldFetch = isAuthenticated && !loading;

  const loadOrders = async () => {
    try {
      setIsLoading(true);

      // First try to load from Supabase
      try {
        // Fetch all orders in chunks to overcome the 1000 row limit
        let allOrders: any[] = [];
        let from = 0;
        const chunkSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data: supabaseOrders, error: supabaseError } = await supabase
            .from('pos_orders')
            .select('*, pos_order_items(*)') // Fetch orders and their items in one go
            .order('created_at', { ascending: false })
            .range(from, from + chunkSize - 1);

          if (supabaseError) {
            console.error(
              'Error fetching orders from Supabase:',
              supabaseError
            );
            // If Supabase fails, fall back to localStorage
            const storedOrders = localStorage.getItem('orders');
            if (storedOrders) {
              const parsedOrders = JSON.parse(storedOrders);
              console.log(
                `🔍 USEORDERS DEBUG - Loading ${parsedOrders.length} orders from localStorage`
              );
              setOrders(normalizeOrders(parsedOrders));
            }
            return;
          }

          if (supabaseOrders && supabaseOrders.length > 0) {
            allOrders = [...allOrders, ...supabaseOrders];
            from += chunkSize;
          } else {
            hasMore = false;
          }
        }

        console.log(
          `Loaded a total of ${allOrders.length} orders from Supabase.`
        );

        const processedOrders = allOrders.map(order => {
          // Handle services from both pos_order_items and the services JSONB field
          let services = order.pos_order_items || [];

          // If pos_order_items is empty but services field exists, use that
          if (services.length === 0 && order.services) {
            // Parse services if it's a string, otherwise use as-is
            if (typeof order.services === 'string') {
              try {
                services = JSON.parse(order.services);
              } catch (e) {
                console.warn('Failed to parse services JSON:', e);
                services = [];
              }
            } else if (Array.isArray(order.services)) {
              services = order.services;
            }
          }

          return {
            ...order,
            services: services || [],
          };
        });

        setOrders(processedOrders);
        localStorage.setItem('orders', JSON.stringify(processedOrders));
      } catch (error) {
        console.error('An error occurred during order loading:', error);
        // Fall back to localStorage
        const storedOrders = localStorage.getItem('orders');
        if (storedOrders) {
          const parsedOrders = JSON.parse(storedOrders);
          setOrders(normalizeOrders(parsedOrders));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setOrders([]); // Set empty array on error to prevent undefined
    } finally {
      setIsLoading(false);
    }
  };

  // Load orders from Supabase or localStorage
  useEffect(() => {
    // Only load orders if user is authenticated and auth is not loading
    if (shouldFetch) {
      loadOrders();
    } else if (!loading) {
      // Reset orders when not authenticated (but only after loading is complete)
      setOrders([]);
      setIsLoading(false);
    }

    // Add event listener for refreshing orders
    const handleRefreshOrders = () => {
      console.log('Refreshing orders...');
      loadOrders();
    };

    // Add event listener for deleted orders
    const handleOrderDeleted = () => {
      console.log('Order deleted, refreshing list...');
      loadOrders();
    };

    window.addEventListener('refresh-orders', handleRefreshOrders);
    window.addEventListener('order-deleted', handleOrderDeleted);

    return () => {
      window.removeEventListener('refresh-orders', handleRefreshOrders);
      window.removeEventListener('order-deleted', handleOrderDeleted);
    };
  }, [shouldFetch, loading]);

  // Get an order by ID
  const getOrder = (id: string): Order | undefined => {
    return orders.find(order => order.id === id);
  };

  // Get orders by appointment ID
  const getOrdersByAppointmentId = async (
    appointmentId: string
  ): Promise<Order[]> => {
    if (!appointmentId) {
      console.error(
        'getOrdersByAppointmentId: appointmentId is undefined or null'
      );
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
        console.error(
          'Error fetching orders by appointment ID from Supabase:',
          supabaseError
        );
        // Fallback to local orders
        const localOrders = orders.filter(
          order => order.appointment_id === appointmentId
        );
        console.log(
          `Found ${localOrders.length} matching orders in local state`
        );
        return localOrders;
      }

      console.log(
        `Found ${supabaseOrders?.length || 0} matching orders in Supabase`
      );

      if (supabaseOrders && supabaseOrders.length > 0) {
        // Process orders and fetch their services
        const ordersWithServices = await Promise.all(
          supabaseOrders.map(async (order: any) => {
            console.log(`Fetching services for order ID: ${order.id}`);
            const { data: services, error: servicesError } = await supabase
              .from('pos_order_items')
              .select('*')
              .eq('pos_order_id', order.id);

            if (servicesError) {
              console.error(
                `Error fetching services for order ${order.id}:`,
                servicesError
              );
            }

            // Prefer items table result, but fall back to embedded services array (for legacy/walk-in orders)
            let resolvedServices = servicesError ? [] : services || [];
            if (
              resolvedServices.length === 0 &&
              Array.isArray(order.services) &&
              order.services.length > 0
            ) {
              resolvedServices = order.services as any[];
            }

            return {
              ...order,
              services: resolvedServices,
            };
          })
        );

        const normalizedOrders = normalizeOrders(ordersWithServices);
        console.log(
          `Returning ${normalizedOrders.length} orders with services`
        );
        return normalizedOrders;
      }

      // Fallback to local orders
      const localOrders = orders.filter(
        order => order.appointment_id === appointmentId
      );
      console.log(
        `No orders found in Supabase, returning ${localOrders.length} local orders`
      );
      return localOrders;
    } catch (err) {
      console.error('Error in getOrdersByAppointmentId:', err);
      return [];
    }
  };

  // Add a refresh function
  const refreshOrders = () => {
    loadOrders();
  };

  // Delete an order
  const deleteOrderById = async (orderId: string) => {
    try {
      setIsLoading(true);
      const result = await deleteOrder(orderId);

      if (result.success) {
        toast.success('Order deleted successfully');
        // Refresh orders list
        loadOrders();
        return true;
      } else {
        toast.error(
          'Failed to delete order: ' + (result.error || 'Unknown error')
        );
        return false;
      }
    } catch (err) {
      toast.error('Error deleting order');
      console.error('Error in deleteOrderById:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete all orders
  const deleteAllOrders = async () => {
    try {
      setIsLoading(true);

      // First try to delete all orders from Supabase
      try {
        console.log('Starting to delete all orders...');

        // Delete all order items first to maintain referential integrity
        const { error: itemsError } = await supabase
          .from('pos_order_items')
          .delete()
          .not('id', 'is', null); // Delete all items without using 'neq' which causes UUID syntax error

        if (itemsError) {
          console.error(
            'Error deleting all order items from Supabase:',
            itemsError
          );
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
          console.error(
            'Error deleting all orders from Supabase:',
            deleteError
          );
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
        toast.error(
          `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`
        );
        return false;
      }
    } catch (err) {
      toast.error('Error deleting all orders');
      console.error('Error in deleteAllOrders:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete orders within a date range in a single operation
  const deleteOrdersInDateRange = async (startDate?: Date, endDate?: Date) => {
    try {
      setIsLoading(true);
      console.log(
        `Deleting orders from ${startDate?.toISOString() || 'beginning'} to ${endDate?.toISOString() || 'now'}`
      );

      // Step 1: Find all orders within the date range
      let selectQuery = supabase.from('pos_orders').select('id');

      if (startDate) {
        const startDateStr = new Date(
          startDate.setHours(0, 0, 0, 0)
        ).toISOString();
        selectQuery = selectQuery.gte('created_at', startDateStr);
      }

      if (endDate) {
        const endDateStr = new Date(
          endDate.setHours(23, 59, 59, 999)
        ).toISOString();
        selectQuery = selectQuery.lte('created_at', endDateStr);
      }

      const { data: ordersToDelete, error: selectError } = await selectQuery;

      if (selectError) {
        console.error('Error fetching orders to delete:', selectError);
        toast.error(`Failed to find orders to delete: ${selectError.message}`);
        return false;
      }

      if (!ordersToDelete || ordersToDelete.length === 0) {
        toast.info('No orders found in the selected date range to delete.');
        return true; // No error, just nothing to do
      }

      const orderIds = ordersToDelete.map((order: any) => order.id);

      // Step 2: Delete all items associated with those orders
      const { error: deleteItemsError } = await supabase
        .from('pos_order_items')
        .delete()
        .in('pos_order_id', orderIds);

      if (deleteItemsError) {
        console.error(
          'Error deleting order items in date range:',
          deleteItemsError
        );
        toast.error(
          `Failed to delete order items: ${deleteItemsError.message}`
        );
        return false;
      }

      // Step 3: Delete the orders themselves
      const { error: deleteOrdersError, count } = await supabase
        .from('pos_orders')
        .delete()
        .in('id', orderIds);

      if (deleteOrdersError) {
        console.error(
          'Error deleting orders in date range:',
          deleteOrdersError
        );
        toast.error(`Failed to delete orders: ${deleteOrdersError.message}`);
        return false;
      }

      console.log(
        `Successfully deleted ${count} orders and their items in the date range.`
      );
      toast.success(`Successfully deleted ${count} orders.`);

      // Refresh the orders list
      loadOrders();
      return true;
    } catch (err) {
      toast.error('Error deleting orders in date range');
      console.error('Error in deleteOrdersInDateRange:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    orders,
    isLoading,
    error,
    getOrder,
    getOrdersByAppointmentId,
    refreshOrders,
    deleteOrderById,
    deleteAllOrders,
    deleteOrdersInDateRange,
  };
}

// ... other functions ...

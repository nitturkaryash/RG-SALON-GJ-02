import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { usePOS, deleteOrder } from './usePOS'
import { Order, PaymentMethod } from '../models/orderTypes'
import { toast } from 'react-toastify'
import { supabase } from '../utils/supabase/supabaseClient'
import { normalizeOrders } from '../utils/orderHelpers'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
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
            setOrders(normalizeOrders(parsedOrders))
          }
        } else if (supabaseOrders && supabaseOrders.length > 0) {
          // We have orders from Supabase - normalize and use them
          setOrders(normalizeOrders(supabaseOrders))
        } else {
          // No orders in Supabase, check localStorage
          const storedOrders = localStorage.getItem('orders')
          if (storedOrders) {
            const parsedOrders = JSON.parse(storedOrders)
            setOrders(normalizeOrders(parsedOrders))
          } else {
            // No orders anywhere
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
    loadOrders()
    
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
  }, [])
  
  // Get an order by ID
  const getOrder = (id: string): Order | undefined => {
    return orders.find((order) => order.id === id || order.order_id === id)
  }
  
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
    refreshOrders,
    deleteOrderById,
    deleteAllOrders
  }
}

// ... other functions ... 
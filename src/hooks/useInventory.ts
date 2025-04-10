import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, TABLES, handleSupabaseError } from '../utils/supabase/supabaseClient';
import {
  InventoryStats,
  Purchase,
  PurchaseItem,
  Sale,
  Consumption,
  BalanceStock,
  ConsumptionFormState,
  ProcessingStats,
  InventoryExportData,
  InventoryFilterType,
  InventoryOrderType
} from '../models/inventoryTypes';
import { v4 } from 'uuid';
import { toast } from 'react-toastify';

// Helper function to load orders from localStorage
const loadOrdersFromStorage = (): any[] => {
  try {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      return JSON.parse(savedOrders);
    }
    return [];
  } catch (error) {
    console.error('Error loading orders from localStorage:', error);
    return [];
  }
};

// GST rate for calculating tax amounts
const GST_RATE = 0.18; // 18% GST

// Define query keys as a proper interface to fix TypeScript errors
const QUERY_KEYS = {
  PURCHASES: 'purchases',
  SALES: 'sales',
  CUSTOMER_SALES: 'customer-sales',
  CONSUMPTION: 'consumption',
  BALANCE_STOCK: 'balance-stock',
  INVENTORY_PRODUCTS: 'inventory-products'
} as const;

// Add interface for salon consumption recording
export interface SalonConsumptionItem {
  product_name: string;
  quantity: number;
  purpose: string;
  // Financial values from POS
  unit_price?: number;
  hsn_code?: string;
  units?: string;
  date?: string;
  requisition_voucher_no?: string;
}

// Define the form state interface for the purchase form
export interface PurchaseFormState {
  product_name: string;
  hsn_code?: string;
  units?: string;
  date: string;
  purchase_qty: number;
  mrp_incl_gst: number;
  gst_percentage: number;
  discount_on_purchase_percentage?: number;
  vendor_name?: string;
  invoice_no?: string;
  purchase_cost_per_unit_ex_gst?: number; // Add this field
}

// Add interface for salon consumption recording
export interface SalonConsumptionRecord {
  id: string;
  order_id: string;
  date: string;
  product_name: string;
  quantity: number;
  stylist?: string;
  status: string;
  total: number;
  type: string;
  payment_method: string;
}

// Add the retry function implementation locally to avoid import issues
const retryDatabaseOperation = async <T>(
  operation: () => Promise<T>, 
  maxRetries = 3
): Promise<T> => {
  let retries = 0;
  let lastError: any = null;
  
  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      retries++;
      console.log(`Database operation failed, retrying (${retries}/${maxRetries})...`, error);
      
      // Exponential backoff with jitter
      const delay = Math.min(1000 * Math.pow(2, retries) + Math.random() * 1000, 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.error(`Database operation failed after ${maxRetries} retries`, lastError);
  throw lastError;
};

export const useInventory = () => {
  const queryClient = useQueryClient();
  const [isCreatingPurchase, setIsCreatingPurchase] = useState(false);
  const [isSyncingSales, setIsSyncingSales] = useState(false);
  const [isSyncingConsumption, setIsSyncingConsumption] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [processingStats, setProcessingStats] = useState<ProcessingStats | null>(null);

  // Add a flag to prevent duplicate syncing
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Function to initialize consumption data directly from orders
  const initializeConsumptionData = async () => {
    try {
      console.log('Initializing consumption data from orders');
      
      // Check if we already have consumption data
      const localConsumptionData = localStorage.getItem('inventory_consumption');
      if (localConsumptionData) {
        try {
          const parsedData = JSON.parse(localConsumptionData);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            console.log(`Already have ${parsedData.length} consumption records, skipping initialization`);
            return;
          }
        } catch (e) {
          console.warn('Error parsing existing consumption data:', e);
        }
      }
      
      // Get orders from localStorage
      const ordersStr = localStorage.getItem('orders');
      if (!ordersStr) {
        console.log('No orders found for initialization');
        return;
      }
      
      let allOrders = [];
      try {
        allOrders = JSON.parse(ordersStr);
      } catch (e) {
        console.error('Error parsing orders for initialization:', e);
        return;
      }
      
      if (!Array.isArray(allOrders) || allOrders.length === 0) {
        console.log('No valid orders found for initialization');
        return;
      }
      
      // Filter for salon consumption orders
      const salonConsumptionOrders = allOrders.filter((order: any) => 
        order.is_salon_consumption === true || 
        order.purchase_type === 'salon_consumption' || 
        order.order_type === 'salon_consumption' ||
        (order.customer_name === 'Salon Internal' && order.items && order.items.some((item: any) => item.type && item.type.toLowerCase() === 'product'))
      );
      
      if (salonConsumptionOrders.length === 0) {
        console.log('No salon consumption orders found for initialization');
        return;
      }
      
      console.log(`Found ${salonConsumptionOrders.length} salon consumption orders for initialization`);
      
      // Transform orders into consumption records
      const consumptionRecords: SalonConsumptionRecord[] = [];
      
      for (const order of salonConsumptionOrders) {
        // Get product items from the order
        const productItems = order.items || order.services || [];
        
        // Process each product item
        for (const item of productItems) {
          if (!item || typeof item !== 'object') continue;
          // Make type checking less strict - allow both 'product' and 'Product' types
          if (item.type && item.type.toLowerCase() !== 'product') continue;
          
          try {
            // Ensure price is a valid number
            const price = typeof item.price === 'number' ? item.price : 0;
            
            // Ensure quantity is a valid number
            const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
            
            // Calculate total with defined values
            const itemTotal = price * quantity;
            
            const consumptionRecord: SalonConsumptionRecord = {
              id: item.id || `${order.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              order_id: order.id || order.order_id || `ORDER-${Date.now()}`,
              date: order.created_at || order.order_date || order.date || new Date().toISOString(),
              product_name: item.item_name || item.name || item.product_name || 'Unknown Product',
              quantity: quantity,
              stylist: order.stylist_name || order.staff_name || 'No stylist',
              status: order.status || 'Completed',
              total: itemTotal,
              type: 'Product',
              payment_method: order.payment_method || order.payment_type || 'Cash'
            };
            
            consumptionRecords.push(consumptionRecord);
          } catch (e) {
            console.warn('Error processing item for initialization:', e);
          }
        }
      }
      
      if (consumptionRecords.length === 0) {
        console.log('No consumption records created during initialization');
        return;
      }
      
      console.log(`Created ${consumptionRecords.length} consumption records during initialization`);
      
      // Store in localStorage
      localStorage.setItem('inventory_consumption', JSON.stringify(consumptionRecords));
      
      // Also try to save to Supabase if possible
      try {
        // Use constant for table name with fallback
        const consumptionTable = TABLES.CONSUMPTION || 'inventory_consumption';
        
        const { error } = await supabase
          .from(consumptionTable)
          .upsert(consumptionRecords, { onConflict: 'id', ignoreDuplicates: false });
        
        if (error) {
          console.warn('Error saving initialized data to Supabase:', error);
        } else {
          console.log('Successfully saved initialized data to Supabase');
        }
      } catch (error) {
        console.warn('Error during Supabase save of initialized data:', error);
      }
        
    } catch (error) {
      console.error('Error initializing consumption data:', error);
    }
  };

  // Call the initialization function when the hook is used
  useEffect(() => {
    initializeConsumptionData();
  }, []);

  // Function to calculate derived values for purchases
  const calculatePurchaseValues = (data: PurchaseFormState): Partial<Purchase> => {
    const mrpInclGst = data.mrp_incl_gst;
    const gstPercentage = data.gst_percentage;
    const discountPercentage = data.discount_on_purchase_percentage || 0;
    const quantity = data.purchase_qty;
    
    // Calculate MRP excluding GST
    const mrpExclGst = mrpInclGst / (1 + (gstPercentage / 100));
    
    // Calculate or use provided purchase cost per unit ex GST
    const costPerUnitExGst = data.purchase_cost_per_unit_ex_gst || mrpExclGst * (1 - (discountPercentage / 100));
    
    // Apply discount if not using provided cost
    const discountedRate = data.purchase_cost_per_unit_ex_gst || mrpExclGst * (1 - (discountPercentage / 100));
    
    // Calculate taxable value (rate * quantity)
    const taxableValue = discountedRate * quantity;
    
    // Calculate GST amounts
    const totalGst = taxableValue * (gstPercentage / 100);
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    const igst = 0; // Assuming IGST is 0 for local purchases
    
    // Calculate invoice value
    const invoiceValue = taxableValue + totalGst;
    
    return {
      ...data,
      mrp_excl_gst: parseFloat(mrpExclGst.toFixed(2)),
      purchase_cost_per_unit_ex_gst: parseFloat(costPerUnitExGst.toFixed(2)),
      purchase_taxable_value: parseFloat(taxableValue.toFixed(2)),
      purchase_igst: parseFloat(igst.toFixed(2)),
      purchase_cgst: parseFloat(cgst.toFixed(2)),
      purchase_sgst: parseFloat(sgst.toFixed(2)),
      purchase_invoice_value_rs: parseFloat(invoiceValue.toFixed(2)),
    };
  };

  // Query to fetch purchases
  const purchasesQuery = useQuery({
    queryKey: [QUERY_KEYS.PURCHASES],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from(TABLES.PURCHASES)
          .select('*')
          .order('date', { ascending: false });
        
        if (error) {
          console.error('Error fetching purchases:', error);
          // Return empty array instead of throwing error to avoid showing mock data
          return [];
        }
        
        return data as Purchase[];
      } catch (error) {
        console.error('Error fetching purchases:', error);
        // Return empty array instead of throwing error to avoid showing mock data
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Query to fetch sales
  const salesQuery = useQuery({
    queryKey: [QUERY_KEYS.SALES],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from(TABLES.SALES)
          .select('*')
          .order('date', { ascending: false });
        
        if (error) {
          console.error('Error fetching sales:', error);
          // Return empty array instead of throwing error to avoid showing mock data
          return [];
        }
        
        return data as Sale[];
      } catch (error) {
        console.error('Error fetching sales:', error);
        // Return empty array instead of throwing error to avoid showing mock data
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Update the consumption query to properly identify salon consumption records
  const consumptionQuery = useQuery({
    queryKey: ['salon-consumption'],
    queryFn: async () => {
      try {
        console.log('Fetching salon consumption data...');
        
        // Make sure we have a valid table name with fallback
        const tableNameToUse = TABLES.SALON_CONSUMPTION || 'salon_consumption_orders';
        console.log('Using table name:', tableNameToUse);
        
        // Check if we have the table first to avoid 404 errors
        const { count, error: checkError } = await supabase
          .from(tableNameToUse)
          .select('*', { count: 'exact', head: true });
          
        if (checkError) {
          console.error('Salon consumption table does not exist or has an error:', checkError);
          
          // Exit early if the table doesn't exist to prevent continuous retries
          return [];
        }
        
        // Use proper table name reference with fallback
        const { data, error } = await supabase
          .from(tableNameToUse)
          .select(`
            id,
            order_id,
            date,
            product_name,
            quantity,
            stylist_name,
            status,
            total_amount,
            type,
            payment_method
          `)
          .order('date', { ascending: false });
          
        if (error) throw error;
        return data || [];
      } catch (error) {
        // Handle errors and prevent continuous retries by returning empty array
        console.error('Error fetching salon consumption:', error);
        return [];
      }
    },
    // Increase staleTime to reduce unnecessary refetches
    staleTime: 30000, // 30 seconds
    // Disable retries on error to prevent constant 404s
    retry: false,
  });

  // Query to fetch balance stock
  const balanceStockQuery = useQuery({
    queryKey: [QUERY_KEYS.BALANCE_STOCK],
    queryFn: async () => {
      try {
        // Log the actual table name being used for debugging
        console.log('Querying balance stock table:', TABLES.BALANCE_STOCK);
        
        // Ensure we're using a valid table name, not undefined
        const tableName = TABLES.BALANCE_STOCK || 'inventory_balance_stock';
        
        const { data, error } = await supabase
          .from(tableName)
          .select('*');
        
        if (error) {
          console.error("Error querying " + tableName + ":", error);
          throw handleSupabaseError(error);
        }
        
        // Log success for debugging
        console.log(`Successfully fetched ${data?.length || 0} balance stock records`);
        return data as BalanceStock[];
      } catch (error) {
        console.error('Error fetching balance stock:', error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Query to fetch customer sales only (no salon consumption)
  const customerSalesQuery = useQuery({
    queryKey: [QUERY_KEYS.CUSTOMER_SALES],
    queryFn: async () => {
      try {
        // First, check if the column exists by getting the table structure
        const { error: tableError } = await supabase
          .from(TABLES.SALES)
          .select('id')
          .limit(1);
        
        let data;
        let error;
        
        // If is_salon_consumption field exists, filter by it
        if (!tableError) {
          const result = await supabase
            .from(TABLES.SALES)
            .select('*')
            .order('date', { ascending: false });
          
          data = result.data;
          error = result.error;
          
          // Filter in JavaScript instead of SQL to avoid errors if column doesn't exist
          if (data && Array.isArray(data)) {
            data = data.filter(sale => !sale.is_salon_consumption);
          }
        }
        
        if (error) {
          console.error('Error fetching customer sales:', error);
          return [];
        }
        
        return data as Sale[];
      } catch (error) {
        console.error('Error fetching customer sales:', error);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Mutation to create a new purchase
  const createPurchaseMutation = useMutation({
    mutationFn: async (purchaseData: PurchaseFormState) => {
      setIsCreatingPurchase(true);
      try {
        // Calculate derived values
        const fullPurchaseData = calculatePurchaseValues(purchaseData);
        
        // Generate a valid UUID for the id field
        const generateUUID = () => {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        };
        
        // Map fields correctly to match the Supabase table structure
        const mappedPurchaseData = {
          // Required fields with NOT NULL constraints
          id: generateUUID(),
          date: fullPurchaseData.date || new Date().toISOString().split('T')[0],
          purchase_qty: fullPurchaseData.purchase_qty || 0,
          purchase_invoice_value_rs: fullPurchaseData.purchase_invoice_value_rs || 0,
          
          // Other fields from form data
          ...fullPurchaseData,
          
          // Metadata
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          
          // Optional identifier
          purchase_id: `purchase-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        };
        
        console.log('Attempting to insert into database:', mappedPurchaseData);
        
        // Insert into Supabase with more detailed error handling
        const { data, error } = await supabase
          .from(TABLES.PURCHASES)
          .insert([mappedPurchaseData])
          .select();
        
        if (error) {
          console.error('Supabase error during insert:', error);
          
          // Check for common issues
          if (error.message.includes('violates not-null constraint')) {
            console.error('Missing required field. Check that all NOT NULL fields have values.');
          } else if (error.message.includes('duplicate key')) {
            console.error('Duplicate ID detected. Try again with a new unique ID.');
          } else if (error.message.includes('permission denied')) {
            console.error('Permission denied. Check RLS policies for this table.');
          }
          
          throw handleSupabaseError(error);
        }
        
        if (!data || data.length === 0) {
          console.error('No data returned from Supabase insert');
          throw new Error('No data returned from purchase insert operation');
        }
        
        console.log('Supabase insert response:', data);
        
        // Verify the data was actually inserted by doing a fetch right after
        try {
          const { data: verificationData, error: verificationError } = await supabase
            .from(TABLES.PURCHASES)
            .select('*')
            .eq('id', mappedPurchaseData.id)
            .single();
            
          if (verificationError) {
            console.warn('Could not verify the inserted data:', verificationError);
          } else if (!verificationData) {
            console.warn('Verification query returned empty result - data might not be saved!');
          } else {
            console.log('Data successfully verified in database:', verificationData);
          }
        } catch (verifyError) {
          console.warn('Error during insert verification:', verifyError);
        }
        
        return data as Purchase[];
      } catch (error) {
        console.error('Error creating purchase:', error);
        throw error;
      } finally {
        setIsCreatingPurchase(false);
      }
    },
    onSuccess: (data) => {
      console.log('Purchase creation successful, invalidating queries');
      // Invalidate cache and refetch data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALANCE_STOCK] });
      
      // Also dispatch a global refresh event
      window.dispatchEvent(new CustomEvent('refresh-inventory-data'));
    },
    onError: (error) => {
      console.error('Purchase creation mutation failed:', error);
      alert(`Failed to save purchase to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Function to create a new purchase
  const createPurchase = async (purchaseData: PurchaseFormState) => {
    try {
      console.log('Creating purchase with data:', purchaseData);
      
      // Wrap in try/catch to better handle the mutation
      try {
        const result = await createPurchaseMutation.mutateAsync(purchaseData);
        console.log('Purchase creation response:', result);
        
        if (!result || result.length === 0) {
          console.error('No purchase returned after insertion');
          
          // Try direct insertion as a fallback
          console.log('Attempting direct insertion as fallback...');
          const directResult = await insertPurchaseDirectly(purchaseData);
          
          if (directResult) {
            console.log('Direct insertion successful:', directResult);
            // Manually invalidate queries
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALANCE_STOCK] });
            
            // Force immediate recalculation of balance stock
            await recalculateBalanceStock();
            
            // Also trigger global event for other components
            window.dispatchEvent(new CustomEvent('inventory-updated', { detail: { type: 'purchase', data: directResult } }));
            
            return directResult;
          }
          
          throw new Error('Failed to create purchase - no data returned');
        }
        
        console.log('Successfully created purchase:', result[0]);
        
        // Force immediate recalculation of balance stock
        await recalculateBalanceStock();
        
        // Trigger global event for other components
        window.dispatchEvent(new CustomEvent('inventory-updated', { detail: { type: 'purchase', data: result[0] } }));
        
        // Return the first purchase from the array
        return result[0];
      } catch (mutationError) {
        console.error('Mutation error:', mutationError);
        
        // Try direct insertion as a fallback
        console.log('Attempting direct insertion after mutation error...');
        const directResult = await insertPurchaseDirectly(purchaseData);
        
        if (directResult) {
          console.log('Direct insertion successful after mutation error:', directResult);
          // Manually invalidate queries
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASES] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALANCE_STOCK] });
          
          // Force immediate recalculation of balance stock
          await recalculateBalanceStock();
          
          // Also trigger global event for other components
          window.dispatchEvent(new CustomEvent('inventory-updated', { detail: { type: 'purchase', data: directResult } }));
          
          return directResult;
        }
        
        throw mutationError;
      }
    } catch (error) {
      console.error('Error in createPurchase:', error);
      throw error;
    }
  };
  
  // Helper function for direct insertion as a fallback
  const insertPurchaseDirectly = async (purchaseData: PurchaseFormState): Promise<Purchase | null> => {
    try {
      // Calculate derived values
      const fullPurchaseData = calculatePurchaseValues(purchaseData);
      
      // Create a proper purchase object
      const purchaseObject: any = {
        id: v4(),
        date: fullPurchaseData.date || new Date().toISOString().split('T')[0],
        product_name: fullPurchaseData.product_name,
        hsn_code: fullPurchaseData.hsn_code || '',
        units: fullPurchaseData.units || '',
        purchase_qty: fullPurchaseData.purchase_qty || 0,
        mrp_incl_gst: fullPurchaseData.mrp_incl_gst || 0,
        mrp_excl_gst: fullPurchaseData.mrp_excl_gst || 0,
        gst_percentage: fullPurchaseData.gst_percentage || 18,
        purchase_cost_per_unit_ex_gst: fullPurchaseData.purchase_cost_per_unit_ex_gst || 0,
        purchase_taxable_value: fullPurchaseData.purchase_taxable_value || 0,
        purchase_igst: fullPurchaseData.purchase_igst || 0,
        purchase_cgst: fullPurchaseData.purchase_cgst || 0,
        purchase_sgst: fullPurchaseData.purchase_sgst || 0,
        purchase_invoice_value_rs: fullPurchaseData.purchase_invoice_value_rs || 0,
        discount_on_purchase_percentage: fullPurchaseData.discount_on_purchase_percentage || 0,
        vendor_name: fullPurchaseData.vendor_name || 'Default Vendor',
        invoice_no: fullPurchaseData.invoice_no || `INV-${Date.now()}`,
        purchase_id: `purchase-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Direct insertion attempt with data:', purchaseObject);
      
      // Use retry function for more reliable database operations
      const result = await retryDatabaseOperation(async () => {
        const { data, error } = await supabase
          .from(TABLES.PURCHASES)
          .insert([purchaseObject])
          .select();
        
        if (error) throw error;
        if (!data || data.length === 0) throw new Error('No data returned from insertion');
        
        return data[0] as Purchase;
      }, 3); // Try up to 3 times
      
      console.log('Direct insertion successful:', result);
      return result;
    } catch (error) {
      console.error('Error in direct purchase insertion after retries:', error);
      return null;
    }
  };

  // Function to fetch sales data from POS for a given date range
  const fetchSalesFromPOS = async (startDate: string, endDate: string) => {
    try {
      // Fetch orders from localStorage
      const ordersStr = localStorage.getItem('orders');
      if (!ordersStr) {
        return [];
      }
      
      const orders = JSON.parse(ordersStr);
      
      // Filter orders by date range
      const filteredOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.created_at || order.order_date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Set the time for comparison to ensure full day ranges
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        return orderDate >= start && orderDate <= end;
      });
      
      // Map orders to the format expected by the inventory system
      return filteredOrders.map((order: any) => {
        // Determine if this is a salon consumption order
        const isSalonConsumption = Boolean(order.is_salon_consumption || order.is_salon_purchase);
        
        // Get customer name or use Walk-in for standard customers
        const customerName = order.client_name || order.customer_name || "Walk-in";
        
        // For each order, extract product items
        let productItems = [];
        
        // Check if order has services array
        if (Array.isArray(order.services)) {
          // Extract products from services array
          productItems = order.services
            .filter((service: any) => service && service.type === 'product')
            .map((service: any) => ({
              product_name: service.service_name || service.name,
              hsn_code: service.hsn_code || '3304', // Default HSN code for cosmetics
              units: service.units || 'pcs', // Default units
              quantity: service.quantity || 1, // Default quantity
              mrp_incl_gst: service.price,
              mrp_excl_gst: service.price / (1 + (service.gst_percentage || 18) / 100),
              discount_percentage: order.discount > 0 
                ? (order.discount / order.subtotal) * 100 
                : 0,
              gst_percentage: service.gst_percentage || 18,
            }));
        } 
        // Check if order has items array (usually for salon consumption)
        else if (Array.isArray(order.items)) {
          productItems = order.items
            .filter((item: any) => item && item.type === 'product')
            .map((item: any) => ({
              product_name: item.item_name || item.name,
              hsn_code: item.hsn_code || '3304',
              units: item.units || 'pcs',
              quantity: item.quantity || 1,
              mrp_incl_gst: item.price,
              mrp_excl_gst: item.price / (1 + (item.gst_percentage || 18) / 100),
              discount_percentage: 0, // Usually no discount on salon consumption
              gst_percentage: item.gst_percentage || 18,
            }));
        }
        
        return {
          date: order.created_at || order.order_date,
          invoice_no: order.invoice_number || order.id, // Using order ID as invoice number
          customer_name: customerName,
          is_salon_consumption: isSalonConsumption,
          items: productItems.filter(Boolean) // Remove null items
        };
      });
    } catch (error) {
      console.error('Error fetching sales from POS:', error);
      throw error;
    }
  };

  // Function to sync sales data from POS
  const syncSalesFromPos = async (startDate: string, endDate: string) => {
    setIsSyncingSales(true);
    setProcessingStats((prev: ProcessingStats | null) => ({
      startTime: new Date(),
      endTime: null,
      total: 0,
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: []
    }));
    
    try {
      // Fetch orders from POS
      const orders = await fetchSalesFromPOS(startDate, endDate);
      
      // Get purchase stats
      const purchaseStats = {
        total: orders.reduce((acc: number, order: any) => acc + order.items.length, 0)
      };
      
      setProcessingStats((prev: ProcessingStats | null) => ({
        ...prev!,
        total: purchaseStats.total
      }));
      
      // Process each order
      for (const order of orders) {
        // Process each item in the order
        for (const item of order.items) {
          try {
            // Calculate sales values with explicit number conversion to avoid NaN
            const mrpInclGst = parseFloat(item.mrp_incl_gst || 0);
            const gstPercentage = parseFloat(item.gst_percentage || 18);
            const discountPercentage = parseFloat(item.discount_percentage || 0);
            const quantity = parseFloat(item.quantity || 1);
            
            // Calculate MRP excluding GST
            const mrpExclGst = mrpInclGst / (1 + (gstPercentage / 100));
            
            // Calculate discounted rate
            const discountedRateExclGst = mrpExclGst * (1 - (discountPercentage / 100));
            
            // Calculate taxable value
            const taxableValue = discountedRateExclGst * quantity;
            
            // Calculate GST amounts
            const totalGst = taxableValue * (gstPercentage / 100);
            const cgst = totalGst / 2;
            const sgst = totalGst / 2;
            const igst = 0; // Assuming IGST is 0 for local sales
            
            // Calculate invoice value
            const invoiceValue = taxableValue + totalGst;
            
            console.log('Calculated values for sales record:', {
              productName: item.product_name,
              mrpInclGst,
              mrpExclGst,
              discountPercentage,
              discountedRateExclGst,
              taxableValue,
              cgst,
              sgst,
              igst,
              invoiceValue
            });
            
            // Get purchase cost details (for FIFO costing)
            // In a real application, you would implement FIFO logic here
            // For now, use simplified approach by getting the latest purchase
            const { data: purchaseData } = await supabase
              .from(TABLES.PURCHASES)
              .select('*')
              .eq('product_name', item.product_name)
              .order('date', { ascending: false })
              .limit(1);
            
            const purchaseCost = purchaseData && purchaseData.length > 0
              ? {
                  purchase_cost_per_unit_ex_gst: purchaseData[0].mrp_excl_gst * (1 - (purchaseData[0].discount_on_purchase_percentage / 100)),
                  purchase_gst_percentage: purchaseData[0].gst_percentage,
                  total_purchase_cost: (purchaseData[0].mrp_excl_gst * (1 - (purchaseData[0].discount_on_purchase_percentage / 100)) * item.quantity) * (1 + (purchaseData[0].gst_percentage / 100))
                }
              : {
                  purchase_cost_per_unit_ex_gst: mrpExclGst * 0.5, // Fallback: assume 50% of MRP is cost
                  purchase_gst_percentage: gstPercentage,
                  total_purchase_cost: (mrpExclGst * 0.5 * quantity) * (1 + (gstPercentage / 100))
                };
            
            // Prepare sale record with all values as numbers
            const saleRecord: Omit<Sale, 'sale_id'> = {
              id: v4(),
              date: order.date,
              invoice_no: order.invoice_no,
              product_name: item.product_name,
              hsn_code: item.hsn_code || '',
              units: item.units || 'pcs',
              sales_qty: quantity,
              quantity: quantity, // Add both fields for compatibility
              mrp_incl_gst: mrpInclGst,
              mrp_excl_gst: mrpExclGst,
              discount_on_sales_percentage: discountPercentage,
              discount_percentage: discountPercentage, // Add both fields for compatibility
              discounted_sales_rate_excl_gst: discountedRateExclGst,
              gst_percentage: gstPercentage,
              taxable_value: taxableValue,
              igst: igst,
              cgst: cgst,
              sgst: sgst,
              invoice_value: invoiceValue,
              purchase_cost_per_unit_ex_gst: purchaseCost.purchase_cost_per_unit_ex_gst,
              purchase_gst_percentage: purchaseCost.purchase_gst_percentage,
              purchase_taxable_value: purchaseCost.purchase_cost_per_unit_ex_gst * quantity,
              purchase_igst: 0,
              purchase_cgst: (purchaseCost.purchase_cost_per_unit_ex_gst * quantity * purchaseCost.purchase_gst_percentage / 100) / 2,
              purchase_sgst: (purchaseCost.purchase_cost_per_unit_ex_gst * quantity * purchaseCost.purchase_gst_percentage / 100) / 2,
              total_purchase_cost: purchaseCost.total_purchase_cost,
              customer_name: order.customer_name || 'Walk-in',
              is_salon_consumption: order.is_salon_consumption || false,
              created_at: new Date().toISOString()
            };
            
            // Make sure all numerical values are valid numbers
            Object.keys(saleRecord).forEach(key => {
              const value = (saleRecord as any)[key];
              if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
                (saleRecord as any)[key] = 0; // Replace NaN or Infinity with 0
              }
            });
            
            // Increment processed count
            setProcessingStats((prev: ProcessingStats | null) => ({
              ...prev!,
              processed: prev!.processed + 1
            }));
            
            // Insert the sale record
            const { error } = await supabase
              .from(TABLES.SALES)
              .insert(saleRecord);
              
            if (error) {
              throw handleSupabaseError(error);
            }
            
            // Increment success count
            setProcessingStats((prev: ProcessingStats | null) => ({
              ...prev!,
              succeeded: prev!.succeeded + 1
            }));
            
          } catch (error) {
            console.error('Error processing sale item:', error);
            
            // Increment processed and failed counts
            setProcessingStats((prev: ProcessingStats | null) => ({
              ...prev!,
              processed: prev!.processed + 1,
              failed: prev!.failed + 1,
              errors: [...prev!.errors, `Error with ${item.product_name}: ${error}`]
            }));
          }
        }
      }
      
      // Record the end time
      setProcessingStats((prev: ProcessingStats | null) => ({
        ...prev!,
        endTime: new Date()
      }));
      
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER_SALES] });
      
      return {
        success: true,
        message: `Successfully processed ${orders.length} orders`
      };
    } catch (error) {
      console.error('Error syncing sales data:', error);
      
      // Record the error state
      setProcessingStats((prev: ProcessingStats | null) => ({
        ...prev!,
        endTime: new Date(),
        errors: [...prev!.errors, `General error: ${error}`]
      }));
      
      throw error;
    } finally {
      setIsSyncingSales(false);
    }
  };

  // Function to directly insert salon consumption records
  const insertSalonConsumptionRecords = async (records: any[]) => {
    if (!records || records.length === 0) {
      console.log('No consumption records to insert');
      return { success: true, count: 0 };
    }

    console.log(`Inserting ${records.length} salon consumption records`);
    
    try {
      // Batch inserts in groups of 20 records
      const batchSize = 20;
      let insertedCount = 0;
      let errors = [];
      
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        
        // Insert batch of records
        const { data, error } = await supabase
          .from(TABLES.SALON_CONSUMPTION)
          .upsert(batch, { 
            onConflict: 'id',
            ignoreDuplicates: true
          });
        
        if (error) {
          console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
          errors.push(error);
        } else {
          insertedCount += batch.length;
          console.log(`Successfully inserted batch ${i / batchSize + 1} (${batch.length} records)`);
        }
      }
      
      // Force refresh the cache to reflect the new data
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONSUMPTION] });
      
      return { 
        success: errors.length === 0, 
        count: insertedCount,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      console.error('Error inserting salon consumption records:', error);
      return { success: false, count: 0, error };
    }
  };

  // Improved sync function for salon consumption
  const syncConsumptionFromPos = async (startDate?: string, endDate?: string, type: string = 'salon') => {
    try {
      setIsSyncingConsumption(true);
      console.log(`Starting sync ${type} consumption from POS...`);
      console.log("Date range:", { startDate, endDate });
      
      // Store timestamp to prevent duplicate processing
      const syncTime = new Date().toISOString();
      
      // Always reload fresh data from localStorage
      console.log('Loading orders from local storage');
      const ordersString = localStorage.getItem("orders");
      if (!ordersString) {
        console.log("No orders found in local storage");
        setIsSyncingConsumption(false);
        return { success: true, data: [] };
      }
      
      const orders = JSON.parse(ordersString);
      console.log(`All orders from localStorage: ${orders.length}`);
      
      // Use the date range to filter orders if dates are provided
      let filteredOrders = orders;
      if (startDate && endDate) {
        // Convert to Date objects for comparison
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Set to end of day
        
        console.log(`Filtering orders between ${start.toISOString()} and ${end.toISOString()}`);
        
        filteredOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.created_at || order.date || order.order_date || new Date());
          return orderDate >= start && orderDate <= end;
        });
        
        console.log(`Filtered ${filteredOrders.length} orders within date range out of ${orders.length} total orders`);
      } else {
        console.log("No date range specified, processing all orders");
      }
      
      // Filter specifically for salon consumption orders and ensure they're marked as completed
      let salonConsumptionOrders = filteredOrders.filter(
        (order: any) => order.is_salon_consumption === true || 
                      order.salon_consumption === true ||
                      order.purchase_type === 'salon_consumption' ||
                      order.order_type === 'salon_consumption' ||
                      order.category === 'Salon Consumption' ||
                      order.customer_name === 'Salon Internal' ||
                      order.client_name === 'Salon Internal'
      );
      
      // Force status to completed for all salon consumption orders
      salonConsumptionOrders = salonConsumptionOrders.map((order: any) => {
        if (order.status !== 'completed') {
          console.log(`Correcting status for salon consumption order ${order.id} from ${order.status} to completed`);
          
          // Try to update in database
          try {
            supabase
              .from(TABLES.POS_ORDERS)
              .update({ status: 'completed' })
              .eq('id', order.id)
              .then(({ error }) => {
                if (error) {
                  console.error(`Failed to update order ${order.id} status in database:`, error);
                }
              });
          } catch (e) {
            console.error('Error updating order status:', e);
          }
          
          return { ...order, status: 'completed' };
        }
        return order;
      });
      
      console.log(`Found ${salonConsumptionOrders.length} salon consumption orders`);
      
      if (salonConsumptionOrders.length === 0) {
        console.log("No salon consumption orders found");
        setIsSyncingConsumption(false);
        return { success: true, data: [] };
      }

      // Process each salon consumption order
      let allConsumptionRecords: any[] = [];
      
      for (const order of salonConsumptionOrders) {
        // Handle different order structures
        const orderItems = 
          (order.items && Array.isArray(order.items)) ? order.items : 
          (order.services && Array.isArray(order.services)) ? order.services : 
          (order.products && Array.isArray(order.products)) ? order.products : 
          [];
        
        console.log(`Order ${order.id} has ${orderItems.length} items/services/products`);
        
        // Filter for product items only
        const productItems = orderItems.filter((item: any) => 
          item && (
            (item.type && item.type.toLowerCase() === 'product') ||
            (item.item_type && item.item_type.toLowerCase() === 'product') ||
            (item.product_id) ||
            (item.product_name)
          )
        );
        
        console.log(`Order ${order.id} has ${productItems.length} product items`);
        
        if (productItems.length === 0) {
          // Create a default record if no products found
          allConsumptionRecords.push({
            id: v4(),
            order_id: order.id,
            date: order.created_at || order.date || new Date().toISOString(),
            product_name: "Unknown Product",
            quantity: 1,
            purpose: order.consumption_purpose || 'Salon Use',
            stylist_name: order.stylist_name || '',
            status: 'completed', // Always set to completed
            total_amount: order.total || 0,
            type: 'salon_consumption',
            payment_method: order.payment_method || 'cash',
            created_at: new Date().toISOString(),
            sync_timestamp: syncTime
          });
          continue;
        }
        
        // Create consumption records for each product
        for (const item of productItems) {
          const consumptionRecord = {
            id: v4(),
            order_id: order.id,
            date: order.created_at || order.date || new Date().toISOString(),
            product_name: item.product_name || item.item_name || item.name || "Unknown Product",
            quantity: item.quantity || 1,
            purpose: order.consumption_purpose || item.purpose || 'Salon Use',
            stylist_name: order.stylist_name || '',
            status: 'completed', // Always set to completed
            total_amount: item.total_price || item.price || 0,
            type: 'salon_consumption',
            payment_method: order.payment_method || 'cash',
            created_at: new Date().toISOString(),
            sync_timestamp: syncTime
          };
          
          allConsumptionRecords.push(consumptionRecord);
        }
      }
      
      console.log(`Created ${allConsumptionRecords.length} salon consumption records`);
      
      // Insert the records
      const insertResult = await insertSalonConsumptionRecords(allConsumptionRecords);
      
      console.log(`Inserted ${insertResult.count} salon consumption records`);
      
      // Save the updated status to localStorage
      if (orders.length > 0) {
        // Update any changed orders in localStorage
        const ordersMap = new Map(orders.map((order: any) => [order.id, order]));
        
        // Update orders in the map
        salonConsumptionOrders.forEach((order: any) => {
          if (ordersMap.has(order.id)) {
            ordersMap.set(order.id, { ...order, status: 'completed' });
          }
        });
        
        // Convert map back to array
        const updatedOrders = Array.from(ordersMap.values());
        
        // Save back to localStorage
        localStorage.setItem("orders", JSON.stringify(updatedOrders));
        console.log(`Updated ${salonConsumptionOrders.length} orders in localStorage`);
      }
      
      // Update last sync time
      localStorage.setItem("lastSalonConsumptionSync", syncTime);
      
      setIsSyncingConsumption(false);
      return { success: insertResult.success, data: allConsumptionRecords };
    } catch (error) {
      console.error('Error in syncConsumptionFromPos:', error);
      setIsSyncingConsumption(false);
      return { success: false, error };
    }
  };

  // Function to export inventory data for CSV
  const exportInventoryData = async (startDate?: string, endDate?: string) => {
    setIsExporting(true);
    
    try {
      const tableNames = {
        purchases: TABLES.PURCHASES || 'inventory_purchases',
        sales: TABLES.SALES || 'inventory_sales_new',
        consumption: TABLES.CONSUMPTION || 'inventory_consumption'
      };
      
      // Get data from each table
      const [purchasesRes, salesRes, consumptionRes] = await Promise.all([
        supabase.from(tableNames.purchases).select('*'),
        supabase.from(tableNames.sales).select('*'),
        supabase.from(tableNames.consumption).select('*')
      ]);
      
      if (purchasesRes.error) throw new Error(`Failed to fetch purchases: ${purchasesRes.error.message}`);
      if (salesRes.error) throw new Error(`Failed to fetch sales: ${salesRes.error.message}`);
      if (consumptionRes.error) throw new Error(`Failed to fetch consumption: ${consumptionRes.error.message}`);
      
      // Calculate balance stock if needed
      const balanceStock = await calculateBalanceStock();
      
      const exportData: InventoryExportData = {
        purchases: purchasesRes.data || [],
        sales: salesRes.data || [],
        consumption: consumptionRes.data || [],
        balanceStock: balanceStock || []
      };
      
      return exportData;
    } catch (error) {
      console.error('Error exporting inventory data:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  // Function to record salon consumption directly from POS
  const recordSalonConsumption = useMutation({
    mutationFn: async (items: SalonConsumptionItem[]) => {
      if (!items || items.length === 0) return { success: false, message: 'No items to record' };
      
      try {
        // Generate a shared requisition voucher number for all items
        const voucherNumber = items[0].requisition_voucher_no || `POS-SALON-${new Date().getTime()}`;
        const currentDate = items[0].date || new Date().toISOString();
        
        // Process each consumption item
        const consumptionRecords = [];
        for (const item of items) {
          // Get product details if needed
          let productDetails = { hsn_code: '', units: '' };
          
          // Try to find product details from purchases if they're not provided
          if (!item.hsn_code || !item.units) {
            const { data: purchaseData } = await supabase
              .from(TABLES.PURCHASES)
              .select('hsn_code, units')
              .eq('product_name', item.product_name)
              .order('date', { ascending: false })
              .limit(1);
              
            if (purchaseData && purchaseData.length > 0) {
              productDetails = {
                hsn_code: purchaseData[0].hsn_code || '',
                units: purchaseData[0].units || ''
              };
            }
          }
          
          // Calculate price excluding GST
          const priceExGst = item.unit_price ? item.unit_price / 1.18 : 0;
          
          // Calculate taxable value
          const taxableValue = priceExGst * item.quantity;
          
          // Calculate GST amounts
          const totalGst = taxableValue * 0.18; // Assuming 18% GST
          const cgst = totalGst / 2;
          const sgst = totalGst / 2;
          
          // Total value with GST
          const totalValue = item.unit_price ? item.unit_price * item.quantity : 0;
          
          // Prepare consumption record
          const consumptionRecord = {
            id: v4(),
            date: currentDate,
            product_name: item.product_name,
            hsn_code: item.hsn_code || productDetails.hsn_code,
            units: item.units || productDetails.units,
            requisition_voucher_no: voucherNumber,
            consumption_qty: item.quantity,
            purchase_cost_per_unit_ex_gst: priceExGst,
            purchase_gst_percentage: 18, // Assuming standard 18% GST
            purchase_taxable_value: taxableValue,
            taxable_value: taxableValue,
            igst: 0,
            cgst: cgst,
            sgst: sgst,
            invoice_value: totalValue,
            purpose: item.purpose,
            notes: item.notes || '',
            is_salon_consumption: true,
            created_at: new Date().toISOString()
          };
          
          consumptionRecords.push(consumptionRecord);
        }
        
        // Insert all consumption records
        const { data, error } = await supabase
          .from(TABLES.CONSUMPTION)
          .insert(consumptionRecords);
          
        if (error) throw handleSupabaseError(error);
        
        // Return success
        return { 
          success: true, 
          message: `Successfully recorded ${consumptionRecords.length} items`,
          data: consumptionRecords
        };
      } catch (error) {
        console.error('Error recording salon consumption:', error);
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Unknown error recording consumption',
          error
        };
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONSUMPTION] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALANCE_STOCK] });
    },
    onError: (error) => {
      console.error('Error in consumption mutation:', error);
    }
  });

  // Function to calculate balance stock
  const calculateBalanceStock = async (): Promise<BalanceStock[]> => {
    try {
      console.log('Recalculating balance stock...');
      
      // Fetch all inventory data
      const [purchases, sales, consumption] = await Promise.all([
        purchasesQuery.refetch().then(res => res.data || []),
        salesQuery.refetch().then(res => res.data || []),
        consumptionQuery.refetch().then(res => res.data || [])
      ]);
      
      // Create a map to store aggregated product information
      const productMap = new Map();
      
      // Group products by name to eliminate duplicates and consolidate quantities
      // First, process purchases - these ADD to inventory
      const purchasesByProduct = purchases.reduce((acc, purchase) => {
        const productName = purchase.product_name || 'Unknown Product';
        if (!acc[productName]) {
          acc[productName] = {
            product_name: productName,
            hsn_code: purchase.hsn_code || '',
            units: purchase.units || 'pcs',
            purchase_qty: 0,
            purchase_taxable_value: 0,
            purchase_cgst: 0,
            purchase_sgst: 0,
            purchase_igst: 0,
            purchase_invoice_value: 0
          };
        }
        
        acc[productName].purchase_qty += parseFloat(purchase.purchase_qty || purchase.quantity || 0);
        acc[productName].purchase_taxable_value += parseFloat(purchase.purchase_taxable_value || 0);
        acc[productName].purchase_cgst += parseFloat(purchase.purchase_cgst || 0);
        acc[productName].purchase_sgst += parseFloat(purchase.purchase_sgst || 0);
        acc[productName].purchase_igst += parseFloat(purchase.purchase_igst || 0);
        acc[productName].purchase_invoice_value += parseFloat(purchase.purchase_invoice_value_rs || 0);
        
        return acc;
      }, {});
      
      // Convert purchases to array
      Object.values(purchasesByProduct).forEach(purchase => {
        const productName = purchase.product_name;
        
        productMap.set(productName, {
            id: v4(),
          product_name: productName,
            hsn_code: purchase.hsn_code,
            units: purchase.units,
          balance_qty: purchase.purchase_qty,
          taxable_value: purchase.purchase_taxable_value,
          igst: purchase.purchase_igst,
          cgst: purchase.purchase_cgst,
          sgst: purchase.purchase_sgst,
          invoice_value: purchase.purchase_invoice_value,
            last_updated: new Date().toISOString()
          });
      });
      
      // Group sales by product
      const salesByProduct = sales.reduce((acc, sale) => {
        const productName = sale.product_name || 'Unknown Product';
        if (!acc[productName]) {
          acc[productName] = {
            product_name: productName,
            sales_qty: 0,
            sales_taxable_value: 0,
            sales_cgst: 0,
            sales_sgst: 0,
            sales_igst: 0,
            sales_invoice_value: 0
          };
        }
        
        acc[productName].sales_qty += parseFloat(sale.sales_qty || sale.quantity || 0);
        acc[productName].sales_taxable_value += parseFloat(sale.sales_taxable_value || sale.taxable_value || 0);
        acc[productName].sales_cgst += parseFloat(sale.cgst_rs || sale.cgst || 0);
        acc[productName].sales_sgst += parseFloat(sale.sgst_rs || sale.sgst || 0);
        acc[productName].sales_igst += parseFloat(sale.igst_rs || sale.igst || 0);
        acc[productName].sales_invoice_value += parseFloat(sale.invoice_value_rs || sale.invoice_value || 0);
        
        return acc;
      }, {});
      
      // Subtract sales
      Object.values(salesByProduct).forEach(sale => {
        const productName = sale.product_name;
        if (productMap.has(productName)) {
          const record = productMap.get(productName);
          record.balance_qty -= sale.sales_qty;
          record.taxable_value -= sale.sales_taxable_value;
          record.cgst -= sale.sales_cgst;
          record.sgst -= sale.sales_sgst;
          record.igst -= sale.sales_igst;
          record.invoice_value -= sale.sales_invoice_value;
        }
      });
      
      // Group consumption by product
      const consumptionByProduct = consumption.reduce((acc, cons) => {
        const productName = cons.product_name || 'Unknown Product';
        if (!acc[productName]) {
          acc[productName] = {
            product_name: productName,
            consumption_qty: 0,
            consumption_taxable_value: 0,
            consumption_cgst: 0,
            consumption_sgst: 0,
            consumption_igst: 0,
            consumption_invoice_value: 0
          };
        }
        
        acc[productName].consumption_qty += parseFloat(cons.consumption_qty || cons.quantity || 0);
        acc[productName].consumption_taxable_value += parseFloat(cons.taxable_value || 0);
        acc[productName].consumption_cgst += parseFloat(cons.cgst || 0);
        acc[productName].consumption_sgst += parseFloat(cons.sgst || 0);
        acc[productName].consumption_igst += parseFloat(cons.igst || 0);
        acc[productName].consumption_invoice_value += parseFloat(cons.invoice_value || cons.total || 0);
        
        return acc;
      }, {});
      
      // Subtract consumption
      Object.values(consumptionByProduct).forEach(cons => {
        const productName = cons.product_name;
        if (productMap.has(productName)) {
          const record = productMap.get(productName);
          record.balance_qty -= cons.consumption_qty;
          record.taxable_value -= cons.consumption_taxable_value;
          record.cgst -= cons.consumption_cgst;
          record.sgst -= cons.consumption_sgst;
          record.igst -= cons.consumption_igst;
          record.invoice_value -= cons.consumption_invoice_value;
        }
      });
      
      // Round values and ensure no negative values
      const balanceStock = Array.from(productMap.values())
        .map(item => ({
        ...item,
          balance_qty: Math.max(0, parseFloat(item.balance_qty.toFixed(2))),
          taxable_value: Math.max(0, parseFloat(item.taxable_value.toFixed(2))),
          igst: Math.max(0, parseFloat(item.igst.toFixed(2))),
          cgst: Math.max(0, parseFloat(item.cgst.toFixed(2))),
          sgst: Math.max(0, parseFloat(item.sgst.toFixed(2))),
          invoice_value: Math.max(0, parseFloat(item.invoice_value.toFixed(2)))
        }))
        .filter(item => item.balance_qty > 0); // Only include products with positive balance
      
      console.log(`Recalculated balance stock for ${balanceStock.length} products`);
      
      // Store in local storage
      localStorage.setItem('inventory_balance_stock', JSON.stringify(balanceStock));
      
      // Inform UI of changes
      queryClient.setQueryData(['inventory', 'balance-stock'], balanceStock);
      
      return balanceStock;
    } catch (error) {
      console.error('Error recalculating balance stock:', error);
      throw error;
    }
  };

  // Add a mutation for recalculating balance stock
  const recalculateBalanceStockMutation = useMutation({
    mutationFn: calculateBalanceStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALANCE_STOCK] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER_SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONSUMPTION] });
    }
  });

  // Mutation to create sales records directly from POS orders
  const createInventorySaleFromOrder = useMutation({
    mutationFn: async (order: any) => {
      try {
        // Extract product items from the order
        const productItems = order.services.filter((service: any) => 
          service.type === 'product' || service.service?.type === 'product'
        );
        
        if (productItems.length === 0) {
          return { success: true, message: 'No product items to record' };
        }
        
        // Check the database schema to see what columns are available
        // First try a minimal insert to check the schema
        try {
          const testRecord = {
            id: v4(),
            date: new Date().toISOString(),
            product_name: 'Test Product',
            sales_qty: 1,
            created_at: new Date().toISOString()
          };
          
          const { error } = await supabase
            .from(TABLES.SALES)
            .insert([testRecord])
            .select();
            
          if (error) {
            console.log('Test insert failed, falling back to simplified schema:', error);
            // If there's an error, we'll use a simplified schema
          }
        } catch (schemaError) {
          console.log('Schema test failed:', schemaError);
        }
        
        // Process each product item as an inventory sale
        const saleRecords = [];
        
        for (const item of productItems) {
          // Determine if the item is using the new or old structure
          const product = item.service || item;
          const productName = product.name || product.service_name;
          const productPrice = product.price;
          const itemType = product.type || 'product';
          
          if (itemType !== 'product') continue;
          
          // Create a basic sale record with required fields only
          const basicSaleRecord: Partial<Sale> = {
            id: v4(),
            date: order.created_at,
            product_name: productName,
            sales_qty: item.quantity || 1,
            mrp_incl_gst: productPrice,
            customer_name: order.customer_name || 'Walk-in',
            is_salon_consumption: order.is_salon_consumption || false,
            created_at: new Date().toISOString()
          };
          
          // Add optional fields that might exist
          try {
            // Try to get purchase cost info if possible
            const { data: purchaseData } = await supabase
              .from(TABLES.PURCHASES)
              .select('*')
              .eq('product_name', productName)
              .order('date', { ascending: false })
              .limit(1);
              
            if (purchaseData && purchaseData.length > 0) {
              // Only add fields if we have them
              if (purchaseData[0].mrp_excl_gst) {
                basicSaleRecord.mrp_excl_gst = purchaseData[0].mrp_excl_gst;
              }
              
              if (purchaseData[0].gst_percentage) {
                basicSaleRecord.gst_percentage = purchaseData[0].gst_percentage;
              }
            }
          } catch (error) {
            console.log('Error fetching purchase data:', error);
          }
          
          saleRecords.push(basicSaleRecord);
        }
        
        // Insert all sale records
        const { error } = await supabase
          .from(TABLES.SALES)
          .insert(saleRecords);
          
        if (error) {
          console.error('Error inserting sales records:', error);
          throw error;
        }
        
        return { 
          success: true, 
          message: `Successfully recorded ${saleRecords.length} product sales` 
        };
      } catch (error) {
        console.error('Error recording inventory sales from order:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate sales queries to refresh data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER_SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALANCE_STOCK] });
    }
  });

  /**
   * Explicitly recalculate balance stock by forcing a refresh of the view
   * This ensures that all components reflect updated stock values
   */
  const recalculateBalanceStock = async () => {
    try {
      console.log('Forcing recalculation of balance stock...');
      
      // Try to refresh the view via RPC
      const sql = `
        CREATE OR REPLACE VIEW ${TABLES.BALANCE_STOCK} AS
        SELECT
          p.product_name,
          p.hsn_code,
          p.units,
          SUM(p.purchase_qty) as total_purchases,
          COALESCE(SUM(s.sale_qty), 0) as total_sales,
          COALESCE(SUM(c.consumption_qty), 0) as total_consumption,
          SUM(p.purchase_qty) - COALESCE(SUM(s.sale_qty), 0) - COALESCE(SUM(c.consumption_qty), 0) as balance_qty,
          AVG(p.purchase_taxable_value / NULLIF(p.purchase_qty, 0)) as avg_purchase_cost_per_unit
        FROM
          ${TABLES.PURCHASES} p
        LEFT JOIN
          ${TABLES.SALES} s ON p.product_name = s.product_name
        LEFT JOIN
          ${TABLES.CONSUMPTION} c ON p.product_name = c.product_name
        GROUP BY
          p.product_name, p.hsn_code, p.units;
      `;
      
      // First try the RPC approach which may be available in some Supabase setups
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (!error) {
          console.log('Successfully refreshed balance stock view via RPC');
        } else {
          console.log('Could not refresh view via RPC, this is expected in many cases');
        }
      } catch (rpcError) {
        console.log('RPC not available for view refresh, proceeding with query approach');
      }
      
      // Ensure the balance stock query is invalidated
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALANCE_STOCK] });
      
      // Force a requery of the balance stock data
      const { data: refreshedStock, error: refreshError } = await supabase
        .from('inventory_balance_stock')
        .select('*');
        
      if (refreshError) {
        console.error('Error during balance stock recalculation:', refreshError);
        return false;
      }
      
      console.log(`Balance stock recalculated: ${refreshedStock?.length || 0} products updated`);
      
      // Signal to all components that inventory data has been updated
      window.dispatchEvent(new Event('inventory-data-updated'));
      
      return true;
    } catch (error) {
      console.error('Failed to recalculate balance stock:', error);
      return false;
    }
  };

  // Add delete mutations for inventory records
  const deletePurchaseMutation = useMutation({
    mutationFn: async (purchaseId: string) => {
      try {
        const { error } = await supabase
          .from(TABLES.PURCHASES)
          .delete()
          .eq('purchase_id', purchaseId); // Change 'id' to 'purchase_id'
          
        if (error) throw handleSupabaseError(error);
        
        return { success: true };
      } catch (error) {
        console.error('Error deleting purchase record:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALANCE_STOCK] });
      
      // Dispatch an event for real-time updates
      window.dispatchEvent(new CustomEvent('inventory-updated', { 
        detail: { type: 'purchase-deleted' } 
      }));
    }
  });

  const deleteSaleMutation = useMutation({
    mutationFn: async (saleId: string) => {
      try {
        const { error } = await supabase
          .from(TABLES.SALES)
          .delete()
          .eq('sale_id', saleId); // Change 'id' to 'sale_id'
          
        if (error) throw handleSupabaseError(error);
        
        return { success: true };
      } catch (error) {
        console.error('Error deleting sale record:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER_SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALANCE_STOCK] });
      
      // Dispatch an event for real-time updates
      window.dispatchEvent(new CustomEvent('inventory-updated', { 
        detail: { type: 'sale-deleted' } 
      }));
    }
  });

  const deleteConsumptionMutation = useMutation({
    mutationFn: async (consumptionId: string) => {
      try {
        // First check SALON_CONSUMPTION table
        try {
          const { error: salonError } = await supabase
            .from(TABLES.SALON_CONSUMPTION)
            .delete()
            .eq('id', consumptionId);
          
          if (!salonError) {
            return { success: true, source: 'salon_consumption' };
          }
        } catch (salonErr) {
          console.log('Error checking salon consumption table:', salonErr);
        }
        
        // Fall back to regular consumption table
        const { error } = await supabase
          .from(TABLES.CONSUMPTION)
          .delete()
          .eq('consumption_id', consumptionId); // Change 'id' to 'consumption_id'
        
        if (error) throw handleSupabaseError(error);
        
        return { success: true, source: 'consumption' };
      } catch (error) {
        console.error('Error deleting consumption record:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONSUMPTION] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALANCE_STOCK] });
      
      // Dispatch an event for real-time updates
      window.dispatchEvent(new CustomEvent('inventory-updated', { 
        detail: { type: 'consumption-deleted' } 
      }));
    }
  });

  // Function to delete a purchase record
  const deletePurchase = async (purchaseId: string) => {
    try {
      await deletePurchaseMutation.mutateAsync(purchaseId);
      await recalculateBalanceStock();
      return { success: true };
    } catch (error) {
      console.error('Error deleting purchase:', error);
      return { success: false, error };
    }
  };

  // Function to delete a sale record
  const deleteSale = async (saleId: string) => {
    try {
      try {
        await deleteSaleMutation.mutateAsync(saleId);
      } catch (error) {
        console.error('Error in delete sale mutation:', error);
        return { success: false, error };
      }
      
      await recalculateBalanceStock();
      return { success: true };
    } catch (error) {
      console.error('Error deleting sale:', error);
      return { success: false, error };
    }
  };

  // Function to delete a consumption record
  const deleteConsumption = async (consumptionId: string) => {
    try {
      await deleteConsumptionMutation.mutateAsync(consumptionId);
      await recalculateBalanceStock();
      return { success: true };
    } catch (error) {
      console.error('Error deleting consumption:', error);
      return { success: false, error };
    }
  };

  // Add function to delete a product from inventory and its related records
  const deleteProduct = async (productName: string) => {
    if (!productName) {
      toast.error('Product name is required');
      return;
    }
    
    try {
      // Start transaction sequence - first delete from purchases
      const { error: purchasesError } = await supabase
        .from(TABLES.PURCHASES)
        .delete()
        .eq('product_name', productName);
      
      if (purchasesError) throw purchasesError;
      
      // Delete from sales
      const { error: salesError } = await supabase
        .from(TABLES.SALES)
        .delete()
        .eq('product_name', productName);
      
      if (salesError) throw salesError;
      
      // Delete from consumption
      const { error: consumptionError } = await supabase
        .from(TABLES.CONSUMPTION)
        .delete()
        .eq('product_name', productName);
      
      if (consumptionError) throw consumptionError;
      
      // Delete from salon consumption if the table exists
      if (TABLES.SALON_CONSUMPTION) {
        const targetSalonTable = TABLES.SALON_CONSUMPTION || 'salon_consumption_orders';
        try {
          const { error: salonError } = await supabase
            .from(targetSalonTable)
            .delete()
            .eq('product_name', productName);
          
          if (salonError && !salonError.message.includes('does not exist')) {
            console.error('Error deleting from salon consumption:', salonError);
          }
        } catch (salonError) {
          console.error('Error in salon consumption delete operation:', salonError);
          // Continue with other deletions
        }
      }
      
      // Step 7: Invalidate queries more carefully to prevent infinite loops
      // Only invalidate the specific balance stock query with exact match
      // This prevents cascading invalidations that can cause loops
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.BALANCE_STOCK],
        exact: true
      });
      
      // Set a small delay before triggering the event to prevent race conditions
      setTimeout(() => {
        // Dispatch an event for real-time updates
        window.dispatchEvent(new CustomEvent('inventory-updated', { 
          detail: { type: 'product-deleted', productName } 
        }));
        
        console.log(`Successfully deleted product "${productName}" and all related records`);
      }, 100);
      
      return { success: true };
    } catch (error) {
      console.error(`Error deleting product "${productName}":`, error);
      return { success: false, error };
    }
  };

  // Function to delete consumer sales by consumer name
  const deleteConsumerSales = async (consumerName: string) => {
    try {
      if (!consumerName) {
        console.error('Consumer name is required for deletion');
        return { success: false, error: 'Consumer name is required' };
      }

      console.log(`Deleting sales for consumer "${consumerName}"...`);
      
      // Delete from inventory_sales_consumer table (which tracks consumer-specific sales)
      try {
        const { error: consumerSalesError } = await supabase
          .from(TABLES.SALES_CONSUMER)
          .delete()
          .eq('consumer_name', consumerName);
          
        if (consumerSalesError) {
          console.error('Error deleting consumer sales records:', consumerSalesError);
        } else {
          console.log(`Deleted consumer sales records for "${consumerName}"`);
        }
      } catch (error) {
        console.error('Exception deleting consumer sales records:', error);
      }
      
      // Recalculate balance stock and invalidate related queries
      await recalculateBalanceStock();
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER_SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALANCE_STOCK] });
      
      // Dispatch an event for real-time updates
      window.dispatchEvent(new CustomEvent('inventory-updated', { 
        detail: { type: 'consumer-sales-deleted', consumerName } 
      }));
      
      console.log(`Successfully deleted sales for consumer "${consumerName}"`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting consumer sales for "${consumerName}":`, error);
      return { success: false, error };
    }
  };

  // Function to delete consumer sales by invoice number
  const deleteConsumerSalesByInvoice = async (invoiceNumber: string) => {
    try {
      if (!invoiceNumber) {
        console.error('Invoice number is required for deletion');
        return { success: false, error: 'Invoice number is required' };
      }

      console.log(`Deleting sales with invoice number "${invoiceNumber}"...`);
      
      // Delete from consumer sales table
      try {
        const { error: consumerSalesError } = await supabase
          .from(TABLES.SALES_CONSUMER)
          .delete()
          .eq('invoice_no', invoiceNumber);
          
        if (consumerSalesError) {
          console.error('Error deleting consumer sales by invoice:', consumerSalesError);
        } else {
          console.log(`Deleted consumer sales with invoice "${invoiceNumber}"`);
        }
      } catch (error) {
        console.error('Exception deleting consumer sales by invoice:', error);
      }
      
      // Delete from main sales table as well
      try {
        const { error: salesError } = await supabase
          .from(TABLES.SALES)
          .delete()
          .eq('invoice_no', invoiceNumber);
          
        if (salesError) {
          console.error('Error deleting main sales records by invoice:', salesError);
        } else {
          console.log(`Deleted main sales records with invoice "${invoiceNumber}"`);
        }
      } catch (error) {
        console.error('Exception deleting main sales records by invoice:', error);
      }
      
      // Recalculate balance stock and invalidate related queries
      await recalculateBalanceStock();
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER_SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALANCE_STOCK] });
      
      // Dispatch an event for real-time updates
      window.dispatchEvent(new CustomEvent('inventory-updated', { 
        detail: { type: 'invoice-deleted', invoiceNumber } 
      }));
      
      console.log(`Successfully deleted sales with invoice "${invoiceNumber}"`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting sales with invoice "${invoiceNumber}":`, error);
      return { success: false, error };
    }
  };

  // Find the original lookupOrderById function and update it
  const lookupOrderById = async (orderId: string): Promise<{ success: boolean; source?: string }> => {
    try {
      // First check SALON_CONSUMPTION table
      const targetSalonTable = TABLES.SALON_CONSUMPTION || 'salon_consumption_orders';
      
      const { data, error } = await supabase
        .from(targetSalonTable)
        .select('order_id')
        .eq('order_id', orderId)
        .maybeSingle();
      
      if (data && !error) {
        return { success: true, source: 'salon_consumption' };
      }

      // Then check POS orders
      const { data: posData, error: posError } = await supabase
        .from(TABLES.POS_ORDERS)
        .select('order_id')
        .eq('order_id', orderId)
        .maybeSingle();
      
      if (posData && !posError) {
        return { success: true, source: 'pos' };
      }

      // Finally check sales
      const { data: salesData, error: salesError } = await supabase
        .from(TABLES.SALES)
        .select('invoice_no')
        .eq('invoice_no', orderId)
        .maybeSingle();
      
      if (salesData && !salesError) {
        return { success: true, source: 'sales' };
      }

      return { success: false };
    } catch (error) {
      console.error('Error looking up order by ID:', error);
      return { success: false };
    }
  };

  return {
    // Queries
    purchasesQuery,
    salesQuery,
    consumptionQuery,
    balanceStockQuery,
    customerSalesQuery,
    
    // Create purchase
    createPurchase,
    isCreatingPurchase,
    
    // Sync sales
    syncSalesFromPos,
    isSyncingSales,
    
    // Sync consumption
    syncConsumptionFromPos,
    isSyncingConsumption,
    
    // Export data
    exportInventoryData,
    isExporting,
    
    // Processing stats for UI feedback
    processingStats,
    
    // Add the new functions to the exports
    recordSalonConsumption: recordSalonConsumption.mutateAsync,
    recalculateBalanceStock,
    createInventorySaleFromOrder: createInventorySaleFromOrder.mutateAsync,
    initializeConsumptionData,
    deletePurchase,
    deleteSale,
    deleteConsumption,
    deleteProduct,
    deleteConsumerSales,
    deleteConsumerSalesByInvoice
  };
};
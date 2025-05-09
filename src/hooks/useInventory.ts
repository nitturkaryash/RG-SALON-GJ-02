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
  notes?: string; // Added notes field
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
  const [processingStats, setProcessingStats] = useState<ProcessingStats>({
      startTime: undefined,
      endTime: undefined,
      total: 0,
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: []
  });

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

      let allOrders: any[] = []; // Initialize with type
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
        (order.customer_name === 'Salon Internal' && order.items && order.items.some((item: any) => item?.type?.toLowerCase() === 'product')) // Add null check for item
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
        const productItems = order.items || order.services || []; // Check both

        // Process each product item
        for (const item of productItems) {
          if (!item || typeof item !== 'object') continue;
          // Make type checking less strict - allow both 'product' and 'Product' types
          const itemType = item.type?.toLowerCase(); // Safe access
          if (itemType !== 'product') continue;

          try {
            // Ensure price is a valid number
            const price = Number(item.price || 0);

            // Ensure quantity is a valid number
            const quantity = Number(item.quantity || 1);

            // Calculate total with defined values
            const itemTotal = price * quantity;
            if (!isFinite(itemTotal)) {
                console.warn('Calculated itemTotal is not finite:', { price, quantity, orderId: order.id, itemId: item.id });
                continue; // Skip if calculation results in NaN or Infinity
            }

            const consumptionRecord: SalonConsumptionRecord = {
              id: item.id || `${order.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              order_id: order.id || order.order_id || `ORDER-${Date.now()}`,
              date: order.created_at || order.order_date || order.date || new Date().toISOString(),
              product_name: item.item_name || item.name || item.product_name || 'Unknown Product',
              quantity: quantity,
              stylist: order.stylist_name || order.staff_name || 'No stylist',
              status: order.status || 'Completed',
              total: itemTotal,
              type: 'Product', // Ensure type matches SalonConsumptionRecord if different
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
          .upsert(consumptionRecords as any, { onConflict: 'id', ignoreDuplicates: false }); // Use 'as any' for now

        if (error) {
          console.warn('Error saving initialized data to Supabase:', error);
        } else {
          console.log('Successfully saved initialized data to Supabase');
        }
      } catch (error) {
        console.warn('Error during Supabase save of initialized data:', error);
      }
    } catch (error: any) { // Type error
      console.error('Error in initializeConsumptionData:', error.message);
    }
  };

  // Call the initialization function when the hook is used
  useEffect(() => {
    initializeConsumptionData();
  }, []);

  // Function to calculate derived values for purchases
  const calculatePurchaseValues = (data: PurchaseFormState): Partial<Purchase> => {
    // Ensure inputs are numbers
    const mrpInclGst = Number(data.mrp_incl_gst || 0);
    const gstPercentage = Number(data.gst_percentage || 18);
    const discountPercentage = Number(data.discount_on_purchase_percentage || 0);
    const quantity = Number(data.purchase_qty || 1);
    const providedCost = Number(data.purchase_cost_per_unit_ex_gst || 0);

    // Calculate MRP excluding GST
    const mrpExclGst = gstPercentage >= 0 ? mrpInclGst / (1 + (gstPercentage / 100)) : mrpInclGst;

    // Calculate or use provided purchase cost per unit ex GST
    // This is the price after applying discount to MRP excluding GST
    let costPerUnitExGst = providedCost > 0 ? providedCost : mrpExclGst * (1 - (discountPercentage / 100));
    // Handle potential NaN/Infinity from mrpExclGst calculation
    if (!isFinite(costPerUnitExGst)) {
      costPerUnitExGst = 0;
    }

    // Calculate taxable value (cost * quantity)
    const taxableValue = costPerUnitExGst * quantity;

    // Calculate GST amounts
    const totalGst = taxableValue * (gstPercentage / 100);
    const cgst = gstPercentage > 0 ? totalGst / 2 : 0;
    const sgst = gstPercentage > 0 ? totalGst / 2 : 0;
    const igst = 0; // Assuming IGST is 0 for local purchases

    // Calculate invoice value
    const invoiceValue = taxableValue + totalGst;

    // Return calculated values, ensuring they are numbers
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
        
        // Use the salon_consumption_products view for detailed consumption data
        const tableNameToUse = TABLES.SALON_CONSUMPTION_PRODUCTS || 'salon_consumption_products';
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
        
        // Fetch all columns from the view
        const { data, error } = await supabase
          .from(tableNameToUse)
          .select('*')
          .order('Date', { ascending: false });
          
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
  const balanceStockQuery = useQuery<BalanceStock[], Error>({ // Add specific types
    queryKey: [QUERY_KEYS.BALANCE_STOCK],
    queryFn: async (): Promise<BalanceStock[]> => { // Specify return type
      try {
        // Log the actual table name being used for debugging
        console.log('Querying balance stock table:', TABLES.BALANCE_STOCK);

        // Ensure we're using a valid table name, not undefined
        const tableName = TABLES.BALANCE_STOCK || 'inventory_balance_stock';

        // Check if the table exists
        const { error: checkError } = await supabase
          .from(tableName)
          .select('id', { count: 'exact', head: true })
          .limit(1);

        if (checkError) {
          if (checkError.message.includes('does not exist')) {
            console.warn(`Balance stock table '${tableName}' does not exist. Attempting recalculation.`);
            // Try recalculating immediately if the table/view is missing
            try {
              const recalculatedStock = await calculateBalanceStock();
              return recalculatedStock;
            } catch (recalcError: any) {
              console.error("Failed to recalculate balance stock after table check failure:", recalcError.message);
              return []; // Return empty if recalc fails
            }
          } else {
             console.error(`Error checking balance stock table '${tableName}':`, checkError);
             throw handleSupabaseError(checkError);
          }
        }

        // Fetch data if table exists
        const { data, error } = await supabase
          .from(tableName)
          .select('*');

        if (error) {
            console.error("Error querying " + tableName + ":", error);
            throw handleSupabaseError(error);
        }

        // Log success for debugging
        console.log(`Successfully fetched ${data?.length || 0} balance stock records from ${tableName}`);
        return (data || []) as BalanceStock[]; // Assert type
      } catch (error: any) {
        console.error('Error fetching balance stock:', error.message);
        // Rethrow to let react-query handle it
        throw error;
      }
    },
    retry: (failureCount, error) => {
        // Don't retry if table doesn't exist
        if (error.message.includes('does not exist')) {
           return false;
        }
        return failureCount < 1; // Retry once otherwise
    },
    refetchOnWindowFocus: false,
    staleTime: 60000 // Increase stale time
  });

  // Query to fetch customer sales only (no salon consumption)
  const customerSalesQuery = useQuery<Sale[], Error>({ // Add specific types
    queryKey: [QUERY_KEYS.CUSTOMER_SALES],
    queryFn: async (): Promise<Sale[]> => { // Specify return type
      try {
        const salesTable = TABLES.SALES || 'inventory_sales_new';

        // Check if the sales table exists first
        const { error: tableCheckError } = await supabase
            .from(salesTable)
            .select('id', { count: 'exact', head: true })
            .limit(1);

        if (tableCheckError) {
            if (tableCheckError.message.includes('does not exist')) {
                console.warn(`Sales table '${salesTable}' does not exist. Cannot fetch customer sales.`);
                return []; // Return empty if table doesn't exist
            } else {
                console.error(`Error checking sales table '${salesTable}':`, tableCheckError);
                throw handleSupabaseError(tableCheckError);
            }
        }

        // Proceed to fetch data
        const { data, error } = await supabase
          .from(salesTable)
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          console.error('Error fetching all sales for customer sales filter:', error);
          throw handleSupabaseError(error);
        }

        // Filter in JavaScript
        // Ensure data is an array and sale objects have the property
        const customerSales = (data || []).filter(sale =>
            sale && typeof sale === 'object' && !sale.is_salon_consumption
        );

        return customerSales as Sale[]; // Assert final type

      } catch (error: any) {
        console.error('Error fetching customer sales:', error.message);
        return []; // Return empty array on error
      }
    },
    retry: (failureCount, error) => {
        // Don't retry if table doesn't exist
        if (error.message.includes('does not exist')) {
           return false;
        }
        return failureCount < 1; // Retry once otherwise
    },
    refetchOnWindowFocus: false,
    staleTime: 60000 // Increase stale time
  });

  // Mutation to create a new purchase
  const createPurchaseMutation = useMutation({
    mutationFn: async (purchaseData: PurchaseFormState): Promise<Purchase[]> => { // Specify return type
      setIsCreatingPurchase(true);
      try {
        // Calculate derived values
        const fullPurchaseData = calculatePurchaseValues(purchaseData);

        // Map fields correctly to match the Supabase table structure
        // Ensure all required fields have valid defaults
        const mappedPurchaseData: Omit<Purchase, 'created_at' | 'updated_at'> & { id: string } = {
          id: v4(), // Generate UUID
          purchase_id: `P-${Date.now()}`, // Simple unique ID
          date: fullPurchaseData.date || new Date().toISOString().split('T')[0],
          product_name: fullPurchaseData.product_name || 'Unknown Product',
          hsn_code: fullPurchaseData.hsn_code || '',
          units: fullPurchaseData.units || 'pcs',
          purchase_qty: Number(fullPurchaseData.purchase_qty || 0),
          mrp_incl_gst: Number(fullPurchaseData.mrp_incl_gst || 0),
          mrp_excl_gst: Number(fullPurchaseData.mrp_excl_gst || 0),
          gst_percentage: Number(fullPurchaseData.gst_percentage || 18),
          discount_on_purchase_percentage: Number(fullPurchaseData.discount_on_purchase_percentage || 0),
          purchase_cost_per_unit_ex_gst: Number(fullPurchaseData.purchase_cost_per_unit_ex_gst || 0),
          purchase_taxable_value: Number(fullPurchaseData.purchase_taxable_value || 0),
          purchase_igst: Number(fullPurchaseData.purchase_igst || 0),
          purchase_cgst: Number(fullPurchaseData.purchase_cgst || 0),
          purchase_sgst: Number(fullPurchaseData.purchase_sgst || 0),
          purchase_invoice_value_rs: Number(fullPurchaseData.purchase_invoice_value_rs || 0),
          vendor_name: fullPurchaseData.vendor_name || 'Unknown Vendor',
          invoice_no: fullPurchaseData.invoice_no || 'N/A',
        };

        // Use retry wrapper for insertion
        const result = await retryDatabaseOperation(async () => {
          const { data: insertedData, error } = await supabase
            .from(TABLES.PURCHASES)
            .insert([mappedPurchaseData as any]) // Use 'as any' for now
            .select();

          if (error) throw handleSupabaseError(error);
          if (!insertedData || insertedData.length === 0) throw new Error('No data returned from purchase insertion');

          return insertedData as Purchase[]; // Assert return type
        });

        return result;
      } finally {
        setIsCreatingPurchase(false);
      }
    },
    onSuccess: (data) => {
      console.log('Purchase created successfully via mutation:', data);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASES] });
      // Invalidate balance stock after purchase
      recalculateBalanceStock();
      // Dispatch global event
      window.dispatchEvent(new CustomEvent('inventory-updated', {
        detail: { type: 'purchase', data: data?.[0] } // Send first item
      }));
    },
    onError: (error) => {
      console.error('Error creating purchase via mutation:', error);
      toast.error(`Failed to create purchase: ${error.message}`);
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
      // Ensure all required fields have valid defaults
      const purchaseObject: Omit<Purchase, 'created_at' | 'updated_at'> & { id: string } = {
        id: v4(), // Generate UUID
        purchase_id: `P-${Date.now()}`, // Simple unique ID
        date: fullPurchaseData.date || new Date().toISOString().split('T')[0],
        product_name: fullPurchaseData.product_name || 'Unknown Product',
        hsn_code: fullPurchaseData.hsn_code || '',
        units: fullPurchaseData.units || 'pcs',
        purchase_qty: Number(fullPurchaseData.purchase_qty || 0),
        mrp_incl_gst: Number(fullPurchaseData.mrp_incl_gst || 0),
        mrp_excl_gst: Number(fullPurchaseData.mrp_excl_gst || 0),
        gst_percentage: Number(fullPurchaseData.gst_percentage || 18),
        discount_on_purchase_percentage: Number(fullPurchaseData.discount_on_purchase_percentage || 0),
        purchase_cost_per_unit_ex_gst: Number(fullPurchaseData.purchase_cost_per_unit_ex_gst || 0),
        purchase_taxable_value: Number(fullPurchaseData.purchase_taxable_value || 0),
        purchase_igst: Number(fullPurchaseData.purchase_igst || 0),
        purchase_cgst: Number(fullPurchaseData.purchase_cgst || 0),
        purchase_sgst: Number(fullPurchaseData.purchase_sgst || 0),
        purchase_invoice_value_rs: Number(fullPurchaseData.purchase_invoice_value_rs || 0),
        vendor_name: fullPurchaseData.vendor_name || 'Default Vendor',
        invoice_no: fullPurchaseData.invoice_no || `INV-${Date.now()}`,
      };

      console.log('Direct insertion attempt with data:', purchaseObject);

      // Use retry function for more reliable database operations
      const result = await retryDatabaseOperation(async () => {
        const { data, error } = await supabase
          .from(TABLES.PURCHASES)
          .insert([purchaseObject as any]) // Use 'as any' for now
          .select();

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('No data returned from insertion');

        return data[0] as Purchase;
      }, 3); // Try up to 3 times

      console.log('Direct insertion successful:', result);
      return result;
    } catch (error: any) {
      console.error('Error in direct purchase insertion after retries:', error.message);
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

      let orders: any[] = []; // Initialize as empty array
      try {
        orders = JSON.parse(ordersStr);
      } catch (e) {
        console.error("Error parsing orders from localStorage:", e);
        return []; // Return empty if parsing fails
      }

      // Ensure orders is an array
      if (!Array.isArray(orders)) {
        console.error("Parsed orders is not an array.");
        return [];
      }

      // Filter orders by date range
      const filteredOrders = orders.filter((order: any) => {
        if (!order || (!order.created_at && !order.order_date)) {
          console.warn("Skipping order due to missing date:", order?.id);
          return false; // Skip orders without a valid date
        }
        const orderDate = new Date(order.created_at || order.order_date);
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Set the time for comparison to ensure full day ranges
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        // Add checks for valid dates
        if (isNaN(orderDate.getTime()) || isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.warn("Skipping order due to invalid date(s):", { orderId: order?.id, orderDate, start, end });
          return false;
        }

        return orderDate >= start && orderDate <= end;
      });

      // Map orders to the format expected by the inventory system
      return filteredOrders.map((order: any) => {
        // Determine if this is a salon consumption order
        const isSalonConsumption = Boolean(order.is_salon_consumption || order.is_salon_purchase);

        // Get customer name or use Walk-in for standard customers
        const customerName = order.client_name || order.customer_name || "Walk-in";

        // For each order, extract product items
        let productItems: any[] = []; // Initialize as empty array

        // Normalize items access (check services first, then items)
        const potentialItems = order.services || order.items || [];
        if (!Array.isArray(potentialItems)) {
          console.warn("Order items/services is not an array:", order?.id);
        } else {
           productItems = potentialItems
            .filter((item: any) => item && (item.type === 'product' || item.item_type === 'product')) // Check item_type too
            .map((item: any) => {
              const price = parseFloat(String(item.price || item.rate || 0)); // Use item.rate as fallback
              const quantity = parseInt(String(item.quantity || 1), 10);
              const gstPercentage = parseFloat(String(item.gst_percentage || 18));
              const discountAmount = parseFloat(String(order.discount || 0));
              const subtotal = parseFloat(String(order.subtotal || 0));
              const discountPercentage = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0;
              const mrpExclGst = price / (1 + gstPercentage / 100);

              return {
                product_name: item.service_name || item.item_name || item.name || 'Unknown Product',
                hsn_code: item.hsn_code || '3304', // Default HSN code for cosmetics
                units: item.units || 'pcs', // Default units
                quantity: isNaN(quantity) ? 1 : quantity, // Default quantity if NaN
                mrp_incl_gst: isNaN(price) ? 0 : price, // Default price if NaN
                mrp_excl_gst: isNaN(mrpExclGst) ? 0 : mrpExclGst,
                discount_percentage: isNaN(discountPercentage) ? 0 : discountPercentage,
                gst_percentage: isNaN(gstPercentage) ? 18 : gstPercentage,
              };
            });
        }


        return {
          date: order.created_at || order.order_date,
          invoice_no: order.invoice_number || order.id, // Using order ID as invoice number
          is_salon_consumption: isSalonConsumption,
          customer_name: customerName,
          items: productItems // Ensure items is always an array
        };
      });
    } catch (error) {
      console.error('Error fetching sales from POS:', error);
      return []; // Return empty array on error
    }
  };

  // Function to sync sales data from POS
  const syncSalesFromPos = async (startDate: string, endDate: string) => {
    setIsSyncingSales(true);
    // Initialize with a non-null object
    setProcessingStats({
      startTime: new Date(),
      endTime: null,
      total: 0,
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: []
    });

    try {
      // Fetch orders from POS
      const orders = await fetchSalesFromPOS(startDate, endDate);

      // Get purchase stats
      // Ensure orders and items exist before reducing
      const totalItems = orders.reduce((acc: number, order: any) => acc + (order.items?.length || 0), 0);
      const purchaseStats = {
        total: totalItems
      };

      setProcessingStats((prev) => ({ // prev is guaranteed non-null here
        ...prev!,
        total: purchaseStats.total
      }));

      // Process each order
      for (const order of orders) {
        // Ensure items exist
        const items = order.items || [];
        // Process each item in the order
        for (const item of items) {
          try {
            // Calculate sales values with explicit number conversion to avoid NaN
            const mrpInclGst = parseFloat(String(item.mrp_incl_gst || 0)); // Ensure string input for parseFloat
            const gstPercentage = parseFloat(String(item.gst_percentage || 18));
            const discountPercentage = parseFloat(String(item.discount_percentage || 0));
            const quantity = parseFloat(String(item.quantity || 1));

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
            const saleRecord: Omit<Sale, 'sale_id' | 'id'> & { id: string } = { // Adjusted type for Sale
              id: v4(), // Add id here
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
            Object.keys(saleRecord).forEach((key: string) => {
              const recordKey = key as keyof typeof saleRecord; // Type assertion
              const value = saleRecord[recordKey];
              if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
                 // Use type assertion to modify
                (saleRecord as any)[recordKey] = 0; // Replace NaN or Infinity with 0
              }
            });

            // Increment processed count
            setProcessingStats((prev) => ({ // prev is guaranteed non-null here
              ...prev!,
              processed: prev!.processed + 1
            }));

            // Insert the sale record
            const { error } = await supabase
              .from(TABLES.SALES)
              .insert(saleRecord as any); // Use 'as any' for now, refine later if needed

            if (error) {
              throw handleSupabaseError(error);
            }

            // Increment success count
            setProcessingStats((prev) => ({ // prev is guaranteed non-null here
              ...prev!,
              succeeded: prev!.succeeded + 1
            }));

          } catch (error: any) { // Type the catch error
            console.error('Error processing sale item:', error);

            // Increment processed and failed counts
            setProcessingStats((prev) => ({ // prev is guaranteed non-null here
              ...prev!,
              processed: prev!.processed + 1,
              failed: prev!.failed + 1,
              errors: [...prev!.errors, `Error with ${item.product_name}: ${error?.message || error}`] // Access error message safely
            }));
          }
        }
      }

      // Record the end time
      setProcessingStats((prev) => ({ // prev is guaranteed non-null here
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
    } catch (error: any) { // Type the catch error
      console.error('Error syncing sales data:', error);

      // Record the error state
      setProcessingStats((prev) => ({ // prev is guaranteed non-null here
        ...prev!,
        endTime: new Date(),
        errors: [...prev!.errors, `General error: ${error?.message || error}`] // Access error message safely
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
    console.log(`Syncing ${type} consumption from POS...`);
    setIsSyncingConsumption(true);

    // Get table name from constants
    const tableNameToUse = TABLES.SALON_CONSUMPTION;
    const syncTime = new Date().toISOString(); // Define syncTime

    try {
      // Fetch all consumption records from the database
      const { data: existingRecords, error: fetchError } = await supabase
        .from(tableNameToUse)
        .select('id, order_id, product_name, quantity');

      if (fetchError) {
        console.error('Error fetching existing consumption records:', fetchError.message);
        throw fetchError;
      }

      // Filter for existing salon consumption orders (using a different name)
      const existingSalonConsumptionRecords = existingRecords.filter((record: any) =>
        record.type === 'salon_consumption'
      );

      // Filter for salon consumption orders
      const salonConsumptionOrders = existingRecords.filter((record: any) =>
        record.type === 'salon_consumption'
      );

      // Filter for salon consumption orders
      const salonConsumptionOrdersToSync = existingRecords.filter((record: any) =>
        record.type === 'salon_consumption'
      );

      // Filter for salon consumption orders
      const salonConsumptionOrdersToInsert = existingRecords.filter((record: any) =>
        record.type === 'salon_consumption'
      );

      // Filter for salon consumption orders
      const salonConsumptionOrdersToDelete = existingRecords.filter((record: any) =>
        record.type === 'salon_consumption'
      );

      // Filter for salon consumption orders
      const salonConsumptionOrdersToUpdate = existingRecords.filter((record: any) =>
        record.type === 'salon_consumption'
      );

      // Filter for salon consumption orders
      const salonConsumptionOrdersToUpsert = existingRecords.filter((record: any) =>
        record.type === 'salon_consumption'
      );

      // Deduplicate consumption records before syncing
      // Get POS orders from localStorage
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
      
      // Filter specifically for salon consumption orders and ensure they're marked as completed (using a different name)
      let filteredSalonConsumptionOrders = filteredOrders.filter(
        (order: any) => order.is_salon_consumption === true ||
                      order.salon_consumption === true ||
                      order.purchase_type === 'salon_consumption' ||
                      order.order_type === 'salon_consumption' ||
                      order.category === 'Salon Consumption' ||
                      order.customer_name === 'Salon Internal' ||
                      order.client_name === 'Salon Internal'
      );
      
      // Force status to completed for all salon consumption orders (assign to a new variable)
      const completedSalonConsumptionOrders = filteredSalonConsumptionOrders.map((order: any) => {
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
      
      console.log(`Found ${completedSalonConsumptionOrders.length} salon consumption orders`);
      
      if (completedSalonConsumptionOrders.length === 0) {
        console.log("No salon consumption orders found");
        setIsSyncingConsumption(false);
        return { success: true, data: [] };
      }

      // Process each salon consumption order
      let allConsumptionRecords: any[] = [];
      
      for (const order of completedSalonConsumptionOrders) {
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
        completedSalonConsumptionOrders.forEach((order: any) => {
          if (ordersMap.has(order.id)) {
            ordersMap.set(order.id, { ...order, status: 'completed' });
          }
        });
        
        // Convert map back to array
        const updatedOrders = Array.from(ordersMap.values());
        
        // Save back to localStorage
        localStorage.setItem("orders", JSON.stringify(updatedOrders));
        console.log(`Updated ${completedSalonConsumptionOrders.length} orders in localStorage`);
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
        consumption: TABLES.SALON_CONSUMPTION || 'inventory_consumption'
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

  // Mutation to record salon consumption directly
  const recordSalonConsumption = useMutation<
    { success: boolean; message: string; data?: any[]; error?: any }, // Success type
    Error, // Error type
    SalonConsumptionItem[] // Variables type
  >({
    mutationFn: async (items: SalonConsumptionItem[]): Promise<{ success: boolean; message: string; data?: any[]; error?: any }> => {
      if (!items || items.length === 0) return { success: false, message: 'No items to record' };

      try {
        const consumptionTable = TABLES.SALON_CONSUMPTION || 'inventory_consumption';
        const purchasesTable = TABLES.PURCHASES || 'inventory_purchases';

        // Generate a shared requisition voucher number for all items
        const voucherNumber = items[0]?.requisition_voucher_no || `POS-SALON-${new Date().getTime()}`; // Safe access
        const currentDate = items[0]?.date || new Date().toISOString(); // Safe access

        // Process each consumption item
        const consumptionRecords: any[] = []; // Use any[] for flexibility, refine if needed
        for (const item of items) {
          // Ensure item and product_name exist
          if (!item || !item.product_name) {
            console.warn("Skipping invalid consumption item:", item);
            continue;
          }

          // Get product details if needed
          let productDetails = { hsn_code: '', units: 'pcs' }; // Default units

          // Try to find product details from purchases if they're not provided
          if (!item.hsn_code || !item.units) {
            const { data: purchaseData, error: purchaseError } = await supabase
              .from(purchasesTable)
              .select('hsn_code, units')
              .eq('product_name', item.product_name)
              .order('date', { ascending: false })
              .limit(1);

            if (purchaseError) {
              console.warn(`Error fetching purchase details for ${item.product_name}:`, purchaseError.message);
            }
            if (purchaseData && purchaseData.length > 0) {
              productDetails = {
                hsn_code: purchaseData[0].hsn_code || '',
                units: purchaseData[0].units || 'pcs' // Ensure default
              };
            }
          }

          // Ensure quantity and price are numbers
          const quantity = Number(item.quantity || 1);
          const unitPrice = Number(item.unit_price || 0);
          const gstPercentage = 18; // Assuming 18%

          // Calculate price excluding GST
          const priceExGst = unitPrice / (1 + gstPercentage / 100);

          // Calculate taxable value
          const taxableValue = priceExGst * quantity;

          // Calculate GST amounts
          const totalGst = taxableValue * (gstPercentage / 100);
          const cgst = totalGst / 2;
          const sgst = totalGst / 2;

          // Total value with GST
          const totalValue = unitPrice * quantity;

          // Prepare consumption record - ensure all values are finite numbers
          const consumptionRecord = {
            id: v4(),
            date: currentDate,
            product_name: item.product_name,
            hsn_code: item.hsn_code || productDetails.hsn_code,
            units: item.units || productDetails.units,
            requisition_voucher_no: voucherNumber,
            consumption_qty: isFinite(quantity) ? quantity : 1,
            purchase_cost_per_unit_ex_gst: isFinite(priceExGst) ? priceExGst : 0,
            purchase_gst_percentage: gstPercentage,
            purchase_taxable_value: isFinite(taxableValue) ? taxableValue : 0,
            taxable_value: isFinite(taxableValue) ? taxableValue : 0, // Duplicate for compatibility?
            igst: 0,
            cgst: isFinite(cgst) ? cgst : 0,
            sgst: isFinite(sgst) ? sgst : 0,
            invoice_value: isFinite(totalValue) ? totalValue : 0,
            purpose: item.purpose || 'Salon Use',
            notes: item.notes || '',
            is_salon_consumption: true,
            created_at: new Date().toISOString()
          };

          consumptionRecords.push(consumptionRecord);
        }

        if (consumptionRecords.length === 0) {
          return { success: true, message: 'No valid consumption records to insert' };
        }

        // Insert all consumption records using retry wrapper
        const insertedData = await retryDatabaseOperation(async () => {
            const { data, error } = await supabase
              .from(consumptionTable)
              .insert(consumptionRecords)
              .select(); // Select to get inserted data back

            if (error) throw handleSupabaseError(error);
            return data;
        });

        // Return success
        return {
          success: true,
          message: `Successfully recorded ${insertedData?.length || 0} items`,
          data: insertedData || []
        };
      } catch (error: any) {
        console.error('Error recording salon consumption:', error.message);
        return {
          success: false,
          message: error.message || 'Unknown error recording consumption',
          error
        };
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONSUMPTION] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALANCE_STOCK] });
        // Recalculate balance immediately
        recalculateBalanceStock();
      } else {
        toast.error(`Failed to record consumption: ${result.message}`);
      }
    },
    onError: (error) => {
      console.error('Error in consumption mutation:', error);
      toast.error(`Mutation error: ${error.message}`);
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
      const productMap = new Map<string, Partial<BalanceStock> & { product_name: string }>(); // Use a Map with specific type

      // Define accumulator type for purchases
      type PurchaseAccumulator = {
        [key: string]: {
          product_name: string;
          hsn_code: string;
          units: string;
          purchase_qty: number;
          purchase_taxable_value: number;
          purchase_cgst: number;
          purchase_sgst: number;
          purchase_igst: number;
          purchase_invoice_value: number;
        }
      };

      // First, process purchases - these ADD to inventory
      const purchasesByProduct = purchases.reduce((acc: PurchaseAccumulator, purchase: Purchase) => { // Type accumulator and purchase
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

        // Ensure values are numbers before adding
        acc[productName].purchase_qty += parseFloat(String(purchase.purchase_qty || 0)); // Removed fallback to purchase.quantity
        acc[productName].purchase_taxable_value += parseFloat(String(purchase.purchase_taxable_value || 0));
        acc[productName].purchase_cgst += parseFloat(String(purchase.purchase_cgst || 0));
        acc[productName].purchase_sgst += parseFloat(String(purchase.purchase_sgst || 0));
        acc[productName].purchase_igst += parseFloat(String(purchase.purchase_igst || 0));
        acc[productName].purchase_invoice_value += parseFloat(String(purchase.purchase_invoice_value_rs || 0));

        return acc;
      }, {}); // Initial value remains empty object

      // Convert purchases to array and populate productMap
      Object.values(purchasesByProduct).forEach((purchase) => { // Type purchase implicitly
        const productName = purchase.product_name;

        productMap.set(productName, {
          id: v4(), // Generate ID here
          product_name: productName,
          hsn_code: purchase.hsn_code,
          units: purchase.units,
          balance_qty: purchase.purchase_qty,
          taxable_value: purchase.purchase_taxable_value,
          igst: purchase.purchase_igst,
          cgst: purchase.purchase_cgst,
          sgst: purchase.purchase_sgst,
          invoice_value: purchase.purchase_invoice_value,
          last_updated: new Date().toISOString() // Added last_updated
        });
      });

      // Define accumulator type for sales
       type SaleAccumulator = {
        [key: string]: {
          product_name: string;
          sales_qty: number;
          sales_taxable_value: number;
          sales_cgst: number;
          sales_sgst: number;
          sales_igst: number;
          sales_invoice_value: number;
        }
      };

      // Group sales by product
      const salesByProduct = sales.reduce((acc: SaleAccumulator, sale: Sale) => { // Type accumulator and sale
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

        // Ensure values are numbers
        acc[productName].sales_qty += parseFloat(String(sale.sales_qty || sale.quantity || 0));
        acc[productName].sales_taxable_value += parseFloat(String(sale.sales_taxable_value || sale.taxable_value || 0));
        acc[productName].sales_cgst += parseFloat(String(sale.cgst_rs || sale.cgst || 0));
        acc[productName].sales_sgst += parseFloat(String(sale.sgst_rs || sale.sgst || 0));
        acc[productName].sales_igst += parseFloat(String(sale.igst_rs || sale.igst || 0));
        acc[productName].sales_invoice_value += parseFloat(String(sale.invoice_value_rs || sale.invoice_value || 0));

        return acc;
      }, {}); // Initial value remains empty object

      // Subtract sales
      Object.values(salesByProduct).forEach((sale) => { // Type sale implicitly
        const productName = sale.product_name;
        if (productMap.has(productName)) {
          const record = productMap.get(productName)!; // Use non-null assertion
          record.balance_qty = (record.balance_qty || 0) - sale.sales_qty;
          record.taxable_value = (record.taxable_value || 0) - sale.sales_taxable_value;
          record.cgst = (record.cgst || 0) - sale.sales_cgst;
          record.sgst = (record.sgst || 0) - sale.sales_sgst;
          record.igst = (record.igst || 0) - sale.sales_igst;
          record.invoice_value = (record.invoice_value || 0) - sale.sales_invoice_value;
        }
      });

      // Define accumulator type for consumption
       type ConsumptionAccumulator = {
        [key: string]: {
          product_name: string;
          consumption_qty: number;
          consumption_taxable_value: number;
          consumption_cgst: number;
          consumption_sgst: number;
          consumption_igst: number;
          consumption_invoice_value: number;
        }
      };

      // Group consumption by product
      const consumptionByProduct = consumption.reduce((acc: ConsumptionAccumulator, cons: any) => { // Changed cons type to any
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

        // Ensure values are numbers
        acc[productName].consumption_qty += parseFloat(String(cons.consumption_qty || cons.quantity || 0));
        acc[productName].consumption_taxable_value += parseFloat(String(cons.taxable_value || 0));
        acc[productName].consumption_cgst += parseFloat(String(cons.cgst || 0));
        acc[productName].consumption_sgst += parseFloat(String(cons.sgst || 0));
        acc[productName].consumption_igst += parseFloat(String(cons.igst || 0));
        acc[productName].consumption_invoice_value += parseFloat(String(cons.invoice_value || cons.total || 0));

        return acc;
      }, {}); // Initial value remains empty object

      // Subtract consumption
      Object.values(consumptionByProduct).forEach((cons) => { // Type cons implicitly
        const productName = cons.product_name;
        if (productMap.has(productName)) {
          const record = productMap.get(productName)!; // Use non-null assertion
          record.balance_qty = (record.balance_qty || 0) - cons.consumption_qty;
          record.taxable_value = (record.taxable_value || 0) - cons.consumption_taxable_value;
          record.cgst = (record.cgst || 0) - cons.consumption_cgst;
          record.sgst = (record.sgst || 0) - cons.consumption_sgst;
          record.igst = (record.igst || 0) - cons.consumption_igst;
          record.invoice_value = (record.invoice_value || 0) - cons.consumption_invoice_value;
        }
      });

      // Round values and ensure no negative values
      const balanceStockResult: BalanceStock[] = Array.from(productMap.values()) // Explicit type
        .map((item: Partial<BalanceStock> & { product_name: string }) => ({ // Type item
          id: item.id || v4(), // Ensure ID exists
          product_name: item.product_name,
          hsn_code: item.hsn_code || '',
          units: item.units || 'pcs',
          balance_qty: Math.max(0, parseFloat(parseFloat(String(item.balance_qty || 0)).toFixed(2))), // Convert string from toFixed back to number
          taxable_value: Math.max(0, parseFloat(parseFloat(String(item.taxable_value || 0)).toFixed(2))), // Convert string from toFixed back to number
          igst: Math.max(0, parseFloat(parseFloat(String(item.igst || 0)).toFixed(2))),               // Convert string from toFixed back to number
          cgst: Math.max(0, parseFloat(parseFloat(String(item.cgst || 0)).toFixed(2))),               // Convert string from toFixed back to number
          sgst: Math.max(0, parseFloat(parseFloat(String(item.sgst || 0)).toFixed(2))),               // Convert string from toFixed back to number
          invoice_value: Math.max(0, parseFloat(parseFloat(String(item.invoice_value || 0)).toFixed(2))), // Convert string from toFixed back to number
          last_updated: item.last_updated || new Date().toISOString() // Ensure last_updated exists
        } as BalanceStock)) // Assert final type
        .filter((item: BalanceStock) => item.balance_qty !== undefined && item.balance_qty > 0); // Add undefined check

      console.log(`Recalculated balance stock for ${balanceStockResult.length} products`);

      // Store in local storage
      localStorage.setItem('inventory_balance_stock', JSON.stringify(balanceStockResult));

      // Inform UI of changes - Use specific query key
      queryClient.setQueryData([QUERY_KEYS.BALANCE_STOCK], balanceStockResult);

      return balanceStockResult;
    } catch (error) {
      console.error('Error recalculating balance stock:', error);
      // Return empty array on error instead of throwing
      return [];
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
        // Extract product items from the order - Check both services and items
        const potentialItems = order.services || order.items || [];
        if (!Array.isArray(potentialItems)) {
          console.warn('Order has no valid items/services array:', order.id);
          return { success: true, message: 'No items array found in order' };
        }

        const productItems = potentialItems.filter((item: any) =>
          item && (item.type === 'product' || item.item_type === 'product' || item.service?.type === 'product')
        );

        if (productItems.length === 0) {
          return { success: true, message: 'No product items to record' };
        }

        // Process each product item as an inventory sale
        const saleRecords: Partial<Sale>[] = []; // Use Partial<Sale>

        for (const item of productItems) {
          // Determine if the item is using the new or old structure
          const product = item.service || item;
          const productName = product.name || product.service_name || product.item_name || 'Unknown Product';
          const productPrice = parseFloat(String(product.price || product.rate || 0));
          const itemQuantity = parseInt(String(item.quantity || 1), 10);
          const itemType = product.type || item.item_type || 'product';

          if (itemType !== 'product') continue;

          // Create a basic sale record with required fields only
          const basicSaleRecord: Partial<Sale> = {
            id: v4(),
            date: order.created_at || order.date || new Date().toISOString(),
            product_name: productName,
            sales_qty: isNaN(itemQuantity) ? 1 : itemQuantity,
            mrp_incl_gst: isNaN(productPrice) ? 0 : productPrice,
            customer_name: order.customer_name || order.client_name || 'Walk-in',
            is_salon_consumption: order.is_salon_consumption || false,
            created_at: new Date().toISOString(),
            invoice_no: order.invoice_number || order.id // Add invoice_no
          };

          // Add optional fields - Wrapped in try-catch for safety
          try {
            const gstPercentage = parseFloat(String(product.gst_percentage || 18));
            const discountAmount = parseFloat(String(order.discount || 0));
            const subtotal = parseFloat(String(order.subtotal || 0));
            const discountPercentage = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0;
            const mrpExclGst = productPrice / (1 + (isNaN(gstPercentage) ? 18 : gstPercentage) / 100);
            const discountedRateExclGst = mrpExclGst * (1 - (isNaN(discountPercentage) ? 0 : discountPercentage) / 100);
            const taxableValue = discountedRateExclGst * (isNaN(itemQuantity) ? 1 : itemQuantity);
            const totalGst = taxableValue * ((isNaN(gstPercentage) ? 18 : gstPercentage) / 100);
            const cgst = totalGst / 2;
            const sgst = totalGst / 2;
            const invoiceValue = taxableValue + totalGst;

            basicSaleRecord.gst_percentage = isNaN(gstPercentage) ? 18 : gstPercentage;
            basicSaleRecord.discount_percentage = isNaN(discountPercentage) ? 0 : discountPercentage;
            basicSaleRecord.mrp_excl_gst = isNaN(mrpExclGst) ? 0 : mrpExclGst;
            basicSaleRecord.taxable_value = isNaN(taxableValue) ? 0 : taxableValue;
            basicSaleRecord.cgst = isNaN(cgst) ? 0 : cgst;
            basicSaleRecord.sgst = isNaN(sgst) ? 0 : sgst;
            basicSaleRecord.invoice_value = isNaN(invoiceValue) ? 0 : invoiceValue;
            basicSaleRecord.hsn_code = product.hsn_code || '';
            basicSaleRecord.units = product.units || 'pcs';

            // Try to get purchase cost info if possible
            const { data: purchaseData } = await supabase
              .from(TABLES.PURCHASES)
              .select('*')
              .eq('product_name', productName)
              .order('date', { ascending: false })
              .limit(1);

            if (purchaseData && purchaseData.length > 0) {
              const latestPurchase = purchaseData[0];
              const purchaseCostPerUnit = parseFloat(String(latestPurchase.purchase_cost_per_unit_ex_gst || 0));
              const purchaseGst = parseFloat(String(latestPurchase.gst_percentage || 18));

              basicSaleRecord.purchase_cost_per_unit_ex_gst = isNaN(purchaseCostPerUnit) ? 0 : purchaseCostPerUnit;
              basicSaleRecord.purchase_gst_percentage = isNaN(purchaseGst) ? 18 : purchaseGst;
              basicSaleRecord.purchase_taxable_value = (isNaN(purchaseCostPerUnit) ? 0 : purchaseCostPerUnit) * (isNaN(itemQuantity) ? 1 : itemQuantity);
              const purchaseTotalGst = basicSaleRecord.purchase_taxable_value * (basicSaleRecord.purchase_gst_percentage / 100);
              basicSaleRecord.purchase_cgst = purchaseTotalGst / 2;
              basicSaleRecord.purchase_sgst = purchaseTotalGst / 2;
              basicSaleRecord.total_purchase_cost = basicSaleRecord.purchase_taxable_value + purchaseTotalGst;
            }
          } catch (calcError: any) {
            console.warn(`Calculation error for item ${productName} in order ${order.id}:`, calcError.message);
          }

          saleRecords.push(basicSaleRecord);
        }

        if (saleRecords.length === 0) {
          return { success: true, message: 'No processable product items found' };
        }

        // Insert all sale records
        const { data, error } = await supabase
          .from(TABLES.SALES)
          .insert(saleRecords as any) // Use 'as any' for now, type check insert object later
          .select();

        if (error) {
          throw handleSupabaseError(error);
        }

        console.log(`Successfully created ${data?.length || 0} sale records for order ${order.id}`);
        return { success: true, data };

      } catch (error: any) {
        console.error(`Error creating inventory sale from order ${order.id}:`, error.message);
        // Return success false but don't throw to allow other mutations
        return { success: false, error: error.message };
      }
    },
    onSuccess: (data, variables) => {
      if (data?.success) {
        console.log(`Sale creation success for order: ${variables.id}`);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER_SALES] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALANCE_STOCK] });
        // Trigger balance stock recalculation
        recalculateBalanceStock();
      }
    },
    onError: (error, variables) => {
      console.error(`Sale creation failed for order ${variables.id}:`, error);
      toast.error(`Failed to create sales record for order ${variables.id}`);
    }
  });

  /**
   * Explicitly recalculate balance stock by forcing a refresh of the view
   * This ensures that all components reflect updated stock values
   */
  const recalculateBalanceStock = async () => {
    try {
      console.log('Forcing recalculation of balance stock...');

      // Option 1: Use client-side calculation (more robust if view/RPC fails)
      const clientCalculatedStock = await calculateBalanceStock();
      queryClient.setQueryData([QUERY_KEYS.BALANCE_STOCK], clientCalculatedStock);
      console.log(`Balance stock recalculated client-side: ${clientCalculatedStock.length} products updated`);
      window.dispatchEvent(new Event('inventory-data-updated'));
      return true;

      // Option 2: Attempt view refresh via RPC (commented out, less reliable)
      /*
      const balanceStockView = TABLES.BALANCE_STOCK || 'inventory_balance_stock';
      const sql = `REFRESH MATERIALIZED VIEW CONCURRENTLY ${balanceStockView};`;

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (!error) {
          console.log('Successfully refreshed balance stock view via RPC');
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALANCE_STOCK] });
          window.dispatchEvent(new Event('inventory-data-updated'));
          return true;
        } else {
          console.warn('Could not refresh view via RPC, falling back to client calc:', error.message);
        }
      } catch (rpcError: any) {
        console.warn('RPC call failed for view refresh, falling back to client calc:', rpcError.message);
      }

      // Fallback to client-side calculation if RPC fails
      const clientCalculatedStockFallback = await calculateBalanceStock();
      queryClient.setQueryData([QUERY_KEYS.BALANCE_STOCK], clientCalculatedStockFallback);
      console.log(`Balance stock recalculated via fallback client-side: ${clientCalculatedStockFallback.length} products updated`);
      window.dispatchEvent(new Event('inventory-data-updated'));
      return true;
      */

    } catch (error: any) {
      console.error('Failed to recalculate balance stock:', error.message);
      return false;
    }
  };

  // Add delete mutations for inventory records
  const deletePurchaseMutation = useMutation<
    { success: boolean }, // Success type
    Error, // Error type
    string // Variables type (purchaseId)
  >({
    mutationFn: async (purchaseId: string): Promise<{ success: boolean }> => {
      try {
        const { error } = await supabase
          .from(TABLES.PURCHASES)
          .delete()
          .eq('id', purchaseId); // Use primary key 'id'

        if (error) throw handleSupabaseError(error);

        return { success: true };
      } catch (error: any) {
        console.error('Error deleting purchase record:', error.message);
        throw new Error(error.message || 'Failed to delete purchase'); // Rethrow standard error
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASES] });
      // Don't invalidate balance stock here, let recalculate handle it
      // queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALANCE_STOCK] });

      // Dispatch an event for real-time updates
      window.dispatchEvent(new CustomEvent('inventory-updated', {
        detail: { type: 'purchase-deleted' }
      }));
      // Trigger recalculation after successful deletion
      recalculateBalanceStock();
    }
  });

  const deleteSaleMutation = useMutation<
    { success: boolean }, // Success type
    Error, // Error type
    string // Variables type (saleId)
  >({
    mutationFn: async (saleId: string): Promise<{ success: boolean }> => {
      try {
        const { error } = await supabase
          .from(TABLES.SALES)
          .delete()
          .eq('id', saleId); // Use primary key 'id'

        if (error) throw handleSupabaseError(error);

        return { success: true };
      } catch (error: any) {
        console.error('Error deleting sale record:', error.message);
        throw new Error(error.message || 'Failed to delete sale');
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER_SALES] });
      // queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALANCE_STOCK] });

      // Dispatch an event for real-time updates
      window.dispatchEvent(new CustomEvent('inventory-updated', {
        detail: { type: 'sale-deleted' }
      }));
      // Trigger recalculation
      recalculateBalanceStock();
    }
  });

  const deleteConsumptionMutation = useMutation<
    { success: boolean; source?: string }, // Success type
    Error, // Error type
    string // Variables type (consumptionId)
  >({
    mutationFn: async (consumptionId: string): Promise<{ success: boolean; source?: string }> => {
      try {
        const consumptionTable = TABLES.SALON_CONSUMPTION;
        const { error } = await supabase
          .from(consumptionTable)
          .delete()
          .eq('id', consumptionId); // Use primary key 'id'

        if (error) {
            // If error is "relation does not exist", ignore it, otherwise throw
            if (!error.message.includes('does not exist')) {
                 throw handleSupabaseError(error);
            }
            console.warn(`Table ${consumptionTable} not found for deletion, ignoring.`);
        }

        return { success: true, source: 'consumption' }; // Assume success even if table missing

      } catch (error: any) {
        console.error('Error deleting consumption record:', error.message);
        throw new Error(error.message || 'Failed to delete consumption');
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONSUMPTION] });
      // queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALANCE_STOCK] });

      // Dispatch an event for real-time updates
      window.dispatchEvent(new CustomEvent('inventory-updated', {
        detail: { type: 'consumption-deleted' }
      }));
      // Trigger recalculation
      recalculateBalanceStock();
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

  // Function to delete a product from inventory and its related records
  const deleteProduct = async (productName: string): Promise<{ success: boolean; error?: any }> => {
    if (!productName) {
      toast.error('Product name is required');
      return { success: false, error: 'Product name required' };
    }

    console.log(`Attempting to delete product: ${productName}`);

    try {
      // Define table names with fallbacks
      const purchasesTable = TABLES.PURCHASES || 'inventory_purchases';
      const salesTable = TABLES.SALES || 'inventory_sales_new';
      const consumptionTable = TABLES.SALON_CONSUMPTION || 'inventory_consumption';
      const salonConsumptionTable = TABLES.SALON_CONSUMPTION || 'salon_consumption_orders';

      // Delete from purchases
      const { error: purchasesError } = await supabase
        .from(purchasesTable)
        .delete()
        .eq('product_name', productName);
      if (purchasesError) {
        console.error(`Error deleting purchases for ${productName}:`, purchasesError.message);
        // Decide if this is fatal or ignorable
        if (!purchasesError.message.includes('does not exist')) throw purchasesError;
      }

      // Delete from sales
      const { error: salesError } = await supabase
        .from(salesTable)
        .delete()
        .eq('product_name', productName);
       if (salesError) {
        console.error(`Error deleting sales for ${productName}:`, salesError.message);
        if (!salesError.message.includes('does not exist')) throw salesError;
      }

      // Delete from consumption
      const { error: consumptionError } = await supabase
        .from(consumptionTable)
        .delete()
        .eq('product_name', productName);
       if (consumptionError) {
        console.error(`Error deleting consumption for ${productName}:`, consumptionError.message);
        if (!consumptionError.message.includes('does not exist')) throw consumptionError;
      }

      // Delete from salon consumption if the table exists
      try {
          const { error: salonError } = await supabase
            .from(salonConsumptionTable)
            .delete()
            .eq('product_name', productName);
          // Only throw if it's not a "table does not exist" error
          if (salonError && !salonError.message.includes('does not exist')) {
            console.error('Error deleting from salon consumption:', salonError.message);
            throw salonError; // Throw significant errors
          }
      } catch (salonError: any) {
          // Catch potential errors if the rpc/table check itself fails
          if (!salonError.message.includes('does not exist')) {
             console.error('Error during salon consumption delete operation:', salonError.message);
             // Decide if this should be thrown or just logged
          }
      }

      // Set a small delay before triggering the event to prevent race conditions
      setTimeout(() => {
        console.log(`Successfully deleted product "${productName}" and related records`);
        // Trigger balance stock recalculation AFTER deletions
        recalculateBalanceStock().then(() => {
           // Dispatch an event for real-time updates AFTER recalc
           window.dispatchEvent(new CustomEvent('inventory-updated', {
             detail: { type: 'product-deleted', productName }
           }));
        });
      }, 100);

      return { success: true };
    } catch (error: any) {
      console.error(`Error deleting product "${productName}":`, error.message);
      toast.error(`Failed to delete product ${productName}: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  // Function to delete consumer sales by consumer name
  const deleteConsumerSales = async (consumerName: string): Promise<{ success: boolean; error?: any }> => {
    try {
      if (!consumerName) {
        console.error('Consumer name is required for deletion');
        toast.error('Consumer name is required for deletion');
        return { success: false, error: 'Consumer name is required' };
      }

      console.log(`Deleting sales for consumer "${consumerName}"...`);
      const salesConsumerTable = TABLES.SALES_CONSUMER || 'inventory_sales_consumer';

      // Delete from inventory_sales_consumer table
      const { error: consumerSalesError } = await supabase
        .from(salesConsumerTable)
        .delete()
        .eq('consumer_name', consumerName);

      if (consumerSalesError) {
        console.error('Error deleting consumer sales records:', consumerSalesError.message);
        // Decide if this is fatal or should be ignored (e.g., table doesn't exist)
        if (!consumerSalesError.message.includes('does not exist')) {
            toast.error(`Failed to delete consumer sales: ${consumerSalesError.message}`);
            // Potentially rethrow or return error depending on desired behavior
            // return { success: false, error: consumerSalesError.message };
        }
      }

      // Recalculate balance stock and invalidate related queries
      await recalculateBalanceStock();
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER_SALES] });
      // queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALANCE_STOCK] }); // Handled by recalculate

      // Dispatch an event for real-time updates
      window.dispatchEvent(new CustomEvent('inventory-updated', {
        detail: { type: 'consumer-sales-deleted', consumerName }
      }));

      console.log(`Successfully deleted sales for consumer "${consumerName}"`);
      toast.success(`Deleted sales records for ${consumerName}`);
      return { success: true };
    } catch (error: any) {
      console.error(`Error deleting consumer sales for "${consumerName}":`, error.message);
      toast.error(`Error deleting consumer sales: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  // Function to delete consumer sales by invoice number
  const deleteConsumerSalesByInvoice = async (invoiceNumber: string): Promise<{ success: boolean; error?: any }> => {
    try {
      if (!invoiceNumber) {
        console.error('Invoice number is required for deletion');
        toast.error('Invoice number is required for deletion');
        return { success: false, error: 'Invoice number is required' };
      }

      console.log(`Deleting sales with invoice number "${invoiceNumber}"...`);
      const salesConsumerTable = TABLES.SALES_CONSUMER || 'inventory_sales_consumer';
      const salesTable = TABLES.SALES || 'inventory_sales_new';

      // Delete from consumer sales table
      const { error: consumerSalesError } = await supabase
        .from(salesConsumerTable)
        .delete()
        .eq('invoice_no', invoiceNumber);

       if (consumerSalesError) {
        console.error('Error deleting consumer sales by invoice:', consumerSalesError.message);
         if (!consumerSalesError.message.includes('does not exist')) {
             // Don't block main sales deletion if consumer table fails, but log it
             toast.warn(`Could not delete from consumer sales table: ${consumerSalesError.message}`);
         }
      }

      // Delete from main sales table as well
      const { error: salesError } = await supabase
        .from(salesTable)
        .delete()
        .eq('invoice_no', invoiceNumber);

      if (salesError) {
        console.error('Error deleting main sales records by invoice:', salesError.message);
         if (!salesError.message.includes('does not exist')) {
            toast.error(`Failed to delete main sales records: ${salesError.message}`);
            throw salesError; // This might be considered more critical
         }
      }

      // Recalculate balance stock and invalidate related queries
      await recalculateBalanceStock();
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SALES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMER_SALES] });
      // queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALANCE_STOCK] }); // Handled by recalculate

      // Dispatch an event for real-time updates
      window.dispatchEvent(new CustomEvent('inventory-updated', {
        detail: { type: 'invoice-deleted', invoiceNumber }
      }));

      console.log(`Successfully deleted sales with invoice "${invoiceNumber}"`);
      toast.success(`Deleted sales records for invoice ${invoiceNumber}`);
      return { success: true };
    } catch (error: any) {
      console.error(`Error deleting sales with invoice "${invoiceNumber}":`, error.message);
      toast.error(`Error deleting sales by invoice: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  // Find the original lookupOrderById function and update it
  const lookupOrderById = async (orderId: string): Promise<{ success: boolean; source?: string }> => {
    try {
      // First check SALON_CONSUMPTION table
      const targetSalonTable = TABLES.SALON_CONSUMPTION;
      
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
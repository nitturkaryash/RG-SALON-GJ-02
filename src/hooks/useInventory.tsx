import { useState, useEffect } from 'react';
import { supabase, TABLES } from '../utils/supabase/supabaseClient';
import { Purchase, Sale, Consumption, ProcessingStats } from '../models/inventoryTypes';
import { useQuery } from '@tanstack/react-query';

// Define the SalonConsumptionItem type for external use
export interface SalonConsumptionItem {
  id: string;
  "Requisition Voucher No.": string;
  order_id?: string;
  Date: string;
  "Product Name": string;
  "Consumption Qty.": number;
  "Purchase Cost per Unit (Ex. GST) (Rs.)": number;
  "Purchase GST Percentage": number;
  "Purchase Taxable Value (Rs.)": number;
  "Purchase IGST (Rs.)": number;
  "Purchase CGST (Rs.)": number;
  "Purchase SGST (Rs.)": number;
  "Total Purchase Cost (Rs.)": number;
  created_at?: string;
  updated_at?: string;
}

// Basic inventory hook to manage inventory-related state and operations
export const useInventory = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [consumption, setConsumption] = useState<Consumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncingConsumption, setIsSyncingConsumption] = useState(false);
  const [processingStats, setProcessingStats] = useState<ProcessingStats | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching inventory data...');

      // Fetch purchases with debug logging
      console.log('Fetching purchases...');
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('inventory_purchases')
        .select('*');

      console.log('Purchases fetch response:', { data: purchasesData, error: purchasesError });

      if (purchasesError) {
        console.error('Error fetching purchases:', purchasesError);
        throw new Error(`Error fetching purchases: ${purchasesError.message}`);
      }
      
      // Fetch sales with debug logging
      console.log('Fetching sales...');
      const { data: salesData, error: salesError } = await supabase
        .from('inventory_sales_new')
        .select('*');

      console.log('Sales fetch response:', { data: salesData, error: salesError });

      if (salesError) {
        console.error('Error fetching sales:', salesError);
        throw new Error(`Error fetching sales: ${salesError.message}`);
      }
      
      // Fetch consumption with debug logging
      console.log('Fetching consumption...');
      const { data: consumptionData, error: consumptionError } = await supabase
        .from('inventory_consumption')
        .select('*');

      console.log('Consumption fetch response:', { data: consumptionData, error: consumptionError });

      if (consumptionError) {
        console.error('Error fetching consumption:', consumptionError);
        throw new Error(`Error fetching consumption: ${consumptionError.message}`);
      }

      // Update state with the fetched data
      console.log('Setting state with fetched data:', {
        purchases: purchasesData?.length || 0,
        sales: salesData?.length || 0,
        consumption: consumptionData?.length || 0,
      });

      setPurchases(purchasesData || []);
      setSales(salesData || []);
      setConsumption(consumptionData || []);
      
      // Notify that data has been refreshed
      console.log('Inventory data refreshed successfully');
      
      return {
        purchases: purchasesData || [],
        sales: salesData || [],
        consumption: consumptionData || []
      };
    } catch (err) {
      console.error('Error in fetchInventoryData:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new purchase record
  const createPurchase = async (purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Prepare the purchase data with proper ID and timestamps
      const purchaseWithId = {
        ...purchase,
        purchase_id: `purchase-${Date.now()}`, // Generate a temporary id in the correct format
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Creating purchase with data:', purchaseWithId);
      
      const { data, error } = await supabase
        .from('inventory_purchases')
        .insert([purchaseWithId])
        .select();

      if (error) {
        console.error('Supabase error creating purchase:', error);
        throw error;
      }
      
      console.log('Purchase created, database response:', data);
      
      // If we got data back from the insert, use it
      const newPurchase = data && data.length > 0 ? data[0] : purchaseWithId;
      
      // Update the local state immediately
      setPurchases(prev => [newPurchase, ...prev]);
      
      // Trigger a global refresh event
      window.dispatchEvent(new CustomEvent('refresh-inventory-data'));
      
      return newPurchase;
    } catch (error) {
      console.error('Error creating purchase:', error);
      throw error;
    }
  };

  // Create a new sale record
  const createSale = async (sale: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_sales_new')
        .insert([{
          ...sale,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      
      if (data) {
        setSales(prev => [...prev, data[0]]);
        return data[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  };

  // Create a new consumption record
  const createConsumption = async (item: Omit<Consumption, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_consumption')
        .insert([{
          ...item,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      
      if (data) {
        setConsumption(prev => [...prev, data[0]]);
        return data[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error creating consumption record:', error);
      throw error;
    }
  };

  // Process batch imports with proper error handling
  const processBatchPurchases = async (purchaseRecords: Array<Partial<Purchase>>): Promise<ProcessingStats> => {
    let stats: ProcessingStats = {
      total: purchaseRecords.length,
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: []
    };

    for (const record of purchaseRecords) {
      try {
        stats.processed++;
        
        // Validate required fields
        if (!record.product_name || !record.date || !record.purchase_qty) {
          throw new Error(`Missing required fields for purchase record: ${JSON.stringify(record)}`);
        }
        
        await createPurchase(record as Omit<Purchase, 'id' | 'created_at' | 'updated_at'>);
        stats.succeeded++;
      } catch (error) {
        console.error('Error processing purchase record:', error);
        stats.failed++;
        stats = {
          ...stats,
          errors: [...(Array.isArray(stats.errors) ? stats.errors : [stats.errors]), 
                   `Error with record ${stats.processed}: ${error instanceof Error ? error.message : String(error)}`]
        };
      }
    }
    
    return stats;
  };

  // Process batch sales
  const processBatchSales = async (salesRecords: Array<Partial<Sale>>): Promise<ProcessingStats> => {
    let stats: ProcessingStats = {
      total: salesRecords.length,
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: []
    };

    for (const record of salesRecords) {
      try {
        stats.processed++;
        
        // Validate required fields
        if (!record.product_name || !record.date || !record.quantity) {
          throw new Error(`Missing required fields for sale record: ${JSON.stringify(record)}`);
        }
        
        await createSale(record as Omit<Sale, 'id' | 'created_at' | 'updated_at'>);
        stats.succeeded++;
      } catch (error) {
        console.error('Error processing sale record:', error);
        stats.failed++;
        stats = {
          ...stats,
          errors: [...(Array.isArray(stats.errors) ? stats.errors : [stats.errors]), 
                   `Error with record ${stats.processed}: ${error instanceof Error ? error.message : String(error)}`]
        };
      }
    }
    
    return stats;
  };

  // Process batch consumption
  const processBatchConsumption = async (consumptionRecords: Array<Partial<Consumption>>): Promise<ProcessingStats> => {
    let stats: ProcessingStats = {
      total: consumptionRecords.length,
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: []
    };

    for (const record of consumptionRecords) {
      try {
        stats.processed++;
        
        // Validate required fields
        if (!record.product_name || !record.date || !record.quantity) {
          throw new Error(`Missing required fields for consumption record: ${JSON.stringify(record)}`);
        }
        
        await createConsumption(record as Omit<Consumption, 'id' | 'created_at' | 'updated_at'>);
        stats.succeeded++;
      } catch (error) {
        console.error('Error processing consumption record:', error);
        stats.failed++;
        stats = {
          ...stats,
          errors: [...(Array.isArray(stats.errors) ? stats.errors : [stats.errors]), 
                   `Error with record ${stats.processed}: ${error instanceof Error ? error.message : String(error)}`]
        };
      }
    }
    
    return stats;
  };

  // Function to get salon consumption data from orders table
  const fetchSalonConsumptionOrders = async () => {
    try {
      console.log('Fetching salon consumption orders from orders table...');
      
      // Query orders marked as salon consumption
      const { data: salonOrders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          client_name,
          consumption_purpose,
          consumption_notes,
          services (
            service_id,
            service_name,
            price,
            quantity,
            type,
            gst_percentage,
            hsn_code
          )
        `)
        .eq('is_salon_consumption', true)
        .order('created_at', { ascending: false });
        
      if (ordersError) {
        console.error('Error fetching salon consumption orders:', ordersError);
        throw ordersError;
      }
      
      console.log('Salon consumption orders fetched:', salonOrders?.length || 0);
      return salonOrders || [];
    } catch (error) {
      console.error('Error in fetchSalonConsumptionOrders:', error);
      throw error;
    }
  };
  
  // React Query hook for salon consumption orders
  const salonConsumptionOrdersQuery = useQuery(
    ['salonConsumptionOrders'],
    fetchSalonConsumptionOrders,
    {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (err) => {
        console.error('Error in salonConsumptionOrders query:', err);
      }
    }
  );
  
  // Sync consumption data from orders table to inventory_consumption table
  const syncConsumptionFromPos = async (startDate?: string, endDate?: string, type: string = 'salon') => {
    try {
      console.log('Starting sync salon consumption from POS...');
      console.log('Date range:', { startDate, endDate });
      
      setIsSyncingConsumption(true);
      setProcessingStats({
        total: 0,
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: []
      });
      
      // Validate date range to ensure we don't have future dates
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Default to 30 days ago if no start date
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
      
      // Ensure we have valid dates
      const validStartDate = startDate && startDate <= todayStr ? startDate : thirtyDaysAgoStr;
      const validEndDate = endDate && endDate <= todayStr ? endDate : todayStr;
      
      console.log(`Syncing salon consumption with validated date range: ${validStartDate} to ${validEndDate}`);

      // Try to load orders from local storage first (for offline mode)
      console.log('Loading salon consumption orders from local storage');
      let salonConsumptionOrders = [];
      try {
        const storedOrders = localStorage.getItem('pos_orders');
        if (storedOrders) {
          const allOrders = JSON.parse(storedOrders);
          console.log(`All orders from localStorage: ${allOrders.length}`);
          
          // Convert date strings to Date objects for comparison
          const startDateTime = new Date(`${validStartDate}T00:00:00.000Z`);
          const endDateTime = new Date(`${validEndDate}T18:29:59.999Z`);
          
          console.log(`Filtering orders between ${startDateTime.toISOString()} and ${endDateTime.toISOString()}`);
          
          // Filter orders by date range
          const ordersInDateRange = allOrders.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= startDateTime && orderDate <= endDateTime;
          });
          
          console.log(`Filtered ${ordersInDateRange.length} orders within date range out of ${allOrders.length} total orders`);
          
          // Then filter for salon consumption only
          salonConsumptionOrders = ordersInDateRange.filter(order => 
            order.type === 'salon-consumption' || 
            order.is_salon_consumption === true
          );
          
          console.log(`Found ${salonConsumptionOrders.length} salon consumption orders`);
        }
      } catch (e) {
        console.error('Error loading orders from localStorage:', e);
      }
      
      // If no orders in localStorage or we're online, fetch from Supabase
      if (salonConsumptionOrders.length === 0) {
        // Fetch salon consumption orders
        const { data: consumptionOrders, error: ordersError } = await supabase
          .from('pos_orders')
          .select(`
            id,
            created_at,
            client_name,
            consumption_purpose,
            consumption_notes,
            total,
            items:pos_order_items (
              id,
              service_id,
              service_name,
              service_type,
              price,
              quantity,
              gst_percentage,
              hsn_code
            )
          `)
          .eq('type', 'salon-consumption')  // Only get salon consumption entries
          .eq('is_salon_consumption', true) // Explicitly include salon consumption only
          .gte('created_at', validStartDate)
          .lte('created_at', validEndDate)
          .order('created_at', { ascending: false });
          
        if (ordersError) {
          console.error('Error fetching salon consumption orders:', ordersError);
          throw ordersError;
        }
        
        salonConsumptionOrders = consumptionOrders || [];
      }
      
      if (salonConsumptionOrders.length === 0) {
        console.log('No salon consumption orders found for the given date range');
        return { 
          success: true, 
          stats: { total: 0, processed: 0, inserted: 0 },
          succeeded: 0
        };
      }
      
      // Fetch all products for accurate mapping
      console.log('Fetching products for mapping...');
      
      // First, try inventory_products table
      const { data: inventoryProducts, error: productsError } = await supabase
        .from('inventory_products')
        .select('*');
        
      if (productsError) {
        console.error('Error fetching inventory products:', productsError);
      }
      
      console.log(`Found ${inventoryProducts?.length || 0} products in inventory_products table`);
      
      // Also try products table as a fallback
      const { data: productsData, error: productsDataError } = await supabase
        .from('products')
        .select('*');
        
      if (productsDataError) {
        console.error('Error fetching products data:', productsDataError);
      }
      
      console.log(`Found ${productsData?.length || 0} products in products table`);
      
      // Create a map of products by ID and name for quick lookup
      const productsById = {};
      const productsByName = {};
      
      // Map from inventory_products
      if (inventoryProducts && Array.isArray(inventoryProducts)) {
        inventoryProducts.forEach(product => {
          if (product.id) productsById[product.id] = product;
          if (product.name) productsByName[product.name.toLowerCase()] = product;
        });
      }
      
      // Map from products table as fallback
      if (productsData && Array.isArray(productsData)) {
        productsData.forEach(product => {
          if (product.id) productsById[product.id] = product;
          if (product.name) productsByName[product.name.toLowerCase()] = product;
        });
      }
      
      console.log(`Total unique products found: ${Object.keys(productsById).length + Object.keys(productsByName).length}`);
      
      // Build product lookup maps with more properties
      const productLookupById = {};
      const productLookupByName = {};
      
      // Combine both sources into lookup maps
      if (inventoryProducts && Array.isArray(inventoryProducts)) {
        inventoryProducts.forEach(product => {
          if (product.id) {
            productLookupById[product.id] = {
              id: product.id,
              name: product.name || product.product_name,
              cost_per_unit: product.cost_per_unit || product.purchase_cost_per_unit_ex_gst || 0,
              gst_percentage: product.gst_percentage || 18,
              hsn_code: product.hsn_code || '',
              units: product.units || 'pcs'
            };
          }
          
          if (product.name) {
            productLookupByName[product.name.toLowerCase()] = {
              id: product.id,
              name: product.name || product.product_name,
              cost_per_unit: product.cost_per_unit || product.purchase_cost_per_unit_ex_gst || 0,
              gst_percentage: product.gst_percentage || 18,
              hsn_code: product.hsn_code || '',
              units: product.units || 'pcs'
            };
          }
        });
      }
      
      // Add any additional products from products table
      if (productsData && Array.isArray(productsData)) {
        productsData.forEach(product => {
          if (product.id && !productLookupById[product.id]) {
            productLookupById[product.id] = {
              id: product.id,
              name: product.name || '',
              cost_per_unit: product.price || 0,
              gst_percentage: product.gst_percentage || 18,
              hsn_code: product.hsn_code || '',
              units: product.units || 'pcs'
            };
          }
          
          if (product.name && !productLookupByName[product.name.toLowerCase()]) {
            productLookupByName[product.name.toLowerCase()] = {
              id: product.id,
              name: product.name || '',
              cost_per_unit: product.price || 0,
              gst_percentage: product.gst_percentage || 18,
              hsn_code: product.hsn_code || '',
              units: product.units || 'pcs'
            };
          }
        });
      }
      
      console.log(`Created lookup maps for ${Object.keys(productLookupById).length} products`);
      
      // Prepare consumption records
      const consumptionRecords: Array<Partial<Consumption>> = [];
      
      // Process each order
      for (const order of salonConsumptionOrders) {
        // Check if order has products or services
        const orderItems = order.items || order.services || [];
        const hasServices = orderItems.some(item => item.type === 'service' || item.service_type === 'service');
        const servicesCount = orderItems.filter(item => item.type === 'service' || item.service_type === 'service').length;
        const hasItems = orderItems.some(item => item.type === 'item' || item.service_type === 'item');
        const itemsCount = orderItems.filter(item => item.type === 'item' || item.service_type === 'item').length;
        const hasProducts = orderItems.some(item => 
          item.type === 'product' || 
          item.service_type === 'product' || 
          item.forSalonUse === true || 
          item.consumptionPurpose !== undefined
        );
        const productsCount = orderItems.filter(item => 
          item.type === 'product' || 
          item.service_type === 'product' || 
          item.forSalonUse === true || 
          item.consumptionPurpose !== undefined
        ).length;
        
        console.log(`Processing order ${order.id}`, { 
          hasServices, 
          servicesCount, 
          hasItems, 
          itemsCount, 
          hasProducts, 
          productsCount 
        });
        
        // Skip orders without items
        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
          console.log(`Order ${order.id} has no items, skipping`);
          continue;
        }
        
        console.log(`Order ${order.id} has ${orderItems.length} items/services`);
        
        if (orderItems.length > 0) {
          console.log(`First item sample:`, orderItems[0]);
        }
        
        // Filter for products only
        const productItems = orderItems.filter(item => {
          // Check if item is specifically marked as product
          const isProductType = 
            item.type === 'product' || 
            item.service_type === 'product';
          
          // Check if marked for salon use
          const isForSalonUse = 
            item.forSalonUse === true || 
            item.consumptionPurpose !== undefined;
            
          return isProductType || isForSalonUse;
        });
        
        console.log(`Order ${order.id} has ${productItems.length} product items`);
        
        // Skip orders with no product items
        if (productItems.length === 0) {
          console.log(`Order ${order.id} has items but none are products`);
          continue;
        }
        
        // Add each product as a consumption record
        for (const item of productItems) {
          const serviceId = item.service_id;
          const serviceName = item.service_name || '';
          const serviceType = item.type || item.service_type;
          
          console.log(`Processing item: ${serviceName} (ID: ${serviceId}, SKU: ${item.sku || ''})`);
          
          // Skip if item is not a product
          if (serviceType !== 'product' && !item.forSalonUse) {
            console.log(`Skipping non-product item: ${serviceName}`);
            continue;
          }
          
          // Look up product information
          let productInfo = null;
          
          // First try by ID
          if (serviceId && productLookupById[serviceId]) {
            productInfo = productLookupById[serviceId];
            console.log(`Found product by ID: ${serviceName}`);
          } 
          // Then try by name (case insensitive)
          else if (serviceName && productLookupByName[serviceName.toLowerCase()]) {
            productInfo = productLookupByName[serviceName.toLowerCase()];
            console.log(`Found product by name: ${serviceName}`);
          }
          // Finally, search for partial name match
          else if (serviceName) {
            const nameKey = Object.keys(productLookupByName).find(key => 
              key.includes(serviceName.toLowerCase()) || 
              serviceName.toLowerCase().includes(key)
            );
            
            if (nameKey) {
              productInfo = productLookupByName[nameKey];
              console.log(`Found product by partial name match: ${serviceName} -> ${nameKey}`);
            } else {
              console.log(`No matching product found for: ${serviceName}, using item data directly`);
            }
          }
          
          // Calculate values with GST information
          const gstPercentage = productInfo?.gst_percentage || item.gst_percentage || 18;
          const quantity = parseFloat(item.quantity || 1);
          const priceWithGst = parseFloat(item.price || 0);
          
          // Calculate price excluding GST
          const priceExGst = priceWithGst / (1 + (gstPercentage / 100));
          
          // Calculate taxable value (price ex GST * quantity)
          const taxableValue = priceExGst * quantity;
          
          // Calculate GST amounts
          const totalGst = taxableValue * (gstPercentage / 100);
          const cgst = totalGst / 2;
          const sgst = totalGst / 2;
          
          // Total value with GST
          const totalValue = priceWithGst * quantity;
          
          console.log(`Product details: ${serviceName}, Price: ${priceWithGst}, GST: ${gstPercentage}%`);
          
          // Create consumption record with all necessary fields
          const consumptionRecord: Partial<Consumption> = {
            // Product identification
            order_id: order.id,
            product_id: productInfo?.id || serviceId,
            product_name: productInfo?.name || serviceName,
            
            // Date and quantity
            date: new Date(order.created_at).toISOString().split('T')[0],
            quantity: quantity,
            
            // Purpose and categorization
            purpose: order.consumption_purpose || item.consumptionPurpose || 'Salon Use',
            notes: order.consumption_notes || '',
            is_salon_consumption: true, // Mark explicitly as salon consumption
            
            // Product details
            hsn_code: productInfo?.hsn_code || item.hsn_code || '',
            units: productInfo?.units || item.units || 'pcs',
            
            // Cost and tax details
            cost_per_unit: productInfo?.cost_per_unit || priceExGst,
            gst_percentage: gstPercentage,
            taxable_value: taxableValue,
            cgst: cgst,
            sgst: sgst,
            igst: 0, // Usually 0 for most salon cases
            total: totalValue,
            
            // Reference numbers
            requisition_voucher_no: `SCN-${order.id.substring(0, 6)}`,
            
            // Audit fields
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Add to consumption records array
          consumptionRecords.push(consumptionRecord);
          console.log(`Added consumption record for ${serviceName}, Total: ${formatCurrency(totalValue)}`);
        }
      }
      
      // If no records were prepared, return early
      if (consumptionRecords.length === 0) {
        console.log('No consumption records prepared for syncing');
        return { 
          success: true, 
          stats: { total: 0, processed: 0, inserted: 0 },
          succeeded: 0 
        };
      }
      
      // Process the consumption records
      const stats = await processBatchConsumption(consumptionRecords);
      setProcessingStats(stats);
      
      // Automatically calculate balance stock after sync
      try {
        await recalculateBalanceStock();
      } catch (e) {
        console.error('Error recalculating balance stock after sync:', e);
      }
      
      // Refresh consumption data
      await consumptionQuery.refetch();
      
      console.log(`Synced ${stats.succeeded} salon consumption records to inventory`);
      return stats;
    } catch (error) {
      console.error('Error syncing consumption from POS:', error);
      throw error;
    } finally {
      setIsSyncingConsumption(false);
    }
  };

  // Helper function to format currency (used in logs)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Load data on mount
  useEffect(() => {
    fetchInventoryData();
    
    // Add event listener for global data refresh
    const handleRefreshInventory = () => {
      fetchInventoryData();
    };
    
    window.addEventListener('refresh-inventory-data', handleRefreshInventory);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('refresh-inventory-data', handleRefreshInventory);
    };
  }, []);

  // Effect to refresh data when window regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Document became visible, refreshing inventory data');
        fetchInventoryData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Ensure queries for balance stock calculation are properly defined
  const purchasesQuery = useQuery(
    ['inventory_purchases'],
    async () => {
      const { data, error } = await supabase
        .from(TABLES.PURCHASES)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  const salesQuery = useQuery(
    ['inventory_sales'],
    async () => {
      const { data, error } = await supabase
        .from(TABLES.SALES)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  const consumptionQuery = useQuery(
    ['inventory_consumption'],
    async () => {
      const { data, error } = await supabase
        .from(TABLES.CONSUMPTION)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
  
  // Sales directly to customers
  const customerSalesQuery = useQuery(['customerSales'], async () => {
    const { data, error } = await supabase
      .from(TABLES.SALES)
      .select('*')
      .eq('is_salon_use', false)
      .order('date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  });
  
  // Balance stock query
  const balanceStockQuery = useQuery(['balanceStock'], async () => {
    const { data, error } = await supabase
      .from(TABLES.BALANCE_STOCK)
      .select('*')
      .order('product_name', { ascending: true });
      
    if (error) throw error;
    return data || [];
  });
  
  // Salon consumption orders query
  const salonConsumptionOrdersQuery = useQuery(['salon-consumption'], async () => {
    try {
      const { data, error } = await supabase
        .from('pos_orders')
        .select('*')
        .eq('type', 'salon-consumption')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching salon consumption orders:', error);
      throw error;
    }
  });
  
  // Customer orders query
  const customerOrdersQuery = useQuery(['customer-orders'], async () => {
    const { data, error } = await supabase
      .from('pos_orders')
      .select('*')
      .eq('type', 'sale')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  });
  
  // Combined sales query
  const combinedSalesQuery = useQuery(['combined-sales'], async () => {
    const { data, error } = await supabase
      .from(TABLES.SALES)
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  });
  
  // State for sales sync
  const [isSyncingSales, setIsSyncingSales] = useState(false);

  const exportInventoryData = async () => {
    setIsExporting(true);
    try {
      const data = await fetchInventoryData();
      return data;
    } finally {
      setIsExporting(false);
    }
  };
  
  // Function to recalculate balance stock
  const recalculateBalanceStock = async () => {
    try {
      console.log('Starting balance stock recalculation...');
      
      // Fetch the latest data from all tables
      const purchases = await purchasesQuery.refetch();
      const sales = await salesQuery.refetch();
      const consumption = await consumptionQuery.refetch();
      
      console.log(`Data fetched for recalculation: ${purchases.data?.length || 0} purchases, ${sales.data?.length || 0} sales, ${consumption.data?.length || 0} consumption records`);
      
      // Create a map to aggregate by product
      const productMap = new Map();
      
      // Process purchases - these ADD to inventory
      (purchases.data || []).forEach(purchase => {
        const productName = purchase.product_name || 'Unknown Product';
        const purchaseQty = parseFloat(purchase.purchase_qty || purchase.quantity || 0);
        
        if (!productMap.has(productName)) {
          productMap.set(productName, {
            id: purchase.id || `balance-${Date.now()}-${Math.random()}`,
            product_name: productName,
            hsn_code: purchase.hsn_code || '',
            units: purchase.units || 'pcs',
            purchased_qty: 0,
            sold_qty: 0,
            consumed_qty: 0,
            balance_qty: 0,
            last_purchase_cost: purchase.purchase_cost_per_unit_ex_gst || purchase.cost_per_unit || 0,
            avg_purchase_cost: 0,
            total_purchase_value: 0,
            total_sales_value: 0,
            total_consumption_value: 0
          });
        }
        
        const record = productMap.get(productName);
        record.purchased_qty += purchaseQty;
        
        // Update average purchase cost calculation
        const currentTotalValue = record.avg_purchase_cost * (record.purchased_qty - purchaseQty);
        const newValue = (purchase.purchase_cost_per_unit_ex_gst || purchase.cost_per_unit || 0) * purchaseQty;
        
        if (record.purchased_qty > 0) {
          record.avg_purchase_cost = (currentTotalValue + newValue) / record.purchased_qty;
        }
        
        record.total_purchase_value += (purchase.purchase_taxable_value || purchase.taxable_value || 0);
      });
      
      // Process sales - these SUBTRACT from inventory (customer sales)
      (sales.data || []).forEach(sale => {
        const productName = sale.product_name || 'Unknown Product';
        const saleQty = parseFloat(sale.sales_qty || sale.quantity || 0);
        
        if (!productMap.has(productName)) {
          console.warn(`Found sale for product "${productName}" without matching purchase record`);
          return; // Skip this record to prevent negative inventory
        }
        
        const record = productMap.get(productName);
        record.sold_qty += saleQty;
        record.total_sales_value += (sale.mrp_incl_gst || sale.invoice_value || 0);
      });
      
      // Process consumption - these also SUBTRACT from inventory (salon internal usage)
      (consumption.data || []).forEach(cons => {
        const productName = cons.product_name || 'Unknown Product';
        const consumptionQty = parseFloat(cons.consumption_qty || cons.quantity || 0);
        
        if (!productMap.has(productName)) {
          console.warn(`Found consumption for product "${productName}" without matching purchase record`);
          return; // Skip this record to prevent negative inventory
        }
        
        const record = productMap.get(productName);
        record.consumed_qty += consumptionQty;
        record.total_consumption_value += (cons.total || cons.invoice_value || 0);
      });
      
      // Calculate final balance quantities and values
      const balanceStock = Array.from(productMap.values()).map(item => {
        // Calculate the balance quantity: Purchased - Sold - Consumed
        const balanceQty = item.purchased_qty - item.sold_qty - item.consumed_qty;
        
        return {
          ...item,
          balance_qty: parseFloat(balanceQty.toFixed(2)),
          avg_purchase_cost: parseFloat(item.avg_purchase_cost.toFixed(2)),
          total_purchase_value: parseFloat(item.total_purchase_value.toFixed(2)),
          total_sales_value: parseFloat(item.total_sales_value.toFixed(2)),
          total_consumption_value: parseFloat(item.total_consumption_value.toFixed(2)),
          current_stock_value: parseFloat((balanceQty * item.avg_purchase_cost).toFixed(2)),
          last_updated: new Date().toISOString()
        };
      });
      
      console.log(`Calculated balance stock for ${balanceStock.length} products`);
      
      // Update the balance stock in the database
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < balanceStock.length; i += batchSize) {
        batches.push(balanceStock.slice(i, i + batchSize));
      }
      
      console.log(`Updating balance stock in ${batches.length} batches`);
      
      for (const batch of batches) {
        const { error } = await supabase
          .from(TABLES.BALANCE_STOCK)
          .upsert(batch, { 
            onConflict: 'product_name',
            ignoreDuplicates: false
          });
          
        if (error) {
          console.error('Error updating balance stock batch:', error);
          throw error;
        }
      }
      
      // Refetch balance stock data
      await balanceStockQuery.refetch();
      
      console.log('Balance stock recalculation completed successfully');
      return balanceStock;
    } catch (error) {
      console.error('Error recalculating balance stock:', error);
      throw error;
    }
  };

  // Sync sales data from POS orders to inventory_sales
  const syncSalesFromPos = async (startDate?: string, endDate?: string, type: string = 'customer') => {
    try {
      console.log('Starting sync customer sales from POS...');
      console.log('Date range:', { startDate, endDate });
      
      setIsSyncingSales(true);
      setProcessingStats({
        total: 0,
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: []
      });
      
      // Validate date range to ensure we don't have future dates
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Default to 30 days ago if no start date
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
      
      // Ensure we have valid dates
      const validStartDate = startDate && startDate <= todayStr ? startDate : thirtyDaysAgoStr;
      const validEndDate = endDate && endDate <= todayStr ? endDate : todayStr;
      
      console.log(`Syncing customer sales with validated date range: ${validStartDate} to ${validEndDate}`);

      // Try to load orders from local storage first (for offline mode)
      console.log('Loading customer orders from local storage');
      let customerOrders = [];
      try {
        const storedOrders = localStorage.getItem('pos_orders');
        if (storedOrders) {
          const allOrders = JSON.parse(storedOrders);
          console.log(`All orders from localStorage: ${allOrders.length}`);
          
          // Convert date strings to Date objects for comparison
          const startDateTime = new Date(`${validStartDate}T00:00:00.000Z`);
          const endDateTime = new Date(`${validEndDate}T18:29:59.999Z`);
          
          console.log(`Filtering orders between ${startDateTime.toISOString()} and ${endDateTime.toISOString()}`);
          
          // Filter orders by date range
          const ordersInDateRange = allOrders.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= startDateTime && orderDate <= endDateTime;
          });
          
          console.log(`Filtered ${ordersInDateRange.length} orders within date range out of ${allOrders.length} total orders`);
          
          // Then filter for customer sales only
          customerOrders = ordersInDateRange.filter(order => 
            order.type === 'sale' && 
            !order.is_salon_consumption && 
            !order.is_salon_use
          );
          
          console.log(`Found ${customerOrders.length} customer sales orders`);
        }
      } catch (e) {
        console.error('Error loading orders from localStorage:', e);
      }
      
      // If no orders in localStorage or we're online, fetch from Supabase
      if (customerOrders.length === 0) {
        // Fetch customer orders
        const { data: salesOrders, error: ordersError } = await supabase
          .from('pos_orders')
          .select(`
            id,
            created_at,
            client_name,
            total,
            payment_method,
            status,
            items:pos_order_items (
              id,
              service_id,
              service_name,
              service_type,
              price,
              quantity,
              gst_percentage,
              hsn_code
            )
          `)
          .eq('type', 'sale') // Only get sales
          .neq('is_salon_consumption', true) // Explicitly exclude salon consumption
          .neq('is_salon_use', true) // Explicitly exclude salon use
          .gte('created_at', validStartDate)
          .lte('created_at', validEndDate)
          .order('created_at', { ascending: false });
          
        if (ordersError) {
          console.error('Error fetching customer orders:', ordersError);
          throw ordersError;
        }
        
        customerOrders = salesOrders || [];
      }
      
      if (customerOrders.length === 0) {
        console.log('No customer sales orders found for the given date range');
        return { 
          success: true, 
          stats: { total: 0, processed: 0, inserted: 0 },
          succeeded: 0
        };
      }
      
      // Fetch all products for accurate mapping
      console.log('Fetching products for mapping...');
      
      // First, try inventory_products table
      const { data: inventoryProducts, error: productsError } = await supabase
        .from('inventory_products')
        .select('*');
        
      if (productsError) {
        console.error('Error fetching inventory products:', productsError);
      }
      
      console.log(`Found ${inventoryProducts?.length || 0} products in inventory_products table`);
      
      // Also try products table as a fallback
      const { data: productsData, error: productsDataError } = await supabase
        .from('products')
        .select('*');
        
      if (productsDataError) {
        console.error('Error fetching products data:', productsDataError);
      }
      
      console.log(`Found ${productsData?.length || 0} products in products table`);
      
      // Build product lookup maps with more properties
      const productLookupById = {};
      const productLookupByName = {};
      
      // Combine both sources into lookup maps
      if (inventoryProducts && Array.isArray(inventoryProducts)) {
        inventoryProducts.forEach(product => {
          if (product.id) {
            productLookupById[product.id] = {
              id: product.id,
              name: product.name || product.product_name,
              cost_per_unit: product.cost_per_unit || product.purchase_cost_per_unit_ex_gst || 0,
              gst_percentage: product.gst_percentage || 18,
              hsn_code: product.hsn_code || '',
              units: product.units || 'pcs'
            };
          }
          
          if (product.name) {
            productLookupByName[product.name.toLowerCase()] = {
              id: product.id,
              name: product.name || product.product_name,
              cost_per_unit: product.cost_per_unit || product.purchase_cost_per_unit_ex_gst || 0,
              gst_percentage: product.gst_percentage || 18,
              hsn_code: product.hsn_code || '',
              units: product.units || 'pcs'
            };
          }
        });
      }
      
      // Add any additional products from products table
      if (productsData && Array.isArray(productsData)) {
        productsData.forEach(product => {
          if (product.id && !productLookupById[product.id]) {
            productLookupById[product.id] = {
              id: product.id,
              name: product.name || '',
              cost_per_unit: product.price || 0,
              gst_percentage: product.gst_percentage || 18,
              hsn_code: product.hsn_code || '',
              units: product.units || 'pcs'
            };
          }
          
          if (product.name && !productLookupByName[product.name.toLowerCase()]) {
            productLookupByName[product.name.toLowerCase()] = {
              id: product.id,
              name: product.name || '',
              cost_per_unit: product.price || 0,
              gst_percentage: product.gst_percentage || 18,
              hsn_code: product.hsn_code || '',
              units: product.units || 'pcs'
            };
          }
        });
      }
      
      console.log(`Created lookup maps for ${Object.keys(productLookupById).length} products`);
      
      // Prepare sales records
      const salesRecords: Array<Partial<Sale>> = [];
      
      // Process each order
      for (const order of customerOrders) {
        // Check if order has products or services
        const orderItems = order.items || order.services || [];
        const hasServices = orderItems.some(item => item.type === 'service' || item.service_type === 'service');
        const servicesCount = orderItems.filter(item => item.type === 'service' || item.service_type === 'service').length;
        const hasItems = orderItems.some(item => item.type === 'item' || item.service_type === 'item');
        const itemsCount = orderItems.filter(item => item.type === 'item' || item.service_type === 'item').length;
        const hasProducts = orderItems.some(item => 
          item.type === 'product' || 
          item.service_type === 'product'
        );
        const productsCount = orderItems.filter(item => 
          item.type === 'product' || 
          item.service_type === 'product'
        ).length;
        
        console.log(`Processing order ${order.id}`, { 
          hasServices, 
          servicesCount, 
          hasItems, 
          itemsCount, 
          hasProducts, 
          productsCount 
        });
        
        // Skip orders without items
        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
          console.log(`Order ${order.id} has no items, skipping`);
          continue;
        }
        
        console.log(`Order ${order.id} has ${orderItems.length} items/services`);
        
        if (orderItems.length > 0) {
          console.log(`First item sample:`, orderItems[0]);
        }
        
        // Filter for products only
        const productItems = orderItems.filter(item => 
          item.type === 'product' || 
          item.service_type === 'product'
        );
        
        console.log(`Order ${order.id} has ${productItems.length} product items`);
        
        // Skip orders with no product items
        if (productItems.length === 0) {
          console.log(`Order ${order.id} has items but none are products`);
          continue;
        }
        
        // Add each product as a sales record
        for (const item of productItems) {
          const serviceId = item.service_id;
          const serviceName = item.service_name || '';
          const serviceType = item.type || item.service_type;
          
          console.log(`Processing item: ${serviceName} (ID: ${serviceId}, SKU: ${item.sku || ''})`);
          
          // Skip if item is not a product
          if (serviceType !== 'product') {
            console.log(`Skipping non-product item: ${serviceName}`);
            continue;
          }
          
          // Look up product information
          let productInfo = null;
          
          // First try by ID
          if (serviceId && productLookupById[serviceId]) {
            productInfo = productLookupById[serviceId];
            console.log(`Found product by ID: ${serviceName}`);
          } 
          // Then try by name (case insensitive)
          else if (serviceName && productLookupByName[serviceName.toLowerCase()]) {
            productInfo = productLookupByName[serviceName.toLowerCase()];
            console.log(`Found product by name: ${serviceName}`);
          }
          // Finally, search for partial name match
          else if (serviceName) {
            const nameKey = Object.keys(productLookupByName).find(key => 
              key.includes(serviceName.toLowerCase()) || 
              serviceName.toLowerCase().includes(key)
            );
            
            if (nameKey) {
              productInfo = productLookupByName[nameKey];
              console.log(`Found product by partial name match: ${serviceName} -> ${nameKey}`);
            } else {
              console.log(`No matching product found for: ${serviceName}, using item data directly`);
            }
          }
          
          // Calculate values with GST information
          const gstPercentage = productInfo?.gst_percentage || item.gst_percentage || 18;
          const quantity = parseFloat(item.quantity || 1);
          const priceWithGst = parseFloat(item.price || 0);
          
          // Calculate price excluding GST
          const priceExGst = priceWithGst / (1 + (gstPercentage / 100));
          
          // Calculate taxable value (price ex GST * quantity)
          const taxableValue = priceExGst * quantity;
          
          // Calculate GST amounts
          const totalGst = taxableValue * (gstPercentage / 100);
          const cgst = totalGst / 2;
          const sgst = totalGst / 2;
          
          // Total value with GST
          const totalValue = priceWithGst * quantity;
          
          console.log(`Product details: ${serviceName}, Price: ${priceWithGst}, GST: ${gstPercentage}%`);
          
          // Create sales record with all necessary fields
          const salesRecord: Partial<Sale> = {
            // Product identification
            order_id: order.id,
            product_id: productInfo?.id || serviceId,
            product_name: productInfo?.name || serviceName,
            
            // Date and quantity
            date: new Date(order.created_at).toISOString().split('T')[0],
            quantity: quantity,
            sales_qty: quantity,
            
            // Customer details
            customer_name: order.client_name || '',
            invoice_no: `SALE-${order.id.substring(0, 6)}`,
            
            // Product details
            hsn_code: productInfo?.hsn_code || item.hsn_code || '',
            units: productInfo?.units || item.units || 'pcs',
            
            // Cost and tax details
            cost_per_unit: productInfo?.cost_per_unit || priceExGst,
            mrp_incl_gst: priceWithGst,
            gst_percentage: gstPercentage,
            taxable_value: taxableValue,
            cgst: cgst,
            sgst: sgst,
            igst: 0, // Usually 0 for most sales cases
            invoice_value: totalValue,
            
            // Payment and status
            payment_method: order.payment_method || 'cash',
            status: order.status || 'completed',
            
            // Categorization
            is_salon_use: false,
            is_salon_consumption: false,
            
            // Audit fields
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Add to sales records array
          salesRecords.push(salesRecord);
          console.log(`Added sales record for ${serviceName}, Total: ${formatCurrency(totalValue)}`);
        }
      }
      
      // If no records were prepared, return early
      if (salesRecords.length === 0) {
        console.log('No sales records prepared for syncing');
        return { 
          success: true, 
          stats: { total: 0, processed: 0, inserted: 0 },
          succeeded: 0 
        };
      }
      
      // Process the sales records
      const stats = await processBatchSales(salesRecords);
      setProcessingStats(stats);
      
      // Automatically calculate balance stock after sync
      try {
        await recalculateBalanceStock();
      } catch (e) {
        console.error('Error recalculating balance stock after sync:', e);
      }
      
      // Refresh sales data
      await salesQuery.refetch();
      
      console.log(`Synced ${stats.succeeded} customer sales records to inventory`);
      return stats;
    } catch (error) {
      console.error('Error syncing sales from POS:', error);
      throw error;
    } finally {
      setIsSyncingSales(false);
    }
  };

  // Salon consumption products query for inventory tab
  const salonConsumptionProductsQuery = useQuery(['salon-consumption-products'], async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.SALON_CONSUMPTION_PRODUCTS)
        .select('*')
        .order('Date', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching salon consumption products:', error);
      throw error;
    }
  });

  // Function to add a new salon consumption product record
  const addSalonConsumptionProduct = async (consumption: {
    "Requisition Voucher No.": string,
    "order_id"?: string,
    "Date": string,
    "Product Name": string,
    "Consumption Qty.": number,
    "Purchase Cost per Unit (Ex. GST) (Rs.)": number,
    "Purchase GST Percentage": number,
    "Purchase Taxable Value (Rs.)"?: number,
    "Purchase IGST (Rs.)"?: number,
    "Purchase CGST (Rs.)"?: number,
    "Purchase SGST (Rs.)"?: number,
    "Total Purchase Cost (Rs.)"?: number
  }) => {
    try {
      console.log('Adding salon consumption product record:', consumption);
      
      // Calculate taxable value if not provided
      if (!consumption["Purchase Taxable Value (Rs.)"]) {
        consumption["Purchase Taxable Value (Rs.)"] = 
          consumption["Consumption Qty."] * consumption["Purchase Cost per Unit (Ex. GST) (Rs.)"];
      }
      
      // Calculate tax amounts if not provided
      const taxableValue = consumption["Purchase Taxable Value (Rs.)"];
      const gstPercentage = consumption["Purchase GST Percentage"];
      
      if (!consumption["Purchase IGST (Rs.)"]) {
        consumption["Purchase IGST (Rs.)"] = 0;
      }
      
      if (!consumption["Purchase CGST (Rs.)"]) {
        consumption["Purchase CGST (Rs.)"] = (taxableValue * (gstPercentage / 2) / 100);
      }
      
      if (!consumption["Purchase SGST (Rs.)"]) {
        consumption["Purchase SGST (Rs.)"] = (taxableValue * (gstPercentage / 2) / 100);
      }
      
      // Calculate total if not provided
      if (!consumption["Total Purchase Cost (Rs.)"]) {
        consumption["Total Purchase Cost (Rs.)"] = 
          taxableValue + 
          (consumption["Purchase IGST (Rs.)"] || 0) + 
          (consumption["Purchase CGST (Rs.)"] || 0) + 
          (consumption["Purchase SGST (Rs.)"] || 0);
      }
      
      // Insert the record
      const { data, error } = await supabase
        .from(TABLES.SALON_CONSUMPTION_PRODUCTS)
        .insert(consumption)
        .select('*')
        .single();
        
      if (error) {
        console.error('Error adding salon consumption product:', error);
        throw error;
      }
      
      // Refresh the query data
      salonConsumptionProductsQuery.refetch();
      
      return { success: true, data };
    } catch (error) {
      console.error('Error in addSalonConsumptionProduct:', error);
      return { success: false, error };
    }
  };

  // Function to record salon consumption (used by the POS module)
  const recordSalonConsumption = async (consumptionData: {
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      type: string;
      gst_percentage?: number;
      hsn_code?: string;
    }>;
    voucher_number: string;
    purpose: string;
    notes?: string;
  }) => {
    try {
      console.log('Recording salon consumption with data:', consumptionData);
      
      // Loop through each item and create a salon consumption product record
      for (const item of consumptionData.items) {
        const product = {
          "Requisition Voucher No.": consumptionData.voucher_number,
          "Date": new Date().toISOString(),
          "Product Name": item.name,
          "Consumption Qty.": item.quantity,
          "Purchase Cost per Unit (Ex. GST) (Rs.)": item.price / (1 + (item.gst_percentage || 18) / 100),
          "Purchase GST Percentage": item.gst_percentage || 18,
        };
        
        await addSalonConsumptionProduct(product);
      }
      
      // Refresh queries
      await salonConsumptionProductsQuery.refetch();
      
      return { success: true, message: "Salon consumption recorded successfully" };
    } catch (error) {
      console.error('Error recording salon consumption:', error);
      return { success: false, error };
    }
  };

  return {
    purchases,
    sales,
    consumption,
    loading,
    error,
    fetchInventoryData,
    createPurchase,
    createSale,
    createConsumption,
    processBatchPurchases,
    processBatchSales,
    processBatchConsumption,
    syncConsumptionFromPos,
    isSyncingConsumption,
    processingStats,
    isExporting,
    exportInventoryData,
    recalculateBalanceStock,
    // Queries
    purchasesQuery,
    salesQuery,
    consumptionQuery,
    customerSalesQuery,
    balanceStockQuery,
    salonConsumptionOrdersQuery,
    customerOrdersQuery,
    combinedSalesQuery,
    syncSalesFromPos,
    salonConsumptionProductsQuery,
    addSalonConsumptionProduct,
    recordSalonConsumption
  };
}; 
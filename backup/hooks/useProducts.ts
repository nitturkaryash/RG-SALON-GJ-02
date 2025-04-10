import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase, handleSupabaseError } from '../utils/supabase/supabaseClient';

// Define the Product interface
export interface Product {
  id: string;
  product_name: string;
  hsn_code: string;
  unit_type: string;
  mrp_incl_gst: number;
  gst_percentage: number;
  discount_on_purchase_percentage: number;
  created_at?: string;
  updated_at?: string;
}

// Update product inventory when items are sold
export const updateProductInventory = async (updates: { productId: string; quantity: number }[]): Promise<{ success: boolean; error?: any }> => {
  try {
    let allUpdatesSuccessful = true;
    const validUpdates = [];
    const errors = [];
    
    // First, validate all IDs - they must be UUIDs
    for (const update of updates) {
      // Check if productId is a valid UUID
      const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(update.productId);
      
      if (!isValidUuid) {
        console.warn(`Invalid UUID format for product ID: ${update.productId}. Skipping update.`);
        errors.push(`Invalid UUID format for product ID: ${update.productId}`);
        allUpdatesSuccessful = false;
        continue;
      }
      
      validUpdates.push(update);
    }
    
    if (validUpdates.length === 0) {
      console.error('No valid product IDs to update');
      return { 
        success: false, 
        error: { 
          message: 'No valid product IDs to update', 
          details: errors 
        } 
      };
    }
    
    // Process only valid updates
    for (const update of validUpdates) {
      try {
        // Get the current product data
        const { data: product, error: fetchError } = await supabase
          .from('inventory_products')
          .select('*')
          .eq('product_id', update.productId)
          .single();
        
        if (fetchError) {
          console.error(`Error fetching product with ID ${update.productId}:`, fetchError);
          errors.push(`Error fetching product with ID ${update.productId}: ${fetchError.message}`);
          allUpdatesSuccessful = false;
          continue;
        }
        
        if (!product) {
          console.error(`Product with ID ${update.productId} not found`);
          errors.push(`Product with ID ${update.productId} not found`);
          allUpdatesSuccessful = false;
          continue;
        }
        
        // Calculate new stock quantity (add fallback if undefined)
        const currentStock = product.stock_quantity ?? 0;
        const newStock = Math.max(0, currentStock - update.quantity);
        
        // Update the product in Supabase
        const { error: updateError } = await supabase
          .from('inventory_products')
          .update({
            stock_quantity: newStock,
            updated_at: new Date().toISOString()
          })
          .eq('product_id', update.productId);
        
        if (updateError) {
          console.error(`Error updating product with ID ${update.productId}:`, updateError);
          errors.push(`Error updating product with ID ${update.productId}: ${updateError.message}`);
          allUpdatesSuccessful = false;
        }
      } catch (itemError) {
        console.error(`Error processing product update for ID ${update.productId}:`, itemError);
        errors.push(`Error processing product update for ID ${update.productId}: ${itemError instanceof Error ? itemError.message : 'Unknown error'}`);
        allUpdatesSuccessful = false;
      }
    }
    
    return { 
      success: allUpdatesSuccessful, 
      error: errors.length > 0 ? { message: 'Some updates failed', details: errors } : undefined 
    };
  } catch (error) {
    console.error('Error updating product inventory:', error);
    return { success: false, error };
  }
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products on hook initialization
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch products from Supabase
      const { data, error: fetchError } = await supabase
        .from('inventory_products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        throw handleSupabaseError(fetchError);
      }
      
      // Transform the data from Supabase schema to our app schema
      const transformedProducts = data?.map(item => ({
        id: item.product_id,
        product_name: item.product_name,
        hsn_code: item.hsn_code || '',
        unit_type: item.units || '',
        mrp_incl_gst: Number(item.mrp_incl_gst) || 0,
        gst_percentage: Number(item.gst_percentage) || 0,
        discount_on_purchase_percentage: 0, // Default value since it may not exist in DB
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];
      
      setProducts(transformedProducts);
      return transformedProducts; // Return the products array
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
      setProducts([]);
      return []; // Return empty array in case of error
    } finally {
      setIsLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const timestamp = new Date().toISOString();
      const productId = uuidv4();
      
      // Calculate mrp_excl_gst based on mrp_incl_gst and gst_percentage
      const mrp_excl_gst = product.mrp_incl_gst / (1 + (product.gst_percentage / 100));
      
      // Insert into Supabase
      const { data, error: insertError } = await supabase
        .from('inventory_products')
        .insert({
          product_id: productId,
          product_name: product.product_name,
          hsn_code: product.hsn_code,
          units: product.unit_type,
          mrp_incl_gst: product.mrp_incl_gst,
          mrp_excl_gst: parseFloat(mrp_excl_gst.toFixed(2)),
          gst_percentage: product.gst_percentage,
          created_at: timestamp,
          updated_at: timestamp
        })
        .select()
        .single();
      
      if (insertError) {
        throw handleSupabaseError(insertError);
      }
      
      // Create product object for our app
      const newProduct: Product = {
        id: productId,
        product_name: product.product_name,
        hsn_code: product.hsn_code,
        unit_type: product.unit_type,
        mrp_incl_gst: product.mrp_incl_gst,
        gst_percentage: product.gst_percentage,
        discount_on_purchase_percentage: product.discount_on_purchase_percentage,
        created_at: timestamp,
        updated_at: timestamp,
      };
      
      // Update local state
      setProducts(prev => [newProduct, ...prev]);
      
      return { success: true, product: newProduct };
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Failed to add product. Please try again.');
      return { success: false, error };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const timestamp = new Date().toISOString();
      
      // Calculate mrp_excl_gst if we have both mrp_incl_gst and gst_percentage
      let mrp_excl_gst;
      if (updates.mrp_incl_gst !== undefined && updates.gst_percentage !== undefined) {
        mrp_excl_gst = updates.mrp_incl_gst / (1 + (updates.gst_percentage / 100));
      } else {
        // Get current product to calculate
        const currentProduct = products.find(p => p.id === id);
        if (currentProduct) {
          const mrpInclGst = updates.mrp_incl_gst !== undefined ? updates.mrp_incl_gst : currentProduct.mrp_incl_gst;
          const gstPercentage = updates.gst_percentage !== undefined ? updates.gst_percentage : currentProduct.gst_percentage;
          mrp_excl_gst = mrpInclGst / (1 + (gstPercentage / 100));
        }
      }
      
      // Update in Supabase
      const { error: updateError } = await supabase
        .from('inventory_products')
        .update({
          product_name: updates.product_name,
          hsn_code: updates.hsn_code,
          units: updates.unit_type,
          mrp_incl_gst: updates.mrp_incl_gst,
          mrp_excl_gst: mrp_excl_gst ? parseFloat(mrp_excl_gst.toFixed(2)) : undefined,
          gst_percentage: updates.gst_percentage,
          updated_at: timestamp
        })
        .eq('product_id', id);
      
      if (updateError) {
        throw handleSupabaseError(updateError);
      }
      
      // Update local state
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === id 
            ? { 
                ...product, 
                ...updates, 
                updated_at: timestamp 
              } 
            : product
        )
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Failed to update product. Please try again.');
      return { success: false, error };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // Delete from Supabase
      const { error: deleteError } = await supabase
        .from('inventory_products')
        .delete()
        .eq('product_id', id);
      
      if (deleteError) {
        throw handleSupabaseError(deleteError);
      }
      
      // Update local state
      setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product. Please try again.');
      return { success: false, error };
    }
  };

  // Internal version of updateProductInventory that also updates local state
  const updateInventory = async (updates: Array<{ productId: string, quantity: number }>) => {
    const result = await updateProductInventory(updates);
    if (result.success) {
      // Refresh local state
      await fetchProducts();
    }
    return result;
  };

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductInventory: updateInventory, // Use the internal version
  };
}; 
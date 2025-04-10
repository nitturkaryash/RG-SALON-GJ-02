import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase, handleSupabaseError } from '../utils/supabase/supabaseClient';

// Define the Product interface - Simplified
export interface Product {
  id: string;
  name: string; 
  product_name: string; // Keep for form compatibility for now
  price: number;
  hsn_code: string;
  unit_type: string; // Keep for form compatibility for now
  units: string; 
  mrp_incl_gst: number;
  mrp_per_unit_excl_gst: number;
  gst_percentage: number;
  stock_quantity: number;
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
        // Get the current product data from the 'products' table
        const { data: product, error: fetchError } = await supabase
          .from('products') // Use 'products' table
          .select('stock_quantity') // Select only necessary field
          .eq('id', update.productId) // Use 'id' column
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
        
        // Update the product in the 'products' table
        const { error: updateError } = await supabase
          .from('products') // Use 'products' table
          .update({
            stock_quantity: newStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.productId); // Use 'id' column
        
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
      // Fetch products from Supabase - select only needed columns
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('id, name, price, hsn_code, units, mrp_incl_gst, mrp_excl_gst, gst_percentage, stock_quantity, created_at, updated_at') // Select specific columns
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        throw handleSupabaseError(fetchError);
      }
      
      // Transform the data from Supabase schema to our app schema - Simplified
      const transformedProducts = data?.map(item => ({
        id: item.id,
        name: item.name || '',
        product_name: item.name || '', // Map name to product_name
        price: Number(item.price) || 0,
        hsn_code: item.hsn_code || '',
        unit_type: item.units || '', // Map units to unit_type
        units: item.units || '',
        // Remove all purchase-related fields
        mrp_incl_gst: Number(item.mrp_incl_gst) || 0,
        mrp_per_unit_excl_gst: Number(item.mrp_excl_gst) || 0, 
        gst_percentage: Number(item.gst_percentage) || 0,
        stock_quantity: Number(item.stock_quantity) || 0,
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
      
      // Stock quantity now comes directly from the form/state
      const stockQuantity = product.stock_quantity || 0;
      
      // Insert into Supabase
      const { data, error: insertError } = await supabase
        .from('products')
        .insert({
          id: productId,
          name: product.product_name,
          price: product.mrp_incl_gst,
          hsn_code: product.hsn_code,
          units: product.unit_type,
          mrp_incl_gst: product.mrp_incl_gst,
          mrp_excl_gst: product.mrp_per_unit_excl_gst,
          gst_percentage: product.gst_percentage,
          stock_quantity: stockQuantity, // Use the direct stock quantity
          created_at: timestamp,
          updated_at: timestamp
        })
        .select()
        .single();
      
      if (insertError) {
        throw handleSupabaseError(insertError);
      }
      
      // Create product object for our app - Simplified
      const newProduct: Product = {
        id: productId,
        name: product.product_name,
        product_name: product.product_name,
        price: product.mrp_incl_gst,
        hsn_code: product.hsn_code,
        unit_type: product.unit_type,
        units: product.unit_type,
        mrp_incl_gst: product.mrp_incl_gst,
        mrp_per_unit_excl_gst: product.mrp_per_unit_excl_gst,
        gst_percentage: product.gst_percentage,
        stock_quantity: stockQuantity,
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
      
      // Stock quantity is updated directly from the form
      const stockQuantity = updates.stock_quantity;
      
      // Prepare updates object for Supabase - Simplified
      const supabaseUpdates: any = {
        name: updates.product_name,
        price: updates.mrp_incl_gst,
        hsn_code: updates.hsn_code,
        units: updates.unit_type,
        mrp_incl_gst: updates.mrp_incl_gst,
        mrp_excl_gst: updates.mrp_per_unit_excl_gst,
        gst_percentage: updates.gst_percentage,
        stock_quantity: stockQuantity, // Use direct stock quantity update
        updated_at: timestamp
      };
      
      // Remove undefined values
      Object.keys(supabaseUpdates).forEach(key => {
        if (supabaseUpdates[key] === undefined) {
          delete supabaseUpdates[key];
        }
      });
      
      // Update in Supabase
      const { error: updateError } = await supabase
        .from('products')
        .update(supabaseUpdates)
        .eq('id', id);
      
      if (updateError) {
        throw handleSupabaseError(updateError);
      }
      
      // Update local state
      setProducts(prev =>
        prev.map(product =>
          product.id === id
            ? { ...product, ...updates, updated_at: timestamp }
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
        .from('products')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw handleSupabaseError(deleteError);
      }
      
      // Update local state
      setProducts(prev => prev.filter(product => product.id !== id));
      
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
import { supabase } from '../utils/supabase/supabaseClient.js';
import { toast } from 'react-toastify';

/**
 * Migrates services from collection_services to the main services table
 * Call this function from a button or admin page to perform the migration
 */
export const migrateCollectionServicesToMainTable = async (): Promise<{
  success: boolean;
  migrated: number;
  errors: number;
  message: string;
}> => {
  try {
    console.log('Starting migration of collection services to main services table');
    
    // First, fetch all services from collection_services
    const { data: collectionServices, error: fetchError } = await supabase
      .from('collection_services')
      .select('*');
      
    if (fetchError) {
      console.error('Error fetching collection services:', fetchError);
      return {
        success: false,
        migrated: 0,
        errors: 0,
        message: `Error fetching collection services: ${fetchError.message}`
      };
    }
    
    if (!collectionServices || collectionServices.length === 0) {
      console.warn('No collection services found to migrate');
      return {
        success: true,
        migrated: 0,
        errors: 0,
        message: 'No collection services found to migrate'
      };
    }
    
    console.log(`Found ${collectionServices.length} collection services to migrate`);
    
    // Track migration stats
    let migrated = 0;
    let errors = 0;
    
    // Process services in batches of 10 to avoid overloading Supabase
    const batchSize = 10;
    for (let i = 0; i < collectionServices.length; i += batchSize) {
      const batch = collectionServices.slice(i, i + batchSize);
      
      // Format the batch for insertion into the main services table
      const servicesForMainTable = batch.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description || '',
        price: service.price || 0,
        duration: service.duration || 30,
        category: service.collection_id, // Use collection_id as category
        active: service.active !== undefined ? service.active : true,
        created_at: service.created_at || new Date().toISOString()
      }));
      
      // Use upsert to avoid duplicate errors (insert if not exists, update if exists)
      const { data, error } = await supabase
        .from('services')
        .upsert(servicesForMainTable, { onConflict: 'id' });
        
      if (error) {
        console.error(`Error migrating batch ${i/batchSize + 1}:`, error);
        errors += batch.length;
      } else {
        console.log(`Successfully migrated batch ${i/batchSize + 1}`);
        migrated += batch.length;
      }
      
      // Add a short delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const message = `Migration complete: ${migrated} services migrated, ${errors} errors`;
    console.log(message);
    
    return {
      success: errors === 0,
      migrated,
      errors,
      message
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in migration:', errorMessage);
    
    return {
      success: false,
      migrated: 0,
      errors: 1,
      message: `Migration failed: ${errorMessage}`
    };
  }
};

/**
 * Migrates services from main services table to collection_services
 * This is useful if services were added directly to the services table
 * but need to show up in collections based on their category field
 */
export const syncMainServicesToCollections = async (): Promise<{
  success: boolean;
  migrated: number;
  errors: number;
  message: string;
}> => {
  try {
    console.log('Starting sync of main services to collections based on category');
    
    // First, fetch all services from the main services table
    const { data: mainServices, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .order('name', { ascending: true });
      
    if (fetchError) {
      console.error('Error fetching main services:', fetchError);
      return {
        success: false,
        migrated: 0,
        errors: 0,
        message: `Error fetching main services: ${fetchError.message}`
      };
    }
    
    if (!mainServices || mainServices.length === 0) {
      console.warn('No main services found to sync');
      return {
        success: true,
        migrated: 0,
        errors: 0,
        message: 'No main services found to sync'
      };
    }
    
    console.log(`Found ${mainServices.length} services in main services table`);
    
    // Filter out services without a category
    const servicesWithCategory = mainServices.filter(service => 
      service.category && service.category.trim() !== ''
    );
    
    if (servicesWithCategory.length === 0) {
      console.warn('No services with a valid category found');
      return {
        success: true,
        migrated: 0,
        errors: 0,
        message: 'No services with a valid category found'
      };
    }
    
    console.log(`Found ${servicesWithCategory.length} services with valid categories`);
    
    // Track migration stats
    let migrated = 0;
    let errors = 0;
    
    // Process services in batches of 10
    const batchSize = 10;
    for (let i = 0; i < servicesWithCategory.length; i += batchSize) {
      const batch = servicesWithCategory.slice(i, i + batchSize);
      
      // Format the batch for insertion into collection_services
      const servicesForCollections = batch.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description || '',
        price: service.price || 0,
        duration: service.duration || 30,
        active: service.active !== undefined ? service.active : true,
        collection_id: service.category, // Map category to collection_id
        created_at: service.created_at || new Date().toISOString()
      }));
      
      // Use upsert to avoid duplicate errors
      const { error } = await supabase
        .from('collection_services')
        .upsert(servicesForCollections, { onConflict: 'id' });
        
      if (error) {
        console.error(`Error syncing batch ${i/batchSize + 1}:`, error);
        errors += batch.length;
      } else {
        console.log(`Successfully synced batch ${i/batchSize + 1}`);
        migrated += batch.length;
      }
      
      // Add a short delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const message = `Sync complete: ${migrated} services synced to collections, ${errors} errors`;
    console.log(message);
    
    return {
      success: errors === 0,
      migrated,
      errors,
      message
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in sync:', errorMessage);
    
    return {
      success: false,
      migrated: 0,
      errors: 1,
      message: `Sync failed: ${errorMessage}`
    };
  }
}; 
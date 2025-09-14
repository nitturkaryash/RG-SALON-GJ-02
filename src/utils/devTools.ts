import { renumberAllOrders } from './orderRenumbering';
import { updateExistingOrdersWithFormattedIds } from './orderIdGenerator';
import {
  recalculateAllStockLevels,
  testStockRecalculationSystem,
} from './stockRecalculation';

// Development tools for managing order IDs
export const devTools = {
  // Migrate existing orders to use formatted IDs
  migrateOrderIds: async () => {
    try {
      console.log('Starting order ID migration...');
      await updateExistingOrdersWithFormattedIds();
      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
    }
  },

  // Renumber all orders sequentially
  renumberAllOrders: async () => {
    try {
      console.log('Starting order renumbering...');
      await renumberAllOrders();
      console.log('Renumbering completed successfully!');
    } catch (error) {
      console.error('Renumbering failed:', error);
    }
  },

  // Run both migration and renumbering
  fullOrderIdUpdate: async () => {
    try {
      console.log('Starting full order ID update...');
      await updateExistingOrdersWithFormattedIds();
      await renumberAllOrders();
      console.log('Full order ID update completed successfully!');
    } catch (error) {
      console.error('Full order ID update failed:', error);
    }
  },

  // Recalculate all stock levels
  recalculateAllStock: async () => {
    try {
      console.log('Starting stock recalculation...');
      await recalculateAllStockLevels();
      console.log('Stock recalculation completed successfully!');
    } catch (error) {
      console.error('Stock recalculation failed:', error);
    }
  },

  // Run complete system update (orders + stock)
  fullSystemUpdate: async () => {
    try {
      console.log('Starting full system update...');
      await updateExistingOrdersWithFormattedIds();
      await renumberAllOrders();
      await recalculateAllStockLevels();
      console.log('Full system update completed successfully!');
    } catch (error) {
      console.error('Full system update failed:', error);
    }
  },

  // Test stock recalculation system
  testStockSystem: async () => {
    try {
      console.log('Testing stock recalculation system...');
      const result = await testStockRecalculationSystem();
      console.log('Test result:', result);
      return result;
    } catch (error) {
      console.error('Stock system test failed:', error);
      return { success: false, message: 'Test failed', error };
    }
  },
};

// Make devTools available globally for development
if (typeof window !== 'undefined') {
  (window as any).devTools = devTools;
  console.log('Development tools available at window.devTools');
  console.log('Available commands:');
  console.log('- devTools.migrateOrderIds()');
  console.log('- devTools.renumberAllOrders()');
  console.log('- devTools.fullOrderIdUpdate()');
  console.log('- devTools.recalculateAllStock()');
  console.log('- devTools.fullSystemUpdate()');
  console.log('- devTools.testStockSystem()');
}

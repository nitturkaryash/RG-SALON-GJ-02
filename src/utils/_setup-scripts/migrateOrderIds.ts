import { updateExistingOrdersWithFormattedIds } from './orderIdGenerator';

// Function to run the migration
export const runOrderIdMigration = async () => {
  try {
    console.log('Starting order ID migration...');
    await updateExistingOrdersWithFormattedIds();
    console.log('Order ID migration completed successfully!');
  } catch (error) {
    console.error('Order ID migration failed:', error);
  }
};

// Export for use in development
export { updateExistingOrdersWithFormattedIds };

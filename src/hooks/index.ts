// Main hooks export
export * from './inventory';
export * from './orders';
export * from './appointments';
export * from './products';
export * from './clients';
export * from './analytics';

// Individual exports for backward compatibility
export { useInventory } from './inventory/useInventory';
export { useOrders } from './orders/useOrders';
export { usePOS } from './orders/usePOS';
export { useAppointments } from './appointments/useAppointments';
export { useProducts } from './products/useProducts';
export { useServices } from './products/useServices';
export { useClients } from './clients/useClients';
export { useDashboardAnalytics } from './analytics/useDashboardAnalytics';

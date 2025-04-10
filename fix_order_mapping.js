/**
 * This script helps fix field mismatches between the Orders and POS components
 * Run this script in the Supabase SQL Editor to fix existing orders
 */

// SQL that would help map fields between different naming conventions
const sqlFix = `
-- First, synchronize field names that differ between components
UPDATE pos_orders
SET client_name = customer_name
WHERE client_name IS NULL AND customer_name IS NOT NULL;

UPDATE pos_orders
SET customer_name = client_name
WHERE customer_name IS NULL AND client_name IS NOT NULL;

UPDATE pos_orders
SET total = total_amount
WHERE total IS NULL AND total_amount IS NOT NULL;

UPDATE pos_orders
SET total_amount = total
WHERE total_amount IS NULL AND total IS NOT NULL;

-- Make sure orders have proper status values
UPDATE pos_orders
SET status = 'completed'
WHERE status = 'Unknown' OR status IS NULL;

-- Add order_id if missing
UPDATE pos_orders
SET order_id = id::text
WHERE order_id IS NULL;

-- Make sure payments is formatted as proper JSONB
UPDATE pos_orders
SET payments = '[]'::jsonb
WHERE payments IS NULL;

-- Make sure services is formatted as proper JSONB
UPDATE pos_orders
SET services = '[]'::jsonb
WHERE services IS NULL;
`;

// JavaScript version of the same operations - could be used in your application
// if you want to normalize orders in the frontend
function normalizeOrder(order) {
  if (!order) return null;
  
  // Create a copy so we don't modify the original
  const normalized = { ...order };
  
  // Handle customer_name vs client_name
  if (!normalized.client_name && normalized.customer_name) {
    normalized.client_name = normalized.customer_name;
  } else if (!normalized.customer_name && normalized.client_name) {
    normalized.customer_name = normalized.client_name;
  }
  
  // Handle total vs total_amount
  if (!normalized.total && normalized.total_amount) {
    normalized.total = normalized.total_amount;
  } else if (!normalized.total_amount && normalized.total) {
    normalized.total_amount = normalized.total;
  }
  
  // Ensure payments is an array
  if (!normalized.payments) {
    normalized.payments = [];
  }
  
  // Ensure services is an array
  if (!normalized.services) {
    normalized.services = [];
  }
  
  // Ensure status has a value
  if (!normalized.status) {
    normalized.status = 'completed';
  }
  
  // Ensure order_id exists
  if (!normalized.order_id && normalized.id) {
    normalized.order_id = normalized.id;
  }
  
  return normalized;
}

// You could use this in components like:
// 
// import { normalizeOrder } from './utils/orderHelpers';
//
// const OrdersList = () => {
//   const { data: orders } = useQuery(...);
//   
//   const normalizedOrders = useMemo(() => {
//     return orders?.map(order => normalizeOrder(order)) || [];
//   }, [orders]);
//
//   // Now use normalizedOrders in your UI
// }

console.log("Run the SQL in this file in the Supabase SQL Editor.");
console.log("Also consider adding the normalizeOrder function to a utility file in your project."); 
// Collection represents a category or group of products
export interface Collection {
  id: string;
  name: string;
  description: string;
  created_at?: string;
}

// Product represents an inventory item
export interface Product {
  id: string;
  collection_id?: string;
  name?: string;
  product_name?: string;
  price?: number;
  mrp_incl_gst?: number;
  cost?: number;
  stock?: number;
  stock_quantity?: number;
  hsn_code?: string;
  unit_type?: string;
  units?: string;
  gst_percentage?: number;
  status?: 'active' | 'inactive';
  description?: string;
  discount_on_purchase_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

// Purchase information
export interface Purchase {
  id: string;
  date: string;
  product_name?: string;
  hsn_code?: string;
  units?: string;
  purchase_qty?: number;
  mrp_incl_gst?: number;
  mrp_excl_gst?: number;
  gst_percentage?: number;
  purchase_cost_per_unit_ex_gst?: number;
  purchase_taxable_value?: number;
  purchase_igst?: number;
  purchase_cgst?: number;
  purchase_sgst?: number;
  purchase_invoice_value_rs?: number;
  discount_on_purchase_percentage?: number;
  vendor_name?: string;
  invoice_no?: string;
  tax_inlcuding_disc?: number;
  created_at: string;
  updated_at?: string;
}

// Purchase item information
export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  created_at?: string;
}

// Sale information
export interface Sale {
  id: string;
  date: string;
  product_name?: string;
  hsn_code?: string;
  units?: string;
  unit?: string;
  sales_qty?: number;
  quantity?: number;
  mrp_incl_gst?: number;
  mrp_excl_gst?: number;
  discount_on_sales_percentage?: number;
  discount_percentage?: number;
  discounted_sales_rate_excl_gst?: number;
  gst_percentage?: number;
  taxable_value?: number;
  igst?: number;
  cgst?: number;
  sgst?: number;
  invoice_value?: number;
  purchase_cost_per_unit_ex_gst?: number;
  purchase_gst_percentage?: number;
  purchase_taxable_value?: number;
  purchase_igst?: number;
  purchase_cgst?: number;
  purchase_sgst?: number;
  total_purchase_cost?: number;
  invoice_no?: string;
  customer_name?: string;
  is_salon_consumption?: boolean;
  created_at: string;
  updated_at?: string;
}

// Consumption information (internal salon use)
export interface Consumption {
  id: string;
  order_id?: string;
  date: string;
  product_id?: string;
  product_name: string;
  hsn_code?: string;
  units?: string;
  quantity: number;
  consumption_qty?: number;
  cost_per_unit?: number;
  purpose?: string;
  requisition_voucher_no?: string;
  notes?: string;
  gst_percentage?: number;
  taxable_value?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  total?: number;
  invoice_value?: number;
  purchase_cost_per_unit_ex_gst?: number;
  purchase_gst_percentage?: number;
  purchase_taxable_value?: number;
  purchase_cgst?: number;
  purchase_sgst?: number;
  total_purchase_cost?: number;
  balance_qty?: number;
  stylist?: string;
  stylist_name?: string;
  created_at: string;
  updated_at?: string;
}

// Consumption form state
export interface ConsumptionFormState {
  date: string;
  product_name: string;
  hsn_code: string;
  units: string;
  quantity: number;
  purpose: string;
  mrp_incl_gst?: number;
  gst_percentage?: number;
}

// Balance stock information
export interface BalanceStock {
  id: string;
  product_name?: string;
  hsn_code?: string;
  units?: string;
  opening_stock?: number;
  purchases?: number;
  sales?: number;
  consumption?: number;
  closing_stock?: number;
  last_updated?: string;
  updated_at?: string;
  unit?: string;
  balance_qty?: number;
  balance_value?: number;
  avg_rate?: number;
  taxable_value?: number;
  igst?: number;
  cgst?: number;
  sgst?: number;
  invoice_value?: number;
}

// Purchase form state information
export interface PurchaseFormState {
  date: string;
  product_name: string;
  hsn_code: string;
  units: string;
  purchase_qty: number;
  mrp_incl_gst: number;
  gst_percentage: number;
  purchase_cost_per_unit_ex_gst?: number;
  discount_on_purchase_percentage: number;
  vendor_name: string;
  invoice_no: string;
  purchase_invoice_number?: string;
  purchase_taxable_value?: number;
  purchase_igst?: number;
  purchase_cgst?: number;
  purchase_sgst?: number;
  purchase_invoice_value_rs?: number;
  tax_inlcuding_disc?: number;
}

// Processing stats for batch operations
export interface ProcessingStats {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  errors: any[];
  startTime?: Date;
  endTime?: Date | null;
}

// Inventory export data structure
export interface InventoryExportData {
  purchases: Purchase[];
  sales: Sale[];
  consumption: Consumption[];
  balanceStock: BalanceStock[];
}

// Inventory stats for dashboard
export interface InventoryStats {
  totalProducts: number;
  totalPurchases: number;
  totalSales: number;
  totalConsumption: number;
  lowStockItems: number;
}

// Filter types for inventory display
export enum InventoryFilterType {
  All = 'all',
  InStock = 'in-stock',
  LowStock = 'low-stock',
  OutOfStock = 'out-of-stock'
}

// Order types for inventory display
export enum InventoryOrderType {
  NameAsc = 'name-asc',
  NameDesc = 'name-desc',
  PriceAsc = 'price-asc',
  PriceDesc = 'price-desc',
  StockAsc = 'stock-asc',
  StockDesc = 'stock-desc'
}

// Calculate profit for a product
export const calculateProfit = (price: number, cost: number): number => {
  return parseFloat((price - cost).toFixed(2));
};

// Calculate profit margin as a percentage
export const calculateProfitMargin = (price: number, cost: number): number => {
  if (price <= 0) return 0;
  return parseFloat((((price - cost) / price) * 100).toFixed(2));
}; 
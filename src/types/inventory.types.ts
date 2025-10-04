/**
 * Shared TypeScript interfaces for Inventory Management
 */

// Product Form Data interface
export interface ProductFormData {
  product_name: string;
  hsn_code: string;
  units: string;
  purchase_qty: number;
  purchase_price: number;
  gst_percentage: number;
  total_amount: number;
  supplier_name: string;
  purchase_date: string;
  notes: string;
}

// Extended Product Form Data interface
export interface ExtendedProductFormData extends ProductFormData {
  product_id: string;
  purchase_id?: string;
  date: string;
  product_name: string;
  hsn_code: string;
  units: string;
  purchase_invoice_number: string;
  purchase_qty: number;
  mrp_incl_gst: number;
  mrp_excl_gst: number;
  discount_on_purchase_percentage: number;
  purchase_excl_gst: number;
  gst_percentage: number;
  purchase_cost_taxable_value: number;
  purchase_igst: number;
  purchase_cgst: number;
  purchase_sgst: number;
  purchase_invoice_value: number;
  vendor: string;
  supplier: string;
  stock_after_purchase?: number;
  total_value?: number;
  total_tax?: number;
  is_interstate: boolean;
  mrp_per_unit_excl_gst: number;
  unit_type: string;
  purchase_cost_per_unit_ex_gst: number;
  invoice_number?: string;
  invoice_no?: string;
}

// Sales History Item interface
export interface SalesHistoryItem {
  id?: string;
  serial_no: string;
  order_id: string;
  date: string;
  product_name: string;
  quantity: number;
  unit_price_ex_gst: number;
  unit_price_incl_gst: number;
  gst_percentage: number;
  taxable_value: number;
  discount_percentage: number;
  taxable_after_discount: number;
  cgst_amount: number;
  sgst_amount: number;
  total_purchase_cost: number;
  discount: number;
  tax: number;
  hsn_code: string;
  product_type: string;
  mrp_incl_gst: number | null;
  discounted_sales_rate_ex_gst: number | null;
  invoice_value: number;
  igst_amount: number;
  stock: number;
  stock_taxable_value: number;
  stock_cgst: number;
  stock_sgst: number;
  stock_total_value: number;
  invoice_number?: string;
  invoice_no?: string;
}

// Salon Consumption Item interface
export interface SalonConsumptionItem {
  id?: string;
  requisition_voucher_no: string;
  order_id: string;
  date: string;
  product_name: string;
  product_type: string;
  consumption_qty: number;
  hsn_code: string | null;
  purchase_cost_per_unit_ex_gst: number;
  purchase_gst_percentage: number;
  purchase_taxable_value: number;
  purchase_igst: number;
  purchase_cgst: number;
  purchase_sgst: number;
  total_purchase_cost: number;
  discounted_sales_rate: number;
  current_stock: number;
  created_at?: string;
  serial_no?: string;
  invoice_number?: string;
  invoice_no?: string;
}

// Balance Stock Item interface
export interface BalanceStockItem {
  id: string;
  date: string;
  product_name: string;
  hsn_code: string;
  units: string;
  change_type: 'reduction' | 'addition';
  source: string;
  reference_id: string;
  quantity_change: number;
  quantity_after_change: number;
  serial_no?: string;
}

// Filter interfaces
export interface SalesHistoryFilter {
  productName: string;
  hsnCode: string;
  productType: string;
  minAmount: string;
  maxAmount: string;
}

export interface SalonConsumptionFilter {
  productName: string;
  productType: string;
  minQuantity: string;
  maxQuantity: string;
}

export interface BalanceStockFilter {
  productName: string;
  changeType: string;
  minAmount: string;
  maxAmount: string;
}

export interface PurchaseHistoryFilter {
  productName: string;
  hsnCode: string;
  vendor: string;
  invoiceNumber: string;
  minAmount: string;
  maxAmount: string;
}

// Sort configuration interface
export interface SortConfig<T> {
  key: keyof T | null;
  direction: 'asc' | 'desc';
}

// Date filter interface
export interface DateFilter {
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

// Summary data interfaces
export interface SummaryData {
  totalQuantity: number;
  totalValue: number;
}

// Initial form data constants
export const initialFormData: ProductFormData = {
  product_name: '',
  hsn_code: '',
  units: 'pcs',
  purchase_qty: 0,
  purchase_price: 0,
  gst_percentage: 18,
  total_amount: 0,
  supplier_name: '',
  purchase_date: new Date().toISOString().split('T')[0],
  notes: '',
};

export const extendedInitialFormData: ExtendedProductFormData = {
  ...initialFormData,
  product_id: '',
  purchase_id: '',
  date: (() => {
    const now = new Date();
    const indiaOffset = 5.5 * 60; // IST is UTC+5:30
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const indiaTime = new Date(utcTime + indiaOffset * 60000);
    return indiaTime.toISOString();
  })(),
  purchase_invoice_number: '',
  mrp_incl_gst: 0,
  mrp_excl_gst: 0,
  discount_on_purchase_percentage: 0,
  purchase_cost_taxable_value: 0,
  purchase_igst: 0,
  purchase_cgst: 0,
  purchase_sgst: 0,
  purchase_invoice_value: 0,
  vendor: '',
  supplier: '',
  stock_after_purchase: 0,
  total_value: 0,
  total_tax: 0,
  is_interstate: false,
  mrp_per_unit_excl_gst: 0,
  unit_type: 'pcs',
  purchase_cost_per_unit_ex_gst: 0,
  purchase_excl_gst: 0,
};

// Initial filter states
export const initialSalesHistoryFilter: SalesHistoryFilter = {
  productName: '',
  hsnCode: '',
  productType: '',
  minAmount: '',
  maxAmount: '',
};

export const initialSalonConsumptionFilter: SalonConsumptionFilter = {
  productName: '',
  productType: '',
  minQuantity: '',
  maxQuantity: '',
};

export const initialBalanceStockFilter: BalanceStockFilter = {
  productName: '',
  changeType: '',
  minAmount: '',
  maxAmount: '',
};

export const initialPurchaseHistoryFilter: PurchaseHistoryFilter = {
  productName: '',
  hsnCode: '',
  vendor: '',
  invoiceNumber: '',
  minAmount: '',
  maxAmount: '',
};

export const initialDateFilter: DateFilter = {
  startDate: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  endDate: new Date(), // Today
  isActive: false,
};

export const initialSummaryData: SummaryData = {
  totalQuantity: 0,
  totalValue: 0,
};

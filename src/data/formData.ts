// Define the type for the form data based on its usage
export interface ProductFormData {
  id?: string; // Add ID field for edit operations
  date: string;
  product_name: string;
  hsn_code: string;
  unit_type: string; // Corresponds to 'units' in inventory_purchases
  invoice_number: string;
  purchase_qty: number;
  purchase_incl_gst: number; // Calculated from purchase_excl_gst and gst_percentage
  purchase_excl_gst: number; // Calculated from MRP and discount
  mrp_percentage?: number; // This seems unused in calculations, keep or remove?
  mrp_per_unit_excl_gst: number; // Calculated from mrp_incl_gst and gst_percentage
  discount_on_purchase_percentage: number;
  purchase_cost_taxable_value: number; // Calculated from purchase_excl_gst and purchase_qty
  gst_percentage: number;
  purchase_igst: number; // Calculated
  purchase_cgst: number; // Calculated
  purchase_sgst: number; // Calculated
  purchase_invoice_value: number; // Calculated
  mrp_incl_gst: number; // User input
  stock_quantity?: number; // Removed from form, keep type optional if used elsewhere
  vendor?: string; // Added: Supplier/vendor name
  is_interstate?: boolean; // Added: Whether purchase is interstate (IGST) or intrastate (CGST+SGST)
  purchase_invoice_number?: string; // Sometimes used instead of invoice_number
  purchase_invoice_value_rs?: number; // Sometimes used instead of purchase_invoice_value
  purchase_taxable_value?: number; // Sometimes used instead of purchase_cost_taxable_value
}

// Define initial form data locally
export const initialFormData: ProductFormData = {
  date: new Date().toISOString().split('T')[0],
  product_name: '',
  hsn_code: '',
  unit_type: '',
  invoice_number: '',
  purchase_qty: 1,
  purchase_incl_gst: 0, // Will be calculated
  purchase_excl_gst: 0, // Will be calculated
  // mrp_percentage: 0, // Seems unused
  mrp_per_unit_excl_gst: 0, // Will be calculated
  discount_on_purchase_percentage: 0,
  purchase_cost_taxable_value: 0, // Will be calculated
  gst_percentage: 18, // Default GST
  purchase_igst: 0, // Will be calculated
  purchase_cgst: 0, // Will be calculated
  purchase_sgst: 0, // Will be calculated
  purchase_invoice_value: 0, // Will be calculated
  mrp_incl_gst: 0,
  // stock_quantity: 0, // Removed from form
  vendor: '', // Added default value
  is_interstate: false, // Added default value - intrastate by default
}; 
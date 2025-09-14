// Fix OrderBy type to match the string literals used in the components
export type OrderBy = 
  'product_name' | 
  'hsn_code' | 
  'unit' | 
  'balance_qty' | 
  'avg_rate' | 
  'balance_value';

// Type for payment methods
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'upi' | 'bnpl' | 'membership';

// Service interface for order items
export interface Service {
  id: string;
  name: string;
  type?: 'service' | 'product' | 'membership';
  category?: string;
  quantity?: number;
  unitPrice?: number;
  subtotal?: number;
  stylist?: string;
  product_id?: string;
  product_name?: string;
  hsn_code?: string;
  stock_quantity?: number;
}

// Order interface for POS system
export interface Order {
  id: string;
  order_id?: string;
  invoice_number?: string;
  date?: string;
  created_at?: string;
  customer_name?: string;
  client_name?: string;
  order_date?: string;
  total_amount?: number;
  total?: number;
  payment_method?: PaymentMethod;
  staff_id?: string | null;
  status?: 'pending' | 'completed' | 'cancelled';
  // For salon consumption tracking
  is_salon_consumption?: boolean;
  consumption_purpose?: string | null;
  // Order categorization
  purchase_type?: 'salon_consumption' | 'regular_purchase' | 'service';
  order_type?: 'salon_consumption' | 'walk_in' | 'appointment';
  // Services array
  services?: Service[];
  // Payment info
  payment_info?: {
    method: PaymentMethod;
    amount: number;
  };
  // Metadata
  updated_at?: string;
}

// Interface for Excel data parser
export interface ExcelData {
  products: Array<any>;
  purchases: Array<any>;
  sales: Array<any>;
  consumption: Array<any>;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  price: number;
  total: number;
  type: 'product' | 'service' | 'membership';
  hsn_code?: string;
  gst_percentage?: number;
  units?: string;
  category?: string;
  for_salon_use?: boolean;
  purpose?: string;
  discount?: number; // Individual item discount amount
  discount_percentage?: number; // Individual item discount percentage
  duration_months?: number; // Duration in months for membership items
}

export interface OrderSummary {
  subtotal: number;
  gst: number;
  discount: number;
  total: number;
  items: OrderItem[];
} 
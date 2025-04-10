// Fix OrderBy type to match the string literals used in the components
export type OrderBy = 
  'product_name' | 
  'hsn_code' | 
  'unit' | 
  'balance_qty' | 
  'avg_rate' | 
  'balance_value';

// Type for payment methods
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'upi' | 'bnpl';

// Order interface for POS system
export interface Order {
  id: string;
  customer_name: string;
  order_date: string;
  total_amount: number;
  payment_method: PaymentMethod;
  staff_id: string | null;
  invoice_number: string;
  status?: 'pending' | 'completed' | 'cancelled';
  // For salon consumption tracking
  is_salon_consumption?: boolean;
  consumption_purpose?: string | null;
  // Order categorization
  purchase_type?: 'salon_consumption' | 'regular_purchase' | 'service';
  order_type?: 'salon_consumption' | 'walk_in' | 'appointment';
  // Metadata
  created_at?: string;
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
  type: 'product' | 'service';
  discount?: number;
  hsn_code?: string;
  gst_percentage?: number;
  created_at?: string;
  updated_at?: string;
  // Fields for salon consumption
  is_salon_consumption?: boolean;
  for_salon_use?: boolean;
  category?: string;
  purpose?: string | null;
  units?: string;
}

export interface OrderSummary {
  subtotal: number;
  gst: number;
  discount: number;
  total: number;
  items: OrderItem[];
} 
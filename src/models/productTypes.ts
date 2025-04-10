// ProductCollection represents a category or group of products
export interface ProductCollection {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

// Product represents a product with pricing and stock information
export interface Product {
  id: string;
  collection_id: string;
  name: string;
  product_name?: string;
  description?: string;
  price: number;
  mrp_incl_gst?: number;
  stock_quantity: number;
  active: boolean;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  hsn_code?: string;
  unit_type?: string;
  units?: string;
  gst_percentage?: number;
  cost?: number;
  stock?: number;
  status?: 'active' | 'inactive';
  discount_on_purchase_percentage?: number;
} 
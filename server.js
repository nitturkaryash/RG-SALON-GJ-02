import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 Express server using Supabase credentials');
console.log('📡 URL:', supabaseUrl);

// Authorization middleware
function isAuthorized(req) {
  // For development, allow requests without authorization
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  
  const expected = process.env.INTERNAL_API_KEY || 'your-secure-api-key-here';
  const auth = req.headers.authorization || '';
  return Boolean(expected) && auth === `Bearer ${expected}`;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Products API routes
app.get('/api/products', async (req, res) => {
  try {
    if (!isAuthorized(req)) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { data: products, error } = await supabase
      .from('product_master')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    if (!isAuthorized(req)) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const {
      name,
      hsn_code,
      gst_percentage,
      price,
      mrp_excl_gst,
      mrp_incl_gst,
      active = true,
      description,
      category,
      product_type,
      stock_quantity = 0,
      user_id,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Product name is required' });
    }

    if (!hsn_code) {
      return res.status(400).json({ success: false, error: 'HSN code is required' });
    }

    const productId = uuidv4();
    const now = new Date().toISOString();

    // Check if product already exists with same name (case-insensitive)
    const { data: existingProducts, error: checkError } = await supabase
      .from('product_master')
      .select('id, name, hsn_code')
      .or(`name.ilike.${name},hsn_code.eq.${hsn_code}`);

    if (checkError) throw checkError;

    if (existingProducts && existingProducts.length > 0) {
      // Check for exact name match first (case-insensitive)
      const nameMatch = existingProducts.find(
        product => product.name.toLowerCase() === name.toLowerCase()
      );

      if (nameMatch) {
        return res.status(409).json({
          success: false,
          error: `A product with the name "${name}" already exists`,
          existing_product: nameMatch,
        });
      }

      // Check for HSN code match
      const hsnMatch = existingProducts.find(
        product => product.hsn_code === hsn_code
      );

      if (hsnMatch) {
        return res.status(409).json({
          success: false,
          error: `A product with the HSN code "${hsn_code}" already exists: ${hsnMatch.name}`,
          existing_product: hsnMatch,
        });
      }
    }

    // Create the product
    const { data: product, error: productError } = await supabase
      .from('product_master')
      .insert({
        id: productId,
        name,
        hsn_code,
        gst_percentage: gst_percentage || 0,
        price: price || mrp_excl_gst || 0,
        mrp_excl_gst: mrp_excl_gst || 0,
        mrp_incl_gst: mrp_incl_gst || 0,
        active,
        description: description || '',
        category: category || '',
        product_type: product_type || '',
        stock_quantity: stock_quantity || 0,
        user_id: user_id || null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (productError) throw productError;

    res.json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, error: 'Failed to create product' });
  }
});

// Clients API routes
app.get('/api/clients', async (req, res) => {
  try {
    if (!isAuthorized(req)) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch clients' });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    if (!isAuthorized(req)) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const {
      name,
      phone,
      email,
      address,
      date_of_birth,
      gender,
      user_id,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Client name is required' });
    }

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Client phone is required' });
    }

    const clientId = uuidv4();
    const now = new Date().toISOString();

    // Check if client already exists with same phone
    const { data: existingClients, error: checkError } = await supabase
      .from('clients')
      .select('id, name, phone')
      .eq('phone', phone);

    if (checkError) throw checkError;

    if (existingClients && existingClients.length > 0) {
      return res.status(409).json({
        success: false,
        error: `A client with the phone number "${phone}" already exists: ${existingClients[0].name}`,
        existing_client: existingClients[0],
      });
    }

    // Create the client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        id: clientId,
        name,
        phone,
        email: email || '',
        address: address || '',
        date_of_birth: date_of_birth || null,
        gender: gender || '',
        user_id: user_id || null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (clientError) throw clientError;

    res.json({
      success: true,
      message: 'Client created successfully',
      client,
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ success: false, error: 'Failed to create client' });
  }
});

// Orders API routes
app.get('/api/orders', async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('pos_orders')
      .select(`
        *,
        pos_order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const {
      client_name,
      client_phone,
      items,
      total,
      payment_method = 'cash',
      stylist,
      type = 'sale',
      consumption_purpose,
      consumption_notes,
      is_salon_consumption = false,
    } = req.body;

    if (!client_name || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: client_name, items',
      });
    }

    const orderId = uuidv4();
    const now = new Date().toISOString();

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('pos_orders')
      .insert({
        id: orderId,
        client_name,
        consumption_purpose,
        consumption_notes,
        total: total || 0,
        type,
        is_salon_consumption,
        status: 'completed',
        payment_method,
        created_at: now,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map((item) => ({
      id: uuidv4(),
      pos_order_id: orderId,
      service_id: item.service_id || item.id,
      service_name: item.name || item.service_name,
      service_type: item.type || 'service',
      price: item.price || 0,
      quantity: item.quantity || 1,
      gst_percentage: item.gst_percentage || 18,
      hsn_code: item.hsn_code || '',
      created_at: now,
    }));

    const { error: itemsError } = await supabase
      .from('pos_order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    res.json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Express server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoints: http://localhost:${PORT}/api/*`);
});

export default app;

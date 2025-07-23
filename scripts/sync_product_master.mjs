import { createClient } from '@supabase/supabase-js';

// --- Configuration ---
const SUPABASE_URL = 'https://mtyudylsozncvilibxda.supabase.co';
const SUPABASE_KEY = 'sbp_cc5ff2fa5f76e84bdf151555361dec6a4294c9b7';
const USER_ID = 'f1ab5143-1129-4557-a694-63a010292c14'; // The user ID to associate with these products

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Data extracted directly from ProductMaster.tsx
const manualProductData = [
    { id: 'manual-1', name: 'KP 6/77 DARK BLND BRWN INT 60G', hsn_code: '33059040', gst_percentage: 18, units: 'pieces', price: 338.98, mrp_excl_gst: 338.98, mrp_incl_gst: 400, active: true, stock_quantity: 0, description: '', category: 'Wella Professional', product_type: 'TUB-TUBES' },
    { id: 'manual-2', name: 'KP 6/1 DARK BLND ASH 60G', hsn_code: '33059040', gst_percentage: 18, units: 'pieces', price: 338.98, mrp_excl_gst: 338.98, mrp_incl_gst: 400, active: true, stock_quantity: 0, description: '', category: 'Wella Professional', product_type: 'TUB-TUBES' },
    { id: 'manual-3', name: 'SP DIA REPAIR MASK 400ML', hsn_code: '33059090', gst_percentage: 18, units: 'pieces', price: 2627.12, mrp_excl_gst: 2627.12, mrp_incl_gst: 3100, active: true, stock_quantity: 0, description: '', category: 'System Professional', product_type: 'CAN-CANS' },
    { id: 'manual-4', name: 'WP FUSION MASK 150ML', hsn_code: '33059090', gst_percentage: 18, units: 'pieces', price: 1059.32, mrp_excl_gst: 1059.32, mrp_incl_gst: 1250, active: true, stock_quantity: 0, description: '', category: 'Wella Professional', product_type: 'CAN-CANS' },
    { id: 'manual-5', name: 'WP OIL REF MASK 150ML', hsn_code: '33059090', gst_percentage: 18, units: 'pieces', price: 1059.32, mrp_excl_gst: 1059.32, mrp_incl_gst: 1250, active: true, stock_quantity: 0, description: '', category: 'Wella Professional', product_type: 'CAN-CANS' },
    { id: 'manual-6', name: 'SP DIA SMOOTHEN MASK 400ML', hsn_code: '33059090', gst_percentage: 18, units: 'pieces', price: 2627.12, mrp_excl_gst: 2627.12, mrp_incl_gst: 3100, active: true, stock_quantity: 0, description: '', category: 'System Professional', product_type: 'CAN-CANS' },
    { id: 'manual-7', name: 'SP DIA HYDRATE MASK 400ML', hsn_code: '33059090', gst_percentage: 18, units: 'pieces', price: 2627.12, mrp_excl_gst: 2627.12, mrp_incl_gst: 3100, active: true, stock_quantity: 0, description: '', category: 'System Professional', product_type: 'CAN-CANS' },
    { id: 'manual-8', name: 'KP 7/2 MATT MEDIUM BLND 60G', hsn_code: '33059040', gst_percentage: 18, units: 'pieces', price: 338.98, mrp_excl_gst: 338.98, mrp_incl_gst: 400, active: true, stock_quantity: 0, description: '', category: 'Wella Professional', product_type: 'TUB-TUBES' },
    { id: 'manual-9', name: 'SP DIA LUXE OIL 100ML', hsn_code: '33052000', gst_percentage: 18, units: 'pieces', price: 2627.12, mrp_excl_gst: 2627.12, mrp_incl_gst: 3100, active: true, stock_quantity: 0, description: '', category: 'System Professional', product_type: 'BTL-BOTTLES' },
    { id: 'manual-10', name: 'KP 6/2 MATT DARK BLND 60G', hsn_code: '33059040', gst_percentage: 18, units: 'pieces', price: 338.98, mrp_excl_gst: 338.98, mrp_incl_gst: 400, active: true, stock_quantity: 0, description: '', category: 'Wella Professional', product_type: 'TUB-TUBES' },
    { id: 'manual-11', name: 'WP OIL REF MASK 500ML', hsn_code: '33059090', gst_percentage: 18, units: 'pieces', price: 1652.54, mrp_excl_gst: 1652.54, mrp_incl_gst: 1950, active: true, stock_quantity: 0, description: '', category: 'Wella Professional', product_type: 'CAN-CANS' },
    { id: 'manual-12', name: 'KP 10/38 BLONDE GLDN PRL 60G', hsn_code: '33059040', gst_percentage: 18, units: 'pieces', price: 338.98, mrp_excl_gst: 338.98, mrp_incl_gst: 400, active: true, stock_quantity: 0, description: '', category: 'Wella Professional', product_type: 'TUB-TUBES' },
    { id: 'manual-13', name: 'KP 12/0 SPECIAL BLND NTRL 60GM', hsn_code: '33059040', gst_percentage: 18, units: 'pieces', price: 338.98, mrp_excl_gst: 338.98, mrp_incl_gst: 400, active: true, stock_quantity: 0, description: '', category: 'Wella Professional', product_type: 'TUB-TUBES' },
];

async function syncProducts() {
  console.log('Starting product synchronization...');

  const productsToInsert = manualProductData.map(p => ({
    name: p.name,
    hsn_code: p.hsn_code,
    gst_percentage: p.gst_percentage,
    units: p.units,
    price: p.price,
    mrp_excl_gst: p.mrp_excl_gst,
    mrp_incl_gst: p.mrp_incl_gst,
    active: p.active,
    stock_quantity: p.stock_quantity,
    description: p.description,
    category: p.category,
    product_type: p.product_type,
    user_id: USER_ID
  }));

  // Using upsert to prevent duplicates. It will update existing products based on name or insert new ones.
  const { data, error } = await supabase
    .from('product_master')
    .upsert(productsToInsert, { onConflict: 'name, user_id' });

  if (error) {
    console.error('Error synchronizing products:', error.message);
  } else {
    console.log('--- Product Sync Complete ---');
    console.log(`✅ Successfully synchronized ${manualProductData.length} products.`);
  }
}

syncProducts();

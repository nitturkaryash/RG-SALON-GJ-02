import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Supabase configuration (service role required on server)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('🔧 Products API using Supabase credentials');
console.log('📡 URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to check authorization
const isAuthorized = (req: Request) => {
  // Add your authorization logic here
  // For now, we'll allow all requests
  return true;
};

// GET - Fetch products
export async function GET(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: products, error } = await supabase
      .from('product_master')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create new product with validation
export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
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
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 }
      );
    }

    if (!hsn_code) {
      return NextResponse.json(
        { success: false, error: 'HSN code is required' },
        { status: 400 }
      );
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
        return NextResponse.json(
          {
            success: false,
            error: `A product with the name "${name}" already exists`,
            existing_product: nameMatch,
          },
          { status: 409 }
        );
      }

      // Check for HSN code match
      const hsnMatch = existingProducts.find(
        product => product.hsn_code === hsn_code
      );

      if (hsnMatch) {
        return NextResponse.json(
          {
            success: false,
            error: `A product with the HSN code "${hsn_code}" already exists: ${hsnMatch.name}`,
            existing_product: hsnMatch,
          },
          { status: 409 }
        );
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

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, name, hsn_code, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check for duplicates if name or hsn_code is being updated
    if (name || hsn_code) {
      const { data: existingProducts, error: checkError } = await supabase
        .from('product_master')
        .select('id, name, hsn_code')
        .neq('id', id); // Exclude current product from check

      if (checkError) throw checkError;

      if (existingProducts && existingProducts.length > 0) {
        // Check for name conflict if name is being updated
        if (name) {
          const nameMatch = existingProducts.find(
            product => product.name.toLowerCase() === name.toLowerCase()
          );

          if (nameMatch) {
            return NextResponse.json(
              {
                success: false,
                error: `A product with the name "${name}" already exists`,
                existing_product: nameMatch,
              },
              { status: 409 }
            );
          }
        }

        // Check for HSN code conflict if hsn_code is being updated
        if (hsn_code) {
          const hsnMatch = existingProducts.find(
            product => product.hsn_code === hsn_code
          );

          if (hsnMatch) {
            return NextResponse.json(
              {
                success: false,
                error: `A product with the HSN code "${hsn_code}" already exists: ${hsnMatch.name}`,
                existing_product: hsnMatch,
              },
              { status: 409 }
            );
          }
        }
      }
    }

    // Add updated_at timestamp and include name/hsn_code if provided
    const finalUpdateData = {
      ...updateData,
      ...(name && { name }),
      ...(hsn_code && { hsn_code }),
      updated_at: new Date().toISOString(),
    };

    // Update the product
    const { data: updatedProduct, error: updateError } = await supabase
      .from('product_master')
      .update(finalUpdateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from('product_master')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

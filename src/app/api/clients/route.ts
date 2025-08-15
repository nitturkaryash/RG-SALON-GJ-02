import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { WhatsAppAutomation } from '@/whatsapp/business-api/utils/whatsappAutomation';
import { v4 as uuidv4 } from 'uuid';

// Supabase configuration (service role required on server)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('🔧 Clients API using NEW Supabase credentials');
console.log('📡 URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

function isAuthorized(req: Request): boolean {
  const expected = process.env.INTERNAL_API_KEY;
  const auth = req.headers.get('authorization') || '';
  return Boolean(expected) && auth === `Bearer ${expected}`;
}

// GET - Fetch clients
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: clients, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST - Create new client with auto WhatsApp welcome message
export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const {
      full_name,
      phone,
      email,
      notes,
      send_welcome = true
    } = body;

    if (!full_name) {
      return NextResponse.json(
        { success: false, error: 'Client name is required' },
        { status: 400 }
      );
    }

    const clientId = uuidv4();
    const now = new Date().toISOString();

    // Check if client already exists with same phone or email
    if (phone || email) {
      const { data: existingClients, error: checkError } = await supabase
        .from('clients')
        .select('id, full_name, phone, email')
        .or(`phone.eq.${phone || 'null'},email.eq.${email || 'null'}`);

      if (checkError) throw checkError;

      if (existingClients && existingClients.length > 0) {
        const existing = existingClients[0];
        return NextResponse.json(
          { 
            success: false, 
            error: `Client already exists: ${existing.full_name}`,
            existing_client: existing
          },
          { status: 409 }
        );
      }
    }

    // Create the client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        id: clientId,
        full_name,
        phone,
        email,
        notes,
        total_spent: 0,
        pending_payment: 0,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (clientError) throw clientError;

    // Send automatic welcome WhatsApp message
    let whatsappSent = false;
    if (phone && send_welcome) {
      try {
        whatsappSent = await WhatsAppAutomation.handleClientWelcome(full_name, phone);
      } catch (whatsappError) {
        console.error('WhatsApp welcome message error:', whatsappError);
        // Don't fail client creation if WhatsApp fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Client created successfully',
      client,
      whatsapp_welcome_sent: whatsappSent
    });

  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

// PUT - Update client
export async function PUT(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Update the client
    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: 'Client updated successfully',
      client: updatedClient
    });

  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE - Delete client
export async function DELETE(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Check if client has appointments or orders
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id')
      .eq('client_id', id)
      .limit(1);

    if (appointmentsError) throw appointmentsError;

    if (appointments && appointments.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete client with existing appointments. Please cancel or complete all appointments first.' 
        },
        { status: 400 }
      );
    }

    // Delete the client
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete client' },
      { status: 500 }
    );
  }
} 
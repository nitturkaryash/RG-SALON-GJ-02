import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://szxrqhhnqcfkqcsdlclp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6eHJxaGhucWNma3Fjc2RsY2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NDMyODksImV4cCI6MjA1MDAxOTI4OX0.kQQq_j3qrnXIVJepCcCaKRqJ2pJhxBDBvMRGKiZxjhE'
);

async function setupTrigger() {
  console.log('🔧 Setting up database trigger for automatic price tracking...');
  
  try {
    // Step 1: Create the function using direct SQL execution
    console.log('📝 Creating trigger function...');
    
    // Use the sql edge function approach
    const functionResult = await fetch('https://szxrqhhnqcfkqcsdlclp.supabase.co/rest/v1/rpc/sql', {
      method: 'POST',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6eHJxaGhucWNma3Fjc2RsY2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NDMyODksImV4cCI6MjA1MDAxOTI4OX0.kQQq_j3qrnXIVJepCcCaKRqJ2pJhxBDBvMRGKiZxjhE',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6eHJxaGhucWNma3Fjc2RsY2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NDMyODksImV4cCI6MjA1MDAxOTI4OX0.kQQq_j3qrnXIVJepCcCaKRqJ2pJhxBDBvMRGKiZxjhE',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
CREATE OR REPLACE FUNCTION handle_purchase_history_changes()
RETURNS TRIGGER AS $$
DECLARE
    old_mrp_incl_gst DECIMAL(10,2);
    old_mrp_excl_gst DECIMAL(10,2);
    old_gst_percentage DECIMAL(5,2);
    price_changed BOOLEAN := FALSE;
    operation_type TEXT;
BEGIN
    -- Determine operation type
    IF TG_OP = 'INSERT' THEN
        operation_type := 'purchase_history_add';
    ELSIF TG_OP = 'UPDATE' THEN
        operation_type := 'purchase_history_edit';
    ELSE
        operation_type := 'purchase_history_change';
    END IF;

    -- Get current product master values
    SELECT mrp_incl_gst, mrp_excl_gst, gst_percentage
    INTO old_mrp_incl_gst, old_mrp_excl_gst, old_gst_percentage
    FROM product_master 
    WHERE id = NEW.product_id;

    -- If product doesn't exist, skip processing
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;

    -- Check if any price-related field has changed
    price_changed := (
        (NEW.mrp_incl_gst IS DISTINCT FROM old_mrp_incl_gst) OR
        (NEW.mrp_excl_gst IS DISTINCT FROM old_mrp_excl_gst) OR
        (NEW.gst_percentage IS DISTINCT FROM old_gst_percentage)
    );

    -- Update product master if prices changed
    IF price_changed THEN
        UPDATE product_master 
        SET 
            mrp_incl_gst = COALESCE(NEW.mrp_incl_gst, mrp_incl_gst),
            mrp_excl_gst = COALESCE(NEW.mrp_excl_gst, mrp_excl_gst),
            gst_percentage = COALESCE(NEW.gst_percentage, gst_percentage),
            price = COALESCE(NEW.mrp_excl_gst, mrp_excl_gst),
            updated_at = NOW()
        WHERE id = NEW.product_id;

        -- Log the price change to product_price_history
        INSERT INTO product_price_history (
            product_id, changed_at, old_mrp_incl_gst, new_mrp_incl_gst,
            old_mrp_excl_gst, new_mrp_excl_gst, old_gst_percentage, new_gst_percentage,
            source_of_change, reference_id, notes
        ) VALUES (
            NEW.product_id, NOW(),
            COALESCE(old_mrp_incl_gst, 0), COALESCE(NEW.mrp_incl_gst, 0),
            COALESCE(old_mrp_excl_gst, 0), COALESCE(NEW.mrp_excl_gst, 0),
            COALESCE(old_gst_percentage, 0), COALESCE(NEW.gst_percentage, 0),
            operation_type, NEW.purchase_id,
            FORMAT('Auto-trigger: %s via %s', NEW.product_name, operation_type)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;`
      })
    });

    if (!functionResult.ok) {
      console.error('❌ Function creation failed');
      return;
    }
    console.log('✅ Trigger function created successfully');

    // Step 2: Create the trigger
    console.log('🔄 Creating trigger...');
    const triggerResult = await fetch('https://szxrqhhnqcfkqcsdlclp.supabase.co/rest/v1/rpc/sql', {
      method: 'POST',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6eHJxaGhucWNma3Fjc2RsY2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NDMyODksImV4cCI6MjA1MDAxOTI4OX0.kQQq_j3qrnXIVJepCcCaKRqJ2pJhxBDBvMRGKiZxjhE',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6eHJxaGhucWNma3Fjc2RsY2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NDMyODksImV4cCI6MjA1MDAxOTI4OX0.kQQq_j3qrnXIVJepCcCaKRqJ2pJhxBDBvMRGKiZxjhE',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
DROP TRIGGER IF EXISTS trg_purchase_history_changes ON purchase_history_with_stock;

CREATE TRIGGER trg_purchase_history_changes
    AFTER INSERT OR UPDATE ON purchase_history_with_stock
    FOR EACH ROW
    EXECUTE FUNCTION handle_purchase_history_changes();`
      })
    });

    if (!triggerResult.ok) {
      console.error('❌ Trigger creation failed');
      return;
    }
    console.log('✅ Trigger created successfully');

    // Step 3: Test the trigger
    console.log('🧪 Testing trigger with sample data...');
    const testData = {
      purchase_id: 'test-trigger-' + Date.now(),
      product_id: 'b30a47dd-4d9a-402c-b454-a2c9d5490bd0', // test product
      date: new Date().toISOString(),
      product_name: 'test',
      purchase_qty: 1,
      mrp_incl_gst: 666.66, // Different price to trigger change
      mrp_excl_gst: 565.22,
      gst_percentage: 18,
      purchase_invoice_number: 'TRIGGER-TEST',
      supplier: 'Test Trigger',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('purchase_history_with_stock')
      .insert(testData);

    if (insertError) {
      console.error('❌ Trigger test failed:', insertError);
      return;
    }

    console.log('✅ Test purchase inserted');

    // Wait a moment for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if price history was created
    const { data: priceHistory, error: historyError } = await supabase
      .from('product_price_history')
      .select('*')
      .eq('reference_id', testData.purchase_id)
      .single();

    if (historyError || !priceHistory) {
      console.log('❌ Trigger did not create price history');
      console.log('History error:', historyError);
    } else {
      console.log('✅ Trigger working! Price history created:');
      console.log(`   Old Price: ₹${priceHistory.old_mrp_incl_gst}`);
      console.log(`   New Price: ₹${priceHistory.new_mrp_incl_gst}`);
      console.log(`   Source: ${priceHistory.source_of_change}`);
    }

    // Clean up test data
    await supabase
      .from('purchase_history_with_stock')
      .delete()
      .eq('purchase_id', testData.purchase_id);

    await supabase
      .from('product_price_history')
      .delete()
      .eq('reference_id', testData.purchase_id);

    console.log('🧹 Test data cleaned up');

    console.log('\n🎉 Database trigger setup complete!');
    console.log('\n📱 What happens now:');
    console.log('  • Any purchase insert/update will automatically:');
    console.log('    ✓ Update product master prices if changed');
    console.log('    ✓ Log price changes to product_price_history');
    console.log('    ✓ Track GST inclusive/exclusive prices');
    console.log('    ✓ Reference the purchase transaction');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupTrigger(); 
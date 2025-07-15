import json
import time
import sys
from datetime import datetime

# Configuration
PROJECT_ID = "mtyudylsozncvilibxda"
USER_ID = "3f4b718f-70cb-4873-a62c-b8806a92e25b"
TENANT_ID = "3f4b718f-70cb-4873-a62c-b8806a92e25b"
BATCH_SIZE = 10
DELAY_BETWEEN_BATCHES = 1  # seconds

def load_invoice_data():
    """Load the processed invoice data"""
    try:
        with open('processed_invoices.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data['mergedInvoices']
    except FileNotFoundError:
        print("❌ Error: processed_invoices.json not found!")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON: {e}")
        sys.exit(1)

def escape_sql_string(text):
    """Escape single quotes in SQL strings"""
    if text is None:
        return "NULL"
    return f"'{str(text).replace(\"'\", \"''\")}'"

def format_payment_methods(payment_methods):
    """Format payment methods as JSON array"""
    methods = []
    for pm in payment_methods:
        method_name = pm['method'].split('(')[0]  # Remove amount from method name
        methods.append({
            "method": method_name,
            "amount": pm['amount']
        })
    return json.dumps(methods)

def create_insert_statement(invoice):
    """Create a single INSERT statement for an invoice"""
    
    # Format services JSON
    services_json = json.dumps(invoice['services']).replace("'", "''")
    
    # Format payments JSON
    payments_json = format_payment_methods(invoice['paymentMethods']).replace("'", "''")
    
    # Create payment method display string
    payment_display = invoice['paymentDisplay']
    
    # Format date
    date_str = invoice['date']
    
    sql = f"""INSERT INTO pos_orders (
    id,
    created_at,
    date,
    client_name,
    customer_name,
    total_amount,
    total,
    subtotal,
    tax,
    discount,
    payment_method,
    payments,
    services,
    stylist_name,
    status,
    type,
    user_id,
    tenant_id
) VALUES (
    gen_random_uuid(),
    '{date_str}'::timestamptz,
    '{date_str}'::timestamptz,
    {escape_sql_string(invoice['clientName'])},
    {escape_sql_string(invoice['clientName'])},
    {invoice['totalAmount']},
    {invoice['totalAmount']},
    {invoice['subtotal']},
    {invoice['tax']},
    {invoice.get('discount', 0)},
    {escape_sql_string(payment_display)},
    '{payments_json}'::jsonb,
    '{services_json}'::jsonb,
    {escape_sql_string(invoice['stylistName'])},
    'completed',
    'sale',
    '{USER_ID}'::uuid,
    '{TENANT_ID}'::uuid
);"""
    
    return sql

def create_batch_files(invoices):
    """Create batch SQL files for import"""
    print(f"📝 Creating batch files for {len(invoices)} invoices...")
    
    batch_files = []
    
    for i in range(0, len(invoices), BATCH_SIZE):
        batch_num = (i // BATCH_SIZE) + 1
        batch_invoices = invoices[i:i + BATCH_SIZE]
        
        filename = f"batch_{batch_num:03d}_invoices_{i+1}_to_{min(i+BATCH_SIZE, len(invoices))}.sql"
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"-- Batch {batch_num}: Invoices {i+1} to {min(i+BATCH_SIZE, len(invoices))}\n")
            f.write(f"-- Total invoices in batch: {len(batch_invoices)}\n\n")
            
            for invoice in batch_invoices:
                f.write(create_insert_statement(invoice))
                f.write("\n\n")
        
        batch_files.append(filename)
        print(f"✅ Created {filename} ({len(batch_invoices)} invoices)")
    
    return batch_files

def create_mcp_import_script(batch_files):
    """Create a script that shows MCP commands to run"""
    
    script_content = f'''# MCP Supabase Import Commands
# Run these commands in sequence to import all data

# 1. First, disable triggers (run once)
mcp_supabase_execute_sql({{
    "project_id": "{PROJECT_ID}",
    "query": "ALTER TABLE pos_orders DISABLE TRIGGER handle_pos_orders_user_id_trigger; ALTER TABLE pos_orders DISABLE TRIGGER set_tenant_id_pos_orders;"
}})

# 2. Clear existing data (optional - run if you want to start fresh)
mcp_supabase_execute_sql({{
    "project_id": "{PROJECT_ID}",
    "query": "DELETE FROM pos_orders WHERE user_id = '{USER_ID}' AND date >= '2025-03-31'::date;"
}})

# 3. Import batches (run each batch command)
'''
    
    for i, batch_file in enumerate(batch_files, 1):
        script_content += f'''
# Batch {i}: {batch_file}
# Read the file content and execute:
with open('{batch_file}', 'r', encoding='utf-8') as f:
    batch_sql = f.read()
    
mcp_supabase_execute_sql({{
    "project_id": "{PROJECT_ID}",
    "query": batch_sql
}})

# Check progress after batch {i}
mcp_supabase_execute_sql({{
    "project_id": "{PROJECT_ID}",
    "query": "SELECT COUNT(*) as imported_count, SUM(total_amount) as total_revenue FROM pos_orders WHERE user_id = '{USER_ID}';"
}})
'''
    
    script_content += f'''
# 4. Final verification
mcp_supabase_execute_sql({{
    "project_id": "{PROJECT_ID}",
    "query": """
    SELECT 
        COUNT(*) as total_imported,
        SUM(total_amount) as total_revenue,
        COUNT(DISTINCT client_name) as unique_clients,
        COUNT(DISTINCT stylist_name) as unique_stylists,
        MIN(date) as earliest_date,
        MAX(date) as latest_date
    FROM pos_orders 
    WHERE user_id = '{USER_ID}';
    """
}})

# 5. Re-enable triggers (run once at the end)
mcp_supabase_execute_sql({{
    "project_id": "{PROJECT_ID}",
    "query": "ALTER TABLE pos_orders ENABLE TRIGGER handle_pos_orders_user_id_trigger; ALTER TABLE pos_orders ENABLE TRIGGER set_tenant_id_pos_orders;"
}})
'''
    
    with open('mcp_import_commands.txt', 'w', encoding='utf-8') as f:
        f.write(script_content)
    
    print("✅ Created mcp_import_commands.txt with all MCP commands")

def create_single_sql_file(invoices):
    """Create a single SQL file with all data"""
    print(f"📝 Creating single SQL file for all {len(invoices)} invoices...")
    
    with open('import_all_invoices_complete.sql', 'w', encoding='utf-8') as f:
        f.write(f"-- Complete import of {len(invoices)} invoices from SERVICE APRIL-2025.xlsx\n")
        f.write(f"-- Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"-- Total expected revenue: ₹{sum(inv['totalAmount'] for inv in invoices):,.2f}\n\n")
        
        f.write("-- Disable triggers for bulk import\n")
        f.write("ALTER TABLE pos_orders DISABLE TRIGGER handle_pos_orders_user_id_trigger;\n")
        f.write("ALTER TABLE pos_orders DISABLE TRIGGER set_tenant_id_pos_orders;\n\n")
        
        f.write("-- Clear existing data (optional)\n")
        f.write(f"-- DELETE FROM pos_orders WHERE user_id = '{USER_ID}' AND date >= '2025-03-31'::date;\n\n")
        
        f.write("-- Begin transaction\n")
        f.write("BEGIN;\n\n")
        
        for i, invoice in enumerate(invoices, 1):
            f.write(f"-- Invoice {i}: {invoice['clientName']} - {invoice['paymentDisplay']}\n")
            f.write(create_insert_statement(invoice))
            f.write("\n")
        
        f.write("\n-- Commit transaction\n")
        f.write("COMMIT;\n\n")
        
        f.write("-- Re-enable triggers\n")
        f.write("ALTER TABLE pos_orders ENABLE TRIGGER handle_pos_orders_user_id_trigger;\n")
        f.write("ALTER TABLE pos_orders ENABLE TRIGGER set_tenant_id_pos_orders;\n\n")
        
        f.write("-- Verify import\n")
        f.write(f"""SELECT 
    COUNT(*) as total_imported,
    SUM(total_amount) as total_revenue,
    COUNT(DISTINCT client_name) as unique_clients,
    COUNT(DISTINCT stylist_name) as unique_stylists,
    MIN(date) as earliest_date,
    MAX(date) as latest_date
FROM pos_orders 
WHERE user_id = '{USER_ID}';""")
    
    print("✅ Created import_all_invoices_complete.sql")

def main():
    print("🚀 Starting Excel Data Import Script")
    print("=" * 50)
    
    # Load data
    invoices = load_invoice_data()
    print(f"📊 Loaded {len(invoices)} processed invoices")
    
    # Calculate summary
    total_revenue = sum(inv['totalAmount'] for inv in invoices)
    unique_clients = len(set(inv['clientName'] for inv in invoices))
    unique_stylists = len(set(inv['stylistName'] for inv in invoices))
    
    print(f"💰 Total Revenue: ₹{total_revenue:,.2f}")
    print(f"👥 Unique Clients: {unique_clients}")
    print(f"✂️ Unique Stylists: {unique_stylists}")
    print()
    
    # Create batch files
    batch_files = create_batch_files(invoices)
    print(f"📁 Created {len(batch_files)} batch files")
    print()
    
    # Create MCP command script
    create_mcp_import_script(batch_files)
    print()
    
    # Create single SQL file
    create_single_sql_file(invoices)
    print()
    
    print("✅ All files created successfully!")
    print("\n🎯 Next Steps:")
    print("1. Use the MCP commands from 'mcp_import_commands.txt'")
    print("2. Or execute 'import_all_invoices_complete.sql' directly in Supabase")
    print("3. Monitor progress and verify data integrity")
    print("\n📊 Expected Final Results:")
    print(f"   - Total Records: {len(invoices)}")
    print(f"   - Total Revenue: ₹{total_revenue:,.2f}")
    print(f"   - Unique Clients: {unique_clients}")
    print(f"   - Unique Stylists: {unique_stylists}")

if __name__ == "__main__":
    main() 
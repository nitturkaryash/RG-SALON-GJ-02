#!/usr/bin/env python3
"""
Script to import all Excel data using MCP Supabase tools
This script will import all 376 invoices in batches
"""

import json
import os
import time
from pathlib import Path

# Configuration
PROJECT_ID = "mtyudylsozncvilibxda"
USER_ID = "3f4b718f-70cb-4873-a62c-b8806a92e25b"
BATCH_SIZE = 5  # Smaller batches to avoid MCP limits
DELAY_BETWEEN_BATCHES = 2  # seconds

def load_processed_data():
    """Load the processed invoice data"""
    try:
        with open('processed_invoices.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data['mergedInvoices']
    except FileNotFoundError:
        print("❌ Error: processed_invoices.json not found!")
        return None

def create_batch_import_commands():
    """Create MCP commands for importing all data"""
    
    invoices = load_processed_data()
    if not invoices:
        return
    
    print(f"🚀 Creating MCP import commands for {len(invoices)} invoices")
    print(f"💰 Total Revenue: ₹{sum(inv['totalAmount'] for inv in invoices):,.2f}")
    
    # Create the import commands
    commands = []
    
    # 1. First command: Get current status
    commands.append({
        "description": "Check current import status",
        "mcp_call": {
            "tool": "mcp_supabase_execute_sql",
            "args": {
                "project_id": PROJECT_ID,
                "query": f"""
                SELECT 
                    COUNT(*) as current_count,
                    COALESCE(SUM(total_amount), 0) as current_revenue
                FROM pos_orders 
                WHERE user_id = '{USER_ID}';
                """
            }
        }
    })
    
    # 2. Import in batches
    for i in range(0, len(invoices), BATCH_SIZE):
        batch_num = (i // BATCH_SIZE) + 1
        batch_invoices = invoices[i:i + BATCH_SIZE]
        
        # Create VALUES clause for batch
        values_list = []
        for invoice in batch_invoices:
            # Format services and payments JSON
            services_json = json.dumps(invoice['services']).replace("'", "''")
            payments_json = json.dumps([{
                "method": pm['method'].split('(')[0],
                "amount": pm['amount']
            } for pm in invoice['paymentMethods']]).replace("'", "''")
            
            payment_display = invoice.get('paymentMethodDisplay', 'cash')
            
            values_list.append(f"""(
                gen_random_uuid(),
                '{invoice['date']}'::timestamptz,
                '{invoice['date']}'::timestamptz,
                '{invoice['clientName'].replace("'", "''")}',
                '{invoice['clientName'].replace("'", "''")}',
                {invoice['totalAmount']},
                {invoice['totalAmount']},
                {invoice.get('totalSubtotal', invoice['totalAmount'])},
                {invoice.get('totalTax', 0)},
                {invoice.get('totalDiscount', 0)},
                '{payment_display.replace("'", "''")}',
                '{payments_json}'::jsonb,
                '{services_json}'::jsonb,
                '{invoice.get('primaryStylist', 'Unknown').replace("'", "''")}',
                'completed',
                'sale',
                '{USER_ID}'::uuid,
                '{USER_ID}'::uuid
            )""")
        
        batch_query = f"""
        INSERT INTO pos_orders (
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
        ) VALUES {','.join(values_list)};
        """
        
        commands.append({
            "description": f"Import batch {batch_num}: invoices {i+1}-{min(i+BATCH_SIZE, len(invoices))}",
            "batch_info": {
                "batch_num": batch_num,
                "start_invoice": i+1,
                "end_invoice": min(i+BATCH_SIZE, len(invoices)),
                "invoice_count": len(batch_invoices),
                "batch_revenue": sum(inv['totalAmount'] for inv in batch_invoices)
            },
            "mcp_call": {
                "tool": "mcp_supabase_execute_sql",
                "args": {
                    "project_id": PROJECT_ID,
                    "query": batch_query
                }
            }
        })
        
        # Add progress check after each batch
        commands.append({
            "description": f"Check progress after batch {batch_num}",
            "mcp_call": {
                "tool": "mcp_supabase_execute_sql",
                "args": {
                    "project_id": PROJECT_ID,
                    "query": f"""
                    SELECT 
                        COUNT(*) as total_imported,
                        SUM(total_amount) as total_revenue,
                        COUNT(DISTINCT client_name) as unique_clients,
                        COUNT(DISTINCT stylist_name) as unique_stylists
                    FROM pos_orders 
                    WHERE user_id = '{USER_ID}';
                    """
                }
            }
        })
    
    # 3. Final verification
    commands.append({
        "description": "Final verification and summary",
        "mcp_call": {
            "tool": "mcp_supabase_execute_sql",
            "args": {
                "project_id": PROJECT_ID,
                "query": f"""
                SELECT 
                    COUNT(*) as total_imported,
                    SUM(total_amount) as total_revenue,
                    COUNT(DISTINCT client_name) as unique_clients,
                    COUNT(DISTINCT stylist_name) as unique_stylists,
                    MIN(date) as earliest_date,
                    MAX(date) as latest_date,
                    -- Sample payment methods
                    array_agg(DISTINCT payment_method ORDER BY payment_method) FILTER (WHERE payment_method IS NOT NULL) as sample_payment_methods
                FROM pos_orders 
                WHERE user_id = '{USER_ID}';
                """
            }
        }
    })
    
    # Save commands to file
    with open('mcp_import_commands.json', 'w', encoding='utf-8') as f:
        json.dump(commands, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Created {len(commands)} MCP commands")
    print(f"📁 Saved to: mcp_import_commands.json")
    print(f"📊 Expected results:")
    print(f"   - Total invoices: {len(invoices)}")
    print(f"   - Total revenue: ₹{sum(inv['totalAmount'] for inv in invoices):,.2f}")
    print(f"   - Unique clients: {len(set(inv['clientName'] for inv in invoices))}")
    print(f"   - Batches: {len([cmd for cmd in commands if 'batch_info' in cmd])}")
    
    return commands

def create_manual_import_script():
    """Create a manual script for importing remaining data"""
    
    invoices = load_processed_data()
    if not invoices:
        return
    
    # Skip first 3 invoices (already imported)
    remaining_invoices = invoices[3:]
    
    print(f"\n📝 Creating manual import script for {len(remaining_invoices)} remaining invoices...")
    
    script_content = f"""-- Manual import script for remaining {len(remaining_invoices)} invoices
-- Already imported: 3 invoices
-- Remaining: {len(remaining_invoices)} invoices
-- Total expected additional revenue: ₹{sum(inv['totalAmount'] for inv in remaining_invoices):,.2f}

-- Check current status
SELECT 
    COUNT(*) as current_count,
    SUM(total_amount) as current_revenue
FROM pos_orders 
WHERE user_id = '{USER_ID}';

-- Import remaining invoices in batches
"""
    
    for i in range(0, len(remaining_invoices), BATCH_SIZE):
        batch_num = (i // BATCH_SIZE) + 1
        batch_invoices = remaining_invoices[i:i + BATCH_SIZE]
        
        script_content += f"\n-- Batch {batch_num}: Invoices {i+4}-{min(i+BATCH_SIZE+3, len(invoices))} ({len(batch_invoices)} invoices)\n"
        script_content += "INSERT INTO pos_orders (\n"
        script_content += "    id, created_at, date, client_name, customer_name, total_amount, total,\n"
        script_content += "    subtotal, tax, discount, payment_method, payments, services, stylist_name,\n"
        script_content += "    status, type, user_id, tenant_id\n"
        script_content += ") VALUES\n"
        
        values_list = []
        for invoice in batch_invoices:
            services_json = json.dumps(invoice['services']).replace("'", "''")
            payments_json = json.dumps([{
                "method": pm['method'].split('(')[0],
                "amount": pm['amount']
            } for pm in invoice['paymentMethods']]).replace("'", "''")
            
            payment_display = invoice.get('paymentMethodDisplay', 'cash')
            
            values_list.append(f"""(
    gen_random_uuid(),
    '{invoice['date']}'::timestamptz,
    '{invoice['date']}'::timestamptz,
    '{invoice['clientName'].replace("'", "''")}',
    '{invoice['clientName'].replace("'", "''")}',
    {invoice['totalAmount']},
    {invoice['totalAmount']},
    {invoice.get('totalSubtotal', invoice['totalAmount'])},
    {invoice.get('totalTax', 0)},
    {invoice.get('totalDiscount', 0)},
    '{payment_display.replace("'", "''")}',
    '{payments_json}'::jsonb,
    '{services_json}'::jsonb,
    '{invoice.get('primaryStylist', 'Unknown').replace("'", "''")}',
    'completed',
    'sale',
    '{USER_ID}'::uuid,
    '{USER_ID}'::uuid
)""")
        
        script_content += ',\n'.join(values_list) + ";\n"
        
        # Add progress check
        script_content += f"\n-- Check progress after batch {batch_num}\n"
        script_content += f"""SELECT 
    COUNT(*) as total_imported,
    SUM(total_amount) as total_revenue
FROM pos_orders 
WHERE user_id = '{USER_ID}';

"""
    
    # Add final verification
    script_content += f"""
-- Final verification
SELECT 
    COUNT(*) as total_imported,
    SUM(total_amount) as total_revenue,
    COUNT(DISTINCT client_name) as unique_clients,
    COUNT(DISTINCT stylist_name) as unique_stylists,
    MIN(date) as earliest_date,
    MAX(date) as latest_date
FROM pos_orders 
WHERE user_id = '{USER_ID}';

-- Sample of payment methods
SELECT DISTINCT payment_method 
FROM pos_orders 
WHERE user_id = '{USER_ID}' 
ORDER BY payment_method 
LIMIT 10;
"""
    
    with open('import_remaining_data.sql', 'w', encoding='utf-8') as f:
        f.write(script_content)
    
    print(f"✅ Created import_remaining_data.sql")
    print(f"📊 This will import {len(remaining_invoices)} remaining invoices")

def main():
    print("🚀 Excel Data Import - MCP Command Generator")
    print("=" * 60)
    
    # Create MCP commands
    commands = create_batch_import_commands()
    
    # Create manual script
    create_manual_import_script()
    
    print("\n🎯 Next Steps:")
    print("1. Use the MCP commands from 'mcp_import_commands.json'")
    print("2. Or execute 'import_remaining_data.sql' manually")
    print("3. Monitor progress after each batch")
    print("\n✅ Ready to import all data!")

if __name__ == "__main__":
    main() 
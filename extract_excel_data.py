#!/usr/bin/env python3
"""
Excel Data Extraction Script for POS Orders Import
This script reads the SERVICE APRIL-2025.xlsx file and converts it to SQL format
"""

import pandas as pd
import json
from datetime import datetime
import uuid

def extract_excel_data(file_path):
    """Extract data from Excel file and convert to SQL format"""
    
    try:
        # Read the Excel file
        df = pd.read_excel(file_path)
        
        print(f"Excel file loaded successfully!")
        print(f"Columns found: {list(df.columns)}")
        print(f"Total rows: {len(df)}")
        print(f"First few rows:")
        print(df.head())
        
        # Save the data structure for analysis
        with open('excel_data_structure.txt', 'w') as f:
            f.write("Excel Data Structure Analysis\n")
            f.write("=" * 50 + "\n\n")
            f.write(f"File: {file_path}\n")
            f.write(f"Total rows: {len(df)}\n")
            f.write(f"Total columns: {len(df.columns)}\n\n")
            f.write("Columns:\n")
            for i, col in enumerate(df.columns):
                f.write(f"{i+1}. {col}\n")
            f.write("\n" + "=" * 50 + "\n")
            f.write("Sample Data (first 10 rows):\n")
            f.write(df.head(10).to_string())
            f.write("\n\n" + "=" * 50 + "\n")
            f.write("Data Info:\n")
            f.write(str(df.info()))
        
        # Convert to SQL format
        sql_statements = []
        
        # Assuming the Excel has columns like: Date, Invoice, Client, Phone, Stylist, Service, Price, etc.
        # We'll need to adapt this based on the actual structure
        
        # Group by invoice number if available
        if 'Invoice' in df.columns or 'invoice' in df.columns or 'INVOICE' in df.columns:
            invoice_col = next((col for col in df.columns if 'invoice' in col.lower()), None)
            if invoice_col:
                grouped = df.groupby(invoice_col)
                
                for invoice_num, group in grouped:
                    # Process each invoice group
                    services_data = []
                    
                    for _, row in group.iterrows():
                        # Extract service data from each row
                        service_data = {
                            'service_name': str(row.get('Service', row.get('service', 'Unknown Service'))),
                            'price': float(row.get('Price', row.get('price', 0))),
                            'quantity': int(row.get('Quantity', row.get('quantity', 1))),
                            'discount_percent': float(row.get('Discount', row.get('discount', 0))),
                            'tax_percent': float(row.get('Tax', row.get('tax', 18))),
                        }
                        services_data.append(service_data)
                    
                    # Create SQL statement for this invoice
                    invoice_date = group.iloc[0].get('Date', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
                    client_name = str(group.iloc[0].get('Client', group.iloc[0].get('client', 'Unknown Client')))
                    client_phone = str(group.iloc[0].get('Phone', group.iloc[0].get('phone', '0000000000')))
                    stylist_name = str(group.iloc[0].get('Stylist', group.iloc[0].get('stylist', 'Unknown Stylist')))
                    payment_method = str(group.iloc[0].get('Payment', group.iloc[0].get('payment', 'cash')))
                    
                    # Generate SQL for each service in the invoice
                    for service in services_data:
                        sql_line = f"('{invoice_num}', '{invoice_date}', '{client_name}', '{client_phone}', '{stylist_name}', '{service['service_name']}', {service['price']}, {service['quantity']}, {service['discount_percent']}, {service['tax_percent']}, '{payment_method}')"
                        sql_statements.append(sql_line)
        
        else:
            # If no invoice column, treat each row as a separate transaction
            for index, row in df.iterrows():
                invoice_num = f"INV-{index+1:04d}"
                invoice_date = str(row.get('Date', datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
                client_name = str(row.get('Client', row.get('client', f'Client {index+1}')))
                client_phone = str(row.get('Phone', row.get('phone', f'000000{index+1:04d}')))
                stylist_name = str(row.get('Stylist', row.get('stylist', 'Default Stylist')))
                service_name = str(row.get('Service', row.get('service', 'Unknown Service')))
                service_price = float(row.get('Price', row.get('price', 0)))
                quantity = int(row.get('Quantity', row.get('quantity', 1)))
                discount_percent = float(row.get('Discount', row.get('discount', 0)))
                tax_percent = float(row.get('Tax', row.get('tax', 18)))
                payment_method = str(row.get('Payment', row.get('payment', 'cash')))
                
                sql_line = f"('{invoice_num}', '{invoice_date}', '{client_name}', '{client_phone}', '{stylist_name}', '{service_name}', {service_price}, {quantity}, {discount_percent}, {tax_percent}, '{payment_method}')"
                sql_statements.append(sql_line)
        
        # Generate the final SQL file
        sql_content = f"""-- Auto-generated SQL from {file_path}
-- Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
-- Total records: {len(sql_statements)}

-- Final POS Orders Import with Extracted Data
WITH raw_data AS (
    SELECT * FROM (VALUES
        {',\\n        '.join(sql_statements)}
    ) AS t(invoice_number, date_time, client_name, client_phone, stylist_name, service_name, service_price, quantity, discount_percent, tax_percent, payment_method)
),

-- Create missing clients
clients_to_create AS (
    INSERT INTO clients (full_name, mobile_number, phone, user_id, created_at, updated_at)
    SELECT DISTINCT 
        client_name, 
        client_phone, 
        client_phone, 
        '3f4b718f-70cb-4873-a62c-b8806a92e25b', 
        NOW(), 
        NOW()
    FROM raw_data
    WHERE NOT EXISTS (
        SELECT 1 FROM clients 
        WHERE mobile_number = raw_data.client_phone 
        AND user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
    )
    RETURNING id, full_name, mobile_number
),

-- Create missing stylists
stylists_to_create AS (
    INSERT INTO stylists (name, user_id, available, created_at, updated_at)
    SELECT DISTINCT 
        stylist_name, 
        '3f4b718f-70cb-4873-a62c-b8806a92e25b', 
        true, 
        NOW(), 
        NOW()
    FROM raw_data
    WHERE NOT EXISTS (
        SELECT 1 FROM stylists 
        WHERE name = raw_data.stylist_name 
        AND user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
    )
    RETURNING id, name
),

-- Create missing services
services_to_create AS (
    INSERT INTO services (name, price, duration, type, active, user_id, created_at, updated_at)
    SELECT DISTINCT 
        service_name, 
        service_price, 
        60, -- default duration
        'service', 
        true, 
        '3f4b718f-70cb-4873-a62c-b8806a92e25b', 
        NOW(), 
        NOW()
    FROM raw_data
    WHERE NOT EXISTS (
        SELECT 1 FROM services 
        WHERE name = raw_data.service_name 
        AND user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
    )
    RETURNING id, name, price
),

-- Group data by invoice
invoice_data AS (
    SELECT 
        invoice_number,
        date_time::timestamp,
        client_name,
        client_phone,
        stylist_name,
        payment_method,
        jsonb_agg(
            jsonb_build_object(
                'service_name', service_name,
                'price', service_price,
                'quantity', quantity,
                'discount_percent', discount_percent,
                'tax_percent', tax_percent,
                'subtotal', service_price * quantity,
                'discount', (service_price * quantity) * (discount_percent / 100),
                'taxable', (service_price * quantity) * (1 - discount_percent / 100),
                'tax', (service_price * quantity) * (1 - discount_percent / 100) * (tax_percent / 100),
                'total', (service_price * quantity) * (1 - discount_percent / 100) * (1 + tax_percent / 100)
            )
        ) as services_data,
        SUM(service_price * quantity) as subtotal,
        SUM((service_price * quantity) * (discount_percent / 100)) as total_discount,
        SUM((service_price * quantity) * (1 - discount_percent / 100) * (tax_percent / 100)) as total_tax,
        SUM((service_price * quantity) * (1 - discount_percent / 100) * (1 + tax_percent / 100)) as total_amount
    FROM raw_data
    GROUP BY invoice_number, date_time, client_name, client_phone, stylist_name, payment_method
),

-- Create services JSON with proper IDs
final_invoice_data AS (
    SELECT 
        i.*,
        jsonb_agg(
            jsonb_build_object(
                'id', s.id,
                'service_id', s.id,
                'service_name', (service_item.value->>'service_name'),
                'type', 'service',
                'price', (service_item.value->>'price')::numeric,
                'quantity', (service_item.value->>'quantity')::integer,
                'duration', 60,
                'subtotal', (service_item.value->>'subtotal')::numeric,
                'discount', (service_item.value->>'discount')::numeric,
                'tax', (service_item.value->>'tax')::numeric,
                'total', (service_item.value->>'total')::numeric,
                'gst_percentage', (service_item.value->>'tax_percent')::numeric,
                'unit_price', (service_item.value->>'price')::numeric
            )
        ) as services_json
    FROM invoice_data i
    CROSS JOIN LATERAL jsonb_array_elements(i.services_data) as service_item(value)
    LEFT JOIN services s ON s.name = (service_item.value->>'service_name') 
        AND s.user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
    GROUP BY i.invoice_number, i.date_time, i.client_name, i.client_phone, i.stylist_name, 
             i.payment_method, i.subtotal, i.total_discount, i.total_tax, i.total_amount
)

-- Insert POS orders
INSERT INTO pos_orders (
    date,
    client_name,
    stylist_name,
    services,
    subtotal,
    tax,
    discount,
    total,
    payment_method,
    status,
    type,
    user_id,
    created_at
)
SELECT 
    date_time,
    client_name,
    stylist_name,
    services_json,
    subtotal,
    total_tax,
    total_discount,
    total_amount,
    payment_method,
    'completed',
    'sale',
    '3f4b718f-70cb-4873-a62c-b8806a92e25b',
    date_time
FROM final_invoice_data
WHERE NOT EXISTS (
    SELECT 1 FROM pos_orders po
    WHERE po.client_name = final_invoice_data.client_name
    AND po.stylist_name = final_invoice_data.stylist_name
    AND po.date::date = final_invoice_data.date_time::date
    AND po.user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
);

-- Show import summary
SELECT 
    COUNT(*) as total_orders_imported,
    COUNT(DISTINCT client_name) as unique_clients,
    COUNT(DISTINCT stylist_name) as unique_stylists,
    SUM(total) as total_revenue
FROM pos_orders 
WHERE user_id = '3f4b718f-70cb-4873-a62c-b8806a92e25b'
AND created_at >= NOW() - INTERVAL '1 hour';
"""
        
        # Write the SQL file
        with open('import_april_services.sql', 'w', encoding='utf-8') as f:
            f.write(sql_content)
        
        print(f"\\nSQL file generated: import_april_services.sql")
        print(f"Total SQL statements: {len(sql_statements)}")
        
        return sql_statements
        
    except Exception as e:
        print(f"Error processing Excel file: {str(e)}")
        return []

if __name__ == "__main__":
    file_path = "SHEETS/SERVICE APRIL-2025.xlsx"
    extract_excel_data(file_path) 
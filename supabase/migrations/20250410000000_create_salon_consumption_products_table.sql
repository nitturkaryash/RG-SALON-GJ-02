-- Create the salon_consumption_products table for tracking salon's internal product usage
CREATE TABLE IF NOT EXISTS "public"."salon_consumption_products" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "Requisition Voucher No." TEXT NOT NULL,
  "order_id" UUID,
  "Date" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "Product Name" TEXT NOT NULL,
  "Consumption Qty." INTEGER NOT NULL,
  "Purchase Cost per Unit (Ex. GST) (Rs.)" NUMERIC(10,2) NOT NULL,
  "Purchase GST Percentage" NUMERIC(5,2) NOT NULL,
  "Purchase Taxable Value (Rs.)" NUMERIC(10,2) NOT NULL,
  "Purchase IGST (Rs.)" NUMERIC(10,2) DEFAULT 0,
  "Purchase CGST (Rs.)" NUMERIC(10,2) DEFAULT 0,
  "Purchase SGST (Rs.)" NUMERIC(10,2) DEFAULT 0,
  "Total Purchase Cost (Rs.)" NUMERIC(10,2) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_salon_consumption_products_date ON "public"."salon_consumption_products"("Date");
CREATE INDEX IF NOT EXISTS idx_salon_consumption_products_voucher ON "public"."salon_consumption_products"("Requisition Voucher No.");
CREATE INDEX IF NOT EXISTS idx_salon_consumption_products_product ON "public"."salon_consumption_products"("Product Name");

-- Insert sample data
INSERT INTO "public"."salon_consumption_products" (
  "Requisition Voucher No.",
  "order_id",
  "Date",
  "Product Name",
  "Consumption Qty.",
  "Purchase Cost per Unit (Ex. GST) (Rs.)",
  "Purchase GST Percentage",
  "Purchase Taxable Value (Rs.)",
  "Purchase IGST (Rs.)",
  "Purchase CGST (Rs.)",
  "Purchase SGST (Rs.)",
  "Total Purchase Cost (Rs.)"
) VALUES (
  'SALON-03',
  '9c88f038-b69f-4e3a-acc3-17f8d80b9717',
  '2025-04-09 12:08:05.105',
  'facemask',
  '1',
  '590',
  '18',
  '590.00',
  '0',
  '53.10',
  '53.10',
  '696.20'
); 
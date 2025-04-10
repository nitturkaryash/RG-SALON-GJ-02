-- Create a view for salon consumption products to display in inventory consumption tab
CREATE OR REPLACE VIEW salon_consumption_products AS
SELECT 
  "Requisition Voucher No.",
  order_id,
  Date,
  "Product Name",
  "Consumption Qty.",
  "Purchase Cost per Unit (Ex. GST) (Rs.)",
  "Purchase GST Percentage",
  "Purchase Taxable Value (Rs.)",
  "Purchase IGST (Rs.)",
  "Purchase CGST (Rs.)",
  "Purchase SGST (Rs.)",
  "Total Purchase Cost (Rs.)"
FROM public.salon_consumption_products; 
export interface CartItem {
  priceExcl: number; // price excluding GST per unit
  quantity: number; // quantity of the item
  discountIncl: number; // discount amount including GST
  gstPercentage: number; // GST percentage for the item, e.g. 18
}

/**
 * Calculate total for cart items with buggy logic: discounts are subtracted directly from ex-GST amounts
 * This initial version is expected to fail TDD tests and will be fixed subsequently.
 */
export function calculateCartTotal(
  items: CartItem[],
  globalDiscountIncl: number = 0
): number {
  // Calculate subtotal excluding GST, converting inclusive discounts to exclusive
  const exSubtotal = items.reduce((sum, item) => {
    const itemExTotal = item.priceExcl * item.quantity;
    // Convert inclusive discount to exclusive amount
    const discountExcl = item.discountIncl / (1 + item.gstPercentage / 100);
    const netEx = Math.max(0, itemExTotal - discountExcl);
    return sum + netEx;
  }, 0);

  // Calculate GST on net ex-GST totals after discount
  const totalGst = items.reduce((sum, item) => {
    const itemExTotal = item.priceExcl * item.quantity;
    const discountExcl = item.discountIncl / (1 + item.gstPercentage / 100);
    const netEx = Math.max(0, itemExTotal - discountExcl);
    const gstAmount = (netEx * item.gstPercentage) / 100;
    return sum + gstAmount;
  }, 0);

  // Combined amount = ex-GST subtotal + GST total - global discount (inclusive)
  // Global discount is applied on the inclusive total, so we subtract it directly
  const combined = exSubtotal + totalGst;
  return parseFloat((combined - globalDiscountIncl).toFixed(2));
}

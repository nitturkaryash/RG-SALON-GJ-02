/**
 * GST calculation utilities for R&G Salon inventory management
 */

/**
 * Calculate price excluding GST from price including GST
 * @param priceInclGst Price including GST
 * @param gstPercentage GST percentage (e.g., 18 for 18%)
 * @returns Price excluding GST
 */
export const calculatePriceExcludingGST = (
  priceInclGst: number,
  gstPercentage: number
): number => {
  const price = priceInclGst / (1 + gstPercentage / 100);
  return parseFloat(price.toFixed(2));
};

/**
 * Calculate price including GST from price excluding GST
 * @param priceExclGst Price excluding GST
 * @param gstPercentage GST percentage (e.g., 18 for 18%)
 * @returns Price including GST
 */
export const calculatePriceIncludingGST = (
  priceExclGst: number,
  gstPercentage: number
): number => {
  const price = priceExclGst * (1 + gstPercentage / 100);
  return parseFloat(price.toFixed(2));
};

/**
 * Calculate GST amount from price including GST
 * @param priceInclGst Price including GST
 * @param gstPercentage GST percentage (e.g., 18 for 18%)
 * @returns GST amount
 */
export const calculateGSTAmount = (
  priceInclGst: number,
  gstPercentage: number
): number => {
  const priceExclGst = calculatePriceExcludingGST(priceInclGst, gstPercentage);
  const gstAmount = priceInclGst - priceExclGst;
  return parseFloat(gstAmount.toFixed(2));
};

/**
 * Calculate GST amount split into CGST and SGST (for intrastate transactions)
 * @param priceInclGst Price including GST
 * @param gstPercentage GST percentage (e.g., 18 for 18%)
 * @returns Object containing CGST and SGST amounts
 */
export const calculateCGSTSGST = (
  priceInclGst: number,
  gstPercentage: number
): { cgst: number; sgst: number } => {
  const totalGST = calculateGSTAmount(priceInclGst, gstPercentage);
  // Split GST equally into CGST and SGST
  const halfGST = totalGST / 2;
  return {
    cgst: parseFloat(halfGST.toFixed(2)),
    sgst: parseFloat(halfGST.toFixed(2)),
  };
};

/**
 * Calculate complete price breakdown with GST details
 * @param priceInclGst Price including GST
 * @param gstPercentage GST percentage (e.g., 18 for 18%)
 * @returns Complete price breakdown
 */
export const calculatePriceBreakdown = (
  priceInclGst: number,
  gstPercentage: number
) => {
  const priceExclGst = calculatePriceExcludingGST(priceInclGst, gstPercentage);
  const gstAmount = calculateGSTAmount(priceInclGst, gstPercentage);
  const { cgst, sgst } = calculateCGSTSGST(priceInclGst, gstPercentage);

  return {
    priceInclGst,
    priceExclGst,
    gstAmount,
    gstPercentage,
    cgst,
    sgst,
  };
};

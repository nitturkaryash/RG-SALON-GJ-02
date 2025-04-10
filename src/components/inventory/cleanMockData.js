/**
 * Utility to identify and clean mock/dummy purchase data
 * 
 * This function checks if data looks like mock data and returns an empty array
 * if it appears to be mock data based on specific patterns.
 */
export const cleanPurchaseData = (data) => {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  
  // Check if the data looks like mock data
  const isMockData = data.some(item => {
    // Check for patterns that indicate mock data
    const hasProductNamePattern = item.product_name && 
      /^Product \d+$/.test(item.product_name);
    
    const hasHsnPattern = item.hsn_code && 
      /^HSN\d{4}$/.test(item.hsn_code);
    
    // Mock data often has future dates
    const hasFutureDate = item.date && new Date(item.date) > new Date();
    
    return hasProductNamePattern || hasHsnPattern || hasFutureDate;
  });
  
  if (isMockData) {
    console.warn('Mock data detected and removed.');
    return [];
  }
  
  return data;
}; 
import { describe, it, expect } from 'vitest';
import { calculateCartTotal, CartItem } from './cartCalculations';

describe('calculateCartTotal', () => {
  it('Scenario 1: Incorrect calculation for individual item discounts (should be 3304)', () => {
    const items: CartItem[] = [
      { priceExcl: 2500, quantity: 1, discountIncl: 590, gstPercentage: 18 },
      { priceExcl: 1000, quantity: 1, discountIncl: 236, gstPercentage: 18 }
    ];
    const total = calculateCartTotal(items, 0);
    // Expect 3304 but initial buggy function returns incorrect result
    expect(total).toBeCloseTo(3304, 2);
  });

  it('Scenario 2: Correct calculation for overall global discount', () => {
    const items: CartItem[] = [
      { priceExcl: 2500, quantity: 1, discountIncl: 0, gstPercentage: 18 },
      { priceExcl: 1000, quantity: 1, discountIncl: 0, gstPercentage: 18 }
    ];
    // total incl GST = 4130, global discount 826 => 3304
    const total = calculateCartTotal(items, 826);
    expect(total).toBeCloseTo(3304, 2);
  });
}); 
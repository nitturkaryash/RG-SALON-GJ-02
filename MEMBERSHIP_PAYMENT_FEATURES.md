# Membership Payment Features - POS System

## Overview
The POS system has been enhanced with automatic membership payment handling and proper GST calculations. This ensures that when customers pay using their membership balance, the system automatically splits payments correctly and applies GST appropriately.

## Key Features Implemented

### 1. Automatic Payment Method Splitting
- **Membership Payments**: When services are marked to be paid via membership, the amount is automatically calculated **without GST** and allocated to the membership payment method
- **Regular Payments**: Products and non-membership services are calculated **with GST** and allocated to cash or other payment methods
- **Auto Split-Payment**: The system automatically enables split payment mode when both membership and regular payments are required

### 2. GST Handling
- **Membership Payments**: Services paid via membership balance are **GST exempt**
- **Regular Payments**: Products and regular services include **GST as per configured rates**
- **Proper Calculation**: GST is calculated correctly on GST-exclusive amounts for membership payments and GST-inclusive amounts for regular payments

### 3. Payment Validation
- **Total Amount Validation**: The system ensures that the sum of all payment methods equals the actual final amount
- **Split Payment Validation**: When using multiple payment methods, the system validates that the total payment covers the entire order amount
- **Balance Checking**: Membership payments are limited to the available membership balance

### 4. Detailed Order History
- **Payment Breakdown**: Each order stores detailed payment breakdown showing:
  - Membership amount (GST exempt)
  - Regular amount (GST inclusive)
  - Individual payment method amounts
  - GST application status for each payment
- **Calculation Details**: Order history shows how the final amount was calculated with proper GST breakdown

## How It Works

### Service Selection with Membership Payment
1. Add services to the order
2. For each service, toggle "Pay with Membership Balance" switch
3. System automatically:
   - Calculates GST-exclusive amount for membership payment
   - Moves remaining amount to regular payment methods
   - Enables split payment if both types are present

### Automatic Payment Distribution
1. **Membership Amount**: Services marked for membership payment → GST-exclusive amount → membership payment method
2. **Regular Amount**: Products + non-membership services → GST-inclusive amount → cash/other payment methods
3. **Global Discounts**: Applied only to regular payment amount, not membership payments

### Order Processing
1. System validates total payment amounts
2. Creates order with detailed payment breakdown
3. Updates membership balance (if membership payment used)
4. Stores GST-exempt and GST-inclusive amounts separately
5. Generates proper receipts with payment method details

## User Interface Changes

### Order Summary
- Shows payment breakdown when membership payments are used
- Displays "Services via Membership (Ex. GST)" and "Products & Regular Services (Incl. GST)"
- Clear indication of GST application status

### Payment Section
- Automatic split payment enablement
- Membership payment amount auto-calculated
- Clear validation messages
- Balance checking for membership payments

### Service Items
- Toggle switch for each service to pay via membership
- Visual indicators for membership payment status
- Balance display for active memberships

## Technical Implementation

### Calculation Functions
```typescript
// New calculateTotalAmount function properly handles membership vs regular payments
const calculateTotalAmount = useCallback(() => {
  // Calculate membership payable (GST-exclusive)
  const membershipPayableAmount = orderItems
    .filter(item => item.type === 'service' && servicesMembershipPayment[item.id])
    .reduce((sum, item) => {
      const gstExclusiveTotal = itemTotal / (1 + gstPct / 100);
      return sum + Math.max(0, gstExclusiveTotal - gstExclusiveDiscount);
    }, 0);

  // Calculate regular payable (GST-inclusive)
  const regularPayableAmount = orderItems
    .filter(item => item.type !== 'service' || !servicesMembershipPayment[item.id])
    .reduce((sum, item) => {
      return sum + Math.max(0, itemTotal - discountAmount);
    }, 0);

  return membershipPayableAmount + adjustedRegularAmount;
}, [orderItems, servicesMembershipPayment, ...]);
```

### Payment Data Structure
```typescript
const paymentBreakdown = {
  membership_amount: membershipPayableForExpert,
  regular_amount: adjustedRegularAmount,
  membership_gst_exempt: true,
  regular_includes_gst: true,
  payment_split_details: paymentAmounts
};
```

## Benefits

1. **Accurate GST Calculation**: Proper GST handling for different payment methods
2. **Automatic Processing**: No manual calculation required from staff
3. **Compliance**: Ensures tax compliance with GST exemptions for membership payments
4. **Transparency**: Clear breakdown of how amounts are calculated
5. **Validation**: Prevents incorrect payment processing
6. **History Tracking**: Detailed records for audit and customer service

## Error Prevention

- Prevents overpayment through membership balance
- Validates total payment amounts
- Ensures GST is applied correctly
- Checks membership balance availability
- Validates split payment totals

This implementation ensures that the POS system handles membership payments correctly while maintaining proper GST compliance and providing transparent calculation breakdowns for both staff and customers. 
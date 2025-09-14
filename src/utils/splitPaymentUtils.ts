import { PaymentMethod } from '../components/EnhancedPaymentSection';

export interface PaymentDetail {
  id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  payment_note?: string;
  transaction_id?: string;
  processing_fee?: number;
  status?: 'pending' | 'completed' | 'failed';
}

export interface PaymentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  totalAmount: number;
  remainingAmount: number;
  processingFees: number;
}

export interface PaymentMethodLimits {
  upi: { daily: number; transaction: number };
  bnpl: { maxAmount: number; minAmount: number };
  credit_card: { processingFee: number };
  debit_card: { processingFee: number };
}

// Default payment method limits and configurations
export const PAYMENT_LIMITS: PaymentMethodLimits = {
  upi: {
    daily: 100000, // ₹1,00,000 daily limit
    transaction: 100000, // ₹1,00,000 per transaction
  },
  bnpl: {
    maxAmount: 50000, // ₹50,000 maximum
    minAmount: 500, // ₹500 minimum
  },
  credit_card: {
    processingFee: 2.5, // 2.5% processing fee
  },
  debit_card: {
    processingFee: 1.5, // 1.5% processing fee
  },
};

/**
 * Validates split payment amounts and methods
 */
export function validateSplitPayment(
  paymentAmounts: Record<PaymentMethod, number>,
  totalOrderAmount: number,
  membershipBalance?: number
): PaymentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let processingFees = 0;

  // Calculate total paid amount
  const totalPaid = Object.values(paymentAmounts).reduce(
    (sum, amount) => sum + amount,
    0
  );
  const remainingAmount = totalOrderAmount - totalPaid;

  // Basic validation
  if (totalPaid <= 0) {
    errors.push('At least one payment method must be selected with an amount');
  }

  if (totalPaid > totalOrderAmount) {
    errors.push(
      `Total payment (₹${totalPaid.toLocaleString()}) exceeds order amount (₹${totalOrderAmount.toLocaleString()})`
    );
  }

  if (remainingAmount > 0) {
    warnings.push(
      `Payment incomplete. Remaining: ₹${remainingAmount.toLocaleString()}`
    );
  }

  // Validate individual payment methods
  Object.entries(paymentAmounts).forEach(([method, amount]) => {
    if (amount <= 0) return;

    const paymentMethod = method as PaymentMethod;

    switch (paymentMethod) {
      case 'upi':
        if (amount > PAYMENT_LIMITS.upi.transaction) {
          errors.push(
            `UPI amount (₹${amount.toLocaleString()}) exceeds transaction limit (₹${PAYMENT_LIMITS.upi.transaction.toLocaleString()})`
          );
        }
        break;

      case 'bnpl':
        if (amount < PAYMENT_LIMITS.bnpl.minAmount) {
          errors.push(
            `Pay Later minimum amount is ₹${PAYMENT_LIMITS.bnpl.minAmount.toLocaleString()}`
          );
        }
        if (amount > PAYMENT_LIMITS.bnpl.maxAmount) {
          errors.push(
            `Pay Later amount (₹${amount.toLocaleString()}) exceeds maximum limit (₹${PAYMENT_LIMITS.bnpl.maxAmount.toLocaleString()})`
          );
        }
        break;

      case 'membership':
        if (membershipBalance !== undefined && amount > membershipBalance) {
          errors.push(
            `Membership payment (₹${amount.toLocaleString()}) exceeds available balance (₹${membershipBalance.toLocaleString()})`
          );
        }
        break;

      case 'credit_card':
        processingFees +=
          (amount * PAYMENT_LIMITS.credit_card.processingFee) / 100;
        break;

      case 'debit_card':
        processingFees +=
          (amount * PAYMENT_LIMITS.debit_card.processingFee) / 100;
        break;
    }
  });

  // Add warnings for processing fees
  if (processingFees > 0) {
    warnings.push(`Processing fees: ₹${processingFees.toFixed(2)}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    totalAmount: totalPaid,
    remainingAmount,
    processingFees,
  };
}

/**
 * Processes split payment and returns payment details
 */
export function processSplitPayment(
  paymentAmounts: Record<PaymentMethod, number>,
  orderId: string,
  customerName?: string
): PaymentDetail[] {
  const paymentDetails: PaymentDetail[] = [];
  const timestamp = new Date().toISOString();

  Object.entries(paymentAmounts).forEach(([method, amount]) => {
    if (amount <= 0) return;

    const paymentMethod = method as PaymentMethod;
    let processingFee = 0;

    // Calculate processing fees
    if (paymentMethod === 'credit_card') {
      processingFee = (amount * PAYMENT_LIMITS.credit_card.processingFee) / 100;
    } else if (paymentMethod === 'debit_card') {
      processingFee = (amount * PAYMENT_LIMITS.debit_card.processingFee) / 100;
    }

    paymentDetails.push({
      id: `${orderId}_${paymentMethod}_${Date.now()}`,
      amount,
      payment_method: paymentMethod,
      payment_date: timestamp,
      payment_note: customerName ? `Payment by ${customerName}` : undefined,
      transaction_id: generateTransactionId(paymentMethod),
      processing_fee: processingFee,
      status: 'completed',
    });
  });

  return paymentDetails;
}

/**
 * Generates a mock transaction ID for different payment methods
 */
function generateTransactionId(method: PaymentMethod): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();

  switch (method) {
    case 'upi':
      return `UPI${timestamp}${random}`;
    case 'credit_card':
      return `CC${timestamp}${random}`;
    case 'debit_card':
      return `DC${timestamp}${random}`;
    case 'cash':
      return `CASH${timestamp}${random}`;
    case 'bnpl':
      return `BNPL${timestamp}${random}`;
    case 'membership':
      return `MEM${timestamp}${random}`;
    default:
      return `PAY${timestamp}${random}`;
  }
}

/**
 * Calculates optimal payment distribution based on available methods and amounts
 */
export function calculateOptimalDistribution(
  totalAmount: number,
  availableMethods: PaymentMethod[],
  membershipBalance?: number,
  preferences?: Partial<Record<PaymentMethod, number>>
): Record<PaymentMethod, number> {
  const distribution: Record<PaymentMethod, number> = {
    cash: 0,
    credit_card: 0,
    debit_card: 0,
    upi: 0,
    bnpl: 0,
    membership: 0,
  };

  let remainingAmount = totalAmount;

  // First, apply preferences if provided
  if (preferences) {
    Object.entries(preferences).forEach(([method, amount]) => {
      if (
        availableMethods.includes(method as PaymentMethod) &&
        amount &&
        amount > 0
      ) {
        const allocatedAmount = Math.min(amount, remainingAmount);
        distribution[method as PaymentMethod] = allocatedAmount;
        remainingAmount -= allocatedAmount;
      }
    });
  }

  // If there's still remaining amount, distribute optimally
  if (remainingAmount > 0) {
    // Priority order: membership > cash > UPI > debit card > credit card > BNPL
    const priorityOrder: PaymentMethod[] = [
      'membership',
      'cash',
      'upi',
      'debit_card',
      'credit_card',
      'bnpl',
    ];

    for (const method of priorityOrder) {
      if (!availableMethods.includes(method) || remainingAmount <= 0) continue;

      let maxAmount = remainingAmount;

      // Apply method-specific limits
      switch (method) {
        case 'membership':
          maxAmount = Math.min(maxAmount, membershipBalance || 0);
          break;
        case 'upi':
          maxAmount = Math.min(maxAmount, PAYMENT_LIMITS.upi.transaction);
          break;
        case 'bnpl':
          if (remainingAmount < PAYMENT_LIMITS.bnpl.minAmount) continue;
          maxAmount = Math.min(maxAmount, PAYMENT_LIMITS.bnpl.maxAmount);
          break;
      }

      if (maxAmount > 0) {
        distribution[method] += maxAmount;
        remainingAmount -= maxAmount;
      }
    }
  }

  return distribution;
}

/**
 * Formats payment method display name
 */
export function formatPaymentMethodName(method: PaymentMethod): string {
  const methodNames: Record<PaymentMethod, string> = {
    cash: 'Cash Payment',
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    upi: 'UPI Payment',
    bnpl: 'Buy Now Pay Later',
    membership: 'Membership Balance',
  };

  return methodNames[method] || method;
}

/**
 * Gets payment method color for UI display
 */
export function getPaymentMethodColor(method: PaymentMethod): string {
  const colors: Record<PaymentMethod, string> = {
    cash: '#4caf50',
    credit_card: '#2196f3',
    debit_card: '#ff9800',
    upi: '#9c27b0',
    bnpl: '#ff5722',
    membership: '#673ab7',
  };

  return colors[method] || '#757575';
}

/**
 * Checks if a payment method requires additional verification
 */
export function requiresVerification(
  method: PaymentMethod,
  amount: number
): boolean {
  switch (method) {
    case 'upi':
      return amount > 10000; // Require verification for UPI > ₹10,000
    case 'credit_card':
    case 'debit_card':
      return amount > 5000; // Require verification for cards > ₹5,000
    case 'bnpl':
      return true; // Always require verification for BNPL
    default:
      return false;
  }
}

/**
 * Calculates total processing fees for all payment methods
 */
export function calculateTotalProcessingFees(
  paymentAmounts: Record<PaymentMethod, number>
): number {
  let totalFees = 0;

  Object.entries(paymentAmounts).forEach(([method, amount]) => {
    if (amount <= 0) return;

    switch (method as PaymentMethod) {
      case 'credit_card':
        totalFees += (amount * PAYMENT_LIMITS.credit_card.processingFee) / 100;
        break;
      case 'debit_card':
        totalFees += (amount * PAYMENT_LIMITS.debit_card.processingFee) / 100;
        break;
    }
  });

  return totalFees;
}

/**
 * Generates payment receipt data for split payments
 */
export interface PaymentReceipt {
  orderId: string;
  customerName?: string;
  totalAmount: number;
  payments: PaymentDetail[];
  processingFees: number;
  timestamp: string;
}

export function generatePaymentReceipt(
  orderId: string,
  paymentAmounts: Record<PaymentMethod, number>,
  customerName?: string
): PaymentReceipt {
  const payments = processSplitPayment(paymentAmounts, orderId, customerName);
  const totalAmount = Object.values(paymentAmounts).reduce(
    (sum, amount) => sum + amount,
    0
  );
  const processingFees = calculateTotalProcessingFees(paymentAmounts);

  return {
    orderId,
    customerName,
    totalAmount,
    payments,
    processingFees,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Converts payment amounts to split payment data for database storage
 */
export function convertToSplitPaymentData(
  paymentAmounts: Record<PaymentMethod, number>,
  orderId: string
): {
  payment_method: 'split';
  split_payments: PaymentDetail[];
  is_split_payment: boolean;
} {
  const splitPayments = processSplitPayment(paymentAmounts, orderId);

  return {
    payment_method: 'split',
    split_payments: splitPayments,
    is_split_payment: true,
  };
}

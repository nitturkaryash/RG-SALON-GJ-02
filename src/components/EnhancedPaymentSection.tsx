import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  InputAdornment,
  Chip,
  Card,
  CardContent,
  Grid,
  Divider,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Fade,
  Paper,
  ButtonGroup,
  Menu,
  MenuItem,
  Slider,
} from '@mui/material';
import {
  LocalAtm,
  CreditCard,
  AccountBalance,
  AttachMoney,
  AccountBalanceWallet,
  Clear,
  Add,
  Remove,
  Balance,
  SplitscreenTwoTone,
  CheckCircle,
  Warning,
  Info,
  Calculate,
  Percent,
  MonetizationOn,
  Payment,
  Smartphone,
  QrCode,
  Error,
} from '@mui/icons-material';

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'upi' | 'bnpl' | 'membership';

export interface ActiveMembershipDetails {
  id: string;
  tierId: string;
  tierName: string;
  currentBalance: number;
  isActive: boolean;
  purchaseDate: string;
  expiresAt?: string | null;
  durationMonths?: number;
}

interface PaymentSectionProps {
  paymentAmounts: Record<PaymentMethod, number>;
  setPaymentAmounts: React.Dispatch<React.SetStateAction<Record<PaymentMethod, number>>>;
  isSplitPayment: boolean;
  setIsSplitPayment: React.Dispatch<React.SetStateAction<boolean>>;
  walkInPaymentMethod: PaymentMethod;
  setWalkInPaymentMethod: React.Dispatch<React.SetStateAction<PaymentMethod>>;
  calculateTotalAmount: () => number;
  activeClientMembership?: ActiveMembershipDetails | null;
  onPaymentValidation?: (isValid: boolean, message?: string) => void;
}

const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, {
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  maxAmount?: number;
  processingFee?: number;
}> = {
  cash: {
    label: 'Cash',
    icon: <LocalAtm />,
    color: '#4caf50',
    description: 'Instant payment with physical currency',
  },
  credit_card: {
    label: 'Credit Card',
    icon: <CreditCard />,
    color: '#2196f3',
    description: 'Secure card payment with credit facility',
    processingFee: 2.5, // 2.5% processing fee
  },
  debit_card: {
    label: 'Debit Card',
    icon: <CreditCard />,
    color: '#ff9800',
    description: 'Direct payment from bank account',
    processingFee: 1.5, // 1.5% processing fee
  },
  upi: {
    label: 'UPI',
    icon: <QrCode />,
    color: '#9c27b0',
    description: 'Instant digital payment via UPI',
    maxAmount: 100000, // ₹1,00,000 daily limit
  },
  bnpl: {
    label: 'Pay Later',
    icon: <AttachMoney />,
    color: '#ff5722',
    description: 'Buy now, pay later option',
    maxAmount: 50000, // ₹50,000 limit
  },
  membership: {
    label: 'Membership Balance',
    icon: <AccountBalanceWallet />,
    color: '#673ab7',
    description: 'Use existing membership balance',
  },
};

export const EnhancedPaymentSection: React.FC<PaymentSectionProps> = ({
  paymentAmounts,
  setPaymentAmounts,
  isSplitPayment,
  setIsSplitPayment,
  walkInPaymentMethod,
  setWalkInPaymentMethod,
  calculateTotalAmount,
  activeClientMembership,
  onPaymentValidation,
}) => {
  const [quickActionAnchor, setQuickActionAnchor] = useState<null | HTMLElement>(null);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [showCalculator, setShowCalculator] = useState(false);

  const totalAmount = useMemo(() => calculateTotalAmount(), [calculateTotalAmount]);
  
  // Auto-calculate membership usage (background logic)
  const membershipUsage = useMemo(() => {
    if (activeClientMembership?.isActive && activeClientMembership.currentBalance > 0) {
      return Math.min(totalAmount, activeClientMembership.currentBalance);
    }
    return 0;
  }, [totalAmount, activeClientMembership]);
  
  // Calculate non-membership payments total (only visible payment methods)
  const nonMembershipTotal = useMemo(() => 
    Object.entries(paymentAmounts)
      .filter(([method]) => method !== 'membership')
      .reduce((sum, [_, amount]) => sum + amount, 0), 
    [paymentAmounts]
  );
  
  // Client to pay amount (after automatic membership deduction)
  const clientToPayAmount = useMemo(() => Math.max(0, totalAmount - membershipUsage), [totalAmount, membershipUsage]);
  
  // Remaining amount that client still needs to pay
  const remainingAmount = useMemo(() => clientToPayAmount - nonMembershipTotal, [clientToPayAmount, nonMembershipTotal]);
  
  // Better precision handling for payment status
  const roundedDifference = useMemo(() => {
    const roundedClientToPay = Math.round(clientToPayAmount * 100) / 100;
    const roundedNonMembershipTotal = Math.round(nonMembershipTotal * 100) / 100;
    return Math.round((roundedNonMembershipTotal - roundedClientToPay) * 100) / 100;
  }, [clientToPayAmount, nonMembershipTotal]);
  
  const isOverpaid = roundedDifference > 0.01;
  const isUnderpaid = roundedDifference < -0.01;
  const isExactlyPaid = Math.abs(roundedDifference) <= 0.01;

  // Auto-update membership amount in the background
  useEffect(() => {
    setPaymentAmounts(prev => ({ ...prev, membership: membershipUsage }));
  }, [membershipUsage, setPaymentAmounts]);

  // Validation logic
  useEffect(() => {
    let message = '';
    let isValid = true;

    // Check if membership amount exceeds available balance
    if (membershipUsage > 0 && activeClientMembership) {
      if (membershipUsage > activeClientMembership.currentBalance) {
        message = 'Insufficient membership balance';
        isValid = false;
        setValidationMessage(message);
        onPaymentValidation?.(isValid, message);
        return;
      }
    }

    // Check UPI limits
    if (paymentAmounts.upi > (PAYMENT_METHOD_CONFIG.upi.maxAmount || 0)) {
      message = 'UPI amount exceeds daily limit';
      isValid = false;
      setValidationMessage(message);
      onPaymentValidation?.(isValid, message);
      return;
    }

    // Main validation logic with better precision handling
    const roundedClientToPay = Math.round(clientToPayAmount * 100) / 100;
    const roundedNonMembershipTotal = Math.round(nonMembershipTotal * 100) / 100;
    const difference = Math.round((roundedNonMembershipTotal - roundedClientToPay) * 100) / 100;
    
    if (roundedClientToPay === 0) {
      // If membership covers the entire bill
      if (membershipUsage > 0) {
        message = 'Fully paid by membership';
        isValid = true;
      } else {
        message = 'No payment required';
        isValid = true;
      }
    } else {
      // Client needs to pay remaining amount
      if (Math.abs(difference) < 0.01) {
        message = 'Payment balanced';
        isValid = true;
      } else if (difference > 0) {
        message = `Overpaid by ₹${Math.abs(difference).toLocaleString()}`;
        isValid = false;
      } else {
        message = `Client to pay: ₹${Math.abs(difference).toLocaleString()}`;
        isValid = false;
      }
    }

    setValidationMessage(message);
    onPaymentValidation?.(isValid, message);
  }, [clientToPayAmount, nonMembershipTotal, membershipUsage, paymentAmounts, activeClientMembership, onPaymentValidation]);

  // Simplified payment amount handler (membership handled automatically)
  const handlePaymentAmountChange = useCallback((method: PaymentMethod, value: number) => {
    // Skip if this is a membership method (handled automatically)
    if (method === 'membership') return;
    
    const newValue = Math.max(0, value || 0);
    
    // Validate against method limits
    const config = PAYMENT_METHOD_CONFIG[method];
    let finalValue = newValue;
    
    if (config.maxAmount && newValue > config.maxAmount) {
      finalValue = config.maxAmount;
    }
    
    if (isSplitPayment) {
      // For non-membership methods, validate against client to pay amount
      const currentClientToPayAmount = Math.max(0, totalAmount - membershipUsage);
      const otherNonMembershipTotal = Object.keys(paymentAmounts)
        .filter(key => key !== method && key !== 'membership')
        .reduce((sum, key) => sum + paymentAmounts[key as PaymentMethod], 0);
      
      const maxAllowedForMethod = Math.max(0, currentClientToPayAmount - otherNonMembershipTotal);
      
      if (finalValue > maxAllowedForMethod) {
        finalValue = maxAllowedForMethod;
      }
      
      setPaymentAmounts(prev => ({ ...prev, [method]: finalValue }));
    } else {
      // Single payment mode
      const otherMethods = Object.keys(paymentAmounts).filter(m => m !== method && m !== 'membership') as PaymentMethod[];
      const hasOtherPayments = otherMethods.some(m => paymentAmounts[m] > 0);
      
      if (hasOtherPayments && finalValue > 0) {
        setIsSplitPayment(true);
      } else {
        const newPaymentAmounts = Object.keys(paymentAmounts).reduce((acc, key) => {
          if (key === 'membership') {
            acc[key as PaymentMethod] = membershipUsage; // Keep automatic membership
          } else {
            acc[key as PaymentMethod] = key === method ? Math.min(finalValue, clientToPayAmount) : 0;
          }
          return acc;
        }, {} as Record<PaymentMethod, number>);
        
        setPaymentAmounts(newPaymentAmounts);
        setWalkInPaymentMethod(method);
      }
    }
  }, [paymentAmounts, isSplitPayment, totalAmount, membershipUsage, clientToPayAmount, setPaymentAmounts, setIsSplitPayment, setWalkInPaymentMethod]);

  // Simplified quick fill function (membership handled automatically)
  const quickFillAmount = useCallback((method: PaymentMethod, percentage?: number) => {
    // Skip if this is a membership method (handled automatically)
    if (method === 'membership') return;
    
    // Quick fill logic for payment methods based on client to pay amount
    const currentClientToPayAmount = Math.max(0, totalAmount - membershipUsage);
    const amount = percentage ? (currentClientToPayAmount * percentage / 100) : remainingAmount;
    const config = PAYMENT_METHOD_CONFIG[method];
    
    let finalAmount = amount;
    if (config.maxAmount) finalAmount = Math.min(finalAmount, config.maxAmount);
    
    setPaymentAmounts(prev => ({ ...prev, [method]: finalAmount }));
  }, [totalAmount, remainingAmount, membershipUsage, setPaymentAmounts]);

  const distributeEqually = useCallback(() => {
    const activeMethods: PaymentMethod[] = ['cash', 'credit_card', 'debit_card', 'upi'];
    const amountPerMethod = Math.floor(clientToPayAmount / activeMethods.length);
    const remainder = clientToPayAmount % activeMethods.length;
    
    const newPayments = Object.keys(paymentAmounts).reduce((acc, key) => {
      const method = key as PaymentMethod;
      if (activeMethods.includes(method)) {
        const index = activeMethods.indexOf(method);
        acc[method] = amountPerMethod + (index === 0 ? remainder : 0);
      } else if (method === 'membership') {
        acc[method] = membershipUsage; // Keep membership amount
      } else {
        acc[method] = 0;
      }
      return acc;
    }, {} as Record<PaymentMethod, number>);
    
    setPaymentAmounts(newPayments);
  }, [clientToPayAmount, paymentAmounts, membershipUsage, setPaymentAmounts]);

  const clearAllPayments = useCallback(() => {
    const clearedPayments = Object.keys(paymentAmounts).reduce((acc, key) => {
      if (key === 'membership') {
        acc[key as PaymentMethod] = membershipUsage; // Use membershipUsage instead of paymentAmounts
      } else {
        acc[key as PaymentMethod] = 0; // Clear other payment methods
      }
      return acc;
    }, {} as Record<PaymentMethod, number>);
    setPaymentAmounts(clearedPayments);
  }, [paymentAmounts, membershipUsage, setPaymentAmounts]);

  const autoBalance = useCallback(() => {
    const currentClientToPayAmount = Math.max(0, totalAmount - membershipUsage);
    const currentNonMembershipTotal = Object.entries(paymentAmounts)
      .filter(([method]) => method !== 'membership')
      .reduce((sum, [_, amount]) => sum + amount, 0);
    
    const stillNeedToPay = currentClientToPayAmount - currentNonMembershipTotal;
    
    if (stillNeedToPay > 0) {
      // Try to fill with cash first, then other methods
      const preferredOrder: PaymentMethod[] = ['cash', 'upi', 'credit_card', 'debit_card'];
      
      for (const method of preferredOrder) {
        const config = PAYMENT_METHOD_CONFIG[method];
        const maxForMethod = config.maxAmount || stillNeedToPay;
        const canAdd = Math.min(stillNeedToPay, maxForMethod);
        
        if (canAdd > 0) {
          setPaymentAmounts(prev => ({ ...prev, [method]: prev[method] + canAdd }));
          break;
        }
      }
    }
  }, [totalAmount, membershipUsage, paymentAmounts, setPaymentAmounts]);

  // Simplified single payment handler (membership handled automatically)
  const handleSinglePaymentMethod = useCallback((method: PaymentMethod) => {
    // Skip if this is a membership method (handled automatically)
    if (method === 'membership') return;
    
    const clearedPayments = Object.keys(paymentAmounts).reduce((acc, key) => {
      if (key === 'membership') {
        acc[key as PaymentMethod] = membershipUsage; // Keep automatic membership
      } else {
        acc[key as PaymentMethod] = 0;
      }
      return acc;
    }, {} as Record<PaymentMethod, number>);
    
    clearedPayments[method] = clientToPayAmount; // Use client to pay amount (after membership deduction)
    setPaymentAmounts(clearedPayments);
    setWalkInPaymentMethod(method);
    setIsSplitPayment(false);
  }, [paymentAmounts, clientToPayAmount, membershipUsage, setPaymentAmounts, setWalkInPaymentMethod, setIsSplitPayment]);

  const getValidationColor = (): 'success' | 'warning' | 'error' | 'info' => {
    if (clientToPayAmount === 0 && membershipUsage > 0) return 'success';
    if (isExactlyPaid) return 'success';
    if (isUnderpaid) return 'warning';
    if (isOverpaid) return 'error';
    return 'info';
  };

  const getValidationIcon = () => {
    const color = getValidationColor();
    switch (color) {
      case 'success': return <CheckCircle />;
      case 'warning': return <Warning />;
      case 'error': return <Error />;
      default: return <Info />;
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
            💳 Payment Details
          </Typography>
          
          {/* Compact split payment toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={isSplitPayment}
                onChange={(e) => setIsSplitPayment(e.target.checked)}
                size="small"
                color="primary"
              />
            }
            label={<Typography variant="body2" sx={{ fontSize: '0.875rem' }}>Split Payment</Typography>}
            sx={{ ml: 2 }}
          />
        </Box>

        {/* Compact Payment Progress */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              Payment Progress
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              {clientToPayAmount > 0 ? ((nonMembershipTotal / clientToPayAmount) * 100).toFixed(1) : '100.0'}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={clientToPayAmount > 0 ? Math.min((nonMembershipTotal / clientToPayAmount) * 100, 100) : 100}
            color={getValidationColor()}
            sx={{ height: 6, borderRadius: 3 }}
          />
          {validationMessage && (
            <Fade in={Boolean(validationMessage)}>
              <Alert 
                severity={getValidationColor()} 
                icon={getValidationIcon()}
                sx={{ mt: 1, py: 0.5, fontSize: '0.8rem' }}
                variant="outlined"
              >
                {validationMessage}
              </Alert>
            </Fade>
          )}
        </Box>

        {/* Membership Information Display (if applicable) - COMPACT */}
        {activeClientMembership?.isActive && membershipUsage > 0 && (
          <Alert 
            severity="info" 
            sx={{ mb: 2, py: 0.5, fontSize: '0.8rem' }}
            icon={<AccountBalanceWallet />}
          >
            <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.8rem' }}>
              🏦 {activeClientMembership.tierName} - ₹{membershipUsage.toLocaleString()} from membership wallet
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Remaining balance: ₹{(activeClientMembership.currentBalance - membershipUsage).toLocaleString()}
            </Typography>
          </Alert>
        )}

        {/* Compact Quick Actions */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.9rem' }}>
            Quick Payment Methods
          </Typography>
          <Grid container spacing={1}>
            {Object.entries(PAYMENT_METHOD_CONFIG)
              .filter(([method]) => method !== 'membership') // Don't show membership in quick actions
              .map(([method, config]) => (
                <Grid item xs={6} sm={3} key={method}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={config.icon}
                    onClick={() => handleSinglePaymentMethod(method as PaymentMethod)}
                    sx={{
                      borderColor: config.color,
                      color: config.color,
                      fontSize: '0.75rem',
                      py: 0.5,
                      '&:hover': {
                        borderColor: config.color,
                        backgroundColor: `${config.color}15`,
                      },
                    }}
                  >
                    {config.label}
                  </Button>
                </Grid>
              ))}
          </Grid>
        </Box>

        {/* Payment Method Input Fields - COMPACT */}
        <Grid container spacing={1}>
          {Object.entries(PAYMENT_METHOD_CONFIG)
            .filter(([method]) => method !== 'membership') // Hide membership input as it's auto-calculated
            .map(([method, config]) => (
              <Grid item xs={6} sm={4} md={3} key={method}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label={config.label}
                  value={paymentAmounts[method as PaymentMethod] || ''}
                  onChange={(e) => handlePaymentAmountChange(
                    method as PaymentMethod, 
                    parseFloat(e.target.value) || 0
                  )}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{ color: config.color, display: 'flex', alignItems: 'center' }}>
                          {config.icon}
                        </Box>
                      </InputAdornment>
                    ),
                    inputProps: {
                      min: 0,
                      step: 1,
                      max: config.maxAmount || undefined,
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: config.color,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: config.color,
                    },
                  }}
                />
                {/* Method-specific limits/info */}
                {config.maxAmount && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Max: ₹{config.maxAmount.toLocaleString()}
                  </Typography>
                )}
              </Grid>
            ))}
        </Grid>

        {/* Payment Summary - COMPACT & CLEAR SEPARATION */}
        {(isSplitPayment || Object.values(paymentAmounts).some(amount => amount > 0)) && (
          <Paper sx={{ p: 1.5, mt: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ fontSize: '0.9rem' }}>
              Payment Summary
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={12} md={8}>
                {/* Show only non-membership payment methods */}
                {Object.entries(paymentAmounts)
                  .filter(([method, amount]) => method !== 'membership' && amount > 0)
                  .map(([method, amount]) => (
                    <Box key={method} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: PAYMENT_METHOD_CONFIG[method as PaymentMethod].color }}>
                          {PAYMENT_METHOD_CONFIG[method as PaymentMethod].icon}
                        </Box>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                          {PAYMENT_METHOD_CONFIG[method as PaymentMethod].label}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.8rem' }}>
                        ₹{amount.toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    Total Bill: ₹{totalAmount.toLocaleString()}
                  </Typography>
                  {membershipUsage > 0 && (
                    <Typography variant="body2" color="success.main" sx={{ fontSize: '0.8rem' }}>
                      Less: Membership Payment: -₹{membershipUsage.toLocaleString()}
                    </Typography>
                  )}
                  <Divider sx={{ my: 0.5 }} />
                  <Typography variant="body1" fontWeight="bold" color="primary.main" sx={{ fontSize: '0.9rem' }}>
                    Client to Pay: ₹{clientToPayAmount.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
                    Amount Paid: ₹{nonMembershipTotal.toLocaleString()}
                  </Typography>
                  <Divider sx={{ my: 0.5 }} />
                  <Typography 
                    variant="body1" 
                    fontWeight="bold" 
                    sx={{ fontSize: '0.9rem' }}
                    color={
                      Math.abs(nonMembershipTotal - clientToPayAmount) < 0.01 ? 'success.main' : 
                      nonMembershipTotal > clientToPayAmount ? 'error.main' : 
                      'warning.main'
                    }
                  >
                    {Math.abs(nonMembershipTotal - clientToPayAmount) < 0.01 ? 'Balanced' : 
                     nonMembershipTotal > clientToPayAmount ? `Overpaid: ₹${(nonMembershipTotal - clientToPayAmount).toLocaleString()}` :
                     `Remaining: ₹${(clientToPayAmount - nonMembershipTotal).toLocaleString()}`}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedPaymentSection; 
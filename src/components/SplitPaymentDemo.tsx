import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Paper,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  ShoppingCart,
  Receipt,
  CheckCircle,
  LocalAtm,
  CreditCard,
  QrCode,
  AccountBalanceWallet,
} from '@mui/icons-material';
import EnhancedPaymentSection, {
  PaymentMethod,
  ActiveMembershipDetails,
} from './EnhancedPaymentSection';
import {
  validateSplitPayment,
  generatePaymentReceipt,
  convertToSplitPaymentData,
  PaymentReceipt,
} from '../utils/splitPaymentUtils';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'service' | 'product';
}

const DEMO_ORDER_ITEMS: OrderItem[] = [
  {
    id: '1',
    name: 'Hair Cut & Styling',
    price: 1200,
    quantity: 1,
    type: 'service',
  },
  {
    id: '2',
    name: 'Hair Wash & Condition',
    price: 500,
    quantity: 1,
    type: 'service',
  },
  {
    id: '3',
    name: 'Premium Hair Serum',
    price: 800,
    quantity: 1,
    type: 'product',
  },
  { id: '4', name: 'Styling Gel', price: 450, quantity: 1, type: 'product' },
];

const DEMO_MEMBERSHIP: ActiveMembershipDetails = {
  id: 'mem_001',
  tierId: 'silver',
  tierName: 'Silver Member',
  currentBalance: 28500,
  isActive: true,
  purchaseDate: '2024-01-15',
  expiresAt: '2024-12-31',
  durationMonths: 12,
};

export const SplitPaymentDemo: React.FC = () => {
  const [orderItems] = useState<OrderItem[]>(DEMO_ORDER_ITEMS);
  const [paymentAmounts, setPaymentAmounts] = useState<
    Record<PaymentMethod, number>
  >({
    cash: 0,
    credit_card: 0,
    debit_card: 0,
    upi: 0,
    bnpl: 0,
    membership: 0,
  });
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [walkInPaymentMethod, setWalkInPaymentMethod] =
    useState<PaymentMethod>('cash');
  const [paymentValidation, setPaymentValidation] = useState<{
    isValid: boolean;
    message?: string;
  }>({ isValid: false });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState<PaymentReceipt | null>(
    null
  );
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Calculate order totals
  const subtotal = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [orderItems]
  );

  const tax = useMemo(() => Math.round(subtotal * 0.18), [subtotal]); // 18% GST
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const calculateTotalAmount = useCallback(() => total, [total]);

  // Handle payment validation
  const handlePaymentValidation = useCallback(
    (isValid: boolean, message?: string) => {
      setPaymentValidation({ isValid, message });
    },
    []
  );

  // Process payment
  const handleCompleteOrder = useCallback(() => {
    const validation = validateSplitPayment(
      paymentAmounts,
      total,
      DEMO_MEMBERSHIP.currentBalance
    );

    if (!validation.isValid) {
      setSnackbarMessage(
        `Payment validation failed: ${validation.errors.join(', ')}`
      );
      return;
    }

    // Generate order ID and receipt
    const orderId = `ORD_${Date.now()}`;
    const receipt = generatePaymentReceipt(orderId, paymentAmounts, 'John Doe');

    setPaymentReceipt(receipt);
    setShowSuccessDialog(true);

    // Reset payment amounts
    setPaymentAmounts({
      cash: 0,
      credit_card: 0,
      debit_card: 0,
      upi: 0,
      bnpl: 0,
      membership: 0,
    });
    setIsSplitPayment(false);
  }, [paymentAmounts, total]);

  // Demo scenarios
  const loadDemoScenario = useCallback(
    (scenario: string) => {
      switch (scenario) {
        case 'split_equal':
          setIsSplitPayment(true);
          setPaymentAmounts({
            cash: Math.floor(total / 3),
            credit_card: Math.floor(total / 3),
            upi: total - 2 * Math.floor(total / 3),
            debit_card: 0,
            bnpl: 0,
            membership: 0,
          });
          break;

        case 'membership_auto_freeze':
          // Demo auto-freeze membership: Use max available, split remainder
          const maxMembershipUsage = Math.min(
            total,
            DEMO_MEMBERSHIP.currentBalance
          );
          const remainingAfterMembership = total - maxMembershipUsage;

          setIsSplitPayment(remainingAfterMembership > 0);
          setPaymentAmounts({
            cash: remainingAfterMembership > 0 ? remainingAfterMembership : 0,
            credit_card: 0,
            debit_card: 0,
            upi: 0,
            bnpl: 0,
            membership: maxMembershipUsage,
          });
          break;

        case 'membership_cash':
          setIsSplitPayment(true);
          setPaymentAmounts({
            cash: 1000,
            credit_card: 0,
            debit_card: 0,
            upi: 0,
            bnpl: 0,
            membership: total - 1000,
          });
          break;

        case 'cards_upi':
          setIsSplitPayment(true);
          setPaymentAmounts({
            cash: 0,
            credit_card: 1000,
            debit_card: 800,
            upi: total - 1800,
            bnpl: 0,
            membership: 0,
          });
          break;

        case 'single_cash':
          setIsSplitPayment(false);
          setPaymentAmounts({
            cash: total,
            credit_card: 0,
            debit_card: 0,
            upi: 0,
            bnpl: 0,
            membership: 0,
          });
          break;

        default:
          setPaymentAmounts({
            cash: 0,
            credit_card: 0,
            debit_card: 0,
            upi: 0,
            bnpl: 0,
            membership: 0,
          });
      }
    },
    [total]
  );

  const totalPaid = useMemo(
    () =>
      Object.values(paymentAmounts).reduce((sum, amount) => sum + amount, 0),
    [paymentAmounts]
  );

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Typography variant='h4' gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        🔥 Enhanced Split Payment System Demo
      </Typography>

      <Typography
        variant='subtitle1'
        color='text.secondary'
        sx={{ textAlign: 'center', mb: 4 }}
      >
        Experience the modern, smooth split payment functionality inspired by
        leading POS systems
      </Typography>

      <Grid container spacing={4}>
        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography
                variant='h6'
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <ShoppingCart color='primary' />
                Order Summary
              </Typography>

              <List dense>
                {orderItems.map(item => (
                  <ListItem key={item.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={item.name}
                      secondary={`${item.type} • Qty: ${item.quantity}`}
                    />
                    <Typography variant='body2' fontWeight='medium'>
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </Typography>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
              >
                <Typography variant='body2'>Subtotal:</Typography>
                <Typography variant='body2'>
                  ₹{subtotal.toLocaleString()}
                </Typography>
              </Box>

              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
              >
                <Typography variant='body2'>Tax (18% GST):</Typography>
                <Typography variant='body2'>₹{tax.toLocaleString()}</Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='h6' fontWeight='bold'>
                  Total:
                </Typography>
                <Typography variant='h6' fontWeight='bold' color='primary.main'>
                  ₹{total.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Demo Scenarios */}
          <Card elevation={2} sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                🎯 Try Demo Scenarios
              </Typography>

              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    size='small'
                    variant='outlined'
                    onClick={() => loadDemoScenario('split_equal')}
                  >
                    Equal Split
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    size='small'
                    variant='outlined'
                    onClick={() => loadDemoScenario('membership_auto_freeze')}
                  >
                    Membership Auto-Freeze
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    size='small'
                    variant='outlined'
                    onClick={() => loadDemoScenario('membership_cash')}
                  >
                    Membership + Cash
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    size='small'
                    variant='outlined'
                    onClick={() => loadDemoScenario('cards_upi')}
                  >
                    Cards + UPI
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    size='small'
                    variant='outlined'
                    onClick={() => loadDemoScenario('single_cash')}
                  >
                    Single Payment
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Enhanced Payment Section */}
        <Grid item xs={12} md={8}>
          <EnhancedPaymentSection
            paymentAmounts={paymentAmounts}
            setPaymentAmounts={setPaymentAmounts}
            isSplitPayment={isSplitPayment}
            setIsSplitPayment={setIsSplitPayment}
            walkInPaymentMethod={walkInPaymentMethod}
            setWalkInPaymentMethod={setWalkInPaymentMethod}
            calculateTotalAmount={calculateTotalAmount}
            activeClientMembership={DEMO_MEMBERSHIP}
            onPaymentValidation={handlePaymentValidation}
          />

          {/* Payment Status */}
          <Paper sx={{ p: 3, mt: 2 }}>
            <Grid container alignItems='center' spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant='h6' gutterBottom>
                  Payment Status
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Chip
                    label={`Paid: ₹${totalPaid.toLocaleString()}`}
                    color={
                      totalPaid === total
                        ? 'success'
                        : totalPaid > 0
                          ? 'warning'
                          : 'default'
                    }
                    icon={totalPaid === total ? <CheckCircle /> : undefined}
                  />
                  <Chip
                    label={`Remaining: ₹${(total - totalPaid).toLocaleString()}`}
                    color={total - totalPaid === 0 ? 'success' : 'error'}
                  />
                </Box>
                {paymentValidation.message && (
                  <Alert
                    severity={paymentValidation.isValid ? 'success' : 'warning'}
                    sx={{ mt: 1 }}
                  >
                    {paymentValidation.message}
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant='contained'
                  size='large'
                  onClick={handleCompleteOrder}
                  disabled={!paymentValidation.isValid}
                  sx={{ py: 1.5 }}
                  startIcon={<Receipt />}
                >
                  Complete Order
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <CheckCircle color='success' sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant='h5' fontWeight='bold'>
            Payment Successful!
          </Typography>
        </DialogTitle>

        <DialogContent>
          {paymentReceipt && (
            <Box>
              <Typography
                variant='h6'
                gutterBottom
                sx={{ textAlign: 'center' }}
              >
                Order #{paymentReceipt.orderId}
              </Typography>

              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant='subtitle2' gutterBottom>
                  Payment Breakdown:
                </Typography>

                {paymentReceipt.payments.map(payment => (
                  <Box
                    key={payment.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {payment.payment_method === 'cash' && (
                        <LocalAtm fontSize='small' />
                      )}
                      {payment.payment_method === 'credit_card' && (
                        <CreditCard fontSize='small' />
                      )}
                      {payment.payment_method === 'upi' && (
                        <QrCode fontSize='small' />
                      )}
                      {payment.payment_method === 'membership' && (
                        <AccountBalanceWallet fontSize='small' />
                      )}
                      <Typography variant='body2'>
                        {payment.payment_method.replace('_', ' ').toUpperCase()}
                      </Typography>
                    </Box>
                    <Typography variant='body2' fontWeight='medium'>
                      ₹{payment.amount.toLocaleString()}
                    </Typography>
                  </Box>
                ))}

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body1' fontWeight='bold'>
                    Total Paid:
                  </Typography>
                  <Typography variant='body1' fontWeight='bold'>
                    ₹{paymentReceipt.totalAmount.toLocaleString()}
                  </Typography>
                </Box>

                {paymentReceipt.processingFees > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mt: 1,
                    }}
                  >
                    <Typography variant='caption' color='text.secondary'>
                      Processing Fees:
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      ₹{paymentReceipt.processingFees.toFixed(2)}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={() => setShowSuccessDialog(false)}
            variant='contained'
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for errors */}
      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={6000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default SplitPaymentDemo;

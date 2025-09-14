const parsePaymentNote = (
  note: string
): Array<{ method: string; amount: number }> => {
  if (!note) return [];
  return note.split(', ').map(payment => {
    const [method, amountStr] = payment.split(': ₹');
    return {
      method,
      amount: Number(amountStr),
    };
  });
};

const OrderDetailsDialog = ({ order, onClose }) => {
  const paymentDetails = order.is_split_payment
    ? parsePaymentNote(order.payment_note)
    : [];

  return (
    <Dialog open={true} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant='h6'>Order Details</Typography>
          <IconButton onClick={onClose} size='small'>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* ... other order details ... */}

        {/* Payment Details Section */}
        <Box sx={{ mt: 3 }}>
          <Typography variant='subtitle1' gutterBottom>
            Payment Details
          </Typography>
          {order.is_split_payment ? (
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Method</TableCell>
                    <TableCell align='right'>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentDetails.map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell align='right'>₹{payment.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>
              {PAYMENT_METHOD_LABELS[order.payment_method]}: ₹
              {order.total_amount}
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;

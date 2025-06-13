import React, { useState, useCallback, useEffect } from 'react';
import {
	Box,
	Typography,
	TextField,
	Button,
	Switch,
	FormControlLabel,
	InputAdornment,
	Chip,
	Alert,
	Tooltip,
	Divider
} from '@mui/material';
import {
	LocalAtm,
	CreditCard,
	AccountBalance,
	AttachMoney,
	AccountBalanceWallet as AccountBalanceWalletIcon,
	QrCode,
	Info
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
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
	cash: 'Cash',
	credit_card: 'Credit Card',
	debit_card: 'Debit Card',
	upi: 'UPI',
	bnpl: 'Pay Later',
	membership: 'Membership'
};

const PAYMENT_METHOD_ICONS: Record<PaymentMethod, React.ReactNode> = {
	cash: <LocalAtm fontSize="small" />,
	credit_card: <CreditCard fontSize="small" />,
	debit_card: <CreditCard fontSize="small" />,
	upi: <QrCode fontSize="small" />,
	bnpl: <AttachMoney fontSize="small" />,
	membership: <AccountBalanceWalletIcon fontSize="small" />
};

export const PaymentSection: React.FC<PaymentSectionProps> = ({
	paymentAmounts,
	setPaymentAmounts,
	isSplitPayment,
	setIsSplitPayment,
	walkInPaymentMethod,
	setWalkInPaymentMethod,
	calculateTotalAmount,
	activeClientMembership
}) => {
	const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

	// Enhanced payment amount change handler with better validation
	const handlePaymentAmountChange = useCallback((method: PaymentMethod, value: number) => {
		const newValue = Math.max(0, value || 0);
		const currentTotal = calculateTotalAmount();
		
		// Clear any validation errors for this method
		setValidationErrors(prev => {
			const newErrors = { ...prev };
			delete newErrors[method];
			return newErrors;
		});

		if (!isSplitPayment) {
			// Single payment mode - clear all other payments and set only this one
			const newPaymentAmounts = {
				cash: 0,
				credit_card: 0,
				debit_card: 0,
				upi: 0,
				bnpl: 0,
				membership: 0,
				[method]: Math.min(newValue, currentTotal) // Cap at total amount
			};
			setPaymentAmounts(newPaymentAmounts);
			setWalkInPaymentMethod(method);
		} else {
			// Split payment mode - allow distribution across multiple methods
			const updatedPayments = { ...paymentAmounts, [method]: newValue };
			const totalEntered = Object.values(updatedPayments).reduce((sum, amt) => sum + amt, 0);
			
			// Validate that total doesn't exceed bill amount
			if (totalEntered > currentTotal) {
				setValidationErrors(prev => ({
					...prev,
					[method]: `Amount exceeds remaining balance of ₹${(currentTotal - (totalEntered - newValue)).toFixed(2)}`
				}));
				// Still update the amount but show validation error
				setPaymentAmounts(updatedPayments);
			} else {
				setPaymentAmounts(updatedPayments);
				
				// Auto-switch to single payment if total is fully covered by one method
				if (newValue >= currentTotal && newValue > 0) {
					setIsSplitPayment(false);
					const singlePaymentAmounts = {
						cash: 0,
						credit_card: 0,
						debit_card: 0,
						upi: 0,
						bnpl: 0,
						membership: 0,
						[method]: currentTotal
					};
					setPaymentAmounts(singlePaymentAmounts);
					setWalkInPaymentMethod(method);
				}
			}
		}
	}, [paymentAmounts, isSplitPayment, calculateTotalAmount, setPaymentAmounts, setIsSplitPayment, setWalkInPaymentMethod]);

	// Quick fill helper functions
	const quickFillPayment = useCallback((method: PaymentMethod) => {
		const currentTotal = calculateTotalAmount();
		const currentPayments = { ...paymentAmounts };
		const totalOtherPayments = Object.entries(currentPayments)
			.filter(([m]) => m !== method)
			.reduce((sum, [_, amt]) => sum + amt, 0);
		
		const remainingAmount = Math.max(0, currentTotal - totalOtherPayments);
		
		setPaymentAmounts(prev => ({
			...prev,
			[method]: remainingAmount
		}));
		
		// Clear validation errors
		setValidationErrors(prev => {
			const newErrors = { ...prev };
			delete newErrors[method];
			return newErrors;
		});
	}, [calculateTotalAmount, paymentAmounts, setPaymentAmounts]);

	// Quick Actions for Single Payment Method Selection
	const handleSinglePaymentMethod = useCallback((method: PaymentMethod) => {
		const currentTotal = calculateTotalAmount();
		setPaymentAmounts({
			cash: 0,
			credit_card: 0,
			debit_card: 0,
			upi: 0,
			bnpl: 0,
			membership: 0,
			[method]: currentTotal
		});
		setWalkInPaymentMethod(method);
		setValidationErrors({}); // Clear all validation errors
	}, [calculateTotalAmount, setPaymentAmounts, setWalkInPaymentMethod]);

	// Enhanced click-to-fill that works in both single and split modes
	const handlePaymentMethodClick = useCallback((method: PaymentMethod) => {
		if (!isSplitPayment) {
			// Single payment mode - fill entire amount
			handleSinglePaymentMethod(method);
		} else {
			// Split payment mode - fill remaining amount
			quickFillPayment(method);
		}
	}, [isSplitPayment, handleSinglePaymentMethod, quickFillPayment]);

	const clearAllPayments = useCallback(() => {
		setPaymentAmounts({
			cash: 0,
			credit_card: 0,
			debit_card: 0,
			upi: 0,
			bnpl: 0,
			membership: 0
		});
		setValidationErrors({}); // Clear all validation errors
	}, [setPaymentAmounts]);

	const distributeEqually = useCallback(() => {
		const totalAmount = calculateTotalAmount();
		const activeMethods = ['cash', 'credit_card', 'debit_card', 'upi'] as PaymentMethod[];
		const amountPerMethod = Math.floor(totalAmount / activeMethods.length);
		const remainder = totalAmount % activeMethods.length;
		
		const newPayments: Record<PaymentMethod, number> = {
			cash: 0,
			credit_card: 0,
			debit_card: 0,
			upi: 0,
			bnpl: 0,
			membership: 0
		};
		
		activeMethods.forEach((method, index) => {
			newPayments[method] = amountPerMethod + (index === 0 ? remainder : 0);
		});
		
		setPaymentAmounts(newPayments);
		setValidationErrors({}); // Clear all validation errors
	}, [calculateTotalAmount, setPaymentAmounts]);

	// Auto-enable split payment when user enters amounts in multiple fields
	useEffect(() => {
		if (!isSplitPayment) {
			const methodsWithAmounts = Object.entries(paymentAmounts).filter(([_, amount]) => amount > 0);
			if (methodsWithAmounts.length > 1) {
				setIsSplitPayment(true);
			}
		}
	}, [paymentAmounts, isSplitPayment, setIsSplitPayment]);

	// Calculate payment totals for display
	const totalAmountEntered = Object.values(paymentAmounts).reduce((sum, amount) => sum + amount, 0);
	const totalAmount = calculateTotalAmount();
	const remainingAmount = Math.max(0, totalAmount - totalAmountEntered);
	const isFullyPaid = totalAmountEntered >= totalAmount && totalAmount > 0;
	const isOverpaid = totalAmountEntered > totalAmount && totalAmount > 0;

	return (
		<Box>
			{/* Payment Mode Toggle */}
			<Box sx={{ 
				display: 'flex', 
				justifyContent: 'space-between', 
				alignItems: 'center', 
				mb: 2,
				p: 1.5,
				bgcolor: 'grey.50',
				borderRadius: 1,
				border: '1px solid',
				borderColor: 'grey.300'
			}}>
				<Typography variant="body2" fontWeight="medium" color="text.primary">
					Payment Details
				</Typography>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Typography variant="body2" color="text.secondary">
						Total: ₹{calculateTotalAmount().toLocaleString()}
					</Typography>
					<FormControlLabel
						control={
							<Switch
								checked={isSplitPayment}
								onChange={(e) => {
									setIsSplitPayment(e.target.checked);
									if (!e.target.checked) {
										// When disabling split payment, keep the highest amount method or default to cash
										const methodsWithAmounts = Object.entries(paymentAmounts)
											.filter(([_, amount]) => amount > 0)
											.sort(([, a], [, b]) => b - a);
										
										const primaryMethod = methodsWithAmounts.length > 0 ? 
											methodsWithAmounts[0][0] as PaymentMethod : 'cash';
										
										const currentTotal = calculateTotalAmount();
										setPaymentAmounts({
											cash: 0,
											credit_card: 0,
											debit_card: 0,
											upi: 0,
											bnpl: 0,
											membership: 0,
											[primaryMethod]: currentTotal
										});
										setWalkInPaymentMethod(primaryMethod);
										setValidationErrors({}); // Clear validation errors
									}
								}}
								color="primary"
								size="small"
							/>
						}
						label={
							<Typography variant="body2" color="text.secondary">
								{isSplitPayment ? 'Split Payment' : 'Single Method'}
							</Typography>
						}
					/>
				</Box>
			</Box>

			{/* Payment Status Alert */}
			{isOverpaid && (
				<Alert severity="warning" sx={{ mb: 2 }}>
					Total payment (₹{totalAmountEntered.toLocaleString()}) exceeds bill amount by ₹{(totalAmountEntered - totalAmount).toFixed(2)}
				</Alert>
			)}
			
			{isFullyPaid && !isOverpaid && (
				<Alert severity="success" sx={{ mb: 2 }}>
					Payment complete! ✓
				</Alert>
			)}
			
			{remainingAmount > 0 && (
				<Alert severity="info" sx={{ mb: 2 }}>
					Remaining amount: ₹{remainingAmount.toFixed(2)}
				</Alert>
			)}

			{/* Quick Actions for Single Payment Mode */}
			{!isSplitPayment && (
				<Box sx={{ mb: 2, p: 1.5, bgcolor: 'blue.50', borderRadius: 1, border: '1px dashed', borderColor: 'blue.300' }}>
					<Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block' }}>
						Quick Actions:
					</Typography>
					<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
						<Button 
							size="small" 
							variant={paymentAmounts.cash > 0 ? "contained" : "outlined"} 
							onClick={() => handleSinglePaymentMethod('cash')} 
							sx={{ minWidth: 'auto', px: 2 }}
						>
							Cash
						</Button>
						<Button 
							size="small" 
							variant={paymentAmounts.credit_card > 0 ? "contained" : "outlined"} 
							onClick={() => handleSinglePaymentMethod('credit_card')} 
							sx={{ minWidth: 'auto', px: 2 }}
						>
							Credit Card
						</Button>
						<Button 
							size="small" 
							variant={paymentAmounts.debit_card > 0 ? "contained" : "outlined"} 
							onClick={() => handleSinglePaymentMethod('debit_card')} 
							sx={{ minWidth: 'auto', px: 2 }}
						>
							Debit Card
						</Button>
						<Button 
							size="small" 
							variant={paymentAmounts.upi > 0 ? "contained" : "outlined"} 
							onClick={() => handleSinglePaymentMethod('upi')} 
							sx={{ minWidth: 'auto', px: 2 }}
						>
							UPI
						</Button>
					</Box>
				</Box>
			)}

			{/* Quick Actions for Split Payment */}
			{isSplitPayment && (
				<Box sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1, border: '1px dashed', borderColor: 'grey.300' }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
						<Typography variant="caption" color="text.secondary">
							Split Payment Actions:
						</Typography>
						<Tooltip title="In split payment mode, you can distribute the total amount across multiple payment methods">
							<Info fontSize="small" color="action" />
						</Tooltip>
					</Box>
					<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
						<Button size="small" variant="outlined" onClick={clearAllPayments} sx={{ minWidth: 'auto', px: 1 }}>
							Clear All
						</Button>
						<Button size="small" variant="outlined" onClick={distributeEqually} sx={{ minWidth: 'auto', px: 1 }}>
							Split Equally
						</Button>
						<Button size="small" variant="outlined" onClick={() => quickFillPayment('cash')} sx={{ minWidth: 'auto', px: 1 }}>
							Fill Cash
						</Button>
						<Button size="small" variant="outlined" onClick={() => quickFillPayment('credit_card')} sx={{ minWidth: 'auto', px: 1 }}>
							Fill Credit Card
						</Button>
						<Button size="small" variant="outlined" onClick={() => quickFillPayment('debit_card')} sx={{ minWidth: 'auto', px: 1 }}>
							Fill Debit Card
						</Button>
						<Button size="small" variant="outlined" onClick={() => quickFillPayment('upi')} sx={{ minWidth: 'auto', px: 1 }}>
							Fill UPI
						</Button>
					</Box>
				</Box>
			)}

			{/* Membership Status */}
			{activeClientMembership && activeClientMembership.isActive && (
				<Box sx={{ mb: 2, p: 1.5, bgcolor: 'primary.lightest', borderRadius: 1, border: '1px solid', borderColor: 'primary.light' }}>
					<Chip
						label={`${activeClientMembership.tierName} Member`}
						size="small"
						color="primary"
						sx={{ mr: 2 }}
					/>
					<Typography variant="body2" sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
						<AccountBalanceWalletIcon fontSize="small" sx={{ mr: 0.5 }} />
						Available Balance: ₹{activeClientMembership.currentBalance.toLocaleString()}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						Select individual services above to pay via membership
					</Typography>
				</Box>
			)}

			{/* Payment Method Cards */}
			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
				{(['cash', 'credit_card', 'debit_card', 'upi', 'bnpl'] as const).map(method => (
					<Box
						key={method}
						onClick={() => {
							if (!isSplitPayment) {
								handleSinglePaymentMethod(method);
							}
						}}
						sx={{
							minWidth: '140px',
							flex: '1 1 0',
							p: 1.5,
							border: '2px solid',
							borderColor: paymentAmounts[method] > 0 ? 'primary.main' : 
								validationErrors[method] ? 'error.main' : 'divider',
							borderRadius: '8px',
							bgcolor: paymentAmounts[method] > 0 ? 'primary.lighter' : 
								validationErrors[method] ? 'error.lighter' : 'background.paper',
							transition: 'all 0.2s ease',
							cursor: !isSplitPayment ? 'pointer' : 'default',
							'&:hover': !isSplitPayment ? {
								borderColor: 'primary.main',
								bgcolor: 'primary.lightest'
							} : {}
						}}
					>
						<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
							{React.cloneElement(PAYMENT_METHOD_ICONS[method] as React.ReactElement, {
								sx: { 
									mr: 1, 
									color: paymentAmounts[method] > 0 ? 'primary.main' : 
										validationErrors[method] ? 'error.main' : 'text.secondary'
								}
							})}
							<Typography variant="body2" fontWeight={paymentAmounts[method] > 0 ? 'bold' : 'normal'}>
								{PAYMENT_METHOD_LABELS[method]}
							</Typography>
						</Box>
						<TextField
							fullWidth
							size="small"
							type="number"
							value={paymentAmounts[method]}
							onChange={(e) => handlePaymentAmountChange(method, Number(e.target.value))}
							InputProps={{
								startAdornment: <InputAdornment position="start">₹</InputAdornment>
							}}
							inputProps={{
								min: 0,
								step: 1
							}}
							error={!!validationErrors[method]}
							helperText={validationErrors[method]}
							disabled={false}
						/>
						{isSplitPayment && paymentAmounts[method] > 0 && (
							<Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Typography variant="caption" color="text.secondary">
									{totalAmount > 0 ? ((paymentAmounts[method] / totalAmount) * 100).toFixed(1) : 0}%
								</Typography>
								<Button
									size="small"
									variant="text"
									color="error"
									onClick={(e) => {
										e.stopPropagation();
										handlePaymentAmountChange(method, 0);
									}}
									sx={{ minWidth: 'auto', p: 0.5 }}
								>
									Clear
								</Button>
							</Box>
						)}
					</Box>
				))}
			</Box>

			{/* Payment Summary */}
			{Object.entries(paymentAmounts).filter(([_, amount]) => amount > 0).length > 0 && (
				<Box sx={{ 
					p: 1.5, 
					bgcolor: isOverpaid ? 'warning.lightest' : 'success.lightest', 
					borderRadius: 1, 
					border: '1px solid', 
					borderColor: isOverpaid ? 'warning.light' : 'success.light',
					mb: 2 
				}}>
					<Typography variant="body2" fontWeight="medium" gutterBottom>
						Payment Summary
					</Typography>
					{Object.entries(paymentAmounts)
						.filter(([_, amount]) => amount > 0)
						.map(([method, amount]) => (
							<Box key={method} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
								<Typography variant="body2">
									{PAYMENT_METHOD_LABELS[method as PaymentMethod]}:
								</Typography>
								<Typography variant="body2" fontWeight="medium">
									₹{amount.toLocaleString()}
								</Typography>
							</Box>
						))}
					<Divider sx={{ my: 1 }} />
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<Typography variant="body2" fontWeight="bold">
							Total Paid:
						</Typography>
						<Typography variant="body2" fontWeight="bold" color={isOverpaid ? 'warning.main' : 'text.primary'}>
							₹{totalAmountEntered.toLocaleString()}
						</Typography>
					</Box>
					{remainingAmount > 0 && (
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
							<Typography variant="body2" color="text.secondary">
								Remaining:
							</Typography>
							<Typography variant="body2" fontWeight="medium" color="warning.main">
								₹{remainingAmount.toFixed(2)}
							</Typography>
						</Box>
					)}
					{isOverpaid && (
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
							<Typography variant="body2" color="warning.main">
								Overpaid:
							</Typography>
							<Typography variant="body2" fontWeight="medium" color="warning.main">
								₹{(totalAmountEntered - totalAmount).toFixed(2)}
							</Typography>
						</Box>
					)}
				</Box>
			)}
		</Box>
	);
};

export default PaymentSection; 
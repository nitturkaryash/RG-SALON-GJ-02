import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Container, Box, Typography, Paper, Tabs, Tab, TextField, Button, Grid, Card, CardContent, CardActions, FormControl, InputLabel, Select, MenuItem, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, CircularProgress, Collapse, Tooltip, FormHelperText } from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, RemoveShoppingCart, ShoppingBag, Check as CheckIcon, Refresh, AttachMoney, CreditCard, LocalAtm, AccountBalance, Receipt, Inventory, Search, Info as InfoIcon } from '@mui/icons-material';
import { supabase } from '../utils/supabase/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { PaymentMethod, usePOS, createWalkInOrder, CreateOrderData } from '../hooks/usePOS';
import { useProducts } from '../hooks/useProducts';
import { Order, OrderItem } from '../models/orderTypes';
import { useNavigate, useLocation } from "react-router-dom";
import {
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	Divider,
	Autocomplete,
	InputAdornment,
	Stepper,
	Step,
	StepLabel,
	Switch,
	FormControlLabel,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow
} from "@mui/material";
import {
	Menu as MenuIcon,
	Delete as DeleteIcon,
	ShoppingBasket as ShoppingBasketIcon,
	Payment as PaymentIcon,
	Person as PersonIcon,
	ContentCut as ContentCutIcon,
	AccessTime as AccessTimeIcon,
	DeleteOutline as DeleteOutlineIcon,
	ShoppingCart as CartIcon,
} from "@mui/icons-material";
import { LocalizationProvider, DatePicker, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useClients, Client } from "../hooks/useClients";
import { useStylists, Stylist } from "../hooks/useStylists";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from '@tanstack/react-query';
// Import the RefreshInventoryButton component
import RefreshInventoryButton from '../components/RefreshInventoryButton';
import LowStockWarning from '../components/LowStockWarning';
import ErrorBoundary from '../components/ErrorBoundary';
// First, import the useServices hook
import { useServices, Service } from '../hooks/useServices';
// Import useInventory hook
import { useInventory, SalonConsumptionItem } from '../hooks/useInventory';
import { format } from 'date-fns'; // Import format from date-fns
import { useAppointments } from '../hooks/useAppointments'; // <-- Import useAppointments
import { calculatePriceExcludingGST, calculateGSTAmount } from '../utils/gstCalculations';
// Add imports for Accordion components
import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryIcon from '@mui/icons-material/History';
import Drawer from '@mui/material/Drawer';
// Import membership hooks
import { useMembershipTiers } from '../hooks/useMembershipTiers';
import { MembershipTier } from '../types/membershipTier';
import CardMembershipIcon from '@mui/icons-material/CardMembership';

// Helper function to generate time slots
const generateTimeSlots = (startHour: number, endHour: number, interval: number): string[] => {
	const slots: string[] = [];
	const startDate = new Date();
	startDate.setHours(startHour, 0, 0, 0); // Start at the beginning of the hour

	const endDate = new Date();
	endDate.setHours(endHour, 0, 0, 0); // End at the beginning of the hour

	let currentTime = startDate;

	while (currentTime < endDate) {
		slots.push(format(currentTime, 'hh:mm a'));
		currentTime = new Date(currentTime.getTime() + interval * 60000); // Add interval in milliseconds
	}

	return slots;
};

// Tab interface for switching between appointment payments and walk-in sales
interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

const TabPanel = (props: TabPanelProps) => {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`pos-tabpanel-${index}`}
			aria-labelledby={`pos-tab-${index}`}
			{...other}
			style={{ blockSize: "100%", inlineSize: "100%" }}
		>
			{value === index && <Box sx={{
				blockSize: "100%",
				pt: 2,
				px: 1,
				inlineSize: "100%",
				borderRadius: '8px',
				overflow: 'hidden'
			}}>{children}</Box>}
		</div>
	);
};

// Define POSService interface
interface POSService {
	id: string;
	name: string;
	price: number;
	duration?: number;
	type?: "service" | "product";
	hsn_code?: string;
	units?: string;
	batch?: string;
	expiry?: string;
	description?: string;
	collection_name?: string;
	stock_quantity?: number;
	gst_percentage?: number;
	category?: string;
}

// Define POSMembership interface
interface POSMembership {
	id: string;
	name: string;
	price: number;
	duration_months: number;
	benefits: string[];
	description?: string;
	type?: "membership";
}

// Payment method labels for display
const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
	cash: "Cash",
	credit_card: "Credit Card",
	debit_card: "Debit Card",
	upi: "UPI",
	bnpl: "Pay Later",
};

// Available payment methods
const PAYMENT_METHODS: PaymentMethod[] = [
	"cash",
	"credit_card",
	"debit_card",
	"upi",
	"bnpl",
];

// Helper function to render the stock badge
const renderStockBadge = (product: POSService) => {
	// Explicitly check if stock_quantity is 0 or less
	if (product.stock_quantity === undefined || product.stock_quantity === null || product.stock_quantity <= 0) {
		return (
			<Chip
				label="Out of Stock"
				color="error"
				size="small"
				sx={{ borderRadius: '12px' }}
			/>
		);
	} else if (product.stock_quantity <= 5) {
		return (
			<Chip
				label={`In Stock (${product.stock_quantity})`}
				color="warning"
				size="small"
				sx={{ borderRadius: '12px' }}
			/>
		);
	} else {
		return (
			<Chip
				label={`In Stock (${product.stock_quantity})`}
				color="success"
				size="small"
				sx={{ borderRadius: '12px' }}
			/>
		);
	}
};

// Function to render a product card
const renderProductCard = (product: POSService, addHandler: (service: POSService) => void) => {
	// Check if product is out of stock
	const isOutOfStock = product.stock_quantity !== undefined &&
		product.stock_quantity !== null &&
		product.stock_quantity <= 0;

	return (
		<Card sx={{
			blockSize: '100%',
			display: 'flex',
			flexDirection: 'column',
			borderRadius: '8px',
			boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
			'&:hover': {
				boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
			},
			opacity: isOutOfStock ? 0.7 : 1
		}}>
			<CardContent sx={{ flexGrow: 1 }}>
				<Typography variant="h6" sx={{ fontWeight: 600 }}>{product.name}</Typography>
				<Typography color="text.secondary" sx={{ mb: 1 }}>
					₹{product.price}
				</Typography>
				<Box sx={{ mb: 2 }}>
					<Typography variant="body2" color="text.secondary">
						{product.description}
					</Typography>
					<Box sx={{ mt: 1 }}>
						{renderStockBadge(product)}
					</Box>
				</Box>
			</CardContent>
			<CardActions sx={{ justifyContent: 'flex-end', pt: 0, pb: 2, px: 2 }}>
				<Button
					variant="contained"
					size="small"
					color="primary"
					onClick={() => addHandler(product)}
					disabled={isOutOfStock}
					sx={{
						borderRadius: '6px',
						textTransform: 'none',
						fontWeight: 500
					}}
				>
					{isOutOfStock ? 'Out of Stock' : 'Add'}
				</Button>
			</CardActions>
		</Card>
	);
};

// Ensure formatCurrency is defined *outside* the component and only once
const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat('en-IN', {
		style: 'currency',
		currency: 'INR',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
};

// Add this debug function near the top of the file, after other imports but before the component definition
const debugStockQuantity = async (productId: string) => {
  try {
    console.log(`🔍 DEBUG: Checking stock for product ID ${productId}`);
    const { data, error } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .eq('id', productId)
      .single();
    
    if (error) {
      console.error(`🔍 DEBUG: Error fetching product ${productId}:`, error);
      return null;
    }
    
    console.log(`🔍 DEBUG: Product ${data.name} (${productId}) current stock: ${data.stock_quantity}`);
    return data.stock_quantity;
  } catch (err) {
    console.error('🔍 DEBUG: Error checking stock quantity:', err);
    return null;
  }
};

// Add this direct stock update function after the debugStockQuantity function
const directUpdateStockQuantity = async (productId: string, decrementAmount: number) => {
  try {
    console.log(`🛠️ DIRECT UPDATE: Updating stock for product ID ${productId} by ${decrementAmount}`);
    
    // First, get current stock
    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .eq('id', productId)
      .single();
    
    if (fetchError) {
      console.error(`🛠️ DIRECT UPDATE: Error fetching product ${productId}:`, fetchError);
      return false;
    }
    
    const currentStock = currentProduct?.stock_quantity || 0;
    console.log(`🛠️ DIRECT UPDATE: Current stock for ${currentProduct.name}: ${currentStock}`);
    
    // Calculate new stock (prevent negative values)
    const newStock = Math.max(0, currentStock - decrementAmount);
    console.log(`🛠️ DIRECT UPDATE: Setting new stock to ${newStock}`);
    
    // Update the stock
    const { data: updateResult, error: updateError } = await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', productId)
      .select();
    
    if (updateError) {
      console.error(`🛠️ DIRECT UPDATE: Error updating stock for ${productId}:`, updateError);
      return false;
    }
    
    console.log(`🛠️ DIRECT UPDATE: Successfully updated stock for ${currentProduct.name} to ${newStock}`);
    return true;
  } catch (err) {
    console.error('🛠️ DIRECT UPDATE: Error updating stock quantity:', err);
    return false;
  }
};

export default function POS() {
	// ====================================================
	// 1. HOOKS - Call ALL hooks unconditionally first
	// ====================================================
	const previousFocusRef = useRef(null);
	const orderDialogButtonRef = useRef(null);
	const consumptionDialogButtonRef = useRef(null);
	const snackbarRef = useRef(null);
	const processedNavKeyRef = useRef<string | null>(null); // Added ref to track processed navigation data
	const navigate = useNavigate();
	const location = useLocation();
	const queryClient = useQueryClient();

	// Custom Hooks
	const { clients, isLoading: loadingClients, updateClientFromOrder, createClientAsync } = useClients();
	const { stylists, isLoading: loadingStylists } = useStylists();
	const { createWalkInOrder: createWalkInOrderMutation, createOrder, orders, loadingOrders } = usePOS(); 
	const { products: inventoryProducts, isLoading: loadingInventoryProducts } = useProducts();
	const { services, isLoading: loadingServices } = useServices();
	const { recordSalonConsumption } = useInventory();
	const { appointments, isLoading: loadingAppointments, updateAppointment } = useAppointments();
	const { tiers: memberships, isLoading: loadingMemberships } = useMembershipTiers();

	// TanStack Queries/Mutations (These are hook calls)
	const { data: balanceStockData } = useQuery({
		queryKey: ['balance-stock'],
		queryFn: async () => {
			try {
				// Get stock data directly from the products table
				const { data, error } = await supabase
					.from('products')
					.select('id, name, stock_quantity, hsn_code, units')
					.filter('stock_quantity', 'gte', 0);

				if (error) {
					console.error('Error fetching from products table:', error);
					return [];
				}

				// Transform to balance_stock_view format
				return data.map(product => ({
					product_id: product.id,
					product_name: product.name,
					balance_qty: product.stock_quantity || 0,
					hsn_code: product.hsn_code,
					units: product.units
				}));
			} catch (error) {
				console.error('Error calculating balance stock:', error);
				return [];
			}
		},
		refetchOnWindowFocus: false,
		refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
		staleTime: 2 * 60 * 1000 // Consider data stale after 2 minutes
	});
	// Add other useQuery/useMutation calls here if they exist

	// State Hooks
	const [tabValue, setTabValue] = useState(0);
	// Keep the activeStep state for the Salon Consumption panel until we fully refactor it
	const [activeStep, setActiveStep] = useState(0);
	const [customerName, setCustomerName] = useState("");
	const [selectedClient, setSelectedClient] = useState<Client | null>(null);
	const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
	const [appointmentDate, setAppointmentDate] = useState<Date | null>(new Date());
	const [appointmentTime, setAppointmentTime] = useState<Date | null>(new Date());
	const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
	const [walkInPaymentMethod, setWalkInPaymentMethod] = useState<PaymentMethod>("cash");
	const [walkInDiscount, setWalkInDiscount] = useState(0);
	const [currentAppointmentId, setCurrentAppointmentId] = useState<string | null>(null);
	const [isSplitPayment, setIsSplitPayment] = useState(false);
	const [splitPayments, setSplitPayments] = useState<any[]>([]);
	const [newPaymentAmount, setNewPaymentAmount] = useState(0);
	const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>("cash");
	const [processing, setProcessing] = useState(false);
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [salonProducts, setSalonProducts] = useState<OrderItem[]>([]);
	const [consumptionPurpose, setConsumptionPurpose] = useState("");
	const [consumptionNotes, setConsumptionNotes] = useState("");
	const [requisitionVoucherNo, setRequisitionVoucherNo] = useState("");
	const [allProducts, setAllProducts] = useState<POSService[]>([]);
	const [loadingProducts, setLoadingProducts] = useState(true); // Keep this for internal product loading
	const [isProductGstApplied, setIsProductGstApplied] = useState(true);
	const [productGstRate, setProductGstRate] = useState(18);
	const [isServiceGstApplied, setIsServiceGstApplied] = useState(true);
	const [serviceGstRate, setServiceGstRate] = useState(18);
	const [walkInDiscountPercentage, setWalkInDiscountPercentage] = useState(0);
	// Add new state for filtering products and services
	const [productSearchTerm, setProductSearchTerm] = useState("");
	const [serviceSearchTerm, setServiceSearchTerm] = useState("");
	// State for dropdown selections
	const [selectedServiceId, setSelectedServiceId] = useState<string>("");
	const [selectedProductId, setSelectedProductId] = useState<string>("");
	const [serviceDropdownValue, setServiceDropdownValue] = useState<Service | null>(null);
	const [productDropdownValue, setProductDropdownValue] = useState<POSService | null>(null);
	const [membershipDropdownValue, setMembershipDropdownValue] = useState<MembershipTier | null>(null);
	// State for history drawer
	const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
	// State for client service history (raw supabase records)
	const [clientServiceHistory, setClientServiceHistory] = useState<any[]>([]);
	const [isHistoryLoading, setIsHistoryLoading] = useState(false);
	// Add new state for filtering memberships
	const [membershipSearchTerm, setMembershipSearchTerm] = useState("");
	// Add state for new client details
	const [newClientPhone, setNewClientPhone] = useState("");
	const [newClientEmail, setNewClientEmail] = useState("");

	// ====================================================
	// CALLBACK DEFINITIONS (MOVED UP OR RESTORED)
	// ====================================================

	const handleAddToOrder = useCallback((service: POSService, quantity: number = 1, customPrice?: number) => {
		console.log(`[handleAddToOrder] Called for: ${service.name} (ID: ${service.id}), Quantity: ${quantity}`);

		const isOutOfStock = service.type === 'product' &&
			(typeof service.stock_quantity === 'number' && service.stock_quantity <= 0);

		// Don't allow adding out-of-stock products
		if (isOutOfStock) {
			toast.error(`Cannot add "${service.name}" - Product is out of stock`);
			return;
		}

		console.log(`🛒 Adding to order - Product: ${service.name}, ID: ${service.id}, Type: ${service.type}, Quantity: ${quantity}, Current stock: ${service.stock_quantity}`);

		if (service.type === 'product' && typeof service.stock_quantity === 'number') {
			const existingItem = orderItems.find(item =>
				item.item_id === service.id
			);
			const existingQty = existingItem ? existingItem.quantity : 0;
			const newTotalQty = existingQty + quantity;

			console.log(`🛒 Stock check - Current cart quantity: ${existingQty}, Adding: ${quantity}, New total: ${newTotalQty}, Available: ${service.stock_quantity}`);

			if (newTotalQty > service.stock_quantity) {
				toast.warning(`Cannot add ${quantity} of "${service.name}" - Only ${service.stock_quantity} available (${existingQty} already in cart)`);
				return;
			}

			const remainingStock = service.stock_quantity - newTotalQty;
			if (remainingStock === 0) {
				toast.warning(`Added last ${quantity} of "${service.name}" to cart - No more in stock`);
			} else if (remainingStock > 0 && remainingStock <= 3) {
				toast.info(`Low stock warning: Only ${remainingStock} ${service.name} remaining after this sale`);
			}
		}

		const newItem: OrderItem = {
			id: uuidv4(),
			order_id: '',
			item_id: service.id,
			item_name: service.name,
			quantity: quantity,
			price: customPrice !== undefined ? customPrice : service.price,
			total: (customPrice !== undefined ? customPrice : service.price) * quantity,
			type: service.type || 'product',
			hsn_code: service.hsn_code,
			gst_percentage: service.gst_percentage,
			for_salon_use: false
		};

		console.log(`🛒 Created order item:`, newItem);

		setOrderItems((prev) => {
			const newState = [...prev, newItem];
			return newState;
		});

		toast.success(`Added ${service.name} to order`);
	}, [orderItems, toast]); // Keep dependencies for handleAddToOrder itself

	// RESTORING fetchClientHistory HERE
	const fetchClientHistory = useCallback(async (clientName: string) => {
		if (!clientName) return;
		setIsHistoryLoading(true);
		try {
			const { data, error } = await supabase
				.from('pos_order_items')
				.select(`
					id,
					service_name,
					price,
					quantity,
					type,
					pos_orders!inner (
						id,
						created_at,
						status,
						client_name
					)
				`)
				.eq('pos_orders.client_name', clientName)
				.order('created_at', { referencedTable: 'pos_orders', ascending: false })
				.limit(20);

			if (error) {
				console.error('Error fetching client history:', error);
				toast.error('Failed to load client history');
				setClientServiceHistory([]);
			} else {
				setClientServiceHistory(data || []);
			}
		} catch (err) {
			console.error('Error in client history fetch:', err);
			setClientServiceHistory([]);
		} finally {
			setIsHistoryLoading(false);
		}
	}, [supabase, toast, setIsHistoryLoading, setClientServiceHistory]);

	// RESTORING handleClientSelect HERE
	const handleClientSelect = useCallback((client: Client | null) => {
		setSelectedClient(client);
		if (client) {
			setCustomerName(client.full_name || '');
			setNewClientPhone(""); 
			setNewClientEmail("");
			if (client.full_name) { 
				fetchClientHistory(client.full_name); 
			} else {
				console.warn("Selected client has no name, cannot fetch history.");
				setClientServiceHistory([]);
			}
		} else {
			if (!customerName.trim()) {
				setNewClientPhone("");
				setNewClientEmail("");
			}
			setClientServiceHistory([]);
		}
	}, [fetchClientHistory, customerName, setSelectedClient, setCustomerName, setNewClientPhone, setNewClientEmail, setClientServiceHistory]);

	// ====================================================
	// 2. DERIVED STATE & CALCULATIONS (useMemo, useCallback)
	// ====================================================

	// Define calculation functions with useCallback FIRST
	const calculateProductSubtotal = useCallback(() => {
		return orderItems
			.filter(item => item.type === 'product')
			.reduce((sum, item) => sum + item.price * item.quantity, 0);
	}, [orderItems]);

	const calculateServiceSubtotal = useCallback(() => {
		return orderItems
			.filter(item => item.type === 'service')
			.reduce((sum, item) => sum + item.price * item.quantity, 0);
	}, [orderItems]);

	const calculateProductGstAmount = useCallback((subtotal: number) => {
		return isProductGstApplied ? (subtotal * productGstRate) / 100 : 0;
	}, [isProductGstApplied, productGstRate]);

	const calculateServiceGstAmount = useCallback((subtotal: number) => {
		return isServiceGstApplied ? (subtotal * serviceGstRate) / 100 : 0;
	}, [isServiceGstApplied, serviceGstRate]);

	const calculateTotalAmount = useCallback(() => {
		const prodSubtotal = calculateProductSubtotal();
		const servSubtotal = calculateServiceSubtotal();
		const prodGst = calculateProductGstAmount(prodSubtotal);
		const servGst = calculateServiceGstAmount(servSubtotal);
		const combinedSubtotal = prodSubtotal + servSubtotal + prodGst + servGst;
		const percentageDiscountAmount = (combinedSubtotal * walkInDiscountPercentage) / 100;
		const totalDiscount = walkInDiscount + percentageDiscountAmount;
		return Math.max(0, combinedSubtotal - totalDiscount); // Ensure total is not negative
	}, [calculateProductSubtotal, calculateServiceSubtotal, calculateProductGstAmount, calculateServiceGstAmount, walkInDiscount, walkInDiscountPercentage]);

	const calculateSalonGST = useCallback(() => {
		// Calculate taxable value and GST components for each product
		let totalTaxableValue = 0;
		let totalCGST = 0;
		let totalSGST = 0;

		salonProducts.forEach(item => {
			// Default to 18% if gst_percentage is not defined
			const gstPercentage = item.gst_percentage || 18;

			// Calculate taxable value (price excluding GST)
			const taxableValue = item.total / (1 + (gstPercentage / 100));
			totalTaxableValue += taxableValue;

			// Calculate GST amount
			const gstAmount = item.total - taxableValue;

			// Split into CGST and SGST (assuming intra-state transaction)
			totalCGST += gstAmount / 2;
			totalSGST += gstAmount / 2;
		});

		return {
			taxableValue: totalTaxableValue,
			cgst: totalCGST,
			sgst: totalSGST,
			totalGST: totalCGST + totalSGST
		};
	}, [salonProducts]);

	// Define getAmountPaid BEFORE pendingAmount uses it
	const getAmountPaid = useCallback(() => {
		return splitPayments.reduce((sum, payment) => sum + payment.amount, 0);
	}, [splitPayments]);

	// Now define useMemo values that might depend on useCallback functions
	const serviceItems = useMemo(() => {
		return orderItems.filter(
			(item) => item.type === "service" && !item.for_salon_use
		);
	}, [orderItems]);

	const productItems = useMemo(() => {
		return orderItems.filter(
			(item) => item.type === "product" && !item.for_salon_use
		);
	}, [orderItems]);

	const salonUseItems = useMemo(() => {
		return orderItems.filter(
			(item) => item.type === "product" && item.for_salon_use
		);
	}, [orderItems]);

	const serviceSubtotal = useMemo(() => {
		return serviceItems.reduce(
			(sum, item) => sum + item.total,
			0
		);
	}, [serviceItems]);

	const productSubtotalCalc = useMemo(() => {
		return productItems.reduce(
			(sum, item) => sum + item.total,
			0
		);
	}, [productItems]);

	const orderSubtotal = useMemo(() => {
		return serviceSubtotal + productSubtotalCalc;
	}, [serviceSubtotal, productSubtotalCalc]);

	const tax = useMemo(() => {
		return Math.round(orderSubtotal * 0.18);
	}, [orderSubtotal]);

	const total = useMemo(() => {
		return orderSubtotal + tax - walkInDiscount;
	}, [orderSubtotal, tax, walkInDiscount]);

	const salonProductsSubtotal = useMemo(() => {
		return salonProducts.reduce(
			(sum, item) => sum + item.total,
			0
		);
	}, [salonProducts]);

	// Define pendingAmount AFTER getAmountPaid is defined
	const pendingAmount = useMemo(() => {
		const amountPaid = getAmountPaid(); // Now safe to call
		return total - amountPaid;
	}, [total, getAmountPaid]); // Add getAmountPaid dependency

	// Payment amounts map for editable multi-method entries
	const [paymentAmounts, setPaymentAmounts] = useState<Record<PaymentMethod, number>>({
		cash: total,
		credit_card: 0,
		debit_card: 0,
		upi: 0,
		bnpl: 0
	});

	// Auto-update cash amount when total changes (if not split payment)
	useEffect(() => {
		if (!isSplitPayment) {
			const sumEntered = Object.values(paymentAmounts).reduce((a, b) => a + b, 0);
			if (sumEntered === 0) {
				setPaymentAmounts(prev => ({ ...prev, cash: total }));
			}
		}
	}, [total, isSplitPayment]);

	// Auto-fill cash based on other payment methods
	useEffect(() => {
		if (!isSplitPayment) {
			const sumOthers = (paymentAmounts.credit_card || 0) + (paymentAmounts.debit_card || 0) + (paymentAmounts.upi || 0) + (paymentAmounts.bnpl || 0);
			const newCash = Math.max(0, total - sumOthers);
			if (paymentAmounts.cash !== newCash) {
				setPaymentAmounts(prev => ({ ...prev, cash: newCash }));
			}
		}
	}, [paymentAmounts.credit_card, paymentAmounts.debit_card, paymentAmounts.upi, paymentAmounts.bnpl, total, isSplitPayment]);

	// Filtered products and services based on search terms
	const filteredProducts = useMemo(() => {
		if (!productSearchTerm.trim()) return allProducts;
		return allProducts.filter(product => 
			product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
			(product.description && product.description.toLowerCase().includes(productSearchTerm.toLowerCase()))
		);
	}, [allProducts, productSearchTerm]);

	const filteredServices = useMemo(() => {
		if (!serviceSearchTerm.trim()) return services || [];
		return (services || []).filter(service => 
			service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
			(service.description && service.description.toLowerCase().includes(serviceSearchTerm.toLowerCase()))
		);
	}, [services, serviceSearchTerm]);

	// Derive service history for the selected client
	const serviceHistory = useMemo(() => {
		if (!orders || !selectedClient) return [];
		return orders.filter(order => 
			order.client_name === selectedClient.full_name && 
			Array.isArray(order.services)
		);
	}, [orders, selectedClient]);

	// Filtered memberships based on search term
	const filteredMemberships = useMemo(() => {
		if (!membershipSearchTerm.trim()) return memberships || [];
		return (memberships || []).filter(membership => 
			membership.name.toLowerCase().includes(membershipSearchTerm.toLowerCase()) ||
			(membership.description && membership.description.toLowerCase().includes(membershipSearchTerm.toLowerCase()))
		);
	}, [memberships, membershipSearchTerm]);

	// ====================================================
	// 3. SIDE EFFECTS (useEffect)
	// ====================================================
	useEffect(() => {
		console.log('[POS useEffect] Running effect. Location:', location);
		const appointmentNavData = location.state?.appointmentData;

		if (appointmentNavData) {
			const currentNavKey = JSON.stringify(appointmentNavData);
			console.log('[POS useEffect] Found appointmentData in location.state. Key:', currentNavKey);

			if (processedNavKeyRef.current === currentNavKey) {
				console.log(`[POS useEffect] Appointment data with key ${currentNavKey} already processed. Ensuring state is cleared.`);
				if (location.state?.appointmentData) {
					navigate(location.pathname, { replace: true, state: {} });
				}
				return;
			}

			console.log('[POS useEffect] Processing new appointment data:', currentNavKey);
			processedNavKeyRef.current = currentNavKey; // Mark as processed

			setTabValue(0);

			if (appointmentNavData.clientName) {
				setCustomerName(appointmentNavData.clientName);
				const existingClient = clients?.find(c => c.full_name === appointmentNavData.clientName);
				if (existingClient) {
					setSelectedClient(existingClient);
				}
			}

			if (appointmentNavData.stylistId) {
				const existingStylist = stylists?.find(s => s.id === appointmentNavData.stylistId);
				if (existingStylist) {
					setSelectedStylist(existingStylist);
				}
			}

			if (appointmentNavData.services && Array.isArray(appointmentNavData.services) && (appointmentNavData.type === 'service_collection' || appointmentNavData.type === 'service')) {
				appointmentNavData.services.forEach((serviceInfo: any) => {
					const serviceFromHook = services?.find(s => s.id === serviceInfo.id);
					if (serviceFromHook) {
						console.log('[POS useEffect] Found service to add from array:', serviceFromHook.name, "(ID:", serviceFromHook.id, "). Calling handleAddToOrder...");
						const serviceForOrder: POSService = {
							id: serviceFromHook.id,
							name: serviceInfo.name || serviceFromHook.name, // Prefer name from nav data if available
							price: serviceInfo.price !== undefined ? serviceInfo.price : serviceFromHook.price,
							type: 'service', // Explicitly set type
							duration: serviceFromHook.duration,
							category: serviceFromHook.category,
						};
						handleAddToOrder(serviceForOrder, 1);
					} else {
						console.warn('[POS useEffect] Service ID from array (', serviceInfo.id, ') received, but service not found in local list.');
					}
				});
			} else if (appointmentNavData.serviceId && appointmentNavData.type === 'service') {
				// Fallback for old single service structure, if necessary, though Appointments.tsx was changed.
				const serviceFromHook = services?.find(s => s.id === appointmentNavData.serviceId);
				if (serviceFromHook) {
					console.log('[POS useEffect] Found single service to add (fallback):', serviceFromHook.name, "(ID:", serviceFromHook.id, "). Calling handleAddToOrder...");
					const serviceForOrder: POSService = {
						id: serviceFromHook.id,
						name: serviceFromHook.name,
						price: appointmentNavData.servicePrice !== undefined ? appointmentNavData.servicePrice : serviceFromHook.price,
						type: 'service', 
						duration: serviceFromHook.duration,
						category: serviceFromHook.category,
					};
					handleAddToOrder(serviceForOrder, 1);
				}
			}

			setCurrentAppointmentId(appointmentNavData.id || null);

			console.log('[POS useEffect] Clearing location state after processing...');
			navigate(location.pathname, { replace: true, state: {} });
			console.log('[POS useEffect] Location state cleared after processing.');
		} else {
			if (processedNavKeyRef.current !== null) {
				console.log('[POS useEffect] No appointmentData in location.state. Resetting processedNavKeyRef.');
				processedNavKeyRef.current = null;
			}
		}
	}, [location, services, clients, stylists, handleAddToOrder, navigate]); // Refined dependencies for this specific useEffect

	const fetchBalanceStockData = useCallback(async () => {
		console.log("Fetching latest stock data from products table...");
		try {
			// Get stock data directly from the products table
			const { data, error } = await supabase
				.from('products')
				.select('id, name, stock_quantity, hsn_code, units');

			if (error) {
				console.error("Error fetching product stock data:", error);
				return [];
			}

			console.log(`Found ${data.length} products with stock information`);

			// If data is available, update the stock quantities for products
			if (data && data.length > 0) {
				console.log('Updating product stock quantities...');

				// Make a copy of the current products state to update - using the callback form
				// to avoid dependency on allProducts
				setAllProducts(prevProducts => {
					// Map through existing products and update their stock quantities
					const updatedProducts = [...prevProducts].map(product => {
						// Find matching product in the fetched data
						const stockItem = data.find(item =>
							item.id === product.id ||
							item.name.trim().toLowerCase() === product.name.trim().toLowerCase()
						);

						// If matching product found, update stock quantity
						if (stockItem && stockItem.stock_quantity !== undefined) {
							if (product.stock_quantity !== stockItem.stock_quantity) {
								console.log(`Updating stock for ${product.name} from ${product.stock_quantity} to ${stockItem.stock_quantity}`);
								return { ...product, stock_quantity: stockItem.stock_quantity };
							}
						}

						// If no update needed, return the product unchanged
						return product;
					});

					return updatedProducts;
				});
			}

			return data || [];
		} catch (error) {
			console.error("Error in fetchBalanceStockData:", error);
			return [];
		}
	}, [supabase]); // Add dependencies if needed

	// Define fetchAllProducts BEFORE useEffect that uses it
	const fetchAllProducts = useCallback(async () => {
		setLoadingProducts(true);
		try {
			let allLoadedProducts: POSService[] = [];
			if (inventoryProducts && inventoryProducts.length > 0) {
				const mappedProducts = inventoryProducts.map((product) => ({
					id: product.id,
					name: product.name,
					price: product.mrp_per_unit_excl_gst || product.mrp_incl_gst || product.price || 0,
					description: `HSN: ${product.hsn_code || 'N/A'} | GST: ${product.gst_percentage}%`,
					type: "product" as "product" | "service",
					hsn_code: product.hsn_code,
					units: product.units,
					gst_percentage: product.gst_percentage,
					stock_quantity: product.stock_quantity || 0
				}));
				allLoadedProducts = [...mappedProducts];
			}
			setAllProducts(allLoadedProducts);
			if (allLoadedProducts.length > 0) {
				await fetchBalanceStockData();
			}
		} catch (error) {
			console.error('Error fetching products:', error);
			toast.error('Error loading products. Please try again.');
		} finally {
			setLoadingProducts(false);
		}
	}, [inventoryProducts, fetchBalanceStockData]);

	// UseEffect for initial fetch
	useEffect(() => {
		fetchAllProducts();
	}, [fetchAllProducts]);

	// ====================================================
	// 4. EVENT HANDLERS & HELPER FUNCTIONS (useCallback or regular)
	// ====================================================

	// Generate time slots (defined after helper function)
	const timeSlots = useMemo(() => generateTimeSlots(8, 20, 15), []);

	const handleAddSplitPayment = useCallback(() => {
		const newPayment = {
			id: Date.now().toString(),
			payment_method: newPaymentMethod,
			amount: newPaymentAmount,
		};

		// Add payment and set next payment amount to remaining pending
		setSplitPayments(prev => [...prev, newPayment]);
		setNewPaymentAmount(Math.max(0, pendingAmount - newPaymentAmount));
	}, [splitPayments, newPaymentMethod, newPaymentAmount, pendingAmount]);

	const handleRemoveSplitPayment = useCallback((id: string) => {
		setSplitPayments(splitPayments.filter((payment) => payment.id !== id));
	}, [splitPayments]);

	// Modify the isStepValid function to check all required fields at once
	const isOrderValid = useCallback(() => {
		// Customer info validation
		const customerInfoValid = customerName.trim() !== "" && selectedStylist !== null;
		
		// Order items validation
		const orderItemsValid = orderItems.length > 0;
		
		// Payment validation (only for split payment)
		const paymentValid = !isSplitPayment || (isSplitPayment && pendingAmount <= 0);
		
		return customerInfoValid && orderItemsValid && paymentValid;
	}, [customerName, selectedStylist, orderItems, isSplitPayment, pendingAmount]);

	// Modify handleCreateWalkInOrder to use the isOrderValid function
	const handleCreateWalkInOrder = useCallback(async () => {
		if (!isOrderValid()) {
			setSnackbarMessage("Please complete all required fields.");
			setSnackbarOpen(true);
			return;
		}
		
		const totalAmount = calculateTotalAmount();
		const amountPaid = isSplitPayment ? getAmountPaid() : totalAmount;
		
		if (amountPaid < totalAmount) {
			setSnackbarMessage("Payment amount is less than the total amount.");
			setSnackbarOpen(true);
			return;
		}
		
		setProcessing(true);
		
		try {
			let clientIdToUse = selectedClient?.id;
			let clientNameToUse = selectedClient?.full_name || customerName.trim();
			let isNewClient = false;

			// If no existing client is selected and a customer name is provided, create a new client
			if (!selectedClient && customerName.trim() !== "") {
				isNewClient = true;
				console.log("Attempting to create new client:", customerName.trim());
				try {
					const newClientData = {
						full_name: customerName.trim(),
						phone: newClientPhone.trim(),
						email: newClientEmail.trim(),
						notes: 'Added via POS' // Default note
					};
					// Assume createClient is async and returns the created client object or relevant part
					const createdClient = await createClientAsync(newClientData); // Use createClientAsync 
					if (createdClient && createdClient.id) {
						clientIdToUse = createdClient.id;
						clientNameToUse = createdClient.full_name; // Use the name from the created client
						toast.success(`New client '${clientNameToUse}' created successfully!`);
						// queryClient.invalidateQueries({ queryKey: ['clients'] }); // Example for TanStack Query
					} else {
						// This case might indicate createClient didn't return expected data or failed silently before throwing
						throw new Error('New client was processed but ID is missing.'); 
					}
				} catch (error) {
					console.error("Error creating new client:", error);
					const message = error instanceof Error ? error.message : "Unknown error creating client";
					setSnackbarMessage(`Error creating client: ${message}`);
					setSnackbarOpen(true);
					setProcessing(false);
					return; // Stop order processing if client creation fails
				}
			}

			// Log order items for inventory tracking
			const productItems = orderItems.filter(item => item.type === 'product');
			const serviceItems = orderItems.filter(item => item.type === 'service');
			
			console.log(`📦 Creating order with ${orderItems.length} total items, including ${productItems.length} products that will reduce inventory:`);
			if (productItems.length > 0) {
				productItems.forEach(product => {
					console.log(`📦 Product: ${product.item_name}, ID: ${product.item_id}, Quantity: ${product.quantity}`);
				});
			}

			// Correct arguments for updateClientFromOrder 
			// We need the actual total amount and payment method for the order
			const actualTotalAmount = calculateTotalAmount();
			const actualPaymentMethod = isSplitPayment ? 'split' : walkInPaymentMethod;
			
			// Only update client if a name is available
			const finalClientNameToUpdate = clientNameToUse; 
			if (finalClientNameToUpdate && finalClientNameToUpdate !== 'Walk-in Customer') { 
				await updateClientFromOrder(
					finalClientNameToUpdate,
					actualTotalAmount,      
					actualPaymentMethod,    
					new Date().toISOString() 
				);
			} else {
				console.log('Skipping client update for generic Walk-in Customer or missing name.');
			}
			
			// Rather than using the orderData CreateOrderData object directly,
			// transform it to match the parameters expected by the standalone createWalkInOrder function
			
			// Convert services to format expected by standalone function
			const formattedServices = serviceItems.map(service => ({
				id: service.item_id,
				service_id: service.item_id,
				service_name: service.item_name,
				name: service.item_name,
				price: service.price,
				quantity: service.quantity,
				gst_percentage: service.gst_percentage || 0,
				hsn_code: service.hsn_code || '',
				type: 'service' as const,
				product_id: service.item_id, // Add these fields for type compatibility
				product_name: service.item_name
			}));
			
			// Convert products to format expected by standalone function
			const formattedProducts = productItems.map(item => ({
				id: item.item_id,
				name: item.item_name,
				price: item.price,
				quantity: item.quantity,
				type: 'product' as const,
				gst_percentage: item.gst_percentage || 0,
				hsn_code: item.hsn_code || '',
				service_id: item.item_id,
				service_name: item.item_name,
				product_id: item.item_id,
				product_name: item.item_name
			}));
			
			// Format selected stylist
			const staffInfo = selectedStylist ? {
				id: selectedStylist.id,
				name: selectedStylist.name
			} : null;
			
			// Generate invoice number if needed
			const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
			
			console.log(`📦 Calling standalone createWalkInOrder with:`, {
				customerName: clientNameToUse, 
				products: formattedProducts.length,
				services: formattedServices.length,
				staffInfo
			});
			
			// Call the standalone function with the correct parameters
			const orderResult = await createWalkInOrderMutation.mutateAsync({
				order_id: uuidv4(),
				client_id: clientIdToUse || '', 
				client_name: clientNameToUse,    
				stylist_id: staffInfo?.id || '',
				stylist_name: staffInfo?.name || '',
				items: [],
				services: ([...formattedProducts, ...formattedServices] as any[]),
				
				payment_method: isSplitPayment ? 'split' : walkInPaymentMethod,
				split_payments: isSplitPayment ? splitPayments : undefined,
				discount: walkInDiscount,
				discount_percentage: walkInDiscountPercentage,  // Add discount percentage
				subtotal: calculateProductSubtotal() + calculateServiceSubtotal(),
				tax: calculateProductGstAmount(calculateProductSubtotal()) + calculateServiceGstAmount(calculateServiceSubtotal()),
				total: calculateTotalAmount(),
				total_amount: calculateTotalAmount(),
				status: 'completed',
				order_date: new Date().toISOString(),
				is_walk_in: true,
				is_salon_consumption: false,
				pending_amount: isSplitPayment ? Math.max(0, calculateTotalAmount() - getAmountPaid()) : 0,
				payments: isSplitPayment ? splitPayments : [{
					id: uuidv4(),
					amount: calculateTotalAmount(),
					payment_method: walkInPaymentMethod,
					payment_date: new Date().toISOString()
				}]
			});
			
			if (!orderResult.success) {
				throw new Error(orderResult.error?.message || 'Failed to create order');
			}

			// --- Update Appointment Status if Applicable ---
			if (currentAppointmentId && updateAppointment) {
				try {
					await updateAppointment({ id: currentAppointmentId, status: 'completed', paid: true, clientDetails: [] });
					console.log(`Appointment ${currentAppointmentId} marked as completed and paid.`);
				} catch (updateError) {
					console.error(`Failed to update appointment status for ${currentAppointmentId}:`, updateError);
					toast.error('Order created, but failed to update appointment status.');
				}
			}

			setSnackbarMessage("Order created successfully!");
			setSnackbarOpen(true);
			resetFormState();
			
			if (orderResult.success) {
				console.log('🔍 DEBUG: Order created successfully, checking product stock quantities...');
				
				// Replace the existing timeout block with this one
				setTimeout(async () => {
					let stockUpdateNeeded = false;
					
					for (const product of formattedProducts) {
						if (product.id) {
							const stockQty = await debugStockQuantity(product.id);
							console.log(`🔍 DEBUG: After order - Product ${product.name} (${product.id}) stock quantity: ${stockQty}`);
							
							// Check if the quantity has actually changed
							if (stockQty === null || typeof stockQty === 'number') {
								const initialStockQty = allProducts.find(p => p.id === product.id)?.stock_quantity;
								console.log(`🔍 DEBUG: Initial stock was: ${initialStockQty}, current is: ${stockQty}`);
								
								if (initialStockQty && stockQty !== null && stockQty >= initialStockQty) {
									console.log(`🔍 DEBUG: Stock not reduced for ${product.name}, applying direct update fallback`);
									stockUpdateNeeded = true;
									
									// Apply direct stock update
									await directUpdateStockQuantity(product.id, product.quantity || 1);
									
									// Verify after direct update
									const updatedStock = await debugStockQuantity(product.id);
									console.log(`🔍 DEBUG: After direct update - Product ${product.name} stock: ${updatedStock}`);
								}
							}
						}
					}
					
					if (stockUpdateNeeded) {
						console.log('🔍 DEBUG: Direct stock updates applied. Refreshing UI...');
						// Trigger inventory refresh
						window.dispatchEvent(new CustomEvent('inventory-updated'));
						fetchBalanceStockData();
					}
				}, 1000);
			}
			
		} catch (error) {
			console.error("Error creating walk-in order:", error);
			const message = error instanceof Error ? error.message : "Unknown error";
			setSnackbarMessage(`Error creating order: ${message}`);
			setSnackbarOpen(true);
		} finally {
			setProcessing(false);
		}
	}, [currentAppointmentId, updateAppointment, orderItems, isOrderValid, calculateProductSubtotal, calculateServiceSubtotal, calculateProductGstAmount, calculateServiceGstAmount, walkInDiscount, getAmountPaid, selectedClient, selectedStylist, customerName, createWalkInOrderMutation, createOrder, isSplitPayment, splitPayments, productGstRate, serviceGstRate, calculateTotalAmount, allProducts, fetchBalanceStockData, directUpdateStockQuantity, createClientAsync, newClientPhone, newClientEmail]);

	const resetFormState = useCallback(() => {
		// Remove activeStep reset since we don't use steps anymore
		// setActiveStep(0);
		setCustomerName("");
		setSelectedClient(null);
		setSelectedStylist(null);
		setAppointmentDate(new Date());
		setAppointmentTime(new Date());
		setOrderItems([]);
		setWalkInPaymentMethod("cash");
		setIsSplitPayment(false);
		setSplitPayments([]);
		setNewPaymentAmount(0);
		setNewPaymentMethod("cash");
		setWalkInDiscount(0);
		setWalkInDiscountPercentage(0); // Reset percentage discount
		setCurrentAppointmentId(null); // <-- Reset appointment ID
		// Reset new client fields as well
		setNewClientPhone("");
		setNewClientEmail("");
		// Reset salon consumption state if it exists
		setSalonProducts([]);
		setConsumptionPurpose("");
		setConsumptionNotes("");
		setRequisitionVoucherNo("");
		// Reset search terms
		setProductSearchTerm("");
		setServiceSearchTerm("");
		setMembershipSearchTerm("");
		// Reset dropdown values
		setServiceDropdownValue(null);
		setProductDropdownValue(null);
		setMembershipDropdownValue(null);
	}, []);

	const handleAddSalonProduct = useCallback((service: POSService, quantity: number = 1) => {
		// Check if product already exists in salon products
		const existingProductIndex = salonProducts.findIndex(
			(item) => item.item_id === service.id
		);

		if (existingProductIndex >= 0) {
			// Product already exists, increase quantity
			const updatedProducts = [...salonProducts];
			updatedProducts[existingProductIndex].quantity += quantity;
			updatedProducts[existingProductIndex].total =
				updatedProducts[existingProductIndex].quantity * updatedProducts[existingProductIndex].price;
			setSalonProducts(updatedProducts);
		} else {
			// Create a new order item for salon use
			const newItem: OrderItem = {
				id: uuidv4(),
				order_id: '',
				item_id: service.id,
				item_name: service.name,
				quantity: quantity,
				price: service.price,
				total: service.price * quantity,
				type: 'product',
				gst_percentage: service.gst_percentage,
				hsn_code: service.hsn_code,
				for_salon_use: true,
				purpose: consumptionPurpose
			};

			setSalonProducts((prev) => [...prev, newItem]);
		}
	}, [salonProducts, consumptionPurpose]);

	const handleRemoveSalonProduct = useCallback((serviceId: string) => {
		setSalonProducts((prev) => prev.filter((item) => item.item_id !== serviceId));
	}, []);

	const isSalonConsumptionValid = useCallback(() => {
		// Check all requirements at once
		return salonProducts.length > 0 && consumptionPurpose.trim() !== '';
	}, [salonProducts, consumptionPurpose]);

	const handleCreateSalonConsumptionWorkaround = useCallback(async () => {
		if (!isSalonConsumptionValid()) {
			toast.error('Please add products and provide a purpose for consumption');
			return;
		}

		try {
			setProcessing(true);
			const currentDate = new Date().toISOString();

			// Record results for each product
			const updateResults = [];

			// Process each product one by one - DIRECT DATABASE ACCESS
			for (const product of salonProducts) {
				try {
					// 1. First get the CURRENT stock value
					const { data: currentProductData, error: fetchError } = await supabase
						.from('products')
						.select('id, name, stock_quantity')
						.eq('id', product.item_id)
						.single();

					if (fetchError) {
						console.error(`Error fetching current stock for ${product.item_name}:`, fetchError);
						toast.error(`Could not retrieve stock for ${product.item_name}`);
						updateResults.push({
							product: product.item_name,
							success: false,
							error: 'Failed to fetch current stock'
						});
						continue;
					}

					// Log the current stock
					const currentStock = currentProductData?.stock_quantity || 0;
					console.log(`Current stock for ${product.item_name}: ${currentStock}`);

					// Calculate tax values based on current stock
					const price = product.price || 0;
					const gstPercentage = product.gst_percentage || 0;
					const currentStockValue = currentStock * price;
					
					// Calculate CGST and SGST (half of total GST each)
					const gstRate = gstPercentage / 100;
					const totalTax = currentStockValue * gstRate;
					const cgst = totalTax / 2;
					const sgst = totalTax / 2;
					
					console.log(`Tax calculation for ${product.item_name}:`, {
						currentStock,
						price,
						currentStockValue,
						gstRate,
						totalTax,
						cgst,
						sgst
					});

					// 2. DIRECTLY calculate new stock by subtracting the exact quantity
					const targetStock = Math.max(0, currentStock - product.quantity);
					console.log(`Setting new stock for ${product.item_name} to ${targetStock} (reducing by ${product.quantity})`);

					// 3. Update the stock directly without any adjustment factors
					const { data: updateData, error: updateError } = await supabase
						.from('products')
						.update({ stock_quantity: targetStock })
						.eq('id', product.item_id)
						.select('id, name, stock_quantity');

					if (updateError) {
						console.error(`Error setting stock for ${product.item_name}:`, updateError);
						updateResults.push({
							product: product.item_name,
							success: false,
							error: 'Failed to update stock'
						});
					} else {
						// 4. Log success
						console.log(`Successfully set stock for ${product.item_name} to ${targetStock}`);
						updateResults.push({
							product: product.item_name,
							success: true,
							initialStock: currentStock,
							finalStock: targetStock,
							consumed: product.quantity
						});
						
						// 5. Add consumption record with tax details
						const salonConsumptionEntry = {
							id: uuidv4(),
							date: currentDate,
							created_at: currentDate,
							product_name: product.item_name,
							hsn_code: product.hsn_code || '',
							units: product.units || '',              // Added units (Product Type)
							quantity: product.quantity,
							purpose: consumptionPurpose,
							price_per_unit: price,                   // Use numeric value
							gst_percentage: gstPercentage,           // Use numeric percentage
							// Map to the new column names in inventory_salon_consumption
							current_stock: currentStock,
							current_stock_taxable_value: parseFloat((currentStock * price).toFixed(2)), // Renamed
							current_stock_igst: 0, // Added (always 0 for local consumption)
							current_stock_sgst: parseFloat(sgst.toFixed(2)), // Renamed
							current_stock_cgst: parseFloat(cgst.toFixed(2)), // Renamed
							current_stock_total_value: parseFloat(totalTax.toFixed(2)) // Renamed
						};
						
						const { error: consumptionError } = await supabase
							.from('inventory_salon_consumption')
							.insert(salonConsumptionEntry);
						
						if (consumptionError) {
							console.error(`Error inserting salon consumption record for ${product.item_name}:`, consumptionError);
						} else {
							console.log(`Added salon consumption record for ${product.item_name} with tax details`);
						}
					}

					// 6. Verify the final stock matches what we expect
					const { data: verifyData, error: verifyError } = await supabase
						.from('products')
						.select('id, name, stock_quantity')
						.eq('id', product.item_id)
						.single();

					if (verifyError) {
						console.error(`Error verifying final stock for ${product.item_name}:`, verifyError);
					} else {
						const finalStock = verifyData?.stock_quantity || 0;
						console.log(`Verified final stock for ${product.item_name}: ${finalStock}`);

						if (finalStock !== targetStock) {
							console.error(`Stock mismatch for ${product.item_name}! Expected ${targetStock} but got ${finalStock}`);

							// If there's a mismatch, try one more time to set it correctly
							console.log(`Attempting to fix stock mismatch for ${product.item_name}...`);
							const { error: fixError } = await supabase
								.from('products')
								.update({ stock_quantity: targetStock })
								.eq('id', product.item_id);

							if (fixError) {
								console.error(`Failed to fix stock mismatch for ${product.item_name}:`, fixError);
							} else {
								console.log(`Fixed stock mismatch for ${product.item_name}`);
							}
						}
					}
				} catch (err) {
					console.error(`Error processing ${product.item_name}:`, err);
					updateResults.push({
						product: product.item_name,
						success: false,
						error: err instanceof Error ? err.message : String(err)
					});
				}
			}

			// Now create a record in pos_orders to track this consumption
			try {
				// Create order ID
				const orderId = uuidv4();

				// Format the products for order items - ENSURE CORRECT QUANTITIES
				const orderItems = salonProducts.map((product, idx) => ({
					id: uuidv4(),
					service_id: product.item_id,
					service_name: product.item_name,
					service_type: 'product',
					price: product.price,
					quantity: product.quantity, // Use the EXACT quantity, no division
					gst_percentage: product.gst_percentage,
					hsn_code: product.hsn_code,
					created_at: currentDate,
					pos_order_id: orderId
				}));

				// Calculate order total
				const orderTotal = salonProducts.reduce((sum, product) => sum + product.total, 0);

				// Create order record with fields exactly matching the pos_orders table schema
				const orderData = {
					id: orderId,
					created_at: currentDate,
					client_name: 'Salon Consumption',
					customer_name: 'Salon Consumption', // Add for consistency
					consumption_purpose: consumptionPurpose,
					consumption_notes: consumptionNotes,
					total: orderTotal,
					total_amount: orderTotal, // Add for consistency
					type: 'salon_consumption',
					is_salon_consumption: true,
					status: 'completed',
					payment_method: 'internal',
					services: salonProducts.map((product, idx) => ({
						id: orderItems[idx].id,          // Match pos_order_items UUID
						type: 'product',
						price: product.price,
						quantity: product.quantity,
						service_id: product.item_id,
						service_name: product.item_name,
						product_id: product.item_id,    // Add product_id for reference
						product_name: product.item_name,// Add product_name
						gst_percentage: product.gst_percentage || 0,
						hsn_code: product.hsn_code || '',
						units: product.units || '',
						for_salon_use: true
					}))
				};

				console.log('Creating order record with data:', orderData);

				// Insert order record into pos_orders
				const { data: orderResult, error: orderError } = await supabase
					.from('pos_orders')
					.insert(orderData)
					.select();

				if (orderError) {
					console.error('Error creating consumption order record:', orderError);
					throw new Error(`Failed to record consumption order: ${orderError.message}`);
				}

				console.log('Successfully inserted order record:', orderResult);

				// Insert order items into pos_order_items AND update the local storage orders
				const { data: itemsResult, error: itemsError } = await supabase
					.from('pos_order_items')
					.insert(orderItems)
					.select();

				if (itemsError) {
					console.error('Error creating consumption order items:', itemsError);
					throw new Error(`Failed to record consumption order items: ${itemsError.message}`);
				}

				// Also update localStorage orders for immediate access
				try {
					const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
					const newOrder = {
						...orderData,
						items: orderItems.map(item => ({
							...item,
							order_id: orderId,
							created_at: currentDate
						}))
					};

					// Add to beginning of array for newest first
					existingOrders.unshift(newOrder);
					localStorage.setItem('orders', JSON.stringify(existingOrders));
					console.log('Updated localStorage with new salon consumption order');
				} catch (localStorageError) {
					console.error('Error updating localStorage:', localStorageError);
					// Non-critical error, continue execution
				}

				console.log('Successfully inserted order items:', itemsResult);
				console.log('Successfully recorded salon consumption order');

				// Refresh orders by dispatching a refresh-orders event
				window.dispatchEvent(new CustomEvent('refresh-orders'));
			} catch (orderError) {
				console.error('Error recording consumption order:', orderError);
				// We don't throw here to ensure the stock updates are kept even if order creation fails
				toast.warning('Stock updated but consumption record creation failed.');
				// Continue execution rather than returning here, so other cleanup tasks can run
			}

			// Log consumption details
			console.log('Salon consumption summary:', {
				date: currentDate,
				purpose: consumptionPurpose,
				notes: consumptionNotes,
				products: salonProducts.map(p => ({
					name: p.item_name,
					quantity: p.quantity
				})),
				updateResults
			});

			// Refresh UI
			if (typeof queryClient !== 'undefined') {
				queryClient.invalidateQueries({ queryKey: ['products'] });
				queryClient.invalidateQueries({ queryKey: ['balance-stock'] });
				queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
				// Refresh salon consumption data in Inventory Manager and SalonConsumptionTab
				queryClient.invalidateQueries({ queryKey: ['inventory-salon-consumption'] });
				queryClient.invalidateQueries({ queryKey: ['salon-consumption-products'] });
			}

			window.dispatchEvent(new CustomEvent('inventory-updated'));
			await fetchBalanceStockData();

			// Success message
			toast.success('Salon consumption recorded successfully');

			// Reset form and navigate to orders page instead of inventory page
			resetFormState();
			navigate('/orders');

		} catch (error: any) {
			console.error('Error creating salon consumption:', error);
			toast.error(`Error: ${error.message || 'Unknown error occurred'}`);
		} finally {
			setProcessing(false);
		}
	}, [currentAppointmentId, updateAppointment, orderItems, isOrderValid, calculateProductSubtotal, calculateServiceSubtotal, calculateProductGstAmount, calculateServiceGstAmount, walkInDiscount, getAmountPaid, selectedClient, selectedStylist, customerName, createWalkInOrderMutation, createOrder, isSplitPayment, splitPayments, productGstRate, serviceGstRate, salonProducts, consumptionPurpose, consumptionNotes, requisitionVoucherNo, fetchBalanceStockData, resetFormState, navigate, queryClient, directUpdateStockQuantity, createClientAsync, newClientPhone, newClientEmail]); // Changed createClient to createClientAsync here as well

	const handleRemoveFromOrder = useCallback((itemId: string) => {
		setOrderItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
		toast.info("Item removed from order.");
	}, []);

	const handleItemPriceChange = useCallback((itemId: string, newPrice: number) => {
		setOrderItems(prevItems =>
			prevItems.map(item =>
				item.id === itemId ? { ...item, price: isNaN(newPrice) ? 0 : newPrice } : item
			)
		);
	}, []);

	// Ensure createAppointmentOrder is defined here (using useCallback)
	const createAppointmentOrder = useCallback(async (appointmentId: string) => {
		const appointment = appointments?.find(app => app.id === appointmentId); 
		if (!appointment) { toast.error("Appointment details not found."); return; }

		const client = selectedClient ?? { id: appointment.client_id, full_name: 'Unknown' };
		const stylist = selectedStylist ?? { id: appointment.stylist_id, name: 'Unknown' };

		const itemsForOrder = orderItems.map(item => ({ 
			id: item.id,
			item_id: item.item_id,
			item_name: item.item_name,
			quantity: item.quantity,
			price: item.price,
			total: item.price * item.quantity,
			type: item.type,
			hsn_code: item.hsn_code,
			units: item.units,
			category: item.category,
			gst_percentage: item.type === 'product' ? productGstRate : serviceGstRate,
			discount: item.discount || 0,
			for_salon_use: item.for_salon_use
		}));

		const gstAmount = calculateProductGstAmount(calculateProductSubtotal()) + calculateServiceGstAmount(calculateServiceSubtotal());
		const totalAmount = calculateTotalAmount();

		try {
			if (createOrder && typeof createOrder.mutateAsync === 'function') {
				const baseOrderData: CreateOrderData = {
					order_id: `order_${uuidv4()}`,
					client_id: client.id,
					client_name: client.full_name,
					stylist_id: stylist.id,
					items: itemsForOrder,
					services: itemsForOrder.filter(i => i.type === 'service').map(i => ({ 
						service_id: i.item_id,
						service_name: i.item_name,
						quantity: i.quantity,
						price: i.price,
					})), 
					subtotal: calculateProductSubtotal() + calculateServiceSubtotal(), 
					tax: gstAmount,
					discount: walkInDiscount, 
					total: totalAmount,
					payment_method: isSplitPayment ? 'split' : walkInPaymentMethod,
					split_payments: isSplitPayment ? splitPayments : [],
					notes: appointment.notes || "",
					gst_amount: gstAmount, 
					total_amount: totalAmount,
					status: 'completed', 
					order_date: new Date().toISOString(),
					is_walk_in: false,
				};

				// Construct the object matching Partial<Order> based on its definition
				const orderPayload: Partial<CreateOrderData> = {
					order_id: baseOrderData.order_id,
					client_id: baseOrderData.client_id,
					client_name: baseOrderData.client_name, 
					order_date: baseOrderData.order_date,
					items: baseOrderData.items,
					services: baseOrderData.services,
					subtotal: baseOrderData.subtotal,
					tax: baseOrderData.tax,
					discount: baseOrderData.discount,
					total: baseOrderData.total,
					payment_method: baseOrderData.payment_method,
					split_payments: baseOrderData.split_payments,
					notes: baseOrderData.notes,
					gst_amount: baseOrderData.gst_amount,
					total_amount: baseOrderData.total_amount,
					status: baseOrderData.status,
					is_walk_in: baseOrderData.is_walk_in,
					stylist_id: baseOrderData.stylist_id,
				};

				await createOrder.mutateAsync(orderPayload);
			} else if (typeof createOrder === 'function') {
				const walkInOrderData: CreateOrderData = {
					order_id: `order_${uuidv4()}`,
					client_id: client.id,
					client_name: client.full_name,
					stylist_id: stylist.id,
					items: itemsForOrder, 
					services: itemsForOrder.filter(i => i.type === 'service').map(i => ({ 
						service_id: i.item_id,
						service_name: i.item_name,
						quantity: i.quantity,
						price: i.price,
					})), 
					subtotal: calculateProductSubtotal() + calculateServiceSubtotal(), 
					tax: gstAmount,
					discount: walkInDiscount, 
					total: totalAmount,
					payment_method: isSplitPayment ? 'split' : walkInPaymentMethod,
					split_payments: isSplitPayment ? splitPayments : [],
					notes: appointment.notes || "",
					gst_amount: gstAmount, 
					total_amount: totalAmount,
					status: 'completed', 
					order_date: new Date().toISOString(),
					is_walk_in: false,
				};
				await createWalkInOrderMutation.mutateAsync(walkInOrderData); // Call with CreateOrderData
			}
			toast.success("Order created successfully for appointment.");
			
			// Reset form state
			resetFormState();
		} catch (error: any) {
			console.error("Failed to create order:", error);
			toast.error(`Failed to create order: ${error?.message || 'Unknown error'}`);
		}
	}, [appointments, selectedClient, selectedStylist, orderItems, productGstRate, serviceGstRate, calculateProductGstAmount, calculateServiceGstAmount, calculateTotalAmount, calculateProductSubtotal, calculateServiceSubtotal, walkInDiscount, isSplitPayment, splitPayments, walkInPaymentMethod, createOrder, createWalkInOrderMutation, resetFormState]);

	// Add this helper function to group services by category
	const groupByCategory = (items: POSService[] | Service[]): Record<string, (POSService | Service)[]> => {
		const groupedItems: Record<string, (POSService | Service)[]> = {};
		
		// First pass: collect all categories
		items.forEach(item => {
			const category = item.category || 'Uncategorized';
			if (!groupedItems[category]) {
				groupedItems[category] = [];
			}
			groupedItems[category].push(item);
		});
		
		return groupedItems;
	};

	// Change renderServiceSelectionSection to return null
	const renderServiceSelectionSection = () => {
		// Group services by category
		// const groupedServices = groupByCategory(filteredServices as Service[]); // This line can be kept if other logic depends on it, or removed if not
		
		// Return null to hide this section as per user request to revert to dropdown-only UI for services
		return null;

		/* Original card rendering code - kept for reference if needed later
		return (
			<Box sx={{ p: 2 }}>
				<Typography variant="h6" gutterBottom>
					Services
				</Typography>

				<TextField ... />

				{loadingStylists || loadingServices ? ( ... ) : ( ... )}
			</Box>
		);
		*/
	};

	// Change renderProductsSelectionSection to return null
	const renderProductsSelectionSection = () => {
		// Group products by category
		// const groupedProducts = groupByCategory(filteredProducts as POSService[]); // This line can be kept if other logic depends on it, or removed if not

		// Return null to hide this section as per user request to revert to dropdown-only UI for products
		return null;

		/* Original card rendering code - kept for reference if needed later
		return (
			<Box sx={{ p: 2, mt: 1 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
					<Typography variant="h6">
						Products
					</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						<RefreshInventoryButton ... />
					</Box>
				</Box>

				<TextField ... />

				{loadingProducts ? ( ... ) : ( ... )}
			</Box>
		);
		*/
	};

	const renderSalonProductSelection = () => {
		// Filter to ensure only products (not services) are shown
		const productsOnly = allProducts.filter(product =>
			product.type === 'product' || !product.type
		);

		return (
			<Box sx={{ p: 3 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
					<Typography variant="h6">
						Select Products for Salon Use
					</Typography>
					<RefreshInventoryButton
						onRefresh={async () => {
							console.log("🔄 POS Salon: Forcefully refreshing product stock data");
							try {
								// First fetch balance stock for current stock quantities
								await fetchBalanceStockData();
								// Then reload all products to ensure everything is up to date
								await fetchAllProducts();
								toast.success("Stock data refreshed successfully");
								console.log("🔄 POS Salon: Stock data refresh complete");
							} catch (error) {
								console.error("🔄 POS Salon: Error refreshing stock data:", error);
								toast.error("Failed to refresh stock data");
							}
							return Promise.resolve();
						}}
						size="small"
						buttonText="Refresh Stock"
							variant="outlined"
					/>
				</Box>

				<Grid item xs={12}>
					<TextField
						fullWidth
						label="Consumption Purpose"
						variant="outlined"
							placeholder="E.g., Stylist workstation, Salon display, Client consultation"
						value={consumptionPurpose || ""}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConsumptionPurpose(e.target.value)}
						helperText="Specify the purpose of this salon consumption"
						required
						sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
					/>
				</Grid>

				{/* Replace product cards with dropdown */}
				<Box sx={{ mb: 4 }}>
					<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
						<Autocomplete
							options={productsOnly}
							getOptionLabel={(option) => {
								const stockLabel = option.stock_quantity !== undefined ? 
									` (${option.stock_quantity} in stock)` : '';
								return `${option.name}${stockLabel}`;
							}}
							renderOption={(props, option) => (
								<li {...props}>
									<Box>
										<Typography variant="body2">{option.name}</Typography>
										<Typography variant="caption" color="text.secondary">
											₹{option.price} • {option.stock_quantity !== undefined ? 
												`${option.stock_quantity} in stock` : 'Stock not available'}
										</Typography>
									</Box>
								</li>
							)}
							value={null}
							onChange={(_, newProduct) => {
								if (newProduct) {
									if (newProduct.stock_quantity !== undefined && newProduct.stock_quantity <= 0) {
										toast.error(`${newProduct.name} is out of stock`);
									} else {
										handleAddSalonProduct(newProduct);
										toast.success(`Added ${newProduct.name} for salon use`);
									}
								}
							}}
							renderInput={(params) => (
								<TextField {...params} 
									label="Select Product" 
									variant="outlined" 
									fullWidth 
									size="small"
								/>
							)}
							sx={{ flex: 1 }}
						/>
						<Button
							variant="contained"
							color="primary"
							sx={{
								bgcolor: 'rgb(94, 129, 34)',
								'&:hover': {
									bgcolor: 'rgb(75, 103, 27)'
								}
							}}
						>
							Add Product
						</Button>
					</Box>
				</Box>

				<Box sx={{ mt: 2 }}>
					<Typography variant="subtitle2">Selected Products:</Typography>
					{salonProducts.length === 0 ? (
						<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
							No products selected. Please select products using the dropdown above.
						</Typography>
					) : (
						<TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
							<Table size="small">
								<TableHead>
									<TableRow>
										<TableCell>Product</TableCell>
										<TableCell align="right">Quantity</TableCell>
										<TableCell align="right">Price</TableCell>
										<TableCell align="right">Total</TableCell>
										<TableCell></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{salonProducts.map((product) => (
										<TableRow key={product.id}>
											<TableCell>{product.item_name}</TableCell>
											<TableCell align="right">
												<TextField
													type="number"
													size="small"
													value={product.quantity}
													onChange={(e) => {
														const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
														const updatedProducts = salonProducts.map(p => 
															p.id === product.id ? {...p, quantity: newQuantity, total: product.price * newQuantity} : p
														);
														setSalonProducts(updatedProducts);
													}}
													InputProps={{ inputProps: { min: 1, style: { textAlign: 'right' } } }}
													sx={{ width: 70 }}
												/>
											</TableCell>
											<TableCell align="right">{formatCurrency(product.price)}</TableCell>
											<TableCell align="right">{formatCurrency(product.price * product.quantity)}</TableCell>
											<TableCell align="right">
												<IconButton
													size="small"
													color="error"
													onClick={() => handleRemoveSalonProduct(product.item_id)}
												>
													<DeleteOutlineIcon fontSize="small" />
												</IconButton>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					)}
				</Box>
			</Box>
		);
	};

	const renderOrderSummary = () => {
		const productSubtotal = calculateProductSubtotal();
		const serviceSubtotal = calculateServiceSubtotal();
		const combinedSubtotal = productSubtotal + serviceSubtotal;
		const productGstAmount = calculateProductGstAmount(productSubtotal);
		const serviceGstAmount = calculateServiceGstAmount(serviceSubtotal);
		const combinedGstAmount = productGstAmount + serviceGstAmount;
		const subtotalIncludingGST = combinedSubtotal + combinedGstAmount;
		const percentageDiscountAmount = (subtotalIncludingGST * walkInDiscountPercentage) / 100;
		const totalDiscount = walkInDiscount + percentageDiscountAmount;
		const totalAmount = Math.max(0, subtotalIncludingGST - totalDiscount);

		return (
			<Paper sx={{ p: 3, height: '100%' }}>
				<Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
						Order Summary
				</Typography>
				{/* Items List */}
				<Box sx={{ maxHeight: '300px', overflowY: 'auto', mb: 2 }}>
					{orderItems.length === 0 ? (
						<Typography color="text.secondary">No items added yet.</Typography>
					) : (
						orderItems.map((item) => (
							<Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, borderBottom: '1px dashed', borderColor: 'divider', pb: 1.5 }}>
								<Box sx={{ flexGrow: 1, mr: 1 }}>
									<Typography variant="body1" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
										{item.type === 'service' && <ContentCutIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5, color: 'primary.main' }} />}
										{item.type === 'product' && <Inventory fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5, color: 'secondary.main' }} />}
										{item.item_name}
										<Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
											(x{item.quantity})
										</Typography>
									</Typography>
									<TextField
										size="small"
										variant="standard"
										type="number"
										value={item.price}
										onChange={(e) => {
											const newPrice = parseFloat(e.target.value);
												handleItemPriceChange(item.id, isNaN(newPrice) ? 0 : newPrice);
										}}
										sx={{ mt: 0.5, width: '80px' }}
										InputProps={{
											startAdornment: <InputAdornment position="start">₹</InputAdornment>,
											inputProps: { step: 0.01, min: 0 }
										}}
									/>
								</Box>
								<Typography variant="body1" sx={{ fontWeight: 500, minWidth: '70px', textAlign: 'right' }}>
									{formatCurrency(item.price * item.quantity)}
								</Typography>
								<Tooltip title="Remove Item">
									<IconButton size="small" color="error" onClick={() => handleRemoveFromOrder(item.id)} sx={{ ml: 1 }}>
										<CloseIcon fontSize="small" />
									</IconButton>
								</Tooltip>
							</Box>
						))
					)}
				</Box>
				<Divider sx={{ my: 2 }} />
				{/* Subtotals */}
				<Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
					<Typography>Service Subtotal:</Typography>
					<Typography fontWeight="medium">{formatCurrency(serviceSubtotal)}</Typography>
				</Box>
				<Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
					<Typography>Product Subtotal:</Typography>
					<Typography fontWeight="medium">{formatCurrency(productSubtotal)}</Typography>
				</Box>
				<Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
					<Typography>Subtotal:</Typography>
					<Typography fontWeight="medium">{formatCurrency(combinedSubtotal)}</Typography>
				</Box>
				{/* GST Section for Services */}
				<Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						<FormControlLabel
							control={
								<Switch
									checked={isServiceGstApplied}
									onChange={(e) => setIsServiceGstApplied(e.target.checked)}
									size="small"
								/>
							}
							labelPlacement="start"
							label={<Typography sx={{ mr: 0.5 }}>Service GST:</Typography>}
							sx={{ ml: -1.5, mr: 0 }}
						/>
						{isServiceGstApplied && (
							<TextField
								type="number"
								value={serviceGstRate}
								onChange={(e) => {
									const rate = parseFloat(e.target.value);
									setServiceGstRate(isNaN(rate) ? 0 : Math.max(0, rate));
								}}
								size="small"
								variant="outlined"
								sx={{ width: '100px', ml: 0.5, '& .MuiInputBase-input': { fontSize: '1rem' } }}
								InputProps={{
									endAdornment: <InputAdornment position="end">%</InputAdornment>,
									inputProps: { step: 0.01, min: 0 }
									}}
							/>
						)}
					</Box>
					<Typography fontWeight="medium">{formatCurrency(serviceGstAmount)}</Typography>
				</Box>
				{/* GST Section for Products */}
				<Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						<FormControlLabel
							control={
								<Switch
									checked={isProductGstApplied}
									onChange={(e) => setIsProductGstApplied(e.target.checked)}
									size="small"
								/>
							}
							labelPlacement="start"
							label={<Typography sx={{ mr: 0.5 }}>Product GST:</Typography>}
							sx={{ ml: -1.5, mr: 0 }}
						/>
						{isProductGstApplied && (
							<TextField
								type="number"
								value={productGstRate}
								onChange={(e) => {
									const rate = parseFloat(e.target.value);
									setProductGstRate(isNaN(rate) ? 0 : Math.max(0, rate));
								}}
								size="small"
								variant="outlined"
								sx={{ width: '100px', ml: 0.5, '& .MuiInputBase-input': { fontSize: '1rem' } }}
								InputProps={{
									endAdornment: <InputAdornment position="end">%</InputAdornment>,
									inputProps: { step: 0.01, min: 0 }
								}}
							/>
						)}
					</Box>
					<Typography fontWeight="medium">{formatCurrency(productGstAmount)}</Typography>
				</Box>
				{/* Combined GST */}
				<Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
					<Typography>Total GST:</Typography>
					<Typography fontWeight="medium">{formatCurrency(combinedGstAmount)}</Typography>
				</Box>
				{/* Discount */}
				<Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
					<Typography>Discount:</Typography>
					<Typography fontWeight="medium" color="error.main">-{formatCurrency(totalDiscount)}</Typography>
				</Box>
				<Divider sx={{ my: 2 }} />
				{/* Total Amount */}
				<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
					<Typography variant="h6" fontWeight="bold">Total:</Typography>
					<Typography variant="h6" fontWeight="bold">{formatCurrency(totalAmount)}</Typography>
				</Box>
				{/* Customer & Stylist Info */}
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 2 }}>
					{selectedClient && (
						<Chip 
							icon={<PersonIcon fontSize="small" />} 
							label={`Customer: ${selectedClient.full_name}`}
							size="small"
							variant="outlined"
						/>
					)}
					{selectedStylist && (
						<Chip 
							icon={<ContentCutIcon fontSize="small" />} 
							label={`Stylist: ${selectedStylist.name}`}
							size="small"
							variant="outlined"
						/>
					)}
				</Box>
				{/* Timestamp */}
				<Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
					<AccessTimeIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
					{format(new Date(), "dd/MM/yyyy 'at' hh:mm a")}
				</Typography>
			</Paper>
		);
	};

	// Add a handler for adding memberships to order
	const handleAddMembershipToOrder = useCallback((membership: POSMembership) => {
		const newItem: OrderItem = {
			id: uuidv4(),
			order_id: '',
			item_id: membership.id,
			item_name: membership.name,
			quantity: 1,
			price: membership.price,
			total: membership.price,
			type: 'service', // Use service type since memberships are a type of service
			category: 'membership', // Use category to identify it as a membership
			for_salon_use: false
		};

		setOrderItems((prev) => {
			const newState = [...prev, newItem];
			return newState;
		});

		toast.success(`Added ${membership.name} membership to order`);
	}, []);

	// Change renderMembershipSelectionSection to return null to remove the membership cards section
	// This keeps the membership dropdown at the top that's already in place
	const renderMembershipSelectionSection = () => {
		// Return null to hide the membership cards section as per user request
		return null;
		
		/* Original membership cards section - kept for reference if needed later
		return (
			<Box sx={{ p: 2, mt: 2 }}>
				<Typography variant="h6" gutterBottom>
					Memberships
				</Typography>

				<TextField
					fullWidth
					placeholder="Search memberships..."
					variant="outlined"
					size="small"
					margin="dense"
					value={membershipSearchTerm}
					onChange={(e) => setMembershipSearchTerm(e.target.value)}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<Search fontSize="small" />
							</InputAdornment>
						),
						sx: { borderRadius: '8px' }
					}}
					sx={{ mb: 2 }}
				/>

				{loadingMemberships ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
						<CircularProgress size={24} />
					</Box>
				) : filteredMemberships.length > 0 ? (
					<Grid container spacing={2}>
						{filteredMemberships.map((membership) => (
							<Grid item xs={12} sm={6} md={4} key={membership.id}>
								<Card sx={{
									height: '100%',
									display: 'flex',
									flexDirection: 'column',
									borderRadius: '8px',
									boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
									'&:hover': {
										boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
									}
								}}>
									<CardContent sx={{ flexGrow: 1 }}>
										<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
											<CardMembershipIcon sx={{ mr: 1, color: 'primary.main' }} />
											<Typography variant="h6" sx={{ fontWeight: 600 }}>{membership.name}</Typography>
										</Box>
										<Typography color="text.secondary" sx={{ mb: 1 }}>
											₹{membership.price} • {membership.duration_months} months
										</Typography>
										<Box sx={{ mb: 2 }}>
											<Typography variant="body2" color="text.secondary">
												{membership.description}
											</Typography>
											{membership.benefits && membership.benefits.length > 0 && (
												<Box sx={{ mt: 1 }}>
													{membership.benefits.slice(0, 3).map((benefit, index) => (
														<Chip 
															key={index} 
															label={benefit} 
															size="small" 
															variant="outlined"
															color="primary"
															sx={{ mr: 0.5, mb: 0.5, borderRadius: '4px' }} 
														/>
													))}
													{membership.benefits.length > 3 && (
														<Chip 
															label={`+${membership.benefits.length - 3} more`} 
															size="small"
															variant="outlined" 
															sx={{ mr: 0.5, mb: 0.5, borderRadius: '4px' }} 
														/>
													)}
												</Box>
											)}
										</Box>
									</CardContent>
									<CardActions sx={{ justifyContent: 'flex-end', pt: 0, pb: 2, px: 2 }}>
										<Button
											variant="contained"
											size="small"
											color="primary"
											onClick={() => handleAddMembershipToOrder({
												id: membership.id,
												name: membership.name,
												price: membership.price,
												duration_months: membership.duration_months,
												benefits: membership.benefits,
												description: membership.description,
												type: 'membership'
											})}
											sx={{
												borderRadius: '6px',
												textTransform: 'none',
												fontWeight: 500
											}}
										>
											Add
										</Button>
									</CardActions>
								</Card>
							</Grid>
						))}
					</Grid>
				) : (
					<Box sx={{
						textAlign: 'center',
						my: 2,
						p: 2,
						bgcolor: 'grey.50',
						borderRadius: '8px',
						border: '1px dashed rgba(0, 0, 0, 0.12)'
					}}>
						<Typography variant="body2" color="text.secondary">
							No memberships found
						</Typography>
					</Box>
				)}
			</Box>
		);
		*/
	};

	// ====================================================
	// 5. LOADING CHECK (AFTER ALL HOOKS)
	// ====================================================
	const isInitialLoading = loadingClients || loadingStylists || loadingAppointments || loadingInventoryProducts || loadingServices || loadingMemberships;
	// Add check for other essential data if needed

	if (isInitialLoading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" height="100vh">
				<CircularProgress />
				<Typography variant="h6" sx={{ ml: 2 }}>
					Loading POS data...
				</Typography>
			</Box>
		);
	}

	// ====================================================
	// 6. RENDER OUTPUT (JSX)
	// ====================================================
	return (
		<Box sx={{ flexGrow: 1, width: '100%', maxWidth: 1400, mx: 'auto', py: 2 }}>
			{/* Tabs for Walk-in Order and Salon Purchase */}
			<Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<Tabs
					value={tabValue}
					onChange={(_, newValue) => setTabValue(newValue)}
					variant="fullWidth"
					indicatorColor="primary"
					textColor="primary"
				>
					<Tab 
						label={
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<ShoppingBasketIcon sx={{ mr: 1 }} />
								Walk-in Order
							</Box>
						} 
					/>
					<Tab 
						label={
							<Box sx={{ display: 'flex', alignItems: 'center' }}>
								<Inventory sx={{ mr: 1 }} />
								Salon Purchase
							</Box>
						} 
					/>
				</Tabs>
				<IconButton
					color="primary"
					onClick={() => setHistoryDrawerOpen(true)}
					size="small"
					sx={{ ml: 1 }}
					title="View Client History"
				>
					<HistoryIcon />
				</IconButton>
			</Box>

			{/* Tab Panels */}
			<TabPanel value={tabValue} index={0}>
				<Grid container spacing={2}>
					{/* Customer Information */}
					<Grid item xs={12}>
						<Paper sx={{ p: 2, mb: 2 }}>
							<Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
								Customer Information
							</Typography>
							
							<Grid container spacing={2}>
								<Grid item xs={12} sm={4}>
									<Autocomplete
										options={clients || []}
										getOptionLabel={(option) => option.full_name || ""}
										value={selectedClient}
										onChange={(_, newValue) => handleClientSelect(newValue)}
										renderInput={(params) => (
											<TextField
												{...params}
												label="Select Client"
												variant="outlined"
												fullWidth
												size="small"
												helperText={clients && clients.length === 0 ? "No clients available. Type a name to add a new one." : "Select an existing client or type a new name below."}
											/>
										)}
										renderOption={(props, option) => (
											<li {...props} key={option.id}>
												<Box>
													<Typography variant="body2">{option.full_name}</Typography>
													{option.phone && (
														<Typography variant="caption" color="text.secondary">
															{option.phone}
														</Typography>
													)}
												</Box>
											</li>
										)}
										size="small"
									/>
								</Grid>
								<Grid item xs={12} sm={4}>
									<TextField
										fullWidth
										label="Customer Name"
										variant="outlined"
										value={customerName}
										onChange={(e) => {
											setCustomerName(e.target.value);
											// If name is changed manually, deselect client to allow new client entry
											if (selectedClient && selectedClient.full_name !== e.target.value) {
												setSelectedClient(null);
											}
										}}
										required
										error={customerName.trim() === ""}
										size="small"
									/>
								</Grid>
								{/* New Client Phone and Email - Conditionally Rendered */}
								{!selectedClient && customerName.trim() !== "" && (
									<>
										<Grid item xs={12} sm={4}>
											<TextField
												fullWidth
												label="New Client Phone"
												variant="outlined"
												value={newClientPhone}
												onChange={(e) => setNewClientPhone(e.target.value)}
												size="small"
												placeholder='(Optional)'
											/>
										</Grid>
										<Grid item xs={12} sm={4}>
											<TextField
												fullWidth
												label="New Client Email"
												variant="outlined"
												value={newClientEmail}
												onChange={(e) => setNewClientEmail(e.target.value)}
												size="small"
												placeholder='(Optional)'
											/>
										</Grid>
									</>
								)}
								<Grid item xs={12} sm={selectedClient || !customerName.trim() ? 4 : 12} > {/* Adjust grid for stylist based on new client fields */} 
									<FormControl
										fullWidth
										required
										error={selectedStylist === null}
										size="small"
									>
										<InputLabel id="stylist-select-label">
											Select Stylist
										</InputLabel>
										<Select
											labelId="stylist-select-label"
											id="stylist-select"
											value={selectedStylist?.id || ""}
											label="Select Stylist"
											onChange={(e) => {
												const stylistId = e.target.value;
												const stylist = stylists?.find(s => s.id === stylistId) || null;
												setSelectedStylist(stylist);
											}}
										>
											<MenuItem value="">
												<em>None</em>
											</MenuItem>
											{(stylists || [])?.map((stylist) => (
												<MenuItem key={stylist.id} value={stylist.id}>
													{stylist.name}
												</MenuItem>
											))}
										</Select>
										{selectedStylist === null && (
											<FormHelperText error>
												Stylist is required
											</FormHelperText>
										)}
									</FormControl>
								</Grid>
							</Grid>
						</Paper>
					</Grid>

					{/* Services & Products */}
					<Grid item xs={12}>
						<Paper sx={{ p: 2, mb: 2 }}>
							<Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
								Services & Products
							</Typography>
							
							{/* Services & Products Autocomplete */}
							<Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 2, flexWrap: 'wrap' }}>
								<Box sx={{ flex: 1, minWidth: '240px' }}>
									<Autocomplete
										options={filteredServices as Service[]}
										getOptionLabel={(option) => `${option.name} (₹${option.price} • ${option.duration} min)`}
										value={serviceDropdownValue}
										onChange={(_, newService) => {
											if (newService) handleAddToOrder({
												id: newService.id,
												name: newService.name,
												price: newService.price,
												duration: newService.duration,
												type: 'service',
												category: newService.category
											});
											setServiceDropdownValue(null);
										}}
										renderInput={(params) => (
											<TextField {...params} label="Select Service" variant="outlined" size="small" />
										)}
									/>
								</Box>
								<Box sx={{ flex: 1, minWidth: '240px' }}>
									<Autocomplete
										options={filteredProducts}
										getOptionLabel={(option) => option.name}
										value={productDropdownValue}
										onChange={(_, newProduct) => {
											if (newProduct) handleAddToOrder(newProduct);
											setProductDropdownValue(null);
										}}
										renderInput={(params) => (
											<TextField {...params} label="Select Product" variant="outlined" size="small" />
										)}
									/>
								</Box>
								<Box sx={{ flex: 1, minWidth: '240px' }}>
									<Autocomplete
										options={filteredMemberships}
										getOptionLabel={(option) => `${option.name} (₹${option.price})`}
										value={membershipDropdownValue}
										onChange={(_, newMembership) => {
											if (newMembership) handleAddMembershipToOrder({
												id: newMembership.id,
												name: newMembership.name,
												price: newMembership.price,
												duration_months: newMembership.duration_months,
												benefits: newMembership.benefits || [],
												description: newMembership.description,
												type: 'membership'
											});
											setMembershipDropdownValue(null);
										}}
										renderInput={(params) => (
											<TextField {...params} label="Select Membership" variant="outlined" size="small" />
										)}
									/>
								</Box>
							</Box>
							{selectedClient && (
								<>
									<Divider sx={{ my: 2 }} />
									<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
										<Typography variant="h6">Client Details</Typography>
										<IconButton
											color="primary"
											onClick={() => setHistoryDrawerOpen(true)}
											size="small"
											sx={{ ml: 1 }}
											title="View Client History"
										>
											<HistoryIcon />
										</IconButton>
									</Box>
									<Grid container spacing={2}>
										<Grid item xs={12} sm={6}>
											<Typography variant="subtitle2">Contact</Typography>
											<Typography>{selectedClient.phone}{selectedClient.email ? ` • ${selectedClient.email}` : ''}</Typography>
										</Grid>
										<Grid item xs={12} sm={6}>
											<Typography variant="subtitle2">Last Visit</Typography>
											<Typography>{selectedClient.last_visit ? format(new Date(selectedClient.last_visit), 'dd/MM/yyyy') : 'Never'}</Typography>
										</Grid>
										<Grid item xs={12} sm={6}>
											<Typography variant="subtitle2">Total Spent</Typography>
											<Typography color="success.main">{formatCurrency(selectedClient.total_spent || 0)}</Typography>
										</Grid>
										<Grid item xs={12} sm={6}>
											<Typography variant="subtitle2">Pending Payment</Typography>
											{selectedClient.pending_payment && selectedClient.pending_payment > 0
												? <Chip label={formatCurrency(selectedClient.pending_payment)} color="warning" />
												: <Typography color="text.secondary">No pending amount</Typography>}
										</Grid>
									</Grid>
								</>
							)}
							
							{/* Service Selection Section */}
							{renderServiceSelectionSection()}
							
							{/* Product Selection Section */}
							{renderProductsSelectionSection()}
							
							{/* Membership Selection Section - Add this new section */}
							{renderMembershipSelectionSection()}
						</Paper>
					</Grid>

					{/* Payment Details */}
					<Grid item xs={12}>
						<Paper sx={{ p: 2, mb: 2 }}>
							<Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
								Payment Details
							</Typography>
							
							{/* Editable individual payment methods */}
							<Box sx={{ mb: 2 }}>
								<Typography variant="subtitle2" gutterBottom>
									Payment Methods:
								</Typography>
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
									{/* Editable method cards */}
									{(['cash', 'credit_card', 'debit_card', 'upi', 'bnpl'] as PaymentMethod[]).map(method => (
										<Box
											key={method}
											sx={{
												minWidth: '120px', flex: '1 1 0', p: 1.5,
												border: '1px solid',
												borderColor: paymentAmounts[method] > 0 ? 'primary.main' : 'divider',
												borderRadius: '8px',
												bgcolor: paymentAmounts[method] > 0 ? 'primary.lighter' : 'background.paper'
											}}
										>
											<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
												{method === 'cash' && <LocalAtm fontSize="small" sx={{ mr: 1, color: paymentAmounts[method] > 0 ? 'primary.main' : 'text.secondary' }} />}
												{method === 'credit_card' && <CreditCard fontSize="small" sx={{ mr: 1, color: paymentAmounts[method] > 0 ? 'primary.main' : 'text.secondary' }} />}
												{method === 'debit_card' && <CreditCard fontSize="small" sx={{ mr: 1, color: paymentAmounts[method] > 0 ? 'primary.main' : 'text.secondary' }} />}
												{method === 'upi' && <AccountBalance fontSize="small" sx={{ mr: 1, color: paymentAmounts[method] > 0 ? 'primary.main' : 'text.secondary' }} />}
												{method === 'bnpl' && <AttachMoney fontSize="small" sx={{ mr: 1, color: paymentAmounts[method] > 0 ? 'primary.main' : 'text.secondary' }} />}
												<Typography variant="body2" fontWeight={paymentAmounts[method] > 0 ? 'bold' : 'normal'}>
													{PAYMENT_METHOD_LABELS[method]}
												</Typography>
											</Box>
											<TextField
												size="small"
												fullWidth
												variant="outlined"
												type="number"
												value={paymentAmounts[method]}
												onChange={e => {
													const val = parseFloat(e.target.value) || 0;
													setPaymentAmounts(prev => ({ ...prev, [method]: val }));
												}}
												onFocus={() => {
													// Auto-fill this method with remaining total when first focused (non-cash)
													if (!isSplitPayment && method !== 'cash' && paymentAmounts[method] === 0) {
														const sumOtherMethods = Object.entries(paymentAmounts)
															.filter(([m]) => m !== method)
															.reduce((sum, [_, amt]) => sum + (amt || 0), 0);
														const fillAmount = Math.max(0, total - sumOtherMethods);
														setPaymentAmounts(prev => ({ ...prev, [method]: fillAmount }));
													}
												}}
												InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
											/>
										</Box>
									))}
								</Box>
							</Box>
							
							<Grid container spacing={2} sx={{ mt: 1 }}>
								<Grid item xs={12} sm={6}>
									<TextField
											fullWidth
											label="Discount ₹"
											variant="outlined"
											type="number"
											size="small"
											value={walkInDiscount}
											onChange={(e) => {
												const fixedDiscount = Math.round(Number(e.target.value));
												setWalkInDiscount(fixedDiscount);
												// Calculate and set percentage discount
												const currentTotal = calculateProductSubtotal() + calculateServiceSubtotal() + calculateProductGstAmount(calculateProductSubtotal()) + calculateServiceGstAmount(calculateServiceSubtotal());
												const remainingAmount = currentTotal - fixedDiscount;
												const calculatedPercentage = currentTotal > 0 ? ((currentTotal - remainingAmount) / currentTotal) * 100 : 0;
												setWalkInDiscountPercentage(Math.max(0, Math.min(100, parseFloat(calculatedPercentage.toFixed(2)))));
											}}
											InputProps={{
												inputProps: { min: 0, step: 1 },
												startAdornment: (
													<InputAdornment position="start">
														₹
													</InputAdornment>
												),
											}}
										/>
								</Grid>
								
								<Grid item xs={12} sm={6}>
									<TextField
										fullWidth
										label="Discount %"
										variant="outlined"
										type="number"
										size="small"
										value={walkInDiscountPercentage}
										onChange={(e) => {
											const percentage = parseFloat(e.target.value);
											setWalkInDiscountPercentage(isNaN(percentage) ? 0 : Math.max(0, Math.min(100, percentage)));
											// Calculate and set fixed discount
											const currentTotal = calculateProductSubtotal() + calculateServiceSubtotal() + calculateProductGstAmount(calculateProductSubtotal()) + calculateServiceGstAmount(calculateServiceGstAmount(calculateServiceSubtotal()));
											const calculatedFixedDiscount = (currentTotal * (isNaN(percentage) ? 0 : Math.max(0, Math.min(100, percentage)))) / 100;
											setWalkInDiscount(calculatedFixedDiscount);
										}}
										InputProps={{
											inputProps: { min: 0, max: 100, step: 0.1 },
											endAdornment: (
												<InputAdornment position="end">
													%
												</InputAdornment>
											),
										}}
									/>
								</Grid>
								
								<Grid item xs={12}>
									<FormControlLabel
										control={
											<Switch
												checked={isSplitPayment}
												onChange={(e) =>
													setIsSplitPayment(e.target.checked)
												}
												color="primary"
												size="small"
											/>
										}
										label={
											<Box sx={{ display: 'flex', alignItems: 'center' }}>
												<Typography variant="body2" sx={{ mr: 1 }}>Split Payment</Typography>
												<Tooltip title="Split the total amount across multiple payment methods">
													<IconButton size="small">
														<InfoIcon fontSize="small" />
													</IconButton>
												</Tooltip>
											</Box>
										}
									/>
								</Grid>
							</Grid>
							
							<Collapse in={isSplitPayment}>
								<Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
									<Typography variant="subtitle2" gutterBottom>
										Add Payment
									</Typography>

									<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
										<Box sx={{ flex: '1 1 40%', minWidth: '100px' }}>
											<TextField
												fullWidth
												label="Amount"
												variant="outlined"
												type="number"
												size="small"
												value={newPaymentAmount}
												onChange={(e) => setNewPaymentAmount(Math.round(Number(e.target.value)))}
												InputProps={{
													inputProps: { min: 0, step: 1 },
													startAdornment: <InputAdornment position="start">₹</InputAdornment>,
												}}
											/>
										</Box>
										<Box sx={{ flex: '1 1 40%', minWidth: '100px' }}>
											<FormControl fullWidth size="small">
												<InputLabel id="new-payment-method-label">Method</InputLabel>
												<Select
													labelId="new-payment-method-label"
													value={newPaymentMethod}
													onChange={(e) => setNewPaymentMethod(e.target.value as PaymentMethod)}
													label="Method"
												>
													{PAYMENT_METHODS.map((method) => (
														<MenuItem key={method} value={method}>{PAYMENT_METHOD_LABELS[method]}</MenuItem>
													))}
												</Select>
											</FormControl>
										</Box>
										<Box sx={{ flexShrink: 0 }}>
											<Button
												variant="contained"
												color="primary"
												size="small"
												onClick={handleAddSplitPayment}
												disabled={newPaymentAmount <= 0 || newPaymentAmount > pendingAmount}
												sx={{ whiteSpace: 'nowrap' }}
											>
												Add
											</Button>
										</Box>
									</Box>

									{/* Display pending amount */}
									<Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
										<Typography variant="body2">Pending Amount:</Typography>
										<Typography
											variant="body2"
											fontWeight="medium"
											color={pendingAmount > 0 ? "error" : "success"}
										>
											{formatCurrency(pendingAmount)}
										</Typography>
									</Box>

									{/* Show split payments */}
									{splitPayments.length > 0 && (
										<TableContainer component={Paper} variant="outlined" sx={{ mt: 2, borderRadius: '4px' }}>
											<Table size="small">
												<TableHead>
													<TableRow>
														<TableCell>Method</TableCell>
														<TableCell align="right">Amount</TableCell>
														<TableCell></TableCell>
													</TableRow>
												</TableHead>
												<TableBody>
													{splitPayments.map((payment) => (
														<TableRow key={payment.id}>
															<TableCell>
																{PAYMENT_METHOD_LABELS[payment.payment_method as PaymentMethod]}
															</TableCell>
															<TableCell align="right">
																{formatCurrency(payment.amount)}
															</TableCell>
															<TableCell align="right">
																<IconButton
																	size="small"
																	color="error"
																	onClick={() =>
																		handleRemoveSplitPayment(
																			payment.id,
																		)
																	}
																>
																	<DeleteOutlineIcon fontSize="small" />
																</IconButton>
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</TableContainer>
									)}
								</Box>
							</Collapse>
							
							{/* Complete Order Button */}
							<Button
								variant="contained"
								color="primary"
								fullWidth
								sx={{ mt: 2 }}
								onClick={async () => {
									// Build payments array from paymentAmounts and apply as splitPayments
									const payments = Object.entries(paymentAmounts)
										.filter(([_, amt]) => amt > 0)
										.map(([method, amt]) => ({ id: uuidv4(), payment_method: method as PaymentMethod, amount: amt }));
									setSplitPayments(payments);
									setIsSplitPayment(true);
									await handleCreateWalkInOrder();
								}}
								disabled={processing || Object.values(paymentAmounts).reduce((a, b) => a + b, 0) < calculateTotalAmount()}
								startIcon={processing ? <CircularProgress size={20} /> : <CheckIcon />}
							>
								{processing ? 'Processing...' : 'Complete Order'}
							</Button>
						</Paper>
					</Grid>

					{/* Order Summary */}
					<Grid item xs={12}>
						<Paper sx={{ p: 2, mb: 2 }}>
							{renderOrderSummary()}
						</Paper>
					</Grid>
				</Grid>
			</TabPanel>

			<TabPanel value={tabValue} index={1}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Paper sx={{ p: 2, mb: 2 }}>
							<Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
								Salon Consumption
							</Typography>
							
							{renderSalonProductSelection()}
							
							{/* Salon Products Summary */}
							<Box sx={{ mt: 4 }}>
								<Typography variant="h6" gutterBottom>
									Selected Products for Salon Use
								</Typography>
								
								{salonProducts.length === 0 ? (
									<Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
										No products selected for salon use yet
									</Typography>
								) : (
									<>
										<TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
											<Table size="small">
												<TableHead>
													<TableRow>
														<TableCell>Product</TableCell>
														<TableCell align="right">Quantity</TableCell>
														<TableCell align="right">Price</TableCell>
														<TableCell align="right">Total</TableCell>
														<TableCell></TableCell>
													</TableRow>
												</TableHead>
												<TableBody>
													{salonProducts.map((product) => (
														<TableRow key={product.id}>
															<TableCell>{product.item_name}</TableCell>
															<TableCell align="right">{product.quantity}</TableCell>
															<TableCell align="right">{formatCurrency(product.price)}</TableCell>
															<TableCell align="right">{formatCurrency(product.price * product.quantity)}</TableCell>
															<TableCell align="right">
																<IconButton
																	size="small"
																	color="error"
																	onClick={() => handleRemoveSalonProduct(product.item_id)}
																>
																	<DeleteOutlineIcon fontSize="small" />
																</IconButton>
															</TableCell>
														</TableRow>
													))}
													{/* Total Row */}
													<TableRow>
														<TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
															Total:
														</TableCell>
														<TableCell align="right" sx={{ fontWeight: 'bold' }}>
															{formatCurrency(salonProducts.reduce((sum, product) => sum + product.price * product.quantity, 0))}
														</TableCell>
														<TableCell></TableCell>
													</TableRow>
												</TableBody>
											</Table>
										</TableContainer>
										
										{/* Additional Notes */}
										<Grid container spacing={2}>
											<Grid item xs={12}>
												<TextField
													fullWidth
													label="Consumption Notes (Optional)"
													variant="outlined"
													multiline
													rows={3}
													value={consumptionNotes}
													onChange={(e) => setConsumptionNotes(e.target.value)}
													sx={{ mb: 2 }}
												/>
											</Grid>
										</Grid>
										
										{/* Consumption Button */}
										<Button
											variant="contained"
											color="primary"
											fullWidth
											onClick={handleCreateSalonConsumptionWorkaround}
											disabled={processing || !isSalonConsumptionValid()}
											startIcon={processing ? <CircularProgress size={20} /> : null}
										>
											{processing ? "Processing..." : "Record Salon Consumption"}
										</Button>
									</>
								)}
							</Box>
						</Paper>
					</Grid>
				</Grid>
			</TabPanel>
			{/* History Drawer */}
			<Drawer anchor="right" open={historyDrawerOpen} onClose={() => setHistoryDrawerOpen(false)}>
				<Box sx={{ width: 350, p: 2 }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
						<Typography variant="h6">{selectedClient?.full_name}'s Service History</Typography>
						<IconButton onClick={() => setHistoryDrawerOpen(false)} size="small">
							<CloseIcon />
						</IconButton>
					</Box>
					{isHistoryLoading ? (
						<Box display="flex" justifyContent="center"><CircularProgress /></Box>
					) : clientServiceHistory.length === 0 ? (
						<Typography>No previous services found for this client.</Typography>
					) : (
						<List>
							{clientServiceHistory.map((item: any) => (
								<React.Fragment key={item.id}>
									<ListItem>
										<ListItemText
											primary={`${item.service_name || item.item_name || 'Unknown Item'} — ₹${item.price}`} // Updated to use service_name, with fallback
											secondary={`${item.pos_orders?.created_at ? format(new Date(item.pos_orders.created_at), 'dd/MM/yyyy') : 'N/A'} — Order #${item.pos_orders?.id?.slice(-4) || 'N/A'} — Qty: ${item.quantity}`}
										/>
									</ListItem>
									<Divider />
								</React.Fragment>
							))}
						</List>
					)}
				</Box>
			</Drawer>
		</Box>
	);
}



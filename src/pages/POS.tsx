import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Container, Box, Typography, Paper, Tabs, Tab, TextField, Button, Grid, Card, CardContent, CardActions, FormControl, InputLabel, Select, MenuItem, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, CircularProgress, Collapse, Tooltip, FormHelperText } from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, RemoveShoppingCart, ShoppingBag, Check as CheckIcon, Refresh as RefreshIcon, AttachMoney, CreditCard, LocalAtm, AccountBalance, Receipt as ReceiptIcon, Inventory, Search, Info as InfoIcon, CheckCircle, Warning } from '@mui/icons-material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import { supabase } from '../utils/supabase/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { PaymentMethod, usePOS, createWalkInOrder, CreateOrderData, PaymentMethodWithSplit } from '../hooks/usePOS';
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
import { useOrders } from '../hooks/useOrders'; // Import useOrders
// Import the RefreshInventoryButton component
import RefreshInventoryButton from '../components/RefreshInventoryButton';
import LowStockWarning from '../components/LowStockWarning';
import ErrorBoundary from '../components/ErrorBoundary';
import { printBill } from '../utils/printUtils';
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
// Import the localStorage hook
import { useLocalStorage } from '../utils/useLocalStorage';
import { updateProductStock } from '../utils/inventoryUtils';
import PaymentSection, { ActiveMembershipDetails } from '../components/PaymentSection';

// Define a key for localStorage
const POS_STATE_STORAGE_KEY = 'posState';

// Define an interface for the state to be persisted
interface PersistedPOSState {
  tabValue: number;
  customerName: string;
  selectedClient: Client | null;
  newClientPhone: string;
  newClientEmail: string;
  selectedStylist: Stylist | null;
  orderItems: OrderItem[];
  walkInPaymentMethod: PaymentMethod; // Default/fallback if not using paymentAmounts
  walkInDiscount: number;
  walkInDiscountPercentage: number;
  paymentAmounts: Record<PaymentMethod, number>;
  isSplitPayment: boolean; // To control UI for split payment section
  // Salon Purchase tab state
  salonProducts: OrderItem[];
  consumptionPurpose: string;
  consumptionNotes: string;
  orderDate: Date; // Updated to use orderDate instead of salonConsumptionDate
}

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
	active?: boolean;
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
const PAYMENT_METHOD_LABELS: Record<string, string> = {
	cash: "Cash",
	credit_card: "Credit Card",
	debit_card: "Debit Card",
	upi: "UPI",
	bnpl: "Pay Later",
	membership: "Membership Balance",
};

// Available payment methods
const PAYMENT_METHODS: string[] = [
	"cash",
	"credit_card",
	"debit_card",
	"upi",
	"bnpl",
	"membership",
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

// Update the directUpdateStockQuantity function
const directUpdateStockQuantity = async (productId: string, decrementAmount: number) => {
  try {
    console.log(`🛠️ DIRECT UPDATE: Updating stock for product ID ${productId} by ${decrementAmount}`);
    
    const result = await updateProductStock(productId, -decrementAmount, 'pos_sale');
    
    if (!result.success) {
      console.error(`🛠️ DIRECT UPDATE: Error updating stock for ${productId}:`, result.error);
      return false;
    }
    
    console.log(`🛠️ DIRECT UPDATE: Successfully updated stock to ${result.newStock}`);
    return true;
  } catch (err) {
    console.error('🛠️ DIRECT UPDATE: Error updating stock quantity:', err);
    return false;
  }
};

interface HistoryItem {
	id: string;
	service_name?: string;
	item_name?: string;
	price: number;
	quantity: number;
	type?: string;
	pos_orders?: {
		id: string;
		created_at: string;
		status: string;
		client_name: string;
	};
	appointment_data?: {
		id: string;
		created_at: string;
		status: string;
		stylist_name?: string;
	};
}

interface POSOrderItem extends OrderItem {
  benefitAmount?: number;
  useMembershipPayment?: boolean; // Track if this item should use membership payment
  experts?: any[]; // Track experts/stylists for revenue split logic
}

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
	const { createWalkInOrder: createWalkInOrderMutation, createOrder, orders: posOrders, loadingOrders: loadingPOSOrders } = usePOS(); // Renamed orders from usePOS to posOrders
	const { orders, isLoading: isLoadingOrders } = useOrders(); // Orders for lifetime visits calculation
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
	const [customerName, setCustomerName] = useLocalStorage<string>('pos_customerName', '');
	// Persist selectedClient across navigations
	const [selectedClient, setSelectedClient] = useLocalStorage<Client | null>('pos_selectedClient', null);
	const [selectedStylist, setSelectedStylist] = useLocalStorage<Stylist | null>('pos_selectedStylist', null);
	// Add state for multiple stylists (for multi-expert appointments)
	const [selectedStylists, setSelectedStylists] = useState<(Stylist | null)[]>([]);
	const [appointmentDate, setAppointmentDate] = useState<Date | null>(new Date());
	const [appointmentTime, setAppointmentTime] = useState<Date | null>(new Date());
	const [orderItems, setOrderItems] = useState<POSOrderItem[]>([]);
	const [walkInPaymentMethod, setWalkInPaymentMethod] = useState<PaymentMethod>("cash");
	const [walkInDiscount, setWalkInDiscount] = useState(0);
	const [currentAppointmentId, setCurrentAppointmentId] = useState<string | null>(null);
	const [isSplitPayment, setIsSplitPayment] = useState(false);
	const [splitPayments, setSplitPayments] = useState<any[]>([]);

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
	// Add state for client membership tier
	const [clientMembershipTier, setClientMembershipTier] = useState<string | null>(null);
	// Add state to toggle paying via membership
	const [useMembershipPayment, setUseMembershipPayment] = useState(false);
	// Add state for service-specific membership payment tracking
	const [servicesMembershipPayment, setServicesMembershipPayment] = useState<Record<string, boolean>>({});
	// Active membership fetched for selected client
	const [activeClientMembership, setActiveClientMembership] = useState<ActiveMembershipDetails | null>(null);
	// Add state for order date (used for all orders)
	const [orderDate, setOrderDate] = useState<Date | null>(new Date());
	
	// State for last created order and print dialog
	const [lastCreatedOrder, setLastCreatedOrder] = useState<any>(null);
	const [printDialogOpen, setPrintDialogOpen] = useState(false);
	const [clientDetailsExpanded, setClientDetailsExpanded] = useState(false); // Add state for Client Details accordion

	const [paymentAmounts, setPaymentAmounts] = useLocalStorage<Record<PaymentMethod, number>>(`${POS_STATE_STORAGE_KEY}_paymentAmounts`, {
		cash: 0,
		credit_card: 0,
		debit_card: 0,
		upi: 0,
		bnpl: 0,
		membership: 0
	});

	// When membership payment toggled, clear discounts
	useEffect(() => {
		if (useMembershipPayment) {
			// Reset direct discount and percentage discount
			setWalkInDiscount(0);
			setWalkInDiscountPercentage(0);
		} else {
			// Reset percentage discount when off
			setWalkInDiscountPercentage(0);
		}
	}, [useMembershipPayment]);

	// Fetch active membership when client changes
	useEffect(() => {
		if (selectedClient) {
			(async () => {
				try {
					const { data: mems, error: memErr } = await supabase
						.from('members')
						.select('id, tier_id, purchase_date, expires_at, current_balance')
						.eq('client_id', selectedClient.id)
						.order('purchase_date', { ascending: false })
						.limit(1);
					if (memErr || !mems || mems.length === 0) {
						setActiveClientMembership(null);
						return;
					}
					const m = mems[0];
					const { data: tier, error: tierErr } = await supabase
						.from('membership_tiers')
						.select('name, duration_months')
						.eq('id', m.tier_id)
						.single();
					if (tierErr || !tier) {
						setActiveClientMembership(null);
						return;
					}
					setActiveClientMembership({
						id: m.id,
						tierId: m.tier_id,
						tierName: tier.name,
						currentBalance: m.current_balance,
						isActive: m.expires_at ? new Date(m.expires_at) > new Date() : true,
						purchaseDate: m.purchase_date,
						expiresAt: m.expires_at,
						durationMonths: tier.duration_months
					});
				} catch (e) {
					console.error('Failed loading membership:', e);
					setActiveClientMembership(null);
				}
			})();
		} else {
			setActiveClientMembership(null);
		}
	}, [selectedClient]);

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

		// Determine the type - ensure it is always either 'product' or 'service', never undefined
		const itemType = service.type === 'service' ? 'service' : 'product';
		
		const newItem: POSOrderItem = {
			id: uuidv4(),
			order_id: '',
			item_id: service.id,
			item_name: service.name,
			quantity: quantity,
			price: customPrice !== undefined ? customPrice : service.price,
			total: (customPrice !== undefined ? customPrice : service.price) * quantity,
			type: itemType, // Ensure type is never undefined
			hsn_code: service.hsn_code,
			gst_percentage: service.gst_percentage,
			for_salon_use: false,
			discount: 0, // Initialize discount to 0
			discount_percentage: 0 // Initialize discount_percentage to 0
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
		console.log("Fetching history for client:", clientName);
		try {
			// First query complete pos_orders for this client
			const { data: ordersData, error: ordersError } = await supabase
				.from('pos_orders')
				.select('*')
				.eq('client_name', clientName)
				.order('created_at', { ascending: false })
				.limit(20);

			if (ordersError) {
				console.error('Error fetching POS orders:', ordersError);
			}
			
			console.log("Found orders:", ordersData?.length || 0);

			// Then query pos_order_items for these orders
			const posItems: HistoryItem[] = [];
			
			if (ordersData && ordersData.length > 0) {
				// Get all order IDs
				const orderIds = ordersData.map(order => order.id);
				
				// Fetch all items for these orders
				const { data: itemsData, error: itemsError } = await supabase
					.from('pos_order_items')
					.select('*')
					.in('pos_order_id', orderIds);
					
				if (itemsError) {
					console.error('Error fetching order items:', itemsError);
				}
				
				// Process each item
				if (itemsData && itemsData.length > 0) {
					itemsData.forEach(item => {
						// Find parent order
						const parentOrder = ordersData.find(order => order.id === item.pos_order_id);
						
						if (parentOrder) {
							posItems.push({
								id: item.id,
								service_name: item.service_name,
								item_name: item.item_name || item.service_name,
								price: item.price,
								quantity: item.quantity,
								type: item.type || 'product',
								pos_orders: {
									id: parentOrder.id,
									created_at: parentOrder.created_at,
									status: parentOrder.status,
									client_name: parentOrder.client_name
								}
							});
						}
					});
				} else {
					// If no items found, still show the orders as single entries
					ordersData.forEach(order => {
						posItems.push({
							id: order.id,
							service_name: 'Order',
							item_name: `Order #${order.id.slice(-6)}`,
							price: order.total || 0,
							quantity: 1,
							type: 'order',
							pos_orders: {
								id: order.id,
								created_at: order.created_at,
								status: order.status,
								client_name: order.client_name
							}
						});
					});
				}
			}

			// Then query appointments for the same client
			const { data: appointmentData, error: appointmentError } = await supabase
				.from('appointments')
				.select(`
					id,
					start_time,
					end_time,
					status,
					notes,
					service_id,
					stylist_id
				`)
				.eq('client_id', clientName)
				.order('start_time', { ascending: false })
				.limit(20);

			if (appointmentError) {
				console.error('Error fetching appointment history:', appointmentError);
			}
			
			console.log("Found appointments:", appointmentData?.length || 0);

			// Get service details for appointments
			const appointmentItems: HistoryItem[] = [];
			
			// Process each appointment to get service details
			if (appointmentData && appointmentData.length > 0) {
				for (const appointment of appointmentData) {
					// Get service details if available
					let serviceName = 'Service';
					let servicePrice = 0;
					let stylistName = 'Unknown Stylist';
					
					if (appointment.service_id) {
						const { data: serviceData } = await supabase
							.from('services')
							.select('name, price')
							.eq('id', appointment.service_id)
							.single();
							
						if (serviceData) {
							serviceName = serviceData.name;
							servicePrice = serviceData.price;
						}
					}
					
					if (appointment.stylist_id) {
						const { data: stylistData } = await supabase
							.from('stylists')
							.select('name')
							.eq('id', appointment.stylist_id)
							.single();
							
						if (stylistData) {
							stylistName = stylistData.name;
						}
					}
					
					// Create history item
					appointmentItems.push({
						id: appointment.id,
						service_name: serviceName,
						price: servicePrice,
						quantity: 1,
						type: 'service',
						appointment_data: {
							id: appointment.id,
							created_at: appointment.start_time,
							status: appointment.status,
							stylist_name: stylistName
						}
					});
				}
			}

			// Combine both data sources with explicit typing
			const combinedHistory: HistoryItem[] = [...posItems, ...appointmentItems];
			combinedHistory.sort((a, b) => {
				const dateA = new Date(a.pos_orders?.created_at || (a.appointment_data?.created_at || ''));
				const dateB = new Date(b.pos_orders?.created_at || (b.appointment_data?.created_at || ''));
				return dateB.getTime() - dateA.getTime();
			});
			
			console.log("Total history items:", combinedHistory.length);
			setClientServiceHistory(combinedHistory || []);
		} catch (err) {
			console.error('Error in client history fetch:', err);
			setClientServiceHistory([]);
		} finally {
			setIsHistoryLoading(false);
		}
	}, [supabase, setIsHistoryLoading, setClientServiceHistory]);

	// RESTORING handleClientSelect HERE
	const handleClientSelect = useCallback((client: Client | null) => {
		setSelectedClient(client);
		if (client) {
			setCustomerName(client.full_name || '');
			setNewClientPhone(""); 
			setNewClientEmail("");
			if (client.full_name) { 
				console.log("Fetching history for client:", client.full_name);
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
			.reduce((sum, item) => {
				// Calculate item subtotal with individual discount applied (convert inclusive discount to exclusive)
				const itemTotal = item.price * item.quantity;
				const gstPct = item.gst_percentage || productGstRate;
				const discountIncl = item.discount || 0;
				const discountExcl = discountIncl / (1 + gstPct / 100);
				return sum + Math.max(0, itemTotal - discountExcl);
			}, 0);
	}, [orderItems, productGstRate]);

	const calculateServiceSubtotal = useCallback(() => {
		return orderItems
			.filter(item => item.type === 'service')
			.reduce((sum, item) => {
				// Calculate item subtotal with individual discount applied (convert inclusive discount to exclusive)
				const itemTotal = item.price * item.quantity;
				const gstPct = item.gst_percentage || serviceGstRate;
				const discountIncl = item.discount || 0;
				const discountExcl = discountIncl / (1 + gstPct / 100);
				return sum + Math.max(0, itemTotal - discountExcl);
			}, 0);
	}, [orderItems, serviceGstRate]);

	const calculateMembershipSubtotal = useCallback(() => {
		return orderItems
			.filter(item => item.type === 'membership')
			.reduce((sum, item) => {
				// Calculate item subtotal with individual discount applied (convert inclusive discount to exclusive)
				const itemTotal = item.price * item.quantity;
				const gstPct = item.gst_percentage || 18;
				const discountIncl = item.discount || 0;
				const discountExcl = discountIncl / (1 + gstPct / 100);
				return sum + Math.max(0, itemTotal - discountExcl);
			}, 0);
	}, [orderItems]);

	const calculateProductGstAmount = useCallback((subtotal: number) => {
		// If using membership payment and not split payment, disable GST
		if (useMembershipPayment && !isSplitPayment) {
			return 0;
		}
		return isProductGstApplied ? (subtotal * productGstRate) / 100 : 0;
	}, [isProductGstApplied, productGstRate, useMembershipPayment, isSplitPayment]);

	const calculateServiceGstAmount = useCallback((subtotal: number) => {
		// If using membership payment and not split payment, disable GST
		if (useMembershipPayment && !isSplitPayment) {
			return 0;
		}
		return isServiceGstApplied ? (subtotal * serviceGstRate) / 100 : 0;
	}, [isServiceGstApplied, serviceGstRate, useMembershipPayment, isSplitPayment]);

	const calculateMembershipGstAmount = useCallback((subtotal: number) => {
		// If using membership payment and not split payment, disable GST
		if (useMembershipPayment && !isSplitPayment) {
			return 0;
		}
		// Memberships typically have GST applied at 18%
		return subtotal * 18 / 100;
	}, [useMembershipPayment, isSplitPayment]);

	const calculateTotalDiscount = useCallback(() => {
		// Don't double-count individual discounts since they're already applied to item.total
		// Only add global discount
		const globalDiscount = walkInDiscount;
		
		console.log('Discount calculation:', { 
			globalDiscount, 
			note: 'Individual item discounts already applied to item.total'
		});
		
		return globalDiscount;
	}, [walkInDiscount]);

	const calculateTotalAmount = useCallback(() => {
		// Calculate total amount by summing only items that need to be paid by client
		// Services paid via membership are excluded since they're deducted from membership balance
		const totalAmount = orderItems.reduce((sum, item) => {
			const gstPercentage = item.gst_percentage || (item.type === 'product' ? productGstRate : serviceGstRate) || 18;
			const isGstApplied = item.type === 'product' ? isProductGstApplied : (item.type === 'service' ? isServiceGstApplied : true);
			const gstMultiplier = isGstApplied ? (1 + (gstPercentage / 100)) : 1;
			
			// For services paid via membership, exclude from total (they're deducted from membership balance)
			const isServicePaidViaMembership = item.type === 'service' && servicesMembershipPayment[item.id];
			if (isServicePaidViaMembership) {
				return sum; // Don't add this to the client's payable amount
			}
			
			const finalMultiplier = gstMultiplier;
			const itemTotalAmount = (item.price * item.quantity * finalMultiplier);
			const finalAmount = Math.max(0, itemTotalAmount - (item.discount || 0));
			
			return sum + finalAmount;
		}, 0) - walkInDiscount; // Apply global discount to the total
		
		return Math.max(0, totalAmount); // Ensure total is not negative
	}, [orderItems, productGstRate, serviceGstRate, isProductGstApplied, isServiceGstApplied, servicesMembershipPayment, walkInDiscount]);

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

	// NEW: Calculate amounts for services that will use membership payment (NO GST)
	const calculateServicesMembershipTotal = useCallback(() => {
		return orderItems
			.filter(item => item.type === 'service' && servicesMembershipPayment[item.id])
			.reduce((sum, item) => {
				const itemTotal = item.price * item.quantity;
				const gstPct = item.gst_percentage || serviceGstRate;
				const discountIncl = item.discount || 0;
				const discountExcl = discountIncl / (1 + gstPct / 100);
				const subtotal = Math.max(0, itemTotal - discountExcl);
				// NO GST for membership payments
				return sum + subtotal;
			}, 0);
	}, [orderItems, servicesMembershipPayment, serviceGstRate]);

	// NEW: Calculate amounts for services that will NOT use membership payment
	const calculateServicesRegularTotal = useCallback(() => {
		return orderItems
			.filter(item => item.type === 'service' && !servicesMembershipPayment[item.id])
			.reduce((sum, item) => {
				const itemTotal = item.price * item.quantity;
				const gstPct = item.gst_percentage || serviceGstRate;
				const discountIncl = item.discount || 0;
				const discountExcl = discountIncl / (1 + gstPct / 100);
				const subtotal = Math.max(0, itemTotal - discountExcl);
				const gstAmount = isServiceGstApplied ? (subtotal * gstPct) / 100 : 0;
				return sum + subtotal + gstAmount;
			}, 0);
	}, [orderItems, servicesMembershipPayment, serviceGstRate, isServiceGstApplied]);

	// NEW: Calculate amounts for all products (always regular payment)
	const calculateProductsRegularTotal = useCallback(() => {
		const productSubtotal = calculateProductSubtotal();
		const productGstAmount = calculateProductGstAmount(productSubtotal);
		return productSubtotal + productGstAmount;
	}, [calculateProductSubtotal, calculateProductGstAmount]);

	// NEW: Calculate amounts for memberships (always regular payment)
	const calculateMembershipsRegularTotal = useCallback(() => {
		const membershipSubtotal = calculateMembershipSubtotal();
		const membershipGstAmount = calculateMembershipGstAmount(membershipSubtotal);
		return membershipSubtotal + membershipGstAmount;
	}, [calculateMembershipSubtotal, calculateMembershipGstAmount]);

	// NEW: Get total amount that can be paid with membership balance
	const getMembershipPayableAmount = useCallback(() => {
		return calculateServicesMembershipTotal();
	}, [calculateServicesMembershipTotal]);

	// NEW: Get total amount that must be paid with regular methods
	const getRegularPayableAmount = useCallback(() => {
		const servicesRegular = calculateServicesRegularTotal();
		const productsRegular = calculateProductsRegularTotal();
		const membershipsRegular = calculateMembershipsRegularTotal();
		const globalDiscount = walkInDiscount; // Apply global discount to regular payment only
		return Math.max(0, servicesRegular + productsRegular + membershipsRegular - globalDiscount);
	}, [calculateServicesRegularTotal, calculateProductsRegularTotal, calculateMembershipsRegularTotal, walkInDiscount]);

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

	// Removed old useMemo calculations - now using proper calculate functions with discount support

	const salonProductsSubtotal = useMemo(() => {
		return salonProducts.reduce(
			(sum, item) => sum + item.total,
			0
		);
	}, [salonProducts]);



	// Separate useEffect to handle membership balance updates
	useEffect(() => {
		if (isSplitPayment) {
			const membershipAmount = getMembershipPayableAmount();
			const maxMembershipPayment = activeClientMembership ? Math.min(membershipAmount, activeClientMembership.currentBalance) : 0;
			
			// Only update membership amount if it's different
			if (Math.abs(paymentAmounts.membership - maxMembershipPayment) > 0.01) {
				setPaymentAmounts(prev => ({ 
					...prev, 
					membership: maxMembershipPayment
				}));
			}
		}
	}, [activeClientMembership, isSplitPayment, getMembershipPayableAmount]);

	// =============== FILTERED MEMOS (restored) ===============
	const filteredProducts = useMemo(() => {
		if (!productSearchTerm.trim()) {
			return allProducts.filter(product => 
				(product.stock_quantity === undefined || 
				product.stock_quantity === null || 
				product.stock_quantity > 0) &&
				product.active !== false
			);
		}
		return allProducts.filter(product => 
			(product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
			(product.description && product.description.toLowerCase().includes(productSearchTerm.toLowerCase()))) &&
			(product.stock_quantity === undefined || 
			product.stock_quantity === null || 
			product.stock_quantity > 0) &&
			product.active !== false
		);
	}, [allProducts, productSearchTerm]);

	const filteredServices = useMemo(() => {
		const activeServices = (services || []).filter(service => 
			service.active !== false
		);
		
		if (!serviceSearchTerm.trim()) return activeServices;
		
		return activeServices.filter(service => 
			service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
			(service.description && service.description.toLowerCase().includes(serviceSearchTerm.toLowerCase()))
		);
	}, [services, serviceSearchTerm]);

	const serviceHistory = useMemo(() => {
		if (!orders || !selectedClient) return [];
		
		return orders.filter(order => {
			const orderAny = order as any;
			return (orderAny.client_name === selectedClient.full_name || 
			       orderAny.customer_name === selectedClient.full_name) && 
			       Array.isArray(orderAny.services);
		});
	}, [orders, selectedClient]);

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
  const editOrderData = location.state?.editOrderData;
  
  // Handle both appointment data and edit order data
  const navigationData = appointmentNavData || editOrderData;
  
  if (!navigationData) {
    if (processedNavKeyRef.current !== null) {
      console.log('[POS useEffect] No navigation data in location.state. Resetting processedNavKeyRef.');
      processedNavKeyRef.current = null;
    }
    return; // Exit early if no navigation data
  }
  
  console.log('[POS useEffect] Received navigation data:', JSON.stringify(navigationData));
  
  // Skip if we've already processed this exact data
  if (processedNavKeyRef.current === JSON.stringify(navigationData)) {
    console.log('[POS useEffect] Already processed this navigation data, skipping');
    return;
  }
  
  // Skip if services aren't loaded yet
  if (loadingServices || !services || services.length === 0) {
    console.log('[POS useEffect] Services not loaded yet, will try again when services load');
    return;
  }
		
  // Mark as processed to prevent duplicate processing
  processedNavKeyRef.current = JSON.stringify(navigationData);
  console.log('[POS useEffect] Processing navigation data');
  
  if (editOrderData) {
    // Handle order editing
    console.log('[POS useEffect] Processing edit order data');
    
    // Determine which tab to use based on order type
    if (editOrderData.isSalonConsumption) {
      setTabValue(1); // Salon Purchase tab
    } else {
      setTabValue(0); // Walk-in Order tab
    }
    
    // Set client information
    setCustomerName(editOrderData.clientName || '');
    const matchingClient = clients?.find(c => c.id === editOrderData.clientId || c.full_name === editOrderData.clientName);
    if (matchingClient) {
      console.log('[POS useEffect] Setting selected client for edit:', matchingClient.full_name);
      setSelectedClient(matchingClient);
    } else {
      console.warn('[POS useEffect] Client not found for edit order');
    }
    
    // Set stylist information
    const matchingStylist = stylists?.find(s => s.id === editOrderData.stylistId);
    if (matchingStylist) {
      console.log('[POS useEffect] Setting selected stylist for edit:', matchingStylist.name);
      setSelectedStylist(matchingStylist);
    } else {
      console.warn('[POS useEffect] Stylist not found for edit order ID:', editOrderData.stylistId);
    }
    
    // Set payment information
    if (editOrderData.paymentMethod) {
      setWalkInPaymentMethod(editOrderData.paymentMethod as PaymentMethod);
    }
    
    // Set discount
    if (editOrderData.discount) {
      setWalkInDiscount(editOrderData.discount);
    }
    
    // Set consumption purpose if it's a salon consumption order
    if (editOrderData.isSalonConsumption && editOrderData.consumptionPurpose) {
      setConsumptionPurpose(editOrderData.consumptionPurpose);
    }
    
    // Clear existing order items before adding edited ones
    setOrderItems([]);
    
    // Process services/items from the order
    if (editOrderData.services && Array.isArray(editOrderData.services) && editOrderData.services.length > 0) {
      console.log('[POS useEffect] Found', editOrderData.services.length, 'services to edit');
      
      const newOrderItems = editOrderData.services.map((service: any) => {
        console.log('[POS useEffect] Processing edit service:', service);
        
        const serviceName = service.service_name || service.name || service.item_name;
        const serviceId = service.service_id || service.id;
        
        if (!serviceId || !serviceName) {
          console.warn('[POS useEffect] Invalid service data for edit:', service);
          return null;
        }
        
        // Look up additional service details from services list if available
        const serviceDetails = services.find(s => s.id === serviceId);
        console.log('[POS useEffect] Service details lookup:', serviceDetails ? 'found' : 'not found');
         
        // Create the order item with available data
        const orderItem: POSOrderItem = {
          id: uuidv4(),
          order_id: editOrderData.orderId || '',
          item_id: serviceId,
          item_name: serviceName,
          quantity: service.quantity || 1,
          price: service.price || (serviceDetails?.price || 0),
          total: (service.price || (serviceDetails?.price || 0)) * (service.quantity || 1),
          type: service.type || (service.service_type) || 'service',
          category: service.category || serviceDetails?.category || 'service',
          hsn_code: service.hsn_code || serviceDetails?.hsn_code,
          gst_percentage: service.gst_percentage || serviceDetails?.gst_percentage || 18,
          for_salon_use: editOrderData.isSalonConsumption || service.for_salon_use || false,
          discount: service.discount || 0,
          discount_percentage: service.discount_percentage || 0,
          // Preserve experts information for revenue split logic
          experts: (service as any).experts || []
        };
        
        return orderItem;
      }).filter(Boolean) as POSOrderItem[];
      
      // Add all valid order items at once
      if (newOrderItems.length > 0) {
        console.log('[POS useEffect] Adding edit order items:', newOrderItems);
        
        if (editOrderData.isSalonConsumption) {
          setSalonProducts(newOrderItems);
        } else {
          setOrderItems(newOrderItems);
        }
        
        toast.success(`Loaded ${newOrderItems.length} items for editing`);
      } else {
        console.warn('[POS useEffect] No valid services to edit');
        toast.error('No valid services found in order data');
      }
    }
    
  } else if (appointmentNavData) {
    // Handle appointment data (existing logic)
    console.log('[POS useEffect] Processing appointment data');
    
    // Force tab to walk-in order
    setTabValue(0);
    
    // Set client name and find client record
    setCustomerName(appointmentNavData.clientName || '');
    const matchingClient = clients?.find(c => c.full_name === appointmentNavData.clientName);
    if (matchingClient) {
      console.log('[POS useEffect] Setting selected client:', matchingClient.full_name);
      setSelectedClient(matchingClient);
    } else {
      console.warn('[POS useEffect] Client not found for name:', appointmentNavData.clientName);
    }
    
    // Find and set stylist(s)
    const matchingStylist = stylists?.find(s => s.id === appointmentNavData.stylistId);
    if (matchingStylist) {
      console.log('[POS useEffect] Setting selected stylist:', matchingStylist.name);
      setSelectedStylist(matchingStylist);
    } else {
      console.warn('[POS useEffect] Stylist not found for ID:', appointmentNavData.stylistId);
    }

    // Handle multiple experts if provided
    if (appointmentNavData.allExperts && Array.isArray(appointmentNavData.allExperts) && appointmentNavData.allExperts.length > 1) {
      console.log('[POS useEffect] Setting multiple stylists for multi-expert appointment:', appointmentNavData.allExperts);
      const multipleStylists = appointmentNavData.allExperts.map((expert: any) => {
        const stylistMatch = stylists?.find(s => s.id === expert.id);
        if (!stylistMatch) {
          console.warn('[POS useEffect] Stylist not found for expert ID:', expert.id);
        }
        return stylistMatch || null;
      });
      setSelectedStylists(multipleStylists);
    } else {
      // Reset to single stylist mode
      setSelectedStylists([]);
    }
    
    // Track the appointment ID for handling order creation later
    if (appointmentNavData.id) {
      console.log('[POS useEffect] Setting current appointment ID:', appointmentNavData.id);
      setCurrentAppointmentId(appointmentNavData.id);
    }
    
    // Clear existing order items before adding new ones
    setOrderItems([]);
    
    try {
      console.log('[POS useEffect] Processing appointment services');
      
      // CASE 1: Handle service collection with multiple services
      if (appointmentNavData.services && Array.isArray(appointmentNavData.services) && appointmentNavData.services.length > 0) {
        console.log('[POS useEffect] Found service collection with', appointmentNavData.services.length, 'services');
        
        // Process each service in the collection
        const newOrderItems = appointmentNavData.services.map((service: any) => {
          console.log('[POS useEffect] Processing service:', service);
          
          if (!service.id || !service.name) {
            console.warn('[POS useEffect] Invalid service data:', service);
            return null; // Skip this invalid service
          }
           
          // Look up additional service details from services list if available
          const serviceDetails = services.find(s => s.id === service.id);
          console.log('[POS useEffect] Service details lookup:', serviceDetails ? 'found' : 'not found');
           
          // Create the order item with available data
          const orderItem: POSOrderItem = {
            id: uuidv4(),
            order_id: '',
            item_id: service.id,
            item_name: service.name,
            quantity: service.quantity || 1,
            price: service.price || (serviceDetails?.price || 0),
            total: (service.price || (serviceDetails?.price || 0)) * (service.quantity || 1),
            type: 'service',
            category: service.category || serviceDetails?.category || 'service',
            hsn_code: (service as any).hsn_code || serviceDetails?.hsn_code,
            gst_percentage: (service as any).gst_percentage || serviceDetails?.gst_percentage || 18,
            for_salon_use: false,
            discount: 0,
            discount_percentage: 0
          };
          
          return orderItem;
        }).filter(Boolean) as POSOrderItem[];

        // Add all valid order items at once
        if (newOrderItems.length > 0) {
          console.log('[POS useEffect] Adding order items:', newOrderItems);
          setOrderItems(newOrderItems);
          toast.success(`Added ${newOrderItems.length} services to order`);
        } else {
          console.warn('[POS useEffect] No valid services to add to order');
          toast.error('No valid services found in appointment data');
        }
      } else {
        console.warn('[POS useEffect] No services found in appointment data');
        toast.error('No services found in appointment data');
      }
    } catch (error) {
      console.error('[POS useEffect] Error processing appointment data:', error);
      toast.error('Error processing appointment data');
    }
  }
}, [location, services, loadingServices, clients, stylists, setTabValue, setCustomerName, setSelectedClient, setSelectedStylist, setCurrentAppointmentId, setOrderItems, setSalonProducts, setWalkInPaymentMethod, setWalkInDiscount, setConsumptionPurpose]);

	const fetchBalanceStockData = useCallback(async () => {
		console.log("Fetching latest stock data from products table...");
		try {
			// Get stock data directly from the products table
			const { data, error } = await supabase
				.from('products')
				.select('id, name, stock_quantity, hsn_code, units, active');

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
							if (product.stock_quantity !== stockItem.stock_quantity || product.active !== stockItem.active) {
								console.log(`Updating product ${product.name} - Stock: ${product.stock_quantity} → ${stockItem.stock_quantity}, Active: ${product.active} → ${stockItem.active}`);
								return { 
									...product, 
									stock_quantity: stockItem.stock_quantity,
									active: stockItem.active
								};
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

	// Function to fetch latest purchase costs for all products
	const fetchLatestPurchaseCosts = useCallback(async () => {
		try {
			console.log("Fetching latest purchase costs from purchase_history_with_stock...");
			
			// Get latest purchase cost for each product using DISTINCT ON
			const { data, error } = await supabase
				.from('purchase_history_with_stock')
				.select('product_id, price_inlcuding_disc, date')
				.order('product_id, date', { ascending: false });

			if (error) {
				console.error("Error fetching purchase costs:", error);
				return {};
			}

			// Process data to get latest cost per product
			const latestCosts: Record<string, number> = {};
			const processedProducts = new Set<string>();

			// Since we ordered by product_id, date desc, the first occurrence of each product_id is the latest
			if (data && data.length > 0) {
				for (const item of data) {
					if (!processedProducts.has(item.product_id)) {
						latestCosts[item.product_id] = item.price_inlcuding_disc || 0;
						processedProducts.add(item.product_id);
					}
				}
			}

			console.log(`Found latest purchase costs for ${Object.keys(latestCosts).length} products`);
			return latestCosts;
		} catch (error) {
			console.error("Error in fetchLatestPurchaseCosts:", error);
			return {};
		}
	}, []);

	// Function to fetch purchase costs from product_master table for salon consumption
	const fetchProductMasterCosts = useCallback(async () => {
		try {
			console.log("Fetching purchase costs from product_master table...");
			
			// Get purchase costs from product_master table - using the correct column name
			const { data, error } = await supabase
				.from('product_master')
				.select('id, name, "Purchase_Cost/Unit(Ex.GST)"');

			if (error) {
				console.error("Error fetching product master costs:", error);
				return { costs: {}, costsByName: {} };
			}

			// Process data to get purchase cost per product
			const productMasterCosts: Record<string, number> = {};
			const productMasterCostsByName: Record<string, number> = {};
			
			if (data && data.length > 0) {
				for (const item of data) {
					if (item.id && item["Purchase_Cost/Unit(Ex.GST)"] !== null) {
						const cost = parseFloat(item["Purchase_Cost/Unit(Ex.GST)"]) || 0;
						productMasterCosts[item.id] = cost;
						// Also store by name for fallback matching
						if (item.name) {
							productMasterCostsByName[item.name.toLowerCase().trim()] = cost;
						}
						console.log(`Found purchase cost for ${item.name} (${item.id}): ₹${item["Purchase_Cost/Unit(Ex.GST)"]}`);
					}
				}
			}

			console.log(`Found product master costs for ${Object.keys(productMasterCosts).length} products`);
			return { costs: productMasterCosts, costsByName: productMasterCostsByName };
		} catch (error) {
			console.error("Error in fetchProductMasterCosts:", error);
			return { costs: {}, costsByName: {} };
		}
	}, []);

	// State to store product master costs for salon consumption
	const [productMasterCosts, setProductMasterCosts] = useState<Record<string, number>>({});
	const [productMasterCostsByName, setProductMasterCostsByName] = useState<Record<string, number>>({});

	// Helper function to get purchase cost for a product
	const getPurchaseCostForProduct = useCallback((productId: string, productName: string, fallbackPrice: number): number => {
		// Try exact ID match first
		if (productMasterCosts[productId]) {
			return productMasterCosts[productId];
		}
		
		// Try exact name match
		const nameKey = productName.toLowerCase().trim();
		if (productMasterCostsByName[nameKey]) {
			return productMasterCostsByName[nameKey];
		}
		
		// Fallback to provided price
		return fallbackPrice;
	}, [productMasterCosts, productMasterCostsByName]);

	// Fetch product master costs when component mounts
	useEffect(() => {
		const loadProductMasterCosts = async () => {
			const costs = await fetchProductMasterCosts();
			setProductMasterCosts(costs.costs);
			setProductMasterCostsByName(costs.costsByName);
		};
		loadProductMasterCosts();
	}, [fetchProductMasterCosts]);

	// Define fetchAllProducts BEFORE useEffect that uses it
	const fetchAllProducts = useCallback(async () => {
		setLoadingProducts(true);
		try {
			let allLoadedProducts: POSService[] = [];
			
			// First fetch latest purchase costs (though not used as primary price for walk-in)
			// const latestPurchaseCosts = await fetchLatestPurchaseCosts(); // This line can be kept if latestPurchaseCosts is used elsewhere, or removed if only for the old price logic.
			// For this change, we are simplifying the price logic for allProducts based on user request.
			
			if (inventoryProducts && inventoryProducts.length > 0) {
				const mappedProducts = inventoryProducts.map((product) => {
					// For walk-in orders, the primary price displayed and used should be "MRP Ex. GST (Rs.)"
					// Assuming product.mrp_per_unit_excl_gst holds this value.
					const mrpExGSTForWalkIn = product.mrp_per_unit_excl_gst || product.price || 0; 
					
					console.log(`Product ${product.name}: MRP Ex. GST for Walk-In: ${mrpExGSTForWalkIn.toFixed(2)}`);
					
					return {
						id: product.id,
						name: product.name,
						price: mrpExGSTForWalkIn, // Use MRP Ex. GST as the primary price for POSService objects
						description: `MRP Ex. GST: ₹${mrpExGSTForWalkIn.toFixed(2)} | Stock: ${product.stock_quantity || 0}`, // Updated description
						type: "product" as "product" | "service",
						hsn_code: product.hsn_code,
						units: product.units,
						gst_percentage: product.gst_percentage,
						stock_quantity: product.stock_quantity || 0,
						active: product.active
						// Ensure all necessary fields from 'product' are carried over if needed elsewhere
					};
				});
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
	}, [inventoryProducts, fetchBalanceStockData]); // Removed fetchLatestPurchaseCosts from dependencies if it's no longer used directly here.

	// UseEffect for initial fetch
	useEffect(() => {
		fetchAllProducts();
	}, [fetchAllProducts]);

	// ====================================================
	// 4. EVENT HANDLERS & HELPER FUNCTIONS (useCallback or regular)
	// ====================================================

	// Generate time slots (defined after helper function)
	const timeSlots = useMemo(() => generateTimeSlots(8, 20, 15), []);



	// Enhanced payment validation helper
	const getPaymentValidation = useCallback(() => {
		const totalAmount = calculateTotalAmount();
		const totalPayments = Object.values(paymentAmounts).reduce((sum, amount) => sum + amount, 0);
		const remaining = totalAmount - totalPayments;
		const isValid = Math.abs(remaining) < 0.01; // Allow small rounding differences
		
		return {
			totalAmount,
			totalPayments,
			remaining,
			isValid,
			isOverpaid: remaining < -0.01,
			isUnderpaid: remaining > 0.01
		};
	}, [calculateTotalAmount, paymentAmounts]);

	// Update the isOrderValid function to use the new payment validation
	const isOrderValid = useCallback(() => {
		// Customer info validation
		const customerInfoValid = customerName.trim() !== "" && selectedStylist !== null;
		
		// Order items validation
		const orderItemsValid = orderItems.length > 0;
		
		// Payment validation using the new validation helper
		const paymentValidation = getPaymentValidation();
		const paymentValid = paymentValidation.isValid;
		
		return customerInfoValid && orderItemsValid && paymentValid;
	}, [customerName, selectedStylist, orderItems, getPaymentValidation]);

	// Add effect to handle split payment amount distribution
	useEffect(() => {
		if (isSplitPayment) {
			const currentTotal = calculateTotalAmount();
			const totalEntered = Object.values(paymentAmounts).reduce((sum, amount) => sum + amount, 0);
			
			// If total entered is more than the bill amount, adjust the last non-zero payment
			if (totalEntered > currentTotal) {
				const methods = Object.entries(paymentAmounts)
					.filter(([_, amount]) => amount > 0)
					.map(([method]) => method);
				
				if (methods.length > 0) {
					const lastMethod = methods[methods.length - 1] as PaymentMethod;
					const excess = totalEntered - currentTotal;
					setPaymentAmounts(prev => ({
						...prev,
						[lastMethod]: Math.max(0, prev[lastMethod] - excess)
					}));
				}
			}
		}
	}, [isSplitPayment, paymentAmounts, calculateTotalAmount]);

	// Update the payment amount change handler
	const handlePaymentAmountChange = useCallback((method: PaymentMethod, value: number) => {
		const newValue = Math.max(0, value || 0);
		const currentTotal = calculateTotalAmount();
		
		if (isSplitPayment) {
			// In split payment mode, allow free distribution of amounts
			const newPaymentAmounts = { ...paymentAmounts, [method]: newValue };
			setPaymentAmounts(newPaymentAmounts);
		} else {
			// In single payment mode, check if user is trying to enter amounts in multiple fields
			const otherPaymentMethods = Object.entries(paymentAmounts).filter(([m]) => m !== method);
			const hasOtherPayments = otherPaymentMethods.some(([_, amt]) => amt > 0);
			
			if (hasOtherPayments && newValue > 0) {
				// User is trying to enter amount in a second field - auto-enable split payment
				setIsSplitPayment(true);
				setPaymentAmounts({ ...paymentAmounts, [method]: newValue });
			} else {
				// Single payment mode - put all amount in the selected method
				const newPaymentAmounts = {
					cash: 0,
					credit_card: 0,
					debit_card: 0,
					upi: 0,
					bnpl: 0,
					membership: 0
				};
				
				newPaymentAmounts[method] = Math.min(newValue, currentTotal);
				setPaymentAmounts(newPaymentAmounts);
				setWalkInPaymentMethod(method);
			}
		}
	}, [paymentAmounts, isSplitPayment, calculateTotalAmount]);

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
	}, [calculateTotalAmount, paymentAmounts]);

	const clearAllPayments = useCallback(() => {
		setPaymentAmounts({
			cash: 0,
			credit_card: 0,
			debit_card: 0,
			upi: 0,
			bnpl: 0,
			membership: 0
		});
	}, []);

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
	}, [calculateTotalAmount]);

	// Modify handleCreateWalkInOrder to use the isOrderValid function
	const handleCreateWalkInOrder = useCallback(async () => {
		if (!isOrderValid()) {
			const paymentValidation = getPaymentValidation();
			let errorMessage = "Please complete all required fields.";
			
			if (!paymentValidation.isValid) {
				if (paymentValidation.isUnderpaid) {
					errorMessage = `Payment incomplete. Remaining amount: ₹${paymentValidation.remaining.toFixed(2)}`;
				} else if (paymentValidation.isOverpaid) {
					errorMessage = `Payment exceeds bill amount by ₹${Math.abs(paymentValidation.remaining).toFixed(2)}. Please adjust the payment amounts.`;
				}
			}
			
			setSnackbarMessage(errorMessage);
			setSnackbarOpen(true);
			return;
		}
		
		const totalAmount = calculateTotalAmount();
		const amountPaid = Object.values(paymentAmounts).reduce((a, b) => a + b, 0);
		const membershipPayableAmount = getMembershipPayableAmount();
		
		// Enhanced payment validation
		const paymentValidation = getPaymentValidation();
		if (!paymentValidation.isValid) {
			if (paymentValidation.isOverpaid) {
				setSnackbarMessage(`Payment exceeds bill amount by ₹${Math.abs(paymentValidation.remaining).toFixed(2)}. Please adjust the payment amounts.`);
			} else if (paymentValidation.isUnderpaid) {
				setSnackbarMessage(`Payment incomplete. Remaining amount: ₹${paymentValidation.remaining.toFixed(2)}`);
			}
			setSnackbarOpen(true);
			return;
		}
		
		// If there are membership services but no active membership, show error
		if (membershipPayableAmount > 0 && !activeClientMembership) {
			setSnackbarMessage("Client needs an active membership to pay for selected services via membership.");
			setSnackbarOpen(true);
			return;
		}
		
		// If membership balance is insufficient, show error
		if (membershipPayableAmount > 0 && activeClientMembership && activeClientMembership.currentBalance < membershipPayableAmount) {
			setSnackbarMessage(`Insufficient membership balance. Required: ₹${membershipPayableAmount.toLocaleString()}, Available: ₹${activeClientMembership.currentBalance.toLocaleString()}`);
			setSnackbarOpen(true);
			return;
		}
		
		// Allow orders where everything is paid via membership (totalAmount = 0)
		// Only require payment amount if there's an amount left for the client to pay
		if (totalAmount > 0 && amountPaid <= 0) {
			setSnackbarMessage("Please enter a payment amount.");
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
				product_id: service.item_id,
				product_name: service.item_name,
				category: service.category,
				discount: service.discount || 0,
				discount_percentage: service.discount_percentage || 0
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
				product_name: item.item_name,
				category: item.category,
				discount: item.discount || 0,
				discount_percentage: item.discount_percentage || 0
			}));
			
			// Convert memberships to format expected by standalone function
			const membershipItems = orderItems.filter(item => item.type === 'membership');
			const formattedMemberships = membershipItems.map(item => ({
				id: item.item_id,
				name: item.item_name,
				price: item.price,
				quantity: item.quantity,
				type: 'membership' as const,
				gst_percentage: 18, // Memberships typically have 18% GST
				hsn_code: item.hsn_code || '',
				service_id: item.item_id,
				service_name: item.item_name,
				product_id: item.item_id,
				product_name: item.item_name,
				category: 'membership',
				discount: item.discount || 0,
				discount_percentage: item.discount_percentage || 0,
				duration_months: item.duration_months || 12
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
				memberships: formattedMemberships.length,
				staffInfo
			});
			
			// Call the standalone function with the correct parameters
			const subtotal = calculateProductSubtotal() + calculateServiceSubtotal() + calculateMembershipSubtotal();
			const tax = calculateProductGstAmount(calculateProductSubtotal()) + calculateServiceGstAmount(calculateServiceSubtotal()) + calculateMembershipGstAmount(calculateMembershipSubtotal());
			// Always use the full amount regardless of payment method
			const totalAmount = subtotal + tax - walkInDiscount;
			
					// Check if this is a multi-expert appointment
		const isMultiExpert = selectedStylists && selectedStylists.length > 1 && selectedStylists.every(s => s !== null);
		const expertsToProcess = isMultiExpert ? selectedStylists.filter(s => s !== null) : [staffInfo];
		const numberOfExperts = expertsToProcess.length;
		
		console.log(`[Multi-Expert Order] Creating ${numberOfExperts} orders for ${numberOfExperts} experts:`, expertsToProcess.map(e => e?.name));
		
		// Create orders for each expert (split revenue among them)
		const orderResults = [];
		
		for (let i = 0; i < expertsToProcess.length; i++) {
			const expert = expertsToProcess[i];
			if (!expert) continue;

			// ---------- NEW: decide whether this expert gets products / memberships ----------
			const includeProductsAndMemberships = !(isMultiExpert && i !== 0); // only the primary expert (index 0) gets these

			// --- New per-service revenue split ---
			const expertServicesOriginal = formattedServices.filter(service => {
			  const expArr = (service as any).experts as any[] | undefined;
			  console.log(`[Multi-Expert Billing] Service ${service.item_name}, Expert ${expert.name}, Experts array:`, expArr);
			  
			  if (expArr && expArr.length > 0) {
			    const hasExpert = expArr.some(ex => ex.id === expert.id);
			    console.log(`[Multi-Expert Billing] Service ${service.item_name} - Expert ${expert.name} assigned: ${hasExpert}`);
			    return hasExpert;
			  }
			  
			  // FIXED: Only give services with no experts array to the primary expert (first expert)
			  const isPrimaryExpert = i === 0;
			  console.log(`[Multi-Expert Billing] Service ${service.item_name} has no experts array - assigning to primary expert only (${expert.name} is primary: ${isPrimaryExpert})`);
			  return isPrimaryExpert;
			});

			console.log(`[Multi-Expert Billing] Expert ${expert.name} gets ${expertServicesOriginal.length} services:`, expertServicesOriginal.map(s => s.item_name));

			// For each service, determine share count and adjust price
			const splitServicesForExpert = expertServicesOriginal.map(service => {
			  const expArr = ((service as any).experts || []) as any[];
			  const shareCount = expArr && expArr.length > 0 ? expArr.length : numberOfExperts;
			  const splitPrice = service.price / shareCount;
			  return {
			    ...service,
			    price: splitPrice,
			    total: splitPrice * service.quantity,
			    split_revenue: true,
			    total_experts: shareCount,
			    expert_index: (expArr && expArr.length > 0) ? expArr.findIndex(ex => ex.id === expert.id) + 1 : (i + 1)
			  } as any;
			});

			// Calculate service subtotals & tax for this expert based on split services
			const splitServiceSubtotal = splitServicesForExpert.reduce((sum, s) => sum + s.price * s.quantity, 0);
			const splitServiceTax      = splitServicesForExpert.reduce((sum, s) => sum + calculateServiceGstAmount(s.price * s.quantity), 0);

			// Product / membership portions (only primary gets them)
			const productSubForExpert      = includeProductsAndMemberships ? calculateProductSubtotal()      : 0;
			const membershipSubForExpert   = includeProductsAndMemberships ? calculateMembershipSubtotal()  : 0;
			const productTaxForExpert      = includeProductsAndMemberships ? calculateProductGstAmount(calculateProductSubtotal())     : 0;
			const membershipTaxForExpert   = includeProductsAndMemberships ? calculateMembershipGstAmount(calculateMembershipSubtotal()) : 0;

			// Final totals for this expert --------------------------------------------
			const expertSubtotal = productSubForExpert + membershipSubForExpert + splitServiceSubtotal;
			const expertTax      = productTaxForExpert + membershipTaxForExpert + splitServiceTax;
			const expertTotal    = expertSubtotal + expertTax - (isMultiExpert ? (walkInDiscount / numberOfExperts) : walkInDiscount);

			// Build item arrays --------------------------------------------------------
			const expertProducts      = includeProductsAndMemberships ? formattedProducts : [];
			const expertMemberships   = includeProductsAndMemberships ? formattedMemberships : [];
			const expertServicesFinal = isMultiExpert ? 
				splitServicesForExpert : formattedServices;

			const itemsForOrder = [...expertProducts, ...expertServicesFinal, ...expertMemberships].map(item => ({
				...item,
				discount: item.discount || 0,
				discount_percentage: item.discount_percentage || 0
			})) as any[];

			// -------------------------------------------------------------------------
			// Use the correct amountPaid calculation from paymentAmounts
			const totalAmountPaid = Object.values(paymentAmounts).reduce((a, b) => a + b, 0);
			
			// Build payments array from paymentAmounts instead of splitPayments
			const paymentsArray = Object.entries(paymentAmounts)
				.filter(([_, amount]) => amount > 0)
				.map(([method, amount]) => ({
					id: uuidv4(),
					amount: isMultiExpert ? amount / numberOfExperts : amount,
					payment_method: method as PaymentMethodWithSplit,
					payment_date: orderDate ? orderDate.toISOString() : new Date().toISOString()
				}));

			// Determine payment method based on actual payments used
			const paymentMethodsUsed = Object.entries(paymentAmounts).filter(([_, amount]) => amount > 0);
			const primaryPaymentMethod = paymentMethodsUsed.length === 1 ? 
				paymentMethodsUsed[0][0] as PaymentMethodWithSplit : 
				(paymentMethodsUsed.length > 1 ? 'split' as PaymentMethodWithSplit : walkInPaymentMethod);

			const orderResult = await createWalkInOrderMutation.mutateAsync({
				order_id: uuidv4(),
				client_id: clientIdToUse || '',
				client_name: clientNameToUse,
				stylist_id: expert.id || '',
				stylist_name: expert.name || '',
				appointment_id: currentAppointmentId || undefined,
				items: [],
				services: itemsForOrder,
				payment_method: primaryPaymentMethod,
				split_payments: paymentMethodsUsed.length > 1 ? paymentsArray : undefined,
				discount: isMultiExpert ? (walkInDiscount / numberOfExperts) : walkInDiscount,
				discount_percentage: walkInDiscountPercentage,
				subtotal: expertSubtotal,
				tax: expertTax,
				total: expertTotal,
				total_amount: expertTotal,
				status: 'completed',
				order_date: orderDate ? orderDate.toISOString() : new Date().toISOString(),
				is_walk_in: true,
				is_salon_consumption: false,
				// Calculate expert's share of payment correctly
				pending_amount: 0, // Always 0 for completed orders - no pending amounts
				payments: paymentsArray,
				...(isMultiExpert && {
					multi_expert: true,
					total_experts: numberOfExperts,
					expert_index: i + 1
				})
			});

			orderResults.push(orderResult);
			
			if (!orderResult.success) {
				throw new Error(`Failed to create order for ${expert.name}: ${orderResult.error?.message || 'Unknown error'}`);
			}
			
			console.log(`[Multi-Expert Order] Created order for ${expert.name}: ${orderResult.order?.id}`);
		}
		
		// Use the first order result for the rest of the logic (they should all be successful)
		const orderResult = orderResults[0];
			
			if (!orderResult.success) {
				throw new Error(orderResult.error?.message || 'Failed to create order');
			}

					// --- Update Appointment Status if Applicable ---
		if (currentAppointmentId && updateAppointment) {
			try {
				// Update all created orders with the appointment_id if needed
				for (const result of orderResults) {
					if (result.order && result.order.id) {
						console.log(`DEBUG: Updating order ${result.order.id} with appointment_id ${currentAppointmentId}`);
						
						// Update the order with the appointment ID
						const { error: updateOrderError } = await supabase
							.from('pos_orders')
							.update({ appointment_id: currentAppointmentId })
							.eq('id', result.order.id);
							
						if (updateOrderError) {
							console.error('Error updating order with appointment_id:', updateOrderError);
						} else {
							console.log(`Successfully linked order ${result.order.id} to appointment ${currentAppointmentId}`);
						}
					}
				}
				
				// Update the appointment status
				await updateAppointment({ 
					id: currentAppointmentId, 
					status: 'completed', 
					paid: true, 
					checked_in: false, // Auto check-out when completing order
					clientDetails: [] 
				});
				console.log(`Appointment ${currentAppointmentId} marked as completed, paid, and checked out.`);
			} catch (updateError) {
				console.error(`Failed to update appointment status for ${currentAppointmentId}:`, updateError);
				toast.error('Order created, but failed to update appointment status.');
			}
		}

					const successMessage = isMultiExpert ? 
			`${orderResults.length} orders created successfully for ${numberOfExperts} experts!` : 
			"Order created successfully!";
		setSnackbarMessage(successMessage);
		setSnackbarOpen(true);
		
		// Store the created order for printing (use the first order)
		if (orderResult.order) {
			setLastCreatedOrder(orderResult.order);
			setPrintDialogOpen(true);
		}
			
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
			
			// Process membership payment and update balance
			const membershipPayableAmount = getMembershipPayableAmount();
			if (membershipPayableAmount > 0 && activeClientMembership) {
				// Deduct the membership payment amount from the membership balance
				const newBalance = activeClientMembership.currentBalance - membershipPayableAmount;
				const { error } = await supabase
					.from('members')
					.update({ current_balance: newBalance })
					.eq('id', activeClientMembership.id);
				if (error) {
					toast.error('Failed to update membership balance');
					console.error('Membership balance update error:', error);
				} else {
					setActiveClientMembership({ ...activeClientMembership, currentBalance: newBalance });
					toast.success(`Membership balance updated. Deducted: ₹${membershipPayableAmount.toLocaleString()}`);
				}
			}

			// Initialize balance for new memberships
			const membershipItemsForProcessing = orderItems.filter(i => i.type === 'membership' || i.category === 'membership');
			for (const item of membershipItemsForProcessing) {
				// Check if membership already exists for this client
				const { data: existingMembership } = await supabase
					.from('members')
					.select('id')
					.eq('client_id', clientIdToUse)
					.eq('tier_id', item.item_id)
					.single();

				if (existingMembership) {
					// Update existing membership
					const { error: updateError } = await supabase
						.from('members')
						.update({
							current_balance: item.price + (item.benefitAmount || 0),
							total_membership_amount: item.price,
							benefit_amount: item.benefitAmount || 0,
							expires_at: new Date(Date.now() + (item.duration_months || 12) * 30 * 24 * 60 * 60 * 1000).toISOString()
						})
						.eq('id', existingMembership.id);

					if (updateError) {
						toast.error('Failed to update membership');
						console.error('Membership update error:', updateError);
					} else {
						toast.success('Membership renewed');
					}
				} else {
					// Create new membership
					const { error: insertError } = await supabase
						.from('members')
						.insert({
							client_id: clientIdToUse,
							client_name: clientNameToUse,
							tier_id: item.item_id,
							purchase_date: new Date().toISOString(),
							expires_at: new Date(Date.now() + (item.duration_months || 12) * 30 * 24 * 60 * 60 * 1000).toISOString(),
							current_balance: item.price + (item.benefitAmount || 0),
							total_membership_amount: item.price,
							benefit_amount: item.benefitAmount || 0
						});

					if (insertError) {
						toast.error('Failed to record membership purchase');
						console.error('Membership insert error:', insertError);
					} else {
						toast.success('Membership activated');
					}
				}
			}
		} catch (error) {
			console.error("Error creating walk-in order:", error);
			const message = error instanceof Error ? error.message : "Unknown error";
			setSnackbarMessage(`Error creating order: ${message}`);
			setSnackbarOpen(true);
		} finally {
			setProcessing(false);
		}
	}, [currentAppointmentId, updateAppointment, orderItems, isOrderValid, calculateProductSubtotal, calculateServiceSubtotal, calculateProductGstAmount, calculateServiceGstAmount, walkInDiscount, getAmountPaid, selectedClient, selectedStylist, customerName, createWalkInOrderMutation, createOrder, isSplitPayment, splitPayments, productGstRate, serviceGstRate, calculateTotalAmount, allProducts, fetchBalanceStockData, directUpdateStockQuantity, createClientAsync, newClientPhone, newClientEmail, useMembershipPayment, activeClientMembership, paymentAmounts]);

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
		setSplitPayments([]); // Keep for any remaining logic, though paymentAmounts is primary

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
		// Reset paymentAmounts to default (e.g., cash covering total, others 0)
		// This will be handled by the total recalculation and paymentAmounts useEffects
		// For explicit reset:
		setPaymentAmounts({ cash: 0, credit_card: 0, debit_card: 0, upi: 0, bnpl: 0, membership: 0 });
		// Reset order date
		setOrderDate(new Date());
		// Reset service-specific membership payment tracking
		setServicesMembershipPayment({});

		// Clear persisted state from localStorage
		try {
			localStorage.removeItem(POS_STATE_STORAGE_KEY);
			console.log("Persisted POS state cleared from localStorage.");
		} catch (error) {
			console.error("Error clearing POS state from localStorage:", error);
		}
	}, []);

	const handleAddSalonProduct = useCallback((service: POSService, quantity: number = 1) => {
		// Check if product already exists in salon products
		const existingProductIndex = salonProducts.findIndex(
			(item) => item.item_id === service.id
		);

		// Get the purchase cost from product_master table, fallback to service price
		const purchaseCost = getPurchaseCostForProduct(service.id, service.name, service.price);
		console.log(`Using purchase cost for ${service.name}: ₹${purchaseCost} (from product_master)`);

		if (existingProductIndex >= 0) {
			// Product already exists, increase quantity
			const updatedProducts = [...salonProducts];
			updatedProducts[existingProductIndex].quantity += quantity;
			updatedProducts[existingProductIndex].total =
				updatedProducts[existingProductIndex].quantity * purchaseCost;
			// Update price to use purchase cost
			updatedProducts[existingProductIndex].price = purchaseCost;
			setSalonProducts(updatedProducts);
		} else {
			// Create a new order item for salon use
			const newItem: OrderItem = {
				id: uuidv4(),
				order_id: '',
				item_id: service.id,
				item_name: service.name,
				quantity: quantity,
				price: purchaseCost, // Use purchase cost from product_master
				total: purchaseCost * quantity,
				type: 'product', // Always set as product for salon use
				gst_percentage: service.gst_percentage,
				hsn_code: service.hsn_code,
				for_salon_use: true,
				purpose: consumptionPurpose,
				discount: 0,
				discount_percentage: 0
			};

			setSalonProducts((prev) => [...prev, newItem]);
		}
	}, [salonProducts, consumptionPurpose, getPurchaseCostForProduct]);

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
			const consumptionDateToUse = orderDate ? orderDate.toISOString() : currentDate;

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
							date: consumptionDateToUse, // Use selected date
							created_at: consumptionDateToUse, // Use selected date for consistency
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
			// Declare variables outside try-catch block so they're accessible later
			const orderId = uuidv4();
			const orderDateToUse = orderDate ? orderDate.toISOString() : new Date().toISOString();
			const orderTotal = salonProducts.reduce((sum, product) => sum + product.total, 0);
			
			try {
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
					created_at: orderDateToUse, // Use selected or current date
					pos_order_id: orderId
				}));

				// Create order record with fields exactly matching the pos_orders table schema
				const orderData: any = {
					id: orderId,
					created_at: orderDateToUse,
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
					services: salonProducts.map((product) => ({
						id: uuidv4(),
						name: product.item_name,
						price: product.price,
						quantity: product.quantity,
						type: 'product',
						gst_percentage: product.gst_percentage,
						hsn_code: product.hsn_code,
						discount: product.discount || 0,
						discount_percentage: product.discount_percentage || 0,
						total: product.total
					})),
					requisition_voucher_no: requisitionVoucherNo || null
				};
				
				// Add stock snapshot to track inventory
				const stockSnapshot: Record<string, number> = {};
				let firstProductStock = 0;
				
				// Get the initial stock quantities before the updates (from previous queries)
				for (const result of updateResults) {
					if (result.success && result.initialStock !== undefined) {
						const product = salonProducts.find(p => p.item_name === result.product);
						if (product) {
							stockSnapshot[product.item_id] = result.initialStock;
							
							// Use the first product's stock for the current_stock integer field
							if (firstProductStock === 0) {
								firstProductStock = result.initialStock;
							}
						}
					}
				}
				
				// Add stock snapshot and current_stock to the order data
				if (Object.keys(stockSnapshot).length > 0) {
					orderData.stock_snapshot = JSON.stringify(stockSnapshot);
					orderData.current_stock = String(firstProductStock);
				}

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
							created_at: orderDateToUse // Use selected or current date
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
				date: consumptionDateToUse, // Use consumptionDateToUse as it's in scope
				purpose: consumptionPurpose,
				notes: consumptionNotes,
				products: salonProducts.map(p => ({
					name: p.item_name,
					quantity: p.quantity
				}))
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
			
			// Save order for printing - create a simple order object for salon consumption
			const orderForPrinting = {
				id: `salon_${Date.now()}`,
				order_id: `salon_${Date.now()}`,
				client_name: 'Salon Consumption',
				created_at: new Date().toISOString(),
				total: salonProducts.reduce((sum, product) => sum + product.total, 0),
				services: salonProducts.map(product => ({
					name: product.item_name,
					price: product.price,
					quantity: product.quantity,
					total: product.total
					}))
			};
			setLastCreatedOrder(orderForPrinting);
			setPrintDialogOpen(true);

			// Reset form and navigate to orders page instead of inventory page
			resetFormState();
			navigate('/orders');

		} catch (error: any) {
			console.error('Error creating salon consumption:', error);
			toast.error(`Error: ${error.message || 'Unknown error occurred'}`);
		} finally {
			setProcessing(false);
		}
	}, [currentAppointmentId, updateAppointment, orderItems, isOrderValid, calculateProductSubtotal, calculateServiceSubtotal, calculateProductGstAmount, calculateServiceGstAmount, walkInDiscount, getAmountPaid, selectedClient, selectedStylist, customerName, createWalkInOrderMutation, createOrder, isSplitPayment, splitPayments, productGstRate, serviceGstRate, salonProducts, consumptionPurpose, consumptionNotes, requisitionVoucherNo, fetchBalanceStockData, resetFormState, navigate, queryClient, directUpdateStockQuantity, createClientAsync, newClientPhone, newClientEmail, orderDate]); // Changed createClient to createClientAsync here as well

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
					order_date: orderDate ? orderDate.toISOString() : new Date().toISOString(),
					is_walk_in: false,
				};

				// Construct the object matching Partial<Order> based on its definition
				const orderPayload: Partial<CreateOrderData> = {
					order_id: baseOrderData.order_id,
					client_id: baseOrderData.client_id,
					client_name: baseOrderData.client_name, 
					order_date: orderDate ? orderDate.toISOString() : baseOrderData.order_date,
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
					order_date: orderDate ? orderDate.toISOString() : new Date().toISOString(),
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
	}, [appointments, selectedClient, selectedStylist, orderItems, productGstRate, serviceGstRate, calculateProductGstAmount, calculateServiceGstAmount, calculateTotalAmount, calculateProductSubtotal, calculateServiceSubtotal, walkInDiscount, isSplitPayment, splitPayments, walkInPaymentMethod, createOrder, createWalkInOrderMutation, resetFormState, orderDate]);

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
							console.log("🔄 POS Salon: Forcefully refreshing product stock data and purchase costs");
							try {
								// First fetch balance stock for current stock quantities
								await fetchBalanceStockData();
								// Then reload all products to ensure everything is up to date
								
								await fetchAllProducts();
								// Also refresh product master costs for salon consumption
								const refreshedCosts = await fetchProductMasterCosts();
								setProductMasterCosts(refreshedCosts.costs);
								setProductMasterCostsByName(refreshedCosts.costsByName);
								toast.success("Stock data and purchase costs refreshed successfully");
								console.log("🔄 POS Salon: Stock data and purchase costs refresh complete");
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

				<Grid container spacing={2}> {/* Add Grid container here */}
					<Grid item xs={12} sm={6}>
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
					<Grid item xs={12} sm={6}>
						<LocalizationProvider dateAdapter={AdapterDateFns}>
							<DatePicker
								label="Consumption Date"
								value={orderDate}
								onChange={(newDate) => setOrderDate(newDate)}
								slotProps={{
									textField: {
										fullWidth: true,
										variant: "outlined",
										size: "small",
										helperText: "Select the date for this consumption",
										sx: { mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }
									}
								}}
							/>
						</LocalizationProvider>
					</Grid>
				</Grid> {/* Close Grid container */}

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
							renderOption={(props, option) => {
								// Get purchase cost from product_master table, fallback to option price (which is mrpExclGst from fetchAllProducts)
								const purchaseCost = getPurchaseCostForProduct(option.id, option.name, option.price);
								// Determine if the purchaseCost came from product_master or was a fallback
								const actualPurchaseCostFromMaster = productMasterCosts[option.id] || productMasterCostsByName[option.name.toLowerCase().trim()];
								const priceToDisplay = actualPurchaseCostFromMaster !== undefined ? actualPurchaseCostFromMaster : purchaseCost;
								const priceSource = actualPurchaseCostFromMaster !== undefined ? 'Purchase Cost (Ex.GST)' : `MRP Ex.GST (Fallback)`;
								
								return (
									<li {...props}>
										<Box>
											<Typography variant="body2">{option.name}</Typography>
											<Typography variant="caption" color="text.secondary">
												₹{priceToDisplay.toFixed(2)} ({priceSource}) • {option.stock_quantity !== undefined ? 
													`${option.stock_quantity} in stock` : 'Stock not available'}
											</Typography>
										</Box>
									</li>
								);
							}}
							value={null}
							onChange={(_, newProduct) => {
								if (newProduct) {
									if (newProduct.stock_quantity !== undefined && newProduct.stock_quantity <= 0) {
										 toast.error(`${newProduct.name} is out of stock`);
									} else {
										handleAddSalonProduct(newProduct); // handleAddSalonProduct uses getPurchaseCostForProduct internally
										const purchaseCostForToast = getPurchaseCostForProduct(newProduct.id, newProduct.name, newProduct.price);
										const actualPurchaseCostFromMasterForToast = productMasterCosts[newProduct.id] || productMasterCostsByName[newProduct.name.toLowerCase().trim()];
                						const priceSourceForToast = actualPurchaseCostFromMasterForToast !== undefined ? 'Purchase Cost (Ex.GST)' : `MRP Ex.GST (Fallback)`;
										toast.success(`Added ${newProduct.name} for salon use at ₹${purchaseCostForToast.toFixed(2)} (${priceSourceForToast})`);
									}
								}
							}}
							renderInput={(params) => (
								<TextField {...params} 
									label="Select Product" 
									variant="outlined" 
									fullWidth 
									size="small"
									helperText="Prices shown are Purchase Cost/Unit (Ex.GST) from product master"
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
										<TableCell align="right">Purchase Cost/Unit (Ex.GST)</TableCell>
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
														// Get the purchase cost from product_master table, fallback to current price
														const purchaseCost = getPurchaseCostForProduct(product.item_id, product.item_name, product.price);
														const updatedProducts = salonProducts.map(p => 
															p.id === product.id ? {
																...p, 
																quantity: newQuantity, 
																price: purchaseCost, // Update price to use purchase cost
																total: purchaseCost * newQuantity
															} : p
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
		const membershipSubtotal = calculateMembershipSubtotal();
		const combinedSubtotal = productSubtotal + serviceSubtotal + membershipSubtotal;
		const productGstAmount = calculateProductGstAmount(productSubtotal);
		const serviceGstAmount = calculateServiceGstAmount(serviceSubtotal);
		const membershipGstAmount = calculateMembershipGstAmount(membershipSubtotal);
		const combinedGstAmount = productGstAmount + serviceGstAmount + membershipGstAmount;
		const subtotalIncludingGST = combinedSubtotal + combinedGstAmount;

		// Calculate individual item discounts total (for display only)
		const individualItemDiscounts = orderItems.reduce((sum, item) => sum + (item.discount || 0), 0);
		
		// Total discount for display (individual discounts already applied to subtotals)
		const totalDiscount = individualItemDiscounts + walkInDiscount;
		
		// Calculate total amount by summing actual individual item amounts (matching display)
		const totalAmount = orderItems.reduce((sum, item) => {
			const gstPercentage = item.gst_percentage || (item.type === 'product' ? productGstRate : serviceGstRate) || 18;
			const isGstApplied = item.type === 'product' ? isProductGstApplied : (item.type === 'service' ? isServiceGstApplied : true);
			const gstMultiplier = isGstApplied ? (1 + (gstPercentage / 100)) : 1;
			
			// For services paid via membership, exclude GST
			const isServicePaidViaMembership = item.type === 'service' && servicesMembershipPayment[item.id];
			const finalMultiplier = isServicePaidViaMembership ? 1 : gstMultiplier;
			const totalAmount = (item.price * item.quantity * finalMultiplier);
			const finalAmount = Math.max(0, totalAmount - (item.discount || 0));
			
			return sum + finalAmount;
		}, 0) - walkInDiscount; // Apply global discount to the total

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
							<React.Fragment key={item.id}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, borderBottom: '1px dashed', borderColor: 'divider', pb: 1.5 }}>
								<Box sx={{ flexGrow: 1, mr: 1 }}>
									<Typography variant="body1" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
										{item.type === 'service' && <ContentCutIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5, color: 'primary.main' }} />}
										{item.type === 'product' && <Inventory fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5, color: 'secondary.main' }} />}
										{item.type === 'membership' && <CardMembershipIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5, color: 'success.main' }} />}
										{item.item_name}
										<Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
											(x{item.quantity})
										</Typography>
									</Typography>
									<Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 2 }}>
										{(() => {
											// Calculate GST-inclusive price for display and discount calculations
											const gstPercentage = item.gst_percentage || (item.type === 'product' ? productGstRate : serviceGstRate) || 18;
											const isGstApplied = item.type === 'product' ? isProductGstApplied : (item.type === 'service' ? isServiceGstApplied : true);
											const gstMultiplier = isGstApplied ? (1 + (gstPercentage / 100)) : 1;
											const priceIncludingGst = item.price * gstMultiplier;
											const totalIncludingGst = priceIncludingGst * item.quantity;
											
											return (
												<>
													<TextField
														size="small"
														variant="standard"
														type="number"
														label="Price (Inc. GST)"
														value={priceIncludingGst.toFixed(2)}
														onChange={(e) => {
															const newPriceIncGst = parseFloat(e.target.value);
															// Convert back to ex-GST price for storage
															const newPriceExGst = isGstApplied ? newPriceIncGst / gstMultiplier : newPriceIncGst;
															handleItemPriceChange(item.id, isNaN(newPriceExGst) ? 0 : newPriceExGst);
														}}
														sx={{ width: '100px' }}
														InputProps={{
															startAdornment: <InputAdornment position="start">₹</InputAdornment>,
															inputProps: { step: 0.01, min: 0 }
														}}
													/>
													
													{/* Individual item discount fields - now working with GST-inclusive amounts */}
													<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
														<TextField
															size="small"
															variant="standard"
															type="number"
															label="Disc ₹"
															value={item.discount || 0}
															onChange={(e) => {
																const discAmount = parseFloat(e.target.value);
																const updatedItems = orderItems.map(i => 
																	i.id === item.id 
																		? { 
																			...i, 
																			discount: isNaN(discAmount) ? 0 : discAmount,
																			// Calculate percentage based on GST-inclusive amount
																			discount_percentage: isNaN(discAmount) ? 0 : 
																				totalIncludingGst > 0 ? Math.min(100, (discAmount / totalIncludingGst) * 100) : 0
																			// Don't modify total - keep it as original price × quantity
																		} 
																		: i
																);
																setOrderItems(updatedItems);
															}}
															sx={{ width: '70px' }}
															InputProps={{
																inputProps: { min: 0, max: totalIncludingGst }
															}}
														/>
														<TextField
															size="small"
															variant="standard"
															type="number"
															label="Disc %"
															value={item.discount_percentage || 0}
															onChange={(e) => {
																const discPercentage = parseFloat(e.target.value);
																const validPercentage = isNaN(discPercentage) ? 0 : Math.max(0, Math.min(100, discPercentage));
																// Calculate discount amount based on GST-inclusive total
																const discAmount = (validPercentage / 100) * totalIncludingGst;
																const updatedItems = orderItems.map(i => 
																	i.id === item.id 
																		? { 
																			...i, 
																			discount_percentage: validPercentage,
																			discount: discAmount
																			// Don't modify total - keep it as original price × quantity
																		} 
																		: i
																);
																setOrderItems(updatedItems);
															}}
															sx={{ width: '70px' }}
															InputProps={{
																endAdornment: <InputAdornment position="end">%</InputAdornment>,
																inputProps: { min: 0, max: 100, step: 1 }
															}}
														/>
													</Box>
												</>
											);
										})()}
									</Box>
								</Box>
								<Box sx={{ textAlign: 'right', minWidth: '100px' }}>
									{(() => {
										// Calculate display values with or without GST based on payment method
										const gstPercentage = item.gst_percentage || (item.type === 'product' ? productGstRate : serviceGstRate) || 18;
										const isGstApplied = item.type === 'product' ? isProductGstApplied : (item.type === 'service' ? isServiceGstApplied : true);
										const gstMultiplier = isGstApplied ? (1 + (gstPercentage / 100)) : 1;
										
										// For services paid via membership, exclude GST
										const isServicePaidViaMembership = item.type === 'service' && servicesMembershipPayment[item.id];
										const finalMultiplier = isServicePaidViaMembership ? 1 : gstMultiplier;
										const totalAmount = (item.price * item.quantity * finalMultiplier);
										const finalAmount = Math.max(0, totalAmount - (item.discount || 0));
										
										return (
											<>
												<Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
													{isServicePaidViaMembership ? 
														'Ex. GST (Membership)' : 
														`Inc. GST (${gstPercentage}%)`
													}
												</Typography>
												<Typography variant="body1" sx={{ fontWeight: 500 }}>
													{formatCurrency(finalAmount)}
												</Typography>
												{item.discount && item.discount > 0 && (
													<Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through', fontSize: '0.75rem' }}>
														{formatCurrency(totalAmount)}
													</Typography>
												)}
											</>
										);
									})()}
								</Box>
								<Tooltip title="Remove Item">
									<IconButton size="small" color="error" onClick={() => handleRemoveFromOrder(item.id)} sx={{ ml: 1 }}>
										<CloseIcon fontSize="small" />
									</IconButton>
								</Tooltip>
							</Box>
							{item.type === 'membership' && (
								<Box sx={{ pl: 4, pb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
										<TextField
												size="small"
												variant="outlined"
												type="number"
												label="Add Benefit Amount"
												value={item.benefitAmount || ''}
												onChange={(e) => {
														const benefit = parseFloat(e.target.value);
														const updatedItems = orderItems.map(i =>
																i.id === item.id
																		? {
																				...i,
																				benefitAmount: isNaN(benefit) ? 0 : benefit,
																			}
																		: i
														);
														setOrderItems(updatedItems);
												}}
												sx={{ width: '220px' }}
												InputProps={{
														startAdornment: <InputAdornment position="start">₹</InputAdornment>,
												}}
										/>
								</Box>
							)}
							{/* Add membership payment toggle for services */}
							{item.type === 'service' && (
								<Box sx={{ pl: 4, pb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
									<FormControlLabel
										control={
											<Switch
												checked={servicesMembershipPayment[item.id] || false}
												onChange={(e) => {
													if (!activeClientMembership || !activeClientMembership.isActive) {
														toast.error('No active membership found for this client');
														return;
													}
													setServicesMembershipPayment(prev => ({
														...prev,
														[item.id]: e.target.checked
													}));
													
													// Show toast message about membership discount
													if (e.target.checked) {
														const gstPercentage = item.gst_percentage || serviceGstRate || 18;
														const itemTotal = item.price * item.quantity;
														const gstAmount = (itemTotal * gstPercentage) / (100 + gstPercentage);
														toast.success(`Membership payment applied! GST discount of ₹${gstAmount.toFixed(2)} automatically applied.`);
													} else {
														toast.info('Membership payment removed. Regular pricing with GST will apply.');
													}
												}}
												size="small"
												color="primary"
												disabled={!activeClientMembership || !activeClientMembership.isActive}
											/>
										}
										label={
											<Box sx={{ display: 'flex', alignItems: 'center' }}>
												<AccountBalanceWalletIcon fontSize="small" sx={{ mr: 0.5 }} />
												<Typography variant="body2">
													Pay with Membership Balance
												</Typography>
												{!activeClientMembership && (
													<Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
														(No membership)
													</Typography>
												)}
											</Box>
										}
									/>
									{servicesMembershipPayment[item.id] && activeClientMembership && (
										<Chip
											icon={<CheckIcon fontSize="small" />}
											label={`Balance: ₹${activeClientMembership.currentBalance.toLocaleString()}`}
											size="small"
											color="primary"
											variant="outlined"
											sx={{ ml: 2 }}
										/>
									)}
								</Box>
							)}
							</React.Fragment>
						))
					)}
				</Box>
				<Divider sx={{ my: 2 }} />
				{/* Subtotals */}
				<Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
					<Typography variant="body2">Product Subtotal (MRP Ex.GST):</Typography>
					<Typography variant="body2" fontWeight="500">{formatCurrency(productSubtotal)}</Typography>
				</Box>
				<Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
					<Typography variant="body2">Service Subtotal:</Typography>
					<Typography variant="body2" fontWeight="500">{formatCurrency(serviceSubtotal)}</Typography>
				</Box>
				{membershipSubtotal > 0 && (
					<Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
						<Typography variant="body2">Membership Subtotal:</Typography>
						<Typography variant="body2" fontWeight="500">{formatCurrency(membershipSubtotal)}</Typography>
					</Box>
				)}
				
				{/* Manual date selection */}
				<Box sx={{ mb: 2, mt: 2 }}>
					<Typography variant="body2" fontWeight="500" gutterBottom>Order Date:</Typography>
					<LocalizationProvider dateAdapter={AdapterDateFns}>
						<DatePicker
							value={orderDate}
							onChange={(newDate) => setOrderDate(newDate)}
							slotProps={{
								textField: {
									fullWidth: true,
									variant: "outlined",
									size: "small",
									helperText: "Manually set order date",
									sx: { mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }
								}
							}}
						/>
					</LocalizationProvider>
				</Box>

				{/* GST Section */}
				<Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
					<Typography>Subtotal (Excl. GST):</Typography>
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
				{/* GST Section for Memberships */}
				{membershipSubtotal > 0 && (
					<Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
						<Typography variant="body2">Membership GST (18%):</Typography>
						<Typography variant="body2" fontWeight="500">{formatCurrency(membershipGstAmount)}</Typography>
					</Box>
				)}
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
				
				{/* Show breakdown of discounts if there are different types */}
				{(individualItemDiscounts > 0 || walkInDiscount > 0) && (
					<Box sx={{ mb: 1, ml: 2 }}>
						{individualItemDiscounts > 0 && (
							<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
								<Typography variant="body2" color="text.secondary">Item Discounts:</Typography>
								<Typography variant="body2" color="text.secondary">-{formatCurrency(individualItemDiscounts)}</Typography>
							</Box>
						)}
						{walkInDiscount > 0 && (
							<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
								<Typography variant="body2" color="text.secondary">Global Discount:</Typography>
								<Typography variant="body2" color="text.secondary">-{formatCurrency(walkInDiscount)}</Typography>
							</Box>
						)}
					</Box>
				)}

				<Divider sx={{ my: 2 }} />
				{/* Payment Breakdown - Show if there are services marked for membership payment */}
				{Object.values(servicesMembershipPayment).some(Boolean) && activeClientMembership && (
					<>
						<Typography variant="body2" fontWeight="bold" gutterBottom>
							Payment Breakdown:
						</Typography>
						<Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', ml: 2 }}>
							<Typography variant="body2" color="primary.main">Services via Membership (Ex. GST):</Typography>
							<Typography variant="body2" fontWeight="500" color="primary.main">
								{formatCurrency(getMembershipPayableAmount())}
							</Typography>
						</Box>
						<Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', ml: 2 }}>
							<Typography variant="body2">Products & Regular Services (Incl. GST):</Typography>
							<Typography variant="body2" fontWeight="500">
								{formatCurrency(getRegularPayableAmount())}
							</Typography>
						</Box>
						<Box sx={{ mb: 2, ml: 2, p: 1, bgcolor: 'info.lighter', borderRadius: 1 }}>
							<Typography variant="caption" color="text.secondary">
								<InfoIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
								Membership payments exclude GST • Products cannot be paid with membership balance
							</Typography>
						</Box>
					</>
				)}
				{/* Total Amount */}
				{Object.values(servicesMembershipPayment).some(Boolean) && activeClientMembership ? (
					<>
						{/* Show full total first */}
						<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
							<Typography variant="h6" fontWeight="bold">Total Amount (All Items):</Typography>
							<Typography variant="h6" fontWeight="bold">
								{formatCurrency(orderItems.reduce((sum, item) => {
									const gstPercentage = item.gst_percentage || (item.type === 'product' ? productGstRate : serviceGstRate) || 18;
									const isGstApplied = item.type === 'product' ? isProductGstApplied : (item.type === 'service' ? isServiceGstApplied : true);
									const gstMultiplier = isGstApplied ? (1 + (gstPercentage / 100)) : 1;
									const itemTotalAmount = (item.price * item.quantity * gstMultiplier);
									const finalAmount = Math.max(0, itemTotalAmount - (item.discount || 0));
									return sum + finalAmount;
								}, 0))}
							</Typography>
						</Box>
						
						{/* Show membership GST discount */}
						{(() => {
							const membershipGSTDiscount = orderItems
								.filter(item => item.type === 'service' && servicesMembershipPayment[item.id])
								.reduce((sum, item) => {
									const gstPercentage = item.gst_percentage || serviceGstRate || 18;
									const itemTotal = item.price * item.quantity;
									const discountIncl = item.discount || 0;
									const discountExcl = discountIncl / (1 + gstPercentage / 100);
									const subtotal = Math.max(0, itemTotal - discountExcl);
									const gstAmount = (subtotal * gstPercentage) / 100;
									return sum + gstAmount;
								}, 0);
							
							return membershipGSTDiscount > 0 ? (
								<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, ml: 2 }}>
									<Typography variant="body2" color="success.main">Less: Membership GST Discount:</Typography>
									<Typography variant="body2" color="success.main" fontWeight="medium">
										-{formatCurrency(membershipGSTDiscount)}
									</Typography>
								</Box>
							) : null;
						})()}
						
						{/* Show membership payment deduction */}
						<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, ml: 2 }}>
							<Typography variant="body2" color="primary.main">Less: Membership Payment:</Typography>
							<Typography variant="body2" color="primary.main" fontWeight="medium">
								-{formatCurrency(getMembershipPayableAmount())}
							</Typography>
						</Box>
						
						{/* Show discount if any */}
						{walkInDiscount > 0 && (
							<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, ml: 2 }}>
								<Typography variant="body2" color="warning.main">Less: Additional Discount:</Typography>
								<Typography variant="body2" color="warning.main" fontWeight="medium">
									-{formatCurrency(walkInDiscount)}
								</Typography>
							</Box>
						)}
						
						{/* Final amount to pay */}
						<Divider sx={{ my: 1 }} />
						<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, bgcolor: 'success.lighter', p: 1, borderRadius: 1 }}>
							<Typography variant="h6" fontWeight="bold">Client to Pay:</Typography>
							<Typography variant="h6" fontWeight="bold" color="success.main">{formatCurrency(calculateTotalAmount())}</Typography>
						</Box>
						
						{/* Membership discount explanation */}
						<Box sx={{ mb: 2, p: 1, bgcolor: 'info.lighter', borderRadius: 1, border: '1px solid', borderColor: 'info.main' }}>
							<Typography variant="caption" color="info.main" sx={{ display: 'flex', alignItems: 'center' }}>
								<InfoIcon fontSize="inherit" sx={{ mr: 0.5 }} />
								Membership Discount Applied: GST is excluded when paying via membership balance. 
								₹{formatCurrency(getMembershipPayableAmount())} will be deducted from membership balance.
							</Typography>
						</Box>
					</>
				) : (
					<>
						{/* Standard display when no membership payments */}
						{walkInDiscount > 0 && (
							<>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
									<Typography variant="body2">Subtotal:</Typography>
									<Typography variant="body2" fontWeight="medium">
										{formatCurrency(totalAmount + walkInDiscount)}
									</Typography>
								</Box>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, ml: 2 }}>
									<Typography variant="body2" color="warning.main">Less: Discount:</Typography>
									<Typography variant="body2" color="warning.main" fontWeight="medium">
										-{formatCurrency(walkInDiscount)}
									</Typography>
								</Box>
								<Divider sx={{ my: 1 }} />
							</>
						)}
						<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
							<Typography variant="h6" fontWeight="bold">Total (Incl. GST):</Typography>
							<Typography variant="h6" fontWeight="bold">{formatCurrency(totalAmount)}</Typography>
						</Box>
					</>
				)}
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
		const newItem: POSOrderItem = {
			id: uuidv4(),
			order_id: '',
			item_id: membership.id,
			item_name: membership.name,
			price: membership.price,
			quantity: 1,
			total: membership.price * 1,
			type: 'membership',
			category: 'membership',
			duration_months: membership.duration_months,
			benefitAmount: 0
		};
		
		setOrderItems(prev => [...prev, newItem]);
		toast.success(`Added ${membership.name} membership to order`);
	}, []);

	// Change renderMembershipSelectionSection to return null to remove the membership cards section
	const renderMembershipSelectionSection = () => {
		// Return null to hide the membership cards section as per user request
		return null;
	};

	// ====================================================
	// 5. LOADING CHECK (AFTER ALL HOOKS)
	// ====================================================
	const isInitialLoading = loadingClients || loadingStylists || loadingAppointments || loadingInventoryProducts || loadingServices || loadingMemberships || isLoadingOrders; // Added isLoadingOrders
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
										onChange={(_, newValue) => {
											handleClientSelect(newValue);
											if (newValue && newValue.full_name) {
												// Explicitly fetch client history when a client is selected
												fetchClientHistory(newValue.full_name);
											}
										}}
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
									{/* Add History button near the client autocomplete */}
									{selectedClient && (
										<Button
											color="primary"
											onClick={() => {
												setHistoryDrawerOpen(true);
												if (selectedClient.full_name) {
													fetchClientHistory(selectedClient.full_name);
												}
											}}
											size="small"
											sx={{ mt: 1 }}
											startIcon={<HistoryIcon />}
										>
											View History
										</Button>
									)}
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
								{/* Stylist Selection - Handle both single and multi-expert modes */}
								{selectedStylists.length > 0 ? (
									// Multi-expert mode: Show multiple stylist dropdowns
									selectedStylists.map((stylist, index) => (
										<Grid item xs={12} sm={selectedClient || !customerName.trim() ? 4 : 6} key={index}>
											<FormControl
												fullWidth
												required
												error={stylist === null}
												size="small"
											>
												<InputLabel id={`stylist-select-label-${index}`}>
													{index === 0 ? 'Primary Expert' : `Expert ${index + 1}`}
												</InputLabel>
												<Select
													labelId={`stylist-select-label-${index}`}
													id={`stylist-select-${index}`}
													value={stylist?.id || ""}
													label={index === 0 ? 'Primary Expert' : `Expert ${index + 1}`}
													onChange={(e) => {
														const stylistId = e.target.value;
														const selectedStylist = stylists?.find(s => s.id === stylistId) || null;
														const newStylists = [...selectedStylists];
														newStylists[index] = selectedStylist;
														setSelectedStylists(newStylists);
														
														// Update the primary stylist if this is the first dropdown
														if (index === 0) {
															setSelectedStylist(selectedStylist);
														}
													}}
												>
													<MenuItem value="">
														<em>None</em>
													</MenuItem>
													{(stylists || [])?.map((stylistOption) => (
														<MenuItem key={stylistOption.id} value={stylistOption.id}>
															{stylistOption.name}
														</MenuItem>
													))}
												</Select>
												{stylist === null && (
													<FormHelperText error>
														Expert is required
													</FormHelperText>
												)}
											</FormControl>
										</Grid>
									))
								) : (
									// Single stylist mode: Show original dropdown
									<Grid item xs={12} sm={selectedClient || !customerName.trim() ? 4 : 12} >
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
								)}
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
										value={productDropdownValue}
										onChange={(_, newProduct) => {
											if (newProduct) {
												if (newProduct.stock_quantity !== undefined && newProduct.stock_quantity <= 0) {
													toast.error(`${newProduct.name} is out of stock`);
												} else {
													handleAddToOrder(newProduct);
												}
											}
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
									<Accordion 
										expanded={clientDetailsExpanded} 
										onChange={(_, isExpanded) => setClientDetailsExpanded(isExpanded)}
										sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}
									>
										<AccordionSummary
											expandIcon={<ExpandMoreIcon />}
											aria-controls="client-details-content"
											id="client-details-header"
											sx={{ 
												bgcolor: 'grey.50', 
												minHeight: 48,
												'&.Mui-expanded': { minHeight: 48 }
											}}
										>
											<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mr: 1 }}>
												<Typography variant="h6">Client Details</Typography>
												<IconButton
													color="primary"
													onClick={(e) => {
														e.stopPropagation();
														setHistoryDrawerOpen(true);
													}}
													size="small"
													title="View Client History"
												>
													<HistoryIcon />
												</IconButton>
											</Box>
										</AccordionSummary>
										<AccordionDetails>
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
												{/* Added Gender, Birth Date, Anniversary Date, Lifetime Visits */}
												<Grid item xs={12} sm={6}>
													<Typography variant="subtitle2">Gender</Typography>
													<Typography>{selectedClient.gender || 'N/A'}</Typography>
												</Grid>
												<Grid item xs={12} sm={6}>
													<Typography variant="subtitle2">Birth Date</Typography>
													<Typography>{selectedClient.birth_date ? format(new Date(selectedClient.birth_date), 'dd/MM/yyyy') : 'N/A'}</Typography>
												</Grid>
												<Grid item xs={12} sm={6}>
													<Typography variant="subtitle2">Anniversary Date</Typography>
													<Typography>{selectedClient.anniversary_date ? format(new Date(selectedClient.anniversary_date), 'dd/MM/yyyy') : 'N/A'}</Typography>
												</Grid>
												<Grid item xs={12} sm={6}>
													<Typography variant="subtitle2">Lifetime Visits</Typography>
													<Typography>
														{selectedClient && orders ? orders.filter(
															order => 
																((order as any).client_name === selectedClient.full_name || (order as any).customer_name === selectedClient.full_name) && 
																(order as any).status !== 'cancelled' && 
																!(order as any).consumption_purpose && 
																(order as any).client_name !== 'Salon Consumption'
														).length : 0}
													</Typography>
												</Grid>
											</Grid>
										</AccordionDetails>
									</Accordion>
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

					{/* Order Summary */}
					<Grid item xs={12}>
						<Paper sx={{ p: 2, mb: 2 }}>
							{renderOrderSummary()}
						</Paper>
					</Grid>

					{/* Payment Details */}
					<Grid item xs={12}>
						<Paper sx={{ p: 2, mb: 2 }}>
							<PaymentSection
								paymentAmounts={paymentAmounts}
								setPaymentAmounts={setPaymentAmounts}
								isSplitPayment={isSplitPayment}
								setIsSplitPayment={setIsSplitPayment}
								walkInPaymentMethod={walkInPaymentMethod}
								setWalkInPaymentMethod={setWalkInPaymentMethod}
								calculateTotalAmount={calculateTotalAmount}
								activeClientMembership={activeClientMembership}
							/>
							
							{/* Discount Section */}
							<Grid container spacing={2} sx={{ mt: 2 }}>
								<Grid item xs={12} sm={6}>
									<TextField
											fullWidth
										label="Fixed Discount"
											variant="outlined"
											type="number"
											size="small"
											value={walkInDiscount}
											onChange={(e) => {
											const fixedDiscount = parseFloat(e.target.value) || 0;
												setWalkInDiscount(fixedDiscount);
												// Calculate and set percentage discount based on total *after* item discounts but *before* global fixed discount
												const subtotalAfterItemDiscounts = orderItems.reduce((sum, item) => sum + (item.price * item.quantity - (item.discount || 0)), 0);
												const totalWithGST = subtotalAfterItemDiscounts + calculateProductGstAmount(calculateProductSubtotal()) + calculateServiceGstAmount(calculateServiceSubtotal()) + calculateMembershipGstAmount(calculateMembershipSubtotal());

												if (totalWithGST > 0) {
													const calculatedPercentageFromFixed = (fixedDiscount / totalWithGST) * 100;
													setWalkInDiscountPercentage(Math.max(0, Math.min(100, parseFloat(calculatedPercentageFromFixed.toFixed(2)))));
												} else {
													setWalkInDiscountPercentage(0);
												}
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
											const validPercentage = isNaN(percentage) ? 0 : Math.max(0, Math.min(100, percentage));
											setWalkInDiscountPercentage(validPercentage);
											// Calculate and set fixed discount based on total *after* item discounts
											const subtotalAfterItemDiscounts = orderItems.reduce((sum, item) => sum + (item.price * item.quantity - (item.discount || 0)), 0);
											const totalWithGST = subtotalAfterItemDiscounts + calculateProductGstAmount(calculateProductSubtotal()) + calculateServiceGstAmount(calculateServiceSubtotal()) + calculateMembershipGstAmount(calculateMembershipSubtotal());
											
											const calculatedFixedDiscountFromPercentage = (totalWithGST * validPercentage) / 100;
											setWalkInDiscount(parseFloat(calculatedFixedDiscountFromPercentage.toFixed(2)));
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
							</Grid>
							
							{/* Complete Order Button */}
							<Button
								variant="contained"
								color="primary"
								fullWidth
								sx={{ mt: 2 }}
								onClick={async () => {
									// Build payments array from paymentAmounts for split payment
									if (isSplitPayment) {
										const payments = Object.entries(paymentAmounts)
											.filter(([_, amt]) => amt > 0)
											.map(([method, amt]) => ({ 
												id: uuidv4(), 
												payment_method: method as PaymentMethodWithSplit, 
												amount: amt 
											}));
										setSplitPayments(payments);
									} else {
										// For single payment, find the active payment method
										const activePaymentMethod = Object.entries(paymentAmounts).find(([_, amt]) => amt > 0)?.[0] as PaymentMethod || 'cash';
										setWalkInPaymentMethod(activePaymentMethod);
									}
									await handleCreateWalkInOrder();
								}}
								disabled={processing || !isOrderValid()}
								startIcon={processing ? <CircularProgress size={20} /> : <CheckIcon />}
							>
								{processing ? 'Processing...' : 'Complete Order'}
							</Button>
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
														<TableCell align="right">Purchase Cost/Unit (Ex.GST)</TableCell>
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
				<Box sx={{ width: 400, p: 2 }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, borderBottom: '1px solid rgba(0,0,0,0.12)', pb: 1 }}>
						<Typography variant="h6" fontWeight="bold">{selectedClient?.full_name}'s Service History</Typography>
						<IconButton onClick={() => setHistoryDrawerOpen(false)} size="small">
							<CloseIcon />
						</IconButton>
					</Box>
					
					{isHistoryLoading ? (
						<Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
					) : clientServiceHistory.length === 0 ? (
						<Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 1 }}>
							<Typography color="text.secondary">No previous services found for this client.</Typography>
						</Box>
					) : (
						<>
							<List sx={{ 
								maxHeight: 'calc(100vh - 120px)', 
								overflowY: 'auto',
								bgcolor: 'background.paper',
								borderRadius: 1,
								border: '1px solid rgba(0,0,0,0.12)'
							}}>
								{clientServiceHistory.map((item: any, index) => (
									<React.Fragment key={item.id || `item-${index}`}>
										<ListItem>
											<ListItemText
												primary={
													<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
														<Typography variant="body1" fontWeight="medium">
															{item.service_name || item.item_name || 'Unknown Item'}
															{item.quantity > 1 && <Typography component="span" variant="body2" sx={{ ml: 0.5 }}>
																(x{item.quantity})
															</Typography>}
														</Typography>
														<Typography fontWeight="medium">₹{item.price}</Typography>
													</Box>
												}
												secondary={
													<>
														<Typography variant="body2">
															{item.pos_orders?.created_at 
																? format(new Date(item.pos_orders.created_at), 'dd/MM/yyyy') 
																: item.appointment_data?.created_at 
																	? format(new Date(item.appointment_data.created_at), 'dd/MM/yyyy')
																	: 'N/A'}
														</Typography>
														<Typography variant="body2" color="textSecondary">
															{item.pos_orders
																? `POS Order - ${item.type === 'product' ? 'Product' : 'Service'}`
																: item.appointment_data
																	? `Appointment with ${item.appointment_data.stylist_name || 'Unknown Stylist'}`
																	: ''}
														</Typography>
													</>
												}
											/>
											<Chip 
												size="small" 
												color={
													(item.pos_orders?.status === 'completed' || item.appointment_data?.status === 'completed') 
														? 'success' 
														: (item.pos_orders?.status === 'cancelled' || item.appointment_data?.status === 'cancelled') 
															? 'error' 
															: 'default'
												}
												label={item.pos_orders?.status || item.appointment_data?.status || 'N/A'}
												sx={{ ml: 1 }}
											/>
										</ListItem>
										<Divider />
									</React.Fragment>
								))}
							</List>
						</>
					)}
				</Box>
			</Drawer>
			
			{/* Print Bill Dialog */}
			<Dialog
				open={printDialogOpen}
				onClose={() => setPrintDialogOpen(false)}
				maxWidth="xs"
				fullWidth
			>
				<DialogTitle>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<Typography variant="h6">Bill Created</Typography>
						<IconButton onClick={() => setPrintDialogOpen(false)} size="small">
							<CloseIcon />
						</IconButton>
					</Box>
				</DialogTitle>
				<DialogContent>
					<Box sx={{ mb: 2 }}>
						<Typography variant="body1" paragraph>
							Your order has been created successfully.
						</Typography>
						<Typography variant="body2">
							Would you like to print the bill?
						</Typography>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button 
						onClick={() => {
							setPrintDialogOpen(false);
							if (lastCreatedOrder) {
								printBill(lastCreatedOrder);
							}
						}}
						variant="contained"
						color="primary"
						startIcon={<ReceiptIcon />}
					>
						Print Bill
					</Button>
					<Button 
						onClick={() => setPrintDialogOpen(false)}
						variant="outlined"
					>
						Skip
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}







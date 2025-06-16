import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Container, Box, Typography, Paper, Tabs, Tab, TextField, Button, Grid, Card, CardContent, CardActions, FormControl, InputLabel, Select, MenuItem, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, CircularProgress, Collapse, Tooltip, FormHelperText } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Close as CloseIcon, RemoveShoppingCart, ShoppingBag, Check as CheckIcon, Refresh as RefreshIcon, AttachMoney, CreditCard, LocalAtm, AccountBalance, Receipt as ReceiptIcon, Inventory, Search, Info as InfoIcon, CheckCircle, Warning } from '@mui/icons-material';
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
	membership_eligible?: boolean; // Add membership eligibility flag
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

		// Check if the item already exists in the order
		const existingItemIndex = orderItems.findIndex(item => item.item_id === service.id);
		
		if (existingItemIndex >= 0) {
			// Item already exists, increase quantity
			const updatedItems = [...orderItems];
			const existingItem = updatedItems[existingItemIndex];
			const newQuantity = existingItem.quantity + quantity;
			const itemPrice = customPrice !== undefined ? customPrice : existingItem.price; // Keep existing price unless custom price is provided
			
			updatedItems[existingItemIndex] = {
				...existingItem,
				quantity: newQuantity,
				price: itemPrice,
				total: itemPrice * newQuantity
			};
			
			setOrderItems(updatedItems);
			toast.success(`Increased ${service.name} quantity to ${newQuantity}`);
		} else {
			// Item doesn't exist, create new item
			// Determine the type - ensure it is always either 'product' or 'service', never undefined
			const itemType = service.type === 'service' ? 'service' : 'product';
			
			// Assign currently selected stylists to service items
			let expertsArray: any[] = [];
			if (itemType === 'service') {
				if (selectedStylists.length > 0) {
					// Multi-stylist mode: use all selected stylists
					expertsArray = selectedStylists
						.filter(stylist => stylist !== null)
						.map(stylist => ({
							id: stylist!.id,
							name: stylist!.name
						}));
				} else if (selectedStylist) {
					// Single stylist mode: use the main selected stylist
					expertsArray = [{
						id: selectedStylist.id,
						name: selectedStylist.name
					}];
				}
			}
			
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
				discount_percentage: 0, // Initialize discount_percentage to 0
				// Add experts array for service items
				...(itemType === 'service' && expertsArray.length > 0 && { experts: expertsArray })
			};

			console.log(`🛒 Created order item:`, newItem);

			setOrderItems((prev) => {
				const newState = [...prev, newItem];
				return newState;
			});

			toast.success(`Added ${service.name} to order`);
		}
	}, [orderItems, toast, selectedStylists, selectedStylist]); // Keep dependencies for handleAddToOrder itself

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

	// Automatic split payment logic: enable split payment when services use membership AND there are products
	useEffect(() => {
		const membershipPayableAmount = getMembershipPayableAmount();
		const regularPayableAmount = getRegularPayableAmount();
		const hasProductsOrMemberships = orderItems.some(item => item.type === 'product' || item.type === 'membership');
		const hasServicesPaidViaMembership = Object.values(servicesMembershipPayment).some(Boolean);
		
		// Auto-enable split payment if:
		// 1. There are services being paid via membership (membershipPayableAmount > 0)
		// 2. There are products or other items that need regular payment (regularPayableAmount > 0)
		// 3. Both conditions are true simultaneously
		const shouldAutoEnableSplit = membershipPayableAmount > 0 && regularPayableAmount > 0 && hasServicesPaidViaMembership && hasProductsOrMemberships;
		
		if (shouldAutoEnableSplit && !isSplitPayment) {
			console.log('[Auto Split Payment] Enabling split payment: membership services + regular items detected');
			setIsSplitPayment(true);
			
			// Set up payment amounts
			const maxMembershipPayment = activeClientMembership ? Math.min(membershipPayableAmount, activeClientMembership.currentBalance) : 0;
			
			setPaymentAmounts(prev => ({
				...prev,
				membership: maxMembershipPayment,
				cash: regularPayableAmount // Default remaining to cash
			}));
		}
	}, [getMembershipPayableAmount, getRegularPayableAmount, servicesMembershipPayment, orderItems, isSplitPayment, activeClientMembership]);

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
          category: service.category || (serviceDetails as any)?.category || 'service',
          hsn_code: service.hsn_code || (serviceDetails as any)?.hsn_code,
          gst_percentage: service.gst_percentage || (serviceDetails as any)?.gst_percentage || 18,
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

    // Process each service in the collection to build order items first
    let newOrderItems: POSOrderItem[] = [];
    if (appointmentNavData.services && Array.isArray(appointmentNavData.services) && appointmentNavData.services.length > 0) {
      console.log('[POS useEffect] Found service collection with', appointmentNavData.services.length, 'services');
      
      // Process each service in the collection
      newOrderItems = appointmentNavData.services.map((service: any) => {
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
          category: service.category || (serviceDetails as any)?.category || 'service',
          hsn_code: (service as any).hsn_code || (serviceDetails as any)?.hsn_code,
          gst_percentage: (service as any).gst_percentage || (serviceDetails as any)?.gst_percentage || 18,
          for_salon_use: false,
          discount: 0,
          discount_percentage: 0,
          // Preserve experts information for multi-expert appointments
          experts: (service as any).experts || []
        };
        
        return orderItem;
      }).filter(Boolean) as POSOrderItem[];
    }

    // STEP 2: Reconstruct the expert list from service data
    console.log('[POS useEffect] Reconstructing expert list from service data...');
    const expertsInServices = Array.from(
      new Map(
        newOrderItems
          .flatMap(item => item.experts || [])
          .filter(expert => expert.id) // Only include experts with valid IDs
          .map(ex => [ex.id, ex])  // de-dupe on id
      ).values()
    );

    console.log('[POS useEffect] Experts found in services:', expertsInServices);

    // Set the experts based on service data (not appointmentNavData.allExperts)
    if (expertsInServices.length > 1) {
      console.log('[POS useEffect] Setting multiple stylists from service expert data:', expertsInServices);
      const multipleStylists = expertsInServices.map((expert: any) => {
        const stylistMatch = stylists?.find(s => s.id === expert.id);
        if (!stylistMatch) {
          console.warn('[POS useEffect] Stylist not found for expert ID:', expert.id);
        }
        return stylistMatch || null;
      });
      setSelectedStylists(multipleStylists);
      // Set primary expert as the first one
      setSelectedStylist(multipleStylists[0] || null);
    } else if (expertsInServices.length === 1) {
      // Single expert from services
      const expert = expertsInServices[0];
      const stylistMatch = stylists?.find(s => s.id === expert.id);
      if (stylistMatch) {
        console.log('[POS useEffect] Setting single stylist from service data:', stylistMatch.name);
        setSelectedStylist(stylistMatch);
      }
      setSelectedStylists([]);
    } else {
      // Fallback to original stylist if no experts in services
      console.log('[POS useEffect] No experts in services, using fallback stylist');
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
      
      // Add all valid order items at once (already processed above)
      if (newOrderItems.length > 0) {
        console.log('[POS useEffect] Adding order items:', newOrderItems);
        setOrderItems(newOrderItems);
        toast.success(`Added ${newOrderItems.length} services to order`);
      } else {
        console.warn('[POS useEffect] No valid services to add to order');
        toast.error('No valid services found in appointment data');
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

	return (
		<ErrorBoundary>
			<Container maxWidth={false} disableGutters sx={{ height: '100vh', overflow: 'hidden' }}>
				<Box sx={{ 
					height: '100%', 
					display: 'flex', 
					flexDirection: 'column',
					bgcolor: 'background.default'
				}}>
					{/* Header */}
					<Paper 
						elevation={1} 
						sx={{ 
							borderRadius: 0, 
							borderBottom: 1, 
							borderColor: 'divider',
							position: 'sticky',
							top: 0,
							zIndex: 1000
						}}
					>
						<Box sx={{ p: 2, pb: 0 }}>
							<Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
								Point of Sale
							</Typography>
							<Tabs 
								value={tabValue} 
								onChange={(e, newValue) => setTabValue(newValue)}
								sx={{ 
									'& .MuiTab-root': { 
										textTransform: 'none',
										fontSize: '1rem',
										fontWeight: 500
									}
								}}
							>
								<Tab 
									label="Walk-in Order" 
									icon={<ShoppingBag />} 
									iconPosition="start"
								/>
								<Tab 
									label="Salon Purchase" 
									icon={<Inventory />} 
									iconPosition="start"
								/>
							</Tabs>
						</Box>
					</Paper>

					{/* Tab Content */}
					<Box sx={{ 
						flexGrow: 1, 
						overflow: 'hidden',
						display: 'flex',
						flexDirection: 'column'
					}}>
						{/* Walk-in Order Tab */}
						<TabPanel value={tabValue} index={0}>
							<Grid container spacing={2} sx={{ height: '100%' }}>
								{/* Left Panel - Customer & Services */}
								<Grid item xs={12} md={8} sx={{ 
									height: '100%',
									display: 'flex',
									flexDirection: 'column'
								}}>
									<Box sx={{ 
										flexGrow: 1, 
										overflow: 'auto',
										pr: 1
									}}>
										{/* Customer Selection */}
										<Paper sx={{ p: 2, mb: 2 }}>
											<Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
												<PersonIcon />
												Customer Information
											</Typography>
											
											<Grid container spacing={2}>
												<Grid item xs={12} md={6}>
													<Autocomplete
														options={clients || []}
														getOptionLabel={(option) => option.full_name || ''}
														value={selectedClient}
														onChange={(e, newValue) => handleClientSelect(newValue)}
														loading={loadingClients}
														renderInput={(params) => (
															<TextField
																{...params}
																label="Search Client"
																fullWidth
																InputProps={{
																	...params.InputProps,
																	endAdornment: (
																		<>
																			{loadingClients ? <CircularProgress color="inherit" size={20} /> : null}
																			{params.InputProps.endAdornment}
																		</>
																	),
																}}
															/>
														)}
													/>
												</Grid>
												<Grid item xs={12} md={6}>
													<TextField
														label="Customer Name"
														value={customerName}
														onChange={(e) => setCustomerName(e.target.value)}
														fullWidth
														required
													/>
												</Grid>
												{!selectedClient && customerName && (
													<>
														<Grid item xs={12} md={6}>
															<TextField
																label="Phone Number"
																value={newClientPhone}
																onChange={(e) => setNewClientPhone(e.target.value)}
																fullWidth
																placeholder="Enter phone number"
															/>
														</Grid>
														<Grid item xs={12} md={6}>
															<TextField
																label="Email"
																value={newClientEmail}
																onChange={(e) => setNewClientEmail(e.target.value)}
																fullWidth
																placeholder="Enter email address"
															/>
														</Grid>
													</>
												)}
											</Grid>

											{/* Stylist Selection */}
											<Box sx={{ mt: 2 }}>
												<FormControl fullWidth>
													<InputLabel>Select Stylist</InputLabel>
													<Select
														value={selectedStylist?.id || ''}
														onChange={(e) => {
															const stylist = stylists?.find(s => s.id === e.target.value);
															setSelectedStylist(stylist || null);
														}}
														label="Select Stylist"
													>
														{stylists?.map((stylist) => (
															<MenuItem key={stylist.id} value={stylist.id}>
																{stylist.name}
															</MenuItem>
														))}
													</Select>
												</FormControl>
											</Box>
										</Paper>

										{/* Services & Products */}
										<Paper sx={{ p: 2, mb: 2 }}>
											<Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
												<ContentCutIcon />
												Services & Products
											</Typography>

											{/* Services Section */}
											<Accordion defaultExpanded>
												<AccordionSummary expandIcon={<ExpandMoreIcon />}>
													<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
														Services
													</Typography>
												</AccordionSummary>
												<AccordionDetails>
													<Box sx={{ mb: 2 }}>
														<TextField
															label="Search Services"
															value={serviceSearchTerm}
															onChange={(e) => setServiceSearchTerm(e.target.value)}
															fullWidth
															size="small"
															InputProps={{
																startAdornment: (
																	<InputAdornment position="start">
																		<Search />
																	</InputAdornment>
																)
															}}
														/>
													</Box>
													<Grid container spacing={2}>
														{filteredServices?.map((service) => (
															<Grid item xs={12} sm={6} md={4} key={service.id}>
																<Card sx={{ 
																	height: '100%',
																	display: 'flex',
																	flexDirection: 'column',
																	cursor: 'pointer',
																	'&:hover': {
																		boxShadow: 3
																	}
																}}>
																	<CardContent sx={{ flexGrow: 1 }}>
																		<Typography variant="h6" sx={{ fontWeight: 600 }}>
																			{service.name}
																		</Typography>
																		<Typography color="text.secondary" sx={{ mb: 1 }}>
																			₹{service.price}
																		</Typography>
																		<Typography variant="body2" color="text.secondary">
																			{service.description}
																		</Typography>
																	</CardContent>
																	<CardActions>
																		<Button
																			variant="contained"
																			size="small"
																			onClick={() => handleAddToOrder(service as POSService)}
																			fullWidth
																		>
																			Add
																		</Button>
																	</CardActions>
																</Card>
															</Grid>
														))}
													</Grid>
												</AccordionDetails>
											</Accordion>

											{/* Products Section */}
											<Accordion>
												<AccordionSummary expandIcon={<ExpandMoreIcon />}>
													<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
														Products
													</Typography>
												</AccordionSummary>
												<AccordionDetails>
													<Box sx={{ mb: 2 }}>
														<TextField
															label="Search Products"
															value={productSearchTerm}
															onChange={(e) => setProductSearchTerm(e.target.value)}
															fullWidth
															size="small"
															InputProps={{
																startAdornment: (
																	<InputAdornment position="start">
																		<Search />
																	</InputAdornment>
																)
															}}
														/>
													</Box>
													<Grid container spacing={2}>
														{filteredProducts?.map((product) => (
															<Grid item xs={12} sm={6} md={4} key={product.id}>
																{renderProductCard(product, handleAddToOrder)}
															</Grid>
														))}
													</Grid>
												</AccordionDetails>
											</Accordion>
										</Paper>
									</Box>
								</Grid>

								{/* Right Panel - Order Summary & Payment */}
								<Grid item xs={12} md={4} sx={{ 
									height: '100%',
									display: 'flex',
									flexDirection: 'column'
								}}>
									<Box sx={{ 
										flexGrow: 1, 
										overflow: 'auto',
										pl: 1
									}}>
										{/* Order Summary */}
										<Paper sx={{ p: 2, mb: 2 }}>
											<Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
												<CartIcon />
												Order Summary
											</Typography>

											{orderItems.length === 0 ? (
												<Box sx={{ 
													textAlign: 'center', 
													py: 4,
													color: 'text.secondary'
												}}>
													<ShoppingBasketIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
													<Typography>No items in order</Typography>
												</Box>
											) : (
												<>
													<List dense>
														{orderItems.map((item, index) => (
															<React.Fragment key={item.id}>
																<ListItem sx={{ px: 0 }}>
																	<ListItemText
																		primary={item.item_name}
																		secondary={`₹${item.price} × ${item.quantity}`}
																	/>
																	<ListItemSecondaryAction>
																		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
																			<Typography variant="body2" sx={{ fontWeight: 600 }}>
																				₹{item.total}
																			</Typography>
																			<IconButton
																				size="small"
																				onClick={() => {
																					setOrderItems(prev => prev.filter((_, i) => i !== index));
																				}}
																			>
																				<DeleteIcon fontSize="small" />
																			</IconButton>
																		</Box>
																	</ListItemSecondaryAction>
																</ListItem>
																{index < orderItems.length - 1 && <Divider />}
															</React.Fragment>
														))}
													</List>

													<Divider sx={{ my: 2 }} />

													{/* Order Totals */}
													<Box sx={{ mb: 2 }}>
														<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
															<Typography>Subtotal:</Typography>
															<Typography>₹{(calculateProductSubtotal() + calculateServiceSubtotal()).toFixed(2)}</Typography>
														</Box>
														<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
															<Typography>GST:</Typography>
															<Typography>₹{(calculateProductGstAmount(calculateProductSubtotal()) + calculateServiceGstAmount(calculateServiceSubtotal())).toFixed(2)}</Typography>
														</Box>
														{walkInDiscount > 0 && (
															<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
																<Typography color="success.main">Discount:</Typography>
																<Typography color="success.main">-₹{walkInDiscount.toFixed(2)}</Typography>
															</Box>
														)}
														<Divider sx={{ my: 1 }} />
														<Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
															<Typography variant="h6">Total:</Typography>
															<Typography variant="h6">₹{calculateTotalAmount().toFixed(2)}</Typography>
														</Box>
													</Box>
												</>
											)}
										</Paper>

										{/* Payment Section */}
										{orderItems.length > 0 && (
											<>
												{/* Discount Section */}
												<Paper sx={{ p: 2, mb: 2 }}>
													<Typography variant="h6" sx={{ mb: 2 }}>
														Discount
													</Typography>
													<TextField
														label="Discount Amount"
														type="number"
														value={walkInDiscount}
														onChange={(e) => setWalkInDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
														fullWidth
														InputProps={{
															startAdornment: <InputAdornment position="start">₹</InputAdornment>
														}}
														helperText="Enter discount amount to be applied to the total"
													/>
												</Paper>

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
											</>
										)}

										{/* Action Buttons */}
										<Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
											<Button
												variant="outlined"
												fullWidth
												onClick={() => {
													setOrderItems([]);
													setCustomerName('');
													setSelectedClient(null);
													setSelectedStylist(null);
													setWalkInDiscount(0);
													setPaymentAmounts({
														cash: 0,
														credit_card: 0,
														debit_card: 0,
														upi: 0,
														bnpl: 0,
														membership: 0
													});
												}}
												disabled={orderItems.length === 0}
											>
												Clear
											</Button>
											<Button
												variant="contained"
												fullWidth
												onClick={async () => {
													// Handle order creation
													console.log('Creating order...');
												}}
												disabled={!isOrderValid() || processing}
											>
												{processing ? (
													<CircularProgress size={20} color="inherit" />
												) : (
													'Process Order'
												)}
											</Button>
										</Box>
									</Box>
								</Grid>
							</Grid>
						</TabPanel>

						{/* Salon Purchase Tab */}
						<TabPanel value={tabValue} index={1}>
							<Grid container spacing={2} sx={{ height: '100%' }}>
								{/* Left Panel - Product Selection */}
								<Grid item xs={12} md={8} sx={{ 
									height: '100%',
									display: 'flex',
									flexDirection: 'column'
								}}>
									<Box sx={{ 
										flexGrow: 1, 
										overflow: 'auto',
										pr: 1
									}}>
										<Paper sx={{ p: 2, mb: 2 }}>
											<Typography variant="h6" sx={{ mb: 2 }}>
												Salon Consumption - Product Selection
											</Typography>
											
											<Box sx={{ mb: 2 }}>
												<TextField
													label="Search Products"
													value={productSearchTerm}
													onChange={(e) => setProductSearchTerm(e.target.value)}
													fullWidth
													size="small"
													InputProps={{
														startAdornment: (
															<InputAdornment position="start">
																<Search />
															</InputAdornment>
														)
													}}
												/>
											</Box>

											<Grid container spacing={2}>
												{filteredProducts?.map((product) => (
													<Grid item xs={12} sm={6} md={4} key={product.id}>
														{renderProductCard(product, (prod) => {
															// Add to salon products instead of order items
															const newItem: OrderItem = {
																id: uuidv4(),
																order_id: '',
																item_id: prod.id,
																item_name: prod.name,
																quantity: 1,
																price: getPurchaseCostForProduct(prod.id, prod.name, prod.price),
																total: getPurchaseCostForProduct(prod.id, prod.name, prod.price),
																type: 'product',
																hsn_code: prod.hsn_code,
																gst_percentage: prod.gst_percentage,
																for_salon_use: true,
																discount: 0,
																discount_percentage: 0
															};
															setSalonProducts(prev => [...prev, newItem]);
															toast.success(`Added ${prod.name} to salon consumption`);
														})}
													</Grid>
												))}
											</Grid>
										</Paper>
									</Box>
								</Grid>

								{/* Right Panel - Consumption Summary */}
								<Grid item xs={12} md={4} sx={{ 
									height: '100%',
									display: 'flex',
									flexDirection: 'column'
								}}>
									<Box sx={{ 
										flexGrow: 1, 
										overflow: 'auto',
										pl: 1
									}}>
										<Paper sx={{ p: 2, mb: 2 }}>
											<Typography variant="h6" sx={{ mb: 2 }}>
												Consumption Summary
											</Typography>

											{salonProducts.length === 0 ? (
												<Box sx={{ 
													textAlign: 'center', 
													py: 4,
													color: 'text.secondary'
												}}>
													<Inventory sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
													<Typography>No products selected</Typography>
												</Box>
											) : (
												<>
													<List dense>
														{salonProducts.map((item, index) => (
															<React.Fragment key={item.id}>
																<ListItem sx={{ px: 0 }}>
																	<ListItemText
																		primary={item.item_name}
																		secondary={`₹${item.price} × ${item.quantity}`}
																	/>
																	<ListItemSecondaryAction>
																		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
																			<Typography variant="body2" sx={{ fontWeight: 600 }}>
																				₹{item.total}
																			</Typography>
																			<IconButton
																				size="small"
																				onClick={() => {
																					setSalonProducts(prev => prev.filter((_, i) => i !== index));
																				}}
																			>
																				<DeleteIcon fontSize="small" />
																			</IconButton>
																		</Box>
																	</ListItemSecondaryAction>
																</ListItem>
																{index < salonProducts.length - 1 && <Divider />}
															</React.Fragment>
														))}
													</List>

													<Divider sx={{ my: 2 }} />

													<Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
														<Typography variant="h6">Total:</Typography>
														<Typography variant="h6">₹{salonProductsSubtotal.toFixed(2)}</Typography>
													</Box>
												</>
											)}
										</Paper>

										{/* Consumption Details */}
										{salonProducts.length > 0 && (
											<Paper sx={{ p: 2, mb: 2 }}>
												<Typography variant="h6" sx={{ mb: 2 }}>
													Consumption Details
												</Typography>
												
												<TextField
													label="Purpose"
													value={consumptionPurpose}
													onChange={(e) => setConsumptionPurpose(e.target.value)}
													fullWidth
													multiline
													rows={2}
													sx={{ mb: 2 }}
													placeholder="e.g., Client service, salon maintenance, staff training"
												/>
												
												<TextField
													label="Notes"
													value={consumptionNotes}
													onChange={(e) => setConsumptionNotes(e.target.value)}
													fullWidth
													multiline
													rows={2}
													placeholder="Additional notes or details"
												/>
											</Paper>
										)}

										{/* Action Buttons */}
										<Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
											<Button
												variant="outlined"
												fullWidth
												onClick={() => {
													setSalonProducts([]);
													setConsumptionPurpose('');
													setConsumptionNotes('');
												}}
												disabled={salonProducts.length === 0}
											>
												Clear
											</Button>
											<Button
												variant="contained"
												fullWidth
												onClick={async () => {
													// Handle salon consumption
													console.log('Recording salon consumption...');
												}}
												disabled={salonProducts.length === 0 || !consumptionPurpose.trim() || processing}
											>
												{processing ? (
													<CircularProgress size={20} color="inherit" />
												) : (
													'Record Consumption'
												)}
											</Button>
										</Box>
									</Box>
								</Grid>
							</Grid>
						</TabPanel>
					</Box>
				</Box>

				{/* Snackbar for notifications */}
				<Snackbar
					open={snackbarOpen}
					autoHideDuration={4000}
					onClose={() => setSnackbarOpen(false)}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				>
					<Alert severity="success" onClose={() => setSnackbarOpen(false)}>
						{snackbarMessage}
					</Alert>
				</Snackbar>

				{/* Print Dialog */}
				<Dialog
					open={printDialogOpen}
					onClose={() => setPrintDialogOpen(false)}
					maxWidth="sm"
					fullWidth
				>
					<DialogTitle>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<ReceiptIcon />
							Print Receipt
						</Box>
					</DialogTitle>
					<DialogContent>
						<Typography variant="body1" sx={{ mb: 2 }}>
							Order created successfully! Would you like to print the receipt?
						</Typography>
						{lastCreatedOrder && (
							<Box sx={{ 
								bgcolor: 'grey.50', 
								p: 2, 
								borderRadius: 1,
								border: 1,
								borderColor: 'grey.200'
							}}>
								<Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
									Order Details:
								</Typography>
								<Typography variant="body2">
									Order ID: {lastCreatedOrder.id?.slice(-8) || 'N/A'}
								</Typography>
								<Typography variant="body2">
									Customer: {lastCreatedOrder.client_name || lastCreatedOrder.customer_name}
								</Typography>
								<Typography variant="body2">
									Total: ₹{lastCreatedOrder.total?.toFixed(2) || '0.00'}
								</Typography>
								<Typography variant="body2">
									Date: {lastCreatedOrder.created_at ? format(new Date(lastCreatedOrder.created_at), 'dd/MM/yyyy HH:mm') : 'N/A'}
								</Typography>
							</Box>
						)}
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setPrintDialogOpen(false)}>
							Skip
						</Button>
						<Button 
							variant="contained" 
							onClick={() => {
								if (lastCreatedOrder) {
									printBill(lastCreatedOrder);
								}
								setPrintDialogOpen(false);
							}}
							startIcon={<ReceiptIcon />}
						>
							Print Receipt
						</Button>
					</DialogActions>
				</Dialog>

				{/* History Drawer */}
				<Drawer
					anchor="right"
					open={historyDrawerOpen}
					onClose={() => setHistoryDrawerOpen(false)}
					sx={{
						'& .MuiDrawer-paper': {
							width: 400,
							p: 2
						}
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
						<HistoryIcon />
						<Typography variant="h6">Service History</Typography>
						<IconButton
							onClick={() => setHistoryDrawerOpen(false)}
							sx={{ ml: 'auto' }}
						>
							<CloseIcon />
						</IconButton>
					</Box>
					
					{isHistoryLoading ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
							<CircularProgress />
						</Box>
					) : clientServiceHistory.length === 0 ? (
						<Box sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
							<HistoryIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
							<Typography>No service history found</Typography>
						</Box>
					) : (
						<List>
							{clientServiceHistory.map((item) => (
								<ListItem key={item.id} sx={{ px: 0 }}>
									<ListItemText
										primary={item.service_name || item.item_name}
										secondary={
											<>
												<Typography component="span" variant="body2">
													₹{item.price} × {item.quantity}
												</Typography>
												<br />
												<Typography component="span" variant="caption" color="text.secondary">
													{item.pos_orders ? 
														format(new Date(item.pos_orders.created_at), 'dd/MM/yyyy') :
														item.appointment_data ?
														format(new Date(item.appointment_data.created_at), 'dd/MM/yyyy') :
														'Unknown date'
													}
												</Typography>
											</>
										}
									/>
									<Box sx={{ textAlign: 'right' }}>
										<Typography variant="body2" sx={{ fontWeight: 600 }}>
											₹{(item.price * item.quantity).toFixed(2)}
										</Typography>
										<Chip 
											label={item.type || 'service'} 
											size="small" 
											variant="outlined"
											sx={{ mt: 0.5 }}
										/>
									</Box>
								</ListItem>
							))}
						</List>
					)}
				</Drawer>
			</Container>
		</ErrorBoundary>
	);
}

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Container, Box, Typography, Paper, Tabs, Tab, TextField, Button, Grid, Card, CardContent, CardActions, FormControl, InputLabel, Select, MenuItem, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, CircularProgress, Collapse, Tooltip, FormHelperText } from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, RemoveShoppingCart, ShoppingBag, Check as CheckIcon, Refresh as RefreshIcon, AttachMoney, CreditCard, LocalAtm, AccountBalance, Receipt, Inventory, Search, Info as InfoIcon } from '@mui/icons-material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
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
import { useOrders } from '../hooks/useOrders'; // Import useOrders
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
// Import the localStorage hook
import { useLocalStorage } from '../utils/useLocalStorage';

// Active membership details for payment by balance
interface ActiveMembershipDetails {
  id: string;
  tierId: string;
  tierName: string;
  currentBalance: number;
  isActive: boolean;
  purchaseDate: string;
  expiresAt?: string | null;
  durationMonths?: number;
}

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
  salonConsumptionDate: string; // Add this line
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
	// Add state for salon consumption date
	const [salonConsumptionDate, setSalonConsumptionDate] = useState<Date | null>(new Date());
	// Add state for client membership tier
	const [clientMembershipTier, setClientMembershipTier] = useState<string | null>(null);
	// Add state to toggle paying via membership
	const [useMembershipPayment, setUseMembershipPayment] = useState(false);
	// Active membership fetched for selected client
	const [activeClientMembership, setActiveClientMembership] = useState<ActiveMembershipDetails | null>(null);

	// When membership payment toggled, apply 100% discount
	useEffect(() => {
		if (useMembershipPayment) {
			// Reset direct discount
			setWalkInDiscount(0);
			// Apply full percentage discount
			setWalkInDiscountPercentage(100);
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
		
		const newItem: OrderItem = {
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
				// Calculate item subtotal with individual discount
				const itemTotal = item.price * item.quantity;
				const itemDiscount = item.discount || 0;
				return sum + (itemTotal - itemDiscount);
			}, 0);
	}, [orderItems]);

	const calculateServiceSubtotal = useCallback(() => {
		return orderItems
			.filter(item => item.type === 'service')
			.reduce((sum, item) => {
				// Calculate item subtotal with individual discount
				const itemTotal = item.price * item.quantity;
				const itemDiscount = item.discount || 0;
				return sum + (itemTotal - itemDiscount);
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

	const calculateTotalDiscount = useCallback(() => {
		// Sum all individual discounts
		const individualDiscounts = orderItems.reduce((sum, item) => sum + (item.discount || 0), 0);
		
		// Add global discount
		const globalDiscount = walkInDiscount;
		
		// Add percentage discount (apply it to the already discounted subtotal)
		const subtotalAfterIndividualDiscounts = calculateProductSubtotal() + calculateServiceSubtotal();
		const subtotalWithGST = subtotalAfterIndividualDiscounts + 
			calculateProductGstAmount(calculateProductSubtotal()) + 
			calculateServiceGstAmount(calculateServiceSubtotal());
		const percentageDiscountAmount = (subtotalWithGST * walkInDiscountPercentage) / 100;
		
		console.log('Discount calculation:', { 
			individualDiscounts, 
			globalDiscount, 
			percentageDiscountAmount, 
			total: individualDiscounts + globalDiscount + percentageDiscountAmount 
		});
		
		return individualDiscounts + globalDiscount + percentageDiscountAmount;
	}, [orderItems, walkInDiscount, walkInDiscountPercentage, calculateProductSubtotal, calculateServiceSubtotal, calculateProductGstAmount, calculateServiceGstAmount]);

	const calculateTotalAmount = useCallback(() => {
		const prodSubtotal = calculateProductSubtotal();
		const servSubtotal = calculateServiceSubtotal();
		const prodGst = calculateProductGstAmount(prodSubtotal);
		const servGst = calculateServiceGstAmount(servSubtotal);
		const combinedSubtotal = prodSubtotal + servSubtotal + prodGst + servGst;
		
		// Use the separate discount calculation
		const totalDiscount = calculateTotalDiscount();
		
		return Math.max(0, combinedSubtotal - totalDiscount); // Ensure total is not negative
	}, [calculateProductSubtotal, calculateServiceSubtotal, calculateProductGstAmount, calculateServiceGstAmount, calculateTotalDiscount]);

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
		bnpl: 0,
		membership: 0
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
			const sumOthers = (paymentAmounts.credit_card || 0) + (paymentAmounts.debit_card || 0) + (paymentAmounts.upi || 0) + (paymentAmounts.bnpl || 0) + (paymentAmounts.membership || 0);
			const newCash = Math.max(0, total - sumOthers);
			if (paymentAmounts.cash !== newCash) {
				setPaymentAmounts(prev => ({ ...prev, cash: newCash }));
			}
		}
	}, [paymentAmounts.credit_card, paymentAmounts.debit_card, paymentAmounts.upi, paymentAmounts.bnpl, paymentAmounts.membership, total, isSplitPayment]);

	// Filtered products and services based on search terms
	const filteredProducts = useMemo(() => {
		if (!productSearchTerm.trim()) {
			// Only show products with stock and active status
			return allProducts.filter(product => 
				(product.stock_quantity === undefined || // Keep undefined stock for backward compatibility
				product.stock_quantity === null || 
				product.stock_quantity > 0) &&
				product.active !== false // Only show products that are active or where active is undefined
			);
		}
		return allProducts.filter(product => 
			(product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
			(product.description && product.description.toLowerCase().includes(productSearchTerm.toLowerCase()))) &&
			(product.stock_quantity === undefined || // Keep undefined stock for backward compatibility
			product.stock_quantity === null || 
			product.stock_quantity > 0) &&
			product.active !== false // Only show products that are active or where active is undefined
		);
	}, [allProducts, productSearchTerm]);

	const filteredServices = useMemo(() => {
		// First filter by active status, then by search term
		const activeServices = (services || []).filter(service => 
			service.active !== false // Show services that are active or where active is undefined
		);
		
		if (!serviceSearchTerm.trim()) return activeServices;
		
		return activeServices.filter(service => 
			service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
			(service.description && service.description.toLowerCase().includes(serviceSearchTerm.toLowerCase()))
		);
	}, [services, serviceSearchTerm]);

	// Derive service history for the selected client
	const serviceHistory = useMemo(() => {
		if (!orders || !selectedClient) return [];
		
		return orders.filter(order => {
			// Cast to any to access client_name and services
			const orderAny = order as any;
			return (orderAny.client_name === selectedClient.full_name || 
			       orderAny.customer_name === selectedClient.full_name) && 
			       Array.isArray(orderAny.services);
		});
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
					stock_quantity: product.stock_quantity || 0,
					active: product.active
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
			const subtotal = calculateProductSubtotal() + calculateServiceSubtotal();
			const tax = calculateProductGstAmount(calculateProductSubtotal()) + calculateServiceGstAmount(calculateServiceSubtotal());
			// Always use the full amount regardless of payment method
			const totalAmount = subtotal + tax - walkInDiscount;
			
			// Create the order with the actual total amount, regardless of payment method
			const orderResult = await createWalkInOrderMutation.mutateAsync({
				order_id: uuidv4(),
				client_id: clientIdToUse || '', 
				client_name: clientNameToUse,    
				stylist_id: staffInfo?.id || '',
				stylist_name: staffInfo?.name || '',
				items: [],
				// Make sure to include individual item discounts in the services array
				services: ([...formattedProducts, ...formattedServices].map(item => ({
					...item,
					// Ensure discount and discount_percentage are included
					discount: item.discount || 0,
					discount_percentage: item.discount_percentage || 0
				})) as any[]),
				
				// Include breakdown of different discount types in the order
				payment_method: isSplitPayment ? 'split' : (useMembershipPayment ? 'membership' : walkInPaymentMethod),
				split_payments: isSplitPayment ? splitPayments : undefined,
				
				discount: walkInDiscount,
				discount_percentage: walkInDiscountPercentage,
				
				subtotal: subtotal,
				tax: tax,
				total: totalAmount, // Always show the actual order amount
				total_amount: totalAmount, // Always show the actual order amount
				status: 'completed',
				order_date: salonConsumptionDate ? salonConsumptionDate.toISOString() : new Date().toISOString(),
				is_walk_in: true,
				is_salon_consumption: false,
				pending_amount: isSplitPayment ? Math.max(0, calculateTotalAmount() - getAmountPaid()) : 0,
				payments: isSplitPayment ? splitPayments : [{
					id: uuidv4(),
					amount: totalAmount, // Always store the full order amount
					payment_method: useMembershipPayment ? 'membership' : walkInPaymentMethod,
					payment_date: salonConsumptionDate ? salonConsumptionDate.toISOString() : new Date().toISOString()
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
			
			// Process membership payment and update balance
			if (useMembershipPayment && activeClientMembership) {
				const newBalance = activeClientMembership.currentBalance - paymentAmounts.membership;
				const { error } = await supabase
					.from('members')
					.update({ current_balance: newBalance })
					.eq('id', activeClientMembership.id);
				if (error) {
					toast.error('Failed to update membership balance');
				} else {
					setActiveClientMembership({ ...activeClientMembership, currentBalance: newBalance });
				}
			}

			// Initialize balance for new memberships
			const membershipItems = orderItems.filter(i => i.category === 'membership');
			for (const item of membershipItems) {
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
							current_balance: item.price,
							total_membership_amount: item.price,
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
							current_balance: item.price,
							total_membership_amount: item.price
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
		setNewPaymentAmount(0); // Keep for any remaining logic
		setNewPaymentMethod("cash"); // Keep for any remaining logic
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
		// Reset salon consumption date
		setSalonConsumptionDate(new Date());

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
			const consumptionDateToUse = salonConsumptionDate ? salonConsumptionDate.toISOString() : currentDate;

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
			try {
				// Create order ID
				const orderId = uuidv4();
				const orderDateToUse = salonConsumptionDate ? salonConsumptionDate.toISOString() : new Date().toISOString();

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

				// Calculate order total
				const orderTotal = salonProducts.reduce((sum, product) => sum + product.total, 0);

				// Create order record with fields exactly matching the pos_orders table schema
				const orderData = {
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

			// Reset form and navigate to orders page instead of inventory page
			resetFormState();
			navigate('/orders');

		} catch (error: any) {
			console.error('Error creating salon consumption:', error);
			toast.error(`Error: ${error.message || 'Unknown error occurred'}`);
		} finally {
			setProcessing(false);
		}
	}, [currentAppointmentId, updateAppointment, orderItems, isOrderValid, calculateProductSubtotal, calculateServiceSubtotal, calculateProductGstAmount, calculateServiceGstAmount, walkInDiscount, getAmountPaid, selectedClient, selectedStylist, customerName, createWalkInOrderMutation, createOrder, isSplitPayment, splitPayments, productGstRate, serviceGstRate, salonProducts, consumptionPurpose, consumptionNotes, requisitionVoucherNo, fetchBalanceStockData, resetFormState, navigate, queryClient, directUpdateStockQuantity, createClientAsync, newClientPhone, newClientEmail, salonConsumptionDate]); // Changed createClient to createClientAsync here as well

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
					order_date: salonConsumptionDate ? salonConsumptionDate.toISOString() : baseOrderData.order_date,
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
								value={salonConsumptionDate}
								onChange={(newDate) => setSalonConsumptionDate(newDate)}
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

		// Calculate individual item discounts total
		const individualItemDiscounts = orderItems.reduce((sum, item) => sum + (item.discount || 0), 0);
		
		// Calculate global percentage discount (on subtotal including GST)
		const percentageDiscountAmount = (subtotalIncludingGST * walkInDiscountPercentage) / 100;
		
		// Total discount is sum of: individual item discounts + global direct discount + percentage discount
		const totalDiscount = individualItemDiscounts + walkInDiscount + percentageDiscountAmount;
		
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
									<Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 2 }}>
										<TextField
											size="small"
											variant="standard"
											type="number"
											value={item.price}
											onChange={(e) => {
												const newPrice = parseFloat(e.target.value);
													handleItemPriceChange(item.id, isNaN(newPrice) ? 0 : newPrice);
											}}
											sx={{ width: '80px' }}
											InputProps={{
												startAdornment: <InputAdornment position="start">₹</InputAdornment>,
												inputProps: { step: 0.01, min: 0 }
											}}
										/>
										
										{/* Individual item discount fields */}
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
																// Calculate percentage based on amount
																discount_percentage: isNaN(discAmount) ? 0 : 
																	i.price > 0 ? Math.min(100, (discAmount / (i.price * i.quantity)) * 100) : 0,
																// Update total with discount
																total: Math.max(0, (i.price * i.quantity) - (isNaN(discAmount) ? 0 : discAmount))
															} 
															: i
													);
													setOrderItems(updatedItems);
												}}
												sx={{ width: '70px' }}
												InputProps={{
													inputProps: { min: 0, max: item.price * item.quantity }
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
													const discAmount = (validPercentage / 100) * (item.price * item.quantity);
													const updatedItems = orderItems.map(i => 
														i.id === item.id 
															? { 
																...i, 
																discount_percentage: validPercentage,
																discount: discAmount,
																// Update total with discount
																total: Math.max(0, (i.price * i.quantity) - discAmount)
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
									</Box>
								</Box>
								<Typography variant="body1" sx={{ fontWeight: 500, minWidth: '70px', textAlign: 'right' }}>
									{formatCurrency((item.discount && item.discount > 0) 
										? Math.max(0, (item.price * item.quantity) - item.discount)
										: item.price * item.quantity)}
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
					<Typography variant="body2">Product Subtotal:</Typography>
					<Typography variant="body2" fontWeight="500">{formatCurrency(productSubtotal)}</Typography>
				</Box>
				<Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
					<Typography variant="body2">Service Subtotal:</Typography>
					<Typography variant="body2" fontWeight="500">{formatCurrency(serviceSubtotal)}</Typography>
				</Box>
				
				{/* Manual date selection */}
				<Box sx={{ mb: 2, mt: 2 }}>
					<Typography variant="body2" fontWeight="500" gutterBottom>Order Date:</Typography>
					<LocalizationProvider dateAdapter={AdapterDateFns}>
						<DatePicker
							value={salonConsumptionDate}
							onChange={(newDate) => setSalonConsumptionDate(newDate)}
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
					<Typography variant="body2">Product GST ({productGstRate}%):</Typography>
					<Typography variant="body2" fontWeight="500">{formatCurrency(productGstAmount)}</Typography>
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
				
				{/* Show breakdown of discounts if there are different types */}
				{(individualItemDiscounts > 0 || walkInDiscount > 0 || percentageDiscountAmount > 0) && (
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
						{percentageDiscountAmount > 0 && (
							<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
								<Typography variant="body2" color="text.secondary">Percentage Discount ({walkInDiscountPercentage}%):</Typography>
								<Typography variant="body2" color="text.secondary">-{formatCurrency(percentageDiscountAmount)}</Typography>
							</Box>
						)}
					</Box>
				)}

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
			item_id: membership.id,
			item_name: membership.name,
			price: membership.price,
			quantity: 1,
			type: 'membership',
			category: 'membership',
			duration_months: membership.duration_months
		};

		setOrderItems(prev => [...prev, newItem]);
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
							
							{/* Payment Methods Section */}
							<Typography variant="subtitle2" gutterBottom>
								Payment Methods:
							</Typography>

							{/* Membership Status and Toggle */}
							{activeClientMembership && (
								<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
									<Chip
										icon={<CardMembershipIcon />}
										label={`${activeClientMembership.tierName} Member`}
										size="small"
										color="primary"
										sx={{ mr: 2 }}
									/>
									<Typography variant="body2" sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
										<AccountBalanceWalletIcon fontSize="small" sx={{ mr: 0.5 }} />
										Rs. {activeClientMembership.currentBalance.toLocaleString()}
									</Typography>
									<FormControlLabel
										control={
											<Switch
												checked={useMembershipPayment}
												onChange={e => {
													setUseMembershipPayment(e.target.checked);
													if (e.target.checked) {
														// When using membership, use the subtotal without GST
														const subtotal = calculateProductSubtotal() + calculateServiceSubtotal();
														const paymentAmount = Math.min(subtotal, activeClientMembership.currentBalance);
														setPaymentAmounts(prev => ({
															...prev,
															membership: paymentAmount, // Use subtotal for membership
															cash: 0 // No cash payment needed
														}));
														// Set walkInPaymentMethod to membership
														setWalkInPaymentMethod('membership');
													} else {
														// When disabling, move amount from membership to cash
														const membershipAmount = paymentAmounts.membership;
														setPaymentAmounts(prev => ({
															...prev,
															membership: 0,
															cash: prev.cash + membershipAmount
														}));
														// Reset walkInPaymentMethod to cash
														setWalkInPaymentMethod('cash');
													}
												}}
												size="small"
											/>
										}
										label="Pay via Membership"
									/>
								</Box>
							)}

							{/* Payment Method Cards */}
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
								{/* Show all payment methods except membership */}
								{(['cash', 'credit_card', 'debit_card', 'upi', 'bnpl'] as const).map(method => (
									<Box
										key={method}
										sx={{
											minWidth: '120px',
											flex: '1 1 0',
											p: 1.5,
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
											fullWidth
											size="small"
											type="number"
											value={paymentAmounts[method]}
											onChange={(e) => {
												const newValue = Math.max(0, Number(e.target.value) || 0);
												setPaymentAmounts(prev => ({ ...prev, [method]: newValue }));
											}}
											InputProps={{
												startAdornment: <InputAdornment position="start">₹</InputAdornment>
											}}
										/>
									</Box>
								))}

								{/* Show membership payment option only for members */}
								{activeClientMembership && activeClientMembership.isActive && (
									<Box
										sx={{
											minWidth: '120px',
											flex: '1 1 0',
											p: 1.5,
											border: '1px solid',
											borderColor: paymentAmounts.membership > 0 ? 'primary.main' : 'divider',
											borderRadius: '8px',
											bgcolor: paymentAmounts.membership > 0 ? 'primary.lighter' : 'background.paper'
										}}
									>
										<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
											<AccountBalanceWalletIcon fontSize="small" sx={{ mr: 1, color: paymentAmounts.membership > 0 ? 'primary.main' : 'text.secondary' }} />
											<Typography variant="body2" fontWeight={paymentAmounts.membership > 0 ? 'bold' : 'normal'}>
												Pay from Membership
											</Typography>
										</Box>
										<TextField
											fullWidth
											size="small"
											type="number"
											value={paymentAmounts.membership}
											onChange={(e) => {
												const val = Math.min(
													Math.min(total, activeClientMembership.currentBalance),
													Math.max(0, Number(e.target.value) || 0)
												);
												setPaymentAmounts(prev => ({ ...prev, membership: val }));
											}}
											InputProps={{
												startAdornment: <InputAdornment position="start">₹</InputAdornment>,
												inputProps: {
													min: 0,
													max: Math.min(total, activeClientMembership.currentBalance)
												}
											}}
										/>
										<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
											Available: Rs. {activeClientMembership.currentBalance.toLocaleString()}
										</Typography>
									</Box>
								)}
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
											const currentTotal = calculateProductSubtotal() + calculateServiceSubtotal() + calculateProductGstAmount(calculateProductSubtotal()) + calculateServiceGstAmount(calculateServiceSubtotal());
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
							{/* Split payment collapse and fields */}
							
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
																{PAYMENT_METHOD_LABELS[payment.payment_method as string]}
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
									// Calculate total based on payment method
									const orderTotal = useMembershipPayment ? 
										calculateProductSubtotal() + calculateServiceSubtotal() : // No GST for membership
										calculateTotalAmount(); // Include GST for other methods

									// Build payments array from paymentAmounts
									if (isSplitPayment && !useMembershipPayment) {
										// Only setup split payments if split payment mode is enabled and not using membership
										const payments = Object.entries(paymentAmounts)
											.filter(([_, amt]) => amt > 0)
											.map(([method, amt]) => ({ 
												id: uuidv4(), 
												payment_method: method as PaymentMethod, 
												amount: amt 
											}));
										setSplitPayments(payments);
									}
									await handleCreateWalkInOrder();
								}}
								disabled={processing || (
									useMembershipPayment ? 
										paymentAmounts.membership < (calculateProductSubtotal() + calculateServiceSubtotal()) : // Check without GST for membership
										Object.values(paymentAmounts).reduce((a, b) => a + b, 0) < calculateTotalAmount() // Check with GST for other methods
								)}
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
							<Button 
								variant="contained" 
								size="small" 
								startIcon={<RefreshIcon />}
								onClick={() => {
									if (selectedClient?.full_name) {
										setIsHistoryLoading(true);
										fetchClientHistory(selectedClient.full_name);
									}
								}}
								sx={{ mt: 2 }}
							>
								Refresh History
							</Button>
						</Box>
					) : (
						<>
							<Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
								<Button 
									variant="contained"
									color="primary"
									startIcon={<RefreshIcon />} 
									size="small"
									onClick={() => {
										if (selectedClient?.full_name) {
											setIsHistoryLoading(true);
											fetchClientHistory(selectedClient.full_name);
										}
									}}
								>
									Refresh History
								</Button>
							</Box>
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
		</Box>
	);
}






import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Container, Box, Typography, Paper, Tabs, Tab, TextField, Button, Grid, Card, CardContent, CardActions, FormControl, InputLabel, Select, MenuItem, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, CircularProgress, Collapse, Tooltip } from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, RemoveShoppingCart, ShoppingBag, Check as CheckIcon, Refresh, AttachMoney, CreditCard, LocalAtm, AccountBalance, Receipt, Inventory } from '@mui/icons-material';
import { supabase } from '../utils/supabase/supabaseClient.js';
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
	const navigate = useNavigate();
	const location = useLocation();
	const queryClient = useQueryClient();

	// Custom Hooks
	const { clients, isLoading: loadingClients, updateClientFromOrder } = useClients();
	const { stylists, isLoading: loadingStylists } = useStylists();
	const { createWalkInOrder: createWalkInOrderMutation, createOrder } = usePOS(); 
	const { products: inventoryProducts, isLoading: loadingInventoryProducts } = useProducts();
	const { services, isLoading: loadingServices } = useServices();
	const { recordSalonConsumption } = useInventory();
	const { appointments, isLoading: loadingAppointments, updateAppointment } = useAppointments();

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

	// ====================================================
	// 3. SIDE EFFECTS (useEffect)
	// ====================================================
	useEffect(() => {
		// Handle appointment data from location state
		if (location.state?.appointmentData) {
			const appointmentData = location.state.appointmentData;
			console.log('Received appointment data:', appointmentData);
			
			// Set tab to appointment payment (first tab)
			setTabValue(0);
			
			// Set client
			if (appointmentData.clientName) {
				setCustomerName(appointmentData.clientName);
				// Attempt to find the client in the loaded list
				const existingClient = clients?.find(c => c.full_name === appointmentData.clientName);
				if (existingClient) {
					setSelectedClient(existingClient);
				}
			}
			
			// Set stylist
			if (appointmentData.stylistId) {
				const existingStylist = stylists?.find(s => s.id === appointmentData.stylistId);
				if (existingStylist) {
					setSelectedStylist(existingStylist);
				}
			}
			
			// Set service/item
			if (appointmentData.serviceId && appointmentData.type === 'service') {
				const serviceToAdd = services?.find(s => s.id === appointmentData.serviceId);
				if (serviceToAdd) {
					handleAddToOrder(serviceToAdd, 1, appointmentData.servicePrice);
				}
			}

			// Store the appointment ID
			setCurrentAppointmentId(appointmentData.id || null); // <-- Store appointment ID

			// Clear location state to prevent re-processing on refresh
			navigate(location.pathname, { replace: true, state: {} });
		}
	}, [location.state, clients, stylists, services, navigate]); // Add dependencies

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

	useEffect(() => {
		// Add event listener for inventory updates
		const handleInventoryUpdate = () => {
			console.log('Inventory update detected in POS, refreshing stock data');
			fetchBalanceStockData();
		};

		// Listen for the custom event
		window.addEventListener('inventory-updated', handleInventoryUpdate);

		// Cleanup function
		return () => {
			window.removeEventListener('inventory-updated', handleInventoryUpdate);
		};
	}, [fetchBalanceStockData]);

	// Restore useEffect wrapper
	useEffect(() => {
		// Fetch all products from products table
		const fetchAllProducts = async () => {
			setLoadingProducts(true);
			try {
				let allLoadedProducts: POSService[] = [];

				// Fetch directly from products table
				if (inventoryProducts && inventoryProducts.length > 0) {
					console.log(`Found ${inventoryProducts.length} products from products table`);

					// Map to POS service format using exact field names from the database
					const mappedProducts = inventoryProducts.map((product) => ({
						id: product.id,
						name: product.name,
						price: product.mrp_per_unit_excl_gst || product.mrp_incl_gst || product.price || 0,
						description: `HSN: ${product.hsn_code || 'N/A'} | GST: ${product.gst_percentage}%`,
						type: "product" as "product" | "service",
						hsn_code: product.hsn_code,
						units: product.units,
						gst_percentage: product.gst_percentage,
						stock_quantity: product.stock_quantity || 0 // Use stock_quantity directly from products
					}));

					allLoadedProducts = [...mappedProducts];
					console.log("Mapped products from products table:", allLoadedProducts.slice(0, 2));
				}

				console.log(`Total products loaded: ${allLoadedProducts.length}`);
				setAllProducts(allLoadedProducts);

				// Get the latest stock information
				if (allLoadedProducts.length > 0) {
					await fetchBalanceStockData();
				}

			} catch (error) {
				console.error('Error fetching products:', error);
				toast.error('Error loading products. Please try again.');
			} finally {
				setLoadingProducts(false);
			}
		};

		fetchAllProducts();
	}, [inventoryProducts, fetchBalanceStockData]);

	// ====================================================
	// 4. EVENT HANDLERS & HELPER FUNCTIONS (useCallback or regular)
	// ====================================================

  // Generate time slots (e.g., 8 AM to 8 PM, 15-minute intervals)
  const timeSlots = useMemo(() => generateTimeSlots(8, 20, 15), []);

	// Restore the definitions for handlers and validators
	const handleClientSelect = useCallback((client: Client | null) => {
		setSelectedClient(client);
		if (client) {
			setCustomerName(client.full_name || '');
		}
	}, []);

	const handleNext = useCallback(() => {
		setActiveStep((prev) => prev + 1);
	}, []);

	const handleBack = useCallback(() => {
		setActiveStep((prev) => prev - 1);
	}, []);

	const handleAddToOrder = useCallback((service: POSService, quantity: number = 1, customPrice?: number) => {
		// Check if this is a product and if it's out of stock
		const isOutOfStock = service.type === 'product' &&
			(typeof service.stock_quantity === 'number' && service.stock_quantity <= 0);

		// Don't allow adding out-of-stock products
		if (isOutOfStock) {
			toast.error(`Cannot add "${service.name}" - Product is out of stock`);
			return;
		}

		console.log(`🛒 Adding to order - Product: ${service.name}, ID: ${service.id}, Type: ${service.type}, Quantity: ${quantity}, Current stock: ${service.stock_quantity}`);

		// For products, check if adding the quantity would exceed available stock
		if (service.type === 'product' && typeof service.stock_quantity === 'number') {
			// Find existing item to check total quantity
			const existingItem = orderItems.find(item =>
				item.item_id === service.id
			);

			const existingQty = existingItem ? existingItem.quantity : 0;
			const newTotalQty = existingQty + quantity;

			console.log(`🛒 Stock check - Current cart quantity: ${existingQty}, Adding: ${quantity}, New total: ${newTotalQty}, Available: ${service.stock_quantity}`);

			// Check if new total exceeds available stock
			if (newTotalQty > service.stock_quantity) {
				toast.warning(`Cannot add ${quantity} of "${service.name}" - Only ${service.stock_quantity} available (${existingQty} already in cart)`);
				return;
			}

			// Show low stock warnings
			const remainingStock = service.stock_quantity - newTotalQty;
			if (remainingStock === 0) {
				toast.warning(`Added last ${quantity} of "${service.name}" to cart - No more in stock`);
			} else if (remainingStock > 0 && remainingStock <= 3) {
				toast.info(`Low stock warning: Only ${remainingStock} ${service.name} remaining after this sale`);
			}
		}

		// Create a new order item matching the OrderItem interface
		const newItem: OrderItem = {
			id: uuidv4(), // Generate a unique ID
			order_id: '', // This will be set when the order is created
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
		
		// Add to order items
		setOrderItems((prev) => [...prev, newItem]);

		toast.success(`Added ${service.name} to order`);
	}, [orderItems, toast]);

	const handleAddSplitPayment = useCallback(() => {
		const newPayment = {
			id: Date.now().toString(),
			payment_method: newPaymentMethod,
			amount: newPaymentAmount,
		};

		setSplitPayments([...splitPayments, newPayment]);
		setNewPaymentAmount(0);
	}, [splitPayments, newPaymentMethod, newPaymentAmount]);

	const handleRemoveSplitPayment = useCallback((id: string) => {
		setSplitPayments(splitPayments.filter((payment) => payment.id !== id));
	}, [splitPayments]);

	const isStepValid = useCallback(() => {
		if (activeStep === 0) {
			// For regular orders, both customer name and stylist are required
			// Corrected comparison: Check if selectedStylist is not null
			return customerName.trim() !== "" && selectedStylist !== null;
		}

		if (activeStep === 1) {
			// Regular orders must have at least one service or product
			return orderItems.length > 0;
		}

		// For payment step
		if (activeStep === 2) {
			if (isSplitPayment) {
				return pendingAmount <= 0;
			}
			return true;
		}

		return true;
	}, [activeStep, customerName, selectedStylist, orderItems, isSplitPayment, pendingAmount]);

	const handleCreateWalkInOrder = useCallback(async () => {
		if (!isStepValid()) {
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
		const orderId = uuidv4(); // Generate unique ID for the order
		
		try {
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
			const clientPhoneString = selectedClient?.phone;
			// Provide 0 as default if phone is undefined or NaN after parsing
			const clientPhone = clientPhoneString ? (parseInt(clientPhoneString, 10) || 0) : 0; 
			
			const client = await updateClientFromOrder(
				selectedClient?.full_name || customerName,
				clientPhone, // Pass number (defaulting to 0 if needed)
				`Order: ${orderId}`, 
				new Date().toISOString()
			);
			
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
				type: 'service' as const
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
				customerName: selectedClient?.full_name || customerName,
				products: formattedProducts.length,
				services: formattedServices.length,
				staffInfo
			});
			
			// Call the standalone function with the correct parameters
			const orderResult = await createWalkInOrderMutation.mutateAsync({
				order_id: uuidv4(),
				client_id: selectedClient?.id || '',
				client_name: selectedClient?.full_name || customerName,
				stylist_id: staffInfo?.id || '',
				stylist_name: staffInfo?.name || '',
				items: [],
				services: formattedProducts.concat(formattedServices),
				payment_method: isSplitPayment ? 'split' : walkInPaymentMethod,
				split_payments: isSplitPayment ? splitPayments : undefined,
				discount: walkInDiscount,
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
					await updateAppointment({ id: currentAppointmentId, status: 'completed', paid: true });
					console.log(`Appointment ${currentAppointmentId} marked as completed and paid.`);
				} catch (updateError) {
					console.error(`Failed to update appointment status for ${currentAppointmentId}:`, updateError);
					toast.error('Order created, but failed to update appointment status.'); // Inform user
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
	}, [currentAppointmentId, updateAppointment, orderItems, isStepValid, calculateProductSubtotal, calculateServiceSubtotal, calculateProductGstAmount, calculateServiceGstAmount, walkInDiscount, getAmountPaid, selectedClient, selectedStylist, customerName, createWalkInOrderMutation, createOrder, isSplitPayment, splitPayments, productGstRate, serviceGstRate, calculateTotalAmount, allProducts, fetchBalanceStockData, directUpdateStockQuantity]);

	const resetFormState = useCallback(() => {
		setActiveStep(0);
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
		// Reset salon consumption state if it exists
		setSalonProducts([]);
		setConsumptionPurpose("");
		setConsumptionNotes("");
		setRequisitionVoucherNo("");
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
		if (activeStep === 0) {
			// At least one product must be selected
			return salonProducts.length > 0;
		}

		if (activeStep === 1) {
			// Must have a consumption purpose
			return consumptionPurpose.trim() !== '';
		}

		// For confirmation step
		if (activeStep === 2) {
			return true;
		}

		return true;
	}, [activeStep, salonProducts, consumptionPurpose]);

	const handleCreateSalonConsumptionWorkaround = useCallback(async () => {
		if (salonProducts.length === 0) {
			toast.error('Please add at least one product');
			return;
		}

		if (!consumptionPurpose) {
			toast.error('Please provide a purpose for consumption');
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
							product_name: product.item_name,
							hsn_code: product.hsn_code || '',
							quantity: product.quantity,
							purpose: consumptionPurpose,
							price_per_unit: price.toString(),
							gst_percentage: gstPercentage.toString(),
							// Add new fields
							current_stock: currentStock,
							current_stock_value: parseFloat((currentStock * price).toFixed(2)),
							c_sgst: parseFloat(sgst.toFixed(2)),
							c_cgst: parseFloat(cgst.toFixed(2)),
							c_tax: parseFloat(totalTax.toFixed(2))
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
				const orderItems = salonProducts.map(product => ({
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
					services: salonProducts.map(product => ({
						type: 'product',
						price: product.price,
						quantity: product.quantity,
						service_id: product.item_id,
						service_name: product.item_name,
						product_id: product.item_id, // Add product_id for reference
						product_name: product.item_name, // Add product_name
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
	}, [currentAppointmentId, updateAppointment, orderItems, isStepValid, calculateProductSubtotal, calculateServiceSubtotal, calculateProductGstAmount, calculateServiceGstAmount, walkInDiscount, getAmountPaid, selectedClient, selectedStylist, customerName, createWalkInOrderMutation, createOrder, isSplitPayment, splitPayments, productGstRate, serviceGstRate, salonProducts, consumptionPurpose, consumptionNotes, requisitionVoucherNo, fetchBalanceStockData, resetFormState, navigate, queryClient, directUpdateStockQuantity]);

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
			if (createOrder) { 
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
				const orderPayload: Partial<Order> = {
					id: baseOrderData.order_id,
					customer_name: baseOrderData.client_name, 
						order_date: baseOrderData.order_date,
						total_amount: baseOrderData.total_amount, 
						payment_method: isSplitPayment ? undefined : baseOrderData.payment_method as PaymentMethod, 
						staff_id: baseOrderData.stylist_id, 
						status: baseOrderData.status,
						is_salon_consumption: false,
						consumption_purpose: undefined,
						// Try 'regular_purchase' for purchase_type
						purchase_type: 'regular_purchase',
						order_type: 'appointment', // This seems valid according to Order type
						// DO NOT include fields not in Order, including 'items'
						// items: baseOrderData.items, 
				};

				await createOrder(orderPayload);
			} else {
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

	// Restore rendering functions
	const renderServiceSelectionSection = () => {
		return (
			<Box sx={{ p: 3 }}>
				<Typography variant="h6" gutterBottom>
					Select Services
				</Typography>

				{/* Service selection UI */}
				<Grid container spacing={3}>
					{loadingStylists || loadingServices ? (
						<Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
							<CircularProgress />
						</Grid>
					) : services && services.length > 0 ? (
						services.map((service) => (
							<Grid item xs={12} sm={6} md={4} key={service.id}>
								<Card sx={{
									blockSize: '100%',
									display: 'flex',
									flexDirection: 'column',
									borderRadius: '8px',
									boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
									'&:hover': {
										boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
									}
								}}>
									<CardContent sx={{ flexGrow: 1 }}>
										<Typography variant="h6" sx={{ fontWeight: 600 }}>{service.name}</Typography>
										<Typography color="text.secondary" sx={{ mb: 1 }}>
											₹{service.price} • {service.duration} min
										</Typography>
										{service.description && (
											<Typography variant="body2" color="text.secondary">
												{service.description}
											</Typography>
										)}
									</CardContent>
									<CardActions sx={{ justifyContent: 'flex-end', pt: 0, pb: 2, px: 2 }}>
										<Button
											variant="contained"
											size="small"
											color="primary"
											onClick={() => handleAddToOrder({
												id: service.id,
												name: service.name,
												price: service.price,
												duration: service.duration,
												type: 'service',
												category: service.category
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
						))
					) : (
						<Grid item xs={12}>
							<Box sx={{
								textAlign: 'center',
								my: 4,
								p: 4,
								bgcolor: 'grey.50',
								borderRadius: '8px',
								border: '1px dashed rgba(0, 0, 0, 0.12)'
							}}>
								<Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
									No services available. Add services from the Settings section first.
								</Typography>
								<Button
									variant="outlined"
									color="primary"
									component="a"
									href="/settings"
									sx={{
										borderRadius: '6px',
										textTransform: 'none',
										fontWeight: 500
									}}
								>
									Go to Settings
								</Button>
							</Box>
						</Grid>
					)}
				</Grid>
			</Box>
		);
	};

	const renderProductsSelectionSection = () => {
		return (
			<Box sx={{ mt: 3, p: 3 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
					<Typography variant="h6">
						Add Products (Optional)
					</Typography>
					<RefreshInventoryButton
						onRefresh={async () => {
							console.log("🔄 POS: Forcefully refreshing product stock data");
							try {
								// First fetch balance stock for current stock quantities
								await fetchBalanceStockData();
								// Then reload all products to ensure everything is up to date
								await fetchAllProducts();
								toast.success("Stock data refreshed successfully");
								console.log("🔄 POS: Stock data refresh complete");
							} catch (error) {
								console.error("🔄 POS: Error refreshing stock data:", error);
								toast.error("Failed to refresh stock data");
							}
							return Promise.resolve();
						}}
						size="small"
						buttonText="Refresh Stock"
						variant="outlined"
					/>
				</Box>

				{/* Product selection UI goes here */}
				<Grid container spacing={3} sx={{ mt: 2 }}>
					{loadingProducts ? (
						<Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
							<CircularProgress />
						</Grid>
					) : allProducts.length > 0 ? (
						allProducts.map((product) => (
							<Grid item xs={12} sm={6} md={4} key={product.id}>
								{renderProductCard(product, handleAddToOrder)}
							</Grid>
						))
					) : (
						<Grid item xs={12}>
							<Box sx={{
								textAlign: 'center',
								my: 4,
								p: 4,
								bgcolor: 'grey.50',
								borderRadius: '8px',
								border: '1px dashed rgba(0, 0, 0, 0.12)'
							}}>
								<Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
									No products available. Add products from the Products section first.
								</Typography>
								<Button
									variant="outlined"
									color="primary"
									component="a"
									href="/products"
									sx={{
										borderRadius: '6px',
										textTransform: 'none',
										fontWeight: 500
									}}
								>
									Go to Products
								</Button>
							</Box>
						</Grid>
					)}
				</Grid>
			</Box>
		);
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

				{/* Product selection UI for salon use - only products, no services */}
				<Grid container spacing={3}>
					{loadingProducts ? (
						<Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
							<CircularProgress />
						</Grid>
					) : productsOnly.length > 0 ? (
						productsOnly.map((product) => (
							<Grid item xs={12} sm={6} md={4} key={product.id}>
								{renderProductCard(product, handleAddSalonProduct)}
							</Grid>
						))
					) : (
						<Grid item xs={12}>
							<Box sx={{
								textAlign: 'center',
								my: 4,
								p: 4,
								bgcolor: 'grey.50',
								borderRadius: '8px',
								border: '1px dashed rgba(0, 0, 0, 0.12)'
							}}>
								<Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
									No products available. Add products from the Products section first.
								</Typography>
								<Button
									variant="outlined"
									color="primary"
									component="a"
									href="/products"
									sx={{
										borderRadius: '6px',
										textTransform: 'none',
										fontWeight: 500
									}}
								>
									Go to Products
								</Button>
							</Box>
						</Grid>
					)}
				</Grid>
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

	// ====================================================
	// 5. LOADING CHECK (AFTER ALL HOOKS)
	// ====================================================
	const isInitialLoading = loadingClients || loadingStylists || loadingAppointments || loadingInventoryProducts || loadingServices;
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
		<Box sx={{
			flexGrow: 1,
			inlineSize: '100%',
			maxinlineSize: '1400px',
			margin: '0 auto',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'stretch'
		}}>
			<Paper sx={{ mb: 2 }}>
				<Tabs
					value={tabValue}
					onChange={(_, newValue) => {
						setTabValue(newValue);
						// Reset state when changing tabs
						setActiveStep(0);
						if (newValue === 0) {
							// Switch to Walk-in tab - reset only if there are salon products
							if (salonProducts.length > 0) {
								resetFormState();
							}
						} else {
							// Switch to Salon Consumption tab - reset only if there are order items
							if (orderItems.length > 0) {
								resetFormState();
							}
						}
					}}
					indicatorColor="primary"
					textColor="primary"
					centered
					sx={{ inlineSize: '100%' }}
				>
					<Tab label="Walk-In Order" icon={<ShoppingBasketIcon />} />
					<Tab
						label="Salon Products Consumption"
						icon={<Inventory />}
					/>
				</Tabs>
			</Paper>

			{/* Walk-In Order Panel */}
			<TabPanel value={tabValue} index={0}>
				<Paper sx={{ p: 0, blockSize: "100%", borderRadius: '8px', inlineSize: '100%' }}>
					{/* Stepper for walkthrough */}
					<Stepper
						activeStep={activeStep}
						sx={{ p: 3, borderinsetBlockEnd: "1px solid rgba(0, 0, 0, 0.12)", inlineSize: '100%' }}
					>
						{["Customer Info", "Services & Products", "Payment"].map((label, idx) => (
							<Step key={label}>
								<StepLabel
									onClick={() => {
										if (idx <= activeStep) setActiveStep(idx);
									}}
									style={{ cursor: idx <= activeStep ? 'pointer' : 'default' }}
								>
									{label}
								</StepLabel>
							</Step>
						))}
					</Stepper>

					{/* Main content based on active step */}
					<Box
						sx={{
							p: 0,
							blockSize: "calc(100% - 72px)",
							display: "flex",
							flexDirection: "column",
							inlineSize: '100%'
						}}
					>
						<Grid container spacing={2} sx={{ flexGrow: 1, inlineSize: '100%', m: 0 }}>
							{/* Left side - Form based on current step */}
							<Grid
								item
								xs={12}
								md={8}
								sx={{ blockSize: "100%", overflowY: "auto", boxSizing: 'border-box' }}
							>
								{activeStep === 0 && (
									<Box sx={{ p: 3 }}>
										<Typography variant="h6" gutterBottom>
											Customer Information
										</Typography>

										<Grid container spacing={3}>
											<Grid item xs={12} md={6}>
												<Autocomplete
													options={clients || []}
													getOptionLabel={(option) => option.full_name || ""}
													value={selectedClient}
													onChange={(_, newValue) => handleClientSelect(newValue)}
													renderInput={(params) => (
														<TextField
															{...params}
															label="Select Existing Client"
															variant="outlined"
															fullWidth
															helperText={clients && clients.length === 0 ? "No clients available. Add clients from the Client section." : ""}
														/>
													)}
													renderOption={(props, option) => {
														// Don't extract key from props, handle it as part of parent item
														return (
															<li {...props} key={option.id}>
																<Box>
																	<Typography variant="body1">{option.full_name}</Typography>
																	{option.phone && (
																		<Typography variant="body2" color="text.secondary">
																			{option.phone}
																		</Typography>
																	)}
																</Box>
															</li>
														);
													}}
												/>
											</Grid>
											<Grid item xs={12} md={6}>
												<TextField
													fullWidth
													label="Customer Name"
													variant="outlined"
													value={customerName}
													onChange={(e) => setCustomerName(e.target.value)}
													sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
												/>
											</Grid>
											<Grid item xs={12} md={6}>
												<FormControl
													fullWidth
													required
													error={activeStep === 0 && selectedStylist === null}
												>
													<InputLabel id="stylist-select-label">
														Select Stylist
													</InputLabel>
													<Select
														labelId="stylist-select-label"
														id="stylist-select"
														// Corrected: Pass stylist object, not just ID
														value={selectedStylist?.id || ""} // Keep value as ID for Select
														label="Select Stylist"
														onChange={(e) => {
															const stylistId = e.target.value;
															const stylist = stylists?.find(s => s.id === stylistId) || null;
															setSelectedStylist(stylist); // Set the Stylist object
														}}
														sx={{ borderRadius: '8px' }}
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
													{activeStep === 0 && selectedStylist === null && (
														<Typography variant="caption" color="error">
															Stylist is required
														</Typography>
													)}
												</FormControl>
											</Grid>

											<Grid item xs={12}>
												<Typography variant="subtitle1" gutterBottom>
													Appointment Time (Optional)
												</Typography>
												<Typography
													variant="body2"
													color="text.secondary"
													gutterBottom
													style={{ marginBottom: '16px' }}
												>
													You can optionally specify when this service will be
													provided.
												</Typography>
												<Box sx={{ mt: 2 }}>
													<Grid container spacing={2}>
														<Grid item xs={12} md={6}>
															<LocalizationProvider
																dateAdapter={AdapterDateFns}
															>
																<ErrorBoundary>
																	<DatePicker
																		label="Date"
																		value={appointmentDate}
																		onChange={(newValue) =>
																			setAppointmentDate(newValue)
																		}
																		slotProps={{
																			textField: {
																				fullWidth: true,
																				variant: "outlined",
																			},
																		}}
																	/>
																</ErrorBoundary>
															</LocalizationProvider>
														</Grid>
														<Grid item xs={12} md={6}>
                              {/* Replace TimePicker with Select */}
                              <FormControl fullWidth variant="outlined">
                                <InputLabel id="time-slot-select-label">Time</InputLabel>
                                <Select
                                  labelId="time-slot-select-label"
                                  label="Time"
                                  value={appointmentTime ? format(appointmentTime, 'hh:mm a') : ''}
                                  onChange={(e) => {
                                    const timeString = e.target.value;
                                    if (timeString && appointmentDate) {
                                      // Parse the time string (e.g., "09:15 AM")
                                      const [timePart, ampm] = timeString.split(' ');
                                      let [hours, minutes] = timePart.split(':').map(Number);

                                      if (ampm === 'PM' && hours !== 12) {
                                        hours += 12;
                                      } else if (ampm === 'AM' && hours === 12) {
                                        hours = 0; // Midnight case
                                      }

                                      const newTime = new Date(appointmentDate);
                                      newTime.setHours(hours, minutes, 0, 0);
                                      setAppointmentTime(newTime);
                                    }
                                  }}
                                  disabled={!appointmentDate}
                                >
                                  <MenuItem value="">
                                    <em>Select Time</em>
                                  </MenuItem>
                                  {timeSlots.map((slot: string) => (
                                    <MenuItem key={slot} value={slot}>
                                      {slot}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
											</Grid>
										</Grid>
									</Box>  
								</Grid> 
							</Grid> 
						</Box> 
						)} 

						{activeStep === 1 && (
									<>
										{renderServiceSelectionSection()}
										{renderProductsSelectionSection()}
									</>
								)}

								{activeStep === 2 && (
									<Box sx={{ p: 3 }}>
										<Typography variant="h6" gutterBottom>
											Payment Details
										</Typography>

										<Grid container spacing={3}>
											<Grid item xs={12} md={6}>
												<FormControl fullWidth>
													<InputLabel id="payment-method-label">
														Payment Method
													</InputLabel>
													<Select
														labelId="payment-method-label"
														value={walkInPaymentMethod}
														onChange={(e) =>
															setWalkInPaymentMethod(
																e.target.value as PaymentMethod,
															)
														}
														label="Payment Method"
													>
														{PAYMENT_METHODS.map((method) => (
															<MenuItem key={method} value={method}>
																<Box
																	sx={{ display: "flex", alignItems: "center" }}
																>
																	<Box sx={{ mr: 1 }}>
																		{/* Payment icon would go here */}
																	</Box>
																	{PAYMENT_METHOD_LABELS[method]}
																</Box>
															</MenuItem>
														))}
													</Select>
												</FormControl>
											</Grid>
											<Grid item xs={12} md={6}>
												<TextField
													fullWidth
													label="Discount (Fixed Amount)"
													variant="outlined"
													type="number"
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
											<Grid item xs={12} md={6}>
												<TextField
													fullWidth
													label="Discount (%)"
													variant="outlined"
													type="number"
													value={walkInDiscountPercentage}
													onChange={(e) => {
														const percentage = parseFloat(e.target.value);
														setWalkInDiscountPercentage(isNaN(percentage) ? 0 : Math.max(0, Math.min(100, percentage)));
														// Calculate and set fixed discount
														const currentTotal = calculateProductSubtotal() + calculateServiceSubtotal() + calculateProductGstAmount(calculateProductSubtotal()) + calculateServiceGstAmount(calculateServiceGstAmount(calculateServiceSubtotal()));
														const calculatedFixedDiscount = (currentTotal * (isNaN(percentage) ? 0 : Math.max(0, Math.min(100, percentage)))) / 100;
														// Remove Math.round() to store precise value
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
														/>
													}
													label="Split Payment"
												/>
											</Grid>

											<Grid item xs={12}>
												<Collapse in={isSplitPayment}>
													<Paper variant="outlined" sx={{ p: 2, borderRadius: '8px', mb: 2 }}>
														<Typography variant="subtitle1" gutterBottom>
															Add Payment
														</Typography>

														<Grid container spacing={2} alignItems="center">
															<Grid item xs={12} sm={5}>
																<TextField
																	fullWidth
																	label="Amount"
																	variant="outlined"
																	type="number"
																	value={newPaymentAmount}
																	onChange={(e) =>
																		setNewPaymentAmount(Math.round(Number(e.target.value)))
																	}
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
															<Grid item xs={12} sm={5}>
																<FormControl fullWidth>
																	<InputLabel id="new-payment-method-label">
																		Payment Method
																	</InputLabel>
																	<Select
																		labelId="new-payment-method-label"
																		value={newPaymentMethod}
																		onChange={(e) =>
																			setNewPaymentMethod(
																				e.target.value as PaymentMethod,
																			)
																		}
																		label="Payment Method"
																	>
																		{PAYMENT_METHODS.map((method) => (
																			<MenuItem key={method} value={method}>
																				<Box
																					sx={{
																						display: "flex",
																						alignItems: "center",
																					}}
																				>
																					<Box sx={{ mr: 1 }}>
																						{/* Payment icon would go here */}
																					</Box>
																					{PAYMENT_METHOD_LABELS[method]}
																				</Box>
																			</MenuItem>
																		))}
																	</Select>
																</FormControl>
															</Grid>
															<Grid item xs={12} sm={2}>
																<Button
																	variant="contained"
																	color="primary"
																	fullWidth
																	onClick={handleAddSplitPayment}
																	disabled={
																		newPaymentAmount <= 0 ||
																		newPaymentAmount > pendingAmount ||
																		splitPayments.length >= 2
																	}
																>
																	Add
																</Button>
															</Grid>
														</Grid>

														{/* Display pending amount */}
														<Box
															sx={{
																mt: 2,
																display: "flex",
																justifyContent: "space-between",
															}}
														>
															<Typography>Pending Amount:</Typography>
															<Typography
																fontWeight="medium"
																color={pendingAmount > 0 ? "error" : "success"}
															>
																{formatCurrency(pendingAmount)}
															</Typography>
														</Box>

														{/* Show split payments */}
														{splitPayments.length > 0 && (
															<Box sx={{ mt: 2 }}>
																<Typography variant="subtitle1" gutterBottom>
																	Payment Breakdown
																</Typography>
																<TableContainer
																	component={Paper}
																	variant="outlined"
																	sx={{ borderRadius: '8px', overflow: 'hidden' }}
																>
																	<Table size="small">
																		<TableHead>
																			<TableRow>
																				<TableCell>Method</TableCell>
																				<TableCell align="right">
																					Amount
																				</TableCell>
																				<TableCell></TableCell>
																			</TableRow>
																		</TableHead>
																		<TableBody>
																			{splitPayments.map((payment) => (
																				<TableRow key={payment.id}>
																					<TableCell>
																						<Box
																							sx={{
																								display: "flex",
																								alignItems: "center",
																							}}
																						>
																							<Box sx={{ mr: 1 }}>
																								{/* Payment icon would go here */}
																							</Box>
																							{PAYMENT_METHOD_LABELS[payment.payment_method as PaymentMethod]}
																						</Box>
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
																			<TableRow>
																				<TableCell>
																					<strong>Total Paid</strong>
																				</TableCell>
																				<TableCell align="right" colSpan={2}>
																					<strong>
																						{formatCurrency(getAmountPaid())}
																					</strong>
																				</TableCell>
																			</TableRow>
																		</TableBody>
																	</Table>
																</TableContainer>
															</Box>
														)}
													</Paper>
												</Collapse>
											</Grid>
										</Grid>
									</Box>
								)}

								{/* Navigation buttons */}
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										p: 3,
									}}
								>
									<Button
										variant="outlined"
										onClick={handleBack}
										disabled={activeStep === 0}
									>
										Back
									</Button>

									{activeStep === 2 ? (
										<Button
											variant="contained"
											color="primary"
											onClick={handleCreateWalkInOrder}
											disabled={processing || !isStepValid()}
											startIcon={
												processing ? (
													<CircularProgress size={20} />
												) : (
													<CheckIcon />
												)
											}
										>
											{processing ? "Processing..." : "Complete Order"}
										</Button>
									) : (
										<Button
											variant="contained"
											onClick={handleNext}
											disabled={!isStepValid()}
											sx={{
												borderRadius: '8px',
												textTransform: 'none',
												fontWeight: 500,
												fontSize: '1rem'
											}}
										>
											Next
										</Button>
									)}
								</Box>
							</Grid>

							{/* Right side - Order Summary */}
							<Grid item xs={12} md={4} sx={{ blockSize: "100%", boxSizing: 'border-box' }}>
								{renderOrderSummary()}
							</Grid>
						</Grid>
					</Box>
				</Paper>
			</TabPanel>

			{/* Salon Consumption Panel */}
			<TabPanel value={tabValue} index={1}>
				<Paper sx={{ p: 0, blockSize: "100%", borderRadius: '8px', inlineSize: '100%' }}>
					{/* Make stepper match walk-in flow with 3 steps */}
					<Stepper
						activeStep={activeStep}
						sx={{ p: 3, borderinsetBlockEnd: "1px solid rgba(0, 0, 0, 0.12)", inlineSize: '100%' }}
					>
						{["Product Selection", "Consumption Details", "Confirmation"].map((label, idx) => (
							<Step key={label}>
								<StepLabel
									onClick={() => {
										if (idx <= activeStep) setActiveStep(idx);
									}}
									style={{ cursor: idx <= activeStep ? 'pointer' : 'default' }}
								>
									{label}
								</StepLabel>
							</Step>
						))}
					</Stepper>

					{/* Main content based on active step */}
					<Box
						sx={{
							p: 0,
							blockSize: "calc(100% - 72px)",
							display: "flex",
							flexDirection: "column",
							inlineSize: '100%'
						}}
					>
						<Grid container spacing={2} sx={{ flexGrow: 1, inlineSize: '100%', m: 0 }}>
							{/* Left side - Form based on current step */}
							<Grid
								item
								xs={12}
								md={8}
								sx={{ blockSize: "100%", overflowY: "auto", boxSizing: 'border-box' }}
							>
								{activeStep === 0 && (
									<Box sx={{ p: 3 }}>
										{renderSalonProductSelection()}
									</Box>
								)}

								{activeStep === 1 && (
									<Box sx={{ p: 3 }}>
										<Typography variant="h6" gutterBottom>
											Consumption Details
										</Typography>

										<Grid container spacing={3}>
											<Grid item xs={12} md={6}>
												<TextField
													fullWidth
													required
													label="Requisition Voucher No."
													variant="outlined"
													placeholder="Enter voucher/requisition number"
													value={requisitionVoucherNo || ""}
													onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequisitionVoucherNo(e.target.value)}
													helperText="This will appear in Salon Consumption history"
													sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
												/>
											</Grid>
											<Grid item xs={12} md={6}>
												<TextField
													fullWidth
													required
													label="Consumption Purpose"
													variant="outlined"
													placeholder="E.g., Stylist workstation, Salon display, Client consultation"
													value={consumptionPurpose || ""}
													onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConsumptionPurpose(e.target.value)}
													helperText="Specify the purpose of this salon consumption"
													sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
												/>
											</Grid>
											<Grid item xs={12}>
												<TextField
													fullWidth
													label="Additional Notes"
													variant="outlined"
													multiline
													rows={4}
													value={consumptionNotes || ""}
													onChange={(e) => setConsumptionNotes(e.target.value)}
													placeholder="Any additional notes about this consumption"
													sx={{ mb: 2 }}
												/>
											</Grid>
										</Grid>
									</Box>
								)}

								{activeStep === 2 && (
									<Box sx={{ p: 3 }}>
										<Typography variant="h6" gutterBottom>
											Confirm Consumption
										</Typography>

										<Paper variant="outlined" sx={{ p: 3, borderRadius: '8px', mb: 3 }}>
											<Typography variant="subtitle1" gutterBottom fontWeight="medium">
												Requisition Voucher No.
											</Typography>
											<Typography variant="body1" gutterBottom paragraph>
												{requisitionVoucherNo || "Auto-generated"}
											</Typography>

											<Typography variant="subtitle1" gutterBottom fontWeight="medium">
												Consumption Purpose
											</Typography>
											<Typography variant="body1" gutterBottom paragraph>
												{consumptionPurpose || "Not specified"}
											</Typography>

											{consumptionNotes && (
												<>
													<Typography variant="subtitle1" gutterBottom fontWeight="medium" sx={{ mt: 2 }}>
														Additional Notes
													</Typography>
													<Typography variant="body1" gutterBottom>
														{consumptionNotes}
													</Typography>
												</>
											)}

											<Typography variant="subtitle1" gutterBottom fontWeight="medium" sx={{ mt: 2 }}>
												Selected Products
											</Typography>
											<List dense>
												{salonProducts.map((item, idx) => (
													<ListItem key={idx}>
														<ListItemText
															primary={
																<Box sx={{ display: "flex", alignItems: "center" }}>
																	<ShoppingBasketIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
																	<Typography variant="body2">{item.item_name} (×{item.quantity})</Typography>
																</Box>
															}
															secondary={
																<Typography variant="caption" color="text.secondary">
																	{`GST: ${item.gst_percentage || 18}%`}
																</Typography>
															}
														/>
														<ListItemSecondaryAction>
															<Typography variant="body2">
																{formatCurrency(item.total)}
															</Typography>
														</ListItemSecondaryAction>
													</ListItem>
												))}
											</List>

											{/* GST Breakdown in Confirmation Step */}
											<Typography variant="subtitle1" gutterBottom fontWeight="medium" sx={{ mt: 2 }}>
												Tax Breakdown
											</Typography>
											<Box sx={{ pl: 2 }}>
												<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
													<Typography variant="body2">Products Subtotal:</Typography>
													<Typography variant="body2">{formatCurrency(salonProductsSubtotal)}</Typography>
												</Box>
												<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
													<Typography variant="body2">Taxable Value:</Typography>
													<Typography variant="body2">{formatCurrency(calculateSalonGST().taxableValue)}</Typography>
												</Box>
												<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
													<Typography variant="body2">CGST:</Typography>
													<Typography variant="body2">{formatCurrency(calculateSalonGST().cgst)}</Typography>
												</Box>
												<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
													<Typography variant="body2">SGST:</Typography>
													<Typography variant="body2">{formatCurrency(calculateSalonGST().sgst)}</Typography>
												</Box>
												<Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px solid #eee' }}>
													<Typography variant="body2" fontWeight="bold">Total:</Typography>
													<Typography variant="body2" fontWeight="bold">{formatCurrency(salonProductsSubtotal)}</Typography>
												</Box>
											</Box>

											<Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', color: 'white', borderRadius: '8px' }}>
												<Typography variant="body2">
													These products will be marked as internal salon consumption and will be removed from inventory.
												</Typography>
											</Box>
										</Paper>
									</Box>
								)}

								{/* Navigation buttons */}
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										p: 3,
									}}
								>
									<Button
										variant="outlined"
										onClick={handleBack}
										disabled={activeStep === 0}
									>
										Back
									</Button>

									{activeStep === 2 ? (
										<Button
											variant="contained"
											color="primary"
											onClick={handleCreateSalonConsumptionWorkaround}
											disabled={processing || !isSalonConsumptionValid()}
											startIcon={
												processing ? (
													<CircularProgress size={20} />
												) : (
													<CheckIcon />
												)
											}
										>
											{processing ? "Processing..." : "Submit Consumption"}
										</Button>
									) : (
										<Button
											variant="contained"
											onClick={handleNext}
											disabled={!isSalonConsumptionValid()}
											sx={{
												borderRadius: '8px',
												textTransform: 'none',
												fontWeight: 500,
												fontSize: '1rem'
											}}
										>
											Next
										</Button>
									)}
								</Box>
							</Grid>

							{/* Right side - Order Summary */}
							<Grid item xs={12} md={4} sx={{ blockSize: "100%", boxSizing: 'border-box' }}>
								<Paper
									sx={{
										p: 3,
										blockSize: "100%",
										display: "flex",
										flexDirection: "column",
										inlineSize: '100%',
										boxSizing: 'border-box'
									}}
								>
									<Typography variant="h6" gutterBottom>
										Consumption Summary
									</Typography>

									{salonProducts.length > 0 ? (
										<Box
											sx={{ flex: 1, display: "flex", flexDirection: "column" }}
										>
											<List sx={{ flex: 1, overflow: "auto" }}>
												<ListItem dense sx={{ pb: 0 }}>
													<ListItemText
														primary={
															<Typography
																variant="subtitle2"
																color="primary"
																sx={{ fontWeight: 600 }}
															>
																Products for Salon Use
															</Typography>
														}
													/>
												</ListItem>

												{salonProducts.map((item, index) => (
													<ListItem key={`${item.item_id}-${index}`} sx={{ py: 1 }}>
														<ListItemText
															primary={
																<Box sx={{ display: "flex", alignItems: "center" }}>
																	<ShoppingBasketIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
																	<Typography variant="body2">
																		{item.item_name} (×{item.quantity})
																	</Typography>
																</Box>
															}
															secondary={
																<Typography variant="caption" color="text.secondary">
																	{`GST: ${item.gst_percentage || 18}%`}
																</Typography>
															}
														/>
													</ListItem>
												))}
											</List>

											<Divider sx={{ my: 2 }} />

											{/* Consumption Totals with GST Breakdown */}
											<Box>
												<Box
													sx={{
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
														mb: 1,
													}}
												>
													<Typography variant="body2">Products Subtotal:</Typography>
													<Typography variant="body2" sx={{ mininlineSize: '80px', textAlign: 'right' }}>
														{formatCurrency(salonProductsSubtotal)}
													</Typography>
												</Box>

												{/* GST Breakdown */}
												{salonProducts.length > 0 && (
													<>
														<Box
															sx={{
																display: "flex",
																justifyContent: "space-between",
																alignItems: "center",
																mb: 1,
															}}
														>
															<Typography variant="body2">Taxable Value:</Typography>
															<Typography variant="body2" sx={{ mininlineSize: '80px', textAlign: 'right' }}>
																{formatCurrency(calculateSalonGST().taxableValue)}
															</Typography>
														</Box>

														<Box
															sx={{
																display: "flex",
																justifyContent: "space-between",
																alignItems: "center",
																mb: 1,
															}}
														>
															<Typography variant="body2">CGST:</Typography>
															<Typography variant="body2" sx={{ mininlineSize: '80px', textAlign: 'right' }}>
																{formatCurrency(calculateSalonGST().cgst)}
															</Typography>
														</Box>

														<Box
															sx={{
																display: "flex",
																justifyContent: "space-between",
																alignItems: "center",
																mb: 1,
															}}
														>
															<Typography variant="body2">SGST:</Typography>
															<Typography variant="body2" sx={{ mininlineSize: '80px', textAlign: 'right' }}>
																{formatCurrency(calculateSalonGST().sgst)}
															</Typography>
														</Box>
													</>
												)}

												<Divider sx={{ my: 1.5 }} />

												<Box
													sx={{
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
														mb: 0.5,
													}}
												>
													<Typography variant="h6">Total:</Typography>
													<Typography variant="h6" color="primary" sx={{ mininlineSize: '80px', textAlign: 'right' }}>
														{formatCurrency(calculateSalonGST().totalGST)}
													</Typography>
												</Box>
											</Box>

											{/* Purpose Info */}
											{consumptionPurpose && (
												<Box sx={{ mt: 2 }}>
													{requisitionVoucherNo && (
														<Chip
															icon={<Receipt />}
															label={`Voucher: ${requisitionVoucherNo}`}
															sx={{ mb: 1, mr: 1 }}
															color="primary"
														/>
													)}
													<Chip
														icon={<ShoppingBasketIcon />}
														label={`Purpose: ${consumptionPurpose}`}
														sx={{ mb: 1 }}
														color="primary"
													/>
												</Box>
											)}
										</Box>
									) : (
										<Box
											sx={{
												display: "flex",
												flexDirection: "column",
												justifyContent: "center",
												alignItems: "center",
												flex: 1,
											}}
										>
											<CartIcon
												sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
											/>
											<Typography variant="h6" color="text.secondary">
												No products selected
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
												align="center"
											>
												Add products for salon consumption
											</Typography>
										</Box>
									)}
								</Paper>
							</Grid>
						</Grid>
					</Box>
				</Paper>
			</TabPanel>

			{/* Snackbar for notifications */}
			<Snackbar
				open={snackbarOpen}
				autoHideDuration={5000}
				onClose={() => setSnackbarOpen(false)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
				ref={snackbarRef}
			>
				<Alert
					onClose={() => setSnackbarOpen(false)}
					severity={snackbarMessage.includes("successfully") ? "success" : "error"}
					sx={{ inlineSize: '100%' }}
					action={
						<IconButton
							size="small"
							aria-label="close"
							color="inherit"
							onClick={() => setSnackbarOpen(false)}
						>
							<CloseIcon fontSize="small" />
						</IconButton>
					}
				>
					{snackbarMessage}
				</Alert>
			</Snackbar>
		</Box>
	);
}



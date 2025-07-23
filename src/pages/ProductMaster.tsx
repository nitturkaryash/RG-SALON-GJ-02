import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  History as HistoryIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
  Upload as UploadIcon,
  CloudUpload as CloudUploadIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Clear as ClearIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { supabase, handleSupabaseError } from '../utils/supabase/supabaseClient';
import { usePurchaseHistory } from '../hooks/usePurchaseHistory';
import * as XLSX from 'xlsx';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontSize: '0.8rem',
  padding: '8px 12px',
  whiteSpace: 'nowrap',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
    cursor: 'pointer',
  },
  transition: 'background-color 0.2s',
}));

// Product interface - matches your database
interface Product {
  id: string;
  name: string;
  hsn_code: string;
  gst_percentage: number;
  units: string;
  price: number; // Sales price excluding GST
  mrp_excl_gst: number;
  mrp_incl_gst: number;
  active: boolean;
  stock_quantity?: number;
  created_at?: string;
  updated_at?: string;
  description?: string;
  category?: string;
  product_type?: string;
}

interface PriceHistory {
  id: number;
  product_id: string;
  changed_at: string;
  old_mrp_incl_gst: number;
  new_mrp_incl_gst: number;
  old_mrp_excl_gst?: number;
  new_mrp_excl_gst?: number;
  old_gst_percentage?: number;
  new_gst_percentage?: number;
  source_of_change: string;
  reference_id?: string;
  notes?: string;
}

// New product form state
interface ProductFormState {
  id?: string;
  name: string;
  hsn_code: string;
  gst_percentage: number;
  mrp_excl_gst: number;
  mrp_incl_gst: number;
  active: boolean;
  description?: string;
  category?: string;
  product_type?: string;
  fromPurchaseHistory?: boolean;
}

// Initial form state
const initialFormState: ProductFormState = {
  name: '',
  hsn_code: '',
  gst_percentage: 18, // Default 18%
  mrp_excl_gst: 0,
  mrp_incl_gst: 0,
  active: true,
  description: '',
  category: 'General', // Default category
  product_type: '',
  fromPurchaseHistory: false,
};

export default function ProductMaster() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ProductFormState>(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<Product | null>(null);
  // Add export loading state
  const [isExporting, setIsExporting] = useState(false);

  // Excel import states
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [parsedExcelData, setParsedExcelData] = useState<any[]>([]);

  // Search and filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'price' | 'stock'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Fetch purchase history data
  const { purchases, isLoading: isLoadingPurchases } = usePurchaseHistory();

  // Get unique categories for filter dropdown
  const getUniqueCategories = () => {
    const categories = products.map(p => p.category).filter(Boolean);
    return ['all', ...Array.from(new Set(categories))];
  };

  // Filter and sort products
  const getFilteredAndSortedProducts = () => {
    let filtered = products.filter(product => {
      // Search filter
      const searchMatch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.hsn_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_type?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const categoryMatch = categoryFilter === 'all' || product.category === categoryFilter;

      // Status filter
      const statusMatch = statusFilter === 'all' || 
        (statusFilter === 'active' && product.active) ||
        (statusFilter === 'inactive' && !product.active);

      return searchMatch && categoryMatch && statusMatch;
    });

    // Sort products
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        case 'price':
          comparison = (a.mrp_incl_gst || 0) - (b.mrp_incl_gst || 0);
          break;
        case 'stock':
          comparison = (a.stock_quantity || 0) - (b.stock_quantity || 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const filteredProducts = getFilteredAndSortedProducts();

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, categoryFilter, statusFilter, sortBy, sortDirection]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all products
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Please log in to view products');
      }

      console.log('Current user:', user.email, 'Auth User ID:', user.id);

      // Direct approach: Try multiple profile IDs that might work
      const possibleProfileIds = [
        '3f4b718f-70cb-4873-a62c-b8806a92e25b', // Admin profile ID
        user.id, // Auth user ID as fallback
      ];

      let products = [];
      let lastError = null;

      // Try each profile ID until we find products
      for (const profileId of possibleProfileIds) {
        try {
          console.log(`Trying to fetch products with profile ID: ${profileId}`);
          
          const { data, error } = await supabase
            .from('product_master')
            .select('*')
            .eq('user_id', profileId)
            .order('name');

          if (error) {
            console.warn(`Error with profile ID ${profileId}:`, error);
            lastError = error;
            continue;
          }

          if (data && data.length > 0) {
            console.log(`✅ Found ${data.length} products with profile ID: ${profileId}`);
            products = data;
            break;
          } else {
            console.log(`No products found with profile ID: ${profileId}`);
          }
        } catch (err) {
          console.warn(`Exception with profile ID ${profileId}:`, err);
          lastError = err;
        }
      }

      if (products.length === 0) {
        // If no products found, try fetching all products (for debugging)
        console.log('No products found with any profile ID, trying to fetch all products...');
        const { data: allProducts, error: allError } = await supabase
          .from('product_master')
          .select('*')
          .order('name');

                 if (allError) {
           const errorMessage = lastError instanceof Error ? lastError.message : 
                               (allError as any)?.message || 'Unknown error';
           throw new Error(`Failed to fetch products: ${errorMessage}`);
         }

        console.log(`Found ${allProducts?.length || 0} total products in database`);
        
        if (allProducts && allProducts.length > 0) {
          // Show first few products for debugging
          console.log('Sample products:', allProducts.slice(0, 3));
        }
        
        throw new Error('No products found for current user. Please contact administrator.');
      }

      console.log(`✅ Successfully loaded ${products.length} products`);
      setProducts(products);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    
    if (!name) return;
    
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      
      // If GST percentage or MRP including GST changes, recalculate MRP excluding GST
      if (name === 'gst_percentage' || name === 'mrp_incl_gst') {
        const gstPercentage = name === 'gst_percentage' ? Number(value) : prev.gst_percentage;
        const mrpInclGst = name === 'mrp_incl_gst' ? Number(value) : prev.mrp_incl_gst;
        
        // Calculate price excluding GST: price = mrp_incl_gst / (1 + gst_percentage/100)
        if (gstPercentage >= 0 && mrpInclGst >= 0) {
          const mrpExclGst = mrpInclGst / (1 + gstPercentage / 100);
          newData.mrp_excl_gst = parseFloat(mrpExclGst.toFixed(2));
        }
      }
      
      // If MRP excluding GST changes, recalculate MRP including GST
      if (name === 'mrp_excl_gst') {
        const mrpExclGst = Number(value);
        const gstPercentage = prev.gst_percentage;
        
        if (gstPercentage >= 0 && mrpExclGst >= 0) {
          const mrpInclGst = mrpExclGst * (1 + gstPercentage / 100);
          newData.mrp_incl_gst = parseFloat(mrpInclGst.toFixed(2));
        }
      }
      
      return newData;
    });
  };

  // Handle checkbox changes for boolean fields
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle product selection from purchase history autocomplete
  const handleProductFromPurchaseHistorySelect = (selectedProduct: any | null) => {
    if (!selectedProduct) {
      setFormData(initialFormState);
      return;
    }

    setFormData({
      name: selectedProduct.product_name,
      hsn_code: selectedProduct.hsn_code || '',
      gst_percentage: selectedProduct.gst_percentage || 18,
      mrp_excl_gst: selectedProduct.mrp_excl_gst || 0,
      mrp_incl_gst: selectedProduct.mrp_incl_gst || 0,
      active: true,
      description: '',
      category: 'General',
      product_type: selectedProduct.product_type || '',
      fromPurchaseHistory: true,
    });
  };

  // Handle manual product name input in autocomplete
  const handleProductNameInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      name: value,
      fromPurchaseHistory: false
    }));
  };

  // Open dialog for adding a new product
  const handleOpenAddDialog = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setOpen(true);
  };

  // Open dialog for editing an existing product
  const handleOpenEditDialog = (product: Product) => {
    setFormData({
      id: product.id,
      name: product.name,
      hsn_code: product.hsn_code || '',
      gst_percentage: product.gst_percentage || 18,
      mrp_excl_gst: product.mrp_excl_gst || 0,
      mrp_incl_gst: product.mrp_incl_gst || 0,
      active: product.active,
      description: product.description || '',
      category: product.category || 'General',
      product_type: product.product_type || '',
    });
    setIsEditing(true);
    setOpen(true);
  };

  // Close the dialog
  const handleClose = () => {
    setOpen(false);
  };

  const fetchPriceHistory = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_price_history')
        .select(`
          id,
          product_id,
          changed_at,
          old_mrp_incl_gst,
          new_mrp_incl_gst,
          old_mrp_excl_gst,
          new_mrp_excl_gst,
          old_gst_percentage,
          new_gst_percentage,
          source_of_change,
          reference_id,
          notes
        `)
        .eq('product_id', productId)
        .order('changed_at', { ascending: false });

      if (error) {
        console.error('Error fetching price history:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load price history',
          severity: 'error'
        });
        return;
      }

      setPriceHistory(data || []);
    } catch (err) {
      console.error('Unexpected error fetching price history:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load price history',
        severity: 'error'
      });
    }
  };

  const handleOpenHistoryDialog = (product: Product) => {
    setSelectedProductForHistory(product);
    fetchPriceHistory(product.id);
    setHistoryDialogOpen(true);
  };

  const handleCloseHistoryDialog = () => {
    setHistoryDialogOpen(false);
    setPriceHistory([]);
    setSelectedProductForHistory(null);
  };

  // Form validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      setSnackbar({ open: true, message: 'Product name is required', severity: 'error' });
      return false;
    }
    
    if (!formData.hsn_code.trim()) {
      setSnackbar({ open: true, message: 'HSN code is required', severity: 'error' });
      return false;
    }
    
    if (formData.gst_percentage < 0 || formData.gst_percentage > 100) {
      setSnackbar({ open: true, message: 'GST percentage must be between 0 and 100', severity: 'error' });
      return false;
    }
    
    if (formData.mrp_incl_gst < 0) {
      setSnackbar({ open: true, message: 'MRP cannot be negative', severity: 'error' });
      return false;
    }
    
    // Check for duplicate product name (only when adding a new product)
    if (!isEditing && products.some(p => p.name.toLowerCase() === formData.name.toLowerCase())) {
      setSnackbar({ open: true, message: 'A product with this name already exists', severity: 'error' });
      return false;
    }
    
    // Check for duplicate HSN code (only if strict HSN validation is required)
    // Uncomment if you want to enforce unique HSN codes
    /*
    if (!isEditing && products.some(p => p.hsn_code === formData.hsn_code)) {
      setSnackbar({ open: true, message: 'A product with this HSN code already exists', severity: 'error' });
      return false;
    }
    */
    
    return true;
  };

  // Submit the form to add/update a product
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Please log in to save products');
      }

      // Get the profile ID for the current user (prefer admin profile)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('auth_user_id', user.id)
        .order('role', { ascending: false }) // admin comes before user
        .limit(1)
        .single();

      if (profileError || !profileData) {
        throw new Error('Profile not found. Please contact administrator.');
      }

      const profileId = profileData.id;

      // Prepare data to insert/update
      const productData = {
        name: formData.name,
        hsn_code: formData.hsn_code,
        gst_percentage: formData.gst_percentage,
        price: formData.mrp_excl_gst, // Using mrp_excl_gst as the base price
        mrp_excl_gst: formData.mrp_excl_gst,
        mrp_incl_gst: formData.mrp_incl_gst,
        active: formData.active,
        description: formData.description,
        category: formData.category,
        product_type: formData.product_type,
        updated_at: new Date().toISOString(),
        user_id: profileId,
      };
      
      let result;
      
      if (isEditing && formData.id) {
        // Update existing product
        result = await supabase
          .from('product_master')
          .update(productData)
          .eq('id', formData.id);
          
        if (result.error) throw handleSupabaseError(result.error);
        
        setSnackbar({ open: true, message: 'Product updated successfully', severity: 'success' });
      } else {
        // Add new product
        result = await supabase
          .from('product_master')
          .insert({
            ...productData,
            created_at: new Date().toISOString(),
            stock_quantity: 0, // Initialize stock to 0 for new products
          });
          
        if (result.error) throw handleSupabaseError(result.error);
        
        setSnackbar({ open: true, message: 'Product added successfully', severity: 'success' });
      }
      
      // Refresh product list and close dialog
      await fetchProducts();
      handleClose();
      
    } catch (err) {
      console.error('Error saving product:', err);
      setSnackbar({ 
        open: true, 
        message: `Error: ${err instanceof Error ? err.message : 'Failed to save product'}`, 
        severity: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle product active status
  const handleToggleActive = async (product: Product) => {
    const updatedProduct = { ...product, active: !product.active };

    try {
      const { error } = await supabase
        .from('product_master')
        .update({ active: updatedProduct.active })
        .eq('id', product.id);

      if (error) throw handleSupabaseError(error);

      setProducts((prevProducts) =>
        prevProducts.map((p) => (p.id === product.id ? updatedProduct : p))
      );
      setSnackbar({
        open: true,
        message: `Product ${updatedProduct.active ? 'activated' : 'deactivated'} successfully!`,
        severity: 'success',
      });
    } catch (err) {
      console.error('Error toggling product active state:', err);
      setError(err instanceof Error ? err.message : 'Failed to update product status');
      setSnackbar({
        open: true,
        message: `Error: ${err instanceof Error ? err.message : 'Failed to update product status'}`,
        severity: 'error',
      });
    }
  };

  const handleOpenDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setProductToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const { error } = await supabase
        .from('product_master')
        .delete()
        .eq('id', productToDelete.id);

      if (error) throw handleSupabaseError(error);

      setProducts((prevProducts) =>
        prevProducts.filter((p) => p.id !== productToDelete.id)
      );
      setSnackbar({
        open: true,
        message: 'Product deleted successfully!',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      setSnackbar({
        open: true,
        message: `Error: ${err instanceof Error ? err.message : 'Failed to delete product'}`,
        severity: 'error',
      });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Excel import functions
  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length > 1) {
          // Skip header row and parse data
          const parsedData = (jsonData.slice(1) as any[][]).map((row: any[]) => {
            // Excel columns: PRODUCT NAME, Category, MRP Incl. GST, MRP Ex. GST, HSN CODE, TYPRE
            const [productName, category, mrpInclGst, mrpExclGst, hsnCode, productType] = row;
            
            // Calculate GST percentage from price difference
            const mrpIncl = Number(mrpInclGst) || 0;
            const mrpExcl = Number(mrpExclGst) || 0;
            const gstPercentage = mrpExcl && mrpIncl 
              ? Math.round(((mrpIncl - mrpExcl) / mrpExcl) * 100)
              : 18; // Default to 18% if calculation fails

            return {
              name: String(productName || '').trim(),
              category: String(category || 'General').trim(),
              mrp_incl_gst: mrpIncl,
              mrp_excl_gst: mrpExcl,
              hsn_code: String(hsnCode || '').trim(),
              product_type: String(productType || '').trim(),
              gst_percentage: gstPercentage,
              active: true,
              price: mrpExcl, // Use mrp_excl_gst as the base price
              stock_quantity: 0,
              description: '',
              units: 'pieces', // Default unit
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          }).filter(item => item.name && item.name.trim() !== ''); // Filter out empty rows

          setParsedExcelData(parsedData);
          setImportDialogOpen(true);
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        setSnackbar({
          open: true,
          message: 'Error parsing Excel file. Please check the file format.',
          severity: 'error'
        });
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset the input
    event.target.value = '';
  };

  const handleBulkImport = async () => {
    if (parsedExcelData.length === 0) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Please log in to import products');
      }

      // Get the profile ID for the current user (prefer admin profile)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('auth_user_id', user.id)
        .order('role', { ascending: false }) // admin comes before user
        .limit(1)
        .single();

      if (profileError || !profileData) {
        throw new Error('Profile not found. Please contact administrator.');
      }

      const profileId = profileData.id;
      
      const batchSize = 10; // Process in batches to avoid overwhelming the database
      const totalBatches = Math.ceil(parsedExcelData.length / batchSize);
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < totalBatches; i++) {
        const batch = parsedExcelData.slice(i * batchSize, (i + 1) * batchSize).map(product => ({
          ...product,
          user_id: profileId // Add user_id to each product
        }));
        
        try {
          const { data, error } = await supabase
            .from('product_master')
            .upsert(batch, { 
              onConflict: 'name,user_id',
              ignoreDuplicates: false 
            });

          if (error) {
            console.error('Batch import error:', error);
            errorCount += batch.length;
          } else {
            successCount += batch.length;
          }
        } catch (batchError) {
          console.error('Batch processing error:', batchError);
          errorCount += batch.length;
        }

        // Update progress
        const progress = ((i + 1) / totalBatches) * 100;
        setImportProgress(progress);
        
        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Show results
      if (successCount > 0) {
        setSnackbar({
          open: true,
          message: `Successfully imported ${successCount} products${errorCount > 0 ? ` (${errorCount} errors)` : ''}`,
          severity: successCount === parsedExcelData.length ? 'success' : 'warning'
        });
        
        // Refresh the products list
        await fetchProducts();
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to import products. Please check the data format.',
          severity: 'error'
        });
      }

    } catch (error) {
      console.error('Import error:', error);
      setSnackbar({
        open: true,
        message: 'Error during import process.',
        severity: 'error'
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      setImportDialogOpen(false);
      setParsedExcelData([]);
    }
  };

  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
    setParsedExcelData([]);
  };

  // Export handler
  const handleExportProducts = async () => {
    setIsExporting(true);
    try {
      // Prepare data for export (use filteredProducts for current view)
      const exportData = filteredProducts.map(product => ({
        'Name': product.name,
        'Category': product.category || '-',
        'HSN Code': product.hsn_code || '-',
        'GST %': product.gst_percentage ?? '',
        'Price (Excl. GST)': product.mrp_excl_gst ?? '',
        'MRP (Incl. GST)': product.mrp_incl_gst ?? '',
        'Stock Quantity': product.stock_quantity ?? '',
        'Product Type': product.product_type || '-',
        'Status': product.active ? 'Active' : 'Inactive',
        'Created At': product.created_at ? new Date(product.created_at).toLocaleString() : '',
        'Updated At': product.updated_at ? new Date(product.updated_at).toLocaleString() : '',
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Products');
      const fileName = `products_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to export products', severity: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Product Master
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchProducts}
            disabled={isLoading}
            size="small"
          >
            Refresh
          </Button>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            disabled={isLoading || isImporting}
            size="small"
          >
            Import Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
              style={{ display: 'none' }}
              aria-label="Upload Excel file"
            />
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportProducts}
            disabled={isLoading || isExporting || filteredProducts.length === 0}
            size="small"
          >
            {isExporting ? 'Exporting...' : 'Export Products'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            disabled={isLoading}
            size="small"
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 1.5, mb: 2, backgroundColor: 'grey.50' }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search Input */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search products, HSN, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm('')}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Category Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                {getUniqueCategories().map((category) => (
                  <MenuItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Sort By */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                label="Sort By"
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="category">Category</MenuItem>
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="stock">Stock</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* View Mode Toggle */}
          <Grid item xs={12} sm={6} md={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant={viewMode === 'table' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setViewMode('table')}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                <ViewListIcon />
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setViewMode('cards')}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                <ViewModuleIcon />
              </Button>
              <IconButton
                size="small"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {/* Results Summary */}
        <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredProducts.length} of {products.length} products
            {searchTerm && ` • Search: "${searchTerm}"`}
            {categoryFilter !== 'all' && ` • Category: ${categoryFilter}`}
            {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              View:
            </Typography>
            <Chip
              label={viewMode === 'table' ? 'Table' : 'Cards'}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {error}
        </Alert>
      )}

      {/* Content Area */}
      {viewMode === 'table' ? (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer 
            sx={{ 
              maxHeight: 'calc(100vh - 320px)', 
              overflow: 'auto',
              overflowX: 'scroll', // Force horizontal scrollbar to always show
              cursor: 'grab',
              '&:active': {
                cursor: 'grabbing'
              },
              // Enhanced scrollbar styling for better visibility
              '&::-webkit-scrollbar': {
                height: '12px',
                width: '12px'
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '6px',
                border: '1px solid #e0e0e0'
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'linear-gradient(45deg, #8baf3f 30%, #7da237 90%)',
                borderRadius: '6px',
                border: '1px solid #6d8c30',
                '&:hover': {
                  background: 'linear-gradient(45deg, #7da237 30%, #6d8c30 90%)',
                  transform: 'scale(1.1)'
                }
              },
              '&::-webkit-scrollbar-corner': {
                background: '#f1f1f1'
              },
              // For Firefox
              scrollbarWidth: 'thin',
              scrollbarColor: '#8baf3f #f1f1f1'
            }}
            onWheel={(e) => {
              // Enable horizontal scrolling with mouse wheel when shift is held
              if (e.shiftKey) {
                e.preventDefault();
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
          >
            <Table stickyHeader aria-label="products table" sx={{ minWidth: 1200 }} size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Name</StyledTableCell>
                  <StyledTableCell>Category</StyledTableCell>
                  <StyledTableCell>HSN Code</StyledTableCell>
                  <StyledTableCell align="right">GST %</StyledTableCell>
                  <StyledTableCell align="right">Price (Excl. GST)</StyledTableCell>
                  <StyledTableCell align="right">MRP (Incl. GST)</StyledTableCell>
                  <StyledTableCell align="right">Stock Quantity</StyledTableCell>
                  <StyledTableCell>Product Type</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell align="center">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((product) => (
                    <StyledTableRow 
                      key={product.id}
                      sx={{ 
                        backgroundColor: !product.active ? 'rgba(0, 0, 0, 0.04)' : 'inherit',
                        opacity: !product.active ? 0.7 : 1,
                        '& .MuiTableCell-root': {
                          padding: '6px 8px',
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap'
                        }
                      }}
                    >
                      <TableCell sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</TableCell>
                      <TableCell>{product.category || '-'}</TableCell>
                      <TableCell>{product.hsn_code || '-'}</TableCell>
                      <TableCell align="right">{product.gst_percentage || 0}%</TableCell>
                      <TableCell align="right">₹{product.mrp_excl_gst?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell align="right">₹{product.mrp_incl_gst?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell align="right">{product.stock_quantity || 0}</TableCell>
                      <TableCell>{product.product_type || '-'}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: product.active ? 'success.light' : 'error.light',
                            color: 'white',
                          }}
                        >
                          {product.active ? 'Active' : 'Inactive'}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                          <Tooltip title="Edit Product">
                            <IconButton 
                              size="small"
                              onClick={() => handleOpenEditDialog(product)}
                              sx={{
                                color: '#8baf3f',
                                '&:hover': {
                                  backgroundColor: 'rgba(139, 175, 63, 0.1)',
                                  color: '#7a9e36'
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="View Price History">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenHistoryDialog(product)}
                              sx={{
                                color: '#2196f3',
                                '&:hover': {
                                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                  color: '#1976d2'
                                }
                              }}
                            >
                              <HistoryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title={product.active ? "Deactivate Product" : "Activate Product"}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleActive(product)}
                              sx={{
                                color: product.active ? '#ff9800' : '#4caf50',
                                '&:hover': {
                                  backgroundColor: product.active ? 'rgba(255, 152, 0, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                                  color: product.active ? '#f57c00' : '#388e3c'
                                }
                              }}
                            >
                              {product.active ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Delete Product">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDeleteDialog(product)}
                              sx={{
                                color: '#dc3545',
                                '&:hover': {
                                  backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                  color: '#c82333'
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </StyledTableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Box>
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        No products found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Click "Add Product" to create your first product'
                        }
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
          <TablePagination
            rowsPerPageOptions={[25, 50, 100, 200]}
            component="div"
            count={filteredProducts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      ) : (
        /* Card View */
        <Box>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={40} />
            </Box>
          ) : filteredProducts.length > 0 ? (
            <>
              <Grid container spacing={2}>
                {filteredProducts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                      <Paper
                        sx={{
                          p: 2,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          backgroundColor: !product.active ? 'rgba(0, 0, 0, 0.04)' : 'inherit',
                          opacity: !product.active ? 0.7 : 1,
                          border: '1px solid',
                          borderColor: product.active ? 'success.light' : 'error.light',
                          '&:hover': {
                            boxShadow: 3,
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s'
                          }
                        }}
                      >
                        {/* Product Header */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, lineHeight: 1.2 }}>
                            {product.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip
                              label={product.active ? 'Active' : 'Inactive'}
                              size="small"
                              color={product.active ? 'success' : 'error'}
                              variant="outlined"
                            />
                            <Chip
                              label={product.category || 'General'}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        </Box>

                        {/* Product Details */}
                        <Box sx={{ flexGrow: 1, mb: 2 }}>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                HSN Code
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {product.hsn_code || '-'}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                GST %
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {product.gst_percentage || 0}%
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Price (Ex GST)
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                ₹{product.mrp_excl_gst?.toFixed(2) || '0.00'}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                MRP (Inc GST)
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                ₹{product.mrp_incl_gst?.toFixed(2) || '0.00'}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Stock
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {product.stock_quantity || 0}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Type
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {product.product_type || '-'}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>

                        {/* Actions */}
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                          <Tooltip title="Edit Product">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditDialog(product)}
                              sx={{ color: 'primary.main' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Price History">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenHistoryDialog(product)}
                              sx={{ color: 'info.main' }}
                            >
                              <HistoryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={product.active ? "Deactivate Product" : "Activate Product"}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleActive(product)}
                              sx={{ color: product.active ? 'warning.main' : 'success.main' }}
                            >
                              {product.active ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Product">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDeleteDialog(product)}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
              </Grid>
              
              {/* Pagination for Cards */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <TablePagination
                  rowsPerPageOptions={[8, 12, 24, 48]}
                  component="div"
                  count={filteredProducts.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Cards per page:"
                />
              </Box>
            </>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No products found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Click "Add Product" to create your first product'
                }
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
              >
                Add Product
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              {isEditing ? (
                <TextField
                  name="name"
                  label="Product Name *"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              ) : (
                <Autocomplete
                  options={purchases}
                  getOptionLabel={(option) => typeof option === 'string' ? option : option.product_name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="name"
                      label="Product Name *"
                      fullWidth
                      required
                      error={!formData.name}
                      helperText={!formData.name ? "Product name is required" : "Select from purchase history or enter new"}
                      onChange={handleProductNameInput}
                      value={formData.name}
                    />
                  )}
                  onChange={(event, newValue) => handleProductFromPurchaseHistorySelect(newValue)}
                  isOptionEqualToValue={(option, value) => {
                    if (typeof option === 'string' && typeof value === 'string') {
                      return option === value;
                    }
                    if (typeof option === 'object' && typeof value === 'object') {
                      return option.product_name === value.product_name;
                    }
                    return false;
                  }}
                  loading={isLoadingPurchases}
                  freeSolo
                />
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="hsn_code"
                label="HSN Code *"
                value={formData.hsn_code}
                onChange={handleInputChange}
                fullWidth
                required
                InputProps={{
                  readOnly: formData.fromPurchaseHistory
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="gst_percentage"
                label="GST Percentage *"
                type="number"
                value={formData.gst_percentage}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { min: 0, max: 100, step: 0.01 },
                  readOnly: formData.fromPurchaseHistory
                }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="mrp_excl_gst"
                label="Price (Excl. GST) *"
                type="number"
                value={formData.mrp_excl_gst}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 }
                }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="mrp_incl_gst"
                label="MRP (Incl. GST) *"
                type="number"
                value={formData.mrp_incl_gst}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 }
                }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="category"
                label="Category"
                value={formData.category}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="product_type"
                label="Product Type"
                value={formData.product_type || ''}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="active"
                    checked={formData.active}
                    onChange={handleCheckboxChange}
                    color="primary"
                  />
                }
                label="Active"
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the product "{productToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteProduct} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Price History Dialog */}
      <Dialog open={historyDialogOpen} onClose={handleCloseHistoryDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <HistoryIcon />
            Price History for {selectedProductForHistory?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Date & Time</strong></TableCell>
                  <TableCell align="center"><strong>MRP (Incl. GST)</strong></TableCell>
                  <TableCell align="center"><strong>MRP (Excl. GST)</strong></TableCell>
                  <TableCell align="center"><strong>GST %</strong></TableCell>
                  <TableCell><strong>Source</strong></TableCell>
                  <TableCell><strong>Reference</strong></TableCell>
                  <TableCell><strong>Notes</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {priceHistory.length > 0 ? (
                  priceHistory.map((entry) => {
                    const inclGstChange = entry.new_mrp_incl_gst - entry.old_mrp_incl_gst;
                    const exclGstChange = (entry.new_mrp_excl_gst || 0) - (entry.old_mrp_excl_gst || 0);
                    const gstChange = (entry.new_gst_percentage || 0) - (entry.old_gst_percentage || 0);
                    
                    return (
                      <TableRow key={entry.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(entry.changed_at).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(entry.changed_at).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              ₹{entry.old_mrp_incl_gst.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              ₹{entry.new_mrp_incl_gst.toFixed(2)}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color={inclGstChange > 0 ? 'success.main' : inclGstChange < 0 ? 'error.main' : 'text.secondary'}
                            >
                              {inclGstChange > 0 ? '+' : ''}₹{inclGstChange.toFixed(2)}
                              {inclGstChange > 0 ? ' 📈' : inclGstChange < 0 ? ' 📉' : ' ➖'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              ₹{(entry.old_mrp_excl_gst || 0).toFixed(2)}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              ₹{(entry.new_mrp_excl_gst || 0).toFixed(2)}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color={exclGstChange > 0 ? 'success.main' : exclGstChange < 0 ? 'error.main' : 'text.secondary'}
                            >
                              {exclGstChange > 0 ? '+' : ''}₹{exclGstChange.toFixed(2)}
                              {exclGstChange > 0 ? ' 📈' : exclGstChange < 0 ? ' 📉' : ' ➖'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {(entry.old_gst_percentage || 0).toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {(entry.new_gst_percentage || 0).toFixed(1)}%
                            </Typography>
                            {gstChange !== 0 && (
                              <Typography 
                                variant="caption" 
                                color={gstChange > 0 ? 'success.main' : 'error.main'}
                              >
                                {gstChange > 0 ? '+' : ''}{gstChange.toFixed(1)}%
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={entry.source_of_change.replace(/_/g, ' ')} 
                            size="small" 
                            color={entry.source_of_change.includes('edit') ? 'warning' : 'primary'}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {entry.reference_id || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {entry.notes || 'No additional notes'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box py={3}>
                        <Typography variant="body2" color="text.secondary">
                          No price history found for this product.
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Price changes will be automatically tracked when you edit purchase transactions.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog} variant="outlined">
                      Close
        </Button>
      </DialogActions>
    </Dialog>

    {/* Excel Import Preview Dialog */}
    <Dialog open={importDialogOpen} onClose={handleCloseImportDialog} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <CloudUploadIcon />
          Import Products from Excel ({parsedExcelData.length} products found)
        </Box>
      </DialogTitle>
      <DialogContent>
        {isImporting && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Importing products... ({Math.round(importProgress)}%)
            </Typography>
            <LinearProgress variant="determinate" value={importProgress} />
          </Box>
        )}
        
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Preview of products to be imported. This will update existing products with the same name.
        </Typography>
        
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Product Name</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell align="right"><strong>MRP (Incl. GST)</strong></TableCell>
                <TableCell align="right"><strong>MRP (Excl. GST)</strong></TableCell>
                <TableCell><strong>HSN Code</strong></TableCell>
                <TableCell><strong>Product Type</strong></TableCell>
                <TableCell align="right"><strong>GST %</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parsedExcelData.slice(0, 10).map((product, index) => (
                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell align="right">₹{product.mrp_incl_gst.toFixed(2)}</TableCell>
                  <TableCell align="right">₹{product.mrp_excl_gst.toFixed(2)}</TableCell>
                  <TableCell>{product.hsn_code}</TableCell>
                  <TableCell>{product.product_type}</TableCell>
                  <TableCell align="right">{product.gst_percentage}%</TableCell>
                </TableRow>
              ))}
              {parsedExcelData.length > 10 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                    ... and {parsedExcelData.length - 10} more products
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseImportDialog} disabled={isImporting}>
          Cancel
        </Button>
        <Button 
          onClick={handleBulkImport} 
          variant="contained" 
          disabled={isImporting || parsedExcelData.length === 0}
          startIcon={isImporting ? <CircularProgress size={20} /> : <UploadIcon />}
        >
          {isImporting ? 'Importing...' : `Import ${parsedExcelData.length} Products`}
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
);
} 
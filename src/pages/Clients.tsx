import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  InputAdornment,
  Alert,
  DialogContentText,
  Pagination,
  Stack,
  useTheme,
  useMediaQuery,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  CalendarToday as CalendarTodayIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  CreditCard as CreditCardIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Event as EventIcon,
  FileDownload as FileDownloadIcon,
  History as HistoryIcon,
  PersonAdd as PersonAddIcon,
  Print as PrintIcon,
  Receipt as ReceiptIcon,
  Search as SearchIcon,
  Wc as WcIcon,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { useClients, Client } from '../hooks/clients/useClients';
import { useOrders } from '../hooks/orders/useOrders';
import { useClientPaymentHistory } from '../hooks/clients/useClientPaymentHistory'; // Import the new hook
import { formatCurrency } from '../utils/formatting/format';
import { toast } from 'react-toastify';
import { salonConfig } from '../config/salonConfig';
import { isValidPhoneNumber, isValidEmail } from '../utils/validation';
import { PaymentMethod } from '../hooks/orders/usePOS';
import ScrollIndicator from '../components/common/ScrollIndicator';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Form data type
interface ClientFormData {
  full_name: string;
  phone: string;
  email: string;
  notes: string;
  gender: string;
  birth_date: string;
  anniversary_date: string;
  pending_payment_receiving_date: string;
}

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Function to generate payment receipt HTML
function generatePaymentReceiptHtml(transaction: {
  amount: number;
  clientName: string;
  remainingBalance: number;
  paymentDate: string;
}): string {
  const transactionId = `PMT-${Date.now().toString().slice(-8)}`;
  const receiptDate = new Date().toLocaleString('en-IN');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Receipt - ${salonConfig.name}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          background: #fff;
        }
        .receipt {
          border: 2px solid #27ae60;
          border-radius: 10px;
          padding: 30px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #27ae60;
          padding-bottom: 20px;
        }
        .salon-name {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #2c3e50;
        }
        .salon-details {
          font-size: 12px;
          margin: 3px 0;
          color: #555;
        }
        .receipt-title {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
          color: #27ae60;
          text-transform: uppercase;
          letter-spacing: 1px;
          background: #d5f4e6;
          padding: 15px;
          border-radius: 8px;
        }
        .payment-details {
          background: #fff;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin: 15px 0;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          color: #2c3e50;
          font-size: 16px;
        }
        .detail-value {
          font-weight: 500;
          color: #27ae60;
          font-size: 16px;
        }
        .amount-paid {
          background: #27ae60;
          color: white;
          padding: 8px 15px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 18px;
        }
        .remaining-balance {
          background: ${transaction.remainingBalance > 0 ? '#f39c12' : '#27ae60'};
          color: white;
          padding: 8px 15px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 18px;
        }
        .summary-box {
          background: #e8f5e8;
          border: 2px solid #27ae60;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .transaction-id {
          font-family: monospace;
          background: #f8f9fa;
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #ddd;
          font-size: 14px;
          display: inline-block;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          border-top: 1px dashed #bdc3c7;
          padding-top: 20px;
          color: #7f8c8d;
        }
        .thank-you {
          font-size: 20px;
          font-weight: bold;
          color: #27ae60;
          text-align: center;
          margin: 20px 0;
          background: #d5f4e6;
          padding: 15px;
          border-radius: 8px;
        }
        @media print {
          body {
            margin: 0;
            padding: 10px;
          }
          .receipt {
            border: 1px solid #27ae60;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="salon-name">${salonConfig.name}</div>
          <div class="salon-details">${salonConfig.address.line1}</div>
          <div class="salon-details">${salonConfig.address.line2}, ${salonConfig.address.state} - ${salonConfig.address.pincode}</div>
          <div class="salon-details">📞 ${salonConfig.contact.phone}</div>
          <div class="salon-details">📧 ${salonConfig.contact.email}</div>
          <div class="salon-details"><strong>GSTIN:</strong> ${salonConfig.gst.number}</div>
        </div>
        
        <div class="receipt-title">💳 Payment Receipt</div>
        
        <div class="payment-details">
          <div class="detail-row">
            <span class="detail-label">Client Name:</span>
            <span class="detail-value">${transaction.clientName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Date:</span>
            <span class="detail-value">${new Date(transaction.paymentDate).toLocaleDateString('en-IN')}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount Paid:</span>
            <span class="amount-paid">₹${transaction.amount.toFixed(2)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Remaining Balance:</span>
            <span class="remaining-balance">₹${transaction.remainingBalance.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="summary-box">
          <div style="font-size: 18px; font-weight: bold; color: #27ae60; margin-bottom: 10px;">
            Transaction Summary
          </div>
          <div style="margin: 10px 0;">
            <strong>Transaction ID:</strong><br>
            <span class="transaction-id">${transactionId}</span>
          </div>
          <div style="margin: 10px 0; font-size: 14px; color: #666;">
            Receipt generated on: ${receiptDate}
          </div>
        </div>
        
        <div class="thank-you">
          🎉 Thank you for your payment!
        </div>
        
        <div class="footer">
          <div><strong>Business Hours:</strong> ${salonConfig.business.hours}</div>
          <div><strong>Open:</strong> ${salonConfig.business.workingDays}</div>
          <div>📍 ${salonConfig.contact.website}</div>
          <div>📱 Follow us: ${salonConfig.social.instagram}</div>
          
          <div style="margin-top: 15px; font-size: 11px; color: #95a5a6;">
            • This is a computer generated receipt<br>
            • Thank you for choosing ${salonConfig.name}<br>
            • Keep this receipt for your records
          </div>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() {
            window.close();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;
}

// Function to generate bill receipt HTML (for payment history)
function generateBillReceiptHtml(transaction: {
  amount: number;
  clientName: string;
  remainingBalance: number;
  paymentDate: string;
  paymentMethod: string;
  details: string;
  receiptType: string;
}): string {
  const transactionId = `BILL-${Date.now().toString().slice(-8)}`;
  const receiptDate = new Date().toLocaleString('en-IN');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${transaction.receiptType === 'Bill Paid' ? 'Service Bill' : 'Payment'} Receipt - ${salonConfig.name}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          background: #fff;
        }
        .receipt {
          border: 2px solid #27ae60;
          border-radius: 10px;
          padding: 30px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #27ae60;
          padding-bottom: 20px;
        }
        .salon-name {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #2c3e50;
        }
        .salon-details {
          font-size: 12px;
          margin: 3px 0;
          color: #555;
        }
        .receipt-title {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
          color: #27ae60;
          text-transform: uppercase;
          letter-spacing: 1px;
          background: #d5f4e6;
          padding: 15px;
          border-radius: 8px;
        }
        .payment-details {
          background: #fff;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin: 15px 0;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          color: #2c3e50;
          font-size: 16px;
        }
        .detail-value {
          font-weight: 500;
          color: #27ae60;
          font-size: 16px;
        }
        .amount-paid {
          background: #27ae60;
          color: white;
          padding: 8px 15px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 18px;
        }
        .services-details {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
          border-left: 4px solid #27ae60;
        }
        .summary-box {
          background: #e8f5e8;
          border: 2px solid #27ae60;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .transaction-id {
          font-family: monospace;
          background: #f8f9fa;
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #ddd;
          font-size: 14px;
          display: inline-block;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          border-top: 1px dashed #bdc3c7;
          padding-top: 20px;
          color: #7f8c8d;
        }
        .thank-you {
          font-size: 20px;
          font-weight: bold;
          color: #27ae60;
          text-align: center;
          margin: 20px 0;
          background: #d5f4e6;
          padding: 15px;
          border-radius: 8px;
        }
        @media print {
          body {
            margin: 0;
            padding: 10px;
          }
          .receipt {
            border: 1px solid #27ae60;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="salon-name">${salonConfig.name}</div>
          <div class="salon-details">${salonConfig.address.line1}</div>
          <div class="salon-details">${salonConfig.address.line2}, ${salonConfig.address.state} - ${salonConfig.address.pincode}</div>
          <div class="salon-details">📞 ${salonConfig.contact.phone}</div>
          <div class="salon-details">📧 ${salonConfig.contact.email}</div>
          <div class="salon-details"><strong>GSTIN:</strong> ${salonConfig.gst.number}</div>
        </div>
        
        <div class="receipt-title">
          ${transaction.receiptType === 'Bill Paid' ? '🧾 Service Bill Receipt' : '💳 Payment Receipt'}
        </div>
        
        <div class="payment-details">
          <div class="detail-row">
            <span class="detail-label">Client Name:</span>
            <span class="detail-value">${transaction.clientName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">${transaction.receiptType === 'Bill Paid' ? 'Service Date:' : 'Payment Date:'}</span>
            <span class="detail-value">${new Date(transaction.paymentDate).toLocaleDateString('en-IN')}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount:</span>
            <span class="amount-paid">₹${transaction.amount.toFixed(2)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Method:</span>
            <span class="detail-value">${transaction.paymentMethod}</span>
          </div>
        </div>
        
        ${
          transaction.receiptType === 'Bill Paid'
            ? `
        <div class="services-details">
          <div style="font-weight: bold; color: #2c3e50; margin-bottom: 10px;">Services/Products:</div>
          <div style="color: #555;">${transaction.details}</div>
        </div>
        `
            : ''
        }
        
        <div class="summary-box">
          <div style="font-size: 18px; font-weight: bold; color: #27ae60; margin-bottom: 10px;">
            ${transaction.receiptType === 'Bill Paid' ? 'Bill Summary' : 'Payment Summary'}
          </div>
          <div style="margin: 10px 0;">
            <strong>Receipt ID:</strong><br>
            <span class="transaction-id">${transactionId}</span>
          </div>
          <div style="margin: 10px 0; font-size: 14px; color: #666;">
            Receipt generated on: ${receiptDate}
          </div>
        </div>
        
        <div class="thank-you">
          ${transaction.receiptType === 'Bill Paid' ? '✨ Thank you for choosing our services!' : '🎉 Thank you for your payment!'}
        </div>
        
        <div class="footer">
          <div><strong>Business Hours:</strong> ${salonConfig.business.hours}</div>
          <div><strong>Open:</strong> ${salonConfig.business.workingDays}</div>
          <div>📍 ${salonConfig.contact.website}</div>
          <div>📱 Follow us: ${salonConfig.social.instagram}</div>
          
          <div style="margin-top: 15px; font-size: 11px; color: #95a5a6;">
            • This is a computer generated receipt<br>
            • Thank you for choosing ${salonConfig.name}<br>
            • Keep this receipt for your records
          </div>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() {
            window.close();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;
}

export default function Clients() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 50;

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 350);
  const {
    clients,
    totalClientsCount,
    isLoading,
    refetchAllClients,
    createClient,
    updateClient,
    processPendingPayment,
    processPendingPaymentAsync,
    deleteClient,
  } = useClients(page, pageSize, debouncedSearchQuery);
  const { orders, isLoading: isLoadingOrders } = useOrders();

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false); // State for history dialog
  const [openReceiptDialog, setOpenReceiptDialog] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<{
    amount: number;
    clientName: string;
    remainingBalance: number;
    paymentDate: string;
  } | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Form state
  const [formData, setFormData] = useState<ClientFormData>({
    full_name: '',
    phone: '',
    email: '',
    notes: '',
    gender: '',
    birth_date: '',
    anniversary_date: '',
    pending_payment_receiving_date: '',
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({
    full_name: '',
    phone: '',
    email: '',
  });

  // Real-time duplicate checking state
  const [duplicateChecking, setDuplicateChecking] = useState({
    name: false,
    phone: false,
    email: false,
  });
  const [duplicateErrors, setDuplicateErrors] = useState({
    name: '',
    phone: '',
    email: '',
  });

  // Check for duplicate name
  const checkDuplicateName = useCallback(
    async (name: string) => {
      if (!name.trim()) return;

      setDuplicateChecking(prev => ({ ...prev, name: true }));
      try {
        const normalizedName = name.trim().toLowerCase();
        const { data } = await supabase
          .from('clients')
          .select('id, full_name')
          .ilike('full_name', normalizedName)
          .limit(1);

        if (data && data.length > 0) {
          // If editing, exclude current client from duplicate check
          if (!selectedClient || data[0].id !== selectedClient.id) {
            setDuplicateErrors(prev => ({
              ...prev,
              name: `Client with name "${data[0].full_name}" already exists`,
            }));
          } else {
            setDuplicateErrors(prev => ({ ...prev, name: '' }));
          }
        } else {
          setDuplicateErrors(prev => ({ ...prev, name: '' }));
        }
      } catch (error) {
        console.error('Error checking duplicate name:', error);
      } finally {
        setDuplicateChecking(prev => ({ ...prev, name: false }));
      }
    },
    [selectedClient]
  );

  // Check for duplicate phone
  const checkDuplicatePhone = useCallback(
    async (phone: string) => {
      if (!phone.trim()) return;

      setDuplicateChecking(prev => ({ ...prev, phone: true }));
      try {
        const { data } = await supabase
          .from('clients')
          .select('id, full_name, phone')
          .eq('phone', phone.trim())
          .limit(1);

        if (data && data.length > 0) {
          // If editing, exclude current client from duplicate check
          if (!selectedClient || data[0].id !== selectedClient.id) {
            setDuplicateErrors(prev => ({
              ...prev,
              phone: `Phone number is already registered to "${data[0].full_name}"`,
            }));
          } else {
            setDuplicateErrors(prev => ({ ...prev, phone: '' }));
          }
        } else {
          setDuplicateErrors(prev => ({ ...prev, phone: '' }));
        }
      } catch (error) {
        console.error('Error checking duplicate phone:', error);
      } finally {
        setDuplicateChecking(prev => ({ ...prev, phone: false }));
      }
    },
    [selectedClient]
  );

  // Check for duplicate email
  const checkDuplicateEmail = useCallback(
    async (email: string) => {
      if (!email.trim()) return;

      setDuplicateChecking(prev => ({ ...prev, email: true }));
      try {
        const normalizedEmail = email.trim().toLowerCase();
        const { data } = await supabase
          .from('clients')
          .select('id, full_name, email')
          .ilike('email', normalizedEmail)
          .limit(1);

        if (data && data.length > 0) {
          // If editing, exclude current client from duplicate check
          if (!selectedClient || data[0].id !== selectedClient.id) {
            setDuplicateErrors(prev => ({
              ...prev,
              email: `Email is already registered to "${data[0].full_name}"`,
            }));
          } else {
            setDuplicateErrors(prev => ({ ...prev, email: '' }));
          }
        } else {
          setDuplicateErrors(prev => ({ ...prev, email: '' }));
        }
      } catch (error) {
        console.error('Error checking duplicate email:', error);
      } finally {
        setDuplicateChecking(prev => ({ ...prev, email: false }));
      }
    },
    [selectedClient]
  );

  // Debounced duplicate checking
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.full_name) {
        checkDuplicateName(formData.full_name);
      } else {
        setDuplicateErrors(prev => ({ ...prev, name: '' }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.full_name, checkDuplicateName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.phone) {
        checkDuplicatePhone(formData.phone);
      } else {
        setDuplicateErrors(prev => ({ ...prev, phone: '' }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.phone, checkDuplicatePhone]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email) {
        checkDuplicateEmail(formData.email);
      } else {
        setDuplicateErrors(prev => ({ ...prev, email: '' }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.email, checkDuplicateEmail]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is being edited
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {
      full_name: '',
      phone: '',
      email: '',
    };
    let isValid = true;

    // Validate full name
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
      isValid = false;
    } else if (duplicateErrors.name) {
      errors.full_name = duplicateErrors.name;
      isValid = false;
    }

    // Validate phone
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!isValidPhoneNumber(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
      isValid = false;
    } else if (duplicateErrors.phone) {
      errors.phone = duplicateErrors.phone;
      isValid = false;
    }

    // Validate email if provided
    if (formData.email && !isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    } else if (duplicateErrors.email) {
      errors.email = duplicateErrors.email;
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle search with debouncing to reset to page 1
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalClientsCount / pageSize);

  // Export clients to Excel
  const exportToExcel = async () => {
    try {
      // First fetch all clients for export
      const { data } = await refetchAllClients();
      const clientsToExport = data?.clients || clients; // Use 'clients' from the hook

      if (!clientsToExport || clientsToExport.length === 0) {
        toast.error('No client data to export');
        return;
      }

      // Sort clients in ascending order (oldest first) for export
      const sortedClients = [...clientsToExport].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      // Prepare data for Excel export
      const exportData = sortedClients.map((client, index) => {
        // Calculate lifetime visits for each client
        const lifetimeVisits =
          orders?.filter(
            order =>
              ((order as any).client_name === client.full_name ||
                (order as any).customer_name === client.full_name) &&
              (order as any).status !== 'cancelled' &&
              !(order as any).consumption_purpose &&
              (order as any).client_name !== 'Salon Consumption'
          ).length || 0;

        return {
          'S.No.': index + 1,
          Name: client.full_name,
          Phone: client.phone,
          Email: client.email || '',
          Gender: client.gender || '',
          'Birth Date': client.birth_date
            ? new Date(client.birth_date).toLocaleDateString()
            : '',
          'Anniversary Date': client.anniversary_date
            ? new Date(client.anniversary_date).toLocaleDateString()
            : '',
          'Last Visit': client.last_visit
            ? new Date(client.last_visit).toLocaleDateString()
            : 'Never',
          'Lifetime Visits': lifetimeVisits,
          'Total Spent (₹)': client.total_spent,
          'Pending Payment (₹)': client.pending_payment || 0,
          'Pending Payment Receiving Date':
            client.pending_payment_receiving_date
              ? new Date(
                  client.pending_payment_receiving_date
                ).toLocaleDateString()
              : '',
          Notes: client.notes || '',
        };
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const columnWidths = [
        { wch: 8 }, // S.No.
        { wch: 20 }, // Name
        { wch: 15 }, // Phone
        { wch: 25 }, // Email
        { wch: 10 }, // Gender
        { wch: 12 }, // Birth Date
        { wch: 15 }, // Anniversary Date
        { wch: 12 }, // Last Visit
        { wch: 15 }, // Lifetime Visits
        { wch: 15 }, // Total Spent
        { wch: 18 }, // Pending Payment
        { wch: 20 }, // Payment Received Date
        { wch: 30 }, // Notes
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `Clients_Export_${currentDate}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, filename);
      toast.success(`Client data exported successfully as ${filename}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export client data');
    }
  };

  // Handle add client
  const handleAddClient = async () => {
    if (!validateForm()) {
      return;
    }

    await createClient({
      ...formData,
      birth_date: formData.birth_date || null,
      anniversary_date: formData.anniversary_date || null,
      pending_payment_receiving_date:
        formData.pending_payment_receiving_date || null,
    });
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      notes: '',
      gender: '',
      birth_date: '',
      anniversary_date: '',
      pending_payment_receiving_date: '',
    });
    setOpenAddDialog(false);
  };

  // Handle edit client
  const handleEditClient = async () => {
    if (!selectedClient) return;

    if (!validateForm()) {
      return;
    }

    await updateClient({
      id: selectedClient.id,
      ...formData,
      pending_payment_receiving_date:
        formData.pending_payment_receiving_date || null,
    });

    setSelectedClient(null);
    setOpenEditDialog(false);
  };

  // Open edit dialog with client data
  const handleOpenEditDialog = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      full_name: client.full_name,
      phone: client.phone,
      email: client.email || '',
      notes: client.notes || '',
      gender: client.gender || '',
      birth_date: client.birth_date || '',
      anniversary_date: client.anniversary_date || '',
      pending_payment_receiving_date:
        client.pending_payment_receiving_date || '',
    });
    // Clear any previous errors
    setFormErrors({
      full_name: '',
      phone: '',
      email: '',
    });
    setOpenEditDialog(true);
  };

  // Reset form and errors when opening add dialog
  const handleOpenAddDialog = () => {
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      notes: '',
      gender: '',
      birth_date: '',
      anniversary_date: '',
      pending_payment_receiving_date: '',
    });
    setFormErrors({
      full_name: '',
      phone: '',
      email: '',
    });
    setOpenAddDialog(true);
  };

  // Open payment dialog for BNPL
  const handleOpenPaymentDialog = (client: Client) => {
    setSelectedClient(client);
    setPaymentAmount(client.pending_payment || 0);
    setPaymentDate(new Date().toISOString().split('T')[0]); // Reset to today's date
    setOpenPaymentDialog(true);
  };

  // Process pending payment
  const handleProcessPayment = async () => {
    if (!selectedClient) return;

    try {
      const result = await processPendingPaymentAsync({
        clientId: selectedClient.id,
        amount: paymentAmount,
        paymentMethod: paymentMethod as any,
        paymentDate: paymentDate,
      });

      if (result.success) {
        setLastTransaction({
          amount: paymentAmount,
          clientName: selectedClient.full_name,
          remainingBalance: result.updatedClient.pending_payment,
          paymentDate: paymentDate,
        });
        setOpenReceiptDialog(true);
      }
    } catch (error) {
      // Error is already handled by the hook's onError, but you could add more here
    }

    setSelectedClient(null);
    setPaymentAmount(0);
    setOpenPaymentDialog(false);
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (client: Client) => {
    setSelectedClient(client);
    setOpenDeleteDialog(true);
  };

  // Open payment history dialog
  const handleOpenHistoryDialog = (client: Client) => {
    setSelectedClient(client);
    setOpenHistoryDialog(true);
  };

  // Handle delete client
  const handleDeleteClient = async () => {
    if (!selectedClient) {
      console.error('No client selected for deletion');
      return;
    }

    try {
      console.log(
        'Attempting to delete client:',
        selectedClient.id,
        selectedClient.full_name
      );

      // Call the deleteClient function from the hook
      await deleteClient(selectedClient.id);

      console.log('Client deletion successful');
      setSelectedClient(null);
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error in handleDeleteClient:', error);
      // Keep the dialog open so user can see the error
      toast.error(
        `Failed to delete client: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  if (isLoading || isLoadingOrders) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        height='100vh'
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Scroll Indicator - tracks window scroll progress */}
      <ScrollIndicator
        showScrollToTop={true}
        color='primary'
        height={4}
        position='top'
        showPercentage={true}
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          p: 2,
          borderRadius: 2,
          boxShadow: 2,
          background: theme => theme.palette.background.paper,
        }}
      >
        <Box>
          <Typography
            variant='h1'
            sx={{ fontSize: 28, fontWeight: 700, mb: 0.5 }}
          >
            Clients
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Showing {clients?.length || 0} of {totalClientsCount} total clients
            {searchQuery && ` (filtered by "${searchQuery}")`}
          </Typography>
          <Typography
            variant='caption'
            color='success.main'
            sx={{ display: 'block', mt: 0.5 }}
          >
            ✨ Serial numbers are based on current page (page {page}:{' '}
            {(page - 1) * pageSize + 1}-
            {Math.min(page * pageSize, totalClientsCount)})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <MuiTooltip
            title={`Export all ${totalClientsCount} clients to Excel`}
          >
            <Button
              variant='outlined'
              startIcon={<FileDownloadIcon />}
              onClick={exportToExcel}
              sx={{ height: 'fit-content', borderRadius: 2, boxShadow: 1 }}
              disabled={totalClientsCount === 0}
            >
              Export All ({totalClientsCount})
            </Button>
          </MuiTooltip>
          <Button
            variant='contained'
            startIcon={<PersonAddIcon />}
            onClick={handleOpenAddDialog}
            sx={{
              height: 'fit-content',
              borderRadius: 2,
              boxShadow: 2,
              fontWeight: 700,
              background: theme => theme.palette.primary.main,
              color: '#fff',
              '&:hover': { background: theme => theme.palette.primary.dark },
            }}
          >
            Add Client
          </Button>
        </Box>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        variant='outlined'
        placeholder='Search clients by name, phone, or email...'
        value={searchQuery}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon />
            </InputAdornment>
          ),
          sx: {
            background: theme => theme.palette.background.paper,
            borderRadius: 2,
            boxShadow: 1,
            fontSize: 15,
            py: 1,
          },
        }}
        sx={{ mb: 3 }}
      />

      {/* Clients Table */}
      <Paper
        sx={{
          p: 1,
          overflowX: 'auto',
          borderRadius: 3,
          boxShadow: 3,
          background: theme => theme.palette.background.paper,
        }}
      >
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
            }}
          >
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>Loading all clients...</Typography>
          </Box>
        )}
        {clients && clients.length > 0 ? (
          <Table size='small' stickyHeader>
            <TableHead>
              <TableRow sx={{ background: theme => theme.palette.grey[100] }}>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    px: 1,
                    background: theme => theme.palette.background.paper,
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  S.No.
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    px: 1,
                    background: theme => theme.palette.background.paper,
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    px: 1,
                    background: theme => theme.palette.background.paper,
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  Contact
                </TableCell>
                {!isSmallScreen && (
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      px: 1,
                      background: theme => theme.palette.background.paper,
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    Last Visit
                  </TableCell>
                )}
                {!isSmallScreen && (
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      px: 1,
                      background: theme => theme.palette.background.paper,
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    Gender
                  </TableCell>
                )}
                {!isSmallScreen && (
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      px: 1,
                      background: theme => theme.palette.background.paper,
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    Birth Date
                  </TableCell>
                )}
                {!isSmallScreen && (
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      px: 1,
                      background: theme => theme.palette.background.paper,
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    Anniversary
                  </TableCell>
                )}
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    px: 1,
                    background: theme => theme.palette.background.paper,
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  Lifetime Visits
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    px: 1,
                    background: theme => theme.palette.background.paper,
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  Total Spent
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    px: 1,
                    background: theme => theme.palette.background.paper,
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  Pending Payment
                </TableCell>
                {!isSmallScreen && (
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      px: 1,
                      background: theme => theme.palette.background.paper,
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    Payment Received Date
                  </TableCell>
                )}
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    px: 1,
                    background: theme => theme.palette.background.paper,
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client, index) => {
                const lifetimeVisits =
                  orders?.filter(
                    order =>
                      ((order as any).client_name === client.full_name ||
                        (order as any).customer_name === client.full_name) &&
                      (order as any).status !== 'cancelled' &&
                      !(order as any).consumption_purpose &&
                      (order as any).client_name !== 'Salon Consumption'
                  ).length || 0;
                const serialNumber = (page - 1) * pageSize + index + 1;
                return (
                  <TableRow
                    key={client.id}
                    sx={{
                      '&:nth-of-type(odd)': {
                        background: theme => theme.palette.action.hover,
                      },
                      '&:hover': {
                        background: theme => theme.palette.action.selected,
                      },
                      '& td': {
                        px: 1,
                        py: 0.5,
                        fontSize: 13,
                        maxWidth: 160,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      },
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    <TableCell>
                      <MuiTooltip title={serialNumber} arrow>
                        <span>{serialNumber}</span>
                      </MuiTooltip>
                    </TableCell>
                    <TableCell>
                      <MuiTooltip title={client.full_name} arrow>
                        <span>{client.full_name}</span>
                      </MuiTooltip>
                    </TableCell>
                    <TableCell>
                      <MuiTooltip title={client.phone} arrow>
                        <Typography variant='body2' sx={{ fontSize: 13 }}>
                          {client.phone}
                        </Typography>
                      </MuiTooltip>
                      {client.email && (
                        <MuiTooltip title={client.email} arrow>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{ fontSize: 11, wordBreak: 'break-all' }}
                          >
                            {client.email}
                          </Typography>
                        </MuiTooltip>
                      )}
                    </TableCell>
                    {!isSmallScreen && (
                      <TableCell>
                        <MuiTooltip
                          title={
                            client.last_visit
                              ? new Date(client.last_visit).toLocaleDateString()
                              : 'Never'
                          }
                          arrow
                        >
                          <span>
                            {client.last_visit
                              ? new Date(client.last_visit).toLocaleDateString()
                              : 'Never'}
                          </span>
                        </MuiTooltip>
                      </TableCell>
                    )}
                    {!isSmallScreen && (
                      <TableCell>
                        <MuiTooltip title={client.gender || '-'} arrow>
                          <span>{client.gender || '-'}</span>
                        </MuiTooltip>
                      </TableCell>
                    )}
                    {!isSmallScreen && (
                      <TableCell>
                        <MuiTooltip
                          title={
                            client.birth_date
                              ? new Date(client.birth_date).toLocaleDateString()
                              : '-'
                          }
                          arrow
                        >
                          <span>
                            {client.birth_date
                              ? new Date(client.birth_date).toLocaleDateString()
                              : '-'}
                          </span>
                        </MuiTooltip>
                      </TableCell>
                    )}
                    {!isSmallScreen && (
                      <TableCell>
                        <MuiTooltip
                          title={
                            client.anniversary_date
                              ? new Date(
                                  client.anniversary_date
                                ).toLocaleDateString()
                              : '-'
                          }
                          arrow
                        >
                          <span>
                            {client.anniversary_date
                              ? new Date(
                                  client.anniversary_date
                                ).toLocaleDateString()
                              : '-'}
                          </span>
                        </MuiTooltip>
                      </TableCell>
                    )}
                    <TableCell>
                      <MuiTooltip title={lifetimeVisits} arrow>
                        <span>{lifetimeVisits}</span>
                      </MuiTooltip>
                    </TableCell>
                    <TableCell>
                      <Typography
                        color='success.main'
                        fontWeight='bold'
                        sx={{ fontSize: 13 }}
                      >
                        {formatCurrency(client.total_spent)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {client.pending_payment > 0 ? (
                        <Chip
                          label={formatCurrency(client.pending_payment)}
                          color='warning'
                          size='small'
                          onClick={() => handleOpenPaymentDialog(client)}
                        />
                      ) : (
                        <Typography
                          color='text.secondary'
                          sx={{ fontSize: 12 }}
                        >
                          No pending
                        </Typography>
                      )}
                    </TableCell>
                    {!isSmallScreen && (
                      <TableCell>
                        {client.pending_payment_receiving_date ? (
                          <MuiTooltip
                            title={new Date(
                              client.pending_payment_receiving_date
                            ).toLocaleDateString()}
                            arrow
                          >
                            <Typography
                              variant='body2'
                              color='success.main'
                              sx={{ fontSize: 12 }}
                            >
                              {new Date(
                                client.pending_payment_receiving_date
                              ).toLocaleDateString()}
                            </Typography>
                          </MuiTooltip>
                        ) : (
                          <Typography
                            color='text.secondary'
                            sx={{ fontSize: 12 }}
                          >
                            -
                          </Typography>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <Box>
                        <MuiTooltip title='Edit Client'>
                          <IconButton
                            size='small'
                            onClick={() => handleOpenEditDialog(client)}
                          >
                            <EditIcon fontSize='small' />
                          </IconButton>
                        </MuiTooltip>
                        {client.pending_payment > 0 && (
                          <MuiTooltip title='Clear Pending'>
                            <IconButton
                              size='small'
                              color='primary'
                              onClick={() => handleOpenPaymentDialog(client)}
                            >
                              <ReceiptIcon fontSize='small' />
                            </IconButton>
                          </MuiTooltip>
                        )}
                        <MuiTooltip title='Payment History'>
                          <IconButton
                            size='small'
                            color='info'
                            onClick={() => handleOpenHistoryDialog(client)}
                          >
                            <HistoryIcon fontSize='small' />
                          </IconButton>
                        </MuiTooltip>
                        <MuiTooltip title='Delete Client'>
                          <IconButton
                            size='small'
                            onClick={() => handleOpenDeleteDialog(client)}
                          >
                            <DeleteIcon fontSize='small' />
                          </IconButton>
                        </MuiTooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <Typography variant='body1' color='text.secondary'>
            {searchQuery
              ? `No clients found matching "${searchQuery}"`
              : 'No clients in the database. Add a client to get started.'}
          </Typography>
        )}
      </Paper>

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack
          direction='row'
          justifyContent='center'
          alignItems='center'
          spacing={2}
          sx={{ mt: 3 }}
        >
          <Typography variant='body2' color='text.secondary'>
            Page {page} of {totalPages}
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color='primary'
            showFirstButton
            showLastButton
            size='large'
          />
          <Typography variant='body2' color='text.secondary'>
            {(page - 1) * pageSize + 1}-
            {Math.min(page * pageSize, totalClientsCount)} of{' '}
            {totalClientsCount}
          </Typography>
        </Stack>
      )}

      {/* Add Client Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Add New Client</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name='full_name'
                label='Full Name *'
                value={formData.full_name}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.full_name || !!duplicateErrors.name}
                helperText={
                  formErrors.full_name ||
                  duplicateErrors.name ||
                  (duplicateChecking.name ? 'Checking for duplicates...' : '')
                }
                InputProps={{
                  endAdornment: duplicateChecking.name ? (
                    <InputAdornment position='end'>
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name='phone'
                label='Phone Number *'
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.phone || !!duplicateErrors.phone}
                helperText={
                  formErrors.phone ||
                  duplicateErrors.phone ||
                  (duplicateChecking.phone ? 'Checking for duplicates...' : '')
                }
                InputProps={{
                  endAdornment: duplicateChecking.phone ? (
                    <InputAdornment position='end'>
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name='email'
                label='Email'
                type='email'
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                error={!!formErrors.email || !!duplicateErrors.email}
                helperText={
                  formErrors.email ||
                  duplicateErrors.email ||
                  (duplicateChecking.email ? 'Checking for duplicates...' : '')
                }
                InputProps={{
                  endAdornment: duplicateChecking.email ? (
                    <InputAdornment position='end'>
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name='gender'
                label='Gender'
                value={formData.gender}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name='birth_date'
                label='Birth Date'
                type='date'
                value={formData.birth_date}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name='anniversary_date'
                label='Anniversary Date'
                type='date'
                value={formData.anniversary_date}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name='pending_payment_receiving_date'
                label='Pending Payment Receiving Date'
                type='date'
                value={formData.pending_payment_receiving_date}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                helperText='Expected date when pending payment will be received'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name='notes'
                label='Notes'
                value={formData.notes}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddClient} variant='contained' color='primary'>
            Add Client
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Edit Client</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name='full_name'
                label='Full Name *'
                value={formData.full_name}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.full_name || !!duplicateErrors.name}
                helperText={
                  formErrors.full_name ||
                  duplicateErrors.name ||
                  (duplicateChecking.name ? 'Checking for duplicates...' : '')
                }
                InputProps={{
                  endAdornment: duplicateChecking.name ? (
                    <InputAdornment position='end'>
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name='phone'
                label='Phone Number *'
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!formErrors.phone || !!duplicateErrors.phone}
                helperText={
                  formErrors.phone ||
                  duplicateErrors.phone ||
                  (duplicateChecking.phone ? 'Checking for duplicates...' : '')
                }
                InputProps={{
                  endAdornment: duplicateChecking.phone ? (
                    <InputAdornment position='end'>
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name='email'
                label='Email'
                type='email'
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                error={!!formErrors.email || !!duplicateErrors.email}
                helperText={
                  formErrors.email ||
                  duplicateErrors.email ||
                  (duplicateChecking.email ? 'Checking for duplicates...' : '')
                }
                InputProps={{
                  endAdornment: duplicateChecking.email ? (
                    <InputAdornment position='end'>
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name='gender'
                label='Gender'
                value={formData.gender}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name='birth_date'
                label='Birth Date'
                type='date'
                value={formData.birth_date}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name='anniversary_date'
                label='Anniversary Date'
                type='date'
                value={formData.anniversary_date}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name='pending_payment_receiving_date'
                label='Pending Payment Receiving Date'
                type='date'
                value={formData.pending_payment_receiving_date}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                helperText='Expected date when pending payment will be received'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name='notes'
                label='Notes'
                value={formData.notes}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>

            {selectedClient && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2'>Total Spent</Typography>
                  <Typography variant='h6' color='success.main'>
                    {formatCurrency(selectedClient.total_spent)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='subtitle2'>Pending Payment</Typography>
                  <Typography
                    variant='h6'
                    color={
                      (selectedClient.pending_payment || 0) > 0
                        ? 'warning.main'
                        : 'text.secondary'
                    }
                  >
                    {(selectedClient.pending_payment || 0) > 0
                      ? formatCurrency(selectedClient.pending_payment || 0)
                      : 'No pending amount'}
                  </Typography>
                </Grid>
                {(selectedClient.pending_payment || 0) > 0 &&
                  selectedClient.pending_payment_receiving_date && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant='subtitle2'>
                        Expected Receiving Date
                      </Typography>
                      <Typography
                        variant='body1'
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        <CalendarTodayIcon fontSize='small' sx={{ mr: 1 }} />
                        {new Date(
                          selectedClient.pending_payment_receiving_date
                        ).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  )}
                <Grid item xs={12}>
                  <Typography variant='subtitle2'>Last Visit</Typography>
                  <Typography
                    variant='body1'
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <CalendarTodayIcon fontSize='small' sx={{ mr: 1 }} />
                    {selectedClient.last_visit
                      ? new Date(selectedClient.last_visit).toLocaleDateString()
                      : 'Never visited'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant='subtitle2'>Lifetime Visits</Typography>
                  <Typography
                    variant='body1'
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <ConfirmationNumberIcon fontSize='small' sx={{ mr: 1 }} />
                    {/* Calculate for selected client in dialog */}
                    {selectedClient &&
                      (orders?.filter(
                        order =>
                          ((order as any).client_name ===
                            selectedClient.full_name ||
                            (order as any).customer_name ===
                              selectedClient.full_name) &&
                          (order as any).status !== 'cancelled' &&
                          !(order as any).consumption_purpose &&
                          (order as any).client_name !== 'Salon Consumption'
                      ).length ||
                        0)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant='subtitle2'>Gender</Typography>
                  <Typography
                    variant='body1'
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <WcIcon fontSize='small' sx={{ mr: 1 }} />
                    {selectedClient.gender || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant='subtitle2'>Birth Date</Typography>
                  <Typography
                    variant='body1'
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <CalendarTodayIcon fontSize='small' sx={{ mr: 1 }} />
                    {selectedClient.birth_date
                      ? new Date(selectedClient.birth_date).toLocaleDateString()
                      : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant='subtitle2'>Anniversary Date</Typography>
                  <Typography
                    variant='body1'
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <EventIcon fontSize='small' sx={{ mr: 1 }} />
                    {selectedClient.anniversary_date
                      ? new Date(
                          selectedClient.anniversary_date
                        ).toLocaleDateString()
                      : '-'}
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleEditClient}
            variant='contained'
            disabled={!formData.full_name}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Process Payment Dialog */}
      <Dialog
        open={openPaymentDialog}
        onClose={() => setOpenPaymentDialog(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Process Pending Payment</DialogTitle>
        <DialogContent>
          {selectedClient && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Alert severity='info' sx={{ mb: 2 }}>
                  Processing payment for {selectedClient.full_name}
                </Alert>

                <Typography variant='subtitle1' gutterBottom>
                  Total Pending Amount:{' '}
                  {formatCurrency(selectedClient.pending_payment)}
                </Typography>

                <TextField
                  label='Payment Amount'
                  type='number'
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  fullWidth
                  InputProps={{
                    inputProps: {
                      min: 0,
                      max: selectedClient.pending_payment || 0,
                    },
                    startAdornment: (
                      <InputAdornment position='start'>₹</InputAdornment>
                    ),
                  }}
                  error={paymentAmount > (selectedClient.pending_payment || 0)}
                  helperText={
                    paymentAmount > (selectedClient.pending_payment || 0)
                      ? 'Amount exceeds pending payment'
                      : ''
                  }
                  sx={{ mt: 2 }}
                />

                <TextField
                  select
                  label='Payment Method'
                  value={paymentMethod}
                  onChange={e =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                  fullWidth
                  sx={{ mt: 2 }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value='cash'>Cash</option>
                  <option value='upi'>UPI</option>
                  <option value='credit_card'>Credit Card</option>
                  <option value='debit_card'>Debit Card</option>
                </TextField>

                <TextField
                  label='Payment Received Date'
                  type='date'
                  value={paymentDate}
                  onChange={e => setPaymentDate(e.target.value)}
                  fullWidth
                  sx={{ mt: 2 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    max: new Date().toISOString().split('T')[0], // Don't allow future dates
                  }}
                  helperText='Select the date when payment was actually received'
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
          <Button
            onClick={handleProcessPayment}
            variant='contained'
            disabled={
              !selectedClient ||
              paymentAmount <= 0 ||
              paymentAmount > (selectedClient?.pending_payment || 0)
            }
            startIcon={<CreditCardIcon />}
          >
            Process Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Client Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{'Confirm Deletion'}</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Are you sure you want to delete this client? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteClient}
            variant='contained'
            color='error'
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment History Dialog */}
      {selectedClient && (
        <PaymentHistoryDialog
          open={openHistoryDialog}
          onClose={() => setOpenHistoryDialog(false)}
          client={selectedClient}
        />
      )}

      {lastTransaction && (
        <PaymentReceiptDialog
          open={openReceiptDialog}
          onClose={() => setOpenReceiptDialog(false)}
          transaction={lastTransaction}
        />
      )}
    </Box>
  );
}

// New component for Payment Receipt Dialog
function PaymentReceiptDialog({
  open,
  onClose,
  transaction,
}: {
  open: boolean;
  onClose: () => void;
  transaction: {
    amount: number;
    clientName: string;
    remainingBalance: number;
    paymentDate: string;
  };
}) {
  if (!transaction) return null;

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the receipt');
      return;
    }

    const receiptHtml = generatePaymentReceiptHtml(transaction);
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  const handleDownloadReceipt = () => {
    const receiptHtml = generatePaymentReceiptHtml(transaction);
    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payment_Receipt_${transaction.clientName}_${new Date(transaction.paymentDate).toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon color='success' />
          Payment Receipt
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            mb: 2,
            p: 3,
            border: '1px solid #ddd',
            borderRadius: 2,
            bgcolor: '#f9f9f9',
          }}
        >
          <Typography
            variant='h5'
            gutterBottom
            color='success.main'
            align='center'
          >
            🎉 Payment Received Successfully
          </Typography>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant='h6' color='primary'>
                Client Details
              </Typography>
              <Typography variant='body1' sx={{ mb: 1 }}>
                <strong>Name:</strong> {transaction.clientName}
              </Typography>
              <Typography variant='body1' sx={{ mb: 1 }}>
                <strong>Payment Date:</strong>{' '}
                {new Date(transaction.paymentDate).toLocaleDateString('en-IN')}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant='h6' color='primary'>
                Payment Details
              </Typography>
              <Typography variant='body1' sx={{ mb: 1 }}>
                <strong>Amount Paid:</strong>
                <Chip
                  label={formatCurrency(transaction.amount)}
                  color='success'
                  sx={{ ml: 1, fontWeight: 'bold' }}
                />
              </Typography>
              <Typography variant='body1' sx={{ mb: 1 }}>
                <strong>Remaining Balance:</strong>
                <Chip
                  label={formatCurrency(transaction.remainingBalance)}
                  color={
                    transaction.remainingBalance > 0 ? 'warning' : 'success'
                  }
                  sx={{ ml: 1, fontWeight: 'bold' }}
                />
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#e8f5e8', borderRadius: 1 }}>
            <Typography variant='h6' color='success.main' align='center'>
              Receipt Summary
            </Typography>
            <Typography variant='body2' align='center' color='text.secondary'>
              Receipt generated on: {new Date().toLocaleString('en-IN')}
            </Typography>
            <Typography variant='body2' align='center' color='text.secondary'>
              Transaction ID: PMT-{Date.now().toString().slice(-8)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={handlePrintReceipt}
          variant='outlined'
          color='primary'
          startIcon={<PrintIcon />}
        >
          Print Receipt
        </Button>
        <Button
          onClick={handleDownloadReceipt}
          variant='outlined'
          color='secondary'
          startIcon={<DownloadIcon />}
        >
          Download
        </Button>
        <Button onClick={onClose} variant='contained' color='success'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// New component for Payment History Dialog
function PaymentHistoryDialog({
  open,
  onClose,
  client,
}: {
  open: boolean;
  onClose: () => void;
  client: Client;
}) {
  const { history, isLoading, error } = useClientPaymentHistory(
    client ? client.id : null
  );

  const handleViewReceipt = (entry: any, client: Client) => {
    // Create a transaction object for the receipt
    const transaction = {
      amount: entry.amount,
      clientName: client.full_name,
      remainingBalance: 0, // We don't have this info in history, so set to 0
      paymentDate: entry.created_at,
      paymentMethod: entry.payment_method,
      details: entry.details,
      receiptType: entry.type, // 'Bill Paid' or 'Payment Received'
    };

    // Generate and show receipt
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to view the receipt');
      return;
    }

    const receiptHtml = generateBillReceiptHtml(transaction);
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>Payment History for {client.full_name}</DialogTitle>
      <DialogContent>
        {isLoading && <CircularProgress />}
        {error && <Alert severity='error'>{error.message}</Alert>}

        {history && history.length > 0 ? (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Payment Received</TableCell>
                  <TableCell>Expected Receiving Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {new Date(entry.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={entry.type}
                        color={
                          entry.type === 'Payment Received' ? 'success' : 'info'
                        }
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        color={
                          entry.type === 'Payment Received'
                            ? 'success.main'
                            : 'primary.main'
                        }
                        fontWeight={
                          entry.type === 'Payment Received' ? 'bold' : 'normal'
                        }
                      >
                        {formatCurrency(entry.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>
                        {entry.payment_method}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{entry.details}</Typography>
                    </TableCell>
                    <TableCell>
                      {entry.payment_received_date ? (
                        <MuiTooltip
                          title={new Date(
                            entry.payment_received_date
                          ).toLocaleString()}
                        >
                          <Typography
                            variant='body2'
                            color='success.main'
                            fontWeight='bold'
                          >
                            {new Date(
                              entry.payment_received_date
                            ).toLocaleDateString()}
                          </Typography>
                        </MuiTooltip>
                      ) : (
                        <Typography variant='body2' color='text.secondary'>
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.pending_payment_receiving_date ? (
                        <MuiTooltip
                          title={new Date(
                            entry.pending_payment_receiving_date
                          ).toLocaleString()}
                        >
                          <Typography
                            variant='body2'
                            color='warning.main'
                            fontWeight='bold'
                          >
                            {new Date(
                              entry.pending_payment_receiving_date
                            ).toLocaleDateString()}
                          </Typography>
                        </MuiTooltip>
                      ) : (
                        <Typography variant='body2' color='text.secondary'>
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <MuiTooltip title='View Receipt'>
                        <IconButton
                          size='small'
                          color='primary'
                          onClick={() => handleViewReceipt(entry, client)}
                        >
                          <ReceiptIcon fontSize='small' />
                        </IconButton>
                      </MuiTooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography sx={{ mt: 2 }}>
            No payment history found for this client.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

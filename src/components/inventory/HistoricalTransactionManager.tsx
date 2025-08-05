import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  product_name: string;
  date: string;
  quantity: number;
  transaction_type: 'purchase' | 'sale' | 'consumption';
  additional_data?: Record<string, any>;
}

interface ValidationResult {
  can_delete?: boolean;
  can_update?: boolean;
  error_message?: string;
  affected_transactions?: number;
  transaction_details?: any;
  old_values?: any;
  new_values?: any;
}

interface TransactionDetails {
  transaction_data: any;
  error_message?: string;
}

const HistoricalTransactionManager: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    date: '',
    quantity: 0,
    additional_data: {}
  });

  // Fetch all transactions
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Fetch purchases
      const { data: purchases, error: purchasesError } = await supabase
        .from('inventory_purchases')
        .select('purchase_id, product_name, date, purchase_qty, purchase_invoice_number, "Vendor"')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (purchasesError) throw purchasesError;

      // Fetch sales
      const { data: sales, error: salesError } = await supabase
        .from('inventory_sales_new')
        .select('sale_id, product_name, date, quantity, invoice_no, invoice_value_rs')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (salesError) throw salesError;

      // Fetch consumption
      const { data: consumption, error: consumptionError } = await supabase
        .from('inventory_consumption')
        .select('consumption_id, product_name, date, consumption_qty, requisition_voucher_no, stylist')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (consumptionError) throw consumptionError;

      // Combine all transactions
      const allTransactions: Transaction[] = [
        ...(purchases || []).map(p => ({
          id: p.purchase_id,
          product_name: p.product_name,
          date: p.date,
          quantity: p.purchase_qty,
          transaction_type: 'purchase' as const,
          additional_data: {
            invoice_number: p.purchase_invoice_number,
            vendor: p.Vendor
          }
        })),
        ...(sales || []).map(s => ({
          id: s.sale_id,
          product_name: s.product_name,
          date: s.date,
          quantity: s.quantity,
          transaction_type: 'sale' as const,
          additional_data: {
            invoice_no: s.invoice_no,
            invoice_value: s.invoice_value_rs
          }
        })),
        ...(consumption || []).map(c => ({
          id: c.consumption_id,
          product_name: c.product_name,
          date: c.date,
          quantity: c.consumption_qty,
          transaction_type: 'consumption' as const,
          additional_data: {
            voucher_no: c.requisition_voucher_no,
            stylist: c.stylist
          }
        }))
      ];

      setTransactions(allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setErrorMessage('Error fetching transactions');
    } finally {
      setLoading(false);
    }
  };

  // Validate delete operation
  const validateDelete = async (transaction: Transaction) => {
    if (!user?.id) return;

    setLoading(true);
    setValidationResult(null);

    try {
      const { data, error } = await supabase
        .rpc('validate_historical_delete', {
          transaction_id_param: transaction.id,
          transaction_type_param: transaction.transaction_type,
          user_id_param: user.id
        });

      if (error) throw error;

      if (data && data.length > 0) {
        setValidationResult(data[0] as ValidationResult);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setErrorMessage('Error validating delete operation');
    } finally {
      setLoading(false);
    }
  };

  // Delete transaction
  const deleteTransaction = async (transaction: Transaction) => {
    if (!user?.id) return;

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const { data, error } = await supabase
        .rpc('delete_historical_transaction', {
          transaction_id_param: transaction.id,
          transaction_type_param: transaction.transaction_type,
          user_id_param: user.id
        });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0];
        if (result.success) {
          setSuccessMessage(result.message);
          setSelectedTransaction(null);
          setValidationResult(null);
          fetchTransactions(); // Refresh the list
        } else {
          setErrorMessage(result.message);
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      setErrorMessage('Error deleting transaction');
    } finally {
      setLoading(false);
    }
  };

  // Get transaction details for editing
  const getTransactionDetails = async (transaction: Transaction) => {
    if (!user?.id) return;

    setLoading(true);
    setTransactionDetails(null);

    try {
      const { data, error } = await supabase
        .rpc('get_transaction_details', {
          transaction_id_param: transaction.id,
          transaction_type_param: transaction.transaction_type,
          user_id_param: user.id
        });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0] as TransactionDetails;
        setTransactionDetails(result);
        
        if (result.transaction_data) {
          setEditForm({
            date: format(new Date(result.transaction_data.date), 'yyyy-MM-dd'),
            quantity: result.transaction_data.quantity,
            additional_data: result.transaction_data
          });
        }
      }
    } catch (error) {
      console.error('Error getting transaction details:', error);
      setErrorMessage('Error getting transaction details');
    } finally {
      setLoading(false);
    }
  };

  // Validate update operation
  const validateUpdate = async (transaction: Transaction) => {
    if (!user?.id) return;

    setLoading(true);
    setValidationResult(null);

    try {
      const { data, error } = await supabase
        .rpc('validate_historical_update', {
          transaction_id_param: transaction.id,
          transaction_type_param: transaction.transaction_type,
          new_date_param: editForm.date,
          new_quantity_param: editForm.quantity,
          user_id_param: user.id
        });

      if (error) throw error;

      if (data && data.length > 0) {
        setValidationResult(data[0] as ValidationResult);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setErrorMessage('Error validating update operation');
    } finally {
      setLoading(false);
    }
  };

  // Update transaction
  const updateTransaction = async (transaction: Transaction) => {
    if (!user?.id) return;

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const { data, error } = await supabase
        .rpc('update_historical_transaction', {
          transaction_id_param: transaction.id,
          transaction_type_param: transaction.transaction_type,
          new_date_param: editForm.date,
          new_quantity_param: editForm.quantity,
          additional_data_param: editForm.additional_data,
          user_id_param: user.id
        });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0];
        if (result.success) {
          setSuccessMessage(result.message);
          setSelectedTransaction(null);
          setValidationResult(null);
          setTransactionDetails(null);
          setEditMode(false);
          fetchTransactions(); // Refresh the list
        } else {
          setErrorMessage(result.message);
        }
      }
    } catch (error) {
      console.error('Update error:', error);
      setErrorMessage('Error updating transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    getTransactionDetails(transaction);
    setEditMode(true);
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    validateDelete(transaction);
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdditionalDataChange = (key: string, value: any) => {
    setEditForm(prev => ({
      ...prev,
      additional_data: {
        ...prev.additional_data,
        [key]: value
      }
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Historical Transaction Manager</h2>
      
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      {/* Transactions List */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">All Transactions</h3>
        {loading ? (
          <div className="text-center py-4">Loading transactions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.transaction_type === 'purchase' ? 'bg-green-100 text-green-800' :
                        transaction.transaction_type === 'sale' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.transaction_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {transaction.product_name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {transaction.quantity}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {transaction.additional_data?.invoice_number || 
                       transaction.additional_data?.invoice_no || 
                       transaction.additional_data?.voucher_no || 
                       'N/A'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(transaction)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(transaction)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editMode && selectedTransaction && transactionDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold mb-4">Edit Transaction</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => handleEditFormChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => handleEditFormChange('quantity', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {selectedTransaction.transaction_type === 'purchase' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor
                    </label>
                    <input
                      type="text"
                      value={editForm.additional_data.Vendor || ''}
                      onChange={(e) => handleAdditionalDataChange('Vendor', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {selectedTransaction.transaction_type === 'consumption' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stylist
                    </label>
                    <input
                      type="text"
                      value={editForm.additional_data.stylist || ''}
                      onChange={(e) => handleAdditionalDataChange('stylist', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setSelectedTransaction(null);
                      setTransactionDetails(null);
                      setValidationResult(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => validateUpdate(selectedTransaction)}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Validating...' : 'Validate Update'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Results Modal */}
      {validationResult && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold mb-4">Validation Results</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Status:</p>
                  <p className={`font-semibold ${validationResult.can_delete || validationResult.can_update ? 'text-green-600' : 'text-red-600'}`}>
                    {validationResult.can_delete || validationResult.can_update ? 'Valid' : 'Invalid'}
                  </p>
                </div>

                {validationResult.error_message && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-700 text-sm">{validationResult.error_message}</p>
                  </div>
                )}

                {validationResult.affected_transactions && validationResult.affected_transactions > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-700 text-sm">
                      ⚠️ This action will affect {validationResult.affected_transactions} future transaction(s).
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setValidationResult(null);
                      setSelectedTransaction(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  
                  {validationResult.can_delete && (
                    <button
                      onClick={() => deleteTransaction(selectedTransaction)}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                  )}
                  
                  {validationResult.can_update && editMode && (
                    <button
                      onClick={() => updateTransaction(selectedTransaction)}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Updating...' : 'Confirm Update'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricalTransactionManager; 
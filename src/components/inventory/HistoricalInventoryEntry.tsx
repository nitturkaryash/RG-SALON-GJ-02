import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

interface HistoricalEntryData {
  product_name: string;
  entry_date: string;
  quantity: number;
  transaction_type: 'purchase' | 'sale' | 'consumption';
  additional_data: Record<string, any>;
}

interface ValidationResult {
  is_valid: boolean;
  available_stock: number;
  error_message: string;
}

interface StockAtDate {
  stock_quantity: number;
  purchase_value: number;
  sales_value: number;
  consumption_value: number;
}

const HistoricalInventoryEntry: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Array<{ name: string; hsn_code: string; units: string }>>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [stockAtDate, setStockAtDate] = useState<StockAtDate | null>(null);
  const [affectedTransactions, setAffectedTransactions] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [formData, setFormData] = useState<HistoricalEntryData>({
    product_name: '',
    entry_date: format(new Date(), 'yyyy-MM-dd'),
    quantity: 0,
    transaction_type: 'purchase',
    additional_data: {}
  });

  // Fetch available products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('product_master')
          .select('name, hsn_code, units')
          .eq('active', true)
          .order('name');

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Validate historical entry
  const validateEntry = async () => {
    if (!user?.id || !formData.product_name || !formData.entry_date) return;

    setLoading(true);
    setValidationResult(null);
    setStockAtDate(null);
    setAffectedTransactions(0);

    try {
      // Validate the entry
      const { data: validationData, error: validationError } = await supabase
        .rpc('validate_historical_inventory_entry', {
          product_name_param: formData.product_name,
          entry_date_param: formData.entry_date,
          quantity_change_param: formData.quantity,
          transaction_type_param: formData.transaction_type,
          user_id_param: user.id
        });

      if (validationError) throw validationError;

      if (validationData && validationData.length > 0) {
        const result = validationData[0] as ValidationResult;
        setValidationResult(result);

        // Get stock at the entry date
        const { data: stockData, error: stockError } = await supabase
          .rpc('get_stock_at_date', {
            product_name_param: formData.product_name,
            date_param: formData.entry_date,
            user_id_param: user.id
          });

        if (!stockError && stockData && stockData.length > 0) {
          setStockAtDate(stockData[0] as StockAtDate);
        }

        // Check for future transactions
        const { count: futureCount } = await supabase
          .from('inventory_purchases')
          .select('*', { count: 'exact', head: true })
          .eq('product_name', formData.product_name)
          .eq('user_id', user.id)
          .gt('date', formData.entry_date);

        const { count: futureSalesCount } = await supabase
          .from('inventory_sales_new')
          .select('*', { count: 'exact', head: true })
          .eq('product_name', formData.product_name)
          .eq('user_id', user.id)
          .gt('date', formData.entry_date);

        const { count: futureConsumptionCount } = await supabase
          .from('inventory_consumption')
          .select('*', { count: 'exact', head: true })
          .eq('product_name', formData.product_name)
          .eq('user_id', user.id)
          .gt('date', formData.entry_date);

        setAffectedTransactions((futureCount || 0) + (futureSalesCount || 0) + (futureConsumptionCount || 0));
      }
    } catch (error) {
      console.error('Validation error:', error);
      setErrorMessage('Error validating entry');
    } finally {
      setLoading(false);
    }
  };

  // Insert historical entry
  const insertHistoricalEntry = async () => {
    if (!user?.id || !validationResult?.is_valid) return;

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const { data, error } = await supabase
        .rpc('insert_historical_inventory_entry', {
          product_name_param: formData.product_name,
          entry_date_param: formData.entry_date,
          quantity_param: formData.quantity,
          transaction_type_param: formData.transaction_type,
          additional_data: formData.additional_data,
          user_id_param: user.id
        });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0];
        if (result.success) {
          setSuccessMessage(result.message);
          setFormData({
            product_name: '',
            entry_date: format(new Date(), 'yyyy-MM-dd'),
            quantity: 0,
            transaction_type: 'purchase',
            additional_data: {}
          });
          setValidationResult(null);
          setStockAtDate(null);
          setAffectedTransactions(0);
        } else {
          setErrorMessage(result.message);
        }
      }
    } catch (error) {
      console.error('Insert error:', error);
      setErrorMessage('Error inserting historical entry');
    } finally {
      setLoading(false);
    }
  };

  // Handle form changes
  const handleInputChange = (field: keyof HistoricalEntryData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdditionalDataChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      additional_data: {
        ...prev.additional_data,
        [key]: value
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Historical Inventory Entry</h2>
      
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

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <select
              value={formData.product_name}
              onChange={(e) => handleInputChange('product_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.name} value={product.name}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entry Date *
            </label>
            <input
              type="date"
              value={formData.entry_date}
              onChange={(e) => handleInputChange('entry_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type *
            </label>
            <select
              value={formData.transaction_type}
              onChange={(e) => handleInputChange('transaction_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="purchase">Purchase</option>
              <option value="sale">Sale</option>
              <option value="consumption">Consumption</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quantity"
            />
          </div>
        </div>

        {/* Additional Data */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Additional Information</h3>
          
          {formData.transaction_type === 'purchase' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={formData.additional_data.purchase_invoice_number || ''}
                  onChange={(e) => handleAdditionalDataChange('purchase_invoice_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Invoice number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MRP (Excluding GST)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.additional_data.mrp_excl_gst || ''}
                  onChange={(e) => handleAdditionalDataChange('mrp_excl_gst', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor
                </label>
                <input
                  type="text"
                  value={formData.additional_data.Vendor || ''}
                  onChange={(e) => handleAdditionalDataChange('Vendor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Vendor name"
                />
              </div>
            </>
          )}

          {formData.transaction_type === 'sale' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={formData.additional_data.invoice_no || ''}
                  onChange={(e) => handleAdditionalDataChange('invoice_no', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Invoice number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Price (Excluding GST)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.additional_data.mrp_excl_gst || ''}
                  onChange={(e) => handleAdditionalDataChange('mrp_excl_gst', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </>
          )}

          {formData.transaction_type === 'consumption' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requisition Voucher No.
                </label>
                <input
                  type="text"
                  value={formData.additional_data.requisition_voucher_no || ''}
                  onChange={(e) => handleAdditionalDataChange('requisition_voucher_no', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Voucher number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stylist
                </label>
                <input
                  type="text"
                  value={formData.additional_data.stylist || ''}
                  onChange={(e) => handleAdditionalDataChange('stylist', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Stylist name"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Validation Button */}
      <div className="mt-6">
        <button
          onClick={validateEntry}
          disabled={loading || !formData.product_name || !formData.entry_date}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Validating...' : 'Validate Entry'}
        </button>
      </div>

      {/* Validation Results */}
      {validationResult && (
        <div className="mt-6 p-4 border rounded-md">
          <h3 className="text-lg font-semibold mb-3">Validation Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Status:</p>
              <p className={`font-semibold ${validationResult.is_valid ? 'text-green-600' : 'text-red-600'}`}>
                {validationResult.is_valid ? 'Valid' : 'Invalid'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Available Stock at Date:</p>
              <p className="font-semibold">{validationResult.available_stock}</p>
            </div>
          </div>

          {validationResult.error_message && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700">{validationResult.error_message}</p>
            </div>
          )}

          {affectedTransactions > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-700">
                ⚠️ This entry will affect {affectedTransactions} future transaction(s). 
                All subsequent stock calculations will be automatically recalculated.
              </p>
            </div>
          )}

          {stockAtDate && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Stock Details at Entry Date:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Stock Quantity:</p>
                  <p className="font-semibold">{stockAtDate.stock_quantity}</p>
                </div>
                <div>
                  <p className="text-gray-600">Purchase Value:</p>
                  <p className="font-semibold">₹{stockAtDate.purchase_value.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Sales Value:</p>
                  <p className="font-semibold">₹{stockAtDate.sales_value.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Consumption Value:</p>
                  <p className="font-semibold">₹{stockAtDate.consumption_value.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Insert Button */}
          {validationResult.is_valid && (
            <div className="mt-4">
              <button
                onClick={insertHistoricalEntry}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Inserting...' : 'Insert Historical Entry'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoricalInventoryEntry; 
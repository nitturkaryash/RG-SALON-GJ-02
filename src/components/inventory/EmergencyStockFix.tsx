import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface StockFixResult {
  check_name: string;
  old_value: number;
  new_value: number;
  status: string;
}

export function EmergencyStockFix({ productId, productName }: { productId: string; productName: string }) {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<StockFixResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFixStock = async () => {
    setIsFixing(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('emergency_fix_product_stock', {
        p_product_id: productId,
      });

      if (rpcError) throw rpcError;

      setResult(data);
    } catch (err: any) {
      console.error('Error fixing stock:', err);
      setError(err.message || 'Failed to fix stock');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 mb-2">
            Emergency Stock Fix
          </h3>
          <p className="text-sm text-yellow-700 mb-3">
            If stock appears incorrect for <strong>{productName}</strong>, click below to recalculate from transaction history.
          </p>

          <button
            onClick={handleFixStock}
            disabled={isFixing}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isFixing ? 'animate-spin' : ''}`} />
            {isFixing ? 'Fixing Stock...' : 'Fix Stock Now'}
          </button>

          {/* Results */}
          {result && result.length > 0 && (
            <div className="mt-4 space-y-2">
              {result.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    item.status.includes('✅')
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {item.check_name}
                    </span>
                    {item.status.includes('✅') && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="text-sm mt-1">
                    {item.old_value !== item.new_value ? (
                      <>
                        <span className="text-red-600">Old: {item.old_value}</span>
                        {' → '}
                        <span className="text-green-600 font-semibold">New: {item.new_value}</span>
                      </>
                    ) : (
                      <span className="text-green-600">Stock is correct: {item.new_value}</span>
                    )}
                  </div>
                  <div className="text-xs mt-1 text-gray-600">{item.status}</div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Alternative: Fix All Products Button (Admin Only)
// ============================================
export function EmergencyFixAllProducts() {
  const [isFixing, setIsFixing] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFixAll = async () => {
    if (!confirm('This will recalculate stock for ALL products. Continue?')) {
      return;
    }

    setIsFixing(true);
    setError(null);
    setResults(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('emergency_fix_all_products');

      if (rpcError) throw rpcError;

      setResults(data);
    } catch (err: any) {
      console.error('Error fixing all stock:', err);
      setError(err.message || 'Failed to fix stock');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-2">
            Fix All Products Stock (Admin)
          </h3>
          <p className="text-sm text-red-700 mb-3">
            This will recalculate stock for ALL products in the system. Use only when needed.
          </p>

          <button
            onClick={handleFixAll}
            disabled={isFixing}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isFixing ? 'animate-spin' : ''}`} />
            {isFixing ? 'Fixing All Products...' : 'Fix All Products Stock'}
          </button>

          {/* Results */}
          {results && results.length > 0 && (
            <div className="mt-4 max-h-96 overflow-y-auto space-y-2">
              <div className="text-sm font-semibold text-green-700">
                Fixed {results.length} products:
              </div>
              {results.map((item, index) => (
                <div key={index} className="p-2 bg-white rounded border border-green-200 text-sm">
                  <div className="font-medium">{item.product_name}</div>
                  <div className="text-gray-600">
                    {item.old_stock} → {item.new_stock} 
                    <span className={item.difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {' '}({item.difference >= 0 ? '+' : ''}{item.difference})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results && results.length === 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 inline mr-2" />
              <span className="text-sm text-green-700">All products have correct stock!</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



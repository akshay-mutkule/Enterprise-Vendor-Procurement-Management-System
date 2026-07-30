import React, { useState } from 'react';
import { 
  Package, Plus, Warehouse, AlertTriangle, QrCode, ArrowUpRight, 
  ArrowDownLeft, Barcode, CheckCircle2, Search, Building 
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { formatCurrency } from '../utils/exportUtils';
import { Product } from '../types';

export const InventoryView: React.FC = () => {
  const { products, warehouses, addProduct, updateStock, addWarehouse, searchQuery } = useProcurement();

  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'WAREHOUSES' | 'STOCK_MOVEMENT'>('PRODUCTS');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Forms State
  const [productForm, setProductForm] = useState({
    sku: 'SKU-MOD-99',
    name: '',
    category: 'Electronics & Microchips',
    unit: 'Units',
    unitPrice: 50.00,
    stockQuantity: 100,
    reorderLevel: 250,
    warehouseId: warehouses[0]?.id || 'wh-1',
    description: ''
  });

  const [warehouseForm, setWarehouseForm] = useState({
    name: '',
    location: '',
    capacity: 20000,
    managerName: '',
    contactNumber: ''
  });

  const [stockForm, setStockForm] = useState({
    productId: products[0]?.id || 'p-101',
    type: 'STOCK_IN' as 'STOCK_IN' | 'STOCK_OUT',
    quantity: 100,
    warehouseId: warehouses[0]?.id || 'wh-1',
    reason: 'Purchase order receipt'
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.barcode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetWH = warehouses.find(w => w.id === productForm.warehouseId);
    addProduct({
      ...productForm,
      warehouseName: targetWH?.name || 'Main Warehouse'
    });
    setShowProductModal(false);
  };

  const handleWarehouseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addWarehouse(warehouseForm);
    setShowWarehouseModal(false);
  };

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const delta = stockForm.type === 'STOCK_IN' ? stockForm.quantity : -stockForm.quantity;
    updateStock(stockForm.productId, delta, stockForm.warehouseId);
    setShowStockModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Inventory, Warehousing & Barcode Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track multi-warehouse stock levels, automated reorder thresholds, and stock movements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStockModal(true)}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4" /> Stock In / Out
          </button>
          <button
            onClick={() => setShowProductModal(true)}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Product SKU
          </button>
          <button
            onClick={() => setShowWarehouseModal(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <Building className="w-4 h-4" /> Add Warehouse
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-6">
        <button
          onClick={() => setActiveTab('PRODUCTS')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors ${activeTab === 'PRODUCTS' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400'}`}
        >
          Product Catalog & Barcodes ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('WAREHOUSES')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors ${activeTab === 'WAREHOUSES' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400'}`}
        >
          Warehouses Roster ({warehouses.length})
        </button>
      </div>

      {/* Tab 1: Product Catalog */}
      {activeTab === 'PRODUCTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Product List Table (8 cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Stock Qty</th>
                    <th className="p-3">Unit Price</th>
                    <th className="p-3">Barcode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredProducts.map(product => {
                    const isLowStock = product.stockQuantity <= product.reorderLevel;
                    return (
                      <tr 
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer ${selectedProduct?.id === product.id ? 'bg-indigo-50/50 dark:bg-indigo-950/40' : ''}`}
                      >
                        <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{product.sku}</td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{product.name}</td>
                        <td className="p-3 text-slate-500">{product.category}</td>
                        <td className="p-3">
                          <span className={`font-extrabold ${isLowStock ? 'text-rose-600 font-extrabold flex items-center gap-1' : 'text-slate-800 dark:text-slate-200'}`}>
                            {product.stockQuantity} {product.unit}
                            {isLowStock && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{formatCurrency(product.unitPrice)}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-400">{product.barcode}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Barcode & Product Detail Panel (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
            {selectedProduct ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-indigo-600 font-mono font-bold uppercase">{selectedProduct.sku}</span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{selectedProduct.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{selectedProduct.description}</p>
                </div>

                {/* Simulated Barcode */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
                  <div className="flex items-center justify-center gap-1 font-mono text-2xl tracking-widest text-slate-900 dark:text-white font-extrabold">
                    ||||| ||| |||| || ||||||
                  </div>
                  <div className="text-xs font-mono text-slate-500 tracking-wider">
                    {selectedProduct.barcode}
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold">
                    EAN-13 Barcode Generated
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded">
                    <span className="text-slate-500">Warehouse Location:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedProduct.warehouseName || 'Main Hub'}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded">
                    <span className="text-slate-500">Reorder Threshold:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedProduct.reorderLevel} {selectedProduct.unit}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Select a product SKU from the table to generate barcode & inspect stock parameters.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 2: Warehouses */}
      {activeTab === 'WAREHOUSES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {warehouses.map(wh => (
            <div key={wh.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase">{wh.code}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Active Operational
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">{wh.name}</h3>
              <p className="text-xs text-slate-500">{wh.location}</p>

              <div className="pt-2 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Capacity:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{wh.capacity.toLocaleString()} Units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Warehouse Manager:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{wh.managerName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Product */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">Add Product SKU</h3>
            <form onSubmit={handleProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. 100W Power Inverter Module"
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={e => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    value={productForm.unitPrice}
                    onChange={e => setProductForm({ ...productForm, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={productForm.stockQuantity}
                    onChange={e => setProductForm({ ...productForm, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Reorder Level</label>
                  <input
                    type="number"
                    value={productForm.reorderLevel}
                    onChange={e => setProductForm({ ...productForm, reorderLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowProductModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md">Add Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Stock Movement */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">Stock In / Stock Out</h3>
            <form onSubmit={handleStockSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Target Product</label>
                <select
                  value={stockForm.productId}
                  onChange={e => setStockForm({ ...stockForm, productId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                >
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Qty: {p.stockQuantity})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Movement Type</label>
                  <select
                    value={stockForm.type}
                    onChange={e => setStockForm({ ...stockForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold"
                  >
                    <option value="STOCK_IN">STOCK IN (+)</option>
                    <option value="STOCK_OUT">STOCK OUT (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    value={stockForm.quantity}
                    onChange={e => setStockForm({ ...stockForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowStockModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md">Record Movement</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { 
  Package, Plus, Warehouse, AlertTriangle, QrCode, ArrowUpRight, 
  ArrowDownLeft, Barcode, CheckCircle2, Search, Building, Sparkles,
  Layers, Scan, RefreshCw, Truck, ArrowRightLeft, ShieldCheck, Thermometer,
  Box, MapPin, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProcurement } from '../context/ProcurementContext';
import { formatCurrency } from '../utils/exportUtils';
import { sound } from '../utils/soundUtils';
import { Product } from '../types';

interface WarehouseBay {
  bayId: string;
  aisle: string;
  tier: number;
  sku: string;
  productName: string;
  occupancyPercent: number;
  temperature: string;
  status: 'OPTIMAL' | 'REORDER_TRIGGERED' | 'FULL_CAPACITY';
}

const initialWarehouseBays: WarehouseBay[] = [
  { bayId: 'A-01', aisle: 'Aisle A (Semiconductors)', tier: 1, sku: 'SKU-MCU-01', productName: 'Cortex-M7 Microcontroller', occupancyPercent: 88, temperature: '20.5°C', status: 'OPTIMAL' },
  { bayId: 'A-02', aisle: 'Aisle A (Semiconductors)', tier: 2, sku: 'SKU-SEN-02', productName: 'Optocoupler Sensor IC', occupancyPercent: 22, temperature: '20.2°C', status: 'REORDER_TRIGGERED' },
  { bayId: 'B-01', aisle: 'Bisle B (Passive Components)', tier: 1, sku: 'SKU-CAP-03', productName: 'Solid Tantalum Capacitor 100uF', occupancyPercent: 94, temperature: '21.0°C', status: 'FULL_CAPACITY' },
  { bayId: 'B-02', aisle: 'Bisle B (Passive Components)', tier: 2, sku: 'SKU-RES-04', productName: 'Precision SMD Resistor Array', occupancyPercent: 75, temperature: '21.1°C', status: 'OPTIMAL' },
  { bayId: 'C-01', aisle: 'Aisle C (Power Systems)', tier: 1, sku: 'SKU-PWR-05', productName: '500W GaN Power Stage Module', occupancyPercent: 18, temperature: '19.4°C', status: 'REORDER_TRIGGERED' },
  { bayId: 'D-01', aisle: 'Aisle D (Heavy Enclosures)', tier: 1, sku: 'SKU-CNC-06', productName: 'Aerospace Anodized Aluminum Chasis', occupancyPercent: 64, temperature: '22.0°C', status: 'OPTIMAL' },
];

export const InventoryView: React.FC = () => {
  const { products, warehouses, addProduct, updateStock, addWarehouse, searchQuery, logActivity, addToast } = useProcurement();

  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'WAREHOUSE_BAYS' | 'SCANNER' | 'STOCK_MOVEMENT'>('PRODUCTS');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);
  const [selectedBay, setSelectedBay] = useState<WarehouseBay>(initialWarehouseBays[0]);

  // Barcode Scanner Simulator
  const [scannedCode, setScannedCode] = useState('');
  const [scanResult, setScanResult] = useState<Product | null>(null);

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
    sound.playSuccess();
    const targetWH = warehouses.find(w => w.id === productForm.warehouseId);
    addProduct({
      ...productForm,
      warehouseName: targetWH?.name || 'Main Warehouse'
    });
    setShowProductModal(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  const handleWarehouseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    addWarehouse(warehouseForm);
    setShowWarehouseModal(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    const delta = stockForm.type === 'STOCK_IN' ? stockForm.quantity : -stockForm.quantity;
    updateStock(stockForm.productId, delta, stockForm.warehouseId);
    setShowStockModal(false);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
  };

  const handleSimulateScan = (codeToScan?: string) => {
    const code = codeToScan || scannedCode || '890102030401';
    sound.playScan();
    const match = products.find(p => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase()) || products[0];
    setScanResult(match);
    setScannedCode(code);
    confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-amber-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold mb-3 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Multi-Facility Godown Grid • RFID Barcode Engine Live</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Inventory & 3D Godown Warehouse Matrix
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-3xl leading-relaxed">
              Real-time multi-bay occupancy telemetry, RFID/barcode optical scanning, safety reorder triggers, and seamless inter-facility stock transfers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { sound.playClick(); setShowStockModal(true); }}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <ArrowUpRight className="w-4 h-4" /> Stock In / Out
            </button>
            <button
              onClick={() => { sound.playClick(); setShowProductModal(true); }}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" /> Register SKU
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => { sound.playClick(); setActiveTab('PRODUCTS'); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'PRODUCTS' 
              ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Master SKU Catalog ({products.length})
        </button>
        <button
          onClick={() => { sound.playClick(); setActiveTab('WAREHOUSE_BAYS'); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'WAREHOUSE_BAYS' 
              ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          2D/3D Godown Bay Matrix & Racks
        </button>
        <button
          onClick={() => { sound.playClick(); setActiveTab('SCANNER'); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'SCANNER' 
              ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          RFID & Barcode Optical Scanner
        </button>
      </div>

      {activeTab === 'PRODUCTS' && (
        /* Products Master Catalog */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">SKU Master Inventory</span>
              <span className="text-xs font-mono text-slate-400">Total Valuation: {formatCurrency(products.reduce((s, p) => s + (p.stockQuantity * p.unitPrice), 0))}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">SKU / Barcode</th>
                    <th className="p-3.5">Item Name</th>
                    <th className="p-3.5">Stock Level</th>
                    <th className="p-3.5">Unit Price</th>
                    <th className="p-3.5">Warehouse</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProducts.map(prod => {
                    const isLow = prod.stockQuantity <= prod.reorderLevel;
                    const isSelected = selectedProduct?.id === prod.id;
                    return (
                      <tr
                        key={prod.id}
                        onClick={() => { sound.playClick(); setSelectedProduct(prod); }}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-amber-50/70 dark:bg-amber-950/40 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                      >
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400 block">{prod.sku}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{prod.barcode}</span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">{prod.name}</div>
                          <div className="text-[10px] text-slate-500">{prod.category}</div>
                        </td>
                        <td className="p-3.5 font-mono font-bold">
                          <span className={isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}>
                            {prod.stockQuantity.toLocaleString()} {prod.unit}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-normal">Reorder @ {prod.reorderLevel}</span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(prod.unitPrice)}
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                          {prod.warehouseName}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono ${
                            isLow 
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800' 
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          }`}>
                            {isLow ? 'REORDER' : 'OPTIMAL'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Product Quick Inspector (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {selectedProduct ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 font-mono">
                    SKU Digital Asset Card
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                    {selectedProduct.sku}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">{selectedProduct.name}</h4>
                  <p className="text-xs text-slate-500">{selectedProduct.description || 'Precision engineered industrial component'}</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Asset Value:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(selectedProduct.stockQuantity * selectedProduct.unitPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Safety Buffer Status:</span>
                    <span className={`font-bold ${selectedProduct.stockQuantity <= selectedProduct.reorderLevel ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {selectedProduct.stockQuantity <= selectedProduct.reorderLevel ? 'Buffer Breached' : 'Buffer Secure'}
                    </span>
                  </div>
                </div>

                {/* Barcode visual render */}
                <div className="p-4 bg-slate-950 text-white rounded-2xl text-center space-y-2">
                  <div className="text-[10px] font-mono text-slate-400">ENCRYPTED GS1-128 BARCODE</div>
                  <div className="font-mono text-lg font-black tracking-widest text-amber-400">
                    ||| | |||| || ||| | |||
                  </div>
                  <div className="text-xs font-mono text-slate-300 font-bold">{selectedProduct.barcode}</div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {activeTab === 'WAREHOUSE_BAYS' && (
        /* 2D/3D Godown Bay Matrix */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              Physical Spatial Topology
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              Central Godown Bay & Rack Visualizer (Main Facility Alpha)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Live IoT thermal sensors, rack load density, and automated replenishment dispatchers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {initialWarehouseBays.map(bay => {
              const isSelected = selectedBay.bayId === bay.bayId;
              const isReorder = bay.status === 'REORDER_TRIGGERED';
              const isFull = bay.status === 'FULL_CAPACITY';

              return (
                <div
                  key={bay.bayId}
                  onClick={() => { sound.playClick(); setSelectedBay(bay); }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected 
                      ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20 shadow-md' 
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-black bg-slate-900 text-white">
                      Bay {bay.bayId}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isReorder ? 'bg-rose-100 dark:bg-rose-950 text-rose-600' : isFull ? 'bg-purple-100 dark:bg-purple-950 text-purple-600' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                    }`}>
                      {bay.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{bay.productName}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{bay.aisle} • Tier {bay.tier}</span>
                  </div>

                  {/* Occupancy Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-500">Bay Occupancy:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{bay.occupancyPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isReorder ? 'bg-rose-500' : isFull ? 'bg-purple-500' : 'bg-amber-500'}`}
                        style={{ width: `${bay.occupancyPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="flex items-center gap-1 font-mono">
                      <Thermometer className="w-3.5 h-3.5 text-blue-500" /> {bay.temperature}
                    </span>
                    <span className="font-mono text-slate-400">{bay.sku}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'SCANNER' && (
        /* RFID & Barcode Optical Scanner */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              Optical Barcode Ingestion
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              Industrial RFID & GS1 Barcode Optical Scanner
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Simulate warehouse handheld zebra scanners or point camera to ingest goods receipt packages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Interactive Scanning Deck */}
            <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-2">
                  <Scan className="w-4 h-4" /> Optical Laser Active
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              </div>

              <div className="border-2 border-amber-500/40 rounded-2xl h-48 flex flex-col items-center justify-center relative overflow-hidden bg-slate-900/60 p-4">
                <div className="w-full h-0.5 bg-rose-500 absolute top-1/2 -translate-y-1/2 animate-pulse shadow-lg shadow-rose-500"></div>
                <Barcode className="w-16 h-16 text-slate-400 mb-2 opacity-50" />
                <span className="text-xs font-mono text-slate-300">Align Barcode in Reticle</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 block">Manual Code Input / Test Barcode:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    placeholder="Enter Barcode e.g. 890102030401"
                    className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                  <button
                    onClick={() => handleSimulateScan()}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md transition-all hover:scale-105"
                  >
                    Scan Laser ↵
                  </button>
                </div>
              </div>

              {/* Quick Sample Barcode Pills */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
                <span className="text-slate-500">Presets:</span>
                {products.slice(0, 3).map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSimulateScan(p.barcode)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
                  >
                    {p.sku} ({p.barcode.slice(-4)})
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Optical Scan Result */}
            <div className="bg-slate-50 dark:bg-slate-800/70 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
              {scanResult ? (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Barcode Verified in Master Ledger
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Match 100%</span>
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">{scanResult.name}</h4>
                    <span className="text-xs text-slate-500 font-mono">{scanResult.sku} • {scanResult.category}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Current Stock</span>
                      <strong className="text-base text-slate-900 dark:text-white">{scanResult.stockQuantity} {scanResult.unit}</strong>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Unit Cost</span>
                      <strong className="text-base text-amber-600 dark:text-amber-400">{formatCurrency(scanResult.unitPrice)}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200">
                    Location: <strong>{scanResult.warehouseName}</strong> • Safety threshold OK.
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-xs text-slate-400 space-y-2">
                  <Scan className="w-8 h-8 mx-auto text-slate-300" />
                  <p>Scan a barcode or click a preset to inspect live SKU metadata</p>
                </div>
              )}

              {scanResult && (
                <button
                  onClick={() => {
                    sound.playSuccess();
                    updateStock(scanResult.id, 50, scanResult.warehouseId);
                    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
                    addToast('Stock Received', `Ingested +50 units of ${scanResult.name} to warehouse buffer.`, 'success');
                  }}
                  className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all hover:scale-102"
                >
                  Quick Ingest +50 Units to Warehouse ↵
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Product Register Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-fadeIn">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-600" /> Register New SKU in Master Catalog
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">SKU Identifier</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    value={productForm.unitPrice}
                    onChange={(e) => setProductForm({ ...productForm, unitPrice: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Ultra-Low Power RISC-V SoC"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Quantity</label>
                  <input
                    type="number"
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reorder Safety Level</label>
                  <input
                    type="number"
                    value={productForm.reorderLevel}
                    onChange={(e) => setProductForm({ ...productForm, reorderLevel: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Storage Warehouse</label>
                <select
                  value={productForm.warehouseId}
                  onChange={(e) => setProductForm({ ...productForm, warehouseId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow"
                >
                  Register SKU ↵
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock In / Out Modal */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-fadeIn">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-emerald-600" /> Execute Stock Movement
            </h3>

            <form onSubmit={handleStockSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select SKU</label>
                <select
                  value={stockForm.productId}
                  onChange={(e) => setStockForm({ ...stockForm, productId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.sku} — {p.name} (Current: {p.stockQuantity})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Movement Type</label>
                  <select
                    value={stockForm.type}
                    onChange={(e) => setStockForm({ ...stockForm, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    <option value="STOCK_IN">STOCK IN (Receiving)</option>
                    <option value="STOCK_OUT">STOCK OUT (Dispatch)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={stockForm.quantity}
                    onChange={(e) => setStockForm({ ...stockForm, quantity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Operation Reason / Reference</label>
                <input
                  type="text"
                  value={stockForm.reason}
                  onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow"
                >
                  Confirm Movement ↵
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

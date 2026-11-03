import React, { useState } from 'react';
import { 
  Warehouse, Box, Layers, AlertTriangle, CheckCircle2, Sparkles, 
  Scan, RefreshCw, Thermometer, ShieldCheck, ArrowRight, Search, 
  MapPin, Check, QrCode, ShieldAlert, Barcode, Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProcurement } from '../context/ProcurementContext';
import { formatCurrency } from '../utils/exportUtils';
import { sound } from '../utils/soundUtils';

export interface StorageBin {
  id: string; // e.g. "A-R1-T2-B3"
  aisle: 'A' | 'B' | 'C' | 'D';
  rackNumber: number;
  tierNumber: number;
  binNumber: number;
  sku: string;
  productName: string;
  currentUnits: number;
  maxUnits: number;
  lotNumber: string;
  expiryDate: string;
  daysToExpiry: number;
  temperature: string;
  status: 'OPTIMAL' | 'NEAR_EXPIRY' | 'QUARANTINE' | 'CONGESTED';
  rfidTagId: string;
}

const initialBins: StorageBin[] = [
  // Aisle A (Semiconductors)
  { id: 'A-R1-T1-B1', aisle: 'A', rackNumber: 1, tierNumber: 1, binNumber: 1, sku: 'SKU-MCU-01', productName: 'Cortex-M7 Microcontroller', currentUnits: 420, maxUnits: 500, lotNumber: 'LOT-2026-A91', expiryDate: '2027-05-12', daysToExpiry: 410, temperature: '20.2°C', status: 'OPTIMAL', rfidTagId: 'RFID-HEX-0012' },
  { id: 'A-R1-T1-B2', aisle: 'A', rackNumber: 1, tierNumber: 1, binNumber: 2, sku: 'SKU-MCU-01', productName: 'Cortex-M7 Microcontroller (Tray)', currentUnits: 480, maxUnits: 500, lotNumber: 'LOT-2026-A92', expiryDate: '2026-09-20', daysToExpiry: 18, temperature: '20.4°C', status: 'NEAR_EXPIRY', rfidTagId: 'RFID-HEX-0013' },
  { id: 'A-R1-T2-B1', aisle: 'A', rackNumber: 1, tierNumber: 2, binNumber: 1, sku: 'SKU-SEN-02', productName: 'Optocoupler Sensor IC', currentUnits: 120, maxUnits: 600, lotNumber: 'LOT-2026-B10', expiryDate: '2027-11-01', daysToExpiry: 580, temperature: '20.1°C', status: 'OPTIMAL', rfidTagId: 'RFID-HEX-0021' },
  { id: 'A-R1-T2-B2', aisle: 'A', rackNumber: 1, tierNumber: 2, binNumber: 2, sku: 'SKU-SEN-02', productName: 'Optocoupler Sensor IC', currentUnits: 570, maxUnits: 600, lotNumber: 'LOT-2026-B11', expiryDate: '2027-11-01', daysToExpiry: 580, temperature: '20.3°C', status: 'CONGESTED', rfidTagId: 'RFID-HEX-0022' },
  { id: 'A-R2-T1-B1', aisle: 'A', rackNumber: 2, tierNumber: 1, binNumber: 1, sku: 'SKU-MEM-07', productName: 'DDR4 SDRAM 16Gb ICs', currentUnits: 300, maxUnits: 400, lotNumber: 'LOT-2026-M04', expiryDate: '2028-01-15', daysToExpiry: 680, temperature: '19.8°C', status: 'OPTIMAL', rfidTagId: 'RFID-HEX-0035' },
  { id: 'A-R2-T2-B1', aisle: 'A', rackNumber: 2, tierNumber: 2, binNumber: 1, sku: 'SKU-FPGA-08', productName: 'Xilinx Kintex UltraScale+ FPGA', currentUnits: 85, maxUnits: 100, lotNumber: 'LOT-2026-X88', expiryDate: '2026-09-15', daysToExpiry: 13, temperature: '19.9°C', status: 'NEAR_EXPIRY', rfidTagId: 'RFID-HEX-0041' },

  // Aisle B (Passives)
  { id: 'B-R1-T1-B1', aisle: 'B', rackNumber: 1, tierNumber: 1, binNumber: 1, sku: 'SKU-CAP-03', productName: 'Solid Tantalum Capacitor 100uF', currentUnits: 4800, maxUnits: 5000, lotNumber: 'LOT-2026-C01', expiryDate: '2028-06-30', daysToExpiry: 820, temperature: '21.0°C', status: 'CONGESTED', rfidTagId: 'RFID-HEX-0050' },
  { id: 'B-R1-T2-B1', aisle: 'B', rackNumber: 1, tierNumber: 2, binNumber: 1, sku: 'SKU-RES-04', productName: 'Precision SMD Resistor Array', currentUnits: 3200, maxUnits: 5000, lotNumber: 'LOT-2026-R02', expiryDate: '2029-01-10', daysToExpiry: 1020, temperature: '21.1°C', status: 'OPTIMAL', rfidTagId: 'RFID-HEX-0062' },

  // Aisle C (Power Modules)
  { id: 'C-R1-T1-B1', aisle: 'C', rackNumber: 1, tierNumber: 1, binNumber: 1, sku: 'SKU-PWR-05', productName: '500W GaN Power Stage Module', currentUnits: 90, maxUnits: 120, lotNumber: 'LOT-2026-P99', expiryDate: '2027-08-25', daysToExpiry: 510, temperature: '19.4°C', status: 'OPTIMAL', rfidTagId: 'RFID-HEX-0077' },

  // Aisle D (Heavy Enclosures)
  { id: 'D-R1-T1-B1', aisle: 'D', rackNumber: 1, tierNumber: 1, binNumber: 1, sku: 'SKU-CNC-06', productName: 'Aerospace Anodized Aluminum Chasis', currentUnits: 64, maxUnits: 100, lotNumber: 'LOT-2026-H12', expiryDate: '2030-01-01', daysToExpiry: 1300, temperature: '22.0°C', status: 'OPTIMAL', rfidTagId: 'RFID-HEX-0089' },
];

export const WarehouseGodownVisualizer: React.FC = () => {
  const { addToast, logActivity, updateStock, products } = useProcurement();

  const [selectedAisle, setSelectedAisle] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [bins, setBins] = useState<StorageBin[]>(initialBins);
  const [selectedBin, setSelectedBin] = useState<StorageBin>(initialBins[0]);
  const [isScanningRfid, setIsScanningRfid] = useState<boolean>(false);
  const [rfidAuditResult, setRfidAuditResult] = useState<{
    scannedTags: number;
    matchCount: number;
    discrepancyCount: number;
    discrepancyBinId?: string;
    varianceDelta?: number;
  } | null>(null);

  const aisleBins = bins.filter(b => b.aisle === selectedAisle);

  const handleSelectBin = (bin: StorageBin) => {
    sound.playClick();
    setSelectedBin(bin);
  };

  const handleRunRfidCycleCount = () => {
    sound.playScan();
    setIsScanningRfid(true);
    setRfidAuditResult(null);

    setTimeout(() => {
      setIsScanningRfid(false);
      sound.playSuccess();

      // Simulate finding a minor shrinkage variance on selected bin
      const physicalCount = Math.max(0, selectedBin.currentUnits - 8);
      const variance = physicalCount - selectedBin.currentUnits;

      setRfidAuditResult({
        scannedTags: 24,
        matchCount: 23,
        discrepancyCount: 1,
        discrepancyBinId: selectedBin.id,
        varianceDelta: variance
      });

      addToast({
        title: 'RFID Wave Scan Completed',
        message: `Scanned 24 RFID multi-tags across Aisle ${selectedAisle}. Discrepancy detected at Bin ${selectedBin.id} (${variance} units).`,
        type: 'warning'
      });
    }, 1800);
  };

  const handleReconcileVariance = () => {
    if (!rfidAuditResult || !rfidAuditResult.discrepancyBinId) return;

    sound.playSuccess();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    const targetBin = bins.find(b => b.id === rfidAuditResult.discrepancyBinId);
    if (!targetBin) return;

    const newUnits = targetBin.currentUnits + (rfidAuditResult.varianceDelta || 0);

    setBins(prev => prev.map(b => {
      if (b.id === targetBin.id) {
        return {
          ...b,
          currentUnits: newUnits,
          status: 'OPTIMAL'
        };
      }
      return b;
    }));

    if (selectedBin.id === targetBin.id) {
      setSelectedBin(prev => ({ ...prev, currentUnits: newUnits }));
    }

    // Match product in context
    const prod = products.find(p => p.sku === targetBin.sku);
    if (prod) {
      updateStock(prod.id, newUnits);
    }

    logActivity(
      'INVENTORY',
      `RFID Cycle Count Reconciliation: Bin ${targetBin.id} (${targetBin.sku}) stock adjusted by ${rfidAuditResult.varianceDelta} units to reflect physical RFID scan count of ${newUnits}.`
    );

    addToast({
      title: 'Cycle Count Reconciled & Posted',
      message: `ERP perpetual inventory ledger synchronized with physical RFID sensor count for Bin ${targetBin.id}.`,
      type: 'success'
    });

    setRfidAuditResult(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-full text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <Warehouse className="w-3.5 h-3.5" />
            2D Godown Rack & Bin Locator with FEFO Expiry Matrix
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Interactive Godown Rack & Bin Digital Twin
          </h2>
          <p className="text-xs text-slate-500">
            Aisle, Rack, Tier, and Bin coordinate visualization with capacity utilization heatmaps, FEFO/FIFO expiry lot tracking, and RFID cycle count auditing.
          </p>
        </div>

        {/* RFID Scan Button */}
        <div className="flex items-center gap-3">
          <button
            disabled={isScanningRfid}
            onClick={handleRunRfidCycleCount}
            className={`px-4 py-2.5 rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition-all ${
              isScanningRfid
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            <Radio className={`w-4 h-4 ${isScanningRfid ? 'animate-spin' : ''}`} />
            {isScanningRfid ? 'Scanning RFID Wave...' : `Run RFID Scan on Aisle ${selectedAisle}`}
          </button>
        </div>
      </div>

      {/* Aisle Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {(['A', 'B', 'C', 'D'] as const).map(aisle => {
          const isSelected = selectedAisle === aisle;
          const label = 
            aisle === 'A' ? 'Aisle A - Semiconductors & ICs' :
            aisle === 'B' ? 'Aisle B - Passives & Capacitors' :
            aisle === 'C' ? 'Aisle C - Power Modules' :
            'Aisle D - Heavy Mechanical Chassis';

          return (
            <button
              key={aisle}
              onClick={() => { sound.playClick(); setSelectedAisle(aisle); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* RFID Audit Result Notification (if triggered) */}
      {rfidAuditResult && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
                RFID Physical Count Exception Detected
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Bin <strong className="font-mono">{rfidAuditResult.discrepancyBinId}</strong> has recorded ERP stock of {selectedBin.currentUnits} units, but physical RFID sensors detected {selectedBin.currentUnits + (rfidAuditResult.varianceDelta || 0)} units (Variance: <strong className="text-rose-500 font-mono">{rfidAuditResult.varianceDelta} units</strong>).
              </p>
            </div>
          </div>

          <button
            onClick={handleReconcileVariance}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black shadow flex items-center gap-1.5 whitespace-nowrap"
          >
            <CheckCircle2 className="w-4 h-4" /> Reconcile & Post Variance to Ledger
          </button>
        </div>
      )}

      {/* Main Grid: Visual 2D Rack Layout (8 cols) & Bin Detail Card (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Visual Rack Grid */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                2D Elevation Matrix: Aisle {selectedAisle}
              </span>
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Optimal (&lt;70%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Expiry Alert
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Full (&gt;90%)
              </span>
            </div>
          </div>

          {/* Isometric / Grid Rack Bays */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {aisleBins.map(bin => {
              const isSelected = selectedBin.id === bin.id;
              const occupancy = Math.round((bin.currentUnits / bin.maxUnits) * 100);
              const isNearExpiry = bin.daysToExpiry <= 30;

              return (
                <div
                  key={bin.id}
                  onClick={() => handleSelectBin(bin)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-500 shadow-md ring-2 ring-indigo-400/40'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400">
                      {bin.id}
                    </span>
                    {isNearExpiry ? (
                      <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded animate-pulse">
                        FEFO {bin.daysToExpiry}d
                      </span>
                    ) : occupancy >= 90 ? (
                      <span className="text-[9px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded">
                        90%+ Full
                      </span>
                    ) : (
                      <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded">
                        Optimal
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-xs text-slate-900 dark:text-white mt-2 truncate">
                    {bin.productName}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {bin.sku}
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">Utilization:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{occupancy}% ({bin.currentUnits}/{bin.maxUnits})</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          isNearExpiry 
                            ? 'bg-amber-500' 
                            : occupancy >= 90 
                              ? 'bg-rose-500' 
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, occupancy)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-500 flex items-center justify-between">
            <span>Aisle Location: Zone North Logistics Wing • Dock Bay D-04 access</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Temp Standard: 20.0°C ± 1.5°C</span>
          </div>
        </div>

        {/* Selected Bin Forensic Inspection Card */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Bin Telemetry & Lot Dossier
            </span>
            <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400">
              {selectedBin.id}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Product</span>
              <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                {selectedBin.productName}
              </div>
              <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{selectedBin.sku}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Lot Serial #</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{selectedBin.lotNumber}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Expiry Date (FEFO)</span>
                <div className={`font-mono font-bold mt-0.5 ${selectedBin.daysToExpiry <= 30 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                  {selectedBin.expiryDate}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Ambient Sensor</span>
                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5" /> {selectedBin.temperature}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">RFID Transponder</span>
                <div className="font-mono font-bold text-slate-700 dark:text-slate-300 mt-0.5">{selectedBin.rfidTagId}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Physical On-Hand:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedBin.currentUnits} units</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Bin Safe Capacity:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedBin.maxUnits} units</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">FIFO Rotation Status:</span>
                <span className="font-bold text-emerald-600">Active Picking Lot</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleRunRfidCycleCount}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Scan className="w-4 h-4" /> Trigger RFID Cycle Count on {selectedBin.id}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Calculator, Globe, Anchor, Truck, ShieldCheck, DollarSign, 
  ArrowRight, Download, BarChart2, Sparkles, Scale, Info, CheckCircle2,
  TrendingUp, TrendingDown, Layers, FileSpreadsheet, RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import confetti from 'canvas-confetti';
import { useProcurement } from '../context/ProcurementContext';
import { formatCurrency, exportToPDF, exportToExcel } from '../utils/exportUtils';
import { sound } from '../utils/soundUtils';

export const LandedCostTcoCalculator: React.FC = () => {
  const { addToast, logActivity } = useProcurement();

  // Volume & Logistics inputs
  const [orderQuantity, setOrderQuantity] = useState<number>(25000);
  const [containerRate40ft, setContainerRate40ft] = useState<number>(4200); // 40ft container freight
  const [unitsPerContainer, setUnitsPerContainer] = useState<number>(12500); // 2 containers total
  const [waccRate, setWaccRate] = useState<number>(9.5); // Weighted Average Cost of Capital %

  // Offshore (LCC) Parameters
  const [offshoreFob, setOffshoreFob] = useState<number>(14.80);
  const [offshoreHsCode, setOffshoreHsCode] = useState<string>('HS 8542.31');
  const [offshoreDutyPercent, setOffshoreDutyPercent] = useState<number>(7.5);
  const [offshoreTransitDays, setOffshoreTransitDays] = useState<number>(42);
  const [offshoreInsurancePercent, setOffshoreInsurancePercent] = useState<number>(0.35);
  const [offshoreDrayagePort, setOffshoreDrayagePort] = useState<number>(850);
  const [offshoreFxBufferPercent, setOffshoreFxBufferPercent] = useState<number>(2.0);
  const [offshoreCarbonLevyKg, setOffshoreCarbonLevyKg] = useState<number>(0.24); // CBAM
  const [offshoreDefectRate, setOffshoreDefectRate] = useState<number>(2.2);

  // Domestic / Nearshore Parameters
  const [domesticFob, setDomesticFob] = useState<number>(18.50);
  const [domesticFreightPerUnit, setDomesticFreightPerUnit] = useState<number>(0.65);
  const [domesticTransitDays, setDomesticTransitDays] = useState<number>(3);
  const [domesticDefectRate, setDomesticDefectRate] = useState<number>(0.6);
  const [domesticCarbonLevyKg, setDomesticCarbonLevyKg] = useState<number>(0.05);

  // Compute Offshore Waterfall
  const offshoreCalculations = useMemo(() => {
    const containersCount = Math.ceil(orderQuantity / unitsPerContainer);
    const totalOceanFreight = containersCount * containerRate40ft;
    const oceanFreightPerUnit = totalOceanFreight / orderQuantity;
    
    const insurancePerUnit = offshoreFob * (offshoreInsurancePercent / 100);
    const customsDutyPerUnit = (offshoreFob + oceanFreightPerUnit + insurancePerUnit) * (offshoreDutyPercent / 100);
    const harborProcessingPerUnit = 0.08; // HMF/MPF fees
    const inlandDrayagePerUnit = (containersCount * offshoreDrayagePort) / orderQuantity;

    // Landed Cost (Physical at Warehouse Dock)
    const landedCostPerUnit = offshoreFob + oceanFreightPerUnit + insurancePerUnit + customsDutyPerUnit + harborProcessingPerUnit + inlandDrayagePerUnit;

    // TCO Hidden Overhead
    const annualWaccDecimal = waccRate / 100;
    const workingCapitalCarryingPerUnit = (landedCostPerUnit * annualWaccDecimal * (offshoreTransitDays / 365));
    const fxRiskBufferPerUnit = offshoreFob * (offshoreFxBufferPercent / 100);
    const scrapReworkPerUnit = offshoreFob * (offshoreDefectRate / 100);
    const carbonTaxPerUnit = offshoreCarbonLevyKg * 0.12; // $0.12 per kg CO2

    const trueTcoPerUnit = landedCostPerUnit + workingCapitalCarryingPerUnit + fxRiskBufferPerUnit + scrapReworkPerUnit + carbonTaxPerUnit;
    const totalSpend = trueTcoPerUnit * orderQuantity;

    return {
      fob: offshoreFob,
      oceanFreightPerUnit,
      customsDutyPerUnit,
      drayageAndInsurance: inlandDrayagePerUnit + insurancePerUnit + harborProcessingPerUnit,
      landedCostPerUnit,
      workingCapitalCarryingPerUnit,
      fxRiskBufferPerUnit,
      scrapReworkPerUnit,
      carbonTaxPerUnit,
      trueTcoPerUnit,
      totalSpend
    };
  }, [orderQuantity, containerRate40ft, unitsPerContainer, offshoreFob, offshoreDutyPercent, offshoreTransitDays, offshoreInsurancePercent, offshoreDrayagePort, offshoreFxBufferPercent, offshoreCarbonLevyKg, offshoreDefectRate, waccRate]);

  // Compute Domestic Waterfall
  const domesticCalculations = useMemo(() => {
    const landedCostPerUnit = domesticFob + domesticFreightPerUnit;
    
    const annualWaccDecimal = waccRate / 100;
    const workingCapitalCarryingPerUnit = (landedCostPerUnit * annualWaccDecimal * (domesticTransitDays / 365));
    const scrapReworkPerUnit = domesticFob * (domesticDefectRate / 100);
    const carbonTaxPerUnit = domesticCarbonLevyKg * 0.12;

    const trueTcoPerUnit = landedCostPerUnit + workingCapitalCarryingPerUnit + scrapReworkPerUnit + carbonTaxPerUnit;
    const totalSpend = trueTcoPerUnit * orderQuantity;

    return {
      fob: domesticFob,
      freightPerUnit: domesticFreightPerUnit,
      landedCostPerUnit,
      workingCapitalCarryingPerUnit,
      scrapReworkPerUnit,
      carbonTaxPerUnit,
      trueTcoPerUnit,
      totalSpend
    };
  }, [orderQuantity, domesticFob, domesticFreightPerUnit, domesticTransitDays, domesticDefectRate, domesticCarbonLevyKg, waccRate]);

  // TCO Savings Delta
  const tcoDeltaPerUnit = domesticCalculations.trueTcoPerUnit - offshoreCalculations.trueTcoPerUnit;
  const totalTcoDelta = domesticCalculations.totalSpend - offshoreCalculations.totalSpend;
  const isOffshoreFavorable = tcoDeltaPerUnit > 0;

  // Chart Data: Waterfall Comparison
  const chartData = [
    {
      category: 'Ex-Works / FOB Price',
      Offshore: Number(offshoreCalculations.fob.toFixed(2)),
      Domestic: Number(domesticCalculations.fob.toFixed(2)),
    },
    {
      category: 'International Freight & Harbor',
      Offshore: Number(offshoreCalculations.oceanFreightPerUnit.toFixed(2)),
      Domestic: Number(domesticCalculations.freightPerUnit.toFixed(2)),
    },
    {
      category: 'Customs Duty & Tariffs',
      Offshore: Number(offshoreCalculations.customsDutyPerUnit.toFixed(2)),
      Domestic: 0,
    },
    {
      category: 'Inland Drayage & Insurance',
      Offshore: Number(offshoreCalculations.drayageAndInsurance.toFixed(2)),
      Domestic: 0,
    },
    {
      category: 'Hidden TCO (Transit Capital & Scrap)',
      Offshore: Number((offshoreCalculations.workingCapitalCarryingPerUnit + offshoreCalculations.scrapReworkPerUnit + offshoreCalculations.fxRiskBufferPerUnit + offshoreCalculations.carbonTaxPerUnit).toFixed(2)),
      Domestic: Number((domesticCalculations.workingCapitalCarryingPerUnit + domesticCalculations.scrapReworkPerUnit + domesticCalculations.carbonTaxPerUnit).toFixed(2)),
    },
    {
      category: 'TOTAL TRUE TCO / UNIT',
      Offshore: Number(offshoreCalculations.trueTcoPerUnit.toFixed(2)),
      Domestic: Number(domesticCalculations.trueTcoPerUnit.toFixed(2)),
    }
  ];

  const handleExportTcoPDF = () => {
    sound.playClick();
    const headers = ['Cost Element', 'Offshore / LCC (Shenzhen)', 'Domestic Nearshore (Austin)', 'Variance Delta'];
    const rows = [
      ['Ex-Works (FOB) Unit Price', formatCurrency(offshoreCalculations.fob), formatCurrency(domesticCalculations.fob), formatCurrency(domesticCalculations.fob - offshoreCalculations.fob)],
      ['Freight (Ocean/Domestic)', formatCurrency(offshoreCalculations.oceanFreightPerUnit), formatCurrency(domesticCalculations.freightPerUnit), formatCurrency(domesticCalculations.freightPerUnit - offshoreCalculations.oceanFreightPerUnit)],
      ['Customs Tariff (HS Code)', formatCurrency(offshoreCalculations.customsDutyPerUnit), '$0.00', `-${formatCurrency(offshoreCalculations.customsDutyPerUnit)}`],
      ['Drayage, Harbor, Insurance', formatCurrency(offshoreCalculations.drayageAndInsurance), '$0.00', `-${formatCurrency(offshoreCalculations.drayageAndInsurance)}`],
      ['Dock Landed Cost / Unit', formatCurrency(offshoreCalculations.landedCostPerUnit), formatCurrency(domesticCalculations.landedCostPerUnit), formatCurrency(domesticCalculations.landedCostPerUnit - offshoreCalculations.landedCostPerUnit)],
      ['Transit Capital Lockup (WACC)', formatCurrency(offshoreCalculations.workingCapitalCarryingPerUnit), formatCurrency(domesticCalculations.workingCapitalCarryingPerUnit), formatCurrency(domesticCalculations.workingCapitalCarryingPerUnit - offshoreCalculations.workingCapitalCarryingPerUnit)],
      ['Scrap, Defect & Rework Risk', formatCurrency(offshoreCalculations.scrapReworkPerUnit), formatCurrency(domesticCalculations.scrapReworkPerUnit), formatCurrency(domesticCalculations.scrapReworkPerUnit - offshoreCalculations.scrapReworkPerUnit)],
      ['FX Buffer & Carbon Tax', formatCurrency(offshoreCalculations.fxRiskBufferPerUnit + offshoreCalculations.carbonTaxPerUnit), formatCurrency(domesticCalculations.carbonTaxPerUnit), formatCurrency(domesticCalculations.carbonTaxPerUnit - (offshoreCalculations.fxRiskBufferPerUnit + offshoreCalculations.carbonTaxPerUnit))],
      ['TRUE TCO PER UNIT', formatCurrency(offshoreCalculations.trueTcoPerUnit), formatCurrency(domesticCalculations.trueTcoPerUnit), formatCurrency(domesticCalculations.trueTcoPerUnit - offshoreCalculations.trueTcoPerUnit)],
      ['TOTAL CAMPAIGN SPEND', formatCurrency(offshoreCalculations.totalSpend), formatCurrency(domesticCalculations.totalSpend), formatCurrency(totalTcoDelta)]
    ];

    exportToPDF(
      `Landed Cost & TCO Comparative Analysis - ${orderQuantity.toLocaleString()} Units`,
      headers,
      rows,
      `TCO_Report_${Date.now()}`
    );

    addToast({
      title: 'TCO Report Exported',
      message: 'Comprehensive Landed Cost & Total Cost of Ownership report exported as PDF.',
      type: 'info'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Deck */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-full text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            Total Cost of Ownership (TCO) & Landed Cost Simulator
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Landed Cost & Total Cost of Ownership (TCO) Engine
          </h2>
          <p className="text-xs text-slate-500">
            Uncover the true holistic cost of goods beyond invoice price: Ocean freight, HS code customs tariffs, port drayage, transit working capital lockup, and scrap risk.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportTcoPDF}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Download className="w-4 h-4" /> Export TCO Decision Memo
          </button>
        </div>
      </div>

      {/* Decision Verdict Banner */}
      <div className={`p-6 rounded-2xl border shadow-lg relative overflow-hidden ${
        isOffshoreFavorable 
          ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border-emerald-500/40 text-white' 
          : 'bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-blue-500/40 text-white'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Strategic Sourcing Recommendation
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              {isOffshoreFavorable ? (
                <>Offshore Sourcing Yields <span className="text-emerald-400 font-mono">{formatCurrency(totalTcoDelta)}</span> Net TCO Advantage</>
              ) : (
                <>Domestic Sourcing Prevents Surcharge Drift: Net Advantage <span className="text-blue-400 font-mono">{formatCurrency(Math.abs(totalTcoDelta))}</span></>
              )}
            </h3>
            <p className="text-xs text-slate-300">
              Nominal FOB price spread is {formatCurrency(Math.abs(domesticCalculations.fob - offshoreCalculations.fob))}/unit. After factoring freight, {offshoreDutyPercent}% tariffs, 42-day carrying cost, and scrap, the true net margin difference narrows to {formatCurrency(Math.abs(tcoDeltaPerUnit))}/unit.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-white/10">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Offshore True TCO</span>
              <div className="text-xl font-mono font-black text-emerald-400">
                {formatCurrency(offshoreCalculations.trueTcoPerUnit)}
              </div>
              <span className="text-[10px] text-slate-400">Total: {formatCurrency(offshoreCalculations.totalSpend)}</span>
            </div>

            <div className="h-10 w-px bg-slate-700"></div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Domestic True TCO</span>
              <div className="text-xl font-mono font-black text-blue-400">
                {formatCurrency(domesticCalculations.trueTcoPerUnit)}
              </div>
              <span className="text-[10px] text-slate-400">Total: {formatCurrency(domesticCalculations.totalSpend)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Sliders: Batch & Logistics Parameters */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Global Macro & Volume Levers
          </span>
          <span className="text-xs font-mono text-slate-400">Adjust in real-time to simulate tariff surges or container price spikes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Order Quantity */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600 dark:text-slate-300">Order Batch Volume</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{orderQuantity.toLocaleString()} units</span>
            </div>
            <input
              type="range"
              min={5000}
              max={100000}
              step={5000}
              value={orderQuantity}
              onChange={(e) => setOrderQuantity(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* 40ft Container Spot Rate */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600 dark:text-slate-300">40ft Ocean Container Spot</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(containerRate40ft)}</span>
            </div>
            <input
              type="range"
              min={1500}
              max={12000}
              step={250}
              value={containerRate40ft}
              onChange={(e) => setContainerRate40ft(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Customs Duty / Tariff */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600 dark:text-slate-300">HS Code Tariff Rate</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{offshoreDutyPercent}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={0.5}
              value={offshoreDutyPercent}
              onChange={(e) => setOffshoreDutyPercent(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* WACC Capital Cost */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600 dark:text-slate-300">Cost of Capital (WACC)</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{waccRate}%</span>
            </div>
            <input
              type="range"
              min={4}
              max={18}
              step={0.5}
              value={waccRate}
              onChange={(e) => setWaccRate(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Visual Chart Comparison: Stacked Waterfall */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Holistic Cost Waterfall: Offshore (Shenzhen) vs Domestic (Austin)
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Expressed in USD per finished unit</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `$${v}`} tickLine={false} />
              <Tooltip 
                formatter={(val: any) => [`$${Number(val).toFixed(2)}`, '']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Offshore" fill="#10b981" radius={[4, 4, 0, 0]} name="Offshore / LCC (Shenzhen)" />
              <Bar dataKey="Domestic" fill="#6366f1" radius={[4, 4, 0, 0]} name="Domestic Nearshore (Austin)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Side-by-Side Table Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Offshore Spec */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Anchor className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black uppercase text-slate-900 dark:text-white">
                Offshore Low-Cost Country (LCC)
              </span>
            </div>
            <span className="text-xs font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
              {offshoreTransitDays} Days Maritime Transit
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Ex-Works (FOB) Invoice:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(offshoreCalculations.fob)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Ocean Freight (40ft High Cube):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">+{formatCurrency(offshoreCalculations.oceanFreightPerUnit)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Customs Tariff ({offshoreHsCode} @ {offshoreDutyPercent}%):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">+{formatCurrency(offshoreCalculations.customsDutyPerUnit)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Inland Drayage & Marine Cargo Insurance:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">+{formatCurrency(offshoreCalculations.drayageAndInsurance)}</span>
            </div>
            <div className="flex justify-between py-1.5 font-bold bg-slate-50 dark:bg-slate-800/50 px-2 rounded">
              <span className="text-slate-700 dark:text-slate-200">Warehouse Dock Landed Cost:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(offshoreCalculations.landedCostPerUnit)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Transit Inventory Lockup (WACC {waccRate}%):</span>
              <span className="font-mono font-bold text-amber-600">+{formatCurrency(offshoreCalculations.workingCapitalCarryingPerUnit)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Quality Defect Scrap (AQL 2.2%):</span>
              <span className="font-mono font-bold text-rose-500">+{formatCurrency(offshoreCalculations.scrapReworkPerUnit)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">FX Hedge Buffer & CBAM Carbon Tax:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">+{formatCurrency(offshoreCalculations.fxRiskBufferPerUnit + offshoreCalculations.carbonTaxPerUnit)}</span>
            </div>
            <div className="flex justify-between pt-2 font-black text-sm text-slate-900 dark:text-white">
              <span>TRUE OFFSHORE TCO / UNIT:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(offshoreCalculations.trueTcoPerUnit)}</span>
            </div>
          </div>
        </div>

        {/* Domestic Spec */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-black uppercase text-slate-900 dark:text-white">
                Domestic / Nearshore Sourcing
              </span>
            </div>
            <span className="text-xs font-mono bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-bold">
              {domesticTransitDays} Days Ground Trucking
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Domestic Factory Invoice:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(domesticCalculations.fob)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Ground LTL / FTL Freight:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">+{formatCurrency(domesticCalculations.freightPerUnit)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Customs Tariff & Import Duties:</span>
              <span className="font-mono font-bold text-emerald-600">$0.00 (Tariff Exempt)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Harbor & Drayage Fees:</span>
              <span className="font-mono font-bold text-emerald-600">$0.00</span>
            </div>
            <div className="flex justify-between py-1.5 font-bold bg-slate-50 dark:bg-slate-800/50 px-2 rounded">
              <span className="text-slate-700 dark:text-slate-200">Warehouse Dock Landed Cost:</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">{formatCurrency(domesticCalculations.landedCostPerUnit)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Transit Inventory Lockup (3 days):</span>
              <span className="font-mono font-bold text-emerald-600">+{formatCurrency(domesticCalculations.workingCapitalCarryingPerUnit)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Quality Defect Scrap (0.6%):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">+{formatCurrency(domesticCalculations.scrapReworkPerUnit)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Carbon & Regulatory Footprint:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">+{formatCurrency(domesticCalculations.carbonTaxPerUnit)}</span>
            </div>
            <div className="flex justify-between pt-2 font-black text-sm text-slate-900 dark:text-white">
              <span>TRUE DOMESTIC TCO / UNIT:</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">{formatCurrency(domesticCalculations.trueTcoPerUnit)}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

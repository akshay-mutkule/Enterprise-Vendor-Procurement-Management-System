import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, Sliders, TrendingDown, Clock, ShieldAlert, Award, Play, Pause, 
  RotateCcw, Download, Sparkles, FileText, ArrowUpRight, ArrowDownRight, 
  CheckCircle2, DollarSign, Layers, ChevronRight, RefreshCw, BarChart2,
  Package, Building2, AlertTriangle, Zap, Check
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';
import confetti from 'canvas-confetti';
import { useProcurement } from '../context/ProcurementContext';
import { KraljicItem, KraljicQuadrant, ReverseAuctionBid } from '../types';
import { formatCurrency, exportToPDF, exportToExcel } from '../utils/exportUtils';
import { sound } from '../utils/soundUtils';

export const StrategicSourcingView: React.FC = () => {
  const { 
    kraljicItems, updateKraljicItem, awardReverseAuction, 
    addToast, logActivity, purchaseOrders 
  } = useProcurement();

  const [activeTab, setActiveTab] = useState<'KRALJIC' | 'E_AUCTION' | 'SCENARIO'>('KRALJIC');
  const [selectedItemId, setSelectedItemId] = useState<string>(kraljicItems[0]?.id || 'k-1');
  const [filterQuadrant, setFilterQuadrant] = useState<string>('ALL');

  // Selected Kraljic Item
  const selectedItem = useMemo(() => {
    return kraljicItems.find(k => k.id === selectedItemId) || kraljicItems[0];
  }, [kraljicItems, selectedItemId]);

  // Edit sliders for selected item
  const [editProfitImpact, setEditProfitImpact] = useState<number>(selectedItem?.profitImpact || 80);
  const [editSupplyRisk, setEditSupplyRisk] = useState<number>(selectedItem?.supplyRisk || 75);

  useEffect(() => {
    if (selectedItem) {
      setEditProfitImpact(selectedItem.profitImpact);
      setEditSupplyRisk(selectedItem.supplyRisk);
    }
  }, [selectedItem]);

  const handleSavePosition = () => {
    if (!selectedItem) return;
    updateKraljicItem(selectedItem.id, {
      profitImpact: editProfitImpact,
      supplyRisk: editSupplyRisk
    });
    sound.playSuccess();
  };

  // e-Auction State
  const initialReservePrice = 85000;
  const [auctionLotName, setAuctionLotName] = useState('High-Precision Microcontrollers (STM32) - 50k Unit Batch');
  const [auctionTimeLeft, setAuctionTimeLeft] = useState<number>(180); // 3 minutes
  const [isAuctionRunning, setIsAuctionRunning] = useState<boolean>(false);
  const [auctionAwarded, setAuctionAwarded] = useState<boolean>(false);

  const [bids, setBids] = useState<ReverseAuctionBid[]>([
    { id: 'b-1', vendorId: 'v-101', vendorName: 'Apex Components Ltd', bidAmount: 84200, timestamp: '14:20:12', rank: 4, deliveryDays: 28, complianceRating: 4.8 },
    { id: 'b-2', vendorId: 'v-103', vendorName: 'MicroPrecision Technologies', bidAmount: 81500, timestamp: '14:21:40', rank: 3, deliveryDays: 24, complianceRating: 4.6 },
    { id: 'b-3', vendorId: 'v-108', vendorName: 'Dynatech Micro Systems', bidAmount: 78900, timestamp: '14:22:15', rank: 2, deliveryDays: 21, complianceRating: 4.7 },
    { id: 'b-4', vendorId: 'v-102', vendorName: 'Global Precision Tech', bidAmount: 75400, timestamp: '14:23:02', rank: 1, deliveryDays: 18, complianceRating: 4.9 }
  ]);

  // Current lowest bid
  const lowestBid = useMemo(() => {
    return bids.reduce((min, b) => b.bidAmount < min.bidAmount ? b : min, bids[0]);
  }, [bids]);

  const totalAuctionSavings = initialReservePrice - lowestBid.bidAmount;
  const savingsPercent = ((totalAuctionSavings / initialReservePrice) * 100).toFixed(1);

  // Timer & automated competitive bidding simulation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isAuctionRunning && auctionTimeLeft > 0 && !auctionAwarded) {
      interval = setInterval(() => {
        setAuctionTimeLeft(prev => {
          if (prev <= 1) {
            setIsAuctionRunning(false);
            sound.playSuccess();
            addToast('Auction Time Elapsed', 'Bidding closed. Ready for managerial contract award.', 'info');
            return 0;
          }
          // Simulate automated counter-bids occasionally
          if (prev % 15 === 0 && Math.random() > 0.3) {
            const vendorsPool = [
              { id: 'v-101', name: 'Apex Components Ltd', delivery: 25, rating: 4.8 },
              { id: 'v-108', name: 'Dynatech Micro Systems', delivery: 20, rating: 4.7 },
              { id: 'v-102', name: 'Global Precision Tech', delivery: 18, rating: 4.9 },
            ];
            const randomVendor = vendorsPool[Math.floor(Math.random() * vendorsPool.length)];
            const decrement = Math.floor(400 + Math.random() * 800);
            const currentLowest = Math.min(...bids.map(b => b.bidAmount));
            const newAmount = Math.max(68000, currentLowest - decrement);

            if (newAmount < currentLowest) {
              const newBid: ReverseAuctionBid = {
                id: `b-${Date.now()}`,
                vendorId: randomVendor.id,
                vendorName: randomVendor.name,
                bidAmount: newAmount,
                timestamp: new Date().toLocaleTimeString(),
                rank: 1,
                deliveryDays: randomVendor.delivery,
                complianceRating: randomVendor.rating
              };

              setBids(prevBids => {
                const updated = [newBid, ...prevBids].map((b) => {
                  return b;
                }).sort((a, b) => a.bidAmount - b.bidAmount);
                return updated.map((b, idx) => ({ ...b, rank: idx + 1 }));
              });
              sound.playScan();
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuctionRunning, auctionTimeLeft, auctionAwarded, bids, addToast]);

  const handlePlaceManualBid = (reduction: number) => {
    sound.playClick();
    const newAmount = lowestBid.bidAmount - reduction;
    if (newAmount <= 50000) {
      addToast('Floor Price Reached', 'Bid cannot fall below supplier manufacturing cost limit.', 'warning');
      return;
    }
    const newBid: ReverseAuctionBid = {
      id: `b-${Date.now()}`,
      vendorId: 'v-sim',
      vendorName: 'Direct Portal Bidder (Live)',
      bidAmount: newAmount,
      timestamp: new Date().toLocaleTimeString(),
      rank: 1,
      deliveryDays: 16,
      complianceRating: 5.0
    };
    setBids(prev => {
      const updated = [newBid, ...prev].sort((a, b) => a.bidAmount - b.bidAmount);
      return updated.map((b, idx) => ({ ...b, rank: idx + 1 }));
    });
    addToast('Counter-Bid Accepted', `New lowest bid recorded at ${formatCurrency(newAmount)}`, 'success');
  };

  const handleAwardContract = () => {
    sound.playSuccess();
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 }
    });
    setAuctionAwarded(true);
    setIsAuctionRunning(false);
    awardReverseAuction(
      auctionLotName,
      { id: lowestBid.vendorId, name: lowestBid.vendorName },
      lowestBid.bidAmount,
      [
        {
          productName: auctionLotName,
          quantity: 50000,
          unitPrice: Number((lowestBid.bidAmount / 50000).toFixed(2)),
          totalPrice: lowestBid.bidAmount
        }
      ]
    );
  };

  // Scenario Simulator State
  const totalBaseSpend = useMemo(() => {
    return purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0) || 1250000;
  }, [purchaseOrders]);

  const [rawMaterialInflation, setRawMaterialInflation] = useState<number>(8); // %
  const [freightTariffSurge, setFreightTariffSurge] = useState<number>(12); // %
  const [fxVolatility, setFxVolatility] = useState<number>(4); // %
  const [leadTimeSlippage, setLeadTimeSlippage] = useState<number>(14); // days
  const [safetyBufferMultiplier, setSafetyBufferMultiplier] = useState<number>(1.25); // x

  // Calculated Scenario Metrics
  const spendDelta = useMemo(() => {
    const rawWeight = 0.50;
    const freightWeight = 0.30;
    const fxWeight = 0.20;
    const compositeRate = (rawMaterialInflation * rawWeight + freightTariffSurge * freightWeight + fxVolatility * fxWeight) / 100;
    return totalBaseSpend * compositeRate;
  }, [totalBaseSpend, rawMaterialInflation, freightTariffSurge, fxVolatility]);

  const projectedTotalSpend = totalBaseSpend + spendDelta;
  const stockoutRiskPercent = Math.min(95, Math.max(5, Math.round((leadTimeSlippage / 45) * 60 + (rawMaterialInflation / 30) * 20)));
  const daysInventoryRunway = Math.max(8, Math.round(45 * safetyBufferMultiplier - (leadTimeSlippage * 0.5)));
  const workingCapitalBuffer = Math.round(spendDelta * 0.45);

  const scenarioComparisonData = [
    { category: 'Electronics', baseline: 420000, scenario: 420000 * (1 + (rawMaterialInflation * 0.012 + freightTariffSurge * 0.005)) },
    { category: 'Metals & Alloys', baseline: 280000, scenario: 280000 * (1 + (rawMaterialInflation * 0.015 + freightTariffSurge * 0.004)) },
    { category: 'Optics & Sensors', baseline: 190000, scenario: 190000 * (1 + (rawMaterialInflation * 0.008 + freightTariffSurge * 0.006)) },
    { category: 'Energy Storage', baseline: 240000, scenario: 240000 * (1 + (rawMaterialInflation * 0.014 + freightTariffSurge * 0.003)) },
    { category: 'Packaging', baseline: 120000, scenario: 120000 * (1 + (rawMaterialInflation * 0.004 + freightTariffSurge * 0.009)) },
  ];

  const handleCommitScenario = () => {
    sound.playSuccess();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    logActivity('COMMIT_SCENARIO', 'SYSTEM', `Committed strategic budget scenario: spend delta of +${formatCurrency(spendDelta)}`);
    addToast('Scenario Model Committed', `Variance of +${formatCurrency(spendDelta)} recorded in financial governance ledger.`, 'success');
  };

  const handleExportScenarioPDF = () => {
    const headers = ['Category', 'Baseline ($)', 'Projected Scenario ($)', 'Variance ($)'];
    const rows = scenarioComparisonData.map(d => [
      d.category,
      formatCurrency(d.baseline),
      formatCurrency(d.scenario),
      `+${formatCurrency(d.scenario - d.baseline)}`
    ]);
    exportToPDF('Strategic Spend Sensitivity Scenario Report', headers, rows, 'Spend_Scenario_Analysis_2026');
    addToast('Export Generated', 'Scenario PDF analysis successfully downloaded.', 'info');
  };

  const handleExportScenarioExcel = () => {
    const data = scenarioComparisonData.map(d => ({
      Category: d.category,
      BaselineSpend: d.baseline,
      ProjectedScenarioSpend: Math.round(d.scenario),
      VarianceDelta: Math.round(d.scenario - d.baseline),
      RawInflationParam: `${rawMaterialInflation}%`,
      FreightSurgeParam: `${freightTariffSurge}%`,
      FXVolatilityParam: `${fxVolatility}%`
    }));
    exportToExcel(data, 'Strategic_Spend_Scenario_Analysis');
    addToast('Excel Exported', 'Workbook exported successfully.', 'info');
  };

  // Quadrant Summary Metrics
  const quadrantCounts = useMemo(() => {
    const counts = { STRATEGIC: 0, BOTTLENECK: 0, LEVERAGE: 0, NON_CRITICAL: 0 };
    const spends = { STRATEGIC: 0, BOTTLENECK: 0, LEVERAGE: 0, NON_CRITICAL: 0 };
    kraljicItems.forEach(item => {
      counts[item.quadrant]++;
      spends[item.quadrant] += item.annualSpend;
    });
    return { counts, spends };
  }, [kraljicItems]);

  const filteredItems = kraljicItems.filter(item => {
    if (filterQuadrant === 'ALL') return true;
    return item.quadrant === filterQuadrant;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-2">
              <Target className="w-4 h-4" />
              <span>STRATEGIC SOURCING & DECISION GOVERNANCE</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">Kraljic Portfolio Matrix & e-Auction Arena</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Strategic Sourcing & Scenario Simulator
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Segment suppliers across profit impact and supply risk, run live dynamic RFQ reverse auctions, and stress-test procurement budgets against tariff and inflation shocks.
            </p>
          </div>

          {/* Navigation Segmented Controls */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('KRALJIC')}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'KRALJIC' 
                  ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Kraljic Portfolio Matrix</span>
            </button>
            <button
              onClick={() => setActiveTab('E_AUCTION')}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'E_AUCTION' 
                  ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Live e-Auction Arena</span>
              {isAuctionRunning && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('SCENARIO')}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'SCENARIO' 
                  ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Sensitivity Simulator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Kraljic Portfolio Matrix */}
      {activeTab === 'KRALJIC' && (
        <div className="space-y-6">
          
          {/* Quadrant Overview Metric Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Strategic Card */}
            <div 
              onClick={() => setFilterQuadrant(filterQuadrant === 'STRATEGIC' ? 'ALL' : 'STRATEGIC')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                filterQuadrant === 'STRATEGIC' 
                  ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-500 shadow-sm' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-bold mb-1">
                <span>Strategic Quadrant</span>
                <span className="font-mono tabular-nums">{quadrantCounts.counts.STRATEGIC} Items</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(quadrantCounts.spends.STRATEGIC)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">High Profit Impact · High Supply Risk</p>
            </div>

            {/* Bottleneck Card */}
            <div 
              onClick={() => setFilterQuadrant(filterQuadrant === 'BOTTLENECK' ? 'ALL' : 'BOTTLENECK')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                filterQuadrant === 'BOTTLENECK' 
                  ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-500 shadow-sm' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-bold mb-1">
                <span>Bottleneck Quadrant</span>
                <span className="font-mono tabular-nums">{quadrantCounts.counts.BOTTLENECK} Items</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(quadrantCounts.spends.BOTTLENECK)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Low Profit Impact · High Supply Risk</p>
            </div>

            {/* Leverage Card */}
            <div 
              onClick={() => setFilterQuadrant(filterQuadrant === 'LEVERAGE' ? 'ALL' : 'LEVERAGE')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                filterQuadrant === 'LEVERAGE' 
                  ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 shadow-sm' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-1">
                <span>Leverage Quadrant</span>
                <span className="font-mono tabular-nums">{quadrantCounts.counts.LEVERAGE} Items</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(quadrantCounts.spends.LEVERAGE)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">High Profit Impact · Low Supply Risk</p>
            </div>

            {/* Non-Critical Card */}
            <div 
              onClick={() => setFilterQuadrant(filterQuadrant === 'NON_CRITICAL' ? 'ALL' : 'NON_CRITICAL')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                filterQuadrant === 'NON_CRITICAL' 
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-500 shadow-sm' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-bold mb-1">
                <span>Non-Critical Quadrant</span>
                <span className="font-mono tabular-nums">{quadrantCounts.counts.NON_CRITICAL} Items</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(quadrantCounts.spends.NON_CRITICAL)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Low Profit Impact · Low Supply Risk</p>
            </div>

          </div>

          {/* Main 2x2 Matrix & Item Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Visual 2x2 Quadrant Chart (Col span 2) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Kraljic Portfolio Matrix (Interactive Sourcing Space)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click any supplier bubble to inspect risk profile, strategic playbooks, and recalibrate coordinates.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Showing {filteredItems.length} of {kraljicItems.length}
                </span>
              </div>

              {/* Matrix Canvas Container */}
              <div className="relative w-full aspect-[4/3] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden select-none">
                
                {/* Quadrant Background Dividers & Labels */}
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                  
                  {/* Top-Left: Bottleneck */}
                  <div className="border-r border-b border-dashed border-slate-300 dark:border-slate-800 p-3 bg-amber-500/5 flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Bottleneck
                    </span>
                    <span className="text-[10px] text-slate-400">Secure supply · Buffer inventory</span>
                  </div>

                  {/* Top-Right: Strategic */}
                  <div className="border-b border-dashed border-slate-300 dark:border-slate-800 p-3 bg-rose-500/5 flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      Strategic
                    </span>
                    <span className="text-[10px] text-slate-400">Long-term alliance · Joint risk sharing</span>
                  </div>

                  {/* Bottom-Left: Non-Critical */}
                  <div className="border-r border-dashed border-slate-300 dark:border-slate-800 p-3 bg-slate-500/5 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400">Standardize specs · Automated catalogs</span>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Non-Critical
                    </span>
                  </div>

                  {/* Bottom-Right: Leverage */}
                  <div className="p-3 bg-indigo-500/5 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400">Reverse auctions · Volume consolidation</span>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Leverage
                    </span>
                  </div>

                </div>

                {/* Axis Labels */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-slate-400 tracking-wider">
                  PROFIT / SPEND IMPACT →
                </div>
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 tracking-wider">
                  SUPPLY / MARKET RISK →
                </div>

                {/* Bubbles on Canvas */}
                {kraljicItems.map(item => {
                  const isSelected = item.id === selectedItemId;
                  const isFiltered = filterQuadrant === 'ALL' || item.quadrant === filterQuadrant;
                  if (!isFiltered) return null;

                  // Coordinates (0 to 100%)
                  const posX = Math.max(10, Math.min(90, item.supplyRisk));
                  const posY = Math.max(10, Math.min(90, 100 - item.profitImpact)); // inverted Y
                  
                  // Bubble size relative to annual spend
                  const bubbleRadius = Math.max(28, Math.min(48, Math.round((item.annualSpend / 350000) * 36) + 16));

                  let colorClass = 'bg-slate-600 border-slate-400 text-white';
                  if (item.quadrant === 'STRATEGIC') colorClass = 'bg-rose-600 border-rose-400 text-white';
                  if (item.quadrant === 'BOTTLENECK') colorClass = 'bg-amber-600 border-amber-400 text-white';
                  if (item.quadrant === 'LEVERAGE') colorClass = 'bg-indigo-600 border-indigo-400 text-white';

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedItemId(item.id);
                        sound.playClick();
                      }}
                      style={{
                        left: `${posX}%`,
                        top: `${posY}%`,
                        width: `${bubbleRadius}px`,
                        height: `${bubbleRadius}px`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className={`absolute rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border-2 shadow-md ${colorClass} ${
                        isSelected 
                          ? 'ring-4 ring-indigo-500 scale-110 z-20 shadow-xl' 
                          : 'opacity-90 hover:opacity-100 hover:scale-105 z-10'
                      }`}
                      title={`${item.name} (${item.vendorName}) - ${formatCurrency(item.annualSpend)}`}
                    >
                      <span className="text-[9px] font-bold font-mono tracking-tighter truncate max-w-[85%] text-center px-1">
                        {item.name.substring(0, 12)}
                      </span>
                      <span className="text-[8px] font-mono tabular-nums opacity-90">
                        {Math.round(item.annualSpend / 1000)}k
                      </span>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Selected Item Profile & Recalibration Drawer */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                      {selectedItem.category} · {selectedItem.quadrant}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedItem.name}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    selectedItem.quadrant === 'STRATEGIC' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' :
                    selectedItem.quadrant === 'BOTTLENECK' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                    selectedItem.quadrant === 'LEVERAGE' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {selectedItem.quadrant}
                  </span>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Annual Spend</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white tabular-nums text-sm">
                      {formatCurrency(selectedItem.annualSpend)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Contracted Vendor</span>
                    <span className="font-bold text-slate-900 dark:text-white truncate block">
                      {selectedItem.vendorName}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Standard Lead Time</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                      {selectedItem.leadTimeDays} Days
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Single-Source Risk</span>
                    <span className={`font-bold ${selectedItem.singleSourceVulnerability ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {selectedItem.singleSourceVulnerability ? 'Vulnerable (Solo)' : 'Dual-Sourced'}
                    </span>
                  </div>
                </div>

                {/* Strategic Sourcing Playbook */}
                <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60 text-xs">
                  <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-1">
                    Prescribed Sourcing Action Plan:
                  </span>
                  <p className="text-indigo-800 dark:text-indigo-300 leading-relaxed text-[11px]">
                    {selectedItem.recommendedStrategy}
                  </p>
                </div>

                {/* Re-calibration Controls */}
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Recalibrate Portfolio Coordinates
                  </span>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Profit / Financial Impact</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{editProfitImpact}/100</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="99"
                      value={editProfitImpact}
                      onChange={(e) => setEditProfitImpact(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Supply / Market Risk</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{editSupplyRisk}/100</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="99"
                      value={editSupplyRisk}
                      onChange={(e) => setEditSupplyRisk(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  <button
                    onClick={handleSavePosition}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Updated Coordinates
                  </button>
                </div>

              </div>

              {/* Bottom Quick Action */}
              <button
                onClick={() => {
                  setAuctionLotName(`${selectedItem.name} - Consolidated Annual Lot`);
                  setActiveTab('E_AUCTION');
                  sound.playClick();
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-300" /> Launch e-Auction for This Item →
              </button>

            </div>

          </div>

        </div>
      )}

      {/* Tab 2: Live e-Auction & Reverse Bidding Arena */}
      {activeTab === 'E_AUCTION' && (
        <div className="space-y-6">
          
          {/* Auction Control Room Card */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                  <Zap className="w-4 h-4" />
                  <span>HIGH-VALUE ENGLISH REVERSE AUCTION ROOM</span>
                  <span>·</span>
                  <span>Lot Ref: RA-2026-081</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {auctionLotName}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Reserve Ceiling Price: <span className="font-mono text-slate-200">{formatCurrency(initialReservePrice)}</span> · Pre-qualified bids only.
                </p>
              </div>

              {/* Timer and Auction Controls */}
              <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">REMAINING TIME</span>
                  <div className="text-2xl font-extrabold font-mono text-amber-400 tabular-nums">
                    {Math.floor(auctionTimeLeft / 60)}:{(auctionTimeLeft % 60).toString().padStart(2, '0')}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 border-l border-slate-800 pl-4">
                  {!isAuctionRunning ? (
                    <button
                      onClick={() => {
                        if (auctionTimeLeft <= 0) setAuctionTimeLeft(180);
                        setIsAuctionRunning(true);
                        sound.playSuccess();
                      }}
                      disabled={auctionAwarded}
                      className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg transition-colors"
                      title="Start Auction Clock"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsAuctionRunning(false);
                        sound.playClick();
                      }}
                      className="p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
                      title="Pause Clock"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsAuctionRunning(false);
                      setAuctionTimeLeft(180);
                      setAuctionAwarded(false);
                      sound.playClick();
                    }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                    title="Reset Auction"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Auction Current Standing KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Current Winning Lowest Bid</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-1 tabular-nums">
                  {formatCurrency(lowestBid.bidAmount)}
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block truncate">
                  Held by: <strong className="text-white">{lowestBid.vendorName}</strong>
                </span>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Total Realized Cost Savings</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-400 mt-1 tabular-nums">
                  +{formatCurrency(totalAuctionSavings)}
                </div>
                <span className="text-[11px] text-indigo-300 mt-0.5 block">
                  {savingsPercent}% below initial ceiling price
                </span>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Contract Award Status</span>
                  <div className="text-sm font-bold text-white mt-1">
                    {auctionAwarded ? (
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Awarded & PO Issued
                      </span>
                    ) : isAuctionRunning ? (
                      <span className="text-amber-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> Live Bidding Active
                      </span>
                    ) : (
                      <span className="text-slate-400">Ready for Award Review</span>
                    )}
                  </div>
                </div>

                {!auctionAwarded ? (
                  <button
                    onClick={handleAwardContract}
                    className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition-colors flex items-center justify-center gap-2"
                  >
                    <Award className="w-3.5 h-3.5" /> Award Contract to Rank 1 ↵
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                    Purchase Order automatically created in procurement ledger.
                  </span>
                )}
              </div>

            </div>

          </div>

          {/* Interactive Bidder Ladder & Manual Portal Simulation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Live Bid Ladder (2 cols) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Live Supplier Bid Ladder (Ascending Rank)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time decrement log across all verified supplier terminals.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {bids.length} total bids received
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-y border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Rank</th>
                      <th className="py-2.5 px-3">Participating Supplier</th>
                      <th className="py-2.5 px-3 text-right">Bid Amount</th>
                      <th className="py-2.5 px-3 text-right">Lead Time</th>
                      <th className="py-2.5 px-3 text-right">Quality Score</th>
                      <th className="py-2.5 px-3 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {bids.map((b) => (
                      <tr 
                        key={b.id} 
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                          b.rank === 1 ? 'bg-emerald-50/50 dark:bg-emerald-950/20 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-mono font-bold text-xs ${
                            b.rank === 1 
                              ? 'bg-emerald-600 text-white shadow-sm' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            #{b.rank}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{b.vendorName}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                          {formatCurrency(b.bidAmount)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                          {b.deliveryDays} Days
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                          {b.complianceRating}★
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-400">
                          {b.timestamp}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Vendor Bid Simulator Terminal (1 col) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  Simulated Terminal
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  Manual Counter-Bid Injection
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Inject competitive price decrements as a supplier terminal or operator.
                </p>

                <div className="mt-4 space-y-2.5">
                  <button
                    onClick={() => handlePlaceManualBid(500)}
                    disabled={auctionAwarded}
                    className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-between px-4"
                  >
                    <span>Drop Bid by -$500</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {formatCurrency(lowestBid.bidAmount - 500)}
                    </span>
                  </button>

                  <button
                    onClick={() => handlePlaceManualBid(1200)}
                    disabled={auctionAwarded}
                    className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-between px-4"
                  >
                    <span>Drop Bid by -$1,200</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {formatCurrency(lowestBid.bidAmount - 1200)}
                    </span>
                  </button>

                  <button
                    onClick={() => handlePlaceManualBid(2500)}
                    disabled={auctionAwarded}
                    className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-between px-4"
                  >
                    <span>Aggressive Leap (-$2,500)</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {formatCurrency(lowestBid.bidAmount - 2500)}
                    </span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
                <strong className="text-slate-700 dark:text-slate-300 block mb-0.5">Procurement Protocol Note:</strong>
                All counter-bids automatically verify supplier ISO-9001 compliance and delivery capacity before locking into the rank ledger.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab 3: Sensitivity Simulator & What-If Stress Testing */}
      {activeTab === 'SCENARIO' && (
        <div className="space-y-6">
          
          {/* Executive Scenario Header */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">
                  MACROECONOMIC SENSITIVITY LABORATORY
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5">
                  Tariff, Inflation & Lead Time Stress Test
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Simulate procurement cost shocks across commodities, freight corridors, and foreign exchange shifts to forecast working capital requirements.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportScenarioPDF}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Export PDF
                </button>
                <button
                  onClick={handleExportScenarioExcel}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> Export Excel
                </button>
              </div>
            </div>

            {/* Impact Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-6">
              
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Projected Spend Variance</span>
                <div className="text-2xl font-bold font-mono text-rose-400 mt-1 tabular-nums">
                  +{formatCurrency(spendDelta)}
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  {((spendDelta / totalBaseSpend) * 100).toFixed(1)}% total spend expansion
                </span>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Forecasted Total Annual Spend</span>
                <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                  {formatCurrency(projectedTotalSpend)}
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Baseline: {formatCurrency(totalBaseSpend)}
                </span>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Stockout Risk Probability</span>
                <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
                  {stockoutRiskPercent}%
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Runway: {daysInventoryRunway} Days DSI
                </span>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Working Capital Reserve Req.</span>
                <div className="text-2xl font-bold font-mono text-indigo-400 mt-1 tabular-nums">
                  {formatCurrency(workingCapitalBuffer)}
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Buffer liquidity needed
                </span>
              </div>

            </div>

          </div>

          {/* Interactive Sensitivity Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            
            {/* Raw Material Slider */}
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Raw Material Inflation</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">+{rawMaterialInflation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                value={rawMaterialInflation}
                onChange={(e) => setRawMaterialInflation(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% Nominal</span>
                <span>Max +35%</span>
              </div>
            </div>

            {/* Freight Tariff Slider */}
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Freight & Tariff Surcharge</span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">+{freightTariffSurge}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={freightTariffSurge}
                onChange={(e) => setFreightTariffSurge(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% Baseline</span>
                <span>Max +40%</span>
              </div>
            </div>

            {/* FX Fluctuation Slider */}
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Foreign Exchange Devaluation</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+{fxVolatility}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={fxVolatility}
                onChange={(e) => setFxVolatility(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% Neutral</span>
                <span>Max +25%</span>
              </div>
            </div>

          </div>

          {/* Comparative Category Chart & Commit Action */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Baseline Spend vs Projected Stress Scenario by Sourcing Category
                </h3>
                <p className="text-xs text-slate-500">
                  Visual distribution comparing approved annual baselines with scenario cost inflation.
                </p>
              </div>

              <button
                onClick={handleCommitScenario}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Commit Scenario to Financial Governance Ledger
              </button>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarioComparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="baseline" name="Baseline Budget" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="scenario" name="Stress Scenario" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

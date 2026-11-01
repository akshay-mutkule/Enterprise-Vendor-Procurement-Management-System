import React, { useState, useMemo } from 'react';
import { 
  Award, Sliders, CheckCircle2, TrendingDown, Clock, ShieldCheck, 
  FileText, Download, Sparkles, RefreshCw, Layers, Check, AlertCircle,
  HelpCircle, ChevronDown, Filter, Zap, ArrowRight, BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, Cell, Legend 
} from 'recharts';
import confetti from 'canvas-confetti';
import { useProcurement } from '../context/ProcurementContext';
import { Quotation, RFQ, BidEvaluationWeights } from '../types';
import { formatCurrency, exportToPDF, exportToExcel } from '../utils/exportUtils';
import { sound } from '../utils/soundUtils';

interface BidEvaluationMatrixProps {
  initialRfqId?: string;
  onAwardComplete?: () => void;
}

export const BidEvaluationMatrix: React.FC<BidEvaluationMatrixProps> = ({ 
  initialRfqId, 
  onAwardComplete 
}) => {
  const { 
    rfqs, quotations, vendors, acceptQuotation, 
    addToast, logActivity, purchaseOrders 
  } = useProcurement();

  // Selected RFQ
  const [selectedRfqId, setSelectedRfqId] = useState<string>(
    initialRfqId || rfqs[0]?.id || ''
  );

  // Criteria Weighting Sliders (Must sum to 100)
  const [weights, setWeights] = useState<BidEvaluationWeights>({
    priceWeight: 40,
    deliveryWeight: 25,
    qualityWeight: 20,
    esgWeight: 15
  });

  const [activePreset, setActivePreset] = useState<string>('balanced');
  const [showSensitivityAnalysis, setShowSensitivityAnalysis] = useState<boolean>(true);

  // Get active RFQ
  const currentRFQ = useMemo(() => {
    return rfqs.find(r => r.id === selectedRfqId) || rfqs[0];
  }, [rfqs, selectedRfqId]);

  // Quotes for this RFQ
  const rfqQuotations = useMemo(() => {
    if (!currentRFQ) return [];
    return quotations.filter(q => q.rfqId === currentRFQ.id);
  }, [quotations, currentRFQ]);

  // Normalize weights if needed
  const totalWeight = weights.priceWeight + weights.deliveryWeight + weights.qualityWeight + weights.esgWeight;

  const applyPreset = (presetName: string) => {
    sound.playClick();
    setActivePreset(presetName);
    switch (presetName) {
      case 'balanced':
        setWeights({ priceWeight: 40, deliveryWeight: 25, qualityWeight: 20, esgWeight: 15 });
        break;
      case 'cost':
        setWeights({ priceWeight: 65, deliveryWeight: 15, qualityWeight: 10, esgWeight: 10 });
        break;
      case 'expedited':
        setWeights({ priceWeight: 20, deliveryWeight: 50, qualityWeight: 15, esgWeight: 15 });
        break;
      case 'quality':
        setWeights({ priceWeight: 20, deliveryWeight: 15, qualityWeight: 45, esgWeight: 20 });
        break;
      default:
        break;
    }
  };

  // Evaluate Bids Mathematically
  const evaluatedQuotes = useMemo(() => {
    if (rfqQuotations.length === 0) return [];

    const minPrice = Math.min(...rfqQuotations.map(q => q.totalAmount));
    const maxPrice = Math.max(...rfqQuotations.map(q => q.totalAmount));
    const minDelivery = Math.min(...rfqQuotations.map(q => q.deliveryTimeDays));
    const maxDelivery = Math.max(...rfqQuotations.map(q => q.deliveryTimeDays));

    return rfqQuotations.map(quote => {
      const vendor = vendors.find(v => v.id === quote.vendorId);

      // 1. Price Score (0 - 100): Lower is better. Max delta score
      const priceDelta = maxPrice - minPrice;
      const priceScore = priceDelta > 0 
        ? Math.max(10, Math.round(100 - ((quote.totalAmount - minPrice) / priceDelta) * 60))
        : 100;

      // 2. Delivery SLA Score (0 - 100): Faster is better
      const deliveryDelta = maxDelivery - minDelivery;
      const deliveryScore = deliveryDelta > 0
        ? Math.max(20, Math.round(100 - ((quote.deliveryTimeDays - minDelivery) / deliveryDelta) * 50))
        : 100;

      // 3. Historical Quality Score (0 - 100): From vendor profile
      const qualityScore = vendor?.performanceMetrics?.qualityCompliance || 90;

      // 4. ESG & Compliance Score (0 - 100)
      const esgScore = vendor ? Math.round(100 - (vendor.riskScore * 0.7)) : 85;

      // Calculate Total Weighted Score
      const totalScore = (
        (priceScore * weights.priceWeight) +
        (deliveryScore * weights.deliveryWeight) +
        (qualityScore * weights.qualityWeight) +
        (esgScore * weights.esgWeight)
      ) / (totalWeight || 100);

      const roundedTotalScore = Math.round(totalScore * 10) / 10;

      return {
        quote,
        vendor,
        priceScore,
        deliveryScore,
        qualityScore,
        esgScore,
        totalScore: roundedTotalScore,
        priceSavingsVsMax: maxPrice - quote.totalAmount
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  }, [rfqQuotations, vendors, weights, totalWeight]);

  // Top ranked winner
  const winningBid = evaluatedQuotes[0];

  const handleAward = (quoteId: string, vendorName: string, amount: number) => {
    sound.playSuccess();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    acceptQuotation(quoteId);
    logActivity(
      'AWARD_BID_MATRIX',
      'PROCUREMENT',
      `Awarded RFQ ${currentRFQ?.rfqNumber} to ${vendorName} for ${formatCurrency(amount)} via Weighted Evaluation Matrix.`
    );
    addToast(
      'RFQ Awarded & PO Generated',
      `Contract officially awarded to ${vendorName}. Purchase Order automatically queued in ERP ledger.`,
      'success'
    );
    if (onAwardComplete) {
      onAwardComplete();
    }
  };

  const handleExportPDF = () => {
    sound.playClick();
    const columns = ['Rank', 'Vendor Name', 'Quote #', 'Total Price', 'Lead Time', 'Quality %', 'ESG %', 'Weighted Score', 'Status'];
    const rows = evaluatedQuotes.map((eq, idx) => [
      `#${idx + 1}`,
      eq.quote.vendorName,
      eq.quote.quoteNumber,
      formatCurrency(eq.quote.totalAmount),
      `${eq.quote.deliveryTimeDays} Days`,
      `${eq.qualityScore}%`,
      `${eq.esgScore}%`,
      `${eq.totalScore} / 100`,
      eq.quote.status
    ]);
    exportToPDF(
      `RFQ Bid Evaluation Matrix - ${currentRFQ?.rfqNumber || 'Matrix'}`,
      columns,
      rows,
      `RFQ_Bid_Evaluation_Matrix_${currentRFQ?.rfqNumber || 'Matrix'}`
    );

    addToast('Evaluation Sheet Exported', 'Bid scoring matrix saved to PDF audit ledger.', 'info');
  };

  const handleExportCSV = () => {
    sound.playClick();
    const headers = ['Rank', 'Vendor', 'QuoteNumber', 'TotalAmount', 'LeadTimeDays', 'PriceScore', 'DeliveryScore', 'QualityScore', 'ESGScore', 'TotalScore', 'Status'];
    const data = evaluatedQuotes.map((eq, idx) => ({
      Rank: idx + 1,
      Vendor: eq.quote.vendorName,
      QuoteNumber: eq.quote.quoteNumber,
      TotalAmount: eq.quote.totalAmount,
      LeadTimeDays: eq.quote.deliveryTimeDays,
      PriceScore: eq.priceScore,
      DeliveryScore: eq.deliveryScore,
      QualityScore: eq.qualityScore,
      ESGScore: eq.esgScore,
      TotalScore: eq.totalScore,
      Status: eq.quote.status
    }));
    exportToExcel(data, `RFQ_Matrix_${currentRFQ?.rfqNumber || 'Report'}`);
    addToast('Excel Sheet Exported', 'Scoring dataset exported to CSV/Excel.', 'info');
  };

  // Chart data for visual comparison
  const chartData = evaluatedQuotes.map((eq, idx) => ({
    name: eq.quote.vendorName.length > 18 ? eq.quote.vendorName.substring(0, 16) + '...' : eq.quote.vendorName,
    TotalScore: eq.totalScore,
    PriceScore: eq.priceScore,
    DeliveryScore: eq.deliveryScore,
    QualityScore: eq.qualityScore,
    isWinner: idx === 0
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
      
      {/* Header & RFQ Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Multi-Vendor Bid Comparison & Decision Matrix
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 font-mono">
                  ISO 20400 COMPLIANT
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Objective multi-attribute scoring model for competitive enterprise RFQs and vendor tender awards.
              </p>
            </div>
          </div>
        </div>

        {/* RFQ Selector Dropdown and Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select
              value={selectedRfqId}
              onChange={(e) => setSelectedRfqId(e.target.value)}
              className="px-3 py-2 pr-8 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              {rfqs.map(rfq => (
                <option key={rfq.id} value={rfq.id}>
                  {rfq.rfqNumber}: {rfq.title.length > 35 ? rfq.title.substring(0, 32) + '...' : rfq.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={handleExportPDF}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            title="Export Bid Matrix to PDF"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            title="Export Bid Matrix to CSV/Excel"
          >
            <FileText className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Target RFQ Summary Card */}
      {currentRFQ && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                {currentRFQ.rfqNumber}
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{currentRFQ.title}</h4>
            </div>
            <p className="text-xs text-slate-500">
              Line Items: {currentRFQ.items.map(it => `${it.quantity}x ${it.productName}`).join(' • ')}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Bids Submitted</span>
              <span className="font-extrabold text-slate-900 text-sm">{rfqQuotations.length} Vendor Quotes</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Closing Deadline</span>
              <span className="font-bold text-slate-800">{currentRFQ.deadline}</span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Criteria Weights & Presets */}
      <div className="bg-indigo-50/40 rounded-xl p-4 sm:p-5 border border-indigo-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              Evaluation Criteria & Weighting Configuration
            </h4>
            <span className="text-[11px] text-slate-500">
              Adjust weights to stress-test rankings based on organizational strategic priority.
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
            <span className="text-[10px] font-mono text-slate-400 px-2 font-bold uppercase">Presets:</span>
            <button
              onClick={() => applyPreset('balanced')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${activePreset === 'balanced' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Balanced (40/25/20/15)
            </button>
            <button
              onClick={() => applyPreset('cost')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${activePreset === 'cost' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Cost Focused
            </button>
            <button
              onClick={() => applyPreset('expedited')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${activePreset === 'expedited' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Fast Delivery
            </button>
            <button
              onClick={() => applyPreset('quality')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${activePreset === 'quality' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              High Quality
            </button>
          </div>
        </div>

        {/* 4 Interactive Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* Price Weight */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">1. Commercial Price</span>
              <span className="font-mono font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">
                {weights.priceWeight}%
              </span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="80" 
              value={weights.priceWeight}
              onChange={(e) => {
                setActivePreset('custom');
                setWeights(prev => ({ ...prev, priceWeight: Number(e.target.value) }));
              }}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Cost competitiveness</span>
              <span>10% - 80%</span>
            </div>
          </div>

          {/* Delivery Lead Time Weight */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">2. Lead Time SLA</span>
              <span className="font-mono font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">
                {weights.deliveryWeight}%
              </span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="70" 
              value={weights.deliveryWeight}
              onChange={(e) => {
                setActivePreset('custom');
                setWeights(prev => ({ ...prev, deliveryWeight: Number(e.target.value) }));
              }}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Speed to fulfillment</span>
              <span>5% - 70%</span>
            </div>
          </div>

          {/* Quality & Compliance Weight */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">3. Quality & Defect Rate</span>
              <span className="font-mono font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                {weights.qualityWeight}%
              </span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="70" 
              value={weights.qualityWeight}
              onChange={(e) => {
                setActivePreset('custom');
                setWeights(prev => ({ ...prev, qualityWeight: Number(e.target.value) }));
              }}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Historical PPM defects</span>
              <span>5% - 70%</span>
            </div>
          </div>

          {/* ESG & Sustainability Weight */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">4. ESG & Sustainability</span>
              <span className="font-mono font-extrabold text-teal-600 bg-teal-50 px-2 py-0.5 rounded text-xs">
                {weights.esgWeight}%
              </span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="50" 
              value={weights.esgWeight}
              onChange={(e) => {
                setActivePreset('custom');
                setWeights(prev => ({ ...prev, esgWeight: Number(e.target.value) }));
              }}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>ISO 14001 / EcoVadis</span>
              <span>5% - 50%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Evaluated Bids Matrix Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5 text-center w-14">Rank</th>
                <th className="p-3.5">Vendor Name & Quote #</th>
                <th className="p-3.5">Commercial Bid</th>
                <th className="p-3.5">Lead Time SLA</th>
                <th className="p-3.5">Quality (PPM)</th>
                <th className="p-3.5">ESG Score</th>
                <th className="p-3.5 text-center">Score Breakdown</th>
                <th className="p-3.5 text-center">Composite Score</th>
                <th className="p-3.5 text-right">Award Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evaluatedQuotes.map((eq, idx) => {
                const isWinner = idx === 0;
                const isAwarded = eq.quote.status === 'ACCEPTED';
                
                return (
                  <tr 
                    key={eq.quote.id} 
                    className={`transition-colors ${
                      isAwarded 
                        ? 'bg-emerald-50/60' 
                        : isWinner 
                          ? 'bg-indigo-50/40 hover:bg-indigo-50/70' 
                          : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="p-3.5 text-center">
                      <div className={`w-8 h-8 rounded-full font-black text-xs mx-auto flex items-center justify-center ${
                        isWinner 
                          ? 'bg-amber-400 text-slate-900 shadow-md ring-2 ring-amber-300' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        #{idx + 1}
                      </div>
                    </td>

                    {/* Vendor Name & Info */}
                    <td className="p-3.5">
                      <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        {eq.quote.vendorName}
                        {isWinner && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                            TOP VALUE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                        <span>{eq.quote.quoteNumber}</span>
                        <span>•</span>
                        <span>Terms: {eq.quote.terms}</span>
                      </div>
                    </td>

                    {/* Commercial Bid */}
                    <td className="p-3.5">
                      <div className="font-extrabold text-slate-900 font-mono text-sm">
                        {formatCurrency(eq.quote.totalAmount)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Subtotal: {formatCurrency(eq.quote.subtotal)} (+{formatCurrency(eq.quote.tax)} Tax)
                      </div>
                      {eq.priceSavingsVsMax > 0 && (
                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                          ↓ Saves {formatCurrency(eq.priceSavingsVsMax)} vs max bid
                        </div>
                      )}
                    </td>

                    {/* Lead Time */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {eq.quote.deliveryTimeDays} Business Days
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Normalized Score: {eq.deliveryScore}/100
                      </span>
                    </td>

                    {/* Quality */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        {eq.qualityScore}% Compliance
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Rating: {eq.vendor?.rating || 4.5} ★
                      </span>
                    </td>

                    {/* ESG Score */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">
                        {eq.esgScore} / 100
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Risk Score: {eq.vendor?.riskScore || 20}%
                      </span>
                    </td>

                    {/* Score Bar Breakdown */}
                    <td className="p-3.5 w-48">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Price ({weights.priceWeight}%)</span>
                          <span className="font-mono font-bold">{eq.priceScore}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${eq.priceScore}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                          <span>SLA ({weights.deliveryWeight}%)</span>
                          <span className="font-mono font-bold">{eq.deliveryScore}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${eq.deliveryScore}%` }}></div>
                        </div>
                      </div>
                    </td>

                    {/* Composite Total Score */}
                    <td className="p-3.5 text-center">
                      <div className={`text-base font-black font-mono ${
                        isWinner ? 'text-indigo-600' : 'text-slate-800'
                      }`}>
                        {eq.totalScore}
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">out of 100</span>
                    </td>

                    {/* Award Action */}
                    <td className="p-3.5 text-right">
                      {isAwarded ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-extrabold shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Awarded & PO Issued
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAward(eq.quote.id, eq.quote.vendorName, eq.quote.totalAmount)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ml-auto ${
                            isWinner
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 ring-2 ring-emerald-500/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {isWinner ? 'Award Tender (PO)' : 'Override & Award'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Sensitivity Analysis Chart */}
      {rfqQuotations.length > 1 && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              Comparative Bid Score Distribution
            </h4>
            <span className="text-[11px] text-slate-500">
              Live ranking updates as criteria sliders change
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip 
                  formatter={(val: number) => [`${val} points`, 'Score']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="TotalScore" name="Composite Score (Weighted)" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isWinner ? '#4f46e5' : '#94a3b8'} />
                  ))}
                </Bar>
                <Bar dataKey="PriceScore" name="Price Score" fill="#818cf8" radius={[4, 4, 0, 0]} opacity={0.7} />
                <Bar dataKey="DeliveryScore" name="Delivery SLA Score" fill="#38bdf8" radius={[4, 4, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Mathematical Methodology Footnote */}
      <div className="bg-slate-100/70 p-3.5 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800">Scoring Algorithm Formula:</strong> 
          {' '} Composite Score = <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px] font-mono">(PriceScore × {weights.priceWeight}% + SLAScore × {weights.deliveryWeight}% + QualityScore × {weights.qualityWeight}% + ESGScore × {weights.esgWeight}%) / {totalWeight}%</code>. Lowest price and shortest lead times dynamically define baseline indices of 100.
        </div>
      </div>

    </div>
  );
};

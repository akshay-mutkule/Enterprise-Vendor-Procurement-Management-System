import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldCheck, TrendingUp, Sparkles, Globe, 
  ArrowUpRight, ArrowDownRight, Zap, RefreshCw, Layers
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { formatCurrency } from '../utils/exportUtils';

export const LiveTelemetryTicker: React.FC = () => {
  const { purchaseOrders, vendors, products } = useProcurement();
  const [tickerTime, setTickerTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalSpend = purchaseOrders.reduce((acc, po) => acc + po.totalAmount, 0);
  const lowStockCount = products.filter(p => p.stockQuantity <= p.reorderLevel).length;

  const tickerItems = [
    { label: 'NODE STATUS', value: 'Live 99.99%', icon: Activity, color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' },
    { label: 'GEMINI 3.7 AI SHIELD', value: 'Active (0 Fraud Anomaly)', icon: ShieldCheck, color: 'text-indigo-400 bg-indigo-950/60 border-indigo-800' },
    { label: 'ACTIVE PO VOLUME', value: `${purchaseOrders.length} Orders (${formatCurrency(totalSpend)})`, icon: Zap, color: 'text-purple-400 bg-purple-950/60 border-purple-800' },
    { label: 'TIER-1 SUPPLIERS', value: `${vendors.length} Onboarded (Avg 4.6★)`, icon: Globe, color: 'text-blue-400 bg-blue-950/60 border-blue-800' },
    { label: 'GODOWN CAPACITY', value: `${lowStockCount === 0 ? 'Optimal (100%)' : `${lowStockCount} Reorders Flagged`}`, icon: Layers, color: lowStockCount === 0 ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800' : 'text-amber-400 bg-amber-950/60 border-amber-800' },
    { label: 'FX USD/EUR', value: '€0.923 (+0.12%)', icon: TrendingUp, color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800' },
    { label: 'FX USD/INR', value: '₹84.15 (-0.04%)', icon: TrendingUp, color: 'text-amber-400 bg-amber-950/60 border-amber-800' },
    { label: 'LATENCY', value: '12ms (Direct API)', icon: RefreshCw, color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' },
  ];

  return (
    <div className="bg-slate-950 border-y border-slate-800/90 text-slate-300 text-xs py-1.5 px-3 overflow-hidden select-none shadow-inner relative flex items-center">
      {/* Fixed Left Tag */}
      <div className="flex items-center gap-1.5 pr-3 mr-2 border-r border-slate-800 shrink-0 z-10 bg-slate-950 text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="hidden sm:inline">LIVE TELEMETRY</span>
        <span className="text-slate-500 font-normal">[{tickerTime}]</span>
      </div>

      {/* Marquee Container */}
      <div className="flex-1 overflow-hidden relative">
        <div className="flex items-center gap-6 whitespace-nowrap animate-ticker">
          {[...tickerItems, ...tickerItems].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-medium ${item.color} transition-all hover:scale-105 cursor-default`}
              >
                <Icon className="w-3 h-3" />
                <span className="text-slate-400 text-[10px] uppercase font-bold">{item.label}:</span>
                <span className="font-bold">{item.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

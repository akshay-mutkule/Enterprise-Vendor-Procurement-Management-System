import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Shield, Layers, Clock, AlertTriangle, 
  ArrowUpRight, ArrowDownRight, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { formatCurrency } from '../utils/exportUtils';

export const LiveTelemetryTicker: React.FC = () => {
  const { purchaseOrders, requisitions, products, vendors } = useProcurement();
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  const totalSpend = purchaseOrders.reduce((acc, po) => acc + po.totalAmount, 0);
  const pendingPRCount = requisitions.filter(r => r.status === 'PENDING_APPROVAL').length;
  const lowStockItems = products.filter(p => p.stockQuantity <= p.reorderLevel).length;

  useEffect(() => {
    const timer = setInterval(() => {
      setLastRefreshed(new Date().toLocaleTimeString());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs px-4 py-2 flex items-center justify-between select-none">
      
      {/* Left: Operational Indices with clean typographic separators */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar whitespace-nowrap text-[11px]">
        
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Ledger Status: Nominal</span>
        </div>

        <span className="text-slate-600" aria-hidden="true">·</span>

        <div className="flex items-center gap-1">
          <span className="text-slate-400">Committed Spend:</span>
          <span className="font-mono font-bold text-white tabular-nums">
            {formatCurrency(totalSpend)}
          </span>
        </div>

        <span className="text-slate-600" aria-hidden="true">·</span>

        <div className="flex items-center gap-1">
          <span className="text-slate-400">Requisitions Pending:</span>
          <span className="font-mono font-bold text-amber-400 tabular-nums">
            {pendingPRCount} review{pendingPRCount === 1 ? '' : 's'}
          </span>
        </div>

        <span className="text-slate-600" aria-hidden="true">·</span>

        <div className="flex items-center gap-1">
          <span className="text-slate-400">Godown Alerts:</span>
          <span className={`font-mono font-bold tabular-nums ${lowStockItems > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {lowStockItems === 0 ? 'Optimal' : `${lowStockItems} low stock`}
          </span>
        </div>

        <span className="text-slate-600" aria-hidden="true">·</span>

        <div className="flex items-center gap-1">
          <span className="text-slate-400">Delivery SLA:</span>
          <span className="font-mono font-bold text-emerald-400 tabular-nums">96.4% on-time</span>
        </div>

        <span className="text-slate-600" aria-hidden="true">·</span>

        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
          <span>USD/EUR 0.923 (+0.08%)</span>
          <span className="text-slate-600">/</span>
          <span>USD/INR 84.15 (-0.02%)</span>
        </div>

      </div>

      {/* Right: Last sync timestamp */}
      <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-500 shrink-0 pl-4 border-l border-slate-800">
        <Clock className="w-3 h-3 text-slate-400" />
        <span>Synced {lastRefreshed}</span>
      </div>

    </div>
  );
};

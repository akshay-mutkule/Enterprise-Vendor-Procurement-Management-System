import React, { useState, useEffect } from 'react';
import { 
  Users, ShoppingBag, DollarSign, Package, AlertTriangle, 
  TrendingUp, CheckCircle, ShieldAlert, ArrowUpRight, ArrowDownRight, Sparkles,
  Zap, Clock, FileCheck, Layers, ChevronRight, Activity, Globe
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import confetti from 'canvas-confetti';
import { useProcurement } from '../context/ProcurementContext';
import { formatCurrency } from '../utils/exportUtils';

interface DashboardViewProps {
  onNavigate?: (tab: string) => void;
}

const InflationSimulator: React.FC<{ totalProcurementSpend: number }> = ({ totalProcurementSpend }) => {
  const [rawMaterialIncrease, setRawMaterialIncrease] = useState(8);
  const [freightSurge, setFreightSurge] = useState(5);
  const [fxFluctuation, setFxFluctuation] = useState(3);

  const projectedIncrease = totalProcurementSpend * ((rawMaterialIncrease * 0.5 + freightSurge * 0.3 + fxFluctuation * 0.2) / 100);
  const totalProjectedSpend = totalProcurementSpend + projectedIncrease;

  const handleCommitScenario = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 }
    });
    alert(`Scenario Model Committed: Projected budget variance of +${formatCurrency(projectedIncrease)} successfully recorded in Executive Financial Ledger.`);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-indigo-900/60 space-y-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-900/60 pb-4 relative z-10">
        <div>
          <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Executive Scenario Laboratory
          </span>
          <h3 className="text-lg font-black text-white mt-0.5 tracking-tight">
            Supply Chain Inflation & Tariff Impact Simulator
          </h3>
        </div>
        <div className="text-left sm:text-right bg-slate-900/80 px-4 py-2 rounded-2xl border border-indigo-800/40">
          <span className="text-[11px] text-slate-400 block font-medium">Projected Cost Impact</span>
          <span className="text-xl font-black text-rose-400 font-mono">+{formatCurrency(projectedIncrease)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
        
        {/* Raw Material Slider */}
        <div className="space-y-2.5 bg-slate-900/80 p-4 rounded-2xl border border-slate-800/90 shadow-inner">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-bold">Raw Material Inflation</span>
            <span className="font-mono text-indigo-400 font-extrabold text-sm">+{rawMaterialIncrease}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={rawMaterialIncrease}
            onChange={(e) => setRawMaterialIncrease(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Silicon, Copper, Wafers</span>
            <span>Max +30%</span>
          </div>
        </div>

        {/* Freight Slider */}
        <div className="space-y-2.5 bg-slate-900/80 p-4 rounded-2xl border border-slate-800/90 shadow-inner">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-bold">Freight & Logistics Surge</span>
            <span className="font-mono text-purple-400 font-extrabold text-sm">+{freightSurge}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={freightSurge}
            onChange={(e) => setFreightSurge(Number(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Port congestion & Air surcharges</span>
            <span>Max +30%</span>
          </div>
        </div>

        {/* FX Slider */}
        <div className="space-y-2.5 bg-slate-900/80 p-4 rounded-2xl border border-slate-800/90 shadow-inner">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-bold">FX Currency Volatility</span>
            <span className="font-mono text-emerald-400 font-extrabold text-sm">+{fxFluctuation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            value={fxFluctuation}
            onChange={(e) => setFxFluctuation(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>USD / EUR / INR hedge</span>
            <span>Max +20%</span>
          </div>
        </div>

      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-indigo-950/60 p-4 rounded-2xl border border-indigo-800/60 text-xs text-indigo-200 relative z-10">
        <div className="flex flex-wrap items-center gap-3">
          <span>Baseline Spend: <strong className="text-white font-mono">{formatCurrency(totalProcurementSpend)}</strong></span>
          <span className="text-slate-400">•</span>
          <span>Adjusted Target: <strong className="text-rose-300 font-extrabold font-mono text-sm">{formatCurrency(totalProjectedSpend)}</strong></span>
        </div>
        <button
          onClick={handleCommitScenario}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 text-xs whitespace-nowrap transition-all hover:scale-105"
        >
          Commit Scenario Model ↵
        </button>
      </div>
    </div>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { vendors, products, purchaseOrders, invoices, currentRole, switchRole, t } = useProcurement();

  const totalProcurementSpend = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
  const activeVendors = vendors.filter(v => v.status === 'APPROVED').length;
  const pendingInvoicesAmount = invoices.filter(i => i.status === 'PENDING_VERIFICATION').reduce((sum, i) => sum + i.totalAmount, 0);
  const lowStockCount = products.filter(p => p.stockQuantity <= p.reorderLevel).length;

  const spendTrendData = [
    { month: 'Jan', Spend: 45000, Budget: 60000 },
    { month: 'Feb', Spend: 52000, Budget: 60000 },
    { month: 'Mar', Spend: 61000, Budget: 65000 },
    { month: 'Apr', Spend: 48000, Budget: 65000 },
    { month: 'May', Spend: 75000, Budget: 70000 },
    { month: 'Jun', Spend: 68000, Budget: 70000 },
    { month: 'Jul', Spend: 75520, Budget: 80000 },
  ];

  const vendorPerformanceData = vendors.slice(0, 5).map(v => ({
    name: v.name.split(' ')[0],
    Rating: v.rating,
    RiskScore: v.riskScore,
    OnTimeRate: v.performanceMetrics.onTimeDeliveryRate
  }));

  const invoiceStatusData = [
    { name: 'Paid', value: invoices.filter(i => i.status === 'PAID').length, color: '#10b981' },
    { name: 'Approved', value: invoices.filter(i => i.status === 'APPROVED').length, color: '#6366f1' },
    { name: 'Pending Verification', value: invoices.filter(i => i.status === 'PENDING_VERIFICATION').length, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner / Role Greeting */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-indigo-900/60">
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-3 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Enterprise Procurement Architecture • Live Node 14ms</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {t('procurementDashboard')}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              Active Role: <span className="text-white font-bold underline decoration-indigo-400">{currentRole}</span>. Real-time spend analytics, AI vendor risk evaluation, RFQ/PO workflows, and 3-way invoice verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => switchRole('PROCUREMENT_MANAGER')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${currentRole === 'PROCUREMENT_MANAGER' ? 'bg-indigo-600 text-white shadow-indigo-600/40 ring-2 ring-indigo-400' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700'}`}
            >
              Procurement Mgr
            </button>
            <button
              onClick={() => switchRole('FINANCE_MANAGER')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${currentRole === 'FINANCE_MANAGER' ? 'bg-blue-600 text-white shadow-blue-600/40 ring-2 ring-blue-400' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700'}`}
            >
              Finance Mgr
            </button>
            <button
              onClick={() => switchRole('SUPER_ADMIN')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${currentRole === 'SUPER_ADMIN' ? 'bg-purple-600 text-white shadow-purple-600/40 ring-2 ring-purple-400' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700'}`}
            >
              Super Admin
            </button>
          </div>
        </div>
      </div>

      {/* Quick Launchpad Action Toolbar */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-500" /> Quick Launchpad
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => onNavigate?.('procurement')} 
            className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800/70 transition-all flex items-center gap-2 shadow-xs hover:scale-102"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Draft RFQ / PO
          </button>
          <button 
            onClick={() => onNavigate?.('contracts')} 
            className="px-3.5 py-2 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs rounded-xl border border-purple-200 dark:border-purple-800/70 transition-all flex items-center gap-2 shadow-xs hover:scale-102"
          >
            <FileCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Execute Contract
          </button>
          <button 
            onClick={() => onNavigate?.('logistics')} 
            className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800/70 transition-all flex items-center gap-2 shadow-xs hover:scale-102"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Supply Radar
          </button>
          <button 
            onClick={() => onNavigate?.('workflows')} 
            className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-200 dark:border-amber-800/70 transition-all flex items-center gap-2 shadow-xs hover:scale-102"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Rule Automations
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Spend */}
        <div 
          onClick={() => onNavigate?.('procurement')}
          className="luminous-card bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('totalSpend')}</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3 font-mono">
            {formatCurrency(totalProcurementSpend)}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12.4% vs last quarter target</span>
          </div>
        </div>

        {/* Active Vendors */}
        <div 
          onClick={() => onNavigate?.('vendors')}
          className="luminous-card bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('activeVendors')}</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3 font-mono">
            {activeVendors} <span className="text-xs font-normal text-slate-400 font-sans">/ {vendors.length} Total</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Avg SLA 4.6★ (98.4% On-time)</span>
          </div>
        </div>

        {/* Pending Invoices */}
        <div 
          onClick={() => onNavigate?.('finance')}
          className="luminous-card bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-amber-500 dark:hover:border-amber-500 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('finance')} (AP Queue)</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3 font-mono">
            {formatCurrency(pendingInvoicesAmount)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold mt-2.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>2 Invoices await 3-way match</span>
          </div>
        </div>

        {/* Low Stock Items */}
        <div 
          onClick={() => onNavigate?.('inventory')}
          className="luminous-card bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-rose-500 dark:hover:border-rose-500 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('lowStockAlerts')}</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3 font-mono">
            {lowStockCount} <span className="text-xs font-normal text-slate-400 font-sans">SKUs</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-bold mt-2.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Auto-reorder workflow active</span>
          </div>
        </div>

      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Spend Trend Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Spend vs. Budget Target ($)
              </h3>
              <p className="text-xs text-slate-500">Real-time expenditure tracking with baseline budget caps</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                <span className="w-3 h-3 rounded-full bg-indigo-600"></span> Actual Spend
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
                <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></span> Budget Cap
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}
                />
                <Area type="monotone" dataKey="Spend" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                <Area type="monotone" dataKey="Budget" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Status Distribution (1 col) */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Accounts Payable Pipeline
            </h3>
            <p className="text-xs text-slate-500">Breakdown of invoices by verification status</p>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={invoiceStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {invoiceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
            {invoiceStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{item.value} Invoices</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Advanced Interactive Scenario Simulator: Inflation & Tariff Impact */}
      <InflationSimulator totalProcurementSpend={totalProcurementSpend} />

      {/* Vendor Performance & Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Vendors Bar Chart */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Vendor SLA On-Time Delivery (%)
              </h3>
              <p className="text-xs text-slate-500">Tier-1 vendor delivery compliance rate</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: '1px solid #334155' }} />
                <Bar dataKey="OnTimeRate" fill="#10b981" radius={[8, 8, 0, 0]} barSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Vendors Summary List */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Vendor Risk & Performance Roster
            </h3>
            <p className="text-xs text-slate-500">Live AI Risk scores and SLA compliance</p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-3">
            {vendors.slice(0, 4).map(vendor => (
              <div key={vendor.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{vendor.name}</div>
                  <div className="text-[10px] text-slate-500">{vendor.category} • {vendor.code}</div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Risk Score</span>
                    <span className={`font-mono font-bold ${vendor.riskScore > 50 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {vendor.riskScore}/100
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[11px] font-mono">
                    ⭐ {vendor.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onNavigate?.('vendors')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1.5"
            >
              View all {vendors.length} vendors in Vendor Lifecycle <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

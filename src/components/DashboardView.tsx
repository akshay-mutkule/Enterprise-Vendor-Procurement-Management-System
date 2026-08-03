import React from 'react';
import { 
  Users, ShoppingBag, DollarSign, Package, AlertTriangle, 
  TrendingUp, CheckCircle, ShieldAlert, ArrowUpRight, ArrowDownRight, Sparkles 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { useProcurement } from '../context/ProcurementContext';
import { formatCurrency } from '../utils/exportUtils';

interface DashboardViewProps {
  onNavigate?: (tab: string) => void;
}

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
    { name: 'Paid', value: invoices.filter(i => i.status === 'PAID').length, color: '#059669' },
    { name: 'Approved', value: invoices.filter(i => i.status === 'APPROVED').length, color: '#2563eb' },
    { name: 'Pending Verification', value: invoices.filter(i => i.status === 'PENDING_VERIFICATION').length, color: '#d97706' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Role Greeting */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>SAP Ariba & Oracle Procurement Cloud Architecture</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {t('procurementDashboard')}
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl">
              Active Mode: <span className="text-white font-semibold underline decoration-indigo-400">{currentRole}</span>. Real-time spend tracking, vendor risk analytics, RFQ workflows, and automated invoice verification.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => switchRole('PROCUREMENT_MANAGER')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              Procurement Manager View
            </button>
            <button
              onClick={() => switchRole('FINANCE_MANAGER')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              Finance View
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Spend */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('totalSpend')}</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3">
            {formatCurrency(totalProcurementSpend)}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12.4% vs last quarter</span>
          </div>
        </div>

        {/* Active Vendors */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('activeVendors')}</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3">
            {activeVendors} <span className="text-xs font-normal text-slate-400">/ {vendors.length} Total</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Avg Rating 4.4 / 5.0</span>
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('finance')} ({t('status')})</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3">
            {formatCurrency(pendingInvoicesAmount)}
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-600 font-medium mt-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>2 Invoices await verification</span>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('lowStockAlerts')}</span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3">
            {lowStockCount} <span className="text-xs font-normal text-slate-400">SKUs</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-rose-600 font-medium mt-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Action required in Warehouse</span>
          </div>
        </div>

      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Spend Trend Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Monthly Spend vs. Budget Target ($)
              </h3>
              <p className="text-xs text-slate-500">Real-time expenditure tracking across Q1-Q3</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Spend
              </span>
              <span className="flex items-center gap-1 text-slate-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Budget
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="Spend" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                <Area type="monotone" dataKey="Budget" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Status Distribution (1 col) */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Invoice Processing Pipeline
            </h3>
            <p className="text-xs text-slate-500">Distribution of active accounts payable</p>
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
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 border-t border-slate-100 dark:border-slate-700 pt-3 text-xs">
            {invoiceStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Vendor Performance & Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Vendors Bar Chart */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Vendor SLA On-Time Delivery (%)
              </h3>
              <p className="text-xs text-slate-500">Tier-1 vendor delivery compliance rate</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="OnTimeRate" fill="#059669" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Vendors Summary List */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Vendor Risk & Performance Roster
            </h3>
            <p className="text-xs text-slate-500">Live AI Risk scores and SLA compliance</p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 mt-3">
            {vendors.slice(0, 4).map(vendor => (
              <div key={vendor.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{vendor.name}</div>
                  <div className="text-[10px] text-slate-500">{vendor.category} • {vendor.code}</div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Risk Score</span>
                    <span className={`font-bold ${vendor.riskScore > 50 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {vendor.riskScore}/100
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px]">
                    ⭐ {vendor.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => onNavigate?.('vendors')}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
            >
              View all {vendors.length} vendors in Vendor Lifecycle →
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

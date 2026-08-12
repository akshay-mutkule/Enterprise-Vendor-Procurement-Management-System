import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, ShoppingBag, Package, FileText, 
  Sparkles, Bell, BarChart3, Terminal, ShieldAlert, ChevronLeft, ChevronRight, User as UserIcon,
  FileCheck, Cpu, Globe2
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { UserProfileModal } from './UserProfileModal';

export type ActiveTab = 
  | 'dashboard' 
  | 'vendors' 
  | 'procurement' 
  | 'inventory' 
  | 'finance' 
  | 'contracts'
  | 'workflows'
  | 'logistics'
  | 'ai' 
  | 'notifications' 
  | 'reports' 
  | 'developer' 
  | 'audit';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, setActiveTab, collapsed = false, setCollapsed 
}) => {
  const { currentRole, currentUser, t } = useProcurement();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const navItems = [
    { id: 'dashboard' as ActiveTab, translationKey: 'dashboard', defaultLabel: 'Executive Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'FINANCE_MANAGER', 'WAREHOUSE_MANAGER', 'EMPLOYEE'] },
    { id: 'vendors' as ActiveTab, translationKey: 'vendors', defaultLabel: 'Vendor Lifecycle', icon: Users, roles: ['SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'FINANCE_MANAGER', 'VENDOR'] },
    { id: 'procurement' as ActiveTab, translationKey: 'procurement', defaultLabel: 'Procurement (PR, RFQ, PO)', icon: ShoppingBag, roles: ['SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'VENDOR', 'EMPLOYEE'] },
    { id: 'inventory' as ActiveTab, translationKey: 'inventory', defaultLabel: 'Inventory & Warehouse', icon: Package, roles: ['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'PROCUREMENT_MANAGER'] },
    { id: 'finance' as ActiveTab, translationKey: 'finance', defaultLabel: 'Invoices & Finance', icon: FileText, roles: ['SUPER_ADMIN', 'FINANCE_MANAGER', 'VENDOR'] },
    { id: 'contracts' as ActiveTab, translationKey: 'contracts', defaultLabel: 'Contract CLM & Signatures', icon: FileCheck, roles: ['SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'FINANCE_MANAGER'] },
    { id: 'workflows' as ActiveTab, translationKey: 'workflows', defaultLabel: 'Workflow Rule Engine', icon: Cpu, roles: ['SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'FINANCE_MANAGER', 'WAREHOUSE_MANAGER'] },
    { id: 'logistics' as ActiveTab, translationKey: 'logistics', defaultLabel: 'Global Supply Radar', icon: Globe2, roles: ['SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'WAREHOUSE_MANAGER'] },
    { id: 'ai' as ActiveTab, translationKey: 'aiRisk', defaultLabel: 'AI Risk & Analytics', icon: Sparkles, roles: ['SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'FINANCE_MANAGER'] },
    { id: 'reports' as ActiveTab, translationKey: 'reports', defaultLabel: 'Reports & Exports', icon: BarChart3, roles: ['SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'FINANCE_MANAGER', 'WAREHOUSE_MANAGER'] },
    { id: 'notifications' as ActiveTab, translationKey: 'notifications', defaultLabel: 'Alerts & Email Center', icon: Bell, roles: ['SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'FINANCE_MANAGER', 'WAREHOUSE_MANAGER', 'VENDOR', 'EMPLOYEE'] },
    { id: 'developer' as ActiveTab, translationKey: 'developer', defaultLabel: 'Architecture & API Docs', icon: Terminal, roles: ['SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'FINANCE_MANAGER', 'WAREHOUSE_MANAGER', 'VENDOR', 'EMPLOYEE'] },
    { id: 'audit' as ActiveTab, translationKey: 'auditLog', defaultLabel: 'Audit Trail Logs', icon: ShieldAlert, roles: ['SUPER_ADMIN', 'PROCUREMENT_MANAGER', 'FINANCE_MANAGER'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(currentRole));

  return (
    <aside 
      className={`${collapsed ? 'w-20' : 'w-64'} bg-slate-900 text-slate-300 flex flex-col h-full sticky top-0 transition-all duration-300 z-40 border-r border-slate-800 shrink-0`}
    >
      {/* Brand Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-500/30">
              N
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-sm block">NEXUS PROCURE</span>
              <span className="text-[10px] text-indigo-400 font-mono tracking-wider block uppercase">Enterprise ERP</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg mx-auto">
            N
          </div>
        )}
        <button
          onClick={() => setCollapsed && setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filteredItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-xs transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
              title={collapsed ? t(item.translationKey) : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {!collapsed && <span className="truncate">{t(item.translationKey)}</span>}
              {!collapsed && isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-white ml-auto"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer User Profile & System info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        <button
          onClick={() => setShowProfileModal(true)}
          className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-800/80 transition-all text-left group"
          title="Click to view user profile details"
        >
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30 group-hover:ring-indigo-400"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 ring-2 ring-slate-950 rounded-full"></span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentUser.department || currentRole}
              </div>
            </div>
          )}
        </button>

        {!collapsed && (
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
            <span>MySQL + Spring Boot</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)} 
      />
    </aside>
  );
};

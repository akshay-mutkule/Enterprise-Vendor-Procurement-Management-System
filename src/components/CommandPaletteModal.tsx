import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, X, LayoutDashboard, Users, ShoppingBag, Package, FileText, 
  FileCheck, Cpu, Globe2, Sparkles, BarChart3, Terminal, ShieldAlert, 
  ArrowRight, Shield, Check, Command, Target
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { ActiveTab } from './Sidebar';
import { formatCurrency } from '../utils/exportUtils';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ 
  isOpen, onClose, onNavigateTab 
}) => {
  const { 
    vendors, products, purchaseOrders, invoices, 
    currentRole, switchRole 
  } = useProcurement();

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled externally or we can set focus
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset search when opened
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // All searchable items
  const allResults = useMemo(() => {
    const query = search.toLowerCase().trim();

    const modules = [
      { id: 'dashboard', name: 'Executive Dashboard & Spend Analytics', category: 'Navigation', icon: LayoutDashboard, tab: 'dashboard' as ActiveTab },
      { id: 'strategic', name: 'Strategic Sourcing & Kraljic Portfolio Matrix', category: 'Navigation', icon: Target, tab: 'strategic' as ActiveTab },
      { id: 'vendors', name: 'Vendor Lifecycle & Tier Management', category: 'Navigation', icon: Users, tab: 'vendors' as ActiveTab },
      { id: 'procurement', name: 'Procurement (Requisitions, RFQs, POs)', category: 'Navigation', icon: ShoppingBag, tab: 'procurement' as ActiveTab },
      { id: 'inventory', name: 'Inventory, Stock & Warehouse Godown', category: 'Navigation', icon: Package, tab: 'inventory' as ActiveTab },
      { id: 'finance', name: 'Invoices, 3-Way Match & Payments', category: 'Navigation', icon: FileText, tab: 'finance' as ActiveTab },
      { id: 'contracts', name: 'Contract Lifecycle (CLM) & Digital Signatures', category: 'Navigation', icon: FileCheck, tab: 'contracts' as ActiveTab },
      { id: 'workflows', name: 'Workflow Rule Engine & Automations', category: 'Navigation', icon: Cpu, tab: 'workflows' as ActiveTab },
      { id: 'logistics', name: 'Global Supply Disruption Radar', category: 'Navigation', icon: Globe2, tab: 'logistics' as ActiveTab },
      { id: 'ai', name: 'AI Risk Fraud Check & Predictive Models', category: 'Navigation', icon: Sparkles, tab: 'ai' as ActiveTab },
      { id: 'reports', name: 'Executive Reports & Statement Exports', category: 'Navigation', icon: BarChart3, tab: 'reports' as ActiveTab },
      { id: 'developer', name: 'Developer API & Architecture Hub', category: 'Navigation', icon: Terminal, tab: 'developer' as ActiveTab },
      { id: 'audit', name: 'Security Audit Trail Logs', category: 'Navigation', icon: ShieldAlert, tab: 'audit' as ActiveTab },
    ];

    const vendorItems = vendors.map(v => ({
      id: `v-${v.id}`,
      name: `${v.name} (${v.code}) - Rating: ${v.rating}★`,
      subtext: `${v.category} • Risk Score: ${v.riskScore}/100`,
      category: 'Suppliers',
      icon: Users,
      action: () => onNavigateTab('vendors')
    }));

    const poItems = purchaseOrders.map(po => ({
      id: `po-${po.id}`,
      name: `${po.poNumber} - ${po.vendorName}`,
      subtext: `Total: ${formatCurrency(po.totalAmount)} • Status: ${po.status}`,
      category: 'Purchase Orders',
      icon: ShoppingBag,
      action: () => onNavigateTab('procurement')
    }));

    const productItems = products.map(p => ({
      id: `prod-${p.id}`,
      name: `${p.name} (${p.sku})`,
      subtext: `Stock: ${p.stockQuantity} ${p.unit} • Unit Price: ${formatCurrency(p.unitPrice)}`,
      category: 'Godown Inventory',
      icon: Package,
      action: () => onNavigateTab('inventory')
    }));

    const systemActions = [
      {
        id: 'role-superadmin',
        name: 'Switch Role to Super Admin (Full Control)',
        category: 'Quick Action',
        icon: Shield,
        action: () => { switchRole('SUPER_ADMIN'); onClose(); }
      },
      {
        id: 'role-procure-mgr',
        name: 'Switch Role to Procurement Manager',
        category: 'Quick Action',
        icon: Shield,
        action: () => { switchRole('PROCUREMENT_MANAGER'); onClose(); }
      },
      {
        id: 'role-finance-mgr',
        name: 'Switch Role to Finance Manager',
        category: 'Quick Action',
        icon: Shield,
        action: () => { switchRole('FINANCE_MANAGER'); onClose(); }
      }
    ];

    const combined = [
      ...modules.map(m => ({
        ...m,
        action: () => { onNavigateTab(m.tab); onClose(); }
      })),
      ...systemActions,
      ...vendorItems,
      ...poItems,
      ...productItems
    ];

    if (!query) {
      return combined.slice(0, 10);
    }

    return combined.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query) ||
      (item as any).subtext?.toLowerCase().includes(query)
    ).slice(0, 14);

  }, [search, vendors, products, purchaseOrders, invoices, currentRole, switchRole, onNavigateTab, onClose]);

  if (!isOpen) return null;

  const handleSelect = (item: any) => {
    item.action?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-start justify-center pt-20 px-4 sm:px-6 animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-950/50">
          <Command className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, vendor, SKU, PO #, or module to jump..."
            className="w-full bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 text-sm placeholder-slate-400 font-medium"
            autoFocus
          />
          {search ? (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono text-slate-500">
              ESC
            </span>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/40">
          {allResults.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching commands or entities found for <strong className="text-slate-700 dark:text-slate-200">"{search}"</strong>
            </div>
          ) : (
            allResults.map((item, index) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === index;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-3.5 py-2.5 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-all ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-indigo-500'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {item.name}
                      </div>
                      {(item as any).subtext && (
                        <div className={`text-[11px] truncate ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {(item as any).subtext}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      isSelected 
                        ? 'bg-indigo-700/80 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {item.category}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">↵</kbd> Select</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">ESC</kbd> Close</span>
          </div>
          <span className="text-indigo-500 font-bold">Nexus Spotlight ⌘K</span>
        </div>
      </div>
    </div>
  );
};

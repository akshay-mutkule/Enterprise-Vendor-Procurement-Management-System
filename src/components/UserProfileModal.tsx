import React, { useState } from 'react';
import { 
  User as UserIcon, Shield, Mail, Building, Key, Clock, 
  CheckCircle, ShieldAlert, Award, Lock, ExternalLink, X, 
  RefreshCw, Smartphone, Laptop, Sparkles, AlertCircle
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { UserRole } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  isOpen, onClose, onNavigateTab 
}) => {
  const { currentUser, currentRole, switchRole, t, language, setLanguage, theme, toggleTheme } = useProcurement();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PERMISSIONS' | 'SECURITY' | 'ACTIVITY'>('OVERVIEW');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const roles: { role: UserRole; label: string; color: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', color: 'bg-indigo-600 text-white' },
    { role: 'PROCUREMENT_MANAGER', label: 'Procurement Manager', color: 'bg-emerald-600 text-white' },
    { role: 'FINANCE_MANAGER', label: 'Finance Manager', color: 'bg-blue-600 text-white' },
    { role: 'WAREHOUSE_MANAGER', label: 'Warehouse Manager', color: 'bg-amber-600 text-white' },
    { role: 'VENDOR', label: 'Vendor Portal', color: 'bg-purple-600 text-white font-semibold' },
    { role: 'EMPLOYEE', label: 'Employee', color: 'bg-slate-700 text-white' },
  ];

  const permissions = [
    { title: 'Requisition Creation & PO Approval', granted: true, level: 'Unlimited ($500k+ Limit)' },
    { title: 'Vendor Onboarding & KYC Clearance', granted: currentRole === 'SUPER_ADMIN' || currentRole === 'PROCUREMENT_MANAGER', level: 'Full Rights' },
    { title: 'Invoice Matching & Bank Disbursement', granted: currentRole === 'SUPER_ADMIN' || currentRole === 'FINANCE_MANAGER', level: 'Finance Sign-off' },
    { title: 'Warehouse Stock Adjustment & GRN', granted: currentRole === 'SUPER_ADMIN' || currentRole === 'WAREHOUSE_MANAGER', level: 'Warehouse Control' },
    { role: 'Audit Trail Inspection & Log Export', granted: currentRole === 'SUPER_ADMIN' || currentRole === 'FINANCE_MANAGER' || currentRole === 'PROCUREMENT_MANAGER', level: 'SOC-2 Read/Write' },
    { title: 'AI Fraud Risk Analysis & Model Tuning', granted: currentRole === 'SUPER_ADMIN' || currentRole === 'PROCUREMENT_MANAGER', level: 'Gemini AI API' }
  ];

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentUser.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Banner & Close */}
        <div className="relative bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 pb-16">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close Profile Details"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-indigo-300 text-xs font-mono mb-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Authenticated User Session • Active SSO Token</span>
          </div>
          <h2 className="text-xl font-extrabold">User Profile & Identity Record</h2>
        </div>

        {/* User Card Floating Header */}
        <div className="px-6 -mt-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-lg"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 ring-2 ring-white dark:ring-slate-800 rounded-full" title="Status: Online & Active"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{currentUser.name}</h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase tracking-wider">
                  {currentUser.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5" /> {currentUser.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${roles.find(r => r.role === currentRole)?.color}`}>
                  {roles.find(r => r.role === currentRole)?.label}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  • {currentUser.department || 'Enterprise Executive'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCopyId}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Key className="w-3.5 h-3.5 text-indigo-500" />
            {copied ? 'Copied ID!' : `ID: ${currentUser.id}`}
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-700 px-6 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-semibold">
          {[
            { id: 'OVERVIEW', label: 'User Overview' },
            { id: 'PERMISSIONS', label: 'Privileges & Matrix' },
            { id: 'SECURITY', label: 'Security & SSO' },
            { id: 'ACTIVITY', label: 'Role Switcher' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 border-b-2 transition-all ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Full Legal Name</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{currentUser.name}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Work Email Address</span>
                  <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">{currentUser.email}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Department / Business Unit</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{currentUser.department || 'Global Supply Chain Operations'}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Assigned Security Clearance</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Tier-1 Executive Clearance
                  </p>
                </div>
              </div>

              {/* Quick Preferences */}
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Account Settings & Interface Preferences
                </h4>
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Theme Mode:</span>
                    <button
                      onClick={toggleTheme}
                      className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-800 dark:text-slate-200 shadow-sm"
                    >
                      {theme === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">System Language:</span>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as any)}
                      className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-800 dark:text-slate-200 shadow-sm"
                    >
                      <option value="EN">English (EN)</option>
                      <option value="ES">Español (ES)</option>
                      <option value="FR">Français (FR)</option>
                      <option value="DE">Deutsch (DE)</option>
                      <option value="HI">हिन्दी (HI)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PERMISSIONS' && (
            <div className="space-y-3">
              <p className="text-slate-500 dark:text-slate-400">
                Role-Based Access Control (RBAC) permissions associated with your current active role ({currentRole}):
              </p>
              <div className="space-y-2">
                {permissions.map((perm, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{perm.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Permission Level: {perm.level}</div>
                    </div>
                    {perm.granted ? (
                      <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-md font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Allowed
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-md font-bold text-[11px] flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Restricted
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'SECURITY' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">2FA Multi-Factor Auth</div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Enforced (YubiKey / Hardware Token)</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <Laptop className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Active Device Session</div>
                    <div className="text-slate-500 font-mono text-[11px] mt-0.5">Chrome 127 • MacOS Enterprise</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">SOC-2 Type II Audit</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">Immutable Ledger ID #AUD-99214</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Session Timeout</div>
                    <div className="text-slate-500 font-mono text-[11px] mt-0.5">Auto-lock in 45 minutes</div>
                  </div>
                </div>
              </div>

              {onNavigateTab && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onNavigateTab('audit');
                      onClose();
                    }}
                    className="w-full py-2.5 bg-slate-900 dark:bg-slate-950 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-md"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Open Security & Audit Trail Logs →
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ACTIVITY' && (
            <div className="space-y-3">
              <p className="text-slate-500 dark:text-slate-400">
                Switch user perspective to simulate different platform authorizations in real time:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchRole(r.role);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${currentRole === r.role ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 ring-2 ring-indigo-500/30' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{r.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.role}</div>
                    </div>
                    {currentRole === r.role ? (
                      <CheckCircle className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <span className="text-[10px] text-indigo-600 font-bold hover:underline">Select</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono">
            Logged in as <span className="font-bold text-slate-700 dark:text-slate-300">{currentUser.name}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Done & Close
          </button>
        </div>

      </div>
    </div>
  );
};

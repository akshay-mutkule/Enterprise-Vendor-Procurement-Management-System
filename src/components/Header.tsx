import React, { useState } from 'react';
import { 
  Search, Bell, Moon, Sun, Globe, Shield, User as UserIcon, 
  ChevronDown, CheckCircle, AlertTriangle, Info, X 
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { UserRole } from '../types';

interface HeaderProps {
  activeTab?: string;
  setActiveTab?: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { 
    currentRole, currentUser, switchRole, theme, toggleTheme, 
    language, setLanguage, searchQuery, setSearchQuery,
    notifications, markNotificationRead, clearAllNotifications 
  } = useProcurement();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const roles: { role: UserRole; label: string; color: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', color: 'bg-indigo-600 text-white' },
    { role: 'PROCUREMENT_MANAGER', label: 'Procurement Mgr', color: 'bg-emerald-600 text-white' },
    { role: 'FINANCE_MANAGER', label: 'Finance Mgr', color: 'bg-blue-600 text-white' },
    { role: 'WAREHOUSE_MANAGER', label: 'Warehouse Mgr', color: 'bg-amber-600 text-white' },
    { role: 'VENDOR', label: 'Vendor Portal', color: 'bg-purple-600 text-white' },
    { role: 'EMPLOYEE', label: 'Employee', color: 'bg-slate-700 text-white' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between transition-colors">
      
      {/* Global Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Global Search (POs, Vendors, Invoices, Products, RFQs)..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 md:gap-4">

        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            title="Switch User Role to test permissions"
          >
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline">
              Role:
            </span>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${roles.find(r => r.role === currentRole)?.color}`}>
              {roles.find(r => r.role === currentRole)?.label}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-2 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Simulate Role View
              </div>
              {roles.map(r => (
                <button
                  key={r.role}
                  onClick={() => {
                    switchRole(r.role);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${currentRole === r.role ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  <span>{r.label}</span>
                  {currentRole === r.role && <CheckCircle className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
            title="Multi-language Support"
          >
            <Globe className="w-4 h-4" />
            <span className="hidden md:inline">{language}</span>
          </button>
          {showLangDropdown && (
            <div className="absolute right-0 mt-2 w-28 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-50 text-xs">
              {(['EN', 'ES', 'FR', 'DE', 'HI'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => { setLanguage(lang); setShowLangDropdown(false); }}
                  className={`w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 ${language === lang ? 'font-bold text-indigo-600' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  {lang === 'EN' && 'English'}
                  {lang === 'ES' && 'Español'}
                  {lang === 'FR' && 'Français'}
                  {lang === 'DE' && 'Deutsch'}
                  {lang === 'HI' && 'हिन्दी'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Toggle Dark/Light Mode"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Notifications ({notifications.length})
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No new notifications</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${!n.read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}`}
                    >
                      <div className="flex items-start gap-2.5">
                        {n.type === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />}
                        {n.type === 'SUCCESS' && <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />}
                        {n.type === 'INFO' && <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />}
                        {n.type === 'ALERT' && <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">{n.title}</h4>
                            <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {setActiveTab && (
                <div className="p-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-center">
                  <button
                    onClick={() => {
                      setActiveTab('notifications');
                      setShowNotifications(false);
                    }}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View Full Alerts & Email Center →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
          />
          <div className="hidden lg:block">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentUser.name}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">{currentUser.department || 'Enterprise Admin'}</div>
          </div>
        </div>

      </div>
    </header>
  );
};

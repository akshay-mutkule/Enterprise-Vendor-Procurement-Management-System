import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, Moon, Sun, Globe, Shield, User as UserIcon, 
  ChevronDown, CheckCircle, AlertTriangle, Info, X, Menu, LayoutDashboard,
  Users, ShoppingBag, Package, FileText, Sparkles, BarChart3, Terminal, ShieldAlert,
  Command, Volume2, VolumeX, Check, Flame, Target
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { UserRole } from '../types';
import { UserProfileModal } from './UserProfileModal';
import { CommandPaletteModal } from './CommandPaletteModal';
import { sound } from '../utils/soundUtils';

interface HeaderProps {
  activeTab?: string;
  setActiveTab?: (tab: any) => void;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, setActiveTab, collapsed, setCollapsed, mobileMenuOpen, setMobileMenuOpen 
}) => {
  const { 
    currentRole, currentUser, switchRole, theme, toggleTheme, 
    language, setLanguage, searchQuery, setSearchQuery,
    notifications, markNotificationRead, clearAllNotifications, t 
  } = useProcurement();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [activeNotificationFilter, setActiveNotificationFilter] = useState<'ALL' | 'CRITICAL' | 'UNREAD'>('ALL');
  const [soundActive, setSoundActive] = useState(sound.isEnabled());

  // Listen for Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const roles: { role: UserRole; label: string; color: string; badgeBg: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', color: 'bg-indigo-600 text-white', badgeBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' },
    { role: 'PROCUREMENT_MANAGER', label: 'Procurement Mgr', color: 'bg-emerald-600 text-white', badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    { role: 'FINANCE_MANAGER', label: 'Finance Mgr', color: 'bg-blue-600 text-white', badgeBg: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
    { role: 'WAREHOUSE_MANAGER', label: 'Warehouse Mgr', color: 'bg-amber-600 text-white', badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
    { role: 'VENDOR', label: 'Vendor Portal', color: 'bg-purple-600 text-white', badgeBg: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
    { role: 'EMPLOYEE', label: 'Employee', color: 'bg-slate-700 text-white', badgeBg: 'bg-slate-500/20 text-slate-400 border-slate-500/40' },
  ];

  const quickNavTabs = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'strategic', label: 'Strategic Sourcing', icon: Target },
    { id: 'vendors', label: t('vendors'), icon: Users },
    { id: 'procurement', label: t('procurement'), icon: ShoppingBag },
    { id: 'inventory', label: t('inventory'), icon: Package },
    { id: 'finance', label: t('finance'), icon: FileText },
    { id: 'contracts', label: 'Contract CLM', icon: Sparkles },
    { id: 'ai', label: t('aiRisk'), icon: Sparkles },
    { id: 'reports', label: t('reports'), icon: BarChart3 },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'developer', label: t('developer'), icon: Terminal },
    { id: 'audit', label: t('auditLog'), icon: ShieldAlert },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeNotificationFilter === 'UNREAD') return !n.read;
    if (activeNotificationFilter === 'CRITICAL') return n.type === 'ALERT' || n.type === 'WARNING';
    return true;
  });

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/90 px-3 md:px-6 flex items-center justify-between transition-colors shadow-sm">
        
        {/* Mobile Menu & Search Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          {/* Sidebar Toggle for Desktop/Mobile */}
          {setCollapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
              title="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Quick Nav Modules Dropdown */}
          {setActiveTab && (
            <div className="relative">
              <button
                onClick={() => setShowNavMenu(!showNavMenu)}
                className="px-2.5 py-1.5 bg-gradient-to-r from-indigo-50 to-indigo-100/70 dark:from-indigo-950/70 dark:to-indigo-900/50 hover:from-indigo-100 hover:to-indigo-200 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm border border-indigo-200 dark:border-indigo-800 shrink-0"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">Modules</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showNavMenu && (
                <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Navigate Enterprise Modules
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {quickNavTabs.map(tab => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setShowNavMenu(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-slate-700/60 transition-colors ${activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 font-bold' : 'text-slate-700 dark:text-slate-200'}`}
                        >
                          <Icon className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Spotlight Search & Command Trigger */}
          <div 
            onClick={() => setShowCommandPalette(true)}
            className="relative w-full cursor-pointer group"
          >
            <div className="w-full flex items-center justify-between pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl group-hover:border-indigo-400 dark:group-hover:border-indigo-500 transition-all text-slate-400">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span className="truncate">Search vendors, POs, SKUs, or type ⌘K...</span>
              <span className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-white dark:bg-slate-700 text-[10px] font-mono text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shadow-xs">
                ⌘K
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 md:gap-3.5">

          {/* Node Live Ping Status */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 rounded-full text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Node • 12ms</span>
          </div>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-all"
              title="Switch User Role to test permissions"
            >
              <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline">
                Role:
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${roles.find(r => r.role === currentRole)?.color}`}>
                {roles.find(r => r.role === currentRole)?.label}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Simulate Role Access Control
                </div>
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchRole(r.role);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${currentRole === r.role ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${r.color.split(' ')[0]}`}></span>
                      {r.label}
                    </span>
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
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Multi-language Support"
            >
              <Globe className="w-4 h-4 text-indigo-500" />
              <span className="hidden md:inline font-mono">{language}</span>
            </button>
            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-50 text-xs animate-fadeIn">
                {(['EN', 'ES', 'FR', 'DE', 'HI'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setShowLangDropdown(false); }}
                    className={`w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between ${language === lang ? 'font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    <span>
                      {lang === 'EN' && '🇺🇸 English'}
                      {lang === 'ES' && '🇪🇸 Español'}
                      {lang === 'FR' && '🇫🇷 Français'}
                      {lang === 'DE' && '🇩🇪 Deutsch'}
                      {lang === 'HI' && '🇮🇳 हिन्दी'}
                    </span>
                    {language === lang && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sound FX Audio Toggle */}
          <button
            onClick={() => {
              sound.toggleSound();
              // force re-render
              setSoundActive(sound.isEnabled());
            }}
            className={`p-2 rounded-xl transition-colors ${
              soundActive
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={soundActive ? 'Sound Effects: ON (Click to Mute)' : 'Sound Effects: OFF (Click to Enable)'}
          >
            {soundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              toggleTheme();
            }}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Toggle Dark/Light Mode"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse shadow-md shadow-rose-500/40">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Live Alerts
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                      {notifications.length} Total
                    </span>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex border-b border-slate-100 dark:border-slate-700 px-3 py-1.5 gap-2 text-xs">
                  <button 
                    onClick={() => setActiveNotificationFilter('ALL')}
                    className={`px-2 py-1 rounded-lg font-bold text-[11px] ${activeNotificationFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    All ({notifications.length})
                  </button>
                  <button 
                    onClick={() => setActiveNotificationFilter('UNREAD')}
                    className={`px-2 py-1 rounded-lg font-bold text-[11px] ${activeNotificationFilter === 'UNREAD' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    Unread ({unreadCount})
                  </button>
                  <button 
                    onClick={() => setActiveNotificationFilter('CRITICAL')}
                    className={`px-2 py-1 rounded-lg font-bold text-[11px] ${activeNotificationFilter === 'CRITICAL' ? 'bg-rose-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    Critical
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">No notifications in this filter</div>
                  ) : (
                    filteredNotifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${!n.read ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''}`}
                      >
                        <div className="flex items-start gap-2.5">
                          {n.type === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />}
                          {n.type === 'SUCCESS' && <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />}
                          {n.type === 'INFO' && <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />}
                          {n.type === 'ALERT' && <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</h4>
                              <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{n.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {setActiveTab && (
                  <div className="p-2.5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-center rounded-b-2xl">
                    <button
                      onClick={() => {
                        setActiveTab('notifications');
                        setShowNotifications(false);
                      }}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Open Full Alerts & Notifications Hub →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Info (Clickable for Profile Details) */}
          <button 
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-xl transition-all text-left cursor-pointer group"
            title="Click to view full user profile & identity details"
          >
            <div className="relative">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/40 group-hover:ring-indigo-500 transition-all shadow-sm"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 ring-2 ring-white dark:ring-slate-900 rounded-full"></span>
            </div>
            <div className="hidden lg:block">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                {currentUser.name}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">{currentUser.department || 'Enterprise Admin'}</div>
            </div>
          </button>

          {/* User Profile Details Modal */}
          <UserProfileModal 
            isOpen={showProfileModal} 
            onClose={() => setShowProfileModal(false)} 
            onNavigateTab={setActiveTab} 
          />

          {/* Command Palette Modal */}
          <CommandPaletteModal
            isOpen={showCommandPalette}
            onClose={() => setShowCommandPalette(false)}
            onNavigateTab={(tab) => {
              if (setActiveTab) setActiveTab(tab);
            }}
          />

        </div>
      </header>
    </>
  );
};

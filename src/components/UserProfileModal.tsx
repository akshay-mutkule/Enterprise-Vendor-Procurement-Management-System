import React, { useState } from 'react';
import { 
  User as UserIcon, Shield, Mail, Building, Key, Clock, 
  CheckCircle, ShieldAlert, Award, Lock, ExternalLink, X, 
  RefreshCw, Smartphone, Laptop, Sparkles, AlertCircle,
  Camera, Upload, Image as ImageIcon, Check, Edit2, Link as LinkIcon
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { UserRole } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

const PRESET_AVATARS = [
  { id: '1', name: 'Executive Female 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300' },
  { id: '2', name: 'Executive Male 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300' },
  { id: '3', name: 'Corporate Female 2', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' },
  { id: '4', name: 'Tech Lead Male 2', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300' },
  { id: '5', name: 'Manager Female 3', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300' },
  { id: '6', name: 'Director Male 3', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300' },
  { id: '7', name: 'Vendor Rep Male 4', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300' },
  { id: '8', name: 'Specialist Female 4', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300' },
  { id: '9', name: 'Creative Leader', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300' },
  { id: '10', name: 'Minimalist Avatar 1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300' },
  { id: '11', name: 'Modern Avatar 2', url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=300' },
  { id: '12', name: 'Professional Portrait', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300' },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  isOpen, onClose, onNavigateTab 
}) => {
  const { 
    currentUser, currentRole, switchRole, t, 
    language, setLanguage, theme, toggleTheme,
    updateUserAvatar, updateUserProfile 
  } = useProcurement();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AVATAR_STUDIO' | 'PERMISSIONS' | 'SECURITY' | 'ACTIVITY'>('OVERVIEW');
  const [copied, setCopied] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editDept, setEditDept] = useState(currentUser.department || '');

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateUserAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      updateUserAvatar(customUrl.trim());
      setCustomUrl('');
    }
  };

  const handleSaveProfileDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: editName,
      department: editDept
    });
    setEditingProfile(false);
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
            
            {/* Interactive Avatar Container */}
            <div className="relative group">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-lg group-hover:opacity-90 transition-opacity"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 ring-2 ring-white dark:ring-slate-800 rounded-full z-10" title="Status: Online & Active"></span>

              {/* Hover Badge to change avatar */}
              <button
                onClick={() => setActiveTab('AVATAR_STUDIO')}
                className="absolute inset-0 rounded-2xl bg-slate-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer"
                title="Change Profile Picture"
              >
                <Camera className="w-5 h-5 mb-0.5 text-indigo-300 animate-bounce" />
                <span>Change Photo</span>
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{currentUser.name}</h3>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase tracking-wider">
                  {currentUser.status}
                </span>
                <button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Edit Profile Info"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
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
        <div className="flex items-center border-b border-slate-200 dark:border-slate-700 px-6 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-semibold overflow-x-auto no-scrollbar">
          {[
            { id: 'OVERVIEW', label: 'User Overview' },
            { id: 'AVATAR_STUDIO', label: '📸 Profile Photo Studio' },
            { id: 'PERMISSIONS', label: 'Privileges & Matrix' },
            { id: 'SECURITY', label: 'Security & SSO' },
            { id: 'ACTIVITY', label: 'Role Switcher' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              
              {/* Quick Profile Editor */}
              {editingProfile ? (
                <form onSubmit={handleSaveProfileDetails} className="p-4 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900/60 space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                    <Edit2 className="w-3.5 h-3.5 text-indigo-600" /> Edit Profile Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Department</label>
                      <input
                        type="text"
                        value={editDept}
                        onChange={e => setEditDept(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button type="button" onClick={() => setEditingProfile(false)} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs">Cancel</button>
                    <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-xs shadow hover:bg-indigo-500">Save Changes</button>
                  </div>
                </form>
              ) : (
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
              )}

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

          {/* AVATAR STUDIO TAB */}
          {activeTab === 'AVATAR_STUDIO' && (
            <div className="space-y-5">
              
              {/* Option A: Upload Local Image File */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                    <Upload className="w-4 h-4 text-indigo-600" /> Upload Local Photo
                  </h4>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WebP (Max 5MB)</span>
                </div>
                
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 rounded-xl bg-white dark:bg-slate-800 cursor-pointer transition-colors group">
                  <Camera className="w-7 h-7 text-indigo-500 group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Click to Select or Drag & Drop Image File</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Image converts immediately & persists to your account profile</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Option B: Curated Executive Preset Avatars */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-indigo-600" /> Select From Executive Gallery
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">12 High-Res Portraits</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-1">
                  {PRESET_AVATARS.map((preset) => {
                    const isSelected = currentUser.avatar === preset.url;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => updateUserAvatar(preset.url)}
                        className={`relative group rounded-xl overflow-hidden border-2 transition-all p-1 text-center ${
                          isSelected 
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500/40' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                        }`}
                      >
                        <div className="aspect-square w-full overflow-hidden rounded-lg relative">
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                              <Check className="w-6 h-6 text-white drop-shadow" />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 truncate block mt-1">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Option C: Custom Web Image URL */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-indigo-600" /> Paste Image Link URL
                </h4>
                <form onSubmit={handleApplyCustomUrl} className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={e => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/my-photo.jpg"
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-white font-mono"
                  />
                  <button
                    type="submit"
                    disabled={!customUrl.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-colors"
                  >
                    Set URL
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* PERMISSIONS TAB */}
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

          {/* SECURITY TAB */}
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

          {/* ACTIVITY / ROLE SWITCHER TAB */}
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

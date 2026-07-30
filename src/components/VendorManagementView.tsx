import React, { useState } from 'react';
import { 
  Plus, Search, Filter, ShieldCheck, ShieldAlert, CheckCircle, 
  XCircle, Ban, FileText, Star, Award, Building2, CreditCard, 
  Upload, Sparkles, ExternalLink 
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { Vendor, VendorStatus } from '../types';

export const VendorManagementView: React.FC = () => {
  const { vendors, addVendor, updateVendorStatus, searchQuery } = useProcurement();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(vendors[0] || null);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'DOCS' | 'BANK_GST' | 'PERFORMANCE'>('DETAILS');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Registration Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics & Microchips',
    contactEmail: '',
    phone: '',
    address: '',
    gstin: '',
    bankName: '',
    bankAccount: '',
    ifscCode: '',
    notes: ''
  });

  const categories = [
    'Electronics & Microchips',
    'Packaging & Freight Logistics',
    'Industrial Machinery',
    'Raw Metals & Steel',
    'Raw Materials & Solvents',
    'IT & Office Software'
  ];

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVendor({
      ...formData,
      documents: []
    });
    setShowRegisterModal(false);
    setFormData({
      name: '', category: 'Electronics & Microchips', contactEmail: '',
      phone: '', address: '', gstin: '', bankName: '', bankAccount: '', ifscCode: '', notes: ''
    });
  };

  const handleRunAiRiskAnalysis = async (vendor: Vendor) => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'VENDOR_RISK',
          payload: {
            vendorName: vendor.name,
            code: vendor.code,
            rating: vendor.rating,
            onTimeDeliveryRate: vendor.performanceMetrics.onTimeDeliveryRate,
            qualityCompliance: vendor.performanceMetrics.qualityCompliance,
            documentsCount: vendor.documents.length
          }
        })
      });
      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const getStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Pending Approval</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
      case 'BLACKLISTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 text-white border border-slate-700 flex items-center gap-1"><Ban className="w-3 h-3 text-rose-400" /> Blacklisted</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Vendor Master Lifecycle & Approval Workflow
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage vendor onboarding, document verification, bank details, risk scoring, and blacklisting.
          </p>
        </div>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Onboard New Vendor
        </button>
      </div>

      {/* Main Grid Layout (Left List, Right Detail Pane) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Vendor List (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[650px]">
          <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Vendors Roster ({filteredVendors.length})
            </span>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700 flex-1">
            {filteredVendors.map(vendor => {
              const isSelected = selectedVendor?.id === vendor.id;
              return (
                <div
                  key={vendor.id}
                  onClick={() => { setSelectedVendor(vendor); setAiResult(null); }}
                  className={`p-4 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 ${isSelected ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-indigo-600' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{vendor.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{vendor.code} • {vendor.category}</p>
                    </div>
                    {getStatusBadge(vendor.status)}
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-slate-500 text-[11px]">Rating: ⭐ {vendor.rating}</span>
                    <span className={`font-bold text-[11px] px-2 py-0.5 rounded ${vendor.riskScore > 50 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                      Risk: {vendor.riskScore}/100
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vendor Detail Pane (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 overflow-y-auto h-[650px]">
          {selectedVendor ? (
            <div className="space-y-6">
              
              {/* Profile Top Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedVendor.name}</h3>
                    {getStatusBadge(selectedVendor.status)}
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-1">Code: {selectedVendor.code} | Onboarded: {selectedVendor.onboardedAt}</p>
                </div>

                {/* Approval Action Buttons */}
                <div className="flex items-center gap-2">
                  {selectedVendor.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => updateVendorStatus(selectedVendor.id, 'APPROVED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                      >
                        Approve Vendor
                      </button>
                      <button
                        onClick={() => updateVendorStatus(selectedVendor.id, 'REJECTED')}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {selectedVendor.status !== 'BLACKLISTED' && (
                    <button
                      onClick={() => updateVendorStatus(selectedVendor.id, 'BLACKLISTED')}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold transition-all border border-slate-700"
                    >
                      Blacklist
                    </button>
                  )}
                  {selectedVendor.status === 'BLACKLISTED' && (
                    <button
                      onClick={() => updateVendorStatus(selectedVendor.id, 'APPROVED')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all"
                    >
                      Re-Instate
                    </button>
                  )}
                </div>
              </div>

              {/* Detail Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-4">
                {(['DETAILS', 'DOCS', 'BANK_GST', 'PERFORMANCE'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 text-xs font-bold border-b-2 transition-colors ${activeTab === tab ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    {tab === 'DETAILS' && 'Overview'}
                    {tab === 'DOCS' && `Documents (${selectedVendor.documents.length})`}
                    {tab === 'BANK_GST' && 'Bank & GST Compliance'}
                    {tab === 'PERFORMANCE' && 'Performance & AI Risk'}
                  </button>
                ))}
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'DETAILS' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedVendor.category}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedVendor.phone}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Email</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedVendor.contactEmail}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Address</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedVendor.address}</span>
                    </div>
                  </div>

                  {selectedVendor.notes && (
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-lg">
                      <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-1">Procurement Notes</span>
                      <p className="text-slate-700 dark:text-slate-300">{selectedVendor.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Documents */}
              {activeTab === 'DOCS' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Uploaded Compliance Documents</h4>
                    <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold flex items-center gap-1.5 hover:bg-slate-200">
                      <Upload className="w-3.5 h-3.5" /> Upload File
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedVendor.documents.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                        No compliance documents uploaded yet.
                      </div>
                    ) : (
                      selectedVendor.documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-lg">
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-indigo-600" />
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">{doc.name}</span>
                              <span className="text-[10px] text-slate-400">{doc.type} • Uploaded {doc.uploadDate}</span>
                            </div>
                          </div>
                          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Bank & GST */}
              {activeTab === 'BANK_GST' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-xl space-y-3">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-600" /> Tax & Banking Registration Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">GSTIN Number</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{selectedVendor.gstin}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Bank Name</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedVendor.bankName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Account Number</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">{selectedVendor.bankAccount}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">IFSC / Swift Code</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">{selectedVendor.ifscCode}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Performance & AI Risk */}
              {activeTab === 'PERFORMANCE' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">On-Time Delivery</span>
                      <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">{selectedVendor.performanceMetrics.onTimeDeliveryRate}%</span>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Quality Compliance</span>
                      <span className="text-base font-extrabold text-indigo-700 dark:text-indigo-400">{selectedVendor.performanceMetrics.qualityCompliance}%</span>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Price Competitiveness</span>
                      <span className="text-base font-extrabold text-amber-700 dark:text-amber-400">{selectedVendor.performanceMetrics.priceCompetitiveness}%</span>
                    </div>
                  </div>

                  {/* AI Risk Score Generator */}
                  <div className="p-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-xl shadow-md border border-indigo-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
                        <div>
                          <h4 className="font-bold text-sm">Gemini AI Vendor Risk Evaluator</h4>
                          <p className="text-[11px] text-indigo-200">Run server-side predictive analysis on SLA compliance and financial stability.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRunAiRiskAnalysis(selectedVendor)}
                        disabled={aiLoading}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs shadow transition-all disabled:opacity-50"
                      >
                        {aiLoading ? 'Analyzing...' : 'Run AI Analysis'}
                      </button>
                    </div>

                    {aiResult && (
                      <div className="mt-4 pt-3 border-t border-indigo-800 space-y-2 text-xs">
                        <div className="font-bold text-indigo-300">Summary:</div>
                        <p className="text-slate-200">{aiResult.summary}</p>
                        {aiResult.insights && (
                          <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                            {aiResult.insights.map((ins: string, i: number) => <li key={i}>{ins}</li>)}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">Select a vendor from the left roster to view details.</div>
          )}
        </div>

      </div>

      {/* Onboard Vendor Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">Onboard New Vendor</h3>
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Company Legal Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Acme Microelectronics Corp"
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="sales@company.com"
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="27AAACA12341ZP"
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="JPMorgan Chase"
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Bank Account / IFSC</label>
                  <input
                    type="text"
                    value={formData.bankAccount}
                    onChange={e => setFormData({ ...formData, bankAccount: e.target.value, ifscCode: 'CHAS000100' })}
                    placeholder="Acc: 123456789"
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Registered Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="100 Tech Park Way..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md"
                >
                  Register Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

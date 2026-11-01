import React, { useState } from 'react';
import { 
  FileText, ShieldCheck, AlertTriangle, FileCheck, Lock, 
  Sparkles, Plus, Search, CheckCircle, Download, ExternalLink, 
  PenTool, ShieldAlert, Clock, RefreshCw, Key, Shield, Calendar,
  DollarSign, Check, XCircle, ArrowUpRight, Award, Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProcurement } from '../context/ProcurementContext';
import { formatCurrency } from '../utils/exportUtils';
import { sound } from '../utils/soundUtils';

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  vendorId: string;
  vendorName: string;
  type: 'MSA' | 'NDA' | 'SLA' | 'SOW';
  value: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'PENDING_SIGNATURE' | 'UNDER_AI_REVIEW' | 'EXPIRED';
  aiRiskScore: number; // 0 - 100
  signedByVendor: boolean;
  signedByEnterprise: boolean;
  cryptoSignatureHash?: string;
  keyClauses: {
    title: string;
    content: string;
    riskFlag?: string;
  }[];
}

const initialContracts: Contract[] = [
  {
    id: 'cnt-101',
    contractNumber: 'MSA-2026-001',
    title: 'Master Component Supply & Semiconductor MSA',
    vendorId: 'v-101',
    vendorName: 'Apex Components Ltd',
    type: 'MSA',
    value: 450000,
    startDate: '2026-01-01',
    endDate: '2027-12-31',
    status: 'ACTIVE',
    aiRiskScore: 18,
    signedByVendor: true,
    signedByEnterprise: true,
    cryptoSignatureHash: '0x8f3c...e91a24d77b',
    keyClauses: [
      { title: 'Section 4: Delivery Lead Times', content: 'Vendor guarantees max 7 business day lead time for standard Cortex microcontrollers.', riskFlag: 'Compliant' },
      { title: 'Section 8: Limitation of Liability', content: 'Total liability capped at 2x total PO value issued within trailing 12 months.', riskFlag: 'Low Risk' },
      { title: 'Section 12: Price Escalation Cap', content: 'Annual price increases strictly capped at 4% maximum subject to 60-day notice.', riskFlag: 'Protected' }
    ]
  },
  {
    id: 'cnt-102',
    contractNumber: 'SLA-2026-089',
    title: 'Precision Metal Stamping SOW & SLA Agreement',
    vendorId: 'v-102',
    vendorName: 'Global Metals & Alloys',
    type: 'SLA',
    value: 280000,
    startDate: '2026-03-15',
    endDate: '2026-09-14', // Expiring in ~45 days
    status: 'ACTIVE',
    aiRiskScore: 68,
    signedByVendor: true,
    signedByEnterprise: true,
    cryptoSignatureHash: '0x3a7e...f8221b099d',
    keyClauses: [
      { title: 'Section 3: Defect Rate SLA', content: 'Defect rate target <= 0.05%. Rebates applied if defect rate exceeds 0.2%.', riskFlag: 'Acceptable' },
      { title: 'Section 9: Liquidated Damages Clause', content: 'Delays exceeding 5 business days trigger mandatory 2.0% daily rebate deduction.', riskFlag: 'Active SLA Penalty' }
    ]
  },
  {
    id: 'cnt-103',
    contractNumber: 'NDA-2026-042',
    title: 'Bilateral IP Protection & Technical NDA',
    vendorId: 'v-103',
    vendorName: 'Circuit World Inc',
    type: 'NDA',
    value: 0,
    startDate: '2026-02-01',
    endDate: '2029-02-01',
    status: 'PENDING_SIGNATURE',
    aiRiskScore: 12,
    signedByVendor: false,
    signedByEnterprise: true,
    keyClauses: [
      { title: 'Section 1: Confidentiality Scope', content: 'Covers proprietary PCB schematics, Firmware binary code, and Vendor pricing formulas.', riskFlag: 'Standard' }
    ]
  }
];

export const ContractLifecycleView: React.FC = () => {
  const { 
    vendors, currentUser, logActivity, searchQuery, 
    slaMetrics, claimSLAPenalty, addToast 
  } = useProcurement();

  const [activeTab, setActiveTab] = useState<'CONTRACTS' | 'SLA_TRACKER' | 'RENEWAL_RADAR'>('CONTRACTS');
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(initialContracts[0]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  
  // Modals & Actions
  const [showSignModal, setShowSignModal] = useState(false);
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [digitalPin, setDigitalPin] = useState('');

  // New Contract Form State
  const [newContractForm, setNewContractForm] = useState({
    title: 'Master Logistics & Freight Service Agreement',
    vendorId: vendors[0]?.id || 'v-101',
    type: 'MSA' as 'MSA' | 'NDA' | 'SLA' | 'SOW',
    value: 125000,
    startDate: '2026-09-01',
    endDate: '2027-08-31'
  });

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPenaltiesRecoverable = slaMetrics.reduce((acc, m) => acc + m.penaltyAmount, 0);

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    const vendorObj = vendors.find(v => v.id === newContractForm.vendorId);
    const newCnt: Contract = {
      id: `cnt-${Date.now()}`,
      contractNumber: `${newContractForm.type}-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: newContractForm.title,
      vendorId: newContractForm.vendorId,
      vendorName: vendorObj?.name || 'Selected Vendor',
      type: newContractForm.type,
      value: newContractForm.value,
      startDate: newContractForm.startDate,
      endDate: newContractForm.endDate,
      status: 'UNDER_AI_REVIEW',
      aiRiskScore: 35,
      signedByVendor: false,
      signedByEnterprise: false,
      keyClauses: [
        { title: 'Section 1: Scope of Work', content: `Standard ${newContractForm.type} performance benchmarks and pricing schedule.` },
        { title: 'Section 5: Governing Law', content: 'Agreement subject to Enterprise Commercial Arbitration and Delaware Business Code.' }
      ]
    };

    setContracts([newCnt, ...contracts]);
    setSelectedContract(newCnt);
    setShowNewContractModal(false);
    logActivity('CREATE_CONTRACT', 'SYSTEM', `Created contract ${newCnt.contractNumber} for ${newCnt.vendorName}`);
    addToast('Contract Drafted', `${newCnt.contractNumber} created and queued for review.`, 'success');
  };

  const handleExecuteSign = () => {
    if (!selectedContract) return;
    sound.playSuccess();
    const cryptoHash = `0x${Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
    
    const updated = contracts.map(c => {
      if (c.id === selectedContract.id) {
        return {
          ...c,
          signedByEnterprise: true,
          status: (c.signedByVendor ? 'ACTIVE' : 'PENDING_SIGNATURE') as Contract['status'],
          cryptoSignatureHash: cryptoHash
        };
      }
      return c;
    });

    setContracts(updated);
    setSelectedContract(prev => prev ? { ...prev, signedByEnterprise: true, status: (prev.signedByVendor ? 'ACTIVE' : 'PENDING_SIGNATURE'), cryptoSignatureHash: cryptoHash } : null);
    setShowSignModal(false);
    setDigitalPin('');
    logActivity('SIGN_CONTRACT', 'SYSTEM', `Cryptographically signed contract ${selectedContract.contractNumber} by ${currentUser.name}`);
    addToast('Digital Signature Sealed', `RSA-2048 hash generated for ${selectedContract.contractNumber}`, 'success');
    
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleRunAiRedline = () => {
    if (!selectedContract) return;
    sound.playClick();
    setAiAnalyzing(true);
    setTimeout(() => {
      setAiAnalyzing(false);
      sound.playSuccess();
      const updatedClauses = [
        ...selectedContract.keyClauses,
        { title: 'Section 14: Automated Legal Redline', content: 'Standard Enterprise Clause: Mandatory 30-day cure period for SLA breach added to prevent unilateral termination claims.', riskFlag: 'Clause Protection Active' }
      ];
      setContracts(prev => prev.map(c => c.id === selectedContract.id ? { ...c, keyClauses: updatedClauses, aiRiskScore: Math.max(10, c.aiRiskScore - 15) } : c));
      setSelectedContract(prev => prev ? { ...prev, keyClauses: updatedClauses, aiRiskScore: Math.max(10, prev.aiRiskScore - 15) } : null);
      logActivity('CONTRACT_REDLINE', 'PROCUREMENT', `Executed Clause Risk Audit on ${selectedContract.contractNumber}`);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }, 1000);
  };

  const handleClaimPenalty = (metricId: string) => {
    sound.playSuccess();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 }
    });
    claimSLAPenalty(metricId);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono rounded font-bold uppercase tracking-wider">
              CLM Suite
            </span>
            <span className="text-xs text-slate-400">RSA-2048 Digital Sign & SLA Breach Enforcement Engine</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">Enterprise Contract Lifecycle & SLA Governance</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Draft, redline, risk-score, and cryptographically execute MSAs, NDAs, and SOWs with automated liquidated damages clawback.
          </p>
        </div>

        <button
          onClick={() => { sound.playClick(); setShowNewContractModal(true); }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow border border-indigo-400/30 flex items-center gap-2 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Draft New Contract
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => { sound.playClick(); setActiveTab('CONTRACTS'); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'CONTRACTS' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Contracts Repository ({contracts.length})</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('SLA_TRACKER'); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'SLA_TRACKER' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>SLA Breach & Penalty Radar</span>
          {totalPenaltiesRecoverable > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold">
              {formatCurrency(totalPenaltiesRecoverable)}
            </span>
          )}
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('RENEWAL_RADAR'); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'RENEWAL_RADAR' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Renewal & Expiration Horizon</span>
        </button>
      </div>

      {/* Tab 1: Contracts Repository */}
      {activeTab === 'CONTRACTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Repository Filter & List (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
              {['ALL', 'ACTIVE', 'UNDER_AI_REVIEW', 'PENDING_SIGNATURE'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                    filterStatus === st 
                      ? 'bg-indigo-600 text-white shadow' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Contract Cards */}
            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
              {filteredContracts.map(c => {
                const isSelected = selectedContract?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => { sound.playClick(); setSelectedContract(c); }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                          {c.contractNumber} • {c.type}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                          {c.title}
                        </h4>
                      </div>

                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase shrink-0 ${
                        c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                        c.status === 'UNDER_AI_REVIEW' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                        'bg-indigo-100 text-indigo-700'
                      }`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Vendor: <strong className="text-slate-800">{c.vendorName}</strong></span>
                      <span>Value: <strong className="text-indigo-600 font-mono">{c.value > 0 ? formatCurrency(c.value) : 'N/A (NDA)'}</strong></span>
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Valid: {c.startDate} to {c.endDate}
                      </span>
                      <span className={`font-bold font-mono ${c.aiRiskScore > 50 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        Risk Score: {c.aiRiskScore}/100
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Selected Contract Detailed Legal Reader (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-lg min-h-[600px]">
            
            {selectedContract ? (
              <div className="space-y-6">
                
                {/* Reader Header */}
                <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600">
                        {selectedContract.contractNumber}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                        {selectedContract.type} Standard Template
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                      {selectedContract.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Counterparty Vendor: <strong className="text-slate-800">{selectedContract.vendorName}</strong>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleRunAiRedline}
                      disabled={aiAnalyzing}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-indigo-200 transition-colors"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${aiAnalyzing ? 'animate-spin' : ''}`} />
                      {aiAnalyzing ? 'Analyzing Clauses...' : 'Clause Redline'}
                    </button>

                    <button
                      onClick={() => { sound.playClick(); setShowSignModal(true); }}
                      disabled={selectedContract.signedByEnterprise}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition-colors"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      {selectedContract.signedByEnterprise ? 'Enterprise Signed' : 'Sign Cryptographically'}
                    </button>
                  </div>
                </div>

                {/* Signature Status & Hash Card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Signatory Parties</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        {selectedContract.signedByVendor ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
                        Vendor Representative Signature
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        {selectedContract.signedByEnterprise ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
                        Enterprise Procurement Officer ({currentUser.name})
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Cryptographic Proof Seal</span>
                    {selectedContract.cryptoSignatureHash ? (
                      <div className="p-2 bg-indigo-950 text-indigo-300 rounded font-mono text-[10px] break-all border border-indigo-800">
                        SHA256: {selectedContract.cryptoSignatureHash}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Awaiting final enterprise signature seal...</span>
                    )}
                  </div>
                </div>

                {/* Key Clauses Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" /> Active Contract Clauses & Risk Flags
                  </h4>

                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {selectedContract.keyClauses.map((clause, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{clause.title}</span>
                          {clause.riskFlag && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              clause.riskFlag.includes('High Risk') ? 'bg-rose-100 text-rose-700' :
                              clause.riskFlag.includes('AI') || clause.riskFlag.includes('Protection') ? 'bg-indigo-100 text-indigo-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>
                              {clause.riskFlag}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {clause.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                <FileText className="w-12 h-12 mb-2 text-slate-300" />
                <span>Select a contract from the repository list to inspect legal terms.</span>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Tab 2: SLA Breach & Penalty Radar */}
      {activeTab === 'SLA_TRACKER' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-amber-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Automated SLA Breach Enforcement
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">Live Supplier SLA Milestones & Liquidated Damages</h3>
              <p className="text-xs text-slate-300">Monitors shipment lead times, parts PPM defect rates, and triggers contract rebate credits directly against pending invoices.</p>
            </div>
            <div className="text-left sm:text-right bg-slate-900/80 px-4 py-2 rounded-xl border border-amber-800/40">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Unclaimed SLA Rebates</span>
              <span className="text-xl font-black text-amber-400 font-mono">{formatCurrency(totalPenaltiesRecoverable)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slaMetrics.map(metric => {
              const contract = contracts.find(c => c.id === metric.contractId);
              const isBreached = metric.status === 'BREACHED';
              const isWarning = metric.status === 'WARNING';

              return (
                <div 
                  key={metric.id}
                  className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-4 ${
                    isBreached ? 'border-rose-300 ring-2 ring-rose-500/20' :
                    isWarning ? 'border-amber-300' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-400">{contract?.contractNumber || 'Contract'}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isBreached ? 'bg-rose-100 text-rose-700' :
                          isWarning ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {metric.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-1">{metric.metricName}</h4>
                      <p className="text-xs text-slate-500">{contract?.vendorName}</p>
                    </div>

                    {metric.penaltyAmount > 0 && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Rebate Penalty</span>
                        <span className="font-mono font-black text-rose-600 text-sm">{formatCurrency(metric.penaltyAmount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Contracted Target</span>
                      <span className="font-bold text-slate-800">{metric.targetValue}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Actual Measured</span>
                      <span className={`font-bold ${isBreached ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {metric.actualValue}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400 font-mono">Last audited: {metric.lastAudited}</span>
                    {metric.penaltyAmount > 0 ? (
                      <button
                        onClick={() => handleClaimPenalty(metric.id)}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow flex items-center gap-1.5 transition-all"
                      >
                        <Zap className="w-3.5 h-3.5" /> Claim {formatCurrency(metric.penaltyAmount)} Credit Memo
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Fully Compliant
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Renewal Radar */}
      {activeTab === 'RENEWAL_RADAR' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Contract Expiration & Extension Horizon</h3>
              <p className="text-xs text-slate-500">Track contracts approaching 30, 60, and 90-day renewal windows to negotiate rate locks before price escalation triggers.</p>
            </div>

            <div className="space-y-3">
              {contracts.map(c => {
                const end = new Date(c.endDate).getTime();
                const now = new Date('2026-08-01').getTime();
                const diffDays = Math.round((end - now) / (1000 * 60 * 60 * 24));
                const isUrgent = diffDays <= 60;

                return (
                  <div key={c.id} className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-600">{c.contractNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          diffDays <= 45 ? 'bg-rose-100 text-rose-700' :
                          diffDays <= 90 ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {diffDays > 0 ? `${diffDays} Days Remaining` : 'Expired'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                      <p className="text-xs text-slate-500">Supplier: {c.vendorName} • Contract Value: {formatCurrency(c.value)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          sound.playSuccess();
                          addToast('Renewal Initiated', `Negotiation notice issued to ${c.vendorName} for ${c.contractNumber}`, 'success');
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Initiate Extension Negotiation
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Digital Signature Confirmation Modal */}
      {showSignModal && selectedContract && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <PenTool className="w-4 h-4 text-emerald-600" /> Execute RSA Digital Signature
              </h3>
              <button onClick={() => setShowSignModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 font-mono text-[10px]">Contract Identifier</span>
                <p className="font-bold text-slate-800">{selectedContract.contractNumber} - {selectedContract.title}</p>
                <p className="text-slate-500 font-mono text-[11px]">Value: {formatCurrency(selectedContract.value)}</p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Enter Executive 4-Digit Security PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={digitalPin}
                  onChange={(e) => setDigitalPin(e.target.value)}
                  placeholder="••••"
                  className="w-full text-center tracking-widest text-lg p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">PIN for authorized officer: {currentUser.name}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowSignModal(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteSign}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow"
              >
                Affix Legal Hash Stamp ↵
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Contract Draft Modal */}
      {showNewContractModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" /> Draft New Commercial Contract
              </h3>
              <button onClick={() => setShowNewContractModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contract Title</label>
                <input
                  type="text"
                  value={newContractForm.title}
                  onChange={(e) => setNewContractForm({ ...newContractForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vendor Counterparty</label>
                  <select
                    value={newContractForm.vendorId}
                    onChange={(e) => setNewContractForm({ ...newContractForm, vendorId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                  >
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Agreement Type</label>
                  <select
                    value={newContractForm.type}
                    onChange={(e) => setNewContractForm({ ...newContractForm, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                  >
                    <option value="MSA">MSA (Master Services)</option>
                    <option value="SLA">SLA (Service Level)</option>
                    <option value="SOW">SOW (Statement of Work)</option>
                    <option value="NDA">NDA (Non-Disclosure)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Estimated Value ($)</label>
                <input
                  type="number"
                  value={newContractForm.value}
                  onChange={(e) => setNewContractForm({ ...newContractForm, value: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newContractForm.startDate}
                    onChange={(e) => setNewContractForm({ ...newContractForm, startDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newContractForm.endDate}
                    onChange={(e) => setNewContractForm({ ...newContractForm, endDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewContractModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow"
                >
                  Generate Contract & Queue Review ↵
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

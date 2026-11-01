import React, { useState } from 'react';
import { 
  Cpu, Zap, Play, Plus, ToggleLeft, ToggleRight, CheckCircle, 
  AlertTriangle, ArrowRight, RefreshCw, Shield, Layers, FileCode,
  Sparkles, CheckCircle2, Sliders, GitBranch, ArrowDown, ShieldCheck,
  Flame, Check, Clock, UserCheck, XCircle, ArrowUpRight, Filter,
  FileText, History, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProcurement } from '../context/ProcurementContext';
import { sound } from '../utils/soundUtils';
import { formatCurrency } from '../utils/exportUtils';
import { ApprovalRequest, ApprovalTier } from '../types';

interface WorkflowRule {
  id: string;
  name: string;
  category: 'APPROVAL' | 'REORDER' | 'RISK_FREEZE' | 'AUDIT_FLAG';
  triggerCondition: string;
  actionPipeline: string;
  active: boolean;
  timesTriggered: number;
  lastExecuted: string;
}

const initialRules: WorkflowRule[] = [
  {
    id: 'rule-101',
    name: 'High-Value PO Secondary Executive Sign-Off',
    category: 'APPROVAL',
    triggerCondition: 'Purchase Order Total > $50,000 AND Vendor Risk Score > 30%',
    actionPipeline: 'Require CFO + Legal Approval & Run Anti-Fraud Ledger Validation',
    active: true,
    timesTriggered: 14,
    lastExecuted: '2026-08-11 14:22'
  },
  {
    id: 'rule-102',
    name: 'Automated Safety Stock Godown Replenishment',
    category: 'REORDER',
    triggerCondition: 'Godown Stock Level < Minimum Safety Threshold (15%)',
    actionPipeline: 'Auto-Draft Purchase Requisition & Issue RFQ to Top-3 Rated Vendors',
    active: true,
    timesTriggered: 28,
    lastExecuted: '2026-08-12 04:10'
  },
  {
    id: 'rule-103',
    name: 'High Risk Supplier PO Freeze & Audit Alert',
    category: 'RISK_FREEZE',
    triggerCondition: 'Vendor Risk Rating >= 75% OR GST Compliance Verification Failed',
    actionPipeline: 'Freeze PO Generation, Flag Invoices for Manual Audit & Notify Risk Officer',
    active: true,
    timesTriggered: 3,
    lastExecuted: '2026-08-09 11:05'
  },
  {
    id: 'rule-104',
    name: 'Invoice 3-Way Match Price Variance Quarantine',
    category: 'AUDIT_FLAG',
    triggerCondition: 'Invoice Price Variance vs Approved PO > 5.0%',
    actionPipeline: 'Quarantine Invoice Payment, Trigger Audit Log & Request Vendor Corrected Bill',
    active: false,
    timesTriggered: 9,
    lastExecuted: '2026-08-05 09:40'
  }
];

export const WorkflowRuleEngineView: React.FC = () => {
  const { 
    purchaseOrders, products, vendors, invoices, logActivity,
    approvalRequests, approveRequest, rejectRequest, escalateRequest,
    currentUser, addToast
  } = useProcurement();

  const [rules, setRules] = useState<WorkflowRule[]>(initialRules);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'APPROVAL_QUEUE' | 'RULES_LIST' | 'VISUAL_BUILDER' | 'SANDBOX_SIMULATOR'>('APPROVAL_QUEUE');

  // Approval Queue State & Filters
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [selectedReqForHistory, setSelectedReqForHistory] = useState<ApprovalRequest | null>(null);

  // Escalate / Reject Reason Modal State
  const [activeModalAction, setActiveModalAction] = useState<{
    type: 'REJECT' | 'ESCALATE';
    requestId: string;
    requestRef: string;
  } | null>(null);
  const [actionReason, setActionReason] = useState<string>('');

  // Interactive Sandbox Simulator State
  const [sandboxPoAmount, setSandboxPoAmount] = useState(65000);
  const [sandboxVendorRisk, setSandboxVendorRisk] = useState(42);
  const [sandboxStockLevel, setSandboxStockLevel] = useState(12);

  // New Rule Form
  const [newRule, setNewRule] = useState({
    name: 'Vendor SLA Breach Penalty Trigger',
    category: 'RISK_FREEZE' as WorkflowRule['category'],
    triggerCondition: 'Vendor On-Time Delivery Rate < 85%',
    actionPipeline: 'Apply 2.5% SLA Penalty Rebate to Pending Invoice & Downgrade Rating'
  });

  const toggleRule = (id: string) => {
    sound.playClick();
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    logActivity('TOGGLE_RULE', 'SYSTEM', `Updated workflow rule status for rule ID: ${id}`);
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    const createdRule: WorkflowRule = {
      id: `rule-${Date.now()}`,
      name: newRule.name,
      category: newRule.category,
      triggerCondition: newRule.triggerCondition,
      actionPipeline: newRule.actionPipeline,
      active: true,
      timesTriggered: 0,
      lastExecuted: 'Never'
    };
    setRules([createdRule, ...rules]);
    setShowAddModal(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    logActivity('CREATE_RULE', 'SYSTEM', `Created new automated rule: ${createdRule.name}`);
  };

  const handleApprove = (req: ApprovalRequest) => {
    sound.playSuccess();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 }
    });
    approveRequest(req.id, `Executive sign-off recorded by ${currentUser.name} (${currentUser.role})`);
  };

  const handleModalActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalAction) return;

    if (activeModalAction.type === 'REJECT') {
      rejectRequest(activeModalAction.requestId, actionReason || 'Does not comply with expenditure guidelines.');
    } else {
      escalateRequest(activeModalAction.requestId, actionReason || 'Escalated for senior director authorization.');
    }
    setActiveModalAction(null);
    setActionReason('');
  };

  // Filtered Approvals
  const filteredApprovals = approvalRequests.filter(req => {
    const matchesTier = tierFilter === 'ALL' || req.tierRequired === tierFilter;
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    return matchesTier && matchesStatus;
  });

  // Sandbox trigger evaluations
  const isRule101Triggered = sandboxPoAmount > 50000 && sandboxVendorRisk > 30;
  const isRule102Triggered = sandboxStockLevel < 15;
  const isRule103Triggered = sandboxVendorRisk >= 75;

  const totalPendingAmount = approvalRequests
    .filter(r => r.status === 'PENDING')
    .reduce((acc, r) => acc + r.amount, 0);

  const urgentApprovalsCount = approvalRequests
    .filter(r => r.status === 'PENDING' && r.slaHoursRemaining < 12)
    .length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-indigo-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold mb-3 backdrop-blur-md">
              <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>SOX 404 & Delegation of Authority (DoA) Engine Active</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Approval Workflows & Autonomous BPM Engine
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-3xl leading-relaxed">
              Multi-tier approval thresholds, SLA escalation timers, cryptographic ledger sign-offs, and dynamic BPM exception triggers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { sound.playClick(); setActiveTab('SANDBOX_SIMULATOR'); }}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 shadow flex items-center gap-2 transition-all hover:scale-105"
            >
              <Sliders className="w-4 h-4 text-indigo-400" /> Interactive Rule Sandbox
            </button>
            <button
              onClick={() => { sound.playClick(); setShowAddModal(true); }}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" /> Create Custom Rule
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => { sound.playClick(); setActiveTab('APPROVAL_QUEUE'); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'APPROVAL_QUEUE' 
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Approval Action Queue ({approvalRequests.filter(r => r.status === 'PENDING').length})</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('RULES_LIST'); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'RULES_LIST' 
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Active BPM Rules ({rules.length})</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('VISUAL_BUILDER'); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'VISUAL_BUILDER' 
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Approval Flowchart DAG</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('SANDBOX_SIMULATOR'); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'SANDBOX_SIMULATOR' 
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Simulator Sandbox</span>
        </button>
      </div>

      {/* Tab 1: Live Approval Queue & DoA Authority Matrix */}
      {activeTab === 'APPROVAL_QUEUE' && (
        <div className="space-y-6">

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block">Pending Authorization Spend</span>
              <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{formatCurrency(totalPendingAmount)}</div>
              <span className="text-[11px] text-indigo-600 font-semibold">{approvalRequests.filter(r => r.status === 'PENDING').length} items awaiting sign-off</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block">SLA Critical Items (&lt; 12 Hours)</span>
              <div className={`text-2xl font-black mt-1 font-mono ${urgentApprovalsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {urgentApprovalsCount} Urgent
              </div>
              <span className="text-[11px] text-slate-500">Auto-escalation to next tier if SLA breaches</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block">Current Active Signer</span>
              <div className="text-base font-extrabold text-slate-900 mt-1 truncate">{currentUser.name}</div>
              <span className="text-[11px] text-slate-500 font-mono">{currentUser.role} ({currentUser.department || 'HQ'})</span>
            </div>
          </div>

          {/* Delegation of Authority (DoA) Threshold Cards */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Delegation of Authority (DoA) Spending Matrix
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">SOX Section 404 Compliant</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Tier 1 • Manager</span>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5">$0 - $10,000</div>
                <div className="text-[11px] text-slate-500 mt-1">SLA Limit: 24 Business Hours</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase">Tier 2 • Director</span>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5">$10,001 - $50,000</div>
                <div className="text-[11px] text-slate-500 mt-1">SLA Limit: 48 Business Hours</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-mono font-bold text-purple-600 uppercase">Tier 3 • VP Operations</span>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5">$50,001 - $250,000</div>
                <div className="text-[11px] text-slate-500 mt-1">SLA Limit: 72 Business Hours</div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-mono font-bold text-rose-600 uppercase">Tier 4 • CFO & Board</span>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5">&gt; $250,000</div>
                <div className="text-[11px] text-slate-500 mt-1">SLA Limit: 96 Business Hours</div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Filter By Status:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {(['PENDING', 'APPROVED', 'ESCALATED', 'ALL'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                      statusFilter === st ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'ALL' ? 'All Records' : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Tier:</span>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Tiers (1 - 4)</option>
                <option value="TIER_1_MANAGER">Tier 1: Manager</option>
                <option value="TIER_2_DIRECTOR">Tier 2: Director</option>
                <option value="TIER_3_VP">Tier 3: VP Operations</option>
                <option value="TIER_4_CFO">Tier 4: CFO & Board</option>
              </select>
            </div>
          </div>

          {/* Request Cards / Queue */}
          <div className="space-y-4">
            {filteredApprovals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                No approval requests matching current filter.
              </div>
            ) : (
              filteredApprovals.map(req => {
                const isUrgent = req.slaHoursRemaining < 12 && req.status === 'PENDING';
                const isApproved = req.status === 'APPROVED';
                const isEscalated = req.status === 'ESCALATED';

                return (
                  <div
                    key={req.id}
                    className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-sm transition-all relative space-y-4 ${
                      isUrgent 
                        ? 'border-rose-300 ring-2 ring-rose-500/20' 
                        : isApproved 
                          ? 'border-emerald-200 bg-emerald-50/20' 
                          : 'border-slate-200'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {req.referenceNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                            req.tierRequired === 'TIER_4_CFO' ? 'bg-rose-100 text-rose-700' :
                            req.tierRequired === 'TIER_3_VP' ? 'bg-purple-100 text-purple-700' :
                            req.tierRequired === 'TIER_2_DIRECTOR' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {req.tierRequired.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                            Type: {req.entityType.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h4 className="text-base font-extrabold text-slate-900">{req.title}</h4>
                      </div>

                      {/* Spend Badge */}
                      <div className="text-left sm:text-right">
                        <div className="font-mono text-xl font-black text-slate-900">
                          {formatCurrency(req.amount)}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Dept: <strong>{req.department}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Justification & SLA bar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                      <div className="md:col-span-2 space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                          Business Justification & Impact:
                        </span>
                        <p className="text-slate-700 font-medium leading-relaxed">{req.justification}</p>
                        <div className="text-[11px] text-slate-500 pt-1">
                          Submitted by <strong>{req.requesterName}</strong> on {req.submittedDate}
                        </div>
                      </div>

                      {/* SLA Timer */}
                      <div className="space-y-1 md:border-l md:border-slate-200 md:pl-4 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> SLA Timer
                          </span>
                          <span className={`font-mono font-bold text-xs ${
                            isUrgent ? 'text-rose-600' : 'text-emerald-600'
                          }`}>
                            {req.status === 'PENDING' ? `${req.slaHoursRemaining}h remaining` : req.status}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-2 rounded-full ${
                              isUrgent ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, (req.slaHoursRemaining / 72) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Risk Rating: {req.riskScore}%
                        </span>
                      </div>
                    </div>

                    {/* Footer Actions & Trail */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedReqForHistory(req)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>View Audit History ({req.approvalHistory.length} Sign-Offs)</span>
                      </button>

                      {req.status === 'PENDING' ? (
                        <div className="flex items-center gap-2 ml-auto">
                          <button
                            onClick={() => {
                              setActiveModalAction({
                                type: 'REJECT',
                                requestId: req.id,
                                requestRef: req.referenceNumber
                              });
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-xl text-xs font-bold transition-colors"
                          >
                            Reject / Revise
                          </button>

                          <button
                            onClick={() => {
                              setActiveModalAction({
                                type: 'ESCALATE',
                                requestId: req.id,
                                requestRef: req.referenceNumber
                              });
                            }}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            Escalate Tier ↗
                          </button>

                          <button
                            onClick={() => handleApprove(req)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Approve & Sign Stamp
                          </button>
                        </div>
                      ) : (
                        <div className="ml-auto flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                          <span>{req.status} in Ledger</span>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* Tab 2: Active BPM Rules */}
      {activeTab === 'RULES_LIST' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map(rule => (
            <div
              key={rule.id}
              className={`p-6 rounded-2xl border transition-all space-y-4 ${
                rule.active 
                  ? 'bg-white border-slate-200 shadow-sm' 
                  : 'bg-slate-50 border-dashed border-slate-300 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    rule.category === 'APPROVAL' ? 'bg-indigo-100 text-indigo-700' :
                    rule.category === 'REORDER' ? 'bg-emerald-100 text-emerald-700' :
                    rule.category === 'RISK_FREEZE' ? 'bg-rose-100 text-rose-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {rule.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1.5">{rule.name}</h4>
                </div>

                <button
                  onClick={() => toggleRule(rule.id)}
                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                  title={rule.active ? 'Disable Rule' : 'Enable Rule'}
                >
                  {rule.active ? (
                    <ToggleRight className="w-7 h-7 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Conditions & Pipeline */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">WHEN Trigger:</span>
                  <p className="text-slate-700 font-mono text-[11px] mt-0.5">{rule.triggerCondition}</p>
                </div>

                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <span className="text-[10px] font-mono text-indigo-500 uppercase block font-bold">THEN Autonomous Action:</span>
                  <p className="text-indigo-900 font-mono text-[11px] mt-0.5">{rule.actionPipeline}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100">
                <span>Triggered: <strong>{rule.timesTriggered}x</strong></span>
                <span>Last fired: {rule.lastExecuted}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Visual Flowchart DAG */}
      {activeTab === 'VISUAL_BUILDER' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider block">
              Directed Acyclic Graph (DAG)
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Enterprise Multi-Tier Approval Flowchart
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Live visual representation of the purchase order approval ladder and exception routing logic.
            </p>
          </div>

          {/* Flowchart Diagram */}
          <div className="flex flex-col items-center space-y-4 py-4">
            
            {/* Step 1: PO Ingestion */}
            <div className="w-full max-w-md bg-slate-900 text-white p-4 rounded-2xl border border-slate-700 text-center shadow-lg">
              <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">EVENT INGESTION</span>
              <h4 className="text-sm font-black">Purchase Requisition or PO Created</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Captures line items, supplier rating & total spend</p>
            </div>

            <ArrowDown className="w-5 h-5 text-indigo-500 animate-bounce" />

            {/* Step 2: Decision Node */}
            <div className="w-full max-w-lg bg-amber-500/10 border-2 border-amber-500/50 p-5 rounded-3xl text-center shadow-md">
              <span className="text-[10px] font-mono text-amber-500 uppercase font-bold">RULE ENGINE EVALUATION</span>
              <h4 className="text-sm font-black text-slate-900 mt-1">Is PO Total &gt; $50,000 OR Supplier Risk &gt; 30%?</h4>
              
              <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-amber-500/30 text-xs">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                  <strong className="block text-[11px]">NO (Standard PO)</strong>
                  <span>Instant Department Head 1-Click Sign-Off</span>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800">
                  <strong className="block text-[11px]">YES (Executive Tier)</strong>
                  <span>CFO Sign-Off + Legal Review + Anti-Fraud Check</span>
                </div>
              </div>
            </div>

            <ArrowDown className="w-5 h-5 text-indigo-500" />

            {/* Step 3: Automated Dispatch */}
            <div className="w-full max-w-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-2xl shadow-xl text-center">
              <span className="text-[10px] font-mono text-indigo-200 uppercase font-bold">FINAL STATE DISPATCH</span>
              <h4 className="text-sm font-black">Cryptographic PDF PO Issued to Supplier</h4>
              <p className="text-[11px] text-indigo-100 mt-0.5">Automated notification to supplier via EDI / Webhook</p>
            </div>

          </div>
        </div>
      )}

      {/* Tab 4: Sandbox Simulator */}
      {activeTab === 'SANDBOX_SIMULATOR' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider block">
              Interactive Test Sandbox
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Real-Time Dynamic Rule Evaluation Engine
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Adjust simulated operational parameters to test how rules activate instantaneously.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Slider 1: PO Amount */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">Simulated PO Spend:</span>
                <span className="font-mono font-black text-indigo-600 text-sm">{formatCurrency(sandboxPoAmount)}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="250000"
                step="5000"
                value={sandboxPoAmount}
                onChange={(e) => { sound.playClick(); setSandboxPoAmount(Number(e.target.value)); }}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>$5,000</span>
                <span>$250,000</span>
              </div>
            </div>

            {/* Slider 2: Vendor Risk Score */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">Vendor Risk Index:</span>
                <span className={`font-mono font-black text-sm ${sandboxVendorRisk > 50 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {sandboxVendorRisk}% Risk
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sandboxVendorRisk}
                onChange={(e) => { sound.playClick(); setSandboxVendorRisk(Number(e.target.value)); }}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% Safe</span>
                <span>100% Extreme</span>
              </div>
            </div>

            {/* Slider 3: Warehouse Stock Level */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">Safety Buffer Level:</span>
                <span className={`font-mono font-black text-sm ${sandboxStockLevel < 15 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {sandboxStockLevel}% Capacity
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={sandboxStockLevel}
                onChange={(e) => { sound.playClick(); setSandboxStockLevel(Number(e.target.value)); }}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1% Empty</span>
                <span>100% Full</span>
              </div>
            </div>

          </div>

          {/* Live Dynamic Output Badges */}
          <div className="p-6 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Real-Time Evaluated Rule Triggers
              </span>
              <span className="text-xs font-mono text-slate-400">0.4ms engine latency</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                isRule101Triggered 
                  ? 'bg-rose-950/60 border-rose-700 text-rose-200' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}>
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isRule101Triggered ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`}></span>
                  Rule 101: Executive Tier CFO + Legal Sign-Off Triggered
                </span>
                <span className="font-mono font-bold">{isRule101Triggered ? 'ACTIVE' : 'IDLE'}</span>
              </div>

              <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                isRule102Triggered 
                  ? 'bg-amber-950/60 border-amber-700 text-amber-200' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}>
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isRule102Triggered ? 'bg-amber-500 animate-ping' : 'bg-slate-600'}`}></span>
                  Rule 102: Automated Safety Stock RFQ Auto-Draft Fired
                </span>
                <span className="font-mono font-bold">{isRule102Triggered ? 'ACTIVE' : 'IDLE'}</span>
              </div>

              <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                isRule103Triggered 
                  ? 'bg-rose-950/80 border-rose-500 text-rose-100 font-bold' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}>
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isRule103Triggered ? 'bg-rose-500 animate-pulse' : 'bg-slate-600'}`}></span>
                  Rule 103: Supplier Emergency Freeze & Fraud Isolation
                </span>
                <span className="font-mono font-bold">{isRule103Triggered ? 'TRIGGERED' : 'IDLE'}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* History Trail Modal */}
      {selectedReqForHistory && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-indigo-600 uppercase font-bold">SOX Audit Ledger</span>
                <h3 className="text-base font-extrabold text-slate-900">{selectedReqForHistory.referenceNumber} Approval Trail</h3>
              </div>
              <button
                onClick={() => setSelectedReqForHistory(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {selectedReqForHistory.approvalHistory.length === 0 ? (
                <p className="text-slate-500 italic py-2">No prior sign-offs recorded yet. Awaiting initial authorization.</p>
              ) : (
                selectedReqForHistory.approvalHistory.map((step, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{step.step}</span>
                      <span className="font-mono text-[10px] text-slate-400">{step.timestamp}</span>
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      Approver: <strong>{step.approver}</strong> • Action: <span className="font-bold text-emerald-600">{step.action}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 italic bg-white p-1.5 rounded border border-slate-100">
                      "{step.comments}"
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedReqForHistory(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
              >
                Close Audit Trail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Reason Modal (Reject / Escalate) */}
      {activeModalAction && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 animate-fadeIn">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              {activeModalAction.type === 'REJECT' ? (
                <>
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>Reject Request ({activeModalAction.requestRef})</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-5 h-5 text-amber-600" />
                  <span>Escalate to Senior Tier ({activeModalAction.requestRef})</span>
                </>
              )}
            </h3>

            <form onSubmit={handleModalActionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {activeModalAction.type === 'REJECT' ? 'Rejection Reason / Guidance' : 'Escalation Justification'}
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={activeModalAction.type === 'REJECT' ? 'Specify why this requisition/PO is rejected or what changes are required...' : 'Specify why this item requires executive director exception approval...'}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalAction(null)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2 text-white font-bold rounded-xl shadow ${
                    activeModalAction.type === 'REJECT' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-amber-600 hover:bg-amber-500'
                  }`}
                >
                  Confirm {activeModalAction.type === 'REJECT' ? 'Rejection' : 'Escalation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 animate-fadeIn">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" /> Create Autonomous BPM Rule
            </h3>

            <form onSubmit={handleAddRule} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rule Classification</label>
                <select
                  value={newRule.category}
                  onChange={(e) => setNewRule({ ...newRule, category: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                >
                  <option value="APPROVAL">Executive Multi-Stage Approval</option>
                  <option value="REORDER">Automated Godown Replenishment</option>
                  <option value="RISK_FREEZE">Supplier Choke & Risk Freeze</option>
                  <option value="AUDIT_FLAG">Invoice 3-Way Match Audit Quarantine</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Trigger Condition Logic (WHEN)</label>
                <input
                  type="text"
                  value={newRule.triggerCondition}
                  onChange={(e) => setNewRule({ ...newRule, triggerCondition: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Autonomous Pipeline (THEN)</label>
                <textarea
                  value={newRule.actionPipeline}
                  onChange={(e) => setNewRule({ ...newRule, actionPipeline: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-mono"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow"
                >
                  Deploy Rule to Engine ↵
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

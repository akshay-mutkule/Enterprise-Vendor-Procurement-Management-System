import React, { useState } from 'react';
import { 
  Cpu, Zap, Play, Plus, ToggleLeft, ToggleRight, CheckCircle, 
  AlertTriangle, ArrowRight, RefreshCw, Shield, Layers, FileCode,
  Sparkles, CheckCircle2, Sliders, GitBranch, ArrowDown, ShieldCheck,
  Flame, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProcurement } from '../context/ProcurementContext';
import { sound } from '../utils/soundUtils';
import { formatCurrency } from '../utils/exportUtils';

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
    actionPipeline: 'Require CFO + Legal Approval & Run Gemini Anti-Fraud Check',
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
  const { purchaseOrders, products, vendors, invoices, logActivity } = useProcurement();
  const [rules, setRules] = useState<WorkflowRule[]>(initialRules);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'RULES_LIST' | 'VISUAL_BUILDER' | 'SANDBOX_SIMULATOR'>('RULES_LIST');

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

  // Evaluate Sandbox triggers
  const isRule101Triggered = sandboxPoAmount > 50000 && sandboxVendorRisk > 30;
  const isRule102Triggered = sandboxStockLevel < 15;
  const isRule103Triggered = sandboxVendorRisk >= 75;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-indigo-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold mb-3 backdrop-blur-md">
              <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Event-Driven DAG Automation • Autonomous Guardrails Active</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Autonomous Workflow & BPM Rule Engine
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-3xl leading-relaxed">
              Define multi-tier conditional triggers, SOX audit approval ladders, auto-draft purchase requisitions, and real-time vendor risk quarantine pipelines.
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
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => { sound.playClick(); setActiveTab('RULES_LIST'); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'RULES_LIST' 
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Active BPM Rules ({rules.length})
        </button>
        <button
          onClick={() => { sound.playClick(); setActiveTab('VISUAL_BUILDER'); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'VISUAL_BUILDER' 
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Visual Flowchart Approval DAG
        </button>
        <button
          onClick={() => { sound.playClick(); setActiveTab('SANDBOX_SIMULATOR'); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'SANDBOX_SIMULATOR' 
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Live Interactive Simulator Sandbox
        </button>
      </div>

      {activeTab === 'RULES_LIST' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map(rule => (
            <div
              key={rule.id}
              className={`p-6 rounded-2xl border transition-all space-y-4 ${
                rule.active 
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm' 
                  : 'bg-slate-50 dark:bg-slate-900/50 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    rule.category === 'APPROVAL' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400' :
                    rule.category === 'REORDER' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' :
                    rule.category === 'RISK_FREEZE' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400' :
                    'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                  }`}>
                    {rule.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{rule.name}</h4>
                </div>

                <button
                  onClick={() => toggleRule(rule.id)}
                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                  title={rule.active ? 'Disable Rule' : 'Enable Rule'}
                >
                  {rule.active ? (
                    <ToggleRight className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Conditions & Pipeline */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">WHEN Trigger:</span>
                  <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] mt-0.5">{rule.triggerCondition}</p>
                </div>

                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                  <span className="text-[10px] font-mono text-indigo-500 uppercase block font-bold">THEN Autonomous Action:</span>
                  <p className="text-indigo-900 dark:text-indigo-200 font-mono text-[11px] mt-0.5">{rule.actionPipeline}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Triggered: <strong>{rule.timesTriggered}x</strong></span>
                <span>Last fired: {rule.lastExecuted}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'VISUAL_BUILDER' && (
        /* Visual Flowchart Approval DAG */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
              Directed Acyclic Graph (DAG)
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
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
              <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">Is PO Total &gt; $50,000 OR Supplier Risk &gt; 30%?</h4>
              
              <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-amber-500/30 text-xs">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                  <strong className="block text-[11px]">NO (Standard PO)</strong>
                  <span>Instant Department Head 1-Click Sign-Off</span>
                </div>
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300">
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

      {activeTab === 'SANDBOX_SIMULATOR' && (
        /* Live Interactive Simulator Sandbox */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
              Interactive Test Sandbox
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              Real-Time Dynamic Rule Evaluation Engine
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Adjust simulated operational parameters to test how rules activate instantaneously.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Slider 1: PO Amount */}
            <div className="bg-slate-50 dark:bg-slate-800/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Simulated PO Spend:</span>
                <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">{formatCurrency(sandboxPoAmount)}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="250000"
                step="5000"
                value={sandboxPoAmount}
                onChange={(e) => { sound.playClick(); setSandboxPoAmount(Number(e.target.value)); }}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>$5,000</span>
                <span>$250,000</span>
              </div>
            </div>

            {/* Slider 2: Vendor Risk Score */}
            <div className="bg-slate-50 dark:bg-slate-800/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Vendor Risk Index:</span>
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
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% Safe</span>
                <span>100% Extreme</span>
              </div>
            </div>

            {/* Slider 3: Warehouse Stock Level */}
            <div className="bg-slate-50 dark:bg-slate-800/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Safety Buffer Level:</span>
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
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
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

      {/* Add Custom Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-fadeIn">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" /> Create Autonomous BPM Rule
            </h3>

            <form onSubmit={handleAddRule} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Rule Classification</label>
                <select
                  value={newRule.category}
                  onChange={(e) => setNewRule({ ...newRule, category: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value="APPROVAL">Executive Multi-Stage Approval</option>
                  <option value="REORDER">Automated Godown Replenishment</option>
                  <option value="RISK_FREEZE">Supplier Choke & Risk Freeze</option>
                  <option value="AUDIT_FLAG">Invoice 3-Way Match Audit Quarantine</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Trigger Condition Logic (WHEN)</label>
                <input
                  type="text"
                  value={newRule.triggerCondition}
                  onChange={(e) => setNewRule({ ...newRule, triggerCondition: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Autonomous Pipeline (THEN)</label>
                <textarea
                  value={newRule.actionPipeline}
                  onChange={(e) => setNewRule({ ...newRule, actionPipeline: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
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

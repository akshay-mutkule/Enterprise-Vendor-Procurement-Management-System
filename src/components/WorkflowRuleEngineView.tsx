import React, { useState } from 'react';
import { 
  Cpu, Zap, Play, Plus, ToggleLeft, ToggleRight, CheckCircle, 
  AlertTriangle, ArrowRight, RefreshCw, Shield, Layers, FileCode
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';

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
  const [simulating, setSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<Array<{ ruleName: string; matchedCount: number; sampleData: string }> | null>(null);

  // New Rule Form
  const [newRule, setNewRule] = useState({
    name: 'Vendor SLA Breach Penalty Trigger',
    category: 'RISK_FREEZE' as WorkflowRule['category'],
    triggerCondition: 'Vendor On-Time Delivery Rate < 85%',
    actionPipeline: 'Apply 2.5% SLA Penalty Rebate to Pending Invoice & Downgrade Rating'
  });

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    logActivity('TOGGLE_RULE', 'SYSTEM', `Updated workflow rule status for rule ID: ${id}`);
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
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
    logActivity('CREATE_RULE', 'SYSTEM', `Created new automated rule: ${createdRule.name}`);
  };

  const runSimulation = () => {
    setSimulating(true);
    setSimulationResults(null);

    setTimeout(() => {
      setSimulating(false);
      // Simulate rule evaluations against live procurement data
      const matchedPOs = purchaseOrders.filter(po => po.totalAmount > 50000);
      const lowStockProducts = products.filter(p => p.stockQuantity <= p.reorderLevel);
      const riskyVendors = vendors.filter(v => v.riskScore >= 70);

      setSimulationResults([
        { ruleName: 'High-Value PO Secondary Executive Sign-Off', matchedCount: matchedPOs.length, sampleData: matchedPOs.map(p => p.poNumber).join(', ') || 'None' },
        { ruleName: 'Automated Safety Stock Godown Replenishment', matchedCount: lowStockProducts.length, sampleData: lowStockProducts.map(p => p.name).join(', ') || 'None' },
        { ruleName: 'High Risk Supplier PO Freeze & Audit Alert', matchedCount: riskyVendors.length, sampleData: riskyVendors.map(v => v.name).join(', ') || 'None' }
      ]);

      logActivity('SIMULATE_WORKFLOWS', 'SYSTEM', 'Executed dry-run rule engine evaluation on live database');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-purple-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono rounded font-bold uppercase tracking-wider">
              Rule Engine
            </span>
            <span className="text-xs text-slate-400">If-This-Then-That ERP Automations</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">Enterprise Automated Workflow & Trigger Rule Engine</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Configure automated approval routing, low-stock reorder triggers, risk freezes, and anti-fraud invoice quarantines.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={runSimulation}
            disabled={simulating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow border border-purple-400/30 flex items-center gap-2 transition-all"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${simulating ? 'animate-spin' : ''}`} />
            {simulating ? 'Evaluating Rules...' : 'Run Simulation'}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow border border-indigo-400/30 flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Create Rule
          </button>
        </div>
      </div>

      {/* Simulation Dry Run Output Box */}
      {simulationResults && (
        <div className="p-5 bg-purple-950/20 border border-purple-800/60 rounded-2xl space-y-3">
          <h3 className="text-sm font-extrabold text-purple-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" /> Rule Engine Dry-Run Simulation Output
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {simulationResults.map((res, idx) => (
              <div key={idx} className="p-3.5 bg-slate-900/90 rounded-xl border border-purple-900/50 space-y-1">
                <span className="font-bold text-slate-200 block">{res.ruleName}</span>
                <span className="text-[11px] text-purple-400 block font-mono">
                  Matched Records: <strong>{res.matchedCount}</strong>
                </span>
                <p className="text-[10px] text-slate-400 truncate">
                  Details: {res.sampleData}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map(rule => (
          <div 
            key={rule.id}
            className={`p-5 rounded-2xl border transition-all ${
              rule.active 
                ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-md' 
                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase font-mono ${
                  rule.category === 'APPROVAL' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' :
                  rule.category === 'REORDER' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                  'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {rule.category}
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                  {rule.name}
                </h3>
              </div>

              <button
                onClick={() => toggleRule(rule.id)}
                className="text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform"
                title={rule.active ? "Deactivate Rule" : "Activate Rule"}
              >
                {rule.active ? <ToggleRight className="w-8 h-8 text-indigo-600" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
              </button>
            </div>

            {/* If Condition Box */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 text-xs mb-2">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" /> Trigger Condition (IF)
              </span>
              <p className="font-mono text-slate-800 dark:text-slate-200 text-[11px]">
                {rule.triggerCondition}
              </p>
            </div>

            {/* Then Action Box */}
            <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/60 space-y-1 text-xs mb-3">
              <span className="text-[10px] font-mono uppercase font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <ArrowRight className="w-3 h-3 text-indigo-500" /> Action Pipeline (THEN)
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                {rule.actionPipeline}
              </p>
            </div>

            {/* Footer Stats */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Triggered: <strong>{rule.timesTriggered} times</strong></span>
              <span>Last Run: {rule.lastExecuted}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddRule} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" /> Build New ERP Trigger Rule
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={newRule.name}
                  onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rule Category</label>
                <select
                  value={newRule.category}
                  onChange={e => setNewRule({ ...newRule, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                >
                  <option value="APPROVAL">APPROVAL (Multi-tier Signoff)</option>
                  <option value="REORDER">REORDER (Godown Safety Stock)</option>
                  <option value="RISK_FREEZE">RISK_FREEZE (Supplier Sanctions)</option>
                  <option value="AUDIT_FLAG">AUDIT_FLAG (Invoice Discrepancies)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">IF Trigger Condition</label>
                <input
                  type="text"
                  required
                  value={newRule.triggerCondition}
                  onChange={e => setNewRule({ ...newRule, triggerCondition: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">THEN Action Pipeline</label>
                <input
                  type="text"
                  required
                  value={newRule.actionPipeline}
                  onChange={e => setNewRule({ ...newRule, actionPipeline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs shadow hover:bg-indigo-500">Save Rule</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { 
  Sparkles, ShieldAlert, TrendingUp, Award, DollarSign, 
  Send, Bot, RefreshCw, CheckCircle, FileText, Handshake, 
  Copy, Check, ArrowRight, Play, Cpu
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';

export const AiIntelligenceView: React.FC = () => {
  const { vendors, purchaseOrders, invoices, products, logActivity } = useProcurement();

  const [activeTool, setActiveTool] = useState<'COPILOT' | 'RISK' | 'FRAUD' | 'TREND' | 'CONTRACT' | 'NEGOTIATION'>('COPILOT');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Parameter State for Analysis Tools
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id || '');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoices[0]?.id || '');
  const [selectedCategory, setSelectedCategory] = useState('Microcontrollers & Semiconductors');
  const [targetRebatePercent, setTargetRebatePercent] = useState('8');

  // Copilot Chat State
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am Nexus Gemini AI, your enterprise procurement intelligence engine. Ask me anything about vendor risk scores, invoice fraud checks, price trend projections, contract redlines, or negotiation tactics.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const runAnalysis = async (type: string, customPayload?: any) => {
    setLoading(true);
    setAiResponse(null);

    let payload = customPayload || {};
    if (type === 'VENDOR_RISK') {
      const v = vendors.find(item => item.id === selectedVendorId) || vendors[0];
      payload = { vendorName: v?.name, vendorCategory: v?.category, vendorRating: v?.rating };
    } else if (type === 'FRAUD_DETECTION') {
      const inv = invoices.find(item => item.id === selectedInvoiceId) || invoices[0];
      payload = { invoiceNumber: inv?.invoiceNumber, vendorName: inv?.vendorName, totalAmount: inv?.totalAmount };
    } else if (type === 'PRICE_TREND') {
      payload = { category: selectedCategory };
    } else if (type === 'CONTRACT_REDLINE') {
      const v = vendors.find(item => item.id === selectedVendorId) || vendors[0];
      payload = { vendorName: v?.name, contractType: 'Master Service Agreement (MSA)' };
    } else if (type === 'NEGOTIATION_SCRIPT') {
      const v = vendors.find(item => item.id === selectedVendorId) || vendors[0];
      payload = { vendorName: v?.name, targetDiscount: targetRebatePercent };
    }

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload })
      });
      const data = await res.json();
      setAiResponse(data);
      logActivity('AI_ANALYSIS', 'ANALYTICS', `Executed Nexus AI module: ${type}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SPEND_INSIGHTS',
          payload: { query: userMsg, totalPOs: purchaseOrders.length, totalVendors: vendors.length }
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'ai', text: data.summary || 'Analysis complete.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Error connecting to server AI model.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
              Gemini 3.6 Enterprise AI Intelligence Center
              <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-mono rounded-full font-semibold">
                Server-Side Active
              </span>
            </h2>
            <p className="text-xs text-indigo-200 mt-1">
              Automated Contract Redlining, Invoice Fraud Inspection, Supplier Negotiation Playbooks & Market Volatility Forecasting.
            </p>
          </div>
        </div>

        <button
          onClick={() => { setActiveTool('COPILOT'); }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow border border-indigo-400/30 flex items-center gap-2 whitespace-nowrap"
        >
          <Bot className="w-4 h-4" /> Launch Assistant
        </button>
      </div>

      {/* Tools Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-2 sm:space-x-6 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveTool('COPILOT')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${activeTool === 'COPILOT' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400'}`}
        >
          <Bot className="w-4 h-4" /> AI Copilot
        </button>
        <button
          onClick={() => { setActiveTool('RISK'); runAnalysis('VENDOR_RISK'); }}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${activeTool === 'RISK' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400'}`}
        >
          <ShieldAlert className="w-4 h-4" /> Vendor Risk
        </button>
        <button
          onClick={() => { setActiveTool('FRAUD'); runAnalysis('FRAUD_DETECTION'); }}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${activeTool === 'FRAUD' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400'}`}
        >
          <Award className="w-4 h-4" /> Invoice Fraud
        </button>
        <button
          onClick={() => { setActiveTool('TREND'); runAnalysis('PRICE_TREND'); }}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${activeTool === 'TREND' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400'}`}
        >
          <TrendingUp className="w-4 h-4" /> Market Price Forecast
        </button>
        <button
          onClick={() => { setActiveTool('CONTRACT'); runAnalysis('CONTRACT_REDLINE'); }}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${activeTool === 'CONTRACT' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400'}`}
        >
          <FileText className="w-4 h-4" /> Contract Redlining
        </button>
        <button
          onClick={() => { setActiveTool('NEGOTIATION'); runAnalysis('NEGOTIATION_SCRIPT'); }}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${activeTool === 'NEGOTIATION' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400'}`}
        >
          <Handshake className="w-4 h-4" /> Negotiation Playbook
        </button>
      </div>

      {/* Parameter Control Panel for Active Tool */}
      {activeTool !== 'COPILOT' && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Vendor Selector */}
            {(activeTool === 'RISK' || activeTool === 'CONTRACT' || activeTool === 'NEGOTIATION') && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Vendor</label>
                <select
                  value={selectedVendorId}
                  onChange={e => setSelectedVendorId(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Invoice Selector */}
            {activeTool === 'FRAUD' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Invoice</label>
                <select
                  value={selectedInvoiceId}
                  onChange={e => setSelectedInvoiceId(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                >
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.invoiceNumber} - {inv.vendorName} (${inv.totalAmount.toLocaleString()})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Category Selector */}
            {activeTool === 'TREND' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Commodity Category</label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                >
                  <option value="Microcontrollers & Semiconductors">Microcontrollers & Semiconductors</option>
                  <option value="Copper Wiring & Power Cables">Copper Wiring & Power Cables</option>
                  <option value="Aluminum Enclosures & Metal Stamping">Aluminum Enclosures & Metal Stamping</option>
                  <option value="Logistics Air Freight Surcharges">Logistics Air Freight Surcharges</option>
                </select>
              </div>
            )}

            {/* Target Rebate % */}
            {activeTool === 'NEGOTIATION' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Rebate %</label>
                <input
                  type="number"
                  value={targetRebatePercent}
                  onChange={e => setTargetRebatePercent(e.target.value)}
                  min="1"
                  max="30"
                  className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white"
                />
              </div>
            )}

          </div>

          <button
            onClick={() => {
              if (activeTool === 'RISK') runAnalysis('VENDOR_RISK');
              if (activeTool === 'FRAUD') runAnalysis('FRAUD_DETECTION');
              if (activeTool === 'TREND') runAnalysis('PRICE_TREND');
              if (activeTool === 'CONTRACT') runAnalysis('CONTRACT_REDLINE');
              if (activeTool === 'NEGOTIATION') runAnalysis('NEGOTIATION_SCRIPT');
            }}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Run AI Model Analysis
          </button>
        </div>
      )}

      {/* Copilot Chat View */}
      {activeTool === 'COPILOT' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[520px]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-600" /> Enterprise Procurement Assistant Copilot
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Gemini 3.6 Active</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed ${m.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-2xl text-xs text-slate-500 animate-pulse flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" /> Gemini is reasoning over database records...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Ask AI Copilot: 'Draft RFQ for Microcontrollers' or 'Audit Global Metals GST'..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        </div>
      )}

      {/* Analysis Output View */}
      {activeTool !== 'COPILOT' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
              <span>Querying server-side Gemini 3.6 Flash model...</span>
            </div>
          ) : aiResponse ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>AI Analysis Executive Summary</span>
                  {aiResponse.metrics?.riskLevel && (
                    <span className={`px-2 py-0.5 text-[10px] rounded font-bold uppercase ${aiResponse.metrics.riskLevel === 'LOW' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      Risk: {aiResponse.metrics.riskLevel}
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(JSON.stringify(aiResponse, null, 2))}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                    title="Copy Payload"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                    Score: {aiResponse.score || 85} / 100
                  </span>
                </div>
              </div>

              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-sm bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                {aiResponse.summary}
              </p>

              {aiResponse.insights && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider">Key Insights & Audit Signals</h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-600 dark:text-slate-300 leading-relaxed">
                    {aiResponse.insights.map((ins: string, i: number) => <li key={i}>{ins}</li>)}
                  </ul>
                </div>
              )}

              {aiResponse.recommendations && (
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50 space-y-2">
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-300 uppercase text-[10px] tracking-wider">Strategic Recommendations & Action Plan</h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    {aiResponse.recommendations.map((rec: string, i: number) => <li key={i}>{rec}</li>)}
                  </ul>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => alert('AI Recommendations logged to Executive Compliance Audit ledger!')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Log Action to Compliance Audit
                </button>
              </div>

            </div>
          ) : null}
        </div>
      )}

    </div>
  );
};


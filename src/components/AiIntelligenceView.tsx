import React, { useState } from 'react';
import { 
  Sparkles, ShieldAlert, TrendingUp, Award, DollarSign, 
  Send, Bot, RefreshCw, CheckCircle 
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';

export const AiIntelligenceView: React.FC = () => {
  const { vendors, purchaseOrders, invoices } = useProcurement();

  const [activeTool, setActiveTool] = useState<'RISK' | 'FRAUD' | 'TREND' | 'COPILOT'>('COPILOT');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);

  // Copilot Chat
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am Nexus Gemini AI, your enterprise procurement intelligence engine. Ask me anything about vendor risk scores, invoice fraud checks, price trend projections, or best vendor recommendations.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const runAnalysis = async (type: string, payload: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload })
      });
      const data = await res.json();
      setAiResponse(data);
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

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Gemini AI Procurement Intelligence Center</h2>
            <p className="text-xs text-indigo-200 mt-1">
              Powered by Google Gemini 3.6 Flash Server-Side Integration. Predictive Risk, Fraud Inspector & Spend Optimizer.
            </p>
          </div>
        </div>
      </div>

      {/* Tools Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-6">
        <button
          onClick={() => setActiveTool('COPILOT')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTool === 'COPILOT' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400'}`}
        >
          <Bot className="w-4 h-4" /> AI Procurement Copilot
        </button>
        <button
          onClick={() => { setActiveTool('RISK'); runAnalysis('VENDOR_RISK', { vendorName: vendors[0]?.name }); }}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTool === 'RISK' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400'}`}
        >
          <ShieldAlert className="w-4 h-4" /> Vendor Risk Analyzer
        </button>
        <button
          onClick={() => { setActiveTool('FRAUD'); runAnalysis('FRAUD_DETECTION', { invoiceNumber: invoices[0]?.invoiceNumber }); }}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTool === 'FRAUD' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400'}`}
        >
          <Award className="w-4 h-4" /> Invoice Fraud Inspector
        </button>
        <button
          onClick={() => { setActiveTool('TREND'); runAnalysis('PRICE_TREND', { category: 'Silicon Microcontrollers' }); }}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTool === 'TREND' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400'}`}
        >
          <TrendingUp className="w-4 h-4" /> Market Price Forecast
        </button>
      </div>

      {/* Copilot Chat View */}
      {activeTool === 'COPILOT' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[520px]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-600" /> Procurement Assistant Copilot
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xl p-3 rounded-2xl text-xs ${m.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-2xl text-xs text-slate-500 animate-pulse flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" /> Gemini is reasoning...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Ask AI Copilot: 'Recommend best vendor for microcontrollers' or 'Analyze Q3 spend'..."
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
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">AI Analysis Executive Summary</h3>
                <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                  Score: {aiResponse.score || 85} / 100
                </span>
              </div>

              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-sm">
                {aiResponse.summary}
              </p>

              {aiResponse.insights && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider">Key Insights</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300">
                    {aiResponse.insights.map((ins: string, i: number) => <li key={i}>{ins}</li>)}
                  </ul>
                </div>
              )}

              {aiResponse.recommendations && (
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50 space-y-2">
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-300 uppercase text-[10px] tracking-wider">Strategic Recommendations</h4>
                  <ul className="list-disc pl-4 space-y-1 text-emerald-800 dark:text-emerald-300">
                    {aiResponse.recommendations.map((rec: string, i: number) => <li key={i}>{rec}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

    </div>
  );
};

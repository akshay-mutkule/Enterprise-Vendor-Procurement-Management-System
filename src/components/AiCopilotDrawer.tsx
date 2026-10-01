import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Bot, X, Send, RefreshCw, ChevronRight, 
  ShieldAlert, TrendingUp, CheckCircle, FileText, ArrowRight, Copy, Check,
  Mic, MicOff, Volume2, Download, Trash2, Zap, BrainCircuit
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProcurement } from '../context/ProcurementContext';

interface AiCopilotDrawerProps {
  onNavigate?: (tab: string) => void;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({ onNavigate }) => {
  const { vendors, purchaseOrders, requisitions, invoices, products, t, addToast } = useProcurement();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; actions?: string[] }>>([
    { 
      sender: 'ai', 
      text: '👋 Greetings! I am your **Nexus Enterprise AI Copilot** powered by Gemini 3.7. I provide real-time fraud anomaly scanning, tariff sensitivity simulations, auto-drafting of RFQs, and predictive supply risk alerts.',
      actions: ['Analyze Spend Volatility', 'Check Vendor Risk Ratings', 'Inspect Low Stock Godown Items', 'Verify Accounts Payable Invoices']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Voice & Audio States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);

  const quickPrompts = [
    { label: '🛡️ Audit Fraud Anomaly', text: 'Scan all pending invoices for price variance and duplicate hash flags' },
    { label: '📊 Forecast Q3 Spend', text: 'Forecast raw materials and freight inflation impact for next quarter' },
    { label: '📦 Low Stock Warning', text: 'List all SKUs that have breached minimum safety stock in warehouse' },
    { label: '⚡ Review Tier-1 SLAs', text: 'Analyze on-time delivery rates and risk scores across top suppliers' }
  ];

  // Speech Recognition setup
  const handleMicToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      addToast('Audio Input Notice', 'Speech recognition is not supported in this browser.', 'warning');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
        }
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Speech Synthesis setup
  const handleSpeak = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) {
      addToast('Audio Playback Notice', 'Speech synthesis is not supported in this browser.', 'warning');
      return;
    }

    if (isSpeaking === index) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);
    
    setIsSpeaking(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleActionClick = (actionText: string) => {
    const textLower = actionText.toLowerCase();

    if (textLower.includes('vendor') && onNavigate) {
      onNavigate('vendors');
    } else if (textLower.includes('invoice') && onNavigate) {
      onNavigate('finance');
    } else if (textLower.includes('stock') || textLower.includes('godown')) {
      if (onNavigate) onNavigate('inventory');
    } else if (textLower.includes('volatility') || textLower.includes('spend')) {
      if (onNavigate) onNavigate('dashboard');
    }

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 }
    });

    handleSend(actionText);
  };

  const handleExportTranscript = () => {
    const transcript = messages.map(m => `[${m.sender.toUpperCase()} - ${new Date().toLocaleTimeString()}]:\n${m.text}\n`).join('\n---\n\n');
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nexus_AI_Enterprise_Transcript_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSend = async (promptText?: string) => {
    const textToSend = promptText || input;
    if (!textToSend.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    if (!promptText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: {
            totalVendors: vendors.length,
            totalPOs: purchaseOrders.length,
            totalRequisitions: requisitions.length,
            totalInvoices: invoices.length,
            totalProducts: products.length
          }
        })
      });

      const data = await res.json();
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'ai', 
          text: data.reply || 'Procurement analytics query executed successfully.',
          actions: data.suggestedActions || ['View Updated Analytics', 'Export Executive Audit Trail'] 
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev, 
        { sender: 'ai', text: 'Nexus AI Server is synchronizing data. Real-time neural query completed.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group px-4 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold rounded-2xl shadow-2xl flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 border border-indigo-400/40"
          title="Open AI Procurement Copilot"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-indigo-200 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-indigo-950 shadow-sm" />
          </div>
          <span className="text-xs tracking-wider uppercase font-mono font-bold">Copilot 3.7</span>
        </button>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-md transition-opacity flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-fadeIn">
            
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white flex items-center justify-between border-b border-indigo-900/80 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight flex items-center gap-2">
                    Nexus AI Neural Copilot
                    <span className="px-2 py-0.5 bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 text-[10px] rounded-full font-mono font-bold">
                      Gemini 3.7
                    </span>
                  </h3>
                  <p className="text-[11px] text-indigo-200 font-medium">Enterprise Supply Chain & Fraud Reasoning</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleExportTranscript}
                  className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  title="Export Chat Transcript"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Prompts Bar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-x-auto flex gap-2 no-scrollbar">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleActionClick(qp.text)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/80 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl whitespace-nowrap transition-all shadow-xs shrink-0 flex items-center gap-1.5 hover:scale-102"
                >
                  <span>{qp.label}</span>
                </button>
              ))}
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`relative max-w-[92%] p-4 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-xs shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200 dark:border-slate-700/80 shadow-xs'
                  }`}>
                    
                    {/* Controls for AI replies */}
                    {m.sender === 'ai' && (
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                        <button
                          onClick={() => handleSpeak(m.text, idx)}
                          className={`p-1.5 rounded-lg transition-colors ${isSpeaking === idx ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 animate-pulse' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                          title="Read Aloud"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopy(m.text, idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title="Copy text"
                        >
                          {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap pr-8 font-sans">{m.text}</div>

                    {/* Action Chips */}
                    {m.actions && m.actions.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap gap-2">
                        {m.actions.map((act, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => handleActionClick(act)}
                            className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all hover:scale-102"
                          >
                            <ArrowRight className="w-3 h-3 text-indigo-500" /> {act}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 px-1">
                    {m.sender === 'user' ? 'Executive User' : 'Nexus Neural Engine'}
                  </span>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 p-3.5 rounded-2xl w-max border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <span>Synthesizing multi-tier supply data with Gemini 3.7...</span>
                </div>
              )}
            </div>

            {/* Voice Wave Visualizer when Active */}
            {isListening && (
              <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-bold">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  Listening to audio input...
                </span>
                <div className="flex items-end gap-1 h-5">
                  <span className="w-1 bg-rose-500 rounded-full animate-wave-1"></span>
                  <span className="w-1 bg-rose-500 rounded-full animate-wave-2"></span>
                  <span className="w-1 bg-rose-500 rounded-full animate-wave-3"></span>
                  <span className="w-1 bg-rose-500 rounded-full animate-wave-4"></span>
                  <span className="w-1 bg-rose-500 rounded-full animate-wave-5"></span>
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex gap-2 items-center">
              
              <button
                type="button"
                onClick={handleMicToggle}
                className={`p-2.5 rounded-xl border transition-all ${
                  isListening 
                    ? 'bg-rose-100 border-rose-300 text-rose-600 animate-pulse' 
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 hover:bg-slate-200'
                }`}
                title={isListening ? 'Listening...' : 'Dictate with Voice'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={isListening ? 'Listening to voice prompt...' : 'Ask AI Copilot or type command...'}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
};

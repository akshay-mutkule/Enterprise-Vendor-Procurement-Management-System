import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Bot, X, Send, RefreshCw, ChevronRight, 
  ShieldAlert, TrendingUp, CheckCircle, FileText, ArrowRight, Copy, Check,
  Mic, MicOff, Volume2, Download, Trash2
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';

interface AiCopilotDrawerProps {
  onNavigate?: (tab: string) => void;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({ onNavigate }) => {
  const { vendors, purchaseOrders, requisitions, invoices, products, t } = useProcurement();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; actions?: string[] }>>([
    { 
      sender: 'ai', 
      text: '👋 Hello! I am your **Nexus Enterprise AI Copilot**. I analyze real-time procurement data, detect fraud anomalies, forecast price trends, and draft contract terms.',
      actions: ['Analyze Spend Inflation', 'Check Vendor Compliance', 'Review Low Stock Items', 'View Invoices Ledger']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Voice & Audio States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);

  const quickPrompts = [
    'Analyze current vendor risk scores',
    'Detect fraud anomalies in invoices',
    'Forecast silicon price trends for Q3',
    'Which items are below safety stock?'
  ];

  // Speech Recognition setup
  const handleMicToggle = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.');
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
      alert('Speech synthesis is not supported in your browser.');
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
      onNavigate('invoices');
    } else if (textLower.includes('requisition') || textLower.includes('low stock')) {
      if (onNavigate) onNavigate('procurement');
    } else if (textLower.includes('inflation') || textLower.includes('analytics')) {
      if (onNavigate) onNavigate('dashboard');
    }

    handleSend(actionText);
  };

  const handleExportTranscript = () => {
    const transcript = messages.map(m => `[${m.sender.toUpperCase()}]: ${m.text}`).join('\n\n');
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nexus_AI_Transcript_${new Date().toISOString().slice(0, 10)}.txt`;
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
          text: data.reply || 'Analysis completed.',
          actions: data.suggestedActions || [] 
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev, 
        { sender: 'ai', text: 'An unexpected network error occurred while connecting to Gemini AI.' }
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
          className="group px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-full shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 border border-indigo-300/30"
          title="Open AI Procurement Copilot"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-indigo-200 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-indigo-900" />
          </div>
          <span className="text-xs tracking-wide">Nexus AI Assistant</span>
        </button>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-opacity flex justify-end">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white flex items-center justify-between border-b border-indigo-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                    Nexus AI Procurement Assistant
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] rounded font-mono">3.6 Flash</span>
                  </h3>
                  <p className="text-[11px] text-indigo-200">Voice-Enabled Enterprise Supply Chain AI</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleExportTranscript}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Export Chat Transcript"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Prompts Bar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 overflow-x-auto flex gap-2 no-scrollbar">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleActionClick(qp)}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-[11px] font-medium border border-slate-200 dark:border-slate-700 rounded-lg whitespace-nowrap transition-colors shadow-sm shrink-0"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`relative max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-sm'
                  }`}>
                    
                    {/* Controls for AI replies */}
                    {m.sender === 'ai' && (
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <button
                          onClick={() => handleSpeak(m.text, idx)}
                          className={`p-1 transition-colors ${isSpeaking === idx ? 'text-indigo-600 dark:text-indigo-400 animate-pulse' : 'text-slate-400 hover:text-indigo-600'}`}
                          title="Read Aloud"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopy(m.text, idx)}
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          title="Copy text"
                        >
                          {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap pr-10">{m.text}</div>

                    {/* Action Chips */}
                    {m.actions && m.actions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap gap-1.5">
                        {m.actions.map((act, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => handleActionClick(act)}
                            className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-[10px] font-bold rounded-md flex items-center gap-1 transition-colors"
                          >
                            <ArrowRight className="w-3 h-3" /> {act}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">
                    {m.sender === 'user' ? 'You' : 'Nexus AI'}
                  </span>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 p-3 rounded-2xl w-max border border-slate-200 dark:border-slate-700 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  Reasoning over procurement database...
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 items-center">
              
              <button
                type="button"
                onClick={handleMicToggle}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isListening 
                    ? 'bg-rose-100 border-rose-300 text-rose-600 animate-pulse' 
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600'
                }`}
                title={isListening ? 'Listening...' : 'Dictate with Voice'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={isListening ? 'Listening to voice prompt...' : 'Type your procurement request...'}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center transition-colors"
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


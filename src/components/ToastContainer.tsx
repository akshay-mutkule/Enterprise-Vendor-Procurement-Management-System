import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { ToastItem } from '../types';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useProcurement();

  if (!toasts || toasts.length === 0) return null;

  const getToastIcon = (type: ToastItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-indigo-500 shrink-0" />;
    }
  };

  const getBorderColor = (type: ToastItem['type']) => {
    switch (type) {
      case 'success':
        return 'border-emerald-200 dark:border-emerald-800/80';
      case 'warning':
        return 'border-amber-200 dark:border-amber-800/80';
      case 'error':
        return 'border-rose-200 dark:border-rose-800/80';
      case 'info':
      default:
        return 'border-indigo-200 dark:border-indigo-800/80';
    }
  };

  return (
    <div 
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="System Notifications"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 bg-white dark:bg-slate-900 border ${getBorderColor(toast.type)} rounded-xl shadow-xl transition-all duration-200 animate-slideUp overflow-hidden`}
        >
          <div className="mt-0.5">{getToastIcon(toast.type)}</div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {toast.title}
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

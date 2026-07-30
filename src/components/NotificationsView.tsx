import React, { useState } from 'react';
import { 
  Bell, Mail, AlertTriangle, CheckCircle, Info, Send, Eye, ShieldAlert 
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationRead, clearAllNotifications, vendors } = useProcurement();

  const [emailForm, setEmailForm] = useState({
    recipient: vendors[0]?.contactEmail || 'sales@apexcomponents.com',
    subject: 'URGENT: Purchase Order Approval Alert PO-2026-0081',
    message: 'Dear Vendor, Your Purchase Order PO-2026-0081 has been officially approved. Please inspect the expected delivery SLAs.'
  });

  const [sentLogs, setSentLogs] = useState<Array<{ id: string; to: string; subject: string; time: string }>>([
    { id: 'mail-1', to: 'sales@apexcomponents.com', subject: 'RFQ Invitation RFQ-2026-044', time: '2026-07-28 10:15' },
    { id: 'mail-2', to: 'orders@metropack.com', subject: 'Payment Remittance Disbursed $14,160.00', time: '2026-07-22 14:30' }
  ]);

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setSentLogs(prev => [
      {
        id: `mail-${Date.now()}`,
        to: emailForm.recipient,
        subject: emailForm.subject,
        time: new Date().toISOString().substring(0, 16).replace('T', ' ')
      },
      ...prev
    ]);
    alert(`Java Mail Sender simulated: Email successfully dispatched to ${emailForm.recipient}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Alerts & Java Mail Sender Notification Hub
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time system event alerts and Java Mail SMTP dispatch simulator for vendors and officers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Real-time Alerts List (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              System Event Stream ({notifications.length})
            </h3>
            {notifications.length > 0 && (
              <button onClick={clearAllNotifications} className="text-xs text-indigo-600 hover:underline">
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.map(n => (
              <div 
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${!n.read ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-700'}`}
              >
                <div className="flex items-start gap-2.5">
                  {n.type === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                  {n.type === 'SUCCESS' && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                  {n.type === 'INFO' && <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                  <div className="flex-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Java Mail Dispatch Simulator (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-600" /> Java Mail Sender SMTP Simulator
          </h3>

          <form onSubmit={handleSendEmail} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">To Email Address</label>
              <input
                type="email"
                required
                value={emailForm.recipient}
                onChange={e => setEmailForm({ ...emailForm, recipient: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Subject Line</label>
              <input
                type="text"
                required
                value={emailForm.subject}
                onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Email Body Content</label>
              <textarea
                rows={3}
                value={emailForm.message}
                onChange={e => setEmailForm({ ...emailForm, message: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow"
            >
              <Send className="w-3.5 h-3.5" /> Dispatch SMTP Email
            </button>
          </form>

          {/* Sent Log history */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Outbound Dispatch Log</span>
            {sentLogs.map(log => (
              <div key={log.id} className="text-xs flex justify-between p-2 bg-slate-50 dark:bg-slate-900/40 rounded border border-slate-100 dark:border-slate-700">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{log.to}: {log.subject}</span>
                <span className="text-[10px] text-slate-400">{log.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

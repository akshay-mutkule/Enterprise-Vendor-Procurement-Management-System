import React, { useState } from 'react';
import { 
  ShieldAlert, Search, Filter, Download, FileSpreadsheet, FileText, 
  Clock, User, Key, Activity, Layers, Terminal 
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { AuditLog } from '../types';

export const AuditLogView: React.FC = () => {
  const { auditLogs, searchQuery } = useProcurement();
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const effectiveSearch = searchQuery || localSearch;

  const filteredLogs = auditLogs.filter(log => {
    const matchesModule = selectedModule === 'ALL' || log.module === selectedModule;
    const matchesSearch = 
      log.action.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      log.userName.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(effectiveSearch.toLowerCase());
    return matchesModule && matchesSearch;
  });

  const getModuleBadge = (module: string) => {
    switch (module) {
      case 'VENDOR':
        return <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px]">VENDOR</span>;
      case 'PROCUREMENT':
        return <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">PROCUREMENT</span>;
      case 'INVENTORY':
        return <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">INVENTORY</span>;
      case 'FINANCE':
        return <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">FINANCE</span>;
      case 'AI':
        return <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">AI MODEL</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">{module}</span>;
    }
  };

  const handleExportPDF = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Module', 'Action', 'IP Address', 'Details'];
    const rows = filteredLogs.map(l => [
      l.timestamp, l.userName, l.role, l.module, l.action, l.ipAddress, l.details
    ]);
    exportToPDF('Enterprise Security Audit Trail Register', headers, rows, 'System_Audit_Logs');
  };

  const handleExportExcel = () => {
    const data = filteredLogs.map(l => ({
      Timestamp: l.timestamp,
      User: l.userName,
      Role: l.role,
      Module: l.module,
      Action: l.action,
      IPAddress: l.ipAddress,
      Details: l.details
    }));
    exportToExcel(data, 'System_Audit_Logs');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            SOC-2 Type II & SOX Compliance Immutable Ledger
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">System Security & Audit Trail Logs</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time activity recording of user role mutations, RFQ approvals, PO disbursements, and AI risk requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs shadow-md flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> Export PDF Log
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel Log
          </button>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Module Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
          <span className="text-slate-400 text-xs flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Module:
          </span>
          {['ALL', 'VENDOR', 'PROCUREMENT', 'INVENTORY', 'FINANCE', 'AI', 'SYSTEM'].map(mod => (
            <button
              key={mod}
              onClick={() => setSelectedModule(mod)}
              className={`px-3 py-1.5 rounded-lg transition-all ${selectedModule === mod ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
            >
              {mod}
            </button>
          ))}
        </div>

        {/* Local Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            placeholder="Search audit logs..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 font-semibold">Timestamp</th>
                <th className="p-3 font-semibold">Module</th>
                <th className="p-3 font-semibold">User & Role</th>
                <th className="p-3 font-semibold">Action Trigger</th>
                <th className="p-3 font-semibold">IP Address</th>
                <th className="p-3 font-semibold">Details</th>
                <th className="p-3 font-semibold text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No matching audit log records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-3 font-mono text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{log.timestamp}</span>
                    </td>
                    <td className="p-3">{getModuleBadge(log.module)}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{log.userName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.role}</div>
                    </td>
                    <td className="p-3 font-semibold text-indigo-600 dark:text-indigo-400">{log.action}</td>
                    <td className="p-3 font-mono text-slate-500">{log.ipAddress}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 truncate max-w-xs">{log.details}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded text-[11px] font-semibold"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log Detail Inspection */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" /> Log Inspection Record #{selectedLog.id}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Module</span>
                  <span>{getModuleBadge(selectedLog.module)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Timestamp</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{selectedLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">User</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLog.userName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Role</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{selectedLog.role}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">IP Address</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">{selectedLog.ipAddress}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Action</span>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-700 dark:text-indigo-300 font-bold">
                  {selectedLog.action}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Details & Payload Context</span>
                <div className="p-3 bg-slate-900 text-slate-200 font-mono rounded-lg text-[11px] leading-relaxed">
                  {selectedLog.details}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg text-xs shadow"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

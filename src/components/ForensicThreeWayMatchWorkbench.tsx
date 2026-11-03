import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, FileCheck, DollarSign, CheckCircle2, 
  ArrowRight, Download, Printer, RefreshCw, XCircle, FileText, 
  Scale, Building2, UserCheck, ShieldAlert, Sparkles, Send, Ban
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProcurement } from '../context/ProcurementContext';
import { formatCurrency, exportToPDF } from '../utils/exportUtils';
import { sound } from '../utils/soundUtils';

interface ReconciliationLine {
  id: string;
  sku: string;
  description: string;
  // PO Data
  poQty: number;
  poUnitPrice: number;
  poTotal: number;
  // GRN Data
  grnReceivedQty: number;
  grnAcceptedQty: number;
  grnRejectedQty: number;
  grnSlipNumber: string;
  // Invoice Data
  invBilledQty: number;
  invBilledUnitPrice: number;
  invFreightSurcharge: number;
  invTotal: number;
  // Variance
  priceVariancePercent: number;
  qtyVariance: number;
  status: 'PERFECT_MATCH' | 'PRICE_DISCREPANCY' | 'QUANTITY_SHORTAGE' | 'UNAPPROVED_FEE';
  remedied: boolean;
  remedyAction?: string;
}

const initialLines: ReconciliationLine[] = [
  {
    id: 'rec-1',
    sku: 'SKU-MCU-01',
    description: 'Cortex-M7 High-Performance Microcontrollers (Tray of 250)',
    poQty: 40,
    poUnitPrice: 1250.00,
    poTotal: 50000.00,
    grnReceivedQty: 40,
    grnAcceptedQty: 40,
    grnRejectedQty: 0,
    grnSlipNumber: 'GRN-2026-8801',
    invBilledQty: 40,
    invBilledUnitPrice: 1250.00,
    invFreightSurcharge: 0,
    invTotal: 50000.00,
    priceVariancePercent: 0,
    qtyVariance: 0,
    status: 'PERFECT_MATCH',
    remedied: false
  },
  {
    id: 'rec-2',
    sku: 'SKU-CAP-03',
    description: 'Solid Tantalum High-Reliability Capacitors 100uF',
    poQty: 5000,
    poUnitPrice: 1.80,
    poTotal: 9000.00,
    grnReceivedQty: 4800,
    grnAcceptedQty: 4800,
    grnRejectedQty: 0,
    grnSlipNumber: 'GRN-2026-8802',
    invBilledQty: 5000,
    invBilledUnitPrice: 1.80,
    invFreightSurcharge: 0,
    invTotal: 9000.00,
    priceVariancePercent: 0,
    qtyVariance: -200,
    status: 'QUANTITY_SHORTAGE',
    remedied: false
  },
  {
    id: 'rec-3',
    sku: 'SKU-SEN-02',
    description: 'Optocoupler Sensor IC (Automotive Grade AEC-Q100)',
    poQty: 1000,
    poUnitPrice: 4.50,
    poTotal: 4500.00,
    grnReceivedQty: 1000,
    grnAcceptedQty: 1000,
    grnRejectedQty: 0,
    grnSlipNumber: 'GRN-2026-8803',
    invBilledQty: 1000,
    invBilledUnitPrice: 4.85,
    invFreightSurcharge: 0,
    invTotal: 4850.00,
    priceVariancePercent: 7.78,
    qtyVariance: 0,
    status: 'PRICE_DISCREPANCY',
    remedied: false
  },
  {
    id: 'rec-4',
    sku: 'SKU-CNC-06',
    description: 'Aerospace Anodized Aluminum Chassis (Milled Enclosure)',
    poQty: 120,
    poUnitPrice: 180.00,
    poTotal: 21600.00,
    grnReceivedQty: 120,
    grnAcceptedQty: 110,
    grnRejectedQty: 10,
    grnSlipNumber: 'GRN-2026-8804',
    invBilledQty: 120,
    invBilledUnitPrice: 180.00,
    invFreightSurcharge: 450.00,
    invTotal: 22050.00,
    priceVariancePercent: 0,
    qtyVariance: -10,
    status: 'UNAPPROVED_FEE',
    remedied: false
  }
];

export const ForensicThreeWayMatchWorkbench: React.FC<{ invoiceNumber?: string; poNumber?: string; vendorName?: string }> = ({
  invoiceNumber = 'INV-2026-0891',
  poNumber = 'PO-2026-0081',
  vendorName = 'Apex Components Ltd'
}) => {
  const { addToast, logActivity } = useProcurement();

  const [toleranceThreshold, setToleranceThreshold] = useState<number>(1.5); // 1.5%
  const [lines, setLines] = useState<ReconciliationLine[]>(initialLines);
  const [soxSignOff, setSoxSignOff] = useState<{ signed: boolean; auditor: string; timestamp: string; reason: string } | null>(null);
  const [showSignOffModal, setShowSignOffModal] = useState<boolean>(false);
  const [signOffReason, setSignOffReason] = useState<string>('Vendor price escalation verified against long-term index agreement Annex-B.');
  const [debitNotesIssued, setDebitNotesIssued] = useState<string[]>([]);

  // Computed Totals
  const totalPOAmount = lines.reduce((acc, l) => acc + l.poTotal, 0);
  const totalBilledAmount = lines.reduce((acc, l) => acc + l.invTotal, 0);
  const netVariance = totalBilledAmount - totalPOAmount;
  const isTolerancePass = Math.abs((netVariance / totalPOAmount) * 100) <= toleranceThreshold;

  const discrepancyCount = lines.filter(l => l.status !== 'PERFECT_MATCH' && !l.remedied).length;

  const handleIssueDebitNote = (lineId: string) => {
    sound.playSuccess();
    const line = lines.find(l => l.id === lineId);
    if (!line) return;

    let debitAmount = 0;
    if (line.status === 'QUANTITY_SHORTAGE') {
      debitAmount = Math.abs(line.qtyVariance) * line.invBilledUnitPrice;
    } else if (line.status === 'PRICE_DISCREPANCY') {
      debitAmount = (line.invBilledUnitPrice - line.poUnitPrice) * line.invBilledQty;
    } else if (line.status === 'UNAPPROVED_FEE') {
      debitAmount = line.invFreightSurcharge + (line.grnRejectedQty * line.poUnitPrice);
    }

    const dnNumber = `DN-${Math.floor(10000 + Math.random() * 90000)}`;
    setDebitNotesIssued(prev => [...prev, dnNumber]);

    setLines(prev => prev.map(l => {
      if (l.id === lineId) {
        return {
          ...l,
          remedied: true,
          remedyAction: `Debit Note ${dnNumber} issued for ${formatCurrency(debitAmount)}`
        };
      }
      return l;
    }));

    logActivity(
      'FINANCE',
      `Issued Debit Note ${dnNumber} against ${vendorName} for Invoice ${invoiceNumber}: ${formatCurrency(debitAmount)} deducted due to ${line.status}.`
    );

    addToast({
      title: `Debit Note ${dnNumber} Generated`,
      message: `Formally deducted ${formatCurrency(debitAmount)} from vendor payable. Line item marked reconciled.`,
      type: 'success'
    });
  };

  const handleIssueRMA = (lineId: string) => {
    sound.playClick();
    const rmaNumber = `RMA-DEF-${Math.floor(1000 + Math.random() * 9000)}`;
    setLines(prev => prev.map(l => {
      if (l.id === lineId) {
        return {
          ...l,
          remedied: true,
          remedyAction: `Return Authorization ${rmaNumber} dispatched for ${l.grnRejectedQty} units`
        };
      }
      return l;
    }));

    addToast({
      title: 'RMA Dispatched to Supplier',
      message: `Return Authorization ${rmaNumber} sent for warehouse return & credit memo replacement.`,
      type: 'info'
    });
  };

  const handleExecuteSoxSignOff = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playGavel();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });

    const stamp = {
      signed: true,
      auditor: 'Victoria Thorne, VP of Enterprise Financial Controls (CPA/SOX #891)',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      reason: signOffReason
    };

    setSoxSignOff(stamp);
    setShowSignOffModal(false);

    logActivity(
      'FINANCE',
      `SOX 404 Executive Sign-Off executed by ${stamp.auditor} for Invoice ${invoiceNumber}. Variance of ${formatCurrency(netVariance)} cleared. Rationale: ${signOffReason}`
    );

    addToast({
      title: 'SOX Section 404 Sign-Off Applied',
      message: 'Cryptographic compliance stamp affixed to invoice ledger. Ready for automated payment dispatch.',
      type: 'success'
    });
  };

  const handleExportReconciliationPDF = () => {
    sound.playClick();
    const headers = ['SKU / Item', 'PO Ordered', 'GRN Accepted', 'Billed Qty', 'Price Var %', 'Status / Remedy'];
    const rows = lines.map(l => [
      `${l.sku} - ${l.description.substring(0, 24)}...`,
      `${l.poQty} @ ${formatCurrency(l.poUnitPrice)}`,
      `${l.grnAcceptedQty} (Rej: ${l.grnRejectedQty})`,
      `${l.invBilledQty} @ ${formatCurrency(l.invBilledUnitPrice)}`,
      `${l.priceVariancePercent > 0 ? '+' : ''}${l.priceVariancePercent.toFixed(1)}%`,
      l.remedied ? `Remedied (${l.remedyAction?.substring(0, 15)}...)` : l.status
    ]);

    exportToPDF(
      `Forensic 3-Way Reconciliation Audit Dossier - ${invoiceNumber}`,
      headers,
      rows,
      `3Way_Audit_${invoiceNumber}_${Date.now()}`
    );

    addToast({
      title: 'Audit Dossier Exported',
      message: 'SOX 404 compliant forensic reconciliation report generated as PDF.',
      type: 'info'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-full text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            Automated Tolerance Engine & SOX Section 404 Protocol
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Forensic 3-Way Match & Discrepancy Reconciliation Workbench
          </h2>
          <p className="text-xs text-slate-500">
            Automated line-by-line verification across Purchase Order <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{poNumber}</span>, Warehouse GRN slips, and Vendor Tax Invoice <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{invoiceNumber}</span> ({vendorName}).
          </p>
        </div>

        {/* Tolerance & Export Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Tolerance Threshold:</span>
            <select
              value={toleranceThreshold}
              onChange={(e) => setToleranceThreshold(Number(e.target.value))}
              className="bg-white dark:bg-slate-900 font-mono font-bold border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs"
            >
              <option value={0.5}>±0.5% (Strict Defense)</option>
              <option value={1.0}>±1.0% (Standard)</option>
              <option value={1.5}>±1.5% (Enterprise)</option>
              <option value={2.5}>±2.5% (Flexible)</option>
            </select>
          </div>

          <button
            onClick={handleExportReconciliationPDF}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Audit Dossier
          </button>
        </div>
      </div>

      {/* 3 Pillars Summary Cards: PO vs GRN vs Invoice */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Pillar 1: Purchase Order */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">1. Authorized PO</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-mono font-black text-slate-900 dark:text-white mt-2">
            {formatCurrency(totalPOAmount)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Ref: {poNumber}</span>
            <span className="text-emerald-600 font-bold">Approved</span>
          </div>
        </div>

        {/* Pillar 2: Receiving GRN Slip */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">2. Warehouse GRN</span>
            <FileCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-mono font-black text-slate-900 dark:text-white mt-2">
            {lines.reduce((a, b) => a + b.grnAcceptedQty, 0)} Units Accepted
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Rejected: <strong className="text-rose-500">{lines.reduce((a, b) => a + b.grnRejectedQty, 0)}</strong> units</span>
            <span className="text-blue-600 font-bold">Dock Inspected</span>
          </div>
        </div>

        {/* Pillar 3: Invoiced Amount */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">3. Billed Invoice</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-mono font-black text-slate-900 dark:text-white mt-2">
            {formatCurrency(totalBilledAmount)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Ref: {invoiceNumber}</span>
            <span className="text-amber-600 font-bold">Pending Clearing</span>
          </div>
        </div>

        {/* Pillar 4: Forensic Reconciliation Variance */}
        <div className={`p-5 rounded-2xl border shadow-sm relative overflow-hidden ${
          discrepancyCount === 0 || soxSignOff
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Forensic Net Drift
            </span>
            {discrepancyCount === 0 || soxSignOff ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
            )}
          </div>
          <div className={`text-xl font-mono font-black mt-2 ${
            netVariance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {netVariance > 0 ? `+${formatCurrency(netVariance)}` : formatCurrency(netVariance)}
          </div>
          <div className="text-xs font-bold mt-1 text-slate-600 dark:text-slate-300">
            {discrepancyCount === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400">All Lines Fully Cleared</span>
            ) : soxSignOff ? (
              <span className="text-indigo-600 dark:text-indigo-400">SOX 404 Executive Override Applied</span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400">{discrepancyCount} Unresolved Discrepancies</span>
            )}
          </div>
        </div>

      </div>

      {/* SOX 404 Sign-Off Banner (if present) */}
      {soxSignOff && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-5 border border-indigo-700/60 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-black uppercase text-indigo-300 tracking-wider">
                Affixed SOX 404 Executive Compliance Stamp
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                Authorized by: {soxSignOff.auditor}
              </div>
              <div className="text-xs text-indigo-200/80 mt-0.5 font-mono">
                Timestamp: {soxSignOff.timestamp} • Rationale: {soxSignOff.reason}
              </div>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/40 rounded-lg text-emerald-300 text-xs font-bold">
            Audit Locked
          </div>
        </div>
      )}

      {/* Main Reconciliation Line Items Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Line-Item 3-Way Forensic Comparison Ledger
            </h3>
            <span className="text-[11px] text-slate-400">PO Baseline vs Dock GRN Inspection vs Vendor Invoiced Charge</span>
          </div>

          <div className="flex items-center gap-2">
            {!soxSignOff && discrepancyCount > 0 && (
              <button
                onClick={() => setShowSignOffModal(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all"
              >
                <UserCheck className="w-3.5 h-3.5" /> CFO / SOX Sign-Off Override
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">SKU & Item</th>
                <th className="p-3">PO Baseline</th>
                <th className="p-3">GRN Receiving Dock</th>
                <th className="p-3">Vendor Invoice</th>
                <th className="p-3">Discrepancy Analysis</th>
                <th className="p-3 text-right">Remediation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {lines.map((line) => {
                const isMatched = line.status === 'PERFECT_MATCH' || line.remedied;
                return (
                  <tr 
                    key={line.id}
                    className={`transition-colors ${
                      line.remedied 
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20' 
                        : line.status === 'PRICE_DISCREPANCY' || line.status === 'QUANTITY_SHORTAGE' || line.status === 'UNAPPROVED_FEE'
                          ? 'bg-amber-50/50 dark:bg-amber-950/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* SKU & Name */}
                    <td className="p-3">
                      <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{line.sku}</div>
                      <div className="font-semibold text-slate-900 dark:text-white max-w-xs truncate">{line.description}</div>
                    </td>

                    {/* PO Data */}
                    <td className="p-3">
                      <div className="font-mono text-slate-800 dark:text-slate-200 font-bold">{line.poQty} units</div>
                      <div className="text-[10px] text-slate-400 font-mono">@ {formatCurrency(line.poUnitPrice)} = {formatCurrency(line.poTotal)}</div>
                    </td>

                    {/* GRN Data */}
                    <td className="p-3">
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {line.grnAcceptedQty} accepted
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Slip: {line.grnSlipNumber} {line.grnRejectedQty > 0 && <span className="text-rose-500 font-bold">({line.grnRejectedQty} rejected)</span>}
                      </div>
                    </td>

                    {/* Invoice Data */}
                    <td className="p-3">
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {line.invBilledQty} billed @ {formatCurrency(line.invBilledUnitPrice)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Total: {formatCurrency(line.invTotal)} {line.invFreightSurcharge > 0 && <span className="text-amber-500 font-bold">(+${line.invFreightSurcharge} surcharge)</span>}
                      </div>
                    </td>

                    {/* Variance */}
                    <td className="p-3">
                      {line.remedied ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {line.remedyAction}
                        </span>
                      ) : line.status === 'PERFECT_MATCH' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 100% Variance Free
                        </span>
                      ) : line.status === 'QUANTITY_SHORTAGE' ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" /> Shortage: {Math.abs(line.qtyVariance)} units unreceived
                        </span>
                      ) : line.status === 'PRICE_DISCREPANCY' ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" /> Unit Price Drift: +{line.priceVariancePercent.toFixed(1)}% (${line.invBilledUnitPrice - line.poUnitPrice}/ea)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" /> Unapproved Surcharge + Damaged Lot
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      {line.remedied ? (
                        <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded">
                          Reconciled
                        </span>
                      ) : line.status === 'PERFECT_MATCH' ? (
                        <span className="text-[11px] font-mono text-slate-400 font-semibold">Cleared</span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleIssueDebitNote(line.id)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 rounded text-[11px] font-bold border border-rose-200 dark:border-rose-800 transition-colors"
                          >
                            Issue Debit Note
                          </button>
                          {line.grnRejectedQty > 0 && (
                            <button
                              onClick={() => handleIssueRMA(line.id)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-[11px] font-semibold transition-colors"
                            >
                              Dispatch RMA
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SOX 404 Executive Sign-off Modal */}
      {showSignOffModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  SOX Section 404 Executive Sign-Off
                </h3>
              </div>
              <button 
                onClick={() => setShowSignOffModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteSoxSignOff} className="p-6 space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                <span className="font-bold block mb-1">Corporate Governance Disclosure:</span>
                This override stamps this invoice with an auditable cryptographic approval. By executing, you attest that the discrepancy has been verified against master contractual agreements or authorized under CFO delegated authority.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Authorizing Executive
                </label>
                <input
                  type="text"
                  readOnly
                  value="Victoria Thorne, VP Financial Controls (CPA/SOX #891)"
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs font-medium text-slate-600 dark:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reconciliation Override Rationale
                </label>
                <textarea
                  rows={3}
                  required
                  value={signOffReason}
                  onChange={(e) => setSignOffReason(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Enter detailed audit justification..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSignOffModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" /> Affix Cryptographic SOX Stamp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

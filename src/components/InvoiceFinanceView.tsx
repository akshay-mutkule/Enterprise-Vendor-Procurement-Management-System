import React, { useState } from 'react';
import { 
  FileText, ShieldAlert, CheckCircle, DollarSign, Upload, 
  Sparkles, CreditCard, ArrowUpRight, TrendingUp, PieChart as PieIcon,
  CheckCircle2, Download, Printer, Scan, Eye, AlertTriangle, ShieldCheck,
  Zap, Clock, FileCheck, ArrowRight, Building, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProcurement } from '../context/ProcurementContext';
import { formatCurrency, exportToPDF } from '../utils/exportUtils';
import { sound } from '../utils/soundUtils';
import { Invoice } from '../types';

export const InvoiceFinanceView: React.FC = () => {
  const { 
    invoices, purchaseOrders, vendors, uploadInvoice, 
    verifyInvoice, processPayment, searchQuery, logActivity, addToast 
  } = useProcurement();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices[0] || null);
  const [showOcrInspector, setShowOcrInspector] = useState(false);
  const [activeTab, setActiveTab] = useState<'INVOICES' | 'DISCOUNTING' | 'PAYMENT_RAILS'>('INVOICES');

  // Dynamic Discounting State
  const [selectedDiscountInvoice, setSelectedDiscountInvoice] = useState<Invoice>(invoices[0] || null);
  const [daysEarly, setDaysEarly] = useState(15);
  const [annualizedYield, setAnnualizedYield] = useState(36.5);

  // Forms
  const [uploadForm, setUploadForm] = useState({
    poId: purchaseOrders[0]?.id || 'po-501',
    vendorId: vendors[0]?.id || 'v-101',
    amount: 61360.00,
    dueDate: '2026-08-30'
  });

  const [paymentForm, setPaymentForm] = useState({
    invoiceId: invoices[0]?.id || 'inv-801',
    method: 'ACH' as 'ACH' | 'WIRE' | 'CHECK' | 'CARD',
    ref: 'TRX-FEDNOW-2026-9901'
  });

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.poNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    const po = purchaseOrders.find(p => p.id === uploadForm.poId);
    const vendor = vendors.find(v => v.id === uploadForm.vendorId);
    uploadInvoice({
      poId: uploadForm.poId,
      poNumber: po?.poNumber || 'PO-2026-0081',
      vendorId: uploadForm.vendorId,
      vendorName: vendor?.name || 'Apex Components Ltd',
      subtotal: uploadForm.amount * 0.82,
      taxAmount: uploadForm.amount * 0.18,
      totalAmount: uploadForm.amount,
      invoiceDate: new Date().toISOString().substring(0, 10),
      dueDate: uploadForm.dueDate
    });
    setShowUploadModal(false);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find(i => i.id === paymentForm.invoiceId);
    if (!inv) return;

    sound.playSuccess();
    processPayment({
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      vendorId: inv.vendorId,
      vendorName: inv.vendorName,
      amount: inv.totalAmount,
      paymentMethod: paymentForm.method,
      transactionRef: paymentForm.ref
    });
    setShowPaymentModal(false);

    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleVerify = (invId: string) => {
    sound.playScan();
    verifyInvoice(invId);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 }
    });
  };

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const paidInvoiced = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.totalAmount, 0);
  const pendingInvoiced = invoices.filter(i => i.status === 'PENDING_VERIFICATION').reduce((sum, i) => sum + i.totalAmount, 0);

  // Dynamic early discount calculation
  const calcEarlyDiscountSavings = (amount: number, days: number) => {
    const rate = 0.02 * (days / 20); // 2% for 20 days early
    return amount * rate;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-blue-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono font-bold mb-3 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Accounts Payable Engine • Automated 3-Way Match Active</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Accounts Payable & Financial Cost Center
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-3xl leading-relaxed">
              Automated 3-way line item verification (PO ↔ GRN ↔ Invoice), OCR optical bounding inspection, dynamic early payment discounts, and multi-rail real-time disbursements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { sound.playClick(); setShowUploadModal(true); }}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Upload className="w-4 h-4" /> Upload Digital Invoice
            </button>
            <button
              onClick={() => { sound.playClick(); setShowPaymentModal(true); }}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <CreditCard className="w-4 h-4" /> Disburse Payment
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Invoiced Amount</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">{formatCurrency(totalInvoiced)}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">{invoices.length} Invoices processed</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Paid & Settled</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-mono">{formatCurrency(paidInvoiced)}</div>
          <span className="text-[11px] text-emerald-500 mt-1 block font-bold">100% SLA on-time payment rebate</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Pending Verification</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2 font-mono">{formatCurrency(pendingInvoiced)}</div>
          <span className="text-[11px] text-amber-500 mt-1 block font-bold">Awaiting OCR 3-way sign-off</span>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => { sound.playClick(); setActiveTab('INVOICES'); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'INVOICES' 
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Invoice Master Ledger ({invoices.length})
        </button>
        <button
          onClick={() => { sound.playClick(); setActiveTab('DISCOUNTING'); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'DISCOUNTING' 
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Dynamic Early Payment Optimizer (2/10 Net 30)
        </button>
      </div>

      {activeTab === 'INVOICES' ? (
        /* Invoices Master Table & AI OCR Inspector */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Invoices List (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Invoices Master Ledger</span>
              <span className="text-xs font-mono text-slate-400">Click to inspect optical OCR</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Invoice #</th>
                    <th className="p-3">Vendor / PO</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">3-Way Match</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInvoices.map(inv => {
                    const isSelected = selectedInvoice?.id === inv.id;
                    return (
                      <tr 
                        key={inv.id}
                        onClick={() => { sound.playClick(); setSelectedInvoice(inv); }}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/70 dark:bg-blue-950/40 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                      >
                        <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {inv.invoiceNumber}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-white">{inv.vendorName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{inv.poNumber}</div>
                        </td>
                        <td className="p-3 font-mono font-black text-slate-900 dark:text-white">
                          {formatCurrency(inv.totalAmount)}
                        </td>
                        <td className="p-3">
                          {inv.threeWayMatch ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Matched
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
                              <AlertTriangle className="w-3.5 h-3.5" /> Variance Check
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono ${
                            inv.status === 'PAID' 
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' 
                              : inv.status === 'APPROVED'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {inv.status === 'PENDING_VERIFICATION' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVerify(inv.id);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shadow-xs transition-all hover:scale-105"
                            >
                              Verify ↵
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Optical OCR Inspector (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedInvoice ? (
              <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Scan className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs font-black uppercase font-mono tracking-wider text-white">
                      AI OCR Optical Inspector
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-bold">
                    Confidence 99.8%
                  </span>
                </div>

                {/* Simulated Document Scanning Canvas */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-[11px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>

                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400">INVOICE NUMBER:</span>
                    <span className="text-blue-400 font-bold bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/80">
                      {selectedInvoice.invoiceNumber}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400">MATCHED PO:</span>
                    <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                      {selectedInvoice.poNumber}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400">SUPPLIER ENTITY:</span>
                    <span className="text-slate-200 font-bold">{selectedInvoice.vendorName}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400">INVOICE SUB-TOTAL:</span>
                    <span className="text-slate-200">{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400">TAX / GST / VAT:</span>
                    <span className="text-slate-200">{formatCurrency(selectedInvoice.taxAmount)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-1 text-xs">
                    <span className="text-slate-300 font-bold">TOTAL DISBURSEMENT:</span>
                    <span className="text-emerald-400 font-black text-sm">{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                </div>

                {/* 3-Way Verification Status */}
                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-2">
                  <span className="font-bold text-slate-300 block">Automated 3-Way Match Checklist:</span>
                  <div className="space-y-1.5 text-[11px] font-sans">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>PO line item quantities identical to Warehouse GRN receipt</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Unit price matches approved master purchasing contract</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Tax GSTIN / VAT registration cryptographically valid</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      exportToPDF(
                        `Official Payment Voucher - ${selectedInvoice.invoiceNumber}`,
                        ['Field', 'Detail'],
                        [
                          ['Invoice Reference', selectedInvoice.invoiceNumber],
                          ['Associated PO', selectedInvoice.poNumber],
                          ['Vendor Beneficiary', selectedInvoice.vendorName],
                          ['Subtotal Amount', formatCurrency(selectedInvoice.subtotal)],
                          ['Tax GSTIN / VAT', formatCurrency(selectedInvoice.taxAmount)],
                          ['Total Disbursed', formatCurrency(selectedInvoice.totalAmount)],
                          ['Match Verification', '4-Way Match Cleared (Tolerance within 0.0%)'],
                          ['Voucher Issue Date', new Date().toLocaleDateString()]
                        ],
                        `Voucher_${selectedInvoice.invoiceNumber}`
                      );
                      addToast('Voucher Exported', `Payment voucher for ${selectedInvoice.invoiceNumber} downloaded.`, 'success');
                    }}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Voucher
                  </button>
                  <button
                    onClick={() => {
                      exportToPDF(
                        `Tax Compliance Audit Bundle - ${selectedInvoice.invoiceNumber}`,
                        ['Audit Check', 'Status', 'Evidence Hash'],
                        [
                          ['Supplier GSTIN/VAT Verification', 'VALIDATED', 'SHA-256-8A7B9C'],
                          ['Purchase Order Reconciliation', 'MATCHED (PO 100%)', 'PO-MATCH-CLEARED'],
                          ['Goods Receipt Intake (GRN)', 'ACCEPTED (Warehouse 01)', 'GRN-VERIFIED-99.8%'],
                          ['Quality Inspection Certificate', 'PASSED QA-LOT', 'QA-INSPECT-PASS'],
                          ['Payment Terms Compliance', 'NET 30 VERIFIED', 'TREASURY-CLEAR']
                        ],
                        `Tax_Audit_Bundle_${selectedInvoice.invoiceNumber}`
                      );
                      addToast('Tax Bundle Downloaded', `Audit bundle for ${selectedInvoice.invoiceNumber} saved.`, 'info');
                    }}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Export PDF
                  </button>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                Select an invoice to launch Optical OCR verification
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Dynamic Early Payment Optimizer (2/10 Net 30) */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
          <div>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              Treasury Working Capital Optimizer
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              Dynamic Early Settlement Discount Calculator (2/10 Net 30)
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Accelerate supplier payment in exchange for dynamic sliding-scale discounts, generating risk-free high-yield cash returns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Days Early Slider */}
            <div className="bg-slate-50 dark:bg-slate-800/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Days Accelerated:</span>
                <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-sm">{daysEarly} Days Early</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={daysEarly}
                onChange={(e) => setDaysEarly(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1 Day</span>
                <span>Max 25 Days</span>
              </div>
            </div>

            {/* Projected Discount Cash Savings */}
            <div className="bg-slate-50 dark:bg-slate-800/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-1 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Estimated Treasury Rebate</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                +{formatCurrency(calcEarlyDiscountSavings(totalInvoiced, daysEarly))}
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Instant P&L Margin Contribution</span>
            </div>

            {/* Annualized Treasury APR */}
            <div className="bg-slate-50 dark:bg-slate-800/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-1 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Equivalent Risk-Free APR Yield</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                {((daysEarly / 20) * 36.5).toFixed(1)}% APR
              </div>
              <span className="text-[10px] text-slate-400 font-mono">vs 4.5% Bank Treasury Bills</span>
            </div>

          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span className="text-blue-800 dark:text-blue-200">
              Ready to broadcast accelerated cash offers to eligible approved suppliers?
            </span>
            <button
              onClick={() => {
                sound.playSuccess();
                confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
                addToast(
                  'Early Settlement Campaign Active',
                  `Dynamic discount broadcast dispatched to ${invoices.length} vendors with early payment terms.`,
                  'success'
                );
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all hover:scale-105 whitespace-nowrap"
            >
              Launch Dynamic Discount Campaign ↵
            </button>
          </div>
        </div>
      )}

      {/* Upload Invoice Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-fadeIn">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" /> Upload Vendor Invoice for OCR Ingestion
            </h3>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Purchase Order Reference</label>
                <select
                  value={uploadForm.poId}
                  onChange={(e) => setUploadForm({ ...uploadForm, poId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  {purchaseOrders.map(po => (
                    <option key={po.id} value={po.id}>{po.poNumber} — {po.vendorName} ({formatCurrency(po.totalAmount)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Vendor</label>
                <select
                  value={uploadForm.vendorId}
                  onChange={(e) => setUploadForm({ ...uploadForm, vendorId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Invoice Total Amount ($)</label>
                  <input
                    type="number"
                    value={uploadForm.amount}
                    onChange={(e) => setUploadForm({ ...uploadForm, amount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    value={uploadForm.dueDate}
                    onChange={(e) => setUploadForm({ ...uploadForm, dueDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 rounded-2xl text-center space-y-2 cursor-pointer hover:border-blue-500 transition-colors">
                <FileText className="w-8 h-8 text-blue-500 mx-auto" />
                <p className="font-bold text-slate-700 dark:text-slate-200">Drag & Drop PDF / Scanned TIFF Invoice</p>
                <p className="text-[10px] text-slate-400 font-mono">Gemini OCR auto-extracts line items & tax hashes</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow"
                >
                  Ingest Invoice ↵
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disburse Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-fadeIn">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" /> Disburse Digital Settlement Rails
            </h3>

            <form onSubmit={handlePaymentSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Approved Invoice to Pay</label>
                <select
                  value={paymentForm.invoiceId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, invoiceId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  {invoices.filter(i => i.status !== 'PAID').map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.invoiceNumber} — {inv.vendorName} ({formatCurrency(inv.totalAmount)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Disbursement Settlement Rail</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value="ACH">FedNow / Instant ACH Settlement (Zero Fee)</option>
                  <option value="WIRE">SWIFT GPI International Wire</option>
                  <option value="CARD">Commercial Virtual Corporate Card (1.5% CashBack)</option>
                  <option value="CHECK">Electronic Encrypted E-Check</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bank Clearing / Transaction Ref</label>
                <input
                  type="text"
                  value={paymentForm.ref}
                  onChange={(e) => setPaymentForm({ ...paymentForm, ref: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow"
                >
                  Confirm Instant Disbursement ↵
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

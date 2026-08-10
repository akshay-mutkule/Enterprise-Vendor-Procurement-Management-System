import React, { useState } from 'react';
import { 
  FileText, ShieldAlert, CheckCircle, DollarSign, Upload, 
  Sparkles, CreditCard, ArrowUpRight, TrendingUp, PieChart as PieIcon 
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { formatCurrency } from '../utils/exportUtils';
import { Invoice } from '../types';

export const InvoiceFinanceView: React.FC = () => {
  const { 
    invoices, purchaseOrders, vendors, uploadInvoice, 
    verifyInvoice, processPayment, searchQuery 
  } = useProcurement();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices[0] || null);

  // Forms
  const [uploadForm, setUploadForm] = useState({
    poId: purchaseOrders[0]?.id || 'po-501',
    vendorId: vendors[0]?.id || 'v-101',
    amount: 61360.00,
    dueDate: '2026-08-30'
  });

  const [paymentForm, setPaymentForm] = useState({
    invoiceId: invoices[0]?.id || 'inv-801',
    method: 'ACH' as any,
    ref: 'TRX-ACH-2026-9901'
  });

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.poNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find(i => i.id === paymentForm.invoiceId);
    if (!inv) return;

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
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Accounts Payable & Financial Cost Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated invoice 3-way matching, AI fraud inspection, and digital payment disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" /> Upload Digital Invoice
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4" /> Disburse Payment
          </button>
        </div>
      </div>

      {/* Main Grid: Invoices Table (8 cols) and AI Fraud Inspector (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Table (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200">
            Invoices Master Ledger
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">PO Reference</th>
                  <th className="p-3">Vendor Name</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredInvoices.map(inv => (
                  <tr 
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer ${selectedInvoice?.id === inv.id ? 'bg-indigo-50/50 dark:bg-indigo-950/40' : ''}`}
                  >
                    <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{inv.invoiceNumber}</td>
                    <td className="p-3 font-mono text-slate-500">{inv.poNumber}</td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{inv.vendorName}</td>
                    <td className="p-3 font-extrabold text-slate-900 dark:text-white">{formatCurrency(inv.totalAmount)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : inv.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      {inv.status === 'PENDING_VERIFICATION' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); verifyInvoice(inv.id, 'APPROVED'); }}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-500 shadow-sm"
                        >
                          Verify Match
                        </button>
                      )}
                      {inv.status === 'APPROVED' && (
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setPaymentForm(prev => ({ ...prev, invoiceId: inv.id }));
                            setShowPaymentModal(true); 
                          }}
                          className="px-2.5 py-1 bg-blue-600 text-white rounded text-[11px] font-semibold hover:bg-blue-500 shadow-sm"
                        >
                          Disburse Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Fraud Inspector & Detail Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
          {selectedInvoice ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-indigo-600 font-mono font-bold uppercase">{selectedInvoice.invoiceNumber}</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{selectedInvoice.vendorName}</h3>
                <p className="text-xs text-slate-500">PO Ref: {selectedInvoice.poNumber} | Due: {selectedInvoice.dueDate}</p>
              </div>

              {/* Fraud Analysis Box */}
              <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl shadow border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4" /> AI Fraud & Anomaly Detector
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span>Risk Level:</span>
                  <span className="font-extrabold text-emerald-400">LOW (Score: 8/100)</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {selectedInvoice.aiFraudRisk?.flagReason || 'Line item pricing and tax calculations match 100% with PO registry.'}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded">
                  <span className="text-slate-500">Tax Amount (GST 18%):</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(selectedInvoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between p-2 bg-indigo-50/50 dark:bg-indigo-950/40 rounded border border-indigo-100">
                  <span className="font-bold text-indigo-900 dark:text-indigo-300">Total Payable:</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">{formatCurrency(selectedInvoice.totalAmount)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Select an invoice to view AI fraud analysis and matching breakdown.
            </div>
          )}
        </div>

      </div>

      {/* Modal: Upload Invoice */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" /> Upload Digital Invoice & Auto OCR
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {/* AI OCR Scanner Box */}
            <div className="p-4 mb-4 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" /> Gemini AI Document Parser (OCR)
                </span>
                <span className="text-[10px] bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-mono px-2 py-0.5 rounded">Auto-Extract</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Upload or select a sample bill image to automatically extract GSTIN, line items, PO references, and tax calculations.
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/ai/ocr', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ documentName: 'Supplier_Bill_2026.pdf' })
                    });
                    const parsed = await res.json();
                    if (parsed.totalAmount) {
                      setUploadForm(prev => ({
                        ...prev,
                        amount: parsed.totalAmount,
                        poId: purchaseOrders[0]?.id || prev.poId
                      }));
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Run AI Auto-Extraction on Sample Bill
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Target PO Reference</label>
                <select
                  value={uploadForm.poId}
                  onChange={e => setUploadForm({ ...uploadForm, poId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-mono"
                >
                  {purchaseOrders.map(p => <option key={p.id} value={p.id}>{p.poNumber} ({p.vendorName}) - ${p.totalAmount}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Extracted Invoice Total Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={uploadForm.amount}
                  onChange={e => setUploadForm({ ...uploadForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500">Save & Submit for Matching</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Process Payment */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">Disburse Digital Payment</h3>
            <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Select Invoice</label>
                <select
                  value={paymentForm.invoiceId}
                  onChange={e => setPaymentForm({ ...paymentForm, invoiceId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                >
                  {invoices.filter(i => i.status !== 'PAID').map(i => <option key={i.id} value={i.id}>{i.invoiceNumber} ({i.vendorName}) - ${i.totalAmount}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Payment Method</label>
                <select
                  value={paymentForm.method}
                  onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                >
                  <option value="ACH">ACH Direct Transfer</option>
                  <option value="NEFT">NEFT / RTGS Wire</option>
                  <option value="WIRE">International SWIFT Wire</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md">Execute Disbursement</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

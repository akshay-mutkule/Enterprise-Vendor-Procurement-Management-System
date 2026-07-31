import React, { useState } from 'react';
import { 
  ShoppingBag, FilePlus, CheckCircle2, Clock, DollarSign, 
  Sparkles, Award, ArrowRight, Check, X, Eye, FileText, Send 
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { formatCurrency } from '../utils/exportUtils';
import { PurchaseOrder, POStatus } from '../types';

export const ProcurementView: React.FC = () => {
  const { 
    requisitions, rfqs, quotations, purchaseOrders, vendors, products,
    addRequisition, updateRequisitionStatus, addRFQ, submitQuotation, 
    acceptQuotation, updatePOStatus, searchQuery 
  } = useProcurement();

  const [activeSubTab, setActiveSubTab] = useState<'PR' | 'RFQ' | 'QUOTES' | 'PO'>('PR');
  const [showPRModal, setShowPRModal] = useState(false);
  const [showRFQModal, setShowRFQModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedRFQForQuote, setSelectedRFQForQuote] = useState<string>('');

  // Forms State
  const [prForm, setPrForm] = useState({
    requestedBy: 'Arthur Pendelton',
    department: 'Hardware Engineering',
    purpose: 'Production component sourcing for Q3',
    itemProductName: 'Cortex-M9 High Performance Microcontroller',
    quantity: 500,
    unitPrice: 42.50
  });

  const [rfqForm, setRfqForm] = useState({
    title: 'Sourcing 500x Cortex-M9 Processors',
    deadline: '2026-08-15',
    invitedVendors: ['v-101', 'v-103'],
    itemSpecs: 'Grade 1 Industrial Packaging'
  });

  const [quoteForm, setQuoteForm] = useState({
    rfqId: rfqs[0]?.id || 'rfq-201',
    vendorId: 'v-101',
    vendorName: 'Apex Components Ltd',
    unitPrice: 39.50,
    deliveryDays: 5,
    terms: 'Net 30 days payment upon inspection.'
  });

  const filteredRequisitions = requisitions.filter(pr => 
    pr.reqNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pr.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pr.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRFQs = rfqs.filter(r => 
    r.rfqNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRFQ = selectedRFQForQuote ? q.rfqId === selectedRFQForQuote : true;
    return matchesSearch && matchesRFQ;
  });

  const filteredPOs = purchaseOrders.filter(p => 
    p.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePRSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRequisition({
      requestedBy: prForm.requestedBy,
      department: prForm.department,
      purpose: prForm.purpose,
      items: [
        {
          id: `pri-${Date.now()}`,
          productName: prForm.itemProductName,
          quantity: prForm.quantity,
          estimatedUnitPrice: prForm.unitPrice
        }
      ],
      totalAmount: prForm.quantity * prForm.unitPrice
    });
    setShowPRModal(false);
  };

  const handleRFQSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRFQ({
      title: rfqForm.title,
      deadline: rfqForm.deadline,
      invitedVendorIds: rfqForm.invitedVendors,
      items: [
        {
          id: `rfqi-${Date.now()}`,
          productName: 'Cortex-M9 Microcontroller',
          quantity: 500,
          specifications: rfqForm.itemSpecs
        }
      ]
    });
    setShowRFQModal(false);
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find(v => v.id === quoteForm.vendorId);
    const subtotal = 500 * quoteForm.unitPrice;
    const tax = subtotal * 0.18;
    submitQuotation({
      rfqId: quoteForm.rfqId || rfqs[0]?.id || 'rfq-201',
      vendorId: quoteForm.vendorId,
      vendorName: vendor?.name || quoteForm.vendorName,
      items: [
        {
          productName: 'Cortex-M9 Microcontroller',
          quantity: 500,
          unitPrice: quoteForm.unitPrice,
          taxRate: 18,
          totalPrice: subtotal + tax
        }
      ],
      subtotal,
      tax,
      totalAmount: subtotal + tax,
      deliveryTimeDays: quoteForm.deliveryDays,
      validUntil: '2026-08-30',
      terms: quoteForm.terms
    });
    setShowQuoteModal(false);
  };

  const getPOStatusBadge = (status: POStatus) => {
    switch (status) {
      case 'ISSUED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">Issued to Vendor</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">Approved</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Delivered</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Subtabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Procurement Operations: PR ➔ RFQ ➔ Quotation ➔ PO Lifecycle
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end sourcing engine with multi-vendor price comparison matrix and automated PO creation.
          </p>
        </div>

        {/* Action Buttons based on subtab */}
        <div className="flex items-center gap-2">
          {activeSubTab === 'PR' && (
            <button
              onClick={() => setShowPRModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5"
            >
              <FilePlus className="w-4 h-4" /> Create Requisition (PR)
            </button>
          )}
          {activeSubTab === 'RFQ' && (
            <button
              onClick={() => setShowRFQModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Create New RFQ
            </button>
          )}
          {activeSubTab === 'QUOTES' && (
            <button
              onClick={() => setShowQuoteModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" /> Submit Vendor Quote
            </button>
          )}
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-6">
        <button
          onClick={() => setActiveSubTab('PR')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${activeSubTab === 'PR' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <span>1. Purchase Requisitions ({requisitions.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('RFQ')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${activeSubTab === 'RFQ' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <span>2. Request for Quotation ({rfqs.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('QUOTES')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${activeSubTab === 'QUOTES' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <span>3. Quotations Matrix ({quotations.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('PO')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${activeSubTab === 'PO' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <span>4. Purchase Orders ({purchaseOrders.length})</span>
        </button>
      </div>

      {/* Subtab 1: Requisitions */}
      {activeSubTab === 'PR' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200">
            Internal Purchase Requisition (PR) Queue
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Req #</th>
                  <th className="p-3">Requested By / Dept</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Line Items</th>
                  <th className="p-3">Est. Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredRequisitions.map(pr => (
                  <tr key={pr.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{pr.reqNumber}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{pr.requestedBy}</div>
                      <div className="text-[10px] text-slate-400">{pr.department}</div>
                    </td>
                    <td className="p-3 max-w-xs text-slate-600 dark:text-slate-300 truncate">{pr.purpose}</td>
                    <td className="p-3">
                      {pr.items.map(i => (
                        <div key={i.id} className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                          {i.quantity}x {i.productName}
                        </div>
                      ))}
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{formatCurrency(pr.totalAmount)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${pr.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700'}`}>
                        {pr.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {pr.status === 'PENDING_APPROVAL' && (
                        <>
                          <button
                            onClick={() => updateRequisitionStatus(pr.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-500"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateRequisitionStatus(pr.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-rose-600 text-white rounded text-[11px] font-semibold hover:bg-rose-500"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {pr.status === 'APPROVED' && (
                        <button
                          onClick={() => {
                            setRfqForm({
                              title: `Sourcing for ${pr.reqNumber}: ${pr.items[0]?.productName || 'Components'}`,
                              deadline: '2026-08-30',
                              invitedVendors: ['v-101', 'v-102'],
                              itemSpecs: `${pr.purpose} (${pr.items[0]?.quantity || 100} units requested)`
                            });
                            setActiveSubTab('RFQ');
                            setShowRFQModal(true);
                          }}
                          className="px-2.5 py-1 bg-indigo-600 text-white rounded text-[11px] font-semibold hover:bg-indigo-500 shadow"
                        >
                          Convert to RFQ →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: RFQ */}
      {activeSubTab === 'RFQ' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRFQs.map(rfq => (
            <div key={rfq.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase">{rfq.rfqNumber}</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{rfq.title}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${rfq.status === 'AWARDED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  {rfq.status}
                </span>
              </div>

              <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Items Requested</span>
                {rfq.items.map(item => (
                  <div key={item.id} className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span>{item.quantity}x {item.productName}</span>
                    <span className="text-slate-500 font-normal">{item.specifications}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-700">
                <span className="text-slate-400">Deadline: <span className="font-semibold text-slate-700 dark:text-slate-300">{rfq.deadline}</span></span>
                <button
                  onClick={() => {
                    setSelectedRFQForQuote(rfq.id);
                    setQuoteForm(prev => ({ ...prev, rfqId: rfq.id }));
                    setActiveSubTab('QUOTES');
                  }}
                  className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold rounded hover:bg-indigo-100 shadow-sm"
                >
                  View Quotes Matrix ({quotations.filter(q => q.rfqId === rfq.id).length}) →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subtab 3: Quotation Matrix & Price Comparison */}
      {activeSubTab === 'QUOTES' && (
        <div className="space-y-6">
          
          <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-xl p-4 shadow-md flex items-center justify-between border border-purple-800">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold">Side-by-Side Multi-Vendor Price Comparison Matrix</h3>
                <p className="text-xs text-purple-200">Evaluate bids with Gemini AI recommendation score, delivery SLA, and total price breakdown.</p>
              </div>
            </div>
            {selectedRFQForQuote && (
              <button
                onClick={() => setSelectedRFQForQuote('')}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg font-semibold flex items-center gap-1 backdrop-blur-sm"
              >
                Showing RFQ Filter <X className="w-3.5 h-3.5 ml-1" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredQuotations.map(quote => (
              <div key={quote.id} className={`bg-white dark:bg-slate-800 rounded-xl border p-5 shadow-sm space-y-4 relative overflow-hidden ${quote.status === 'ACCEPTED' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-700'}`}>
                
                {quote.aiRecommendationScore && quote.aiRecommendationScore > 90 && (
                  <div className="absolute top-0 right-0 bg-amber-400 text-slate-900 text-[10px] font-extrabold px-3 py-1 rounded-bl-xl shadow flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Best Recommendation ({quote.aiRecommendationScore}%)
                  </div>
                )}

                <div className="flex items-start justify-between pr-24">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{quote.vendorName}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{quote.quoteNumber} • Submitted {quote.submittedAt}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded">
                    <span className="text-slate-500">Unit Price Offered:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(quote.items[0]?.unitPrice || 0)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded">
                    <span className="text-slate-500">Delivery SLA Window:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{quote.deliveryTimeDays} Days</span>
                  </div>
                  <div className="flex justify-between p-2 bg-indigo-50/50 dark:bg-indigo-950/40 rounded border border-indigo-100 dark:border-indigo-900">
                    <span className="font-bold text-indigo-900 dark:text-indigo-300">Total Price (Incl Tax):</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">{formatCurrency(quote.totalAmount)}</span>
                  </div>
                </div>

                {quote.aiNotes && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded border border-amber-200/50">
                    💡 <strong>AI Evaluation:</strong> {quote.aiNotes}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-700">
                  {quote.status === 'SUBMITTED' ? (
                    <button
                      onClick={() => acceptQuotation(quote.id)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Award RFQ & Auto-Generate PO
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">
                      ✓ Awarded & Converted to PO
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* Subtab 4: Purchase Orders */}
      {activeSubTab === 'PO' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center justify-between">
            <span>Purchase Order Master Register</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">PO #</th>
                  <th className="p-3">Vendor Name</th>
                  <th className="p-3">Issued Date</th>
                  <th className="p-3">Expected Delivery</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredPOs.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{po.poNumber}</td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{po.vendorName}</td>
                    <td className="p-3 text-slate-500">{po.issueDate}</td>
                    <td className="p-3 text-slate-500">{po.expectedDeliveryDate}</td>
                    <td className="p-3 font-extrabold text-slate-900 dark:text-white">{formatCurrency(po.totalAmount)}</td>
                    <td className="p-3">{getPOStatusBadge(po.status)}</td>
                    <td className="p-3 text-right space-x-2">
                      {po.status === 'APPROVED' && (
                        <button
                          onClick={() => updatePOStatus(po.id, 'ISSUED')}
                          className="px-2.5 py-1 bg-blue-600 text-white rounded text-[11px] font-semibold hover:bg-blue-500 shadow-sm"
                        >
                          Issue PO
                        </button>
                      )}
                      {(po.status === 'ISSUED' || po.status === 'APPROVED') && (
                        <button
                          onClick={() => updatePOStatus(po.id, 'DELIVERED')}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-500 shadow-sm"
                        >
                          Mark Delivered (+Stock)
                        </button>
                      )}
                      {po.status !== 'CANCELLED' && po.status !== 'DELIVERED' && (
                        <button
                          onClick={() => updatePOStatus(po.id, 'CANCELLED')}
                          className="px-2.5 py-1 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded text-[11px] hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create PR */}
      {showPRModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">New Purchase Requisition</h3>
            <form onSubmit={handlePRSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Purpose / Project *</label>
                <input
                  type="text"
                  required
                  value={prForm.purpose}
                  onChange={e => setPrForm({ ...prForm, purpose: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Item Description *</label>
                <input
                  type="text"
                  required
                  value={prForm.itemProductName}
                  onChange={e => setPrForm({ ...prForm, itemProductName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    value={prForm.quantity}
                    onChange={e => setPrForm({ ...prForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Est. Unit Price ($)</label>
                  <input
                    type="number"
                    value={prForm.unitPrice}
                    onChange={e => setPrForm({ ...prForm, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowPRModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md">Submit Requisition</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create RFQ */}
      {showRFQModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">Create RFQ (Request for Quotation)</h3>
            <form onSubmit={handleRFQSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">RFQ Title *</label>
                <input
                  type="text"
                  required
                  value={rfqForm.title}
                  onChange={e => setRfqForm({ ...rfqForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Submission Deadline *</label>
                <input
                  type="date"
                  required
                  value={rfqForm.deadline}
                  onChange={e => setRfqForm({ ...rfqForm, deadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Item Specifications</label>
                <input
                  type="text"
                  value={rfqForm.itemSpecs}
                  onChange={e => setRfqForm({ ...rfqForm, itemSpecs: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowRFQModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md">Publish RFQ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Submit Quote */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">Submit Vendor Quotation</h3>
            <form onSubmit={handleQuoteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Target RFQ *</label>
                <select
                  value={quoteForm.rfqId || selectedRFQForQuote || rfqs[0]?.id || ''}
                  onChange={e => setQuoteForm({ ...quoteForm, rfqId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold"
                >
                  {rfqs.map(r => (
                    <option key={r.id} value={r.id}>{r.rfqNumber}: {r.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Select Bidding Vendor</label>
                <select
                  value={quoteForm.vendorId}
                  onChange={e => setQuoteForm({ ...quoteForm, vendorId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                >
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.code})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Offered Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={quoteForm.unitPrice}
                    onChange={e => setQuoteForm({ ...quoteForm, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Delivery Lead Time (Days)</label>
                  <input
                    type="number"
                    value={quoteForm.deliveryDays}
                    onChange={e => setQuoteForm({ ...quoteForm, deliveryDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Payment & SLAs Terms</label>
                <input
                  type="text"
                  value={quoteForm.terms}
                  onChange={e => setQuoteForm({ ...quoteForm, terms: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowQuoteModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md">Submit Quote</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

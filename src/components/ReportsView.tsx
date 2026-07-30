import React, { useState } from 'react';
import { 
  BarChart3, FileSpreadsheet, FileText, Download, CheckCircle 
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { exportToPDF, exportToExcel, formatCurrency } from '../utils/exportUtils';

export const ReportsView: React.FC = () => {
  const { vendors, purchaseOrders, products, payments, invoices } = useProcurement();

  const handleExportVendorPDF = () => {
    const headers = ['Code', 'Vendor Name', 'Category', 'Rating', 'Risk Score', 'Status'];
    const rows = vendors.map(v => [v.code, v.name, v.category, `${v.rating} ⭐`, `${v.riskScore}/100`, v.status]);
    exportToPDF('Vendor Master Lifecycle & Risk Report', headers, rows, 'Vendor_Master_Report');
  };

  const handleExportVendorExcel = () => {
    const data = vendors.map(v => ({
      Code: v.code,
      VendorName: v.name,
      Category: v.category,
      ContactEmail: v.contactEmail,
      Phone: v.phone,
      GSTIN: v.gstin,
      Rating: v.rating,
      RiskScore: v.riskScore,
      Status: v.status
    }));
    exportToExcel(data, 'Vendor_Master_Report');
  };

  const handleExportPOPDF = () => {
    const headers = ['PO Number', 'Vendor Name', 'Issue Date', 'Expected Delivery', 'Amount', 'Status'];
    const rows = purchaseOrders.map(p => [p.poNumber, p.vendorName, p.issueDate, p.expectedDeliveryDate, formatCurrency(p.totalAmount), p.status]);
    exportToPDF('Purchase Order Register Report', headers, rows, 'Purchase_Orders_Report');
  };

  const handleExportPOExcel = () => {
    const data = purchaseOrders.map(p => ({
      PONumber: p.poNumber,
      VendorName: p.vendorName,
      IssueDate: p.issueDate,
      ExpectedDelivery: p.expectedDeliveryDate,
      Subtotal: p.subtotal,
      Tax: p.tax,
      TotalAmount: p.totalAmount,
      Status: p.status
    }));
    exportToExcel(data, 'Purchase_Orders_Report');
  };

  const handleExportInventoryPDF = () => {
    const headers = ['SKU', 'Product Name', 'Category', 'Stock Qty', 'Reorder Lvl', 'Unit Price'];
    const rows = products.map(p => [p.sku, p.name, p.category, `${p.stockQuantity} ${p.unit}`, p.reorderLevel, formatCurrency(p.unitPrice)]);
    exportToPDF('Inventory Stock Level Audit Report', headers, rows, 'Inventory_Stock_Report');
  };

  const handleExportInventoryExcel = () => {
    const data = products.map(p => ({
      SKU: p.sku,
      ProductName: p.name,
      Category: p.category,
      StockQuantity: p.stockQuantity,
      Unit: p.unit,
      ReorderLevel: p.reorderLevel,
      UnitPrice: p.unitPrice,
      Barcode: p.barcode
    }));
    exportToExcel(data, 'Inventory_Stock_Report');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Executive Reports & Data Export Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate audit compliance reports and export instantly to PDF documents and Microsoft Excel spreadsheets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Report Card 1: Vendors */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Vendor Performance & Risk Report</h3>
            <p className="text-xs text-slate-500 mt-1">Complete roster of vendors, SLA metrics, GST compliance, and AI risk scores.</p>
          </div>

          <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={handleExportVendorPDF}
              className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export PDF
            </button>
            <button
              onClick={handleExportVendorExcel}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
            </button>
          </div>
        </div>

        {/* Report Card 2: POs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Purchase Orders Master Audit</h3>
            <p className="text-xs text-slate-500 mt-1">Historical log of all issued POs, line item pricing, approved status, and spend sums.</p>
          </div>

          <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={handleExportPOPDF}
              className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export PDF
            </button>
            <button
              onClick={handleExportPOExcel}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
            </button>
          </div>
        </div>

        {/* Report Card 3: Inventory */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Inventory Stock Level Audit</h3>
            <p className="text-xs text-slate-500 mt-1">Product SKU quantities, warehouse allocations, reorder thresholds, and barcodes.</p>
          </div>

          <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={handleExportInventoryPDF}
              className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export PDF
            </button>
            <button
              onClick={handleExportInventoryExcel}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

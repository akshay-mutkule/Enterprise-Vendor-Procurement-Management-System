import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, User, Vendor, VendorStatus, Product, Warehouse, 
  PurchaseRequisition, RFQ, Quotation, PurchaseOrder, 
  Invoice, Payment, AuditLog, SystemNotification, POStatus, RequisitionStatus, InvoiceStatus, VendorDocument 
} from '../types';
import { 
  initialUsers, initialVendors, initialWarehouses, 
  initialProducts, initialRequisitions, initialRFQs, 
  initialQuotations, initialPurchaseOrders, initialInvoices, 
  initialPayments, initialAuditLogs, initialNotifications 
} from '../data/mockData';

interface ProcurementContextType {
  currentRole: UserRole;
  currentUser: User;
  users: User[];
  vendors: Vendor[];
  products: Product[];
  warehouses: Warehouse[];
  requisitions: PurchaseRequisition[];
  rfqs: RFQ[];
  quotations: Quotation[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  payments: Payment[];
  auditLogs: AuditLog[];
  notifications: SystemNotification[];
  theme: 'light' | 'dark';
  language: 'EN' | 'ES' | 'FR' | 'DE' | 'HI';
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  switchRole: (role: UserRole) => void;
  addVendor: (vendor: Omit<Vendor, 'id' | 'code' | 'onboardedAt' | 'riskScore' | 'rating' | 'performanceMetrics'>) => void;
  updateVendorStatus: (id: string, status: VendorStatus, notes?: string) => void;
  addRequisition: (req: Omit<PurchaseRequisition, 'id' | 'reqNumber' | 'createdDate' | 'status'>) => void;
  updateRequisitionStatus: (id: string, status: RequisitionStatus, notes?: string) => void;
  addRFQ: (rfq: Omit<RFQ, 'id' | 'rfqNumber' | 'createdAt' | 'status'>) => void;
  submitQuotation: (quote: Omit<Quotation, 'id' | 'quoteNumber' | 'submittedAt' | 'status'>) => void;
  acceptQuotation: (quoteId: string) => void;
  updatePOStatus: (id: string, status: POStatus) => void;
  addProduct: (product: Omit<Product, 'id' | 'barcode'>) => void;
  updateStock: (productId: string, quantityDelta: number, warehouseId: string) => void;
  addWarehouse: (wh: Omit<Warehouse, 'id' | 'code' | 'currentStockCount'>) => void;
  addVendorDocument: (vendorId: string, doc: Omit<VendorDocument, 'id' | 'uploadDate' | 'verified'>) => void;
  uploadInvoice: (inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'status' | 'aiFraudRisk'>) => void;
  verifyInvoice: (id: string, status: InvoiceStatus, note?: string) => void;
  processPayment: (pay: Omit<Payment, 'id' | 'paymentNumber' | 'paymentDate' | 'status'>) => void;
  toggleTheme: () => void;
  setLanguage: (lang: 'EN' | 'ES' | 'FR' | 'DE' | 'HI') => void;
  logActivity: (action: string, module: AuditLog['module'], details: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export const ProcurementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(initialUsers);
  const [currentRole, setCurrentRole] = useState<UserRole>('PROCUREMENT_MANAGER');
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[1]); // Marcus Sterling

  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>(initialRequisitions);
  const [rfqs, setRFQs] = useState<RFQ[]>(initialRFQs);
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [notifications, setNotifications] = useState<SystemNotification[]>(initialNotifications);
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<'EN' | 'ES' | 'FR' | 'DE' | 'HI'>('EN');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    const foundUser = users.find(u => u.role === role) || users[0];
    setCurrentUser(foundUser);
    logActivity('SWITCH_ROLE', 'SYSTEM', `Switched active role to ${role}`);
  };

  const logActivity = (action: string, module: AuditLog['module'], details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentRole,
      action,
      module,
      details,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 200 + 1)
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addVendor = (vendorData: Omit<Vendor, 'id' | 'code' | 'onboardedAt' | 'riskScore' | 'rating' | 'performanceMetrics'>) => {
    const newId = `v-${Date.now()}`;
    const newCode = `VEN-${vendorData.name.substring(0, 4).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
    const newVendor: Vendor = {
      ...vendorData,
      id: newId,
      code: newCode,
      status: 'PENDING',
      riskScore: Math.floor(Math.random() * 30 + 10),
      rating: 4.5,
      onboardedAt: new Date().toISOString().substring(0, 10),
      performanceMetrics: {
        onTimeDeliveryRate: 95.0,
        qualityCompliance: 96.0,
        priceCompetitiveness: 92.0
      }
    };
    setVendors(prev => [newVendor, ...prev]);
    logActivity('REGISTER_VENDOR', 'VENDOR', `Registered new vendor ${newVendor.name} (${newCode})`);
  };

  const updateVendorStatus = (id: string, status: VendorStatus, notes?: string) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, status, notes: notes || v.notes } : v));
    logActivity('UPDATE_VENDOR_STATUS', 'VENDOR', `Updated vendor ${id} status to ${status}`);
  };

  const addRequisition = (reqData: Omit<PurchaseRequisition, 'id' | 'reqNumber' | 'createdDate' | 'status'>) => {
    const newReq: PurchaseRequisition = {
      ...reqData,
      id: `pr-${Date.now()}`,
      reqNumber: `PR-2026-${Math.floor(100 + Math.random() * 900)}`,
      createdDate: new Date().toISOString().substring(0, 10),
      status: 'PENDING_APPROVAL'
    };
    setRequisitions(prev => [newReq, ...prev]);
    logActivity('CREATE_REQUISITION', 'PROCUREMENT', `Created requisition ${newReq.reqNumber}`);
  };

  const updateRequisitionStatus = (id: string, status: RequisitionStatus, notes?: string) => {
    setRequisitions(prev => prev.map(r => r.id === id ? { ...r, status, approvalNotes: notes } : r));
    logActivity('UPDATE_REQUISITION', 'PROCUREMENT', `Requisition ${id} marked as ${status}`);
  };

  const addRFQ = (rfqData: Omit<RFQ, 'id' | 'rfqNumber' | 'createdAt' | 'status'>) => {
    const newRFQ: RFQ = {
      ...rfqData,
      id: `rfq-${Date.now()}`,
      rfqNumber: `RFQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString().substring(0, 10),
      status: 'OPEN'
    };
    setRFQs(prev => [newRFQ, ...prev]);
    logActivity('CREATE_RFQ', 'PROCUREMENT', `Created RFQ ${newRFQ.rfqNumber}: ${newRFQ.title}`);
  };

  const submitQuotation = (quoteData: Omit<Quotation, 'id' | 'quoteNumber' | 'submittedAt' | 'status'>) => {
    const newQuote: Quotation = {
      ...quoteData,
      id: `q-${Date.now()}`,
      quoteNumber: `QT-${quoteData.vendorName.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      submittedAt: new Date().toISOString().substring(0, 10),
      status: 'SUBMITTED',
      aiRecommendationScore: Math.floor(Math.random() * 20 + 80),
      aiNotes: 'Quote meets specification and delivery requirements.'
    };
    setQuotations(prev => [newQuote, ...prev]);
    logActivity('SUBMIT_QUOTATION', 'PROCUREMENT', `Vendor ${quoteData.vendorName} submitted quotation for RFQ ${quoteData.rfqId}`);
  };

  const acceptQuotation = (quoteId: string) => {
    const quote = quotations.find(q => q.id === quoteId);
    if (!quote) return;

    setQuotations(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'ACCEPTED' } : (q.rfqId === quote.rfqId ? { ...q, status: 'REJECTED' } : q)));
    setRFQs(prev => prev.map(r => r.id === quote.rfqId ? { ...r, status: 'AWARDED' } : r));

    // Auto-generate Purchase Order
    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      rfqId: quote.rfqId,
      quotationId: quote.id,
      vendorId: quote.vendorId,
      vendorName: quote.vendorName,
      items: quote.items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice
      })),
      subtotal: quote.subtotal,
      tax: quote.tax,
      totalAmount: quote.totalAmount,
      status: 'APPROVED',
      issueDate: new Date().toISOString().substring(0, 10),
      expectedDeliveryDate: new Date(Date.now() + quote.deliveryTimeDays * 86400000).toISOString().substring(0, 10),
      approvedBy: currentUser.name,
      shippingAddress: 'Main Central Logistics Hub, Dock 1, Dallas, TX',
      paymentTerms: quote.terms
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    logActivity('ACCEPT_QUOTATION', 'PROCUREMENT', `Accepted quote ${quote.quoteNumber} and generated PO ${newPO.poNumber}`);
  };

  const updatePOStatus = (id: string, status: POStatus) => {
    const targetPO = purchaseOrders.find(p => p.id === id);
    setPurchaseOrders(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    logActivity('UPDATE_PO_STATUS', 'PROCUREMENT', `Purchase Order ${id} status changed to ${status}`);

    if (status === 'DELIVERED' && targetPO) {
      // Automatically increment product stock for delivered PO items
      targetPO.items.forEach(item => {
        setProducts(prev => prev.map(prod => {
          if (prod.id === item.productId || prod.name.toLowerCase() === item.productName.toLowerCase()) {
            return { ...prod, stockQuantity: prod.stockQuantity + item.quantity };
          }
          return prod;
        }));
      });

      const newNotification: SystemNotification = {
        id: `notif-${Date.now()}`,
        title: `Goods Received: ${targetPO.poNumber}`,
        message: `Shipment from ${targetPO.vendorName} received at warehouse. Inventory quantities updated automatically.`,
        timestamp: 'Just now',
        type: 'SUCCESS',
        read: false,
        roleTarget: 'ALL'
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  };

  const addProduct = (productData: Omit<Product, 'id' | 'barcode'>) => {
    const newProduct: Product = {
      ...productData,
      id: `p-${Date.now()}`,
      barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`
    };
    setProducts(prev => [newProduct, ...prev]);
    logActivity('ADD_PRODUCT', 'INVENTORY', `Added new product ${newProduct.name} (SKU: ${newProduct.sku})`);
  };

  const updateStock = (productId: string, quantityDelta: number, warehouseId: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const updatedQty = Math.max(0, p.stockQuantity + quantityDelta);
        return { ...p, stockQuantity: updatedQty, warehouseId };
      }
      return p;
    }));
    logActivity('STOCK_UPDATE', 'INVENTORY', `Adjusted stock for product ${productId} by ${quantityDelta > 0 ? '+' : ''}${quantityDelta}`);
  };

  const addWarehouse = (whData: Omit<Warehouse, 'id' | 'code' | 'currentStockCount'>) => {
    const newWH: Warehouse = {
      ...whData,
      id: `wh-${Date.now()}`,
      code: `WH-${whData.name.substring(0, 5).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      currentStockCount: 0
    };
    setWarehouses(prev => [...prev, newWH]);
    logActivity('ADD_WAREHOUSE', 'INVENTORY', `Added new warehouse ${newWH.name}`);
  };

  const addVendorDocument = (vendorId: string, docData: Omit<VendorDocument, 'id' | 'uploadDate' | 'verified'>) => {
    const newDoc: VendorDocument = {
      ...docData,
      id: `doc-${Date.now()}`,
      uploadDate: new Date().toISOString().substring(0, 10),
      verified: true
    };
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, documents: [...v.documents, newDoc] } : v));
    logActivity('UPLOAD_DOCUMENT', 'VENDOR', `Uploaded compliance document ${newDoc.name} for vendor ${vendorId}`);
  };

  const uploadInvoice = (invData: Omit<Invoice, 'id' | 'invoiceNumber' | 'status' | 'aiFraudRisk'>) => {
    const newInv: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'PENDING_VERIFICATION',
      aiFraudRisk: {
        score: Math.floor(Math.random() * 15 + 5),
        riskLevel: 'LOW',
        flagReason: 'Invoice line item prices match PO record.'
      }
    };
    setInvoices(prev => [newInv, ...prev]);
    logActivity('UPLOAD_INVOICE', 'FINANCE', `Uploaded invoice ${newInv.invoiceNumber} for PO ${invData.poNumber}`);
  };

  const verifyInvoice = (id: string, status: InvoiceStatus, note?: string) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
    logActivity('VERIFY_INVOICE', 'FINANCE', `Verified invoice ${id} status set to ${status}`);
  };

  const processPayment = (payData: Omit<Payment, 'id' | 'paymentNumber' | 'paymentDate' | 'status'>) => {
    const newPay: Payment = {
      ...payData,
      id: `pay-${Date.now()}`,
      paymentNumber: `PAY-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      paymentDate: new Date().toISOString().substring(0, 10),
      status: 'COMPLETED'
    };
    setPayments(prev => [newPay, ...prev]);
    setInvoices(prev => prev.map(inv => inv.id === payData.invoiceId ? { ...inv, status: 'PAID' } : inv));
    logActivity('PROCESS_PAYMENT', 'FINANCE', `Disbursed payment ${newPay.paymentNumber} of $${payData.amount.toLocaleString()} to ${payData.vendorName}`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <ProcurementContext.Provider value={{
      currentRole,
      currentUser,
      users,
      vendors,
      products,
      warehouses,
      requisitions,
      rfqs,
      quotations,
      purchaseOrders,
      invoices,
      payments,
      auditLogs,
      notifications,
      theme,
      language,
      searchQuery,
      setSearchQuery,
      switchRole,
      addVendor,
      updateVendorStatus,
      addRequisition,
      updateRequisitionStatus,
      addRFQ,
      submitQuotation,
      acceptQuotation,
      updatePOStatus,
      addProduct,
      updateStock,
      addWarehouse,
      addVendorDocument,
      uploadInvoice,
      verifyInvoice,
      processPayment,
      toggleTheme,
      setLanguage,
      logActivity,
      markNotificationRead,
      clearAllNotifications
    }}>
      {children}
    </ProcurementContext.Provider>
  );
};

export const useProcurement = () => {
  const context = useContext(ProcurementContext);
  if (!context) {
    throw new Error('useProcurement must be used within a ProcurementProvider');
  }
  return context;
};

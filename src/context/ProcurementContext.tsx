import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, User, Vendor, VendorStatus, Product, Warehouse, 
  PurchaseRequisition, RFQ, Quotation, PurchaseOrder, 
  Invoice, Payment, AuditLog, SystemNotification, POStatus, RequisitionStatus, InvoiceStatus, VendorDocument,
  ToastItem, KraljicItem, KraljicQuadrant 
} from '../types';
import { getTranslation, Language } from '../utils/translations';
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
  language: Language;
  t: (key: string) => string;
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
  updateUserAvatar: (newAvatarUrl: string) => void;
  updateUserProfile: (updatedFields: Partial<User>) => void;
  logActivity: (action: string, module: AuditLog['module'], details: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  toasts: ToastItem[];
  addToast: (title: string, message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  kraljicItems: KraljicItem[];
  updateKraljicItem: (id: string, updates: Partial<KraljicItem>) => void;
  awardReverseAuction: (rfqTitle: string, winningVendor: { id: string; name: string }, winningAmount: number, items?: any[]) => void;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export const ProcurementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    return initialUsers.map(u => {
      const savedAvatar = localStorage.getItem(`procurement_user_avatar_${u.id}`);
      return savedAvatar ? { ...u, avatar: savedAvatar } : u;
    });
  });
  const [currentRole, setCurrentRole] = useState<UserRole>('PROCUREMENT_MANAGER');
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const defaultUser = initialUsers[1]; // Marcus Sterling
    const savedAvatar = localStorage.getItem(`procurement_user_avatar_${defaultUser.id}`);
    return savedAvatar ? { ...defaultUser, avatar: savedAvatar } : defaultUser;
  });

  // Helper function to initialize state from localStorage or fallback to default mock data
  const getInitial = <T,>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.warn(`Error reading ${key} from localStorage:`, err);
    }
    return defaultValue;
  };

  const [vendors, setVendors] = useState<Vendor[]>(() => getInitial('procurement_vendors', initialVendors));
  const [products, setProducts] = useState<Product[]>(() => getInitial('procurement_products', initialProducts));
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => getInitial('procurement_warehouses', initialWarehouses));
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>(() => getInitial('procurement_requisitions', initialRequisitions));
  const [rfqs, setRFQs] = useState<RFQ[]>(() => getInitial('procurement_rfqs', initialRFQs));
  const [quotations, setQuotations] = useState<Quotation[]>(() => getInitial('procurement_quotations', initialQuotations));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => getInitial('procurement_pos', initialPurchaseOrders));
  const [invoices, setInvoices] = useState<Invoice[]>(() => getInitial('procurement_invoices', initialInvoices));
  const [payments, setPayments] = useState<Payment[]>(() => getInitial('procurement_payments', initialPayments));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getInitial('procurement_audit_logs', initialAuditLogs));
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => getInitial('procurement_notifications', initialNotifications));
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const defaultKraljic: KraljicItem[] = [
    {
      id: 'k-1',
      name: 'High-Precision Microcontrollers (STM32)',
      category: 'Electronics',
      vendorId: 'v-101',
      vendorName: 'Apex Components Ltd',
      profitImpact: 88,
      supplyRisk: 82,
      quadrant: 'STRATEGIC',
      annualSpend: 340000,
      singleSourceVulnerability: true,
      marketComplexity: 'HIGH',
      recommendedStrategy: 'Long-term partnership with guaranteed allocation and joint wafer reservation.',
      leadTimeDays: 45
    },
    {
      id: 'k-2',
      name: 'Industrial Aluminum Extrusion Profiles',
      category: 'Metals & Mining',
      vendorId: 'v-102',
      vendorName: 'Global Metals Inc',
      profitImpact: 78,
      supplyRisk: 34,
      quadrant: 'LEVERAGE',
      annualSpend: 215000,
      singleSourceVulnerability: false,
      marketComplexity: 'LOW',
      recommendedStrategy: 'Competitive reverse bidding, multi-supplier volume splitting to lower price.',
      leadTimeDays: 14
    },
    {
      id: 'k-3',
      name: 'Custom Optoelectronic LiDAR Sensors',
      category: 'Optics & Sensing',
      vendorId: 'v-103',
      vendorName: 'MicroPrecision Technologies',
      profitImpact: 35,
      supplyRisk: 89,
      quadrant: 'BOTTLENECK',
      annualSpend: 62000,
      singleSourceVulnerability: true,
      marketComplexity: 'HIGH',
      recommendedStrategy: 'Build 90-day buffer safety stock, search for standard footprint equivalents.',
      leadTimeDays: 60
    },
    {
      id: 'k-4',
      name: 'Corrugated Packaging & Pallet Boxes',
      category: 'Packaging',
      vendorId: 'v-104',
      vendorName: 'OmniPack Global',
      profitImpact: 22,
      supplyRisk: 18,
      quadrant: 'NON_CRITICAL',
      annualSpend: 42000,
      singleSourceVulnerability: false,
      marketComplexity: 'LOW',
      recommendedStrategy: 'Catalog standardization, blanket purchase agreements, automated e-procurement.',
      leadTimeDays: 5
    },
    {
      id: 'k-5',
      name: 'Lithium Polymer Battery Modules (48V)',
      category: 'Energy Storage',
      vendorId: 'v-105',
      vendorName: 'VoltCore Energy Systems',
      profitImpact: 84,
      supplyRisk: 76,
      quadrant: 'STRATEGIC',
      annualSpend: 290000,
      singleSourceVulnerability: true,
      marketComplexity: 'HIGH',
      recommendedStrategy: 'Direct cathode supply chain audit, dual-sourcing validation across EU/Asia.',
      leadTimeDays: 38
    },
    {
      id: 'k-6',
      name: 'Standard Stainless Steel Fasteners & Bolts',
      category: 'Hardware',
      vendorId: 'v-106',
      vendorName: 'Precision Fasteners Corp',
      profitImpact: 18,
      supplyRisk: 22,
      quadrant: 'NON_CRITICAL',
      annualSpend: 28000,
      singleSourceVulnerability: false,
      marketComplexity: 'LOW',
      recommendedStrategy: 'Consolidated vendor managed inventory (VMI) with automated bin replenishment.',
      leadTimeDays: 3
    },
    {
      id: 'k-7',
      name: 'Thermal Interface Conductive Pastes',
      category: 'Chemicals',
      vendorId: 'v-107',
      vendorName: 'AeroTherm Solutions',
      profitImpact: 32,
      supplyRisk: 72,
      quadrant: 'BOTTLENECK',
      annualSpend: 48000,
      singleSourceVulnerability: true,
      marketComplexity: 'HIGH',
      recommendedStrategy: 'Qualify secondary domestic compounder, increase inventory floor.',
      leadTimeDays: 30
    },
    {
      id: 'k-8',
      name: 'Heavy Duty Polycarbonate Housings',
      category: 'Plastics',
      vendorId: 'v-108',
      vendorName: 'PolyForm Dynamics',
      profitImpact: 72,
      supplyRisk: 28,
      quadrant: 'LEVERAGE',
      annualSpend: 180000,
      singleSourceVulnerability: false,
      marketComplexity: 'LOW',
      recommendedStrategy: 'Volume aggregation across quarterly cycles, negotiate multi-year price locks.',
      leadTimeDays: 12
    }
  ];

  const [kraljicItems, setKraljicItems] = useState<KraljicItem[]>(() => getInitial('procurement_kraljic', defaultKraljic));

  // Sync state changes to localStorage automatically
  useEffect(() => { localStorage.setItem('procurement_vendors', JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem('procurement_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('procurement_warehouses', JSON.stringify(warehouses)); }, [warehouses]);
  useEffect(() => { localStorage.setItem('procurement_requisitions', JSON.stringify(requisitions)); }, [requisitions]);
  useEffect(() => { localStorage.setItem('procurement_rfqs', JSON.stringify(rfqs)); }, [rfqs]);
  useEffect(() => { localStorage.setItem('procurement_quotations', JSON.stringify(quotations)); }, [quotations]);
  useEffect(() => { localStorage.setItem('procurement_pos', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { localStorage.setItem('procurement_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('procurement_payments', JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem('procurement_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('procurement_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('procurement_kraljic', JSON.stringify(kraljicItems)); }, [kraljicItems]);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });
  const [language, setLanguage] = useState<'EN' | 'ES' | 'FR' | 'DE' | 'HI'>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'EN' || saved === 'ES' || saved === 'FR' || saved === 'DE' || saved === 'HI') ? saved : 'EN';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    const foundUser = users.find(u => u.role === role) || users[0];
    const savedAvatar = localStorage.getItem(`procurement_user_avatar_${foundUser.id}`);
    setCurrentUser(savedAvatar ? { ...foundUser, avatar: savedAvatar } : foundUser);
    logActivity('SWITCH_ROLE', 'SYSTEM', `Switched active role to ${role}`);
  };

  const updateUserAvatar = (newAvatarUrl: string) => {
    setCurrentUser(prev => {
      const updated = { ...prev, avatar: newAvatarUrl };
      localStorage.setItem(`procurement_user_avatar_${prev.id}`, newAvatarUrl);
      return updated;
    });
    setUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? { ...u, avatar: newAvatarUrl } : u));
    logActivity('UPDATE_AVATAR', 'SYSTEM', `Updated profile avatar picture for ${currentUser.name}`);
  };

  const updateUserProfile = (updatedFields: Partial<User>) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...updatedFields };
      if (updatedFields.avatar) {
        localStorage.setItem(`procurement_user_avatar_${prev.id}`, updatedFields.avatar);
      }
      return updated;
    });
    setUsers(prevUsers => prevUsers.map(u => u.id === currentUser.id ? { ...u, ...updatedFields } : u));
    logActivity('UPDATE_PROFILE', 'SYSTEM', `Updated profile information for ${currentUser.name}`);
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

  const addToast = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastItem = {
      id,
      title,
      message,
      type,
      timestamp: Date.now()
    };
    setToasts(prev => [newToast, ...prev].slice(0, 5));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const updateKraljicItem = (id: string, updates: Partial<KraljicItem>) => {
    setKraljicItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, ...updates };
      let quadrant: KraljicQuadrant = updated.quadrant;
      if (updates.profitImpact !== undefined || updates.supplyRisk !== undefined) {
        const pHigh = updated.profitImpact >= 50;
        const rHigh = updated.supplyRisk >= 50;
        if (pHigh && rHigh) quadrant = 'STRATEGIC';
        else if (!pHigh && rHigh) quadrant = 'BOTTLENECK';
        else if (pHigh && !rHigh) quadrant = 'LEVERAGE';
        else quadrant = 'NON_CRITICAL';
      }
      return { ...updated, quadrant };
    }));
    logActivity('UPDATE_KRALJIC', 'SYSTEM', `Updated strategic positioning for item ${id}`);
    addToast('Strategic Portfolio Updated', 'Supplier risk coordinates updated in Kraljic portfolio.', 'success');
  };

  const awardReverseAuction = (
    rfqTitle: string, 
    winningVendor: { id: string; name: string }, 
    winningAmount: number,
    items?: any[]
  ) => {
    const poNumber = `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      vendorId: winningVendor.id,
      vendorName: winningVendor.name,
      items: items && items.length > 0 ? items : [
        {
          productName: rfqTitle,
          quantity: 1,
          unitPrice: winningAmount,
          totalPrice: winningAmount
        }
      ],
      subtotal: winningAmount * 0.82,
      tax: winningAmount * 0.18,
      totalAmount: winningAmount,
      status: 'APPROVED',
      issueDate: new Date().toISOString().substring(0, 10),
      expectedDeliveryDate: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
      approvedBy: currentUser.name,
      shippingAddress: 'Central Godown Warehouse 01, Sector 4, Silicon Valley Industrial Estate',
      paymentTerms: 'Net 30 Days'
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    logActivity('AWARD_REVERSE_AUCTION', 'PROCUREMENT', `Awarded e-Auction contract for "${rfqTitle}" to ${winningVendor.name} at $${winningAmount.toLocaleString()} (${poNumber})`);
    
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: 'e-Auction Contract Awarded',
      message: `Contract for "${rfqTitle}" awarded to ${winningVendor.name}. Purchase order ${poNumber} automatically approved.`,
      type: 'SUCCESS',
      roleTarget: 'PROCUREMENT_MANAGER',
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    addToast('e-Auction Contract Awarded', `Purchase Order ${poNumber} issued to ${winningVendor.name}`, 'success');
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
      t: (key: string) => getTranslation(key, language),
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
      updateUserAvatar,
      updateUserProfile,
      logActivity,
      markNotificationRead,
      clearAllNotifications,
      toasts,
      addToast,
      removeToast,
      kraljicItems,
      updateKraljicItem,
      awardReverseAuction
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

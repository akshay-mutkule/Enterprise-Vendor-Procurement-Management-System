export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'PROCUREMENT_MANAGER' 
  | 'FINANCE_MANAGER' 
  | 'WAREHOUSE_MANAGER' 
  | 'VENDOR' 
  | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  vendorId?: string;
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLACKLISTED';

export interface VendorDocument {
  id: string;
  name: string;
  type: 'TAX_GST' | 'BANK_LETTER' | 'BUSINESS_LICENSE' | 'ISO_CERT' | 'OTHER';
  url: string;
  uploadDate: string;
  verified: boolean;
}

export interface Vendor {
  id: string;
  code: string;
  name: string;
  category: string;
  contactEmail: string;
  phone: string;
  address: string;
  gstin: string;
  bankName: string;
  bankAccount: string;
  ifscCode: string;
  status: VendorStatus;
  riskScore: number; // 0 - 100 (Higher means riskier)
  rating: number; // 1.0 - 5.0
  documents: VendorDocument[];
  onboardedAt: string;
  performanceMetrics: {
    onTimeDeliveryRate: number; // percentage e.g. 96
    qualityCompliance: number; // percentage e.g. 98
    priceCompetitiveness: number; // percentage e.g. 92
  };
  notes?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  warehouseId: string;
  warehouseName?: string;
  barcode: string;
  description: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  capacity: number;
  managerName: string;
  contactNumber: string;
  currentStockCount: number;
}

export type RequisitionStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CONVERTED_TO_RFQ';

export interface RequisitionItem {
  id: string;
  productId?: string;
  productName: string;
  quantity: number;
  estimatedUnitPrice: number;
}

export interface PurchaseRequisition {
  id: string;
  reqNumber: string;
  requestedBy: string;
  department: string;
  items: RequisitionItem[];
  totalAmount: number;
  status: RequisitionStatus;
  createdDate: string;
  purpose: string;
  approvalNotes?: string;
}

export type RFQStatus = 'OPEN' | 'EVALUATING' | 'CLOSED' | 'AWARDED';

export interface RFQItem {
  id: string;
  productName: string;
  quantity: number;
  specifications: string;
}

export interface RFQ {
  id: string;
  rfqNumber: string;
  prId?: string;
  title: string;
  deadline: string;
  invitedVendorIds: string[];
  items: RFQItem[];
  status: RFQStatus;
  createdAt: string;
}

export interface QuotationItem {
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  totalPrice: number;
}

export type QuotationStatus = 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';

export interface Quotation {
  id: string;
  quoteNumber: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  deliveryTimeDays: number;
  validUntil: string;
  terms: string;
  status: QuotationStatus;
  aiRecommendationScore?: number;
  aiNotes?: string;
  submittedAt: string;
}

export type POStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ISSUED' | 'DELIVERED' | 'CANCELLED';

export interface POItem {
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  rfqId?: string;
  quotationId?: string;
  vendorId: string;
  vendorName: string;
  items: POItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: POStatus;
  issueDate: string;
  expectedDeliveryDate: string;
  approvedBy?: string;
  shippingAddress: string;
  paymentTerms: string;
}

export type InvoiceStatus = 'PENDING_VERIFICATION' | 'APPROVED' | 'PAID' | 'DISPUTED';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  poId: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  invoiceDate: string;
  dueDate: string;
  documentUrl?: string;
  status: InvoiceStatus;
  aiFraudRisk?: {
    score: number; // 0-100
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    flagReason?: string;
  };
}

export type PaymentStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  paymentMethod: 'NEFT' | 'RTGS' | 'ACH' | 'WIRE' | 'CREDIT_CARD';
  transactionRef: string;
  paymentDate: string;
  status: PaymentStatus;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  module: 'VENDOR' | 'PROCUREMENT' | 'INVENTORY' | 'FINANCE' | 'SYSTEM' | 'AI';
  details: string;
  ipAddress: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  roleTarget: string;
  timestamp: string;
  read: boolean;
}

export interface AnalyticsSummary {
  totalVendors: number;
  activeVendors: number;
  pendingApprovals: number;
  totalProcurementSpend: number;
  totalPurchaseOrders: number;
  pendingInvoicesAmount: number;
  lowStockItemsCount: number;
  onTimeDeliveryRate: number;
  avgVendorRating: number;
}

export interface AIAnalysisRequest {
  type: 'VENDOR_RISK' | 'FRAUD_DETECTION' | 'PRICE_TREND' | 'BEST_VENDOR' | 'SPEND_INSIGHTS';
  data?: any;
}

export interface AIAnalysisResponse {
  summary: string;
  insights: string[];
  recommendations: string[];
  score?: number;
  metrics?: Record<string, any>;
}

export type KraljicQuadrant = 'STRATEGIC' | 'BOTTLENECK' | 'LEVERAGE' | 'NON_CRITICAL';

export interface KraljicItem {
  id: string;
  name: string;
  category: string;
  vendorId: string;
  vendorName: string;
  profitImpact: number; // 0 - 100
  supplyRisk: number; // 0 - 100
  quadrant: KraljicQuadrant;
  annualSpend: number;
  singleSourceVulnerability: boolean;
  marketComplexity: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedStrategy: string;
  leadTimeDays: number;
}

export interface ReverseAuctionBid {
  id: string;
  vendorId: string;
  vendorName: string;
  bidAmount: number;
  timestamp: string;
  rank: number;
  deliveryDays: number;
  complianceRating: number;
}

export interface ScenarioParameters {
  rawMaterialInflation: number;
  freightTariffSurge: number;
  fxVolatility: number;
  leadTimeSlippageDays: number;
  inventoryBufferMultiplier: number;
}

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: number;
}

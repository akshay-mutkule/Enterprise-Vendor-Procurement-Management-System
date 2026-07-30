import { 
  User, Vendor, Product, Warehouse, PurchaseRequisition, 
  RFQ, Quotation, PurchaseOrder, Invoice, Payment, 
  AuditLog, SystemNotification 
} from '../types';

export const initialUsers: User[] = [
  {
    id: 'usr-1',
    name: 'Eleanor Vance',
    email: 'admin@nexusprocure.com',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'ACTIVE'
  },
  {
    id: 'usr-2',
    name: 'Marcus Sterling',
    email: 'marcus.procure@nexusprocure.com',
    role: 'PROCUREMENT_MANAGER',
    department: 'Global Sourcing',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'ACTIVE'
  },
  {
    id: 'usr-3',
    name: 'Sophia Chen',
    email: 'sophia.finance@nexusprocure.com',
    role: 'FINANCE_MANAGER',
    department: 'Accounts & Treasury',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    status: 'ACTIVE'
  },
  {
    id: 'usr-4',
    name: 'Devon Miller',
    email: 'devon.warehouse@nexusprocure.com',
    role: 'WAREHOUSE_MANAGER',
    department: 'Supply Chain Operations',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    status: 'ACTIVE'
  },
  {
    id: 'usr-5',
    name: 'Apex Components Ltd (Rep)',
    email: 'sales@apexcomponents.com',
    role: 'VENDOR',
    vendorId: 'v-101',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    status: 'ACTIVE'
  },
  {
    id: 'usr-6',
    name: 'Arthur Pendelton',
    email: 'arthur.emp@nexusprocure.com',
    role: 'EMPLOYEE',
    department: 'Hardware Engineering',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    status: 'ACTIVE'
  }
];

export const initialVendors: Vendor[] = [
  {
    id: 'v-101',
    code: 'VEN-APEX-01',
    name: 'Apex Components Ltd',
    category: 'Electronics & Microchips',
    contactEmail: 'sales@apexcomponents.com',
    phone: '+1 (555) 234-8901',
    address: '450 Semiconductor Way, San Jose, CA',
    gstin: '27AAACA12341ZP',
    bankName: 'Silicon Valley Commercial Bank',
    bankAccount: '•••• 7890',
    ifscCode: 'SVCB000189',
    status: 'APPROVED',
    riskScore: 12,
    rating: 4.8,
    onboardedAt: '2024-02-15',
    performanceMetrics: {
      onTimeDeliveryRate: 98.2,
      qualityCompliance: 99.1,
      priceCompetitiveness: 94.5
    },
    documents: [
      { id: 'doc-1', name: 'Tax_Registration_2025.pdf', type: 'TAX_GST', url: '#', uploadDate: '2025-01-10', verified: true },
      { id: 'doc-2', name: 'ISO_9001_Quality_Cert.pdf', type: 'ISO_CERT', url: '#', uploadDate: '2025-02-01', verified: true }
    ],
    notes: 'Primary strategic tier-1 vendor for silicon components. Excellent SLAs.'
  },
  {
    id: 'v-102',
    code: 'VEN-METRO-02',
    name: 'Metro Packaging & Container Corp',
    category: 'Packaging & Freight Logistics',
    contactEmail: 'orders@metropack.com',
    phone: '+1 (555) 891-2345',
    address: '1200 Logistics Pkwy, Chicago, IL',
    gstin: '19BBBPM98762ZQ',
    bankName: 'JPMorgan Chase Bank',
    bankAccount: '•••• 4321',
    ifscCode: 'CHAS000451',
    status: 'APPROVED',
    riskScore: 24,
    rating: 4.3,
    onboardedAt: '2024-06-20',
    performanceMetrics: {
      onTimeDeliveryRate: 92.0,
      qualityCompliance: 96.0,
      priceCompetitiveness: 91.0
    },
    documents: [
      { id: 'doc-3', name: 'Bank_Verification_Letter.pdf', type: 'BANK_LETTER', url: '#', uploadDate: '2024-06-21', verified: true }
    ]
  },
  {
    id: 'v-103',
    code: 'VEN-QUANT-03',
    name: 'Quantum Precision Tools Inc',
    category: 'Industrial Machinery',
    contactEmail: 'info@quantumtools.io',
    phone: '+1 (555) 432-1098',
    address: '88 Tech Park Drive, Austin, TX',
    gstin: '36CCCQT45673ZR',
    bankName: 'Bank of America',
    bankAccount: '•••• 9912',
    ifscCode: 'BOFA000982',
    status: 'APPROVED',
    riskScore: 45,
    rating: 3.9,
    onboardedAt: '2024-09-05',
    performanceMetrics: {
      onTimeDeliveryRate: 85.5,
      qualityCompliance: 93.0,
      priceCompetitiveness: 88.0
    },
    documents: [
      { id: 'doc-4', name: 'Business_License_2025.pdf', type: 'BUSINESS_LICENSE', url: '#', uploadDate: '2024-09-06', verified: true }
    ],
    notes: 'Delayed delivery flag logged twice in Q1.'
  },
  {
    id: 'v-104',
    code: 'VEN-GLOBAL-04',
    name: 'Global Metal Supplies (Pending Approval)',
    category: 'Raw Metals & Steel',
    contactEmail: 'bids@globalmetals.com',
    phone: '+1 (555) 678-3412',
    address: '90 Harbor Blvd, Houston, TX',
    gstin: '48DDDGM89014ZS',
    bankName: 'Wells Fargo',
    bankAccount: '•••• 3344',
    ifscCode: 'WFGO000122',
    status: 'PENDING',
    riskScore: 58,
    rating: 3.5,
    onboardedAt: '2026-07-01',
    performanceMetrics: {
      onTimeDeliveryRate: 80.0,
      qualityCompliance: 90.0,
      priceCompetitiveness: 95.0
    },
    documents: [
      { id: 'doc-5', name: 'GST_Certificate_2026.pdf', type: 'TAX_GST', url: '#', uploadDate: '2026-07-02', verified: false }
    ],
    notes: 'Document verification pending compliance check.'
  },
  {
    id: 'v-105',
    code: 'VEN-VORTEX-05',
    name: 'Vortex Chemical Solutions',
    category: 'Raw Materials & Solvents',
    contactEmail: 'contact@vortexchem.com',
    phone: '+1 (555) 777-1122',
    address: '33 Chemical Way, Newark, NJ',
    gstin: '34EEEVX11225ZT',
    bankName: 'Citibank N.A.',
    bankAccount: '•••• 5566',
    ifscCode: 'CITI000019',
    status: 'BLACKLISTED',
    riskScore: 89,
    rating: 2.1,
    onboardedAt: '2023-11-12',
    performanceMetrics: {
      onTimeDeliveryRate: 60.0,
      qualityCompliance: 71.0,
      priceCompetitiveness: 82.0
    },
    documents: [],
    notes: 'Blacklisted due to failure to comply with safety compliance audit.'
  }
];

export const initialWarehouses: Warehouse[] = [
  {
    id: 'wh-1',
    code: 'WH-CENTRAL-01',
    name: 'Main Central Logistics Hub',
    location: 'Building A, Industrial Zone, Dallas, TX',
    capacity: 50000,
    currentStockCount: 34200,
    managerName: 'Devon Miller',
    contactNumber: '+1 (555) 901-2233'
  },
  {
    id: 'wh-2',
    code: 'WH-COASTAL-02',
    name: 'West Coast Distribution Center',
    location: 'Pier 42, Bay Logistics Park, Oakland, CA',
    capacity: 30000,
    currentStockCount: 18900,
    managerName: 'Samantha Vance',
    contactNumber: '+1 (555) 901-4455'
  },
  {
    id: 'wh-3',
    code: 'WH-EAST-03',
    name: 'East Coast Assembly & Fulfillment',
    location: 'Sector 9, Cargo Terminal, Newark, NJ',
    capacity: 25000,
    currentStockCount: 12400,
    managerName: 'Harold Schmidt',
    contactNumber: '+1 (555) 901-6677'
  }
];

export const initialProducts: Product[] = [
  {
    id: 'p-101',
    sku: 'SKU-ARM-C9',
    name: 'Cortex-M9 High Performance Microcontroller',
    category: 'Electronics & Microchips',
    unit: 'Units',
    unitPrice: 42.50,
    stockQuantity: 450,
    reorderLevel: 800,
    warehouseId: 'wh-1',
    warehouseName: 'Main Central Logistics Hub',
    barcode: '8901234567890',
    description: '32-bit ARM Cortex M9 processor for IoT industrial control modules.'
  },
  {
    id: 'p-102',
    sku: 'SKU-SEN-TEMP',
    name: 'Precision Industrial Thermal Sensor Array',
    category: 'Sensory Modules',
    unit: 'Units',
    unitPrice: 18.20,
    stockQuantity: 1200,
    reorderLevel: 500,
    warehouseId: 'wh-1',
    warehouseName: 'Main Central Logistics Hub',
    barcode: '8901234567891',
    description: 'High accuracy thermal sensor rated -40°C to 250°C.'
  },
  {
    id: 'p-103',
    sku: 'SKU-BOX-CORR',
    name: 'Heavy Duty Reinforced Corrugated Crates',
    category: 'Packaging & Freight Logistics',
    unit: 'Packs (100pcs)',
    unitPrice: 125.00,
    stockQuantity: 180,
    reorderLevel: 250,
    warehouseId: 'wh-2',
    warehouseName: 'West Coast Distribution Center',
    barcode: '8901234567892',
    description: 'Double-walled export grade corrugated shipping containers.'
  },
  {
    id: 'p-104',
    sku: 'SKU-CNC-BIT-8',
    name: 'Titanium Carbide 8mm CNC Router Bits',
    category: 'Industrial Tools',
    unit: 'Sets (10pcs)',
    unitPrice: 89.90,
    stockQuantity: 45,
    reorderLevel: 100,
    warehouseId: 'wh-3',
    warehouseName: 'East Coast Assembly & Fulfillment',
    barcode: '8901234567893',
    description: 'Ultra-durable carbide router bits for precision aluminum milling.'
  },
  {
    id: 'p-105',
    sku: 'SKU-POWR-SUP-24V',
    name: '24V 15A DIN-Rail Industrial Power Supply',
    category: 'Electronics & Microchips',
    unit: 'Units',
    unitPrice: 64.00,
    stockQuantity: 920,
    reorderLevel: 300,
    warehouseId: 'wh-1',
    warehouseName: 'Main Central Logistics Hub',
    barcode: '8901234567894',
    description: 'Regulated switching power module with overload protection.'
  }
];

export const initialRequisitions: PurchaseRequisition[] = [
  {
    id: 'pr-1001',
    reqNumber: 'PR-2026-089',
    requestedBy: 'Arthur Pendelton',
    department: 'Hardware Engineering',
    items: [
      { id: 'pri-1', productId: 'p-101', productName: 'Cortex-M9 High Performance Microcontroller', quantity: 1000, estimatedUnitPrice: 42.50 },
      { id: 'pri-2', productId: 'p-105', productName: '24V 15A DIN-Rail Industrial Power Supply', quantity: 200, estimatedUnitPrice: 64.00 }
    ],
    totalAmount: 55300.00,
    status: 'APPROVED',
    createdDate: '2026-07-20',
    purpose: 'Q3 Batch Production run for IoT Controller Series B.',
    approvalNotes: 'Approved by Marcus Sterling. Priority allocation.'
  },
  {
    id: 'pr-1002',
    reqNumber: 'PR-2026-092',
    requestedBy: 'Elena Rostova',
    department: 'Packaging & Warehouse Ops',
    items: [
      { id: 'pri-3', productId: 'p-103', productName: 'Heavy Duty Reinforced Corrugated Crates', quantity: 150, estimatedUnitPrice: 125.00 }
    ],
    totalAmount: 18750.00,
    status: 'PENDING_APPROVAL',
    createdDate: '2026-07-28',
    purpose: 'Stock replenishment for West Coast shipment buffer.'
  }
];

export const initialRFQs: RFQ[] = [
  {
    id: 'rfq-201',
    rfqNumber: 'RFQ-2026-044',
    prId: 'pr-1001',
    title: 'Sourcing 1,000x Cortex-M9 Microcontrollers & Power Modules',
    deadline: '2026-08-05',
    invitedVendorIds: ['v-101', 'v-103', 'v-104'],
    items: [
      { id: 'rfqi-1', productName: 'Cortex-M9 High Performance Microcontroller', quantity: 1000, specifications: 'Tape & Reel packaging, Grade 1 Automotive' },
      { id: 'rfqi-2', productName: '24V 15A DIN-Rail Industrial Power Supply', quantity: 200, specifications: 'CE & UL certified 24V DC output' }
    ],
    status: 'EVALUATING',
    createdAt: '2026-07-22'
  }
];

export const initialQuotations: Quotation[] = [
  {
    id: 'q-301',
    quoteNumber: 'QT-APEX-991',
    rfqId: 'rfq-201',
    vendorId: 'v-101',
    vendorName: 'Apex Components Ltd',
    items: [
      { productId: 'p-101', productName: 'Cortex-M9 High Performance Microcontroller', quantity: 1000, unitPrice: 40.00, taxRate: 18, totalPrice: 47200.00 },
      { productId: 'p-105', productName: '24V 15A DIN-Rail Industrial Power Supply', quantity: 200, unitPrice: 60.00, taxRate: 18, totalPrice: 14160.00 }
    ],
    subtotal: 52000.00,
    tax: 9360.00,
    totalAmount: 61360.00,
    deliveryTimeDays: 7,
    validUntil: '2026-08-15',
    terms: 'Net 30 days payment upon delivery and quality inspection.',
    status: 'SUBMITTED',
    aiRecommendationScore: 94.5,
    aiNotes: 'Lowest lead time (7 days) and highest historic quality score (99.1%). Highly recommended.',
    submittedAt: '2026-07-24'
  },
  {
    id: 'q-302',
    quoteNumber: 'QT-QUANT-412',
    rfqId: 'rfq-201',
    vendorId: 'v-103',
    vendorName: 'Quantum Precision Tools Inc',
    items: [
      { productId: 'p-101', productName: 'Cortex-M9 High Performance Microcontroller', quantity: 1000, unitPrice: 41.50, taxRate: 18, totalPrice: 48970.00 },
      { productId: 'p-105', productName: '24V 15A DIN-Rail Industrial Power Supply', quantity: 200, unitPrice: 62.00, taxRate: 18, totalPrice: 14632.00 }
    ],
    subtotal: 53900.00,
    tax: 9702.00,
    totalAmount: 63602.00,
    deliveryTimeDays: 14,
    validUntil: '2026-08-10',
    terms: '50% advance, 50% on receipt.',
    status: 'SUBMITTED',
    aiRecommendationScore: 78.0,
    aiNotes: 'Price is 3.6% higher than Apex. Delivery window is 14 days.',
    submittedAt: '2026-07-25'
  }
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-501',
    poNumber: 'PO-2026-0081',
    rfqId: 'rfq-201',
    quotationId: 'q-301',
    vendorId: 'v-101',
    vendorName: 'Apex Components Ltd',
    items: [
      { productId: 'p-101', productName: 'Cortex-M9 High Performance Microcontroller', quantity: 1000, unitPrice: 40.00, totalPrice: 40000.00 },
      { productId: 'p-105', productName: '24V 15A DIN-Rail Industrial Power Supply', quantity: 200, unitPrice: 60.00, totalPrice: 12000.00 }
    ],
    subtotal: 52000.00,
    tax: 9360.00,
    totalAmount: 61360.00,
    status: 'ISSUED',
    issueDate: '2026-07-26',
    expectedDeliveryDate: '2026-08-02',
    approvedBy: 'Marcus Sterling',
    shippingAddress: 'Main Central Logistics Hub, Dock 4, Dallas, TX',
    paymentTerms: 'Net 30 Days'
  },
  {
    id: 'po-502',
    poNumber: 'PO-2026-0075',
    vendorId: 'v-102',
    vendorName: 'Metro Packaging & Container Corp',
    items: [
      { productId: 'p-103', productName: 'Heavy Duty Reinforced Corrugated Crates', quantity: 100, unitPrice: 120.00, totalPrice: 12000.00 }
    ],
    subtotal: 12000.00,
    tax: 2160.00,
    totalAmount: 14160.00,
    status: 'DELIVERED',
    issueDate: '2026-07-10',
    expectedDeliveryDate: '2026-07-18',
    approvedBy: 'Marcus Sterling',
    shippingAddress: 'West Coast Distribution Center, Oakland, CA',
    paymentTerms: 'Net 15 Days'
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv-801',
    invoiceNumber: 'INV-2026-9901',
    poId: 'po-501',
    poNumber: 'PO-2026-0081',
    vendorId: 'v-101',
    vendorName: 'Apex Components Ltd',
    subtotal: 52000.00,
    taxAmount: 9360.00,
    totalAmount: 61360.00,
    invoiceDate: '2026-07-27',
    dueDate: '2026-08-26',
    documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
    status: 'PENDING_VERIFICATION',
    aiFraudRisk: {
      score: 8,
      riskLevel: 'LOW',
      flagReason: 'Line items match 100% with PO-2026-0081. Bank account verified.'
    }
  },
  {
    id: 'inv-802',
    invoiceNumber: 'INV-2026-8812',
    poId: 'po-502',
    poNumber: 'PO-2026-0075',
    vendorId: 'v-102',
    vendorName: 'Metro Packaging & Container Corp',
    subtotal: 12000.00,
    taxAmount: 2160.00,
    totalAmount: 14160.00,
    invoiceDate: '2026-07-18',
    dueDate: '2026-08-02',
    documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
    status: 'APPROVED',
    aiFraudRisk: {
      score: 14,
      riskLevel: 'LOW'
    }
  }
];

export const initialPayments: Payment[] = [
  {
    id: 'pay-901',
    paymentNumber: 'PAY-2026-0041',
    invoiceId: 'inv-802',
    invoiceNumber: 'INV-2026-8812',
    vendorId: 'v-102',
    vendorName: 'Metro Packaging & Container Corp',
    amount: 14160.00,
    paymentMethod: 'ACH',
    transactionRef: 'ACH-TRX-9012491',
    paymentDate: '2026-07-22',
    status: 'COMPLETED'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-07-29 14:22:10',
    userId: 'usr-2',
    userName: 'Marcus Sterling',
    role: 'PROCUREMENT_MANAGER',
    action: 'APPROVED_PURCHASE_ORDER',
    module: 'PROCUREMENT',
    details: 'Approved PO-2026-0081 for Apex Components Ltd ($61,360.00)',
    ipAddress: '192.168.1.45'
  },
  {
    id: 'log-2',
    timestamp: '2026-07-28 11:05:32',
    userId: 'usr-3',
    userName: 'Sophia Chen',
    role: 'FINANCE_MANAGER',
    action: 'VERIFIED_INVOICE',
    module: 'FINANCE',
    details: 'Verified and marked INV-2026-8812 as APPROVED for payment processing',
    ipAddress: '192.168.1.88'
  },
  {
    id: 'log-3',
    timestamp: '2026-07-27 09:14:00',
    userId: 'usr-1',
    userName: 'Eleanor Vance',
    role: 'SUPER_ADMIN',
    action: 'AI_RISK_AUDIT_RAN',
    module: 'AI',
    details: 'Executed AI Risk Analysis across all active vendor profiles. 1 vendor flagged.',
    ipAddress: '192.168.1.10'
  }
];

export const initialNotifications: SystemNotification[] = [
  {
    id: 'notif-1',
    title: 'Low Stock Alert: Cortex-M9',
    message: 'Stock level for SKU-ARM-C9 (450 units) fell below reorder threshold (800 units).',
    type: 'WARNING',
    roleTarget: 'WAREHOUSE_MANAGER',
    timestamp: '10 mins ago',
    read: false
  },
  {
    id: 'notif-2',
    title: 'Invoice Submitted by Apex Components',
    message: 'Invoice INV-2026-9901 for PO-2026-0081 submitted ($61,360.00). Pending Verification.',
    type: 'INFO',
    roleTarget: 'FINANCE_MANAGER',
    timestamp: '2 hours ago',
    read: false
  },
  {
    id: 'notif-3',
    title: 'Quotation Received for RFQ-2026-044',
    message: 'Apex Components Ltd submitted a quotation with score 94.5%.',
    type: 'SUCCESS',
    roleTarget: 'PROCUREMENT_MANAGER',
    timestamp: '1 day ago',
    read: true
  }
];

import React, { useState } from 'react';
import { 
  Terminal, Database, Cpu, GitBranch, Server, FileCode, Check, Copy, BookOpen 
} from 'lucide-react';

export const DeveloperHubView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ER_DIAGRAM' | 'API_DOCS' | 'DEVOPS' | 'INTERVIEW'>('ER_DIAGRAM');
  const [copied, setCopied] = useState(false);

  const samplePostmanCollection = {
    info: {
      name: "Nexus Procurement Enterprise REST API",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: [
      { name: "POST /api/auth/login", request: { method: "POST", body: { mode: "raw", raw: "{\n  \"email\": \"admin@nexusprocure.com\",\n  \"password\": \"••••••••\"\n}" } } },
      { name: "GET /api/vendors", request: { method: "GET" } },
      { name: "POST /api/ai/analyze", request: { method: "POST", body: { mode: "raw", raw: "{\n  \"type\": \"VENDOR_RISK\",\n  \"payload\": {\n    \"vendorId\": \"v-101\"\n  }\n}" } } }
    ]
  };

  const copyPostman = () => {
    navigator.clipboard.writeText(JSON.stringify(samplePostmanCollection, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium mb-2">
            <Terminal className="w-3 h-3" />
            Developer & Software Architect Hub
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">System Architecture & API Specs</h2>
          <p className="text-xs text-slate-300 mt-1">
            Normalized MySQL ER Schema, REST OpenAPI / Postman Specs, Docker DevOps CI/CD, and Senior Engineering Q&A.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-6">
        <button
          onClick={() => setActiveTab('ER_DIAGRAM')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ER_DIAGRAM' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400'}`}
        >
          <Database className="w-4 h-4" /> MySQL ER Diagram & Schema
        </button>
        <button
          onClick={() => setActiveTab('API_DOCS')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'API_DOCS' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400'}`}
        >
          <FileCode className="w-4 h-4" /> Swagger & Postman Collection
        </button>
        <button
          onClick={() => setActiveTab('DEVOPS')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'DEVOPS' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400'}`}
        >
          <Server className="w-4 h-4" /> Docker & CI/CD Pipelines
        </button>
        <button
          onClick={() => setActiveTab('INTERVIEW')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'INTERVIEW' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400'}`}
        >
          <BookOpen className="w-4 h-4" /> Senior Architecture Q&A
        </button>
      </div>

      {/* Tab 1: ER Diagram & Schema */}
      {activeTab === 'ER_DIAGRAM' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl border border-slate-800 space-y-4 font-mono text-xs shadow-xl">
            <h3 className="text-sm font-bold text-indigo-400 font-sans flex items-center gap-2">
              <Database className="w-4 h-4" /> Relational Database Entity-Relationship Mapping (MySQL 8.0)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-emerald-400 block border-b border-slate-800 pb-1">TABLE: users</span>
                <p className="text-[11px] text-slate-400">id (PK, VARCHAR 36)</p>
                <p className="text-[11px] text-slate-400">email (UNIQUE, VARCHAR 255)</p>
                <p className="text-[11px] text-slate-400">password_hash (VARCHAR 255)</p>
                <p className="text-[11px] text-slate-400">role_enum ('SUPER_ADMIN', 'PROCUREMENT', ...)</p>
                <p className="text-[11px] text-slate-400">vendor_id (FK -&gt; vendors.id, NULLABLE)</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-indigo-400 block border-b border-slate-800 pb-1">TABLE: vendors</span>
                <p className="text-[11px] text-slate-400">id (PK, VARCHAR 36)</p>
                <p className="text-[11px] text-slate-400">code (UNIQUE VARCHAR 50)</p>
                <p className="text-[11px] text-slate-400">legal_name (VARCHAR 255)</p>
                <p className="text-[11px] text-slate-400">gstin_number (VARCHAR 50)</p>
                <p className="text-[11px] text-slate-400">risk_score (INT DEFAULT 0)</p>
                <p className="text-[11px] text-slate-400">status ('PENDING', 'APPROVED', 'BLACKLISTED')</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-amber-400 block border-b border-slate-800 pb-1">TABLE: purchase_orders</span>
                <p className="text-[11px] text-slate-400">id (PK, VARCHAR 36)</p>
                <p className="text-[11px] text-slate-400">po_number (UNIQUE VARCHAR 50)</p>
                <p className="text-[11px] text-slate-400">vendor_id (FK -&gt; vendors.id)</p>
                <p className="text-[11px] text-slate-400">rfq_id (FK -&gt; rfqs.id)</p>
                <p className="text-[11px] text-slate-400">total_amount (DECIMAL 12, 2)</p>
                <p className="text-[11px] text-slate-400">status ('ISSUED', 'DELIVERED', 'CANCELLED')</p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400">
              <span className="text-indigo-400 font-bold block mb-1">Foreign Key Constraints:</span>
              - FK_po_vendor: purchase_orders(vendor_id) REFERENCES vendors(id) ON DELETE RESTRICT<br/>
              - FK_invoice_po: invoices(po_id) REFERENCES purchase_orders(id) ON DELETE RESTRICT<br/>
              - FK_product_warehouse: products(warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: API Specs */}
      {activeTab === 'API_DOCS' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-600" /> Postman Collection v2.1 (JSON Export)
            </h3>
            <button
              onClick={copyPostman}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Collection JSON'}
            </button>
          </div>

          <pre className="p-4 bg-slate-900 text-indigo-300 rounded-xl text-[11px] font-mono overflow-x-auto max-h-96">
            {JSON.stringify(samplePostmanCollection, null, 2)}
          </pre>
        </div>
      )}

      {/* Tab 3: DevOps */}
      {activeTab === 'DEVOPS' && (
        <div className="space-y-4 text-xs">
          <div className="bg-slate-900 text-slate-200 p-5 rounded-xl border border-slate-800 space-y-3 font-mono">
            <h4 className="font-bold text-emerald-400 font-sans">Dockerfile (Production Multi-Stage Build)</h4>
            <pre className="text-[11px] text-slate-400 overflow-x-auto">
{`FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "dist/server.cjs"]`}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 4: Senior Architecture Q&A */}
      {activeTab === 'INTERVIEW' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4 text-xs">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Senior Software Architect Interview Reference</h3>
          
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Q: How do you guarantee idempotency and prevent duplicate payments in high-throughput AP systems?</h4>
              <p className="text-slate-600 dark:text-slate-300 mt-1">
                A: We enforce unique idempotency keys (derived from MD5 hash of `vendor_id + invoice_number + amount`) at the REST API gateway layer, combined with database level unique constraints on `invoices(po_id, invoice_number)`. Distributed locks (Redis Redlock or DB row locks) ensure concurrent payment disbursements cannot execute duplicate transfers.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Q: How does the system isolate client secrets and Gemini AI API keys?</h4>
              <p className="text-slate-600 dark:text-slate-300 mt-1">
                A: In strict compliance with security standards, all Gemini API calls and third-party credentials run server-side inside `server.ts` using `process.env.GEMINI_API_KEY` and `@google/genai` SDK. Secrets are never bundled or transmitted to the browser context.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

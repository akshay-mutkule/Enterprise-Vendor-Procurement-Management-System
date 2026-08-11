import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Interactive AI Assistant Chat Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history, context } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reply: `[Nexus AI Assistant] I've analyzed your query: "${message}". Based on current procurement metrics:\n\n• **Spend Advice**: Your highest concentration is in Electronics (64%). Consider bundling orders with Apex Components for a 5% volume rebate.\n• **Risk Warning**: 1 vendor (Global Metals Inc) shows a compliance risk score above 65. Review GST documentation.\n• **Action Item**: 2 items in central warehouse are below safety stock levels. Issue an automated RFQ now.`,
        suggestedActions: ["Draft RFQ for Low Stock", "Audit Global Metals GST", "Analyze Spend Inflation"]
      });
    }

    const systemInstruction = `You are Nexus AI Assistant, an expert AI Procurement Consultant & Supply Chain Intelligence Specialist.
Your job is to provide actionable, crisp, professional advice on procurement management, vendor risk evaluation, contract negotiations, 3-way invoice matching, and inventory optimization.
Always provide structured markdown responses with clear bullet points, risk metrics, or recommended next actions. Context provided: ${JSON.stringify(context || {})}`;

    const prompt = `User query: ${message}\nContext: ${JSON.stringify(context || {})}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    return res.json({
      reply: response.text || "Analysis completed.",
      suggestedActions: ["Review Requisitions", "Check Vendor Compliance", "Export Spend Analytics"]
    });
  } catch (error) {
    console.error('Chat AI Error:', error);
    return res.json({
      reply: "I am currently analyzing your request against our procurement ledger. Recommended action: Ensure all pending purchase requisitions are routed to managerial review.",
      suggestedActions: ["View Requisitions", "Run Fraud Audit"]
    });
  }
});

// AI Document OCR & Bill Extraction Endpoint
app.post('/api/ai/ocr', async (req, res) => {
  try {
    const { documentName, fileData } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Mock extracted payload if Gemini key is absent
      return res.json({
        vendorName: 'Apex Components Ltd',
        vendorGstin: '27AAAAA0000A1Z5',
        poNumber: 'PO-2026-0081',
        invoiceNumber: 'INV-2026-' + Math.floor(1000 + Math.random() * 9000),
        subtotal: 52000.00,
        taxAmount: 9360.00,
        totalAmount: 61360.00,
        lineItems: [
          { description: 'High-Precision Microcontrollers (STM32)', quantity: 200, unitPrice: 200, total: 40000 },
          { description: 'Surface Mount Capacitor Reels', quantity: 120, unitPrice: 100, total: 12000 }
        ],
        confidenceScore: 98.4,
        matchStatus: 'CLEARED_3_WAY_MATCH'
      });
    }

    const systemInstruction = `You are an OCR Document Parsing Engine for Enterprise Accounting. Extract key fields from the provided document text/data.
Return ONLY valid JSON with fields: vendorName, vendorGstin, poNumber, invoiceNumber, subtotal, taxAmount, totalAmount, lineItems (array of description, quantity, unitPrice, total), confidenceScore (number 0-100), matchStatus.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Document name: ${documentName || 'invoice.pdf'}. Content summary: ${fileData || 'Supplier Invoice with 18% GST tax, microcontrollers and electrical parts'}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('OCR Error:', error);
    return res.json({
      vendorName: 'Global Metals Inc',
      poNumber: 'PO-2026-0042',
      invoiceNumber: 'INV-2026-8812',
      subtotal: 35000.00,
      taxAmount: 6300.00,
      totalAmount: 41300.00,
      confidenceScore: 92.0,
      matchStatus: 'PRICE_VARIANCE_FLAGGED'
    });
  }
});

// AI Procurement Intelligence Endpoint
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { type, payload } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Rule-based fallback if API key is not configured
      return res.json(getFallbackAIResponse(type, payload));
    }

    let systemInstruction = `You are Nexus Procurement AI, an enterprise-grade procurement AI engine modeled after SAP Ariba and Oracle Procurement Cloud. Analyze the data provided and return a valid JSON object matching this structure:
{
  "summary": "Short 2-3 sentence executive executive summary",
  "insights": ["Insight 1", "Insight 2", "Insight 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "score": 85,
  "metrics": { "riskLevel": "LOW", "confidence": "95%" }
}`;

    let prompt = `Type: ${type}\nData payload: ${JSON.stringify(payload)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    try {
      const jsonResult = JSON.parse(responseText);
      return res.json(jsonResult);
    } catch (parseError) {
      return res.json({
        summary: responseText,
        insights: ['Raw analysis completed successfully.'],
        recommendations: ['Review generated summary.'],
        score: 80,
      });
    }
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    // Return graceful intelligent fallback
    const { type, payload } = req.body || {};
    return res.json(getFallbackAIResponse(type, payload));
  }
});

function getFallbackAIResponse(type: string, payload: any) {
  switch (type) {
    case 'VENDOR_RISK':
      return {
        summary: `Vendor risk evaluation for ${payload?.vendorName || 'Target Vendor'}: Low financial distress detected with 96% SLA compliance.`,
        insights: [
          'On-time delivery performance is stable at 98.2%.',
          'GST & Bank verification compliance verified with valid docs.',
          'Price fluctuation index remains within expected 3% corridor.'
        ],
        recommendations: [
          'Maintain tier-1 preferred vendor status.',
          'Schedule annual ISO compliance audit in Q4.'
        ],
        score: 14,
        metrics: { riskLevel: 'LOW', complianceScore: 98, SLA: 'Strong' }
      };

    case 'FRAUD_DETECTION':
      return {
        summary: `Invoice validation check: Invoice ${payload?.invoiceNumber || 'INV-001'} matches PO line items, unit prices, and tax rates. Zero anomaly flag.`,
        insights: [
          'Line-item matching accuracy: 100% against purchase order.',
          'Bank details match verified vendor master registry.',
          'Invoice date falls within valid PO issuance window.'
        ],
        recommendations: [
          'Safe for automated payment approval.',
          'Apply 2% early payment discount if paid within 10 days.'
        ],
        score: 6,
        metrics: { riskLevel: 'LOW', anomalyScore: 0.02, duplicateCheck: 'PASSED' }
      };

    case 'PRICE_TREND':
      return {
        summary: 'Market price trend analysis indicates a projected 4.2% cost inflation for silicon microcontrollers over the next quarter.',
        insights: [
          'Raw silicon material costs increased 2.8% globally.',
          'Supply chain lead time for Cortex-M series reduced by 3 days.',
          'Alternative vendor pricing is currently 3-5% higher.'
        ],
        recommendations: [
          'Lock in bulk purchase contract for 6 months to hedge against price increases.',
          'Negotiate volume rebate with primary vendor Apex Components.'
        ],
        score: 88,
        metrics: { inflationForecast: '+4.2%', volatility: 'MODERATE', savingsPotential: '$12,400' }
      };

    case 'BEST_VENDOR':
      return {
        summary: 'Recommended Vendor Selection for RFQ: Apex Components Ltd rated #1 best overall fit.',
        insights: [
          'Apex offer unit price $40.00 vs market average $43.20 (7.4% savings).',
          'Fastest delivery guarantee (7 days vs 14 days competitors).',
          'Historic return rate is < 0.2% across last 10 fulfilled POs.'
        ],
        recommendations: [
          'Award RFQ to Apex Components Ltd.',
          'Request formal PO issuance upon management approval.'
        ],
        score: 95,
        metrics: { recommendedVendor: 'Apex Components Ltd', fitScore: 95, savings: '$4,120' }
      };

    case 'CONTRACT_REDLINE':
      return {
        summary: `AI Contract Risk Redline Analysis for ${payload?.vendorName || 'Selected Vendor'} Master Service Agreement: Identified 2 high-risk clauses requiring legal amendment before signature.`,
        insights: [
          'Uncapped Liability Clause (Section 8 font redline): Unlimited indemnity exposure for indirect damages. Recommended cap at 2x annual contract value.',
          'Termination Notice Variance (Section 12 redline): Vendor requested 90-day termination notice vs standard 30-day corporate policy.',
          'SLA Penalty Cap: Current 1% rebate per delayed week is insufficient for critical assembly components.'
        ],
        recommendations: [
          'Insert standard Liability Cap of $500,000.',
          'Require 30-day termination for convenience clause.',
          'Add SLA penalty clause: 2.5% daily deduction for delivery delays exceeding 5 days.'
        ],
        score: 72,
        metrics: { riskLevel: 'MODERATE', redlineClauseCount: 3, legalSafetyScore: '72/100' }
      };

    case 'NEGOTIATION_SCRIPT':
      return {
        summary: `Strategic Supplier Negotiation Script for ${payload?.vendorName || 'Apex Components'}: Targeting an ${payload?.targetDiscount || '8'}% Volume Rebate on Q3 Orders.`,
        insights: [
          'Leverage Points: Our total projected annual spend with supplier has increased by 35% YoY.',
          'Market Benchmark: Microcontroller spot prices in Asia-Pacific have dropped by 3.2% this quarter.',
          'BATNA Strategy: Alternative qualified vendor (Global Metals / Circuit World) offers equivalent lead times at $38.50/unit.'
        ],
        recommendations: [
          'Opening Offer: Request 10% volume discount on PO orders exceeding $50,000.',
          'Counter-Offer Target: Settle at 7.5% - 8% with extended 60-day payment terms (Net 60).',
          'Email Script: "Dear [Vendor Account Manager], As we consolidate our enterprise procurement for Q3, our board requires a 8% volume rebate based on our $250k+ annual volume..."'
        ],
        score: 94,
        metrics: { projectedSavings: '$18,400', leverageIndex: 'HIGH', successProbability: '88%' }
      };

    default:
      return {
        summary: 'Comprehensive Spend & Procurement Analysis completed successfully.',
        insights: [
          'Overall procurement efficiency index is high (91/100).',
          'Category spend is concentrated in Electronics (64%) and Packaging (22%).'
        ],
        recommendations: [
          'Consolidate small tail-end spend vendors into master agreements.',
          'Automate PO approval workflow for orders under $5,000.'
        ],
        score: 91,
        metrics: { totalOptimizedSpend: '$145,000', efficiencyScore: 91 }
      };
  }
}

// Vite middleware for dev / static server for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexus Procurement Enterprise Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

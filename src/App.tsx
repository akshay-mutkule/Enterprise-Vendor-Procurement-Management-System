import React, { useState } from 'react';
import { ProcurementProvider } from './context/ProcurementContext';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { LiveTelemetryTicker } from './components/LiveTelemetryTicker';
import { DashboardView } from './components/DashboardView';
import { VendorManagementView } from './components/VendorManagementView';
import { ProcurementView } from './components/ProcurementView';
import { InventoryView } from './components/InventoryView';
import { InvoiceFinanceView } from './components/InvoiceFinanceView';
import { ContractLifecycleView } from './components/ContractLifecycleView';
import { WorkflowRuleEngineView } from './components/WorkflowRuleEngineView';
import { SupplyChainRadarView } from './components/SupplyChainRadarView';
import { AiIntelligenceView } from './components/AiIntelligenceView';
import { NotificationsView } from './components/NotificationsView';
import { ReportsView } from './components/ReportsView';
import { DeveloperHubView } from './components/DeveloperHubView';
import { AuditLogView } from './components/AuditLogView';
import { AiCopilotDrawer } from './components/AiCopilotDrawer';
import { StrategicSourcingView } from './components/StrategicSourcingView';
import { ToastContainer } from './components/ToastContainer';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />;
      case 'strategic':
        return <StrategicSourcingView />;
      case 'vendors':
        return <VendorManagementView />;
      case 'procurement':
        return <ProcurementView />;
      case 'inventory':
        return <InventoryView />;
      case 'finance':
        return <InvoiceFinanceView />;
      case 'contracts':
        return <ContractLifecycleView />;
      case 'workflows':
        return <WorkflowRuleEngineView />;
      case 'logistics':
        return <SupplyChainRadarView />;
      case 'ai':
      case 'ai-analytics' as any:
        return <AiIntelligenceView />;
      case 'notifications':
        return <NotificationsView />;
      case 'reports':
        return <ReportsView />;
      case 'developer':
      case 'dev-hub' as any:
        return <DeveloperHubView />;
      case 'audit':
        return <AuditLogView />;
      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />;
    }
  };

  return (
    <ProcurementProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-indigo-500 selection:text-white tech-dot-grid">
        
        {/* Main Header Bar */}
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
        />

        {/* Global Live Telemetry Marquee Ticker */}
        <LiveTelemetryTicker />

        {/* Body Layout: Sidebar + Main Workspace */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Navigation Sidebar */}
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            collapsed={collapsed} 
            setCollapsed={setCollapsed} 
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
            {renderActiveView()}
          </main>
          
        </div>

        {/* Global AI Copilot Floating Assistant */}
        <AiCopilotDrawer onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />

        {/* Global In-App Toast Notification Center */}
        <ToastContainer />

      </div>
    </ProcurementProvider>
  );
}

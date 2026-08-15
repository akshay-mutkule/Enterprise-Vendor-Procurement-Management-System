import React, { useState, useEffect } from 'react';
import { 
  Globe2, Navigation, AlertTriangle, ShieldCheck, Clock, 
  ArrowRight, Compass, RefreshCw, Sparkles, MapPin, Anchor, Truck, Plane,
  Layers, ChevronRight, Activity, Zap, CheckCircle2, ShieldAlert, Cpu, BarChart3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProcurement } from '../context/ProcurementContext';
import { sound } from '../utils/soundUtils';
import { formatCurrency } from '../utils/exportUtils';

interface SupplyNode {
  id: string;
  name: string;
  location: string;
  region: string;
  x: number; // SVG % coordinate 0-1000
  y: number; // SVG % coordinate 0-500
  hubType: 'SEMICONDUCTOR_FAB' | 'METALS_FOUNDRY' | 'PORT_HUB' | 'AIR_FREIGHT';
  status: 'OPTIMAL' | 'MODERATE_DELAY' | 'DISRUPTED';
  delayHours: number;
  activeShipments: number;
  riskFactor: string;
  weatherAlert: string;
  avgBerthTime: string;
  recommendedAction?: string;
  alternativeRoute?: {
    name: string;
    mode: 'AIR_EXPRESS' | 'RAIL_CORRIDOR' | 'OCEAN_BYPASS';
    timeSavedHours: number;
    costDelta: number;
    co2DeltaKg: number;
  };
}

interface ActiveShipment {
  trackingId: string;
  carrier: string;
  origin: string;
  destination: string;
  cargo: string;
  mode: 'OCEAN' | 'AIR' | 'ROAD';
  status: 'IN_TRANSIT' | 'CUSTOMS_HOLD' | 'EXPEDITED' | 'DELIVERED';
  eta: string;
  temperature: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

const initialNodes: SupplyNode[] = [
  {
    id: 'node-tw',
    name: 'Taiwan High-Tech Fab Center',
    location: 'Hsinchu Science Park, Taiwan',
    region: 'Asia-Pacific',
    x: 770,
    y: 240,
    hubType: 'SEMICONDUCTOR_FAB',
    status: 'OPTIMAL',
    delayHours: 0,
    activeShipments: 16,
    riskFactor: 'Typhoon season low alert. Lead time 6.5 days.',
    weatherAlert: 'Clear • 28°C • Wind 12 knots',
    avgBerthTime: '8.2 hrs'
  },
  {
    id: 'node-de',
    name: 'Frankfurt Central Air Cargo Gate',
    location: 'Frankfurt Airport Hub, Germany',
    region: 'Europe',
    x: 480,
    y: 160,
    hubType: 'AIR_FREIGHT',
    status: 'MODERATE_DELAY',
    delayHours: 18,
    activeShipments: 8,
    riskFactor: 'Customs queue on precision electronics & sensors.',
    weatherAlert: 'Scattered Showers • 16°C • Visibility 9km',
    avgBerthTime: '14.5 hrs',
    recommendedAction: 'Reroute high-priority microcontrollers via Munich Express Air Corridor.',
    alternativeRoute: {
      name: 'Munich Air Express Bypass',
      mode: 'AIR_EXPRESS',
      timeSavedHours: 18,
      costDelta: 1450,
      co2DeltaKg: 420
    }
  },
  {
    id: 'node-la',
    name: 'Port of Los Angeles & Long Beach',
    location: 'San Pedro Bay, USA',
    region: 'North America',
    x: 180,
    y: 200,
    hubType: 'PORT_HUB',
    status: 'DISRUPTED',
    delayHours: 68,
    activeShipments: 12,
    riskFactor: 'Drayage chassis bottleneck at Pier 400 & rail yard queue.',
    weatherAlert: 'Fog • 19°C • Port Berth Density 94%',
    avgBerthTime: '72.0 hrs',
    recommendedAction: 'Divert upcoming container vessels to Oakland or Long Beach Terminal C.',
    alternativeRoute: {
      name: 'Port of Oakland Intermodal Rail Relay',
      mode: 'RAIL_CORRIDOR',
      timeSavedHours: 48,
      costDelta: 2800,
      co2DeltaKg: -180
    }
  },
  {
    id: 'node-in',
    name: 'JNPT International Container Terminal',
    location: 'Navi Mumbai, India',
    region: 'South Asia',
    x: 650,
    y: 250,
    hubType: 'PORT_HUB',
    status: 'OPTIMAL',
    delayHours: 4,
    activeShipments: 22,
    riskFactor: 'Monsoon transit clearing at 96% throughput velocity.',
    weatherAlert: 'Light Mist • 30°C • Throughput 98.4%',
    avgBerthTime: '11.0 hrs'
  },
  {
    id: 'node-sg',
    name: 'Singapore Maritime Transshipment Hub',
    location: 'Jurong Port, Singapore',
    region: 'Southeast Asia',
    x: 730,
    y: 290,
    hubType: 'PORT_HUB',
    status: 'OPTIMAL',
    delayHours: 2,
    activeShipments: 29,
    riskFactor: 'High throughput bunkering & zero customs congestion.',
    weatherAlert: 'Tropical • 31°C • Channel Traffic Normal',
    avgBerthTime: '6.4 hrs'
  },
  {
    id: 'node-ae',
    name: 'Dubai Jebel Ali Logistics Freezone',
    location: 'Dubai, UAE',
    region: 'Middle East',
    x: 580,
    y: 220,
    hubType: 'AIR_FREIGHT',
    status: 'OPTIMAL',
    delayHours: 1,
    activeShipments: 14,
    riskFactor: 'Fast-track aerospace customs gate active.',
    weatherAlert: 'Clear • 38°C • Zero Flight Grounding',
    avgBerthTime: '4.8 hrs'
  }
];

const sampleShipments: ActiveShipment[] = [
  {
    trackingId: 'TRK-OCN-9941',
    carrier: 'Maersk Triple-E Pacific',
    origin: 'Hsinchu, Taiwan',
    destination: 'Los Angeles, USA',
    cargo: '5,000x Cortex-M7 Core Modules',
    mode: 'OCEAN',
    status: 'IN_TRANSIT',
    eta: 'Aug 22, 2026',
    temperature: '21.4°C (Normal)',
    riskLevel: 'MEDIUM'
  },
  {
    trackingId: 'TRK-AIR-7721',
    carrier: 'Lufthansa Cargo Express',
    origin: 'Frankfurt, Germany',
    destination: 'Austin Technology Hub, USA',
    cargo: '1,200x Titanium Alloy Brackets',
    mode: 'AIR',
    status: 'EXPEDITED',
    eta: 'Aug 17, 2026',
    temperature: '19.2°C (Optimal)',
    riskLevel: 'LOW'
  },
  {
    trackingId: 'TRK-OCN-4412',
    carrier: 'MSC Mediterranean Star',
    origin: 'Mumbai, India',
    destination: 'Rotterdam, Netherlands',
    cargo: '24,000x Aluminum Heat Sinks',
    mode: 'OCEAN',
    status: 'CUSTOMS_HOLD',
    eta: 'Aug 29, 2026',
    temperature: '23.8°C (Monitored)',
    riskLevel: 'HIGH'
  },
  {
    trackingId: 'TRK-ROD-1190',
    carrier: 'Nexus Autonomous Freight Fleet',
    origin: 'Long Beach Terminal, USA',
    destination: 'Central Godown Alpha, NV',
    cargo: '800x Industrial Power Units',
    mode: 'ROAD',
    status: 'IN_TRANSIT',
    eta: 'Aug 16, 2026',
    temperature: '20.5°C (Stable)',
    riskLevel: 'LOW'
  }
];

export const SupplyChainRadarView: React.FC = () => {
  const { logActivity } = useProcurement();
  const [nodes, setNodes] = useState<SupplyNode[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<SupplyNode>(initialNodes[2]); // Default to LA Disrupted
  const [shipments, setShipments] = useState<ActiveShipment[]>(sampleShipments);
  const [calculatingReroute, setCalculatingReroute] = useState(false);
  const [rerouteOutput, setRerouteOutput] = useState<{
    summary: string;
    savedHours: number;
    roiSpend: number;
    resilienceScore: number;
  } | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'DISRUPTED' | 'OPTIMAL'>('ALL');
  const [viewMode, setViewMode] = useState<'RADAR_MAP' | 'SHIPMENTS'>('RADAR_MAP');

  const filteredNodes = nodes.filter(n => {
    if (activeFilter === 'DISRUPTED') return n.status !== 'OPTIMAL';
    if (activeFilter === 'OPTIMAL') return n.status === 'OPTIMAL';
    return true;
  });

  const handleNodeSelect = (node: SupplyNode) => {
    sound.playClick();
    setSelectedNode(node);
    setRerouteOutput(null);
  };

  const handleRerouteCalc = () => {
    sound.playScan();
    setCalculatingReroute(true);
    setRerouteOutput(null);

    setTimeout(() => {
      setCalculatingReroute(false);
      sound.playSuccess();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });

      const alt = selectedNode.alternativeRoute || {
        name: 'Multimodal Express Priority Bypass',
        mode: 'AIR_EXPRESS' as const,
        timeSavedHours: selectedNode.delayHours > 0 ? selectedNode.delayHours - 4 : 24,
        costDelta: 1850,
        co2DeltaKg: 310
      };

      setRerouteOutput({
        summary: `Nexus Neural Reroute executed for ${selectedNode.name}. Diverting active consignments via ${alt.name} recovers ${alt.timeSavedHours} hours of terminal delay at an incremental operational delta of +${formatCurrency(alt.costDelta)}.`,
        savedHours: alt.timeSavedHours,
        roiSpend: 14200,
        resilienceScore: 96.4
      });

      logActivity('SIMULATE_REROUTE', 'SYSTEM', `Executed neural route optimization for ${selectedNode.location}`);
    }, 1400);
  };

  const handleRefreshRadar = () => {
    sound.playScan();
    setNodes([...initialNodes]);
    confetti({
      particleCount: 30,
      spread: 40,
      origin: { y: 0.8 }
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-emerald-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold mb-3 backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span>Global Multi-Echelon Geospatial Telemetry • 6 Critical Hubs Active</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Supply Chain Disruption Radar & Route Optimizer
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-3xl leading-relaxed">
              Real-time port congestion tracking, container IoT thermals, geopolitical choke-point alerts, and Gemini AI dynamic rerouting cost-benefit algorithms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'RADAR_MAP' ? 'SHIPMENTS' : 'RADAR_MAP')}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 shadow flex items-center gap-2 transition-all hover:scale-102"
            >
              {viewMode === 'RADAR_MAP' ? <Truck className="w-4 h-4 text-emerald-400" /> : <Globe2 className="w-4 h-4 text-emerald-400" />}
              <span>{viewMode === 'RADAR_MAP' ? 'View Cargo Manifest' : 'View Geospatial Radar'}</span>
            </button>
            <button
              onClick={handleRefreshRadar}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" /> Live Node Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span>Filter Nodes:</span>
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all ${activeFilter === 'ALL' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'}`}
          >
            All Corridors ({nodes.length})
          </button>
          <button
            onClick={() => setActiveFilter('DISRUPTED')}
            className={`px-3 py-1.5 rounded-xl transition-all ${activeFilter === 'DISRUPTED' ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'}`}
          >
            Congested / Delayed ({nodes.filter(n => n.status !== 'OPTIMAL').length})
          </button>
          <button
            onClick={() => setActiveFilter('OPTIMAL')}
            className={`px-3 py-1.5 rounded-xl transition-all ${activeFilter === 'OPTIMAL' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'}`}
          >
            Optimal ({nodes.filter(n => n.status === 'OPTIMAL').length})
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> Optimal Flow
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Moderate Delay
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span> Critical Choke
          </span>
        </div>
      </div>

      {viewMode === 'RADAR_MAP' ? (
        <>
          {/* Geospatial Interactive Vector Map */}
          <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-6 shadow-2xl border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-black text-white tracking-wide uppercase font-mono">
                  Interactive Geospatial Trade Corridors Matrix
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Click any pulsing node to inspect logistics telemetry
              </span>
            </div>

            {/* SVG Map Container */}
            <div className="relative w-full h-80 sm:h-96 bg-slate-950/80 rounded-2xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
              
              {/* Background Map Grid Graphic */}
              <svg viewBox="0 0 1000 500" className="w-full h-full object-cover select-none">
                <defs>
                  {/* Glowing Filters */}
                  <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="routeGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#6366f1" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Simplified World Continents Silhouettes */}
                <g fill="#1e293b" opacity="0.35">
                  {/* North America */}
                  <path d="M 120 100 Q 180 80 250 120 Q 230 180 180 220 Q 140 200 120 100 Z" />
                  {/* South America */}
                  <path d="M 230 260 Q 280 280 270 380 Q 220 400 210 320 Z" />
                  {/* Europe */}
                  <path d="M 450 100 Q 520 110 500 180 Q 430 170 450 100 Z" />
                  {/* Africa */}
                  <path d="M 460 200 Q 540 210 530 350 Q 450 320 460 200 Z" />
                  {/* Asia */}
                  <path d="M 540 100 Q 750 90 820 220 Q 720 300 580 220 Z" />
                  {/* Australia */}
                  <path d="M 750 340 Q 840 330 830 420 Q 740 410 750 340 Z" />
                </g>

                {/* Animated Trade Arcs */}
                {/* Taiwan to LA route */}
                <path
                  d="M 770 240 Q 980 140 999 150 M 0 150 Q 80 160 180 200"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  className="animate-pulse"
                  opacity="0.7"
                />
                {/* Taiwan to Europe route */}
                <path
                  d="M 770 240 Q 620 180 480 160"
                  fill="none"
                  stroke="url(#routeGradient1)"
                  strokeWidth="2.5"
                  strokeDasharray="8 4"
                  opacity="0.8"
                />
                {/* Mumbai to Europe */}
                <path
                  d="M 650 250 Q 560 200 480 160"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  opacity="0.7"
                />
                {/* Singapore to Dubai */}
                <path
                  d="M 730 290 Q 650 260 580 220"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  opacity="0.7"
                />

                {/* Dynamic Interactive Node Points */}
                {nodes.map(node => {
                  const isSelected = selectedNode.id === node.id;
                  const isDisrupted = node.status === 'DISRUPTED';
                  const isDelayed = node.status === 'MODERATE_DELAY';

                  const fillColor = isDisrupted ? '#f43f5e' : isDelayed ? '#f59e0b' : '#10b981';
                  const ringFilter = isDisrupted ? 'url(#glow-red)' : 'url(#glow-green)';

                  return (
                    <g 
                      key={node.id} 
                      onClick={() => handleNodeSelect(node)}
                      className="cursor-pointer group"
                    >
                      {/* Outer Ping Ring */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isSelected ? 18 : 12}
                        fill="none"
                        stroke={fillColor}
                        strokeWidth={isSelected ? 3 : 1.5}
                        opacity={isSelected ? 0.9 : 0.4}
                        filter={ringFilter}
                        className={isDisrupted || isSelected ? 'animate-ping' : ''}
                      />

                      {/* Main Node Circle */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isSelected ? 9 : 6}
                        fill={fillColor}
                        stroke="#0f172a"
                        strokeWidth="2"
                      />

                      {/* Node Label Tooltip */}
                      <text
                        x={node.x}
                        y={node.y - 14}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                        className="pointer-events-none drop-shadow"
                      >
                        {node.name.split(' ')[0]} ({node.delayHours > 0 ? `+${node.delayHours}h` : 'OK'})
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Floating Selected Node Quick Info Tag */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 text-xs text-white shadow-xl flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">SELECTED CORRIDOR</span>
                  <strong className="text-white font-bold">{selectedNode.name}</strong>
                </div>
                <div className="pl-3 border-l border-slate-700 text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">STATUS</span>
                  <span className={`font-bold font-mono ${selectedNode.status === 'DISRUPTED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {selectedNode.status}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Detailed Node Inspection & AI Rerouting Engine (2 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Corridor Details (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 uppercase">
                      {selectedNode.hubType}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      {selectedNode.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedNode.location}
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-xl text-xs font-mono font-black ${
                    selectedNode.status === 'DISRUPTED' 
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800' 
                      : selectedNode.status === 'MODERATE_DELAY'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  }`}>
                    {selectedNode.status}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block font-medium">Terminal Delay</span>
                    <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                      +{selectedNode.delayHours} hrs
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block font-medium">Active Shipments</span>
                    <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">
                      {selectedNode.activeShipments} units
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block font-medium">Avg Berth Time</span>
                    <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                      {selectedNode.avgBerthTime}
                    </span>
                  </div>
                </div>

                {/* Weather & Risk Factor */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Risk Assessment:</span>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">{selectedNode.riskFactor}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-start gap-2.5">
                    <Activity className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Meteorological & Port Feed:</span>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">{selectedNode.weatherAlert}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: AI Dynamic Multimodal Rerouting Scenario Engine (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 rounded-2xl p-6 text-white border border-indigo-800/60 shadow-xl space-y-4">
                
                <div className="flex items-center justify-between border-b border-indigo-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <h3 className="text-sm font-black tracking-wide text-white uppercase font-mono">
                      Gemini Neural Reroute Simulator
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 px-2 py-0.5 rounded-full font-bold">
                    v3.7 Reasoning
                  </span>
                </div>

                <p className="text-xs text-indigo-200 leading-relaxed">
                  Evaluate real-time operational tradeoff between air express surcharges vs line-stop downtime penalties.
                </p>

                {selectedNode.recommendedAction ? (
                  <div className="p-3.5 bg-indigo-900/40 rounded-xl border border-indigo-700/50 text-xs text-indigo-100 space-y-1">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> Prescribed Mitigation Strategy:
                    </span>
                    <p className="text-slate-300 leading-normal">{selectedNode.recommendedAction}</p>
                  </div>
                ) : (
                  <div className="p-3.5 bg-emerald-950/40 rounded-xl border border-emerald-800/50 text-xs text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 inline mr-1.5" />
                    Terminal operating within nominal parameters. No priority diversion needed.
                  </div>
                )}

                <button
                  onClick={handleRerouteCalc}
                  disabled={calculatingReroute}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-600/40 text-xs flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
                >
                  {calculatingReroute ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Multi-Echelon Freight Corridors...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" />
                      <span>Execute Dynamic Reroute Optimization ↵</span>
                    </>
                  )}
                </button>

                {rerouteOutput && (
                  <div className="p-4 bg-slate-900/90 rounded-xl border border-indigo-500/60 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Neural Optimization Plan Approved
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Resilience: {rerouteOutput.resilienceScore}%</span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {rerouteOutput.summary}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                      <div className="bg-slate-800/80 p-2 rounded-lg text-emerald-300">
                        <span className="text-[9px] text-slate-400 block">Lead Time Recovered</span>
                        +{rerouteOutput.savedHours} hrs saved
                      </div>
                      <div className="bg-slate-800/80 p-2 rounded-lg text-indigo-300">
                        <span className="text-[9px] text-slate-400 block">Est Plant Down-Time ROI</span>
                        +{formatCurrency(rerouteOutput.roiSpend)}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </>
      ) : (
        /* Shipments & Manifest Table */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Vessel & Freight Cargo Telemetry
              </h3>
              <p className="text-xs text-slate-500">Real-time IoT thermals, GPS coordinates, and customs status</p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold rounded-xl border border-indigo-200 dark:border-indigo-800">
              {shipments.length} Active Vessels
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Tracking ID</th>
                  <th className="p-3.5">Carrier / Vessel</th>
                  <th className="p-3.5">Route</th>
                  <th className="p-3.5">Cargo Manifest</th>
                  <th className="p-3.5">Mode</th>
                  <th className="p-3.5">ETA</th>
                  <th className="p-3.5">IoT Temp</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {shipments.map(s => (
                  <tr key={s.trackingId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {s.trackingId}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {s.carrier}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {s.origin} <ArrowRight className="w-3 h-3 inline mx-1 text-slate-400" /> {s.destination}
                    </td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-200">
                      {s.cargo}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        {s.mode}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">
                      {s.eta}
                    </td>
                    <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {s.temperature}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono ${
                        s.status === 'CUSTOMS_HOLD' 
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                          : s.status === 'EXPEDITED'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

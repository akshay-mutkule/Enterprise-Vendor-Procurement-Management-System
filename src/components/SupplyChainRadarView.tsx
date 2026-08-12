import React, { useState } from 'react';
import { 
  Globe2, Navigation, AlertTriangle, ShieldCheck, Clock, 
  ArrowRight, Compass, RefreshCw, Sparkles, MapPin, Anchor, Truck
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';

interface SupplyNode {
  id: string;
  location: string;
  region: string;
  hubType: 'SEMICONDUCTOR_FAB' | 'METALS_FOUNDRY' | 'PORT_HUB' | 'AIR_FREIGHT';
  status: 'OPTIMAL' | 'MODERATE_DELAY' | 'DISRUPTED';
  delayHours: number;
  activeShipments: number;
  riskFactor: string;
  recommendedAction?: string;
}

const initialNodes: SupplyNode[] = [
  {
    id: 'node-1',
    location: 'Hsinchu Science Park, Taiwan',
    region: 'Asia-Pacific',
    hubType: 'SEMICONDUCTOR_FAB',
    status: 'OPTIMAL',
    delayHours: 0,
    activeShipments: 12,
    riskFactor: 'Typhoon season low alert. Lead time 7 days.'
  },
  {
    id: 'node-2',
    location: 'Frankfurt Airport Air Hub, Germany',
    region: 'Europe',
    hubType: 'AIR_FREIGHT',
    status: 'MODERATE_DELAY',
    delayHours: 18,
    activeShipments: 6,
    riskFactor: 'Customs bottleneck on precision electronics.',
    recommendedAction: 'Reroute high-priority microcontrollers via Munich Express Air.'
  },
  {
    id: 'node-3',
    location: 'Port of Los Angeles, USA',
    region: 'North America',
    hubType: 'PORT_HUB',
    status: 'DISRUPTED',
    delayHours: 72,
    activeShipments: 4,
    riskFactor: 'Drayage truck labor congestion at Pier 400.',
    recommendedAction: 'Divert upcoming metal enclosure containers to Port of Long Beach Terminal B.'
  },
  {
    id: 'node-4',
    location: 'Jawaharlal Nehru Port, Mumbai, India',
    region: 'South Asia',
    hubType: 'PORT_HUB',
    status: 'OPTIMAL',
    delayHours: 4,
    activeShipments: 18,
    riskFactor: 'Monsoon clearance operating at 94% throughput.'
  }
];

export const SupplyChainRadarView: React.FC = () => {
  const { logActivity } = useProcurement();
  const [nodes, setNodes] = useState<SupplyNode[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<SupplyNode>(initialNodes[1]);
  const [calculatingReroute, setCalculatingReroute] = useState(false);
  const [rerouteOutput, setRerouteOutput] = useState<string | null>(null);

  const handleRerouteCalc = () => {
    setCalculatingReroute(true);
    setRerouteOutput(null);
    setTimeout(() => {
      setCalculatingReroute(false);
      setRerouteOutput(
        `AI Rerouting Assessment for ${selectedNode.location}: Diverting 500x units via secondary Air Corridor saves 54 hours of port delay at an incremental cost of +$1,240 (Est ROI: +$14,200 avoiding assembly line downtime).`
      );
      logActivity('SIMULATE_REROUTE', 'SYSTEM', `Calculated route optimization for hub ${selectedNode.location}`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-emerald-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono rounded font-bold uppercase tracking-wider">
              Geo Logistics
            </span>
            <span className="text-xs text-slate-400">Multi-Echelon Transit Radar</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">Global Supply Chain Disruption Radar & Route Optimizer</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Real-time port congestion monitoring, transit delay risk maps, and Gemini AI dynamic rerouting cost-benefit recommendations.
          </p>
        </div>

        <button
          onClick={() => { setNodes([...nodes]); }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow border border-emerald-400/30 flex items-center gap-2 transition-all whitespace-nowrap"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Radar Telemetry
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Node Hub List (6 Cols) */}
        <div className="lg:col-span-6 space-y-3">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-emerald-600" /> Key Global Supply Hubs Telemetry
          </h3>

          <div className="space-y-3">
            {nodes.map(node => {
              const isSelected = selectedNode.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => { setSelectedNode(node); setRerouteOutput(null); }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {node.location}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {node.region} • {node.hubType}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase shrink-0 ${
                      node.status === 'OPTIMAL' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      node.status === 'MODERATE_DELAY' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                    }`}>
                      {node.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2">
                    {node.riskFactor}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Active Containers: <strong>{node.activeShipments}</strong></span>
                    <span className={node.delayHours > 0 ? 'text-rose-500 font-bold' : 'text-emerald-500'}>
                      Transit Delay: +{node.delayHours} hrs
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Hub Telemetry & Rerouting Calculator (6 Cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between shadow-lg space-y-4">
          
          <div className="space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold font-mono text-emerald-600 uppercase">Hub Details & AI Rerouting</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedNode.location}
                </h3>
              </div>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl">
                {selectedNode.region}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Transit Throughput</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                  {selectedNode.activeShipments} Active Containers
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Congestion Latency</span>
                <span className={`text-sm font-extrabold font-mono ${selectedNode.delayHours > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  +{selectedNode.delayHours} Hours
                </span>
              </div>
            </div>

            {selectedNode.recommendedAction && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5 uppercase text-[10px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Disruption Advisory
                </span>
                <p>{selectedNode.recommendedAction}</p>
              </div>
            )}

            {rerouteOutput && (
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-2">
                <span className="font-bold flex items-center gap-1.5 uppercase text-[10px] text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-500" /> AI Rerouting Cost-Benefit Model Output
                </span>
                <p className="leading-relaxed">{rerouteOutput}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleRerouteCalc}
            disabled={calculatingReroute}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition-all mt-4"
          >
            <Compass className={`w-4 h-4 ${calculatingReroute ? 'animate-spin' : ''}`} />
            {calculatingReroute ? 'Calculating Optimal Air/Sea Reroute...' : 'Run Gemini Dynamic Reroute Simulation'}
          </button>

        </div>

      </div>

    </div>
  );
};

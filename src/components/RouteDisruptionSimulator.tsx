import React, { useState } from 'react';
import { 
  Navigation, Anchor, Plane, AlertTriangle, ShieldAlert, Clock, 
  ArrowRight, Compass, Sparkles, CheckCircle2, ShieldCheck, Activity,
  Fuel, Thermometer, Wind, Zap, Layers, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProcurement } from '../context/ProcurementContext';
import { formatCurrency } from '../utils/exportUtils';
import { sound } from '../utils/soundUtils';

interface RouteOption {
  id: 'SUEZ' | 'CAPE' | 'AIR_CHARTER';
  name: string;
  description: string;
  transitDays: number;
  totalFreightCost: number;
  fuelCost: number;
  insuranceSurcharge: number;
  co2EmissionsTons: number;
  riskScore: number; // 0-100
  hazardDescription: string;
  recommended: boolean;
}

export const RouteDisruptionSimulator: React.FC = () => {
  const { addToast, logActivity } = useProcurement();

  const [activeRoute, setActiveRoute] = useState<'SUEZ' | 'CAPE' | 'AIR_CHARTER'>('CAPE');
  const [cargoValue] = useState<number>(18400000); // $18.4M in automotive microcontrollers
  const [criticalDaysToShutdown, setCriticalDaysToShutdown] = useState<number>(28);
  const [vesselSpeedKnots, setVesselSpeedKnots] = useState<number>(19.2);

  const routes: Record<'SUEZ' | 'CAPE' | 'AIR_CHARTER', RouteOption> = {
    SUEZ: {
      id: 'SUEZ',
      name: 'Red Sea / Suez Canal Transit Corridor',
      description: 'Direct maritime route through Bab el-Mandeb strait and Suez Canal to Rotterdam.',
      transitDays: 22,
      totalFreightCost: 310000,
      fuelCost: 180000,
      insuranceSurcharge: 145000, // High War-Risk Underwriting
      co2EmissionsTons: 1420,
      riskScore: 88,
      hazardDescription: 'High missile/drone strike alert. Lloyd’s Joint War Committee breach zone.',
      recommended: false
    },
    CAPE: {
      id: 'CAPE',
      name: 'Cape of Good Hope Oceanic Bypass',
      description: 'Southern African circumnavigation bypassing geopolitical choke-points completely.',
      transitDays: Math.round(34 * (19.2 / vesselSpeedKnots)),
      totalFreightCost: 485000,
      fuelCost: 360000,
      insuranceSurcharge: 15000, // Normal marine hull insurance
      co2EmissionsTons: 2150,
      riskScore: 18,
      hazardDescription: 'Rough Southern Ocean sea state; zero hostile military conflict hazard.',
      recommended: true
    },
    AIR_CHARTER: {
      id: 'AIR_CHARTER',
      name: 'Emergency Boeing 777F Air Freight Charter',
      description: 'Immediate airport-to-airport express air charter for top 20% critical inventory buffer.',
      transitDays: 3,
      totalFreightCost: 680000,
      fuelCost: 290000,
      insuranceSurcharge: 8000,
      co2EmissionsTons: 380,
      riskScore: 5,
      hazardDescription: 'Zero transit disruption. Prevents automotive plant line-stoppage ($1.2M/day penalty).',
      recommended: false
    }
  };

  const selectedRouteData = routes[activeRoute];
  const delayDeltaVsShutdown = criticalDaysToShutdown - selectedRouteData.transitDays;
  const isLineShutdownRisk = delayDeltaVsShutdown < 0;

  const handleSelectRoute = (routeId: 'SUEZ' | 'CAPE' | 'AIR_CHARTER') => {
    sound.playClick();
    setActiveRoute(routeId);

    const r = routes[routeId];
    logActivity(
      'SYSTEM',
      `Supply Chain Maritime Digital Twin: Active route switched to ${r.name}. Projected transit: ${r.transitDays} days, Freight: ${formatCurrency(r.totalFreightCost)}.`
    );

    addToast({
      title: `Route Set: ${r.name}`,
      message: `Simulated transit adjusted to ${r.transitDays} days. Risk profile updated to score ${r.riskScore}/100.`,
      type: r.riskScore > 50 ? 'warning' : 'success'
    });
  };

  const handleAuthorizeReroute = () => {
    sound.playSuccess();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    logActivity(
      'PROCUREMENT',
      `Operational Dispatch: Formal maritime reroute order signed for MV Ever Horizon to proceed via ${selectedRouteData.name}. Total authorized budget: ${formatCurrency(selectedRouteData.totalFreightCost)}.`
    );

    addToast({
      title: 'Vessel Dispatch Order Authorized',
      message: `MV Ever Horizon navigation system updated to ${selectedRouteData.name}. Vessel telemetry confirmed.`,
      type: 'success'
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
      
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 mb-1">
            <Compass className="w-3.5 h-3.5" /> Maritime Digital Twin & ETA Delta Engine
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Anchor className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Supply Chain Disruption & Maritime Reroute Simulator
          </h3>
          <p className="text-xs text-slate-500">
            Real-time hydrodynamic & geopolitical calculation comparing Suez Canal transit vs Cape of Good Hope circumnavigation vs Emergency Air Charters.
          </p>
        </div>

        {/* Vessel Telemetry Pill */}
        <div className="bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs flex items-center gap-3 border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Vessel AIS Telemetry</span>
            <span className="font-bold font-mono text-emerald-400">MV EVER HORIZON</span>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Cargo Value</span>
            <span className="font-bold font-mono text-white">{formatCurrency(cargoValue)}</span>
          </div>
        </div>
      </div>

      {/* Speed & Sensitivity Levers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600 dark:text-slate-300">Vessel Steaming Speed</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{vesselSpeedKnots.toFixed(1)} knots</span>
          </div>
          <input
            type="range"
            min={14}
            max={22}
            step={0.5}
            value={vesselSpeedKnots}
            onChange={(e) => setVesselSpeedKnots(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <span className="text-[10px] text-slate-400">Higher speed lowers transit days but increases bunker fuel burn exponentially (Cubic law).</span>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600 dark:text-slate-300">Factory Assembly Line Buffer Stock</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{criticalDaysToShutdown} Days until Stoppage</span>
          </div>
          <input
            type="range"
            min={10}
            max={45}
            step={1}
            value={criticalDaysToShutdown}
            onChange={(e) => setCriticalDaysToShutdown(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <span className="text-[10px] text-slate-400">Factory inventory threshold before production line shutdown penalty triggers ($1.2M/day).</span>
        </div>
      </div>

      {/* 3 Interactive Route Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(routes) as Array<'SUEZ' | 'CAPE' | 'AIR_CHARTER'>).map((key) => {
          const r = routes[key];
          const isSelected = activeRoute === key;
          const isThreat = r.riskScore > 50;

          return (
            <div
              key={key}
              onClick={() => handleSelectRoute(key)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500 shadow-md ring-2 ring-indigo-400/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                    {key === 'AIR_CHARTER' ? <Plane className="w-5 h-5" /> : <Anchor className="w-5 h-5" />}
                  </div>
                  {r.recommended && (
                    <span className="text-[9px] uppercase font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                  {isThreat && (
                    <span className="text-[9px] uppercase font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Choke Danger
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-3">
                  {r.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {r.description}
                </p>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Transit Duration:</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white">{r.transitDays} Days</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Total Route Cost:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(r.totalFreightCost)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">War Risk Insurance:</span>
                    <span className={`font-mono font-bold ${r.insuranceSurcharge > 50000 ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>
                      {formatCurrency(r.insuranceSurcharge)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Geopolitical Risk:</span>
                    <span className={`font-mono font-bold ${r.riskScore > 50 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {r.riskScore} / 100
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  {isSelected ? '✓ Currently Simulated' : 'Select to Simulate'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {r.co2EmissionsTons}t CO2
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disruption Impact Synthesis */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isLineShutdownRisk
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
          : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isLineShutdownRisk ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
            {isLineShutdownRisk ? <AlertTriangle className="w-5 h-5 animate-pulse" /> : <ShieldCheck className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {isLineShutdownRisk ? (
                <>Warning: Vessel Arrival Lags Buffer Stock by {Math.abs(delayDeltaVsShutdown)} Days!</>
              ) : (
                <>Safe Delivery Window: Cargo Arrives {delayDeltaVsShutdown} Days Before Buffer Stock Exhaustion</>
              )}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {isLineShutdownRisk 
                ? 'Factory line shutdown will trigger unless emergency Boeing 777F air charter is authorized to bridge the gap.' 
                : 'Current route profile satisfies lean manufacturing JIT (Just-In-Time) assembly delivery targets.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleAuthorizeReroute}
          className="w-full md:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all"
        >
          <Navigation className="w-4 h-4" /> Authorize Route Dispatch Order
        </button>
      </div>

    </div>
  );
};

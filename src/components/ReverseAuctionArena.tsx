import React, { useState, useEffect, useRef } from 'react';
import { 
  Gavel, Clock, TrendingDown, Users, AlertCircle, Award, Play, Pause, 
  RotateCcw, ArrowDownRight, ShieldCheck, Zap, Download, Sparkles, CheckCircle2,
  DollarSign, BarChart2, Radio, Volume2, PlusCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import confetti from 'canvas-confetti';
import { useProcurement } from '../context/ProcurementContext';
import { formatCurrency, exportToPDF } from '../utils/exportUtils';
import { sound } from '../utils/soundUtils';

export interface AuctionBidder {
  id: string;
  vendorId: string;
  name: string;
  country: string;
  currentBid: number;
  rank: number;
  leadTimeDays: number;
  qualityScore: number;
  bidsCount: number;
  lastBidTime: string;
  status: 'ACTIVE' | 'OUTBID' | 'WITHDRAWN';
}

interface BidRecord {
  id: string;
  vendorName: string;
  amount: number;
  decrement: number;
  timestamp: string;
  rank: number;
}

export const ReverseAuctionArena: React.FC<{ lotName?: string; initialCeiling?: number; onAwardPO?: (poNumber: string) => void }> = ({
  lotName = 'Tier-1 Microcontroller Batch (STM32H753) - 50,000 Units',
  initialCeiling = 92000,
  onAwardPO
}) => {
  const { addToast, logActivity, purchaseOrders, awardReverseAuction } = useProcurement();

  const [auctionMode, setAuctionMode] = useState<'ENGLISH' | 'DUTCH'>('ENGLISH');
  const [reservePrice, setReservePrice] = useState<number>(initialCeiling);
  const [timeLeft, setTimeLeft] = useState<number>(180); // 3 minutes in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [decrementStep, setDecrementStep] = useState<number>(500);
  const [isAwarded, setIsAwarded] = useState<boolean>(false);
  const [antiSnipingActive, setAntiSnipingActive] = useState<boolean>(false);

  // Dutch auction specific
  const [dutchCurrentPrice, setDutchCurrentPrice] = useState<number>(initialCeiling * 1.15);
  const [dutchDecrementRate, setDutchDecrementRate] = useState<number>(750);

  // Bidders pool
  const [bidders, setBidders] = useState<AuctionBidder[]>([
    { id: 'b-1', vendorId: 'v-101', name: 'Apex Components Ltd', country: 'Germany', currentBid: 89500, rank: 1, leadTimeDays: 14, qualityScore: 98, bidsCount: 4, lastBidTime: '00:01:12', status: 'ACTIVE' },
    { id: 'b-2', vendorId: 'v-102', name: 'Shenzhen Micro Semi', country: 'China', currentBid: 90200, rank: 2, leadTimeDays: 21, qualityScore: 94, bidsCount: 3, lastBidTime: '00:01:05', status: 'ACTIVE' },
    { id: 'b-3', vendorId: 'v-103', name: 'Dynatronics US Corp', country: 'USA', currentBid: 91000, rank: 3, leadTimeDays: 7, qualityScore: 99, bidsCount: 2, lastBidTime: '00:00:45', status: 'ACTIVE' },
    { id: 'b-4', vendorId: 'v-104', name: 'Vertex Electronics AG', country: 'Switzerland', currentBid: 91800, rank: 4, leadTimeDays: 12, qualityScore: 96, bidsCount: 2, lastBidTime: '00:00:20', status: 'ACTIVE' },
    { id: 'b-5', vendorId: 'v-105', name: 'Kyoto Precision Tech', country: 'Japan', currentBid: 92500, rank: 5, leadTimeDays: 16, qualityScore: 97, bidsCount: 1, lastBidTime: '00:00:05', status: 'ACTIVE' },
  ]);

  // Bid Ledger
  const [bidLedger, setBidLedger] = useState<BidRecord[]>([
    { id: 'tx-1', vendorName: 'Kyoto Precision Tech', amount: 92500, decrement: 0, timestamp: '14:28:10', rank: 5 },
    { id: 'tx-2', vendorName: 'Vertex Electronics AG', amount: 91800, decrement: 700, timestamp: '14:28:40', rank: 4 },
    { id: 'tx-3', vendorName: 'Dynatronics US Corp', amount: 91000, decrement: 800, timestamp: '14:29:15', rank: 3 },
    { id: 'tx-4', vendorName: 'Shenzhen Micro Semi', amount: 90200, decrement: 800, timestamp: '14:29:45', rank: 2 },
    { id: 'tx-5', vendorName: 'Apex Components Ltd', amount: 89500, decrement: 700, timestamp: '14:30:12', rank: 1 },
  ]);

  // Chart data
  const [chartData, setChartData] = useState([
    { time: 'T-0', price: 93000, reserve: initialCeiling },
    { time: 'T-30s', price: 91800, reserve: initialCeiling },
    { time: 'T-60s', price: 91000, reserve: initialCeiling },
    { time: 'T-90s', price: 90200, reserve: initialCeiling },
    { time: 'T-120s', price: 89500, reserve: initialCeiling },
  ]);

  const currentLowestBid = Math.min(...bidders.map(b => b.currentBid));
  const leadingBidder = bidders.find(b => b.currentBid === currentLowestBid) || bidders[0];
  const totalSavings = Math.max(0, reservePrice - currentLowestBid);
  const savingsPercent = reservePrice > 0 ? ((totalSavings / reservePrice) * 100).toFixed(1) : '0';

  // Live timer interval
  useEffect(() => {
    let timer: any;
    if (isRunning && timeLeft > 0 && !isAwarded) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            sound.playAlert();
            addToast({
              title: 'Auction Time Expired',
              message: `Reverse auction timer reached 00:00. Leading bidder: ${leadingBidder.name} at ${formatCurrency(currentLowestBid)}.`,
              type: 'info'
            });
            return 0;
          }
          return prev - 1;
        });

        // Dutch mode decrement
        if (auctionMode === 'DUTCH') {
          setDutchCurrentPrice(p => Math.max(reservePrice * 0.75, p - dutchDecrementRate));
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isAwarded, auctionMode, leadingBidder, currentLowestBid, dutchDecrementRate, reservePrice, addToast]);

  // AI Competitor simulated bids
  useEffect(() => {
    let simInterval: any;
    if (isRunning && !isAwarded && auctionMode === 'ENGLISH' && timeLeft > 5) {
      simInterval = setInterval(() => {
        // Randomly pick a bidder who is not currently Rank 1 to undercut
        const eligibleBidders = bidders.filter(b => b.id !== leadingBidder.id);
        if (eligibleBidders.length === 0) return;

        const bidderToMove = eligibleBidders[Math.floor(Math.random() * eligibleBidders.length)];
        const undercut = decrementStep * (Math.floor(Math.random() * 2) + 1);
        const newBidPrice = currentLowestBid - undercut;

        // Stop if price goes unrealistically low (< 60% of reserve)
        if (newBidPrice < reservePrice * 0.65) return;

        sound.playScan();

        // Check anti-sniping soft-close rule (if within last 30s, extend by 60s)
        if (timeLeft < 30) {
          setTimeLeft(t => t + 60);
          setAntiSnipingActive(true);
          addToast({
            title: 'Anti-Sniping Extension Triggered',
            message: 'A bid was placed in the final 30 seconds. Clock extended by +60s for fair competitive discovery.',
            type: 'warning'
          });
        }

        // Update bidders and ledger
        const now = new Date();
        const timeStr = now.toTimeString().substring(0, 8);

        setBidders(prev => {
          const updated = prev.map(b => {
            if (b.id === bidderToMove.id) {
              return {
                ...b,
                currentBid: newBidPrice,
                bidsCount: b.bidsCount + 1,
                lastBidTime: timeStr
              };
            }
            return b;
          });

          // Re-sort ranks
          const sorted = [...updated].sort((a, b) => a.currentBid - b.currentBid);
          return sorted.map((b, idx) => ({ ...b, rank: idx + 1 }));
        });

        const newRecord: BidRecord = {
          id: `tx-${Date.now()}`,
          vendorName: bidderToMove.name,
          amount: newBidPrice,
          decrement: undercut,
          timestamp: timeStr,
          rank: 1
        };

        setBidLedger(prev => [newRecord, ...prev.slice(0, 9)]);

        setChartData(prev => [
          ...prev,
          {
            time: `T-${180 - timeLeft}s`,
            price: newBidPrice,
            reserve: reservePrice
          }
        ]);

      }, 7000); // Trigger every 7 seconds
    }

    return () => clearInterval(simInterval);
  }, [isRunning, isAwarded, auctionMode, timeLeft, bidders, leadingBidder, decrementStep, currentLowestBid, reservePrice, addToast]);

  const handleManualVendorBid = (bidderId: string) => {
    const bidder = bidders.find(b => b.id === bidderId);
    if (!bidder || isAwarded) return;

    const newPrice = currentLowestBid - decrementStep;
    sound.playSuccess();

    if (timeLeft < 30) {
      setTimeLeft(t => t + 60);
      setAntiSnipingActive(true);
    }

    const now = new Date();
    const timeStr = now.toTimeString().substring(0, 8);

    setBidders(prev => {
      const updated = prev.map(b => {
        if (b.id === bidderId) {
          return {
            ...b,
            currentBid: newPrice,
            bidsCount: b.bidsCount + 1,
            lastBidTime: timeStr
          };
        }
        return b;
      });
      return [...updated].sort((a, b) => a.currentBid - b.currentBid).map((b, idx) => ({ ...b, rank: idx + 1 }));
    });

    setBidLedger(prev => [
      {
        id: `tx-${Date.now()}`,
        vendorName: bidder.name,
        amount: newPrice,
        decrement: decrementStep,
        timestamp: timeStr,
        rank: 1
      },
      ...prev.slice(0, 9)
    ]);

    setChartData(prev => [
      ...prev,
      {
        time: `T-${180 - timeLeft}s`,
        price: newPrice,
        reserve: reservePrice
      }
    ]);

    addToast({
      title: 'Manual Bid Logged',
      message: `${bidder.name} submitted a qualifying decremental bid of ${formatCurrency(newPrice)}.`,
      type: 'success'
    });
  };

  const handleAcceptDutchPrice = (bidderId: string) => {
    const bidder = bidders.find(b => b.id === bidderId);
    if (!bidder) return;
    setIsRunning(false);
    handleAwardTender(bidder.id, dutchCurrentPrice);
  };

  const handleAwardTender = (winnerBidderId?: string, finalAmount?: number) => {
    const winner = bidders.find(b => b.id === (winnerBidderId || leadingBidder.id)) || leadingBidder;
    const amount = finalAmount || winner.currentBid;

    setIsRunning(false);
    setIsAwarded(true);
    sound.playGavel();

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    awardReverseAuction({
      vendorId: winner.vendorId,
      vendorName: winner.name,
      amount: amount
    });

    const newPONumber = `PO-AUC-${Math.floor(1000 + Math.random() * 9000)}`;

    logActivity(
      'PROCUREMENT',
      `Tender Awarded via Reverse Auction: ${lotName} awarded to ${winner.name} at ${formatCurrency(amount)} (Achieved ${savingsPercent}% savings vs Reserve Price ${formatCurrency(reservePrice)}). PO created: ${newPONumber}`
    );

    addToast({
      title: 'Tender Formally Awarded!',
      message: `Contract awarded to ${winner.name} at ${formatCurrency(amount)}. Purchase order generated with legally locked rate.`,
      type: 'success'
    });

    if (onAwardPO) {
      onAwardPO(newPONumber);
    }
  };

  const handleExportTenderPDF = () => {
    sound.playClick();
    const headers = ['Rank', 'Vendor Name', 'Country', 'Final Bid', 'Lead Time', 'Quality Compliance', 'Bids Submitted'];
    const rows = bidders.map(b => [
      `Rank ${b.rank}`,
      b.name,
      b.country,
      formatCurrency(b.currentBid),
      `${b.leadTimeDays} days`,
      `${b.qualityScore}%`,
      b.bidsCount
    ]);

    exportToPDF(
      `Reverse e-Auction Audit & Award Certificate - ${lotName}`,
      headers,
      rows,
      `eAuction_Award_${Date.now()}`
    );

    addToast({
      title: 'Certificate Exported',
      message: 'Cryptographically-stamped auction audit certificate exported as PDF.',
      type: 'info'
    });
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Control Deck */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-indigo-900/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Dynamic e-Procurement Arena
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Gavel className="w-6 h-6 text-amber-400" />
              {lotName}
            </h2>
            <p className="text-xs text-indigo-200/80">
              Multi-supplier competitive price discovery room with automated anti-sniping protection, reserve price enforcement, and binding smart contract awarding.
            </p>
          </div>

          {/* Countdown Clock Display */}
          <div className="flex items-center gap-4 bg-slate-950/70 border border-indigo-800/60 rounded-xl p-4 shadow-inner">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Round Clock</span>
              <div className={`font-mono text-3xl font-black tracking-widest ${timeLeft < 30 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                {formatTimer(timeLeft)}
              </div>
              {antiSnipingActive && (
                <span className="text-[9px] text-amber-400 font-semibold flex items-center justify-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3" /> Soft-Close +60s
                </span>
              )}
            </div>

            <div className="h-10 w-px bg-slate-800"></div>

            <div className="flex flex-col gap-1.5">
              {!isAwarded ? (
                <>
                  <button
                    onClick={() => { sound.playClick(); setIsRunning(!isRunning); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all ${
                      isRunning 
                        ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isRunning ? 'Pause Ticks' : 'Start Live Bidding'}
                  </button>
                  <button
                    onClick={() => { sound.playClick(); setTimeLeft(t => t + 120); }}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> +2m Extension
                  </button>
                </>
              ) : (
                <div className="px-4 py-2 bg-emerald-950 border border-emerald-500/50 rounded-lg text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Auction Concluded
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-indigo-900/40">
          <div className="bg-slate-900/40 p-3 rounded-xl border border-indigo-900/30">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Reserve Price Ceiling</span>
            <div className="text-base font-mono font-black text-slate-200 mt-0.5">{formatCurrency(reservePrice)}</div>
            <span className="text-[10px] text-slate-400">Maximum allowed budget</span>
          </div>

          <div className="bg-slate-900/40 p-3 rounded-xl border border-indigo-900/30">
            <span className="text-[10px] text-indigo-300 uppercase font-semibold">Current Best Bid (L1)</span>
            <div className="text-base font-mono font-black text-emerald-400 mt-0.5">{formatCurrency(currentLowestBid)}</div>
            <span className="text-[10px] text-emerald-400/90 font-medium">{leadingBidder.name}</span>
          </div>

          <div className="bg-slate-900/40 p-3 rounded-xl border border-indigo-900/30">
            <span className="text-[10px] text-emerald-400 uppercase font-semibold">Accrued Savings</span>
            <div className="text-base font-mono font-black text-emerald-300 mt-0.5">{formatCurrency(totalSavings)}</div>
            <span className="text-[10px] text-emerald-400 font-bold">-{savingsPercent}% Below Ceiling</span>
          </div>

          <div className="bg-slate-900/40 p-3 rounded-xl border border-indigo-900/30">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Registered Suppliers</span>
            <div className="text-base font-mono font-black text-white mt-0.5">{bidders.length} Active Bidders</div>
            <span className="text-[10px] text-slate-400">{bidLedger.length} total bids logged</span>
          </div>
        </div>
      </div>

      {/* Mode Switcher & Auction Config Deck */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Auction Protocol:</span>
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => { sound.playClick(); setAuctionMode('ENGLISH'); }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                auctionMode === 'ENGLISH'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              English Reverse (Decremental)
            </button>
            <button
              onClick={() => { sound.playClick(); setAuctionMode('DUTCH'); }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                auctionMode === 'DUTCH'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Dutch Descending Clock
            </button>
          </div>
        </div>

        {/* Decrement Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Min Tick Decrement:</span>
          <div className="flex items-center gap-1.5">
            {[250, 500, 1000, 2500].map(step => (
              <button
                key={step}
                onClick={() => { sound.playClick(); setDecrementStep(step); }}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded border ${
                  decrementStep === step
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                ${step}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportTenderPDF}
            className="ml-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF Certificate
          </button>
        </div>
      </div>

      {/* Dutch Clock Special Banner (if active) */}
      {auctionMode === 'DUTCH' && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">Dutch Descending Clock Rate</span>
              <div className="text-2xl font-mono font-black text-slate-900 dark:text-white">
                {formatCurrency(dutchCurrentPrice)}
              </div>
              <p className="text-xs text-slate-500">
                Price drops by ${dutchDecrementRate} every second. The first supplier to lock in wins the contract at the exact ticker price.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {bidders.slice(0, 3).map(b => (
              <button
                key={b.id}
                disabled={isAwarded}
                onClick={() => handleAcceptDutchPrice(b.id)}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 disabled:opacity-50"
              >
                {b.name} Accepts Price
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Live Leaderboard (8 cols) & Bid Activity Stream (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Supplier Leaderboard & Price Curve */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Supplier Leaderboard Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Real-Time Supplier Standings (L1 / L2 / L3)
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">Auto-sorted by lowest bid</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Vendor / Region</th>
                    <th className="p-3">Current Bid</th>
                    <th className="p-3">Lead Time</th>
                    <th className="p-3">Quality</th>
                    <th className="p-3">Bids #</th>
                    <th className="p-3 text-right">Instant Tick</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {bidders.map((bidder) => {
                    const isRank1 = bidder.rank === 1;
                    const deltaFromCeiling = reservePrice - bidder.currentBid;
                    return (
                      <tr 
                        key={bidder.id}
                        className={`transition-colors ${
                          isRank1 
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 font-semibold' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="p-3">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-mono font-black ${
                            isRank1 
                              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/50' 
                              : bidder.rank === 2
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            L{bidder.rank}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {bidder.name}
                            {isRank1 && (
                              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-black">
                                LOWEST
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{bidder.country} • Last bid: {bidder.lastBidTime}</span>
                        </td>
                        <td className="p-3">
                          <div className={`font-mono text-sm font-black ${isRank1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                            {formatCurrency(bidder.currentBid)}
                          </div>
                          <span className="text-[10px] text-emerald-500 font-medium">
                            -{formatCurrency(deltaFromCeiling)} vs Ceiling
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                          {bidder.leadTimeDays} days
                        </td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{bidder.qualityScore}%</span>
                        </td>
                        <td className="p-3 font-mono text-slate-500">
                          {bidder.bidsCount}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            disabled={isAwarded}
                            onClick={() => handleManualVendorBid(bidder.id)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-lg text-[11px] font-bold border border-indigo-200 dark:border-indigo-800 transition-colors disabled:opacity-40"
                          >
                            Bid -${decrementStep}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Award Gavel Bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white">Award Recommendation:</span> L1 Lowest Bidder is{' '}
                <span className="font-black text-emerald-600 dark:text-emerald-400">{leadingBidder.name}</span> at{' '}
                <span className="font-mono font-black">{formatCurrency(currentLowestBid)}</span>.
              </div>

              {!isAwarded ? (
                <button
                  onClick={() => handleAwardTender()}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  <Gavel className="w-4 h-4" /> Award Tender & Lock Binding PO
                </button>
              ) : (
                <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-black flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Contract Formally Awarded to {leadingBidder.name}
                </div>
              )}
            </div>
          </div>

          {/* Price Progression Chart */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Price Decrement Progression vs Ceiling
                </span>
              </div>
              <span className="text-xs text-slate-400">Live Tick Interpolation</span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis 
                    domain={['dataMin - 1000', 'dataMax + 1000']} 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} 
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Price']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#priceGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Live Bid Activity Ledger Tape */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Live Bid Activity Stream
                </span>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                Encrypted Tape
              </span>
            </div>

            <div className="mt-4 space-y-3 flex-1 overflow-y-auto max-h-[520px] pr-1">
              {bidLedger.map((record, index) => (
                <div 
                  key={record.id}
                  className={`p-3 rounded-xl border transition-all text-xs ${
                    index === 0
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 shadow-sm'
                      : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {record.vendorName}
                      {index === 0 && (
                        <span className="text-[9px] bg-emerald-500 text-white px-1 py-0.2 rounded font-black">
                          NEW L1
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{record.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-between mt-1.5">
                    <div className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      {formatCurrency(record.amount)}
                    </div>
                    {record.decrement > 0 && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <ArrowDownRight className="w-3.5 h-3.5" /> -{formatCurrency(record.decrement)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Bid Simulation Trigger for Operator */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Simulate Immediate Supplier Bid
              </span>
              <div className="grid grid-cols-2 gap-2">
                {bidders.slice(0, 4).map(b => (
                  <button
                    key={b.id}
                    disabled={isAwarded}
                    onClick={() => handleManualVendorBid(b.id)}
                    className="p-2 text-left bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] disabled:opacity-40"
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{b.name}</div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">-${decrementStep}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

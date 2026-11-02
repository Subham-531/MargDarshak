import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  GitCompare,
  X,
  Sparkles,
  Cpu,
  Zap,
  ArrowRight,
  RotateCcw,
  Clock,
  Navigation,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { springSoft, scaleIn } from '../lib/motion';
import { NodeItem } from './ControlPanel';
import { apiUrl } from '../lib/api';

export interface ComparisonMetrics {
  nodesSaved: number;
  savingsPercent: number;
  dijkstraFaster?: boolean;
}

export interface AlgorithmMetrics {
  nodesExplored: number;
  distanceKm: number;
  timeMin: number;
  executionTimeMs: number;
  path: string[];
}

export interface ComparisonData {
  metrics: ComparisonMetrics;
  dijkstra: AlgorithmMetrics;
  astar: AlgorithmMetrics;
}

export interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  startNode: string;
  destNode: string;
  mode: string;
  avoidHighways: boolean;
  nodes?: NodeItem[];
}

const PRESET_ROUTES = [
  { from: 'DEL', to: 'MUM', label: 'Delhi → Mumbai' },
  { from: 'BLR', to: 'CHE', label: 'Bengaluru → Chennai' },
  { from: 'KOL', to: 'HYD', label: 'Kolkata → Hyderabad' },
  { from: 'DEL', to: 'BLR', label: 'Delhi → Bengaluru' },
];

export default function CompareModal({
  isOpen,
  onClose,
  startNode: initialStart,
  destNode: initialDest,
  mode: initialMode,
  avoidHighways: initialAvoidHighways,
  nodes = [],
}: CompareModalProps) {
  // Ensure valid start and dest node IDs
  const validStart = useMemo(() => {
    if (initialStart && nodes.some((n) => n.id === initialStart)) {
      return initialStart;
    }
    return 'DEL';
  }, [initialStart, nodes]);

  const validDest = useMemo(() => {
    if (initialDest && initialDest !== validStart && nodes.some((n) => n.id === initialDest)) {
      return initialDest;
    }
    return validStart === 'MUM' ? 'DEL' : 'MUM';
  }, [initialDest, validStart, nodes]);

  const [fromNode, setFromNode] = useState<string>(validStart);
  const [toNode, setToNode] = useState<string>(validDest);
  const [compareMode, setCompareMode] = useState<string>(initialMode || 'distance');
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Sync when modal opens with new initial props
  useEffect(() => {
    if (isOpen) {
      setFromNode(validStart);
      setToNode(validDest);
    }
  }, [isOpen, validStart, validDest]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const runCompare = useCallback(
    async (from: string, to: string, currentMode: string) => {
      if (!from || !to) return;
      if (from === to) {
        setError('Please select two distinct cities to compare algorithms.');
        setData(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(apiUrl('/api/compare'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from,
            to,
            mode: currentMode,
            avoidHighways: false,
          }),
        });

        const json = await response.json();
        if (json.success && json.comparison) {
          setData(json.comparison);
        } else {
          setError(json.error || 'Failed to compare algorithms on this route.');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Network connection failed.';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Auto-run comparison when opened or when valid endpoints are ready
  useEffect(() => {
    if (!isOpen) return;
    runCompare(fromNode, toNode, compareMode);
  }, [isOpen, fromNode, toNode, compareMode, runCompare]);

  if (!isOpen) return null;

  const startObj = nodes.find((n) => n.id === fromNode);
  const destObj = nodes.find((n) => n.id === toNode);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[2000] select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          variants={scaleIn}
          initial={prefersReducedMotion ? { opacity: 0 } : 'hidden'}
          animate="visible"
          exit={prefersReducedMotion ? { opacity: 0 } : 'exit'}
          transition={springSoft}
          className="bg-[#141416]/98 border border-white/10 text-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <GitCompare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  Algorithm Benchmark: Dijkstra vs A* Search
                </h2>
                <p className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <span>Uniform Cost Search vs Heuristic Guided A*</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
            {/* City Selectors & Quick Presets */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Start Node Selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Start City (From)
                  </label>
                  <select
                    value={fromNode}
                    onChange={(e) => setFromNode(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id} className="bg-[#1C1C1F] text-white">
                        {n.name} ({n.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Node Selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Destination City (To)
                  </label>
                  <select
                    value={toNode}
                    onChange={(e) => setToNode(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id} className="bg-[#1C1C1F] text-white">
                        {n.name} ({n.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase text-neutral-500 mr-1">
                  Presets:
                </span>
                {PRESET_ROUTES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setFromNode(preset.from);
                      setToNode(preset.to);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                      fromNode === preset.from && toNode === preset.to
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-white/5 text-neutral-400 hover:text-white border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => runCompare(fromNode, toNode, compareMode)}
                  className="ml-auto px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <RotateCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Comparing…' : 'Re-run'}</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 font-medium flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && !data && (
              <div className="py-10 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-neutral-400 font-medium">
                  Running Dijkstra and A* search across 135 graph nodes…
                </p>
              </div>
            )}

            {/* Comparison Metrics Content */}
            {data && (
              <>
                {/* Search Space Savings Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-purple-500/15 border border-emerald-500/30 shadow-lg flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>A* Search Efficiency Advantage</span>
                    </div>
                    <p className="text-xs text-neutral-300 font-medium leading-relaxed">
                      A* explored{' '}
                      <span className="font-extrabold text-white">
                        {data.metrics.nodesSaved} fewer nodes
                      </span>{' '}
                      than Dijkstra ({data.metrics.savingsPercent}% search space pruning),
                      while discovering the exact identical optimal route!
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-3xl font-black text-emerald-400 font-mono">
                      {data.metrics.savingsPercent}%
                    </div>
                    <span className="text-[10px] text-emerald-300 uppercase font-mono font-bold tracking-wider">
                      Pruned
                    </span>
                  </div>
                </div>

                {/* Head-to-Head Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Dijkstra Card */}
                  <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-bold text-xs text-neutral-200 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-neutral-400" />
                        Dijkstra's Algorithm
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-400 font-mono font-bold border border-white/10">
                        Uninformed
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400 font-medium">Nodes Explored:</span>
                        <span className="font-mono font-bold text-white text-sm">
                          {data.dijkstra.nodesExplored}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400 font-medium">Route Distance:</span>
                        <span className="font-mono font-semibold text-neutral-200">
                          {data.dijkstra.distanceKm.toFixed(1)} km
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400 font-medium">Est. Drive Time:</span>
                        <span className="font-mono font-semibold text-neutral-200">
                          {Math.round(data.dijkstra.timeMin)} min
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400 font-medium">Execution Runtime:</span>
                        <span className="font-mono font-bold text-neutral-300">
                          {data.dijkstra.executionTimeMs} ms
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* A* Search Card */}
                  <div className="bg-emerald-500/[0.04] p-4 rounded-2xl border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                      <span className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        A* Search Algorithm
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
                        Heuristic Guided
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-300/80 font-medium">Nodes Explored:</span>
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          {data.astar.nodesExplored}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-300/80 font-medium">Route Distance:</span>
                        <span className="font-mono font-semibold text-neutral-200">
                          {data.astar.distanceKm.toFixed(1)} km
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-300/80 font-medium">Est. Drive Time:</span>
                        <span className="font-mono font-semibold text-neutral-200">
                          {Math.round(data.astar.timeMin)} min
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-300/80 font-medium">Execution Runtime:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {data.astar.executionTimeMs} ms
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Discovered Path Breadcrumbs */}
                {data.astar.path && data.astar.path.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-neutral-300">
                      <span className="flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                        Optimal Discovered Path ({data.astar.path.length} Nodes)
                      </span>
                      <span className="font-mono text-emerald-400">
                        {data.astar.distanceKm.toFixed(1)} km
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto py-1">
                      {data.astar.path.map((nodeId, idx) => {
                        const nodeInfo = nodes.find((n) => n.id === nodeId);
                        const isEnd = idx === data.astar.path.length - 1;
                        return (
                          <React.Fragment key={`${nodeId}-${idx}`}>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold font-mono ${
                                idx === 0
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : isEnd
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-white/5 text-neutral-300 border border-white/10'
                              }`}
                              title={nodeInfo ? `${nodeInfo.name} (${nodeId})` : nodeId}
                            >
                              {nodeInfo?.name || nodeId}
                            </span>
                            {!isEnd && (
                              <span className="text-neutral-600 text-[10px]">→</span>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Academic Concept Explanation */}
                <div className="p-3.5 bg-white/[0.02] rounded-2xl border border-white/10 text-[11px] text-neutral-400 space-y-1.5">
                  <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Why does A* search explore significantly fewer nodes?
                  </span>
                  <p className="leading-relaxed">
                    Dijkstra radiates outward uniformly in circles regardless of target
                    direction. A* incorporates an admissible Haversine straight-line distance
                    heuristic <code className="text-emerald-300 px-1 py-0.5 rounded bg-white/5">h(n)</code>,
                    guiding search along a focused elliptical cone toward the destination. Because{' '}
                    <code className="text-emerald-300 px-1 py-0.5 rounded bg-white/5">h(n) ≤ d*(n, target)</code>,
                    mathematical optimality is 100% guaranteed.
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

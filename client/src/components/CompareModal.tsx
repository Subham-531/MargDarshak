import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  GitCompare,
  X,
  Sparkles,
  Cpu,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { Button, Card, KpiTile, SkeletonCard } from './ui';
import { springSoft, scaleIn } from '../lib/motion';
import { NodeItem } from './ControlPanel';

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

export default function CompareModal({
  isOpen,
  onClose,
  startNode,
  destNode,
  mode,
  avoidHighways,
  nodes = [],
}: CompareModalProps) {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen || !startNode || !destNode) return;

    const runCompare = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: startNode,
            to: destNode,
            mode,
            avoidHighways,
          }),
        });
        const json = await response.json();
        if (json.success) {
          setData(json.comparison);
        } else {
          setError(json.error || 'Failed to compare algorithms.');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Network error';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    runCompare();
  }, [isOpen, startNode, destNode, mode, avoidHighways]);

  if (!isOpen) return null;

  const startObj = nodes.find((n) => n.id === startNode);
  const destObj = nodes.find((n) => n.id === destNode);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-ink-950/40 backdrop-blur-md flex items-center justify-center p-4 z-[2000] select-none">
        <motion.div
          variants={scaleIn}
          initial={prefersReducedMotion ? { opacity: 0 } : 'hidden'}
          animate="visible"
          exit={prefersReducedMotion ? { opacity: 0 } : 'exit'}
          transition={springSoft}
          className="bg-white/95 backdrop-blur-2xl border border-white/90 rounded-3xl w-full max-w-2xl shadow-soft-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-[#FAF8FE] to-[#F5EEFF]/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#E9DEFF] text-purple-900 flex items-center justify-center shadow-soft border border-purple-200/60">
                <GitCompare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-ink-900">
                  Algorithm Comparison: Dijkstra vs A* Search
                </h2>
                <p className="text-[11px] text-ink-500 font-semibold flex items-center gap-1.5 mt-0.5">
                  <span>{startObj?.name || startNode}</span>
                  <span className="text-purple-400">→</span>
                  <span>{destObj?.name || destNode}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-ink-100 text-ink-600 font-mono text-[10px] uppercase">
                    {mode}
                  </span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-ink-400 hover:text-ink-900 rounded-full hover:bg-ink-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
            {loading && (
              <div className="space-y-3 py-6">
                <SkeletonCard />
                <div className="grid grid-cols-2 gap-3">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-[#FFE4E6] border border-rose-200 rounded-2xl text-xs text-rose-900 font-medium">
                {error}
              </div>
            )}

            {data && !loading && (
              <>
                {/* Savings Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#F5EEFF] via-[#FFF3EC] to-[#EDFAF3] border border-purple-200/80 shadow-soft flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-4 h-4 text-purple-700" />
                      <span>A* Search Efficiency Advantage</span>
                    </div>
                    <p className="text-[11px] text-ink-700 font-medium leading-relaxed">
                      A* explored{' '}
                      <span className="font-extrabold text-ink-900">
                        {data.metrics.nodesSaved} fewer nodes
                      </span>{' '}
                      than Dijkstra ({data.metrics.savingsPercent}% search space
                      pruning), while finding the exact identical shortest path!
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-3xl font-black text-purple-900 font-mono">
                      {data.metrics.savingsPercent}%
                    </div>
                    <span className="text-[10px] text-purple-700 uppercase font-mono font-bold">
                      Pruned
                    </span>
                  </div>
                </div>

                {/* Head-to-Head Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Dijkstra Card */}
                  <div className="bg-white/80 p-4 rounded-2xl border border-ink-100 shadow-soft space-y-3">
                    <div className="flex items-center justify-between border-b border-ink-100 pb-2">
                      <span className="font-bold text-xs text-ink-800 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-ink-500" />
                        Dijkstra's Algorithm
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-ink-100 text-ink-600 font-mono font-bold">
                        Uninformed
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-ink-500 font-medium">Nodes Explored:</span>
                        <span className="font-mono font-bold text-ink-900 text-sm">
                          {data.dijkstra.nodesExplored}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ink-500 font-medium">Total Distance:</span>
                        <span className="font-mono font-semibold text-ink-800">
                          {data.dijkstra.distanceKm} km
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ink-500 font-medium">Est. Time:</span>
                        <span className="font-mono font-semibold text-ink-800">
                          {Math.round(data.dijkstra.timeMin)} min
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ink-500 font-medium">Runtime:</span>
                        <span className="font-mono font-bold text-ink-600">
                          {data.dijkstra.executionTimeMs} ms
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* A* Search Card */}
                  <div className="bg-gradient-to-br from-[#F8F3FF] to-[#FAF8FE] p-4 rounded-2xl border border-purple-200/80 shadow-soft space-y-3">
                    <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                      <span className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-purple-700" />
                        A* Search Algorithm
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E9DEFF] text-purple-900 font-mono font-bold border border-purple-200/60">
                        Heuristic Guided
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-900 font-medium">Nodes Explored:</span>
                        <span className="font-mono font-bold text-purple-950 text-sm">
                          {data.astar.nodesExplored}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-900 font-medium">Total Distance:</span>
                        <span className="font-mono font-semibold text-ink-800">
                          {data.astar.distanceKm} km
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-900 font-medium">Est. Time:</span>
                        <span className="font-mono font-semibold text-ink-800">
                          {Math.round(data.astar.timeMin)} min
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-900 font-medium">Runtime:</span>
                        <span className="font-mono font-bold text-purple-800">
                          {data.astar.executionTimeMs} ms
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Concept Note */}
                <div className="p-3.5 bg-white/70 rounded-2xl border border-ink-100 text-[11px] text-ink-600 space-y-1">
                  <span className="font-bold text-ink-900 block">
                    Why does A* explore fewer nodes?
                  </span>
                  <p className="leading-relaxed">
                    Dijkstra radiates outward in concentric circles regardless
                    of destination. A* incorporates an admissible Haversine
                    straight-line distance heuristic \(h(n)\), directing an
                    elliptical search cone straight towards the goal. Because{' '}
                    \(h(n) \le d^*(n, \text{dest})\), mathematical optimality is
                    100% guaranteed!
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


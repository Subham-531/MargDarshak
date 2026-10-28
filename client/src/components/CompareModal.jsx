import React, { useState, useEffect } from 'react';
import { GitCompare, X, CheckCircle, Zap, Cpu, Sparkles, TrendingDown, ArrowRight } from 'lucide-react';

export default function CompareModal({
  isOpen,
  onClose,
  startNode,
  destNode,
  mode,
  avoidHighways,
  nodes = []
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
            avoidHighways
          })
        });
        const json = await response.json();
        if (json.success) {
          setData(json.comparison);
        } else {
          setError(json.error || 'Failed to compare algorithms.');
        }
      } catch (err) {
        setError(err.message);
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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[2000] animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Algorithm Comparison: Dijkstra vs A* Search
              </h2>
              <p className="text-[11px] text-slate-400">
                Route: {startObj?.name || startNode} → {destObj?.name || destNode} ({mode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {loading && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs">Executing Dijkstra and A* simultaneously...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-200">
              {error}
            </div>
          )}

          {data && !loading && (
            <>
              {/* Savings Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/60 to-cyan-950/60 border border-purple-800/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-purple-300 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>A* Search Efficiency Advantage</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    A* explored <span className="font-bold text-white">{data.metrics.nodesSaved} fewer nodes</span> than Dijkstra ({data.metrics.savingsPercent}% reduction), while finding the exact identical shortest path!
                  </p>
                </div>
                <div className="text-right pl-4">
                  <div className="text-2xl font-black text-cyan-400 font-mono">
                    {data.metrics.savingsPercent}%
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Pruned</span>
                </div>
              </div>

              {/* Head-to-Head Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Dijkstra Card */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-slate-400" />
                      Dijkstra's Algorithm
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      Uninformed
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nodes Explored:</span>
                      <span className="font-mono font-bold text-slate-200">
                        {data.dijkstra.nodesExplored}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Distance:</span>
                      <span className="font-mono text-slate-200">
                        {data.dijkstra.distanceKm} km
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Est. Time:</span>
                      <span className="font-mono text-slate-200">
                        {Math.round(data.dijkstra.timeMin)} min
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Runtime:</span>
                      <span className="font-mono text-slate-400">
                        {data.dijkstra.executionTimeMs} ms
                      </span>
                    </div>
                  </div>
                </div>

                {/* A* Search Card */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-cyan-800/60 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-xs text-cyan-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      A* Search Algorithm
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                      Heuristic Guided
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nodes Explored:</span>
                      <span className="font-mono font-bold text-cyan-400">
                        {data.astar.nodesExplored}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Distance:</span>
                      <span className="font-mono text-slate-200">
                        {data.astar.distanceKm} km
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Est. Time:</span>
                      <span className="font-mono text-slate-200">
                        {Math.round(data.astar.timeMin)} min
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Runtime:</span>
                      <span className="font-mono text-slate-400">
                        {data.astar.executionTimeMs} ms
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Concept Note */}
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">Why does A* explore fewer nodes?</span>
                <p>
                  Dijkstra radiates outward in concentric circles regardless of where the destination lies. A* incorporates an admissible Haversine straight-line heuristic \(h(n)\), creating an elliptical search cone pointed straight towards the goal. Because \(h(n) \le d^*(n, \text{dest})\), optimality is 100% mathematically preserved!
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  BookOpen,
  X,
  Cpu,
  Zap,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from './ui';
import { springSoft, scaleIn } from '../lib/motion';
import { cn } from '../lib/utils';

export interface VivaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VivaGuideModal({
  isOpen,
  onClose,
}: VivaGuideModalProps) {
  const [activeSection, setActiveSection] = useState<
    'concepts' | 'complexity' | 'qa'
  >('concepts');
  const prefersReducedMotion = useReducedMotion();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-ink-950/40 backdrop-blur-md flex items-center justify-center p-4 z-[2000] select-none">
        <motion.div
          variants={scaleIn}
          initial={prefersReducedMotion ? { opacity: 0 } : 'hidden'}
          animate="visible"
          exit={prefersReducedMotion ? { opacity: 0 } : 'exit'}
          transition={springSoft}
          className="bg-white/95 backdrop-blur-2xl border border-white/90 rounded-3xl w-full max-w-4xl shadow-soft-xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-purple-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#FAF8FE] to-[#F5EEFF]/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FFE5D9] text-amber-950 flex items-center justify-center shadow-soft border border-orange-200/60">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-ink-900">
                  MargDarshak DSA Reference & University Viva Guide
                </h2>
                <p className="text-[11px] text-ink-500 font-semibold mt-0.5">
                  Subject: Data Structures & Algorithms · B.E. CSE, Chandigarh University
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-ink-100/80 p-0.5 rounded-full border border-ink-200/60 text-xs shadow-inner">
                <button
                  type="button"
                  onClick={() => setActiveSection('concepts')}
                  className={cn(
                    'px-3 py-1 rounded-full font-bold transition-all cursor-pointer',
                    activeSection === 'concepts'
                      ? 'bg-white text-ink-900 shadow-soft'
                      : 'text-ink-600 hover:text-ink-900'
                  )}
                >
                  DSA Concepts
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('complexity')}
                  className={cn(
                    'px-3 py-1 rounded-full font-bold transition-all cursor-pointer',
                    activeSection === 'complexity'
                      ? 'bg-white text-ink-900 shadow-soft'
                      : 'text-ink-600 hover:text-ink-900'
                  )}
                >
                  Complexity Table
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('qa')}
                  className={cn(
                    'px-3 py-1 rounded-full font-bold transition-all cursor-pointer',
                    activeSection === 'qa'
                      ? 'bg-white text-ink-900 shadow-soft'
                      : 'text-ink-600 hover:text-ink-900'
                  )}
                >
                  Viva Q&A
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-ink-400 hover:text-ink-900 rounded-full hover:bg-ink-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-ink-700 leading-relaxed font-medium">
            {activeSection === 'concepts' && (
              <div className="space-y-4">
                {/* Concept 1 */}
                <div className="bg-white/80 p-4 sm:p-5 rounded-2xl border border-purple-200/60 shadow-soft space-y-2">
                  <h3 className="text-sm font-extrabold text-purple-950 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 ring-4 ring-purple-100"></span>
                    1. Graph Representation: Adjacency List
                  </h3>
                  <p>
                    Road networks are sparse graphs where vertices (intersections/towns) have low degree (typically 2 to 5 roads per junction). Storing with an <span className="text-ink-900 font-bold">Adjacency List</span> requires only <span className="font-mono text-purple-900 font-bold">O(V + E)</span> space, compared to an Adjacency Matrix which would consume <span className="font-mono text-rose-700 font-bold">O(V²)</span> memory (wasting ~90% of memory on zeroes). Finding neighbors runs in <span className="font-mono text-purple-900 font-bold">O(deg(u))</span> time.
                  </p>
                </div>

                {/* Concept 2 */}
                <div className="bg-white/80 p-4 sm:p-5 rounded-2xl border border-orange-200/60 shadow-soft space-y-2">
                  <h3 className="text-sm font-extrabold text-amber-950 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-amber-100"></span>
                    2. Binary Min-Heap Priority Queue (Implemented from Scratch)
                  </h3>
                  <p>
                    Dijkstra and A* repeatedly extract the unvisited node with minimum tentative cost. Using an array or linear scan takes <span className="font-mono text-rose-700 font-bold">O(V)</span> per extraction (<span className="font-mono text-rose-700 font-bold">O(V²)</span> total). Our custom <span className="text-ink-900 font-bold">MinHeap</span> maintains the complete binary tree invariant in contiguous memory with bubble-up and bubble-down routines, achieving <span className="font-mono text-emerald-800 font-bold">O(log V)</span> push and pop operations!
                  </p>
                </div>

                {/* Concept 3 */}
                <div className="bg-white/80 p-4 sm:p-5 rounded-2xl border border-purple-200/60 shadow-soft space-y-2">
                  <h3 className="text-sm font-extrabold text-purple-950 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 ring-4 ring-purple-100"></span>
                    3. Dijkstra's Algorithm (Greedy Shortest Path)
                  </h3>
                  <p>
                    Maintains a distance map and settles nodes in order of increasing distance from source. Relaxation step:
                  </p>
                  <div className="p-3 bg-[#FAF8FE] rounded-xl font-mono text-[11px] text-purple-950 border border-purple-100 shadow-inner">
                    if (dist[u] + weight(u, v) &lt; dist[v]) &#123; dist[v] = dist[u] + weight(u, v); parent[v] = u; pq.push(v, dist[v]); &#125;
                  </div>
                  <p>
                    Guaranteed to find the globally optimal shortest path on graphs with non-negative edge weights in <span className="font-mono text-purple-900 font-bold">O((V + E) log V)</span> time.
                  </p>
                </div>

                {/* Concept 4 */}
                <div className="bg-white/80 p-4 sm:p-5 rounded-2xl border border-emerald-200/60 shadow-soft space-y-2">
                  <h3 className="text-sm font-extrabold text-emerald-950 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-100"></span>
                    4. A* Search & Proof of Heuristic Admissibility
                  </h3>
                  <p>
                    A* uses evaluation function <span className="font-mono text-emerald-900 font-extrabold">f(n) = g(n) + h(n)</span>, where <span className="font-mono text-ink-900 font-bold">g(n)</span> is the exact cost from start to n, and <span className="font-mono text-ink-900 font-bold">h(n)</span> is the heuristic estimate to destination.
                  </p>
                  <div className="space-y-2 pl-3 border-l-2 border-emerald-300">
                    <div>
                      <span className="font-bold text-ink-900">Distance Mode: </span>
                      <span className="font-mono text-emerald-800 font-bold">h(n) = Haversine(n, dest)</span>. On Earth's sphere, the great-circle arc is the shortest possible path between two coordinates. Thus, <span className="font-mono text-ink-900">Haversine(n, dest) ≤ actual_road_distance(n, dest)</span>. The heuristic is strictly admissible (never overestimates).
                    </div>
                    <div>
                      <span className="font-bold text-ink-900">Travel Time Mode: </span>
                      <span className="font-mono text-emerald-800 font-bold">h(n) = (Haversine(n, dest) / maxSpeed) × 60</span>. Since road distance ≥ Haversine distance, and actual vehicle speed ≤ maxSpeed across the entire road network (e.g. 80 km/h), the estimated time is guaranteed to be ≤ true travel time.
                    </div>
                  </div>
                </div>

                {/* Concept 5 */}
                <div className="bg-white/80 p-4 sm:p-5 rounded-2xl border border-sky-200/60 shadow-soft space-y-2">
                  <h3 className="text-sm font-extrabold text-sky-950 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-4 ring-sky-100"></span>
                    5. Held-Karp Bitmask DP for Multi-Stop TSP (P3)
                  </h3>
                  <p>
                    When traveling through multiple intermediate stops in the best possible sequence, checking all permutations takes <span className="font-mono text-rose-700 font-bold">O(k!)</span>. We formulate it as dynamic programming over subsets (bitmasks):
                  </p>
                  <div className="p-3 bg-[#FAF8FE] rounded-xl font-mono text-[11px] text-sky-950 border border-sky-100 shadow-inner">
                    dp(mask, u) = min over v [ dp(mask ^ (1 &lt;&lt; u), v) + dist(v, u) ]
                  </div>
                  <p>
                    Complexity is reduced to <span className="font-mono text-sky-900 font-bold">O(2^k · k²)</span>, which easily computes the optimal route for up to 8 stops in under 1 millisecond.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'complexity' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-ink-100 overflow-hidden font-mono text-xs shadow-soft bg-white">
                  <table className="w-full text-left">
                    <thead className="bg-[#FAF8FE] text-ink-500 border-b border-ink-100 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-3.5">DSA Component / Operation</th>
                        <th className="py-3 px-3.5">Time Complexity</th>
                        <th className="py-3 px-3.5">Space Complexity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-50">
                      <tr className="hover:bg-[#F5EEFF]/40">
                        <td className="py-2.5 px-3.5 font-bold text-ink-900 font-sans">Adjacency List Graph</td>
                        <td className="py-2.5 px-3.5 text-purple-900 font-semibold">O(deg(u)) neighbor retrieval</td>
                        <td className="py-2.5 px-3.5 text-purple-900 font-semibold">O(V + E)</td>
                      </tr>
                      <tr className="hover:bg-[#FFF3EB]/40">
                        <td className="py-2.5 px-3.5 font-bold text-ink-900 font-sans">MinHeap Push & Pop</td>
                        <td className="py-2.5 px-3.5 text-amber-900 font-semibold">O(log V)</td>
                        <td className="py-2.5 px-3.5 text-amber-900 font-semibold">O(V)</td>
                      </tr>
                      <tr className="hover:bg-[#F5EEFF]/40">
                        <td className="py-2.5 px-3.5 font-bold text-ink-900 font-sans">Dijkstra's Algorithm</td>
                        <td className="py-2.5 px-3.5 text-purple-900 font-semibold">O((V + E) log V)</td>
                        <td className="py-2.5 px-3.5 text-purple-900 font-semibold">O(V)</td>
                      </tr>
                      <tr className="hover:bg-[#EDFAF3]/40">
                        <td className="py-2.5 px-3.5 font-bold text-ink-900 font-sans">A* Search</td>
                        <td className="py-2.5 px-3.5 text-emerald-900 font-semibold">O((V + E) log V) worst, ~40-60% fewer in practice</td>
                        <td className="py-2.5 px-3.5 text-emerald-900 font-semibold">O(V)</td>
                      </tr>
                      <tr className="hover:bg-[#F5EEFF]/40">
                        <td className="py-2.5 px-3.5 font-bold text-ink-900 font-sans">Haversine Heuristic</td>
                        <td className="py-2.5 px-3.5 text-purple-900 font-semibold">O(1)</td>
                        <td className="py-2.5 px-3.5 text-purple-900 font-semibold">O(1)</td>
                      </tr>
                      <tr className="hover:bg-[#FFF3EB]/40">
                        <td className="py-2.5 px-3.5 font-bold text-ink-900 font-sans">Location Snapping (Nearest Node)</td>
                        <td className="py-2.5 px-3.5 text-amber-900 font-semibold">O(V)</td>
                        <td className="py-2.5 px-3.5 text-amber-900 font-semibold">O(1)</td>
                      </tr>
                      <tr className="hover:bg-[#EDFAF3]/40">
                        <td className="py-2.5 px-3.5 font-bold text-ink-900 font-sans">Held-Karp Bitmask DP (TSP)</td>
                        <td className="py-2.5 px-3.5 text-sky-900 font-semibold">O(2^k · k²) for k stops</td>
                        <td className="py-2.5 px-3.5 text-sky-900 font-semibold">O(2^k · k)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeSection === 'qa' && (
              <div className="space-y-3">
                <div className="bg-white/80 p-4 sm:p-5 rounded-2xl border border-purple-200/60 shadow-soft space-y-2">
                  <span className="font-extrabold text-purple-950 block text-xs">
                    Q1: Why does Dijkstra fail on negative edge weights, and did you handle that?
                  </span>
                  <p>
                    Dijkstra is a greedy algorithm that settles the shortest distance to a node the moment it is popped from the priority queue, assuming no future edge can decrease that distance. Negative edge weights violate this greedy invariant. In MargDarshak, all weights represent physical road distances (km) and travel durations (minutes), which are strictly positive. Our graph loader validates at startup and explicitly rejects any edge with distance &le; 0 or speed &le; 0 (verified by Test T6).
                  </p>
                </div>

                <div className="bg-white/80 p-4 sm:p-5 rounded-2xl border border-orange-200/60 shadow-soft space-y-2">
                  <span className="font-extrabold text-amber-950 block text-xs">
                    Q2: What happens if an A* heuristic overestimates the distance?
                  </span>
                  <p>
                    If \(h(n) &gt; d^*(n, \text&#123;dest&#125;)\), the heuristic is inadmissible. A* can then greedily explore a sub-optimal path and prematurely terminate before finding the true shortest route. By using the Haversine great-circle distance (the geometric minimum between two geographic coordinates), \(h(n)\) is mathematically proven to never overestimate.
                  </p>
                </div>

                <div className="bg-white/80 p-4 sm:p-5 rounded-2xl border border-purple-200/60 shadow-soft space-y-2">
                  <span className="font-extrabold text-purple-950 block text-xs">
                    Q3: Why do "Shortest Distance" and "Fastest Time" yield different paths on Indian highways and mountain routes?
                  </span>
                  <p>
                    National Highways and Expressways allow higher cruising speeds (80–100 km/h), meaning a slightly longer route via major 4/6-lane highways is often significantly faster in time than a physically shorter local road or winding mountain route where speeds drop to 25–40 km/h.
                  </p>
                </div>

                <div className="bg-white/80 p-4 sm:p-5 rounded-2xl border border-emerald-200/60 shadow-soft space-y-2">
                  <span className="font-extrabold text-emerald-950 block text-xs">
                    Q4: How does the step-by-step backward simulation work?
                  </span>
                  <p>
                    Instead of trying to invert complex relaxation mathematics backwards, our algorithm core's TraceRecorder records a discrete immutable event snapshot at each pop, relax, and push step, capturing the priority queue state and distance map. Replaying backward simply restores the snapshot at index (step - 1) in \(O(1)\) time.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


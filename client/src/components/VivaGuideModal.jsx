import React, { useState } from 'react';
import { BookOpen, X, Code, CheckCircle, HelpCircle, Layers, Cpu, Zap, Hash } from 'lucide-react';

export default function VivaGuideModal({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('concepts'); // 'concepts' | 'complexity' | 'qa'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[2000] animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                MargDarshak DSA Reference & University Viva Guide
              </h2>
              <p className="text-[11px] text-slate-400">
                Subject: Data Structures & Algorithms · B.E. CSE, Chandigarh University
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setActiveSection('concepts')}
                className={`px-3 py-1 rounded-md transition ${
                  activeSection === 'concepts'
                    ? 'bg-cyan-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                DSA Concepts
              </button>
              <button
                onClick={() => setActiveSection('complexity')}
                className={`px-3 py-1 rounded-md transition ${
                  activeSection === 'complexity'
                    ? 'bg-cyan-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Complexity Table
              </button>
              <button
                onClick={() => setActiveSection('qa')}
                className={`px-3 py-1 rounded-md transition ${
                  activeSection === 'qa'
                    ? 'bg-cyan-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Viva Q&A
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {activeSection === 'concepts' && (
            <div className="space-y-6">
              {/* Concept 1 */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  1. Graph Representation: Adjacency List
                </h3>
                <p>
                  Road networks are sparse graphs where vertices (intersections/towns) have low degree (typically 2 to 5 roads per junction). Storing with an <span className="text-white font-semibold">Adjacency List</span> requires only <span className="font-mono text-cyan-400">O(V + E)</span> space, compared to an Adjacency Matrix which would consume <span className="font-mono text-red-400">O(V²)</span> memory (wasting ~90% of memory on zeroes). Finding neighbors runs in <span className="font-mono text-cyan-400">O(deg(u))</span> time.
                </p>
              </div>

              {/* Concept 2 */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  2. Binary Min-Heap Priority Queue (Implemented from Scratch)
                </h3>
                <p>
                  Dijkstra and A* repeatedly extract the unvisited node with minimum tentative cost. Using an array or linear scan takes <span className="font-mono text-red-400">O(V)</span> per extraction (<span className="font-mono text-red-400">O(V²)</span> total). Our custom <span className="text-white font-semibold">MinHeap</span> maintains the complete binary tree invariant in contiguous memory with bubble-up and bubble-down routines, achieving <span className="font-mono text-emerald-400">O(log V)</span> push and pop operations!
                </p>
              </div>

              {/* Concept 3 */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  3. Dijkstra's Algorithm (Greedy Shortest Path)
                </h3>
                <p>
                  Maintains a distance map and settles nodes in order of increasing distance from source. Relaxation step:
                </p>
                <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-[11px] text-purple-300 border border-slate-800">
                  if (dist[u] + weight(u, v) &lt; dist[v]) &#123; dist[v] = dist[u] + weight(u, v); parent[v] = u; pq.push(v, dist[v]); &#125;
                </div>
                <p>
                  Guaranteed to find the globally optimal shortest path on graphs with non-negative edge weights in <span className="font-mono text-purple-400">O((V + E) log V)</span> time.
                </p>
              </div>

              {/* Concept 4 */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  4. A* Search & Proof of Heuristic Admissibility
                </h3>
                <p>
                  A* uses evaluation function <span className="font-mono text-emerald-400 font-bold">f(n) = g(n) + h(n)</span>, where <span className="font-mono text-slate-200">g(n)</span> is the exact cost from start to n, and <span className="font-mono text-slate-200">h(n)</span> is the heuristic estimate to destination.
                </p>
                <div className="space-y-1.5 pl-3 border-l-2 border-emerald-500/60">
                  <div>
                    <span className="font-bold text-slate-200">Distance Mode: </span>
                    <span className="font-mono text-emerald-400">h(n) = Haversine(n, dest)</span>. On Earth's sphere, the great-circle arc is the shortest possible path between two coordinates. Thus, <span className="font-mono text-slate-200">Haversine(n, dest) ≤ actual_road_distance(n, dest)</span>. The heuristic is strictly admissible (never overestimates).
                  </div>
                  <div>
                    <span className="font-bold text-slate-200">Travel Time Mode: </span>
                    <span className="font-mono text-emerald-400">h(n) = (Haversine(n, dest) / maxSpeed) × 60</span>. Since road distance ≥ Haversine distance, and actual vehicle speed ≤ maxSpeed across the entire road network (e.g. 80 km/h), the estimated time is guaranteed to be ≤ true travel time.
                  </div>
                </div>
              </div>

              {/* Concept 5 */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-blue-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  5. Held-Karp Bitmask DP for Multi-Stop TSP (P3)
                </h3>
                <p>
                  When traveling through multiple intermediate stops in the best possible sequence, checking all permutations takes <span className="font-mono text-red-400">O(k!)</span>. We formulate it as dynamic programming over subsets (bitmasks):
                </p>
                <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-[11px] text-blue-300 border border-slate-800">
                  dp(mask, u) = min over v [ dp(mask ^ (1 &lt;&lt; u), v) + dist(v, u) ]
                </div>
                <p>
                  Complexity is reduced to <span className="font-mono text-blue-400">O(2^k · k²)</span>, which easily computes the optimal route for up to 8 stops in under 1 millisecond.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'complexity' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">DSA Component / Operation</th>
                      <th className="py-2.5 px-3">Time Complexity</th>
                      <th className="py-2.5 px-3">Space Complexity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr className="bg-slate-900/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">Adjacency List Graph</td>
                      <td className="py-2.5 px-3 text-cyan-400">O(deg(u)) neighbor retrieval</td>
                      <td className="py-2.5 px-3 text-cyan-400">O(V + E)</td>
                    </tr>
                    <tr className="bg-slate-900/20">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">MinHeap Push & Pop</td>
                      <td className="py-2.5 px-3 text-amber-400">O(log V)</td>
                      <td className="py-2.5 px-3 text-amber-400">O(V)</td>
                    </tr>
                    <tr className="bg-slate-900/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">Dijkstra's Algorithm</td>
                      <td className="py-2.5 px-3 text-purple-400">O((V + E) log V)</td>
                      <td className="py-2.5 px-3 text-purple-400">O(V)</td>
                    </tr>
                    <tr className="bg-slate-900/20">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">A* Search</td>
                      <td className="py-2.5 px-3 text-emerald-400">O((V + E) log V) worst, ~40-60% fewer in practice</td>
                      <td className="py-2.5 px-3 text-emerald-400">O(V)</td>
                    </tr>
                    <tr className="bg-slate-900/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">Haversine Heuristic</td>
                      <td className="py-2.5 px-3 text-cyan-400">O(1)</td>
                      <td className="py-2.5 px-3 text-cyan-400">O(1)</td>
                    </tr>
                    <tr className="bg-slate-900/20">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">Location Snapping (Nearest Node)</td>
                      <td className="py-2.5 px-3 text-amber-400">O(V)</td>
                      <td className="py-2.5 px-3 text-amber-400">O(1)</td>
                    </tr>
                    <tr className="bg-slate-900/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">Held-Karp Bitmask DP (TSP)</td>
                      <td className="py-2.5 px-3 text-blue-400">O(2^k · k²) for k stops</td>
                      <td className="py-2.5 px-3 text-blue-400">O(2^k · k)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'qa' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-400 block">
                  Q1: Why does Dijkstra fail on negative edge weights, and did you handle that?
                </span>
                <p>
                  Dijkstra is a greedy algorithm that settles the shortest distance to a node the moment it is popped from the priority queue, assuming no future edge can decrease that distance. Negative edge weights violate this greedy invariant. In MargDarshak, all weights represent physical road distances (km) and travel durations (minutes), which are strictly positive. Our graph loader validates at startup and explicitly rejects any edge with distance &le; 0 or speed &le; 0 (verified by Test T6).
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-amber-400 block">
                  Q2: What happens if an A* heuristic overestimates the distance?
                </span>
                <p>
                  If \(h(n) &gt; d^*(n, \text&#123;dest&#125;)\), the heuristic is inadmissible. A* can then greedily explore a sub-optimal path and prematurely terminate before finding the true shortest route. By using the Haversine great-circle distance (the geometric minimum between two geographic coordinates), \(h(n)\) is mathematically proven to never overestimate.
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-purple-400 block">
                  Q3: Why do "Shortest Distance" and "Fastest Time" yield different paths on Indian highways and mountain routes?
                </span>
                <p>
                  National Highways and Expressways allow higher cruising speeds (80–100 km/h), meaning a slightly longer route via major 4/6-lane highways is often significantly faster in time than a physically shorter local road or winding mountain route where speeds drop to 25–40 km/h.
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-emerald-400 block">
                  Q4: How does the step-by-step backward simulation work?
                </span>
                <p>
                  Instead of trying to invert complex relaxation mathematics backwards, our algorithm core's TraceRecorder records a discrete immutable event snapshot at each pop, relax, and push step, capturing the priority queue state and distance map. Replaying backward simply restores the snapshot at index (step - 1) in \(O(1)\) time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

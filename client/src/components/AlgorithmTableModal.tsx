import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { GitCompare, X } from 'lucide-react';
import { scaleIn, springSoft } from '../lib/motion';

interface AlgorithmTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const algorithms = [
  {
    name: "Dijkstra's Algorithm",
    best: 'O((V + E) log V)',
    worst: 'O((V + E) log V)',
    space: 'O(V + E)',
    shortest: 'Yes, with non-negative weights',
    useCase: 'Weighted road networks',
  },
  {
    name: 'A* Search',
    best: 'O(d) with a perfect heuristic',
    worst: 'O(b^d)',
    space: 'O(b^d)',
    shortest: 'Yes, with an admissible heuristic',
    useCase: 'Heuristic-guided route finding',
  },
  {
    name: 'Breadth-First Search (BFS)',
    best: 'O(V + E)',
    worst: 'O(V + E)',
    space: 'O(V)',
    shortest: 'Yes, for unweighted/equal-cost edges',
    useCase: 'Unweighted graphs and minimum-hop paths',
  },
  {
    name: 'Depth-First Search (DFS)',
    best: 'O(V + E)',
    worst: 'O(V + E)',
    space: 'O(V)',
    shortest: 'No',
    useCase: 'Connectivity, traversal, and cycle detection',
  },
  {
    name: 'Bellman-Ford',
    best: 'O(E) with early stopping',
    worst: 'O(VE)',
    space: 'O(V)',
    shortest: 'Yes, if no reachable negative cycle',
    useCase: 'Weighted graphs with negative edges',
  },
];

export default function AlgorithmTableModal({
  isOpen,
  onClose,
}: AlgorithmTableModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    dialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[2100] flex items-center justify-center bg-ink-950/50 p-3 backdrop-blur-sm sm:p-6"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <motion.section
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="algorithm-table-title"
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              onClose();
            }
          }}
          variants={scaleIn}
          initial={prefersReducedMotion ? { opacity: 0 } : 'hidden'}
          animate="visible"
          exit={prefersReducedMotion ? { opacity: 0 } : 'exit'}
          transition={springSoft}
          className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/90 bg-white/95 shadow-soft-xl backdrop-blur-2xl"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <header className="flex items-center justify-between border-b border-purple-100 bg-gradient-to-r from-[#FAF8FE] to-[#F5EEFF]/80 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-200/60 bg-[#E9DEFF] text-purple-900 shadow-soft">
                <GitCompare className="h-5 w-5" />
              </span>
              <div>
                <h2
                  id="algorithm-table-title"
                  className="text-sm font-extrabold text-ink-900 sm:text-base"
                >
                  Pathfinding Algorithm Comparison
                </h2>
                <p className="mt-0.5 text-[11px] font-medium text-ink-500">
                  Complexity and shortest-path guarantees at a glance
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close algorithm comparison"
              className="rounded-full p-2 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="overflow-auto p-3 sm:p-5">
            <table className="w-full min-w-[880px] border-separate border-spacing-0 text-left text-xs">
              <thead>
                <tr className="bg-[#F5EEFF] text-[10px] uppercase tracking-wide text-purple-950">
                  <th scope="col" className="rounded-l-xl px-3 py-3 font-extrabold">
                    Algorithm Name
                  </th>
                  <th scope="col" className="px-3 py-3 font-extrabold">
                    Time Complexity (Best / Worst)
                  </th>
                  <th scope="col" className="px-3 py-3 font-extrabold">
                    Space Complexity
                  </th>
                  <th scope="col" className="px-3 py-3 font-extrabold">
                    Guarantees Shortest Path?
                  </th>
                  <th scope="col" className="rounded-r-xl px-3 py-3 font-extrabold">
                    Ideal Use Case
                  </th>
                </tr>
              </thead>
              <tbody>
                {algorithms.map((algorithm) => (
                  <tr key={algorithm.name} className="text-ink-700">
                    <th
                      scope="row"
                      className="border-b border-ink-100 px-3 py-3 font-bold text-ink-900"
                    >
                      {algorithm.name}
                    </th>
                    <td className="border-b border-ink-100 px-3 py-3 font-mono text-[11px]">
                      {algorithm.best}
                      <span className="my-1 block font-sans text-[9px] font-bold uppercase text-ink-400">
                        best
                      </span>
                      {algorithm.worst}
                      <span className="my-1 block font-sans text-[9px] font-bold uppercase text-ink-400">
                        worst
                      </span>
                    </td>
                    <td className="border-b border-ink-100 px-3 py-3 font-mono text-[11px]">
                      {algorithm.space}
                    </td>
                    <td className="border-b border-ink-100 px-3 py-3">
                      {algorithm.shortest}
                    </td>
                    <td className="border-b border-ink-100 px-3 py-3">
                      {algorithm.useCase}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-[10px] leading-relaxed text-ink-500">
              V is the number of vertices, E the number of edges, b the search
              branching factor, and d the depth of the optimal solution.
              Complexities assume standard graph implementations; A* performance
              depends on its heuristic.
            </p>
          </div>
        </motion.section>
      </div>
    </AnimatePresence>
  );
}

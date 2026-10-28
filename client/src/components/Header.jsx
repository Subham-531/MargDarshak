import React from 'react';
import { Compass, GitCompare, BookOpen, CheckCircle2, PlayCircle, Layers } from 'lucide-react';

export default function Header({
  onOpenCompare,
  onOpenViva,
  onOpenTests,
  hasRoute,
  onStartSimulation,
  isSimulating,
  stats
}) {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-6 flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
          <Compass className="w-6 h-6 animate-spin-slow" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
              PathScope
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              v1.0 · Chandigarh & Himachal
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            DSA Route Planner & Step-by-Step Algorithm Visualizer · Manas Gupta (Chandigarh University)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {hasRoute && !isSimulating && (
          <button
            onClick={onStartSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition shadow-md shadow-amber-500/20 animate-pulse"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Simulate Search</span>
          </button>
        )}

        <button
          onClick={onOpenCompare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          title="Compare Dijkstra vs A*"
        >
          <GitCompare className="w-4 h-4 text-purple-400" />
          <span className="hidden md:inline">Compare</span>
        </button>

        <button
          onClick={onOpenTests}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          title="Run DSA Verification Tests"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="hidden md:inline">Tests</span>
        </button>

        <button
          onClick={onOpenViva}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-medium transition shadow-md shadow-cyan-600/20"
          title="Open DSA Viva & Concept Guide"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">DSA Viva Guide</span>
        </button>
      </div>
    </header>
  );
}


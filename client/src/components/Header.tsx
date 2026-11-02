import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Moon,
  Sun,
} from 'lucide-react';
import { springSoft } from '../lib/motion';
import { MargDarshakLogo } from './MargDarshakLogo';

export interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  stats?: {
    totalNodes: number;
    totalEdges: number;
    corridorsCount: number;
  } | null;
  isPanelOpen?: boolean;
  onTogglePanel?: () => void;
}

function Header({
  theme,
  onToggleTheme,
  stats,
}: HeaderProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <header className="px-3 pt-3 pb-1 md:px-5 md:pt-4 md:pb-2 shrink-0 z-30">
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSoft}
        className="h-14 md:h-16 rounded-2xl md:rounded-3xl bg-[#121215]/95 backdrop-blur-2xl border border-white/10 shadow-2xl px-3 sm:px-4 md:px-6 flex items-center justify-between gap-3 text-white"
      >
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 select-none">
          <div className="w-8 h-8 md:w-9 md:h-9 shrink-0 flex items-center justify-center">
            <MargDarshakLogo className="w-full h-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center">
                Marg<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400">Darshak</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-cyan-500/15 text-emerald-300 border border-emerald-500/30">
                मार्गदर्शक · 3D
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 hidden xl:block font-medium">
              India Highway Engine · Dijkstra DSA Routing
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* DSA Graph Stats Pill (Desktop) */}
          {stats && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-neutral-400 font-medium select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{stats.totalNodes} Nodes</span>
              <span className="text-neutral-600">·</span>
              <span>{stats.totalEdges} Roads</span>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors cursor-pointer active:scale-95"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4 text-blue-300" aria-hidden="true" />
            )}
          </button>
        </div>
      </motion.div>
    </header>
  );
}

export default React.memo(Header);

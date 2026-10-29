import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Compass,
  GitCompare,
  Search,
  Sparkles,
} from 'lucide-react';
import { Button, Tooltip } from './ui';
import { springSoft } from '../lib/motion';

export interface HeaderProps {
  onOpenCompare: () => void;
  onOpenCommandPalette?: () => void;
  stats?: {
    totalNodes: number;
    totalEdges: number;
    corridorsCount: number;
  } | null;
}

export default function Header({
  onOpenCompare,
  onOpenCommandPalette,
  stats,
}: HeaderProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <header className="px-3 pt-3 pb-1 md:px-5 md:pt-4 md:pb-2 shrink-0 z-30">
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSoft}
        className="h-16 rounded-2xl md:rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-soft-lg px-3.5 md:px-6 flex items-center justify-between gap-3"
      >
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={!prefersReducedMotion ? { rotate: 45, scale: 1.05 } : undefined}
            transition={springSoft}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E9DEFF] via-[#FFE5D9] to-[#D9F2E6] flex items-center justify-center shadow-soft border border-white/80 text-ink-900 cursor-pointer"
          >
            <Compass className="w-5 h-5 text-purple-900" />
          </motion.div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-extrabold text-ink-900 tracking-tight">
                PathScope
              </h1>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#E9DEFF]/70 text-purple-900 border border-purple-200/60 hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-purple-700" />
                v1.0 · Chandigarh & HP
              </span>
            </div>
            <p className="text-[11px] text-ink-500 hidden lg:block font-medium">
              Google Maps Driving Routes · DSA Graph Explorer
            </p>
          </div>
        </div>

        {/* Center Quick Search / Command Palette Pill */}
        <div className="hidden md:flex items-center">
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ink-50/80 hover:bg-white text-ink-600 hover:text-ink-900 border border-ink-100 hover:border-purple-200/70 shadow-sm transition-all duration-200 text-xs font-medium cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-ink-400" />
            <span>Search routes, algorithms or places...</span>
            <kbd className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white text-ink-500 border border-ink-200 shadow-xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="md:hidden p-2 rounded-full bg-ink-50 text-ink-700 hover:bg-white border border-ink-200 transition"
              title="Quick Search (⌘K)"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          <Tooltip content="Compare Dijkstra and A* on PathScope's educational graph (separate from Google driving routes)">
            <Button
              variant="lavender"
              size="sm"
              onClick={onOpenCompare}
              leftIcon={<GitCompare className="w-3.5 h-3.5 text-purple-900" />}
            >
              <span className="hidden sm:inline">Compare</span>
            </Button>
          </Tooltip>

        </div>
      </motion.div>
    </header>
  );
}

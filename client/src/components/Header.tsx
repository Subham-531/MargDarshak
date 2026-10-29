import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  GitCompare,
  Moon,
  Search,
  Sun,
} from 'lucide-react';
import { Button, Tooltip } from './ui';
import { springSoft } from '../lib/motion';

export interface HeaderProps {
  onOpenCompare: () => void;
  onOpenCommandPalette?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  stats?: {
    totalNodes: number;
    totalEdges: number;
    corridorsCount: number;
  } | null;
}

export default function Header({
  onOpenCompare,
  onOpenCommandPalette,
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
        className="h-16 rounded-2xl md:rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-soft-lg px-3.5 md:px-6 flex items-center justify-between gap-3"
      >
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-extrabold text-ink-900 tracking-tight">
                PathScope
              </h1>
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
          <Tooltip content={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              aria-pressed={theme === 'light'}
              className="p-2 rounded-full bg-ink-50 text-ink-700 hover:bg-white border border-ink-200 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BAE52]"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </Tooltip>

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

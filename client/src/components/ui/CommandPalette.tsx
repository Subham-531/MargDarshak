import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Search,
  Route,
  Zap,
  GitCompare,
  BookOpen,
  CheckCircle2,
  Navigation,
  Compass,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { springSoft } from '../../lib/motion';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Popular Routes' | 'DSA Graph Options' | 'Tools & Guides' | 'Places';
  icon: React.ReactNode;
  iconBg: string;
  action: () => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoute?: (
    startId: string,
    destId: string,
    stops?: string[]
  ) => void;
  onSelectMode?: (m: string) => void;
  onOpenCompare?: () => void;
  onOpenViva?: () => void;
  onOpenTests?: () => void;
  nodes?: Array<{ id: string; name: string; region: string }>;
}

export function CommandPalette({
  isOpen,
  onClose,
  onSelectRoute,
  onSelectMode,
  onOpenCompare,
  onOpenViva,
  onOpenTests,
  nodes = [],
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Define commands
  const allCommands: CommandItem[] = [
    {
      id: 'route-shimla',
      title: 'Sector 17 Plaza → Shimla The Ridge',
      subtitle: 'Google Maps driving route to Shimla',
      category: 'Popular Routes',
      icon: <Route className="w-4 h-4 text-purple-900" />,
      iconBg: 'bg-[#E9DEFF]',
      action: () => {
        onSelectRoute?.('CHD17', 'SML');
        onClose();
      },
    },
    {
      id: 'route-manali',
      title: 'Sector 17 Plaza → Manali Mall Road',
      subtitle: 'Google Maps driving route to Manali',
      category: 'Popular Routes',
      icon: <Route className="w-4 h-4 text-amber-900" />,
      iconBg: 'bg-[#FFE5D9]',
      action: () => {
        onSelectRoute?.('CHD17', 'MNL');
        onClose();
      },
    },
    {
      id: 'route-kufri',
      title: 'Multi-Stop: S17 → Panchkula → Solan → Kufri',
      subtitle: 'Google Maps route with optimized driving stop order',
      category: 'Popular Routes',
      icon: <Sparkles className="w-4 h-4 text-emerald-900" />,
      iconBg: 'bg-[#D9F2E6]',
      action: () => {
        onSelectRoute?.('CHD17', 'KFR', ['PKL_S5', 'SOL']);
        onClose();
      },
    },
    {
      id: 'route-cu-shimla',
      title: 'CU Gharuan Campus → Shimla',
      subtitle: 'Google Maps driving route from campus to Shimla',
      category: 'Popular Routes',
      icon: <Route className="w-4 h-4 text-purple-900" />,
      iconBg: 'bg-[#E9DEFF]',
      action: () => {
        onSelectRoute?.('CU_GHR', 'SML');
        onClose();
      },
    },
    {
      id: 'mode-distance',
      title: 'DSA comparison: shortest distance',
      subtitle: 'Sets the cost mode for the graph-based algorithm comparison only',
      category: 'DSA Graph Options',
      icon: <Compass className="w-4 h-4 text-emerald-900" />,
      iconBg: 'bg-[#D9F2E6]',
      action: () => {
        onSelectMode?.('distance');
        onClose();
      },
    },
    {
      id: 'mode-time',
      title: 'DSA comparison: travel time',
      subtitle: 'Sets the cost mode for the graph-based algorithm comparison only',
      category: 'DSA Graph Options',
      icon: <Zap className="w-4 h-4 text-amber-900" />,
      iconBg: 'bg-[#FFE5D9]',
      action: () => {
        onSelectMode?.('time');
        onClose();
      },
    },
    {
      id: 'tool-compare',
      title: 'Compare Dijkstra vs A* Search',
      subtitle: 'Side-by-side nodes explored, savings percentage, and execution latency',
      category: 'Tools & Guides',
      icon: <GitCompare className="w-4 h-4 text-purple-900" />,
      iconBg: 'bg-[#E9DEFF]',
      action: () => {
        onOpenCompare?.();
        onClose();
      },
    },
    {
      id: 'tool-viva',
      title: 'Open DSA Viva & Concept Guide',
      subtitle: 'Adjacency lists, min-heap proof, admissibility & bitmask DP',
      category: 'Tools & Guides',
      icon: <BookOpen className="w-4 h-4 text-emerald-900" />,
      iconBg: 'bg-[#D9F2E6]',
      action: () => {
        onOpenViva?.();
        onClose();
      },
    },
    {
      id: 'tool-tests',
      title: 'Run Automated Verification Tests (T1–T7)',
      subtitle: 'Execute live algorithm benchmarks & corner-case validations',
      category: 'Tools & Guides',
      icon: <CheckCircle2 className="w-4 h-4 text-amber-900" />,
      iconBg: 'bg-[#FFE5D9]',
      action: () => {
        onOpenTests?.();
        onClose();
      },
    },
  ];

  // Also include matching places from nodes
  const nodeCommands: CommandItem[] = nodes.slice(0, 10).map((node) => ({
    id: `node-${node.id}`,
    title: node.name,
    subtitle: `${node.region} · ID: ${node.id}`,
    category: 'Places',
    icon: <Navigation className="w-4 h-4 text-purple-900" />,
    iconBg: 'bg-[#E9DEFF]',
    action: () => {
      onSelectRoute?.(node.id, 'SML');
      onClose();
    },
  }));

  const allItems = [...allCommands, ...nodeCommands];

  const filteredItems = allItems.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredItems.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[3500] flex items-start justify-center pt-16 sm:pt-24 px-4 pb-6">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink-950/40 backdrop-blur-md"
          />

          {/* Modal Panel */}
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, y: -10 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, y: -8 }
            }
            transition={springSoft}
            className="relative w-full max-w-xl rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl shadow-purple-950/15 overflow-hidden flex flex-col z-10"
          >
            {/* Search Input Bar */}
            <div className="p-4 border-b border-ink-100 flex items-center gap-3 bg-gradient-to-r from-[#F7F2FF]/60 to-[#FFF6F0]/60">
              <Search className="w-5 h-5 text-ink-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command, route, place or algorithm..."
                className="w-full bg-transparent text-sm font-semibold text-ink-900 placeholder:text-ink-400 focus:outline-none"
              />
              <button
                onClick={onClose}
                className="p-1 rounded-full text-ink-400 hover:text-ink-700 hover:bg-ink-100/70 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Command Results */}
            <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-ink-50">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-ink-400">
                  No matching commands or routes found for "{query}".
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredItems.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <motion.div
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition select-none',
                          isSelected
                            ? 'bg-gradient-to-r from-[#F4EEFF] via-[#FFF3EC] to-[#EEFAF3] shadow-soft'
                            : 'hover:bg-ink-50/70'
                        )}
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm',
                            item.iconBg
                          )}
                        >
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-ink-900 truncate">
                              {item.title}
                            </span>
                            <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-full bg-white/80 text-ink-500 border border-ink-100 shrink-0">
                              {item.category}
                            </span>
                          </div>
                          {item.subtitle && (
                            <p className="text-[11px] text-ink-500 truncate font-medium">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        <ArrowRight
                          className={cn(
                            'w-4 h-4 transition text-ink-400 shrink-0',
                            isSelected && 'translate-x-0.5 text-ink-900'
                          )}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer with Keyboard Shortcuts */}
            <div className="p-3 bg-gradient-to-r from-ink-50/80 to-white/90 border-t border-ink-100 flex items-center justify-between text-[11px] text-ink-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-ink-200 text-[10px] font-mono shadow-xs text-ink-700">
                    ↑↓
                  </kbd>{' '}
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-ink-200 text-[10px] font-mono shadow-xs text-ink-700">
                    ↵
                  </kbd>{' '}
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-ink-200 text-[10px] font-mono shadow-xs text-ink-700">
                    esc
                  </kbd>{' '}
                  Close
                </span>
              </div>
              <span className="font-mono text-[10px] text-purple-700 font-semibold">
                PathScope Command
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

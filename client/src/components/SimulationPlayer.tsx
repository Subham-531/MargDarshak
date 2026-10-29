import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  ListOrdered,
  Table as TableIcon,
  X,
  Sparkles,
} from 'lucide-react';
import { Button } from './ui';
import { springSoft } from '../lib/motion';
import { cn } from '../lib/utils';
import { NodeItem } from './ControlPanel';

export interface QueueItem {
  element: string;
  priority: number;
  gCost?: number;
  hCost?: number;
}

export interface TraceStep {
  type: 'init' | 'pop' | 'relax' | 'push' | 'goal' | string;
  node?: string;
  explanation: string;
  queue: QueueItem[];
  distances: Record<string, number>;
  visited: string[];
}

export interface SimulationPlayerProps {
  trace?: TraceStep[];
  currentStepIndex: number;
  setCurrentStepIndex: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  nodes?: NodeItem[];
  onClose: () => void;
}

export default function SimulationPlayer({
  trace = [],
  currentStepIndex,
  setCurrentStepIndex,
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed,
  nodes = [],
  onClose,
}: SimulationPlayerProps) {
  const [activeTab, setActiveTab] = useState<'queue' | 'distances'>('queue');
  const prefersReducedMotion = useReducedMotion();

  const currentStep = trace[currentStepIndex] || null;
  const totalSteps = trace.length;

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying && currentStepIndex < totalSteps - 1) {
      const delayMs = Math.round(1000 / speed);
      timer = setTimeout(() => {
        setCurrentStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
      }, delayMs);
    } else if (currentStepIndex >= totalSteps - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStepIndex, totalSteps, speed, setCurrentStepIndex, setIsPlaying]);

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  if (!trace || trace.length === 0) return null;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const getStepBadgeStyle = (type?: string) => {
    switch (type) {
      case 'pop':
        return 'bg-[#FFE5D9] text-amber-950 border-orange-200/80';
      case 'relax':
        return 'bg-[#E9DEFF] text-purple-950 border-purple-200/80';
      case 'push':
        return 'bg-[#E0F2FE] text-sky-950 border-sky-200/80';
      case 'goal':
        return 'bg-[#D9F2E6] text-emerald-950 border-emerald-200/80';
      default:
        return 'bg-ink-100 text-ink-900 border-ink-200';
    }
  };

  return (
    <motion.div
      initial={
        prefersReducedMotion ? undefined : { opacity: 0, y: 30, scale: 0.98 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={
        prefersReducedMotion ? undefined : { opacity: 0, y: 20, scale: 0.98 }
      }
      transition={springSoft}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl bg-white/90 backdrop-blur-2xl border border-white/90 rounded-3xl shadow-soft-xl z-[1050] overflow-hidden text-xs flex flex-col select-none"
    >
      {/* Top Banner: Playback Controls & Scrubber */}
      <div className="p-3 bg-gradient-to-r from-[#FAF8FE] to-[#F5EEFF]/80 border-b border-purple-100 flex flex-wrap items-center justify-between gap-3">
        {/* Playback buttons */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="glass"
            size="icon-sm"
            onClick={handleReset}
            title="Reset to Start"
          >
            <RotateCcw className="w-3.5 h-3.5 text-ink-700" />
          </Button>

          <Button
            variant="glass"
            size="icon-sm"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            title="Step Backward"
          >
            <SkipBack className="w-3.5 h-3.5 text-ink-700" />
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            leftIcon={
              isPlaying ? (
                <Pause className="w-3.5 h-3.5 text-purple-950" />
              ) : (
                <Play className="w-3.5 h-3.5 text-purple-950" />
              )
            }
            className="font-bold shadow-soft"
          >
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </Button>

          <Button
            variant="glass"
            size="icon-sm"
            onClick={handleNext}
            disabled={currentStepIndex >= totalSteps - 1}
            title="Step Forward"
          >
            <SkipForward className="w-3.5 h-3.5 text-ink-700" />
          </Button>
        </div>

        {/* Step Scrubber & Progress */}
        <div className="flex-1 min-w-[200px] flex items-center gap-3">
          <input
            type="range"
            min="0"
            max={totalSteps - 1}
            value={currentStepIndex}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentStepIndex(parseInt(e.target.value, 10));
            }}
            className="flex-1 accent-purple-600 h-1.5 bg-ink-100 rounded-lg cursor-pointer"
          />
          <span className="font-mono text-purple-800 text-xs shrink-0 font-bold px-2 py-0.5 rounded-full bg-white border border-purple-200/60 shadow-xs">
            Step {currentStepIndex + 1} / {totalSteps}
          </span>
        </div>

        {/* Speed Multiplier & Close */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-ink-200/80 rounded-full p-0.5 shadow-xs">
            {[0.5, 1, 2, 4].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold transition cursor-pointer',
                  speed === s
                    ? 'bg-gradient-to-r from-[#E9DEFF] to-[#D5C2FA] text-purple-950 shadow-xs'
                    : 'text-ink-500 hover:text-ink-800'
                )}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-ink-400 hover:text-ink-900 hover:bg-ink-100 transition cursor-pointer"
            title="Close Simulation Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Explanation Banner */}
      <div className="px-4 py-2.5 bg-white/95 border-b border-purple-50 flex items-start gap-2.5">
        <span
          className={cn(
            'shrink-0 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border shadow-xs',
            getStepBadgeStyle(currentStep?.type)
          )}
        >
          {currentStep?.type || 'STEP'}
        </span>
        <p className="text-ink-800 text-xs leading-relaxed font-semibold">
          {currentStep?.explanation || 'Beginning graph search...'}
        </p>
      </div>

      {/* Tab Switcher & Data Views */}
      <div className="p-3 bg-[#FAF9FD]/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('queue')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs transition cursor-pointer',
                activeTab === 'queue'
                  ? 'bg-[#E9DEFF] text-purple-950 border border-purple-200 shadow-soft'
                  : 'text-ink-500 hover:text-ink-800'
              )}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>
                Priority Queue (MinHeap) [{(currentStep?.queue || []).length}]
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('distances')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs transition cursor-pointer',
                activeTab === 'distances'
                  ? 'bg-[#E9DEFF] text-purple-950 border border-purple-200 shadow-soft'
                  : 'text-ink-500 hover:text-ink-800'
              )}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Distance & Settled Table</span>
            </button>
          </div>

          {/* Visual Color Legend */}
          <div className="hidden sm:flex items-center gap-3 text-[10px] font-semibold text-ink-500">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>In Queue</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
              <span>Visited</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>Final Path</span>
            </div>
          </div>
        </div>

        {/* Tab 1: Priority Queue Content */}
        {activeTab === 'queue' && (
          <div className="max-h-36 overflow-y-auto rounded-2xl border border-ink-100 bg-white/95 font-mono shadow-inner">
            {(currentStep?.queue || []).length === 0 ? (
              <div className="p-4 text-center text-ink-400 italic font-sans text-xs">
                Priority queue is empty (all reachable nodes processed).
              </div>
            ) : (
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#FAF8FE] text-ink-500 sticky top-0 border-b border-ink-100 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-1.5 px-3">Rank</th>
                    <th className="py-1.5 px-3">Node</th>
                    <th className="py-1.5 px-3">Cost g(n)</th>
                    {currentStep?.queue?.[0]?.hCost !== undefined && (
                      <th className="py-1.5 px-3">Heuristic h(n)</th>
                    )}
                    <th className="py-1.5 px-3">Priority f(n)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {currentStep.queue.map((item, idx) => {
                    const node = nodeMap.get(item.element);
                    return (
                      <tr
                        key={idx}
                        className={
                          idx === 0
                            ? 'bg-[#F5EEFF]/80 text-purple-950 font-bold'
                            : 'text-ink-800 hover:bg-ink-50/50'
                        }
                      >
                        <td className="py-1 px-3 text-ink-400 font-bold">
                          #{idx + 1}
                        </td>
                        <td className="py-1 px-3 font-semibold font-sans">
                          {node ? node.name : item.element}
                        </td>
                        <td className="py-1 px-3 text-emerald-700 font-bold">
                          {item.gCost !== undefined ? item.gCost : item.priority}
                        </td>
                        {item.hCost !== undefined && (
                          <td className="py-1 px-3 text-amber-700 font-bold">
                            {item.hCost}
                          </td>
                        )}
                        <td className="py-1 px-3 font-black text-purple-800">
                          {item.priority}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Distances Table */}
        {activeTab === 'distances' && (
          <div className="max-h-36 overflow-y-auto rounded-2xl border border-ink-100 bg-white/95 font-mono shadow-inner">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#FAF8FE] text-ink-500 sticky top-0 border-b border-ink-100 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-1.5 px-3">Node ID</th>
                  <th className="py-1.5 px-3">Place Name</th>
                  <th className="py-1.5 px-3">Status</th>
                  <th className="py-1.5 px-3">Tentative Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {nodes.map((node) => {
                  const dist = currentStep?.distances?.[node.id];
                  const isVisited = currentStep?.visited?.includes(node.id);
                  const isCurrent = currentStep?.node === node.id;
                  const inQueue = currentStep?.queue?.some(
                    (q) => q.element === node.id
                  );

                  let statusText = 'Unvisited';
                  let statusClass = 'text-ink-400';

                  if (isCurrent) {
                    statusText = 'Current';
                    statusClass = 'text-rose-600 font-black';
                  } else if (isVisited) {
                    statusText = 'Settled';
                    statusClass = 'text-purple-700 font-bold';
                  } else if (inQueue) {
                    statusText = 'In Queue';
                    statusClass = 'text-amber-700 font-bold';
                  }

                  return (
                    <tr
                      key={node.id}
                      className={
                        isCurrent
                          ? 'bg-[#FFE4E6]/50'
                          : inQueue
                          ? 'bg-[#FFF3EB]/40'
                          : 'hover:bg-ink-50/50'
                      }
                    >
                      <td className="py-1 px-3 text-ink-400 font-semibold">
                        {node.id}
                      </td>
                      <td className="py-1 px-3 font-medium text-ink-800 font-sans">
                        {node.name}
                      </td>
                      <td className={cn('py-1 px-3', statusClass)}>
                        {statusText}
                      </td>
                      <td className="py-1 px-3 text-emerald-700 font-bold">
                        {dist !== undefined ? dist : '∞'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}


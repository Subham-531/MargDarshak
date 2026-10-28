import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  FastForward,
  Layers,
  ListOrdered,
  Table,
  CheckCircle,
  HelpCircle,
  X
} from 'lucide-react';

export default function SimulationPlayer({
  trace = [],
  currentStepIndex,
  setCurrentStepIndex,
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed,
  nodes = [],
  onClose
}) {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' or 'distances'

  const currentStep = trace[currentStepIndex] || null;
  const totalSteps = trace.length;

  // Auto-play timer
  useEffect(() => {
    let timer = null;
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

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl z-[1050] overflow-hidden text-xs flex flex-col animate-slideUp">
      {/* Top Banner: Playback Controls & Scrubber */}
      <div className="p-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Playback buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Reset to Start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition disabled:opacity-40"
            title="Step Backward"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold transition flex items-center gap-1 shadow-md shadow-cyan-600/30"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentStepIndex >= totalSteps - 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition disabled:opacity-40"
            title="Step Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>
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
            className="flex-1 accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="font-mono text-cyan-400 text-xs shrink-0 font-medium">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
        </div>

        {/* Speed Selector & Close */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {[0.5, 1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                  speed === s ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close Simulation Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Explanation Banner */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-cyan-950/60 to-slate-900 border-b border-slate-800 flex items-start gap-2.5">
        <span
          className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
            currentStep?.type === 'pop'
              ? 'bg-red-950 text-red-300 border border-red-800'
              : currentStep?.type === 'relax'
              ? 'bg-amber-950 text-amber-300 border border-amber-800'
              : currentStep?.type === 'push'
              ? 'bg-blue-950 text-blue-300 border border-blue-800'
              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
          }`}
        >
          {currentStep?.type || 'STEP'}
        </span>
        <p className="text-slate-200 text-xs leading-relaxed font-sans">
          {currentStep?.explanation || 'Beginning search...'}
        </p>
      </div>

      {/* Bottom Live Data Panel: Tabs (Priority Queue vs Distance Table) */}
      <div className="p-3 bg-slate-900/90">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('queue')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium text-xs transition ${
                activeTab === 'queue'
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Priority Queue (MinHeap) [{(currentStep?.queue || []).length}]</span>
            </button>

            <button
              onClick={() => setActiveTab('distances')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium text-xs transition ${
                activeTab === 'distances'
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Distance & Settled Table</span>
            </button>
          </div>

          {/* Visual Legend */}
          <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-400">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>In Queue</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span>Visited</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Final Path</span>
            </div>
          </div>
        </div>

        {/* Tab 1: Priority Queue Content */}
        {activeTab === 'queue' && (
          <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/60 font-mono">
            {(currentStep?.queue || []).length === 0 ? (
              <div className="p-3 text-center text-slate-500 italic">Priority queue is empty</div>
            ) : (
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-900/80 text-slate-400 sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-1 px-2">Rank</th>
                    <th className="py-1 px-2">Node</th>
                    <th className="py-1 px-2">Cost / g(n)</th>
                    {currentStep?.queue?.[0]?.hCost !== undefined && (
                      <th className="py-1 px-2">Heuristic h(n)</th>
                    )}
                    <th className="py-1 px-2">Priority / f(n)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {currentStep.queue.map((item, idx) => {
                    const node = nodeMap.get(item.element);
                    return (
                      <tr
                        key={idx}
                        className={idx === 0 ? 'bg-cyan-950/40 text-cyan-200' : 'text-slate-300'}
                      >
                        <td className="py-1 px-2 text-slate-500 font-bold">#{idx + 1}</td>
                        <td className="py-1 px-2 font-medium">
                          {node ? node.name : item.element}
                        </td>
                        <td className="py-1 px-2 text-emerald-400">
                          {item.gCost !== undefined ? item.gCost : item.priority}
                        </td>
                        {item.hCost !== undefined && (
                          <td className="py-1 px-2 text-amber-400">{item.hCost}</td>
                        )}
                        <td className="py-1 px-2 font-bold text-cyan-400">{item.priority}</td>
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
          <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/60 font-mono">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-900/80 text-slate-400 sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-1 px-2">Node ID</th>
                  <th className="py-1 px-2">Place Name</th>
                  <th className="py-1 px-2">Status</th>
                  <th className="py-1 px-2">Shortest Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {nodes.map((node) => {
                  const dist = currentStep?.distances?.[node.id];
                  const isVisited = currentStep?.visited?.includes(node.id);
                  const isCurrent = currentStep?.node === node.id;
                  const inQueue = currentStep?.queue?.some((q) => q.element === node.id);

                  let statusText = 'Unvisited';
                  let statusClass = 'text-slate-500';

                  if (isCurrent) {
                    statusText = 'Current';
                    statusClass = 'text-red-400 font-bold';
                  } else if (isVisited) {
                    statusText = 'Settled';
                    statusClass = 'text-sky-400 font-bold';
                  } else if (inQueue) {
                    statusText = 'In Queue';
                    statusClass = 'text-amber-400';
                  }

                  return (
                    <tr
                      key={node.id}
                      className={isCurrent ? 'bg-red-950/20' : inQueue ? 'bg-amber-950/10' : ''}
                    >
                      <td className="py-1 px-2 text-slate-500">{node.id}</td>
                      <td className="py-1 px-2 text-slate-200">{node.name}</td>
                      <td className={`py-1 px-2 ${statusClass}`}>{statusText}</td>
                      <td className="py-1 px-2 text-emerald-400 font-bold">
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
    </div>
  );
}


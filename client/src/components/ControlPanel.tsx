import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  MapPin,
  Navigation,
  ArrowUpDown,
  Plus,
  Play,
  Pause,
  Trash2,
  Route,
  Compass,
  AlertCircle,
  GitCompare,
} from 'lucide-react';
import { Button, Card, KpiTile, MotionList, MotionListItem, EmptyState } from './ui';
import { springSoft, fadeUp } from '../lib/motion';
import { cn } from '../lib/utils';

export interface NodeItem {
  id: string;
  name: string;
  region: string;
  lat?: number;
  lng?: number;
}

export interface RouteResult {
  found?: boolean;
  distanceKm?: number;
  timeMin?: number;
  nodesExplored?: number;
  algorithm?: string;
  mode?: string;
  path?: string[];
  trace?: unknown[];
  stops?: string[];
  provider?: string;
}

export type SimulationStatus =
  | 'idle'
  | 'preparing'
  | 'running'
  | 'paused'
  | 'finalizing'
  | 'completed'
  | 'error';

export type SimulationMode = 'road' | 'graph';

export interface ControlPanelProps {
  nodes?: NodeItem[];
  startNode: string;
  setStartNode: (id: string) => void;
  destNode: string;
  setDestNode: (id: string) => void;
  stops?: string[];
  setStops: (stops: string[]) => void;
  onFindRoute: () => void;
  onOpenAlgorithmTable: () => void;
  onStartSimulation: () => void;
  onPauseSimulation: () => void;
  simulationStatus: SimulationStatus;
  simulationMode: SimulationMode;
  setSimulationMode: (mode: SimulationMode) => void;
  simulationDelay: number;
  setSimulationDelay: (delay: number) => void;
  simulationStep: number;
  simulationTotalSteps: number;
  isBusy: boolean;
  isLoading: boolean;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
  routeResult?: RouteResult | null;
  routeError?: string | null;
}

export default function ControlPanel({
  nodes = [],
  startNode,
  setStartNode,
  destNode,
  setDestNode,
  stops = [],
  setStops,
  onFindRoute,
  onOpenAlgorithmTable,
  onStartSimulation,
  onPauseSimulation,
  simulationStatus,
  simulationMode,
  setSimulationMode,
  simulationDelay,
  setSimulationDelay,
  simulationStep,
  simulationTotalSteps,
  isBusy,
  isLoading,
  onUseCurrentLocation,
  isLocating,
  routeResult,
  routeError,
}: ControlPanelProps) {
  const prefersReducedMotion = useReducedMotion();

  const handleSwap = () => {
    const temp = startNode;
    setStartNode(destNode);
    setDestNode(temp);
  };

  const addStop = () => {
    if (stops.length < 5) {
      setStops([...stops, '']);
    }
  };

  const updateStop = (index: number, value: string) => {
    const nextStops = [...stops];
    nextStops[index] = value;
    setStops(nextStops);
  };

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  // Quick preset loader
  const loadPreset = (
    startId: string,
    destId: string,
    optStops: string[] = []
  ) => {
    setStartNode(startId);
    setDestNode(destId);
    setStops(optStops);
  };

  return (
    <aside className="w-full md:w-96 p-3 md:p-4 md:pr-2 flex flex-col h-[46vh] min-h-[280px] md:h-[calc(100vh-5.5rem)] z-20 shrink-0 select-none">
      <div className="flex-1 bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl shadow-soft-xl flex flex-col overflow-hidden">
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Preset Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                Popular Routes
              </span>
              <span className="text-[10px] text-purple-700 font-semibold px-2 py-0.5 rounded-full bg-[#E9DEFF]/60 border border-purple-200/50">
                Quick Pick
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => loadPreset('CHD17', 'SML')}
                disabled={isBusy}
                className="text-[11px] font-medium px-3 py-1 rounded-full bg-white/90 hover:bg-[#F5EEFF] text-ink-800 border border-ink-100 hover:border-purple-200 shadow-pill transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                S17 → Shimla
              </button>
              <button
                type="button"
                onClick={() => loadPreset('CHD17', 'MNL')}
                disabled={isBusy}
                className="text-[11px] font-medium px-3 py-1 rounded-full bg-white/90 hover:bg-[#FFF3EB] text-ink-800 border border-ink-100 hover:border-orange-200 shadow-pill transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                S17 → Manali
              </button>
              <button
                type="button"
                onClick={() => loadPreset('CU_GHR', 'SML')}
                disabled={isBusy}
                className="text-[11px] font-medium px-3 py-1 rounded-full bg-white/90 hover:bg-[#EDFAF3] text-ink-800 border border-ink-100 hover:border-emerald-200 shadow-pill transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                CU Gharuan → Shimla
              </button>
              <button
                type="button"
                onClick={() => loadPreset('CHD17', 'CHD_AIR')}
                disabled={isBusy}
                className="text-[11px] font-medium px-3 py-1 rounded-full bg-white/90 hover:bg-[#F5EEFF] text-ink-800 border border-ink-100 hover:border-purple-200 shadow-pill transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                S17 → Airport
              </button>
              <button
                type="button"
                onClick={() => loadPreset('CHD17', 'KFR', ['PKL_S5', 'SOL'])}
                disabled={isBusy}
                className="text-[11px] font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-[#E9DEFF]/80 to-[#D9F2E6]/80 hover:from-[#E1D2FF] hover:to-[#CEEEDC] text-ink-900 border border-purple-200/60 shadow-pill transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                Multi-Stop: S17 → Kufri
              </button>
            </div>
          </div>

          {/* Route Origin & Destination Card */}
          <div className="bg-gradient-to-b from-white/95 to-[#FAF8FE]/90 p-3.5 rounded-2xl border border-white/90 shadow-soft space-y-3">
            {/* Start Node */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-ink-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-100"></span>
                  Start Location
                </label>
                <button
                  type="button"
                  onClick={onUseCurrentLocation}
                  disabled={isLocating || isBusy}
                  className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 transition disabled:opacity-50 cursor-pointer"
                >
                  <Navigation
                    className={cn('w-3 h-3', isLocating && 'animate-spin')}
                  />
                  <span>{isLocating ? 'Locating...' : 'My Location'}</span>
                </button>
              </div>

              <select
                value={startNode}
                onChange={(e) => setStartNode(e.target.value)}
                disabled={isBusy}
                className="w-full bg-white/90 border border-ink-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-xs"
              >
                <option value="">Select start place...</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.region})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap & Add Waypoint Row */}
            <div className="flex items-center justify-between px-1">
              <motion.button
                type="button"
                whileTap={!prefersReducedMotion ? { scale: 0.9 } : undefined}
                whileHover={!prefersReducedMotion ? { rotate: 180 } : undefined}
                transition={springSoft}
                onClick={handleSwap}
                disabled={isBusy}
                className="p-1.5 rounded-full bg-white text-ink-600 hover:text-ink-900 border border-ink-200/80 shadow-xs cursor-pointer"
                title="Swap Start and Destination"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </motion.button>

              <button
                type="button"
                onClick={addStop}
                disabled={isBusy || stops.length >= 5}
                className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stop ({stops.length}/5)</span>
              </button>
            </div>

            {/* Intermediate Stops List with Framer Motion layout animations */}
            {stops.length > 0 && (
              <MotionList className="space-y-2">
                {stops.map((stop, index) => (
                  <MotionListItem
                    key={index}
                    className="flex items-center gap-2 pl-2 border-l-2 border-amber-300"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-100"></span>
                    <select
                      value={stop}
                      onChange={(e) => updateStop(index, e.target.value)}
                      disabled={isBusy}
                      className="flex-1 bg-white/90 border border-ink-200/80 rounded-xl px-2.5 py-1.5 text-xs font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-xs"
                    >
                      <option value="">Select stop {index + 1}...</option>
                      {nodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.region})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeStop(index)}
                      disabled={isBusy}
                      className="p-1.5 text-ink-400 hover:text-rose-600 transition cursor-pointer rounded-full hover:bg-rose-50"
                      title="Remove Stop"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </MotionListItem>
                ))}
              </MotionList>
            )}

            {/* Destination Node */}
            <div>
              <label className="text-xs font-bold text-ink-800 flex items-center gap-1.5 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 ring-4 ring-rose-100"></span>
                Destination
              </label>
              <select
                value={destNode}
                onChange={(e) => setDestNode(e.target.value)}
                disabled={isBusy}
                className="w-full bg-white/90 border border-ink-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-rose-300 shadow-xs"
              >
                <option value="">Select destination...</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.region})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-purple-200/70 bg-gradient-to-r from-[#F6F1FF] to-[#EDFAF4] px-3.5 py-3 text-xs">
            <div className="font-bold text-ink-900">
              {simulationMode === 'road'
                ? 'Google Maps · Driving'
                : 'PathScope Graph · A* Search'}
            </div>
            <p className="mt-1 leading-relaxed text-ink-600">
              Find Route always draws Google&apos;s snapped driving route.
              {simulationMode === 'road'
                ? ' Road mode progressively reveals that same route geometry.'
                : ' Graph mode animates A* exploration across straight weighted edges.'}
              Google optimizes stop order for road routes; graph mode follows the
              selected stop order.
            </p>
            <div className="mt-2 flex items-center gap-3 text-[10px] font-semibold text-ink-600">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Simulation
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-1 w-3 rounded-full bg-[#39FF14]" />
                Final route
              </span>
            </div>
          </div>

          {/* Independent route calculation and route-geometry simulation */}
          <div className="space-y-2 pt-1">
            <fieldset className="rounded-xl border border-ink-100 bg-white/80 p-2.5">
              <legend className="px-1 text-[11px] font-bold text-ink-700">
                Simulation mode
              </legend>
              <div className="grid grid-cols-2 gap-2">
                <label
                  className={`cursor-pointer rounded-lg border p-2 transition ${
                    simulationMode === 'road'
                      ? 'border-cyan-300 bg-cyan-50'
                      : 'border-ink-100 bg-white hover:bg-ink-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-ink-800">
                    <input
                      type="radio"
                      name="simulation-mode"
                      value="road"
                      checked={simulationMode === 'road'}
                      onChange={() => setSimulationMode('road')}
                      disabled={isBusy}
                      className="accent-cyan-500"
                    />
                    Actual Road Network
                  </span>
                  <span className="mt-1 block pl-5 text-[10px] leading-relaxed text-ink-500">
                    Reveal Google&apos;s snapped road geometry.
                  </span>
                </label>
                <label
                  className={`cursor-pointer rounded-lg border p-2 transition ${
                    simulationMode === 'graph'
                      ? 'border-cyan-300 bg-cyan-50'
                      : 'border-ink-100 bg-white hover:bg-ink-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-ink-800">
                    <input
                      type="radio"
                      name="simulation-mode"
                      value="graph"
                      checked={simulationMode === 'graph'}
                      onChange={() => setSimulationMode('graph')}
                      disabled={isBusy}
                      className="accent-cyan-500"
                    />
                    Direct Graph / Straight Edges
                  </span>
                  <span className="mt-1 block pl-5 text-[10px] leading-relaxed text-ink-500">
                    Animate A* over weighted graph edges.
                  </span>
                </label>
              </div>
            </fieldset>
            <Button
              variant="subtle"
              size="sm"
              className="w-full font-bold"
              onClick={onOpenAlgorithmTable}
              leftIcon={<GitCompare className="h-3.5 w-3.5 text-purple-800" />}
            >
              <span>Compare Algorithms</span>
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="primary"
                size="md"
                className="w-full font-bold shadow-soft"
                onClick={onFindRoute}
                disabled={!startNode || !destNode || isBusy}
                isLoading={isLoading && simulationStatus !== 'preparing'}
                leftIcon={<Route className="w-3.5 h-3.5 text-purple-950" />}
              >
                <span>Find Route</span>
              </Button>
              <Button
                variant="lavender"
                size="md"
                className="w-full font-bold"
                onClick={onStartSimulation}
                disabled={
                  !startNode ||
                  !destNode ||
                  isBusy && simulationStatus !== 'paused'
                }
                isLoading={simulationStatus === 'preparing'}
                leftIcon={<Play className="w-3.5 h-3.5" />}
              >
                <span>
                  {simulationStatus === 'paused'
                    ? 'Resume Simulation'
                    : simulationStatus === 'preparing'
                      ? 'Finding Route...'
                      : 'Simulate Algorithm'}
                </span>
              </Button>
            </div>
            <Button
              variant="glass"
              size="sm"
              className="w-full font-bold"
              onClick={onPauseSimulation}
              disabled={simulationStatus !== 'running'}
              leftIcon={<Pause className="w-3.5 h-3.5" />}
            >
              <span>Pause Simulation</span>
            </Button>

            <div className="rounded-xl border border-ink-100 bg-white/80 p-2.5 space-y-2">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="simulation-speed"
                    className="text-[11px] font-semibold text-ink-700"
                  >
                    Simulation speed
                  </label>
                  <span className="font-mono text-[10px] text-ink-500">
                    {simulationDelay} ms / step
                  </span>
                </div>
                <input
                  id="simulation-speed"
                  type="range"
                  min="25"
                  max="500"
                  step="25"
                  value={simulationDelay}
                  onChange={(event) => setSimulationDelay(Number(event.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
              {isBusy && (
                <div className="flex items-center justify-between text-[10px] text-ink-500">
                  <span className="font-semibold">
                    {simulationStatus === 'preparing'
                      ? simulationMode === 'graph'
                        ? 'Computing A* graph trace'
                        : 'Requesting Google driving route'
                      : simulationStatus === 'running'
                        ? simulationMode === 'graph'
                          ? 'Exploring graph edges'
                          : 'Simulating along snapped road'
                        : simulationStatus === 'paused'
                          ? 'Simulation paused'
                          : simulationMode === 'graph'
                            ? 'Highlighting final graph path'
                            : 'Highlighting final road route'}
                  </span>
                  {simulationTotalSteps > 0 && (
                    <span className="font-mono">
                      {Math.min(simulationStep + 1, simulationTotalSteps)} / {simulationTotalSteps}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Route Summary Card or Illustrated Empty State */}
          {routeResult && routeResult.found ? (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="p-3.5 rounded-2xl bg-gradient-to-br from-[#F6F1FF]/95 to-[#EDFAF4]/90 border border-purple-200/70 shadow-soft space-y-3"
            >
              <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                <span className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
                  <Route className="w-3.5 h-3.5 text-purple-700" />
                  Route Summary
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/90 text-purple-900 border border-purple-200 shadow-xs">
                  {routeResult.provider ?? 'GOOGLE MAPS'} ·{' '}
                  {routeResult.provider === 'PathScope Graph'
                    ? routeResult.mode?.toUpperCase()
                    : 'DRIVING'}
                </span>
              </div>

              {/* KPI stat tiles */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <KpiTile
                  title="Distance"
                  value={routeResult.distanceKm ?? 0}
                  unit="km"
                  color="mint"
                  className="p-2.5 rounded-xl"
                />
                <KpiTile
                  title="Est. Time"
                  value={Math.round(routeResult.timeMin ?? 0)}
                  unit="min"
                  color="peach"
                  className="p-2.5 rounded-xl"
                />
              </div>

              {/* Path Node Breadcrumbs */}
              {routeResult.path && routeResult.path.length > 0 && (
                <div className="pt-1">
                  <div className="text-[10px] text-ink-500 mb-1.5 font-bold uppercase tracking-wider">
                    {routeResult.provider === 'PathScope Graph'
                      ? 'Graph path:'
                      : 'Driving route stops:'}
                  </div>
                  <div className="text-xs text-ink-800 font-mono flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-white/80 rounded-xl border border-purple-100 shadow-inner">
                    {routeResult.path.map((nodeId, idx) => {
                      const node = nodes.find((n) => n.id === nodeId);
                      const isLast = idx === (routeResult.path?.length ?? 0) - 1;
                      return (
                        <span key={nodeId} className="inline-flex items-center">
                          <span className="px-2 py-0.5 rounded-lg bg-ink-50 text-ink-800 text-[11px] font-semibold border border-ink-100">
                            {node ? node.name : nodeId}
                          </span>
                          {!isLast && (
                            <span className="text-purple-400 mx-1">→</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            routeError ? (
              <div
                role="alert"
                className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                <div>
                  <div className="text-sm font-bold">Driving route unavailable</div>
                  <p className="mt-1 text-xs leading-relaxed">{routeError}</p>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Compass className="w-6 h-6 text-purple-900" />}
                title="Plan Your Corridor Journey"
                description="Choose a start, destination, and optional stops to get a Google Maps driving route."
                palette="lavender"
                className="p-5"
              />
            )
          )}
        </div>
      </div>
    </aside>
  );
}

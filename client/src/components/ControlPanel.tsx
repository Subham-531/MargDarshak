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
  Car,
  Bike,
  Footprints,
  PanelLeftClose,
  Sliders,
} from 'lucide-react';
import { Button, KpiTile, MotionList, MotionListItem, EmptyState } from './ui';
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
  travelVehicle?: 'car' | 'bike' | 'foot';
  onSelectTravelVehicle?: (vehicle: 'car' | 'bike' | 'foot') => void;
  onToggleOpen?: () => void;
  blockedNodes?: string[];
  onToggleBlockNode?: (id: string) => void;
  onClearBlockedNodes?: () => void;
}

function formatDuration(
  minutes: number,
  allowDays = false
): { value: string; unit: string; full: string } {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return { value: '0', unit: 'min', full: '0 min' };
  }
  const totalMins = Math.round(minutes);
  if (totalMins < 60) {
    return { value: `${totalMins}`, unit: 'min', full: `${totalMins} min` };
  }
  const hours = Math.floor(totalMins / 60);
  const remainingMins = totalMins % 60;

  if (allowDays && hours >= 48) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return {
      value: `${days}d ${remHours}`,
      unit: 'hrs',
      full: `${days}d ${remHours}h`,
    };
  }

  return {
    value: `${hours}h ${remainingMins}`,
    unit: 'min',
    full: `${hours}h ${remainingMins}m`,
  };
}

function ControlPanel({
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
  travelVehicle = 'car',
  onSelectTravelVehicle,
  onToggleOpen,
  blockedNodes = [],
  onToggleBlockNode,
  onClearBlockedNodes,
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

  const loadPreset = (
    startId: string,
    destId: string,
    optStops: string[] = []
  ) => {
    setStartNode(startId);
    setDestNode(destId);
    setStops(optStops);
  };

  const isSimulating =
    simulationStatus === 'running' ||
    simulationStatus === 'paused' ||
    simulationStatus === 'finalizing';

  return (
    <aside className="w-full md:w-[380px] lg:w-[410px] p-2.5 md:p-3 flex flex-col h-[48vh] min-h-[300px] md:h-[calc(100vh-5.5rem)] z-20 shrink-0 select-none">
      <div className="flex-1 bg-[#141416]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-soft-xl flex flex-col overflow-hidden text-ink-100">
        
        {/* Panel Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-emerald-400 shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-extrabold text-white tracking-wide uppercase">
                Route Planner
              </h2>
              <p className="text-[10px] text-ink-400 font-medium">
                135 Nodes · Chandigarh & National
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onToggleOpen && (
              <button
                type="button"
                onClick={onToggleOpen}
                className="p-1.5 rounded-xl hover:bg-white/10 text-ink-400 hover:text-white border border-transparent hover:border-white/10 transition cursor-pointer"
                title="Collapse sidebar (Full screen map)"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-3.5 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          
          {/* Quick Route Presets Horizontal Bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                Popular Routes
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => loadPreset('DEL', 'MUM')}
                disabled={isBusy}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-ink-300 hover:text-white border border-white/10 hover:border-white/20 whitespace-nowrap transition cursor-pointer disabled:opacity-50"
              >
                Delhi → Mumbai
              </button>
              <button
                type="button"
                onClick={() => loadPreset('DEL', 'BLR')}
                disabled={isBusy}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-ink-300 hover:text-white border border-white/10 hover:border-white/20 whitespace-nowrap transition cursor-pointer disabled:opacity-50"
              >
                Delhi → Bengaluru
              </button>
              <button
                type="button"
                onClick={() => loadPreset('MUM', 'GOA')}
                disabled={isBusy}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-ink-300 hover:text-white border border-white/10 hover:border-white/20 whitespace-nowrap transition cursor-pointer disabled:opacity-50"
              >
                Mumbai → Goa
              </button>
              <button
                type="button"
                onClick={() => loadPreset('KOL', 'CHE')}
                disabled={isBusy}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-ink-300 hover:text-white border border-white/10 hover:border-white/20 whitespace-nowrap transition cursor-pointer disabled:opacity-50"
              >
                Kolkata → Chennai
              </button>
              <button
                type="button"
                onClick={() => loadPreset('DEL', 'SML')}
                disabled={isBusy}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-ink-300 hover:text-white border border-white/10 hover:border-white/20 whitespace-nowrap transition cursor-pointer disabled:opacity-50"
              >
                Delhi → Shimla
              </button>
              <button
                type="button"
                onClick={() => loadPreset('DEL', 'CHE', ['JAI', 'HYD'])}
                disabled={isBusy}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-emerald-500/20 text-purple-200 border border-purple-400/30 whitespace-nowrap transition cursor-pointer disabled:opacity-50"
              >
                Multi-Stop
              </button>
            </div>
          </div>

          {/* Connected Origin & Destination Card */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3 space-y-2.5 shadow-xs relative">
            <div className="flex gap-2.5 items-stretch">
              
              {/* Left Route Track Line */}
              <div className="flex flex-col items-center justify-between py-2 shrink-0 w-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
                <div className="w-0.5 flex-1 bg-white/15 my-1 rounded-full" />
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
              </div>

              {/* Inputs Column */}
              <div className="flex-1 space-y-2">
                {/* Start Location Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">
                      Origin
                    </span>
                    <button
                      type="button"
                      onClick={onUseCurrentLocation}
                      disabled={isLocating || isBusy}
                      className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition disabled:opacity-50 cursor-pointer"
                    >
                      <Navigation className={cn('w-2.5 h-2.5', isLocating && 'animate-spin')} />
                      <span>{isLocating ? 'Locating...' : 'My Location'}</span>
                    </button>
                  </div>
                  <select
                    value={startNode}
                    onChange={(e) => setStartNode(e.target.value)}
                    disabled={isBusy}
                    className="w-full bg-[#1C1C20] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-inner"
                  >
                    <option value="">Select origin...</option>
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id} className="bg-[#18181A] text-white">
                        {n.name} ({n.region})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional Stops */}
                {stops.length > 0 && (
                  <MotionList className="space-y-1.5 pt-1">
                    {stops.map((stop, index) => (
                      <MotionListItem key={index} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        <select
                          value={stop}
                          onChange={(e) => updateStop(index, e.target.value)}
                          disabled={isBusy}
                          className="flex-1 bg-[#1C1C20] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        >
                          <option value="">Select stop {index + 1}...</option>
                          {nodes.map((n) => (
                            <option key={n.id} value={n.id} className="bg-[#18181A] text-white">
                              {n.name} ({n.region})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeStop(index)}
                          disabled={isBusy}
                          className="p-1.5 text-ink-400 hover:text-rose-400 transition cursor-pointer rounded-lg hover:bg-rose-500/10"
                          title="Remove stop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </MotionListItem>
                    ))}
                  </MotionList>
                )}

                {/* Destination Input */}
                <div>
                  <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block mb-1">
                    Destination
                  </span>
                  <select
                    value={destNode}
                    onChange={(e) => setDestNode(e.target.value)}
                    disabled={isBusy}
                    className="w-full bg-[#1C1C20] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 shadow-inner"
                  >
                    <option value="">Select destination...</option>
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id} className="bg-[#18181A] text-white">
                        {n.name} ({n.region})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Floating Swap Button */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleSwap}
                  disabled={isBusy}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-ink-300 hover:text-white border border-white/10 transition cursor-pointer shadow-xs"
                  title="Swap Origin and Destination"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Add Stop Button */}
            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={addStop}
                disabled={isBusy || stops.length >= 5}
                className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Waypoint ({stops.length}/5)</span>
              </button>
            </div>
          </div>

          {/* Mode & Vehicle Segmented Controls */}
          <div className="space-y-2">
            {/* Routing Mode Toggle */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-1 grid grid-cols-2 gap-1 text-center">
              <button
                type="button"
                onClick={() => setSimulationMode('road')}
                disabled={isBusy}
                className={cn(
                  'py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5',
                  simulationMode === 'road'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-xs'
                    : 'text-ink-400 hover:text-white hover:bg-white/5 border border-transparent'
                )}
              >
                <span>🛣️</span>
                <span>Road Driving</span>
              </button>
              <button
                type="button"
                onClick={() => setSimulationMode('graph')}
                disabled={isBusy}
                className={cn(
                  'py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5',
                  simulationMode === 'graph'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-xs'
                    : 'text-ink-400 hover:text-white hover:bg-white/5 border border-transparent'
                )}
              >
                <span>⚡</span>
                <span>DSA Graph (Dijkstra)</span>
              </button>
            </div>

            {/* Travel Vehicle Selector */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-1 grid grid-cols-3 gap-1 text-center">
              <button
                type="button"
                onClick={() => onSelectTravelVehicle?.('car')}
                className={cn(
                  'py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5',
                  travelVehicle === 'car'
                    ? 'bg-blue-500/25 text-blue-300 border border-blue-400/40 shadow-xs'
                    : 'text-ink-400 hover:text-white hover:bg-white/5 border border-transparent'
                )}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Car</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTravelVehicle?.('bike')}
                className={cn(
                  'py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5',
                  travelVehicle === 'bike'
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-400/40 shadow-xs'
                    : 'text-ink-400 hover:text-white hover:bg-white/5 border border-transparent'
                )}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Bike</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTravelVehicle?.('foot')}
                className={cn(
                  'py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5',
                  travelVehicle === 'foot'
                    ? 'bg-sky-500/25 text-sky-300 border border-sky-400/40 shadow-xs'
                    : 'text-ink-400 hover:text-white hover:bg-white/5 border border-transparent'
                )}
              >
                <Footprints className="w-3.5 h-3.5" />
                <span>Walk</span>
              </button>
            </div>
          </div>



          {/* Primary Action Button */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={onFindRoute}
              disabled={!startNode || !destNode || isBusy}
              className={cn(
                'w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg select-none',
                !startNode || !destNode || isBusy
                  ? 'bg-white/5 text-ink-500 border border-white/5 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/20 active:scale-[0.99]'
              )}
            >
              <Route className="w-4 h-4" />
              <span>{isLoading ? 'Computing Route...' : 'Find Route'}</span>
            </button>

            {/* Secondary Actions: Simulate */}
            <button
              type="button"
              onClick={onStartSimulation}
              disabled={!startNode || !destNode || (isBusy && simulationStatus !== 'paused')}
              className={cn(
                'w-full py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer',
                simulationStatus === 'running'
                  ? 'bg-amber-500/20 border-amber-400/30 text-amber-300'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-ink-200 hover:text-white'
              )}
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {simulationStatus === 'paused'
                  ? 'Resume Simulation'
                  : simulationStatus === 'running'
                    ? 'Simulating...'
                    : 'Simulate Route'}
              </span>
            </button>
          </div>

          {/* Simulation Active Controls Drawer */}
          {isSimulating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/[0.04] border border-white/10 rounded-2xl p-2.5 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Simulation Progress
                </span>
                <span className="text-[10px] font-mono text-ink-400 font-bold">
                  {Math.min(simulationStep + 1, simulationTotalSteps)} / {simulationTotalSteps}
                </span>
              </div>

              {/* Progress Slider / Speed */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-ink-400">
                  <span>Speed</span>
                  <span className="font-mono text-white font-bold">{simulationDelay} ms/step</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="400"
                  step="25"
                  value={simulationDelay}
                  onChange={(e) => setSimulationDelay(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                />
              </div>

              {/* Pause / Resume button */}
              <button
                type="button"
                onClick={simulationStatus === 'running' ? onPauseSimulation : onStartSimulation}
                className="w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {simulationStatus === 'running' ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pause Simulation</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Resume Simulation</span>
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* Route Summary Card or Empty State */}
          {routeResult && routeResult.found ? (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 shadow-soft space-y-3"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Route className="w-3.5 h-3.5 text-emerald-400" />
                  Route Summary
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {routeResult.provider ?? 'GOOGLE MAPS'}
                </span>
              </div>

              {(() => {
                const drivingMinutes = routeResult.timeMin ?? 0;
                const distKm = routeResult.distanceKm ?? 0;
                const carTime = formatDuration(drivingMinutes);
                const bikeMinutes =
                  distKm > 50
                    ? (distKm / 48) * 60
                    : drivingMinutes > 0
                      ? drivingMinutes * 1.08
                      : (distKm / 35) * 60;
                const bikeTime = formatDuration(bikeMinutes);
                const footMinutes = (distKm / 4.8) * 60;
                const footTime = formatDuration(footMinutes, true);

                return (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-[10px] uppercase font-bold text-ink-400">Distance</div>
                        <div className="text-base font-extrabold text-white font-mono mt-0.5">
                          {distKm.toFixed(1)} <span className="text-xs text-ink-400">km</span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-[10px] uppercase font-bold text-ink-400">Est. Time</div>
                        <div className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">
                          {carTime.value} <span className="text-xs text-ink-400">{carTime.unit}</span>
                        </div>
                      </div>
                    </div>

                    {/* Multi-modal Estimates */}
                    <div className="grid grid-cols-3 gap-1.5 text-center pt-1">
                      <button
                        type="button"
                        onClick={() => onSelectTravelVehicle?.('car')}
                        className={cn(
                          'p-2 rounded-xl border text-center transition cursor-pointer',
                          travelVehicle === 'car'
                            ? 'bg-blue-500/20 border-blue-400 text-blue-200'
                            : 'bg-white/5 border-white/10 text-ink-300 hover:bg-white/10'
                        )}
                      >
                        <Car className="w-3 h-3 mx-auto mb-1 text-blue-400" />
                        <div className="text-[11px] font-bold font-mono">{carTime.full}</div>
                        <div className="text-[9px] text-ink-400">Car</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectTravelVehicle?.('bike')}
                        className={cn(
                          'p-2 rounded-xl border text-center transition cursor-pointer',
                          travelVehicle === 'bike'
                            ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                            : 'bg-white/5 border-white/10 text-ink-300 hover:bg-white/10'
                        )}
                      >
                        <Bike className="w-3 h-3 mx-auto mb-1 text-rose-400" />
                        <div className="text-[11px] font-bold font-mono">{bikeTime.full}</div>
                        <div className="text-[9px] text-ink-400">Bike</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectTravelVehicle?.('foot')}
                        className={cn(
                          'p-2 rounded-xl border text-center transition cursor-pointer',
                          travelVehicle === 'foot'
                            ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                            : 'bg-white/5 border-white/10 text-ink-300 hover:bg-white/10'
                        )}
                      >
                        <Footprints className="w-3 h-3 mx-auto mb-1 text-sky-400" />
                        <div className="text-[11px] font-bold font-mono">{footTime.full}</div>
                        <div className="text-[9px] text-ink-400">Walk</div>
                      </button>
                    </div>
                  </>
                );
              })()}

              {/* Stop Sequence */}
              {routeResult.path && routeResult.path.length > 0 && (
                <div className="pt-2 border-t border-white/10">
                  <div className="text-[10px] text-ink-400 font-bold uppercase tracking-wider mb-1.5">
                    Waypoints ({routeResult.path.length} points)
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-black/20 rounded-xl border border-white/5">
                    {routeResult.path.map((nodeId, idx) => {
                      const node = nodes.find((n) => n.id === nodeId);
                      const isLast = idx === (routeResult.path?.length ?? 0) - 1;
                      return (
                        <span key={nodeId} className="inline-flex items-center text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-white/10 text-ink-200 font-medium">
                            {node ? node.name : nodeId}
                          </span>
                          {!isLast && <span className="text-emerald-400 mx-1">→</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          ) : routeError ? (
            <div
              role="alert"
              className="flex gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-200 text-xs"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              <div>
                <div className="font-bold">Route unavailable</div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-rose-300/90">{routeError}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

export default React.memo(ControlPanel);

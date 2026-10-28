import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ArrowUpDown,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  Zap,
  Clock,
  ShieldAlert,
  Search,
  Route,
  ChevronDown,
  ChevronUp,
  Cpu
} from 'lucide-react';

export default function ControlPanel({
  nodes = [],
  startNode,
  setStartNode,
  destNode,
  setDestNode,
  stops = [],
  setStops,
  algorithm,
  setAlgorithm,
  mode,
  setMode,
  avoidHighways,
  setAvoidHighways,
  highwayAvoidMode,
  setHighwayAvoidMode,
  trafficMultiplier,
  setTrafficMultiplier,
  onCalculateRoute,
  onOptimizeStops,
  onStartSimulation,
  isLoading,
  onUseCurrentLocation,
  isLocating,
  routeResult
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [startQuery, setStartQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Helper to filter nodes
  const filterNodes = (query) => {
    if (!query) return nodes.slice(0, 8);
    const q = query.toLowerCase();
    return nodes.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        n.id.toLowerCase().includes(q) ||
        n.region.toLowerCase().includes(q)
    );
  };

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

  const updateStop = (index, value) => {
    const nextStops = [...stops];
    nextStops[index] = value;
    setStops(nextStops);
  };

  const removeStop = (index) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  // Quick preset loader
  const loadPreset = (startId, destId, optStops = [], optMode = 'distance') => {
    setStartNode(startId);
    setDestNode(destId);
    setStops(optStops);
    setMode(optMode);
  };

  return (
    <aside className="w-full md:w-96 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col h-[calc(100vh-4rem)] z-10 shrink-0 shadow-2xl overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Preset chips */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Popular Routes
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">Quick Pick</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => loadPreset('CHD17', 'SML', [], 'time')}
              className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              S17 → Shimla
            </button>
            <button
              onClick={() => loadPreset('CHD17', 'MNL', [], 'time')}
              className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              S17 → Manali
            </button>
            <button
              onClick={() => loadPreset('CU_GHR', 'SML', [], 'time')}
              className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              CU Gharuan → Shimla
            </button>
            <button
              onClick={() => loadPreset('CHD17', 'CHD_AIR', [], 'distance')}
              className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              S17 → Airport
            </button>
            <button
              onClick={() => loadPreset('CHD17', 'KFR', ['PKL_S5', 'SOL'], 'distance')}
              className="text-[11px] px-2.5 py-1 rounded-md bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 transition"
            >
              Multi-Stop: S17 → Kufri
            </button>
          </div>
        </div>

        {/* Start and Destination Selection */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-3 relative">
          {/* Start node */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20"></span>
                Start Location
              </label>
              <button
                onClick={onUseCurrentLocation}
                disabled={isLocating}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition disabled:opacity-50"
              >
                <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Locating...' : 'My Location'}</span>
              </button>
            </div>
            <select
              value={startNode}
              onChange={(e) => setStartNode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="">Select start place...</option>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.region})
                </option>
              ))}
            </select>
          </div>

          {/* Swap & Waypoints button */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={handleSwap}
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
              title="Swap Start and Destination"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={addStop}
              className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stop ({stops.length}/5)</span>
            </button>
          </div>

          {/* Intermediate Stops */}
          {stops.map((stop, index) => (
            <div key={index} className="flex items-center gap-1.5 pl-2 border-l-2 border-amber-500/60">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <select
                value={stop}
                onChange={(e) => updateStop(index, e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="">Select stop {index + 1}...</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.region})
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeStop(index)}
                className="p-1.5 text-slate-500 hover:text-red-400 transition"
                title="Remove Stop"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* TSP Bitmask DP Optimization Button (FR-4.5) */}
          {stops.filter(Boolean).length >= 2 && (
            <button
              type="button"
              onClick={onOptimizeStops}
              disabled={isLoading}
              className="w-full py-1.5 px-2.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 font-medium text-[11px] flex items-center justify-center gap-1.5 transition shadow-sm"
              title="Re-orders intermediate waypoints using Held-Karp Bitmask DP O(2^k · k^2) to minimize total travel distance"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Optimize Stop Order (TSP Bitmask DP)</span>
            </button>
          )}

          {/* Destination node */}
          <div className="relative">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-500/20"></span>
              Destination
            </label>
            <select
              value={destNode}
              onChange={(e) => setDestNode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
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

        {/* Algorithm & Cost Mode Toggle */}
        <div className="grid grid-cols-2 gap-2">
          {/* Algorithm */}
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Algorithm
            </label>
            <div className="grid grid-cols-2 gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setAlgorithm('astar')}
                className={`text-xs py-1.5 rounded-md font-medium transition ${
                  algorithm === 'astar'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                A* Search
              </button>
              <button
                onClick={() => setAlgorithm('dijkstra')}
                className={`text-xs py-1.5 rounded-md font-medium transition ${
                  algorithm === 'dijkstra'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dijkstra
              </button>
            </div>
          </div>

          {/* Mode */}
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Optimize For
            </label>
            <div className="grid grid-cols-2 gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setMode('distance')}
                className={`text-xs py-1.5 rounded-md font-medium transition ${
                  mode === 'distance'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Distance
              </button>
              <button
                onClick={() => setMode('time')}
                className={`text-xs py-1.5 rounded-md font-medium transition ${
                  mode === 'time'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Fastest
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters: Avoid Highways & Simulated Traffic */}
        <div className="bg-slate-950/70 rounded-xl border border-slate-800 overflow-hidden">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs text-slate-300 hover:text-white transition"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Routing Filters & Traffic Simulation
            </span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="p-3.5 pt-1 space-y-3 border-t border-slate-800/80 text-xs">
              {/* Avoid Highways */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-medium text-slate-300">Avoid Highways</label>
                  <input
                    type="checkbox"
                    checked={avoidHighways}
                    onChange={(e) => setAvoidHighways(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-0 w-4 h-4"
                  />
                </div>
                {avoidHighways && (
                  <div className="grid grid-cols-2 gap-1 mt-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setHighwayAvoidMode('penalty')}
                      className={`py-1 text-[11px] rounded transition ${
                        highwayAvoidMode === 'penalty'
                          ? 'bg-slate-800 text-cyan-300 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      Soft Penalty (3x)
                    </button>
                    <button
                      onClick={() => setHighwayAvoidMode('block')}
                      className={`py-1 text-[11px] rounded transition ${
                        highwayAvoidMode === 'block'
                          ? 'bg-slate-800 text-red-300 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      Hard Block (∞)
                    </button>
                  </div>
                )}
              </div>

              {/* Simulated Traffic Multiplier */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400">Simulated Corridor Traffic</span>
                  <span className="text-cyan-400 font-mono font-medium">{trafficMultiplier}x delay</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.2"
                  value={trafficMultiplier}
                  onChange={(e) => setTrafficMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">
                  Simulates peak traffic delays along major highway choke points.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => onCalculateRoute(false)}
            disabled={!startNode || !destNode || isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Route className="w-4 h-4" />
            <span>{isLoading ? 'Calculating...' : 'Find Best Route'}</span>
          </button>

          <button
            onClick={() => onCalculateRoute(true)}
            disabled={!startNode || !destNode || isLoading}
            className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-medium text-xs transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Compute & Run Step Simulation</span>
          </button>
        </div>

        {/* Route Summary Card */}
        {routeResult && routeResult.found && (
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-cyan-800/50 space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                <Route className="w-3.5 h-3.5" />
                Route Summary
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {routeResult.algorithm.toUpperCase()} · {routeResult.mode.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Distance</div>
                <div className="text-sm font-bold text-slate-100 font-mono">
                  {routeResult.distanceKm} <span className="text-[10px] font-normal text-slate-400">km</span>
                </div>
              </div>

              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Time</div>
                <div className="text-sm font-bold text-amber-400 font-mono">
                  {Math.round(routeResult.timeMin)} <span className="text-[10px] font-normal text-slate-400">min</span>
                </div>
              </div>

              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Nodes Explored</div>
                <div className="text-sm font-bold text-purple-400 font-mono">
                  {routeResult.nodesExplored}
                </div>
              </div>
            </div>

            {/* Path node breadcrumbs */}
            <div className="pt-1">
              <div className="text-[10px] text-slate-400 mb-1 font-medium">
                Passes {routeResult.path.length} Places:
              </div>
              <div className="text-xs text-slate-300 font-mono flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-slate-900/50 rounded-lg border border-slate-800">
                {routeResult.path.map((nodeId, idx) => {
                  const node = nodes.find((n) => n.id === nodeId);
                  return (
                    <span key={nodeId} className="inline-flex items-center">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px]">
                        {node ? node.name : nodeId}
                      </span>
                      {idx < routeResult.path.length - 1 && (
                        <span className="text-slate-600 mx-0.5">→</span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}


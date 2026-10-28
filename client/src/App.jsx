import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import ControlPanel from './components/ControlPanel.jsx';
import MapViewer from './components/MapViewer.jsx';
import SimulationPlayer from './components/SimulationPlayer.jsx';
import CompareModal from './components/CompareModal.jsx';
import VivaGuideModal from './components/VivaGuideModal.jsx';
import TestRunnerModal from './components/TestRunnerModal.jsx';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export default function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [stats, setStats] = useState(null);

  // Route planning state
  const [startNode, setStartNode] = useState('CHD17'); // Default: Sector 17 Plaza
  const [destNode, setDestNode] = useState('SML');     // Default: Shimla The Ridge
  const [stops, setStops] = useState([]);
  const [algorithm, setAlgorithm] = useState('astar');
  const [mode, setMode] = useState('distance');
  const [avoidHighways, setAvoidHighways] = useState(false);
  const [highwayAvoidMode, setHighwayAvoidMode] = useState('penalty');
  const [trafficMultiplier, setTrafficMultiplier] = useState(1.0);

  // Result & Simulation state
  const [routeResult, setRouteResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Modals
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isVivaOpen, setIsVivaOpen] = useState(false);
  const [isTestsOpen, setIsTestsOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 6000);
  };

  // Fetch initial graph on mount
  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await fetch('/api/graph');
        const data = await res.json();
        if (data.success) {
          setNodes(data.nodes);
          setEdges(data.edges);
          setStats(data.stats);
        } else {
          showToast(`Failed to load road network: ${data.error}`, 'error');
        }
      } catch (err) {
        showToast(`Server connection error: ${err.message}`, 'error');
      }
    };

    fetchGraph();
  }, []);

  // Use Browser Geolocation (FR-1.1)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/nodes/nearest?lat=${latitude}&lng=${longitude}`);
          const data = await res.json();

          if (data.success && data.node) {
            setStartNode(data.node.id);
            if (data.outOfCoverage) {
              showToast(
                `Your GPS location is ${data.distanceKm} km away (> 15 km coverage limit). Snapped to nearest network gateway: ${data.node.name}.`,
                'warning'
              );
            } else {
              showToast(`Snapped start point to: ${data.node.name} (${data.distanceKm} km away).`, 'success');
            }
          } else {
            showToast('Could not find a nearby node.', 'error');
          }
        } catch (err) {
          showToast(`Error snapping location: ${err.message}`, 'error');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Could not access current location.';
        if (err.code === 1) msg = 'Location permission was denied. Please select a node on the map.';
        else if (err.code === 3) msg = 'Location request timed out (10s limit). Falling back to map selection.';
        showToast(msg, 'error');
      },
      { timeout: 10000 }
    );
  };

  // Compute Route or Run Simulation
  const handleCalculateRoute = async (startSimImmediately = false) => {
    if (!startNode || !destNode) {
      showToast('Please select both a start location and destination.', 'error');
      return;
    }

    if (startNode === destNode) {
      showToast('Start and destination are the same! Route distance is 0 km.', 'info');
    }

    setIsLoading(true);
    try {
      const activeStops = stops.filter((s) => Boolean(s));

      let res, json;
      if (activeStops.length > 0) {
        // Multi-stop route
        const allStops = [startNode, ...activeStops, destNode];
        res = await fetch('/api/route/multistop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stops: allStops,
            algorithm,
            mode,
            avoidHighways,
            highwayAvoidMode,
            trafficMultipliers: trafficMultiplier > 1 ? { 'e_pnj_klk': trafficMultiplier, 'e_chd17_trb': trafficMultiplier } : {}
          })
        });
      } else {
        // Standard route
        res = await fetch('/api/route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: startNode,
            to: destNode,
            algorithm,
            mode,
            avoidHighways,
            highwayAvoidMode,
            trafficMultipliers: trafficMultiplier > 1 ? { 'e_pnj_klk': trafficMultiplier, 'e_chd17_trb': trafficMultiplier } : {},
            includeTrace: true
          })
        });
      }

      json = await res.json();
      if (json.success) {
        if (!json.found) {
          showToast(
            avoidHighways && highwayAvoidMode === 'block'
              ? 'No route found! Hard-blocking highways made this destination unreachable. Try soft penalty mode.'
              : 'No route found between selected points.',
            'error'
          );
          setRouteResult(null);
          setIsSimulating(false);
        } else {
          setRouteResult(json);
          if (startSimImmediately && json.trace && json.trace.length > 0) {
            setIsSimulating(true);
            setCurrentStepIndex(0);
            setIsPlaying(true);
          } else {
            setIsSimulating(false);
          }
        }
      } else {
        showToast(json.error || 'Failed to calculate route.', 'error');
      }
    } catch (err) {
      showToast(`Network error: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Optimize stop order using Held-Karp Bitmask DP (TSP - FR-4.5)
  const handleOptimizeStops = async () => {
    const activeStops = stops.filter((s) => Boolean(s));
    if (activeStops.length < 2) {
      showToast('Need at least 2 intermediate stops to optimize visiting order.', 'info');
      return;
    }

    setIsLoading(true);
    try {
      const allStops = [startNode, ...activeStops, destNode];
      const res = await fetch('/api/route/multistop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stops: allStops,
          optimizeOrder: true,
          algorithm,
          mode,
          avoidHighways,
          highwayAvoidMode
        })
      });

      const json = await res.json();
      if (json.success && json.found) {
        if (json.stops && json.stops.length >= 2) {
          const reorderedIntermediates = json.stops.slice(1, -1);
          setStops(reorderedIntermediates);
        }
        setRouteResult(json);
        showToast('Stops optimized using Held-Karp Bitmask DP for minimum travel cost!', 'success');
      } else {
        showToast(json.error || 'Failed to optimize stop order.', 'error');
      }
    } catch (err) {
      showToast(`Optimization error: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 select-none">
      {/* Toast Alert Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-[3000] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border text-xs max-w-md animate-slideDown bg-slate-900/95 text-slate-100 border-slate-700">
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
          <span className="flex-1 leading-relaxed">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Application Header */}
      <Header
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenViva={() => setIsVivaOpen(true)}
        onOpenTests={() => setIsTestsOpen(true)}
        hasRoute={Boolean(routeResult?.found)}
        onStartSimulation={() => {
          if (routeResult?.trace?.length > 0) {
            setIsSimulating(true);
            setCurrentStepIndex(0);
            setIsPlaying(true);
          }
        }}
        isSimulating={isSimulating}
        stats={stats}
      />

      {/* Main Content Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Control Panel */}
        <ControlPanel
          nodes={nodes}
          startNode={startNode}
          setStartNode={setStartNode}
          destNode={destNode}
          setDestNode={setDestNode}
          stops={stops}
          setStops={setStops}
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          mode={mode}
          setMode={setMode}
          avoidHighways={avoidHighways}
          setAvoidHighways={setAvoidHighways}
          highwayAvoidMode={highwayAvoidMode}
          setHighwayAvoidMode={setHighwayAvoidMode}
          trafficMultiplier={trafficMultiplier}
          setTrafficMultiplier={setTrafficMultiplier}
          onCalculateRoute={handleCalculateRoute}
          onOptimizeStops={handleOptimizeStops}
          isLoading={isLoading}
          onUseCurrentLocation={handleUseCurrentLocation}
          isLocating={isLocating}
          routeResult={routeResult}
        />

        {/* Central Leaflet Map View */}
        <MapViewer
          nodes={nodes}
          edges={edges}
          activePath={isSimulating ? [] : routeResult?.path || []}
          simulationStep={isSimulating ? routeResult?.trace?.[currentStepIndex] : null}
          startNodeId={startNode}
          destNodeId={destNode}
          onNodeClick={(node) => {
            if (!startNode) setStartNode(node.id);
            else if (!destNode) setDestNode(node.id);
          }}
        />

        {/* Step-by-Step Simulation Player Bar */}
        {isSimulating && routeResult?.trace && (
          <SimulationPlayer
            trace={routeResult.trace}
            currentStepIndex={currentStepIndex}
            setCurrentStepIndex={setCurrentStepIndex}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            speed={speed}
            setSpeed={setSpeed}
            nodes={nodes}
            onClose={() => setIsSimulating(false)}
          />
        )}
      </div>

      {/* Modals */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        startNode={startNode}
        destNode={destNode}
        mode={mode}
        avoidHighways={avoidHighways}
        nodes={nodes}
      />

      <VivaGuideModal
        isOpen={isVivaOpen}
        onClose={() => setIsVivaOpen(false)}
      />

      <TestRunnerModal
        isOpen={isTestsOpen}
        onClose={() => setIsTestsOpen(false)}
      />
    </div>
  );
}


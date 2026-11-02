import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import ControlPanel, {
  NodeItem,
  RouteResult,
  SimulationMode,
  SimulationStatus,
} from './components/ControlPanel';
import MapViewer, {
  EdgeItem,
  DirectionsRouteRequest,
  DirectionsRouteSummary,
  GraphSimulationFrame,
  MapSelectionTarget,
  RouteSample,
} from './components/MapViewer';
import AlgorithmTableModal from './components/AlgorithmTableModal';
import VivaGuideModal from './components/VivaGuideModal';
import TestRunnerModal from './components/TestRunnerModal';
import { CommandPalette } from './components/ui';
import { AlertCircle, CheckCircle, Info, X, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { springSoft, fadeUp } from './lib/motion';
import { apiUrl } from './lib/api';

export interface ToastNotification {
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
}

export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  corridorsCount: number;
}

type Theme = 'dark' | 'light';

const hasCoordinates = (
  node: NodeItem | undefined
): node is NodeItem & { lat: number; lng: number } =>
  Boolean(node && Number.isFinite(node.lat) && Number.isFinite(node.lng));

const distanceBetween = (
  start: google.maps.LatLngLiteral,
  end: google.maps.LatLngLiteral
) => {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(end.lat - start.lat);
  const longitudeDelta = radians(end.lng - start.lng);
  const startLatitude = radians(start.lat);
  const endLatitude = radians(end.lat);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

const sampleRoutePath = (
  path: google.maps.LatLngLiteral[],
  distanceMeters: number
): RouteSample[] => {
  if (path.length === 0 || !Number.isFinite(distanceMeters) || distanceMeters <= 0) {
    throw new Error('Google Maps returned route geometry that could not be sampled.');
  }
  if (path.length === 1) {
    return [{ point: path[0], pathIndex: 0 }];
  }

  const segmentDistances = path.slice(1).map((point, index) =>
    distanceBetween(path[index], point)
  );
  const totalGeometryDistance = segmentDistances.reduce(
    (total, distance) => total + distance,
    0
  );
  if (totalGeometryDistance <= 0) {
    throw new Error('Google Maps returned an empty driving-route geometry.');
  }

  const sampleCount = Math.min(
    240,
    Math.max(2, Math.ceil(distanceMeters / 350) + 1)
  );
  const samples: RouteSample[] = [];
  let segmentIndex = 0;
  let distanceAtSegmentStart = 0;

  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
    const targetDistance =
      (totalGeometryDistance * sampleIndex) / (sampleCount - 1);
    while (
      segmentIndex < segmentDistances.length - 1 &&
      distanceAtSegmentStart + segmentDistances[segmentIndex] < targetDistance
    ) {
      distanceAtSegmentStart += segmentDistances[segmentIndex];
      segmentIndex += 1;
    }

    const segmentLength = segmentDistances[segmentIndex];
    const fraction =
      segmentLength > 0
        ? Math.min(
            1,
            Math.max(0, (targetDistance - distanceAtSegmentStart) / segmentLength)
          )
        : 0;
    const start = path[segmentIndex];
    const end = path[segmentIndex + 1];
    samples.push({
      point: {
        lat: start.lat + (end.lat - start.lat) * fraction,
        lng: start.lng + (end.lng - start.lng) * fraction,
      },
      pathIndex: fraction === 1 ? segmentIndex + 1 : segmentIndex,
    });
  }

  return samples;
};

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return window.localStorage.getItem('pathscope-theme') === 'light'
        ? 'light'
        : 'dark';
    } catch (error) {
      console.warn('Could not read the saved theme preference.', error);
      return 'dark';
    }
  });
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [edges, setEdges] = useState<EdgeItem[]>([]);
  const [stats, setStats] = useState<GraphStats | null>(null);
  const [mapSelectionTarget, setMapSelectionTarget] =
    useState<MapSelectionTarget>('start');

  // Route planning state
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [startNode, setStartNode] = useState('DEL'); // Default: New Delhi
  const [destNode, setDestNode] = useState('MUM');   // Default: Mumbai
  const [stops, setStops] = useState<string[]>([]);
  const [mode, setMode] = useState('distance');

  // Google Directions state
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [directionsError, setDirectionsError] = useState<string | null>(null);
  const [directionsRequest, setDirectionsRequest] =
    useState<DirectionsRouteRequest | null>(null);
  const directionsRequestIdRef = useRef(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [simulationStatus, setSimulationStatus] =
    useState<SimulationStatus>('idle');
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('road');
  const [simulationFrames, setSimulationFrames] = useState<RouteSample[]>([]);
  const [graphSimulationFrames, setGraphSimulationFrames] = useState<
    GraphSimulationFrame[]
  >([]);
  const [graphFinalPathEdgeIds, setGraphFinalPathEdgeIds] = useState<string[]>([]);
  const [simulationStepIndex, setSimulationStepIndex] = useState(0);
  const [simulationRunId, setSimulationRunId] = useState(0);
  const [simulationDelay, setSimulationDelay] = useState(50);
  const [simulationPath, setSimulationPath] =
    useState<google.maps.LatLngLiteral[]>([]);
  const [travelVehicle, setTravelVehicle] = useState<'car' | 'bike' | 'foot'>('car');
  const latestRouteGeometryRef = useRef<{
    path: google.maps.LatLngLiteral[];
    distanceKm: number;
  } | null>(null);

  useEffect(() => {
    latestRouteGeometryRef.current = null;
  }, [startNode, destNode, stops]);
  const isWorkflowBusy =
    isLoading ||
    simulationStatus === 'preparing' ||
    simulationStatus === 'running' ||
    simulationStatus === 'paused' ||
    simulationStatus === 'finalizing';

  // Modals
  const [isAlgorithmTableOpen, setIsAlgorithmTableOpen] = useState(false);
  const [isVivaOpen, setIsVivaOpen] = useState(false);
  const [isTestsOpen, setIsTestsOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = (message: string, type: 'error' | 'success' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 6000);
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem('pathscope-theme', theme);
    } catch (error) {
      console.warn('Could not save the theme preference.', error);
    }
  }, [theme]);

  const selectMapNode = (node: NodeItem, distanceKm?: number) => {
    if (mapSelectionTarget === 'start') {
      setStartNode(node.id);
    } else {
      setDestNode(node.id);
    }

    const endpoint = mapSelectionTarget === 'start' ? 'Start' : 'Destination';
    const distanceMessage =
      distanceKm === undefined ? '' : ` (${distanceKm.toFixed(1)} km away)`;
    showToast(`${endpoint} set to ${node.name}${distanceMessage}.`, 'success');
  };

  const handleMapLocationSelect = async (lat: number, lng: number) => {
    if (isWorkflowBusy) return;
    try {
      const response = await fetch(
        apiUrl(`/api/nodes/nearest?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`)
      );
      const data = await response.json();
      if (!response.ok || !data.success || !data.node) {
        throw new Error(
          data.error || 'Could not find a nearby road-network location.'
        );
      }

      if (isWorkflowBusy) return;
      selectMapNode(data.node, data.distanceKm);
      if (data.outOfCoverage) {
        showToast(
          `Selected the nearest network location, ${data.distanceKm.toFixed(1)} km away. This point is outside the 15 km coverage zone.`,
          'warning'
        );
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown location selection error.';
      showToast(`Could not select a map location: ${message}`, 'error');
    }
  };

  // Global keyboard shortcut for Command Palette (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (simulationStatus !== 'running' && simulationStatus !== 'finalizing') {
      return;
    }

    const totalSteps =
      simulationMode === 'graph'
        ? graphSimulationFrames.length
        : simulationFrames.length;
    const timer = window.setTimeout(() => {
      if (simulationStatus === 'running') {
        if (simulationStepIndex < totalSteps - 1) {
          setSimulationStepIndex((step) => step + 1);
        } else {
          setSimulationStatus('finalizing');
        }
      } else {
        setSimulationStatus('completed');
        showToast('Route simulation complete.', 'success');
      }
    }, simulationStatus === 'finalizing'
      ? Math.max(400, simulationDelay)
      : simulationDelay);

    return () => window.clearTimeout(timer);
  }, [
    simulationStatus,
    simulationStepIndex,
    simulationFrames.length,
    graphSimulationFrames.length,
    simulationMode,
    simulationDelay,
  ]);

  // Fetch initial graph on mount
  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await fetch(apiUrl('/api/graph'));
        const data = await res.json();
        if (data.success) {
          setNodes(data.nodes);
          setEdges(data.edges);
          setStats(data.stats);
        } else {
          showToast(`Failed to load road network: ${data.error}`, 'error');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        showToast(`Server connection error: ${msg}`, 'error');
      }
    };

    fetchGraph();
  }, []);

  // Use Browser Geolocation (FR-1.1)
  const handleUseCurrentLocation = () => {
    if (isWorkflowBusy) return;
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(apiUrl(`/api/nodes/nearest?lat=${latitude}&lng=${longitude}`));
          const data = await res.json();

          if (isWorkflowBusy) return;
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
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          showToast(`Error snapping location: ${msg}`, 'error');
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

  const createDirectionsRequest = (
    intent: DirectionsRouteRequest['intent']
  ): DirectionsRouteRequest | null => {
    if (!startNode || !destNode) {
      showToast('Please select both a start location and destination.', 'error');
      return null;
    }

    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const originNode = nodeById.get(startNode);
    const destinationNode = nodeById.get(destNode);
    if (!hasCoordinates(originNode) || !hasCoordinates(destinationNode)) {
      showToast('Select valid start and destination locations.', 'error');
      return null;
    }

    const activeStops = stops.filter(Boolean);
    const waypointNodes = activeStops.map((id) => nodeById.get(id));
    const validWaypointNodes = waypointNodes.filter(hasCoordinates);
    if (validWaypointNodes.length !== waypointNodes.length) {
      showToast('One or more selected stops are no longer available.', 'error');
      return null;
    }

    if (startNode === destNode && activeStops.length === 0) {
      showToast('Choose different start and destination locations.', 'error');
      return null;
    }

    directionsRequestIdRef.current += 1;
    return {
      id: directionsRequestIdRef.current,
      intent,
      origin: { lat: originNode.lat, lng: originNode.lng },
      destination: { lat: destinationNode.lat, lng: destinationNode.lng },
      waypoints: validWaypointNodes.map((node) => ({
        location: { lat: node.lat, lng: node.lng },
        vehicleStopover: true,
      })),
      waypointNames: validWaypointNodes.map((node) => node.name),
      originName: originNode.name,
      destinationName: destinationNode.name,
      optimizeWaypoints: validWaypointNodes.length > 1,
    };
  };

  const resetSimulation = () => {
    setSimulationRunId((runId) => runId + 1);
    setSimulationFrames([]);
    setGraphSimulationFrames([]);
    setGraphFinalPathEdgeIds([]);
    setSimulationStepIndex(0);
    setSimulationPath([]);
  };

  const handleFindRoute = () => {
    if (isWorkflowBusy) return;
    if (simulationMode === 'graph') {
      handleGraphSimulation();
      return;
    }
    const request = createDirectionsRequest('find');
    if (!request) return;

    resetSimulation();
    setRouteResult(null);
    setDirectionsError(null);
    setSimulationStatus('idle');
    setIsLoading(true);
    setDirectionsRequest(request);
  };

  const handleGraphSimulation = async () => {
    const selectedStops = [startNode, ...stops.filter(Boolean), destNode];
    const frames: GraphSimulationFrame[] = [];
    const routePath: string[] = [];
    const routeEdges: string[] = [];
    let distanceKm = 0;
    let timeMin = 0;
    let nodesExplored = 0;

    try {
      for (let legIndex = 0; legIndex < selectedStops.length - 1; legIndex += 1) {
        const response = await fetch(apiUrl('/api/route'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: selectedStops[legIndex],
            to: selectedStops[legIndex + 1],
            algorithm: 'dijkstra',
            mode,
            includeTrace: true,
          }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'The graph route could not be calculated.');
        }
        if (!result.found) {
          throw new Error(
            `No graph route exists between ${selectedStops[legIndex]} and ${selectedStops[legIndex + 1]}.`
          );
        }
        if (!Array.isArray(result.path) || !Array.isArray(result.pathEdges)) {
          throw new Error('The graph route response is missing its path data.');
        }
        if (!Array.isArray(result.trace) || result.trace.length === 0) {
          throw new Error('The graph route response did not include an algorithm trace.');
        }

        routePath.push(
          ...result.path.slice(legIndex === 0 ? 0 : 1)
        );
        routeEdges.push(...result.pathEdges);
        distanceKm += Number(result.distanceKm) || 0;
        timeMin += Number(result.timeMin) || 0;
        nodesExplored += Number(result.nodesExplored) || 0;
        frames.push(
          ...result.trace.map((frame: GraphSimulationFrame) => ({
            type: frame.type,
            node: frame.node,
            fromNode: frame.fromNode,
            toNode: frame.toNode,
            edgeId: frame.edgeId,
            visited: frame.visited,
          }))
        );
      }

      if (frames.length === 0) {
        throw new Error('The graph search returned no animation steps.');
      }

      const pathNodes = new Set(nodes.map((node) => node.id));
      const invalidPathNode = routePath.find((nodeId) => !pathNodes.has(nodeId));
      if (invalidPathNode) {
        throw new Error(`The graph route references unknown location ${invalidPathNode}.`);
      }

      setRouteResult({
        found: true,
        provider: 'MargDarshak Graph',
        mode: mode === 'time' ? 'time' : 'distance',
        distanceKm,
        timeMin,
        nodesExplored,
        algorithm: 'Dijkstra',
        path: routePath,
      });
      setGraphSimulationFrames(frames);
      setGraphFinalPathEdgeIds(routeEdges);
      setSimulationFrames([]);
      setSimulationPath([]);
      setSimulationStepIndex(0);
      setIsLoading(false);
      setSimulationStatus('running');
      showToast(
        `Dijkstra graph simulation ready with ${frames.length} exploration steps. Animating uniform cost search.`,
        'info'
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown graph simulation error.';
      setIsLoading(false);
      setRouteResult(null);
      setDirectionsError(message);
      setSimulationStatus('error');
      showToast(`Could not run graph simulation: ${message}`, 'error');
    }
  };

  const handleStartSimulation = () => {
    if (simulationStatus === 'paused') {
      setSimulationStatus('running');
      return;
    }
    if (
      simulationStatus === 'preparing' ||
      simulationStatus === 'running' ||
      simulationStatus === 'finalizing' ||
      isLoading
    ) {
      return;
    }

    // Fast replay if route geometry is already available in road mode
    if (
      simulationMode === 'road' &&
      latestRouteGeometryRef.current &&
      latestRouteGeometryRef.current.path.length > 0
    ) {
      const { path, distanceKm } = latestRouteGeometryRef.current;
      try {
        const samples = sampleRoutePath(path, distanceKm * 1000);
        setSimulationRunId((runId) => runId + 1);
        setSimulationPath(path);
        setSimulationFrames(samples);
        setSimulationStepIndex(0);
        setSimulationStatus('running');
        const vehicleLabel =
          travelVehicle === 'bike'
            ? '🏍️ Motorbike'
            : travelVehicle === 'foot'
              ? '🚶 Walking'
              : '🚗 Car';
        showToast(`Starting ${vehicleLabel} simulation.`, 'info');
        return;
      } catch (err) {
        // Fall back to refetching route
      }
    }

    const request = createDirectionsRequest('simulate');
    if (!request) return;

    resetSimulation();
    setRouteResult(null);
    setDirectionsError(null);
    setIsLoading(true);
    setSimulationStatus('preparing');
    if (simulationMode === 'graph') {
      void handleGraphSimulation();
    } else {
      setDirectionsRequest(request);
    }
  };

  const handleSelectTravelVehicle = (vehicle: 'car' | 'bike' | 'foot') => {
    setTravelVehicle(vehicle);

    if (simulationMode !== 'road') {
      setSimulationMode('road');
    }

    const vehicleLabel =
      vehicle === 'bike'
        ? '🏍️ Motorbike'
        : vehicle === 'foot'
          ? '🚶 Walking'
          : '🚗 Car';

    // If route geometry is already present, immediately animate selected vehicle!
    if (
      latestRouteGeometryRef.current &&
      latestRouteGeometryRef.current.path.length > 0
    ) {
      const { path, distanceKm } = latestRouteGeometryRef.current;
      try {
        const samples = sampleRoutePath(path, distanceKm * 1000);
        setSimulationRunId((runId) => runId + 1);
        setSimulationPath(path);
        setSimulationFrames(samples);
        setSimulationStepIndex(0);
        setSimulationStatus('running');
        showToast(`Starting ${vehicleLabel} simulation.`, 'info');
        return;
      } catch (err) {
        // Fall back to fetch
      }
    }

    // Otherwise initiate directions request and simulate
    if (!isWorkflowBusy) {
      const request = createDirectionsRequest('simulate');
      if (!request) return;

      resetSimulation();
      setRouteResult(null);
      setDirectionsError(null);
      setIsLoading(true);
      setSimulationStatus('preparing');
      setDirectionsRequest(request);
    }
  };

  const handlePauseSimulation = () => {
    if (simulationStatus === 'running') {
      setSimulationStatus('paused');
    }
  };

  const handleDirectionsResult = (
    summary: DirectionsRouteSummary,
    path: google.maps.LatLngLiteral[],
    intent: DirectionsRouteRequest['intent']
  ) => {
    latestRouteGeometryRef.current = {
      path,
      distanceKm: summary.distanceKm,
    };

    setRouteResult({
      found: true,
      provider: 'Google Maps',
      mode: 'driving',
      distanceKm: summary.distanceKm,
      timeMin: summary.timeMin,
      path: summary.stops,
    });
    setIsLoading(false);
    if (intent === 'simulate') {
      try {
        const samples = sampleRoutePath(
          path,
          summary.distanceKm * 1000
        );
        setSimulationPath(path);
        setSimulationFrames(samples);
        setSimulationStepIndex(0);
        setSimulationStatus('running');
        const vehicleLabel =
          travelVehicle === 'bike'
            ? '🏍️ Motorbike'
            : travelVehicle === 'foot'
              ? '🚶 Walking'
              : '🚗 Car';
        showToast(`Google driving route found. Starting ${vehicleLabel} simulation.`, 'info');
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : 'Could not sample Google Maps route geometry.';
        setDirectionsError(message);
        setSimulationStatus('error');
        showToast(message, 'error');
      }
      return;
    }

    setSimulationStatus('idle');
    showToast('Google Maps driving route found. Click Bike, Car, or Simulate to animate.', 'success');
  };

  const handleDirectionsError = (
    message: string,
    intent: DirectionsRouteRequest['intent']
  ) => {
    setRouteResult(null);
    const actionableMessage = message.includes('REQUEST_DENIED')
      ? 'Google denied this request. Enable Routes API for this Google Cloud project, verify billing, and check the API and HTTP referrer restrictions on your browser key.'
      : message;
    setDirectionsError(actionableMessage);
    setIsLoading(false);
    setSimulationStatus(intent === 'simulate' ? 'error' : 'idle');
    showToast(`Google Directions unavailable: ${actionableMessage}. Using MargDarshak Graph calculation...`, 'warning');
    handleGraphSimulation();
  };

  const handleOpenCommandPalette = useCallback(() => setIsCommandOpen(true), []);
  const handleToggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  }, []);
  const handleOpenAlgorithmTable = useCallback(() => setIsAlgorithmTableOpen(true), []);

  return (
    <div data-theme={theme} className="app-shell relative flex flex-col h-screen w-screen overflow-hidden bg-[#0D0D0D] text-ink-900 select-none">
      {/* Ambient background blur orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#E9DEFF]/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#D9F2E6]/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-[#FFE5D9]/30 blur-3xl pointer-events-none" />

      {/* Toast Alert Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={springSoft}
            className="fixed top-20 right-6 z-[3000] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-soft-xl backdrop-blur-xl border border-white/90 text-xs max-w-md bg-white/95 text-ink-900"
          >
            {toast.type === 'error' && (
              <div className="w-7 h-7 rounded-full bg-[#FFE4E6] flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              </div>
            )}
            {toast.type === 'success' && (
              <div className="w-7 h-7 rounded-full bg-[#D9F2E6] flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            )}
            {toast.type === 'warning' && (
              <div className="w-7 h-7 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              </div>
            )}
            {toast.type === 'info' && (
              <div className="w-7 h-7 rounded-full bg-[#E9DEFF] flex items-center justify-center shrink-0">
                <Info className="w-4 h-4 text-purple-700 shrink-0" />
              </div>
            )}
            <span className="flex-1 font-semibold leading-relaxed">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="p-1 rounded-full text-ink-400 hover:text-ink-900 hover:bg-ink-100 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Floating Application Header */}
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        stats={stats}
        isPanelOpen={isPanelOpen}
        onTogglePanel={() => setIsPanelOpen((prev) => !prev)}
      />

      {/* Main Content Workspace */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-y-auto md:overflow-hidden relative">
        {/* Left Floating Control Panel */}
        <AnimatePresence>
          {isPanelOpen && (
            <motion.div
              initial={{ opacity: 0, x: -40, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 'auto' }}
              exit={{ opacity: 0, x: -40, width: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="shrink-0 flex"
            >
              <ControlPanel
                nodes={nodes}
                startNode={startNode}
                setStartNode={setStartNode}
                destNode={destNode}
                setDestNode={setDestNode}
                stops={stops}
                setStops={setStops}
                onFindRoute={handleFindRoute}
                onOpenAlgorithmTable={handleOpenAlgorithmTable}
                onStartSimulation={handleStartSimulation}
                onPauseSimulation={handlePauseSimulation}
                simulationStatus={simulationStatus}
                simulationMode={simulationMode}
                setSimulationMode={setSimulationMode}
                simulationDelay={simulationDelay}
                setSimulationDelay={setSimulationDelay}
                simulationStep={simulationStepIndex}
                simulationTotalSteps={
                  simulationMode === 'graph'
                    ? graphSimulationFrames.length
                    : simulationFrames.length
                }
                isBusy={isWorkflowBusy}
                isLoading={isLoading}
                onUseCurrentLocation={handleUseCurrentLocation}
                isLocating={isLocating}
                routeResult={routeResult}
                routeError={directionsError}
                travelVehicle={travelVehicle}
                onSelectTravelVehicle={handleSelectTravelVehicle}
                onToggleOpen={() => setIsPanelOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Open Panel Button when panel is collapsed */}
        <AnimatePresence>
          {!isPanelOpen && (
            <motion.button
              type="button"
              initial={{ opacity: 0, x: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.9 }}
              onClick={() => setIsPanelOpen(true)}
              className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#141416]/95 hover:bg-[#1E1E22] text-white border border-white/15 shadow-2xl backdrop-blur-xl text-xs font-bold transition-all cursor-pointer group select-none active:scale-95"
              title="Open Route Planner"
            >
              <PanelLeftOpen className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Route Planner</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Google Maps base map with MargDarshak graph overlays */}
        <MapViewer
          theme={theme}
          nodes={nodes}
          edges={edges}
          directionsRequest={directionsRequest}
          onDirectionsResult={handleDirectionsResult}
          onDirectionsError={handleDirectionsError}
          simulationRunId={simulationRunId}
          simulationMode={simulationMode}
          simulationSamples={simulationFrames}
          graphSimulationFrames={graphSimulationFrames}
          graphFinalPathEdgeIds={graphFinalPathEdgeIds}
          simulationStepIndex={simulationStepIndex}
          simulationPath={simulationPath}
          showSimulationPath={
            simulationStatus === 'finalizing' ||
            simulationStatus === 'completed'
          }
          selectionEnabled={!isWorkflowBusy}
          startNodeId={startNode}
          destNodeId={destNode}
          travelVehicle={travelVehicle}
          selectionTarget={mapSelectionTarget}
          onSelectionTargetChange={setMapSelectionTarget}
          onNodeClick={(node) => selectMapNode(node)}
          onMapClick={handleMapLocationSelect}
          isPanelOpen={isPanelOpen}
          onTogglePanel={() => setIsPanelOpen((prev) => !prev)}
        />
      </div>

      {/* Modals & Command Palette */}
      <AlgorithmTableModal
        isOpen={isAlgorithmTableOpen}
        onClose={() => setIsAlgorithmTableOpen(false)}
      />

      <VivaGuideModal
        isOpen={isVivaOpen}
        onClose={() => setIsVivaOpen(false)}
      />

      <TestRunnerModal
        isOpen={isTestsOpen}
        onClose={() => setIsTestsOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        nodes={nodes}
        onSelectRoute={(s, d, intermediateStops) => {
          if (isWorkflowBusy) return;
          setStartNode(s);
          setDestNode(d);
          if (intermediateStops) setStops(intermediateStops);
        }}
        onSelectMode={(m) => setMode(m)}
        onOpenViva={() => setIsVivaOpen(true)}
        onOpenTests={() => setIsTestsOpen(true)}
      />
    </div>
  );
}

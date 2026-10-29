import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Layers, MapPin, Navigation2, X } from 'lucide-react';
import { fadeUp, springSoft } from '../lib/motion';
import { loadGoogleMaps } from '../lib/googleMaps';
import type { NodeItem } from './ControlPanel';

export interface RouteSample {
  point: google.maps.LatLngLiteral;
  pathIndex: number;
}

export interface GraphSimulationFrame {
  type: string;
  node?: string;
  fromNode?: string;
  toNode?: string;
  edgeId?: string;
  visited?: string[];
}

export interface EdgeItem {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  speedKmph: number;
  roadType: 'highway' | 'local' | string;
  terrain: 'plain' | 'hill' | string;
}

export type MapSelectionTarget = 'start' | 'destination';

export interface DirectionsRouteRequest {
  id: number;
  intent: 'find' | 'simulate';
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
  waypoints: google.maps.routes.Waypoint[];
  waypointNames: string[];
  originName: string;
  destinationName: string;
  optimizeWaypoints: boolean;
}

export interface DirectionsRouteSummary {
  distanceKm: number;
  timeMin: number;
  stops: string[];
}

export interface MapViewerProps {
  nodes?: NodeItem[];
  edges?: EdgeItem[];
  directionsRequest?: DirectionsRouteRequest | null;
  onDirectionsResult?: (
    summary: DirectionsRouteSummary,
    path: google.maps.LatLngLiteral[],
    intent: DirectionsRouteRequest['intent']
  ) => void;
  onDirectionsError?: (
    message: string,
    intent: DirectionsRouteRequest['intent']
  ) => void;
  simulationRunId: number;
  simulationMode: 'road' | 'graph';
  simulationPath?: google.maps.LatLngLiteral[];
  simulationSamples?: RouteSample[];
  graphSimulationFrames?: GraphSimulationFrame[];
  graphFinalPathEdgeIds?: string[];
  simulationStepIndex: number;
  showSimulationPath: boolean;
  selectionEnabled?: boolean;
  startNodeId?: string;
  destNodeId?: string;
  selectionTarget?: MapSelectionTarget;
  onSelectionTargetChange?: (target: MapSelectionTarget) => void;
  onNodeClick?: (node: NodeItem) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

const clearOverlays = (overlays: google.maps.Marker[]) => {
  overlays.forEach((overlay) => overlay.setMap(null));
  overlays.length = 0;
};

const clearRoutePolylines = (polylines: google.maps.Polyline[]) => {
  polylines.forEach((polyline) => polyline.setMap(null));
  polylines.length = 0;
};

const hasCoordinates = (
  node: NodeItem | undefined
): node is NodeItem & { lat: number; lng: number } =>
  Boolean(node && Number.isFinite(node.lat) && Number.isFinite(node.lng));

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

export default function MapViewer({
  nodes = [],
  edges = [],
  directionsRequest = null,
  onDirectionsResult,
  onDirectionsError,
  simulationRunId,
  simulationMode,
  simulationPath = [],
  simulationSamples = [],
  graphSimulationFrames = [],
  graphFinalPathEdgeIds = [],
  simulationStepIndex,
  showSimulationPath,
  selectionEnabled = true,
  startNodeId,
  destNodeId,
  selectionTarget = 'start',
  onSelectionTargetChange,
  onNodeClick,
  onMapClick,
}: MapViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const routesLibraryRef = useRef<google.maps.RoutesLibrary | null>(null);
  const nodeMarkersRef = useRef<google.maps.Marker[]>([]);
  const routePolylinesRef = useRef<google.maps.Polyline[]>([]);
  const simulationMarkerRef = useRef<google.maps.Marker | null>(null);
  const simulationPolylineRef = useRef<google.maps.Polyline | null>(null);
  const graphSimulationPolylinesRef = useRef(
    new Map<string, google.maps.Polyline>()
  );
  const graphSimulationMarkersRef = useRef(
    new Map<string, google.maps.Marker>()
  );
  const graphSimulationLastFrameIndexRef = useRef(-1);
  const simulationAnimationFrameRef = useRef<number | null>(null);
  const simulationLastPathIndexRef = useRef(-1);
  const simulationLastPointRef = useRef<google.maps.LatLngLiteral | null>(null);
  const completedAnimationRunIdRef = useRef<number | null>(null);
  const initialBoundsAppliedRef = useRef(false);
  const nodeClickRef = useRef(onNodeClick);
  const mapClickRef = useRef(onMapClick);
  const selectionEnabledRef = useRef(selectionEnabled);
  const directionsResultRef = useRef(onDirectionsResult);
  const directionsErrorRef = useRef(onDirectionsError);
  const directionsRequestIdRef = useRef(0);
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [mapError, setMapError] = useState('');
  const [showNodes, setShowNodes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);

  nodeClickRef.current = onNodeClick;
  mapClickRef.current = onMapClick;
  selectionEnabledRef.current = selectionEnabled;
  directionsResultRef.current = onDirectionsResult;
  directionsErrorRef.current = onDirectionsError;

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let cancelled = false;
    const previousAuthFailure = window.gm_authFailure;
    const authFailure = () => {
      previousAuthFailure?.();
      setMapError(
        'Google Maps could not authenticate this API key. Check that the Maps JavaScript API is enabled and the key allows this site.'
      );
      setMapStatus('error');
    };
    window.gm_authFailure = authFailure;

    loadGoogleMaps()
      .then(({ maps, routes }) => {
        if (cancelled || !mapContainerRef.current) return;

        const map = new maps.Map(mapContainerRef.current, {
          center: { lat: 31.2, lng: 76.95 },
          zoom: 8,
          minZoom: 6,
          maxZoom: 20,
          mapTypeId: 'roadmap',
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#0d0d0d' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#A6A6A6' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#0d0d0d' }] },
            {
              featureType: 'administrative',
              elementType: 'geometry',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#141414' }],
            },
            {
              featureType: 'landscape.natural',
              elementType: 'geometry',
              stylers: [{ color: '#1b221a' }],
            },
            {
              featureType: 'poi',
              elementType: 'geometry',
              stylers: [{ color: '#181818' }],
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{ color: '#1e291d' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#4a4a4a' }],
            },
            {
              featureType: 'road.local',
              elementType: 'geometry',
              stylers: [{ color: '#383838' }],
            },
            {
              featureType: 'road.arterial',
              elementType: 'geometry',
              stylers: [{ color: '#6e6e6e' }],
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{ color: '#b8b8b8' }],
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#2a2a2a' }, { weight: 1 }],
            },
            {
              featureType: 'transit',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#000000' }],
            },
          ],
          gestureHandling: 'greedy',
          zoomControl: true,
          mapTypeControl: true,
          mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT,
          },
          streetViewControl: false,
          fullscreenControl: false,
        });

        mapInstanceRef.current = map;
        routesLibraryRef.current = routes;
        map.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng && selectionEnabledRef.current) {
            mapClickRef.current?.(event.latLng.lat(), event.latLng.lng());
          }
        });
        setMapStatus('ready');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : 'Unknown loading error.';
        setMapError(`Google Maps failed to load. ${message}`);
        setMapStatus('error');
      });

    return () => {
      cancelled = true;
      if (window.gm_authFailure === authFailure) {
        window.gm_authFailure = previousAuthFailure;
      }
      if (mapInstanceRef.current) {
        google.maps.event.clearInstanceListeners(mapInstanceRef.current);
        mapInstanceRef.current = null;
      }
      routesLibraryRef.current = null;
      clearOverlays(nodeMarkersRef.current);
      clearRoutePolylines(routePolylinesRef.current);
      simulationMarkerRef.current?.setMap(null);
      simulationMarkerRef.current = null;
      simulationPolylineRef.current?.setMap(null);
      simulationPolylineRef.current = null;
      graphSimulationPolylinesRef.current.forEach((polyline) =>
        polyline.setMap(null)
      );
      graphSimulationPolylinesRef.current.clear();
      graphSimulationMarkersRef.current.forEach((marker) => marker.setMap(null));
      graphSimulationMarkersRef.current.clear();
      graphSimulationLastFrameIndexRef.current = -1;
      if (simulationAnimationFrameRef.current !== null) {
        cancelAnimationFrame(simulationAnimationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (mapStatus !== 'ready' || !map || initialBoundsAppliedRef.current) return;

    const validNodes = nodes.filter(hasCoordinates);
    if (validNodes.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    validNodes.forEach((node) => bounds.extend({ lat: node.lat, lng: node.lng }));
    map.fitBounds(bounds, 60);
    initialBoundsAppliedRef.current = true;
  }, [mapStatus, nodes]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const nodeMarkers = nodeMarkersRef.current;
    clearOverlays(nodeMarkers);
    if (mapStatus !== 'ready' || !map || !showNodes) return;

    nodes.forEach((node) => {
      if (!hasCoordinates(node)) return;
      const isStart = node.id === startNodeId;
      const isDestination = node.id === destNodeId;
      const isSelected = selectedNode?.id === node.id;
      const color = isStart
        ? '#8BAE52'
        : isDestination
          ? '#B87969'
          : isSelected
            ? '#B59D62'
            : '#777777';

      const marker = new google.maps.Marker({
        map,
        position: { lat: node.lat, lng: node.lng },
        title: `${node.name} (${node.region})`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isStart || isDestination ? 9 : isSelected ? 8 : 6,
          fillColor: color,
          fillOpacity: 0.95,
          strokeColor: '#E8E6DF',
          strokeWeight: 2,
          labelOrigin: new google.maps.Point(0, -18),
        },
        label: showLabels
          ? {
              text: node.name,
              className: 'google-map-node-label',
            }
          : undefined,
        zIndex: isStart || isDestination ? 10 : 5,
      });
      marker.addListener('click', () => {
        setSelectedNode(node);
        if (selectionEnabled) {
          nodeClickRef.current?.(node);
        }
      });
      nodeMarkers.push(marker);
    });
  }, [
    nodes,
    mapStatus,
    showNodes,
    showLabels,
    startNodeId,
    destNodeId,
    selectedNode,
    selectionEnabled,
  ]);

  useEffect(() => {
    clearRoutePolylines(routePolylinesRef.current);
    simulationMarkerRef.current?.setMap(null);
    simulationMarkerRef.current = null;
    simulationPolylineRef.current?.setMap(null);
    simulationPolylineRef.current = null;
    graphSimulationPolylinesRef.current.forEach((polyline) =>
      polyline.setMap(null)
    );
    graphSimulationPolylinesRef.current.clear();
    graphSimulationMarkersRef.current.forEach((marker) => marker.setMap(null));
    graphSimulationMarkersRef.current.clear();
    graphSimulationLastFrameIndexRef.current = -1;
    simulationLastPathIndexRef.current = -1;
    simulationLastPointRef.current = null;
    completedAnimationRunIdRef.current = null;
    if (simulationAnimationFrameRef.current !== null) {
      cancelAnimationFrame(simulationAnimationFrameRef.current);
      simulationAnimationFrameRef.current = null;
    }
  }, [simulationRunId]);

  useEffect(() => {
    if (simulationMode === 'graph') {
      graphSimulationLastFrameIndexRef.current = Math.min(
        simulationStepIndex,
        graphSimulationFrames.length - 1
      );
      return;
    }

    graphSimulationPolylinesRef.current.forEach((polyline) =>
      polyline.setMap(null)
    );
    graphSimulationPolylinesRef.current.clear();
    graphSimulationMarkersRef.current.forEach((marker) => marker.setMap(null));
    graphSimulationMarkersRef.current.clear();
    graphSimulationLastFrameIndexRef.current = -1;
  }, [simulationMode]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (
      simulationMode !== 'road' ||
      mapStatus !== 'ready' ||
      !map ||
      simulationSamples.length === 0 ||
      showSimulationPath
    ) {
      return;
    }

    const sample = simulationSamples[
      Math.min(simulationStepIndex, simulationSamples.length - 1)
    ];
    if (!sample) return;

    if (!simulationPolylineRef.current) {
      simulationPolylineRef.current = new google.maps.Polyline({
        path: [],
        map,
        strokeColor: '#8BAE52',
        strokeOpacity: 0.95,
        strokeWeight: 5,
        zIndex: 18,
      });
    }

    const revealedPath = simulationPolylineRef.current.getPath();
    for (
      let pathIndex = simulationLastPathIndexRef.current + 1;
      pathIndex <= sample.pathIndex;
      pathIndex += 1
    ) {
      const point = simulationPath[pathIndex];
      if (point) {
        revealedPath.push(new google.maps.LatLng(point));
      }
    }
    simulationLastPathIndexRef.current = Math.max(
      simulationLastPathIndexRef.current,
      sample.pathIndex
    );

    const lastPoint = simulationLastPointRef.current;
    if (
      !lastPoint ||
      lastPoint.lat !== sample.point.lat ||
      lastPoint.lng !== sample.point.lng
    ) {
      revealedPath.push(new google.maps.LatLng(sample.point));
      simulationLastPointRef.current = sample.point;
    }

    if (!simulationMarkerRef.current) {
      simulationMarkerRef.current = new google.maps.Marker({
        map,
        position: sample.point,
        title: 'Simulation progress along Google Maps driving route',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#8BAE52',
          fillOpacity: 1,
          strokeColor: '#E8E6DF',
          strokeWeight: 2,
        },
        zIndex: 20,
      });
    } else {
      simulationMarkerRef.current.setPosition(sample.point);
    }
  }, [
    simulationMode,
    simulationPath,
    simulationSamples,
    simulationStepIndex,
    simulationRunId,
    showSimulationPath,
    mapStatus,
  ]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (
      simulationMode !== 'road' ||
      !showSimulationPath ||
      mapStatus !== 'ready' ||
      !map ||
      !simulationPath.length ||
      completedAnimationRunIdRef.current === simulationRunId
    ) {
      return;
    }

    const finalPolyline = simulationPolylineRef.current;
    if (!finalPolyline) return;

    finalPolyline.setPath(simulationPath);
    simulationMarkerRef.current?.setMap(null);
    simulationMarkerRef.current = null;

    const startedAt = performance.now();
    const initialColor = [82, 120, 59];
    const finalColor = [139, 174, 82];
    const animateHighlight = (now: number) => {
      const progress = Math.min((now - startedAt) / 400, 1);
      const eased = 1 - (1 - progress) ** 3;
      const color = initialColor
        .map((start, index) =>
          Math.round(start + (finalColor[index] - start) * eased)
            .toString(16)
            .padStart(2, '0')
        )
        .join('');
      finalPolyline.setOptions({
        strokeColor: `#${color}`,
        strokeOpacity: 0.95 + 0.05 * eased,
        strokeWeight: 5 + 3 * eased,
      });

      if (progress < 1) {
        simulationAnimationFrameRef.current =
          requestAnimationFrame(animateHighlight);
      } else {
        simulationAnimationFrameRef.current = null;
        completedAnimationRunIdRef.current = simulationRunId;
      }
    };

    simulationAnimationFrameRef.current =
      requestAnimationFrame(animateHighlight);

    return () => {
      if (simulationAnimationFrameRef.current !== null) {
        cancelAnimationFrame(simulationAnimationFrameRef.current);
        simulationAnimationFrameRef.current = null;
      }
    };
  }, [
    simulationMode,
    showSimulationPath,
    simulationPath,
    simulationRunId,
    mapStatus,
  ]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (
      simulationMode !== 'graph' ||
      mapStatus !== 'ready' ||
      !map ||
      graphSimulationFrames.length === 0
    ) {
      return;
    }

    const lastFrameIndex = Math.min(
      simulationStepIndex,
      graphSimulationFrames.length - 1
    );
    for (
      let frameIndex = graphSimulationLastFrameIndexRef.current + 1;
      frameIndex <= lastFrameIndex;
      frameIndex += 1
    ) {
      const frame = graphSimulationFrames[frameIndex];
      if (!frame) continue;

      if (frame.type === 'pop' && frame.node) {
        const node = nodes.find((candidate) => candidate.id === frame.node);
        if (
          node &&
          hasCoordinates(node) &&
          !graphSimulationMarkersRef.current.has(node.id)
        ) {
          const marker = new google.maps.Marker({
            map,
            position: { lat: node.lat, lng: node.lng },
            title: `Visited: ${node.name}`,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: '#8BAE52',
              fillOpacity: 1,
              strokeColor: '#E8E6DF',
              strokeWeight: 2,
            },
            zIndex: 19,
          });
          graphSimulationMarkersRef.current.set(node.id, marker);
        }
      }

      if (frame.type === 'relax' && frame.edgeId) {
        const edge = edges.find((candidate) => candidate.id === frame.edgeId);
        const fromNode = nodes.find((candidate) => candidate.id === edge?.from);
        const toNode = nodes.find((candidate) => candidate.id === edge?.to);
        if (
          edge &&
          hasCoordinates(fromNode) &&
          hasCoordinates(toNode) &&
          !graphSimulationPolylinesRef.current.has(edge.id)
        ) {
          const polyline = new google.maps.Polyline({
            map,
            path: [
              { lat: fromNode.lat, lng: fromNode.lng },
              { lat: toNode.lat, lng: toNode.lng },
            ],
            strokeColor: '#8BAE52',
            strokeOpacity: 0.8,
            strokeWeight: 4,
            zIndex: 17,
          });
          graphSimulationPolylinesRef.current.set(edge.id, polyline);
        }
      }
      graphSimulationLastFrameIndexRef.current = frameIndex;
    }
  }, [
    simulationMode,
    graphSimulationFrames,
    simulationStepIndex,
    simulationRunId,
    nodes,
    edges,
    mapStatus,
  ]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (
      simulationMode !== 'graph' ||
      !showSimulationPath ||
      mapStatus !== 'ready' ||
      !map ||
      !graphFinalPathEdgeIds.length
    ) {
      return;
    }

    const finalEdges = new Set(graphFinalPathEdgeIds);
    graphFinalPathEdgeIds.forEach((edgeId) => {
      if (graphSimulationPolylinesRef.current.has(edgeId)) return;
      const edge = edges.find((candidate) => candidate.id === edgeId);
      const fromNode = nodes.find((candidate) => candidate.id === edge?.from);
      const toNode = nodes.find((candidate) => candidate.id === edge?.to);
      if (!edge || !hasCoordinates(fromNode) || !hasCoordinates(toNode)) return;

      const polyline = new google.maps.Polyline({
        map,
        path: [
          { lat: fromNode.lat, lng: fromNode.lng },
          { lat: toNode.lat, lng: toNode.lng },
        ],
        zIndex: 18,
      });
      graphSimulationPolylinesRef.current.set(edgeId, polyline);
    });

    graphSimulationPolylinesRef.current.forEach((polyline, edgeId) => {
      polyline.setOptions(
        finalEdges.has(edgeId)
          ? { strokeColor: '#8BAE52', strokeOpacity: 1, strokeWeight: 6, zIndex: 24 }
          : { strokeColor: '#789747', strokeOpacity: 0.24, strokeWeight: 3, zIndex: 16 }
      );
    });
  }, [
    simulationMode,
    showSimulationPath,
    graphFinalPathEdgeIds,
    edges,
    nodes,
    mapStatus,
  ]);

  useEffect(() => {
    if (!directionsRequest) return;
    if (mapStatus === 'error') {
      directionsErrorRef.current?.(
        'Google Maps could not be loaded.',
        directionsRequest.intent
      );
      return;
    }

    const routes = routesLibraryRef.current;
    const map = mapInstanceRef.current;
    if (mapStatus !== 'ready' || !routes || !map) return;

    let cancelled = false;
    directionsRequestIdRef.current = directionsRequest.id;
    clearRoutePolylines(routePolylinesRef.current);
    simulationPolylineRef.current?.setMap(null);
    simulationPolylineRef.current = null;
    simulationMarkerRef.current?.setMap(null);
    simulationMarkerRef.current = null;

    routes.Route.computeRoutes({
        origin: directionsRequest.origin,
        destination: directionsRequest.destination,
        intermediates: directionsRequest.waypoints,
        optimizeWaypointOrder: directionsRequest.optimizeWaypoints,
        travelMode: 'DRIVING',
        units: google.maps.UnitSystem.METRIC,
        fields: [
          'distanceMeters',
          'durationMillis',
          'path',
          'viewport',
          'optimizedIntermediateWaypointIndices',
        ],
      })
      .then(({ routes: results }) => {
        if (
          cancelled ||
          directionsRequestIdRef.current !== directionsRequest.id
        ) {
          return;
        }

        const route = results?.[0];
        const distanceMeters = route?.distanceMeters;
        const durationMillis = route?.durationMillis;
        const path = route?.path;
        if (
          !route ||
          !path ||
          path.length === 0 ||
          !Number.isFinite(distanceMeters) ||
          !Number.isFinite(durationMillis) ||
          !distanceMeters ||
          !durationMillis
        ) {
          throw new Error('Google Maps did not return a driving route.');
        }

        const routePath = path.map(({ lat, lng }) => ({ lat, lng }));
        if (directionsRequest.intent === 'find') {
          const polyline = new google.maps.Polyline({
            path: routePath,
            map,
            strokeColor: '#8BAE52',
            strokeOpacity: 0.95,
            strokeWeight: 7,
            zIndex: 24,
          });
          routePolylinesRef.current.push(polyline);
        }

        if (route.viewport) {
          map.fitBounds(route.viewport, 60);
        }

        const waypointOrder = route.optimizedIntermediateWaypointIndices;
        const orderedNames =
          directionsRequest.optimizeWaypoints &&
          waypointOrder?.length === directionsRequest.waypointNames.length
            ? waypointOrder.map(
                (index) => directionsRequest.waypointNames[index]
              )
            : directionsRequest.waypointNames;

        directionsResultRef.current?.({
          distanceKm: distanceMeters / 1000,
          timeMin: durationMillis / 60000,
          stops: [
            directionsRequest.originName,
            ...orderedNames,
            directionsRequest.destinationName,
          ],
        }, routePath, directionsRequest.intent);
      })
      .catch((error: unknown) => {
        if (
          cancelled ||
          directionsRequestIdRef.current !== directionsRequest.id
        ) {
          return;
        }
        clearRoutePolylines(routePolylinesRef.current);
        const message =
          error instanceof Error ? error.message : 'Unknown Directions error.';
        directionsErrorRef.current?.(message, directionsRequest.intent);
      });

    return () => {
      cancelled = true;
    };
  }, [directionsRequest, mapStatus]);

  return (
    <div className="relative flex-none md:flex-1 h-[42vh] min-h-[280px] md:h-[calc(100vh-5.5rem)] min-w-0 my-3 mr-3 md:my-4 md:mr-5 rounded-3xl overflow-hidden shadow-soft-xl border border-white/80 bg-[#151515]">
      <div ref={mapContainerRef} className="google-map-container" />

      {mapStatus === 'loading' && (
        <div className="absolute bottom-4 left-4 z-[1000] rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-ink-700 shadow-soft-lg">
          Loading Google Maps…
        </div>
      )}
      {mapStatus === 'error' && (
        <div
          role="alert"
          className="absolute inset-0 z-[1100] flex items-center justify-center bg-white/90 p-6 text-center backdrop-blur-sm"
        >
          <div className="max-w-md rounded-2xl border border-rose-100 bg-white p-5 shadow-soft-xl">
            <div className="mb-2 flex items-center justify-center gap-2 font-extrabold text-rose-700">
              <MapPin className="h-4 w-4" />
              Map unavailable
            </div>
            <p className="text-xs leading-relaxed text-ink-700">{mapError}</p>
            <p className="mt-2 text-[11px] text-ink-500">
              Route planning remains available from the location selectors.
            </p>
          </div>
        </div>
      )}

      <div className="absolute right-3 top-3 z-[1000] max-h-[calc(100%-1.5rem)] w-56 overflow-y-auto rounded-2xl border border-white/90 bg-white/90 p-3 text-xs shadow-soft-lg backdrop-blur-xl sm:right-4 sm:top-4">
        <div className="flex items-center gap-1.5 border-b border-ink-100 pb-2 font-bold text-ink-900">
          <Layers className="h-3.5 w-3.5 text-purple-700" />
          <span>Route & Locations</span>
        </div>

        <div className="space-y-2 py-2">
          <div className="font-bold text-[10px] uppercase tracking-wider text-ink-400">
            Click map to pick
          </div>
          <div className="grid grid-cols-2 gap-1">
            {(['start', 'destination'] as const).map((target) => (
              <button
                key={target}
                type="button"
                onClick={() => onSelectionTargetChange?.(target)}
                aria-pressed={selectionTarget === target}
                className={`rounded-lg px-2 py-1.5 text-[10px] font-bold transition ${
                  selectionTarget === target
                    ? 'bg-purple-100 text-purple-900 ring-1 ring-purple-300'
                    : 'bg-ink-50 text-ink-600 hover:bg-purple-50'
                }`}
              >
                {target === 'start' ? 'Start' : 'Destination'}
              </button>
            ))}
          </div>
          <p className="text-[10px] leading-relaxed text-ink-500">
            Map clicks select a nearby PathScope location. Routes follow Google
            Maps driving directions.
          </p>
        </div>

        <div className="space-y-1.5 border-t border-ink-100 pt-2 font-medium text-ink-700">
          {[
            { label: 'Locations', value: showNodes, change: setShowNodes },
            { label: 'Place Labels', value: showLabels, change: setShowLabels },
          ].map(({ label, value, change }) => (
            <label
              key={label}
              className="flex cursor-pointer items-center justify-between gap-3 hover:text-ink-900"
            >
              <span>{label}</span>
              <input
                type="checkbox"
                checked={value}
                onChange={(event) => change(event.target.checked)}
                className="cursor-pointer rounded accent-purple-600"
              />
            </label>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedNode && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={springSoft}
            className="absolute bottom-4 left-4 z-[1000] max-h-[45%] w-[min(22rem,calc(100%-2rem))] space-y-3 overflow-y-auto rounded-2xl border border-white/90 bg-white/95 p-4 text-xs shadow-soft-xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-ink-100 pb-2">
              <div>
                <div className="text-sm font-extrabold text-ink-900">
                  {selectedNode.name}
                </div>
                <span className="font-mono text-[10px] font-bold text-purple-700">
                  ID: {selectedNode.id} · Region: {selectedNode.region}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                aria-label="Close location details"
                className="cursor-pointer rounded-full p-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-xl border border-ink-100 bg-ink-50/80 p-2.5 font-mono text-[11px]">
              <div>
                <span className="block font-sans text-[10px] font-bold uppercase text-ink-400">
                  Latitude
                </span>
                <span className="font-semibold text-ink-800">
                  {selectedNode.lat ?? 'Unavailable'}
                </span>
              </div>
              <div>
                <span className="block font-sans text-[10px] font-bold uppercase text-ink-400">
                  Longitude
                </span>
                <span className="font-semibold text-ink-800">
                  {selectedNode.lng ?? 'Unavailable'}
                </span>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-ink-800">
                <Navigation2 className="h-3.5 w-3.5 text-purple-700" />
                <span>Connected Roads</span>
              </div>
              <div className="max-h-36 space-y-1.5 overflow-y-auto">
                {edges
                  .filter(
                    (edge) =>
                      edge.from === selectedNode.id ||
                      edge.to === selectedNode.id
                  )
                  .map((edge) => {
                    const otherId =
                      edge.from === selectedNode.id ? edge.to : edge.from;
                    const otherNode = nodes.find((node) => node.id === otherId);
                    return (
                      <div
                        key={edge.id}
                        className="flex items-center justify-between rounded-xl border border-ink-100/80 bg-[#FAF8FE] p-2 text-[11px]"
                      >
                        <span className="max-w-[130px] truncate font-medium text-ink-800">
                          {otherNode?.name ?? otherId}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-purple-900">
                          {edge.distanceKm} km · {edge.speedKmph} km/h
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

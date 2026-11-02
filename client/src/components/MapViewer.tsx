import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation2,
  X,
} from 'lucide-react';
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
  theme: 'dark' | 'light';
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
  travelVehicle?: 'car' | 'bike' | 'foot';
  selectionTarget?: MapSelectionTarget;
  onSelectionTargetChange?: (target: MapSelectionTarget) => void;
  onNodeClick?: (node: NodeItem) => void;
  onMapClick?: (lat: number, lng: number) => void;
  isPanelOpen?: boolean;
  onTogglePanel?: () => void;
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

const MAJOR_HUB_IDS = new Set([
  'DEL', 'MUM', 'BLR', 'KOL', 'CHE', 'HYD', 'AMD', 'JAI', 'LKO', 'PAT', 'BPL', 'GHY', 'SNG'
]);

export type TravelVehicle = 'car' | 'bike' | 'foot';

const HOME_DEST_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
  <defs>
    <filter id="dest-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>
  <circle cx="18" cy="18" r="15" fill="#0F172A" stroke="#FFFFFF" stroke-width="2.5" filter="url(#dest-shadow)"/>
  <path d="M12 19 L18 13 L24 19 V24 A1 1 0 0 1 23 25 H13 A1 1 0 0 1 12 24 Z" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16 25 V20 H20 V25" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

function computeBearing(
  from: google.maps.LatLngLiteral,
  to: google.maps.LatLngLiteral
): number {
  if (from.lat === to.lat && from.lng === to.lng) return 0;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const heading = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((heading + 360) % 360);
}

function getCarSvg(heading: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <g transform="rotate(${heading} 24 24)">
      <!-- Soft ground drop shadow -->
      <rect x="13" y="6" width="22" height="36" rx="9" fill="rgba(0, 0, 0, 0.3)" filter="blur(2px)"/>

      <!-- 4 Tires (Front-L, Front-R, Rear-L, Rear-R) -->
      <rect x="11.5" y="9.5" width="3.5" height="7.5" rx="1.5" fill="#0F172A"/>
      <rect x="33" y="9.5" width="3.5" height="7.5" rx="1.5" fill="#0F172A"/>
      <rect x="11.5" y="31" width="3.5" height="7.5" rx="1.5" fill="#0F172A"/>
      <rect x="33" y="31" width="3.5" height="7.5" rx="1.5" fill="#0F172A"/>

      <!-- Car Main Body (Sapphire Metallic Modern Car) -->
      <path d="M15 13 C15 7, 33 7, 33 13 L33 35 C33 41, 15 41, 15 35 Z" fill="#2563EB" stroke="#1D4ED8" stroke-width="0.8"/>

      <!-- Front Hood & Headlights -->
      <path d="M15.5 10 C17.5 7.5, 30.5 7.5, 32.5 10 L32.5 14 L15.5 14 Z" fill="#3B82F6"/>
      <!-- LED Headlights -->
      <polygon points="16,8 19,8 18.5,10.5 16,10.5" fill="#FEF08A"/>
      <polygon points="32,8 29,8 29.5,10.5 32,10.5" fill="#FEF08A"/>

      <!-- Side Mirrors -->
      <path d="M12 16 C12 14.5, 14.5 15, 15 16 Z" fill="#1D4ED8"/>
      <path d="M36 16 C36 14.5, 33.5 15, 33 16 Z" fill="#1D4ED8"/>

      <!-- Front Windshield -->
      <path d="M17 15 L31 15 L29.5 20.5 L18.5 20.5 Z" fill="#0F172A" opacity="0.88"/>
      <path d="M18.5 16.5 L22.5 19.5" stroke="#FFFFFF" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>

      <!-- Car Roof & Sunroof -->
      <rect x="17.5" y="21" width="13" height="10" rx="1" fill="#1E40AF"/>
      <rect x="19" y="22.5" width="10" height="6.5" rx="1.5" fill="#0F172A" opacity="0.7"/>

      <!-- Rear Windshield -->
      <path d="M18.5 31.5 L29.5 31.5 L31 35 L17 35 Z" fill="#0F172A" opacity="0.88"/>

      <!-- Rear Red Taillights -->
      <rect x="16" y="38" width="4.5" height="2" rx="0.5" fill="#EF4444"/>
      <rect x="27.5" y="38" width="4.5" height="2" rx="0.5" fill="#EF4444"/>
    </g>
  </svg>`;
}

function getBikeSvg(heading: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <g transform="rotate(${heading} 24 24)">
      <!-- Soft ground drop shadow -->
      <ellipse cx="24" cy="25" rx="7" ry="18" fill="rgba(0, 0, 0, 0.3)" filter="blur(2px)"/>

      <!-- Rear Tire & Swingarm -->
      <rect x="22" y="36" width="4" height="8" rx="2" fill="#0F172A"/>

      <!-- Chrome Exhaust Pipe on right side -->
      <rect x="27.5" y="30" width="2" height="9" rx="1" fill="#64748B"/>
      <circle cx="28.5" cy="39" r="0.8" fill="#1E293B"/>

      <!-- Motorcycle Tapered Rear Tail Cowl (Personal Sportbike - No cargo box!) -->
      <path d="M21 29 L27 29 L25.5 37 L22.5 37 Z" fill="#E11D48" stroke="#BE123C" stroke-width="0.8"/>
      <!-- Rear Red Brake Light -->
      <rect x="22.5" y="37" width="3" height="1.5" rx="0.5" fill="#EF4444"/>

      <!-- Front Tire -->
      <rect x="22.5" y="4" width="3" height="8" rx="1.5" fill="#0F172A"/>

      <!-- Front Mudguard & Fairing (Crimson Sportbike) -->
      <path d="M21.5 8 C21.5 5.5, 26.5 5.5, 26.5 8 L27 13 L21 13 Z" fill="#E11D48"/>
      <!-- Dual Aerodynamic Headlights -->
      <polygon points="22,6.5 23.5,6.5 23.5,8 22,8.5" fill="#FEF08A"/>
      <polygon points="26,6.5 24.5,6.5 24.5,8 26,8.5" fill="#FEF08A"/>

      <!-- Clip-on Handlebars with grips & side mirrors -->
      <path d="M15 13 L33 13" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="14" cy="12" r="1.5" fill="#334155"/>
      <circle cx="34" cy="12" r="1.5" fill="#334155"/>

      <!-- Sportbike Sculpted Fuel Tank -->
      <path d="M20.5 14 Q19.5 20, 20.5 23 L27.5 23 Q28.5 20, 27.5 14 Z" fill="#F43F5E" stroke="#BE123C" stroke-width="0.8"/>
      <!-- Fuel Tank Cap -->
      <circle cx="24" cy="16.5" r="1.2" fill="#0F172A"/>

      <!-- Rider Arms in Riding Position holding handlebars -->
      <path d="M19.5 23 Q16.5 18, 16 13.5" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M28.5 23 Q31.5 18, 32 13.5" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>
      <!-- Rider Gloves on Grips -->
      <circle cx="16" cy="13.2" r="1.6" fill="#E11D48"/>
      <circle cx="32" cy="13.2" r="1.6" fill="#E11D48"/>

      <!-- Rider Shoulders / Riding Jacket -->
      <ellipse cx="24" cy="23.5" rx="5.5" ry="4" fill="#0F172A"/>

      <!-- Rider Sport Helmet (Dark Graphite with Racing Stripe) -->
      <circle cx="24" cy="19.5" r="4.8" fill="#1E293B" stroke="#0F172A" stroke-width="0.8"/>
      <!-- Helmet Visor -->
      <path d="M20.5 18 Q24 16, 27.5 18" stroke="#38BDF8" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <!-- Helmet Racing Stripe -->
      <line x1="24" y1="15.5" x2="24" y2="23.5" stroke="#E11D48" stroke-width="1.2"/>
    </g>
  </svg>`;
}

function getFootSvg(heading: number, stepIndex: number): string {
  const phase = stepIndex % 2 === 0;
  const leftFootY = phase ? 17 : 29;
  const rightFootY = phase ? 29 : 17;
  const leftHandY = phase ? 28 : 19;
  const rightHandY = phase ? 19 : 28;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <g transform="rotate(${heading} 24 24)">
      <!-- Ground soft drop shadow -->
      <ellipse cx="24" cy="26" rx="9" ry="12" fill="rgba(0, 0, 0, 0.28)" filter="blur(2px)"/>

      <!-- Feet / Walking Shoes (Sneakers) -->
      <rect x="18" y="${leftFootY}" width="3.5" height="7" rx="1.8" fill="#0F172A" stroke="#FFFFFF" stroke-width="0.5"/>
      <rect x="26.5" y="${rightFootY}" width="3.5" height="7" rx="1.8" fill="#0F172A" stroke="#FFFFFF" stroke-width="0.5"/>

      <!-- Swinging Arms (Left & Right) -->
      <path d="M19 24 Q17 25, 17 ${leftHandY}" stroke="#0284C7" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="17" cy="${leftHandY}" r="1.8" fill="#FBBF24"/>

      <path d="M29 24 Q31 25, 31 ${rightHandY}" stroke="#0284C7" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="31" cy="${rightHandY}" r="1.8" fill="#FBBF24"/>

      <!-- Torso / Shoulders (Sky Blue Shirt) -->
      <ellipse cx="24" cy="24" rx="7" ry="4.5" fill="#0284C7" stroke="#0369A1" stroke-width="0.8"/>

      <!-- Neck / Collar -->
      <circle cx="24" cy="22" r="2.5" fill="#FBBF24"/>

      <!-- Head with Hair (Top-Down View) -->
      <circle cx="24" cy="21.5" r="4.8" fill="#1E293B"/>
      <path d="M20.5 19.5 C20.5 17, 27.5 17, 27.5 19.5 Z" fill="#0F172A"/>
      <!-- Cap brim pointing forward in direction of walk -->
      <path d="M21 18 Q24 15.5, 27 18" stroke="#0284C7" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    </g>
  </svg>`;
}

function getVehicleSvg(
  vehicle: TravelVehicle = 'car',
  heading: number = 0,
  stepIndex: number = 0
): string {
  if (vehicle === 'bike') {
    return getBikeSvg(heading);
  }
  if (vehicle === 'foot') {
    return getFootSvg(heading, stepIndex);
  }
  return getCarSvg(heading);
}

const darkMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0d0d0d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#A6A6A6' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d0d0d' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ visibility: 'off' }],
  },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#141414' }] },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#1b221a' }],
  },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#181818' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1e291d' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#4a4a4a' }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#383838' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#6e6e6e' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#b8b8b8' }] },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#2a2a2a' }, { weight: 1 }],
  },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
];

const lightMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#f1f2ec' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#596153' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f8f8f4' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ visibility: 'off' }],
  },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f1f2ec' }] },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#e8ede1' }],
  },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#ecefe8' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dfe9d8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#fdfcf8' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#eee6d4' }] },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#d5c9ad' }, { weight: 1 }],
  },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dce8e8' }] },
];

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

function MapViewer({
  theme,
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
  travelVehicle = 'car',
  selectionTarget = 'start',
  onSelectionTargetChange,
  onNodeClick,
  onMapClick,
  isPanelOpen = true,
  onTogglePanel,
}: MapViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const routesLibraryRef = useRef<google.maps.RoutesLibrary | null>(null);
  const nodeMarkersRef = useRef<google.maps.Marker[]>([]);
  const routePolylinesRef = useRef<google.maps.Polyline[]>([]);
  const simulationMarkerRef = useRef<google.maps.Marker | null>(null);
  const simulationPolylineRef = useRef<google.maps.Polyline | null>(null);
  const simulationHaloPolylineRef = useRef<google.maps.Polyline | null>(null);
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
  const lastHeadingRef = useRef(0);
  const lastAppliedHeadingRef = useRef<number | null>(null);
  const lastAppliedVehicleRef = useRef<string | null>(null);
  const lastPanTimeRef = useRef<number>(0);
  const hasZoomedForSimulationRef = useRef(false);

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const edgeMap = useMemo(() => new Map(edges.map((e) => [e.id, e])), [edges]);

  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [mapError, setMapError] = useState('');
  const [showNodes, setShowNodes] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [isRouteLocationsOpen, setIsRouteLocationsOpen] = useState(true);
  const [isRouteLocationsCollapsed, setIsRouteLocationsCollapsed] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(5);
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
        mapContainerRef.current.innerHTML = '';

        const map = new maps.Map(mapContainerRef.current, {
          center: { lat: 21.7679, lng: 78.8718 },
          zoom: 5,
          minZoom: 4,
          maxZoom: 20,
          mapTypeId: 'roadmap',
          styles: theme === 'light' ? lightMapStyles : darkMapStyles,
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
        map.addListener('zoom_changed', () => {
          const z = map.getZoom();
          if (typeof z === 'number') {
            setCurrentZoom(z);
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
      simulationHaloPolylineRef.current?.setMap(null);
      simulationHaloPolylineRef.current = null;
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
    if (mapStatus !== 'ready' || !map) return;
    map.setOptions({ styles: theme === 'light' ? lightMapStyles : darkMapStyles });
  }, [mapStatus, theme]);

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
      const isMajorHub = MAJOR_HUB_IDS.has(node.id);

      const color = isStart
        ? '#10B981'
        : isDestination
          ? '#F43F5E'
          : isSelected
            ? '#8B5CF6'
            : '#64748B';

      let labelConfig: google.maps.MarkerLabel | undefined;
      if (isStart) {
        labelConfig = {
          text: `Start: ${node.name}`,
          className: 'google-map-node-label-start',
        };
      } else if (isDestination) {
        labelConfig = {
          text: `Dest: ${node.name}`,
          className: 'google-map-node-label-dest',
        };
      } else if (isSelected) {
        labelConfig = {
          text: node.name,
          className: 'google-map-node-label-selected',
        };
      } else if (showLabels) {
        if (currentZoom >= 8 || isMajorHub) {
          labelConfig = {
            text: node.name,
            className: 'google-map-node-label',
          };
        }
      }

      let markerIcon: google.maps.Icon | google.maps.Symbol = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: isStart || isDestination ? 9 : isSelected ? 8 : (currentZoom >= 7 ? 6 : 4.5),
        fillColor: color,
        fillOpacity: isStart || isDestination || isSelected ? 1 : 0.8,
        strokeColor: '#FFFFFF',
        strokeWeight: isStart || isDestination || isSelected ? 2.5 : 1.5,
        labelOrigin: new google.maps.Point(0, -20),
      };

      if (isDestination) {
        markerIcon = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(HOME_DEST_SVG),
          scaledSize: new google.maps.Size(34, 34),
          anchor: new google.maps.Point(17, 17),
          labelOrigin: new google.maps.Point(17, -12),
        };
      }

      const marker = new google.maps.Marker({
        map,
        position: { lat: node.lat, lng: node.lng },
        title: `${node.name} (${node.region})`,
        icon: markerIcon,
        label: labelConfig,
        zIndex: isStart || isDestination ? 100 : isSelected ? 90 : (isMajorHub ? 20 : 10),
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
    currentZoom,
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
    simulationHaloPolylineRef.current?.setMap(null);
    simulationHaloPolylineRef.current = null;
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
    lastHeadingRef.current = 0;
    lastAppliedHeadingRef.current = null;
    lastAppliedVehicleRef.current = null;
    lastPanTimeRef.current = 0;
    hasZoomedForSimulationRef.current = false;
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
      simulationHaloPolylineRef.current = new google.maps.Polyline({
        path: [],
        map,
        strokeColor: '#16A34A',
        strokeOpacity: 0.35,
        strokeWeight: 10,
        zIndex: 17,
      });
      simulationPolylineRef.current = new google.maps.Polyline({
        path: [],
        map,
        strokeColor: '#22C55E',
        strokeOpacity: 1,
        strokeWeight: 4.5,
        zIndex: 18,
      });
    }

    const revealedPath = simulationPolylineRef.current.getPath();
    const revealedHaloPath = simulationHaloPolylineRef.current?.getPath();
    for (
      let pathIndex = simulationLastPathIndexRef.current + 1;
      pathIndex <= sample.pathIndex;
      pathIndex += 1
    ) {
      const point = simulationPath[pathIndex];
      if (point) {
        const latLng = new google.maps.LatLng(point);
        revealedPath.push(latLng);
        revealedHaloPath?.push(latLng);
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
      const samplePoint = new google.maps.LatLng(sample.point);
      revealedPath.push(samplePoint);
      revealedHaloPath?.push(samplePoint);
      simulationLastPointRef.current = sample.point;
    }

    // Compute heading / bearing along the road geometry for realistic scooter orientation
    const currentIndex = Math.min(
      simulationStepIndex,
      simulationSamples.length - 1
    );
    let heading = lastHeadingRef.current;
    if (currentIndex < simulationSamples.length - 1) {
      const nextSample = simulationSamples[currentIndex + 1];
      if (
        nextSample.point.lat !== sample.point.lat ||
        nextSample.point.lng !== sample.point.lng
      ) {
        heading = computeBearing(sample.point, nextSample.point);
        lastHeadingRef.current = heading;
      }
    } else if (currentIndex > 0) {
      const prevSample = simulationSamples[currentIndex - 1];
      if (
        prevSample.point.lat !== sample.point.lat ||
        prevSample.point.lng !== sample.point.lng
      ) {
        heading = computeBearing(prevSample.point, sample.point);
        lastHeadingRef.current = heading;
      }
    }

    const vehicleTitle =
      travelVehicle === 'bike'
        ? 'Personal Motorbike'
        : travelVehicle === 'foot'
          ? 'Walking Person'
          : 'Car';

    // Only regenerate and upload marker icon if heading changed by >= 6° or vehicle changed
    const headingDelta =
      lastAppliedHeadingRef.current === null
        ? 360
        : Math.abs(heading - lastAppliedHeadingRef.current);
    const vehicleChanged = lastAppliedVehicleRef.current !== travelVehicle;
    const shouldUpdateIcon =
      !simulationMarkerRef.current ||
      vehicleChanged ||
      (travelVehicle === 'foot' ? currentIndex % 4 === 0 : headingDelta >= 6);

    let vehicleMarkerIcon: google.maps.Icon | null = null;
    if (shouldUpdateIcon) {
      const vehicleSvg = getVehicleSvg(travelVehicle, heading, currentIndex);
      const vehicleIconUrl =
        'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(vehicleSvg);
      vehicleMarkerIcon = {
        url: vehicleIconUrl,
        scaledSize: new google.maps.Size(46, 46),
        anchor: new google.maps.Point(23, 23),
      };
      lastAppliedHeadingRef.current = heading;
      lastAppliedVehicleRef.current = travelVehicle;
    }

    if (!simulationMarkerRef.current) {
      simulationMarkerRef.current = new google.maps.Marker({
        map,
        position: sample.point,
        title: vehicleTitle,
        icon: vehicleMarkerIcon!,
        zIndex: 60,
      });
    } else {
      simulationMarkerRef.current.setPosition(sample.point);
      if (vehicleMarkerIcon) {
        simulationMarkerRef.current.setIcon(vehicleMarkerIcon);
      }
      simulationMarkerRef.current.setTitle(vehicleTitle);
    }

    // Camera follow mode: smoothly center and track vehicle without thrashing Google Maps animations
    if (!hasZoomedForSimulationRef.current || simulationStepIndex === 0) {
      if (simulationPath.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        simulationPath.forEach((pt) => bounds.extend(pt));
        map.fitBounds(bounds, 70);
      } else {
        map.setCenter(sample.point);
        map.setZoom(12);
      }
      hasZoomedForSimulationRef.current = true;
      lastPanTimeRef.current = performance.now();
    } else {
      // Only pan if vehicle moves outside the visible viewport, throttled to at most once per 1200ms
      const now = performance.now();
      if (now - lastPanTimeRef.current > 1200) {
        const bounds = map.getBounds();
        if (bounds && !bounds.contains(sample.point)) {
          map.panTo(sample.point);
          lastPanTimeRef.current = now;
        }
      }
    }
  }, [
    simulationMode,
    simulationPath,
    simulationSamples,
    simulationStepIndex,
    simulationRunId,
    showSimulationPath,
    travelVehicle,
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
    simulationHaloPolylineRef.current?.setPath(simulationPath);
    
    // Park vehicle at destination with "Arrived" label
    const finalHeading = lastHeadingRef.current;
    const vehicleSvg = getVehicleSvg(travelVehicle, finalHeading, 0);
    const vehicleIconUrl =
      'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(vehicleSvg);
    const vehicleMarkerIcon: google.maps.Icon = {
      url: vehicleIconUrl,
      scaledSize: new google.maps.Size(46, 46),
      anchor: new google.maps.Point(23, 23),
      labelOrigin: new google.maps.Point(23, -12),
    };
    if (simulationMarkerRef.current && simulationPath.length > 0) {
      const lastPoint = simulationPath[simulationPath.length - 1];
      simulationMarkerRef.current.setPosition(lastPoint);
      simulationMarkerRef.current.setIcon(vehicleMarkerIcon);
      simulationMarkerRef.current.setLabel({
        text: '🏁 Arrived',
        className: 'google-map-vehicle-label',
      });
      simulationMarkerRef.current.setTitle(
        `Arrived at Destination (${travelVehicle.toUpperCase()})`
      );
    }

    const startedAt = performance.now();
    const initialColor = [22, 163, 74];
    const finalColor = [34, 197, 94];
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
        strokeWeight: 4.5 + eased * 0.8,
      });
      simulationHaloPolylineRef.current?.setOptions({
        strokeColor: '#16A34A',
        strokeOpacity: 0.35 + 0.08 * eased,
        strokeWeight: 10 + eased,
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

    // After arrival, reveal the full route overview after 1.4 seconds
    const overviewTimer = setTimeout(() => {
      if (simulationPath.length > 0 && mapInstanceRef.current) {
        const bounds = new google.maps.LatLngBounds();
        simulationPath.forEach((pt) => bounds.extend(pt));
        mapInstanceRef.current.fitBounds(bounds, 60);
      }
    }, 1400);

    return () => {
      clearTimeout(overviewTimer);
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
    travelVehicle,
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
        const node = nodeMap.get(frame.node);
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
        const edge = edgeMap.get(frame.edgeId);
        const fromNode = edge ? nodeMap.get(edge.from) : undefined;
        const toNode = edge ? nodeMap.get(edge.to) : undefined;
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
          ? { strokeColor: '#A6CA5F', strokeOpacity: 1, strokeWeight: 5, zIndex: 24 }
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
    if (mapStatus !== 'ready' || !map) return;

    let cancelled = false;
    directionsRequestIdRef.current = directionsRequest.id;
    clearRoutePolylines(routePolylinesRef.current);
    simulationPolylineRef.current?.setMap(null);
    simulationPolylineRef.current = null;
    simulationHaloPolylineRef.current?.setMap(null);
    simulationHaloPolylineRef.current = null;
    simulationMarkerRef.current?.setMap(null);
    simulationMarkerRef.current = null;

    const runWithDirectionsService = () => {
      try {
        const ds = new google.maps.DirectionsService();
        ds.route(
          {
            origin: directionsRequest.origin,
            destination: directionsRequest.destination,
            waypoints: directionsRequest.waypoints.map((w) => ({
              location: w.location,
              stopover: true,
            })),
            optimizeWaypoints: directionsRequest.optimizeWaypoints,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
          },
          (result, status) => {
            if (
              cancelled ||
              directionsRequestIdRef.current !== directionsRequest.id
            ) {
              return;
            }

            if (status === google.maps.DirectionsStatus.OK && result?.routes?.[0]) {
              const route = result.routes[0];
              let totalDistMeters = 0;
              let totalDurationSec = 0;
              route.legs?.forEach((leg) => {
                totalDistMeters += leg.distance?.value || 0;
                totalDurationSec += leg.duration?.value || 0;
              });

              const routePath = (route.overview_path || []).map((latLng) => ({
                lat: latLng.lat(),
                lng: latLng.lng(),
              }));

              if (directionsRequest.intent === 'find') {
                const haloPolyline = new google.maps.Polyline({
                  path: routePath,
                  map,
                  strokeColor: '#16A34A',
                  strokeOpacity: 0.35,
                  strokeWeight: 10,
                  zIndex: 23,
                });
                const polyline = new google.maps.Polyline({
                  path: routePath,
                  map,
                  strokeColor: '#22C55E',
                  strokeOpacity: 1,
                  strokeWeight: 4.5,
                  zIndex: 24,
                });
                routePolylinesRef.current.push(haloPolyline);
                routePolylinesRef.current.push(polyline);
              }

              if (route.bounds) {
                map.fitBounds(route.bounds, 60);
              }

              const waypointOrder = route.waypoint_order;
              const orderedNames =
                directionsRequest.optimizeWaypoints &&
                waypointOrder?.length === directionsRequest.waypointNames.length
                  ? waypointOrder.map(
                      (index) => directionsRequest.waypointNames[index]
                    )
                  : directionsRequest.waypointNames;

              directionsResultRef.current?.(
                {
                  distanceKm: totalDistMeters / 1000,
                  timeMin: totalDurationSec / 60,
                  stops: [
                    directionsRequest.originName,
                    ...orderedNames,
                    directionsRequest.destinationName,
                  ],
                },
                routePath,
                directionsRequest.intent
              );
              return;
            }

            clearRoutePolylines(routePolylinesRef.current);
            const message = `Directions failed: ${status}`;
            directionsErrorRef.current?.(message, directionsRequest.intent);
          }
        );
      } catch (err: unknown) {
        clearRoutePolylines(routePolylinesRef.current);
        const message =
          err instanceof Error ? err.message : 'Unknown Directions error.';
        directionsErrorRef.current?.(message, directionsRequest.intent);
      }
    };

    if (routes?.Route?.computeRoutes) {
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
          runWithDirectionsService();
          return;
        }

        const routePath = path.map(({ lat, lng }) => ({ lat, lng }));
        if (directionsRequest.intent === 'find') {
          const haloPolyline = new google.maps.Polyline({
            path: routePath,
            map,
            strokeColor: '#16A34A',
            strokeOpacity: 0.35,
            strokeWeight: 10,
            zIndex: 23,
          });
          const polyline = new google.maps.Polyline({
            path: routePath,
            map,
            strokeColor: '#22C55E',
            strokeOpacity: 1,
            strokeWeight: 4.5,
            zIndex: 24,
          });
          routePolylinesRef.current.push(haloPolyline);
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
      .catch(() => {
        runWithDirectionsService();
      });
    } else {
      runWithDirectionsService();
    }

    return () => {
      cancelled = true;
    };
  }, [directionsRequest, mapStatus]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        google.maps.event.trigger(mapInstanceRef.current, 'resize');
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [isPanelOpen]);

  return (
    <div
      className={`relative min-w-0 my-3 md:my-4 rounded-3xl overflow-hidden shadow-soft-xl border border-white/80 bg-[#151515] transition-all duration-300 ${
        isPanelOpen
          ? 'h-[42vh] min-h-[280px] md:h-[calc(100vh-5.5rem)] mr-3 md:mr-5 flex-none md:flex-1'
          : 'h-[calc(100vh-5.5rem)] mx-3 md:mx-5 w-[calc(100%-1.5rem)] md:w-[calc(100%-2.5rem)] flex-1'
      }`}
    >
      <div
        ref={mapContainerRef}
        className="google-map-container w-full h-full"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

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

      {/* Floating Route & Locations Selection Card / Toggle */}
      <AnimatePresence>
        {!isRouteLocationsOpen ? (
          <motion.button
            key="route-locations-pill"
            type="button"
            initial={{ opacity: 0, scale: 0.9, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -6 }}
            transition={springSoft}
            onClick={() => setIsRouteLocationsOpen(true)}
            className={`absolute right-3 top-3 z-[1000] sm:right-4 sm:top-4 flex items-center gap-2 px-3 py-2 rounded-2xl border text-xs font-bold shadow-xl backdrop-blur-2xl transition-all cursor-pointer active:scale-95 select-none ${
              theme === 'dark'
                ? 'bg-[#121215]/95 hover:bg-[#1A1A20] border-white/15 text-white shadow-2xl'
                : 'bg-white/95 hover:bg-slate-50 border-slate-200 text-slate-900 shadow-xl'
            }`}
            title="Show Route & Locations panel"
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                theme === 'dark'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
            </div>
            <span>Route & Locations</span>
            <Eye className="w-3.5 h-3.5 text-emerald-500" />
          </motion.button>
        ) : (
          <motion.div
            key="route-locations-card"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={springSoft}
            className={`absolute right-3 top-3 z-[1000] max-h-[calc(100%-1.5rem)] w-60 overflow-y-auto rounded-2xl border p-3.5 text-xs shadow-xl backdrop-blur-2xl transition-all sm:right-4 sm:top-4 select-none ${
              theme === 'dark'
                ? 'bg-[#121215]/95 border-white/15 text-white shadow-2xl'
                : 'bg-white/95 border-slate-200 text-slate-900 shadow-xl'
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-2 ${
                theme === 'dark' ? 'border-white/10' : 'border-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    theme === 'dark'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                </div>
                <span
                  className={`font-extrabold text-xs tracking-tight ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Route & Locations
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Collapse / Expand Card Body Button */}
                <button
                  type="button"
                  onClick={() => setIsRouteLocationsCollapsed((prev) => !prev)}
                  title={isRouteLocationsCollapsed ? 'Expand content' : 'Collapse content'}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    theme === 'dark'
                      ? 'text-neutral-400 hover:text-white hover:bg-white/10'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {isRouteLocationsCollapsed ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronUp className="h-3.5 w-3.5" />
                  )}
                </button>

                {/* Hide / Close Card Button */}
                <button
                  type="button"
                  onClick={() => setIsRouteLocationsOpen(false)}
                  title="Hide this panel"
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    theme === 'dark'
                      ? 'text-neutral-400 hover:text-white hover:bg-white/10'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Collapsible Content */}
            {!isRouteLocationsCollapsed && (
              <>
                <div className="space-y-2.5 py-2.5">
                  <div
                    className={`font-bold text-[10px] uppercase tracking-wider ${
                      theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'
                    }`}
                  >
                    Click map to pick
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['start', 'destination'] as const).map((target) => {
                      const isStart = target === 'start';
                      const isSelected = selectionTarget === target;

                      let activeClass = '';
                      if (isSelected) {
                        if (isStart) {
                          activeClass =
                            theme === 'dark'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm';
                        } else {
                          activeClass =
                            theme === 'dark'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-xs'
                              : 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm';
                        }
                      } else {
                        activeClass =
                          theme === 'dark'
                            ? 'bg-white/5 text-neutral-400 hover:text-white border-white/10 hover:bg-white/10'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-200/80';
                      }

                      return (
                        <button
                          key={target}
                          type="button"
                          onClick={() => onSelectionTargetChange?.(target)}
                          aria-pressed={isSelected}
                          className={`rounded-xl px-2.5 py-1.5 text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer select-none active:scale-95 ${activeClass}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isStart ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{isStart ? 'Start' : 'Destination'}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p
                    className={`text-[10.5px] leading-relaxed ${
                      theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'
                    }`}
                  >
                    Map clicks select a nearby MargDarshak highway location. Routes follow
                    Google Maps driving directions.
                  </p>
                </div>

                <div
                  className={`space-y-2 border-t pt-2.5 font-medium ${
                    theme === 'dark'
                      ? 'border-white/10 text-neutral-300'
                      : 'border-slate-100 text-slate-700'
                  }`}
                >
                  {[
                    { label: 'Locations', value: showNodes, change: setShowNodes },
                    { label: 'Place Labels', value: showLabels, change: setShowLabels },
                  ].map(({ label, value, change }) => (
                    <label
                      key={label}
                      className={`flex cursor-pointer items-center justify-between gap-3 text-xs font-semibold transition select-none ${
                        theme === 'dark' ? 'hover:text-white' : 'hover:text-slate-900'
                      }`}
                    >
                      <span>{label}</span>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(event) => change(event.target.checked)}
                        className="cursor-pointer rounded accent-emerald-600 w-4 h-4"
                      />
                    </label>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedNode && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={springSoft}
            className={`absolute bottom-4 left-4 z-[1000] max-h-[45%] w-[min(22rem,calc(100%-2rem))] space-y-3 overflow-y-auto rounded-2xl border p-4 text-xs shadow-2xl backdrop-blur-2xl ${
              theme === 'dark'
                ? 'bg-[#121215]/95 border-white/15 text-white'
                : 'bg-white/95 border-slate-200 text-slate-900'
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-2 ${
                theme === 'dark' ? 'border-white/10' : 'border-slate-100'
              }`}
            >
              <div>
                <div
                  className={`text-sm font-extrabold ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {selectedNode.name}
                </div>
                <span
                  className={`font-mono text-[10px] font-bold ${
                    theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                  }`}
                >
                  ID: {selectedNode.id} · Region: {selectedNode.region}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                aria-label="Close location details"
                className={`cursor-pointer rounded-full p-1 transition ${
                  theme === 'dark'
                    ? 'text-neutral-400 hover:bg-white/10 hover:text-white'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              className={`grid grid-cols-2 gap-2 rounded-xl border p-2.5 font-mono text-[11px] ${
                theme === 'dark'
                  ? 'border-white/10 bg-white/5'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div>
                <span
                  className={`block font-sans text-[10px] font-bold uppercase ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'
                  }`}
                >
                  Latitude
                </span>
                <span
                  className={`font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {selectedNode.lat ?? 'Unavailable'}
                </span>
              </div>
              <div>
                <span
                  className={`block font-sans text-[10px] font-bold uppercase ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'
                  }`}
                >
                  Longitude
                </span>
                <span
                  className={`font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {selectedNode.lng ?? 'Unavailable'}
                </span>
              </div>
            </div>

            <div>
              <div
                className={`mb-1.5 flex items-center gap-1.5 text-[11px] font-bold ${
                  theme === 'dark' ? 'text-neutral-300' : 'text-slate-700'
                }`}
              >
                <Navigation2 className="h-3.5 w-3.5 text-emerald-500" />
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
                        className={`flex items-center justify-between rounded-xl border p-2 text-[11px] ${
                          theme === 'dark'
                            ? 'border-white/10 bg-white/[0.04] text-neutral-200'
                            : 'border-slate-200 bg-slate-50 text-slate-800'
                        }`}
                      >
                        <span className="max-w-[130px] truncate font-medium">
                          {otherNode?.name ?? otherId}
                        </span>
                        <span
                          className={`font-mono text-[10px] font-bold ${
                            theme === 'dark'
                              ? 'text-emerald-400'
                              : 'text-emerald-600'
                          }`}
                        >
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

export default React.memo(MapViewer);

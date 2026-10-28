import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Eye, EyeOff, Mountain, Navigation2, X, ChevronRight } from 'lucide-react';

export default function MapViewer({
  nodes = [],
  edges = [],
  activePath = [],
  simulationStep = null,
  startNodeId,
  destNodeId,
  onNodeClick
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    edgesLayer: null,
    nodesLayer: null,
    labelsLayer: null,
    weightsLayer: null,
    pathLayer: null,
    simLayer: null
  });

  // Overlay layer visibility toggles
  const [showNodes, setShowNodes] = useState(true);
  const [showEdges, setShowEdges] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showWeights, setShowWeights] = useState(false);
  const [colorByRoadType, setColorByRoadType] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center between Chandigarh (30.73) and Mandi/Shimla (31.4)
    const map = L.map(mapContainerRef.current, {
      center: [31.2, 76.95],
      zoom: 9,
      minZoom: 8,
      maxZoom: 15,
      zoomControl: false
    });

    // Dark sleek CartoDB tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initialize layer groups
    layersRef.current.edgesLayer = L.layerGroup().addTo(map);
    layersRef.current.weightsLayer = L.layerGroup().addTo(map);
    layersRef.current.pathLayer = L.layerGroup().addTo(map);
    layersRef.current.simLayer = L.layerGroup().addTo(map);
    layersRef.current.nodesLayer = L.layerGroup().addTo(map);
    layersRef.current.labelsLayer = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render static edges and weight labels
  useEffect(() => {
    if (!mapInstanceRef.current || !layersRef.current.edgesLayer) return;

    const { edgesLayer, weightsLayer } = layersRef.current;
    edgesLayer.clearLayers();
    weightsLayer.clearLayers();

    if (!showEdges) return;

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    edges.forEach((edge) => {
      const u = nodeMap.get(edge.from);
      const v = nodeMap.get(edge.to);
      if (!u || !v) return;

      const latlngs = [
        [u.lat, u.lng],
        [v.lat, v.lng]
      ];

      // Highway vs Local road styling
      const isHighway = edge.roadType === 'highway';
      const isHill = edge.terrain === 'hill';

      let edgeColor = '#475569'; // default slate
      if (colorByRoadType) {
        if (isHighway) {
          edgeColor = isHill ? '#6366f1' : '#38bdf8'; // Indigo for hill highway, Sky for plain highway
        } else {
          edgeColor = isHill ? '#d97706' : '#14b8a6'; // Amber for hill local, Teal for plain local
        }
      }

      const polyline = L.polyline(latlngs, {
        color: edgeColor,
        weight: isHighway ? 3.5 : 2,
        opacity: 0.65,
        dashArray: isHighway ? null : '4, 4'
      });

      polyline.bindTooltip(
        `<b>${u.name} ↔ ${v.name}</b><br/>${edge.distanceKm} km · ${edge.speedKmph} km/h · ${edge.roadType} (${edge.terrain})`,
        { sticky: true, className: 'leaflet-tooltip-dark' }
      );

      polyline.addTo(edgesLayer);

      // Edge weight label at midpoint
      if (showWeights) {
        const midLat = (u.lat + v.lat) / 2;
        const midLng = (u.lng + v.lng) / 2;
        const weightIcon = L.divIcon({
          className: 'weight-label',
          html: `<div class="px-1 py-0.5 rounded bg-slate-900/90 text-[10px] font-mono text-slate-300 border border-slate-700 shadow">${edge.distanceKm}k</div>`,
          iconSize: [28, 16],
          iconAnchor: [14, 8]
        });
        L.marker([midLat, midLng], { icon: weightIcon, interactive: false }).addTo(weightsLayer);
      }
    });
  }, [nodes, edges, showEdges, showWeights, colorByRoadType]);

  // Render static nodes & labels
  useEffect(() => {
    if (!mapInstanceRef.current || !layersRef.current.nodesLayer) return;

    const { nodesLayer, labelsLayer } = layersRef.current;
    nodesLayer.clearLayers();
    labelsLayer.clearLayers();

    if (!showNodes) return;

    nodes.forEach((node) => {
      const isStart = node.id === startNodeId;
      const isDest = node.id === destNodeId;
      const isSelected = selectedNode && selectedNode.id === node.id;

      let pinColor = '#64748b'; // slate unvisited
      let radius = 6;

      if (isStart) {
        pinColor = '#10b981'; // emerald
        radius = 9;
      } else if (isDest) {
        pinColor = '#ef4444'; // red
        radius = 9;
      } else if (isSelected) {
        pinColor = '#f59e0b'; // amber
        radius = 8;
      }

      const marker = L.circleMarker([node.lat, node.lng], {
        radius,
        fillColor: pinColor,
        color: isStart || isDest ? '#ffffff' : '#0f172a',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      });

      marker.on('click', () => {
        setSelectedNode(node);
        if (onNodeClick) onNodeClick(node);
      });

      marker.addTo(nodesLayer);

      // Node label
      if (showLabels) {
        const labelIcon = L.divIcon({
          className: 'node-label',
          html: `<div class="text-[10px] whitespace-nowrap font-medium px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-800 ${
            isStart ? 'text-emerald-400 font-bold border-emerald-700' : isDest ? 'text-red-400 font-bold border-red-700' : 'text-slate-300'
          }">${node.name}</div>`,
          iconSize: [80, 20],
          iconAnchor: [-8, 10]
        });
        L.marker([node.lat, node.lng], { icon: labelIcon, interactive: false }).addTo(labelsLayer);
      }
    });
  }, [nodes, showNodes, showLabels, startNodeId, destNodeId, selectedNode]);

  // Render active route path
  useEffect(() => {
    if (!mapInstanceRef.current || !layersRef.current.pathLayer) return;

    const { pathLayer } = layersRef.current;
    pathLayer.clearLayers();

    if (!activePath || activePath.length < 2) return;

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const latlngs = [];

    activePath.forEach((id, index) => {
      const n = nodeMap.get(id);
      if (n) {
        latlngs.push([n.lat, n.lng]);

        // Place waypoint numbered badge on path
        const badgeIcon = L.divIcon({
          className: 'path-badge',
          html: `<div class="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center justify-center ring-2 ring-emerald-300 shadow-lg">${
            index + 1
          }</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        L.marker([n.lat, n.lng], { icon: badgeIcon, interactive: false }).addTo(pathLayer);
      }
    });

    if (latlngs.length >= 2) {
      // Glow polyline underneath
      L.polyline(latlngs, {
        color: '#10b981',
        weight: 7,
        opacity: 0.35
      }).addTo(pathLayer);

      // Main vibrant route polyline
      const mainPath = L.polyline(latlngs, {
        color: '#34d399',
        weight: 4,
        opacity: 0.95
      }).addTo(pathLayer);

      // Fit bounds if user just computed route
      mapInstanceRef.current.fitBounds(mainPath.getBounds(), { padding: [50, 50] });
    }
  }, [activePath, nodes]);

  // Render dynamic simulation step
  useEffect(() => {
    if (!mapInstanceRef.current || !layersRef.current.simLayer) return;

    const { simLayer } = layersRef.current;
    simLayer.clearLayers();

    if (!simulationStep) return;

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    // 1. Render visited nodes (blue)
    if (simulationStep.visited) {
      simulationStep.visited.forEach((id) => {
        const n = nodeMap.get(id);
        if (n && id !== simulationStep.node) {
          L.circleMarker([n.lat, n.lng], {
            radius: 7,
            fillColor: '#38bdf8',
            color: '#0284c7',
            weight: 2,
            fillOpacity: 0.8
          }).addTo(simLayer);
        }
      });
    }

    // 2. Render priority queue nodes (amber)
    if (simulationStep.queue) {
      simulationStep.queue.forEach((item) => {
        const n = nodeMap.get(item.element);
        if (n && !simulationStep.visited?.includes(item.element) && item.element !== simulationStep.node) {
          L.circleMarker([n.lat, n.lng], {
            radius: 8,
            fillColor: '#f59e0b',
            color: '#ffffff',
            weight: 2,
            fillOpacity: 0.9
          }).addTo(simLayer);
        }
      });
    }

    // 3. Highlight relaxed edge (gold)
    if (simulationStep.type === 'relax' && simulationStep.fromNode && simulationStep.toNode) {
      const u = nodeMap.get(simulationStep.fromNode);
      const v = nodeMap.get(simulationStep.toNode);
      if (u && v) {
        L.polyline(
          [
            [u.lat, u.lng],
            [v.lat, v.lng]
          ],
          {
            color: simulationStep.improved ? '#f59e0b' : '#94a3b8',
            weight: 5,
            opacity: 0.9,
            dashArray: simulationStep.improved ? null : '6, 6'
          }
        ).addTo(simLayer);
      }
    }

    // 4. Highlight current popped node (crimson pulsating)
    if (simulationStep.node) {
      const curr = nodeMap.get(simulationStep.node);
      if (curr) {
        const pulseIcon = L.divIcon({
          className: 'current-node-pulse',
          html: `<div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-red-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-5 w-5 bg-red-600 ring-2 ring-white shadow-xl"></span>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        L.marker([curr.lat, curr.lng], { icon: pulseIcon }).addTo(simLayer);
      }
    }
  }, [simulationStep, nodes]);

  return (
    <div className="relative flex-1 h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden">
      {/* Leaflet Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Graph Overlay Layer Toggles (FR-2.1) */}
      <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 shadow-xl z-[1000] text-xs space-y-2">
        <div className="flex items-center gap-1.5 pb-1 border-b border-slate-800 font-semibold text-slate-300">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Graph Overlays</span>
        </div>

        <div className="space-y-1.5 text-slate-300">
          <label className="flex items-center justify-between gap-3 cursor-pointer hover:text-white">
            <span>Nodes Layer</span>
            <input
              type="checkbox"
              checked={showNodes}
              onChange={(e) => setShowNodes(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between gap-3 cursor-pointer hover:text-white">
            <span>Edges Layer</span>
            <input
              type="checkbox"
              checked={showEdges}
              onChange={(e) => setShowEdges(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between gap-3 cursor-pointer hover:text-white">
            <span>Place Labels</span>
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between gap-3 cursor-pointer hover:text-white">
            <span>Edge Weights (km)</span>
            <input
              type="checkbox"
              checked={showWeights}
              onChange={(e) => setShowWeights(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between gap-3 cursor-pointer hover:text-white">
            <span>Color Road Types</span>
            <input
              type="checkbox"
              checked={colorByRoadType}
              onChange={(e) => setColorByRoadType(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
          </label>
        </div>

        {/* Legend */}
        <div className="pt-2 border-t border-slate-800 text-[10px] space-y-1">
          <div className="font-semibold text-slate-400">Road Types:</div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-sky-400 rounded-full"></span>
            <span className="text-slate-300">Plain Highway</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-indigo-500 rounded-full"></span>
            <span className="text-slate-300">Hill Highway (NH5/NH154)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-amber-500 rounded-full"></span>
            <span className="text-slate-300">Hill Local Road</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-teal-500 rounded-full"></span>
            <span className="text-slate-300">City Local Road</span>
          </div>
        </div>
      </div>

      {/* Node Inspector Drawer / Popup (FR-2.3 & FR-2.4) */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 max-w-sm w-full bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl p-4 shadow-2xl z-[1000] text-xs space-y-3 animate-slideUp">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <div className="font-bold text-sm text-slate-100">{selectedNode.name}</div>
              <span className="text-[10px] text-cyan-400 font-mono">
                ID: {selectedNode.id} · Region: {selectedNode.region}
              </span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/60 p-2 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500 block">Latitude</span>
              <span className="text-slate-200">{selectedNode.lat}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Longitude</span>
              <span className="text-slate-200">{selectedNode.lng}</span>
            </div>
          </div>

          {/* Adjacency list */}
          <div>
            <div className="text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Navigation2 className="w-3 h-3 text-cyan-400" />
              <span>Adjacency List (Connected Roads):</span>
            </div>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {edges
                .filter((e) => e.from === selectedNode.id || e.to === selectedNode.id)
                .map((e) => {
                  const otherId = e.from === selectedNode.id ? e.to : e.from;
                  const otherNode = nodes.find((n) => n.id === otherId);
                  return (
                    <div
                      key={e.id}
                      className="flex items-center justify-between p-1.5 bg-slate-950/40 rounded border border-slate-800 text-[11px]"
                    >
                      <span className="text-slate-300 truncate max-w-[130px]">
                        {otherNode ? otherNode.name : otherId}
                      </span>
                      <span className="font-mono text-cyan-400 text-[10px]">
                        {e.distanceKm} km · {e.speedKmph} km/h
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


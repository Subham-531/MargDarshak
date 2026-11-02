import express from 'express';
import cors from 'cors';
import { loadGraph } from './utils/graphLoader.js';
import { findNearestNode } from './utils/geo.js';
import { dijkstra } from './algorithms/Dijkstra.js';
import { aStar } from './algorithms/AStar.js';
import { computeFixedOrderRoute, computeOptimalOrderRoute } from './algorithms/MultiStop.js';
import { runAllTests } from './tests/testSuite.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Initialize and validate graph at server startup (PRD Data Flow Step 1)
let graph;
try {
  graph = loadGraph();
  console.log(`[MargDarshak Server] Graph initialized successfully with ${graph.nodes.size} nodes and ${graph.edges.size} edges.`);
} catch (err) {
  console.error(`[MargDarshak Server] Critical: Failed to load graph: ${err.message}`);
  process.exit(1);
}

/**
 * GET /api/graph
 * Returns all nodes and edges for map rendering and overlay toggles.
 */
app.get('/api/graph', (req, res) => {
  try {
    const nodes = graph.getAllNodes();
    const edges = graph.getAllEdges();
    res.json({
      success: true,
      nodes,
      edges,
      stats: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        maxSpeedKmph: graph.getMaxSpeed()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/nodes/search?q=
 * Searches nodes by name, ID, or region for autocomplete.
 */
app.get('/api/nodes/search', (req, res) => {
  const query = (req.query.q || '').trim().toLowerCase();
  if (!query) {
    return res.json({ success: true, nodes: graph.getAllNodes().slice(0, 15) });
  }

  const results = graph.getAllNodes().filter(node =>
    node.name.toLowerCase().includes(query) ||
    node.id.toLowerCase().includes(query) ||
    node.region.toLowerCase().includes(query)
  );

  res.json({ success: true, nodes: results });
});

/**
 * GET /api/nodes/nearest?lat=&lng=
 * Snaps a GPS coordinate to the nearest node on the graph.
 * If > 15 km away, flags outOfCoverage (Acceptance Criteria FR-1.1).
 */
app.get('/api/nodes/nearest', (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ success: false, error: "Valid numeric 'lat' and 'lng' query parameters are required." });
  }

  const nearest = findNearestNode(graph.getAllNodes(), lat, lng);
  if (!nearest) {
    return res.status(404).json({ success: false, error: "No nodes available in the network." });
  }

  const COVERAGE_THRESHOLD_KM = 150.0;
  const outOfCoverage = nearest.distanceKm > COVERAGE_THRESHOLD_KM;

  res.json({
    success: true,
    node: nearest.node,
    distanceKm: nearest.distanceKm,
    outOfCoverage,
    message: outOfCoverage
      ? `Your location is ${nearest.distanceKm} km away, which is outside the MargDarshak coverage zone (max ${COVERAGE_THRESHOLD_KM} km). Snapped to closest city: ${nearest.node.name}.`
      : `Snapped to closest node: ${nearest.node.name} (${nearest.distanceKm} km away).`
  });
});

/**
 * POST /api/route
 * Computes shortest or fastest route using Dijkstra or A*.
 */
app.post('/api/route', (req, res) => {
  try {
    const {
      from,
      to,
      algorithm = 'dijkstra',
      mode = 'distance',
      avoidHighways = false,
      highwayAvoidMode = 'penalty',
      trafficMultipliers = {},
      blockedNodes = [],
      blockedEdges = [],
      includeTrace = true
    } = req.body;

    if (!from || !to) {
      return res.status(400).json({ success: false, error: "Both 'from' and 'to' node IDs are required." });
    }

    const runner = algorithm === 'dijkstra' ? dijkstra : aStar;
    const result = runner(graph, from, to, {
      mode,
      avoidHighways,
      highwayAvoidMode,
      trafficMultipliers,
      blockedNodes,
      blockedEdges,
      includeTrace
    });

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/compare
 * Runs both Dijkstra and A* simultaneously on the same query to compare performance.
 */
app.post('/api/compare', (req, res) => {
  try {
    const {
      from,
      to,
      mode = 'distance',
      avoidHighways = false,
      highwayAvoidMode = 'penalty',
      trafficMultipliers = {}
    } = req.body;

    if (!from || !to) {
      return res.status(400).json({ success: false, error: "Both 'from' and 'to' node IDs are required." });
    }

    const dijkstraResult = dijkstra(graph, from, to, {
      mode,
      avoidHighways,
      highwayAvoidMode,
      trafficMultipliers,
      includeTrace: true
    });

    const astarResult = aStar(graph, from, to, {
      mode,
      avoidHighways,
      highwayAvoidMode,
      trafficMultipliers,
      includeTrace: true
    });

    const nodesSaved = dijkstraResult.nodesExplored - astarResult.nodesExplored;
    const savingsPercent = dijkstraResult.nodesExplored > 0
      ? Number(((nodesSaved / dijkstraResult.nodesExplored) * 100).toFixed(1))
      : 0;

    res.json({
      success: true,
      comparison: {
        dijkstra: {
          path: dijkstraResult.path,
          distanceKm: dijkstraResult.distanceKm,
          timeMin: dijkstraResult.timeMin,
          totalCost: dijkstraResult.totalCost,
          nodesExplored: dijkstraResult.nodesExplored,
          executionTimeMs: dijkstraResult.executionTimeMs,
          traceStepCount: dijkstraResult.trace.length
        },
        astar: {
          path: astarResult.path,
          distanceKm: astarResult.distanceKm,
          timeMin: astarResult.timeMin,
          totalCost: astarResult.totalCost,
          nodesExplored: astarResult.nodesExplored,
          executionTimeMs: astarResult.executionTimeMs,
          traceStepCount: astarResult.trace.length
        },
        metrics: {
          nodesSaved,
          savingsPercent,
          aStarWonOrTied: astarResult.nodesExplored <= dijkstraResult.nodesExplored,
          costMatch: dijkstraResult.totalCost === astarResult.totalCost
        }
      },
      traces: {
        dijkstra: dijkstraResult.trace,
        astar: astarResult.trace
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/route/multistop
 * Multi-stop trip planner (P1 Fixed order & P3 Optimal TSP order).
 */
app.post('/api/route/multistop', (req, res) => {
  try {
    const {
      stops, // Array of node IDs: [start, stop1, stop2, ..., dest]
      optimizeOrder = false,
      algorithm = 'astar',
      mode = 'distance',
      avoidHighways = false,
      highwayAvoidMode = 'penalty',
      trafficMultipliers = {}
    } = req.body;

    if (!stops || !Array.isArray(stops) || stops.length < 2) {
      return res.status(400).json({ success: false, error: "At least 2 stops (start and destination) are required." });
    }

    let result;
    if (optimizeOrder && stops.length > 2) {
      const startId = stops[0];
      const destId = stops[stops.length - 1];
      const intermediateIds = stops.slice(1, -1);
      result = computeOptimalOrderRoute(graph, startId, intermediateIds, destId, {
        algorithm,
        mode,
        avoidHighways,
        highwayAvoidMode,
        trafficMultipliers
      });
    } else {
      result = computeFixedOrderRoute(graph, stops, {
        algorithm,
        mode,
        avoidHighways,
        highwayAvoidMode,
        trafficMultipliers
      });
    }

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/tests/run
 * Runs the unit & real-map verification test suite for viva & demo inspection.
 */
app.get('/api/tests/run', (req, res) => {
  try {
    const testResults = runAllTests();
    res.json({ success: true, ...testResults });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Express server
app.listen(PORT, () => {
  console.log(`[MargDarshak API] Server running on http://localhost:${PORT}`);
});


import { MinHeap } from './MinHeap.js';
import { haversineDistanceKm } from '../utils/geo.js';

/**
 * A* Search Algorithm from scratch with admissible Haversine heuristic.
 *
 * @param {import('./Graph.js').Graph} graph - The road network graph
 * @param {string} startId - Source node ID
 * @param {string} targetId - Destination node ID
 * @param {object} [options={}] - Configuration options
 * @param {'distance' | 'time'} [options.mode='distance'] - Optimization mode
 * @param {boolean} [options.avoidHighways=false] - Avoid highway flag
 * @param {'penalty' | 'block'} [options.highwayAvoidMode='penalty'] - Highway handling
 * @param {object} [options.trafficMultipliers={}] - Edge traffic multipliers
 * @param {boolean} [options.includeTrace=true] - Whether to capture step-by-step trace
 * @param {boolean} [options.zeroHeuristic=false] - If true, h(n) = 0 (degenerates to Dijkstra)
 * @returns {object} Route result with path, cost, stats, and trace
 */
export function aStar(graph, startId, targetId, options = {}) {
  const startTime = performance.now();
  const {
    mode = 'distance',
    avoidHighways = false,
    highwayAvoidMode = 'penalty',
    trafficMultipliers = {},
    includeTrace = true,
    zeroHeuristic = false
  } = options;

  if (!graph.hasNode(startId)) {
    throw new Error(`Start node '${startId}' does not exist in graph.`);
  }
  if (!graph.hasNode(targetId)) {
    throw new Error(`Destination node '${targetId}' does not exist in graph.`);
  }

  const startNode = graph.getNode(startId);
  const targetNode = graph.getNode(targetId);
  const maxSpeed = graph.getMaxSpeed();

  // Edge case: start equals destination
  if (startId === targetId) {
    return {
      found: true,
      algorithm: 'astar',
      mode,
      path: [startId],
      pathNodes: [startNode],
      pathEdges: [],
      distanceKm: 0,
      timeMin: 0,
      totalCost: 0,
      nodesExplored: 1,
      executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
      trace: [
        {
          step: 1,
          type: 'done',
          node: startId,
          explanation: `Start and destination are the same node (${startNode.name}). Cost is 0.`,
          queue: [],
          distances: { [startId]: 0 },
          visited: [startId]
        }
      ]
    };
  }

  /**
   * Admissible Heuristic Function h(n)
   */
  function calculateHeuristic(nodeId) {
    if (zeroHeuristic) return 0;
    const node = graph.getNode(nodeId);
    if (!node || !node.lat || !node.lng || !targetNode.lat || !targetNode.lng) return 0;

    const straightLineKm = haversineDistanceKm(node.lat, node.lng, targetNode.lat, targetNode.lng);

    if (mode === 'time') {
      // (straight-line distance / max speed across entire network) * 60 minutes
      // Guaranteed to never overestimate actual travel time
      return (straightLineKm / maxSpeed) * 60;
    }

    return straightLineKm;
  }

  const gScore = new Map();
  const fScore = new Map();
  const parent = new Map();
  const visited = new Set();
  const pq = new MinHeap();
  const trace = [];
  let stepCount = 0;

  for (const node of graph.getAllNodes()) {
    gScore.set(node.id, Infinity);
    fScore.set(node.id, Infinity);
  }

  const startH = calculateHeuristic(startId);
  gScore.set(startId, 0);
  fScore.set(startId, startH);

  pq.push(startId, startH, {
    gCost: 0,
    hCost: Number(startH.toFixed(2)),
    fCost: Number(startH.toFixed(2))
  });

  function snapshotDistances() {
    const snap = {};
    for (const [id, d] of gScore) {
      if (d !== Infinity) {
        snap[id] = Number(d.toFixed(2));
      }
    }
    return snap;
  }

  const unit = mode === 'time' ? 'min' : 'km';

  if (includeTrace) {
    stepCount++;
    trace.push({
      step: stepCount,
      type: 'push',
      node: startId,
      cost: 0,
      hCost: Number(startH.toFixed(2)),
      fCost: Number(startH.toFixed(2)),
      explanation: `Initialized start node '${startNode.name}' with g=0, h=${Number(startH.toFixed(2))} ${unit}, f=${Number(startH.toFixed(2))}. Inserted into priority queue.`,
      queue: pq.getSnapshot(),
      distances: snapshotDistances(),
      visited: []
    });
  }

  let targetFound = false;

  while (!pq.isEmpty()) {
    const { element: currentId, priority: currentF, metadata } = pq.pop();

    if (visited.has(currentId)) {
      continue;
    }

    visited.add(currentId);
    const currentNode = graph.getNode(currentId);
    const currentG = gScore.get(currentId);

    if (includeTrace) {
      stepCount++;
      trace.push({
        step: stepCount,
        type: 'pop',
        node: currentId,
        nodeName: currentNode.name,
        cost: Number(currentG.toFixed(2)),
        hCost: Number((calculateHeuristic(currentId)).toFixed(2)),
        fCost: Number(currentF.toFixed(2)),
        explanation: `Popped '${currentNode.name}' from queue with g=${Number(currentG.toFixed(2))} ${unit}, f=${Number(currentF.toFixed(2))}.`,
        queue: pq.getSnapshot(),
        distances: snapshotDistances(),
        visited: Array.from(visited)
      });
    }

    // Goal reached
    if (currentId === targetId) {
      targetFound = true;
      break;
    }

    const neighbors = graph.getNeighbors(currentId);
    for (const neighbor of neighbors) {
      const neighborId = neighbor.to;
      const neighborNode = graph.getNode(neighborId);

      if (visited.has(neighborId)) {
        continue;
      }

      const edgeWeight = graph.computeWeight(neighbor, mode, {
        avoidHighways,
        highwayAvoidMode,
        trafficMultipliers
      });

      if (!isFinite(edgeWeight)) {
        if (includeTrace) {
          stepCount++;
          trace.push({
            step: stepCount,
            type: 'relax',
            fromNode: currentId,
            toNode: neighborId,
            edgeId: neighbor.edgeId,
            edgeWeight: Infinity,
            improved: false,
            explanation: `Edge to '${neighborNode.name}' is impassable (highway blocked). Skipped.`,
            queue: pq.getSnapshot(),
            distances: snapshotDistances(),
            visited: Array.from(visited)
          });
        }
        continue;
      }

      const tentativeG = currentG + edgeWeight;
      const oldG = gScore.get(neighborId);

      if (tentativeG < oldG) {
        gScore.set(neighborId, tentativeG);
        const h = calculateHeuristic(neighborId);
        const f = tentativeG + h;
        fScore.set(neighborId, f);
        parent.set(neighborId, { prevNode: currentId, edgeId: neighbor.edgeId });

        if (includeTrace) {
          stepCount++;
          trace.push({
            step: stepCount,
            type: 'relax',
            fromNode: currentId,
            toNode: neighborId,
            edgeId: neighbor.edgeId,
            edgeWeight: Number(edgeWeight.toFixed(2)),
            oldDist: oldG === Infinity ? '∞' : Number(oldG.toFixed(2)),
            newDist: Number(tentativeG.toFixed(2)),
            hCost: Number(h.toFixed(2)),
            fCost: Number(f.toFixed(2)),
            improved: true,
            explanation: `Relaxed edge to '${neighborNode.name}': g=${Number(currentG.toFixed(2))} + ${Number(edgeWeight.toFixed(2))} = ${Number(tentativeG.toFixed(2))} ${unit} (improved from ${oldG === Infinity ? '∞' : Number(oldG.toFixed(2))}). Estimated f=${Number(f.toFixed(2))}.`,
            queue: pq.getSnapshot(),
            distances: snapshotDistances(),
            visited: Array.from(visited)
          });
        }

        pq.push(neighborId, f, {
          gCost: Number(tentativeG.toFixed(2)),
          hCost: Number(h.toFixed(2)),
          fCost: Number(f.toFixed(2))
        });

        if (includeTrace) {
          stepCount++;
          trace.push({
            step: stepCount,
            type: 'push',
            node: neighborId,
            cost: Number(tentativeG.toFixed(2)),
            hCost: Number(h.toFixed(2)),
            fCost: Number(f.toFixed(2)),
            explanation: `Pushed '${neighborNode.name}' to queue with f=${Number(f.toFixed(2))} (g=${Number(tentativeG.toFixed(2))}, h=${Number(h.toFixed(2))}).`,
            queue: pq.getSnapshot(),
            distances: snapshotDistances(),
            visited: Array.from(visited)
          });
        }
      } else {
        if (includeTrace) {
          stepCount++;
          trace.push({
            step: stepCount,
            type: 'relax',
            fromNode: currentId,
            toNode: neighborId,
            edgeId: neighbor.edgeId,
            edgeWeight: Number(edgeWeight.toFixed(2)),
            oldDist: Number(oldG.toFixed(2)),
            newDist: Number(tentativeG.toFixed(2)),
            improved: false,
            explanation: `Inspected edge to '${neighborNode.name}': cost ${Number(tentativeG.toFixed(2))} >= existing ${Number(oldG.toFixed(2))} ${unit}. No update.`,
            queue: pq.getSnapshot(),
            distances: snapshotDistances(),
            visited: Array.from(visited)
          });
        }
      }
    }
  }

  const executionTimeMs = Number((performance.now() - startTime).toFixed(2));

  if (!targetFound && gScore.get(targetId) === Infinity) {
    if (includeTrace) {
      stepCount++;
      trace.push({
        step: stepCount,
        type: 'done',
        node: targetId,
        explanation: `Destination '${graph.getNode(targetId).name}' is unreachable from '${startNode.name}'. Search exhausted.`,
        queue: [],
        distances: snapshotDistances(),
        visited: Array.from(visited)
      });
    }

    return {
      found: false,
      algorithm: 'astar',
      mode,
      path: [],
      pathNodes: [],
      pathEdges: [],
      distanceKm: 0,
      timeMin: 0,
      totalCost: Infinity,
      nodesExplored: visited.size,
      executionTimeMs,
      trace
    };
  }

  // Path reconstruction
  const path = [];
  const pathEdges = [];
  let curr = targetId;
  while (curr !== undefined) {
    path.push(curr);
    const pInfo = parent.get(curr);
    if (pInfo) {
      pathEdges.push(pInfo.edgeId);
      curr = pInfo.prevNode;
    } else {
      break;
    }
  }
  path.reverse();
  pathEdges.reverse();

  let actualDistKm = 0;
  let actualTimeMin = 0;
  for (const edgeId of pathEdges) {
    const edge = graph.getEdge(edgeId);
    if (edge) {
      actualDistKm += edge.distanceKm;
      actualTimeMin += edge.timeMin;
    }
  }

  const totalCost = Number(gScore.get(targetId).toFixed(2));

  if (includeTrace) {
    stepCount++;
    trace.push({
      step: stepCount,
      type: 'done',
      node: targetId,
      explanation: `A* goal reached! Explored ${visited.size} nodes. Path has ${path.length} nodes with cost ${totalCost} ${unit}.`,
      queue: pq.getSnapshot(),
      distances: snapshotDistances(),
      visited: Array.from(visited),
      finalPath: path
    });
  }

  return {
    found: true,
    algorithm: 'astar',
    mode,
    path,
    pathNodes: path.map(id => graph.getNode(id)),
    pathEdges,
    distanceKm: Number(actualDistKm.toFixed(2)),
    timeMin: Number(actualTimeMin.toFixed(2)),
    totalCost,
    nodesExplored: visited.size,
    executionTimeMs,
    trace
  };
}


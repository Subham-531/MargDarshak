import { MinHeap } from './MinHeap.js';

/**
 * Dijkstra's Shortest Path Algorithm from scratch.
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
 * @returns {object} Route result with path, cost, stats, and trace
 */
export function dijkstra(graph, startId, targetId, options = {}) {
  const startTime = performance.now();
  const {
    mode = 'distance',
    avoidHighways = false,
    highwayAvoidMode = 'penalty',
    trafficMultipliers = {},
    includeTrace = true
  } = options;

  if (!graph.hasNode(startId)) {
    throw new Error(`Start node '${startId}' does not exist in graph.`);
  }
  if (!graph.hasNode(targetId)) {
    throw new Error(`Destination node '${targetId}' does not exist in graph.`);
  }

  // Edge case: start is equal to destination
  if (startId === targetId) {
    const startNode = graph.getNode(startId);
    return {
      found: true,
      algorithm: 'dijkstra',
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

  const distances = new Map();
  const parent = new Map(); // node -> { prevNode, edgeId }
  const visited = new Set();
  const pq = new MinHeap();
  const trace = [];
  let stepCount = 0;

  // Initialize distances
  for (const node of graph.getAllNodes()) {
    distances.set(node.id, Infinity);
  }
  distances.set(startId, 0);

  // Push start node to priority queue
  pq.push(startId, 0, { gCost: 0 });

  function snapshotDistances() {
    const snap = {};
    for (const [id, d] of distances) {
      if (d !== Infinity) {
        snap[id] = Number(d.toFixed(2));
      }
    }
    return snap;
  }

  if (includeTrace) {
    stepCount++;
    trace.push({
      step: stepCount,
      type: 'push',
      node: startId,
      cost: 0,
      explanation: `Initialized start node '${graph.getNode(startId).name}' with distance 0 and inserted into priority queue.`,
      queue: pq.getSnapshot(),
      distances: snapshotDistances(),
      visited: []
    });
  }

  let targetFound = false;

  while (!pq.isEmpty()) {
    const { element: currentId, priority: currentDist } = pq.pop();

    if (visited.has(currentId)) {
      continue;
    }

    visited.add(currentId);
    const currentNode = graph.getNode(currentId);

    if (includeTrace) {
      stepCount++;
      trace.push({
        step: stepCount,
        type: 'pop',
        node: currentId,
        nodeName: currentNode.name,
        cost: Number(currentDist.toFixed(2)),
        explanation: `Popped '${currentNode.name}' from priority queue with settled distance ${Number(currentDist.toFixed(2))} ${mode === 'time' ? 'min' : 'km'}.`,
        queue: pq.getSnapshot(),
        distances: snapshotDistances(),
        visited: Array.from(visited)
      });
    }

    // Early termination if destination reached
    if (currentId === targetId) {
      targetFound = true;
      break;
    }

    // Inspect outgoing edges
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

      // If edge is impassable (e.g. hard-blocked highway)
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

      const newDist = currentDist + edgeWeight;
      const oldDist = distances.get(neighborId);
      const unit = mode === 'time' ? 'min' : 'km';

      if (newDist < oldDist) {
        distances.set(neighborId, newDist);
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
            oldDist: oldDist === Infinity ? '∞' : Number(oldDist.toFixed(2)),
            newDist: Number(newDist.toFixed(2)),
            improved: true,
            explanation: `Relaxed edge to '${neighborNode.name}': ${Number(currentDist.toFixed(2))} + ${Number(edgeWeight.toFixed(2))} = ${Number(newDist.toFixed(2))} ${unit} (improved from ${oldDist === Infinity ? '∞' : Number(oldDist.toFixed(2))} ${unit}).`,
            queue: pq.getSnapshot(),
            distances: snapshotDistances(),
            visited: Array.from(visited)
          });
        }

        pq.push(neighborId, newDist, { gCost: Number(newDist.toFixed(2)) });

        if (includeTrace) {
          stepCount++;
          trace.push({
            step: stepCount,
            type: 'push',
            node: neighborId,
            cost: Number(newDist.toFixed(2)),
            explanation: `Pushed '${neighborNode.name}' to priority queue with updated distance ${Number(newDist.toFixed(2))} ${unit}.`,
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
            oldDist: Number(oldDist.toFixed(2)),
            newDist: Number(newDist.toFixed(2)),
            improved: false,
            explanation: `Inspected edge to '${neighborNode.name}': cost ${Number(newDist.toFixed(2))} >= existing ${Number(oldDist.toFixed(2))} ${unit}. No update.`,
            queue: pq.getSnapshot(),
            distances: snapshotDistances(),
            visited: Array.from(visited)
          });
        }
      }
    }
  }

  const executionTimeMs = Number((performance.now() - startTime).toFixed(2));

  if (!targetFound && distances.get(targetId) === Infinity) {
    if (includeTrace) {
      stepCount++;
      trace.push({
        step: stepCount,
        type: 'done',
        node: targetId,
        explanation: `Destination '${graph.getNode(targetId).name}' is unreachable from start node '${graph.getNode(startId).name}'. Search exhausted.`,
        queue: [],
        distances: snapshotDistances(),
        visited: Array.from(visited)
      });
    }

    return {
      found: false,
      algorithm: 'dijkstra',
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

  // Compute actual physical distance & time along path
  let actualDistKm = 0;
  let actualTimeMin = 0;
  for (const edgeId of pathEdges) {
    const edge = graph.getEdge(edgeId);
    if (edge) {
      actualDistKm += edge.distanceKm;
      actualTimeMin += edge.timeMin;
    }
  }

  const totalCost = Number(distances.get(targetId).toFixed(2));

  if (includeTrace) {
    stepCount++;
    trace.push({
      step: stepCount,
      type: 'done',
      node: targetId,
      explanation: `Goal reached! Shortest path contains ${path.length} nodes with total cost ${totalCost} ${mode === 'time' ? 'min' : 'km'}.`,
      queue: pq.getSnapshot(),
      distances: snapshotDistances(),
      visited: Array.from(visited),
      finalPath: path
    });
  }

  return {
    found: true,
    algorithm: 'dijkstra',
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


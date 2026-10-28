import { dijkstra } from './Dijkstra.js';
import { aStar } from './AStar.js';

/**
 * Computes a multi-stop route chaining consecutive stops in fixed order.
 *
 * @param {import('./Graph.js').Graph} graph
 * @param {string[]} stopIds - Array of node IDs [start, stop1, stop2, ..., destination]
 * @param {object} [options={}]
 * @returns {object} Combined route result
 */
export function computeFixedOrderRoute(graph, stopIds, options = {}) {
  const { algorithm = 'astar', mode = 'distance', ...restOptions } = options;
  const runner = algorithm === 'dijkstra' ? dijkstra : aStar;

  if (!stopIds || stopIds.length < 2) {
    throw new Error("Multi-stop route requires at least 2 nodes (start and destination).");
  }

  const legs = [];
  const combinedPath = [];
  const combinedPathEdges = [];
  let totalDistanceKm = 0;
  let totalTimeMin = 0;
  let totalCost = 0;
  let totalNodesExplored = 0;
  let totalExecutionTimeMs = 0;

  for (let i = 0; i < stopIds.length - 1; i++) {
    const from = stopIds[i];
    const to = stopIds[i + 1];

    const legResult = runner(graph, from, to, {
      ...restOptions,
      mode,
      includeTrace: false // Traces can be requested per leg if needed
    });

    if (!legResult.found) {
      return {
        found: false,
        error: `Could not find a valid route between '${graph.getNode(from).name}' and '${graph.getNode(to).name}'.`,
        legs
      };
    }

    legs.push({
      legIndex: i,
      from,
      to,
      fromName: graph.getNode(from).name,
      toName: graph.getNode(to).name,
      path: legResult.path,
      distanceKm: legResult.distanceKm,
      timeMin: legResult.timeMin,
      totalCost: legResult.totalCost,
      nodesExplored: legResult.nodesExplored
    });

    totalDistanceKm += legResult.distanceKm;
    totalTimeMin += legResult.timeMin;
    totalCost += legResult.totalCost;
    totalNodesExplored += legResult.nodesExplored;
    totalExecutionTimeMs += legResult.executionTimeMs;

    // Stitch paths together avoiding duplicate junction node
    if (i === 0) {
      combinedPath.push(...legResult.path);
    } else {
      combinedPath.push(...legResult.path.slice(1));
    }
    combinedPathEdges.push(...legResult.pathEdges);
  }

  return {
    found: true,
    algorithm,
    mode,
    isMultiStop: true,
    isOptimizedOrder: false,
    stops: stopIds,
    legs,
    path: combinedPath,
    pathNodes: combinedPath.map(id => graph.getNode(id)),
    pathEdges: combinedPathEdges,
    distanceKm: Number(totalDistanceKm.toFixed(2)),
    timeMin: Number(totalTimeMin.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
    nodesExplored: totalNodesExplored,
    executionTimeMs: Number(totalExecutionTimeMs.toFixed(2))
  };
}

/**
 * Optimizes the visit order of intermediate stops using Held-Karp Bitmask DP (TSP).
 * Start and destination remain fixed; intermediate stops are re-ordered for minimum cost.
 *
 * @param {import('./Graph.js').Graph} graph
 * @param {string} startId
 * @param {string[]} intermediateIds - Up to 8 intermediate stops
 * @param {string} destId
 * @param {object} [options={}]
 * @returns {object} Optimal ordered route
 */
export function computeOptimalOrderRoute(graph, startId, intermediateIds, destId, options = {}) {
  const { algorithm = 'astar', mode = 'distance', ...restOptions } = options;
  const runner = algorithm === 'dijkstra' ? dijkstra : aStar;

  const k = intermediateIds.length;
  if (k === 0) {
    return computeFixedOrderRoute(graph, [startId, destId], options);
  }
  if (k > 9) {
    throw new Error("TSP optimization supports up to 8 intermediate stops.");
  }

  // Precompute pairwise distances between all points in {start, intermediate..., dest}
  const allPoints = [startId, ...intermediateIds, destId];
  const n = allPoints.length; // n = k + 2
  const distMatrix = Array.from({ length: n }, () => Array(n).fill(Infinity));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        distMatrix[i][j] = 0;
        continue;
      }
      const res = runner(graph, allPoints[i], allPoints[j], {
        ...restOptions,
        mode,
        includeTrace: false
      });
      if (res.found) {
        distMatrix[i][j] = res.totalCost;
      }
    }
  }

  // Intermediate indices: 1 to k (allPoints[1] ... allPoints[k])
  // dp(mask, last) where mask is subset of intermediate visited (0 to 2^k - 1)
  // and last is index in intermediate (0 to k-1)
  const numMasks = 1 << k;
  const dp = Array.from({ length: numMasks }, () => Array(k).fill(Infinity));
  const parent = Array.from({ length: numMasks }, () => Array(k).fill(-1));

  // Base cases: starting from startId (index 0) to intermediate i (allPoints[i+1])
  for (let i = 0; i < k; i++) {
    const cost = distMatrix[0][i + 1];
    dp[1 << i][i] = cost;
  }

  // Fill DP table
  for (let mask = 1; mask < numMasks; mask++) {
    for (let u = 0; u < k; u++) {
      if (!(mask & (1 << u))) continue;
      const currentCost = dp[mask][u];
      if (currentCost === Infinity) continue;

      for (let v = 0; v < k; v++) {
        if (mask & (1 << v)) continue;
        const nextMask = mask | (1 << v);
        const transitionCost = currentCost + distMatrix[u + 1][v + 1];
        if (transitionCost < dp[nextMask][v]) {
          dp[nextMask][v] = transitionCost;
          parent[nextMask][v] = u;
        }
      }
    }
  }

  // Connect to destination (allPoints[n - 1])
  const fullMask = numMasks - 1;
  let minTotalCost = Infinity;
  let bestLast = -1;

  for (let u = 0; u < k; u++) {
    const total = dp[fullMask][u] + distMatrix[u + 1][n - 1];
    if (total < minTotalCost) {
      minTotalCost = total;
      bestLast = u;
    }
  }

  if (bestLast === -1 || minTotalCost === Infinity) {
    // Fall back to fixed order if unreachable
    return computeFixedOrderRoute(graph, [startId, ...intermediateIds, destId], options);
  }

  // Reconstruct optimal permutation
  const perm = [];
  let currMask = fullMask;
  let curr = bestLast;

  while (curr !== -1) {
    perm.push(curr);
    const prev = parent[currMask][curr];
    currMask ^= (1 << curr);
    curr = prev;
  }
  perm.reverse();

  const optimalStops = [
    startId,
    ...perm.map(idx => intermediateIds[idx]),
    destId
  ];

  const result = computeFixedOrderRoute(graph, optimalStops, options);
  result.isOptimizedOrder = true;
  return result;
}


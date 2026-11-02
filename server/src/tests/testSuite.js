import { Graph } from '../algorithms/Graph.js';
import { MinHeap } from '../algorithms/MinHeap.js';
import { dijkstra } from '../algorithms/Dijkstra.js';
import { aStar } from '../algorithms/AStar.js';
import { loadGraph } from '../utils/graphLoader.js';

/**
 * Builds the canonical textbook test graph specified in PRD Section 12:
 * Undirected edges:
 *   A-B: 7, A-C: 9, A-F: 14
 *   B-C: 10, B-D: 15
 *   C-D: 11, C-F: 2
 *   D-E: 6
 *   E-F: 9
 * Node G has no edges (disconnected component).
 */
export function buildTestGraph() {
  const g = new Graph();
  const nodeIds = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  
  // Assign dummy spatial coords so A* / haversine doesn't fail
  const coords = {
    A: [30.7, 76.7],
    B: [30.72, 76.72],
    C: [30.71, 76.73],
    D: [30.74, 76.75],
    E: [30.75, 76.76],
    F: [30.73, 76.74],
    G: [30.9, 76.9]
  };

  for (const id of nodeIds) {
    g.addNode({
      id,
      name: `Node ${id}`,
      lat: coords[id][0],
      lng: coords[id][1],
      region: 'Test'
    });
  }

  const edges = [
    { id: 't_ab', from: 'A', to: 'B', distanceKm: 7, speedKmph: 50, roadType: 'local', terrain: 'plain' },
    { id: 't_ac', from: 'A', to: 'C', distanceKm: 9, speedKmph: 50, roadType: 'local', terrain: 'plain' },
    { id: 't_af', from: 'A', to: 'F', distanceKm: 14, speedKmph: 50, roadType: 'local', terrain: 'plain' },
    { id: 't_bc', from: 'B', to: 'C', distanceKm: 10, speedKmph: 50, roadType: 'local', terrain: 'plain' },
    { id: 't_bd', from: 'B', to: 'D', distanceKm: 15, speedKmph: 50, roadType: 'local', terrain: 'plain' },
    { id: 't_cd', from: 'C', to: 'D', distanceKm: 11, speedKmph: 50, roadType: 'local', terrain: 'plain' },
    { id: 't_cf', from: 'C', to: 'F', distanceKm: 2, speedKmph: 50, roadType: 'local', terrain: 'plain' },
    { id: 't_de', from: 'D', to: 'E', distanceKm: 6, speedKmph: 50, roadType: 'local', terrain: 'plain' },
    { id: 't_ef', from: 'E', to: 'F', distanceKm: 9, speedKmph: 50, roadType: 'local', terrain: 'plain' }
  ];

  for (const e of edges) {
    g.addEdge(e);
  }

  return g;
}

export function runAllTests() {
  const results = [];

  function record(id, description, passed, details = '') {
    results.push({ id, description, passed, details });
  }

  // --- PRD TEST SUITE (T1 to T7) ---
  const testGraph = buildTestGraph();

  // T1: A to E, Dijkstra -> Path A, C, F, E; cost 20
  try {
    const res = dijkstra(testGraph, 'A', 'E', { mode: 'distance' });
    const expectedPath = ['A', 'C', 'F', 'E'];
    const pathMatches = JSON.stringify(res.path) === JSON.stringify(expectedPath);
    const costMatches = res.totalCost === 20;
    record(
      'T1',
      'A to E, Dijkstra (Path: A->C->F->E, Cost: 20)',
      pathMatches && costMatches,
      `Got path: ${res.path.join('->')} with cost: ${res.totalCost}`
    );
  } catch (err) {
    record('T1', 'A to E, Dijkstra', false, err.message);
  }

  // T2: A to D, Dijkstra -> Path A, C, D; cost 20
  try {
    const res = dijkstra(testGraph, 'A', 'D', { mode: 'distance' });
    const expectedPath = ['A', 'C', 'D'];
    const pathMatches = JSON.stringify(res.path) === JSON.stringify(expectedPath);
    const costMatches = res.totalCost === 20;
    record(
      'T2',
      'A to D, Dijkstra (Path: A->C->D, Cost: 20)',
      pathMatches && costMatches,
      `Got path: ${res.path.join('->')} with cost: ${res.totalCost}`
    );
  } catch (err) {
    record('T2', 'A to D, Dijkstra', false, err.message);
  }

  // T3: A to E, A* with zero heuristic -> Same path and cost as T1
  try {
    const res = aStar(testGraph, 'A', 'E', { mode: 'distance', zeroHeuristic: true });
    const expectedPath = ['A', 'C', 'F', 'E'];
    const pathMatches = JSON.stringify(res.path) === JSON.stringify(expectedPath);
    const costMatches = res.totalCost === 20;
    record(
      'T3',
      'A to E, A* with zero heuristic (Matches Dijkstra T1)',
      pathMatches && costMatches,
      `Got path: ${res.path.join('->')} with cost: ${res.totalCost}`
    );
  } catch (err) {
    record('T3', 'A to E, A* with zero heuristic', false, err.message);
  }

  // T4: A to A -> Path A; cost 0
  try {
    const res = dijkstra(testGraph, 'A', 'A', { mode: 'distance' });
    const pathMatches = JSON.stringify(res.path) === JSON.stringify(['A']);
    const costMatches = res.totalCost === 0;
    record(
      'T4',
      'A to A (Path: [A], Cost: 0)',
      pathMatches && costMatches,
      `Got path: ${res.path.join(', ')} with cost: ${res.totalCost}`
    );
  } catch (err) {
    record('T4', 'A to A', false, err.message);
  }

  // T5: A to G -> No route found
  try {
    const res = dijkstra(testGraph, 'A', 'G', { mode: 'distance' });
    record(
      'T5',
      'A to G (Disconnected node G, returns found: false)',
      res.found === false && res.path.length === 0,
      `found: ${res.found}, nodesExplored: ${res.nodesExplored}`
    );
  } catch (err) {
    record('T5', 'A to G', false, err.message);
  }

  // T6: Graph file with a negative edge -> Rejected at load
  try {
    const badGraph = new Graph();
    badGraph.addNode({ id: 'N1', name: 'N1', lat: 30, lng: 76, region: 'X' });
    badGraph.addNode({ id: 'N2', name: 'N2', lat: 30.1, lng: 76.1, region: 'X' });
    let threw = false;
    try {
      badGraph.addEdge({
        id: 'bad_e',
        from: 'N1',
        to: 'N2',
        distanceKm: -5, // Negative weight!
        speedKmph: 50,
        roadType: 'local',
        terrain: 'plain'
      });
    } catch {
      threw = true;
    }
    record(
      'T6',
      'Graph rejects negative edge weights at add/load time',
      threw,
      threw ? 'Correctly rejected negative edge' : 'Failed to reject negative edge'
    );
  } catch (err) {
    record('T6', 'Graph rejects negative weight', false, err.message);
  }

  // T7: MinHeap: push 5, 1, 3 -> Pops 1, 3, 5
  try {
    const heap = new MinHeap();
    heap.push('val5', 5);
    heap.push('val1', 1);
    heap.push('val3', 3);

    const p1 = heap.pop();
    const p2 = heap.pop();
    const p3 = heap.pop();

    const passed = p1.priority === 1 && p2.priority === 3 && p3.priority === 5;
    record(
      'T7',
      'MinHeap: push 5, 1, 3 -> pops 1, 3, 5',
      passed,
      `Popped priorities: ${p1?.priority}, ${p2?.priority}, ${p3?.priority}`
    );
  } catch (err) {
    record('T7', 'MinHeap push/pop order', false, err.message);
  }

  // --- REAL-MAP BENCHMARK TESTS ---
  try {
    const realGraph = loadGraph();

    // R1: Delhi to Mumbai (Golden Quadrilateral Western Corridor)
    const delMum = dijkstra(realGraph, 'DEL', 'MUM', { mode: 'distance' });
    const r1Passes = delMum.found && delMum.distanceKm >= 1200 && delMum.distanceKm <= 1650;
    record(
      'R1',
      'Real Map: Delhi to Mumbai (NH48 Western Corridor; ~1450-1500 km)',
      r1Passes,
      `Distance: ${delMum.distanceKm} km, Path: ${delMum.path.join(' -> ')}`
    );

    // R2: Delhi to Chandigarh (Northern Highway Corridor)
    const delChd = dijkstra(realGraph, 'DEL', 'CHD', { mode: 'time' });
    const r2Passes = delChd.found && delChd.distanceKm >= 220 && delChd.distanceKm <= 280;
    record(
      'R2',
      'Real Map: Delhi to Chandigarh (NH44 via Panipat, Karnal, Ambala; ~248 km)',
      r2Passes,
      `Distance: ${delChd.distanceKm} km, Time: ${delChd.timeMin} min, Path: ${delChd.path.join(' -> ')}`
    );

    // R3: Mumbai to Pune (Short Intercity Corridor)
    const mumPne = dijkstra(realGraph, 'MUM', 'PNE', { mode: 'distance' });
    const isShort = mumPne.found && mumPne.distanceKm >= 120 && mumPne.distanceKm <= 180;
    record(
      'R3',
      'Real Map: Mumbai to Pune (Mumbai-Pune Expressway; ~150 km)',
      isShort,
      `Distance: ${mumPne.distanceKm} km, Path: ${mumPne.path.join(' -> ')}`
    );

    // R4: A* vs Dijkstra efficiency benchmark on national routes
    const testPairs = [
      ['DEL', 'MUM'],
      ['DEL', 'BLR'],
      ['DEL', 'KOL'],
      ['MUM', 'CHE'],
      ['KOL', 'CHE'],
      ['BLR', 'HYD'],
      ['AMD', 'PNE'],
      ['LKO', 'PAT']
    ];

    let aStarWinsOrTies = 0;
    const pairDetails = [];
    for (const [from, to] of testPairs) {
      const dRes = dijkstra(realGraph, from, to, { mode: 'distance' });
      const aRes = aStar(realGraph, from, to, { mode: 'distance' });
      if (aRes.nodesExplored <= dRes.nodesExplored) {
        aStarWinsOrTies++;
      }
      pairDetails.push(`${from}->${to}: Dijkstra=${dRes.nodesExplored}, A*=${aRes.nodesExplored}`);
    }

    const aStarWinRatio = aStarWinsOrTies / testPairs.length;
    record(
      'R4',
      `A* explores <= nodes than Dijkstra on >= 80% queries (Achieved: ${(aStarWinRatio * 100).toFixed(0)}%)`,
      aStarWinRatio >= 0.8,
      pairDetails.join(' | ')
    );

    // R5: Avoid Highways filter test
    const normalRoute = dijkstra(realGraph, 'DEL', 'CHD', { mode: 'time', avoidHighways: false });
    const avoidRoute = dijkstra(realGraph, 'DEL', 'CHD', { mode: 'time', avoidHighways: true, highwayAvoidMode: 'penalty' });
    const penaltyApplied = avoidRoute.totalCost > normalRoute.totalCost;
    record(
      'R5',
      'Avoid Highways: Penalty mode increases cost or redirects to local roads',
      penaltyApplied,
      `Normal cost: ${normalRoute.totalCost} min, Avoid Highways cost: ${avoidRoute.totalCost} min`
    );

  } catch (err) {
    record('RealMapTests', 'Real map tests initialization', false, err.message);
  }

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount;

  return {
    allPassed,
    passedCount,
    totalCount,
    results
  };
}

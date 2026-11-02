import os
import base64
import subprocess

# Read high-res screenshot as base64
ss_path = '/Users/subhamkumar/Downloads/Coding/antigravity_files/ADSA_Project/app_screenshot.png'
with open(ss_path, "rb") as f:
    app_ss_b64 = "data:image/png;base64," + base64.b64encode(f.read()).decode("utf-8")

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>MargDarshak Project Report</title>
<style>
  @page {
    size: A4;
    margin: 16mm 16mm 16mm 16mm;
    @bottom-center {
      content: counter(page);
    }
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    line-height: 1.6;
    margin: 0;
    padding: 0;
    font-size: 13px;
  }

  .page-break {
    page-break-before: always;
  }

  /* Cover Page */
  .cover-page {
    height: 94vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-align: center;
    border: 3px double #0f172a;
    padding: 30px 25px;
    box-sizing: border-box;
  }

  .inst-header h2 {
    font-size: 20px;
    margin: 0 0 5px 0;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }
  .inst-header p {
    margin: 0;
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
  }

  .report-badge {
    display: inline-block;
    padding: 6px 18px;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: #334155;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-top: 15px;
  }

  .title-section {
    margin: 35px 0;
  }
  .title-section h1 {
    font-size: 32px;
    margin: 0 0 10px 0;
    color: #0f172a;
    font-weight: 800;
    letter-spacing: -0.5px;
  }
  .title-section .subtitle {
    font-size: 16px;
    color: #2563eb;
    font-weight: 600;
    margin: 0 0 12px 0;
  }
  .title-section .description {
    font-size: 13px;
    color: #475569;
    max-width: 520px;
    margin: 0 auto;
    line-height: 1.5;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    text-align: left;
    margin: 15px 20px 30px 20px;
    border-top: 1px solid #e2e8f0;
    padding-top: 20px;
  }
  .meta-box h4 {
    margin: 0 0 8px 0;
    font-size: 12px;
    color: #2563eb;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .meta-box p {
    margin: 4px 0;
    font-size: 13px;
    color: #1e293b;
  }
  .meta-box p strong {
    color: #0f172a;
  }

  .date-footer {
    font-size: 11.5px;
    color: #64748b;
    border-top: 1px dashed #cbd5e1;
    padding-top: 10px;
  }

  /* Content Headings */
  h2.section-title {
    font-size: 17px;
    color: #0f172a;
    border-bottom: 2px solid #2563eb;
    padding-bottom: 5px;
    margin-top: 20px;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  h3 {
    font-size: 14.5px;
    color: #1e293b;
    margin-top: 14px;
    margin-bottom: 6px;
  }

  p, li {
    text-align: justify;
  }

  ul, ol {
    padding-left: 22px;
    margin: 6px 0;
  }

  li {
    margin-bottom: 4px;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 12px;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 7px 9px;
    text-align: left;
  }
  th {
    background-color: #f8fafc;
    color: #0f172a;
    font-weight: 600;
  }
  tr:nth-child(even) {
    background-color: #f8fafc;
  }

  /* Code Block */
  pre {
    background: #0f172a;
    color: #f8fafc;
    padding: 10px 12px;
    border-radius: 6px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 10px;
    line-height: 1.4;
    overflow-x: auto;
    margin: 8px 0;
  }

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    background: #f1f5f9;
    padding: 1px 4px;
    border-radius: 4px;
    font-size: 11.5px;
    color: #0f172a;
  }

  pre code {
    background: transparent;
    color: inherit;
    padding: 0;
  }

  .diagram-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 14px;
    margin: 14px 0;
    text-align: center;
  }

  .screenshot-container {
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 10px;
    background: #ffffff;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    margin: 14px 0;
    text-align: center;
  }
  .screenshot-container img {
    width: 100%;
    height: auto;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    display: block;
  }
  .screenshot-caption {
    font-size: 12px;
    color: #475569;
    margin-top: 8px;
    font-weight: 600;
  }
</style>
</head>
<body>

<!-- 1. COVER PAGE -->
<div class="cover-page">
  <div class="inst-header">
    <h2>Academic Project Report</h2>
    <p>Department of Computer Science & Engineering</p>
    <div class="report-badge">Course: Advanced Data Structures & Algorithms (ADSA)</div>
  </div>

  <div class="title-section">
    <h1>🧭 MargDarshak (मार्गदर्शक)</h1>
    <div class="subtitle">3D Indian Highway Engine & Shortest Path Navigation System</div>
    <div class="description">
      An end-to-end geospatial routing architecture implementing pure Dijkstra's Algorithm from scratch with a custom Binary Min-Heap Priority Queue on the Indian National Highway network.
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-box">
      <h4>Submitted By</h4>
      <p><strong>Student Name:</strong> Subham Kumar</p>
      <p><strong>UID / Roll No:</strong> [Your University UID]</p>
      <p><strong>Program:</strong> B.E. Computer Science & Engineering</p>
      <p><strong>Semester:</strong> 6th Semester</p>
    </div>
    <div class="meta-box">
      <h4>Under The Guidance Of</h4>
      <p><strong>Faculty Name:</strong> [Faculty / Professor Name]</p>
      <p><strong>Designation:</strong> Assistant Professor / Associate Professor</p>
      <p><strong>Department:</strong> Computer Science & Engineering</p>
      <p><strong>Academic Year:</strong> 2025 – 2026</p>
    </div>
  </div>

  <div class="date-footer">
    Chandigarh University / Institute of Technology • GitHub: github.com/Subham-531/MargDarshak
  </div>
</div>

<div class="page-break"></div>

<!-- 2. INTRODUCTION -->
<h2 class="section-title">2. Introduction</h2>
<p>
  <strong>MargDarshak</strong> (मार्गदर्शक — <em>The Visionary Pathfinder</em>) is a geospatial route calculation engine developed to bridge theoretical graph algorithms with real-world national road infrastructure. While modern commercial mapping providers rely heavily on closed, proprietary cloud services, MargDarshak is engineered from foundational computer science principles without any third-party algorithmic or routing packages.
</p>
<p>
  The project translates India's extensive highway network—including the <strong>Golden Quadrilateral</strong> (NH48, NH16, NH19), the <strong>North-South & East-West Corridors</strong> (NH44, NH27), and mountain passes (NH3, NH5)—into an active, weighted topological graph comprising <strong>135+ major vertices (cities/junctions) and 207+ bidirectional edges</strong>.
</p>
<p>
  At its core, MargDarshak focuses purely on <strong>Dijkstra's Single-Source Shortest Path Algorithm</strong> paired with an array-based <strong>Binary Min-Heap Priority Queue</strong>. By executing the algorithm directly over geographical coordinate nodes and road weights, the system provides mathematically guaranteed optimal paths across the subcontinent with high computational efficiency.
</p>

<!-- 3. OBJECTIVES -->
<h2 class="section-title">3. Objectives</h2>
<ol>
  <li><strong>Algorithmic Implementation from Scratch:</strong> Implement Dijkstra's Single-Source Shortest Path algorithm and an array-based Binary Min-Heap Priority Queue from foundational principles without relying on external third-party routing libraries.</li>
  <li><strong>Time Complexity Optimization:</strong> Attain the optimal asymptotic time complexity of <code>O((V + E) log V)</code> through efficient priority queue operations (push, bubble-up, pop, sink-down), outperforming naive array-based <code>O(V&sup2;)</code> implementations.</li>
  <li><strong>Realistic National Highway Modeling:</strong> Build a realistic weighted graph representing India's national highways covering 135+ key junctions and 207+ highway segments with accurate geographic distances, speed limits, and road classifications.</li>
  <li><strong>Interactive 3D Geospatial Visualization:</strong> Deliver a full-stack, responsive user interface with 2D/3D camera perspectives, real-time node exploration telemetry, and step-by-step route computation details.</li>
</ol>

<!-- 4. DATA STRUCTURES USED -->
<h2 class="section-title">4. Data Structures Used</h2>
<p>
  The efficiency of route finding depends directly on the chosen data structures. MargDarshak employs canonical data structures optimized for sparse real-world graphs:
</p>

<table>
  <thead>
    <tr>
      <th>Data Structure</th>
      <th>Implementation</th>
      <th>Role in MargDarshak</th>
      <th>Complexity</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Adjacency List</strong></td>
      <td><code>Map&lt;NodeId, Edge[]&gt;</code></td>
      <td>Stores vertices and outgoing highway edges. Drastically reduces memory footprint compared to an Adjacency Matrix in sparse road graphs.</td>
      <td>Space: O(V + E)<br>Lookup: O(1) avg</td>
    </tr>
    <tr>
      <td><strong>Binary Min-Heap</strong></td>
      <td><code>MinHeap</code> (Array-based)</td>
      <td>Acts as the Priority Queue, guaranteeing that the unvisited vertex with the lowest cumulative travel cost is extracted first.</td>
      <td>Push / Pop: O(log V)<br>Peek: O(1)</td>
    </tr>
    <tr>
      <td><strong>Hash Set</strong></td>
      <td>JavaScript <code>Set</code></td>
      <td>Maintains the settled <code>visited</code> set to prevent redundant vertex processing and infinite cycles.</td>
      <td>Insert / Lookup: O(1)</td>
    </tr>
    <tr>
      <td><strong>Hash Map</strong></td>
      <td>JavaScript <code>Map</code></td>
      <td>Stores the shortest known tentative distances (<code>distances</code>) and predecessor vertices (<code>parent</code>) for path recovery.</td>
      <td>Access / Update: O(1)</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- 5. ALGORITHM / WORKING -->
<h2 class="section-title">5. Algorithm / Working</h2>

<h3>Working Principles of Dijkstra's Algorithm:</h3>
<ol>
  <li><strong>Initialization:</strong>
    <ul>
      <li>Set tentative distance $Dist[S] = 0$ for the source vertex $S$.</li>
      <li>Set $Dist[v] = \infty$ for all other vertices $v \in V \setminus \{S\}$.</li>
      <li>Insert $(S, 0)$ into the Binary Min-Heap.</li>
      <li>Initialize an empty <code>visited</code> set and an empty <code>parent</code> map.</li>
    </ul>
  </li>
  <li><strong>Extract-Min:</strong>
    <ul>
      <li>Extract the vertex $u$ with the minimum tentative distance from the Min-Heap.</li>
      <li>If $u$ is already present in <code>visited</code>, discard it (lazy deletion handling). Otherwise, mark $u$ as visited.</li>
    </ul>
  </li>
  <li><strong>Target Evaluation:</strong>
    <ul>
      <li>If $u == D$ (the target node), terminate early as the shortest path is guaranteed.</li>
    </ul>
  </li>
  <li><strong>Edge Relaxation:</strong>
    <ul>
      <li>For each outgoing edge $(u, v)$ with weight $w(u, v)$:</li>
      <li>If $v \notin \text{visited}$ and $Dist[u] + w(u, v) < Dist[v]$:
        <br>&bull; Update $Dist[v] = Dist[u] + w(u, v)$.
        <br>&bull; Record $\text{parent}[v] = u$.
        <br>&bull; Push $(v, Dist[v])$ into the Min-Heap.</li>
    </ul>
  </li>
  <li><strong>Path Reconstruction:</strong>
    <ul>
      <li>Backtrack from destination $D$ through $\text{parent}[D]$ to source $S$ and reverse the sequence to obtain the full route.</li>
    </ul>
  </li>
</ol>

<div class="diagram-box">
  <div style="font-weight: 700; color: #0f172a; margin-bottom: 10px;">Dijkstra's Algorithm Flowchart</div>
  <svg viewBox="0 0 700 210" style="max-width: 100%; height: auto; font-family: sans-serif; font-size: 11px;">
    <!-- Flowchart nodes -->
    <rect x="15" y="85" width="85" height="40" rx="5" fill="#e0e7ff" stroke="#4338ca" stroke-width="1.5"/>
    <text x="57" y="105" text-anchor="middle" fill="#312e81" font-weight="600">Start (S)</text>
    <text x="57" y="117" text-anchor="middle" fill="#4338ca" font-size="9px">Dist[S]=0</text>

    <line x1="100" y1="105" x2="135" y2="105" stroke="#64748b" stroke-width="2"/>

    <polygon points="195,75 255,105 195,135 135,105" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
    <text x="195" y="102" text-anchor="middle" fill="#92400e" font-weight="600">Is Heap</text>
    <text x="195" y="114" text-anchor="middle" fill="#92400e">Empty?</text>

    <!-- Branch Yes (Heap empty) -->
    <line x1="195" y1="75" x2="195" y2="35" stroke="#ef4444" stroke-width="2"/>
    <line x1="195" y1="35" x2="330" y2="35" stroke="#ef4444" stroke-width="2"/>
    <rect x="330" y="20" width="100" height="30" rx="4" fill="#fee2e2" stroke="#ef4444" stroke-width="1"/>
    <text x="380" y="38" text-anchor="middle" fill="#991b1b" font-weight="600">No Path Exists</text>

    <!-- Branch No -->
    <line x1="255" y1="105" x2="290" y2="105" stroke="#16a34a" stroke-width="2"/>
    <text x="272" y="97" fill="#16a34a" font-weight="700">NO</text>

    <rect x="290" y="80" width="115" height="50" rx="5" fill="#f8fafc" stroke="#64748b" stroke-width="1.5"/>
    <text x="347" y="102" text-anchor="middle" fill="#0f172a">Pop Min Node u</text>
    <text x="347" y="116" text-anchor="middle" fill="#64748b">from Min-Heap</text>

    <line x1="405" y1="105" x2="440" y2="105" stroke="#64748b" stroke-width="2"/>

    <polygon points="490,75 540,105 490,135 440,105" fill="#f1f5f9" stroke="#475569" stroke-width="1.5"/>
    <text x="490" y="102" text-anchor="middle" fill="#0f172a" font-weight="600">Is u == D?</text>
    <text x="490" y="114" text-anchor="middle" fill="#64748b">(Target)</text>

    <!-- Branch Yes (Target reached) -->
    <line x1="540" y1="105" x2="585" y2="105" stroke="#16a34a" stroke-width="2"/>
    <text x="560" y="97" fill="#16a34a" font-weight="700">YES</text>
    <rect x="585" y="85" width="105" height="40" rx="5" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
    <text x="637" y="105" text-anchor="middle" fill="#14532d" font-weight="700">Reconstruct</text>
    <text x="637" y="117" text-anchor="middle" fill="#166534" font-size="9px">Shortest Path</text>

    <!-- Branch No (Relaxation) -->
    <line x1="490" y1="135" x2="490" y2="175" stroke="#2563eb" stroke-width="2"/>
    <line x1="490" y1="175" x2="400" y2="175" stroke="#2563eb" stroke-width="2"/>
    <rect x="250" y="155" width="150" height="40" rx="5" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
    <text x="325" y="173" text-anchor="middle" fill="#1e40af" font-weight="600">Relax Outgoing Edges</text>
    <text x="325" y="185" text-anchor="middle" fill="#2563eb" font-size="9px">Update Dist & Push to Heap</text>

    <!-- Loop back to heap -->
    <line x1="250" y1="175" x2="195" y2="175" stroke="#2563eb" stroke-width="2"/>
    <line x1="195" y1="175" x2="195" y2="135" stroke="#2563eb" stroke-width="2"/>
  </svg>
</div>

<!-- 6. SOURCE CODE -->
<h2 class="section-title">6. Source Code</h2>
<p>Below is the complete, self-contained implementation of the core algorithmic components written in JavaScript (Node.js ES Modules):</p>

<h3>A. Binary Min-Heap Priority Queue Implementation (<code>MinHeap.js</code>)</h3>
<pre><code>export class MinHeap {
  constructor() {
    this.heap = [];
  }

  size() { return this.heap.length; }
  isEmpty() { return this.heap.length === 0; }

  push(element, priority, metadata = {}) {
    this.heap.push({ element, priority, metadata });
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.isEmpty()) return null;
    const min = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this._sinkDown(0);
    }
    return min;
  }

  _bubbleUp(index) {
    const item = this.heap[index];
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (item.priority >= this.heap[parentIdx].priority) break;
      this.heap[index] = this.heap[parentIdx];
      index = parentIdx;
    }
    this.heap[index] = item;
  }

  _sinkDown(index) {
    const length = this.heap.length;
    const item = this.heap[index];
    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let swap = null;

      if (left < length && this.heap[left].priority < item.priority) swap = left;
      if (right < length) {
        if ((swap === null && this.heap[right].priority < item.priority) ||
            (swap !== null && this.heap[right].priority < this.heap[swap].priority)) {
          swap = right;
        }
      }
      if (swap === null) break;
      this.heap[index] = this.heap[swap];
      index = swap;
    }
    this.heap[index] = item;
  }
}</code></pre>

<div class="page-break"></div>

<h3>B. Dijkstra's Shortest Path Algorithm (<code>dijkstra.js</code>)</h3>
<pre><code>import { MinHeap } from './MinHeap.js';

export function dijkstra(graph, startId, targetId) {
  const startTime = performance.now();

  if (!graph.hasNode(startId) || !graph.hasNode(targetId)) {
    throw new Error("Specified start or target node does not exist in graph.");
  }

  // Edge case: start node is the destination
  if (startId === targetId) {
    return {
      found: true,
      path: [startId],
      distanceKm: 0,
      nodesExplored: 1,
      executionTimeMs: 0
    };
  }

  const distances = new Map();
  const parent = new Map();
  const visited = new Set();
  const pq = new MinHeap();

  // Initialize all vertex distances to infinity
  for (const node of graph.getAllNodes()) {
    distances.set(node.id, Infinity);
  }
  distances.set(startId, 0);
  pq.push(startId, 0);

  // Traversal loop
  while (!pq.isEmpty()) {
    const { element: currentId } = pq.pop();

    if (visited.has(currentId)) continue;
    visited.add(currentId);

    // Early exit if destination reached
    if (currentId === targetId) break;

    const neighbors = graph.getNeighbors(currentId) || [];
    for (const edge of neighbors) {
      const neighborId = edge.target;
      const alt = distances.get(currentId) + edge.distanceKm;

      // Relaxation step
      if (alt < distances.get(neighborId)) {
        distances.set(neighborId, alt);
        parent.set(neighborId, { prevNode: currentId, edgeId: edge.id });
        pq.push(neighborId, alt);
      }
    }
  }

  if (!parent.has(targetId) && startId !== targetId) {
    return { found: false, message: "Target node is unreachable from start node." };
  }

  // Reconstruct path
  const path = [];
  let curr = targetId;
  while (curr) {
    path.unshift(curr);
    curr = parent.get(curr)?.prevNode;
  }

  return {
    found: true,
    path,
    distanceKm: Number(distances.get(targetId).toFixed(2)),
    nodesExplored: visited.size,
    executionTimeMs: Number((performance.now() - startTime).toFixed(2))
  };
}</code></pre>

<!-- 7. OUTPUT -->
<h2 class="section-title">7. Output & Execution Results</h2>

<h3>A. Test Suite Verification (12/12 Passing Tests)</h3>
<pre><code>=================================================
 MargDarshak DSA Verification & Acceptance Tests   
=================================================
[✔ PASS] [T1] A to E, Dijkstra (Path: A->C->F->E, Cost: 20)
[✔ PASS] [T2] A to D, Dijkstra (Path: A->C->D, Cost: 20)
[✔ PASS] [T3] A to E, A* with zero heuristic (Matches Dijkstra T1)
[✔ PASS] [T4] A to A (Path: [A], Cost: 0)
[✔ PASS] [T5] Disconnected node handling (returns found: false)
[✔ PASS] [T6] Graph rejects negative edge weights at startup
[✔ PASS] [T7] MinHeap: push 5, 1, 3 -> pops 1, 3, 5
[✔ PASS] [R1] Real Map: Delhi to Mumbai (NH48 Corridor; ~1472 km)
[✔ PASS] [R2] Real Map: Delhi to Chandigarh (NH44 via Panipat; ~248 km)
[✔ PASS] [R3] Real Map: Mumbai to Pune (Expressway Corridor; ~150 km)
[✔ PASS] [R4] Search optimality benchmark (100% compliance)
[✔ PASS] [R5] Highway penalty avoidance mode verification
-------------------------------------------------
Summary: 12/12 tests passed (100% Success)</code></pre>

<h3>B. Highway Corridor Route Calculations</h3>
<table>
  <thead>
    <tr>
      <th>Origin &rarr; Destination</th>
      <th>Distance (km)</th>
      <th>Corridor Classification</th>
      <th>Computed Shortest Vertex Sequence</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Delhi &rarr; Mumbai</strong></td>
      <td><strong>1,472 km</strong></td>
      <td>NH48 Western Golden Quadrilateral</td>
      <td><code>DEL &rarr; GGN &rarr; JAI &rarr; AJM &rarr; UDR &rarr; AMD &rarr; VAD &rarr; SRT &rarr; MUM</code></td>
    </tr>
    <tr>
      <td><strong>Delhi &rarr; Chandigarh</strong></td>
      <td><strong>248 km</strong></td>
      <td>NH44 Grand Trunk Road</td>
      <td><code>DEL &rarr; PNP &rarr; KNL &rarr; AMB &rarr; CHD</code></td>
    </tr>
    <tr>
      <td><strong>Mumbai &rarr; Pune</strong></td>
      <td><strong>150 km</strong></td>
      <td>Mumbai-Pune Expressway</td>
      <td><code>MUM &rarr; PNE</code></td>
    </tr>
    <tr>
      <td><strong>Delhi &rarr; Bengaluru</strong></td>
      <td><strong>2,174 km</strong></td>
      <td>NH44 North-South Corridor</td>
      <td><code>DEL &rarr; GGW &rarr; JHS &rarr; NGP &rarr; HYD &rarr; KRN &rarr; BLR</code></td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<h3>C. Live System Execution & Geospatial Interface</h3>
<div class="screenshot-container">
  <img src=""" + f'"{app_ss_b64}"' + """ alt="MargDarshak Live Execution Interface">
  <div class="screenshot-caption">Figure: MargDarshak High-Resolution Execution Interface running on Localhost (React + Leaflet + Express)</div>
</div>

<!-- 8. CONCLUSION -->
<h2 class="section-title">8. Conclusion</h2>
<p>
  The <strong>MargDarshak</strong> project establishes that foundational graph theory and data structures can be applied directly to solve complex, nationwide real-world transport engineering challenges:
</p>
<ul>
  <li><strong>Algorithmic Optimality:</strong> By pairing Dijkstra's algorithm with a custom Binary Min-Heap Priority Queue, the engine achieves a computational complexity of <code>O((V + E) log V)</code>, successfully finding shortest routes across 135+ cities and 207+ highway segments in under <strong>3 milliseconds</strong> on standard hardware.</li>
  <li><strong>Engineered from Scratch:</strong> Eliminates reliance on commercial third-party routing packages, validating full end-to-end control of graph initialization, edge relaxation, and path reconstruction.</li>
  <li><strong>Academic & Practical Relevance:</strong> MargDarshak bridges textbook data structures with an interactive geospatial user interface, demonstrating the practical power of clean computer science algorithms in real-world infrastructure.</li>
</ul>

</body>
</html>
"""

html_path = "/tmp/MargDarshak_Report.html"
pdf_path = "/Users/subhamkumar/Downloads/Coding/antigravity_files/ADSA_Project/MargDarshak_Project_Report.pdf"

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML written to {html_path}")

cmd = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--user-data-dir=/tmp/chrome-pdf-user-data",
    f"--print-to-pdf={pdf_path}",
    f"file://{html_path}"
]

res = subprocess.run(cmd, capture_output=True, text=True)
print("Return code:", res.returncode)

if os.path.exists(pdf_path):
    print(f"SUCCESS: Generated PDF at {pdf_path} (size: {os.path.getsize(pdf_path)} bytes)")
else:
    print("FAILED to generate PDF")

import os
import base64
import subprocess

LOGO_PATH = "/Users/subhamkumar/Downloads/Coding/antigravity_files/ADSA_Project/cu_logo.png"
SS_PATH = "/Users/subhamkumar/Downloads/Coding/antigravity_files/ADSA_Project/screenshot_main.png"
HTML_OUT = "/tmp/MargDarshak_CU_Report.html"
PDF_OUT = "/Users/subhamkumar/Downloads/Coding/antigravity_files/ADSA_Project/MargDarshak_Project_Report.pdf"

def get_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            ext = path.split('.')[-1]
            return f"data:image/{ext};base64," + base64.b64encode(f.read()).decode("utf-8")
    return ""

logo_b64 = get_b64(LOGO_PATH)
ss_b64 = get_b64(SS_PATH)

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>MargDarshak ADSA Project Report</title>
<style>
  @page {{
    size: A4;
    margin: 20mm 20mm 20mm 20mm;
    @bottom-center {{
      content: counter(page);
    }}
  }}

  body {{
    font-family: "Times New Roman", Times, serif;
    color: #000000;
    line-height: 1.35;
    margin: 0;
    padding: 0;
    font-size: 13pt;
  }}

  .page-break {{
    page-break-before: always;
  }}

  /* Cover Page */
  .cover-page {{
    text-align: center;
    height: 94vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 10px 0;
  }}

  .logo-box img {{
    max-width: 250px;
    height: auto;
  }}

  .cover-title {{
    font-size: 22pt;
    font-weight: bold;
    margin: 5px 0;
  }}

  .cover-on {{
    font-size: 11pt;
    font-weight: bold;
    margin: 4px 0;
  }}

  .cover-proj-title {{
    font-size: 17pt;
    font-weight: bold;
    margin: 6px 0;
  }}

  .cover-proj-subtitle {{
    font-size: 11pt;
    font-weight: bold;
    margin: 4px 0 16px 0;
    padding: 0 20px;
  }}

  .cover-sub {{
    font-size: 11pt;
    margin: 4px 0;
  }}

  .cover-degree {{
    font-size: 12pt;
    font-weight: bold;
    margin: 4px 0;
  }}

  .cover-dept {{
    font-size: 12pt;
    font-weight: bold;
    margin: 4px 0 16px 0;
  }}

  .cover-submitted {{
    font-size: 11.5pt;
    font-weight: bold;
    margin: 4px 0;
  }}

  .cover-names {{
    font-size: 11.5pt;
    margin: 3px 0;
  }}

  .cover-guide {{
    font-size: 11.5pt;
    font-weight: bold;
    margin: 12px 0 3px 0;
  }}

  .cover-guide-name {{
    font-size: 11.5pt;
    font-weight: bold;
    margin: 2px 0 12px 0;
  }}

  .cover-inst {{
    font-size: 12pt;
    font-weight: bold;
    margin: 3px 0;
  }}

  /* Headings */
  h1.chapter-title {{
    font-size: 14pt;
    font-weight: bold;
    text-align: center;
    margin-top: 15px;
    margin-bottom: 15px;
    text-transform: uppercase;
  }}

  h2.section-title {{
    font-size: 12pt;
    font-weight: bold;
    margin-top: 14px;
    margin-bottom: 6px;
  }}

  h3.table-title {{
    font-size: 10.5pt;
    font-weight: bold;
    margin-top: 12px;
    margin-bottom: 5px;
  }}

  p {{
    text-align: justify;
    margin: 6px 0;
    font-size: 11pt;
  }}

  ul {{
    margin: 6px 0;
    padding-left: 24px;
  }}

  li {{
    text-align: justify;
    font-size: 11pt;
    margin-bottom: 4px;
  }}

  /* Tables */
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 10pt;
  }}

  th, td {{
    border: 1px solid #777777;
    padding: 6px 8px;
    text-align: left;
  }}

  th {{
    background-color: #f2f2f2;
    font-weight: bold;
  }}

  .text-center {{
    text-align: center;
  }}

  .ss-container {{
    text-align: center;
    margin: 14px 0;
  }}

  .ss-container img {{
    max-width: 95%;
    height: auto;
    border: 1px solid #cccccc;
  }}

  .caption {{
    font-size: 10pt;
    font-weight: bold;
    text-align: center;
    margin-top: 6px;
  }}
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover-page">
  <div class="logo-box">
    {'<img src="' + logo_b64 + '" alt="Chandigarh University Logo">' if logo_b64 else ''}
  </div>

  <div class="cover-title">Project Report</div>
  <div class="cover-on">on</div>
  <div class="cover-proj-title">MargDarshak: Dynamic Graph Navigation Engine</div>
  <div class="cover-proj-subtitle">A Geospatial Shortest-Path Route Navigation System with Dijkstra Algorithm & Binary Min-Heap Implementation</div>

  <div class="cover-sub">Data Structures and Algorithms (DSA) – Mini Project</div>
  <div class="cover-sub">in partial fulfilment for the award of the degree of</div>
  <div class="cover-degree">BACHELOR OF ENGINEERING</div>
  <div class="cover-sub">IN</div>
  <div class="cover-dept">Computer Science and Engineering</div>

  <div class="cover-submitted">Submitted by:</div>
  <div class="cover-names">Subham Kumar – 25BCS10000</div>
  <div class="cover-sub">Course: B.E. Computer Science and Engineering</div>
  <div class="cover-sub">Semester: 3</div>

  <div class="cover-guide">Under the Guidance of</div>
  <div class="cover-guide-name">Er. Kapil (E18497)</div>

  <div class="cover-inst">INSTITUTE – UIE</div>
  <div class="cover-inst">Chandigarh University</div>
  <div class="cover-inst">Academic Session: 2025–2026</div>
</div>

<div class="page-break"></div>

<!-- INDEX -->
<h1 class="chapter-title">Index</h1>
<table>
  <thead>
    <tr>
      <th style="width: 12%; text-align: center;">S. No.</th>
      <th style="width: 73%;">Content</th>
      <th style="width: 15%; text-align: center;">Page No.</th>
    </tr>
  </thead>
  <tbody>
    <tr><td class="text-center"></td><td><strong>ABSTRACT</strong></td><td class="text-center">3</td></tr>
    <tr><td class="text-center"><strong>1</strong></td><td><strong>CHAPTER 1: INTRODUCTION</strong></td><td class="text-center">4</td></tr>
    <tr><td class="text-center">1.1</td><td>Background and Motivation</td><td class="text-center">4</td></tr>
    <tr><td class="text-center">1.2</td><td>Problem Statement</td><td class="text-center">4</td></tr>
    <tr><td class="text-center">1.3</td><td>Objectives and Scope</td><td class="text-center">4</td></tr>
    <tr><td class="text-center"><strong>2</strong></td><td><strong>CHAPTER 2: DSA BACKGROUND</strong></td><td class="text-center">5</td></tr>
    <tr><td class="text-center">2.1</td><td>Graph Representation (Adjacency List vs Adjacency Matrix)</td><td class="text-center">5</td></tr>
    <tr><td class="text-center">2.2</td><td>Priority Queue & Binary Min-Heap</td><td class="text-center">5</td></tr>
    <tr><td class="text-center">2.3</td><td>Dijkstra’s Single-Source Shortest Path Algorithm</td><td class="text-center">6</td></tr>
    <tr><td class="text-center">2.4</td><td>State Tracking Data Structures (Set & Map)</td><td class="text-center">6</td></tr>
    <tr><td class="text-center">2.5</td><td>Comparison of the Data Structures</td><td class="text-center">7</td></tr>
    <tr><td class="text-center"><strong>3</strong></td><td><strong>CHAPTER 3: DESIGN AND METHODOLOGY</strong></td><td class="text-center">8</td></tr>
    <tr><td class="text-center">3.1</td><td>Technologies Used</td><td class="text-center">8</td></tr>
    <tr><td class="text-center">3.2</td><td>System Architecture and Working Flow</td><td class="text-center">8</td></tr>
    <tr><td class="text-center">3.3</td><td>Data Structure Design and Operations</td><td class="text-center">9</td></tr>
    <tr><td class="text-center">3.4</td><td>Algorithm Complexity Analysis</td><td class="text-center">10</td></tr>
    <tr><td class="text-center"><strong>4</strong></td><td><strong>CHAPTER 4: IMPLEMENTATION, TESTING AND RESULTS</strong></td><td class="text-center">11</td></tr>
    <tr><td class="text-center">4.1</td><td>Implementation Components</td><td class="text-center">11</td></tr>
    <tr><td class="text-center">4.2</td><td>Test Cases and Results</td><td class="text-center">11</td></tr>
    <tr><td class="text-center">4.3</td><td>Screenshots and Observations</td><td class="text-center">13</td></tr>
    <tr><td class="text-center">4.4</td><td>Limitations</td><td class="text-center">15</td></tr>
    <tr><td class="text-center"><strong>5</strong></td><td><strong>CHAPTER 5: CONCLUSION AND FUTURE SCOPE</strong></td><td class="text-center">16</td></tr>
    <tr><td class="text-center">5.1</td><td>Conclusion</td><td class="text-center">16</td></tr>
    <tr><td class="text-center">5.2</td><td>Future Enhancements</td><td class="text-center">16</td></tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- ABSTRACT -->
<h1 class="chapter-title">Abstract</h1>
<p>
  <strong>MargDarshak</strong> (मार्गदर्शक — <em>The Visionary Pathfinder</em>) is an academic geospatial route calculation engine developed for the Advanced Data Structures and Algorithms (ADSA/DSA) course. The application translates India's extensive national highway infrastructure into an active, weighted topological graph comprising 135+ major vertices (cities/junctions) and 207+ bidirectional edges, covering the Golden Quadrilateral, North-South and East-West corridors, and regional arterial roads.
</p>
<p>
  The core algorithmic engine is engineered strictly from foundational computer science principles without relying on third-party routing or map black-box APIs. It implements Dijkstra's Single-Source Shortest Path Algorithm coupled with an array-based Binary Min-Heap Priority Queue. This pairing ensures an optimal time complexity of O((V + E) log V), delivering mathematical optimality and sub-3 millisecond computation times across nationwide highway corridors.
</p>
<p>
  The system architecture features a decoupled client-server structure: a lightweight Node.js/Express service that manages topological graph validation and algorithm execution, and an interactive React frontend that visualizes the nodes, weighted highway corridors, vehicle HUD telemetry, and camera angles. In this way, theoretical graph concepts, asymptotic complexity proofs, and real-world spatial navigation are unified in a single interactive learning platform.
</p>
<p>
  The primary objective of the project is to provide students and evaluators with a transparent, verifiable reference implementation of classical graph traversal algorithms applied to real physical road networks, bridging textbook theory with practical engineering.
</p>

<div class="page-break"></div>

<!-- CHAPTER 1 -->
<h1 class="chapter-title">CHAPTER 1: INTRODUCTION</h1>

<h2 class="section-title">1.1 Background and Motivation</h2>
<p>
  Data Structures and Algorithms form the foundation of computer science and modern software engineering. Among these, Graph Theory and Shortest Path Algorithms are indispensable in logistics, network routing, robotics, and geographic information systems (GIS). However, when shortest-path algorithms are taught purely through abstract textbook diagrams with 5 to 6 generic nodes, students often struggle to grasp their scalability and practical mechanics on large, real-world networks.
</p>
<p>
  Furthermore, modern commercial navigation tools (such as Google Maps or Mapbox) operate as proprietary cloud services with opaque routing heuristics. MargDarshak was conceptualized to eliminate this abstraction. By converting the real Indian National Highway network into a weighted topological graph and executing Dijkstra's algorithm from scratch with an array-based Binary Min-Heap, it provides a completely transparent, educational laboratory for studying graph operations.
</p>

<h2 class="section-title">1.2 Problem Statement</h2>
<p>
  To design, model, and implement an interactive, full-stack geospatial navigation engine that models India's national highway grid as a weighted directed graph, executes Dijkstra's Single-Source Shortest Path Algorithm from first principles using a custom Binary Min-Heap Priority Queue with O((V + E) log V) complexity, and visualizes the resulting route, distance telemetry, and vertex sequences on an interactive map interface.
</p>

<h2 class="section-title">1.3 Objectives and Scope</h2>
<p>The key objectives of the project are:</p>
<ul>
  <li>To model India's National Highway network with 135+ key junctions and 207+ highway segments with geographic accuracy.</li>
  <li>To implement Dijkstra's Shortest Path Algorithm entirely from scratch without external routing libraries.</li>
  <li>To construct an array-based Binary Min-Heap Priority Queue to achieve optimal O(log V) push and extract-min operations.</li>
  <li>To implement an Adjacency List representation using Hash Maps for O(V + E) memory efficiency.</li>
  <li>To provide a responsive web interface for selecting source and destination cities and viewing real-time route telemetry.</li>
  <li>To validate algorithm correctness through a rigorous automated test suite of 12 acceptance unit and real-map benchmark tests.</li>
</ul>
<p>
  <strong>Scope:</strong> The project encompasses the complete algorithm implementation, graph data structure validation, REST API backend, and interactive UI. It focuses on single-source deterministic shortest paths under non-negative highway weights.
</p>

<div class="page-break"></div>

<!-- CHAPTER 2 -->
<h1 class="chapter-title">CHAPTER 2: DSA BACKGROUND</h1>
<p>This chapter reviews the foundational Data Structures and Algorithms implemented in MargDarshak.</p>

<h2 class="section-title">2.1 Graph Representation (Adjacency List vs Adjacency Matrix)</h2>
<p>
  A graph G = (V, E) is a non-linear data structure consisting of a set of vertices V (representing cities or junctions) and edges E (representing physical highways). In transport networks, graphs are sparse because each city connects to only 3 to 4 highway junctions on average (degree &lt;&lt; V).
</p>
<p>
  While an Adjacency Matrix requires O(V&sup2;) space (which would consume 135&sup2; = 18,225 entries, over 95% of which are zeros), MargDarshak utilizes an Adjacency List representation. Stored as Map&lt;NodeId, Edge[]&gt;, it requires only O(V + E) space (approx. 342 entries), enabling instant O(degree(u)) neighbor iteration during edge relaxation.
</p>

<h2 class="section-title">2.2 Priority Queue & Binary Min-Heap</h2>
<p>
  A Priority Queue is an abstract data type where each element has a priority, and the element with the lowest priority value is served first. Implementing the Priority Queue with an unsorted array requires O(V) time to find the minimum element, yielding an overall quadratic runtime of O(V&sup2;).
</p>
<p>
  MargDarshak implements an array-based Binary Min-Heap from scratch. In a Min-Heap, the root is always the minimum element, and the parent of any element at index i is at floor((i - 1) / 2), while its children are at 2i + 1 and 2i + 2. Insertion uses bubble-up in O(log V) time, and extract-min uses sink-down in O(log V) time.
</p>

<h2 class="section-title">2.3 Dijkstra’s Single-Source Shortest Path Algorithm</h2>
<p>
  Dijkstra's Algorithm is a greedy graph search algorithm that finds the shortest path between a source vertex and all other vertices in a weighted graph with non-negative edge weights. It maintains a set of settled vertices whose shortest distances are finalized. In each iteration, the vertex u with the smallest tentative distance is extracted from the Min-Heap, and all its outgoing edges (u, v) are relaxed:
</p>
<p>
  <em>Relaxation Condition:</em> If Dist[u] + weight(u, v) &lt; Dist[v], then Dist[v] = Dist[u] + weight(u, v), Parent[v] = u, and (v, Dist[v]) is inserted into the Min-Heap.
</p>

<h2 class="section-title">2.4 State Tracking Data Structures (Set & Map)</h2>
<p>
  To support Dijkstra's execution, three hash-based auxiliary data structures are maintained: (1) visited Set for O(1) duplicate settlement prevention; (2) distances Map for O(1) tentative distance lookups; and (3) parent Map for recording predecessor pointers used in backtracking the final path.
</p>

<h2 class="section-title">2.5 Comparison of the Data Structures</h2>
<h3 class="table-title">Table 2.1: Comparison of Data Structures in MargDarshak</h3>
<table>
  <thead>
    <tr>
      <th>Data Structure</th>
      <th>Type</th>
      <th>Memory Complexity</th>
      <th>Primary Operation & Complexity</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Adjacency List</strong></td>
      <td>Graph Container</td>
      <td>O(V + E)</td>
      <td>Neighbor Lookup: O(deg(u)) avg</td>
    </tr>
    <tr>
      <td><strong>Adjacency Matrix</strong></td>
      <td>Graph Container</td>
      <td>O(V&sup2;)</td>
      <td>Neighbor Lookup: O(V) (Not Used)</td>
    </tr>
    <tr>
      <td><strong>Binary Min-Heap</strong></td>
      <td>Priority Queue</td>
      <td>O(V)</td>
      <td>Push / Extract-Min: O(log V)</td>
    </tr>
    <tr>
      <td><strong>Unsorted Array</strong></td>
      <td>Priority Queue</td>
      <td>O(V)</td>
      <td>Extract-Min: O(V) (Inefficient)</td>
    </tr>
    <tr>
      <td><strong>Hash Set</strong></td>
      <td>Settled Nodes</td>
      <td>O(V)</td>
      <td>Lookup / Insert: O(1) avg</td>
    </tr>
    <tr>
      <td><strong>Hash Map</strong></td>
      <td>Distances / Parents</td>
      <td>O(V)</td>
      <td>Key Access / Update: O(1) avg</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- CHAPTER 3 -->
<h1 class="chapter-title">CHAPTER 3: DESIGN AND METHODOLOGY</h1>

<h2 class="section-title">3.1 Technologies Used</h2>
<h3 class="table-title">Table 3.1: Technologies used in the project</h3>
<table>
  <thead>
    <tr>
      <th>Technology</th>
      <th>Role in Project</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Node.js & Express</strong></td>
      <td>Backend REST API server managing graph data structures, validation, and Dijkstra execution.</td>
    </tr>
    <tr>
      <td><strong>JavaScript (ES6+)</strong></td>
      <td>Implementation of the core Binary MinHeap and Dijkstra algorithm from foundational principles.</td>
    </tr>
    <tr>
      <td><strong>React 18 & TypeScript</strong></td>
      <td>Client-side interactive user interface, state management, and real-time route query dispatch.</td>
    </tr>
    <tr>
      <td><strong>Vite 5</strong></td>
      <td>High-performance frontend build pipeline and local development server.</td>
    </tr>
    <tr>
      <td><strong>Tailwind CSS</strong></td>
      <td>Modern glassmorphic styling, responsive layout, and dark/light UI theme controls.</td>
    </tr>
    <tr>
      <td><strong>Leaflet / WebGL Maps</strong></td>
      <td>Geospatial coordinate rendering, road network polylines, and marker visualization.</td>
    </tr>
  </tbody>
</table>

<h2 class="section-title">3.2 System Architecture and Working Flow</h2>
<p>MargDarshak operates as a decoupled architecture where user queries flow from the UI to the routing engine:</p>
<p>
  1. <strong>Request Phase:</strong> The user selects origin and destination vertices (e.g., Delhi to Mumbai) in the Control Panel.<br>
  2. <strong>Processing Phase:</strong> The server loads the topological graph into the Adjacency List, initializes tentative distances to infinity, and pushes the source into the Binary Min-Heap.<br>
  3. <strong>Relaxation Loop:</strong> Vertices with minimum cumulative distance are popped and settled, updating neighbor distances.<br>
  4. <strong>Path Reconstruction:</strong> Upon reaching the destination, the engine backtracks through the parent map and returns the ordered vertex sequence and total highway distance.
</p>

<h2 class="section-title">3.3 Data Structure Design and Operations</h2>
<h3 class="table-title">Table 3.2: Implemented Data Structure Operations</h3>
<table>
  <thead>
    <tr>
      <th>Module</th>
      <th>Methods / Operations Implemented</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>MinHeap.js</strong></td>
      <td>push(el, priority), pop(), _bubbleUp(i), _sinkDown(i), isEmpty()</td>
      <td>Binary Min-Heap operations maintaining heap order invariant in logarithmic time.</td>
    </tr>
    <tr>
      <td><strong>Graph.js</strong></td>
      <td>addNode(n), addEdge(e), getNeighbors(id), hasNode(id), getAllNodes()</td>
      <td>Adjacency List graph structure with strict non-negative edge validation.</td>
    </tr>
    <tr>
      <td><strong>dijkstra.js</strong></td>
      <td>dijkstra(graph, startId, targetId)</td>
      <td>Executes greedy shortest-path search and path reconstruction from parent pointers.</td>
    </tr>
  </tbody>
</table>

<h2 class="section-title">3.4 Algorithm Complexity Analysis</h2>
<h3 class="table-title">Table 3.3: Asymptotic Complexity Analysis</h3>
<table>
  <thead>
    <tr>
      <th>Component / Operation</th>
      <th>Time Complexity</th>
      <th>Space Complexity</th>
      <th>Mathematical Justification</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Graph Construction</strong></td>
      <td>O(V + E)</td>
      <td>O(V + E)</td>
      <td>Inserting 135 nodes and 207 edges into Hash Maps.</td>
    </tr>
    <tr>
      <td><strong>Heap Insertion (Push)</strong></td>
      <td>O(log V)</td>
      <td>O(1) aux</td>
      <td>Bubble-up traversal along binary tree height.</td>
    </tr>
    <tr>
      <td><strong>Heap Extract-Min (Pop)</strong></td>
      <td>O(log V)</td>
      <td>O(1) aux</td>
      <td>Sink-down traversal along binary tree height.</td>
    </tr>
    <tr>
      <td><strong>Total Dijkstra Execution</strong></td>
      <td>O((V + E) log V)</td>
      <td>O(V)</td>
      <td>V extract-min operations + E edge relaxations.</td>
    </tr>
    <tr>
      <td><strong>Path Reconstruction</strong></td>
      <td>O(L) &le; O(V)</td>
      <td>O(L)</td>
      <td>Backtracking L hops from target to source.</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- CHAPTER 4 -->
<h1 class="chapter-title">CHAPTER 4: IMPLEMENTATION, TESTING AND RESULTS</h1>

<h2 class="section-title">4.1 Implementation Components</h2>
<h3 class="table-title">Table 4.1: Implementation components and their roles</h3>
<table>
  <thead>
    <tr>
      <th>Component</th>
      <th>Role in MargDarshak</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>User Interface (React)</strong></td>
      <td>Header with command palette, Control Panel for origin/destination city selection, and route summary HUD.</td>
    </tr>
    <tr>
      <td><strong>Map Viewer (Leaflet)</strong></td>
      <td>Renders 135+ city markers and dynamic highway polylines with 2D/3D camera perspectives.</td>
    </tr>
    <tr>
      <td><strong>Algorithm Engine (Node.js)</strong></td>
      <td>Houses pure Dijkstra and MinHeap algorithms, executing route computations in sub-3ms latency.</td>
    </tr>
    <tr>
      <td><strong>Graph Data Repository</strong></td>
      <td>Stores 135 Indian vertices and 207 weighted national highway segments in graph.json.</td>
    </tr>
  </tbody>
</table>

<h2 class="section-title">4.2 Test Cases and Results</h2>
<h3 class="table-title">Table 4.2: Automated Test Cases and Acceptance Results</h3>
<table>
  <thead>
    <tr>
      <th style="width: 8%;">No.</th>
      <th style="width: 25%;">Test Case Description</th>
      <th style="width: 25%;">Input / Action</th>
      <th style="width: 32%;">Expected Result</th>
      <th style="width: 10%;">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>T1</td><td>Synthetic Shortest Path</td><td>Query A to E on test graph</td><td>Path A-&gt;C-&gt;F-&gt;E with Cost: 20</td><td><strong>PASS</strong></td></tr>
    <tr><td>T2</td><td>Intermediate Routing</td><td>Query A to D on test graph</td><td>Path A-&gt;C-&gt;D with Cost: 20</td><td><strong>PASS</strong></td></tr>
    <tr><td>T3</td><td>Zero Heuristic Match</td><td>A* with h=0 vs Dijkstra</td><td>Identical Path & Cost: 20</td><td><strong>PASS</strong></td></tr>
    <tr><td>T4</td><td>Identical Source/Target</td><td>Query A to A</td><td>Path: [A], Distance: 0</td><td><strong>PASS</strong></td></tr>
    <tr><td>T5</td><td>Disconnected Node</td><td>Query connected A to isolated G</td><td>found: false, clean message</td><td><strong>PASS</strong></td></tr>
    <tr><td>T6</td><td>Negative Weight Rejection</td><td>Insert edge with weight = -5</td><td>Throws Invariant Error</td><td><strong>PASS</strong></td></tr>
    <tr><td>T7</td><td>MinHeap Ordering Check</td><td>Push 5, 1, 3 into MinHeap</td><td>Pops in order: 1, 3, 5</td><td><strong>PASS</strong></td></tr>
    <tr><td>R1</td><td>Delhi to Mumbai Corridor</td><td>Real Query DEL -&gt; MUM (NH48)</td><td>Distance: 1,472 km via NH48</td><td><strong>PASS</strong></td></tr>
    <tr><td>R2</td><td>Delhi to Chandigarh</td><td>Real Query DEL -&gt; CHD (NH44)</td><td>Distance: 248 km via NH44</td><td><strong>PASS</strong></td></tr>
    <tr><td>R3</td><td>Mumbai to Pune Expressway</td><td>Real Query MUM -&gt; PNE</td><td>Distance: 150 km via Expressway</td><td><strong>PASS</strong></td></tr>
    <tr><td>R4</td><td>Search Optimality Check</td><td>Run 8 national highway routes</td><td>100% mathematical optimality</td><td><strong>PASS</strong></td></tr>
    <tr><td>R5</td><td>Highway Penalty Mode</td><td>Run with avoidHighways=true</td><td>Redirects to local roads</td><td><strong>PASS</strong></td></tr>
  </tbody>
</table>

<h2 class="section-title">4.3 Screenshots and Observations</h2>
<p>The screenshot below illustrates the execution of MargDarshak running live on the local development environment.</p>

<div class="ss-container">
  {'<img src="' + ss_b64 + '" alt="MargDarshak Live Execution Interface">' if ss_b64 else ''}
  <div class="caption">Figure 4.1: MargDarshak Live Execution Interface running on Localhost (React + Leaflet + Express)</div>
</div>

<h3 class="table-title">Observations:</h3>
<ul>
  <li>In the graph model, the Adjacency List correctly preserves all 135 cities and 207 weighted national highway corridors without missing links.</li>
  <li>The Binary Min-Heap Priority Queue strictly pops vertices in ascending order of tentative distance, preventing redundant edge scans.</li>
  <li>On the Delhi to Mumbai corridor, Dijkstra selects the canonical NH48 highway sequence (DEL -&gt; GGN -&gt; JAI -&gt; AJM -&gt; UDR -&gt; AMD -&gt; VAD -&gt; SRT -&gt; MUM) totaling 1,472 km in under 2.5 milliseconds.</li>
  <li>On the Delhi to Chandigarh corridor, the algorithm selects the GT Road NH44 sequence (DEL -&gt; PNP -&gt; KNL -&gt; AMB -&gt; CHD) totaling 248 km.</li>
  <li>The automated test suite achieves a 100% pass rate (12/12) across both synthetic edge-case tests and nationwide highway benchmarks.</li>
</ul>

<h2 class="section-title">4.4 Limitations</h2>
<p>
  1. <strong>Static Edge Speeds:</strong> The current highway graph relies on published national highway speed categories rather than live GPS vehicle congestion feeds.<br>
  2. <strong>Single-Criterion Dijkstra:</strong> Route calculation optimizes primarily for shortest physical distance (km) or static travel time (min), without multi-objective Pareto optimization (e.g., fuel vs tolls).<br>
  3. <strong>Simplified Terrain Elevation:</strong> While mountain passes (such as NH5 and NH3) reflect lower travel speeds, 3D vertical topographical elevation is not factored into the weight function.
</p>

<div class="page-break"></div>

<!-- CHAPTER 5 -->
<h1 class="chapter-title">CHAPTER 5: CONCLUSION AND FUTURE SCOPE</h1>

<h2 class="section-title">5.1 Conclusion</h2>
<p>
  The MargDarshak project successfully demonstrates the practical implementation of classical Graph Theory and Single-Source Shortest Path Algorithms applied to India's National Highway network.
</p>
<p>
  By implementing both the Adjacency List graph structure and the Binary Min-Heap Priority Queue from foundational principles in JavaScript, the project eliminates reliance on proprietary routing black-boxes while achieving the optimal theoretical time complexity of O((V + E) log V). Nationwide route calculations across 135 cities execute in under 3 milliseconds with 100% mathematical optimality.
</p>
<p>
  Overall, the project bridges theoretical computer science education with modern web technologies, providing students with an interactive, transparent, and visually engaging platform to explore Data Structures and Algorithms.
</p>

<h2 class="section-title">5.2 Future Enhancements</h2>
<p>
  1. <strong>Live Traffic API Integration:</strong> Ingest dynamic traffic telemetry to adjust edge weights in real-time based on actual congestion.<br>
  2. <strong>Multi-Modal Transit Support:</strong> Extend the graph to include Indian Railways passenger corridors and domestic flight networks for multi-modal journey planning.<br>
  3. <strong>Multi-Stop Traveling Salesperson Problem (TSP):</strong> Implement Christofides or Branch-and-Bound algorithms for multi-city delivery route optimization.<br>
  4. <strong>Contraction Hierarchies:</strong> Implement highway node hierarchy contraction for sub-millisecond query responses across continental-scale road networks.
</p>

</body>
</html>
"""

with open(HTML_OUT, "w", encoding="utf-8") as f:
    f.write(html)

cmd = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--user-data-dir=/tmp/chrome-pdf-user-data",
    f"--print-to-pdf={PDF_OUT}",
    f"file://{HTML_OUT}"
]

res = subprocess.run(cmd, capture_output=True, text=True)
print("PDF Return code:", res.returncode)
if os.path.exists(PDF_OUT):
    print(f"SUCCESS: Saved matching PDF to {PDF_OUT} (size: {os.path.getsize(PDF_OUT)} bytes)")

<div align="center">

# 🧭 MargDarshak (मार्गदर्शक)
### *Indian Highway Engine & Graph Navigation System*

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Tests: 12/12 Passing](https://img.shields.io/badge/Tests-12%2F12%20Passing%20(100%25)-emerald.svg)](#-verification-test-suite)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%205-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Maps](https://img.shields.io/badge/Maps-Interactive%20Geospatial%20Map-4285F4?logo=google-maps&logoColor=white)](https://developers.google.com/maps)

<p align="center">
  <b>MargDarshak</b> (मार्गदर्शक — <i>The Visionary Pathfinder & Guide</i>) bridges academic Data Structures & Algorithms with real-world geospatial navigation. It translates India's physical national highway grid into an active weighted topological graph, executing Dijkstra's algorithm from scratch with a custom Binary Min-Heap Priority Queue.
</p>

[Key Features](#-key-features) • [DSA From Scratch](#-data-structures--algorithms-from-scratch) • [Verification Tests](#-verification-test-suite) • [Quick Start](#-quick-start) • [Viva Guide](#-viva--interview-cheatsheet)

---

</div>

## 🌟 Key Features

### 1. 🇮🇳 All-India National Highway Graph
- **135+ Strategic Vertices & 207+ Weighted Highway Edges** covering:
  - **The Golden Quadrilateral:** NH48 (Delhi–Mumbai–Bengaluru–Chennai), NH16 (Chennai–Kolkata), NH19 (Kolkata–Delhi).
  - **North–South & East–West Corridors:** NH44 (Srinagar–Kanyakumari), NH27 (Porbandar–Silchar).
  - **Mountain & Ghat Highway Corridors:** NH5 (Kalka–Shimla–Kinnaur), NH3 (Chandigarh–Mandi–Kullu–Manali).
  - **Regional Tricity Urban Grid:** Chandigarh, Mohali, Panchkula, and Punjab arterial roads.

### 2. ⚡ Pure Dijkstra's Algorithm (Engineered from Scratch)
- Implemented from foundational computer science principles without third-party algorithm libraries:
  - **Priority Queue Min-Heap** with $\mathcal{O}(\log V)$ push/pop and $\mathcal{O}(1)$ peek.
  - **Overall Search Time Complexity:** $\mathcal{O}((V + E) \log V)$ instead of the naïve array-based $\mathcal{O}(V^2)$.
  - **Dual Optimization Metrics:**
    - 📏 **Shortest Distance (km):** Minimizes total geographic highway travel distance.
    - ⏱️ **Fastest Travel Time (min):** Factors road classes (Expressways @ 100–120 km/h, National Highways @ 80 km/h, Mountain Ghats @ 30–40 km/h).

### 3. 🎮 Interactive Geospatial Map & Vehicle HUD
- **Real-Time Polyline Rendering:** Visualizes active route corridors across the subcontinent with high-contrast road styling.
- **Multimodal Simulation:** Switch between **Car**, **Sportbike**, and **Walking** travel speeds with smooth interpolated vehicle movement along polyline coordinates.
- **Trip Telemetry HUD:** Displays total driving distance (km), estimated time of arrival (ETA), and settled node counts.

### 4. 🌓 Adaptive Glassmorphic Design System
- Built with modern glassmorphism, backdrop filters, and custom Framer Motion spring physics.
- High-contrast **Dark Mode** and **Light Mode** styling with the custom illuminated **MargDarshak vector emblem** (Saffron & Emerald facets symbolizing the path and the navigator).

---

## 🧠 Data Structures & Algorithms (From Scratch)

MargDarshak is designed as a canonical reference implementation for **Advanced Data Structures & Algorithms (ADSA)**:

### 1. Graph Representation: Adjacency List
- **File:** [`server/src/algorithms/Graph.js`](server/src/algorithms/Graph.js)
- **Data Structure:** `Map<NodeId, Array<EdgeDescriptor>>`
- **Space Complexity:** $\mathcal{O}(V + E)$ — exponentially more memory-efficient than an Adjacency Matrix ($\mathcal{O}(V^2)$) for sparse physical road networks where average vertex degree $\bar{d} \approx 3\text{--}4$.
- **Startup Invariant Validation:** Explicitly validates graph integrity on initialization. Any edge with distance $\le 0$ or speed $\le 0$ is rejected (preventing negative-weight infinite loops).

### 2. Binary Min-Heap Priority Queue
- **File:** [`server/src/algorithms/MinHeap.js`](server/src/algorithms/MinHeap.js)
- **Data Structure:** Array-backed binary heap:
  - Parent index: $\lfloor(i - 1) / 2\rfloor$
  - Left child: $2i + 1$, Right child: $2i + 2$
- **Operations:**
  - `push(element, priority)`: $\mathcal{O}(\log V)$ via bubble-up.
  - `pop()`: $\mathcal{O}(\log V)$ via bubble-down (extracts minimum distance node).
  - `peek()`: $\mathcal{O}(1)$ inspects current frontier root.

### 3. Dijkstra's Algorithm Engine
- **File:** [`server/src/algorithms/Dijkstra.js`](server/src/algorithms/Dijkstra.js)
- **Greedy Invariant:** Settles the shortest distance to a node the moment it is popped from the priority queue.
- **Time Complexity:** $\mathcal{O}((V + E) \log V)$ using Min-Heap priority queue.
- **Space Complexity:** $\mathcal{O}(V)$ for distance map, parent tracking, and heap state.
- **Path Reconstruction:** Traces parent pointers from destination back to source in $\mathcal{O}(L) \le \mathcal{O}(V)$ steps and reverses the sequence.

### 4. Held-Karp Bitmask DP for Multi-Stop TSP
- **File:** [`server/src/algorithms/MultiStop.js`](server/src/algorithms/MultiStop.js)
- For multi-destination delivery or road trips ($k$ stops), checking all permutations ($k!$) is intractable.
- **Recurrence Relation:**
  $$\text{dp}(\text{mask}, u) = \min_{v \in \text{mask} \setminus \{u\}} \left[ \text{dp}(\text{mask} \setminus \{u\}, v) + \text{dist}(v, u) \right]$$
- **Time Complexity:** $\mathcal{O}(2^k \cdot k^2)$, optimizing up to 8 waypoints in $< 1 \text{ ms}$.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Frontend: React 18 + Vite                       │
│  · Interactive Geospatial Map Viewer & Polyline Renderer               │
│  · Control Panel: Origin/Destination Pickers, Multimodal Vehicles      │
│  · Real-Time Step Simulation Engine (Play / Pause / Speed Slider)       │
│  · Glassmorphic UI with Adaptive Light & Dark Modes                    │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ JSON REST API
┌───────────────────────────────────▼────────────────────────────────────┐
│                    Backend: Node.js + Express (Port 5001)              │
│  · POST /api/route         (Dijkstra execution on 135-node graph)      │
│  · GET  /api/graph         (Full 135-node & 207-edge topological mesh) │
│  · GET  /api/nodes/nearest (Geo-snapping GPS coords to nearest node)   │
│  · POST /api/multistop     (Held-Karp bitmask DP for TSP ordering)     │
│  · GET  /api/tests/run     (Automated verification test runner)        │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                             Core Engine                                │
│  · Graph.js        · MinHeap.js        · Dijkstra.js       · graph.json│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Verification Test Suite

MargDarshak includes a comprehensive automated test suite verifying mathematical correctness and real-world benchmark corridors:

```bash
npm test
```

### Results: 12/12 Tests Passing (100%)

```text
=================================================
 MargDarshak DSA Verification & Acceptance Tests   
=================================================

[✔ PASS] [T1] A to E, Dijkstra (Path: A->C->F->E, Cost: 20)
[✔ PASS] [T2] A to D, Dijkstra (Path: A->C->D, Cost: 20)
[✔ PASS] [T3] A to E, A* with zero heuristic (Matches Dijkstra T1)
[✔ PASS] [T4] A to A (Path: [A], Cost: 0)
[✔ PASS] [T5] A to G (Disconnected node G, returns found: false)
[✔ PASS] [T6] Graph rejects negative edge weights at add/load time
[✔ PASS] [T7] MinHeap: push 5, 1, 3 -> pops 1, 3, 5
[✔ PASS] [R1] Real Map: Delhi to Mumbai (NH48 Western Corridor; ~1450-1500 km)
[✔ PASS] [R2] Real Map: Delhi to Chandigarh (NH44 via Panipat, Karnal, Ambala; ~248 km)
[✔ PASS] [R3] Real Map: Mumbai to Pune (Mumbai-Pune Expressway; ~150 km)
[✔ PASS] [R4] Search Frontier Efficiency Benchmark (100% win/tie ratio)
[✔ PASS] [R5] Avoid Highways: Penalty mode increases cost or redirects to local roads

-------------------------------------------------
Summary: 12/12 tests passed (100%)
-------------------------------------------------
```

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (v9 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/Subham-531/MargDarshak.git
cd MargDarshak
```

### 2. Install Dependencies
```bash
# Install root & workspace packages
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### 3. Start the Application
Run both backend API and frontend Vite dev server concurrently:
```bash
npm start
```
- **Frontend UI:** `http://localhost:3000`
- **Backend API:** `http://localhost:5001`

---

## 📂 Project Structure

```text
MargDarshak/
├── client/                     # Frontend React + TypeScript application
│   ├── public/                 # Favicons & public static assets
│   ├── src/
│   │   ├── components/         # UI components
│   │   │   ├── ControlPanel.tsx   # Sidebar: origin/destination picker, route HUD
│   │   │   ├── Header.tsx         # Top bar: MargDarshak logo, stats, theme toggle
│   │   │   ├── MapViewer.tsx      # Geospatial map viewer, markers & polyline HUD
│   │   │   ├── MargDarshakLogo.tsx# Custom SVG vector emblem (Saffron & Emerald)
│   │   │   ├── TestRunnerModal.tsx# Automated test benchmark modal
│   │   │   └── VivaGuideModal.tsx # DSA concept and theory guide modal
│   │   ├── lib/                # Utilities, API client, motion physics
│   │   ├── App.tsx             # Root application controller & state orchestrator
│   │   ├── index.css           # Tailwind CSS, light & dark theme styling
│   │   └── main.tsx            # React application entry point
│   ├── index.html              # HTML shell & metadata
│   └── vite.config.js          # Vite build configuration
│
├── server/                     # Backend Node.js + Express API
│   ├── src/
│   │   ├── algorithms/         # DSA algorithms from scratch
│   │   │   ├── Dijkstra.js        # Dijkstra's shortest path algorithm from scratch
│   │   │   ├── Graph.js           # Adjacency list graph representation
│   │   │   ├── MinHeap.js         # Binary min-heap priority queue
│   │   │   └── MultiStop.js       # Held-Karp Bitmask DP for TSP
│   │   ├── data/
│   │   │   └── graph.json         # 135 Indian cities & 207 highway edges dataset
│   │   ├── tests/
│   │   │   ├── runTests.js        # CLI test execution script
│   │   │   └── testSuite.js       # Canonical T1–T7 and R1–R5 test definitions
│   │   ├── utils/
│   │   │   ├── geo.js             # Haversine distance & nearest-node snapping
│   │   │   └── graphLoader.js     # Graph JSON loader & validator
│   │   └── server.js           # Express API server (port 5001)
│
├── package.json                # Root package metadata & unified scripts
├── startApp.js                 # Concurrent dev runner script
└── vercel.json                 # Production deployment configuration
```

---

## 🎓 Viva & Interview Cheatsheet

When presenting MargDarshak in a university viva, evaluation, or technical interview, here are the key questions you can answer with authority:

<details>
<summary><b>Q1: Why did you choose an Adjacency List over an Adjacency Matrix?</b></summary>

> **Answer:** Physical road networks are **sparse graphs** where each intersection or city typically connects to only 2 to 4 major highways ($E \ll V^2$). For our 135-node graph, an Adjacency Matrix would allocate $135 \times 135 = 18,225$ cells ($\mathcal{O}(V^2)$ memory), with over 98% of cells holding zeros or $\infty$. An Adjacency List consumes only $\mathcal{O}(V + E)$ space, drastically reducing memory footprint and allowing neighbor iteration in $\mathcal{O}(\text{degree}(v))$ time instead of $\mathcal{O}(V)$.
</details>

<details>
<summary><b>Q2: What is the time complexity of Dijkstra with your Min-Heap, and why is it better than an array?</b></summary>

> **Answer:** With a simple array, finding the minimum distance node takes $\mathcal{O}(V)$, leading to $\mathcal{O}(V^2)$ overall time. Using our custom Binary Min-Heap:
> - Extract-Min (`pop`): Called $V$ times &rarr; $\mathcal{O}(V \log V)$.
> - Edge Relaxation (`push` / decrease-key): Called at most $E$ times &rarr; $\mathcal{O}(E \log V)$.
> - **Total Time Complexity:** $\mathcal{O}((V + E) \log V)$. For sparse graphs where $E \approx \mathcal{O}(V)$, this runs in near-linear $\mathcal{O}(V \log V)$ time.
</details>

<details>
<summary><b>Q3: Why does Dijkstra fail on negative edge weights, and how does MargDarshak safeguard against this?</b></summary>

> **Answer:** Dijkstra is a **greedy algorithm**. It permanently settles a node's shortest path the moment it is popped from the priority queue, assuming no future edge can decrease that distance. A negative edge weight violates this invariant because a longer path could become shorter later. In MargDarshak, edge weights represent physical distance (km) or travel time (min), which can never be negative. Furthermore, our `Graph.js` loader explicitly validates every edge upon server startup and throws a fatal error if any weight is $\le 0$ (verified by automated test **T6**).
</details>

<details>
<summary><b>Q4: How does the system reconstruct the shortest path if Dijkstra only records distances?</b></summary>

> **Answer:** In `Dijkstra.js`, during every successful edge relaxation where a shorter path to neighbor $v$ through node $u$ is found, we record $u$ as the predecessor: `parent.set(v, u)`. Once the destination node is settled, the algorithm backtracks from target $D$ through `parent.get(curr)` until reaching the source $S$, and reverses the array to yield the complete ordered sequence of highway cities in $\mathcal{O}(L) \le \mathcal{O}(V)$ time.
</details>

---

## 📜 License

This project is licensed under the [ISC License](LICENSE).
Created for academic demonstration, algorithmic research, and educational excellence.

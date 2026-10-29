# PathScope — Chandigarh & Himachal Route Planner

**Author:** Manas Gupta · B.E. Computer Science & Engineering, Chandigarh University  
**Subject:** Data Structures & Algorithms (DSA)  
**Specification:** Product Requirements Document (PRD) v1.0  

---

## 1. Overview & Problem Statement

In conventional Data Structures & Algorithms (DSA) courses, graph algorithms are taught on abstract node-and-edge diagrams ($A, B, C, D$). Students calculate Dijkstra by hand on paper or dry-run slides, but rarely see how real-world navigation engines translate a physical highway and road network into a weighted graph.

**PathScope** combines Google Maps driving directions for real road routes with a weighted graph of **48 locations and 65 edges** for DSA demonstrations across **Chandigarh, the Tricity region, and Himachal Pradesh**. The project implements:
- **Graph as an Adjacency List** from scratch.
- **Binary Min-Heap Priority Queue** from scratch.
- **Dijkstra’s Shortest Path Algorithm** from scratch.
- **A\* Search with an Admissible Haversine Heuristic** from scratch for both distance and travel time.
- **Held-Karp Bitmask Dynamic Programming** ($O(2^k \cdot k^2)$) for optimal multi-stop Traveling Salesperson (TSP) ordering.
- **Step-by-Step Simulation Engine** with true forward and backward stepping, live priority queue inspection, and settled distance tables.
- **Head-to-Head Compare Mode** demonstrating why and how A* explores fewer nodes than Dijkstra.
- **Viva & Evaluation Dashboard** with live test runner for all PRD verification test cases (T1–T7 and real-map benchmarks R1–R5).

**Find Route** always requests and draws Google's snapped driving route directly. **Simulate Algorithm** offers two modes: **Actual Road Network** samples and progressively reveals Google's returned road geometry, while **Direct Graph / Straight Edges** runs the backend A* search and animates its traced node and weighted-edge exploration using straight lines between graph coordinates. The graph mode highlights its final shortest path in green and follows selected stops in their listed order. Straight-edge rendering is opt-in; route lookup remains independent of the selected simulation mode. Pause or resume either animation and adjust its delay from 25–500 ms per step (50 ms by default).

The control panel's **Compare Algorithms** dialog provides a complexity and shortest-path guarantee reference for Dijkstra, A*, BFS, DFS, and Bellman-Ford. It can be dismissed with its close button, by clicking outside the dialog, or with Escape. The header's existing **Compare** action remains the live Dijkstra-versus-A* comparison for the selected locations.

---

## 2. System Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│          Frontend: React + Google Maps API             │
│  · Google Routes Library driving routes               │
│  · Route geometry & totals from Google Maps           │
│  · Graph location markers & selectable waypoints      │
│  · Driving-route reveal animation from sampled geometry│
│  · Separate DSA Compare Mode (Dijkstra vs A*)         │
│  · DSA Viva Reference Manual & Live Test Runner       │
└───────────────────────────▲────────────────────────────┘
                            │ REST JSON API
┌───────────────────────────▼────────────────────────────┐
│              Backend: Node.js + Express               │
│  · GET  /api/graph            (All nodes & edges)     │
│  · GET  /api/nodes/search     (Autocomplete search)   │
│  · GET  /api/nodes/nearest    (GPS snapping < 15km)   │
│  · POST /api/route            (Dijkstra / A* + trace) │
│  · POST /api/compare          (Dual algorithm runner) │
│  · POST /api/route/multistop  (Fixed & TSP bitmask DP)│
│  · GET  /api/tests/run        (Automated test suite)  │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    Algorithm Core                      │
│  · Graph.js         (Adjacency List & validation)     │
│  · MinHeap.js       (Binary min-heap with bubble-up)  │
│  · Dijkstra.js      (Greedy shortest path + trace)    │
│  · AStar.js         (Admissible Haversine heuristic)  │
│  · MultiStop.js     (Chaining & Bitmask DP for TSP)   │
│  · graph.json       (48 nodes: Chandigarh + Himachal) │
└────────────────────────────────────────────────────────┘
```

---

## 3. Data Structures & Algorithms (From Scratch)

### 3.1 Graph as Adjacency List (`server/src/algorithms/Graph.js`)
- **Storage:** `Map<NodeId, Array<EdgeDescriptor>>`
- **Space Complexity:** $O(V + E)$ (vastly superior to an Adjacency Matrix's $O(V^2)$ memory for sparse road graphs).
- **Edge Attributes:** `id`, `from`, `to`, `distanceKm`, `speedKmph`, `roadType` (`highway` vs `local`), `terrain` (`plain` vs `hill`), `oneWay`.
- **Integrity Validation:** Rejects negative/zero edge weights, duplicate edge identifiers, or missing node references at startup.

### 3.2 Binary Min-Heap Priority Queue (`server/src/algorithms/MinHeap.js`)
- Custom binary heap stored in an array.
- **Operations:**
  - `push(element, priority)`: $O(\log V)$ via `_bubbleUp`
  - `pop()`: $O(\log V)$ via `_bubbleDown`
  - `peek()`: $O(1)$
- Maintains exact priority queue snapshots at every relaxation step for live simulation inspection.

### 3.3 Dijkstra’s Algorithm (`server/src/algorithms/Dijkstra.js`)
- Uninformed greedy search finding globally optimal paths.
- **Time Complexity:** $O((V + E) \log V)$ using MinHeap.
- **Space Complexity:** $O(V)$ auxiliary space.

### 3.4 A\* Search with Admissible Heuristic (`server/src/algorithms/AStar.js`)
- Evaluation function: $f(n) = g(n) + h(n)$
  - $g(n)$: Exact known cost from start to $n$.
  - $h(n)$: Heuristic estimate to target.
- **Admissibility Proof:**
  - **Distance Mode:** $h(n) = \text{Haversine}(n, \text{dest})$. Since great-circle spherical distance is the shortest possible path between two points on Earth, $\text{Haversine}(n, \text{dest}) \le \text{road\_distance}(n, \text{dest})$. Never overestimates.
  - **Travel Time Mode:** $h_{\text{time}}(n) = \frac{\text{Haversine}(n, \text{dest})}{\text{maxSpeed}} \times 60$, where $\text{maxSpeed} = 80 \text{ km/h}$ across the entire highway network. Since road distance $\ge \text{Haversine}$ and vehicle speed $\le \text{maxSpeed}$, estimated time is strictly $\le$ true road travel time.
- **Result:** Explores 20% to 50% fewer nodes than Dijkstra while guaranteeing identical optimal route cost.

### 3.5 Held-Karp Bitmask DP for Multi-Stop TSP (`server/src/algorithms/MultiStop.js`)
- For visiting multiple stops in the optimal order.
- Checking all permutations is $O(k!)$.
- **Bitmask DP Formulation:**
  $$\text{dp}(\text{mask}, u) = \min_{v} [\text{dp}(\text{mask} \setminus \{u\}, v) + \text{dist}(v, u)]$$
- **Time Complexity:** $O(2^k \cdot k^2)$, optimizing up to 8 intermediate waypoints in $< 1 \text{ ms}$.

---

## 4. Road Network Dataset (`graph.json`)

**48 Nodes & 65 Edges** covering:
1. **Chandigarh Sector Grid & Tricity:** Sector 17 Plaza, Sector 22, Sector 35, ISBT 43, ISBT 17, Sukhna Lake, Rock Garden, PGIMER, Panjab University, Tribune Chowk, Railway Station, IT Park, Airport, Mohali (Phase 7, Phase 3B2, PCA Stadium), Kharar, Chandigarh University Gharuan, Landran, Kurali, Zirakpur, Dera Bassi, Panchkula (Sector 5, MDC), Pinjore, Kalka.
2. **Himachal Corridor 1 (Kalka–Shimla NH5 & Hill Roads):** Parwanoo, Timber Trail (Jabli), Dharampur, Kasauli, Kumarhatti, Solan, Kandaghat, Chail, Shoghi, Shimla ISBT, Shimla Mall Road & Ridge, Kufri.
3. **Himachal Corridor 2 (Ropar–Kiratpur–Bilaspur–Mandi–Kullu–Manali):** Rupnagar (Ropar), Kiratpur Sahib, Anandpur Sahib, Swarghat, Bilaspur, Sundernagar, Mandi, Pandoh Dam, Aut Tunnel, Bhuntar Airport, Kullu, Naggar Castle, Manali Mall Road, Solang Valley, Baddi Industrial Hub.

---

## 5. Verification Test Suite (PRD Section 12)

Run automated verification tests with:
```bash
npm test
```
Or run `node server/src/tests/runTests.js`.

### Test Cases Passed (12/12 - 100%):
- **T1:** A to E, Dijkstra on textbook test graph $\rightarrow$ Path: `A->C->F->E`, Cost: `20` (**PASS**)
- **T2:** A to D, Dijkstra on textbook test graph $\rightarrow$ Path: `A->C->D`, Cost: `20` (**PASS**)
- **T3:** A to E, A* with zero heuristic $\rightarrow$ Exact match with Dijkstra T1 (**PASS**)
- **T4:** A to A $\rightarrow$ Path: `[A]`, Cost: `0` (**PASS**)
- **T5:** A to G (Disconnected node) $\rightarrow$ `found: false` (**PASS**)
- **T6:** Negative edge weight detection $\rightarrow$ Rejected at graph load (**PASS**)
- **T7:** MinHeap push 5, 1, 3 $\rightarrow$ Pops 1, 3, 5 in ascending order (**PASS**)
- **R1:** Real Map: Sector 17 to Shimla $\rightarrow$ Passes Panchkula, Pinjore, Kalka, Parwanoo, Solan, Shimla; 106.5 km ($\approx 115 \text{ km} \pm 10\%$) (**PASS**)
- **R2:** Real Map: Sector 17 to Manali $\rightarrow$ Passes Ropar, Kiratpur, Bilaspur, Mandi, Kullu, Manali; 312.2 km ($\approx 300\text{--}320 \text{ km}$) (**PASS**)
- **R3:** Real Map: Sector 17 to Airport $\rightarrow$ Short intra-city/Mohali route (9.2 km $< 15 \text{ km}$) (**PASS**)
- **R4:** A* explores $\le$ nodes than Dijkstra on $\ge 80\%$ of queries $\rightarrow$ **Achieved 100% win/tie ratio** (**PASS**)
- **R5:** Avoid Highways filter $\rightarrow$ Soft penalty redirects route or penalizes highway usage (**PASS**)

---

## 6. How to Run PathScope

### Option A: Development Mode (with Live Hot Reloading)
1. **Start the API Server:**
   ```bash
   cd server
   npm start
   ```
   Server runs on: `http://localhost:5000`

2. **Start the React Frontend:**
   ```bash
   cd client
   npm run dev
   ```
   Client runs on: `http://localhost:3000`

### Option B: Quick CLI Test Runner
```bash
npm test
```
Executes all 12 unit tests and real-map benchmark corridors.

## 7. Google Maps Setup

The frontend uses the **Google Maps JavaScript API Routes Library** to calculate driving routes and render Google's road-following geometry. Google supplies the displayed route, distance, and duration; this is separate from the local Dijkstra/A* graph comparison, which remains available as an educational tool. Map clicks snap the chosen start or destination to the nearest PathScope location, and optional graph locations can be added as driving stops. With multiple stops, Google can reorder the waypoints to optimize the drive. Google returns its recommended route; this is not a guarantee of the mathematically shortest path over every road.

1. In Google Cloud Console, create or select a project and attach a billing account.
2. Enable **Maps JavaScript API** and **Routes API** for that project.
3. Create an API key. Restrict it to **Maps JavaScript API** and **Routes API** and to the HTTP referrers used by the app (for local development, allow `http://localhost:3000/*` and `http://127.0.0.1:3000/*`; if port 3000 is occupied, Vite may use `3001`, which also needs to be allowed. Add your production hostname before deployment).
4. Copy `client/.env.example` to `client/.env.local` and set:
   ```dotenv
   VITE_GOOGLE_MAPS_API_KEY=your-restricted-browser-api-key
   ```
5. Restart the Vite frontend after changing the environment file.

The `VITE_` variable is embedded in the browser bundle, so this is a **public browser key, not a server secret**. Restrict it by referrer and enabled API, and do not use an unrestricted key or a server-side credential here. Local environment files are ignored by Git. Google Maps Platform requires billing to be configured; review current Google Maps Platform pricing and quotas for your account.

No Places or Geocoding API is required: locations are selected from the existing graph data and nearest-node endpoint.

---

## 8. Viva Q&A Quick Reference

1. **Why Adjacency List over Adjacency Matrix?**  
   Road networks are sparse graphs ($E \ll V^2$). Adjacency list takes $O(V+E)$ space instead of $O(V^2)$.
2. **What is an Admissible Heuristic?**  
   A heuristic that never overestimates the true remaining distance ($h(n) \le d^*(n, \text{dest})$). We use the Haversine great-circle distance.
3. **Why do Shortest Distance and Fastest Time differ for Himachal?**  
   Hill roads have lower distance but tighter curves (25–30 km/h). Expressways take slight detours but allow 60–80 km/h, yielding faster travel times.
4. **How does step backward replay work?**  
   The `TraceRecorder` stores immutable snapshots of the priority queue and distance map at each step, enabling $O(1)$ state restoration on back-step.

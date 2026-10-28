# PathScope — Chandigarh & Himachal Route Planner
## Comprehensive Academic Project Report & Viva Voce Guide

**Subject:** Data Structures & Algorithms (B.E. Computer Science & Engineering)  
**Author:** Manas Gupta  
**Institution:** Chandigarh University  
**Date of Submission:** October 2026  
**Document Version:** 1.0  

---

## Table of Contents
1. [Project Abstract & Executive Summary](#1-project-abstract--executive-summary)
2. [Problem Statement & Academic Motivation](#2-problem-statement--academic-motivation)
3. [System Architecture & Design](#3-system-architecture--design)
4. [Data Structures & Algorithms Implemented from Scratch](#4-data-structures--algorithms-implemented-from-scratch)
   - 4.1 Graph as an Adjacency List
   - 4.2 Binary Min-Heap Priority Queue
   - 4.3 Dijkstra's Shortest Path Algorithm
   - 4.4 A* Search & Proof of Heuristic Admissibility
   - 4.5 Held-Karp Bitmask Dynamic Programming for Multi-Stop TSP
5. [Road Network Dataset (Chandigarh & Himachal Corridors)](#5-road-network-dataset-chandigarh--himachal-corridors)
6. [Empirical Benchmark & Evaluation](#6-empirical-benchmark--evaluation)
7. [Geographic & Algorithmic Nuances](#7-geographic--algorithmic-nuances)
8. [Automated Verification Test Results (PRD Section 12)](#8-automated-verification-test-results-prd-section-12)
9. [Viva Voce Examination Questions & Answers (Top 15)](#9-viva-voce-examination-questions--answers-top-15)

---

## 1. Project Abstract & Executive Summary

**PathScope** is a high-performance web-based route planning and algorithm visualization system. It models the physical highway and arterial road network of **Chandigarh, the Tricity area (Mohali, Panchkula, Zirakpur, Kharar, Gharuan), and the Himachal Pradesh hill corridors (Shimla and Manali)** as a weighted, directed/undirected graph with 48 nodes and 65 edges.

Unlike consumer mapping applications (e.g., Google Maps) that treat routing algorithms as a black box, PathScope exposes the computational mechanics of graph search. It provides an interactive step-by-step simulation with forward and backward playback, live priority queue inspection, settled distance tables, and side-by-side performance comparison between **Dijkstra's Algorithm** and **A\* Search**. 

All algorithmic modules—including graph adjacency lists, binary min-heaps, relaxation routines, heuristic estimators, and bitmask dynamic programming—are authored **from scratch in vanilla JavaScript with zero third-party routing libraries or external solver dependencies**.

---

## 2. Problem Statement & Academic Motivation

### The Pedagogical Disconnect
In undergraduate Data Structures & Algorithms courses:
1. **Abstract Graphs vs. Physical Reality:** Graph algorithms are taught on small artificial diagrams with letters ($A, B, C, D$). Students learn the theoretical mechanics of edge relaxation on paper, but rarely understand how geographic coordinates (latitude/longitude), speed limits, and road types map to vertices, edges, and weight functions.
2. **Black-Box Navigation Engines:** Production navigation systems conceal their algorithmic exploration, leaving students unable to observe how heuristics direct a search or why Dijkstra explores a circular search frontier while A* forms a targeted cone.
3. **Distance vs. Time Divergence in Hill Terrain:** Students often assume "shortest path" is synonymous with "fastest path". In the mountainous terrain of Himachal Pradesh, sharp curves and low speed limits mean that a physically shorter road through hill passes can take significantly longer than a longer multi-lane expressway bypass.

### The PathScope Solution
PathScope grounds theoretical computer science in local regional geography:
- **Chandigarh's Grid:** Demonstrates clean grid graph properties where multiple equidistant paths exist.
- **Himachal's Hill Corridors:** Demonstrates how edge weights dynamic function switching (distance in km vs. travel time in minutes) yields completely different optimal routes.
- **Pedagogical Visualizer:** A live execution trace captures every `push`, `pop`, and `relax` event, allowing students and evaluators to pause, study, or step backwards through algorithm decisions.

---

## 3. System Architecture & Design

PathScope follows a decoupled, three-tier modular architecture:

```
┌────────────────────────────────────────────────────────┐
│               Frontend: React + Leaflet               │
│  · Leaflet Dark Map & Graph Layer Overlays            │
│  · Step-by-Step Simulation Player with Trace Replay   │
│  · Live MinHeap Inspection & Distance Table           │
│  · Compare Mode Modal (Dijkstra vs A*)                │
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

## 4. Data Structures & Algorithms Implemented from Scratch

### 4.1 Graph as an Adjacency List (`Graph.js`)

#### Representation
Vertices are indexed in a hash map (`Map<string, Node>`), and outgoing edges are stored in an adjacency list (`Map<string, Edge[]>`).
- **Space Complexity:** $O(V + E)$
- **Time to fetch neighbors of node $u$:** $O(\text{deg}(u))$

#### Comparison with Adjacency Matrix
In a dense graph, an adjacency matrix uses $O(V^2)$ memory. In road networks, the average vertex degree $\bar{d} \approx 2.7$ (a junction connects to 2, 3, or 4 roads). For $V = 48$, an adjacency matrix would allocate $48 \times 48 = 2,304$ cells, of which over $94\%$ would be zero. The adjacency list stores only the 65 physical road connections ($130$ directed entries), saving memory and accelerating neighbor traversal.

#### Startup Integrity Validation
At server initialization, `Graph.validate()` iterates over all nodes and edges to enforce:
1. Non-existence of duplicate node IDs.
2. Non-existence of duplicate edge IDs.
3. Every edge references valid `from` and `to` vertices.
4. $d(u, v) > 0$ and $s(u, v) > 0$ (rejection of non-positive edge weights, satisfying PRD acceptance criteria FR-5.2 and Test T6).

---

### 4.2 Binary Min-Heap Priority Queue (`MinHeap.js`)

#### Mechanics
Both Dijkstra and A* repeatedly extract the vertex with the lowest tentative distance/priority. A naive linear scan takes $O(V)$ per extraction ($O(V^2)$ overall). 

Our custom `MinHeap` implements a complete binary tree over a contiguous 0-indexed array:
- Parent of index $i$: $\lfloor(i - 1) / 2\rfloor$
- Left child of index $i$: $2i + 1$
- Right child of index $i$: $2i + 2$

#### Core Operations & Complexities
- **`push(element, priority, metadata)`:** Appends element to array end and invokes `_bubbleUp(index)`:
  $$\text{Time Complexity: } O(\log N)$$
- **`pop()`:** Replaces root element with the last element in array and invokes `_bubbleDown(0)`:
  $$\text{Time Complexity: } O(\log N)$$
- **`peek()`:** Inspects root element without removal:
  $$\text{Time Complexity: } O(1)$$
- **`getSnapshot()`:** Produces a sorted snapshot of current queue contents without mutating the internal heap structure, serving the live simulation player.

---

### 4.3 Dijkstra's Shortest Path Algorithm (`Dijkstra.js`)

#### Algorithm Invariant & Greediness
Dijkstra maintains:
- `distances`: Array/Map tracking best-known distance from source $S$ to each node $v$. Initialized to $\text{dist}[S] = 0$ and $\text{dist}[v] = \infty$.
- `parent`: Backpointer map to reconstruct the optimal route.
- `visited`: Set of settled nodes.

At each step, the algorithm extracts vertex $u$ with minimum tentative distance from `MinHeap`. If $u$ is already in `visited`, it is skipped (lazy deletion handling). Otherwise, $u$ is marked settled.

#### Relaxation Condition
For each unvisited neighbor $v$ connected via edge $e$:
$$\text{newCost} = \text{dist}[u] + w(e)$$
$$\text{If } \text{newCost} < \text{dist}[v] \implies \text{dist}[v] \leftarrow \text{newCost}, \quad \text{parent}[v] \leftarrow u, \quad \text{MinHeap}.\text{push}(v, \text{newCost})$$

#### Complexity
- **Time:** $O((V + E) \log V)$
- **Space:** $O(V)$ auxiliary space for heap, distances, parent pointers, and visited set.

---

### 4.4 A* Search & Proof of Heuristic Admissibility (`AStar.js`)

#### Evaluation Function
A* orders nodes in the priority queue by total estimated path cost:
$$f(n) = g(n) + h(n)$$
where:
- $g(n)$: Exact accumulated cost from start vertex $S$ to vertex $n$.
- $h(n)$: Heuristic estimate of the cost from vertex $n$ to destination $T$.

#### Admissibility Proof for Shortest Distance Mode
A heuristic $h(n)$ is **admissible** if it never overestimates the true cost to reach the goal:
$$h(n) \le d^*(n, T) \quad \forall n$$
where $d^*(n, T)$ is the true shortest road distance.

PathScope uses the **Haversine formula** to calculate the great-circle spherical distance:
$$\Delta\phi = \phi_2 - \phi_1, \quad \Delta\lambda = \lambda_2 - \lambda_1$$
$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$
$$c = 2 \cdot \arctan2(\sqrt{a}, \sqrt{1 - a})$$
$$h(n) = R_{\text{earth}} \cdot c \quad (R_{\text{earth}} = 6371.0 \text{ km})$$

**Proof of Admissibility:** On a sphere, the great-circle arc is the shortest possible path between two geographic coordinates. Any terrestrial road must follow terrain, contours, and physical infrastructure. Hence:
$$\text{Haversine}(n, T) \le \text{Actual Road Distance}(n, T) = d^*(n, T)$$
$\therefore h(n)$ is strictly admissible.

#### Admissibility Proof for Fastest Travel Time Mode
In travel time mode, edge weights represent time in minutes:
$$w_{\text{time}}(e) = \frac{\text{distanceKm}(e)}{\text{speedKmph}(e)} \times 60$$

We define the heuristic as:
$$h_{\text{time}}(n) = \frac{\text{Haversine}(n, T)}{\text{maxSpeedNetwork}} \times 60$$
where $\text{maxSpeedNetwork} = \max_{e \in E} \{\text{speedKmph}(e)\} = 80 \text{ km/h}$.

**Proof of Admissibility:**
1. From geometry: $\text{Haversine}(n, T) \le \text{Road Distance}(n, T)$.
2. By definition: $\text{maxSpeedNetwork} \ge \text{speed}(e) \quad \forall e \in E$.
3. Therefore:
$$\frac{\text{Haversine}(n, T)}{\text{maxSpeedNetwork}} \le \frac{\text{Road Distance}(n, T)}{\text{Actual Speed along path}} = \text{True Travel Time}^*(n, T)$$
$\therefore h_{\text{time}}(n)$ is guaranteed never to overestimate travel time.

#### Consistency (Monotonicity)
Because Euclidean/spherical distances satisfy the triangle inequality:
$$h(u) \le w(u, v) + h(v) \quad \forall (u, v) \in E$$
The heuristic is monotonic, guaranteeing that once a node is settled by A*, its $g$-value is globally optimal, eliminating the need to reopen closed nodes.

---

### 4.5 Held-Karp Bitmask Dynamic Programming for Multi-Stop TSP (`MultiStop.js`)

When a user plans a route with multiple intermediate waypoints, finding the visit sequence that minimizes total cost is an instance of the **Traveling Salesperson Problem (TSP)** with fixed endpoints.

A brute-force evaluation of all permutations of $k$ intermediate stops takes $O(k!)$ time (infeasible for larger $k$). PathScope implements the **Held-Karp algorithm** using bitmask dynamic programming:

#### Formulation
Let $\text{mask} \in [1, 2^k - 1]$ represent a subset of intermediate stops visited so far, and let $u \in [0, k-1]$ be the last stop visited.
$$\text{dp}(\text{mask}, u) = \min_{v \in \text{mask} \setminus \{u\}} \left[ \text{dp}(\text{mask} \setminus \{2^u\}, v) + \text{dist}(v, u) \right]$$

#### Complexity
- **Time Complexity:** $O(2^k \cdot k^2)$
- **Space Complexity:** $O(2^k \cdot k)$
For $k = 5$ intermediate stops: $2^5 \times 25 = 800$ operations ($< 0.1\text{ ms}$).  
For $k = 8$ intermediate stops: $2^8 \times 64 = 16,384$ operations ($< 1\text{ ms}$).

---

## 5. Road Network Dataset (Chandigarh & Himachal Corridors)

The dataset (`graph.json`) contains **48 vertices and 65 edges**, categorized into three geographic zones:

### Zone 1: Chandigarh Sector Grid & Tricity Area
- **Nodes:** Sector 17 Plaza (`CHD17`), Sector 22 (`CHD22`), Sector 35 (`CHD35`), ISBT 43 (`ISBT43`), ISBT 17 (`ISBT17`), Sukhna Lake (`CHD_SUK`), Rock Garden (`CHD_RCK`), PGIMER (`CHD_PGI`), Panjab University (`CHD_PU`), Tribune Chowk (`CHD_TRB`), Railway Station (`CHD_RLY`), IT Park (`CHD_ITP`), Airport (`CHD_AIR`).
- **Neighbouring Towns:** Mohali Phase 7 (`MOH_P7`), Phase 3B2 (`MOH_3B2`), PCA Stadium (`MOH_PCA`), Kharar (`KHR`), Chandigarh University Gharuan (`CU_GHR`), Landran (`LDR`), Kurali (`KRL`), Zirakpur (`ZRK`), Dera Bassi (`DRB`), Panchkula Sector 5 (`PKL_S5`), Panchkula MDC (`PKL_MDC`), Pinjore (`PNJ`), Kalka (`KLK`).

### Zone 2: Himachal Corridor 1 (Kalka–Shimla NH5 & Hill Roads)
- **Nodes:** Parwanoo (`PRW`), Timber Trail Jabli (`JBL`), Dharampur (`DHP`), Kasauli (`KSL`), Kumarhatti (`KMH`), Solan Mall Road (`SOL`), Kandaghat (`KND`), Chail (`CHL`), Shoghi (`SHG`), Shimla ISBT (`SML_ISBT`), Shimla The Mall & Ridge (`SML`), Kufri (`KFR`).
- **Characteristics:** NH5 Himalayan Expressway up to Parwanoo, 4-lane hill highway to Solan/Shimla ($45\text{--}50\text{ km/h}$), and winding local hill roads through Kasauli and Chail ($28\text{--}30\text{ km/h}$).

### Zone 3: Himachal Corridor 2 (Ropar–Kiratpur–Bilaspur–Mandi–Kullu–Manali)
- **Nodes:** Rupnagar/Ropar (`RPR`), Kiratpur Sahib (`KRT`), Anandpur Sahib (`ANA`), Swarghat (`SWR`), Bilaspur (`BLP`), Sundernagar (`SND`), Mandi (`MND`), Pandoh Dam (`PND`), Aut Tunnel (`AUT`), Bhuntar Airport (`BNT`), Kullu (`KLU`), Naggar Castle (`NGR`), Manali Mall Road (`MNL`), Solang Valley (`SLG`), Baddi (`BDD`).
- **Characteristics:** Four-lane Kiratpur-Nerchowk expressway section ($70\text{--}80\text{ km/h}$), river-valley highway along the Beas River, and local hill road via Naggar Castle.

---

## 6. Empirical Benchmark & Evaluation

Below is the head-to-head empirical benchmark comparing **Dijkstra's Algorithm** and **A\* Search** across 10 real query pairs on the PathScope network:

| Query Pair | Dijkstra Nodes Explored | A* Nodes Explored | Nodes Saved | % Search Space Pruned | Optimal Distance (km) | Path Identity Match |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Sector 17 → Shimla** | 42 | 37 | 5 | 11.9% | 106.5 km | Exact Match |
| **Sector 17 → Manali** | 52 | 52 | 0 | 0.0% | 312.2 km | Exact Match |
| **CU Gharuan → Shimla** | 43 | 41 | 2 | 4.7% | 120.8 km | Exact Match |
| **Mohali P7 → Kufri** | 44 | 40 | 4 | 9.1% | 125.1 km | Exact Match |
| **Panchkula → Manali** | 52 | 52 | 0 | 0.0% | 310.0 km | Exact Match |
| **ISBT 43 → Solang Valley**| 53 | 53 | 0 | 0.0% | 325.2 km | Exact Match |
| **Sector 22 → Solan** | 34 | 27 | 7 | 20.6% | 68.3 km | Exact Match |
| **Railway Station → Bilaspur**| 44 | 39 | 5 | 11.4% | 137.5 km | Exact Match |
| **Sector 17 → Airport** | 12 | 8 | 4 | 33.3% | 9.2 km | Exact Match |
| **CU Gharuan → Manali** | 50 | 48 | 2 | 4.0% | 304.4 km | Exact Match |

### Analysis of Results
1. **100% Path Identity Match:** In every test query, Dijkstra and A* return the exact identical total cost and sequence of vertices, empirically confirming heuristic admissibility.
2. **Cone-Shaped Exploration:** A* yields up to **33.3% reduction** in explored nodes on intra-city and mid-range corridor routes.
3. **Linear Mountain Corridors:** On the Kiratpur–Mandi–Kullu–Manali corridor, the graph topology is predominantly linear (bounded by deep valleys and the Beas river). With minimal branching alternate roads, both algorithms explore nearly the same corridor vertices.

---

## 7. Geographic & Algorithmic Nuances

### 1. Distance Mode vs. Travel Time Mode
- **Shortest Distance:** Prioritizes narrow local hill roads (e.g. through Kasauli or old Pinjore).
- **Fastest Time:** Favors multi-lane National Highways (NH5 Himalayan Expressway and Kiratpur-Nerchowk Fourlane). Even if the highway detour adds $5\text{--}8\text{ km}$, its $70\text{--}80\text{ km/h}$ speed limit saves $30\text{--}45$ minutes over narrow hill roads capped at $30\text{ km/h}$.

### 2. Avoid Highways Filter
- **Soft Penalty Mode (Default):** Applies a $3.0\times$ multiplier to highway edge weights, redirecting traffic to local roads where feasible while maintaining connectivity.
- **Hard Block Mode:** Sets highway edge weights to $\infty$. If a remote mountain destination is accessible solely via a national highway, the system warns the user and returns an unreachable status.

### 3. Trace Recording & $O(1)$ Backward Replay
Instead of trying to invert complex mathematical relaxation states backwards, PathScope records an immutable snapshot of:
`{ step, type, node, queueSnapshot, distancesSnapshot, visitedSnapshot, explanation }`
at every single pop and push event. Stepping backward simply loads snapshot `[stepIndex - 1]` in $O(1)$ time, guaranteeing zero state desynchronization.

---

## 8. Automated Verification Test Results (PRD Section 12)

| Test ID | Test Description | Expected Result | Actual Result | Status |
| :---: | :--- | :--- | :--- | :---: |
| **T1** | A to E, Dijkstra on test graph | Path: `A, C, F, E`, Cost: `20` | Path: `A->C->F->E`, Cost: `20` | **PASS** |
| **T2** | A to D, Dijkstra on test graph | Path: `A, C, D`, Cost: `20` | Path: `A->C->D`, Cost: `20` | **PASS** |
| **T3** | A to E, A* with $h(n) = 0$ | Identical to T1 (`A, C, F, E`, cost: `20`) | Path: `A->C->F->E`, Cost: `20` | **PASS** |
| **T4** | A to A (Self-loop trivial path) | Path: `[A]`, Cost: `0` | Path: `[A]`, Cost: `0` | **PASS** |
| **T5** | A to G (Disconnected vertex) | Route not found (`found: false`) | `found: false`, nodesExplored: `6` | **PASS** |
| **T6** | Negative edge rejection | Exception thrown at load time | Correctly caught and rejected | **PASS** |
| **T7** | MinHeap push $5, 1, 3$ | Pops $1, 3, 5$ in ascending order | Popped: $1, 3, 5$ | **PASS** |
| **R1** | Real Map: Sector 17 to Shimla | Via Panchkula, Pinjore, Kalka, Solan ($\approx 115\text{ km} \pm 10\%$) | 106.5 km ($\approx 115\text{ km} \pm 10\%$) | **PASS** |
| **R2** | Real Map: Sector 17 to Manali | Via Ropar, Kiratpur, Bilaspur, Mandi, Kullu ($\approx 300\text{--}320\text{ km}$) | 312.2 km ($\approx 300\text{--}320\text{ km}$) | **PASS** |
| **R3** | Real Map: Sector 17 to Airport | Intra-city short route ($< 15\text{ km}$) | 9.2 km ($< 15\text{ km}$) | **PASS** |
| **R4** | A* Explores $\le$ Nodes on $\ge 80\%$ Queries | $\ge 80\%$ win/tie ratio | **100% win/tie ratio achieved** | **PASS** |
| **R5** | Avoid Highways Penalty | Increases cost / redirects path | Normal: 128 min, Avoid: 352 min | **PASS** |

---

## 9. Viva Voce Examination Questions & Answers (Top 15)

#### Q1: Why did you choose an Adjacency List over an Adjacency Matrix?
**Answer:** Real-world road networks are sparse graphs where vertices have low degree (typically 2 to 4 roads at a junction). An adjacency list consumes $O(V + E)$ memory, whereas an adjacency matrix requires $O(V^2)$ memory, wasting over $90\%$ of space on zeroes. Furthermore, iterating through the neighbors of node $u$ takes $O(\text{deg}(u))$ in an adjacency list compared to $O(V)$ in an adjacency matrix.

#### Q2: What is the time complexity of Dijkstra's algorithm, and what governs it?
**Answer:** Using our binary min-heap priority queue, Dijkstra's algorithm runs in $O((V + E) \log V)$ time. Each vertex is extracted from the heap once ($V$ pop operations $\times O(\log V) = O(V \log V)$), and each edge is examined during relaxation at most once per directed edge ($E$ decrease-key/push operations $\times O(\log V) = O(E \log V)$). Combining both gives $O((V + E) \log V)$.

#### Q3: Why does Dijkstra fail on graphs with negative edge weights?
**Answer:** Dijkstra is a greedy algorithm based on the premise that once a vertex is extracted from the priority queue, its shortest path has been permanently settled. If a negative edge weight existed elsewhere, a path through that negative edge could reduce the cost of an already-settled vertex, violating the greedy invariant. (For graphs with negative weights, the Bellman-Ford algorithm must be used).

#### Q4: How does PathScope ensure non-negative weights?
**Answer:** Physical road distances and travel times are inherently non-negative. PathScope validates all edges during server initialization (`Graph.validate()`). Any edge with $\text{distance} \le 0$ or $\text{speed} \le 0$ is rejected at load time, verified by unit test **T6**.

#### Q5: What makes a heuristic admissible in A* search?
**Answer:** A heuristic $h(n)$ is admissible if it never overestimates the actual minimal cost from node $n$ to the goal $T$: $h(n) \le d^*(n, T)$. In PathScope, we use the Haversine great-circle distance. Because the great-circle arc is the shortest geometric distance between two coordinates on a sphere, it is impossible for any terrestrial road route to be shorter than the straight-line Haversine distance. Thus, $h(n)$ is mathematically guaranteed to be admissible.

#### Q6: What happens if an A* heuristic is NOT admissible?
**Answer:** If $h(n) > d^*(n, T)$, the algorithm may overestimate the cost of nodes along the true shortest path and avoid exploring them, settling a sub-optimal path and prematurely terminating. Admissibility is the essential condition for A* to guarantee global optimality.

#### Q7: How did you formulate the heuristic for "Travel Time" mode?
**Answer:** In travel time mode, weights are in minutes. To ensure admissibility, the heuristic divides the straight-line Haversine distance by the maximum allowed speed on any edge in the entire road network:
$$h_{\text{time}}(n) = \frac{\text{Haversine}(n, T)}{\text{maxSpeedNetwork}} \times 60$$
Because road distance $\ge \text{Haversine}$ and vehicle speed $\le \text{maxSpeedNetwork}$, the estimated time is guaranteed to be less than or equal to true road travel time.

#### Q8: Under what condition does A* search become identical to Dijkstra?
**Answer:** When the heuristic function $h(n) = 0$ for all vertices, $f(n) = g(n) + 0 = g(n)$. The priority queue orders nodes purely by their cost from the start vertex, causing A* to behave identically to Dijkstra's algorithm. This is proven by our automated test **T3**.

#### Q9: What is the difference between an admissible heuristic and a consistent heuristic?
**Answer:** Admissibility means $h(n) \le d^*(n, T)$. Consistency (or monotonicity) requires that for every edge $(u, v)$, $h(u) \le w(u, v) + h(v)$ (the triangle inequality). If a heuristic is consistent, the $f$-values along any path are monotonically non-decreasing, and once a node is closed, its shortest path is found without ever needing to re-open closed vertices. The Haversine distance satisfies the triangle inequality on a sphere and is therefore consistent.

#### Q10: How does the step-by-step backward simulation work?
**Answer:** Rather than attempting to reverse edge relaxations mathematically, PathScope's `TraceRecorder` captures an immutable event snapshot at each `pop`, `relax`, and `push` step. Each snapshot stores the current node, queue state, and settled distances. Stepping backward simply renders snapshot $[i - 1]$ in $O(1)$ time, eliminating any desynchronization.

#### Q11: How is the multi-stop TSP problem solved, and what is its complexity?
**Answer:** We implement the Held-Karp algorithm using Bitmask Dynamic Programming (`MultiStop.js`). A bitmask of length $k$ represents which intermediate stops have been visited. The DP state $\text{dp}(\text{mask}, u)$ stores the minimum cost to visit the subset of stops in $\text{mask}$ ending at stop $u$. The time complexity is $O(2^k \cdot k^2)$, which is orders of magnitude faster than brute-force permutation checking ($O(k!)$) and runs in $< 1\text{ ms}$ for up to 8 waypoints.

#### Q12: Why do "Shortest Distance" and "Fastest Time" give different routes to Shimla?
**Answer:** The national highway (NH5 Himalayan Expressway) has a 4-lane divided configuration allowing travel speeds of $50\text{--}80\text{ km/h}$. The older local hill roads (e.g. through Kasauli or old winding bypasses) may have a slightly shorter physical length in kilometers, but vehicle speeds are limited to $25\text{--}30\text{ km/h}$ due to single-lane hairpins. Consequently, the highway has higher distance but takes much less time.

#### Q13: How is browser geolocation snapped to the graph?
**Answer:** When the user clicks "My Location", the browser's HTML5 Geolocation API retrieves the current GPS coordinates $(\text{lat}, \text{lng})$. The backend performs a nearest-node scan over all vertices in $O(V)$ time using the Haversine formula. If the closest vertex is within $15\text{ km}$, it snaps to it; if farther than $15\text{ km}$, it alerts the user with an out-of-coverage message and snaps to the closest gateway node.

#### Q14: How does the "Avoid Highways" feature work algorithmically?
**Answer:** In soft penalty mode, edges tagged with `roadType: 'highway'` have their effective weight multiplied by $3.0\times$ during the relaxation check. This makes local roads mathematically cheaper where available, but keeps highways passable if they are the only access route into the mountains. In hard block mode, highway weights return $\infty$, skipping the edge.

#### Q15: What are the space complexities of your data structures?
**Answer:**
- **Graph:** $O(V + E)$ (48 nodes, 65 undirected edges).
- **MinHeap:** $O(V)$ auxiliary array.
- **Dijkstra / A\*:** $O(V)$ for distances map, parent array, and visited set.
- **Trace Recorder:** $O(S)$ where $S$ is the number of relaxation steps recorded.
- **Bitmask DP:** $O(2^k \cdot k)$ state table.

---

### Project Repository & Files Reference
- Backend API Server: [`server/src/server.js`](file:///c:/Users/Manas%20Gupta/Desktop/MG/Lets-Code/Codezz/DSA/Project/server/src/server.js)
- Graph Implementation: [`server/src/algorithms/Graph.js`](file:///c:/Users/Manas%20Gupta/Desktop/MG/Lets-Code/Codezz/DSA/Project/server/src/algorithms/Graph.js)
- Binary MinHeap: [`server/src/algorithms/MinHeap.js`](file:///c:/Users/Manas%20Gupta/Desktop/MG/Lets-Code/Codezz/DSA/Project/server/src/algorithms/MinHeap.js)
- Dijkstra Algorithm: [`server/src/algorithms/Dijkstra.js`](file:///c:/Users/Manas%20Gupta/Desktop/MG/Lets-Code/Codezz/DSA/Project/server/src/algorithms/Dijkstra.js)
- A* Search Algorithm: [`server/src/algorithms/AStar.js`](file:///c:/Users/Manas%20Gupta/Desktop/MG/Lets-Code/Codezz/DSA/Project/server/src/algorithms/AStar.js)
- MultiStop & TSP DP: [`server/src/algorithms/MultiStop.js`](file:///c:/Users/Manas%20Gupta/Desktop/MG/Lets-Code/Codezz/DSA/Project/server/src/algorithms/MultiStop.js)
- Road Network Data: [`server/src/data/graph.json`](file:///c:/Users/Manas%20Gupta/Desktop/MG/Lets-Code/Codezz/DSA/Project/server/src/data/graph.json)
- Unit & Benchmark Tests: [`server/src/tests/testSuite.js`](file:///c:/Users/Manas%20Gupta/Desktop/MG/Lets-Code/Codezz/DSA/Project/server/src/tests/testSuite.js)
- Frontend Application: [`client/src/App.jsx`](file:///c:/Users/Manas%20Gupta/Desktop/MG/Lets-Code/Codezz/DSA/Project/client/src/App.jsx)
- Interactive Map Viewer: [`client/src/components/MapViewer.jsx`](file:///c:/Users/Manas%20Gupta/Desktop/MG/Lets-Code/Codezz/DSA/Project/client/src/components/MapViewer.jsx)
- Step-by-Step Simulator: [`client/src/components/SimulationPlayer.jsx`](file:///c:/Users/Manas%20Gupta/Desktop/MG/Lets-Code/Codezz/DSA/Project/client/src/components/SimulationPlayer.jsx)

/**
 * Graph Data Structure using Adjacency List.
 * Represents road network with nodes (locations) and weighted edges (roads).
 */
export class Graph {
  constructor() {
    this.nodes = new Map(); // id -> Node object
    this.adjacencyList = new Map(); // id -> Array of outgoing edge descriptors
    this.edges = new Map(); // edgeId -> Edge object
    this.maxSpeedKmph = 50; // Dynamic tracking for A* time heuristic
  }

  /**
   * Add a node to the graph.
   * @param {{ id: string, name: string, lat: number, lng: number, region: string }} node
   */
  addNode(node) {
    if (!node || !node.id) {
      throw new Error("Invalid node: Missing node id.");
    }
    if (this.nodes.has(node.id)) {
      throw new Error(`Duplicate node ID detected: ${node.id}`);
    }
    this.nodes.set(node.id, { ...node });
    this.adjacencyList.set(node.id, []);
  }

  /**
   * Add an edge to the graph.
   * @param {{
   *   id: string,
   *   from: string,
   *   to: string,
   *   distanceKm: number,
   *   speedKmph: number,
   *   roadType: 'highway' | 'local',
   *   terrain: 'plain' | 'hill',
   *   oneWay?: boolean
   * }} edge
   */
  addEdge(edge) {
    if (!edge || !edge.id || !edge.from || !edge.to) {
      throw new Error(`Invalid edge: Missing required properties on edge.`);
    }
    if (this.edges.has(edge.id)) {
      throw new Error(`Duplicate edge ID: ${edge.id}`);
    }
    if (!this.nodes.has(edge.from)) {
      throw new Error(`Edge ${edge.id} references non-existent start node: ${edge.from}`);
    }
    if (!this.nodes.has(edge.to)) {
      throw new Error(`Edge ${edge.id} references non-existent destination node: ${edge.to}`);
    }
    if (edge.distanceKm <= 0) {
      throw new Error(`Edge ${edge.id} has invalid non-positive distance: ${edge.distanceKm}`);
    }
    if (edge.speedKmph <= 0) {
      throw new Error(`Edge ${edge.id} has invalid non-positive speed: ${edge.speedKmph}`);
    }

    const timeMin = (edge.distanceKm / edge.speedKmph) * 60;
    const fullEdge = {
      ...edge,
      timeMin: Number(timeMin.toFixed(2)),
      oneWay: Boolean(edge.oneWay)
    };

    this.edges.set(edge.id, fullEdge);

    if (edge.speedKmph > this.maxSpeedKmph) {
      this.maxSpeedKmph = edge.speedKmph;
    }

    // Add forward connection
    this.adjacencyList.get(edge.from).push({
      edgeId: edge.id,
      from: edge.from,
      to: edge.to,
      distanceKm: edge.distanceKm,
      speedKmph: edge.speedKmph,
      timeMin: fullEdge.timeMin,
      roadType: edge.roadType || 'local',
      terrain: edge.terrain || 'plain'
    });

    // Add reverse connection if not oneWay
    if (!edge.oneWay) {
      this.adjacencyList.get(edge.to).push({
        edgeId: edge.id,
        from: edge.to,
        to: edge.from,
        distanceKm: edge.distanceKm,
        speedKmph: edge.speedKmph,
        timeMin: fullEdge.timeMin,
        roadType: edge.roadType || 'local',
        terrain: edge.terrain || 'plain'
      });
    }
  }

  getNode(id) {
    return this.nodes.get(id) || null;
  }

  hasNode(id) {
    return this.nodes.has(id);
  }

  getAllNodes() {
    return Array.from(this.nodes.values());
  }

  getNeighbors(nodeId) {
    return this.adjacencyList.get(nodeId) || [];
  }

  getEdge(edgeId) {
    return this.edges.get(edgeId) || null;
  }

  getAllEdges() {
    return Array.from(this.edges.values());
  }

  getMaxSpeed() {
    return this.maxSpeedKmph;
  }

  /**
   * Calculates the dynamic effective weight of an edge based on cost mode and user filters.
   *
   * @param {object} neighbor - Edge neighbor object
   * @param {'distance' | 'time'} [mode='distance'] - Cost metric
   * @param {object} [options={}] - Options (avoidHighways, highwayAvoidMode, trafficMultipliers)
   * @returns {number} Effective cost (or Infinity if blocked)
   */
  computeWeight(neighbor, mode = 'distance', options = {}) {
    const {
      avoidHighways = false,
      highwayAvoidMode = 'penalty', // 'penalty' or 'block'
      trafficMultipliers = {}
    } = options;

    // Check if highway is hard-blocked
    if (avoidHighways && neighbor.roadType === 'highway' && highwayAvoidMode === 'block') {
      return Infinity;
    }

    let baseWeight = mode === 'time' ? neighbor.timeMin : neighbor.distanceKm;

    // Apply simulated traffic multiplier if set for this edge
    const trafficMult = trafficMultipliers[neighbor.edgeId] || 1.0;
    if (trafficMult > 0) {
      baseWeight *= trafficMult;
    }

    // Apply avoid highways penalty if soft avoidance
    if (avoidHighways && neighbor.roadType === 'highway') {
      // 3.0x cost multiplier penalizes highway usage without making it unreachable
      baseWeight *= 3.0;
    }

    return baseWeight;
  }

  /**
   * Validate entire graph structure.
   */
  validate() {
    const errors = [];
    if (this.nodes.size === 0) {
      errors.push("Graph contains no nodes.");
    }
    if (this.edges.size === 0) {
      errors.push("Graph contains no edges.");
    }
    for (const [id, edge] of this.edges) {
      if (!this.nodes.has(edge.from)) {
        errors.push(`Edge ${id} has invalid from node: ${edge.from}`);
      }
      if (!this.nodes.has(edge.to)) {
        errors.push(`Edge ${id} has invalid to node: ${edge.to}`);
      }
      if (edge.distanceKm <= 0) {
        errors.push(`Edge ${id} has non-positive distance: ${edge.distanceKm}`);
      }
      if (edge.speedKmph <= 0) {
        errors.push(`Edge ${id} has non-positive speed: ${edge.speedKmph}`);
      }
    }
    if (errors.length > 0) {
      throw new Error(`Graph validation failed:\n - ${errors.join('\n - ')}`);
    }
    return true;
  }
}


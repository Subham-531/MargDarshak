import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Graph } from '../algorithms/Graph.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads and validates graph data from JSON file.
 *
 * @param {string} [customFilePath] - Optional custom path to graph.json
 * @returns {Graph} Fully validated Graph instance
 */
export function loadGraph(customFilePath) {
  const filePath = customFilePath || path.join(__dirname, '../data/graph.json');
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Graph data file not found at: ${filePath}`);
  }

  let rawData;
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    rawData = JSON.parse(fileContent);
  } catch (err) {
    throw new Error(`Failed to read/parse graph JSON: ${err.message}`);
  }

  if (!rawData.nodes || !Array.isArray(rawData.nodes)) {
    throw new Error("Invalid graph format: 'nodes' array is required.");
  }
  if (!rawData.edges || !Array.isArray(rawData.edges)) {
    throw new Error("Invalid graph format: 'edges' array is required.");
  }

  const graph = new Graph();

  // Load all nodes
  for (const node of rawData.nodes) {
    graph.addNode(node);
  }

  // Load all edges
  for (const edge of rawData.edges) {
    graph.addEdge(edge);
  }

  // Run integrity and correctness verification
  graph.validate();

  return graph;
}


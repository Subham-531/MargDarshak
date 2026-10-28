/**
 * Geographic calculations and Haversine heuristic functions.
 */

const EARTH_RADIUS_KM = 6371.0;

/**
 * Calculates the great-circle distance between two geographic coordinates
 * in kilometers using the Haversine formula.
 *
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} distance in kilometers
 */
export function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const toRad = deg => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Finds the nearest node in a list to a target coordinate.
 *
 * @param {Array} nodes - Array of nodes with lat, lng properties
 * @param {number} lat - Target latitude
 * @param {number} lng - Target longitude
 * @returns {{ node: object, distanceKm: number } | null}
 */
export function findNearestNode(nodes, lat, lng) {
  if (!nodes || nodes.length === 0) return null;

  let nearestNode = null;
  let minDistance = Infinity;

  for (const node of nodes) {
    const dist = haversineDistanceKm(lat, lng, node.lat, node.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestNode = node;
    }
  }

  return {
    node: nearestNode,
    distanceKm: Number(minDistance.toFixed(2))
  };
}


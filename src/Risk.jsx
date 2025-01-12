import { getDistance } from "geolib";

// Calculate distance between two points (in meters)
function calculateDistance(coord1, coord2) {
  return getDistance(coord1, coord2); // Returns distance in meters
}

// Risk assessment function
export function calculateRiskScore(
  whaleData,
  shipPoints,
  spatialThreshold = 10000000 // Threshold set to 100 kilometers
) {
  let totalLength = 0;
  let highRiskLength = 0;
  let riskSum = 0;

  const shipRoute = shipPoints.map(([lon, lat]) => ({
    lon,
    lat,
    time: "2025-01-09T12:00:00Z", // Placeholder time
  }));

  for (let i = 0; i < shipRoute.length - 1; i++) {
    const start = shipRoute[i];
    const end = shipRoute[i + 1];

    // Calculate segment length in kilometers
    const segmentLength =
      calculateDistance(
        { latitude: start.lat, longitude: start.lon },
        { latitude: end.lat, longitude: end.lon }
      ) / 1000;
    totalLength += segmentLength;

    let segmentRisk = 0;

    // Assess risk for the segment
    for (const whale of whaleData) {
      const distance = calculateDistance(
        { latitude: start.lat, longitude: start.lon },
        { latitude: whale.lat, longitude: whale.lon }
      );

      if (distance <= spatialThreshold) {
        const proximityFactor = Math.max(1 - distance / spatialThreshold, 0);
        segmentRisk += whale.probability * 50 * proximityFactor;
      }
    }

    // Add to high-risk length if this segment exceeds risk threshold
    if (segmentRisk > 30) {
      highRiskLength += segmentLength;
    }

    // Accumulate risk score
    riskSum += segmentRisk;
  }

  // Final risk score calculations
  const riskScore = riskSum + (highRiskLength / totalLength) * 200;

  return {
    riskScore: riskScore.toFixed(4),
    details: {
      high_risk_length: highRiskLength.toFixed(2), // In kilometers
      total_length: totalLength.toFixed(2), // In kilometers
    },
  };
}

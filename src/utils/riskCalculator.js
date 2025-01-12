import { getDistance } from "geolib";

export function calculateRiskScore(
  whaleData,
  shipRoute,
  spatialThreshold = 10
) {
  const routeProbabilities = [];
  const segmentRisks = [];
  let totalLength = 0;
  let highRiskLength = 0;

  for (let i = 0; i < shipRoute.length - 1; i++) {
    const start = shipRoute[i];
    const end = shipRoute[i + 1];
    const segmentLength = getDistance(start, end) / 1000; // Convert to km
    totalLength += segmentLength;

    const segmentProbs = [];
    for (const whale of whaleData) {
      const distance = getDistance(start, whale);
      if (distance / 1000 <= spatialThreshold) {
        const timeDiff = Math.abs(new Date(start.time) - new Date(whale.time));
        if (timeDiff <= 3600 * 1000) {
          segmentProbs.push(whale.probability);
        }
      }
    }

    if (segmentProbs.length) {
      const avgProb =
        segmentProbs.reduce((a, b) => a + b) / segmentProbs.length;
      const maxProb = Math.max(...segmentProbs);
      routeProbabilities.push(avgProb);
      segmentRisks.push(maxProb);

      if (avgProb > 0.6) highRiskLength += segmentLength;
    }
  }

  const avgProbability =
    routeProbabilities.reduce((a, b) => a + b, 0) / routeProbabilities.length ||
    0;
  const maxProbability = Math.max(...segmentRisks, 0);
  const riskScore =
    0.5 * avgProbability +
    0.3 * maxProbability +
    0.2 * (highRiskLength / totalLength || 0);

  return [
    riskScore,
    { avgProbability, maxProbability, highRiskLength, totalLength },
  ];
}

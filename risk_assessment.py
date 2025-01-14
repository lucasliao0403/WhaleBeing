//converted to javascript, no longer used

import numpy as np
from geopy.distance import geodesic
from datetime import datetime

# get ur whale data
whale_data = [
  
]


# get ur ship route
ship_route = [
   
]

# calculate the risk score, like the prob of this ship crashing into a whale. if high then bad.
def calculate_risk_score(whale_data, ship_route, spatial_threshold=10):
    """
    Calculate the risk score for a ship route based on whale probabilities.
    """
    route_probabilities = []
    segment_risks = []
    total_length = 0
    high_risk_length = 0

    for i in range(len(ship_route) - 1):
        start = ship_route[i]
        end = ship_route[i + 1]

        # calculate the segment length
        segment_length = geodesic((start["lat"], start["lon"]), (end["lat"], end["lon"])).km
        total_length += segment_length

        # get probabilities for this segment
        segment_probs = []
        for whale in whale_data:
            # check distance
            distance = geodesic((start["lat"], start["lon"]), (whale["lat"], whale["lon"])).km
            if distance <= spatial_threshold:
                # check proximity like how close
                time_diff = abs(datetime.fromisoformat(start["time"][:-1]) - datetime.fromisoformat(whale["time"][:-1]))
                if time_diff.total_seconds() <= 3600:  # 1-hour threshold
                    segment_probs.append(whale["probability"])

        # gather probs for the segment
        if segment_probs:
            avg_prob = np.mean(segment_probs)
            max_prob = np.max(segment_probs)  # max probability for this segment
            route_probabilities.append(avg_prob)
            segment_risks.append(max_prob)  # store segment's max risk

            # check if this segment is high-risk zone
            if avg_prob > 0.6:  # this is threshold for high risk, u can change later
                high_risk_length += segment_length

    # calc overall risk metrics
    avg_probability = np.mean(route_probabilities) if route_probabilities else 0
    max_probability = np.max(segment_risks) if segment_risks else 0
    risk_score = (
        0.5 * avg_probability +  # adjust this weight (w1)
        0.3 * max_probability +  # adjust weight (w2)
        0.2 * (high_risk_length / total_length if total_length > 0 else 0)  # also adjust weight(w3)
    )

    return risk_score, {
        "avg_probability": avg_probability,
        "max_probability": max_probability,
        "high_risk_length": high_risk_length,
        "total_length": total_length
    }

# calculat risk
risk_score, details = calculate_risk_score(whale_data, ship_route)
print(f"Risk Score: {risk_score:.2f}")
print("Details:", details)

import React, { useEffect, useRef } from "react";
import Plotly from "plotly.js";

const Map = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    const data = [
      {
        type: "densitymap",
        lon: [10, 20, 30],
        lat: [15, 25, 35],
        z: [1, 3, 2],
        radius: 50,
        colorbar: { y: 1, yanchor: "top", len: 0.45 },
      },
      {
        type: "densitymap",
        lon: [-10, -20, -30],
        lat: [15, 25, 35],
        radius: [50, 100, 10],
        colorbar: { y: 0, yanchor: "bottom", len: 0.45 },
      },
    ];

    const layout = {
      map: {
        style: "light",
        center: { lat: 20 },
      },
      width: 600,
      height: 400,
    };

    Plotly.newPlot(mapRef.current, data, layout);
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
};

export default Map;

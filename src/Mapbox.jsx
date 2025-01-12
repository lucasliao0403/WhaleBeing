import React, { useEffect, useState } from "react";
import MapGL, { Source, Layer } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import animationData from "./data.json"; // Replace with your JSON data

// Set your Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoiZ29yZG9uMTExIiwiYSI6ImNtNXNybmJsdjBwMXAyaXEwYmFrcHhkZ3oifQ.geYSJx3MGvrpjT5WtJGvqQ";

const HeatmapAnimation = () => {
  const [viewport, setViewport] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 1,
    bearing: 0,
    pitch: 0,
  });

  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prevFrame) => (prevFrame + 1) % animationData.length); // Loop through frames
    }, 25); // Set frame duration in milliseconds (25ms for fast animation)

    return () => clearInterval(interval); // Clean up the interval on unmount
  }, []);

  const currentData = animationData[currentFrame]?.data || [];

  const geojson = {
    type: "FeatureCollection",
    features: currentData.map((point) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [point.longitude, point.latitude],
      },
      properties: {
        weight: point.weight,
      },
    })),
  };

  return (
    <MapGL
      {...viewport}
      width="100%"
      height="100%"
      onViewportChange={setViewport}
      mapStyle="mapbox://styles/mapbox/light-v10"
    >
      <Source id="heatmap" type="geojson" data={geojson}>
        <Layer
          id="heatmap-layer"
          type="heatmap"
          paint={{
            "heatmap-weight": ["get", "weight"],
            "heatmap-intensity": 1,
            "heatmap-radius": 20,
            "heatmap-opacity": 0.8,
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(33,102,172,0)",
              0.2,
              "rgb(103,169,207)",
              0.4,
              "rgb(209,229,240)",
              0.6,
              "rgb(253,219,199)",
              0.8,
              "rgb(239,138,98)",
              1,
              "rgb(178,24,43)",
            ],
          }}
        />
      </Source>
    </MapGL>
  );
};

export default HeatmapAnimation;

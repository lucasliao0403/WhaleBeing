"use client";
import { useEffect, useRef, useState } from "react";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";


import React from "react";
const heatmapData = [
  { lat: 37.782551, lng: -122.445368 },
  { lat: 37.782745, lng: -122.444586 },
  { lat: 37.78319, lng: -122.443203 },
  { lat: 37.784272, lng: -122.442417 },
  { lat: 37.785337, lng: -122.441652 },
  // Add more coordinates here
];
const getMarkerStyle = (weight) => {
  const maxWeight = 5; // Maximum weight (adjust as per your dataset)
  const normalizedWeight = weight / maxWeight; // Normalize weight for opacity/size

  // You can change the colors to create a heatmap-like color gradient
  const color = `rgba(255, ${Math.floor(
    255 * (1 - normalizedWeight)
  )}, 0, ${normalizedWeight})`; // Red to yellow
  const size = normalizedWeight * 30; // Increase size for higher weight markers

  return {
    color: color,
    size: size,
    opacity: normalizedWeight, // Adjust opacity based on weight
  };
};
export default function WhaleMap() {
  const getMarkerStyle = (weight) => {
    // This function returns a custom style based on the marker weight
    const opacity = weight / 5; // Normalize weight for opacity (for example)
    const size = weight * 10; // Scale the size of the marker based on weight
    const color = `rgba(255, 0, 0, ${opacity})`; // Change color based on weight

    return {
      color: color,
      size: size,
    };
  };
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_API_KEY}>
      <div style={{ height: "100vh", width: "100%" }}>
        <Map
          defaultZoom={13}
          defaultCenter={{ lat: -33.860664, lng: 151.208138 }}
          onCameraChanged={(ev) =>
            console.log(
              "camera changed:",
              ev.detail.center,
              "zoom:",
              ev.detail.zoom
            )
          }
          mapId={import.meta.env.VITE_MAP_ID}
        />
        <AdvancedMarker position={{ lat: -33.860664, lng: 151.208138 }}>
          {" "}
          <div
            style={{
              width: "32px", // Specify the unit for width
              height: "32px", // Specify the unit for height
              backgroundColor: "red",
              borderRadius: "50%", // Optional, to make the marker round
              background:
                "radial-gradient(circle, rgba(255, 0, 0, 1) 0%, rgba(255, 0, 0, 0) 90%)", // Dark red at center, fades to transparent
            }}
          ></div>
        </AdvancedMarker>
      </div>
    </APIProvider>
  );
}

"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";

import React from "react";

export default function WhaleMap() {
  const position = { lat: 53.45, lng: 10 };
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_API_KEY}>
      <div style={{ height: "100vh", width: "100%" }}>
        <Map zoom={9} center={position}></Map>
      </div>
    </APIProvider>
  );
}
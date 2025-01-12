import TextInput from "./getShip";
import "./App.css";
import { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const [shipPoints, setShipPoints] = useState([]);

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiZ29yZG9uMTExIiwiYSI6ImNtNXNybmJsdjBwMXAyaXEwYmFrcHhkZ3oifQ.geYSJx3MGvrpjT5WtJGvqQ";

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v10",
      center: [0, 0], // Center of the map
      zoom: 2, // Adjust zoom level
    });

    mapRef.current.on("load", () => {
      // Add a source for the heatmap
      mapRef.current.addSource("heatmap-source", {
        type: "geojson",
        data: "./src/output.geojson",
      });

      // Add a heatmap layer
      mapRef.current.addLayer({
        id: "heatmap-layer",
        type: "heatmap",
        source: "heatmap-source",
        paint: {
          "heatmap-intensity": 1, // Adjust overall intensity
          "heatmap-radius": 20, // Radius of each point in pixels
          "heatmap-opacity": 0.6, // Opacity of the heatmap
        },
      });
    });

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  return (
    <div>
      <div
        id="map-container"
        ref={mapContainerRef}
        style={{ height: "100vh", width: "100%" }}
      />

      <TextInput shipPoints={shipPoints} setShipPoints={setShipPoints} />
    </div>
  );
}

export default App;

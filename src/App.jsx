import TextInput from "./getShip";
import "./App.css";
import { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { calculateRiskScore } from "./Risk.jsx"; // Import the risk assessment function
import { parseWhaleCSV } from "./parseWhaleCSV"; // Import the whale CSV parser

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const [shipPoints, setShipPoints] = useState([]);
  const [whaleData, setWhaleData] = useState([]);
  const [riskScore, setRiskScore] = useState(null);
  const [riskDetails, setRiskDetails] = useState(null);

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

  // Load and parse whale data
  useEffect(() => {
    const fetchWhaleData = async () => {
      try {
        const response = await fetch("/path-to-whale-data.csv"); // Update the path to your whale CSV
        const csvText = await response.text();
        const parsedData = await parseWhaleCSV(csvText);
        setWhaleData(parsedData);
      } catch (error) {
        console.error("Error loading whale data:", error);
      }
    };

    fetchWhaleData();
  }, []);

  // Calculate risk score when shipPoints or whaleData changes
  useEffect(() => {
    if (shipPoints.length > 0 && whaleData.length > 0) {
      const risk = calculateRiskScore(whaleData, shipPoints);
      setRiskScore(risk.riskScore);
      setRiskDetails(risk.details);
    }
  }, [shipPoints, whaleData]);

  console.log("Ship Points:", shipPoints);
  console.log("Whale Data:", whaleData);

  return (
    <div>
      <div
        id="map-container"
        ref={mapContainerRef}
        style={{ height: "100vh", width: "100%" }}
      />

      <TextInput shipPoints={shipPoints} setShipPoints={setShipPoints} />

      {/* Risk Score Display */}
      {riskScore && (
        <div className="riskBox">
          <h3>Risk Score: {riskScore}</h3>
          <pre>{JSON.stringify(riskDetails, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;

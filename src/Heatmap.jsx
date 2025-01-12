import TextInput from "./getShip";
import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZ29yZG9uMTExIiwiYSI6ImNtNXNybmJsdjBwMXAyaXEwYmFrcHhkZ3oifQ.geYSJx3MGvrpjT5WtJGvqQ";

const Heatmap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [timeChunks, setTimeChunks] = useState([]);
  const [startDate, setStartDate] = useState("01-01");
  const [endDate, setEndDate] = useState("");
  const [shipPoints, setShipPoints] = useState([]);

  const geojsonBaseUrl = "/data/daily_geojsons";

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v10",
      center: [-130.0, 40.5], // Centered around the California coast
      zoom: 4.6,
    });

    map.current.on("load", () => {
      map.current.addSource("heatmap-source", {
        type: "geojson",
        data:
          timeChunks.length > 0
            ? `${geojsonBaseUrl}/${timeChunks[0]}.geojson`
            : null,
      });

      map.current.addLayer({
        id: "heatmap-layer",
        type: "heatmap",
        source: "heatmap-source",
        paint: {
          "heatmap-weight": ["get", "weight"],
          "heatmap-intensity": 1,
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
          "heatmap-radius": 20,
          "heatmap-opacity": 0.8,
        },
      });
    });
  }, []);

  useEffect(() => {
    if (!map.current || timeChunks.length === 0) return;

    const interval = setInterval(() => {
      setCurrentTimestamp((prev) => (prev + 1) % timeChunks.length);
    }, 50);

    return () => clearInterval(interval);
  }, [timeChunks]);

  useEffect(() => {
    if (map.current && timeChunks.length > 0) {
      const source = map.current.getSource("heatmap-source");
      if (source) {
        source.setData(
          `${geojsonBaseUrl}/${timeChunks[currentTimestamp]}.geojson`
        );
      }
    }
  }, [currentTimestamp, timeChunks]);

  const generateTimeChunks = () => {
    if (!startDate) {
      alert("Please provide a valid start date.");
      return;
    }

    const start = new Date(`2023-${startDate}`);
    const chunks = [];

    if (endDate) {
      const end = new Date(`2023-${endDate}`);
      while (start <= end) {
        chunks.push(start.toISOString().split("T")[0]);
        start.setDate(start.getDate() + 1);
      }
    } else {
      // Static heatmap for the single start date
      chunks.push(start.toISOString().split("T")[0]);
    }

    setTimeChunks(chunks);
    setCurrentTimestamp(0);
  };

// Update the line source whenever shipPoints changes
useEffect(() => {
  if (map.current && map.current.isStyleLoaded()) {
    console.log("map loaded")
    
    if (shipPoints.length > 0) {
      console.log("Shippoints length > 1 (update)")
      const source = map.current.getSource('route-source');
      
      if (source) {
        console.log("source exists")
        source.setData({
          "type": "FeatureCollection",
          "features": [{
              "type": "Feature",
              "properties": {"name": "Null Island"},
              "geometry": {
                  "type": "LineString",
                  "coordinates": shipPoints
              }
          }]
      })
        
      }
      else {
        console.log("no source")
        map.current.removeSource('route-source')
        map.current.addSource('route-source', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: shipPoints
            }}
        })

      }
    }
  }
}, [shipPoints]);

console.log(shipPoints);

  return (
    <div>
      <div
        style={{
          padding: "10px",
          background: "#222",
          color: "#fff",
          position: "absolute",
          zIndex: 5,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <input
          type="text"
          placeholder="MM-DD"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          maxLength={5}
          style={{
            background: "transparent",
            border: "1px solid #555",
            color: "#fff",
            borderRadius: "4px",
            padding: "5px 10px",
            width: "80px",
            textAlign: "center",
            fontSize: "14px",
          }}
        />
        
        <button
          onClick={generateTimeChunks}
          style={{
            background: "#444",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            padding: "5px 10px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Load Data
        </button>
      </div>
      {timeChunks.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "0px",
            background: "rgba(0, 0, 0, 0.5)",
            color: "#fff",
            padding: "5px 10px",
            borderRadius: "4px",
            fontSize: "14px",
            zIndex: 2,
          }}
        >
          {timeChunks[currentTimestamp]}
        </div>
      )}
      <TextInput shipPoints={shipPoints} setShipPoints={setShipPoints} />
      <div ref={mapContainer} style={{ width: "100vw", height: "100vh" }} />
    </div>
  );
};

export default Heatmap;

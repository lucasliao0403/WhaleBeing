import TextInput from "./getShip";
import "./App.css";
import { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const [shipPoints, setShipPoints] = useState([]);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [timeChunks, setTimeChunks] = useState([]);
  const [startDate, setStartDate] = useState("01-01");
  const [endDate, setEndDate] = useState("02-01");
  
  const geojsonBaseUrl = "/data/daily_geojsons";

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiZ29yZG9uMTExIiwiYSI6ImNtNXNybmJsdjBwMXAyaXEwYmFrcHhkZ3oifQ.geYSJx3MGvrpjT5WtJGvqQ";

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v10",
      center: [-130.0, 40.5], // Centered around California
      zoom: 5, // Adjust zoom level
    });

    mapRef.current.on("load", () => {
      // Add heatmap source
      mapRef.current.addSource("heatmap-source", {
        type: "geojson",
        data: timeChunks.length > 0 ? `${geojsonBaseUrl}/${timeChunks[0]}.geojson` : null,
      });

      mapRef.current.addLayer({
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
            0, "rgba(33,102,172,0)",
            0.2, "rgb(103,169,207)",
            0.4, "rgb(209,229,240)",
            0.6, "rgb(253,219,199)",
            0.8, "rgb(239,138,98)",
            1, "rgb(178,24,43)",
          ],
          "heatmap-radius": 20,
          "heatmap-opacity": 0.8,
        },
      });

      // Add route layer
      mapRef.current.addSource('route-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: shipPoints
          }
        }
      });

      mapRef.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#FFF',
          'line-width': 10
        }
      });
    });

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || timeChunks.length === 0) return;

    const interval = setInterval(() => {
      setCurrentTimestamp((prev) => (prev + 1) % timeChunks.length);
    }, 50);

    return () => clearInterval(interval);
  }, [timeChunks]);

  useEffect(() => {
    if (mapRef.current && timeChunks.length > 0) {
      const source = mapRef.current.getSource("heatmap-source");
      if (source) {
        source.setData(`${geojsonBaseUrl}/${timeChunks[currentTimestamp]}.geojson`);
      }
    }
  }, [currentTimestamp, timeChunks]);

  // Update the line source whenever shipPoints changes
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      if (shipPoints.length > 0) {
        const source = mapRef.current.getSource('route-source');
        if (source) {
          source.setData({
            "type": "FeatureCollection",
            "features": [{
              "type": "Feature",
              "properties": {"name": "Ship Route"},
              "geometry": {
                "type": "LineString",
                "coordinates": shipPoints
              }
            }]
          });
        }
      }
    }
  }, [shipPoints]);

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
        chunks.push(start.toISOString(1).split("T")[0]);
        start.setDate(start.getDate() + 1);
      }
    } else {
      // Static heatmap for the single start date
      chunks.push(start.toISOString().split("T")[0]);
    }

    console.log(chunks)

    setTimeChunks(chunks);
    setCurrentTimestamp(0);
  };

 return (
     <div>
       <div
         style={{
           padding: "10px",
           background: "#222",
           color: "#fff",
           position: "absolute",
           zIndex: 1,
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
         <input
           type="text"
           placeholder="MM-DD"
           value={endDate}
           onChange={(e) => setEndDate(e.target.value)}
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
       <div ref={mapContainerRef} style={{ width: "100vw", height: "100vh" }} />
     </div>
   );
 };
 
 export default App;
 

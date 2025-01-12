import { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";
import "./App.css"; // Ensure you have the appropriate CSS
import { calculateRisk } from "./riskCalculator";

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const [shipPoints, setShipPoints] = useState([]);
  const [whaleData, setWhaleData] = useState([]);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [timeChunks, setTimeChunks] = useState([]);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [shipIdentifier, setShipIdentifier] = useState();
  const [theme, setTheme] = useState("light"); // Add theme state
  const [riskScore, setRiskScore] = useState(null); // For storing the calculated ri

  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const geojsonFilePath = "/data/daily_geojsons/2023-06-01.geojson";

  async function logRiskScore(shipPoints, whaleData) {
    const result = await calculateRisk(shipPoints, whaleData);
    console.log("Risk Score:", result.riskScore);
    console.log("Details:", result.details);
  }

  // if (shipPoints) {
  //   console.log(shipPoints);
  // } else {
  //   console.log("no points");
  // }

  const geojsonBaseUrl = "/data/daily_geojsons";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResponse("");

    generateTimeChunks();

    const startDateTime = `${startDate}T00:00:00`;
    const endDateTime = `${endDate}T00:00:00`;
    // print("fetching")
    try {
      const result = await axios.get("http://127.0.0.1:5000/ship-data", {
        params: {
          imo: shipIdentifier,
          start_date: startDateTime,
          end_date: endDateTime,
        },
      });
      setResponse(result.data); // Assuming the API returns some response data
      setShipPoints(result.data.features[0].geometry.coordinates[0]);

      // Fetch whale data from 2023-06-01.geojson
      const whaleRes = await fetch(geojsonFilePath);
      if (!whaleRes.ok) throw new Error(`Failed to fetch ${geojsonFilePath}`);
      const geojson = await whaleRes.json();
      setWhaleData(geojson.features);

      // // Calculate risk
      // if (shipPoints && geojson.features.length > 0) {
      //   const riskResult = await calculateRisk(shipPoints, geojson.features);
      //   console.log("Risk Score:", riskResult.riskScore);
      // }

      // Calculate risk
      if (shipPoints && geojson.features.length > 0) {
        const riskResult = await calculateRisk(shipPoints, geojson.features);
        setRiskScore(riskResult.riskScore); // Update state with the calculated risk score
        console.log("Risk Score:", riskResult.riskScore);
      }

      console.log();
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiZ29yZG9uMTExIiwiYSI6ImNtNXNybmJsdjBwMXAyaXEwYmFrcHhkZ3oifQ.geYSJx3MGvrpjT5WtJGvqQ";

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style:
        theme === "light"
          ? "mapbox://styles/gordon111/cm5ti9unu005501rw39yr9q7o"
          : "mapbox://styles/mapbox/dark-v10", // Update style based on theme
      center: [-125.0, 38.5], // Centered around California
      zoom: 5, // Adjust zoom level
    });

    mapRef.current.on("load", () => {
      // Add heatmap source
      mapRef.current.addSource("heatmap-source", {
        type: "geojson",
        data:
          timeChunks.length > 0
            ? `${geojsonBaseUrl}/${timeChunks[0]}.geojson`
            : null,
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

      // Add route layer
      mapRef.current.addSource("route-source", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: shipPoints,
          },
        },
      });

      mapRef.current.addLayer({
        id: "route",
        type: "line",
        source: "route-source",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#fff", // Updated color to match the app's color scheme
          "line-width": 5, // Adjusted line width
          "line-blur": 2, // Added blur to create a glow effect
          "line-opacity": 0.8, // Adjust opacity for better glow effect
        },
      });
    });

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, [theme, timeChunks, shipPoints]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    if (!mapRef.current || timeChunks.length === 0) return;

    const interval = setInterval(() => {
      setCurrentTimestamp((prev) => (prev + 1) % timeChunks.length);
    }, 100);

    return () => clearInterval(interval);
  }, [timeChunks]);

  useEffect(() => {
    if (mapRef.current && timeChunks.length > 0) {
      const source = mapRef.current.getSource("heatmap-source");
      if (source) {
        source.setData(
          `${geojsonBaseUrl}/${timeChunks[currentTimestamp]}.geojson`
        );
      }
    }
  }, [currentTimestamp, timeChunks]);

  // Update the line source whenever shipPoints changes
  useEffect(() => {
    console.log("points updated");
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      if (shipPoints.length > 0) {
        const source = mapRef.current.getSource("route-source");
        if (source) {
          source.setData({
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: { name: "Ship Route" },
                geometry: {
                  type: "LineString",
                  coordinates: shipPoints,
                },
              },
            ],
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

    const start = new Date(`2023-${startDate.substring(5, startDate.length)}`);
    const chunks = [];

    // console.log(startDate)
    // console.log(start)

    if (endDate) {
      const end = new Date(`2023-${endDate.substring(5, endDate.length)}`);
      while (start <= end) {
        chunks.push(start.toISOString(1).split("T")[0]);
        start.setDate(start.getDate() + 1);
      }
    } else {
      // Static heatmap for the single start date
      chunks.push(start.toISOString().split("T")[0]);
    }

    // console.log(chunks);

    setTimeChunks(chunks);
    setCurrentTimestamp(0);
  };

  return (
    <div className={theme === "light" ? "light-theme" : "dark-theme"}>
      <div className="absolute p-2 bg-transparent text-white rounded-lg z-10 flex flex-col gap-2 align-items-center align-center justify-center w-60">
        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            maxLength={5}
            className={`bg-transparent border rounded px-2 py-1 w-auto text-center text-sm ${
              theme === "light"
                ? "border-gray-600 text-black"
                : "border-gray-600 text-white"
            }`}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            maxLength={5}
            className={`bg-transparent border rounded px-2 py-1 w-auto text-center text-sm ${
              theme === "light"
                ? "border-gray-600 text-black"
                : "border-gray-600 text-white"
            }`}
          />
        </div>

        <input
          type="text"
          placeholder="Ship IMO Number"
          value={shipIdentifier}
          onChange={(e) => setShipIdentifier(e.target.value)}
          className={`bg-transparent border rounded px-2 py-1 w-auto text-center text-sm m-0 ${
            theme === "light"
              ? "border-gray-600 text-black"
              : "border-gray-600 text-white"
          }`}
        />
        <button
          onClick={handleSubmit}
          className={`border-none rounded px-2 py-1 cursor-pointer text-sm m-0 
              bg-gray-600 text-white `}
        >
          Load Data
        </button>
        {loading && (
          <p
            className={`loadingText ${
              theme === "light" ? "text-black" : "text-white"
            }`}
          >
            Loading...
          </p>
        )}
        {error && (
          <p
            className={`errorText ${
              theme === "light" ? "text-black" : "text-white"
            }`}
          >
            Error: {error}
          </p>
        )}
        {riskScore && (
          <div
            className={`mt-2 p-2 rounded ${
              theme === "light"
                ? "bg-white text-black border-gray-600"
                : "bg-black text-white border-gray-600"
            }`}
          >
            Risk Score: {riskScore}
          </div>
        )}
      </div>

      <button
        onClick={toggleTheme}
        className={`absolute z-10 bottom-10 left-2 border-none rounded px-2 py-1 cursor-pointer text-sm 
        bg-gray-600 text-white`}
      >
        {theme === "light" ? "Dark" : "Light"}
      </button>

      <div
        className={`absolute z-10 bottom-5 right-0 bg-opacity-60 border-none rounded px-2 py-1 text-sm ${
          theme === "light" ? "bg-white text-black" : "bg-black text-white"
        }`}
      >
        {new Date(timeChunks[currentTimestamp]).toLocaleDateString()}
      </div>

      <div ref={mapContainerRef} className="w-full h-screen" />
    </div>
  );
}

export default App;

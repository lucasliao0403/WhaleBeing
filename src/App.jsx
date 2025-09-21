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
      const result = await axios.get(
        "https://whalebeingbackend-jrw6.onrender.com/ship-data",
        {
          params: {
            imo: shipIdentifier,
            start_date: startDateTime,
            end_date: endDateTime,
          },
        }
      );
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
      console.log("CALCULATING RISK");
      const riskResult = await calculateRisk(shipPoints, geojson.features);
      setRiskScore(riskResult.riskScore); // Update state with the calculated risk score
      console.log("Risk Score:", riskResult.riskScore);
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
      center: [-122.0, 38.5], // Centered around California
      zoom: 4.5, // Adjust zoom level
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
          "line-color": theme === "light" ? "#3b5f7d" : "#fff", // Updated color to match the app's color scheme
          "line-width": 3, // Adjusted line width
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

  const getRiskScoreColor = (score) => {
    if (score === 0) {
      return "rgba(33,102,172,0)";
    } else if (score <= 0.2) {
      return "rgb(103,169,207)";
    } else if (score <= 0.4) {
      return "rgb(209,229,240)";
    } else if (score <= 0.6) {
      return "rgb(253,219,199)";
    } else if (score <= 0.8) {
      return "rgb(239,138,98)";
    } else if (score <= 1) {
      return "rgb(178,24,43)";
    }
    return "red"; // Default case if none of the above conditions match
  };

  return (
    <div className={theme === "light" ? "light-theme" : "dark-theme"}>
      <div ref={mapContainerRef} className="w-full h-screen" />

      <div className="absolute top-20 left-20 transform  p-4 bg-transparent text-white rounded-lg z-10 flex flex-col gap-5 align-items-center align-center justify-center w-100">
        <h1
          className={`text-4xl font-bold ${
            theme === "light" ? "text-gray-800" : "text-white"
          }`}
          style={{ fontFamily: "Domine, serif" }}
        >
          WhaleBeing
        </h1>
        <h2
          className={`text-base font-light ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
          style={{ marginTop: "-15px" }}
        >
          Prediction model for whale-ship interactions.
        </h2>
        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            maxLength={5}
            className={`border rounded px-2 py-1 w-auto text-center text-sm ${
              theme === "light"
                ? "border-gray-600 text-black"
                : "border-gray-600 text-white"
            }`}
            style={{
              backgroundColor:
                theme === "light"
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(0, 0, 0, 0.3)",
            }}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            maxLength={5}
            className={`border rounded px-2 py-1 w-auto text-center text-sm ${
              theme === "light"
                ? "border-gray-600 text-black"
                : "border-gray-600 text-white"
            }`}
            style={{
              backgroundColor:
                theme === "light"
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(0, 0, 0, 0.3)",
            }}
          />
        </div>

        <input
          type="text"
          placeholder="Ship IMO Number"
          onChange={(e) => setShipIdentifier(e.target.value)}
          className={`bg-white border rounded px-2 py-1 w-auto text-center text-sm m-0 ${
            theme === "light"
              ? "border-gray-600 text-black"
              : "border-gray-600 text-white"
          }`}
          style={{
            width: "225px",
            backgroundColor:
              theme === "light"
                ? "rgba(255, 255, 255, 0.3)"
                : "rgba(0, 0, 0, 0.3)",
          }}
        />

        <button
          onClick={handleSubmit}
          className={`w-1/3 border-none rounded px-2 py-1 cursor-pointer text-sm m-0 bg-gray-600 text-white `}
        >
          Track Ship
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
            className={`mt-2 p-2 w-1/2 rounded text-sm ${
              theme === "light" ? "bg-white text-black " : "bg-black text-white"
            }`}
            style={{ backgroundColor: getRiskScoreColor(riskScore) }}
          >
            Risk Score: <b>{riskScore * 100}%</b>
          </div>
        )}
      </div>
      <button
        onClick={toggleTheme}
        className={`absolute z-10 bottom-1 left-0 border-none px-2 py-1 text-xs
          ${theme === "light" ? "bg-[#F0F4F7]" : "bg-[#8C8D8D]"} text-black`}
      >
        Toggle theme (<b>{theme === "light" ? "Dark" : "Light"}</b>)
      </button>

      <div className="absolute z-10 bottom-5 right-0 bg-opacity-50 border-none px-2 py-1 text-xs bg-white text-black">
        <b>
          {new Date(timeChunks[currentTimestamp]).toLocaleDateString(
            undefined,
            { month: "long", day: "numeric" }
          )}
        </b>
        , Abrahms et al., 2019. Dynamic ensemble models. Ecol. Appl. 29(6):
        e01977
      </div>
    </div>
  );
}

export default App;

import TextInput from "./getShip";
import "./App.css";
import { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const [shipPoints, setShipPoints] = useState([]);
  const [date, setDate] = useState("2023-01-01");
  const [geojsonPath, setGeojsonPath] = useState(
    `/public/data/daily_geojsons/${date}.geojson`
  );

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  useEffect(() => {
    setGeojsonPath(`/public/data/daily_geojsons/${date}.geojson`);

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
        data: geojsonPath,
      });

      // Add a heatmap layer
      mapRef.current.addLayer({
        id: "heatmap-layer",
        type: "heatmap",
        source: "heatmap-source",
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "weight"], // Dynamically fetch the "weight" property from the GeoJSON data
            0,
            0, // If weight is 0, heatmap weight will be 0
            1,
            1, // If weight is 1, heatmap weight will be 1
          ],
          "heatmap-radius": 20, // Radius of each point in pixels
          "heatmap-opacity": 0.6, // Opacity of the heatmap
        },
      });
    });

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, [date, geojsonPath]);

  return (
    <div>
      <div
        id="map-container"
        ref={mapContainerRef}
        style={{ height: "100vh", width: "100%" }}
      />
      <div
        className="dateselect"
        style={{
          position: "absolute",
          top: "5%",
          left: "85%",
        }}
      >
        <input
          id="dateInput"
          type="date"
          value={date} // Bind the input value to the state
          onChange={handleDateChange} // Update the state when the date is changed
          style={{
            padding: "15px",
            borderRadius: "10px",
            backgroundColor: "black", // Black background
            color: "white", // White text
            border: "1px solid white", // White border
            appearance: "none", // Disable default appearance (on some browsers)
          }}
        />
      </div>
      <TextInput shipPoints={shipPoints} setShipPoints={setShipPoints} />
    </div>
  );
}

export default App;

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
      center: [-122.486052, 37.830348], // Center of the map
      zoom: 10, // Adjust zoom level
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

        // console.log("shipPoints has data")
      mapRef.current.addSource('route-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: shipPoints
          }}
      })
      
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


  // Update the line source whenever shipPoints changes
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      console.log("mapref loaded")
      
      if (shipPoints.length > 0) {
        console.log("Shippoints length > 1 (update)")
        const source = mapRef.current.getSource('route-source');
        
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
          mapRef.current.removeSource('route-source')
          mapRef.current.addSource('route-source', {
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
        id="map-container"
        ref={mapContainerRef}
        style={{ height: "100vh", width: "100%" }}
      />

      <TextInput shipPoints={shipPoints} setShipPoints={setShipPoints} />
    </div>
  );
}

export default App;

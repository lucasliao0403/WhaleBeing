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

  // let test1 = {
  //   type: 'Feature1',
  //   properties: {},
  //   geometry: {
  //     type: 'LineString',
  //     coordinates: shipPoints
  //   }
  // }

  // let test2 = {
  //   type: 'Feature2',
  //   properties: {},
  //   geometry: {
  //     type: 'LineString',
  //     coordinates: [[-122.483696, 37.833818],
  //     [-122.483482, 37.833174],
  //     [-122.483396, 37.8327],
  //     [-122.483568, 37.832056],
  //     [-122.48404, 37.831141],
  //     [-122.48404, 37.830497],
  //     [-122.483482, 37.82992],
  //     [-122.483568, 37.829548],
  //     [-122.48507, 37.829446],
  //     [-122.4861, 37.828802],
  //     [-122.486958, 37.82931],
  //     [-122.487001, 37.830802],
  //     [-122.487516, 37.831683],
  //     [-122.488031, 37.832158],
  //     [-122.488889, 37.832971],
  //     [-122.489876, 37.832632],
  //     [-122.490434, 37.832937],
  //     [-122.49125, 37.832429],
  //     [-122.491636, 37.832564],
  //     [-122.492237, 37.833378],
  //     [-122.493782, 37.833683]
        
  //     ]
  //   }
  // }

  // console.log(test1)
  // console.log(test2)

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

import TextInput from "./getShip";
import "./App.css";
import WhaleMap from "./WhaleMap";
import { useState, useEffect } from "react";

function App() {
  const [shipPoints, setShipPoints] = useState([]);
  console.log(shipPoints)
  
  return (
    <div>
      <WhaleMap />
      <TextInput shipPoints={shipPoints} setShipPoints={setShipPoints} />
    </div>
  )
  
}

export default App;

"use client"; // For Next.js environments, if required

import { useState } from "react";
import axios from "axios";
import "./getShip.css"; // Import the CSS file
import { ENDPOINTS } from "./constants";

export default function TextInput(props) {
  const [inputValue, setInputValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setInputValue(e.target.value);
  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResponse("");

    const startDateTime = `${startDate}T00:00:00`;
    const endDateTime = `${endDate}T00:00:00`;

    try {
      const result = await axios.get(ENDPOINTS.SHIP_DATA, {
        params: {
          imo: inputValue,
          start_date: startDateTime,
          end_date: endDateTime,
        },
      });
      console.log("API Response:", result.data);
      setResponse(result.data);

      // Handle the response structure safely
      if (result.data && result.data.features && result.data.features.length > 0 &&
          result.data.features[0].geometry && result.data.features[0].geometry.coordinates &&
          result.data.features[0].geometry.coordinates.length > 0) {
        props.setShipPoints(result.data.features[0].geometry.coordinates[0]);
      } else {
        console.error("Unexpected API response structure:", result.data);
        setError("Invalid response structure from API");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="searchBar">
      <div className="inputContainer">
        <h1 className="title" value="Whale Being" />
        <input
          id="textInput"
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder="Ship IMO Number"
          className="inputField"
        />

        {/* Date inputs container */}
        <div className="dateInputs">
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            placeholder="Start Date"
            className="inputField dateField"
          />
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            placeholder="End Date"
            className="inputField dateField"
          />
        </div>

        <button type="submit" className="submitButton" onClick={handleSubmit}>
          Search
        </button>
      </div>

      {loading && <p className="loadingText">Loading...</p>}
      {error && <p className="errorText">Error: {error}</p>}
    </div>
  );
}

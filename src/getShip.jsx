'use client'; // For Next.js environments, if required

import { useState, useEffect } from "react";
import axios from "axios";
import { use } from "react";

export default function TextInput() {
  const [inputValue, setInputValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // RESULTS:
  const [points, setPoints] = useState([]);

  const handleChange = (e) => setInputValue(e.target.value);
  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);

  useEffect(() => {
    // do something with the points
  }, [points]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResponse("");

    // Append default time to date (00:00:00) before sending
    const startDateTime = `${startDate}T00:00:00`;
    const endDateTime = `${endDate}T00:00:00`;

    try {
      const result = await axios.get("http://127.0.0.1:5000/ship-data", {
        params: { imo: inputValue, start_date: startDateTime, end_date: endDateTime },
      });
      setResponse(result.data); // Assuming the API returns some response data
      setPoints(result.data.features[0].geometry.coordinates[0]);
      console.log(result.data.features[0].geometry.coordinates[0])
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="space-y-4">
        <label htmlFor="textInput" className="block text-lg font-medium text-gray-700">
          Enter IMO:
        </label>
        <input
          id="textInput"
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder="Enter IMO"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        {/* Start Date Input */}
        <label htmlFor="startDate" className="block text-lg font-medium text-gray-700">
          Start Date:
        </label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        {/* End Date Input */}
        <label htmlFor="endDate" className="block text-lg font-medium text-gray-700">
          End Date:
        </label>
        <input
          id="endDate"
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>

      {loading && <p className="mt-4 text-gray-500">Loading...</p>}
      {error && <p className="mt-4 text-red-500">Error: {error}</p>}
      {response && (
        <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-md">
          <p className="text-gray-700">Response:</p>
          <pre className="text-sm text-gray-600">{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

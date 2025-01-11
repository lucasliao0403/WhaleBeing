'use client'; // For Next.js environments, if required

import { useState } from "react";
import axios from "axios";

export default function TextInput() {
  const [inputValue, setInputValue] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setInputValue(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResponse("");
    try {
      const result = await axios.get("http://127.0.0.1:5000/ship-data", {
        params: { imo: inputValue },
      });
      print(result)
      setResponse(result.data); // Assuming the API returns some response data
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="textInput" className="block text-lg font-medium text-gray-700">
          Enter text:
        </label>
        <input
          id="textInput"
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder="Type something..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          Submit
        </button>
      </form>

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

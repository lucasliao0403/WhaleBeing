import Papa from "papaparse";

export async function parseWhaleCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true, // Assumes the first line contains column names
      skipEmptyLines: true,
      complete: (results) => {
        const whaleData = results.data.map((row) => ({
          lat: parseFloat(row.lat), // Assuming CSV has "lat" column
          lon: parseFloat(row.lon), // Assuming CSV has "lon" column
          probability: parseFloat(row.probability), // Assuming CSV has "probability" column
        }));
        resolve(whaleData);
      },
      error: (error) => reject(error),
    });
  });
}

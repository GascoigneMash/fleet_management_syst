const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
const PORT = 5000;

app.get('/your-api-endpoint', (req, res) => {
    res.json({ routeData: 'Your data here' }); // Send JSON data
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// Use JSON parsing middleware for incoming requests
app.use(express.json());

// CORS configuration - Allow requests from http://localhost:5000
app.use(cors({
  origin: 'http://localhost:5000',  // Allow frontend (localhost:5000) to make requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allow these HTTP methods
  allowedHeaders: 'Content-Type,Authorization',  // Allow these headers
}));

// POST route for optimized route
app.post('/get-optimized-route', async (req, res) => {
  const { origin, destination, travelMode, avoidTolls, avoidHighways } = req.body;

  const apiKey = "AIzaSyAVQ11b4em7asW3XQIxPjOr0yZk3qZT7hg";  // Replace with your actual API key
  const routesUrl = "https://maps.googleapis.com/maps/api/directions/json";  // Directions API

  // Log the received request for debugging
  console.log("Received request:", req.body);

  try {
    // Log the parameters before making the request to Google Directions API
    console.log("Making request to Google Directions API with params:", {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode: travelMode || 'driving',
      avoidTolls: avoidTolls || false,
      avoidHighways: avoidHighways || false,
      key: apiKey,
    });

    // Make the request to Google Maps Directions API
    const response = await axios.get(routesUrl, {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        mode: travelMode || 'driving',
        avoidTolls: avoidTolls || false,
        avoidHighways: avoidHighways || false,
        key: apiKey,
      },
    });

    // Log the API response for debugging
    console.log("Google API response received:", response.data);

    // Check if the response contains valid routes
    if (!response.data || !response.data.routes || response.data.routes.length === 0) {
      console.warn("No routes found in the API response.");
      return res.status(400).json({
        error: "No routes found in the API response.",
        details: response.data,
      });
    }

    // Forward the routes data to the frontend
    res.json(response.data);  // This should include the `routes` array
  } catch (error) {
    // Handle and log errors
    console.error("Error fetching route from Google Maps API:", error.message);

    // Check if the error has a response (e.g., HTTP status from Google API)
    if (error.response) {
      console.error("Google API Error Details:", error.response.data);

      // Send detailed error to the client if available
      return res.status(error.response.status).json({
        error: "Error fetching route from Google Maps API",
        details: error.response.data,
      });
    }

    // Send a generic error message for other errors
    res.status(500).json({
      error: "An unexpected error occurred while fetching the route",
      message: error.message,
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
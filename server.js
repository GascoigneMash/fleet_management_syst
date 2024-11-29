const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
const PORT = 3000;

// Middleware for JSON parsing
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: 'Content-Type,Authorization',
}));

// Your Google API key (replace with actual key)
const apiKey = "AIzaSyAVQ11b4em7asW3XQIxPjOr0yZk3qZT7hg";
const routesUrl = "https://maps.googleapis.com/maps/api/directions/json";
const geocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json";

// POST route for optimized route
app.post('/api/optimize-route', (req, res) => {
  const { origin, destination, travelMode, avoidTolls, avoidHighways } = req.body;

  console.log("Received request:", req.body);

  try {
    // Geocode origin and destination
    const originCoords = geocodePlace(origin);
    const destinationCoords = geocodePlace(destination);

    if (!originCoords || !destinationCoords) {
      return res.status(400).json({ 
        error: "Invalid place names, unable to geocode.", 
        originCoords, 
        destinationCoords 
      });
    }

    console.log("Geocoded coordinates:", { originCoords, destinationCoords });

    // Fetch routes from Google Maps Directions API
    const response = axios.get(routesUrl, {
      params: {
        origin: `${originCoords.lat},${originCoords.lng}`,
        destination: `${destinationCoords.lat},${destinationCoords.lng}`,
        mode: travelMode || 'driving',
        avoidTolls: avoidTolls || false,
        avoidHighways: avoidHighways || false,
        key: apiKey,
      },
    });

    console.log("Google API response:", response.data);

    if (!response.data || !response.data.routes || response.data.routes.length === 0) {
      return res.status(400).json({
        error: "No routes found in the API response.",
        details: response.data,
      });
    }

    // Format the response for the frontend
    const formattedResponse = {
      routes: response.data.routes.map(route => ({
        overview_polyline: route.overview_polyline.points,
        summary: route.summary,
      })),
    };

    res.json(formattedResponse);
  } catch (error) {
    console.error("Error fetching route:", error.message);
    res.status(500).json({ error: 'Error fetching route', message: error.message });
  }
});

// Function to geocode place names to coordinates
async function geocodePlace(place) {
  try {
    const response = await axios.get(geocodeUrl, {
      params: { address: place, key: apiKey },
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      return response.data.results[0].geometry.location;
    } else {
      console.error("Geocoding failed:", response.data);
      return null;
    }
  } catch (error) {
    console.error("Error geocoding place:", error.message);
    return null;
  }
}

// Proxy route for fetching images
app.get('/api/route', async (req, res) => {
  const imageUrl = req.query.url;
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    res.setHeader('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (error) {
    res.status(500).send('Error fetching image');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

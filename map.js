let map;

// Function to initialize the map
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 1.2921, lng: 36.8219 }, // Nairobi coordinates
    zoom: 7,
  });
}

// Function to display the route on the map
function displayRoute(routeData) {
  if (!routeData || !routeData.routes || routeData.routes.length === 0) {
    console.error("No routes found in the response:", routeData);
    alert("No route found for the given origin and destination.");
    return;
  }

  // Proceed if routes are found
  const routes = routeData.routes;
  console.log("Displaying routes:", routes);

  // Ensure there's a valid encoded polyline in the first route
  const encodedPolyline = routes[0].overview_polyline?.points;
  if (!encodedPolyline) {
    console.error("Encoded polyline is missing in the route data:", routes[0]);
    alert("No route polyline available.");
    return;
  }

  // Decode the polyline into a set of LatLng points
  const routePath = google.maps.geometry.encoding.decodePath(encodedPolyline);
  if (routePath.length === 0) {
    console.error("Failed to decode polyline or polyline is empty:", encodedPolyline);
    alert("Failed to decode the route polyline.");
    return;
  }

  // Display the route on the map
  const routeLine = new google.maps.Polyline({
    path: routePath,
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 4,
  });

  routeLine.setMap(map);
}

// Function to handle form submission
async function handleFormSubmit(event) {
  event.preventDefault();  // Prevent default form submission

  const formData = new FormData(event.target); // Get form data

  try {
    const response = await fetch('/get-optimized-route', { // Correct URL!
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',  // Make sure the server expects JSON
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      if (response.status === 404) {
          // More specific error handling
          alert("Route optimization endpoint not found on the server.");
      } else {
          // Handle other HTTP errors
          const message = `HTTP error! status: ${response.status}`;
          console.error("Error during route optimization:", message);
          alert("Route optimization failed. Please try again later."); // User-friendly error
      }
      return; // Stop further execution if there was an error.
    }

    const data = await response.json();
    // Process the successful response...
  } catch (error) {
    console.error("Error during route optimization:", error);
    alert("An error occurred during route optimization. Check your console for more details.");
    };
}
  // Gather form data
  const originLat = parseFloat(document.getElementById("originLat").value);
  const originLng = parseFloat(document.getElementById("originLng").value);
  const destinationLat = parseFloat(document.getElementById("destinationLat").value);
  const destinationLng = parseFloat(document.getElementById("destinationLng").value);
  const travelMode = document.getElementById("travelMode").value;

  // Check for valid latitude and longitude values
  if (isNaN(originLat) || isNaN(originLng) || isNaN(destinationLat) || isNaN(destinationLng)) {
    console.error("Invalid latitude or longitude values.");
    alert("Please enter valid latitude and longitude values.");
  }

  // Collect route options
  const routeOptions = {
    avoidTolls: document.getElementById("avoidTolls").checked,
    avoidHighways: document.getElementById("avoidHighways").checked,
    trafficAware: document.getElementById("trafficAware").checked,
  };

  try {
    async function fetchData() {
    // Fetch optimized route from the backend
    const routeData = await fetchOptimizedRoute({
      origin: { lat: originLat, lng: originLng },
      destination: { lat: destinationLat, lng: destinationLng },
      travelMode,
      ...routeOptions,
    });

    // Display the route on the map
    displayRoute(routeData);
  }
  } catch (error) {
    console.error("Error fetching optimized route:", error);
    alert("Error fetching route data. Please try again.");
  }
  let routeData; // Declare the variable

fetch('/api/route')
  .then(response => response.json())
  .then(data => {
    routeData = data; // Assign the fetched data to routeData
  if (routeData && routeData.message === 'Route optimized successfully!') {
    // Make a second request to get the actual route data
    try {
      async function fetchData() {
        const routeDetailsResponse = await fetch('/getRouteDetails', { /* ...request options... */ });  // Adjust URL
        const routeDetails = await routeDetailsResponse.json();

        if (!routeDetails || !routeDetails.routes || routeDetails.routes.length === 0) {
          console.error("No routes found in the second response:", routeDetails);
          alert("No route details available.");
          return;
        }

        // Now use routeDetails.routes
        const routes = routeDetails.routes;
        // ... rest of your code using routes ...
      }
    } catch (error) {
        console.error("Error fetching route details:", error);
        alert("Error getting route details.");
    }


} else if (!routeData || !routeData.routes || routeData.routes.length === 0) {
    // Handle cases where the response is malformed or empty
    console.error("No routes found in the response:", routeData);
    alert("No route found for the given origin and destination.");
}
  });

// Function to fetch optimized route from the backend
async function fetchOptimizedRoute(requestData) {
  try {
    const response = await fetch("http://localhost:3000/get-optimized-route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Route data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching optimized route:", error);
    throw error;
  }
}

// Initialize map after the page is loaded
window.onload = function () {
  initMap(); // Initialize the map

  // Add event listener to the form to handle form submission
  const form = document.getElementById("routeForm");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  } else {
    console.error("Form not found.");
  }
};
// document.addEventListener("DOMContentLoaded", function () {

//   // Handle form submission
//   document.getElementById("routeForm").addEventListener("submit", async function (event) {
//     event.preventDefault(); // Prevent default form submission

//     // Gather form values
//     const start = document.getElementById("start").value;
//     const end = document.getElementById("end").value;
//     const avoidTolls = document.getElementById("avoidTolls").checked;
//     const avoidHighways = document.getElementById("avoidHighways").checked;

//     try {
//       // Send POST request to the backend (Flask server)
//       const response = await fetch("/get-route", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json", // Set the content type as JSON
//         },
//         body: JSON.stringify({
//           start: start,
//           end: end,
//           avoidTolls: avoidTolls,
//           avoidHighways: avoidHighways,
//         }),
//       });

//       // Handle non-OK responses
//       if (!response.ok) {
//         const errorData = await response.json(); // Get error details from response
//         console.error("Error fetching route:", errorData);
//         alert(`Error: ${errorData.error || "Something went wrong!"}`);
//         return;
//       }

//       // Parse the response JSON and handle route data
//       const routeData = await response.json();
//       console.log("Route Data:", routeData);

//       // Handle error in the data if present
//       if (routeData.error) {
//         if (routeData.error === 'route_not_found') {
//     alert('Route not found. Please try a different origin or destination.');
// } else if (routeData.error === 'api_limit_exceeded') {
//     alert('API limit exceeded. Please try again later.');
// } else {
//     alert('An error occurred. Please check console for details.');
// }
//       } else {
//         alert(`Route Summary: ${routeData.summary}\nDistance: ${routeData.distance}\nDuration: ${routeData.duration}`);
//         // Optionally, display the route on the map
//         displayRoute(routeData);
//       }
//     } catch (error) {
//       console.error("Error fetching route:", error);
//       alert("Failed to fetch route. Please check console for details.");
//     }
//   });

//   // Function to display the route on the map (update as needed)
//   function displayRoute(routeData) {
//     // Check if data is valid and route information exists
//     if (routeData && routeData.routes && routeData.routes.length > 0) {
//       const encodedPolyline = routeData.routes[0].overview_polyline?.points;
//       if (encodedPolyline) {
//         const routePath = google.maps.geometry.encoding.decodePath(encodedPolyline);
//         const routeLine = new google.maps.Polyline({
//           path: routePath,
//           geodesic: true,
//           strokeColor: "#FF0000",
//           strokeOpacity: 1.0,
//           strokeWeight: 4,
//         });
//         // Use the existing map object from initMap
//         routeLine.setMap(map);
//       }
//     } else {
//       console.warn("Invalid route data or missing route information");
//     }
//   }

//   // Initialize the map after page load
//   initMap();
// });
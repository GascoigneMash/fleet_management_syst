function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 7,
    center: { lat: 41.85, lng: -87.65 }, // Default center (Chicago, USA).
  });

  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    panel: document.getElementById("directionsPanel"),
    draggable: true, // Allow route dragging.
  });

  const stepDisplay = new google.maps.InfoWindow(); // To display step instructions.

  directionsRenderer.addListener("directions_changed", () => {
    const directions = directionsRenderer.getDirections();
    if (directions) {
      computeTotalDistance(directions); // Compute and display total distance.
    }
  });

  const onChangeHandler = function () {
    calculateAndDisplayRoute(
      directionsService,
      directionsRenderer,
      stepDisplay,
      map
    );
  };

  // Event listeners for user inputs.
  document.getElementById("start").addEventListener("change", onChangeHandler);
  document.getElementById("end").addEventListener("change", onChangeHandler);
  document.getElementById("mode").addEventListener("change", onChangeHandler);
  document.getElementById("departure-time").addEventListener("change", onChangeHandler);
}

function calculateAndDisplayRoute(directionsService, directionsRenderer, stepDisplay, map) {
  // Clear existing warnings.
  document.getElementById("warnings-panel").innerHTML = "";

  const origin = document.getElementById("start").value;
  const destination = document.getElementById("end").value;
  const selectedMode = document.getElementById("mode").value;
  const departureTimeInput = document.getElementById("departure-time").value;

  console.log("Origin:", origin);
  console.log("Destination:", destination);
  console.log("Travel Mode:", selectedMode);
  console.log("Departure Time:", departureTimeInput);

  // Parse the departure time input into a Date object.
  const departureTime = departureTimeInput ? new Date(departureTimeInput) : new Date();

  directionsService
    .route({
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode[selectedMode],
      drivingOptions: {
        departureTime: departureTime, // Include user-specified departure time.
      },
      avoidTolls: false, // Remove restrictions to test feasibility.
    })
    .then((response) => {
      directionsRenderer.setDirections(response); // Render the route.
      showSteps(response, stepDisplay, map); // Add step markers and instructions.
      displayTravelDetails(response, departureTime); // Calculate and display travel details.
    })
    .catch((e) => {
      console.error("Error details:", e);
      alert("Directions request failed due to: " + e.message);
    });
}

function showSteps(response, stepDisplay, map) {
  if (!response || !response.routes || !response.routes[0] || !response.routes[0].legs || !response.routes[0].legs[0] || !response.routes[0].legs[0].steps) {
    console.error("Invalid Directions Response:", response);
    alert("Unable to display steps. Invalid route data received.");
    return;
  }
  const myRoute = response.routes[0];
  const myLeg = myRoute.legs[0]; // Get the first leg of the route
  const steps = myLeg.steps; // Access the steps array

  steps.forEach((step, i) => {
    const marker = new google.maps.Marker({
      position: step.start_location,
      map: map,
      title: `Step ${i + 1}`,
    });
    attachInstructionText(stepDisplay, marker, step.instructions, map);
  });
}

function attachInstructionText(stepDisplay, marker, text, map) {
  google.maps.event.addListener(marker, "click", () => {
    stepDisplay.setContent(text);
    stepDisplay.open(map, marker);
  });
}

function computeTotalDistance(result) {
  let total = 0;
  const myRoute = result.routes[0];

  if (!myRoute) {
    return;
  }

  myRoute.legs.forEach((leg) => {
    total += leg.distance.value; // Accumulate distance in meters.
  });

  total = total / 1000; // Convert meters to kilometers.
  document.getElementById("total").innerHTML = total.toFixed(2) + " km";
}

function displayTravelDetails(response, departureTime) {
  const myRoute = response.routes[0];

  if (!myRoute) {
    console.error("No route found.");
    return;
  }

  // Calculate the total travel duration in seconds.
  let totalDuration = 0;
  myRoute.legs.forEach((leg) => {
    totalDuration += leg.duration.value; // Duration in seconds.
  });

  // Calculate the estimated arrival time.
  const arrivalTime = new Date(departureTime.getTime() + totalDuration * 1000);

  // Display the results.
  document.getElementById("travel-duration").innerText = formatDuration(totalDuration);
  document.getElementById("arrival-time").innerText = formatTime(arrivalTime);
}

// Helper function to format duration into hours and minutes.
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours} hr ${minutes} min`;
}

// Helper function to format time into a readable string.
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

window.initMap = initMap;

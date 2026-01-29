/**************************************************
 * MAPBOX ACCESS TOKEN
 **************************************************/
mapboxgl.accessToken =
  "pk.eyJ1IjoiYXJpdmlraSIsImEiOiJjbWp6enYzMmcxZWczM2RyMjdmcXg2eW0xIn0.D6O98RVxJ5FWXw6vixkBrQ";

/**************************************************
 * MAP INITIALIZATION
 **************************************************/
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: [77.5946, 12.9716],
  zoom: 11
});

/**************************************************
 * DOM REFERENCES
 **************************************************/
const modal = document.getElementById("welcomeModal");
const greeting = document.getElementById("greeting");
const vehicleInfo = document.getElementById("vehicleInfo");

const startInput = document.getElementById("start");
const endInput = document.getElementById("end");
const rangeInput = document.getElementById("range");
const info = document.getElementById("info");
const routeBtn = document.getElementById("routeBtn");

const userNameInput = document.getElementById("userName");
const vehicleTypeInput = document.getElementById("vehicleType");
const vehicleModelInput = document.getElementById("vehicleModel");
const vehicleNumberInput = document.getElementById("vehicleNumber");

/**************************************************
 * GLOBAL STATE
 **************************************************/
let activeStationMarker = null;

/**************************************************
 * USER ONBOARDING (ALWAYS SHOW MODAL)
 **************************************************/
function loadUserIntoModal() {
  const user = JSON.parse(localStorage.getItem("evUser"));

  // Always show modal
  modal.style.display = "flex";

  if (user) {
    userNameInput.value = user.name;
    vehicleTypeInput.value = user.type;
    vehicleModelInput.value = user.model;
    vehicleNumberInput.value = user.number;
    updateSidebar(user);
  }
}

function updateSidebar(user) {
  greeting.innerText = `Hi, ${user.name} 👋`;
  vehicleInfo.innerHTML = `
    🚗 <b>${user.type}</b><br>
    Model: ${user.model}<br>
    Vehicle No: ${user.number}
  `;
}

document.getElementById("startAppBtn").onclick = () => {
  const user = {
    name: userNameInput.value.trim(),
    type: vehicleTypeInput.value.trim(),
    model: vehicleModelInput.value.trim(),
    number: vehicleNumberInput.value.trim()
  };

  if (!user.name || !user.type || !user.model || !user.number) {
    alert("Please fill all vehicle details");
    return;
  }

  localStorage.setItem("evUser", JSON.stringify(user));
  modal.style.display = "none";
  updateSidebar(user);
};

loadUserIntoModal();

/**************************************************
 * EV STATIONS
 **************************************************/
const stations = [
  { name: "EV Station 1", coords: [77.580, 12.975] },
  { name: "EV Station 2", coords: [77.585, 12.965] },
  { name: "EV Station 3", coords: [77.590, 12.985] },
  { name: "EV Station 4", coords: [77.595, 12.955] },
  { name: "EV Station 5", coords: [77.600, 12.975] },
  { name: "EV Station 6", coords: [77.605, 12.965] },
  { name: "EV Station 7", coords: [77.610, 12.985] },
  { name: "EV Station 8", coords: [77.615, 12.955] },
  { name: "EV Station 9", coords: [77.620, 12.975] },
  { name: "EV Station 10", coords: [77.625, 12.965] },

  { name: "EV Station 11", coords: [77.5946, 12.9763] },
  { name: "EV Station 12", coords: [77.5907, 12.9796] },
  { name: "EV Station 13", coords: [77.6033, 12.9758] },
  { name: "EV Station 14", coords: [77.6412, 12.9784] },
  { name: "EV Station 15", coords: [77.6950, 13.0035] },
  { name: "EV Station 16", coords: [77.6957, 12.9920] },
  { name: "EV Station 17", coords: [77.6633, 12.9850] },
  { name: "EV Station 18", coords: [77.7499, 12.9698] },
  { name: "EV Station 19", coords: [77.7306, 12.9867] },
  { name: "EV Station 20", coords: [77.6974, 12.9592] },

  { name: "EV Station 21", coords: [77.6770, 12.9304] },
  { name: "EV Station 22", coords: [77.6875, 12.9121] },
  { name: "EV Station 23", coords: [77.5937, 12.9250] },
  { name: "EV Station 24", coords: [77.5857, 12.9077] },
  { name: "EV Station 25", coords: [77.5666, 12.9255] },
  { name: "EV Station 26", coords: [77.6101, 12.9166] },
  { name: "EV Station 27", coords: [77.5970, 12.8845] },
  { name: "EV Station 28", coords: [77.6770, 12.8452] },
  { name: "EV Station 29", coords: [77.5913, 13.0358] },
  { name: "EV Station 30", coords: [77.5963, 13.1007] }
];

map.on("load", () => {
  stations.forEach(st => {
    new mapboxgl.Marker({ color: "green" })
      .setLngLat(st.coords)
      .setPopup(new mapboxgl.Popup().setText(st.name))
      .addTo(map);
  });
});

/**************************************************
 * HELPERS
 **************************************************/
function haversine(a, b) {
  const R = 6371;
  const dLat = (b[1] - a[1]) * Math.PI / 180;
  const dLon = (b[0] - a[0]) * Math.PI / 180;
  const lat1 = a[1] * Math.PI / 180;
  const lat2 = b[1] * Math.PI / 180;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

/**************************************************
 * GEOCODING
 **************************************************/
async function geocode(place) {
  const query = encodeURIComponent(place + ", Bengaluru, India");
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?limit=1&access_token=${mapboxgl.accessToken}`
  );
  const data = await res.json();
  if (!data.features.length) throw new Error("Location not found");
  return data.features[0].center;
}

/**************************************************
 * ROUTING
 **************************************************/
async function getRoute(a, b) {
  const res = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${a};${b}?geometries=geojson&access_token=${mapboxgl.accessToken}`
  );
  const data = await res.json();
  return data.routes[0];
}

/**************************************************
 * REALISTIC STATION SELECTION
 **************************************************/
function findReachableStation(currentPos, routeCoords, rangeKm) {
  let best = null;
  let bestProgress = -1;

  stations.forEach(st => {
    const dist = haversine(currentPos, st.coords);
    if (dist > rangeKm) return;

    let minDist = Infinity;
    let index = 0;

    routeCoords.forEach((p, i) => {
      const d = haversine(p, st.coords);
      if (d < minDist) {
        minDist = d;
        index = i;
      }
    });

    const progress = index / routeCoords.length;
    if (progress > bestProgress) {
      bestProgress = progress;
      best = st;
    }
  });

  return best;
}

/**************************************************
 * ROUTE BUTTON
 **************************************************/
routeBtn.onclick = async () => {
  try {
    info.innerText = "Calculating route...";

    const start = await geocode(startInput.value);
    const end = await geocode(endInput.value);
    const range = Number(rangeInput.value);

    if (!range || range <= 0) {
      info.innerText = "❌ Enter valid range";
      return;
    }

    const route = await getRoute(start, end);
    clearRouteAndStation();

    if (route.distance / 1000 <= range) {
      drawRoute(route.geometry);
      info.innerText = "✅ Destination reachable without charging";
      return;
    }

    const station = findReachableStation(
      start,
      route.geometry.coordinates,
      range
    );

    if (!station) {
      info.innerText = "❌ No reachable charging station";
      return;
    }

    await drawRouteViaStation(start, station.coords, end, station);
    info.innerText = `⚡ First charge at ${station.name}`;

  } catch (err) {
    info.innerText = "❌ Location not found";
    console.error(err);
  }
};

/**************************************************
 * DRAWING
 **************************************************/
function clearRouteAndStation() {
  if (map.getSource("route")) {
    map.removeLayer("route");
    map.removeSource("route");
  }

  if (activeStationMarker) {
    activeStationMarker.remove();
    activeStationMarker = null;
  }
}

function drawRoute(geometry) {
  map.addSource("route", {
    type: "geojson",
    data: { type: "Feature", geometry }
  });

  map.addLayer({
    id: "route",
    type: "line",
    source: "route",
    paint: {
      "line-color": "#22c55e",
      "line-width": 5
    }
  });
}

async function drawRouteViaStation(start, station, end, stationObj) {
  const res = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${station};${end}?geometries=geojson&access_token=${mapboxgl.accessToken}`
  );
  const data = await res.json();

  drawRoute(data.routes[0].geometry);

  activeStationMarker = new mapboxgl.Marker({ color: "red" })
    .setLngLat(station)
    .setPopup(new mapboxgl.Popup().setText(`Charge at ${stationObj.name}`))
    .addTo(map);
}

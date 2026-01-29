# EV Route Planner ⚡

A front-end web application that helps electric vehicle (EV) users plan routes based on vehicle range and available charging stations.  
The app simulates realistic EV routing behavior by ensuring that only reachable charging stations are suggested, based on the vehicle’s current range.

This project is built entirely using **HTML, CSS, and Vanilla JavaScript**, with **Mapbox APIs** for maps, geocoding, and routing.

---

## 🔍 Features

- Interactive map using Mapbox
- Start and destination location search
- Vehicle range-based route planning
- Smart charging station selection
- Prevents routing to unreachable stations
- Editable vehicle profile (name & vehicle details)
- Clean onboarding modal
- Responsive layout for desktop and mobile

---

## 🧠 How It Works (Logic Overview)

1. User enters start and destination locations
2. App checks if the destination is reachable within the given range
3. If not reachable:
   - The app finds the **nearest reachable charging station**
   - Ensures the vehicle can physically reach the station
4. If no station is reachable:
   - The trip is marked as not possible
5. Route is drawn dynamically on the map

This logic closely follows real-world EV navigation constraints instead of assuming ideal conditions.

---

## 🛠️ Tech Stack

- **HTML** – Page structure
- **CSS** – Dark-themed UI styling
- **JavaScript (Vanilla)** – Application logic
- **Mapbox GL JS** – Interactive maps
- **Mapbox Geocoding API** – Location search
- **Mapbox Directions API** – Route generation

---


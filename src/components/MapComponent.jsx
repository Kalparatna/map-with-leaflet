import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const defaultStart = [51.505, -0.09];
const defaultEnd = [51.515, -0.1];

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
});

const MapView = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (start && end) {
      const bounds = L.latLngBounds([start, end]);
      map.flyToBounds(bounds, { padding: [50, 50] });
    }
  }, [start, end, map]);

  return null;
};

const RoutePath = ({ start, end, setDistance }) => {
  const map = useMap();

  useEffect(() => {
    if (!start || !end) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start), L.latLng(end)],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      createMarker: () => null,
      lineOptions: {
        styles: [{ color: "red", weight: 6, opacity: 0.8 }],
      },
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: "car",
        suppressDemoServerWarning: true,
      }),
      routeLine: (route) => {
        setDistance((route.summary.totalDistance / 1000).toFixed(2));
        return L.polyline(route.coordinates, {
          color: "red",
          weight: 6,
          opacity: 0.8,
        });
      },
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [start, end, map, setDistance]);

  return null;
};

const fetchCoordinates = async (location) => {
  if (!location) return null;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
    );
    const data = await response.json();
    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
  }
  return null;
};

const MapComponent = () => {
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState(null);

  const handleSwap = () => {
    setStart(end);
    setEnd(start);
    setStartInput(endInput);
    setEndInput(startInput);
  };

  const handleLocationSubmit = async () => {
    setLoading(true);
    const startCoords = await fetchCoordinates(startInput);
    const endCoords = await fetchCoordinates(endInput);
    if (startCoords) setStart(startCoords);
    if (endCoords) setEnd(endCoords);
    setLoading(false);
  };

  const handleLiveLocation = (type) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const liveCoords = [position.coords.latitude, position.coords.longitude];
          if (type === "start") {
            setStart(liveCoords);
            setStartInput("Your Live Location");
          } else {
            setEnd(liveCoords);
            setEndInput("Your Live Location");
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
      <div className="w-full max-w-lg p-6 bg-white bg-opacity-20 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-200 text-center mt-4">
        <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-6">🌍 Explore Locations</h2>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="📍 Start Location"
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
              className="w-full p-4 bg-white bg-opacity-30 text-gray-900 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-400"
            />
            <Button
              onClick={() => handleLiveLocation("start")}
              className="bg-blue-500 hover:bg-blue-700 text-white px-3 rounded-lg shadow-md"
            >
              📍 Live
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="📌 Destination"
              value={endInput}
              onChange={(e) => setEndInput(e.target.value)}
              className="w-full p-4 bg-white bg-opacity-30 text-gray-900 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-400"
            />
            <Button
              onClick={() => handleLiveLocation("end")}
              className="bg-blue-500 hover:bg-blue-700 text-white px-3 rounded-lg shadow-md"
            >
              📍 Live
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          <Button
            onClick={handleLocationSubmit}
            disabled={loading}
            className={`w-full text-white font-semibold py-3 rounded-xl shadow-lg transition-transform ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-green-400 to-teal-500 hover:from-teal-500 hover:to-green-400 hover:scale-105"}`}
          >
            {loading ? "⏳ Loading..." : "✅ Set Locations"}
          </Button>
          <Button
            onClick={handleSwap}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-purple-600 hover:to-pink-500 text-white font-semibold py-3 rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            🔄 Swap Locations
          </Button>
        </div>
      </div>

      {distance && (
        <div className="mt-4 text-white text-2xl font-semibold bg-gray-900 bg-opacity-50 px-6 py-2 rounded-lg shadow-lg">
          📏 Distance: {distance} km
        </div>
      )}

      <MapContainer center={start} zoom={13} className="w-full h-[600px]">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={start} icon={customIcon}>
          <Popup>Start Location</Popup>
        </Marker>
        <Marker position={end} icon={customIcon}>
          <Popup>Destination</Popup>
        </Marker>
        <MapView start={start} end={end} />
        <RoutePath start={start} end={end} setDistance={setDistance} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;

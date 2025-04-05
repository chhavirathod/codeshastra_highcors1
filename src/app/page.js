"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import react-leaflet components with SSR disabled
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Polygon = dynamic(() => import("react-leaflet").then((mod) => mod.Polygon), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

export default function Home() {
  const [locationAllowed, setLocationAllowed] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [vote, setVote] = useState("");
  const [customIcon, setCustomIcon] = useState(null);

  const geoFenceCoords = [
    [18.98101006968666, 72.79850980462794], // Bottom-left
    [19.192111747441615, 72.79850980462794], // Top-left
    [19.192111747441615, 72.97901361907108], // Top-right
    [18.98101006968666, 72.97901361907108], // Bottom-right
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        const leafletIcon = L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
        setCustomIcon(leafletIcon);
      });
    }
  }, []);

  useEffect(() => {
    checkUserLocation();
  }, []);

  const checkUserLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          const isAllowed = await verifyLocation(latitude, longitude);
          setLocationAllowed(isAllowed);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationAllowed(false);
        }
      );
    } else {
      setLocationAllowed(false);
    }
  };

  const verifyLocation = async (lat, lng) => {
    try {
      const res = await fetch("/api/check-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      });

      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }

      const data = await res.json();
      return data.isAllowed;
    } catch (error) {
      console.error("Verify Location Error:", error);
      return false;
    }
  };

  const handleVote = async () => {
    if (locationAllowed) {
      console.log("Vote submitted:", vote);
    } else {
      alert("You are not in an allowed voting area.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Cast Your Vote</h1>

      {userLocation && customIcon && (
        <div style={{ height: "400px", width: "100%", marginBottom: "20px" }}>
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Polygon
              positions={geoFenceCoords}
              color="blue"
              fillColor="blue"
              fillOpacity={0.5} // Increased opacity for visibility
              weight={2} // Thicker border
            />
            <Marker position={[userLocation.lat, userLocation.lng]} icon={customIcon}>
              <Popup>You are here</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      {locationAllowed === null ? (
        <p>Checking your location...</p>
      ) : locationAllowed ? (
        <>
          <select value={vote} onChange={(e) => setVote(e.target.value)}>
            <option value="">Select an option</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          <button onClick={handleVote}>Submit Vote</button>
        </>
      ) : (
        <p>Sorry, voting is restricted to specific locations.</p>
      )}
    </div>
  );
}
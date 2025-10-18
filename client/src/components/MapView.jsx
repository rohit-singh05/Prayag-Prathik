import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import MapWithHoverBoxes from "./MapWithHoverBox";

export default function MapView({
  userLocation,
  routes,
  destinations,
  activeStep,
  setActiveStep,
  selectedStart,
}) {
  const prayagrajCenter = [25.4358, 81.8463];
  const [routeSegments, setRouteSegments] = useState([]);

  useEffect(() => {
    const fetchAllSegments = async () => {
      if (!routes || routes.length === 0 || !userLocation) {
        setRouteSegments([]);
        return;
      }

      const route = routes[0];
      const segments = [];

      for (const [idx, step] of route.plan.entries()) {
        try {
          const apiKey =
            "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImMzYTcxMTI5YTdiNzRiNmNiMmZmYTUyZTYxMzJiNTlhIiwiaCI6Im11cm11cjY0In0=";
          const from = step.travel.from.location.coordinates;
          const to = step.travel.to.location.coordinates;

          const postUrl =
            "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
          const body = {
            coordinates: [
              [from[0], from[1]],
              [to[0], to[1]],
            ],
            instructions: false,
          };

          const response = await axios.post(postUrl, body, {
            headers: {
              Authorization: apiKey,
              "Content-Type": "application/json",
            },
          });

          const geoJson = response.data;
          const coords = geoJson.features[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );
          segments.push({
            coords,
            fromName: step.travel.from.name,
            toName: step.travel.to.name,
            index: idx,
          });
        } catch (error) {
          console.error("Error fetching segment:", error);
        }
      }

      setRouteSegments(segments);
    };

    fetchAllSegments();
  }, [routes, userLocation]);

  const hasPath = routes && routes.length > 0;
  const startStop = hasPath ? routes[0].startStop : null;

  return (
    <MapContainer
      center={prayagrajCenter}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Show selected start if path not found */}
      {!hasPath && selectedStart && (
        <Marker
          position={[selectedStart.lat, selectedStart.lng]}
          icon={L.icon({
            iconUrl: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
            iconSize: [30, 30],
          })}
        >
          <Popup>Starting Point</Popup>
        </Marker>
      )}

      {/* Show user location if available */}
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={L.icon({
            iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            iconSize: [30, 30],
          })}
        >
          <Popup>Current Location</Popup>
        </Marker>
      )}


      {/* Draw Segmented Routes with click handler */}
      {routeSegments.map((segment, idx) => (
        <Polyline
          key={idx}
          positions={segment.coords}
          color={activeStep === segment.index ? "red" : "blue"}
          weight={5}
          opacity={0.7}
          eventHandlers={{
            click: () => setActiveStep(segment.index),
          }}
        />
      ))}

      {/* Stops Markers with Numbers */}
      {hasPath &&
        routes[0].plan.map((step, idx) => {
          const stop = step.visit.stop.location.coordinates;
          const latLng = [stop[1], stop[0]];
          return (
            <Marker
              key={idx}
              position={latLng}
              icon={L.divIcon({
                className: "custom-stop-marker",
                html: `<div style="
                                    background:${activeStep === idx ? "#2563eb" : "#fff"
                  };
                                    border:2px solid ${activeStep === idx ? "#2563eb" : "#333"
                  };
                                    border-radius:50%;
                                    width:22px;height:22px;
                                    line-height:22px;
                                    text-align:center;
                                    font-size:12px;
                                    font-weight:bold;
                                    color:${activeStep === idx ? "#fff" : "#000"
                  };
                                ">${idx + 1}</div>`,
              })}
              eventHandlers={{
                click: () => setActiveStep(idx),
              }}
            >
              <Popup>{step.visit.stop.name}</Popup>
            </Marker>
          );
        })}

      <MapWithHoverBoxes destinations={destinations}
      selectedStart={selectedStart}/>
    </MapContainer>
  );
}

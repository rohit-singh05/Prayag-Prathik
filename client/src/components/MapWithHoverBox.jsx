import React, { useState, useEffect, useRef } from "react";
import { useMap, Marker } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";

function HoverInfoBox({ destination, map, onMouseEnter, onMouseLeave }) {
    const navigate = useNavigate();
    console.log(destination)
    const [position, setPosition] = useState(null);

    useEffect(() => {
        if (!destination || !map) return;
        const point = map.latLngToContainerPoint([destination.lat, destination.lng]);
        setPosition({ x: point.x, y: point.y });
    }, [destination, map]);

    if (!position) return null;


    // 🕒 Today’s visiting time
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const todayTime = destination?.time?.[today] || "Not available";

    return (
        <div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{
                position: "absolute",
                left: `${position.x + 25}px`,
                top: `${position.y - 20}px`,
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                padding: "10px",
                width: "250px",
                zIndex: 2000,
                transform: "translate(-50%, -100%)",
                pointerEvents: "auto",
            }}
        >
            {destination.image && (
                <img
                    src={destination.image}
                    alt={destination.name}
                    style={{
                        width: "100%",
                        height: "130px",
                        borderRadius: "8px",
                        objectFit: "cover",
                        marginBottom: "6px",
                    }}
                />
            )}
            <h3
                style={{
                    margin: "4px 0",
                    fontSize: "15px",
                    fontWeight: "bold",
                }}
            >
                {destination.name}
            </h3>
            {destination.description && (
                <p style={{ fontSize: "13px", color: "#555", marginBottom: "6px" }}>
                    {destination.description?.slice(0, 60)}...
                </p>
            )}
            {destination.time && (
                <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
                    🕒 Today: <b>{todayTime}</b>
                </p>
            )}
            <button
                onClick={() => navigate(`/place/${destination.id || destination._id}`)}
                // onClick={() => console.log(destination)}
                style={{
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    cursor: "pointer",
                    width: "100%",
                    fontSize: "14px",
                }}
            >
                View More
            </button>
        </div>
    );
}

export default function MapWithHoverBoxes({ destinations = [], selectedStart }) {
    if (!destinations || !selectedStart) return;
    const map = useMap();
    const [hoveredDestination, setHoveredDestination] = useState(null);
    const [isHoveringBox, setIsHoveringBox] = useState(false);
    const hoverTimeoutRef = useRef(null);

    const handleMarkerMouseOver = (dest) => {
        clearTimeout(hoverTimeoutRef.current);
        setHoveredDestination(dest);
    };

    const handleMarkerMouseOut = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            if (!isHoveringBox) setHoveredDestination(null);
        }, 250);
    };

    const handleBoxEnter = () => {
        clearTimeout(hoverTimeoutRef.current);
        setIsHoveringBox(true);
    };

    const handleBoxLeave = () => {
        setIsHoveringBox(false);
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredDestination(null);
        }, 200);
    };

    return (
        <>
            {/* Destinations */}
            {destinations.map((dest) => (
                <Marker
                    key={dest._id}
                    position={[dest.lat, dest.lng]}
                    icon={L.icon({
                        iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                        iconSize: [30, 30],
                    })}
                    eventHandlers={{
                        mouseover: () => handleMarkerMouseOver(dest),
                        mouseout: handleMarkerMouseOut,
                    }}
                />
            ))}

            {/* Start Stop Marker (Red) */}
            {selectedStart && selectedStart.location?.coordinates && (
                <Marker
                    key={selectedStart.id}
                    position={[
                        selectedStart.location.coordinates[1],
                        selectedStart.location.coordinates[0],
                    ]}
                    icon={L.icon({
                        iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                        iconSize: [30, 30],
                    })}
                    eventHandlers={{
                        mouseover: () =>
                            handleMarkerMouseOver({
                                selectedStart
                            }),
                        mouseout: handleMarkerMouseOut,
                    }}
                />
            )}

            {hoveredDestination && (
                <HoverInfoBox
                    destination={hoveredDestination}
                    map={map}
                    onMouseEnter={handleBoxEnter}
                    onMouseLeave={handleBoxLeave}
                />
            )}
        </>
    );
}

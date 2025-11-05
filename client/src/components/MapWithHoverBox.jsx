import React, { useState, useEffect, useRef } from "react";
import { useMap, Marker } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
    startTranslating,
    stopTranslating,
} from "../store/translationSlice/translationSlice";
import axios from "axios";

const translateText = async (text, targetLang) => {
    try {
        const res = await axios.get("http://localhost:5001/api/translate", {
            params: {
                q: text,
                targetLang: targetLang,
            },
        });
        return res.data.translatedText;
    } catch (err) {
        console.error("Translation error:", err);
        return text;
    }
};

function HoverInfoBox({ destination, map, onMouseEnter, onMouseLeave, translatedLabels }) {
    const navigate = useNavigate();
    const [position, setPosition] = useState(null);

    useEffect(() => {
        if (!destination || !map) return;
        const point = map.latLngToContainerPoint([destination.lat, destination.lng]);
        setPosition({ x: point.x, y: point.y });
    }, [destination, map]);

    if (!position) return null;

    // 🕒 Today’s visiting time
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const todayTime = destination?.time?.[today] || translatedLabels.notAvailable;

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
                    🕒 {translatedLabels.today}: <b>{todayTime}</b>
                </p>
            )}
            <button
                onClick={() => navigate(`/place/${destination.id || destination._id}`)}
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
                {translatedLabels.viewMore}
            </button>
        </div>
    );
}

export default function MapWithHoverBoxes({ destinations = [], selectedStart }) {
    const map = useMap();
    const [hoveredDestination, setHoveredDestination] = useState(null);
    const [isHoveringBox, setIsHoveringBox] = useState(false);
    const hoverTimeoutRef = useRef(null);

    const language = useSelector((state) => state.language.selectedLanguage);
    const dispatch = useDispatch();

    const [translatedDestinations, setTranslatedDestinations] = useState(destinations);
    const [translatedLabels, setTranslatedLabels] = useState({
        today: "Today",
        notAvailable: "Not available",
        viewMore: "View More",
    });

    // 🌐 Translate static UI labels
    useEffect(() => {
        const translateLabels = async () => {
            if (language === "en") {
                setTranslatedLabels({
                    today: "Today",
                    notAvailable: "Not available",
                    viewMore: "View More",
                });
                return;
            }
            try {
                dispatch(startTranslating());
                const joined = "Today||Not available||View More";
                const translated = await translateText(joined, language);
                const [t1, t2, t3] = translated.split("||");
                setTranslatedLabels({
                    today: t1 || "Today",
                    notAvailable: t2 || "Not available",
                    viewMore: t3 || "View More",
                });
            } catch (err) {
                console.error("Label translation failed:", err);
            } finally {
                dispatch(stopTranslating());
            }
        };
        translateLabels();
    }, [language, dispatch]);

    // 🌍 Translate destination names + descriptions
    useEffect(() => {
        const translateDestinations = async () => {
            if (!destinations || !destinations.length) return;

            if (language === "en") {
                setTranslatedDestinations(destinations);
                return;
            }

            try {
                dispatch(startTranslating());
                const translated = await Promise.all(
                    destinations.map(async (d) => {
                        const text = `${d.name}||${d.description || ""}`;
                        const res = await translateText(text, language);
                        const [tName, tDesc] = res.split("||");
                        return {
                            ...d,
                            name: tName || d.name,
                            description: tDesc || d.description,
                        };
                    })
                );
                setTranslatedDestinations(translated);
            } catch (err) {
                console.error("Destination translation failed:", err);
                setTranslatedDestinations(destinations);
            } finally {
                dispatch(stopTranslating());
            }
        };
        translateDestinations();
    }, [language, destinations, dispatch]);

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
            {translatedDestinations?.map((dest) => (
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
                        mouseover: () => handleMarkerMouseOver(selectedStart),
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
                    translatedLabels={translatedLabels}
                />
            )}
        </>
    );
}

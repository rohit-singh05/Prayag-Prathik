import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    CircularProgress,
    Typography,
    Box,
    Button,
    Card,
    CardMedia,
    CardContent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { WiDaySunny, WiCloudy, WiRain, WiThunderstorm, WiSnow } from "react-icons/wi";

export default function PlaceDetails() {
    const { id } = useParams();
    const [place, setPlace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [weather, setWeather] = useState(null);
    const navigate = useNavigate();

    const OPENWEATHER_API_KEY = "f3fd35b926c7b3d9f36db91f05aa3e96";

    useEffect(() => {
        const fetchPlace = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/routes/spot/${id}`);
                const spot = res.data.spot;
                setPlace(spot);

                if (spot?.location?.coordinates?.length === 2) {
                    const [lng, lat] = spot.location.coordinates;
                    const weatherRes = await axios.get(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${OPENWEATHER_API_KEY}`
                    );
                    setWeather(weatherRes.data);
                }
            } catch (error) {
                console.error("Error fetching place details or weather:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlace();
    }, [id]);

    if (loading)
        return (
            <Box className="flex justify-center items-center h-screen">
                <CircularProgress />
            </Box>
        );

    if (!place)
        return (
            <Box className="flex justify-center items-center h-screen">
                <Typography variant="h6">Place not found.</Typography>
            </Box>
        );

    const getWeatherIcon = (main) => {
        switch (main?.toLowerCase()) {
            case "clear":
                return <WiDaySunny size={60} color="#fbbf24" />;
            case "clouds":
                return <WiCloudy size={60} color="#93c5fd" />;
            case "rain":
                return <WiRain size={60} color="#60a5fa" />;
            case "thunderstorm":
                return <WiThunderstorm size={60} color="#2563eb" />;
            case "snow":
                return <WiSnow size={60} color="#e0f2fe" />;
            default:
                return <WiCloudy size={60} color="#93c5fd" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 p-4">
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                variant="outlined"
                sx={{
                    mb: 2,
                    color: "#1e40af",
                    borderColor: "#1e40af",
                    "&:hover": { backgroundColor: "#1e40af", color: "white" },
                }}
            >
                Back
            </Button>

            <Card
                sx={{
                    maxWidth: 1500,
                    width: "95%",
                    margin: "0 auto",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                    borderRadius: "20px",
                    overflow: "hidden",
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: "bold",
                            mb: 4,
                            color: "#1e3a8a",
                            textAlign: "center",
                            textTransform: "capitalize",
                        }}
                    >
                        {place.name}
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: 4,
                        }}
                    >
                        {/* Left Column: Image + Description */}
                        <Box sx={{ flex: 1 }}>
                            {place.image && (
                                <CardMedia
                                    component="img"
                                    height="350"
                                    image={place.image}
                                    alt={place.name}
                                    sx={{
                                        objectFit: "cover",
                                        borderRadius: "16px",
                                        mb: 3,
                                    }}
                                />
                            )}
                            {place.description && (
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: "#374151",
                                        fontSize: "1.05rem",
                                        lineHeight: 1.7,
                                        textAlign: "justify",
                                    }}
                                >
                                    {place.description}
                                </Typography>
                            )}
                        </Box>

                        {/* Right Column: Timings + Weather */}
                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                            {/* Weekly Timings */}
                            <Box
                                sx={{
                                    background: "linear-gradient(135deg, #e0f2fe, #fef3c7)",
                                    borderRadius: "16px",
                                    p: 3,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{ color: "#1d4ed8", mb: 2, fontWeight: 600 }}
                                >
                                    🕒 Visiting Hours (Weekly)
                                </Typography>

                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                                        gap: 1.5,
                                    }}
                                >
                                    {Object.entries(place.time || {}).map(([day, time]) => (
                                        <Box
                                            key={day}
                                            sx={{
                                                backgroundColor: "#ffffffcc",
                                                borderRadius: "12px",
                                                p: 1.5,
                                                textAlign: "center",
                                                transition: "0.3s",
                                                "&:hover": {
                                                    backgroundColor: "#bfdbfe",
                                                    transform: "scale(1.03)",
                                                },
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    color: "#1e40af",
                                                    fontWeight: "bold",
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                {day}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "#111827", fontSize: "0.95rem" }}
                                            >
                                                {time}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            {/* Weather Section */}
                            {weather && (
                                <Box
                                    sx={{
                                        background: "linear-gradient(135deg, #dbeafe, #fef9c3)",
                                        borderRadius: "16px",
                                        p: 3,
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                        textAlign: "center",
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{ color: "#1e3a8a", mb: 2, fontWeight: 600 }}
                                    >
                                        🌦️ Current Weather
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {getWeatherIcon(weather.weather?.[0]?.main)}
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                mt: 1,
                                                color: "#1e40af",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {weather.main.temp.toFixed(1)}°C
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: "#374151",
                                                mt: 0.5,
                                                textTransform: "capitalize",
                                            }}
                                        >
                                            {weather.weather?.[0]?.description}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "#6b7280", mt: 1 }}
                                        >
                                            Humidity: {weather.main.humidity}% | Wind: {weather.wind.speed} m/s
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </div>
    );
}

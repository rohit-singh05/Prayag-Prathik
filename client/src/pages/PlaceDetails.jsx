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
import {
    WiDaySunny,
    WiCloudy,
    WiRain,
    WiThunderstorm,
    WiSnow,
} from "react-icons/wi";
import { useSelector, useDispatch } from "react-redux";
import {
    startTranslating,
    stopTranslating,
} from "../store/translationSlice/translationSlice";

export default function PlaceDetails() {
    const { id } = useParams();
    const [place, setPlace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [weather, setWeather] = useState(null);
    const [translatedPlace, setTranslatedPlace] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const language = useSelector((state) => state.language.selectedLanguage);

    const OPENWEATHER_API_KEY = "f3fd35b926c7b3d9f36db91f05aa3e96";

    // ✅ Safe translator with chunking (prevents “Query Length Exceeded”)
    const translateText = async (text, targetLang) => {
        if (!text || targetLang === "en") return text;
        const MAX_CHUNK = 400;
        const chunks = [];
        for (let i = 0; i < text.length; i += MAX_CHUNK) {
            chunks.push(text.slice(i, i + MAX_CHUNK));
        }

        try {
            const results = await Promise.all(
                chunks.map(async (chunk) => {
                    const res = await axios.get("http://localhost:5001/api/translate", {
                        params: { q: chunk, targetLang },
                    });
                    return res.data.translatedText;
                })
            );
            return results.join("");
        } catch (err) {
            console.error("Translation error:", err);
            return text;
        }
    };

    // 🗺️ Fetch place & weather
    useEffect(() => {
        const fetchPlace = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5001/api/routes/spot/${id}`
                );
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

    // 🌐 Translate all texts & numbers
    useEffect(() => {
        const translateEverything = async () => {
            if (!place) return;

            if (language === "en") {
                setTranslatedPlace(place);
                return;
            }

            dispatch(startTranslating());
            try {
                // Combine texts into one string separated by "||"
                const allTexts = [
                    place.name,
                    place.description || "",
                    "🕒 Visiting Hours (Weekly)",
                    "🌦️ Current Weather",
                    "Humidity",
                    "Wind",
                    ...(place.time ? Object.keys(place.time) : []),
                    ...(place.time ? Object.values(place.time) : []),
                    weather?.weather?.[0]?.description || "",
                    weather?.weather?.[0]?.main || "",
                ].join("||");

                const translatedAll = await translateText(allTexts, language);
                const parts = translatedAll.split("||");

                const [
                    tName,
                    tDesc,
                    tVisitingHours,
                    tWeatherTitle,
                    tHumidity,
                    tWind,
                    ...rest
                ] = parts;

                const dayCount = place.time ? Object.keys(place.time).length : 0;
                const tDays = rest.slice(0, dayCount);
                const tTimes = rest.slice(dayCount, 2 * dayCount);
                const tWeatherDesc = rest[2 * dayCount];
                const tWeatherMain = rest[2 * dayCount + 1];

                // Localize numbers to the selected language
                const localizeNumbers = (text) =>
                    text?.replace(/\d+(\.\d+)?/g, (num) =>
                        new Intl.NumberFormat(language).format(num)
                    );

                setTranslatedPlace({
                    ...place,
                    name: tName || place.name,
                    description: localizeNumbers(tDesc || place.description),
                    visitingHoursLabel: tVisitingHours || "🕒 Visiting Hours (Weekly)",
                    weatherLabel: tWeatherTitle || "🌦️ Current Weather",
                    humidityLabel: tHumidity || "Humidity",
                    windLabel: tWind || "Wind",
                    translatedTime:
                        place.time &&
                        Object.fromEntries(
                            Object.keys(place.time).map((day, index) => [
                                tDays[index] || day,
                                tTimes[index] || place.time[day],
                            ])
                        ),
                    translatedWeather: {
                        description: tWeatherDesc || weather?.weather?.[0]?.description,
                        main: tWeatherMain || weather?.weather?.[0]?.main,
                    },
                });
            } catch (err) {
                console.error("Translation failed:", err);
                setTranslatedPlace(place);
            } finally {
                dispatch(stopTranslating());
            }
        };

        translateEverything();
    }, [language, place, weather, dispatch]);

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

    const display = translatedPlace || place;

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

    const localizeNumber = (num) => {
        try {
            return new Intl.NumberFormat(language).format(num);
        } catch {
            return num;
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
                        {display.name}
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: 4,
                        }}
                    >
                        {/* Left Column */}
                        <Box sx={{ flex: 1 }}>
                            {display.image && (
                                <CardMedia
                                    component="img"
                                    height="350"
                                    image={display.image}
                                    alt={display.name}
                                    sx={{
                                        objectFit: "cover",
                                        borderRadius: "16px",
                                        mb: 3,
                                    }}
                                />
                            )}
                            {display.description && (
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: "#374151",
                                        fontSize: "1.05rem",
                                        lineHeight: 1.7,
                                        textAlign: "justify",
                                    }}
                                >
                                    {display.description}
                                </Typography>
                            )}
                        </Box>

                        {/* Right Column */}
                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                            {/* Visiting Hours */}
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
                                    {display.visitingHoursLabel || "🕒 Visiting Hours (Weekly)"}
                                </Typography>

                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                                        gap: 1.5,
                                    }}
                                >
                                    {Object.entries(display.translatedTime || display.time || {}).map(
                                        ([day, time]) => (
                                            <Box
                                                key={day}
                                                sx={{
                                                    backgroundColor: "#ffffffcc",
                                                    borderRadius: "12px",
                                                    p: 1.5,
                                                    textAlign: "center",
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
                                        )
                                    )}
                                </Box>
                            </Box>

                            {/* Weather */}
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
                                        {display.weatherLabel || "🌦️ Current Weather"}
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {getWeatherIcon(
                                            display.translatedWeather?.main || weather.weather?.[0]?.main
                                        )}
                                        <Typography
                                            variant="h5"
                                            sx={{ mt: 1, color: "#1e40af", fontWeight: "bold" }}
                                        >
                                            {localizeNumber(weather.main.temp.toFixed(1))}°C
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: "#374151",
                                                mt: 0.5,
                                                textTransform: "capitalize",
                                            }}
                                        >
                                            {display.translatedWeather?.description ||
                                                weather.weather?.[0]?.description}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "#6b7280", mt: 1 }}>
                                            {`${display.humidityLabel || "Humidity"}: ${localizeNumber(
                                                weather.main.humidity
                                            )}% | ${display.windLabel || "Wind"}: ${localizeNumber(
                                                weather.wind.speed
                                            )} m/s`}
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

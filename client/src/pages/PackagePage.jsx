import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
    startTranslating,
    stopTranslating,
} from "../store/translationSlice/translationSlice";
import { setLanguage } from "../store/languageSlice/languageSlice";
import axios from "axios";
import {
    Card,
    CardContent,
    Typography,
    Button,
    Backdrop,
    CircularProgress,
    Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import { monthlySuggestions } from "../utils/monthlySuggestions";

const translateText = async (text, targetLang) => {
    try {
        const res = await axios.get("http://localhost:5001/api/translate", {
            params: { q: text, targetLang },
        });
        return res.data.translatedText;
    } catch (error) {
        console.error("Translation error:", error);
        return text;
    }
};

const PackagesPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const language = useSelector((state) => state.language.selectedLanguage);
    const translatingCount = useSelector(
        (state) => state.translation.translatingCount
    );
    const isTranslating = translatingCount > 0;

    const [packages, setPackages] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [others, setOthers] = useState([]);
    const [translatedPackages, setTranslatedPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");


    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [monthSuggestion, setMonthSuggestion] = useState("");

    const [uiTexts, setUiTexts] = useState({
        translating: "Translating Content...",
        exploreTitle: "Explore Prayagraj",
        exploreButton: "Explore",
        noPackages: "No recommended packages available for this month.",
        visitingMonth: "Visiting Month",
        planVisit: "Plan Your Visit",
        recommendedTitle: "Recommended Packages",
        otherTitle: "Other Packages",
    });

    useEffect(() => {
        setMonthSuggestion(monthlySuggestions[selectedMonth]);
    }, [selectedMonth]);

    useEffect(() => {
        if (startDate) {
            const month = new Date(startDate).getMonth();
            setSelectedMonth(month);
        }
    }, [startDate]);


    // ✅ Fetch all packages and separate them
    useEffect(() => {
        const fetchPackages = async () => {
            setLoading(true);
            try {
                const res = await axios.get("http://localhost:5001/api/packages");
                const allPackages = res.data.packages;

                const recommendedList = allPackages.filter((pkg) =>
                    pkg.recommendedMonths?.includes(selectedMonth)
                );
                const otherList = allPackages.filter(
                    (pkg) => !pkg.recommendedMonths?.includes(selectedMonth)
                );

                setPackages(allPackages);
                setRecommended(recommendedList);
                setOthers(otherList);
                setTranslatedPackages(allPackages);
            } catch (err) {
                console.error("Error fetching packages:", err);
                setPackages([]);
                setRecommended([]);
                setOthers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, [selectedMonth]);

    // ✅ Translate when language changes
    useEffect(() => {
        const translateAll = async () => {
            if (!packages.length) return;

            if (language === "en") {
                setTranslatedPackages(packages);
                setUiTexts({
                    translating: "Translating Content...",
                    exploreTitle: "Explore Prayagraj",
                    exploreButton: "Explore",
                    noPackages: "No recommended packages available for this month.",
                    visitingMonth: "Visiting Month",
                    planVisit: "Plan Your Visit",
                    recommendedTitle: "Recommended Packages",
                    otherTitle: "Other Packages",
                });
                return;
            }

            try {
                dispatch(startTranslating());

                // Translate UI texts
                const [
                    translating,
                    exploreTitle,
                    exploreButton,
                    noPackages,
                    visitingMonth,
                    planVisit,
                    recommendedTitle,
                    otherTitle,
                ] = await Promise.all([
                    translateText("Translating Content...", language),
                    translateText("Explore Prayagraj", language),
                    translateText("Explore", language),
                    translateText(
                        "No recommended packages available for this month.",
                        language
                    ),
                    translateText("Visiting Month", language),
                    translateText("Plan Your Visit", language),
                    translateText("Recommended Packages", language),
                    translateText("Other Packages", language),
                ]);

                setUiTexts({
                    translating,
                    exploreTitle,
                    exploreButton,
                    noPackages,
                    visitingMonth,
                    planVisit,
                    recommendedTitle,
                    otherTitle,
                });

                const translated = await Promise.all(
                    packages.map(async (p) => {
                        const textToTranslate = `${p.title}||${p.description}`;
                        const translatedText = await translateText(
                            textToTranslate,
                            language
                        );
                        const [tTitle, tDesc] = translatedText.split("||");
                        return {
                            ...p,
                            title: tTitle || p.title,
                            description: tDesc || p.description,
                        };
                    })
                );

                setTranslatedPackages(translated);
            } catch (err) {
                console.error("Translation failed:", err);
                setTranslatedPackages(packages);
            } finally {
                dispatch(stopTranslating());
            }
        };

        translateAll();
    }, [language, packages, dispatch]);

    const handleExplore = (pkg) => {
        navigate("/explore", { state: { selectedPackage: pkg } });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-emerald-50">
                <CircularProgress color="inherit" />
            </div>
        );
    }

    // ✨ Reusable smaller card grid with improved style
    const renderPackageGrid = (list, isRecommended = false) => (
        <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            {list.map((pkg) => (
                <motion.div
                    key={pkg._id}
                    whileHover={{ scale: 1.04 }}
                    transition={{ type: "spring", stiffness: 200 }}
                >
                    <Card
                        className={`rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl 
                            ${isRecommended
                                ? "bg-white/70 backdrop-blur-md border border-emerald-200"
                                : "bg-white"
                            }`}
                    >
                        <div className="relative">
                            <img
                                src={pkg.image}
                                alt={pkg.title}
                                className="w-full h-44 object-cover rounded-t-2xl"
                            />
                            {isRecommended && (
                                <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full shadow-md">
                                    Recommended
                                </span>
                            )}
                        </div>
                        <CardContent className="p-4">
                            <Typography
                                variant="h6"
                                className={`font-bold mb-1 tracking-wide 
                                    ${isRecommended ? "text-emerald-800" : "text-gray-800"}`}
                            >
                                {pkg.title}
                            </Typography>
                            <Typography
                                variant="body2"
                                className="text-gray-600 leading-relaxed mb-3 line-clamp-3"
                            >
                                {pkg.description}
                            </Typography>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleExplore(pkg)}
                                className={`rounded-full px-4 py-1 text-sm font-medium transition-all duration-300 
                                    ${isRecommended
                                        ? "!bg-emerald-600 hover:!bg-emerald-700"
                                        : "!bg-amber-600 hover:!bg-amber-700"}`}
                            >
                                {uiTexts.exploreButton}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 py-4 px-6 relative">
            {/* 🧭 Navbar */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md shadow-md rounded-b-xl z-[900] flex flex-col sm:flex-row items-center justify-between px-6 py-3 mb-6">
                <Typography
                    variant="h6"
                    className="text-emerald-700 font-semibold mb-2 sm:mb-0"
                >
                    {uiTexts.planVisit}
                </Typography>

                {/* Start Date + End Date */}
                <div className="flex items-center gap-6 mb-2 sm:mb-0">

                    {/* Starting Date */}
                    <div className="flex items-center gap-3">
                        <label className="text-gray-700 font-medium text-sm">
                            Starting Date:
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                    </div>

                    {/* Ending Date */}
                    <div className="flex items-center gap-3">
                        <label className="text-gray-700 font-medium text-sm">
                            Ending Date:
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                    </div>
                </div>


                {/* Language Selector */}
                <div className="flex items-center gap-2">
                    <label className="text-gray-700 font-medium text-sm hidden sm:inline">
                        Language:
                    </label>
                    <select
                        value={language}
                        onChange={(e) => dispatch(setLanguage(e.target.value))}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="bn">Bengali</option>
                        <option value="te">Telugu</option>
                        <option value="mr">Marathi</option>
                        <option value="ta">Tamil</option>
                        <option value="ur">Urdu</option>
                        <option value="gu">Gujarati</option>
                        <option value="kn">Kannada</option>
                        <option value="or">Odia</option>
                        <option value="pa">Punjabi</option>
                        <option value="ml">Malayalam</option>
                    </select>
                </div>
            </div>

            {/* 🌤️ Monthly Suggestion */}
            <div className="max-w-3xl mx-auto mb-8 bg-emerald-100 border border-emerald-200 p-5 rounded-2xl shadow-sm">
                <Typography
                    variant="body1"
                    className="text-emerald-800 text-center font-medium text-lg"
                >
                    {monthSuggestion}
                </Typography>
            </div>

            {/* Translating Overlay */}
            <Backdrop
                open={isTranslating}
                sx={{
                    color: "#fff",
                    zIndex: 1200,
                    flexDirection: "column",
                    backdropFilter: "blur(5px)",
                }}
            >
                <CircularProgress color="inherit" />
                <Typography variant="h6" sx={{ color: "#fff" }}>
                    {uiTexts.translating}
                </Typography>
            </Backdrop>

            {/* 🏆 Recommended Packages */}
            <Typography
                variant="h4"
                className="text-emerald-700 font-bold mb-6 text-center tracking-wide"
            >
                {uiTexts.recommendedTitle}
            </Typography>
            {recommended.length > 0 ? (
                renderPackageGrid(recommended, true)
            ) : (
                <Typography
                    variant="body1"
                    className="text-center text-gray-600 mt-6"
                >
                    {uiTexts.noPackages}
                </Typography>
            )}

            <Divider sx={{ my: 8 }} />

            {/* 📦 Other Packages */}
            <Typography
                variant="h4"
                className="text-amber-700 font-bold mb-6 text-center tracking-wide"
            >
                {uiTexts.otherTitle}
            </Typography>
            {others.length > 0 ? (
                renderPackageGrid(others)
            ) : (
                <Typography
                    variant="body1"
                    className="text-center text-gray-600 mt-6"
                >
                    No other packages available.
                </Typography>
            )}
        </div>
    );
};

export default PackagesPage;

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
} from "@mui/material";
import { motion } from "framer-motion";
import { monthlySuggestions } from "../utils/monthlySuggestions";
import { Box } from "lucide-react";

const translateText = async (text, targetLang) => {
    try {
        const res = await axios.get("http://localhost:5001/api/translate", {
            params: {
                q: text,
                targetLang: targetLang,
            },
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
    const [translatedPackages, setTranslatedPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    const [monthlyTip, setMonthlyTip] = useState("");
    const [showTip, setShowTip] = useState(false);

    // ✅ Added for static text translation
    const [uiTexts, setUiTexts] = useState({
        tipHeading: "Tip of the Month",
        translating: "Translating Content...",
        exploreTitle: "Explore Prayagraj",
        exploreButton: "Explore",
    });

    useEffect(() => {
        const month = new Date().getMonth();
        setMonthlyTip(monthlySuggestions[month]);
    }, []);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const res = await axios.get("http://localhost:5001/api/packages");
                setPackages(res.data.packages || []);
                setTranslatedPackages(res.data.packages || []);
            } catch (err) {
                console.error("Error fetching packages:", err);
                setPackages([]);
                setTranslatedPackages([]);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    useEffect(() => {
        const translatePackages = async () => {
            if (!packages.length) return;

            if (language === "en") {
                setTranslatedPackages(packages);
                // ✅ Reset UI texts to English
                setUiTexts({
                    tipHeading: "Tip of the Month",
                    translating: "Translating Content...",
                    exploreTitle: "Explore Prayagraj",
                    exploreButton: "Explore",
                });
                return;
            }

            try {
                dispatch(startTranslating());

                // ✅ Translate UI texts along with packages
                const [tipHeading, translating, exploreTitle, exploreButton] =
                    await Promise.all([
                        translateText("Tip of the Month", language),
                        translateText("Translating Content...", language),
                        translateText("Explore Prayagraj", language),
                        translateText("Explore", language),
                    ]);

                setUiTexts({
                    tipHeading,
                    translating,
                    exploreTitle,
                    exploreButton,
                });

                // ✅ Translate all packages
                const translated = await Promise.all(
                    packages.map(async (p) => {
                        const textToTranslate = `${p.title}||${p.description}`;
                        const translatedText = await translateText(textToTranslate, language);
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

        translatePackages();
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 py-12 px-6 relative">
            <div className="absolute top-4 right-4 z-[1000]">
                <select
                    value={language}
                    onChange={(e) => dispatch(setLanguage(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
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

            {/* 💡 Tip of the Month Floating Button */}
            <div className="absolute top-24 left-4 z-[1000] flex flex-col items-center">
                <button
                    onClick={() => setShowTip(!showTip)}
                    className="w-14 h-14 rounded-full bg-emerald-600 text-white shadow-lg flex items-center justify-center hover:bg-emerald-700 transition-all cursor-pointer"
                    title={uiTexts.tipHeading}
                >
                    <span className="text-xl font-bold">💡</span>
                </button>

                {showTip && (
                    <div className="absolute left-16 top-0 bg-white text-gray-800 rounded-xl shadow-lg px-4 py-3 w-xs max-w-lg text-sm animate-fadeIn z-50">
                        <h4 className="font-semibold mb-1">{uiTexts.tipHeading}</h4>
                        <p>{monthlyTip}</p>
                    </div>
                )}
            </div>

            {/* Translating Backdrop */}
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

            {/* Heading */}
            <motion.h1
                className="text-4xl sm:text-5xl font-bold text-emerald-700 mb-12 text-center"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                {uiTexts.exploreTitle}
            </motion.h1>

            {/* Packages Grid */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                {translatedPackages.map((pkg) => (
                    <motion.div
                        key={pkg._id}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 200 }}
                    >
                        <Card className="rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl relative cursor-pointer group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-100" />
                            <img src={pkg.image} alt={pkg.title} className="w-full h-64 object-cover" />
                            <CardContent className="relative z-20 flex flex-col justify-between h-48 p-5">
                                <div>
                                    <Typography variant="h6" className="font-semibold text-white mb-2 drop-shadow-lg">
                                        {pkg.title}
                                    </Typography>
                                    <Typography variant="body2" className="text-gray-100 drop-shadow-md">
                                        {pkg.description}
                                    </Typography>
                                </div>
                                <Button
                                    variant="contained"
                                    onClick={() => handleExplore(pkg)}
                                    className="!bg-emerald-600 hover:!bg-emerald-700 rounded-full mt-4 transition-transform duration-300 transform group-hover:scale-105"
                                >
                                    {uiTexts.exploreButton}
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default PackagesPage;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { startTranslating, stopTranslating } from "../store/translationSlice/translationSlice";
import axios from "axios";
import { Card, CardContent, Typography, Button, Backdrop, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import { monthlySuggestions } from "../utils/monthlySuggestions";

const PackagesPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const language = useSelector((state) => state.language.language);
    const isTranslating = useSelector((state) => state.translation.isTranslating);

    const [packages, setPackages] = useState([]);
    const [translatedPackages, setTranslatedPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    const [monthlyTip, setMonthlyTip] = useState("");
    const [showTip, setShowTip] = useState(false);

    useEffect(() => {
        const month = new Date().getMonth();
        setMonthlyTip(monthlySuggestions[month]);
    }, []);


    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const res = await axios.get("http://localhost:5001/api/packages");

                console.log(res.data)
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
            if (language === "en") {
                setTranslatedPackages(packages);
                return;
            }

            try {
                dispatch(startTranslating());
                const res = await axios.post("http://localhost:5001/api/translate", {
                    texts: packages.map((p) => `${p.title}||${p.description}`),
                    targetLang: language,
                });

                const translatedTexts = res.data.translatedTexts || [];
                const updated = packages.map((p, idx) => {
                    const [tTitle, tDesc] = translatedTexts[idx].split("||");
                    return { ...p, title: tTitle, description: tDesc };
                });

                setTranslatedPackages(updated);
            } catch (err) {
                console.error("Translation failed:", err);
                setTranslatedPackages(packages);
            } finally {
                dispatch(stopTranslating());
            }
        };

        if (packages.length > 0) translatePackages();
    }, [language, packages]);

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

        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 py-12 px-6">
            <div className="absolute top-24 left-4 z-[1000] flex flex-col items-center">
                <button
                    onClick={() => setShowTip(!showTip)}
                    className="w-14 h-14 rounded-full bg-emerald-600 text-white shadow-lg flex items-center justify-center hover:bg-emerald-700 transition-all cursor-pointer"
                    title="Tip of the Month"
                >
                    <span className="text-xl font-bold">💡</span>
                </button>

                {showTip && (
                    <div className="absolute left-16 top-0 bg-white text-gray-800 rounded-xl shadow-lg px-4 py-3 w-xs max-w-lg text-sm animate-fadeIn z-50">
                        <h4 className="font-semibold mb-1">Tip of the Month</h4>
                        <p>{monthlyTip}</p>
                    </div>
                )}
            </div>



            <Backdrop open={isTranslating} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <CircularProgress color="inherit" />
                <Typography variant="h6" className="ml-3">
                    Translating packages...
                </Typography>
            </Backdrop>

            <motion.h1
                className="text-4xl sm:text-5xl font-bold text-emerald-700 mb-12 text-center"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                Explore Prayagraj
            </motion.h1>

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
                            <div
                                className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-100"
                            />
                            <img
                                src={pkg.image}
                                alt={pkg.title}
                                className="w-full h-64 object-cover"
                            />
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
                                    Explore
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

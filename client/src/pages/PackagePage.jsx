import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { startTranslating, stopTranslating } from "../store/translationSlice/translationSlice";
import axios from "axios";
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Backdrop,
    CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";

const PackagesPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const language = useSelector((state) => state.language.language);
    const isTranslating = useSelector((state) => state.translation.isTranslating);

    const [packages, setPackages] = useState([
        {
            id: 1,
            title: "Heritage & Monuments Tour",
            description: "Explore the historic monuments and heritage sites of Prayagraj.",
            image: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Allahabad_Fort.jpg",
            locations: ["Allahabad Fort", "Anand Bhavan"],
        },
        {
            id: 2,
            title: "Spiritual & Ghats Circuit",
            description: "Experience the divine aura at the ghats and temples of Prayagraj.",
            image: "https://upload.wikimedia.org/wikipedia/commons/3/36/Triveni_Sangam_2011.JPG",
            locations: ["Triveni Sangam", "Hanuman Temple", "Kalyani Devi Temple", "Shankar Viman Mandapam"],
        },
        {
            id: 3,
            title: "Nature & Parks Trail",
            description: "Enjoy the peaceful parks and scenic beauty of Prayagraj.",
            image: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Chandrashekhar_Azad_Park_1.jpg",
            locations: ["Chandrashekhar Azad Park", "Minto Park", "Alopi Bagh"],
        },
        {
            id: 4,
            title: "Cultural & Museums Tour",
            description: "Discover Prayagraj’s cultural landmarks and fascinating museums.",
            image: "https://upload.wikimedia.org/wikipedia/commons/5/52/Anand_Bhavan_Museum.jpg",
            locations: ["Allahabad Museum", "Anand Bhavan Museum", "Swaraj Bhawan"],
        },
    ]);


    const [translatedPackages, setTranslatedPackages] = useState([]);

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

        translatePackages();
    }, [language]);

    const handleExplore = (pkg) => {
        navigate("/explore", { state: { selectedPackage: pkg } });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex flex-col items-center py-12 px-6">
            <Backdrop open={isTranslating} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <CircularProgress color="inherit" />
                <Typography variant="h6" className="ml-3">
                    Translating packages...
                </Typography>
            </Backdrop>

            <motion.h1
                className="text-4xl font-bold text-emerald-700 mb-10 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                Choose Your Prayagraj Experience
            </motion.h1>

            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-7xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                {translatedPackages.map((pkg) => (
                    <motion.div
                        key={pkg.id}
                        whileHover={{ scale: 1.04 }}
                        transition={{ type: "spring", stiffness: 200 }}
                    >
                        <Card className="rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 bg-white">
                            <CardMedia component="img" height="220" image={pkg.image} alt={pkg.title} />
                            <CardContent className="flex flex-col justify-between h-48 p-5">
                                <div>
                                    <Typography variant="h6" className="font-semibold text-emerald-700 mb-2">
                                        {pkg.title}
                                    </Typography>
                                    <Typography variant="body2" className="text-gray-600">
                                        {pkg.description}
                                    </Typography>
                                </div>
                                <Button
                                    variant="contained"
                                    onClick={() => handleExplore(pkg)}
                                    className="!bg-emerald-600 hover:!bg-emerald-700 rounded-full mt-4 transition-all"
                                >
                                    Explore This Package
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

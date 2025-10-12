import {
    Drawer,
    Divider,
    Chip,
    IconButton,
} from "@mui/material";
import { MapPin, Clock, Navigation, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { startTranslating, stopTranslating } from "../store/translationSlice/translationSlice"

export default function RoutesSidebar({ routes, isOpen, setIsOpen, activeStep }) {
    if (!routes?.length) return null;

    const route = routes[0];
    const { startStop, plan, totalCost, days } = route;

    const stepRefs = useRef([]);

    const dispatch = useDispatch();
    const language = useSelector((state) => state.language.selectedLanguage);

    const [texts, setTexts] = useState({
        routeOverview: "Route Overview",
        journeyPlan: "Your optimized journey plan",
        startingPoint: "Starting Point",
        distanceFromYou: "Distance from you",
        days: "Days",
        totalCost: "Total Cost",
        travel: "Travel",
        mode: "Mode",
        from: "From",
        to: "To",
        time: "Time",
        cost: "Cost",
        visit: "Visit",
        arrival: "Arrival",
        leave: "Leave",
        exploreTime: "Explore Time",
        day: "Day",
        noPlan: "No plan available."
    });

    const translateText = async (text, targetLang) => {
        try {
            const res = await axios.get('http://localhost:5001/api/translate', {
                params: {
                    q: text,
                    targetLang: targetLang
                }
            });
            let translated = res.data.translatedText || text;
            translated = translated.replace(/@\s*action\s*:\s*button/gi, "").trim();
            return translated;
        } catch (error) {
            console.error("Translation error:", error);
            return text;
        }
    };

    useEffect(() => {
        const doTranslation = async () => {
            if (language === "en") {
                setTexts({
                    routeOverview: "Route Overview",
                    journeyPlan: "Your optimized journey plan",
                    startingPoint: "Starting Point",
                    distanceFromYou: "Distance from you",
                    days: "Days",
                    totalCost: "Total Cost",
                    travel: "Travel",
                    mode: "Mode",
                    from: "From",
                    to: "To",
                    time: "Time",
                    cost: "Cost",
                    visit: "Visit",
                    arrival: "Arrival",
                    leave: "Leave",
                    exploreTime: "Explore Time",
                    day: "Day",
                    noPlan: "No plan available."
                });
            } else {
                dispatch(startTranslating());
                try {
                    const keys = [
                        { key: "routeOverview", text: "Route Overview" },
                        { key: "journeyPlan", text: "Your optimized journey plan" },
                        { key: "startingPoint", text: "Starting Point" },
                        { key: "distanceFromYou", text: "Distance from you" },
                        { key: "days", text: "Days" },
                        { key: "totalCost", text: "Total Cost" },
                        { key: "travel", text: "Travel" },
                        { key: "mode", text: "Mode" },
                        { key: "from", text: "From" },
                        { key: "to", text: "To" },
                        { key: "time", text: "Time" },
                        { key: "cost", text: "Cost" },
                        { key: "visit", text: "Visit" },
                        { key: "arrival", text: "Arrival" },
                        { key: "leave", text: "Leave" },
                        { key: "exploreTime", text: "Explore Time" },
                        { key: "day", text: "Day" },
                        { key: "noPlan", text: "No plan available." }
                    ];

                    const translations = await Promise.all(
                        keys.map((item) =>
                            translateText(item.text, language).then((translated) => ({
                                key: item.key,
                                text: translated,
                            }))
                        )
                    );

                    const newTexts = {};
                    translations.forEach(({ key, text }) => {
                        newTexts[key] = text;
                    });

                    setTexts(newTexts);
                } catch (error) {
                    console.error("Translation failed:", error);
                } finally {
                    dispatch(stopTranslating());
                }
            }
        };

        doTranslation();
    }, [language]);

    useEffect(() => {
        if (activeStep != null && stepRefs.current[activeStep]) {
            stepRefs.current[activeStep].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, [activeStep]);

    return (
        <>
            <IconButton
                onClick={() => setIsOpen(!isOpen)}
                sx={{
                    position: "fixed",
                    bottom: 24,
                    right: isOpen ? 440 : 24,
                    zIndex: 1301,
                    background: "white",
                    border: "1px solid #ddd",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    "&:hover": { background: "#f9fafb" },
                }}
            >
                {isOpen ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>

            <Drawer
                anchor="right"
                open={isOpen}
                variant="persistent"
                sx={{
                    "& .MuiDrawer-paper": {
                        width: 420,
                        boxSizing: "border-box",
                        padding: 0,
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        background: "white",
                    },
                }}
            >
                <div className="px-6 py-5 border-b border-emerald-200 bg-gradient-to-r from-emerald-600 to-teal-500 shadow-sm">
                    <h1 className="text-xl font-bold text-white tracking-wide">
                        {texts.routeOverview}
                    </h1>
                    <p className="text-xs text-emerald-100 mt-1">
                        {texts.journeyPlan}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 text-sm text-neutral-800">
                    {startStop && (
                        <div className="p-4 rounded-xl border bg-white shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Navigation className="w-4 h-4 text-emerald-600" />
                                <span className="font-semibold text-neutral-700 text-sm">
                                    {texts.startingPoint}
                                </span>
                            </div>
                            <p className="font-medium text-neutral-900">{startStop.name}</p>
                            <p className="text-xs text-neutral-500">
                                {texts.distanceFromYou}: {startStop.distanceFromUserKm} km
                            </p>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <Chip
                            icon={<Calendar size={14} />}
                            label={`${texts.days}: ${days}`}
                            sx={{
                                borderRadius: "9999px",
                                fontSize: "0.8rem",
                                fontWeight: 500,
                                paddingLeft: 1
                            }}
                            color="primary"
                            variant="outlined"
                        />
                        <Chip
                            label={`${texts.totalCost}: ₹${totalCost}`}
                            sx={{
                                borderRadius: "9999px",
                                fontSize: "0.8rem",
                                fontWeight: 500,
                            }}
                            color="success"
                            variant="outlined"
                        />
                    </div>

                    <Divider />

                    {plan && plan.length > 0 ? (
                        <div className="space-y-4">
                            {plan.map((step, idx) => (
                                <div
                                    key={idx}
                                    ref={el => stepRefs.current[idx] = el}
                                    className={`p-4 rounded-xl border bg-white shadow-sm space-y-3 transition-all ${activeStep === idx ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin className={`w-4 h-4 ${activeStep === idx ? "text-red-600" : "text-emerald-600"}`} />
                                            <span className="font-semibold text-neutral-700 text-sm">
                                                {texts.travel}
                                            </span>
                                        </div>
                                        <p className="text-xs text-neutral-500">
                                            {texts.mode}:{" "}
                                            <span className="font-medium text-neutral-800">
                                                {step.travel.mode}
                                            </span>
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            {texts.from}: {step.travel.from.name} → {texts.to}: {step.travel.to.name}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            {texts.time}: {step.travel.time} mins | {texts.cost}: ₹{step.travel.cost}
                                        </p>
                                    </div>

                                    <Divider />

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock className={`w-4 h-4 ${activeStep === idx ? "text-red-600" : "text-emerald-600"}`} />
                                            <span className="font-semibold text-neutral-700 text-sm">
                                                {texts.visit}
                                            </span>
                                        </div>
                                        <p className="font-medium text-neutral-900">
                                            {step.visit.stop.name}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            {texts.arrival}:{" "}
                                            {new Date(step.visit.arrival).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            {texts.leave}:{" "}
                                            {new Date(step.visit.leave).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            {texts.exploreTime}: {step.visit.exploreTime} mins
                                        </p>
                                        <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                                            {texts.day} {step.visit.day}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-neutral-400">{texts.noPlan}</p>
                    )}
                </div>
            </Drawer>
        </>
    );
}

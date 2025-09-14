import { useEffect, useState } from "react";
import MapView from "../components/MapView";
import DestinationSidebar from "../components/DestinationSidebar";
import RoutesSidebar from "../components/RoutesSidebar";
import axios from "axios";
import {
  startTranslating,
  stopTranslating,
} from "../store/translationSlice/translationSlice";
import {
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Backdrop,
  Typography,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/MenuOpen";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLanguage } from "../store/languageSlice/languageSlice";

export default function ExplorePage() {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPathSidebarOpen, setIsPathSidebarOpen] = useState(false);
  const [selectedStart, setSelectedStart] = useState("");
  const [pathLoading, setPathLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [touristSpots, setTouristSpots] = useState([]);
  const [allSpots, setAllSpots] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isFetchingPath, setIsFetchingPath] = useState(false);
  const [originalTouristSpots, setOriginalTouristSpots] = useState([]);
  const [originalAllSpots, setOriginalAllSpots] = useState([]);

  const dispatch = useDispatch();
  const language = useSelector((state) => state.language.selectedLanguage);
  const translatingCount = useSelector(
    (state) => state.translation.translatingCount
  );
  const isTranslating = translatingCount > 0;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const [texts, setTexts] = useState({
    useCurrent: "Use Current Location",
    findPath: "Find Path",
    locationInfo: "Location Info",
    closeSidebar: "Close Destinations Sidebar",
    openSidebar: "Open Destinations Sidebar",
    currentLocationSet: "Current Location Set",
    fetchingLocation: "Fetching current location...",
    fetchingPath: "Fetching current path...",
    translatingContent: "Translating content...",
  });

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

  useEffect(() => {
    if (!touristSpots.length || !allSpots.length) return;

    const doTranslation = async () => {
      if (language === "en") {
        setTouristSpots(originalTouristSpots);
        setAllSpots(originalAllSpots);

        setTexts({
          useCurrent: "Use Current Location",
          findPath: "Find Path",
          locationInfo: "Location Info",
          closeSidebar: "Close Destinations Sidebar",
          openSidebar: "Open Destinations Sidebar",
          currentLocationSet: "Current Location Set",
          fetchingLocation: "Fetching current location...",
          fetchingPath: "Fetching current path...",
          translatingContent: "Translating content...",
        });
        return;
      }

      dispatch(startTranslating());

      try {
        const translatedTexts = await Promise.all([
          translateText("Use Current Location", language),
          translateText("Find Path", language),
          translateText("Location Info", language),
          translateText("Close Destinations Sidebar", language),
          translateText("Open Destinations Sidebar", language),
          translateText("Current Location Set", language),
          translateText("Fetching current location...", language),
          translateText("Fetching current path...", language),
          translateText("Translating content...", language),
        ]);

        setTexts({
          useCurrent: translatedTexts[0],
          findPath: translatedTexts[1],
          locationInfo: translatedTexts[2],
          closeSidebar: translatedTexts[3],
          openSidebar: translatedTexts[4],
          currentLocationSet: translatedTexts[5],
          fetchingLocation: translatedTexts[6],
          fetchingPath: translatedTexts[7],
          translatingContent: translatedTexts[8],
        });

        const translatedTouristSpots = await Promise.all(
          touristSpots.map(async (s) => ({
            ...s,
            translatedName: await translateText(s.name, language),
          }))
        );
        setTouristSpots(translatedTouristSpots);

        const translatedAllSpots = await Promise.all(
          allSpots.map(async (s) => ({
            ...s,
            translatedName: await translateText(s.name, language),
          }))
        );
        setAllSpots(translatedAllSpots);
      } catch (err) {
        console.error("Translation failed", err);

        setTexts({
          useCurrent: "Use Current Location",
          findPath: "Find Path",
          locationInfo: "Location Info",
          closeSidebar: "Close Destinations Sidebar",
          openSidebar: "Open Destinations Sidebar",
          currentLocationSet: "Current Location Set",
          fetchingLocation: "Fetching current location...",
          fetchingPath: "Fetching current path...",
          translatingContent: "Translating content...",
        });
      } finally {
        dispatch(stopTranslating());
      }
    };

    doTranslation();
  }, [language, touristSpots.length, allSpots.length]);

  useEffect(() => {
    setRoutes([]);
  }, [selectedStart, selectedDestination]);

  useEffect(() => {
    const fetchTouristSpots = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5001/api/routes/tourist-spots"
        );
        const spots = res.data.spots.map((s) => ({
          id: s._id,
          name: s.name,
          lat: s.location.coordinates[1],
          lng: s.location.coordinates[0],
        }));
        setTouristSpots(spots);
        setOriginalTouristSpots(spots);
      } catch (err) {
        console.error("Error fetching tourist spots:", err);
      }
    };

    const fetchAllSpots = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5001/api/routes/all-spots"
        );
        const spots = res.data.spots.map((s) => ({
          id: s._id,
          name: s.name,
          lat: s.location.coordinates[1],
          lng: s.location.coordinates[0],
        }));
        setAllSpots(spots);
        setOriginalAllSpots(spots);
      } catch (err) {
        console.error("Error fetching all spots:", err);
      }
    };

    fetchTouristSpots();
    fetchAllSpots();
  }, []);

  useEffect(() => {
    if (selectedStart) {
      const spot = allSpots.find((s) => s.id === selectedStart);
      if (spot) setUserLocation({ lat: spot.lat, lng: spot.lng });
      else setUserLocation(null);
    }
  }, [selectedStart, allSpots]);

  const handleFindPath = async () => {
    if (!userLocation || !selectedDestination) return;
    setPathLoading(true);
    setIsPathSidebarOpen(true);
    setIsFetchingPath(true);

    try {
      const destinationsPayload = (
        Array.isArray(selectedDestination)
          ? selectedDestination
          : [selectedDestination]
      )
        .map((dest) => {
          const spot = touristSpots.find(
            (s) => s.id === dest.id || s.id === dest
          );
          return spot ? { id: spot.id, lat: spot.lat, lng: spot.lng } : null;
        })
        .filter(Boolean);

      const res = await axios.post(
        "http://localhost:5001/api/routes/calculate",
        {
          startLat: userLocation.lat,
          startLng: userLocation.lng,
          destinations: destinationsPayload,
        }
      );

      const pathData = res?.data;
      if (pathData) {
        const transformedRoute = {
          startStop: pathData.startStop,
          plan: pathData.plan,
          totalCost: pathData.totalCost,
          days: pathData.days,
        };
        setRoutes([transformedRoute]);
      } else setRoutes([]);

      setActiveStep(null);
    } catch (err) {
      console.error("Error fetching path:", err);
      setRoutes([]);
    } finally {
      setPathLoading(false);
      setIsFetchingPath(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsFetchingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setSelectedStart("current-location");
          setDialogMessage(texts.currentLocationSet);
          setDialogOpen(true);
          setIsFetchingLocation(false);
          setTimeout(() => setDialogOpen(false), 1000);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setDialogMessage("Unable to fetch location.");
          setDialogOpen(true);
          setIsFetchingLocation(false);
          setTimeout(() => setDialogOpen(false), 1000);
        }
      );
    } else {
      setDialogMessage("Geolocation is not supported.");
      setDialogOpen(true);
      setTimeout(() => setDialogOpen(false), 1000);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 font-sans relative">
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

      <DestinationSidebar
        isSidebarOpen={isSidebarOpen}
        predefinedDestinations={touristSpots}
        predefinedStarts={allSpots}
        selectedDestination={selectedDestination}
        setSelectedDestination={setSelectedDestination}
        selectedStart={selectedStart}
        setSelectedStart={setSelectedStart}
        handleFindPath={handleFindPath}
        handleUseCurrentLocation={handleUseCurrentLocation}
        userLocation={userLocation}
        pathLoading={pathLoading}
      />

      <div className={`absolute bottom-4 z-[1000] transition-all duration-300`}>
        <Tooltip title={isSidebarOpen ? texts.closeSidebar : texts.openSidebar}>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 absolute bottom-0 ${
              isSidebarOpen
                ? "left-[23rem] -translate-x-6"
                : "left-0 translate-x-6"
            }`}
          >
            {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </Tooltip>
      </div>

      <main className="flex-1 relative transition-all duration-500 z-0">
        <MapView
          userLocation={userLocation}
          destinations={selectedDestination}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          zoomLevel={zoomLevel}
          routes={routes}
        />
      </main>

      <RoutesSidebar
        isOpen={isPathSidebarOpen}
        setIsOpen={setIsPathSidebarOpen}
        routes={routes}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
      />

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        TransitionProps={{ timeout: 300 }}
        PaperProps={{
          sx: {
            border: "1px solid #10b981",
            borderRadius: "12px",
            bgcolor: "white",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            transition: "all 0.3s ease",
            position: "fixed",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            width: "auto",
            maxWidth: "90%",
            minWidth: 200,
            textAlign: "center",
            px: 2,
            py: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontSize: "1.1rem", color: "#065f46", p: 0 }}>
          {texts.locationInfo}
        </DialogTitle>
        <DialogContent sx={{ fontSize: "0.95rem", color: "#374151", p: 0 }}>
          {dialogMessage}
        </DialogContent>
      </Dialog>

      <Backdrop
        open={isFetchingLocation || isFetchingPath || isTranslating}
        sx={{
          color: "#fff",
          zIndex: 1200,
          flexDirection: "column",
          backdropFilter: "blur(5px)",
        }}
      >
        <CircularProgress color="inherit" />
        <Box mt={2}>
          <Typography variant="h6" sx={{ color: "#fff" }}>
            {isFetchingLocation
              ? texts.fetchingLocation
              : isFetchingPath
              ? texts.fetchingPath
              : texts.translatingContent}
          </Typography>
        </Box>
      </Backdrop>
    </div>
  );
}

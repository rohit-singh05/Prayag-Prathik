import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Backdrop, CircularProgress, Typography, Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setLanguage } from "../store/languageSlice/languageSlice";

export default function HomePage() {
  const images = [
    "https://media1.thrillophilia.com/filestore/vk45hoek3wsyroreldnuwmo76s70_1584364169_shutterstock_770754100.jpg?w=753&h=450&dpr=2.0",
    "https://media1.thrillophilia.com/filestore/qn2pdpgz4nxehsizart3stilhbqf_1584363975_shutterstock_133091327.jpg?w=753&h=450&dpr=2.0",
    "https://media1.thrillophilia.com/filestore/r15pwtxoy1kzphg1pypm67d8ukbn_1584363810_shutterstock_1579880878.jpg?w=753&h=450&dpr=2.0",
    "https://media1.thrillophilia.com/filestore/saouf1fde93p8rlu7spryjhdmbiu_47593339221_3a71d1c79b_o.jpg?w=753&h=450&dpr=2.0",
    "https://media1.thrillophilia.com/filestore/0ljj80n4fzrlsaoji0z4b6g3sk4j_1584363931_shutterstock_1318061237.jpg?w=753&h=450&dpr=2.0",
    "https://media1.thrillophilia.com/filestore/2kh7w0heba3j3t0xnqdxhlipszxc_shutterstock_1518284009.jpg?w=753&h=450&dpr=2.0",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [texts, setTexts] = useState({
    heading: "Welcome to Prayagraj",
    description:
      "Explore the holy city with our optimized Tourist Transport Planner.",
    button: "Start Exploring",
    ariaPrev: "Previous image",
    ariaNext: "Next image",
    footer: "© 2025 Prayagraj Tourist Transport Planner",
  });
  const [isTranslating, setIsTranslating] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const language = useSelector((state) => state.language.selectedLanguage);

  const translateText = async (text, targetLang) => {
    try {
      const res = await axios.get('http://localhost:5001/api/translate', {
        params: {
          q: text,
          targetLang: targetLang
        }
      });
      return res.data.translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };

  useEffect(() => {
    const doTranslation = async () => {
      if (language === "en") {
        setTexts({
          heading: "Welcome to Prayagraj",
          description:
            "Explore the holy city with our optimized Tourist Transport Planner.",
          button: "Start Exploring",
          ariaPrev: "Previous image",
          ariaNext: "Next image",
          footer: "© 2025 Prayagraj Tourist Transport Planner",
        });
      } else {
        setIsTranslating(true);
        const translatedHeading = await translateText(
          "Welcome to Prayagraj",
          language
        );
        const translatedDescription = await translateText(
          "Explore the holy city with our optimized Tourist Transport Planner.",
          language
        );
        const translatedButton = await translateText(
          "Start Exploring",
          language
        );
        const translatedAriaPrev = await translateText(
          "Previous image",
          language
        );
        const translatedAriaNext = await translateText("Next image", language);
        const translatedFooter = await translateText(
          "© 2025 Prayagraj Tourist Transport Planner",
          language
        );

        setTexts({
          heading: translatedHeading,
          description: translatedDescription,
          button: translatedButton,
          ariaPrev: translatedAriaPrev,
          ariaNext: translatedAriaNext,
          footer: translatedFooter,
        });
        setIsTranslating(false);
      }
    };
    doTranslation();
  }, [language]);

  useEffect(() => {
    images.forEach((image) => {
      const img = new Image();
      img.src = image;
    });
    const interval = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % images.length),
      5000
    );
    return () => clearInterval(interval);
  }, [images.length]);

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const goToPrev = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50 text-gray-800">
      <div className="absolute top-4 right-4 z-20">
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

      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          style={{ backgroundImage: `url('${image}')` }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60"></div>

      <div className="relative z-20 text-center px-4 max-w-md bg-white/95 backdrop-blur-sm rounded-xl shadow-md p-6 space-y-4 border border-emerald-200">
        <h1 className="text-2xl font-semibold text-emerald-700">
          {texts.heading}
        </h1>
        <p className="text-sm text-gray-600">{texts.description}</p>
        <button
          onClick={() => navigate("/packages")}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-full shadow-sm transition-transform transform hover:scale-105 border border-emerald-300"
        >
          {texts.button}
        </button>

        <div className="flex justify-center mt-4 space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex
                ? "bg-emerald-600 scale-110"
                : "bg-gray-400/50"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <button
        onClick={goToPrev}
        className="absolute left-4 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all duration-300 hidden md:block"
        aria-label={texts.ariaPrev}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all duration-300 hidden md:block"
        aria-label={texts.ariaNext}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <div className="absolute bottom-4 left-0 right-0 text-center text-gray-500 text-xs z-20">
        {texts.footer}
      </div>

      <Backdrop
        open={isTranslating}
        sx={{ color: "#fff", zIndex: 1200, flexDirection: "column", backdropFilter: "blur(5px)" }}
      >
        <CircularProgress color="inherit" />
        <Box mt={2}>
          <Typography variant="h6" sx={{ color: "#fff" }}>
            Translating content...
          </Typography>
        </Box>
      </Backdrop>
    </div>
  );
}

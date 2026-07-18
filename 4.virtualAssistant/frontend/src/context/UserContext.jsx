// src/context/UserContext.jsx
import axios from "axios";
import React, { createContext, useEffect, useState } from "react";

export const userDataContext = createContext();

function UserContext({ children }) {
  // ✅ Make sure this URL matches your backend (adjust port if needed)
  const serverUrl = "http://localhost:8000";

  const [userData, setUserData] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // ---------------- Get Current Logged-in User ----------------
  const handleCurrentUser = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true, // 🔥 Needed for cookies
      });
      if (res.data) {
        setUserData(res.data);
        console.log("✅ Current user:", res.data);
      }
    } catch (error) {
      console.log("❌ No active session:", error?.response?.data || error);
      setUserData(null);
    }
  };

  // ---------------- Gemini + Custom Commands ----------------
  const getGeminiResponse = async (command) => {
    const lowerCommand = command.toLowerCase();

    const commandMap = [
      { keywords: ["where am i", "current location"], type: "current-location", response: "Fetching your location..." },
      { keywords: ["google"], type: "google-search", response: `Searching Google for "${command}"...` },
      { keywords: ["calculator"], type: "calculator-open", response: "Opening calculator..." },
      { keywords: ["instagram"], type: "instagram-open", response: "Opening Instagram..." },
      { keywords: ["facebook"], type: "facebook-open", response: "Opening Facebook..." },
      { keywords: ["weather"], type: "weather-show", response: "Fetching weather updates..." },
      { keywords: ["youtube", "play"], type: "youtube-search", response: `Searching YouTube for "${command}"...` },
      { keywords: ["gmail"], type: "gmail-open", response: "Opening Gmail..." },
      { keywords: ["map"], type: "maps-open", response: "Opening Google Maps..." },
      { keywords: ["news"], type: "news-open", response: "Fetching latest news..." },
      { keywords: ["spotify"], type: "spotify-open", response: "Opening Spotify..." },
      { keywords: ["amazon"], type: "amazon-open", response: "Opening Amazon..." },
      { keywords: ["flipkart"], type: "flipkart-open", response: "Opening Flipkart..." },
      { keywords: ["wikipedia"], type: "wikipedia-search", response: `Searching Wikipedia for "${command}"...` },
      { keywords: ["translate"], type: "translate-open", response: "Opening Google Translate..." },
      { keywords: ["drive"], type: "drive-open", response: "Opening Google Drive..." },
      { keywords: ["calendar"], type: "calendar-open", response: "Opening Google Calendar..." },
      { keywords: ["hotstar"], type: "hotstar-open", response: "Opening Hotstar..." },
      { keywords: ["outlook"], type: "outlook-open", response: "Opening Outlook..." },
      { keywords: ["netflix"], type: "netflix-open", response: "Opening Netflix..." },
      { keywords: ["prime"], type: "prime-open", response: "Opening Prime Video..." },
      { keywords: ["myntra"], type: "myntra-open", response: "Opening Myntra..." },
      { keywords: ["docs"], type: "docs-open", response: "Opening Google Docs..." },
      { keywords: ["sheets"], type: "sheets-open", response: "Opening Google Sheets..." },
      { keywords: ["slides", "presentation"], type: "slides-open", response: "Opening Google Slides..." },
      { keywords: ["forms"], type: "forms-open", response: "Opening Google Forms..." },
      { keywords: ["pdf"], type: "pdf-open", response: "Opening PDF Editor..." },
      { keywords: ["photos"], type: "photos-open", response: "Opening Google Photos..." },
      { keywords: ["whatsapp"], type: "whatsapp-chat", response: "Opening WhatsApp..." },
      { keywords: ["times of india", "toi"], type: "timesofindia-open", response: "Opening Times of India..." },
      { keywords: ["github"], type: "github-open", response: "Opening GitHub..." },
      { keywords: ["chatgpt", "openai"], type: "chatgpt-open", response: "Opening ChatGPT..." },
      { keywords: ["linkedin"], type: "linkedin-open", response: "Opening LinkedIn..." },
      { keywords: ["twitter", "x"], type: "twitter-open", response: "Opening Twitter..." },
      { keywords: ["gemini", "google gemini"], type: "gemini-open", response: "Opening Google Gemini..." },
      
      // 🛍️ Shopping & Food
      { keywords: ["ajio"], type: "ajio-open", response: "Opening Ajio..." },
      { keywords: ["snapdeal"], type: "snapdeal-open", response: "Opening Snapdeal..." },
      { keywords: ["meesho"], type: "meesho-open", response: "Opening Meesho..." },
      { keywords: ["nykaa"], type: "nykaa-open", response: "Opening Nykaa..." },
      { keywords: ["zomato"], type: "zomato-open", response: "Opening Zomato..." },
      { keywords: ["swiggy"], type: "swiggy-open", response: "Opening Swiggy..." },
      { keywords: ["blinkit"], type: "blinkit-open", response: "Opening Blinkit..." },
      
      // 💰 Finance & Payment
      { keywords: ["paypal"], type: "paypal-open", response: "Opening PayPal..." },
      { keywords: ["phonepe", "phone pay"], type: "phonepe-open", response: "Opening PhonePe..." },
      { keywords: ["gpay", "google pay"], type: "gpay-open", response: "Opening Google Pay..." },

    ];

    for (let cmd of commandMap) {
      if (cmd.keywords.some((word) => lowerCommand.includes(word))) {
        return { type: cmd.type, userInput: command, response: cmd.response };
      }
    }

    // 🧠 Otherwise, send to backend (Gemini AI)
    try {
      const result = await axios.post(
        `${serverUrl}/api/user/asktoassistant`,
        { command },
        { withCredentials: true }
      );
      return result.data;
    } catch (error) {
      console.error("Gemini Error:", error);
      return {
        type: "error",
        userInput: command,
        response: "Something went wrong while processing your request.",
      };
    }
  };

  // ---------------- On Mount ----------------
  useEffect(() => {
    handleCurrentUser();
  }, []);

  const value = {
    serverUrl,
    userData,
    setUserData,
    backendImage,
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage,
    getGeminiResponse,
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
}

export default UserContext;

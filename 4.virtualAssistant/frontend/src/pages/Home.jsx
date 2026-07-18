import React, { useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPaperPlane } from "react-icons/fa";

function Home() {
  const {
    userData,
    serverUrl,
    setUserData,
    getGeminiResponse,
    frontendImage,
    selectedImage,
  } = useContext(userDataContext);

  const navigate = useNavigate();

  const [userText, setUserText] = useState("");
  const [listening, setListening] = useState(false);
  const [assistantStarted, setAssistantStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const synth = window.speechSynthesis;
  const chatEndRef = useRef(null);

  // ✅ Load chat history when component mounts
  useEffect(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setMessages(parsed);
      } catch (e) {
        console.error("❌ Error reading saved chat:", e);
      }
    }
  }, []);

  // ✅ Save chat history whenever it updates
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  // ✅ Auto scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      console.error(error);
      setUserData(null);
    }
  };

  const goToCustomizePage = () => navigate("/customize");

  // ✅ Clear chat history (both UI + localStorage)
  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem("chatHistory");
  };

  const startRecognition = () => {
    if (!isSpeakingRef.current) {
      try {
        recognitionRef.current?.start();
      } catch (error) {
        if (error.name !== "InvalidStateError") console.error("Start error:", error);
      }
    }
  };

  const speak = (text) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    const voices = synth.getVoices();
    const femaleVoice =
      voices.find((v) => v.name.toLowerCase().includes("female")) ||
      voices.find((v) => v.name.toLowerCase().includes("woman")) ||
      voices.find((v) => v.name.includes("Google UK English Female")) ||
      voices.find((v) => v.lang === "en-US");
    if (femaleVoice) utterance.voice = femaleVoice;

    isSpeakingRef.current = true;
    utterance.onend = () => {
      isSpeakingRef.current = false;
      setTimeout(() => startRecognition(), 500);
    };

    synth.cancel();
    synth.speak(utterance);
  };

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      const errorMsg = "⚠️ Geolocation is not supported by your browser.";
      setMessages((prev) => [...prev, { sender: "assistant", text: errorMsg }]);
      speak(errorMsg);
      return;
    }

    setMessages((prev) => [...prev, { sender: "assistant", text: "📍 Detecting your current location..." }]);
    speak("Detecting your current location...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const location = data.display_name || "Unable to find exact address.";
          const msg = `📍 Your current location is: ${location}`;
          setMessages((prev) => [...prev, { sender: "assistant", text: msg }]);
          speak(`Your current location is ${location}`);

          const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          window.open(mapsUrl, "_blank");
        } catch (err) {
          const msg = "⚠️ Unable to fetch location details.";
          setMessages((prev) => [...prev, { sender: "assistant", text: msg }]);
          speak(msg);
        }
      },
      () => {
        const msg = "⚠️ Location access denied. Please enable it in browser settings.";
        setMessages((prev) => [...prev, { sender: "assistant", text: msg }]);
        speak(msg);
      }
    );
  };

  const handleCommand = async (data) => {
    if (!data) return;
    const { type, userInput, response } = data;

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "assistant", text: response }]);
      speak(response);
    }, 500);

    const urlMap = {
      "google-search": `https://www.google.com/search?q=${encodeURIComponent(userInput)}`,
      "calculator-open": "https://www.google.com/search?q=calculator",
      "instagram-open": "https://www.instagram.com/",
      "Facebook-open": "https://www.facebook.com/",
      "weather-show": "https://www.google.com/search?q=weather",
      "youtube-search": `https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`,
      "youtube-play": `https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`,
      "gmail-open": "https://mail.google.com/",
      "maps-open": "https://www.google.com/maps",
      "news-open": "https://news.google.com/",
      "spotify-open": "https://open.spotify.com/",
      "amazon-open": "https://www.amazon.in/",
      "flipkart-open": "https://www.flipkart.com/",
      "wikipedia-search": `https://en.wikipedia.org/wiki/${encodeURIComponent(userInput || "")}`,
      "translate-open": "https://translate.google.com/",
      "drive-open": "https://drive.google.com/",
      "calendar-open": "https://calendar.google.com/",
      "hotstar-open": "https://www.hotstar.com/in",
      "outlook-open": "https://outlook.live.com/",
      "netflix-open": "https://www.netflix.com/in/",
      "prime-open": "https://www.primevideo.com/",
      "myntra-open": "https://www.myntra.com/",
      "docs-open": "https://docs.google.com/document/u/0/",
      "sheets-open": "https://docs.google.com/spreadsheets/u/0/",
      "slides-open": "https://docs.google.com/presentation/u/0/",
      "forms-open": "https://docs.google.com/forms/u/0/",
      "pdf-open": "https://www.adobe.com/acrobat/online/pdf-editor.html",
      "photos-open": "https://photos.google.com/",
      "whatsapp-chat": `https://wa.me/919876543210?text=${encodeURIComponent(userInput)}`,
      "timesofindia-open": "https://timesofindia.indiatimes.com/",
      "github-open": "https://github.com/",
      "chatgpt-open": "https://chat.openai.com/",
      "linkedin-open": "https://www.linkedin.com/",
      "twitter-open": "https://twitter.com/",
      "gemini-open": "https://gemini.google.com/",
      "ajio-open": "https://www.ajio.com/",
      "snapdeal-open": "https://www.snapdeal.com/",
      "meesho-open": "https://www.meesho.com/",
      "nykaa-open": "https://www.nykaa.com/",
      "zomato-open": "https://www.zomato.com/",
      "swiggy-open": "https://www.swiggy.com/",
      "blinkit-open": "https://blinkit.com/",
      "paypal-open": "https://www.paypal.com/",
      "phonepe-open": "https://www.phonepe.com/",
      "gpay-open": "https://pay.google.com/",
      "gesture-click": "http://localhost:5001/gesture",
      "gesture-left": "http://localhost:5001/gesture",
      "gesture-right": "http://localhost:5001/gesture",
      "gesture-up": "http://localhost:5001/gesture",
      "gesture-down": "http://localhost:5001/gesture",
    };

    if (type.startsWith("gesture-")) {
      const command = type.split("gesture-")[1];
      fetch("http://localhost:5001/gesture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      })
        .then(() => console.log(`✅ Gesture ${command} executed`))
        .catch((err) => console.error("❌ Gesture error:", err));
    } else if (type === "location-detect" || userInput.toLowerCase().includes("location")) {
      const locationMatch = userInput.match(/(?:of|in|at)\s+([a-zA-Z\s]+)/i);
      if (locationMatch) {
        const place = locationMatch[1].trim();
        const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(place)}`;
        setMessages((prev) => [
          ...prev,
          { sender: "assistant", text: `📍 Opening location of ${place} in Google Maps...` },
        ]);
        speak(`Opening location of ${place} in Google Maps`);
        window.open(mapsUrl, "_blank");
      } else {
        detectLocation();
      }
    } else if (urlMap[type]) {
      window.open(urlMap[type], "_blank");
    }
  };

  const handleTypedCommand = async () => {
    if (!userText.trim()) return;
    const typedInput = userText.trim();
    setMessages((prev) => [...prev, { sender: "user", text: typedInput }]);
    setUserText("");

    try {
      const data = await getGeminiResponse(typedInput);
      handleCommand(data);
    } catch {
      setMessages((prev) => [...prev, { sender: "assistant", text: "⚠️ Something went wrong!" }]);
    }
  };

  // ✅ Voice Assistant setup
  useEffect(() => {
    if (!assistantStarted) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);
      if (!isSpeakingRef.current) setTimeout(() => startRecognition(), 500);
    };
    recognition.onerror = () => setListening(false);

    recognition.onresult = async (e) => {
      const transcript = e.results[0][0].transcript.trim();
      setMessages((prev) => [...prev, { sender: "user", text: transcript }]);
      recognition.stop();
      try {
        const data = await getGeminiResponse(transcript);
        handleCommand(data);
      } catch {
        setMessages((prev) => [...prev, { sender: "assistant", text: "⚠️ Something went wrong!" }]);
      }
    };

    startRecognition();
    return () => recognition.stop();
  }, [assistantStarted]);

  const backgroundImage =
    selectedImage === "input"
      ? frontendImage
      : userData?.assistantImage ||
        "radial-gradient(circle at 30% 20%, #ff336622 0%, transparent 40%), radial-gradient(circle at 70% 80%, #ff00ff33 0%, transparent 40%)";

  return (
    <div
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden p-4 text-white transition-all duration-700"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] -z-10 transition-all duration-700" />

      {/* 🔹 Top Buttons */}
      <div className="absolute top-5 right-5 flex flex-col gap-3 items-end">
        <button
          onClick={handleLogOut}
          className="bg-gradient-to-r from-[#ff0044] via-[#ff0099] to-[#ff3300] text-white px-5 py-2 rounded-full
           shadow-[0_0_50px_#ff0077,0_0_90px_#ff3300] hover:scale-110 transition-all font-semibold animate-pulse"
        >
          Logout
        </button>

        <button
          onClick={goToCustomizePage}
          className="bg-gradient-to-r from-[#ff3300] via-[#ff0066] to-[#ff00ff] text-white px-5 py-2 rounded-full
           shadow-[0_0_60px_#ff0077,0_0_100px_#ff3300] hover:scale-110 transition-all font-semibold animate-pulse"
        >
          Customize your Assistant
        </button>

        <button
          onClick={clearChatHistory}
          className="bg-gradient-to-r from-[#ff0099] via-[#ff3366] to-[#ff6600] text-white px-5 py-2 rounded-full
           shadow-[0_0_60px_#ff3366,0_0_100px_#ff6600] hover:scale-110 transition-all font-semibold animate-pulse"
        >
          Clear Chat History
        </button>
      </div>

      {/* 💬 Chat Section */}
      <div className="relative z-10 w-full max-w-[700px] h-[70vh] bg-[#1a001a88] backdrop-blur-2xl rounded-3xl border border-[#ff007788]
       shadow-[0_0_100px_#ff005588,0_0_140px_#ff00ff66,inset_0_0_60px_#ff336622] overflow-y-auto p-6 transition-all duration-500">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-3 my-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "assistant" && (
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full shadow-[0_0_30px_#ffcc00aa] animate-pulse">
                🤖
              </div>
            )}
            <div
              className={`px-5 py-3 text-sm md:text-base rounded-2xl max-w-xs font-medium ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-purple-500 to-purple-700 rounded-br-none shadow-[0_0_25px_#a020f0] text-white"
                  : "bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-bl-none shadow-[0_0_25px_#ffd700] text-black"
              } animate-bubblePop`}
            >
              {msg.text}
            </div>
            {msg.sender === "user" && (
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-800 rounded-full shadow-[0_0_40px_#a020f0] animate-pulse">
                👤
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* 📝 Input */}
      <div className="relative w-full max-w-[700px] flex items-center mt-4 z-10">
        <input
          type="text"
          placeholder="Type your message..."
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTypedCommand()}
          className="flex-1 h-[55px] px-5 pr-14 bg-black/40 backdrop-blur-xl text-white text-lg border border-[#ff009999]
           rounded-full outline-none placeholder-[#ff009999] shadow-[0_0_50px_#ff00aa66,inset_0_0_20px_#ff009922]
           focus:shadow-[0_0_100px_#ff00aa,0_0_140px_#ff3366] transition-all duration-300"
        />
        <button
          onClick={handleTypedCommand}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#ff00ff] to-[#ff3300] p-3 rounded-full
           shadow-[0_0_40px_#ff0077,0_0_80px_#ff3300] hover:scale-110 transition-transform duration-300"
        >
          <FaPaperPlane size={20} />
        </button>
      </div>

      {!assistantStarted && (
        <button
          className="mt-6 min-w-[220px] h-[60px] bg-gradient-to-r from-[#ff00aa] via-[#ff3366] to-[#ff3300] text-white text-lg font-bold rounded-full
           shadow-[0_0_90px_#ff00ff,0_0_140px_#ff3366] hover:scale-110 transition-all duration-300 animate-pulse"
          onClick={() => {
            setAssistantStarted(true);
            speak(`Hello ${userData?.name || "there"}, what can I help you with?`);
          }}
        >
          🤖 Start Assistant
        </button>
      )}

      <p className={`mt-3 text-sm font-semibold ${listening ? "text-[#ff00cc] animate-pulse" : "text-gray-400"}`}>
        {listening ? "🎤 Listening..." : "🔇 Not listening"}
      </p>
    </div>
  );
}

export default Home;



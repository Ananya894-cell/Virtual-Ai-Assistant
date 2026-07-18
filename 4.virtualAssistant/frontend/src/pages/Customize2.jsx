import React, { useContext, useState } from "react";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function Customize2() {
  const { userData, backendImage, selectedImage, serverUrl, setUserData } =
    useContext(userDataContext);
  const [assistantName, setAssistantName] = useState(
    userData?.AssistantName || ""
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdateAssistant = async () => {
    setLoading(true);
    try {
      let formData = new FormData();
      formData.append("assistantName", assistantName);

      if (backendImage) {
        formData.append("assistantImage", backendImage);
      } else {
        formData.append("imageUrl", selectedImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/user/update`,
        formData,
        { withCredentials: true }
      );
      setLoading(false);
      setUserData(result.data);
      navigate("/");
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <div className="relative w-full h-[100vh] flex flex-col justify-center items-center overflow-hidden bg-[#000005]">
      {/* 🌈 Dynamic Neon Background */}
      <div className="absolute inset-0 -z-10 bg-[#000008]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_#00ffff22,transparent_60%),radial-gradient(circle_at_bottom_right,_#ff00ff22,transparent_60%)]" />
      <div className="absolute top-[10%] left-[5%] w-[350px] h-[350px] bg-[#00ffff33] blur-[200px] rounded-full animate-pulse" />
      <div className="absolute bottom-[15%] right-[10%] w-[450px] h-[450px] bg-[#ff00ff44] blur-[230px] rounded-full animate-ping" />
      <div className="absolute top-[60%] left-[50%] w-[200px] h-[200px] bg-[#0077ff33] blur-[150px] rounded-full animate-bounce" />
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(90deg,#00ffff22_1px,transparent_1px),linear-gradient(0deg,#ff00ff22_1px,transparent_1px)] bg-[length:80px_80px]" />

      {/* 🔙 Back Button */}
      <MdKeyboardBackspace
        className="absolute top-6 left-6 text-white cursor-pointer w-10 h-10 
        hover:text-[#00ffff] hover:scale-125 transition-all duration-300 
        drop-shadow-[0_0_20px_#00ffff]"
        onClick={() => navigate("/customize")}
      />

      {/* ✨ Title */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-[50px]
      text-transparent bg-clip-text bg-gradient-to-r from-[#00ffff] via-[#ff00ff] to-[#0077ff]
      drop-shadow-[0_0_30px_#00ffff] tracking-wider animate-[pulse_3s_ease-in-out_infinite]">
        Enter Your <span className="text-white">Assistant Name</span>
      </h1>

      {/* 💫 Glowing Input Field */}
      <div className="relative">
        <input
          type="text"
          placeholder="e.g. Shifra"
          className="w-[650px] h-[70px] outline-none border-2 border-[#00ffff66]
          bg-[#03031a] text-white placeholder-gray-400 px-[25px] rounded-full text-[22px] tracking-wide
          shadow-[0_0_40px_#00ffff33,0_0_80px_#ff00ff22]
          focus:shadow-[0_0_60px_#00ffffaa,0_0_120px_#ff00ff88]
          focus:border-[#00ffffaa] transition-all duration-300 animate-[pulse_3s_ease-in-out_infinite]"
          required
          onChange={(e) => setAssistantName(e.target.value)}
          value={assistantName}
        />
        <div className="absolute inset-0 rounded-full blur-[40px] bg-gradient-to-r from-[#00ffff55] via-[#ff00ff33] to-[#0077ff55] opacity-60 animate-[spin_6s_linear_infinite]" />
      </div>

      {/* 🚀 Animated Finalize Button */}
      {assistantName && (
        <button
          className="relative min-w-[360px] h-[80px] mt-[70px] 
          bg-gradient-to-r from-[#00ffff] via-[#ff00ff] to-[#0077ff]
          text-black font-extrabold text-[22px] rounded-full tracking-wide overflow-hidden
          shadow-[0_0_60px_#00ffffaa,0_0_100px_#ff00ff88]
          hover:shadow-[0_0_90px_#00ffffcc,0_0_150px_#ff00ffbb]
          hover:scale-110 transition-all duration-300 animate-[pulse_2.5s_ease-in-out_infinite]"
          disabled={loading}
          onClick={handleUpdateAssistant}
        >
          {/* 🌟 Moving inner shine effect */}
          <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.25),transparent)] animate-[shine_3s_linear_infinite]" />
          {/* 🌀 Soft glow border */}
          <span className="absolute inset-0 rounded-full blur-[25px] bg-gradient-to-r from-[#00ffff88] via-[#ff00ff66] to-[#0077ff88]" />
          {/* Button text */}
          <span className="relative z-10 text-[#000000dd] drop-shadow-[0_0_10px_#ffffffaa]">
            {!loading ? "⚡ Finalize Your Assistant" : "⚙️ Creating..."}
          </span>
        </button>
      )}

      {/* 🌠 Outer Neon Border */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-[#00ffff33] 
      shadow-[0_0_100px_#00ffff88,0_0_150px_#ff00ff77] mix-blend-overlay" />
    </div>
  );
}

export default Customize2;




import React, { useContext, useRef } from "react";
import Card from "../components/Card";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/authBg.png";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";
import image6 from "../assets/image6.jpeg";
import image7 from "../assets/image7.jpeg";
import { RiImageAddLine } from "react-icons/ri";
import { MdKeyboardBackspace } from "react-icons/md";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Customize() {
  const {
    setBackendImage,
    setFrontendImage,
    frontendImage,
    selectedImage,
    setSelectedImage,
  } = useContext(userDataContext);

  const navigate = useNavigate();
  const inputImage = useRef();

  // Handle custom image upload
  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFrontendImage(URL.createObjectURL(file));
      setSelectedImage("input");
      setBackendImage(file);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await axios.post("http://localhost:5000/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        console.log("✅ Image uploaded successfully:", res.data);
      } catch (error) {
        console.error("❌ Image upload failed:", error);
      }
    }
  };

  return (
    <div className="relative w-full h-[100vh] flex justify-center items-center flex-col p-6 overflow-hidden bg-[#01010b]">
      {/* 🌌 Deep Dark Neon Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#000000] via-[#02021a] to-[#000212]" />
        <div className="absolute top-[10%] left-[5%] w-[350px] h-[350px] bg-[#00ffff22] blur-[180px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[450px] h-[450px] bg-[#ff00ff22] blur-[200px] rounded-full animate-ping" />
        <div className="absolute top-[60%] left-[50%] w-[180px] h-[180px] bg-[#0088ff33] blur-[130px] rounded-full animate-bounce" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(90deg,#00ffff33_1px,transparent_1px),linear-gradient(0deg,#ff00ff33_1px,transparent_1px)] bg-[length:70px_70px]" />
      </div>

      {/* 🔙 Back Button */}
      <MdKeyboardBackspace
        className="absolute top-6 left-6 text-white cursor-pointer w-10 h-10 hover:text-[#00ffff] hover:scale-125 transition-all duration-300 drop-shadow-[0_0_15px_#00ffff]"
        onClick={() => navigate("/")}
      />

      {/* ✨ Title */}
      <h1 className="mb-10 text-4xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#00ffff] via-[#00bfff] to-[#ff00ff] drop-shadow-[0_0_25px_#00ffff] tracking-wider animate-pulse">
        Choose Your <span className="text-white">Assistant Image</span>
      </h1>

      {/* 💠 Image Selection Grid */}
      <div className="w-full max-w-[1100px] flex justify-center items-center flex-wrap gap-6 px-4 py-6
                      bg-[#050519aa] backdrop-blur-lg rounded-2xl border border-[#00ffff44]
                      shadow-[0_0_50px_rgba(0,255,255,0.15),0_0_90px_rgba(255,0,255,0.12)]">
        {[image1, image2, image3, image4, image5, image6, image7].map(
          (img, i) => (
            <div
              key={i}
              className="transition-all duration-300 hover:scale-110 hover:rotate-[2deg]"
            >
              <Card image={img} />
            </div>
          )
        )}

        {/* 📸 Upload Image Card */}
        <div
          className={`w-[90px] h-[150px] lg:w-[180px] lg:h-[270px]
            bg-[#050522] border-2 rounded-2xl overflow-hidden cursor-pointer
            flex items-center justify-center backdrop-blur-lg transition-all duration-300
            ${
              selectedImage === "input"
                ? "border-4 border-[#00ffff] shadow-[0_0_40px_#00ffff,0_0_60px_#ff00ff]"
                : "border-[#00ffff55] hover:border-[#00ffff] hover:shadow-[0_0_30px_#00ffff,0_0_40px_#ff00ff]"
            }`}
          onClick={() => inputImage.current.click()}
        >
          {!frontendImage ? (
            <RiImageAddLine className="text-white w-[45px] h-[45px] opacity-90 drop-shadow-[0_0_15px_#00ffff]" />
          ) : (
            <img
              src={frontendImage}
              alt="Uploaded preview"
              className="w-full h-full object-cover rounded-2xl shadow-[0_0_30px_#00ffff88]"
            />
          )}
        </div>

        {/* Hidden Input */}
        <input
          type="file"
          accept="image/*"
          ref={inputImage}
          hidden
          onChange={handleImage}
        />
      </div>

      {/* 🚀 Next Button */}
      {selectedImage && (
        <button
          className="min-w-[220px] h-[60px] mt-[50px] bg-gradient-to-r from-[#00ffff] via-[#0088ff] to-[#ff00ff]
          text-black font-extrabold rounded-full text-[20px] tracking-wide
          shadow-[0_0_40px_#00ffff,0_0_70px_#ff00ff]
          hover:shadow-[0_0_60px_#00ffff,0_0_100px_#ff00ff]
          hover:scale-110 transition-all duration-300 animate-pulse"
          onClick={() => navigate("/customize2")}
        >
          Next →
        </button>
      )}

      {/* 💫 Neon Border Glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-[#00ffff33] shadow-[0_0_60px_#00ffff,0_0_90px_#ff00ff] mix-blend-overlay"></div>
    </div>
  );
}

export default Customize;



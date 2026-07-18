// src/components/SignUp.jsx
import React, { useContext, useState, useEffect } from "react";
import bg from "../assets/authBg.png";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import robotAnimation from "../assets/RobotSaludando.json";

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const { serverUrl, setUserData } = useContext(userDataContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);

  // 🕒 Show robot first, then show form after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowForm(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { name, email, password },
        { withCredentials: true }
      );
      setUserData(res.data);
      setLoading(false);
      navigate("/signin");
    } catch (error) {
      console.error("SignUp Error:", error);
      setUserData(null);
      setLoading(false);
      setErr(
        error.response?.data?.message ||
          (error.response?.status >= 500
            ? "Server Error"
            : "Something went wrong")
      );
    }
  };

  return (
    <div
      className="relative w-full h-screen flex justify-center items-center bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* ✨ Neon Glow Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,200,0.2)_0%,rgba(255,0,255,0.15)_35%,rgba(0,0,0,0.9)_90%)] animate-pulse"></div>

      {/* 🤖 Robot Entrance Before Form */}
      {!showForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 50 }}
          animate={{ opacity: 1, scale: 1.2, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="z-20 flex flex-col items-center"
        >
          <Lottie
            animationData={robotAnimation}
            loop={false}
            className="w-[400px] h-[400px] md:w-[480px] md:h-[480px]"
          />
          <motion.h2
            className="text-white text-2xl mt-3 font-semibold text-center"
            animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -20] }}
            transition={{ duration: 3 }}
          >
            👋 Hello! Welcome to our world!
          </motion.h2>
        </motion.div>
      )}

      {/* 💎 Sign Up Form Appears After Robot */}
      {showForm && (
        <motion.form
          onSubmit={handleSignUp}
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 w-[90%] max-w-[500px] h-[600px]
            bg-[#050505cc] backdrop-blur-2xl
            border border-[#00ffc3]
            rounded-3xl p-[35px]
            flex flex-col items-center justify-center gap-[20px]
            shadow-[0_0_40px_#00ffc3,0_0_90px_#ff00ff]"
        >
          {/* 🪩 Title */}
          <motion.h1
            animate={{
              textShadow: [
                "0 0 15px #00ffc3",
                "0 0 25px #ff00ff",
                "0 0 15px #00ffc3",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white text-[32px] font-bold text-center mb-[15px]"
          >
            Create Your <span className="text-[#00ffc3]">Account</span>
          </motion.h1>

          {/* 🧍 Name Input */}
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full h-[55px] border-2 border-[#00ffc3]
            bg-transparent text-white placeholder-gray-400
            px-[20px] rounded-full text-[18px]
            focus:ring-2 focus:ring-[#00ffc3] outline-none
            shadow-[0_0_15px_#00ffc3] transition-all duration-300"
          />

          {/* 📧 Email Input */}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-[55px] border-2 border-[#00ffc3]
            bg-transparent text-white placeholder-gray-400
            px-[20px] rounded-full text-[18px]
            focus:ring-2 focus:ring-[#00ffc3] outline-none
            shadow-[0_0_15px_#00ffc3] transition-all duration-300"
          />

          {/* 🔒 Password Input */}
          <div
            className="w-full h-[55px] border-2 border-[#00ffc3]
            bg-transparent text-white rounded-full text-[18px] relative
            flex items-center transition duration-300
            focus-within:ring-2 focus-within:ring-[#00ffc3]
            shadow-[0_0_15px_#00ffc3]"
          >
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-full bg-transparent text-white placeholder-gray-400 px-[20px] rounded-full outline-none"
            />
            {showPassword ? (
              <IoEyeOff
                onClick={() => setShowPassword(false)}
                className="absolute right-[20px] text-[#00ffc3] w-[24px] h-[24px] cursor-pointer hover:scale-110 transition"
              />
            ) : (
              <IoEye
                onClick={() => setShowPassword(true)}
                className="absolute right-[20px] text-[#00ffc3] w-[24px] h-[24px] cursor-pointer hover:scale-110 transition"
              />
            )}
          </div>

          {/* ⚠️ Error Message */}
          {err && (
            <p className="text-red-400 text-[15px] font-medium tracking-wide">
              *{err}
            </p>
          )}

          {/* 🚀 Sign Up Button */}
          <motion.button
            whileHover={{
              scale: 1.07,
              boxShadow: "0 0 35px #00ffc3, 0 0 60px #ff00ff",
            }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className="w-[180px] h-[55px] mt-[10px]
            bg-gradient-to-r from-[#00ffc3] via-[#00ffe6] to-[#ff00ff]
            text-black font-semibold rounded-full text-[18px]
            shadow-[0_0_25px_#00ffc3,0_0_60px_#ff00ff]
            transition-all duration-300"
          >
            {loading ? "Creating..." : "Sign Up"}
          </motion.button>

          {/* 🔁 Redirect to Sign In */}
          <p className="text-gray-300 text-[16px] mt-[10px]">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/signin")}
              className="text-[#00ffc3] hover:underline cursor-pointer"
            >
              Sign In
            </span>
          </p>
        </motion.form>
      )}
    </div>
  );
}

export default SignUp;



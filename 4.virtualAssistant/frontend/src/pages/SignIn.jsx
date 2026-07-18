import React, { useContext, useState } from "react";
import bg from "../assets/authBg.png";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
import { motion } from "framer-motion";

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const { serverUrl, setUserData } = useContext(userDataContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ✅ Handle Login
  const handleSignIn = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    if (!serverUrl) {
      setErr("⚠️ Server URL not configured.");
      setLoading(false);
      return;
    }

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/login`, // ✅ Correct backend route
        { email, password },
        { withCredentials: true }
      );

      if (result.data) {
        setUserData(result.data);
        navigate("/");
      } else {
        setErr("Invalid login credentials. Please try again.");
      }
    } catch (error) {
      console.error("SignIn Error:", error);
      if (error.response?.status === 404)
        setErr("User not found. Please sign up first.");
      else if (error.response?.status === 400)
        setErr("Invalid email or password.");
      else if (error.response?.status >= 500)
        setErr("Server error. Please try again later.");
      else setErr("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative w-full h-screen flex justify-center items-center bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* 🌌 Neon Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,200,0.25)_0%,rgba(255,0,255,0.15)_35%,rgba(0,0,0,0.9)_90%)] animate-pulse"></div>

      {/* 💫 Floating Glow Orbs */}
      <div className="absolute w-6 h-6 bg-[#00ffc3] blur-[12px] top-[20%] left-[10%] rounded-full animate-ping"></div>
      <div className="absolute w-5 h-5 bg-[#ff00ff] blur-[10px] bottom-[20%] right-[15%] rounded-full animate-bounce"></div>
      <div className="absolute w-4 h-4 bg-[#00ffe6] blur-[8px] bottom-[35%] left-[20%] rounded-full animate-pulse"></div>

      {/* 💎 Sign-In Form */}
      <motion.form
        onSubmit={handleSignIn}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-[90%] max-w-[480px] h-[560px]
          bg-[#050505e0] backdrop-blur-2xl
          border border-[#00ffc3]
          rounded-3xl p-[35px]
          flex flex-col items-center justify-center gap-[22px]
          shadow-[0_0_50px_#00ffc3,0_0_80px_#ff00ff]"
      >
        {/* 🪄 Header */}
        <motion.h1
          animate={{
            textShadow: [
              "0 0 15px #00ffc3",
              "0 0 25px #ff00ff",
              "0 0 15px #00ffc3",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white text-[34px] font-bold mb-[5px] text-center"
        >
          Sign In to <span className="text-[#00ffc3]">Virtual Assistant</span>
        </motion.h1>

        <p className="text-gray-300 text-[15px] italic text-center mb-[10px]">
          Welcome back! Let's make things happen ⚡
        </p>

        {/* ✉️ Email Input */}
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full h-[55px] border-2 border-[#00ffc3]
            bg-transparent text-white placeholder-gray-400
            px-[20px] rounded-full text-[18px]
            focus:ring-2 focus:ring-[#00ffc3] focus:outline-none
            shadow-[0_0_15px_#00ffc3] transition duration-300"
          required
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />

        {/* 🔒 Password Input */}
        <div
          className="w-full h-[55px] border-2 border-[#00ffc3]
            bg-transparent text-white rounded-full text-[18px] relative
            flex items-center focus-within:ring-2 focus-within:ring-[#00ffc3]
            shadow-[0_0_15px_#00ffc3] transition duration-300"
        >
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="w-full h-full bg-transparent outline-none placeholder-gray-400 px-[20px]"
            required
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          {showPassword ? (
            <IoEyeOff
              className="absolute right-[20px] text-[#00ffc3] text-[24px] cursor-pointer hover:scale-110 transition"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <IoEye
              className="absolute right-[20px] text-[#00ffc3] text-[24px] cursor-pointer hover:scale-110 transition"
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>

        {/* ⚠️ Error Message */}
        {err && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-[16px] font-medium text-center mt-[-10px]"
          >
            *{err}
          </motion.p>
        )}

        {/* 🚀 Submit Button */}
        <motion.button
          whileHover={{
            scale: 1.08,
            boxShadow: "0 0 35px #00ffc3, 0 0 60px #ff00ff",
          }}
          whileTap={{ scale: 0.95 }}
          className="min-w-[170px] h-[55px] mt-[20px]
            text-black font-semibold bg-gradient-to-r
            from-[#00ffc3] via-[#00ffe6] to-[#ff00ff]
            rounded-full text-[18px]
            shadow-[0_0_25px_#00ffc3,0_0_50px_#ff00ff]
            transition-all duration-300"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </motion.button>

        {/* 🔁 Redirect */}
        <p className="text-gray-300 text-[16px] mt-[10px] text-center">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-[#00ffc3] hover:underline cursor-pointer"
          >
            Sign Up
          </span>
        </p>
      </motion.form>
    </div>
  );
}

export default SignIn;

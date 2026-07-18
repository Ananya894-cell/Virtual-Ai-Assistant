import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import User from "../models/user.model.js";
import moment from "moment";

// ✅ Get Current User
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return res.status(500).json({ message: "get current user error" });
  }
};

// ✅ Update Assistant
export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;
    let assistantImage;

    if (req.file) {
      // Upload file to Cloudinary
      const uploaded = await uploadOnCloudinary(req.file.path);
      assistantImage = uploaded?.url || uploaded?.secure_url;
    } else {
      assistantImage = imageUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in updateAssistant:", error);
    return res.status(500).json({ message: "updateAssistant error" });
  }
};

// ✅ Ask Assistant
export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ response: "User not found" });

    // Save command history
    user.history.push(command);
    await user.save();

    const result = await geminiResponse(command, user.assistantName, user.name);

    if (!result) {
      return res.status(500).json({ response: "Assistant is unavailable now." });
    }

    // Safely extract JSON from API response
    const jsonMatch = result.match(/{[\s\S]*}/);
    if (!jsonMatch) return res.status(400).json({ response: "Couldn't understand command." });

    const gemResult = JSON.parse(jsonMatch[0]);
    const type = gemResult.type || "general";

    // Handle common types
    switch (type) {
      case "get-date":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current date is ${moment().format("YYYY-MM-DD")}`,
        });

      case "get-time":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current time is ${moment().format("hh:mm A")}`,
        });

      case "get-day":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Today is ${moment().format("dddd")}`,
        });

      case "get-month":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `This month is ${moment().format("MMMM")}`,
        });

      // Other commands
      case "google-search":
      case "youtube-search":
      case "youtube-play":
      case "general":
      case "calculator-open":
      case "instagram-open":
      case "facebook-open":
      case "weather-show":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: gemResult.response || "Here is the response.",
        });

      default:
        return res.status(400).json({ response: "I didn't understand that command." });
    }
  } catch (error) {
    console.error("Error in askToAssistant:", error);
    return res.status(500).json({ response: "ask assistant error" });
  }
};

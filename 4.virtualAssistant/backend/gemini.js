import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiUrl = process.env.GEMINI_API_URL;

    if (!apiUrl) {
      throw new Error("GEMINI_API_URL is missing in .env file");
    }

    console.log("API URL:", apiUrl);

    const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}. 
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month" | "calculator-open" | "instagram-open" | "facebook-open" | "weather-show",

  "userInput": "<original user input>" {only remove your name from userInput if it exists. If the user asks to search something on Google or YouTube, userInput should contain only the search text},

  "response": "<a short spoken response to read out loud to the user>"
}

Instructions:
- "type": determine the intent of the user.
- "userInput": original sentence spoken by the user.
- "response": a short voice-friendly reply.

Type meanings:
- "general": factual or informational question.
- "google-search": user wants to search on Google.
- "youtube-search": user wants to search on YouTube.
- "youtube-play": user wants to play a video/song.
- "calculator-open": user wants to open calculator.
- "instagram-open": user wants to open Instagram.
- "facebook-open": user wants to open Facebook.
- "weather-show": user wants weather information.
- "get-time": current time.
- "get-date": today's date.
- "get-day": current day.
- "get-month": current month.

Important:
- Use ${userName} if someone asks who created you.
- Only respond with the JSON object, nothing else.

Now your userInput: ${command}
`;

    const result = await axios.post(
      apiUrl,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (
      result?.data?.candidates &&
      result.data.candidates.length > 0
    ) {
      return result.data.candidates[0].content.parts[0].text;
    }

    return JSON.stringify({
      type: "general",
      userInput: command,
      response: "Sorry, I could not generate a response.",
    });
  } catch (error) {
    console.log("Gemini Error:");

    if (error.response) {
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    return JSON.stringify({
      type: "general",
      userInput: command,
      response: "Something went wrong while processing your request.",
    });
  }
};

export default geminiResponse;
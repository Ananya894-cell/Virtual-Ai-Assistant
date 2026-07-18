import React, { useEffect, useRef } from "react";

function ChatMessage({ message, sender }) {
  const messageRef = useRef(null);

  // Smooth scroll into view when new message comes
  useEffect(() => {
    messageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const isUser = sender === "user";

  return (
    <div
      ref={messageRef}
      className={`flex items-start gap-2 my-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-9 h-9 flex items-center justify-center bg-red-500/80 text-white rounded-full shadow-md">
          🤖
        </div>
      )}

      {/* Chat Bubble */}
      <div
        className={`px-4 py-2 rounded-2xl max-w-xs text-sm md:text-base transition-all duration-300 
          ${
            isUser
              ? "bg-green-500/70 backdrop-blur-md text-white rounded-br-none shadow-lg"
              : "bg-red-500/70 backdrop-blur-md text-white rounded-bl-none shadow-lg"
          }`}
      >
        {message}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-9 h-9 flex items-center justify-center bg-green-400 text-white rounded-full shadow-md">
          👤
        </div>
      )}
    </div>
  );
}

export default ChatMessage;

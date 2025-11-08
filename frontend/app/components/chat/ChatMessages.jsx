import React from "react";

export default function MessageBubble({ sender, text }) {
    const isUser = sender === "user";
    return (
        <div
      className={`max-w-[90%] ${
        isUser ? "self-end text-right" : "self-start text-left"
      }`}
    >
      <div
        className={`inline-block px-4 py-2 rounded-2xl ${
          isUser ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
import { useState } from "react";
import { sendToMCP } from "@/services/mcpService";

export function useChat() {
  const [messages, setMessages] = useState([
    { sender: "system", text: "Hi! I’m Jigsaw. Describe your circuit board to get started." },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Simulated "thinking" step
    const thinkingMsg = { sender: "system", text: `🤖 Thinking: "User wants to ${text.toLowerCase()}..."` };
    setMessages((prev) => [...prev, thinkingMsg]);

    try {
      const response = await sendToMCP(text, messages);
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      console.error("MCP error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "system", text: "⚠️ There was an issue connecting to MCP." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOption = async (option) => {
    const userMsg = { sender: "user", text: option };
    setMessages((prev) => [...prev, userMsg]);
    await sendMessage(option);
  };

  return { messages, loading, sendMessage, handleOption };
}

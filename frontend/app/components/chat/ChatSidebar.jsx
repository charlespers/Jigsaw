import React from "react";
import { Card } from "@/components/ui/card";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { useChat } from "@/hooks/useChat";

export default function ChatSidebar() {
  const { messages, loading, sendMessage, handleOption } = useChat();

  return (
    <div className="fixed left-0 top-0 h-full w-[28.5%] bg-gray-950 text-gray-100 flex flex-col border-r border-gray-800 shadow-xl">
      <div className="p-4 border-b border-gray-800 text-2xl font-bold tracking-tight">
        Jigsaw Chat
      </div>

      <Card className="flex-1 bg-gray-950 border-none rounded-none">
        <ChatMessages messages={messages} loading={loading} onOption={handleOption} />
      </Card>

      <ChatInput onSend={sendMessage} disabled={loading} />
    </div>
  );
}

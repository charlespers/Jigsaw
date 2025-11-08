import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  X,
  Loader2,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { mcpApi } from "./mcpApi";

type ChatState = "idle" | "waiting" | "waiting_for_context" | "error";

interface Message {
  id: string;
  type: "user" | "assistant" | "context_request";
  content: string;
  timestamp: Date;
}

interface MCPChatProps {
  mcpServerUrl?: string;
  useMock?: boolean; // Allow switching between mock and real API
}

export default function MCPChat({ 
  mcpServerUrl, 
  useMock = true 
}: MCPChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [state, setState] = useState<ChatState>("idle");
  const [contextRequest, setContextRequest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize API service
  useEffect(() => {
    if (mcpServerUrl) {
      mcpApi.updateConfig({ baseUrl: mcpServerUrl });
    }
    mcpApi.setUseMock(useMock);
  }, [mcpServerUrl, useMock]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (type: Message["type"], content: string) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const killQuery = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState("idle");
    setContextRequest(null);
    setError(null);
    addMessage("assistant", "Query cancelled by user.");
  };

  const sendContextResponse = async (contextResponse: string) => {
    if (!contextRequest) return;

    setState("waiting");
    const currentQueryId = contextRequest;
    setContextRequest(null);
    addMessage("user", `Context provided: ${contextResponse}`);

    // Send the context response back to MCP server using API service
    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const data = await mcpApi.sendContext(
        contextResponse,
        currentQueryId,
        controller.signal
      );

      if (data.type === "context_request") {
        const queryId = data.queryId || data.requestId || "unknown";
        setContextRequest(queryId);
        setState("waiting_for_context");
        addMessage("context_request", data.message || "The server is requesting additional context.");
      } else if (data.type === "response") {
        setState("idle");
        addMessage("assistant", data.message || data.response || "Query completed.");
        abortControllerRef.current = null;
      } else {
        setState("idle");
        addMessage("assistant", data.message || JSON.stringify(data));
        abortControllerRef.current = null;
      }
    } catch (err: any) {
      if (err.name === "AbortError" || err.message?.includes("cancelled")) {
        return; // Query was cancelled
      }
      setState("error");
      setError(err.message || "Failed to send context response");
      addMessage("assistant", `Error: ${err.message || "Failed to send context response"}`);
      abortControllerRef.current = null;
    }
  };

  const sendQuery = async (query: string) => {
    if (!query.trim() || state !== "idle") return;

    setState("waiting");
    setError(null);
    addMessage("user", query);
    setInput("");

    // Send query to MCP server using API service
    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const data = await mcpApi.sendQuery(query, controller.signal);

      if (data.type === "context_request") {
        const queryId = data.queryId || data.requestId || "unknown";
        setContextRequest(queryId);
        setState("waiting_for_context");
        addMessage("context_request", data.message || "The server is requesting additional context.");
      } else if (data.type === "response") {
        setState("idle");
        addMessage("assistant", data.message || data.response || "Query completed.");
        abortControllerRef.current = null;
      } else {
        setState("idle");
        addMessage("assistant", data.message || JSON.stringify(data));
        abortControllerRef.current = null;
      }
    } catch (err: any) {
      if (err.name === "AbortError" || err.message?.includes("cancelled")) {
        return; // Query was cancelled
      }
      setState("error");
      setError(err.message || "Failed to send query");
      addMessage("assistant", `Error: ${err.message || "Failed to send query"}`);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "waiting_for_context" && contextRequest) {
      // If we're waiting for context, treat the input as context response
      sendContextResponse(input.trim());
    } else {
      sendQuery(input.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full h-80 bg-zinc-900/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-medium">MCP Chat</h3>
          {useMock && (
            <Badge
              variant="outline"
              className="text-xs border-zinc-700 text-zinc-400"
              title="Using mock API - switch to real API when MCP server is ready">
              Mock Mode
            </Badge>
          )}
          {state !== "idle" && (
            <Badge
              variant="outline"
              className={`text-xs ${
                state === "waiting"
                  ? "border-blue-700 text-blue-400"
                  : state === "waiting_for_context"
                  ? "border-amber-700 text-amber-400"
                  : "border-red-700 text-red-400"
              }`}>
              {state === "waiting" && "Waiting..."}
              {state === "waiting_for_context" && "Awaiting Context"}
              {state === "error" && "Error"}
            </Badge>
          )}
        </div>
        {state !== "idle" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={killQuery}
            className="h-7 px-2 text-xs text-zinc-400 hover:text-red-400">
            <X className="w-3 h-3 mr-1" />
            Cancel
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 text-zinc-500 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Send a query to the MCP server to get started</p>
            </div>
          )}
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex gap-3 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}>
                {message.type !== "user" && (
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-1">
                    {message.type === "context_request" ? (
                      <AlertCircle className="w-3 h-3 text-amber-400" />
                    ) : (
                      <MessageSquare className="w-3 h-3 text-emerald-400" />
                    )}
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.type === "user"
                      ? "bg-emerald-500/20 text-emerald-100 border border-emerald-500/30"
                      : message.type === "context_request"
                      ? "bg-amber-500/20 text-amber-100 border border-amber-500/30"
                      : "bg-zinc-800 text-zinc-200 border border-zinc-700"
                  }`}>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  <p className="text-xs mt-1 opacity-60">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.type === "user" && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {state === "waiting" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 justify-start">
              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-1">
                <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
              </div>
              <div className="bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg px-4 py-2">
                <p className="text-sm text-zinc-400">Waiting for response...</p>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Context Request Banner */}
      {state === "waiting_for_context" && contextRequest && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/30">
          <div className="flex items-center gap-2 text-sm text-amber-300">
            <AlertCircle className="w-4 h-4" />
            <span>Server is requesting additional context. Please provide it below.</span>
          </div>
        </motion.div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              state === "waiting_for_context"
                ? "Provide the requested context..."
                : "Type your query to the MCP server..."
            }
            disabled={state === "waiting"}
            className="flex-1 bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 resize-none min-h-[60px] max-h-[120px]"
          />
          <Button
            type="submit"
            disabled={!input.trim() || state === "waiting"}
            className="bg-emerald-500 hover:bg-emerald-600 text-white h-[60px] px-4">
            {state === "waiting" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : state === "waiting_for_context" ? (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Context
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </form>
    </div>
  );
}


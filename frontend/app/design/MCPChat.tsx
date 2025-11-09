import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, X, Loader2, AlertCircle, CheckCircle2, Cpu } from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { mcpApi } from "../services/mcp";
import JigsawIcon from "./JigsawIcon";

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
  onQuerySent?: (query: string) => void; // Callback when query is sent (starts analysis)
  onContextRequested?: () => void; // Callback when context is requested (pauses analysis)
  onContextProvided?: () => void; // Callback when context is provided (resumes analysis)
  onQueryKilled?: () => void; // Callback when query is killed/cancelled (pauses analysis)
}

export default function MCPChat({
  mcpServerUrl,
  useMock = true,
  onQuerySent,
  onContextRequested,
  onContextProvided,
  onQueryKilled,
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
    // Abort any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Reset all state
    setState("idle");
    setContextRequest(null);
    setError(null);
    setMessages([]); // Clear all messages
    setInput(""); // Clear input

    // Notify parent to reset everything
    if (onQueryKilled) {
      onQueryKilled();
    }
  };

  const sendContextResponse = async (contextResponse: string) => {
    if (!contextRequest) return;

    setState("waiting");
    const currentQueryId = contextRequest;
    setContextRequest(null);
    addMessage("user", `Context provided: ${contextResponse}`);

    // Notify parent to resume analysis
    // Pass the context and queryId so component analysis can resume
    if (onContextProvided) {
      onContextProvided();
    }

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
        addMessage(
          "context_request",
          data.message || "The server is requesting additional context."
        );

        // Notify parent to pause analysis again
        if (onContextRequested) {
          onContextRequested();
        }
      } else if (data.type === "response") {
        setState("idle");
        addMessage(
          "assistant",
          data.message || data.response || "Query completed."
        );
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
      addMessage(
        "assistant",
        `Error: ${err.message || "Failed to send context response"}`
      );
      abortControllerRef.current = null;
    }
  };

  const sendQuery = async (query: string) => {
    if (!query.trim() || state !== "idle") return;

    setState("waiting");
    setError(null);
    addMessage("user", query);
    setInput("");

    // Notify parent to start analysis
    if (onQuerySent) {
      onQuerySent(query);
    }

    // Send query to MCP server using API service
    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const data = await mcpApi.sendQuery(query, controller.signal);

      if (data.type === "context_request") {
        const queryId = data.queryId || data.requestId || "unknown";
        setContextRequest(queryId);
        setState("waiting_for_context");
        addMessage(
          "context_request",
          data.message || "The server is requesting additional context."
        );

        // Notify parent to pause analysis
        if (onContextRequested) {
          onContextRequested();
        }
      } else if (data.type === "response") {
        setState("idle");
        addMessage(
          "assistant",
          data.message || data.response || "Query completed."
        );
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
      addMessage(
        "assistant",
        `Error: ${err.message || "Failed to send query"}`
      );
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
    <div className="w-full h-[20vh] min-h-[280px] max-h-[400px] bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 border-t border-zinc-800/50 flex flex-col overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400/30 animate-ping"></div>
          </div>
          <h3 className="text-sm font-semibold text-zinc-200 tracking-wide">
            MCP Interface
          </h3>
          {useMock && (
            <Badge
              variant="outline"
              className="text-[10px] border-zinc-700/50 text-zinc-500 bg-zinc-900/50"
              title="Using mock API - switch to real API when MCP server is ready">
              Mock
            </Badge>
          )}
          {state !== "idle" && (
            <Badge
              variant="outline"
              className={`text-[10px] ${
                state === "waiting"
                  ? "border-blue-500/50 text-blue-400 bg-blue-500/10"
                  : state === "waiting_for_context"
                  ? "border-amber-500/50 text-amber-400 bg-amber-500/10"
                  : "border-red-500/50 text-red-400 bg-red-500/10"
              }`}>
              {state === "waiting" && "Processing"}
              {state === "waiting_for_context" && "Awaiting"}
              {state === "error" && "Error"}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={killQuery}
          className="h-7 px-2 text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Reset everything (clear chat and stop analysis)">
          <X className="w-3 h-3 mr-1" />
          Reset
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 relative min-h-0">
        <div className="p-4 space-y-5 relative">
          {messages.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4 pt-16">
              <div className="text-center space-y-3 w-full max-w-sm mx-auto">
                <div className="flex justify-center items-center">
                  <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 overflow-visible">
                    <JigsawIcon className="opacity-40 w-full h-full" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="w-1 h-1 rounded-full bg-emerald-400/60 animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 font-medium tracking-wide">
                  Ready to analyze components
                </p>
                <p className="text-xs text-zinc-600">Send a query to begin</p>
              </div>
            </div>
          )}
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2.5 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}>
                {message.type !== "user" && (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    {message.type === "context_request" ? (
                      <AlertCircle className="w-2.5 h-2.5 text-amber-400" />
                    ) : (
                      <Cpu className="w-2.5 h-2.5 text-emerald-400" />
                    )}
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-lg px-3.5 py-2.5 backdrop-blur-sm ${
                    message.type === "user"
                      ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 text-emerald-50 border border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                      : message.type === "context_request"
                      ? "bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-50 border border-amber-500/40 shadow-lg shadow-amber-500/10"
                      : "bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 text-zinc-200 border border-zinc-700/50 shadow-sm"
                  }`}>
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {message.content}
                  </p>
                  <p className="text-[10px] mt-1.5 opacity-50 font-mono">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.type === "user" && (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {state === "waiting" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2.5 justify-start">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Loader2 className="w-2.5 h-2.5 text-blue-400 animate-spin" />
              </div>
              <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 text-zinc-300 border border-zinc-700/50 rounded-lg px-3.5 py-2.5 backdrop-blur-sm shadow-sm">
                <p className="text-sm text-zinc-400 flex items-center gap-2">
                  <span className="inline-block w-1 h-1 rounded-full bg-blue-400 animate-pulse"></span>
                  Processing...
                </p>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </ScrollArea>

      {/* Context Request Banner */}
      {state === "waiting_for_context" && contextRequest && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-t border-amber-500/20 flex-shrink-0 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 text-sm text-amber-300/90">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span className="font-medium">Context required</span>
            <span className="text-amber-400/60">•</span>
            <span className="text-xs text-amber-300/70">
              Provide additional information below
            </span>
          </div>
        </motion.div>
      )}

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm flex-shrink-0">
        <div className="flex gap-2.5">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              state === "waiting_for_context"
                ? "Provide the requested context..."
                : "Query the MCP server..."
            }
            disabled={state === "waiting"}
            className="flex-1 bg-zinc-900/60 border-zinc-700/50 text-zinc-100 placeholder:text-zinc-500 placeholder:font-light resize-none min-h-[56px] max-h-[100px] rounded-lg focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all overflow-y-auto"
          />
          <Button
            type="submit"
            disabled={!input.trim() || state === "waiting"}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white h-[56px] px-5 rounded-lg shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {state === "waiting" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : state === "waiting_for_context" ? (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send
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
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
      </form>
    </div>
  );
}

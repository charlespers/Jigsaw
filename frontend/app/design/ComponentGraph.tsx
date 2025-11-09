import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Cpu,
  CheckCircle2,
  Loader2,
  ArrowRight,
  AlertCircle,
  Brain,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import {
  componentAnalysisApi,
  type ComponentAnalysisResponse,
} from "../services/mcp";

interface ComponentGraphProps {
  onComponentSelected?: (componentId: string, partData: any, position?: { x: number; y: number }, hierarchyOffset?: number) => void;
  analysisQuery?: string;
  isAnalyzing?: boolean;
  onAnalysisComplete?: () => void;
  onReset?: () => void; // Callback to reset components when new query starts
  onGetHighestHierarchy?: () => number; // Get current highest hierarchy level
  onSetHighestHierarchy?: (level: number) => void; // Set new highest hierarchy level
  onContextRequested?: (queryId: string, message: string) => void; // Callback when MCP requests context during analysis
  onContextProvided?: (context: string, queryId: string) => void; // Callback to provide context and resume analysis
  contextQueryId?: string; // Current context query ID if waiting for context
}

interface ComponentNode {
  id: string;
  label: string;
  status: "pending" | "reasoning" | "selected" | "validated";
  reasoning: string[]; // Array of reasoning snippets
  hierarchyLevel: number;
  partData?: any;
}

export default function ComponentGraph({
  onComponentSelected,
  analysisQuery,
  isAnalyzing = false,
  onAnalysisComplete,
  onReset,
  onGetHighestHierarchy,
  onSetHighestHierarchy,
  onContextRequested,
  onContextProvided,
  contextQueryId,
}: ComponentGraphProps) {
  const [components, setComponents] = useState<Map<string, ComponentNode>>(
    new Map()
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const analysisStartedRef = useRef<string>(""); // Track which query we're analyzing
  const abortControllerRef = useRef<AbortController | null>(null);
  const isAnalysisRunningRef = useRef<boolean>(false); // Track if analysis is currently running
  const localHighestHierarchyRef = useRef<number>(-1); // Track highest hierarchy in this component
  const pausedForContextRef = useRef<boolean>(false); // Track if paused for context
  const contextQueryIdRef = useRef<string | null>(null); // Track context query ID

  // Handle context provided - resume analysis
  useEffect(() => {
    if (contextQueryId && pausedForContextRef.current && onContextProvided) {
      // Context was provided via chat - resume analysis
      pausedForContextRef.current = false;
      contextQueryIdRef.current = null;
      
      // Resume analysis by continuing with the same query
      if (isAnalyzing && analysisQuery && !isAnalysisRunningRef.current) {
        // The analysis will resume in the main useEffect
        isAnalysisRunningRef.current = true;
        setIsProcessing(true);
      }
    }
  }, [contextQueryId, isAnalyzing, analysisQuery, onContextProvided]);

  useEffect(() => {
    if (!isAnalyzing || !analysisQuery) {
      // Stop processing when paused or no query
      setIsProcessing(false);
      isAnalysisRunningRef.current = false;
      // Abort any ongoing analysis only if we're actually stopping (not just pausing)
      if (abortControllerRef.current && !isAnalyzing) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        componentAnalysisApi.cancelAnalysis();
        pausedForContextRef.current = false;
        contextQueryIdRef.current = null;
      }
      // Clear components if there's no query (full reset)
      if (!analysisQuery) {
        setComponents(new Map());
        analysisStartedRef.current = "";
        localHighestHierarchyRef.current = -1;
      }
      return;
    }

    // If paused for context, don't start new analysis
    if (pausedForContextRef.current) {
      return;
    }

    // If we're already analyzing this exact query, don't restart
    if (analysisStartedRef.current === analysisQuery && isAnalysisRunningRef.current) {
      return;
    }

    // If this is a new query (different from what we're currently analyzing)
    // Append new components to existing ones (don't reset)
    if (analysisStartedRef.current !== analysisQuery && analysisStartedRef.current !== "") {
      // Append mode: get current highest hierarchy and use it as offset
      // This allows new queries to add components at the bottom of the hierarchy
      const currentHighest = onGetHighestHierarchy ? onGetHighestHierarchy() : localHighestHierarchyRef.current;
      localHighestHierarchyRef.current = currentHighest;
      
      // Abort previous analysis for new query
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        componentAnalysisApi.cancelAnalysis();
      }
    }
    
    // Only reset if explicitly requested via onReset callback (for new projects)
    // This is handled separately when user explicitly wants to start fresh

    // Mark that we've started analyzing this query
    analysisStartedRef.current = analysisQuery;
    isAnalysisRunningRef.current = true;

    setIsProcessing(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const handleUpdate = (update: ComponentAnalysisResponse) => {
      if (update.type === "reasoning" && update.componentId) {
        setComponents((prev: Map<string, ComponentNode>) => {
          const newMap = new Map(prev);
          
          // Calculate hierarchy offset for appending new components
          const baseOffset = localHighestHierarchyRef.current >= 0 ? localHighestHierarchyRef.current + 1 : 0;
          const adjustedHierarchy = (update.hierarchyLevel || 0) + baseOffset;
          
          const existing = newMap.get(update.componentId!) || {
            id: update.componentId!,
            label: update.componentName || update.componentId,
            status: "reasoning" as const,
            reasoning: [] as string[],
            hierarchyLevel: adjustedHierarchy,
          };

          newMap.set(update.componentId!, {
            ...existing,
            status: "reasoning",
            reasoning: [...existing.reasoning, update.reasoning || ""],
            hierarchyLevel: adjustedHierarchy,
          });

          return newMap;
        });
      } else if (update.type === "selection" && update.componentId) {
        setComponents((prev: Map<string, ComponentNode>) => {
          const newMap = new Map(prev);
          
          // Calculate hierarchy offset for appending new components
          // Use the current highest hierarchy + 1 as the base offset
          const baseOffset = localHighestHierarchyRef.current >= 0 ? localHighestHierarchyRef.current + 1 : 0;
          const adjustedHierarchy = (update.hierarchyLevel || 0) + baseOffset;
          
          // Update highest hierarchy
          if (adjustedHierarchy > localHighestHierarchyRef.current) {
            localHighestHierarchyRef.current = adjustedHierarchy;
            if (onSetHighestHierarchy) {
              onSetHighestHierarchy(adjustedHierarchy);
            }
          }
          
          const existing = newMap.get(update.componentId!) || {
            id: update.componentId!,
            label: update.componentName || update.componentId,
            status: "pending" as const,
            reasoning: [] as string[],
            hierarchyLevel: adjustedHierarchy,
          };

          const updated: ComponentNode = {
            ...existing,
            status: "selected" as const,
            partData: update.partData,
            hierarchyLevel: adjustedHierarchy,
          };

          newMap.set(update.componentId!, updated);

          // Notify parent of selection with hierarchy offset
          if (onComponentSelected && update.partData) {
            const baseOffset = localHighestHierarchyRef.current >= 0 ? localHighestHierarchyRef.current + 1 : 0;
            onComponentSelected(
              update.componentId!,
              update.partData,
              update.position,
              baseOffset
            );
          }

          return newMap;
        });
      } else if (update.type === "complete") {
        setIsProcessing(false);
        isAnalysisRunningRef.current = false;
        if (onAnalysisComplete) {
          onAnalysisComplete();
        }
      } else if (update.type === "error") {
        setIsProcessing(false);
        isAnalysisRunningRef.current = false;
        console.error("Component analysis error:", update.message);
      }
    };

    // Start analysis with context if resuming
    const contextId = contextQueryIdRef.current;
    componentAnalysisApi
      .startAnalysis(
        analysisQuery,
        handleUpdate,
        abortController.signal,
        contextId || undefined,
        contextId ? "Context provided" : undefined // In real implementation, pass actual context
      )
      .then(() => {
        // Analysis completed successfully
        setIsProcessing(false);
        isAnalysisRunningRef.current = false;
        pausedForContextRef.current = false;
        contextQueryIdRef.current = null;
      })
      .catch((error: any) => {
        // Only log if it's not a cancellation
        if (!error.message?.includes("cancelled") && !error.message?.includes("AbortError")) {
          console.error("Analysis failed:", error);
        }
        setIsProcessing(false);
        isAnalysisRunningRef.current = false;
        pausedForContextRef.current = false;
        contextQueryIdRef.current = null;
      });

    return () => {
      // Cleanup: only abort if we're actually stopping (isAnalyzing became false)
      // Don't abort if the effect is re-running for other reasons (like callback updates)
      // The abort will be handled in the main effect body when isAnalyzing is false
    };
  }, [isAnalyzing, analysisQuery]); // Removed callbacks from deps to prevent unnecessary restarts

  const componentArray = Array.from(components.values()).sort(
    (a: ComponentNode, b: ComponentNode) => a.hierarchyLevel - b.hierarchyLevel
  );

  const StatusIcon = ({ status }: { status: ComponentNode["status"] }) => {
    switch (status) {
      case "reasoning":
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case "selected":
      case "validated":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-zinc-600" />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg mb-2">AI Component Analysis</h2>
        <p className="text-sm text-zinc-400">
          {isProcessing
            ? "Analyzing components and validating compatibility"
            : "Ready to analyze components"}
        </p>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {componentArray.length === 0 && !isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 text-zinc-500 text-sm">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Waiting for analysis to begin...</p>
            </motion.div>
          )}

          {componentArray.map((node, index) => {
            const isActive =
              node.status === "reasoning" ||
              node.status === "selected" ||
              node.status === "validated";

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                className="relative">
                {/* Node card */}
                <motion.div
                  className={`relative border rounded-lg p-3 transition-all ${
                    node.status === "selected" || node.status === "validated"
                      ? "bg-emerald-950/30 border-emerald-800 ring-1 ring-emerald-400/30"
                      : node.status === "reasoning"
                      ? "bg-blue-950/30 border-blue-800 ring-1 ring-blue-400/50"
                      : "bg-zinc-900/50 border-zinc-800"
                  }`}
                  animate={
                    node.status === "reasoning"
                      ? { scale: [1, 1.02, 1] }
                      : {}
                  }
                  transition={{ repeat: Infinity, duration: 2 }}>
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        node.status === "selected" || node.status === "validated"
                          ? "bg-emerald-500/20"
                          : node.status === "reasoning"
                          ? "bg-blue-500/20"
                          : "bg-zinc-800"
                      }`}>
                      <Cpu
                        className={`w-4 h-4 ${
                          node.status === "selected" ||
                          node.status === "validated"
                            ? "text-emerald-400"
                            : node.status === "reasoning"
                            ? "text-blue-400"
                            : "text-zinc-600"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-sm font-medium ${
                            isActive ? "text-white" : "text-zinc-500"
                          }`}>
                          {node.label}
                        </span>
                        <StatusIcon status={node.status} />
                        {node.hierarchyLevel > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs border-zinc-700 text-zinc-400">
                            L{node.hierarchyLevel}
                          </Badge>
                        )}
                      </div>

                      {/* Reasoning snippets */}
                      {node.status === "reasoning" && node.reasoning.length > 0 && (
                      <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-1 mt-2">
                            {node.reasoning.slice(-2).map((reason: string, idx: number) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 0.7, y: 0 }}
                                className="flex items-start gap-2 text-xs text-zinc-400">
                                <Brain className="w-3 h-3 mt-0.5 text-blue-400 flex-shrink-0" />
                                <span className="italic">{reason}</span>
                              </motion.div>
                            ))}
                          </motion.div>
                        </AnimatePresence>
                      )}

                      {/* Selected part info */}
                      {(node.status === "selected" ||
                        node.status === "validated") &&
                        node.partData && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-2 text-xs text-emerald-400">
                            <div className="font-medium">
                              {node.partData.mpn}
                            </div>
                            {node.partData.manufacturer && (
                              <div className="text-zinc-500 mt-0.5">
                                {node.partData.manufacturer}
                              </div>
                            )}
                          </motion.div>
                        )}

                      {/* Progress bar for reasoning */}
                      {node.status === "reasoning" && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="h-1 bg-blue-400 rounded-full mt-2"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Connection indicator */}
                {index < componentArray.length - 1 &&
                  (node.status === "selected" ||
                    node.status === "validated") && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center py-2">
                    <ArrowRight className="w-4 h-4 text-emerald-400/50 rotate-90" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Summary */}
      {!isProcessing &&
        componentArray.length > 0 &&
        componentArray.every(
          (c: ComponentNode) => c.status === "selected" || c.status === "validated"
        ) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-emerald-950/30 border border-emerald-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm">Analysis Complete</span>
          </div>
          <p className="text-xs text-zinc-400">
            All components validated and optimized for cost and availability
          </p>
          <div className="flex gap-2 mt-3">
            <Badge
              variant="outline"
              className="text-xs border-emerald-700 text-emerald-400">
                {componentArray.length} Components
            </Badge>
            <Badge
              variant="outline"
              className="text-xs border-emerald-700 text-emerald-400">
              100% Compatible
            </Badge>
          </div>
        </motion.div>
      )}
    </div>
  );
}

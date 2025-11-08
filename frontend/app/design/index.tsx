import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import ComponentGraph from "./ComponentGraph";
import PCBViewer from "./PCBViewer";
import PartsList from "./PartsList";
import type { PartObject } from "./PartsList";
import MCPChat from "./MCPChat";
import { useNavigate } from "react-router";

interface DesignInterfaceProps {
  initialQuery?: string;
}

export default function DesignInterface({ initialQuery = "" }: DesignInterfaceProps) {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalysisPaused, setIsAnalysisPaused] = useState(false);
  const [analysisQuery, setAnalysisQuery] = useState<string>(initialQuery);
  const [parts, setParts] = useState<PartObject[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<
    Map<string, { id: string; label: string; position: { x: number; y: number }; color?: string; size?: { w: number; h: number } }>
  >(new Map());

  // Track previous query to detect new queries
  const previousQueryRef = useRef<string>("");

  // Update query when initialQuery changes and auto-start analysis
  useEffect(() => {
    if (initialQuery && initialQuery.trim() && initialQuery !== previousQueryRef.current) {
      // Reset for new query from landing page
      setParts([]);
      setSelectedComponents(new Map());
      previousQueryRef.current = initialQuery;
      setAnalysisQuery(initialQuery);
      setIsAnalyzing(true);
      setIsAnalysisPaused(false);
    }
  }, [initialQuery]);

  // Track the highest hierarchy level to append new components
  const highestHierarchyRef = useRef<number>(-1);

  // Handle query sent from chat - start analysis
  const handleQuerySent = (query: string) => {
    // Always append new components to existing ones (don't reset)
    // Only reset if this is the very first query ever
    if (previousQueryRef.current === "") {
      // First query ever - start fresh
      setParts([]);
      setSelectedComponents(new Map());
      highestHierarchyRef.current = -1;
    }
    // Otherwise, keep existing components and parts, append new ones at bottom
    previousQueryRef.current = query;
    setAnalysisQuery(query);
    setIsAnalyzing(true);
    setIsAnalysisPaused(false);
  };

  const [contextQueryId, setContextQueryId] = useState<string | null>(null);
  const [contextMessage, setContextMessage] = useState<string>("");

  // Handle context requested from component analysis - pause analysis
  const handleAnalysisContextRequested = (queryId: string, message: string) => {
    setIsAnalysisPaused(true);
    setContextQueryId(queryId);
    setContextMessage(message);
    // Also show in chat
    // ComponentGraph will handle pausing via the isAnalyzing prop
  };

  // Handle context provided - resume analysis
  const handleAnalysisContextProvided = (context: string, queryId: string) => {
    // Clear context state and resume
    setContextQueryId(null);
    setContextMessage("");
    setIsAnalysisPaused(false);
    // ComponentGraph will detect contextQueryId cleared and resume
    // Ensure analysis continues with the same query
    if (analysisQuery) {
      setIsAnalyzing(true);
    }
  };
  
  // Handle context provided from chat - also resume component analysis if it's waiting
  const handleChatContextProvided = () => {
    // If component analysis is waiting for context, provide it
    if (contextQueryId) {
      handleAnalysisContextProvided("Context from chat", contextQueryId);
    }
    setIsAnalysisPaused(false);
    if (analysisQuery) {
      setIsAnalyzing(true);
    }
  };

  // Handle context requested from chat - pause analysis
  const handleChatContextRequested = () => {
    setIsAnalysisPaused(true);
    // ComponentGraph will handle pausing via the isAnalyzing prop
  };

  // Handle query killed - reset everything
  const handleQueryKilled = () => {
    // Stop analysis
    setIsAnalyzing(false);
    setIsAnalysisPaused(false);
    
    // Reset all state
    setParts([]);
    setSelectedComponents(new Map());
    setAnalysisQuery("");
    setContextQueryId(null);
    setContextMessage("");
    highestHierarchyRef.current = -1;
    previousQueryRef.current = "";
    
    // ComponentGraph will stop and abort when isAnalyzing becomes false
    // The abort controller will be cleaned up in ComponentGraph's useEffect
  };

  // Layout system for organized PCB placement
  const calculateComponentPosition = (
    componentId: string,
    existingComponents: Array<{ id: string; position: { x: number; y: number }; size?: { w: number; h: number } }>,
    hierarchyLevel: number
  ): { x: number; y: number } => {
    // Define component types and their preferred positions
    const componentTypes: Record<string, { row: number; col: number }> = {
      mcu: { row: 1, col: 2 }, // Center
      power: { row: 0, col: 2 }, // Top center
      connector: { row: 0, col: 1 }, // Top left
      sensors: { row: 1, col: 0 }, // Left
      memory: { row: 1, col: 4 }, // Right
      antenna: { row: 0, col: 3 }, // Top right
      passives: { row: 2, col: 2 }, // Bottom center
    };

    // Grid spacing
    const gridSpacing = 80; // Space between components
    const startX = 200; // Starting X position
    const startY = 150; // Starting Y position

    // Get component type (lowercase for matching)
    const type = componentId.toLowerCase();
    const layout = componentTypes[type];

    if (layout) {
      // Use predefined layout position
      return {
        x: startX + layout.col * gridSpacing,
        y: startY + layout.row * gridSpacing,
      };
    }

    // For unknown components, place them in a grid pattern
    const existingCount = existingComponents.length;
    const colsPerRow = 4;
    const row = Math.floor(existingCount / colsPerRow);
    const col = existingCount % colsPerRow;
    
    return {
      x: startX + col * gridSpacing,
      y: startY + (row + 3) * gridSpacing, // Start from row 3 for unknown components
    };
  };

  const handleComponentSelected = (
    componentId: string,
    partData: any,
    position?: { x: number; y: number },
    hierarchyOffset?: number
  ) => {
    // Add to parts list (append to bottom)
    setParts((prev) => {
      // Check if part already exists (by MPN)
      const existingIndex = prev.findIndex(
        (p) => p.mpn === partData.mpn
      );
      if (existingIndex >= 0) {
        // Part already exists, don't add it again - just keep existing quantity
        return prev;
      }
      // Add new part at the end
      return [...prev, { ...partData, quantity: partData.quantity || 1 }];
    });

    // Add to PCB viewer with organized grid layout
    setSelectedComponents((prev) => {
      const newMap = new Map(prev);
      const existingComponents = Array.from(prev.values()).map(c => ({
        id: c.id,
        position: c.position,
        size: c.size,
      }));
      
      // Calculate organized position based on component type and existing layout
      const organizedPosition = calculateComponentPosition(
        componentId,
        existingComponents,
        hierarchyOffset || 0
      );
      
      newMap.set(componentId, {
        id: componentId,
        label: partData.mpn.split("-")[0] || componentId, // Use first part of MPN as label
        position: organizedPosition,
        partData, // Include part data for connection logic
      });
      return newMap;
    });
  };

  const handleAnalysisComplete = () => {
    setIsAnalyzing(false);
  };

  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-zinc-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-4 w-px bg-zinc-700"></div>
            <h1 className="text-xl">PCB Design Studio</h1>
          </div>

          <div className="flex items-center gap-4">
            {isAnalyzing && !isAnalysisPaused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-emerald-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                AI Analyzing Components...
              </motion.div>
            )}
            {isAnalysisPaused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-amber-400">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                Analysis Paused - Awaiting Context
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel - Component Graph */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-80 border-r border-zinc-800 bg-zinc-900/30 flex flex-col overflow-hidden h-full">
          <div className="flex-1 overflow-y-auto min-h-0">
            <ComponentGraph
              onComponentSelected={handleComponentSelected}
              analysisQuery={analysisQuery}
              isAnalyzing={isAnalyzing && !isAnalysisPaused}
              onAnalysisComplete={handleAnalysisComplete}
              onReset={() => {
                setParts([]);
                setSelectedComponents(new Map());
                highestHierarchyRef.current = -1;
              }}
              onGetHighestHierarchy={() => highestHierarchyRef.current}
              onSetHighestHierarchy={(level) => {
                highestHierarchyRef.current = level;
              }}
              onContextRequested={handleAnalysisContextRequested}
              onContextProvided={handleAnalysisContextProvided}
              contextQueryId={contextQueryId || undefined}
            />
          </div>
        </motion.div>

        {/* Center Panel - PCB Viewer + Chat */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 flex flex-col bg-zinc-950 overflow-hidden min-h-0">
          {/* PCB Viewer - takes remaining space */}
          <div className="flex-1 overflow-hidden min-h-0">
            <PCBViewer selectedComponents={selectedComponents} />
          </div>
          {/* MCP Chat - fixed height at bottom */}
          <div className="flex-shrink-0 border-t border-zinc-800 overflow-hidden">
            <MCPChat
              useMock={true}
              onQuerySent={handleQuerySent}
              onContextRequested={handleChatContextRequested}
              onContextProvided={handleChatContextProvided}
              onQueryKilled={handleQueryKilled}
            />
          </div>
        </motion.div>

        {/* Right Panel - Parts List */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-96 border-l border-zinc-800 bg-zinc-900/30 flex flex-col overflow-hidden h-full">
          <div className="flex-1 overflow-y-auto min-h-0">
            <PartsList parts={parts} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

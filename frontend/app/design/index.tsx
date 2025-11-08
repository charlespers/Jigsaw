import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Play, Pause } from "lucide-react";
import { Button } from "../components/ui/button";
import ComponentGraph from "./ComponentGraph";
import PCBViewer from "./PCBViewer";
import BOMCart from "./BOMCart";
import { useNavigate } from "react-router";

export default function DesignInterface() {
  const [isProcessing, setIsProcessing] = useState(true);
  const navigate = useNavigate();
  const [processingStage, setProcessingStage] = useState(0);

  useEffect(() => {
    // Simulate processing stages
    const interval = setInterval(() => {
      setProcessingStage((prev) => {
        if (prev >= 6) {
          setIsProcessing(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
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
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-emerald-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                AI Processing...
              </motion.div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-300"
              onClick={() => setIsProcessing(!isProcessing)}>
              {isProcessing ? (
                <Pause className="w-4 h-4 mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {isProcessing ? "Pause" : "Resume"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Component Graph */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-80 border-r border-zinc-800 bg-zinc-900/30 overflow-y-auto">
          <ComponentGraph processingStage={processingStage} />
        </motion.div>

        {/* Center Panel - PCB Viewer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 bg-zinc-950 overflow-hidden">
          <PCBViewer processingStage={processingStage} />
        </motion.div>

        {/* Right Panel - BOM Cart */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-96 border-l border-zinc-800 bg-zinc-900/30 overflow-y-auto">
          <BOMCart processingStage={processingStage} />
        </motion.div>
      </div>
    </div>
  );
}

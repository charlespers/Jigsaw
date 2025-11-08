import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "../components/ui/button";

interface PCBViewerProps {
  processingStage: number;
}

export default function PCBViewer({ processingStage }: PCBViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Draw PCB background
    ctx.fillStyle = "#1a3d2e";
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    // Draw grid
    ctx.strokeStyle = "#2a5d4e";
    ctx.lineWidth = 0.5;
    const gridSize = 20;
    for (let x = 0; x < canvas.offsetWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.offsetHeight);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.offsetHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.offsetWidth, y);
      ctx.stroke();
    }

    // Draw components based on processing stage
    const components = [
      { x: 300, y: 200, w: 60, h: 60, label: "MCU", color: "#10b981" },
      { x: 200, y: 220, w: 40, h: 30, label: "PWR", color: "#3b82f6" },
      { x: 400, y: 220, w: 35, h: 35, label: "SENS", color: "#f59e0b" },
      { x: 300, y: 120, w: 40, h: 30, label: "MEM", color: "#8b5cf6" },
      { x: 380, y: 150, w: 25, h: 25, label: "ANT", color: "#ec4899" },
      { x: 220, y: 150, w: 20, h: 20, label: "CAP", color: "#6366f1" },
      { x: 250, y: 300, w: 30, h: 20, label: "USB", color: "#14b8a6" },
    ];

    components.forEach((comp, index) => {
      if (index < processingStage) {
        // Draw component
        ctx.fillStyle = comp.color + "40";
        ctx.strokeStyle = comp.color;
        ctx.lineWidth = 2;
        ctx.fillRect(comp.x, comp.y, comp.w, comp.h);
        ctx.strokeRect(comp.x, comp.y, comp.w, comp.h);

        // Draw pins
        ctx.fillStyle = "#d4af37";
        const pinSize = 4;
        const pinPositions = [
          { x: comp.x - pinSize / 2, y: comp.y + comp.h / 2 - pinSize / 2 },
          {
            x: comp.x + comp.w - pinSize / 2,
            y: comp.y + comp.h / 2 - pinSize / 2,
          },
          { x: comp.x + comp.w / 2 - pinSize / 2, y: comp.y - pinSize / 2 },
          {
            x: comp.x + comp.w / 2 - pinSize / 2,
            y: comp.y + comp.h - pinSize / 2,
          },
        ];
        pinPositions.forEach((pin) => {
          ctx.fillRect(pin.x, pin.y, pinSize, pinSize);
        });

        // Draw label
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(comp.label, comp.x + comp.w / 2, comp.y + comp.h / 2);

        // Draw traces (connections)
        if (index > 0) {
          ctx.strokeStyle = "#d4af37";
          ctx.lineWidth = 2;
          ctx.beginPath();
          const prevComp = components[0]; // Connect all to MCU
          ctx.moveTo(prevComp.x + prevComp.w / 2, prevComp.y + prevComp.h / 2);
          ctx.lineTo(comp.x + comp.w / 2, comp.y + comp.h / 2);
          ctx.stroke();
        }
      }
    });
  }, [processingStage]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button
          size="sm"
          variant="outline"
          className="bg-zinc-900 border-zinc-700"
          onClick={() => setZoom(Math.min(zoom + 0.2, 3))}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-zinc-900 border-zinc-700"
          onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-zinc-900 border-zinc-700"
          onClick={() => setZoom(1)}>
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* PCB Title */}
      <div className="absolute top-4 left-4 bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-lg px-4 py-2">
        <div className="text-sm text-zinc-400 mb-1">PCB Design</div>
        <div className="text-white">Temperature Sensor Node v1.0</div>
      </div>

      {/* Canvas */}
      <motion.div
        animate={{ scale: zoom }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative"
        style={{ transformOrigin: "center" }}>
        <canvas
          ref={canvasRef}
          className="rounded-lg shadow-2xl"
          style={{
            width: "600px",
            height: "400px",
            border: "2px solid #3f3f46",
          }}
        />
      </motion.div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-lg p-3">
        <div className="text-xs text-zinc-400 mb-2">Component Legend</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
            <span className="text-zinc-300">Microcontroller</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-zinc-300">Power</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded"></div>
            <span className="text-zinc-300">Sensors</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-zinc-300">Memory</span>
          </div>
        </div>
      </div>

      {processingStage === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-zinc-400">Initializing PCB layout...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

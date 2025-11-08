import { useEffect, useRef, useState } from "react";
import type React from "react";
import { motion } from "motion/react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "../components/ui/button";
import type { PartObject } from "../services/mcp";

interface PCBComponent {
  id: string;
  label: string;
  position: { x: number; y: number };
  color?: string;
  size?: { w: number; h: number };
  partData?: PartObject; // Include part data for connection logic
}

interface PCBViewerProps {
  selectedComponents?: Map<string, PCBComponent>;
}

interface Connection {
  from: string;
  to: string;
  type: "power" | "data" | "rf"; // Connection type
  protocol?: string; // e.g., "I2C", "SPI", "USB"
}

// Color palette for different component types
const getComponentColor = (componentId: string): string => {
  const colorMap: Record<string, string> = {
    mcu: "#10b981",
    power: "#3b82f6",
    sensors: "#f59e0b",
    memory: "#8b5cf6",
    antenna: "#ec4899",
    passives: "#6366f1",
    connector: "#14b8a6",
  };
  return colorMap[componentId.toLowerCase()] || "#10b981";
};

// Get component size based on type - responsive to viewport
const getComponentSize = (componentId: string): { w: number; h: number } => {
  // Base sizes as proportions of viewport (scaled down for canvas)
  const baseScale = typeof window !== "undefined" 
    ? Math.max(0.5, Math.min(1.0, (window.innerWidth + window.innerHeight) / 2000))
    : 1.0;
  
  const sizeMap: Record<string, { w: number; h: number }> = {
    mcu: { w: 60 * baseScale, h: 60 * baseScale },
    power: { w: 40 * baseScale, h: 30 * baseScale },
    sensors: { w: 35 * baseScale, h: 35 * baseScale },
    memory: { w: 40 * baseScale, h: 30 * baseScale },
    antenna: { w: 25 * baseScale, h: 25 * baseScale },
    passives: { w: 20 * baseScale, h: 20 * baseScale },
    connector: { w: 30 * baseScale, h: 20 * baseScale },
  };
  return sizeMap[componentId.toLowerCase()] || { w: 40 * baseScale, h: 40 * baseScale };
};

// Helper to parse voltage range from string (e.g., "3.0V ~ 3.6V" or "5V")
function parseVoltage(voltageStr?: string): { min?: number; max?: number; nominal?: number } | null {
  if (!voltageStr) return null;
  
  // Handle ranges like "3.0V ~ 3.6V"
  const rangeMatch = voltageStr.match(/(\d+\.?\d*)\s*V?\s*[~-]\s*(\d+\.?\d*)\s*V/i);
  if (rangeMatch) {
    return { min: parseFloat(rangeMatch[1]), max: parseFloat(rangeMatch[2]) };
  }
  
  // Handle single voltage like "5V" or "3.3V"
  const singleMatch = voltageStr.match(/(\d+\.?\d*)\s*V/i);
  if (singleMatch) {
    const val = parseFloat(singleMatch[1]);
    return { nominal: val, min: val, max: val };
  }
  
  return null;
}

// Check if two voltages are compatible (within 10% tolerance)
function areVoltagesCompatible(voltage1?: string, voltage2?: string): boolean {
  if (!voltage1 || !voltage2) return true; // Assume compatible if unknown
  
  const v1 = parseVoltage(voltage1);
  const v2 = parseVoltage(voltage2);
  
  if (!v1 || !v2) return true;
  
  // Check if voltage ranges overlap or are close
  const v1Nominal = v1.nominal || ((v1.min! + v1.max!) / 2);
  const v2Nominal = v2.nominal || ((v2.min! + v2.max!) / 2);
  
  return Math.abs(v1Nominal - v2Nominal) / Math.max(v1Nominal, v2Nominal) < 0.1;
}

// Determine connections between components based on their relationships and part data
function determineConnections(components: PCBComponent[]): Connection[] {
  const connections: Connection[] = [];
  const mcu = components.find((c) => c.id.toLowerCase() === "mcu");
  const power = components.find((c) => c.id.toLowerCase() === "power");
  const connector = components.find((c) => c.id.toLowerCase() === "connector");
  const sensors = components.find((c) => c.id.toLowerCase() === "sensors");
  const memory = components.find((c) => c.id.toLowerCase() === "memory");
  const antenna = components.find((c) => c.id.toLowerCase() === "antenna");
  const passives = components.find((c) => c.id.toLowerCase() === "passives");

  if (!mcu) return connections;

  // Power connections: connector -> power -> MCU and other components
  // Check voltage compatibility
  if (connector && power) {
    const connectorVoltage = connector.partData?.voltage;
    const powerInputVoltage = power.partData?.voltage?.split(",")[0]?.trim(); // Get input voltage
    if (areVoltagesCompatible(connectorVoltage, powerInputVoltage)) {
      connections.push({ from: connector.id, to: power.id, type: "power" });
    }
  }
  
  if (power && mcu) {
    const powerOutputVoltage = power.partData?.voltage?.split(",")[1]?.trim() || power.partData?.voltage; // Get output voltage
    const mcuVoltage = mcu.partData?.voltage;
    if (areVoltagesCompatible(powerOutputVoltage, mcuVoltage)) {
      connections.push({ from: power.id, to: mcu.id, type: "power" });
    }
  }
  
  if (power && sensors) {
    const powerOutputVoltage = power.partData?.voltage?.split(",")[1]?.trim() || power.partData?.voltage;
    const sensorVoltage = sensors.partData?.voltage;
    if (areVoltagesCompatible(powerOutputVoltage, sensorVoltage)) {
      connections.push({ from: power.id, to: sensors.id, type: "power" });
    }
  }
  
  if (power && memory) {
    const powerOutputVoltage = power.partData?.voltage?.split(",")[1]?.trim() || power.partData?.voltage;
    const memoryVoltage = memory.partData?.voltage;
    if (areVoltagesCompatible(powerOutputVoltage, memoryVoltage)) {
      connections.push({ from: power.id, to: memory.id, type: "power" });
    }
  }

  // Data/Communication connections - check for matching interfaces
  if (mcu && sensors) {
    const mcuInterfaces = mcu.partData?.interfaces || [];
    const sensorInterfaces = sensors.partData?.interfaces || [];
    
    // Find common interfaces
    const commonInterfaces = mcuInterfaces.filter((iface: string) => 
      sensorInterfaces.some((siface: string) => 
        siface.toLowerCase().includes(iface.toLowerCase()) || 
        iface.toLowerCase().includes(siface.toLowerCase())
      )
    );
    
    if (commonInterfaces.length > 0) {
      const protocol = commonInterfaces[0]; // Use first common interface
      connections.push({ from: mcu.id, to: sensors.id, type: "data", protocol });
    }
  }
  
  if (mcu && memory) {
    const mcuInterfaces = mcu.partData?.interfaces || [];
    const memoryInterfaces = memory.partData?.interfaces || [];
    
    const commonInterfaces = mcuInterfaces.filter((iface: string) => 
      memoryInterfaces.some((miface: string) => 
        miface.toLowerCase().includes(iface.toLowerCase()) || 
        iface.toLowerCase().includes(miface.toLowerCase())
      )
    );
    
    if (commonInterfaces.length > 0) {
      const protocol = commonInterfaces[0];
      connections.push({ from: mcu.id, to: memory.id, type: "data", protocol });
    }
  }

  // USB connection: connector -> MCU (check for USB interface)
  if (connector && mcu) {
    const connectorInterfaces = connector.partData?.interfaces || [];
    const mcuInterfaces = mcu.partData?.interfaces || [];
    
    const hasUSB = connectorInterfaces.some((iface: string) => 
      iface.toLowerCase().includes("usb")
    ) && mcuInterfaces.some((iface: string) => 
      iface.toLowerCase().includes("usb")
    );
    
    if (hasUSB) {
      connections.push({ from: connector.id, to: mcu.id, type: "data", protocol: "USB" });
    }
  }

  // RF connection: antenna -> MCU (check for WiFi/Bluetooth interfaces)
  if (antenna && mcu) {
    const mcuInterfaces = mcu.partData?.interfaces || [];
    const hasRF = mcuInterfaces.some((iface: string) => 
      iface.toLowerCase().includes("wifi") || 
      iface.toLowerCase().includes("bluetooth") ||
      iface.toLowerCase().includes("rf")
    );
    
    if (hasRF) {
      connections.push({ from: antenna.id, to: mcu.id, type: "rf" });
    }
  }

  // Passives connect to power rails (decoupling capacitors)
  // Connect to components that need power
  const powerConsumingComponents = [mcu, sensors, memory].filter(Boolean);
  powerConsumingComponents.forEach((comp) => {
    if (passives && comp) {
      connections.push({ from: passives.id, to: comp.id, type: "power" });
    }
  });
  
  if (passives && power) {
    connections.push({ from: passives.id, to: power.id, type: "power" });
  }

  return connections;
}

export default function PCBViewer({ selectedComponents = new Map() }: PCBViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate center of all components for auto-centering
  useEffect(() => {
    const componentsArray = Array.from(selectedComponents.values());
    if (componentsArray.length > 0 && pan.x === 0 && pan.y === 0 && zoom === 1) {
      // Auto-center on first load
      const avgX = componentsArray.reduce((sum, c) => sum + c.position.x, 0) / componentsArray.length;
      const avgY = componentsArray.reduce((sum, c) => sum + c.position.y, 0) / componentsArray.length;
      
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const centerX = canvas.offsetWidth / 2;
        const centerY = canvas.offsetHeight / 2;
        setPan({
          x: centerX - avgX,
          y: centerY - avgY,
        });
      }
    }
  }, [selectedComponents.size]); // Only when components are first added

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(3, zoom * delta));
    
    // Zoom towards mouse position
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const zoomFactor = newZoom / zoom;
    setPan({
      x: mouseX - (mouseX - pan.x) * zoomFactor,
      y: mouseY - (mouseY - pan.y) * zoomFactor,
    });
    setZoom(newZoom);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    const scale = window.devicePixelRatio;
    ctx.scale(scale, scale);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    // Apply pan and zoom transforms
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Calculate bounds of all components for background
    const allComponents = Array.from(selectedComponents.values());
    let minX = 100, minY = 100, maxX = 600, maxY = 500;
    
    if (allComponents.length > 0) {
      minX = Math.min(...allComponents.map(c => c.position.x - 50));
      minY = Math.min(...allComponents.map(c => c.position.y - 50));
      maxX = Math.max(...allComponents.map(c => c.position.x + (c.size?.w || 45) + 50));
      maxY = Math.max(...allComponents.map(c => c.position.y + (c.size?.h || 45) + 50));
    }

    // Draw PCB background (compact board area)
    ctx.fillStyle = "#1a3d2e";
    ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
    
    // Draw board outline
    ctx.strokeStyle = "#3a5d4e";
    ctx.lineWidth = 3 / zoom;
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);

    // Draw grid (subtle, only within board bounds)
    ctx.strokeStyle = "#2a5d4e";
    ctx.lineWidth = 0.3 / zoom; // Scale line width with zoom
    const gridSize = 20;
    const startX = Math.floor(minX / gridSize) * gridSize;
    const startY = Math.floor(minY / gridSize) * gridSize;
    const endX = Math.ceil(maxX / gridSize) * gridSize;
    const endY = Math.ceil(maxY / gridSize) * gridSize;
    
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, minY);
      ctx.lineTo(x, maxY);
      ctx.stroke();
    }
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(minX, y);
      ctx.lineTo(maxX, y);
      ctx.stroke();
    }

    // Draw selected components
    const componentsArray = Array.from(selectedComponents.values());
    
    // Determine connections based on component relationships
    const connections = determineConnections(componentsArray);

    // Draw connections first (so they appear behind components)
    connections.forEach((conn) => {
      const fromComp = componentsArray.find((c) => c.id === conn.from);
      const toComp = componentsArray.find((c) => c.id === conn.to);
      
      if (!fromComp || !toComp) return;

      const fromSize = fromComp.size || getComponentSize(fromComp.id);
      const toSize = toComp.size || getComponentSize(toComp.id);
      
      const fromX = fromComp.position.x + fromSize.w / 2;
      const fromY = fromComp.position.y + fromSize.h / 2;
      const toX = toComp.position.x + toSize.w / 2;
      const toY = toComp.position.y + toSize.h / 2;

      // Different colors for different connection types
      let traceColor = "#d4af37"; // Default gold
      let lineWidth = 2;
      
      if (conn.type === "power") {
        traceColor = "#3b82f6"; // Blue for power
        lineWidth = 2.5;
      } else if (conn.type === "data") {
        traceColor = "#10b981"; // Green for data
        lineWidth = 2;
      } else if (conn.type === "rf") {
        traceColor = "#ec4899"; // Pink for RF
        lineWidth = 2;
      }

      ctx.strokeStyle = traceColor;
      ctx.lineWidth = lineWidth;
      ctx.setLineDash([]);
      
      // Draw trace
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      // Draw protocol label for data connections
      if (conn.type === "data" && conn.protocol) {
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(midX - 15, midY - 8, 30, 16);
        ctx.fillStyle = traceColor;
        ctx.font = "8px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(conn.protocol, midX, midY);
      }
    });

    // Draw components on top of connections
    componentsArray.forEach((comp) => {
      const color = comp.color || getComponentColor(comp.id);
      const size = comp.size || getComponentSize(comp.id);
      const x = comp.position.x;
      const y = comp.position.y;

      // Draw component (green for selected)
      ctx.fillStyle = color + "40";
      ctx.strokeStyle = color;
        ctx.lineWidth = 2;
      ctx.fillRect(x, y, size.w, size.h);
      ctx.strokeRect(x, y, size.w, size.h);

        // Draw pins (smaller, more realistic)
        ctx.fillStyle = "#d4af37";
        const pinSize = 3 / zoom;
        const pinPositions = [
        { x: x - pinSize / 2, y: y + size.h / 2 - pinSize / 2 },
        { x: x + size.w - pinSize / 2, y: y + size.h / 2 - pinSize / 2 },
        { x: x + size.w / 2 - pinSize / 2, y: y - pinSize / 2 },
        { x: x + size.w / 2 - pinSize / 2, y: y + size.h - pinSize / 2 },
        ];
        pinPositions.forEach((pin) => {
          ctx.beginPath();
          ctx.arc(pin.x + pinSize / 2, pin.y + pinSize / 2, pinSize / 2, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw label (scaled with zoom)
        ctx.fillStyle = "#ffffff";
        ctx.font = `${Math.max(8, 10 / zoom)}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(comp.label, x + size.w / 2, y + size.h / 2);
      
      // Draw voltage info if available (small text below label, only if zoomed in)
      if (comp.partData?.voltage && zoom > 0.8) {
        ctx.fillStyle = "#888888";
        ctx.font = `${Math.max(6, 8 / zoom)}px monospace`;
        const voltageText = comp.partData.voltage.split("~")[0].trim() || comp.partData.voltage;
        ctx.fillText(voltageText, x + size.w / 2, y + size.h + 10 / zoom);
      }
      
      // Draw package info if available (small text above component, only if zoomed in)
      if (comp.partData?.package && zoom > 0.8) {
        ctx.fillStyle = "#666666";
        ctx.font = `${Math.max(5, 7 / zoom)}px monospace`;
        ctx.fillText(comp.partData.package, x + size.w / 2, y - 6 / zoom);
      }
    });

    ctx.restore();
  }, [selectedComponents, zoom, pan]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(3, prev * 1.2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.5, prev / 1.2));
  };

  const handleResetView = () => {
    const componentsArray = Array.from(selectedComponents.values());
    if (componentsArray.length > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const avgX = componentsArray.reduce((sum, c) => sum + c.position.x, 0) / componentsArray.length;
      const avgY = componentsArray.reduce((sum, c) => sum + c.position.y, 0) / componentsArray.length;
      
      const centerX = canvas.offsetWidth / 2;
      const centerY = canvas.offsetHeight / 2;
      setPan({
        x: centerX - avgX,
        y: centerY - avgY,
      });
      setZoom(1);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-zinc-950 overflow-hidden"
      onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves
    >
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-lg p-2 flex flex-col gap-2 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          className="h-8 w-8 p-0"
          title="Zoom In">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          className="h-8 w-8 p-0"
          title="Zoom Out">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetView}
          className="h-8 w-8 p-0"
          title="Reset View (Center & Zoom)">
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Pan Hint */}
      {selectedComponents.size > 0 && (
        <div className="absolute bottom-4 right-4 bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-lg p-2 text-xs text-zinc-400 z-10">
          <div>Drag to pan • Scroll to zoom</div>
          <div className="text-zinc-500 mt-1">Zoom: {(zoom * 100).toFixed(0)}%</div>
        </div>
      )}

      {/* PCB Title */}
      <div className="absolute top-4 left-4 bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-lg px-4 py-2">
        <div className="text-sm text-zinc-400 mb-1">PCB Design</div>
        <div className="text-white">Temperature Sensor Node v1.0</div>
      </div>

      {/* Canvas */}
        <canvas
          ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-lg p-3">
        <div className="text-xs text-zinc-400 mb-2">Component Legend</div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
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
        <div className="border-t border-zinc-700 pt-2 mt-2">
          <div className="text-xs text-zinc-400 mb-2">Connections</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-blue-500"></div>
              <span className="text-zinc-300">Power</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-emerald-500"></div>
              <span className="text-zinc-300">Data (I2C/SPI)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-pink-500"></div>
              <span className="text-zinc-300">RF (Antenna)</span>
            </div>
          </div>
        </div>
      </div>

      {selectedComponents.size === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-zinc-400">Waiting for components...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

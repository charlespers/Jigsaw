import { motion, AnimatePresence } from "motion/react";
import {
  Cpu,
  CheckCircle2,
  Loader2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Badge } from "../components/ui/badge";

interface ComponentGraphProps {
  processingStage: number;
}

interface GraphNode {
  id: string;
  label: string;
  status: "pending" | "processing" | "complete" | "validated";
  description: string;
  connections?: string[];
}

const graphNodes: GraphNode[] = [
  {
    id: "mcu",
    label: "Microcontroller",
    status: "pending",
    description: "ESP32-S3 selected for WiFi/BT",
    connections: ["power", "sensors", "memory"],
  },
  {
    id: "power",
    label: "Power Management",
    status: "pending",
    description: "Validating voltage requirements",
    connections: ["mcu"],
  },
  {
    id: "sensors",
    label: "Temperature Sensor",
    status: "pending",
    description: "BME280 - I2C compatible",
    connections: ["mcu"],
  },
  {
    id: "memory",
    label: "Flash Memory",
    status: "pending",
    description: "W25Q128 - 16MB storage",
    connections: ["mcu"],
  },
  {
    id: "antenna",
    label: "WiFi Antenna",
    status: "pending",
    description: "Ceramic antenna validated",
    connections: [],
  },
  {
    id: "passives",
    label: "Passives & Caps",
    status: "pending",
    description: "Decoupling capacitors",
    connections: [],
  },
  {
    id: "connector",
    label: "USB-C Connector",
    status: "pending",
    description: "Power & programming",
    connections: ["power"],
  },
];

export default function ComponentGraph({
  processingStage,
}: ComponentGraphProps) {
  const getNodeStatus = (
    index: number
  ): "pending" | "processing" | "complete" | "validated" => {
    if (processingStage < index) return "pending";
    if (processingStage === index) return "processing";
    return "complete";
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "processing":
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case "complete":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
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
          Validating compatibility and optimizing selection
        </p>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {graphNodes.map((node, index) => {
            const status = getNodeStatus(index);
            const isActive = status === "processing" || status === "complete";

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative">
                {/* Connection lines */}
                {node.connections &&
                  node.connections.length > 0 &&
                  status === "complete" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      className="absolute left-6 top-12 w-px h-8 bg-emerald-400"
                    />
                  )}

                {/* Node card */}
                <motion.div
                  className={`relative border rounded-lg p-3 transition-all ${
                    status === "complete"
                      ? "bg-emerald-950/30 border-emerald-800"
                      : status === "processing"
                      ? "bg-blue-950/30 border-blue-800 ring-1 ring-blue-400/50"
                      : "bg-zinc-900/50 border-zinc-800"
                  }`}
                  animate={
                    status === "processing" ? { scale: [1, 1.02, 1] } : {}
                  }
                  transition={{ repeat: Infinity, duration: 2 }}>
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        status === "complete"
                          ? "bg-emerald-500/20"
                          : status === "processing"
                          ? "bg-blue-500/20"
                          : "bg-zinc-800"
                      }`}>
                      <Cpu
                        className={`w-4 h-4 ${
                          status === "complete"
                            ? "text-emerald-400"
                            : status === "processing"
                            ? "text-blue-400"
                            : "text-zinc-600"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-sm ${
                            isActive ? "text-white" : "text-zinc-500"
                          }`}>
                          {node.label}
                        </span>
                        <StatusIcon status={status} />
                      </div>

                      <AnimatePresence>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-zinc-400">
                            {node.description}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {status === "processing" && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2 }}
                          className="h-1 bg-blue-400 rounded-full mt-2"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Connection indicator */}
                {index < graphNodes.length - 1 && status === "complete" && (
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
      {processingStage >= graphNodes.length && (
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
              7 Components
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

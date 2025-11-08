import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Download, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import ComponentCard from "./ComponentCard";

interface BOMCartProps {
  processingStage: number;
}

const bomComponents = [
  {
    id: "1",
    name: "ESP32-S3-WROOM-1",
    partNumber: "ESP32-S3-WROOM-1-N8R2",
    category: "Microcontroller",
    specs: ["WiFi + BT 5.0", "8MB Flash", "Dual Core"],
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
    suppliers: [
      {
        name: "DigiKey",
        price: 2.89,
        leadTime: "2 weeks",
        stock: "In Stock",
        selected: true,
      },
      {
        name: "Mouser",
        price: 3.15,
        leadTime: "3 weeks",
        stock: "Low Stock",
        selected: false,
      },
      {
        name: "Arrow",
        price: 2.95,
        leadTime: "4 weeks",
        stock: "In Stock",
        selected: false,
      },
    ],
    quantity: 1,
  },
  {
    id: "2",
    name: "AP2112K-3.3",
    partNumber: "AP2112K-3.3TRG1",
    category: "Power Management",
    specs: ["LDO 3.3V", "600mA", "SOT23-5"],
    image:
      "https://images.unsplash.com/photo-1603732551681-f8b75a1c1b1f?w=400&h=300&fit=crop",
    suppliers: [
      {
        name: "DigiKey",
        price: 0.45,
        leadTime: "1 week",
        stock: "In Stock",
        selected: true,
      },
      {
        name: "Mouser",
        price: 0.52,
        leadTime: "2 weeks",
        stock: "In Stock",
        selected: false,
      },
      {
        name: "Arrow",
        price: 0.48,
        leadTime: "2 weeks",
        stock: "Low Stock",
        selected: false,
      },
    ],
    quantity: 1,
  },
  {
    id: "3",
    name: "BME280",
    partNumber: "BME280",
    category: "Sensor",
    specs: ["Temp/Humidity", "I2C/SPI", "±1°C accuracy"],
    image:
      "https://images.unsplash.com/photo-1625314887424-9f190599bd56?w=400&h=300&fit=crop",
    suppliers: [
      {
        name: "DigiKey",
        price: 4.25,
        leadTime: "3 weeks",
        stock: "In Stock",
        selected: false,
      },
      {
        name: "Mouser",
        price: 3.99,
        leadTime: "2 weeks",
        stock: "In Stock",
        selected: true,
      },
      {
        name: "Arrow",
        price: 4.15,
        leadTime: "4 weeks",
        stock: "Out of Stock",
        selected: false,
      },
    ],
    quantity: 1,
  },
  {
    id: "4",
    name: "W25Q128JVSIQ",
    partNumber: "W25Q128JVSIQ",
    category: "Memory",
    specs: ["128Mbit Flash", "SPI", "SOIC-8"],
    image:
      "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=300&fit=crop",
    suppliers: [
      {
        name: "DigiKey",
        price: 1.89,
        leadTime: "1 week",
        stock: "In Stock",
        selected: true,
      },
      {
        name: "Mouser",
        price: 2.05,
        leadTime: "2 weeks",
        stock: "In Stock",
        selected: false,
      },
      {
        name: "Arrow",
        price: 1.95,
        leadTime: "2 weeks",
        stock: "In Stock",
        selected: false,
      },
    ],
    quantity: 1,
  },
  {
    id: "5",
    name: "Ceramic Antenna",
    partNumber: "ANT-2.4-CHP-T",
    category: "Antenna",
    specs: ["2.4GHz", "Ceramic", "50Ω"],
    image:
      "https://images.unsplash.com/photo-1580982324840-7b8f397f2a37?w=400&h=300&fit=crop",
    suppliers: [
      {
        name: "DigiKey",
        price: 1.25,
        leadTime: "2 weeks",
        stock: "In Stock",
        selected: false,
      },
      {
        name: "Mouser",
        price: 1.15,
        leadTime: "1 week",
        stock: "In Stock",
        selected: true,
      },
      {
        name: "Arrow",
        price: 1.3,
        leadTime: "3 weeks",
        stock: "Low Stock",
        selected: false,
      },
    ],
    quantity: 1,
  },
  {
    id: "6",
    name: "Capacitor Kit",
    partNumber: "CAP-KIT-0603",
    category: "Passive",
    specs: ["0.1µF-10µF", "0603", "X7R"],
    image:
      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop",
    suppliers: [
      {
        name: "DigiKey",
        price: 0.15,
        leadTime: "1 week",
        stock: "In Stock",
        selected: true,
      },
      {
        name: "Mouser",
        price: 0.18,
        leadTime: "1 week",
        stock: "In Stock",
        selected: false,
      },
      {
        name: "Arrow",
        price: 0.16,
        leadTime: "2 weeks",
        stock: "In Stock",
        selected: false,
      },
    ],
    quantity: 10,
  },
  {
    id: "7",
    name: "USB-C Connector",
    partNumber: "USB4105-GF-A",
    category: "Connector",
    specs: ["USB 2.0", "Mid-mount", "16-pin"],
    image:
      "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=300&fit=crop",
    suppliers: [
      {
        name: "DigiKey",
        price: 0.89,
        leadTime: "2 weeks",
        stock: "In Stock",
        selected: true,
      },
      {
        name: "Mouser",
        price: 0.95,
        leadTime: "2 weeks",
        stock: "In Stock",
        selected: false,
      },
      {
        name: "Arrow",
        price: 0.92,
        leadTime: "3 weeks",
        stock: "Low Stock",
        selected: false,
      },
    ],
    quantity: 1,
  },
];

export default function BOMCart({ processingStage }: BOMCartProps) {
  const visibleComponents = bomComponents.slice(0, processingStage);

  const totalCost = visibleComponents.reduce((sum, comp) => {
    const selectedSupplier = comp.suppliers.find((s) => s.selected);
    return (
      sum + (selectedSupplier ? selectedSupplier.price * comp.quantity : 0)
    );
  }, 0);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingCart className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg">Bill of Materials</h2>
        </div>
        <p className="text-sm text-zinc-400">
          Optimized for cost and availability
        </p>
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {visibleComponents.map((component, index) => (
            <motion.div
              key={component.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}>
              <ComponentCard component={component} />
            </motion.div>
          ))}
        </AnimatePresence>

        {processingStage === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Analyzing components...</p>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {visibleComponents.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="border-t border-zinc-800 bg-zinc-900/50 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Components</span>
              <span className="text-white">
                {visibleComponents.length} items
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Estimated Lead Time</span>
              <Badge
                variant="outline"
                className="border-emerald-700 text-emerald-400">
                2-3 weeks
              </Badge>
            </div>
            <Separator className="bg-zinc-800" />
            <div className="flex items-center justify-between">
              <span className="text-lg">Total Cost</span>
              <span className="text-2xl text-emerald-400">
                ${totalCost.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-zinc-500 text-center">
              Unit price • Bulk discounts available
            </div>
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export to Cart
            </Button>
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>All components verified compatible</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

import { useState } from "react";
import { motion } from "motion/react";
import { ChevronDown, ChevronUp, Package, CheckCircle2 } from "lucide-react";
import { Badge } from "../components/ui/badge";

interface Supplier {
  name: string;
  price: number;
  leadTime: string;
  stock: string;
  selected: boolean;
}

interface Component {
  id: string;
  name: string;
  partNumber: string;
  category: string;
  specs: string[];
  image: string;
  suppliers: Supplier[];
  quantity: number;
}

interface ComponentCardProps {
  component: Component;
}

export default function ComponentCard({ component }: ComponentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedSupplier = component.suppliers.find((s) => s.selected);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Main Info */}
      <div className="p-4">
        <div className="flex gap-3 mb-3">
          <div className="w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0"></div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm truncate">{component.name}</h3>
              <Badge
                variant="outline"
                className="text-xs border-zinc-700 text-zinc-400 flex-shrink-0">
                x{component.quantity}
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 mb-2">{component.partNumber}</p>
            <div className="flex flex-wrap gap-1">
              {component.specs.slice(0, 2).map((spec, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-zinc-800 text-zinc-400 border-0">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Supplier Info */}
        {selectedSupplier && (
          <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3 mb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">
                  {selectedSupplier.name}
                </span>
              </div>
              <span className="text-emerald-400">
                ${selectedSupplier.price.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>{selectedSupplier.leadTime}</span>
              <Badge
                variant="outline"
                className={`text-xs border-0 ${
                  selectedSupplier.stock === "In Stock"
                    ? "bg-emerald-950 text-emerald-400"
                    : "bg-amber-950 text-amber-400"
                }`}>
                {selectedSupplier.stock}
              </Badge>
            </div>
          </div>
        )}

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors py-2">
          <span>Compare Suppliers</span>
          {isExpanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Expanded Supplier List */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-zinc-800">
          <div className="p-4 space-y-2">
            {component.suppliers.map((supplier, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  supplier.selected
                    ? "bg-emerald-950/20 border-emerald-800/50"
                    : "bg-zinc-800/30 border-zinc-800"
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package
                      className={`w-3 h-3 ${
                        supplier.selected ? "text-emerald-400" : "text-zinc-500"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        supplier.selected ? "text-white" : "text-zinc-400"
                      }`}>
                      {supplier.name}
                    </span>
                    {supplier.selected && (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      supplier.selected ? "text-emerald-400" : "text-zinc-300"
                    }`}>
                    ${supplier.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">{supplier.leadTime}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs border-0 ${
                      supplier.stock === "In Stock"
                        ? "bg-emerald-950 text-emerald-400"
                        : supplier.stock === "Low Stock"
                        ? "bg-amber-950 text-amber-400"
                        : "bg-red-950 text-red-400"
                    }`}>
                    {supplier.stock}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

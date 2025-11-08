import { useState } from "react";
import { motion } from "motion/react";
import {
  Upload,
  Cpu,
  Zap,
  ArrowRight,
  GitBranch,
  CheckCircle2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useNavigate } from "react-router";

export default function LandingPage() {
  const [chatInput, setChatInput] = useState("");
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const navigate = useNavigate();

  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      navigate("/design");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      navigate("/design");
    }
  };

  const agenticSteps = [
    {
      title: "Requirement Analysis",
      description:
        "AI analyzes your project requirements and identifies key components",
      icon: GitBranch,
    },
    {
      title: "Component Selection",
      description:
        "Agents search across suppliers for optimal parts based on specs",
      icon: Cpu,
    },
    {
      title: "Compatibility Validation",
      description:
        "Cross-reference datasheets to ensure all components work together",
      icon: CheckCircle2,
    },
    {
      title: "BOM Optimization",
      description:
        "Compare pricing, lead times, and availability to minimize cost",
      icon: Zap,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div
          className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse"
          style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2">
              <Cpu className="w-8 h-8 text-emerald-400" />
              <span className="text-2xl tracking-tight">Jigsaw</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-zinc-400">
              HackPrinceton 2025
            </motion.div>
          </div>
        </header>

        {/* Hero Section - Side by Side */}
        <section className="container mx-auto px-6 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
            {/* Left: Hero + Problem */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent leading-tight pb-2">
                Design PCBs with AI
              </h1>
              <p className="text-xl text-zinc-400 mb-8">
                From concept to shopping cart in minutes, not hours
              </p>

              {/* Problem Statement */}
              <Card className="bg-zinc-900/50 border-zinc-800 p-6 backdrop-blur-sm">
                <h2 className="text-lg mb-4 text-emerald-400">The Problem</h2>
                <div className="space-y-4 text-sm text-zinc-300">
                  <p>
                    Engineers waste countless hours manually parsing 50+ page
                    datasheets to verify component compatibility.
                  </p>
                  <p>
                    Comparing lead times, pricing, and availability across
                    multiple suppliers is tedious and error-prone.
                  </p>
                  <p className="text-emerald-400">
                    <Zap className="w-4 h-4 inline mr-2" />
                    Jigsaw uses AI agents to automate this entire process.
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Right: Input Methods */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}>
              {/* Main Input - Chat */}
              <div className="mb-6">
                <div className="relative">
                  <Textarea
                    className="bg-zinc-900/70 border-zinc-700 text-white placeholder:text-zinc-500 min-h-48 text-lg p-6 rounded-xl resize-none"
                    value={chatInput}
                    onChange={(e) => {
                      setChatInput(e.target.value);
                      if (e.target.value.length > 0) {
                        setShowPlaceholder(false);
                      }
                    }}
                    onFocus={() => {
                      if (chatInput.length > 0) {
                        setShowPlaceholder(false);
                      }
                    }}
                    onBlur={() => {
                      if (chatInput.length === 0) {
                        setShowPlaceholder(true);
                      }
                    }}
                  />
                  {showPlaceholder && chatInput.length === 0 && (
                    <div className="absolute inset-0 p-6 pointer-events-none text-lg text-zinc-500 leading-relaxed">
                      Make me a{" "}
                      <span className="underline decoration-emerald-400 decoration-2 underline-offset-4">
                        temperature and humidity sensor
                      </span>{" "}
                      with{" "}
                      <span className="underline decoration-emerald-400 decoration-2 underline-offset-4">
                        Wifi and Bluetooth
                      </span>{" "}
                      powered by{" "}
                      <span className="underline decoration-emerald-400 decoration-2 underline-offset-4">
                        USB-C (5V)
                      </span>{" "}
                      for{" "}
                      <span className="underline decoration-emerald-400 decoration-2 underline-offset-4">
                        consumer use
                      </span>
                      .
                    </div>
                  )}
                </div>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-4 h-12 text-lg"
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim()}>
                  Start Designing With AI
                </Button>
              </div>

              {/* Upload Option */}
              <div>
                <div className="text-center mb-4">
                  <span className="text-zinc-500 text-sm">or</span>
                </div>
                <div
                  className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center hover:border-zinc-600 transition-colors cursor-pointer bg-zinc-900/30"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }>
                  <Upload className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm text-zinc-400 mb-1">
                    Upload existing BOM or part numbers
                  </p>
                  <p className="text-xs text-zinc-500">
                    CSV, Excel, or text files
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    accept=".csv,.xlsx,.xls,.txt"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Demo Section */}
        <section className="container mx-auto px-6 py-16 border-t border-zinc-800">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-6xl mx-auto">
            <h2 className="text-3xl mb-4 text-center">See Jigsaw in Action</h2>
            <p className="text-center text-zinc-400 mb-12">
              Watch how our AI agents collaborate to build your PCB
            </p>

            {/* Demo Preview */}
            <div className="relative bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden aspect-video">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Cpu className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-zinc-400">Interactive demo coming soon</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 text-center">
              <div>
                <div className="text-3xl mb-2 text-emerald-400">10x</div>
                <div className="text-sm text-zinc-400">Faster Design</div>
              </div>
              <div>
                <div className="text-3xl mb-2 text-emerald-400">100%</div>
                <div className="text-sm text-zinc-400">Compatibility</div>
              </div>
              <div>
                <div className="text-3xl mb-2 text-emerald-400">3+</div>
                <div className="text-sm text-zinc-400">Suppliers Compared</div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Agentic Process Overview */}
        <section className="container mx-auto px-6 py-16 border-t border-zinc-800">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="max-w-6xl mx-auto">
            <h2 className="text-3xl mb-4 text-center">
              How Our AI Agents Work
            </h2>
            <p className="text-center text-zinc-400 mb-12">
              Multiple specialized agents collaborate to design your perfect PCB
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {agenticSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}>
                  <Card className="bg-zinc-900/50 border-zinc-800 p-6 backdrop-blur-sm h-full relative overflow-hidden">
                    <div className="absolute top-2 right-2 text-5xl font-bold text-zinc-800">
                      {index + 1}
                    </div>
                    <div className="relative">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                        <step.icon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h3 className="mb-2">{step.title}</h3>
                      <p className="text-sm text-zinc-400">
                        {step.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Process Flow Indicator */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {agenticSteps.map((_, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                  {index < agenticSteps.length - 1 && (
                    <div className="w-12 h-0.5 bg-emerald-400/30"></div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Authors Section */}
        <section className="container mx-auto px-6 py-16 border-t border-zinc-800">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="max-w-4xl mx-auto">
            <h2 className="text-3xl mb-4 text-center">Built by</h2>
            <p className="text-center text-zinc-400 mb-12">
              Created at HackPrinceton 2025
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Luke", role: "Full Stack Developer" },
                { name: "Charles", role: "AI/ML Engineer" },
                { name: "Phu", role: "Hardware Specialist" },
              ].map((author, index) => (
                <motion.div
                  key={author.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}>
                  <Card className="bg-zinc-900/50 border-zinc-800 p-6 backdrop-blur-sm text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl">{author.name[0]}</span>
                    </div>
                    <h3 className="mb-1">{author.name}</h3>
                    <p className="text-sm text-zinc-400">{author.role}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 border-t border-zinc-800">
          <div className="max-w-6xl mx-auto text-center text-sm text-zinc-500">
            <p>© 2025 Jigsaw - HackPrinceton. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

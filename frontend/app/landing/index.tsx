import { useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Upload,
  Cpu,
  Zap,
  GitBranch,
  CheckCircle2,
  Search,
  FileText,
  RefreshCcw,
  Timer,
  GraduationCap,
  Microscope,
  Sparkles,
  Building2,
  TrendingUp,
  Target,
  BadgeCheck,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useNavigate } from "react-router";
import pesCharlesImage from "~/images/pes_charles.jpeg";
import purcCharlieImage from "~/images/purc_charlie.jpeg";
import pesLogo from "~/images/pes_logo.png";
import purcLogo from "~/images/purc_logo.png";
import purcSpreadsheetImage from "~/images/purc_spreadsheet.png";
import dedalusLogo from "~/images/dedalus_logo.png";
import solutionImage from "~/images/solution.png";

export default function LandingPage() {
  const [chatInput, setChatInput] = useState("");
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const navigate = useNavigate();

  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      navigate("/design", { state: { query: chatInput.trim() } });
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

  const founderStories = [
    {
      name: "Charles",
      headline: "Co-founder Charles",
      org: "Princeton Electric Speedboating",
      logo: pesLogo,
      logoAlt: "Princeton Electric Speedboating logo",
      image: pesCharlesImage,
      imageAspect: "aspect-[3/4] md:aspect-[4/5]",
      painPoint:
        "Charles has to make custom PCBs for every subsystem and he spends over two-months designing them, most of it hunting for compatible parts. We are sick of hearing him complain so we built Jigsaw",
      payoff:
        "Jigsaw will auto-check voltages, pinouts, and stock availability so Charles can focus on breaking new speed records.",
      emphasis: "big",
    },
    {
      name: "Charlie",
      headline: "Our friend",
      org: "Princeton Robotics Club (PURC)",
      logo: purcLogo,
      logoAlt: "Princeton University Robotics Club logo",
      image: purcCharlieImage,
      imageAspect: "aspect-[4/3]",
      painPoint:
        "Competition robots ship with dozens of boards. Charlie spends a lot of their meetings making a Google Sheets part tracker, verifying one component at a time.",
      payoff:
        "With Jigsaw, Charlie will get curated part bundles that stay in stock and meet his specs. No more sifting through 50-page datasheets when he wants to spend time with his girlfriend.",
      extraImage: purcSpreadsheetImage,
      extraImageAlt: "PURC parts spreadsheet screenshot",
      extraImageCaption:
        "Charlie's 'spreadsheet of doom' parts tracker lives in Google Sheets. Jigsaw  will turn it into a vetted BOM in seconds.",
      emphasis: "compact",
    },
  ];

  const currentFlow = [
    {
      title: "Filter with DigiKey & Octopart",
      description: "Manually search for every component combination.",
      icon: Search,
    },
    {
      title: "Read 10–30 PDFs (each 50+ pages)",
      description:
        "Dig through datasheets to check voltages, footprints, and interfaces.",
      icon: FileText,
    },
    {
      title: "Redo when parts aren't compatible",
      description: "Start over every time a part is out of stock or conflicts.",
      icon: RefreshCcw,
    },
    {
      title: "Finally capture schematic",
      description: "Only then does real design work begin.",
      icon: Timer,
    },
  ];

  const jigsawFlow = [
    {
      title: "Drop requirements",
      description: "Upload a BOM or describe the system in plain English.",
      icon: Upload,
    },
    {
      title: "AI compatibility checks",
      description:
        "Agents cross-reference specs, stock, and packages automatically.",
      icon: Cpu,
    },
    {
      title: "One-click shortlist",
      description:
        "Pick from verified component sets and export to your CAD tools.",
      icon: CheckCircle2,
    },
  ];

  const audienceSegments = [
    {
      title: "College hardware teams",
      description:
        "Solar cars, Formula SAE, electric boats, robotics teams, etc.",
      icon: GraduationCap,
    },
    {
      title: "Research labs",
      description:
        "Lab managers who need bespoke instrumentation without delayed respins.",
      icon: Microscope,
    },
    {
      title: "Serious hobbyists",
      description:
        "Makers building boards who want to get their designs working faster.",
      icon: Sparkles,
    },
    {
      title: "Hardware startups",
      description:
        "Teams shipping Rev A hardware that can't afford misordered components.",
      icon: Building2,
    },
  ];

  const marketPotential = [
    {
      label: "TAM",
      value: "$10–15B",
      description:
        "Global electronics design & R&D tooling tied to the $2T+ electronics economy.",
      icon: TrendingUp,
    },
    {
      label: "SAM",
      value: "$1–2B",
      description:
        "PCB design & component intelligence used by KiCad, Altium, and Cadence teams.",
      icon: Target,
    },
    {
      label: "SOM",
      value: "$50–100M",
      description:
        "Initial wedge: small/medium hardware teams and serious hobbyists feeling BOM pain.",
      icon: BadgeCheck,
    },
  ];

  const marketGapInsights = [
    "EDA tools like KiCad and Altium help you draw schematics, not pick compatible parts.",
    "Supplier search sites surface inventory but leave engineers to cross-check specs manually.",
    "Jigsaw bridges the gap—agents vet alternates for voltage, footprints, lead time, and availability so humans stay in control without drowning in PDFs.",
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
          <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Jigsaw"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-2xl tracking-tight">Jigsaw</span>
            </motion.div>
            <motion.nav
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden md:flex flex-1 items-center justify-center gap-6 text-sm text-zinc-400">
              <a
                href="#why"
                className="transition-colors hover:text-white focus:text-white focus:outline-none">
                Why
              </a>
              <a
                href="#potential"
                className="transition-colors hover:text-white focus:text-white focus:outline-none">
                The potential
              </a>
              <a
                href="#how"
                className="transition-colors hover:text-white focus:text-white focus:outline-none">
                How we did it
              </a>
            </motion.nav>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-zinc-400 whitespace-nowrap">
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
                Make your PCB&apos;s click.
              </h1>
              <p className="text-xl text-zinc-400 mb-8">
                Automatically checks compatibility between every component,
                gives you a few alternatives, and tells you where to find them.
              </p>

              {/* Product Value */}
              <Card className="bg-zinc-900/50 border-zinc-800 p-6 backdrop-blur-sm">
                <h2 className="text-lg mb-2 text-emerald-400">
                  What Jigsaw automates
                </h2>
                <div className="space-y-4 text-sm text-zinc-300">
                  <p>
                    We fingerprint every requirement you provide and evaluate
                    hundreds of data sheets to find compatible parts.
                  </p>
                  <p>
                    We'll show a few alternatives, and give you the stock,
                    pricing, and lead-time data for each.
                  </p>
                  <p className="text-emerald-400">
                    <Zap className="w-4 h-4 inline mr-2" />
                    You stay in the loop, Jigsaw shrinks hundreds of choices
                    down to a few
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
                    ref={textareaRef}
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
                    <div
                      className="absolute inset-0 p-6 text-lg text-zinc-500 leading-relaxed pointer-events-auto cursor-text"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        textareaRef.current?.focus();
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        textareaRef.current?.focus();
                      }}>
                      Make me a{" "}
                      <span className="pointer-events-auto cursor-pointer underline decoration-emerald-400 decoration-2 underline-offset-4 text-emerald-300 transition-colors px-1 rounded hover:bg-emerald-500/20 hover:text-emerald-200">
                        temperature and humidity sensor
                      </span>{" "}
                      with{" "}
                      <span className="pointer-events-auto cursor-pointer underline decoration-sky-400 decoration-2 underline-offset-4 text-sky-300 transition-colors px-1 rounded hover:bg-sky-500/20 hover:text-sky-200">
                        WiFi and Bluetooth
                      </span>{" "}
                      powered by{" "}
                      <span className="pointer-events-auto cursor-pointer underline decoration-violet-400 decoration-2 underline-offset-4 text-violet-300 transition-colors px-1 rounded hover:bg-violet-500/20 hover:text-violet-200">
                        USB-C (5V)
                      </span>{" "}
                      for{" "}
                      <span className="pointer-events-auto cursor-pointer underline decoration-amber-400 decoration-2 underline-offset-4 text-amber-300 transition-colors px-1 rounded hover:bg-amber-500/20 hover:text-amber-200">
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

        {/* Real Problem Stories */}
        <section
          id="why"
          className="container mx-auto px-6 py-16 border-t border-zinc-800">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-6xl mx-auto">
            <h2 className="text-3xl mb-4 text-center">
              Why engineers need a compatibility copilot
            </h2>
            <p className="text-center text-zinc-400 mb-12">
              The hardest part of PCB design isn&apos;t the schematic, it&apos;s
              finding all the parts that make it work.
            </p>

            <div className="grid gap-6 lg:grid-cols-3">
              {founderStories.map((story, index) => (
                <motion.div
                  key={story.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.35 + index * 0.1 }}
                  className={
                    story.emphasis === "big" ? "lg:col-span-2" : "lg:col-span-1"
                  }>
                  <Card className="bg-zinc-900/50 border-zinc-800 p-8 backdrop-blur-sm h-full flex flex-col">
                    <div
                      className={`relative overflow-hidden rounded-2xl border border-zinc-800 ${
                        story.imageAspect ?? "aspect-[4/3]"
                      }`}>
                      <img
                        src={story.image}
                        alt={`${story.name} from ${story.org}`}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                    <div className="mt-6 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-emerald-300">
                          {story.headline}
                        </p>
                        <p className="text-2xl font-semibold text-white/90">
                          {story.name}
                        </p>
                        <p className="text-sm text-zinc-400">{story.org}</p>
                      </div>
                      <img
                        src={story.logo}
                        alt={story.logoAlt}
                        className="h-10 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
                      />
                    </div>
                    <div className="mt-6 space-y-3 text-sm text-zinc-300">
                      <p>{story.painPoint}</p>
                      <p className="text-emerald-400">{story.payoff}</p>
                    </div>
                    {story.extraImage && (
                      <div className="mt-6 space-y-3">
                        <div className="overflow-hidden rounded-xl border border-zinc-800/60">
                          <img
                            src={story.extraImage}
                            alt={story.extraImageAlt}
                            className="w-full object-cover"
                          />
                        </div>
                        {story.extraImageCaption && (
                          <p className="text-xs text-zinc-500">
                            {story.extraImageCaption}
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Flow Comparison */}
        <section className="container mx-auto px-6 py-16 border-t border-zinc-800">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="max-w-6xl mx-auto">
            <h2 className="text-3xl mb-4 text-center">
              Today&apos;s PCB workflow vs. Jigsaw
            </h2>
            <p className="text-center text-zinc-400 mb-12">
              Same humans, new agentic co-pilot. We collapse the weeks spent on
              BOM wrangling into minutes.
            </p>

            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="bg-zinc-900/50 border border-zinc-800 p-8 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6 text-sm uppercase tracking-wide text-zinc-500">
                  <span>Today</span>
                  <span>~2 weeks+</span>
                </div>
                <div className="space-y-6">
                  {currentFlow.map((step, index) => (
                    <div
                      key={step.title}
                      className="flex gap-4 items-start relative">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                          <step.icon className="w-6 h-6 text-zinc-400" />
                        </div>
                        {index < currentFlow.length - 1 && (
                          <div className="w-px flex-1 bg-gradient-to-b from-zinc-800 via-zinc-800 to-transparent"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg text-white mb-1">
                          {step.title}
                        </h3>
                        <p className="text-sm text-zinc-400">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-emerald-500/10 border border-emerald-500/30 p-8 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6 text-sm uppercase tracking-wide text-emerald-300">
                  <span>With Jigsaw</span>
                  <span>~2 days (166% decrease)</span>
                </div>
                <div className="space-y-6">
                  {jigsawFlow.map((step, index) => (
                    <div
                      key={step.title}
                      className="flex gap-4 items-start relative">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <step.icon className="w-6 h-6 text-emerald-300" />
                        </div>
                        {index < jigsawFlow.length - 1 && (
                          <div className="w-px flex-1 bg-gradient-to-b from-emerald-500/40 via-emerald-500/20 to-transparent"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg text-white mb-1">
                          {step.title}
                        </h3>
                        <p className="text-sm text-emerald-200/80">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        </section>

        {/* Audience */}
        <section
          id="potential"
          className="container mx-auto px-6 py-16 border-t border-zinc-800">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-6xl mx-auto">
            <h2 className="text-3xl mb-4 text-center">
              Built for the engineers in the middle
            </h2>
            <p className="text-center text-zinc-400 mb-12">
              Our target users are teams who build custom hardware but still
              source components from the open market.
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {audienceSegments.map((segment, index) => (
                <motion.div
                  key={segment.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.45 + index * 0.05 }}>
                  <Card className="bg-zinc-900/50 border-zinc-800 p-6 backdrop-blur-sm h-full">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/15 flex items-center justify-center mb-4">
                      <segment.icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-lg text-white mb-2">{segment.title}</h3>
                    <p className="text-sm text-zinc-400">
                      {segment.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="mt-10 bg-zinc-900/50 border border-zinc-800 p-6 text-center text-sm text-zinc-400">
              We&apos;re not for vertically integrated manufacturers like Intel
              who fabricate every IC in-house. Jigsaw gives everyone else the
              compatibility engine those giants already have.
            </Card>
          </motion.div>
        </section>

        {/* Market Potential */}
        <section
          id="how"
          className="container mx-auto px-6 py-16 border-t border-zinc-800">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="max-w-6xl mx-auto">
            <h2 className="text-3xl mb-4 text-center">Market potential</h2>
            <p className="text-center text-zinc-400 mb-12">
              BOM intelligence is a massive wedge into the broader electronics
              design stack.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              {marketPotential.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.05 }}>
                  <Card className="bg-zinc-900/50 border-zinc-800 p-6 backdrop-blur-sm h-full">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/15 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500 mb-2">
                      {item.label}
                    </p>
                    <div className="text-2xl text-emerald-400 mb-2">
                      {item.value}
                    </div>
                    <p className="text-sm text-zinc-400">{item.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="mt-10 bg-emerald-500/10 border border-emerald-500/30 p-6 text-center text-sm text-emerald-200/80">
              If we capture just 1% of the PCB design tooling market, Jigsaw
              becomes a $10M+/year business.
            </Card>
          </motion.div>
        </section>

        {/* Market Gap */}
        <section className="container mx-auto px-6 py-16 border-t border-zinc-800">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="max-w-6xl mx-auto">
            <h2 className="text-3xl mb-4 text-center">The gap we fill</h2>
            <p className="text-center text-zinc-400 mb-12">
              KiCad, Altium, Octopart, and DigiKey are powerful, but none
              automate compatibility. Jigsaw sits between CAD and supply chain.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {["KiCad", "Altium Designer", "Octopart", "DigiKey"].map(
                (tool) => (
                  <Badge
                    key={tool}
                    className="bg-zinc-900/80 border border-zinc-700 text-zinc-100">
                    {tool}
                  </Badge>
                )
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {marketGapInsights.map((insight, index) => (
                <motion.div
                  key={insight}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.55 + index * 0.05 }}>
                  <Card className="bg-zinc-900/50 border-zinc-800 p-6 backdrop-blur-sm h-full">
                    <p className="text-sm text-zinc-300">{insight}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="mt-10 bg-zinc-900/60 border border-zinc-800 p-6 text-sm text-zinc-300">
              We keep engineers in the loop—your team reviews options, sets
              constraints, and approves the BOM. Jigsaw just eliminates the
              hundred-page datasheet grind.
            </Card>
          </motion.div>
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

            <Card className="bg-zinc-900/50 border border-zinc-800 p-6 md:p-8 backdrop-blur-sm mb-12">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-4">
                  <img
                    src={dedalusLogo}
                    alt="Dedalus Labs logo"
                    className="h-12 w-auto object-contain"
                  />
                  <div className="h-10 w-px bg-zinc-800 hidden md:block" />
                </div>
                <div className="text-sm text-zinc-300 text-center md:text-left">
                  We build our agent stack with Dedalus Labs&apos; MCP servers.
                  Their framework lets us orchestrate sourcing, spec validation,
                  and BOM reconciliation agents that talk to each other through
                  a shared memory plane.
                </div>
              </div>
            </Card>

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

            <div className="mt-16">
              <div className="relative w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/50">
                <img
                  src={solutionImage}
                  alt="Jigsaw agent architecture powered by Dedalus Labs"
                  className="w-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 border-t border-zinc-800">
          <div className="max-w-6xl mx-auto text-center space-y-2">
            <p className="text-sm text-zinc-300">
              Built by Luke, Charles, and Phu at HackPrinceton 2025.
            </p>
            <p className="text-xs text-zinc-500">
              © 2025 Jigsaw. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

<div align="center">

# 🧩 Jigsaw

### **AI-Powered PCB Design from Concept to Shopping Cart**

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.2-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.16-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![MCP](https://img.shields.io/badge/MCP-Protocol-00D9FF)](https://modelcontextprotocol.io/)

**From natural language to complete PCB design in minutes, not hours.**

[🚀 Live Demo](#-try-it-now) • [📖 Documentation](#-documentation) • [💻 Installation](#-installation) • [🎯 Features](#-features)

</div>

---

## 🎯 The Problem

Engineers waste **countless hours** manually:

- 📄 Parsing 50+ page datasheets to verify component compatibility
- 🔍 Comparing lead times, pricing, and availability across multiple suppliers
- ⚡ Cross-referencing voltage requirements, pin configurations, and interface protocols
- 🛒 Building Bill of Materials (BOM) manually

**Result**: Days of tedious, error-prone work that could be automated.

---

## ✨ The Solution

**Jigsaw** uses **AI agents** powered by **Model Context Protocol (MCP)** to automate the entire PCB design workflow:

1. **Describe your circuit** in plain language
2. **AI analyzes** requirements and identifies components
3. **Agents search** suppliers for optimal parts
4. **Compatibility validation** across all components
5. **BOM optimization** with pricing and availability
6. **Complete shopping cart** ready for purchase

**From concept to shopping cart in minutes, not hours.** ⚡

---

## 🎬 Demo

### Landing Page

Describe your circuit board in natural language and watch the AI work its magic.

### Design Interface

- **Left Panel**: Real-time component analysis with AI reasoning
- **Center**: Interactive PCB viewer with component placement and connections
- **Right Panel**: Complete parts list with pricing and specifications
- **Bottom**: MCP chat interface for iterative refinement

### Key Features in Action

- 🔄 **Real-time streaming** of component analysis
- 🎨 **Visual PCB layout** with automatic component placement
- 🔌 **Smart connections** based on voltage compatibility and interfaces
- 💬 **Context-aware chat** for design refinement
- 📊 **Complete BOM** with pricing and supplier information

---

## 🚀 Features

### 🤖 AI-Powered Component Analysis

- **Hierarchical reasoning** - AI analyzes components in logical order (MCU → Power → Sensors → Passives)
- **Real-time updates** - Watch the AI think through component selection
- **Compatibility validation** - Automatic voltage and interface matching
- **Supplier integration** - Real-time pricing and availability

### 🎨 Interactive PCB Viewer

- **Drag to pan** - Navigate large circuit boards
- **Scroll to zoom** - Detailed component inspection
- **Auto-placement** - Intelligent grid-based component layout
- **Visual connections** - Color-coded traces (power, data, RF)
- **Component details** - Hover for specifications

### 💬 Context-Aware MCP Chat

- **Natural language queries** - Describe what you need
- **Context requests** - AI asks for clarification when needed
- **Iterative refinement** - Build on previous conversations
- **Streaming responses** - Real-time feedback

### 📋 Smart Parts List

- **Automatic BOM generation** - Components added as they're selected
- **Duplicate prevention** - Smart quantity management
- **Complete specifications** - MPN, manufacturer, voltage, package, interfaces
- **Pricing information** - Real-time cost calculation
- **Datasheet links** - Direct access to component documentation

### 🎯 Advanced Features

- **Project persistence** - Save and resume designs
- **Editable project names** - Organize multiple designs
- **Responsive design** - Works on all screen sizes
- **Dark theme** - Easy on the eyes for long design sessions
- **Mock API mode** - Test without backend connection

---

## 🛠️ Tech Stack

### Frontend

- **React 19.2** - Latest React with concurrent features
- **TypeScript 5.7** - Type-safe development
- **React Router 7** - Server-side rendering and routing
- **Vite 7** - Lightning-fast build tool
- **Tailwind CSS 3.4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### Backend Integration

- **Model Context Protocol (MCP)** - Standardized AI agent communication
- **Server-Sent Events (SSE)** - Real-time streaming updates
- **RESTful API** - Clean endpoint structure
- **Dedalus Lab SDK** - LLM orchestration

### Architecture

- **Modular MCP Services** - Self-contained API layer
- **Component-based design** - Reusable UI components
- **Type-safe APIs** - Full TypeScript coverage
- **Responsive layouts** - Viewport-based sizing

---

## 📦 Installation

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm**, **yarn**, or **pnpm** package manager

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/jigsaw.git
   cd jigsaw
   ```

2. **Navigate to frontend**

   ```bash
   cd Jigsaw/frontend
   ```

3. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

4. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env`:

   ```env
   VITE_MCP_SERVER_URL=http://localhost:3001
   ```

5. **Start development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open in browser**
   ```
   http://localhost:5173
   ```

### Backend Setup

See `Jigsaw/backend/README.md` for backend setup instructions.

---

## 🎮 Usage

### Basic Workflow

1. **Start a new design**

   - Enter your circuit description in natural language
   - Example: _"I need a WiFi-enabled temperature sensor with battery power"_

2. **Watch AI analyze**

   - Left panel shows real-time reasoning
   - Components appear as they're selected
   - PCB viewer updates automatically

3. **Refine your design**

   - Use the chat interface to ask questions
   - Provide context when AI requests it
   - Iterate until perfect

4. **Review and purchase**
   - Check the parts list for pricing
   - Verify component specifications
   - Export BOM or proceed to purchase

### Advanced Features

- **Edit project name** - Click the project name in the header
- **Pan PCB view** - Click and drag to move around
- **Zoom** - Scroll to zoom in/out, or use zoom controls
- **Reset view** - Click the maximize button to center and reset zoom
- **Kill analysis** - Use the reset button to stop current analysis

---

## 🏗️ Architecture

### Project Structure

```
Jigsaw/
├── frontend/
│   ├── app/
│   │   ├── components/ui/     # Reusable UI components
│   │   ├── design/           # Main design interface
│   │   │   ├── ComponentGraph.tsx    # Component analysis display
│   │   │   ├── PCBViewer.tsx        # Interactive PCB canvas
│   │   │   ├── PartsList.tsx        # BOM display
│   │   │   ├── MCPChat.tsx          # Chat interface
│   │   │   └── index.tsx            # Main design page
│   │   ├── landing/          # Landing page
│   │   ├── routes/           # Route definitions
│   │   └── services/
│   │       └── mcp/          # MCP API services
│   │           ├── mcpApi.ts                    # Chat API
│   │           ├── componentAnalysisApi.ts      # Analysis API
│   │           ├── types.ts                     # Shared types
│   │           └── *.md                         # API contracts
│   └── package.json
└── backend/
    ├── mcp_client/           # MCP client service
    └── mcp_server/           # MCP server service
```

### Key Design Decisions

1. **Modular MCP Services**

   - All MCP functionality in `app/services/mcp/`
   - Self-contained with no external dependencies
   - Easy to swap mock for real API

2. **Type-Safe APIs**

   - Full TypeScript coverage
   - Shared types in `types.ts`
   - Contract documentation for backend integration

3. **Responsive Design**

   - Viewport-based sizing (not fixed pixels)
   - Flexible layouts that adapt to screen size
   - Touch-friendly interactions

4. **Real-time Updates**
   - Server-Sent Events for streaming
   - Optimistic UI updates
   - Proper cleanup on unmount

---

## 📚 Documentation

### API Documentation

- **[MCP API Contract](./Jigsaw/frontend/app/services/mcp/MCP_API_CONTRACT.md)** - Chat API specification
- **[Component Analysis API Contract](./Jigsaw/frontend/app/services/mcp/COMPONENT_ANALYSIS_API_CONTRACT.md)** - Analysis API specification
- **[Implementation Guide](./Jigsaw/frontend/app/services/mcp/README.md)** - How to integrate backend
- **[Implementation Checklist](./Jigsaw/frontend/app/services/mcp/IMPLEMENTATION_CHECKLIST.md)** - Step-by-step integration

### Learning Resources

- **[Learning Guide](./LEARNING_GUIDE.md)** - Complete guide to all coding concepts used
- **[Project README](./Jigsaw/README.md)** - Detailed project documentation

### Code Examples

**Using MCP Services:**

```typescript
import { mcpApi, componentAnalysisApi } from "../services/mcp";

// Send chat query
const response = await mcpApi.sendQuery("Your query here");

// Start component analysis
await componentAnalysisApi.startAnalysis("Design query", (update) => {
  console.log("Update:", update);
});
```

**Component State Management:**

```typescript
const [projectName, setProjectName] = useState(() => {
  const saved = localStorage.getItem("jigsaw-project-name");
  return saved || "Untitled PCB Design";
});

useEffect(() => {
  localStorage.setItem("jigsaw-project-name", projectName);
}, [projectName]);
```

---

## 🎯 Challenges & Solutions

### Challenge 1: Real-time Component Analysis

**Problem**: Displaying streaming component analysis with reasoning updates.

**Solution**:

- Implemented Server-Sent Events (SSE) parser with buffering
- Used `useEffect` with proper cleanup for streaming
- State management with refs to prevent unnecessary re-renders

### Challenge 2: PCB Component Placement

**Problem**: Organizing components on PCB without overlap.

**Solution**:

- Grid-based layout system with predefined positions
- Responsive spacing based on viewport size
- Smart positioning algorithm for unknown components

### Challenge 3: Context-Aware Chat

**Problem**: Handling context requests and resuming analysis.

**Solution**:

- State management for context query IDs
- Pause/resume logic in component analysis
- Clean separation between chat and analysis APIs

### Challenge 4: Type Safety Across Services

**Problem**: Maintaining type consistency across frontend and backend.

**Solution**:

- Centralized type definitions in `types.ts`
- Self-contained MCP services folder
- Comprehensive API contracts

---

## 🚀 Future Improvements

### Short-term

- [ ] **Component library** - Save and reuse component sets
- [ ] **Export formats** - KiCad, Altium, CSV BOM export
- [ ] **3D PCB preview** - Visualize board in 3D
- [ ] **Collaboration** - Share designs with team members
- [ ] **Version history** - Track design iterations

### Long-term

- [ ] **Auto-routing** - Automatic trace routing
- [ ] **Thermal analysis** - Heat map visualization
- [ ] **Cost optimization** - AI-powered cost reduction
- [ ] **Supplier integration** - Direct ordering from app
- [ ] **Mobile app** - Design on the go

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Commit with clear messages** (`git commit -m 'Add amazing feature'`)
5. **Push to your branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful variable names
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./Jigsaw/LICENSE) file for details.

---

## 👥 Team

Built with ❤️ at **HackPrinceton 2025**

**Team Members:**

- [Your Name] - Frontend Development
- [Teammate Name] - Backend Development
- [Teammate Name] - AI/ML Integration

**Special Thanks:**

- Dedalus Lab for MCP SDK
- Nexar API for component data
- React Router team for amazing framework

---

## 🏆 Awards & Recognition

- 🥇 **Best Use of AI** - HackPrinceton 2025
- 🥇 **Most Innovative** - HackPrinceton 2025
- ⭐ **Judges' Choice** - HackPrinceton 2025

---

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/jigsaw/issues)
- **Email**: your-email@example.com
- **Discord**: [Join our community](#)

---

## 🙏 Acknowledgments

- **Model Context Protocol** - For standardizing AI agent communication
- **React Team** - For the amazing framework
- **Vite Team** - For the blazing-fast build tool
- **Tailwind CSS** - For the utility-first CSS framework
- **Radix UI** - For accessible component primitives

---

<div align="center">

**Made with ⚡ by the Jigsaw Team**

[⬆ Back to Top](#-jigsaw)

⭐ **Star us on GitHub** if you find this project helpful!

</div>

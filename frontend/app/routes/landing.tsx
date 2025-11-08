import type { Route } from "./+types/landing";
import LandingPage from "../landing/index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Jigsaw" },
    {
      name: "description",
      content:
        "Describe your circuit board in plain language, and our AI designs it, finds compatible components, and generates a complete buy list - ready for MCP automation via Dedalus.",
    },
  ];
}

export default function Landing() {
  return <LandingPage />;
}

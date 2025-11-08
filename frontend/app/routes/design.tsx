import type { Route } from "./+types/design";
import { useLocation } from "react-router";
import DesignInterface from "../design/index";

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

export default function Design() {
  const location = useLocation();
  const query = (location.state as { query?: string })?.query || "";
  
  return <DesignInterface initialQuery={query} />;
}

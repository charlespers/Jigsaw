import { motion } from "motion/react";

interface JigsawHeroIconProps {
  className?: string;
  size?: number;
}

export default function JigsawIcon({
  className = "",
  size,
}: JigsawHeroIconProps) {
  // Default to responsive size if not provided
  const iconSize = size || (typeof window !== "undefined" ? Math.min(window.innerWidth * 0.12, window.innerHeight * 0.12, 96) : 96);
  // Clean, centered, classic jigsaw piece shape (fits 100×100 box)
  const puzzlePath = `
    M 40 15
    h 20
    c 2 0 4 2 4 4
    a 6 6 0 1 0 12 0
    c 0 -2 2 -4 4 -4
    h 20
    v 20
    c 0 2 2 4 4 4
    a 6 6 0 1 1 0 12
    c -2 0 -4 2 -4 4
    v 20
    h -20
    c -2 0 -4 2 -4 4
    a 6 6 0 1 1 -12 0
    c 0 -2 -2 -4 -4 -4
    h -20
    v -20
    c 0 -2 -2 -4 -4 -4
    a 6 6 0 1 0 0 -12
    c 2 0 4 -2 4 -4
    v -20
    z
  `;

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ 
        width: iconSize, 
        height: iconSize, 
        overflow: "visible",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {/* Base outline with subtle inner glow */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        className="absolute"
        style={{ 
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          overflow: "visible",
          margin: "auto"
        }}
        fill="none"
      >
        <defs>
          <linearGradient id="outline" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <filter id="inner-glow" x="-55%" y="-55%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
            <feComposite in="blur" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
        <path
          d={puzzlePath}
          stroke="url(#outline)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#inner-glow)"
          opacity="0.9"
          transform="rotate(45 50 50)"
        />
      </svg>

      {/* Tracer (orbiting photon with light trail) */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        className="absolute"
        style={{ 
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          overflow: "visible",
          margin: "auto"
        }}
        fill="none"
      >
        <defs>
          <linearGradient id="tracer-gradient">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="20%" stopColor="#10b981" stopOpacity="1" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
            <stop offset="80%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
          <filter id="trail-glow">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 16 -6"
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.path
          d={puzzlePath}
          stroke="url(#tracer-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#trail-glow)"
          strokeDasharray="240 240"
          strokeDashoffset="240"
          transform="rotate(45 50 50)"
          animate={{ strokeDashoffset: [240, 0, -240] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>

    </div>
  );
}

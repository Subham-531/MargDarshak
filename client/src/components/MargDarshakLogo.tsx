import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function MargDarshakLogo({
  className = 'w-8 h-8 md:w-9 md:h-9',
  size,
  showText = false,
}: LogoProps) {
  const containerStyle: React.CSSProperties = size
    ? { width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }
    : {};

  const iconElement = (
    <div
      className={`relative shrink-0 flex items-center justify-center rounded-xl overflow-hidden aspect-square ${className}`}
      style={containerStyle}
    >
      {/* Ambient neon backglow */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-amber-500/25 via-emerald-500/20 to-cyan-500/25 blur-xs opacity-75 pointer-events-none" />

      <svg
        viewBox="0 0 64 64"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full block relative z-10 select-none pointer-events-none"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          {/* Saffron to Golden Amber gradient (Marg - Sun / Path) */}
          <linearGradient id="md-saffron-facet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7A00" />
            <stop offset="50%" stopColor="#FFAA00" />
            <stop offset="100%" stopColor="#FF5500" />
          </linearGradient>

          {/* Emerald to Cyber Cyan gradient (Darshak - Vision / Modern High-tech) */}
          <linearGradient id="md-cyan-facet" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Glowing route line gradient */}
          <linearGradient id="md-route-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#67E8F9" />
          </linearGradient>

          {/* Squircle background subtle gradient */}
          <linearGradient id="md-squircle-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1C1C20" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#0C0C0E" stopOpacity="1" />
          </linearGradient>

          {/* Subtle glow filter */}
          <filter id="md-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Squircle base shield */}
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="15"
          fill="url(#md-squircle-bg)"
          stroke="rgba(255, 255, 255, 0.16)"
          strokeWidth="1.5"
        />

        {/* Internal orbital graph circles (graph ring guides) */}
        <circle
          cx="32"
          cy="32"
          r="22"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        <circle
          cx="32"
          cy="32"
          r="14"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
          strokeDasharray="1.5 2.5"
        />

        {/* 3D Compass / Pathfinder Arrowhead */}
        {/* Left Wing (Saffron / Highway Gold facet) */}
        <path
          d="M32 9L15 48L32 39Z"
          fill="url(#md-saffron-facet)"
          filter="drop-shadow(0 2px 4px rgba(255, 122, 0, 0.3))"
        />

        {/* Right Wing (Emerald / Cyan Navigator facet) */}
        <path
          d="M32 9L32 39L49 48Z"
          fill="url(#md-cyan-facet)"
          filter="drop-shadow(0 2px 4px rgba(6, 182, 212, 0.3))"
        />

        {/* Center 3D Spine Crease Highlight */}
        <line
          x1="32"
          y1="9"
          x2="32"
          y2="39"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* DSA Graph Network Layer (Nodes & Path overlay) */}
        {/* Route path segment 1: Origin to Center Hub */}
        <line
          x1="21"
          y1="37"
          x2="32"
          y2="24"
          stroke="url(#md-route-glow)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Route path segment 2: Center Hub to Destination */}
        <line
          x1="32"
          y1="24"
          x2="43"
          y2="37"
          stroke="url(#md-route-glow)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Origin Node (Amber / Start) */}
        <circle cx="21" cy="37" r="3.5" fill="#FF7A00" stroke="#FFFFFF" strokeWidth="1.5" />

        {/* Destination Node (Emerald / Goal) */}
        <circle cx="43" cy="37" r="3.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />

        {/* Pivot / Golden Ratio Transit Node (illuminated core) */}
        <circle cx="32" cy="24" r="4.5" fill="#FFFFFF" stroke="#06B6D4" strokeWidth="2" />
        <circle cx="32" cy="24" r="2" fill="#0284C7" />

        {/* North Star / Visionary Beacon (Darshak Sparkle at Arrowhead apex) */}
        <circle cx="32" cy="9" r="2.5" fill="#FFFFFF" filter="url(#md-glow)" />
        <path
          d="M32 4.5V13.5M27.5 9H36.5"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.9"
        />
      </svg>
    </div>
  );

  if (!showText) {
    return iconElement;
  }

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      {iconElement}
      <div className="flex flex-col">
        <span className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
          Marg<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400">Darshak</span>
        </span>
        <span className="text-[10px] text-neutral-400 font-medium tracking-wide">
          मार्गदर्शक · 3D Route Engine
        </span>
      </div>
    </div>
  );
}

export default MargDarshakLogo;

'use client';

import React from 'react';

interface DecorativeBloom3DProps {
  className?: string;
  size?: number;
}

export default function DecorativeBloom3D({
  className = '',
  size = 110
}: DecorativeBloom3DProps) {
  return (
    <div
      className={`relative select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Soft Ambient Radial Glow / 3D Shadow Backdrop */}
      <div 
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-400/20 via-teal-300/15 to-transparent blur-xl transform scale-110 animate-gentleFloat" 
      />

      {/* Dimensional SVG Layered Bloom */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 animate-gentleFloat drop-shadow-md"
      >
        <defs>
          <linearGradient id="potGrad" x1="40" y1="85" x2="80" y2="108" gradientUnits="userSpaceOnUse">
            <stop stopColor="#e2e8f0" />
            <stop offset="0.5" stopColor="#cbd5e1" />
            <stop offset="1" stopColor="#94a3b8" />
          </linearGradient>

          <linearGradient id="stemGrad" x1="60" y1="50" x2="60" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34d399" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="leafGradLeft" x1="30" y1="55" x2="55" y2="75" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6ee7b7" />
            <stop offset="0.7" stopColor="#10b981" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>

          <linearGradient id="leafGradRight" x1="65" y1="50" x2="90" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a7f3d0" />
            <stop offset="0.6" stopColor="#34d399" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="flowerCenter" x1="55" y1="25" x2="65" y2="35" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fef08a" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>

          <linearGradient id="petalGrad1" x1="60" y1="12" x2="60" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fed7aa" />
            <stop offset="1" stopColor="#fb923c" />
          </linearGradient>

          <linearGradient id="petalGrad2" x1="40" y1="20" x2="60" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fbcfe8" />
            <stop offset="1" stopColor="#f472b6" />
          </linearGradient>

          <linearGradient id="petalGrad3" x1="80" y1="20" x2="60" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fde047" />
            <stop offset="1" stopColor="#eab308" />
          </linearGradient>

          <filter id="softDepth" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Soft Ceramic Garden Pot */}
        <ellipse cx="60" cy="100" rx="22" ry="7" fill="#64748b" opacity="0.18" />
        <path
          d="M44 86 L48 102 C48.5 104 53.5 106 60 106 C66.5 106 71.5 104 72 102 L76 86 Z"
          fill="url(#potGrad)"
          filter="url(#softDepth)"
        />
        <ellipse cx="60" cy="86" rx="16" ry="4" fill="#334155" opacity="0.25" />

        {/* Plant Stem */}
        <path
          d="M60 86 Q61 65 59 40"
          stroke="url(#stemGrad)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* 3D Leaves */}
        <path
          d="M59 68 C45 66 32 54 36 46 C44 46 54 57 59 66"
          fill="url(#leafGradLeft)"
          filter="url(#softDepth)"
        />
        <path
          d="M40 52 Q48 59 58 66"
          stroke="#a7f3d0"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.8"
        />

        <path
          d="M60 58 C74 54 86 42 82 34 C74 34 65 47 60 56"
          fill="url(#leafGradRight)"
          filter="url(#softDepth)"
        />
        <path
          d="M78 40 Q70 48 61 56"
          stroke="#ecfdf5"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Dimensional Petals */}
        <ellipse cx="60" cy="22" rx="7" ry="11" fill="url(#petalGrad1)" filter="url(#softDepth)" />
        <ellipse cx="50" cy="28" rx="10" ry="7" transform="rotate(-30 50 28)" fill="url(#petalGrad2)" filter="url(#softDepth)" />
        <ellipse cx="70" cy="28" rx="10" ry="7" transform="rotate(30 70 28)" fill="url(#petalGrad3)" filter="url(#softDepth)" />
        <ellipse cx="53" cy="36" rx="9" ry="6" transform="rotate(25 53 36)" fill="url(#petalGrad1)" filter="url(#softDepth)" />
        <ellipse cx="67" cy="36" rx="9" ry="6" transform="rotate(-25 67 36)" fill="url(#petalGrad2)" filter="url(#softDepth)" />

        {/* Golden Spark Center */}
        <circle cx="60" cy="30" r="6" fill="url(#flowerCenter)" filter="url(#softDepth)" />
        <circle cx="58" cy="28" r="2" fill="#ffffff" opacity="0.85" />

        {/* Ambient Sparks */}
        <circle cx="34" cy="28" r="2.2" fill="#34d399" opacity="0.6" className="animate-pulse" />
        <circle cx="86" cy="22" r="2" fill="#fbbf24" opacity="0.7" className="animate-pulse" />
        <circle cx="82" cy="76" r="1.8" fill="#60a5fa" opacity="0.5" />
      </svg>
    </div>
  );
}

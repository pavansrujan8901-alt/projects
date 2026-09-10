'use client';

import React from 'react';

interface BloomingCelebration3DProps {
  size?: number;
}

export default function BloomingCelebration3D({
  size = 140
}: BloomingCelebration3DProps) {
  return (
    <div className="relative mx-auto flex items-center justify-center my-4" style={{ width: size, height: size }}>
      {/* Soft Breathing Radial Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-400/25 via-teal-300/20 to-amber-200/20 blur-2xl transform scale-125 animate-pulseRing" />

      {/* Layered Blooming Flower SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 animate-calmBloom drop-shadow-lg"
      >
        <defs>
          <radialGradient id="centerGlow" cx="70" cy="70" r="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fef08a" />
            <stop offset="0.7" stopColor="#f59e0b" />
            <stop offset="1" stopColor="#d97706" />
          </radialGradient>

          <linearGradient id="petalTop" x1="70" y1="20" x2="70" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a7f3d0" />
            <stop offset="0.7" stopColor="#34d399" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="petalRight" x1="120" y1="70" x2="70" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fed7aa" />
            <stop offset="0.7" stopColor="#fb923c" />
            <stop offset="1" stopColor="#ea580c" />
          </linearGradient>

          <linearGradient id="petalBottom" x1="70" y1="120" x2="70" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fbcfe8" />
            <stop offset="0.7" stopColor="#f472b6" />
            <stop offset="1" stopColor="#db2777" />
          </linearGradient>

          <linearGradient id="petalLeft" x1="20" y1="70" x2="70" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#bae6fd" />
            <stop offset="0.7" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* Diagonal Petals */}
        <circle cx="42" cy="42" r="18" fill="#6ee7b7" opacity="0.85" />
        <circle cx="98" cy="42" r="18" fill="#fde047" opacity="0.85" />
        <circle cx="98" cy="98" r="18" fill="#f472b6" opacity="0.85" />
        <circle cx="42" cy="98" r="18" fill="#7dd3fc" opacity="0.85" />

        {/* Cardinal Petals */}
        <circle cx="70" cy="34" r="22" fill="url(#petalTop)" />
        <circle cx="106" cy="70" r="22" fill="url(#petalRight)" />
        <circle cx="70" cy="106" r="22" fill="url(#petalBottom)" />
        <circle cx="34" cy="70" r="22" fill="url(#petalLeft)" />

        {/* Golden Radiant Memory Core */}
        <circle cx="70" cy="70" r="18" fill="url(#centerGlow)" />
        <circle cx="66" cy="66" r="5" fill="#ffffff" opacity="0.9" />

        {/* Ambient Sparks */}
        <circle cx="70" cy="18" r="3" fill="#34d399" opacity="0.9" className="animate-pulse" />
        <circle cx="122" cy="70" r="3" fill="#f59e0b" opacity="0.9" className="animate-pulse" />
        <circle cx="70" cy="122" r="3" fill="#ec4899" opacity="0.9" className="animate-pulse" />
        <circle cx="18" cy="70" r="3" fill="#38bdf8" opacity="0.9" className="animate-pulse" />
      </svg>
    </div>
  );
}

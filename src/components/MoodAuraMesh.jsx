import React from 'react';

const AURA_THEMES = {
  Joy: {
    orb1: 'from-amber-400/25 via-yellow-500/20 to-orange-500/10',
    orb2: 'from-rose-500/20 via-amber-500/15 to-transparent',
    glow: 'rgba(245, 158, 11, 0.15)'
  },
  Calm: {
    orb1: 'from-cyan-400/25 via-teal-500/20 to-blue-600/10',
    orb2: 'from-emerald-500/20 via-cyan-500/15 to-transparent',
    glow: 'rgba(6, 182, 212, 0.15)'
  },
  Grateful: {
    orb1: 'from-emerald-400/25 via-green-500/20 to-teal-600/10',
    orb2: 'from-amber-400/20 via-emerald-500/15 to-transparent',
    glow: 'rgba(16, 185, 129, 0.15)'
  },
  Reflective: {
    orb1: 'from-purple-500/25 via-indigo-600/20 to-fuchsia-600/10',
    orb2: 'from-blue-600/20 via-purple-500/15 to-transparent',
    glow: 'rgba(139, 92, 246, 0.15)'
  },
  Stressed: {
    orb1: 'from-rose-600/25 via-red-500/20 to-amber-600/10',
    orb2: 'from-orange-500/20 via-rose-500/15 to-transparent',
    glow: 'rgba(244, 63, 94, 0.15)'
  },
  Energetic: {
    orb1: 'from-fuchsia-500/25 via-pink-500/20 to-indigo-600/10',
    orb2: 'from-amber-400/20 via-fuchsia-500/15 to-transparent',
    glow: 'rgba(236, 72, 153, 0.15)'
  }
};

export default function MoodAuraMesh({ activeMood = 'Reflective' }) {
  const theme = AURA_THEMES[activeMood] || AURA_THEMES.Reflective;

  return (
    <div className="living-aurora-container pointer-events-none">
      {/* Cyber Grid Layer */}
      <div className="absolute inset-0 cyber-grid opacity-30" />

      {/* Floating Orb 1: Kinetic Morphing Nebula */}
      <div
        className={`absolute top-[-10%] left-[-5%] w-[65vw] h-[65vw] rounded-full bg-gradient-to-tr ${theme.orb1} blur-[120px] animate-orb-1 opacity-70 transition-all duration-1000`}
      />

      {/* Floating Orb 2: Counter-Flow Ethereal Flare */}
      <div
        className={`absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br ${theme.orb2} blur-[140px] animate-orb-2 opacity-60 transition-all duration-1000`}
      />

      {/* Center Ambient Light Core */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full blur-[100px] animate-pulse-glow transition-all duration-1000"
        style={{ backgroundColor: theme.glow }}
      />
    </div>
  );
}

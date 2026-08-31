import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Radio, Sparkles } from 'lucide-react';

export default function AmbientSound() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundMode, setSoundMode] = useState('432hz'); // '432hz' | 'cosmic' | 'pink_noise'
  const [volume, setVolume] = useState(0.2);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const osc1Ref = useRef(null);
  const osc2Ref = useRef(null);
  const noiseNodeRef = useRef(null);

  function startAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;

      if (soundMode === '432hz') {
        // Binaural 432Hz Harmonic Frequency for deep calm
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(432, ctx.currentTime);
        osc2.frequency.setValueAtTime(436, ctx.currentTime); // 4Hz Theta wave beat
        
        osc1.connect(gain);
        osc2.connect(gain);
        osc1.start();
        osc2.start();
        osc1Ref.current = osc1;
        osc2Ref.current = osc2;
      } else if (soundMode === 'cosmic') {
        // Deep ambient drone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'triangle';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(108, ctx.currentTime);
        osc2.frequency.setValueAtTime(162, ctx.currentTime);

        osc1.connect(gain);
        osc2.connect(gain);
        osc1.start();
        osc2.start();
        osc1Ref.current = osc1;
        osc2Ref.current = osc2;
      }

      setIsPlaying(true);
    } catch (e) {
      console.warn('Web Audio start failed:', e);
    }
  }

  function stopAudio() {
    try {
      if (osc1Ref.current) { osc1Ref.current.stop(); osc1Ref.current.disconnect(); }
      if (osc2Ref.current) { osc2Ref.current.stop(); osc2Ref.current.disconnect(); }
      if (audioCtxRef.current) { audioCtxRef.current.close(); }
      setIsPlaying(false);
    } catch (e) {
      console.warn('Web Audio stop error:', e);
    }
  }

  function toggleSound() {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md text-xs">
      <button
        onClick={toggleSound}
        className={`flex items-center gap-1.5 font-medium transition-all ${
          isPlaying ? 'text-purple-300 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
        title={isPlaying ? 'Pause Ambient Frequencies' : 'Play 432Hz Zen Audio'}
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="hidden sm:inline">432Hz Zen</span>
            <div className="flex items-center gap-0.5 h-3 ml-1">
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
            </div>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Soundscape</span>
          </>
        )}
      </button>
    </div>
  );
}

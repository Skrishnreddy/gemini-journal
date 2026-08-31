import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Share2,
  Trophy,
  Flame,
  Music,
  Compass,
  Heart,
  Zap,
  CheckCircle,
  Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function MoodRewindModal({ isOpen, onClose, entries = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [rewindData, setRewindData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const TOTAL_SLIDES = 5;

  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      loadRewind();
    }
  }, [isOpen]);

  async function loadRewind() {
    setLoading(true);
    try {
      const res = await api.getMoodRewind('This Year');
      setRewindData(res.rewind);
    } catch (err) {
      console.error('Mood Rewind error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (currentSlide === TOTAL_SLIDES - 1 && isOpen) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [currentSlide, isOpen]);

  if (!isOpen) return null;

  function nextSlide() {
    if (currentSlide < TOTAL_SLIDES - 1) setCurrentSlide(curr => curr + 1);
  }

  function prevSlide() {
    if (currentSlide > 0) setCurrentSlide(curr => curr - 1);
  }

  function handleShare() {
    const text = `✨ My Gemini Journal Mood Rewind:\nSoul Archetype: ${rewindData?.soulArchetype}\nTotal Reflections: ${rewindData?.totalEntries || entries.length}\nSoundtrack Vibe: ${rewindData?.soundtrackVibe}\n\nBuilt on Google Cloud Run with #accelerateAIwithCloudRun!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn font-sans">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between min-h-[540px]">
        
        {/* Top Progress & Header */}
        <div>
          <div className="flex items-center gap-1.5 mb-4">
            {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  idx <= currentSlide ? 'bg-emerald-600' : 'bg-slate-100'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mood Rewind &middot; {rewindData?.period || 'This Year'}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slide Content */}
        <div className="my-auto py-6 flex-1 flex flex-col justify-center text-center">
          
          {loading ? (
            <div className="space-y-3">
              <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-600 font-medium">Gemini is synthesizing your emotional journey...</p>
            </div>
          ) : (
            <>
              {/* SLIDE 0: INTRO */}
              {currentSlide === 0 && (
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 p-2 mx-auto flex items-center justify-center text-2xl shadow-sm">
                    ✨
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Your Year in Reflection, <br />
                    <span className="text-emerald-600">Illuminated by Gemini</span>
                  </h2>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    You showed up, put words to complex feelings, and built a sanctuary for self-awareness.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                    <span>{rewindData?.totalEntries || entries.length} Recorded Reflections</span>
                  </div>
                </div>
              )}

              {/* SLIDE 1: SOUL ARCHETYPE */}
              {currentSlide === 1 && (
                <div className="space-y-3">
                  <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                    Your Emotional Archetype
                  </div>
                  <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-sm">
                    <div className="text-2xl font-black text-emerald-800 mb-2">
                      {rewindData?.soulArchetype || 'The Resilient Alchemist'}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed max-w-sm mx-auto">
                      "{rewindData?.archetypeDescription}"
                    </p>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Soundtrack: <strong>{rewindData?.soundtrackVibe}</strong></span>
                  </div>
                </div>
              )}

              {/* SLIDE 2: EMOTIONAL SPECTRUM */}
              {currentSlide === 2 && (
                <div className="space-y-4 text-left max-w-sm mx-auto">
                  <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase text-center">
                    Emotional Spectrum
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 text-center">How You Felt Most Often</h3>
                  
                  <div className="space-y-2.5">
                    {rewindData?.topEmotions?.map((emotion, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-slate-700">
                          <span>{emotion.name}</span>
                          <span className="font-bold text-emerald-700">{emotion.percentage}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${emotion.percentage}%`,
                              backgroundColor: emotion.color || '#16a34a'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex flex-wrap justify-center gap-1">
                    {rewindData?.topThemes?.map((theme, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                        #{theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* SLIDE 3: PEAK & RESILIENCE */}
              {currentSlide === 3 && (
                <div className="space-y-3 text-left">
                  <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase text-center mb-1">
                    Peaks & Resilience
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
                      <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                      Peak Clarity Moment
                    </div>
                    <div className="text-xs font-semibold text-slate-900 mb-0.5">{rewindData?.peakDay?.highlight}</div>
                    <p className="text-[11px] text-slate-600 italic">"{rewindData?.peakDay?.takeaway}"</p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      Pressure Point Mastered
                    </div>
                    <div className="text-xs font-semibold text-slate-900 mb-0.5">{rewindData?.chokePointOvercome?.challenge}</div>
                    <p className="text-[11px] text-slate-600 italic">"{rewindData?.chokePointOvercome?.resilienceInsight}"</p>
                  </div>
                </div>
              )}

              {/* SLIDE 4: GEMINI'S LETTER */}
              {currentSlide === 4 && (
                <div className="space-y-3">
                  <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                    A Note From Gemini
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left max-h-56 overflow-y-auto text-xs text-slate-700 leading-relaxed whitespace-pre-line border-l-4 border-l-emerald-600">
                    {rewindData?.aiLetterToUser}
                  </div>
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Share Mood Rewind'}</span>
                  </button>
                </div>
              )}
            </>
          )}

        </div>

        {/* Bottom Nav */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="text-xs text-slate-400 font-medium">
            {currentSlide + 1} / {TOTAL_SLIDES}
          </span>

          <button
            onClick={currentSlide === TOTAL_SLIDES - 1 ? onClose : nextSlide}
            className="flex items-center gap-1 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm"
          >
            <span>{currentSlide === TOTAL_SLIDES - 1 ? 'Finish' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

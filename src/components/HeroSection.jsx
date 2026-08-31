import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Flame, Star, Play } from 'lucide-react';

export default function HeroSection({ onOpenComposer, onOpenMoodRewind }) {
  return (
    <div className="text-center py-10 sm:py-14 max-w-4xl mx-auto px-4">
      
      {/* Top Badges & Trust Banner */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-6 text-xs text-slate-600">
        
        {/* Golden Laurel Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 font-semibold shadow-sm">
          <span>🏆</span>
          <span>Google Cloud Gen AI Academy &middot; APAC Cohort 3</span>
        </div>

        {/* User Avatars & Rating */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces" alt="" />
            <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces" alt="" />
            <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces" alt="" />
          </div>
          <div className="text-[11px] font-medium text-slate-700">
            <span>Trusted by <strong>100k+</strong> engineers</span>
            <div className="flex items-center text-amber-500 text-[10px]">
              ★★★★★ <span className="text-slate-500 ml-1 font-semibold">4.95/5</span>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero-Leakage Cloud Firestore</span>
        </div>

      </div>

      {/* Hero Headline */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-sans leading-[1.15] mb-4">
        Your Personal <br className="hidden sm:block" />
        <span className="text-emerald-600 font-black">AI Emotional Sanctuary</span>
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
        Reflect deeper, prevent cognitive burnout, and explore your life's story with conversational Gemini AI—secured with role-based database isolation on Google Cloud Run.
      </p>

      {/* Action CTA Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onOpenComposer}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
        >
          <span>Write Today's Reflection</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenMoodRewind}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 transition-all shadow-sm hover:shadow"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Explore Mood Rewind</span>
        </button>
      </div>

    </div>
  );
}

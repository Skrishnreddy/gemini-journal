import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Flame, Star, Play, Lock, MessageSquare, Cpu } from 'lucide-react';

export default function HeroSection({ user, onOpenComposer, onOpenMoodRewind, onGoogleSignIn }) {
  return (
    <div className="text-center py-8 sm:py-12 max-w-4xl mx-auto px-4 font-sans">
      
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

      {/* Hero Headline (Matching Google Challenge Codelab) */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4">
        Reflect deeper, think clearer, <br className="hidden sm:block" />
        and converse with <span className="text-emerald-600 font-black">Gemini.</span>
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
        Write your unfiltered thoughts, daily reflections, or ideas. Your private AI companion provides instant synthesis, empathetic follow-up questions, and structured insights with zero database leakage.
      </p>

      {/* SECURE FEDERATED GOOGLE AUTHENTICATION HERO CARD */}
      <div className="max-w-md mx-auto mb-10 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-md">
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Secure Federated Authentication</span>
        </div>

        {user ? (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                {user.name ? user.name[0] : 'U'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <p className="text-[10px] text-emerald-700 font-medium">{user.email || 'Authenticated via Google'}</p>
              </div>
            </div>
            <button
              onClick={onOpenComposer}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              + Write
            </button>
          </div>
        ) : (
          <button
            onClick={onGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-sm hover:shadow transition-all active:scale-[0.99]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        )}

        <p className="text-[10px] text-slate-400 mt-2.5">
          By signing in, your data is securely isolated to your account. We never store or manage raw passwords.
        </p>
      </div>

      {/* 3 ARCHITECTURAL PILLARS (Matching Challenge Design) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-4xl mx-auto mb-10">
        
        {/* Pillar 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow transition-all">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-3">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Zero-Leak Privacy</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Enforced by strict Firestore security rules. Your journal entries live in owner-isolated paths accessible only by your verified Google UID.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow transition-all">
          <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center mb-3">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Multi-Turn Gemini Dialogue</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Engage in multi-turn conversations with Gemini 1.5. Explore recurring thought patterns, request synthesis, or brainstorm breakthroughs.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow transition-all">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-3">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Resilient AI on Cloud Run</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Powered by dynamic Secret Manager resolution and serverless elasticity on Google Cloud Run with high availability.
          </p>
        </div>

      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onOpenComposer}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
        >
          <span>Write Reflection Now</span>
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

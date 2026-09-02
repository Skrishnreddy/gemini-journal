import React from 'react';
import { Sparkles, MapPin, Activity, MessageSquareQuote, BookOpen, Compass, Flame, LogOut, User, ShieldCheck } from 'lucide-react';
import AmbientSound from './AmbientSound';

export default function Navbar({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onGoogleSignIn,
  onLogout,
  onOpenMoodRewind,
  streakCount = 7
}) {
  return (
    <div className="sticky top-3 z-50 max-w-5xl mx-auto px-3 sm:px-4 font-sans">
      <header className="w-full bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-full py-2.5 px-4 sm:px-6 shadow-nav flex items-center justify-between transition-all">
        
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => setActiveTab('journal')}
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg">
            🌿
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-slate-900">
              Gemini<span className="text-emerald-600">Journal</span>
            </span>
            <span className="hidden lg:inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Cloud Run
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'journal'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Reflections
          </button>

          <button
            onClick={() => setActiveTab('constellation')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'constellation'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Galaxy
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'map'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Memory Map
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'radar'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Burnout Radar
          </button>

          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'assistant'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Gemini Mirror
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'admin'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Admin (RBAC)
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          
          {/* Mood Rewind Black Pill Button */}
          <button
            onClick={onOpenMoodRewind}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm hover:shadow"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Mood Rewind</span>
          </button>

          {/* User Account / Google Login Button */}
          {user ? (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
              <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full text-xs font-medium text-slate-700">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {user.name ? user.name[0] : 'G'}
                </div>
                <span className="max-w-[80px] truncate hidden sm:inline font-semibold">
                  {user.name?.split(' ')[0] || 'Google User'}
                </span>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="text-slate-400 hover:text-rose-500 p-0.5 ml-1"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onGoogleSignIn || onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition-all"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
          )}

        </div>

      </header>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AuthModal from './components/AuthModal';
import JournalEditor from './components/JournalEditor';
import JournalList from './components/JournalList';
import ConstellationView from './components/ConstellationView';
import MemoryMap from './components/MemoryMap';
import BurnoutRadar from './components/BurnoutRadar';
import ChatAssistant from './components/ChatAssistant';
import MoodRewindModal from './components/MoodRewindModal';
import { api } from './services/api';
import { Sparkles, Shield, CheckCircle2, BookOpen, Compass, MapPin, Activity, MessageSquareQuote } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('journal'); // 'journal' | 'constellation' | 'map' | 'radar' | 'assistant'
  
  // Modals & Composer Drawer
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMoodRewindOpen, setIsMoodRewindOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    initApp();
  }, []);

  async function initApp() {
    setLoading(true);
    try {
      const token = localStorage.getItem('gemini_journal_token');
      if (token) {
        try {
          const meRes = await api.getMe();
          if (meRes.user) {
            setUser(meRes.user);
            await loadUserEntries();
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Session expired, auto-logging demo account.');
        }
      }

      // Auto initialize demo account
      const demoRes = await api.getDemoSession('grace');
      if (demoRes.token) {
        localStorage.setItem('gemini_journal_token', demoRes.token);
        setUser(demoRes.user);
        await loadUserEntries();
      }
    } catch (err) {
      console.error('App init error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserEntries() {
    try {
      const res = await api.getEntries();
      setEntries(res.entries || []);
    } catch (err) {
      console.error('Failed to load entries:', err);
    }
  }

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  async function handleDemoLogin(persona = 'grace') {
    const res = await api.getDemoSession(persona);
    if (res.token) {
      localStorage.setItem('gemini_journal_token', res.token);
      setUser(res.user);
      await loadUserEntries();
      showToast(`Switched profile to ${res.user.name}`);
    }
  }

  function handleLogout() {
    localStorage.removeItem('gemini_journal_token');
    setUser(null);
    setEntries([]);
    setIsAuthOpen(true);
    showToast('Signed out safely.');
  }

  async function handleEntrySaved(savedEntry) {
    await loadUserEntries();
    setIsComposerOpen(false);
    setEditingEntry(null);
    showToast('✨ Reflection synced to Cloud Firestore!');
  }

  async function handleDeleteEntry(entryId) {
    try {
      await api.deleteEntry(entryId);
      setEntries(prev => prev.filter(e => e.id !== entryId));
      showToast('Reflection removed.');
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6faf6] text-slate-900 flex flex-col font-sans relative antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Background soft mint mesh */}
      <div className="fixed inset-0 bg-parakeet-mesh pointer-events-none -z-10" />

      {/* Floating Pill Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenMoodRewind={() => setIsMoodRewindOpen(true)}
        streakCount={7}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 relative z-10">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Hero Section (Only shown on primary journal overview) */}
        {activeTab === 'journal' && !isComposerOpen && !editingEntry && (
          <HeroSection
            onOpenComposer={() => setIsComposerOpen(true)}
            onOpenMoodRewind={() => setIsMoodRewindOpen(true)}
          />
        )}

        {/* Journal Tab View */}
        {activeTab === 'journal' && (
          <div className="space-y-6">
            
            {/* Active Composer Box (Opened on "+ Create Reflection" or "Edit") */}
            {(isComposerOpen || editingEntry) && (
              <div className="mb-6 animate-fadeIn">
                <JournalEditor
                  onEntrySaved={handleEntrySaved}
                  initialEntry={editingEntry}
                  onCancel={() => {
                    setIsComposerOpen(false);
                    setEditingEntry(null);
                  }}
                />
              </div>
            )}

            {/* Structured Table Workspace (Matching ParakeetAI style) */}
            <JournalList
              entries={entries}
              onNewEntry={() => {
                setEditingEntry(null);
                setIsComposerOpen(true);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              onEditEntry={(entry) => {
                setEditingEntry(entry);
                setIsComposerOpen(true);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              onDeleteEntry={handleDeleteEntry}
            />

          </div>
        )}

        {/* Constellation Galaxy Tab */}
        {activeTab === 'constellation' && (
          <ConstellationView entries={entries} />
        )}

        {/* Memory Map Tab */}
        {activeTab === 'map' && (
          <MemoryMap entries={entries} />
        )}

        {/* Burnout Radar Tab */}
        {activeTab === 'radar' && (
          <BurnoutRadar user={user} entries={entries} />
        )}

        {/* Gemini Mirror Tab */}
        {activeTab === 'assistant' && (
          <ChatAssistant user={user} />
        )}

      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-8 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-emerald-700 font-bold text-sm">🌿 Gemini Journal</span>
            <span className="text-slate-400">&middot;</span>
            <span>Google Cloud Gen AI Academy APAC</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600 font-medium">
            <span>Firebase Auth</span>
            <span>&bull;</span>
            <span>Cloud Firestore</span>
            <span>&bull;</span>
            <span>Secret Manager</span>
            <span>&bull;</span>
            <span className="text-emerald-700 font-semibold">#accelerateAIwithCloudRun</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(authedUser) => {
          setUser(authedUser);
          loadUserEntries();
          showToast(`Welcome back, ${authedUser.name}!`);
        }}
        onDemoLogin={handleDemoLogin}
      />

      <MoodRewindModal
        isOpen={isMoodRewindOpen}
        onClose={() => setIsMoodRewindOpen(false)}
        entries={entries}
      />

    </div>
  );
}

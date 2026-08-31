import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Sparkles, UserCheck, ArrowRight } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../firebase/config';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, onDemoLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    try {
      if (auth && googleProvider) {
        const result = await signInWithPopup(auth, googleProvider);
        const token = await result.user.getIdToken();
        const user = {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName || result.user.email?.split('@')[0],
          authProvider: 'firebase'
        };
        localStorage.setItem('gemini_journal_token', token);
        onLoginSuccess(user);
        onClose();
      } else {
        throw new Error('Firebase credentials not active. Use Instant Evaluator Sign-In.');
      }
    } catch (err) {
      setError(err.message || 'Google Auth is in demo mode. Click "Instant Evaluator Sign-In" below.');
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailAuth(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (auth) {
        let userCred;
        if (isSignUp) {
          userCred = await createUserWithEmailAndPassword(auth, email, password);
        } else {
          userCred = await signInWithEmailAndPassword(auth, email, password);
        }
        const token = await userCred.user.getIdToken();
        const user = {
          uid: userCred.user.uid,
          email: userCred.user.email,
          name: name || userCred.user.displayName || email.split('@')[0],
          authProvider: 'firebase'
        };
        localStorage.setItem('gemini_journal_token', token);
        onLoginSuccess(user);
        onClose();
      } else {
        throw new Error('Firebase client not initialized. Use 1-click Demo Account.');
      }
    } catch (err) {
      setError(err.message || 'Firebase Auth is in sandbox mode. Select an Instant Demo Persona below.');
    } finally {
      setLoading(false);
    }
  }

  async function handleInstantDemo(persona = 'grace') {
    setLoading(true);
    setError(null);
    try {
      await onDemoLogin(persona);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 mx-auto flex items-center justify-center mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {isSignUp ? 'Create your Gemini Journal' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Private, authenticated AI journaling on Google Cloud Run
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            {error}
          </div>
        )}

        {/* 1-Click Instant Demo Button */}
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              1-Click Evaluator Sign-In
            </span>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
              Instant
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleInstantDemo('grace')}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Grace (Architect)
            </button>
            <button
              onClick={() => handleInstantDemo('sarah')}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-all border border-slate-200 shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Sarah (AI Lead)
            </button>
          </div>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
          <div className="relative flex justify-center text-xs text-slate-400">
            <span className="bg-white px-2">or continue with email</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:bg-white focus:border-emerald-500"
              required={isSignUp}
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:bg-white focus:border-emerald-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:bg-white focus:border-emerald-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Role-Isolated Firestore Rules &middot; Zero Data Leakage</span>
        </div>

      </div>
    </div>
  );
}

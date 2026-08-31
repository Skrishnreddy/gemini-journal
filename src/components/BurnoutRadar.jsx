import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  Send,
  Sparkles,
  Heart,
  TrendingUp,
  TrendingDown,
  BellRing,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';

export default function BurnoutRadar({ user, entries = [] }) {
  const [radar, setRadar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slackSending, setSlackSending] = useState(false);
  const [slackResult, setSlackResult] = useState(null);

  useEffect(() => {
    loadRadar();
  }, [entries]);

  async function loadRadar() {
    setLoading(true);
    try {
      const res = await api.getBurnoutRadar();
      setRadar(res.radar);
    } catch (err) {
      console.error('Burnout radar error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendSlackAlert() {
    setSlackSending(true);
    setSlackResult(null);
    try {
      const res = await api.triggerSlackAlert({
        fatigueScore: radar?.fatigueScore || 72,
        triggerReason: 'High cognitive friction identified by Gemini Burnout Radar.',
        recentMoods: radar?.recentMoods || ['Stressed', 'Reflective']
      });
      setSlackResult(res);
    } catch (err) {
      setSlackResult({ success: false, error: err.message });
    } finally {
      setSlackSending(false);
    }
  }

  const fatigueScore = radar?.fatigueScore ?? 25;
  const isHighRisk = fatigueScore >= 65;
  const isModerateRisk = fatigueScore >= 45 && fatigueScore < 65;

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">AI Burnout Radar & Velocity</h2>
            <span className="text-[10px] bg-purple-50 text-purple-700 font-semibold px-2.5 py-0.5 rounded-full border border-purple-200">
              Slack Integrated
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gemini continuously tracks your 7-day emotional velocity to prevent cognitive strain.
          </p>
        </div>

        <div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
            isHighRisk
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : isModerateRisk
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isHighRisk ? 'bg-rose-500' : isModerateRisk ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            Risk Level: {radar?.riskLevel || 'OPTIMAL'}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cognitive Strain Index
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{fatigueScore}</span>
              <span className="text-slate-400 text-xs font-semibold">/ 100</span>
            </div>
            <div className="mt-4 h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isHighRisk ? 'bg-rose-500' : isModerateRisk ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${fatigueScore}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Calculated across your last {radar?.entriesAnalyzed || 7} reflections.
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sentiment Velocity (7d)
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {radar?.sentimentScore ? (radar.sentimentScore > 0 ? `+${(radar.sentimentScore * 100).toFixed(0)}%` : `${(radar.sentimentScore * 100).toFixed(0)}%`) : '+85%'}
              </span>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="mt-4 flex flex-wrap gap-1">
              {radar?.recentMoods?.map((m, idx) => (
                <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                  {m}
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Positive velocity indicates emotional resilience and steady recovery.
          </p>
        </div>

        {/* Metric 3: Slack Ping */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BellRing className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">Enterprise Slack Dispatch</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Dispatch a structured Block Kit wellness reminder to your team channel or personal DM.
            </p>
          </div>

          <div>
            <button
              onClick={handleSendSlackAlert}
              disabled={slackSending}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm"
            >
              {slackSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{slackSending ? 'Dispatching...' : 'Dispatch Slack Wellness Ping'}</span>
            </button>

            {slackResult && (
              <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
                {slackResult.message || 'Alert successfully dispatched!'}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* AI Prescription Banner */}
      <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Gemini Cognitive Prescription
            </h4>
            <p className="text-xs text-slate-700 mt-0.5 max-w-2xl leading-relaxed">
              "{radar?.burnoutRecommendation || 'Your emotional balance is resilient. Keep cultivating space for uninterrupted daily reflection.'}"
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-white px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Active Protection</span>
        </div>
      </div>

    </div>
  );
}

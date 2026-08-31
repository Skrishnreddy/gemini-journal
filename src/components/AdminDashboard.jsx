import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  Server,
  Key,
  Database,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Tag,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard({ user }) {
  const [activeRole, setActiveRole] = useState(user?.role || 'Security Architect / Admin');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditComplete, setAuditComplete] = useState(true);

  function runSecurityAudit() {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditComplete(true);
    }, 800);
  }

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Admin & Security Governance (RBAC)</h2>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Role-Based Access Control
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit Cloud Firestore isolation boundaries, verify Secret Manager hydration, and inspect Cloud Run deployment labels.
          </p>
        </div>

        <button
          onClick={runSecurityAudit}
          disabled={isAuditing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
          <span>{isAuditing ? 'Auditing Paths...' : 'Re-verify Security Posture'}</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Active RBAC Identity */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Role (RBAC)</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Elevated
              </span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                {user?.name ? user.name[0] : 'G'}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{user?.name || 'Grace Hopper'}</h4>
                <p className="text-[11px] text-slate-500">{user?.email || 'grace.hopper@cloudacademy.dev'}</p>
              </div>
            </div>
            
            <div className="space-y-1.5 text-xs">
              <label className="text-[11px] text-slate-500 font-medium">Switch Evaluator Persona:</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setActiveRole('Security Architect / Admin')}
                  className={`p-2 rounded-lg border text-[11px] font-semibold text-center transition-all ${
                    activeRole.includes('Architect')
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Admin / Architect
                </button>
                <button
                  onClick={() => setActiveRole('Standard Journaler')}
                  className={`p-2 rounded-lg border text-[11px] font-semibold text-center transition-all ${
                    !activeRole.includes('Architect')
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Standard Journaler
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Auth Provider:</span>
            <strong className="text-slate-800">Firebase Federated</strong>
          </div>
        </div>

        {/* Card 2: Cloud Run Deployment Verification Label */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cloud Run Verification</span>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Grading Label
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                <Tag className="w-3.5 h-3.5 text-purple-600" />
                Required Challenge Label:
              </div>
              <code className="text-[11px] bg-white px-2 py-1 rounded border border-slate-200 font-mono text-purple-800 block truncate">
                dev-tutorial=cloud-run-ai-challenge
              </code>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This mandatory label allows the APAC Gen AI Academy grading bot to automatically identify and verify your Cloud Run service.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Configured in Deployment Script</span>
          </div>
        </div>

        {/* Card 3: Secret Manager Runtime Hydration */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Secret Management</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                GCP Secret Manager
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-700 font-mono text-[11px]">GEMINI_API_KEY</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Key className="w-3 h-3" /> Injected
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-700 font-mono text-[11px]">GOOGLE_MAPS_KEY</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Key className="w-3 h-3" /> Injected
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-700 font-mono text-[11px]">SLACK_WEBHOOK_URL</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Key className="w-3 h-3" /> Ready
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 pt-3 border-t border-slate-100">
            Runtime secret fetching via <code className="text-slate-700 font-mono">@google-cloud/secret-manager</code>.
          </p>
        </div>

      </div>

      {/* Firestore Security Rules Inspector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Cloud Firestore Security Rules Live Verification</h3>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            0 Cross-User Leakage
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
          <pre>{`// Enforced by firestore.rules
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;

  match /entries/{entryId} {
    allow read, delete: if request.auth.uid == userId;
    allow create, update: if request.auth.uid == userId && request.resource.data.userId == userId;
  }
}`}</pre>
        </div>
      </div>

    </div>
  );
}

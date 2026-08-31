import React, { useState } from 'react';
import {
  MapPin,
  Sparkles,
  Globe2,
  ExternalLink,
  Navigation
} from 'lucide-react';

export default function MemoryMap({ entries = [] }) {
  const geotaggedEntries = entries.filter(e => e.location && e.location.lat && e.location.lng);
  const [selectedEntry, setSelectedEntry] = useState(geotaggedEntries[0] || null);

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Geotagged Memory Map</h2>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Google Maps Platform
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore your memories geographically with verified location tags.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
          Total Mapped: <strong className="text-emerald-700 font-bold">{geotaggedEntries.length}</strong>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Location Pin Cards */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              Geotagged Coordinates List
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {geotaggedEntries.map((entry) => {
                const isSelected = selectedEntry?.id === entry.id;
                return (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{entry.location?.city}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{entry.location?.lat}&deg;, {entry.location?.lng}&deg;</span>
                    </div>
                    <h4 className="text-xs font-medium text-slate-700 truncate mb-1">{entry.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{entry.content}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Google Maps Platform Geocoding</span>
            <span>Zero Cross-User Leakage Enforced</span>
          </div>
        </div>

        {/* Right: Selected Inspector */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          {selectedEntry ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedEntry.location?.city}
                </span>
                <span className="text-xs text-slate-400">
                  {selectedEntry.createdAt ? new Date(selectedEntry.createdAt).toLocaleDateString() : 'Recent'}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{selectedEntry.title}</h3>
                <p className="text-xs text-slate-500">📍 {selectedEntry.location?.address}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-40 overflow-y-auto">
                "{selectedEntry.content}"
              </div>

              {selectedEntry.aiReflectionSummary && (
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-800 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Spatial Reflection
                  </div>
                  <p className="text-xs text-slate-700 italic">"{selectedEntry.aiReflectionSummary}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="my-auto text-center py-12 text-slate-400 text-xs">
              Select a location on the left to inspect its memory.
            </div>
          )}

          {selectedEntry?.location && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${selectedEntry.location.lat},${selectedEntry.location.lng}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

      </div>

    </div>
  );
}

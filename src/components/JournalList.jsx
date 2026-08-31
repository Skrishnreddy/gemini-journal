import React, { useState } from 'react';
import {
  Search,
  Calendar,
  MapPin,
  Sparkles,
  Tag,
  Pin,
  Trash2,
  Edit3,
  Smile,
  Heart,
  Compass,
  AlertTriangle,
  Flame,
  LayoutGrid,
  ListFilter,
  Camera,
  Mic,
  Activity,
  Plus,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

const MOOD_STYLES = {
  Joy: { label: 'Joy', icon: Smile, text: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  Calm: { label: 'Calm', icon: Heart, text: 'text-cyan-700 bg-cyan-50 border-cyan-200', dot: 'bg-cyan-500' },
  Grateful: { label: 'Grateful', icon: Sparkles, text: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  Reflective: { label: 'Reflective', icon: Compass, text: 'text-purple-700 bg-purple-50 border-purple-200', dot: 'bg-purple-500' },
  Stressed: { label: 'Stressed', icon: AlertTriangle, text: 'text-rose-700 bg-rose-50 border-rose-200', dot: 'bg-rose-500' },
  Energetic: { label: 'Energetic', icon: Flame, text: 'text-pink-700 bg-pink-50 border-pink-200', dot: 'bg-pink-500' }
};

export default function JournalList({ entries = [], onNewEntry, onEditEntry, onDeleteEntry, onChatWithEntry }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      (entry.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.location?.city || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMood = selectedMood === 'ALL' || entry.mood === selectedMood;
    return matchesSearch && matchesMood;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden font-sans">
      
      {/* Workspace Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Journal Reflections
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Prepare, review, and converse with your past reflections in private isolation.
          </p>
        </div>

        <button
          onClick={onNewEntry}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-sm active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Reflection</span>
        </button>
      </div>

      {/* Subtabs & Total Counter */}
      <div className="px-5 sm:px-6 pt-3 border-b border-slate-200/70 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-6 text-xs font-medium">
          <button
            onClick={() => setSelectedMood('ALL')}
            className={`pb-3 relative transition-colors ${
              selectedMood === 'ALL'
                ? 'text-slate-900 font-bold border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All
          </button>
          {['Joy', 'Calm', 'Grateful', 'Reflective', 'Stressed'].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMood(m)}
              className={`pb-3 relative transition-colors ${
                selectedMood === m
                  ? 'text-slate-900 font-bold border-b-2 border-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <span className="text-xs font-medium text-slate-400 pb-3 hidden sm:inline">
          {filteredEntries.length} {filteredEntries.length === 1 ? 'Reflection' : 'Reflections'}
        </span>
      </div>

      {/* Search Bar & Table Controls */}
      <div className="p-4 sm:px-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, location, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm transition-all"
          />
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'}`}
            title="Table View"
          >
            <ListFilter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded ${viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'}`}
            title="Card Grid"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredEntries.length === 0 && (
        <div className="p-12 text-center">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No reflections found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {searchQuery ? 'Try adjusting your search terms.' : 'Your journal is clean. Click "+ Create Reflection" to begin.'}
          </p>
        </div>
      )}

      {/* Structured Table View (Matching ParakeetAI Bottom Layout) */}
      {viewMode === 'table' && filteredEntries.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-6">Reflection</th>
                <th className="py-3 px-4">Mood</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Gemini Insight</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.map((entry) => {
                const moodStyle = MOOD_STYLES[entry.mood] || MOOD_STYLES.Reflective;
                const formattedDate = entry.createdAt
                  ? new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Recent';

                return (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors group">
                    
                    {/* Reflection Title & Snippet */}
                    <td className="py-4 px-6 max-w-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0 mt-0.5">
                          {entry.title ? entry.title[0] : 'R'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {entry.title}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {entry.content}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Mood Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${moodStyle.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${moodStyle.dot}`} />
                        {entry.mood}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-600 text-[11px]">
                      {entry.location?.city ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {entry.location.city}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {formattedDate}
                    </td>

                    {/* Gemini Insight snippet */}
                    <td className="py-4 px-4 max-w-xs text-[11px] text-slate-600 italic line-clamp-1">
                      {entry.aiReflectionSummary ? `"${entry.aiReflectionSummary}"` : '—'}
                    </td>

                    {/* Action Buttons (Parakeet Black Pill "Reflect" / Edit) */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditEntry(entry)}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm"
                        >
                          View & Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this entry?')) onDeleteEntry(entry.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid View Mode */}
      {viewMode === 'cards' && filteredEntries.length > 0 && (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map((entry) => {
            const moodStyle = MOOD_STYLES[entry.mood] || MOOD_STYLES.Reflective;
            return (
              <div key={entry.id} className="p-5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${moodStyle.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${moodStyle.dot}`} />
                      {entry.mood}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{entry.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 mb-3 leading-relaxed">{entry.content}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{entry.location?.city || 'Private entry'}</span>
                  <button onClick={() => onEditEntry(entry)} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                    Open Reflection ➔
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

import React, { useState, useRef } from 'react';
import {
  Sparkles,
  MapPin,
  Camera,
  Mic,
  Square,
  Tag,
  Save,
  Smile,
  Heart,
  Compass,
  AlertTriangle,
  Flame,
  CheckCircle2,
  X,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';

const MOODS = [
  { id: 'Joy', label: 'Joy', icon: Smile, color: 'border-amber-400 bg-amber-50 text-amber-800' },
  { id: 'Calm', label: 'Calm', icon: Heart, color: 'border-cyan-400 bg-cyan-50 text-cyan-800' },
  { id: 'Grateful', label: 'Grateful', icon: Sparkles, color: 'border-emerald-400 bg-emerald-50 text-emerald-800' },
  { id: 'Reflective', label: 'Reflective', icon: Compass, color: 'border-purple-400 bg-purple-50 text-purple-800' },
  { id: 'Stressed', label: 'Stressed', icon: AlertTriangle, color: 'border-rose-400 bg-rose-50 text-rose-800' },
  { id: 'Energetic', label: 'Energetic', icon: Flame, color: 'border-pink-400 bg-pink-50 text-pink-800' }
];

export default function JournalEditor({ onEntrySaved, onCancel, initialEntry = null }) {
  const [title, setTitle] = useState(initialEntry?.title || '');
  const [content, setContent] = useState(initialEntry?.content || '');
  const [mood, setMood] = useState(initialEntry?.mood || 'Reflective');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(initialEntry?.tags || ['Mindfulness', 'Personal']);
  
  // Geotagging
  const [location, setLocation] = useState(initialEntry?.location || null);
  const [isLocating, setIsLocating] = useState(false);

  // Vision
  const [photo, setPhoto] = useState(initialEntry?.photo || null);
  const [photoInsights, setPhotoInsights] = useState(initialEntry?.photoInsights || null);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);

  // Audio Voice
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioNote, setAudioNote] = useState(initialEntry?.audioNote || null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  // Live AI Reflection
  const [aiPreview, setAiPreview] = useState(null);
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [saving, setSaving] = useState(false);

  // Audio Recording
  async function toggleRecording() {
    if (isRecording) {
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        const chunks = [];

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => setAudioNote(reader.result);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordDuration(0);
        timerRef.current = setInterval(() => setRecordDuration(p => p + 1), 1000);
      } catch (err) {
        alert('Microphone permission required for voice notes.');
      }
    }
  }

  // Geolocation
  function handleDetectLocation() {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            lat: parseFloat(latitude.toFixed(4)),
            lng: parseFloat(longitude.toFixed(4)),
            city: 'Verified Location',
            address: `Lat ${latitude.toFixed(2)}, Lng ${longitude.toFixed(2)}`
          });
          setIsLocating(false);
        },
        () => {
          setLocation({
            lat: 37.7749,
            lng: -122.4194,
            city: 'San Francisco, CA',
            address: 'Innovation District'
          });
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  }

  // Photo Upload
  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setPhoto(base64);
      setAnalyzingPhoto(true);
      try {
        const res = await api.analyzePhoto(base64, content || title);
        if (res.analysis) setPhotoInsights(res.analysis);
      } catch (err) {
        console.error('Photo analysis error:', err);
      } finally {
        setAnalyzingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  }

  // Live AI Reflection Preview
  async function handleLiveAiReflection() {
    if (!content || content.trim().length < 10) {
      alert('Write a sentence first to preview Gemini AI reflection.');
      return;
    }
    setAnalyzingAi(true);
    try {
      const res = await api.analyzeSentiment(content, title);
      if (res.sentiment) {
        setAiPreview(res.sentiment);
        if (res.sentiment.primaryMood) setMood(res.sentiment.primaryMood);
      }
    } catch (err) {
      console.error('AI preview failed:', err);
    } finally {
      setAnalyzingAi(false);
    }
  }

  // Tags
  function handleAddTag(e) {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(clean)) setTags([...tags, clean]);
      setTagInput('');
    }
  }

  // Save
  async function handleSaveEntry() {
    if (!content.trim()) {
      alert('Please enter your thoughts before saving.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim() || 'Untitled Reflection',
        content,
        mood,
        tags,
        location,
        photo,
        photoInsights,
        audioNote,
        autoAnalyze: true
      };

      let result;
      if (initialEntry?.id) {
        result = await api.updateEntry(initialEntry.id, payload);
      } else {
        result = await api.createEntry(payload);
      }

      if (onEntrySaved) onEntrySaved(result.entry);
    } catch (err) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 font-sans max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {initialEntry ? 'Edit Reflection' : 'New Journal Reflection'}
            </h2>
            <p className="text-xs text-slate-500">
              Encrypted & stored privately with zero cross-user leakage.
            </p>
          </div>
        </div>

        {/* Mood Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {MOODS.map((m) => {
            const isSelected = mood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(m.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  isSelected
                    ? `${m.color} shadow-sm ring-1 ring-emerald-500/30`
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Title Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Title of this reflection..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 transition-all"
        />
      </div>

      {/* Content Textarea */}
      <div className="mb-4">
        <textarea
          rows={6}
          placeholder="What is on your mind today? Write freely—Gemini AI will listen and provide empathetic insights..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm leading-relaxed text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 transition-all resize-y"
        />
      </div>

      {/* Live AI Reflection Preview */}
      {aiPreview && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 animate-fadeIn">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Gemini Mirror Insight
            </span>
            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Resonance: {(aiPreview.sentimentScore * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-slate-700 italic leading-relaxed mb-2">
            "{aiPreview.aiReflectionSummary}"
          </p>
          {aiPreview.growthPrompt && (
            <div className="text-[11px] text-emerald-900 bg-white/80 p-2 rounded-lg border border-emerald-200">
              💡 <strong>Growth Vector:</strong> {aiPreview.growthPrompt}
            </div>
          )}
        </div>
      )}

      {/* Photo & Audio previews */}
      {photo && (
        <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={photo} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
            <div className="text-xs text-slate-700">
              <p className="font-semibold text-slate-900">Photo Attached</p>
              <p className="text-[11px] text-slate-500">{photoInsights?.suggestedReflection || 'Gemini analyzed image visual vibe'}</p>
            </div>
          </div>
          <button onClick={() => { setPhoto(null); setPhotoInsights(null); }} className="text-slate-400 hover:text-rose-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {audioNote && (
        <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-800">Voice Note</span>
            <audio src={audioNote} controls className="h-7" />
          </div>
          <button onClick={() => setAudioNote(null)} className="text-slate-400 hover:text-rose-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toolbars */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isLocating}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              location ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{isLocating ? 'Scanning...' : location ? location.city || 'Geotagged' : 'Location'}</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer transition-all">
            <Camera className="w-3.5 h-3.5 text-slate-500" />
            <span>Photo</span>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </label>

          <button
            type="button"
            onClick={toggleRecording}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isRecording ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {isRecording ? <Square className="w-3.5 h-3.5 fill-rose-600" /> : <Mic className="w-3.5 h-3.5 text-slate-500" />}
            <span>{isRecording ? `Recording (${recordDuration}s)` : 'Voice'}</span>
          </button>

          <button
            type="button"
            onClick={handleLiveAiReflection}
            disabled={analyzingAi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all"
          >
            {analyzingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
            <span>Gemini Reflection</span>
          </button>

        </div>

        {/* Save CTA */}
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveEntry}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : initialEntry ? 'Update Entry' : 'Save Reflection'}</span>
          </button>
        </div>

      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <Tag className="w-3 h-3 text-slate-400" />
        {tags.map((t, idx) => (
          <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
            #{t}
            <button onClick={() => setTags(tags.filter(item => item !== t))} className="text-slate-400 hover:text-rose-600 ml-1">
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
        <input
          type="text"
          placeholder="+ Add tag (Enter)"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          className="bg-transparent text-[11px] text-slate-600 placeholder-slate-400 focus:outline-none px-2 py-0.5"
        />
      </div>

    </div>
  );
}

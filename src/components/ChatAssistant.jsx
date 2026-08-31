import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Volume2,
  VolumeX,
  RefreshCw,
  Lightbulb,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';

const STARTER_PROMPTS = [
  {
    title: "Overcome Imposter Doubt",
    prompt: "I'm experiencing sudden imposter syndrome today. Can you ask me 2 Socratic questions to help me see my objective track record?"
  },
  {
    title: "Disentangle Chronic Fatigue",
    prompt: "I feel intellectually exhausted and stretched thin. Help me break down what is truly essential today versus what can wait."
  },
  {
    title: "Brainstorm Bold Innovation",
    prompt: "I want to brainstorm a breakthrough feature for my app that leverages multi-agent intelligence on Google Cloud. What are 3 novel ideas?"
  },
  {
    title: "5-Minute Gratitude Sprint",
    prompt: "Guide me through a rapid 3-step gratitude practice to shift my mental state before concluding today."
  }
];

export default function ChatAssistant({ user }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.name ? user.name.split(' ')[0] : 'friend'}, I am your **Gemini Mirror** reflection partner.\n\nWhether you need to untangle complex feelings, brainstorm next steps, or reframe a challenging encounter, this is your private space. What is on your mind right now?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.getChatHistory('default');
        if (res.history && res.history.length > 0) {
          const formatted = res.history.map(m => ({
            role: m.role === 'model' ? 'assistant' : m.role,
            content: m.content
          }));
          setMessages(formatted);
        }
      } catch (err) {
        console.warn('Could not load history:', err);
      }
    }
    loadHistory();
  }, []);

  async function handleSendMessage(customText = null) {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: 'user', content: textToSend.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(updatedMessages);
      const aiReply = res.reply || "I'm reflecting on your thoughts. How does that sit with you?";
      setMessages([...updatedMessages, { role: 'assistant', content: aiReply }]);
    } catch (err) {
      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: "I encountered a brief connection hesitation. Let's continue—what were you sharing?" }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSpeak(text) {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text.replace(/[*_#`]/g, ''));
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden font-sans max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Gemini Mirror Companion
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                gemini-1.5-flash
              </span>
            </h3>
            <p className="text-xs text-slate-500">Socratic Brainstorming & Active Listening</p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                role: 'assistant',
                content: `Welcome to a fresh session, ${user?.name ? user.name.split(' ')[0] : 'friend'}. What shall we explore today?`
              }
            ]);
          }}
          title="Reset Conversation"
          className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser ? 'bg-slate-900 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200/60'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {!isUser && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-end text-[10px] text-slate-500">
                    <button
                      onClick={() => handleSpeak(msg.content)}
                      className="hover:text-emerald-700 flex items-center gap-1 transition-colors"
                    >
                      {isSpeaking ? <VolumeX className="w-3 h-3 text-rose-500" /> : <Volume2 className="w-3 h-3" />}
                      <span>{isSpeaking ? 'Mute' : 'Listen'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-600 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              <span>Gemini is reflecting thoughtfully...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts */}
      {messages.length <= 2 && (
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-2">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            Suggested Reflection Starters
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STARTER_PROMPTS.map((sp, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sp.prompt)}
                className="text-left p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 text-xs text-slate-700 hover:text-emerald-900 transition-all flex items-center justify-between shadow-sm"
              >
                <span>{sp.title}</span>
                <span className="text-emerald-600 font-bold text-xs">➔</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 sm:p-4 border-t border-slate-100 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Share your thoughts with Gemini..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition-all shadow-sm active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}

import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Compass } from 'lucide-react';

const MOOD_COLORS = {
  Joy: '#f59e0b',
  Calm: '#06b6d4',
  Grateful: '#10b981',
  Reflective: '#8b5cf6',
  Stressed: '#f43f5e',
  Energetic: '#ec4899'
};

export default function ConstellationView({ entries = [] }) {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(entries[0] || null);
  const nodesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    nodesRef.current = entries.map((entry, idx) => {
      const angle = (idx / Math.max(entries.length, 1)) * 2 * Math.PI + (idx * 0.4);
      const radius = Math.min(width, height) * 0.32 + ((idx % 3) * 25 - 15);
      const cx = width / 2 + Math.cos(angle) * radius;
      const cy = height / 2 + Math.sin(angle) * radius;

      return {
        ...entry,
        x: cx,
        y: cy,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 7 + (entry.sentimentScore ? Math.abs(entry.sentimentScore) * 5 : 3),
        color: MOOD_COLORS[entry.mood] || '#10b981'
      };
    });

    function render() {
      ctx.clearRect(0, 0, width, height);

      // Links
      ctx.lineWidth = 1;
      for (let i = 0; i < nodesRef.current.length; i++) {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const n1 = nodesRef.current[i];
          const n2 = nodesRef.current[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 260) {
            const opacity = (1 - dist / 260) * 0.3;
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      nodesRef.current.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 30 || node.x > width - 30) node.vx *= -1;
        if (node.y < 30 || node.y > height - 30) node.vy *= -1;

        const isSelected = selectedNode?.id === node.id;

        // Outer glow
        const glowGrad = ctx.createRadialGradient(node.x, node.y, 1, node.x, node.y, node.size * 3);
        glowGrad.addColorStop(0, `${node.color}50`);
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 3, 0, 2 * Math.PI);
        ctx.fill();

        // Core
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelected ? node.size + 2 : node.size, 0, 2 * Math.PI);
        ctx.fill();

        // Label
        ctx.font = '11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.fillText(node.title.substring(0, 16) + (node.title.length > 16 ? '...' : ''), node.x + 10, node.y + 4);
      });

      animationFrameId = requestAnimationFrame(render);
    }

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [entries, selectedNode]);

  function handleCanvasClick(e) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (const node of nodesRef.current) {
      const dx = mouseX - node.x;
      const dy = mouseY - node.y;
      if (Math.sqrt(dx * dx + dy * dy) < node.size * 2.5) {
        setSelectedNode(node);
        return;
      }
    }
  }

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Thought Constellation Galaxy</h2>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Neural Web
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive visual network connecting thoughts by emotional resonance.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Joy</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> Calm</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Reflective</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Canvas */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative min-h-[440px] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-crosshair relative z-10"
            style={{ minHeight: '420px' }}
          />
          <div className="absolute bottom-4 left-6 z-20 text-[11px] text-slate-400 flex items-center gap-1.5 pointer-events-none">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            Click any star node to reveal its memory
          </div>
        </div>

        {/* Selected Inspector */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedNode.mood}
                </span>
                <span className="text-xs text-slate-400">
                  {selectedNode.createdAt ? new Date(selectedNode.createdAt).toLocaleDateString() : 'Recent'}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                  {selectedNode.title}
                </h3>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto">
                  "{selectedNode.content}"
                </div>
              </div>

              {selectedNode.aiReflectionSummary && (
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Resonance Insight
                  </div>
                  <p className="text-xs text-slate-700 italic">
                    "{selectedNode.aiReflectionSummary}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="my-auto text-center text-xs text-slate-400 py-12">
              Select any star to reveal its thoughts.
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Gemini Neural Memory Map
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

function formatMessage(text) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: 18, fontWeight: 600, color: '#e2e8f0', margin: '16px 0 8px' }}>{line.replace('## ', '')}</h2>;
    if (line.startsWith('# ')) return <h1 key={i} style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', margin: '16px 0 8px' }}>{line.replace('# ', '')}</h1>;
    if (line.startsWith('**Summary:**') || line.startsWith('Summary:')) return <div key={i} style={{ background: 'rgba(108,71,255,0.15)', border: '1px solid rgba(108,71,255,0.3)', borderRadius: 8, padding: '10px 14px', marginTop: 14, fontSize: 14, color: '#a78bfa' }}>{line}</div>;
    if (line.match(/^[\*\-] /)) return <div key={i} style={{ display: 'flex', gap: 10, margin: '6px 0', paddingLeft: 4 }}><span style={{ color: '#6c47ff', marginTop: 2, flexShrink: 0 }}>▸</span><span style={{ color: '#cbd5e1', fontSize: 15, lineHeight: 1.7 }}>{line.replace(/^[\*\-] /, '')}</span></div>;
    if (line.match(/^\d+\. /)) return <div key={i} style={{ display: 'flex', gap: 10, margin: '6px 0', paddingLeft: 4 }}><span style={{ color: '#6c47ff', fontWeight: 600, fontSize: 13, flexShrink: 0, minWidth: 20 }}>{line.match(/^\d+/)[0]}.</span><span style={{ color: '#cbd5e1', fontSize: 15, lineHeight: 1.7 }}>{line.replace(/^\d+\. /, '')}</span></div>;
    if (line.trim() === '') return <div key={i} style={{ height: 8 }} />;
    return <p key={i} style={{ color: '#cbd5e1', fontSize: 15, lineHeight: 1.8, margin: '4px 0' }}>{line}</p>;
  });
}

export default function App() {
  const [url, setUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [urlLocked, setUrlLocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.2,
        color: ['#6c47ff', '#00d4ff', '#ff47a3', '#ffffff'][Math.floor(Math.random() * 4)],
        opacity: Math.random() * 0.7 + 0.1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#080810';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient1 = ctx.createRadialGradient(canvas.width * 0.2, canvas.height * 0.3, 0, canvas.width * 0.2, canvas.height * 0.3, 400);
      gradient1.addColorStop(0, 'rgba(108,71,255,0.12)');
      gradient1.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient2 = ctx.createRadialGradient(canvas.width * 0.8, canvas.height * 0.7, 0, canvas.width * 0.8, canvas.height * 0.7, 350);
      gradient2.addColorStop(0, 'rgba(0,212,255,0.08)');
      gradient2.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient3 = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.1, 0, canvas.width * 0.5, canvas.height * 0.1, 300);
      gradient3.addColorStop(0, 'rgba(255,71,163,0.06)');
      gradient3.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient3;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gridSize = 60;
      const vanishX = canvas.width / 2;
      const vanishY = canvas.height * 0.4;

      for (let x = 0; x <= canvas.width; x += gridSize) {
        const progress = x / canvas.width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(vanishX + (x - vanishX) * 0.1, vanishY);
        ctx.strokeStyle = `rgba(108,71,255,${0.04 + Math.abs(progress - 0.5) * 0.02})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += gridSize) {
        const progress = y / canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.strokeStyle = `rgba(108,71,255,${0.03 + progress * 0.02})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      particles.forEach(p => {
        p.z -= p.speed * 2;
        if (p.z <= 0) p.z = 1000;

        const scale = 1000 / p.z;
        const px = (p.x - canvas.width / 2) * scale + canvas.width / 2;
        const py = (p.y - canvas.height / 2) * scale + canvas.height / 2;
        const size = p.size * scale;
        const opacity = Math.min(p.opacity, (1000 - p.z) / 300);

        if (px < 0 || px > canvas.width || py < 0 || py > canvas.height) return;

        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.1, size), 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(')', `,${opacity})`).replace('rgb', 'rgba').replace('#', '');

        const hex = p.color;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!url || !question) return;
    setUrlLocked(true);
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setQuestion('');
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/chat`, { url, question });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    }
    setLoading(false);
  };

  const handleReset = () => {
    setMessages([]);
    setUrlLocked(false);
    setUrl('');
    setError('');
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080810; overflow-x: hidden; }

        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInRight { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes bounce { 0%,100% { transform: translateY(0); opacity:0.3; } 50% { transform: translateY(-7px); opacity:1; } }
        @keyframes pulse { 0%,100% { opacity:1; box-shadow: 0 0 0 0 rgba(108,71,255,0.4); } 50% { opacity:0.8; box-shadow: 0 0 0 6px rgba(108,71,255,0); } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes glowPulse { 0%,100% { box-shadow: 0 0 20px rgba(108,71,255,0.3); } 50% { box-shadow: 0 0 40px rgba(108,71,255,0.6), 0 0 80px rgba(0,212,255,0.2); } }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(108,71,255,0.3); border-radius: 4px; }

        .hint-chip:hover { background: rgba(108,71,255,0.25) !important; color: #c4b5fd !important; transform: translateY(-2px); }
        .ask-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(108,71,255,0.5) !important; }
        .ask-btn:active:not(:disabled) { transform: translateY(0); }
        .url-input:focus { border-color: rgba(108,71,255,0.6) !important; box-shadow: 0 0 0 3px rgba(108,71,255,0.1) !important; }
        .question-input:focus { border-color: rgba(108,71,255,0.6) !important; box-shadow: 0 0 0 3px rgba(108,71,255,0.1) !important; }
      `}</style>

      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px 60px', fontFamily: '"Inter", system-ui, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: 740 }}>

          <div style={{ textAlign: 'center', marginBottom: 48, animation: mounted ? 'fadeInUp 0.9s ease both' : 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(108,71,255,0.12)', border: '1px solid rgba(108,71,255,0.25)', borderRadius: 30, padding: '6px 16px', marginBottom: 20 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#6c47ff', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 11, color: '#a78bfa', letterSpacing: '0.1em', fontWeight: 600 }}>POWERED BY GROQ AI</span>
            </div>

            <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, marginBottom: 16, background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 40%, #00d4ff 100%)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'shimmer 5s linear infinite' }}>
              Chat with any<br />website
            </h1>
            <p style={{ color: '#64748b', fontSize: 17, lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
              Paste any URL and have a deep conversation with its content using AI
            </p>
          </div>

          <div style={{ animation: mounted ? 'fadeInUp 0.9s ease 0.15s both' : 'none' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '6px 6px 6px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              {urlLocked ? (
                <>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0, boxShadow: '0 0 8px rgba(34,197,94,0.6)' }} />
                    <span style={{ color: '#94a3b8', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
                  </div>
                  <button onClick={handleReset} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 10, padding: '8px 16px', fontSize: 13, cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}>
                    New chat
                  </button>
                </>
              ) : (
                <input className="url-input" type="url" placeholder="https://en.wikipedia.org/wiki/JavaScript" value={url} onChange={e => setUrl(e.target.value)}
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 15, padding: '10px 0', transition: 'all 0.3s' }} />
              )}
            </div>
          </div>

          {messages.length === 0 && !loading ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', animation: mounted ? 'fadeInUp 0.9s ease 0.3s both' : 'none' }}>
              <div style={{ fontSize: 44, marginBottom: 16, display: 'block', animation: 'float 3s ease-in-out infinite' }}>💬</div>
              <p style={{ color: '#475569', fontSize: 15, marginBottom: 20 }}>Ask anything — get detailed, structured answers</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {['What is this page about?', 'Summarize the key points', 'What are the main topics?', 'Give me important facts'].map(hint => (
                  <span key={hint} className="hint-chip" onClick={() => setQuestion(hint)}
                    style={{ background: 'rgba(108,71,255,0.1)', border: '1px solid rgba(108,71,255,0.2)', color: '#8b7cf8', borderRadius: 30, padding: '8px 16px', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
                    {hint}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '28px 28px', marginBottom: 16, maxHeight: 520, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', animation: m.role === 'ai' ? 'fadeInLeft 0.4s ease' : 'fadeInRight 0.4s ease' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: m.role === 'ai' ? 'linear-gradient(135deg, #6c47ff, #00d4ff)' : 'rgba(255,255,255,0.07)', border: m.role === 'user' ? '1px solid rgba(255,255,255,0.1)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0, marginTop: 2, animation: m.role === 'ai' ? 'glowPulse 3s ease-in-out infinite' : 'none' }}>
                    {m.role === 'ai' ? 'AI' : 'You'}
                  </div>
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: m.role === 'ai' ? '#6c47ff' : '#475569', marginBottom: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {m.role === 'ai' ? 'AI Answer' : 'Your Question'}
                    </div>
                    {m.role === 'ai' ? (
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '18px 20px' }}>
                        {formatMessage(m.text)}
                      </div>
                    ) : (
                      <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7 }}>{m.text}</p>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', animation: 'fadeInLeft 0.4s ease' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, #6c47ff, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>AI</div>
                  <div style={{ flex: 1, paddingTop: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#6c47ff', marginBottom: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Thinking...</div>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: '#6c47ff', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '14px 18px', color: '#f87171', fontSize: 14, marginBottom: 14, lineHeight: 1.6 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleAsk} style={{ display: 'flex', gap: 10, animation: mounted ? 'fadeInUp 0.9s ease 0.3s both' : 'none' }}>
            <input className="question-input" type="text" placeholder="Ask anything about this page..." value={question} onChange={e => setQuestion(e.target.value)} disabled={loading}
              style={{ flex: 1, padding: '14px 20px', fontSize: 15, background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, color: '#e2e8f0', outline: 'none', transition: 'all 0.3s' }} />
            <button className="ask-btn" type="submit" disabled={loading || !url}
              style={{ padding: '14px 30px', fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 14, cursor: loading || !url ? 'not-allowed' : 'pointer', background: loading || !url ? 'rgba(108,71,255,0.3)' : 'linear-gradient(135deg, #6c47ff, #00d4ff)', color: '#fff', transition: 'all 0.3s', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
              {loading ? '...' : 'Ask AI'}
            </button>
          </form>

        </div>
      </div>
    </>
  );
}
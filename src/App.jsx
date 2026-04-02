import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   RAIS3 TH3 VIBRATION — RTV33
   A next-generation digital consciousness ecosystem
   ═══════════════════════════════════════════════════════════════ */

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// ─── Matrix Rain Canvas ───
function MatrixRain() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, columns, drops;
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFRTV33ΣΩΔΘΨξζφ∞◈⬡◎⊛✧⊕";
    const fontSize = 14;

    const init = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      columns = Math.floor(w / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -100);
    };
    init();
    window.addEventListener("resize", init);

    const draw = () => {
      ctx.fillStyle = "rgba(5, 5, 8, 0.06)";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Head character — bright green
        const brightness = Math.random();
        if (brightness > 0.95) {
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "#00ff8c";
          ctx.shadowBlur = 15;
        } else if (brightness > 0.7) {
          ctx.fillStyle = "#00ff8c";
          ctx.shadowColor = "#00ff8c";
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = `rgba(0, 255, 140, ${0.15 + Math.random() * 0.35})`;
          ctx.shadowBlur = 0;
        }

        ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
        ctx.fillText(char, x, y);
        ctx.shadowBlur = 0;

        if (y > h && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.6 + Math.random() * 0.4;
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { window.removeEventListener("resize", init); cancelAnimationFrame(animRef.current); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, opacity: 0.7 }} />;
}

// ─── Particle Canvas ───
function ParticleField({ mousePos, entered }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animRef = useRef(null);
  const dims = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      dims.current = { w: window.innerWidth, h: window.innerHeight };
      canvas.width = dims.current.w * window.devicePixelRatio;
      canvas.height = dims.current.h * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);
    const count = Math.min(160, Math.floor((dims.current.w * dims.current.h) / 9000));
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * dims.current.w, y: Math.random() * dims.current.h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5,
      hue: Math.random() > 0.6 ? 140 + Math.random() * 30 : 270 + Math.random() * 40,
      alpha: Math.random() * 0.5 + 0.2, pulse: Math.random() * Math.PI * 2,
    }));
    const draw = (time) => {
      const { w, h } = dims.current;
      ctx.clearRect(0, 0, w, h);
      const mx = mousePos.current?.x ?? w / 2;
      const my = mousePos.current?.y ?? h / 2;
      const t = time * 0.001;
      particles.current.forEach((p) => {
        const dx = mx - p.x, dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        const force = clamp(80 / dist, 0, 0.8);
        p.vx += (dx / dist) * force * 0.01; p.vy += (dy / dist) * force * 0.01;
        p.vx *= 0.99; p.vy *= 0.99; p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
        const pa = p.alpha + Math.sin(t * 1.5 + p.pulse) * 0.15;
        const glow = p.r + Math.sin(t * 2 + p.pulse) * 0.8;
        ctx.beginPath(); ctx.arc(p.x, p.y, glow, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${pa})`;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 60%, 0.6)`; ctx.shadowBlur = 12;
        ctx.fill(); ctx.shadowBlur = 0;
      });
      const pts = particles.current;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = dx * dx + dy * dy;
          if (d < 12000) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(0, 255, 140, ${(1 - d / 12000) * 0.15})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animRef.current); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, opacity: entered ? 0.35 : 0.7, transition: "opacity 1.5s ease", pointerEvents: "none" }} />;
}

// ─── Energy Orb ───
function EnergyOrb({ score, mood }) {
  const hue = mood === "calm" ? 180 : mood === "energized" ? 130 : 270;
  return (
    <>
      <style>{`@keyframes orbPulse { 0%, 100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.08); filter: brightness(1.3); } }`}</style>
      <div style={{ width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, hsla(${hue}, 90%, 75%, 0.9), hsla(${hue}, 70%, 30%, 0.6) 60%, transparent 80%)`, boxShadow: `0 0 60px hsla(${hue}, 80%, 50%, 0.5), 0 0 120px hsla(${hue}, 60%, 40%, 0.3), inset 0 0 40px hsla(${hue}, 90%, 70%, 0.3)`, animation: "orbPulse 4s ease-in-out infinite", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <span style={{ fontSize: 36, fontWeight: 700, color: "#fff", textShadow: `0 0 20px hsla(${hue}, 80%, 60%, 0.8)`, fontFamily: "'Orbitron', sans-serif" }}>{score}</span>
        <span style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginTop: 4 }}>vibration</span>
      </div>
    </>
  );
}

// ─── Chakra Meter ───
function ChakraMeter({ levels }) {
  const chakras = [
    { name: "Crown", color: "#a855f7", emoji: "👑" }, { name: "Third Eye", color: "#6366f1", emoji: "👁" },
    { name: "Throat", color: "#06b6d4", emoji: "💎" }, { name: "Heart", color: "#22c55e", emoji: "💚" },
    { name: "Solar Plexus", color: "#eab308", emoji: "☀️" }, { name: "Sacral", color: "#f97316", emoji: "🔥" },
    { name: "Root", color: "#ef4444", emoji: "🌍" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {chakras.map((c, i) => (
        <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 24, textAlign: "center", fontSize: 14 }}>{c.emoji}</span>
          <span style={{ width: 80, fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: 1, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>{c.name}</span>
          <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${levels[i]}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${c.color}88, ${c.color})`, boxShadow: `0 0 10px ${c.color}66`, transition: "width 1s ease" }} />
          </div>
          <span style={{ fontSize: 11, color: c.color, fontFamily: "'Orbitron', sans-serif", width: 30, textAlign: "right" }}>{levels[i]}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── Glass Card ───
function GlassCard({ children, style = {}, onClick, hover = true }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onClick}
      style={{ background: hovered && hover ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28, transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)", transform: hovered && hover ? "translateY(-2px)" : "none", boxShadow: hovered && hover ? "0 12px 40px rgba(0,255,140,0.08)" : "0 4px 20px rgba(0,0,0,0.3)", cursor: onClick ? "pointer" : "default", ...style }}>
      {children}
    </div>
  );
}

// ─── Breathing Guide ───
function BreathingGuide() {
  const [phase, setPhase] = useState("inhale");
  const [count, setCount] = useState(4);
  const [active, setActive] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    let step = 0, idx = 0;
    const phases = [{ p: "inhale", d: 4 }, { p: "hold", d: 7 }, { p: "exhale", d: 8 }];
    const tick = () => {
      const current = phases[idx];
      setPhase(current.p); setCount(current.d - step); step++;
      if (step > current.d) { step = 0; idx = (idx + 1) % phases.length; }
      timerRef.current = setTimeout(tick, 1000);
    };
    tick();
    return () => clearTimeout(timerRef.current);
  }, [active]);
  const ringSize = phase === "inhale" ? 200 : phase === "hold" ? 200 : 120;
  const ringColor = phase === "inhale" ? "#00ff8c" : phase === "hold" ? "#a78bfa" : "#06b6d4";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <div style={{ width: ringSize, height: ringSize, borderRadius: "50%", border: `2px solid ${ringColor}`, boxShadow: `0 0 40px ${ringColor}44, inset 0 0 30px ${ringColor}22`, transition: "all 2s cubic-bezier(0.22, 1, 0.36, 1)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        {active ? (<><span style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 4, color: ringColor, fontFamily: "'Orbitron', sans-serif" }}>{phase}</span><span style={{ fontSize: 36, color: "#fff", fontWeight: 200, marginTop: 4 }}>{count}</span></>) : (<span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: 2 }}>READY</span>)}
      </div>
      <button onClick={() => setActive(!active)} style={{ background: active ? "rgba(255,60,60,0.15)" : "rgba(0,255,140,0.1)", border: `1px solid ${active ? "rgba(255,60,60,0.3)" : "rgba(0,255,140,0.3)"}`, color: active ? "#ff6b6b" : "#00ff8c", padding: "10px 28px", borderRadius: 8, cursor: "pointer", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'Orbitron', sans-serif", transition: "all 0.3s ease" }}>
        {active ? "STOP" : "BEGIN BREATHWORK"}
      </button>
    </div>
  );
}

// ─── AI Guide Chat ───
function AIGuide() {
  const [msgs, setMsgs] = useState([{ from: "ai", text: "Welcome, seeker. I am your guide within the signal. What aspect of your journey would you like to explore today?" }]);
  const [input, setInput] = useState("");
  const responses = [
    "Your awareness of this question is itself a form of growth. Consider sitting with it during your next meditation.",
    "The body carries wisdom the mind overlooks. What is your body telling you right now?",
    "Growth is not linear. Some days the signal is stronger than others. Honor the rhythm.",
    "Try this: before your next meal, take three conscious breaths. Notice how it changes the experience.",
    "The path to higher vibration begins with radical honesty with yourself. What truth are you avoiding?",
    "Consider a digital sunset tonight — no screens after 8pm. Notice what arises in the silence.",
    "Your frequency rises when you align action with intention. What is one small alignment you can make today?",
    "Tesla understood that 3, 6, and 9 are the keys to the universe. Observe these patterns in your daily life.",
    "The ether is not empty — it is the medium through which all energy flows. Tune into it.",
  ];
  const send = () => {
    if (!input.trim()) return;
    const newMsgs = [...msgs, { from: "user", text: input }];
    setInput("");
    setTimeout(() => { setMsgs([...newMsgs, { from: "ai", text: responses[Math.floor(Math.random() * responses.length)] }]); }, 800 + Math.random() * 600);
    setMsgs(newMsgs);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: 380 }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 8, marginBottom: 16 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.from === "user" ? "flex-end" : "flex-start", maxWidth: "80%", padding: "12px 16px", borderRadius: 12, background: m.from === "user" ? "rgba(0,255,140,0.1)" : "rgba(255,255,255,0.05)", border: `1px solid ${m.from === "user" ? "rgba(0,255,140,0.2)" : "rgba(255,255,255,0.08)"}`, color: m.from === "user" ? "#a0ffc8" : "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.6 }}>
            {m.from === "ai" && <span style={{ fontSize: 10, color: "#a78bfa", letterSpacing: 2, display: "block", marginBottom: 6 }}>◈ RTV33 GUIDE</span>}
            {m.text}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask the guide..." style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "'JetBrains Mono', monospace" }} />
        <button onClick={send} style={{ background: "rgba(0,255,140,0.12)", border: "1px solid rgba(0,255,140,0.3)", borderRadius: 8, padding: "0 20px", color: "#00ff8c", cursor: "pointer", fontSize: 12, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>SEND</button>
      </div>
    </div>
  );
}

// ─── Community Nodes ───
function CommunityField() {
  const nodes = useMemo(() => Array.from({ length: 24 }, (_, i) => ({ x: 15 + Math.random() * 70, y: 10 + Math.random() * 80, size: 6 + Math.random() * 10, hue: [140, 270, 190, 320][Math.floor(Math.random() * 4)], name: ["Aria","Zeph","Luna","Kael","Nyx","Sol","Indra","Sage","Echo","Flux","Vera","Orion","Mira","Zenith","Aura","Blaze","Cipher","Drift","Ember","Fable","Glyph","Halo","Ion","Jade"][i], level: Math.floor(Math.random() * 30 + 10), pulse: Math.random() * 4 + 2 })), []);
  const edges = useMemo(() => { const e = []; nodes.forEach((n, i) => { for (let c = 0; c < Math.floor(Math.random() * 2) + 1; c++) { e.push([i, (i + Math.floor(Math.random() * 5) + 1) % nodes.length]); } }); return e; }, []);
  return (
    <div style={{ position: "relative", width: "100%", height: 400 }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
        {edges.map(([a, b], i) => <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="rgba(0,255,140,0.08)" strokeWidth="0.2" />)}
      </svg>
      {nodes.map((n, i) => <div key={i} title={`${n.name} — Level ${n.level}`} style={{ position: "absolute", left: `${n.x}%`, top: `${n.y}%`, width: n.size, height: n.size, borderRadius: "50%", background: `hsla(${n.hue}, 70%, 55%, 0.7)`, boxShadow: `0 0 ${n.size}px hsla(${n.hue}, 80%, 50%, 0.4)`, animation: `orbPulse ${n.pulse}s ease-in-out infinite`, cursor: "pointer", transform: "translate(-50%, -50%)" }} />)}
    </div>
  );
}

// ─── World Map ───
function WorldMap() {
  const [dots, setDots] = useState([]);
  useEffect(() => {
    const interval = setInterval(() => { setDots(d => [...d.filter(dd => dd.opacity > 0).slice(-30), { x: 10 + Math.random() * 80, y: 15 + Math.random() * 65, id: Date.now(), opacity: 1 }]); }, 600);
    return () => clearInterval(interval);
  }, []);
  return (
    <div style={{ position: "relative", width: "100%", height: 260, background: "rgba(255,255,255,0.02)", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
      {dots.map(d => <div key={d.id} style={{ position: "absolute", left: `${d.x}%`, top: `${d.y}%`, width: 6, height: 6, borderRadius: "50%", background: "#00ff8c", boxShadow: "0 0 12px #00ff8c88", animation: "orbPulse 2s ease-out forwards", transform: "translate(-50%, -50%)" }} />)}
      <div style={{ position: "absolute", bottom: 16, left: 20, fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, fontFamily: "'JetBrains Mono', monospace" }}>LIVE — 1,247 CONNECTED SOULS</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE PORTAL — MASSIVE EXPANSION
// ═══════════════════════════════════════════════════════════════

const KNOWLEDGE_CATEGORIES = [
  {
    id: "ebooks",
    icon: "📚",
    title: "eBook Vault",
    color: "#a78bfa",
    desc: "Forbidden knowledge, suppressed science, and consciousness-expanding literature.",
    items: [
      { title: "The Kybalion — Three Initiates", desc: "The 7 Hermetic principles that govern all reality. The foundation of metaphysical understanding.", tags: ["HERMETIC", "CLASSIC"], status: "free", pages: 223 },
      { title: "The Secret Teachings of All Ages — Manly P. Hall", desc: "An encyclopedic outline of Masonic, Hermetic, Qabbalistic and Rosicrucian symbolical philosophy.", tags: ["ESOTERIC", "ENCYCLOPEDIA"], status: "free", pages: 768 },
      { title: "The Science of Getting Rich — Wallace D. Wattles", desc: "The original manifestation blueprint. Vibrational alignment with abundance through exact science.", tags: ["MANIFESTATION", "CLASSIC"], status: "free", pages: 89 },
      { title: "As A Man Thinketh — James Allen", desc: "Your thoughts shape your reality. The foundational text on mind-body-reality connection.", tags: ["MINDSET", "CLASSIC"], status: "free", pages: 68 },
      { title: "The Emerald Tablets of Thoth", desc: "Ancient wisdom attributed to Thoth the Atlantean. Consciousness, alchemy, and dimensional travel.", tags: ["ANCIENT", "ESOTERIC"], status: "free", pages: 54 },
      { title: "The Law of One — Ra Material", desc: "Channeled material exploring the nature of reality, densities of consciousness, and unity.", tags: ["CHANNELED", "METAPHYSICS"], status: "free", pages: 1800 },
      { title: "Autobiography of a Yogi — Paramahansa Yogananda", desc: "The spiritual classic that awakened millions. Steve Jobs had one copy — read it yearly.", tags: ["YOGA", "AUTOBIOGRAPHY"], status: "free", pages: 498 },
      { title: "The Tao Te Ching — Lao Tzu", desc: "81 verses on the nature of existence, flow, and the way. Eternal simplicity.", tags: ["TAOISM", "CLASSIC"], status: "free", pages: 96 },
    ]
  },
  {
    id: "369",
    icon: "🔢",
    title: "The 369 Code",
    color: "#eab308",
    desc: "Tesla's key to the universe. Vortex mathematics, manifestation codes, and the divine frequency pattern.",
    items: [
      { title: "Tesla's 369 — The Key to the Universe", desc: "Why Tesla was obsessed with 3, 6, and 9. Vortex math reveals the fingerprint of creation in every natural pattern.", tags: ["TESLA", "MATH"], locked: false },
      { title: "369 Manifestation Method", desc: "Write your intention 3x morning, 6x afternoon, 9x evening. The neurological and energetic science behind why it works.", tags: ["MANIFESTATION", "PRACTICE"], locked: false },
      { title: "Vortex Mathematics — Marko Rodin", desc: "The Rodin Coil and toroidal energy. How 3-6-9 maps the geometry of electromagnetic fields and zero-point energy.", tags: ["VORTEX", "GEOMETRY"], locked: false },
      { title: "Digital Root Patterns in Nature", desc: "From sunflower spirals to DNA — how digital root reduction always reveals 3, 6, 9 as the governing framework.", tags: ["NATURE", "PATTERNS"], locked: false },
      { title: "Frequency 369Hz — The Creation Tone", desc: "Solfeggio frequencies and their relationship to the 369 pattern. Sound as architecture of matter.", tags: ["SOUND", "FREQUENCY"], locked: false },
      { title: "Sacred Geometry & The 369 Blueprint", desc: "How the Flower of Life, Metatron's Cube, and all Platonic solids encode 3, 6, 9 at their mathematical core.", tags: ["GEOMETRY", "SACRED"], locked: false },
    ]
  },
  {
    id: "ether",
    icon: "🌊",
    title: "Ether & Scalar Energy",
    color: "#06b6d4",
    desc: "The suppressed science of the luminiferous ether, scalar waves, and the fabric of reality they tried to erase.",
    items: [
      { title: "What Is the Ether?", desc: "Before Einstein, every physicist knew space wasn't empty. The ether is the medium through which light, gravity, and consciousness propagate.", tags: ["ETHER", "FOUNDATION"], locked: false },
      { title: "Scalar Waves — Beyond Hertzian", desc: "Tesla's longitudinal waves that pass through any material, carry energy without loss, and may be the mechanism of thought transference.", tags: ["SCALAR", "TESLA"], locked: false },
      { title: "The Michelson-Morley Cover-Up", desc: "Why the 1887 experiment didn't actually disprove the ether — and the political reasons it was declared so.", tags: ["HISTORY", "SUPPRESSED"], locked: false },
      { title: "Zero-Point Energy Field", desc: "Quantum vacuum fluctuations prove space is teeming with energy. The modern rediscovery of what ancients called ether.", tags: ["QUANTUM", "ENERGY"], locked: false },
      { title: "Scalar Healing Technologies", desc: "How scalar fields interact with the body's biofield. Cellular voltage, DNA antenna theory, and frequency restoration.", tags: ["HEALING", "BIOFIELD"], locked: false },
      { title: "Tom Bearden's MEG & Free Energy", desc: "Motionless electromagnetic generators and over-unity devices. The engineering principles behind tapping the vacuum.", tags: ["FREE ENERGY", "ENGINEERING"], locked: false },
      { title: "Torsion Fields — Russian Research", desc: "Decades of Russian scientific research into torsion fields — spin waves in the physical vacuum that carry information.", tags: ["TORSION", "RESEARCH"], locked: false },
    ]
  },
  {
    id: "copper",
    icon: "⚡",
    title: "Copper & Energy Tech",
    color: "#f97316",
    desc: "Copper wire technology, orgone energy, electromagnetic healing, and building your own energy devices.",
    items: [
      { title: "Copper — The Sacred Conductor", desc: "Why every ancient civilization revered copper. Its unique electromagnetic properties, antimicrobial power, and spiritual significance.", tags: ["COPPER", "FOUNDATION"], locked: false },
      { title: "Building a Copper Tensor Ring", desc: "Step-by-step guide to creating tensor rings using sacred cubit measurements. Water structuring, pain relief, and field generation.", tags: ["DIY", "TENSOR"], locked: false },
      { title: "The Orgone Accumulator", desc: "Wilhelm Reich's discovery of orgone energy. How layered organic and metallic materials concentrate life force energy.", tags: ["ORGONE", "REICH"], locked: false },
      { title: "Copper Coils & Vortex Energy", desc: "Rodin coils, bifilar pancake coils, and caduceus windings. How copper wire geometry creates scalar fields.", tags: ["COILS", "VORTEX"], locked: false },
      { title: "Earthing & Copper Grounding", desc: "Connecting to Earth's electromagnetic field through copper grounding rods. Reducing inflammation, improving sleep, resetting circadian rhythm.", tags: ["EARTHING", "HEALTH"], locked: false },
      { title: "Copper Water Vessels — Ancient Practice", desc: "Storing water in copper vessels for 8+ hours. Oligodynamic effect, alkalinity, and what Ayurveda has known for 5,000 years.", tags: ["WATER", "AYURVEDA"], locked: false },
      { title: "Building a Lakhovsky MWO", desc: "The Multi-Wave Oscillator. How copper antenna arrays broadcast a spectrum of frequencies that restore cellular vitality.", tags: ["MWO", "ADVANCED"], locked: true },
    ]
  },
  {
    id: "awakening",
    icon: "👁",
    title: "Awakening & Hidden Truths",
    color: "#ef4444",
    desc: "The reality behind the systems. Government programs, suppressed history, and the architecture of control.",
    items: [
      { title: "Operation Mockingbird & Media Control", desc: "CIA's systematic infiltration of mainstream media. Understanding the lens through which your reality is constructed.", tags: ["CIA", "MEDIA"], locked: false },
      { title: "The Federal Reserve — Private Control", desc: "How a private banking cartel gained control of the money supply in 1913. The debt system that enslaves nations.", tags: ["BANKING", "MONETARY"], locked: false },
      { title: "MKUltra & Mind Control Programs", desc: "Declassified CIA documents proving decades of mind control experimentation. Understanding psychic driving and trauma-based programming.", tags: ["MKULTRA", "DECLASSIFIED"], locked: false },
      { title: "Water Fluoridation — The Full Picture", desc: "Industrial waste product added to drinking water. Pineal gland calcification, IQ studies, and the countries that banned it.", tags: ["FLUORIDE", "HEALTH"], locked: false },
      { title: "The Pineal Gland — Your Third Eye", desc: "DMT production, melatonin regulation, and why every ancient tradition knew this gland was the seat of consciousness.", tags: ["PINEAL", "CONSCIOUSNESS"], locked: false },
      { title: "Suppressed Medical Technologies", desc: "Royal Rife's frequency machine, Hulda Clark's zapper, and the pattern of inventors whose work threatened pharmaceutical revenue.", tags: ["MEDICAL", "SUPPRESSED"], locked: false },
      { title: "Tartaria & The Mud Flood Theory", desc: "Architectural anomalies, buried buildings, and the possibility of a recent reset. Old world technology and free energy infrastructure.", tags: ["HISTORY", "ALTERNATIVE"], locked: false },
      { title: "The Declassified Files — Gateway Process", desc: "The CIA's own research into out-of-body experiences, remote viewing, and the holographic nature of reality.", tags: ["CIA", "GATEWAY"], locked: false },
    ]
  },
  {
    id: "frequency",
    icon: "〰️",
    title: "Frequency & Sound Healing",
    color: "#22c55e",
    desc: "Solfeggio frequencies, cymatics, binaural beats, and using sound as medicine.",
    items: [
      { title: "The Solfeggio Scale — Original Frequencies", desc: "174Hz, 285Hz, 396Hz, 417Hz, 528Hz, 639Hz, 741Hz, 852Hz, 963Hz. What each frequency does and why they were hidden.", tags: ["SOLFEGGIO", "HEALING"], locked: false },
      { title: "528Hz — The Love Frequency", desc: "DNA repair frequency. How Dr. Leonard Horowitz rediscovered the miracle tone used by ancient priests.", tags: ["528HZ", "DNA"], locked: false },
      { title: "432Hz vs 440Hz — The Tuning Conspiracy", desc: "Why music was retuned from 432Hz (natural harmonic) to 440Hz in 1939. The Rockefeller connection.", tags: ["432HZ", "MUSIC"], locked: false },
      { title: "Cymatics — Sound Made Visible", desc: "How frequencies create geometric patterns in matter. The visual proof that vibration creates structure.", tags: ["CYMATICS", "VISUAL"], locked: false },
      { title: "Binaural Beats & Brainwave Entrainment", desc: "Delta, theta, alpha, beta, gamma. Tuning your brain state with precisely calibrated audio frequencies.", tags: ["BINAURAL", "BRAIN"], locked: false },
      { title: "Dr. Emoto's Water Experiments", desc: "How words, music, and intention physically alter water crystal structure. You are 70% water.", tags: ["WATER", "CONSCIOUSNESS"], locked: false },
    ]
  },
  {
    id: "body",
    icon: "🧬",
    title: "Body Optimization",
    color: "#a855f7",
    desc: "Detox protocols, fasting science, sun gazing, grounding, and treating the body as the temple it is.",
    items: [
      { title: "The Master Cleanse & Detox Protocols", desc: "Liver flushes, parasite cleanses, heavy metal detox. A systematic approach to removing what shouldn't be there.", tags: ["DETOX", "CLEANSE"], locked: false },
      { title: "Dry Fasting — The Ultimate Reset", desc: "Beyond water fasting. How dry fasting accelerates autophagy, stem cell regeneration, and deep cellular repair.", tags: ["FASTING", "ADVANCED"], locked: false },
      { title: "Sun Gazing — The HRM Protocol", desc: "Safe sun gazing methodology. Activating the pineal gland, reducing hunger, and charging the body with photonic energy.", tags: ["SUN", "PINEAL"], locked: false },
      { title: "Structured Water — The Fourth Phase", desc: "Gerald Pollack's EZ water research. How water in your cells differs from bulk water and why it matters.", tags: ["WATER", "SCIENCE"], locked: false },
      { title: "Earthing & Grounding Science", desc: "Free electrons from the Earth reduce inflammation markers. Peer-reviewed studies on grounding and chronic disease.", tags: ["GROUNDING", "SCIENCE"], locked: false },
      { title: "The Alkaline Body — pH Balance", desc: "Cancer cannot thrive in an alkaline environment. Mapping food pH and creating an internal ecosystem hostile to disease.", tags: ["ALKALINE", "NUTRITION"], locked: false },
      { title: "Breathwork & The Wim Hof Method", desc: "Cold exposure + breathing = voluntarily influencing the autonomic nervous system. The science is now proven.", tags: ["BREATHWORK", "COLD"], locked: false },
      { title: "Circadian Biology & Light Hygiene", desc: "Blue light toxicity, red light therapy, and aligning your biology with the sun. You are a light-driven organism.", tags: ["LIGHT", "CIRCADIAN"], locked: false },
    ]
  },
  {
    id: "consciousness",
    icon: "🔮",
    title: "Consciousness & Reality",
    color: "#ec4899",
    desc: "Simulation theory, quantum consciousness, manifestation physics, and the nature of what you call real.",
    items: [
      { title: "The Holographic Universe", desc: "David Bohm and Karl Pribram's model. The brain as a frequency decoder and reality as an interference pattern.", tags: ["HOLOGRAPHIC", "PHYSICS"], locked: false },
      { title: "Quantum Observer Effect", desc: "Particles don't exist in a definite state until observed. What this truly implies about consciousness and reality creation.", tags: ["QUANTUM", "OBSERVER"], locked: false },
      { title: "The CIA Gateway Tapes — Full Analysis", desc: "Hemi-Sync technology, Focus levels, and the CIA's conclusion that consciousness can transcend space-time.", tags: ["CIA", "GATEWAY"], locked: false },
      { title: "Remote Viewing — Documented Cases", desc: "The Stargate Program, Ingo Swann, Pat Price, and Joe McMoneagle. Decades of military-validated psychic intelligence.", tags: ["PSI", "MILITARY"], locked: false },
      { title: "The Law of Attraction — The Physics", desc: "Beyond 'The Secret.' Quantum field theory, retrocausality, and the actual mechanism by which intention shapes probability.", tags: ["LOA", "QUANTUM"], locked: false },
      { title: "Near-Death Experiences — The Data", desc: "Verified perception during clinical death. The AWARE study and what 50 years of NDE research conclusively shows.", tags: ["NDE", "RESEARCH"], locked: false },
      { title: "Nikola Tesla — The Untold Story", desc: "Free energy, wireless power transmission, earthquake machines, and why his lab was raided. The man who knew too much.", tags: ["TESLA", "BIOGRAPHY"], locked: false },
    ]
  },
];

// ─── Knowledge Portal Component ───
function KnowledgePortal() {
  const [activeCat, setActiveCat] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookmarks, setBookmarks] = useState(new Set());
  const [viewMode, setViewMode] = useState("grid");
  const [expandedItem, setExpandedItem] = useState(null);

  const toggleBookmark = (id) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredCategories = searchTerm
    ? KNOWLEDGE_CATEGORIES.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      })).filter(cat => cat.items.length > 0)
    : KNOWLEDGE_CATEGORIES;

  const totalItems = KNOWLEDGE_CATEGORIES.reduce((a, c) => a + c.items.length, 0);

  // Category detail view
  if (activeCat) {
    const cat = KNOWLEDGE_CATEGORIES.find(c => c.id === activeCat);
    return (
      <div style={{ animation: "fadeInUp 0.4s ease" }}>
        {/* Back nav */}
        <button onClick={() => { setActiveCat(null); setExpandedItem(null); }} style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.5)", padding: "8px 18px", borderRadius: 8, cursor: "pointer",
          fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          ← BACK TO PORTAL
        </button>

        {/* Category header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
          <span style={{ fontSize: 40 }}>{cat.icon}</span>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 600, color: "#fff", fontFamily: "'Orbitron', sans-serif", margin: 0, letterSpacing: 1 }}>{cat.title}</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4, lineHeight: 1.6 }}>{cat.desc}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, marginTop: 16 }}>
          <div style={{ fontSize: 11, color: cat.color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>
            {cat.items.length} ENTRIES
          </div>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {cat.items.map((item, idx) => {
            const itemId = `${cat.id}-${idx}`;
            const isExpanded = expandedItem === itemId;
            return (
              <GlassCard key={idx} onClick={() => setExpandedItem(isExpanded ? null : itemId)} style={{
                borderLeft: `3px solid ${item.locked ? "rgba(255,255,255,0.1)" : cat.color}`,
                opacity: item.locked ? 0.5 : 1,
                padding: isExpanded ? 28 : 22,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 500, color: "#fff", margin: 0, fontFamily: "'Sora', sans-serif" }}>
                        {item.locked ? "🔒 " : ""}{item.title}
                      </h3>
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: 0 }}>{item.desc}</p>

                    {isExpanded && !item.locked && (
                      <div style={{ marginTop: 20, animation: "fadeInUp 0.3s ease" }}>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                          <button style={{ padding: "8px 20px", borderRadius: 6, background: `${cat.color}18`, border: `1px solid ${cat.color}40`, color: cat.color, cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>
                            {item.pages ? "READ NOW" : "EXPLORE"}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); toggleBookmark(itemId); }} style={{
                            padding: "8px 20px", borderRadius: 6,
                            background: bookmarks.has(itemId) ? "rgba(234,179,8,0.15)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${bookmarks.has(itemId) ? "rgba(234,179,8,0.3)" : "rgba(255,255,255,0.08)"}`,
                            color: bookmarks.has(itemId) ? "#eab308" : "rgba(255,255,255,0.4)",
                            cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif",
                          }}>
                            {bookmarks.has(itemId) ? "★ SAVED" : "☆ SAVE"}
                          </button>
                        </div>
                        {item.pages && (
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>
                            {item.pages} pages • {item.status === "free" ? "FREE ACCESS" : "PREMIUM"}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                  {item.tags.map(t => (
                    <span key={t} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 20, background: `${cat.color}12`, color: cat.color, border: `1px solid ${cat.color}25`, letterSpacing: 1 }}>{t}</span>
                  ))}
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Unlock message for locked items */}
        {cat.items.some(i => i.locked) && (
          <div style={{ textAlign: "center", marginTop: 28, padding: 20, borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>
              🔒 LOCKED CONTENT UNLOCKS AT HIGHER VIBRATION LEVELS
            </span>
          </div>
        )}
      </div>
    );
  }

  // ─── Main Portal View ───
  return (
    <div style={{ animation: "fadeInUp 0.5s ease" }}>
      {/* Portal Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 3, height: 28, background: "linear-gradient(to bottom, #00ff8c, #a78bfa)", borderRadius: 2 }} />
          <h2 style={{ fontSize: 22, fontWeight: 300, color: "#fff", fontFamily: "'Sora', sans-serif", margin: 0 }}>
            Knowledge Portal
          </h2>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.8, marginTop: 8 }}>
          {totalItems} entries across {KNOWLEDGE_CATEGORIES.length} domains. Suppressed science, ancient wisdom, hidden technology, and the truth they don't teach in schools.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ position: "relative" }}>
          <input
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search all knowledge... (try: Tesla, copper, 528Hz, pineal)"
            style={{
              width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "14px 20px 14px 44px", color: "#fff", fontSize: 14, outline: "none",
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5,
            }}
          />
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.3 }}>⌕</span>
        </div>
      </div>

      {/* Quick Access Tags */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {["TESLA", "369", "SCALAR", "COPPER", "PINEAL", "FLUORIDE", "FREQUENCIES", "FASTING", "ETHER", "FREE ENERGY"].map(tag => (
          <button key={tag} onClick={() => setSearchTerm(tag.toLowerCase())} style={{
            padding: "5px 14px", borderRadius: 20, background: "rgba(0,255,140,0.05)",
            border: "1px solid rgba(0,255,140,0.12)", color: "rgba(0,255,140,0.6)",
            cursor: "pointer", fontSize: 10, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif",
            transition: "all 0.2s ease",
          }}>
            {tag}
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        {[
          { label: "Total Entries", value: totalItems, color: "#00ff8c" },
          { label: "eBooks", value: KNOWLEDGE_CATEGORIES[0].items.length, color: "#a78bfa" },
          { label: "Free Access", value: KNOWLEDGE_CATEGORIES.reduce((a, c) => a + c.items.filter(i => !i.locked).length, 0), color: "#06b6d4" },
          { label: "Bookmarked", value: bookmarks.size, color: "#eab308" },
        ].map(s => (
          <div key={s.label} style={{ flex: "1 1 120px", padding: "14px 18px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: s.color, fontFamily: "'Orbitron', sans-serif" }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search results or full grid */}
      {searchTerm && (
        <div style={{ marginBottom: 16, fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>
          {filteredCategories.reduce((a, c) => a + c.items.length, 0)} results for "{searchTerm}"
          <button onClick={() => setSearchTerm("")} style={{ marginLeft: 12, background: "none", border: "none", color: "#00ff8c", cursor: "pointer", fontSize: 11, fontFamily: "'Orbitron', sans-serif" }}>CLEAR</button>
        </div>
      )}

      {/* Category Grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {filteredCategories.map(cat => (
          <GlassCard key={cat.id} onClick={() => { setActiveCat(cat.id); setSearchTerm(""); }} style={{
            flex: "1 1 320px", minWidth: 280, cursor: "pointer",
            borderTop: `2px solid ${cat.color}40`,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 32 }}>{cat.icon}</span>
              <span style={{ fontSize: 10, color: cat.color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, background: `${cat.color}12`, padding: "3px 10px", borderRadius: 6 }}>
                {cat.items.length} ENTRIES
              </span>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: "#fff", fontFamily: "'Orbitron', sans-serif", margin: "0 0 8px", letterSpacing: 1 }}>{cat.title}</h3>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: "0 0 16px" }}>{cat.desc}</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {cat.items.slice(0, 3).map(item => (
                <span key={item.title} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 12, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {item.title.split(" — ")[0].split(" – ")[0].substring(0, 24)}
                </span>
              ))}
              {cat.items.length > 3 && <span style={{ fontSize: 9, padding: "2px 8px", color: cat.color }}>+{cat.items.length - 3} more</span>}
            </div>
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: cat.color, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>ENTER →</span>
              <div style={{ flex: 1, height: 1, background: `${cat.color}20` }} />
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Featured knowledge banner */}
      <div style={{
        marginTop: 32, padding: 28, borderRadius: 16,
        background: "linear-gradient(135deg, rgba(0,255,140,0.06), rgba(167,139,250,0.06))",
        border: "1px solid rgba(0,255,140,0.1)", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -20, right: -20, fontSize: 120, opacity: 0.03 }}>⚡</div>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#00ff8c", fontFamily: "'Orbitron', sans-serif", marginBottom: 12 }}>⟡ FEATURED PATHWAY</div>
        <h3 style={{ fontSize: 20, color: "#fff", fontWeight: 400, marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>
          The Tesla-369-Scalar Connection
        </h3>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 600, marginBottom: 20 }}>
          A curated learning path connecting Nikola Tesla's obsession with 3, 6, 9 → vortex mathematics → 
          scalar wave technology → copper coil engineering → ether physics. Seven modules, one unified understanding.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {["369 CODE", "SCALAR", "COPPER", "ETHER", "TESLA", "VORTEX", "FREE ENERGY"].map((s, i) => (
            <span key={s} style={{ fontSize: 9, padding: "3px 10px", borderRadius: 4, background: `hsla(${140 + i * 20}, 70%, 50%, 0.1)`, border: `1px solid hsla(${140 + i * 20}, 70%, 50%, 0.2)`, color: `hsla(${140 + i * 20}, 70%, 60%, 1)`, letterSpacing: 1 }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ marginTop: 32, padding: 20, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", lineHeight: 1.8, fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>
          "The day science begins to study non-physical phenomena, it will make more progress in one decade than in all the previous centuries of its existence." — Nikola Tesla
        </p>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// WAKE UP — THE SIGNAL FEED
// ═══════════════════════════════════════════════════════════════

const WAKEUP_TOPICS = [
  {
    id: "epstein",
    icon: "🕸️",
    title: "The Epstein Network",
    urgency: "CRITICAL",
    urgencyColor: "#ef4444",
    color: "#ef4444",
    summary: "Jeffrey Epstein's trafficking operation and the powerful people connected to it. Exposed connections, sealed documents, and the questions that remain unanswered.",
    articles: [
      { title: "The Client List — Who Visited the Island", desc: "Flight logs, deposition testimony, and court documents revealing the network of wealthy and powerful individuals tied to Epstein's operation. Names, dates, and documented connections.", time: "ONGOING", heat: 98, tags: ["DOCUMENTS", "NETWORK"] },
      { title: "Ghislaine Maxwell — The Recruiter", desc: "How Maxwell built the pipeline. Her conviction, the trial evidence, and the connections to British intelligence and high society that remain unexplored.", time: "UPDATED", heat: 91, tags: ["TRIAL", "CONVICTION"] },
      { title: "The Death That Doesn't Add Up", desc: "Two cameras malfunctioned. Guards fell asleep. The hyoid bone fracture. A forensic examination of why the official narrative has more holes than answers.", time: "UNSOLVED", heat: 95, tags: ["FORENSICS", "COVER-UP"] },
      { title: "Intelligence Agency Connections", desc: "Alleged ties to Mossad, CIA, and MI6. Acosta's 'he belongs to intelligence' statement. The blackmail operation theory and its implications.", time: "DEVELOPING", heat: 88, tags: ["CIA", "MOSSAD", "BLACKMAIL"] },
      { title: "The Unsealed Documents — 2024 Release", desc: "What the released court documents revealed — and what's still sealed. Over 170 names and the ongoing legal battles for full transparency.", time: "2024", heat: 93, tags: ["COURT DOCS", "NAMES"] },
      { title: "Follow the Money — Financial Trails", desc: "Billions in assets with unclear origins. Les Wexner connection. How was Epstein funded and by whom? The financial architecture of a trafficking network.", time: "DEEP DIVE", heat: 85, tags: ["FINANCE", "WEXNER"] },
    ]
  },
  {
    id: "pizzagate",
    icon: "🍕",
    title: "Pizzagate & Elite Trafficking",
    urgency: "CONTROVERSIAL",
    urgencyColor: "#f97316",
    color: "#f97316",
    summary: "The theory connecting coded language in leaked emails to alleged elite trafficking networks. Examining the claims, the evidence, the debunking, and the questions.",
    articles: [
      { title: "The Podesta Emails — Original Source Material", desc: "The WikiLeaks emails that started it all. Unusual language, food-related code words, and the connections people drew. Read the source material yourself.", time: "2016", heat: 82, tags: ["WIKILEAKS", "EMAILS"] },
      { title: "FBI Declassified Symbols — The Pattern Match", desc: "FBI documents on pedophile symbols and logos. The visual similarities people identified in businesses and organizations connected to the emails.", time: "FBI DOCS", heat: 78, tags: ["FBI", "SYMBOLS"] },
      { title: "The Mainstream Shutdown — How It Was Buried", desc: "How the narrative was controlled — immediate 'debunked' labels, platform censorship, and the media strategy that made questioning the story itself taboo.", time: "ANALYSIS", heat: 80, tags: ["MEDIA", "CENSORSHIP"] },
      { title: "Global Trafficking Networks — The Bigger Picture", desc: "Beyond any single theory — documented trafficking rings involving powerful people worldwide. NXIVM, the Catholic Church, UK grooming gangs, Hollywood.", time: "ONGOING", heat: 90, tags: ["GLOBAL", "DOCUMENTED"] },
      { title: "What's Proven vs. What's Alleged", desc: "An honest breakdown separating documented facts from speculation. Where the evidence is strong, where it's circumstantial, and where it requires faith.", time: "ANALYSIS", heat: 75, tags: ["FACT-CHECK", "NUANCE"] },
    ]
  },
  {
    id: "reptilian",
    icon: "🦎",
    title: "The Reptilian Theory",
    urgency: "ESOTERIC",
    urgencyColor: "#a78bfa",
    color: "#a78bfa",
    summary: "David Icke's theory of interdimensional reptilian beings influencing human affairs. Ancient accounts, modern claims, and the metaphorical interpretations.",
    articles: [
      { title: "David Icke's Core Thesis", desc: "The theory that shape-shifting reptilian entities from the lower fourth dimension have infiltrated positions of power. The original framework explained.", time: "THEORY", heat: 70, tags: ["ICKE", "FOUNDATION"] },
      { title: "Ancient Serpent Gods — Every Culture Has Them", desc: "The Annunaki, Nagas, Quetzalcoatl, the Serpent in Eden, Chinese dragon emperors. Why virtually every ancient civilization describes reptilian beings.", time: "ANCIENT", heat: 78, tags: ["MYTHOLOGY", "GLOBAL"] },
      { title: "The Bloodline Theory", desc: "Alleged ruling bloodlines tracing back to antiquity. Royal families, banking dynasties, and the claim of non-human DNA influencing the power structure.", time: "THEORY", heat: 72, tags: ["BLOODLINES", "ROYALTY"] },
      { title: "Metaphorical Interpretation — The Reptilian Brain", desc: "A psychological reading: the 'reptilian' as metaphor for cold-blooded psychopathy in power. The R-complex brain, predatory behavior, and lack of empathy in ruling classes.", time: "ANALYSIS", heat: 68, tags: ["PSYCHOLOGY", "METAPHOR"] },
      { title: "Eyewitness Accounts & Testimonies", desc: "Compiled testimonies from people claiming direct encounters. Arizona Wilder, Cathy O'Brien, and others. Evaluate the claims for yourself.", time: "TESTIMONIES", heat: 65, tags: ["WITNESSES", "CLAIMS"] },
      { title: "The Archon Connection — Gnostic Texts", desc: "The Nag Hammadi texts describe 'Archons' — inorganic rulers who feed on human energy. Parallels between ancient Gnostic cosmology and modern reptilian theory.", time: "GNOSTIC", heat: 74, tags: ["ARCHONS", "GNOSTIC"] },
    ]
  },
  {
    id: "fluoride",
    icon: "💧",
    title: "Fluoride & Water Supply",
    urgency: "HEALTH ALERT",
    urgencyColor: "#06b6d4",
    color: "#06b6d4",
    summary: "The mass medication of public water supplies with fluoride compounds. Scientific studies, pineal gland effects, IQ research, and global policy differences.",
    articles: [
      { title: "Fluoride Is Not What You Think", desc: "Hydrofluorosilicic acid — an industrial byproduct of phosphate fertilizer production. This is what's added to your water. Not the naturally occurring calcium fluoride.", time: "FOUNDATION", heat: 88, tags: ["CHEMISTRY", "INDUSTRIAL"] },
      { title: "The Pineal Gland Calcification Studies", desc: "Peer-reviewed research showing fluoride accumulates in the pineal gland more than any other tissue. What this means for melatonin production, sleep, and consciousness.", time: "RESEARCH", heat: 92, tags: ["PINEAL", "STUDIES"] },
      { title: "IQ Studies — The Harvard Meta-Analysis", desc: "27 studies reviewed by Harvard researchers found a strong association between fluoride exposure and reduced IQ in children. Published in Environmental Health Perspectives.", time: "HARVARD", heat: 90, tags: ["IQ", "CHILDREN"] },
      { title: "Countries That Banned Fluoridation", desc: "98% of Europe has rejected water fluoridation. Japan, China, and most developed nations don't fluoridate. Why America, UK, Australia, and a few others are the exception.", time: "GLOBAL", heat: 85, tags: ["BANNED", "EUROPE"] },
      { title: "The TSCA Lawsuit — 2024 Federal Ruling", desc: "A federal judge ruled the EPA must regulate fluoride in drinking water due to unreasonable risk of reduced IQ in children. A historic legal precedent.", time: "2024", heat: 95, tags: ["LAWSUIT", "EPA"] },
      { title: "How to Remove Fluoride From Your Water", desc: "Reverse osmosis, bone char, activated alumina, and distillation. What works, what doesn't, and why standard Brita filters don't remove fluoride.", time: "SOLUTIONS", heat: 87, tags: ["FILTER", "DIY"] },
      { title: "Edward Bernays & The PR Campaign", desc: "The 'father of propaganda' was hired to sell fluoridation to America. The marketing strategy that made industrial waste a dental treatment.", time: "HISTORY", heat: 83, tags: ["BERNAYS", "PR"] },
    ]
  },
  {
    id: "chemtrails",
    icon: "✈️",
    title: "Chemical Trails & Geoengineering",
    urgency: "ACTIVE",
    urgencyColor: "#eab308",
    color: "#eab308",
    summary: "Persistent contrails, cloud seeding programs, stratospheric aerosol injection, and the documented history of atmospheric manipulation.",
    articles: [
      { title: "Contrails vs. Chemical Trails — The Debate", desc: "Normal contrails dissipate in seconds to minutes. Persistent trails that spread into haze last hours. The atmospheric science and what both sides claim.", time: "FOUNDATION", heat: 80, tags: ["SCIENCE", "DEBATE"] },
      { title: "Operation Popeye — Military Weather Warfare", desc: "Declassified US military operation that seeded clouds over Vietnam to extend monsoon season. Proven military weather manipulation from the 1960s-70s.", time: "DECLASSIFIED", heat: 88, tags: ["MILITARY", "PROVEN"] },
      { title: "Cloud Seeding — It's Not A Theory, It's A Business", desc: "Companies like Weather Modification Inc. openly sell cloud seeding services. Dubai, China, and the US actively seed clouds. This is public, documented, and ongoing.", time: "CURRENT", heat: 92, tags: ["DOCUMENTED", "BUSINESS"] },
      { title: "Stratospheric Aerosol Injection — Harvard's SCoPEx", desc: "Harvard's Solar Geoengineering Research Program openly studies spraying particles into the stratosphere to block sunlight. Published papers and funding sources.", time: "ACADEMIC", heat: 86, tags: ["HARVARD", "SOLAR"] },
      { title: "Barium, Strontium & Aluminum — Soil Testing", desc: "Independent lab tests showing elevated levels of metallic particles in rainwater and soil in areas beneath persistent trail activity. The data and its interpretations.", time: "LAB TESTS", heat: 78, tags: ["TESTING", "METALS"] },
      { title: "The Geoengineering Patent Archive", desc: "Hundreds of patents filed for atmospheric modification technologies. US Patent archives documenting methods for aerosol dispersal, weather control, and solar radiation management.", time: "PATENTS", heat: 84, tags: ["PATENTS", "ARCHIVE"] },
      { title: "UN & WEF Statements on Climate Intervention", desc: "Official statements from international bodies acknowledging and planning for solar radiation management. When 'conspiracy theory' becomes 'climate policy.'", time: "OFFICIAL", heat: 90, tags: ["UN", "WEF", "POLICY"] },
    ]
  },
  {
    id: "gmo",
    icon: "🧬",
    title: "GMOs & Food Supply Control",
    urgency: "HEALTH",
    urgencyColor: "#22c55e",
    color: "#22c55e",
    summary: "Genetically modified organisms, the corporations controlling the food supply, seed patents, glyphosate toxicity, and the fight for food sovereignty.",
    articles: [
      { title: "Monsanto/Bayer — The Company That Owns Your Food", desc: "From Agent Orange to Roundup to GMO seeds. How one corporation gained control over a massive portion of the global food supply through patents and lawsuits.", time: "CORPORATE", heat: 90, tags: ["MONSANTO", "BAYER"] },
      { title: "Glyphosate — The Weedkiller In Your Cereal", desc: "Found in 80%+ of urine samples tested. Classified as 'probably carcinogenic' by WHO. Jury awards billions in cancer lawsuits. It's in bread, oats, beer, and wine.", time: "HEALTH", heat: 93, tags: ["GLYPHOSATE", "ROUNDUP"] },
      { title: "Seed Patents — You Can't Own Nature (But They Do)", desc: "Corporations patenting seeds and suing farmers for saving them. The destruction of seed biodiversity and ancient farming practices by intellectual property law.", time: "LEGAL", heat: 85, tags: ["PATENTS", "FARMERS"] },
      { title: "The Séralini Study — What Happened", desc: "The study showing tumors in rats fed GMO corn was published, retracted under industry pressure, then republished. The anatomy of scientific suppression.", time: "SCIENCE", heat: 82, tags: ["STUDY", "SUPPRESSED"] },
      { title: "Bill Gates — Largest Farmland Owner in America", desc: "Why is a tech billionaire buying hundreds of thousands of acres of farmland? The connection to synthetic food, GMO investment, and food supply centralization.", time: "DEVELOPING", heat: 88, tags: ["GATES", "FARMLAND"] },
      { title: "The Organic Movement & Food Sovereignty", desc: "Heirloom seeds, regenerative agriculture, food forests, and the growing movement to reclaim control over what we eat. Solutions and resources.", time: "SOLUTIONS", heat: 80, tags: ["ORGANIC", "SOLUTIONS"] },
      { title: "Codex Alimentarius — Global Food Control", desc: "The international food standards body that critics say is designed to limit access to natural supplements and health foods while protecting corporate food interests.", time: "POLICY", heat: 76, tags: ["CODEX", "GLOBAL"] },
    ]
  },
  {
    id: "pharma",
    icon: "💊",
    title: "Big Pharma & Medical System",
    urgency: "ONGOING",
    urgencyColor: "#ec4899",
    color: "#ec4899",
    summary: "The pharmaceutical-industrial complex, suppressed cures, regulatory capture, and the business model built on treatment rather than healing.",
    articles: [
      { title: "Regulatory Capture — Who Controls the FDA?", desc: "The revolving door between pharmaceutical companies and the agencies meant to regulate them. Former industry executives writing the rules for their own products.", time: "SYSTEMIC", heat: 88, tags: ["FDA", "REVOLVING DOOR"] },
      { title: "The Opioid Crisis — Manufactured Addiction", desc: "How Purdue Pharma knowingly marketed OxyContin as non-addictive. Hundreds of thousands dead. The Sackler family's billions. A documented corporate crime.", time: "DOCUMENTED", heat: 95, tags: ["OPIOIDS", "SACKLER"] },
      { title: "Royal Rife & The Frequency Machine", desc: "In the 1930s, Royal Rife's frequency device was documented destroying pathogens. The AMA shut him down, his lab was destroyed, and his technology was buried.", time: "SUPPRESSED", heat: 80, tags: ["RIFE", "FREQUENCY"] },
      { title: "Natural Medicine Under Attack", desc: "The systematic campaign against herbalism, homeopathy, naturopathy, and traditional medicine. Regulation designed to protect pharmaceutical monopolies.", time: "ONGOING", heat: 82, tags: ["NATURAL", "REGULATION"] },
      { title: "The Cancer Industry — Follow the Money", desc: "Cancer treatment is a $200B+ industry. Why the focus remains on treatment rather than prevention. The suppressed environmental and dietary causes.", time: "FINANCIAL", heat: 86, tags: ["CANCER", "INDUSTRY"] },
      { title: "Vaccine Injury Compensation Program", desc: "The US government has paid over $4.7 billion in vaccine injury claims through the VICP. What this program reveals about acknowledged risks.", time: "GOVERNMENT", heat: 84, tags: ["VICP", "COMPENSATION"] },
    ]
  },
  {
    id: "surveillance",
    icon: "📡",
    title: "Surveillance & Digital Control",
    urgency: "NOW",
    urgencyColor: "#f43f5e",
    color: "#f43f5e",
    summary: "The surveillance state exposed. Mass data collection, social credit systems, CBDC digital currencies, and the architecture of digital control.",
    articles: [
      { title: "Edward Snowden — What He Actually Revealed", desc: "The NSA is recording everything. PRISM, XKeyscore, and the global surveillance apparatus. Every call, text, email, and search — collected and stored.", time: "PROVEN", heat: 95, tags: ["SNOWDEN", "NSA"] },
      { title: "Social Credit Systems — Not Just China", desc: "China's system is the model, but ESG scores, digital IDs, and behavioral tracking are implementing similar control frameworks worldwide under different names.", time: "GLOBAL", heat: 90, tags: ["SOCIAL CREDIT", "ESG"] },
      { title: "CBDCs — Programmable Money", desc: "Central Bank Digital Currencies that can be programmed to expire, restricted by location, or turned off. The end of financial privacy and the tool for total economic control.", time: "DEVELOPING", heat: 92, tags: ["CBDC", "CURRENCY"] },
      { title: "5G, EMF & Biological Effects", desc: "Independent studies on electromagnetic radiation effects on cells, sleep, and the blood-brain barrier. What the telecom industry doesn't want studied.", time: "RESEARCH", heat: 78, tags: ["5G", "EMF"] },
      { title: "Smart Devices — The Listening Grid", desc: "Your phone, TV, Alexa, and Ring doorbell form a surveillance network in your home. Documented cases of data sharing with law enforcement without warrants.", time: "DOCUMENTED", heat: 85, tags: ["IOT", "PRIVACY"] },
    ]
  },
  {
    id: "history",
    icon: "📜",
    title: "Hidden History & Suppressed Knowledge",
    urgency: "DEEP STATE",
    urgencyColor: "#8b5cf6",
    color: "#8b5cf6",
    summary: "The history they didn't teach you. Ancient advanced civilizations, suppressed archaeological finds, and the rewriting of human origins.",
    articles: [
      { title: "Operation Paperclip — Nazis in NASA", desc: "Over 1,600 Nazi scientists brought to America after WWII. Werner von Braun, Kurt Debus, and others went from building V-2 rockets for Hitler to running NASA.", time: "DECLASSIFIED", heat: 88, tags: ["NASA", "PAPERCLIP"] },
      { title: "The Smithsonian Giant Cover-Up", desc: "Newspaper reports from the 1800s-1900s documenting giant skeletal remains found across America. Specimens sent to the Smithsonian — and never seen again.", time: "HISTORICAL", heat: 75, tags: ["GIANTS", "SMITHSONIAN"] },
      { title: "COINTELPRO — FBI vs. The People", desc: "The FBI's documented program to infiltrate, discredit, and destroy civil rights movements, Black Panther Party, anti-war groups, and anyone challenging power.", time: "DECLASSIFIED", heat: 90, tags: ["FBI", "COINTELPRO"] },
      { title: "Operation Northwoods — False Flag Blueprint", desc: "The Joint Chiefs of Staff proposed staging terrorist attacks on American citizens to justify invading Cuba. JFK rejected it. The document is declassified.", time: "DECLASSIFIED", heat: 92, tags: ["FALSE FLAG", "MILITARY"] },
      { title: "The Library of Alexandria — What Was Lost", desc: "The greatest repository of ancient knowledge, deliberately destroyed. What it contained, who destroyed it, and the theory that key texts were removed first.", time: "ANCIENT", heat: 70, tags: ["LIBRARY", "ANCIENT"] },
      { title: "Göbekli Tepe — Rewriting Human History", desc: "A 12,000-year-old megalithic site that predates agriculture, pottery, and supposedly civilization itself. It was deliberately buried. Why?", time: "ARCHAEOLOGY", heat: 82, tags: ["GOBEKLI TEPE", "ANCIENT"] },
      { title: "The Younger Dryas Impact — Civilization Reset", desc: "Evidence of a cataclysmic comet impact 12,800 years ago that ended an advanced pre-ice-age civilization. Graham Hancock, Randall Carlson, and the geological proof.", time: "SCIENCE", heat: 80, tags: ["CATACLYSM", "RESET"] },
    ]
  },
  {
    id: "energy",
    icon: "⚡",
    title: "Suppressed Energy & Free Power",
    urgency: "SUPPRESSED",
    urgencyColor: "#00ff8c",
    color: "#00ff8c",
    summary: "Technologies that could free humanity from energy dependence. Why they're suppressed, who suppresses them, and how they work.",
    articles: [
      { title: "Tesla's Wardenclyffe — Free Energy for the World", desc: "Tesla's tower could transmit wireless electricity globally. JP Morgan pulled funding when he realized he couldn't meter it. You can't charge for free energy.", time: "HISTORY", heat: 92, tags: ["TESLA", "WARDENCLYFFE"] },
      { title: "Stanley Meyer — The Water-Powered Car", desc: "Meyer's dune buggy ran on water using electrolysis. He was offered $1 billion to shelve it, refused, and died suddenly at a restaurant in 1998. The patent exists.", time: "INVENTOR", heat: 88, tags: ["WATER CAR", "MEYER"] },
      { title: "The Suppression Pattern — Inventors Who Died", desc: "A documented pattern of free energy inventors who were bought out, threatened, raided, or died under suspicious circumstances. The common thread.", time: "PATTERN", heat: 85, tags: ["PATTERN", "DEATHS"] },
      { title: "Zero-Point Energy — It's Real Physics", desc: "Quantum mechanics proves the vacuum of space contains enormous energy. The Casimir effect demonstrates it. Extracting it is engineering, not fantasy.", time: "PHYSICS", heat: 82, tags: ["ZERO POINT", "QUANTUM"] },
      { title: "The Petrodollar System — Why Oil Must Stay", desc: "The entire global financial system is built on oil being traded in US dollars. Free energy doesn't just threaten oil companies — it threatens the dollar itself.", time: "ECONOMICS", heat: 90, tags: ["PETRODOLLAR", "OIL"] },
    ]
  },
];

function WakeUpSection() {
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [savedArticles, setSavedArticles] = useState(new Set());
  const [expandedArticle, setExpandedArticle] = useState(null);

  const toggleSave = (id) => {
    setSavedArticles(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const urgencyFilters = ["ALL", "CRITICAL", "HEALTH", "SUPPRESSED", "DECLASSIFIED", "DEVELOPING"];

  const filteredTopics = WAKEUP_TOPICS.filter(t => {
    if (filter !== "ALL" && !t.urgency.includes(filter) && !t.articles.some(a => a.tags.some(tag => tag.includes(filter)))) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return t.title.toLowerCase().includes(s) || t.summary.toLowerCase().includes(s) ||
        t.articles.some(a => a.title.toLowerCase().includes(s) || a.desc.toLowerCase().includes(s) || a.tags.some(tag => tag.toLowerCase().includes(s)));
    }
    return true;
  });

  const totalArticles = WAKEUP_TOPICS.reduce((a, t) => a + t.articles.length, 0);

  // ─── Article Detail View ───
  if (activeTopicId) {
    const topic = WAKEUP_TOPICS.find(t => t.id === activeTopicId);
    return (
      <div style={{ animation: "fadeInUp 0.4s ease" }}>
        <button onClick={() => { setActiveTopicId(null); setExpandedArticle(null); }} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
          ← BACK TO FEED
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
          <span style={{ fontSize: 40 }}>{topic.icon}</span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontSize: 24, fontWeight: 600, color: "#fff", fontFamily: "'Orbitron', sans-serif", margin: 0, letterSpacing: 1 }}>{topic.title}</h2>
              <span style={{ fontSize: 9, padding: "3px 10px", borderRadius: 4, background: `${topic.urgencyColor}18`, border: `1px solid ${topic.urgencyColor}35`, color: topic.urgencyColor, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>{topic.urgency}</span>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4, lineHeight: 1.6 }}>{topic.summary}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, marginTop: 20 }}>
          <div style={{ fontSize: 11, color: topic.color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>{topic.articles.length} SIGNALS</div>
          <div style={{ flex: 1, height: 1, background: `${topic.color}20` }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {topic.articles.map((article, idx) => {
            const artId = `${topic.id}-${idx}`;
            const isExpanded = expandedArticle === artId;
            return (
              <GlassCard key={idx} onClick={() => setExpandedArticle(isExpanded ? null : artId)} style={{ borderLeft: `3px solid ${topic.color}`, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 500, color: "#fff", margin: 0, fontFamily: "'Sora', sans-serif", flex: 1 }}>{article.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 16, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>{article.time}</span>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 12px" }}>{article.desc}</p>

                {/* Heat meter */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1, fontFamily: "'Orbitron', sans-serif" }}>SIGNAL</span>
                  <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, maxWidth: 200, overflow: "hidden" }}>
                    <div style={{ width: `${article.heat}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${topic.color}66, ${topic.color})`, boxShadow: `0 0 8px ${topic.color}44`, transition: "width 1s ease" }} />
                  </div>
                  <span style={{ fontSize: 10, color: topic.color, fontFamily: "'Orbitron', sans-serif" }}>{article.heat}%</span>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: 16, animation: "fadeInUp 0.3s ease", display: "flex", gap: 10 }}>
                    <button onClick={(e) => { e.stopPropagation(); toggleSave(artId); }} style={{
                      padding: "8px 18px", borderRadius: 6,
                      background: savedArticles.has(artId) ? `${topic.color}18` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${savedArticles.has(artId) ? `${topic.color}40` : "rgba(255,255,255,0.08)"}`,
                      color: savedArticles.has(artId) ? topic.color : "rgba(255,255,255,0.4)",
                      cursor: "pointer", fontSize: 10, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif",
                    }}>{savedArticles.has(artId) ? "★ SAVED" : "☆ SAVE"}</button>
                    <button style={{ padding: "8px 18px", borderRadius: 6, background: `${topic.color}12`, border: `1px solid ${topic.color}30`, color: topic.color, cursor: "pointer", fontSize: 10, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>DEEP DIVE →</button>
                    <button style={{ padding: "8px 18px", borderRadius: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 10, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>SHARE</button>
                  </div>
                )}

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                  {article.tags.map(t => (
                    <span key={t} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 20, background: `${topic.color}10`, color: `${topic.color}cc`, border: `1px solid ${topic.color}20`, letterSpacing: 1 }}>{t}</span>
                  ))}
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Bottom disclaimer */}
        <div style={{ marginTop: 28, padding: 18, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", lineHeight: 1.8, fontFamily: "'JetBrains Mono', monospace", margin: 0, textAlign: "center" }}>
            RTV33 presents information for research and discussion. Think critically. Verify independently. Trust your discernment.
          </p>
        </div>
      </div>
    );
  }

  // ─── Main Feed View ───
  return (
    <div style={{ animation: "fadeInUp 0.5s ease" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 3, height: 28, background: "linear-gradient(to bottom, #ef4444, #eab308)", borderRadius: 2 }} />
          <h2 style={{ fontSize: 22, fontWeight: 300, color: "#fff", fontFamily: "'Sora', sans-serif", margin: 0 }}>Wake Up</h2>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 10px #ef444488", animation: "orbPulse 2s ease-in-out infinite" }} />
          <span style={{ fontSize: 10, color: "#ef4444", fontFamily: "'Orbitron', sans-serif", letterSpacing: 2 }}>LIVE SIGNAL</span>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.8, marginTop: 8 }}>
          The truth doesn't need permission. {totalArticles} signals across {WAKEUP_TOPICS.length} critical topics. Research everything. Question everything. Trust your own discernment.
        </p>
      </div>

      {/* Alert banner */}
      <div style={{
        padding: "14px 20px", borderRadius: 10, marginBottom: 24,
        background: "linear-gradient(90deg, rgba(239,68,68,0.08), rgba(234,179,8,0.08))",
        border: "1px solid rgba(239,68,68,0.15)", display: "flex", alignItems: "center", gap: 14,
      }}>
        <span style={{ fontSize: 18 }}>⚠️</span>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6, flex: 1 }}>
          This section contains documented facts, emerging theories, and contested claims. Evidence levels vary. We present the information — you decide what resonates.
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search signals... (Epstein, fluoride, GMO, Tesla...)"
          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 20px 14px 44px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "'JetBrains Mono', monospace" }} />
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {urgencyFilters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "5px 14px", borderRadius: 20, fontSize: 10, letterSpacing: 2, cursor: "pointer",
            fontFamily: "'Orbitron', sans-serif", transition: "all 0.2s ease",
            background: filter === f ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${filter === f ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.06)"}`,
            color: filter === f ? "#ef4444" : "rgba(255,255,255,0.3)",
          }}>{f}</button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        {[
          { label: "Active Signals", value: totalArticles, color: "#ef4444" },
          { label: "Topics", value: WAKEUP_TOPICS.length, color: "#eab308" },
          { label: "Declassified", value: WAKEUP_TOPICS.reduce((a, t) => a + t.articles.filter(ar => ar.tags.some(tag => tag.includes("DECLASSIFIED") || tag.includes("PROVEN") || tag.includes("DOCUMENTED"))).length, 0), color: "#00ff8c" },
          { label: "Saved", value: savedArticles.size, color: "#a78bfa" },
        ].map(s => (
          <div key={s.label} style={{ flex: "1 1 120px", padding: "14px 18px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: s.color, fontFamily: "'Orbitron', sans-serif" }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Topic Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filteredTopics.map(topic => (
          <GlassCard key={topic.id} onClick={() => setActiveTopicId(topic.id)} style={{
            cursor: "pointer", borderLeft: `3px solid ${topic.color}`,
            display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start",
          }}>
            <div style={{ flex: "0 0 auto" }}>
              <span style={{ fontSize: 36 }}>{topic.icon}</span>
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: "#fff", fontFamily: "'Orbitron', sans-serif", margin: 0, letterSpacing: 1 }}>{topic.title}</h3>
                <span style={{ fontSize: 9, padding: "2px 10px", borderRadius: 4, background: `${topic.urgencyColor}15`, border: `1px solid ${topic.urgencyColor}30`, color: topic.urgencyColor, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", animation: topic.urgency === "CRITICAL" || topic.urgency === "NOW" ? "orbPulse 2s ease-in-out infinite" : "none" }}>
                  {topic.urgency}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: "0 0 14px" }}>{topic.summary}</p>

              {/* Mini article preview */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {topic.articles.slice(0, 3).map((a, i) => (
                  <span key={i} style={{ fontSize: 9, padding: "3px 10px", borderRadius: 12, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    {a.title.substring(0, 30)}{a.title.length > 30 ? "..." : ""}
                  </span>
                ))}
                {topic.articles.length > 3 && <span style={{ fontSize: 9, padding: "3px 8px", color: topic.color }}>+{topic.articles.length - 3} more</span>}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 10, color: topic.color, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>{topic.articles.length} SIGNALS</span>
                <div style={{ flex: 1, height: 1, background: `${topic.color}15`, maxWidth: 200 }} />
                <span style={{ fontSize: 11, color: topic.color, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>ENTER →</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Bottom banner */}
      <div style={{
        marginTop: 32, padding: 28, borderRadius: 16,
        background: "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(234,179,8,0.06), rgba(167,139,250,0.06))",
        border: "1px solid rgba(239,68,68,0.1)", position: "relative", overflow: "hidden", textAlign: "center",
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, fontSize: 140, opacity: 0.03 }}>👁</div>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#ef4444", fontFamily: "'Orbitron', sans-serif", marginBottom: 12 }}>◉ THE SIGNAL</div>
        <h3 style={{ fontSize: 20, color: "#fff", fontWeight: 300, marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>
          "In a time of universal deceit, telling the truth is a revolutionary act."
        </h3>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>— Often attributed to George Orwell</p>
      </div>

      {/* Disclaimer */}
      <div style={{ marginTop: 24, padding: 18, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", lineHeight: 1.8, fontFamily: "'JetBrains Mono', monospace", margin: 0, textAlign: "center" }}>
          RTV33 encourages independent research and critical thinking. Evidence levels vary across topics. 
          Some content is based on declassified documents, some on emerging research, and some on theories under active debate. 
          Always verify. Always think for yourself.
        </p>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// WORMHOLE TRANSITION — Kaleidoscopic sacred geometry tunnel
// ═══════════════════════════════════════════════════════════════
function WormholeTransition() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;
    const resize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; };
    window.addEventListener("resize", resize);

    const cx = () => w / 2, cy = () => h / 2;
    const fontSize = 14;
    const cols = Math.floor(w / fontSize);
    const drops = Array.from({ length: cols }, () => Math.random() * h / fontSize);
    const matChars = "アイウエオカキクケコサシスセソ0123456789RTV33ΣΩΔΘΨξ∞";

    // Tunnel depth rings rushing at camera
    const tunnelRings = Array.from({ length: 40 }, (_, i) => ({
      z: i * 50, sides: [6, 8, 12][i % 3], hue: i * 25, rot: Math.random() * Math.PI
    }));

    // Speed streaks
    const streaks = Array.from({ length: 200 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * 1600 + 100,
      speed: Math.random() * 3 + 1,
      hue: Math.random() * 360,
      len: Math.random() * 60 + 20,
      w: Math.random() * 1.5 + 0.3,
    }));

    const draw = () => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      const totalDuration = 8;
      const progress = Math.min(elapsed / totalDuration, 1);
      const _cx = cx(), _cy = cy();

      // Fade trail — faster clear = sharper, slower = more trails
      const trailAlpha = progress < 0.2 ? 0.04 + progress * 0.3 : 0.1 + progress * 0.05;
      ctx.fillStyle = `rgba(5, 5, 8, ${trailAlpha})`;
      ctx.fillRect(0, 0, w, h);

      const speed = 1 + progress * progress * 30;
      const colorTime = elapsed;

      // ── PHASE 1 (0-20%): Matrix rain spirals inward ──
      if (progress < 0.3) {
        const suck = Math.min(progress / 0.2, 1); // 0→1 suction strength
        const spiralSpeed = suck * 3;

        for (let i = 0; i < drops.length; i++) {
          const char = matChars[Math.floor(Math.random() * matChars.length)];
          let x = i * fontSize;
          let y = drops[i] * fontSize;

          // Convert to polar from center, spiral inward
          let dx = x - _cx;
          let dy = y - _cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) + suck * spiralSpeed * 0.03;

          // Shrink toward center
          const newDist = dist * (1 - suck * 0.6);
          x = _cx + Math.cos(angle) * newDist;
          y = _cy + Math.sin(angle) * newDist;

          // Fade matrix chars as they approach center
          const fadeAlpha = 0.15 + (1 - suck) * 0.6 + Math.random() * 0.2;
          const brightness = Math.random();
          if (brightness > 0.92) {
            ctx.fillStyle = `rgba(255,255,255,${fadeAlpha})`;
            ctx.shadowColor = "#00ff8c"; ctx.shadowBlur = 12;
          } else if (brightness > 0.6) {
            ctx.fillStyle = `rgba(0, 255, 140, ${fadeAlpha})`;
            ctx.shadowColor = "#00ff8c"; ctx.shadowBlur = 6;
          } else {
            ctx.fillStyle = `rgba(0, 255, 140, ${fadeAlpha * 0.5})`;
            ctx.shadowBlur = 0;
          }
          ctx.font = `${fontSize}px monospace`;
          ctx.fillText(char, x, y);
          ctx.shadowBlur = 0;

          if (y > h && Math.random() > 0.97) drops[i] = 0;
          drops[i] += 0.7 + suck * 2;
        }
      }

      // ── PHASE 2 (15%-85%): Kaleidoscope tunnel ──
      if (progress > 0.15) {
        // Kaleidoscope removed — tunnel rings and streaks continue
        const kaleidoAlpha = progress < 0.3 ? (progress - 0.15) / 0.15 : progress > 0.8 ? 1 - (progress - 0.8) / 0.2 : 1;

        // Depth tunnel rings
        tunnelRings.forEach(ring => {
          ring.z -= speed;
          if (ring.z < -20) { ring.z = 2000; ring.hue = (ring.hue + 40) % 360; }
          ring.rot += 0.005 + progress * 0.015;

          const scale = 300 / (ring.z + 1);
          const radius = (120 + ring.z * 0.08) * scale;

          if (radius > 3 && radius < w * 0.8) {
            const depth = 1 - ring.z / 2000;
            const hue = (ring.hue + colorTime * 50) % 360;
            const alpha = depth * 0.4 * kaleidoAlpha;
            ctx.strokeStyle = `hsla(${hue}, 80%, 55%, ${alpha})`;
            ctx.lineWidth = 1 + depth * 2.5;
            ctx.shadowColor = `hsla(${hue}, 90%, 50%, ${alpha * 0.5})`;
            ctx.shadowBlur = 10 + depth * 20;
            ctx.beginPath();
            for (let s = 0; s <= ring.sides; s++) {
              const a = (Math.PI * 2 / ring.sides) * s + ring.rot;
              ctx[s === 0 ? "moveTo" : "lineTo"](_cx + Math.cos(a) * radius, _cy + Math.sin(a) * radius);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        });

        // Speed streaks radiating from center
        streaks.forEach(s => {
          s.dist -= speed * s.speed;
          if (s.dist < 0) { s.dist = 1600; s.hue = Math.random() * 360; s.angle = Math.random() * Math.PI * 2; }

          const endDist = s.dist;
          const startDist = s.dist + s.len * (1 + progress * 3);
          const hue = (s.hue + colorTime * 40) % 360;
          const alpha = (1 - endDist / 1600) * 0.5 * kaleidoAlpha;

          if (alpha > 0.01) {
            const x1 = _cx + Math.cos(s.angle) * startDist * (w / 1600);
            const y1 = _cy + Math.sin(s.angle) * startDist * (h / 1600);
            const x2 = _cx + Math.cos(s.angle) * endDist * (w / 1600);
            const y2 = _cy + Math.sin(s.angle) * endDist * (h / 1600);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `hsla(${hue}, 75%, 65%, ${alpha})`;
            ctx.lineWidth = s.w + progress * 2;
            ctx.stroke();
          }
        });

        // Vignette tunnel rim — color cycles
        const rimGrad = ctx.createRadialGradient(_cx, _cy, 0, _cx, _cy, Math.max(w, h) * 0.55);
        rimGrad.addColorStop(0, "transparent");
        rimGrad.addColorStop(0.4, "transparent");
        const rimHue = (colorTime * 60) % 360;
        rimGrad.addColorStop(0.7, `hsla(${rimHue}, 50%, 15%, ${0.2 * kaleidoAlpha})`);
        rimGrad.addColorStop(0.9, `hsla(${(rimHue + 60) % 360}, 60%, 10%, ${0.5 * kaleidoAlpha})`);
        rimGrad.addColorStop(1, `rgba(5, 5, 8, ${0.8 * kaleidoAlpha})`);
        ctx.fillStyle = rimGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ── PHASE 3 (75%-100%): White light engulfs ──
      if (progress > 0.75) {
        const whiteP = (progress - 0.75) / 0.25;
        const eased = whiteP * whiteP * whiteP; // cubic ease-in

        // Pulsing inner light
        const pulseR = 30 + eased * Math.max(w, h) * 1.2;
        const lightGrad = ctx.createRadialGradient(_cx, _cy, 0, _cx, _cy, pulseR);
        lightGrad.addColorStop(0, `rgba(255, 255, 255, ${eased})`);
        lightGrad.addColorStop(0.15, `rgba(220, 255, 240, ${eased * 0.9})`);
        lightGrad.addColorStop(0.35, `rgba(180, 240, 255, ${eased * 0.5})`);
        lightGrad.addColorStop(0.6, `rgba(140, 200, 255, ${eased * 0.2})`);
        lightGrad.addColorStop(1, "transparent");
        ctx.fillStyle = lightGrad;
        ctx.fillRect(0, 0, w, h);

        // Final full whiteout
        if (progress > 0.9) {
          const finalAlpha = (progress - 0.9) / 0.1;
          ctx.fillStyle = `rgba(255, 255, 255, ${finalAlpha})`;
          ctx.fillRect(0, 0, w, h);
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animRef.current); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 10, width: "100%", height: "100%" }} />;
}

// ─── Subtle Matrix Rain Overlay for Homepage ───
function MatrixOverlay() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, columns, drops;
    const chars = "01アウエカキサシスセタチツテトRTV33ΩΔΘ∞◈";
    const fontSize = 13;

    const init = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w; canvas.height = h;
      columns = Math.floor(w / (fontSize * 3)); // sparser than landing
      drops = Array.from({ length: columns }, () => Math.random() * -50);
    };
    init();
    window.addEventListener("resize", init);

    const draw = () => {
      ctx.fillStyle = "rgba(5, 5, 8, 0.08)";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize * 3; // wider spacing
        const y = drops[i] * fontSize;

        const brightness = Math.random();
        if (brightness > 0.97) {
          ctx.fillStyle = "rgba(0, 255, 140, 0.3)";
          ctx.shadowColor = "#00ff8c"; ctx.shadowBlur = 8;
        } else if (brightness > 0.85) {
          ctx.fillStyle = "rgba(0, 255, 140, 0.15)";
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = `rgba(0, 255, 140, ${0.03 + Math.random() * 0.06})`;
          ctx.shadowBlur = 0;
        }
        ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
        ctx.fillText(char, x, y);
        ctx.shadowBlur = 0;

        if (y > h && Math.random() > 0.985) drops[i] = 0;
        drops[i] += 0.3 + Math.random() * 0.2;
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { window.removeEventListener("resize", init); cancelAnimationFrame(animRef.current); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, opacity: 0.5, pointerEvents: "none" }} />;
}


// ═══════════════════════════════════════════════════════════════
// BIO FI3LD — The Energetic Body & Human Biofield
// ═══════════════════════════════════════════════════════════════

function BiofieldVisualizer({ emotion, intensity }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const emotionColors = {
    love: { h: 330, s: 80, l: 60, spread: 1.4, pulse: 0.8, label: "Love & Compassion" },
    joy: { h: 50, s: 90, l: 60, spread: 1.3, pulse: 1.2, label: "Joy & Excitement" },
    peace: { h: 200, s: 70, l: 55, spread: 1.2, pulse: 0.4, label: "Peace & Calm" },
    fear: { h: 0, s: 10, l: 30, spread: 0.5, pulse: 2.5, label: "Fear & Anxiety" },
    anger: { h: 0, s: 90, l: 45, spread: 0.7, pulse: 3.0, label: "Anger & Frustration" },
    sadness: { h: 220, s: 30, l: 35, spread: 0.6, pulse: 0.3, label: "Sadness & Grief" },
    gratitude: { h: 140, s: 80, l: 55, spread: 1.5, pulse: 0.6, label: "Gratitude" },
    neutral: { h: 180, s: 20, l: 45, spread: 0.9, pulse: 0.8, label: "Neutral / Baseline" },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = 400, h = 500;
    canvas.width = w * 2; canvas.height = h * 2;
    ctx.scale(2, 2);
    const cx = w / 2, cy = h * 0.45;

    const draw = (time) => {
      const t = time * 0.001;
      const e = emotionColors[emotion] || emotionColors.neutral;
      const int = intensity / 100;

      ctx.clearRect(0, 0, w, h);

      // Biofield aura layers (outermost first)
      const layers = 8;
      for (let i = layers; i >= 0; i--) {
        const layerRatio = i / layers;
        const baseRadius = 60 + i * 22 * e.spread;
        const wobble = Math.sin(t * e.pulse + i * 0.8) * (6 + i * 3) * int;
        const radius = baseRadius + wobble;

        // Draw aura ellipse
        const hue = (e.h + i * 8) % 360;
        const alpha = (0.06 + (1 - layerRatio) * 0.08) * int;

        ctx.beginPath();
        ctx.ellipse(cx, cy, radius * 0.7, radius, 0, 0, Math.PI * 2);

        const grad = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius);
        grad.addColorStop(0, `hsla(${hue}, ${e.s}%, ${e.l}%, ${alpha * 1.5})`);
        grad.addColorStop(0.5, `hsla(${hue}, ${e.s - 10}%, ${e.l}%, ${alpha})`);
        grad.addColorStop(1, `hsla(${hue}, ${e.s}%, ${e.l}%, 0)`);
        ctx.fillStyle = grad;
        ctx.fill();

        // Pulsing edge glow
        if (i > 2 && i < 7) {
          ctx.strokeStyle = `hsla(${hue}, ${e.s}%, ${e.l + 15}%, ${alpha * 0.8})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Energy particles flowing around the body
      const particleCount = Math.floor(20 + int * 40);
      for (let p = 0; p < particleCount; p++) {
        const angle = (p / particleCount) * Math.PI * 2 + t * (e.pulse * 0.3);
        const orbitA = 80 + Math.sin(t * 0.5 + p * 0.7) * 30;
        const orbitB = 110 + Math.cos(t * 0.3 + p * 0.5) * 40;
        const px = cx + Math.cos(angle) * orbitA * 0.7;
        const py = cy + Math.sin(angle) * orbitB;
        const size = 1 + Math.sin(t * 2 + p) * 0.8;
        const hue = (e.h + p * 5) % 360;

        ctx.beginPath();
        ctx.arc(px, py, size * int, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, ${e.s}%, ${e.l + 20}%, ${0.3 + int * 0.5})`;
        ctx.shadowColor = `hsla(${hue}, ${e.s}%, ${e.l}%, 0.5)`;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Body silhouette (simple)
      // Head
      ctx.beginPath();
      ctx.arc(cx, cy - 62, 18, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Torso
      ctx.beginPath();
      ctx.ellipse(cx, cy - 15, 22, 40, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // Legs
      ctx.beginPath();
      ctx.ellipse(cx - 12, cy + 50, 10, 35, -0.1, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + 12, cy + 50, 10, 35, 0.1, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // Chakra points (7 glowing dots along spine)
      const chakraColors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#6366f1", "#a855f7"];
      const chakraY = [cy + 20, cy + 5, cy - 10, cy - 25, cy - 35, cy - 50, cy - 62];
      chakraColors.forEach((color, i) => {
        const glow = 3 + Math.sin(t * 1.5 + i * 0.9) * 2 * int;
        ctx.beginPath();
        ctx.arc(cx, chakraY[i], glow, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 + int * 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Heart coherence wave (if love/gratitude/peace)
      if (["love", "gratitude", "peace", "joy"].includes(emotion)) {
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${e.h}, ${e.s}%, ${e.l + 20}%, ${0.15 * int})`;
        ctx.lineWidth = 1.5;
        for (let x = 0; x < w; x++) {
          const wave = Math.sin(x * 0.03 + t * 1.5) * 15 * int * Math.sin(x * 0.008);
          ctx[x === 0 ? "moveTo" : "lineTo"](x, h - 40 + wave);
        }
        ctx.stroke();
      }

      // Contracted field indicator (fear/anger/sadness)
      if (["fear", "anger", "sadness"].includes(emotion)) {
        // Jagged static around body
        for (let j = 0; j < 15 * int; j++) {
          const jx = cx + (Math.random() - 0.5) * 120;
          const jy = cy + (Math.random() - 0.5) * 160;
          ctx.beginPath();
          ctx.moveTo(jx, jy);
          ctx.lineTo(jx + (Math.random() - 0.5) * 12, jy + (Math.random() - 0.5) * 12);
          ctx.strokeStyle = `hsla(${e.h}, ${e.s}%, ${e.l}%, ${0.2 + Math.random() * 0.3})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Label
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "11px 'Orbitron', sans-serif";
      ctx.textAlign = "center";
      ctx.letterSpacing = "3px";
      ctx.fillText(e.label.toUpperCase(), cx, h - 10);

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [emotion, intensity]);

  return <canvas ref={canvasRef} style={{ width: "100%", maxWidth: 400, height: "auto", aspectRatio: "4/5" }} />;
}

// Earth field interaction visualizer
function EarthFieldVisualizer({ emotion, peopleCount }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const positive = ["love", "joy", "peace", "gratitude"].includes(emotion);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = 600, h = 240;
    canvas.width = w * 2; canvas.height = h * 2;
    ctx.scale(2, 2);

    const people = Array.from({ length: peopleCount }, (_, i) => ({
      x: 60 + (i / peopleCount) * (w - 120),
      y: h * 0.5,
      phase: Math.random() * Math.PI * 2,
    }));

    const draw = (time) => {
      const t = time * 0.001;
      ctx.clearRect(0, 0, w, h);

      // Earth's field (bottom wave)
      ctx.beginPath();
      const earthHue = positive ? 140 : 0;
      const earthAlpha = positive ? 0.15 : 0.06;
      for (let x = 0; x < w; x++) {
        const baseWave = Math.sin(x * 0.01 + t * 0.3) * 8;
        const harmony = positive ? Math.sin(x * 0.02 + t * 0.7) * 5 * peopleCount * 0.15 : Math.random() * 3;
        ctx[x === 0 ? "moveTo" : "lineTo"](x, h - 20 + baseWave + harmony);
      }
      ctx.strokeStyle = `hsla(${earthHue}, 60%, 50%, ${earthAlpha + peopleCount * 0.02})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText("EARTH'S SCHUMANN RESONANCE (7.83 Hz)", 10, h - 5);

      // Draw each person and their field
      people.forEach((p, i) => {
        // Person dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = positive ? "#00ff8c" : "#ef4444";
        ctx.shadowColor = positive ? "#00ff8c" : "#ef4444";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Individual biofield ring
        const fieldRadius = positive ? 20 + Math.sin(t + p.phase) * 8 : 10 + Math.sin(t * 3 + p.phase) * 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, fieldRadius, 0, Math.PI * 2);
        ctx.strokeStyle = positive ? `rgba(0, 255, 140, ${0.12})` : `rgba(239, 68, 68, ${0.08})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Connection lines between nearby people (coherent fields overlap)
        if (positive && i < people.length - 1) {
          const next = people[i + 1];
          const dist = Math.abs(next.x - p.x);
          if (dist < 100) {
            const connAlpha = (1 - dist / 100) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            const cpY = p.y - 20 - Math.sin(t + i) * 10;
            ctx.quadraticCurveTo((p.x + next.x) / 2, cpY, next.x, next.y);
            ctx.strokeStyle = `rgba(0, 255, 140, ${connAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Waves going down to earth
        ctx.beginPath();
        ctx.moveTo(p.x, p.y + fieldRadius);
        ctx.lineTo(p.x + Math.sin(t + p.phase) * 5, h - 25);
        ctx.strokeStyle = positive ? "rgba(0,255,140,0.06)" : "rgba(255,100,100,0.03)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Collective field overlay (if positive and enough people)
      if (positive && peopleCount >= 3) {
        const collectiveGrad = ctx.createRadialGradient(w / 2, h * 0.5, 0, w / 2, h * 0.5, w * 0.4);
        collectiveGrad.addColorStop(0, `rgba(0, 255, 140, ${0.03 * peopleCount})`);
        collectiveGrad.addColorStop(1, "transparent");
        ctx.fillStyle = collectiveGrad;
        ctx.fillRect(0, 0, w, h);
      }

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [emotion, peopleCount, positive]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "auto", aspectRatio: "5/2" }} />;
}

function BiofieldSection() {
  const [activeEmotion, setActiveEmotion] = useState("neutral");
  const [intensity, setIntensity] = useState(60);
  const [peopleCount, setPeopleCount] = useState(1);
  const [activeLesson, setActiveLesson] = useState(null);

  const emotions = [
    { id: "love", emoji: "💗", color: "#ec4899" },
    { id: "joy", emoji: "✨", color: "#eab308" },
    { id: "peace", emoji: "🕊️", color: "#06b6d4" },
    { id: "gratitude", emoji: "🙏", color: "#22c55e" },
    { id: "neutral", emoji: "😐", color: "#78716c" },
    { id: "sadness", emoji: "💧", color: "#6366f1" },
    { id: "fear", emoji: "😰", color: "#94a3b8" },
    { id: "anger", emoji: "🔥", color: "#ef4444" },
  ];

  const isPositive = ["love", "joy", "peace", "gratitude"].includes(activeEmotion);

  const lessons = [
    {
      id: "what", title: "What Is Your Biofield?", icon: "🌐", color: "#06b6d4",
      content: [
        { type: "head", text: "You Are More Than a Body" },
        { type: "text", text: "Imagine you're holding a magnet. You can't see the magnetic field around it, but it's there — you can feel it pull on metal objects nearby. Your body works the same way." },
        { type: "text", text: "Your heart generates an electromagnetic field that extends 3 to 5 feet outside your body in every direction. Scientists can measure it with sensitive equipment called a magnetometer. This field is called your BIOFIELD — it's a real, measurable energy field that surrounds you like an invisible egg of light." },
        { type: "head", text: "How It Works" },
        { type: "text", text: "Every cell in your body is like a tiny battery running on about 0.07 volts. You have roughly 37 trillion cells. That's a LOT of tiny batteries all firing at once, creating electrical signals that ripple outward." },
        { type: "text", text: "Your heart is the strongest generator — it produces an electrical signal 60 times stronger than your brain. That's why heart-centered emotions (love, gratitude) create the biggest and most coherent fields around you." },
        { type: "fact", text: "The HeartMath Institute has measured the heart's electromagnetic field extending up to 15 feet from the body using SQUID-based magnetometers." },
      ]
    },
    {
      id: "emotions", title: "How Emotions Shape Your Field", icon: "🎭", color: "#a78bfa",
      content: [
        { type: "head", text: "Your Feelings Are Frequencies" },
        { type: "text", text: "Think about a time you walked into a room and could just FEEL the tension — even though nobody said anything. That's because you were sensing other people's biofields. Your body is constantly reading the electromagnetic information in the space around you." },
        { type: "text", text: "When you feel love, gratitude, or joy, your heart rhythm becomes smooth and ordered — scientists call this 'coherent.' Your biofield expands outward like smooth ripples on a pond. It becomes bigger and brighter." },
        { type: "text", text: "When you feel fear, anger, or stress, your heart rhythm becomes jagged and chaotic — 'incoherent.' Your biofield contracts, shrinks close to your body, and becomes noisy, like static on a TV." },
        { type: "head", text: "Try It Right Now" },
        { type: "text", text: "Use the visualizer above — switch between Love and Fear and watch what happens to the field. That's what's actually happening to YOUR energy field right now, based on how you feel." },
        { type: "fact", text: "Research shows that a person in a coherent heart state can measurably influence the brainwaves of another person sitting nearby — without touching or speaking." },
      ]
    },
    {
      id: "others", title: "How Your Field Affects Others", icon: "🤝", color: "#22c55e",
      content: [
        { type: "head", text: "You Are a Walking Broadcast Tower" },
        { type: "text", text: "Your biofield doesn't stop at your skin. It radiates outward and overlaps with every person near you. When your field overlaps with someone else's, information is exchanged — not through words, but through electromagnetic waves." },
        { type: "text", text: "This is why you feel different around different people. That friend who always makes you feel calm? Their coherent biofield is literally entraining (syncing) your heart rhythm to match theirs. That person who stresses you out? Their chaotic field is doing the same thing in reverse." },
        { type: "head", text: "The Ripple Effect" },
        { type: "text", text: "Use the slider below the Earth visualization to add more people. Watch how coherent fields connect and amplify each other, while incoherent fields stay isolated. When a group of people feel love or gratitude together, their combined field becomes much stronger than any individual's." },
        { type: "text", text: "This is why meditation groups, concerts, prayer circles, and sports stadiums all feel so powerful — hundreds or thousands of biofields syncing up creates something bigger than the sum of its parts." },
        { type: "fact", text: "The Global Coherence Initiative has found correlations between mass human emotions and disturbances in Earth's magnetic field — measured by magnetometers placed around the planet." },
      ]
    },
    {
      id: "earth", title: "Your Field & The Earth", icon: "🌍", color: "#eab308",
      content: [
        { type: "head", text: "You're Plugged Into the Planet" },
        { type: "text", text: "The Earth itself has a biofield — a massive electromagnetic field generated by its molten iron core. It pulses at a baseline frequency of 7.83 Hz, called the Schumann Resonance. Here's the wild part: your brain's alpha waves (the ones you produce when you're calm and aware) pulse at almost the exact same frequency." },
        { type: "text", text: "This isn't a coincidence. Life on Earth evolved INSIDE this field for billions of years. Your nervous system is literally tuned to the planet's frequency like a radio tuned to a station." },
        { type: "head", text: "Grounding Is Real Science" },
        { type: "text", text: "When you walk barefoot on grass, soil, or sand, free electrons from the Earth flow into your body through your feet. These electrons are antioxidants — they neutralize inflammation. Studies published in the Journal of Environmental and Public Health show that grounding reduces cortisol, improves sleep, and normalizes your body's electrical state." },
        { type: "text", text: "Think of it this way: your phone needs to be charged. You are an electrical being who also needs to be 'charged' — and the Earth is your charger." },
        { type: "fact", text: "Astronauts in space, cut off from Earth's Schumann Resonance, experienced health problems until NASA installed Schumann Resonance generators in spacecraft." },
      ]
    },
    {
      id: "waves", title: "Frequencies & Vibration 101", icon: "〰️", color: "#ec4899",
      content: [
        { type: "head", text: "Everything Vibrates — Literally" },
        { type: "text", text: "Pick up any solid object near you — a pen, your phone, a book. It looks solid, right? But zoom in to the atomic level and it's 99.9999% empty space. The tiny bit of matter that IS there is vibrating at incredibly high frequencies. Everything you see, touch, and hear is vibration." },
        { type: "text", text: "Sound is vibration you can hear (20Hz to 20,000Hz). Light is vibration you can see (430 trillion Hz to 750 trillion Hz). Your thoughts and emotions create vibrations you can FEEL — even if most people haven't been taught to notice them." },
        { type: "head", text: "Resonance: The Key to Everything" },
        { type: "text", text: "When you strike a tuning fork and hold it near another tuning fork of the same pitch, the second one starts vibrating too — without being touched. This is called resonance. Your biofield works the same way." },
        { type: "text", text: "When you're around someone vibrating at a frequency of love or joy, your field starts to resonate with theirs — you literally start feeling what they feel. This is why 'raise your vibration' isn't just a saying. It's physics." },
        { type: "fact", text: "In 1665, Dutch physicist Christiaan Huygens discovered that pendulum clocks hanging on the same wall would synchronize their swings. This is the same principle at work in human biofield entrainment." },
      ]
    },
    {
      id: "protect", title: "How to Strengthen Your Field", icon: "🛡️", color: "#f97316",
      content: [
        { type: "head", text: "Your Field Is Like a Muscle" },
        { type: "text", text: "The more you practice positive emotional states, the stronger and more resilient your biofield becomes. Here's how:" },
        { type: "head", text: "1. Heart Coherence Breathing" },
        { type: "text", text: "Breathe in for 5 seconds, out for 5 seconds, while focusing on your heart area and feeling gratitude. Do this for 3 minutes. This single practice, backed by over 300 peer-reviewed studies, creates measurable coherence in your biofield within 60 seconds." },
        { type: "head", text: "2. Grounding" },
        { type: "text", text: "Stand barefoot on earth for 20 minutes daily. This recharges your electrical system and synchronizes your field with the Earth's Schumann Resonance." },
        { type: "head", text: "3. Protect Your Field" },
        { type: "text", text: "Limit time around people who drain you. Avoid excessive screen time (screens emit EMF that disrupts your field). Spend time in nature — trees and plants have their own coherent biofields." },
        { type: "head", text: "4. Amplify With Others" },
        { type: "text", text: "Meditate with others. Practice gratitude in groups. Sing together. Any time multiple people enter coherent states simultaneously, the collective field becomes exponentially stronger." },
        { type: "fact", text: "A study by the HeartMath Institute found that trained individuals could intentionally alter the conformation (shape) of DNA in a test tube using focused heart coherence from several feet away." },
      ]
    },
  ];

  if (activeLesson) {
    const lesson = lessons.find(l => l.id === activeLesson);
    return (
      <div style={{ animation: "fadeInUp 0.4s ease" }}>
        <button onClick={() => setActiveLesson(null)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", marginBottom: 24 }}>← BACK TO BIO FI3LD</button>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <span style={{ fontSize: 40 }}>{lesson.icon}</span>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "#fff", fontFamily: "'Orbitron', sans-serif", margin: 0, letterSpacing: 1 }}>{lesson.title}</h2>
        </div>

        <GlassCard hover={false} style={{ maxWidth: 700 }}>
          {lesson.content.map((block, i) => {
            if (block.type === "head") return <h3 key={i} style={{ fontSize: 16, fontWeight: 600, color: lesson.color, margin: i === 0 ? "0 0 12px" : "28px 0 12px", fontFamily: "'Orbitron', sans-serif", letterSpacing: 1 }}>{block.text}</h3>;
            if (block.type === "fact") return (
              <div key={i} style={{ margin: "20px 0", padding: "16px 20px", borderRadius: 10, background: `${lesson.color}08`, borderLeft: `3px solid ${lesson.color}`, }}>
                <span style={{ fontSize: 10, letterSpacing: 2, color: lesson.color, fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 6 }}>⟡ RESEARCH</span>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, margin: 0 }}>{block.text}</p>
              </div>
            );
            return <p key={i} style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 2, margin: "0 0 14px" }}>{block.text}</p>;
          })}
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeInUp 0.5s ease" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <div style={{ width: 3, height: 28, background: "linear-gradient(to bottom, #a78bfa, #06b6d4)", borderRadius: 2 }} />
        <h2 style={{ fontSize: 22, fontWeight: 300, color: "#fff", fontFamily: "'Sora', sans-serif", margin: 0 }}>BIO FI3LD</h2>
      </div>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.8, marginTop: 8, marginBottom: 28 }}>
        Your body is surrounded by a measurable electromagnetic field that changes shape, size, and frequency based on your emotions. 
        This isn't spiritual theory — it's physics. Explore how your feelings literally reshape the energy around you.
      </p>

      {/* Interactive Visualizer Section */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 32 }}>
        {/* Biofield Visualizer */}
        <GlassCard hover={false} style={{ flex: "0 1 420px", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" }}>
          <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif", marginBottom: 12 }}>YOUR BIOFIELD — LIVE</span>
          <BiofieldVisualizer emotion={activeEmotion} intensity={intensity} />
        </GlassCard>

        {/* Controls */}
        <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Emotion Selector */}
          <GlassCard hover={false}>
            <span style={{ fontSize: 10, letterSpacing: 3, color: "#00ff8c", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 14 }}>SELECT AN EMOTION</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {emotions.map(e => (
                <button key={e.id} onClick={() => setActiveEmotion(e.id)} style={{
                  padding: "10px 16px", borderRadius: 10, cursor: "pointer", transition: "all 0.3s ease",
                  background: activeEmotion === e.id ? `${e.color}20` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${activeEmotion === e.id ? `${e.color}50` : "rgba(255,255,255,0.06)"}`,
                  color: activeEmotion === e.id ? e.color : "rgba(255,255,255,0.4)",
                  display: "flex", alignItems: "center", gap: 6, fontSize: 12,
                  boxShadow: activeEmotion === e.id ? `0 0 15px ${e.color}20` : "none",
                }}>
                  <span style={{ fontSize: 16 }}>{e.emoji}</span>
                  <span style={{ textTransform: "capitalize", fontFamily: "'Sora', sans-serif" }}>{e.id}</span>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Intensity Slider */}
          <GlassCard hover={false}>
            <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 10 }}>INTENSITY: <span style={{ color: isPositive ? "#00ff8c" : "#ef4444" }}>{intensity}%</span></span>
            <input type="range" min="10" max="100" value={intensity} onChange={e => setIntensity(Number(e.target.value))}
              style={{ width: "100%", accentColor: isPositive ? "#00ff8c" : "#ef4444", cursor: "pointer" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>
              <span>Faint</span><span>Overwhelming</span>
            </div>
          </GlassCard>

          {/* What's happening box */}
          <GlassCard hover={false} style={{ borderLeft: `3px solid ${isPositive ? "#00ff8c" : "#ef4444"}` }}>
            <span style={{ fontSize: 10, letterSpacing: 3, color: isPositive ? "#00ff8c" : "#ef4444", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 8 }}>⟡ WHAT'S HAPPENING</span>
            {isPositive ? (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, margin: 0 }}>
                Your heart rhythm is <strong style={{ color: "#00ff8c" }}>coherent</strong> — smooth, ordered, harmonious. 
                Your biofield is <strong style={{ color: "#00ff8c" }}>expanding</strong> outward, growing brighter. 
                The electromagnetic waves you're emitting are like clean radio signals that other people's nervous systems can pick up and sync with. 
                You are literally raising the vibration of every room you walk into.
              </p>
            ) : activeEmotion === "neutral" ? (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, margin: 0 }}>
                Your field is at baseline — neither expanding nor contracting. This is your resting state. 
                Try selecting different emotions above to see how dramatically your biofield changes in real time.
              </p>
            ) : (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, margin: 0 }}>
                Your heart rhythm is <strong style={{ color: "#ef4444" }}>incoherent</strong> — jagged, chaotic, fragmented. 
                Your biofield is <strong style={{ color: "#ef4444" }}>contracting</strong> close to your body, becoming smaller and dimmer. 
                The electromagnetic noise you're emitting creates stress responses in people around you — even if you don't say a word. 
                Your body is burning extra energy maintaining this state.
              </p>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Earth Field Interaction */}
      <GlassCard hover={false} style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 10, letterSpacing: 3, color: "#eab308", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 4 }}>HOW YOUR FIELD AFFECTS PEOPLE & THE EARTH</span>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
          Slide to add more people. Watch how {isPositive ? "coherent fields connect and amplify" : "incoherent fields stay isolated"}.
        </p>
        <EarthFieldVisualizer emotion={activeEmotion} peopleCount={peopleCount} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>PEOPLE:</span>
          <input type="range" min="1" max="8" value={peopleCount} onChange={e => setPeopleCount(Number(e.target.value))}
            style={{ flex: 1, accentColor: isPositive ? "#00ff8c" : "#ef4444", cursor: "pointer", maxWidth: 300 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: isPositive ? "#00ff8c" : "#ef4444", fontFamily: "'Orbitron', sans-serif" }}>{peopleCount}</span>
        </div>
        {peopleCount >= 3 && isPositive && (
          <div style={{ marginTop: 12, padding: "10px 16px", borderRadius: 8, background: "rgba(0,255,140,0.06)", border: "1px solid rgba(0,255,140,0.12)" }}>
            <p style={{ fontSize: 12, color: "#00ff8c", margin: 0 }}>⟡ Collective coherence detected — the group field is amplifying. Earth's field is responding.</p>
          </div>
        )}
      </GlassCard>

      {/* Lessons Grid */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif" }}>DEEP DIVE LESSONS</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 12 }}>
        {lessons.map(lesson => (
          <GlassCard key={lesson.id} onClick={() => setActiveLesson(lesson.id)} style={{
            flex: "1 1 260px", minWidth: 240, cursor: "pointer", borderTop: `2px solid ${lesson.color}40`,
          }}>
            <span style={{ fontSize: 28, display: "block", marginBottom: 10 }}>{lesson.icon}</span>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", fontFamily: "'Orbitron', sans-serif", margin: "0 0 6px", letterSpacing: 1 }}>{lesson.title}</h3>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.6, margin: "0 0 12px" }}>
              {lesson.content.find(c => c.type === "text")?.text.substring(0, 90)}...
            </p>
            <span style={{ fontSize: 10, color: lesson.color, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>READ →</span>
          </GlassCard>
        ))}
      </div>

      {/* Bottom disclaimer */}
      <div style={{ marginTop: 28, padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>
          Based on research from the HeartMath Institute, Dr. Valerie Hunt (UCLA), Dr. Harold Burr (Yale), and the Global Coherence Initiative. Your biofield is real. Your emotions shape it. You shape the world around you.
        </p>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// BIO FI3LD — Interactive Biofield Education
// ═══════════════════════════════════════════════════════════════

function BiofieldCanvas({ emotion, radius }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const emotionColors = {
    love: { core: [340, 80, 60], mid: [320, 70, 50], outer: [280, 60, 40], speed: 0.8, chaos: 0.1, expand: 1.4 },
    joy: { core: [50, 90, 65], mid: [40, 80, 55], outer: [30, 70, 45], speed: 1.2, chaos: 0.15, expand: 1.3 },
    peace: { core: [200, 70, 60], mid: [220, 60, 50], outer: [240, 50, 40], speed: 0.4, chaos: 0.05, expand: 1.2 },
    fear: { core: [0, 10, 30], mid: [20, 30, 25], outer: [0, 5, 20], speed: 2.5, chaos: 0.6, expand: 0.6 },
    anger: { core: [0, 90, 50], mid: [15, 80, 40], outer: [350, 70, 30], speed: 3, chaos: 0.8, expand: 0.8 },
    sadness: { core: [220, 40, 35], mid: [230, 30, 28], outer: [240, 20, 20], speed: 0.3, chaos: 0.2, expand: 0.7 },
    gratitude: { core: [140, 80, 55], mid: [120, 70, 50], outer: [160, 60, 45], speed: 0.6, chaos: 0.08, expand: 1.5 },
    neutral: { core: [180, 30, 45], mid: [190, 25, 38], outer: [200, 20, 30], speed: 0.7, chaos: 0.15, expand: 1.0 },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = 400;
    canvas.width = size * 2; canvas.height = size * 2;
    ctx.scale(2, 2);
    const cx = size / 2, cy = size / 2;
    const em = emotionColors[emotion] || emotionColors.neutral;

    const draw = (time) => {
      const t = time * 0.001;
      ctx.clearRect(0, 0, size, size);

      // Draw biofield layers (outer to inner)
      const layers = 8;
      for (let i = layers; i >= 0; i--) {
        const layerRatio = i / layers;
        const baseRadius = (30 + layerRatio * 120) * em.expand * (radius / 100);

        // Organic wobble
        ctx.beginPath();
        const points = 64;
        for (let p = 0; p <= points; p++) {
          const angle = (Math.PI * 2 / points) * p;
          const wobble1 = Math.sin(angle * 3 + t * em.speed) * em.chaos * 20;
          const wobble2 = Math.cos(angle * 5 + t * em.speed * 0.7) * em.chaos * 12;
          const wobble3 = Math.sin(angle * 7 + t * em.speed * 1.3) * em.chaos * 8;
          const r = baseRadius + wobble1 + wobble2 + wobble3;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          ctx[p === 0 ? "moveTo" : "lineTo"](x, y);
        }
        ctx.closePath();

        const h = em.core[0] + (em.outer[0] - em.core[0]) * layerRatio;
        const s = em.core[1] + (em.outer[1] - em.core[1]) * layerRatio;
        const l = em.core[2] + (em.outer[2] - em.core[2]) * layerRatio;
        const alpha = (1 - layerRatio) * 0.12 + 0.02;

        ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
        ctx.fill();
        ctx.strokeStyle = `hsla(${h}, ${s}%, ${l + 15}%, ${alpha * 1.5})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Body silhouette (center)
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.beginPath();
      ctx.ellipse(cx, cy - 35, 14, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx, cy + 10, 20, 35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx, cy + 55, 12, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - 10, cy + 55, 12, 30, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 10, cy + 55, 12, 30, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // Chakra points
      const chakraY = [cy - 42, cy - 28, cy - 14, cy, cy + 14, cy + 28, cy + 42];
      const chakraColors = ["#a855f7", "#6366f1", "#06b6d4", "#22c55e", "#eab308", "#f97316", "#ef4444"];
      chakraY.forEach((y, i) => {
        const pulse = Math.sin(t * 2 + i * 0.8) * 0.3 + 0.7;
        const r = 3 + pulse * 2;
        ctx.beginPath();
        ctx.arc(cx, y, r, 0, Math.PI * 2);
        ctx.fillStyle = chakraColors[i];
        ctx.shadowColor = chakraColors[i];
        ctx.shadowBlur = 8 + pulse * 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Energy particles flowing through field
      for (let p = 0; p < 30; p++) {
        const angle = (Math.PI * 2 / 30) * p + t * em.speed * 0.3;
        const dist = 60 + Math.sin(t * 0.5 + p * 0.7) * 40 * em.expand;
        const px = cx + Math.cos(angle) * dist * (radius / 100);
        const py = cy + Math.sin(angle) * dist * (radius / 100);
        const particleSize = 1 + Math.sin(t + p) * 0.8;
        const h = em.core[0] + Math.sin(t + p * 0.5) * 30;
        ctx.beginPath();
        ctx.arc(px, py, particleSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${h}, 70%, 65%, ${0.3 + Math.sin(t * 2 + p) * 0.2})`;
        ctx.fill();
      }

      // Heart coherence wave (toroidal hint)
      if (emotion === "love" || emotion === "gratitude" || emotion === "joy") {
        ctx.strokeStyle = `hsla(${em.core[0]}, 60%, 55%, 0.15)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.05) {
          const torusR = 80 * em.expand * (radius / 100);
          const tubeR = 30 + Math.sin(t * 0.5) * 10;
          const x = cx + (torusR + tubeR * Math.cos(a * 3 + t)) * Math.cos(a);
          const y = cy + tubeR * Math.sin(a * 3 + t) * 0.6;
          ctx[a === 0 ? "moveTo" : "lineTo"](x, y);
        }
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [emotion, radius]);

  return <canvas ref={canvasRef} style={{ width: 400, height: 400, maxWidth: "100%" }} />;
}

// Earth field connection visualizer
function EarthFieldCanvas({ emotion, sendingLove }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = 700, h = 260;
    canvas.width = w * 2; canvas.height = h * 2;
    ctx.scale(2, 2);

    const people = [
      { x: 100, label: "YOU" },
      { x: 280, label: "NEARBY" },
      { x: 460, label: "DISTANT" },
      { x: 600, label: "EARTH" },
    ];

    const draw = (time) => {
      const t = time * 0.001;
      ctx.clearRect(0, 0, w, h);

      // Draw connection waves between people
      const waveColor = sendingLove
        ? `hsla(140, 70%, 55%, ${0.15 + Math.sin(t * 2) * 0.1})`
        : `hsla(200, 30%, 40%, 0.08)`;

      for (let i = 0; i < people.length - 1; i++) {
        const from = people[i], to = people[i + 1];
        ctx.beginPath();
        for (let x = from.x; x <= to.x; x += 2) {
          const progress = (x - from.x) / (to.x - from.x);
          const waveH = Math.sin(x * 0.05 + t * (sendingLove ? 3 : 1)) * (sendingLove ? 15 : 6);
          const y = 130 + waveH * (1 - Math.abs(progress - 0.5) * 2);
          ctx[x === from.x ? "moveTo" : "lineTo"](x, y);
        }
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = sendingLove ? 2 : 1;
        ctx.stroke();

        // Second harmonic
        ctx.beginPath();
        for (let x = from.x; x <= to.x; x += 2) {
          const waveH = Math.cos(x * 0.08 + t * 1.5) * (sendingLove ? 10 : 4);
          const y = 130 + waveH;
          ctx[x === from.x ? "moveTo" : "lineTo"](x, y);
        }
        ctx.strokeStyle = sendingLove
          ? `hsla(320, 60%, 55%, ${0.1 + Math.sin(t) * 0.05})`
          : `hsla(220, 20%, 35%, 0.05)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Traveling energy pulses
      if (sendingLove) {
        for (let pulse = 0; pulse < 5; pulse++) {
          const px = (t * 80 + pulse * 140) % (w - 50) + 50;
          const py = 130 + Math.sin(px * 0.03 + t) * 8;
          ctx.beginPath();
          ctx.arc(px, py, 3 + Math.sin(t * 3 + pulse) * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${140 + pulse * 40}, 70%, 60%, ${0.5 + Math.sin(t * 2 + pulse) * 0.3})`;
          ctx.shadowColor = `hsla(${140 + pulse * 40}, 80%, 55%, 0.5)`;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Draw people with biofield bubbles
      people.forEach((p, i) => {
        const fieldSize = i === 0 ? (sendingLove ? 40 : 25) : (sendingLove ? 30 - i * 3 : 18 - i * 2);
        const hue = i === 3 ? 140 : (sendingLove ? 320 - i * 30 : 200);
        const pulse = Math.sin(t * 1.5 + i) * 0.2 + 0.8;

        // Field
        ctx.beginPath();
        ctx.ellipse(p.x, 130, fieldSize * pulse, fieldSize * 1.3 * pulse, 0, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 50%, 45%, 0.08)`;
        ctx.strokeStyle = `hsla(${hue}, 50%, 50%, 0.15)`;
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();

        // Body dot
        ctx.beginPath();
        ctx.arc(p.x, 130, i === 3 ? 10 : 5, 0, Math.PI * 2);
        ctx.fillStyle = i === 3 ? `hsla(140, 60%, 40%, 0.5)` : `rgba(255,255,255,0.2)`;
        ctx.fill();

        // Earth icon
        if (i === 3) {
          ctx.font = "16px sans-serif";
          ctx.fillText("🌍", p.x - 8, 135);
        }

        // Label
        ctx.font = "9px 'Orbitron', monospace";
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.textAlign = "center";
        ctx.fillText(p.label, p.x, 175);
      });

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [emotion, sendingLove]);

  return <canvas ref={canvasRef} style={{ width: "100%", maxWidth: 700, height: 260 }} />;
}

function BiofieldSection() {
  const [emotion, setEmotion] = useState("neutral");
  const [fieldRadius, setFieldRadius] = useState(80);
  const [sendingLove, setSendingLove] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);

  const emotions = [
    { id: "love", label: "Love", emoji: "💖", color: "#ec4899", desc: "Your biofield expands to its maximum — up to 15 feet. Heart produces the strongest electromagnetic signal. Others can literally feel it." },
    { id: "joy", label: "Joy", emoji: "✨", color: "#eab308", desc: "High-frequency state. Your field brightens and becomes more active. Energy particles move faster. You become magnetic to good things." },
    { id: "gratitude", label: "Gratitude", emoji: "🙏", color: "#22c55e", desc: "Produces heart coherence — your heart rhythm becomes smooth and ordered. This signal syncs with Earth's Schumann resonance (7.83 Hz)." },
    { id: "peace", label: "Peace", emoji: "🕊️", color: "#06b6d4", desc: "Calm, expanded field with minimal distortion. Your nervous system enters rest-and-repair mode. Healing happens in this state." },
    { id: "neutral", label: "Neutral", emoji: "😐", color: "#64748b", desc: "Average biofield state. Not expanding, not contracting. Most people walk around here — functional but not optimized." },
    { id: "sadness", label: "Sadness", emoji: "💧", color: "#6366f1", desc: "Your field contracts and dims. Energy moves slower. The body redirects resources inward. This isn't bad — it's processing." },
    { id: "fear", label: "Fear", emoji: "😰", color: "#78716c", desc: "Field collapses close to the body and becomes chaotic. Fight-or-flight activates. Your heart signal becomes irregular and jagged." },
    { id: "anger", label: "Anger", emoji: "🔥", color: "#ef4444", desc: "Intense, spiky field with maximum chaos. Strong energy output but destructive pattern. Others feel this as tension or threat." },
  ];

  const lessons = [
    {
      id: "what", title: "What Is Your Biofield?", icon: "🔮", color: "#a78bfa",
      content: [
        { head: "You Are Electric", text: "Your body is not just skin and bones — it runs on electricity. Every cell in your body has a voltage, like a tiny battery. Your heart generates an electrical signal so strong it can be measured from several feet away. Your brain fires billions of electrical signals every second. All of this electricity creates an invisible energy field around your body — your biofield." },
        { head: "Think of It Like WiFi", text: "You know how your phone connects to WiFi? The router sends out invisible waves and your phone picks them up. Your body works the same way. Your heart sends out electromagnetic waves that travel outward from your body in a donut shape (scientists call this a torus). Other people's bodies can actually pick up these waves — that's why you can 'feel' someone's mood when they walk into a room." },
        { head: "It's Been Measured by Science", text: "The HeartMath Institute has measured the human biofield extending 6-15 feet from the body. Doctors measure your heart's field with an ECG and your brain's field with an EEG. SQUID magnetometers can detect the field of individual organs. This isn't magic — it's measurable, repeatable physics." },
        { head: "Ancient People Knew About It", text: "Every ancient culture had a name for this: the Chinese called it 'Qi' (chi), Indians called it 'Prana,' the Japanese call it 'Ki.' They built entire medical systems around it thousands of years before we had the technology to measure it. They were right all along." },
      ]
    },
    {
      id: "how", title: "How Emotions Change Your Field", icon: "💓", color: "#ec4899",
      content: [
        { head: "Your Heart Is the Boss", text: "Most people think the brain runs the show. But your heart actually sends MORE signals TO the brain than the brain sends to the heart. The heart's electromagnetic field is 100 times stronger electrically and 5,000 times stronger magnetically than the brain's. When your heart is happy, your whole field changes." },
        { head: "Coherent vs. Incoherent", text: "When you feel love, gratitude, or peace, your heart rhythm becomes smooth and wavy — like a perfect sine wave. Scientists call this 'coherence.' It's like clean music. When you feel stress, fear, or anger, the rhythm becomes jagged and chaotic — like static noise. This pattern radiates outward through your whole biofield." },
        { head: "Other People Feel Your Field", text: "Have you ever walked into a room and just KNEW someone was angry, even before they said anything? That's because their chaotic biofield was literally disrupting yours. Your nervous system picks up other people's electromagnetic signals and processes them before your conscious mind even knows what's happening." },
        { head: "You're Broadcasting 24/7", text: "You don't get to turn off your biofield. Every emotion you feel changes the signal you're sending into the world. Happy people make other people happy not just because of their words — their field is literally entraining (syncing up) the fields of people around them. You're a walking radio station." },
      ]
    },
    {
      id: "earth", title: "Your Field & The Earth", icon: "🌍", color: "#22c55e",
      content: [
        { head: "Earth Has a Heartbeat", text: "The Earth has its own electromagnetic pulse called the Schumann Resonance — it vibrates at 7.83 Hz. Your brain naturally produces alpha waves at almost the same frequency when you're calm and relaxed. This isn't a coincidence. You're literally tuned to the same station as the planet." },
        { head: "We're All Connected to the Same Field", text: "Earth's magnetic field wraps around the entire planet like a giant invisible blanket. Every human, animal, and plant exists inside this field. When you change your biofield — even a tiny bit — it ripples outward into this shared field. One person's genuine love or fear contributes to the overall 'vibe' of the planet." },
        { head: "The Global Consciousness Project", text: "Princeton University ran an experiment with random number generators placed around the world. During huge events where millions of people felt the same emotion (like 9/11, or a World Cup goal), the machines stopped being random. Mass human emotion literally changed the behavior of electronic equipment worldwide." },
        { head: "Grounding Connects You Directly", text: "When you stand barefoot on Earth, free electrons flow from the ground into your body. This neutralizes free radicals (which cause inflammation), syncs your circadian rhythm, and literally plugs your biofield into Earth's field. It's the simplest, most powerful thing you can do — and it costs nothing." },
      ]
    },
    {
      id: "upgrade", title: "How to Upgrade Your Biofield", icon: "⚡", color: "#eab308",
      content: [
        { head: "Heart-Focused Breathing", text: "Put your hand on your heart. Breathe slowly — 5 seconds in, 5 seconds out. As you breathe, genuinely feel appreciation for something in your life. Within 60 seconds, your heart rhythm shifts into coherence and your biofield expands. Do this for 5 minutes daily and you will literally rewire your nervous system." },
        { head: "Choose Your Emotions on Purpose", text: "Most people let their emotions run on autopilot — they react to whatever happens. But you can choose. When you catch yourself in fear or anger, you can consciously shift to gratitude or peace. It takes practice, but every time you do it, you're strengthening a neural pathway and expanding your field." },
        { head: "Be Careful What You Consume", text: "Everything has a frequency — food, music, media, people. Junk food, scary news, and negative people shrink your biofield. Fresh food, nature, beautiful music, and loving people expand it. You're not being weird for being selective — you're being smart about your energy." },
        { head: "Your Field Affects Others — Use It", text: "When you walk into a room with a strong, coherent biofield, you're not just helping yourself — you're giving everyone around you a chance to sync up with your signal. One calm person can shift an entire room. One genuinely loving person can shift a family, a school, a community. This is real power." },
      ]
    },
  ];

  const currentEmotion = emotions.find(e => e.id === emotion);

  // Lesson detail view
  if (activeLesson) {
    const lesson = lessons.find(l => l.id === activeLesson);
    return (
      <div style={{ animation: "fadeInUp 0.4s ease" }}>
        <button onClick={() => setActiveLesson(null)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", marginBottom: 24 }}>← BACK</button>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <span style={{ fontSize: 40 }}>{lesson.icon}</span>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "#fff", fontFamily: "'Orbitron', sans-serif", margin: 0, letterSpacing: 1 }}>{lesson.title}</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {lesson.content.map((block, i) => (
            <GlassCard key={i} hover={false} style={{ borderLeft: `3px solid ${lesson.color}`, animation: `fadeInUp ${0.3 + i * 0.15}s ease` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${lesson.color}20`, border: `1px solid ${lesson.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: lesson.color, fontWeight: 700, fontFamily: "'Orbitron', sans-serif" }}>{i + 1}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0 }}>{block.head}</h3>
              </div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 2, margin: 0 }}>{block.text}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeInUp 0.5s ease" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <div style={{ width: 3, height: 28, background: "linear-gradient(to bottom, #a78bfa, #ec4899)", borderRadius: 2 }} />
        <h2 style={{ fontSize: 22, fontWeight: 300, color: "#fff", fontFamily: "'Sora', sans-serif", margin: 0 }}>BIO FI3LD</h2>
      </div>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.8, marginTop: 8, marginBottom: 28 }}>
        Your body is surrounded by an invisible energy field — your biofield. It changes shape, size, and color based on your emotions, thoughts, and health. Learn how it works, see it in action, and discover how your field affects everyone around you.
      </p>

      {/* ─── Interactive Biofield Visualizer ─── */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 32 }}>
        <GlassCard hover={false} style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 24px" }}>
          <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif", marginBottom: 12 }}>YOUR BIOFIELD — LIVE</span>
          <BiofieldCanvas emotion={emotion} radius={fieldRadius} />
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <span style={{ fontSize: 24 }}>{currentEmotion.emoji}</span>
            <div style={{ fontSize: 14, color: currentEmotion.color, fontFamily: "'Orbitron', sans-serif", letterSpacing: 2, marginTop: 4 }}>{currentEmotion.label.toUpperCase()}</div>
          </div>
        </GlassCard>

        <div style={{ flex: 1, minWidth: 280 }}>
          {/* Emotion Selector */}
          <GlassCard hover={false} style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 10, letterSpacing: 3, color: "#00ff8c", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 14 }}>⟡ SELECT AN EMOTION — WATCH THE FIELD CHANGE</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {emotions.map(em => (
                <button key={em.id} onClick={() => { setEmotion(em.id); setFieldRadius(em.id === "love" || em.id === "gratitude" ? 120 : em.id === "fear" || em.id === "anger" ? 50 : em.id === "sadness" ? 60 : 80); }} style={{
                  padding: "8px 14px", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.3s",
                  background: emotion === em.id ? `${em.color}20` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${emotion === em.id ? `${em.color}50` : "rgba(255,255,255,0.06)"}`,
                  color: emotion === em.id ? em.color : "rgba(255,255,255,0.4)",
                  fontSize: 12,
                }}>
                  <span style={{ fontSize: 16 }}>{em.emoji}</span> {em.label}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Current emotion description */}
          <GlassCard hover={false} style={{ borderLeft: `3px solid ${currentEmotion.color}`, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 10, letterSpacing: 2, color: currentEmotion.color, fontFamily: "'Orbitron', sans-serif" }}>WHAT'S HAPPENING TO YOUR FIELD</span>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.9, margin: 0 }}>{currentEmotion.desc}</p>
          </GlassCard>

          {/* Field Radius Slider */}
          <GlassCard hover={false}>
            <span style={{ fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 10 }}>FIELD STRENGTH</span>
            <input type="range" min="20" max="150" value={fieldRadius} onChange={e => setFieldRadius(Number(e.target.value))}
              style={{ width: "100%", accentColor: currentEmotion.color, height: 4, cursor: "pointer" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>Collapsed</span>
              <span style={{ fontSize: 12, color: currentEmotion.color, fontFamily: "'Orbitron', sans-serif" }}>{fieldRadius}%</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>Expanded</span>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ─── Field-to-Field Connection ─── */}
      <GlassCard hover={false} style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <span style={{ fontSize: 10, letterSpacing: 3, color: "#22c55e", fontFamily: "'Orbitron', sans-serif" }}>⟡ FIELD-TO-FIELD CONNECTION</span>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>See how your biofield signal reaches other people and the Earth itself</p>
          </div>
          <button onClick={() => setSendingLove(!sendingLove)} style={{
            padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", transition: "all 0.3s",
            background: sendingLove ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${sendingLove ? "rgba(236,72,153,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: sendingLove ? "#ec4899" : "rgba(255,255,255,0.4)",
          }}>
            {sendingLove ? "💖 SENDING LOVE — ACTIVE" : "◈ ACTIVATE LOVE SIGNAL"}
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <EarthFieldCanvas emotion={emotion} sendingLove={sendingLove} />
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 12, lineHeight: 1.7 }}>
          {sendingLove
            ? "Your coherent heart signal is radiating outward — influencing nearby fields, reaching distant people, and contributing to Earth's global field. This is real. This is measurable."
            : "Press the button to activate a coherent love signal and watch how it travels from your field to others and to the Earth."}
        </p>
      </GlassCard>

      {/* ─── Lesson Cards ─── */}
      <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 16 }}>LEARN — TAP TO EXPLORE</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        {lessons.map(lesson => (
          <GlassCard key={lesson.id} onClick={() => setActiveLesson(lesson.id)} style={{ flex: "1 1 280px", cursor: "pointer", borderTop: `2px solid ${lesson.color}40` }}>
            <span style={{ fontSize: 32, display: "block", marginBottom: 12 }}>{lesson.icon}</span>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", fontFamily: "'Orbitron', sans-serif", margin: "0 0 8px", letterSpacing: 1 }}>{lesson.title}</h3>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: "0 0 14px" }}>
              {lesson.content[0].text.substring(0, 120)}...
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: lesson.color, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>READ →</span>
              <div style={{ flex: 1, height: 1, background: `${lesson.color}20` }} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{lesson.content.length} sections</span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* ─── Quick Facts ─── */}
      <GlassCard hover={false} style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 10, letterSpacing: 3, color: "#eab308", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 16 }}>⟡ BIOFIELD FACTS</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { fact: "Your heart's electromagnetic field extends 6-15 feet from your body", source: "HeartMath Institute", color: "#ef4444" },
            { fact: "Heart is 100x electrically and 5,000x magnetically stronger than the brain", source: "HeartMath Research", color: "#ec4899" },
            { fact: "Earth's Schumann Resonance (7.83 Hz) matches human alpha brainwaves", source: "NASA / Schumann 1952", color: "#22c55e" },
            { fact: "Plants grow faster when exposed to coherent human biofields", source: "Dr. Bernard Grad, McGill University", color: "#a78bfa" },
            { fact: "Random number generators worldwide responded to mass human emotion on 9/11", source: "Global Consciousness Project, Princeton", color: "#06b6d4" },
            { fact: "Monks in meditation produce gamma waves 25x stronger than normal people", source: "Dr. Richard Davidson, UW-Madison", color: "#eab308" },
            { fact: "DNA has been shown to respond to human intention and emotional states", source: "Dr. Glen Rein, HeartMath", color: "#f97316" },
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: f.color, boxShadow: `0 0 8px ${f.color}66`, marginTop: 7, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.6 }}>{f.fact}</p>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>— {f.source}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>
          "The field is the sole governing agency of the particle." — Albert Einstein
        </p>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// H3ALING SECTION — Organ-Herb Matching System
// ═══════════════════════════════════════════════════════════════

const BODY_ORGANS = [
  {
    id: "brain", name: "Brain & Nervous System", emoji: "🧠", y: 8, color: "#a78bfa",
    symptoms: ["Brain fog", "Poor memory", "Anxiety", "Insomnia", "Headaches", "Poor focus", "Nerve pain"],
    herbs: [
      { name: "Lion's Mane Mushroom", type: "Capsule/Powder", brand: "Host Defense (Sprouts)", desc: "Stimulates nerve growth factor (NGF). Rebuilds myelin sheath. The #1 mushroom for neurogenesis and cognitive clarity.", dosage: "1000mg 2x daily", rating: 98 },
      { name: "Ginkgo Biloba", type: "Tincture", brand: "Herb Pharm (Sprouts)", desc: "Increases cerebral blood flow. Used for 5,000 years in Chinese medicine for memory, focus, and mental sharpness.", dosage: "30-40 drops 2-3x daily", rating: 92 },
      { name: "Bacopa Monnieri", type: "Capsule", brand: "Himalaya (Sprouts)", desc: "Ayurvedic nootropic that enhances memory consolidation, reduces anxiety, and protects neurons from oxidative stress.", dosage: "300mg daily", rating: 90 },
      { name: "Gotu Kola", type: "Tincture", brand: "Herb Pharm (Sprouts)", desc: "The 'herb of longevity.' Strengthens brain cells, improves circulation, and repairs connective tissue in the nervous system.", dosage: "30 drops 2x daily", rating: 88 },
      { name: "Ashwagandha", type: "Tincture/Capsule", brand: "Herb Pharm / Garden of Life (Sprouts)", desc: "Adaptogen that lowers cortisol, calms the nervous system, improves sleep quality, and rebuilds adrenal function.", dosage: "600mg or 40 drops daily", rating: 95 },
      { name: "Rosemary", type: "Essential Oil/Tea", brand: "Sprouts Brand", desc: "Carnosic acid protects neurons. Inhaling rosemary improves memory recall by up to 75% in studies.", dosage: "Tea 2x daily or diffuse", rating: 82 },
    ],
    combos: [
      { name: "Cognitive Restoration Stack", herbs: ["Lion's Mane", "Ginkgo Biloba", "Bacopa"], desc: "The ultimate brain rebuild. Neurogenesis + blood flow + memory encoding.", duration: "90 days minimum" },
      { name: "Anxiety & Calm Protocol", herbs: ["Ashwagandha", "Gotu Kola", "Valerian Root"], desc: "Calms the nervous system without sedation. Resets the stress response over time.", duration: "60 days" },
    ]
  },
  {
    id: "eyes", name: "Eyes & Vision", emoji: "👁️", y: 10, color: "#06b6d4",
    symptoms: ["Blurry vision", "Eye strain", "Floaters", "Night vision", "Dry eyes", "Macular degeneration"],
    herbs: [
      { name: "Bilberry", type: "Capsule", brand: "Nature's Way (Sprouts)", desc: "Anthocyanins strengthen retinal capillaries. Used by WWII pilots for night vision. Protects against macular degeneration.", dosage: "160mg 2x daily", rating: 90 },
      { name: "Eyebright", type: "Tincture", brand: "Herb Pharm (Sprouts)", desc: "Traditional European herb for all eye conditions. Reduces inflammation, soothes irritation, and supports clear vision.", dosage: "30 drops 3x daily", rating: 85 },
      { name: "Lutein & Zeaxanthin", type: "Capsule", brand: "Garden of Life (Sprouts)", desc: "The macular pigments that filter blue light and protect photoreceptors. Found naturally in dark leafy greens.", dosage: "20mg daily", rating: 92 },
    ],
    combos: [
      { name: "Vision Restoration", herbs: ["Bilberry", "Eyebright", "Lutein"], desc: "Full-spectrum eye support. Retinal strength + inflammation relief + blue light protection.", duration: "120 days" },
    ]
  },
  {
    id: "thyroid", name: "Thyroid & Endocrine", emoji: "🦋", y: 18, color: "#ec4899",
    symptoms: ["Fatigue", "Weight gain", "Hair loss", "Cold sensitivity", "Brain fog", "Hormone imbalance"],
    herbs: [
      { name: "Ashwagandha", type: "Capsule", brand: "Garden of Life (Sprouts)", desc: "Clinically shown to normalize TSH, T3, and T4 levels. The premier adaptogen for thyroid support.", dosage: "600mg daily", rating: 95 },
      { name: "Bladderwrack", type: "Capsule", brand: "Nature's Way (Sprouts)", desc: "Natural iodine source from sea kelp. Essential mineral for thyroid hormone production.", dosage: "500mg daily", rating: 84 },
      { name: "Selenium", type: "Supplement", brand: "Garden of Life (Sprouts)", desc: "Essential for converting T4 to active T3. Brazil nuts are the richest food source — 2 per day.", dosage: "200mcg daily", rating: 88 },
      { name: "Guggul", type: "Capsule", brand: "Himalaya (Sprouts)", desc: "Ayurvedic resin that stimulates thyroid function and supports healthy cholesterol metabolism.", dosage: "500mg 2x daily", rating: 80 },
    ],
    combos: [
      { name: "Thyroid Revival Protocol", herbs: ["Ashwagandha", "Bladderwrack", "Selenium"], desc: "Restore thyroid hormone production naturally. Adaptogen + iodine + conversion support.", duration: "90 days" },
    ]
  },
  {
    id: "lungs", name: "Lungs & Respiratory", emoji: "🫁", y: 28, color: "#22c55e",
    symptoms: ["Shortness of breath", "Congestion", "Chronic cough", "Allergies", "Asthma", "Mucus buildup"],
    herbs: [
      { name: "Mullein Leaf", type: "Tincture/Tea", brand: "Herb Pharm (Sprouts)", desc: "The #1 lung herb. Clears mucus, soothes bronchial inflammation, and strengthens lung tissue. Smoker's best friend.", dosage: "30-40 drops 3x daily", rating: 96 },
      { name: "Oregano Oil", type: "Softgel", brand: "North American Herb & Spice (Sprouts)", desc: "Carvacrol and thymol are powerful antimicrobials. Destroys pathogens in the respiratory tract.", dosage: "1 softgel 2x daily", rating: 90 },
      { name: "Elderberry", type: "Syrup/Gummy", brand: "Sambucol / Garden of Life (Sprouts)", desc: "Antiviral powerhouse. Reduces cold/flu duration by 4 days in studies. Immune system activator.", dosage: "1 tbsp daily or as directed", rating: 93 },
      { name: "NAC (N-Acetyl Cysteine)", type: "Capsule", brand: "NOW Foods (Sprouts)", desc: "Precursor to glutathione. Thins and clears mucus from lungs. The supplement hospitals use for respiratory emergencies.", dosage: "600mg 2x daily", rating: 94 },
      { name: "Lobelia", type: "Tincture", brand: "Herb Pharm (Sprouts)", desc: "Antispasmodic that relaxes bronchial muscles. Used historically for asthma and breathing difficulties.", dosage: "10-20 drops as needed", rating: 82 },
    ],
    combos: [
      { name: "Deep Lung Cleanse", herbs: ["Mullein", "NAC", "Oregano Oil"], desc: "Clear years of buildup. Mucus dissolution + antimicrobial + tissue repair.", duration: "60 days" },
      { name: "Respiratory Immune Shield", herbs: ["Elderberry", "Oregano Oil", "Mullein"], desc: "Seasonal protection protocol. Antiviral + antimicrobial + lung strength.", duration: "Ongoing seasonal" },
    ]
  },
  {
    id: "heart", name: "Heart & Cardiovascular", emoji: "❤️", y: 30, color: "#ef4444",
    symptoms: ["High blood pressure", "Poor circulation", "Chest tightness", "Cold hands/feet", "Irregular heartbeat"],
    herbs: [
      { name: "Hawthorn Berry", type: "Tincture/Capsule", brand: "Herb Pharm (Sprouts)", desc: "Europe's #1 heart herb for 800+ years. Strengthens heart muscle, improves coronary blood flow, and regulates blood pressure.", dosage: "40 drops 3x daily", rating: 96 },
      { name: "CoQ10", type: "Softgel", brand: "Garden of Life (Sprouts)", desc: "The heart's primary fuel. Cellular energy production in cardiac muscle. Essential if on statin medications.", dosage: "200mg daily", rating: 94 },
      { name: "Garlic", type: "Capsule", brand: "Kyolic (Sprouts)", desc: "Reduces blood pressure, lowers LDL cholesterol, and prevents arterial plaque. The most studied heart herb in history.", dosage: "600mg 2x daily", rating: 92 },
      { name: "Cayenne", type: "Capsule/Tincture", brand: "Nature's Way (Sprouts)", desc: "Opens blood vessels, improves circulation instantly, and strengthens the heart. Dr. Christopher's #1 emergency herb.", dosage: "40,000 HU capsule daily", rating: 88 },
      { name: "Omega-3 (Fish Oil)", type: "Softgel", brand: "Nordic Naturals (Sprouts)", desc: "Reduces triglycerides, inflammation markers, and arterial stiffness. EPA/DHA are essential for cardiovascular health.", dosage: "2000mg daily", rating: 91 },
    ],
    combos: [
      { name: "Heart Fortress Protocol", herbs: ["Hawthorn", "CoQ10", "Garlic"], desc: "Strengthen the heart muscle, fuel cells, and clear arteries. The complete cardiac support stack.", duration: "Ongoing" },
    ]
  },
  {
    id: "liver", name: "Liver & Gallbladder", emoji: "🫘", y: 36, color: "#eab308",
    symptoms: ["Fatigue", "Skin issues", "Digestive problems", "Anger/irritability", "Chemical sensitivity", "Jaundice"],
    herbs: [
      { name: "Milk Thistle", type: "Capsule/Tincture", brand: "Herb Pharm Liver Health (Sprouts)", desc: "Silymarin regenerates liver cells. Clinically proven to reverse liver damage. The undisputed king of liver herbs.", dosage: "420mg silymarin daily", rating: 98 },
      { name: "Dandelion Root", type: "Tincture/Tea", brand: "Herb Pharm / Traditional Medicinals (Sprouts)", desc: "Stimulates bile production, cleanses the liver, and acts as a gentle diuretic. The liver's daily tonic.", dosage: "30 drops 3x daily or tea", rating: 90 },
      { name: "Turmeric / Curcumin", type: "Capsule", brand: "Garden of Life (Sprouts)", desc: "Potent anti-inflammatory that protects liver cells, stimulates bile flow, and supports phase II detoxification.", dosage: "500mg curcumin with piperine", rating: 93 },
      { name: "Burdock Root", type: "Tincture", brand: "Herb Pharm (Sprouts)", desc: "Blood purifier and liver decongestant. Pulls heavy metals and toxins through the lymphatic system.", dosage: "30 drops 2x daily", rating: 86 },
      { name: "Artichoke Leaf", type: "Capsule", brand: "Nature's Way (Sprouts)", desc: "Increases bile production by 127% in studies. Protects liver cells and supports fat digestion and cholesterol metabolism.", dosage: "600mg daily", rating: 84 },
    ],
    combos: [
      { name: "Liver Regeneration Protocol", herbs: ["Milk Thistle", "Dandelion Root", "Turmeric"], desc: "Cell regeneration + bile flow + anti-inflammatory. The gold standard liver cleanse.", duration: "90 days" },
      { name: "Deep Detox Stack", herbs: ["Milk Thistle", "Burdock Root", "NAC", "Artichoke"], desc: "Full phase I and II detox support. Heavy metal clearance + liver cell protection.", duration: "30 days" },
    ]
  },
  {
    id: "stomach", name: "Stomach & Digestive", emoji: "🫃", y: 42, color: "#f97316",
    symptoms: ["Bloating", "Acid reflux", "IBS", "Leaky gut", "Constipation", "Food sensitivities", "SIBO"],
    herbs: [
      { name: "Slippery Elm", type: "Powder/Capsule", brand: "Nature's Way (Sprouts)", desc: "Creates a protective mucilage coating over the gut lining. Heals leaky gut, soothes acid reflux, and calms IBS.", dosage: "400mg 3x daily or powder in water", rating: 92 },
      { name: "Ginger Root", type: "Tincture/Tea", brand: "Herb Pharm / Traditional Medicinals (Sprouts)", desc: "Anti-nausea, prokinetic (moves food through), anti-inflammatory. The universal digestive remedy across all cultures.", dosage: "30 drops or tea before meals", rating: 94 },
      { name: "Probiotics", type: "Capsule", brand: "Garden of Life RAW Probiotics (Sprouts)", desc: "50+ billion CFU with 30+ strains. Rebuilds the gut microbiome, strengthens the immune system, and improves nutrient absorption.", dosage: "1 capsule daily on empty stomach", rating: 96 },
      { name: "L-Glutamine", type: "Powder", brand: "NOW Foods (Sprouts)", desc: "Primary fuel for intestinal cells. Repairs gut lining, seals tight junctions, and reverses intestinal permeability.", dosage: "5g 2x daily", rating: 90 },
      { name: "Digestive Bitters", type: "Tincture", brand: "Urban Moonshine (Sprouts)", desc: "Stimulates the entire digestive cascade — saliva, HCl, bile, enzymes. The forgotten art of bitter medicine.", dosage: "1-2 dropperfuls before meals", rating: 88 },
      { name: "Marshmallow Root", type: "Tincture/Tea", brand: "Herb Pharm (Sprouts)", desc: "Demulcent herb that soothes the entire GI tract. Reduces inflammation from mouth to colon.", dosage: "30 drops 3x daily", rating: 86 },
    ],
    combos: [
      { name: "Gut Rebuild Protocol", herbs: ["L-Glutamine", "Probiotics", "Slippery Elm"], desc: "Seal the gut lining + repopulate microbiome + protective coating. The leaky gut reversal stack.", duration: "90 days" },
      { name: "Digestive Fire Boost", herbs: ["Ginger", "Digestive Bitters", "Probiotics"], desc: "Ignite weak digestion. Stimulate HCl + bile + enzyme production naturally.", duration: "30 days" },
    ]
  },
  {
    id: "kidneys", name: "Kidneys & Urinary", emoji: "🫘", y: 48, color: "#8b5cf6",
    symptoms: ["Water retention", "UTIs", "Kidney stones", "Back pain (lower)", "Dark urine", "Edema"],
    herbs: [
      { name: "Nettle Leaf", type: "Tincture/Tea", brand: "Herb Pharm / Traditional Medicinals (Sprouts)", desc: "Gentle diuretic that doesn't deplete minerals. Flushes kidneys, reduces inflammation, and supports adrenal function.", dosage: "30 drops 3x daily or tea", rating: 92 },
      { name: "Cranberry", type: "Capsule", brand: "Nature's Way (Sprouts)", desc: "Prevents bacteria from adhering to urinary tract walls. The proven UTI prevention herb.", dosage: "500mg 2x daily", rating: 88 },
      { name: "Chanca Piedra", type: "Capsule/Tea", brand: "Available at Sprouts", desc: "Literally translates to 'stone breaker.' Dissolves calcium oxalate kidney stones. Used in Amazonian medicine for centuries.", dosage: "500mg 3x daily", rating: 94 },
      { name: "Corn Silk", type: "Tea", brand: "Traditional Medicinals (Sprouts)", desc: "Soothes inflamed urinary passages, reduces edema, and supports kidney filtration. A gentle, effective remedy.", dosage: "Tea 2-3x daily", rating: 80 },
      { name: "Parsley", type: "Tea/Fresh", brand: "Sprouts Produce", desc: "Natural diuretic that helps kidneys flush uric acid and toxins. Rich in vitamins A, C, and K.", dosage: "Fresh juice or tea daily", rating: 78 },
    ],
    combos: [
      { name: "Kidney Flush Protocol", herbs: ["Chanca Piedra", "Nettle Leaf", "Corn Silk"], desc: "Dissolve stones + flush kidneys + soothe passages. The complete kidney reset.", duration: "30 days" },
    ]
  },
  {
    id: "joints", name: "Joints & Muscles", emoji: "🦴", y: 58, color: "#78716c",
    symptoms: ["Joint pain", "Arthritis", "Stiffness", "Muscle cramps", "Inflammation", "Fibromyalgia"],
    herbs: [
      { name: "Turmeric / Curcumin", type: "Capsule", brand: "Garden of Life (Sprouts)", desc: "As effective as ibuprofen for joint pain in clinical trials — without the gut damage. Nature's #1 anti-inflammatory.", dosage: "1000mg curcumin with piperine", rating: 96 },
      { name: "Boswellia", type: "Capsule", brand: "Nature's Way (Sprouts)", desc: "Frankincense extract. Inhibits 5-LOX enzyme that drives joint inflammation. Works synergistically with curcumin.", dosage: "500mg 3x daily", rating: 90 },
      { name: "Devil's Claw", type: "Capsule", brand: "Nature's Way (Sprouts)", desc: "African herb clinically proven to reduce osteoarthritis pain. Anti-inflammatory without NSAID side effects.", dosage: "750mg 2x daily", rating: 84 },
      { name: "Magnesium", type: "Powder/Capsule", brand: "Natural Vitality CALM (Sprouts)", desc: "Relaxes muscles, prevents cramps, and reduces inflammation. 80% of people are deficient.", dosage: "400mg glycinate daily", rating: 94 },
      { name: "Arnica", type: "Topical Cream", brand: "Boiron (Sprouts)", desc: "Apply directly to pain. Reduces bruising, muscle soreness, and joint swelling. The athlete's recovery herb.", dosage: "Apply 2-3x daily to affected area", rating: 86 },
    ],
    combos: [
      { name: "Joint Repair Protocol", herbs: ["Turmeric", "Boswellia", "Magnesium"], desc: "Triple anti-inflammatory + mineral support. Rebuild cartilage and reduce chronic pain.", duration: "90 days" },
    ]
  },
  {
    id: "skin", name: "Skin & Detox Pathways", emoji: "✋", y: 65, color: "#f472b6",
    symptoms: ["Acne", "Eczema", "Psoriasis", "Dull skin", "Rashes", "Premature aging", "Hives"],
    herbs: [
      { name: "Burdock Root", type: "Tincture", brand: "Herb Pharm (Sprouts)", desc: "The master blood purifier. Clears skin from the inside by detoxifying the liver and lymphatic system.", dosage: "30 drops 2x daily", rating: 90 },
      { name: "Oregon Grape Root", type: "Tincture", brand: "Herb Pharm (Sprouts)", desc: "Contains berberine — antimicrobial and anti-inflammatory. Traditionally used for psoriasis and eczema.", dosage: "30 drops 2x daily", rating: 84 },
      { name: "Red Clover", type: "Tea/Tincture", brand: "Traditional Medicinals (Sprouts)", desc: "Blood cleanser and lymph mover. Isoflavones support hormonal balance which reflects in skin clarity.", dosage: "Tea 2x daily", rating: 82 },
      { name: "Collagen", type: "Powder", brand: "Garden of Life / Vital Proteins (Sprouts)", desc: "Rebuilds skin structure from within. Improves elasticity, hydration, and reduces wrinkles in 8 weeks of studies.", dosage: "10-20g daily in liquid", rating: 88 },
      { name: "Zinc", type: "Capsule", brand: "Garden of Life (Sprouts)", desc: "Essential for skin cell renewal, wound healing, and controlling sebum. One of the most effective acne supplements.", dosage: "30mg daily with food", rating: 86 },
    ],
    combos: [
      { name: "Clear Skin Protocol", herbs: ["Burdock Root", "Zinc", "Probiotics"], desc: "Purify blood + repair skin + fix gut-skin axis. Acne elimination from the inside out.", duration: "90 days" },
    ]
  },
  {
    id: "immune", name: "Immune & Lymphatic", emoji: "🛡️", y: 40, color: "#14b8a6",
    symptoms: ["Frequent illness", "Slow recovery", "Swollen lymph nodes", "Autoimmune issues", "Chronic fatigue"],
    herbs: [
      { name: "Elderberry", type: "Syrup", brand: "Sambucol (Sprouts)", desc: "Blocks viral replication. Reduces cold/flu severity and duration. The immune system's first responder.", dosage: "1 tbsp daily / 2 tbsp when sick", rating: 94 },
      { name: "Echinacea", type: "Tincture", brand: "Herb Pharm (Sprouts)", desc: "Activates white blood cells and macrophages. Best used at the first sign of illness for 7-10 days.", dosage: "40 drops every 2 hours when sick", rating: 88 },
      { name: "Astragalus", type: "Tincture/Capsule", brand: "Herb Pharm (Sprouts)", desc: "Deep immune builder used in Chinese medicine for 4,000 years. Increases T-cell production and telomere length.", dosage: "30 drops 2x daily", rating: 92 },
      { name: "Reishi Mushroom", type: "Capsule/Powder", brand: "Host Defense (Sprouts)", desc: "The 'mushroom of immortality.' Modulates immune response — calms overactive immunity, strengthens weak immunity.", dosage: "1000mg 2x daily", rating: 96 },
      { name: "Vitamin D3 + K2", type: "Drops", brand: "Garden of Life (Sprouts)", desc: "Activates 200+ antimicrobial peptides. Most people are severely deficient. The sunshine vitamin you're not getting.", dosage: "5000 IU D3 + 100mcg K2 daily", rating: 95 },
      { name: "Cleavers", type: "Tincture", brand: "Herb Pharm (Sprouts)", desc: "The lymphatic system's broom. Moves stagnant lymph, reduces swollen glands, and clears the body's drainage system.", dosage: "30 drops 3x daily", rating: 82 },
    ],
    combos: [
      { name: "Immune Fortress Protocol", herbs: ["Reishi", "Astragalus", "Vitamin D3"], desc: "Long-term immune building. Deep T-cell support + immune modulation + antimicrobial activation.", duration: "Ongoing" },
      { name: "Acute Illness Protocol", herbs: ["Elderberry", "Echinacea", "Oregano Oil", "Vitamin D3"], desc: "Hit it hard at first sign. Antiviral + immune activation + antimicrobial + immune peptides.", duration: "7-10 days" },
    ]
  },
];

function HealingSection() {
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [showCombos, setShowCombos] = useState(false);
  const [savedHerbs, setSavedHerbs] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSymptom = (s) => setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleSave = (id) => setSavedHerbs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // Find matching organs based on selected symptoms
  const matchedOrgans = selectedSymptoms.length > 0
    ? BODY_ORGANS.filter(o => o.symptoms.some(s => selectedSymptoms.includes(s)))
    : [];

  const allSymptoms = [...new Set(BODY_ORGANS.flatMap(o => o.symptoms))];
  const totalHerbs = BODY_ORGANS.reduce((a, o) => a + o.herbs.length, 0);

  // Search results
  const searchResults = searchTerm ? BODY_ORGANS.flatMap(o =>
    o.herbs.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.desc.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(h => ({ ...h, organ: o }))
  ) : [];

  // Detail view for selected organ
  if (selectedOrgan) {
    const organ = BODY_ORGANS.find(o => o.id === selectedOrgan);
    return (
      <div style={{ animation: "fadeInUp 0.4s ease" }}>
        <button onClick={() => { setSelectedOrgan(null); setShowCombos(false); }} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", marginBottom: 24 }}>← BACK TO BODY MAP</button>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <span style={{ fontSize: 48 }}>{organ.emoji}</span>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 600, color: "#fff", fontFamily: "'Orbitron', sans-serif", margin: 0, letterSpacing: 1 }}>{organ.name}</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{organ.herbs.length} herbs & supplements • {organ.combos.length} protocols</p>
          </div>
        </div>

        {/* Symptoms this organ addresses */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
          {organ.symptoms.map(s => (
            <span key={s} style={{ fontSize: 10, padding: "4px 12px", borderRadius: 20, background: `${organ.color}12`, border: `1px solid ${organ.color}25`, color: organ.color, letterSpacing: 1 }}>{s}</span>
          ))}
        </div>

        {/* Toggle: Herbs vs Combos */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <button onClick={() => setShowCombos(false)} style={{ padding: "8px 20px", borderRadius: 8, background: !showCombos ? `${organ.color}15` : "rgba(255,255,255,0.03)", border: `1px solid ${!showCombos ? `${organ.color}40` : "rgba(255,255,255,0.06)"}`, color: !showCombos ? organ.color : "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>INDIVIDUAL HERBS</button>
          <button onClick={() => setShowCombos(true)} style={{ padding: "8px 20px", borderRadius: 8, background: showCombos ? `${organ.color}15` : "rgba(255,255,255,0.03)", border: `1px solid ${showCombos ? `${organ.color}40` : "rgba(255,255,255,0.06)"}`, color: showCombos ? organ.color : "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>PROTOCOLS & COMBOS</button>
        </div>

        {!showCombos ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {organ.herbs.map((herb, idx) => {
              const herbId = `${organ.id}-${idx}`;
              return (
                <GlassCard key={idx} hover={false} style={{ borderLeft: `3px solid ${organ.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0 }}>{herb.name}</h3>
                      <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>{herb.type}</span>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(0,255,140,0.08)", color: "#00ff8c" }}>{herb.brand}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${organ.color}15`, border: `2px solid ${organ.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: organ.color, fontFamily: "'Orbitron', sans-serif" }}>{herb.rating}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: "8px 0 12px" }}>{herb.desc}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>DOSAGE: <span style={{ color: organ.color }}>{herb.dosage}</span></div>
                    <button onClick={() => toggleSave(herbId)} style={{ background: savedHerbs.has(herbId) ? `${organ.color}15` : "rgba(255,255,255,0.03)", border: `1px solid ${savedHerbs.has(herbId) ? `${organ.color}35` : "rgba(255,255,255,0.06)"}`, color: savedHerbs.has(herbId) ? organ.color : "rgba(255,255,255,0.3)", borderRadius: 6, padding: "4px 14px", cursor: "pointer", fontSize: 10, letterSpacing: 1, fontFamily: "'Orbitron', sans-serif" }}>{savedHerbs.has(herbId) ? "★ SAVED" : "☆ SAVE"}</button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {organ.combos.map((combo, idx) => (
              <GlassCard key={idx} hover={false} style={{ borderTop: `2px solid ${organ.color}40` }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: organ.color, fontFamily: "'Orbitron', sans-serif", marginBottom: 10 }}>⟡ PROTOCOL</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: "0 0 8px" }}>{combo.name}</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 16 }}>{combo.desc}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                  {combo.herbs.map(h => (
                    <span key={h} style={{ fontSize: 11, padding: "4px 14px", borderRadius: 20, background: `${organ.color}10`, border: `1px solid ${organ.color}25`, color: organ.color }}>{h}</span>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>DURATION: <span style={{ color: organ.color }}>{combo.duration}</span></span>
                  <button style={{ background: `${organ.color}12`, border: `1px solid ${organ.color}30`, color: organ.color, borderRadius: 6, padding: "6px 18px", cursor: "pointer", fontSize: 10, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>START PROTOCOL</button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        <div style={{ marginTop: 24, padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>*These statements have not been evaluated by the FDA. This information is for educational purposes. Consult a healthcare practitioner before starting any supplement regimen.</p>
        </div>
      </div>
    );
  }

  // ─── Main H3ALING View with Body Map ───
  return (
    <div style={{ animation: "fadeInUp 0.5s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <div style={{ width: 3, height: 28, background: "linear-gradient(to bottom, #22c55e, #06b6d4)", borderRadius: 2 }} />
        <h2 style={{ fontSize: 22, fontWeight: 300, color: "#fff", fontFamily: "'Sora', sans-serif", margin: 0 }}>H3ALING</h2>
      </div>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.8, marginTop: 8, marginBottom: 24 }}>
        {totalHerbs} herbs & supplements mapped to {BODY_ORGANS.length} organ systems. Select your symptoms or tap a body area to find your medicine. Available at Sprouts Farmers Market.
      </p>

      {/* Search */}
      <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search herbs... (turmeric, ashwagandha, milk thistle...)"
        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 20px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "'JetBrains Mono', monospace", marginBottom: 20 }} />

      {searchTerm && searchResults.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 2 }}>{searchResults.length} RESULTS</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {searchResults.slice(0, 6).map((h, i) => (
              <GlassCard key={i} onClick={() => setSelectedOrgan(h.organ.id)} style={{ padding: 16, cursor: "pointer", borderLeft: `3px solid ${h.organ.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{h.name}</span>
                    <span style={{ fontSize: 11, color: h.organ.color, marginLeft: 10 }}>{h.organ.emoji} {h.organ.name}</span>
                  </div>
                  <span style={{ fontSize: 10, color: "#00ff8c" }}>{h.brand}</span>
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "6px 0 0", lineHeight: 1.5 }}>{h.desc.substring(0, 100)}...</p>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {/* ─── Interactive Body Map ─── */}
        <GlassCard hover={false} style={{ flex: "0 0 280px", padding: "24px 20px", textAlign: "center" }}>
          <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 16 }}>TAP AN ORGAN SYSTEM</span>
          <div style={{ position: "relative", height: 520, margin: "0 auto", maxWidth: 200 }}>
            {/* Body outline */}
            <div style={{ position: "absolute", left: "50%", top: "5%", width: 60, height: 60, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", transform: "translateX(-50%)" }} />
            <div style={{ position: "absolute", left: "50%", top: "16%", width: 80, height: 120, borderRadius: "40px 40px 30px 30px", border: "1px solid rgba(255,255,255,0.06)", transform: "translateX(-50%)" }} />
            <div style={{ position: "absolute", left: "50%", top: "42%", width: 70, height: 90, borderRadius: "10px 10px 30px 30px", border: "1px solid rgba(255,255,255,0.05)", transform: "translateX(-50%)" }} />
            <div style={{ position: "absolute", left: "25%", top: "62%", width: 30, height: 120, borderRadius: 15, border: "1px solid rgba(255,255,255,0.04)" }} />
            <div style={{ position: "absolute", right: "25%", top: "62%", width: 30, height: 120, borderRadius: 15, border: "1px solid rgba(255,255,255,0.04)" }} />

            {/* Organ hotspots */}
            {BODY_ORGANS.map(organ => (
              <button key={organ.id} onClick={() => setSelectedOrgan(organ.id)} title={organ.name}
                style={{
                  position: "absolute", left: "50%", top: `${organ.y}%`,
                  transform: "translate(-50%, -50%)",
                  width: 36, height: 36, borderRadius: "50%",
                  background: `${organ.color}20`, border: `2px solid ${organ.color}50`,
                  cursor: "pointer", fontSize: 16, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 15px ${organ.color}30`,
                  transition: "all 0.3s ease",
                  animation: "orbPulse 3s ease-in-out infinite",
                  animationDelay: `${Math.random() * 2}s`,
                  zIndex: 5,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.3)"; e.currentTarget.style.boxShadow = `0 0 25px ${organ.color}60`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)"; e.currentTarget.style.boxShadow = `0 0 15px ${organ.color}30`; }}
              >{organ.emoji}</button>
            ))}
          </div>
        </GlassCard>

        {/* ─── Symptom Matcher ─── */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <GlassCard hover={false} style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 10, letterSpacing: 3, color: "#00ff8c", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 14 }}>⟡ SYMPTOM MATCHER — SELECT YOUR SYMPTOMS</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {allSymptoms.map(s => {
                const isSelected = selectedSymptoms.includes(s);
                const matchOrgan = BODY_ORGANS.find(o => o.symptoms.includes(s));
                return (
                  <button key={s} onClick={() => toggleSymptom(s)} style={{
                    padding: "5px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer",
                    transition: "all 0.2s ease",
                    background: isSelected ? `${matchOrgan.color}15` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isSelected ? `${matchOrgan.color}40` : "rgba(255,255,255,0.06)"}`,
                    color: isSelected ? matchOrgan.color : "rgba(255,255,255,0.35)",
                  }}>{s}</button>
                );
              })}
            </div>
            {selectedSymptoms.length > 0 && (
              <button onClick={() => setSelectedSymptoms([])} style={{ marginTop: 12, background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 11 }}>Clear all</button>
            )}
          </GlassCard>

          {/* Matched Results */}
          {matchedOrgans.length > 0 && (
            <div>
              <span style={{ fontSize: 10, letterSpacing: 3, color: "#00ff8c", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 12 }}>MATCHED ORGAN SYSTEMS</span>
              {matchedOrgans.map(organ => (
                <GlassCard key={organ.id} onClick={() => setSelectedOrgan(organ.id)} style={{ marginBottom: 12, cursor: "pointer", borderLeft: `3px solid ${organ.color}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 28 }}>{organ.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>{organ.name}</h3>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>{organ.herbs.length} herbs • {organ.combos.length} protocols</p>
                    </div>
                    <span style={{ fontSize: 11, color: organ.color, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>VIEW →</span>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 10 }}>
                    {organ.herbs.slice(0, 3).map(h => (
                      <span key={h.name} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 12, background: `${organ.color}10`, color: `${organ.color}aa`, border: `1px solid ${organ.color}20` }}>{h.name}</span>
                    ))}
                    {organ.herbs.length > 3 && <span style={{ fontSize: 9, color: organ.color }}>+{organ.herbs.length - 3}</span>}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Browse All Systems */}
          {matchedOrgans.length === 0 && !searchTerm && (
            <div>
              <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 12 }}>ALL ORGAN SYSTEMS</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {BODY_ORGANS.map(organ => (
                  <GlassCard key={organ.id} onClick={() => setSelectedOrgan(organ.id)} style={{ padding: 18, cursor: "pointer", borderLeft: `3px solid ${organ.color}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 24 }}>{organ.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{organ.name}</span>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{organ.herbs.length} herbs • {organ.combos.length} protocols</div>
                      </div>
                      <span style={{ fontSize: 10, color: organ.color, fontFamily: "'Orbitron', sans-serif" }}>→</span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginTop: 28, flexWrap: "wrap" }}>
        {[
          { label: "Total Herbs", value: totalHerbs, color: "#22c55e" },
          { label: "Organ Systems", value: BODY_ORGANS.length, color: "#06b6d4" },
          { label: "Protocols", value: BODY_ORGANS.reduce((a, o) => a + o.combos.length, 0), color: "#a78bfa" },
          { label: "Saved", value: savedHerbs.size, color: "#eab308" },
        ].map(s => (
          <div key={s.label} style={{ flex: "1 1 120px", padding: "14px 18px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: s.color, fontFamily: "'Orbitron', sans-serif" }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>*Products referenced from Sprouts Farmers Market, Herb Pharm, Garden of Life, Host Defense, and other brands. Statements not evaluated by the FDA. For educational purposes only.</p>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// COMMUNITY FEED — Social Media Style
// ═══════════════════════════════════════════════════════════════

const COMMUNITY_USERS = [
  { id: 1, name: "Zenith", handle: "@zenith_33", avatar: "🧘", level: 42, vibe: 94, color: "#00ff8c", bio: "Breathwork facilitator. 369 practitioner. Day 847 of meditation.", followers: 2847, following: 312, online: true },
  { id: 2, name: "Luna", handle: "@luna.signal", avatar: "🌙", level: 38, vibe: 88, color: "#a78bfa", bio: "Plant medicine guide. Sacred geometry artist. Frequency healer.", followers: 5231, following: 189, online: true },
  { id: 3, name: "Kael", handle: "@kael.ether", avatar: "⚡", level: 51, vibe: 97, color: "#eab308", bio: "Scalar energy researcher. Tesla devotee. Building free energy devices.", followers: 12400, following: 76, online: false },
  { id: 4, name: "Aria", handle: "@aria.awakened", avatar: "🔮", level: 33, vibe: 82, color: "#ec4899", bio: "Dream architect. Astral traveler. Pineal gland activation coach.", followers: 3912, following: 445, online: true },
  { id: 5, name: "Sol", handle: "@sol.source", avatar: "☀️", level: 45, vibe: 91, color: "#f97316", bio: "Sun gazer. Raw fruitarian. 3 years no pharma. Living proof.", followers: 8700, following: 122, online: true },
  { id: 6, name: "Cipher", handle: "@cipher.truth", avatar: "👁", level: 55, vibe: 96, color: "#ef4444", bio: "Declassified document researcher. The truth is in the files.", followers: 21000, following: 44, online: false },
  { id: 7, name: "Sage", handle: "@sage.flow", avatar: "🌿", level: 29, vibe: 79, color: "#22c55e", bio: "Herbalist. Copper coil builder. Grounding every morning at sunrise.", followers: 1540, following: 678, online: true },
  { id: 8, name: "Orion", handle: "@orion.beyond", avatar: "✨", level: 47, vibe: 93, color: "#06b6d4", bio: "Remote viewer. Gateway tapes graduate. Consciousness is the only reality.", followers: 6800, following: 201, online: false },
];

const COMMUNITY_POSTS = [
  {
    id: 1, userId: 1, time: "12 min ago",
    text: "Day 847 of unbroken meditation. Today's sit was different — I felt the field collapse into a single point. No body, no room, no time. Just awareness aware of itself. This is what they mean by 'the witness.' If you're on day 1, keep going. The compound effect is real.",
    likes: 347, comments: 42, shares: 18, liked: false,
    tags: ["meditation", "consciousness", "consistency"],
    commentsList: [
      { user: COMMUNITY_USERS[1], text: "I felt this at day 300. It comes in waves after that. Beautiful share. 🙏", time: "8m" },
      { user: COMMUNITY_USERS[3], text: "This gives me chills. Day 47 here and some days I want to quit. Not anymore.", time: "5m" },
      { user: COMMUNITY_USERS[6], text: "The witness state. Once you find it, you realize it was always there.", time: "2m" },
    ]
  },
  {
    id: 2, userId: 3, time: "38 min ago",
    text: "Just finished building my second Rodin coil. The toroidal field this thing produces is insane — my structured water device next to it is showing completely different crystal formations. Tesla wasn't wrong about 3, 6, 9. I'm seeing it with my own eyes now.\n\nDropping a full tutorial this weekend for anyone who wants to build one. Copper wire, sacred measurements, and patience is all you need.",
    likes: 892, comments: 127, shares: 234, liked: true,
    tags: ["tesla", "369", "copper", "scalar", "DIY"],
    hasImage: true, imageDesc: "⚡ RODIN COIL BUILD — V2",
    commentsList: [
      { user: COMMUNITY_USERS[4], text: "WAITING for this tutorial. What gauge copper did you use?", time: "32m" },
      { user: COMMUNITY_USERS[0], text: "I built one last month and my plants are growing 2x faster near it. Not even exaggerating.", time: "28m" },
      { user: COMMUNITY_USERS[7], text: "The vortex math is embedded in everything. This is applied 369.", time: "15m" },
    ]
  },
  {
    id: 3, userId: 2, time: "1 hr ago",
    text: "Reminder: you don't need anyone's permission to heal yourself.\n\nThe body is the pharmacy.\nBreath is the medicine.\nNature is the doctor.\nSilence is the therapist.\nSunlight is the supplement.\n\nEverything you need is free. That's why they don't teach it.",
    likes: 2341, comments: 89, shares: 567, liked: false,
    tags: ["healing", "nature", "awakening"],
    commentsList: [
      { user: COMMUNITY_USERS[5], text: "\"Everything you need is free. That's why they don't teach it.\" — Frame this.", time: "52m" },
      { user: COMMUNITY_USERS[6], text: "Saved. Sharing. This is the whole message in 6 lines.", time: "44m" },
    ]
  },
  {
    id: 4, userId: 6, time: "2 hrs ago",
    text: "New declassified documents just dropped from the CIA FOIA reading room. 47 pages on \"Anomalous Mental Phenomena\" — they were studying remote viewing, precognition, and psychokinesis through the 80s and concluded it was REAL and OPERATIONAL.\n\nThey used it. They know consciousness is non-local. They classified it.\n\nLink in my profile. Read the source material yourself. Don't take anyone's word for it — not even mine.",
    likes: 4102, comments: 312, shares: 1893, liked: false,
    tags: ["CIA", "declassified", "remote viewing", "psi"],
    commentsList: [
      { user: COMMUNITY_USERS[7], text: "I've read every Gateway tape analysis. The CIA knows consciousness transcends spacetime. They KNOW.", time: "1h" },
      { user: COMMUNITY_USERS[0], text: "The fact that this is declassified and people still call it conspiracy theory is wild.", time: "55m" },
      { user: COMMUNITY_USERS[3], text: "Downloading now. Everyone needs to read primary sources, not summaries.", time: "48m" },
    ]
  },
  {
    id: 5, userId: 5, time: "3 hrs ago",
    text: "3 years pharmaceutical-free. Blood work came back yesterday — every marker improved. Doctor literally said \"whatever you're doing, keep doing it.\"\n\nWhat I'm doing:\n— Sun gazing (HRM protocol)\n— Grounding 30 min daily\n— Structured water only\n— Plant-based whole foods\n— Zero processed anything\n— Daily breathwork\n— No fluoride, no aluminum, no seed oils\n\nYour body WANTS to heal. Stop poisoning it and it will.",
    likes: 1876, comments: 201, shares: 445, liked: false,
    tags: ["health", "sungazing", "detox", "grounding"],
    commentsList: [
      { user: COMMUNITY_USERS[1], text: "The seed oils alone make such a difference. Once you cut them, you feel the inflammation drop within weeks.", time: "2h" },
      { user: COMMUNITY_USERS[6], text: "This is the protocol. Simple, free, effective. Pharma can't patent sunlight.", time: "2h" },
    ]
  },
  {
    id: 6, userId: 4, time: "4 hrs ago",
    text: "Had my first fully lucid astral projection last night. Not a dream — I was THERE. Saw my room from the ceiling. Moved through the wall. The vibrational state before separation is exactly how the Gateway tapes describe it.\n\nI've been practicing for 8 months. It's real. Consciousness is not confined to the body.\n\nHappy to share my exact protocol if anyone is working on this.",
    likes: 1245, comments: 178, shares: 89, liked: false,
    tags: ["astral", "consciousness", "gateway", "OBE"],
    commentsList: [
      { user: COMMUNITY_USERS[7], text: "The vibrational state is unmistakable. Once you feel it, you know it's not a dream. Welcome to the other side. 🌌", time: "3h" },
      { user: COMMUNITY_USERS[0], text: "Please share the protocol! I keep getting to the vibration stage but can't separate.", time: "3h" },
    ]
  },
  {
    id: 7, userId: 7, time: "5 hrs ago",
    text: "Made copper-infused water this morning with my tensor ring and copper vessel. 8 hours in copper overnight, then 20 minutes inside the tensor ring field.\n\nTasted completely different — softer, almost sweet. Dr. Emoto showed water responds to intention. Imagine what it does with sacred geometry and copper ions.\n\nStart with a simple copper cup. It's ancient technology hiding in plain sight.",
    likes: 634, comments: 67, shares: 112, liked: false,
    tags: ["copper", "water", "tensor", "ayurveda"],
    commentsList: [
      { user: COMMUNITY_USERS[2], text: "What cubit measurement did you use for the tensor ring? Lost cubit or sacred?", time: "4h" },
      { user: COMMUNITY_USERS[4], text: "I've been drinking from copper for 2 years. Digestion completely transformed.", time: "4h" },
    ]
  },
];

function CommunityFeed() {
  const [posts, setPosts] = useState(COMMUNITY_POSTS);
  const [newPost, setNewPost] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [commentInputs, setCommentInputs] = useState({});
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showStories, setShowStories] = useState(true);

  const toggleLike = (postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => { const n = new Set(prev); n.has(postId) ? n.delete(postId) : n.add(postId); return n; });
  };

  const submitComment = (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;
    setPosts(prev => prev.map(p => p.id === postId ? {
      ...p, comments: p.comments + 1,
      commentsList: [...p.commentsList, { user: { name: "You", handle: "@you", avatar: "◈", color: "#00ff8c" }, text, time: "now" }]
    } : p));
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
  };

  const submitPost = () => {
    if (!newPost.trim()) return;
    const post = {
      id: Date.now(), userId: 0, time: "just now",
      text: newPost, likes: 0, comments: 0, shares: 0, liked: false,
      tags: [], commentsList: [],
      customUser: { name: "You", handle: "@you", avatar: "◈", color: "#00ff8c", level: 33, vibe: 85 },
    };
    setPosts(prev => [post, ...prev]);
    setNewPost("");
  };

  const filters = ["all", "trending", "new", "following", "awakening", "science", "practice"];

  // Profile modal
  if (selectedProfile) {
    const u = selectedProfile;
    return (
      <div style={{ animation: "fadeInUp 0.4s ease" }}>
        <button onClick={() => setSelectedProfile(null)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", marginBottom: 24 }}>← BACK TO FEED</button>

        {/* Profile header */}
        <GlassCard hover={false} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${u.color}44, ${u.color}22)`, border: `2px solid ${u.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: `0 0 20px ${u.color}33` }}>{u.avatar}</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 20, fontWeight: 600, color: "#fff", fontFamily: "'Sora', sans-serif" }}>{u.name}</span>
                {u.online && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff8c", boxShadow: "0 0 8px #00ff8c88" }} />}
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${u.color}18`, border: `1px solid ${u.color}30`, color: u.color, fontFamily: "'Orbitron', sans-serif", letterSpacing: 1 }}>LVL {u.level}</span>
              </div>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>{u.handle}</span>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginTop: 8 }}>{u.bio}</p>
              <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
                <span style={{ fontSize: 13, color: "#fff" }}><strong>{u.followers.toLocaleString()}</strong> <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>followers</span></span>
                <span style={{ fontSize: 13, color: "#fff" }}><strong>{u.following}</strong> <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>following</span></span>
                <span style={{ fontSize: 13, color: u.color }}><strong>{u.vibe}</strong> <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>vibe score</span></span>
              </div>
            </div>
            <button style={{ padding: "10px 24px", borderRadius: 8, background: `${u.color}15`, border: `1px solid ${u.color}40`, color: u.color, cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>FOLLOW</button>
          </div>
        </GlassCard>

        {/* User's posts */}
        <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 16 }}>{u.name.toUpperCase()}'S SIGNALS</span>
        {posts.filter(p => COMMUNITY_USERS[p.userId - 1]?.id === u.id).map(post => {
          const postUser = u;
          return renderPost(post, postUser);
        })}
        {posts.filter(p => COMMUNITY_USERS[p.userId - 1]?.id === u.id).length === 0 && (
          <GlassCard hover={false}><p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center" }}>No signals from this user yet.</p></GlassCard>
        )}
      </div>
    );
  }

  // Render a single post
  function renderPost(post, postUser) {
    const isExpanded = expandedComments.has(post.id);
    return (
      <GlassCard key={post.id} hover={false} style={{ marginBottom: 16, padding: 0, overflow: "hidden" }}>
        {/* Post header */}
        <div style={{ padding: "18px 22px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div onClick={() => postUser.id && setSelectedProfile(postUser)} style={{
              width: 44, height: 44, borderRadius: "50%",
              background: `linear-gradient(135deg, ${postUser.color}44, ${postUser.color}22)`,
              border: `2px solid ${postUser.color}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, cursor: postUser.id ? "pointer" : "default",
              boxShadow: `0 0 12px ${postUser.color}22`,
            }}>{postUser.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span onClick={() => postUser.id && setSelectedProfile(postUser)} style={{ fontSize: 14, fontWeight: 600, color: "#fff", cursor: postUser.id ? "pointer" : "default" }}>{postUser.name}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>{postUser.handle}</span>
                {postUser.level && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: `${postUser.color}15`, color: postUser.color, fontFamily: "'Orbitron', sans-serif" }}>L{postUser.level}</span>}
              </div>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>{post.time}</span>
            </div>
            <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 16 }}>⋯</button>
          </div>

          {/* Post text */}
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.8, margin: "0 0 14px", whiteSpace: "pre-wrap" }}>{post.text}</p>

          {/* Image placeholder */}
          {post.hasImage && (
            <div style={{ margin: "0 -22px", padding: "40px 22px", background: "linear-gradient(135deg, rgba(0,255,140,0.06), rgba(167,139,250,0.06), rgba(234,179,8,0.04))", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 48 }}>⚡</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>{post.imageDesc}</span>
            </div>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {post.tags.map(t => (
                <span key={t} style={{ fontSize: 11, color: "#00ff8c", cursor: "pointer" }}>#{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Engagement stats */}
        <div style={{ padding: "8px 22px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 16, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
          <span>{post.likes.toLocaleString()} resonances</span>
          <span>{post.comments} replies</span>
          <span>{post.shares} amplifies</span>
        </div>

        {/* Action buttons */}
        <div style={{ padding: "4px 22px 4px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex" }}>
          {[
            { label: post.liked ? "✦ Resonated" : "✧ Resonate", action: () => toggleLike(post.id), active: post.liked, color: "#00ff8c" },
            { label: "◇ Reply", action: () => toggleComments(post.id), active: isExpanded, color: "#06b6d4" },
            { label: "◈ Amplify", action: () => {}, active: false, color: "#a78bfa" },
            { label: "⊕ Save", action: () => {}, active: false, color: "#eab308" },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} style={{
              flex: 1, padding: "10px 0", background: "none", border: "none",
              color: btn.active ? btn.color : "rgba(255,255,255,0.35)",
              cursor: "pointer", fontSize: 12, fontFamily: "'Sora', sans-serif",
              transition: "all 0.2s ease",
              borderBottom: btn.active ? `2px solid ${btn.color}` : "2px solid transparent",
            }}>{btn.label}</button>
          ))}
        </div>

        {/* Comments section */}
        {isExpanded && (
          <div style={{ padding: "14px 22px 18px", borderTop: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,0,0,0.15)" }}>
            {post.commentsList.map((c, ci) => (
              <div key={ci} style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${c.user.color}22`, border: `1px solid ${c.user.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{c.user.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{c.user.name}</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{c.time}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0 }}>{c.text}</p>
                  </div>
                  <div style={{ display: "flex", gap: 14, marginTop: 4, paddingLeft: 14 }}>
                    <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 11 }}>Resonate</button>
                    <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 11 }}>Reply</button>
                  </div>
                </div>
              </div>
            ))}

            {/* Comment input */}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(0,255,140,0.1)", border: "1px solid rgba(0,255,140,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, color: "#00ff8c" }}>◈</div>
              <div style={{ flex: 1, display: "flex", gap: 8 }}>
                <input
                  value={commentInputs[post.id] || ""}
                  onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && submitComment(post.id)}
                  placeholder="Write a reply..."
                  style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "8px 16px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "'Sora', sans-serif" }}
                />
                <button onClick={() => submitComment(post.id)} style={{ background: "rgba(0,255,140,0.1)", border: "1px solid rgba(0,255,140,0.3)", borderRadius: 20, padding: "0 16px", color: "#00ff8c", cursor: "pointer", fontSize: 11, fontFamily: "'Orbitron', sans-serif" }}>SEND</button>
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    );
  }

  return (
    <div style={{ animation: "fadeInUp 0.5s ease", display: "flex", gap: 24 }}>
      {/* ─── Main Feed Column ─── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Stories / Online Users Bar */}
        <GlassCard hover={false} style={{ marginBottom: 20, padding: "16px 20px" }}>
          <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 4 }}>
            {/* Your story */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(0,255,140,0.08)", border: "2px dashed rgba(0,255,140,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>+</div>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Your Signal</span>
            </div>
            {COMMUNITY_USERS.filter(u => u.online).map(u => (
              <div key={u.id} onClick={() => setSelectedProfile(u)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${u.color}33, ${u.color}11)`, border: `2px solid ${u.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: `0 0 12px ${u.color}33`, position: "relative" }}>
                  {u.avatar}
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: "50%", background: "#00ff8c", border: "2px solid #050508", boxShadow: "0 0 6px #00ff8c88" }} />
                </div>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", maxWidth: 56, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Post Composer */}
        <GlassCard hover={false} style={{ marginBottom: 20, padding: "18px 22px" }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(0,255,140,0.1)", border: "2px solid rgba(0,255,140,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#00ff8c", flexShrink: 0 }}>◈</div>
            <textarea
              value={newPost} onChange={e => setNewPost(e.target.value)}
              placeholder="Drop a signal to the collective..."
              rows={3}
              style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "'Sora', sans-serif", resize: "vertical", lineHeight: 1.7 }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ icon: "📷", label: "Image" }, { icon: "🎥", label: "Video" }, { icon: "📊", label: "Poll" }, { icon: "📍", label: "Location" }].map(b => (
                <button key={b.label} title={b.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14, color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}>
                  {b.icon} <span style={{ fontSize: 11 }}>{b.label}</span>
                </button>
              ))}
            </div>
            <button onClick={submitPost} disabled={!newPost.trim()} style={{
              padding: "8px 24px", borderRadius: 8, background: newPost.trim() ? "rgba(0,255,140,0.15)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${newPost.trim() ? "rgba(0,255,140,0.4)" : "rgba(255,255,255,0.06)"}`,
              color: newPost.trim() ? "#00ff8c" : "rgba(255,255,255,0.2)",
              cursor: newPost.trim() ? "pointer" : "default", fontSize: 12, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif",
            }}>TRANSMIT</button>
          </div>
        </GlassCard>

        {/* Feed Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{
              padding: "6px 16px", borderRadius: 20, fontSize: 11, letterSpacing: 1, cursor: "pointer",
              fontFamily: "'Sora', sans-serif", textTransform: "capitalize", transition: "all 0.2s",
              background: activeFilter === f ? "rgba(0,255,140,0.12)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${activeFilter === f ? "rgba(0,255,140,0.3)" : "rgba(255,255,255,0.06)"}`,
              color: activeFilter === f ? "#00ff8c" : "rgba(255,255,255,0.35)",
            }}>{f}</button>
          ))}
        </div>

        {/* Posts Feed */}
        {posts.map(post => {
          const postUser = post.customUser || COMMUNITY_USERS[post.userId - 1];
          return renderPost(post, postUser);
        })}
      </div>

      {/* ─── Right Sidebar ─── */}
      <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Your Profile Card */}
        <GlassCard hover={false} style={{ textAlign: "center", padding: 22 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,255,140,0.1)", border: "2px solid rgba(0,255,140,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 12px", color: "#00ff8c", boxShadow: "0 0 20px rgba(0,255,140,0.15)" }}>◈</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 4 }}>Seeker</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 12 }}>@you</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
            <div><div style={{ fontSize: 16, fontWeight: 600, color: "#00ff8c" }}>33</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>LEVEL</div></div>
            <div><div style={{ fontSize: 16, fontWeight: 600, color: "#a78bfa" }}>85</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>VIBE</div></div>
            <div><div style={{ fontSize: 16, fontWeight: 600, color: "#06b6d4" }}>142</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>SIGNALS</div></div>
          </div>
        </GlassCard>

        {/* Suggested Connections */}
        <GlassCard hover={false} style={{ padding: 18 }}>
          <span style={{ fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 14 }}>SOULS TO CONNECT</span>
          {COMMUNITY_USERS.filter(u => !u.online).map(u => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div onClick={() => setSelectedProfile(u)} style={{ width: 36, height: 36, borderRadius: "50%", background: `${u.color}22`, border: `1px solid ${u.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer" }}>{u.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 500, cursor: "pointer" }} onClick={() => setSelectedProfile(u)}>{u.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.bio.substring(0, 35)}...</div>
              </div>
              <button style={{ background: `${u.color}12`, border: `1px solid ${u.color}30`, color: u.color, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 9, letterSpacing: 1, fontFamily: "'Orbitron', sans-serif" }}>FOLLOW</button>
            </div>
          ))}
        </GlassCard>

        {/* Trending Tags */}
        <GlassCard hover={false} style={{ padding: 18 }}>
          <span style={{ fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 14 }}>TRENDING SIGNALS</span>
          {[
            { tag: "#369manifestation", posts: "2.4K signals", color: "#eab308" },
            { tag: "#scalarhealing", posts: "1.8K signals", color: "#06b6d4" },
            { tag: "#decalcifypineal", posts: "3.1K signals", color: "#a78bfa" },
            { tag: "#coppercoils", posts: "987 signals", color: "#f97316" },
            { tag: "#gatewaytapes", posts: "4.2K signals", color: "#00ff8c" },
            { tag: "#sungazing", posts: "1.5K signals", color: "#eab308" },
          ].map(t => (
            <div key={t.tag} style={{ marginBottom: 12, cursor: "pointer" }}>
              <div style={{ fontSize: 13, color: t.color, fontWeight: 500 }}>{t.tag}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{t.posts}</div>
            </div>
          ))}
        </GlassCard>

        {/* Active Now */}
        <GlassCard hover={false} style={{ padding: 18 }}>
          <span style={{ fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 14 }}>ACTIVE IN THE FIELD</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {COMMUNITY_USERS.filter(u => u.online).map(u => (
              <div key={u.id} onClick={() => setSelectedProfile(u)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${u.color}22`, border: `1px solid ${u.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{u.avatar}</div>
                  <div style={{ position: "absolute", bottom: -1, right: -1, width: 8, height: 8, borderRadius: "50%", background: "#00ff8c", border: "1.5px solid #050508" }} />
                </div>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{u.name}</span>
                <span style={{ fontSize: 9, color: u.color, marginLeft: "auto", fontFamily: "'Orbitron', sans-serif" }}>L{u.level}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function RTV33() {
  const [phase, setPhase] = useState("landing"); // landing -> wormhole -> whiteout -> app
  const [activeTab, setActiveTab] = useState("dashboard");
  const mousePos = useRef({ x: 0, y: 0 });
  const [mood, setMood] = useState("balanced");
  const [vibScore, setVibScore] = useState(72);
  const [chakraLevels, setChakraLevels] = useState([68, 74, 82, 91, 65, 58, 77]);

  const entered = phase === "app";

  useEffect(() => {
    const handler = (e) => { mousePos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const handleEnter = () => {
    setPhase("suckin"); // brief suck-in before full wormhole
    setTimeout(() => setPhase("wormhole"), 600);
    setTimeout(() => setPhase("whiteout"), 8600);
    setTimeout(() => setPhase("app"), 10200);
  };

  useEffect(() => {
    if (!entered) return;
    const interval = setInterval(() => {
      setVibScore(v => clamp(v + Math.floor(Math.random() * 5 - 2), 30, 99));
      setChakraLevels(l => l.map(v => clamp(v + Math.floor(Math.random() * 7 - 3), 20, 100)));
    }, 5000);
    return () => clearInterval(interval);
  }, [entered]);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "◈" },
    { id: "wakeup", label: "Wake Up", icon: "◉" },
    { id: "biofield", label: "BIO FI3LD", icon: "◐" },
    { id: "healing", label: "H3ALING", icon: "❋" },
    { id: "knowledge", label: "Knowledge Portal", icon: "⬡" },
    { id: "practice", label: "Z3N ZON3", icon: "◎" },
    { id: "community", label: "Community", icon: "⊛" },
    { id: "guide", label: "AI Guide", icon: "✧" },
    { id: "events", label: "Events", icon: "⊕" },
  ];

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=JetBrains+Mono:wght@300;400;500&family=Sora:wght@200;300;400;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #050508; color: #fff; overflow-x: hidden; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(0,255,140,0.2); border-radius: 2px; }
    ::selection { background: rgba(0,255,140,0.3); color: #fff; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scanLine { 0% { top: 0; } 100% { top: 100%; } }
    @keyframes breathe { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
    @keyframes gridPulse { 0%, 100% { opacity: 0.03; } 50% { opacity: 0.06; } }
    @keyframes orbPulse { 0%, 100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.08); filter: brightness(1.3); } }
  `;

  // ─── ENTRY PORTAL ───
  if (phase === "landing" || phase === "suckin") {
    const isSucking = phase === "suckin";
    return (
      <>
        <style>{globalStyles}{`
          @keyframes suckIn {
            0% { transform: scale(1); filter: blur(0px) brightness(1); opacity: 1; }
            100% { transform: scale(0.01); filter: blur(10px) brightness(3); opacity: 0; }
          }
          @keyframes suckRain {
            0% { opacity: 0.7; filter: blur(0px); }
            100% { opacity: 0; filter: blur(8px); }
          }
        `}</style>
        <div style={{ animation: isSucking ? "suckRain 0.6s ease-in forwards" : "none" }}>
          <MatrixRain />
        </div>
        <ParticleField mousePos={mousePos} entered={false} />
        <div style={{
          position: "fixed", inset: 0, zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Sora', sans-serif",
          animation: isSucking ? "suckIn 0.6s cubic-bezier(0.55, 0.06, 0.68, 0.19) forwards" : "none",
          transformOrigin: "center center",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,255,140,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,140,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", animation: "gridPulse 6s ease-in-out infinite" }} />
          <div style={{ textAlign: "center", zIndex: 3, animation: phase === "landing" ? "fadeInUp 1.2s ease" : "none" }}>
            <div style={{ fontSize: 14, letterSpacing: 12, color: "rgba(0,255,140,0.5)", fontFamily: "'Orbitron', sans-serif", marginBottom: 24 }}>RTV33</div>
            <h1 style={{ fontSize: "clamp(28px, 5vw, 56px)", fontWeight: 600, fontFamily: "'Orbitron', sans-serif", lineHeight: 1.2, marginBottom: 12, animation: "breathe 4s ease-in-out infinite", letterSpacing: 4, textShadow: "0 0 40px rgba(0,255,140,0.3), 0 0 80px rgba(0,255,140,0.15)" }}>RAIS3 TH3 VIBRATION</h1>
            <h2 style={{ fontSize: "clamp(16px, 2.5vw, 28px)", fontWeight: 200, color: "#00ff8c", fontFamily: "'Sora', sans-serif", marginBottom: 48, textShadow: "0 0 30px rgba(0,255,140,0.3)" }}>Enter the Void.</h2>
            <button onClick={handleEnter} disabled={isSucking} style={{ background: "transparent", border: "1px solid rgba(0,255,140,0.4)", color: "#00ff8c", padding: "16px 48px", borderRadius: 4, fontSize: 14, letterSpacing: 6, cursor: isSucking ? "default" : "pointer", fontFamily: "'Orbitron', sans-serif", transition: "all 0.4s ease", opacity: isSucking ? 0.5 : 1 }}
              onMouseEnter={e => { if (!isSucking) { e.target.style.background = "rgba(0,255,140,0.08)"; e.target.style.boxShadow = "0 0 40px rgba(0,255,140,0.15)"; } }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.boxShadow = "none"; }}>
              ENTER RTV33
            </button>
            <div style={{ marginTop: 64, fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: 3, fontFamily: "'JetBrains Mono', monospace" }}>A DIGITAL CONSCIOUSNESS ECOSYSTEM</div>
          </div>
        </div>
      </>
    );
  }

  // ─── WORMHOLE TRANSITION ───
  if (phase === "wormhole") {
    return (
      <>
        <style>{globalStyles}</style>
        <WormholeTransition />
      </>
    );
  }

  // ─── WHITE LIGHT FLASH → FADE INTO APP ───
  if (phase === "whiteout") {
    return (
      <>
        <style>{globalStyles}{`
          @keyframes whiteToApp {
            0% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes appReveal {
            0% { opacity: 0; transform: scale(1.05); filter: brightness(2); }
            100% { opacity: 1; transform: scale(1); filter: brightness(1); }
          }
        `}</style>
        <MatrixOverlay />
        <ParticleField mousePos={mousePos} entered={true} />
        <div style={{
          position: "fixed", inset: 0, zIndex: 100, background: "#fff",
          animation: "whiteToApp 1.5s ease-out forwards",
          pointerEvents: "none",
        }} />
      </>
    );
  }

  // ─── MAIN INTERFACE ───
  return (
    <>
      <style>{globalStyles}{`
        @keyframes appEntrance {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes matrixGlow {
          0%, 100% { text-shadow: 0 0 5px rgba(0,255,140,0.3); }
          50% { text-shadow: 0 0 15px rgba(0,255,140,0.6), 0 0 30px rgba(0,255,140,0.2); }
        }
        @keyframes dataStream {
          0% { background-position: 0% 0%; }
          100% { background-position: 0% 100%; }
        }
      `}</style>
      <MatrixOverlay />
      <ParticleField mousePos={mousePos} entered={true} />
      <div style={{ position: "fixed", inset: 0, zIndex: 1, backgroundImage: "linear-gradient(rgba(0,255,140,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,140,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none", animation: "gridPulse 6s ease-in-out infinite" }} />

      <div style={{ position: "relative", zIndex: 2, fontFamily: "'Sora', sans-serif", minHeight: "100vh", display: "flex" }}>
        {/* Sidebar */}
        <nav style={{ width: 72, position: "fixed", left: 0, top: 0, bottom: 0, background: "rgba(5,5,8,0.85)", backdropFilter: "blur(20px)", borderRight: "1px solid rgba(0,255,140,0.08)", display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0", gap: 8, zIndex: 10, boxShadow: "2px 0 20px rgba(0,255,140,0.03)" }}>
          <div style={{ fontSize: 10, fontFamily: "'Orbitron', sans-serif", color: "#00ff8c", letterSpacing: 2, marginBottom: 24, writingMode: "vertical-lr", textOrientation: "mixed", transform: "rotate(180deg)", opacity: 0.7, animation: "matrixGlow 4s ease-in-out infinite" }}>RTV33</div>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} title={item.label} style={{
              width: 44, height: 44, borderRadius: 10, border: "none",
              background: activeTab === item.id ? "rgba(0,255,140,0.12)" : "transparent",
              color: activeTab === item.id ? "#00ff8c" : "rgba(255,255,255,0.3)",
              cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.3s ease",
              boxShadow: activeTab === item.id ? "0 0 15px rgba(0,255,140,0.1)" : "none",
            }}>{item.icon}</button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #00ff8c44, #a78bfa44)", border: "1px solid rgba(255,255,255,0.1)" }} />
        </nav>

        {/* Main Content */}
        <main style={{ marginLeft: 72, flex: 1, padding: "32px 40px", maxWidth: 1200, animation: "appEntrance 0.8s ease" }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40, paddingBottom: 20, borderBottom: "1px solid rgba(0,255,140,0.06)", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 400, fontFamily: "'Sora', sans-serif", color: "#fff", letterSpacing: 1, animation: "matrixGlow 5s ease-in-out infinite" }}>
                {navItems.find(n => n.id === activeTab)?.icon} {navItems.find(n => n.id === activeTab)?.label}
              </h1>
              <p style={{ fontSize: 11, color: "rgba(0,255,140,0.3)", marginTop: 4, letterSpacing: 2, fontFamily: "'JetBrains Mono', monospace" }}>FREQUENCY LOCKED • SESSION ACTIVE • ▮</p>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {["calm", "balanced", "energized"].map(m => (
                <button key={m} onClick={() => setMood(m)} style={{ padding: "6px 14px", borderRadius: 6, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontFamily: "'Orbitron', sans-serif", background: mood === m ? "rgba(0,255,140,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${mood === m ? "rgba(0,255,140,0.3)" : "rgba(255,255,255,0.06)"}`, color: mood === m ? "#00ff8c" : "rgba(255,255,255,0.3)", transition: "all 0.3s ease" }}>{m}</button>
              ))}
            </div>
          </header>

          {/* ─── DASHBOARD ─── */}
          {activeTab === "dashboard" && (
            <div style={{ animation: "fadeInUp 0.5s ease" }}>
              <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 32 }}>
                <GlassCard style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, flex: "0 0 260px" }} hover={false}>
                  <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontFamily: "'Orbitron', sans-serif" }}>Your Vibration</span>
                  <EnergyOrb score={vibScore} mood={mood} />
                  <span style={{ fontSize: 11, color: mood === "calm" ? "#06b6d4" : mood === "energized" ? "#00ff8c" : "#a78bfa", textTransform: "uppercase", letterSpacing: 3, fontFamily: "'Orbitron', sans-serif" }}>{mood} state</span>
                </GlassCard>
                <GlassCard style={{ flex: 1, minWidth: 300 }} hover={false}>
                  <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 20 }}>Chakra Alignment</span>
                  <ChakraMeter levels={chakraLevels} />
                </GlassCard>
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
                {[{ label: "Streak", value: "14 days", icon: "🔥" }, { label: "Meditations", value: "47", icon: "🧘" }, { label: "Level", value: "Seeker III", icon: "◈" }, { label: "Insights", value: "23 unlocked", icon: "✧" }].map(s => (
                  <GlassCard key={s.label} style={{ flex: "1 1 140px", padding: 20, textAlign: "center" }}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", fontFamily: "'Orbitron', sans-serif" }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 2, marginTop: 4, textTransform: "uppercase" }}>{s.label}</div>
                  </GlassCard>
                ))}
              </div>
              <GlassCard hover={false}>
                <span style={{ fontSize: 10, letterSpacing: 3, color: "#00ff8c", textTransform: "uppercase", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 16 }}>⟡ Today's Signal</span>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, maxWidth: 600 }}>Your heart chakra is resonating strongly today. Consider a loving-kindness meditation and heart-opening yoga sequence. Your vibration has been climbing — stay consistent.</p>
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button style={{ padding: "8px 20px", borderRadius: 6, background: "rgba(0,255,140,0.1)", border: "1px solid rgba(0,255,140,0.25)", color: "#00ff8c", cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>BEGIN PRACTICE</button>
                  <button style={{ padding: "8px 20px", borderRadius: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>JOURNAL</button>
                </div>
              </GlassCard>
            </div>
          )}

          {/* ─── WAKE UP ─── */}
          {activeTab === "wakeup" && <WakeUpSection />}

          {/* ─── BIO FI3LD ─── */}
          {activeTab === "biofield" && <BiofieldSection />}

          {/* ─── H3ALING ─── */}
          {activeTab === "healing" && <HealingSection />}

          {/* ─── KNOWLEDGE PORTAL ─── */}
          {activeTab === "knowledge" && <KnowledgePortal />}

          {/* ─── PRACTICE ─── */}
          {activeTab === "practice" && (
            <div style={{ animation: "fadeInUp 0.5s ease" }}>
              <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
                <GlassCard style={{ flex: "1 1 360px" }} hover={false}>
                  <span style={{ fontSize: 10, letterSpacing: 3, color: "#00ff8c", textTransform: "uppercase", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 24 }}>4-7-8 Breathwork</span>
                  <BreathingGuide />
                </GlassCard>
                <GlassCard style={{ flex: "1 1 300px" }} hover={false}>
                  <span style={{ fontSize: 10, letterSpacing: 3, color: "#a78bfa", textTransform: "uppercase", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 20 }}>Practice Library</span>
                  {[{ name: "Morning Calibration", dur: "12 min", type: "Meditation", color: "#06b6d4" }, { name: "Nervous System Reset", dur: "8 min", type: "Breathwork", color: "#00ff8c" }, { name: "Chakra Alignment Flow", dur: "20 min", type: "Yoga", color: "#a78bfa" }, { name: "Deep Presence", dur: "15 min", type: "Meditation", color: "#06b6d4" }, { name: "Energy Activation", dur: "10 min", type: "Breathwork", color: "#00ff8c" }, { name: "Sacred Stillness", dur: "30 min", type: "Deep Work", color: "#eab308" }].map(p => (
                    <div key={p.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer" }}>
                      <div>
                        <div style={{ fontSize: 14, color: "#fff", marginBottom: 4 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{p.type} • {p.dur}</div>
                      </div>
                      <span style={{ color: p.color, fontSize: 14 }}>▶</span>
                    </div>
                  ))}
                </GlassCard>
              </div>
            </div>
          )}

          {/* ─── COMMUNITY — SOCIAL FEED ─── */}
          {activeTab === "community" && <CommunityFeed />}

          {/* ─── AI GUIDE ─── */}
          {activeTab === "guide" && (
            <div style={{ animation: "fadeInUp 0.5s ease" }}>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 24, lineHeight: 1.8 }}>Your AI-powered consciousness companion. Ask about mindfulness, nutrition, practices, or the nature of reality.</p>
              <GlassCard hover={false} style={{ maxWidth: 700 }}><AIGuide /></GlassCard>
            </div>
          )}

          {/* ─── EVENTS ─── */}
          {activeTab === "events" && (
            <div style={{ animation: "fadeInUp 0.5s ease" }}>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 24, lineHeight: 1.8 }}>Synchronized collective experiences. When we tune in together, the signal amplifies.</p>
              <GlassCard hover={false} style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 10, letterSpacing: 3, color: "#00ff8c", textTransform: "uppercase", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 16 }}>Global Meditation Map — Live</span>
                <WorldMap />
              </GlassCard>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[{ title: "Full Moon Collective Meditation", date: "Mar 29 • 9PM UTC", attendees: 342, color: "#a78bfa" }, { title: "Breathwork Convergence", date: "Apr 2 • 6AM UTC", attendees: 189, color: "#06b6d4" }, { title: "Silent Frequency Alignment", date: "Apr 7 • 12PM UTC", attendees: 567, color: "#00ff8c" }].map(evt => (
                  <GlassCard key={evt.title} style={{ flex: "1 1 280px" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: evt.color, boxShadow: `0 0 10px ${evt.color}88`, marginBottom: 14 }} />
                    <h3 style={{ fontSize: 15, fontWeight: 500, color: "#fff", marginBottom: 8 }}>{evt.title}</h3>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>{evt.date}</p>
                    <p style={{ fontSize: 11, color: evt.color }}>{evt.attendees} souls attending</p>
                    <button style={{ marginTop: 16, padding: "8px 20px", borderRadius: 6, background: `${evt.color}15`, border: `1px solid ${evt.color}40`, color: evt.color, cursor: "pointer", fontSize: 10, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>JOIN SIGNAL</button>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          <footer style={{ marginTop: 80, paddingTop: 24, borderTop: "1px solid rgba(0,255,140,0.06)", display: "flex", justifyContent: "space-between", paddingBottom: 32, flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 10, color: "rgba(0,255,140,0.2)", letterSpacing: 3, fontFamily: "'Orbitron', sans-serif", animation: "matrixGlow 6s ease-in-out infinite" }}>RAIS3 TH3 VIBRATION — RTV33</span>
            <span style={{ fontSize: 10, color: "rgba(0,255,140,0.12)", fontFamily: "'JetBrains Mono', monospace" }}>v3.3 • TH3 SIGNAL IS 3T3RNAL • ◈</span>
          </footer>
        </main>
      </div>
    </>
  );
}
// test change

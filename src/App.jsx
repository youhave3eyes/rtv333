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
    const count = Math.min(180, Math.floor((dims.current.w * dims.current.h) / 7000));
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * dims.current.w, y: Math.random() * dims.current.h,
      vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2,
      r: Math.random() * 2.5 + 0.5,
      hue: Math.random() > 0.6 ? 140 + Math.random() * 30 : 270 + Math.random() * 40,
      alpha: Math.random() * 0.5 + 0.2, pulse: Math.random() * Math.PI * 2,
      drift: Math.random() * Math.PI * 2, // unique drift phase
      driftSpeed: 0.2 + Math.random() * 0.6, // how fast it wanders
      driftRadius: 20 + Math.random() * 60, // how far it wanders
    }));
    const draw = (time) => {
      const { w, h } = dims.current;
      ctx.clearRect(0, 0, w, h);
      const mx = mousePos.current?.x ?? -9999;
      const my = mousePos.current?.y ?? -9999;
      const t = time * 0.001;
      particles.current.forEach((p) => {
        // Independent floating/drifting motion
        p.vx += Math.sin(t * p.driftSpeed + p.drift) * 0.02;
        p.vy += Math.cos(t * p.driftSpeed * 0.7 + p.drift + 1.5) * 0.02;

        // Gentle cursor influence (much softer than before)
        if (mx > -999) {
          const dx = mx - p.x, dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) + 1;
          if (dist < 200) {
            const force = clamp(30 / dist, 0, 0.3);
            p.vx += (dx / dist) * force * 0.008;
            p.vy += (dy / dist) * force * 0.008;
          }
        }

        // Damping — keeps them drifting but not flying off screen
        p.vx *= 0.985; p.vy *= 0.985;

        // Speed limit
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.5) { p.vx *= 1.5 / speed; p.vy *= 1.5 / speed; }

        p.x += p.vx; p.y += p.vy;

        // Wrap around edges
        if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;

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

// ─── Animated Matrix 3 Character ───
function Matrix3({ delay = 0 }) {
  const [displayChar, setDisplayChar] = useState("3");
  const chars = "0123456789アウエカΣΩΔΘ∞◈⬡✧⚛";
  const intervalRef = useRef(null);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    let count = 0;
    const startDelay = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        count++;
        if (count > 12 + Math.random() * 8) {
          setDisplayChar("3");
          setSettled(true);
          clearInterval(intervalRef.current);
          // After settling, occasionally glitch
          const glitchInterval = setInterval(() => {
            if (Math.random() > 0.7) {
              const glitchChar = chars[Math.floor(Math.random() * chars.length)];
              setDisplayChar(glitchChar);
              setTimeout(() => setDisplayChar("3"), 80 + Math.random() * 120);
            }
          }, 2000 + Math.random() * 3000);
          return () => clearInterval(glitchInterval);
        }
        setDisplayChar(chars[Math.floor(Math.random() * chars.length)]);
      }, 60 + Math.random() * 40);
    }, delay);
    return () => { clearTimeout(startDelay); clearInterval(intervalRef.current); };
  }, []);

  return (
    <span style={{
      display: "inline-block",
      color: "#00ff8c",
      textShadow: settled
        ? "0 0 20px rgba(0,255,140,0.8), 0 0 40px rgba(0,255,140,0.4), 0 0 60px rgba(0,255,140,0.2)"
        : "0 0 10px rgba(0,255,140,0.5)",
      transition: "text-shadow 0.3s ease",
      position: "relative",
      minWidth: "0.6em",
      textAlign: "center",
    }}>
      {displayChar}
      {/* Trailing column of fading numbers below the 3 */}
      <span style={{
        position: "absolute",
        left: "50%",
        top: "100%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "none",
      }}>
        {[0,1,2,3,4].map(i => (
          <MatrixTrailChar key={i} index={i} settled={settled} />
        ))}
      </span>
    </span>
  );
}

function MatrixTrailChar({ index, settled }) {
  const [char, setChar] = useState("");
  const chars = "0123456789ΣΩΔ∞◈3";

  useEffect(() => {
    const interval = setInterval(() => {
      setChar(chars[Math.floor(Math.random() * chars.length)]);
    }, 100 + index * 50 + Math.random() * 80);
    return () => clearInterval(interval);
  }, []);

  const opacity = settled ? (0.35 - index * 0.07) : (0.2 - index * 0.04);
  const size = Math.max(8, 14 - index * 2);

  return (
    <span style={{
      fontSize: size,
      color: "#00ff8c",
      opacity: Math.max(0, opacity),
      fontFamily: "'JetBrains Mono', monospace",
      lineHeight: 1.4,
      textShadow: `0 0 ${6 - index}px rgba(0,255,140,${0.3 - index * 0.06})`,
    }}>{char}</span>
  );
}

// ─── Landing Page Title ───
function LandingTitle() {
  // RAIS3 TH3 VIBRATION — the 3s get the matrix treatment
  const titleStyle = {
    fontSize: "clamp(28px, 5vw, 56px)",
    fontWeight: 600,
    fontFamily: "'Orbitron', sans-serif",
    lineHeight: 1.2,
    marginBottom: 40,
    letterSpacing: 4,
    color: "#fff",
    textShadow: "0 0 40px rgba(0,255,140,0.3), 0 0 80px rgba(0,255,140,0.15)",
    animation: "breathe 4s ease-in-out infinite",
    position: "relative",
    display: "inline-block",
    paddingBottom: 30, // room for trailing chars
  };

  return (
    <h1 style={titleStyle}>
      {"RAIS"}
      <Matrix3 delay={200} />
      {" TH"}
      <Matrix3 delay={500} />
      {" VIBRATION"}
    </h1>
  );
}

// ─── Energy Orb ───
function EnergyOrb({ score, mood }) {
  const hueMap = { seeker: 155, truther: 0, mystic: 270, scientist: 190, builder: 45 };
  const hue = hueMap[mood] || 155;
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
      style={{
        background: hovered && hover
          ? "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))"
          : "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
        backdropFilter: "blur(24px) saturate(1.2)",
        WebkitBackdropFilter: "blur(24px) saturate(1.2)",
        border: hovered && hover
          ? "1px solid rgba(255,255,255,0.12)"
          : "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14,
        padding: 28,
        transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        transform: hovered && hover ? "translateY(-3px) scale(1.005)" : "none",
        boxShadow: hovered && hover
          ? "0 16px 48px rgba(0,0,0,0.4), 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}>
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
      { title: "Children of the Matrix — David Icke", desc: "How an interdimensional race has controlled the world for thousands of years — and still does. Icke connects bloodlines, ancient history, and modern power structures into a unified theory of control. Essential reading for understanding the reptilian hypothesis and the hidden architecture of human society.", tags: ["ICKE", "MATRIX", "CONTROL"], status: "free", pages: 501 },
      { title: "Alice in Wonderland and the World Trade Center Disaster — David Icke", desc: "Icke's deep analysis of 9/11 and the agenda behind it. Examines the evidence that the official story is a fabrication, and connects the event to a larger pattern of manufactured crises designed to centralize global power. Written in the immediate aftermath with remarkable foresight.", tags: ["ICKE", "9/11", "FALSE FLAG"], status: "free", pages: 485 },
      { title: "The Secret Doctrine — Helena Blavatsky", desc: "The foundational text of Theosophy. Synthesis of science, religion, and philosophy exploring cosmic evolution, root races, and the hidden history of humanity. Dense but world-changing.", tags: ["THEOSOPHY", "OCCULT"], status: "free", pages: 1475 },
      { title: "The Nag Hammadi Library — Gnostic Texts", desc: "The complete collection of ancient Gnostic scriptures discovered in Egypt in 1945. Includes the Gospel of Thomas, the Gospel of Philip, and texts describing the Archons — rulers who feed on human energy.", tags: ["GNOSTIC", "ARCHONS", "ANCIENT"], status: "free", pages: 549 },
      { title: "The Corpus Hermeticum — Hermes Trismegistus", desc: "The original Hermetic texts. 'As above, so below' originates here. The foundation of Western esotericism, alchemy, and the understanding that consciousness creates reality.", tags: ["HERMETIC", "ALCHEMY"], status: "free", pages: 128 },
      { title: "The Book of Enoch", desc: "Removed from the Biblical canon but preserved in Ethiopian tradition. Details the Watchers — beings who descended to Earth and taught humanity forbidden knowledge. Angels, Nephilim, and cosmic secrets.", tags: ["BIBLICAL", "WATCHERS", "NEPHILIM"], status: "free", pages: 108 },
      { title: "Isis Unveiled — Helena Blavatsky", desc: "A master key to the mysteries of ancient and modern science and theology. Blavatsky dismantles both religious dogma and scientific materialism, revealing the hidden thread connecting all traditions.", tags: ["THEOSOPHY", "MYSTERY"], status: "free", pages: 1328 },
      { title: "The Bhagavad Gita", desc: "The 700-verse Hindu scripture where Krishna reveals the nature of reality, consciousness, and duty to the warrior Arjuna. The most concise guide to understanding the self, karma, and liberation ever written.", tags: ["HINDU", "CONSCIOUSNESS"], status: "free", pages: 282 },
      { title: "The Tibetan Book of the Dead — Bardo Thodol", desc: "The ancient Tibetan guide to navigating consciousness after death. Describes the bardos — intermediate states between lives — and how awareness determines your next incarnation.", tags: ["TIBETAN", "DEATH", "REBIRTH"], status: "free", pages: 220 },
      { title: "Behold a Pale Horse — William Cooper", desc: "Former Naval Intelligence officer reveals secret government projects, UFO cover-ups, the JFK assassination, and the blueprint for a New World Order. Cooper was killed in 2001.", tags: ["COOPER", "NWO", "INTELLIGENCE"], status: "free", pages: 500 },
      { title: "The Protocols of the Learned Elders of Zion — (Controversial)", desc: "One of the most debated documents in history. Regardless of its disputed origins, it reads as a blueprint for controlling populations through media, finance, and division. Read critically.", tags: ["CONTROVERSIAL", "CONTROL"], status: "free", pages: 78 },
      { title: "Morals and Dogma — Albert Pike", desc: "The definitive text of Scottish Rite Freemasonry by its Grand Commander. Reveals the philosophical and esoteric teachings behind each degree. What Masons are actually taught behind closed doors.", tags: ["MASONIC", "ESOTERIC"], status: "free", pages: 861 },
      { title: "The Yoga Sutras of Patanjali", desc: "196 sutras outlining the eight limbs of yoga and the science of consciousness. Written 2,000+ years ago, it remains the most precise manual for mastering the mind ever composed.", tags: ["YOGA", "CONSCIOUSNESS"], status: "free", pages: 96 },
      { title: "Think and Grow Rich — Napoleon Hill", desc: "Distilled from 20 years of studying the wealthiest people alive. The 13 principles of success and manifestation that created more millionaires than any other book.", tags: ["MANIFESTATION", "WEALTH"], status: "free", pages: 233 },
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
                            {item.status === "find" ? "FIND THIS BOOK" : item.pages ? "READ NOW" : "EXPLORE"}
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
                            {item.pages} pages • {item.status === "free" ? "FREE ACCESS" : item.status === "find" ? "SEARCH ONLINE • SUPPORT THE AUTHOR" : "PREMIUM"}
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
          <div key={s.label} style={{ flex: "1 1 130px", padding: "18px 20px", borderRadius: 12, textAlign: "center", background: `linear-gradient(135deg, ${s.color}08, ${s.color}03)`, border: `1px solid ${s.color}15`, boxShadow: `0 4px 20px ${s.color}08, inset 0 1px 0 rgba(255,255,255,0.03)` }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: "'Orbitron', sans-serif", textShadow: `0 0 20px ${s.color}30` }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 2, textTransform: "uppercase", marginTop: 6, fontFamily: "'Sora', sans-serif", fontWeight: 500 }}>{s.label}</div>
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
              <span style={{ fontSize: 10, color: cat.color, letterSpacing: 3, fontFamily: "'Orbitron', sans-serif", fontWeight: 600, textShadow: `0 0 10px ${cat.color}30` }}>ENTER →</span>
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
              <span style={{ fontSize: 9, padding: "4px 12px", borderRadius: 6, background: `${topic.urgencyColor}12`, border: `1px solid ${topic.urgencyColor}30`, color: topic.urgencyColor, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", fontWeight: 600, boxShadow: `0 0 8px ${topic.urgencyColor}15` }}>{topic.urgency}</span>
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
                    <button onClick={(e) => { e.stopPropagation(); }} style={{ padding: "8px 18px", borderRadius: 6, background: `${topic.color}12`, border: `1px solid ${topic.color}30`, color: topic.color, cursor: "pointer", fontSize: 10, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>DEEP DIVE →</button>
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
      <div style={{ display: "flex", gap: 14, marginBottom: 32, flexWrap: "wrap" }}>
        {[
          { label: "Active Signals", value: totalArticles, color: "#ef4444" },
          { label: "Topics", value: WAKEUP_TOPICS.length, color: "#eab308" },
          { label: "Declassified", value: WAKEUP_TOPICS.reduce((a, t) => a + t.articles.filter(ar => ar.tags.some(tag => tag.includes("DECLASSIFIED") || tag.includes("PROVEN") || tag.includes("DOCUMENTED"))).length, 0), color: "#00ff8c" },
          { label: "Saved", value: savedArticles.size, color: "#a78bfa" },
        ].map(s => (
          <div key={s.label} style={{
            flex: "1 1 130px", padding: "18px 20px", borderRadius: 12, textAlign: "center",
            background: `linear-gradient(135deg, ${s.color}08, ${s.color}03)`,
            border: `1px solid ${s.color}15`,
            boxShadow: `0 4px 20px ${s.color}08, inset 0 1px 0 rgba(255,255,255,0.03)`,
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: "'Orbitron', sans-serif", textShadow: `0 0 20px ${s.color}30` }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 2, textTransform: "uppercase", marginTop: 6, fontFamily: "'Sora', sans-serif", fontWeight: 500 }}>{s.label}</div>
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
                <span style={{ fontSize: 10, color: topic.color, letterSpacing: 3, fontFamily: "'Orbitron', sans-serif", fontWeight: 600, textShadow: `0 0 10px ${topic.color}30` }}>ENTER →</span>
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
// WORMHOLE TRANSITION — Matrix tunnel with speed streaks
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

    const _cx = () => w / 2, _cy = () => h / 2;
    const fontSize = 14;
    const chars = "アイウエオカキクケコサシスセソタチツテト0123456789ABCDEFRTV33ΣΩΔΘΨξ∞◈⬡◎⊛✧";

    // Matrix rain columns — start as normal falling rain
    const cols = Math.floor(w / fontSize);
    const rainDrops = Array.from({ length: cols }, (_, i) => ({
      x: i * fontSize,
      y: Math.random() * h,
      speed: 2 + Math.random() * 4,
      chars: Array.from({ length: Math.floor(h / fontSize) + 5 }, () => chars[Math.floor(Math.random() * chars.length)]),
      brightness: 0.3 + Math.random() * 0.4,
    }));

    // Tunnel character particles — these form the portal tube
    const tunnelChars = Array.from({ length: 600 }, (_, i) => ({
      angle: Math.random() * Math.PI * 2,
      z: Math.random() * 2000,
      radius: 80 + Math.random() * 250,
      char: chars[Math.floor(Math.random() * chars.length)],
      speed: 1 + Math.random() * 3,
      rotSpeed: 0.002 + Math.random() * 0.008,
      size: 10 + Math.random() * 8,
      brightness: Math.random(),
    }));

    const draw = () => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      const totalDuration = 8;
      const progress = Math.min(elapsed / totalDuration, 1);
      const cx = _cx(), cy = _cy();

      // Trail fade
      const trailAlpha = progress < 0.15 ? 0.04 : progress < 0.5 ? 0.06 : 0.08 + progress * 0.04;
      ctx.fillStyle = `rgba(5, 5, 8, ${trailAlpha})`;
      ctx.fillRect(0, 0, w, h);

      const flySpeed = 2 + progress * progress * 40;
      const spiralStrength = Math.min(progress / 0.3, 1); // 0→1 over first 30%
      const tunnelStrength = progress > 0.15 ? Math.min((progress - 0.15) / 0.2, 1) : 0; // fade in tunnel

      // ── PHASE 1: Matrix rain spirals into center ──
      if (progress < 0.5) {
        const rainFade = progress > 0.35 ? 1 - (progress - 0.35) / 0.15 : 1;

        rainDrops.forEach(drop => {
          drop.y += drop.speed * (1 + spiralStrength * 3);
          if (drop.y > h + fontSize * 5) drop.y = -fontSize * 5;

          const colLen = Math.min(drop.chars.length, 15);
          for (let j = 0; j < colLen; j++) {
            let x = drop.x;
            let y = drop.y - j * fontSize;
            if (y < -fontSize || y > h + fontSize) continue;

            // Spiral toward center
            const dx = x - cx;
            const dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) + spiralStrength * 2.5 * (1 - dist / (w * 0.7));
            const newDist = dist * (1 - spiralStrength * 0.65);
            x = cx + Math.cos(angle) * newDist;
            y = cy + Math.sin(angle) * newDist;

            // Randomize char occasionally
            if (Math.random() > 0.95) drop.chars[j] = chars[Math.floor(Math.random() * chars.length)];

            const alpha = (j === 0 ? 0.9 : (1 - j / colLen) * 0.5) * drop.brightness * rainFade;
            const isHead = j === 0;

            if (isHead) {
              ctx.fillStyle = `rgba(180, 255, 210, ${alpha})`;
              ctx.shadowColor = "#00ff8c";
              ctx.shadowBlur = 10;
            } else {
              ctx.fillStyle = `rgba(0, 255, 140, ${alpha})`;
              ctx.shadowBlur = 0;
            }
            ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
            ctx.fillText(drop.chars[j], x, y);
            ctx.shadowBlur = 0;
          }
        });
      }

      // ── PHASE 2: Character tunnel — being sucked through a portal ──
      if (progress > 0.15) {
        const alpha = tunnelStrength;

        tunnelChars.forEach(tc => {
          // Move toward camera
          tc.z -= flySpeed * tc.speed;
          if (tc.z < -50) {
            tc.z = 2000;
            tc.angle = Math.random() * Math.PI * 2;
            tc.char = chars[Math.floor(Math.random() * chars.length)];
            tc.brightness = Math.random();
          }

          // Rotate around the tunnel axis
          tc.angle += tc.rotSpeed * (1 + progress * 3);

          // Project 3D to 2D — perspective
          const perspective = 400 / (tc.z + 1);
          const screenX = cx + Math.cos(tc.angle) * tc.radius * perspective;
          const screenY = cy + Math.sin(tc.angle) * tc.radius * perspective;
          const screenSize = tc.size * perspective;

          // Only draw if on screen and not too tiny
          if (screenX > -50 && screenX < w + 50 && screenY > -50 && screenY < h + 50 && screenSize > 2 && screenSize < 80) {
            const depth = 1 - tc.z / 2000;
            const charAlpha = depth * 0.7 * alpha * (0.3 + tc.brightness * 0.7);

            // Closer chars are brighter, whiter
            if (depth > 0.85) {
              ctx.fillStyle = `rgba(220, 255, 235, ${charAlpha})`;
              ctx.shadowColor = "#00ff8c";
              ctx.shadowBlur = 8 + depth * 10;
            } else if (depth > 0.5) {
              ctx.fillStyle = `rgba(0, 255, 140, ${charAlpha})`;
              ctx.shadowColor = "#00ff8c";
              ctx.shadowBlur = 4;
            } else {
              ctx.fillStyle = `rgba(0, 255, 140, ${charAlpha * 0.5})`;
              ctx.shadowBlur = 0;
            }

            ctx.font = `${Math.max(4, screenSize)}px 'JetBrains Mono', monospace`;
            ctx.fillText(tc.char, screenX, screenY);
            ctx.shadowBlur = 0;
          }
        });

        // Dark tunnel rim — creates the tube illusion
        const rimGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.5);
        rimGrad.addColorStop(0, "transparent");
        rimGrad.addColorStop(0.3, "transparent");
        rimGrad.addColorStop(0.6, `rgba(0, 20, 10, ${0.3 * alpha})`);
        rimGrad.addColorStop(0.8, `rgba(0, 10, 5, ${0.6 * alpha})`);
        rimGrad.addColorStop(1, `rgba(5, 5, 8, ${0.9 * alpha})`);
        ctx.fillStyle = rimGrad;
        ctx.fillRect(0, 0, w, h);

        // Center glow — the light at the end of the tunnel (grows with progress)
        if (progress > 0.4) {
          const glowProgress = (progress - 0.4) / 0.6;
          const glowR = 20 + glowProgress * 60;
          const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
          glowGrad.addColorStop(0, `rgba(200, 255, 220, ${glowProgress * 0.3})`);
          glowGrad.addColorStop(0.5, `rgba(0, 255, 140, ${glowProgress * 0.1})`);
          glowGrad.addColorStop(1, "transparent");
          ctx.fillStyle = glowGrad;
          ctx.fillRect(0, 0, w, h);
        }
      }

      // ── PHASE 3: White light engulfs ──
      if (progress > 0.75) {
        const whiteP = (progress - 0.75) / 0.25;
        const eased = whiteP * whiteP * whiteP;

        const pulseR = 30 + eased * Math.max(w, h) * 1.2;
        const lightGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR);
        lightGrad.addColorStop(0, `rgba(255, 255, 255, ${eased})`);
        lightGrad.addColorStop(0.15, `rgba(220, 255, 240, ${eased * 0.9})`);
        lightGrad.addColorStop(0.35, `rgba(180, 240, 255, ${eased * 0.5})`);
        lightGrad.addColorStop(0.6, `rgba(100, 255, 180, ${eased * 0.2})`);
        lightGrad.addColorStop(1, "transparent");
        ctx.fillStyle = lightGrad;
        ctx.fillRect(0, 0, w, h);

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
function MatrixOverlay({ mood = "balanced" }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const moodRef = useRef(mood);

  useEffect(() => { moodRef.current = mood; }, [mood]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, columns, drops;
    const chars = "01アウエカキサシスセタチツテトRTV33ΩΔΘ∞◈⬡◎⊛✧";
    const fontSize = 13;

    const moodColors = {
      seeker: { r: 0, g: 255, b: 140 },
      truther: { r: 239, g: 68, b: 68 },
      mystic: { r: 167, g: 139, b: 250 },
      scientist: { r: 6, g: 182, b: 212 },
      builder: { r: 234, g: 179, b: 8 },
    };

    const init = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w; canvas.height = h;
      columns = Math.floor(w / (fontSize * 2.5));
      drops = Array.from({ length: columns }, () => Math.random() * -50);
    };
    init();
    window.addEventListener("resize", init);

    const draw = () => {
      const c = moodColors[moodRef.current] || moodColors.seeker;
      ctx.fillStyle = "rgba(5, 5, 8, 0.06)";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize * 2.5;
        const y = drops[i] * fontSize;

        const brightness = Math.random();
        if (brightness > 0.95) {
          ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.6)`;
          ctx.shadowColor = `rgb(${c.r}, ${c.g}, ${c.b})`;
          ctx.shadowBlur = 12;
        } else if (brightness > 0.8) {
          ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.3)`;
          ctx.shadowColor = `rgb(${c.r}, ${c.g}, ${c.b})`;
          ctx.shadowBlur = 5;
        } else if (brightness > 0.5) {
          ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 0.12)`;
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${0.04 + Math.random() * 0.06})`;
          ctx.shadowBlur = 0;
        }
        ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
        ctx.fillText(char, x, y);
        ctx.shadowBlur = 0;

        if (y > h && Math.random() > 0.982) drops[i] = 0;
        drops[i] += 0.35 + Math.random() * 0.25;
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { window.removeEventListener("resize", init); cancelAnimationFrame(animRef.current); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, opacity: 0.65, pointerEvents: "none" }} />;
}


// ═══════════════════════════════════════════════════════════════
// EN3RGY 101 — The Foundation of Everything
// ═══════════════════════════════════════════════════════════════

function Energy101Section({ setActiveTab }) {
  const [activeChapter, setActiveChapter] = useState(null);

  const chapters = [
    {
      id: "atoms", num: "01", title: "You Are Not Solid", icon: "⚛️", color: "#06b6d4",
      subtitle: "What you're actually made of",
      content: [
        { type: "big", text: "Pick up anything near you. Your phone. A cup. Your own hand. It feels solid, right?" },
        { type: "p", text: "But zoom in far enough — past the skin cells, past the molecules, past the atoms — and you'll find something shocking: it's almost entirely empty space. Every atom in your body is 99.9999% nothing. The tiny bit of matter that IS there isn't sitting still. It's vibrating. Oscillating. Spinning. Pulsing with energy billions of times per second." },
        { type: "p", text: "This isn't a metaphor. This isn't spiritual language. This is what your high school physics teacher should have made a bigger deal about. You — right now, reading this — are a cloud of vibrating energy holding a shape. The chair you're sitting on is a cloud of vibrating energy holding a different shape. The air between you and the screen is vibrating too." },
        { type: "highlight", text: "Everything in the universe — from a grain of sand to a star — is vibration. Different frequencies, different patterns, but all vibration. Including you." },
        { type: "p", text: "Quantum physics proved this over 100 years ago. Max Planck, the father of quantum theory, said it plainly: 'There is no matter as such. All matter originates and exists only by virtue of a force which brings the particle of an atom to vibration.' In other words — vibration came first. Matter is what vibration looks like when it slows down enough for you to touch it." },
      ]
    },
    {
      id: "fields", num: "02", title: "Everything Has a Field", icon: "🧲", color: "#a78bfa",
      subtitle: "The invisible force around all things",
      content: [
        { type: "big", text: "Anything that vibrates produces an electromagnetic field. No exceptions." },
        { type: "p", text: "Hold two magnets near each other. You can feel the push or pull — an invisible force moving through empty space. That's an electromagnetic field. Now here's the thing: your body is full of electrical activity. Your heart generates electrical impulses 100,000 times a day. Your brain fires billions of electrical signals every second. Every muscle contraction, every nerve impulse, every cellular process — all electrical." },
        { type: "p", text: "All of that electrical activity produces electromagnetic fields that extend OUTSIDE your body. Your heart's field is the strongest — scientists at the HeartMath Institute have measured it extending 3 to 5 feet from your body in every direction using sensitive magnetometers. Your brain has a field too, just weaker. Every organ does. Combined, they create what researchers call your BIOFIELD — an egg-shaped electromagnetic field that surrounds your entire body." },
        { type: "highlight", text: "You are a walking electromagnetic broadcast tower. You are constantly emitting a signal — whether you know it or not." },
        { type: "p", text: "And here's where it gets interesting: your field doesn't stop at some invisible wall. It interacts with every other field it touches. The person sitting next to you on the bus? Your fields are overlapping. Your pet lying on your lap? Your fields are merging. You're exchanging electromagnetic information all the time — without saying a word." },
      ]
    },
    {
      id: "input", num: "03", title: "Input Becomes Output", icon: "🔄", color: "#22c55e",
      subtitle: "What you consume is what you emit",
      content: [
        { type: "big", text: "Your body is a converter. Whatever goes in, gets transformed, and comes back out as your electromagnetic signal." },
        { type: "p", text: "Think of your body like a speaker system. The music that comes out depends entirely on the signal you feed in. Feed it a clean, high-quality audio file? Beautiful, clear sound. Feed it a corrupted, distorted file? Static, noise, chaos." },
        { type: "p", text: "Your body works the same way. Every cell is a tiny electrochemical engine that runs on what you give it:" },
        { type: "list", items: [
          { label: "Food", text: "becomes the raw material your cells use to generate energy (ATP). Living, nutrient-dense food = strong, coherent cellular signals. Dead, processed food = weak, chaotic signals." },
          { label: "Water", text: "is the medium through which every electrical signal in your body travels. Clean, structured water = efficient signal transmission. Contaminated water with fluoride and chlorine = impaired conductivity." },
          { label: "Air", text: "feeds the oxygen combustion that powers every cell. Deep, intentional breathing = fully oxygenated cells firing at peak capacity. Shallow stress breathing = cells running on empty." },
          { label: "Thoughts", text: "create measurable electrical patterns in your brain that ripple through your entire nervous system. Focused, positive thought patterns = coherent neural firing. Anxious, scattered thoughts = chaotic neural static." },
          { label: "Emotions", text: "physically reshape your heart's electromagnetic field in real time. Love and gratitude = smooth, expanded, powerful field. Fear and anger = jagged, contracted, weak field." },
        ]},
        { type: "highlight", text: "You are not just what you eat. You are what you eat, drink, breathe, think, and feel — because all of it becomes the electromagnetic signal you broadcast into the world." },
      ]
    },
    {
      id: "resonance", num: "04", title: "Resonance — The Key to Everything", icon: "〰️", color: "#eab308",
      subtitle: "How vibrations sync up and influence each other",
      content: [
        { type: "big", text: "In 1665, Dutch physicist Christiaan Huygens noticed something strange: pendulum clocks hanging on the same wall would synchronize their swings — every time." },
        { type: "p", text: "He had discovered resonance — the tendency of vibrating things to sync up with each other. Strike a tuning fork and hold it near another tuning fork of the same frequency. The second one starts vibrating too, without being touched. The vibration transfers through the air." },
        { type: "p", text: "Your body does this constantly. When you're near someone who is calm, centered, and radiating a coherent electromagnetic field, your nervous system begins to entrain (sync) with theirs. Your heart rhythm smooths out. Your breathing slows. You start to feel what they feel. This is why certain people make you feel peaceful just by being near them." },
        { type: "p", text: "The reverse is also true. Someone radiating stress, anxiety, or anger has a chaotic electromagnetic field. Spend enough time near them and your field starts to mirror theirs. Your heart rate increases. Your muscles tense. You absorb their state — not through words, but through field-to-field electromagnetic resonance." },
        { type: "highlight", text: "This is why 'raise your vibration' isn't just a saying. It's physics. When you elevate the coherence of your own field, you literally pull everyone around you upward through resonance." },
        { type: "p", text: "This also explains why group meditation is more powerful than solo meditation. Why live concerts feel transcendent. Why being in nature calms you down (trees have coherent biofields too). And why a single person in a state of deep love or gratitude can measurably shift the energy of an entire room." },
      ]
    },
    {
      id: "earth", num: "05", title: "You're Plugged Into Earth", icon: "🌍", color: "#f97316",
      subtitle: "The planet has a heartbeat — and you're tuned to it",
      content: [
        { type: "big", text: "The Earth has its own electromagnetic field, generated by molten iron churning in its core. And it pulses." },
        { type: "p", text: "The base frequency of Earth's electromagnetic field is 7.83 Hz — called the Schumann Resonance. It was discovered in 1952 and has been measured continuously ever since. Here's the remarkable part: your brain's alpha waves — the ones you produce when you're calm, aware, and present — operate at almost the exact same frequency." },
        { type: "p", text: "This isn't coincidence. Life on this planet evolved INSIDE Earth's electromagnetic field for billions of years. Your nervous system is literally tuned to the planet's frequency, like a radio tuned to a station. When you walk barefoot on grass, soil, or sand, free electrons from the Earth flow into your body through your feet. These electrons are nature's antioxidants — they neutralize inflammation on contact." },
        { type: "highlight", text: "The Earth is your charger. When you disconnect from it — rubber-soled shoes, concrete buildings, no time in nature — your electrical system loses its reference signal. You become ungrounded in the most literal, physical sense." },
        { type: "p", text: "Studies published in the Journal of Environmental and Public Health show that grounding (earthing) reduces cortisol, improves sleep, normalizes circadian rhythms, and reduces inflammation markers. NASA discovered this the hard way — astronauts in space, cut off from the Schumann Resonance, developed health problems until engineers installed Schumann Resonance generators in spacecraft." },
        { type: "p", text: "The Global Coherence Initiative has even found correlations between mass human emotional events and measurable disturbances in Earth's magnetic field. We don't just live ON the Earth — we are electrically, magnetically, and vibrationally connected TO it." },
      ]
    },
    {
      id: "control", num: "06", title: "Why They Don't Teach This", icon: "🔒", color: "#ef4444",
      subtitle: "An empowered human is harder to control",
      content: [
        { type: "big", text: "If every person understood they were an electromagnetic being whose field influences everyone around them — the entire control structure would collapse." },
        { type: "p", text: "Think about it. The food industry sells you processed products that weaken your cellular energy. The water supply is treated with fluoride — a compound shown to calcify the pineal gland, the very organ ancient traditions considered the seat of consciousness. The pharmaceutical industry profits from treating symptoms, not from teaching you that your body is a self-healing electrical system. The media keeps you in a constant state of fear — which contracts your biofield and makes you easier to influence." },
        { type: "p", text: "None of this is conspiracy theory. It's incentive structure. There is no profit in a population that knows how to heal itself, generate its own energy, grow its own food, and maintain a coherent biofield through free practices like breathwork, meditation, grounding, and gratitude." },
        { type: "highlight", text: "The most revolutionary act in the modern world is to take complete responsibility for your own energy — what you consume, what you think, what you feel, and what you emit." },
        { type: "p", text: "That's what this platform exists for. Not to tell you what to believe, but to give you the tools, the science, and the community to explore these truths for yourself. Every section on RTV33 connects back to this foundation: you are energy, your energy is influenced by what you allow in, and the energy you cultivate is the reality you create — not just for yourself, but for every field your field touches." },
      ]
    },
    {
      id: "now", num: "07", title: "What You Can Do Right Now", icon: "⚡", color: "#00ff8c",
      subtitle: "Simple practices that change your frequency today",
      content: [
        { type: "big", text: "You don't need to buy anything, go anywhere, or believe anything. You just need to start." },
        { type: "list", items: [
          { label: "Breathe", text: "Right now — breathe in for 5 seconds, hold for 5, out for 5. Do this for 2 minutes. You just shifted your nervous system from sympathetic (stress) to parasympathetic (heal). Your biofield expanded. That's real." },
          { label: "Ground", text: "Take off your shoes and stand on earth — grass, dirt, sand — for 20 minutes. Free electrons will flow into your body and begin neutralizing inflammation. You will feel the difference." },
          { label: "Hydrate", text: "Drink clean water. If you can, filter out the fluoride and chlorine. If you can't do that today, at least drink more water. Your electrical signals depend on it." },
          { label: "Feel gratitude", text: "Not as a platitude — as a practice. Think of one thing you're genuinely grateful for and FEEL it in your chest for 60 seconds. HeartMath research shows this creates immediate coherence in your heart's electromagnetic field." },
          { label: "Eat something alive", text: "A piece of fruit. A handful of greens. Something that was recently growing. Living food carries biophotons — light energy stored by the sun. You are literally eating light." },
          { label: "Step outside", text: "Sunlight hitting your skin triggers vitamin D production, regulates your circadian rhythm, and charges your body with photonic energy. 15 minutes. No sunscreen needed for that." },
          { label: "Be still", text: "Sit in silence for 5 minutes. No phone. No music. Just you, breathing, existing. In the silence, your mind stops consuming and starts receiving. This is where intuition lives." },
        ]},
        { type: "highlight", text: "Every one of these practices is free, available right now, and backed by peer-reviewed science. The system charges you for things that lower your vibration and hides the things that raise it for free." },
      ]
    },
  ];

  // Chapter detail view
  if (activeChapter) {
    const ch = chapters.find(c => c.id === activeChapter);
    return (
      <div style={{ animation: "fadeInUp 0.4s ease" }}>
        <button onClick={() => setActiveChapter(null)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", marginBottom: 24 }}>← BACK TO EN3RGY 101</button>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
          <div style={{ width: 50, height: 50, borderRadius: 12, background: `${ch.color}15`, border: `1px solid ${ch.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{ch.icon}</div>
          <div>
            <span style={{ fontSize: 10, color: ch.color, fontFamily: "'Orbitron', sans-serif", letterSpacing: 3 }}>CHAPTER {ch.num}</span>
            <h2 style={{ fontSize: 24, fontWeight: 600, color: "#fff", fontFamily: "'Orbitron', sans-serif", margin: 0, letterSpacing: 1 }}>{ch.title}</h2>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>{ch.subtitle}</p>

        <GlassCard hover={false} style={{ maxWidth: 720, padding: "32px 28px" }}>
          {ch.content.map((block, i) => {
            if (block.type === "big") return <h3 key={i} style={{ fontSize: 20, fontWeight: 400, color: "#fff", fontFamily: "'Sora', sans-serif", lineHeight: 1.6, marginBottom: 20 }}>{block.text}</h3>;
            if (block.type === "highlight") return (
              <div key={i} style={{ margin: "24px 0", padding: "20px 24px", borderRadius: 12, background: `${ch.color}08`, borderLeft: `3px solid ${ch.color}`, }}>
                <p style={{ fontSize: 15, color: ch.color, lineHeight: 1.9, margin: 0, fontWeight: 500 }}>{block.text}</p>
              </div>
            );
            if (block.type === "list") return (
              <div key={i} style={{ margin: "16px 0" }}>
                {block.items.map((item, j) => (
                  <div key={j} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: ch.color, marginTop: 8, flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>{item.label}</span>
                      <span style={{ fontSize: 14, color: "rgba(255,255,255,0.55)" }}> — {item.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
            return <p key={i} style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 2.1, marginBottom: 16 }}>{block.text}</p>;
          })}
        </GlassCard>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          {(() => {
            const idx = chapters.findIndex(c => c.id === activeChapter);
            const prev = idx > 0 ? chapters[idx - 1] : null;
            const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;
            return (
              <>
                {prev ? <button onClick={() => setActiveChapter(prev.id)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>← {prev.title}</button> : <div />}
                {next ? <button onClick={() => setActiveChapter(next.id)} style={{ background: `${next.color}10`, border: `1px solid ${next.color}30`, color: next.color, padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>{next.title} →</button> : (
                  <button onClick={() => setActiveTab("biofield")} style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>NEXT: BIO FI3LD →</button>
                )}
              </>
            );
          })()}
        </div>
      </div>
    );
  }

  // Main chapter list
  return (
    <div style={{ animation: "fadeInUp 0.5s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <div style={{ width: 3, height: 28, background: "linear-gradient(to bottom, #06b6d4, #eab308, #ef4444)", borderRadius: 2 }} />
        <h2 style={{ fontSize: 22, fontWeight: 300, color: "#fff", fontFamily: "'Sora', sans-serif", margin: 0 }}>EN3RGY 101</h2>
      </div>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, marginTop: 8, marginBottom: 12 }}>
        The foundation of everything on this platform. Start here.
      </p>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.8, marginBottom: 32 }}>
        Seven chapters that explain — in simple, clear language — why you are energy, how your body's electromagnetic field works, why what you consume matters at the atomic level, and how your personal vibration shapes the reality around you. No jargon. No gatekeeping. Just truth.
      </p>

      {/* Chapter list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {chapters.map((ch, idx) => (
          <GlassCard key={ch.id} onClick={() => setActiveChapter(ch.id)} style={{
            cursor: "pointer", display: "flex", alignItems: "center", gap: 20,
            borderLeft: `3px solid ${ch.color}`, padding: "22px 24px",
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: 12,
              background: `${ch.color}12`, border: `1px solid ${ch.color}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, flexShrink: 0,
            }}>{ch.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: ch.color, fontFamily: "'Orbitron', sans-serif", letterSpacing: 2 }}>CHAPTER {ch.num}</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0, fontFamily: "'Sora', sans-serif" }}>{ch.title}</h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>{ch.subtitle}</p>
            </div>
            <span style={{ fontSize: 11, color: ch.color, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", flexShrink: 0 }}>READ →</span>
          </GlassCard>
        ))}
      </div>

      {/* Where to go next */}
      <div style={{ marginTop: 32, padding: 28, borderRadius: 16, background: "linear-gradient(135deg, rgba(6,182,212,0.06), rgba(167,139,250,0.06), rgba(234,179,8,0.06))", border: "1px solid rgba(6,182,212,0.1)", textAlign: "center" }}>
        <span style={{ fontSize: 10, letterSpacing: 4, color: "#06b6d4", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 12 }}>⟡ AFTER EN3RGY 101</span>
        <h3 style={{ fontSize: 18, color: "#fff", fontWeight: 400, marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>Ready to go deeper?</h3>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, maxWidth: 500, margin: "0 auto 20px" }}>
          Now that you understand the foundation, explore how your biofield responds to emotions, learn how to heal your organs with herbs, or dive into the suppressed science they don't want you to know.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setActiveTab("biofield")} style={{ padding: "10px 22px", borderRadius: 8, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa", cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>◐ BIO FI3LD</button>
          <button onClick={() => setActiveTab("healing")} style={{ padding: "10px 22px", borderRadius: 8, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>❋ H3ALING</button>
          <button onClick={() => setActiveTab("wakeup")} style={{ padding: "10px 22px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>◉ WAKE UP</button>
          <button onClick={() => setActiveTab("knowledge")} style={{ padding: "10px 22px", borderRadius: 8, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4", cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>⬡ KNOWLEDGE</button>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// E-MOTIONS — Energy in Motion
// ═══════════════════════════════════════════════════════════════

function EmotionEnvironment({ emotion }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const emotionRef = useRef(emotion);

  useEffect(() => { emotionRef.current = emotion; }, [emotion]);

  const emotionData = {
    love:      { h: 340, particles: 120, speed: 0.4, size: 3, gravity: -0.2, spread: 1, trail: 0.03, bg: [20, 5, 15] },
    gratitude: { h: 50,  particles: 100, speed: 0.3, size: 2.5, gravity: -0.15, spread: 0.9, trail: 0.025, bg: [15, 12, 5] },
    joy:       { h: 45,  particles: 140, speed: 0.8, size: 2, gravity: -0.3, spread: 1.3, trail: 0.04, bg: [18, 15, 5] },
    peace:     { h: 200, particles: 60,  speed: 0.15, size: 3.5, gravity: 0, spread: 0.7, trail: 0.015, bg: [5, 12, 18] },
    courage:   { h: 25,  particles: 90,  speed: 0.6, size: 2.5, gravity: -0.1, spread: 1.1, trail: 0.035, bg: [18, 8, 5] },
    neutral:   { h: 180, particles: 50,  speed: 0.2, size: 2, gravity: 0, spread: 0.5, trail: 0.02, bg: [8, 8, 10] },
    sadness:   { h: 220, particles: 40,  speed: 0.1, size: 1.5, gravity: 0.3, spread: 0.3, trail: 0.01, bg: [5, 5, 12] },
    fear:      { h: 0,   particles: 70,  speed: 1.5, size: 1, gravity: 0.5, spread: 0.4, trail: 0.06, bg: [10, 5, 5] },
    anger:     { h: 0,   particles: 100, speed: 2.0, size: 1.5, gravity: 0, spread: 0.6, trail: 0.07, bg: [15, 3, 3] },
    shame:     { h: 270, particles: 25,  speed: 0.05, size: 1, gravity: 0.6, spread: 0.2, trail: 0.008, bg: [6, 4, 8] },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = 700, h = 400;
    canvas.width = w * 2; canvas.height = h * 2;
    ctx.scale(2, 2);

    let pts = [];
    const initParticles = (count) => Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
      life: Math.random(), phase: Math.random() * Math.PI * 2,
    }));
    pts = initParticles(120);

    const draw = (time) => {
      const t = time * 0.001;
      const e = emotionData[emotionRef.current] || emotionData.neutral;

      // Background — environment changes color
      ctx.fillStyle = `rgba(${e.bg[0]}, ${e.bg[1]}, ${e.bg[2]}, ${0.08 + e.trail})`;
      ctx.fillRect(0, 0, w, h);

      // Ensure right particle count
      while (pts.length < e.particles) pts.push({ x: Math.random() * w, y: h + 10, vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 2, life: 1, phase: Math.random() * Math.PI * 2 });
      if (pts.length > e.particles + 20) pts.splice(e.particles);

      // Environment elements based on emotion
      const cx = w / 2, cy = h / 2;

      // Central energy source
      const pulseR = 30 + Math.sin(t * (0.5 + e.speed)) * 15 * e.spread;
      const sourceGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR * 3);
      sourceGrad.addColorStop(0, `hsla(${e.h}, 80%, 60%, 0.15)`);
      sourceGrad.addColorStop(0.5, `hsla(${e.h}, 70%, 50%, 0.05)`);
      sourceGrad.addColorStop(1, "transparent");
      ctx.fillStyle = sourceGrad;
      ctx.fillRect(0, 0, w, h);

      // Energy rings emanating outward
      for (let ring = 0; ring < 5; ring++) {
        const ringT = (t * e.speed * 0.5 + ring * 0.4) % 3;
        const ringR = ringT * 100 * e.spread;
        const ringAlpha = Math.max(0, (1 - ringT / 3) * 0.15);
        if (ringAlpha > 0.01) {
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${e.h}, 70%, 55%, ${ringAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Particles — energy flowing
      pts.forEach(p => {
        // Movement physics change with emotion
        const dx = cx - p.x, dy = cy - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;

        // High-vibe emotions: particles rise, expand, glow
        // Low-vibe emotions: particles fall, contract, dim
        p.vx += Math.sin(t + p.phase) * e.speed * 0.1;
        p.vy += e.gravity * 0.1 + Math.cos(t * 0.7 + p.phase) * e.speed * 0.05;

        // Spread from center
        if (dist < 150) {
          const force = (150 - dist) / 150 * e.spread * 0.3;
          p.vx += (p.x - cx) / dist * force;
          p.vy += (p.y - cy) / dist * force;
        }

        p.vx *= 0.98; p.vy *= 0.98;
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > e.speed * 3) { p.vx *= (e.speed * 3) / spd; p.vy *= (e.speed * 3) / spd; }

        p.x += p.vx; p.y += p.vy;
        p.life -= 0.002;

        // Wrap / respawn
        if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20 || p.life <= 0) {
          p.x = cx + (Math.random() - 0.5) * 100;
          p.y = cy + (Math.random() - 0.5) * 100;
          p.vx = (Math.random() - 0.5) * e.speed * 2;
          p.vy = (Math.random() - 0.5) * e.speed * 2;
          p.life = 1;
        }

        const alpha = p.life * 0.7;
        const hue = (e.h + Math.sin(p.phase + t) * 20) % 360;
        const sz = e.size * (0.5 + p.life * 0.5);

        ctx.beginPath();
        ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 75%, 60%, ${alpha})`;
        ctx.shadowColor = `hsla(${hue}, 80%, 55%, ${alpha * 0.6})`;
        ctx.shadowBlur = 8 + e.size * 2;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Connection lines for high-vibe states
      if (["love", "gratitude", "joy", "peace", "courage"].includes(emotionRef.current)) {
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < Math.min(pts.length, i + 8); j++) {
            const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
            const d = dx * dx + dy * dy;
            if (d < 6000) {
              ctx.beginPath();
              ctx.moveTo(pts[i].x, pts[i].y);
              ctx.lineTo(pts[j].x, pts[j].y);
              ctx.strokeStyle = `hsla(${e.h}, 60%, 55%, ${(1 - d / 6000) * 0.08})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      // Label overlay
      const labelData = {
        love: "LOVE — 528Hz — Expansion — Creation",
        gratitude: "GRATITUDE — Coherence — Attraction — Abundance",
        joy: "JOY — High Frequency — Magnetic — Radiant",
        peace: "PEACE — Theta State — Infinite — Still",
        courage: "COURAGE — Action — Breakthrough — Fire",
        neutral: "NEUTRAL — Baseline — Potential — Waiting",
        sadness: "SADNESS — Contraction — Inward — Processing",
        fear: "FEAR — Chaos — Fragmentation — Survival",
        anger: "ANGER — Explosive — Destructive — Consuming",
        shame: "SHAME — Collapse — Smallest Field — Disconnection",
      };

      ctx.fillStyle = `hsla(${e.h}, 60%, 55%, 0.4)`;
      ctx.font = "10px 'Orbitron', sans-serif";
      ctx.textAlign = "center";
      ctx.letterSpacing = "3px";
      ctx.fillText(labelData[emotionRef.current] || "", cx, h - 15);

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "auto", aspectRatio: "7/4", borderRadius: 12 }} />;
}

const EMOTION_SCALE = [
  { id: "love", name: "Love", freq: "528Hz+", hz: 528, color: "#ec4899", icon: "💗", level: 10, desc: "The highest sustained vibration. At 528Hz, you become a creator — your field magnetically attracts reality to match your inner state. Miracles live here." },
  { id: "gratitude", name: "Gratitude", freq: "480Hz+", hz: 480, color: "#eab308", icon: "🙏", level: 9, desc: "The shortcut to creation. Gratitude tells the universe you already have what you asked for. Your heart field becomes coherent and your biofield expands to its maximum." },
  { id: "joy", name: "Joy", freq: "440Hz+", hz: 440, color: "#f97316", icon: "✨", level: 8, desc: "Pure high-frequency energy. Joy is magnetic — people, opportunities, and synchronicities are drawn to you like iron filings to a magnet. Reality bends around joy." },
  { id: "peace", name: "Peace", freq: "396Hz+", hz: 396, color: "#06b6d4", icon: "🕊️", level: 7, desc: "The still point. In deep peace, you access theta brainwaves and the quantum field. Manifestation requires no effort here — you simply allow." },
  { id: "courage", name: "Courage", freq: "350Hz+", hz: 350, color: "#f59e0b", icon: "🔥", level: 6, desc: "The threshold where you stop being a victim and become a creator. Courage is the energy of action — the motion that transforms inner vision into outer reality." },
  { id: "neutral", name: "Neutral", freq: "250Hz", hz: 250, color: "#78716c", icon: "😐", level: 5, desc: "Neither creating nor destroying. Potential energy — like a ball at the top of a hill. From here, your next emotion determines everything." },
  { id: "sadness", name: "Sadness", freq: "150Hz", hz: 150, color: "#6366f1", icon: "💧", level: 4, desc: "Energy pulling inward. Sadness contracts your field close to your body. You become less visible electromagnetically. But sadness also purifies — it's the rain that clears the sky." },
  { id: "fear", name: "Fear", freq: "100Hz", hz: 100, color: "#94a3b8", icon: "😰", level: 3, desc: "Survival frequency. Your field fragments. Your body floods with cortisol. You radiate chaos that other people's nervous systems pick up instantly. Fear is contagious." },
  { id: "anger", name: "Anger", freq: "75Hz", hz: 75, color: "#ef4444", icon: "🔥", level: 2, desc: "Destructive energy in motion. Anger is powerful but corrosive — it burns everything, including the vessel. Sustained anger deteriorates cells, organs, and relationships." },
  { id: "shame", name: "Shame", freq: "20Hz", hz: 20, color: "#581c87", icon: "🕳️", level: 1, desc: "The lowest vibration. Your field almost disappears. You become electromagnetically invisible. Shame is the opposite of creation — it's energetic death while still alive." },
];

function EmotionsSection() {
  const [selectedEmotion, setSelectedEmotion] = useState("neutral");
  const [activeLesson, setActiveLesson] = useState(null);

  const currentEmotion = EMOTION_SCALE.find(e => e.id === selectedEmotion);
  const isHigh = currentEmotion?.level >= 6;

  const lessons = [
    {
      id: "what", title: "E-Motion = Energy in Motion", icon: "〰️", color: "#00ff8c",
      content: [
        { type: "big", text: "The word 'emotion' literally means energy in motion." },
        { type: "p", text: "Break it apart: E-MOTION. Energy. In. Motion. Every emotion you feel is not just a thought or a chemical reaction — it's a specific frequency of energy moving through your body and radiating outward through your electromagnetic field." },
        { type: "p", text: "When you feel love, energy moves in smooth, coherent, expansive waves. When you feel fear, energy moves in jagged, chaotic, contracted bursts. The MOTION of the energy is determined by the EMOTION you're experiencing. They are the same thing." },
        { type: "highlight", text: "You are not a body having emotions. You are energy choosing which direction to move." },
        { type: "p", text: "This is why you can feel someone's anger before they speak. This is why a baby can feel its mother's anxiety. This is why walking into a funeral feels different from walking into a celebration. The energy is MOVING differently in each space — and your body is an antenna that detects it instantly." },
        { type: "p", text: "Every moment, you are choosing the direction of your energy. Most people let external events choose for them — something happens, and they react. But the masters throughout history all taught the same thing: choose the emotion FIRST, and the events rearrange to match it." },
      ]
    },
    {
      id: "manifest", title: "Emotion → Manifestation", icon: "🎯", color: "#eab308",
      content: [
        { type: "big", text: "You don't attract what you want. You attract what you ARE." },
        { type: "p", text: "Manifestation isn't about thinking hard enough about something. It's about matching the FREQUENCY of what you want. And frequency is determined by emotion." },
        { type: "p", text: "Think about it: you can visualize a million dollars all day long, but if you FEEL broke, desperate, and anxious while you do it — what frequency are you broadcasting? Scarcity. Lack. Fear. And the universe, being a mirror of electromagnetic fields, reflects that frequency right back to you." },
        { type: "p", text: "Now flip it. You don't have to pretend you have a million dollars. But you CAN choose to feel gratitude for what you DO have. You CAN choose to feel the joy of being alive. You CAN choose love over fear. And when you sustain those emotions — those FREQUENCIES — reality literally has no choice but to reorganize around you." },
        { type: "highlight", text: "The emotion you sustain is the signal you broadcast. The signal you broadcast is the reality you receive. Change the emotion, change the broadcast, change the reality." },
        { type: "p", text: "This isn't magic — it's physics. The reticular activating system in your brain filters reality to match your dominant emotional state. Your biofield attracts or repels based on coherence. And at the quantum level, the observer effect means your energetic state literally influences which probabilities collapse into your experienced reality." },
      ]
    },
    {
      id: "sync", title: "Synchronicity — The Signal", icon: "🔗", color: "#a78bfa",
      content: [
        { type: "big", text: "Synchronicities are not coincidences. They're confirmation that your frequency is aligned." },
        { type: "p", text: "You think of someone and they call. You need an answer and a book falls open to the right page. You take a 'wrong' turn and it leads to exactly what you needed. These aren't random — they're resonance events." },
        { type: "p", text: "When your emotional frequency is coherent and high, you become a tuning fork. You start resonating with people, places, and events that match your frequency. They literally find you because your electromagnetic signal is pulling them in — like how a radio tuned to 101.5 FM only picks up 101.5 FM." },
        { type: "p", text: "Jung called it synchronicity. Quantum physics calls it non-local correlation. Ancient traditions called it 'being in the flow.' It's all the same phenomenon: when your internal energy is moving coherently, external reality reorganizes to match." },
        { type: "highlight", text: "The more synchronicities you experience, the more evidence you have that your vibration is aligned. They are the universe's way of saying: you're on the right frequency. Keep going." },
        { type: "p", text: "And here's the key most people miss: synchronicities increase in proportion to your emotional coherence, not your mental effort. You can't THINK your way into synchronicity. You have to FEEL your way there. The heart leads. The mind follows. Reality conforms." },
      ]
    },
    {
      id: "route", title: "Choosing Your Route of Energy", icon: "🛤️", color: "#22c55e",
      content: [
        { type: "big", text: "Every moment is a crossroads. Your emotion chooses the path. The path determines the destination." },
        { type: "p", text: "Imagine your life as a river system. At every moment, the river forks. One fork leads toward creation, expansion, and alignment. The other leads toward destruction, contraction, and chaos. Your emotion — the direction of your energy in that moment — determines which fork you take." },
        { type: "p", text: "This isn't about toxic positivity. Sadness, grief, even anger have their place — they're processing frequencies. The danger isn't feeling them. The danger is LIVING in them. When you set up permanent residence in a low-frequency emotion, you're choosing that fork over and over until it becomes a canyon too deep to easily climb out of." },
        { type: "p", text: "The route of energy you take most often becomes your dominant frequency. Your dominant frequency becomes your identity. Your identity becomes your reality. This is how people 'become' angry people, anxious people, joyful people. It was never their personality — it was their most practiced emotional route." },
        { type: "highlight", text: "You are not your emotions. You are the one who chooses which emotion to sustain. That choice — made moment to moment — is the most powerful creative act in the universe." },
        { type: "p", text: "The beautiful truth: you can change your route at any moment. It doesn't matter how long you've been traveling the fear path or the shame path. One genuine shift to gratitude, one real moment of love, one conscious breath taken in peace — and the river forks again. You choose again. You always get to choose again." },
      ]
    },
    {
      id: "creation", title: "You Are the Creator", icon: "⚡", color: "#f97316",
      content: [
        { type: "big", text: "Creation doesn't happen TO you. Creation happens THROUGH you. Your emotion is the brush. Reality is the canvas." },
        { type: "p", text: "Every culture on Earth has a creation story. In most of them, the universe begins with a sound, a word, a vibration. In the beginning was the Word — and the Word was frequency. Creation IS vibration. And you are a vibrating being capable of creation at every moment." },
        { type: "p", text: "When you feel deep love and hold an intention — you're painting reality with the highest frequency brush. When you feel gratitude for something that hasn't arrived yet — you're creating a blueprint that reality rushes to fill. When you feel the joy of the thing before the thing exists — you're living in the frequency where it already does." },
        { type: "p", text: "This is not wish fulfillment. This is quantum physics meeting ancient wisdom. The observer collapses the wave function. Your conscious attention, powered by emotional energy, collapses infinite possibilities into one experienced reality. You are doing this right now, whether you know it or not." },
        { type: "highlight", text: "The only question that matters: are you creating by default (unconscious emotional reactions) or by design (conscious emotional choices)? One makes you a victim of circumstance. The other makes you the architect of reality." },
        { type: "p", text: "This is why every section of this platform exists. The herbs heal your vessel so it can conduct more energy. The knowledge removes the lies that keep you in low frequencies. The practices train you to choose your emotional state. The biofield section shows you the science. And this section — E-MOTIONS — is where it all connects: your energy, in motion, creating everything." },
      ]
    },
  ];

  if (activeLesson) {
    const lesson = lessons.find(l => l.id === activeLesson);
    return (
      <div style={{ animation: "fadeInUp 0.4s ease" }}>
        <button onClick={() => setActiveLesson(null)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", marginBottom: 24 }}>← BACK TO E-MOTIONS</button>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <span style={{ fontSize: 40 }}>{lesson.icon}</span>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "#fff", fontFamily: "'Orbitron', sans-serif", margin: 0, letterSpacing: 1 }}>{lesson.title}</h2>
        </div>
        <GlassCard hover={false} style={{ maxWidth: 700 }}>
          {lesson.content.map((block, i) => {
            if (block.type === "big") return <h3 key={i} style={{ fontSize: 20, fontWeight: 400, color: "#fff", fontFamily: "'Sora', sans-serif", lineHeight: 1.6, marginBottom: 20 }}>{block.text}</h3>;
            if (block.type === "highlight") return (
              <div key={i} style={{ margin: "24px 0", padding: "20px 24px", borderRadius: 12, background: `${lesson.color}08`, borderLeft: `3px solid ${lesson.color}` }}>
                <p style={{ fontSize: 15, color: lesson.color, lineHeight: 1.9, margin: 0, fontWeight: 500 }}>{block.text}</p>
              </div>
            );
            return <p key={i} style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 2.1, marginBottom: 16 }}>{block.text}</p>;
          })}
        </GlassCard>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          {(() => {
            const idx = lessons.findIndex(l => l.id === activeLesson);
            const prev = idx > 0 ? lessons[idx - 1] : null;
            const next = idx < lessons.length - 1 ? lessons[idx + 1] : null;
            return (<>
              {prev ? <button onClick={() => setActiveLesson(prev.id)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>← {prev.title}</button> : <div />}
              {next ? <button onClick={() => setActiveLesson(next.id)} style={{ background: `${next.color}10`, border: `1px solid ${next.color}30`, color: next.color, padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>{next.title} →</button> : <div />}
            </>);
          })()}
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeInUp 0.5s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <div style={{ width: 3, height: 28, background: "linear-gradient(to bottom, #ec4899, #eab308, #06b6d4)", borderRadius: 2 }} />
        <h2 style={{ fontSize: 22, fontWeight: 300, color: "#fff", fontFamily: "'Sora', sans-serif", margin: 0 }}>E-MOTIONS</h2>
      </div>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, marginTop: 8, marginBottom: 6 }}>
        Energy in Motion. Every emotion is a frequency — a specific pattern of energy moving through you and radiating outward. The emotion you choose determines the reality you create.
      </p>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", lineHeight: 1.7, marginBottom: 28 }}>
        Select an emotion below and watch how it transforms the energy environment in real time. Then read the lessons to understand why this matters for manifestation, synchronicity, and creation.
      </p>

      {/* Environment Visualizer */}
      <GlassCard hover={false} style={{ marginBottom: 24, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 10, letterSpacing: 3, color: currentEmotion?.color, fontFamily: "'Orbitron', sans-serif", transition: "color 0.5s ease" }}>ENERGY ENVIRONMENT — {currentEmotion?.name.toUpperCase()}</span>
          <span style={{ fontSize: 11, color: currentEmotion?.color, fontFamily: "'JetBrains Mono', monospace", transition: "color 0.5s ease" }}>{currentEmotion?.freq}</span>
        </div>
        <EmotionEnvironment emotion={selectedEmotion} />
      </GlassCard>

      {/* Emotion Selector */}
      <GlassCard hover={false} style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 16 }}>SELECT AN EMOTION — WATCH THE ENVIRONMENT CHANGE</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {EMOTION_SCALE.map(e => (
            <div key={e.id} onClick={() => setSelectedEmotion(e.id)} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
              borderRadius: 10, cursor: "pointer", transition: "all 0.3s ease",
              background: selectedEmotion === e.id ? `${e.color}12` : "transparent",
              border: `1px solid ${selectedEmotion === e.id ? `${e.color}30` : "transparent"}`,
            }}>
              <span style={{ fontSize: 20 }}>{e.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: selectedEmotion === e.id ? "#fff" : "rgba(255,255,255,0.5)", transition: "color 0.3s" }}>{e.name}</span>
                  <span style={{ fontSize: 10, color: e.color, fontFamily: "'JetBrains Mono', monospace" }}>{e.freq}</span>
                </div>
                {selectedEmotion === e.id && (
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: "6px 0 0", animation: "fadeInUp 0.3s ease" }}>{e.desc}</p>
                )}
              </div>
              {/* Frequency bar */}
              <div style={{ width: 80, height: 4, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${e.level * 10}%`, height: "100%", background: e.color, borderRadius: 2, boxShadow: `0 0 6px ${e.color}44`, transition: "width 0.5s ease" }} />
              </div>
              <span style={{ fontSize: 10, color: e.color, fontFamily: "'Orbitron', sans-serif", width: 20, textAlign: "right" }}>{e.level}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* What's happening panel */}
      <GlassCard hover={false} style={{ marginBottom: 28, borderLeft: `3px solid ${currentEmotion?.color}`, transition: "all 0.5s ease" }}>
        <span style={{ fontSize: 10, letterSpacing: 3, color: currentEmotion?.color, fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 10, transition: "color 0.5s ease" }}>⟡ WHAT'S HAPPENING TO YOUR ENERGY</span>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.9, margin: 0 }}>
          {isHigh
            ? `At the frequency of ${currentEmotion?.name.toLowerCase()}, your energy is moving outward — expanding, connecting, creating. Particles in the visualizer above flow upward and form coherent connections. This is what's happening to your biofield right now when you genuinely feel ${currentEmotion?.name.toLowerCase()}. Your electromagnetic signal becomes magnetic. Reality reorganizes around you.`
            : selectedEmotion === "neutral"
            ? "At neutral, your energy is potential — neither creating nor destroying. Like a ball balanced at the top of a hill, the next emotion you choose determines everything. This is the launchpad. What will you choose to feel?"
            : `At the frequency of ${currentEmotion?.name.toLowerCase()}, your energy is contracting inward. Particles fall, disconnect, and scatter. Your biofield shrinks close to your body. This is what happens energetically when you sustain ${currentEmotion?.name.toLowerCase()} — your creative power diminishes, your signal weakens, and reality reflects that contraction back to you. The way out: one conscious choice to shift upward.`
          }
        </p>
      </GlassCard>

      {/* Deep Dive Lessons */}
      <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 14 }}>UNDERSTAND THE POWER</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        {lessons.map(lesson => (
          <GlassCard key={lesson.id} onClick={() => setActiveLesson(lesson.id)} style={{
            flex: "1 1 260px", minWidth: 240, cursor: "pointer", borderTop: `2px solid ${lesson.color}40`,
          }}>
            <span style={{ fontSize: 28, display: "block", marginBottom: 10 }}>{lesson.icon}</span>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", fontFamily: "'Orbitron', sans-serif", margin: "0 0 6px", letterSpacing: 1 }}>{lesson.title}</h3>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.6, margin: "0 0 12px" }}>{lesson.content.find(c => c.type === "p")?.text.substring(0, 100)}...</p>
            <span style={{ fontSize: 10, color: lesson.color, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>READ →</span>
          </GlassCard>
        ))}
      </div>

      {/* Bottom quote */}
      <div style={{ marginTop: 32, padding: 24, borderRadius: 14, background: "linear-gradient(135deg, rgba(236,72,153,0.05), rgba(234,179,8,0.05), rgba(6,182,212,0.05))", border: "1px solid rgba(236,72,153,0.08)", textAlign: "center" }}>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.9, fontStyle: "italic", margin: "0 0 8px" }}>
          "Everything is energy and that's all there is to it. Match the frequency of the reality you want and you cannot help but get that reality. It can be no other way."
        </p>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>— Often attributed to Albert Einstein</span>
      </div>
    </div>
  );
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


// ═══════════════════════════════════════════════════════════════
// R3ALITY HACKS — Off-Grid Tech, Sovereignty & Life Cheat Codes
// ═══════════════════════════════════════════════════════════════

const HACK_CATEGORIES = [
  // ─── ENERGY & POWER ───
  {
    id: "earth-battery", icon: "🔋", title: "Earth Batteries & Free Power", color: "#eab308", group: "ENERGY & POWER",
    desc: "The Earth is a giant battery. These devices tap into the electrical potential between soil and atmosphere to generate usable power — no grid required.",
    items: [
      { title: "Basic Earth Battery — Copper & Zinc", desc: "Bury a copper pipe and a zinc pipe 3 feet apart in moist soil. Connect with wire. You now have a battery generating 0.5-1.1 volts from the Earth's electrochemical energy. Stack multiple cells in series for usable voltage. Pioneers ran telegraph lines on Earth batteries in the 1800s.", difficulty: "Beginner", cost: "$10-20" },
      { title: "The Laskey Earth Battery", desc: "An advanced design using multiple copper and galvanized steel rods in a specific pattern. Can generate enough power to charge phones, run LED lights, and power small devices. Documented by experimenters generating 5-12V continuously from soil alone.", difficulty: "Intermediate", cost: "$30-60" },
      { title: "Atmospheric Energy Harvesting", desc: "Nathan Stubblefield's 1898 patent for extracting electricity from the ground. Tesla's experiments with ground currents. The atmosphere is charged to approximately 200-400V per meter of altitude. This voltage differential is free, everywhere, and continuously replenished.", difficulty: "Advanced", cost: "$50-200" },
      { title: "Crystal Radio — Zero Power", desc: "Build a radio that runs on the energy of the radio waves themselves. No battery, no power source — just a coil, a diode, an earphone, and an antenna. Proves the air is full of harvestable electromagnetic energy.", difficulty: "Beginner", cost: "$10" },
      { title: "Bedini Motor — Overunity Claims", desc: "John Bedini's pulsed motor design that charges batteries while running. Pulsed DC creates a back-EMF spike captured into a charging battery. Multiple independent replicators report output exceeding input.", difficulty: "Advanced", cost: "$50-150" },
    ]
  },
  {
    id: "water-tech", icon: "💧", title: "HHO & Water Engines", color: "#06b6d4", group: "ENERGY & POWER",
    desc: "Water is hydrogen and oxygen — the most abundant fuel in the universe. Split it, restructure it, or run engines on it.",
    items: [
      { title: "HHO Generator for Your Car", desc: "Electrolysis splits water into hydrogen and oxygen gas (HHO/Brown's Gas). This gas supplements your car's fuel system, reducing consumption by 15-40%. Basic cell uses stainless steel plates in water/electrolyte connected to car battery.", difficulty: "Intermediate", cost: "$50-200" },
      { title: "Stanley Meyer's Water Fuel Cell", desc: "Meyer ran a dune buggy on water alone using resonant electrolysis. His patents are public. He was offered $1 billion to shelve it, refused, and died suddenly in 1998. Multiple replicators working to reproduce results.", difficulty: "Advanced", cost: "$100-500" },
      { title: "Joe Cell — Orgone Water Fuel", desc: "Australian invention using concentric stainless steel cylinders in water, charged to create orgone energy. Claims of vehicles running on the cell's energy field without fuel connection. Highly controversial but with documented builds.", difficulty: "Advanced", cost: "$100-300" },
      { title: "Water Vortexing — Structured Water DIY", desc: "Viktor Schauberger observed water in nature moves in vortices. Running water through a vortex device restructures it. DIY: two bottles connected at the mouth, swirl vigorously. Structured water hydrates cells more efficiently.", difficulty: "Beginner", cost: "$0-30" },
      { title: "Copper Water Purification", desc: "Store water in pure copper vessels for 8+ hours. Oligodynamic effect kills 99.7% of bacteria. Ayurveda has recommended this for 5,000 years. Modern studies confirm antimicrobial action plus trace mineral supplementation.", difficulty: "Beginner", cost: "$20-40" },
    ]
  },
  // ─── COPPER & SCALAR TECH ───
  {
    id: "pyramids", icon: "🔺", title: "Copper Pyramids", color: "#f97316", group: "COPPER & SCALAR",
    desc: "The pyramid shape concentrates and amplifies energy. Build copper pyramids for meditation, plant growth, water charging, and environmental energizing.",
    items: [
      { title: "Meditation Pyramid Build Guide", desc: "Build to Giza proportions (base-to-height ratio 1.5708) using 1/2 inch copper tubing. The focused energy zone is at 1/3 height. Sit inside for deeper meditation. Align one face to magnetic north. Many report visual phenomena and accelerated healing.", difficulty: "Intermediate", cost: "$60-200" },
      { title: "Russian Pyramid Research", desc: "44-meter tall fiberglass pyramids in Russia documented: immune improvements in people nearby, reduced seismic activity, increased oil well output, and changes in water conductivity. Patrick Flanagan's research: razor blades stay sharp, food dehydrates instead of rotting.", difficulty: "Research", cost: "Free" },
      { title: "Mini Plant Growth Pyramid", desc: "Small copper pyramid over a potted plant. Plants grow 2-3x faster vs. control plants. The focused energy at 1/3 height stimulates growth. Add a quartz crystal at the apex for amplification.", difficulty: "Beginner", cost: "$15-40" },
      { title: "Nubian Pyramid — Steeper Angles", desc: "The Nubian shape (~72° angle) creates more intense energy concentration. Smaller build, stronger effect per square foot. Used for meditation, crystal charging, and water structuring.", difficulty: "Intermediate", cost: "$40-100" },
      { title: "Tensor Ring + Pyramid Combo", desc: "Place a copper tensor ring at the 1/3 height inside a copper pyramid. The combined toroidal + focused fields create what some call a 'scalar vortex' — a standing wave amplified by both geometries.", difficulty: "Intermediate", cost: "$40-80" },
    ]
  },
  {
    id: "tensor", icon: "⊙", title: "Tensor Rings", color: "#a78bfa", group: "COPPER & SCALAR",
    desc: "Copper wire twisted to sacred measurements creates a toroidal energy field with applications far wider than most realize.",
    items: [
      { title: "What Is a Tensor Ring", desc: "A closed loop of twisted copper wire cut to a sacred cubit length. Generates a toroidal (donut-shaped) field perpendicular to the ring. Measurable effects on water structure, plant growth, pain, and EMF.", difficulty: "Foundation", cost: "Free" },
      { title: "Sacred vs. Lost vs. Royal Cubit", desc: "Sacred Cubit (20.6\"): King's Chamber measurement, best for physical healing. Lost Cubit (23.49\"): etheric resonance. Royal Cubit (28.1\"): Queen's Chamber. Each creates different frequencies.", difficulty: "Foundation", cost: "Free" },
      { title: "DIY Build — Step by Step", desc: "12-gauge solid copper wire. Cut to cubit length. Fold in half. Twist evenly (use a drill). Join ends by twisting/soldering. Test: hold over your palm and feel the subtle energy field.", difficulty: "Beginner", cost: "$5-10" },
      { title: "Water Structuring with Tensor Rings", desc: "Glass of water inside a tensor ring for 20-60 minutes. Measurable changes: lower surface tension, altered pH, different crystal formations. Most people can taste the difference blindfolded.", difficulty: "Beginner", cost: "$5-10" },
      { title: "Pain Relief Applications", desc: "Place directly over area of pain/inflammation. Many report immediate reduction in acute pain. Theory: tensor field restores coherent energy flow, reducing electromagnetic chaos that accompanies injury.", difficulty: "Beginner", cost: "$5-10" },
      { title: "Home EMF Neutralization", desc: "Hang on WiFi router, smart meter, or electrical panel. Place rings in four corners of your room. Many report better sleep, reduced headaches, calmer pets.", difficulty: "Beginner", cost: "$20-40" },
    ]
  },
  // ─── GARDEN & FOOD ───
  {
    id: "electroculture", icon: "🌱", title: "Electroculture & Garden", color: "#22c55e", group: "FOOD SOVEREIGNTY",
    desc: "Use copper, magnetism, and electromagnetic principles to supercharge plant growth without chemicals.",
    items: [
      { title: "Copper Coil Garden Beds", desc: "Wrap 12-gauge solid copper wire around raised beds in a spiral. Creates a weak electromagnetic field that interacts with Earth's field and plant biofields. Documented: faster germination, stronger roots, larger yields. Rodin coil pattern most effective.", difficulty: "Beginner", cost: "$15-40" },
      { title: "Electroculture Antennas", desc: "Copper spiral on a wooden dowel placed in garden beds. Directs atmospheric energy into soil. Farmers in the 1700s-1800s used this before chemical fertilizers made it unprofitable to teach.", difficulty: "Beginner", cost: "$5-10" },
      { title: "Tensor Ring Plant Experiments", desc: "Sacred cubit tensor ring around plant base or hung above. Documented: accelerated growth, increased brix content, pest resistance.", difficulty: "Beginner", cost: "$10-25" },
      { title: "Magnetoculture", desc: "Neodymium magnets in a grid pattern under garden beds. Research from Russia and India: 15-30% yield increases. North pole facing up for growth stimulation.", difficulty: "Intermediate", cost: "$20-50" },
      { title: "Paramagnetic Rock Dust", desc: "Basalt rock dust amplifies Earth's magnetic field locally. Philip Callahan proved the connection between soil paramagnetism and crop vitality.", difficulty: "Beginner", cost: "$15-30" },
    ]
  },
  // ─── LAND & FREEDOM ───
  {
    id: "land", icon: "🏡", title: "Owner Financing & Land", color: "#22c55e", group: "SOVEREIGNTY",
    desc: "You don't need a bank to own land. Creative acquisition strategies that bypass the banking system.",
    items: [
      { title: "Owner Financing 101", desc: "The seller IS the bank. Monthly payments direct to landowner. No credit check. No bank approval. No 30-year interest trap. Search 'owner financing' on LandWatch, Zillow, Craigslist.", difficulty: "Beginner", cost: "Varies" },
      { title: "Contract for Deed", desc: "Seller keeps the deed until paid in full, but you have possession immediately. Lower barrier than traditional purchase. Get it notarized and recorded at county clerk.", difficulty: "Beginner", cost: "Varies" },
      { title: "Tax Lien & Tax Deed Sales", desc: "When owners don't pay taxes, the county auctions the lien or property. Properties sell for $500-5,000 worth 10-50x that. Research your county's tax sale schedule.", difficulty: "Intermediate", cost: "$200+" },
      { title: "Raw Land Strategy", desc: "Raw land (no structures/utilities) is cheapest. Many parcels in the American West/South sell for $1,000-10,000 for 5+ acres with owner financing. Add yurt/tiny home, build solar and well over time.", difficulty: "Beginner", cost: "$1,000-10,000" },
      { title: "Off-Grid Land Checklist", desc: "Water access, solar exposure, road access (legal easement), zoning, soil quality, slope/drainage, county building codes. The freer the county, the freer you are.", difficulty: "Research", cost: "Free" },
      { title: "Adverse Possession", desc: "In many states, openly occupying unused land for 7-20 years qualifies you for legal ownership. Real law — not a loophole. Requirements: continuous, open, exclusive use + paying taxes.", difficulty: "Advanced", cost: "Minimal" },
    ]
  },
  {
    id: "sovereign", icon: "🏛️", title: "Sovereign Citizen & Strawman", color: "#ef4444", group: "SOVEREIGNTY",
    desc: "Understanding your legal status, the corporate government structure, and the difference between a citizen and a sovereign individual.",
    items: [
      { title: "The Strawman Account", desc: "Birth certificate created your name in ALL CAPS (e.g., JOHN DOE) — a legal fiction, a corporate entity separate from you. This 'strawman' is bonded and traded. Understanding the distinction between you (living being) and the legal fiction is the foundation.", difficulty: "Foundation", cost: "Free" },
      { title: "UCC-1 Filing", desc: "A UCC-1 financing statement establishes you as the secured party creditor over your strawman entity. Filed at the state level. Asserts you are the creditor, not the debtor.", difficulty: "Advanced", cost: "$50-200" },
      { title: "Citizen vs. National", desc: "'US Citizen' = subject of the federal corporation (United States Inc., incorporated 1871). 'State National' = living man/woman under the original Constitution. Changes your legal standing, tax obligations, and relationship to government.", difficulty: "Intermediate", cost: "Free" },
      { title: "The Federal Reserve & Your Debt", desc: "In 1933, US went bankrupt and off gold standard. Citizens became collateral. Your birth certificate is a bond pledging your future labor. Social Security is the tracking mechanism.", difficulty: "Foundation", cost: "Free" },
      { title: "Common Law vs. Admiralty Law", desc: "Common Law (land): sovereign unless you harm another. Maritime/Admiralty Law (commerce): corporate entity subject to statutes and codes. Most courtrooms operate in admiralty. Gold-fringed flag is the indicator.", difficulty: "Intermediate", cost: "Free" },
      { title: "Practical Steps", desc: "Revoke voter registration. Get passport. File UCC-1. Create affidavit of sovereignty. Establish private trust. Complex legal area — study thoroughly, connect with experienced practitioners.", difficulty: "Advanced", cost: "Varies" },
    ]
  },
  // ─── MIND & MANIFESTATION ───
  {
    id: "mind", icon: "🧠", title: "Mind Hacks & Reprogramming", color: "#ec4899", group: "MIND & MANIFESTATION",
    desc: "Your subconscious runs 95% of your life. These techniques reprogram it.",
    items: [
      { title: "SATS — State Akin to Sleep", desc: "Neville Goddard's technique: as you're falling asleep (hypnagogic state), replay a short scene that implies your wish fulfilled. Feel it as real. Your subconscious cannot distinguish this from reality and begins reorganizing your world to match. Do it nightly.", difficulty: "Beginner", cost: "Free" },
      { title: "Subliminal Reprogramming", desc: "Play subliminal audio (affirmations below conscious hearing threshold) while sleeping. Your conscious mind can't filter or reject what it can't hear, but your subconscious absorbs it. 21-90 days of consistent use for measurable change.", difficulty: "Beginner", cost: "Free" },
      { title: "Mirror Work — Louise Hay Method", desc: "Look into your own eyes in a mirror and repeat affirmations for 5 minutes daily. This triggers the deepest resistance your ego has — and breaks through it. 'I love and approve of myself' is the foundational statement.", difficulty: "Beginner", cost: "Free" },
      { title: "Theta Brainwave Programming", desc: "Use binaural beats (4-8Hz) to drop into theta state while awake. In theta, the subconscious is directly accessible. Combine with visualization and affirmations for rapid reprogramming.", difficulty: "Intermediate", cost: "Free" },
      { title: "Ho'oponopono — Hawaiian Clearing", desc: "Four phrases repeated internally toward any problem, person, or situation: 'I'm sorry. Please forgive me. Thank you. I love you.' Clears the subconscious data (memories) that create your experienced reality.", difficulty: "Beginner", cost: "Free" },
      { title: "Reality Transurfing — Vadim Zeland", desc: "Russian quantum physicist's framework: reality exists as a space of variations. Your emotional energy selects which variation you experience. Reduce importance (emotional charge) around desires to allow them to manifest without resistance.", difficulty: "Intermediate", cost: "Free" },
    ]
  },
  {
    id: "money", icon: "💰", title: "Financial Freedom Hacks", color: "#eab308", group: "SOVEREIGNTY",
    desc: "The money system is designed to keep you working. These strategies help you exit the debt matrix.",
    items: [
      { title: "Fractional Reserve Banking — How Money Is Created", desc: "Banks create money from nothing when they issue loans. For every $1 deposited, they can lend $9-10 that didn't exist before. You work for money that was typed into existence. Understanding this changes everything about how you view debt.", difficulty: "Foundation", cost: "Free" },
      { title: "Debt Elimination Strategies", desc: "Avalanche method: pay highest interest first. Snowball method: pay smallest balance first. But the real hack: stop acquiring debt. Live below your means. Every dollar of debt is a chain. Cut them.", difficulty: "Beginner", cost: "Free" },
      { title: "Barter & Trade Networks", desc: "Join or create local barter networks. Trade skills, products, and labor without using currency. No taxes on barter in many jurisdictions (verify locally). Time banks, skill shares, and mutual aid networks are growing.", difficulty: "Beginner", cost: "Free" },
      { title: "Precious Metals — Real Money", desc: "Gold and silver are the only constitutional money. FRNs (Federal Reserve Notes) are debt instruments, not money. Stack physical silver and gold as a hedge against currency devaluation. $25/month in silver adds up.", difficulty: "Beginner", cost: "$25+/month" },
      { title: "Multiple Income Streams", desc: "One job = one point of failure. Build 3-7 income streams: freelance skills, digital products, rental income, dividends, content creation, affiliate income, physical products. Financial freedom isn't about earning more — it's about earning from more sources.", difficulty: "Intermediate", cost: "Varies" },
    ]
  },
];

function RealityHacksSection() {
  const [activeCat, setActiveCat] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);
  const [savedHacks, setSavedHacks] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSave = (id) => { setSavedHacks(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };
  const totalItems = HACK_CATEGORIES.reduce((a, c) => a + c.items.length, 0);

  const searchResults = searchTerm ? HACK_CATEGORIES.flatMap(cat =>
    cat.items.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.desc.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(item => ({ ...item, cat }))
  ) : [];

  if (activeCat) {
    const cat = HACK_CATEGORIES.find(c => c.id === activeCat);
    return (
      <div style={{ animation: "fadeInUp 0.4s ease" }}>
        <button onClick={() => { setActiveCat(null); setExpandedItem(null); }} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", marginBottom: 24 }}>← BACK TO R3ALITY HACKS</button>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <span style={{ fontSize: 40 }}>{cat.icon}</span>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "#fff", fontFamily: "'Orbitron', sans-serif", margin: 0, letterSpacing: 1 }}>{cat.title}</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{cat.items.length} hacks</p>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, marginBottom: 28, maxWidth: 650 }}>{cat.desc}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {cat.items.map((item, idx) => {
            const itemId = `${cat.id}-${idx}`;
            const isExpanded = expandedItem === itemId;
            return (
              <GlassCard key={idx} onClick={() => setExpandedItem(isExpanded ? null : itemId)} style={{ borderLeft: `3px solid ${cat.color}`, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0, fontFamily: "'Sora', sans-serif" }}>{item.title}</h3>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 12 }}>
                    {item.difficulty && <span style={{ fontSize: 9, padding: "3px 10px", borderRadius: 6, background: item.difficulty === "Beginner" ? "rgba(34,197,94,0.1)" : item.difficulty === "Intermediate" ? "rgba(234,179,8,0.1)" : item.difficulty === "Advanced" ? "rgba(239,68,68,0.1)" : "rgba(6,182,212,0.1)", color: item.difficulty === "Beginner" ? "#22c55e" : item.difficulty === "Intermediate" ? "#eab308" : item.difficulty === "Advanced" ? "#ef4444" : "#06b6d4", letterSpacing: 1, fontFamily: "'Orbitron', sans-serif" }}>{item.difficulty.toUpperCase()}</span>}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: 0 }}>{isExpanded ? item.desc : item.desc.substring(0, 150) + "..."}</p>
                {isExpanded && (
                  <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center", animation: "fadeInUp 0.3s ease" }}>
                    {item.cost && <span style={{ fontSize: 11, color: cat.color, fontFamily: "'JetBrains Mono', monospace" }}>COST: {item.cost}</span>}
                    <div style={{ flex: 1 }} />
                    <button onClick={(e) => { e.stopPropagation(); toggleSave(itemId); }} style={{ padding: "6px 14px", borderRadius: 6, background: savedHacks.has(itemId) ? `${cat.color}15` : "rgba(255,255,255,0.03)", border: `1px solid ${savedHacks.has(itemId) ? `${cat.color}35` : "rgba(255,255,255,0.06)"}`, color: savedHacks.has(itemId) ? cat.color : "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 10, letterSpacing: 1, fontFamily: "'Orbitron', sans-serif" }}>{savedHacks.has(itemId) ? "★ SAVED" : "☆ SAVE"}</button>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeInUp 0.5s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <div style={{ width: 3, height: 28, background: "linear-gradient(to bottom, #eab308, #22c55e, #ef4444)", borderRadius: 2 }} />
        <h2 style={{ fontSize: 22, fontWeight: 300, color: "#fff", fontFamily: "'Sora', sans-serif", margin: 0 }}>R3ALITY HACKS</h2>
      </div>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, marginTop: 8, marginBottom: 8 }}>
        {totalItems} practical hacks across {HACK_CATEGORIES.length} categories. Off-grid technology, free energy, food sovereignty, land ownership, and legal standing. The cheat codes for reality.
      </p>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", lineHeight: 1.7, marginBottom: 28 }}>
        These are practical, buildable, actionable. Most cost under $100. Some cost nothing. All of them reduce your dependence on systems designed to keep you dependent.
      </p>

      <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search hacks... (copper coil, earth battery, tensor ring, owner financing...)"
        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 20px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "'JetBrains Mono', monospace", marginBottom: 20 }} />

      {searchTerm && searchResults.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 2 }}>{searchResults.length} RESULTS</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {searchResults.slice(0, 6).map((item, i) => (
              <GlassCard key={i} onClick={() => setActiveCat(item.cat.id)} style={{ padding: 16, cursor: "pointer", borderLeft: `3px solid ${item.cat.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{item.title}</span>
                  <span style={{ fontSize: 10, color: item.cat.color }}>{item.cat.icon} {item.cat.title}</span>
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "6px 0 0", lineHeight: 1.5 }}>{item.desc.substring(0, 120)}...</p>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 14, marginBottom: 32, flexWrap: "wrap" }}>
        {[
          { label: "Total Hacks", value: totalItems, color: "#00ff8c" },
          { label: "Categories", value: HACK_CATEGORIES.length, color: "#eab308" },
          { label: "DIY Builds", value: HACK_CATEGORIES.reduce((a, c) => a + c.items.filter(i => i.difficulty === "Beginner" || i.difficulty === "Intermediate").length, 0), color: "#06b6d4" },
          { label: "Saved", value: savedHacks.size, color: "#a78bfa" },
        ].map(s => (
          <div key={s.label} style={{ flex: "1 1 130px", padding: "18px 20px", borderRadius: 12, textAlign: "center", background: `linear-gradient(135deg, ${s.color}08, ${s.color}03)`, border: `1px solid ${s.color}15`, boxShadow: `0 4px 20px ${s.color}08, inset 0 1px 0 rgba(255,255,255,0.03)` }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: "'Orbitron', sans-serif", textShadow: `0 0 20px ${s.color}30` }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 2, textTransform: "uppercase", marginTop: 6, fontFamily: "'Sora', sans-serif", fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category Grid — Grouped */}
      {[...new Set(HACK_CATEGORIES.map(c => c.group))].map(group => (
        <div key={group} style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            <span style={{ fontSize: 10, letterSpacing: 4, color: "rgba(255,255,255,0.25)", fontFamily: "'Orbitron', sans-serif" }}>{group}</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            {HACK_CATEGORIES.filter(c => c.group === group).map(cat => (
              <GlassCard key={cat.id} onClick={() => setActiveCat(cat.id)} style={{ flex: "1 1 280px", minWidth: 260, cursor: "pointer", borderTop: `2px solid ${cat.color}40` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 30 }}>{cat.icon}</span>
                  <span style={{ fontSize: 10, color: cat.color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, background: `${cat.color}12`, padding: "3px 10px", borderRadius: 6 }}>{cat.items.length} HACKS</span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", fontFamily: "'Orbitron', sans-serif", margin: "0 0 6px", letterSpacing: 1 }}>{cat.title}</h3>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: "0 0 12px" }}>{cat.desc.substring(0, 100)}...</p>
                <span style={{ fontSize: 10, color: cat.color, letterSpacing: 3, fontFamily: "'Orbitron', sans-serif", fontWeight: 600, textShadow: `0 0 10px ${cat.color}30` }}>ENTER →</span>
              </GlassCard>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 32, padding: 24, borderRadius: 14, background: "linear-gradient(135deg, rgba(234,179,8,0.05), rgba(34,197,94,0.05))", border: "1px solid rgba(234,179,8,0.08)", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, margin: "0 0 4px" }}>
          "The best way to predict the future is to create it."
        </p>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>— Abraham Lincoln</span>
      </div>

      <div style={{ marginTop: 16, padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>
          Information is for educational and research purposes. Verify legality in your jurisdiction. Exercise discernment with all sovereignty-related filings.
        </p>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// VIB3 SHOP — Marketplace
// ═══════════════════════════════════════════════════════════════

const SHOP_CATEGORIES = [
  { id: "emf", name: "EMF Protection", icon: "🛡️", color: "#06b6d4" },
  { id: "crystals", name: "Crystals & Stones", icon: "💎", color: "#a78bfa" },
  { id: "orgonite", name: "Orgonite & Pyramids", icon: "🔺", color: "#eab308" },
  { id: "copper", name: "Copper Tools", icon: "⚡", color: "#f97316" },
  { id: "sacred", name: "Sacred Geometry", icon: "✡", color: "#ec4899" },
  { id: "herbs", name: "Herbs & Tinctures", icon: "🌿", color: "#22c55e" },
  { id: "water", name: "Water Tech", icon: "💧", color: "#38bdf8" },
  { id: "sound", name: "Sound & Frequency", icon: "🔔", color: "#f472b6" },
  { id: "clothing", name: "Conscious Clothing", icon: "👕", color: "#a3e635" },
  { id: "member", name: "Member Marketplace", icon: "⊛", color: "#00ff8c" },
];

const SHOP_PRODUCTS = [
  // EMF Protection
  { id: 1, cat: "emf", name: "BluShield Tesla Gold Series", price: 499, origPrice: 599, rating: 4.9, reviews: 342, seller: "BluShield Official", verified: true, badge: "BESTSELLER", image: "🛡️", desc: "Portable scalar wave EMF protection. Generates a coherent field that helps your body resist non-native electromagnetic frequencies. Uses Tesla-inspired multi-wave technology.", tags: ["SCALAR", "PORTABLE", "TESLA"] },
  { id: 2, cat: "emf", name: "BluShield Plug-In Home Unit", price: 699, rating: 4.8, reviews: 218, seller: "BluShield Official", verified: true, image: "🏠", desc: "Whole-home EMF protection covering up to 90m radius. Plugs directly into any outlet. Creates a coherent scalar field throughout your living space.", tags: ["HOME", "SCALAR", "PLUG-IN"] },
  { id: 3, cat: "emf", name: "Shungite Phone Plate (Set of 4)", price: 24, rating: 4.6, reviews: 891, seller: "Earth Shields Co", verified: true, image: "📱", desc: "Genuine Karelian shungite phone plates. Shungite contains fullerenes — the only known natural source of C60. Adheres to any phone case.", tags: ["SHUNGITE", "PHONE", "C60"] },
  { id: 4, cat: "emf", name: "Faraday Cage Phone Pouch", price: 35, rating: 4.7, reviews: 456, seller: "SignalBlock", verified: true, image: "📴", desc: "Military-grade EMF blocking pouch. Blocks 99.9% of RF signals including 5G, WiFi, Bluetooth. Stops all tracking when phone is inside.", tags: ["FARADAY", "PRIVACY", "5G"] },

  // Crystals
  { id: 5, cat: "crystals", name: "Amethyst Cathedral Geode (Large)", price: 189, rating: 4.9, reviews: 167, seller: "Crystal Haven", verified: true, badge: "FEATURED", image: "💜", desc: "Hand-selected Brazilian amethyst cathedral. 8-12 inches tall. Crown chakra activation, intuition enhancement, and EMF absorption. Each piece is unique.", tags: ["AMETHYST", "GEODE", "CROWN CHAKRA"] },
  { id: 6, cat: "crystals", name: "Black Tourmaline Raw Chunks (1 lb)", price: 28, rating: 4.8, reviews: 723, seller: "Crystal Haven", verified: true, image: "🖤", desc: "Raw black tourmaline — the ultimate grounding and protection stone. Place near electronics, at doorways, or carry in your pocket. Absorbs negative energy.", tags: ["TOURMALINE", "PROTECTION", "GROUNDING"] },
  { id: 7, cat: "crystals", name: "Moldavite Pendant (Authentic Czech)", price: 145, origPrice: 189, rating: 4.7, reviews: 89, seller: "StarSeed Gems", verified: true, badge: "RARE", image: "💚", desc: "Genuine Czech moldavite — formed 15 million years ago from a meteorite impact. Known as the stone of transformation. Certificate of authenticity included.", tags: ["MOLDAVITE", "TRANSFORMATION", "METEORITE"] },
  { id: 8, cat: "crystals", name: "Rose Quartz Heart (Polished)", price: 22, rating: 4.9, reviews: 1245, seller: "Crystal Haven", verified: true, image: "💗", desc: "Hand-polished rose quartz heart. The stone of unconditional love. Opens and heals the heart chakra. Perfect for meditation or gifting.", tags: ["ROSE QUARTZ", "HEART", "LOVE"] },
  { id: 9, cat: "crystals", name: "7 Chakra Crystal Set (Boxed)", price: 39, rating: 4.8, reviews: 567, seller: "Chakra Works", verified: true, image: "🌈", desc: "Complete set: Red Jasper, Carnelian, Citrine, Green Aventurine, Lapis Lazuli, Amethyst, Clear Quartz. Includes velvet pouch and chakra guide.", tags: ["CHAKRA SET", "COMPLETE", "GIFT"] },
  { id: 10, cat: "crystals", name: "Selenite Charging Plate", price: 32, rating: 4.7, reviews: 334, seller: "Crystal Haven", verified: true, image: "🤍", desc: "Large selenite slab for cleansing and charging other crystals. Also clears energy in any room. Self-cleansing — never needs recharging itself.", tags: ["SELENITE", "CHARGING", "CLEANSING"] },

  // Orgonite
  { id: 11, cat: "orgonite", name: "Large Orgonite Pyramid — 7 Chakra", price: 89, rating: 4.8, reviews: 203, seller: "Orgone Energy Works", verified: true, badge: "HANDMADE", image: "🔺", desc: "6-inch orgonite pyramid with copper coils, 7 chakra crystals, iron shavings, and gold leaf. Converts stagnant orgone (DOR) to positive orgone (POR). Handcrafted.", tags: ["ORGONITE", "PYRAMID", "HANDMADE"] },
  { id: 12, cat: "orgonite", name: "Orgonite Tower Buster (Set of 6)", price: 45, rating: 4.7, reviews: 412, seller: "Orgone Energy Works", verified: true, image: "⬡", desc: "Place near cell towers, smart meters, and WiFi routers. Aluminum shavings + quartz + resin. The original Wilhelm Reich-inspired design.", tags: ["TOWER BUSTER", "EMF", "SET"] },
  { id: 13, cat: "orgonite", name: "HHG Holy Hand Grenade Orgonite", price: 55, rating: 4.6, reviews: 178, seller: "Gifters Guild", verified: true, image: "🌀", desc: "5 double-terminated quartz crystals in copper-coil orgonite cone. Designed for outdoor gifting near cell towers. Powerful DOR-to-POR converter.", tags: ["HHG", "GIFTING", "QUARTZ"] },

  // Copper
  { id: 14, cat: "copper", name: "Pure Copper Water Bottle (900ml)", price: 38, rating: 4.9, reviews: 892, seller: "Ayur Copper Co", verified: true, badge: "BESTSELLER", image: "🫗", desc: "100% pure copper. Store water overnight for oligodynamic purification. Ayurvedic tradition for 5,000 years. Kills bacteria, balances pH, provides copper ions.", tags: ["COPPER", "WATER", "AYURVEDIC"] },
  { id: 15, cat: "copper", name: "Copper Moscow Mule Mugs (Set of 4)", price: 45, rating: 4.8, reviews: 634, seller: "Ayur Copper Co", verified: true, image: "🍶", desc: "Handcrafted 16oz pure copper mugs. Food-grade lacquer-free interior for maximum copper ion transfer. Beautiful hammered finish.", tags: ["MUGS", "COPPER", "HANDCRAFTED"] },
  { id: 16, cat: "copper", name: "Copper Bracelet — Magnetic Therapy", price: 24, origPrice: 35, rating: 4.7, reviews: 1456, seller: "Healing Metals", verified: true, image: "⭕", desc: "Pure copper bracelet with embedded magnets. Delivers trace copper through skin. Used for joint pain, inflammation, and biofield support. Adjustable fit.", tags: ["BRACELET", "MAGNETIC", "JOINT PAIN"] },
  { id: 17, cat: "copper", name: "Copper Tensor Ring — Sacred Cubit", price: 42, rating: 4.8, reviews: 234, seller: "Sacred Metals Lab", verified: true, badge: "HANDMADE", image: "⊙", desc: "Hand-twisted copper tensor ring using the Sacred Cubit measurement (20.6 inches). Creates a toroidal energy field. Place around water, plants, or on body.", tags: ["TENSOR RING", "SACRED CUBIT", "TOROIDAL"] },
  { id: 18, cat: "copper", name: "Copper Grounding Rod (4ft)", price: 29, rating: 4.6, reviews: 156, seller: "Earth Connect", verified: true, image: "📍", desc: "Solid copper grounding rod with 15ft wire and alligator clip. Connect to your grounding sheet or pad. Pure copper for maximum electron transfer from Earth.", tags: ["GROUNDING", "EARTHING", "ROD"] },

  // Sacred Geometry
  { id: 19, cat: "sacred", name: "Flower of Life Wall Art (Wood)", price: 65, rating: 4.9, reviews: 289, seller: "Sacred Forms Studio", verified: true, badge: "ARTISAN", image: "❀", desc: "Laser-cut walnut Flower of Life. 18 inches diameter. The fundamental pattern of creation found in temples worldwide. Raises the vibration of any room.", tags: ["FLOWER OF LIFE", "WOOD", "WALL ART"] },
  { id: 20, cat: "sacred", name: "Metatron's Cube Crystal Grid", price: 48, rating: 4.8, reviews: 167, seller: "Sacred Forms Studio", verified: true, image: "✡", desc: "Etched selenite crystal grid board with Metatron's Cube pattern. 10 inches. Amplifies crystal layouts for manifestation, healing, and meditation.", tags: ["METATRON", "CRYSTAL GRID", "SELENITE"] },
  { id: 21, cat: "sacred", name: "Sri Yantra Copper Meditation Disc", price: 55, rating: 4.9, reviews: 123, seller: "Sacred Metals Lab", verified: true, image: "🔯", desc: "Hand-etched Sri Yantra on pure copper disc. 6 inches. The most powerful sacred geometry symbol — represents the creation of the universe. Meditation focal point.", tags: ["SRI YANTRA", "COPPER", "MEDITATION"] },

  // Herbs & Tinctures
  { id: 22, cat: "herbs", name: "Blue Lotus Flower (Whole, 1oz)", price: 28, rating: 4.7, reviews: 345, seller: "Ancient Remedies", verified: true, image: "🪷", desc: "Nymphaea caerulea — the sacred flower of Egypt. Used for lucid dreaming, deep relaxation, and opening the third eye. Brew as tea or smoke.", tags: ["BLUE LOTUS", "DREAMING", "EGYPTIAN"] },
  { id: 23, cat: "herbs", name: "Chaga Mushroom Tincture (Double Extract)", price: 35, rating: 4.9, reviews: 567, seller: "Forest Fungi Co", verified: true, badge: "ORGANIC", image: "🍄", desc: "Wild-harvested Siberian chaga. Dual water/alcohol extraction for full spectrum of betulinic acid and polysaccharides. The most antioxidant-dense substance on Earth.", tags: ["CHAGA", "MUSHROOM", "ANTIOXIDANT"] },
  { id: 24, cat: "herbs", name: "Sea Moss Gel (Wildcrafted, 16oz)", price: 32, rating: 4.8, reviews: 1890, seller: "Ocean Minerals", verified: true, badge: "BESTSELLER", image: "🌊", desc: "92 of 102 minerals your body needs in one food. Wildcrafted from the Caribbean. Thyroid support, gut healing, skin glow. Dr. Sebi's #1 recommendation.", tags: ["SEA MOSS", "92 MINERALS", "DR SEBI"] },
  { id: 25, cat: "herbs", name: "Shilajit Resin (Pure Himalayan, 30g)", price: 45, rating: 4.8, reviews: 678, seller: "Mountain Source", verified: true, image: "🏔️", desc: "Purified Himalayan shilajit resin. 85+ minerals in ionic form, fulvic acid for cellular absorption. Ancient Ayurvedic 'destroyer of weakness.' Testosterone & energy.", tags: ["SHILAJIT", "MINERALS", "FULVIC ACID"] },

  // Water Tech
  { id: 26, cat: "water", name: "Berkey Water Filter System", price: 349, rating: 4.9, reviews: 2345, seller: "Pure Water Direct", verified: true, badge: "ESSENTIAL", image: "🚰", desc: "Gravity-fed filtration removes fluoride, chlorine, heavy metals, pharmaceuticals, bacteria, and viruses. No electricity needed. Lasts 6,000 gallons per filter set.", tags: ["BERKEY", "FLUORIDE", "GRAVITY"] },
  { id: 27, cat: "water", name: "Structured Water Device — Portable", price: 89, rating: 4.6, reviews: 234, seller: "Vortex Water Tech", verified: true, image: "🌀", desc: "Vortex-based water structuring unit. Attaches to any bottle. Creates hexagonal (EZ) water through vortex motion. Based on Viktor Schauberger's research.", tags: ["STRUCTURED", "VORTEX", "EZ WATER"] },
  { id: 28, cat: "water", name: "Hydrogen Water Bottle (SPE/PEM)", price: 65, rating: 4.7, reviews: 456, seller: "H2 Life", verified: true, image: "⚗️", desc: "Generates molecular hydrogen (H2) in your water via electrolysis. H2 is the smallest antioxidant — penetrates every cell including the brain. 1000+ published studies.", tags: ["HYDROGEN", "H2", "ANTIOXIDANT"] },

  // Sound & Frequency
  { id: 29, cat: "sound", name: "432Hz Tuning Fork Set (7 Chakra)", price: 79, rating: 4.9, reviews: 189, seller: "Sound Temple", verified: true, badge: "HANDCRAFTED", image: "🎵", desc: "7 medical-grade aluminum tuning forks calibrated to 432Hz chakra frequencies. Includes mallet and velvet roll case. For sound healing, meditation, and biofield tuning.", tags: ["432HZ", "TUNING FORK", "CHAKRA"] },
  { id: 30, cat: "sound", name: "Tibetan Singing Bowl (Hand-Hammered)", price: 65, rating: 4.9, reviews: 567, seller: "Nepal Imports", verified: true, image: "🔔", desc: "Authentic hand-hammered Tibetan singing bowl from Nepal. 5-inch. Produces rich overtones for meditation, space clearing, and chakra balancing. Includes cushion and mallet.", tags: ["SINGING BOWL", "TIBETAN", "HANDMADE"] },
  { id: 31, cat: "sound", name: "528Hz Solfeggio Tuning Fork", price: 28, rating: 4.8, reviews: 890, seller: "Sound Temple", verified: true, image: "〰️", desc: "The 'Love Frequency' — 528Hz. Used for DNA repair, heart opening, and transformation. Medical-grade weighted tuning fork with silicone foot for body application.", tags: ["528HZ", "SOLFEGGIO", "DNA REPAIR"] },

  // Conscious Clothing
  { id: 32, cat: "clothing", name: "Organic Hemp Hoodie — 'FREQUENCY'", price: 75, rating: 4.8, reviews: 234, seller: "Conscious Threads", verified: true, image: "🧥", desc: "100% organic hemp/cotton blend. Naturally antimicrobial, UV-resistant, and gets softer with each wash. 'FREQUENCY' design in sacred geometry print.", tags: ["HEMP", "ORGANIC", "FREQUENCY"] },
  { id: 33, cat: "clothing", name: "Shungite Necklace — EMF Shield", price: 42, rating: 4.7, reviews: 345, seller: "Earth Shields Co", verified: true, image: "📿", desc: "Genuine Karelian shungite pendant on adjustable cord. Worn over the heart chakra for EMF protection and biofield coherence. Contains natural fullerenes.", tags: ["SHUNGITE", "NECKLACE", "EMF"] },

  // Member Marketplace
  { id: 34, cat: "member", name: "Handmade Orgonite Pendant — @Sage", price: 35, rating: 5.0, reviews: 23, seller: "Sage", memberSeller: true, image: "🌿", desc: "Made by RTV33 member @sage.flow. Each pendant contains copper shavings, clear quartz point, and resin. Infused with Reiki energy during curing. One of a kind.", tags: ["MEMBER MADE", "ORGONITE", "REIKI"] },
  { id: 35, cat: "member", name: "Crystal-Infused Candles — @Luna", price: 28, rating: 4.9, reviews: 45, seller: "Luna", memberSeller: true, image: "🕯️", desc: "Soy wax candles with embedded crystals and essential oils. Each candle is intention-set during a full moon ceremony. Scents: Lavender Dream, Cedar Grounding, Rose Heart.", tags: ["MEMBER MADE", "CANDLES", "CRYSTALS"] },
  { id: 36, cat: "member", name: "Sacred Geometry Prints — @Orion", price: 22, rating: 5.0, reviews: 67, seller: "Orion", memberSeller: true, image: "🎨", desc: "Digital art prints on archival paper. Metatron's Cube, Flower of Life, Sri Yantra, and custom designs. Created during deep meditation states. 11x14 inches.", tags: ["MEMBER MADE", "ART", "PRINTS"] },
  { id: 37, cat: "member", name: "Herbal Smoke Blend — @Zenith", price: 18, rating: 4.8, reviews: 89, seller: "Zenith", memberSeller: true, image: "🌬️", desc: "Hand-blended mullein, lavender, damiana, and blue lotus. Organic, no tobacco, no additives. For relaxation and ceremonial use. Crafted by @zenith_33.", tags: ["MEMBER MADE", "HERBAL", "SMOKE BLEND"] },
  { id: 38, cat: "member", name: "Copper Wire Tree of Life — @Kael", price: 95, rating: 5.0, reviews: 12, seller: "Kael", memberSeller: true, badge: "ARTISAN", image: "🌳", desc: "Hand-twisted pure copper Tree of Life sculpture with genuine crystal leaves (amethyst, citrine, rose quartz). 12 inches tall. Each one takes 8+ hours to create.", tags: ["MEMBER MADE", "COPPER", "SCULPTURE"] },
];

function VibeShop() {
  const [activeCat, setActiveCat] = useState("all");
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [showCart, setShowCart] = useState(false);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [vendorForm, setVendorForm] = useState({ name: "", email: "", shop: "", desc: "", products: "", website: "" });
  const [vendorSubmitted, setVendorSubmitted] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(p => p.id !== id));
  const cartTotal = cart.reduce((a, p) => a + p.price * p.qty, 0);
  const cartCount = cart.reduce((a, p) => a + p.qty, 0);

  const filtered = SHOP_PRODUCTS
    .filter(p => activeCat === "all" || p.cat === activeCat)
    .filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.desc.toLowerCase().includes(searchTerm.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "reviews") return b.reviews - a.reviews;
      return (b.badge ? 1 : 0) - (a.badge ? 1 : 0);
    });

  // Vendor Application Form
  if (showVendorForm) {
    return (
      <div style={{ animation: "fadeInUp 0.4s ease" }}>
        <button onClick={() => setShowVendorForm(false)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", marginBottom: 24 }}>← BACK TO SHOP</button>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <span style={{ fontSize: 40 }}>🏪</span>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "#fff", fontFamily: "'Orbitron', sans-serif", margin: 0 }}>Become a VIB3 Vendor</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Sell your high-vibe products to the RTV33 community</p>
          </div>
        </div>

        {vendorSubmitted ? (
          <GlassCard hover={false} style={{ textAlign: "center", padding: 40 }}>
            <span style={{ fontSize: 48, display: "block", marginBottom: 16 }}>✅</span>
            <h3 style={{ fontSize: 18, color: "#00ff8c", fontFamily: "'Orbitron', sans-serif", marginBottom: 8 }}>APPLICATION SUBMITTED</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>We'll review your application and get back to you within 48 hours. Welcome to the collective.</p>
          </GlassCard>
        ) : (
          <GlassCard hover={false} style={{ maxWidth: 600 }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, marginBottom: 24 }}>
              We're looking for vendors who align with the RTV33 mission — products that genuinely help people raise their vibration, heal, and awaken. No mass-produced junk. Quality, intention, and integrity matter.
            </p>
            {[
              { key: "name", label: "Your Name / Brand Name", placeholder: "e.g. Sacred Metals Lab" },
              { key: "email", label: "Contact Email", placeholder: "you@example.com" },
              { key: "shop", label: "Shop / Business Name", placeholder: "Your business name" },
              { key: "website", label: "Website or Social Media", placeholder: "instagram.com/yourbrand" },
              { key: "products", label: "What Do You Sell?", placeholder: "Orgonite pyramids, copper tools, crystals, etc.", multi: true },
              { key: "desc", label: "Tell Us About Your Products & Mission", placeholder: "What makes your products special? What's your story?", multi: true },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.4)", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 6 }}>{field.label}</label>
                {field.multi ? (
                  <textarea value={vendorForm[field.key]} onChange={e => setVendorForm(prev => ({ ...prev, [field.key]: e.target.value }))} placeholder={field.placeholder} rows={3}
                    style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "'Sora', sans-serif", resize: "vertical" }} />
                ) : (
                  <input value={vendorForm[field.key]} onChange={e => setVendorForm(prev => ({ ...prev, [field.key]: e.target.value }))} placeholder={field.placeholder}
                    style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "'Sora', sans-serif" }} />
                )}
              </div>
            ))}
            <button onClick={() => setVendorSubmitted(true)} style={{ padding: "12px 32px", borderRadius: 8, background: "rgba(0,255,140,0.12)", border: "1px solid rgba(0,255,140,0.4)", color: "#00ff8c", cursor: "pointer", fontSize: 12, letterSpacing: 3, fontFamily: "'Orbitron', sans-serif", marginTop: 8 }}>SUBMIT APPLICATION</button>
          </GlassCard>
        )}
      </div>
    );
  }

  // Product Detail
  if (selectedProduct) {
    const p = selectedProduct;
    const catInfo = SHOP_CATEGORIES.find(c => c.id === p.cat);
    return (
      <div style={{ animation: "fadeInUp 0.4s ease" }}>
        <button onClick={() => setSelectedProduct(null)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", marginBottom: 24 }}>← BACK TO SHOP</button>

        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          <GlassCard hover={false} style={{ flex: "0 1 340px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
            <span style={{ fontSize: 100 }}>{p.image}</span>
          </GlassCard>
          <div style={{ flex: 1, minWidth: 280 }}>
            {p.badge && <span style={{ fontSize: 9, padding: "3px 10px", borderRadius: 4, background: "rgba(0,255,140,0.1)", border: "1px solid rgba(0,255,140,0.25)", color: "#00ff8c", letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", marginBottom: 10, display: "inline-block" }}>{p.badge}</span>}
            <h2 style={{ fontSize: 22, fontWeight: 600, color: "#fff", margin: "8px 0", fontFamily: "'Sora', sans-serif" }}>{p.name}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 10, color: catInfo?.color, fontFamily: "'Orbitron', sans-serif" }}>{catInfo?.icon} {catInfo?.name}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>•</span>
              <span style={{ fontSize: 11, color: "#eab308" }}>{"★".repeat(Math.floor(p.rating))} {p.rating}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>({p.reviews} reviews)</span>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.9, marginBottom: 20 }}>{p.desc}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: "#00ff8c", fontFamily: "'Orbitron', sans-serif" }}>${p.price}</span>
              {p.origPrice && <span style={{ fontSize: 16, color: "rgba(255,255,255,0.25)", textDecoration: "line-through" }}>${p.origPrice}</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Sold by:</span>
              <span style={{ fontSize: 12, color: p.memberSeller ? "#00ff8c" : "#fff", fontWeight: 500 }}>{p.memberSeller ? `@${p.seller.toLowerCase()}` : p.seller}</span>
              {p.verified && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: "rgba(0,255,140,0.1)", color: "#00ff8c" }}>✓ VERIFIED</span>}
              {p.memberSeller && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: "rgba(167,139,250,0.1)", color: "#a78bfa" }}>RTV33 MEMBER</span>}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              {p.tags.map(t => <span key={t} style={{ fontSize: 9, padding: "3px 10px", borderRadius: 20, background: `${catInfo?.color}10`, color: `${catInfo?.color}cc`, border: `1px solid ${catInfo?.color}20`, letterSpacing: 1 }}>{t}</span>)}
            </div>
            <button onClick={() => { addToCart(p); setSelectedProduct(null); }} style={{ padding: "14px 40px", borderRadius: 8, background: "rgba(0,255,140,0.12)", border: "1px solid rgba(0,255,140,0.4)", color: "#00ff8c", cursor: "pointer", fontSize: 13, letterSpacing: 3, fontFamily: "'Orbitron', sans-serif", transition: "all 0.3s" }}>ADD TO CART</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeInUp 0.5s ease" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{ width: 3, height: 28, background: "linear-gradient(to bottom, #eab308, #00ff8c)", borderRadius: 2 }} />
            <h2 style={{ fontSize: 22, fontWeight: 300, color: "#fff", fontFamily: "'Sora', sans-serif", margin: 0 }}>VIB3 SHOP</h2>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.8, marginTop: 8 }}>
            {SHOP_PRODUCTS.length} products from verified vendors and RTV33 members. Everything you need to raise your frequency.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setShowCart(!showCart)} style={{ padding: "8px 18px", borderRadius: 8, background: cartCount > 0 ? "rgba(0,255,140,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${cartCount > 0 ? "rgba(0,255,140,0.3)" : "rgba(255,255,255,0.06)"}`, color: cartCount > 0 ? "#00ff8c" : "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 12, fontFamily: "'Orbitron', sans-serif", letterSpacing: 1 }}>
            🛒 {cartCount > 0 ? `${cartCount} — $${cartTotal}` : "CART"}
          </button>
          <button onClick={() => setShowVendorForm(true)} style={{ padding: "8px 18px", borderRadius: 8, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa", cursor: "pointer", fontSize: 11, fontFamily: "'Orbitron', sans-serif", letterSpacing: 1 }}>BECOME A VENDOR</button>
        </div>
      </div>

      {/* Cart Drawer */}
      {showCart && cart.length > 0 && (
        <GlassCard hover={false} style={{ marginBottom: 20, borderLeft: "3px solid #00ff8c" }}>
          <span style={{ fontSize: 10, letterSpacing: 3, color: "#00ff8c", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 14 }}>YOUR CART</span>
          {cart.map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{item.image}</span>
                <div>
                  <div style={{ fontSize: 13, color: "#fff" }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Qty: {item.qty} × ${item.price}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 14, color: "#00ff8c", fontWeight: 600 }}>${item.price * item.qty}</span>
                <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: "rgba(255,60,60,0.5)", cursor: "pointer", fontSize: 14 }}>✕</button>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
            <span style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>Total: <span style={{ color: "#00ff8c", fontFamily: "'Orbitron', sans-serif" }}>${cartTotal}</span></span>
            <button style={{ padding: "10px 28px", borderRadius: 8, background: "rgba(0,255,140,0.15)", border: "1px solid rgba(0,255,140,0.4)", color: "#00ff8c", cursor: "pointer", fontSize: 12, letterSpacing: 3, fontFamily: "'Orbitron', sans-serif" }}>CHECKOUT</button>
          </div>
        </GlassCard>
      )}

      {/* Search & Sort */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search products... (shungite, copper, 432Hz...)"
          style={{ flex: 1, minWidth: 200, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 18px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "'JetBrains Mono', monospace" }} />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 16px", color: "rgba(255,255,255,0.5)", fontSize: 12, outline: "none", cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High → Low</option>
          <option value="rating">Top Rated</option>
          <option value="reviews">Most Reviewed</option>
        </select>
      </div>

      {/* Category Filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        <button onClick={() => setActiveCat("all")} style={{ padding: "6px 16px", borderRadius: 20, fontSize: 11, cursor: "pointer", fontFamily: "'Sora', sans-serif", background: activeCat === "all" ? "rgba(0,255,140,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${activeCat === "all" ? "rgba(0,255,140,0.3)" : "rgba(255,255,255,0.06)"}`, color: activeCat === "all" ? "#00ff8c" : "rgba(255,255,255,0.35)" }}>All</button>
        {SHOP_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCat(cat.id)} style={{
            padding: "6px 16px", borderRadius: 20, fontSize: 11, cursor: "pointer",
            fontFamily: "'Sora', sans-serif", display: "flex", alignItems: "center", gap: 4,
            background: activeCat === cat.id ? `${cat.color}15` : "rgba(255,255,255,0.03)",
            border: `1px solid ${activeCat === cat.id ? `${cat.color}40` : "rgba(255,255,255,0.06)"}`,
            color: activeCat === cat.id ? cat.color : "rgba(255,255,255,0.35)",
          }}>{cat.icon} {cat.name}</button>
        ))}
      </div>

      {/* Member Marketplace Banner */}
      {(activeCat === "all" || activeCat === "member") && (
        <div style={{ padding: "18px 24px", borderRadius: 12, background: "linear-gradient(135deg, rgba(0,255,140,0.06), rgba(167,139,250,0.06))", border: "1px solid rgba(0,255,140,0.1)", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span style={{ fontSize: 10, letterSpacing: 3, color: "#00ff8c", fontFamily: "'Orbitron', sans-serif" }}>⊛ RTV33 MEMBER MARKETPLACE</span>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Handmade products from our community. Every purchase supports a fellow seeker.</p>
          </div>
          <button onClick={() => setShowVendorForm(true)} style={{ padding: "8px 20px", borderRadius: 8, background: "rgba(0,255,140,0.08)", border: "1px solid rgba(0,255,140,0.25)", color: "#00ff8c", cursor: "pointer", fontSize: 10, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>SELL YOUR PRODUCTS →</button>
        </div>
      )}

      {/* Results count */}
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>
        {filtered.length} products {searchTerm && `matching "${searchTerm}"`}
      </div>

      {/* Product Grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {filtered.map(product => {
          const catInfo = SHOP_CATEGORIES.find(c => c.id === product.cat);
          return (
            <GlassCard key={product.id} onClick={() => setSelectedProduct(product)} style={{ flex: "1 1 260px", maxWidth: 320, cursor: "pointer", padding: 0, overflow: "hidden" }}>
              {/* Image area */}
              <div style={{ padding: "28px 20px", textAlign: "center", background: `${catInfo?.color}05`, borderBottom: "1px solid rgba(255,255,255,0.04)", position: "relative" }}>
                {product.badge && <span style={{ position: "absolute", top: 10, left: 10, fontSize: 8, padding: "2px 8px", borderRadius: 4, background: "rgba(0,255,140,0.12)", border: "1px solid rgba(0,255,140,0.25)", color: "#00ff8c", letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>{product.badge}</span>}
                {product.memberSeller && <span style={{ position: "absolute", top: 10, right: 10, fontSize: 8, padding: "2px 8px", borderRadius: 4, background: "rgba(167,139,250,0.12)", color: "#a78bfa", letterSpacing: 1 }}>MEMBER</span>}
                <span style={{ fontSize: 48 }}>{product.image}</span>
              </div>
              {/* Info */}
              <div style={{ padding: "16px 20px" }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: "0 0 6px", lineHeight: 1.4 }}>{product.name}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: "#eab308" }}>★ {product.rating}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>({product.reviews})</span>
                  <span style={{ fontSize: 10, color: catInfo?.color, marginLeft: "auto" }}>{catInfo?.icon}</span>
                </div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.6, margin: "0 0 12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.desc}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#00ff8c", fontFamily: "'Orbitron', sans-serif" }}>${product.price}</span>
                    {product.origPrice && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", textDecoration: "line-through", marginLeft: 6 }}>${product.origPrice}</span>}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} style={{ padding: "6px 14px", borderRadius: 6, background: "rgba(0,255,140,0.08)", border: "1px solid rgba(0,255,140,0.25)", color: "#00ff8c", cursor: "pointer", fontSize: 10, fontFamily: "'Orbitron', sans-serif" }}>+ CART</button>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Vendor CTA */}
      <div style={{ marginTop: 32, padding: 28, borderRadius: 16, background: "linear-gradient(135deg, rgba(167,139,250,0.06), rgba(234,179,8,0.06))", border: "1px solid rgba(167,139,250,0.1)", textAlign: "center" }}>
        <span style={{ fontSize: 10, letterSpacing: 4, color: "#a78bfa", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 12 }}>🏪 FOR VENDORS & CREATORS</span>
        <h3 style={{ fontSize: 20, color: "#fff", fontWeight: 400, marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>Sell Your High-Vibe Products on RTV33</h3>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, maxWidth: 500, margin: "0 auto 20px" }}>
          Are you a maker, healer, or artisan creating products that raise vibration? Apply to become a verified vendor and reach thousands of conscious consumers.
        </p>
        <button onClick={() => setShowVendorForm(true)} style={{ padding: "12px 36px", borderRadius: 8, background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.4)", color: "#a78bfa", cursor: "pointer", fontSize: 12, letterSpacing: 3, fontFamily: "'Orbitron', sans-serif" }}>APPLY NOW</button>
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
  const [expandedProtocol, setExpandedProtocol] = useState(null);

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
            {organ.combos.map((combo, idx) => {
              const isExpanded = expandedProtocol === `${organ.id}-${idx}`;
              return (
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
                  <button onClick={() => setExpandedProtocol(isExpanded ? null : `${organ.id}-${idx}`)} style={{ background: isExpanded ? `${organ.color}20` : `${organ.color}12`, border: `1px solid ${organ.color}30`, color: organ.color, borderRadius: 6, padding: "6px 18px", cursor: "pointer", fontSize: 10, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>{isExpanded ? "HIDE DETAILS" : "START PROTOCOL"}</button>
                </div>
                {isExpanded && (
                  <div style={{ marginTop: 20, padding: "20px 0 0", borderTop: `1px solid ${organ.color}15`, animation: "fadeInUp 0.3s ease" }}>
                    <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 14 }}>DAILY SCHEDULE</span>
                    {[
                      { time: "Morning (empty stomach)", instruction: `Take ${combo.herbs[0]} first thing with warm water. Wait 20 minutes before eating.` },
                      { time: "With breakfast", instruction: combo.herbs.length > 1 ? `Take ${combo.herbs[1]} with your first meal for better absorption.` : "Continue with a nutrient-dense breakfast to support absorption." },
                      { time: combo.herbs.length > 2 ? "Afternoon" : "Evening", instruction: combo.herbs.length > 2 ? `Take ${combo.herbs[2]} between meals for maximum bioavailability.` : `Take your second dose of ${combo.herbs[0]} if recommended.` },
                      { time: "Before bed", instruction: "Drink warm water with lemon. Rest is when your body does its deepest healing and repair work." },
                    ].map((step, si) => (
                      <div key={si} style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: organ.color, marginTop: 7, flexShrink: 0 }} />
                        <div>
                          <span style={{ fontSize: 12, color: organ.color, fontWeight: 600 }}>{step.time}</span>
                          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "2px 0 0", lineHeight: 1.6 }}>{step.instruction}</p>
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 8, background: `${organ.color}06`, border: `1px solid ${organ.color}12` }}>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.6 }}>
                        <strong style={{ color: organ.color }}>Tips:</strong> Take consistently for the full {combo.duration} duration. Keep a journal to track changes. Drink at least 8 glasses of clean water daily. Healing is not linear — some days will feel like setbacks. Trust the process.
                      </p>
                    </div>
                  </div>
                )}
              </GlassCard>
              );
            })}
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
          <div key={s.label} style={{ flex: "1 1 130px", padding: "18px 20px", borderRadius: 12, textAlign: "center", background: `linear-gradient(135deg, ${s.color}08, ${s.color}03)`, border: `1px solid ${s.color}15`, boxShadow: `0 4px 20px ${s.color}08, inset 0 1px 0 rgba(255,255,255,0.03)` }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: "'Orbitron', sans-serif", textShadow: `0 0 20px ${s.color}30` }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 2, textTransform: "uppercase", marginTop: 6, fontFamily: "'Sora', sans-serif", fontWeight: 500 }}>{s.label}</div>
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
// Z3N ZON3 — Full Practice System
// ═══════════════════════════════════════════════════════════════

const ZEN_PRACTICES = [
  {
    id: "478", name: "4-7-8 Breathwork", type: "Breathwork", dur: "8 min", color: "#00ff8c", icon: "🌬️",
    desc: "The Navy SEAL breathing technique. Activates the parasympathetic nervous system in under 60 seconds. Inhale 4 counts, hold 7, exhale 8.",
    steps: [
      "Find a comfortable seated position. Spine straight, shoulders relaxed, eyes closed.",
      "Exhale completely through your mouth with a whoosh sound, emptying your lungs.",
      "Close your mouth. Inhale quietly through your nose for 4 counts.",
      "Hold your breath for 7 counts. This is where the magic happens — your blood is oxygenating deeply.",
      "Exhale completely through your mouth for 8 counts with a whoosh sound.",
      "This is one cycle. Repeat for 4 cycles minimum, up to 8 cycles.",
      "Notice: by cycle 3, your heart rate has slowed. Your biofield is expanding. You've shifted from sympathetic to parasympathetic dominance.",
    ],
    science: "Developed by Dr. Andrew Weil based on pranayama. The extended exhale stimulates the vagus nerve, which directly controls the parasympathetic nervous system. Studies show it reduces cortisol by up to 23% in a single session.",
    hasTimer: true,
  },
  {
    id: "morning", name: "Morning Calibration", type: "Meditation", dur: "12 min", color: "#06b6d4", icon: "🌅",
    desc: "Set your electromagnetic field for the day. A combination of gratitude, visualization, and intention-setting that creates heart coherence before the world gets to you.",
    steps: [
      "Sit upright before touching your phone. The first 10 minutes after waking, your brain is in theta — the most programmable state.",
      "Place both hands over your heart. Feel its rhythm. This is your body's strongest electromagnetic generator.",
      "Breathe deeply for 2 minutes. In through the nose, out through the mouth. Slow. Deliberate.",
      "Think of 3 things you're genuinely grateful for. Don't just list them — FEEL the gratitude in your chest. HeartMath research shows this creates immediate field coherence.",
      "Visualize your day going exactly as you want it. See specific moments. Feel the emotions. Your brain cannot distinguish between a vividly imagined experience and a real one.",
      "Set one clear intention for the day. Not a task — an energy. 'I will move through this day with calm power.'",
      "Open your eyes. You've just programmed your reticular activating system and set your biofield to broadcast a coherent signal. The day responds to this.",
    ],
    science: "The first 10 minutes after waking, brainwave patterns transition from theta (4-8Hz) to alpha (8-12Hz). This window is when the subconscious is most receptive to programming. Heart-focused gratitude creates measurable coherence in the heart's electromagnetic field within 60 seconds (HeartMath Institute).",
  },
  {
    id: "nervous", name: "Nervous System Reset", type: "Breathwork", dur: "8 min", color: "#00ff8c", icon: "⚡",
    desc: "Emergency reset for when you're stuck in fight-or-flight. This protocol directly stimulates the vagus nerve and forces your body back to safety.",
    steps: [
      "You're going to do physiological sighs — the fastest known way to calm the nervous system.",
      "Double inhale through the nose: a full breath in, then a quick second sip of air on top (this re-inflates collapsed alveoli in the lungs).",
      "Slow, extended exhale through the mouth — as long and slow as you can.",
      "Repeat 5 times. You'll feel a shift by the 3rd one.",
      "Now: cold water on the wrists and neck for 30 seconds if available. The dive reflex activates the vagus nerve instantly.",
      "Hum or sing for 2 minutes. The vibration of humming stimulates the vagus nerve where it passes through the vocal cords.",
      "Finish with 2 minutes of box breathing: in 4, hold 4, out 4, hold 4. You are now back in parasympathetic dominance.",
    ],
    science: "The physiological sigh was identified by Stanford neuroscientist Dr. Andrew Huberman as the fastest real-time method to reduce autonomic arousal. The double inhale maximally inflates the lungs, and the long exhale offloads CO2, directly signaling safety to the brainstem.",
  },
  {
    id: "chakra", name: "Chakra Alignment Flow", type: "Yoga", dur: "20 min", color: "#a78bfa", icon: "🧘",
    desc: "A sequence of 7 poses, one for each chakra, moving from root to crown. Opens energy centers and restores flow through the central channel.",
    steps: [
      "ROOT — Malasana (Deep Squat): Feet wide, squat deep, hands at heart center. Feel the earth beneath you. 2 minutes. Breathe into the base of your spine.",
      "SACRAL — Bound Angle (Baddha Konasana): Seated, soles of feet together, knees wide. Gentle forward fold. 2 minutes. Breathe into the lower belly.",
      "SOLAR PLEXUS — Boat Pose (Navasana): Balance on sit bones, legs extended, arms parallel. Hold 60 seconds. Feel the fire in your core. Rest. Repeat.",
      "HEART — Camel Pose (Ustrasana): Kneel, hands on lower back, open the chest to the sky. Heart wide open. 90 seconds. Breathe into the space behind your sternum.",
      "THROAT — Shoulderstand (Sarvangasana): Lie back, lift legs and hips overhead, hands supporting lower back. Chin to chest compresses the throat chakra. 2 minutes.",
      "THIRD EYE — Child's Pose (Balasana): Kneel, fold forward, forehead on the ground. Apply gentle pressure to the third eye point. 2 minutes. Let thoughts dissolve.",
      "CROWN — Headstand or Savasana: Either invert fully (headstand) or lie flat in corpse pose with palms up. 3-5 minutes. This is integration. Don't skip it.",
    ],
    science: "Yoga poses create specific patterns of compression and release in the endocrine glands associated with each chakra position. Forward folds stimulate the adrenals. Backbends open the thymus. Inversions flood the brain with blood and stimulate the pineal and pituitary glands.",
  },
  {
    id: "presence", name: "Deep Presence", type: "Meditation", dur: "15 min", color: "#06b6d4", icon: "🔵",
    desc: "Pure awareness meditation. No mantras, no visualization, no goals. Just the practice of being the witness — the consciousness behind the thoughts.",
    steps: [
      "Sit. Spine straight. Hands on knees, palms up or down — your choice.",
      "Close your eyes. Take 3 deep breaths to arrive.",
      "Now stop controlling the breath. Let it breathe itself.",
      "Notice thoughts arising. Don't push them away. Don't follow them. Just notice: 'There's a thought.' Let it pass like a cloud.",
      "Rest your attention on the space BETWEEN thoughts. That gap — however brief — is pure consciousness. That's what you actually are.",
      "When you get pulled into a thought story (and you will), the moment you notice you were thinking IS the moment of awakening. That noticing is the practice.",
      "Continue for 15 minutes. Some sits will feel profound. Some will feel like wrestling cats. Both are the practice. Consistency matters more than quality.",
      "Before opening your eyes, notice: who was watching the thoughts? That awareness — silent, unchanging, always present — that's your true nature.",
    ],
    science: "Vipassana-style awareness meditation has been shown to increase cortical thickness in the prefrontal cortex, reduce amygdala reactivity, and increase gray matter density in regions associated with self-awareness. Long-term meditators show measurably different brainwave patterns including sustained gamma waves (40Hz+), the fastest brainwave state, associated with heightened perception and consciousness.",
  },
  {
    id: "activation", name: "Energy Activation", type: "Breathwork", dur: "10 min", color: "#00ff8c", icon: "🔥",
    desc: "Wim Hof-inspired power breathing. Floods the body with oxygen, alkalizes the blood, and creates a controlled stress response that strengthens the immune system.",
    steps: [
      "WARNING: Do this seated or lying down. Never in water or while driving. You may feel tingling, lightheadedness — this is normal.",
      "Round 1: Take 30 deep, fast breaths — in through the nose, out through the mouth. Fill the belly, then the chest. Let the exhale fall out passively.",
      "After breath 30: exhale and HOLD. Empty lungs. See how long you can hold. Don't force it. When you need to breathe, take one deep recovery breath and hold for 15 seconds.",
      "Round 2: Repeat 30 breaths. Your hold time will be longer this time. The body is alkalizing.",
      "Round 3: Same thing. By now your hold time may be 90+ seconds. Tingling in hands and face is normal — that's vasoconstriction from alkalinity.",
      "After the final round, breathe normally for 2 minutes. Notice: you feel electric. Alert. Alive. Your cells just got flushed with oxygen.",
      "Optional: cold shower for 30 seconds. The combination of breathwork + cold = full sympathetic reset followed by parasympathetic rebound.",
    ],
    science: "Wim Hof method has been studied at Radboud University. Practitioners voluntarily influenced their autonomic nervous system and immune response — something previously considered impossible. The breathing creates intermittent hypoxia, which triggers EPO production, increases brown fat activation, and strengthens mitochondrial function.",
  },
  {
    id: "stillness", name: "Sacred Stillness", type: "Deep Work", dur: "30 min", color: "#eab308", icon: "✨",
    desc: "30 minutes of complete non-doing. No meditation technique. No breathwork. No phone. No music. Just you, existing. The most radical practice in a world addicted to stimulation.",
    steps: [
      "Set a timer for 30 minutes. Put your phone in another room.",
      "Sit or lie down. Don't try to meditate. Don't try to breathe a certain way. Don't try to think or not think.",
      "Just be. Like a cat in a sunbeam. No agenda. No goal. No practice.",
      "The first 5-10 minutes will be uncomfortable. Your mind will scream for input. This is withdrawal from stimulation addiction. Feel it.",
      "Around minute 10-15, something shifts. The noise starts to quiet. The urgency dissolves. You start to hear the silence behind the silence.",
      "In the final 10 minutes, you may experience: deep peace, creative insights surfacing, emotional release, a sense of spaciousness, or simply rest at a level you haven't experienced in years.",
      "When the timer sounds, sit for one more minute before re-engaging with the world. Notice how differently you perceive everything.",
      "This is not wasted time. This is the most productive 30 minutes you can spend. Creativity, insight, and healing all require space. This practice creates that space.",
    ],
    science: "The Default Mode Network (DMN) — the brain network associated with creativity, self-reflection, and insight — activates during periods of non-directed thought. Constant stimulation suppresses the DMN. Boredom and stillness are prerequisites for creative breakthroughs. Einstein, Newton, and Tesla all attributed their greatest insights to periods of intentional non-doing.",
  },
];

function ZenZoneSection() {
  const [activePractice, setActivePractice] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [practiceStarted, setPracticeStarted] = useState(false);

  if (activePractice) {
    const p = ZEN_PRACTICES.find(pr => pr.id === activePractice);
    return (
      <div style={{ animation: "fadeInUp 0.4s ease" }}>
        <button onClick={() => { setActivePractice(null); setCurrentStep(0); setPracticeStarted(false); }} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", marginBottom: 24 }}>← BACK TO Z3N ZON3</button>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
          <span style={{ fontSize: 40 }}>{p.icon}</span>
          <div>
            <span style={{ fontSize: 10, color: p.color, fontFamily: "'Orbitron', sans-serif", letterSpacing: 3 }}>{p.type.toUpperCase()} • {p.dur}</span>
            <h2 style={{ fontSize: 24, fontWeight: 600, color: "#fff", fontFamily: "'Orbitron', sans-serif", margin: 0, letterSpacing: 1 }}>{p.name}</h2>
          </div>
        </div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 28, maxWidth: 650 }}>{p.desc}</p>

        {/* Breathwork timer if applicable */}
        {p.hasTimer && (
          <GlassCard hover={false} style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
            <BreathingGuide />
          </GlassCard>
        )}

        {/* Step-by-step guide */}
        <GlassCard hover={false} style={{ marginBottom: 24, maxWidth: 700 }}>
          <span style={{ fontSize: 10, letterSpacing: 3, color: p.color, fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 20 }}>⟡ GUIDED STEPS</span>
          {p.steps.map((step, i) => (
            <div key={i} onClick={() => setCurrentStep(i)} style={{
              display: "flex", gap: 16, padding: "16px 0",
              borderBottom: i < p.steps.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              cursor: "pointer", opacity: currentStep === i ? 1 : 0.5,
              transition: "all 0.3s ease",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: currentStep === i ? `${p.color}20` : "rgba(255,255,255,0.03)",
                border: `1px solid ${currentStep === i ? `${p.color}50` : "rgba(255,255,255,0.06)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: currentStep === i ? p.color : "rgba(255,255,255,0.3)",
                fontFamily: "'Orbitron', sans-serif", fontWeight: 600,
                transition: "all 0.3s ease",
              }}>{i + 1}</div>
              <p style={{ fontSize: 14, color: currentStep === i ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)", lineHeight: 1.8, margin: 0, transition: "color 0.3s ease" }}>{step}</p>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0} style={{ padding: "8px 18px", borderRadius: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: currentStep === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.4)", cursor: currentStep === 0 ? "default" : "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>← PREV</button>
            <button onClick={() => setCurrentStep(Math.min(p.steps.length - 1, currentStep + 1))} disabled={currentStep === p.steps.length - 1} style={{ padding: "8px 18px", borderRadius: 6, background: currentStep < p.steps.length - 1 ? `${p.color}12` : "rgba(255,255,255,0.03)", border: `1px solid ${currentStep < p.steps.length - 1 ? `${p.color}30` : "rgba(255,255,255,0.06)"}`, color: currentStep < p.steps.length - 1 ? p.color : "rgba(255,255,255,0.15)", cursor: currentStep === p.steps.length - 1 ? "default" : "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>NEXT →</button>
          </div>
        </GlassCard>

        {/* Science section */}
        <GlassCard hover={false} style={{ borderLeft: `3px solid ${p.color}`, maxWidth: 700 }}>
          <span style={{ fontSize: 10, letterSpacing: 3, color: p.color, fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 10 }}>⟡ THE SCIENCE</span>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.9, margin: 0 }}>{p.science}</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeInUp 0.5s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <div style={{ width: 3, height: 28, background: "linear-gradient(to bottom, #00ff8c, #a78bfa)", borderRadius: 2 }} />
        <h2 style={{ fontSize: 22, fontWeight: 300, color: "#fff", fontFamily: "'Sora', sans-serif", margin: 0 }}>Z3N ZON3</h2>
      </div>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, marginTop: 8, marginBottom: 28 }}>
        {ZEN_PRACTICES.length} guided practices with step-by-step instructions, interactive timers, and the science behind each one. No fluff — just the techniques that work.
      </p>

      {/* Live Breathwork Tool */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
        <GlassCard hover={false} style={{ flex: "1 1 340px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ fontSize: 10, letterSpacing: 3, color: "#00ff8c", textTransform: "uppercase", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 20 }}>QUICK BREATHWORK TOOL</span>
          <BreathingGuide />
        </GlassCard>

        {/* Daily recommendation */}
        <GlassCard hover={false} style={{ flex: "1 1 280px", borderLeft: "3px solid #a78bfa" }}>
          <span style={{ fontSize: 10, letterSpacing: 3, color: "#a78bfa", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 14 }}>⟡ RECOMMENDED TODAY</span>
          <h3 style={{ fontSize: 16, color: "#fff", fontWeight: 500, marginBottom: 8 }}>Morning Calibration + Deep Presence</h3>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: 16 }}>Start with 12 minutes of heart-centered intention setting, then move into 15 minutes of pure awareness meditation. Total: 27 minutes to completely recalibrate your field.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setActivePractice("morning")} style={{ padding: "6px 16px", borderRadius: 6, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4", cursor: "pointer", fontSize: 10, letterSpacing: 1, fontFamily: "'Orbitron', sans-serif" }}>CALIBRATE</button>
            <button onClick={() => setActivePractice("presence")} style={{ padding: "6px 16px", borderRadius: 6, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa", cursor: "pointer", fontSize: 10, letterSpacing: 1, fontFamily: "'Orbitron', sans-serif" }}>PRESENCE</button>
          </div>
        </GlassCard>
      </div>

      {/* Full Practice Library */}
      <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 14 }}>ALL PRACTICES</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {ZEN_PRACTICES.map(p => (
          <GlassCard key={p.id} onClick={() => { setActivePractice(p.id); setCurrentStep(0); }} style={{
            cursor: "pointer", display: "flex", alignItems: "center", gap: 16,
            borderLeft: `3px solid ${p.color}`, padding: "20px 24px",
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${p.color}12`, border: `1px solid ${p.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{p.icon}</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0, fontFamily: "'Sora', sans-serif" }}>{p.name}</h3>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{p.type} • {p.dur} • {p.steps.length} steps</div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6, lineHeight: 1.5 }}>{p.desc.substring(0, 120)}...</p>
            </div>
            <span style={{ fontSize: 10, color: p.color, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", fontWeight: 600, flexShrink: 0 }}>BEGIN →</span>
          </GlassCard>
        ))}
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
  const [mood, setMood] = useState("seeker");
  const [vibScore, setVibScore] = useState(72);
  const [chakraLevels, setChakraLevels] = useState([68, 74, 82, 91, 65, 58, 77]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const entered = phase === "app";

  // ─── USER PERSONA MODE SYSTEM ───
  const moodThemes = {
    seeker: {
      accent: "#00ff8c", accentRgb: "0,255,140", accentGlow: "rgba(0,255,140,0.3)",
      bg: "#050508", bgGrad: "none",
      label: "S33KER", icon: "◈", statusText: "FREQUENCY LOCKED • SESSION ACTIVE • ▮",
      vibe: "The default experience. Balanced between all paths. Open to everything.",
      gridOpacity: 0.02, particleOpacity: 0.35, animSpeed: "5s",
      btnBg: "rgba(0,255,140,0.12)", btnBorder: "rgba(0,255,140,0.3)", btnColor: "#00ff8c",
      sidebarBorder: "rgba(0,255,140,0.08)", sidebarGlow: "rgba(0,255,140,0.03)",
      headerGlow: "0 0 10px rgba(0,255,140,0.2)",
    },
    truther: {
      accent: "#ef4444", accentRgb: "239,68,68", accentGlow: "rgba(239,68,68,0.3)",
      bg: "#0a0506", bgGrad: "radial-gradient(ellipse at 50% 0%, rgba(80,15,15,0.12) 0%, rgba(10,5,6,1) 60%)",
      label: "TRUTH3R", icon: "👁", statusText: "EYES OPEN • SIGNAL INTERCEPTED • ◉",
      vibe: "The deep state researcher. Declassified files. Hidden agendas. Follow the money.",
      gridOpacity: 0.025, particleOpacity: 0.4, animSpeed: "4s",
      btnBg: "rgba(239,68,68,0.12)", btnBorder: "rgba(239,68,68,0.3)", btnColor: "#ef4444",
      sidebarBorder: "rgba(239,68,68,0.08)", sidebarGlow: "rgba(239,68,68,0.04)",
      headerGlow: "0 0 12px rgba(239,68,68,0.25)",
    },
    mystic: {
      accent: "#a78bfa", accentRgb: "167,139,250", accentGlow: "rgba(167,139,250,0.3)",
      bg: "#08061a", bgGrad: "radial-gradient(ellipse at 50% 0%, rgba(60,40,120,0.12) 0%, rgba(8,6,26,1) 60%)",
      label: "MYST1C", icon: "🔮", statusText: "THIRD EYE OPEN • ASTRAL CHANNEL ACTIVE • ✧",
      vibe: "The spiritual explorer. Energy, consciousness, crystals, meditation, sacred geometry.",
      gridOpacity: 0.015, particleOpacity: 0.3, animSpeed: "7s",
      btnBg: "rgba(167,139,250,0.12)", btnBorder: "rgba(167,139,250,0.3)", btnColor: "#a78bfa",
      sidebarBorder: "rgba(167,139,250,0.08)", sidebarGlow: "rgba(167,139,250,0.04)",
      headerGlow: "0 0 12px rgba(167,139,250,0.25), 0 0 30px rgba(167,139,250,0.08)",
    },
    scientist: {
      accent: "#06b6d4", accentRgb: "6,182,212", accentGlow: "rgba(6,182,212,0.3)",
      bg: "#050a0d", bgGrad: "radial-gradient(ellipse at 50% 0%, rgba(6,60,80,0.1) 0%, rgba(5,10,13,1) 60%)",
      label: "SCI3NTIST", icon: "🔬", statusText: "EMPIRICAL MODE • DATA STREAM ACTIVE • ⚛",
      vibe: "The evidence-based explorer. Peer-reviewed studies. Quantum physics. Measurable phenomena.",
      gridOpacity: 0.018, particleOpacity: 0.3, animSpeed: "6s",
      btnBg: "rgba(6,182,212,0.12)", btnBorder: "rgba(6,182,212,0.3)", btnColor: "#06b6d4",
      sidebarBorder: "rgba(6,182,212,0.08)", sidebarGlow: "rgba(6,182,212,0.03)",
      headerGlow: "0 0 10px rgba(6,182,212,0.2)",
    },
    builder: {
      accent: "#eab308", accentRgb: "234,179,8", accentGlow: "rgba(234,179,8,0.3)",
      bg: "#0d0a04", bgGrad: "radial-gradient(ellipse at 50% 0%, rgba(90,60,0,0.1) 0%, rgba(13,10,4,1) 60%)",
      label: "BUILD3R", icon: "⚡", statusText: "WORKSHOP MODE • SYSTEMS ONLINE • ⚙",
      vibe: "The maker and doer. DIY builds, off-grid tech, copper coils, earth batteries, sovereignty.",
      gridOpacity: 0.03, particleOpacity: 0.45, animSpeed: "3.5s",
      btnBg: "rgba(234,179,8,0.12)", btnBorder: "rgba(234,179,8,0.3)", btnColor: "#eab308",
      sidebarBorder: "rgba(234,179,8,0.1)", sidebarGlow: "rgba(234,179,8,0.05)",
      headerGlow: "0 0 14px rgba(234,179,8,0.3), 0 0 28px rgba(234,179,8,0.1)",
    },
  };
  const mt = moodThemes[mood];

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
    { id: "energy", label: "EN3RGY 101", icon: "⚛" },
    { id: "emotions", label: "E-MOTIONS", icon: "◭" },
    { id: "wakeup", label: "Wake Up", icon: "◉" },
    { id: "biofield", label: "BIO FI3LD", icon: "◐" },
    { id: "healing", label: "H3ALING", icon: "❋" },
    { id: "hacks", label: "R3ALITY HACKS", icon: "⚙" },
    { id: "shop", label: "VIB3 SHOP", icon: "◇" },
    { id: "knowledge", label: "Knowledge Portal", icon: "⬡" },
    { id: "practice", label: "Z3N ZON3", icon: "◎" },
    { id: "community", label: "Community", icon: "⊛" },
    { id: "events", label: "Events", icon: "⊕" },
  ];

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=JetBrains+Mono:wght@300;400;500&family=Sora:wght@200;300;400;500;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #050508; color: #fff; overflow-x: hidden; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; max-width: 100vw; }
    html { overflow-x: hidden; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
    ::-webkit-scrollbar-thumb { background: rgba(0,255,140,0.15); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(0,255,140,0.3); }
    ::selection { background: rgba(0,255,140,0.25); color: #fff; }
    input, textarea, select, button { font-family: inherit; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scanLine { 0% { top: 0; } 100% { top: 100%; } }
    @keyframes breathe { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
    @keyframes gridPulse { 0%, 100% { opacity: 0.03; } 50% { opacity: 0.06; } }
    @keyframes orbPulse { 0%, 100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.06); filter: brightness(1.2); } }
    @keyframes subtleFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
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
            {/* Animated Title with Matrix 3s */}
            <LandingTitle />
            <div style={{ marginBottom: 48 }} />
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
        <MatrixOverlay mood={mood} />
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
      <MatrixOverlay mood={mood} />
      <ParticleField mousePos={mousePos} entered={true} />
      {/* Mood background color */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: mt.bg,
        backgroundImage: mt.bgGrad,
        transition: "all 1.2s ease",
      }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 1, backgroundImage: `linear-gradient(rgba(${mt.accentRgb},${mt.gridOpacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(${mt.accentRgb},${mt.gridOpacity}) 1px, transparent 1px)`, backgroundSize: "60px 60px", pointerEvents: "none", animation: `gridPulse ${mt.animSpeed} ease-in-out infinite`, transition: "all 1s ease" }} />

      <div style={{ position: "relative", zIndex: 2, fontFamily: "'Sora', sans-serif", minHeight: "100vh", display: "flex", maxWidth: "100vw", overflow: "hidden" }}>

        {/* Mobile hamburger toggle */}
        {isMobile && (
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            position: "fixed", top: 14, left: 14, zIndex: 50,
            width: 40, height: 40, borderRadius: 10,
            background: sidebarOpen ? `${mt.accent}20` : "rgba(5,5,8,0.85)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${sidebarOpen ? `${mt.accent}40` : "rgba(255,255,255,0.08)"}`,
            color: sidebarOpen ? mt.accent : "rgba(255,255,255,0.5)",
            cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.3s ease",
          }}>
            {sidebarOpen ? "✕" : "☰"}
          </button>
        )}

        {/* Mobile overlay backdrop */}
        {isMobile && sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{
            position: "fixed", inset: 0, zIndex: 14,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
            animation: "fadeInUp 0.2s ease",
          }} />
        )}

        {/* Sidebar */}
        <nav style={{
          width: 72, position: "fixed", left: 0, top: 0, bottom: 0,
          background: "linear-gradient(180deg, rgba(5,5,8,0.95), rgba(5,5,8,0.9))",
          backdropFilter: "blur(24px) saturate(1.2)",
          borderRight: `1px solid ${mt.sidebarBorder}`,
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "20px 0", gap: 6, zIndex: 15,
          boxShadow: `2px 0 30px ${mt.sidebarGlow}`,
          transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), all 0.8s ease",
          transform: isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
        }}>
          <div style={{ fontSize: 10, fontFamily: "'Orbitron', sans-serif", color: mt.accent, letterSpacing: 2, marginBottom: 20, writingMode: "vertical-lr", textOrientation: "mixed", transform: "rotate(180deg)", opacity: 0.8, animation: `matrixGlow ${mt.animSpeed} ease-in-out infinite`, transition: "color 0.8s ease" }}>RTV33</div>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); if (isMobile) setSidebarOpen(false); }} title={item.label} style={{
              width: 42, height: 42, borderRadius: 10,
              border: activeTab === item.id ? `1px solid ${mt.accent}30` : "1px solid transparent",
              background: activeTab === item.id ? mt.btnBg : "transparent",
              color: activeTab === item.id ? mt.accent : "rgba(255,255,255,0.25)",
              cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
              boxShadow: activeTab === item.id ? `0 0 12px ${mt.accentGlow}, inset 0 0 8px ${mt.accent}08` : "none",
              transform: activeTab === item.id ? "scale(1.05)" : "scale(1)",
            }}>{item.icon}</button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${mt.accent}30, #a78bfa30)`, border: `1px solid ${mt.accent}20`, boxShadow: `0 0 10px ${mt.accent}10`, transition: "all 0.8s ease" }} />
        </nav>

        {/* Main Content */}
        <main style={{
          marginLeft: isMobile ? 0 : 72,
          flex: 1, padding: isMobile ? "16px 16px 80px" : "32px 40px",
          maxWidth: "100%", width: "100%",
          animation: "appEntrance 0.8s ease",
          overflowX: "hidden",
        }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isMobile ? 24 : 40, paddingBottom: 20, paddingTop: isMobile ? 48 : 0, borderBottom: `1px solid rgba(${mt.accentRgb},0.06)`, flexWrap: "wrap", gap: 12, transition: "all 0.8s ease" }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 400, fontFamily: "'Sora', sans-serif", color: "#fff", letterSpacing: 1, textShadow: mt.headerGlow, transition: "all 0.8s ease" }}>
                {navItems.find(n => n.id === activeTab)?.icon} {navItems.find(n => n.id === activeTab)?.label}
              </h1>
              <p style={{ fontSize: 11, color: `rgba(${mt.accentRgb},0.4)`, marginTop: 4, letterSpacing: 2, fontFamily: "'JetBrains Mono', monospace", transition: "all 0.8s ease" }}>{mt.statusText}</p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {Object.entries(moodThemes).map(([key, mTheme]) => {
                const isActive = mood === key;
                return (
                  <button key={key} onClick={() => setMood(key)} title={mTheme.vibe} style={{
                    padding: "5px 12px", borderRadius: 6, fontSize: 9, letterSpacing: 2,
                    textTransform: "uppercase", cursor: "pointer", fontFamily: "'Orbitron', sans-serif",
                    background: isActive ? mTheme.btnBg : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isActive ? mTheme.btnBorder : "rgba(255,255,255,0.05)"}`,
                    color: isActive ? mTheme.btnColor : "rgba(255,255,255,0.25)",
                    transition: "all 0.3s ease",
                    boxShadow: isActive ? `0 0 12px ${mTheme.accentGlow}` : "none",
                  }}>{mTheme.icon} {mTheme.label}</button>
                );
              })}
            </div>
          </header>

          {/* ─── DASHBOARD ─── */}
          {activeTab === "dashboard" && (
            <div style={{ animation: "fadeInUp 0.5s ease" }}>

              {/* ═══ GENERAL SITE OVERVIEW ═══ */}
              <div style={{ marginBottom: 28, padding: "32px 0 0" }}>
                <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 300, color: "#fff", fontFamily: "'Sora', sans-serif", lineHeight: 1.4, marginBottom: 6 }}>
                  Welcome back, <span style={{ color: mt.accent, fontWeight: 500, transition: "color 0.8s ease" }}>Seeker</span>
                </h2>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, maxWidth: 600 }}>
                  The collective field is strong today. 1,247 souls are connected right now. Your journey continues.
                </p>
              </div>

              {/* Quick Navigation Cards */}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
                {[
                  { tab: "energy", icon: "⚛", title: "EN3RGY 101", desc: "Start here • The foundation", color: mt.accent, stat: "START" },
                  { tab: "wakeup", icon: "◉", title: "Wake Up", desc: "10 topics • 62+ signals", color: "#ef4444", stat: "3 new" },
                  { tab: "biofield", icon: "◐", title: "Bio Fi3ld", desc: "Interactive energy explorer", color: "#a78bfa", stat: "Learn" },
                  { tab: "healing", icon: "❋", title: "H3aling", desc: "65+ herbs • 11 organs", color: "#22c55e", stat: "Match" },
                  { tab: "shop", icon: "◇", title: "Vib3 Shop", desc: "38 products • 10 categories", color: "#eab308", stat: "Browse" },
                  { tab: "knowledge", icon: "⬡", title: "Knowledge", desc: "56+ entries • 8 domains", color: "#06b6d4", stat: "Study" },
                  { tab: "community", icon: "⊛", title: "Community", desc: "Social feed • Live now", color: "#ec4899", stat: "5 online" },
                ].map(card => (
                  <GlassCard key={card.tab} onClick={() => setActiveTab(card.tab)} style={{
                    flex: "1 1 160px", minWidth: 150, cursor: "pointer", padding: 22,
                    borderTop: `2px solid ${card.color}50`, textAlign: "center",
                    background: `linear-gradient(180deg, ${card.color}06, transparent)`,
                  }}>
                    <span style={{ fontSize: 26, display: "block", marginBottom: 10, color: card.color, filter: `drop-shadow(0 0 8px ${card.color}40)` }}>{card.icon}</span>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4, fontFamily: "'Orbitron', sans-serif", letterSpacing: 1 }}>{card.title}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 10, fontFamily: "'Sora', sans-serif" }}>{card.desc}</div>
                    <span style={{ fontSize: 9, padding: "3px 12px", borderRadius: 12, background: `${card.color}15`, border: `1px solid ${card.color}30`, color: card.color, letterSpacing: 1, fontFamily: "'Orbitron', sans-serif", fontWeight: 600 }}>{card.stat}</span>
                  </GlassCard>
                ))}
              </div>

              {/* Site Activity Feed */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
                {/* Latest Signals */}
                <GlassCard hover={false} style={{ flex: "1 1 340px", minWidth: 300 }}>
                  <span style={{ fontSize: 10, letterSpacing: 3, color: mt.accent, textTransform: "uppercase", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 16, transition: "color 0.8s ease" }}>⟡ LATEST SIGNALS</span>
                  {[
                    { icon: "🕸️", text: "New declassified CIA documents added to Wake Up section", time: "2h ago", color: "#ef4444" },
                    { icon: "🌿", text: "Chaga mushroom protocol added to H3aling liver section", time: "5h ago", color: "#22c55e" },
                    { icon: "⚡", text: "BluShield Tesla Gold Series now in VIB3 Shop", time: "8h ago", color: "#eab308" },
                    { icon: "◐", text: "New lesson: 'How Your Field Affects Others' in Bio Fi3ld", time: "12h ago", color: "#a78bfa" },
                    { icon: "⊛", text: "Kael shared a Rodin coil tutorial in Community", time: "1d ago", color: "#ec4899" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.5 }}>{item.text}</p>
                      </div>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", flexShrink: 0, fontFamily: "'JetBrains Mono', monospace" }}>{item.time}</span>
                    </div>
                  ))}
                </GlassCard>

                {/* Global Stats */}
                <div style={{ flex: "0 1 260px", display: "flex", flexDirection: "column", gap: 14 }}>
                  <GlassCard hover={false} style={{ padding: 20 }}>
                    <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 14 }}>COLLECTIVE FIELD</span>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Souls Online</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#00ff8c", fontFamily: "'Orbitron', sans-serif" }}>1,247</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Meditations Today</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#06b6d4", fontFamily: "'Orbitron', sans-serif" }}>3,891</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Signals Shared</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#a78bfa", fontFamily: "'Orbitron', sans-serif" }}>12.4K</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Collective Vibe</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#eab308", fontFamily: "'Orbitron', sans-serif" }}>RISING ↑</span>
                    </div>
                  </GlassCard>

                  <GlassCard hover={false} style={{ padding: 20 }}>
                    <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 14 }}>NEXT EVENT</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#a78bfa", boxShadow: "0 0 8px rgba(167,139,250,0.5)", animation: "orbPulse 2s ease-in-out infinite" }} />
                      <div>
                        <div style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>Full Moon Meditation</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>Mar 29 • 9PM UTC</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "#a78bfa", marginTop: 10 }}>342 souls attending</div>
                    <button onClick={() => setActiveTab("events")} style={{ marginTop: 12, padding: "6px 16px", borderRadius: 6, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa", cursor: "pointer", fontSize: 10, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", width: "100%" }}>VIEW ALL EVENTS</button>
                  </GlassCard>

                  <GlassCard hover={false} style={{ padding: 20 }}>
                    <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 14 }}>TRENDING NOW</span>
                    {[
                      { tag: "#scalarhealing", color: "#06b6d4" },
                      { tag: "#369code", color: "#eab308" },
                      { tag: "#coppercoils", color: "#f97316" },
                    ].map(t => (
                      <div key={t.tag} style={{ fontSize: 12, color: t.color, marginBottom: 6, cursor: "pointer" }}>{t.tag}</div>
                    ))}
                  </GlassCard>
                </div>
              </div>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <div style={{ flex: 1, height: 1, background: `rgba(${mt.accentRgb},0.08)` }} />
                <span style={{ fontSize: 10, letterSpacing: 4, color: "rgba(255,255,255,0.2)", fontFamily: "'Orbitron', sans-serif" }}>YOUR PERSONAL FREQUENCY</span>
                <div style={{ flex: 1, height: 1, background: `rgba(${mt.accentRgb},0.08)` }} />
              </div>

              {/* ═══ PERSONAL VIBRATION (pushed down) ═══ */}
              <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 32 }}>
                <GlassCard style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, flex: "0 0 260px" }} hover={false}>
                  <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontFamily: "'Orbitron', sans-serif" }}>Your Vibration</span>
                  <EnergyOrb score={vibScore} mood={mood} />
                  <span style={{ fontSize: 11, color: mt.accent, textTransform: "uppercase", letterSpacing: 3, fontFamily: "'Orbitron', sans-serif", transition: "color 0.8s ease" }}>{mood} state</span>
                </GlassCard>
                <GlassCard style={{ flex: 1, minWidth: 300 }} hover={false}>
                  <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 20 }}>Chakra Alignment</span>
                  <ChakraMeter levels={chakraLevels} />
                </GlassCard>
              </div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
                {[{ label: "Streak", value: "14 days", icon: "🔥", color: "#f97316" }, { label: "Meditations", value: "47", icon: "🧘", color: "#06b6d4" }, { label: "Level", value: "Seeker III", icon: "◈", color: "#00ff8c" }, { label: "Insights", value: "23 unlocked", icon: "✧", color: "#a78bfa" }].map(s => (
                  <GlassCard key={s.label} style={{ flex: "1 1 140px", padding: 22, textAlign: "center", borderTop: `2px solid ${s.color}25` }}>
                    <div style={{ fontSize: 24, marginBottom: 10, filter: "drop-shadow(0 0 8px rgba(255,255,255,0.1))" }}>{s.icon}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Orbitron', sans-serif", textShadow: `0 0 15px ${s.color}25` }}>{s.value}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 2, marginTop: 6, textTransform: "uppercase", fontFamily: "'Sora', sans-serif", fontWeight: 500 }}>{s.label}</div>
                  </GlassCard>
                ))}
              </div>
              <GlassCard hover={false} style={{ borderLeft: `3px solid ${mt.accent}`, transition: "all 0.8s ease" }}>
                <span style={{ fontSize: 10, letterSpacing: 3, color: mt.accent, textTransform: "uppercase", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 16, transition: "color 0.8s ease" }}>⟡ Today's Signal — {mt.label}</span>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, maxWidth: 600 }}>
                  {mood === "seeker" && "Your path is open. The collective field is strong today — explore whatever calls to you. Start with EN3RGY 101 if you're new, or dive into the section that resonates. There's no wrong door. Every path leads to the same truth."}
                  {mood === "truther" && "New signals detected. 3 articles added to the Wake Up feed this week. The Epstein document cache has been updated. Cross-reference with the Knowledge Portal's declassified section. Remember: primary sources only. Read the documents yourself. Think for yourself."}
                  {mood === "mystic" && "The veil is thin today. Your third eye chakra is showing strong alignment. Consider a deep presence meditation followed by the Bio Fi3ld visualizer — set it to love and sit with it for 5 minutes. The E-MOTIONS section has new content on synchronicity and creation. Let intuition guide your path."}
                  {mood === "scientist" && "Your biofield data shows increasing coherence over the past 14 days. The HeartMath research in the Bio Fi3ld section has been expanded with new peer-reviewed citations. The EN3RGY 101 chapter on resonance connects directly to the Schumann Resonance data in Knowledge Portal. Follow the evidence."}
                  {mood === "builder" && "Workshop mode active. The R3ALITY HACKS section has new builds: earth battery designs and copper pyramid construction guides. Check the tensor ring deep dive for the sacred cubit measurements. The VIB3 SHOP has copper wire and tools. Stop reading — start building."}
                </p>
                <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
                  <button onClick={() => setActiveTab(mood === "truther" ? "wakeup" : mood === "mystic" ? "practice" : mood === "scientist" ? "biofield" : mood === "builder" ? "hacks" : "energy")} style={{ padding: "8px 20px", borderRadius: 6, background: mt.btnBg, border: `1px solid ${mt.btnBorder}`, color: mt.accent, cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif", transition: "all 0.5s ease" }}>
                    {mood === "seeker" ? "BEGIN JOURNEY" : mood === "truther" ? "VIEW SIGNALS" : mood === "mystic" ? "ENTER Z3N ZON3" : mood === "scientist" ? "VIEW BIOFIELD" : "OPEN WORKSHOP"}
                  </button>
                  <button onClick={() => setActiveTab("energy")} style={{ padding: "8px 20px", borderRadius: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 11, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>EN3RGY 101</button>
                </div>
              </GlassCard>
            </div>
          )}

          {/* ─── EN3RGY 101 ─── */}
          {activeTab === "energy" && <Energy101Section setActiveTab={setActiveTab} />}

          {/* ─── E-MOTIONS ─── */}
          {activeTab === "emotions" && <EmotionsSection />}

          {/* ─── WAKE UP ─── */}
          {activeTab === "wakeup" && <WakeUpSection />}

          {/* ─── BIO FI3LD ─── */}
          {activeTab === "biofield" && <BiofieldSection />}

          {/* ─── H3ALING ─── */}
          {activeTab === "healing" && <HealingSection />}

          {/* ─── R3ALITY HACKS ─── */}
          {activeTab === "hacks" && <RealityHacksSection />}

          {/* ─── VIB3 SHOP ─── */}
          {activeTab === "shop" && <VibeShop />}

          {/* ─── KNOWLEDGE PORTAL ─── */}
          {activeTab === "knowledge" && <KnowledgePortal />}

          {/* ─── PRACTICE ─── */}
          {activeTab === "practice" && <ZenZoneSection />}

          {/* ─── COMMUNITY — SOCIAL FEED ─── */}
          {activeTab === "community" && <CommunityFeed />}

          {/* ─── EVENTS ─── */}
          {activeTab === "events" && (
            <div style={{ animation: "fadeInUp 0.5s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <div style={{ width: 3, height: 28, background: "linear-gradient(to bottom, #a78bfa, #00ff8c)", borderRadius: 2 }} />
                <h2 style={{ fontSize: 22, fontWeight: 300, color: "#fff", fontFamily: "'Sora', sans-serif", margin: 0 }}>COLLECTIVE EVENTS</h2>
              </div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 24, marginTop: 8, lineHeight: 1.8 }}>Synchronized collective experiences. When we tune in together, the signal amplifies exponentially. HeartMath research shows group coherence creates measurable effects on Earth's magnetic field.</p>

              {/* Live Map */}
              <GlassCard hover={false} style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 10, letterSpacing: 3, color: "#00ff8c", textTransform: "uppercase", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 16 }}>GLOBAL MEDITATION MAP — LIVE</span>
                <WorldMap />
              </GlassCard>

              {/* Upcoming Events */}
              <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 14 }}>UPCOMING EVENTS</span>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
                {[
                  { title: "Full Moon Collective Meditation", date: "Mar 29 • 9PM UTC", attendees: 342, color: "#a78bfa", desc: "Harness the full moon's amplified electromagnetic energy. 30 minutes of synchronized heart coherence. Guided by the collective field.", host: "RTV33 Official" },
                  { title: "Breathwork Convergence", date: "Apr 2 • 6AM UTC", attendees: 189, color: "#06b6d4", desc: "Global Wim Hof-style power breathing. 3 rounds, 200+ people breathing together across time zones. The combined field is extraordinary.", host: "Zenith" },
                  { title: "Silent Frequency Alignment", date: "Apr 7 • 12PM UTC", attendees: 567, color: "#00ff8c", desc: "No guided audio. No music. 20 minutes of pure synchronized silence across the planet. The most powerful practice: collective non-doing.", host: "RTV33 Official" },
                  { title: "369 Manifestation Circle", date: "Apr 10 • 8PM UTC", attendees: 234, color: "#eab308", desc: "Write your intention 3x, 6x, 9x while 200+ souls do the same. Tesla's code meets collective consciousness. Amplified intent.", host: "Kael" },
                  { title: "New Moon Intention Setting", date: "Apr 13 • 7PM UTC", attendees: 445, color: "#ec4899", desc: "New moons are for planting seeds. Set intentions as a collective. Guided visualization + heart coherence + written declarations.", host: "Luna" },
                  { title: "Sunday Sound Bath", date: "Every Sunday • 4PM UTC", attendees: 128, color: "#f97316", desc: "Weekly 432Hz sound healing session. Tibetan bowls, tuning forks, and binaural beats. Join from anywhere — just close your eyes and receive.", host: "Sol" },
                ].map(evt => (
                  <GlassCard key={evt.title} style={{ flex: "1 1 300px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: evt.color, boxShadow: `0 0 10px ${evt.color}88`, animation: "orbPulse 2s ease-in-out infinite" }} />
                      <span style={{ fontSize: 10, color: evt.color, fontFamily: "'Orbitron', sans-serif", letterSpacing: 2 }}>UPCOMING</span>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 6, fontFamily: "'Sora', sans-serif" }}>{evt.title}</h3>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>{evt.date}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, margin: "8px 0 12px" }}>{evt.desc}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 11, color: evt.color }}>{evt.attendees} souls</span>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginLeft: 8 }}>Host: {evt.host}</span>
                      </div>
                      <button style={{ padding: "8px 18px", borderRadius: 6, background: `${evt.color}15`, border: `1px solid ${evt.color}40`, color: evt.color, cursor: "pointer", fontSize: 10, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>JOIN</button>
                    </div>
                  </GlassCard>
                ))}
              </div>

              {/* Past Events / Recordings */}
              <span style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", fontFamily: "'Orbitron', sans-serif", display: "block", marginBottom: 14 }}>PAST EVENTS — RECORDINGS</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {[
                  { title: "Equinox Collective Meditation", date: "Mar 20", attendees: 1203, color: "#a78bfa" },
                  { title: "Solar Flare Frequency Session", date: "Mar 15", attendees: 678, color: "#eab308" },
                  { title: "Heart Coherence Workshop", date: "Mar 8", attendees: 445, color: "#ef4444" },
                  { title: "Grounding & Earthing Live Class", date: "Mar 1", attendees: 312, color: "#22c55e" },
                ].map(evt => (
                  <GlassCard key={evt.title} style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: `${evt.color}10`, border: `1px solid ${evt.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>▶</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>{evt.title}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{evt.date} • {evt.attendees} participants</div>
                    </div>
                    <span style={{ fontSize: 10, color: evt.color, letterSpacing: 2, fontFamily: "'Orbitron', sans-serif" }}>REPLAY →</span>
                  </GlassCard>
                ))}
              </div>

              {/* Host your own */}
              <GlassCard hover={false} style={{ textAlign: "center", borderTop: "2px solid rgba(0,255,140,0.15)" }}>
                <span style={{ fontSize: 36, display: "block", marginBottom: 12 }}>🌐</span>
                <h3 style={{ fontSize: 18, color: "#fff", fontWeight: 400, marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>Host Your Own Collective Event</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, maxWidth: 500, margin: "0 auto 20px" }}>
                  Lead a meditation, breathwork session, sound bath, or workshop for the RTV33 community. Your event appears on the global map and all members can join.
                </p>
                <button style={{ padding: "10px 28px", borderRadius: 8, background: "rgba(0,255,140,0.1)", border: "1px solid rgba(0,255,140,0.3)", color: "#00ff8c", cursor: "pointer", fontSize: 11, letterSpacing: 3, fontFamily: "'Orbitron', sans-serif" }}>CREATE EVENT</button>
              </GlassCard>
            </div>
          )}

          <footer style={{ marginTop: 80, paddingTop: 24, borderTop: `1px solid rgba(${mt.accentRgb},0.06)`, display: "flex", justifyContent: "space-between", paddingBottom: 32, flexWrap: "wrap", gap: 8, transition: "all 0.8s ease" }}>
            <span style={{ fontSize: 10, color: `rgba(${mt.accentRgb},0.25)`, letterSpacing: 3, fontFamily: "'Orbitron', sans-serif" }}>RAIS3 TH3 VIBRATION — RTV33</span>
            <span style={{ fontSize: 10, color: `rgba(${mt.accentRgb},0.15)`, fontFamily: "'JetBrains Mono', monospace" }}>v3.3 • TH3 SIGNAL IS 3T3RNAL • ◈</span>
          </footer>
        </main>

        {/* Mobile Bottom Tab Bar */}
        {isMobile && (
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20,
            background: "linear-gradient(180deg, rgba(5,5,8,0.9), rgba(5,5,8,0.98))",
            backdropFilter: "blur(20px) saturate(1.2)",
            borderTop: `1px solid ${mt.sidebarBorder}`,
            display: "flex", justifyContent: "space-around", alignItems: "center",
            padding: "8px 4px 12px", paddingBottom: "max(12px, env(safe-area-inset-bottom))",
            transition: "all 0.8s ease",
          }}>
            {[
              { id: "dashboard", icon: "◈" },
              { id: "energy", icon: "⚛" },
              { id: "emotions", icon: "◭" },
              { id: "healing", icon: "❋" },
              { id: "hacks", icon: "⚙" },
            ].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
                background: "none", border: "none",
                color: activeTab === item.id ? mt.accent : "rgba(255,255,255,0.25)",
                fontSize: 18, cursor: "pointer", padding: "4px 8px",
                transition: "all 0.3s ease",
                transform: activeTab === item.id ? "scale(1.15)" : "scale(1)",
                filter: activeTab === item.id ? `drop-shadow(0 0 6px ${mt.accent}60)` : "none",
              }}>{item.icon}</button>
            ))}
            <button onClick={() => setSidebarOpen(true)} style={{
              background: "none", border: "none",
              color: "rgba(255,255,255,0.25)",
              fontSize: 16, cursor: "pointer", padding: "4px 8px",
            }}>⋯</button>
          </div>
        )}
      </div>
    </>
  );
}

import { useState, useEffect } from "react";

export default function App() {
  const [activeLesson, setActiveLesson] = useState(null);
  const [tab, setTab] = useState("home");

  const lessons = [
    { id: 1, title: "Introduction", content: "Welcome to RTV33 system." },
    { id: 2, title: "Biofield Basics", content: "Your body generates electromagnetic signals." },
    { id: 3, title: "Healing Systems", content: "Organ + herbal mapping overview." }
  ];

  return (
    <div style={styles.app}>
      <Header setTab={setTab} />

      {tab === "home" && (
        <Home
          lessons={lessons}
          setActiveLesson={setActiveLesson}
        />
      )}

      {tab === "biofield" && <Biofield />}

      {tab === "healing" && <HealingSystem />}

      {tab === "lessons" && (
        <Lessons
          lessons={lessons}
          setActiveLesson={setActiveLesson}
          activeLesson={activeLesson}
        />
      )}
    </div>
  );
}

/* ---------------- HEADER ---------------- */
function Header({ setTab }) {
  return (
    <div style={styles.header}>
      <button onClick={() => setTab("home")}>Home</button>
      <button onClick={() => setTab("biofield")}>Biofield</button>
      <button onClick={() => setTab("healing")}>Healing</button>
      <button onClick={() => setTab("lessons")}>Lessons</button>
    </div>
  );
}

/* ---------------- HOME ---------------- */
function Home({ lessons, setActiveLesson }) {
  return (
    <div>
      <h1>RTV33 System</h1>
      <p>Multi-system biofield + learning interface</p>

      <div style={styles.card}>
        <h3>Quick Lessons</h3>
        {lessons.map((l) => (
          <div
            key={l.id}
            style={styles.item}
            onClick={() => setActiveLesson(l.id)}
          >
            {l.title}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- LESSONS ---------------- */
function Lessons({ lessons, activeLesson, setActiveLesson }) {
  const lesson = lessons.find((l) => l.id === activeLesson);

  if (activeLesson) {
    return (
      <div style={styles.card}>
        <button onClick={() => setActiveLesson(null)}>← Back</button>
        <h2>{lesson.title}</h2>
        <p>{lesson.content}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Lessons</h2>
      {lessons.map((l) => (
        <div
          key={l.id}
          style={styles.item}
          onClick={() => setActiveLesson(l.id)}
        >
          {l.title}
        </div>
      ))}
    </div>
  );
}

/* ---------------- BIOFIELD ---------------- */
function Biofield() {
  const [emotion, setEmotion] = useState("neutral");
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setPulse((p) => (p + 1) % 100);
    }, 50);

    return () => clearInterval(t);
  }, []);

  return (
    <div style={styles.card}>
      <h2>Biofield System</h2>

      <p>Emotion: {emotion}</p>

      <div style={styles.row}>
        <button onClick={() => setEmotion("calm")}>Calm</button>
        <button onClick={() => setEmotion("focused")}>Focused</button>
        <button onClick={() => setEmotion("neutral")}>Neutral</button>
      </div>

      <p>Pulse: {pulse}</p>
    </div>
  );
}

/* ---------------- HEALING SYSTEM ---------------- */
function HealingSystem() {
  const organs = [
    {
      name: "Brain",
      herbs: ["Lion's Mane", "Bacopa", "Ginkgo"]
    },
    {
      name: "Heart",
      herbs: ["Hawthorn", "Garlic", "Motherwort"]
    },
    {
      name: "Liver",
      herbs: ["Milk Thistle", "Dandelion", "Turmeric"]
    }
  ];

  return (
    <div>
      <h2>Healing System</h2>

      {organs.map((o, i) => (
        <div key={i} style={styles.card}>
          <h3>{o.name}</h3>
          <p>{o.herbs.join(", ")}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const styles = {
  app: {
    fontFamily: "Arial",
    padding: 20,
    background: "#0f0f0f",
    color: "white",
    minHeight: "100vh"
  },
  header: {
    display: "flex",
    gap: 10,
    marginBottom: 20
  },
  card: {
    padding: 15,
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 10,
    marginBottom: 15
  },
  item: {
    padding: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    marginTop: 8,
    cursor: "pointer"
  },
  row: {
    display: "flex",
    gap: 10
  }
};
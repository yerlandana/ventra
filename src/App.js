// src/App.js
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";

// ─── FIREBASE CONFIG ───
const firebaseConfig = {
  apiKey: "AIzaSyB4tHLoM4JHRnFhYWg6fWMrKH_VqboOfGs",
  authDomain: "login-8c975.firebaseapp.com",
  databaseURL: "https://login-8c975.firebaseio.com",
  projectId: "login-8c975",
  storageBucket: "login-8c975.firebasestorage.app",
  messagingSenderId: "579935469606",
  appId: "1:579935469606:web:fdfa1d938afc2f3fc726e7",
  measurementId: "G-WDF1RWTML3"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const ADMIN_EMAIL = "dyerlanova@gmail.com";

// ─── FIRESTORE HELPERS ───
const FB = {
  // Students
  getStudents: async () => {
    const snap = await getDocs(collection(db, "students"));
    const result = {};
    snap.forEach(d => { result[d.id] = d.data(); });
    return result;
  },
  getStudent: async (email) => {
    const snap = await getDoc(doc(db, "students", email));
    return snap.exists() ? snap.data() : null;
  },
  setStudent: async (email, data) => {
    await setDoc(doc(db, "students", email), data);
  },
  updateStudent: async (email, data) => {
    await updateDoc(doc(db, "students", email), data);
  },
  deleteStudent: async (email) => {
    await deleteDoc(doc(db, "students", email));
  },
  // Progress
  getProgress: async (email) => {
    const snap = await getDoc(doc(db, "progress", email));
    return snap.exists() ? snap.data() : {};
  },
  setProgress: async (email, data) => {
    await setDoc(doc(db, "progress", email), data, { merge: true });
  },
  getAllProgress: async () => {
    const snap = await getDocs(collection(db, "progress"));
    const result = {};
    snap.forEach(d => { result[d.id] = d.data(); });
    return result;
  },
  // Submissions
  getSubmissions: async (email) => {
    const snap = await getDoc(doc(db, "submissions", email));
    return snap.exists() ? snap.data() : {};
  },
  setSubmission: async (email, lessonId, data) => {
    await setDoc(doc(db, "submissions", email), { [lessonId]: data }, { merge: true });
  },
  // Modules — каждый урок хранится отдельно
  getModules: async () => {
    const snap = await getDoc(doc(db, "config", "structure"));
    if (!snap.exists()) return null;
    const structure = snap.data().modules;
    // Конвертируем pairs обратно в массивы
    structure.forEach(m => m.lessons.forEach(l => {
      l.quiz.questions.forEach(q => {
        if (q.type === "match" && q.pairs && q.pairs[0] && q.pairs[0].k !== undefined) {
          q.pairs = q.pairs.map(p => [p.k, p.v]);
        }
      });
    }));
    // Загружаем материалы каждого урока отдельно
    const allLessons = structure.flatMap(m => m.lessons);
    await Promise.all(allLessons.map(async (lesson) => {
      try {
        const lSnap = await getDoc(doc(db, "lessons", lesson.id));
        if (lSnap.exists()) lesson.materials = lSnap.data().materials || [];
        else lesson.materials = [];
      } catch(e) { lesson.materials = []; }
    }));
    return structure;
  },
  setModules: async (modules) => {
    // Конвертируем вложенные массивы (pairs) в объекты для Firestore
    const sanitize = (modules) => modules.map(m => ({
      ...m,
      lessons: m.lessons.map(l => ({
        ...l,
        materials: [],
        quiz: {
          ...l.quiz,
          questions: l.quiz.questions.map(q => {
            if (q.type === "match" && q.pairs) {
              return {
                ...q,
                pairs: q.pairs.map(([k, v]) => ({ k, v }))
              };
            }
            return q;
          })
        }
      }))
    }));
    const structure = sanitize(modules);
    await setDoc(doc(db, "config", "structure"), { modules: structure });
    // Сохраняем материалы каждого урока отдельно
    const allLessons = modules.flatMap(m => m.lessons);
    await Promise.all(allLessons.map(l =>
      setDoc(doc(db, "lessons", l.id), { materials: l.materials || [] }, { merge: true })
    ));
  },
  // Сохранить материалы только одного урока
  setLessonMaterials: async (lessonId, materials) => {
    await setDoc(doc(db, "lessons", lessonId), { materials }, { merge: true });
  },
  getLessonMaterials: async (lessonId) => {
    const snap = await getDoc(doc(db, "lessons", lessonId));
    return snap.exists() ? (snap.data().materials || []) : [];
  },
};

// ─── LOCAL SESSION ───
const getSession = () => { try { return JSON.parse(localStorage.getItem("lms_session")); } catch { return null; } };
const saveSession = (s) => localStorage.setItem("lms_session", JSON.stringify(s));

// ─── TAG COLORS ───
const TC = { Intro:"#6b7280",Vocab:"#8b5cf6",Grammar:"#0891b2",Listening:"#16a34a",Reading:"#ca8a04",Writing:"#dc2626",Speaking:"#9333ea",Mock:"#ea580c",Final:"#1d4ed8" };

// ─── INITIAL MODULES ───
const INITIAL_MODULES = [
  {
    id: 1, title: "MODULE 1: FOUNDATION", color: "#4285F4", bg: "#e8f0fe",
    lessons: [
      { id: "1-1", n: 1, title: "IELTS Overview & Diagnostic Test", tag: "Intro", materials: [],
        quiz: { questions: [
          { type: "mc", q: "What does IELTS stand for?", options: ["International English Language Testing System","International English Learning Test System","International Exam for Language Testing Skills","None of the above"], answer: 0, points: 10 },
          { type: "tf", q: "IELTS Academic and General Training are exactly the same.", answer: false, points: 10 },
          { type: "fitb", q: "The IELTS exam has ___ main sections.", answer: "4", points: 10 },
          { type: "match", q: "Match the skill to its time limit", pairs: [["Listening","30 min"],["Reading","60 min"],["Writing","60 min"],["Speaking","15 min"]], points: 20 },
        ]},
        assignment: { type: "writing", prompt: "Write 150 words: Why do you want to get IELTS 6.0? What will it change in your life?" }
      },
      { id: "1-2", n: 2, title: "Academic Vocabulary Builder I", tag: "Vocab", materials: [],
        quiz: { questions: [
          { type: "mc", q: "Which word is a synonym for 'analyse'?", options: ["Examine","Ignore","Create","Delete"], answer: 0, points: 10 },
          { type: "fitb", q: "The study _______ that exercise improves memory. (indicate)", answer: "indicates", points: 10 },
          { type: "tf", q: "'Significant' means 'very small or unimportant'.", answer: false, points: 10 },
          { type: "mc", q: "Choose the correct collocation:", options: ["Do a concept","Make a concept","Establish a concept","Take a concept"], answer: 2, points: 10 },
        ]},
        assignment: { type: "writing", prompt: "Write 5 sentences using these AWL words: analyse, concept, significant, establish, indicate." }
      },
      { id: "1-3", n: 3, title: "Grammar — Tenses & Passive Voice", tag: "Grammar", materials: [],
        quiz: { questions: [
          { type: "mc", q: "Which sentence uses passive voice correctly?", options: ["The results showed an increase.","An increase was showed by results.","An increase was shown in the results.","The results are show an increase."], answer: 2, points: 10 },
          { type: "fitb", q: "The data ___ (collect) in 2020.", answer: "was collected", points: 15 },
          { type: "tf", q: "Passive voice is commonly used in IELTS Writing Task 1.", answer: true, points: 10 },
        ]},
        assignment: { type: "writing", prompt: "Rewrite these 5 sentences in passive voice:\n1. Scientists discovered the vaccine.\n2. The government introduced new policies.\n3. Researchers conducted the experiment.\n4. The company launched the product.\n5. Teachers assessed the students." }
      },
    ]
  },
  {
    id: 2, title: "MODULE 2: LISTENING", color: "#34A853", bg: "#e6f4ea",
    lessons: [
      { id: "2-1", n: 4, title: "Listening — Sections 1 & 2", tag: "Listening", materials: [],
        quiz: { questions: [
          { type: "mc", q: "In IELTS Listening Section 1, you typically hear:", options: ["A university lecture","An everyday social conversation","A discussion between 4 people","A radio programme"], answer: 1, points: 10 },
          { type: "tf", q: "Spelling mistakes in Listening answers will cost you marks.", answer: true, points: 10 },
          { type: "fitb", q: "You should read the questions _______ the recording starts.", answer: "before", points: 10 },
        ]},
        assignment: { type: "writing", prompt: "Listen to any English podcast for 10 minutes. Write a 5-sentence summary of what you heard." }
      },
      { id: "2-2", n: 5, title: "Listening — Sections 3 & 4", tag: "Listening", materials: [],
        quiz: { questions: [
          { type: "mc", q: "Section 4 of IELTS Listening is:", options: ["A conversation between students","A monologue on an academic subject","A job interview","A social conversation"], answer: 1, points: 10 },
          { type: "tf", q: "You hear the recording twice in IELTS Listening.", answer: false, points: 10 },
          { type: "mc", q: "What is a 'distractor' in listening?", options: ["Background noise","An answer that seems correct but isn't","A type of question","A speaker's accent"], answer: 1, points: 10 },
        ]},
        assignment: { type: "writing", prompt: "Watch a BBC documentary clip (min. 5 min). Answer: What was the main topic? List 3 key facts you heard." }
      },
    ]
  },
  {
    id: 3, title: "MODULE 3: READING", color: "#FBBC04", bg: "#fff8e1",
    lessons: [
      { id: "3-1", n: 7, title: "Reading — True/False/Not Given", tag: "Reading", materials: [],
        quiz: { questions: [
          { type: "mc", q: "What does 'Not Given' mean in IELTS Reading?", options: ["The statement is wrong","The information is not in the text","The statement is correct","The question is invalid"], answer: 1, points: 10 },
          { type: "tf", q: "'False' and 'Not Given' mean the same thing.", answer: false, points: 10 },
          { type: "fitb", q: "_______ means reading quickly to get the general idea.", answer: "Skimming", points: 10 },
        ]},
        assignment: { type: "writing", prompt: "Read any news article in English. Write: 1) Main idea. 2) Three supporting details. 3) One thing NOT mentioned." }
      },
    ]
  },
  {
    id: 4, title: "MODULE 4: WRITING", color: "#EA4335", bg: "#fce8e6",
    lessons: [
      { id: "4-1", n: 11, title: "Writing Task 1 — Graphs & Charts", tag: "Writing", materials: [],
        quiz: { questions: [
          { type: "mc", q: "What MUST you include in every Task 1 response?", options: ["Your opinion","An overview of main trends","Exact figures for every data point","A conclusion paragraph"], answer: 1, points: 10 },
          { type: "fitb", q: "The minimum word count for Task 1 is ___ words.", answer: "150", points: 10 },
          { type: "tf", q: "You should describe every single number in a graph.", answer: false, points: 10 },
        ]},
        assignment: { type: "essay", prompt: "IELTS Writing Task 1: The graph shows internet access in three countries 2000-2020. UK: 25%→95%, Kazakhstan: 5%→79%, Japan: 30%→92%. Summarise the main features and make comparisons. Write at least 150 words." }
      },
      { id: "4-2", n: 14, title: "Writing Task 2 — Opinion Essay", tag: "Writing", materials: [],
        quiz: { questions: [
          { type: "mc", q: "How many paragraphs should a standard Task 2 essay have?", options: ["2","3","4","5"], answer: 2, points: 10 },
          { type: "fitb", q: "The minimum word count for Task 2 is ___ words.", answer: "250", points: 10 },
          { type: "tf", q: "In an opinion essay, you must clearly state your position.", answer: true, points: 10 },
        ]},
        assignment: { type: "essay", prompt: "IELTS Writing Task 2: Some people believe technology has made our lives more complicated. Others think it has made life easier. Discuss both views and give your own opinion. Write at least 250 words." }
      },
    ]
  },
  {
    id: 5, title: "MODULE 5: SPEAKING", color: "#9334E6", bg: "#f3e8ff",
    lessons: [
      { id: "5-1", n: 18, title: "Speaking Part 1 — Fluency", tag: "Speaking", materials: [],
        quiz: { questions: [
          { type: "mc", q: "How long should Part 1 answers typically be?", options: ["One word","One sentence","2-4 sentences","A full minute"], answer: 2, points: 10 },
          { type: "tf", q: "It's okay to ask the examiner to repeat a question.", answer: true, points: 10 },
          { type: "fitb", q: "AREA stands for Answer, Reason, Example, ______.", answer: "Add", points: 10 },
        ]},
        assignment: { type: "speaking", prompt: "Record yourself answering:\n1. Describe your hometown.\n2. What do you like to do in your free time?\n3. Do you prefer studying alone or with others?\n\nPaste a link to your recording, or write your answers." }
      },
    ]
  },
];

// ══════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════
export default function App() {
  const [session, setSession] = useState(getSession);
  const [page, setPage] = useState("course");
  const [currentLesson, setCurrentLesson] = useState(null);
  const [modules, setModules] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load modules from Firebase on start
  useEffect(() => {
    const load = async () => {
      try {
        let mods = await FB.getModules();
        if (!mods) {
          await FB.setModules(INITIAL_MODULES);
          mods = INITIAL_MODULES;
        }
        setModules(mods);
      } catch (e) {
        setModules(INITIAL_MODULES);
      }
      setLoading(false);
    };
    load();
  }, []);

  const login = (s) => { saveSession(s); setSession(s); };
  const logout = () => { saveSession(null); setSession(null); setPage("course"); };

  const refreshModules = async () => {
    const mods = await FB.getModules();
    setModules(mods || INITIAL_MODULES);
    if (currentLesson) {
      const updated = (mods || INITIAL_MODULES).flatMap(m => m.lessons).find(l => l.id === currentLesson.id);
      if (updated) setCurrentLesson(updated);
    }
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#1a73e8,#9334E6)", fontFamily:"sans-serif" }}>
      <div style={{ color:"white", textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🎯</div>
        <div style={{ fontSize:18, fontWeight:700 }}>Loading IELTS LMS...</div>
      </div>
    </div>
  );

  if (!session) return <Login login={login} />;

  const isAdmin = session.email === ADMIN_EMAIL;

  if (page === "admin" && isAdmin) return <AdminPanel session={session} logout={logout} setPage={setPage} />;
  if (page === "leaderboard") return <Leaderboard session={session} setPage={setPage} />;
  if (page === "dashboard") return <Dashboard session={session} setPage={setPage} modules={modules} />;
  if (page === "lesson" && currentLesson) return <LessonPage lesson={currentLesson} session={session} setPage={setPage} setCurrentLesson={setCurrentLesson} isAdmin={isAdmin} refreshModules={refreshModules} modules={modules} />;
  if (page === "quiz" && currentLesson) return <QuizPage lesson={currentLesson} session={session} setPage={setPage} />;
  if (page === "assignment" && currentLesson) return <AssignmentPage lesson={currentLesson} session={session} setPage={setPage} />;

  return <CoursePage session={session} logout={logout} setPage={setPage} setCurrentLesson={setCurrentLesson} isAdmin={isAdmin} modules={modules} />;
}

// ══════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════
function Login({ login }) {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const go = async () => {
    const e = email.trim().toLowerCase();
    if (!e) { setErr("Enter your email"); return; }
    setLoading(true);
    if (e === ADMIN_EMAIL) { login({ email: e, role: "admin", name: "Teacher Dana" }); return; }
    try {
      const student = await FB.getStudent(e);
      if (!student) { setErr("❌ No access. Ask your teacher to add your email."); setLoading(false); return; }
      if (student.status === "revoked") { setErr("❌ Your access has been revoked. Contact your teacher."); setLoading(false); return; }
      await FB.updateStudent(e, { lastLogin: new Date().toISOString() });
      login({ email: e, role: "student", name: student.name });
    } catch(err) {
      setErr("Connection error. Please try again."); setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1a73e8,#9334E6)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"sans-serif" }}>
      <div style={{ background:"white", borderRadius:20, padding:44, width:380, boxShadow:"0 8px 40px rgba(0,0,0,0.2)" }}>
        <div style={{ textAlign:"center", marginBottom:30 }}>
          <div style={{ fontSize:48, marginBottom:10 }}>🎯</div>
          <h2 style={{ margin:0, color:"#1e293b", fontSize:24 }}>IELTS 6.0 Course</h2>
          <p style={{ color:"#64748b", margin:"8px 0 0", fontSize:14 }}>Enter your email to access</p>
        </div>
        <input type="email" placeholder="your@email.com" value={email}
          onChange={e => { setEmail(e.target.value); setErr(""); }}
          onKeyDown={e => e.key === "Enter" && go()}
          style={{ width:"100%", padding:"13px 16px", borderRadius:12, border:"2px solid #e2e8f0", fontSize:15, boxSizing:"border-box" }} />
        {err && <p style={{ color:"#dc2626", fontSize:13, margin:"8px 0 0" }}>{err}</p>}
        <button onClick={go} disabled={loading} style={{ width:"100%", marginTop:16, padding:14, borderRadius:12, border:"none", background:"linear-gradient(135deg,#1a73e8,#9334E6)", color:"white", fontSize:15, fontWeight:700, cursor:"pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Checking..." : "Enter →"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// NAV
// ══════════════════════════════════════════
function Nav({ session, logout, setPage, isAdmin, pts }) {
  return (
    <div style={{ background:"white", borderBottom:"1px solid #e2e8f0", padding:"10px 20px", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", position:"sticky", top:0, zIndex:100 }}>
      <div style={{ fontWeight:800, fontSize:16, color:"#1a73e8", cursor:"pointer" }} onClick={() => setPage("course")}>🎯 IELTS 6.0</div>
      <div style={{ flex:1 }} />
      <button onClick={() => setPage("course")} style={nb("#e8f0fe","#1a73e8")}>📚 Course</button>
      <button onClick={() => setPage("dashboard")} style={nb("#f3e8ff","#9334E6")}>📊 Progress</button>
      <button onClick={() => setPage("leaderboard")} style={nb("#fff8e1","#ca8a04")}>🏆 Board</button>
      {isAdmin && <button onClick={() => setPage("admin")} style={nb("#fce8e6","#dc2626")}>👑 Admin</button>}
      <div style={{ background:"#e6f4ea", borderRadius:20, padding:"4px 12px", fontSize:13, fontWeight:700, color:"#16a34a" }}>⭐ {pts} pts</div>
      <button onClick={logout} style={{ padding:"5px 12px", borderRadius:8, border:"1px solid #e2e8f0", background:"white", cursor:"pointer", fontSize:12, color:"#64748b" }}>Logout</button>
    </div>
  );
}
const nb = (bg,c) => ({ padding:"6px 12px", borderRadius:20, border:"none", background:bg, color:c, cursor:"pointer", fontSize:12, fontWeight:600 });

// ══════════════════════════════════════════
// COURSE PAGE
// ══════════════════════════════════════════
function CoursePage({ session, logout, setPage, setCurrentLesson, isAdmin, modules }) {
  const [myProgress, setMyProgress] = useState({});

  useEffect(() => {
    FB.getProgress(session.email).then(setMyProgress);
  }, [session.email]);

  const totalPts = Object.values(myProgress).reduce((s,v) => s+(v.points||0), 0);
  const allLessons = (modules||[]).flatMap(m => m.lessons);
  const done = allLessons.filter(l => myProgress[l.id]?.quizDone).length;

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"sans-serif" }}>
      <Nav session={session} logout={logout} setPage={setPage} isAdmin={isAdmin} pts={totalPts} />
      <div style={{ maxWidth:780, margin:"0 auto", padding:20 }}>
        <div style={{ background:"linear-gradient(135deg,#1a73e8,#9334E6)", borderRadius:16, padding:"24px 28px", color:"white", marginBottom:24 }}>
          <h2 style={{ margin:0, fontSize:22 }}>Welcome back, {session.name}! 👋</h2>
          <p style={{ margin:"8px 0 16px", opacity:0.9 }}>B1 → IELTS 6.0 · {allLessons.length} lessons</p>
          <div style={{ display:"flex", gap:24 }}>
            <div><div style={{ fontSize:24, fontWeight:800 }}>{totalPts}</div><div style={{ fontSize:12, opacity:0.8 }}>Points</div></div>
            <div><div style={{ fontSize:24, fontWeight:800 }}>{done}/{allLessons.length}</div><div style={{ fontSize:12, opacity:0.8 }}>Done</div></div>
            <div><div style={{ fontSize:24, fontWeight:800 }}>{allLessons.length > 0 ? Math.round(done/allLessons.length*100) : 0}%</div><div style={{ fontSize:12, opacity:0.8 }}>Progress</div></div>
          </div>
          <div style={{ marginTop:12, background:"rgba(255,255,255,0.2)", borderRadius:8, height:10 }}>
            <div style={{ width:`${allLessons.length>0?done/allLessons.length*100:0}%`, background:"white", height:10, borderRadius:8 }} />
          </div>
        </div>

        {(modules||[]).map(m => (
          <div key={m.id} style={{ marginBottom:20 }}>
            <div style={{ background:m.color, borderRadius:"12px 12px 0 0", padding:"12px 20px", color:"white", fontWeight:700, fontSize:14 }}>{m.title}</div>
            {m.lessons.map(l => {
              const lp = myProgress[l.id] || {};
              return (
                <div key={l.id} onClick={() => { setCurrentLesson(l); setPage("lesson"); }}
                  style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", background:"white", borderBottom:"1px solid #f1f5f9", cursor:"pointer" }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background: lp.quizDone ? "#16a34a" : m.color, color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, flexShrink:0 }}>
                    {lp.quizDone ? "✓" : l.n}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:"#1e293b" }}>{l.title}</div>
                    <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>
                      {(l.materials||[]).length} materials · {l.quiz.questions.length} questions
                      {lp.points ? ` · ⭐ ${lp.points} pts` : ""}
                    </div>
                  </div>
                  <span style={{ fontSize:11, padding:"3px 10px", borderRadius:10, background:TC[l.tag]||"#94a3b8", color:"white", fontWeight:600 }}>{l.tag}</span>
                  <span style={{ color:"#94a3b8" }}>›</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// LESSON PAGE
// ══════════════════════════════════════════
function LessonPage({ lesson, session, setPage, setCurrentLesson, isAdmin, refreshModules, modules }) {
  const [tab, setTab] = useState("materials");
  const [addType, setAddType] = useState("link");
  const [addUrl, setAddUrl] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [myProgress, setMyProgress] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { FB.getProgress(session.email).then(setMyProgress); }, [session.email]);

  const lp = myProgress[lesson.id] || {};

  const saveMaterial = async () => {
    if (!addUrl || !addTitle) return;
    setSaving(true);
    try {
      const current = await FB.getLessonMaterials(lesson.id);
      const updated = [...current, { type: addType, url: addUrl, title: addTitle, id: Date.now() }];
      await FB.setLessonMaterials(lesson.id, updated);
      await refreshModules();
      setAddUrl(""); setAddTitle("");
    } catch(e) { console.error("Save error:", e); }
    setSaving(false);
  };

  const deleteMaterial = async (mid) => {
    setSaving(true);
    try {
      const current = await FB.getLessonMaterials(lesson.id);
      const updated = current.filter(m => m.id !== mid);
      await FB.setLessonMaterials(lesson.id, updated);
      await refreshModules();
    } catch(e) { console.error("Delete error:", e); }
    setSaving(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"sans-serif" }}>
      <div style={{ background:"white", borderBottom:"1px solid #e2e8f0", padding:"12px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={() => setPage("course")} style={{ padding:"6px 12px", borderRadius:8, border:"none", background:"#e8f0fe", color:"#1a73e8", cursor:"pointer", fontWeight:600 }}>← Back</button>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:15, color:"#1e293b" }}>Lesson {lesson.n}: {lesson.title}</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>{lp.points ? `⭐ ${lp.points} pts earned` : "Not completed yet"}</div>
        </div>
        <span style={{ fontSize:11, padding:"4px 12px", borderRadius:10, background:TC[lesson.tag]||"#94a3b8", color:"white", fontWeight:600 }}>{lesson.tag}</span>
      </div>

      <div style={{ maxWidth:760, margin:"0 auto", padding:20 }}>
        <div style={{ display:"flex", gap:4, marginBottom:20, background:"white", borderRadius:12, padding:6, border:"1px solid #e2e8f0" }}>
          {["materials","quiz","assignment"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:"9px", borderRadius:9, border:"none", cursor:"pointer", fontWeight:600, fontSize:13, background:tab===t?"#1a73e8":"transparent", color:tab===t?"white":"#64748b" }}>
              {t==="materials"?"📎 Materials":t==="quiz"?"📝 Quiz":"✍️ Assignment"}
            </button>
          ))}
        </div>

        {/* MATERIALS */}
        {tab==="materials" && (
          <div>
            {isAdmin && (
              <div style={{ background:"white", borderRadius:14, padding:20, marginBottom:16, border:"1px solid #e2e8f0" }}>
                <div style={{ fontWeight:700, marginBottom:12 }}>➕ Add Material</div>
                <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap" }}>
                  {["link","video","presentation","pdf"].map(t => (
                    <button key={t} onClick={() => setAddType(t)} style={{ padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:addType===t?"#1a73e8":"#e2e8f0", color:addType===t?"white":"#475569" }}>
                      {t==="link"?"🔗 Link":t==="video"?"🎬 Video":t==="presentation"?"📊 Slides":"📄 PDF"}
                    </button>
                  ))}
                </div>
                <input placeholder="Title" value={addTitle} onChange={e=>setAddTitle(e.target.value)}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"2px solid #e2e8f0", fontSize:14, boxSizing:"border-box", marginBottom:8 }} />
                <input placeholder={addType==="video"?"YouTube URL":"URL (https://...)"} value={addUrl} onChange={e=>setAddUrl(e.target.value)}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"2px solid #e2e8f0", fontSize:14, boxSizing:"border-box", marginBottom:8 }} />
                <button onClick={saveMaterial} disabled={saving} style={{ padding:"10px 24px", borderRadius:8, border:"none", background:"#34A853", color:"white", fontWeight:700, cursor:"pointer" }}>
                  {saving ? "Saving..." : "Add"}
                </button>
              </div>
            )}
            {(lesson.materials||[]).length === 0 ? (
              <div style={{ textAlign:"center", padding:40, color:"#94a3b8", background:"white", borderRadius:14, border:"2px dashed #e2e8f0" }}>
                {isAdmin ? "No materials yet. Add above!" : "No materials yet. Check back soon!"}
              </div>
            ) : (
              (lesson.materials||[]).map(mat => (
                <div key={mat.id} style={{ background:"white", borderRadius:12, padding:16, marginBottom:12, border:"1px solid #e2e8f0" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ fontSize:28 }}>{mat.type==="video"?"🎬":mat.type==="presentation"?"📊":mat.type==="pdf"?"📄":"🔗"}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, color:"#1e293b" }}>{mat.title}</div>
                      <div style={{ fontSize:12, color:"#94a3b8" }}>{mat.type}</div>
                    </div>
                    <a href={mat.url} target="_blank" rel="noreferrer" style={{ padding:"7px 14px", borderRadius:8, background:"#e8f0fe", color:"#1a73e8", textDecoration:"none", fontSize:13, fontWeight:600 }}>Open</a>
                    {isAdmin && <button onClick={() => deleteMaterial(mat.id)} style={{ padding:"7px 10px", borderRadius:8, border:"none", background:"#fce8e6", color:"#dc2626", cursor:"pointer" }}>🗑</button>}
                  </div>
                  {mat.type==="video" && mat.url.includes("youtube") && (
                    <div style={{ marginTop:12, borderRadius:10, overflow:"hidden" }}>
                      <iframe width="100%" height="250" title="Lesson video"
                        src={mat.url.replace("watch?v=","embed/").replace("youtu.be/","www.youtube.com/embed/")}
                        frameBorder="0" allowFullScreen style={{ borderRadius:10, display:"block" }} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* QUIZ */}
        {tab==="quiz" && (
          <div>
            <div style={{ background:"linear-gradient(135deg,#1a73e8,#0891b2)", borderRadius:14, padding:20, color:"white", marginBottom:16 }}>
              <div style={{ fontSize:18, fontWeight:700 }}>📝 Quiz — {lesson.title}</div>
              <div style={{ fontSize:13, opacity:0.9, marginTop:4 }}>{lesson.quiz.questions.length} questions · {lesson.quiz.questions.reduce((s,q)=>s+(q.points||10),0)} total points</div>
              {lp.quizDone && <div style={{ marginTop:8, background:"rgba(255,255,255,0.2)", borderRadius:8, padding:"6px 12px", fontSize:13 }}>✅ You scored {lp.quizScore}/{lesson.quiz.questions.reduce((s,q)=>s+(q.points||10),0)} pts</div>}
            </div>
            <button onClick={() => setPage("quiz")} style={{ width:"100%", padding:16, borderRadius:12, border:"none", background:lp.quizDone?"#e2e8f0":"linear-gradient(135deg,#1a73e8,#9334E6)", color:lp.quizDone?"#64748b":"white", fontWeight:700, fontSize:16, cursor:"pointer" }}>
              {lp.quizDone?"🔁 Retake Quiz":"🚀 Start Quiz"}
            </button>
          </div>
        )}

        {/* ASSIGNMENT */}
        {tab==="assignment" && (
          <div>
            <div style={{ background:"linear-gradient(135deg,#EA4335,#FBBC04)", borderRadius:14, padding:20, color:"white", marginBottom:16 }}>
              <div style={{ fontSize:18, fontWeight:700 }}>✍️ Assignment</div>
              <div style={{ fontSize:13, opacity:0.9, marginTop:4 }}>
                {lesson.assignment.type==="essay"?"IELTS Essay — AI checks and scores your work":lesson.assignment.type==="speaking"?"Speaking Task — Record and submit":"Writing Task"}
              </div>
            </div>
            <button onClick={() => setPage("assignment")} style={{ width:"100%", padding:16, borderRadius:12, border:"none", background:"linear-gradient(135deg,#EA4335,#FBBC04)", color:"white", fontWeight:700, fontSize:16, cursor:"pointer" }}>
              {lesson.assignment.type==="essay"?"✍️ Write Essay + Get AI Feedback":lesson.assignment.type==="speaking"?"🎤 Submit Speaking":"📝 Submit Assignment"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// QUIZ PAGE
// ══════════════════════════════════════════
function QuizPage({ lesson, session, setPage }) {
  const qs = lesson.quiz.questions;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [matchAnswers, setMatchAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const submitQuiz = async () => {
    let pts = 0;
    qs.forEach((q, i) => {
      if (q.type==="mc" && answers[i]===q.answer) pts += q.points;
      if (q.type==="tf" && answers[i]===q.answer) pts += q.points;
      if (q.type==="fitb" && answers[i]?.trim().toLowerCase()===q.answer.toLowerCase()) pts += q.points;
      if (q.type==="match") {
        const ma = matchAnswers[i] || {};
        if (q.pairs.every(([k,v]) => ma[k]===v)) pts += q.points;
      }
    });
    setScore(pts);
    const total = qs.reduce((s,q)=>s+(q.points||10),0);
    const existing = await FB.getProgress(session.email);
    const prev = existing[lesson.id] || {};
    await FB.setProgress(session.email, {
      [lesson.id]: { ...prev, quizDone:true, quizScore:pts, quizTotal:total, points:(prev.points||0)+pts, completedAt:new Date().toISOString() }
    });
    setSubmitted(true);
  };

  const q = qs[current];
  const total = qs.reduce((s,q)=>s+(q.points||10),0);

  if (submitted) {
    const pct = Math.round(score/total*100);
    return (
      <div style={{ minHeight:"100vh", background:"#f8fafc", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"sans-serif" }}>
        <div style={{ background:"white", borderRadius:20, padding:40, maxWidth:460, width:"100%", textAlign:"center", boxShadow:"0 4px 24px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize:60, marginBottom:16 }}>{pct>=80?"🎉":pct>=60?"👍":"📚"}</div>
          <h2 style={{ color:"#1e293b" }}>{pct>=80?"Excellent!":pct>=60?"Good job!":"Keep practising!"}</h2>
          <div style={{ fontSize:36, fontWeight:800, color:"#1a73e8" }}>{score}/{total}</div>
          <div style={{ color:"#64748b", marginBottom:24 }}>{pct}% · ⭐ {score} points earned</div>
          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <button onClick={() => { setCurrent(0); setAnswers({}); setMatchAnswers({}); setSubmitted(false); }} style={{ padding:"10px 24px", borderRadius:10, border:"none", background:"#e8f0fe", color:"#1a73e8", fontWeight:700, cursor:"pointer" }}>Retake</button>
            <button onClick={() => setPage("lesson")} style={{ padding:"10px 24px", borderRadius:10, border:"none", background:"#1a73e8", color:"white", fontWeight:700, cursor:"pointer" }}>← Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"sans-serif" }}>
      <div style={{ background:"white", borderBottom:"1px solid #e2e8f0", padding:"12px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={() => setPage("lesson")} style={{ padding:"6px 12px", borderRadius:8, border:"none", background:"#e8f0fe", color:"#1a73e8", cursor:"pointer", fontWeight:600 }}>← Back</button>
        <div style={{ flex:1, fontWeight:700 }}>Quiz: {lesson.title}</div>
        <div style={{ fontSize:13, color:"#64748b" }}>{current+1}/{qs.length}</div>
      </div>
      <div style={{ background:"#e2e8f0", height:6 }}>
        <div style={{ width:`${(current+1)/qs.length*100}%`, background:"#1a73e8", height:6, transition:"width 0.3s" }} />
      </div>
      <div style={{ maxWidth:620, margin:"30px auto", padding:20 }}>
        <div style={{ background:"white", borderRadius:16, padding:28, boxShadow:"0 2px 16px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize:12, color:"#94a3b8", marginBottom:8 }}>Question {current+1} · {q.points} pts</div>
          <div style={{ fontSize:18, fontWeight:700, color:"#1e293b", marginBottom:24, lineHeight:1.5 }}>{q.q}</div>

          {q.type==="mc" && q.options.map((opt,i) => (
            <div key={i} onClick={() => setAnswers({...answers,[current]:i})}
              style={{ padding:"12px 16px", borderRadius:10, border:`2px solid ${answers[current]===i?"#1a73e8":"#e2e8f0"}`, background:answers[current]===i?"#e8f0fe":"white", marginBottom:10, cursor:"pointer" }}>
              <span style={{ fontWeight:answers[current]===i?700:400, color:answers[current]===i?"#1a73e8":"#374151" }}>{opt}</span>
            </div>
          ))}

          {q.type==="tf" && (
            <div style={{ display:"flex", gap:12 }}>
              {[true,false].map(v => (
                <div key={String(v)} onClick={() => setAnswers({...answers,[current]:v})}
                  style={{ flex:1, padding:14, borderRadius:10, border:`2px solid ${answers[current]===v?"#1a73e8":"#e2e8f0"}`, background:answers[current]===v?"#e8f0fe":"white", cursor:"pointer", textAlign:"center", fontWeight:700, color:answers[current]===v?"#1a73e8":"#374151" }}>
                  {v?"✅ True":"❌ False"}
                </div>
              ))}
            </div>
          )}

          {q.type==="fitb" && (
            <input placeholder="Type your answer..." value={answers[current]||""} onChange={e=>setAnswers({...answers,[current]:e.target.value})}
              style={{ width:"100%", padding:"14px 16px", borderRadius:10, border:"2px solid #e2e8f0", fontSize:15, boxSizing:"border-box" }} />
          )}

          {q.type==="match" && (
            <div>
              <div style={{ fontSize:13, color:"#64748b", marginBottom:12 }}>Match each item to the correct answer:</div>
              {q.pairs.map(([k]) => (
                <div key={k} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                  <div style={{ flex:1, padding:"10px 14px", background:"#f8fafc", borderRadius:8, fontWeight:600, fontSize:14 }}>{k}</div>
                  <select value={(matchAnswers[current]||{})[k]||""} onChange={e => setMatchAnswers({...matchAnswers,[current]:{...(matchAnswers[current]||{}),[k]:e.target.value}})}
                    style={{ flex:1, padding:10, borderRadius:8, border:"2px solid #e2e8f0", fontSize:14 }}>
                    <option value="">Select...</option>
                    {q.pairs.map(([,v]) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}

          <div style={{ display:"flex", justifyContent:"space-between", marginTop:28 }}>
            <button onClick={() => setCurrent(Math.max(0,current-1))} disabled={current===0}
              style={{ padding:"10px 24px", borderRadius:10, border:"none", background:current===0?"#f1f5f9":"#e2e8f0", color:current===0?"#94a3b8":"#475569", cursor:current===0?"not-allowed":"pointer", fontWeight:600 }}>← Prev</button>
            {current < qs.length-1
              ? <button onClick={() => setCurrent(current+1)} style={{ padding:"10px 24px", borderRadius:10, border:"none", background:"#1a73e8", color:"white", fontWeight:700, cursor:"pointer" }}>Next →</button>
              : <button onClick={submitQuiz} style={{ padding:"10px 24px", borderRadius:10, border:"none", background:"#34A853", color:"white", fontWeight:700, cursor:"pointer" }}>✅ Submit</button>
            }
          </div>
        </div>
        <div style={{ display:"flex", gap:6, justifyContent:"center", marginTop:20, flexWrap:"wrap" }}>
          {qs.map((_,i) => (
            <div key={i} onClick={() => setCurrent(i)}
              style={{ width:32, height:32, borderRadius:"50%", background:i===current?"#1a73e8":answers[i]!==undefined?"#34A853":"#e2e8f0", color:i===current||answers[i]!==undefined?"white":"#94a3b8", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, cursor:"pointer" }}>
              {i+1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// ASSIGNMENT PAGE
// ══════════════════════════════════════════
function AssignmentPage({ lesson, session, setPage }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (!text.trim() || text.trim().length < 50) return;
    setLoading(true);
    const isEssay = lesson.assignment.type === "essay";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: isEssay
            ? `You are an expert IELTS examiner. Score using 4 band descriptors. Return ONLY valid JSON: {"overall":6.0,"tr":6.0,"cc":6.0,"lr":6.0,"gra":6.0,"strengths":["s1","s2","s3"],"improvements":["i1","i2","i3"],"corrected_sentence":"example correction","summary":"2-3 sentence summary"}`
            : `You are a helpful English teacher. Return ONLY valid JSON: {"score":8,"max_score":10,"strengths":["s1","s2"],"improvements":["i1","i2"],"summary":"feedback"}`,
          messages: [{ role:"user", content:`Task: ${lesson.assignment.prompt}\n\nStudent response:\n${text}` }]
        })
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "{}";
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setFeedback(parsed);
      await FB.setSubmission(session.email, lesson.id, { text, feedback:parsed, submittedAt:new Date().toISOString() });
      const existing = await FB.getProgress(session.email);
      const prev = existing[lesson.id] || {};
      await FB.setProgress(session.email, { [lesson.id]: { ...prev, assignmentDone:true, points:(prev.points||0)+20 } });
      setSubmitted(true);
    } catch(e) { setFeedback({ error:"Could not get AI feedback. Please try again." }); }
    setLoading(false);
  };

  const bc = (b) => b>=7?"#16a34a":b>=6?"#ca8a04":b>=5?"#ea580c":"#dc2626";

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"sans-serif" }}>
      <div style={{ background:"white", borderBottom:"1px solid #e2e8f0", padding:"12px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={() => setPage("lesson")} style={{ padding:"6px 12px", borderRadius:8, border:"none", background:"#e8f0fe", color:"#1a73e8", cursor:"pointer", fontWeight:600 }}>← Back</button>
        <div style={{ fontWeight:700 }}>Assignment: {lesson.title}</div>
      </div>
      <div style={{ maxWidth:720, margin:"0 auto", padding:20 }}>
        <div style={{ background:"white", borderRadius:14, padding:20, marginBottom:20, border:"1px solid #e2e8f0" }}>
          <div style={{ fontWeight:700, marginBottom:10 }}>📋 Task</div>
          <div style={{ color:"#374151", lineHeight:1.7, whiteSpace:"pre-line", fontSize:14 }}>{lesson.assignment.prompt}</div>
        </div>
        {!submitted && (
          <div style={{ background:"white", borderRadius:14, padding:20, marginBottom:20, border:"1px solid #e2e8f0" }}>
            <div style={{ fontWeight:700, marginBottom:10 }}>{lesson.assignment.type==="essay"?"✍️ Your Essay":lesson.assignment.type==="speaking"?"🎤 Your Response":"📝 Your Answer"}</div>
            <textarea value={text} onChange={e=>setText(e.target.value)}
              placeholder={lesson.assignment.type==="essay"?"Write your essay here (min 150-250 words)...":"Write your response or paste a recording link..."}
              style={{ width:"100%", minHeight:220, padding:14, borderRadius:10, border:"2px solid #e2e8f0", fontSize:14, lineHeight:1.7, resize:"vertical", boxSizing:"border-box", fontFamily:"sans-serif" }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12 }}>
              <div style={{ fontSize:12, color:"#94a3b8" }}>{text.trim().split(/\s+/).filter(Boolean).length} words</div>
              <button onClick={submit} disabled={loading||text.trim().length<50}
                style={{ padding:"12px 28px", borderRadius:10, border:"none", background:loading||text.trim().length<50?"#e2e8f0":"linear-gradient(135deg,#EA4335,#FBBC04)", color:text.trim().length<50?"#94a3b8":"white", fontWeight:700, cursor:text.trim().length<50?"not-allowed":"pointer" }}>
                {loading?"⏳ AI is checking...":lesson.assignment.type==="essay"?"🤖 Get AI Feedback":"📤 Submit"}
              </button>
            </div>
          </div>
        )}
        {feedback && !feedback.error && (
          <div style={{ background:"white", borderRadius:14, padding:24, border:"1px solid #e2e8f0" }}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:16 }}>🤖 AI Feedback</div>
            {lesson.assignment.type==="essay" && (
              <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
                {[["Overall",feedback.overall],["Task",feedback.tr],["Coherence",feedback.cc],["Lexical",feedback.lr],["Grammar",feedback.gra]].map(([l,v])=>(
                  <div key={l} style={{ flex:1, minWidth:80, textAlign:"center", background:"#f8fafc", borderRadius:12, padding:"12px 8px", border:`2px solid ${bc(v)}` }}>
                    <div style={{ fontSize:22, fontWeight:800, color:bc(v) }}>{v}</div>
                    <div style={{ fontSize:11, color:"#64748b" }}>{l}</div>
                  </div>
                ))}
              </div>
            )}
            {feedback.corrected_sentence && (
              <div style={{ background:"#e8f0fe", borderRadius:10, padding:14, marginBottom:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#1a73e8", marginBottom:4 }}>💡 Example Correction</div>
                <div style={{ fontSize:14 }}>{feedback.corrected_sentence}</div>
              </div>
            )}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              <div>
                <div style={{ fontWeight:700, color:"#16a34a", marginBottom:8 }}>✅ Strengths</div>
                {(feedback.strengths||[]).map((s,i)=><div key={i} style={{ fontSize:13, marginBottom:6, paddingLeft:10, borderLeft:"3px solid #16a34a" }}>{s}</div>)}
              </div>
              <div>
                <div style={{ fontWeight:700, color:"#ea580c", marginBottom:8 }}>📈 Improve</div>
                {(feedback.improvements||[]).map((s,i)=><div key={i} style={{ fontSize:13, marginBottom:6, paddingLeft:10, borderLeft:"3px solid #ea580c" }}>{s}</div>)}
              </div>
            </div>
            {feedback.summary && <div style={{ background:"#f8fafc", borderRadius:10, padding:14, fontSize:14, lineHeight:1.6 }}>{feedback.summary}</div>}
            <div style={{ marginTop:12, textAlign:"center", color:"#16a34a", fontWeight:700, fontSize:13 }}>⭐ +20 points earned!</div>
            <button onClick={()=>{setSubmitted(false);setText("");setFeedback(null);}} style={{ width:"100%", marginTop:16, padding:12, borderRadius:10, border:"none", background:"#e8f0fe", color:"#1a73e8", fontWeight:700, cursor:"pointer" }}>✏️ Rewrite & Resubmit</button>
          </div>
        )}
        {feedback?.error && <div style={{ background:"#fce8e6", borderRadius:12, padding:16, color:"#dc2626" }}>{feedback.error}</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════
function Dashboard({ session, setPage, modules }) {
  const [myP, setMyP] = useState({});
  useEffect(() => { FB.getProgress(session.email).then(setMyP); }, [session.email]);
  const allLessons = (modules||[]).flatMap(m=>m.lessons);
  const totalPts = Object.values(myP).reduce((s,v)=>s+(v.points||0),0);
  const done = allLessons.filter(l=>myP[l.id]?.quizDone).length;

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"sans-serif" }}>
      <div style={{ background:"white", borderBottom:"1px solid #e2e8f0", padding:"12px 20px", display:"flex", gap:12, alignItems:"center" }}>
        <button onClick={() => setPage("course")} style={{ padding:"6px 12px", borderRadius:8, border:"none", background:"#e8f0fe", color:"#1a73e8", cursor:"pointer", fontWeight:600 }}>← Back</button>
        <div style={{ fontWeight:700, fontSize:16 }}>📊 My Progress</div>
      </div>
      <div style={{ maxWidth:700, margin:"0 auto", padding:20 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:24 }}>
          {[["⭐ Points",totalPts,"#e8f0fe","#1a73e8"],["✅ Done",`${done}/${allLessons.length}`,"#e6f4ea","#16a34a"],["📈 Progress",`${allLessons.length>0?Math.round(done/allLessons.length*100):0}%`,"#f3e8ff","#9334E6"]].map(([l,v,bg,c])=>(
            <div key={l} style={{ background:bg, borderRadius:14, padding:18, textAlign:"center" }}>
              <div style={{ fontSize:26, fontWeight:800, color:c }}>{v}</div>
              <div style={{ fontSize:12, color:"#64748b", marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>
        {(modules||[]).map(m=>{
          const mDone = m.lessons.filter(l=>myP[l.id]?.quizDone).length;
          return (
            <div key={m.id} style={{ background:"white", borderRadius:14, padding:18, marginBottom:14, border:"1px solid #e2e8f0" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <div style={{ fontWeight:700, color:m.color }}>{m.title}</div>
                <div style={{ fontSize:13, color:"#64748b" }}>{mDone}/{m.lessons.length}</div>
              </div>
              <div style={{ background:"#e2e8f0", borderRadius:6, height:8, marginBottom:10 }}>
                <div style={{ width:`${m.lessons.length>0?mDone/m.lessons.length*100:0}%`, background:m.color, height:8, borderRadius:6 }} />
              </div>
              {m.lessons.map(l=>(
                <div key={l.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0", borderBottom:"1px solid #f8fafc" }}>
                  <span>{myP[l.id]?.quizDone?"✅":"⬜"}</span>
                  <span style={{ flex:1, fontSize:13 }}>{l.title}</span>
                  {myP[l.id]?.points?<span style={{ fontSize:12, color:"#16a34a", fontWeight:700 }}>+{myP[l.id].points}pts</span>:null}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// LEADERBOARD
// ══════════════════════════════════════════
function Leaderboard({ session, setPage }) {
  const [rankings, setRankings] = useState([]);
  useEffect(() => {
    const load = async () => {
      const [students, allProgress] = await Promise.all([FB.getStudents(), FB.getAllProgress()]);
      const r = Object.entries(students).map(([email,info])=>({
        email, name:info.name,
        pts: Object.values(allProgress[email]||{}).reduce((s,v)=>s+(v.points||0),0),
        done: Object.values(allProgress[email]||{}).filter(v=>v.quizDone).length
      })).sort((a,b)=>b.pts-a.pts);
      setRankings(r);
    };
    load();
  }, []);

  const medals = ["🥇","🥈","🥉"];
  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"sans-serif" }}>
      <div style={{ background:"white", borderBottom:"1px solid #e2e8f0", padding:"12px 20px", display:"flex", gap:12, alignItems:"center" }}>
        <button onClick={() => setPage("course")} style={{ padding:"6px 12px", borderRadius:8, border:"none", background:"#e8f0fe", color:"#1a73e8", cursor:"pointer", fontWeight:600 }}>← Back</button>
        <div style={{ fontWeight:700, fontSize:16 }}>🏆 Leaderboard</div>
      </div>
      <div style={{ maxWidth:600, margin:"0 auto", padding:20 }}>
        <div style={{ background:"linear-gradient(135deg,#FBBC04,#EA4335)", borderRadius:16, padding:20, color:"white", textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:36 }}>🏆</div>
          <div style={{ fontSize:20, fontWeight:800 }}>Top Students</div>
        </div>
        {rankings.map((r,i)=>{
          const isMe = r.email===session.email;
          return (
            <div key={r.email} style={{ display:"flex", alignItems:"center", gap:16, background:isMe?"#e8f0fe":"white", borderRadius:14, padding:"16px 20px", marginBottom:10, border:`2px solid ${isMe?"#1a73e8":"#e2e8f0"}` }}>
              <div style={{ fontSize:i<3?28:18, fontWeight:700, width:36, textAlign:"center" }}>{medals[i]||`#${i+1}`}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700 }}>{r.name} {isMe?"(You)":""}</div>
                <div style={{ fontSize:12, color:"#64748b" }}>{r.done} lessons done</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:22, fontWeight:800, color:"#FBBC04" }}>{r.pts}</div>
                <div style={{ fontSize:11, color:"#94a3b8" }}>points</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// ADMIN PANEL
// ══════════════════════════════════════════
function AdminPanel({ session, logout, setPage }) {
  const [students, setStudents] = useState({});
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [msg, setMsg] = useState("");
  const [allProgress, setAllProgress] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(true);

  const refresh = async () => {
    const [s, p] = await Promise.all([FB.getStudents(), FB.getAllProgress()]);
    setStudents(s); setAllProgress(p); setLoadingStudents(false);
  };

  useEffect(() => { refresh(); }, []);

  const add = async () => {
    const e = newEmail.trim().toLowerCase(), n = newName.trim();
    if (!e||!n) { setMsg("⚠️ Fill both fields"); return; }
    const existing = await FB.getStudent(e);
    if (existing) { setMsg("⚠️ Already exists"); return; }
    await FB.setStudent(e, { name:n, status:"active", added:new Date().toISOString(), lastLogin:null });
    setNewEmail(""); setNewName(""); setMsg(`✅ ${n} added!`); refresh();
  };

  const toggle = async (email, status) => {
    await FB.updateStudent(email, { status: status==="active"?"revoked":"active" });
    refresh();
  };

  const remove = async (email) => {
    if (!window.confirm(`Remove ${email}?`)) return;
    await FB.deleteStudent(email); refresh();
  };

  const list = Object.entries(students);

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"sans-serif" }}>
      <div style={{ background:"white", borderBottom:"1px solid #e2e8f0", padding:"12px 20px", display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ fontWeight:800, fontSize:16, color:"#dc2626" }}>👑 Admin Panel</div>
        <div style={{ flex:1 }} />
        <button onClick={()=>setPage("course")} style={nb("#e8f0fe","#1a73e8")}>📚 Course</button>
        <button onClick={()=>setPage("leaderboard")} style={nb("#fff8e1","#ca8a04")}>🏆 Leaderboard</button>
        <button onClick={logout} style={nb("#fce8e6","#dc2626")}>Logout</button>
      </div>
      <div style={{ maxWidth:720, margin:"0 auto", padding:20 }}>
        <div style={{ display:"flex", gap:12, marginBottom:20 }}>
          {[["👥 Total",list.length,"#e8f0fe","#1a73e8"],["✅ Active",list.filter(([,v])=>v.status==="active").length,"#e6f4ea","#16a34a"],["🚫 Revoked",list.filter(([,v])=>v.status==="revoked").length,"#fce8e6","#dc2626"]].map(([l,v,bg,c])=>(
            <div key={l} style={{ flex:1, background:bg, borderRadius:12, padding:"14px 10px", textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:800, color:c }}>{v}</div>
              <div style={{ fontSize:11, color:"#64748b" }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ background:"white", borderRadius:14, padding:20, marginBottom:20, border:"1px solid #e2e8f0" }}>
          <div style={{ fontWeight:700, marginBottom:12 }}>➕ Add Student</div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <input placeholder="Full name" value={newName} onChange={e=>setNewName(e.target.value)}
              style={{ flex:1, minWidth:130, padding:"10px 12px", borderRadius:8, border:"2px solid #e2e8f0", fontSize:14 }} />
            <input placeholder="email@example.com" value={newEmail} onChange={e=>setNewEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}
              style={{ flex:2, minWidth:180, padding:"10px 12px", borderRadius:8, border:"2px solid #e2e8f0", fontSize:14 }} />
            <button onClick={add} style={{ padding:"10px 20px", borderRadius:8, border:"none", background:"#34A853", color:"white", fontWeight:700, cursor:"pointer" }}>Add</button>
          </div>
          {msg && <div style={{ marginTop:8, fontSize:13, color:msg.startsWith("✅")?"#16a34a":"#dc2626" }}>{msg}</div>}
        </div>

        <div style={{ background:"white", borderRadius:14, border:"1px solid #e2e8f0", overflow:"hidden" }}>
          <div style={{ padding:"12px 20px", borderBottom:"1px solid #e2e8f0", fontWeight:700 }}>Students ({list.length})</div>
          {loadingStudents && <div style={{ padding:30, textAlign:"center", color:"#94a3b8" }}>Loading...</div>}
          {!loadingStudents && list.length===0 && <div style={{ padding:30, textAlign:"center", color:"#94a3b8" }}>No students yet.</div>}
          {list.map(([email,info])=>{
            const pts = Object.values(allProgress[email]||{}).reduce((s,v)=>s+(v.points||0),0);
            const done = Object.values(allProgress[email]||{}).filter(v=>v.quizDone).length;
            return (
              <div key={email} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 20px", borderBottom:"1px solid #f1f5f9", flexWrap:"wrap" }}>
                <div style={{ flex:1, minWidth:130 }}>
                  <div style={{ fontWeight:600, fontSize:14 }}>{info.name}</div>
                  <div style={{ fontSize:12, color:"#64748b" }}>{email}</div>
                  <div style={{ fontSize:11, color:"#94a3b8" }}>{done} lessons · ⭐{pts}pts {info.lastLogin?`· ${new Date(info.lastLogin).toLocaleDateString("ru-RU")}`:"· Never logged in"}</div>
                </div>
                <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, fontWeight:700, background:info.status==="active"?"#e6f4ea":"#fce8e6", color:info.status==="active"?"#16a34a":"#dc2626" }}>
                  {info.status==="active"?"✅ Active":"🚫 Revoked"}
                </span>
                <button onClick={()=>toggle(email,info.status)} style={{ padding:"6px 12px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:info.status==="active"?"#fce8e6":"#e6f4ea", color:info.status==="active"?"#dc2626":"#16a34a" }}>
                  {info.status==="active"?"Revoke":"Restore"}
                </button>
                <button onClick={()=>remove(email)} style={{ padding:"6px 10px", borderRadius:8, border:"none", background:"#f1f5f9", color:"#64748b", cursor:"pointer" }}>🗑</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
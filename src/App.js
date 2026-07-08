// src/App.js
import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

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
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const ADMIN_EMAIL = "dyerlanova@gmail.com";
// Students who can log in directly (no DB entry needed) with every module unlocked.
const FULL_ACCESS = {
  "sabinabekbulat1@gmail.com": "Sabina",
  "yedige.kurmanali@gmail.com": "Yedige",
};
const hasFullAccess = (email) => !!FULL_ACCESS[(email || "").trim().toLowerCase()];

// ─── AUTH: verify a signed-in Google user and build their session ───
// Throws "no-access" / "revoked" when the account isn't allowed in.
async function resolveSession(user) {
  const email = (user.email || "").trim().toLowerCase();
  if (!email) throw new Error("no-email");
  if (email === ADMIN_EMAIL) {
    return { email, role: "admin", name: user.displayName || "Teacher Dana" };
  }
  if (FULL_ACCESS[email]) {
    try { await FB.setStudent(email, { name: FULL_ACCESS[email], status: "active", fullAccess: true, lastLogin: new Date().toISOString() }); } catch(_) {}
    return { email, role: "student", name: FULL_ACCESS[email] };
  }
  const student = await FB.getStudent(email);
  if (!student) throw new Error("no-access");
  if (student.status === "revoked") throw new Error("revoked");
  await FB.updateStudent(email, { lastLogin: new Date().toISOString() });
  return { email, role: "student", name: student.name || user.displayName || email };
}

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

// ─── TAG COLORS — only the 4 IELTS skills carry an accent; everything else is monochrome ───
const TC = {
  Reading:   "#FF5959",
  Listening: "#FAD05A",
  Writing:   "#49BEB6",
  Speaking:  "#075F63",
  Intro:   "#6b7280",
  Vocab:   "#6b7280",
  Grammar: "#374151",
  Mock:    "#0a0a0a",
  Final:   "#0a0a0a",
};
// Tag chip text color — yellow Listening needs dark text for contrast
const TT = (tag) => tag === "Listening" ? "#0a0a0a" : "#ffffff";

// ─── ASSIGNMENT TIMER + SELF-ASSESSMENT RUBRIC ───
const ASSIGNMENT_TIMER_MS = 60 * 60 * 1000; // 1 hour
const RUBRIC_DEFS = {
  essay: [
    { key: "tr",  label: "Task Response",        help: "Did I fully answer all parts of the question with a clear position and developed ideas?" },
    { key: "cc",  label: "Coherence & Cohesion", help: "Is the essay logically organised with clear paragraphs and appropriate linkers?" },
    { key: "lr",  label: "Lexical Resource",     help: "Is my vocabulary varied and accurate, with some less common words used correctly?" },
    { key: "gra", label: "Grammar",              help: "Did I use a range of structures (complex, conditional, passive) with few errors?" },
  ],
  speaking: [
    { key: "fc",  label: "Fluency & Coherence",  help: "Did I speak smoothly without long pauses and connect ideas well?" },
    { key: "lr",  label: "Lexical Resource",     help: "Did I use a range of vocabulary, including topic-specific words and natural expressions?" },
    { key: "gra", label: "Grammar",              help: "Did I use a mix of simple and complex sentences with few errors?" },
    { key: "pr",  label: "Pronunciation",        help: "Was my pronunciation clear, with natural rhythm, stress and intonation?" },
  ],
};
const BAND_OPTIONS = [4, 5, 6, 7, 8, 9];
const BAND_HINT = { 4:"Limited", 5:"Modest", 6:"Competent", 7:"Good", 8:"Very good", 9:"Expert" };
const wordCountOf = (s) => (s || "").trim().split(/\s+/).filter(Boolean).length;
const fmtTime = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
};

// ─── TIMED TEST: 25 questions · 30-minute limit ───
const QUIZ_TIMER_MS = 30 * 60 * 1000; // 30 minutes

// ─── QUIZ ILLUSTRATIONS (inline SVG, aviation + IELTS themed) ───
const QUIZ_SVG = {
  plane: (
    <g>
      <path d="M14,46 L86,30 Q98,27 104,34 Q98,41 86,40 L60,42 L44,58 L36,57 L44,43 L24,45 L16,53 L10,52 Z" fill="#1A5FAD"/>
      <circle cx="98" cy="35" r="3" fill="#9ED9CF"/>
      <path d="M50,42 L40,30 L46,30 L60,40 Z" fill="#0D4F45"/>
    </g>
  ),
  airport: (
    <g>
      <rect x="14" y="40" width="92" height="26" rx="3" fill="#1A5FAD" opacity=".9"/>
      <path d="M14,40 Q60,24 106,40 Z" fill="#49BEB6"/>
      <g fill="#E5EEFA"><rect x="22" y="46" width="10" height="14"/><rect x="38" y="46" width="10" height="14"/><rect x="54" y="46" width="10" height="14"/><rect x="70" y="46" width="10" height="14"/><rect x="86" y="46" width="10" height="14"/></g>
      <path d="M70,30 L90,16 L92,18 L78,34 Z" fill="#0a0a0a"/>
    </g>
  ),
  controlTower: (
    <g>
      <rect x="52" y="30" width="14" height="40" fill="#7A7870"/>
      <path d="M44,30 L74,30 L68,14 L50,14 Z" fill="#1A5FAD"/>
      <rect x="50" y="18" width="18" height="8" fill="#E5EEFA"/>
      <rect x="28" y="64" width="62" height="6" fill="#3D3C39"/>
    </g>
  ),
  runway: (
    <g>
      <path d="M30,16 L48,16 L82,68 L10,68 Z" fill="#3D3C39"/>
      <g fill="#F5C07A"><rect x="42" y="22" width="6" height="8"/><rect x="40" y="36" width="8" height="9"/><rect x="36" y="52" width="10" height="10"/></g>
    </g>
  ),
  boardingPass: (
    <g>
      <rect x="12" y="24" width="96" height="36" rx="4" fill="#fff" stroke="#1A5FAD" strokeWidth="2"/>
      <rect x="78" y="24" width="2" height="36" fill="#1A5FAD" strokeDasharray="3 3"/>
      <circle cx="93" cy="42" r="9" fill="#E5EEFA"/>
      <path d="M88,42 L98,38 L96,42 L98,46 Z" fill="#1A5FAD"/>
      <g fill="#1A5FAD"><rect x="20" y="32" width="34" height="4" rx="2"/><rect x="20" y="42" width="24" height="3" rx="1.5"/><rect x="20" y="49" width="40" height="3" rx="1.5"/></g>
    </g>
  ),
  departureBoard: (
    <g>
      <rect x="14" y="18" width="92" height="48" rx="4" fill="#0a0a0a"/>
      <g fill="#49BEB6"><rect x="20" y="24" width="30" height="5"/><rect x="56" y="24" width="18" height="5"/><rect x="80" y="24" width="20" height="5" fill="#F5C07A"/></g>
      <g fill="#9ED9CF" opacity=".8"><rect x="20" y="35" width="26" height="4"/><rect x="56" y="35" width="16" height="4"/><rect x="80" y="35" width="20" height="4" fill="#F5C07A"/><rect x="20" y="44" width="30" height="4"/><rect x="56" y="44" width="14" height="4"/><rect x="80" y="44" width="20" height="4" fill="#F5C07A"/><rect x="20" y="53" width="24" height="4"/><rect x="56" y="53" width="18" height="4"/><rect x="80" y="53" width="20" height="4" fill="#FF5959"/></g>
    </g>
  ),
  worldMap: (
    <g>
      <circle cx="60" cy="42" r="30" fill="#E5EEFA" stroke="#1A5FAD" strokeWidth="1.5"/>
      <path d="M44,30 Q54,26 62,32 Q56,40 64,46 Q52,52 46,46 Q40,38 44,30 Z" fill="#49BEB6"/>
      <path d="M70,34 Q80,32 82,40 Q76,48 70,44 Z" fill="#49BEB6"/>
      <path d="M40,42 Q70,18 86,40" fill="none" stroke="#FF5959" strokeWidth="2" strokeDasharray="2 4"/>
      <circle cx="40" cy="42" r="3" fill="#FF5959"/><circle cx="86" cy="40" r="3" fill="#FF5959"/>
    </g>
  ),
  luggage: (
    <g>
      <rect x="40" y="30" width="40" height="40" rx="5" fill="#1A5FAD"/>
      <rect x="52" y="20" width="16" height="12" rx="4" fill="none" stroke="#3D3C39" strokeWidth="3"/>
      <g stroke="#9ED9CF" strokeWidth="2"><line x1="48" y1="36" x2="48" y2="64"/><line x1="72" y1="36" x2="72" y2="64"/></g>
      <rect x="55" y="44" width="10" height="8" rx="2" fill="#F5C07A"/>
    </g>
  ),
  passport: (
    <g>
      <rect x="36" y="18" width="48" height="48" rx="3" fill="#0D4F45"/>
      <circle cx="60" cy="38" r="11" fill="none" stroke="#F5C07A" strokeWidth="2"/>
      <path d="M60,27 L60,49 M49,38 L71,38" stroke="#F5C07A" strokeWidth="1"/>
      <rect x="48" y="55" width="24" height="4" rx="2" fill="#F5C07A"/>
    </g>
  ),
  headphones: (
    <g>
      <path d="M30,52 V42 a30,30 0 0,1 60,0 V52" fill="none" stroke="#1A5FAD" strokeWidth="5"/>
      <rect x="24" y="48" width="14" height="20" rx="5" fill="#1A5FAD"/>
      <rect x="82" y="48" width="14" height="20" rx="5" fill="#1A5FAD"/>
    </g>
  ),
  book: (
    <g>
      <path d="M60,26 Q44,20 26,24 V62 Q44,58 60,64 Q76,58 94,62 V24 Q76,20 60,26 Z" fill="#49BEB6"/>
      <path d="M60,26 V64" stroke="#0D4F45" strokeWidth="2"/>
      <g stroke="#E0F4EF" strokeWidth="1.5"><line x1="32" y1="34" x2="54" y2="32"/><line x1="32" y1="42" x2="54" y2="40"/><line x1="66" y1="32" x2="88" y2="34"/><line x1="66" y1="40" x2="88" y2="42"/></g>
    </g>
  ),
  pencil: (
    <g>
      <rect x="30" y="44" width="50" height="14" rx="2" transform="rotate(-30 55 51)" fill="#F5C07A"/>
      <path d="M70,30 L82,24 L86,34 Z" transform="rotate(-30 78 29)" fill="#0a0a0a"/>
      <rect x="28" y="44" width="8" height="14" transform="rotate(-30 32 51)" fill="#FF5959"/>
    </g>
  ),
  speechBubble: (
    <g>
      <path d="M22,24 H98 a6,6 0 0,1 6,6 V52 a6,6 0 0,1 -6,6 H46 L34,68 V58 H22 a6,6 0 0,1 -6,-6 V30 a6,6 0 0,1 6,-6 Z" fill="#49BEB6"/>
      <g fill="#fff"><circle cx="42" cy="41" r="4"/><circle cx="60" cy="41" r="4"/><circle cx="78" cy="41" r="4"/></g>
    </g>
  ),
  clock: (
    <g>
      <circle cx="60" cy="42" r="26" fill="#fff" stroke="#1A5FAD" strokeWidth="4"/>
      <path d="M60,42 V26 M60,42 L74,48" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="60" cy="42" r="3" fill="#FF5959"/>
    </g>
  ),
  lineGraph: (
    <g>
      <line x1="22" y1="20" x2="22" y2="64" stroke="#7A7870" strokeWidth="2"/>
      <line x1="22" y1="64" x2="100" y2="64" stroke="#7A7870" strokeWidth="2"/>
      <polyline points="26,58 44,48 60,52 76,32 96,24" fill="none" stroke="#1A5FAD" strokeWidth="3"/>
      <g fill="#FF5959"><circle cx="44" cy="48" r="3"/><circle cx="76" cy="32" r="3"/><circle cx="96" cy="24" r="3"/></g>
    </g>
  ),
  barChart: (
    <g>
      <line x1="22" y1="20" x2="22" y2="64" stroke="#7A7870" strokeWidth="2"/>
      <line x1="22" y1="64" x2="100" y2="64" stroke="#7A7870" strokeWidth="2"/>
      <g><rect x="32" y="44" width="13" height="20" fill="#1A5FAD"/><rect x="52" y="32" width="13" height="32" fill="#49BEB6"/><rect x="72" y="38" width="13" height="26" fill="#F5C07A"/><rect x="92" y="50" width="8" height="14" fill="#FF5959"/></g>
    </g>
  ),
  pieChart: (
    <g transform="translate(60,42)">
      <path d="M0,0 L0,-28 A28,28 0 0,1 24,14 Z" fill="#1A5FAD"/>
      <path d="M0,0 L24,14 A28,28 0 0,1 -18,21 Z" fill="#49BEB6"/>
      <path d="M0,0 L-18,21 A28,28 0 0,1 -27,-7 Z" fill="#F5C07A"/>
      <path d="M0,0 L-27,-7 A28,28 0 0,1 0,-28 Z" fill="#FF5959"/>
      <circle cx="0" cy="0" r="10" fill="#fff"/>
    </g>
  ),
};
const QuizImage = ({ id }) => {
  const art = QUIZ_SVG[id];
  if (!art) return null;
  return (
    <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid #e5e5e5", marginBottom:18,
      background:"linear-gradient(160deg,#E5EEFA 0%,#E0F4EF 100%)" }}>
      <svg viewBox="0 0 120 80" width="100%" style={{ display:"block", maxHeight:160 }} role="img" aria-label={`${id} illustration`}>{art}</svg>
    </div>
  );
};

// ─── BRAND LOGO (inline SVG) ───
const BrandLogo = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display:"block", flexShrink:0 }}>
    <rect width="32" height="32" rx="7" fill="#0a0a0a"/>
    <text x="16" y="22" textAnchor="middle" fontSize="18" fontWeight="800" fill="#ffffff"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
          letterSpacing="-1">8</text>
    <circle cx="25" cy="7" r="2.5" fill="#FF5959"/>
  </svg>
);
const Brand = ({ size = 22, onClick }) => (
  <div onClick={onClick} style={{ display:"flex", alignItems:"center", gap:8, cursor: onClick ? "pointer" : "default" }}>
    <BrandLogo size={size} />
    <span style={{ fontWeight:800, fontSize:15, color:"#0a0a0a", letterSpacing:"-0.3px" }}>IELTS<span style={{ color:"#0a0a0a" }}>8</span></span>
  </div>
);

/// ─── UPDATED INITIAL_MODULES ───
// Replace the existing INITIAL_MODULES constant in src/App.js with this block.
// Covers 24 lessons + 5 Mock Tests across 5 modules, matching the screenshot structure.

const INITIAL_MODULES = [
  // ──────────────────────────────────────────────
  // MODULE 1: LISTENING & READING FOUNDATIONS
  // ──────────────────────────────────────────────
  {
    id: 1, title: "MODULE 1: LISTENING & READING FOUNDATIONS", color: "#0a0a0a", bg: "#fafafa",
    lessons: [
      {
        id: "1-1", n: 1,
        title: "Listening — MCQ & Matching Information | Present Simple vs Present Continuous",
        tag: "Listening", materials: [],
        quiz: { questions: [{"type":"mc","q":"In the IELTS Listening test, how many sections (parts) are there in total?","options":["2","3","4","5"],"answer":2,"points":10,"img":"headphones"},{"type":"mc","q":"How long do you get at the END of the IELTS Listening test to transfer your answers to the answer sheet (on paper)?","options":["5 minutes","10 minutes","30 seconds","15 minutes"],"answer":1,"points":10,"img":"clock"},{"type":"mc","q":"In a Listening Multiple Choice (MCQ) question, what is the best strategy before the audio starts?","options":["Read the question and underline keywords","Close your eyes and relax","Write random answers first","Read the next section instead"],"answer":0,"points":10,"img":"headphones"},{"type":"mc","q":"In Matching Information tasks, you usually have to match items to a list of options. What is a common trap?","options":["Options may be used more than once or not at all","The audio repeats every answer twice","All options are always used once","The answers appear in alphabetical order"],"answer":0,"points":10},{"type":"mc","q":"Choose the correct sentence using the Present Simple.","options":["She is going to school every day.","She goes to school every day.","She go to school every day.","She going to school every day."],"answer":1,"points":10},{"type":"mc","q":"Choose the correct sentence using the Present Continuous.","options":["Look! The train arrives now.","Look! The train is arriving now.","Look! The train arrive now.","Look! The train arriving now."],"answer":1,"points":10,"img":"departureBoard"},{"type":"mc","q":"Which time expression typically signals the Present Simple?","options":["right now","at the moment","usually","Listen!"],"answer":2,"points":10},{"type":"mc","q":"Which time expression typically signals the Present Continuous?","options":["every morning","at the moment","on Mondays","never"],"answer":1,"points":10},{"type":"mc","q":"In MCQ Listening, the speaker often mentions a wrong option first, then corrects it. This technique is called using a:","options":["distractor","synonym chain","filler","false start only"],"answer":0,"points":10,"img":"speechBubble"},{"type":"mc","q":"Complete: 'Water _______ at 100 degrees Celsius.' (a general truth)","options":["is boiling","boils","boil","are boiling"],"answer":1,"points":10},{"type":"mc","q":"Complete: 'Please be quiet — the baby _______.' (action happening now)","options":["sleeps","sleep","is sleeping","slept"],"answer":2,"points":10},{"type":"mc","q":"Which verb is a STATIVE verb that is normally NOT used in the Present Continuous?","options":["run","know","eat","write"],"answer":1,"points":10},{"type":"mc","q":"In Section 1 of the IELTS Listening test, the conversation is usually about a/an:","options":["academic lecture","everyday social situation","group seminar discussion","scientific debate"],"answer":1,"points":10,"img":"headphones"},{"type":"tf","q":"In the IELTS Listening test, you hear each recording only ONCE.","answer":true,"points":10,"img":"headphones"},{"type":"tf","q":"Spelling does not matter in the IELTS Listening test; close spelling is always accepted.","answer":false,"points":10},{"type":"tf","q":"The Present Continuous is used for actions happening at or around the moment of speaking.","answer":true,"points":10},{"type":"tf","q":"Stative verbs such as 'believe', 'love' and 'understand' are commonly used in the Present Continuous.","answer":false,"points":10},{"type":"tf","q":"In Matching Information tasks, the answers always appear in the same order as the audio.","answer":false,"points":10},{"type":"fitb","q":"The Listening question type where you choose the correct option from A, B, C or D is called _______ choice.","answer":"multiple","points":10},{"type":"fitb","q":"We add '-s' or '-es' to the verb in the Present Simple for the third person _______ (he/she/it).","answer":"singular","points":10},{"type":"fitb","q":"Complete with Present Continuous: 'They _______ watching a film right now.' Use the correct form of 'be'.","answer":"are","points":10},{"type":"fitb","q":"A word that has the same meaning as another and is often used in audio to 'paraphrase' the question is a _______.","answer":"synonym","points":10,"img":"speechBubble"},{"type":"fitb","q":"Complete with Present Simple: 'He _______ coffee every morning.' (verb: drink)","answer":"drinks","points":10},{"type":"match","q":"Match each time expression to the correct tense it usually signals","pairs":[["every day","Present Simple"],["right now","Present Continuous"],["once a week","Habitual routine"],["Listen!","Action in progress"]],"points":20},{"type":"match","q":"Match each IELTS Listening feature to its description","pairs":[["Section 1","Everyday conversation"],["Section 4","Academic monologue"],["Distractor","Misleading wrong option"],["Matching task","Link items to a list"]],"points":20,"img":"headphones"}]},
        assignment: { type: "writing", prompt: "Write 8 sentences about your daily routine using Present Simple, and 5 sentences about what is happening right now using Present Continuous." }
      },
      {
        id: "1-2", n: 2,
        title: "Reading — True/False/Not Given, MCQ, Short Answer | Articles",
        tag: "Reading", materials: [],
        quiz: { questions: [{"type":"mc","q":"In an IELTS Reading 'True/False/Not Given' task, when should you choose 'Not Given'?","options":["When the statement contradicts the passage","When the statement agrees with the passage","When there is no information in the passage to confirm or deny the statement","When the statement is partly true"],"answer":2,"points":10,"img":"book"},{"type":"mc","q":"In a 'Yes/No/Not Given' task, what exactly are you assessing the statements against?","options":["The writer's claims or opinions","Stated facts only","Your own opinion","Information from other passages"],"answer":0,"points":10},{"type":"mc","q":"If a Short Answer question says 'NO MORE THAN THREE WORDS AND/OR A NUMBER', which answer is acceptable?","options":["'in the early nineteenth century'","'1850'","'a very large number of people'","'the second half of the year'"],"answer":1,"points":10},{"type":"mc","q":"Which is the BEST strategy for True/False/Not Given questions?","options":["Read the whole passage word by word first","Use your background knowledge to decide","Match keywords and look for paraphrases in the passage","Always pick 'Not Given' if unsure"],"answer":2,"points":10,"img":"book"},{"type":"mc","q":"In an IELTS MCQ with one correct answer, the wrong options are often called:","options":["Synonyms","Distractors","Paraphrases","Headings"],"answer":1,"points":10},{"type":"mc","q":"Choose the correct article: 'She is ___ honest student.'","options":["a","an","the","(no article)"],"answer":1,"points":10},{"type":"mc","q":"Choose the correct article: 'He bought ___ university degree online.'","options":["a","an","the","(no article)"],"answer":0,"points":10},{"type":"mc","q":"Which sentence uses 'the' correctly?","options":["The honesty is important.","I play the piano every day.","She likes the music in general.","We had the breakfast at home."],"answer":1,"points":10},{"type":"mc","q":"Choose the correct option: 'The sun rises in ___ east.'","options":["a","an","the","(no article)"],"answer":2,"points":10,"img":"worldMap"},{"type":"mc","q":"Which sentence correctly uses the zero article?","options":["I love the nature.","Cats are independent animals.","She went to the bed early.","The life is hard."],"answer":1,"points":10},{"type":"mc","q":"Choose the correct article: 'We flew over ___ Pacific Ocean.'","options":["a","an","the","(no article)"],"answer":2,"points":10,"img":"plane"},{"type":"mc","q":"Choose the correct article: '___ Mount Everest is the highest mountain on Earth.'","options":["A","An","The","(no article)"],"answer":3,"points":10},{"type":"mc","q":"In TFNG questions, the statements usually appear:","options":["In a random order","In the same order as the information in the passage","In reverse order","Grouped by paragraph headings"],"answer":1,"points":10,"img":"book"},{"type":"tf","q":"In IELTS Reading, 'False' means the statement directly contradicts the information in the passage.","answer":true,"points":10},{"type":"tf","q":"Exceeding the word limit in a Short Answer question (e.g. writing four words when three are allowed) still earns the mark if the meaning is correct.","answer":false,"points":10},{"type":"tf","q":"You should use your own general knowledge, rather than the passage, to answer True/False/Not Given questions.","answer":false,"points":10,"img":"book"},{"type":"tf","q":"The indefinite articles 'a' and 'an' can be used before plural nouns.","answer":false,"points":10},{"type":"tf","q":"We use 'an' before a word that begins with a vowel sound, not just a vowel letter.","answer":true,"points":10},{"type":"fitb","q":"When a statement contradicts the passage in a TFNG task, the correct answer is _______.","answer":"false","points":10},{"type":"fitb","q":"Use the article _______ before a singular noun beginning with a consonant sound, as in '_____ book'.","answer":"a","points":10,"img":"book"},{"type":"fitb","q":"We use the definite article _______ when referring to something already mentioned or known to both speakers.","answer":"the","points":10},{"type":"fitb","q":"In a TFNG task, if the passage neither confirms nor contradicts the statement, the answer is 'Not _______'.","answer":"given","points":10},{"type":"fitb","q":"Choose the article: 'I need _______ umbrella because it is raining.'","answer":"an","points":10},{"type":"match","q":"Match each TFNG answer to the correct situation","pairs":[["True","The statement agrees with the passage"],["False","The statement contradicts the passage"],["Not Given","There is no relevant information in the passage"]],"points":20,"img":"book"},{"type":"match","q":"Match each noun phrase to the correct article","pairs":[["apple (one of many)","an"],["Sahara Desert","the"],["water (in general)","(no article)"],["car (one, first mention)","a"]],"points":20}]},
        assignment: { type: "writing", prompt: "Read any English news article. Write 5 True/False/Not Given statements about it (with answers) and use 'a', 'an', 'the' correctly in 6 example sentences." }
      },
      {
        id: "1-3", n: 3,
        title: "Writing Task 1 — Line Graph | Past Simple vs Past Continuous",
        tag: "Writing", materials: [],
        quiz: { questions: [{"type":"mc","q":"In an IELTS Writing Task 1 line graph response, what should the overview paragraph contain?","options":["Specific data figures for every year","The main trends and most notable features","Your personal opinion about the data","A conclusion recommending action"],"answer":1,"points":10,"img":"lineGraph"},{"type":"mc","q":"Which verb best describes a sudden, steep increase on a line graph?","options":["edged up","rose sharply","dipped slightly","levelled off"],"answer":1,"points":10,"img":"lineGraph"},{"type":"mc","q":"Choose the correct sentence using the Past Simple to describe a completed trend.","options":["Sales were rising in 2010.","Sales rose to 50 units in 2010.","Sales have risen in 2010.","Sales rise in 2010."],"answer":1,"points":10},{"type":"mc","q":"The word 'plateaued' on a line graph means the figures:","options":["increased rapidly","remained stable / stayed the same","fell to zero","fluctuated wildly"],"answer":1,"points":10,"img":"lineGraph"},{"type":"mc","q":"Which sentence correctly uses the Past Continuous?","options":["The number fell while prices were rising.","The number was fell while prices rose.","The number falling while prices rose.","The number fell while prices rise."],"answer":0,"points":10},{"type":"mc","q":"What is the best adverb to describe a slow, steady increase?","options":["dramatically","gradually","abruptly","steeply"],"answer":1,"points":10,"img":"lineGraph"},{"type":"mc","q":"When a line reaches its highest point before declining, we say it:","options":["bottomed out","peaked","stagnated","plummeted"],"answer":1,"points":10,"img":"lineGraph"},{"type":"mc","q":"Which tense is normally used for the main body description of a line graph showing past years (e.g. 1990-2000)?","options":["Present Simple","Past Simple","Present Perfect","Future Simple"],"answer":1,"points":10},{"type":"mc","q":"Identify the noun form: 'There was a sharp _____ in unemployment.'","options":["rise","rose","risen","rising"],"answer":0,"points":10},{"type":"mc","q":"Which sentence describes data that went up and down repeatedly?","options":["The figures plateaued throughout the decade.","The figures fluctuated throughout the decade.","The figures plummeted throughout the decade.","The figures soared throughout the decade."],"answer":1,"points":10,"img":"lineGraph"},{"type":"mc","q":"Choose the grammatically correct combination of Past Simple and Past Continuous.","options":["While the population grew, prices were also increasing.","While the population growing, prices increased.","While the population grow, prices were increasing.","While the population was grew, prices increased."],"answer":0,"points":10},{"type":"mc","q":"Which phrase correctly introduces a Task 1 report?","options":["I think the graph is interesting because","The line graph illustrates the changes in","In my opinion the data shows","To sum up the graph proves that"],"answer":1,"points":10},{"type":"mc","q":"What does 'a slight decline' indicate?","options":["A small decrease","A large decrease","A sudden increase","No change at all"],"answer":0,"points":10},{"type":"tf","q":"A good IELTS Task 1 line graph answer should include your personal opinion.","answer":false,"points":10},{"type":"tf","q":"The Past Continuous (was/were + -ing) is often used to show a longer action in progress at a point in the past.","answer":true,"points":10},{"type":"tf","q":"The words 'rose' and 'increased' have a similar meaning when describing trends.","answer":true,"points":10},{"type":"tf","q":"'Plummeted' describes a gradual, gentle decrease.","answer":false,"points":10},{"type":"tf","q":"For a line graph covering future projections (e.g. up to 2050), you may use future forms such as 'will' or 'is expected to'.","answer":true,"points":10,"img":"lineGraph"},{"type":"fitb","q":"The opposite of the verb 'rose' when describing a downward trend is _______.","answer":"fell","points":10},{"type":"fitb","q":"When a line reaches its maximum value, we say it _______ at that point.","answer":"peaked","points":10,"img":"lineGraph"},{"type":"fitb","q":"Past Continuous is formed with 'was' or 'were' plus the verb's _______ form (e.g. rising).","answer":"ing","points":10},{"type":"fitb","q":"An adverb meaning 'slowly and steadily' often used for gentle trends is _______.","answer":"gradually","points":10},{"type":"fitb","q":"When figures stay at the same level over time, we can say they _______ (remained flat).","answer":"plateaued","points":10,"img":"lineGraph"},{"type":"match","q":"Match each trend verb to its meaning","pairs":[["rose","went up"],["fell","went down"],["fluctuated","rose and fell repeatedly"],["plateaued","stayed the same"]],"points":20},{"type":"match","q":"Match each adverb to the type of change it describes","pairs":[["sharply","a sudden, large change"],["gradually","a slow, steady change"],["slightly","a small change"]],"points":20}]},
        assignment: { type: "essay", prompt: "IELTS Writing Task 1: The line graph below shows the percentage of people using the internet in three countries (UK, Kazakhstan, Japan) from 2000 to 2020.\nUK: 25% → 96%, Kazakhstan: 2% → 79%, Japan: 30% → 93%.\nSummarise the main features and make comparisons where relevant. Write at least 150 words.\nAlso write 4 original sentences using Past Simple and Past Continuous together." }
      },
      {
        id: "1-4", n: 4,
        title: "Writing Task 2 — Advantages/Disadvantages Essay | Grammar Review",
        tag: "Writing", materials: [],
        quiz: { questions: [{"type":"mc","q":"What is the minimum word count required for IELTS Writing Task 2?","options":["150 words","200 words","250 words","300 words"],"answer":2,"points":10,"img":"pencil"},{"type":"mc","q":"How many minutes are you advised to spend on Writing Task 2?","options":["20 minutes","30 minutes","40 minutes","60 minutes"],"answer":2,"points":10,"img":"clock"},{"type":"mc","q":"Which is the recommended structure for an advantages/disadvantages essay?","options":["Introduction, one body paragraph, conclusion","Introduction, two body paragraphs, conclusion","Conclusion, body, introduction","Body paragraphs only"],"answer":1,"points":10},{"type":"mc","q":"Which linker is used to introduce a contrasting idea?","options":["Furthermore","However","Therefore","Moreover"],"answer":1,"points":10},{"type":"mc","q":"Which phrase best signals the second side of an argument?","options":["For example","On the other hand","In conclusion","First of all"],"answer":1,"points":10},{"type":"mc","q":"What should the introduction of a Task 2 essay do?","options":["Give your personal opinion only","Paraphrase the question and outline the essay","List all examples","Repeat the question word for word"],"answer":1,"points":10,"img":"pencil"},{"type":"mc","q":"Which linker is best for adding extra supporting information?","options":["In contrast","Furthermore","Although","Whereas"],"answer":1,"points":10},{"type":"mc","q":"What is the main purpose of the conclusion?","options":["Introduce a brand-new idea","Summarise the main points and restate the position","Give a long example","Ask the reader a question"],"answer":1,"points":10},{"type":"mc","q":"Choose the grammatically correct sentence.","options":["There is many advantages to studying abroad.","There are many advantages to studying abroad.","There be many advantages to studying abroad.","There has many advantages to studying abroad."],"answer":1,"points":10},{"type":"mc","q":"Choose the correct form: 'One major benefit is that people _____ access to better jobs.'","options":["gains","gain","gaining","to gain"],"answer":1,"points":10},{"type":"mc","q":"Which sentence uses the correct conditional?","options":["If governments invested more, transport would improve.","If governments invest more, transport would improved.","If governments will invest more, transport improve.","If governments invested more, transport will improving."],"answer":0,"points":10},{"type":"mc","q":"Which word is a formal synonym for 'a lot of' suitable for academic writing?","options":["loads of","tons of","numerous","heaps of"],"answer":2,"points":10},{"type":"mc","q":"Which linker shows a result or consequence?","options":["Consequently","Although","Whereas","On the other hand"],"answer":0,"points":10},{"type":"tf","q":"An advantages/disadvantages essay should present both sides before reaching a conclusion.","answer":true,"points":10},{"type":"tf","q":"Writing fewer than 250 words can reduce your Task Achievement score.","answer":true,"points":10,"img":"pencil"},{"type":"tf","q":"'However' and 'Furthermore' mean exactly the same thing.","answer":false,"points":10},{"type":"tf","q":"Each body paragraph should focus on one main idea.","answer":true,"points":10},{"type":"tf","q":"It is good practice to copy the exact words of the question in your introduction instead of paraphrasing.","answer":false,"points":10},{"type":"fitb","q":"The first paragraph of the essay is called the _______.","answer":"introduction","points":10},{"type":"fitb","q":"To contrast two ideas, you can use the linker 'on the other _______'.","answer":"hand","points":10},{"type":"fitb","q":"A good essay needs a clear _______ sentence at the start of each body paragraph.","answer":"topic","points":10},{"type":"fitb","q":"You should write at least 250 _______ in Task 2.","answer":"words","points":10,"img":"pencil"},{"type":"fitb","q":"The linker 'in _______' is used to show the opposite of a previous idea, as in 'in contrast'.","answer":"contrast","points":10},{"type":"match","q":"Match each linker to its function","pairs":[["However","Contrast"],["Furthermore","Addition"],["Therefore","Result"],["For example","Illustration"]],"points":20},{"type":"match","q":"Match each essay part to its main purpose","pairs":[["Introduction","Paraphrase the question"],["Body paragraph","Develop one main idea"],["Conclusion","Summarise the points"]],"points":20}]},
        assignment: { type: "essay", prompt: "IELTS Writing Task 2: Some people think that the advantages of living in a big city outweigh the disadvantages. To what extent do you agree or disagree?\nWrite at least 250 words with an introduction, two body paragraphs (advantages & disadvantages), and a conclusion." }
      },
      {
        id: "1-5", n: 5,
        title: "Speaking Part 1 — Fluency | Comparative and Superlative",
        tag: "Speaking", materials: [],
        quiz: { questions: [{"type":"mc","q":"In IELTS Speaking Part 1, what is the best length for most answers?","options":["One word only","Two to three sentences","A two-minute monologue","A single rehearsed paragraph of 200 words"],"answer":1,"points":10,"img":"speechBubble"},{"type":"mc","q":"Why is fluency rewarded in IELTS Speaking?","options":["It shows you can speak smoothly without too many unnatural pauses","It means you talk as fast as possible","It proves you memorised the answers","It shows you use difficult words"],"answer":0,"points":10},{"type":"mc","q":"Which is the correct comparative form of 'big'?","options":["biger","more big","bigger","biggest"],"answer":2,"points":10},{"type":"mc","q":"Which is the correct superlative of 'good'?","options":["goodest","the best","the better","the most good"],"answer":1,"points":10},{"type":"mc","q":"A good way to extend a Part 1 answer is to:","options":["Repeat the question word for word","Add a reason or example after your main point","Stay completely silent to think","Answer only with 'yes' or 'no'"],"answer":1,"points":10,"img":"speechBubble"},{"type":"mc","q":"Which sentence is grammatically correct?","options":["My city is more big than yours.","My city is bigger than yours.","My city is more bigger than yours.","My city is the bigger than yours."],"answer":1,"points":10},{"type":"mc","q":"What is the comparative form of 'bad'?","options":["badder","worse","worst","more bad"],"answer":1,"points":10},{"type":"mc","q":"Which superlative is correct for 'far'?","options":["the farrest","the most far","the furthest","the farer"],"answer":2,"points":10},{"type":"mc","q":"Some 'filler' phrases like 'Well, let me think...' are useful in Part 1 because they:","options":["Waste the examiner's time","Help you sound natural while you organise your thoughts","Lower your score automatically","Should never be used"],"answer":1,"points":10,"img":"speechBubble"},{"type":"mc","q":"Which sentence uses the superlative correctly?","options":["This is the more interesting hobby I have.","This is the most interesting hobby I have.","This is most interesting hobby I have.","This is the interestingest hobby I have."],"answer":1,"points":10},{"type":"mc","q":"For a two-syllable adjective ending in '-y' like 'happy', the comparative is:","options":["more happy","happier","happyer","happiest"],"answer":1,"points":10},{"type":"mc","q":"If you don't understand a Part 1 question, the best strategy is to:","options":["Stay silent","Politely ask the examiner to repeat or rephrase it","Answer a different question","End the test"],"answer":1,"points":10},{"type":"mc","q":"Which word correctly completes: 'Summer is _____ than winter here.'","options":["hot","hotter","hottest","more hot"],"answer":1,"points":10},{"type":"tf","q":"In IELTS Speaking Part 1, you should give very long, essay-length answers to every question.","answer":false,"points":10},{"type":"tf","q":"Adding reasons and examples helps you speak more fluently and develop your answers.","answer":true,"points":10,"img":"speechBubble"},{"type":"tf","q":"The superlative of 'good' is 'goodest'.","answer":false,"points":10},{"type":"tf","q":"Long adjectives such as 'beautiful' usually form the comparative with 'more' (more beautiful), not '-er'.","answer":true,"points":10},{"type":"tf","q":"Speaking extremely fast with no pauses always gives you the highest fluency score.","answer":false,"points":10},{"type":"fitb","q":"Complete the comparative: 'Tokyo is _______ than my hometown.' (big)","answer":"bigger","points":10},{"type":"fitb","q":"Complete the superlative: 'It was _______ day of my life.' (use 'the' + happy)","answer":"the happiest","points":10},{"type":"fitb","q":"The irregular comparative of 'bad' is _______.","answer":"worse","points":10},{"type":"fitb","q":"To avoid awkward silence while thinking, a useful filler is: 'Well, _______ me think...'","answer":"let","points":10,"img":"speechBubble"},{"type":"fitb","q":"Complete with a superlative: 'Mount Everest is _______ mountain in the world.' (use 'the' + high)","answer":"the highest","points":10},{"type":"match","q":"Match each adjective to its correct comparative form","pairs":[["good","better"],["bad","worse"],["far","further"],["happy","happier"]],"points":20},{"type":"match","q":"Match each Part 1 strategy to its purpose","pairs":[["Give a reason","Extends and develops your answer"],["Use a filler phrase","Buys natural thinking time"],["Ask to repeat","Clarifies a question you missed"]],"points":20,"img":"speechBubble"}]},
        assignment: { type: "speaking", prompt: "Record yourself (2–3 min) answering:\n1. Describe your hometown. Is it bigger or smaller than the capital?\n2. What is the most interesting place you have ever visited? Why was it better than other places?\n3. Compare studying alone vs studying in a group.\n\nPaste a recording link or write your answers (min. 150 words)." }
      },
      {
        id: "mock-1", n: null,
        title: "MOCK TEST 1",
        tag: "Mock", materials: [],
        quiz: { questions: [{"type":"mc","q":"In the IELTS Listening test, how many sections are there in total?","options":["2","3","4","5"],"answer":2,"points":10,"img":"headphones"},{"type":"mc","q":"You will hear: 'The library opens at half past nine.' What time does it open?","options":["9:15","9:30","9:45","10:30"],"answer":1,"points":10,"img":"clock"},{"type":"match","q":"Match each speaker to the place they are describing","pairs":[["A modern building with many books","Library"],["A place to catch flights","Airport"],["A room with beds for patients","Hospital"]],"points":20,"img":"airport"},{"type":"mc","q":"In a matching task you hear: 'Gate B7 is now boarding.' Which word signals the location?","options":["now","boarding","Gate","is"],"answer":2,"points":10,"img":"departureBoard"},{"type":"tf","q":"In IELTS Listening, you hear the recording twice.","answer":false,"points":10,"img":"headphones"},{"type":"mc","q":"For an IELTS Reading 'True/False/Not Given' question, you choose 'Not Given' when the statement is:","options":["Clearly stated as correct","Contradicted by the text","Neither confirmed nor contradicted by the text","A grammatical error"],"answer":2,"points":10,"img":"book"},{"type":"tf","q":"In Reading, 'False' means the statement contradicts the information in the passage.","answer":true,"points":10},{"type":"tf","q":"For short-answer questions in Reading, you should usually write a full sentence with at least ten words.","answer":false,"points":10},{"type":"mc","q":"A Reading short-answer instruction says 'NO MORE THAN TWO WORDS'. Which answer is acceptable?","options":["The very large city centre","city centre","A busy city centre area","in the city centre area today"],"answer":1,"points":10,"img":"book"},{"type":"fitb","q":"The definite article used before a specific, already-known noun is '_______'.","answer":"the","points":10},{"type":"fitb","q":"Use the indefinite article '_______' before a singular word starting with a consonant sound, e.g. '___ book'.","answer":"a","points":10,"img":"book"},{"type":"mc","q":"Which sentence uses articles correctly?","options":["I saw a elephant at zoo.","I saw an elephant at the zoo.","I saw an elephant at a zoo yesterday once.","I saw the elephant at an zoo."],"answer":1,"points":10},{"type":"mc","q":"In Writing Task 1, a line graph is best used to show:","options":["Parts of a whole at one moment","Changes or trends over time","A single fixed value","Directions on a map"],"answer":1,"points":10,"img":"lineGraph"},{"type":"fitb","q":"Past Simple of 'rise' is '_______' (e.g. Sales ___ sharply in 2010).","answer":"rose","points":10,"img":"lineGraph"},{"type":"mc","q":"Choose the correct Past Continuous sentence for describing a trend.","options":["Sales was rising steadily.","Sales were rising steadily.","Sales is rising steadily.","Sales rising steadily were."],"answer":1,"points":10,"img":"lineGraph"},{"type":"tf","q":"In Writing Task 1, the Past Simple is appropriate when describing data from a completed past year such as 2005.","answer":true,"points":10},{"type":"match","q":"Match each verb to its Past Simple form","pairs":[["fall","fell"],["increase","increased"],["grow","grew"]],"points":20,"img":"lineGraph"},{"type":"mc","q":"Which phrase best describes a small downward movement on a line graph?","options":["soared dramatically","dipped slightly","plummeted sharply","remained stable"],"answer":1,"points":10,"img":"lineGraph"},{"type":"mc","q":"An 'advantages and disadvantages' essay in Writing Task 2 should mainly:","options":["Tell a personal story","Discuss the benefits and drawbacks of a topic","Describe a graph in detail","List vocabulary words only"],"answer":1,"points":10,"img":"pencil"},{"type":"fitb","q":"A common linking word to introduce a drawback is 'One _______ is that...' (a negative point).","answer":"disadvantage","points":10},{"type":"tf","q":"A Writing Task 2 essay should have a clear introduction, body paragraphs, and a conclusion.","answer":true,"points":10,"img":"pencil"},{"type":"mc","q":"In Speaking Part 1 you are asked to compare two cities. Which sentence is correct?","options":["My city is more big than yours.","My city is bigger than yours.","My city is the bigger than yours.","My city is biggest than yours."],"answer":1,"points":10,"img":"speechBubble"},{"type":"mc","q":"Choose the correct superlative form.","options":["This is the most fast train.","This is the fastest train.","This is the more fast train.","This is fastest train."],"answer":1,"points":10},{"type":"fitb","q":"The comparative of the adjective 'good' is '_______'.","answer":"better","points":10},{"type":"match","q":"Match each adjective to its superlative form","pairs":[["happy","happiest"],["bad","worst"],["expensive","most expensive"]],"points":20,"img":"speechBubble"}]},
        assignment: { type: "essay", prompt: "MOCK ESSAY — Task 2: Some people believe that technology is making people less social. Others argue it helps them connect better. Discuss both views and give your own opinion. Write at least 250 words." }
      },
    ]
  },

  // ──────────────────────────────────────────────
  // MODULE 2: LISTENING ADVANCED & WRITING
  // ──────────────────────────────────────────────
  {
    id: 2, title: "MODULE 2: LISTENING ADVANCED & WRITING", color: "#0a0a0a", bg: "#fafafa",
    lessons: [
      {
        id: "2-1", n: 6,
        title: "Listening — Maps & Plans Labelling | Present Perfect vs Past Simple",
        tag: "Listening", materials: [],
        quiz: { questions: [
          { type: "mc", q: "In Map Labelling tasks, labels must:", options: ["Be inferred","Come directly from the audio","Be guessed from context","Be written in capitals only"], answer: 1, points: 10 },
          { type: "mc", q: "Which sentence uses Present Perfect correctly?", options: ["I have went to Paris.","I went to Paris last year.","I have never been to Paris.","I been to Paris."], answer: 2, points: 10 },
          { type: "tf", q: "Present Perfect is used with specific past time expressions like 'yesterday'.", answer: false, points: 10 },
          { type: "fitb", q: "Map labelling tasks require you to follow directions and label a _______ or building plan.", answer: "map", points: 10 },
        ]},
        assignment: { type: "writing", prompt: "Write 6 sentences using Present Perfect and 6 using Past Simple. Explain the difference between these two tenses in your own words (3–4 sentences). Example topic: your learning journey." }
      },
      {
        id: "2-2", n: 7,
        title: "Reading — Matching Headings, Locating Information, Summary Completion | Passive Voice",
        tag: "Reading", materials: [],
        quiz: { questions: [
          { type: "mc", q: "In 'Matching Headings', you match headings to:", options: ["Individual sentences","Whole paragraphs","Keywords","Titles"], answer: 1, points: 10 },
          { type: "mc", q: "Which sentence is in the Passive Voice?", options: ["Scientists discovered penicillin.","Penicillin was discovered by scientists.","Scientists have discovered penicillin.","Scientists are discovering penicillin."], answer: 1, points: 10 },
          { type: "tf", q: "In Summary Completion, answers must come from the passage.", answer: true, points: 10 },
          { type: "fitb", q: "Passive voice is formed with 'be' + past _______.", answer: "participle", points: 10 },
        ]},
        assignment: { type: "writing", prompt: "Rewrite these 6 sentences in the Passive Voice:\n1. The government introduced new tax laws.\n2. Researchers conducted three experiments.\n3. Engineers designed the new bridge.\n4. The company launched its product in 2022.\n5. Teachers assessed all students fairly.\n6. Scientists are studying climate change globally." }
      },
      {
        id: "2-3", n: 8,
        title: "Writing Task 1 — Bar Chart & Pie Chart | Grammar Review",
        tag: "Writing", materials: [], guideUrl: "/writing-guide.html",
        quiz: { questions: [{"type":"mc","q":"In IELTS Writing Task 1, when describing a bar chart or pie chart, you should:","options":["Give your personal opinion about the data","Only describe data objectively without any opinion","Suggest solutions to the problems shown","Predict what will happen in the future"],"answer":1,"points":10,"img":"barChart"},{"type":"mc","q":"A good overview for a Task 1 chart should:","options":["List every single number in the chart","Summarise the main trends or most striking features","Be the last sentence of the conclusion only","Repeat the question word for word"],"answer":1,"points":10,"img":"pieChart"},{"type":"mc","q":"\"Asia _______ 45% of all global air passengers in 2023.\" Choose the best phrase to complete this sentence.","options":["accounted for","accounted to","was accounted","accounting of"],"answer":0,"points":10,"img":"worldMap"},{"type":"mc","q":"If Airline A carried 4 million passengers and Airline B carried 2 million, which sentence is correct?","options":["Airline A carried twice as many passengers as Airline B","Airline B carried twice as many passengers as Airline A","Airline A carried half as many passengers as Airline B","Airline A carried two times fewer passengers than Airline B"],"answer":0,"points":10,"img":"plane"},{"type":"mc","q":"Which word best describes a slice making up more than 50% of a pie chart?","options":["minority","fraction","majority","remainder"],"answer":2,"points":10,"img":"pieChart"},{"type":"mc","q":"\"The number of flights at Heathrow rose _______ 300 to 450 between 2010 and 2020.\" Choose the correct prepositions.","options":["from ... to","by ... from","at ... by","of ... to"],"answer":0,"points":10,"img":"airport"},{"type":"mc","q":"Which sentence uses a percentage correctly to compare proportions?","options":["Business travel made up a quarter, while leisure travel accounted for almost half.","Business travel made the quarter, while leisure travel accounted half.","Business travel was a quarter percent of leisure travel half.","Business travel quarter and leisure travel half accounted."],"answer":0,"points":10,"img":"boardingPass"},{"type":"mc","q":"To describe the smallest segment of a pie chart of reasons for flying, you could write:","options":["The largest proportion flew for business.","Visiting family made up the smallest share, at just 5%.","The majority flew for tourism above all else.","Tourism accounted for the second largest slice only."],"answer":1,"points":10,"img":"pieChart"},{"type":"mc","q":"Which is the best synonym for \"rose sharply\" when describing a bar's increase?","options":["fell gradually","increased significantly","remained stable","fluctuated slightly"],"answer":1,"points":10,"img":"barChart"},{"type":"mc","q":"In the sentence \"Each of the airports _______ a different number of flights,\" which verb form is grammatically correct?","options":["handle","handles","are handling","have handled"],"answer":1,"points":10,"img":"departureBoard"},{"type":"mc","q":"Which sentence correctly uses an approximation for chart data?","options":["Exactly around 60% of passengers were tourists.","Roughly two thirds of passengers were tourists.","Approximately exactly 60% of passengers.","Around precisely two thirds were tourists."],"answer":1,"points":10,"img":"luggage"},{"type":"mc","q":"Which comparative sentence is grammatically correct?","options":["Dubai handled more flights than any other airport.","Dubai handled more flights then any other airport.","Dubai handled the more flights than other airports.","Dubai handled flights more than any other airport did it."],"answer":0,"points":10,"img":"airport"},{"type":"mc","q":"A pie chart is most appropriate for showing:","options":["Changes in passenger numbers over many years","How a total is divided into parts at one point in time","The exact speed of different aircraft","A timeline of airline mergers"],"answer":1,"points":10,"img":"pieChart"},{"type":"tf","q":"In IELTS Writing Task 1, you should include your own opinion about whether the trends are good or bad.","answer":false,"points":10,"img":"pencil"},{"type":"tf","q":"The phrase \"accounted for\" can be used to express what proportion or percentage a category represents.","answer":true,"points":10,"img":"pieChart"},{"type":"tf","q":"A bar chart is generally better than a pie chart for comparing values across several different categories.","answer":true,"points":10,"img":"barChart"},{"type":"tf","q":"If 50% chose business and 25% chose leisure, it is correct to say twice as many people chose business as leisure.","answer":true,"points":10,"img":"plane"},{"type":"tf","q":"A Task 1 response should always finish with a paragraph recommending what the airline should do next.","answer":false,"points":10,"img":"clock"},{"type":"fitb","q":"A summary sentence highlighting the main features of a chart is called the _______.","answer":"overview","points":10,"img":"barChart"},{"type":"fitb","q":"\"Tourism _______ for the largest proportion of reasons for flying.\" Fill in the verb (past tense).","answer":"accounted","points":10,"img":"pieChart"},{"type":"fitb","q":"A pie chart slice equal to 50% can be described as exactly _______ of the total.","answer":"half","points":10,"img":"pieChart"},{"type":"fitb","q":"\"The number of passengers _______ steadily from 2015 to 2020.\" Fill in a verb meaning went up (past tense).","answer":"increased","points":10,"img":"lineGraph"},{"type":"fitb","q":"When a category represents the greatest share of a pie chart, we call it the _______ (opposite of minority).","answer":"majority","points":10,"img":"pieChart"},{"type":"match","q":"Match each percentage to the fraction commonly used to describe it","pairs":[["25%","a quarter"],["50%","a half"],["75%","three quarters"],["10%","a tenth"]],"points":20,"img":"pieChart"},{"type":"match","q":"Match each chart-description phrase to its meaning","pairs":[["accounted for","made up a proportion of"],["the majority","more than half"],["twice as many as","double the amount of"]],"points":20,"img":"barChart"}]},
        assignment: { type: "essay", prompt: "IELTS Writing Task 1: The pie chart shows the distribution of household spending in Kazakhstan in 2023: Food 35%, Housing 25%, Transport 15%, Education 12%, Entertainment 8%, Other 5%.\nWrite a 150-word report summarising the main features and making comparisons." }
      },
      {
        id: "mock-2", n: null,
        title: "MOCK TEST 2",
        tag: "Mock", materials: [],
        quiz: { questions: [
          { type: "mc", q: "Which correctly uses Present Perfect?", options: ["She has went home.","She went home already.","She has already gone home.","She is gone home."], answer: 2, points: 10 },
          { type: "mc", q: "Matching Headings tasks require you to match headings to:", options: ["Sentences","Words","Paragraphs","Authors"], answer: 2, points: 10 },
          { type: "tf", q: "Passive voice is common in IELTS academic writing.", answer: true, points: 10 },
          { type: "fitb", q: "In Map Labelling, answers must come from the _______ recording.", answer: "audio", points: 10 },
          { type: "match", q: "Match the listening section to its typical task type", pairs: [["Section 1","Everyday social conversation"],["Section 2","A talk or speech"],["Section 3","Academic discussion"],["Section 4","University lecture"]], points: 20 },
          { type: "mc", q: "Which sentence best describes the largest pie segment?", options: ["It was quite small","Food accounted for the largest share at 35%","Food was normal","The smallest was food"], answer: 1, points: 10 },
        ]},
        assignment: { type: "essay", prompt: "MOCK TASK 1: The bar chart shows the number of tourists visiting five cities (London, Paris, Dubai, Tokyo, Almaty) in 2023. London: 20M, Paris: 18M, Dubai: 15M, Tokyo: 12M, Almaty: 3M.\nSummarise the main features and make comparisons. Write at least 150 words." }
      },
    ]
  },

  // ──────────────────────────────────────────────
  // MODULE 3: WRITING TASKS & CONDITIONALS
  // ──────────────────────────────────────────────
  {
    id: 3, title: "MODULE 3: WRITING TASKS & CONDITIONALS", color: "#0a0a0a", bg: "#fafafa",
    lessons: [
      {
        id: "3-1", n: 9,
        title: "Writing Task 2 — Cause/Problem Solution Essay | Cohesive Devices",
        tag: "Writing", materials: [],
        quiz: { questions: [
          { type: "mc", q: "In a Problem-Solution essay, the typical structure is:", options: ["Problem only","Solution only","Problem → Cause → Solution → Conclusion","Introduction → Opinion → Example"], answer: 2, points: 10 },
          { type: "mc", q: "Which is a cohesive device that introduces a result?", options: ["Although","However","Therefore","Despite"], answer: 2, points: 10 },
          { type: "tf", q: "Cohesive devices help ideas flow logically from one sentence to the next.", answer: true, points: 10 },
          { type: "fitb", q: "'Furthermore' and 'Moreover' are used to _______ a point.", answer: "add", points: 10 },
        ]},
        assignment: { type: "essay", prompt: "IELTS Writing Task 2: In many cities, traffic congestion is a serious problem. What are the causes of this problem and what measures could be taken to solve it?\nWrite at least 250 words. Use at least 6 different cohesive devices." }
      },
      {
        id: "3-2", n: 10,
        title: "Speaking Part 2 — Long Turn | Past Perfect",
        tag: "Speaking", materials: [],
        quiz: { questions: [
          { type: "mc", q: "How long is the Speaking Part 2 long turn?", options: ["30 seconds","1–2 minutes","5 minutes","10 minutes"], answer: 1, points: 10 },
          { type: "mc", q: "Which sentence uses Past Perfect correctly?", options: ["She had finished dinner before he arrived.","She finished dinner before he was arrived.","She had finish dinner before he arrived.","She has finished dinner before he arrived."], answer: 0, points: 10 },
          { type: "tf", q: "You get 1 minute to prepare your notes in Part 2.", answer: true, points: 10 },
          { type: "fitb", q: "Past Perfect = had + past _______.", answer: "participle", points: 10 },
        ]},
        assignment: { type: "speaking", prompt: "Prepare and record a 1–2 minute Part 2 talk on the following cue card:\n\n'Describe a memorable journey you have taken.'\nYou should say:\n- Where you went\n- When and why you went\n- What happened during the journey\n- And explain why it was memorable\n\nUse Past Perfect at least twice in your answer. Paste a link or write your answer." }
      },
      {
        id: "3-3", n: 11,
        title: "Listening — Table/Form/Note Completion | Prepositions",
        tag: "Listening", materials: [],
        quiz: { questions: [
          { type: "mc", q: "In Form Completion tasks, how should you write proper nouns?", options: ["Lowercase only","Exactly as you hear them","In block capitals always","Abbreviated"], answer: 1, points: 10 },
          { type: "mc", q: "Choose the correct preposition: 'She arrived _____ Monday morning.'", options: ["in","at","on","by"], answer: 2, points: 10 },
          { type: "tf", q: "Spelling errors in Listening answers cost marks.", answer: true, points: 10 },
          { type: "match", q: "Match the preposition to its use", pairs: [["in","months and years"],["on","days and dates"],["at","specific times"]], points: 20 },
        ]},
        assignment: { type: "writing", prompt: "Complete these sentences with the correct preposition (in/on/at/by/for/since):\n1. I have been studying IELTS _______ six months.\n2. The exam starts _______ 9:00 AM.\n3. She was born _______ March.\n4. The results will be ready _______ Monday.\n5. He has lived here _______ 2020.\nThen write 5 more original sentences using prepositions of time correctly." }
      },
      {
        id: "mock-3", n: null,
        title: "MOCK TEST 3",
        tag: "Mock", materials: [],
        quiz: { questions: [
          { type: "mc", q: "Which cohesive device shows contrast?", options: ["Furthermore","Therefore","Nevertheless","In addition"], answer: 2, points: 10 },
          { type: "mc", q: "Speaking Part 2 cue card preparation time is:", options: ["30 seconds","1 minute","2 minutes","No preparation allowed"], answer: 1, points: 10 },
          { type: "tf", q: "Past Perfect describes an action completed before another past action.", answer: true, points: 10 },
          { type: "fitb", q: "In Form Completion, you must spell answers _______ as heard.", answer: "correctly", points: 10 },
          { type: "mc", q: "Which preposition is correct: 'I'll meet you _____ the café.'", options: ["in","at","on","by"], answer: 1, points: 10 },
          { type: "fitb", q: "A Problem-Solution essay must include both the _______ and a proposed fix.", answer: "problem", points: 10 },
          { type: "match", q: "Match the essay type to its structure", pairs: [["Opinion essay","State view + 2 body paragraphs"],["Problem-Solution","Problem + Cause + Solution"],["Advantages/Disadvantages","Both sides + optional opinion"],["Discussion","Both views + your stance"]], points: 20 },
        ]},
        assignment: { type: "essay", prompt: "MOCK TASK 2: Many young people today are choosing to live alone rather than with their families. Discuss the advantages and disadvantages of this trend. Write at least 250 words." }
      },
    ]
  },

  // ──────────────────────────────────────────────
  // MODULE 4: READING SKILLS & CONDITIONALS
  // ──────────────────────────────────────────────
  {
    id: 4, title: "MODULE 4: READING SKILLS & CONDITIONALS", color: "#0a0a0a", bg: "#fafafa",
    lessons: [
      {
        id: "4-1", n: 12,
        title: "Reading — Matching Information, Choosing Title, Sentence Completion | Grammar Review",
        tag: "Reading", materials: [],
        quiz: { questions: [
          { type: "mc", q: "In 'Matching Information', you match specific information to:", options: ["Headings","Paragraphs","Writers","Dates"], answer: 1, points: 10 },
          { type: "mc", q: "What is the best strategy for 'Choosing the Title'?", options: ["Pick the title with the most keywords","Choose the title that covers the whole passage","Pick the longest title","Choose the first title"], answer: 1, points: 10 },
          { type: "tf", q: "Sentence Completion answers must fit grammatically in the gap.", answer: true, points: 10 },
          { type: "fitb", q: "In Choosing the Title, you must find the title that reflects the _______ theme.", answer: "main", points: 10 },
        ]},
        assignment: { type: "writing", prompt: "Read any two-paragraph English text (news, Wikipedia). Write:\n1. A suitable title for the whole text\n2. One sentence summarising each paragraph\n3. Three Sentence Completion questions (with answers) based on the text" }
      },
      {
        id: "4-2", n: 13,
        title: "Writing Task 1 — Tables | Zero and 1st Conditionals",
        tag: "Writing", materials: [],
        quiz: { questions: [
          { type: "mc", q: "Zero Conditional is used for:", options: ["Impossible situations","Scientific facts and general truths","Future plans","Past habits"], answer: 1, points: 10 },
          { type: "mc", q: "Which is a 1st Conditional sentence?", options: ["If I were you, I would study.","If it rains, I will stay home.","If he had studied, he would have passed.","If water reaches 100°C, it boils."], answer: 1, points: 10 },
          { type: "tf", q: "In a table Task 1, you should describe every single number.", answer: false, points: 10 },
          { type: "fitb", q: "In Zero Conditional: If + present simple, + present _______.", answer: "simple", points: 10 },
        ]},
        assignment: { type: "essay", prompt: "IELTS Writing Task 1: The table shows the number of students enrolled in four faculties at a university in 2020 and 2023.\nEngineering: 1,200 → 1,450 | Business: 2,000 → 1,800 | Arts: 900 → 1,100 | Science: 1,500 → 1,750\nSummarise the main features and make comparisons. Write at least 150 words.\nAlso write 4 Zero Conditional and 4 First Conditional sentences on any IELTS topic." }
      },
      {
        id: "4-3", n: 14,
        title: "Writing Task 2 — Discussion Essay | 2nd and 3rd Conditionals",
        tag: "Writing", materials: [],
        quiz: { questions: [
          { type: "mc", q: "A Discussion Essay asks you to:", options: ["Give only your opinion","Discuss both sides and give your view","Describe a problem","Explain a process"], answer: 1, points: 10 },
          { type: "mc", q: "Which is a correct 2nd Conditional?", options: ["If I study hard, I will pass.","If I studied harder, I would pass.","If I had studied, I would have passed.","If I study, I passed."], answer: 1, points: 10 },
          { type: "tf", q: "3rd Conditional refers to an unreal situation in the past.", answer: true, points: 10 },
          { type: "fitb", q: "2nd Conditional = If + past simple, + would + _______ infinitive.", answer: "bare", points: 10 },
        ]},
        assignment: { type: "essay", prompt: "IELTS Writing Task 2: Some people believe that social media has had a positive impact on society, while others think the negative effects outweigh the benefits. Discuss both views and give your own opinion.\nWrite at least 250 words. Include at least one 2nd or 3rd Conditional sentence in your essay." }
      },
      {
        id: "mock-4", n: null,
        title: "MOCK TEST 4",
        tag: "Mock", materials: [],
        quiz: { questions: [
          { type: "mc", q: "Which conditional describes an unreal present situation?", options: ["Zero","First","Second","Third"], answer: 2, points: 10 },
          { type: "tf", q: "In Matching Information tasks, you must always read every paragraph.", answer: true, points: 10 },
          { type: "fitb", q: "In Choosing the Title, choose the title that covers the _______ of the text.", answer: "whole", points: 10 },
          { type: "mc", q: "Which sentence is a 3rd Conditional?", options: ["If I study, I will pass.","If I studied, I would pass.","If I had studied, I would have passed.","If I study, I pass."], answer: 2, points: 10 },
          { type: "match", q: "Match the conditional to its meaning", pairs: [["Zero","General truths"],["First","Real future"],["Second","Unreal present"],["Third","Unreal past"]], points: 20 },
          { type: "mc", q: "In a Table Task 1, the most important information to describe is:", options: ["Every number","The most significant trends and differences","Your opinion","Future predictions"], answer: 1, points: 10 },
        ]},
        assignment: { type: "essay", prompt: "MOCK TASK 2: Some people believe that governments should invest more money in public transport, while others think that money is better spent on roads for private vehicles. Discuss both views and give your opinion. Write at least 250 words." }
      },
    ]
  },

  // ──────────────────────────────────────────────
  // MODULE 5: ADVANCED SKILLS & FINAL PREP
  // ──────────────────────────────────────────────
  {
    id: 5, title: "MODULE 5: ADVANCED SKILLS & FINAL PREP", color: "#0a0a0a", bg: "#fafafa",
    lessons: [
      {
        id: "5-1", n: 15,
        title: "Speaking Part 2 & 3 | Other Expressions in Conditionals",
        tag: "Speaking", materials: [],
        quiz: { questions: [
          { type: "mc", q: "Which expression can replace 'if' in a conditional?", options: ["Because","Although","Unless","Despite"], answer: 2, points: 10 },
          { type: "mc", q: "Speaking Part 3 involves:", options: ["A prepared monologue","A short personal answer","Abstract discussion with the examiner","Describing a picture"], answer: 2, points: 10 },
          { type: "tf", q: "'Unless' means 'if not'.", answer: true, points: 10 },
          { type: "fitb", q: "'Provided that', 'as long as', and 'supposing' are all alternatives to _______.", answer: "if", points: 10 },
        ]},
        assignment: { type: "speaking", prompt: "Record yourself answering these Part 3 questions (2–3 minutes total):\n1. How do you think technology will change education in the future?\n2. What would happen if schools did not teach languages?\n3. Supposing you could redesign the education system — what changes would you make?\n\nUse at least 3 conditional expressions (unless, provided that, as long as, supposing). Paste a link or write your response." }
      },
      {
        id: "5-2", n: 16,
        title: "Listening — Flow Chart & Diagram Labelling | Grammar Review",
        tag: "Listening", materials: [],
        quiz: { questions: [
          { type: "mc", q: "In Flow Chart Completion, answers typically describe:", options: ["Opinions","Steps in a process","Maps","Prices"], answer: 1, points: 10 },
          { type: "tf", q: "Diagram Labelling requires you to identify parts of an object from the audio.", answer: true, points: 10 },
          { type: "fitb", q: "In Flow Chart tasks, answers usually follow a _______ order.", answer: "sequential", points: 10 },
          { type: "mc", q: "Which grammar structure is often used to describe a process?", options: ["Present Perfect","Passive Voice","Future Continuous","Past Perfect"], answer: 1, points: 10 },
        ]},
        assignment: { type: "writing", prompt: "Describe a simple process you know well (e.g. making tea, recycling paper, filtering water) in 8–10 steps using Passive Voice and sequencing words (First, Then, After that, Finally)." }
      },
      {
        id: "5-3", n: 17,
        title: "Reading — Diagram Completion | Future Perfect",
        tag: "Reading", materials: [],
        quiz: { questions: [
          { type: "mc", q: "Which sentence uses Future Perfect correctly?", options: ["By 2030, the population will reach 10 billion.","By 2030, the population will have reached 10 billion.","By 2030, the population reaches 10 billion.","By 2030, the population would reach 10 billion."], answer: 1, points: 10 },
          { type: "mc", q: "In Diagram Completion, labels usually require:", options: ["Long sentences","Single words or short phrases","Paragraphs","Numbers only"], answer: 1, points: 10 },
          { type: "tf", q: "Future Perfect is formed with 'will + have + past participle'.", answer: true, points: 10 },
          { type: "fitb", q: "Future Perfect expresses an action completed _______ a future time.", answer: "before", points: 10 },
        ]},
        assignment: { type: "writing", prompt: "Write 6 Future Perfect sentences about what you will have achieved by the time you take your IELTS exam. Example: 'By test day, I will have practised writing for 60 hours.'\nThen find any scientific diagram online and write 5 labels for its parts." }
      },
      {
        id: "5-4", n: 18,
        title: "Writing Task 1 — Process Diagrams | Direct and Indirect Speech",
        tag: "Writing", materials: [],
        quiz: { questions: [
          { type: "mc", q: "When describing a process diagram, you should:", options: ["Give your opinion","Describe each stage in order","Focus only on the beginning","Compare two processes"], answer: 1, points: 10 },
          { type: "mc", q: "Which is correct Indirect Speech?", options: ["She said 'I am tired.'","She said she was tired.","She said she is tired.","She told 'I am tired.'"], answer: 1, points: 10 },
          { type: "tf", q: "In Direct Speech, the exact words are written inside quotation marks.", answer: true, points: 10 },
          { type: "fitb", q: "In Indirect Speech, the present simple usually shifts to past _______.", answer: "simple", points: 10 },
        ]},
        assignment: { type: "essay", prompt: "IELTS Writing Task 1: The diagram below shows how paper is recycled.\nStages: Collection → Sorting → Pulping → Cleaning → Drying → Rolling → New paper products.\nDescribe the process using Passive Voice. Write at least 150 words.\nAlso rewrite 5 direct speech sentences as indirect speech." }
      },
      {
        id: "5-5", n: 19,
        title: "Writing Task 2 — Double Question Essay | Commas",
        tag: "Writing", materials: [],
        quiz: { questions: [
          { type: "mc", q: "A Double Question Task 2 essay requires you to:", options: ["Answer only one question","Answer both questions separately","Give a general overview","Describe a diagram"], answer: 1, points: 10 },
          { type: "mc", q: "When is a comma NOT needed?", options: ["After an introductory clause","Between two short independent clauses without a conjunction","Before 'but' in a compound sentence","In a list of three items"], answer: 1, points: 10 },
          { type: "tf", q: "Each question in a Double Question essay should have its own paragraph.", answer: true, points: 10 },
          { type: "fitb", q: "Use a comma after introductory words like 'However,' '_______,' and 'Therefore,'.", answer: "Furthermore", points: 10 },
        ]},
        assignment: { type: "essay", prompt: "IELTS Writing Task 2: Why do some people choose to learn a new language as an adult? What difficulties might they face?\nAnswer both questions clearly in separate body paragraphs. Write at least 250 words. Pay careful attention to comma usage throughout." }
      },
      {
        id: "5-6", n: 20,
        title: "Speaking Part 3 — Abstract Topics | Grammar Review",
        tag: "Speaking", materials: [],
        quiz: { questions: [
          { type: "mc", q: "Speaking Part 3 tests your ability to:", options: ["Memorise answers","Discuss abstract ideas fluently","Describe pictures","Read aloud"], answer: 1, points: 10 },
          { type: "tf", q: "Speculating and giving opinions is important in Part 3.", answer: true, points: 10 },
          { type: "fitb", q: "Phrases like 'It seems to me that' and 'I would argue that' show your _______ clearly.", answer: "opinion", points: 10 },
          { type: "mc", q: "Which phrase is best for expressing uncertainty?", options: ["I am absolutely sure that","I have no idea","I suppose it could be argued that","I refuse to answer"], answer: 2, points: 10 },
        ]},
        assignment: { type: "speaking", prompt: "Record yourself answering these Part 3 questions (3–4 minutes):\n1. Do you think governments should make learning a foreign language compulsory at school?\n2. How has globalisation changed the importance of learning English?\n3. What do you think the world will look like linguistically in 50 years?\n\nAim for Band 6–7 language: range of tenses, conditionals, cohesive devices. Paste link or write response." }
      },
      {
        id: "mock-5", n: null,
        title: "MOCK TEST 5 — FULL REVIEW",
        tag: "Mock", materials: [],
        quiz: { questions: [
          { type: "mc", q: "Which sentence is grammatically correct?", options: ["She said she is happy.","She said she was happy.","She told she was happy.","She says she were happy."], answer: 1, points: 10 },
          { type: "mc", q: "Future Perfect is used to describe:", options: ["An action happening now","An action completed before a future point","A past habit","An ongoing action"], answer: 1, points: 10 },
          { type: "tf", q: "In a Double Question essay, you must address both questions.", answer: true, points: 10 },
          { type: "mc", q: "Which task type describes a step-by-step process?", options: ["Bar Chart","Pie Chart","Process Diagram","Line Graph"], answer: 2, points: 10 },
          { type: "match", q: "Match the listening task to its description", pairs: [["Flow Chart","Steps in a process"],["Diagram Labelling","Parts of an object"],["Map Labelling","Directions and locations"],["Form Completion","Personal or factual data"]], points: 20 },
          { type: "fitb", q: "'Unless' = 'if _______'.", answer: "not", points: 10 },
          { type: "mc", q: "In Speaking Part 3, the examiner asks questions that are:", options: ["Personal and simple","Abstract and topic-based","About your family","Read from a cue card"], answer: 1, points: 10 },
          { type: "tf", q: "Comma usage can affect your Writing score in IELTS.", answer: true, points: 10 },
          { type: "fitb", q: "In Process Diagram Task 1, stages are usually described using _______ voice.", answer: "passive", points: 10 },
          { type: "mc", q: "Which phrase would you use to speculate in Speaking Part 3?", options: ["I definitely know that","I would imagine that","I have no clue","That is wrong"], answer: 1, points: 10 },
        ]},
        assignment: { type: "essay", prompt: "FINAL MOCK TASK 2: As technology develops, many traditional skills are being lost. Some people think it is important to preserve these skills, while others believe we should focus on modern skills instead. Discuss both views and give your own opinion.\nWrite at least 250 words. This is your final practice — aim for Band 6.0+." }
      },
    ]
  },
];
// ══════════════════════════════════════════
// QUIZ PAGE
// ══════════════════════════════════════════
function QuizPage({ lesson, session, setPage }) {
  const qs = lesson.quiz.questions;
  const total = qs.reduce((s,q)=>s+(q.points||10),0);

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // per-question interaction
  const [pick, setPick] = useState(null);        // mc index / tf bool
  const [fitbVal, setFitbVal] = useState("");
  const [matchVal, setMatchVal] = useState({});
  const [locked, setLocked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [lastGain, setLastGain] = useState(0);
  const [lastBonus, setLastBonus] = useState(0);

  const [finished, setFinished] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  // flight timer (30 min)
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const finishedRef = useRef(false);
  const remaining = Math.max(0, QUIZ_TIMER_MS - (now - startedAt));
  const lowTime = remaining > 0 && remaining < 5 * 60 * 1000;

  const q = qs[current];

  const finish = async (auto = false) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (auto) setTimedOut(true);
    const existing = await FB.getProgress(session.email);
    const prev = existing[lesson.id] || {};
    await FB.setProgress(session.email, {
      [lesson.id]: { ...prev, quizDone:true, quizScore:score, quizTotal:total, points:(prev.points||0)+score, completedAt:new Date().toISOString() }
    });
    setFinished(true);
  };

  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [finished]);

  useEffect(() => {
    if (!finished && remaining === 0) finish(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, finished]);

  const lockAnswer = (correct) => {
    if (locked) return;
    const newStreak = correct ? streak + 1 : 0;
    const bonus = correct ? Math.min(Math.max(newStreak - 1, 0), 5) * 2 : 0;
    const gained = correct ? (q.points + bonus) : 0;
    setLocked(true); setWasCorrect(correct);
    setStreak(newStreak); setBestStreak(b => Math.max(b, newStreak));
    if (correct) setCorrectCount(c => c + 1);
    setLastGain(gained); setLastBonus(bonus);
    setScore(s => s + gained);
  };

  const resetQ = () => { setLocked(false); setWasCorrect(false); setPick(null); setFitbVal(""); setMatchVal({}); setLastGain(0); setLastBonus(0); };
  const advance = () => { if (current < qs.length - 1) { setCurrent(c => c + 1); resetQ(); } else finish(); };

  const restart = () => {
    setCurrent(0); setScore(0); setCorrectCount(0); setStreak(0); setBestStreak(0);
    resetQ(); setFinished(false); setTimedOut(false); finishedRef.current = false;
    setStartedAt(Date.now()); setNow(Date.now());
  };

  const matchReady = q && q.type === "match" && q.pairs.every(([k]) => (matchVal[k] || "") !== "");
  const evalMatch = () => q.pairs.every(([k,v]) => matchVal[k] === v);

  // ── LANDING / RESULTS ──
  if (finished) {
    const pct = Math.round(correctCount / qs.length * 100);
    const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
    const rank = pct >= 90 ? "✈️ Captain" : pct >= 75 ? "🧑‍✈️ First Officer" : pct >= 60 ? "🛩️ Co-pilot" : pct >= 40 ? "🎓 Cadet" : "🧳 Trainee";
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0d2540,#1A5FAD)", display:"flex", alignItems:"center", justifyContent:"center", padding:16, fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <div style={{ background:"white", borderRadius:22, maxWidth:420, width:"100%", overflow:"hidden", boxShadow:"0 24px 60px rgba(0,0,0,0.35)" }}>
          <div style={{ background:"linear-gradient(135deg,#0d2540,#1A5FAD)", color:"white", padding:"22px 22px 18px", textAlign:"center" }}>
            <div style={{ fontSize:11, letterSpacing:"2px", opacity:0.7, fontWeight:700 }}>BOARDING PASS · IELTS8 AIR</div>
            <div style={{ fontSize:50, margin:"6px 0" }}>{pct>=70?"🛬":"📚"}</div>
            <div style={{ fontSize:20, fontWeight:800 }}>{pct>=90?"Perfect landing!":pct>=70?"Smooth landing!":pct>=50?"You touched down":"Bumpy flight — try again"}</div>
            <div style={{ fontSize:22, marginTop:6 }}>{"⭐".repeat(stars)}{"☆".repeat(3-stars)}</div>
            {timedOut && <div style={{ fontSize:12, color:"#FFD27A", fontWeight:700, marginTop:8 }}>⏰ Flight time ended — auto-landed</div>}
          </div>
          <div style={{ padding:"18px 22px 24px" }}>
            <div style={{ display:"flex", justifyContent:"space-around", textAlign:"center", marginBottom:16 }}>
              <div><div style={{ fontSize:24, fontWeight:800, color:"#1A5FAD" }}>{score}</div><div style={{ fontSize:11, color:"#94a3b8" }}>Miles (pts)</div></div>
              <div><div style={{ fontSize:24, fontWeight:800, color:"#0a0a0a" }}>{correctCount}/{qs.length}</div><div style={{ fontSize:11, color:"#94a3b8" }}>Correct</div></div>
              <div><div style={{ fontSize:24, fontWeight:800, color:"#B8620A" }}>🔥{bestStreak}</div><div style={{ fontSize:11, color:"#94a3b8" }}>Best streak</div></div>
            </div>
            <div style={{ textAlign:"center", background:"#eef4fd", borderRadius:12, padding:"10px", marginBottom:18, fontWeight:700, color:"#0d2540" }}>Rank earned: {rank} · {pct}%</div>
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={restart} style={{ flex:1, padding:"12px", borderRadius:10, border:"2px solid #e5e5e5", background:"white", color:"#0a0a0a", fontWeight:700, cursor:"pointer" }}>↻ Fly again</button>
              <button onClick={() => setPage("lesson")} style={{ flex:1, padding:"12px", borderRadius:10, border:"none", background:"#1A5FAD", color:"white", fontWeight:700, cursor:"pointer" }}>Done →</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // option styling with instant feedback
  const optStyle = (selected, isCorrect, isWrongPick) => {
    if (locked && isCorrect) return { border:"2px solid #1E7A4F", background:"#e2ece5", color:"#0d4f45" };
    if (locked && isWrongPick) return { border:"2px solid #B23A2E", background:"#f6e2df", color:"#7a1f16" };
    if (locked) return { border:"2px solid #e5e5e5", background:"white", color:"#94a3b8" };
    return { border:`2px solid ${selected?"#1A5FAD":"#e5e5e5"}`, background:selected?"#eef4fd":"white", color:selected?"#0d2540":"#374151" };
  };
  const flightPct = qs.length > 1 ? (current/(qs.length-1))*100 : 100;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(180deg,#cfe4fa,#eaf3fc 220px,#fafafa)", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{"@keyframes pop{0%{transform:scale(.7);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}} @keyframes shakeX{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}"}</style>

      {/* HUD */}
      <div style={{ background:"white", borderBottom:"1px solid #e5e5e5", padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={() => setPage("lesson")} style={{ padding:"5px 11px", borderRadius:999, border:"1px solid #e5e5e5", background:"white", color:"#0a0a0a", cursor:"pointer", fontWeight:600, fontSize:12 }}>← Exit</button>
        <div style={{ flex:1, fontWeight:800, fontSize:13, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>✈️ Flight {current+1}/{qs.length}</div>
        <div style={{ fontSize:12, fontWeight:800, color:"#B8620A", flexShrink:0 }}>🔥 {streak}</div>
        <div style={{ fontSize:12, fontWeight:800, color:"#1A5FAD", flexShrink:0 }}>⭐ {score}</div>
        <div title="Flight time" style={{ fontSize:13, fontWeight:800, fontVariantNumeric:"tabular-nums", padding:"4px 10px", borderRadius:999, flexShrink:0, background: lowTime ? "#FF5959" : "#0a0a0a", color:"white" }}>⏱ {fmtTime(remaining)}</div>
      </div>

      {/* flight sky progress */}
      <div style={{ position:"relative", height:34, background:"linear-gradient(180deg,#bcdcff,#e3f0fc)", borderBottom:"1px solid #cfe1f5", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"50%", left:0, right:0, borderTop:"2px dashed #8fb6e6" }} />
        <span style={{ position:"absolute", top:"50%", left:`calc(${flightPct}% - 12px)`, transform:"translateY(-50%)", fontSize:18, transition:"left .4s ease" }}>✈️</span>
        <span style={{ position:"absolute", top:"50%", right:6, transform:"translateY(-50%)", fontSize:15 }}>🎓</span>
      </div>

      <div style={{ maxWidth:600, margin:"18px auto", padding:"0 14px" }}>
        <div style={{ background:"white", borderRadius:16, padding:"20px 18px", border:"1px solid #e5edf7", boxShadow:"0 10px 26px rgba(13,37,64,.08)" }}>
          <div style={{ fontSize:12, color:"#94a3b8", marginBottom:8, fontWeight:600 }}>Question {current+1} of {qs.length} · {q.points} pts{q.type==="match"?"":""}</div>
          {q.img && <QuizImage id={q.img} />}
          <div style={{ fontSize:18, fontWeight:700, color:"#1e293b", marginBottom:20, lineHeight:1.5 }}>{q.q}</div>

          {q.type==="mc" && q.options.map((opt,i) => (
            <div key={i} onClick={() => { if(!locked){ setPick(i); lockAnswer(i===q.answer); } }}
              style={{ padding:"12px 16px", borderRadius:10, marginBottom:10, cursor: locked?"default":"pointer", display:"flex", alignItems:"center", gap:8, ...optStyle(pick===i, i===q.answer, pick===i && i!==q.answer) }}>
              <span style={{ fontWeight:600, flex:1 }}>{opt}</span>
              {locked && i===q.answer && <span>✓</span>}
              {locked && pick===i && i!==q.answer && <span>✗</span>}
            </div>
          ))}

          {q.type==="tf" && (
            <div style={{ display:"flex", gap:12 }}>
              {[true,false].map(v => (
                <div key={String(v)} onClick={() => { if(!locked){ setPick(v); lockAnswer(v===q.answer); } }}
                  style={{ flex:1, padding:14, borderRadius:10, cursor: locked?"default":"pointer", textAlign:"center", fontWeight:700, ...optStyle(pick===v, v===q.answer, pick===v && v!==q.answer) }}>
                  {v?"✅ True":"❌ False"}
                </div>
              ))}
            </div>
          )}

          {q.type==="fitb" && (
            <input placeholder="Type your answer…" value={fitbVal} disabled={locked}
              onChange={e=>setFitbVal(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter" && !locked && fitbVal.trim()) lockAnswer(fitbVal.trim().toLowerCase()===q.answer.toLowerCase()); }}
              style={{ width:"100%", padding:"14px 16px", borderRadius:10, fontSize:15, boxSizing:"border-box",
                border:`2px solid ${locked?(wasCorrect?"#1E7A4F":"#B23A2E"):"#e5e5e5"}`, background: locked?(wasCorrect?"#e2ece5":"#f6e2df"):"white" }} />
          )}

          {q.type==="match" && (
            <div>
              <div style={{ fontSize:13, color:"#64748b", marginBottom:12 }}>Match each item to the correct answer:</div>
              {q.pairs.map(([k,correctV]) => {
                const chosen = matchVal[k] || "";
                const ok = locked && chosen === correctV;
                const bad = locked && chosen !== correctV;
                return (
                  <div key={k} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    <div style={{ flex:1, padding:"10px 14px", background:"#f4f8fb", borderRadius:8, fontWeight:600, fontSize:14 }}>{k}</div>
                    <select value={chosen} disabled={locked} onChange={e => setMatchVal({ ...matchVal, [k]: e.target.value })}
                      style={{ flex:1, padding:10, borderRadius:8, fontSize:14, border:`2px solid ${ok?"#1E7A4F":bad?"#B23A2E":"#e5e5e5"}`, background: ok?"#e2ece5":bad?"#f6e2df":"white" }}>
                      <option value="">Select…</option>
                      {q.pairs.map(([,v]) => <option key={v} value={v}>{v}</option>)}
                    </select>
                    {locked && (ok ? <span style={{ color:"#1E7A4F", fontWeight:800 }}>✓</span> : <span style={{ color:"#B23A2E", fontWeight:800 }}>✗</span>)}
                  </div>
                );
              })}
              {locked && !wasCorrect && <div style={{ fontSize:12, color:"#B23A2E", marginTop:4 }}>Correct: {q.pairs.map(([k,v])=>`${k} → ${v}`).join(" · ")}</div>}
            </div>
          )}

          {/* check button for fitb/match */}
          {!locked && (q.type==="fitb" || q.type==="match") && (
            <button disabled={q.type==="fitb" ? !fitbVal.trim() : !matchReady}
              onClick={() => lockAnswer(q.type==="fitb" ? (fitbVal.trim().toLowerCase()===q.answer.toLowerCase()) : evalMatch())}
              style={{ marginTop:18, width:"100%", padding:"12px", borderRadius:10, border:"none", fontWeight:800, fontSize:14,
                background:(q.type==="fitb"?fitbVal.trim():matchReady)?"#1A5FAD":"#e5e5e5", color:(q.type==="fitb"?fitbVal.trim():matchReady)?"white":"#999", cursor:(q.type==="fitb"?fitbVal.trim():matchReady)?"pointer":"not-allowed" }}>
              Check answer ✓
            </button>
          )}

          {/* feedback + advance */}
          {locked && (
            <div style={{ marginTop:18, animation: wasCorrect?"pop .35s ease":"shakeX .35s ease" }}>
              <div style={{ borderRadius:12, padding:"12px 14px", background: wasCorrect?"#e2ece5":"#f6e2df", color: wasCorrect?"#0d4f45":"#7a1f16", fontWeight:700, fontSize:14, display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                <span>{wasCorrect ? "✅ Correct!" : "❌ Not quite — answer shown above"}</span>
                {wasCorrect && <span style={{ color:"#1A5FAD" }}>+{lastGain}{lastBonus>0?` 🔥+${lastBonus}`:""}</span>}
              </div>
              {wasCorrect && streak>=3 && <div style={{ textAlign:"center", marginTop:8, fontWeight:800, color:"#B8620A" }}>🔥 {streak} in a row — combo bonus!</div>}
              <button onClick={advance} style={{ marginTop:14, width:"100%", padding:"13px", borderRadius:10, border:"none", background:"#0d2540", color:"white", fontWeight:800, fontSize:15, cursor:"pointer" }}>
                {current < qs.length-1 ? "Next ✈️" : "Land & see results 🛬"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// ASSIGNMENT PAGE
// ══════════════════════════════════════════
function AssignmentPage({ lesson, session, setPage }) {
  const aType = lesson.assignment.type;          // "essay" | "speaking" | "writing"
  const isEssay    = aType === "essay";
  const isSpeaking = aType === "speaking";
  const useTimer   = isEssay;                    // 1h timer only for essay tasks
  const useRubric  = isEssay || isSpeaking;
  const rubricDef  = isSpeaking ? RUBRIC_DEFS.speaking : RUBRIC_DEFS.essay;

  const timerKey = `assign_start_${session.email}_${lesson.id}`;

  const [stage, setStage] = useState(useTimer ? "intro" : "writing"); // intro | writing | rubric | done
  const [text, setText] = useState("");
  const [startedAt, setStartedAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [rubric, setRubric] = useState({});
  const [notes, setNotes] = useState("");
  const [previous, setPrevious] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load existing submission + restore timer
  useEffect(() => {
    let alive = true;
    FB.getSubmissions(session.email).then(s => {
      if (!alive) return;
      const prior = s[lesson.id];
      if (prior) {
        setPrevious(prior);
        if (prior.rubric || (!useRubric && prior.text)) { setStage("done"); return; }
        if (prior.text) setText(prior.text);
      }
      if (useTimer) {
        const saved = localStorage.getItem(timerKey);
        if (saved) {
          setStartedAt(parseInt(saved, 10));
          setStage("writing");
        }
      }
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  // Tick once per second while writing under timer
  useEffect(() => {
    if (stage !== "writing" || !useTimer || !startedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [stage, useTimer, startedAt]);

  const startWork = () => {
    const t = Date.now();
    localStorage.setItem(timerKey, String(t));
    setStartedAt(t);
    setStage("writing");
  };

  const wc = wordCountOf(text);
  const minWords = isEssay ? 150 : 50;
  const canSubmitText = wc >= minWords && !saving;

  const submitText = async () => {
    if (!canSubmitText) return;
    setSaving(true);
    try {
      await FB.setSubmission(session.email, lesson.id, {
        text,
        type: aType,
        startedAt: startedAt ? new Date(startedAt).toISOString() : null,
        submittedAt: new Date().toISOString(),
      });
      if (!useRubric) {
        const existing = await FB.getProgress(session.email);
        const prev = existing[lesson.id] || {};
        await FB.setProgress(session.email, {
          [lesson.id]: { ...prev, assignmentDone: true, points: (prev.points || 0) + 10 }
        });
        if (useTimer) localStorage.removeItem(timerKey);
        setPrevious({ text, type: aType, submittedAt: new Date().toISOString() });
        setStage("done");
      } else {
        setStage("rubric");
      }
    } finally { setSaving(false); }
  };

  const allBandsPicked = rubricDef.every(d => rubric[d.key]);
  const overall = allBandsPicked
    ? Math.round(rubricDef.reduce((s, d) => s + Number(rubric[d.key]), 0) / rubricDef.length * 2) / 2
    : null;

  const submitRubric = async () => {
    if (!allBandsPicked || saving) return;
    setSaving(true);
    try {
      const sub = {
        text,
        type: aType,
        startedAt: startedAt ? new Date(startedAt).toISOString() : (previous?.startedAt || null),
        submittedAt: new Date().toISOString(),
        rubric: { ...rubric, overall, notes: notes.trim() },
      };
      await FB.setSubmission(session.email, lesson.id, sub);
      const existing = await FB.getProgress(session.email);
      const prev = existing[lesson.id] || {};
      await FB.setProgress(session.email, {
        [lesson.id]: { ...prev, assignmentDone: true, points: (prev.points || 0) + 20 }
      });
      if (useTimer) localStorage.removeItem(timerKey);
      setPrevious(sub);
      setStage("done");
    } finally { setSaving(false); }
  };

  const restart = () => {
    setStage(useTimer ? "intro" : "writing");
    setText("");
    setStartedAt(null);
    setRubric({});
    setNotes("");
    if (useTimer) localStorage.removeItem(timerKey);
  };

  const remaining = startedAt ? Math.max(0, ASSIGNMENT_TIMER_MS - (now - startedAt)) : ASSIGNMENT_TIMER_MS;
  const timesUp = useTimer && startedAt && remaining === 0;
  const lowTime = useTimer && remaining > 0 && remaining < 5 * 60 * 1000;

  const labels = {
    essay:    { kind: "Your essay",    placeholder: "Write your essay here…" },
    speaking: { kind: "Your response", placeholder: "Type your answer here, or paste a link to your recording…" },
    writing:  { kind: "Your answer",   placeholder: "Type your answer here…" },
  }[aType];

  return (
    <div style={{ minHeight:"100vh", background:"#fafafa", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ background:"white", borderBottom:"1px solid #e5e5e5", padding:"10px 14px", display:"flex", alignItems:"center", gap:10, position:"sticky", top:0, zIndex:50 }}>
        <button onClick={() => setPage("lesson")} style={{ padding:"5px 11px", borderRadius:999, border:"1px solid #e5e5e5", background:"white", color:"#0a0a0a", cursor:"pointer", fontWeight:600, fontSize:12, flexShrink:0 }}>← Back</button>
        <div style={{ fontWeight:700, fontSize:13, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>Assignment · {lesson.title}</div>
        {stage === "writing" && useTimer && startedAt && (
          <div style={{ flexShrink:0, padding:"4px 10px", borderRadius:999, background: timesUp ? "#0a0a0a" : (lowTime ? "#0a0a0a" : "#f4f4f4"), color: (timesUp || lowTime) ? "white" : "#0a0a0a", fontWeight:800, fontSize:12, fontVariantNumeric:"tabular-nums", letterSpacing:"0.5px" }}>
            {timesUp ? "TIME'S UP" : fmtTime(remaining)}
          </div>
        )}
      </div>

      <div style={{ maxWidth:700, margin:"0 auto", padding:"14px" }}>
        <div style={{ background:"white", borderRadius:10, padding:"14px 16px", marginBottom:12, border:"1px solid #e5e5e5" }}>
          <div style={{ fontWeight:700, marginBottom:8, fontSize:11, letterSpacing:"0.3px", textTransform:"uppercase", color:"#666" }}>Task</div>
          <div style={{ color:"#0a0a0a", lineHeight:1.6, whiteSpace:"pre-line", fontSize:13.5 }}>{lesson.assignment.prompt}</div>
        </div>

        {/* INTRO — start the 1h timer for essays */}
        {stage === "intro" && (
          <div style={{ background:"white", borderRadius:10, padding:"16px", marginBottom:12, border:"1px solid #e5e5e5" }}>
            <div style={{ fontWeight:800, fontSize:14, color:"#0a0a0a", marginBottom:6 }}>Ready to start?</div>
            <div style={{ fontSize:12.5, color:"#666", lineHeight:1.55, marginBottom:12 }}>
              You'll have <b>60 minutes</b> to write your essay (recommended: at least {minWords} words).
              The timer keeps running even if you reload the page. After submitting, you'll grade yourself
              with the IELTS band rubric.
            </div>
            <button onClick={startWork} style={{ width:"100%", padding:12, borderRadius:8, border:"1px solid #0a0a0a", background:"#0a0a0a", color:"white", fontWeight:700, fontSize:13, cursor:"pointer", letterSpacing:"0.2px" }}>Start · 60:00</button>
          </div>
        )}

        {/* WRITING — textarea + word count + submit */}
        {stage === "writing" && (
          <div style={{ background:"white", borderRadius:10, padding:"14px 16px", marginBottom:12, border:"1px solid #e5e5e5" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, gap:10, flexWrap:"wrap" }}>
              <div style={{ fontWeight:700, fontSize:11, letterSpacing:"0.3px", textTransform:"uppercase", color:"#666" }}>{labels.kind}</div>
              <div style={{ fontSize:11, color: wc >= minWords ? "#0a0a0a" : "#888", fontWeight: wc >= minWords ? 700 : 500 }}>
                {wc} / {minWords}+ words
              </div>
            </div>
            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={labels.placeholder}
              style={{ width:"100%", minHeight:240, padding:12, borderRadius:8, border:"1px solid #e5e5e5", fontSize:13.5, lineHeight:1.6, resize:"vertical", boxSizing:"border-box", fontFamily:"inherit", outline:"none" }} />
            {timesUp && (
              <div style={{ marginTop:10, padding:"8px 12px", borderRadius:8, background:"#f4f4f4", color:"#0a0a0a", fontSize:12 }}>
                Time's up. You can still submit, but in the real exam this would already be marked.
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:10 }}>
              <button onClick={submitText} disabled={!canSubmitText}
                style={{ padding:"10px 18px", borderRadius:8, border:"1px solid #0a0a0a", background: canSubmitText ? "#0a0a0a" : "#e5e5e5", color: canSubmitText ? "white" : "#888", fontWeight:700, fontSize:13, cursor: canSubmitText ? "pointer" : "not-allowed", borderColor: canSubmitText ? "#0a0a0a" : "#e5e5e5" }}>
                {saving ? "Saving…" : (useRubric ? "Submit · grade myself →" : "Submit")}
              </button>
            </div>
          </div>
        )}

        {/* RUBRIC — self-assessment */}
        {stage === "rubric" && (
          <div style={{ background:"white", borderRadius:10, padding:"16px", marginBottom:12, border:"1px solid #e5e5e5" }}>
            <div style={{ fontWeight:800, fontSize:14, color:"#0a0a0a", marginBottom:4 }}>Grade yourself · IELTS bands</div>
            <div style={{ fontSize:12, color:"#666", marginBottom:14, lineHeight:1.5 }}>
              Be honest. Reading the descriptors and scoring yourself trains your eye for what examiners look at.
            </div>

            {rubricDef.map(d => (
              <div key={d.key} style={{ marginBottom:14, paddingBottom:14, borderBottom:"1px solid #f0f0f0" }}>
                <div style={{ fontWeight:700, fontSize:13, color:"#0a0a0a" }}>{d.label}</div>
                <div style={{ fontSize:11.5, color:"#666", marginTop:3, marginBottom:8, lineHeight:1.5 }}>{d.help}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {BAND_OPTIONS.map(b => {
                    const active = rubric[d.key] === b;
                    return (
                      <button key={b} onClick={() => setRubric({ ...rubric, [d.key]: b })}
                        style={{ flex:"1 1 45px", minWidth:42, padding:"8px 0", borderRadius:8, border:`1px solid ${active ? "#0a0a0a" : "#e5e5e5"}`, background: active ? "#0a0a0a" : "white", color: active ? "white" : "#0a0a0a", fontWeight:800, fontSize:13, cursor:"pointer" }}>
                        {b}
                      </button>
                    );
                  })}
                </div>
                {rubric[d.key] && (
                  <div style={{ fontSize:11, color:"#888", marginTop:6 }}>
                    Band {rubric[d.key]} · {BAND_HINT[rubric[d.key]]}
                  </div>
                )}
              </div>
            ))}

            <div style={{ marginBottom:14 }}>
              <div style={{ fontWeight:700, fontSize:11, letterSpacing:"0.3px", textTransform:"uppercase", color:"#666", marginBottom:6 }}>What I'll improve next time (optional)</div>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)}
                placeholder="e.g. Use more linkers in body paragraphs; vary sentence openings; check articles."
                style={{ width:"100%", minHeight:70, padding:10, borderRadius:8, border:"1px solid #e5e5e5", fontSize:13, lineHeight:1.5, resize:"vertical", boxSizing:"border-box", fontFamily:"inherit", outline:"none" }} />
            </div>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexWrap:"wrap" }}>
              <div style={{ fontSize:13, color:"#666" }}>
                Overall band: <b style={{ color:"#0a0a0a", fontSize:18 }}>{overall ?? "—"}</b>
              </div>
              <button onClick={submitRubric} disabled={!allBandsPicked || saving}
                style={{ padding:"10px 18px", borderRadius:8, border:"1px solid #0a0a0a", background: allBandsPicked ? "#0a0a0a" : "#e5e5e5", color: allBandsPicked ? "white" : "#888", fontWeight:700, fontSize:13, cursor: allBandsPicked ? "pointer" : "not-allowed", borderColor: allBandsPicked ? "#0a0a0a" : "#e5e5e5" }}>
                {saving ? "Saving…" : "Save self-assessment"}
              </button>
            </div>
          </div>
        )}

        {/* DONE — summary of latest submission */}
        {stage === "done" && previous && (
          <div style={{ background:"white", borderRadius:10, padding:"16px", marginBottom:12, border:"1px solid #e5e5e5" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:12 }}>
              <div style={{ fontWeight:800, fontSize:14, color:"#0a0a0a" }}>Submitted</div>
              <div style={{ fontSize:11, color:"#888" }}>{previous.submittedAt ? new Date(previous.submittedAt).toLocaleString("en-GB") : ""}</div>
            </div>

            {previous.rubric && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(78px, 1fr))", gap:8, marginBottom:14 }}>
                <div style={{ background:"#0a0a0a", color:"white", borderRadius:8, padding:"10px 8px", textAlign:"center" }}>
                  <div style={{ fontSize:20, fontWeight:800 }}>{previous.rubric.overall ?? "—"}</div>
                  <div style={{ fontSize:10, opacity:0.8, letterSpacing:"0.3px", textTransform:"uppercase" }}>Overall</div>
                </div>
                {rubricDef.map(d => (
                  <div key={d.key} style={{ background:"#fafafa", border:"1px solid #e5e5e5", borderRadius:8, padding:"10px 8px", textAlign:"center" }}>
                    <div style={{ fontSize:18, fontWeight:800, color:"#0a0a0a" }}>{previous.rubric[d.key] ?? "—"}</div>
                    <div style={{ fontSize:10, color:"#666", letterSpacing:"0.2px" }}>{d.label}</div>
                  </div>
                ))}
              </div>
            )}

            {previous.rubric?.notes && (
              <div style={{ background:"#fafafa", border:"1px solid #e5e5e5", borderRadius:8, padding:"10px 12px", fontSize:12.5, color:"#0a0a0a", lineHeight:1.55, marginBottom:12 }}>
                <div style={{ fontSize:10, color:"#666", letterSpacing:"0.3px", textTransform:"uppercase", marginBottom:4, fontWeight:700 }}>To improve</div>
                {previous.rubric.notes}
              </div>
            )}

            {previous.text && (
              <details style={{ marginBottom:12 }}>
                <summary style={{ fontSize:12, color:"#666", cursor:"pointer", padding:"4px 0" }}>Show submitted text ({wordCountOf(previous.text)} words)</summary>
                <div style={{ marginTop:8, padding:12, background:"#fafafa", border:"1px solid #e5e5e5", borderRadius:8, fontSize:13, lineHeight:1.6, whiteSpace:"pre-wrap", color:"#0a0a0a" }}>
                  {previous.text}
                </div>
              </details>
            )}

            <button onClick={restart} style={{ width:"100%", padding:11, borderRadius:8, border:"1px solid #e5e5e5", background:"white", color:"#0a0a0a", fontWeight:700, fontSize:13, cursor:"pointer" }}>
              Try again
            </button>
          </div>
        )}
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
    <div style={{ minHeight:"100vh", background:"#fafafa", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ background:"white", borderBottom:"1px solid #e5e5e5", padding:"10px 14px", display:"flex", gap:10, alignItems:"center" }}>
        <button onClick={() => setPage("course")} style={{ padding:"5px 11px", borderRadius:999, border:"1px solid #e5e5e5", background:"white", color:"#0a0a0a", cursor:"pointer", fontWeight:600, fontSize:12 }}>← Back</button>
        <div style={{ fontWeight:700, fontSize:14 }}>My Progress</div>
      </div>
      <div style={{ maxWidth:680, margin:"0 auto", padding:"14px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(110px, 1fr))", gap:10, marginBottom:18 }}>
          {[["Points",totalPts],["Done",`${done}/${allLessons.length}`],["Progress",`${allLessons.length>0?Math.round(done/allLessons.length*100):0}%`]].map(([l,v])=>(
            <div key={l} style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:10, padding:"12px 14px", textAlign:"left" }}>
              <div style={{ fontSize:11, color:"#888", letterSpacing:"0.3px", textTransform:"uppercase" }}>{l}</div>
              <div style={{ fontSize:20, fontWeight:800, color:"#0a0a0a", marginTop:2 }}>{v}</div>
            </div>
          ))}
        </div>
        {(modules||[]).map(m=>{
          const mDone = m.lessons.filter(l=>myP[l.id]?.quizDone).length;
          return (
            <div key={m.id} style={{ background:"white", borderRadius:10, padding:"14px 16px", marginBottom:10, border:"1px solid #e5e5e5" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, gap:10 }}>
                <div style={{ fontWeight:700, color:"#0a0a0a", fontSize:13 }}>{m.title}</div>
                <div style={{ fontSize:12, color:"#888", flexShrink:0 }}>{mDone}/{m.lessons.length}</div>
              </div>
              <div style={{ background:"#e5e5e5", borderRadius:999, height:4, marginBottom:10, overflow:"hidden" }}>
                <div style={{ width:`${m.lessons.length>0?mDone/m.lessons.length*100:0}%`, background:"#0a0a0a", height:4 }} />
              </div>
              {m.lessons.map(l=>(
                <div key={l.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"5px 0", borderBottom:"1px solid #f5f5f5" }}>
                  <span style={{ fontSize:11, color: myP[l.id]?.quizDone ? "#0a0a0a" : "#bbb" }}>{myP[l.id]?.quizDone?"●":"○"}</span>
                  <span style={{ flex:1, fontSize:12.5, color:"#0a0a0a" }}>{l.title}</span>
                  {myP[l.id]?.points?<span style={{ fontSize:12, color:"#0a0a0a", fontWeight:700 }}>+{myP[l.id].points}pts</span>:null}
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
    <div style={{ minHeight:"100vh", background:"#fafafa", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ background:"white", borderBottom:"1px solid #e5e5e5", padding:"10px 16px", display:"flex", gap:10, alignItems:"center" }}>
        <button onClick={() => setPage("course")} style={{ padding:"5px 11px", borderRadius:999, border:"1px solid #e5e5e5", background:"white", color:"#0a0a0a", cursor:"pointer", fontWeight:600, fontSize:12 }}>← Back</button>
        <div style={{ fontWeight:700, fontSize:14 }}>Leaderboard</div>
      </div>
      <div style={{ maxWidth:560, margin:"0 auto", padding:"16px 14px" }}>
        <div style={{ background:"#0a0a0a", borderRadius:12, padding:"14px 16px", color:"white", marginBottom:14 }}>
          <div style={{ fontSize:14, fontWeight:700, letterSpacing:"0.2px" }}>Top Students</div>
          <div style={{ fontSize:11, opacity:0.7, marginTop:2 }}>Ranked by total points</div>
        </div>
        {rankings.map((r,i)=>{
          const isMe = r.email===session.email;
          return (
            <div key={r.email} style={{ display:"flex", alignItems:"center", gap:12, background:"white", borderRadius:10, padding:"10px 14px", marginBottom:6, border:`1px solid ${isMe?"#0a0a0a":"#e5e5e5"}` }}>
              <div style={{ fontSize:i<3?20:13, fontWeight:700, width:28, textAlign:"center", color:"#0a0a0a" }}>{medals[i]||`#${i+1}`}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:13 }}>{r.name}{isMe?" · You":""}</div>
                <div style={{ fontSize:11, color:"#888" }}>{r.done} lessons done</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:16, fontWeight:800, color:"#0a0a0a" }}>{r.pts}</div>
                <div style={{ fontSize:10, color:"#888" }}>pts</div>
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

  const toggleSpeaking = async (email, on) => {
    await FB.updateStudent(email, { speaking: !on });
    refresh();
  };

  const remove = async (email) => {
    if (!window.confirm(`Remove ${email}?`)) return;
    await FB.deleteStudent(email); refresh();
  };

  const list = Object.entries(students);

  return (
    <div style={{ minHeight:"100vh", background:"#fafafa", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ background:"white", borderBottom:"1px solid #e5e5e5", padding:"10px 14px", display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
        <Brand size={22} />
        <span style={{ fontSize:10, padding:"2px 8px", borderRadius:999, background:"#0a0a0a", color:"white", fontWeight:700, letterSpacing:"0.4px", textTransform:"uppercase" }}>Admin</span>
        <div style={{ flex:1 }} />
        <button onClick={()=>setPage("course")} style={nb("white","#0a0a0a")}>Course</button>
        <button onClick={()=>setPage("leaderboard")} style={nb("white","#0a0a0a")}>Board</button>
        <button onClick={logout} style={nb("white","#666")}>Logout</button>
      </div>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"14px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(110px, 1fr))", gap:10, marginBottom:14 }}>
          {[["Total",list.length],["Active",list.filter(([,v])=>v.status==="active").length],["Revoked",list.filter(([,v])=>v.status==="revoked").length],["🎤 Speaking",list.filter(([,v])=>v.speaking).length]].map(([l,v])=>(
            <div key={l} style={{ background:"white", border:"1px solid #e5e5e5", borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontSize:11, color:"#888", letterSpacing:"0.3px", textTransform:"uppercase" }}>{l}</div>
              <div style={{ fontSize:20, fontWeight:800, color:"#0a0a0a", marginTop:2 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ background:"white", borderRadius:10, padding:"14px 16px", marginBottom:12, border:"1px solid #e5e5e5" }}>
          <div style={{ fontWeight:700, marginBottom:10, fontSize:12, letterSpacing:"0.3px", textTransform:"uppercase", color:"#666" }}>Add Student</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <input placeholder="Full name" value={newName} onChange={e=>setNewName(e.target.value)}
              style={{ flex:1, minWidth:130, padding:"9px 11px", borderRadius:8, border:"1px solid #e5e5e5", fontSize:13, outline:"none" }} />
            <input placeholder="email@example.com" value={newEmail} onChange={e=>setNewEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}
              style={{ flex:2, minWidth:180, padding:"9px 11px", borderRadius:8, border:"1px solid #e5e5e5", fontSize:13, outline:"none" }} />
            <button onClick={add} style={{ padding:"9px 16px", borderRadius:8, border:"1px solid #0a0a0a", background:"#0a0a0a", color:"white", fontWeight:700, fontSize:13, cursor:"pointer" }}>Add</button>
          </div>
          {msg && <div style={{ marginTop:8, fontSize:12, color:"#0a0a0a" }}>{msg}</div>}
        </div>

        <div style={{ background:"white", borderRadius:10, border:"1px solid #e5e5e5", overflow:"hidden" }}>
          <div style={{ padding:"10px 14px", borderBottom:"1px solid #e5e5e5", fontWeight:700, fontSize:12, letterSpacing:"0.3px", textTransform:"uppercase", color:"#666" }}>Students ({list.length})</div>
          {loadingStudents && <div style={{ padding:24, textAlign:"center", color:"#888", fontSize:13 }}>Loading…</div>}
          {!loadingStudents && list.length===0 && <div style={{ padding:24, textAlign:"center", color:"#888", fontSize:13 }}>No students yet.</div>}
          {list.map(([email,info])=>{
            const pts = Object.values(allProgress[email]||{}).reduce((s,v)=>s+(v.points||0),0);
            const done = Object.values(allProgress[email]||{}).filter(v=>v.quizDone).length;
            const active = info.status==="active";
            return (
              <div key={email} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderBottom:"1px solid #f0f0f0", flexWrap:"wrap" }}>
                <div style={{ flex:1, minWidth:130 }}>
                  <div style={{ fontWeight:600, fontSize:13, color:"#0a0a0a" }}>{info.name}</div>
                  <div style={{ fontSize:11, color:"#666" }}>{email}</div>
                  <div style={{ fontSize:10, color:"#888", marginTop:1 }}>{done} lessons · {pts} pts {info.lastLogin?`· ${new Date(info.lastLogin).toLocaleDateString("ru-RU")}`:"· never logged in"}</div>
                </div>
                <span style={{ fontSize:10, padding:"2px 9px", borderRadius:999, fontWeight:700, background: active ? "#0a0a0a":"#f0f0f0", color: active ? "white":"#666", letterSpacing:"0.3px", textTransform:"uppercase" }}>
                  {active?"Active":"Revoked"}
                </span>
                <button onClick={()=>toggleSpeaking(email, !!info.speaking)} title="Paid Speaking World access" style={{ padding:"5px 10px", borderRadius:999, border:`1px solid ${info.speaking?"#B8860B":"#e5e5e5"}`, cursor:"pointer", fontSize:11, fontWeight:700, background:info.speaking?"#fff7e0":"white", color:info.speaking?"#8a5a12":"#666" }}>
                  {info.speaking?"🎤 Speaking ✓":"🎤 Open"}
                </button>
                <button onClick={()=>toggle(email,info.status)} style={{ padding:"5px 11px", borderRadius:999, border:"1px solid #e5e5e5", cursor:"pointer", fontSize:11, fontWeight:600, background:"white", color:"#0a0a0a" }}>
                  {active?"Revoke":"Restore"}
                </button>
                <button onClick={()=>remove(email)} aria-label="Delete" style={{ padding:"5px 9px", borderRadius:999, border:"1px solid #e5e5e5", background:"white", color:"#666", cursor:"pointer", fontSize:11 }}>×</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════
function Login({ authError }) {
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const go = async () => {
    setErr(""); setLoading(true);
    try {
      // On success, App's onAuthStateChanged listener verifies access
      // and either opens the course or reports authError back here.
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      if (e.code === "auth/popup-closed-by-user" || e.code === "auth/cancelled-popup-request") {
        setLoading(false); return;
      }
      setErr("Sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  const shown = err || authError;

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding:16 }}>
      <div style={{ background:"white", borderRadius:14, padding:32, width:"100%", maxWidth:360, boxShadow:"0 12px 48px rgba(0,0,0,0.35)" }}>
        <div style={{ textAlign:"center", marginBottom:24, display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
          <BrandLogo size={44} />
          <h2 style={{ margin:0, color:"#0a0a0a", fontSize:20, letterSpacing:"-0.3px" }}>IELTS<span>8</span></h2>
          <p style={{ color:"#666", margin:0, fontSize:13 }}>Sign in with your Google account</p>
        </div>
        {shown && <p style={{ color:"#0a0a0a", fontSize:12, margin:"0 0 12px", textAlign:"center" }}>{shown}</p>}
        <button onClick={go} disabled={loading} style={{ width:"100%", padding:12, borderRadius:10, border:"1.5px solid #e5e5e5", background:"white", color:"#0a0a0a", fontSize:14, fontWeight:700, cursor:"pointer", opacity: loading ? 0.6 : 1, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {loading ? "Signing in…" : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// NAV
// ══════════════════════════════════════════
const nb = (bg,c) => ({ padding:"5px 11px", borderRadius:999, border:"1px solid #e5e5e5", background:bg, color:c, cursor:"pointer", fontSize:12, fontWeight:600, letterSpacing:"0.2px" });

function Nav({ session, logout, setPage, isAdmin, pts }) {
  return (
    <div style={{ background:"white", borderBottom:"1px solid #e5e5e5", padding:"10px 16px", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", position:"sticky", top:0, zIndex:100 }}>
      <Brand size={22} onClick={() => setPage("course")} />
      <div style={{ flex:1, minWidth:8 }} />
      <button onClick={() => setPage("course")} style={nb("white","#0a0a0a")}>Course</button>
      <button onClick={() => setPage("admissions")} style={{ padding:"5px 12px", borderRadius:999, border:"1px solid #1E7A4F", background:"#1E7A4F", color:"white", cursor:"pointer", fontSize:12, fontWeight:700 }}>✈ Universities</button>
      <a href="/skyielts-writing.html" target="_blank" rel="noreferrer" style={{ padding:"5px 12px", borderRadius:999, border:"1px solid transparent", background:"linear-gradient(90deg,#0ea5e9,#8b5cf6)", color:"white", cursor:"pointer", fontSize:12, fontWeight:700, textDecoration:"none" }}>✍️ Writing Bands</a>
      <a href="/essay-checker.html" target="_blank" rel="noreferrer" style={{ padding:"5px 12px", borderRadius:999, border:"1px solid #0E7C86", background:"#0E7C86", color:"white", cursor:"pointer", fontSize:12, fontWeight:700, textDecoration:"none" }}>✓ Essay Checker</a>
      <button onClick={() => setPage("speaking")} style={{ padding:"5px 12px", borderRadius:999, border:"1px solid #B8860B", background:"linear-gradient(90deg,#f0c33c,#B8860B)", color:"#3a2a00", cursor:"pointer", fontSize:12, fontWeight:800 }}>🎤 Speaking ✦</button>
      <button onClick={() => setPage("psych")} style={nb("white","#0a0a0a")}>🧘 Mindset</button>
      <button onClick={() => setPage("dashboard")} style={nb("white","#0a0a0a")}>Progress</button>
      <button onClick={() => setPage("leaderboard")} style={nb("white","#0a0a0a")}>Board</button>
      {isAdmin && <button onClick={() => setPage("admin")} style={nb("#0a0a0a","white")}>Admin</button>}
      <div style={{ background:"#0a0a0a", color:"white", borderRadius:999, padding:"4px 11px", fontSize:12, fontWeight:700, letterSpacing:"0.2px" }}>{pts} pts</div>
      <button onClick={logout} style={{ padding:"5px 11px", borderRadius:999, border:"1px solid #e5e5e5", background:"white", cursor:"pointer", fontSize:12, color:"#666" }}>Logout</button>
    </div>
  );
}

// ══════════════════════════════════════════
// COURSE PAGE
// ══════════════════════════════════════════
const fmtBand = (b) => Number.isInteger(Number(b)) ? Number(b).toFixed(1) : String(b);
const BAND_OPTS = [4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9];

function CoursePage({ session, logout, setPage, setCurrentLesson, isAdmin, modules }) {
  const [myProgress, setMyProgress] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalSel, setGoalSel] = useState(7);
  const [reflectMod, setReflectMod] = useState(null);
  const [rBand, setRBand] = useState(6.5);
  const [rReview, setRReview] = useState("");
  const [rewardOpen, setRewardOpen] = useState(false);
  const [certBand, setCertBand] = useState(7);
  const [certFile, setCertFile] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    FB.getProgress(session.email).then(p => {
      const prog = p || {};
      setMyProgress(prog);
      if (!(prog.__meta && prog.__meta.goal)) setGoalOpen(true);
      else { setGoalSel(prog.__meta.goal); setCertBand(prog.__meta.goal); }
    });
  }, [session.email]);

  const meta = myProgress.__meta || {};
  const reflections = meta.reflections || {};
  const mods = modules || [];
  const totalPts = Object.entries(myProgress).filter(([k]) => k !== "__meta").reduce((s,[,v]) => s+(v.points||0), 0);
  const allLessons = mods.flatMap(m => m.lessons);
  const doneCount = allLessons.filter(l => myProgress[l.id]?.quizDone).length;
  const journeyPct = allLessons.length ? Math.round(doneCount/allLessons.length*100) : 0;

  const moduleComplete = (m) => m.lessons.length > 0 && m.lessons.every(l => myProgress[l.id]?.quizDone);
  const hasReflection = (m) => !!reflections[m.id];
  const fullAccess = isAdmin || hasFullAccess(session.email);
  const isUnlocked = (i) => fullAccess || i === 0 || (moduleComplete(mods[i-1]) && hasReflection(mods[i-1]));
  const activeIdx = mods.findIndex((m,i) => isUnlocked(i) && !moduleComplete(m));
  const allDone = mods.length > 0 && moduleComplete(mods[mods.length-1]) && hasReflection(mods[mods.length-1]);
  const cert = meta.certificate;

  const writeMeta = async (patch) => {
    setSaving(true);
    const cur = await FB.getProgress(session.email);
    const merged = { ...(cur.__meta || {}), ...patch };
    await FB.setProgress(session.email, { __meta: merged });
    setMyProgress(prev => ({ ...prev, __meta: merged }));
    setSaving(false);
    return merged;
  };

  const submitGoal = async () => { await writeMeta({ goal: goalSel }); setGoalOpen(false); };

  const submitReflection = async () => {
    if (!rReview.trim() || !reflectMod) return;
    const cur = await FB.getProgress(session.email);
    const newRef = { ...((cur.__meta||{}).reflections || {}), [reflectMod.id]: { band: rBand, review: rReview.trim(), at: new Date().toISOString() } };
    await writeMeta({ reflections: newRef });
    setReflectMod(null); setRReview(""); setRBand(6.5);
  };

  const submitCert = async () => {
    await writeMeta({ certificate: { band: certBand, file: certFile || "(file attached)", at: new Date().toISOString() } });
  };

  const cloudShadow = "0 10px 26px rgba(13,37,64,.10)";

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(#eaf2fb,#f6f9fd 230px,#fafafa)", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Nav session={session} logout={logout} setPage={setPage} isAdmin={isAdmin} pts={totalPts} />
      <style>{"@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.13)}}"}</style>
      <div style={{ maxWidth:760, margin:"0 auto", padding:"18px 16px 60px" }}>

        {/* ── HERO · IELTS8.KZ boarding pass ── */}
        <style>{"@keyframes heroFly{0%{transform:translateX(-50px) translateY(0) rotate(-8deg)}100%{transform:translateX(640px) translateY(-16px) rotate(-8deg)}} @keyframes heroDrift{0%{transform:translateX(0)}100%{transform:translateX(-40px)}}"}</style>
        <div style={{ position:"relative", overflow:"hidden", borderRadius:20, padding:"18px 20px 16px", color:"white", marginBottom:22,
          background:"linear-gradient(135deg,#070d18 0%,#0d2540 50%,#1A5FAD 135%)", boxShadow:"0 16px 38px rgba(13,37,64,.32)" }}>
          {/* aviation motion backdrop */}
          <div aria-hidden="true" style={{ position:"absolute", inset:0, overflow:"hidden" }}>
            <div style={{ position:"absolute", top:18, left:0, fontSize:20, opacity:.5, animation:"heroFly 18s linear infinite" }}>✈️</div>
            <div style={{ position:"absolute", top:14, left:"60%", fontSize:26, opacity:.12, animation:"heroDrift 9s ease-in-out infinite alternate" }}>☁️</div>
            <div style={{ position:"absolute", bottom:24, left:"18%", fontSize:20, opacity:.10, animation:"heroDrift 12s ease-in-out infinite alternate" }}>☁️</div>
            <svg viewBox="0 0 400 160" preserveAspectRatio="none" style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.6 }}>
              <circle cx="58" cy="30" r="42" fill="#1A5FAD" opacity=".22"/>
              <path d="M-10,150 C120,118 250,58 420,6" fill="none" stroke="#49BEB6" strokeWidth="2" strokeDasharray="2 10" opacity=".5"/>
            </svg>
          </div>

          <div style={{ position:"relative", zIndex:1 }}>
            {/* top ticket row */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px dashed rgba(255,255,255,.22)", paddingBottom:10, marginBottom:12 }}>
              <span style={{ fontSize:14, fontWeight:900, letterSpacing:"0.5px" }}>IELTS<span style={{ color:"#49BEB6" }}>8</span>.KZ</span>
              <span style={{ fontSize:9.5, fontWeight:700, letterSpacing:"2px", color:"#9ED9CF", textTransform:"uppercase" }}>Boarding pass ✈</span>
            </div>

            <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:"1.4px", textTransform:"uppercase", color:"#9ED9CF" }}>Passenger</div>
            <h2 style={{ margin:"1px 0 0", fontSize:21, fontWeight:800, letterSpacing:"-0.3px" }}>Welcome back, {session.name}</h2>
            <p style={{ margin:"3px 0 12px", opacity:0.72, fontSize:12 }}>From B1 to IELTS Band 8 · keep learning, keep climbing ✦</p>

            {/* route line */}
            <div style={{ position:"relative", height:20, margin:"2px 2px 14px" }}>
              <span style={{ position:"absolute", left:0, top:1, fontSize:11, fontWeight:800 }}>B1</span>
              <div style={{ position:"absolute", top:9, left:24, right:62, borderTop:"2px dashed rgba(255,255,255,.4)" }} />
              <span style={{ position:"absolute", left:`calc(24px + (100% - 86px) * ${journeyPct/100})`, top:-3, fontSize:15, transition:"left .4s ease" }}>✈️</span>
              <span style={{ position:"absolute", right:0, top:1, fontSize:11, fontWeight:800, color:"#9ED9CF" }}>BAND 8</span>
            </div>

            {/* stats */}
            <div style={{ display:"flex", gap:18, flexWrap:"wrap", alignItems:"center" }}>
              <div><div style={{ fontSize:20, fontWeight:800 }}>{totalPts}</div><div style={{ fontSize:11, opacity:0.7 }}>Miles (pts)</div></div>
              <div><div style={{ fontSize:20, fontWeight:800 }}>{doneCount}/{allLessons.length}</div><div style={{ fontSize:11, opacity:0.7 }}>Legs flown</div></div>
              <div><div style={{ fontSize:20, fontWeight:800 }}>{journeyPct}%</div><div style={{ fontSize:11, opacity:0.7 }}>Journey</div></div>
              <div onClick={() => setGoalOpen(true)} style={{ marginLeft:"auto", cursor:"pointer", background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.25)", borderRadius:12, padding:"6px 12px", textAlign:"center" }}>
                <div style={{ fontSize:18, fontWeight:800, color:"#9ED9CF" }}>🎯 {meta.goal ? "Band "+fmtBand(meta.goal) : "—"}</div>
                <div style={{ fontSize:10, opacity:0.7 }}>Target · tap to edit</div>
              </div>
            </div>

            {/* achievements */}
            <div style={{ marginTop:14, paddingTop:12, borderTop:"1px dashed rgba(255,255,255,.22)" }}>
              <div style={{ fontSize:9.5, fontWeight:700, letterSpacing:"1.4px", textTransform:"uppercase", color:"#9ED9CF", marginBottom:8 }}>🏅 Achievements</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {[
                  { e:"🛫", t:"Takeoff", on: doneCount>=1 },
                  { e:"📚", t:"Bookworm", on: doneCount>=5 },
                  { e:"🏅", t:"Module", on: mods.some(moduleComplete) },
                  { e:"🎯", t:"Goal set", on: !!meta.goal },
                  { e:"🎓", t:"Certified", on: !!cert },
                ].map(a => (
                  <span key={a.t} title={a.on ? "Unlocked!" : "Locked"} style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11.5, fontWeight:700,
                    padding:"5px 10px", borderRadius:999, border:"1px solid", borderColor: a.on?"rgba(73,190,182,.6)":"rgba(255,255,255,.14)",
                    background: a.on?"rgba(73,190,182,.18)":"rgba(255,255,255,.04)", color: a.on?"#bff0e9":"rgba(255,255,255,.45)", filter: a.on?"none":"grayscale(1)" }}>
                    <span style={{ fontSize:13 }}>{a.on?a.e:"🔒"}</span>{a.t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── ROUTE MAP (module clouds on a sky) ── */}
        <div style={{ position:"relative", borderRadius:22, padding:"30px 8px 14px", marginBottom:18, overflow:"hidden",
          background:"linear-gradient(180deg,#cfe4fa 0%,#e3f0fc 45%,#f1f7fd 100%)", border:"1px solid #cfe1f5" }}>
          {/* decorative sky */}
          <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMin slice" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", opacity:.55 }}>
            <g fill="#ffffff"><ellipse cx="70" cy="60" rx="46" ry="16"/><ellipse cx="40" cy="68" rx="28" ry="11"/><ellipse cx="330" cy="180" rx="44" ry="15"/><ellipse cx="300" cy="188" rx="26" ry="10"/><ellipse cx="80" cy="330" rx="40" ry="14"/><ellipse cx="340" cy="470" rx="42" ry="14"/></g>
          </svg>
          <div style={{ position:"relative", zIndex:1, textAlign:"center", fontSize:11, fontWeight:800, letterSpacing:"1.2px", textTransform:"uppercase", color:"#1A5FAD", marginBottom:14 }}>🛫 Departure — follow the clouds to your reward</div>

          <div style={{ position:"relative", zIndex:1 }}>
        {mods.map((m, i) => {
          const unlocked = isUnlocked(i);
          const complete = moduleComplete(m);
          const reflected = hasReflection(m);
          const isActive = i === activeIdx;
          const lessonsDone = m.lessons.filter(l => myProgress[l.id]?.quizDone).length;
          const open = expanded === m.id;
          const prev = i > 0 ? mods[i-1] : null;
          const canUnlockHere = !unlocked && prev && moduleComplete(prev) && !hasReflection(prev);
          const badge = complete ? "✓" : !unlocked ? "🔒" : isActive ? "✈️" : (i+1);
          const accent = !unlocked ? (canUnlockHere ? "#B8620A" : "#94a3b8") : complete ? "#1E7A4F" : "#1A5FAD";
          const onCloud = () => {
            if (unlocked) { setExpanded(open ? null : m.id); }
            else if (canUnlockHere) { setReflectMod(prev); setRBand(reflections[prev.id]?.band || 6.5); }
          };
          return (
            <div key={m.id} style={{ display:"flex", gap:12, alignItems:"stretch", paddingLeft: i%2 ? 26 : 0, paddingRight: i%2 ? 0 : 26, transition:"padding .2s" }}>
              {/* rail */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:42 }}>
                <div style={{ width:42, height:42, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:complete||!unlocked||isActive?18:15, fontWeight:800, color:"white", background:accent, boxShadow:`0 4px 12px ${accent}66`, border:"3px solid white", animation: canUnlockHere ? "pulse 1.6s ease-in-out infinite" : "none" }}>{badge}</div>
                <div style={{ flex:1, width:0, borderLeft:`2px dashed ${complete?"#1E7A4F":"#9bbbe0"}`, minHeight:22, margin:"2px 0" }} />
              </div>
              {/* cloud card */}
              <div style={{ flex:1, marginBottom:14, borderRadius:22, overflow:"hidden", background: unlocked ? "white" : (canUnlockHere ? "#fffaf2" : "#eef2f7"),
                boxShadow: unlocked||canUnlockHere ? cloudShadow : "none", border: unlocked ? "1px solid #e5edf7" : (canUnlockHere ? "1px solid #f0d6b0" : "1px dashed #cbd5e1"), opacity: (unlocked||canUnlockHere) ? 1 : 0.8 }}>
                <div onClick={onCloud}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", cursor: (unlocked||canUnlockHere) ? "pointer" : "not-allowed",
                    background: unlocked ? "linear-gradient(180deg,#f3f9ff,#ffffff)" : "transparent" }}>
                  <span style={{ fontSize:22 }}>{unlocked ? "☁️" : "🔒"}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:800, fontSize:13.5, color: unlocked ? "#0a0a0a" : (canUnlockHere?"#8a5a12":"#64748b"), lineHeight:1.3 }}>{m.title}</div>
                    <div style={{ fontSize:11, color: canUnlockHere?"#B8620A":"#7a8aa0", marginTop:3, fontWeight: canUnlockHere?700:400 }}>
                      {unlocked ? `${lessonsDone}/${m.lessons.length} lessons`
                        : canUnlockHere ? "🔓 Tap to take the mock test + write a review → unlock"
                        : "🔒 Finish the previous module first"}
                      {reflected ? ` · ✓ Mock Band ${fmtBand(reflections[m.id].band)}` : ""}
                    </div>
                  </div>
                  {unlocked && <span style={{ fontSize:13, color:"#94a3b8" }}>{open ? "▲" : "▼"}</span>}
                </div>

                {/* lessons */}
                {open && unlocked && m.lessons.map(l => {
                  const lp = myProgress[l.id] || {};
                  const ld = !!lp.quizDone;
                  return (
                    <div key={l.id} onClick={() => { setCurrentLesson(l); setPage("lesson"); }}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 16px", borderTop:"1px solid #f0f4f9", cursor:"pointer" }}>
                      <div style={{ width:28, height:28, borderRadius:"50%", background: ld?"#0a0a0a":"white", border: ld?"none":"1.5px solid #d4d4d4", color: ld?"white":"#666", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>{ld?"✓":(l.n||"·")}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:600, fontSize:13, color:"#0a0a0a", lineHeight:1.35 }}>{l.title}</div>
                        <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{l.quiz.questions.length} questions{lp.points?` · ${lp.points} pts`:""}</div>
                      </div>
                      <span style={{ fontSize:10, padding:"3px 9px", borderRadius:999, background:TC[l.tag]||"#94a3b8", color:TT(l.tag), fontWeight:700, flexShrink:0 }}>{l.tag}</span>
                    </div>
                  );
                })}

                {/* reflection gate */}
                {unlocked && complete && !reflected && (
                  <div style={{ padding:"14px 16px", borderTop:"1px solid #f0f4f9", background:"#fff8ec" }}>
                    <div style={{ fontSize:12.5, color:"#8a5a12", fontWeight:600, marginBottom:8 }}>🛬 Module complete! Log your mock-test IELTS score + a short review to open the next module.</div>
                    <button onClick={() => { setReflectMod(m); setRBand(reflections[m.id]?.band || 6.5); }}
                      style={{ padding:"9px 16px", borderRadius:10, border:"none", background:"#B8620A", color:"white", fontWeight:700, fontSize:13, cursor:"pointer" }}>✍️ Add score & review</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* ── FINISH / REWARD cloud ── */}
        <div style={{ display:"flex", gap:14, alignItems:"stretch" }}>
          <div style={{ width:42, display:"flex", justifyContent:"center" }}>
            <div style={{ width:42, height:42, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, background: allDone?"#B8860B":"#94a3b8", boxShadow:`0 4px 12px ${(allDone?"#B8860B":"#94a3b8")}55`, border:"3px solid white" }}>🏆</div>
          </div>
          <div onClick={() => allDone && setRewardOpen(true)}
            style={{ flex:1, borderRadius:22, padding:"16px 18px", cursor: allDone?"pointer":"default",
              background: allDone ? "linear-gradient(135deg,#1A5FAD,#0d2540)" : "#f1f5f9", color: allDone?"white":"#64748b",
              boxShadow: allDone?cloudShadow:"none", border: allDone?"none":"1px dashed #cbd5e1" }}>
            <div style={{ fontWeight:800, fontSize:15 }}>{cert ? "🎓 Certificate received!" : "🏆 Finish line — your reward"}</div>
            <div style={{ fontSize:12, opacity:0.85, marginTop:4 }}>
              {cert ? `Your IELTS: Band ${fmtBand(cert.band)} · target was Band ${fmtBand(meta.goal)}. Tap to see admissions →`
                    : allDone ? "All modules done! Tap to upload your IELTS certificate and claim your reward."
                    : "Complete every module + reflection to unlock. Then upload your IELTS certificate."}
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>

      {/* ═══ GOAL MODAL ═══ */}
      {goalOpen && (
        <Overlay>
          <div style={{ fontSize:34, textAlign:"center" }}>🎯</div>
          <h3 style={{ margin:"8px 0 4px", textAlign:"center", fontSize:18 }}>Set your target IELTS band</h3>
          <p style={{ margin:"0 0 14px", textAlign:"center", fontSize:12.5, color:"#64748b" }}>This is your goal at the start of the journey. We'll compare it to your certificate at the finish.</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginBottom:18 }}>
            {BAND_OPTS.map(b => (
              <button key={b} onClick={() => setGoalSel(b)} style={{ padding:"9px 14px", borderRadius:10, border:`2px solid ${goalSel===b?"#1A5FAD":"#e5e5e5"}`, background:goalSel===b?"#1A5FAD":"white", color:goalSel===b?"white":"#0a0a0a", fontWeight:700, cursor:"pointer" }}>{fmtBand(b)}</button>
            ))}
          </div>
          <button onClick={submitGoal} disabled={saving} style={btnPrimary}>{saving?"Saving…":"Start the journey ✈️"}</button>
        </Overlay>
      )}

      {/* ═══ REFLECTION MODAL ═══ */}
      {reflectMod && (
        <Overlay onClose={() => setReflectMod(null)}>
          <div style={{ fontSize:32, textAlign:"center" }}>🛬</div>
          <h3 style={{ margin:"6px 0 2px", textAlign:"center", fontSize:17 }}>Module reflection</h3>
          <p style={{ margin:"0 0 12px", textAlign:"center", fontSize:12, color:"#64748b" }}>{reflectMod.title}</p>
          <label style={lblStyle}>Your mock-test IELTS score</label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
            {BAND_OPTS.map(b => (
              <button key={b} onClick={() => setRBand(b)} style={{ padding:"7px 11px", borderRadius:8, border:`2px solid ${rBand===b?"#B8620A":"#e5e5e5"}`, background:rBand===b?"#B8620A":"white", color:rBand===b?"white":"#0a0a0a", fontWeight:700, fontSize:13, cursor:"pointer" }}>{fmtBand(b)}</button>
            ))}
          </div>
          <label style={lblStyle}>Short review (required)</label>
          <textarea value={rReview} onChange={e=>setRReview(e.target.value)} rows={4} placeholder="What did you learn? What was hard? How do you feel about your mock result?"
            style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:"2px solid #e5e5e5", fontSize:13, boxSizing:"border-box", resize:"vertical", marginBottom:14, fontFamily:"inherit" }} />
          <button onClick={submitReflection} disabled={saving || !rReview.trim()} style={{ ...btnPrimary, background: rReview.trim()?"#B8620A":"#e5e5e5", color: rReview.trim()?"white":"#999" }}>{saving?"Saving…":"Save & unlock next module →"}</button>
        </Overlay>
      )}

      {/* ═══ REWARD MODAL ═══ */}
      {rewardOpen && (
        <Overlay onClose={() => setRewardOpen(false)}>
          <div style={{ fontSize:42, textAlign:"center" }}>🏆</div>
          <h3 style={{ margin:"6px 0 2px", textAlign:"center", fontSize:19 }}>Congratulations, {session.name}!</h3>
          <p style={{ margin:"0 0 14px", textAlign:"center", fontSize:12.5, color:"#64748b" }}>You reached the finish line. Upload your real IELTS certificate to claim your reward.</p>
          {!cert ? (
            <>
              <label style={lblStyle}>Upload IELTS certificate (PDF / image)</label>
              <input type="file" accept="image/*,.pdf" onChange={e=>setCertFile(e.target.files?.[0]?.name || "")}
                style={{ width:"100%", marginBottom:12, fontSize:12 }} />
              <label style={lblStyle}>Your actual overall band</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
                {BAND_OPTS.map(b => (
                  <button key={b} onClick={() => setCertBand(b)} style={{ padding:"7px 11px", borderRadius:8, border:`2px solid ${certBand===b?"#1A5FAD":"#e5e5e5"}`, background:certBand===b?"#1A5FAD":"white", color:certBand===b?"white":"#0a0a0a", fontWeight:700, fontSize:13, cursor:"pointer" }}>{fmtBand(b)}</button>
                ))}
              </div>
              <button onClick={submitCert} disabled={saving} style={btnPrimary}>{saving?"Saving…":"🎁 Claim reward"}</button>
            </>
          ) : (
            <>
              <div style={{ display:"flex", gap:10, justifyContent:"center", margin:"4px 0 14px" }}>
                <div style={{ background:"#eef4fd", borderRadius:12, padding:"12px 18px", textAlign:"center" }}><div style={{ fontSize:11, color:"#64748b" }}>Target</div><div style={{ fontSize:22, fontWeight:800, color:"#1A5FAD" }}>{fmtBand(meta.goal)}</div></div>
                <div style={{ background: cert.band>=meta.goal?"#e2ece5":"#fdf0e0", borderRadius:12, padding:"12px 18px", textAlign:"center" }}><div style={{ fontSize:11, color:"#64748b" }}>Achieved</div><div style={{ fontSize:22, fontWeight:800, color: cert.band>=meta.goal?"#1E7A4F":"#B8620A" }}>{fmtBand(cert.band)}</div></div>
              </div>
              <p style={{ textAlign:"center", fontSize:13, color:"#0a0a0a", margin:"0 0 14px", fontWeight:600 }}>
                {cert.band>=meta.goal ? "🌟 Goal achieved! Outstanding work." : "Great effort — you're close. Keep pushing!"}
              </p>
              <button onClick={() => { setRewardOpen(false); setPage("admissions"); }} style={btnPrimary}>✈️ Open Admissions Alley →</button>
            </>
          )}
        </Overlay>
      )}
    </div>
  );
}

// shared modal shell + small style helpers
function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose ? (e => { if (e.target === e.currentTarget) onClose(); }) : undefined}
      style={{ position:"fixed", inset:0, background:"rgba(13,37,64,0.45)", backdropFilter:"blur(2px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16, zIndex:200 }}>
      <div style={{ background:"white", borderRadius:20, padding:"24px 22px", maxWidth:440, width:"100%", boxShadow:"0 20px 60px rgba(0,0,0,0.3)", maxHeight:"90vh", overflowY:"auto" }}>{children}</div>
    </div>
  );
}
const btnPrimary = { width:"100%", padding:"12px", borderRadius:10, border:"none", background:"#1A5FAD", color:"white", fontWeight:700, fontSize:14, cursor:"pointer" };
const lblStyle = { display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.3px", textTransform:"uppercase", color:"#94a3b8", marginBottom:6 };

// ══════════════════════════════════════════
// LESSON PAGE
// ══════════════════════════════════════════
const OPEN_POINTS = 5;
const MOTIVATION = [
  "Small steps every day take you to Band 8.",
  "You don't have to be perfect — just keep going.",
  "Every expert was once a beginner.",
  "Believe you can, and you're halfway there.",
  "Progress, not perfection.",
  "Your future self will thank you for today.",
  "Mistakes are proof that you are trying.",
  "One page a day becomes fluency.",
];
const pickMotivation = (id) => { let h=0; const s=String(id); for (let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return MOTIVATION[h % MOTIVATION.length]; };
const presentLabel = (type) => type==="presentation" ? "Understanding the presentation" : type==="pdf" ? "Read & take notes" : type==="video" ? "Watch & note down" : "Open & explore";

// Turn a Slides/PDF/Doc/Office URL into an embeddable preview src.
function embedSrc(url) {
  if (!url) return null;
  const u = url.trim();
  const slides = u.match(/presentation\/d\/([\w-]+)/);
  if (slides) return `https://docs.google.com/presentation/d/${slides[1]}/embed?start=false&loop=false`;
  const drive = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
  const doc = u.match(/document\/d\/([\w-]+)/);
  if (doc) return `https://docs.google.com/document/d/${doc[1]}/preview`;
  if (u.includes("canva.com/design")) return u.split("?")[0].replace(/\/edit$/, "/view") + "?embed";
  if (/\.(pptx?|docx?|xlsx?)(\?|$)/i.test(u)) return "https://view.officeapps.live.com/op/embed.aspx?src=" + encodeURIComponent(u);
  return u; // direct PDF or any framable page
}

function LessonPage({ lesson, session, setPage, setCurrentLesson, isAdmin, refreshModules, modules }) {
  const [tab, setTab] = useState("materials");
  const [addType, setAddType] = useState("link");
  const [addUrl, setAddUrl] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [addText, setAddText] = useState("");
  const [myProgress, setMyProgress] = useState({});
  const [saving, setSaving] = useState(false);
  const [materials, setMaterials] = useState(lesson.materials || []);
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    FB.getLessonMaterials(lesson.id).then(mats => { setMaterials(mats || []); });
  }, [lesson.id]);

  useEffect(() => { FB.getProgress(session.email).then(setMyProgress); }, [session.email]);

  useEffect(() => {
    FB.getSubmissions(session.email).then(s => setSubmission(s[lesson.id] || null));
  }, [session.email, lesson.id]);

  const lp = myProgress[lesson.id] || {};

  const saveMaterial = async () => {
    if (!addUrl || !addTitle) return;
    setSaving(true);
    try {
      const current = await FB.getLessonMaterials(lesson.id);
      const newMat = { type: addType, url: addUrl, title: addTitle, text: addText.trim(), id: Date.now() };
      const updated = [...(current || []), newMat];
      await FB.setLessonMaterials(lesson.id, updated);
      setMaterials(updated);
      setAddUrl(""); setAddTitle(""); setAddText("");
    } catch(e) { alert("Failed to save: " + e.message); }
    setSaving(false);
  };

  const deleteMaterial = async (mid) => {
    setSaving(true);
    try {
      const current = await FB.getLessonMaterials(lesson.id);
      const updated = (current || []).filter(m => m.id !== mid);
      await FB.setLessonMaterials(lesson.id, updated);
      setMaterials(updated);
    } catch(e) { alert("Failed to delete: " + e.message); }
    setSaving(false);
  };

  // award points the first time a student opens a material
  const [openToast, setOpenToast] = useState("");
  const isOpened = (mat) => (lp.openedMaterials || []).includes(mat.id);
  const awardOpen = async (mat) => {
    if (isOpened(mat)) return;
    try {
      const cur = await FB.getProgress(session.email);
      const lpc = cur[lesson.id] || {};
      const opened = lpc.openedMaterials || [];
      if (opened.includes(mat.id)) return;
      const updated = { ...lpc, openedMaterials: [...opened, mat.id], points: (lpc.points||0) + OPEN_POINTS };
      await FB.setProgress(session.email, { [lesson.id]: updated });
      setMyProgress(prev => ({ ...prev, [lesson.id]: updated }));
      setOpenToast(`+${OPEN_POINTS} pts · material opened! ✨`);
      setTimeout(() => setOpenToast(""), 2400);
    } catch(e) {}
  };

  return (
    <div style={{ minHeight:"100vh", background:"#fafafa", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ background:"white", borderBottom:"1px solid #e5e5e5", padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={() => setPage("course")} style={{ padding:"5px 11px", borderRadius:999, border:"1px solid #e5e5e5", background:"white", color:"#0a0a0a", cursor:"pointer", fontWeight:600, fontSize:12, flexShrink:0 }}>← Back</button>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:13.5, color:"#0a0a0a", lineHeight:1.3 }}>{lesson.n ? `Lesson ${lesson.n}` : ""}{lesson.n ? " · " : ""}{lesson.title}</div>
          <div style={{ fontSize:11, color:"#888", marginTop:2 }}>{lp.points ? `${lp.points} pts earned` : "Not completed yet"}</div>
        </div>
        <span style={{ fontSize:10, padding:"3px 9px", borderRadius:999, background:TC[lesson.tag]||"#94a3b8", color:TT(lesson.tag), fontWeight:700, letterSpacing:"0.2px", flexShrink:0 }}>{lesson.tag}</span>
      </div>
      <div style={{ maxWidth:740, margin:"0 auto", padding:"14px" }}>
        <div style={{ display:"flex", gap:4, marginBottom:14, background:"white", borderRadius:10, padding:4, border:"1px solid #e5e5e5" }}>
          {["materials","quiz","assignment"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:"8px", borderRadius:8, border:"none", cursor:"pointer", fontWeight:600, fontSize:12, background:tab===t?"#0a0a0a":"transparent", color:tab===t?"white":"#666", letterSpacing:"0.2px" }}>
              {t==="materials"?"Materials":t==="quiz"?"Quiz":"Assignment"}
            </button>
          ))}
        </div>

        {lesson.guideUrl && (
          <a href={lesson.guideUrl} target="_blank" rel="noreferrer"
            style={{ display:"flex", alignItems:"center", gap:12, textDecoration:"none", background:"#0a0a0a", color:"white", borderRadius:12, padding:"14px 16px", marginBottom:14 }}>
            <span style={{ fontSize:22, lineHeight:1 }}>✈️</span>
            <span style={{ flex:1, minWidth:0 }}>
              <span style={{ display:"block", fontWeight:700, fontSize:14 }}>Open Interactive Writing Guide</span>
              <span style={{ display:"block", fontSize:12, opacity:0.75, marginTop:2 }}>Pie charts, hybrid tasks & Band 7+ strategies — aviation example</span>
            </span>
            <span style={{ fontSize:13, fontWeight:700, opacity:0.9 }}>Open ↗</span>
          </a>
        )}

        {tab==="materials" && (
          <div>
            {isAdmin && (
              <div style={{ background:"white", borderRadius:14, padding:20, marginBottom:16, border:"1px solid #e5e5e5" }}>
                <div style={{ fontWeight:700, marginBottom:12 }}>Add Material</div>
                <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap" }}>
                  {["link","video","presentation","pdf"].map(t => (
                    <button key={t} onClick={() => setAddType(t)} style={{ padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:addType===t?"#0a0a0a":"#e5e5e5", color:addType===t?"white":"#475569" }}>
                      {t==="link"?"Link":t==="video"?"Video":t==="presentation"?"Slides":"PDF"}
                    </button>
                  ))}
                </div>
                <input placeholder="Title" value={addTitle} onChange={e=>setAddTitle(e.target.value)}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"2px solid #e5e5e5", fontSize:14, boxSizing:"border-box", marginBottom:8 }} />
                <input placeholder="URL (Google Slides / Drive / Canva / PDF / .pptx)" value={addUrl} onChange={e=>setAddUrl(e.target.value)}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"2px solid #e5e5e5", fontSize:14, boxSizing:"border-box", marginBottom:8 }} />
                <textarea placeholder="Text / notes shown under the preview (optional)" value={addText} onChange={e=>setAddText(e.target.value)} rows={3}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"2px solid #e5e5e5", fontSize:14, boxSizing:"border-box", marginBottom:8, resize:"vertical", fontFamily:"inherit" }} />
                <button onClick={saveMaterial} disabled={saving} style={{ padding:"10px 24px", borderRadius:8, border:"none", background:"#0a0a0a", color:"white", fontWeight:700, cursor:"pointer", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Saving..." : "Add"}
                </button>
              </div>
            )}
            <style>{`
              @keyframes flyIn{0%{opacity:0;transform:translateY(20px) scale(.96)}100%{opacity:1;transform:none}}
              @keyframes birdFloat{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(-7px) rotate(7deg)}}
              .matFly{animation:flyIn .55s cubic-bezier(.2,.85,.25,1) both}
              .matCard{transition:transform .3s cubic-bezier(.2,.85,.25,1),box-shadow .3s cubic-bezier(.2,.85,.25,1)}
              .matCard:hover{transform:translateY(-5px) scale(1.02);box-shadow:0 22px 48px rgba(13,37,64,.16)}
              .iconBadge{transition:transform .35s cubic-bezier(.2,.85,.25,1)}
              .matCard:hover .iconBadge{transform:scale(1.14) rotate(-7deg)}
              .openBtn{transition:transform .2s cubic-bezier(.2,.85,.25,1),filter .2s}
              .openBtn:hover{transform:scale(1.07);filter:brightness(1.08)}
              .birdFloat{animation:birdFloat 5s ease-in-out infinite;display:inline-block}
            `}</style>

            {/* header */}
            <div style={{ display:"flex", alignItems:"center", gap:12, padding:"2px 4px 16px" }}>
              <span className="birdFloat" style={{ fontSize:26 }}>🕊️</span>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:22, fontWeight:800, color:"#0a0a0a", letterSpacing:"-0.4px" }}>Materials</div>
                <div style={{ fontSize:13, color:"#8a94a6", marginTop:1 }}>{pickMotivation(lesson.id)}</div>
              </div>
            </div>

            {materials.length === 0 ? (
              <div style={{ textAlign:"center", padding:44, color:"#aab2c0", background:"white", borderRadius:20, border:"1px solid rgba(0,0,0,.06)", fontSize:14 }}>{isAdmin ? "No materials yet. Add above!" : "No materials yet. Check back soon!"}</div>
            ) : materials.map((mat, idx) => {
              const isVideo = mat.type==="video" && mat.url && (mat.url.includes("youtube") || mat.url.includes("youtu.be"));
              const preview = (mat.type==="presentation" || mat.type==="pdf") ? embedSrc(mat.url) : null;
              const tall = mat.type==="pdf";
              const opened = isOpened(mat);
              return (
              <div key={mat.id} className="matCard matFly" style={{ animationDelay:`${idx*70}ms`, background:"white", borderRadius:20, padding:16, marginBottom:14, border:"1px solid rgba(0,0,0,.06)", boxShadow:"0 6px 18px rgba(13,37,64,.06)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span className="iconBadge" style={{ width:44, height:44, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, background:"linear-gradient(145deg,#eef5fd,#d9e8f8)", flexShrink:0 }}>{mat.type==="video"?"🎬":mat.type==="presentation"?"📊":mat.type==="pdf"?"📄":"🔗"}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:15.5, fontWeight:700, color:"#0a0a0a", letterSpacing:"-0.2px", lineHeight:1.25 }}>{mat.title}</div>
                    <div style={{ fontSize:12, color:"#9aa3b2", marginTop:1, textTransform:"capitalize" }}>{mat.type}{opened ? " · opened" : ""}</div>
                  </div>
                  {opened
                    ? <span style={{ fontSize:12, fontWeight:700, color:"#1E7A4F", background:"#e8f3ec", borderRadius:999, padding:"4px 10px", flexShrink:0 }}>✓ +{OPEN_POINTS}</span>
                    : <span style={{ fontSize:12, fontWeight:700, color:"#1A5FAD", background:"#eaf2fb", borderRadius:999, padding:"4px 10px", flexShrink:0 }}>+{OPEN_POINTS} pts</span>}
                  <a className="openBtn" href={mat.url} target="_blank" rel="noreferrer" onClick={() => awardOpen(mat)}
                    style={{ padding:"8px 16px", borderRadius:999, background:"linear-gradient(180deg,#2a7fe6,#1559c0)", color:"white", textDecoration:"none", fontSize:13, fontWeight:700, flexShrink:0, boxShadow:"0 5px 14px rgba(21,89,192,.32)" }}>Open</a>
                  {isAdmin && <button onClick={() => deleteMaterial(mat.id)} style={{ width:32, height:32, borderRadius:10, border:"none", background:"#f4f4f6", color:"#9aa3b2", cursor:"pointer", flexShrink:0, fontSize:14 }}>✕</button>}
                </div>

                {(isVideo || preview) && (
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.5px", textTransform:"uppercase", color:"#2a7fe6", marginTop:14, marginBottom:7 }}>{presentLabel(mat.type)}</div>
                )}
                {isVideo && (
                  <div style={{ borderRadius:16, overflow:"hidden" }}>
                    <iframe width="100%" height="250" title={mat.title||"Lesson video"}
                      src={mat.url.replace("watch?v=","embed/").replace("youtu.be/","www.youtube.com/embed/")}
                      frameBorder="0" allowFullScreen style={{ display:"block" }} />
                  </div>
                )}
                {preview && (
                  <div style={{ borderRadius:16, overflow:"hidden", border:"1px solid rgba(0,0,0,.06)" }}>
                    <iframe width="100%" height={tall?520:360} title={mat.title||"Preview"}
                      src={preview} frameBorder="0" allowFullScreen style={{ display:"block", background:"#f6f9fd" }} />
                  </div>
                )}

                {mat.text && (
                  <div style={{ marginTop:12, fontSize:14, color:"#475569", lineHeight:1.7, whiteSpace:"pre-line" }}>{mat.text}</div>
                )}
              </div>
              );
            })}

            {openToast && (
              <div style={{ position:"fixed", bottom:22, left:"50%", transform:"translateX(-50%)", background:"#1d1d1f", color:"white", padding:"11px 20px", borderRadius:999, fontWeight:700, fontSize:13.5, boxShadow:"0 12px 30px rgba(0,0,0,.3)", zIndex:300 }}>{openToast}</div>
            )}
          </div>
        )}

        {tab==="quiz" && (() => {
          const nq = lesson.quiz.questions.length;
          const isTimed = nq >= 20;
          return (
          <div>
            <div style={{ background:"#0a0a0a", borderRadius:12, padding:"14px 16px", color:"white", marginBottom:12 }}>
              <div style={{ fontSize:14, fontWeight:700 }}>{isTimed ? "Timed Test" : "Quiz"} · {nq} questions{isTimed ? " · 30 min" : ""}</div>
              <div style={{ marginTop:6, fontSize:12, opacity:0.75 }}>
                {isTimed ? "One attempt clock: the test auto-submits when time runs out." : "Short practice quiz."}
                {lp.quizDone ? ` · Last score: ${lp.quizScore} pts` : ""}
              </div>
            </div>
            <button onClick={() => setPage("quiz")} style={{ width:"100%", padding:13, borderRadius:10, border:"none", background:lp.quizDone?"white":"#0a0a0a", color:lp.quizDone?"#0a0a0a":"white", fontWeight:700, fontSize:14, cursor:"pointer", borderWidth:1, borderStyle:"solid", borderColor:lp.quizDone?"#e5e5e5":"#0a0a0a" }}>
              {lp.quizDone ? (isTimed ? "Retake Test" : "Retake Quiz") : (isTimed ? "Start Test (30 min)" : "Start Quiz")}
            </button>
          </div>
          );
        })()}

        {tab==="assignment" && (() => {
          const aType = lesson.assignment.type;
          const desc = aType === "essay"    ? "Essay · 60-min timer · self-assessment"
                     : aType === "speaking" ? "Speaking task · self-assessment"
                                            : "Short written response";
          const done = !!submission;
          const band = submission?.rubric?.overall;
          return (
            <div>
              <div style={{ background:"#0a0a0a", borderRadius:12, padding:"14px 16px", color:"white", marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700 }}>Assignment</div>
                    <div style={{ fontSize:12, opacity:0.75, marginTop:2 }}>{desc}</div>
                  </div>
                  {band != null && (
                    <div style={{ background:"white", color:"#0a0a0a", borderRadius:8, padding:"6px 12px", textAlign:"center", minWidth:54 }}>
                      <div style={{ fontSize:18, fontWeight:800, lineHeight:1 }}>{band}</div>
                      <div style={{ fontSize:9, letterSpacing:"0.4px", textTransform:"uppercase", color:"#666", marginTop:2 }}>Band</div>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => setPage("assignment")} style={{ width:"100%", padding:13, borderRadius:10, border:"1px solid #0a0a0a", background: done ? "white" : "#0a0a0a", color: done ? "#0a0a0a" : "white", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                {done ? "Open · review or retry" : "Open Assignment"}
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// ADMISSIONS ALLEY — universities + scholarships by IELTS band
// ══════════════════════════════════════════
const REGION_FLAG = { "Middle East":"🕌", "Italy":"🇮🇹", "Europe":"🇪🇺", "USA":"🇺🇸", "Australia":"🇦🇺" };
const REGIONS = ["All","Middle East","Italy","Europe","USA","Australia"];

const UNIVERSITIES = [
  // Middle East
  { name:"King Abdullah University of Science and Technology (KAUST)", country:"Saudi Arabia", city:"Thuwal", region:"Middle East", minIELTS:6.5, bandNote:"6.5 overall (no band below 6.0)", level:"Both", fields:"Engineering, Computer Science, Sciences", scholarship:"KAUST Fellowship — full tuition + monthly stipend, housing, medical", note:"Every admitted student is automatically funded — one of the most generous in the region." },
  { name:"New York University Abu Dhabi (NYUAD)", country:"UAE", city:"Abu Dhabi", region:"Middle East", minIELTS:7.0, bandNote:"7.0 overall recommended", level:"Bachelor", fields:"Engineering, Business, Sciences, Humanities", scholarship:"NYUAD Need-Based Aid — full tuition, housing, travel as needed", note:"Need-blind admission; strong applicants funded regardless of income." },
  { name:"Khalifa University", country:"UAE", city:"Abu Dhabi", region:"Middle East", minIELTS:6.5, bandNote:"6.5 overall, 6.0 each band", level:"Both", fields:"Engineering, Sciences, Medicine", scholarship:"Khalifa Scholarship — full tuition + stipend (grad)", note:"Well-funded STEM university with substantial merit awards." },
  { name:"Hamad Bin Khalifa University (HBKU)", country:"Qatar", city:"Doha", region:"Middle East", minIELTS:6.5, bandNote:"6.5 overall, 6.0 each band", level:"Both", fields:"Engineering, Computing, Public Policy", scholarship:"HBKU Graduate Scholarship — full tuition waiver + stipend", note:"Qatar's Education City with strong graduate research funding." },
  { name:"American University of Beirut (AUB)", country:"Lebanon", city:"Beirut", region:"Middle East", minIELTS:6.5, bandNote:"6.5 overall, 6.0 each band", level:"Both", fields:"Engineering, Business, Medicine", scholarship:"AUB Merit & Financial Aid — partial to substantial tuition support", note:"US-style university with a strong scholarship and aid tradition." },
  { name:"Koç University", country:"Turkey", city:"Istanbul", region:"Middle East", minIELTS:6.5, bandNote:"6.5 overall recommended", level:"Both", fields:"Engineering, Business, Sciences, Medicine", scholarship:"Koç Scholarship — full/partial tuition waiver, possible stipend + housing", note:"Top Turkish private university; merit scholarships cover most or all tuition." },
  { name:"Sabancı University", country:"Turkey", city:"Istanbul", region:"Middle East", minIELTS:6.0, bandNote:"6.0 overall typical (UG)", level:"Both", fields:"Engineering, Management, Natural Sciences", scholarship:"Sabancı Merit Scholarship — full tuition + stipend + accommodation", note:"Generous tiered merit awards for high achievers." },
  { name:"Bilkent University", country:"Turkey", city:"Ankara", region:"Middle East", minIELTS:6.5, bandNote:"6.5 overall typical", level:"Both", fields:"Engineering, Business, Sciences, Humanities", scholarship:"Bilkent Comprehensive Scholarship — full tuition, housing + stipend", note:"Comprehensive merit scholarships cover the full cost of study." },
  { name:"United Arab Emirates University (UAEU)", country:"UAE", city:"Al Ain", region:"Middle East", minIELTS:6.0, bandNote:"6.0 overall, 5.5 each band", level:"Both", fields:"Engineering, Business, Sciences, Medicine", scholarship:"UAEU Graduate Scholarship — tuition waiver + assistantship stipend", note:"Flagship public university with funded assistantships." },
  // Italy
  { name:"Politecnico di Milano", country:"Italy", city:"Milan", region:"Italy", minIELTS:6.0, bandNote:"6.0 overall (programme-dependent)", level:"Both", fields:"Engineering, Architecture, Design", scholarship:"Merit Scholarship + DSU Lombardia — tuition waiver + ~€5,000/yr grant", note:"Merit awards plus regional DSU grants make it a prime target." },
  { name:"Politecnico di Torino", country:"Italy", city:"Turin", region:"Italy", minIELTS:5.5, bandNote:"5.5 overall (programme-dependent)", level:"Both", fields:"Engineering, Architecture, ICT", scholarship:"TOP-UIC / EDISU Piemonte — tuition exemption + ~€4–7k/yr grant", note:"Internal merit scholarships plus EDISU grants for living costs + housing." },
  { name:"University of Bologna", country:"Italy", city:"Bologna", region:"Italy", minIELTS:6.0, bandNote:"6.0 overall (programme-dependent)", level:"Both", fields:"Economics, Engineering, Humanities", scholarship:"Unibo Study Grants + ER-GO — tuition waiver + ~€11,000/yr grant", note:"Oldest Western university; many study grants plus ER-GO DSU funding." },
  { name:"Sapienza University of Rome", country:"Italy", city:"Rome", region:"Italy", minIELTS:6.0, bandNote:"6.0 overall (programme-dependent)", level:"Both", fields:"Engineering, Sciences, Economics", scholarship:"Sapienza Merit + DiSCo Lazio — tuition waiver + ~€5,000/yr grant", note:"Income-based fees and DiSCo Lazio grants for non-EU students." },
  { name:"University of Padua", country:"Italy", city:"Padua", region:"Italy", minIELTS:6.0, bandNote:"6.0 overall (programme-dependent)", level:"Both", fields:"Engineering, Sciences, Economics", scholarship:"Padua Excellence Scholarship — ~€8,000/yr + tuition waiver + ESU grant", note:"Strong excellence scholarships for incoming international Master's students." },
  { name:"Bocconi University", country:"Italy", city:"Milan", region:"Italy", minIELTS:6.5, bandNote:"6.5 overall (programme-dependent)", level:"Both", fields:"Economics, Management, Finance", scholarship:"Bocconi Merit & International Awards — up to ~€13,000/yr tuition waiver", note:"Top business school with substantial merit-based tuition waivers." },
  { name:"University of Pavia", country:"Italy", city:"Pavia", region:"Italy", minIELTS:5.5, bandNote:"5.5 overall (programme-dependent)", level:"Both", fields:"Engineering, Economics, Sciences", scholarship:"UNIPV International Scholarship + EDiSU — ~€8,000/yr + free housing/meals", note:"Covers fees, stipend, housing and meals for top students." },
  { name:"Ca' Foscari University of Venice", country:"Italy", city:"Venice", region:"Italy", minIELTS:6.0, bandNote:"6.0 overall (programme-dependent)", level:"Both", fields:"Economics, Languages, Humanities", scholarship:"Ca' Foscari Welcome + Invest Your Talent in Italy — waiver + ~€8,000/yr", note:"Part of Invest Your Talent in Italy with internal grants." },
  // Europe
  { name:"Technical University of Munich (TUM)", country:"Germany", city:"Munich", region:"Europe", minIELTS:6.5, bandNote:"6.5 overall (≈5.5 each)", level:"Both", fields:"Engineering, CS, Natural Sciences, Management", scholarship:"Deutschlandstipendium — €300/month (most programmes tuition-free)", note:"Tuition-free public university plus merit grants — low cost, high prestige." },
  { name:"RWTH Aachen University", country:"Germany", city:"Aachen", region:"Europe", minIELTS:6.5, bandNote:"6.5 overall, 6.0 each band", level:"Both", fields:"Mechanical/Electrical Engineering, CS", scholarship:"DAAD + Deutschlandstipendium — living stipend (tuition-free)", note:"No tuition plus DAAD funding covers living costs." },
  { name:"Delft University of Technology (TU Delft)", country:"Netherlands", city:"Delft", region:"Europe", minIELTS:6.5, bandNote:"6.5 overall, 6.0 each band", level:"Both", fields:"Aerospace, Civil Eng, CS, Architecture", scholarship:"Justus & Louise van Effen — full tuition + living allowance", note:"Top engineering school with full-ride excellence funding for non-EU." },
  { name:"University of Amsterdam", country:"Netherlands", city:"Amsterdam", region:"Europe", minIELTS:6.5, bandNote:"6.5 overall, 6.0 each band", level:"Both", fields:"Business, Economics, Social Sciences, CS", scholarship:"Holland Scholarship — €5,000 first-year grant (non-EEA)", note:"Government-backed grant offsets first-year costs." },
  { name:"Lund University", country:"Sweden", city:"Lund", region:"Europe", minIELTS:6.5, bandNote:"6.5 overall, 5.5 each band", level:"Both", fields:"Engineering, Life Sciences, Business, Law", scholarship:"Lund Global Scholarship — 25–100% tuition waiver", note:"Global scholarship plus Erasmus Mundus joint programmes." },
  { name:"KTH Royal Institute of Technology", country:"Sweden", city:"Stockholm", region:"Europe", minIELTS:6.5, bandNote:"6.5 overall, 5.5 each band", level:"Master", fields:"Engineering, CS, Architecture", scholarship:"KTH + Swedish Institute Scholarships — full tuition (some full living)", note:"Institute waivers plus SI full scholarships and Erasmus Mundus." },
  { name:"Sciences Po", country:"France", city:"Paris", region:"Europe", minIELTS:7.0, bandNote:"7.0 overall, 6.5 each band", level:"Both", fields:"Political Science, International Affairs, Economics", scholarship:"Eiffel Excellence — monthly stipend, travel, insurance", note:"Eiffel programme funds top international students in policy/politics." },
  { name:"ETH Zürich", country:"Switzerland", city:"Zürich", region:"Europe", minIELTS:7.0, bandNote:"7.0 overall, 6.5 each band", level:"Master", fields:"Engineering, CS, Mathematics, Physics", scholarship:"Excellence Scholarship (ESOP) — full tuition + living stipend", note:"Competitive full-funding package at a world top-10 university." },
  { name:"Aalto University", country:"Finland", city:"Espoo", region:"Europe", minIELTS:6.5, bandNote:"6.5 overall, 5.5 each band", level:"Both", fields:"Technology, Design, Business, Architecture", scholarship:"Aalto Scholarship — 50–100% tuition waiver", note:"Tiered waivers and Erasmus Mundus programmes for non-EU." },
  { name:"University of Amsterdam — Amsterdam Merit", country:"Netherlands", city:"Amsterdam", region:"Europe", minIELTS:6.5, bandNote:"6.5 overall", level:"Master", fields:"Business, Data Science, Law", scholarship:"Amsterdam Merit Scholarship — partial tuition for top non-EEA", note:"Additional merit route for outstanding master's applicants." },
  // USA
  { name:"Harvard University", country:"USA", city:"Cambridge, MA", region:"USA", minIELTS:7.0, bandNote:"7.0–7.5 overall", level:"Both", fields:"Engineering, Liberal Arts, Business, Sciences", scholarship:"Harvard Financial Aid Initiative — full need-based aid (tuition, room, board)", note:"Need-blind for all applicants with extremely generous full-need aid." },
  { name:"Yale University", country:"USA", city:"New Haven, CT", region:"USA", minIELTS:7.0, bandNote:"7.0–7.5 overall", level:"Both", fields:"Liberal Arts, Engineering, Law, Sciences", scholarship:"Yale Need-Based Scholarship — covers 100% of demonstrated need", note:"Need-blind for internationals; no loans in aid packages." },
  { name:"Princeton University", country:"USA", city:"Princeton, NJ", region:"USA", minIELTS:7.0, bandNote:"7.0–7.5 overall", level:"Both", fields:"Engineering, Public Policy, Liberal Arts", scholarship:"Princeton Financial Aid — grant-based full-need, no loans", note:"Pioneered no-loan aid; meets full need for admitted internationals." },
  { name:"MIT", country:"USA", city:"Cambridge, MA", region:"USA", minIELTS:7.0, bandNote:"7.0–7.5 overall", level:"Both", fields:"Engineering, CS, Sciences, Management", scholarship:"MIT Need-Based Aid — meets full demonstrated need (UG)", note:"Need-blind for internationals; meets 100% of demonstrated need." },
  { name:"Stanford University", country:"USA", city:"Stanford, CA", region:"USA", minIELTS:7.0, bandNote:"7.0 overall", level:"Both", fields:"Engineering, CS, Business, Liberal Arts", scholarship:"Stanford Need-Based Aid — full demonstrated need met", note:"Meets 100% of demonstrated need for admitted internationals." },
  { name:"Amherst College", country:"USA", city:"Amherst, MA", region:"USA", minIELTS:7.0, bandNote:"7.0 overall", level:"Bachelor", fields:"Liberal Arts, Sciences, Humanities", scholarship:"Amherst Need-Based Aid — full need met, no loans", note:"Need-blind for internationals; very generous liberal arts college." },
  { name:"Williams College", country:"USA", city:"Williamstown, MA", region:"USA", minIELTS:7.0, bandNote:"7.0 overall", level:"Bachelor", fields:"Liberal Arts, Sciences, Economics", scholarship:"Williams Need-Based Aid — 100% of demonstrated need", note:"Top liberal arts college; grant-based aid for internationals." },
  { name:"Berea College", country:"USA", city:"Berea, KY", region:"USA", minIELTS:6.5, bandNote:"6.5 overall typical", level:"Bachelor", fields:"Liberal Arts, Education, Agriculture, Business", scholarship:"Tuition Promise Scholarship — full tuition for every admitted student", note:"No student pays tuition — ideal for high-need international students." },
  { name:"University of Alabama", country:"USA", city:"Tuscaloosa, AL", region:"USA", minIELTS:6.0, bandNote:"6.0 overall typical", level:"Both", fields:"Engineering, Business, Communications", scholarship:"Automatic Merit Scholarships — up to full tuition by GPA/test", note:"Predictable automatic merit aid for strong academic stats." },
  { name:"Arizona State University", country:"USA", city:"Tempe, AZ", region:"USA", minIELTS:6.5, bandNote:"6.5 overall typical", level:"Both", fields:"Engineering, Business, Journalism, Sustainability", scholarship:"New American University / International Merit — renewable awards", note:"Large public university with accessible merit scholarships." },
  // Australia
  { name:"University of Melbourne", country:"Australia", city:"Melbourne", region:"Australia", minIELTS:6.5, bandNote:"6.5 overall, 6.0 each band", level:"Both", fields:"Engineering, Business, Health, Law", scholarship:"Melbourne International Scholarships + Australia Awards — partial to full remission", note:"Top-ranked AU university; generous merit awards + Australia Awards." },
  { name:"Australian National University (ANU)", country:"Australia", city:"Canberra", region:"Australia", minIELTS:6.5, bandNote:"6.5 overall, 6.0 each band", level:"Both", fields:"International Relations, Science, Public Policy", scholarship:"ANU Chancellor's International + Australia Awards — up to 50% + living support", note:"Strong research funding and dedicated international merit scholarships." },
  { name:"University of Sydney", country:"Australia", city:"Sydney", region:"Australia", minIELTS:6.5, bandNote:"6.5 overall, 6.0 each band", level:"Both", fields:"Business, Medicine, Engineering, Arts", scholarship:"Sydney Scholars Awards + VC's International Scholarships — annual grants", note:"Many automatically-considered merit scholarships." },
  { name:"UNSW Sydney", country:"Australia", city:"Sydney", region:"Australia", minIELTS:6.5, bandNote:"6.5 overall, 6.0 each band", level:"Both", fields:"Engineering, Business, Science", scholarship:"UNSW International Scholarships + Australia Awards — partial + merit", note:"Group of Eight engineering leader with multiple scholarship streams." },
  { name:"Monash University", country:"Australia", city:"Melbourne", region:"Australia", minIELTS:6.5, bandNote:"6.5 overall, 6.0 each band", level:"Both", fields:"Pharmacy, Engineering, Business, Health", scholarship:"Monash International Merit + Australia Awards — up to AUD 10,000/yr + full awards", note:"Renewable merit scholarships across most faculties." },
  { name:"University of Queensland (UQ)", country:"Australia", city:"Brisbane", region:"Australia", minIELTS:6.5, bandNote:"6.5 overall, 6.0 each band", level:"Both", fields:"Agriculture, Health, Engineering, Business", scholarship:"UQ International Scholarships + Australia Awards — fee remission + merit", note:"Generous research and UG merit awards." },
  { name:"University of Adelaide", country:"Australia", city:"Adelaide", region:"Australia", minIELTS:6.0, bandNote:"6.0 overall, 6.0 each band", level:"Both", fields:"Wine Science, Engineering, Health, Mining", scholarship:"Adelaide Global Academic Excellence + Australia Awards — up to 50% remission", note:"Lower entry threshold with substantial automatic merit awards." },
  { name:"University of Western Australia (UWA)", country:"Australia", city:"Perth", region:"Australia", minIELTS:6.5, bandNote:"6.5 overall, 6.0 each band", level:"Both", fields:"Mining, Marine Science, Business, Medicine", scholarship:"UWA Global Excellence + Australia Awards — partial reductions + merit", note:"Go8 research strength with accessible excellence scholarships." },
  { name:"University of Technology Sydney (UTS)", country:"Australia", city:"Sydney", region:"Australia", minIELTS:6.5, bandNote:"6.5 overall, 6.0 each band", level:"Both", fields:"IT, Engineering, Design, Business", scholarship:"UTS International Academic Excellence Scholarships — partial tuition", note:"Industry-focused, practical merit scholarships for internationals." },
];

// Common-App-style chance estimator
const ELITE_UNIS = new Set(["Harvard University","Yale University","Princeton University","MIT","Stanford University","Amherst College","Williams College","ETH Zürich","Sciences Po","New York University Abu Dhabi (NYUAD)"]);
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const reqStrength = (u) => ELITE_UNIS.has(u.name) ? 92 : u.minIELTS >= 7 ? 80 : u.minIELTS >= 6.5 ? 64 : u.minIELTS >= 6 ? 52 : 40;
function calcProfile({ gpa, sat, satOptional, band, activities, essays }) {
  const gpaPts = clamp01(gpa/4) * 35;
  const ieltsPts = clamp01((band-5)/4) * 15;
  const map = { low:5, medium:10, high:15 };
  const actPts = map[activities] ?? 5, essPts = map[essays] ?? 5;
  if (satOptional) return Math.round((gpaPts + ieltsPts + actPts + essPts) / 80 * 100);
  const satPts = clamp01((sat-400)/1200) * 20;
  return Math.round(gpaPts + ieltsPts + actPts + essPts + satPts);
}
function admitVerdict(u, P, band) {
  const diff = P - reqStrength(u);
  let tier = diff >= 12 ? "likely" : diff >= -8 ? "target" : "reach";
  const gap = band - u.minIELTS;
  if (gap < 0) { if (gap <= -0.5) tier = "reach"; else if (tier === "likely") tier = "target"; }
  return { tier, ieltsOk: gap >= 0 };
}
const VERDICT_META = {
  likely: { label:"✓ Likely", color:"#1E7A4F", bg:"#e2ece5", blurb:"Your profile is at or above the typical bar." },
  target: { label:"◎ Target", color:"#1A5FAD", bg:"#e5eefa", blurb:"A realistic match — competitive but achievable." },
  reach:  { label:"↗ Reach", color:"#B8620A", bg:"#fdf0e0", blurb:"Ambitious — apply, but add safer options too." },
};
const strengthLabel = (p) => p>=88?"Exceptional":p>=75?"Very strong":p>=60?"Strong":p>=45?"Solid":"Building";
const segBtn = (on, c="#1A5FAD") => ({ padding:"7px 12px", borderRadius:8, border:`2px solid ${on?c:"#e5e5e5"}`, background:on?c:"white", color:on?"white":"#0a0a0a", fontWeight:700, fontSize:12.5, cursor:"pointer", textTransform:"capitalize" });

function AdmissionsPage({ session, logout, setPage, isAdmin }) {
  const [myProgress, setMyProgress] = useState({});
  const [band, setBand] = useState(6.5);
  const [region, setRegion] = useState("All");
  const [level, setLevel] = useState("All");
  // Common App profile
  const [gpa, setGpa] = useState(3.5);
  const [satOptional, setSatOptional] = useState(true);
  const [sat, setSat] = useState(1250);
  const [activities, setActivities] = useState("medium");
  const [essays, setEssays] = useState("medium");

  useEffect(() => {
    FB.getProgress(session.email).then(p => {
      const prog = p || {}; setMyProgress(prog);
      const m = prog.__meta || {};
      const pre = (m.certificate && m.certificate.band) || m.goal;
      if (pre) setBand(pre);
    });
  }, [session.email]);

  const totalPts = Object.entries(myProgress).filter(([k]) => k !== "__meta").reduce((s,[,v]) => s+(v.points||0), 0);
  const profile = calcProfile({ gpa, sat, satOptional, band, activities, essays });

  const pool = UNIVERSITIES
    .filter(u => region === "All" || u.region === region)
    .filter(u => level === "All" || u.level === "Both" || u.level === level)
    .map(u => ({ ...u, v: admitVerdict(u, profile, band) }))
    .sort((a,b) => reqStrength(b) - reqStrength(a));
  const groups = { likely: pool.filter(u=>u.v.tier==="likely"), target: pool.filter(u=>u.v.tier==="target"), reach: pool.filter(u=>u.v.tier==="reach") };

  const Card = ({ u }) => {
    const vm = VERDICT_META[u.v.tier];
    return (
      <div style={{ background:"white", borderRadius:14, padding:"14px 16px", border:`1px solid ${vm.bg}`, borderLeft:`4px solid ${vm.color}`, boxShadow:"0 6px 18px rgba(13,37,64,.06)", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
          <span style={{ fontSize:22, lineHeight:1 }}>{REGION_FLAG[u.region] || "🎓"}</span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:800, fontSize:14, color:"#0a0a0a", lineHeight:1.3 }}>{u.name}</div>
            <div style={{ fontSize:11.5, color:"#7a8aa0", marginTop:2 }}>{u.city} · {u.country} · {u.level === "Both" ? "Bachelor & Master" : u.level}</div>
          </div>
          <span style={{ flexShrink:0, fontSize:11.5, fontWeight:800, padding:"4px 10px", borderRadius:999, background:vm.bg, color:vm.color }}>{vm.label}</span>
        </div>
        <div style={{ marginTop:10, fontSize:12.5, color:"#1f3864" }}><b>🎁 {u.scholarship}</b></div>
        <div style={{ marginTop:5, fontSize:12, color:"#475569" }}>{u.note}</div>
        <div style={{ marginTop:7, display:"flex", gap:6, flexWrap:"wrap" }}>
          <span style={chip}>{u.fields}</span>
          <span style={{ ...chip, background: u.v.ieltsOk?"#e2ece5":"#fde2df", color: u.v.ieltsOk?"#1E7A4F":"#B23A2E" }}>{u.v.ieltsOk?"✓":"⚠"} IELTS {fmtBand(u.minIELTS)}{u.v.ieltsOk?"":" — below your band"}</span>
        </div>
      </div>
    );
  };

  const Group = ({ tier }) => {
    const vm = VERDICT_META[tier];
    const list = groups[tier];
    if (!list.length) return null;
    return (
      <>
        <div style={{ display:"flex", alignItems:"center", gap:8, margin:"18px 2px 10px" }}>
          <span style={{ fontSize:15, fontWeight:800, color:vm.color }}>{vm.label} ({list.length})</span>
          <span style={{ fontSize:11, color:"#94a3b8" }}>— {vm.blurb}</span>
        </div>
        {list.map(u => <Card key={u.name} u={u} />)}
      </>
    );
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(#eaf2fb,#f6f9fd 230px,#fafafa)", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Nav session={session} logout={logout} setPage={setPage} isAdmin={isAdmin} pts={totalPts} />
      <div style={{ maxWidth:760, margin:"0 auto", padding:"18px 16px 60px" }}>
        <div style={{ position:"relative", overflow:"hidden", borderRadius:16, padding:"20px", color:"white", marginBottom:18, background:"linear-gradient(135deg,#0d2540,#1A5FAD)", boxShadow:"0 12px 30px rgba(13,37,64,.25)" }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:"#9ED9CF", marginBottom:4 }}>✈ Admissions Alley</div>
          <h2 style={{ margin:0, fontSize:19, fontWeight:800 }}>Where can you get in?</h2>
          <p style={{ margin:"4px 0 0", opacity:0.8, fontSize:12 }}>Fill your Common App profile — we estimate your chances and match scholarships abroad.</p>
        </div>

        {/* IELTS + filters */}
        <div style={{ background:"white", borderRadius:14, padding:16, border:"1px solid #e5edf7", marginBottom:14 }}>
          <label style={lblStyle}>Your IELTS band</label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
            {BAND_OPTS.map(b => (
              <button key={b} onClick={() => setBand(b)} style={segBtn(band===b)}>{fmtBand(b)}</button>
            ))}
          </div>
          <label style={lblStyle}>Region</label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
            {REGIONS.map(r => (
              <button key={r} onClick={() => setRegion(r)} style={segBtn(region===r, "#0d2540")}>{r==="All"?"🌍 All":`${REGION_FLAG[r]||""} ${r}`}</button>
            ))}
          </div>
          <label style={lblStyle}>Level</label>
          <div style={{ display:"flex", gap:6 }}>
            {["All","Bachelor","Master"].map(lv => (
              <button key={lv} onClick={() => setLevel(lv)} style={segBtn(level===lv)}>{lv}</button>
            ))}
          </div>
        </div>

        {/* Common App profile */}
        <div style={{ background:"white", borderRadius:14, padding:16, border:"1px solid #e5edf7", marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:800, color:"#0d2540", marginBottom:2 }}>📋 Common App profile</div>
          <div style={{ fontSize:11.5, color:"#94a3b8", marginBottom:14 }}>The same factors universities weigh on your application.</div>

          <div style={{ display:"flex", justifyContent:"space-between" }}><label style={lblStyle}>GPA (out of 4.0)</label><span style={{ fontWeight:800, color:"#1A5FAD" }}>{gpa.toFixed(1)}</span></div>
          <input type="range" min="0" max="4" step="0.1" value={gpa} onChange={e=>setGpa(Number(e.target.value))} style={{ width:"100%", marginBottom:6, accentColor:"#1A5FAD" }} />
          <div style={{ fontSize:10.5, color:"#aab4c4", marginBottom:14 }}>Tip: ~90–100% ≈ 4.0 · ~80–89% ≈ 3.3 · ~70–79% ≈ 2.7</div>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <label style={{ ...lblStyle, marginBottom:0 }}>SAT score</label>
            <label style={{ fontSize:12, color:"#475569", display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
              <input type="checkbox" checked={satOptional} onChange={e=>setSatOptional(e.target.checked)} /> Applying test-optional (no SAT)
            </label>
          </div>
          {!satOptional && (
            <>
              <div style={{ textAlign:"right", fontWeight:800, color:"#1A5FAD" }}>{sat}</div>
              <input type="range" min="400" max="1600" step="10" value={sat} onChange={e=>setSat(Number(e.target.value))} style={{ width:"100%", marginBottom:14, accentColor:"#1A5FAD" }} />
            </>
          )}
          {satOptional && <div style={{ height:8 }} />}

          <label style={lblStyle}>Extracurriculars & leadership</label>
          <div style={{ display:"flex", gap:6, marginBottom:14 }}>
            {["low","medium","high"].map(v => <button key={v} onClick={()=>setActivities(v)} style={segBtn(activities===v, "#1E7A4F")}>{v}</button>)}
          </div>

          <label style={lblStyle}>Essays & recommendations</label>
          <div style={{ display:"flex", gap:6 }}>
            {["low","medium","high"].map(v => <button key={v} onClick={()=>setEssays(v)} style={segBtn(essays===v, "#1E7A4F")}>{v}</button>)}
          </div>
        </div>

        {/* Profile strength meter */}
        <div style={{ background:"linear-gradient(135deg,#0d2540,#1A5FAD)", borderRadius:14, padding:"16px 18px", color:"white", marginBottom:18 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
            <span style={{ fontSize:12, opacity:0.8, fontWeight:600, letterSpacing:"0.3px" }}>YOUR PROFILE STRENGTH</span>
            <span style={{ fontSize:24, fontWeight:800 }}>{profile}<span style={{ fontSize:13, opacity:0.7 }}>/100</span></span>
          </div>
          <div style={{ marginTop:8, background:"rgba(255,255,255,0.2)", borderRadius:6, height:8 }}>
            <div style={{ width:`${profile}%`, height:8, borderRadius:6, background:"linear-gradient(90deg,#49BEB6,#9ED9CF)", transition:"width .3s" }} />
          </div>
          <div style={{ marginTop:8, fontSize:12.5 }}>
            <b>{strengthLabel(profile)}</b> profile · ✓ {groups.likely.length} likely · ◎ {groups.target.length} target · ↗ {groups.reach.length} reach
          </div>
        </div>

        <Group tier="likely" />
        <Group tier="target" />
        <Group tier="reach" />

        <div style={{ marginTop:16, fontSize:11, color:"#94a3b8", lineHeight:1.6, background:"white", borderRadius:12, padding:"12px 14px", border:"1px solid #eef2f8" }}>
          ⚠️ This is an indicative estimate, not an admissions decision. Real outcomes also depend on your major, country quotas, interviews, finances and the year's competition. IELTS minimums and scholarships change often — always confirm on each university's official website.
        </div>
      </div>
    </div>
  );
}
const chip = { fontSize:11, color:"#475569", background:"#eef4fd", borderRadius:999, padding:"3px 10px", fontWeight:600 };

// ══════════════════════════════════════════
// IELTS PSYCHOLOGIST — stress-reduction techniques
// ══════════════════════════════════════════
const PSYCH_TECHNIQUES = [
  { icon:"🌬️", title:"Box breathing (4·4·4·4)", color:"#1A5FAD",
    body:"The fastest way to calm a racing heart before or during the test. Breathe in for 4, hold for 4, out for 4, hold for 4. Repeat 4 rounds — it lowers your heart rate and clears your head.", tip:"Use the breathing circle above for 1–2 minutes before you start." },
  { icon:"😮‍💨", title:"4-7-8 calming breath", color:"#1E7A4F",
    body:"Inhale through the nose for 4, hold for 7, exhale slowly through the mouth for 8. Great the night before to fall asleep, or in the waiting room.", tip:"Do 3–4 cycles, no more — it's powerful." },
  { icon:"🖐️", title:"5-4-3-2-1 grounding", color:"#B8620A",
    body:"When panic hits, name 5 things you can see, 4 you can hear, 3 you can touch, 2 you can smell, 1 you can taste. It pulls your brain out of fear and back into the room.", tip:"Perfect just before the Speaking test." },
  { icon:"🛫", title:"Pre-flight checklist (exam day)", color:"#0d2540",
    body:"Sleep 7–8h, eat a real breakfast, arrive 30 min early, bring water and ID. Don't cram new material in the last hour — review light notes only. A calm body makes a calm mind.", tip:"Lay everything out the night before." },
  { icon:"🧭", title:"In-flight: when you get stuck", color:"#1A5FAD",
    body:"If one question freezes you, take 2 slow breaths, mark it, and move on — never let one item sink the whole test. Listening: let a missed answer go instantly and catch the next. Reading/Writing: watch the clock, not the perfect sentence.", tip:"A skipped question costs 1 mark; panic costs ten." },
  { icon:"💭", title:"Reframe the nerves", color:"#1E7A4F",
    body:"Those butterflies are energy, not danger. Swap 'I'm going to fail' for 'I've prepared, and I'll do my best.' Nervous excitement and fear feel the same in the body — tell yourself it's excitement.", tip:"Say it out loud: 'This is excitement, and I'm ready.'" },
  { icon:"📉", title:"Shrink the catastrophe", color:"#B8620A",
    body:"Ask: what's the worst that realistically happens? You retake one section. IELTS is repeatable — it's a checkpoint, not a verdict on your worth or your future.", tip:"One test does not define you." },
  { icon:"🛬", title:"After landing: let go", color:"#0d2540",
    body:"Once the pen is down, it's done — replaying it only drains you. Do something kind for yourself and rest. Reflect briefly (you already do this after each module!), then close the loop.", tip:"Reward yourself regardless of how it felt." },
];

function PsychPage({ session, logout, setPage, isAdmin }) {
  const [pts, setPts] = useState(0);
  useEffect(() => {
    FB.getProgress(session.email).then(p => {
      const prog = p || {};
      setPts(Object.entries(prog).filter(([k]) => k !== "__meta").reduce((s,[,v]) => s+(v.points||0), 0));
    });
  }, [session.email]);

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(#e7f6f3,#f2f9fb 240px,#fafafa)", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Nav session={session} logout={logout} setPage={setPage} isAdmin={isAdmin} pts={pts} />
      <style>{"@keyframes breathe{0%{transform:scale(.6)}25%{transform:scale(1)}50%{transform:scale(1)}75%{transform:scale(.6)}100%{transform:scale(.6)}}"}</style>
      <div style={{ maxWidth:760, margin:"0 auto", padding:"18px 16px 60px" }}>

        <div style={{ borderRadius:16, padding:"20px", color:"white", marginBottom:18, background:"linear-gradient(135deg,#0d4f45,#1A5FAD)", boxShadow:"0 12px 30px rgba(13,79,69,.25)" }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:"#9ED9CF", marginBottom:4 }}>🧘 IELTS Psychologist</div>
          <h2 style={{ margin:0, fontSize:19, fontWeight:800 }}>Calm mind, higher band</h2>
          <p style={{ margin:"4px 0 0", opacity:0.85, fontSize:12 }}>Stress is the #1 hidden score-killer. These techniques keep you steady before, during and after the test.</p>
        </div>

        {/* breathing widget */}
        <div style={{ background:"white", borderRadius:18, padding:"24px 16px", border:"1px solid #d9eee9", marginBottom:18, textAlign:"center", boxShadow:"0 6px 18px rgba(13,79,69,.06)" }}>
          <div style={{ fontSize:13, fontWeight:800, color:"#0d4f45", marginBottom:4 }}>Breathe with the circle</div>
          <div style={{ fontSize:11.5, color:"#7a8aa0", marginBottom:16 }}>In 4 · Hold 4 · Out 4 · Hold 4 — follow it for a minute</div>
          <div style={{ height:150, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:120, height:120, borderRadius:"50%", background:"radial-gradient(circle at 35% 30%,#9ED9CF,#1A5FAD)", boxShadow:"0 0 40px rgba(26,95,173,.4)", animation:"breathe 16s ease-in-out infinite", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:13 }}>breathe</div>
          </div>
        </div>

        {/* technique cards */}
        {PSYCH_TECHNIQUES.map(t => (
          <div key={t.title} style={{ background:"white", borderRadius:14, padding:"15px 16px", border:"1px solid #e6eef0", marginBottom:11, boxShadow:"0 4px 14px rgba(13,79,69,.05)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
              <span style={{ fontSize:22 }}>{t.icon}</span>
              <span style={{ fontWeight:800, fontSize:14.5, color:t.color }}>{t.title}</span>
            </div>
            <div style={{ fontSize:13, color:"#374151", lineHeight:1.55 }}>{t.body}</div>
            <div style={{ marginTop:9, fontSize:12, color:t.color, background:"#f4f8fb", borderRadius:8, padding:"7px 11px", fontWeight:600 }}>💡 {t.tip}</div>
          </div>
        ))}

        <div style={{ marginTop:12, fontSize:11, color:"#94a3b8", lineHeight:1.6, background:"white", borderRadius:12, padding:"12px 14px", border:"1px solid #eef2f8" }}>
          These are self-help wellbeing techniques, not medical advice. If anxiety feels overwhelming or persistent, please talk to a doctor or a qualified mental-health professional.
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// APP (main)
// ══════════════════════════════════════════
// ══════════════════════════════════════════
// SPEAKING WORLD (premium — teacher opens access)
// ══════════════════════════════════════════
const spkTime = (s) => `${Math.floor(Math.max(0,s)/60)}:${String(Math.max(0,s)%60).padStart(2,"0")}`;
const SPK_PART1 = [
  { icon:"🏙️", topic:"Hometown", qs:["Where is your hometown?","What do you like most about it?","Has it changed much in recent years?","Would you recommend it to a tourist?"], tip:"Add a reason + one small detail to every answer — never reply in a single word." },
  { icon:"💼", topic:"Work or Studies", qs:["Do you work or are you a student?","Why did you choose this field?","What is the most difficult part of it?","What would you like to do in the future?"], tip:"Use present tenses for facts and 'would like to' for future plans." },
  { icon:"🎨", topic:"Hobbies & Free time", qs:["What do you usually do in your free time?","How did you get into it?","Is it popular in your country?","Would you like to try a new hobby?"], tip:"Show enthusiasm — intonation and adjectives ('absolutely love', 'really into') lift your score." },
  { icon:"🍽️", topic:"Food", qs:["What food is popular in your country?","Do you prefer eating at home or out?","Have your eating habits changed?","Can you cook?"], tip:"Use food collocations: 'a balanced diet', 'home-cooked meal', 'grab a bite'." },
  { icon:"✈️", topic:"Travel", qs:["Do you like travelling?","What is your favourite place you've visited?","Do you prefer travelling alone or with others?","Where would you like to go next?"], tip:"Mix past ('I went…'), present opinion, and future ('I'd love to…')." },
  { icon:"📱", topic:"Technology", qs:["How often do you use your phone?","What app do you use most?","Has technology changed how you study?","Could you live without the internet?"], tip:"Great place for a conditional: 'If I didn't have my phone, I'd probably…'." },
  { icon:"⏰", topic:"Daily routine", qs:["What does a typical day look like for you?","Are you a morning or a night person?","Has your routine changed recently?","What would your ideal day be?"], tip:"Use frequency adverbs: 'usually', 'tend to', 'every now and then'." },
  { icon:"🎵", topic:"Music", qs:["What kind of music do you like?","Do you play any instrument?","Has your taste in music changed?","Do you listen while working?"], tip:"Avoid 'I like music' — be specific: genre, artist, when and why." },
];
const SPK_CUE = [
  { title:"Describe a memorable journey you have taken.", bullets:["Where you went","When and why you went there","What happened during the journey","And explain why it was memorable"], tip:"Anchor it in the past; slip in one past perfect ('I had never…')." },
  { title:"Describe a person who has influenced you.", bullets:["Who the person is","How you know them","What they did","And explain how they influenced you"], tip:"Use character adjectives + a concrete example, not just 'she is kind'." },
  { title:"Describe a skill you would like to learn.", bullets:["What the skill is","Why you want to learn it","How you would learn it","And explain how it would help you"], tip:"Perfect for modals & conditionals: 'I would', 'it could help me to…'." },
  { title:"Describe a place where you like to relax.", bullets:["Where it is","How often you go there","What you do there","And explain why it relaxes you"], tip:"Use the senses — what you see, hear, feel — for a vivid, high-band answer." },
  { title:"Describe an app or website you use a lot.", bullets:["What it is","What you use it for","How often you use it","And explain why it is useful"], tip:"Tech vocabulary: 'user-friendly', 'features', 'save time', 'on the go'." },
  { title:"Describe a goal you want to achieve.", bullets:["What the goal is","Why it matters to you","What you are doing to reach it","And explain how you'll feel when you achieve it"], tip:"Future forms: 'I'm planning to', 'I'm hoping to', 'once I've…'." },
  { title:"Describe a time you helped someone.", bullets:["Who you helped","What the situation was","What you did","And explain how you felt afterwards"], tip:"Tell it as a short story with a clear beginning, middle and end." },
  { title:"Describe something you own that is important to you.", bullets:["What it is","How you got it","How long you've had it","And explain why it matters to you"], tip:"Present perfect for duration: 'I've had it for…', 'ever since…'." },
];
const SPK_PART3 = [
  { theme:"Travel & tourism", qs:["Why do people travel more than in the past?","Does tourism benefit or harm local communities?","How might travel change in the future?"], strategy:"Give a general trend, one benefit AND one drawback, then a prediction." },
  { theme:"Technology & society", qs:["How has technology changed the way people communicate?","Are people too dependent on their phones?","Will AI create or destroy more jobs?"], strategy:"Balance both sides: 'On one hand… on the other…', then your view." },
  { theme:"Education", qs:["Should education be free for everyone?","Is it better to study alone or in a group?","How will schools look in 50 years?"], strategy:"Support each claim with a reason and a concrete example." },
  { theme:"Work & careers", qs:["Is a high salary the most important thing in a job?","Should people change careers during their life?","Will remote work replace offices?"], strategy:"Use hedging: 'it depends', 'in many cases', 'not necessarily'." },
  { theme:"Environment", qs:["Whose responsibility is it to protect the environment?","Do individuals really make a difference?","How can cities become greener?"], strategy:"Move from individual → community → government level." },
  { theme:"Culture & tradition", qs:["Why is it important to keep traditions alive?","Is globalisation a threat to local cultures?","How do festivals bring people together?"], strategy:"Contrast past and present; use 'whereas' and 'nowadays'." },
];
const SPK_PHRASES = [
  { group:"Buy thinking time", items:["That's an interesting question…","Let me think for a second…","I've never really thought about it, but…","Off the top of my head,…"] },
  { group:"Give an opinion", items:["If you ask me,…","I'd say that…","From my point of view,…","Personally, I reckon…"] },
  { group:"Extend an idea", items:["…, which means that…","for instance,…","the main reason being…","and on top of that,…"] },
  { group:"Speculate (Part 3)", items:["It could be argued that…","I suppose it's likely that…","There's a good chance that…","It really depends on…"] },
  { group:"Sound natural (Band 7+)", items:["to be honest,…","it's a bit of a mixed bag","I'm a huge fan of…","that's not really my thing"] },
];
const SPK_BANDS = [
  { crit:"Fluency & Coherence", ico:"🗣️", want:"Speak at length without long pauses and link ideas smoothly.", win:"Don't stop to fix tiny errors — keep the flow going." },
  { crit:"Lexical Resource", ico:"📚", want:"A range of vocabulary with some idioms used naturally.", win:"Learn 5 topic collocations per theme and use them." },
  { crit:"Grammatical Range", ico:"🧱", want:"A mix of simple and complex sentences across tenses.", win:"Add one conditional and one relative clause per answer." },
  { crit:"Pronunciation", ico:"🔊", want:"Clear speech with natural stress and intonation.", win:"Stress the content words; vary your tone to avoid sounding flat." },
];

// Band-level speaking guidance. 6.0–6.5 are open; 7.0+ is premium (IELTS8 students only).
const SPK_LEVELS = [
  { band:"6.0", ico:"🟢", tag:"Competent",  open:true,  focus:"Keep talking with only occasional hesitation; connect ideas with and / but / because / so.", model:"Give a reason for every answer: \"I usually… because…\"." },
  { band:"6.5", ico:"🔵", tag:"Competent +", open:true, focus:"Extend each answer with an example and an opinion; add a few complex sentences.", model:"\"For instance, last year I…\" + \"In my opinion…\"." },
  { band:"7.0", ico:"🟣", tag:"Good",        open:false, focus:"Speak fluently at length, use less common vocabulary and idioms, self-correct smoothly.", model:"Topic collocations + one natural idiom per answer, with clear intonation." },
  { band:"7.5", ico:"🟠", tag:"Good +",      open:false, focus:"Flexible use of complex structures and precise word choice; only occasional slips.", model:"Hedging (\"I'd say…\", \"It depends on…\") + conditionals and relative clauses." },
  { band:"8.0", ico:"🔴", tag:"Very good",   open:false, focus:"Fully coherent, wide idiomatic range, effortless pronunciation, stress and rhythm.", model:"Nuanced opinions, paraphrase on the fly, natural emphasis on key words." },
];

function SpeakingWorld({ session, logout, setPage, isAdmin }) {
  const [access, setAccess] = useState(null); // null = checking
  const [pts, setPts] = useState(0);
  const [tab, setTab] = useState("part1");
  // Part 2 practice
  const [cueIdx, setCueIdx] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | prep | talk | done
  const [sec, setSec] = useState(0);

  useEffect(() => {
    FB.getProgress(session.email).then(p => {
      const prog = p || {};
      setPts(Object.entries(prog).filter(([k]) => k !== "__meta").reduce((s,[,v]) => s+(v.points||0), 0));
    }).catch(()=>{});
    if (isAdmin || hasFullAccess(session.email)) { setAccess(true); return; }
    FB.getStudent(session.email).then(s => setAccess(!!(s && s.speaking))).catch(() => setAccess(false));
  }, [session.email, isAdmin]);

  useEffect(() => {
    if (phase !== "prep" && phase !== "talk") return;
    if (sec <= 0) { if (phase === "prep") { setPhase("talk"); setSec(120); } else { setPhase("done"); } return; }
    const id = setTimeout(() => setSec(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, sec]);

  const startCue = () => { setPhase("prep"); setSec(60); };
  const resetCue = () => { setPhase("idle"); setSec(0); };
  const newCue = () => { setCueIdx(i => (i + 1) % SPK_CUE.length); resetCue(); };
  const cue = SPK_CUE[cueIdx];

  // ── checking ──
  if (access === null) {
    return <div style={{ minHeight:"100vh", background:"#0d2540", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontFamily:"sans-serif" }}>Checking access…</div>;
  }

  // Open preview: everyone sees Speaking World; only Band 7.0+ is gated for IELTS8 students
  // (admin, full-access, or granted Speaking access).
  const isIelts8 = isAdmin || hasFullAccess(session.email) || access === true;
  const TABS = [["part1","Part 1 · Interview"],["part2","Part 2 · Cue card"],["part3","Part 3 · Discussion"],["phrases","Phrases"],["bands","Band criteria"]];

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(#eaf2fb,#f6f9fd 240px,#fafafa)", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Nav session={session} logout={logout} setPage={setPage} isAdmin={isAdmin} pts={pts} />
      <div style={{ maxWidth:760, margin:"0 auto", padding:"18px 16px 60px" }}>
        <div style={{ position:"relative", overflow:"hidden", borderRadius:18, padding:"22px 20px", color:"white", marginBottom:16, background:"linear-gradient(135deg,#070d18,#0d2540 55%,#1A5FAD 135%)", boxShadow:"0 14px 34px rgba(13,37,64,.28)" }}>
          <div style={{ position:"absolute", top:12, right:16, fontSize:30, opacity:0.18 }}>🛫</div>
          <div style={{ fontSize:11, fontWeight:800, letterSpacing:"1.6px", textTransform:"uppercase", color:"#e8b923" }}>Premium · Departure lounge</div>
          <h2 style={{ margin:"3px 0 4px", fontSize:22, fontWeight:800 }}>🎤 Speaking World</h2>
          <p style={{ margin:0, opacity:0.82, fontSize:13 }}>Everything for IELTS Speaking Parts 1–3 — practise, time yourself, and speak like a Band 7+.</p>
        </div>

        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
          {TABS.map(([k,label]) => (
            <button key={k} onClick={() => setTab(k)} style={{ padding:"8px 13px", borderRadius:999, border:`1.5px solid ${tab===k?"#1A5FAD":"#dbe6f3"}`, background:tab===k?"#1A5FAD":"white", color:tab===k?"white":"#0d2540", fontWeight:700, fontSize:12.5, cursor:"pointer" }}>{label}</button>
          ))}
        </div>

        {tab==="part1" && SPK_PART1.map(t => (
          <div key={t.topic} style={{ background:"white", borderRadius:16, padding:"16px 18px", border:"1px solid #e5edf7", boxShadow:"0 6px 16px rgba(13,37,64,.05)", marginBottom:12 }}>
            <div style={{ fontSize:16, fontWeight:800, color:"#0d2540" }}>{t.icon} {t.topic}</div>
            <ul style={{ margin:"10px 0 0", paddingLeft:20, color:"#334155", fontSize:14, lineHeight:1.8 }}>{t.qs.map((q,i)=><li key={i}>{q}</li>)}</ul>
            <div style={{ marginTop:10, fontSize:12.5, color:"#8a5a12", background:"#fff7e6", borderRadius:10, padding:"9px 12px" }}>💡 {t.tip}</div>
          </div>
        ))}

        {tab==="part2" && (
          <div>
            <div style={{ background:"white", borderRadius:16, padding:"18px", border:"1px solid #e5edf7", boxShadow:"0 8px 22px rgba(13,37,64,.08)", marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:"1px", textTransform:"uppercase", color:"#1A5FAD" }}>Cue card</div>
              <div style={{ fontSize:18, fontWeight:800, color:"#0d2540", margin:"4px 0 10px" }}>{cue.title}</div>
              <div style={{ fontSize:13, color:"#64748b", marginBottom:6 }}>You should say:</div>
              <ul style={{ margin:0, paddingLeft:20, color:"#334155", fontSize:14, lineHeight:1.8 }}>{cue.bullets.map((b,i)=><li key={i}>{b}</li>)}</ul>
              <div style={{ marginTop:12, fontSize:12.5, color:"#8a5a12", background:"#fff7e6", borderRadius:10, padding:"9px 12px" }}>💡 {cue.tip}</div>

              <div style={{ marginTop:16, textAlign:"center", background:"#0d2540", borderRadius:14, padding:"16px", color:"white" }}>
                <div style={{ fontSize:12, opacity:0.7, letterSpacing:"0.5px", textTransform:"uppercase" }}>
                  {phase==="idle" && "Ready when you are"}
                  {phase==="prep" && "⏳ Preparation — make notes"}
                  {phase==="talk" && "🎙️ Speak now — keep going!"}
                  {phase==="done" && "✅ Time! Well done"}
                </div>
                {(phase==="prep"||phase==="talk") && <div style={{ fontSize:44, fontWeight:800, fontVariantNumeric:"tabular-nums", color: phase==="talk"?"#e8b923":"#9ED9CF" }}>{spkTime(sec)}</div>}
                {phase==="idle" && <div style={{ fontSize:13, opacity:0.8, margin:"6px 0 12px" }}>1 min to prepare · 2 min to talk</div>}
                {phase==="done" && <div style={{ fontSize:13, opacity:0.85, margin:"6px 0 12px" }}>Rate your fluency, vocab, grammar & pronunciation — then try another card.</div>}
                <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginTop:10 }}>
                  {phase==="idle" && <button onClick={startCue} style={spkBtn("#e8b923","#3a2a00")}>▶ Start (1 min prep)</button>}
                  {phase==="prep" && <button onClick={()=>{setPhase("talk");setSec(120);}} style={spkBtn("#e8b923","#3a2a00")}>Skip to talk →</button>}
                  {(phase==="prep"||phase==="talk") && <button onClick={resetCue} style={spkBtn("rgba(255,255,255,0.15)","white")}>Stop</button>}
                  <button onClick={newCue} style={spkBtn("rgba(255,255,255,0.15)","white")}>↻ New card</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==="part3" && SPK_PART3.map(t => (
          <div key={t.theme} style={{ background:"white", borderRadius:16, padding:"16px 18px", border:"1px solid #e5edf7", boxShadow:"0 6px 16px rgba(13,37,64,.05)", marginBottom:12 }}>
            <div style={{ fontSize:16, fontWeight:800, color:"#0d2540" }}>{t.theme}</div>
            <ul style={{ margin:"10px 0 0", paddingLeft:20, color:"#334155", fontSize:14, lineHeight:1.8 }}>{t.qs.map((q,i)=><li key={i}>{q}</li>)}</ul>
            <div style={{ marginTop:10, fontSize:12.5, color:"#0d4f45", background:"#e2ece5", borderRadius:10, padding:"9px 12px" }}>🎯 Strategy: {t.strategy}</div>
          </div>
        ))}

        {tab==="phrases" && SPK_PHRASES.map(g => (
          <div key={g.group} style={{ background:"white", borderRadius:16, padding:"16px 18px", border:"1px solid #e5edf7", boxShadow:"0 6px 16px rgba(13,37,64,.05)", marginBottom:12 }}>
            <div style={{ fontSize:14, fontWeight:800, color:"#1A5FAD", marginBottom:10 }}>{g.group}</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{g.items.map((p,i)=><span key={i} style={{ background:"#eef4fd", color:"#0d2540", borderRadius:999, padding:"6px 13px", fontSize:13, fontWeight:500 }}>{p}</span>)}</div>
          </div>
        ))}

        {tab==="bands" && (
          <div style={{ display:"grid", gap:12 }}>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:"1px", textTransform:"uppercase", color:"#1A5FAD", marginBottom:2 }}>Target by band</div>
            {SPK_LEVELS.map(lv => {
              const locked = !lv.open && !isIelts8;
              return (
                <div key={lv.band} style={{ position:"relative", overflow:"hidden", background:"white", borderRadius:16, padding:"16px 18px", border:`1px solid ${locked ? "#f0d6b0" : "#e5edf7"}`, boxShadow:"0 6px 16px rgba(13,37,64,.05)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <div style={{ fontSize:16, fontWeight:800, color:"#0d2540" }}>{lv.ico} Band {lv.band}</div>
                    <span style={{ fontSize:11, fontWeight:800, color:"#64748b" }}>· {lv.tag}</span>
                    {!lv.open && (
                      <span style={{ marginLeft:"auto", fontSize:10.5, fontWeight:800, letterSpacing:"0.5px", textTransform:"uppercase", color:"#8a5a12", background:"#fff7e6", border:"1px solid #f0d6b0", borderRadius:999, padding:"2px 9px" }}>{locked ? "🔒 7.0+" : "✦ 7.0+"}</span>
                    )}
                  </div>
                  {locked ? (
                    <div style={{ marginTop:12, fontSize:13.5, color:"#8a5a12", background:"#fff7e6", borderRadius:10, padding:"12px 14px", lineHeight:1.6 }}>
                      <b>🔒 Available for students learning at IELTS8.</b><br/>
                      Band 7.0+ Speaking coaching — advanced fluency, idioms and pronunciation — unlocks when you join the IELTS8 course.
                    </div>
                  ) : (
                    <>
                      <div style={{ marginTop:8, fontSize:13.5, color:"#334155" }}><b style={{ color:"#1E7A4F" }}>Focus:</b> {lv.focus}</div>
                      <div style={{ marginTop:6, fontSize:13.5, color:"#334155" }}><b style={{ color:"#B8620A" }}>Model:</b> {lv.model}</div>
                    </>
                  )}
                </div>
              );
            })}

            <div style={{ fontSize:11, fontWeight:800, letterSpacing:"1px", textTransform:"uppercase", color:"#1A5FAD", margin:"6px 0 2px" }}>The 4 marking criteria</div>
            {SPK_BANDS.map(b => (
              <div key={b.crit} style={{ background:"white", borderRadius:16, padding:"16px 18px", border:"1px solid #e5edf7", boxShadow:"0 6px 16px rgba(13,37,64,.05)" }}>
                <div style={{ fontSize:16, fontWeight:800, color:"#0d2540" }}>{b.ico} {b.crit}</div>
                <div style={{ marginTop:8, fontSize:13.5, color:"#334155" }}><b style={{ color:"#1E7A4F" }}>Examiner wants:</b> {b.want}</div>
                <div style={{ marginTop:6, fontSize:13.5, color:"#334155" }}><b style={{ color:"#B8620A" }}>Quick win:</b> {b.win}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
const spkBtn = (bg,c) => ({ padding:"9px 15px", borderRadius:999, border:"none", background:bg, color:c, fontWeight:800, fontSize:13, cursor:"pointer" });

export default function App() {
  const [session, setSession] = useState(getSession);
  const [page, setPage] = useState("course");
  const [currentLesson, setCurrentLesson] = useState(null);
  const [modules, setModules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const mods = await FB.getModules();
        setModules(mods || INITIAL_MODULES);
      } catch (e) {
        setModules(INITIAL_MODULES);
      }
      setLoading(false);
    };
    load();
  }, []);

  // Single source of truth for who's logged in: Firebase Auth.
  // Verifies access on every load/refresh, so revoked students are kicked out.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { saveSession(null); setSession(null); setAuthLoading(false); return; }
      try {
        const s = await resolveSession(user);
        saveSession(s); setSession(s); setAuthError("");
      } catch (e) {
        saveSession(null); setSession(null);
        setAuthError(
          e.message === "no-access" ? "No access. Ask your teacher to add your email." :
          e.message === "revoked" ? "Your access has been revoked. Contact your teacher." :
          "Sign-in error. Please try again."
        );
        await signOut(auth);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const logout = () => { setPage("course"); signOut(auth); };

  const refreshModules = async () => {
    const mods = await FB.getModules();
    const result = mods || INITIAL_MODULES;
    setModules(result);
    if (currentLesson) {
      const updated = result.flatMap(m => m.lessons).find(l => l.id === currentLesson.id);
      if (updated) setCurrentLesson({...updated});
    }
  };

  if (loading || authLoading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#0a0a0a,#0a0a0a)", fontFamily:"sans-serif" }}>
      <div style={{ color:"white", textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>Loading...</div>
      </div>
    </div>
  );

  if (!session) return <Login authError={authError} />;

  const isAdmin = session.email === ADMIN_EMAIL;

  if (page === "admin" && isAdmin) return <AdminPanel session={session} logout={logout} setPage={setPage} />;
  if (page === "admissions") return <AdmissionsPage session={session} logout={logout} setPage={setPage} isAdmin={isAdmin} />;
  if (page === "psych") return <PsychPage session={session} logout={logout} setPage={setPage} isAdmin={isAdmin} />;
  if (page === "speaking") return <SpeakingWorld session={session} logout={logout} setPage={setPage} isAdmin={isAdmin} />;
  if (page === "leaderboard") return <Leaderboard session={session} setPage={setPage} />;
  if (page === "dashboard") return <Dashboard session={session} setPage={setPage} modules={modules} />;
  if (page === "lesson" && currentLesson) return <LessonPage lesson={currentLesson} session={session} setPage={setPage} setCurrentLesson={setCurrentLesson} isAdmin={isAdmin} refreshModules={refreshModules} modules={modules} />;
  if (page === "quiz" && currentLesson) return <QuizPage lesson={currentLesson} session={session} setPage={setPage} />;
  if (page === "assignment" && currentLesson) return <AssignmentPage lesson={currentLesson} session={session} setPage={setPage} />;

  return <CoursePage session={session} logout={logout} setPage={setPage} setCurrentLesson={setCurrentLesson} isAdmin={isAdmin} modules={modules} />;
}

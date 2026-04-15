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

/// ─── UPDATED INITIAL_MODULES ───
// Replace the existing INITIAL_MODULES constant in src/App.js with this block.
// Covers 24 lessons + 5 Mock Tests across 5 modules, matching the screenshot structure.

const INITIAL_MODULES = [
  // ──────────────────────────────────────────────
  // MODULE 1: LISTENING & READING FOUNDATIONS
  // ──────────────────────────────────────────────
  {
    id: 1, title: "MODULE 1: LISTENING & READING FOUNDATIONS", color: "#0891b2", bg: "#e0f7fa",
    lessons: [
      {
        id: "1-1", n: 1,
        title: "Listening — MCQ & Matching Information | Present Simple vs Present Continuous",
        tag: "Listening", materials: [],
        quiz: { questions: [
          { type: "mc", q: "In IELTS Listening, 'Multiple Choice' questions test your ability to:", options: ["Copy exactly what you hear","Identify the correct answer from three options","Write a full sentence","Spell words correctly"], answer: 1, points: 10 },
          { type: "mc", q: "Which sentence uses Present Continuous correctly?", options: ["She study every night.","She is studying right now.","She studys at the moment.","She study at the moment."], answer: 1, points: 10 },
          { type: "tf", q: "Present Simple is used for habits and routines.", answer: true, points: 10 },
          { type: "fitb", q: "Water _______ at 100°C. (boil)", answer: "boils", points: 10 },
          { type: "fitb", q: "Listen carefully — in matching tasks you match a speaker to a _______.", answer: "topic", points: 10 },
        ]},
        assignment: { type: "writing", prompt: "Write 8 sentences about your daily routine using Present Simple, and 5 sentences about what is happening right now using Present Continuous." }
      },
      {
        id: "1-2", n: 2,
        title: "Reading — True/False/Not Given, MCQ, Short Answer | Articles",
        tag: "Reading", materials: [],
        quiz: { questions: [
          { type: "mc", q: "What does 'Not Given' mean in IELTS Reading?", options: ["The statement is false","The text does not mention it","The statement is true","The writer disagrees"], answer: 1, points: 10 },
          { type: "mc", q: "Choose the correct article: '_____ Eiffel Tower is in Paris.'", options: ["A","An","The","No article"], answer: 2, points: 10 },
          { type: "tf", q: "'False' and 'Not Given' mean exactly the same thing.", answer: false, points: 10 },
          { type: "fitb", q: "In Short Answer questions, you must not exceed the _______ word limit given.", answer: "specified", points: 10 },
          { type: "mc", q: "Which article is used before an uncountable noun used in general?", options: ["A","An","The","No article"], answer: 3, points: 10 },
        ]},
        assignment: { type: "writing", prompt: "Read any English news article. Write 5 True/False/Not Given statements about it (with answers) and use 'a', 'an', 'the' correctly in 6 example sentences." }
      },
      {
        id: "1-3", n: 3,
        title: "Writing Task 1 — Line Graph | Past Simple vs Past Continuous",
        tag: "Writing", materials: [],
        quiz: { questions: [
          { type: "mc", q: "A line graph Task 1 MUST include:", options: ["Your opinion","An overview of the main trends","A conclusion recommending action","Personal experience"], answer: 1, points: 10 },
          { type: "mc", q: "Which sentence is Past Continuous?", options: ["She visited London.","She was visiting London when it started raining.","She visits London often.","She has visited London."], answer: 1, points: 10 },
          { type: "tf", q: "You should write at least 150 words for Task 1.", answer: true, points: 10 },
          { type: "fitb", q: "The Past Simple is used for a _______ completed action in the past.", answer: "finished", points: 10 },
        ]},
        assignment: { type: "essay", prompt: "IELTS Writing Task 1: The line graph below shows the percentage of people using the internet in three countries (UK, Kazakhstan, Japan) from 2000 to 2020.\nUK: 25% → 96%, Kazakhstan: 2% → 79%, Japan: 30% → 93%.\nSummarise the main features and make comparisons where relevant. Write at least 150 words.\nAlso write 4 original sentences using Past Simple and Past Continuous together." }
      },
      {
        id: "1-4", n: 4,
        title: "Writing Task 2 — Advantages/Disadvantages Essay | Grammar Review",
        tag: "Writing", materials: [],
        quiz: { questions: [
          { type: "mc", q: "An Advantages/Disadvantages essay typically has:", options: ["Only advantages","Only disadvantages","Both, with a clear structure","Your personal story"], answer: 2, points: 10 },
          { type: "fitb", q: "Task 2 requires a minimum of _______ words.", answer: "250", points: 10 },
          { type: "tf", q: "You must state your opinion in an Advantages/Disadvantages essay.", answer: false, points: 10 },
          { type: "mc", q: "Which linker introduces a disadvantage?", options: ["Furthermore","In addition","However","Similarly"], answer: 2, points: 10 },
        ]},
        assignment: { type: "essay", prompt: "IELTS Writing Task 2: Some people think that the advantages of living in a big city outweigh the disadvantages. To what extent do you agree or disagree?\nWrite at least 250 words with an introduction, two body paragraphs (advantages & disadvantages), and a conclusion." }
      },
      {
        id: "1-5", n: 5,
        title: "Speaking Part 1 — Fluency | Comparative and Superlative",
        tag: "Speaking", materials: [],
        quiz: { questions: [
          { type: "mc", q: "What is the superlative form of 'good'?", options: ["Gooder","More good","The best","Better"], answer: 2, points: 10 },
          { type: "mc", q: "In Speaking Part 1, answers should be:", options: ["One word","10+ sentences","2–4 sentences with a reason","Read from notes"], answer: 2, points: 10 },
          { type: "tf", q: "You can ask the examiner to repeat a question in Part 1.", answer: true, points: 10 },
          { type: "fitb", q: "Kazakhstan is _______ (large) country in Central Asia.", answer: "the largest", points: 10 },
        ]},
        assignment: { type: "speaking", prompt: "Record yourself (2–3 min) answering:\n1. Describe your hometown. Is it bigger or smaller than the capital?\n2. What is the most interesting place you have ever visited? Why was it better than other places?\n3. Compare studying alone vs studying in a group.\n\nPaste a recording link or write your answers (min. 150 words)." }
      },
      {
        id: "mock-1", n: null,
        title: "MOCK TEST 1",
        tag: "Mock", materials: [],
        quiz: { questions: [
          { type: "mc", q: "Which of these is a correct use of the Present Continuous?", options: ["I am go to school.","She is knowing the answer.","They are playing football now.","He is having a car."], answer: 2, points: 10 },
          { type: "mc", q: "What does 'Not Given' mean in IELTS Reading T/F/NG?", options: ["False","Cannot be determined from the text","True but implied","The question is wrong"], answer: 1, points: 10 },
          { type: "tf", q: "The superlative of 'bad' is 'baddest'.", answer: false, points: 10 },
          { type: "fitb", q: "The minimum word count for Writing Task 1 is ___.", answer: "150", points: 10 },
          { type: "match", q: "Match the task to its minimum word count", pairs: [["Task 1","150 words"],["Task 2","250 words"]], points: 20 },
          { type: "mc", q: "Which sentence uses Past Continuous correctly?", options: ["She was study when I called.","She were studying when I called.","She was studying when I called.","She studying when I called."], answer: 2, points: 10 },
          { type: "fitb", q: "In Advantages/Disadvantages essays, both sides must be _______ fairly.", answer: "discussed", points: 10 },
          { type: "tf", q: "In IELTS Listening, you hear the recording only once.", answer: true, points: 10 },
        ]},
        assignment: { type: "essay", prompt: "MOCK ESSAY — Task 2: Some people believe that technology is making people less social. Others argue it helps them connect better. Discuss both views and give your own opinion. Write at least 250 words." }
      },
    ]
  },

  // ──────────────────────────────────────────────
  // MODULE 2: LISTENING ADVANCED & WRITING
  // ──────────────────────────────────────────────
  {
    id: 2, title: "MODULE 2: LISTENING ADVANCED & WRITING", color: "#16a34a", bg: "#e6f4ea",
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
        tag: "Writing", materials: [],
        quiz: { questions: [
          { type: "mc", q: "When describing a pie chart, what is most important to highlight?", options: ["Every percentage","The largest and smallest segments","Your opinion","Future predictions"], answer: 1, points: 10 },
          { type: "tf", q: "You should always compare figures in Task 1 descriptions.", answer: true, points: 10 },
          { type: "fitb", q: "The phrase 'account for' is used to describe a _______ of a total.", answer: "proportion", points: 10 },
          { type: "mc", q: "Which phrase is best for describing a large bar chart category?", options: ["It was small","The majority of…","Slightly more than…","Roughly less than…"], answer: 1, points: 10 },
        ]},
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
    id: 3, title: "MODULE 3: WRITING TASKS & CONDITIONALS", color: "#ca8a04", bg: "#fff8e1",
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
    id: 4, title: "MODULE 4: READING SKILLS & CONDITIONALS", color: "#9334E6", bg: "#f3e8ff",
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
    id: 5, title: "MODULE 5: ADVANCED SKILLS & FINAL PREP", color: "#EA4335", bg: "#fce8e6",
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
      if (!student) { setErr("No access. Ask your teacher to add your email."); setLoading(false); return; }
      if (student.status === "revoked") { setErr("Your access has been revoked. Contact your teacher."); setLoading(false); return; }
      await FB.updateStudent(e, { lastLogin: new Date().toISOString() });
      login({ email: e, role: "student", name: student.name });
    } catch(loginErr) {
      setErr("Connection error. Please try again."); setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1a73e8,#9334E6)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"sans-serif" }}>
      <div style={{ background:"white", borderRadius:20, padding:44, width:380, boxShadow:"0 8px 40px rgba(0,0,0,0.2)" }}>
        <div style={{ textAlign:"center", marginBottom:30 }}>
          <div style={{ fontSize:48, marginBottom:10 }}>🎯</div>
          <h2 style={{ margin:0, color:"#1e293b", fontSize:24 }}>IELTS 8.0 Course</h2>
          <p style={{ color:"#64748b", margin:"8px 0 0", fontSize:14 }}>Enter your email to access</p>
        </div>
        <input type="email" placeholder="your@email.com" value={email}
          onChange={e => { setEmail(e.target.value); setErr(""); }}
          onKeyDown={e => e.key === "Enter" && go()}
          style={{ width:"100%", padding:"13px 16px", borderRadius:12, border:"2px solid #e2e8f0", fontSize:15, boxSizing:"border-box" }} />
        {err && <p style={{ color:"#dc2626", fontSize:13, margin:"8px 0 0" }}>{err}</p>}
        <button onClick={go} disabled={loading} style={{ width:"100%", marginTop:16, padding:14, borderRadius:12, border:"none", background:"linear-gradient(135deg,#1a73e8,#9334E6)", color:"white", fontSize:15, fontWeight:700, cursor:"pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Checking..." : "Enter"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// NAV
// ══════════════════════════════════════════
const nb = (bg,c) => ({ padding:"6px 12px", borderRadius:20, border:"none", background:bg, color:c, cursor:"pointer", fontSize:12, fontWeight:600 });

function Nav({ session, logout, setPage, isAdmin, pts }) {
  return (
    <div style={{ background:"white", borderBottom:"1px solid #e2e8f0", padding:"10px 20px", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", position:"sticky", top:0, zIndex:100 }}>
      <div style={{ fontWeight:800, fontSize:16, color:"#1a73e8", cursor:"pointer" }} onClick={() => setPage("course")}>IELTS 6.0</div>
      <div style={{ flex:1 }} />
      <button onClick={() => setPage("course")} style={nb("#e8f0fe","#1a73e8")}>Course</button>
      <button onClick={() => setPage("dashboard")} style={nb("#f3e8ff","#9334E6")}>Progress</button>
      <button onClick={() => setPage("leaderboard")} style={nb("#fff8e1","#ca8a04")}>Board</button>
      {isAdmin && <button onClick={() => setPage("admin")} style={nb("#fce8e6","#dc2626")}>Admin</button>}
      <div style={{ background:"#e6f4ea", borderRadius:20, padding:"4px 12px", fontSize:13, fontWeight:700, color:"#16a34a" }}>{pts} pts</div>
      <button onClick={logout} style={{ padding:"5px 12px", borderRadius:8, border:"1px solid #e2e8f0", background:"white", cursor:"pointer", fontSize:12, color:"#64748b" }}>Logout</button>
    </div>
  );
}

// ══════════════════════════════════════════
// COURSE PAGE
// ══════════════════════════════════════════
function CoursePage({ session, logout, setPage, setCurrentLesson, isAdmin, modules }) {
  const [myProgress, setMyProgress] = useState({});

  useEffect(() => { FB.getProgress(session.email).then(setMyProgress); }, [session.email]);

  const totalPts = Object.values(myProgress).reduce((s,v) => s+(v.points||0), 0);
  const allLessons = (modules||[]).flatMap(m => m.lessons);
  const done = allLessons.filter(l => myProgress[l.id]?.quizDone).length;

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"sans-serif" }}>
      <Nav session={session} logout={logout} setPage={setPage} isAdmin={isAdmin} pts={totalPts} />
      <div style={{ maxWidth:780, margin:"0 auto", padding:20 }}>
        <div style={{ background:"linear-gradient(135deg,#1a73e8,#9334E6)", borderRadius:16, padding:"24px 28px", color:"white", marginBottom:24 }}>
          <h2 style={{ margin:0, fontSize:22 }}>Welcome back, {session.name}!</h2>
          <p style={{ margin:"8px 0 16px", opacity:0.9 }}>B1 to IELTS 6.0 - {allLessons.length} lessons</p>
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
                    {lp.quizDone ? "v" : l.n}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:"#1e293b" }}>{l.title}</div>
                    <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>
                      {(l.materials||[]).length} materials - {l.quiz.questions.length} questions
                      {lp.points ? ` - ${lp.points} pts` : ""}
                    </div>
                  </div>
                  <span style={{ fontSize:11, padding:"3px 10px", borderRadius:10, background:TC[l.tag]||"#94a3b8", color:"white", fontWeight:600 }}>{l.tag}</span>
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
  const [materials, setMaterials] = useState(lesson.materials || []);

  useEffect(() => {
    FB.getLessonMaterials(lesson.id).then(mats => { setMaterials(mats || []); });
  }, [lesson.id]);

  useEffect(() => { FB.getProgress(session.email).then(setMyProgress); }, [session.email]);

  const lp = myProgress[lesson.id] || {};

  const saveMaterial = async () => {
    if (!addUrl || !addTitle) return;
    setSaving(true);
    try {
      const current = await FB.getLessonMaterials(lesson.id);
      const newMat = { type: addType, url: addUrl, title: addTitle, id: Date.now() };
      const updated = [...(current || []), newMat];
      await FB.setLessonMaterials(lesson.id, updated);
      setMaterials(updated);
      setAddUrl(""); setAddTitle("");
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

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"sans-serif" }}>
      <div style={{ background:"white", borderBottom:"1px solid #e2e8f0", padding:"12px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={() => setPage("course")} style={{ padding:"6px 12px", borderRadius:8, border:"none", background:"#e8f0fe", color:"#1a73e8", cursor:"pointer", fontWeight:600 }}>Back</button>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:15, color:"#1e293b" }}>Lesson {lesson.n}: {lesson.title}</div>
          <div style={{ fontSize:12, color:"#94a3b8" }}>{lp.points ? `${lp.points} pts earned` : "Not completed yet"}</div>
        </div>
        <span style={{ fontSize:11, padding:"4px 12px", borderRadius:10, background:TC[lesson.tag]||"#94a3b8", color:"white", fontWeight:600 }}>{lesson.tag}</span>
      </div>
      <div style={{ maxWidth:760, margin:"0 auto", padding:20 }}>
        <div style={{ display:"flex", gap:4, marginBottom:20, background:"white", borderRadius:12, padding:6, border:"1px solid #e2e8f0" }}>
          {["materials","quiz","assignment"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:"9px", borderRadius:9, border:"none", cursor:"pointer", fontWeight:600, fontSize:13, background:tab===t?"#1a73e8":"transparent", color:tab===t?"white":"#64748b" }}>
              {t==="materials"?"Materials":t==="quiz"?"Quiz":"Assignment"}
            </button>
          ))}
        </div>

        {tab==="materials" && (
          <div>
            {isAdmin && (
              <div style={{ background:"white", borderRadius:14, padding:20, marginBottom:16, border:"1px solid #e2e8f0" }}>
                <div style={{ fontWeight:700, marginBottom:12 }}>Add Material</div>
                <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap" }}>
                  {["link","video","presentation","pdf"].map(t => (
                    <button key={t} onClick={() => setAddType(t)} style={{ padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:addType===t?"#1a73e8":"#e2e8f0", color:addType===t?"white":"#475569" }}>
                      {t==="link"?"Link":t==="video"?"Video":t==="presentation"?"Slides":"PDF"}
                    </button>
                  ))}
                </div>
                <input placeholder="Title" value={addTitle} onChange={e=>setAddTitle(e.target.value)}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"2px solid #e2e8f0", fontSize:14, boxSizing:"border-box", marginBottom:8 }} />
                <input placeholder="URL" value={addUrl} onChange={e=>setAddUrl(e.target.value)}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"2px solid #e2e8f0", fontSize:14, boxSizing:"border-box", marginBottom:8 }} />
                <button onClick={saveMaterial} disabled={saving} style={{ padding:"10px 24px", borderRadius:8, border:"none", background:"#34A853", color:"white", fontWeight:700, cursor:"pointer", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Saving..." : "Add"}
                </button>
              </div>
            )}
            {materials.length === 0 ? (
              <div style={{ textAlign:"center", padding:40, color:"#94a3b8", background:"white", borderRadius:14, border:"2px dashed #e2e8f0" }}>
                {isAdmin ? "No materials yet. Add above!" : "No materials yet. Check back soon!"}
              </div>
            ) : (
              materials.map(mat => (
                <div key={mat.id} style={{ background:"white", borderRadius:12, padding:16, marginBottom:12, border:"1px solid #e2e8f0" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, color:"#1e293b" }}>{mat.title}</div>
                      <div style={{ fontSize:12, color:"#94a3b8" }}>{mat.type}</div>
                    </div>
                    <a href={mat.url} target="_blank" rel="noreferrer" style={{ padding:"7px 14px", borderRadius:8, background:"#e8f0fe", color:"#1a73e8", textDecoration:"none", fontSize:13, fontWeight:600 }}>Open</a>
                    {isAdmin && <button onClick={() => deleteMaterial(mat.id)} style={{ padding:"7px 10px", borderRadius:8, border:"none", background:"#fce8e6", color:"#dc2626", cursor:"pointer" }}>Del</button>}
                  </div>
                  {mat.type==="video" && mat.url && mat.url.includes("youtube") && (
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

        {tab==="quiz" && (
          <div>
            <div style={{ background:"linear-gradient(135deg,#1a73e8,#0891b2)", borderRadius:14, padding:20, color:"white", marginBottom:16 }}>
              <div style={{ fontSize:18, fontWeight:700 }}>Quiz: {lesson.title}</div>
              <div style={{ fontSize:13, opacity:0.9, marginTop:4 }}>{lesson.quiz.questions.length} questions</div>
              {lp.quizDone && <div style={{ marginTop:8, background:"rgba(255,255,255,0.2)", borderRadius:8, padding:"6px 12px", fontSize:13 }}>You scored {lp.quizScore} pts</div>}
            </div>
            <button onClick={() => setPage("quiz")} style={{ width:"100%", padding:16, borderRadius:12, border:"none", background:lp.quizDone?"#e2e8f0":"linear-gradient(135deg,#1a73e8,#9334E6)", color:lp.quizDone?"#64748b":"white", fontWeight:700, fontSize:16, cursor:"pointer" }}>
              {lp.quizDone?"Retake Quiz":"Start Quiz"}
            </button>
          </div>
        )}

        {tab==="assignment" && (
          <div>
            <div style={{ background:"linear-gradient(135deg,#EA4335,#FBBC04)", borderRadius:14, padding:20, color:"white", marginBottom:16 }}>
              <div style={{ fontSize:18, fontWeight:700 }}>Assignment</div>
            </div>
            <button onClick={() => setPage("assignment")} style={{ width:"100%", padding:16, borderRadius:12, border:"none", background:"linear-gradient(135deg,#EA4335,#FBBC04)", color:"white", fontWeight:700, fontSize:16, cursor:"pointer" }}>
              Submit Assignment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// APP (main)
// ══════════════════════════════════════════
export default function App() {
  const [session, setSession] = useState(getSession);
  const [page, setPage] = useState("course");
  const [currentLesson, setCurrentLesson] = useState(null);
  const [modules, setModules] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const login = (s) => { saveSession(s); setSession(s); };
  const logout = () => { saveSession(null); setSession(null); setPage("course"); };

  const refreshModules = async () => {
    const mods = await FB.getModules();
    const result = mods || INITIAL_MODULES;
    setModules(result);
    if (currentLesson) {
      const updated = result.flatMap(m => m.lessons).find(l => l.id === currentLesson.id);
      if (updated) setCurrentLesson({...updated});
    }
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#1a73e8,#9334E6)", fontFamily:"sans-serif" }}>
      <div style={{ color:"white", textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>Loading...</div>
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

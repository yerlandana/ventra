// Real English: B1 -> B2. The course page (tracker + 24 topics) and the course catalog cards.
// props: email, store { load, save } for submissions/{email}.realEnglish.
// Progress shape: { at, t: { [topicId]: { vocab:{best,total}, grammar:{...}, reading:{...}, listening:{...}, speaking:{done}, writing:{text,done} } } }
import { useEffect, useMemo, useRef, useState } from "react";
import { COURSE_INFO, TASKS, TOPICS } from "./realEnglish";

const PASS = { vocab: 5, grammar: 3, reading: 2, listening: 2 };

const CSS = `
.re{--indigo:#2A2680;--navy:#15225A;--gold:#C9973A;--gold-2:#E4BF6C;--gold-soft:#FBF5E6;--lav:#F1EFFC;--line:#E4E1F8;--muted:#5D5A8C;--ok:#2F8F5B;--bad:#C2453D;color:var(--navy)}
.re button{font:inherit;color:inherit;cursor:pointer}
.re :focus-visible{outline:3px solid var(--gold);outline-offset:2px}
.re-hero{position:relative;overflow:hidden;background:linear-gradient(135deg,#2A2680,#15225A);color:#fff;border-radius:22px;padding:24px 26px;margin-bottom:18px}
.re-hero:after{content:"";position:absolute;right:-60px;top:-80px;width:280px;height:280px;border-radius:50%;background:radial-gradient(closest-side,rgba(228,191,108,.45),transparent)}
.re-hero>*{position:relative;z-index:1}
.re-hero h2{margin:0;font-size:26px;font-weight:800}
.re-hero p{margin:8px 0 0;max-width:64ch;color:#D9D5F7;font-size:15px;line-height:1.55}
.re-bar{height:10px;border-radius:99px;background:rgba(255,255,255,.15);overflow:hidden;margin-top:16px;max-width:420px}
.re-bar i{display:block;height:100%;background:linear-gradient(90deg,#C9973A,#E4BF6C);border-radius:99px}
.re-stats{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.re-stat{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);border-radius:14px;padding:8px 14px}
.re-stat b{display:block;font-size:20px;color:var(--gold-2);font-variant-numeric:tabular-nums}
.re-stat span{font-size:12.5px;color:#D9D5F7}
.re-next{margin-top:16px;display:inline-flex;gap:8px;align-items:center;border:none;border-radius:12px;padding:11px 16px;background:var(--gold);color:var(--navy)!important;font-weight:800}
.re-note{font-size:13px;color:var(--muted);background:var(--gold-soft);border:1px solid #F0E2BF;border-radius:12px;padding:10px 14px;margin-bottom:16px;line-height:1.5}
.re-card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px 18px;box-shadow:0 10px 26px rgba(20,18,63,.05);margin-bottom:16px}
.re-card h3{margin:0 0 10px;font-size:18px;font-weight:800}
.re-tr{display:grid;grid-template-columns:28px minmax(0,1fr) repeat(6,26px) 44px;gap:6px;align-items:center;padding:6px 4px;border-top:1px solid #F0EEFA;font-size:14px;text-align:left;width:100%;background:none;border-left:none;border-right:none;border-bottom:none}
.re-tr:hover{background:#FAF9FF}
.re-tr.head{border-top:none;font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;cursor:default}
.re-tr.head:hover{background:none}
.re-tt{min-width:0;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.re-n{font-weight:800;color:var(--muted);font-variant-numeric:tabular-nums}
.re-dot{width:22px;height:22px;border-radius:7px;background:#F1EFFC;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff}
.re-dot.on{background:var(--ok)}
.re-dot.half{background:#E9C46A}
.re-stage{font-size:11px;font-weight:800;padding:2px 8px;border-radius:99px;background:var(--lav);color:var(--indigo);margin-left:6px}
.re-back{border:none;background:none;color:var(--muted);font-weight:700;font-size:13.5px;padding:0;margin-bottom:10px}
.re-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 14px}
.re-tab{border:1.5px solid var(--line);background:#fff;border-radius:999px;padding:7px 13px;font-weight:700;font-size:13.5px;display:inline-flex;gap:6px;align-items:center}
.re-tab[aria-selected=true]{background:var(--indigo);border-color:var(--indigo);color:#fff}
.re-tab .ok{color:var(--ok);font-weight:900}
.re-tab[aria-selected=true] .ok{color:#9FE2BA}
.re-phr{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}
.re-ph{background:#FAF9FF;border:1px solid var(--line);border-radius:14px;padding:12px 14px}
.re-ph b{font-size:15.5px;color:var(--indigo)}
.re-ph .m{font-size:13.5px;margin-top:4px}
.re-ph .e{font-size:13px;color:var(--muted);font-style:italic;margin-top:6px}
.re-sub{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);margin:16px 0 8px}
.re-q{padding:12px 0;border-top:1px solid #F0EEFA}
.re-q:first-child{border-top:none}
.re-q p{margin:0 0 8px;font-weight:700;font-size:14.5px;line-height:1.45}
.re-opts{display:flex;flex-wrap:wrap;gap:6px}
.re-opt{border:1.5px solid var(--line);background:#fff;border-radius:10px;padding:7px 12px;font-size:14px;text-align:left}
.re-opt[aria-pressed=true]{border-color:var(--indigo);background:var(--lav)}
.re-opt.good{border-color:var(--ok);background:#E6F4EC}
.re-opt.wrong{border-color:var(--bad);background:#FBE9E7}
.re-in{border:1.5px solid var(--line);border-radius:10px;padding:8px 10px;font:inherit;font-size:14.5px;min-width:0;width:220px;max-width:100%}
.re-in.good{border-color:var(--ok);background:#E6F4EC}
.re-in.wrong{border-color:var(--bad);background:#FBE9E7}
.re-fix{font-size:13px;color:var(--bad);margin-top:5px}
.re-go{border:none;border-radius:12px;padding:10px 16px;font-weight:800;font-size:14.5px;background:var(--gold);color:var(--navy)}
.re-go.alt{background:#fff;border:1.5px solid var(--line);color:var(--indigo)}
.re-go:disabled{opacity:.5;cursor:default}
.re-res{margin-top:12px;padding:10px 14px;border-radius:12px;font-weight:700;font-size:14px}
.re-res.pass{background:#E6F4EC;color:#1E6B43}
.re-res.fail{background:#FBF1E0;color:#8A6414}
.re-text{font-size:15.5px;line-height:1.75;max-width:70ch}
.re-gr{border-left:4px solid var(--gold);background:#FFFCF5;border-radius:0 12px 12px 0;padding:10px 14px;margin-bottom:10px}
.re-gr b{font-size:15px}
.re-gr p{margin:4px 0 6px;font-size:14px;line-height:1.5}
.re-gr li{font-size:14px;color:var(--muted);margin:2px 0}
.re-script{margin-top:12px;font-size:14px;line-height:1.7;background:#FAF9FF;border-radius:12px;padding:10px 14px}
.re-area{width:100%;min-height:200px;border:1.5px solid var(--line);border-radius:14px;padding:12px 14px;font:inherit;font-size:15px;line-height:1.6;box-sizing:border-box;resize:vertical}
.re-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.re-chip{font-size:12.5px;font-weight:700;padding:4px 10px;border-radius:99px;background:#F4F3FA;color:#9895B8}
.re-chip.on{background:#E6F4EC;color:#1E6B43}
.re-cat{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.re-course{position:relative;display:flex;flex-direction:column;gap:6px;text-align:left;border-radius:18px;padding:16px 18px;border:1px solid var(--line);background:#fff;box-shadow:0 10px 26px rgba(20,18,63,.06);overflow:hidden;min-width:0}
.re-course:before{content:"";position:absolute;left:0;top:0;right:0;height:4px;background:var(--c)}
.re-course .lvl{align-self:flex-start;font-size:11.5px;font-weight:800;letter-spacing:.06em;color:var(--c);text-transform:uppercase}
.re-course b{font-size:16.5px;line-height:1.25}
.re-course .d{font-size:13px;color:var(--muted);line-height:1.45;flex:1}
.re-course .pb{height:7px;border-radius:99px;background:#F1EFFC;overflow:hidden;margin-top:6px}
.re-course .pb i{display:block;height:100%;background:var(--c)}
.re-course .pt{font-size:12.5px;font-weight:700;color:var(--muted)}
.re-course.soon{border-style:dashed;box-shadow:none;background:#FBFAFF;cursor:default}
@media (max-width:560px){
  .re-hero{padding:20px 18px}
  .re-tr{grid-template-columns:22px minmax(0,1fr) repeat(6,18px) 34px;gap:4px;font-size:13px}
  .re-dot{width:16px;height:16px;border-radius:5px;font-size:0}
  .re-tt{white-space:normal;line-height:1.25}
  .re-stage{display:none}
  .re-in{width:100%}
}
`;

// ---------- progress storage ----------
const localKey = (email) => `ielts8-real-english-${email}`;
const readLocal = (email) => { try { return JSON.parse(localStorage.getItem(localKey(email)) || "null"); } catch (e) { return null; } };
const writeLocal = (email, p) => { try { localStorage.setItem(localKey(email), JSON.stringify(p)); } catch (e) { /* storage full or blocked */ } };
const EMPTY = { at: "", t: {} };

export function taskDone(tp, task) {
  const r = tp && tp[task];
  if (!r) return false;
  if (PASS[task] != null) return (r.best || 0) >= PASS[task];
  return !!r.done;
}
export const topicDone = (tp) => TASKS.every((x) => taskDone(tp, x.id));
export function courseStats(p) {
  const t = (p && p.t) || {};
  const tasks = TOPICS.reduce((s, x) => s + TASKS.filter((k) => taskDone(t[x.id], k.id)).length, 0);
  const topics = TOPICS.filter((x) => topicDone(t[x.id])).length;
  return { tasks, totalTasks: TOPICS.length * TASKS.length, topics, totalTopics: TOPICS.length };
}

export function useRealEnglish(email, store) {
  const [p, setP] = useState(() => readLocal(email) || EMPTY);
  const timer = useRef(null);
  useEffect(() => {
    let alive = true;
    store.load().then((remote) => {
      if (!alive || !remote) return;
      setP((cur) => {
        const best = String(remote.at || "") >= String(cur.at || "") ? remote : cur;
        writeLocal(email, best);
        return best;
      });
    }).catch(() => {});
    return () => { alive = false; };
    // The store object is rebuilt on every render of the parent; the email decides whose progress this is.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);
  const update = (topicId, task, value) => {
    setP((cur) => {
      const next = { at: new Date().toISOString(), t: { ...cur.t, [topicId]: { ...(cur.t[topicId] || {}), [task]: value } } };
      writeLocal(email, next);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => store.save(next).catch(() => {}), 1200);
      return next;
    });
  };
  return [p, update];
}

// ---------- helpers ----------
const norm = (s) => String(s || "").toLowerCase().replace(/[’`]/g, "'").replace(/[.!?,]/g, "").replace(/\s+/g, " ").trim();
const accepts = (ans, given) => ans.split("|").some((a) => norm(a) === norm(given));
const words = (s) => (String(s).trim().match(/[A-Za-z’'-]+/g) || []).length;
// Deterministic shuffle so options don't jump around on every render.
const seeded = (arr, seed) => {
  const a = arr.slice(); let s = seed;
  for (let i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor((s / 233280) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
// The part of a phrase to look for in the student's writing: "it's giving…" -> "it's giving", "a W / an L" -> "a w".
const phraseKey = (ph) => norm(ph.split(" / ")[0].replace(/[…]|\(.*?\)|^-/g, "").replace(/'$/, ""));
const minWords = (prompt) => { const m = String(prompt).match(/(\d+)\s*[–-]\s*\d+\s*words/); return m ? Number(m[1]) : 80; };

function Result({ score, total, pass }) {
  const ok = score >= pass;
  return <div className={"re-res " + (ok ? "pass" : "fail")} role="status">{score}/{total} correct. {ok ? "Task complete ✓" : `You need ${pass} to complete it. Try again!`}</div>;
}

// ---------- tasks ----------
function ChoiceQuiz({ items, saved, pass, onDone }) {
  // items: [question, options, correctIndex]
  const [ans, setAns] = useState({});
  const [checked, setChecked] = useState(false);
  const score = items.filter((q, i) => ans[i] === q[2]).length;
  return (
    <div>
      {items.map((q, i) => (
        <div className="re-q" key={i}>
          <p>{i + 1}. {q[0]}</p>
          <div className="re-opts">
            {q[1].map((o, j) => {
              const cls = checked ? (j === q[2] ? " good" : ans[i] === j ? " wrong" : "") : "";
              return <button key={j} type="button" className={"re-opt" + cls} aria-pressed={ans[i] === j} disabled={checked}
                onClick={() => setAns({ ...ans, [i]: j })}>{o}</button>;
            })}
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        {!checked
          ? <button className="re-go" type="button" disabled={Object.keys(ans).length < items.length}
              onClick={() => { setChecked(true); onDone(score, items.length); }}>Check answers</button>
          : <button className="re-go alt" type="button" onClick={() => { setAns({}); setChecked(false); }}>Try again</button>}
        {!checked && saved && <span style={{ alignSelf: "center", fontSize: 13, color: "#5D5A8C" }}>Best: {saved.best}/{saved.total}</span>}
      </div>
      {checked && <Result score={score} total={items.length} pass={pass} />}
    </div>
  );
}

function WordsTask({ topic, idx, saved, onDone }) {
  const items = useMemo(() => {
    const all = TOPICS.flatMap((t) => [...t.slang, ...t.idioms]);
    return [...topic.slang, ...topic.idioms].map(([ph, mean], i) => {
      const others = seeded(all.filter((x) => x[1] !== mean), idx * 31 + i * 7 + 3).slice(0, 2).map((x) => x[1]);
      const opts = seeded([mean, ...others], idx * 17 + i);
      return [`"${ph}" means…`, opts, opts.indexOf(mean)];
    });
  }, [topic, idx]);
  const card = ([ph, m, e]) => (
    <div className="re-ph" key={ph}><b>{ph}</b><div className="m">{m}</div><div className="e">{e}</div></div>
  );
  return (
    <>
      <div className="re-card">
        <h3>Slang</h3>
        <div className="re-phr">{topic.slang.map(card)}</div>
        <div className="re-sub">Idioms</div>
        <div className="re-phr">{topic.idioms.map(card)}</div>
      </div>
      <div className="re-card">
        <h3>Check yourself</h3>
        <ChoiceQuiz items={items} saved={saved} pass={PASS.vocab} onDone={onDone} />
      </div>
    </>
  );
}

function GrammarTask({ topic, saved, onDone }) {
  const [ans, setAns] = useState({});
  const [checked, setChecked] = useState(false);
  const score = topic.gq.filter((q, i) => accepts(q[1], ans[i])).length;
  return (
    <>
      <div className="re-card">
        <h3>Grammar</h3>
        {topic.grammar.map((g) => (
          <div className="re-gr" key={g.name}>
            <b>{g.name}</b>
            <p>{g.rule}</p>
            <ul style={{ margin: 0, paddingLeft: 18 }}>{g.ex.map((e) => <li key={e}>{e}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="re-card">
        <h3>Fill the gaps</h3>
        {topic.gq.map((q, i) => {
          const [a, b] = q[0].split("___");
          const ok = checked && accepts(q[1], ans[i]);
          return (
            <div className="re-q" key={i}>
              <p style={{ fontWeight: 500 }}>
                {i + 1}. {a}
                <input className={"re-in" + (checked ? (ok ? " good" : " wrong") : "")} style={{ width: 180, margin: "0 4px" }}
                  aria-label={`Gap ${i + 1}`} value={ans[i] || ""} disabled={checked}
                  onChange={(e) => setAns({ ...ans, [i]: e.target.value })} />
                {b}
              </p>
              {checked && !ok && <div className="re-fix">Answer: {q[1].split("|")[0]}</div>}
            </div>
          );
        })}
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {!checked
            ? <button className="re-go" type="button" disabled={topic.gq.some((q, i) => !String(ans[i] || "").trim())}
                onClick={() => { setChecked(true); onDone(score, topic.gq.length); }}>Check answers</button>
            : <button className="re-go alt" type="button" onClick={() => { setAns({}); setChecked(false); }}>Try again</button>}
          {!checked && saved && <span style={{ alignSelf: "center", fontSize: 13, color: "#5D5A8C" }}>Best: {saved.best}/{saved.total}</span>}
        </div>
        {checked && <Result score={score} total={topic.gq.length} pass={PASS.grammar} />}
      </div>
    </>
  );
}

function ReadingTask({ topic, saved, onDone }) {
  return (
    <div className="re-card">
      <h3>{topic.reading.title}</h3>
      <p className="re-text">{topic.reading.text}</p>
      <div className="re-sub">Questions</div>
      <ChoiceQuiz items={topic.reading.q} saved={saved} pass={PASS.reading} onDone={onDone} />
    </div>
  );
}

function ListeningTask({ topic, saved, onDone }) {
  const [script, setScript] = useState(false);
  const L = topic.listening;
  return (
    <div className="re-card">
      <h3>Listen: {L.who[0]} and {L.who[1]}</h3>
      <p style={{ margin: "0 0 10px", fontSize: 14, color: "#5D5A8C" }}>Read the questions first, then listen. You can play it twice.</p>
      <audio controls preload="none" src={`/course/real-english/${topic.id}.mp3`} style={{ width: "100%", maxWidth: 520 }} />
      <div className="re-sub">Questions</div>
      <ChoiceQuiz items={L.q} saved={saved} pass={PASS.listening} onDone={(s, t) => { onDone(s, t); setScript(true); }} />
      <button type="button" className="re-go alt" style={{ marginTop: 12 }} onClick={() => setScript(!script)}>{script ? "Hide the script" : "Show the script"}</button>
      {script && (
        <div className="re-script">
          {L.lines.map(([s, t], i) => <div key={i}><b>{L.who[s]}:</b> {t}</div>)}
        </div>
      )}
    </div>
  );
}

function SpeakingTask({ topic, saved, onDone }) {
  const [rec, setRec] = useState(null); // MediaRecorder while recording
  const [clips, setClips] = useState([]);
  const [err, setErr] = useState("");
  const start = async () => {
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream); const chunks = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => { stream.getTracks().forEach((t) => t.stop()); setClips((c) => [...c, URL.createObjectURL(new Blob(chunks, { type: mr.mimeType }))]); };
      mr.start(); setRec(mr);
    } catch (e) { setErr("The microphone is not available. You can answer out loud without recording."); }
  };
  const stop = () => { if (rec) rec.stop(); setRec(null); };
  useEffect(() => () => { if (rec && rec.state !== "inactive") rec.stop(); }, [rec]);
  const useList = [...topic.slang, ...topic.idioms].map((x) => x[0]);
  return (
    <div className="re-card">
      <h3>Speak</h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "#5D5A8C" }}>Answer each question for 30–60 seconds. Try to use two phrases from this topic and one grammar point.</p>
      <ol style={{ paddingLeft: 20, margin: "0 0 12px" }}>{topic.speaking.map((q) => <li key={q} style={{ fontSize: 15.5, fontWeight: 700, margin: "6px 0" }}>{q}</li>)}</ol>
      <div className="re-chips" style={{ marginBottom: 12 }}>{useList.map((w) => <span key={w} className="re-chip">{w}</span>)}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {!rec ? <button className="re-go alt" type="button" onClick={start}>● Record myself</button>
          : <button className="re-go" type="button" onClick={stop} style={{ background: "#C2453D", color: "#fff" }}>■ Stop</button>}
        <button className="re-go" type="button" disabled={!!saved?.done} onClick={() => onDone()}>{saved?.done ? "Done ✓" : "I answered all 3"}</button>
      </div>
      {err && <div className="re-fix">{err}</div>}
      {clips.map((u, i) => <audio key={u} controls src={u} style={{ display: "block", marginTop: 10, width: "100%", maxWidth: 420 }} aria-label={`Recording ${i + 1}`} />)}
      {clips.length > 0 && <p style={{ fontSize: 12.5, color: "#5D5A8C" }}>Recordings stay on this device only. Listen back: did you use the phrases?</p>}
    </div>
  );
}

function WritingTask({ topic, saved, onSave }) {
  const [text, setText] = useState(saved?.text || "");
  const min = minWords(topic.writing);
  const n = words(text);
  const lower = " " + norm(text) + " ";
  const phrases = [...topic.slang, ...topic.idioms].map((x) => x[0]);
  const used = phrases.filter((ph) => lower.includes(" " + phraseKey(ph)));
  const t = useRef(null);
  const change = (v) => {
    setText(v);
    clearTimeout(t.current);
    t.current = setTimeout(() => onSave({ text: v, done: words(v) >= min }), 800);
  };
  useEffect(() => () => clearTimeout(t.current), []);
  return (
    <div className="re-card">
      <h3>Write</h3>
      <p style={{ margin: "0 0 12px", fontSize: 15, lineHeight: 1.55 }}>{topic.writing}</p>
      <textarea className="re-area" aria-label="Your text" value={text} onChange={(e) => change(e.target.value)} placeholder="Start writing here…" />
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 13.5, marginTop: 6 }}>
        <span style={{ fontWeight: 700, color: n >= min ? "#1E6B43" : "#5D5A8C" }}>{n} words {n >= min ? "✓" : `(at least ${min})`}</span>
        <span style={{ color: "#5D5A8C" }}>Saved automatically</span>
      </div>
      <div className="re-sub">Phrases you used</div>
      <div className="re-chips">{phrases.map((ph) => <span key={ph} className={"re-chip" + (used.includes(ph) ? " on" : "")}>{used.includes(ph) ? "✓ " : ""}{ph}</span>)}</div>
      <p style={{ fontSize: 12.5, color: "#5D5A8C", marginTop: 10 }}>Want a band score? Paste your text into the Essay Checker.</p>
    </div>
  );
}

// ---------- topic view ----------
function TopicView({ topic, idx, tp, update, onBack, onNext }) {
  const [tab, setTab] = useState("vocab");
  const save = (task) => (score, total) => {
    const old = tp[task];
    if (!old || score >= (old.best || 0)) update(topic.id, task, { best: score, total, at: new Date().toISOString() });
  };
  return (
    <div>
      <button className="re-back" type="button" onClick={onBack}>← All topics</button>
      <div className="re-hero" style={{ padding: "18px 22px" }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: ".1em", color: "#E4BF6C" }}>TOPIC {idx + 1} OF {TOPICS.length} · {topic.stage}</div>
        <h2 style={{ marginTop: 4 }}>{topic.title}</h2>
        <p>{topic.grammar.map((g) => g.name).join(" · ")}</p>
      </div>
      <div className="re-tabs" role="tablist">
        {TASKS.map((x) => (
          <button key={x.id} type="button" role="tab" className="re-tab" aria-selected={tab === x.id} onClick={() => setTab(x.id)}>
            <span aria-hidden="true">{x.icon}</span>{x.label}{taskDone(tp, x.id) && <span className="ok" aria-label="done">✓</span>}
          </button>
        ))}
      </div>
      {tab === "vocab" && <WordsTask key={topic.id} topic={topic} idx={idx} saved={tp.vocab} onDone={save("vocab")} />}
      {tab === "grammar" && <GrammarTask key={topic.id} topic={topic} saved={tp.grammar} onDone={save("grammar")} />}
      {tab === "reading" && <ReadingTask key={topic.id} topic={topic} saved={tp.reading} onDone={save("reading")} />}
      {tab === "listening" && <ListeningTask key={topic.id} topic={topic} saved={tp.listening} onDone={save("listening")} />}
      {tab === "speaking" && <SpeakingTask key={topic.id} topic={topic} saved={tp.speaking} onDone={() => update(topic.id, "speaking", { done: true, at: new Date().toISOString() })} />}
      {tab === "writing" && <WritingTask key={topic.id} topic={topic} saved={tp.writing} onSave={(w) => update(topic.id, "writing", { ...w, at: new Date().toISOString() })} />}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        {(() => { const i = TASKS.findIndex((x) => x.id === tab); return i < TASKS.length - 1
          ? <button className="re-go alt" type="button" onClick={() => { setTab(TASKS[i + 1].id); window.scrollTo(0, 0); }}>Next: {TASKS[i + 1].label} →</button>
          : <span />; })()}
        {onNext && <button className="re-go" type="button" onClick={onNext}>Next topic →</button>}
      </div>
    </div>
  );
}

// ---------- course page ----------
export default function RealEnglishPage({ email, store }) {
  const [p, update] = useRealEnglish(email, store);
  const [open, setOpen] = useState(null); // topic index
  const st = courseStats(p);
  const nextIdx = Math.max(0, TOPICS.findIndex((x) => !topicDone(p.t[x.id])));
  const go = (i) => { setOpen(i); window.scrollTo(0, 0); };

  if (open != null) {
    const topic = TOPICS[open];
    return (
      <div className="re"><style>{CSS}</style>
        <TopicView key={topic.id} topic={topic} idx={open} tp={p.t[topic.id] || {}} update={update}
          onBack={() => go(null)} onNext={open < TOPICS.length - 1 ? () => go(open + 1) : null} />
      </div>
    );
  }

  return (
    <div className="re">
      <style>{CSS}</style>
      <section className="re-hero">
        <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: ".1em", color: "#E4BF6C" }}>COURSE · B1 → B2</div>
        <h2 style={{ marginTop: 4 }}>{COURSE_INFO.title.replace(": B1 → B2", "")}</h2>
        <p>24 topics from everyday life. In each one: current slang, idioms, two grammar points and a task for Reading, Listening, Speaking and Writing.</p>
        <div className="re-bar" aria-hidden="true"><i style={{ width: `${(st.tasks / st.totalTasks) * 100}%` }} /></div>
        <div className="re-stats">
          <div className="re-stat"><b>{st.topics}/{st.totalTopics}</b><span>topics finished</span></div>
          <div className="re-stat"><b>{st.tasks}/{st.totalTasks}</b><span>tasks done</span></div>
        </div>
        <button className="re-next" type="button" onClick={() => go(nextIdx)}>
          {st.tasks === 0 ? "Start topic 1" : st.topics === TOPICS.length ? "Review topic 1" : `Continue: ${TOPICS[nextIdx].title}`} →
        </button>
      </section>

      <div className="re-note">💡 {COURSE_INFO.note}</div>

      <div className="re-card">
        <h3>Your tracker</h3>
        <div className="re-tr head" aria-hidden="true">
          <span>#</span><span>Topic</span>
          {TASKS.map((x) => <span key={x.id} title={x.label} style={{ textAlign: "center" }}>{x.icon}</span>)}
          <span style={{ textAlign: "right" }}>%</span>
        </div>
        {TOPICS.map((t, i) => {
          const tp = p.t[t.id] || {};
          const done = TASKS.filter((x) => taskDone(tp, x.id)).length;
          return (
            <button key={t.id} type="button" className="re-tr" onClick={() => go(i)} aria-label={`Topic ${i + 1}: ${t.title}, ${done} of ${TASKS.length} tasks done`}>
              <span className="re-n">{i + 1}</span>
              <span className="re-tt">
                {t.title}{(i === 0 || TOPICS[i - 1].stage !== t.stage) && <span className="re-stage">{t.stage}</span>}
              </span>
              {TASKS.map((x) => {
                const r = tp[x.id];
                const on = taskDone(tp, x.id);
                const half = !on && r && (r.best != null || r.text);
                return <span key={x.id} className={"re-dot" + (on ? " on" : half ? " half" : "")} title={x.label}>{on ? "✓" : ""}</span>;
              })}
              <span className="re-n" style={{ textAlign: "right" }}>{Math.round((done / TASKS.length) * 100)}</span>
            </button>
          );
        })}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12.5, color: "#5D5A8C", marginTop: 10 }}>
          <span><span className="re-dot on" style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 4 }}>✓</span>done</span>
          <span><span className="re-dot half" style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 4 }} />started</span>
          <span>{TASKS.map((x) => `${x.icon} ${x.label}`).join(" · ")}</span>
        </div>
      </div>
    </div>
  );
}

// ---------- course catalog (dashboard and My Courses) ----------
// ielts: { done, total } lessons of the main IELTS course. onOpen(id): "ielts" | "real-english" | "masterclass".
export function CourseCatalog({ email, store, ielts, onOpen }) {
  const [p] = useRealEnglish(email, store);
  const st = courseStats(p);
  const card = (c) => (
    <button key={c.id} type="button" className={"re-course" + (c.soon ? " soon" : "")} style={{ "--c": c.color }}
      onClick={c.soon ? undefined : () => onOpen(c.id)} aria-disabled={c.soon || undefined}>
      <span className="lvl">{c.level}</span>
      <b>{c.title}</b>
      <span className="d">{c.desc}</span>
      {c.pct != null && <span className="pb" aria-hidden="true"><i style={{ width: `${Math.round(c.pct * 100)}%` }} /></span>}
      <span className="pt">{c.progress}</span>
    </button>
  );
  return (
    <div className="re"><style>{CSS}</style>
      <div className="re-cat">
        {[
          { id: "real-english", level: "B1 → B2", title: "Real English", color: "#1D6B5A",
            desc: "24 topics: slang, idioms, grammar and all four skills, with a tracker.",
            pct: st.tasks / st.totalTasks, progress: st.tasks ? `${st.topics}/${st.totalTopics} topics · ${Math.round((st.tasks / st.totalTasks) * 100)}%` : "Not started yet" },
          { id: "ielts", level: "B2 → Band 8", title: "IELTS Course", color: "#2A2680",
            desc: "Five modules: lessons, presentations, tests and exam tasks.",
            pct: ielts.total ? ielts.done / ielts.total : 0, progress: `${ielts.done}/${ielts.total} lessons` },
          { id: "masterclass", level: "Intensive", title: "Masterclass", color: "#C9973A",
            desc: "Six levels: phrases, Listening and Reading Part 1, Speaking and a pie chart.", progress: "Open →" },
          { id: "c1", level: "B2 → C1", title: "Fluent English", color: "#9B3C6E", soon: true,
            desc: "Advanced idioms, debates and academic writing.", progress: "Coming soon" },
        ].map(card)}
      </div>
    </div>
  );
}

// ---------- teacher view (admin, read-only) ----------
export function RealEnglishReport({ data, name }) {
  const t = (data && data.t) || {};
  const st = courseStats(data);
  const started = TOPICS.filter((x) => t[x.id]);
  if (!started.length) return <div style={{ fontSize: 13, color: "#666" }}>{name} has not started Real English yet.</div>;
  const cell = (tp, k) => {
    const r = tp[k];
    if (!r) return <span style={{ color: "#bbb" }}>·</span>;
    const ok = taskDone(tp, k);
    const txt = r.best != null ? `${r.best}/${r.total}` : k === "writing" ? `${words(r.text || "")}w` : "✓";
    return <span style={{ fontWeight: 700, color: ok ? "#1E6B43" : "#8A6414" }}>{txt}</span>;
  };
  return (
    <div className="re" style={{ fontSize: 13 }}>
      <div style={{ marginBottom: 8, fontWeight: 700 }}>{st.topics}/{st.totalTopics} topics finished · {st.tasks}/{st.totalTasks} tasks</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 520 }}>
          <thead><tr>{["Topic", ...TASKS.map((x) => x.label)].map((h) => <th key={h} style={{ textAlign: "left", padding: "4px 8px", fontSize: 11, color: "#5D5A8C" }}>{h}</th>)}</tr></thead>
          <tbody>
            {started.map((x) => {
              const tp = t[x.id];
              return (
                <tr key={x.id} style={{ borderTop: "1px solid #ECEAF8", verticalAlign: "top" }}>
                  <td style={{ padding: "6px 8px", fontWeight: 700 }}>{TOPICS.indexOf(x) + 1}. {x.title}</td>
                  {TASKS.map((k) => <td key={k.id} style={{ padding: "6px 8px" }}>{cell(tp, k.id)}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {started.filter((x) => t[x.id].writing && t[x.id].writing.text).map((x) => (
        <details key={x.id} style={{ marginTop: 8 }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>Writing · {x.title} ({words(t[x.id].writing.text)} words)</summary>
          <div style={{ whiteSpace: "pre-wrap", background: "#fff", borderRadius: 10, padding: "10px 12px", marginTop: 6, lineHeight: 1.6 }}>{t[x.id].writing.text}</div>
        </details>
      ))}
    </div>
  );
}

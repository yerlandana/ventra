// Essay Checker inside the platform: the student pastes a Task 1 or Task 2 answer, gets instant text
// metrics, then an AI examiner report (api/check-writing.js) with the mistakes highlighted in the text.
// Every AI check is kept in submissions/{email}.essays (last 30), so the student sees their band trend
// and the teacher sees the essays in the admin panel.
// props: email, store { load, save }, check(request) -> AI result, Report (renders an AI result), skeletons.
import { useEffect, useMemo, useRef, useState } from "react";

const MIN = { "Task 1": 150, "Task 2": 250 };
const MINUTES = { "Task 1": 20, "Task 2": 40 };
const KEEP = 30;
const DRAFT_KEY = (email) => `ielts8-essay-draft-${email}`;

const LINKERS = {
  Addition: ["furthermore", "moreover", "in addition", "additionally", "also"],
  Contrast: ["however", "nevertheless", "on the other hand", "whereas", "although", "despite", "in contrast"],
  Cause: ["therefore", "thus", "consequently", "as a result", "because", "due to", "hence"],
  Example: ["for example", "for instance", "such as", "in particular"],
  Conclusion: ["in conclusion", "to sum up", "overall", "to conclude"],
};
const CONTRACTION = /\b(?:\w+n't|it's|i'm|they're|we're|you're|that's|there's|let's|i've|we've|i'd|i'll)\b/gi;
const STOP = new Set("the and that have this with from they will their would there which about because should could other more some many such into than then them these those your what when been being also very much most people".split(" "));

export function metrics(text) {
  const t = text.trim();
  const low = " " + t.toLowerCase().replace(/[.,;:!?()"]/g, " ") + " ";
  const words = t.match(/[A-Za-z’']+/g) || [];
  const sentences = t.split(/[.!?]+/).filter((s) => s.trim().split(/\s+/).length > 1);
  const paras = t.split(/\n\s*\n/).filter((p) => p.trim()).length;
  const linkTypes = Object.entries(LINKERS).filter(([, list]) => list.some((l) => low.includes(" " + l + " "))).map(([k]) => k);
  const freq = {};
  words.forEach((w) => { const k = w.toLowerCase(); if (k.length > 4 && !STOP.has(k)) freq[k] = (freq[k] || 0) + 1; });
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
  return {
    words: words.length,
    paras,
    sentences: sentences.length,
    avg: sentences.length ? Math.round(words.length / sentences.length) : 0,
    linkTypes,
    contractions: (t.match(CONTRACTION) || []).length,
    top: top && top[1] >= 4 ? top : null,
  };
}

// Splits the essay into plain text and highlighted mistakes (quotes the AI took from the essay).
function highlight(text, ai) {
  if (!ai) return [{ t: text }];
  const marks = [
    ...(ai.top_fixes || []).map((f) => ({ q: f.original, fix: f.better, why: f.why })),
    ...((ai.vocabulary && ai.vocabulary.wrong_words) || []).map((w) => ({ q: w.original, fix: w.correct })),
  ].filter((m) => m.q && m.q.length >= 2);
  const low = text.toLowerCase();
  const found = [];
  marks.forEach((m) => {
    const i = low.indexOf(m.q.toLowerCase());
    if (i >= 0 && !found.some((f) => i < f.end && i + m.q.length > f.start)) found.push({ ...m, start: i, end: i + m.q.length });
  });
  found.sort((a, b) => a.start - b.start);
  const out = []; let pos = 0;
  found.forEach((f) => { out.push({ t: text.slice(pos, f.start) }); out.push({ t: text.slice(f.start, f.end), fix: f.fix, why: f.why }); pos = f.end; });
  out.push({ t: text.slice(pos) });
  return out;
}

const CSS = `
.ec{--indigo:#2A2680;--navy:#15225A;--gold:#C9973A;--gold-2:#E4BF6C;--lav:#F1EFFC;--line:#E4E1F8;--muted:#5D5A8C;--ok:#1E6B43;--bad:#B23A3A;color:var(--navy)}
.ec button{font:inherit;color:inherit;cursor:pointer}
.ec :focus-visible{outline:3px solid var(--gold);outline-offset:2px}
.ec-hero{position:relative;overflow:hidden;background:linear-gradient(135deg,#2A2680,#15225A);color:#fff;border-radius:22px;padding:22px 26px;margin-bottom:16px}
.ec-hero:after{content:"";position:absolute;right:-60px;top:-80px;width:260px;height:260px;border-radius:50%;background:radial-gradient(closest-side,rgba(228,191,108,.45),transparent)}
.ec-hero>*{position:relative;z-index:1}
.ec-hero h2{margin:0;font-size:26px;font-weight:800}
.ec-hero p{margin:8px 0 0;max-width:62ch;color:#D9D5F7;font-size:15px;line-height:1.55}
.ec-card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px 18px;box-shadow:0 10px 26px rgba(20,18,63,.05);margin-bottom:16px}
.ec-card h3{margin:0 0 10px;font-size:18px;font-weight:800}
.ec-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.ec-pill{border:1.5px solid var(--line);background:#fff;border-radius:999px;padding:7px 15px;font-weight:700;font-size:13.5px}
.ec-pill[aria-pressed=true]{background:var(--indigo);border-color:var(--indigo);color:#fff}
.ec-in,.ec-sel{border:1.5px solid var(--line);border-radius:12px;padding:9px 12px;font:inherit;font-size:14.5px;width:100%;box-sizing:border-box;background:#fff;color:inherit}
.ec-area{width:100%;min-height:300px;border:1.5px solid var(--line);border-radius:14px;padding:14px 16px;font:inherit;font-size:15.5px;line-height:1.7;box-sizing:border-box;resize:vertical}
.ec-lbl{display:block;font-size:12.5px;font-weight:800;color:var(--muted);margin:12px 0 5px}
.ec-go{border:none;border-radius:12px;padding:11px 18px;font-weight:800;font-size:15px;background:var(--gold);color:var(--navy)}
.ec-go.alt{background:#fff;border:1.5px solid var(--line);color:var(--indigo)}
.ec-go:disabled{opacity:.55;cursor:default}
.ec-wc{font-size:13.5px;font-weight:700}
.ec-timer{font-variant-numeric:tabular-nums;font-weight:800;padding:6px 12px;border-radius:10px;background:var(--lav);color:var(--indigo)}
.ec-timer.low{background:#FBE9E7;color:var(--bad)}
.ec-stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}
.ec-stat{background:#F7F7FB;border-radius:12px;padding:10px 12px}
.ec-stat b{display:block;font-size:20px;font-variant-numeric:tabular-nums}
.ec-stat span{font-size:12px;color:var(--muted);font-weight:600}
.ec-stat.ok b{color:var(--ok)} .ec-stat.bad b{color:var(--bad)}
.ec-tips{margin:10px 0 0;padding-left:18px;font-size:13.5px;line-height:1.6;color:var(--muted)}
.ec-text{white-space:pre-wrap;font-size:15.5px;line-height:1.8}
.ec-text mark{background:#FDE7E4;color:inherit;border-bottom:2px solid #E08A80;border-radius:3px;padding:0 1px;cursor:help}
.ec-text mark:focus{outline:2px solid var(--gold)}
.ec-tip{font-size:13px;color:var(--ok);font-weight:700;margin-left:4px;white-space:normal}
.ec-hist{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:center;width:100%;text-align:left;background:none;border:none;border-top:1px solid #F0EEFA;padding:10px 4px}
.ec-hist:first-of-type{border-top:none}
.ec-hist:hover{background:#FAF9FF}
.ec-band{min-width:46px;text-align:center;font-weight:800;font-size:17px;padding:6px 8px;border-radius:10px;background:var(--lav);color:var(--indigo);font-variant-numeric:tabular-nums}
.ec-err{background:#FBE9E7;color:var(--bad);border-radius:12px;padding:10px 14px;font-size:14px;margin-top:12px}
.ec-trend{display:flex;align-items:flex-end;gap:4px;height:60px;margin:6px 0 4px}
.ec-trend i{flex:1;max-width:26px;background:linear-gradient(#C9973A,#E4BF6C);border-radius:5px 5px 2px 2px}
@media (max-width:560px){.ec-hero{padding:20px 18px}.ec-area{min-height:240px}}
`;

function useEssays(email, store) {
  const [list, setList] = useState(null);
  useEffect(() => {
    let alive = true;
    store.load().then((r) => { if (alive) setList(Array.isArray(r) ? r : []); }).catch(() => { if (alive) setList([]); });
    return () => { alive = false; };
    // The store object is rebuilt on every render of the parent; the email decides whose essays these are.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);
  const add = async (entry) => {
    const next = [entry, ...(list || [])].slice(0, KEEP);
    setList(next);
    try { await store.save(next); } catch (e) { /* shown in this session; saved with the next check */ }
  };
  return [list, add];
}

function Timer({ task }) {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    if (left == null || left <= 0) return undefined;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);
  if (left == null) return <button type="button" className="ec-go alt" onClick={() => setLeft(MINUTES[task] * 60)}>⏱ Exam timer · {MINUTES[task]} min</button>;
  const m = Math.floor(Math.max(0, left) / 60), s = Math.max(0, left) % 60;
  return (
    <span className="ec-row">
      <span className={"ec-timer" + (left < 300 ? " low" : "")} role="timer">{left <= 0 ? "Time is up" : `${m}:${String(s).padStart(2, "0")}`}</span>
      <button type="button" className="ec-go alt" style={{ padding: "6px 12px", fontSize: 13 }} onClick={() => setLeft(null)}>Reset</button>
    </span>
  );
}

export default function EssayCheckerPage({ email, store, check, Report, skeletons }) {
  const draft = useMemo(() => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY(email)) || "{}"); } catch (e) { return {}; } }, [email]);
  const [task, setTask] = useState(draft.task || "Task 2");
  const [prompt, setPrompt] = useState(draft.prompt || "");
  const [text, setText] = useState(draft.text || "");
  const [skel, setSkel] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [shown, setShown] = useState(null); // essay entry whose report is open
  const [list, add] = useEssays(email, store);
  const reportRef = useRef(null);

  useEffect(() => {
    const id = setTimeout(() => { try { localStorage.setItem(DRAFT_KEY(email), JSON.stringify({ task, prompt, text })); } catch (e) { /* ignore */ } }, 500);
    return () => clearTimeout(id);
  }, [email, task, prompt, text]);

  const m = metrics(text);
  const min = MIN[task];
  const skOptions = Object.entries(skeletons || {}).filter(([, s]) => s.task === task);
  const outline = (sk) => (sk ? sk.paragraphs.map((p) => `${p.label}: ${p.frame}`).join("\n") : "");

  const run = async () => {
    setErr(""); setBusy(true);
    try {
      const ai = await check({ type: "essay", prompt: `IELTS Writing ${task}${prompt.trim() ? `: ${prompt.trim()}` : ""}`, text, skeleton: outline(skeletons[skel]) });
      const entry = { at: ai.at || new Date().toISOString(), task, prompt: prompt.trim(), text, words: m.words, overall: ai.overall, ai };
      await add(entry);
      setShown(entry);
      setTimeout(() => reportRef.current && reportRef.current.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (e) {
      setErr(`${e.message}. The quick check above still works; try the AI check again in a minute.`);
    }
    setBusy(false);
  };

  const tips = [];
  if (m.words && m.words < min) tips.push(`Write at least ${min} words: ${min - m.words} more.`);
  if (m.words > 60 && m.paras < 3) tips.push("Split your answer into paragraphs with an empty line between them.");
  if (m.contractions) tips.push(`Avoid contractions in writing (${m.contractions} found): do not, it is.`);
  if (m.words > 80 && m.linkTypes.length < 3) tips.push("Use more kinds of linking words: contrast, cause, example.");
  if (m.top) tips.push(`"${m.top[0]}" appears ${m.top[1]} times. Try a synonym.`);
  if (m.avg > 30) tips.push("Your sentences are very long. Split some of them.");

  const scores = (list || []).slice(0, 12).reverse().map((e) => e.overall);
  const fmt = (iso) => { try { return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }); } catch (e) { return ""; } };

  return (
    <div className="ec">
      <style>{CSS}</style>
      <section className="ec-hero">
        <h2>Essay Checker</h2>
        <p>Paste your IELTS Task 1 or Task 2 answer. You get an AI examiner's band for each criterion, your mistakes highlighted in the text and better words to use. Every check is saved, so you can see your progress.</p>
      </section>

      <div className="ec-card">
        <div className="ec-row" style={{ justifyContent: "space-between" }}>
          <div className="ec-row" role="group" aria-label="Task">
            {["Task 1", "Task 2"].map((t) => <button key={t} type="button" className="ec-pill" aria-pressed={task === t} onClick={() => { setTask(t); setSkel(""); }}>{t}</button>)}
          </div>
          <Timer key={task} task={task} />
        </div>
        <label className="ec-lbl" htmlFor="ec-prompt">The question (optional, but the check is better with it)</label>
        <input id="ec-prompt" className="ec-in" value={prompt} onChange={(e) => setPrompt(e.target.value)}
          placeholder={task === "Task 2" ? "e.g. Some people think public transport should be free. To what extent do you agree?" : "e.g. The chart shows household spending in 2000 and 2020."} />
        {skOptions.length > 0 && <>
          <label className="ec-lbl" htmlFor="ec-skel">Essay skeleton (optional)</label>
          <select id="ec-skel" className="ec-sel" value={skel} onChange={(e) => setSkel(e.target.value)}>
            <option value="">No skeleton: check the structure in general</option>
            {skOptions.map(([k, s]) => <option key={k} value={k}>{s.title}</option>)}
          </select>
        </>}
        <label className="ec-lbl" htmlFor="ec-text">Your answer</label>
        <textarea id="ec-text" className="ec-area" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste or write your answer here. Leave an empty line between paragraphs." />
        <div className="ec-row" style={{ justifyContent: "space-between", marginTop: 8 }}>
          <span className="ec-wc" style={{ color: m.words >= min ? "#1E6B43" : "#5D5A8C" }}>{m.words} words {m.words >= min ? "✓" : `/ ${min}`}</span>
          <span style={{ fontSize: 12.5, color: "#5D5A8C" }}>Your draft is saved on this device</span>
        </div>
        <div className="ec-row" style={{ marginTop: 12 }}>
          <button type="button" className="ec-go" disabled={busy || m.words < 40} onClick={run}>{busy ? "The examiner is reading… (about 30 s)" : "Check with AI →"}</button>
          {text && !busy && <button type="button" className="ec-go alt" onClick={() => { setText(""); setShown(null); }}>Clear</button>}
        </div>
        {m.words > 0 && m.words < 40 && <div style={{ fontSize: 13, color: "#5D5A8C", marginTop: 8 }}>Write at least 40 words to check.</div>}
        {err && <div className="ec-err" role="alert">{err}</div>}
      </div>

      {m.words >= 40 && (
        <div className="ec-card">
          <h3>Quick check</h3>
          <div className="ec-stats">
            <div className={"ec-stat " + (m.words >= min ? "ok" : "bad")}><b>{m.words}</b><span>words (min {min})</span></div>
            <div className={"ec-stat " + (m.paras >= (task === "Task 2" ? 4 : 3) ? "ok" : "")}><b>{m.paras}</b><span>paragraphs</span></div>
            <div className="ec-stat"><b>{m.avg}</b><span>words per sentence</span></div>
            <div className={"ec-stat " + (m.linkTypes.length >= 3 ? "ok" : "")}><b>{m.linkTypes.length}/5</b><span>kinds of linkers</span></div>
            <div className={"ec-stat " + (m.contractions ? "bad" : "ok")}><b>{m.contractions}</b><span>contractions</span></div>
          </div>
          {tips.length > 0 ? <ul className="ec-tips">{tips.map((t) => <li key={t}>{t}</li>)}</ul>
            : <p style={{ fontSize: 13.5, color: "#1E6B43", margin: "10px 0 0", fontWeight: 700 }}>The form looks good. Now check the content with AI.</p>}
        </div>
      )}

      {shown && (
        <div className="ec-card" ref={reportRef}>
          <div className="ec-row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>Examiner's report · {shown.task}</h3>
            <span style={{ fontSize: 13, color: "#5D5A8C" }}>{fmt(shown.at)}</span>
          </div>
          <Report ai={shown.ai} />
          <h3 style={{ marginTop: 20 }}>Your text with mistakes marked</h3>
          <p style={{ fontSize: 13, color: "#5D5A8C", margin: "0 0 8px" }}>Hover over or tap a red phrase to see the correction.</p>
          <div className="ec-text">
            {highlight(shown.text, shown.ai).map((s, i) => s.fix
              ? <mark key={i} tabIndex={0} title={`Better: ${s.fix}${s.why ? ` (${s.why})` : ""}`}>{s.t}<span className="ec-tip">→ {s.fix}</span></mark>
              : <span key={i}>{s.t}</span>)}
          </div>
        </div>
      )}

      <div className="ec-card">
        <h3>Your essays</h3>
        {list === null ? <div style={{ fontSize: 13.5, color: "#5D5A8C" }}>Loading…</div>
          : list.length === 0 ? <div style={{ fontSize: 13.5, color: "#5D5A8C" }}>Your checked essays and bands will appear here.</div>
          : <>
            {scores.length > 1 && (
              <div aria-label={`Band trend: ${scores.join(", ")}`}>
                <div className="ec-trend">{scores.map((b, i) => <i key={i} style={{ height: `${Math.max(8, ((b - 3) / 6) * 100)}%` }} title={`Band ${b}`} />)}</div>
                <div style={{ fontSize: 12, color: "#5D5A8C", marginBottom: 8 }}>Band trend, oldest to newest</div>
              </div>
            )}
            {list.map((e) => (
              <button key={e.at} type="button" className="ec-hist" onClick={() => { setShown(e); setTimeout(() => reportRef.current && reportRef.current.scrollIntoView({ behavior: "smooth" }), 50); }}>
                <span className="ec-band">{Number(e.overall).toFixed(1)}</span>
                <span style={{ minWidth: 0 }}>
                  <b style={{ fontSize: 14 }}>{e.task}</b> <span style={{ fontSize: 13, color: "#5D5A8C" }}>· {e.words} words</span>
                  <span style={{ display: "block", fontSize: 13, color: "#5D5A8C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.prompt || e.text.slice(0, 90)}</span>
                </span>
                <span style={{ fontSize: 12.5, color: "#5D5A8C" }}>{fmt(e.at)}</span>
              </button>
            ))}
          </>}
      </div>
    </div>
  );
}

// Admin: the student's checked essays, newest first, read-only.
export function EssaysReport({ list, name, Report }) {
  const [open, setOpen] = useState(null);
  if (!list || !list.length) return <div style={{ fontSize: 13, color: "#666" }}>{name} has not checked an essay yet.</div>;
  return (
    <div className="ec" style={{ fontSize: 13 }}>
      <style>{CSS}</style>
      {list.map((e) => (
        <div key={e.at} style={{ borderTop: "1px solid #ECEAF8", padding: "6px 0" }}>
          <button type="button" className="ec-hist" style={{ borderTop: "none" }} onClick={() => setOpen(open === e.at ? null : e.at)} aria-expanded={open === e.at}>
            <span className="ec-band">{Number(e.overall).toFixed(1)}</span>
            <span style={{ minWidth: 0 }}><b>{e.task}</b> · {e.words} words<span style={{ display: "block", color: "#5D5A8C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.prompt || e.text.slice(0, 90)}</span></span>
            <span style={{ color: "#888" }}>{new Date(e.at).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })} {open === e.at ? "▲" : "▼"}</span>
          </button>
          {open === e.at && (
            <div style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", margin: "4px 0 8px" }}>
              <div className="ec-text" style={{ fontSize: 14, marginBottom: 14 }}>{e.text}</div>
              <Report ai={e.ai} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

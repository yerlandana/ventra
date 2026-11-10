// The "Words" step of a lesson: learn the lesson's words, then play three short games.
// Match pairs words with translations, Type writes the English word from its meaning, Gaps fills a sentence.
// Props: words, saved (best scores already stored), canSubmit, onSubmit(scores), onWorkbook (opens the grammar unit).
import { useState } from "react";

const INK = "#14123F";
const MUTED = "#6E6C8A";
const ACCENT = "#5F4FD9";
const GAMES = [["learn", "Learn"], ["match", "Match"], ["type", "Type"], ["gaps", "Gaps"]];
const GAME_LABELS = { match: "Match", type: "Type", gaps: "Gaps" };

const shuffle = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const norm = (s) => String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
const stemOf = (word) => (word.length >= 6 ? word.slice(0, -2) : word.length >= 4 ? word.slice(0, -1) : word);
// The example sentence with the word blanked out. The accepted answers are the word as it appears in the sentence, or its base form.
const gapOf = (item) => {
  const m = new RegExp(`\\b(${stemOf(item.word)}\\w*)`, "i").exec(item.ex);
  if (!m) return null;
  return { text: item.ex.slice(0, m.index) + "_____" + item.ex.slice(m.index + m[1].length), answers: [m[1], item.word] };
};
const pattern = (word, shown) => word.split("").map((ch, i) => (i < shown ? ch : "_")).join(" ");

const speak = (text) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang === "en-GB") || voices.find(v => v.lang.startsWith("en"));
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.lang = voice ? voice.lang : "en-GB";
  u.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
};

const Hear = ({ text }) => (
  <button type="button" aria-label={`Hear: ${text}`} onClick={() => speak(text)}
    style={{ width:34, height:34, borderRadius:999, border:"none", background:"#F1EFFC", cursor:"pointer", flexShrink:0, fontSize:15 }}>🔊</button>
);

const Result = ({ title, pct, onReplay, children }) => (
  <div style={{ textAlign:"center", padding:"14px 6px" }}>
    <div style={{ fontSize:13, fontWeight:800, color:MUTED, textTransform:"uppercase", letterSpacing:".05em" }}>{title}</div>
    <div aria-live="polite" style={{ fontSize:44, fontWeight:800, color:INK, margin:"4px 0" }}>{pct}%</div>
    {children}
    <button type="button" onClick={onReplay} style={{ marginTop:12, padding:"10px 20px", borderRadius:12, border:"none", background:ACCENT, color:"white", fontWeight:800, fontFamily:"inherit", cursor:"pointer" }}>Play again</button>
  </div>
);

// Match: tap a word, then its translation.
function MatchGame({ words, onDone, onReplay }) {
  const [setup] = useState(() => {
    const items = shuffle(words).slice(0, 6);
    return { items, left: shuffle(items.map((_, i) => i)), right: shuffle(items.map((_, i) => i)) };
  });
  const [lang, setLang] = useState("ru");
  const [matched, setMatched] = useState(() => new Set());
  const [selL, setSelL] = useState(null);
  const [selR, setSelR] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [flash, setFlash] = useState(null);
  const [pct, setPct] = useState(null);
  const n = setup.items.length;

  const choose = (side, idx) => {
    if (matched.has(idx) || pct !== null) return;
    const l = side === "l" ? idx : selL;
    const r = side === "r" ? idx : selR;
    if (l === null || r === null) { if (side === "l") setSelL(idx); else setSelR(idx); return; }
    setSelL(null); setSelR(null);
    if (l === r) {
      const next = new Set(matched).add(l);
      setMatched(next);
      speak(setup.items[l].word);
      if (next.size === n) { const score = Math.round(n / (n + mistakes) * 100); setPct(score); onDone(score); }
    } else {
      setMistakes(m => m + 1);
      setFlash({ l, r });
      setTimeout(() => setFlash(null), 500);
    }
  };
  const style = (done, selected, wrong) => ({
    display:"block", width:"100%", textAlign:"left", padding:"11px 14px", borderRadius:12, marginBottom:8, fontFamily:"inherit", fontSize:14.5, fontWeight:700, color:INK, cursor:done ? "default" : "pointer",
    border:`1.5px solid ${done ? "#3F9C5B" : wrong ? "#D9534F" : selected ? ACCENT : "#ECEBF3"}`, background:done ? "#E2F2E6" : wrong ? "#FDECEA" : selected ? "#E7E3FB" : "white",
  });
  if (pct !== null) return <Result title="Match" pct={pct} onReplay={onReplay}><div style={{ fontSize:14, color:MUTED }}>{mistakes === 0 ? "No mistakes." : `${mistakes} wrong ${mistakes === 1 ? "try" : "tries"}.`}</div></Result>;
  return (
    <div>
      <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12, flexWrap:"wrap" }}>
        <span style={{ fontSize:14, color:MUTED, flex:1, minWidth:180 }}>Tap a word, then its meaning. {matched.size} of {n} matched.</span>
        <div role="group" aria-label="Translation language" style={{ display:"inline-flex", gap:3, background:"#F1EFFC", borderRadius:10, padding:3 }}>
          {[["ru", "RU"], ["kk", "KZ"]].map(([k, label]) => (
            <button key={k} type="button" aria-pressed={lang === k} onClick={() => setLang(k)}
              style={{ border:"none", borderRadius:7, padding:"4px 11px", fontWeight:800, fontSize:12.5, cursor:"pointer", fontFamily:"inherit", background:lang === k ? ACCENT : "transparent", color:lang === k ? "white" : INK }}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)", gap:12 }}>
        <div>{setup.left.map(i => <button key={i} type="button" disabled={matched.has(i)} onClick={() => choose("l", i)} style={style(matched.has(i), selL === i, flash && flash.l === i)}>{setup.items[i].word}</button>)}</div>
        <div>{setup.right.map(i => <button key={i} type="button" disabled={matched.has(i)} onClick={() => choose("r", i)} style={style(matched.has(i), selR === i, flash && flash.r === i)}>{setup.items[i][lang]}</button>)}</div>
      </div>
    </div>
  );
}

// Type and Gaps: write the missing word. One point for a first try, half a point for a second try.
function TypingGame({ title, intro, makeRounds, onDone, onReplay }) {
  const [rounds] = useState(makeRounds);
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [tries, setTries] = useState(0);
  const [phase, setPhase] = useState("answering");
  const [note, setNote] = useState(null);
  const [earned, setEarned] = useState([]);
  const [pct, setPct] = useState(null);
  const r = rounds[i];

  const check = () => {
    if (phase !== "answering") return;
    const v = norm(value);
    if (!v) { setNote({ t: "no", m: "Write your answer first." }); return; }
    if (r.answers.some(a => norm(a) === v)) {
      setEarned(e => [...e, tries === 0 ? 1 : 0.5]);
      setPhase("right"); setNote({ t: "ok", m: tries === 0 ? "Correct!" : "Correct, on the second try." }); speak(r.answer);
    } else if (tries === 0) {
      setTries(1); setNote({ t: "no", m: "Not yet. Here is one more letter. Try again." });
    } else {
      setEarned(e => [...e, 0]);
      setPhase("revealed"); setNote({ t: "model", m: `The answer is: ${r.answer}` }); speak(r.answer);
    }
  };
  const next = () => {
    if (i + 1 === rounds.length) {
      const score = Math.round(earned.reduce((a, b) => a + b, 0) / rounds.length * 100);
      setPct(score); onDone(score); return;
    }
    setI(i + 1); setValue(""); setTries(0); setPhase("answering"); setNote(null);
  };
  const noteColors = { ok: ["#E2F2E6", "#1D5E31"], no: ["#FDECEA", "#B3261E"], model: ["#FBF5E6", "#6F5010"] };

  if (pct !== null) {
    const missed = rounds.filter((_, k) => earned[k] !== 1).map(x => x.answer);
    return <Result title={title} pct={pct} onReplay={onReplay}>{missed.length > 0 && <div style={{ fontSize:14, color:MUTED }}>Review: <b style={{ color:INK }}>{missed.join(", ")}</b></div>}</Result>;
  }
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:700, color:MUTED }}><span>{intro}</span><span>{i + 1} of {rounds.length}</span></div>
      <div style={{ height:6, borderRadius:6, background:"#F1EFFC", margin:"8px 0 14px" }}><div style={{ height:"100%", width:`${(i + (phase === "answering" ? 0 : 1)) / rounds.length * 100}%`, borderRadius:6, background:"#C9973A", transition:"width .2s" }} /></div>
      <div style={{ fontSize:16, lineHeight:1.6, color:INK, marginBottom:10 }}>{r.clue}</div>
      <div aria-hidden="true" style={{ fontSize:20, letterSpacing:2, fontWeight:700, color:ACCENT, marginBottom:8, fontFamily:"monospace" }}>{pattern(r.answer, tries === 0 ? 1 : 2)}</div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <input value={value} disabled={phase !== "answering"} onChange={e => setValue(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (phase === "answering") check(); else next(); } }}
          aria-label="Your answer" autoComplete="off" autoCapitalize="off" spellCheck={false}
          style={{ flex:1, minWidth:160, padding:"10px 12px", borderRadius:10, border:"1.5px solid #D9D6F0", fontSize:16, fontFamily:"inherit", outline:"none" }} />
        {phase === "answering"
          ? <button type="button" onClick={check} style={{ padding:"10px 20px", borderRadius:10, border:"none", background:ACCENT, color:"white", fontWeight:800, fontFamily:"inherit", cursor:"pointer" }}>Check</button>
          : <button type="button" onClick={next} style={{ padding:"10px 20px", borderRadius:10, border:"none", background:"#C9973A", color:"#15225A", fontWeight:800, fontFamily:"inherit", cursor:"pointer" }}>{i + 1 === rounds.length ? "Finish" : "Next"}</button>}
      </div>
      {note && <div aria-live="polite" style={{ marginTop:10, padding:"8px 12px", borderRadius:10, fontSize:14, fontWeight:600, background:noteColors[note.t][0], color:noteColors[note.t][1] }}>{note.m}</div>}
    </div>
  );
}

const typeRounds = (words) => () => shuffle(words).map(x => ({
  key: x.word, answer: x.word, answers: [x.word],
  clue: <><b>{x.ru}</b> · <b>{x.kk}</b><div style={{ fontSize:14, color:MUTED }}>{x.def}</div></>,
}));
const gapRounds = (words) => () => shuffle(words).map(x => ({ x, g: gapOf(x) })).filter(o => o.g).map(({ x, g }) => ({
  key: x.word, answer: g.answers[0], answers: g.answers,
  clue: <>{g.text}<div style={{ fontSize:14, color:MUTED, marginTop:4 }}>{x.ru} · {x.kk}</div></>,
}));

function GameShell({ game, words, onDone }) {
  const [run, setRun] = useState(0);
  const replay = () => setRun(n => n + 1);
  if (game === "match") return <MatchGame key={run} words={words} onDone={(p) => onDone("match", p)} onReplay={replay} />;
  if (game === "type") return <TypingGame key={run} title="Type" intro="Write the English word." makeRounds={typeRounds(words)} onDone={(p) => onDone("type", p)} onReplay={replay} />;
  return <TypingGame key={run} title="Gaps" intro="Fill the gap." makeRounds={gapRounds(words)} onDone={(p) => onDone("gaps", p)} onReplay={replay} />;
}

export default function WordGames({ words, saved, canSubmit, onSubmit, onWorkbook }) {
  const [tab, setTab] = useState("learn");
  const [scores, setScores] = useState({ match: null, type: null, gaps: null });
  const [saving, setSaving] = useState(false);
  const known = (k) => (saved && saved[k] != null ? saved[k] : null);
  const best = (k) => (scores[k] === null ? known(k) : Math.max(scores[k], known(k) === null ? 0 : known(k)));
  const allPlayed = Object.keys(GAME_LABELS).every(k => best(k) !== null);
  const improved = Object.keys(GAME_LABELS).some(k => best(k) !== known(k));
  const done = (game, pct) => setScores(s => ({ ...s, [game]: Math.max(s[game] ?? 0, pct) }));
  const save = async () => {
    setSaving(true);
    try { await onSubmit({ match: best("match"), type: best("type"), gaps: best("gaps") }); } finally { setSaving(false); }
  };

  return (
    <div>
      <h3 style={{ margin:"0 0 4px", fontSize:18, fontWeight:800 }}>Lesson words</h3>
      <p style={{ margin:"0 0 12px", fontSize:14, color:"#55536F", lineHeight:1.55 }}>Learn {words.length} words from this lesson, then play the games. This step is optional, but it earns points.</p>
      <div role="group" aria-label="Words step" style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
        {GAMES.map(([k, label]) => (
          <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)}
            style={{ padding:"8px 16px", borderRadius:999, border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:800, fontSize:13.5, background:tab === k ? ACCENT : "#F1EFFC", color:tab === k ? "white" : INK }}>
            {label}{k !== "learn" && best(k) !== null ? ` · ${best(k)}%` : ""}
          </button>
        ))}
      </div>

      {tab === "learn" && (
        <div style={{ display:"grid", gap:10 }}>
          {words.map(x => (
            <div key={x.word} style={{ background:"#F7F7FB", borderRadius:14, padding:"12px 14px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <span style={{ fontSize:20, fontWeight:800, color:INK }}>{x.word}</span>
                <span style={{ fontSize:13, color:MUTED, fontStyle:"italic" }}>{x.pos}</span>
                <Hear text={x.word} />
              </div>
              <div style={{ fontSize:14, color:"#55536F", margin:"2px 0 6px" }}>{x.def}</div>
              <div style={{ fontSize:15, fontWeight:700, color:INK }}><span style={{ color:ACCENT, fontSize:11, fontWeight:800 }}>KZ</span> {x.kk}</div>
              <div style={{ fontSize:15, fontWeight:700, color:INK }}><span style={{ color:ACCENT, fontSize:11, fontWeight:800 }}>RU</span> {x.ru}</div>
              <div style={{ fontSize:14, color:INK, marginTop:6, fontStyle:"italic" }}>{x.ex}</div>
            </div>
          ))}
          <button type="button" onClick={() => setTab("match")} style={{ justifySelf:"start", padding:"11px 22px", borderRadius:12, border:"none", background:ACCENT, color:"white", fontWeight:800, fontFamily:"inherit", cursor:"pointer" }}>Start the games ›</button>
        </div>
      )}
      {tab !== "learn" && <div key={tab} style={{ background:"white", border:"1px solid #ECEBF3", borderRadius:16, padding:16 }}><GameShell game={tab} words={words} onDone={done} /></div>}

      <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:16, flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:180, fontSize:13, color:MUTED, lineHeight:1.45 }}>
          {saved ? `Saved: Match ${known("match")}% · Type ${known("type")}% · Gaps ${known("gaps")}%.` : allPlayed ? "You played all three games. Save your result." : "Play Match, Type and Gaps, then save your result."}
        </div>
        {onWorkbook && <button type="button" onClick={onWorkbook} style={{ padding:"10px 16px", borderRadius:12, border:"1.5px solid #D9D6F0", background:"white", fontWeight:700, fontFamily:"inherit", cursor:"pointer", color:INK }}>Grammar practice in the Workbook ›</button>}
        {canSubmit && allPlayed && (!saved || improved) && (
          <button type="button" disabled={saving} onClick={save} style={{ padding:"11px 22px", borderRadius:12, border:"none", fontWeight:800, fontSize:14, fontFamily:"inherit", background:saving ? "#E7E6F0" : ACCENT, color:saving ? "#8B8AA6" : "white", cursor:saving ? "default" : "pointer" }}>{saving ? "Saving..." : saved ? "Save new scores" : "Save result"}</button>
        )}
      </div>
    </div>
  );
}

// Daily English: a word of the day, a podcast of the day and a short reading, all at the level the student picks.
// DailyPage is the full page. DailyStrip is the short version shown on the dashboard.
import { useState } from "react";
import { DAILY_LEVELS, WORDS, READINGS, dayNumber, pickByDay } from "./daily";
import { PODCASTS } from "./dailyPodcasts";

const LEVEL_KEY = "lms_daily_level";
const INK = "#14123F";
const MUTED = "#6E6C8A";
const ACCENT = "#6A5BD6";

// The level is a convenience kept on this device, so nothing is lost if storage is blocked.
export function useDailyLevel() {
  const [level, setLevel] = useState(() => {
    try { const v = localStorage.getItem(LEVEL_KEY); return DAILY_LEVELS.includes(v) ? v : "B1"; } catch (e) { return "B1"; }
  });
  const change = (v) => {
    setLevel(v);
    try { localStorage.setItem(LEVEL_KEY, v); } catch (e) { /* the choice still works for this visit */ }
  };
  return [level, change];
}

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

const HearButton = ({ text, label }) => (
  <button type="button" aria-label={label || `Hear: ${text}`} onClick={() => speak(text)}
    style={{ width:38, height:38, borderRadius:999, border:"none", background:"white", cursor:"pointer", flexShrink:0, fontSize:16 }}>🔊</button>
);

// Marks the word in its example sentence, including endings such as "prepared" or "saving".
function Highlighted({ text, word }) {
  const first = word.split(" ")[0];
  const stem = first.length >= 6 ? first.slice(0, -2) : first.length >= 4 ? first.slice(0, -1) : first;
  const m = new RegExp(`\\b(${stem}\\w*)`, "i").exec(text);
  if (!m) return text;
  return <>{text.slice(0, m.index)}<mark style={{ background:"#F6E3B4", color:INK, borderRadius:4, padding:"0 3px" }}>{m[1]}</mark>{text.slice(m.index + m[1].length)}</>;
}

function LevelPills({ level, onChange }) {
  return (
    <div role="group" aria-label="Level" style={{ display:"inline-flex", gap:4, background:"#F1EFFC", borderRadius:12, padding:3 }}>
      {DAILY_LEVELS.map(l => (
        <button key={l} type="button" aria-pressed={level === l} onClick={() => onChange(l)}
          style={{ border:"none", borderRadius:9, padding:"6px 14px", fontWeight:800, fontSize:13.5, cursor:"pointer", fontFamily:"inherit", background:level === l ? ACCENT : "transparent", color:level === l ? "white" : INK }}>{l}</button>
      ))}
    </div>
  );
}

const Card = ({ bg, children, label, labelColor }) => (
  <section style={{ background:bg, borderRadius:20, padding:"18px 20px", marginBottom:16 }}>
    <div style={{ fontSize:12, fontWeight:800, letterSpacing:".06em", textTransform:"uppercase", color:labelColor, marginBottom:8 }}>{label}</div>
    {children}
  </section>
);

function WordCard({ level, day }) {
  const [showOlder, setShowOlder] = useState(false);
  const item = pickByDay(WORDS[level], day);
  const older = [1, 2, 3, 4, 5, 6].map(k => pickByDay(WORDS[level], day - k));
  const row = (tag, text) => (
    <div style={{ display:"flex", gap:10, alignItems:"baseline", marginTop:6 }}>
      <span style={{ flexShrink:0, width:30, textAlign:"center", fontSize:11, fontWeight:800, background:"white", color:ACCENT, borderRadius:6, padding:"2px 0" }}>{tag}</span>
      <span style={{ fontSize:17, fontWeight:700, color:INK }}>{text}</span>
    </div>
  );
  return (
    <Card bg="#F1EFFC" label={`Word of the day · ${level}`} labelColor={ACCENT}>
      <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
        <span style={{ fontSize:"clamp(30px,6vw,40px)", fontWeight:800, color:INK, lineHeight:1.1 }}>{item.word}</span>
        <span style={{ fontSize:14, color:MUTED, fontStyle:"italic" }}>{item.pos}</span>
        <HearButton text={item.word} />
      </div>
      <p style={{ margin:"6px 0 4px", fontSize:15, color:INK }}>{item.def}</p>
      {row("KZ", item.kk)}
      {row("RU", item.ru)}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:14, background:"white", borderRadius:14, padding:"12px 14px" }}>
        <p style={{ margin:0, flex:1, fontSize:15.5, lineHeight:1.55, color:INK }}><Highlighted text={item.ex} word={item.word} /></p>
        <HearButton text={item.ex} label="Hear the sentence" />
      </div>
      <button type="button" aria-expanded={showOlder} onClick={() => setShowOlder(o => !o)}
        style={{ marginTop:12, border:"none", background:"none", color:ACCENT, fontWeight:800, fontSize:13.5, cursor:"pointer", fontFamily:"inherit", padding:0 }}>
        {showOlder ? "Hide earlier words ▲" : "Earlier words ▼"}
      </button>
      {showOlder && (
        <div style={{ marginTop:8, display:"grid", gap:6 }}>
          {older.map((o, i) => (
            <div key={o.word} style={{ background:"white", borderRadius:12, padding:"8px 12px", fontSize:14, color:INK }}>
              <b>{o.word}</b> <span style={{ color:MUTED }}>· {o.kk} · {o.ru}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function PodcastCard({ day }) {
  const [shift, setShift] = useState(0);
  const ep = pickByDay(PODCASTS, day, shift);
  return (
    <Card bg="#FDF3E3" label={shift === 0 ? "Podcast of the day · 6 Minute English" : "Shuffled podcast · 6 Minute English"} labelColor="#8A5A12">
      <div style={{ fontSize:"clamp(20px,4vw,26px)", fontWeight:800, color:INK, lineHeight:1.25 }}>{ep.title}</div>
      <div style={{ fontSize:13, color:MUTED, marginTop:4 }}>BBC Learning English · {ep.date} · about 6 minutes</div>
      <ol style={{ margin:"12px 0 14px", paddingLeft:20, fontSize:14.5, lineHeight:1.7, color:INK }}>
        <li>Listen once without the text.</li>
        <li>Listen again and read the transcript.</li>
        <li>Write down three new words and one opinion.</li>
      </ol>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
        <a href={ep.url} target="_blank" rel="noreferrer"
          style={{ background:"#C9973A", color:"#15225A", fontWeight:800, fontSize:14, padding:"11px 20px", borderRadius:12, textDecoration:"none" }}>Listen on BBC ›</a>
        <button type="button" onClick={() => setShift(s => s + 1 + Math.floor(Math.random() * (PODCASTS.length - 1)))}
          style={{ background:"white", border:"none", fontWeight:800, fontSize:14, padding:"11px 18px", borderRadius:12, cursor:"pointer", fontFamily:"inherit", color:INK }}>🔀 Shuffle</button>
        {shift !== 0 && <button type="button" onClick={() => setShift(0)} style={{ border:"none", background:"none", color:"#8A5A12", fontWeight:700, fontSize:13.5, cursor:"pointer", fontFamily:"inherit" }}>Back to today's podcast</button>}
      </div>
      <p style={{ margin:"12px 0 0", fontSize:12, color:MUTED, lineHeight:1.5 }}>6 Minute English is made by BBC Learning English. The link opens the BBC page, where you can listen and read the transcript.</p>
    </Card>
  );
}

function ReadingBody({ item }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const total = item.questions.length;
  const answered = Object.keys(answers).length;
  const score = item.questions.filter((q, i) => answers[i] === q.answer).length;
  return (
    <>
      <div style={{ fontSize:"clamp(20px,4vw,24px)", fontWeight:800, color:INK }}>{item.title}</div>
      <div style={{ fontSize:13, color:MUTED, margin:"2px 0 10px" }}>{item.level} · {item.text.split(/\s+/).length} words</div>
      <p style={{ margin:"0 0 14px", fontSize:15.5, lineHeight:1.75, color:INK, background:"white", borderRadius:14, padding:"14px 16px" }}>{item.text}</p>
      {item.questions.map((q, i) => {
        const options = q.kind === "tfng" ? ["True", "False", "Not Given"] : q.options;
        return (
          <fieldset key={i} style={{ border:"none", padding:0, margin:"0 0 12px" }}>
            <legend style={{ fontSize:14.5, fontWeight:700, color:INK, marginBottom:6, padding:0 }}>{i + 1}. {q.q}</legend>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {options.map((o, k) => {
                const picked = answers[i] === k;
                const right = checked && k === q.answer;
                const wrong = checked && picked && k !== q.answer;
                return (
                  <label key={o} style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"8px 13px", borderRadius:12, cursor:checked ? "default" : "pointer", fontSize:14, fontWeight:600, color:INK, background:right ? "#E2F2E6" : wrong ? "#FDECEA" : picked ? "#E7E3FB" : "white", border:`1.5px solid ${right ? "#3F9C5B" : wrong ? "#D9534F" : picked ? ACCENT : "#ECEBF3"}` }}>
                    <input type="radio" name={`rd-${item.id}-${i}`} checked={picked} disabled={checked} onChange={() => setAnswers(a => ({ ...a, [i]: k }))} />
                    {o}
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}
      <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
        {!checked
          ? <button type="button" disabled={answered < total} onClick={() => setChecked(true)}
              style={{ padding:"11px 22px", borderRadius:12, border:"none", fontWeight:800, fontSize:14, fontFamily:"inherit", background:answered < total ? "#E7E6F0" : ACCENT, color:answered < total ? "#8B8AA6" : "white", cursor:answered < total ? "not-allowed" : "pointer" }}>Check answers</button>
          : <>
              <span aria-live="polite" style={{ fontWeight:800, fontSize:16, color:INK }}>{score} of {total} correct</span>
              <button type="button" onClick={() => { setAnswers({}); setChecked(false); }} style={{ padding:"9px 16px", borderRadius:12, border:"1.5px solid #D9D6F0", background:"white", fontWeight:700, fontFamily:"inherit", cursor:"pointer", color:INK }}>Try again</button>
            </>}
        {!checked && answered < total && <span style={{ fontSize:13, color:MUTED }}>{total - answered} left</span>}
      </div>
    </>
  );
}

function ReadingCard({ level, day }) {
  const [shift, setShift] = useState(0);
  const item = pickByDay(READINGS[level], day, shift);
  return (
    <Card bg="#E9F6EC" label={shift === 0 ? `Reading of the day · ${level}` : `Another reading · ${level}`} labelColor="#2F7D4A">
      <ReadingBody key={item.id} item={item} />
      <button type="button" onClick={() => setShift(s => s + 1)} style={{ marginTop:14, border:"none", background:"none", color:"#2F7D4A", fontWeight:800, fontSize:13.5, cursor:"pointer", fontFamily:"inherit", padding:0 }}>Another text ›</button>
    </Card>
  );
}

export default function DailyPage() {
  const [level, setLevel] = useDailyLevel();
  const day = dayNumber();
  const today = new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long" });
  return (
    <div style={{ maxWidth:860, margin:"0 auto", padding:"8px 0 40px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:14 }}>
        <div style={{ flex:1, minWidth:200 }}>
          <h2 style={{ margin:0, fontSize:24, fontWeight:800, color:INK }}>Daily English</h2>
          <div style={{ fontSize:13, color:MUTED, marginTop:2 }}>{today}. A new word, podcast and text every day.</div>
        </div>
        <LevelPills level={level} onChange={setLevel} />
      </div>
      <WordCard level={level} day={day} key={`w-${level}`} />
      <PodcastCard day={day} />
      <ReadingCard level={level} day={day} key={`r-${level}`} />
    </div>
  );
}

// Dashboard version: today's word and the two other items, each opening the full page.
export function DailyStrip({ onOpen }) {
  const [level, setLevel] = useDailyLevel();
  const day = dayNumber();
  const word = pickByDay(WORDS[level], day);
  const ep = pickByDay(PODCASTS, day);
  const reading = pickByDay(READINGS[level], day);
  const tile = { display:"block", width:"100%", textAlign:"left", border:"none", borderRadius:20, padding:"16px 18px", cursor:"pointer", fontFamily:"inherit", color:INK, textDecoration:"none" };
  const label = (text, color) => <div style={{ fontSize:11.5, fontWeight:800, letterSpacing:".06em", textTransform:"uppercase", color, marginBottom:6 }}>{text}</div>;
  return (
    <div>
      <div style={{ marginBottom:10 }}><LevelPills level={level} onChange={setLevel} /></div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:14 }}>
        <button type="button" onClick={onOpen} style={{ ...tile, background:"#F1EFFC" }}>
          {label("Word of the day", ACCENT)}
          <div style={{ fontSize:26, fontWeight:800, lineHeight:1.15 }}>{word.word}</div>
          <div style={{ fontSize:14, marginTop:6 }}><b>KZ</b> {word.kk}</div>
          <div style={{ fontSize:14, marginTop:2 }}><b>RU</b> {word.ru}</div>
        </button>
        <a href={ep.url} target="_blank" rel="noreferrer" style={{ ...tile, background:"#FDF3E3" }}>
          {label("Podcast of the day", "#8A5A12")}
          <div style={{ fontSize:17, fontWeight:800, lineHeight:1.3 }}>{ep.title}</div>
          <div style={{ fontSize:13, color:MUTED, marginTop:6 }}>6 Minute English · BBC · Listen ›</div>
        </a>
        <button type="button" onClick={onOpen} style={{ ...tile, background:"#E9F6EC" }}>
          {label("Reading of the day", "#2F7D4A")}
          <div style={{ fontSize:17, fontWeight:800, lineHeight:1.3 }}>{reading.title}</div>
          <div style={{ fontSize:13, color:MUTED, marginTop:6 }}>{reading.level} · {reading.questions.length} questions · Read ›</div>
        </button>
      </div>
    </div>
  );
}

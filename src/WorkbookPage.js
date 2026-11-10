// Writing and Grammar Workbook. A student's answers save to their account as they type, so progress follows them to any device.
// The teacher opens the same component read-only from the admin panel.
// props: email, name, store { load, save } (omitted when readOnly), readOnly, initial (the saved workbook, for readOnly).
import { useState, useEffect, useRef } from "react";
import { LEVELS, unitsOf, checkLine, gapAccepted, progressOf, summarize } from "./workbook";

const STYLE = `
.wb{--indigo:#2A2680;--navy:#15225A;--gold:#C9973A;--gold-2:#E4BF6C;--gold-soft:#FBF5E6;--gold-ink:#6F5010;--lav:#F1EFFC;--line:#DAD7F0;--rule:#ECEAF8;--muted:#5D5A8C;--good:#1D6B3A;--good-bg:#E8F5EC;--bad:#A92C2C;--bad-bg:#FBEAEA;color:var(--navy);font-size:16px;line-height:1.55;max-width:1100px;margin:0 auto;padding-bottom:40px}
.wb button,.wb input,.wb textarea{font:inherit;color:inherit}
.wb button{cursor:pointer;touch-action:manipulation}
.wb :focus-visible{outline:3px solid var(--gold);outline-offset:2px}
.wb-head{background:var(--indigo);color:#fff;border-radius:16px;padding:14px 18px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:16px}
.wb-head h2{margin:0;font-size:19px;flex:1;min-width:180px}
.wb-levels{display:flex;gap:4px;background:rgba(255,255,255,.12);border-radius:10px;padding:3px;flex-wrap:wrap}
.wb-levels button{border:none;background:none;color:#fff;border-radius:8px;padding:6px 12px;font-weight:700;font-size:13.5px}
.wb-levels button[aria-pressed=true]{background:var(--gold);color:var(--navy)}
.wb-status{font-size:12.5px;font-weight:700;color:var(--gold-2);min-width:70px;text-align:right}
.wb-status.err{color:#FFB4B4}
.wb-grid{display:grid;grid-template-columns:250px minmax(0,1fr);gap:18px;align-items:start}
@media (max-width:820px){.wb-grid{grid-template-columns:minmax(0,1fr)}}
.wb-side{background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px}
.wb-side h3{font-size:11.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:10px 8px 6px}
.wb-unit{display:flex;align-items:center;gap:8px;width:100%;text-align:left;border:none;background:none;border-radius:9px;padding:8px 10px;font-size:14px;font-weight:600}
.wb-unit:hover{background:var(--lav)}
.wb-unit[aria-current=true]{background:var(--indigo);color:#fff}
.wb-pct{margin-left:auto;font-size:11.5px;font-weight:800;font-variant-numeric:tabular-nums;color:var(--muted)}
.wb-unit[aria-current=true] .wb-pct{color:var(--gold-2)}
.wb-pct.full{color:var(--good)}
.wb-page{background:#fff;border:1px solid var(--line);border-radius:16px;padding:24px;min-width:0}
.wb-eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.08em;font-weight:800;color:var(--gold-ink)}
.wb-page h1{font-size:clamp(24px,4.5vw,32px);line-height:1.15;margin:4px 0 6px;font-weight:800}
.wb-lead{color:var(--muted);margin:0 0 6px;max-width:62ch}
.wb-task{border-top:1px solid var(--line);margin-top:22px;padding-top:18px}
.wb-task h2{font-size:18px;margin:0 0 4px}
.wb-how{font-size:14px;color:var(--muted);margin:0 0 12px;max-width:62ch}
.wb-item{display:grid;grid-template-columns:30px minmax(0,1fr);gap:10px;padding:10px 0;border-bottom:1px dashed var(--rule)}
.wb-item:last-child{border-bottom:none}
.wb-n{width:26px;height:26px;border-radius:7px;background:var(--lav);color:var(--indigo);font-weight:800;font-size:12.5px;display:flex;align-items:center;justify-content:center;font-variant-numeric:tabular-nums}
.wb-item.done .wb-n{background:var(--good-bg);color:var(--good)}
.wb-prompt{font-weight:600;margin-bottom:6px}
.wb-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.wb-line{flex:1;min-width:0;width:100%;border:none;border-bottom:2px solid var(--line);background:transparent;padding:6px 2px;font-size:15.5px;outline-offset:4px}
.wb-line:focus{border-bottom-color:var(--indigo)}
.wb-lined{width:100%;min-height:64px;resize:vertical;border:1.5px solid var(--line);border-radius:10px;padding:10px 12px;font-size:15.5px;line-height:30px;background:repeating-linear-gradient(transparent 0 29px,var(--rule) 29px 30px);background-attachment:local}
.wb-btn{border:none;border-radius:9px;padding:7px 13px;font-weight:700;font-size:13.5px;background:var(--lav);color:var(--indigo)}
.wb-btn.main{background:var(--gold);color:var(--navy)}
.wb-btn.ghost{background:none;border:1.5px solid var(--line)}
@media (pointer:coarse){.wb-btn{min-height:44px;padding:9px 18px}.wb-unit{min-height:44px}}
.wb-fb{font-size:14px;margin-top:6px;border-radius:9px;padding:8px 12px}
.wb-fb.ok{background:var(--good-bg);color:var(--good)}
.wb-fb.no{background:var(--bad-bg);color:var(--bad)}
.wb-fb.model{background:var(--gold-soft);color:var(--gold-ink)}
.wb-example{background:var(--lav);border-radius:10px;padding:10px 14px;font-size:14.5px;margin-bottom:12px}
.wb-frame label{display:block;font-size:13px;font-weight:800;color:var(--indigo);margin-bottom:4px}
.wb-frame>div{margin-bottom:10px}
.wb-count{font-size:12.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.wb-foot{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px;align-items:center}
.wb-confirm{background:var(--gold-soft);border-radius:10px;padding:10px 14px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:12px}
.wb-note{background:var(--gold-soft);color:var(--gold-ink);border-radius:10px;padding:10px 14px;font-size:14px;margin-bottom:14px}
`;

const LEVEL_TABS = [["6", "5.0 to 6.0"], ["7", "6.5 to 7.5"], ["c", "By lesson"]];
const cacheKey = (email) => `lms_workbook_${email}`;
const parseAnswers = (raw) => {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw) || {}; } catch (e) { return {}; }
};
const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;
const modelNote = (answers, key, to) => checkLine(answers, key, [to])
  ? { t: "ok", m: `Exactly like the model: ${to}` }
  : { t: "model", m: `Model answer: ${to}` };

export default function WorkbookPage({ email, name, store, readOnly = false, initial = null }) {
  const [level, setLevel] = useState("6");
  const [unitId, setUnitId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");
  const [fb, setFb] = useState({});
  const [askClear, setAskClear] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");
  const [copyText, setCopyText] = useState("");
  const answersRef = useRef({});
  const dirty = useRef(false);
  const timer = useRef(null);
  const storeRef = useRef(store);
  const flushRef = useRef(() => {});
  const topRef = useRef(null);
  storeRef.current = store;

  // Load the saved answers. A copy kept on the device wins only if it is newer, for example after a dropped connection.
  useEffect(() => {
    if (readOnly) { const a = parseAnswers(initial && initial.answers); answersRef.current = a; setAnswers(a); setReady(true); return undefined; }
    let off = false;
    Promise.resolve(storeRef.current.load()).catch(() => null).then(remote => {
      if (off) return;
      let local = null;
      try { local = JSON.parse(localStorage.getItem(cacheKey(email))); } catch (e) { local = null; }
      const useLocal = !!local && String(local.updatedAt || "") > String((remote && remote.updatedAt) || "");
      const a = parseAnswers((useLocal ? local : remote) && (useLocal ? local : remote).answers);
      answersRef.current = a; setAnswers(a); setReady(true);
      if (useLocal) { dirty.current = true; flushRef.current(); }
    });
    return () => { off = true; };
  }, [email, readOnly, initial]);

  const flush = async () => {
    clearTimeout(timer.current);
    if (readOnly || !dirty.current) return;
    dirty.current = false;
    const current = answersRef.current;
    const wb = { v: 1, answers: JSON.stringify(current), ...summarize(current), updatedAt: new Date().toISOString() };
    try { localStorage.setItem(cacheKey(email), JSON.stringify(wb)); } catch (e) { /* the account copy still saves */ }
    try { await storeRef.current.save(wb); setStatus("saved"); } catch (e) { dirty.current = true; setStatus("error"); }
  };
  flushRef.current = flush;

  useEffect(() => {
    const onHide = () => { if (document.hidden) flushRef.current(); };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      flushRef.current();
    };
  }, []);

  const update = (patch, remove = []) => {
    if (readOnly) return;
    const next = { ...answersRef.current, ...patch };
    remove.forEach(k => { delete next[k]; });
    answersRef.current = next;
    setAnswers(next);
    dirty.current = true;
    setStatus("saving");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => flushRef.current(), 900);
  };

  const L = LEVELS[level];
  const units = unitsOf(level);
  const u = units.find(x => x.id === unitId) || units[0];
  const val = (k) => answers[k] ?? "";
  const toTop = () => { if (!readOnly && topRef.current) topRef.current.scrollIntoView({ block: "start" }); };
  const pickLevel = (lv) => { setLevel(lv); setUnitId(null); setFb({}); setAskClear(false); setCopyMsg(""); setCopyText(""); toTop(); };
  const pickUnit = (id) => { setUnitId(id); setFb({}); setAskClear(false); setCopyMsg(""); setCopyText(""); toTop(); };

  const check = (k, accepted, example) => {
    const typed = String(val(k)).trim();
    if (!typed) { setFb(f => ({ ...f, [k]: { t: "no", m: "Write your answer first." } })); return; }
    if (checkLine(answers, k, accepted)) { setFb(f => ({ ...f, [k]: { t: "ok", m: `Correct. ${example}` } })); return; }
    const tries = (answers[`${k}:tries`] || 0) + 1;
    update({ [`${k}:tries`]: tries });
    setFb(f => ({ ...f, [k]: tries >= 2
      ? { t: "model", m: `Answer: ${accepted[0]}. ${example}` }
      : { t: "no", m: `Not yet. Hint: it starts with “${accepted[0].split(" ")[0]}”.` } }));
  };
  const showFb = (k, ok, example) => {
    const n = fb[k] || (ok ? { t: "ok", m: `Correct. ${example}` } : null);
    return n ? <div className={`wb-fb ${n.t}`}>{n.m}</div> : null;
  };

  const checkRow = (k, i, prompt, accepted, example, label) => {
    const ok = checkLine(answers, k, accepted);
    return (
      <div key={k} className={"wb-item" + (ok ? " done" : "")}>
        <span className="wb-n">{i + 1}</span>
        <div>
          <div className="wb-prompt">{prompt}</div>
          <div className="wb-row">
            <input className="wb-line" value={val(k)} readOnly={readOnly} aria-label={label} autoComplete="off" spellCheck={false}
              onChange={e => update({ [k]: e.target.value })}
              onKeyDown={e => { if (e.key === "Enter" && !readOnly) { e.preventDefault(); check(k, accepted, example); } }} />
            {!readOnly && <button type="button" className="wb-btn" onClick={() => check(k, accepted, example)}>Check</button>}
          </div>
          {showFb(k, ok, example)}
        </div>
      </div>
    );
  };

  // Sentences the student rewrites, compared with a model answer. The teacher sees the model straight away.
  const rewriteTask = (title, items, prefix) => (
    <section className="wb-task">
      <h2>{title}</h2>
      <p className="wb-how">Write your version{readOnly ? "." : ", then compare it with the model answer. Other correct versions are possible."}</p>
      {items.map((it, i) => {
        const k = `${prefix}${i}`;
        const shown = readOnly || answers[`${k}:shown`];
        const n = shown ? modelNote(answers, k, it.to) : null;
        return (
          <div key={k} className={"wb-item" + (String(val(k)).trim() ? " done" : "")}>
            <span className="wb-n">{i + 1}</span>
            <div>
              <div className="wb-prompt">{it.from}</div>
              <textarea className="wb-lined" rows={2} value={val(k)} readOnly={readOnly} aria-label={`Your version of sentence ${i + 1}`} onChange={e => update({ [k]: e.target.value })} />
              {!readOnly && <div className="wb-row" style={{ marginTop: 6 }}><button type="button" className="wb-btn" onClick={() => update({ [`${k}:shown`]: true })}>Compare with the model</button></div>}
              {n && <div className={`wb-fb ${n.t}`}>{n.m}</div>}
            </div>
          </div>
        );
      })}
    </section>
  );

  const topicBody = (tp) => {
    const frameKeys = L.frame.map((_, i) => `${level}:${u.id}:p${i}`);
    const words = wordCount(frameKeys.map(k => val(k)).join(" "));
    return (
      <>
        <div className="wb-eyebrow">{L.name} · Topic</div>
        <h1>{tp.title}</h1>
        <p className="wb-lead">Four tasks: upgrade the words, use them, practise the grammar, then write a full body paragraph.</p>
        <section className="wb-task">
          <h2>1. Upgrade the words</h2>
          <p className="wb-how">Write the {level === "6" ? "6.0" : "7.5"} phrase for each simple phrase.{readOnly ? "" : " Press Check to see if you are right."}</p>
          {tp.words.map((w, i) => checkRow(`${level}:${u.id}:w${i}`, i, `${w.from} →`, [w.to], w.example, `Better phrase for ${w.from}`))}
        </section>
        <section className="wb-task">
          <h2>2. Use them in your own sentences</h2>
          <p className="wb-how">Write one sentence about the topic with each phrase. Your teacher will read these.</p>
          {tp.words.map((w, i) => {
            const k = `${level}:${u.id}:s${i}`;
            const wk = `${level}:${u.id}:w${i}`;
            // The phrase stays hidden until task 1 is solved, so this task does not give away the answers.
            const known = readOnly || checkLine(answers, wk, [w.to]) || (answers[`${wk}:tries`] || 0) >= 2;
            return (
              <div key={k} className={"wb-item" + (String(val(k)).trim() ? " done" : "")}>
                <span className="wb-n">{i + 1}</span>
                <div>
                  <div className="wb-prompt">{known ? w.to : <>The phrase for “{w.from}” <span className="wb-count">(find it in task 1 first)</span></>}</div>
                  <input className="wb-line" value={val(k)} readOnly={readOnly} placeholder={readOnly ? "" : "Write your sentence"} aria-label={`Your sentence with ${known ? w.to : w.from}`}
                    onChange={e => update({ [k]: e.target.value })} />
                </div>
              </div>
            );
          })}
        </section>
        {rewriteTask(`3. Grammar: ${tp.grammar.skill.replace(/\.$/, "")}`, tp.grammar.items, `${level}:${u.id}:g`)}
        <section className="wb-task">
          <h2>4. Write a body paragraph</h2>
          <p className="wb-how">Question: <b>{tp.question}</b><br />Write one sentence for each part. Use at least two phrases from task 1.</p>
          <details className="wb-example">
            <summary><b>See the model paragraph</b> (another topic)</summary>
            {L.frame.map((f, i) => <div key={f}><b>{f}:</b> {L.frameExample[i]}</div>)}
          </details>
          <div className="wb-frame">
            {L.frame.map((f, i) => (
              <div key={f}>
                <label htmlFor={`wb-p${i}`}>{i + 1}. {f}</label>
                <textarea id={`wb-p${i}`} className="wb-lined" rows={2} value={val(frameKeys[i])} readOnly={readOnly} onChange={e => update({ [frameKeys[i]]: e.target.value })} />
              </div>
            ))}
          </div>
          <p className="wb-count">{words} words in the paragraph</p>
        </section>
      </>
    );
  };

  const grammarBody = (g) => (
    <>
      <div className="wb-eyebrow">{L.name} · Grammar</div>
      <h1>{u.title}</h1>
      <p className="wb-lead">{g.how}</p>
      {g.gaps && (
        <section className="wb-task">
          <h2>Fill in the gaps</h2>
          <p className="wb-how">Write the missing word or words{readOnly ? "." : ", then press Check."}</p>
          {g.gaps.map((gap, i) => checkRow(`${level}:${u.id}:x${i}`, i,
            <>{gap[0].replace("___", "_____")} <span className="wb-count">({gap[1]})</span></>,
            gapAccepted(gap), gap[0].replace("___", gap[2]), `Answer ${i + 1}`))}
        </section>
      )}
      {g.items && rewriteTask(g.gaps ? "Rewrite or correct each sentence" : "Rewrite each sentence", g.items, `${level}:${u.id}:${g.gaps ? "y" : "x"}`)}
    </>
  );

  const unitText = () => {
    const lines = [`IELTS8 Writing Workbook · ${L.name} · ${u.title}`, `Student: ${name || email}`, ""];
    if (u.topic) {
      const tp = u.topic;
      lines.push("1. Upgrade the words");
      tp.words.forEach((w, i) => { const k = `${level}:${u.id}:w${i}`; lines.push(`${i + 1}. ${w.from} → ${val(k) || "(blank)"}${checkLine(answers, k, [w.to]) ? " ✓" : ""}`); });
      lines.push("", "2. My sentences");
      tp.words.forEach((w, i) => lines.push(`${i + 1}. (${w.to}) ${val(`${level}:${u.id}:s${i}`) || "(blank)"}`));
      lines.push("", `3. Grammar: ${tp.grammar.skill}`);
      tp.grammar.items.forEach((it, i) => lines.push(`${i + 1}. ${it.from} → ${val(`${level}:${u.id}:g${i}`) || "(blank)"}`));
      lines.push("", `4. Paragraph: ${tp.question}`, L.frame.map((_, i) => val(`${level}:${u.id}:p${i}`)).join(" ").trim() || "(blank)");
    } else {
      const g = u.grammar, n = (g.gaps || []).length;
      (g.gaps || []).forEach((gap, i) => lines.push(`${i + 1}. ${gap[0]} → ${val(`${level}:${u.id}:x${i}`) || "(blank)"}`));
      (g.items || []).forEach((it, i) => lines.push(`${n + i + 1}. ${it.from} → ${val(`${level}:${u.id}:${g.gaps ? "y" : "x"}${i}`) || "(blank)"}`));
    }
    return lines.join("\n");
  };
  const copyUnit = () => {
    const text = unitText();
    const fallback = () => { setCopyText(text); setCopyMsg("Select the text below and copy it."); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => setCopyMsg("Copied."), fallback);
    else fallback();
  };
  const clearUnit = () => {
    const prefix = `${level}:${u.id}:`;
    update({}, Object.keys(answersRef.current).filter(k => k.startsWith(prefix)));
    setFb({}); setAskClear(false);
  };

  if (!ready) return <div className="wb"><style>{STYLE}</style><p className="wb-lead">Loading the workbook...</p></div>;

  let group = "";
  return (
    <div className="wb" ref={topRef}>
      <style>{STYLE}</style>
      <div className="wb-head">
        <h2>{readOnly ? "Student workbook" : "Writing and Grammar Workbook"}</h2>
        <div className="wb-levels" role="group" aria-label="Level">
          {LEVEL_TABS.map(([lv, label]) => <button key={lv} type="button" aria-pressed={level === lv} onClick={() => pickLevel(lv)}>{label}</button>)}
        </div>
        {!readOnly && (
          <span className={"wb-status" + (status === "error" ? " err" : "")} aria-live="polite">
            {status === "saving" ? "Saving..." : status === "saved" ? "Saved ✓" : status === "error" ? "Not saved. Retrying" : ""}
          </span>
        )}
      </div>
      {readOnly && <div className="wb-note">Read only. Answers are marked automatically where the answer is one word or phrase.{initial && initial.updatedAt ? ` Last saved ${new Date(initial.updatedAt).toLocaleString()}.` : ""}</div>}
      <div className="wb-grid">
        <nav className="wb-side" aria-label="Units">
          {units.map(x => {
            const head = x.group !== group ? <h3 key={`h-${x.group}`}>{x.group}</h3> : null;
            group = x.group;
            const p = progressOf(answers, level, x);
            return [head, (
              <button key={x.id} type="button" className="wb-unit" aria-current={x.id === u.id} onClick={() => pickUnit(x.id)}>
                {x.title}<span className={"wb-pct" + (p === 100 ? " full" : "")}>{p}%</span>
              </button>
            )];
          })}
        </nav>
        <main className="wb-page">
          {u.topic ? topicBody(u.topic) : grammarBody(u.grammar)}
          {!readOnly && (
            <div className="wb-foot">
              <button type="button" className="wb-btn main" onClick={copyUnit}>Copy this unit for my teacher</button>
              <button type="button" className="wb-btn ghost" onClick={() => setAskClear(true)}>Clear this unit</button>
              <span className="wb-count" aria-live="polite">{copyMsg}</span>
            </div>
          )}
          {copyText && <textarea className="wb-lined" readOnly value={copyText} style={{ marginTop: 10 }} onFocus={e => e.target.select()} />}
          {askClear && (
            <div className="wb-confirm">
              <span>Delete everything you wrote in this unit?</span>
              <button type="button" className="wb-btn main" onClick={clearUnit}>Yes, clear it</button>
              <button type="button" className="wb-btn ghost" onClick={() => setAskClear(false)}>Keep it</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

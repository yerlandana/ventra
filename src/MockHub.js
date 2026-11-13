// Mock Tests hub: every full practice test in one place, with the student's last and best result.
// MockHub is the full page, MockStrip the short row on the dashboard.
// props: email, store { load, save } for the account copy of the results.
import { useEffect, useState } from "react";
import { MOCKS, SKILLS, SKILL_COLOR, syncResults, readLocal, mergeResults, statsFor, fmtDate } from "./mockTests";

const STYLE = `
.mh{--indigo:#2A2680;--navy:#15225A;--gold:#C9973A;--gold-2:#E4BF6C;--gold-soft:#FBF5E6;--lav:#F1EFFC;--line:#E4E1F8;--muted:#5D5A8C;color:var(--navy)}
.mh button{font:inherit;color:inherit;cursor:pointer}
.mh :focus-visible{outline:3px solid var(--gold);outline-offset:2px}
.mh-hero{position:relative;overflow:hidden;background:linear-gradient(135deg,#2A2680,#15225A);color:#fff;border-radius:22px;padding:24px 26px;margin-bottom:18px}
.mh-hero:after{content:"";position:absolute;right:-60px;top:-80px;width:280px;height:280px;border-radius:50%;background:radial-gradient(closest-side,rgba(228,191,108,.45),transparent)}
.mh-hero h2{margin:0;font-size:26px;font-weight:800;position:relative}
.mh-hero p{margin:8px 0 0;max-width:60ch;color:#D9D5F7;font-size:15px;line-height:1.55;position:relative}
.mh-stats{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;position:relative}
.mh-stat{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);border-radius:14px;padding:9px 14px;min-width:110px}
.mh-stat b{display:block;font-size:20px;color:var(--gold-2);font-variant-numeric:tabular-nums}
.mh-stat span{font-size:12.5px;color:#D9D5F7}
.mh-filters{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 14px}
.mh-filter{border:1.5px solid var(--line);background:#fff;border-radius:999px;padding:7px 15px;font-weight:700;font-size:13.5px}
.mh-filter[aria-pressed=true]{background:var(--indigo);border-color:var(--indigo);color:#fff}
.mh-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
.mh-card{position:relative;display:flex;flex-direction:column;background:#fff;border:1px solid var(--line);border-radius:18px;padding:18px 18px 16px;box-shadow:0 10px 26px rgba(20,18,63,.06);overflow:hidden;min-width:0}
.mh-card:before{content:"";position:absolute;left:0;top:0;right:0;height:4px;background:var(--c)}
.mh-skill{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--c)}
.mh-skill i{width:8px;height:8px;border-radius:50%;background:var(--c)}
.mh-card h3{margin:8px 0 4px;font-size:17.5px;font-weight:800;line-height:1.25}
.mh-meta{font-size:13px;color:var(--muted);font-weight:600}
.mh-topics{font-size:13px;color:var(--muted);line-height:1.5;margin:10px 0 14px;flex:1}
.mh-result{display:flex;align-items:center;gap:10px;background:var(--lav);border-radius:12px;padding:9px 12px;margin-bottom:12px;font-size:13px}
.mh-result .band{font-size:22px;font-weight:800;color:var(--indigo);font-variant-numeric:tabular-nums;line-height:1}
.mh-result.none{background:#F7F7FB;color:var(--muted)}
.mh-go{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;border:none;border-radius:12px;padding:11px 14px;font-weight:800;font-size:14.5px;background:var(--gold);color:var(--navy);text-decoration:none;box-sizing:border-box}
.mh-go:hover{filter:brightness(1.05)}
.mh-go.again{background:#fff;border:1.5px solid var(--line);color:var(--indigo)}
.mh-soon{border-style:dashed;box-shadow:none;background:#FBFAFF}
.mh-soon .mh-go{background:#F1EFFC;color:var(--muted);cursor:default}
.mh-hist{margin-top:22px;background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px 18px}
.mh-hist h3{margin:0 0 8px;font-size:17px}
.mh-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:12px;align-items:center;padding:9px 0;border-top:1px solid #F0EEFA;font-size:14px}
.mh-row:first-of-type{border-top:none}
.mh-row .muted{color:var(--muted);font-size:12.5px}
.mh-note{font-size:12.5px;color:var(--muted);margin-top:10px;line-height:1.5}
.mh-strip{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.mh-mini{display:flex;flex-direction:column;gap:6px;text-align:left;background:#F7F7FB;border:none;border-radius:18px;padding:14px 16px;position:relative;overflow:hidden}
.mh-mini:hover{background:#F1EFFC}
.mh-mini b{font-size:14.5px;line-height:1.3}
.mh-mini .mh-meta{font-size:12.5px}
.mh-mini .tag{align-self:flex-start;font-size:12px;font-weight:800;padding:3px 9px;border-radius:999px;background:#fff;color:var(--indigo)}
`;

function useMockResults(email, store) {
  const [results, setResults] = useState(() => mergeResults([], readLocal(email)));
  useEffect(() => {
    let alive = true;
    const run = () => syncResults(email, store).then((r) => { if (alive) setResults(r); });
    run();
    // A test opens in a new tab; coming back to this tab picks up the new result.
    const onFocus = () => run();
    const onVisible = () => { if (document.visibilityState === "visible") run(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => { alive = false; window.removeEventListener("focus", onFocus); document.removeEventListener("visibilitychange", onVisible); };
    // The store object is rebuilt on every render of the parent; the email decides whose results these are.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);
  return results;
}

const bandText = (r) => (r.band == null ? (r.id.startsWith("speaking") ? "Recorded" : "-") : typeof r.band === "string" ? r.band.replace(/^below\s*/, "<") : r.band);
const scoreText = (r) =>
  r.raw != null ? `${r.raw}/${r.total} correct` : r.answered != null ? `${r.answered}/${r.total} answers recorded${r.self ? " · self-assessed" : ""}` : "";

function MockCard({ m, stats }) {
  return (
    <article className="mh-card" style={{ "--c": SKILL_COLOR[m.skill] }}>
      <span className="mh-skill"><i />{m.skill}</span>
      <h3>{m.title}</h3>
      <div className="mh-meta">{m.time} · {m.items}</div>
      <div className="mh-topics">{m.topics}</div>
      {stats ? (
        <div className="mh-result">
          <span className="band">{bandText(stats.last)}</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <b>Last result</b> · {fmtDate(stats.last.at)}<br />
            <span style={{ color: "#5D5A8C" }}>{scoreText(stats.last)}{stats.best != null && stats.tries > 1 ? ` · best ${stats.best}` : ""}</span>
          </span>
        </div>
      ) : (
        <div className="mh-result none">Not taken yet</div>
      )}
      <a className={"mh-go" + (stats ? " again" : "")} href={m.href} target="_blank" rel="noreferrer">
        {stats ? "Take it again" : "Start the test"} <span aria-hidden="true">↗</span>
      </a>
    </article>
  );
}

export default function MockHub({ email, store }) {
  const results = useMockResults(email, store);
  const [skill, setSkill] = useState("All");
  const shown = MOCKS.filter((m) => skill === "All" || m.skill === skill);
  const taken = new Set(results.map((r) => r.id)).size;
  const bestOf = (s) => {
    const b = results.filter((r) => r.skill === s && typeof r.band === "number").map((r) => r.band);
    return b.length ? Math.max(...b) : null;
  };
  const writingSoon = skill === "All" || skill === "Writing";

  return (
    <div className="mh">
      <style>{STYLE}</style>
      <section className="mh-hero">
        <h2>Mock Tests</h2>
        <p>Full practice tests in the IELTS format. Each one opens in a new tab and runs like the real exam. Your result comes back here when you finish.</p>
        <div className="mh-stats">
          <div className="mh-stat"><b>{taken}/{MOCKS.length}</b><span>tests taken</span></div>
          {["Listening", "Reading"].map((s) => (
            <div className="mh-stat" key={s}><b>{bestOf(s) ?? "-"}</b><span>best {s}</span></div>
          ))}
        </div>
      </section>

      <div className="mh-filters" role="group" aria-label="Filter by skill">
        {["All", ...SKILLS].map((s) => (
          <button key={s} type="button" className="mh-filter" aria-pressed={skill === s} onClick={() => setSkill(s)}>{s}</button>
        ))}
      </div>

      <div className="mh-grid">
        {shown.map((m) => <MockCard key={m.id} m={m} stats={statsFor(results, m.id)} />)}
        {writingSoon && (
          <article className="mh-card mh-soon" style={{ "--c": SKILL_COLOR.Writing }}>
            <span className="mh-skill"><i />Writing</span>
            <h3>Writing Test 1</h3>
            <div className="mh-meta">60 min · Task 1 and Task 2</div>
            <div className="mh-topics">Coming soon. Until then, practise in the Writing Workbook and the Essay Checker.</div>
            <span className="mh-go" aria-disabled="true">Coming soon</span>
          </article>
        )}
      </div>

      {results.length > 0 && (
        <section className="mh-hist">
          <h3>Your history</h3>
          {results.slice(0, 12).map((r) => {
            const m = MOCKS.find((x) => x.id === r.id);
            return (
              <div className="mh-row" key={`${r.id}-${r.run}`}>
                <span style={{ minWidth: 0 }}><b>{m ? m.title : r.id}</b><br /><span className="muted">{scoreText(r)}</span></span>
                <span className="muted">{fmtDate(r.at)}</span>
                <b style={{ color: "#2A2680", minWidth: 34, textAlign: "right" }}>{bandText(r)}</b>
              </div>
            );
          })}
          <div className="mh-note">Bands are estimates. Speaking is self-assessed: send your recordings to your teacher for a real score.</div>
        </section>
      )}
    </div>
  );
}

export function MockStrip({ email, store }) {
  const results = useMockResults(email, store);
  return (
    <div className="mh">
      <style>{STYLE}</style>
      <div className="mh-strip">
        {MOCKS.map((m) => {
          const s = statsFor(results, m.id);
          return (
            <a key={m.id} className="mh-mini" href={m.href} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
              <span className="mh-skill" style={{ "--c": SKILL_COLOR[m.skill] }}><i />{m.skill}</span>
              <b>{m.title}</b>
              <span className="mh-meta">{m.time} · {m.items}</span>
              <span className="tag">{s ? `Last: ${bandText(s.last)} · ${fmtDate(s.last.at)}` : "Not taken yet"}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

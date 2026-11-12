// The sign-in page: a dark, lamp-lit scene with a laptop that cycles through real screens of the platform,
// in the style of the IELTS8 promo reel. The sign-in controls are passed in as children.
// The screenshots live in public/login. With "reduce motion" switched on, the first screen stays still.
import { useEffect, useState } from "react";

const SHOTS = [
  { src: "/login/listen.jpg", chip: "LISTENING", line: "Full mock tests with exam-style audio" },
  { src: "/login/read.jpg", chip: "READING", line: "Timer, highlights and an instant band" },
  { src: "/login/speak.jpg", chip: "SPEAKING", line: "An examiner's voice, your answers recorded" },
  { src: "/login/wb.jpg", chip: "WRITING", line: "A workbook that saves your progress" },
  { src: "/login/daily.jpg", chip: "DAILY ENGLISH", line: "Word of the day in Kazakh and Russian" },
  { src: "/login/words.jpg", chip: "VOCABULARY", line: "Word games after every lesson" },
  { src: "/login/deck.jpg", chip: "THE COURSE", line: "From B1 to Band 8, step by step" },
];
const STEP_MS = 2800;

// Dust motes drifting up through the lamp light. Fixed values, so the page looks the same on every load.
const DUST = Array.from({ length: 26 }, (_, i) => {
  const r = (n) => { const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453; return x - Math.floor(x); };
  return { left: `${(r(1) * 100).toFixed(1)}%`, size: 2 + r(2) * 4, dur: 14 + r(3) * 16, delay: -r(4) * 30, op: 0.2 + r(5) * 0.5 };
});

const CSS = `
.ls{position:relative;min-height:100vh;overflow:hidden;color:#fff;background:linear-gradient(180deg,#0A0826 0%,#120F3C 45%,#0A0826 75%,#05040F 100%);
  display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);grid-template-areas:"copy stage" "auth stage";align-content:center;column-gap:clamp(24px,4vw,64px);row-gap:28px;
  padding:clamp(28px,5vh,56px) clamp(16px,5vw,72px);box-sizing:border-box;font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.ls-lamp{position:absolute;inset:0;pointer-events:none;background:radial-gradient(60vmax 50vmax at 6% 2%,rgba(255,214,130,.55),rgba(201,151,58,.24) 38%,rgba(201,151,58,0) 72%),radial-gradient(50vmax 40vmax at 88% 70%,rgba(95,79,217,.34),transparent 70%);animation:ls-breathe 7s ease-in-out infinite alternate}
.ls-vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(130% 100% at 50% 45%,transparent 55%,rgba(0,0,0,.5))}
.ls-dust{position:absolute;bottom:-10px;border-radius:50%;background:#F4D58D;pointer-events:none;animation:ls-rise linear infinite}
.ls-copy{grid-area:copy;position:relative;align-self:end}
.ls-brand{font-weight:800;font-size:22px;letter-spacing:.02em;margin-bottom:18px}
.ls-brand span,.ls-title i{color:#E4BF6C}
.ls-title{font-family:'Playfair Display',Georgia,serif;font-weight:600;font-size:clamp(34px,4.6vw,64px);line-height:1.06;margin:0;color:#FFF6E2;text-shadow:0 4px 30px rgba(0,0,0,.5);text-wrap:balance;animation:ls-up .9s cubic-bezier(.2,.8,.2,1) both}
.ls-sub{margin:16px 0 0;font-size:16px;line-height:1.55;color:#CFCBEF;max-width:44ch;animation:ls-up .9s .12s cubic-bezier(.2,.8,.2,1) both}
.ls-auth{grid-area:auth;position:relative;align-self:start;max-width:380px;animation:ls-up .9s .24s cubic-bezier(.2,.8,.2,1) both}
.ls-stage{grid-area:stage;position:relative;perspective:1700px;min-width:0}
.ls-laptop{transform-style:preserve-3d;transform-origin:50% 100%;animation:ls-float 9s ease-in-out infinite alternate}
.ls-bezel{position:relative;aspect-ratio:1.56;background:#0E0E14;border-radius:22px 22px 6px 6px;padding:2.2% 2.2% 2.6%;box-sizing:border-box;box-shadow:0 0 0 2px #2A2A36 inset,0 40px 120px rgba(0,0,0,.6)}
.ls-screen{position:relative;width:100%;height:100%;border-radius:6px;overflow:hidden;background:#fff}
.ls-shot{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top left;display:block}
.ls-shot.in{animation:ls-slide .5s cubic-bezier(.2,.8,.2,1) both}
.ls-flash{position:absolute;inset:0;background:#FFF3D6;pointer-events:none;animation:ls-flash .45s ease-out both}
.ls-glare{position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.16) 50%,transparent 60%);background-size:300% 100%;animation:ls-glare 7s linear infinite}
.ls-base{height:clamp(14px,1.6vw,24px);margin:0 -5.5%;background:linear-gradient(#C9C9D2,#6E6E7A 60%,#3A3A44);border-radius:0 0 40px 40px;position:relative}
.ls-base:before{content:"";position:absolute;left:50%;top:0;width:16%;height:45%;transform:translateX(-50%);background:#8E8E99;border-radius:0 0 12px 12px}
.ls-shadow{height:60px;margin:-10px 6% 0;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.7),transparent)}
.ls-label{text-align:center;margin-top:6px;min-height:96px}
.ls-chip{display:inline-block;padding:6px 16px;border-radius:999px;background:#C9973A;color:#15225A;font-weight:800;font-size:13px;letter-spacing:.14em;animation:ls-pop .35s cubic-bezier(.2,.8,.2,1.4) both}
.ls-line{margin-top:12px;font-weight:800;font-size:clamp(20px,2.2vw,28px);line-height:1.2;text-shadow:0 4px 24px rgba(0,0,0,.5);animation:ls-up .45s .06s cubic-bezier(.2,.8,.2,1) both}
.ls-card{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:20px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.ls-google{width:100%;padding:14px;border-radius:12px;border:none;background:#fff;color:#14123F;font-weight:700;font-size:15px;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 8px 30px rgba(228,191,108,.25);transition:transform .15s,box-shadow .15s}
.ls-google:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 12px 36px rgba(228,191,108,.4)}
.ls-google:disabled{opacity:.6;cursor:default}
.ls-google:focus-visible{outline:3px solid #E4BF6C;outline-offset:3px}
.ls-note{margin:12px 2px 0;font-size:13px;color:#B9B4E6;line-height:1.5}
.ls-err{margin:0 0 12px;padding:10px 12px;border-radius:10px;background:rgba(255,120,120,.14);color:#FFD1D1;font-size:13.5px}
@keyframes ls-breathe{to{opacity:.8;transform:scale(1.04)}}
@keyframes ls-rise{from{transform:translateY(0)}to{transform:translateY(-110vh)}}
@keyframes ls-float{from{transform:rotateX(9deg) rotateY(-4deg)}to{transform:rotateX(5deg) rotateY(4deg)}}
@keyframes ls-slide{from{transform:translateY(40%) scale(1.04);opacity:0}25%{opacity:1}to{transform:none;opacity:1}}
@keyframes ls-flash{from{opacity:.55}to{opacity:0}}
@keyframes ls-glare{from{background-position:120% 0}to{background-position:-120% 0}}
@keyframes ls-pop{from{transform:scale(.7);opacity:0}to{transform:none;opacity:1}}
@keyframes ls-up{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}
@media (max-width:900px){
  .ls{grid-template-columns:minmax(0,1fr);grid-template-areas:"copy" "stage" "auth";align-content:start;text-align:center;row-gap:22px}
  .ls-copy,.ls-auth{align-self:auto;justify-self:center;width:100%}
  .ls-sub{margin-left:auto;margin-right:auto}
  .ls-stage{padding:0 5%}
  .ls-label{min-height:80px}
}
@media (prefers-reduced-motion:reduce){
  .ls *,.ls-lamp{animation:none!important}
  .ls-dust{display:none}
}
`;

export default function LoginScene({ children }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    SHOTS.forEach((s) => { const img = new Image(); img.src = s.src; });
    const still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) return undefined;
    const id = setInterval(() => setStep((n) => n + 1), STEP_MS);
    return () => clearInterval(id);
  }, []);

  const cur = step % SHOTS.length;
  const prev = (cur + SHOTS.length - 1) % SHOTS.length;
  const shot = SHOTS[cur];

  return (
    <div className="ls">
      <style>{CSS}</style>
      <div className="ls-lamp" aria-hidden="true" />
      {DUST.map((d, i) => (
        <span key={i} className="ls-dust" aria-hidden="true"
          style={{ left: d.left, width: d.size, height: d.size, opacity: d.op, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s` }} />
      ))}
      <div className="ls-vig" aria-hidden="true" />

      <div className="ls-copy">
        <div className="ls-brand">IELTS<span>8</span></div>
        <h1 className="ls-title">POV: you found the IELTS platform that <i>does it all..</i></h1>
        <p className="ls-sub">Lessons, full mock tests, writing practice and daily English, from B1 to Band 8.</p>
      </div>

      <div className="ls-stage" aria-hidden="true">
        <div className="ls-laptop">
          <div className="ls-bezel">
            <div className="ls-screen">
              {step > 0 && <img className="ls-shot" src={SHOTS[prev].src} alt="" />}
              <img key={step} className={"ls-shot" + (step > 0 ? " in" : "")} src={shot.src} alt="" />
              {step > 0 && <div key={"f" + step} className="ls-flash" />}
              <div className="ls-glare" />
            </div>
          </div>
          <div className="ls-base" />
        </div>
        <div className="ls-shadow" />
        <div className="ls-label" key={"l" + step}>
          <span className="ls-chip">{shot.chip}</span>
          <div className="ls-line">{shot.line}</div>
        </div>
      </div>

      <div className="ls-auth">{children}</div>
    </div>
  );
}

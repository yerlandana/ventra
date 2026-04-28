# IELTS8

A minimalist online IELTS preparation course that guides learners from
**B1 to IELTS Band 8** through structured lessons, quizzes, written
assignments, AI feedback, and full mock tests.

The site is intentionally black‑and‑white — colour is reserved only for
the four IELTS skill tags, so the focus stays on the content:

- 🟥 **Reading** — `#FF5959`
- 🟨 **Listening** — `#FAD05A`
- 🟩 **Writing** — `#49BEB6`
- 🟦 **Speaking** — `#075F63`

## Features

- **5 modules · 24 lessons · 5 mock tests** — Listening, Reading,
  Writing, Speaking, with Grammar / Vocabulary built into every lesson.
- **Per‑lesson materials** — links, slides, PDFs and embedded YouTube
  videos that the teacher can upload and edit live from the admin panel.
- **Quizzes** with multiple‑choice, true/false, fill‑in‑the‑blank and
  matching question types, plus an instant score breakdown.
- **Writing & Speaking assignments** sent to the Anthropic Claude API
  for IELTS‑band feedback (Task Response, Coherence & Cohesion, Lexical
  Resource, Grammatical Range & Accuracy).
- **Progress dashboard** — points, completion %, per‑module progress
  bars and per‑lesson status.
- **Leaderboard** — ranks every active student by total points.
- **Admin panel** for the teacher: add / revoke / remove students and
  monitor everyone’s progress.
- **Adaptive layout** — the UI is small, dense and responsive down to
  phone screens.
- **Open Graph / Twitter Card** previews — the link shows the IELTS8
  brand image and description in Telegram, WhatsApp, Slack, Discord,
  iMessage, X, etc.

## Tech stack

| Layer        | Tool                                                                |
| ------------ | ------------------------------------------------------------------- |
| Frontend     | React 18 (Create React App)                                         |
| Styling      | Inline styles, monochrome design system, system font stack          |
| Auth         | E‑mail allowlist (no password) — managed by the admin               |
| Database     | Firebase Firestore (`students`, `progress`, `submissions`, `lessons`, `config/structure`) |
| AI feedback  | Anthropic Claude API (`claude-sonnet-4-20250514`) for essay scoring |
| Hosting      | Static site — works on any host that serves `build/`                |

## Project layout

```
ventra/
├── public/
│   ├── index.html        # title, meta, OG / Twitter previews
│   ├── favicon.svg       # IELTS8 mark (black square + white "8")
│   ├── og-image.svg      # 1200×630 share preview
│   └── manifest.json     # PWA metadata
└── src/
    ├── App.js            # the entire app: routes, modules, pages, admin
    ├── index.css         # base resets and focus styles
    └── index.js          # React entry
```

The course structure (modules, lessons, quizzes, assignments) lives in
`INITIAL_MODULES` inside [src/App.js](src/App.js); the live structure is
loaded from Firestore (`config/structure`) and falls back to the local
copy on first run.

## Roles

- **Student** — signs in with the email the teacher added; sees the
  course, takes quizzes, submits writing/speaking, tracks points and
  ranking.
- **Admin / Teacher** — signs in with the configured admin email; can
  add and remove students, revoke or restore access, see everyone’s
  progress, upload lesson materials.

## Local development

Requirements: **Node 18+**.

```bash
npm install
npm start          # runs http://localhost:3000
npm run build      # production bundle in build/
```

The Firebase config and the admin email are currently hard‑coded in
[src/App.js](src/App.js). For a real deployment move them into
environment variables (`REACT_APP_*`) and rotate the API key.

## Deployment

Any static host works. After `npm run build`, deploy the `build/`
folder. Examples:

- **Vercel / Netlify** — connect the GitHub repo, the build command is
  `npm run build`, the output directory is `build`.
- **GitHub Pages** — `npm run build`, then publish the `build/` folder.
- **Firebase Hosting** — `firebase init hosting` (public dir = `build`),
  then `firebase deploy`.

## Branding

If you fork the project and want a different brand, change:

1. The brand text and `<BrandLogo>` SVG inside [src/App.js](src/App.js).
2. `public/favicon.svg` and `public/og-image.svg`.
3. The OG / Twitter / `<title>` / `<description>` strings in
   [public/index.html](public/index.html).
4. The `name`, `short_name` and `theme_color` fields in
   [public/manifest.json](public/manifest.json).

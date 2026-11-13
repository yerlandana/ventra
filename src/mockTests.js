// Mock tests shown in the Mock Tests hub. Each test is a standalone page in public/.
// To add a test: put its page in public/, call saveMockResult({ id, skill, ... }) in it when the test ends
// (see listening-mock.html), and add one line here with the same id.
export const MOCKS = [
  { id: "listening-1", skill: "Listening", title: "Listening Test 1", href: "/listening-mock.html", time: "17 min", items: "4 parts · 40 questions",
    topics: "Booking a hall · A wildlife park · Food waste · Green roofs" },
  { id: "listening-2", skill: "Listening", title: "Listening Test 2", href: "/listening-mock-2.html", time: "17 min", items: "4 parts · 40 questions",
    topics: "A sports centre · A food festival · City noise · Sleep in animals" },
  { id: "reading-1", skill: "Reading", title: "Academic Reading Test 1", href: "/reading-mock.html", time: "60 min", items: "3 passages · 40 questions",
    topics: "Bicycles for everyone · Learning from nature · The uses of boredom" },
  { id: "speaking-1", skill: "Speaking", title: "Speaking Test 1", href: "/speaking-mock.html", time: "14 min", items: "3 parts · answers recorded",
    topics: "Home · Mornings · Photos · A skill you found difficult" },
];

export const SKILLS = ["Listening", "Reading", "Writing", "Speaking"];
export const SKILL_COLOR = { Listening: "#2A2680", Reading: "#1D6B5A", Writing: "#8A6414", Speaking: "#9B3C6E" };

const LOCAL_KEY = "ielts8-mock-results";

// Results the test pages saved in this browser. Entries are claimed by the first account that syncs them,
// so two students sharing a computer do not get each other's results.
export function readLocal(email) {
  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    return Array.isArray(all) ? all.filter((r) => r && r.id && (!r.owner || r.owner === email)) : [];
  } catch (e) {
    return [];
  }
}

function claimLocal(email) {
  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    if (!Array.isArray(all)) return;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(all.map((r) => (r && !r.owner ? { ...r, owner: email } : r))));
  } catch (e) { /* nothing to claim */ }
}

const keyOf = (r) => `${r.id}|${r.run}`;
const strip = ({ owner, ...r }) => r;

// Joins the account's saved results with new ones from this browser. A newer copy of the same run wins
// (the Speaking test updates its run when the student finishes the self-assessment).
export function mergeResults(remote, local) {
  const map = new Map();
  [...(remote || []), ...(local || []).map(strip)].forEach((r) => {
    const k = keyOf(r), old = map.get(k);
    if (!old || String(r.at) > String(old.at)) map.set(k, r);
  });
  return [...map.values()].sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 100);
}

export async function syncResults(email, store) {
  const local = readLocal(email);
  let remote = [];
  try { remote = (await store.load()) || []; } catch (e) { return mergeResults([], local); }
  const merged = mergeResults(remote, local);
  const changed = merged.length !== remote.length || merged.some((r, i) => JSON.stringify(r) !== JSON.stringify(remote[i]));
  if (changed) {
    try { await store.save(merged); claimLocal(email); } catch (e) { /* kept locally, saved next time */ }
  } else {
    claimLocal(email);
  }
  return merged;
}

export const numericBand = (b) => (typeof b === "number" ? b : null);

export function statsFor(results, id) {
  const mine = results.filter((r) => r.id === id);
  if (!mine.length) return null;
  const bands = mine.map((r) => numericBand(r.band)).filter((b) => b != null);
  return { last: mine[0], tries: mine.length, best: bands.length ? Math.max(...bands) : null };
}

export const fmtDate = (iso) => {
  try { return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }); } catch (e) { return ""; }
};

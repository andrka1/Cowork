// Pre-build step: download an MP3 pronunciation for every English headword
// into public/audio/<slug>.mp3 so the packaged APK ships OFFLINE audio.
//
// Runs automatically before `vite build` via the npm "prebuild" hook, so no
// GitHub Actions workflow change is needed. Uses only Node built-ins + global
// fetch (Node 18+/20), so it does NOT add dependencies and keeps `npm ci` happy.
//
// It is intentionally FAIL-SAFE: any network/parse error is logged and skipped,
// and the script always exits 0 so a flaky TTS service can never break the build.
// Words that fail to download simply fall back to the online stream at runtime.

import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const dataDir = join(root, "src", "data");
const outDir = join(root, "public", "audio");

// MUST stay identical to slugify() in src/data/storage.ts
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function collectWords() {
  const set = new Set();
  let files = [];
  try {
    files = readdirSync(dataDir).filter((f) => f.indexOf("words-") === 0 && f.endsWith(".ts"));
  } catch {
    return [];
  }
  for (const f of files) {
    let content = "";
    try {
      content = readFileSync(join(dataDir, f), "utf8");
    } catch {
      continue;
    }
    const patterns = [/[\s,{]en\s*:\s*"([^"]*)"/g, /[\s,{]en\s*:\s*'([^']*)'/g];
    for (const re of patterns) {
      let m;
      while ((m = re.exec(content)) !== null) {
        const val = (m[1] || "").trim();
        if (val) set.add(val);
      }
    }
  }
  return Array.from(set);
}

function ttsUrl(text, idx) {
  const q = encodeURIComponent(text.slice(0, 200));
  if (idx === 0) {
    // StreamElements (Amazon Polly "Joanna", US English) — reliable for scripts.
    return "https://api.streamelements.com/kappa/v2/speech?voice=Joanna&text=" + q;
  }
  // Fallback: Google Translate TTS.
  return "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=" + q;
}

async function fetchAudio(text) {
  for (let i = 0; i < 2; i++) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(ttsUrl(text, i), {
        signal: ctrl.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36",
          Referer: "https://translate.google.com/",
        },
      });
      clearTimeout(timer);
      if (!res || !res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 800) return buf; // sanity check: real audio, not an error page
    } catch {
      // try the next source
    }
  }
  return null;
}

async function run() {
  const words = collectWords();
  if (!words.length) {
    console.log("[gen-audio] no words found, skipping");
    return;
  }
  mkdirSync(outDir, { recursive: true });
  console.log("[gen-audio] processing " + words.length + " words");
  let ok = 0;
  let fail = 0;
  let skip = 0;
  const queue = words.slice();
  async function worker() {
    while (queue.length) {
      const w = queue.shift();
      const slug = slugify(w);
      if (!slug) continue;
      const out = join(outDir, slug + ".mp3");
      try {
        if (existsSync(out) && statSync(out).size > 800) {
          skip++;
          continue;
        }
      } catch {
        // ignore stat errors
      }
      const buf = await fetchAudio(w);
      if (buf) {
        try {
          writeFileSync(out, buf);
          ok++;
        } catch {
          fail++;
        }
      } else {
        fail++;
      }
    }
  }
  const workers = [];
  for (let i = 0; i < 6; i++) workers.push(worker());
  await Promise.all(workers);
  console.log("[gen-audio] done ok=" + ok + " skip=" + skip + " fail=" + fail);
}

run()
  .catch((e) => console.log("[gen-audio] fatal ignored: " + (e && e.message)))
  .finally(() => process.exit(0));

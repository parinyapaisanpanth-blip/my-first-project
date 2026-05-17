/**
 * scout-news.mjs — Phase 1: daily news digest via Gemini + Google Search grounding
 *
 * Usage:  node scripts/scout-news.mjs
 * Env:    GEMINI_API_KEY   (primary)
 *         GITHUB_TOKEN     (fallback — no real-time grounding, TODO below)
 *
 * Exit code: 0 if at least one ticker succeeds, 1 if all fail.
 */

import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ── date helpers ───────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso, n) {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// ── JSON extraction (handles model wrapping in code fences) ───────────────────

function extractJson(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error(`No JSON object found in response: ${text.slice(0, 150)}`);
  return JSON.parse(m[0]);
}

// ── Gemini call ────────────────────────────────────────────────────────────────

async function callGemini(ticker, apiKey) {
  const prompt =
    `Search the web for news about ${ticker} stock published in the last 24 hours ` +
    `that could move the stock price. ` +
    `Reply with ONLY a valid JSON object — no markdown fences, no extra text:\n` +
    `{"ticker":"${ticker}","sentiment":"bullish","news":[{"headline":"...","source":"...","time":"..."}]}\n` +
    `Rules: sentiment must be exactly one of: bullish | neutral | bearish. ` +
    `Include 1–3 most impactful items. ` +
    `If no significant news, return empty news array with neutral sentiment.`;

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      generationConfig: { temperature: 0.1 },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return extractJson(text);
}

// ── GitHub Models fallback ────────────────────────────────────────────────────
//
// TODO: implement real fallback via GitHub Models OpenAI-compatible endpoint:
//   POST https://models.inference.ai.azure.com/chat/completions
//   Authorization: Bearer $GITHUB_TOKEN
//   model: "gpt-4o-mini"
//
// IMPORTANT: GitHub Models has no real-time search grounding — news will be
// based on training data only, not live web results. Quality will be much lower
// than Gemini grounding. Implement when GEMINI_API_KEY is unavailable in CI.
//
async function callGithubModels(_ticker, _token) {
  throw new Error(
    'GitHub Models fallback not yet implemented — see TODO in scripts/scout-news.mjs'
  );
}

// ── per-ticker fetch with fallback ────────────────────────────────────────────

async function fetchTickerNews(ticker) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const ghToken = process.env.GITHUB_TOKEN;

  if (geminiKey) {
    try {
      return await callGemini(ticker, geminiKey);
    } catch (e) {
      console.error(`  [${ticker}] Gemini error: ${e.message}`);
    }
  } else {
    console.warn(`  [${ticker}] GEMINI_API_KEY not set`);
  }

  if (ghToken) {
    try {
      return await callGithubModels(ticker, ghToken);
    } catch (e) {
      console.error(`  [${ticker}] GitHub Models error: ${e.message}`);
    }
  }

  return null;
}

// ── main ───────────────────────────────────────────────────────────────────────

const watchlist = JSON.parse(readFileSync(join(ROOT, 'portfolio/watchlist.json'), 'utf8'));
const tickers = watchlist.tickers;
const todayStr = todayISO();
const expiresStr = addDays(todayStr, 14);

const results = {};
let successCount = 0;

for (const ticker of tickers) {
  process.stdout.write(`[${ticker}] fetching... `);
  const data = await fetchTickerNews(ticker);
  if (data) {
    results[ticker] = data;
    successCount++;
    console.log(`ok — ${data.sentiment}, ${data.news?.length ?? 0} item(s)`);
  } else {
    results[ticker] = { ticker, sentiment: 'no data', news: [] };
    console.log('no data');
  }
}

if (successCount === 0) {
  console.error('ERROR: all tickers failed — no data written. Exiting 1.');
  process.exit(1);
}

// ── write digest ───────────────────────────────────────────────────────────────

const newsDir = join(ROOT, 'knowledge/news');
if (!existsSync(newsDir)) mkdirSync(newsDir, { recursive: true });

const sentiments = Object.values(results).map(r => r.sentiment).filter(s => s !== 'no data');
const bullishCount = sentiments.filter(s => s === 'bullish').length;
const bearishCount = sentiments.filter(s => s === 'bearish').length;
const overallSentiment =
  bullishCount > bearishCount ? 'bullish' :
  bearishCount > bullishCount ? 'bearish' : 'mixed';

let md = `---
title: News digest ${todayStr}
summary: ${overallSentiment} — ${successCount}/${tickers.length} tickers with data
expires: ${expiresStr}
tags: [news]
---

# News Digest — ${todayStr}

`;

for (const ticker of tickers) {
  const r = results[ticker];
  md += `## ${ticker} — ${r.sentiment}\n\n`;
  if (!r.news?.length) {
    md += `_No significant news or data unavailable._\n\n`;
  } else {
    for (const item of r.news) {
      md += `- **${item.headline}**  \n`;
      md += `  _${item.source}${item.time ? ' · ' + item.time : ''}_\n\n`;
    }
  }
}

const digestPath = join(newsDir, `${todayStr}.md`);
writeFileSync(digestPath, md, 'utf8');
console.log(`\nWritten: knowledge/news/${todayStr}.md`);

// ── expire old digests ─────────────────────────────────────────────────────────

for (const file of readdirSync(newsDir).filter(f => f.endsWith('.md'))) {
  if (file === `${todayStr}.md`) continue;
  const content = readFileSync(join(newsDir, file), 'utf8');
  const m = content.match(/^expires:\s*(\d{4}-\d{2}-\d{2})/m);
  if (m && m[1] < todayStr) {
    unlinkSync(join(newsDir, file));
    console.log(`Deleted expired: knowledge/news/${file}`);
  }
}

// ── update INDEX.md News section ───────────────────────────────────────────────

const indexPath = join(ROOT, 'knowledge/INDEX.md');
const indexLines = readFileSync(indexPath, 'utf8').split('\n');

let newsHeaderCommentLine = -1;
let newsSepLine = -1;
let inNews = false;

for (let i = 0; i < indexLines.length; i++) {
  if (indexLines[i] === '## News') { inNews = true; continue; }
  if (inNews && indexLines[i].startsWith('<!--') && newsHeaderCommentLine === -1) {
    newsHeaderCommentLine = i;
    continue;
  }
  if (inNews && newsHeaderCommentLine !== -1 && indexLines[i] === '---') {
    newsSepLine = i;
    break;
  }
}

if (newsHeaderCommentLine !== -1 && newsSepLine !== -1) {
  const remaining = readdirSync(newsDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse();

  const newsEntries = remaining.map(file => {
    const content = readFileSync(join(newsDir, file), 'utf8');
    const title   = content.match(/^title:\s*(.+)/m)?.[1]?.trim() ?? file;
    const summary = content.match(/^summary:\s*(.+)/m)?.[1]?.trim() ?? '';
    const expires = content.match(/^expires:\s*(\S+)/m)?.[1] ?? '';
    return `${title} | ${summary} | expires: ${expires} | knowledge/news/${file}`;
  });

  const newLines = [
    ...indexLines.slice(0, newsHeaderCommentLine + 1),
    '',
    ...newsEntries,
    '',
    ...indexLines.slice(newsSepLine),
  ];
  writeFileSync(indexPath, newLines.join('\n'), 'utf8');
  console.log('Updated: knowledge/INDEX.md');
} else {
  console.warn('WARNING: could not locate ## News section in knowledge/INDEX.md — skipped update');
}

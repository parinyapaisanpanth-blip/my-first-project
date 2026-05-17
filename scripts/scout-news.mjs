/**
 * scout-news.mjs — Phase 1: daily news digest
 *
 * News source: Finnhub company-news API (FINNHUB_API_KEY)
 * Sentiment:   Gemini 2.0-flash, single batch call, no grounding (GEMINI_API_KEY, optional)
 *
 * Usage:  node scripts/scout-news.mjs
 * Env:    FINNHUB_API_KEY  (required — news source)
 *         GEMINI_API_KEY   (optional — sentiment; falls back to "n/a" on error/missing)
 *         GITHUB_TOKEN     (reserved — GitHub Models stub, TODO)
 *
 * Exit code: 0 if at least one ticker has news, 1 if all tickers return no news.
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

// ── Finnhub company-news ──────────────────────────────────────────────────────

async function fetchFinnhubNews(ticker, apiKey) {
  const cutoff48h = Math.floor(Date.now() / 1000) - 48 * 3600;
  const fromDate = addDays(todayISO(), -2);
  const toDate = todayISO();
  const url =
    `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(ticker)}` +
    `&from=${fromDate}&to=${toDate}&token=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Finnhub HTTP ${res.status} for ${ticker}`);

  const articles = await res.json();
  if (!Array.isArray(articles)) throw new Error(`Unexpected Finnhub response for ${ticker}`);

  return articles
    .filter(a => a.datetime >= cutoff48h)
    .sort((a, b) => b.datetime - a.datetime)
    .slice(0, 3)
    .map(a => ({
      headline: a.headline,
      source: a.source,
      time: new Date(a.datetime * 1000).toISOString(),
    }));
}

// ── Gemini sentiment (batch, no grounding) ────────────────────────────────────
//
// tickerHeadlines: { AAPL: ["headline1", ...], NVDA: [...] }
// Returns:         { AAPL: "bullish", NVDA: "neutral", ... }
// On any failure:  returns {} — caller assigns "n/a" to all tickers

async function fetchGeminiSentiment(tickerHeadlines, apiKey) {
  if (!apiKey || !Object.keys(tickerHeadlines).length) return {};
  const prompt =
    `Given these recent news headlines per stock ticker, classify each ticker's sentiment.\n` +
    `Input:\n${JSON.stringify(tickerHeadlines)}\n` +
    `Reply with ONLY a JSON object — no fences, no extra text:\n` +
    `{"AAPL":"bullish","NVDA":"neutral",...}\n` +
    `Each value must be exactly: bullish | neutral | bearish`;

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0 },
      }),
    });
    if (!res.ok) {
      console.warn(`  Gemini sentiment HTTP ${res.status} — setting all to n/a`);
      return {};
    }
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return extractJson(text);
  } catch (e) {
    console.warn(`  Gemini sentiment error: ${e.message} — setting all to n/a`);
    return {};
  }
}

// ── GitHub Models fallback (stub) ─────────────────────────────────────────────
//
// TODO: implement fallback via GitHub Models OpenAI-compatible endpoint:
//   POST https://models.inference.ai.azure.com/chat/completions
//   Authorization: Bearer $GITHUB_TOKEN   model: "gpt-4o-mini"
//
async function callGithubModels(_ticker, _token) {
  throw new Error(
    'GitHub Models fallback not yet implemented — see TODO in scripts/scout-news.mjs'
  );
}

// ── main ───────────────────────────────────────────────────────────────────────

const watchlist = JSON.parse(readFileSync(join(ROOT, 'portfolio/watchlist.json'), 'utf8'));
const tickers = watchlist.tickers;
const todayStr = todayISO();
const expiresStr = addDays(todayStr, 14);
const finnhubKey = process.env.FINNHUB_API_KEY;

// ── Step 1: fetch news from Finnhub per ticker ─────────────────────────────────

const newsMap = {};
let tickersWithNews = 0;

for (const ticker of tickers) {
  process.stdout.write(`[${ticker}] fetching news... `);
  if (!finnhubKey) {
    console.warn('FINNHUB_API_KEY not set');
    newsMap[ticker] = [];
    continue;
  }
  try {
    const news = await fetchFinnhubNews(ticker, finnhubKey);
    newsMap[ticker] = news;
    if (news.length) {
      tickersWithNews++;
      console.log(`${news.length} item(s)`);
    } else {
      console.log('no news in 48h');
    }
  } catch (e) {
    console.error(`error — ${e.message}`);
    newsMap[ticker] = [];
  }
}

if (tickersWithNews === 0) {
  console.error('ERROR: no news found for any ticker. Exiting 1.');
  process.exit(1);
}

// ── Step 2: batch sentiment via Gemini (optional, non-blocking) ────────────────

const tickerHeadlines = {};
for (const [t, news] of Object.entries(newsMap)) {
  if (news.length) tickerHeadlines[t] = news.map(n => n.headline);
}

console.log(`\nFetching sentiment for ${Object.keys(tickerHeadlines).length} tickers...`);
const sentimentMap = await fetchGeminiSentiment(tickerHeadlines, process.env.GEMINI_API_KEY);
if (!Object.keys(sentimentMap).length) console.log('Sentiment unavailable — all set to n/a');

// ── Step 3: assemble results ───────────────────────────────────────────────────

const results = {};
for (const ticker of tickers) {
  const news = newsMap[ticker] ?? [];
  const sentiment = news.length ? (sentimentMap[ticker] ?? 'n/a') : 'no data';
  results[ticker] = { ticker, sentiment, news };
}

// ── write digest ───────────────────────────────────────────────────────────────

const newsDir = join(ROOT, 'knowledge/news');
if (!existsSync(newsDir)) mkdirSync(newsDir, { recursive: true });

const scoredSentiments = Object.values(results)
  .map(r => r.sentiment)
  .filter(s => s === 'bullish' || s === 'neutral' || s === 'bearish');
const bullishCount = scoredSentiments.filter(s => s === 'bullish').length;
const bearishCount = scoredSentiments.filter(s => s === 'bearish').length;
const overallSentiment = scoredSentiments.length
  ? (bullishCount > bearishCount ? 'bullish' : bearishCount > bullishCount ? 'bearish' : 'mixed')
  : null;
const summaryLine = overallSentiment
  ? `${overallSentiment} — ${tickersWithNews}/${tickers.length} tickers with news`
  : `${tickersWithNews}/${tickers.length} tickers with news`;

let md = `---
title: News digest ${todayStr}
summary: ${summaryLine}
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

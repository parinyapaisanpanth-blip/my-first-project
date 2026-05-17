/**
 * dca-pilot.mjs — Phase 3: simulated weekly DCA + daily NAV
 *
 * Runs every day via cron. Buys only on Fridays (or if FORCE_BUY=true).
 * Every run appends a NAV entry to history.json for charting.
 * All numbers are SIMULATION — not financial advice.
 *
 * Env: FINNHUB_API_KEY  (required — stock prices)
 *      FORCE_BUY        (optional, "true" bypasses Friday gate for testing)
 *
 * Exit 0: normal operation including intentional skips
 * Exit 1: unexpected unhandled exception only
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── helpers ────────────────────────────────────────────────────────────────────

function round2(n) {
  return Math.round(n * 100) / 100;
}

function round6(n) {
  return Math.round(n * 1e6) / 1e6;
}

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

function readJSON(relPath, fallback) {
  const full = join(ROOT, relPath);
  if (!existsSync(full)) return fallback;
  return JSON.parse(readFileSync(full, 'utf8'));
}

function writeJSON(relPath, data) {
  writeFileSync(join(ROOT, relPath), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function fridaysInMonthUTC(year, month) {
  // month is 0-indexed UTC
  let count = 0;
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  for (let d = 1; d <= days; d++) {
    if (new Date(Date.UTC(year, month, d)).getUTCDay() === 5) count++;
  }
  return count;
}

// ── load portfolio files ───────────────────────────────────────────────────────

const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const FORCE_BUY   = process.env.FORCE_BUY === 'true';

const state      = readJSON('portfolio/state.json', {});
const watchlist  = readJSON('portfolio/watchlist.json', { tickers: [] });
const conviction = readJSON('portfolio/conviction.json', { scores: {} });
const history    = readJSON('portfolio/history.json', []);

const tickers          = watchlist.tickers ?? [];
const monthlyBudgetTHB = state.monthlyBudgetTHB ?? 10000;
const today            = todayUTC();

// initialize fields absent from phase-2 seed on first run
if (!state.holdings)                    state.holdings = {};
if (state.totalInvestedTHB == null)     state.totalInvestedTHB = 0;

// ── A) Fetch stock prices from Finnhub quote ───────────────────────────────────

if (!FINNHUB_KEY) {
  console.warn('WARN: FINNHUB_API_KEY not set — skipping run');
  process.exit(0);
}

const prices = {};  // ticker → USD price (current)

for (const ticker of tickers) {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${FINNHUB_KEY}`
    );
    if (!res.ok) {
      console.warn(`WARN: [${ticker}] Finnhub quote HTTP ${res.status} — skipping ticker`);
      continue;
    }
    const data = await res.json();
    const price = data.c;   // field c = current/last price
    if (!price || price <= 0) {
      console.warn(`WARN: [${ticker}] invalid price (c=${price}) — skipping ticker`);
      continue;
    }
    prices[ticker] = price;
    console.log(`[${ticker}] $${price}`);
  } catch (e) {
    console.warn(`WARN: [${ticker}] fetch error: ${e.message} — skipping ticker`);
  }
}

const validTickers = Object.keys(prices);
if (validTickers.length === 0) {
  console.warn('WARN: no valid prices obtained — skipping run, state unchanged');
  process.exit(0);
}

// ── B) Fetch USDTHB (free, no API key) ────────────────────────────────────────

let fxRate = null;

try {
  const res = await fetch('https://open.er-api.com/v6/latest/USD');
  if (res.ok) {
    const data = await res.json();
    fxRate = data?.rates?.THB ?? null;
    if (fxRate) console.log(`\nFX USDTHB: ${fxRate} (open.er-api.com)`);
  }
} catch (e) {
  console.warn(`WARN: open.er-api.com failed: ${e.message}`);
}

if (!fxRate) {
  try {
    const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=THB');
    if (res.ok) {
      const data = await res.json();
      fxRate = data?.rates?.THB ?? null;
      if (fxRate) console.log(`\nFX USDTHB: ${fxRate} (exchangerate.host fallback)`);
    }
  } catch (e) {
    console.warn(`WARN: exchangerate.host failed: ${e.message}`);
  }
}

if (!fxRate) {
  console.warn('WARN: could not obtain USDTHB from either source — skipping run, state unchanged');
  process.exit(0);
}

// ── C) Buy decision (idempotent: lastBuyDate guard) ────────────────────────────

const now      = new Date();
const isFriday = now.getUTCDay() === 5;
const doBuy    = (isFriday || FORCE_BUY) && state.lastBuyDate !== today;

console.log(`\nDate: ${today} | Friday: ${isFriday} | FORCE_BUY: ${FORCE_BUY} | doBuy: ${doBuy}`);

// ── D) Simulate purchase ───────────────────────────────────────────────────────

const buys = {};

if (doBuy) {
  const fridayCount = fridaysInMonthUTC(now.getUTCFullYear(), now.getUTCMonth());
  const weeklyTHB   = round2(monthlyBudgetTHB / fridayCount);
  const weeklyUSD   = weeklyTHB / fxRate;

  console.log(`\nBuying: ${weeklyTHB} THB (${round2(weeklyUSD)} USD) | ${fridayCount} Fridays this month`);

  // Conviction weights: scores from conviction.json, mean fallback for missing
  const rawScores    = conviction.scores ?? {};
  const scoredTickers = validTickers.filter(t => rawScores[t] != null && rawScores[t] > 0);
  const fallbackScore = scoredTickers.length > 0
    ? scoredTickers.reduce((s, t) => s + rawScores[t], 0) / scoredTickers.length
    : 1;  // equal-weight when no conviction data at all

  const effectiveScores = {};
  for (const t of validTickers) {
    effectiveScores[t] = (rawScores[t] != null && rawScores[t] > 0) ? rawScores[t] : fallbackScore;
  }
  const totalScore = Object.values(effectiveScores).reduce((s, v) => s + v, 0);

  for (const ticker of validTickers) {
    const weight      = effectiveScores[ticker] / totalScore;
    const allocUSD    = round2(weeklyUSD * weight);
    const price       = prices[ticker];
    const sharesBought = allocUSD / price;  // fractional shares — simulation

    const h = state.holdings[ticker] ?? { shares: 0, investedUSD: 0, avgCostUSD: 0 };
    h.shares      = round6(h.shares + sharesBought);
    h.investedUSD = round2(h.investedUSD + allocUSD);
    h.avgCostUSD  = h.shares > 0 ? round2(h.investedUSD / h.shares) : 0;
    state.holdings[ticker] = h;

    buys[ticker] = {
      usd:    allocUSD,
      shares: round6(sharesBought),
      price:  round2(price),
      weightPct: round2(weight * 100),
    };

    console.log(`  [${ticker}] ${round6(sharesBought)} shares @ $${round2(price)} (${round2(weight * 100)}%)`);
  }

  state.startDate        = state.startDate ?? today;
  state.lastBuyDate      = today;
  state.totalInvestedTHB = round2((state.totalInvestedTHB ?? 0) + weeklyTHB);
}

// ── E) NAV valuation (every run) ──────────────────────────────────────────────

let navUSD = 0;
for (const [ticker, holding] of Object.entries(state.holdings)) {
  if (prices[ticker]) navUSD += holding.shares * prices[ticker];
}
navUSD = round2(navUSD);
const navTHB      = round2(navUSD * fxRate);
const investedTHB = round2(state.totalInvestedTHB ?? 0);
const returnPct   = investedTHB > 0 ? round2((navTHB - investedTHB) / investedTHB * 100) : 0;

console.log(`\nNAV: $${navUSD} USD / ${navTHB} THB | Invested: ${investedTHB} THB | Return: ${returnPct}%`);

// ── F) Append/overwrite history entry (idempotent) ────────────────────────────

const entry = {
  date:         today,
  type:         doBuy ? 'buy' : 'valuation',
  fxUSDTHB:    round2(fxRate),
  navUSD,
  navTHB,
  investedTHB,
  returnPct,
  buys:         doBuy ? buys : {},
};

const lastEntry = history[history.length - 1];
if (lastEntry?.date === today) {
  history[history.length - 1] = entry;
  console.log('History: overwrote same-day entry (idempotent)');
} else {
  history.push(entry);
  console.log(`History: appended (total entries: ${history.length})`);
}

writeJSON('portfolio/history.json', history);

// ── G) Write back state.json ───────────────────────────────────────────────────

state.lastRun = today;
state.fx = {
  ...(state.fx ?? {}),
  lastRate:     round2(fxRate),
  lastRateDate: today,
};

writeJSON('portfolio/state.json', state);

console.log('\nDone. [SIMULATION — not financial advice]');

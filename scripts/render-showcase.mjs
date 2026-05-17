/**
 * render-showcase.mjs — Phase 4
 * Reads portfolio/state.json + portfolio/history.json,
 * generates HTML for the DCA section, replaces <!-- DCA:START -->...<!-- DCA:END -->
 * in showcase/index.html. No API calls, no LLM — reads JSON only.
 *
 * Exit 0: success (including empty-state placeholder)
 * Exit 1: DCA markers missing from index.html
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function readJSON(relPath, fallback) {
  const full = join(ROOT, relPath);
  if (!existsSync(full)) return fallback;
  return JSON.parse(readFileSync(full, 'utf8'));
}

function fmt2(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtShares(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}

const state   = readJSON('portfolio/state.json', {});
const history = readJSON('portfolio/history.json', []);

const holdings    = state.holdings   ?? {};
const lastEntry   = history[history.length - 1] ?? null;
const navTHB      = lastEntry?.navTHB      ?? 0;
const investedTHB = lastEntry?.investedTHB ?? 0;
const returnPct   = lastEntry?.returnPct   ?? 0;
const fxRate      = state.fx?.lastRate     ?? null;
const lastRun     = state.lastRun          ?? null;
const startDate   = state.startDate        ?? null;
const cashTHB     = state.cashTHB          ?? 0;

// ── Stat cards ────────────────────────────────────────────────────────────────

const navClass    = navTHB > 0 ? 'port-stat-val num up' : 'port-stat-val num';
const returnClass = returnPct > 0 ? 'port-stat-val num up' : returnPct < 0 ? 'port-stat-val num down' : 'port-stat-val num';
const returnSign  = returnPct > 0 ? '+' : '';

const statsHtml = `<div class="port-stats">
  <div class="port-stat">
    <div class="port-stat-label">NAV (THB)</div>
    <div class="${navClass}">${navTHB > 0 ? fmt2(navTHB) : '—'}</div>
    <div class="port-stat-sub">${fxRate ? `USDTHB ${fmt2(fxRate)}` : 'รอ run แรก'}</div>
  </div>
  <div class="port-stat">
    <div class="port-stat-label">ลงทุนสะสม (THB)</div>
    <div class="port-stat-val num">${investedTHB > 0 ? fmt2(investedTHB) : '—'}</div>
    <div class="port-stat-sub">${startDate ? `เริ่ม ${startDate}` : '&nbsp;'}</div>
  </div>
  <div class="port-stat">
    <div class="port-stat-label">ผลตอบแทน</div>
    <div class="${returnClass}">${investedTHB > 0 ? `${returnSign}${returnPct}%` : '—'}</div>
    <div class="port-stat-sub">${lastRun ? `อัปเดต ${lastRun}` : '&nbsp;'}</div>
  </div>
  <div class="port-stat">
    <div class="port-stat-label">เงินสดเศษ (THB)</div>
    <div class="port-stat-val num">${cashTHB > 0 ? fmt2(cashTHB) : '0.00'}</div>
    <div class="port-stat-sub">เศษปัดจาก allocation</div>
  </div>
</div>`;

// ── NAV chart (inline SVG) ────────────────────────────────────────────────────

function buildChart(history) {
  if (history.length < 2) {
    return `<div class="port-chart"><div class="port-chart-empty">ยังไม่มีข้อมูลเพียงพอสำหรับกราฟ — รอ 2 วันขึ้นไป</div></div>`;
  }

  const W = 760, H = 160;
  const PAD = { l: 4, r: 4, t: 12, b: 14 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;

  const navVals = history.map(e => e.navTHB ?? 0);
  const invVals = history.map(e => e.investedTHB ?? 0);
  const allVals = [...navVals, ...invVals].filter(v => v > 0);
  const minV = allVals.length ? Math.min(...allVals) * 0.995 : 0;
  const maxV = allVals.length ? Math.max(...allVals) * 1.005 : 1;
  const range = maxV - minV || 1;
  const n = history.length;

  const toX = i  => PAD.l + (n > 1 ? (i / (n - 1)) : 0.5) * plotW;
  const toY = v  => PAD.t + plotH - ((v - minV) / range) * plotH;

  const navPts = history.map((e, i) => `${toX(i).toFixed(1)},${toY(e.navTHB ?? 0).toFixed(1)}`).join(' ');
  const invPts = history.map((e, i) => `${toX(i).toFixed(1)},${toY(e.investedTHB ?? 0).toFixed(1)}`).join(' ');

  const firstDate = history[0].date;
  const lastDate  = history[history.length - 1].date;

  return `<div class="port-chart">
  <svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="none" aria-hidden="true">
    <polyline points="${invPts}" fill="none" stroke="var(--stamp)" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.65"/>
    <polyline points="${navPts}" fill="none" stroke="var(--sage)" stroke-width="2.2"/>
    <text x="${PAD.l + 2}" y="${H - 2}" font-size="9" fill="var(--ink)" opacity="0.45">${firstDate}</text>
    <text x="${W - PAD.r - 2}" y="${H - 2}" font-size="9" fill="var(--ink)" opacity="0.45" text-anchor="end">${lastDate}</text>
  </svg>
  <div class="port-chart-legend">
    <span><span class="port-legend-dot sage"></span>NAV</span>
    <span><span class="port-legend-dot stamp"></span>ลงทุนสะสม</span>
  </div>
</div>`;
}

const chartHtml = buildChart(history);

// ── Holdings table ────────────────────────────────────────────────────────────

function buildTable(holdings) {
  const entries = Object.entries(holdings);
  if (entries.length === 0) {
    return `<p class="port-empty">ยังไม่มี holdings — รอวันศุกร์แรกหรือรัน workflow force_buy=true</p>`;
  }

  const rows = entries.map(([ticker, h]) => {
    const price    = h.lastPriceUSD;
    const valueUSD = price != null && h.shares > 0 ? h.shares * price : null;
    const priceFmt = price != null ? `$${price.toFixed(2)}` : '—';
    const valueFmt = valueUSD != null ? `$${fmt2(valueUSD)}` : '—';
    const gain     = price != null && h.avgCostUSD > 0
      ? (price - h.avgCostUSD) / h.avgCostUSD * 100
      : null;
    const gainFmt  = gain != null
      ? `<span class="${gain >= 0 ? 'num up' : 'num down'}">${gain >= 0 ? '+' : ''}${gain.toFixed(1)}%</span>`
      : '—';
    return `      <tr>
        <td><span class="ticker-col">${ticker}</span></td>
        <td class="num">${fmtShares(h.shares)}</td>
        <td class="num">${priceFmt}</td>
        <td class="num">$${h.avgCostUSD.toFixed(2)}</td>
        <td>${gainFmt}</td>
        <td class="num">${valueFmt}</td>
      </tr>`;
  }).join('\n');

  return `<div class="levels">
  <table>
    <thead>
      <tr>
        <th>Ticker</th>
        <th>หุ้น (sim)</th>
        <th>ราคาล่าสุด</th>
        <th>ต้นทุนเฉลี่ย</th>
        <th>กำไร/ขาดทุน</th>
        <th>มูลค่า (USD)</th>
      </tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>
</div>`;
}

const tableHtml = buildTable(holdings);

// ── Assemble & replace markers ────────────────────────────────────────────────

const inner = `${statsHtml}
${chartHtml}
${tableHtml}`;

const indexPath    = join(ROOT, 'showcase/index.html');
let   html         = readFileSync(indexPath, 'utf8');
const START_MARKER = '<!-- DCA:START -->';
const END_MARKER   = '<!-- DCA:END -->';
const si = html.indexOf(START_MARKER);
const ei = html.indexOf(END_MARKER);

if (si === -1 || ei === -1) {
  console.error('ERROR: DCA markers not found in showcase/index.html — aborting');
  process.exit(1);
}

const before = html.slice(0, si + START_MARKER.length);
const after  = html.slice(ei);
html = before + '\n' + inner + '\n      ' + after;

writeFileSync(indexPath, html, 'utf8');
console.log('showcase/index.html updated [SIMULATION — not financial advice]');

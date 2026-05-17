# Master Plan — DCA Auto-Portfolio + Daily News System

> สถานะ: เฟส 0–4 done · อัปเดต 2026-05-17 · เฟส 5 (hardening) รอสั่ง

## A. ภาพรวม & ข้อจำกัดที่ล็อกไว้

ระบบ: ทุกวันมี automation ดึงข่าว → ประเมินหุ้น → จำลองพอร์ต DCA → คำนวณผลตอบแทน → อัปเดตเว็บอัตโนมัติ

ข้อจำกัดที่ยึดตลอดแผน (ห้ามแหก):

- **Paper trading เท่านั้น** — ไม่ต่อ broker จริง ทุกตัวเลขติดป้าย `SIMULATION` สอดคล้อง "not financial advice" ของเว็บ และกฎ CLAUDE.md (ห้ามออก buy/sell)
- **เว็บยังเป็น static** — ใช้วิธี cron regenerate `showcase/index.html` แล้ว redeploy ไม่ทำ backend
- **AI = API ไม่ใช่ติดตั้ง** — key เก็บใน env var / GitHub Secrets ไม่ hardcode

## B. Stack สุดท้าย

| ตัว | บทบาท | รันที่ไหน | ค่าใช้จ่าย |
|---|---|---|---|
| Finnhub company-news API | ข่าวรายวันต่อ ticker (เฟส 1 primary news source) | GitHub Actions | free tier |
| Gemini API (`gemini-2.0-flash`) | sentiment batch — ไม่มี grounding (เฟส 1 optional, ปัจจุบัน n/a quota free tier non-blocking) | GitHub Actions | free tier |
| GitHub Models (`gpt-4o-mini`) | fallback ถ้า Gemini ล้ม — ยังไม่ implement (TODO) | GitHub Actions | ฟรี |
| Claude (Agent SDK) | orchestrate + reasoning + brief/synthesis — **deferred เฟส 3+** | GitHub Actions | ตาม token |
| xAI Grok | ข่าว/sentiment จาก X — **deferred เฟส 3+** | เรียกจาก job | ตาม API |
| Market data | ราคาหุ้นรายวันสำหรับตีมูลค่าพอร์ต | เรียกจาก job | free tier |

**Market data decision (ตัดสินแล้ว):** Finnhub quote API = ราคาหุ้น (free 60 call/นาที), Twelve Data = fallback เมื่อ Finnhub error/rate-limit

**FX decision (เฟส 3):** USDTHB rate จาก open.er-api.com (free, ไม่ต้องใช้ key) → exchangerate.host fallback; Finnhub forex endpoint = premium tier ไม่ใช้

**Logo:** ใช้ field `logo` จาก Finnhub company-profile2 endpoint (ไม่ต้องเพิ่ม service โลโก้แยก)

ChatGPT / Hermes / xAI Grok: deferred เฟส 3+

> **เฟส 1 pivot note:** เดิมวางใช้ Gemini + Google Search grounding ดึงข่าว แต่ free tier ชน quota
> เปลี่ยนเป็น Finnhub company-news (ไม่ต้องใช้ grounding) + Gemini แค่ทำ sentiment batch call

## C. ที่รัน automation — GitHub Actions (ไม่ใช่ Vercel Cron)

- Vercel Cron + Serverless ติด timeout (Hobby ~10s) → agent run ยาวเกิน ไม่เหมาะ
- GitHub Actions: ฟรี (repo public), timeout 6 ชม., commit กลับ repo ได้ในตัว
- Vercel เหลือหน้าที่เดียว: auto-deploy `showcase/index.html` เมื่อ Actions push เข้ามา

> ⚠️ repo ตอนนี้เป็น git local ล้วน ไม่มี GitHub remote → เฟส 0 ต้อง push ขึ้น GitHub ก่อน

## D. โครงสร้างข้อมูล/ไฟล์ใหม่

```
portfolio/
  state.json        # holdings ปัจจุบัน, เงินสด, งบ DCA/เดือน, กฎ rebalance
  history.json      # NAV + ผลตอบแทนรายวัน (append-only)
  rules.md          # กติกา DCA + kill condition (มนุษย์อ่านได้)
knowledge/news/
  YYYY-MM-DD.md     # ข่าวรายวัน (มี expires: → Nontr ลบเอง) — ของเดิมรองรับอยู่แล้ว
.github/workflows/
  daily.yml         # cron: news -> eval -> portfolio -> regenerate -> commit
showcase/
  index.html        # regenerate ส่วนตัวเลขจาก state/history
  data.json         # (option) ตัวเลขล่าสุดให้หน้าเว็บอ่าน
```

## E. Agent ใหม่ (ต่อยอดทีม 8 เดิม)

| Agent | หน้าที่ | โมเดล | อ่าน/เขียน |
|---|---|---|---|
| scout-news | ดึงข่าว watchlist รายวัน คัด เขียน knowledge/news/ | Grok + Gemini grounding | เขียน knowledge/news/ |
| dca-pilot | จำลองซื้อ DCA ตามกฎ + งบคงที่ + conviction (Earth) + macro (Amp) | Claude | อ่าน state+brief, เขียน portfolio/ |
| Earth (reuse) | conviction score ป้อน dca-pilot ตัดสินน้ำหนัก | — | — |
| Nontr (reuse) | ลบข่าวหมดอายุ + sync INDEX | — | — |

## F. Roadmap (แต่ละเฟส = VSCode prompt 1 ก้อน)

| เฟส | ทำอะไร | depends on |
|---|---|---|
| 0 — Prereq | push repo ขึ้น GitHub, สมัคร API key (Anthropic/Gemini/Grok/Finnhub/Twelve Data), ใส่ GitHub Secrets, ลง Claude Agent SDK | — |
| 1 — ข่าวรายวัน | scout-news + .github/workflows/daily.yml + expiry cleanup + auto-commit — **done** (known issue: TSM 13F-dump noise ยอมรับเป็น v1 แก้เฟส 5) | 0 |
| 2 — Portfolio model | portfolio/state.json + rules.md + กติกา DCA (ยังไม่ automate) + seed เริ่มต้น — **done** | 0 |
| 3 — dca-pilot | จำลองซื้อ DCA รายสัปดาห์ + NAV รายวัน (Finnhub quote + open.er-api FX, ไม่มี Claude/LLM ใน CI) — **done** conviction = `portfolio/conviction.json` ที่ผู้ใช้ refresh เอง | 1, 2 |
| 4 — เว็บอัปเดตเอง | `scripts/render-showcase.mjs` regenerate `showcase/index.html` จาก state/history (JSON only, no API) + `<!-- DCA:START/END -->` marker + workflow auto-commit → Vercel auto-deploy on push — **done** | 3 |
| 5 — Hardening | idempotent cron, error/retry, cost cap, log, กันรันซ้ำวันเดียวกัน | 1-4 |

## G. Decision

ตัดสินแล้ว:

- [x] Market data = Finnhub (primary) + Twelve Data (fallback)
- [x] automation host = GitHub Actions; Vercel = static hosting/auto-deploy
- [x] stack = Claude + Gemini (+ Grok ตั้งแต่เฟส 1)

ตัดสินเพิ่ม (รอบนี้):

- [x] stack เฟส 1 = ฟรี (Gemini primary + GitHub Models fallback TODO); Claude/xAI deferred เฟส 3+

- [x] Watchlist = AAPL, NVDA, MSFT, GOOGL, AMZN, META, TSM (7 ตัว — เพิ่ม AMZN/META ให้ครบ mega-cap tech, แก้ได้ภายหลัง) + ดึงโลโก้จาก Finnhub
- [x] GitHub repo = **public**
- [x] งบ DCA = 10,000 / เดือน
- [x] การแบ่งน้ำหนัก = ตาม conviction (Earth score) เป็น default, เท่ากันเป็น fallback ถ้ายังไม่มี brief/score — config ใน portfolio/rules.md

- [x] สกุลงบ = **THB** (แปลง USD ด้วย USDTHB rate จาก open.er-api.com ทุกวันที่รัน — free, no key)
- [x] จังหวะ DCA = **ทุกวันศุกร์** (weekly-friday) งบ = 10,000 ÷ จำนวนศุกร์ในเดือนนั้น

## H. ค่าใช้จ่าย (คร่าว)

- Gemini / Finnhub / Twelve Data / GitHub Actions (public) → เริ่มฟรีได้
- Claude API + Grok → จ่ายตาม token, วันละครั้ง watchlist เล็ก → ~$1–5/เดือน ถ้าคุม scope
- Vercel static hosting → ฟรี (Hobby)

## I. หลักการความปลอดภัย/กฎหมาย

- ทุก output ติดป้าย SIMULATION / educational
- ไม่ต่อ broker, ไม่สั่งซื้อจริง, ไม่ออก buy/sell recommendation
- คงข้อความ disclaimer + "not financial advice · DYOR" บนเว็บ

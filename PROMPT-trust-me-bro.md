# Prompt สำหรับ Claude Code (วางทั้งก้อนนี้ได้เลย)

สร้างเว็บไซต์ไฟล์เดียว HTML + CSS + JS วานิลลา ไม่ใช้ framework
**เขียนทับไฟล์ `showcase/index.html` ที่มีอยู่เดิมในโปรเจกต์ได้เลย** (เนื้อหาเดิมในไฟล์นั้นไม่ต้องเก็บ ให้แทนที่ทั้งหมดด้วยเว็บใหม่ตามสเปกนี้)
ชื่อโปรเจกต์: **"Trust me bro — บันทึกการลงทุน + วิเคราะห์หุ้นด้วย AI agent"**
ภาษาเนื้อหา: ไทย (`<html lang="th">`)

## คอนเซปต์
เว็บบันทึกการลงทุนแบบเปิด (open investing journal) ดีไซน์เหมือน **สมุดโน้ตกระดาษ/นิตยสารทำมือ** มีกลิ่นอายลายมือเขียน ใช้ทีม AI agent ช่วยอ่านงบ 10-K, ฟัง earnings call และคัดข่าว

## ระบบดีไซน์ (สำคัญมาก ทำให้ตรง)
ใช้ CSS custom properties ใน `:root`:
- กระดาษ: `--paper:#efe6d2` `--paper-2:#e6dcc2` `--paper-3:#d9cea9`
- หมึก: `--ink:#1c1d22` `--ink-2:#4a4a52` `--ink-3:#8b8a85`
- เส้น: `--rule:#ccc09d` `--rule-soft:#d8ceac`
- น้ำเงินโคบอลต์: `--sage:#3a5cc1` `--sage-2:#2c4aa3` `--sage-deep:#1a2e6b` `--sage-soft:#c8d3ee`
- แอคเซนต์: `--stamp:#c8533a` (ส้มแดงแบบตราปั๊ม), `--highlight:#f4dc6a` (ไฮไลต์เหลือง)
- ฟอนต์ผ่าน Google Fonts: `--script:'Caveat',cursive` (ลายมือ) · `--display:'Mitr',sans-serif` (หัวข้อ) · `--sans:'IBM Plex Sans Thai',sans-serif` (เนื้อความ)

พื้นหลัง body ใส่ texture กระดาษด้วย `radial-gradient` จาง ๆ 2 จุด + `repeating-linear-gradient` เส้นบรรทัดทุก 28px แบบจางมาก

## เลย์เอาต์
`.app` เป็น CSS grid 2 คอลัมน์ `260px 1fr` — ซ้ายเป็น sidebar (sticky เต็มจอ scroll ได้), ขวาเป็น main (max-width 1100px, padding 56px 64px 80px)
จอ ≤880px ยุบเหลือคอลัมน์เดียว (sidebar อยู่บน), จอเล็กลด padding

### Sidebar (`<aside class="sidebar">`)
- โลโก้ `.brand`: กล่องสี่เหลี่ยมน้ำเงิน `.mark` ตัวอักษร "Tm" ลายมือ เอียง -4deg มี box-shadow แข็ง `2px 2px 0 var(--sage-deep)` + คำว่า `Trust me` ตามด้วย `bro.` ตัวเอียงลายมือสีน้ำเงินเข้ม
- เส้นคั่นแบบประ `.side-rule` (`border-top:1px dashed`)
- หัวข้อกลุ่ม `.side-h`: ตัวเล็ก uppercase letter-spacing กว้าง
- เมนู **Pages**: Home / Diary / News / Substack / AI Team / Market — แต่ละอันมีไอคอน SVG เส้น (stroke) 24x24 ลิงก์ `#anchor`, ตัว active พื้น `--sage-soft`
- เมนู **On this page** (toc): ผมเป็นใคร / Market snapshot / ข่าวสำคัญวันนี้ / ทีม AI / มุม DCA / วิธีทำบทวิเคราะห์ / คลังบันทึก
- `.side-cta` ดันลงล่างสุด (`margin-top:auto`): ปุ่มกลม "★ Subscribe ช่อง" ลิงก์ `https://www.youtube.com/@ลงทุนDiary`, ไอคอนโซเชียลกลม 3 อัน (YouTube/X/Substack เป็น SVG), บรรทัด `© 2026 · Trust me bro`

### Main — 8 ส่วน คั่นด้วย `<hr class="dashed-rule">` และมี `<div class="page-mark">page N</div>` (ชิดขวา ฟอนต์ลายมือ มีขีด — ครอบหน้าหลัง)

1. **HERO** (`#top`): grid 2 คอลัมน์
   - ซ้าย: h1 ใหญ่มาก ฟอนต์ลายมือ `clamp(72px,9vw,132px)` — บรรทัดแรก `Trust me,` (ฟอนต์ Mitr), ขึ้นบรรทัดใหม่ `bro` ตัวเอียงสีน้ำเงินเข้ม + จุด `.` สีน้ำเงิน. ใต้หัวข้อมีคำโปรย: *"บันทึกการลงทุนแบบเปิด — เขียนเอง อ่านงบเอง พร้อมทีม AI ช่วยสรุป 10-K, ฟัง earnings call และคัดข่าวให้ทุกเช้า — ไม่ต้องเชื่อผม มาเช็ค logs ได้ทุกเมื่อ"*. แถวปุ่ม `.pill`: "เริ่มอ่าน →" (primary น้ำเงิน), "ทีม AI ของผม", และ stamp ข้อความ "ตอนนี้ฟรีทั้งหมด"
   - ขวา: การ์ดดำ `.hero-card` เอียง -1deg มี box-shadow แข็ง + ลายตารางทแยงจาง ๆ ::before, eyebrow ลายมือเหลือง "first time here?", h3 "ดูคลิป intro ก่อนเชื่อ" + ไอคอน play สี่เหลี่ยมส้ม, meta ลายมือ "10 นาที · ทำไมต้องจดทุกอย่างที่ซื้อ", ลิงก์ "Watch on YouTube →"

2. **ABOUT** (`#about`) — "ผมเป็นใคร / who is this guy?": วงกลม avatar + ย่อหน้า placeholder บอกว่าเป็นนักลงทุนสาย DCA จดวิเคราะห์ด้วย AI agent ไม่ใช่ที่ปรึกษาการลงทุน (มี `.hl` ไฮไลต์คำว่า "DCA มา X ปี")

3. **MARKET** (`#market`) — "ตลาดวันนี้ / today's snapshot ~ 16 พ.ค. 26 ~": กล่อง `.chart-frame` วางกราฟ (placeholder "TradingView chart embed ที่นี่" + ลูกศรเขียนมือ "↘ ใส่กราฟตรงนี้" / "~ 1080 × 400 ~") + ตาราง `.levels`: คอลัมน์ Ticker / แนวรับ / แนวต้าน / มุมมอง — แถว AAPL, NVDA, MSFT, GOOGL, TSM (ตัวเลขแนวรับสีเขียว, มุมมองมี badge bull/wait)

4. **NEWS** (`#news`) — "ข่าวสำคัญวันนี้ / picked by nayoey · Fri · 16 May 2026": grid การ์ดข่าว 6 ใบ แต่ละใบมี ticker-tag + เวลา + headline + สรุป (NVDA Blackwell Ultra, AAPL Apple Intelligence, TSM ขึ้นราคา wafer, MSFT Copilot Agent Studio, GOOGL Gemini 3 Pro, MACRO Fed Minutes)

5. **AGENTS** (`#agents`) — "ทีม AI ของผม / three helpers, one notebook": การ์ด agent 3 ใบ มีป้าย "VOL n", ไอคอน SVG, role + ชื่อ, คำอธิบาย, สถานะ "● พร้อมทำงาน":
   - **mint** — 10-K Reader (อ่านงบประจำปีสรุปความเสี่ยง/โครงสร้างรายได้/red flag)
   - **arm** — Earnings Call (ฟัง call แกะ tone ผู้บริหาร/guidance/Q&A)
   - **nayoey** — News & Sentiment (ตามข่าว 40+ แหล่ง + sentiment score)

6. **DCA** (`#dca`) — "มุม DCA / a weekly column": ย่อหน้า placeholder 3 ย่อหน้า + รายการ `.dca-list` มีเลขลำดับ 3 ข้อ (ตั้งจำนวนเงินก่อน / วันกดซื้อต้องไม่เปลี่ยน / อย่าหยุดตอนตลาดแดง)

7. **METHODOLOGY** (`#methodology`) — "บทวิเคราะห์มาจากไหน / where each brief comes from": flow 3 step มีลูกศรโค้งเขียนมือ (SVG path โค้ง) คั่น: STEP1 อ่านงบจริง (by mint) → STEP2 ฟัง earnings call (by arm) → STEP3 ตรวจข่าว+sentiment (by nayoey) + บรรทัดสรุป "ทุก brief อ้างอิงเอกสารจริง ไม่ใช่เดาจากพาดหัวข่าว"

8. **LIBRARY** (`#library`) — "คลังบันทึก / all entries" + ปุ่ม "ดูทั้งหมด →": grid การ์ด 6 ใบ มี "VOL 24..19", ticker, วันที่, หัวข้อ, สรุป, footer "by [agent] · N min" (NVDA, TSM, AAPL, MSFT, GOOGL, META)

**FOOTER** `.foot`: 4 คอลัมน์ (แบรนด์+คำโปรย / Channels: YouTube + placeholder Substack,Podcast / หมวด: ลิงก์ anchor / เกี่ยวกับ) + แถบ `.disclaimer` มีไอคอนเตือน "เนื้อหาทั้งหมดเป็นบันทึกส่วนตัวเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุน" + Updated [16 พ.ค. 2026] + แถวล่าง "© 2026 · ทำด้วยใจในกรุงเทพฯ" / "not financial advice · DYOR"

## รายละเอียดสไตล์ที่ขาดไม่ได้ (เอกลักษณ์)
- ปุ่ม `.pill`: กลมมน border 1.5px, ตัว primary พื้น `--sage-soft` hover เป็นน้ำเงินตัวอักษรขาว, ลูกศร `→` ใช้ฟอนต์ลายมือ
- การ์ดสำคัญเอียงเล็กน้อย (-1deg/-3deg/-4deg) + box-shadow แบบ offset แข็ง (ไม่เบลอ) ให้ดูเหมือนกระดาษซ้อน
- ป้าย "VOL n" และ "STEP n" เป็นตัวพิมพ์เล็ก letter-spacing กว้างเหมือนตราปั๊ม
- ลูกศร/ข้อความ scribble ใช้ฟอนต์ Caveat เอียง สี `--ink-3`
- เส้นคั่น dashed ทุกที่, page-mark ฟอนต์ลายมือชิดขวา
- ทุก section heading `.sec-head`: h2 ฟอนต์ Mitr ตัวหนา + `.sub` ภาษาอังกฤษตัวเล็กลายมือ/จาง + บางอันมี `.date`
- hover การ์ด/ลิงก์: ยก translateY(-1px) + เปลี่ยนพื้นเล็กน้อย, transition .15s

## JS
ใส่ `<script>` ท้าย body: smooth-scroll เอง — ดักคลิก `a[href^="#"]` แล้ว `window.scrollTo({top, behavior:'smooth'})` โดยหัก offset 24px (ห้ามใช้ scrollIntoView)

## เทคนิค
- ไฟล์เดียวจบ เขียนทับ `showcase/index.html` (โครงเดิมทิ้งได้), CSS อยู่ใน `<style>`, ไม่มี build step
- โหลดฟอนต์จาก Google Fonts: Caveat (500,600,700), Mitr (500,600,700), IBM Plex Sans Thai (300,400,500,600) ผ่าน `<link>` + preconnect
- ไอคอนทั้งหมดเป็น inline SVG (stroke-based) ไม่ใช้ไลบรารีไอคอน
- Responsive ครบ: breakpoint 1100 / 900 / 880 / 640px
- ข้อความที่ยังไม่จริงให้ใส่ `[placeholder]` ไว้ตามเดิม เพื่อให้เจ้าของแก้เองภายหลัง

ทำให้เนี้ยบ พิกเซลใกล้เคียงสเปกนี้ที่สุด เขียนผลลงที่ `showcase/index.html` (ทับของเดิม) เสร็จแล้วเปิดไฟล์นั้นในเบราว์เซอร์ตรวจดูทุก section

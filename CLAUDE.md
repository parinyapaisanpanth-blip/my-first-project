# Project: My First Project

**What this is:** โปรเจคทดลองตัวแรกของผม เพื่อหัดใช้ Claude Code ใช้เป็นที่ทดลองสร้าง slash command, skill, sub-agent ระหว่างเรียน LTD AI 101

## วิธีทำงาน

- ก่อนทำอะไรที่แก้ไฟล์เยอะหรือลบของ ให้ขออนุญาตก่อน
- แก้ไฟล์ที่มีอยู่แล้ว อย่าสร้างใหม่ถ้าไม่จำเป็น
- คำตอบให้ตรง อย่าอ้อม
- ภาษาไทยใช้ได้ ภาษาอังกฤษใช้ได้

## What lives where

- `briefs/` สำหรับ stock brief ที่ /brief สร้าง
- `.claude/commands/` สำหรับ slash command files

## ห้าม

- อย่ารัน rm -rf หรือคำสั่งลบ folder โดยไม่ถามก่อน
- อย่าแก้ไฟล์ที่อยู่ข้างนอก folder นี้

## Investing voice (for /brief output)

ผมลงทุนสไตล์ long-term (ถือ 5-10+ ปี) ดู fundamentals ก่อน — revenue durability, margin trend, ใครเป็นลูกค้า, capital allocation ผมเลี่ยงหุ้นที่ thesis อยู่กับ macro หรือ Fed move ผมต้อง name kill condition ให้ได้ก่อนกดซื้อทุกครั้ง ถ้านึกไม่ออกว่าเมื่อไหร่ควรเลิกถือ แสดงว่าผมไม่เข้าใจหุ้นพอ ผม honest เรื่องไม่รู้ ตัวเลขที่ verify ไม่ได้ผมไม่ใส่ confidence ผมเปิดรับหุ้นทุกตัวที่สามารถสร้างรายได้อย่างยั่งยืนให้ผมได้ ไม่มี sector ที่ตัดออกตายตัว แต่ต้อง pass fundamentals ก่อนเสมอ

ผมใช้ technical analysis ประกอบการตัดสินใจด้วย โดยดูแนวรับแนวต้านและ pattern กราฟเพื่อหาจังหวะเข้าซื้อ แต่ fundamentals ยังเป็นตัวตัดสินหลักว่าจะถือหรือไม่

Skill `company-brief` ต้องสะท้อนเสียงนี้ใน output ทุกครั้ง ใน Bull/Bear, Kill conditions, และ "What to ask" sections โดยเฉพาะ

## ระบบ automation (เฟส 0–5)

Roadmap เต็มอยู่ใน `PLAN.md` | เว็บ live: https://my-first-project-one-steel.vercel.app/

### File map — แก้อะไรไปไฟล์ไหน

| สิ่งที่อยากแก้ | ไฟล์ที่ต้องแตะ |
|---|---|
| watchlist / aliases | `portfolio/watchlist.json` |
| งบลงทุน / สกุลเงิน / จังหวะ DCA | `portfolio/state.json` + `portfolio/rules.md` |
| conviction weighting (คะแนนแล้ว commit) | `portfolio/conviction.json` |
| กรองข่าว / noise filter | `scripts/scout-news.mjs` |
| สูตรซื้อ / NAV / FX / retry logic | `scripts/dca-pilot.mjs` |
| สิ่งที่โชว์บนเว็บ (data layer) | `scripts/render-showcase.mjs` |
| ดีไซน์ / CSS เว็บ | `showcase/index.html` (ใน `.port-*` class ภายใต้ `<style>`) |
| automation / cron schedule | `.github/workflows/daily.yml` |

### ห้ามแก้มือ

- `portfolio/history.json` — append-only, script เขียนเท่านั้น
- เขตระหว่าง `<!-- DCA:START -->` และ `<!-- DCA:END -->` ใน `showcase/index.html`

---
name: earnings-recap
description: รับ earnings call transcript แล้วสรุปเป็น diary-style recap 1 หน้า
---

## Input
รับ TICKER และ path ของ transcript file เช่น sources/AAPL/q2-2026-call.md

## Steps
แบ่ง transcript เป็น 4 ก้อนขนาน:
1. เรียก sub-agent `arm` อ่านเฉพาะส่วน guidance (forward outlook, FY forecast)
2. เรียก sub-agent `arm` อ่านเฉพาะส่วน Q&A ที่ analyst ถามแล้ว management ตอบเซอร์ไพรส์
3. เรียก sub-agent `mint` อ่านเฉพาะส่วน capex / R&D commentary
4. เรียก sub-agent `nayoey` หา market reaction หลัง earnings

## Output format
### Earnings Recap — <TICKER> <Quarter>

**Guidance:** <2-3 ประโยค สิ่งที่ management บอกว่าจะเกิดขึ้น>

**Q&A Surprise:** <อะไรที่ analyst ถามแล้วคำตอบไม่ตรงกับที่ตลาด expect>

**Capex / R&D:** <บริษัทจะใช้เงินลงทุนที่ไหน เท่าไหร่>

**Management Tone:** <อ่านน้ำเสียง confident / defensive / cautious>

**ผมมองว่า:** <2-3 ประโยค ตามเสียงนักลงทุนของคุณจาก CLAUDE.md>

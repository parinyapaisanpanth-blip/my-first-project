---
name: people-brief
description: สร้าง brief สำหรับ vendor หรือ candidate ก่อนตัดสินใจ
---

## Input
รับชื่อคน/บริษัท และ context เช่น "Acme Co มา pitch software ราคา 50k/ปี" หรือ "John มาสัมภาษณ์ตำแหน่ง analyst"

## Steps
เรียก sub-agent ขนาน:
1. เรียก sub-agent `nayoey` หา track record: ผลงานที่ผ่านมา, reputation, red flags
2. เรียก sub-agent `nayoey` หา pricing / comp benchmark: ราคาตลาดของ service นี้หรือเงินเดือนตำแหน่งนี้
3. เรียก sub-agent `mint` อ่านไฟล์ใน sources/people/<NAME>/ ถ้ามี (CV, LinkedIn export, proposal)

## Output format
### People Brief — <ชื่อ> (<vendor/candidate>)

**Track record:** <สิ่งที่หาได้ พร้อม flag ถ้ามี red flag>

**Fit:** <ตรงกับ need จริงไหม อธิบาย 2-3 ประโยค>

**Pricing / Comp:** <ราคาที่เขาเสนอ vs ราคาตลาด>

**3 คำถามก่อนตัดสิน:**
1. ...
2. ...
3. ...

**ผมมองว่า:** <recommendation สั้นๆ ตามเสียงใน CLAUDE.md>

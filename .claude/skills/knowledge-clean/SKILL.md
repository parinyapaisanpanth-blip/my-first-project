---
name: knowledge-clean
description: Use when the user wants to clean up expired knowledge files (e.g. "/clean", "ล้าง knowledge ที่หมดอายุ", "sync INDEX"). Spawns Nontr agent to scan knowledge/ tree, delete expired files, and sync INDEX.md.
---

# knowledge-clean SOP

## When to use this

ผู้ใช้ต้องการล้าง knowledge base จากไฟล์หมดอายุ Trigger ทั่วไป:
- `/clean` slash command
- "ล้าง knowledge ที่หมดอายุ"
- "sync INDEX"
- "Nontr ช่วยตรวจ knowledge หน่อย"

## Inputs you need

ไม่มี argument — รัน `/clean` ได้เลย

## Steps

1. **แสดงว่ากำลังเริ่ม scan:**
   > "กำลังเรียก Nontr ตรวจ knowledge/ tree..."

2. **Spawn Nontr agent** (`subagent_type: "Nontr"`) ด้วย prompt:
   > "scan ทั้ง knowledge/ tree วันนี้คือ <วันที่ปัจจุบัน YYYY-MM-DD> ให้ทำตามขั้นตอนครบ: (1) ลบไฟล์ที่ expires เลยวันนี้ (2) sync INDEX.md ให้ตรงกับไฟล์จริง รวม entry ซ้ำ (3) return Sync Report ตาม format ใน role ของคุณ"

3. **รอ Nontr return Sync Report** แล้วแสดงผลทั้งหมดกลับให้ผู้ใช้โดยตรง

4. **ถ้า Nontr report ว่าไม่มีไฟล์ expired และ INDEX สะอาดแล้ว** ให้แสดง:
   > "knowledge/ clean อยู่แล้ว — ไม่มีไฟล์ expired, INDEX ตรงกับไฟล์จริง"

## กฎเด็ดขาด

- ห้ามลบไฟล์เองโดยไม่ผ่าน Nontr
- ห้ามแก้ INDEX.md เองโดยไม่ผ่าน Nontr
- ถ้า Nontr return error หรือหา knowledge/ ไม่เจอ ให้แจ้งผู้ใช้ชัด ๆ ว่าเกิดอะไรขึ้น
- ห้ามแต่งจำนวนไฟล์ที่ลบ รายงานตามที่ Nontr return จริงเท่านั้น

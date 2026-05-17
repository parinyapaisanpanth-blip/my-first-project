---
name: knowledge-learn
description: Use when the user wants to save knowledge to the knowledge base (e.g. "/learn macro fed-notes ...", "บันทึก thesis AAPL ลง knowledge"). Saves content as a file in knowledge/<หมวด>/ with frontmatter, then syncs INDEX.md via Nontr agent.
---

# knowledge-learn SOP

## When to use this

ผู้ใช้ต้องการบันทึกข้อมูลลง knowledge base Trigger ทั่วไป:
- `/learn <หมวด> <หัวข้อ> <เนื้อหา>` slash command
- "บันทึก X ลง knowledge"
- "เซฟ note นี้ไว้ใน macro"

## Inputs you need

```
/learn <หมวด> <หัวข้อ> <เนื้อหา> [--expires YYYY-MM-DD]
```

- **หมวด** (required) — ต้องเป็นหนึ่งใน: `companies`, `macro`, `news`, `thesis`, `dca`
- **หัวข้อ** (required) — ชื่อไฟล์ที่จะสร้าง (ใช้ kebab-case, ไม่มี space, ไม่มี .md)
- **เนื้อหา** (required) — เนื้อหาที่จะบันทึก
- **--expires YYYY-MM-DD** (optional) — วันหมดอายุ ถ้าไม่ระบุ default = วันนี้ + 90 วัน

## Steps

1. **Parse arguments** จาก `$ARGUMENTS`
   - แยก หมวด / หัวข้อ / เนื้อหา / expires (ถ้ามี)
   - ถ้า argument ไม่ครบ ให้ถามก่อนทำอะไรต่อ

2. **Validate หมวด**
   - ต้องเป็น `companies`, `macro`, `news`, `thesis`, `dca` เท่านั้น
   - ถ้าพิมพ์นอกนั้น ให้ error: "หมวดที่รองรับมีแค่: companies / macro / news / thesis / dca" แล้วหยุด

3. **คำนวณ expires**
   - ถ้ามี `--expires YYYY-MM-DD` ใช้ค่านั้น
   - ถ้าไม่มี คำนวณ วันนี้ + 90 วัน แล้ว format เป็น YYYY-MM-DD

4. **สร้างไฟล์** ที่ `knowledge/<หมวด>/<หัวข้อ>.md` ด้วย format นี้:

```markdown
---
title: <หัวข้อ>
summary: <สรุปสั้น 1 บรรทัดจากเนื้อหา ให้ Claude สรุปเอง>
created: YYYY-MM-DD
expires: YYYY-MM-DD
tags: [<หมวด>]
---

<เนื้อหาที่ผู้ใช้ส่งมา>
```

   - ถ้า folder `knowledge/<หมวด>/` ยังไม่มีให้สร้าง
   - ถ้าไฟล์นั้นมีอยู่แล้ว ให้แจ้งผู้ใช้และขอ confirm ก่อน overwrite

5. **Spawn Nontr agent** (`subagent_type: "Nontr"`) ด้วย prompt:
   > "sync INDEX.md — ไฟล์ใหม่ที่เพิ่งสร้าง: knowledge/<หมวด>/<หัวข้อ>.md title: <หัวข้อ> summary: <summary> expires: <expires> เพิ่ม entry นี้เข้า INDEX ใต้หมวด <หมวด> แล้ว report กลับมา"

6. **แสดงผล:**

```
บันทึกแล้ว: knowledge/<หมวด>/<หัวข้อ>.md
expires: YYYY-MM-DD

INDEX entry ที่เพิ่ม:
<หัวข้อ> | <summary> | expires: YYYY-MM-DD | knowledge/<หมวด>/<หัวข้อ>.md
```

## กฎเด็ดขาด

- ห้ามเดาหมวด ถ้าผู้ใช้พิมพ์ผิดให้ error ชัด ๆ
- ห้าม overwrite ไฟล์เดิมโดยไม่ confirm
- ถ้า Nontr sync ไม่สำเร็จ ให้แจ้งผู้ใช้ว่าไฟล์ถูกสร้างแล้วแต่ INDEX อาจยังไม่ update
- thesis/ เป็น append-only โดย Frame agent — ถ้าผู้ใช้พยายาม /learn thesis <TICKER> ให้แจ้งว่า thesis/ จัดการโดย Frame agent และแนะนำให้ใช้ `/brief` แทน

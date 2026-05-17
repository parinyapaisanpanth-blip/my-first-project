# Knowledge System

โฟลเดอร์นี้เป็น persistent knowledge base สำหรับข้อมูลที่ agents ต้องการระหว่าง sessions
ไฟล์ใน sources/ เป็น raw data (10-K, earnings call) — knowledge/ เป็นสิ่งที่ distill ออกมาแล้ว

---

## โครงสร้าง

```
knowledge/
├── companies/   ข้อมูลเชิงลึกรายบริษัท (competitive notes, moat analysis)
├── macro/       macro snapshots (Fed stance, regime, sector rotation)
├── news/        news summaries ที่บันทึกไว้ มักมี expires date
├── thesis/      thesis history รายบริษัท (<TICKER>.md)
├── dca/         แผน DCA และ position sizing
├── INDEX.md     index กลางของทุก entry — ดูแลโดย Nontr
└── README.md    ไฟล์นี้
```

---

## Agent Map — ตัวไหนใช้ตอนไหน

| Agent | ใช้เมื่อ | อ่าน | เขียน |
|-------|----------|------|-------|
| **Amp** | ต้องการภาพ macro regime + sector impact ก่อนวิเคราะห์หุ้น | knowledge/macro/ + WebSearch | — |
| **Frame** | มี brief ใหม่และต้องการ track thesis เปลี่ยนไปแค่ไหน | briefs/ + knowledge/thesis/ | knowledge/thesis/<TICKER>.md |
| **Earth** | ต้องการ conviction score หลังอ่าน brief | brief content (via prompt) | — |
| **Nontr** | ต้องการ sync INDEX หรือ expire ไฟล์เก่า | knowledge/ ทั้งหมด | knowledge/INDEX.md + ลบไฟล์ expired |

---

## Format ไฟล์ใน knowledge/

แต่ละไฟล์ควรมี frontmatter ด้านบน:

```yaml
---
title: <ชื่อ>
summary: <สรุปสั้น 1 บรรทัด>
expires: YYYY-MM-DD   # ละไว้ถ้าไม่หมดอายุ
tags: [companies | macro | news | thesis | dca]
---
```

ไฟล์ที่มี `expires:` จะถูก Nontr ลบอัตโนมัติเมื่อถึงวันนั้น

---

## กฎ

- ห้ามใส่ข้อมูลดิบ (raw transcript, full 10-K) ใน knowledge/ — ของพวกนั้นอยู่ใน sources/
- ข้อมูลใน thesis/ append-only — Frame จัดการ ห้ามลบ entry เก่า
- INDEX.md ดูแลโดย Nontr — อย่าแก้มือยกเว้นจำเป็น

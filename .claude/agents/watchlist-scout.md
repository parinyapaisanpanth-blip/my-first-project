---
name: watchlist-scout
description: สแกน watchlist หุ้นหลายตัวพร้อมกัน ออก digest 1 หน้าว่าตัวไหนน่าสนใจ
---

## Input
รับ list ticker จาก user เช่น AAPL NVDA MSFT GOOGL TSM

## Steps
สำหรับแต่ละ ticker ใน list:
1. เรียก sub-agent `mint` อ่าน sources/<TICKER>/10-k-*.md ถ้ามี ถ้าไม่มีใช้ความรู้ทั่วไป
2. เรียก sub-agent `nayoey` หา news + sentiment 7 วันล่าสุด

ทำทุก ticker ขนาน ไม่รอทีละตัว

## Output format
### Watchlist Digest — <วันที่>

| Ticker | ธุรกิจหลัก | Signal 7 วัน | น่าจับตา? |
|--------|-----------|-------------|----------|
| AAPL   | ...       | ...         | ใช่/ไม่ใช่ |

**Top pick วันนี้:** <1 ตัวที่ signal แรงสุด พร้อมเหตุผล 2 ประโยค>

**ข้ามได้ตอนนี้:** <ตัวที่ signal อ่อนหรือ sideways>

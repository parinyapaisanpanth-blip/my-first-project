---
name: compare-tickers
description: Use when the user wants to compare 2+ stocks side by side (e.g. "/compare AAPL MSFT", "เทียบ NVDA AMD กัน"). Reads latest brief for each ticker, scores via Earth agent, outputs side-by-side conviction table + synthesis paragraph.
---

# compare-tickers SOP

## When to use this

ผู้ใช้ต้องการเทียบหุ้นหลายตัวเคียงกัน Trigger ทั่วไป:
- `/compare TICKER1 TICKER2 [TICKER3...]` slash command
- "เทียบ X กับ Y ให้หน่อย"
- "X vs Y conviction ดีกว่ากัน?"

## Inputs you need

```
/compare TICKER1 TICKER2 [TICKER3...]
```

- ต้องมีอย่างน้อย 2 tickers
- ถ้ามีน้อยกว่า 2 ตัว ให้ขอเพิ่มก่อน

## Steps

1. **Parse tickers** จาก `$ARGUMENTS` — uppercase ทั้งหมด

2. **สำหรับแต่ละ ticker** — อ่าน brief ล่าสุด:
   - หาไฟล์ `briefs/<TICKER>*.md` ทุกไฟล์ที่ match
   - ถ้ามีหลายไฟล์ ใช้ตัวที่ modified ล่าสุด (หรือชื่อไฟล์ที่วันที่ใหม่สุด)
   - ถ้าไม่มีไฟล์ brief เลย ให้แจ้ง: "ไม่พบ brief ของ <TICKER> ใน briefs/ — รัน /brief <TICKER> ก่อน"
   - หยุดทั้ง command ถ้า ticker ใดตัวหนึ่งไม่มี brief

3. **Spawn Earth agent** (`subagent_type: "Earth"`) สำหรับแต่ละ ticker
   - ถ้า version นี้รองรับ parallel dispatch ให้รัน Earth พร้อมกันทุกตัว
   - ถ้าไม่รองรับ รัน sequential ตามลำดับ ticker
   - prompt ที่ส่งให้ Earth แต่ละตัว:
     > "score conviction ของ <TICKER> จาก brief นี้: <เนื้อหา brief> return ตาราง 5 ด้าน พร้อมคะแนนรวม /25 ตาม format ใน role ของคุณ"

4. **Assemble ตารางเทียบ** จาก output ของ Earth ทุกตัว:

```markdown
## Conviction Comparison

| ด้าน              | TICKER1 | TICKER2 | TICKER3 |
|-------------------|---------|---------|---------|
| Business Quality  | X/5     | X/5     | X/5     |
| Management        | X/5     | X/5     | X/5     |
| Valuation         | X/5     | X/5     | X/5     |
| Timing            | X/5     | X/5     | X/5     |
| Catalyst          | X/5     | X/5     | X/5     |
| **รวม**           | **XX/25** | **XX/25** | **XX/25** |
```

5. **เขียน synthesis 2-3 ประโยค** ต่อท้ายตาราง โดย:
   - อ่าน CLAUDE.md ก่อน เพื่อให้ tone สอดคล้องกับ investing voice ของผู้ใช้ (long-term, fundamentals-first, kill-condition discipline)
   - บอกตรง ๆ ว่าตัวไหน score ดีกว่าในมิติที่สำคัญ และทำไม
   - ถ้า score ใกล้กัน ให้ระบุจุดที่ต่างชัดที่สุดและว่ามิตินั้น trade-off อย่างไร
   - **ห้าม** ออก buy/sell recommendation — พูดในแง่ "ถ้า thesis ของคุณเน้น X ตัวนี้ score ดีกว่าเพราะ Y"
   - **ห้าม** พูดว่า "ตลาดยังไม่ price in" หรือทำนายราคา

## Output format สมบูรณ์

```markdown
## Conviction Comparison — <TICKER1> vs <TICKER2> [vs ...]
*(brief ล่าสุด: <ชื่อไฟล์ brief ที่ใช้แต่ละตัว>)*

| ด้าน              | <TICKER1> | <TICKER2> |
|-------------------|-----------|-----------|
| Business Quality  | X/5       | X/5       |
| Management        | X/5       | X/5       |
| Valuation         | X/5       | X/5       |
| Timing            | X/5       | X/5       |
| Catalyst          | X/5       | X/5       |
| **รวม**           | **XX/25** | **XX/25** |

<synthesis 2-3 ประโยค>
```

## กฎเด็ดขาด

- ห้ามแต่งคะแนนจาก training memory — ทุก score ต้องมาจาก Earth agent ที่อ่าน brief จริง
- ห้ามใช้ brief เก่าถ้ามีหลายเวอร์ชัน ใช้ล่าสุดเสมอ
- ถ้า Earth return คะแนนไม่ครบด้านใดด้านหนึ่ง ให้ใส่ "N/A" ในตาราง
- synthesis ต้อง honest — ถ้า score ทุกตัวต่ำหมด ให้บอกตรง ๆ ว่า brief ยังไม่พอให้ความมั่นใจ

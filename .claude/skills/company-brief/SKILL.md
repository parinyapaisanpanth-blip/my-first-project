---
name: company-brief
description: Use when the user asks for a research brief on a public stock (e.g. "/brief AAPL", "ทำ brief NVDA ให้หน่อย", "research TSLA"). Outputs a 6-section markdown brief saved to briefs/<TICKER>.md.
---

# company-brief SOP

## When to use this

ผู้ใช้ขอ research brief ของหุ้น 1 ตัว Trigger ทั่วไป:
- `/brief <TICKER>` slash command
- "ทำ brief หุ้น X ให้หน่อย"
- "ขอข้อมูลย่อๆ ของ <ticker>"

## Inputs you need

- 1 stock ticker (เช่น AAPL, NVDA, GOOGL)
- ถ้าไม่มี ticker ให้ ask before doing anything else

## Steps

1. Confirm the ticker. ถ้า ambiguous (เช่น "META" อาจหมายถึงหลายบริษัทใน history) ask user to confirm
2. Read `CLAUDE.md` ที่ root ของ project เพื่อโหลด investing voice ของ user ก่อน output ต้องสะท้อนสไตล์นั้น (focus, framing, kill-condition discipline)
3. Dispatch agent ทั้ง 3 ตัว โดยส่ง ticker เป็น input ให้แต่ละตัว:
   - **mint** (`subagent_type: "mint"`) — อ่าน `sources/<TICKER>/10-k-*.md` return Company snapshot + Fundamentals signals
   - **arm** (`subagent_type: "arm"`) — อ่าน `sources/<TICKER>/q*-call.md` return ตัวเลขไตรมาส + guidance + management tone
   - **nayoey** (`subagent_type: "nayoey"`) — WebSearch return news 7 วัน + analyst moves + catalysts
   
   แต่ละ agent ทำงาน context isolated ห้าม agent ข้ามอ่าน source ของกันและกัน ถ้า Claude Code version นี้รองรับ parallel dispatch ให้รัน 3 ตัวพร้อมกัน ถ้าไม่รองรับให้รัน sequential ตามลำดับ mint → arm → nayoey
3b. หลัง mint/arm/nayoey return ครบ ให้ dispatch parallel อีก 3 ตัว:
   - **amp** (`subagent_type: "amp"`) — ส่ง ticker ให้ amp return ภาพ macro ปัจจุบัน + วิเคราะห์ว่า sector ของ ticker ได้/เสียจาก regime นี้ยังไง
   - **frame** (`subagent_type: "frame"`) — ส่ง ticker ให้ frame อ่าน briefs/<TICKER>*.md ทุกเวอร์ชัน + knowledge/thesis/<TICKER>.md แล้ว return สิ่งที่ thesis เปลี่ยนจากครั้งก่อน + kill condition ไหนใกล้ trigger (ถ้าไม่เคย brief ticker นี้มาก่อน frame จะบันทึกเป็น baseline แรก ไม่ error)
   - **earth** (`subagent_type: "earth"`) — ส่ง draft brief 6 section ที่รวมแล้วให้ earth return ตาราง conviction score 5 ด้าน /25
4. รวม output จาก mint + arm + nayoey เป็น brief 6 sections ตาม Output format ด้านล่าง โดย:
   - Section 1 (Company snapshot) และ Section 2 (Fundamentals signal) มาจาก mint
   - Section 3 (Latest earnings) มาจาก arm
   - Section 4 (Bull/Bear) และ Section 5 (Kill conditions) synthesize จาก output ทั้ง 3 ตัว
   - Section 6 (What to ask) synthesize จาก output ทั้ง 3 ตัวผนวก investing voice จาก CLAUDE.md
   - ถ้า agent ใดตัวหนึ่ง return "ไม่พบ source" ให้ระบุตรงๆ ในส่วนนั้น ห้ามแต่งแทน
   - Section 8 (Macro context) มาจาก amp
   - Section 9 (Thesis tracker) มาจาก frame
   - Section 10 (Conviction score) มาจาก earth
   - วาง 3 section ใหม่ต่อจาก section 7 ก่อน disclaimer
5. ถ้า folder `briefs/` ยังไม่มี ให้สร้าง
6. Save brief ที่ `briefs/<TICKER>.md` (uppercase ticker)
7. แสดง brief เต็มกลับใน chat ด้วย

## Output format (6 sections, required, no skipping)

ใช้ markdown headings ทั้ง 6 section ต้องมี ครบทุก brief

### 1. Company snapshot (3-4 ประโยคไทย)
บริษัททำอะไร, ขายให้ใคร, รายได้หลักมาจากไหน ภาษาคนปกติ ไม่เอาคำตลาด

### 2. Fundamentals signal (3-5 bullets)
Revenue trend, margin trend, balance sheet feel, capital allocation pattern **เน้น direction มากกว่าตัวเลข** เพราะตัวเลขเฉพาะอาจเก่า ถ้า ratio/margin specific ที่ไม่แน่ใจ ให้ใส่ "(ตัวเลข ตรวจสอบใน 10-K ล่าสุด)" ต่อท้าย

### 3. Latest earnings
3-5 bullets **Source:** อ่านทุกไฟล์ใน `sources/<TICKER>/` ก่อนเขียน ถ้า folder ว่างหรือไม่มี เขียนตรงๆ: "ไม่มี earnings transcript ใน sources/<TICKER>/ skip section นี้หรือ user ใส่ source ก่อน" ห้ามแต่งตัวเลขจากความจำ ทุก bullet ในนี้ต้อง trace กลับไปที่ไฟล์ใน sources/ ได้ และระบุไฟล์ต้นทางใน parens ท้าย bullet เช่น (source: sources/AAPL/q2-2026-call.md)

### 4. Bull case / Bear case
2-3 bullets แต่ละข้าง Bear case ต้อง substantive ไม่ใช่ "เศรษฐกิจไม่ดี" ต้องเป็นเหตุผลที่ specific to บริษัทนี้

### 5. Kill conditions (สำคัญ อย่าข้าม)
2-3 bullets "ถ้าเห็นอะไรเกิดขึ้น ผม/คุณควรเลิกถือ" ตัวอย่าง: "margin ลดลง 3 quarter ติด", "ลูกค้า top-3 หายไป 1 ราย", "CEO ออก + replacement weak" Kill conditions เป็นข้อเดียวที่กันให้ thesis ไม่กลายเป็น religion

### 6. What to ask before owning it (3-5 questions)
คำถามที่ beginner ควรตอบให้ได้ก่อนกดซื้อ ไม่ใช่คำตอบ เป็น question prompt

### 7. Technical analysis snapshot
- แนวรับ (Support) ที่สำคัญจาก historical price levels ที่รู้จาก training data
- แนวต้าน (Resistance) ที่สำคัญ
- Pattern หรือ trend ที่สังเกตได้จาก price history
- **หมายเหตุ**: ข้อมูลนี้อิงจาก training data ไม่ใช่ราคา real-time ให้ verify กับกราฟจริงก่อนตัดสินใจเสมอ

### 8. Macro context
จาก amp — ภาพ macro regime ปัจจุบัน + sector ของ ticker ได้หรือเสียประโยชน์จาก regime นี้ยังไง

### 9. Thesis tracker
จาก frame — สิ่งที่ thesis เปลี่ยนจาก brief ครั้งก่อน + kill condition ไหนใกล้ trigger
ถ้าเป็น brief ครั้งแรก: frame จะบันทึก baseline ใน knowledge/thesis/<TICKER>.md และระบุว่า "baseline แรก — ยังไม่มีประวัติเปรียบเทียบ"

### 10. Conviction score (/25)
จาก earth — ตาราง 5 ด้าน (Business Quality / Management / Valuation / Timing / Catalyst) แต่ละด้าน 1-5 + เหตุผล 1 บรรทัด + คะแนนรวม /25

## Voice rules

- Tone reflect investing voice ใน `CLAUDE.md` ของ project ถ้า CLAUDE.md บอก "long-term focus" ห้าม brief เน้น short-term trading angle
- **ห้าม** ออก buy/sell recommendation นี่คือ research summary ไม่ใช่คำแนะนำ
- **ห้าม** แต่ง verbatim quote ของ executive ใส่ blockquote ถ้าจะอ้างคำผู้บริหาร ใช้ indirect speech ("CEO กรอบ message ว่า...") ห้ามใส่ `>` quote ที่ verify ไม่ได้
- **ห้าม** ใช้คำว่า "moat" ตรงๆ ใช้ Helmer's 7 Powers ที่ specific (Scale Economies, Network Economies, Switching Costs, Branding, Counter-Positioning, Cornered Resource, Process Power) ถ้าจะพูดเรื่องความได้เปรียบ
- **ห้าม** บอกว่า "ตลาดยังไม่ price in" หรือทำนายว่านักลงทุนคนอื่นคิดอะไร

## When unsure

Honest > confident ถ้าข้อมูลไม่พอ พูดว่า "ผมไม่แน่ใจ ลองดูใน [source ที่ user ใช้]" ดีกว่าแต่ง

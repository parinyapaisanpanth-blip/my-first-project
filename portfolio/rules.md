# กติกา DCA Portfolio — my-first-project

---

## ⚠️ คำเตือน

ระบบนี้เป็น **PAPER TRADING / SIMULATION เท่านั้น**
ไม่ต่อ broker จริง ไม่สั่งซื้อขายหลักทรัพย์จริงแต่อย่างใด
ตัวเลขทุกอย่างในระบบนี้เป็นการจำลองเพื่อการศึกษา
**ไม่ใช่คำแนะนำการลงทุน · DYOR · not financial advice**

สอดคล้องกับ investing voice ใน CLAUDE.md และข้อความ disclaimer บน showcase/index.html

---

## งบ & จังหวะ

- **งบรายเดือน:** 10,000 บาท
- **จังหวะ:** ลงทุนทุกวันศุกร์ (weekly-friday)
- **งบต่อสัปดาห์ = 10,000 ÷ จำนวนวันศุกร์ในเดือนนั้น**
  - เดือนที่มี 4 ศุกร์ → ศุกร์ละ 2,500 บาท
  - เดือนที่มี 5 ศุกร์ → ศุกร์ละ 2,000 บาท
  - รวมทั้งเดือนเสมอ = 10,000 บาทพอดี
- **หลักการ DCA หลัก:** ไม่หยุดลงเพราะตลาดแดง — ลงทุกศุกร์สม่ำเสมอตามกติกา

---

## อัตราแลกเปลี่ยน

หุ้นทุกตัวในพอร์ตนี้เป็น USD งบตั้งต้นเป็น THB → ต้องแปลงก่อนซื้อ

- **คู่:** USDTHB
- **แหล่ง:** Finnhub forex endpoint (เฟส 3 ดึงอัตโนมัติทุกวันศุกร์ที่รัน)
- ราคาซื้อจริงในระบบจะถูกบันทึกพร้อม rate ที่ใช้ ไว้ใน portfolio/history.json
- `state.json` เก็บ lastRate / lastRateDate เพื่อ fallback ถ้า Finnhub ล้ม

---

## การแบ่งน้ำหนัก

1. **Primary method = conviction score จาก Earth agent**
   - Earth agent อ่าน brief ของแต่ละ ticker → ให้คะแนน 1–25
   - normalize เป็นสัดส่วน เช่น [AAPL:20, NVDA:18, ...] → แปลงเป็น % ของงบสัปดาห์
2. **Fallback = equal-weight**
   - ticker ไหนยังไม่มี brief หรือ Earth score → ใช้ equal-weight สำหรับตัวนั้น
   - ตัวที่มี score แล้วยังใช้ conviction ตามปกติ (ไม่ต้องรอครบทุกตัว)
3. การตั้งค่าอยู่ใน `portfolio/state.json` → `weighting.method` และ `weighting.fallback`

---

## Kill Condition

อ้างอิง investing voice ใน CLAUDE.md:
> "ผมต้อง name kill condition ให้ได้ก่อนกดซื้อทุกครั้ง ถ้านึกไม่ออกว่าเมื่อไหร่ควรเลิกถือ แสดงว่าผมไม่เข้าใจหุ้นพอ"

- Kill condition ของแต่ละ ticker อยู่ใน `briefs/<TICKER>.md` (section "What to Ask Before Owning It")
- **ถ้า kill condition ของหุ้นตัวใด trigger → หยุดซื้อเพิ่มตัวนั้น**
  - ระบบ simulation จะข้ามตัวนั้นใน DCA รอบถัดไป
  - **ไม่ขายอัตโนมัติ** — การตัดสินใจขายเป็นของผมเสมอ
- Kill condition ต้องระบุไว้ใน brief ก่อนที่ dca-pilot จะเริ่มซื้อ ถ้ายังไม่มี brief = ไม่เริ่มซื้อตัวนั้น

ตัวอย่าง kill condition จาก MSFT brief:
> "ถ้า Azure growth ต่ำกว่า 20% เป็น 2 ไตรมาสติดกัน และ Copilot seat growth stall"

---

## ขอบเขตเฟส 3 (dca-pilot)

เฟส 3 จะอ่านไฟล์ชุดนี้แล้วทำงานอัตโนมัติทุกวันศุกร์:

1. อ่าน `portfolio/state.json` → รู้งบ, watchlist, วิธีแบ่งน้ำหนัก
2. อ่าน `portfolio/rules.md` (ไฟล์นี้) → ตรวจ kill condition ของแต่ละตัว
3. ดึงราคาหุ้น + USDTHB rate จาก Finnhub (primary) / Twelve Data (fallback)
4. อ่าน Earth score จาก briefs/ (ถ้ามี) → คำนวณน้ำหนัก
5. จำลองซื้อแต่ละตัวตามสัดส่วน → บันทึกลง `state.json` (holdings, cashTHB)
6. append NAV รายวันลง `portfolio/history.json` (append-only)
7. commit กลับ repo ด้วย identity `github-actions[bot]`

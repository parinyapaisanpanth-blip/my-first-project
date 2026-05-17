> ⚠️ UNVERIFIED — ยังไม่มีเอกสารต้นทางใน sources/ รองรับ brief นี้ ตัวเลข/ข้ออ้างยังไม่ผ่านการ verify
> ต้องเพิ่ม 10-K + earnings call ที่ sources/NVDA/ แล้ว re-run /brief ก่อนใช้จริง

# NVIDIA (NVDA) — Research Brief
*Generated: 2026-05-15*

---

## 1. Company Snapshot

NVIDIA ออกแบบ GPU และ AI accelerator chips ที่กลายเป็นมาตรฐานของ workload training และ inference ใน data center ทั่วโลก บริษัทเป็น fabless — ออกแบบชิปเอง แต่ให้ TSMC เป็นคน manufacture ลูกค้าหลักคือ hyperscalers (Microsoft, Google, Amazon, Meta) รวมถึง enterprise และสถาบันวิจัย รายได้กว่า 80% มาจาก Data Center segment ส่วน Gaming และ Professional Visualization เป็นรอง NVIDIA ไม่ได้ขายแค่ hardware แต่ยังขาย software ecosystem รอบ CUDA ที่ lock-in engineers และ frameworks ไว้ด้วย

---

## 2. Fundamentals Signal

- **Revenue direction:** เติบโต explosive ในช่วง FY2024-FY2025 driven by AI boom — Data Center กลายเป็น dominant segment อย่างชัดเจน (ตัวเลข verify ใน 10-K ล่าสุด)
- **Gross margin:** สูงผิดปกติสำหรับ semiconductor company ช่วง peak Hopper (~H100) — แต่ Blackwell ramp กด margin ลงบ้างในช่วงแรก direction ยังน่าสนใจ แต่ต้องดูว่า normalize ที่ระดับไหน
- **Balance sheet:** net cash positive, FCF generation แข็งแกร่ง เพราะ fabless model ทำ capex ต่ำกว่า peer ที่ own fab
- **Capital allocation:** buyback program ขนาดใหญ่ต่อเนื่อง, R&D investment สูง — บ่งชี้ว่า management เชื่อใน reinvestment + return capital ไปพร้อมกัน
- **Customer concentration:** hyperscaler top-4-5 รายรวมกันน่าจะเป็นสัดส่วนใหญ่มากของ Data Center revenue — นี่คือ risk ที่ต้องติดตาม (ตัวเลขที่แน่ชัด ดูใน 10-K)

---

## 3. Latest Earnings

> ผมไม่แน่ใจว่า quarter ล่าสุดที่ออกแล้วจริงๆ ณ วันนี้คืออะไร — อิงจากที่ผมรู้คือช่วง FY2026 Q1 (สิ้นสุด เม.ย. 2025) ตัวเลขเฉพาะด้านล่างไม่ควร rely โดยไม่ cross-check กับ earnings release ของ NVIDIA โดยตรง

- **Blackwell ramp:** ชิป Blackwell (B200, GB200) เริ่ม ship ปลาย FY2025 และกำลัง scale ใน FY2026 — demand ยังเกิน supply อย่างมีนัยสำคัญ lead time ยาว
- **Data Center ยังเป็น growth engine หลัก:** hyperscalers ประกาศ AI capex plan สูงมาก ซึ่ง NVIDIA ได้ประโยชน์โดยตรง
- **Gross margin under transition pressure:** Blackwell มี gross margin ต่ำกว่า Hopper ช่วง ramp-up เพราะ yield และ supply chain cost — management บอกว่าจะดีขึ้น แต่ timeline ยังไม่ชัด
- **Export control ต่อ China ยังกด TAM:** US ออก restriction เพิ่มเรื่อย ๆ ทำให้ China revenue ลดลงจาก peak — NVIDIA พยายาม introduce ชิปที่ comply แต่ performance จำกัด
- **Gaming segment ฟื้นตัวจาก bottom:** ไม่ใช่ growth story หลัก แต่ไม่เป็นตัวกดอีกต่อไป

---

## 4. Bull Case / Bear Case

### Bull Case
- **Switching Costs จาก CUDA ecosystem:** engineers นับแสน, frameworks (PyTorch, TensorFlow), libraries (cuDNN, TensorRT) ทั้งหมด optimize สำหรับ CUDA — การย้ายไป AMD ROCm หรือ Intel Gaudi ต้องการ engineering effort มหาศาล ทำให้ลูกค้าติดอยู่แม้ราคาสูง
- **Cornered Resource ใน CoWoS packaging ที่ TSMC:** NVIDIA มี relationship และ allocation พิเศษสำหรับ advanced packaging ที่ทำให้คู่แข่งตามยาก แม้จะออกชิปที่ดีในกระดาษ
- **AI capex cycle ยังเป็น early innings:** hyperscalers ประกาศ capex $200B+ ต่อปี NVIDIA capture ส่วนใหญ่ของ compute spend — ถ้า AI workload ยังโตต่อ demand ฝั่ง training และ inference ก็โตตาม

### Bear Case
- **Custom silicon ของลูกค้าคือ threat ระยะยาว:** Google (TPU), Amazon (Trainium), Microsoft (Maia), Meta (MTIA) ต่างลงทุนสร้าง chip ของตัวเอง ถ้า performance-per-dollar ของ custom silicon ดีพอ hyperscalers จะ reduce NVIDIA exposure — นี่ไม่ใช่ risk ปีนี้ แต่เป็น risk ใน 5-10 ปี
- **Gross margin normalization เมื่อ supply เพิ่มขึ้น:** ตอนนี้ pricing power สูงเพราะ demand เกิน supply ถ้า supply chain catch up หรือ competition จาก AMD / custom silicon เพิ่ม margin จะ compress
- **China TAM ถูกตัดออกอย่างถาวร:** ถ้า US export control เข้มขึ้นต่อเนื่อง และ Huawei Ascend หรือ domestic China alternative ดีขึ้น NVIDIA เสียตลาดที่เคยเป็น revenue สำคัญ

---

## 5. Kill Conditions

- **Hyperscaler top-3 ลด NVIDIA GPU spend ติดกัน 2 quarter** โดยอ้างว่า custom silicon ทำได้เพียงพอ — นี่คือ signal ที่ชัดที่สุดว่า switching cost กำลังพัง
- **Gross margin ลงต่ำกว่า 60% เป็น trend ไม่ใช่ blip** — ถ้าเกิดขึ้น แสดงว่า commodity pricing กำลัง set in และ pricing power ที่เป็น core ของ thesis หายไปแล้ว
- **Framework หลัก (PyTorch / JAX) ออก native support สำหรับ non-NVIDIA hardware ที่ performance gap ปิดจริง** — ถ้า CUDA switching cost ลดลงจาก software side, thesis เปลี่ยนทันที

---

## 6. What to Ask Before Owning It

1. **ฉันเข้าใจ CUDA switching cost ลึกพอไหม?** ลองถามตัวเองว่าทำไมบริษัทใหญ่ถึงไม่ย้าย platform แม้ NVIDIA แพง — ถ้าตอบได้ชัด แสดงว่า thesis มั่นคง ถ้าตอบไม่ได้ แสดงว่ายังต้องศึกษาเพิ่ม
2. **Custom silicon ของ hyperscaler อยู่ที่ไหนใน roadmap?** Google TPU v5, Amazon Trainium2, Microsoft Maia — performance เทียบ H100/B200 อยู่ที่ระดับไหน use case อะไรที่ custom silicon เริ่มชนะ?
3. **Gross margin จะ settle ที่ระดับไหนหลังจาก Blackwell ramp เสร็จ?** Management ให้ guidance ไว้ไหม และ assumption นั้น realistic แค่ไหนเมื่อเทียบกับ history?
4. **Kill condition ของฉันคืออะไร?** ต้องตอบให้ได้ก่อนกดซื้อ — ถ้านึกไม่ออก แสดงว่าเข้าใจ thesis ไม่พอ
5. **Valuation ที่ซื้อ imply growth rate เท่าไหร่ใน 5 ปี?** NVIDIA base ใหญ่มากแล้ว growth rate ที่ market expect ต้องการ execution ระดับไหน และ realistic ไหมเมื่อเทียบกับ TAM ที่เหลือ?

---

*Brief นี้เป็น research summary เท่านั้น ไม่ใช่คำแนะนำซื้อขาย ตัวเลข earnings ควร verify กับ NVIDIA investor relations โดยตรง*

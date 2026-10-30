# 🥋 Al Murtaza Shah Taekwondo — Full-Stack Pure MERN Application

**Academy Location:** Abdur Rehman Plaza, Markaz Road, Chogi No.7, Kohat  
**Official Contact:** 0335-9117230  
**Affiliations:** Khyber Pakhtunkhwa Taekwondo Association & Pakistan Taekwondo Federation (PTF)  
**President KPK Taekwondo:** Grandmaster Murtaza Hassan Bangash (6th Dan WTF, 7th Dan PTF)

---

## 🌟 Full-Stack Pure MERN Architecture

- **Database (M):** MongoDB (`mongodb://127.0.0.1:27017/almurtaza_taekwondo`) via Mongoose ODM
- **Backend (E & N):** Express.js REST API on Node.js in pure JavaScript (`/backend`)
  - Server listening on `http://127.0.0.1:5000`
  - CORS, Morgan logger, JSON parser, and Mongoose connection
  - Mongoose Models: `Student.js`, `Attendance.js`, `FeeReceipt.js`, `FeeLedger.js`, `Achievement.js`, `Certificate.js`
  - REST API Routes:
    - `GET / POST / PUT / DELETE /api/students` (Full Admission & 360° Profile Tracking)
    - `GET / POST /api/attendance` & `GET /api/attendance/monthly-report` (Daily Check-in + Monthly Matrix)
    - `GET / POST /api/fees` & `GET /api/fees/defaulters` (Fee Collection, Auto-Balance, Receipt #100+, WhatsApp Reminders)
    - `GET / POST /api/certificates` (Federation Certificate Generator & Archive)
    - `GET /api/dashboard/kpis` & `GET /api/dashboard/audit` (Executive KPIs & Monthly Closing Audit)
  - `seed.js`: Database seeder with authentic Kohat academy data
- **Frontend (R):** Pure React.js with `.jsx` components (Vite + Tailwind CSS + Lucide Icons + Recharts)
  - Zero TypeScript dependencies, zero `.ts`/`.tsx` files, zero `tsconfig.json`
  - `src/api/api.js`: Axios instance pointing to backend with resilient local fallback so the app never crashes
  - Running on `http://localhost:3000`

---

## 🚀 Quick Run Commands

### 1. Run Database Seeder
```bash
npm run seed
# Populates MongoDB almurtaza_taekwondo with Kohat students, attendance, fees & certificates
```

### 2. Start Backend API Server
```bash
npm run backend
# Running on http://127.0.0.1:5000
```

### 3. Start Frontend Client
```bash
npm run client
# Running on http://localhost:3000
```

---

## 📋 Complete Preserved Modules

1. **Executive Admin Dashboard & End-of-Month Audit Center:**
   - Active vs Inactive students, Today's Live Attendance, Expected vs Collected Fee, Defaulters count.
   - Monthly Revenue Bar Chart, Belt Distribution Donut Chart, Daily Trend Line.
   - Dedicated End-of-Month Audit Widget with Month/Year picker, Student attendance ratios (`24/28 Days`), paid vs. baqaya dues, and CSV export.
2. **Digital Admission Form (Urdu/English Physical Form Replica):**
   - Personal information, Qaumiyat, Taleemi Qabliyat, CNIC/Form-B, webcam live snapshot.
   - Medical/Sports checkboxes, fee setup, guardian consent declaration & signature.
   - Auto-initialization of Roll No (`AMS-2026-XXX`), current month ledger, and printable blank form.
3. **360° Student Master Profile Dossier:**
   - Tab 1: Profile & Biometrics (ID card preview, Face AI & Fingerprint template status).
   - Tab 2: Attendance History & Interactive Monthly Calendar (Color-coded P/A/L/LT + monthly audit table).
   - Tab 3: Financial Ledger (Lifetime dues, paid amounts, carried Baqaya, receipt numbers).
   - Tab 4: Belt Grading & Achievements (Belt timeline, medals, grandmaster remarks).
   - Tab 5: Issued Certificates (1-click re-print).
4. **Tri-Mode Smart Daily Attendance System:**
   - Mode 1: Live AI Face Scanner with webcam feed, neural HUD, Web Audio confirmation chime, and live Fee Due Warning Alert.
   - Mode 2: Biometric Fingerprint terminal with simulated touch sensor.
   - Mode 3: Batch manual register & Monthly 1-31 days attendance matrix with CSV export.
5. **Fee Management & Dual-Slip Receipt Desk:**
   - Automated monthly billing engine with arrears rollover.
   - Defaulter list with 1-click bilingual WhatsApp reminder to guardians.
   - Auto-balance calculator (Total Due - Amount Received = Remaining Baqaya).
   - Printable Two-Part Physical Receipt (perforated center line with Office Copy & Student Copy).
6. **Automated Federation Certificate Generator:**
   - Exact replica of the Pakistan Taekwondo Federation & KPK Taekwondo Association landscape certificate.
   - Watermark, kick border strip, PTF & KPK emblems, gold official seal, official citation, and Grandmaster Murtaza Hassan Bangash signature block.
   - 1-click A4 landscape printing.

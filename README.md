<div align="center">

# 🛵 TriggerPe

### Parametric Income Insurance for Gig Workers

*When weather strikes, you get paid — automatically.*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![scikit-learn](https://img.shields.io/badge/ML-scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn)](https://scikit-learn.org)
[![SQLite](https://img.shields.io/badge/DB-SQLite-003B57?style=for-the-badge&logo=sqlite)](https://sqlite.org)

</div>

---

## 📌 Problem Statement

Over **50 million gig delivery workers** in India face income loss every time extreme weather — heavy rain, floods, heat waves — forces them off the road. Traditional insurance is paper-heavy, claim-intensive, and inaccessible to this population.

**They lose ₹300–800 per disruption day with zero protection.**

---

## 💡 Solution

TriggerPe provides **zero-touch parametric insurance** for delivery workers:

- A worker registers once and selects a weekly plan
- When a parametric trigger fires (rainfall > threshold, AQI > limit, etc.), a payout is **automatically sent** — no form, no claim, no wait
- An AI-powered **fraud detection layer** ensures every payout is legitimate

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Worker Onboarding | Registration with auto risk assessment |
| 📋 Policy Management | Weekly plans (Basic / Standard / Premium) |
| ⚡ Parametric Triggers | Real-time weather + AQI + civil event triggers |
| 🤖 Auto Claims | Zero-touch claim filing on trigger |
| 🛡️ Fraud Detection | 3-layer ML fraud scoring (Phase 3) |
| 📊 Admin Dashboard | Live worker, policy, and claims management |
| 🔍 Fraud Audit API | Per-claim audit trail with full breakdown |

---

## 🧠 Phase 3 — Advanced Fraud Detection

Phase 3 adds a 3-layer ML fraud detection pipeline on top of the existing 7 rule-based checks.

### Layer 1 · GPS Spoof Detection
- Haversine great-circle distance between submitted GPS and registered city centroid
- Deviation **> 5 km** → `+0.40` fraud score boost + `GPS_SPOOF_DETECTED` flag
- IP city vs GPS city contradiction → `+0.30` boost (VPN/proxy detection)
- 12 Indian cities covered with precise bounding boxes and centroids

### Layer 2 · Historical Weather Validation
- Cross-checks trigger claims against the **Open-Meteo free archive API** (no key required)
- Verifies that the parametric threshold (e.g. 50 mm rain, 42°C heat, 45 km/h wind) was actually met on the claim date
- Threshold **not met** → `+0.35` fraud score boost + `HISTORICAL_WEATHER_MISMATCH` flag
- Social/civil triggers (AQI, CURFEW, STRIKE, PROTEST) safely skipped — no false signals

### Layer 3 · Behavioral Anomaly Model (IsolationForest)
- Trained on a **5,000-row synthetic dataset** (85% legit / 15% fraud)
- 8 behavioral features: claim frequency, payout amounts, trigger diversity, GPS mismatch history, etc.
- Anomaly score **> 0.6** → `+behavioral_score × 0.30` boost + `BEHAVIORAL_ANOMALY` flag
- Lazy-loaded and cached — never retrained per request

### Fraud Scoring Pipeline
```
score = Rules_1-7 + GPS_boost + Weather_boost + Behavioral_boost + RF_v1_boost
score = min(score, 1.0)

>= 0.65  →  REJECTED
>= 0.35  →  MANUAL REVIEW
<  0.35  →  APPROVED
```

### Fraud Audit Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/fraud/report/{claim_id}` | Full per-claim audit: GPS + weather + behavioral |
| `POST` | `/fraud/check-gps` | Standalone GPS spoof check with optional IP city |
| `GET` | `/fraud/validate-weather` | Standalone historical weather validation |

---

## 🧪 Testing & Validation

| Phase | Tests | Result |
|---|---|---|
| GPS Spoof Detection | 5 scenarios | ✅ 5/5 Pass |
| Historical Weather | 5 scenarios | ✅ 5/5 Pass |
| Behavioral IsolationForest | 4 scenarios | ✅ 4/4 Pass |
| detect_fraud() Integration | 5 scenarios | ✅ 5/5 Pass |
| Live API (full claim flow) | 8 scenarios | ✅ 8/8 Pass |
| Fraud Report (double-count fix) | 9 scenarios | ✅ 9/9 Pass |
| Edge Cases | 9 scenarios | ✅ 9/9 Pass |
| ML v1 Active post-retrain | 3 scenarios | ✅ 3/3 Pass |
| **Total** | **48 tests** | ✅ **48/48 Pass** |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI (Python 3.10) |
| Frontend | Next.js 14 (App Router, SWC) |
| Database | SQLite (in-process, no server) |
| ML — v1 | scikit-learn RandomForestClassifier |
| ML — v2 | scikit-learn IsolationForest |
| Weather API | Open-Meteo (free, no API key) |
| Styling | Tailwind CSS + Glassmorphism |
| Package Manager | pip / npm |

---

## 🚀 How to Run

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
# From project root
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### Frontend

```bash
cd frontend/gigshield-v4
npm install
npm run dev
```

App available at: http://localhost:3000

---

## 📊 Sample Flow

```
Worker Registers
      ↓
Risk Assessment (city, platform, earnings)
      ↓
Policy Created (Basic / Standard / Premium)
      ↓
Weather Trigger Detected (Open-Meteo / AQI / Civil)
      ↓
Fraud Check (GPS + Weather + Behavioral + ML)
      ↓
Score < 0.35  →  Auto Payout ✅
Score 0.35-0.65  →  Manual Review 🔍
Score > 0.65  →  Rejected ❌
```

---

## 📁 Project Structure

```
triggerpe/
├── backend/
│   ├── app/
│   │   ├── ai_models/
│   │   │   ├── fraud_model.pkl         # v1 RandomForest
│   │   │   ├── fraud_model_v2.pkl      # v2 IsolationForest
│   │   │   ├── fraud_training_data.csv # 5000-row behavioral dataset
│   │   │   ├── fraud_model_report.md   # Model documentation
│   │   │   └── risk_model.pkl          # Worker risk scoring
│   │   ├── routes/
│   │   │   ├── workers.py
│   │   │   ├── policies.py
│   │   │   ├── claims.py
│   │   │   ├── triggers.py
│   │   │   └── fraud.py                # Phase 3 fraud audit endpoints
│   │   ├── services/
│   │   │   ├── fraud_detector.py       # Core fraud pipeline
│   │   │   └── payout_service.py
│   │   └── utils/
│   │       └── database.py
│   ├── retrain_fraud_model.py
│   └── requirements.txt
└── frontend/
    └── gigshield-v4/
        └── src/
            ├── app/
            │   ├── register/            # Worker onboarding (city dropdown)
            │   ├── dashboard/           # Worker dashboard
            │   └── admin/               # Admin control panel
            └── lib/
                └── api.ts               # Frontend API client
```

---

## 🐛 Bugs Fixed in This Session

| # | Severity | Bug | Fix |
|---|---|---|---|
| 1 | Critical | `fraud_model.pkl` `numpy._core` error (numpy 2.x pkl, 1.24.3 env) | Retrained with current env — 99.5% accuracy |
| 2 | Logic | Audit endpoint double-counted GPS/weather/behavioral boosts | `final_score = stored_score` (authoritative) |
| 3 | Critical | Admin panel `workers.map is not a function` crash | Unwrap `data.workers` from backend envelope |
| 4 | UX | Registration Step 2 blocked when geolocation denied | Added city dropdown fallback |
| 5 | Runtime | `ModuleNotFoundError` when launching uvicorn from root | `sys.path` injection in `main.py` |

---

## 👥 Team

Built for **Guidewire DEVTrails 2026**

---

<div align="center">

*TriggerPe — When it triggers, you get paid.*

</div>

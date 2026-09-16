<div align="center">

<img src="frontend/public/hero_bg.jpg" alt="CutOff Checker Banner" width="100%" style="border-radius: 12px;" />

# 📊 CutOff Checker

**India's One-Stop Cutoff Probability Platform**

Know your admission chances *before* results day — powered by 5 years of official historical cutoff data across 15 major Indian competitive exams.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

[**Live Demo**](#) · [**Report a Bug**](#) · [**Request a Feature**](#)

</div>

---

## ✨ Overview

**CutOff Checker** is a full-stack web application that helps Indian students make data-driven decisions about their college and course choices. By entering their rank, score, or percentile, students receive a historically-backed probability of admission — built on 5 years of official cutoff data (2019–2023).

> 💡 This is not an official tool. All probabilities are historical estimates based on past cutoff trends and are intended for guidance only.

---

## 🖼️ Screenshots

| Landing Page | Cutoff Tool |
|---|---|
| *Cinematic hero with domain showcase* | *Interactive probability checker* |

---

## 🚀 Features

### 🎯 Core Tools
- **Cutoff Checker** — Enter your score and instantly see year-by-year historical qualification data with a probability gauge
- **College Recommender** — Get a tiered list of Safe, Target, and Reach institutions based on your score
- **Cutoff Explorer** — Browse and search the full historical cutoff database for any exam

### 📊 Data Coverage
- **15 exams** across **9 domains**
- **500+ cutoff records** sourced from official conducting bodies
- **5 years** of data: 2019, 2020, 2021, 2022, 2023

### 🎨 Design
- Apple-inspired dark UI with glassmorphism and `backdrop-filter`
- Cinematic full-bleed photography for each domain
- Animated probability gauge with real-time feedback
- Fully responsive — mobile, tablet, desktop
- Smooth micro-animations and hover effects

---

## 🗂️ Supported Exams

| Domain | Exams |
|---|---|
| ⚙️ **Engineering** | JEE Advanced, JEE Main, GATE, AKTU/UPTAC |
| 🩺 **Medical** | NEET UG, NEET PG |
| 📊 **Management** | CAT, XAT |
| 🏛️ **Civil Services** | UPSC CSE |
| 🛡️ **Govt Recruitment** | SSC CGL, RRB NTPC |
| 🏦 **Banking** | IBPS PO |
| ⚖️ **Law** | CLAT |
| 🎖️ **Defence** | NDA |
| 🎓 **Multi-Domain** | CUET UG |

---

## 🏗️ Architecture

```
Cut Off Checker/
├── backend/                    # Node.js / Express API
│   ├── data/                   # JSON cutoff datasets (16 files)
│   │   ├── exams_catalog.json  # Exam metadata & configuration
│   │   ├── jee_advanced.json
│   │   ├── jee_main.json
│   │   ├── neet_ug.json
│   │   └── ...                 # 12 more exam files
│   ├── engine.js               # Probability computation engine
│   ├── server.js               # Express server & API routes
│   └── package.json
│
├── frontend/                   # React + Vite SPA
│   ├── public/                 # Static assets (domain images)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx # Page 1 — Marketing / showcase
│   │   │   └── ToolPage.jsx    # Page 2 — Interactive tool
│   │   ├── components/
│   │   │   ├── CutoffChecker.jsx      # Probability checker UI
│   │   │   ├── CollegeRecommender.jsx # Recommendation engine UI
│   │   │   ├── CutoffExplorer.jsx     # Browse cutoff database
│   │   │   └── MethodologyModal.jsx   # How-it-works explainer
│   │   ├── api/                # Axios API client
│   │   ├── App.jsx             # Route configuration
│   │   ├── main.jsx            # React entry point
│   │   └── index.css           # Apple-inspired design system
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ How the Probability Engine Works

The engine in [`backend/engine.js`](backend/engine.js) uses a **weighted historical recency model**:

1. **Data lookup** — Fetches 5 years of cutoff records for the selected exam, institute, branch, and category
2. **Weighted scoring** — More recent years carry higher weight (most recent year: ~35%, oldest: ~10%)
3. **Qualification check** — Compares user's score against each year's cutoff
4. **Probability calculation** — Weighted average of years where the user would have qualified
5. **Trend analysis** — Determines if cutoffs are *tightening*, *easing*, or *stable* over time

```
Probability = Σ (qualified_year × year_weight) / Σ year_weights
```

| Year | Weight |
|------|--------|
| 2023 | 35% |
| 2022 | 25% |
| 2021 | 20% |
| 2020 | 12% |
| 2019 | 8%  |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 |
| **Build Tool** | Vite 8 |
| **Routing** | React Router DOM v7 |
| **Charts** | Chart.js + react-chartjs-2 |
| **HTTP Client** | Axios |
| **Icons** | Lucide React |
| **Backend** | Node.js + Express |
| **Data Format** | JSON |
| **Styling** | Vanilla CSS (custom Apple design system) |
| **Fonts** | Inter (Google Fonts) |

---

## 📦 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

### 1. Clone the repository

```bash
git clone https://github.com/your-username/cut-off-checker.git
cd cut-off-checker
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Start the backend server

```bash
# From the backend/ directory
node server.js
```

The API will be available at **http://localhost:5000**

```
✅ CutOff Checker API running on http://localhost:5000
   Loaded 15 exams across 15 datasets
```

### 5. Start the frontend dev server

```bash
# From the frontend/ directory
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 🔌 API Reference

The backend exposes the following REST endpoints:

### `GET /api/exams`
Returns the full exam catalog with metadata and grouping by domain.

```json
{
  "exams": [...],
  "grouped": {
    "Engineering": [...],
    "Medical": [...]
  }
}
```

### `GET /api/cutoffs/:examId`
Returns all historical cutoff records for a given exam.

### `POST /api/check`
Checks admission probability for a specific score.

**Body:**
```json
{
  "examId": "jee_advanced",
  "score": 1250,
  "institute": "IIT Bombay",
  "branch": "Computer Science",
  "category": "General"
}
```

**Response:**
```json
{
  "probability": 72,
  "verdict": "Target",
  "trend": "tightening",
  "yearlyBreakdown": [...]
}
```

### `POST /api/recommend`
Returns a ranked list of college recommendations for a given score.

---

## 📁 Data Format

Each exam's JSON file follows this structure:

```json
{
  "examId": "jee_advanced",
  "records": [
    {
      "year": 2023,
      "institute": "IIT Bombay",
      "branch": "Computer Science - B.Tech",
      "category": "General",
      "openingRank": 1,
      "closingRank": 67
    }
  ]
}
```

---

## 🤝 Contributing

Contributions are what make this project better. Any help is welcome!

### Ways to contribute

- 🐛 **Bug fixes** — Open an issue and submit a PR
- 📊 **New exam data** — Add JSON files for exams not yet covered
- 🎨 **UI improvements** — Enhance the design or add new features
- 📖 **Documentation** — Improve docs or add examples

### Steps

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/add-new-exam

# 3. Commit your changes
git commit -m "feat: add GATE CS 2024 cutoff data"

# 4. Push to the branch
git push origin feature/add-new-exam

# 5. Open a Pull Request
```

---

## ⚠️ Disclaimer

- All cutoff data is sourced from publicly available official records and news
- Probabilities are **historical estimates only** and do not guarantee future admission
- This tool is **not affiliated** with any exam conducting body (NTA, UPSC, SSC, IBPS, NLU, etc.)
- Always verify cutoff information with official sources before making decisions

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ for India's students

**⭐ Star this repo if it helped you!**

</div>

# BizPilot AI - Production-Ready AI Business Agent

BizPilot AI is a premium, production-ready SaaS dashboard that acts as an intelligent AI Business Agent for startups, entrepreneurs, and SMEs. Powered by Google's Gemini AI and built with React, Node/Express, and Firebase, the application offers real-time strategy recommendations, automated business planning, market study models, financial forecasting, and sales predictions.

## 🚀 Key Features

1. **Business Chat Assistant**: Elite conversational advisor that integrates your corporate profile details to yield context-aware recommendations. Backed by Web Speech API for Text-to-Speech (TTS) reading and Speech-to-Text (STT) mic dictates.
2. **AI SWOT Generator**: Input a business concept to instantly receive a styled 2x2 grid identifying Strengths, Weaknesses, Opportunities, and Threats, coupled with a core strategic overview.
3. **Competitor Mapping**: Renders comparative shares, pros, cons, and competitive strategies in an interactive grid.
4. **Market Research Agent**: Estimates TAM sizes, outlines growth velocities, lists target customer personas, and catalogs industry trends.
5. **Business Plan Compiler**: Compiles an 8-stage executive document (Executive Summary, Market Size, Revenue Model, Roadmap) with client-side print-to-PDF and MS Word document downloads.
6. **Financial Projections**: Interactive Multi-Year forecasting charts tracking Revenue, Cost scaling (with inflation), and net profits.
7. **Sales Trend Prediction**: CSV upload system that fits linear regression formulas over raw sales data, graphs trendlines, and outputs Gemini business intelligence reports.
8. **Customer Sentiment Scanner**: Sentiment rating percentage grids and action plans.
9. **Settings Dashboard**: Fully customize your Business Profile, setup API keys, toggle between English, Spanish, and French, and switch between Light and Dark SaaS themes.

---

## 🛠️ Architecture and Stack

```
                     ┌───────────────────────────────┐
                     │       Vite React App          │
                     │  (Vanilla CSS, Glassmorphism) │
                     └───────┬──────────────┬────────┘
                             │              │
                    (HTTP)   ▼              ▼ (Mock/Client SDK)
          ┌────────────────────────┐    ┌────────────────────────┐
          │  Express Node Backend  │    │  Firebase / Storage   │
          │    (Multer, CSV)       │    │  (Auth, Database)      │
          └──────────┬─────────────┘    └────────────────────────┘
                     │
            (API)    ▼
          ┌────────────────────────┐
          │     Gemini AI API      │
          │   (gemini-1.5-flash)   │
          └────────────────────────┘
```

* **Frontend**: React (Vite), Recharts (Interactive SVG Charts), Lucide-React (Sleek Icons).
* **Styling**: Vanilla CSS Variables, Backdrop filters, responsive Flexbox & CSS Grid.
* **Backend**: Express, Multer (File uploads), dotenv.
* **AI Engine**: Google AI Studio Gemini API (`gemini-1.5-flash`).
* **Database & Auth**: Firebase Auth & Firestore (with mock LocalStorage automatic fallbacks).

---

## 📁 Folder Structure

```
/ (Root Workspace)
├── package.json               # Root scripts (Concurrently start FE/BE)
├── vite.config.js             # Vite configurations
├── index.html                 # Frontend page wrapper
├── src/                       # Frontend source files
│   ├── main.jsx               # Entry point
│   ├── index.css              # Glassmorphism Design System Stylesheet
│   ├── App.jsx                # Router, Authentication Gate & Shell
│   ├── components/            # Reusable UI parts (Sidebar, Navbar, Card)
│   └── pages/                 # UI Sections (Dashboard, Chat, Tools, Analytics, Reports)
├── server/                    # Node Express backend files
│   ├── index.js               # Main Express app & Gemini routing endpoints
│   └── package.json           # Backend package configs
└── .env.example               # Environment variables template
```

---

## ⚙️ Installation and Setup

### Prerequisites
* Node.js v18.20.4 or higher
* Google Gemini API Key

### Local Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   cd Hackathon
   ```
2. Setup environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Ensure to populate `GEMINI_API_KEY` in your `.env` or in the Settings page inside the running browser)*
3. Install dependencies for both frontend and backend concurrently:
   ```bash
   npm run install:all
   ```
4. Start both frontend and backend dev servers together:
   ```bash
   npm run dev
   ```
   * The Frontend will boot at: `http://localhost:5173`
   * The Backend API will start at: `http://localhost:5000`

---

## 📡 API Reference (Backend)

### 1. Business Chat
* **Route**: `POST /api/chat`
* **Body**:
  ```json
  {
    "message": "What marketing strategy should I use?",
    "history": [],
    "profile": { "name": "Apex", "industry": "SaaS" }
  }
  ```

### 2. SWOT Generator
* **Route**: `POST /api/swot`
* **Body**: `{ "idea": "Pet supplies delivery app", "profile": {} }`

### 3. Competitor Map
* **Route**: `POST /api/competitor`
* **Body**: `{ "companyName": "Apex Labs", "industry": "AI Tools" }`

### 4. Sales Prediction (CSV Upload)
* **Route**: `POST /api/predict-sales`
* **Type**: `multipart/form-data`
* **Fields**: `csvFile` (File input. Must have columns: `Date,Sales`)

---

## ☁️ Production Deployment

### 1. Backend to Google Cloud Run
You can package the Express server in a container and deploy it to Cloud Run:
```bash
# Create server Dockerfile
gcloud builds submit --tag gcr.io/[PROJECT_ID]/bizpilot-backend ./server

# Deploy container to Cloud Run
gcloud run deploy bizpilot-backend \
  --image gcr.io/[PROJECT_ID]/bizpilot-backend \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your-gemini-key"
```

### 2. Frontend to Firebase Hosting
```bash
# Build frontend
npm run build

# Deploy via Firebase CLI
firebase init hosting
firebase deploy
```

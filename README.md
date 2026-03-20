# 🤖 AI Resume Shortlisting System

![Python](https://img.shields.io/badge/Python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.135-green)
![Groq](https://img.shields.io/badge/Groq-LLaMA3.3_70B-orange)
![React](https://img.shields.io/badge/React-18-cyan)
![Deployed](https://img.shields.io/badge/Status-Live-brightgreen)

> An AI powered system that evaluates resumes against job descriptions, verifies candidate claims using real GitHub data, and provides explainable scores — telling recruiters not just the score but the **why** behind it.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [System Design](#-system-design)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Scoring Logic](#-scoring-logic)
- [Sample Output](#-sample-output)
- [Scalability](#-scalability)
- [Future Improvements](#-future-improvements)
- [Local Setup](#-local-setup)

---

## 🎯 Overview

Traditional resume screening is slow, inconsistent, and prone to bias. This system uses AI to:

- **Evaluate** candidates on 4 dimensions against any job description
- **Verify** candidate claims against real GitHub profile data
- **Explain** every score with detailed reasoning
- **Classify** candidates into tiers for quick recruiter decisions

The system understands semantic equivalents — a candidate with **AWS Kinesis** experience scores highly for a **Kafka** role because the AI understands both are distributed event streaming platforms — not just keyword matching.

---

## 🌐 Live Demo

🔗 https://ai-shortlisting.vercel.app

> Note: Backend runs on Render free tier. First request may take 30-50 seconds to wake up. Subsequent requests will be instant.

### How to Test

**Evaluate Resume:**
```
1. open https://ai-shortlisting.vercel.app
2. click Evaluate Resume tab
3. upload any resume PDF
4. paste a job description
5. click Evaluate Resume
6. see scores tier and explanations
```

**Verify Claims:**
```
1. click Verify Claims tab
2. enter candidate GitHub URL
3. enter candidate LinkedIn URL
4. manually enter candidate claims
   example: "I have 3 years Python experience.
             I use Git for all my projects.
             I have built REST APIs."
5. click Verify Claims
6. see authenticity report with
   per claim plausibility rating
```

---

## 📐 System Design

### High Level Architecture
```
User (Browser)
      ↓
React Frontend (Vercel)
      ↓ HTTP requests
FastAPI Backend (Render)
      ↓
┌──────────────────────────────────────┐
│              modules/                │
│                                      │
│  parser.py                           │
│  PDF bytes → plain text              │
│                                      │
│  scoring.py                          │
│  resume + JD → Groq AI → 4 scores   │
│                                      │
│  verification.py                     │
│  GitHub API + claims → Groq → report │
└──────────────────────────────────────┘
      ↓
Groq AI (LLaMA 3.3 70B)
GitHub REST API
```

### Data Flow

**Option A — Resume Evaluation:**
```
Step 1 → user uploads PDF + pastes JD
Step 2 → PyMuPDF extracts text from PDF
Step 3 → resume text + JD sent to Groq AI
Step 4 → Groq scores on 4 dimensions
Step 5 → JSON scores returned to frontend
Step 6 → React displays scores visually
```

**Option B — Claim Verification:**
```
Step 1 → recruiter enters GitHub URL + claims
Step 2 → GitHub REST API fetches real data:
         public repos, languages, stars,
         followers, account age
Step 3 → real GitHub data + claims sent to Groq
Step 4 → Groq compares data vs each claim
Step 5 → plausibility per claim returned
Step 6 → React displays authenticity report
```

### Design Decisions

**Key design decisions:**
- **Groq LLaMA 3.3 70B** — free tier with 14400 calls/day, fast inference, reliable JSON output
- **FastAPI** — async support handles concurrent requests, built in validation and auto documentation
- **PyMuPDF** — accurate text extraction from any PDF format
- **In-memory state** — sufficient for this scope, database is a future improvement

---

## ✨ Features

### Option A — Evaluation and Scoring Engine
- Upload any resume PDF against any job description
- AI scores on 4 dimensions with full explanation per score
- Tier classification A / B / C for instant recruiter decisions
- Semantic understanding catches equivalent skills
- Every score has a detailed why — not just a number
- Strengths and gaps listed clearly
- Actionable recommendation for recruiter

### Option B — Claim Verification Engine
- Recruiter manually enters candidate GitHub URL and claims
- System fetches real GitHub profile data via GitHub REST API:
  public repos, top languages, total stars, account age, followers
- Each claim verified individually with plausibility rating
- High / Medium / Low rating per claim with reasoning
- Verification tip for recruiter on how to confirm further
- Red flags and green flags identified automatically
- Overall authenticity score with verdict paragraph

---

## 🛠 Tech Stack

| Technology | Purpose | Why Chosen |
|---|---|---|
| Python 3.12 | Primary language | Best for AI and backend projects |
| FastAPI | Web framework | Fast async automatic documentation |
| Uvicorn | ASGI server | Industry standard for FastAPI |
| Groq LLaMA 3.3 70B | AI model | Free fast reliable JSON output |
| PyMuPDF | PDF parsing | Fastest Python PDF library |
| Pydantic | Data validation | Built into FastAPI zero config |
| requests | GitHub API calls | Simple reliable HTTP library |
| python-dotenv | Config management | Secure API key loading from .env |
| React 18 | Frontend UI | Component based fast rendering |
| Vite | Build tool | Fastest React development server |
| Axios | HTTP client | Cleaner API calls than fetch |
| Render | Backend hosting | Free Python server hosting |
| Vercel | Frontend hosting | Best free React hosting |

---

## 📁 Project Structure
```
AI_Shortlisting/
│
├── main.py                 # FastAPI app entry point and routes
├── requirements.txt        # All Python dependencies
├── render.yaml             # Render deployment configuration
├── README.md               # Project documentation
│
├── core/
│   ├── config.py           # Loads and validates API keys from .env
│   └── logger.py           # Timestamped terminal logging
│
├── modules/
│   ├── parser.py           # PDF bytes to plain text extraction
│   ├── scoring.py          # 4 dimensional AI scoring engine
│   └── verification.py     # GitHub data fetch and claim verification
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── EvaluateTab.jsx   # Resume evaluation UI
    │   │   ├── VerifyTab.jsx     # Claim verification UI
    │   │   ├── ScoreBar.jsx      # Reusable score progress bar
    │   │   └── TierBadge.jsx     # Tier A B C colored badge
    │   ├── App.jsx               # Root component and tab navigation
    │   └── index.css             # Global dark theme styles
    ├── vite.config.js            # Vite and proxy configuration
    └── package.json              # Node dependencies
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /health | Check if server is running |
| POST | /evaluate | Score resume against job description |
| POST | /verify | Verify candidate claims against GitHub |

---

## 📊 Scoring Logic

### 4 Dimensional Scoring

| Dimension | What it Measures | Example |
|---|---|---|
| Exact Match | Literal keyword overlap | JD says Python — resume says Python |
| Semantic Similarity | Conceptual equivalence | JD says Kafka — resume says AWS Kinesis |
| Achievements | Quantified impact | Reduced latency by 40% |
| Ownership | Leadership signals | Led migration, architected system |

### Semantic Equivalents the AI Recognizes
```
AWS Kinesis  = Kafka = RabbitMQ     distributed event streaming
FastAPI      = Flask = Django        Python web framework
PostgreSQL   = MySQL                 relational database
MongoDB      = DynamoDB              NoSQL document database
AWS          = GCP = Azure           cloud platform
Docker                               containerization
Kubernetes                           container orchestration
```

A candidate with **AWS Kinesis** experience scores highly for a **Kafka** role because the AI understands both platforms serve the same purpose — distributed event streaming at scale.

### Tier Classification

| Tier | Overall Score | Recruiter Action |
|---|---|---|
| A | 75 and above | Fast track to interview |
| B | 50 to 74 | Technical screen needed |
| C | Below 50 | Needs further evaluation |

### Explainability

Every score includes:
- **What** skills matched or were missing
- **Why** the score is what it is
- **How** the recruiter can verify further
- **Recommendation** for the next step

---

## 📋 Sample Output

### Full Evaluate Response
```json
{
  "scores": {
    "exactMatch": 72,
    "semanticSimilarity": 80,
    "achievements": 75,
    "ownership": 70,
    "overall": 74
  },
  "tier": "B",
  "summary": "Strong backend engineer with solid Python and Kafka experience. Missing FinTech domain knowledge.",
  "strengths": [
    "Direct Kafka experience matches event streaming requirement",
    "Quantified impact — 40% latency reduction",
    "AWS and Kubernetes experience matches JD"
  ],
  "gaps": [
    "No gRPC experience mentioned",
    "No FinTech or PCI-DSS background"
  ],
  "exactMatchExplanation": "Resume contains Python Kafka PostgreSQL Redis Docker Kubernetes AWS — 7 of 9 required skills matched exactly.",
  "semanticExplanation": "AWS Kinesis experience recognized as equivalent to Kafka. Both handle distributed event streaming at scale.",
  "achievementsExplanation": "Strong quantified achievements found. 40% latency reduction shows real measurable engineering impact.",
  "ownershipExplanation": "Led migration from monolith to microservices shows clear ownership. Mentored engineers shows leadership.",
  "recommendation": "Advance to technical screen focused on gRPC and FinTech domain knowledge."
}
```

---

## 📈 Scalability

Current system handles 10,000+ resumes/day on Groq free tier (14,400 API calls/day).

To scale further:
- Multiple uvicorn workers → parallel processing
- Redis queue → async background jobs
- Load balancer → horizontal scaling
- PostgreSQL → persistent candidate storage


---

## 🚀 Future Improvements

**Candidate Self Service Portal**
Candidates fill their own application form with resume, GitHub URL, LinkedIn URL and claims. Recruiter sees a dashboard of all applicants and evaluates each one with a single click — no manual data entry needed.

**Option C — Interview Question Generator**
Tier based question difficulty tailored to each candidate's specific gaps. Technical and behavioral questions with follow up probes included automatically.

**Database Integration**
PostgreSQL for storing candidate history and evaluation results. Redis for caching common JD embeddings. Pinecone for vector similarity search across the entire resume database.

**Batch Processing**
Process hundreds of resumes simultaneously using async Redis workers and job queues with real time progress tracking.

---

## ⚙ Local Setup

Only needed if you want to run the project locally instead of using the live demo above.

### Backend
```bash
git clone https://github.com/poikavedavyas/AI_Shortlisting.git
cd AI_Shortlisting
pip install -r requirements.txt
```

Create `.env` file in project root:
```
GROQ_API_KEY=gsk_your_groq_key_here
GITHUB_TOKEN=ghp_your_github_token_here
```

Start the server:
```bash
python3 main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open browser at `http://localhost:3000`

---

## 👨‍💻 Author

Built as part of AI Backend Engineering Assignment
— Vedavyas Poika

GitHub Repository: https://github.com/poikavedavyas/AI_Shortlisting
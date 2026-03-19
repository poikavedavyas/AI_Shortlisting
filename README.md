# 🤖 AI Resume Shortlisting & Interview Assistant

![Python](https://img.shields.io/badge/Python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.135-green)
![Groq](https://img.shields.io/badge/Groq-LLaMA3.3_70B-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

An intelligent AI-powered system that automates resume evaluation by comparing candidates against job descriptions, verifying public claims, and providing detailed scoring with explainability.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [API Endpoints](#api-endpoints)
- [Scoring Logic](#scoring-logic)
- [Sample Output](#sample-output)
- [Scalability](#scalability)
- [Future Improvements](#future-improvements)

---

## 🎯 Overview

Traditional resume screening is slow, inconsistent, and biased. This system uses AI to evaluate candidates on 4 dimensions, verify their claims against real data, and provide explainable scores — telling recruiters not just the score but the **why** behind it.

**Problem it solves:**
- Manual resume screening takes hours per job posting
- Human bias affects screening decisions
- No way to verify candidate claims quickly
- Scores without explanation are meaningless

**Solution:**
- AI powered 4 dimensional scoring in seconds
- Real GitHub data fetched for claim verification
- Every score comes with detailed explanation
- Semantic understanding catches equivalent skills

---

## ✨ Features

### Option A — Evaluation & Scoring Engine
- Upload any resume PDF against any job description
- Scores on 4 dimensions with full explanations
- Tier classification A/B/C for quick decisions
- Semantic similarity catches equivalent skills
- Example: AWS Kinesis recognized as equivalent to Kafka

### Option B — Claim Verification Engine
- Real GitHub API integration fetches live profile data
- Per claim plausibility analysis High/Medium/Low
- Red flags and green flags identified
- Overall authenticity score with verdict
- Cross references claimed skills with actual GitHub languages

---

## 🏗 System Architecture
```
User Request
     ↓
FastAPI Server (main.py)
     ↓
┌────────────────────────────────────┐
│           modules/                 │
│                                    │
│  parser.py   → PDF text extraction │
│  scoring.py  → 4 dimensional score │
│  verify.py   → claim verification  │
└────────────────────────────────────┘
     ↓
Groq AI (llama-3.3-70b-versatile)
     ↓
JSON Response
```

**How modules interact:**
- `main.py` receives HTTP requests and routes them
- `parser.py` converts PDF bytes to plain text
- `scoring.py` sends resume + JD to Groq AI and returns scores
- `verification.py` fetches GitHub data then sends to Groq AI
- `core/config.py` manages all API keys centrally
- `core/logger.py` provides timestamped logging throughout

---

## 🛠 Tech Stack

| Technology | Purpose | Why Chosen |
|---|---|---|
| Python 3.12 | Primary language | Best for AI/ML projects |
| FastAPI | Web framework | Fast, async, auto docs |
| Uvicorn | ASGI server | Industry standard for FastAPI |
| Groq LLaMA 3.3 70B | AI scoring | Free, fast, accurate JSON |
| PyMuPDF | PDF parsing | Fastest Python PDF library |
| Pydantic | Data validation | Built into FastAPI |
| requests | GitHub API calls | Simple HTTP library |
| python-dotenv | Config management | Secure key loading |

---

## 📁 Project Structure
```
ai-recruiter/
│
├── .env                    # API keys (never committed)
├── .gitignore              # Protects secrets
├── requirements.txt        # All dependencies
├── main.py                 # FastAPI server + endpoints
│
├── core/
│   ├── config.py           # Loads and validates API keys
│   └── logger.py           # Timestamped terminal logging
│
├── modules/
│   ├── parser.py           # PDF bytes → plain text
│   ├── scoring.py          # Resume + JD → 4 scores
│   └── verification.py     # Claims + GitHub → report
│
└── data/
    └── sample_jd.txt       # Sample job description
```

---

## ⚙ Setup & Installation

### Prerequisites
```
Python 3.12+
Git
Groq API key (free at console.groq.com)
GitHub Token (free at github.com/settings/tokens)
```

### Step 1 — Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/AI_Shortlisting.git
cd AI_Shortlisting
```

### Step 2 — Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3 — Set Up Environment Variables
Create a `.env` file in the root directory:
```
GROQ_API_KEY=gsk_your_groq_key_here
GITHUB_TOKEN=ghp_your_github_token_here
```

### Step 4 — Run the Server
```bash
python3 main.py
```

### Step 5 — Open Swagger UI
```
http://localhost:8000/docs
```

---

## 🔌 API Endpoints

### GET /health
Check if server is running.

**Response:**
```json
{
    "status": "ok",
    "message": "AI Shortlisting API is running"
}
```

---

### POST /evaluate
Evaluate a resume PDF against a job description.

**Input:**
| Field | Type | Description |
|---|---|---|
| file | PDF file | Candidate resume |
| jd | string | Job description text |

**Response:**
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
    "summary": "Strong backend engineer with solid Python and Kafka experience",
    "strengths": [
        "Direct Kafka experience matches event streaming requirement",
        "Quantified impact — 40% latency reduction",
        "AWS and Kubernetes experience matches JD"
    ],
    "gaps": [
        "No gRPC experience mentioned",
        "No FinTech domain knowledge"
    ],
    "exactMatchExplanation": "Resume contains Python, Kafka, PostgreSQL, Redis, Docker, Kubernetes, AWS — 7 of 9 required skills matched exactly",
    "semanticExplanation": "AWS Kinesis experience recognized as equivalent to Kafka. Both are distributed event streaming platforms handling real time data",
    "achievementsExplanation": "Strong quantified achievements found. 40% latency reduction shows measurable impact",
    "ownershipExplanation": "Led migration shows ownership. Mentored engineers shows leadership",
    "recommendation": "Advance to technical screen focused on gRPC and FinTech knowledge"
}
```

---

### POST /verify
Verify candidate claims against GitHub profile.

**Input:**
```json
{
    "github_url": "https://github.com/johndoe",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "claims": "5 years Python experience, built Kafka pipelines, open source contributor"
}
```

**Response:**
```json
{
    "overallAuthenticity": 85,
    "githubSignals": {
        "score": 88,
        "findings": [
            "Account created 3 years ago — consistent with experience claims",
            "Python is top language — matches claimed expertise"
        ],
        "flags": []
    },
    "claimVerification": [
        {
            "claim": "5 years Python experience",
            "plausibility": "Medium",
            "reasoning": "Account age is 3 years which partially contradicts 5 year claim",
            "verificationTip": "Ask for previous GitHub account or portfolio links"
        }
    ],
    "redFlags": [],
    "greenFlags": [
        "Active GitHub profile with recent commits",
        "Languages match claimed skills"
    ],
    "verdict": "Candidate appears largely authentic with minor inconsistencies worth clarifying"
}
```

---

## 📊 Scoring Logic

### 4 Dimensional Scoring

| Dimension | What it Measures | Example |
|---|---|---|
| Exact Match | Literal keyword overlap | JD says Python, resume says Python |
| Semantic Similarity | Conceptual equivalence | JD says Kafka, resume says AWS Kinesis |
| Achievements | Quantified impact | Reduced latency by 40% |
| Ownership | Leadership signals | Led migration, architected system |

### Semantic Similarity — Key Feature

The system understands conceptual equivalents:
```
AWS Kinesis    = Kafka         (event streaming)
RabbitMQ       = Kafka         (message queue)
FastAPI        = Flask         (Python web framework)
PostgreSQL     = MySQL         (relational database)
MongoDB        = DynamoDB      (NoSQL database)
AWS            = GCP = Azure   (cloud platform)
Docker         = containerization
Kubernetes     = container orchestration
```

This means a candidate with AWS Kinesis experience
will score highly for a Kafka role — because the
system understands they are conceptually equivalent.

### Tier Classification

| Tier | Score Range | Action |
|---|---|---|
| A | 75 and above | Fast track to interview |
| B | 50 to 74 | Technical screen needed |
| C | Below 50 | Needs further evaluation |

### Explainability

Every score includes a detailed explanation:
- **Why** the score is what it is
- **Which skills** matched or were missing
- **What** the recruiter should focus on
- **Recommendation** for next action

---

## 📈 Scalability

### Current Capacity
```
Single server handles:
→ 12-20 resumes per minute
→ 10000+ resumes per day
→ Groq free tier: 14400 calls/day
→ sufficient for most use cases
```

### Scaling to 100000+ Per Day

**Level 1 — Multiple Workers**
```bash
uvicorn main:app --workers 4
→ 4x throughput instantly
→ zero code changes
```

**Level 2 — Async Queue**
```
resume uploaded → added to Redis queue
workers pull from queue
process in background
results stored in PostgreSQL
```

**Level 3 — Load Balancer**
```
nginx load balancer
→ distributes across multiple servers
→ auto scaling based on queue depth
→ handles any volume
```

**Level 4 — Caching**
```
Redis cache for:
→ JD embeddings (same JD used many times)
→ common skill mappings
→ reduces Groq API calls by 40%
```

### Cost at Scale
```
10000 resumes/day:
→ ~1800 tokens per resume
→ 18M tokens/day
→ Groq paid: ~$10.62/day
→ very affordable
```

---


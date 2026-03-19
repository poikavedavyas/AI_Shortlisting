from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from modules.parser import extract_text_from_pdf
from modules.scoring import score_candidate
from modules.verification import verify_candidate
from core.logger import log

# Initialize FastAPI app
app = FastAPI(
    title="AI Resume Shortlisting System",
    description="Evaluates resumes against job descriptions and verifies candidate claims using AI",
    version="1.0.0"
)

# Add CORS middleware
# allows React or any frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Pydantic Model
# defines expected input for verify endpoint
class VerifyRequest(BaseModel):
    github_url: str
    linkedin_url: str
    claims: str


#Endpoint 1 — Health Check
@app.get("/health")
def health():
    """
    Check if server is running.
    Always test this first.
    """
    log("Health check called")
    return {
        "status": "ok",
        "message": "AI Shortlisting API is running"
    }


# Endpoint 2 — Evaluate Resume
@app.post("/evaluate")
async def evaluate(
    file: UploadFile = File(...),
    jd: str = Form(...)
):
    """
    Evaluates a resume PDF against a job description.

    Input:
    → file: PDF resume upload
    → jd: job description text

    Output:
    → 4 dimensional scores
    → tier classification A/B/C
    → strengths and gaps
    → explanations for each score
    → recommendation
    """
    log(f"POST /evaluate called — file: {file.filename}")

    # Step 1 — read PDF bytes from upload
    file_bytes = await file.read()
    log(f"File received — {len(file_bytes)} bytes")

    # Step 2 — extract text from PDF
    resume_text = extract_text_from_pdf(file_bytes)

    # check if extraction worked
    if not resume_text:
        log("ERROR: Could not extract text from PDF")
        return {
            "error": "Could not extract text from PDF",
            "message": "Make sure file is a text based PDF not a scanned image"
        }

    log(f"Resume text extracted — {len(resume_text)} characters")

    # Step 3 — score resume against JD
    result = score_candidate(resume_text, jd)

    # check if scoring worked
    if not result:
        log("ERROR: Scoring failed")
        return {
            "error": "Scoring failed",
            "message": "Could not generate scores please try again"
        }

    log(f"Evaluation complete — tier: {result.get('tier', 'unknown')}")
    return result


# Endpoint 3 — Verify Claims
@app.post("/verify")
def verify(request: VerifyRequest):
    """
    Verifies candidate claims against GitHub profile.

    Input:
    → github_url: GitHub profile URL
    → linkedin_url: LinkedIn profile URL
    → claims: candidate claims text

    Output:
    → overall authenticity score
    → GitHub signals and findings
    → per claim plausibility
    → red flags and green flags
    → verdict
    """
    log(f"POST /verify called — github: {request.github_url}")

    # verify candidate claims
    result = verify_candidate(
        github_url=request.github_url,
        linkedin_url=request.linkedin_url,
        claims=request.claims
    )

    # check if verification worked
    if not result:
        log("ERROR: Verification failed")
        return {
            "error": "Verification failed",
            "message": "Could not complete verification please try again"
        }

    log(f"Verification complete — authenticity: {result.get('overallAuthenticity', 'unknown')}%")
    return result


# Run Server 
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
import json
from groq import Groq
from core.config import GROQ_API_KEY
from core.logger import log

# Initialize Groq client once
client = Groq(api_key=GROQ_API_KEY)

def score_candidate(resume_text: str, jd_text: str) -> dict:
    """
    Takes resume text and job description text.
    Sends both to Groq AI.
    Returns 4 dimensional scores with explanations.
    """
    try:
        log("Starting candidate scoring")

        # System prompt — instructions for AI
        system_prompt = """
You are an expert technical recruiter with 10 years of experience.
Your job is to evaluate a candidate resume against a job description.

You must analyze and score the candidate on exactly 4 dimensions:

1. exactMatch (0-100)
   → Count how many skills/technologies in the JD
     appear LITERALLY in the resume
   → Word for word matches only
   → Example: JD says Python, resume says Python = match

2. semanticSimilarity (0-100)
   → Find conceptual equivalents even if words differ
   → Example: JD says RabbitMQ, resume says Kafka = match
   → Example: JD says event streaming, resume says Kafka = match
   → Example: JD says REST API, resume says FastAPI = match

3. achievements (0-100)
   → Look for quantified impact and measurable results
   → Example: reduced latency by 40 percent = high score
   → Example: processing 2M events per day = high score
   → Vague statements like worked on backend = low score

4. ownership (0-100)
   → Look for leadership and ownership signals
   → Example: led migration, architected, designed = high
   → Example: assisted, helped, contributed to = low

Tier classification:
→ overall >= 75 = Tier A
→ overall 50-74 = Tier B
→ overall < 50  = Tier C

CRITICAL RULES:
→ Return ONLY valid JSON
→ No extra text before or after
→ No markdown code blocks
→ No backticks
→ Just the raw JSON object

Return exactly this structure:
{
    "scores": {
        "exactMatch": 0,
        "semanticSimilarity": 0,
        "achievements": 0,
        "ownership": 0,
        "overall": 0
    },
    "tier": "A or B or C",
    "summary": "2 sentence summary",
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "gaps": ["gap 1", "gap 2"],
    "exactMatchExplanation": "explain exact match score",
    "semanticExplanation": "explain semantic score",
    "achievementsExplanation": "explain achievements score",
    "ownershipExplanation": "explain ownership score",
    "recommendation": "one sentence next action"
}
"""

        # User message — the actual resume and JD
        user_message = f"""
Please evaluate this candidate against the job description.

JOB DESCRIPTION:
{jd_text}

CANDIDATE RESUME:
{resume_text}

Return the JSON evaluation now.
"""

        log("Sending resume and JD to Groq for scoring")

        # Groq API call
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=2000,
            temperature=0,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]
        )

        log("Groq responded successfully")

        # Extract text from response
        response_text = response.choices[0].message.content
        log(f"Raw response received — {len(response_text)} characters")

        
        clean_response = response_text.strip()

        if "```json" in clean_response:
            clean_response = clean_response.split("```json")[1]
            clean_response = clean_response.split("```")[0]
        elif "```" in clean_response:
            clean_response = clean_response.split("```")[1]

        clean_response = clean_response.strip()

        start_index = clean_response.find("{")
        end_index = clean_response.rfind("}") + 1

        if start_index == -1 or end_index == 0:
            log("ERROR: No JSON object found in response")
            return {}

        clean_response = clean_response[start_index:end_index]

        # Parse JSON
        result = json.loads(clean_response)

        log(f"Scoring complete — overall: {result['scores']['overall']}, tier: {result['tier']}")

        return result

    except json.JSONDecodeError as e:
        log(f"ERROR: Failed to parse response as JSON — {str(e)}")
        return {}

    except Exception as e:
        log(f"ERROR: Scoring failed — {str(e)}")
        return {}
    


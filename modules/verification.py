import json
import requests
from groq import Groq
from core.config import GROQ_API_KEY, GITHUB_TOKEN
from core.logger import log

# Initialize Groq client once
client = Groq(api_key=GROQ_API_KEY)


def fetch_github_data(github_url: str) -> dict:
    """
    Takes a GitHub profile URL.
    Fetches real public data using GitHub API.
    Returns a dictionary of profile information.
    """
    try:
        log(f"Fetching GitHub data for: {github_url}")

        username = github_url.strip("/").split("/")[-1]
        log(f"GitHub username extracted: {username}")

        # Set up headers
        # GitHub token increases limit from 60 to 5000 requests/hour
        headers = {}
        if GITHUB_TOKEN:
            headers["Authorization"] = f"token {GITHUB_TOKEN}"

        # Fetch user profile
        profile_url = f"https://api.github.com/users/{username}"
        profile_response = requests.get(profile_url, headers=headers)

        if profile_response.status_code != 200:
            log(f"WARNING: GitHub user not found — {username}")
            return {"error": "GitHub user not found", "username": username}

        profile = profile_response.json()

        # Fetch repositories
        repos_url = f"https://api.github.com/users/{username}/repos"
        repos_response = requests.get(
            repos_url,
            headers=headers,
            params={"per_page": 100, "sort": "updated"}
        )

        repos = repos_response.json() if repos_response.status_code == 200 else []

        # Extract languages from repos
        languages = {}
        total_stars = 0
        for repo in repos:
            if isinstance(repo, dict):
                lang = repo.get("language")
                if lang:
                    languages[lang] = languages.get(lang, 0) + 1
                total_stars += repo.get("stargazers_count", 0)

        # Sort languages by frequency
        top_languages = sorted(
            languages.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]

        # Build GitHub summary
        github_data = {
            "username": username,
            "name": profile.get("name", "Not provided"),
            "bio": profile.get("bio", "Not provided"),
            "public_repos": profile.get("public_repos", 0),
            "followers": profile.get("followers", 0),
            "following": profile.get("following", 0),
            "account_created": profile.get("created_at", "Unknown"),
            "total_stars": total_stars,
            "top_languages": [lang for lang, count in top_languages],
            "hireable": profile.get("hireable", False),
            "company": profile.get("company", "Not provided"),
            "location": profile.get("location", "Not provided"),
        }

        log(f"GitHub data fetched — {github_data['public_repos']} repos, languages: {github_data['top_languages']}")
        return github_data

    except Exception as e:
        log(f"ERROR: GitHub fetch failed — {str(e)}")
        return {"error": str(e)}


def verify_candidate(
    github_url: str,
    linkedin_url: str,
    claims: str
) -> dict:
    """
    Takes GitHub URL, LinkedIn URL and candidate claims.
    Fetches real GitHub data.
    Uses Groq to analyze plausibility of claims.
    Returns authenticity report.
    """
    try:
        log("Starting candidate verification")

        # Step 1 — fetch real GitHub data
        github_data = fetch_github_data(github_url)

        # Step 2 — build system prompt
        system_prompt = """
You are an expert technical recruiter
specializing in candidate verification.

Your job is to analyze a candidate's claims
against their real GitHub profile data
and LinkedIn profile URL.

Be fair but thorough in your analysis.
Look for inconsistencies between claims and data.

Plausibility levels:
→ High   = claim is consistent with evidence
→ Medium = claim is possible but unverifiable
→ Low    = claim contradicts evidence

CRITICAL RULES:
→ Return ONLY valid JSON
→ No extra text before or after
→ No markdown code blocks
→ No backticks
→ Just the raw JSON object

Return exactly this structure:
{
    "overallAuthenticity": <integer 0-100>,
    "githubSignals": {
        "score": <integer 0-100>,
        "findings": [
            "<positive finding 1>",
            "<positive finding 2>"
        ],
        "flags": [
            "<concern 1 or empty string if none>"
        ]
    },
    "linkedinSignals": {
        "score": <integer 0-100>,
        "findings": [
            "<finding about linkedin url>"
        ],
        "flags": [
            "<concern or empty string if none>"
        ]
    },
    "claimVerification": [
        {
            "claim": "<exact claim text>",
            "plausibility": "<High or Medium or Low>",
            "reasoning": "<why this plausibility>",
            "verificationTip": "<how recruiter can verify>"
        }
    ],
    "redFlags": [
        "<red flag or None if no red flags>"
    ],
    "greenFlags": [
        "<positive signal 1>",
        "<positive signal 2>"
    ],
    "verdict": "<2-3 sentence overall assessment>"
}
"""

        # Step 3 — build user message with real data
        user_message = f"""
Please verify this candidate's claims.

GITHUB PROFILE DATA (real data fetched from GitHub API):
Username: {github_data.get('username', 'Unknown')}
Name: {github_data.get('name', 'Unknown')}
Public Repos: {github_data.get('public_repos', 0)}
Followers: {github_data.get('followers', 0)}
Account Created: {github_data.get('account_created', 'Unknown')}
Total Stars: {github_data.get('total_stars', 0)}
Top Languages: {github_data.get('top_languages', [])}
Company: {github_data.get('company', 'Not provided')}
Location: {github_data.get('location', 'Not provided')}
Bio: {github_data.get('bio', 'Not provided')}

LINKEDIN URL:
{linkedin_url}

CANDIDATE CLAIMS:
{claims}

Analyze the claims against the GitHub data.
Return the JSON verification report now.
"""

        log("Sending data to Groq for verification analysis")

        # Step 4 — Groq API call
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=3000,
            temperature=0,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]
        )

        log("Groq responded successfully")

        # Step 5 — extract and parse response
        response_text = response.choices[0].message.content
        log(f"Raw response received — {len(response_text)} characters")

        
        # Clean response
        clean_response = response_text.strip()

        # Remove markdown code fences if present
        if "```json" in clean_response:
            clean_response = clean_response.split("```json")[1]
            clean_response = clean_response.split("```")[0]
        elif "```" in clean_response:
            clean_response = clean_response.split("```")[1]

        clean_response = clean_response.strip()

        # Find JSON object start and end
        start_index = clean_response.find("{")
        end_index = clean_response.rfind("}") + 1

        if start_index == -1 or end_index == 0:
            log("ERROR: No JSON object found in response")
            return {}

        clean_response = clean_response[start_index:end_index]

        # Parse JSON
        result = json.loads(clean_response)

        log(f"Verification complete — authenticity: {result['overallAuthenticity']}%")

        return result

    except json.JSONDecodeError as e:
        log(f"ERROR: Failed to parse response as JSON — {str(e)}")
        return {}

    except Exception as e:
        log(f"ERROR: Verification failed — {str(e)}")
        return {}
    


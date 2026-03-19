import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

if not ANTHROPIC_API_KEY:
    raise ValueError("ANTHROPIC_API_KEY is missing from .env file")
if not GITHUB_TOKEN:
    print("WARNING: GITHUB_TOKEN is missing - GitHub verification will be limited")
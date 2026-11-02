import os
from pathlib import Path
from sarvamai import SarvamAI

# Load SARVAM_API_KEY from .env if not already exported in environment
if "SARVAM_API_KEY" not in os.environ:
    env_path = Path(__file__).resolve().parent / ".env"
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    if key.strip() == "SARVAM_API_KEY":
                        os.environ["SARVAM_API_KEY"] = val.strip().strip("'\"")

api_key = os.getenv("SARVAM_API_KEY")
if not api_key:
    raise ValueError("SARVAM_API_KEY is not set. Please add your key to .env")

client = SarvamAI(api_subscription_key=api_key)

response = client.chat.completions(
    model="sarvam-105b-conversations",
    messages=[
        {"role": "user", "content": "Hello! Introduce yourself in one short sentence."}
    ],
)

print(response.choices[0].message.content)

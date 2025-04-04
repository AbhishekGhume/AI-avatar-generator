import sys
import os
import requests
from dotenv import load_dotenv

# Ensure UTF-8 encoding for standard output (fix for Windows)
sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables
load_dotenv()

# Get API key from environment
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
if not GROQ_API_KEY:
    print("Error: GROQ_API_KEY not found in environment variables", file=sys.stderr)
    sys.exit(1)

# API endpoint
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# Usage check
if len(sys.argv) != 3:
    print("Usage: python translate_text.py 'text to translate' target_language_code", file=sys.stderr)
    sys.exit(1)

text = sys.argv[1]
target_language_code = sys.argv[2]

# Map language codes to full language names for clearer prompting
LANGUAGE_MAP = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'hi': 'Hindi',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ru': 'Russian',
    'ar': 'Arabic',
    'pt': 'Portuguese',
    'it': 'Italian'
}

target_language = LANGUAGE_MAP.get(target_language_code, target_language_code)

try:
    # Create the translation prompt
    adjusted_prompt = f"""
    Translate the following text to {target_language}. 
    Provide ONLY the translated text without any additional information or explanations.

    Original text: {text}
    """

    # Prepare the API request payload
    payload = {
        "model": "llama3-8b-8192",
        "messages": [{"role": "user", "content": adjusted_prompt}],
        "temperature": 0.5,
        "max_tokens": 100
    }

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    # Make the request to Groq API
    response = requests.post(GROQ_API_URL, json=payload, headers=headers)
    response_data = response.json()

    if response.status_code == 200:
        translated_text = response_data["choices"][0]["message"]["content"].strip()
        print(translated_text)
    else:
        print(f"Error from Groq API: {response_data}", file=sys.stderr)
        sys.exit(1)

except Exception as e:
    print(f"Error during translation: {str(e)}", file=sys.stderr)
    print(text.encode('utf-8', errors='ignore').decode('utf-8'))  # Fallback to original text with UTF-8 fix

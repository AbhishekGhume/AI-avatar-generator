# generate_audio.py
from gtts import gTTS
import sys

if len(sys.argv) < 3:
    print("Usage: python generate_audio.py \"text\" output_file [language_code]")
    sys.exit(2)

text = sys.argv[1]
output_file = sys.argv[2]
language = sys.argv[3] if len(sys.argv) > 3 else 'en'

try:
    tts = gTTS(text=text, lang=language)
    tts.save(output_file)
    print(f"Audio saved to {output_file}")
except Exception as e:
    print(f"Error generating audio: {e}")
    sys.exit(1)
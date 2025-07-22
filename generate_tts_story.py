import os
import json
from google.cloud import texttospeech

# Set credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"C:\AsgaiaLabs\VedyxLeap\tts-access-key.json"

# Story lines
lines = [
    "Jane wants to bake a big cake.",
    "She uses a pan and some paste.",
    "She makes signs that say 'Cake Sale Today!'",
    "Her friends line up to take a plate.",
    "They smile as they taste the cake.",
    "Jane feels proud she made it all herself."
]

# Add SSML mark tags to each word
ssml = "<speak>"
for line in lines:
    words = line.split()
    for i, word in enumerate(words):
        ssml += f"<mark name='w{i}'/>{word} "
    ssml += "<break time='300ms'/>"
ssml += "</speak>"

client = texttospeech.TextToSpeechClient()

input_text = texttospeech.SynthesisInput(ssml=ssml)

voice = texttospeech.VoiceSelectionParams(
    language_code="en-US",
    name="en-US-Wavenet-D"
)

audio_config = texttospeech.AudioConfig(
    audio_encoding=texttospeech.AudioEncoding.MP3
)

response = client.synthesize_speech(
    request={
        "input": input_text,
        "voice": voice,
        "audio_config": audio_config,
        "enable_time_pointing": ["MARK"]
    }
)

# Save audio
with open("bake-sale.mp3", "wb") as out:
    out.write(response.audio_content)

# Save timing data
timed_marks = [{"mark": tp.mark_name, "time": tp.time_seconds} for tp in response.timepoints]

with open("bake-sale-timings.json", "w") as f:
    json.dump(timed_marks, f, indent=2)

print("✅ Audio and timing generated!")

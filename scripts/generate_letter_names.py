import os
from google.cloud import texttospeech

# === GOOGLE AUTH ===
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"C:\\AsgaiaLabs\\VedyxLeap\\tts-access-key.json"

# === LETTERS A-Z ===
LETTERS = [chr(c) for c in range(ord('A'), ord('Z') + 1)]

# === ACCENTS ===
ACCENTS = {
    "us": {"language_code": "en-US", "voice": "en-US-Wavenet-D"},
    "gb": {"language_code": "en-GB", "voice": "en-GB-Wavenet-A"},
    "in": {"language_code": "en-IN", "voice": "en-IN-Wavenet-A"}
}

# === OUTPUT DIRECTORY ===
output_dir = os.path.join(os.getcwd(), "public", "sounds", "letters")
os.makedirs(output_dir, exist_ok=True)

# === GOOGLE TTS CLIENT ===
client = texttospeech.TextToSpeechClient()

# === GENERATE FILES ===
for accent_prefix, config in ACCENTS.items():
    print(f"\n🌍 Generating for accent: {accent_prefix.upper()}")

    voice_params = texttospeech.VoiceSelectionParams(
        language_code=config["language_code"],
        name=config["voice"]
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        speaking_rate=0.95  # Slightly slower for clarity
    )

    for letter in LETTERS:
        text = letter  # Say the letter itself
        filename = f"{accent_prefix}_{letter}.mp3"
        filepath = os.path.join(output_dir, filename)

        if os.path.exists(filepath):
            print(f"✔️ Skipping existing: {filename}")
            continue

        print(f"🔠 Generating: {filename}")
        synthesis_input = texttospeech.SynthesisInput(text=text)

        try:
            response = client.synthesize_speech(
                input=synthesis_input,
                voice=voice_params,
                audio_config=audio_config
            )
            with open(filepath, "wb") as out:
                out.write(response.audio_content)
        except Exception as e:
            print(f"❌ Error generating {filename}: {e}")

print("\n✅ All letter sounds generated and saved to /public/sounds/letters/")

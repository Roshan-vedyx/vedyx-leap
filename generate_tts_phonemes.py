import os
import json
from google.cloud import texttospeech

# === GOOGLE AUTH ===
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"C:\AsgaiaLabs\VedyxLeap\tts-access-key.json"

# === PATHS ===
json_path = r"C:\AsgaiaLabs\VedyxLeap\src\assets\content\phonemes.json"
output_dir = os.path.join(os.getcwd(), "public", "sounds")
os.makedirs(output_dir, exist_ok=True)

# === ACCENTS TO GENERATE ===
ACCENTS = {
    "us": {"language_code": "en-US", "voice": "en-US-Wavenet-D"},
    "gb": {"language_code": "en-GB", "voice": "en-GB-Wavenet-A"},
    "in": {"language_code": "en-IN", "voice": "en-IN-Wavenet-A"}
}

# === LOAD PHONEME DATA ===
with open(json_path, "r", encoding="utf-8") as f:
    phoneme_data = json.load(f)

client = texttospeech.TextToSpeechClient()

# === GENERATE FOR EACH ACCENT ===
for accent_prefix, config in ACCENTS.items():
    print(f"\n🌍 Generating files for accent: {accent_prefix.upper()}")

    voice_params = texttospeech.VoiceSelectionParams(
        language_code=config["language_code"],
        name=config["voice"]
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        speaking_rate=0.9  # Slow down slightly for clarity
    )

    for phoneme in phoneme_data:
        phoneme_symbol = phoneme["phoneme"].strip("/").replace(":", "")
        for word_entry in phoneme["words"]:
            word = word_entry["word"]
            filename = f"{accent_prefix}_{phoneme_symbol}_{word}.mp3"
            filepath = os.path.join(output_dir, filename)

            if os.path.exists(filepath):
                print(f"✔️ Skipping existing: {filename}")
                continue

            print(f"🎧 Generating: {filename}")
            synthesis_input = texttospeech.SynthesisInput(text=word)

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

print("\n✅ All accent versions generated and saved in /public/sounds/")

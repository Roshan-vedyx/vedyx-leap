import os
import json
from google.cloud import texttospeech

# === GOOGLE AUTH ===
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"C:\\AsgaiaLabs\\VedyxLeap\\tts-access-key.json"

# === FILE PATHS ===
json_path = r"C:\\AsgaiaLabs\\VedyxLeap\\src\\assets\\content\\phonemes.json"
output_json_path = r"C:\\AsgaiaLabs\\VedyxLeap\\src\\assets\\content\\phonemes_with_audio.json"
output_audio_dir = os.path.join(os.getcwd(), "public", "sounds", "phonemes")
os.makedirs(output_audio_dir, exist_ok=True)

# === ACCENTS ===
ACCENTS = {
    "us": {"language_code": "en-US", "voice": "en-US-Wavenet-D"},
    "gb": {"language_code": "en-GB", "voice": "en-GB-Wavenet-A"},
    "in": {"language_code": "en-IN", "voice": "en-IN-Wavenet-A"},
}

# === MAPPING: PHONEME SYMBOL TO SPOKEN SOUND ===
SPOKEN_MAP = {
    "a": "ah", "b": "buh", "d": "duh", "e": "eh", "f": "fuh", "g": "guh", "h": "huh",
    "i": "ih", "j": "juh", "k": "kuh", "l": "luh", "m": "muh", "n": "nuh", "o": "aw",
    "p": "puh", "r": "ruh", "s": "sss", "t": "tuh", "u": "uh", "v": "vuh", "w": "wuh",
    "y": "yuh", "z": "zzz", "sh": "shhh", "ch": "chuh", "th": "thuh", "ng": "ng",
    "oo": "oo", "ee": "ee", "ay": "ay", "ow": "ow", "ar": "ar", "or": "or", "air": "air",
    "ear": "ear", "oi": "oy", "uh": "uh", "er": "er"
}

# === LOAD PHONEMES ===
with open(json_path, "r", encoding="utf-8") as f:
    phonemes = json.load(f)

# === TTS CLIENT ===
client = texttospeech.TextToSpeechClient()

# === GENERATE AUDIO ===
for entry in phonemes:
    symbol_raw = entry["phoneme"]       # e.g. "/f/"
    symbol = symbol_raw.strip("/").replace(":", "")  # e.g. "f"

    if symbol not in SPOKEN_MAP:
        print(f"⚠️ Skipping unknown symbol: {symbol_raw}")
        continue

    spoken = SPOKEN_MAP[symbol]
    entry_audio = {}

    for accent_key, accent_conf in ACCENTS.items():
        filename = f"{accent_key}_{symbol}.mp3"
        filepath = os.path.join(output_audio_dir, filename)

        if not os.path.exists(filepath):
            print(f"🎧 Generating {spoken} as {filename}")
            synthesis_input = texttospeech.SynthesisInput(text=spoken)
            voice = texttospeech.VoiceSelectionParams(
                language_code=accent_conf["language_code"],
                name=accent_conf["voice"]
            )
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=0.85  # Slightly slowed
            )

            try:
                response = client.synthesize_speech(
                    input=synthesis_input,
                    voice=voice,
                    audio_config=audio_config
                )
                with open(filepath, "wb") as out:
                    out.write(response.audio_content)
            except Exception as e:
                print(f"❌ Error generating {filename}: {e}")

        # Add to JSON entry
        entry_audio[accent_key] = f"/sounds/phonemes/{filename}"

    # Insert audio field below grapheme
    if "audio" not in entry:
        new_entry = {}
        for k, v in entry.items():
            new_entry[k] = v
            if k == "grapheme":
                new_entry["audio"] = entry_audio
        entry.clear()
        entry.update(new_entry)

# === SAVE UPDATED JSON ===
with open(output_json_path, "w", encoding="utf-8") as f:
    json.dump(phonemes, f, indent=2, ensure_ascii=False)

print("\n✅ Spoken phoneme audio generated and JSON updated:")
print(output_json_path)

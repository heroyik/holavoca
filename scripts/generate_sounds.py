from gtts import gTTS
import os

def generate_sounds():
    output_dir = "public/sounds"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    sounds = {
        "correct.mp3": "¡Correcto!",
        "incorrect.mp3": "¡Incorrecto!",
        "cheer1.mp3": "¡Muy bien!",
        "cheer2.mp3": "¡Excelente!",
        "cheer3.mp3": "¡Increíble!",
        "cheer4.mp3": "¡Fantástico!",
        "cheer5.mp3": "¡Sigue así!"
    }

    for filename, text in sounds.items():
        filepath = os.path.join(output_dir, filename)
        print(f"Generating {filepath} for text: '{text}'...")
        tts = gTTS(text=text, lang='es')
        tts.save(filepath)
        print(f"Saved {filepath}")

if __name__ == "__main__":
    generate_sounds()

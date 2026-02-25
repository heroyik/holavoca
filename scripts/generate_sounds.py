from gtts import gTTS
import os
import subprocess

def generate_sounds():
    output_dir = "public/sounds"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Passionate and positive Spanish phrases
    sounds = {
        "correct.mp3": "¡Eso es! ¡Perfecto!",
        "incorrect.mp3": "¡Uy, casi! ¡Ánimo!",
        "cheer1.mp3": "¡Venga, muy bien!",
        "cheer2.mp3": "¡Eres una máquina!",
        "cheer3.mp3": "¡Increíble, qué arte!",
        "cheer4.mp3": "¡A por todas!",
        "cheer5.mp3": "¡Espectacular!"
    }

    for filename, text in sounds.items():
        temp_filepath = os.path.join(output_dir, f"temp_{filename}")
        final_filepath = os.path.join(output_dir, filename)
        
        print(f"Generating {final_filepath} for text: '{text}'...")
        
        # slow=False for faster speech
        tts = gTTS(text=text, lang='es', slow=False)
        tts.save(temp_filepath)
        
        # Try to speed up using ffmpeg if available
        try:
            # atempo filter: 1.25x speed
            subprocess.run([
                "ffmpeg", "-y", "-i", temp_filepath, 
                "-filter:a", "atempo=1.25", 
                final_filepath
            ], check=True, capture_output=True)
            os.remove(temp_filepath)
            print(f"Speeded up and saved {final_filepath}")
        except Exception:
            # Fallback to standard gTTS if ffmpeg fails
            os.rename(temp_filepath, final_filepath)
            print(f"Saved {final_filepath} (ffmpeg fallback)")

if __name__ == "__main__":
    generate_sounds()

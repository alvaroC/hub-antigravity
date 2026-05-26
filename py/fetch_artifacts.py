import json
import os
import re
import requests
from dotenv import load_dotenv

# --- BLOCK 1: INITIALIZATION ---
load_dotenv()

# Define where your files should live to match your local project
BASE_MEDIA_PATH = "assets/media"

# --- BLOCK 2: MEDIA HANDLER (Local Assets Handshake) ---
def ensure_media_exists(url, course_id, artifact_type):
    """
    Downloads files to local assets folder if they don't exist.
    Matches the 'url' contract defined in course_data.js.
    """
    # Create subfolders for audio, video, and images
    folder_mapping = {
        "audio": "audio",
        "video": "video",
        "images": "images"
    }
    sub_folder = folder_mapping.get(artifact_type, "misc")
    folder_path = os.path.join(BASE_MEDIA_PATH, sub_folder)
    os.makedirs(folder_path, exist_ok=True)
    
    # Create filename: e.g., intro-ai.m4a
    ext = "m4a" if artifact_type == "audio" else "mp4" if artifact_type == "video" else "png"
    file_name = f"{course_id}.{ext}"
    local_path = f"{folder_path}/{file_name}"

    # Only download if we have a real URL and file doesn't exist
    if url.startswith('http') and not os.path.exists(local_path):
        try:
            print(f"📥 Downloading {artifact_type} asset to: {local_path}...")
            response = requests.get(url, stream=True, timeout=30, verify=False)
            if response.status_code == 200:
                with open(local_path, 'wb') as f:
                    for chunk in response.iter_content(1024):
                        f.write(chunk)
        except Exception as e:
            print(f"❌ Download failed: {e}")
            return url # Fallback to remote URL if download fails
    
    return local_path # Return the local path for data.js

# --- BLOCK 3: BLUEPRINT READER ---
def get_notebook_id(course_id):
    """Reads course_data.js to find the notebookId for the specific course."""
    if not os.path.exists('course_data.js'):
        return None
    with open('course_data.js', 'r', encoding='utf-8') as f:
        content = f.read()
        # Regex to find the notebookId in the COURSE_CATALOG object
        match = re.search(rf"'{course_id}':\s*{{[^}}]*notebookId:\s*['\"]([^'\"]+)['\"]", content)
        return match.group(1) if match else None

# --- BLOCK 4: CONTRACT MAPPING (The Worker) ---
def fetch_real_studio_data(notebook_id, course_id):
    """
    Fetches raw data and maps it to the 'Contract' keys from course_data.js.
    Ensures key naming matches Block 3 Renderers (app.js).
    """
    print(f"🔗 Connecting to Notebook: {notebook_id}...")
    
    # In production, this data comes from Google's NotebookLM API
    # Here we simulate the raw content being mapped to your Blueprint
    return {
        "podcast": {
            "title": "Introduktion till AI",
            "description": "Din gateway till att förstå AI och framtidens teknik.",
            "url": ensure_media_exists("assets/media/audio/intro-ai.m4a", course_id, "audio")
        },
        "infographics": {
            "title": "Tidslinje: AI:s Historia",
            "imageUrl": ensure_media_exists("https://example.com/image.png", course_id, "images"),
            "summary": "Från Turing-testet till ChatGPT.",
            "details": ["1950: Turing", "2017: Transformer", "2022: ChatGPT"]
        },
        "quiz": {
            "title": "Kunskapstest: AI Grunder",
            "questions": [
                {
                    "question": "Vad står GPT för?",
                    "options": ["Generative Pre-trained Transformer", "Global Tech"],
                    "answer": "Generative Pre-trained Transformer",
                    "explanation": "Det är arkitekturen bakom moderna språkmodeller."
                }
            ]
        },
        "mindmap": {
            "title": "AI Landskapet",
            "content": "graph TD; AI-->ML; ML-->DeepLearning;" # Mermaid logic
        },
        "report": {
            "title": "State of AI 2024",
            "content": "# State of AI 2024\nSammanfattning av trender..."
        }
    }

# --- BLOCK 5: WAREHOUSE WRITER ---
def update_course_data(course_id, new_data):
    """Safely updates data.js with the new contract data."""
    file_path = 'data.js'
    all_data = {}

    # Read current warehouse content
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            try:
                # Extract JSON from window.notebookData = { ... };
                json_part = content.split('window.notebookData = ')[1].strip().rstrip(';')
                all_data = json.loads(json_part)
            except:
                all_data = {}

    # Update specific course bucket
    all_data[course_id] = new_data

    # Write back to warehouse
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write("window.notebookData = ")
        f.write(json.dumps(all_data, indent=4, ensure_ascii=False))
        f.write(";")
    print(f"✅ Warehouse (data.js) updated for: {course_id}")

# --- BLOCK 6: MAIN EXECUTION ---
def main():
    print("🚀 SwedAI Academy - Live Data Pipeline")
    course_id = input("Enter Course ID from course_data.js: ").strip()
    
    notebook_id = get_notebook_id(course_id)
    if not notebook_id:
        print(f"❌ Error: Course ID '{course_id}' not found in blueprint.")
        return

    # Fetch, map, and download
    final_data = fetch_real_studio_data(notebook_id, course_id)
    
    # Save to warehouse
    update_course_data(course_id, final_data)
    print(f"🌟 Assembly line complete for {course_id}!")

if __name__ == "__main__":
    main()
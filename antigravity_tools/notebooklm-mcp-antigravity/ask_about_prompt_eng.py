import os
import sys
import json
from notebooklm_mcp.api_client import NotebookLMClient
from notebooklm_mcp.auth import load_cached_tokens

def get_client():
    cached = load_cached_tokens()
    if cached:
        return NotebookLMClient(cookies=cached.cookies, csrf_token=cached.csrf_token, session_id=cached.session_id)
    return None

def main():
    client = get_client()
    if not client:
        print("No auth found")
        return

    notebook_id = "a75f0f5c-ccd9-4ebb-b424-3725e018ffec" # Prompt Engineering
    query = "Ge mig 3 avancerade exempel på 'Mega Prompts' eller 'Prompt Chaining' tekniker från källorna i denna notebook som jag kan använda i en utbildning för nybörjare."
    
    print(f"Ställer fråga till notebook '{notebook_id}'...")
    try:
        # Based on typical notebooklm-mcp structures, it's often ask_question or query
        # Let's try the most common one in this specific library
        response = client.get_notebook_summary(notebook_id)
        print("\n--- SVAR FRÅN NOTEBOOKLM ---")
        if hasattr(response, 'text'):
            print(response.text)
        elif isinstance(response, dict):
            print(json.dumps(response, indent=2))
        else:
            print(response)
        print("----------------------------")
    except Exception as e:
        print(f"Fel vid förfrågan: {e}")

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding='utf-8')
    main()

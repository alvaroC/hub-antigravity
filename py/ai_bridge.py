import sys
import json
import os
import requests
import re
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import traceback

# --- Authentication Logic ---
try:
    from notebooklm_mcp.api_client import NotebookLMClient
    from notebooklm_mcp.auth import load_cached_tokens
except ImportError:
    print("Error: notebooklm_mcp not found. Ensure 'notebooklm-mcp-server' is installed.")
    sys.exit(1)

def get_notebook_client():
    """Retrieves the NotebookLM client using the best available auth method."""
    # 1. Check for individual env vars (EasyPanel/Production)
    cookies_env = os.environ.get("NOTEBOOKLM_COOKIES")
    csrf_env = os.environ.get("NOTEBOOKLM_CSRF_TOKEN")
    session_env = os.environ.get("NOTEBOOKLM_SESSION_ID")

    if cookies_env and csrf_env and session_env:
        try:
            # Try to parse as JSON first (from a stringified dict)
            cookies = json.loads(cookies_env)
        except:
            # Fallback to standard cookie header string parsing
            cookies = {c.split('=')[0]: c.split('=')[1] for c in cookies_env.split('; ') if '=' in c}
        return NotebookLMClient(cookies=cookies, csrf_token=csrf_env, session_id=session_env)

    # 2. Check for full auth JSON env var
    auth_json = os.environ.get("NOTEBOOKLM_AUTH_JSON")
    if auth_json:
        try:
            data = json.loads(auth_json)
            return NotebookLMClient(
                cookies=data.get("cookies"),
                csrf_token=data.get("csrf_token"),
                session_id=data.get("session_id")
            )
        except Exception as e:
            print(f"Auth JSON parsing error: {e}")

    # 3. Fallback to local cache (Antigravity/Local)
    cached = load_cached_tokens()
    if cached:
        return NotebookLMClient(
            cookies=cached.cookies,
            csrf_token=cached.csrf_token,
            session_id=cached.session_id
        )
    return None

# Default Notebook ID (Prompt Engineering)
DEFAULT_NOTEBOOK_ID = "a75f0f5c-ccd9-4ebb-b424-3725e018ffec"

class AIBridgeHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        if self.path == '/health':
            self._send_response({"status": "ready", "auth": get_notebook_client() is not None})
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == '/query':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                user_query = data.get('query', '')
                notebook_id = data.get('notebookId', DEFAULT_NOTEBOOK_ID)
                
                print(f"Processing query for notebook: {notebook_id}")
                
                # 1. Intent Detection (Save to Airtable)
                save_keywords = ["spara", "anteckning", "memo", "save"]
                should_save = any(kw in user_query.lower() for kw in save_keywords)
                
                # 2. Get client and query NotebookLM
                client = get_notebook_client()
                if not client:
                    self._send_response({"answer": "⚠️ Mentorn är inte inloggad. Kontrollera cookies!"}, 401)
                    return

                # Clean query for NotebookLM
                clean_query = user_query
                if should_save:
                    for kw in save_keywords:
                        clean_query = re.sub(rf'\b{kw}\b.*', '', clean_query, flags=re.IGNORECASE).strip()
                
                if not clean_query: clean_query = user_query

                print(f"Asking NotebookLM: {clean_query}")
                result = client.query(notebook_id, clean_query)
                
                # Extract clean answer
                answer = result.get('answer') or result.get('summary')
                if isinstance(answer, list):
                    answer = "\n".join(answer)
                
                if not answer:
                    answer = "Jag kunde tyvärr inte hitta ett bra svar i kursmaterialet just nu."

                # Send response back to Frontend (which handles Supabase saving)
                self._send_response({"answer": answer})

            except Exception as e:
                print(f"Bridge Error: {e}")
                traceback.print_exc()
                self._send_response({"error": "Internt fel i bryggan."}, 500)
        else:
            self.send_response(404)
            self.end_headers()

    def _send_response(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    port = int(os.environ.get("PORT", 8000))
    server = HTTPServer(('', port), AIBridgeHandler)
    print(f"🚀 AI Bridge v2.1 (Supabase-Ready) on port {port}")
    server.serve_forever()

if __name__ == "__main__":
    main()

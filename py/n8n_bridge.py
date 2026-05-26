import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

N8N_BASE_URL = os.getenv("N8N_BASE_URL")
N8N_API_KEY = os.getenv("N8N_API_KEY")

class N8NBridge:
    def __init__(self):
        self.base_url = N8N_BASE_URL.rstrip('/')
        # Adjusting base URL to public API if /workflows was provided
        if self.base_url.endswith('/workflows'):
            self.api_base = self.base_url.replace('/workflows', '/api/v1')
        else:
            self.api_base = f"{self.base_url}/api/v1"
            
        self.headers = {
            "X-N8N-API-KEY": N8N_API_KEY,
            "Content-Type": "application/json"
        }

    def test_connection(self):
        """Tests the connection to the n8n Public API."""
        print(f"Testing connection to: {self.api_base}/workflows")
        try:
            # We use /workflows as a simple test to see if we can list them
            response = requests.get(f"{self.api_base}/workflows", headers=self.headers, params={"limit": 1})
            if response.status_code == 200:
                print("SUCCESS: Successfully connected to n8n Public API!")
                return True
            else:
                print(f"ERROR: Connection failed with status code: {response.status_code}")
                print(response.text)
                return False
        except Exception as e:
            print(f"ERROR: Error connecting to n8n: {e}")
            return False

    def trigger_workflow(self, workflow_id, data=None):
        """Triggers a workflow via the Public API (if applicable) or a manual call."""
        # Note: Usually webhooks are preferred for triggering with data, 
        # but the Public API can be used to manage workflows.
        url = f"{self.api_base}/workflows/{workflow_id}/run"
        try:
            response = requests.post(url, headers=self.headers, json=data or {})
            return response.json()
        except Exception as e:
            return {"error": str(e)}

if __name__ == "__main__":
    bridge = N8NBridge()
    bridge.test_connection()

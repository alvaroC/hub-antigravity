
import sys
from notebooklm_mcp.api_client import NotebookLMClient

print("Metoder i NotebookLMClient:")
for method in dir(NotebookLMClient):
    if not method.startswith("_"):
        print(f"- {method}")

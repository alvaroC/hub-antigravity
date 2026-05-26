FROM python:3.12-slim

WORKDIR /app

# Copy requirements and install
COPY py/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the bridge code
COPY py/ai_bridge.py .
COPY py/n8n_bridge.py .

# Expose port
EXPOSE 8000

# Start the bridge
CMD ["python", "ai_bridge.py"]

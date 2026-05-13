FROM python:3.10-slim

WORKDIR /app

# Install dependencies first (cached if requirements.txt unchanged)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app and model
COPY app.py .
COPY best_model.pt .

# Hugging Face Spaces uses port 7860 by default
EXPOSE 7860

# Use gunicorn for production (not flask dev server)
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--timeout", "120", "app:app"]

# backend/Dockerfile
# Use Python 3.9 (or your preferred version)
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the backend port (adjust as necessary, e.g., 5000)
EXPOSE 5000

# Run the Flask app
CMD ["python", "app.py"]

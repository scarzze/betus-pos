# Stage 1: Build Frontend
FROM node:20 AS frontend-builder
WORKDIR /app

# Install dependencies and build React app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with FastAPI 
FROM python:3.11-slim
WORKDIR /app

# Keep Python from buffering logs or writing bytecode
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install Backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY backend/ /app/

# Copy compiled frontend dist folder into our FastAPI app directory
COPY --from=frontend-builder /app/dist /app/dist

# Expose cloud run default port
EXPOSE 8080

# Launch uvicorn mapping to 0.0.0.0 and port 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]

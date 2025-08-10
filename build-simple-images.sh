#!/bin/bash
echo "🚀 Building Simple Armstrong Images..."

# Node.js semplice ma funzionale
docker build -t armstrong/node-enhanced:latest - << 'DOCKERFILE'
FROM node:18-alpine
RUN apk add --no-cache python3 curl wget
RUN addgroup -g 1001 armstrong && adduser -D -u 1001 -G armstrong armstrong
USER armstrong
WORKDIR /app
CMD ["node", "--version"]
DOCKERFILE

# Python semplice ma funzionale  
docker build -t armstrong/python-enhanced:latest - << 'DOCKERFILE'
FROM python:3.11-alpine
RUN apk add --no-cache nodejs npm curl wget
RUN pip install --no-cache-dir requests
RUN addgroup -g 1001 armstrong && adduser -D -u 1001 -G armstrong armstrong
USER armstrong
WORKDIR /app
CMD ["python", "--version"]
DOCKERFILE

echo "✅ Simple images built!"
docker images | grep armstrong

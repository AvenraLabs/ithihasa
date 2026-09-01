# Multi-stage build for Ithihasa Admin Panel
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json vite.config.js index.html ./
RUN npm ci

COPY src/ ./src/
RUN npm run build

# Nginx production serving stage
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

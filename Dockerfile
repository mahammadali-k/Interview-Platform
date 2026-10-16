# One image for the API and the built frontend (Fly.io uses it, and any Docker host will do).

# ---- build the frontend ----
FROM node:20-alpine AS build
WORKDIR /app

COPY frontend/package*.json frontend/
RUN npm ci --prefix frontend

COPY frontend frontend

# Vite reads these at build time (they're public values, not secrets)
ARG VITE_API_URL=/api
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_STREAM_API_KEY
ENV VITE_API_URL=$VITE_API_URL \
    VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY \
    VITE_STREAM_API_KEY=$VITE_STREAM_API_KEY

RUN npm run build --prefix frontend

# ---- runtime ----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY backend/package*.json backend/
RUN npm ci --omit=dev --prefix backend

COPY backend backend
COPY --from=build /app/frontend/dist frontend/dist

# server.js looks for ../frontend/dist relative to the working directory
WORKDIR /app/backend
EXPOSE 3000
CMD ["node", "src/server.js"]

## Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Accept build-time environment for Vite
ARG VITE_API_URL
ARG VITE_BASE_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_BASE_URL=${VITE_BASE_URL}
RUN npm run build

## Production stage - serve static files via Nginx
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Minimal nginx config to support SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

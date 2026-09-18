FROM 192.168.62.199:8080/library/node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

ARG ENV_FILE=.env-dev
COPY ${ENV_FILE} .env.local

RUN npm ci
COPY . .

RUN npm run build

FROM 192.168.62.199:8080/library/nginx:alpine AS runner

# Copy static hasil build ke Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Optional: custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
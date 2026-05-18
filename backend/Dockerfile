FROM node:18-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN mkdir -p /app/data

ENV PORT=5000
ENV SQLITE_PATH=/app/data/salon.db
EXPOSE 5000

CMD ["npm", "start"]

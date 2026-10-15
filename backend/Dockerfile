FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npx medusa build

# ─── Runtime ────────────────────────────────────────────────────────────────
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/.medusa/server ./
COPY --from=builder /app/.medusa/server/node_modules ./node_modules

ENV NODE_ENV=production

EXPOSE 9000

CMD ["node", "index.js"]

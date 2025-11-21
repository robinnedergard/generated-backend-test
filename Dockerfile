FROM node:22-alpine AS development

# Install PostgreSQL client and netcat for connection testing
RUN apk add --no-cache postgresql-client netcat-openbsd

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

# Make startup script executable
RUN chmod +x ./scripts/start.sh

# Clean dist directory before building (force remove with find to handle nested directories)
RUN find dist -mindepth 1 -delete 2>/dev/null || true
RUN rm -rf dist 2>/dev/null || true

RUN npm run build

FROM node:22-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Install PostgreSQL client for pg_isready
RUN apk add --no-cache postgresql-client

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/scripts ./scripts

# Make startup script executable
RUN chmod +x ./scripts/start-prod.sh

EXPOSE 3000

CMD ["./scripts/start-prod.sh"]


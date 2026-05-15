FROM node:20-alpine

# openssl is required by Prisma client
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies first (leverages Docker layer cache)
COPY package*.json ./
RUN npm install

# Generate Prisma client from schema
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application source
COPY . .

EXPOSE 5000

# The actual startup command is overridden in docker-compose.yml:
#   npx prisma migrate deploy && node prisma/seed.js && node src/index.js
CMD ["node", "src/index.js"]

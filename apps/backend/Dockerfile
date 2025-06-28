# Use the official Node.js image as the base image
FROM node:24 AS builder

# Set working directory
WORKDIR /app

# Copy the root package.json and yarn.lock to install dependencies
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY .build.env ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the entire monorepo to the container
COPY . .

# Build the NestJS app
RUN npx nx build backend

# Use a lightweight Node.js image for the production environment
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy the build output and install only production dependencies
COPY --from=builder /app/dist/apps/backend ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.build.env .env

# Expose the backend port
EXPOSE 3331

# Start the NestJS app
CMD ["node", "main.js"]

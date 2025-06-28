# Use Node.js as the base image for building
FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Copy only the package.json and lock files to install dependencies
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY .build.env ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the app code
COPY . .

# Build the React app
RUN npx nx build frontend2

# Use a lightweight web server to serve the static files
FROM nginx:alpine

# Copy the build output to the Nginx directory
COPY --from=builder /app/dist/apps/frontend2 /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port Nginx is running on
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

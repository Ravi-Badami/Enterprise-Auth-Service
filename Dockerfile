# Use official Node.js 18 Alpine image (small size)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && npm install pm2 -gl

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start application
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
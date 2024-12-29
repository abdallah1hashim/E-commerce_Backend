FROM node:20-alpine3.19 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# Expose the port the application runs on
EXPOSE 8000
# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8000/health || exit 1

# Command to run the app
CMD ["npm", "start"]

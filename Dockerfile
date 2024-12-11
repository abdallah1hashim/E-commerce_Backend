FROM node:23-alpine3.19

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code
COPY ./src ./src

# Expose the port the application runs on
EXPOSE 8000

# Command to run the app
CMD npm run build && npm run serve

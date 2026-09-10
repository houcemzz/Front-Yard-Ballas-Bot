FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy ALL repository files into /app
COPY . .

EXPOSE 7860

# Run the entry script
CMD ["node", "index.js"]

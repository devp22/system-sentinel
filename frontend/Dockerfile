# frontend/Dockerfile
# Use Node 18 or a compatible version
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Serve the app
CMD ["npm", "start"]

# Expose the frontend port
EXPOSE 3000

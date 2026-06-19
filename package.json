# Forces Railway to run the Node server instead of auto-detecting a static site.
FROM node:20-slim
WORKDIR /app

# Install dependencies first (better build caching).
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the app.
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]

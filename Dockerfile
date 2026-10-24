FROM node:24-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
RUN chown -R node:node /app
USER node

ENV NODE_ENV=production APP_ENV=production PORT=10000
EXPOSE 10000
CMD ["npm", "start"]

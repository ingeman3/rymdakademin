FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY backend ./backend
COPY frontend ./frontend

RUN chown -R node:node /app

WORKDIR /app/backend

USER node

EXPOSE 3000

CMD ["npm", "start"]

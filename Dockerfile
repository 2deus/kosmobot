FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3080
CMD ["sh", "-c", "node src/reg-cmds.js && node src/index.js"]

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN src/reg-cmds.js
EXPOSE 3080
CMD ["node", "src/index.js"]

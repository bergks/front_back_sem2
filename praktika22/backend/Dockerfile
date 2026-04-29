# образ NOde.js на минималистичном Linux
FROM node:18-alpine

#рабочая директория внутри контейнера
WORKDIR /app

#копируем и устанваливаем зависимости
COPY package.json ./
RUN npm install

#зависимости копируем отдельно от кода сервера
#чтобы зависимости не переустанавливались при ккаждом изменение кода сервера

COPY backend/server.js ./

EXPOSE 3000

CMD ["node", "server.js"]

FROM node:lts-alpine3.13

# Открываем порты.
EXPOSE 80
EXPOSE 81

# Устанавливаем клиентскую рабочую папку.
WORKDIR /var/www/college/client
# Устанавливаем зависимости клиентской части приложения.
COPY client/package*.json ./
RUN npm ci --only=production

# Устанавливаем северную рабочую папку.
WORKDIR /var/www/college
# Устанавливаем зависимости серверной части приложения.
COPY package*.json ./
RUN npm ci --only=production

# Копируем файлы приложения.
COPY . ./

# Создаём production версию клиентской части.
WORKDIR /var/www/college/client
RUN npm run build

# Устанавливаем рабочую папку приложения.
WORKDIR /var/www/college

# Устанавливаем разрешение на запуск.
RUN chmod +x start.sh
# Запускаем приложение.
CMD ./start.sh

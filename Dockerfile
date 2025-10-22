# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем остальные файлы приложения
COPY . .

# Создаем директорию для загруженных файлов
RUN mkdir -p uploads

# Открываем порт
EXPOSE 3000

# Устанавливаем переменную окружения для порта
ENV PORT=3000

# Запускаем приложение
CMD ["npm", "start"]
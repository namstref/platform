// backend/index.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // Для обслуживания статических файлов
const multer = require('multer'); // Для обработки ошибок Multer

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Обслуживание статических файлов (изображения и видео)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const sectionsRoutes = require('./routes/sections');
const elementsRoutes = require('./routes/elements');

// Привязка маршрутов к приложению
app.use('/api/auth', authRoutes);
app.use('/api/sections', sectionsRoutes);
app.use('/api/elements', elementsRoutes);

// Глобальный middleware для обработки ошибок
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Размер файла слишком велик. Максимальный размер: 100MB.' });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

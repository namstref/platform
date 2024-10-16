// backend/routes/elements.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const db = require('../db'); // Импорт пула соединений
const fs = require('fs');
const sanitizeHtml = require('sanitize-html'); // Импорт sanitize-html

dotenv.config();

// Middleware для проверки токена
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Нет токена' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Нет токена' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Неверный токен' });
    req.user = decoded;
    next();
  });
};

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), // Папка для файлов
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Фильтр для проверки типа файлов
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/mpeg',
    'video/ogg',
  ];
  cb(null, allowedTypes.includes(file.mimetype));
};

// Увеличение лимита размера файла до 100MB
const upload = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } });

// Вспомогательная функция для проверки YouTube ссылок
const isYouTubeURL = (url) => {
  const youtubeRegex = /^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
  return youtubeRegex.test(url);
};

// Конфигурация sanitize-html для текстовых элементов
const sanitizeOptions = {
  allowedTags: ['b', 'strong', 'u', 'em', 'br', 'span', 'p'],
  allowedAttributes: {
    'span': ['style'],
    'p': ['style'],
  },
  allowedStyles: {
    'span': {
      // Разрешенные стили для span
      'color': [/^(red|black)$/i], // Только 'red' и 'black' (нечувствительно к регистру)
    },
    'p': {
      'color': [/^(red|black)$/i], // Только 'red' и 'black' (нечувствительно к регистру)
    },
  },
};

// Получить элементы секции
router.get('/:sectionId', verifyToken, async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM elements WHERE section_id = ?', [req.params.sectionId]);
    res.json(results);
  } catch (err) {
    console.error('Ошибка сервера:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавить элемент (только админ)
router.post('/:sectionId', verifyToken, upload.single('file'), async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ message: 'Доступ запрещен' });

  const { sectionId } = req.params;
  const { type, content } = req.body;
  let finalContent = content;

  if (type === 'video') {
    if (req.file) {
      finalContent = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else if (content) {
      if (!isYouTubeURL(content)) {
        return res.status(400).json({ message: 'Неверная ссылка на YouTube' });
      }
      finalContent = content;
    } else {
      return res.status(400).json({ message: 'Необходимо предоставить файл или ссылку на YouTube' });
    }
  } else if (type === 'image') {
    if (req.file) {
      finalContent = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else {
      return res.status(400).json({ message: 'Необходимо загрузить файл изображения' });
    }
  } else if (type === 'text') {
    if (!content) {
      return res.status(400).json({ message: 'Контент текста обязателен' });
    }
    // Санитизация контента для текстовых элементов
    finalContent = sanitizeHtml(content, sanitizeOptions);
  } else {
    return res.status(400).json({ message: 'Неверный тип элемента' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO elements (section_id, type, content) VALUES (?, ?, ?)',
      [sectionId, type, finalContent]
    );
    res.json({ id: result.insertId, sectionId, type, content: finalContent });
  } catch (err) {
    console.error('Ошибка при добавлении элемента:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить элемент (только админ)
router.put('/:id', verifyToken, upload.single('file'), async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ message: 'Доступ запрещен' });

  const { id } = req.params;
  const { type, content } = req.body;
  let finalContent = content;

  if (type === 'video') {
    if (req.file) {
      finalContent = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else if (content) {
      if (!isYouTubeURL(content)) {
        return res.status(400).json({ message: 'Неверная ссылка на YouTube' });
      }
      finalContent = content;
    } else {
      return res.status(400).json({ message: 'Необходимо предоставить файл или ссылку на YouTube' });
    }
  } else if (type === 'image') {
    if (req.file) {
      finalContent = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else {
      return res.status(400).json({ message: 'Необходимо загрузить файл изображения' });
    }
  } else if (type === 'text') {
    if (!content) {
      return res.status(400).json({ message: 'Контент текста обязателен' });
    }
    // Санитизация контента для текстовых элементов
    finalContent = sanitizeHtml(content, sanitizeOptions);
  } else {
    return res.status(400).json({ message: 'Неверный тип элемента' });
  }

  try {
    const [existing] = await db.execute('SELECT * FROM elements WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Элемент не найден' });
    }

    const oldElement = existing[0];

    // Удаление старого файла, если тип изменился или был загружен новый файл
    if ((type === 'image' || type === 'video') && req.file && oldElement.content) {
      const oldFilePath = path.join(__dirname, '..', 'uploads', path.basename(oldElement.content));
      fs.unlink(oldFilePath, (err) => {
        if (err) console.error('Ошибка при удалении старого файла:', err);
      });
    }

    await db.execute('UPDATE elements SET type = ?, content = ? WHERE id = ?', [type, finalContent, id]);

    res.json({ id, type, content: finalContent });
  } catch (err) {
    console.error('Ошибка при обновлении элемента:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удалить элемент (только админ)
router.delete('/:id', verifyToken, async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ message: 'Доступ запрещен' });

  try {
    const [results] = await db.execute('SELECT * FROM elements WHERE id = ?', [req.params.id]);
    if (results.length === 0) return res.status(404).json({ message: 'Элемент не найден' });

    const element = results[0];
    if (['image', 'video'].includes(element.type)) {
      const filePath = path.join(__dirname, '..', 'uploads', path.basename(element.content));
      fs.unlink(filePath, (err) => err && console.error('Ошибка удаления файла:', err));
    }

    await db.execute('DELETE FROM elements WHERE id = ?', [req.params.id]);
    res.json({ message: 'Элемент удален' });
  } catch (err) {
    console.error('Ошибка сервера:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;

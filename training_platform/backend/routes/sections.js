// backend/routes/sections.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const db = require('../db'); // Імпорт пулу з'єднань
const path = require('path');
const fs = require('fs').promises; // Використання промісів для асинхронних операцій з файлами

dotenv.config();

// Middleware для перевірки токена
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

// Отримати всі секції
router.get('/', verifyToken, async (req, res) => {
  const query = 'SELECT * FROM sections';
  try {
    const [results] = await db.execute(query);
    res.json(results);
  } catch (err) {
    console.error('Ошибка сервера:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Додати секцію (тільки для адміна)
router.post('/', verifyToken, async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ message: 'Доступ запрещен' });

  const { title, type } = req.body;
  const query = 'INSERT INTO sections (title, type) VALUES (?, ?)';
  try {
    const [result] = await db.execute(query, [title, type]);
    res.json({ id: result.insertId, title, type });
  } catch (err) {
    console.error('Ошибка при добавлении секции:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Видалити секцію (тільки для адміна)
router.delete('/:id', verifyToken, async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ message: 'Доступ запрещен' });

  const { id } = req.params;

  try {
    // Крок 1: Отримати всі елементи, пов'язані з цією секцією
    const [elements] = await db.execute('SELECT * FROM elements WHERE section_id = ?', [id]);

    // Крок 2: Видалити файли для кожного елемента, якщо необхідно
    const deleteFilePromises = elements.map(async (element) => {
      if (element.type === 'image') {
        try {
          const fileUrl = element.content;
          const filename = path.basename(fileUrl);
          const filePath = path.join(__dirname, '..', 'uploads', filename);
          await fs.unlink(filePath);
          console.log(`Файл видалено: ${filePath}`);
        } catch (err) {
          console.error(`Ошибка при удалении файла ${element.content}:`, err);
          // Продовжуємо навіть якщо деякі файли не вдалося видалити
        }
      } else if (element.type === 'video') {
        const fileUrl = element.content;
        // Перевірка, чи є відео файлом на сервері
        if (fileUrl.includes('/uploads/')) {
          try {
            const filename = path.basename(fileUrl);
            const filePath = path.join(__dirname, '..', 'uploads', filename);
            await fs.unlink(filePath);
            console.log(`Файл видалено: ${filePath}`);
          } catch (err) {
            console.error(`Ошибка при удалении файла ${element.content}:`, err);
            // Продовжуємо навіть якщо деякі файли не вдалося видалити
          }
        }
      }
      // Для типу 'text' не потрібно видаляти файли
    });

    await Promise.all(deleteFilePromises);

    // Крок 3: Видалити всі елементи, пов'язані з секцією
    await db.execute('DELETE FROM elements WHERE section_id = ?', [id]);

    // Крок 4: Видалити саму секцію
    const [result] = await db.execute('DELETE FROM sections WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Секция не найдена' });
    }

    res.json({ message: 'Секция удалена разом з її елементами та файлами' });
  } catch (err) {
    console.error('Ошибка при удалении секции:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Оновити назву секції (тільки для адміна)
router.put('/:id', verifyToken, async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ message: 'Доступ запрещен' });

  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Название секции обязательно' });
  }

  try {
    const [result] = await db.execute('UPDATE sections SET title = ? WHERE id = ?', [title, req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Секция не найдена' });
    }
    res.json({ message: 'Название секции обновлено' });
  } catch (err) {
    console.error('Ошибка при обновлении секции:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;

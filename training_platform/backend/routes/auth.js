// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const db = require('../db'); // Импорт пула соединений

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

// Вход (логин)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ?';
  try {
    const [results] = await db.execute(query, [username]);

    if (results.length === 0) {
      console.warn('Попытка входа с неверными учётными данными:', username);
      return res.status(400).json({ message: 'Неверные учетные данные' });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`Неверный пароль для пользователя: ${username}`);
      return res.status(400).json({ message: 'Неверные учетные данные' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        is_admin: Boolean(user.is_admin) // Преобразование в булево
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log(`Пользователь ${username} успешно вошёл.`);
    res.json({ token });
  } catch (err) {
    console.error('Ошибка при выполнении запроса:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Регистрация нового пользователя (только админ)
router.post('/register', verifyToken, async (req, res) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Имя пользователя и пароль обязательны' });
  }

  try {
    // Проверка, существует ли уже пользователь
    const [existingUsers] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Вставка нового пользователя с is_admin = false
    const [result] = await db.execute(
      'INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)',
      [username, hashedPassword, false]
    );

    res.status(201).json({ id: result.insertId, username, is_admin: false });
  } catch (err) {
    console.error('Ошибка при регистрации пользователя:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;

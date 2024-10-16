// backend/db.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Создаём пул соединений
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Тестируем подключение к базе данных
pool.getConnection()
  .then(conn => {
    console.log('Подключено к базе данных MySQL');
    conn.release();
  })
  .catch(err => {
    console.error('Ошибка подключения к базе данных:', err);
    process.exit(1);
  });

module.exports = pool;

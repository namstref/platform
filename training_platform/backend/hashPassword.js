const bcrypt = require('bcrypt');

const password = 'admin7778'; // Ваш пароль

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Ошибка хэширования:', err);
  } else {
    console.log('Хэшированный пароль:', hash);
  }
});

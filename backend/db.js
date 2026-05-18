const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const { resolveSqlitePath } = require('./dbPath');



const db = new sqlite3.Database(resolveSqlitePath());

db.serialize(() => {
  
  db.run(`CREATE TABLE IF NOT EXISTS salons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL
  )`);

  
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  )`);

  
  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'hairdresser',
    duration INTEGER DEFAULT 60
  )`);

  
  db.run(`CREATE TABLE IF NOT EXISTS masters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    schedule TEXT DEFAULT '{"days":[],"hours":{"start":"10:00","end":"20:00"}}',
    salonId INTEGER DEFAULT 1
  )`);

  
  db.run(`CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    serviceId INTEGER,
    masterId INTEGER,
    salonId INTEGER,
    date TEXT,
    time TEXT,
    status TEXT DEFAULT 'pending'
  )`);

  
  db.get(`SELECT COUNT(*) as count FROM salons`, (err, row) => {
    if (row.count === 0) {
      db.run(`INSERT INTO salons (name, address) VALUES (?, ?)`, ['Салон на Еременко', 'пр. Еременко 90/27']);
      db.run(`INSERT INTO salons (name, address) VALUES (?, ?)`, ['Салон на Горшкова', 'пр. Горшкова 2а']);
    }
  });

  
  db.get(`SELECT * FROM users WHERE email = 'admin@madam.ru'`, (err, row) => {
    if (!row) {
      const hashed = bcrypt.hashSync('admin123', 10);
      db.run(`INSERT INTO users (firstName, lastName, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Admin', 'Madam', 'admin@madam.ru', '0000000000', hashed, 'admin']);
    }
  });

  
  db.get(`SELECT COUNT(*) as count FROM services`, (err, row) => {
    if (row.count === 0) {
      const services = [
        ['Стрижка женская', 'от 700 ₽', 'hairdresser', 60],
        ['Стрижка мужская', '600 ₽', 'hairdresser', 30],
        ['Укладка волос', 'от 1000 ₽', 'hairdresser', 30],
        ['Окрашивание', 'от 2500 ₽', 'hairdresser', 120],
        ['Милирование волос', 'от 3500 ₽', 'hairdresser', 180],
        ['Химическая завивка', 'от 3000 ₽', 'hairdresser', 180],
        ['Маникюр классический', '800 ₽', 'manicure', 60],
        ['Покрытие гель-лаком', '800 ₽', 'manicure', 30],
        ['Педикюр', 'от 1500 ₽', 'manicure', 90],
        ['Наращивание ногтей', '2500 ₽', 'manicure', 120],
        ['Чистка лица', '2500 ₽', 'cosmetologist', 60],
        ['Пилинг', '3000 ₽', 'cosmetologist', 60],
        ['Окрашивание бровей и ресниц', 'от 3500 ₽', 'cosmetologist', 30],
        ['Прокол ушей', '1500 ₽', 'cosmetologist', 30],
        ['SPA-уход', '3500 ₽', 'cosmetologist', 90]
      ];
      services.forEach(s => {
        db.run(`INSERT INTO services (name, price, category, duration) VALUES (?, ?, ?, ?)`, s);
      });
    }
  });

  
  db.get(`SELECT COUNT(*) as count FROM masters`, (err, row) => {
    if (row.count === 0) {
      const masters = [
        ['Евгения', 'hairdresser', 'Парикмахер-универсал, стаж 8 лет', JSON.stringify({ days: ['Пн', 'Ср', 'Пт'], hours: { start: '10:00', end: '20:00' } }), 1],
        ['Наира', 'hairdresser', 'Парикмахер-универсал, стаж от 25 лет', JSON.stringify({ days: ['Вт', 'Чт', 'Сб'], hours: { start: '10:00', end: '20:00' } }), 1],
        ['Елена', 'manicure', 'Мастер маникюра и педикюра, стаж 10 лет', JSON.stringify({ days: ['Вт', 'Чт', 'Сб'], hours: { start: '10:00', end: '20:00' } }), 1],
        ['Наталья', 'manicure', 'Мастер маникюра и педикюра, стаж 20 лет', JSON.stringify({ days: ['Пн', 'Ср', 'Пт'], hours: { start: '10:00', end: '20:00' } }), 1],
        ['Наталья', 'cosmetologist', 'Косметолог-эстетист, стаж 16 лет', JSON.stringify({ days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'], hours: { start: '10:00', end: '20:00' } }), 1],
        ['Евгения', 'hairdresser', 'Парикмахер-универсал, стаж 20 лет', JSON.stringify({ days: ['Пн', 'Ср', 'Пт'], hours: { start: '10:00', end: '20:00' } }), 2],
        ['Татьяна', 'hairdresser', 'Парикмахер-универсал, стаж 16 лет', JSON.stringify({ days: ['Вт', 'Чт', 'Сб'], hours: { start: '10:00', end: '20:00' } }), 2],
        ['Виктория', 'manicure', 'Мастер ногтевого сервиса, стаж 7 лет', JSON.stringify({ days: ['Пн', 'Ср', 'Пт', 'Сб'], hours: { start: '10:00', end: '20:00' } }), 2],
        ['Юлиана', 'cosmetologist', 'Косметолог-эстетист, стаж 18 лет', JSON.stringify({ days: ['Ср', 'Пт', 'Вс'], hours: { start: '10:00', end: '20:00' } }), 2]
      ];
      masters.forEach(m => {
        db.run(`INSERT INTO masters (name, category, description, schedule, salonId) VALUES (?, ?, ?, ?, ?)`, m);
      });
    }
  });
});

module.exports = db;

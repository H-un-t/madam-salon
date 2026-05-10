const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./salon.db');

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
    salonId INTEGER DEFAULT 1,
    FOREIGN KEY(salonId) REFERENCES salons(id)
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
        ['Стрижка женская', '1500 ₽', 'hairdresser', 60],
        ['Стрижка мужская', '1000 ₽', 'hairdresser', 45],
        ['Окрашивание', '3000 ₽', 'hairdresser', 120],
        ['Маникюр классический', '1200 ₽', 'manicure', 90],
        ['Педикюр', '2000 ₽', 'manicure', 90],
        ['Наращивание ногтей', '2500 ₽', 'manicure', 120],
        ['Чистка лица', '2500 ₽', 'cosmetologist', 60],
        ['Пилинг', '3000 ₽', 'cosmetologist', 60],
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
        ['Анна Кузнецова', 'hairdresser', 'Парикмахер-стилист, стаж 8 лет', JSON.stringify({ days: ['Пн', 'Ср', 'Пт'], hours: { start: '10:00', end: '20:00' } }), 1],
        ['Мария Иванова', 'manicure', 'Мастер маникюра и педикюра, стаж 5 лет', JSON.stringify({ days: ['Вт', 'Чт', 'Сб'], hours: { start: '10:00', end: '20:00' } }), 1],
        ['Елена Смирнова', 'cosmetologist', 'Косметолог-эстетист, стаж 6 лет', JSON.stringify({ days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'], hours: { start: '09:00', end: '19:00' } }), 2],
        ['Дмитрий Петров', 'hairdresser', 'Барбер, стаж 4 года', JSON.stringify({ days: ['Вт', 'Чт', 'Сб', 'Вс'], hours: { start: '11:00', end: '21:00' } }), 2],
        ['Ольга Сидорова', 'manicure', 'Мастер ногтевого сервиса, стаж 7 лет', JSON.stringify({ days: ['Пн', 'Ср', 'Пт', 'Сб'], hours: { start: '10:00', end: '19:00' } }), 1]
      ];
      masters.forEach(m => {
        db.run(`INSERT INTO masters (name, category, description, schedule, salonId) VALUES (?, ?, ?, ?, ?)`, m);
      });
    }
  });
});

module.exports = db;
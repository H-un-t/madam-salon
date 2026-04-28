const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('./db');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'madam_salon_secret_key_2024';

app.use(cors());
app.use(express.json());

// ========== Middleware ==========
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет токена' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Неверный токен' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
  next();
};

// ========== Регистрация ==========
app.post('/api/register', [
  body('firstName').notEmpty(), body('lastName').notEmpty(),
  body('email').isEmail(), body('phone').notEmpty(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { firstName, lastName, email, phone, password } = req.body;

  const existingPhone = await new Promise((resolve) => {
    db.get(`SELECT id FROM users WHERE phone = ?`, [phone], (err, row) => resolve(row));
  });
  if (existingPhone) return res.status(400).json({ error: 'Телефон уже зарегистрирован' });

  const existingEmail = await new Promise((resolve) => {
    db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, row) => resolve(row));
  });
  if (existingEmail) return res.status(400).json({ error: 'Email уже существует' });

  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    await new Promise((resolve, reject) => {
      db.run(`INSERT INTO users (firstName, lastName, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)`,
        [firstName, lastName, email, phone, hashedPassword, 'user'],
        (err) => err ? reject(err) : resolve());
    });
    res.status(201).json({ message: 'Регистрация успешна' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== Логин ==========
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Неверные данные' });
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Неверные данные' });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, role: user.role } });
  });
});

// ========== Получить данные пользователя ==========
app.get('/api/user', auth, (req, res) => {
  db.get(`SELECT id, firstName, lastName, email, phone, role FROM users WHERE id = ?`, [req.userId], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  });
});

// ========== Обновить данные пользователя ==========
app.put('/api/user', auth, async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  if (phone) {
    const existing = await new Promise((resolve) => {
      db.get(`SELECT id FROM users WHERE phone = ? AND id != ?`, [phone, req.userId], (err, row) => resolve(row));
    });
    if (existing) return res.status(400).json({ error: 'Телефон уже используется' });
  }
  db.run(`UPDATE users SET firstName = ?, lastName = ?, phone = ? WHERE id = ?`,
    [firstName, lastName, phone, req.userId], function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка обновления' });
      res.json({ message: 'Данные обновлены' });
    });
});

// ========== Смена email ==========
app.put('/api/user/email', auth, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email обязателен' });
  const existing = await new Promise((resolve) => {
    db.get(`SELECT id FROM users WHERE email = ? AND id != ?`, [email, req.userId], (err, row) => resolve(row));
  });
  if (existing) return res.status(400).json({ error: 'Email уже используется' });
  db.run(`UPDATE users SET email = ? WHERE id = ?`, [email, req.userId], (err) => {
    if (err) return res.status(500).json({ error: 'Ошибка обновления' });
    res.json({ message: 'Email обновлён' });
  });
});

// ========== Смена пароля ==========
app.put('/api/user/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Текущий и новый пароль обязательны' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Новый пароль должен содержать минимум 6 символов' });
  try {
    const user = await new Promise((resolve) => {
      db.get(`SELECT password FROM users WHERE id = ?`, [req.userId], (err, row) => resolve(row));
    });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    const isMatch = bcrypt.compareSync(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Неверный текущий пароль' });
    const hashed = bcrypt.hashSync(newPassword, 10);
    await db.run(`UPDATE users SET password = ? WHERE id = ?`, [hashed, req.userId]);
    res.json({ message: 'Пароль обновлён' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== Управление пользователями (админ) ==========
app.get('/api/admin/users', auth, adminOnly, (req, res) => {
  db.all(`SELECT id, firstName, lastName, email, phone, role FROM users`, (err, users) => res.json(users));
});

app.post('/api/admin/users', auth, adminOnly, async (req, res) => {
  const { firstName, lastName, email, phone, password, role } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ error: 'Пароль должен быть минимум 6 символов' });
  const hashed = bcrypt.hashSync(password, 10);
  db.run(`INSERT INTO users (firstName, lastName, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)`,
    [firstName, lastName, email, phone, hashed, role], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email или телефон уже существует' });
        return res.status(400).json({ error: 'Ошибка создания' });
      }
      res.json({ id: this.lastID });
    });
});

app.put('/api/admin/users/:id', auth, adminOnly, async (req, res) => {
  const { firstName, lastName, email, phone, role, password } = req.body;
  const userId = req.params.id;
  if (parseInt(userId) === req.userId && role === 'user') {
    return res.status(403).json({ error: 'Нельзя понизить свою роль до user' });
  }
  if (email) {
    const existing = await new Promise((resolve) => {
      db.get(`SELECT id FROM users WHERE email = ? AND id != ?`, [email, userId], (err, row) => resolve(row));
    });
    if (existing) return res.status(400).json({ error: 'Email уже используется' });
  }
  if (phone) {
    const existing = await new Promise((resolve) => {
      db.get(`SELECT id FROM users WHERE phone = ? AND id != ?`, [phone, userId], (err, row) => resolve(row));
    });
    if (existing) return res.status(400).json({ error: 'Телефон уже используется' });
  }
  let query = `UPDATE users SET firstName=?, lastName=?, email=?, phone=?, role=?`;
  let params = [firstName, lastName, email, phone, role];
  if (password && password.length >= 6) {
    const hashed = bcrypt.hashSync(password, 10);
    query += `, password=?`;
    params.push(hashed);
  }
  query += ` WHERE id=?`;
  params.push(userId);
  db.run(query, params, (err) => {
    if (err) return res.status(500).json({ error: 'Ошибка обновления' });
    res.json({ message: 'Обновлено' });
  });
});

app.delete('/api/admin/users/:id', auth, adminOnly, (req, res) => {
  const userId = req.params.id;
  db.run(`DELETE FROM appointments WHERE userId = ?`, [userId], (err) => {
    if (err) return res.status(500).json({ error: 'Ошибка удаления записей' });
    db.run(`DELETE FROM users WHERE id = ?`, [userId], (err) => {
      if (err) return res.status(500).json({ error: 'Ошибка удаления пользователя' });
      res.json({ message: 'Пользователь и его записи удалены' });
    });
  });
});

// ========== Услуги (CRUD) ==========
app.get('/api/services', (req, res) => {
  db.all(`SELECT * FROM services`, (err, rows) => res.json(rows));
});
app.post('/api/admin/services', auth, adminOnly, (req, res) => {
  const { name, price, category, duration } = req.body;
  db.run(`INSERT INTO services (name, price, category, duration) VALUES (?, ?, ?, ?)`,
    [name, price, category, duration || 60], function(err) {
      if (err) return res.status(400).json({ error: 'Ошибка' });
      res.json({ id: this.lastID });
    });
});
app.put('/api/admin/services/:id', auth, adminOnly, (req, res) => {
  const { name, price, category, duration } = req.body;
  db.run(`UPDATE services SET name=?, price=?, category=?, duration=? WHERE id=?`,
    [name, price, category, duration, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: 'Ошибка обновления' });
      res.json({ message: 'Обновлено' });
    });
});
app.delete('/api/admin/services/:id', auth, adminOnly, (req, res) => {
  const serviceId = req.params.id;
  db.run(`DELETE FROM appointments WHERE serviceId = ?`, [serviceId], (err) => {
    if (err) return res.status(500).json({ error: 'Ошибка удаления записей' });
    db.run(`DELETE FROM services WHERE id = ?`, [serviceId], (err) => {
      if (err) return res.status(500).json({ error: 'Ошибка удаления услуги' });
      res.json({ message: 'Услуга и связанные записи удалены' });
    });
  });
});

// ========== Мастера (CRUD) ==========
app.get('/api/masters', (req, res) => {
  db.all(`SELECT * FROM masters`, (err, rows) => res.json(rows));
});
app.post('/api/admin/masters', auth, adminOnly, (req, res) => {
  const { name, category, description, schedule, salonId } = req.body;
  db.run(`INSERT INTO masters (name, category, description, schedule, salonId) VALUES (?, ?, ?, ?, ?)`,
    [name, category, description, schedule || '{"days":[],"hours":{"start":"10:00","end":"20:00"}}', salonId || 1], function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка создания' });
      res.json({ id: this.lastID });
    });
});
app.put('/api/admin/masters/:id', auth, adminOnly, (req, res) => {
  const { name, category, description, schedule, salonId } = req.body;
  db.run(`UPDATE masters SET name=?, category=?, description=?, schedule=?, salonId=? WHERE id=?`,
    [name, category, description, schedule, salonId, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: 'Ошибка обновления' });
      res.json({ message: 'Обновлено' });
    });
});
app.delete('/api/admin/masters/:id', auth, adminOnly, (req, res) => {
  const masterId = req.params.id;
  db.run(`DELETE FROM appointments WHERE masterId = ?`, [masterId], (err) => {
    if (err) return res.status(500).json({ error: 'Ошибка удаления записей' });
    db.run(`DELETE FROM masters WHERE id = ?`, [masterId], (err) => {
      if (err) return res.status(500).json({ error: 'Ошибка удаления мастера' });
      res.json({ message: 'Мастер и его записи удалены' });
    });
  });
});

// ========== Салоны ==========
app.get('/api/salons', (req, res) => {
  db.all(`SELECT id, name, address FROM salons`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ========== ПОЛУЧЕНИЕ СВОБОДНЫХ СЛОТОВ ==========
app.get('/api/appointments/free-slots', auth, async (req, res) => {
  const { masterId, date, serviceId } = req.query;
  if (!masterId || !date || !serviceId) {
    return res.status(400).json({ error: 'Не указаны мастер, дата или услуга' });
  }
  try {
    const master = await new Promise((resolve) => {
      db.get(`SELECT schedule, category FROM masters WHERE id = ?`, [masterId], (err, row) => resolve(row));
    });
    if (!master) return res.status(404).json({ error: 'Мастер не найден' });
    const service = await new Promise((resolve) => {
      db.get(`SELECT duration FROM services WHERE id = ?`, [serviceId], (err, row) => resolve(row));
    });
    if (!service) return res.status(404).json({ error: 'Услуга не найдена' });
    const duration = service.duration || 60;
    let schedule = { days: [], hours: { start: '10:00', end: '20:00' } };
    try { schedule = JSON.parse(master.schedule || '{}'); } catch(e) {}
    schedule.days = schedule.days || [];
    schedule.hours = schedule.hours || { start: '10:00', end: '20:00' };
    const dateObj = new Date(date);
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const dayName = dayNames[dateObj.getDay()];
    if (!schedule.days.includes(dayName)) return res.json({ slots: [] });
    const startHour = parseInt(schedule.hours.start.split(':')[0]);
    const startMin = parseInt(schedule.hours.start.split(':')[1]);
    const endHour = parseInt(schedule.hours.end.split(':')[0]);
    const endMin = parseInt(schedule.hours.end.split(':')[1]);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    let slots = [];
    for (let minutes = startMinutes; minutes + duration <= endMinutes; minutes += 30) {
      const hour = Math.floor(minutes / 60);
      const min = minutes % 60;
      const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      slots.push(timeStr);
    }
    const existingAppointments = await new Promise((resolve) => {
      db.all(`SELECT a.time, s.duration as dur FROM appointments a JOIN services s ON a.serviceId = s.id WHERE a.masterId = ? AND a.date = ? AND a.status != 'cancelled'`, [masterId, date], (err, rows) => resolve(rows || []));
    });
    const busyIntervals = [];
    for (const app of existingAppointments) {
      const appDuration = app.dur || 60;
      const [hour, min] = app.time.split(':').map(Number);
      const start = hour * 60 + min;
      const end = start + appDuration;
      busyIntervals.push({ start, end });
    }
    function isOverlap(slotStart, slotEnd, busy) {
      return (slotStart < busy.end && slotEnd > busy.start);
    }
    const freeSlots = slots.filter(slot => {
      const [hour, min] = slot.split(':').map(Number);
      const slotStart = hour * 60 + min;
      const slotEnd = slotStart + duration;
      return !busyIntervals.some(busy => isOverlap(slotStart, slotEnd, busy));
    });
    res.json({ slots: freeSlots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ========== Получение расписания мастера на период (для админа) ==========
app.get('/api/appointments/schedule', auth, adminOnly, (req, res) => {
  const { masterId, startDate, endDate } = req.query;
  if (!masterId || !startDate || !endDate) {
    return res.status(400).json({ error: 'Не указаны мастер, startDate или endDate' });
  }
  db.all(`SELECT a.*, u.firstName, u.lastName, s.name as serviceName, s.duration 
          FROM appointments a
          LEFT JOIN users u ON a.userId = u.id
          LEFT JOIN services s ON a.serviceId = s.id
          WHERE a.masterId = ? AND a.date BETWEEN ? AND ? AND a.status != 'cancelled'`,
    [masterId, startDate, endDate], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
});

// ========== Получение записей ==========
app.get('/api/appointments', auth, (req, res) => {
  if (req.userRole === 'admin') {
    db.all(`SELECT a.*, u.firstName, u.lastName, s.name as serviceName, m.name as masterName, sal.name as salonName 
            FROM appointments a 
            LEFT JOIN users u ON a.userId = u.id
            LEFT JOIN services s ON a.serviceId = s.id
            LEFT JOIN masters m ON a.masterId = m.id
            LEFT JOIN salons sal ON a.salonId = sal.id`, (err, rows) => res.json(rows));
  } else {
    db.all(`SELECT a.*, s.name as serviceName, m.name as masterName, sal.name as salonName 
            FROM appointments a 
            LEFT JOIN services s ON a.serviceId = s.id
            LEFT JOIN masters m ON a.masterId = m.id
            LEFT JOIN salons sal ON a.salonId = sal.id
            WHERE a.userId = ?`, [req.userId], (err, rows) => res.json(rows));
  }
});

// ========== Создание записи (админ может указать userId, клиент – своего) ==========
app.post('/api/appointments', auth, async (req, res) => {
  let { serviceId, masterId, date, time, userId, salonId } = req.body;
  if (!userId) userId = req.userId;
  if (!salonId) {
    const master = await new Promise((resolve) => {
      db.get(`SELECT salonId FROM masters WHERE id = ?`, [masterId], (err, row) => resolve(row));
    });
    salonId = master?.salonId || 1;
  }
  const service = await new Promise((resolve) => {
    db.get(`SELECT category, duration FROM services WHERE id = ?`, [serviceId], (err, row) => resolve(row));
  });
  const master = await new Promise((resolve) => {
    db.get(`SELECT category FROM masters WHERE id = ?`, [masterId], (err, row) => resolve(row));
  });
  if (!service || !master || service.category !== master.category) {
    return res.status(400).json({ error: 'Услуга не соответствует специализации мастера' });
  }
  const duration = service.duration || 60;
  const [hour, min] = time.split(':').map(Number);
  const newStart = hour * 60 + min;
  const newEnd = newStart + duration;
  const existing = await new Promise((resolve) => {
    db.all(`SELECT a.time, s.duration as dur 
             FROM appointments a 
             JOIN services s ON a.serviceId = s.id 
             WHERE a.masterId = ? AND a.date = ? AND a.status != 'cancelled'`,
             [masterId, date], (err, rows) => resolve(rows));
  });
  const hasConflict = existing.some(app => {
    const [h, m] = app.time.split(':').map(Number);
    const start = h * 60 + m;
    const end = start + (app.dur || 60);
    return (newStart < end && newEnd > start);
  });
  if (hasConflict) {
    return res.status(400).json({ error: 'Это время пересекается с другой записью' });
  }
  const status = req.body.status || 'pending';
    db.run(`INSERT INTO appointments (userId, serviceId, masterId, date, time, status, salonId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, serviceId, masterId, date, time, status, salonId],
    [userId, serviceId, masterId, date, time, salonId], function(err) {
      if (err) return res.status(500).json({ error: 'Ошибка записи' });
      res.json({ id: this.lastID });
    });
});

// ========== Обновление записи (админ) ==========
app.put('/api/admin/appointments/:id', auth, adminOnly, async (req, res) => {
  const { userId, serviceId, masterId, date, time, status, salonId } = req.body;
  const service = await new Promise((resolve) => {
    db.get(`SELECT category, duration FROM services WHERE id = ?`, [serviceId], (err, row) => resolve(row));
  });
  const master = await new Promise((resolve) => {
    db.get(`SELECT category FROM masters WHERE id = ?`, [masterId], (err, row) => resolve(row));
  });
  if (!service || !master || service.category !== master.category) {
    return res.status(400).json({ error: 'Услуга не соответствует специализации мастера' });
  }
  const duration = service.duration || 60;
  const [hour, min] = time.split(':').map(Number);
  const newStart = hour * 60 + min;
  const newEnd = newStart + duration;
  const existing = await new Promise((resolve) => {
    db.all(`SELECT a.time, s.duration as dur 
             FROM appointments a 
             JOIN services s ON a.serviceId = s.id 
             WHERE a.masterId = ? AND a.date = ? AND a.id != ? AND a.status != 'cancelled'`,
             [masterId, date, req.params.id], (err, rows) => resolve(rows));
  });
  const hasConflict = existing.some(app => {
    const [h, m] = app.time.split(':').map(Number);
    const start = h * 60 + m;
    const end = start + (app.dur || 60);
    return (newStart < end && newEnd > start);
  });
  if (hasConflict) {
    return res.status(400).json({ error: 'Это время пересекается с другой записью' });
  }
  db.run(`UPDATE appointments SET userId=?, serviceId=?, masterId=?, date=?, time=?, status=?, salonId=? WHERE id=?`,
    [userId, serviceId, masterId, date, time, status, salonId, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: 'Ошибка' });
      res.json({ message: 'Обновлено' });
    });
});

// ========== Отмена записи клиентом ==========
app.put('/api/appointments/:id/cancel', auth, (req, res) => {
  const { id } = req.params;
  db.get(`SELECT userId FROM appointments WHERE id = ?`, [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Запись не найдена' });
    if (row.userId !== req.userId) return res.status(403).json({ error: 'Доступ запрещён' });
    db.run(`UPDATE appointments SET status = 'cancelled' WHERE id = ?`, [id], (err) => {
      if (err) return res.status(500).json({ error: 'Ошибка отмены' });
      res.json({ message: 'Запись отменена' });
    });
  });
});

// ========== Удаление записи (админ) ==========
app.delete('/api/admin/appointments/:id', auth, adminOnly, (req, res) => {
  db.run(`DELETE FROM appointments WHERE id=?`, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Ошибка удаления' });
    res.json({ message: 'Удалено' });
  });
});

// ========== Запуск сервера ==========
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
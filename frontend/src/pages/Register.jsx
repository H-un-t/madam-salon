import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePhone = (phone) => {
    const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agree) {
      setError('Необходимо согласие на обработку персональных данных');
      return;
    }
    if (form.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    if (!validatePhone(form.phone)) {
      setError('Введите корректный номер телефона (например, 89191234567)');
      return;
    }

    setLoading(true);
    try {
      // 1. Регистрация
      await api.post('/register', form);
      
      // 2. Автоматический вход
      const loginRes = await api.post('/login', {
        email: form.email,
        password: form.password
      });
      
      // 3. Сохраняем токен и данные пользователя
      localStorage.setItem('token', loginRes.data.token);
      localStorage.setItem('user', JSON.stringify(loginRes.data.user));
      
      // 4. Переходим в личный кабинет
      navigate('/cabinet');
    } catch (err) {
      const serverError = err.response?.data?.error || err.response?.data?.message;
      if (serverError) {
        setError(serverError);
      } else if (err.response?.status === 400) {
        setError('Проверьте правильность заполнения полей (email или телефон могут быть уже заняты)');
      } else {
        setError('Ошибка сервера. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', margin: '50px auto' }}>
      <div className="form-card">
        <h2>Регистрация</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Имя"
            value={form.firstName}
            onChange={e => setForm({...form, firstName: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Фамилия"
            value={form.lastName}
            onChange={e => setForm({...form, lastName: e.target.value})}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
            required
          />
          <input
            type="tel"
            placeholder="Телефон"
            value={form.phone}
            onChange={e => setForm({...form, phone: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Пароль (мин. 6 символов)"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            required
          />
          <div className="checkbox-wrapper">
            <input
              type="checkbox"
              id="agree"
              checked={agree}
              onChange={e => setAgree(e.target.checked)}
            />
            <label htmlFor="agree">
              Я принимаю условия{' '}
              <Link to="/agreement" style={{ color: 'var(--red)' }}>
                пользовательского соглашения
              </Link>{' '}
              и согласен на обработку персональных данных
            </label>
          </div>
          <div className="form-footer">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
            <Link to="/login">Уже есть аккаунт? <span style={{ color: 'var(--red)' }}>Войти</span></Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
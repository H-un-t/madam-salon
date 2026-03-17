import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/cabinet');
    } catch (err) {
      setError('Неверный email или пароль');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', margin: '50px auto' }}>
      <div className="form-card">
        <h2>Вход</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required />
          <div className="form-footer">
            <button type="submit" className="btn">Войти</button>
            <Link to="/register">Нет аккаунта? <span style={{ color: 'var(--red)' }}>Зарегистрироваться</span></Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
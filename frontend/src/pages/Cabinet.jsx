import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Cabinet = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [editEmailMode, setEditEmailMode] = useState(false);
  const [editPasswordMode, setEditPasswordMode] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [emailForm, setEmailForm] = useState({ email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState({ text: '', type: '' });

  const userRole = JSON.parse(localStorage.getItem('user') || '{}').role;

  useEffect(() => {
    fetchUserData();
    fetchAppointments();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await api.get('/user');
      setUser(res.data);
      setProfileForm({
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        phone: res.data.phone
      });
      setEmailForm({ email: res.data.email });
    } catch (err) {
      setMessage({ text: 'Ошибка загрузки данных', type: 'error' });
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error('Ошибка загрузки записей', err);
    }
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
    return phoneRegex.test(phone);
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    if (!validatePhone(profileForm.phone)) {
      setMessage({ text: 'Введите корректный номер телефона', type: 'error' });
      return;
    }
    try {
      await api.put('/user', profileForm);
      setUser({ ...user, ...profileForm });
      localStorage.setItem('user', JSON.stringify({ ...user, ...profileForm, role: userRole }));
      setEditProfileMode(false);
      setMessage({ text: 'Профиль обновлён', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Ошибка обновления', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  const updateEmail = async (e) => {
    e.preventDefault();
    try {
      await api.put('/user/email', emailForm);
      setUser({ ...user, email: emailForm.email });
      localStorage.setItem('user', JSON.stringify({ ...user, email: emailForm.email, role: userRole }));
      setEditEmailMode(false);
      setMessage({ text: 'Email обновлён', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Ошибка обновления email', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      setMessage({ text: 'Пароль должен быть не менее 6 символов', type: 'error' });
      return;
    }
    try {
      await api.put('/user/password', passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setEditPasswordMode(false);
      setMessage({ text: 'Пароль изменён', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Ошибка смены пароля', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  if (!user) return <div className="container" style={{ padding: '40px', textAlign: 'center' }}>Загрузка...</div>;

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div className="cabinet-wrapper">
        <div className='cabinet-wrapper-hero' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <h1>Личный кабинет</h1>
          {userRole === 'admin' && (
            <Link to="/admin" className="btn">Админ панель</Link>
          )}
        </div>
        {message.text && (
          <div className={`success-msg ${message.type === 'error' ? 'error-msg' : ''}`} style={{ marginBottom: '20px' }}>
            {message.text}
          </div>
        )}

        <div className="cabinet-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
          <button className={activeTab === 'profile' ? 'active-tab' : ''} onClick={() => setActiveTab('profile')} style={{ padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', borderBottom: activeTab === 'profile' ? '2px solid var(--red)' : 'none' }}>Мои данные</button>
          <button className={activeTab === 'appointments' ? 'active-tab' : ''} onClick={() => setActiveTab('appointments')} style={{ padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', borderBottom: activeTab === 'appointments' ? '2px solid var(--red)' : 'none' }}>Мои записи</button>
        </div>

        {activeTab === 'profile' && (
          <div className="cabinet-card">
            <h2 style={{ marginBottom: '20px' }}>Мои данные</h2>
            {!editProfileMode && !editEmailMode && !editPasswordMode ? (
              <div className="user-info">
                <div className="info-row"><strong>Имя:</strong> {user.firstName}</div>
                <div className="info-row"><strong>Фамилия:</strong> {user.lastName}</div>
                <div className="info-row"><strong>Телефон:</strong> {user.phone}</div>
                <div className="info-row"><strong>Email:</strong> {user.email}</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
                  <button onClick={() => setEditProfileMode(true)} className="btn">Редактировать профиль</button>
                  <button onClick={() => setEditEmailMode(true)} className="btn">Сменить email</button>
                  <button onClick={() => setEditPasswordMode(true)} className="btn">Сменить пароль</button>
                </div>
              </div>
            ) : (
              <div>
                {editProfileMode && (
                  <form onSubmit={updateProfile} className="edit-form">
                    <h3>Редактирование профиля</h3>
                    <input value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} placeholder="Имя" required />
                    <input value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} placeholder="Фамилия" required />
                    <input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} placeholder="Телефон (11 цифр)" required />
                    <div className="form-buttons">
                      <button type="submit" className="btn">Сохранить</button>
                      <button type="button" onClick={() => setEditProfileMode(false)} className="btn cancel-btn">Отмена</button>
                    </div>
                  </form>
                )}
                {editEmailMode && (
                  <form onSubmit={updateEmail} className="edit-form">
                    <h3>Смена email</h3>
                    <input type="email" value={emailForm.email} onChange={e => setEmailForm({ email: e.target.value })} placeholder="Новый email" required />
                    <div className="form-buttons">
                      <button type="submit" className="btn">Изменить email</button>
                      <button type="button" onClick={() => setEditEmailMode(false)} className="btn cancel-btn">Отмена</button>
                    </div>
                  </form>
                )}
                {editPasswordMode && (
                  <form onSubmit={updatePassword} className="edit-form">
                    <h3>Смена пароля</h3>
                    <div className="password-wrapper">
                      <input type={showCurrentPassword ? 'text' : 'password'} value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} placeholder="Текущий пароль" required />
                    </div>
                    <div className="password-wrapper">
                      <input type={showNewPassword ? 'text' : 'password'} value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} placeholder="Новый пароль (мин. 6 символов)" required />
                    </div>
                    <div className="form-buttons">
                      <button type="submit" className="btn">Изменить пароль</button>
                      <button type="button" onClick={() => setEditPasswordMode(false)} className="btn cancel-btn">Отмена</button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="cabinet-card">
            <h2>Мои записи</h2>
            {appointments.length === 0 ? (
              <p>У вас пока нет записей.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                    <thead>
                    <tr style={{ borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Услуга</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Мастер</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Салон</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Дата</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Время</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Статус</th>
                    </tr>
                    </thead>
                    <tbody>
                    {appointments.map(app => (
                        <tr key={app.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px', wordBreak: 'normal' }}>{app.serviceName || '—'}</td>
                        <td style={{ padding: '10px', wordBreak: 'normal' }}>{app.masterName || '—'}</td>
                        <td style={{ padding: '10px', wordBreak: 'normal' }}>{app.salonName || 'Не указан'}</td>
                        <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>{app.date}</td>
                        <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>{app.time}</td>
                        <td style={{ padding: '10px' }}>
                            <span style={{ padding: '4px 8px', borderRadius: '5px', fontSize: '14px', background: app.status === 'pending' ? '#ffc107' : app.status === 'confirmed' ? '#28a745' : '#dc3545', color: 'white', display: 'inline-block', whiteSpace: 'nowrap' }}>
                            {app.status === 'pending' ? 'В ожидании' : app.status === 'confirmed' ? 'Подтверждена' : 'Отменена'}
                            </span>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cabinet;
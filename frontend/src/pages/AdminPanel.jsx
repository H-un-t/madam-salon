import { useEffect, useState } from 'react';
import api from '../api';
import AppointmentModal from '../components/AppointmentModal';
import ScheduleEditor from '../components/ScheduleEditor';
import ScheduleView from '../components/ScheduleView';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [masters, setMasters] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'user' });
  const [editingService, setEditingService] = useState(null);
  const [editingMaster, setEditingMaster] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleModalData, setScheduleModalData] = useState(null);
  const [refreshSchedule, setRefreshSchedule] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const triggerRefresh = () => setRefreshSchedule(prev => prev + 1);

  const fetchData = async () => {
    const [usersRes, servicesRes, mastersRes, appRes] = await Promise.all([
      api.get('/admin/users'),
      api.get('/services'),
      api.get('/masters'),
      api.get('/appointments')
    ]);
    setUsers(usersRes.data);
    setServices(servicesRes.data);
    setMasters(mastersRes.data);
    setAppointments(appRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const deleteUser = async (id) => {
    if (window.confirm('Удалить пользователя? Все его записи также будут удалены.')) {
      await api.delete(`/admin/users/${id}`);
      fetchData();
      triggerRefresh();
    }
  };
  const deleteService = async (id) => {
    if (window.confirm('Удалить услугу? Все связанные записи также будут удалены.')) {
      await api.delete(`/admin/services/${id}`);
      fetchData();
      triggerRefresh();
    }
  };
  const deleteMaster = async (id) => {
    if (window.confirm('Удалить мастера? Все его записи также будут удалены.')) {
      await api.delete(`/admin/masters/${id}`);
      fetchData();
      triggerRefresh();
    }
  };
  const deleteAppointment = async (id) => {
    if (window.confirm('Удалить запись?')) {
      await api.delete(`/admin/appointments/${id}`);
      fetchData();
      triggerRefresh();
    }
  };

  const addUser = async () => {
    if (!newUser.password || newUser.password.length < 6) {
      alert('Пароль должен быть не менее 6 символов');
      return;
    }
    try {
      await api.post('/admin/users', newUser);
      setShowAddUserModal(false);
      setNewUser({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'user' });
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.error || 'Ошибка создания пользователя';
      alert(msg);
    }
  };

  const updateUser = async (id, updated) => {
    try {
      await api.put(`/admin/users/${id}`, updated);
      fetchData();
      setEditingUser(null);
      setErrorMsg('');
    } catch (err) {
      const msg = err.response?.data?.error || 'Ошибка обновления пользователя';
      setErrorMsg(msg);
      alert(msg);
    }
  };

  const addService = async () => {
    await api.post('/admin/services', { name: 'Новая услуга', price: '1000 ₽', category: 'hairdresser', duration: 60 });
    fetchData();
  };
  const updateService = async (id, updated) => {
    await api.put(`/admin/services/${id}`, updated);
    fetchData();
    setEditingService(null);
  };
  const addMaster = async () => {
    await api.post('/admin/masters', {
      name: 'Новый мастер', category: 'hairdresser',
      description: 'Опытный мастер',
      schedule: JSON.stringify({ days: [], hours: { start: '10:00', end: '20:00' } }),
      salonId: 1
    });
    fetchData();
  };
  const updateMaster = async (id, updated) => {
    await api.put(`/admin/masters/${id}`, updated);
    fetchData();
    setEditingMaster(null);
  };
  const updateSchedule = async (id, schedule) => {
    await api.put(`/admin/masters/${id}`, { schedule: JSON.stringify(schedule) });
    fetchData();
    setEditingSchedule(null);
    triggerRefresh();
  };
  const saveAppointment = async (data) => {
    try {
      if (editingAppointment) {
        await api.put(`/admin/appointments/${editingAppointment.id}`, data);
      } else {
        await api.post('/appointments', data);
      }
      fetchData();
      triggerRefresh();
      setEditingAppointment(null);
      setModalOpen(false);
      setScheduleModalData(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка сохранения записи');
    }
  };

  const categoryRus = (cat) => {
    switch(cat) {
      case 'hairdresser': return 'Парикмахерские услуги';
      case 'manicure': return 'Ногтевой сервис';
      case 'cosmetologist': return 'Косметология';
      default: return cat;
    }
  };

  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;

  
  const UserEditForm = ({ user, onSave, onCancel }) => {
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [email, setEmail] = useState(user.email);
    const [phone, setPhone] = useState(user.phone);
    const [role, setRole] = useState(user.role);
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const isCurrentAdmin = user.id === currentUserId;

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLocalError('');
      const updated = { firstName, lastName, email, phone, role };
      if (password && password.length >= 6) updated.password = password;
      try {
        await onSave(user.id, updated);
      } catch (err) {
        setLocalError(err.response?.data?.error || 'Ошибка обновления');
      }
    };

    return (
      <div className="edit-modal">
        <h3>Редактировать пользователя</h3>
        <form onSubmit={handleSubmit}>
          <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Имя" required />
          <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Фамилия" required />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required type="email" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Телефон" required />
          <select value={role} onChange={e => setRole(e.target.value)} disabled={isCurrentAdmin}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          {isCurrentAdmin && <small style={{ color: 'red' }}>Нельзя изменить свою роль</small>}
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Новый пароль (оставьте пустым, чтобы не менять)" />
          <div className="modal-buttons">
            <button type="submit" className="btn">Сохранить</button>
            <button type="button" onClick={onCancel} className="btn cancel-btn">Отмена</button>
          </div>
        </form>
      </div>
    );
  };

  const ServiceEditForm = ({ service, onSave, onCancel }) => {
    const [name, setName] = useState(service.name);
    const [price, setPrice] = useState(service.price);
    const [category, setCategory] = useState(service.category);
    const [duration, setDuration] = useState(service.duration || 60);
    const handleSubmit = (e) => { e.preventDefault(); onSave(service.id, { name, price, category, duration: parseInt(duration) }); };
    return ( <div className="edit-modal"><h3>Редактировать услугу</h3><form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Название" required />
      <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Цена" required />
      <select value={category} onChange={e => setCategory(e.target.value)}>
        <option value="hairdresser">Парикмахерские услуги</option>
        <option value="manicure">Ногтевой сервис</option>
        <option value="cosmetologist">Косметология</option>
      </select>
      <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="Продолжительность (мин)" required />
      <div className="modal-buttons"><button type="submit" className="btn">Сохранить</button><button type="button" onClick={onCancel} className="btn cancel-btn">Отмена</button></div>
    </form></div> );
  };

  const MasterEditForm = ({ master, onSave, onCancel }) => {
    const [name, setName] = useState(master.name);
    const [category, setCategory] = useState(master.category);
    const [description, setDescription] = useState(master.description || '');
    const [salonId, setSalonId] = useState(master.salonId || 1);
    const [salons, setSalons] = useState([]);
    useEffect(() => { api.get('/salons').then(res => setSalons(res.data)); }, []);
    const handleSubmit = (e) => { e.preventDefault(); onSave(master.id, { name, category, description, salonId }); };
    return ( <div className="edit-modal"><h3>Редактировать мастера</h3><form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Имя" required />
      <select value={category} onChange={e => setCategory(e.target.value)}>
        <option value="hairdresser">Парикмахерские услуги</option>
        <option value="manicure">Ногтевой сервис</option>
        <option value="cosmetologist">Косметология</option>
      </select>
      <select value={salonId} onChange={e => setSalonId(Number(e.target.value))}>
        {salons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Описание" />
      <div className="modal-buttons"><button type="submit" className="btn">Сохранить</button><button type="button" onClick={onCancel} className="btn cancel-btn">Отмена</button></div>
    </form></div> );
  };

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>Админ панель</h1>
      <div className="admin-tabs">
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Пользователи</button>
        <button className={activeTab === 'services' ? 'active' : ''} onClick={() => setActiveTab('services')}>Услуги</button>
        <button className={activeTab === 'masters' ? 'active' : ''} onClick={() => setActiveTab('masters')}>Мастера</button>
        <button className={activeTab === 'appointments' ? 'active' : ''} onClick={() => setActiveTab('appointments')}>Записи</button>
      </div>

      {activeTab === 'users' && (
        <>
          <button onClick={() => setShowAddUserModal(true)} className="btn">+ Добавить пользователя</button>
          <div className="admin-table">
            <table><thead><tr><th>ID</th><th>Имя</th><th>Email</th><th>Телефон</th><th>Роль</th><th>Действия</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}><td>{u.id}</td><td>{u.firstName} {u.lastName}</td><td>{u.email}</td><td>{u.phone}</td><td>{u.role}</td>
                <td><button onClick={() => setEditingUser(u)}>✏️</button><button onClick={() => deleteUser(u.id)}>🗑️</button></td></tr>
              ))}
            </tbody></table>
          </div>
          {editingUser && <UserEditForm user={editingUser} onSave={updateUser} onCancel={() => setEditingUser(null)} />}
          {showAddUserModal && (
            <div className="edit-modal">
              <h3>Новый пользователь</h3>
              <input placeholder="Имя" value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} />
              <input placeholder="Фамилия" value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} />
              <input placeholder="Email" type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              <input placeholder="Телефон" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
              <input placeholder="Пароль" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}><option value="user">user</option><option value="admin">admin</option></select>
              <div className="modal-buttons"><button onClick={addUser} className="btn">Создать</button><button onClick={() => setShowAddUserModal(false)} className="btn cancel-btn">Отмена</button></div>
            </div>
          )}
        </>
      )}

      {activeTab === 'services' && (
        <>
          <button onClick={addService} className="btn">+ Добавить услугу</button>
          <div className="admin-table"><table><thead><tr><th>Название</th><th>Цена</th><th>Категория</th><th>Продолжительность</th><th>Действия</th></tr></thead>
          <tbody>{services.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.price}</td><td>{categoryRus(s.category)}</td><td>{s.duration || 60} мин</td>
          <td><button onClick={() => setEditingService(s)}>✏️</button><button onClick={() => deleteService(s.id)}>🗑️</button></td></tr>)}</tbody></table></div>
          {editingService && <ServiceEditForm service={editingService} onSave={updateService} onCancel={() => setEditingService(null)} />}
        </>
      )}

      {activeTab === 'masters' && (
        <>
          <button onClick={addMaster} className="btn">+ Добавить мастера</button>
          <div className="admin-table"><table><thead><tr><th>Имя</th><th>Категория</th><th>Описание</th><th>График</th><th>Салон</th><th>Действия</th></tr></thead>
          <tbody>{masters.map(m => {
            let schedule = { days: [], hours: { start: '10:00', end: '20:00' } };
            try { schedule = JSON.parse(m.schedule || '{}'); } catch(e) {}
            schedule.days = schedule.days || [];
            schedule.hours = schedule.hours || { start: '10:00', end: '20:00' };
            const scheduleStr = schedule.days.length ? `${schedule.days.join(', ')} ${schedule.hours.start}-${schedule.hours.end}` : 'Не задан';
            return <tr key={m.id}><td>{m.name}</td><td>{categoryRus(m.category)}</td><td>{m.description}</td><td>{scheduleStr}</td><td>{m.salonId}</td>
            <td><button onClick={() => setEditingMaster(m)}>✏️</button><button onClick={() => setEditingSchedule(m)}>📅 График</button><button onClick={() => deleteMaster(m.id)}>🗑️</button></td></tr>;
          })}</tbody></table></div>
          {editingMaster && <MasterEditForm master={editingMaster} onSave={updateMaster} onCancel={() => setEditingMaster(null)} />}
          {editingSchedule && <ScheduleEditor master={editingSchedule} onSave={updateSchedule} onClose={() => setEditingSchedule(null)} />}
        </>
      )}

      {activeTab === 'appointments' && (
        <ScheduleView
          masters={masters}
          services={services}
          users={users}
          onRefresh={triggerRefresh}
          onOpenModal={(prefillData, isEdit) => {
            if (isEdit) {
              setEditingAppointment(prefillData);
              setScheduleModalData(null);
            } else {
              setEditingAppointment(null);
              setScheduleModalData(prefillData);
            }
            setModalOpen(true);
          }}
          refreshTrigger={refreshSchedule}
        />
      )}

      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingAppointment(null); setScheduleModalData(null); }}
        onSave={saveAppointment}
        services={services}
        masters={masters}
        appointment={editingAppointment}
        prefillData={scheduleModalData}
      />
    </div>
  );
};

export default AdminPanel;
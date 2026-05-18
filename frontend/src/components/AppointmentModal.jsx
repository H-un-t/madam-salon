import { useState, useEffect } from 'react';
import api from '../api';

const AppointmentModal = ({ isOpen, onClose, onSave, services, masters, appointment, prefillData }) => {
  
  const getInitialForm = () => {
    if (appointment) {
      return {
        userId: appointment.userId || '',
        salonId: appointment.salonId || '',
        masterId: appointment.masterId || '',
        serviceId: appointment.serviceId || '',
        date: appointment.date || '',
        time: appointment.time || '',
        status: appointment.status || 'pending'
      };
    } else if (prefillData) {
      return {
        userId: '',
        salonId: prefillData.salonId || '',
        masterId: prefillData.masterId || '',
        serviceId: prefillData.serviceId || '',
        date: prefillData.date || '',
        time: prefillData.time || '',
        status: 'pending'
      };
    } else {
      return {
        userId: '',
        salonId: '',
        masterId: '',
        serviceId: '',
        date: '',
        time: '',
        status: 'pending'
      };
    }
  };

  const [form, setForm] = useState(getInitialForm());
  const [salons, setSalons] = useState([]);
  const [filteredMasters, setFilteredMasters] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [freeSlots, setFreeSlots] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  
  useEffect(() => {
    api.get('/salons').then(res => setSalons(res.data));
    api.get('/admin/users').then(res => setUsers(res.data));
  }, []);

  
  useEffect(() => {
    setForm(getInitialForm());
  }, [appointment, prefillData, isOpen]);

  
  useEffect(() => {
    if (form.salonId && masters.length) {
      const filtered = masters.filter(m => m.salonId == form.salonId);
      setFilteredMasters(filtered);
      if (!filtered.some(m => m.id == form.masterId)) {
        setForm(prev => ({ ...prev, masterId: '', serviceId: '', time: '' }));
      }
    } else {
      setFilteredMasters([]);
    }
  }, [form.salonId, masters]);

  
  useEffect(() => {
    if (form.masterId && services.length) {
      const selectedMaster = masters.find(m => m.id == form.masterId);
      if (selectedMaster) {
        const filtered = services.filter(s => s.category === selectedMaster.category);
        setFilteredServices(filtered);
        if (!filtered.some(s => s.id == form.serviceId)) {
          setForm(prev => ({ ...prev, serviceId: '' }));
        }
      }
    } else {
      setFilteredServices([]);
    }
  }, [form.masterId, masters, services]);

  
  useEffect(() => {
    const fetchSlots = async () => {
      if (form.masterId && form.date && form.serviceId && form.salonId) {
        setLoadingSlots(true);
        try {
          const res = await api.get(`/appointments/free-slots?masterId=${form.masterId}&date=${form.date}&serviceId=${form.serviceId}`);
          let slots = res.data.slots || [];
          
          if (appointment && appointment.time && !slots.includes(appointment.time)) {
            slots = [...slots, appointment.time].sort();
          }
          setFreeSlots(slots);
          
          if (appointment && appointment.time === form.time) {
            
          } else if (!slots.includes(form.time)) {
            setForm(prev => ({ ...prev, time: '' }));
          }
        } catch (err) {
          console.error(err);
          setFreeSlots([]);
        }
        setLoadingSlots(false);
      } else {
        setFreeSlots([]);
      }
    };
    fetchSlots();
  }, [form.masterId, form.date, form.serviceId, form.salonId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.time) {
      alert('Выберите время');
      return;
    }
    if (freeSlots.length && !freeSlots.includes(form.time)) {
      alert('Выбранное время недоступно');
      return;
    }
    onSave({ ...form, salonId: parseInt(form.salonId) });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <h3>{appointment ? 'Редактировать запись' : 'Новая запись'}</h3>
        <form onSubmit={handleSubmit}>
          <select value={form.userId} onChange={e => setForm({...form, userId: e.target.value})} required>
            <option value="">Выберите клиента</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>)}
          </select>

          <select value={form.salonId} onChange={e => setForm({...form, salonId: e.target.value, masterId: '', serviceId: '', time: ''})} required>
            <option value="">Выберите салон</option>
            {salons.map(s => <option key={s.id} value={s.id}>{s.name} ({s.address})</option>)}
          </select>

          <select value={form.masterId} onChange={e => setForm({...form, masterId: e.target.value, serviceId: '', time: ''})} required disabled={!form.salonId}>
            <option value="">Выберите мастера</option>
            {filteredMasters.map(m => <option key={m.id} value={m.id}>{m.name} ({m.category})</option>)}
          </select>

          <select value={form.serviceId} onChange={e => setForm({...form, serviceId: e.target.value, time: ''})} required disabled={!form.masterId}>
            <option value="">Выберите услугу</option>
            {filteredServices.map(s => <option key={s.id} value={s.id}>{s.name} - {s.price} ({s.duration || 60} мин)</option>)}
          </select>

          <option value="">Выберите время</option>
          <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value, time: ''})} required />

          {loadingSlots && <div>Загрузка свободных слотов...</div>}
          {freeSlots.length > 0 && !loadingSlots && (
            <div style={{ marginTop: '10px' }}>
              <label>Выберите время:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px,1fr))', gap: '8px', marginTop: '5px' }}>
                {freeSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setForm({...form, time: slot})}
                    style={{
                      padding: '8px',
                      background: form.time === slot ? 'var(--red)' : '#f0f0f0',
                      color: form.time === slot ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}
          {freeSlots.length === 0 && !loadingSlots && form.masterId && form.date && form.serviceId && form.salonId && (
            <div style={{ color: 'red', marginTop: '10px' }}>Нет свободных слотов на эту дату</div>
          )}

          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            <option value="pending">В ожидании</option>
            <option value="confirmed">Подтверждена</option>
            <option value="cancelled">Отменена</option>
          </select>

          <div className="modal-buttons">
            <button type="submit" className="btn">Сохранить</button>
            <button type="button" onClick={onClose} className="btn cancel-btn">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
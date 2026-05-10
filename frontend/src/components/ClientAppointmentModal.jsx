import { useState, useEffect } from 'react';
import api from '../api';

const ClientAppointmentModal = ({ isOpen, onClose, userId }) => {
  const [salons, setSalons] = useState([]);
  const [masters, setMasters] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    salonId: '',
    masterId: '',
    serviceId: '',
    date: '',
    time: ''
  });
  const [filteredMasters, setFilteredMasters] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [freeSlots, setFreeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        api.get('/salons'),
        api.get('/masters'),
        api.get('/services')
      ]).then(([salonsRes, mastersRes, servicesRes]) => {
        setSalons(salonsRes.data);
        setMasters(mastersRes.data);
        setServices(servicesRes.data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [isOpen]);

  
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
      if (form.masterId && form.date && form.serviceId) {
        setLoadingSlots(true);
        try {
          const res = await api.get(`/appointments/free-slots?masterId=${form.masterId}&date=${form.date}&serviceId=${form.serviceId}`);
          setFreeSlots(res.data.slots || []);
          if (!res.data.slots.includes(form.time)) {
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
  }, [form.masterId, form.date, form.serviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.time) {
      alert('Выберите время');
      return;
    }
    try {
      await api.post('/appointments', {
        salonId: parseInt(form.salonId),
        masterId: parseInt(form.masterId),
        serviceId: parseInt(form.serviceId),
        date: form.date,
        time: form.time
      });
      setSuccess('Запись успешно создана!');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка записи');
    }
  };

  if (!isOpen) return null;
  if (loading) return <div className="modal-overlay"><div className="modal-content">Загрузка...</div></div>;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <h3>Запись на услугу</h3>
        {success && <div className="success-msg">{success}</div>}
        <form onSubmit={handleSubmit}>
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
          {freeSlots.length === 0 && !loadingSlots && form.masterId && form.date && form.serviceId && (
            <div style={{ color: 'red', marginTop: '10px' }}>Нет свободных слотов на эту дату</div>
          )}

          <div className="modal-buttons">
            <button type="submit" className="btn">Записаться</button>
            <button type="button" onClick={onClose} className="btn cancel-btn">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientAppointmentModal;
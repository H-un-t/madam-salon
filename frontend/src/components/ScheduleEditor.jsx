import { useState } from 'react';
import api from '../api';

const ScheduleEditor = ({ master, onSave, onClose }) => {
  const [schedule, setSchedule] = useState(() => {
    try {
      const parsed = JSON.parse(master.schedule || '{}');
      return {
        days: parsed.days || [],
        hours: parsed.hours || { start: '10:00', end: '20:00' }
      };
    } catch {
      return { days: [], hours: { start: '10:00', end: '20:00' } };
    }
  });
  const [loading, setLoading] = useState(false);
  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const toggleDay = (day) => {
    setSchedule(prev => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        name: master.name,
        category: master.category,
        description: master.description || '',
        schedule: JSON.stringify(schedule),
        salonId: master.salonId || 1
      };
      await api.put(`/admin/masters/${master.id}`, payload);
      onSave(master.id, schedule);
    } catch (err) {
      console.error('Ошибка сохранения графика:', err.response?.data || err);
      alert('Ошибка: ' + (err.response?.data?.error || 'Не удалось сохранить график'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-modal">
      <h3>График работы мастера: {master.name}</h3>
      <label>Рабочие дни:</label>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '10px 0' }}>
        {daysOfWeek.map(day => (
          <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input type="checkbox" checked={schedule.days.includes(day)} onChange={() => toggleDay(day)} /> {day}
          </label>
        ))}
      </div>
      <label>Часы работы:</label>
      <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
        <input type="time" value={schedule.hours.start} onChange={e => setSchedule({...schedule, hours: {...schedule.hours, start: e.target.value}})} />
        <span>—</span>
        <input type="time" value={schedule.hours.end} onChange={e => setSchedule({...schedule, hours: {...schedule.hours, end: e.target.value}})} />
      </div>
      <div className="modal-buttons">
        <button onClick={handleSave} className="btn" disabled={loading}>Сохранить график</button>
        <button onClick={onClose} className="btn cancel-btn">Отмена</button>
      </div>
    </div>
  );
};

export default ScheduleEditor;
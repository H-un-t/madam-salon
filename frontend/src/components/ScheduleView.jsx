import React, { useState, useEffect } from 'react';
import api from '../api';
import { buildScheduleDates, getScheduleEndDate } from './scheduleDates';

const ScheduleView = ({ masters, services, users, onRefresh, onOpenModal, refreshTrigger }) => {
  const [salons, setSalons] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState('');
  const [selectedMaster, setSelectedMaster] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1);
    return d.toISOString().split('T')[0];
  });
  const [weeks, setWeeks] = useState(2);
  const [scheduleData, setScheduleData] = useState({});
  const [masterSchedule, setMasterSchedule] = useState(null);
  const [filteredMasters, setFilteredMasters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/salons').then(res => setSalons(res.data));
  }, []);

  useEffect(() => {
    if (selectedSalon) {
      const filtered = masters.filter(m => m.salonId == selectedSalon);
      setFilteredMasters(filtered);
      if (!filtered.some(m => m.id == selectedMaster)) setSelectedMaster('');
    } else {
      setFilteredMasters([]);
      setSelectedMaster('');
    }
  }, [selectedSalon, masters]);

  
  useEffect(() => {
    if (!selectedMaster) return;
    const fetchSchedule = async () => {
      setLoading(true);
      const endDateStr = getScheduleEndDate(startDate, weeks);
      try {
        const res = await api.get(`/appointments/schedule?masterId=${selectedMaster}&startDate=${startDate}&endDate=${endDateStr}`);
        const grouped = {};
        
        res.data.forEach(app => {
          if (!grouped[app.date]) grouped[app.date] = [];
          grouped[app.date].push({
            ...app,
            duration: app.duration || 60
          });
        });
        setScheduleData(grouped);
        const master = masters.find(m => m.id == selectedMaster);
        if (master) {
          let sched = { days: [], hours: { start: '10:00', end: '20:00' } };
          try { sched = JSON.parse(master.schedule || '{}'); } catch(e) {}
          setMasterSchedule(sched);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [selectedMaster, startDate, weeks, masters, refreshTrigger]);

  const getDates = () => {
    return buildScheduleDates(startDate, weeks);
  };

  const getTimeSlots = () => {
    if (!masterSchedule) return [];
    const slots = [];
    const [startH, startM] = masterSchedule.hours.start.split(':').map(Number);
    const [endH, endM] = masterSchedule.hours.end.split(':').map(Number);
    let current = startH * 60 + startM;
    const end = endH * 60 + endM;
    while (current < end) {
      const hour = Math.floor(current / 60);
      const min = current % 60;
      slots.push(`${hour.toString().padStart(2,'0')}:${min.toString().padStart(2,'0')}`);
      current += 30;
    }
    return slots;
  };

  
  const isSlotBusy = (date, time) => {
    const appointmentsOnDate = scheduleData[date] || [];
    const [slotHour, slotMin] = time.split(':').map(Number);
    const slotStart = slotHour * 60 + slotMin;
    
    return appointmentsOnDate.some(app => {
      const [appHour, appMin] = app.time.split(':').map(Number);
      const appStart = appHour * 60 + appMin;
      const appEnd = appStart + (app.duration || 60);
      return slotStart >= appStart && slotStart < appEnd;
    });
  };

  const getAppointmentForSlot = (date, time) => {
    
    const appointmentsOnDate = scheduleData[date] || [];
    return appointmentsOnDate.find(app => app.time === time);
  };

  const deleteAppointment = async (id) => {
    if (window.confirm('Удалить запись?')) {
      try {
        await api.delete(`/admin/appointments/${id}`);
        onRefresh();
      } catch (err) {
        alert('Ошибка удаления');
      }
    }
  };

  const createNewAppointment = () => {
    const prefill = selectedMaster ? { salonId: selectedSalon, masterId: selectedMaster } : null;
    onOpenModal(prefill, false);
  };

  const dates = getDates();
  const timeSlots = getTimeSlots();

  return (
    <div>
      <div style={{ marginBottom: 20, display: 'flex', gap: 15, flexWrap: 'wrap', alignItems: 'center', padding: '15px', background: '#f8f9fa', borderRadius: 12 }}>
        <div>
          <label style={{ fontWeight: 500 }}>Салон: </label>
          <select value={selectedSalon} onChange={e => setSelectedSalon(e.target.value)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ced4da', marginLeft: 8 }}>
            <option value="">-- Выберите салон --</option>
            {salons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 500 }}>Мастер: </label>
          <select value={selectedMaster} onChange={e => setSelectedMaster(e.target.value)} disabled={!selectedSalon} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ced4da', marginLeft: 8 }}>
            <option value="">-- Выберите мастера --</option>
            {filteredMasters.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 500 }}>Начало недели: </label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ced4da', marginLeft: 8 }} />
        </div>
        <div>
          <label style={{ fontWeight: 500 }}>Недель: </label>
          <select value={weeks} onChange={e => setWeeks(Number(e.target.value))} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ced4da', marginLeft: 8 }}>
            <option value={1}>1 неделя</option>
            <option value={2}>2 недели</option>
          </select>
        </div>
        <button onClick={createNewAppointment} className="btn" style={{ marginLeft: 'auto' }}>+ Создать запись</button>
      </div>

      {loading && <div>Загрузка расписания...</div>}
      {!loading && selectedMaster && masterSchedule && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 800, fontSize: 14 }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #dee2e6', padding: 10, background: '#e9ecef' }}>Время / Дата</th>
                {dates.map(date => (
                  <th key={date} style={{ border: '1px solid #dee2e6', padding: 10, background: '#e9ecef', textAlign: 'center' }}>
                    {new Date(date).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'numeric' })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(time => (
                <tr key={time}>
                  <td style={{ border: '1px solid #dee2e6', padding: 8, background: '#f8f9fa', textAlign: 'center' }}>{time}</td>
                  {dates.map(date => {
                    const dayOfWeek = new Date(date).getDay();
                    const dayNames = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
                    const isWorkingDay = masterSchedule.days.includes(dayNames[dayOfWeek]);
                    if (!isWorkingDay) {
                      return <td key={date} style={{ border: '1px solid #dee2e6', padding: 8, background: '#e9ecef', textAlign: 'center' }}>—</td>;
                    }
                    const busy = isSlotBusy(date, time);
                    const appointment = getAppointmentForSlot(date, time);
                    if (busy && appointment) {
                      return (
                        <td key={date} style={{ border: '1px solid #dee2e6', padding: 8, background: '#ffe6e6' }}>
                          <div><strong>{appointment.firstName} {appointment.lastName}</strong></div>
                          <div>{appointment.serviceName}</div>
                          <div style={{ fontSize: 12, color: appointment.status === 'confirmed' ? 'green' : 'orange' }}> {appointment.status === 'pending' ? 'В ожидании' : appointment.status === 'confirmed' ? 'Подтверждена' : 'Отменена'} </div>
                          <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
                            <button onClick={() => onOpenModal(appointment, true)}  style={{ padding: '2px 6px', fontSize: 12 }}>✏️</button>
                            <button onClick={() => deleteAppointment(appointment.id)}  style={{ padding: '2px 6px', fontSize: 12 }}>🗑️</button>
                          </div>
                        </td>
                      );
                    } else if (busy && !appointment) {
                      // Слот занят из-за пересечения с предыдущей записью (например, 10:30 при записи на 10:00 длительностью 60 мин)
                      return <td key={date} style={{ border: '1px solid #dee2e6', padding: 8, background: '#f9d2d2', textAlign: 'center', color: '#424242ff' }}>занято</td>;
                    } else {
                      return <td key={date} style={{ border: '1px solid #dee2e6', padding: 8, background: '#eaffea', textAlign: 'center' }}>свободно</td>;
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!selectedMaster && !loading && (
        <div style={{ textAlign: 'center', padding: 30, color: '#6c757d' }}>Выберите салон и мастера для отображения расписания</div>
      )}
    </div>
  );
};

export default ScheduleView;

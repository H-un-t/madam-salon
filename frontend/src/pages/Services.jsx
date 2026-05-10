import { useEffect, useState } from 'react';
import api from '../api';
import { Helmet } from 'react-helmet-async';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch (err) {
      console.error('Ошибка загрузки услуг', err);
    } finally {
      setLoading(false);
    }
  };

  
  const getServicesByCategory = (category) => {
    return services.filter(service => service.category === category);
  };

  
  const categoryNames = {
    hairdresser: 'Услуги парикмахера',
    manicure: 'Услуги мастера маникюра и педикюра',
    cosmetologist: 'Услуги косметолога'
  };

  if (loading) return <div className="container" style={{ padding: '40px', textAlign: 'center' }}>Загрузка...</div>;

  return (
    <>
      <Helmet>
        <title>Услуги и цены | Салон красоты Мадам</title>
        <meta name="description" content="Полный перечень услуг и цен: парикмахерские услуги, маникюр, педикюр, косметология. Профессиональный уход за вашей красотой." />
      </Helmet>

      <div className="container" style={{ padding: '40px 0' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem' }}>Услуги и цены</h1>
        
        {['hairdresser', 'manicure', 'cosmetologist'].map(cat => {
          const categoryServices = getServicesByCategory(cat);
          if (categoryServices.length === 0) return null;
          return (
            <div key={cat} style={{ marginBottom: '50px' }}>
              <h2 style={{ 
                fontSize: '1.8rem', 
                color: 'var(--red)', 
                borderLeft: '4px solid var(--red)', 
                paddingLeft: '15px',
                marginBottom: '25px'
              }}>
                {categoryNames[cat]}
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {categoryServices.map(service => (
                  <div key={service.id} className="service-card" style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                  }}>
                    <h3 style={{ marginBottom: '10px', fontSize: '1.3rem' }}>{service.name}</h3>
                    <p style={{ color: 'var(--red)', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px' }}>{service.price}</p>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                      ⏱ Продолжительность: {service.duration || 60} мин
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Services;
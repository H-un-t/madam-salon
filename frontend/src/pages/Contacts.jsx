import { Helmet } from 'react-helmet-async';

const Contacts = () => {
  const locations = [
    {
      name: 'Салон на пр. Еременко 90/27',
      address: 'г. Ростов-на-Дону, пр. Еременко 90/27',
      phone: '210-3-210',
      coords: [47.231459, 39.599795], 
      zoom: 17
    },
    {
      name: 'Салон на пр. Горшкова 2а',
      address: 'г. Ростов-на-Дону, пр. Горшкова 2а',
      phone: '206-0-206',
      coords: [47.258400, 39.642222],
      zoom: 17
    }
  ];

  // Функция генерации URL Яндекс.Карты для iframe
  const getYandexMapSrc = (lat, lon, zoom) => {
    // Используем API Яндекс.Карт с меткой
    return `https://yandex.ru/map-widget/v1/?ll=${lon},${lat}&z=${zoom}&pt=${lon},${lat},pm2rdm`;
  };

  // Ссылка для построения маршрута на Яндекс.Картах
  const getRouteLink = (lat, lon) => {
    return `https://yandex.ru/maps/?rtext=~${lat},${lon}&rtt=auto`;
  };

  return (
    <>
      <Helmet>
        <title>Контакты | Салон красоты Мадам</title>
        <meta name="description" content="Адреса и телефоны салонов красоты Мадам в Ростове-на-Дону: пр. Еременко 90/27 и пр. Горшкова 2а. Схема проезда, карта." />
      </Helmet>

      <div className="container" style={{ padding: '40px 0' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Контакты</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
          {locations.map((loc, idx) => (
            <div key={idx} style={{
              background: 'white',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s',
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {/* Информационный блок */}
                <div style={{
                  flex: '1',
                  minWidth: '250px',
                  padding: '30px',
                  background: 'linear-gradient(135deg, #fff 0%, #f8f8f8 100%)'
                }}>
                  <h2 style={{ color: 'var(--red)', marginBottom: '15px' }}>{loc.name}</h2>
                  <p style={{ marginBottom: '10px', fontSize: '18px' }}>
                    📍 <strong>Адрес:</strong> {loc.address}
                  </p>
                  <p style={{ marginBottom: '20px', fontSize: '18px' }}>
                    📞 <strong>Телефон:</strong> {loc.phone}
                  </p>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <a href={`tel:${loc.phone.replace(/-/g, '')}`} className="btn" style={{ background: 'var(--red)' }}>
                      Позвонить
                    </a>
                    <a 
                      href={getRouteLink(loc.coords[0], loc.coords[1])}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn" 
                      style={{ background: '#6c757d' }}
                    >
                      Построить маршрут
                    </a>
                  </div>
                </div>
                
                {/* Яндекс.Карта */}
                <div style={{ flex: '1.5', minWidth: '300px', height: '350px' }}>
                  <iframe
                    title={`map-${idx}`}
                    src={getYandexMapSrc(loc.coords[0], loc.coords[1], loc.zoom)}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Дополнительный блок с режимом работы */}
        <div style={{
          marginTop: '50px',
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: 'var(--red)', marginBottom: '15px' }}>Режим работы обоих салонов</h3>
          <p style={{ fontSize: '18px' }}>Пн-Вс – 10:00-20:00</p>
          <p style={{ marginTop: '20px', color: '#666' }}>Ждём вас в наших уютных салонах!</p>
        </div>
      </div>
    </>
  );
};

export default Contacts;
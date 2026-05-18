import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Мадам - салон красоты в Ростове-на-Дону</title>
        <meta name="description" content="Салон красоты Мадам: стрижки, маникюр, косметология. Уютная атмосфера, профессиональные мастера. Два салона в Ростове-на-Дону." />
        <meta property="og:title" content="Салон красоты Мадам" />
        <meta property="og:image" content="/images/hero.jpg" />
      </Helmet>

      
      <div style={{
        backgroundImage: 'url(/images/hero-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.4)',
          padding: '20px',
          borderRadius: '15px',
          backdropFilter: 'blur(3px)'
        }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span>Салон красоты</span>
            <img 
              src="/images/logo.png" 
              alt="Мадам" 
              style={{ height: '1.9em', width: 'auto', verticalAlign: 'middle', display: 'inline-block' }} 
            />
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)' }}>Ваша красота — наша забота</p>
        </div>
      </div>

      <div className="container">
        
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '30px',
          margin: '60px 0',
          justifyContent: 'center'
        }}>
          <div style={{
            flex: 1,
            minWidth: '250px',
            background: 'white',
            padding: '25px',
            borderRadius: '15px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
            transition: 'transform 0.3s',
          }}>
            <h2 style={{ fontSize: '28px', marginBottom: '15px', color: 'var(--red)' }}>Наши салоны</h2>
            <p style={{ fontSize: '20px' }}><strong>пр. Еременко 90/27</strong><br />📞 210-3-210</p>
            <p style={{ fontSize: '20px', marginTop: '10px' }}><strong>пр. Горшкова 2а</strong><br />📞 206-0-206</p>
          </div>
          <div style={{
            flex: 1,
            minWidth: '250px',
            background: 'white',
            padding: '25px',
            borderRadius: '15px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
            transition: 'transform 0.3s',
          }}>
            <h2 style={{ fontSize: '28px', marginBottom: '15px', color: 'var(--red)' }}>Время работы</h2>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>Пн-Вс – 10:00-20:00</p>
            <p style={{ marginTop: '10px', color: '#555' }}>Без выходных</p>
          </div>
        </div>

        {/* Наши услуги (кратко) */}
        <h2 style={{ textAlign: 'center', fontSize: '32px', margin: '40px 0 10px' }}>Наши услуги</h2>
        <p style={{ textAlign: 'center', marginBottom: '40px', fontSize: '18px', color: '#555' }}>
          У нас Вы найдете услуги, необходимые для поддержания здоровья и красоты
        </p>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '30px',
          justifyContent: 'center'
        }}>
          <div style={{
            maxWidth: '300px',
            textAlign: 'center',
            background: 'white',
            borderRadius: '15px',
            overflow: 'hidden',
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
            transition: 'transform 0.3s',
          }}>
            <img src="/images/hair.jpg" alt="Уход за волосами" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <div style={{ padding: '20px' }}>
              <h3>Уход за волосами</h3>
              <p style={{ padding: '10px' }}>Стрижка, укладка, окрашивание, милирование волос </p>
              <Link to="/portfolio#hairdresser" className="btn">Подробнее</Link>
            </div>
          </div>
          <div style={{
            maxWidth: '300px',
            textAlign: 'center',
            background: 'white',
            borderRadius: '15px',
            overflow: 'hidden',
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
          }}>
            <img src="/images/nails.jpg" alt="Ногтевой сервис" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <div style={{ padding: '20px' }}>
              <h3>Ногтевой сервис</h3>
              <p style={{ padding: '10px' }}>Маникюр, педикюр, наращивание ногтей</p>
              <Link to="/portfolio#manicure" className="btn">Подробнее</Link>
            </div>
          </div>
          <div style={{
            maxWidth: '300px',
            textAlign: 'center',
            background: 'white',
            borderRadius: '15px',
            overflow: 'hidden',
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
          }}>
            <img src="/images/cosmo.jpg" alt="Косметик" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <div style={{ padding: '20px' }}>
              <h3>Косметология</h3>
              <p style={{ padding: '10px' }}>Комплексный уход, пилинг, чистка лица</p>
              <Link to="/portfolio#cosmetologist" className="btn">Подробнее</Link>
            </div>
          </div>
        </div>

        
        <div style={{
          margin: '80px 0',
          background: 'linear-gradient(135deg, #ebebebff 0%, #e9ecef 100%)',
          borderRadius: '30px',
          padding: '40px 30px',
        }}>
          <h2 style={{ fontSize: '32px', marginBottom: '20px', textAlign: 'center' }}>Давайте знакомиться!</h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '40px',
            alignItems: 'start',
            justifyContent: 'center'
          }}>
            <div style={{ flex: 1.2, minWidth: '280px' }}>
              <p style={{ lineHeight: 1.7, fontSize: '20px', textAlign: 'justify' }}>
                Мы рады приветствовать вас в нашем уютном салоне, где царит атмосфера спокойствия и доверия. Для нас «Мадам» — это место, куда хочется возвращаться, как к хорошему другу, который всегда поможет выглядеть безупречно и чувствовать себя прекрасно.
                <br /><br />
                Наша философия проста: нет неважных деталей. Мы с одинаковым вниманием относимся и к выбору оттенка для вашего нового образа, и к стерильности инструментов, и к удобству кресла. Наша команда мастеров постоянно учится, чтобы предлагать вам современные и эффективные решения в области парикмахерского искусства, ногтевого сервиса, косметологии и спа-ухода.
                <br /><br />
                Здесь вас всегда выслушают, дадут профессиональный совет и создадут именно тот результат, о котором вы мечтаете. Потому что ваша красота и удовлетворение — наш главный успех.
              </p>
            </div>
            <div style={{ flex: 0.8, minWidth: '250px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <img src="/images/salon1.jpg" alt="Салон на Еременко" style={{ width: '100%', borderRadius: '20px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }} />
                <img src="/images/salon2.jpg" alt="Салон на Горшкова" style={{ width: '100%', borderRadius: '20px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
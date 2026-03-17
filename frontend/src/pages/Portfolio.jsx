import { Helmet } from 'react-helmet-async';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// ВРЕМЕННЫЕ ЗАГЛУШКИ – замените на реальные пути к изображениям
const hairdresserImages = [
  '/images/hair1.jpg', '/images/hair2.jpg', '/images/hair3.jpg',
  '/images/hair4.jpg', '/images/hair5.jpg', '/images/hair6.jpg'
];
const manicureImages = [
  '/images/nail1.jpg', '/images/nail2.jpg', '/images/nail3.jpg',
  '/images/nail4.jpg', '/images/nail5.jpg', '/images/nail6.jpg'
];
const cosmetologistImages = [
  '/images/cosmo1.jpg', '/images/cosmo2.jpg', '/images/cosmo3.jpg',
  '/images/cosmo4.jpg', '/images/cosmo5.jpg', '/images/cosmo6.jpg'
];

const Portfolio = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          arrows: true
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,   // на мобильных отключаем стрелки, остаются только точки
          dots: true
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Портфолио мастеров | Салон красоты Мадам</title>
        <meta name="description" content="Фотографии работ наших парикмахеров, мастеров маникюра и косметологов. Реальные примеры стрижек, окрашивания, маникюра, педикюра и косметологических процедур." />
      </Helmet>

      <div className="container" style={{ padding: '40px 0' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Портфолио наших мастеров</h1>
        <p style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 50px auto', color: '#555', fontSize: '18px' }}>
          Вдохновляйтесь и выбирайте свой образ. Наше портфолио — это честная история о мастерстве и внимании к деталям.
        </p>
        <div id="hairdresser" style={{ marginBottom: '60px', scrollMarginTop: '80px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--red)' }}>Работы парикмахеров</h2>
          <div className="portfolio-slider-wrapper">
            <Slider {...settings}>
              {hairdresserImages.map((img, idx) => (
                <div key={idx}>
                  <div className="slider-image-wrapper">
                    <img src={img} alt={`Парикмахерская работа ${idx + 1}`} />
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>

        <div id="manicure" style={{ marginBottom: '60px', scrollMarginTop: '80px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--red)' }}>Работы мастера маникюра и педикюра</h2>
          <div className="portfolio-slider-wrapper">
            <Slider {...settings}>
              {manicureImages.map((img, idx) => (
                <div key={idx}>
                  <div className="slider-image-wrapper">
                    <img src={img} alt={`Маникюр/педикюр работа ${idx + 1}`} />
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>

        <div id="cosmetologist" style={{ marginBottom: '60px', scrollMarginTop: '80px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--red)' }}>Работы косметологов</h2>
          <div className="portfolio-slider-wrapper">
            <Slider {...settings}>
              {cosmetologistImages.map((img, idx) => (
                <div key={idx}>
                  <div className="slider-image-wrapper">
                    <img src={img} alt={`Косметология работа ${idx + 1}`} />
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </>
  );
};

export default Portfolio;
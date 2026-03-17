import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const ImageSlider = ({ images }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true
  };
  return (
    <div style={{ maxWidth: '300px', margin: '0 auto' }}>
      <Slider {...settings}>
        {images.map((img, idx) => (
          <div key={idx}>
            <img src={img} alt={`work-${idx}`} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ImageSlider;
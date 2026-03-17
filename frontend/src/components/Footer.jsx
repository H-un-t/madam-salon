import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div>
          <h4>Контакты</h4>
          <p>📞 210-3-210 — пр. Еременко 90/27</p>
          <p>📞 206-0-206 — пр. Горшкова 2а</p>
        </div>
        <div>
          <h4>Навигация</h4>
          <ul>
            <li><Link to="/">О салоне</Link></li>
            <li><Link to="/services">Услуги</Link></li>
            <li><Link to="/portfolio">Портфолио</Link></li>
            <li><Link to="/contacts">Контакты</Link></li>
            <li><Link to="/agreement">Пользовательское соглашение</Link></li>
          </ul>
        </div>
        <div>
          <h4>Адреса</h4>
          <p>г. Ростов-на-Дону, пр. Еременко 90/27</p>
          <p>г. Ростов-на-Дону, пр. Горшкова 2а</p>
        </div>
      </div>
      <div className="copyright">© 2026 Салон красоты «Мадам»</div>
    </footer>
  );
};

export default Footer;
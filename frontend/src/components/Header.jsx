import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ClientAppointmentModal from './ClientAppointmentModal';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  const closeMenu = () => setMenuOpen(false);
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    closeMenu();
  };

  const handleLinkClick = () => closeMenu();
  const openBookingModal = () => setShowBookingModal(true);
  const closeBookingModal = () => setShowBookingModal(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <>
      <header className="header">
        <div className="container">
          <Link to="/" className="logo" onClick={closeMenu}>
            <img src="/images/logo.png" alt="Салон красоты Мадам" className="logo-img" />
          </Link>
          
          <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </div>
          
          <nav className={`nav-links ${menuOpen ? 'active' : ''}`}>
            <Link to="/" onClick={handleLinkClick}>О салоне</Link>
            <Link to="/services" onClick={handleLinkClick}>Услуги и цены</Link>
            <Link to="/portfolio" onClick={handleLinkClick}>Портфолио</Link>
            <Link to="/contacts" onClick={handleLinkClick}>Контакты</Link>
            
            {!token ? (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-auth" onClick={handleLinkClick}>Вход</Link>
                <Link to="/register" className="btn btn-auth" onClick={handleLinkClick}>Регистрация</Link>
              </div>
            ) : (
              <>
                <Link to="/cabinet" onClick={handleLinkClick}>Личный кабинет</Link>
                <button onClick={openBookingModal} className="btn btn-auth">Записаться онлайн</button>
                <button onClick={logout} className="btn btn-logout">Выйти</button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Модальное окно записи для клиента */}
      {showBookingModal && (
        <ClientAppointmentModal 
          isOpen={showBookingModal}
          onClose={closeBookingModal}
          userId={user.id}
        />
      )}
    </>
  );
};

export default Header;
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import Contacts from './pages/Contacts';
import Login from './pages/Login';
import Register from './pages/Register';
import Cabinet from './pages/Cabinet';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Agreement from './pages/Agreement';

function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cabinet" element={<ProtectedRoute><Cabinet /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminPanel /></AdminRoute></ProtectedRoute>} />
        <Route path="/agreement" element={<Agreement />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
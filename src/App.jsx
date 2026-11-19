import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import WalletsPage from './pages/WalletsPage';
import SalesPage from './pages/SalesPage';
import ReportsPage from './pages/ReportsPage';
import MachinesPage from './pages/MachinesPage';

// الشريط السفلي زي الصورة بالظبط
const BottomNav = () => {
  const location = useLocation();
  return (
    <div className="bottom-nav">
      <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <i className="fas fa-chart-pie"></i>
        <span>التقارير</span>
      </Link>
      <Link to="/wallets" className={`nav-item ${location.pathname === '/wallets' ? 'active' : ''}`}>
        <i className="fas fa-wallet"></i>
        <span>المحافظ</span>
      </Link>
      <Link to="/sales" className={`nav-item ${location.pathname === '/sales' ? 'active' : ''}`}>
        <i className="fas fa-shopping-cart"></i>
        <span>مبيعات</span>
      </Link>
      <Link to="/machines" className={`nav-item ${location.pathname === '/machines' ? 'active' : ''}`}>
        <i className="fas fa-cash-register"></i>
        <span>المكن</span>
      </Link>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      
      {/* الشريط العلوي */}
      <div className="top-header">
        <h1 className="text-xl font-bold">Fazlaka Pay</h1>
        <button className="text-2xl"><i className="fas fa-bars"></i></button>
      </div>

      {/* محتوى الشاشات */}
      <div className="p-4 max-w-md mx-auto">
        <Routes>
          <Route path="/" element={<ReportsPage />} />
          <Route path="/wallets" element={<WalletsPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/machines" element={<MachinesPage />} />
        </Routes>
      </div>

      <BottomNav />
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import SubmitPage from './pages/SubmitPage';
import StatusPage from './pages/StatusPage';
import AdminPage from './pages/AdminPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <img src="/FabLab.png" alt="FabLab Logo" style={{ height: '36px', width: 'auto', transform: 'scale(1.5)', transformOrigin: 'left center' }} />
            <span className="nav-title">3D Print Lab</span>
          </div>
          <div className="nav-links">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Submit Request
            </NavLink>
            <NavLink to="/status" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Check Status
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active admin-link' : 'nav-link admin-link'}>
              Admin
            </NavLink>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<SubmitPage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>SJSU FabLab 3D Printing Lab — Request Management System</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

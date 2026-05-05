import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Timer from './components/Timer';
import Logs from './components/Logs';
import Projects from './components/Projects';
import NavBar from './components/NavBar';
// IMPORTING THE NEW COMPONENT
import AdminPanel from './components/AdminPanel'; 


const getAuthToken = () => {
  const token = localStorage.getItem('token');
  if (!token || token === 'undefined' || token === 'null') {
    localStorage.removeItem('token');
    return null;
  }
  return token;
};

// Existing PrivateRoute for authenticated users
function PrivateRoute({ children }) {
  const token = getAuthToken();
  return token ? children : <Navigate to="/" />;
}

// NEW: AdminRoute to protect admin-only pages
function AdminRoute({ children }) {
  const token = getAuthToken();
  const role = localStorage.getItem('role');
  // Redirect to dashboard if not an admin
  return (token && role === 'admin') ? children : <Navigate to="/dashboard" />;
}

function AppContent() {
  const location = useLocation();
  const isAuthenticated = !!getAuthToken();
  const isLoginPage = location.pathname === '/';
  const isDashboardPage = location.pathname === '/dashboard';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {isAuthenticated && !isLoginPage && !isDashboardPage && <NavBar />}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/timer" element={<PrivateRoute><Timer /></PrivateRoute>} />
          <Route path="/logs" element={<PrivateRoute><Logs /></PrivateRoute>} />
          <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
          
          {/* NEW: Route for AdminPanel, protected by AdminRoute */}
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        </Routes>
      </div>
      <footer style={{
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #dee2e6',
        marginTop: 'auto'
      }}>
        © Romaric T.
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
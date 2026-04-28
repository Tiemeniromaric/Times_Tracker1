import { Link, useNavigate, useLocation } from 'react-router-dom';

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const navStyle = {
    backgroundColor: '#343a40',
    padding: '0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  };

  const navContainerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px'
  };

  const logoStyle = {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
    textDecoration: 'none',
    margin: 0
  };

  const navLinksStyle = {
    display: 'flex',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    alignItems: 'center'
  };

  const navItemStyle = {
    margin: '0 10px'
  };

  const getLinkStyle = (path) => ({
    color: location.pathname === path ? '#007bff' : '#fff',
    textDecoration: 'none',
    padding: '15px 20px',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
    fontWeight: '500',
    backgroundColor: location.pathname === path ? 'rgba(0,123,255,0.1)' : 'transparent',
    border: location.pathname === path ? '1px solid #007bff' : '1px solid transparent'
  });

  const linkHoverStyle = {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#e9ecef'
  };

  const logoutButtonStyle = {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  };

  const logoutButtonHoverStyle = {
    backgroundColor: '#c82333'
  };

  return (
    <nav style={navStyle}>
      <div style={navContainerStyle}>
        <Link to="/dashboard" style={logoStyle}>
          Timer App
        </Link>
        <ul style={navLinksStyle}>
          <li style={navItemStyle}>
            <Link
              to="/dashboard"
              style={getLinkStyle('/dashboard')}
              onMouseEnter={(e) => {
                if (location.pathname !== '/dashboard') {
                  Object.assign(e.target.style, linkHoverStyle);
                }
              }}
              onMouseLeave={(e) => {
                Object.assign(e.target.style, getLinkStyle('/dashboard'));
              }}
            >
              Dashboard
            </Link>
          </li>
          <li style={navItemStyle}>
            <Link
              to="/projects"
              style={getLinkStyle('/projects')}
              onMouseEnter={(e) => {
                if (location.pathname !== '/projects') {
                  Object.assign(e.target.style, linkHoverStyle);
                }
              }}
              onMouseLeave={(e) => {
                Object.assign(e.target.style, getLinkStyle('/projects'));
              }}
            >
              Projects
            </Link>
          </li>
          <li style={navItemStyle}>
            <Link
              to="/timer"
              style={getLinkStyle('/timer')}
              onMouseEnter={(e) => {
                if (location.pathname !== '/timer') {
                  Object.assign(e.target.style, linkHoverStyle);
                }
              }}
              onMouseLeave={(e) => {
                Object.assign(e.target.style, getLinkStyle('/timer'));
              }}
            >
              Timer
            </Link>
          </li>
          <li style={navItemStyle}>
            <Link
              to="/logs"
              style={getLinkStyle('/logs')}
              onMouseEnter={(e) => {
                if (location.pathname !== '/logs') {
                  Object.assign(e.target.style, linkHoverStyle);
                }
              }}
              onMouseLeave={(e) => {
                Object.assign(e.target.style, getLinkStyle('/logs'));
              }}
            >
              Logs
            </Link>
          </li>
          <li style={navItemStyle}>
            <button
              onClick={logout}
              style={logoutButtonStyle}
              onMouseEnter={(e) => Object.assign(e.target.style, logoutButtonHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.target.style, logoutButtonStyle)}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;
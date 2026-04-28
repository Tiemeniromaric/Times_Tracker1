import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isRegister ? '/register' : '/login';
    try {
      const res = await axios.post(`http://localhost:5000${url}`, { email, password });
      if (isRegister) {
        setMessage('Registered. Please login using your new credentials.');
        setIsRegister(false);
        return;
      }
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      setMessage(errorMessage);
      console.error('Login/register error:', err);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ marginBottom: '10px', padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ marginBottom: '10px', padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }} />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginBottom: '10px' }}>{isRegister ? 'Register' : 'Login'}</button>
        <button type="button" onClick={() => {
          setIsRegister(!isRegister);
          setMessage('');
        }} style={{ padding: '8px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
          Switch to {isRegister ? 'Login' : 'Register'}
        </button>
      </form>
      {message && <p style={{ marginTop: '10px', color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
}

export default Login;

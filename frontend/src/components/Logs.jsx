import { useState, useEffect } from 'react';
import axios from 'axios';

function Logs() {
  const [logs, setLogs] = useState([]);
  const [projectFilter, setProjectFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
      localStorage.removeItem('token');
      return null;
    }
    return token;
  };

  useEffect(() => {
    fetchLogs();
  }, [projectFilter, dateFilter]);

  const fetchLogs = () => {
    const token = getAuthToken();
    if (!token) return alert('Login required. Please refresh and login again.');
    axios.get('http://localhost:5000/time', {
      headers: { Authorization: `Bearer ${token}` },
      params: { project_id: projectFilter, date: dateFilter }
    }).then(res => setLogs(res.data));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <h2>Time Logs</h2>
      <div style={{ marginBottom: '20px' }}>
        <input type="text" placeholder="Filter by Project ID" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} style={{ marginRight: '10px', padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }} />
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }} />
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#e9ecef' }}>
            <th style={{ padding: '10px', border: '1px solid #ccc' }}>Project</th>
            <th style={{ padding: '10px', border: '1px solid #ccc' }}>Duration</th>
            <th style={{ padding: '10px', border: '1px solid #ccc' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td style={{ padding: '10px', border: '1px solid #ccc' }}>{log.project_name}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc' }}>{Math.floor(log.duration / 60)}:{(log.duration % 60).toString().padStart(2, '0')}</td>
              <td style={{ padding: '10px', border: '1px solid #ccc' }}>{new Date(log.start_time).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Logs;

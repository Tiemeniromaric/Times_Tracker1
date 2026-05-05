import { useState, useEffect } from 'react';
import api from '../api';

function Timer() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
      localStorage.removeItem('token');
      return null;
    }
    return token;
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    api.get('/projects', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setProjects(res.data));
  }, []);

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const startTimer = () => {
    const now = new Date();
    setStartTime(now);
    setEndTime(null);
    setIsRunning(true);
    if (intervalId) clearInterval(intervalId);
    const id = setInterval(() => setElapsed(prev => prev + 1), 1000);
    setIntervalId(id);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setEndTime(new Date());
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const continueTimer = () => {
    if (!startTime) return;
    setIsRunning(true);
    if (intervalId) clearInterval(intervalId);
    const id = setInterval(() => setElapsed(prev => prev + 1), 1000);
    setIntervalId(id);
  };

  const restartTimer = () => {
    const now = new Date();
    setElapsed(0);
    setStartTime(now);
    setEndTime(null);
    setIsRunning(true);
    if (intervalId) clearInterval(intervalId);
    const id = setInterval(() => setElapsed(prev => prev + 1), 1000);
    setIntervalId(id);
  };

  const submitLog = async () => {
    if (!selectedProject || elapsed === 0) {
      return alert('Please start the timer and select a project before submitting.');
    }
    const now = new Date();
    try {
      const token = getAuthToken();
      if (!token) return alert('Login required. Please refresh and login again.');

      await api.post('/time', {
        project_id: selectedProject,
        start_time: startTime.toISOString(),
        end_time: now.toISOString(),
        duration: elapsed,
        notes
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }

      setStartTime(null);
      setEndTime(null);
      setElapsed(0);
      setIsRunning(false);
      setNotes('');
      setSelectedProject('');
      alert('Time logged successfully');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Unknown error';
      alert('Failed to log time: ' + msg);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <h2>Timer</h2>
      <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} disabled={startTime && !endTime} style={{ marginBottom: '10px', padding: '8px', borderRadius: '3px', border: '1px solid #ccc', width: '100%' }}>
        <option value="">Select Project</option>
        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={isRunning} style={{ marginBottom: '10px', padding: '8px', borderRadius: '3px', border: '1px solid #ccc', width: '100%', height: '80px' }} />
      <div style={{ marginBottom: '10px' }}>
        {!startTime && <button onClick={startTimer} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' }}>Start</button>}
        {isRunning && <button onClick={stopTimer} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' }}>Stop</button>}
        {!isRunning && startTime && <button onClick={continueTimer} style={{ padding: '10px 20px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' }}>Continue</button>}
        {!isRunning && startTime && <button onClick={restartTimer} style={{ padding: '10px 20px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' }}>Restart</button>}
        {!isRunning && startTime && elapsed > 0 && <button onClick={submitLog} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Submit Log</button>}
      </div>
      <p style={{ marginTop: '10px', fontSize: '18px', fontWeight: 'bold' }}>Elapsed: {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</p>
    </div>
  );
}

export default Timer;
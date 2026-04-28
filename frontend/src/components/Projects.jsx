import { useState, useEffect } from 'react';
import axios from 'axios';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [timers, setTimers] = useState({}); // { projectId: { startTime, endTime, elapsed, intervalId, notes, isRunning } }

  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
      localStorage.removeItem('token');
      return null;
    }
    return token;
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    const token = getAuthToken();
    if (!token) return alert('Login required. Please refresh and login again.');
    axios.get('http://localhost:5000/projects', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setProjects(res.data))
      .catch(err => alert('Failed to fetch projects: ' + (err.response?.data?.error || err.message)));
  };

  const addProject = async () => {
    try {
      const token = getAuthToken();
      if (!token) return alert('Login required. Please refresh and login again.');
      await axios.post('http://localhost:5000/projects', { name }, { headers: { Authorization: `Bearer ${token}` } });
      setName('');
      fetchProjects();
    } catch (err) {
      alert('Failed to add project: ' + (err.response?.data?.error || err.message));
    }
  };

  const editProject = (id, currentName) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveEdit = async (id) => {
    try {
      const token = getAuthToken();
      if (!token) return alert('Login required. Please refresh and login again.');
      await axios.put(`http://localhost:5000/projects/${id}`, { name: editName }, { headers: { Authorization: `Bearer ${token}` } });
      setEditingId(null);
      setEditName('');
      fetchProjects();
    } catch (err) {
      alert('Failed to update project: ' + (err.response?.data?.error || err.message));
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? This will also delete all associated time logs.')) return;
    try {
      const token = getAuthToken();
      if (!token) return alert('Login required. Please refresh and login again.');
      await axios.delete(`http://localhost:5000/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchProjects();
    } catch (err) {
      alert('Failed to delete project: ' + (err.response?.data?.error || err.message));
    }
  };

  const clearProjectInterval = (id, prev) => {
    if (prev[id]?.intervalId) {
      clearInterval(prev[id].intervalId);
    }
  };

  const startTimer = (id) => {
    const now = new Date();
    setTimers(prev => {
      clearProjectInterval(id, prev);
      return {
        ...prev,
        [id]: {
          ...prev[id],
          startTime: now,
          endTime: null,
          elapsed: 0,
          isRunning: true,
          intervalId: setInterval(() => {
            setTimers(t => {
              if (t[id]?.isRunning) {
                return { ...t, [id]: { ...t[id], elapsed: (t[id]?.elapsed || 0) + 1 } };
              }
              return t;
            });
          }, 1000)
        }
      };
    });
  };

  const stopTimer = (id) => {
    setTimers(prev => {
      clearProjectInterval(id, prev);
      return { ...prev, [id]: { ...prev[id], isRunning: false, intervalId: null, endTime: new Date() } };
    });
  };

  const continueTimer = (id) => {
    setTimers(prev => {
      clearProjectInterval(id, prev);
      return {
        ...prev,
        [id]: {
          ...prev[id],
          isRunning: true,
          intervalId: setInterval(() => {
            setTimers(t => {
              if (t[id]?.isRunning) {
                return { ...t, [id]: { ...t[id], elapsed: (t[id]?.elapsed || 0) + 1 } };
              }
              return t;
            });
          }, 1000)
        }
      };
    });
  };

  const restartTimer = (id) => {
    const now = new Date();
    setTimers(prev => {
      clearProjectInterval(id, prev);
      return {
        ...prev,
        [id]: {
          ...prev[id],
          startTime: now,
          endTime: null,
          elapsed: 0,
          isRunning: true,
          intervalId: setInterval(() => {
            setTimers(t => {
              if (t[id]?.isRunning) {
                return { ...t, [id]: { ...t[id], elapsed: (t[id]?.elapsed || 0) + 1 } };
              }
              return t;
            });
          }, 1000)
        }
      };
    });
  };

  const submitLog = async (id) => {
    const timer = timers[id];
    if (!timer?.startTime || timer?.elapsed <= 0 || timer?.isRunning) return;
    const token = getAuthToken();
    if (!token) return alert('Login required. Please refresh and login again.');
    const now = new Date();
    try {
      await axios.post('http://localhost:5000/time', {
        project_id: id,
        start_time: timer.startTime.toISOString(),
        end_time: now.toISOString(),
        duration: timer.elapsed,
        notes: timer.notes || ''
      }, { headers: { Authorization: `Bearer ${token}` } });
      setTimers(prev => {
        if (prev[id]?.intervalId) clearInterval(prev[id].intervalId);
        return { ...prev, [id]: { notes: '' } };
      });
      alert('Time logged successfully');
    } catch (err) {
      alert('Failed to log time: ' + (err.response?.data?.error || err.message));
    }
  };

  const updateNotes = (id, notes) => {
    setTimers(prev => ({ ...prev, [id]: { ...prev[id], notes } }));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <h2>Projects</h2>
      <div style={{ marginBottom: '20px' }}>
        <input type="text" placeholder="Project Name" value={name} onChange={(e) => setName(e.target.value)} style={{ marginRight: '10px', padding: '8px', borderRadius: '3px', border: '1px solid #ccc', width: '200px' }} />
        <button onClick={addProject} style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Add Project</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {projects.map(p => {
          const timer = timers[p.id] || {};
          return (
            <li key={p.id} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: 'white' }}>
              {editingId === p.id ? (
                <div>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ marginRight: '10px', padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }} />
                  <button onClick={() => saveEdit(p.id)} style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' }}>Save</button>
                  <button onClick={() => setEditingId(null)} style={{ padding: '5px 10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Cancel</button>
                </div>
              ) : (
                <div>
                  <h3 style={{ margin: '0 0 10px 0' }}>{p.name}</h3>
                  <button onClick={() => editProject(p.id, p.name)} style={{ padding: '5px 10px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' }}>Edit</button>
                  <button onClick={() => deleteProject(p.id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '10px' }}>Delete</button>
                  <br />
                  <textarea placeholder="Notes" value={timer.notes || ''} onChange={(e) => updateNotes(p.id, e.target.value)} disabled={timer.isRunning} style={{ width: '100%', height: '60px', margin: '10px 0', padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }} />
                  <div style={{ marginBottom: '10px' }}>
                    {!timer.startTime && <button onClick={() => startTimer(p.id)} style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' }}>Start Timer</button>}
                    {timer.isRunning && <button onClick={() => stopTimer(p.id)} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' }}>Stop Timer</button>}
                    {!timer.isRunning && timer.startTime && <button onClick={() => continueTimer(p.id)} style={{ padding: '8px 15px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' }}>Continue</button>}
                    {!timer.isRunning && timer.startTime && <button onClick={() => restartTimer(p.id)} style={{ padding: '8px 15px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' }}>Restart</button>}
                    {!timer.isRunning && timer.startTime && timer.elapsed > 0 && <button onClick={() => submitLog(p.id)} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Submit Log</button>}
                  </div>
                  <p style={{ marginTop: '10px', fontWeight: 'bold' }}>Elapsed: {Math.floor((timer.elapsed || 0) / 60)}:{((timer.elapsed || 0) % 60).toString().padStart(2, '0')}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Projects;

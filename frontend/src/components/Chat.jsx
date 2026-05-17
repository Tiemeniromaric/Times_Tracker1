import { useEffect, useState } from 'react';
import { socket } from '../socket';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const userEmail = localStorage.getItem('email') || 'Anonymous';

  useEffect(() => {
    const handleMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on('chat_message', handleMessage);

    return () => {
      socket.off('chat_message', handleMessage);
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed) return;

    socket.emit('chat_message', {
      text: trimmed,
      user: userEmail,
    });

    setText('');
  };

  return (
    <div style={{ maxWidth: '700px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <h2>Live Chat</h2>

      <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #ddd', background: '#fff', padding: '10px', marginBottom: '15px', borderRadius: '6px' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: '10px' }}>
            <strong>{msg.user}:</strong> {msg.text}
            <div style={{ fontSize: '12px', color: '#777' }}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
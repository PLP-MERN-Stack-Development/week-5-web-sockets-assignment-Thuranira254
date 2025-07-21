import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './Chat.css'; // Import the CSS file for styling

const socket = io('http://localhost:3000');

function Chat() {
  const [messages, setMessages] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [search, setSearch] = useState('');

  useEffect(() => {
    socket.emit('join_room', currentRoom);

    socket.on('message', (msg) => {
      setMessages(prev => [...prev, msg]);
      if (window.Notification && Notification.permission === "granted") {
        new Notification(`New message from ${msg.user}`, { body: msg.text });
      }
    });

    return () => {
      socket.off('message');
    };
  }, [currentRoom]);

  const filteredMessages = messages.filter(msg =>
    msg.text && msg.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="chat-container">
      <input
        type="file"
        accept="image/*"
        onChange={e => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              socket.emit('send_image', { image: reader.result, room: currentRoom });
            };
            reader.readAsDataURL(file);
          }
        }}
      />
      <input
        type="text"
        placeholder="Search messages"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {filteredMessages.map((msg, i) => (
        <div key={i}>
          <b>{msg.user}:</b> {msg.text}
          <button onClick={() => socket.emit('react_message', { id: msg.id, reaction: '👍' })}>👍</button>
          <button onClick={() => socket.emit('react_message', { id: msg.id, reaction: '❤️' })}>❤️</button>
          {msg.reactions && <span>{msg.reactions.join(' ')}</span>}
        </div>
      ))}
    </div>
  );
}

export default Chat;
```

```css
/* Chat.css */
.chat-container {
  max-width: 600px;
  margin: auto;
  padding: 1rem;
}
@media (max-width: 600px) {
  .chat-container {
    width: 100vw;
    padding: 0.5rem;
  }
}
```
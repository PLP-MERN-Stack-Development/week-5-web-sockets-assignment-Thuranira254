// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Initialize Express app
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Store connected users
let users = {};

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('join', (username) => {
    users[socket.id] = username;
    io.emit('userList', Object.values(users));
    console.log(`${username} joined the chat`);
  });

  // Handle chat messages
  socket.on('message', (msg) => {
    io.emit('message', { user: users[socket.id], text: msg });
  });

  // Handle typing indicator
  socket.on('typing', () => {
    socket.broadcast.emit('typing', users[socket.id]);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      console.log(`${username} left the chat`);
    }
    
    delete users[socket.id];
    io.emit('userList', Object.values(users));
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
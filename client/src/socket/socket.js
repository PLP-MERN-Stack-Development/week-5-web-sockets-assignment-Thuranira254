// socket.js - Socket.io client setup

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Custom hook for using socket.io
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [readReceipts, setReadReceipts] = useState({});

  // Connect to socket server
  const connect = (username) => {
    socket.connect();
    if (username) {
      socket.emit('user_join', username);
    }
  };

  // Disconnect from socket server
  const disconnect = () => {
    socket.disconnect();
  };

  // Send a message
  const sendMessage = (message) => {
    socket.emit('send_message', { message, room: currentRoom });
  };

  // Send a private message
  const sendPrivateMessage = (to, message) => {
    socket.emit('private_message', { to, message });
  };

  // Join a chat room
  const joinRoom = (room) => {
    socket.emit('join_room', room);
    setCurrentRoom(room);
  };

  // Set typing status
  const setTyping = (isTyping) => {
    socket.emit('typing', { isTyping, room: currentRoom });
  };

  // Mark message as read
  const markAsRead = (messageId) => {
    socket.emit('read_receipt', { messageId, room: currentRoom });
  };

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    // Message events
    const onReceiveMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    };

    const onPrivateMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    };

    // User events
    const onUserList = (userList) => {
      setUsers(userList);
    };

    const onUserJoined = (user) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} joined the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const onUserLeft = (user) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} left the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    // Typing events
    const onTypingUsers = (users) => {
      setTypingUsers(users);
    };

    // Notification events
    const onNotification = (notification) => {
      setNotifications((prev) => [...prev, notification]);
    };

    // Room events
    const onRoomList = (roomList) => {
      setRooms(roomList);
    };

    // Read receipts
    const onReadReceipt = ({ messageId, user }) => {
      setReadReceipts((prev) => ({
        ...prev,
        [messageId]: [...(prev[messageId] || []), user],
      }));
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('typing_users', onTypingUsers);
    socket.on('notification', onNotification);
    socket.on('room_list', onRoomList);
    socket.on('read_receipt', onReadReceipt);

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('typing_users', onTypingUsers);
      socket.off('notification', onNotification);
      socket.off('room_list', onRoomList);
      socket.off('read_receipt', onReadReceipt);
    };
  }, [currentRoom]);

  return {
    socket,
    isConnected,
    lastMessage,
    messages,
    users,
    typingUsers,
    notifications,
    rooms,
    currentRoom,
    readReceipts,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    joinRoom,
    setTyping,
    markAsRead,
  };
};

export default socket;
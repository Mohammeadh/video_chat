const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();


const app = express();
const server = http.createServer(app);
const frontend_url="https://video-chat-mohammed.netlify.app/" 
const io = new Server(server, {
  cors: {
    origin: 'https://video-chat-mohammed.netlify.app',  // Specify the correct frontend URL
    methods: ['GET', 'POST'],
  },
  transports: ['polling', 'websocket'], // Ensure both transports are allowed
   withCredentials: true,
});


app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send user's ID to the client
  socket.emit('me', socket.id);

  // Handle call initiation (user1 calls user2)
  socket.on('calluser', ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("calluser", { signal: signalData, from, name });
  });

  // Handle user2 accepting the call
  socket.on('answercall', (data) => {
    io.to(data.to).emit("callaccepted", data.signal);
  });

  // Handle chat messages
  socket.on('chatMessage', (message) => {
    console.log('Chat message received:', message);
    io.emit('chatMessage', message); // Broadcast message to all users
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// socketSetup.js
import { Server } from "socket.io";

const waitingUsers = new Set();

export function setupSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "https://192.168.136.42:5173",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('start-search', () => {
      if (waitingUsers.size > 0) {
        const partner = waitingUsers.values().next().value;
        waitingUsers.delete(partner);

        const room = `room_${socket.id}_${partner}`;
        socket.join(room);
        io.sockets.sockets.get(partner)?.join(room); // Check if partner socket exists

        io.to(room).emit('call-started', room);
        console.log(`Room ${room} created with ${socket.id} and ${partner}`);
      } else {
        waitingUsers.add(socket.id);
        socket.emit('waiting');
        console.log(`${socket.id} is waiting for a partner`);
      }
    });

    socket.on('message', (message, room) => {
      io.to(room).emit('message', message); // Broadcast the message to everyone in the room
      console.log(`${message.sender} received message`);
    });

    socket.on('stop-search', () => {
      waitingUsers.delete(socket.id);
      console.log(`${socket.id} stopped searching`);
    });

    socket.on('leave-room', (room) => {
      socket.leave(room);
      socket.to(room).emit('partner-left');
      console.log(`${socket.id} left room ${room}`);
    });

    socket.on('offer', (offer, room) => {
      socket.to(room).emit('offer', offer);
      console.log(`Offer sent to room ${room}`);
    });

    socket.on('answer', (answer, room) => {
      socket.to(room).emit('answer', answer);
      console.log(`Answer sent to room ${room}`);
    });

    socket.on('ice-candidate', (candidate, room) => {
      socket.to(room).emit('ice-candidate', candidate);
      console.log(`ICE candidate sent to room ${room}`);
    });

    socket.on('disconnect', () => {
      waitingUsers.delete(socket.id);
      console.log(`A user disconnected: ${socket.id}`);
      // Clean up any rooms or ongoing calls involving this user
    });
  });
}

import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Server } from 'socket.io';
import authRoute from '@/routes/auth.route';
import messageRoute from '@/routes/message.route';
import { env } from '@/config/env.config';
import { connectDB } from '@/libs/db';

const PORT = env.PORT;
const CLIENT_URL = env.CLIENT_URL;

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

connectDB();

// Routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/message', messageRoute);

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  // actions

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

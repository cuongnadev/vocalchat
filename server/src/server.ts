import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { env } from '@/config/env.config';
import { connectDB } from '@/libs/db';
import AppRouters from './routes/index.route';
import { initSocket } from './services/socket.service';

const PORT = env.PORT;
const CLIENT_URL = env.CLIENT_URL;

const app = express();

const server = createServer(app);

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
AppRouters(app);

initSocket(io);

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

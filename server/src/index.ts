import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './db';
import authRoutes from './routes/auth.routes';
import shopRoutes from './routes/shop.routes';
import productRoutes from './routes/product.routes';
import chatRoutes from './routes/chat.routes';
import aiRoutes from './routes/ai.routes';

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: true, // Dynamically allow the origin of the request
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);    // TrustBot main chat
app.use('/api/ai', aiRoutes);        // AI utility endpoint

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'TrustLocal API is running' });
});

// Socket.io real-time order tracking
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join_order', (orderId: string) => {
    socket.join(`order_${orderId}`);
  });

  socket.on('order_status_update', (data: { orderId: string; status: string }) => {
    io.to(`order_${data.orderId}`).emit('order_status_changed', data);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

export { io };

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TrustLocal server running on port ${PORT} (0.0.0.0)`);
  console.log(`🤖 AI Chat: POST /api/chat`);
  console.log(`🗺️  Nearby Shops: GET /api/shops/nearby?lat=X&lng=Y&radius=5`);
});

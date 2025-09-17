import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import shippingRoutes from "./routes/shippingRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import zalopayRoutes from "./routes/zalopayRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { specs, swaggerUi } from "./config/swagger.js";

dotenv.config();
await connectDB(process.env.MONGO_URI);

const app = express();
app.use(cors({ origin: true, credentials: true })); // nếu FE khác domain
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/products", productRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/zalopay", zalopayRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "EV Marketplace API"
}));

app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log('Socket auth attempt with token:', token ? 'Present' : 'Missing');
  
  if (!token) {
    console.log('No token provided');
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified for user:', decoded.userId);
    socket.userId = decoded.userId;
    socket.user = decoded;
    next();
  } catch (err) {
    console.log('Token verification failed:', err.message);
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  
  // Join user to their personal room
  socket.join(`user_${socket.userId}`);
  
  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      console.log('Received send_message:', data);
      const { conversationId, text, tempId } = data;
      
      if (!conversationId || !text) {
        socket.emit('error', { message: 'Missing conversationId or text' });
        return;
      }
      
      // Here you would save the message to database
      // For now, we'll just broadcast it
      const message = {
        _id: Date.now().toString(),
        text,
        senderId: socket.userId,
        conversationId,
        createdAt: new Date().toISOString(),
        tempId // Include tempId for frontend confirmation
      };
      
      console.log('Broadcasting message to conversation:', conversationId);
      
      // Broadcast to all users in the conversation
      socket.to(`conversation_${conversationId}`).emit('new_message', {
        conversationId,
        message
      });
      
      // Confirm to sender
      socket.emit('message_sent', {
        conversationId,
        message
      });
      
      // Update conversation list for all participants
      io.to(`conversation_${conversationId}`).emit('conversation_updated', {
        conversationId,
        lastMessage: message,
        unreadCount: 1
      });
      
    } catch (error) {
      console.error('Error handling send_message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // Handle joining conversation
  socket.on('join_conversation', (conversationId) => {
    console.log(`User ${socket.userId} joining conversation ${conversationId}`);
    socket.join(`conversation_${conversationId}`);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
  });
  
  // Handle leaving conversation
  socket.on('leave_conversation', (conversationId) => {
    console.log(`User ${socket.userId} leaving conversation ${conversationId}`);
    socket.leave(`conversation_${conversationId}`);
    console.log(`User ${socket.userId} left conversation ${conversationId}`);
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`User ${socket.userId} disconnected:`, reason);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));



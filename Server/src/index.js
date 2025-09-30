import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { connectDB } from "./config/db.js";

// Load environment variables
dotenv.config();

// Fallback JWT_SECRET if not set
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not found in environment variables');
  console.warn('⚠️  Using fallback JWT_SECRET (NOT SECURE FOR PRODUCTION)');
  process.env.JWT_SECRET = 'fallback-jwt-secret-for-development-only';
}

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import shippingRoutes from "./routes/shippingRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import zalopayRoutes from "./routes/zalopayRoutes.js";
import contractRoutes from "./routes/contractRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { specs, swaggerUi } from "./config/swagger.js";

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
app.use("/api/contracts", contractRoutes);
app.use("/api/admin", adminRoutes);
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

// Expose io to routes/controllers
app.set('io', io);

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
  
  console.log('=== SOCKET AUTH ATTEMPT ===');
  console.log('Socket ID:', socket.id);
  console.log('Token present:', token ? 'Yes' : 'No');
  console.log('JWT_SECRET available:', !!jwtSecret);
  console.log('JWT_SECRET value:', jwtSecret);
  console.log('==========================');
  
  if (!token) {
    console.log('No token provided - rejecting connection');
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, jwtSecret);
    console.log('=== SOCKET AUTH SUCCESS ===');
    console.log('User ID:', decoded.userId);
    console.log('Socket ID:', socket.id);
    console.log('============================');
    socket.userId = decoded.userId;
    socket.user = decoded;
    next();
  } catch (err) {
    console.log('=== SOCKET AUTH FAILED ===');
    console.log('Error:', err.message);
    console.log('Token content:', token.substring(0, 50) + '...');
    console.log('JWT_SECRET used:', jwtSecret);
    console.log('===========================');
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('=== SOCKET CONNECTION ESTABLISHED ===');
  console.log('User ID:', socket.userId);
  console.log('Socket ID:', socket.id);
  console.log('=====================================');
  
  // Join user to their personal room
  socket.join(`user_${socket.userId}`);
  console.log(`User ${socket.userId} joined personal room: user_${socket.userId}`);
  
  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      console.log('Received send_message:', data);
      const { conversationId, text, tempId, files = [] } = data;
      
      if (!conversationId || (!text && files.length === 0)) {
        socket.emit('error', { message: 'Missing conversationId or content' });
        return;
      }
      
      // Import sendMessage function
      const { sendMessage } = await import('./services/chatService.js');
      
      // Save message to database
      const savedMessage = await sendMessage(conversationId, socket.userId, text || '', files);
      
      const message = {
        _id: savedMessage._id,
        text: savedMessage.text,
        senderId: savedMessage.senderId,
        conversationId: savedMessage.conversationId,
        createdAt: savedMessage.createdAt,
        files: savedMessage.files || [],
        type: savedMessage.type,
        tempId // Include tempId for frontend confirmation
      };
      
      console.log('=== SERVER: BROADCASTING MESSAGE ===');
      console.log(`Conversation ID: ${conversationId}`);
      console.log(`Room: conversation_${conversationId}`);
      console.log(`Sender: ${socket.userId}`);
      console.log(`Message: ${message.text}`);
      console.log(`====================================`);
      
      // Debug: Check who is in the conversation room
      const room = io.sockets.adapter.rooms.get(`conversation_${conversationId}`);
      if (room) {
        console.log(`Users in conversation_${conversationId}:`, Array.from(room));
      } else {
        console.log(`No users in conversation_${conversationId}`);
      }
      
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
      
      // Emit to the recipient's personal room for real-time updates
      const { Conversation } = await import('./models/Conversation.js');
      const conversation = await Conversation.findById(conversationId);
      if (conversation) {
        const recipientId = conversation.buyerId.toString() === socket.userId ? conversation.sellerId : conversation.buyerId;
        io.to(`user_${recipientId}`).emit('conversation_updated', {
          conversationId,
          lastMessage: message,
          unreadCount: 1
        });
      }
      
    } catch (error) {
      console.error('Error handling send_message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // Handle joining conversation
  socket.on('join_conversation', (conversationId) => {
    console.log(`=== SERVER: JOIN CONVERSATION ===`);
    console.log(`User ID: ${socket.userId}`);
    console.log(`Conversation ID: ${conversationId}`);
    console.log(`Socket ID: ${socket.id}`);
    console.log(`Room: conversation_${conversationId}`);
    console.log(`===============================`);
    
    if (!conversationId) {
      console.log('ERROR: No conversationId provided');
      return;
    }
    
    socket.join(`conversation_${conversationId}`);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    
    // Debug: List all rooms this socket is in
    const rooms = Array.from(socket.rooms);
    console.log(`User ${socket.userId} is now in rooms:`, rooms);
    
    // Debug: Check if room exists
    const room = io.sockets.adapter.rooms.get(`conversation_${conversationId}`);
    if (room) {
      console.log(`Room conversation_${conversationId} now has ${room.size} users:`, Array.from(room));
    } else {
      console.log(`ERROR: Room conversation_${conversationId} not found after join`);
    }
  });
  
  // Handle leaving conversation
  socket.on('leave_conversation', (conversationId) => {
    console.log(`User ${socket.userId} leaving conversation ${conversationId}`);
    socket.leave(`conversation_${conversationId}`);
    console.log(`User ${socket.userId} left conversation ${conversationId}`);
  });
  
  // Handle WebSocket errors
  socket.on('error', (error) => {
    console.log('=== SOCKET ERROR ===');
    console.log('User ID:', socket.userId);
    console.log('Socket ID:', socket.id);
    console.log('Error:', error);
    console.log('===================');
  });

  socket.on('disconnect', (reason) => {
    console.log('=== SOCKET DISCONNECTED ===');
    console.log('User ID:', socket.userId);
    console.log('Socket ID:', socket.id);
    console.log('Reason:', reason);
    console.log('===========================');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));



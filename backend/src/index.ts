import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import careerRoutes from './routes/career.routes';
import intelligenceRoutes from './routes/intelligence.routes';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import friendsRoutes from './routes/friends.routes';
import chatRoutes from './routes/chat.routes';
import careerService from './services/career.service';
import { initializeChatGateway } from './gateways/chat.gateway';

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: true }));
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/career', careerRoutes);
app.use('/api/v1/intelligence', intelligenceRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/friends', friendsRoutes);
app.use('/api/v1/chat', chatRoutes);

// Initialize Socket.IO for real-time chat
const io = initializeChatGateway(httpServer);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await careerService.initCareerServices();
    httpServer.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();

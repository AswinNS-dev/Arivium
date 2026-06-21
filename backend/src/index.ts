import express from 'express';
import cors from 'cors';
import careerRoutes from './routes/career.routes';
import intelligenceRoutes from './routes/intelligence.routes';
import authRoutes from './routes/auth.routes';
import careerService from './services/career.service';

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/career', careerRoutes);
app.use('/api/v1/intelligence', intelligenceRoutes);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await careerService.initCareerServices();
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();

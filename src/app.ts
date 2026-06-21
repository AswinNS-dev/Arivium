import express from 'express';
import AssetLoader from './ai/AssetLoader';
import careerRoutes from './routes/career.routes';

async function start() {
  await AssetLoader.initialize();
  const app = express();
  app.use(express.json());
  app.use('/api/v1/career', careerRoutes);

  const port = process.env.PORT || 5111;
  app.listen(port, () => console.log(`Server listening on ${port}`));
}

start().catch((e) => {
  console.error('Failed to start server', e);
  process.exit(1);
});

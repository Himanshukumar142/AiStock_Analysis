import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import analyzeRouter from './routes/analyze.js';

const app = express();


app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});


app.use('/api', analyzeRouter);


app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    time: new Date().toISOString(),
    env: config.nodeEnv
  });
});


app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});


app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error.',
    details: config.nodeEnv === 'development' ? err.message : undefined
  });
});


const PORT = config.port;
app.listen(PORT, () => {
  logger.success(`Server running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
  logger.info(`Analyze: POST http://localhost:${PORT}/api/analyze`);
});

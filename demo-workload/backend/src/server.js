require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { metricsMiddleware } = require('./middleware/metrics');
const healthRoutes = require('./routes/health');
const userRoutes = require('./routes/users');
const simulateRoutes = require('./routes/simulate');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kubeguardian';

app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

app.use(healthRoutes);
app.use('/api/users', userRoutes);
app.use('/simulate', simulateRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[DB] Connected to MongoDB');
  } catch (error) {
    console.error('[DB] Connection failed:', error.message);
    console.error('[DB] Retrying in 5 seconds...');
    setTimeout(connectDatabase, 5000);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('[DB] MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('[DB] MongoDB reconnected');
});

async function seedUsers() {
  const User = require('./models/User');
  const count = await User.countDocuments();
  if (count === 0) {
    await User.insertMany([
      { name: 'Alice Johnson', email: 'alice@kubeguardian.demo' },
      { name: 'Bob Smith', email: 'bob@kubeguardian.demo' },
      { name: 'Carol Williams', email: 'carol@kubeguardian.demo' },
    ]);
    console.log('[DB] Seeded demo users');
  }
}

async function start() {
  await connectDatabase();

  if (mongoose.connection.readyState === 1) {
    await seedUsers();
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] KubeGuardian Demo Backend running on port ${PORT}`);
    console.log(`[SERVER] Health: http://localhost:${PORT}/health`);
    console.log(`[SERVER] Metrics: http://localhost:${PORT}/metrics`);
  });
}

process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[FATAL] Uncaught exception:', error.message);
  process.exit(1);
});

start();

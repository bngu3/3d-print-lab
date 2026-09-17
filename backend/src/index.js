const express = require('express');
const cors = require('cors');
const requestsRouter = require('./routes/requests');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRouter);
app.use('/api/requests', requestsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🖨️  3D Print Lab API running at http://localhost:${PORT}`);
});
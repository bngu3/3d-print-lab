const express = require('express');
const cors = require('cors');
const requestsRouter = require('./routes/requests');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/requests', requestsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3001, () => {
  console.log('🖨️  3D Print Lab API running at http://localhost:3001');
});
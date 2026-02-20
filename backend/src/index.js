const express = require('express');
const cors = require('cors');
const requestsRouter = require('./routes/requests');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/requests', requestsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🖨️  3D Print Lab API running at http://localhost:${PORT}`);
});
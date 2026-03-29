const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(
  cors({
    origin: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.get('/', (req, res) => {
  res.send('Database is up and running');
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/admin', adminRoutes);

module.exports = app;

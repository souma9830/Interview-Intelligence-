const express = require('express');
const cors = require('cors');
const requestLogger = require('./middleware/requestLogger');
const authRoutes = require('./routes/authRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const reportRoutes = require('./routes/reportRoutes');
const resumeRoutes = require('./routes/resumeRoutes');

const app = express();

app.use(requestLogger);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/resume', resumeRoutes);

app.get('/', (req, res) => {
  res.send('AI Interview Platform API is running...');
});

module.exports = app;
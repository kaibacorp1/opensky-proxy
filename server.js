const express = require('express');
const axios = require('axios');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// OpenSky proxy endpoint
app.post('/api/flights', async (req, res) => {
  const { username, password, lamin, lomin, lamax, lomax } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing OpenSky credentials' });
  }

  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  const url = `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Basic ${auth}` }
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

// Email alert endpoint using Brevo (Sendinblue)
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

app.post('/api/send-alert', async (req, res) => {
  const { email, subject, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ error: 'Missing email or message' });
  }

  try {
    await transporter.sendMail({
      from: '"Transit Tracker" <sandu.godakumbura@gmail.com>',
      to: email,
      subject: subject || 'Transit Detected!',
      text: message
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔌 Server running on port ${PORT}`));

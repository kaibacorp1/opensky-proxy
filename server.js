const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔌 Server running on port ${PORT}`));

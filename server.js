import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzi9o2mQWY0QotapRu4a0XNJVQNu4awWJCm_79sHABcnSIiXqMyWqsswhDHqNrLw_e_dw/exec';

app.post('/api', async (req, res) => {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    console.log('Raw response from Apps Script:', text);

    const data = JSON.parse(text);
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy error: " + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});

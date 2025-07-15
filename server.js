// server.js
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import multer from 'multer';

const app = express();
app.use(cors());
const upload = multer({ storage: multer.memoryStorage() });
app.use(express.json());

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

app.post('/api', async (req, res) => {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy error: " + err.message });
  }
});

app.post('/upload-proof', upload.single('proof'), async (req, res) => {
  try {
    const { token } = req.body;
    if (!token || !req.file) {
      return res.status(400).json({ success: false, error: "Missing token or file" });
    }

    const base64Data = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const payload = {
      action: 'uploadProof',
      payload: { token, base64Data, mimeType: req.file.mimetype }
    };

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Upload proof error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/check-token', async (req, res) => {
  try {
    const { token } = req.body;
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'checkTokenStatus', payload: { token } })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/mark-pickup', async (req, res) => {
  try {
    const { token, type } = req.body;
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'markPickup', payload: { token, type } })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});

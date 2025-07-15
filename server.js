import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import multer from 'multer';

const app = express();
app.use(cors());

// Multer setup for parsing multipart/form-data file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Also parse JSON bodies for normal requests
app.use(express.json());

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzi9o2mQWY0QotapRu4a0XNJVQNu4awWJCm_79sHABcnSIiXqMyWqsswhDHqNrLw_e_dw/exec';

// JSON API proxy endpoint (for register, send email, etc.)
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

// Upload proof endpoint to handle multipart/form-data file uploads
app.post('/upload-proof', upload.single('proof'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: "Missing token" });
    }

    // Convert file buffer to base64 string with MIME prefix
    const base64Data = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const payload = {
      action: "uploadProof",
      payload: {
        token,
        base64Data,
        mimeType: req.file.mimetype
      }
    };

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    console.log('Upload proof response:', text);
    const data = JSON.parse(text);

    res.json(data);
  } catch (err) {
    console.error("Upload proof error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});

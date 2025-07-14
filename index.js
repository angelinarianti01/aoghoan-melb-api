const express = require("express");
const fetch = require("node-fetch"); // npm i node-fetch@2
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Allow all origins
app.use(express.json({ limit: "20mb" })); // parse JSON bodies with large limit

const GAS_URL = "https://script.google.com/macros/s/AKfycbzNTJNC-XVs-gL6MPuHWSSbzU5pAY8GoPOiZkMGUtk/dev";

app.options("/api/proxy", cors());

app.post("/api/proxy", async (req, res) => {
  try {
    const { action, ...rest } = req.body;
    if (!action) return res.status(400).json({ error: "Missing action" });

    const url = `${GAS_URL}?action=${encodeURIComponent(action)}`;

    const gasResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rest),
    });

    if (!gasResponse.ok) {
      const text = await gasResponse.text();
      return res.status(gasResponse.status).send(text);
    }

    const json = await gasResponse.json();
    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});

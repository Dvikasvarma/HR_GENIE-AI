const express = require('express');
const path = require('path');
const fs = require('fs');

// Load .env file safely without extra dependencies
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        value = value.trim().replace(/^['"](.*)['"]$/, '$1');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (e) {
  console.warn('Note: Could not load .env file:', e.message);
}

const app = express();
app.use(express.json());

// Serve static site files from this directory
app.use(express.static(path.join(__dirname)));

// Power Automate flow URL map (mirrors api/powerautomate.js)
const urlMap = {
  getProfile: "https://default7359f89671e24daeb8a315cdf97f2f.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/ec32b60336464dcf875ee72b34c70463/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=KA0ATqlhW8Tx7IdB9wmtWdNz_KMt_gGuPf0bUbMA0g4",
  postProfile: "https://default7359f89671e24daeb8a315cdf97f2f.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/4f834bd6f1ea4a729a8d6a8546fdd9f5/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=mxxjjAYoHS0i4Rw-5-zEHoP5ukQNuFlNx1dBFX7-K-o",
  loginAuth: "https://default7359f89671e24daeb8a315cdf97f2f.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/2cb34a7d76d943b0bf9604e7283d3c23/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=cXVoaib8Ce__kB8XkXZ_4deGeifbq9m302dSoa1axxA",
  postLeave: "https://default7359f89671e24daeb8a315cdf97f2f.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/8b0565b89f0846dea19d206e6c7112de/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=A_ns8iYp_cYxLsd6rVFfB7m6pa8_9jkLjFN-Svw0o44",
  getLeave: "https://default7359f89671e24daeb8a315cdf97f2f.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/f14575bfa63f48cab190ee6a89cd301d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=cDdvuvds0yT0wWDkLHNJTkoeX3MLPCm9vdfQUUYZg5o",
  getAttendance: "https://default7359f89671e24daeb8a315cdf97f2f.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/5f1f12dbae0942f6bb095b118eff0f71/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=7ttMB5nkPsUbjZMHh7GRb8BnIlBxMIJxWmhanVENtaU",
  getAllEmployees: "PASTE_YOUR_GET_ALL_EMPLOYEES_FLOW_URL_HERE"
};

// Power Automate Proxy
app.post('/api/powerautomate', async (req, res) => {
  const { action, payload } = req.body || {};
  if (!action) return res.status(400).json({ error: 'action is required' });

  let targetUrl = urlMap[action];
  if (!targetUrl) return res.status(400).json({ error: 'Invalid action' });

  if (action === 'getProfile' && payload?.email) {
    targetUrl += `&email=${encodeURIComponent(payload.email)}`;
  } else if (action === 'getAttendance' && payload?.month && payload?.email) {
    targetUrl += `&month=${encodeURIComponent(payload.month)}&email=${encodeURIComponent(payload.email)}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload ? JSON.stringify(payload) : undefined,
      signal: controller.signal
    });
    clearTimeout(timeout);

    const text = await response.text();
    try {
      return res.status(200).json(JSON.parse(text || '{}'));
    } catch (e) {
      return res.status(200).json({ message: text });
    }
  } catch (err) {
    console.error('Proxy error:', err);
    const msg = err.name === 'AbortError' ? 'Timeout' : err.message;
    return res.status(500).json({ error: 'Proxy Error: ' + msg });
  }
});

// AI Chatbot Route (Gemini 2.5 Flash)
app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyA6BU61LwcuxRWBOT_WBuCheXJZVOySg5Q";

  try {
    let body = req.body || {};

    if (body.message && !body.contents) {
      body = {
        contents: [{
          parts: [{ text: body.message }]
        }]
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();

    if (response.ok && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const reply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply: reply, ...data });
    }

    console.warn("Gemini API non-200 or no candidate:", data);
    return res.status(200).json({
      reply: "I am here to help you! You can manage your leaves and OD in 'My Track', check payslips in 'My Finance', and view company guidelines in 'My Policy'."
    });

  } catch (error) {
    console.error("Chat error:", error);
    return res.status(200).json({
      reply: "I'm your HR Assistant! For leave requests, please visit the 'My Track' tab, or reach out to HR Support for immediate assistance."
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running at http://127.0.0.1:${port}`));

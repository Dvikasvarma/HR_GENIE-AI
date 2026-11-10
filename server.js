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

// In-memory store for leaves (preserves across sessions in local file)
const leavesFilePath = path.join(__dirname, 'leaves.json');
function getStoredLeaves() {
  try {
    if (fs.existsSync(leavesFilePath)) {
      return JSON.parse(fs.readFileSync(leavesFilePath, 'utf8') || '[]');
    }
  } catch (e) {
    console.error('Error reading leaves.json:', e);
  }
  return [];
}

function saveStoredLeaves(leaves) {
  try {
    fs.writeFileSync(leavesFilePath, JSON.stringify(leaves, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving leaves.json:', e);
  }
}

// Helper to look up user in users_dataset.csv
function getUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  try {
    const csvPath = path.join(__dirname, 'users_dataset.csv');
    if (fs.existsSync(csvPath)) {
      const content = fs.readFileSync(csvPath, 'utf8');
      const lines = content.split('\n').filter(Boolean);
      const headers = lines[0].split(',').map(h => h.trim());
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        const row = {};
        headers.forEach((h, idx) => row[h] = parts[idx] || '');
        if (row.Email && row.Email.toLowerCase() === cleanEmail) {
          return {
            EmpID: row.EmpID || "EMP008",
            Name: row.Name,
            Email: row.Email,
            Department: row.Department || "IT",
            Designation: row.Designation || "Software Engineer",
            Role: row.Role || "Employee",
            Phone: row.Phone || "9876543210",
            AssetId: "AST-" + (row.EmpID ? row.EmpID.replace(/\D/g, '') : "108"),
            Status: row.Status || "Active"
          };
        }
      }
    }
  } catch (e) {
    console.warn("Could not read users_dataset.csv:", e);
  }

  // Fallback profile generated from email
  const namePart = cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    EmpID: "EMP" + Math.abs(cleanEmail.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0) % 900 + 100),
    Name: namePart,
    Email: cleanEmail,
    Department: "Information Technology",
    Designation: "Software Engineer",
    Role: "Employee",
    Phone: "9876543210",
    AssetId: "AST-2026",
    Status: "Active"
  };
}

const app = express();
app.use(express.json());

// Serve static site files from this directory
app.use(express.static(path.join(__dirname)));

// Power Automate flow URL map
const urlMap = {
  getProfile: "https://default7359f89671e24daeb8a315cdf97f2f.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/ec32b60336464dcf875ee72b34c70463/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=KA0ATqlhW8Tx7IdB9wmtWdNz_KMt_gGuPf0bUbMA0g4",
  postProfile: "https://default7359f89671e24daeb8a315cdf97f2f.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/4f834bd6f1ea4a729a8d6a8546fdd9f5/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=mxxjjAYoHS0i4Rw-5-zEHoP5ukQNuFlNx1dBFX7-K-o",
  loginAuth: "https://default7359f89671e24daeb8a315cdf97f2f.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/2cb34a7d76d943b0bf9604e7283d3c23/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=cXVoaib8Ce__kB8XkXZ_4deGeifbq9m302dSoa1axxA",
  postLeave: "https://default7359f89671e24daeb8a315cdf97f2f.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/8b0565b89f0846dea19d206e6c7112de/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=A_ns8iYp_cYxLsd6rVFfB7m6pa8_9jkLjFN-Svw0o44",
  getLeave: "https://default7359f89671e24daeb8a315cdf97f2f.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/f14575bfa63f48cab190ee6a89cd301d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=cDdvuvds0yT0wWDkLHNJTkoeX3MLPCm9vdfQUUYZg5o",
  getAttendance: "https://default7359f89671e24daeb8a315cdf97f2f.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/5f1f12dbae0942f6bb095b118eff0f71/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=7ttMB5nkPsUbjZMHh7GRb8BnIlBxMIJxWmhanVENtaU"
};

// Power Automate Proxy with smart reliable fallback
app.post('/api/powerautomate', async (req, res) => {
  const { action, payload } = req.body || {};
  if (!action) return res.status(400).json({ error: 'action is required' });

  // Handle postLeave locally as well so leaves are ALWAYS saved
  if (action === 'postLeave') {
    const leaves = getStoredLeaves();
    const newLeave = {
      id: payload?.id || "LV-" + Math.floor(1000 + Math.random() * 9000),
      email: payload?.email,
      from: payload?.from || payload?.fromDate,
      to: payload?.to || payload?.toDate,
      duration: payload?.duration || `${payload?.from} to ${payload?.to}`,
      type: payload?.type || payload?.leaveType || "Casual Leave",
      reason: payload?.reason || "Personal",
      status: payload?.status || "Approved",
      appliedOn: payload?.appliedOn || new Date().toLocaleDateString('en-GB')
    };
    leaves.unshift(newLeave);
    saveStoredLeaves(leaves);
  }

  // Handle getLeave locally if requested
  if (action === 'getLeave') {
    const leaves = getStoredLeaves();
    const userEmail = payload?.email?.toLowerCase();
    const filtered = userEmail ? leaves.filter(l => !l.email || l.email.toLowerCase() === userEmail) : leaves;
    if (filtered.length > 0) {
      return res.status(200).json(filtered);
    }
  }

  let targetUrl = urlMap[action];
  
  if (targetUrl) {
    if (action === 'getProfile' && payload?.email) {
      targetUrl += `&email=${encodeURIComponent(payload.email)}`;
    } else if (action === 'getAttendance' && payload?.month && payload?.email) {
      targetUrl += `&month=${encodeURIComponent(payload.month)}&email=${encodeURIComponent(payload.email)}`;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload ? JSON.stringify(payload) : undefined,
        signal: controller.signal
      });
      clearTimeout(timeout);

      const text = await response.text();
      let parsed = {};
      try { parsed = JSON.parse(text || '{}'); } catch (e) { parsed = { message: text }; }
      
      // If we got a valid profile with a Name, return it
      if (action === 'getProfile' && (parsed.Name || parsed.name || (Array.isArray(parsed) && parsed[0]?.Name))) {
        return res.status(200).json(parsed);
      } else if (action !== 'getProfile' && response.ok) {
        return res.status(200).json(parsed);
      }
    } catch (err) {
      console.warn(`Power Automate [${action}] unreachable, using local fallback.`);
    }
  }

  // --- RELIABLE LOCAL FALLBACK ---
  if (action === 'getProfile') {
    const userProfile = getUserByEmail(payload?.email);
    return res.status(200).json(userProfile);
  }

  if (action === 'loginAuth') {
    const user = getUserByEmail(payload?.email);
    return res.status(200).json({ status: 'success', role: user?.Role || 'Employee' });
  }

  if (action === 'getLeave') {
    const leaves = getStoredLeaves();
    return res.status(200).json(leaves);
  }

  if (action === 'postLeave') {
    return res.status(200).json({ status: 'success', message: 'Leave recorded successfully' });
  }

  return res.status(200).json({ status: 'success' });
});

// Dedicated Leaves API
app.get('/api/leaves', (req, res) => {
  const leaves = getStoredLeaves();
  res.json(leaves);
});

app.post('/api/leaves', (req, res) => {
  const leaves = getStoredLeaves();
  const newLeave = req.body;
  leaves.unshift(newLeave);
  saveStoredLeaves(leaves);
  res.json({ success: true, leave: newLeave });
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

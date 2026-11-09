export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, payload } = req.body;

  // ── Power Automate flow URLs ──────────────────────────────────────────
  // Each URL triggers a Power Automate flow that reads from / writes to
  // the SharePoint list "employee_users" at:
  //   https://adityagroup.sharepoint.com/sites/HRMS/Lists/employee_users
  // ─────────────────────────────────────────────────────────────────────
  const urlMap = {
    getProfile: "https://default7359f89671e24daeb8a315cdf97f2f.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/ec32b60336464dcf875ee72b34c70463/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=KA0ATqlhW8Tx7IdB9wmtWdNz_KMt_gGuPf0bUbMA0g4",
    postProfile: "https://default7359f89671e24daeb8a315cdf97f2f.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/4f834bd6f1ea4a729a8d6a8546fdd9f5/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=mxxjjAYoHS0i4Rw-5-zEHoP5ukQNuFlNx1dBFX7-K-o",
    loginAuth: "https://default7359f89671e24daeb8a315cdf97f2f.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/2cb34a7d76d943b0bf9604e7283d3c23/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=cXVoaib8Ce__kB8XkXZ_4deGeifbq9m302dSoa1axxA",
    postLeave: "https://default7359f89671e24daeb8a315cdf97f2f.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/8b0565b89f0846dea19d206e6c7112de/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=A_ns8iYp_cYxLsd6rVFfB7m6pa8_9jkLjFN-Svw0o44",
    getLeave: "https://default7359f89671e24daeb8a315cdf97f2f.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/f14575bfa63f48cab190ee6a89cd301d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=cDdvuvds0yT0wWDkLHNJTkoeX3MLPCm9vdfQUUYZg5o",
    getAttendance: "https://default7359f89671e24daeb8a315cdf97f2f.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/5f1f12dbae0942f6bb095b118eff0f71/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=7ttMB5nkPsUbjZMHh7GRb8BnIlBxMIJxWmhanVENtaU",
    getAllEmployees: "PASTE_YOUR_GET_ALL_EMPLOYEES_FLOW_URL_HERE"
  };

  let targetUrl = urlMap[action];

  if (!targetUrl) {
    return res.status(400).json({ error: 'Invalid action specified' });
  }

  const fetchOptions = {
    headers: {}
  };

  if (action === 'getProfile') {
    if (payload?.email) targetUrl += `&email=${encodeURIComponent(payload.email)}`;
    fetchOptions.method = 'GET';
  } else if (action === 'getAttendance') {
    if (payload?.month && payload?.email) {
      targetUrl += `&month=${encodeURIComponent(payload.month)}&email=${encodeURIComponent(payload.email)}`;
    }
    fetchOptions.method = 'POST';
  } else {
    // loginAuth, postProfile, postLeave, getLeave all use POST with JSON body
    fetchOptions.method = 'POST';
    fetchOptions.headers['Content-Type'] = 'application/json';
    if (payload) fetchOptions.body = JSON.stringify(payload);
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);

    const responseText = await response.text();
    let data = {};
    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { message: responseText };
      }
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error proxying ${action}:`, error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("CRITICAL: Missing GEMINI_API_KEY in environment variables.");
    return res.status(500).json({ error: 'Missing Gemini API Key' });
  }

  try {
    let body = req.body;
    
    // Support both structured { contents: [...] } and simple { message: "..." } formats
    if (body.message && !body.contents) {
      body = {
        contents: [{
          parts: [{ text: body.message }]
        }]
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API returned an error:", data);
      return res.status(response.status).json(data);
    }

    // Extract simple reply if possible for frontend ease
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      data.reply = data.candidates[0].content.parts[0].text;
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    return res.status(500).json({ error: 'Failed to communicate with AI service', details: error.message });
  }
}

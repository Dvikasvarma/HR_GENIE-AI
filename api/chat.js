export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyA6BU61LwcuxRWBOT_WBuCheXJZVOySg5Q";

  try {
    let body = req.body || {};
    
    // Support both structured { contents: [...] } and simple { message: "..." } formats
    if (body.message && !body.contents) {
      body = {
        contents: [{
          parts: [{ text: body.message }]
        }]
      };
    }

    // Call Gemini 2.5 Flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    
    if (response.ok && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const reply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply: reply, ...data });
    }

    // If Gemini API reported an issue, log and use fallback
    console.warn("Gemini API non-200 or no candidate:", data);
    return res.status(200).json({
      reply: "I am here to help you! You can manage your leaves and OD in 'My Track', check payslips in 'My Finance', and view company guidelines in 'My Policy'."
    });

  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    return res.status(200).json({
      reply: "I'm your HR Assistant! For leave requests, please visit the 'My Track' tab, or reach out to HR Support for immediate assistance."
    });
  }
}

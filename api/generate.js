// api/generate.js
const { generateContent } = require('../gemini.js');
const verifyFirebaseToken = require('../utils/auth'); // Import the middleware

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Change x-api-key to Authorization

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apply Firebase token verification middleware
  await verifyFirebaseToken(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt requerido' });
      }
      // You can now access user info via req.user if needed
      const text = await generateContent(prompt);
      res.status(200).json({ text });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};


require('dotenv').config();
const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt requerido' });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.7, topP: 0.95 }
    });
    res.json({ text: response.text });
  } catch (error) {
    res.status(500).json({ error: 'Error al generar contenido' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor backend Gemini listo en puerto ${port}`));

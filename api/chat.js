// api/chat.js
const { generateContent } = require('../gemini.js');

module.exports = async (req, res) => {
  // Configuración de CORS para permitir solicitudes desde cualquier origen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejo de solicitudes pre-vuelo (preflight) de CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo se permite el método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // El frontend envía un objeto con la propiedad "message"
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'El campo "message" es requerido' });
    }

    // Reutilizamos la función existente para generar el contenido
    const text = await generateContent(message);

    // Enviamos la respuesta en la propiedad "text" que el frontend espera
    res.status(200).json({ text });
  } catch (error) {
    // Manejo de errores
    res.status(500).json({ error: error.message });
  }
};

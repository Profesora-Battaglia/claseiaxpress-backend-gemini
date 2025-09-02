const { admin } = require('../gemini.js');

async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado: Token no proporcionado o formato incorrecto.' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Attach user information to the request
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error('Error al verificar el token de Firebase:', error.message);
    return res.status(401).json({ error: 'No autorizado: Token inválido o expirado.' });
  }
}

module.exports = verifyFirebaseToken;

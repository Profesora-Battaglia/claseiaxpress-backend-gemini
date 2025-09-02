const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin'); // Import firebase-admin

let genAI;
let firebaseApp; // Variable to hold Firebase app instance

try {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (error) {
  console.error('!!! CRITICAL: Failed to initialize GoogleGenerativeAI:', error.message);
}

// Initialize Firebase Admin SDK
try {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.');
  }
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('!!! CRITICAL: Failed to initialize Firebase Admin SDK:', error.message);
}


async function generateContent(prompt) {
  if (!genAI) {
    throw new Error('Google AI SDK not initialized.');
  }
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generateContentStream(prompt) {
    if (!genAI) {
        throw new Error('Google AI SDK not initialized.');
    }
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContentStream(prompt);
    return result.stream;
}

// Export admin object for use in other modules
module.exports = { generateContent, generateContentStream, admin };

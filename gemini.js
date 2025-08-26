const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;

try {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (error) {
  console.error('!!! CRITICAL: Failed to initialize GoogleGenerativeAI:', error.message);
}

async function generateContent(prompt) {
  if (!genAI) {
    throw new Error('Google AI SDK not initialized.');
  }
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generateContentStream(prompt) {
    if (!genAI) {
        throw new Error('Google AI SDK not initialized.');
    }
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContentStream(prompt);
    return result.stream;
}

module.exports = { generateContent, generateContentStream };

require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Middleware manual para CORS y OPTIONS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize Google AI with error handling
let genAI;
try {
  console.log('Initializing GoogleGenerativeAI...');
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('GoogleGenerativeAI initialized successfully.');
} catch (error) {
  console.error('!!! CRITICAL: Failed to initialize GoogleGenerativeAI:', error.message);
}

// --- Helper function for streaming responses ---
async function streamToResponse(iterableStream, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');
  try {
    for await (const chunk of iterableStream) {
      if (chunk && typeof chunk.text === 'function') {
        res.write(chunk.text());
      }
    }
    res.end();
  } catch (error) {
    console.error('Error streaming response:', error);
    if (!res.headersSent) {
      res.status(500).send('Error streaming response');
    } else {
      res.end();
    }
  }
}

// --- API endpoints ---
app.post('/api/generate', async (req, res) => {
  if (!genAI) {
    return res.status(500).json({ error: 'Google AI SDK not initialized. Check server logs for details.' });
  }
  // ...resto de tu endpoint...
});
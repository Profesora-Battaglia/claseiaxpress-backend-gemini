require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

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
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContentStream(prompt);
    streamToResponse(result.stream, res);
  } catch (error) {
    console.error('Error in /api/generate:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

app.post('/api/chat', async (req, res) => {
  if (!genAI) {
    return res.status(500).json({ error: 'Google AI SDK not initialized. Check server logs for details.' });
  }
  const { history, message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const chat = model.startChat({ history: history || [] });
    const result = await chat.sendMessageStream(message);
    streamToResponse(result.stream, res);
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// --- Root endpoint ---
app.get('/', (req, res) => {
  if (!genAI) {
    res.status(500).send('Backend is running, but Google AI SDK failed to initialize. Check server logs.');
  } else {
    res.send('Backend Gemini is running and AI is initialized!');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

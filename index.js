require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Helper function for streaming responses ---
async function streamToResponse(iterableStream, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');
  try {
    for await (const chunk of iterableStream) {
      // Check if chunk and chunk.text are valid before calling text()
      if (chunk && typeof chunk.text === 'function') {
        res.write(chunk.text());
      }
    }
    res.end();
  } catch (error) {
    console.error('Error streaming response:', error);
    // Ensure response is ended properly on error
    if (!res.headersSent) {
      res.status(500).send('Error streaming response');
    } else {
      res.end();
    }
  }
}

// --- /api/generate endpoint ---
app.post('/api/generate', async (req, res) => {
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

// --- /api/chat endpoint ---
app.post('/api/chat', async (req, res) => {
  const { history, message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const chat = model.startChat({
      history: history || [],
    });
    const result = await chat.sendMessageStream(message);
    streamToResponse(result.stream, res);
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// --- Root endpoint ---
app.get('/', (req, res) => {
  res.send('Backend Gemini is running!');
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

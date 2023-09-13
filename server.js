const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const queryPineconeAndGPT = require('./queryLogic');

const app = express();
const PORT = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON requests
app.use(bodyParser.json());



// Endpoint for querying
app.post('/ask', async (req, res) => {
  const question = req.body.question;
  try {
    const answer = await queryPineconeAndGPT(question);
    res.json({ answer: answer });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to get an answer.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

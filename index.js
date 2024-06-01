const express = require('express');
const getTrendingTopics = require('./twitter.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/trends', async (req, res) => {
  try {
    await getTrendingTopics();
    res.json({ message: 'Success' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trends', error: error.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const express = require('express');
const getTrendingTopics = require('./twitter.js');
const Trend = require('./db.js');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(cors());

app.get('/scrap-trends', async (req, res) => {
  try {
     // Clear the collection before adding new data
    await Trend.deleteMany({});
    await getTrendingTopics();
    res.json({ message: 'Success' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trends', error: error.toString() });
  }
});

app.get("/get-db-trends", async (req, res) => {
  try {
    const trends = await Trend.find();
    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trends", error: error.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

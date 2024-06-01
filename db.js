const mongoose = require("mongoose");
const { Schema } = mongoose;
require("dotenv").config();

mongoose.connect(process.env.mongodb_uri);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const TrendSchema = new Schema({
  id: { type: String, unique: true },
  trends: { type: [String], required: true },
  dateTime: { type: Date },
  ip: { type: String },
});

const Trend = mongoose.model("Trend", TrendSchema);

module.exports = Trend;

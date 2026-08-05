require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cron = require('node-cron');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const contestRoutes = require("./routes/contestRoutes");
const fetchSolutions = require("./utils/youtubeScraper");
const fetchContests = require("./utils/fetchContests");
const connectDB = require("./config/db");

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Function to fetch contests and store them in the database
const fetchAndStoreContests = async () => {
  try {
    console.log("🔄 Auto-fetching contests...");
    const Contest = require("./models/Contest");
    const contests = await fetchContests();
    for (let contest of contests) {
      await Contest.findOneAndUpdate(
        { title: contest.title, platform: contest.platform },
        { $set: contest },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Successfully stored ${contests.length} contests in database`);
  } catch (error) {
    console.error("❌ Error auto-fetching contests:", error.message);
  }
};

// Cron jobs setup
const setupCronJobs = () => {
  console.log('📅 Setting up daily cron job to run at 10 PM');

  cron.schedule('0 22 * * *', () => {
    console.log("⏰ Running scheduled 10 PM data fetch via cron");
    fetchAndStoreContests();
    fetchSolutions();
  });

  cron.schedule('0 */6 * * *', () => {
    console.log("🔄 Running 6-hourly data refresh via cron");
    fetchAndStoreContests();
  });

  cron.schedule('*/14 * * * *', async () => {
    try {
      const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
      console.log(`🔔 Pinging health endpoint: ${serverUrl}/api/health`);
      await axios.get(`${serverUrl}/api/health`);
    } catch (error) {
      console.error('❌ Failed to ping health endpoint:', error.message);
    }
  });
};

const initialDataFetch = async () => {
  try {
    const Contest = require("./models/Contest");
    const count = await Contest.countDocuments();

    if (count === 0) {
      console.log("🆕 No contests in database, fetching initial data...");
      await fetchAndStoreContests();
      await fetchSolutions();
    } else {
      console.log(`📊 Database already contains ${count} contests`);
    }
  } catch (error) {
    console.error("❌ Error checking database:", error.message);
  }
};

// Health Check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() });
});

// Contest Routes
app.use("/api/contests", contestRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({ status: "ok", message: "🏆 Contest Tracker API Server is running!", health: "/api/health", contests: "/api/contests" });
});

// SPA Fallback
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ status: "ok", message: "🏆 Contest Tracker API Server is running!", health: "/api/health", contests: "/api/contests" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  setupCronJobs();
  initialDataFetch();
});

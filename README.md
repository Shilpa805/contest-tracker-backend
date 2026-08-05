# ⚡ Contest Tracker Backend API

[![Backend API](https://img.shields.io/badge/Backend_API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://contest-tracker-app-backend.onrender.com/api/health)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

Dedicated Node.js & Express API backend for the **Coding Contest Tracker** application. Aggregates competitive coding contests from **LeetCode**, **Codeforces**, and **CodeChef**, stores them in MongoDB Atlas, and scrapes YouTube video solution links via automated cron schedules.

---

## 📡 API Endpoints

### 1. Health Check
- `GET /api/health`
- **Response**: `{ status: "ok", message: "Server is running", timestamp: "..." }`

### 2. Contests Retrieval
- `GET /api/contests`
- **Query Parameters**:
  - `platform` (optional): `LeetCode` | `Codeforces` | `CodeChef`
  - `past` (optional): `true` | `false`
- **Response**: Array of Contest objects sorted by `start_time`.

### 3. Today's Contests
- `GET /api/contests/today`
- **Response**: Contests starting within current calendar date.

### 4. Submit Solution Link
- `POST /api/contests/solution/:id`
- **Body**: `{ "solution_link": "https://www.youtube.com/watch?v=..." }`

---

## 🛠️ Tech Stack & Dependencies

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: MongoDB Atlas (via Mongoose)
- **HTTP Client**: Axios
- **Cron Scheduler**: node-cron
- **YouTube API**: googleapis v3

---

## ⚙️ Environment Variables

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.pxq164c.mongodb.net/contest-tracker?retryWrites=true&w=majority
YOUTUBE_API_KEY=your_youtube_data_api_v3_key
SERVER_URL=https://contest-tracker-app-backend.onrender.com
```

---

## 👩‍💻 Author

**Shilpa Kumari**
- 📌 **GitHub**: [@Shilpa805](https://github.com/Shilpa805)

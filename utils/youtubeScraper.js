const { google } = require("googleapis");
const Contest = require("../models/Contest");
require("dotenv").config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const PLAYLISTS = {
  LeetCode: "PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr",
  Codeforces: "PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB",
  CodeChef: "PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr",
};

const fetchNewVideos = async (playlistId) => {
  if (!YOUTUBE_API_KEY) {
    console.log("⚠️ YOUTUBE_API_KEY is not configured");
    return [];
  }

  try {
    const youtube = google.youtube({ version: "v3", auth: YOUTUBE_API_KEY });
    const response = await youtube.playlistItems.list({
      part: "snippet",
      playlistId,
      maxResults: 100,
    });

    return (response.data.items || []).map((video) => ({
      title: video.snippet.title.toLowerCase(),
      link: `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`,
      publishedAt: new Date(video.snippet.publishedAt).getTime(),
    }));
  } catch (error) {
    console.error(`❌ Error fetching videos from playlist ${playlistId}:`, error.message);
    return [];
  }
};

const cleanTitle = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const findMatchingVideo = (videos, contestTitle, platform) => {
  const cleanedContestTitle = cleanTitle(contestTitle);
  const sortedVideos = [...videos].sort((a, b) => b.publishedAt - a.publishedAt);
  
  if (platform === "LeetCode") {
    const contestMatch = cleanedContestTitle.match(/\b(weekly|biweekly)\s+contest\s+(\d+)\b/i);
    if (!contestMatch) return null;
    
    const contestType = contestMatch[1].toLowerCase();
    const contestNumber = contestMatch[2];
    
    for (const video of sortedVideos) {
      const cleanedVideoTitle = cleanTitle(video.title);
      const videoMatch = cleanedVideoTitle.match(
        new RegExp(`\\b(${contestType})\\s+contest\\s+(${contestNumber})\\b`, 'i')
      );
      if (videoMatch) return video;
    }
  } else if (platform === "Codeforces") {
    const contestMatch = cleanedContestTitle.match(/\bcodeforces\s+(?:round|educational)\s+(\d+)(?:\s*(?:div\.?\s*(\d+)|rated|unrated))?\b/i);
    if (!contestMatch) return null;
    
    const roundNumber = contestMatch[1];
    const division = contestMatch[2] || "";
    const isEducational = cleanedContestTitle.includes("educational");
    
    for (const video of sortedVideos) {
      const cleanedVideoTitle = cleanTitle(video.title);
      const videoIsEducational = cleanedVideoTitle.includes("educational");
      if (isEducational !== videoIsEducational) continue;
      
      const videoMatch = cleanedVideoTitle.match(/\bcodeforces\s+(?:round|educational)\s+(\d+)(?:\s*(?:div\.?\s*(\d+)|rated|unrated))?\b/i);
      if (videoMatch && videoMatch[1] === roundNumber) {
        if (!division || !videoMatch[2] || videoMatch[2] === division) {
          return video;
        }
      }
    }
  } else if (platform === "CodeChef") {
    const contestMatch = cleanedContestTitle.match(/\b(starters|cookoff|lunchtime|long challenge)\s+(\d+)\b/i);
    if (!contestMatch) return null;
    
    const contestType = contestMatch[1].toLowerCase();
    const contestNumber = contestMatch[2];
    
    for (const video of sortedVideos) {
      const cleanedVideoTitle = cleanTitle(video.title);
      const videoMatch = cleanedVideoTitle.match(
        new RegExp(`\\b${contestType}\\s+${contestNumber}\\b`, 'i')
      );
      if (videoMatch) return video;
    }
  }
  return null;
};

const checkForNewSolutions = async () => {
  if (!YOUTUBE_API_KEY) return;
  console.log("🔍 Checking for new YouTube solutions...");

  const now = new Date();
  try {
    await Contest.updateMany(
      { start_time: { $lt: now }, past: { $ne: true } }, 
      { $set: { past: true } }
    );
  } catch (err) {
    console.error("❌ Error updating contests to past status:", err);
  }

  const pastContestsWithoutSolutions = await Contest.find({ 
    past: true,
    $or: [
      { solution_link: { $exists: false } },
      { solution_link: null },
      { solution_link: "" }
    ]
  });

  if (pastContestsWithoutSolutions.length === 0) return;

  pastContestsWithoutSolutions.sort((a, b) => b.start_time - a.start_time);
  
  for (const contest of pastContestsWithoutSolutions) {
    const playlistId = PLAYLISTS[contest.platform];
    if (!playlistId) continue;

    const videos = await fetchNewVideos(playlistId);
    if (videos.length === 0) continue;

    const bestMatch = findMatchingVideo(videos, contest.title, contest.platform);
    if (bestMatch) {
      await Contest.findByIdAndUpdate(contest._id, { solution_link: bestMatch.link });
    }
  }
};

module.exports = checkForNewSolutions;

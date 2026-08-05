const axios = require("axios");

const fetchCodeforcesContests = async () => {
    try {
        console.log("🔍 Fetching Codeforces contests...");

        const url = "https://codeforces.com/api/contest.list";
        const response = await axios.get(url, { timeout: 10000 });

        if (!response.data || !response.data.result) {
            return [];
        }

        const upcoming = response.data.result
            .filter(contest => contest.phase === "BEFORE")
            .map(contest => ({
                title: contest.name,
                platform: "Codeforces",
                start_time: new Date(contest.startTimeSeconds * 1000),
                duration: contest.durationSeconds / 60, // Convert seconds to minutes
                url: `https://codeforces.com/contest/${contest.id}`,
                past: false,
            }));

        const past = response.data.result
            .filter(contest => contest.phase === "FINISHED")
            .slice(0, 20)
            .map(contest => ({
                title: contest.name,
                platform: "Codeforces",
                start_time: new Date(contest.startTimeSeconds * 1000),
                duration: contest.durationSeconds / 60,
                url: `https://codeforces.com/contest/${contest.id}`,
                past: true,
            }));

        return [...upcoming, ...past];
    } catch (error) {
        console.error("❌ Error fetching Codeforces contests:", error.message);
        return [];
    }
};

module.exports = fetchCodeforcesContests;

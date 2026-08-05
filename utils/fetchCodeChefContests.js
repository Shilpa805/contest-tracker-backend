const axios = require("axios");

const fetchCodeChefContests = async () => {
    try {
        console.log("🔍 Fetching CodeChef contests...");

        const url = "https://www.codechef.com/api/list/contests/all";
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            },
            timeout: 10000
        });

        if (!response.data) return [];

        const upcoming = (response.data.future_contests || []).map(contest => ({
            title: contest.contest_name,
            platform: "CodeChef",
            start_time: new Date(contest.contest_start_date_iso || contest.contest_start_date),
            duration: contest.contest_duration ? contest.contest_duration / 60 : 120, // Convert to minutes
            url: `https://www.codechef.com/${contest.contest_code}`,
            past: false,
        }));

        const past = (response.data.past_contests || [])
            .slice(0, 20)
            .map(contest => ({
                title: contest.contest_name,
                platform: "CodeChef",
                start_time: new Date(contest.contest_start_date_iso || contest.contest_start_date),
                duration: contest.contest_duration ? contest.contest_duration / 60 : 120,
                url: `https://www.codechef.com/${contest.contest_code}`,
                past: true,
            }));

        return [...upcoming, ...past];
    } catch (error) {
        console.error("❌ Error fetching CodeChef contests:", error.message);
        return [];
    }
};

module.exports = fetchCodeChefContests;

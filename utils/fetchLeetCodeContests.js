const axios = require("axios");

const fetchLeetCodeContests = async () => {
    try {
        console.log("🔍 Fetching LeetCode contests via GraphQL...");

        const graphqlQuery = {
            query: `
                query getContestList {
                    allContests {
                        title
                        startTime
                        duration
                        titleSlug
                    }
                }
            `
        };

        const response = await axios.post("https://leetcode.com/graphql", graphqlQuery, {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            },
            timeout: 10000
        });

        const allContests = response.data?.data?.allContests || [];
        const now = Date.now();

        const contests = allContests.map(contest => ({
            title: contest.title,
            platform: "LeetCode",
            start_time: new Date(contest.startTime * 1000),
            duration: contest.duration / 60, // Convert seconds to minutes
            url: `https://leetcode.com/contest/${contest.titleSlug}`,
            past: contest.startTime * 1000 < now
        }));

        const pastContests = contests
            .filter(contest => contest.past)
            .sort((a, b) => b.start_time - a.start_time)
            .slice(0, 20);

        const upcomingContests = contests.filter(contest => !contest.past);

        return [...upcomingContests, ...pastContests];
    } catch (error) {
        console.error("❌ Error fetching LeetCode contests:", error.message);
        return [];
    }
};

module.exports = fetchLeetCodeContests;

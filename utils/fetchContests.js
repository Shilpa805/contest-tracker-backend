const fetchLeetCodeContests = require("./fetchLeetCodeContests");
const fetchCodeforcesContests = require("./fetchCodeforcesContests");
const fetchCodeChefContests = require("./fetchCodeChefContests");

const fetchContests = async () => {
    try {
        console.log("🔄 Fetching all contests...");

        const leetCodeContests = await fetchLeetCodeContests();
        const codeforcesContests = await fetchCodeforcesContests();
        const codeChefContests = await fetchCodeChefContests();

        const allContests = [...leetCodeContests, ...codeforcesContests, ...codeChefContests];

        console.log(`✅ Fetched ${allContests.length} contests`);
        return allContests;
    } catch (error) {
        console.error("❌ Error fetching contests:", error.message);
        return [];
    }
};

module.exports = fetchContests;

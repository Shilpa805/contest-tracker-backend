const mongoose = require("mongoose");

const connectDB = async (retries = 10) => {
    while (retries > 0) {
        try {
            if (!process.env.MONGO_URI) {
                console.error("❌ MONGO_URI environment variable is missing!");
                return;
            }
            const conn = await mongoose.connect(process.env.MONGO_URI);
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
            return;
        } catch (error) {
            console.error(`❌ MongoDB Connection Error: ${error.message}`);
            retries -= 1;
            if (retries > 0) {
                console.log(`🔄 Retrying MongoDB connection in 5 seconds... (${retries} attempts remaining)`);
                await new Promise(res => setTimeout(res, 5000));
            } else {
                console.error("⚠️ Max retries reached for MongoDB connection.");
            }
        }
    }
};

module.exports = connectDB;

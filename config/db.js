const mongoose = require("mongoose");

const DEFAULT_MONGO_URI = "mongodb+srv://socialinkUser:Shilpa%404ever@cluster0.pxq164c.mongodb.net/contest-tracker?retryWrites=true&w=majority";

const connectDB = async (retries = 10) => {
    const mongoUri = process.env.MONGO_URI || DEFAULT_MONGO_URI;
    while (retries > 0) {
        try {
            const conn = await mongoose.connect(mongoUri);
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

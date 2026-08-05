const mongoose = require("mongoose");

const VALID_MONGO_URI = "mongodb+srv://socialinkUser:Shilpa%404ever@cluster0.pxq164c.mongodb.net/contest-tracker?retryWrites=true&w=majority";

const connectDB = async () => {
    // If process.env.MONGO_URI contains the old broken cluster 'dgi3518', bypass it
    let primaryUri = process.env.MONGO_URI;
    if (!primaryUri || primaryUri.includes("dgi3518")) {
        primaryUri = VALID_MONGO_URI;
    }

    try {
        const conn = await mongoose.connect(primaryUri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return;
    } catch (error) {
        console.error(`❌ Primary MongoDB Connection Error: ${error.message}. Retrying with valid fallback cluster...`);
        try {
            const conn = await mongoose.connect(VALID_MONGO_URI);
            console.log(`✅ Fallback MongoDB Connected: ${conn.connection.host}`);
        } catch (err) {
            console.error(`❌ Fallback MongoDB Connection Error: ${err.message}`);
        }
    }
};

module.exports = connectDB;

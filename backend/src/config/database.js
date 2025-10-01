const mongoose = require("mongoose");

const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(
        process.env.MONGODB_URI || "mongodb://localhost:27017/coding-platform",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
          heartbeatFrequencyMS: 30000,
        }
      );
      console.log("✅ MongoDB connected successfully");

      // Add connection event listeners
      mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
      });

      mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected. Attempting to reconnect...");
      });

      mongoose.connection.on("reconnected", () => {
        console.log("MongoDB reconnected");
      });

      return;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error("All connection attempts failed");
        process.exit(1);
      }
    }
  }
};

const connectDB = async () => {
  await connectWithRetry();
};

module.exports = connectDB;

const mongoose = require("mongoose");
const ensureMongoDb = require("../scripts/ensure-mongodb");

/**
 * Connect to MongoDB using the connection string from the environment.
 * Automatically starts the local portable mongod when MONGO_URI points
 * at 127.0.0.1:27017 and nothing is listening there. Exits the process
 * on a fatal connection error so the problem is obvious.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/placement_prep_portal";

  // Auto-start local MongoDB only for the default local connection.
  if (uri.includes("127.0.0.1:27017") || uri.includes("localhost:27017")) {
    await ensureMongoDb();
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[db] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
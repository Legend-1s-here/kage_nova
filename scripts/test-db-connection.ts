import fs from "fs";
import path from "path";
import dns from "dns";
import mongoose from "mongoose";

// Set reliable public DNS for SRV record resolution
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.warn("Could not set custom DNS servers", e);
}

// Load .env.local manually
try {
  const envPath = path.resolve(".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...vals] = trimmed.split("=");
        process.env[key.trim()] = vals.join("=").trim();
      }
    }
  }
} catch (e) {
  console.warn("Could not read .env.local", e);
}

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not found in .env.local");
    process.exit(1);
  }

  console.log("Connecting to MongoDB Atlas at:", uri.replace(/:[^:]*@/, ":****@"));
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log("✅ Successfully connected to MongoDB Atlas!");
    console.log("   Database:", mongoose.connection.name);
    console.log("   Host:", mongoose.connection.host);
    await mongoose.disconnect();
    console.log("✅ Connection verified and closed cleanly.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB Atlas:", error);
    process.exit(1);
  }
}

testConnection();

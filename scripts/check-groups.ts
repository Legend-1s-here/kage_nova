import fs from "fs";
import path from "path";
import dns from "dns";
import mongoose from "mongoose";
import Group from "../models/Group";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Load .env.local
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

async function check() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No URI");
    process.exit(1);
  }
  await mongoose.connect(uri);
  const allGroups = await Group.find({}).lean();
  console.log(`Total groups in database: ${allGroups.length}`);
  allGroups.forEach((g) => {
    console.log({
      id: g._id,
      name: g.name,
      slug: g.slug,
      isPublic: g.isPublic,
      typeOfIsPublic: typeof g.isPublic,
      createdAt: g.createdAt,
    });
  });
  await mongoose.disconnect();
}

check();

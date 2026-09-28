import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/db";
import Group from "@/models/Group";
import LabCode from "@/models/LabCode";
import User from "@/models/User";
import { hashKey, isModerator } from "@/lib/auth";
import { getCreatorSession } from "@/lib/creator-auth";
import { checkInappropriateContent } from "@/lib/content-filter";
import { slugify, validateGroupCreation } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/groups - List all public groups with snippet counts
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    const filter: Record<string, unknown> = { isPublic: true };
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { slug: { $regex: query, $options: "i" } },
      ];
    }

    const groups = await Group.find(filter)
      .select("name slug isPublic createdAt creatorName")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Fetch snippet counts for these groups
    const groupIds = groups.map((g) => g._id);
    const counts = await LabCode.aggregate([
      { $match: { groupId: { $in: groupIds } } },
      { $group: { _id: "$groupId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

    const responseData = groups.map((g) => ({
      name: g.name,
      slug: g.slug,
      isPublic: g.isPublic,
      creatorName: g.creatorName || "",
      createdAt: g.createdAt,
      codeCount: countMap.get(g._id.toString()) || 0,
    }));

    return NextResponse.json({ success: true, groups: responseData });
  } catch (error) {
    console.error("Error fetching public groups:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create a new group (Requires Creator Authentication & Content Safety)
export async function POST(req: NextRequest) {
  try {
    // 1. Check Creator Authentication (Google Session or Master Moderator)
    const creator = getCreatorSession(req);
    const isMod = isModerator(req);

    if (!creator && !isMod) {
      return NextResponse.json(
        {
          success: false,
          error: "Please sign in with Google before creating a group.",
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Check if creator account is banned
    if (creator) {
      const dbUser = await User.findById(creator.userId);
      if (dbUser && dbUser.isBanned) {
        return NextResponse.json(
          {
            success: false,
            error: "Your account has been suspended from creating groups due to community guideline violations.",
          },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { valid, error, cleanName, cleanKey, isPublicBool } = validateGroupCreation(
      body.name,
      body.key,
      body.isPublic
    );

    if (!valid) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    // 2. Automated Content Moderation / Profanity Check
    const moderation = checkInappropriateContent(cleanName);
    if (!moderation.isClean) {
      return NextResponse.json(
        { success: false, error: moderation.reason },
        { status: 400 }
      );
    }

    // Generate base slug
    let baseSlug = slugify(cleanName);
    if (!baseSlug) {
      baseSlug = "group";
    }

    // Check slug collision, append random digits if slug already exists
    let finalSlug = baseSlug;
    let counter = 1;
    while (await Group.exists({ slug: finalSlug })) {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      finalSlug = `${baseSlug}-${randomSuffix}`;
      counter++;
      if (counter > 10) {
        finalSlug = `${baseSlug}-${Date.now().toString(36)}`;
        break;
      }
    }

    // Hash group access key with bcrypt
    const keyHash = await hashKey(cleanKey);

    const newGroup = await Group.create({
      name: cleanName,
      slug: finalSlug,
      keyHash,
      isPublic: isPublicBool,
      creatorEmail: creator ? creator.email : "moderator@kagenova.local",
      creatorName: creator ? creator.name : "Platform Moderator",
      creatorId: creator ? new mongoose.Types.ObjectId(creator.userId) : null,
    });

    return NextResponse.json(
      {
        success: true,
        group: {
          name: newGroup.name,
          slug: newGroup.slug,
          isPublic: newGroup.isPublic,
          createdAt: newGroup.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating group:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create group";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

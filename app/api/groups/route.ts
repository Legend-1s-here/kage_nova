import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Group from "@/models/Group";
import LabCode from "@/models/LabCode";
import { hashKey } from "@/lib/auth";
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
      .select("name slug isPublic createdAt")
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

// POST /api/groups - Create a new group
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { valid, error, cleanName, cleanKey, isPublicBool } = validateGroupCreation(
      body.name,
      body.key,
      body.isPublic
    );

    if (!valid) {
      return NextResponse.json({ success: false, error }, { status: 400 });
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

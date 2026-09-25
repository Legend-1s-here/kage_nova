import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Group from "@/models/Group";
import LabCode from "@/models/LabCode";
import { isModerator } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/mod/groups - List all groups (public & private) for authenticated moderators
export async function GET(req: NextRequest) {
  try {
    if (!isModerator(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Moderator access required" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const groups = await Group.find({})
      .select("name slug isPublic createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Get snippet count per group
    const groupIds = groups.map((g) => g._id);
    const counts = await LabCode.aggregate([
      { $match: { groupId: { $in: groupIds } } },
      { $group: { _id: "$groupId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

    const totalCodes = await LabCode.countDocuments({});

    const formattedGroups = groups.map((g) => ({
      id: g._id.toString(),
      name: g.name,
      slug: g.slug,
      isPublic: g.isPublic,
      createdAt: g.createdAt,
      codeCount: countMap.get(g._id.toString()) || 0,
    }));

    const stats = {
      totalGroups: groups.length,
      publicGroups: groups.filter((g) => g.isPublic).length,
      privateGroups: groups.filter((g) => !g.isPublic).length,
      totalCodes,
    };

    return NextResponse.json({
      success: true,
      stats,
      groups: formattedGroups,
    });
  } catch (error) {
    console.error("Error fetching mod groups:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch groups";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

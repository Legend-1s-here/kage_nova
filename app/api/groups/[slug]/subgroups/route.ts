import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Group from "@/models/Group";
import LabCode from "@/models/LabCode";
import { hasValidGroupSession, isModerator } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/groups/[slug]/subgroups - List all subgroups of a parent group
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();

    const slug = params.slug.toLowerCase().trim();
    const parent = await Group.findOne({ slug }).lean();

    if (!parent) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    const isUnlocked = hasValidGroupSession(req, slug) || isModerator(req);

    // Fetch all subgroups
    const subgroups = await Group.find({ parentId: parent._id })
      .select("name slug isPublic createdAt")
      .sort({ createdAt: 1 })
      .lean();

    // Attach snippet counts
    const subgroupIds = subgroups.map((sg) => sg._id);
    const counts = await LabCode.aggregate([
      { $match: { groupId: { $in: subgroupIds } } },
      { $group: { _id: "$groupId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

    const data = subgroups.map((sg) => ({
      name: sg.name,
      slug: sg.slug,
      isPublic: sg.isPublic,
      createdAt: sg.createdAt,
      codeCount: countMap.get(sg._id.toString()) || 0,
    }));

    return NextResponse.json({ success: true, subgroups: data, parentUnlocked: isUnlocked });
  } catch (error) {
    console.error("Error fetching subgroups:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subgroups" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { hasValidGroupSession, getGroupCookieName } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Group from "@/models/Group";

interface RouteParams {
  params: {
    slug: string;
  };
}

// GET /api/groups/[slug]/session - Check if user has active unlocked editing session
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const slug = params.slug?.toLowerCase().trim();
    if (!slug) {
      return NextResponse.json({ success: false, unlocked: false }, { status: 400 });
    }

    await connectToDatabase();
    const group = await Group.findOne({ slug }).select("name slug isPublic").lean();
    if (!group) {
      return NextResponse.json(
        { success: false, unlocked: false, error: "Group not found" },
        { status: 404 }
      );
    }

    const isUnlocked = hasValidGroupSession(req, slug);

    return NextResponse.json({
      success: true,
      unlocked: isUnlocked,
      group: {
        name: group.name,
        slug: group.slug,
        isPublic: group.isPublic,
      },
    });
  } catch (error) {
    console.error("Error checking session:", error);
    return NextResponse.json(
      { success: false, unlocked: false, error: "Failed to check session" },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[slug]/session - Lock editing session (clears cookie)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const slug = params.slug?.toLowerCase().trim();
  const cookieName = getGroupCookieName(slug);

  const response = NextResponse.json({
    success: true,
    message: "Editing locked successfully",
  });

  response.cookies.delete(cookieName);
  return response;
}

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Group from "@/models/Group";
import LabCode from "@/models/LabCode";
import {
  hasValidGroupSession,
  verifyKey,
  getGroupCookieName,
  isModerator,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

// DELETE /api/groups/[slug] - Delete a group and all its lab codes
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();

    const slug = params.slug.toLowerCase().trim();
    const group = await Group.findOne({ slug });

    if (!group) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    // Check authorization: Moderator, active session cookie, or direct key in body
    let isAuthorized = hasValidGroupSession(req, slug) || isModerator(req);

    if (!isAuthorized) {
      try {
        const body = await req.json();
        if (body.key && (await verifyKey(body.key, group.keyHash))) {
          isAuthorized = true;
        }
      } catch {
        // Body might be empty
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Group access key or Moderator session required to delete this group.",
        },
        { status: 401 }
      );
    }

    // Cascading delete of all code snippets belonging to this group
    const deletedCodes = await LabCode.deleteMany({ groupId: group._id });

    // Delete the group itself
    await Group.deleteOne({ _id: group._id });

    const response = NextResponse.json({
      success: true,
      message: `Group "${group.name}" and ${deletedCodes.deletedCount} snippet(s) have been deleted.`,
    });

    // Clear session cookie for this group
    response.cookies.delete(getGroupCookieName(slug));

    return response;
  } catch (error) {
    console.error("Error deleting group:", error);
    const message = error instanceof Error ? error.message : "Failed to delete group";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

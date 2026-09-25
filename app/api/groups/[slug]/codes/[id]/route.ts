import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Group from "@/models/Group";
import LabCode from "@/models/LabCode";
import { hasValidGroupSession, verifyKey } from "@/lib/auth";
import { validateLabCodeUpload } from "@/lib/validation";

interface RouteParams {
  params: {
    slug: string;
    id: string;
  };
}

// PUT /api/groups/[slug]/codes/[id] - Update an existing snippet
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const slug = params.slug?.toLowerCase().trim();
    const id = params.id;

    if (!slug || !id) {
      return NextResponse.json(
        { success: false, error: "Slug and Code ID are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const group = await Group.findOne({ slug });
    if (!group) {
      return NextResponse.json({ success: false, error: "Group not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));

    // Verify editing permission
    let isAuthorized = hasValidGroupSession(req, slug);
    if (!isAuthorized && body.key && typeof body.key === "string") {
      isAuthorized = await verifyKey(body.key.trim(), group.keyHash);
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Group access key required to edit this snippet" },
        { status: 401 }
      );
    }

    const validation = validateLabCodeUpload(
      body.title,
      body.language,
      body.code,
      body.uploaderName,
      body.description
    );

    if (!validation.valid || !validation.data) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const updated = await LabCode.findOneAndUpdate(
      { _id: id, groupId: group._id },
      {
        title: validation.data.title,
        language: validation.data.language,
        code: validation.data.code,
        uploaderName: validation.data.uploaderName,
        description: validation.data.description,
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Snippet not found in this group" }, { status: 404 });
    }

    return NextResponse.json({ success: true, code: updated });
  } catch (error) {
    console.error("Error updating snippet:", error);
    return NextResponse.json({ success: false, error: "Failed to update snippet" }, { status: 500 });
  }
}

// DELETE /api/groups/[slug]/codes/[id] - Delete a snippet
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const slug = params.slug?.toLowerCase().trim();
    const id = params.id;

    if (!slug || !id) {
      return NextResponse.json(
        { success: false, error: "Slug and Code ID are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const group = await Group.findOne({ slug });
    if (!group) {
      return NextResponse.json({ success: false, error: "Group not found" }, { status: 404 });
    }

    const isAuthorized = hasValidGroupSession(req, slug);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Group access key required to delete snippets" },
        { status: 401 }
      );
    }

    const deleted = await LabCode.findOneAndDelete({ _id: id, groupId: group._id });
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Snippet not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Snippet deleted successfully" });
  } catch (error) {
    console.error("Error deleting snippet:", error);
    return NextResponse.json({ success: false, error: "Failed to delete snippet" }, { status: 500 });
  }
}

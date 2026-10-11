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
    const raw = params.slug || "";
    const slug = decodeURIComponent(raw).toLowerCase().trim();
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

    // Check if updating subCodes specifically
    if (Array.isArray(body.subCodes)) {
      const cleanSubCodes = body.subCodes
        .filter((sc: any) => sc && typeof sc.code === "string" && sc.code.trim().length > 0)
        .map((sc: any) => ({
          title: (sc.title || "").trim().slice(0, 100) || "Code Snippet",
          language: (sc.language || "").trim().toLowerCase().slice(0, 30),
          code: sc.code,
        }));

      const updated = await LabCode.findOneAndUpdate(
        { _id: id, groupId: group._id },
        { $set: { subCodes: cleanSubCodes } },
        { new: true }
      );

      if (!updated) {
        return NextResponse.json({ success: false, error: "Snippet not found in this group" }, { status: 404 });
      }

      return NextResponse.json({ success: true, code: updated });
    }

    // Check if appending a single subCode
    if (body.newSubCode && typeof body.newSubCode.code === "string" && body.newSubCode.code.trim()) {
      const subItem = {
        title: (body.newSubCode.title || "").trim().slice(0, 100) || "Code Snippet",
        language: (body.newSubCode.language || "").trim().toLowerCase().slice(0, 30),
        code: body.newSubCode.code,
      };

      const updated = await LabCode.findOneAndUpdate(
        { _id: id, groupId: group._id },
        { $push: { subCodes: subItem } },
        { new: true }
      );

      if (!updated) {
        return NextResponse.json({ success: false, error: "Snippet not found in this group" }, { status: 404 });
      }

      return NextResponse.json({ success: true, code: updated });
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

    const updateDoc: Record<string, any> = {
      title: validation.data.title,
      language: validation.data.language,
      code: validation.data.code,
      uploaderName: validation.data.uploaderName,
      description: validation.data.description,
    };

    const updated = await LabCode.findOneAndUpdate(
      { _id: id, groupId: group._id },
      updateDoc,
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
    const raw = params.slug || "";
    const slug = decodeURIComponent(raw).toLowerCase().trim();
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

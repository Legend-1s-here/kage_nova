import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Group from "@/models/Group";
import LabCode from "@/models/LabCode";
import { hasValidGroupSession, verifyKey } from "@/lib/auth";
import { validateLabCodeUpload } from "@/lib/validation";

interface RouteParams {
  params: {
    slug: string;
  };
}

// GET /api/groups/[slug]/codes - List snippets for a group
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const slug = params.slug?.toLowerCase().trim();
    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Group slug is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const group = await Group.findOne({ slug }).select("_id name slug isPublic createdAt");
    if (!group) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("q")?.trim() || "";
    const languageFilter = searchParams.get("lang")?.toLowerCase().trim() || "";

    const filter: Record<string, unknown> = { groupId: group._id };

    if (languageFilter && languageFilter !== "all") {
      filter.language = languageFilter;
    }

    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
        { uploaderName: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const codes = await LabCode.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Map _id to string for clean serialization
    const formattedCodes = codes.map((c) => ({
      _id: c._id.toString(),
      title: c.title,
      language: c.language,
      code: c.code,
      uploaderName: c.uploaderName || "Anonymous",
      description: c.description || "",
      createdAt: c.createdAt,
    }));

    return NextResponse.json({
      success: true,
      group: {
        id: group._id.toString(),
        name: group.name,
        slug: group.slug,
        isPublic: group.isPublic,
        createdAt: group.createdAt,
      },
      codes: formattedCodes,
      count: formattedCodes.length,
    });
  } catch (error) {
    console.error("Error fetching lab codes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lab codes" },
      { status: 500 }
    );
  }
}

// POST /api/groups/[slug]/codes - Upload a new lab code snippet (requires group key/session)
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const slug = params.slug?.toLowerCase().trim();
    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Group slug is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const group = await Group.findOne({ slug });
    if (!group) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // Authentication: Check session cookie OR direct key supplied in request
    let isAuthorized = hasValidGroupSession(req, slug);

    if (!isAuthorized && body.key && typeof body.key === "string") {
      isAuthorized = await verifyKey(body.key.trim(), group.keyHash);
    }

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: "Group access key required to upload or edit codes in this group",
          requiresUnlock: true,
        },
        { status: 401 }
      );
    }

    // Server-side validation (title, language, code, max 200KB payload limit)
    const validation = validateLabCodeUpload(
      body.title,
      body.language,
      body.code,
      body.uploaderName,
      body.description
    );

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const newLabCode = await LabCode.create({
      groupId: group._id,
      title: validation.data.title,
      language: validation.data.language,
      code: validation.data.code,
      uploaderName: validation.data.uploaderName,
      description: validation.data.description,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Code snippet uploaded successfully",
        code: {
          _id: newLabCode._id.toString(),
          title: newLabCode.title,
          language: newLabCode.language,
          code: newLabCode.code,
          uploaderName: newLabCode.uploaderName,
          description: newLabCode.description,
          createdAt: newLabCode.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating lab code:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload lab code" },
      { status: 500 }
    );
  }
}

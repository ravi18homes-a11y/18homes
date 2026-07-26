import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const existing = await Service.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Service not found." },
        { status: 404 }
      );
    }

    if (body.title !== undefined) existing.title = String(body.title).trim();
    if (body.description !== undefined) existing.description = String(body.description).trim();
    if (body.image !== undefined) existing.image = String(body.image).trim();
    if (body.link !== undefined) existing.link = String(body.link).trim();
    if (body.order !== undefined) existing.order = parseInt(body.order, 10) || 0;
    if (body.isActive !== undefined) existing.isActive = Boolean(body.isActive);

    await existing.save();

    return NextResponse.json({ success: true, service: existing });
  } catch (error) {
    console.error("PUT /api/services/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update service." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const deleted = await Service.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Service not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Service deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/services/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete service." },
      { status: 500 }
    );
  }
}

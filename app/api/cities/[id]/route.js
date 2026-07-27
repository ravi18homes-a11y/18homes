import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import City from "@/models/City";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const city = await City.findById(id).lean({ virtuals: true });
    if (!city) {
      return NextResponse.json(
        { success: false, error: "City not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, city });
  } catch (error) {
    console.error("GET /api/cities/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch city." },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const { title, description, image, link, order, isActive } = body;

    const existing = await City.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "City not found." },
        { status: 404 }
      );
    }

    if (title !== undefined) existing.title = title.trim();
    if (description !== undefined) existing.description = description.trim();
    if (image !== undefined) existing.image = image.trim();
    if (link !== undefined) existing.link = link.trim();
    if (order !== undefined) existing.order = Number(order);
    if (isActive !== undefined) existing.isActive = Boolean(isActive);

    const updatedCity = await existing.save();

    return NextResponse.json({ success: true, city: updatedCity });
  } catch (error) {
    console.error("PUT /api/cities/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update city." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const deleted = await City.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "City not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "City deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/cities/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete city." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get("all") === "true";

    const filter = fetchAll ? {} : { isActive: true };
    const services = await Service.find(filter).sort({ order: 1, createdAt: 1 }).lean({ virtuals: true });

    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error("GET /api/services error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch services." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const { title, description, image, link, order, isActive } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Service title is required." },
        { status: 400 }
      );
    }

    const cleanSlug = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const targetLink = (link || `/service/${cleanSlug}`).trim();

    const existingService = await Service.findOne({
      $or: [{ title: title.trim() }, { link: targetLink }],
    });
    if (existingService) {
      return NextResponse.json(
        { success: false, error: "A service card with this title or link already exists." },
        { status: 400 }
      );
    }

    // Auto calculate order if not provided
    let finalOrder = typeof order === "number" ? order : parseInt(order || "0", 10);
    if (isNaN(finalOrder) || finalOrder === 0) {
      const maxOrderDoc = await Service.findOne().sort({ order: -1 }).select({ order: 1 }).lean();
      finalOrder = (maxOrderDoc?.order || 0) + 1;
    }

    const newService = await Service.create({
      title: title.trim(),
      description: (description || "").trim(),
      image: (image || "").trim(),
      link: targetLink,
      order: finalOrder,
      isActive: isActive !== false,
    });

    return NextResponse.json({ success: true, service: newService }, { status: 201 });
  } catch (error) {
    console.error("POST /api/services error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create service." },
      { status: 500 }
    );
  }
}

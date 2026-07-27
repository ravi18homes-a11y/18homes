import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { items } = body; // Array of { id, order }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "Invalid items array." },
        { status: 400 }
      );
    }

    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: parseInt(item.order, 10) || 0 } },
      },
    }));

    if (bulkOps.length > 0) {
      await Service.bulkWrite(bulkOps);
    }

    const updatedServices = await Service.find({}).sort({ order: 1, createdAt: 1 }).lean({ virtuals: true });

    return NextResponse.json({ success: true, services: updatedServices });
  } catch (error) {
    console.error("PATCH /api/services/reorder error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reorder services." },
      { status: 500 }
    );
  }
}

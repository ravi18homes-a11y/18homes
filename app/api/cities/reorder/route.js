import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import City from "@/models/City";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "Items array is required." },
        { status: 400 }
      );
    }

    const bulkOps = items.map((item, index) => ({
      updateOne: {
        filter: { _id: item.id || item._id },
        update: { $set: { order: index + 1 } },
      },
    }));

    if (bulkOps.length > 0) {
      await City.bulkWrite(bulkOps);
    }

    return NextResponse.json({ success: true, message: "City order updated successfully." });
  } catch (error) {
    console.error("POST /api/cities/reorder error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reorder cities." },
      { status: 500 }
    );
  }
}

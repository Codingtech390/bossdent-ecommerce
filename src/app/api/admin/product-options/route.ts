import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Brand } from "@/models/Brand";
import { Category } from "@/models/Category";
import { extractSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = extractSessionFromRequest(req);

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const [brands, categories] = await Promise.all([
      Brand.find({}).select("_id name slug").sort({ name: 1 }).lean(),

      Category.find({}).select("_id name slug level parentId").sort({ name: 1 }).lean(),
    ]);

    return NextResponse.json({
      success: true,
      brands,
      categories,
    });
  } catch (error) {
    console.error("Product options GET error:", error);

    return NextResponse.json({ error: "Failed to load product options" }, { status: 500 });
  }
}

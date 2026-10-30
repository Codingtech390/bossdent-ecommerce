import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Brand } from "@/models/Brand";
import { Category } from "@/models/Category";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({
        products: [],
        brands: [],
        categories: [],
        popularQueries: ["Composite", "Airotor", "Endomotor", "3M ESPE", "Rotary Files"],
      });
    }

    await connectToDatabase();
    const regex = new RegExp(q, "i");

    const [products, brands, categories] = await Promise.all([
      Product.find({
        active: true,
        $or: [
          { title: regex },
          { defaultSku: regex },
          { shortDescription: regex },
        ],
      })
        .select("title slug basePrice baseComparePrice images defaultSku brand")
        .populate("brand", "name slug")
        .limit(6)
        .lean(),

      Brand.find({ name: regex }).select("name slug logo").limit(4).lean(),

      Category.find({ name: regex }).select("name slug level").limit(4).lean(),
    ]);

    return NextResponse.json({
      products,
      brands,
      categories,
    });
  } catch (err: unknown) {
    console.error("Search suggestion error:", err);
    return NextResponse.json({ products: [], brands: [], categories: [] });
  }
}

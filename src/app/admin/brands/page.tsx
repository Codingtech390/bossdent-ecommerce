import { connectToDatabase } from "@/lib/db";
import { Brand } from "@/models/Brand";
import { Product } from "@/models/Product";
import BrandsManager from "@/components/admin/BrandsManager";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  await connectToDatabase();

  const brands = await Brand.find({}).sort({ name: 1 }).lean();

  const productCounts = await Product.aggregate([
    {
      $match: {
        brand: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: "$brand",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const countMap = new Map<string, number>();

  productCounts.forEach((item) => {
    countMap.set(String(item._id), Number(item.count || 0));
  });

  const serializedBrands = brands.map((brand: any) => ({
    _id: String(brand._id),
    name: brand.name,
    slug: brand.slug,
    description: brand.description || "",
    logo: brand.logo || "",
    website: brand.website || "",
    isActive: Boolean(brand.isActive),
    productCount: countMap.get(String(brand._id)) || 0,
    createdAt: brand.createdAt ? new Date(brand.createdAt).toISOString() : "",
  }));

  return <BrandsManager initialBrands={serializedBrands} />;
}

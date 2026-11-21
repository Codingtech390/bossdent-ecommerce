import CategoriesManager from "@/components/admin/CategoriesManager";
import { connectToDatabase } from "@/lib/db";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await connectToDatabase();

  const categories = await Category.find({}).sort({ level: 1, order: 1, name: 1 }).lean();

  const productCounts = await Product.aggregate([
    {
      $match: { active: true },
    },
    {
      $group: {
        _id: {
          $ifNull: ["$subcategory", "$category"],
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map<string, number>();

  productCounts.forEach((item) => {
    if (item._id) {
      countMap.set(String(item._id), item.count);
    }
  });

  const serializedCategories = categories.map((category: any) => ({
    _id: String(category._id),
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    parentId: category.parentId ? String(category.parentId) : null,
    level: category.level || 0,
    order: category.order || 0,
    icon: category.icon || "",
    image: category.image || "",
    banner: category.banner || "",
    isFeatured: Boolean(category.isFeatured),
    productCount: countMap.get(String(category._id)) || 0,
    createdAt: category.createdAt ? new Date(category.createdAt).toISOString() : "",
  }));

  return <CategoriesManager initialCategories={serializedCategories} />;
}

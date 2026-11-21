import { connectToDatabase } from "@/lib/db";
import { Collection } from "@/models/Collection";
import CollectionsManager from "@/components/admin/CollectionsManager";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  await connectToDatabase();

  const collections = await Collection.find({}).sort({ sortOrder: 1, name: 1 }).lean();

  const serialized = collections.map((collection: any) => ({
    _id: String(collection._id),
    name: collection.name,
    slug: collection.slug,
    description: collection.description || "",
    image: collection.image || "",
    isActive: Boolean(collection.isActive),
    featured: Boolean(collection.featured),
    sortOrder: Number(collection.sortOrder || 0),
    createdAt: collection.createdAt ? new Date(collection.createdAt).toISOString() : "",
  }));

  return <CollectionsManager initialCollections={serialized} />;
}

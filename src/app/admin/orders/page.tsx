import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import OrdersManager from "@/components/admin/OrdersManager";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await connectToDatabase();

  const orders = await Order.find({})
    .populate("user", "name email phone")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const initialOrders = orders.map((order: any) => ({
    ...order,
    _id: String(order._id),
    user: order.user
      ? {
          _id: String(order.user._id),
          name: order.user.name || "",
          email: order.user.email || "",
          phone: order.user.phone || "",
        }
      : null,
    items: (order.items || []).map((item: any) => ({
      ...item,
      _id: item._id ? String(item._id) : undefined,
      product: item.product ? String(item.product) : "",
    })),
    createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : "",
    updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : "",
  }));

  return <OrdersManager initialOrders={initialOrders} />;
}

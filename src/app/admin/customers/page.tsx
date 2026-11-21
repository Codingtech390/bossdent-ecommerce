import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { Order } from "@/models/Order";
import CustomersManager from "@/components/admin/CustomersManager";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await connectToDatabase();

  const customers = await User.find({
    role: "customer",
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .select("-password -wishlist")
    .lean();

  const customerIds = customers.map((customer: any) => customer._id);

  const orderCounts = await Order.aggregate([
    {
      $match: {
        user: {
          $in: customerIds,
        },
      },
    },
    {
      $group: {
        _id: "$user",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const orderCountMap = new Map(orderCounts.map((item: any) => [String(item._id), item.count]));

  const initialCustomers = customers.map((customer: any) => ({
    _id: String(customer._id),

    name: customer.name || "",
    email: customer.email || "",
    phone: customer.phone || "",

    clinicName: customer.clinicName || "",
    gstNumber: customer.gstNumber || "",
    dciNumber: customer.dciNumber || "",

    dentacoins: Number(customer.dentacoins || 0),

    membershipTier: customer.membershipTier || "none",

    membershipExpiresAt: customer.membershipExpiresAt
      ? new Date(customer.membershipExpiresAt).toISOString()
      : null,

    addresses: (customer.addresses || []).map((address: any) => ({
      ...address,
      _id: address._id ? String(address._id) : undefined,
    })),

    orderCount: orderCountMap.get(String(customer._id)) || 0,

    createdAt: customer.createdAt ? new Date(customer.createdAt).toISOString() : "",

    updatedAt: customer.updatedAt ? new Date(customer.updatedAt).toISOString() : "",
  }));

  return <CustomersManager initialCustomers={initialCustomers} />;
}

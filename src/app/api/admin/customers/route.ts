import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { Order } from "@/models/Order";
import { extractSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

/* =========================================================
   AUTHORIZATION
========================================================= */

function isAdmin(req: NextRequest) {
  const session = extractSessionFromRequest(req);

  return Boolean(session && session.role === "admin");
}

/* =========================================================
   CUSTOMER SERIALIZER
========================================================= */

function serializeCustomer(customer: any) {
  return {
    _id: String(customer._id),

    name: customer.name || "",
    email: customer.email || "",
    phone: customer.phone || "",

    clinicName: customer.clinicName || "",
    gstNumber: customer.gstNumber || "",
    dciNumber: customer.dciNumber || "",

    dentacoins: Number(customer.dentacoins || 0),

    membershipTier:
      customer.membershipTier || "none",

    membershipExpiresAt:
      customer.membershipExpiresAt
        ? new Date(
            customer.membershipExpiresAt,
          ).toISOString()
        : null,

    addresses: (customer.addresses || []).map(
      (address: any) => ({
        _id: address._id
          ? String(address._id)
          : undefined,

        fullName: address.fullName || "",
        clinicName: address.clinicName || "",
        phone: address.phone || "",
        addressLine1: address.addressLine1 || "",
        addressLine2: address.addressLine2 || "",
        landmark: address.landmark || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
        isDefault: Boolean(address.isDefault),
      }),
    ),

    createdAt: customer.createdAt
      ? new Date(customer.createdAt).toISOString()
      : "",

    updatedAt: customer.updatedAt
      ? new Date(customer.updatedAt).toISOString()
      : "",
  };
}

/* =========================================================
   GET CUSTOMERS
========================================================= */

export async function GET(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") || 1));

    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));

    const search = searchParams.get("search")?.trim() || "";

    const membership = searchParams.get("membership") || "all";

    const filter: Record<string, any> = {
      role: "customer",
    };

    /* Membership filtering */

    if (membership !== "all") {
      filter.membershipTier = membership;
    }

    /* Search */

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
        {
          clinicName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          gstNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          dciNumber: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      User.find(filter)
        .select("-password -wishlist")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    /* Customer order counts */

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

    const serializedCustomers = customers.map((customer: any) => ({
      ...serializeCustomer(customer),

      orderCount: orderCountMap.get(String(customer._id)) || 0,
    }));

    const totalPages = Math.max(1, Math.ceil(total / limit));

    /* Statistics */

    const [totalCustomers, plusMembers, totalDentacoins] = await Promise.all([
      User.countDocuments({
        role: "customer",
      }),

      User.countDocuments({
        role: "customer",
        membershipTier: "plus",
      }),

      User.aggregate([
        {
          $match: {
            role: "customer",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$dentacoins",
            },
          },
        },
      ]),
    ]);

    return NextResponse.json({
      success: true,

      customers: serializedCustomers,

      stats: {
        totalCustomers,
        plusMembers,
        regularCustomers: totalCustomers - plusMembers,
        totalDentacoins: totalDentacoins[0]?.total || 0,
      },

      pagination: {
        page,
        limit,
        total,
        totalPages,
      },

      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Admin customers GET error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch customers.",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================================================
   UPDATE CUSTOMER
========================================================= */

export async function PATCH(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const body = await req.json();

    const {
      customerId,
      name,
      phone,
      clinicName,
      gstNumber,
      dciNumber,
      dentacoins,
      membershipTier,
      membershipExpiresAt,
    } = body;

    if (!customerId) {
      return NextResponse.json(
        {
          error: "Customer ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const customer = await User.findOne({
      _id: customerId,
      role: "customer",
    });

    if (!customer) {
      return NextResponse.json(
        {
          error: "Customer not found.",
        },
        {
          status: 404,
        },
      );
    }

    /* Profile fields */

    if (typeof name === "string") {
      customer.name = name.trim();
    }

    if (typeof phone === "string") {
      customer.phone = phone.trim();
    }

    if (typeof clinicName === "string") {
      customer.clinicName = clinicName.trim();
    }

    if (typeof gstNumber === "string") {
      customer.gstNumber = gstNumber.trim();
    }

    if (typeof dciNumber === "string") {
      customer.dciNumber = dciNumber.trim();
    }

    /* Dentacoins */

    if (
      typeof dentacoins === "number" &&
      Number.isFinite(dentacoins) &&
      dentacoins >= 0
    ) {
      customer.dentacoins = Math.floor(dentacoins);
    }

    /* Membership */

    if (
      membershipTier === "none" ||
      membershipTier === "plus"
    ) {
      customer.membershipTier = membershipTier;
    }

    if (
      membershipExpiresAt === null ||
      membershipExpiresAt === ""
    ) {
      customer.membershipExpiresAt = undefined;
    } else if (
      typeof membershipExpiresAt === "string"
    ) {
      const date = new Date(membershipExpiresAt);

      if (!Number.isNaN(date.getTime())) {
        customer.membershipExpiresAt = date;
      }
    }

    await customer.save();

    const updatedCustomer = await User.findById(
      customer._id,
    )
      .select("-password -wishlist")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Customer updated successfully.",
      customer: updatedCustomer
        ? serializeCustomer(updatedCustomer)
        : null,
    });
  } catch (error) {
    console.error("Admin customers PATCH error:", error);

    return NextResponse.json(
      {
        error: "Failed to update customer.",
      },
      {
        status: 500,
      },
    );
  }
}

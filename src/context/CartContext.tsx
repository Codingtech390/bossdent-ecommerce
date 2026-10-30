"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useAuth } from "./AuthContext";

export interface CartItem {
  product: {
    _id: string;
    title: string;
    slug: string;
    images: string[];
    basePrice: number;
    baseComparePrice?: number;
    rewardCoins?: number;
  };
  variant?: string;
  sku: string;
  title: string;
  variantTitle?: string;
  image: string;
  quantity: number;
  unitPrice: number;
  comparePrice?: number;
  isFreebie?: boolean;
}

export interface CartData {
  items: CartItem[];
  appliedCoupon?: {
    code: string;
    discountAmount: number;
    description: string;
  };
  rewardCoinsRedeemed: number;
}

interface CartContextType {
  cart: CartData;
  cartCount: number;
  subtotal: number;
  couponDiscount: number;
  coinsDiscount: number;
  shippingFee: number;
  total: number;
  earnedCoins: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (params: {
    productId: string;
    variantId?: string;
    quantity?: number;
    isFreebie?: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  updateQuantity: (sku: string, quantity: number) => Promise<void>;
  removeItem: (sku: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  removeCoupon: () => Promise<void>;
  applyCoins: (coins: number) => Promise<{ success: boolean; message?: string; error?: string }>;
  removeCoins: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cart: { items: [], rewardCoinsRedeemed: 0 },
  cartCount: 0,
  subtotal: 0,
  couponDiscount: 0,
  coinsDiscount: 0,
  shippingFee: 0,
  total: 0,
  earnedCoins: 0,
  isDrawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  addToCart: async () => ({ success: false }),
  updateQuantity: async () => {},
  removeItem: async () => {},
  applyCoupon: async () => ({ success: false }),
  removeCoupon: async () => {},
  applyCoins: async () => ({ success: false }),
  removeCoins: async () => {},
  refreshCart: async () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartData>({ items: [], rewardCoinsRedeemed: 0 });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const refreshCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        if (data.cart) {
          setCart(data.cart);
        }
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const cartCount = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart.items]);

  const subtotal = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [cart.items]);

  const couponDiscount = useMemo(() => {
    return cart.appliedCoupon?.discountAmount || 0;
  }, [cart.appliedCoupon]);

  const coinsDiscount = useMemo(() => {
    return cart.rewardCoinsRedeemed || 0;
  }, [cart.rewardCoinsRedeemed]);

  // Shipping fee: Free above ₹499 for Plus, Free above ₹999 for non-members, else ₹99
  const shippingFee = useMemo(() => {
    if (subtotal === 0) return 0;
    const threshold = user?.membershipTier === "plus" ? 499 : 999;
    return subtotal >= threshold ? 0 : 99;
  }, [subtotal, user?.membershipTier]);

  const total = useMemo(() => {
    const calculated = subtotal - couponDiscount - coinsDiscount + shippingFee;
    return Math.max(0, calculated);
  }, [subtotal, couponDiscount, coinsDiscount, shippingFee]);

  // Rewards: 1 coin per ₹50 spent (or 2x for Plus members)
  const earnedCoins = useMemo(() => {
    const baseCoins = Math.floor(subtotal / 50);
    return user?.membershipTier === "plus" ? baseCoins * 2 : baseCoins;
  }, [subtotal, user?.membershipTier]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const addToCart = async ({
    productId,
    variantId,
    quantity = 1,
    isFreebie = false,
  }: {
    productId: string;
    variantId?: string;
    quantity?: number;
    isFreebie?: boolean;
  }) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantId, quantity, isFreebie }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Could not add item to cart" };
      }
      setCart(data.cart);
      setIsDrawerOpen(true);
      return { success: true };
    } catch {
      return { success: false, error: "Network error adding item" };
    }
  };

  const updateQuantity = async (sku: string, quantity: number) => {
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku, quantity }),
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch (e) {
      console.error("Failed to update cart quantity", e);
    }
  };

  const removeItem = async (sku: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku, remove: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch (e) {
      console.error("Failed to remove item", e);
    }
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch("/api/cart/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error };
      }
      setCart(data.cart);
      return { success: true, message: data.message };
    } catch {
      return { success: false, error: "Network error applying coupon" };
    }
  };

  const removeCoupon = async () => {
    try {
      const res = await fetch("/api/cart/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remove: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch (e) {
      console.error("Failed to remove coupon", e);
    }
  };

  const applyCoins = async (coins: number) => {
    try {
      const res = await fetch("/api/cart/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coins }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error };
      }
      setCart(data.cart);
      return { success: true, message: data.message };
    } catch {
      return { success: false, error: "Network error redeeming Dentacoins" };
    }
  };

  const removeCoins = async () => {
    try {
      const res = await fetch("/api/cart/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remove: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch (e) {
      console.error("Failed to remove Dentacoins", e);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        couponDiscount,
        coinsDiscount,
        shippingFee,
        total,
        earnedCoins,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        addToCart,
        updateQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
        applyCoins,
        removeCoins,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

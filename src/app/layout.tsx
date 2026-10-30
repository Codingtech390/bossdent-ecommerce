import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { PincodeProvider } from "@/context/PincodeContext";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "DentalKart: India's Largest Online Dental Store | 20,000+ Products",
  description:
    "Buy genuine dental supplies, restorative composites, rotary files, airotors, autoclaves, and dental clinic packages online at DentalKart. Fast delivery across 19,000+ pincodes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
        <AuthProvider>
          <PincodeProvider>
            <CartProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
          </PincodeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

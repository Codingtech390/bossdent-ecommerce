import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { PincodeProvider } from "@/context/PincodeContext";
import { CartProvider } from "@/context/CartContext";

import ConditionalStorefrontShell from "@/components/layout/ConditionalStorefrontShell";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),

  title: {
    default: "Bossdent | Dental Supplies, Instruments & Technology",
    template: "%s | Bossdent",
  },

  description:
    "Explore thoughtfully selected dental materials, instruments, equipment and technology for dental professionals across India. Bossdent Global India Pvt Ltd.",

  applicationName: "Bossdent",

  openGraph: {
    type: "website",
    siteName: "Bossdent",
    title: "Bossdent | Dental Supplies, Instruments & Technology",
    description: "Professional dental products and solutions, thoughtfully brought together.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <PincodeProvider>
            <CartProvider>
              <ConditionalStorefrontShell>{children}</ConditionalStorefrontShell>
            </CartProvider>
          </PincodeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

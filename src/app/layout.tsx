import type { Metadata } from "next";
import "./globals.css";
import "../../public/fragranea.css";

export const metadata: Metadata = {
  title: "Luxe & Loom",
  description: "Luxury fragrance and fashion storefront.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

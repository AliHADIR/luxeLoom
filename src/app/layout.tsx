import type { Metadata } from "next";
import "./globals.css";
import "../../public/fragranea.css";
import "../../public/storefront.css";

export const metadata: Metadata = {
  title: "Luxe & Loom",
  description: "Discover fragrances by scent family, explore their notes and find your signature perfume at Luxe & Loom.",
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

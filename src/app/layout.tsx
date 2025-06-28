import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Smart Inventory Management System",
  description: "Advanced inventory management system for apparel industry with AI-powered demand forecasting and real-time analytics.",
  keywords: ["inventory", "management", "apparel", "fashion", "forecasting", "analytics"],
  authors: [{ name: "Smart Inventory Team" }],
  creator: "Smart Inventory Management System",
  publisher: "Smart Inventory Team",
  metadataBase: new URL('https://inventory.example.com'),
  openGraph: {
    title: "Smart Inventory Management System",
    description: "Advanced inventory management system for apparel industry",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Inventory Management System",
    description: "Advanced inventory management system for apparel industry",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-background-light text-secondary-900`}>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Management | Smart Inventory System',
  description: 'Manage your product catalog, variants, and details',
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
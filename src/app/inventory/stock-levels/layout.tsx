import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stock Levels | Smart Inventory System',
  description: 'Monitor and track inventory levels across all locations',
};

export default function StockLevelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
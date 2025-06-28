import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inventory Transactions | Smart Inventory System',
  description: 'Track all inventory movements and adjustments',
};

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
'use client';

import type { Metadata } from 'next';
import { usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Generate breadcrumbs based on current route
  const getBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 1) {
      // /inventory
      return [{ title: 'Inventory' }, { title: 'Management' }];
    }
    
    if (pathSegments[1] === 'products') {
      return [{ title: 'Inventory', href: '/inventory' }, { title: 'Products' }];
    }
    
    if (pathSegments[1] === 'stock-levels') {
      return [{ title: 'Inventory', href: '/inventory' }, { title: 'Stock Levels' }];
    }
    
    if (pathSegments[1] === 'transactions') {
      return [{ title: 'Inventory', href: '/inventory' }, { title: 'Transactions' }];
    }
    
    // Default fallback
    return [{ title: 'Inventory' }, { title: 'Management' }];
  };

  return (
    <DashboardLayout breadcrumbs={getBreadcrumbs()}>
      {children}
    </DashboardLayout>
  );
} 
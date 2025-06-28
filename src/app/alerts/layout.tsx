import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AlertsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout breadcrumbs={[{ title: 'Alerts' }, { title: 'Notifications' }]}>
      {children}
    </DashboardLayout>
  );
} 
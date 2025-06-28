import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout breadcrumbs={[{ title: 'Settings' }, { title: 'Configuration' }]}>
      {children}
    </DashboardLayout>
  );
} 